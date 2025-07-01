from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    mobile = models.CharField(max_length=10, unique=True)
    email = models.EmailField(blank=True, null=True)
    referral_code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    referred_by = models.CharField(max_length=20, blank=True, null=True)  # stores referral_code

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        if not self.referral_code:
            base = (self.mobile or self.username or "USR")[:3].upper()
            for _ in range(100):
                code = base + uuid.uuid4().hex[:4].upper()
                if not User.objects.filter(referral_code=code).exists():
                    self.referral_code = code
                    break
            else:
                self.referral_code = uuid.uuid4().hex[:7].upper()
        super().save(*args, **kwargs)

    def get_referrer(self):
        if self.referred_by:
            try:
                return User.objects.get(referral_code=self.referred_by)
            except User.DoesNotExist:
                return None
        return None

class Wallet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    winnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.username} Wallet"

class DepositRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    utr_number = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20) 
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    approved_at = models.DateTimeField(null=True, blank=True)  # ✅ Add this if you need timestamp

    def is_approved(self):
        return self.status == "approved"

    def is_rejected(self):
        return self.status == "rejected"

    is_approved.boolean = True
    is_rejected.boolean = True

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} - {self.status}"


class WithdrawRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Withdraw ₹{self.amount}"


class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, null=True, blank=True)
    related_deposit = models.ForeignKey('DepositRequest', null=True, blank=True, on_delete=models.SET_NULL)  # <-- Add this line

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount} - {self.status}"


from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

class Bet(models.Model):
    GAME_CHOICES = [
        ('gali', 'Gali'),
        ('faridabad', 'Faridabad'),
        ('disawer', 'Disawer'),
        ('ghaziabad', 'Ghaziabad'),
        ('jaipur king', 'Jaipur King'),
        ('diamond king', 'Diamond King'),
    ]
    BET_TYPE_CHOICES = [
        ('number', 'Number'),
        ('andar', 'Andar'),
        ('bahar', 'Bahar'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_name = models.CharField(max_length=20, choices=GAME_CHOICES)
    bet_type = models.CharField(max_length=10, choices=BET_TYPE_CHOICES)
    number = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_win = models.BooleanField(default=False)
    payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    session_start = models.DateTimeField(null=True, blank=True) 
    session_end = models.DateTimeField(null=True, blank=True) 
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('won', 'Won'), ('lost', 'Lost')],
        default='pending'
    )
    

    def __str__(self):
        return f"{self.user.username} - {self.game_name} - {self.bet_type} - {self.number}"
    

class Game(models.Model):
    name = models.CharField(max_length=50, unique=True)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name



class ReferralCommission(models.Model):
    COMMISSION_TYPE_CHOICES = [
        ('signup_bonus', 'Signup Bonus'),
        ('bet_commission', 'Bet Commission'),
    ]
    referred_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="referred_commissions", on_delete=models.CASCADE)
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="referrals_made", on_delete=models.CASCADE)
    bet = models.ForeignKey('Bet', on_delete=models.CASCADE, null=True, blank=True)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    commission_type = models.CharField(max_length=20, choices=COMMISSION_TYPE_CHOICES)  # <-- Add this line
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.referrer} earned ₹{self.commission} from {self.referred_user}"
    


from django.contrib.auth import get_user_model

class UserDataBackup(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)


from django.db import models
from django.conf import settings

class WalletAuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet_audits")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="wallet_changes")
    old_balance = models.DecimalField(max_digits=12, decimal_places=2)
    new_balance = models.DecimalField(max_digits=12, decimal_places=2)
    old_bonus = models.DecimalField(max_digits=12, decimal_places=2)
    new_bonus = models.DecimalField(max_digits=12, decimal_places=2)
    old_winnings = models.DecimalField(max_digits=12, decimal_places=2)
    new_winnings = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wallet change for {self.user} by {self.admin} on {self.created_at}"