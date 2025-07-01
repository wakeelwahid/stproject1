
from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    path('profile/', get_user_profile, name='get_user_profile'),
    path('balance/', get_wallet_balance, name='get_wallet_balance'),
    path('withdraw/', withdraw_request, name='withdraw-request'),
    path('transactions/', transaction_history, name='transaction-history'),
    path('place-bet/', place_bet, name='place_bet'),
    path('current-session/',view_bets_current_session, name='view_bets_current_session'),
    path('view-bets-history/',view_bets_history, name='view_bets_history'),
    path('my-bets/', user_bet_history, name='user-bet-history'),
    # path('get-profile/', get_user_profile, name='get_profile'),
    
    # Admin endpoints
    path('admin/token/', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    # path('admin/bets/', AdminGroupedBetStatsAPIView.as_view(), 
    #      name='admin-grouped-bets'),
    path('admin/bets/', admin_bet_records, name='admin_bet_records'),
    path('admin/undo_result/', undo_result, name='undo_result'),

    path('admin/withdraw-requests/', admin_withdraw_requests, name='admin_withdraw_requests'),
    path('admin/withdraw-action/', admin_withdraw_action, name='admin_withdraw_action'),
    path('admin/transactions/', admin_transactions, name='admin_transactions'),
    path('admin/deposit-requests/', admin_list_deposit_requests, name='admin_list_deposit_requests'),
    path('admin/deposit-action/', admin_deposit_action, name='admin_deposit_action'),
    path('admin/declare-result/', declare_result, name='declare_result'),
    path('admin/referral-summary/', admin_referral_summary, name="admin_referral_summary"),
    path('admin/users-stats/', admin_users_stats, name='admin_users_stats'),
    
    # Other endpoints
    path('deposit-requests/', user_deposit_request, name='user_deposit_request'),
    path('user/referrals/', referral_earnings, name="referral_earnings"),
    path('user/my-referrals/', my_referrals, name='my_referrals'),
    path('game-status/', game_status, name='game-status'),
    
    path('admin/user/<int:user_id>/details/', admin_user_details, name='admin_user_details'),
    path('admin/user/<int:user_id>/deposits/', admin_user_deposits, name='admin_user_deposits'),
    path('admin/user/<int:user_id>/withdrawals/', admin_user_withdrawals, name='admin_user_withdrawals'),
    path('admin/user/<int:user_id>/bets/', admin_user_bets, name='admin_user_bets'),
    path("admin/dashboard-stats/", admin_dashboard_stats, name="admin_dashboard_stats"),
    path('admin/games-stats/', admin_games_stats, name='admin_games_stats'),
    path('admin/user/<int:user_id>/block/', admin_block_user, name='admin-block-user'),
    path('admin/user/<int:user_id>/reset/', admin_reset_user, name='admin-reset-user'),
    path('edit_profile/',edit_user_profile, name='edit_user_profile'),
    path('admin/undo_reset_user/<int:user_id>/', admin_undo_reset_user, name='admin_undo_reset_user'),
    path('admin/user_backup/<int:user_id>/', admin_user_backup, name='admin_user_backup'),
    path('admin/user/<int:user_id>/edit/', admin_edit_user,name='admin_edit_user'),
]
