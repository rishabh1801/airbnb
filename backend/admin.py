from django.contrib import admin
from .models import Host, Amenity, Listing, ListingImage

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'price_per_night', 'ratings', 'property_type', 'host')
    list_filter = ('property_type', 'location')
    search_fields = ('title', 'description', 'location')
    inlines = [ListingImageInline]

class HostAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_superhost', 'response_rate')
    list_filter = ('is_superhost',)
    search_fields = ('name',)

class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

admin.site.register(Host, HostAdmin)
admin.site.register(Amenity, AmenityAdmin)
admin.site.register(Listing, ListingAdmin)
admin.site.register(ListingImage)

