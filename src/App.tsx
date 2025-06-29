import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import Header from './components/Header';
import EnvChecker from './components/EnvChecker';
import DebugPanel from './components/DebugPanel';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TreinoListPage from './pages/TreinoListPage';
import TreinoFormPage from './pages/TreinoFormPage';
import TreinoDetailPage from './pages/TreinoDetailPage';
import ExercicioLibraryPage from './pages/ExercicioLibraryPage';
import ProgressPage from './pages/ProgressPage';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <EnvChecker />
            <DebugPanel />
            <Routes>
              {/* Rota pública de autenticação */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Rotas protegidas */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Header />
                  <main className="pb-20">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/treinos" element={<TreinoListPage />} />
                      <Route path="/treinos/novo" element={<TreinoFormPage />} />
                      <Route path="/treinos/:id" element={<TreinoDetailPage />} />
                      <Route path="/exercicios" element={<ExercicioLibraryPage />} />
                      <Route path="/progresso" element={<ProgressPage />} />
                    </Routes>
                  </main>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;