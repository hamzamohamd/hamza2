from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import User, Campaign, Donation, Proof
from .forms import UserRegistrationForm, CampaignForm, DonationForm, LoginForm
from django.db.models import Sum

def home(request):
    campaigns = Campaign.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'donations/home.html', {'campaigns': campaigns})

def register_view(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome, {user.username}! Your account has been created.")
            return redirect('home')
    else:
        form = UserRegistrationForm()
    return render(request, 'donations/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                if user.user_type == 'admin':
                    return redirect('custom_admin_dashboard')
                elif user.user_type == 'charity':
                    return redirect('charity_dashboard')
                return redirect('donor_dashboard')
            messages.error(request, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, 'donations/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def donor_dashboard(request):
    if request.user.user_type != 'donor':
        messages.error(request, "Access denied.")
        return redirect('home')
    history = Donation.objects.filter(donor=request.user).order_by('-date')
    total_donated = history.aggregate(Sum('amount'))['amount__sum'] or 0
    return render(request, 'donations/donor_dashboard.html', {
        'history': history,
        'total_donated': total_donated
    })

@login_required
def donation_history(request):
    history = Donation.objects.filter(donor=request.user).order_by('-date')
    return render(request, 'donations/donation_history.html', {'history': history})

@login_required
def make_donation(request, campaign_id):
    campaign = get_object_or_404(Campaign, id=campaign_id)
    if request.method == 'POST':
        form = DonationForm(request.POST)
        if form.is_valid():
            donation = form.save(commit=False)
            donation.donor = request.user
            donation.campaign = campaign
            donation.save()
            
            # Update campaign raised amount
            campaign.raised_amount += donation.amount
            campaign.save()
            
            messages.success(request, f"Thank you for donating ${donation.amount} to {campaign.title}!")
            return redirect('donor_dashboard')
    else:
        form = DonationForm()
    return render(request, 'donations/make_donation.html', {'form': form, 'campaign': campaign})

@login_required
def charity_dashboard(request):
    if request.user.user_type != 'charity':
        return redirect('home')
    my_campaigns = Campaign.objects.filter(charity=request.user)
    return render(request, 'donations/charity_dashboard.html', {'campaigns': my_campaigns})

@login_required
def create_campaign(request):
    if request.user.user_type != 'charity':
        return redirect('home')
    if request.method == 'POST':
        form = CampaignForm(request.POST)
        if form.is_valid():
            campaign = form.save(commit=False)
            campaign.charity = request.user
            campaign.save()
            messages.success(request, "Campaign created successfully!")
            return redirect('charity_dashboard')
    else:
        form = CampaignForm()
    return render(request, 'donations/create_campaign.html', {'form': form})

@login_required
def admin_dashboard(request):
    if request.user.user_type != 'admin':
        return redirect('home')
    all_donations = Donation.objects.all().order_by('-date')[:10]
    total_stats = Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    user_count = User.objects.count()
    campaign_count = Campaign.objects.count()
    return render(request, 'donations/admin_dashboard.html', {
        'donations': all_donations,
        'total_stats': total_stats,
        'user_count': user_count,
        'campaign_count': campaign_count
    })
