import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import TreinoCard from '../components/TreinoCard';
import { Dumbbell, PlusCircle, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const { treinos } = useWorkout();
  
  // Get the most recent treinos
  const recentTreinos = [...treinos]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg p-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo ao TrackFit</h1>
            <p className="text-lg mb-6 text-blue-100">
              Acompanhe seus treinos, registre seus exercícios e veja seu progresso ao longo do tempo. 
              Comece adicionando um novo treino hoje!
            </p>
            <Link 
              to="/treinos/novo" 
              className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-blue-50 transition-colors"
            >
              <PlusCircle size={20} className="mr-2" />
              Adicionar Treino
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Treinos Recentes
            </h2>
            <Link 
              to="/treinos" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              Ver todos
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {recentTreinos.length > 0 ? (
            <div className="space-y-4">
              {recentTreinos.map((treino) => (
                <TreinoCard key={treino.id} treino={treino} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Você ainda não possui treinos cadastrados</p>
              <Link 
                to="/treinos/novo" 
                className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <PlusCircle size={16} className="mr-1" />
                Adicionar Treino
              </Link>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Estatísticas Rápidas
            </h2>
            <Link 
              to="/progresso" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              Ver detalhes
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Treinos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{treinos.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Treinos Completos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {treinos.filter(t => t.completed).length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Exercícios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {treinos.reduce((total, treino) => total + treino.exercicios.length, 0)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Séries Registradas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {treinos.reduce(
                  (total, treino) => total + treino.exercicios.reduce(
                    (exerciseTotal, exercicio) => exerciseTotal + exercicio.series.length, 0
                  ), 0
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Acesso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/treinos/novo" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
              <PlusCircle size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Novo Treino</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adicionar treino</p>
            </div>
          </Link>
          
          <Link to="/exercicios" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
              <Dumbbell size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Exercícios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ver biblioteca</p>
            </div>
          </Link>
          
          <Link to="/treinos" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
              <Calendar size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Histórico</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Todos os treinos</p>
            </div>
          </Link>
          
          <Link to="/progresso" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
              <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Progresso</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ver evolução</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;