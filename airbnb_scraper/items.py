import scrapy

class AirbnbListingItem(scrapy.Item):
    # Basic listing information
    title = scrapy.Field()
    location = scrapy.Field()
    address = scrapy.Field()
    price_per_night = scrapy.Field()
    currency = scrapy.Field()
    total_price = scrapy.Field()
    ratings = scrapy.Field()
    reviews = scrapy.Field()
    description = scrapy.Field()
    property_type = scrapy.Field()
    
    # Host information
    host = scrapy.Field()
    
    # Amenities
    amenities = scrapy.Field()
    
    # Images
    images = scrapy.Field()
    
    # Additional metadata
    listing_id = scrapy.Field()
    url = scrapy.Field()
    scraped_at = scrapy.Field()

