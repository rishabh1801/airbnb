from scrapy import signals
from scrapy.http import HtmlResponse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

class SeleniumMiddleware:
    """Middleware to handle JavaScript-rendered content using Selenium"""
    
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls()
        crawler.signals.connect(middleware.spider_opened, signals.spider_opened)
        crawler.signals.connect(middleware.spider_closed, signals.spider_closed)
        return middleware
    
    def spider_opened(self, spider):
        # Initialize Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        # Initialize the Chrome driver
        self.driver = webdriver.Chrome(options=chrome_options)
    
    def spider_closed(self, spider):
        # Close the driver when the spider is closed
        self.driver.quit()
    
    def process_request(self, request, spider):
        # Only process requests that need JavaScript rendering
        if 'render_js' in request.meta and request.meta['render_js']:
            self.driver.get(request.url)
            
            # Wait for JavaScript to load
            time.sleep(5)
            
            # Get the rendered HTML
            body = self.driver.page_source
            
            # Create a new response with the rendered HTML
            return HtmlResponse(
                url=request.url,
                body=body,
                encoding='utf-8',
                request=request
            )

