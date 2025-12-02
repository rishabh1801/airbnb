from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Listing, Host, Amenity, ListingImage
import json

class ListingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a host
        self.host = Host.objects.create(
            name="Test Host",
            is_superhost=True,
            response_rate=95
        )
        
        # Create amenities
        self.amenity1 = Amenity.objects.create(name="WiFi")
        self.amenity2 = Amenity.objects.create(name="Kitchen")
        
        # Create a listing
        self.listing = Listing.objects.create(
            title="Test Listing",
            location="Test City",
            price_per_night=100.00,
            ratings=4.5,
            reviews=10,
            property_type="Apartment",
            host=self.host
        )
        
        # Add amenities to the listing
        self.listing.amenities.add(self.amenity1, self.amenity2)
        
        # Create an image for the listing
        self.image = ListingImage.objects.create(
            listing=self.listing,
            image_url="https://example.com/image.jpg",
            is_primary=True
        )
    
    def test_get_listings(self):
        """Test retrieving all listings"""
        url = reverse('listing-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_listing_detail(self):
        """Test retrieving a specific listing"""
        url = reverse('listing-detail', args=[self.listing.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Listing")
    
    def test_filter_listings_by_location(self):
        """Test filtering listings by location"""
        url = reverse('listing-list') + '?location=Test'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        url = reverse('listing-list') + '?location=NonExistent'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
    
    def test_create_listing(self):
        """Test creating a new listing"""
        url = reverse('listing-list')
        data = {
            "title": "New Test Listing",
            "location": "New Test City",
            "price_per_night": 150.00,
            "currency": "USD",
            "ratings": 4.8,
            "reviews": 5,
            "description": "A beautiful new listing",
            "property_type": "House",
            "host": {
                "name": "New Host",
                "is_superhost": False,
                "response_rate": 90
            },
            "amenities": [
                {"name": "WiFi"},
                {"name": "Pool"}
            ],
            "images": [
                {
                    "image_url": "https://example.com/new_image.jpg",
                    "is_primary": True
                }
            ]
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Listing.objects.count(), 2)
        self.assertEqual(Host.objects.count(), 2)
        self.assertEqual(Amenity.objects.count(), 3)  # WiFi already exists
        
        # Check that the new listing has the correct data
        new_listing = Listing.objects.get(title="New Test Listing")
        self.assertEqual(new_listing.location, "New Test City")
        self.assertEqual(new_listing.price_per_night, 150.00)
        self.assertEqual(new_listing.host.name, "New Host")
        self.assertEqual(new_listing.amenities.count(), 2)
        self.assertEqual(new_listing.images.count(), 1)

