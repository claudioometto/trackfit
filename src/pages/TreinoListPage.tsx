import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import TreinoCard from '../components/TreinoCard';
import { Dumbbell, PlusCircle, Search } from 'lucide-react';

const TreinoListPage: React.FC = () => {
  const { treinos } = useWorkout();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTreinos = treinos.filter(treino => 
    treino.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Treinos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar treinos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <Link 
            to="/treinos/novo" 
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Novo Treino
          </Link>
        </div>
      </div>

      {filteredTreinos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreinos.map((treino) => (
            <TreinoCard key={treino.id} treino={treino} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
          {searchTerm ? (
            <>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Nenhum treino encontrado</p>
              <p className="text-gray-600 dark:text-gray-400">
                Não encontramos treinos com o termo "{searchTerm}"
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Você ainda não possui treinos</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Comece adicionando seu primeiro treino
              </p>
              <Link 
                to="/treinos/novo" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors"
              >
                <PlusCircle size={20} className="mr-2" />
                Criar Treino
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TreinoListPage;