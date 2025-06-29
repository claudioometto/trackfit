import React, { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Dumbbell, Search, Filter } from 'lucide-react';

interface ExercicioCount {
  name: string;
  muscleGroup: string;
  count: number;
}

const ExercicioLibraryPage: React.FC = () => {
  const { treinos } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');

  const exercicios = useMemo(() => {
    const exercicioMap = new Map<string, ExercicioCount>();

    treinos.forEach(treino => {
      treino.exercicios.forEach(exercicio => {
        const key = exercicio.name.toLowerCase();
        if (exercicioMap.has(key)) {
          const current = exercicioMap.get(key)!;
          exercicioMap.set(key, {
            ...current,
            count: current.count + 1
          });
        } else {
          exercicioMap.set(key, {
            name: exercicio.name,
            muscleGroup: exercicio.muscleGroup,
            count: 1
          });
        }
      });
    });

    return Array.from(exercicioMap.values());
  }, [treinos]);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    exercicios.forEach(exercicio => {
      groups.add(exercicio.muscleGroup);
    });
    return Array.from(groups).sort();
  }, [exercicios]);

  const filteredExercicios = useMemo(() => {
    return exercicios.filter(exercicio => {
      const nameMatches = exercicio.name.toLowerCase().includes(searchTerm.toLowerCase());
      const groupMatches = selectedMuscleGroup ? exercicio.muscleGroup === selectedMuscleGroup : true;
      return nameMatches && groupMatches;
    });
  }, [exercicios, searchTerm, selectedMuscleGroup]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Biblioteca de Exercícios</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar exercícios..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="md:w-1/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-900 dark:text-white"
            >
              <option value="">Todos os grupos musculares</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredExercicios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercicios.map((exercicio, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exercicio.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">{exercicio.muscleGroup}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                  <Dumbbell size={14} className="mr-1" />
                  {exercicio.count} {exercicio.count === 1 ? 'treino' : 'treinos'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Nenhum exercício encontrado</p>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedMuscleGroup 
              ? 'Tente modificar seus filtros de busca'
              : 'Adicione exercícios aos seus treinos para começar a construir sua biblioteca'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExercicioLibraryPage;