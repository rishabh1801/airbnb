import sys
import os
import argparse
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from airbnb_scraper.spiders.airbnb_spider import AirbnbSpider

def run_spider(location, checkin=None, checkout=None, guests=2, output=None):
    """
    Run the Airbnb spider with the given parameters
    
    Args:
        location (str): The location to search for
        checkin (str): Check-in date in YYYY-MM-DD format
        checkout (str): Check-out date in YYYY-MM-DD format
        guests (int): Number of guests
        output (str): Output file path (optional)
    """
    settings = get_project_settings()
    
    # Configure output if specified
    if output:
        settings['FEEDS'] = {
            output: {
                'format': 'json',
                'encoding': 'utf8',
                'store_empty': False,
                'fields': None,
                'indent': 4,
            }
        }
    
    process = CrawlerProcess(settings)
    
    process.crawl(
        AirbnbSpider,
        location=location,
        checkin=checkin,
        checkout=checkout,
        guests=guests
    )
    
    process.start()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scrape Airbnb listings')
    parser.add_argument('location', type=str, help='Location to search for')
    parser.add_argument('--checkin', type=str, help='Check-in date (YYYY-MM-DD)')
    parser.add_argument('--checkout', type=str, help='Check-out date (YYYY-MM-DD)')
    parser.add_argument('--guests', type=int, default=2, help='Number of guests')
    parser.add_argument('--output', type=str, help='Output file path (e.g., output.json)')
    
    args = parser.parse_args()
    
    run_spider(
        location=args.location,
        checkin=args.checkin,
        checkout=args.checkout,
        guests=args.guests,
        output=args.output
    )

