import React, { useState, useMemo } from 'react';
import { Exercicio, Serie } from '../types';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, Weight, Repeat } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface ExercicioCardProps {
  treinoId: string;
  exercicio: Exercicio;
  onEdit: () => void;
}

const ExercicioCard: React.FC<ExercicioCardProps> = ({ treinoId, exercicio, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteExercicio, addSerie, updateSerie, deleteSerie } = useWorkout();
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('');

  const stats = useMemo(() => {
    if (exercicio.series.length === 0) {
      return { avgWeight: 0, avgReps: 0 };
    }

    const totalWeight = exercicio.series.reduce((sum, serie) => sum + serie.weight, 0);
    const totalReps = exercicio.series.reduce((sum, serie) => sum + serie.reps, 0);
    
    return {
      avgWeight: Number((totalWeight / exercicio.series.length).toFixed(1)),
      avgReps: Math.round(totalReps / exercicio.series.length)
    };
  }, [exercicio.series]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDeleteExercicio = () => {
    if (window.confirm(`Tem certeza que deseja excluir o exercício ${exercicio.name}?`)) {
      deleteExercicio(treinoId, exercicio.id);
    }
  };

  const handleAddSerie = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight && newReps) {
      addSerie(treinoId, exercicio.id, {
        weight: parseFloat(newWeight),
        reps: parseInt(newReps, 10),
        notes: '',
      });
      setNewWeight('');
      setNewReps('');
    }
  };

  const handleToggleSerieCompleted = (serie: Serie) => {
    updateSerie(treinoId, exercicio.id, {
      ...serie,
      completed: !serie.completed,
    });
  };

  const handleDeleteSerie = (serieId: string) => {
    deleteSerie(treinoId, exercicio.id, serieId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exercicio.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercicio.muscleGroup}</p>
          {exercicio.series.length > 0 && (
            <div className="flex gap-4 mt-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Weight size={14} className="mr-1" />
                {stats.avgWeight} kg
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Repeat size={14} className="mr-1" />
                {stats.avgReps} reps
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            aria-label="Edit exercise"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={handleDeleteExercicio}
            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Delete exercise"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={toggleExpand}
            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            aria-label={isExpanded ? "Collapse exercise details" : "Expand exercise details"}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Séries</h4>
            {exercicio.series.length > 0 ? (
              <div className="space-y-2">
                {exercicio.series.map((serie) => (
                  <div 
                    key={serie.id} 
                    className={`flex items-center justify-between p-2 rounded ${
                      serie.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30' 
                        : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={serie.completed}
                        onChange={() => handleToggleSerieCompleted(serie)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{serie.weight} kg</span>
                        <span className="text-gray-600 dark:text-gray-400 mx-2">×</span>
                        <span className="text-gray-900 dark:text-white font-medium">{serie.reps} reps</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSerie(serie.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete set"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhuma série adicionada</p>
            )}
          </div>

          <form onSubmit={handleAddSerie} className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adicionar série</h4>
            <div className="flex gap-2">
              <div className="w-1/3">
                <input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Peso (kg)"
                  step="0.5"
                  min="0"
                  required
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="w-1/3">
                <input
                  type="number"
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  placeholder="Repetições"
                  min="1"
                  required
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm flex items-center transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Adicionar
              </button>
            </div>
          </form>

          {exercicio.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{exercicio.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExercicioCard;