import scrapy
import json
import requests
from datetime import datetime
from urllib.parse import urlencode

class AirbnbSpider(scrapy.Spider):
    name = 'airbnb'
    allowed_domains = ['airbnb.com']
    
    def __init__(self, location='New York', checkin=None, checkout=None, guests=2, *args, **kwargs):
        super(AirbnbSpider, self).__init__(*args, **kwargs)
        self.location = location
        
        # Set default dates if not provided
        if not checkin:
            checkin_date = datetime.now()
            self.checkin = checkin_date.strftime('%Y-%m-%d')
        else:
            self.checkin = checkin
            
        if not checkout:
            checkout_date = datetime.now()
            checkout_date = checkout_date.replace(day=checkout_date.day + 5)
            self.checkout = checkout_date.strftime('%Y-%m-%d')
        else:
            self.checkout = checkout
            
        self.guests = guests
        
    def start_requests(self):
        # Build the URL with query parameters
        params = {
            'query': self.location,
            'checkin': self.checkin,
            'checkout': self.checkout,
            'adults': self.guests,
            'source': 'structured_search_input_header',
            'search_type': 'search_query'
        }
        
        url = f"https://www.airbnb.com/s/{self.location}/homes?{urlencode(params)}"
        yield scrapy.Request(url=url, callback=self.parse_search_results)
        
    def parse_search_results(self, response):
        # Extract the API data from the page
        # This is a simplified approach - in reality, you'd need to extract the JSON data
        # embedded in the page or intercept the API calls
        
        # Look for the script tag containing the listing data
        script_content = response.xpath('//script[contains(text(), "data-state")]/text()').get()
        if script_content:
            try:
                # Extract JSON data from the script
                json_data = json.loads(script_content)
                listings = self.extract_listings_from_json(json_data)
                
                for listing in listings:
                    listing_id = listing.get('id')
                    listing_url = f"https://www.airbnb.com/rooms/{listing_id}"
                    yield scrapy.Request(url=listing_url, callback=self.parse_listing_details, meta={'listing_data': listing})
                    
                # Handle pagination
                next_page = response.css('a[aria-label="Next"]::attr(href)').get()
                if next_page:
                    yield response.follow(next_page, callback=self.parse_search_results)
                    
            except json.JSONDecodeError:
                self.logger.error("Failed to parse JSON data from script")
        
    def extract_listings_from_json(self, json_data):
        # This is a placeholder - you'd need to adapt this to the actual structure
        # of Airbnb's JSON data
        listings = []
        
        # Example extraction logic (will need to be adapted)
        if 'data' in json_data and 'presentation' in json_data['data']:
            search_results = json_data['data']['presentation'].get('searchResults', {})
            listings_data = search_results.get('listings', [])
            
            for listing_data in listings_data:
                listing = {
                    'id': listing_data.get('id'),
                    'title': listing_data.get('title'),
                    'location': listing_data.get('location', {}).get('city'),
                    'price_per_night': listing_data.get('pricing', {}).get('rate', {}).get('amount'),
                    'currency': listing_data.get('pricing', {}).get('rate', {}).get('currency'),
                    'ratings': listing_data.get('stars'),
                    'reviews': listing_data.get('reviewsCount'),
                    'image_url': listing_data.get('image', {}).get('url')
                }
                listings.append(listing)
                
        return listings
        
    def parse_listing_details(self, response):
        # Extract the detailed listing data
        listing_data = response.meta['listing_data']
        
        # Extract additional details from the listing page
        description = response.css('div[data-section-id="DESCRIPTION_DEFAULT"] span::text').get()
        address = response.css('div[data-section-id="LOCATION_DEFAULT"] span::text').get()
        
        # Extract amenities
        amenities = response.css('div[data-section-id="AMENITIES_DEFAULT"] div._gw4xx4::text').getall()
        
        # Extract host information
        host_name = response.css('div[data-section-id="HOST_PROFILE_DEFAULT"] h2::text').get()
        host_image = response.css('div[data-section-id="HOST_PROFILE_DEFAULT"] img::attr(src)').get()
        is_superhost = bool(response.css('div[data-section-id="HOST_PROFILE_DEFAULT"] [aria-label*="Superhost"]'))
        
        # Extract property type
        property_type = response.css('div[data-section-id="OVERVIEW_DEFAULT"] h2::text').get()
        
        # Extract all images
        image_urls = response.css('div[data-testid="photo-viewer"] img::attr(src)').getall()
        
        # Combine all data
        complete_listing = {
            'title': listing_data.get('title'),
            'location': listing_data.get('location'),
            'address': address,
            'price_per_night': listing_data.get('price_per_night'),
            'currency': listing_data.get('currency', 'USD'),
            'total_price': None,  # Would need to calculate based on dates
            'ratings': listing_data.get('ratings'),
            'reviews': listing_data.get('reviews'),
            'description': description,
            'property_type': property_type,
            'host': {
                'name': host_name,
                'image_url': host_image,
                'is_superhost': is_superhost,
                'response_rate': None,  # Would need to extract
                'joined_date': None,    # Would need to extract
            },
            'amenities': amenities,
            'images': [{'image_url': url, 'is_primary': idx == 0} for idx, url in enumerate(image_urls)]
        }
        
        # Send data to Django backend
        self.send_to_backend(complete_listing)
        
    def send_to_backend(self, listing_data):
        """Send the scraped data to the Django backend"""
        url = 'http://localhost:8000/api/add_listing/'
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json=listing_data, headers=headers)
            if response.status_code == 201:
                self.logger.info(f"Successfully added listing: {listing_data['title']}")
            else:
                self.logger.error(f"Failed to add listing: {response.text}")
        except Exception as e:
            self.logger.error(f"Error sending data to backend: {str(e)}")

