import json
import requests
from scrapy.exceptions import DropItem
from datetime import datetime
from scrapy import signals
from scrapy.utils.project import get_project_settings

class AirbnbScraperPipeline:
    def __init__(self):
        self.settings = get_project_settings()
        self.backend_url = self.settings.get('DJANGO_BACKEND_URL')
        self.items_processed = 0
        self.items_saved = 0
        self.items_failed = 0
    
    @classmethod
    def from_crawler(cls, crawler):
        pipeline = cls()
        crawler.signals.connect(pipeline.spider_closed, signals.spider_closed)
        return pipeline
    
    def process_item(self, item, spider):
        # Validate required fields
        required_fields = ['title', 'location', 'price_per_night']
        for field in required_fields:
            if not item.get(field):
                raise DropItem(f"Missing required field {field} in {item}")
        
        # Convert price to float if it's a string
        if isinstance(item['price_per_night'], str):
            try:
                # Remove currency symbols and commas
                price_str = ''.join(c for c in item['price_per_night'] if c.isdigit() or c == '.')
                item['price_per_night'] = float(price_str)
            except ValueError:
                spider.logger.warning(f"Could not convert price to float: {item['price_per_night']}")
        
        # Convert ratings to float if it's a string
        if item.get('ratings') and isinstance(item['ratings'], str):
            try:
                item['ratings'] = float(item['ratings'])
            except ValueError:
                spider.logger.warning(f"Could not convert ratings to float: {item['ratings']}")
        
        # Convert reviews to int if it's a string
        if item.get('reviews') and isinstance(item['reviews'], str):
            try:
                # Remove commas and other non-digit characters
                reviews_str = ''.join(c for c in item['reviews'] if c.isdigit())
                item['reviews'] = int(reviews_str)
            except ValueError:
                spider.logger.warning(f"Could not convert reviews to int: {item['reviews']}")
        
        # Add timestamp
        item['scraped_at'] = datetime.now().isoformat()
        
        # Send to Django backend
        try:
            headers = {"Content-Type": "application/json"}
            response = requests.post(
                self.backend_url,
                json=dict(item),
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                self.items_saved += 1
                spider.logger.info(f"Successfully saved listing: {item['title']}")
            else:
                self.items_failed += 1
                spider.logger.error(f"Failed to save listing: {response.text}")
        except Exception as e:
            self.items_failed += 1
            spider.logger.error(f"Error sending data to backend: {str(e)}")
        
        self.items_processed += 1
        return item
    
    def spider_closed(self, spider):
        spider.logger.info(f"Pipeline stats: Processed: {self.items_processed}, Saved: {self.items_saved}, Failed: {self.items_failed}")

