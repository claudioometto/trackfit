import React, { useState, useEffect } from 'react';
import { Treino } from '../types';
import { useWorkout } from '../context/WorkoutContext';
import { Play, Pause, SkipBack, SkipForward, Clock, Edit3, Check, X } from 'lucide-react';

interface WorkoutTimerProps {
  treino: Treino;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ treino }) => {
  const { pauseTreino, resumeTreino, adjustTreinoTime, updateTreinoDuration } = useWorkout();
  const [currentTime, setCurrentTime] = useState(treino.duration);
  const [isEditing, setIsEditing] = useState(false);
  const [editTime, setEditTime] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!treino.completed && !treino.isPaused) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [treino.completed, treino.isPaused]);

  useEffect(() => {
    if (!treino.isPaused && !treino.completed) {
      const startTime = treino.pausedAt ? new Date(treino.pausedAt).getTime() : new Date(treino.startTime).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(treino.duration + elapsed);
    } else {
      setCurrentTime(treino.duration);
    }
  }, [treino.duration, treino.isPaused, treino.pausedAt, treino.startTime, treino.completed]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (treino.isPaused) {
      resumeTreino(treino.id);
    } else {
      pauseTreino(treino.id);
    }
  };

  const handleAdjustTime = (seconds: number) => {
    adjustTreinoTime(treino.id, seconds);
  };

  const handleEditTime = () => {
    setEditTime(formatTime(currentTime));
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    const parts = editTime.split(':');
    let totalSeconds = 0;

    if (parts.length === 2) {
      // MM:SS format
      totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      // HH:MM:SS format
      totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }

    if (!isNaN(totalSeconds) && totalSeconds >= 0) {
      updateTreinoDuration(treino.id, totalSeconds);
      setCurrentTime(totalSeconds);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTime('');
  };

  if (treino.completed) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <Clock size={20} className="text-green-600 dark:text-green-400 mr-2" />
          <span className="text-lg font-semibold text-green-800 dark:text-green-300">
            Treino concluído em {formatTime(treino.duration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            {treino.isPaused ? 'Pausado' : 'Em andamento'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                placeholder="MM:SS ou HH:MM:SS"
                className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleSaveTime}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                aria-label="Save time"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Cancel edit"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-bold text-blue-900 dark:text-blue-100">
                {formatTime(currentTime)}
              </span>
              <button
                onClick={handleEditTime}
                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                aria-label="Edit time"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => handleAdjustTime(-10)}
          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Subtract 10 seconds"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={handlePauseResume}
          className={`p-3 rounded-lg transition-colors ${
            treino.isPaused
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
          aria-label={treino.isPaused ? 'Resume workout' : 'Pause workout'}
        >
          {treino.isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>

        <button
          onClick={() => handleAdjustTime(10)}
          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Add 10 seconds"
        >
          <SkipForward size={18} />
        </button>
      </div>
    </div>
  );
};

export default WorkoutTimer;