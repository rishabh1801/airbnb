import sys
import os
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from airbnb_scraper.spiders.airbnb_spider import AirbnbSpider

def run_spider(location, checkin=None, checkout=None, guests=2):
    """
    Run the Airbnb spider with the given parameters
    
    Args:
        location (str): The location to search for
        checkin (str): Check-in date in YYYY-MM-DD format
        checkout (str): Check-out date in YYYY-MM-DD format
        guests (int): Number of guests
    """
    process = CrawlerProcess(get_project_settings())
    
    process.crawl(
        AirbnbSpider,
        location=location,
        checkin=checkin,
        checkout=checkout,
        guests=guests
    )
    
    process.start()

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python run_scraper.py <location> [checkin] [checkout] [guests]")
        sys.exit(1)
        
    location = sys.argv[1]
    checkin = sys.argv[2] if len(sys.argv) > 2 else None
    checkout = sys.argv[3] if len(sys.argv) > 3 else None
    guests = int(sys.argv[4]) if len(sys.argv) > 4 else 2
    
    run_spider(location, checkin, checkout, guests)

