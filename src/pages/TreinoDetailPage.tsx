import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import ExercicioCard from '../components/ExercicioCard';
import ExercicioForm from '../components/ExercicioForm';
import WorkoutTimer from '../components/WorkoutTimer';
import { ArrowLeft, Calendar, CheckCircle, Clock, Dumbbell, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Exercicio } from '../types';

const TreinoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { treinos, updateTreino, deleteTreino, completeTreino, addExercicio, updateExercicio } = useWorkout();
  
  const [showExercicioForm, setShowExercicioForm] = useState(false);
  const [editingExercicio, setEditingExercicio] = useState<Exercicio | null>(null);

  if (!id) {
    navigate('/treinos');
    return null;
  }

  const treino = treinos.find(t => t.id === id);

  if (!treino) {
    navigate('/treinos');
    return null;
  }

  const formattedDate = new Date(treino.date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCompleteTreino = () => {
    if (window.confirm('Marcar este treino como concluído?')) {
      completeTreino(id);
    }
  };

  const handleDeleteTreino = () => {
    if (window.confirm(`Tem certeza que deseja excluir o treino ${treino.name}?`)) {
      deleteTreino(id);
      navigate('/treinos');
    }
  };

  const handleAddExercicio = (exercicio: Omit<Exercicio, 'id' | 'series'>) => {
    addExercicio(id, exercicio);
    setShowExercicioForm(false);
  };

  const handleUpdateExercicio = (exercicio: Omit<Exercicio, 'series'>) => {
    if (editingExercicio) {
      updateExercicio(id, {
        ...exercicio,
        id: editingExercicio.id,
        series: editingExercicio.series,
      });
      setEditingExercicio(null);
    }
  };

  const handleEditExercicio = (exercicio: Exercicio) => {
    setEditingExercicio(exercicio);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/treinos')} 
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Voltar para Treinos
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{treino.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span className="text-sm">{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {!treino.completed ? (
              <button
                onClick={handleCompleteTreino}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CheckCircle size={18} className="mr-2" />
                Completar
              </button>
            ) : (
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg">
                <CheckCircle size={18} className="mr-2" />
                Completo
              </div>
            )}
            
            <button
              onClick={handleDeleteTreino}
              className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Workout Timer */}
      <div className="mb-6">
        <WorkoutTimer treino={treino} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Dumbbell size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
          Exercícios ({treino.exercicios.length})
        </h2>
        
        <button
          onClick={() => setShowExercicioForm(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          Adicionar Exercício
        </button>
      </div>

      {treino.exercicios.length > 0 ? (
        <div className="space-y-4 mb-8">
          {treino.exercicios.map((exercicio) => (
            <ExercicioCard
              key={exercicio.id}
              treinoId={id}
              exercicio={exercicio}
              onEdit={() => handleEditExercicio(exercicio)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <Dumbbell size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 mb-2">Nenhum exercício adicionado</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece adicionando exercícios ao seu treino
          </p>
          <button
            onClick={() => setShowExercicioForm(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Adicionar Exercício
          </button>
        </div>
      )}

      {showExercicioForm && (
        <ExercicioForm
          onSubmit={handleAddExercicio}
          onCancel={() => setShowExercicioForm(false)}
        />
      )}

      {editingExercicio && (
        <ExercicioForm
          onSubmit={handleUpdateExercicio}
          onCancel={() => setEditingExercicio(null)}
          initialData={editingExercicio}
          isEditing
        />
      )}
    </div>
  );
};

export default TreinoDetailPage;