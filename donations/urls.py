from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Donor paths
    path('donor/dashboard/', views.donor_dashboard, name='donor_dashboard'),
    path('donation/history/', views.donation_history, name='donation_history'),
    path('donate/<int:campaign_id>/', views.make_donation, name='make_donation'),
    
    # Charity paths
    path('charity/dashboard/', views.charity_dashboard, name='charity_dashboard'),
    path('campaign/create/', views.create_campaign, name='create_campaign'),
    
    # Admin (Custom dashboard, besides Django Admin)
    path('admin-panel/', views.admin_dashboard, name='custom_admin_dashboard'),
]
