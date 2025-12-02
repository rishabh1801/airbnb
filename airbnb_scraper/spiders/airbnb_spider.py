import scrapy
import json
import re
import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode, urlparse, parse_qs
from ..items import AirbnbListingItem

class AirbnbSpider(scrapy.Spider):
    name = 'airbnb'
    allowed_domains = ['airbnb.com']
    
    # Custom settings for this spider
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 2,
    }
    
    def __init__(self, location='New York', checkin=None, checkout=None, guests=2, *args, **kwargs):
        super(AirbnbSpider, self).__init__(*args, **kwargs)
        self.location = location
        
        # Set default dates if not provided
        if not checkin:
            checkin_date = datetime.now() + timedelta(days=7)
            self.checkin = checkin_date.strftime('%Y-%m-%d')
        else:
            self.checkin = checkin
            
        if not checkout:
            checkout_date = datetime.now() + timedelta(days=14)
            self.checkout = checkout_date.strftime('%Y-%m-%d')
        else:
            self.checkout = checkout
            
        self.guests = int(guests)
        self.listings_count = 0
        self.max_listings = 100  # Maximum number of listings to scrape
        
        # API endpoints
        self.search_api_url = 'https://www.airbnb.com/api/v3/ExploreSearch'
        self.pdp_api_url = 'https://www.airbnb.com/api/v3/PdpPlatformSections'
        
        # API key and other parameters (these may change over time)
        self.api_key = 'd306zoyjsyarp7ifhu67rjxn52tv0t20'  # This is a common Airbnb API key
        
        self.logger.info(f"Spider initialized with location={location}, checkin={self.checkin}, checkout={self.checkout}, guests={self.guests}")
    
    def start_requests(self):
        """Start the scraping process by making a request to the search API"""
        # Build the search API parameters
        search_params = {
            'operationName': 'ExploreSearch',
            'variables': json.dumps({
                'exploreRequest': {
                    'metadataOnly': False,
                    'searchRequest': {
                        'query': self.location,
                        'checkin': self.checkin,
                        'checkout': self.checkout,
                        'adults': self.guests,
                        'children': 0,
                        'infants': 0,
                        'pets': 0,
                        'page': 1,
                        'itemsPerPage': 20,
                        'refinementPaths': ['/homes'],
                        'source': 'structured_search_input_header',
                        'searchType': 'search_query',
                    }
                }
            }),
            'extensions': json.dumps({
                'persistedQuery': {
                    'version': 1,
                    'sha256Hash': '4906e3d9d9c86b8f80d371c299d98d2c9cc73a6c54a89e68c6c5574393a0c1f8'  # This hash may change
                }
            })
        }
        
        # Make the initial search request
        url = f"{self.search_api_url}?{urlencode(search_params)}"
        yield scrapy.Request(
            url=url,
            callback=self.parse_search_results,
            headers={
                'X-Airbnb-API-Key': self.api_key,
                'Content-Type': 'application/json',
            },
            meta={'page': 1}
        )
    
    def parse_search_results(self, response):
        """Parse the search results from the API response"""
        try:
            data = json.loads(response.text)
            
            # Extract listings from the response
            sections = data.get('data', {}).get('presentation', {}).get('explore', {}).get('sections', {})
            listings_section = None
            
            # Find the section containing listings
            for section in sections.get('sections', []):
                if section.get('sectionComponentType') == 'listings':
                    listings_section = section
                    break
            
            if not listings_section:
                self.logger.error("Could not find listings section in response")
                return
            
            # Extract listing items
            listings = listings_section.get('items', [])
            
            for listing in listings:
                listing_data = listing.get('listing', {})
                if not listing_data:
                    continue
                
                listing_id = listing_data.get('id')
                if not listing_id:
                    continue
                
                self.listings_count += 1
                
                # Extract basic listing information
                item = AirbnbListingItem()
                item['listing_id'] = listing_id
                item['title'] = listing_data.get('name', '')
                item['location'] = listing_data.get('city', '') or listing_data.get('publicAddress', '')
                
                # Extract price information
                price_info = listing_data.get('pricing', {})
                rate = price_info.get('rate', {})
                item['price_per_night'] = rate.get('amount')
                item['currency'] = rate.get('currency')
                
                # Extract total price if available
                total_price = price_info.get('totalPrice', {})
                item['total_price'] = total_price.get('amount')
                
                # Extract ratings and reviews
                item['ratings'] = listing_data.get('avgRating')
                item['reviews'] = listing_data.get('reviewsCount')
                
                # Extract property type
                item['property_type'] = listing_data.get('roomTypeCategory', '')
                
                # Extract primary image
                picture_url = listing_data.get('picture', {}).get('picture')
                if picture_url:
                    item['images'] = [{'image_url': picture_url, 'is_primary': True}]
                
                # Get the listing URL for detailed information
                listing_url = f"https://www.airbnb.com/rooms/{listing_id}"
                item['url'] = listing_url
                
                # Make a request to the PDP API to get detailed listing information
                pdp_params = {
                    'operationName': 'PdpPlatformSections',
                    'variables': json.dumps({
                        'request': {
                            'id': listing_id,
                            'pdpSectionsRequest': {
                                'adults': self.guests,
                                'children': 0,
                                'infants': 0,
                                'pets': 0,
                                'checkin': self.checkin,
                                'checkout': self.checkout,
                            }
                        }
                    }),
                    'extensions': json.dumps({
                        'persistedQuery': {
                            'version': 1,
                            'sha256Hash': '8a885b7a4c9d6e3f8b52293d957b9f6a8a5bfe0f1c7042da0a6c2a85f4bea9e9'  # This hash may change
                        }
                    })
                }
                
                pdp_url = f"{self.pdp_api_url}?{urlencode(pdp_params)}"
                yield scrapy.Request(
                    url=pdp_url,
                    callback=self.parse_listing_details,
                    headers={
                        'X-Airbnb-API-Key': self.api_key,
                        'Content-Type': 'application/json',
                    },
                    meta={'item': item}
                )
            
            # Check if we should continue to the next page
            current_page = response.meta.get('page', 1)
            if self.listings_count < self.max_listings and listings:
                next_page = current_page + 1
                
                # Update the search parameters for the next page
                search_params = {
                    'operationName': 'ExploreSearch',
                    'variables': json.dumps({
                        'exploreRequest': {
                            'metadataOnly': False,
                            'searchRequest': {
                                'query': self.location,
                                'checkin': self.checkin,
                                'checkout': self.checkout,
                                'adults': self.guests,
                                'children': 0,
                                'infants': 0,
                                'pets': 0,
                                'page': next_page,
                                'itemsPerPage': 20,
                                'refinementPaths': ['/homes'],
                                'source': 'structured_search_input_header',
                                'searchType': 'search_query',
                            }
                        }
                    }),
                    'extensions': json.dumps({
                        'persistedQuery': {
                            'version': 1,
                            'sha256Hash': '4906e3d9d9c86b8f80d371c299d98d2c9cc73a6c54a89e68c6c5574393a0c1f8'
                        }
                    })
                }
                
                next_url = f"{self.search_api_url}?{urlencode(search_params)}"
                self.logger.info(f"Moving to page {next_page}")
                yield scrapy.Request(
                    url=next_url,
                    callback=self.parse_search_results,
                    headers={
                        'X-Airbnb-API-Key': self.api_key,
                        'Content-Type': 'application/json',
                    },
                    meta={'page': next_page}
                )
            
        except Exception as e:
            self.logger.error(f"Error parsing search results: {str(e)}")
    
    def parse_listing_details(self, response):
        """Parse the detailed listing information from the PDP API response"""
        try:
            item = response.meta['item']
            data = json.loads(response.text)
            
            # Extract sections from the response
            sections = data.get('data', {}).get('presentation', {}).get('stayProductDetailPage', {}).get('sections', {})
            
            # Extract description
            metadata_section = sections.get('metadata')
            if metadata_section:
                item['description'] = metadata_section.get('loggingContext', {}).get('description', '')
            
            # Extract address
            location_section = sections.get('location')
            if location_section:
                item['address'] = location_section.get('subtitle', '')
            
            # Extract host information
            host_section = sections.get('host')
            if host_section:
                host_info = host_section.get('host', {})
                host = {
                    'name': host_info.get('name', ''),
                    'image_url': host_info.get('avatarImage', {}).get('url', ''),
                    'is_superhost': host_info.get('isSuperhost', False),
                    'response_rate': host_info.get('responseRate', {}).get('rate') if host_info.get('responseRate') else None,
                    'joined_date': host_info.get('memberSince', '')
                }
                item['host'] = host
            
            # Extract amenities
            amenities_section = sections.get('amenities')
            if amenities_section:
                amenities_groups = amenities_section.get('amenitiesGroups', [])
                amenities = []
                for group in amenities_groups:
                    for amenity in group.get('amenities', []):
                        amenities.append({'name': amenity.get('title', '')})
                item['amenities'] = amenities
            
            # Extract all images
            photos_section = sections.get('photos')
            if photos_section:
                all_photos = photos_section.get('data', {}).get('photos', [])
                images = []
                
                # Check if we already have a primary image
                has_primary = False
                if item.get('images'):
                    has_primary = any(img.get('is_primary') for img in item['images'])
                    images.extend(item['images'])
                
                # Add all other images
                for i, photo in enumerate(all_photos):
                    if photo.get('picture'):
                        image_url = photo.get('picture')
                        # Skip if this URL is already in our images list
                        if any(img.get('image_url') == image_url for img in images):
                            continue
                        
                        is_primary = not has_primary and i == 0
                        images.append({
                            'image_url': image_url,
                            'is_primary': is_primary
                        })
                        if is_primary:
                            has_primary = True
                
                item['images'] = images
            
            yield item
            
        except Exception as e:
            self.logger.error(f"Error parsing listing details: {str(e)}")

