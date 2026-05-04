from django.contrib import admin
from .models import User, Campaign, Donation, Proof

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff')
    search_fields = ('username', 'email')

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'charity', 'goal_amount', 'raised_amount', 'is_active')
    list_filter = ('is_active', 'charity')
    search_fields = ('title', 'description')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'campaign', 'amount', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('donor__username', 'campaign__title')

@admin.register(Proof)
class ProofAdmin(admin.ModelAdmin):
    list_display = ('charity', 'campaign', 'submitted_at', 'is_verified')
    list_filter = ('is_verified',)
