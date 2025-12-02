from django.db import models

class Host(models.Model):
    name = models.CharField(max_length=255)
    image_url = models.URLField(blank=True, null=True)
    is_superhost = models.BooleanField(default=False)
    response_rate = models.IntegerField(blank=True, null=True)
    joined_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.name

class Amenity(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Listing(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True, null=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ratings = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    reviews = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    property_type = models.CharField(max_length=100, blank=True, null=True)
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name='listings')
    amenities = models.ManyToManyField(Amenity, related_name='listings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.listing.title}"

# Optional: Add these models for a more complete application

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='bookings')
    # In a real app, you would have a User model
    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guests_count = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_reference = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.booking_reference} for {self.listing.title}"

class Favorite(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='favorites')
    # In a real app, you would have a User model
    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # This would ensure a user can only favorite a listing once
        # unique_together = ('listing', 'user')
        pass
    
    def __str__(self):
        return f"Favorite: {self.listing.title}"

