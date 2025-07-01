
from datetime import datetime, time
import pytz

class GameTimingManager:
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        
        # Game configurations with lock and open times
        self.games = {
            'jaipur king': {
                'lock_time': time(16, 20),  # 4:20 PM
                'open_time': time(17, 0),   # 5:00 PM
                'is_continuous': False
            },
            'faridabad': {
                'lock_time': time(17, 50),  # 5:50 PM
                'open_time': time(19, 0),   # 7:00 PM
                'is_continuous': False
            },
            'ghaziabad': {
                'lock_time': time(20, 30),  # 8:30 PM
                'open_time': time(21, 30),  # 9:30 PM
                'is_continuous': False
            },
            'gali': {
                'lock_time': time(23, 0),   # 11:00 PM
                'open_time': time(23, 59),  # 11:59 PM
                'is_continuous': False
            },
            'disawer': {
                'lock_time': time(2, 30),   # 2:30 AM
                'open_time': time(7, 0),    # 7:00 AM
                'is_continuous': False
            },
            'diamond king': {
                'open_time': time(10, 0),   # 10:00 AM
                'close_time': time(23, 59), # 11:59 PM
                'is_continuous': True,
                'interval_hours': 3,        # Every 3 hours
                'lock_before_minutes': 10,  # Lock 10 min before
                'open_after_minutes': 5     # Open 5 min after
            }
        }
    
    def get_current_time(self):
        """Get current IST time"""
        return datetime.now(self.ist).time()
    
    def is_game_locked(self, game_name):
        """Check if game is currently locked"""
        game_name = game_name.lower()
        if game_name not in self.games:
            return True
        
        current_time = self.get_current_time()
        game_config = self.games[game_name]
        
        if game_name == 'diamond king':
            return self._is_diamond_king_locked(current_time)
        else:
            return self._is_regular_game_locked(game_name, current_time)
    
    def _is_regular_game_locked(self, game_name, current_time):
        """Check if regular game is locked"""
        game_config = self.games[game_name]
        lock_time = game_config['lock_time']
        open_time = game_config['open_time']
        
        # Handle overnight games (like disawer)
        if game_name == 'disawer':
            # If current time is between 2:30 AM and 7:00 AM, game is locked
            if time(2, 30) <= current_time <= time(7, 0):
                return True
            # If current time is after 7:00 AM, check if before next lock time
            return False
        
        # For other games, check if current time is between lock and open
        if lock_time <= current_time <= open_time:
            return True
        
        return False
    
    def _is_diamond_king_locked(self, current_time):
        """Check if diamond king is locked (every 3 hours with 10 min lock, 5 min delay)"""
        # Diamond King runs every 3 hours from 10:00 AM to 11:59 PM
        start_hour = 10  # 10:00 AM
        end_hour = 23    # 11:59 PM
        
        current_hour = current_time.hour
        current_minute = current_time.minute
        
        # Check if we're in operating hours
        if current_hour < start_hour or current_hour > end_hour:
            return True
        
        # Calculate the current 3-hour cycle
        cycle_start_hour = start_hour + ((current_hour - start_hour) // 3) * 3
        
        # Check if we're in lock period (10 minutes before the hour)
        if current_hour == cycle_start_hour and current_minute >= 50:
            return True
        
        # Check if we're in delay period (5 minutes after the hour)
        next_cycle_hour = cycle_start_hour + 3
        if current_hour == next_cycle_hour and current_minute <= 5:
            return True
        
        return False
    
    def get_next_open_time(self, game_name):
        """Get next opening time for a game"""
        game_name = game_name.lower()
        if game_name not in self.games:
            return None
        
        game_config = self.games[game_name]
        
        if game_name == 'diamond king':
            return self._get_diamond_king_next_open()
        else:
            return game_config['open_time'].strftime('%I:%M %p')
    
    def _get_diamond_king_next_open(self):
        """Get next diamond king opening time"""
        current_time = self.get_current_time()
        current_hour = current_time.hour
        
        # Find next 3-hour cycle
        start_hour = 10
        next_cycle = start_hour + ((current_hour - start_hour) // 3 + 1) * 3
        
        if next_cycle > 23:
            next_cycle = 10  # Next day
        
        return time(next_cycle, 5).strftime('%I:%M %p')  # 5 minutes after the hour
    
    def get_game_status(self, game_name):
        """Get complete game status"""
        is_locked = self.is_game_locked(game_name)
        next_open = self.get_next_open_time(game_name)
        
        return {
            'game': game_name,
            'is_locked': is_locked,
            'status': 'locked' if is_locked else 'open',
            'next_open_time': next_open
        }
    
    def get_all_games_status(self):
        """Get status of all games"""
        status_list = []
        for game_name in self.games.keys():
            status_list.append(self.get_game_status(game_name))
        return status_list
