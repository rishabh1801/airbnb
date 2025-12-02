from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'listings', views.ListingViewSet)
router.register(r'amenities', views.AmenityViewSet)
router.register(r'hosts', views.HostViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/add_listing/', views.add_listing, name='add_listing'),
    path('api/toggle_favorite/', views.toggle_favorite, name='toggle_favorite'),
    path('api/create_booking/', views.create_booking, name='create_booking'),
]

