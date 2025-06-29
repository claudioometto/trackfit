import React, { useMemo, useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Search, Filter } from 'lucide-react';

const ProgressPage: React.FC = () => {
  const { treinos } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Get unique exercises across all workouts
  const uniqueExercises = useMemo(() => {
    const exercises = new Set<string>();
    treinos.forEach(treino => {
      treino.exercicios.forEach(exercicio => {
        exercises.add(exercicio.name);
      });
    });
    return Array.from(exercises).sort();
  }, [treinos]);

  // Get progress data for the selected exercise
  const progressData = useMemo(() => {
    if (!selectedExercise) return [];

    const data: Array<{ date: string; weight: number; reps: number }> = [];

    // Sort treinos by date
    const sortedTreinos = [...treinos].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTreinos.forEach(treino => {
      const exercicio = treino.exercicios.find(e => e.name === selectedExercise);
      if (exercicio && exercicio.series.length > 0) {
        // Find the highest weight for this exercise in this workout
        const maxWeightSerie = [...exercicio.series].sort((a, b) => b.weight - a.weight)[0];
        
        // Format date for display
        const date = new Date(treino.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
        
        data.push({
          date,
          weight: maxWeightSerie.weight,
          reps: maxWeightSerie.reps
        });
      }
    });

    return data;
  }, [treinos, selectedExercise]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (progressData.length === 0) return { increase: 0, startWeight: 0, currentWeight: 0 };

    const startWeight = progressData[0].weight;
    const currentWeight = progressData[progressData.length - 1].weight;
    const increase = ((currentWeight - startWeight) / startWeight) * 100;

    return {
      increase,
      startWeight,
      currentWeight
    };
  }, [progressData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Progresso</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-900 dark:text-white"
            >
              <option value="">Selecione um exercício</option>
              {uniqueExercises.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>

          {selectedExercise && progressData.length > 0 && (
            <div className="flex-1 flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peso Inicial</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.startWeight} kg</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Peso Atual</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.currentWeight} kg</p>
              </div>
              <div className={`${stats.increase >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-3 rounded-lg flex-1`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">Evolução</p>
                <p className={`text-lg font-semibold ${stats.increase >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.increase >= 0 ? '+' : ''}{stats.increase.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedExercise ? (
        progressData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Evolução: {selectedExercise}
            </h2>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280" 
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    tick={{ fill: '#6B7280' }}
                    label={{ 
                      value: 'Peso (kg)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#6B7280' }
                    }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6'
                    }}
                    itemStyle={{ color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }}
                    name="Peso (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-100 dark:border-gray-700 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Sem dados de progresso</p>
            <p className="text-gray-600 dark:text-gray-400">
              Não encontramos registros de séries para {selectedExercise}
            </p>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 border border-gray-100 dark:border-gray-700 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Selecione um exercício</p>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha um exercício para visualizar seu progresso ao longo do tempo
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;