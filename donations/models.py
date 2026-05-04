from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('donor', 'Donor'),
        ('charity', 'Charity Organization'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='donor')
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

class Campaign(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField()
    charity = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'charity'})
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        if self.goal_amount > 0:
            return min(int((self.raised_amount / self.goal_amount) * 100), 100)
        return 0

class Donation(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'donor'})
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, default='Card')
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    status = models.CharField(max_length=20, default='Success')

    def __str__(self):
        return f"{self.donor.username} - ${self.amount} to {self.campaign.title}"

class Proof(models.Model):
    """Corresponds to 'submit proofs' use case from diagram"""
    charity = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'charity'})
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='proofs')
    document = models.FileField(upload_to='proofs/')
    description = models.CharField(max_length=255)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
