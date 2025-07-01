from django.utils import timezone
from .models import Bet, User
from .views import get_game_time_window, declare_result, calculate_diamond_king_payouts

def auto_declare_diamond_king():
    now = timezone.localtime()
    open_dt, close_dt, result_dt = get_game_time_window("DIAMOND KING")
    print("now:", now, "open_dt:", open_dt, "close_dt:", close_dt, "result_dt:", result_dt)
    if not open_dt or not close_dt or not result_dt:
        print("Session timings not found.")
        return

    # If in result window and no result declared yet
    if close_dt < now <= result_dt:
        bets = Bet.objects.filter(
            game_name__iexact="DIAMOND KING",
            status='pending',
            created_at__gte=open_dt,
            created_at__lte=close_dt
        )
        if not bets.exists():
            print("No pending bets found.")
            return

        payout_map, total_bet, all_numbers = calculate_diamond_king_payouts(bets)
        min_payout = min(payout_map.values())
        min_numbers = [num for num, payout in payout_map.items() if payout == min_payout]
        min_num = sorted(min_numbers)[0]
        min_num = str(min_num).zfill(2)  # Ensure 2-digit string

        print("min_num:", min_num, "type:", type(min_num))
        print("Request data:", {'game_name': 'DIAMOND KING', 'winning_number': min_num})

        # Simulate admin POST
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/api/admin/declare-result/', {'game_name': 'DIAMOND KING', 'winning_number': min_num})

        # Set an admin user for permission
        try:
            admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
            if not admin_user:
                print("No admin user found for auto result declare.")
                return
            request.user = admin_user
        except Exception as e:
            print("Admin user fetch error:", e)
            return

        # Debug log
        print(f"[AUTO-DECLARE] Diamond King result auto declared: {min_num} by {admin_user.username}")

        response = declare_result(request)
        print("declare_result response:", getattr(response, 'data', response))
    else:
        print("Not in result window, skipping auto declare.")