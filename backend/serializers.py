from rest_framework import serializers
from .models import Listing, Host, Amenity, ListingImage

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']

class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Host
        fields = ['id', 'name', 'image_url', 'is_superhost', 'response_rate', 'joined_date']

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image_url', 'is_primary']

class ListingSerializer(serializers.ModelSerializer):
    host = HostSerializer()
    amenities = AmenitySerializer(many=True)
    images = ListingImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'location', 'address', 'price_per_night', 
            'currency', 'total_price', 'ratings', 'reviews', 
            'description', 'property_type', 'host', 'amenities', 'images',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        host_data = validated_data.pop('host')
        amenities_data = validated_data.pop('amenities')
        images_data = self.context.get('images', [])
        
        # Create or get host
        host, _ = Host.objects.get_or_create(**host_data)
        
        # Create listing
        listing = Listing.objects.create(host=host, **validated_data)
        
        # Add amenities
        for amenity_data in amenities_data:
            amenity, _ = Amenity.objects.get_or_create(name=amenity_data['name'])
            listing.amenities.add(amenity)
        
        # Add images
        for image_data in images_data:
            ListingImage.objects.create(listing=listing, **image_data)
        
        return listing
    
    def update(self, instance, validated_data):
        # Update host if provided
        if 'host' in validated_data:
            host_data = validated_data.pop('host')
            host = instance.host
            for key, value in host_data.items():
                setattr(host, key, value)
            host.save()
        
        # Update amenities if provided
        if 'amenities' in validated_data:
            amenities_data = validated_data.pop('amenities')
            instance.amenities.clear()
            for amenity_data in amenities_data:
                amenity, _ = Amenity.objects.get_or_create(name=amenity_data['name'])
                instance.amenities.add(amenity)
        
        # Update listing fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        
        return instance

