from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from django.db.models import Q
from .models import Listing, Amenity, Host, ListingImage
from .serializers import ListingSerializer, AmenitySerializer, HostSerializer
from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ListingViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows listings to be viewed or edited.
    """
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'location', 'description', 'property_type']
    ordering_fields = ['price_per_night', 'ratings', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Optionally restricts the returned listings by filtering against
        query parameters in the URL.
        """
        queryset = Listing.objects.all().prefetch_related('amenities', 'images').select_related('host')
        
        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)
        
        # Filter by ratings
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(ratings__gte=min_rating)
        
        # Filter by property type
        property_type = self.request.query_params.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type__icontains=property_type)
        
        # Filter by amenities
        amenities = self.request.query_params.get('amenities')
        if amenities:
            amenity_list = amenities.split(',')
            for amenity in amenity_list:
                queryset = queryset.filter(amenities__name__icontains=amenity)
        
        # Filter by number of guests (assuming we'd add a guests field to the model)
        guests = self.request.query_params.get('guests')
        if guests:
            # This would need to be implemented based on your data model
            pass
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Create a new listing with nested host, amenities, and images.
        """
        images_data = request.data.pop('images', [])
        serializer = self.get_serializer(data=request.data, context={'images': images_data})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """
        Update a listing with nested host, amenities, and images.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        images_data = request.data.pop('images', [])
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'images': images_data})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Update or create images
        if images_data:
            # Delete existing images if we're replacing them all
            if not partial:
                instance.images.all().delete()
            
            # Add new images
            for image_data in images_data:
                image_data['listing'] = instance.id
                if 'id' in image_data and image_data['id']:
                    # Update existing image
                    image = get_object_or_404(ListingImage, id=image_data['id'])
                    for key, value in image_data.items():
                        if key != 'id':
                            setattr(image, key, value)
                    image.save()
                else:
                    # Create new image
                    ListingImage.objects.create(listing=instance, **image_data)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Return a list of featured listings (e.g., highest rated).
        """
        featured_listings = self.get_queryset().order_by('-ratings')[:5]
        serializer = self.get_serializer(featured_listings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """
        Return listings grouped by location.
        """
        locations = Listing.objects.values_list('location', flat=True).distinct()
        result = {}
        
        for location in locations:
            listings = self.get_queryset().filter(location=location)[:3]
            serializer = self.get_serializer(listings, many=True)
            result[location] = serializer.data
            
        return Response(result)

@api_view(['POST'])
def add_listing(request):
    """
    Add a new Airbnb listing from the scraper or external source
    """
    images_data = request.data.pop('images', [])
    
    # Process amenities
    amenities_data = request.data.pop('amenities', [])
    amenities_list = []
    for amenity in amenities_data:
        if isinstance(amenity, str):
            amenities_list.append({'name': amenity})
        else:
            amenities_list.append(amenity)
    
    request.data['amenities'] = amenities_list
    
    serializer = ListingSerializer(data=request.data, context={'images': images_data})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AmenityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for amenities
    """
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer

class HostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for hosts
    """
    queryset = Host.objects.all()
    serializer_class = HostSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

@api_view(['POST'])
def toggle_favorite(request):
    """
    Toggle a listing as favorite (would typically use a Favorite model)
    """
    listing_id = request.data.get('listing_id')
    is_favorite = request.data.get('is_favorite', True)
    
    if not listing_id:
        return Response({"error": "listing_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    listing = get_object_or_404(Listing, id=listing_id)
    
    # In a real app, you would:
    # 1. Get or create a Favorite object for the current user and this listing
    # 2. Set its status based on is_favorite
    # 3. Save it
    
    # For now, we'll just return a success response
    return Response({
        "success": True,
        "listing_id": listing_id,
        "is_favorite": is_favorite
    })

@api_view(['POST'])
def create_booking(request):
    """
    Create a booking for a listing
    """
    listing_id = request.data.get('listing_id')
    check_in_date = request.data.get('check_in_date')
    check_out_date = request.data.get('check_out_date')
    guests_count = request.data.get('guests_count')
    total_price = request.data.get('total_price')
    
    # Validate required fields
    if not all([listing_id, check_in_date, check_out_date, guests_count, total_price]):
        return Response({
            "error": "Missing required fields. Please provide listing_id, check_in_date, check_out_date, guests_count, and total_price."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the listing
    listing = get_object_or_404(Listing, id=listing_id)
    
    # In a real app, you would:
    # 1. Create a Booking object with the provided data
    # 2. Associate it with the current user
    # 3. Check for availability conflicts
    # 4. Process payment
    
    # For now, we'll just return a success response with a mock booking ID
    booking_id = f"BK{listing_id}{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return Response({
        "success": True,
        "booking_id": booking_id,
        "listing": listing.title,
        "check_in_date": check_in_date,
        "check_out_date": check_out_date,
        "guests_count": guests_count,
        "total_price": total_price,
        "status": "confirmed"
    }, status=status.HTTP_201_CREATED)

