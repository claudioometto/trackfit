import React from 'react';
import { Link } from 'react-router-dom';
import { Treino } from '../types';
import { Calendar, CheckCircle2, ChevronRight, Dumbbell, Clock, Play, Pause } from 'lucide-react';

interface TreinoCardProps {
  treino: Treino;
}

const TreinoCard: React.FC<TreinoCardProps> = ({ treino }) => {
  const formattedDate = new Date(treino.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusInfo = () => {
    if (treino.completed) {
      return {
        icon: <CheckCircle2 size={16} className="mr-1" />,
        text: 'Completo',
        color: 'text-green-500',
        duration: formatDuration(treino.duration)
      };
    } else if (treino.isPaused) {
      return {
        icon: <Pause size={16} className="mr-1" />,
        text: 'Pausado',
        color: 'text-orange-500',
        duration: formatDuration(treino.duration)
      };
    } else {
      return {
        icon: <Play size={16} className="mr-1" />,
        text: 'Em andamento',
        color: 'text-blue-500',
        duration: formatDuration(treino.duration)
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Link to={`/treinos/${treino.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{treino.name}</h3>
            <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span className="text-sm">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`flex items-center text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </span>
              {treino.duration > 0 && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-1">
                  <Clock size={12} className="mr-1" />
                  {statusInfo.duration}
                </div>
              )}
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Dumbbell size={16} />
          <span className="text-sm">{treino.exercicios.length} exercícios</span>
        </div>

        {treino.exercicios.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {treino.exercicios.slice(0, 3).map((exercicio) => (
                <span
                  key={exercicio.id}
                  className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full"
                >
                  {exercicio.name}
                </span>
              ))}
              {treino.exercicios.length > 3 && (
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full">
                  +{treino.exercicios.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TreinoCard;