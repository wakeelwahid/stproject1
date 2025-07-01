
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLock, faCheck } from '@fortawesome/free-solid-svg-icons';
import API from '../../api/axiosSetup';
import './GameTimeTable.css';

const GameTimeTable = () => {
  const [gameSchedule, setGameSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  const gameTimings = [
    {
      name: 'JAIPUR KING',
      lockTime: '4:20 PM',
      openTime: '5:00 PM',
      type: 'daily'
    },
    {
      name: 'FARIDABAD', 
      lockTime: '5:50 PM',
      openTime: '7:00 PM',
      type: 'daily'
    },
    {
      name: 'GHAZIABAD',
      lockTime: '8:30 PM', 
      openTime: '9:30 PM',
      type: 'daily'
    },
    {
      name: 'GALI',
      lockTime: '11:00 PM',
      openTime: '11:59 PM',
      type: 'daily'
    },
    {
      name: 'DISAWER',
      lockTime: '2:30 AM',
      openTime: '7:00 AM',
      type: 'daily'
    },
    {
      name: 'DIAMOND KING',
      lockTime: '10 min before',
      openTime: 'Every 3 hours (10:00 AM - 11:59 PM)',
      type: 'multiple',
      note: 'Opens 5 minutes after each 3-hour cycle'
    }
  ];

  const fetchCurrentTime = async () => {
    try {
      const response = await API.get('game-status/');
      setCurrentTime(response.data.current_time);
      
      // Update schedule with current status
      const updatedSchedule = gameTimings.map(game => {
        const gameStatus = response.data.games.find(
          g => g.game.toLowerCase().replace(' ', '') === game.name.toLowerCase().replace(' ', '')
        );
        
        return {
          ...game,
          isLocked: gameStatus ? gameStatus.is_locked : false,
          nextOpenTime: gameStatus ? gameStatus.next_open_time : null
        };
      });
      
      setGameSchedule(updatedSchedule);
    } catch (error) {
      console.error('Error fetching game status:', error);
      setGameSchedule(gameTimings);
    }
  };

  useEffect(() => {
    fetchCurrentTime();
    const interval = setInterval(fetchCurrentTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h2>Game Schedule</h2>
        {currentTime && (
          <div className="current-time">
            <FontAwesomeIcon icon={faClock} />
            <span>{currentTime} IST</span>
          </div>
        )}
      </div>

      <div className="timetable-grid">
        {gameSchedule.map((game, index) => (
          <div key={index} className={`game-schedule-card ${game.isLocked ? 'locked' : 'open'}`}>
            <div className="game-name">
              <FontAwesomeIcon 
                icon={game.isLocked ? faLock : faCheck} 
                className={`status-icon ${game.isLocked ? 'locked' : 'open'}`}
              />
              <span>{game.name}</span>
            </div>
            
            <div className="timing-info">
              <div className="timing-row">
                <span className="timing-label">Lock Time:</span>
                <span className="timing-value">{game.lockTime}</span>
              </div>
              <div className="timing-row">
                <span className="timing-label">Open Time:</span>
                <span className="timing-value">{game.openTime}</span>
              </div>
            </div>

            {game.isLocked && game.nextOpenTime && (
              <div className="next-opening">
                <span className="next-label">Next Opening:</span>
                <span className="next-time">{game.nextOpenTime}</span>
              </div>
            )}

            {game.note && (
              <div className="game-note">
                <small>{game.note}</small>
              </div>
            )}

            <div className={`status-badge ${game.isLocked ? 'locked' : 'open'}`}>
              {game.isLocked ? 'LOCKED' : 'OPEN'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameTimeTable;
