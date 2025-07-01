from django.core.management.base import BaseCommand
from django.utils import timezone
from stapp.models import Bet, User, Wallet
from stapp.views import get_game_time_window
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Automatically declare Diamond King result for current session at result time.'

    def handle(self, *args, **kwargs):
        game_name = "DIAMOND KING"
        open_dt, close_dt, result_dt = get_game_time_window(game_name)
        now = timezone.localtime()

        if not open_dt or not close_dt or not result_dt:
            self.stdout.write(self.style.WARNING("No active session found for Diamond King."))
            return

        # Only run at exact result time
        if abs((now - result_dt).total_seconds()) > 30:  # 30 sec window for safety
            self.stdout.write(self.style.WARNING("Not at result time."))
            return

        # Check if result already declared
        if Bet.objects.filter(
            game_name__iexact=game_name,
            status__in=['won', 'lost'],
            created_at__gte=open_dt,
            created_at__lte=close_dt
        ).exists():
            self.stdout.write(self.style.SUCCESS("Result already declared for this session."))
            return

        # Collect all bets for this session
        bets = Bet.objects.filter(
            game_name__iexact=game_name,
            status='pending',
            created_at__gte=open_dt,
            created_at__lte=close_dt
        )

        # Calculate total bet amount for each number (00-99)
        bet_amounts = {str(i).zfill(2): Decimal('0.00') for i in range(100)}
        for bet in bets:
            num = str(bet.number).zfill(2)
            if bet.bet_type == 'number':
                bet_amounts[num] += bet.amount
            elif bet.bet_type == 'andar':
                # Andar: first digit
                for n in range(10):
                    bet_amounts[str(n).zfill(2)] += bet.amount if int(num[0]) == n else Decimal('0.00')
            elif bet.bet_type == 'bahar':
                # Bahar: last digit
                for n in range(10):
                    bet_amounts[str(n*10).zfill(2)] += bet.amount if int(num[1]) == n else Decimal('0.00')

        # Find numbers with minimum bet amount
        min_amount = min(bet_amounts.values())
        min_numbers = [num for num, amt in bet_amounts.items() if amt == min_amount]

        # Randomly select one if multiple
        winning_number = random.choice(min_numbers)

        # Declare result (same as admin logic)
        for bet in bets:
            payout = Decimal('0.00')
            is_win = False
            if bet.bet_type == 'number' and str(bet.number).zfill(2) == winning_number:
                payout = bet.amount * 90
                is_win = True
            elif bet.bet_type == 'andar' and int(bet.number) == int(winning_number[0]):
                payout = bet.amount * 9
                is_win = True
            elif bet.bet_type == 'bahar' and int(bet.number) == int(winning_number[1]):
                payout = bet.amount * 9
                is_win = True

            wallet = Wallet.objects.get(user=bet.user)
            if is_win:
                wallet.winnings += payout
                bet.status = 'won'
            else:
                bet.status = 'lost'
            wallet.save()
            bet.is_win = is_win
            bet.payout = payout
            bet.winning_number = winning_number
            bet.save()

        self.stdout.write(self.style.SUCCESS(
            f"Auto result declared for Diamond King session: Winning number {winning_number}"
        ))