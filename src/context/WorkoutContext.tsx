import React, { createContext, useContext, useState, useEffect } from 'react';
import { Treino, Exercicio, Serie } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutContextType {
  treinos: Treino[];
  loading: boolean;
  addTreino: (name: string) => Promise<void>;
  updateTreino: (treino: Treino) => Promise<void>;
  deleteTreino: (id: string) => Promise<void>;
  addExercicio: (treinoId: string, exercicio: Omit<Exercicio, 'id' | 'series'>) => Promise<void>;
  updateExercicio: (treinoId: string, exercicio: Exercicio) => Promise<void>;
  deleteExercicio: (treinoId: string, exercicioId: string) => Promise<void>;
  addSerie: (treinoId: string, exercicioId: string, serie: Omit<Serie, 'id' | 'completed'>) => Promise<void>;
  updateSerie: (treinoId: string, exercicioId: string, serie: Serie) => Promise<void>;
  deleteSerie: (treinoId: string, exercicioId: string, serieId: string) => Promise<void>;
  completeTreino: (id: string) => Promise<void>;
  pauseTreino: (id: string) => Promise<void>;
  resumeTreino: (id: string) => Promise<void>;
  adjustTreinoTime: (id: string, seconds: number) => Promise<void>;
  updateTreinoDuration: (id: string, duration: number) => Promise<void>;
  syncData: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Determinar se deve usar Supabase ou localStorage
  const useSupabase = isSupabaseConfigured() && user;

  // Load data when user changes or on mount
  useEffect(() => {
    if (useSupabase) {
      loadTreinos();
    } else {
      // Load from localStorage
      const savedTreinos = localStorage.getItem('treinos');
      setTreinos(savedTreinos ? JSON.parse(savedTreinos) : []);
      setLoading(false);
    }
  }, [user, useSupabase]);

  // Save to localStorage when treinos change (sempre como backup)
  useEffect(() => {
    localStorage.setItem('treinos', JSON.stringify(treinos));
  }, [treinos]);

  const loadTreinos = async () => {
    if (!useSupabase) return;

    try {
      setLoading(true);
      
      // Load treinos with exercicios and series
      const { data: treinosData, error: treinosError } = await supabase
        .from('treinos')
        .select(`
          *,
          exercicios (
            *,
            series (*)
          )
        `)
        .order('date', { ascending: false });

      if (treinosError) throw treinosError;

      // Transform data to match our types
      const transformedTreinos: Treino[] = treinosData?.map(treino => ({
        id: treino.id,
        name: treino.name,
        date: treino.date,
        completed: treino.completed,
        startTime: treino.start_time,
        endTime: treino.end_time || undefined,
        duration: treino.duration,
        isPaused: treino.is_paused,
        pausedAt: treino.paused_at || undefined,
        exercicios: treino.exercicios.map(exercicio => ({
          id: exercicio.id,
          name: exercicio.name,
          muscleGroup: exercicio.muscle_group,
          notes: exercicio.notes || undefined,
          series: exercicio.series.map(serie => ({
            id: serie.id,
            weight: serie.weight,
            reps: serie.reps,
            completed: serie.completed,
            notes: serie.notes || undefined,
          }))
        }))
      })) || [];

      setTreinos(transformedTreinos);
    } catch (error) {
      console.error('Error loading treinos:', error);
      // Fallback to localStorage
      const savedTreinos = localStorage.getItem('treinos');
      setTreinos(savedTreinos ? JSON.parse(savedTreinos) : []);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    if (useSupabase) {
      await loadTreinos();
    }
  };

  const addTreino = async (name: string) => {
    const now = new Date().toISOString();
    const newTreino: Treino = {
      id: uuidv4(),
      name,
      date: now,
      exercicios: [],
      completed: false,
      startTime: now,
      duration: 0,
      isPaused: false,
    };

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('treinos')
          .insert({
            id: newTreino.id,
            user_id: user!.id,
            name: newTreino.name,
            date: newTreino.date,
            completed: newTreino.completed,
            start_time: newTreino.startTime,
            duration: newTreino.duration,
            is_paused: newTreino.isPaused,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding treino:', error);
        // Continue with local state update
      }
    }

    setTreinos([newTreino, ...treinos]);
  };

  const updateTreino = async (treino: Treino) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('treinos')
          .update({
            name: treino.name,
            date: treino.date,
            completed: treino.completed,
            start_time: treino.startTime,
            end_time: treino.endTime || null,
            duration: treino.duration,
            is_paused: treino.isPaused,
            paused_at: treino.pausedAt || null,
          })
          .eq('id', treino.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating treino:', error);
      }
    }

    setTreinos(treinos.map(t => (t.id === treino.id ? treino : t)));
  };

  const deleteTreino = async (id: string) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('treinos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting treino:', error);
      }
    }

    setTreinos(treinos.filter(t => t.id !== id));
  };

  const addExercicio = async (treinoId: string, exercicio: Omit<Exercicio, 'id' | 'series'>) => {
    const newExercicio: Exercicio = {
      id: uuidv4(),
      ...exercicio,
      series: [],
    };

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('exercicios')
          .insert({
            id: newExercicio.id,
            treino_id: treinoId,
            name: newExercicio.name,
            muscle_group: newExercicio.muscleGroup,
            notes: newExercicio.notes || null,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding exercicio:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: [...t.exercicios, newExercicio],
          };
        }
        return t;
      })
    );
  };

  const updateExercicio = async (treinoId: string, exercicio: Exercicio) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('exercicios')
          .update({
            name: exercicio.name,
            muscle_group: exercicio.muscleGroup,
            notes: exercicio.notes || null,
          })
          .eq('id', exercicio.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating exercicio:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: t.exercicios.map(e => (e.id === exercicio.id ? exercicio : e)),
          };
        }
        return t;
      })
    );
  };

  const deleteExercicio = async (treinoId: string, exercicioId: string) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('exercicios')
          .delete()
          .eq('id', exercicioId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting exercicio:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: t.exercicios.filter(e => e.id !== exercicioId),
          };
        }
        return t;
      })
    );
  };

  const addSerie = async (treinoId: string, exercicioId: string, serie: Omit<Serie, 'id' | 'completed'>) => {
    const newSerie: Serie = {
      id: uuidv4(),
      ...serie,
      completed: false,
    };

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('series')
          .insert({
            id: newSerie.id,
            exercicio_id: exercicioId,
            weight: newSerie.weight,
            reps: newSerie.reps,
            completed: newSerie.completed,
            notes: newSerie.notes || null,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding serie:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: t.exercicios.map(e => {
              if (e.id === exercicioId) {
                return {
                  ...e,
                  series: [...e.series, newSerie],
                };
              }
              return e;
            }),
          };
        }
        return t;
      })
    );
  };

  const updateSerie = async (treinoId: string, exercicioId: string, serie: Serie) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('series')
          .update({
            weight: serie.weight,
            reps: serie.reps,
            completed: serie.completed,
            notes: serie.notes || null,
          })
          .eq('id', serie.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating serie:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: t.exercicios.map(e => {
              if (e.id === exercicioId) {
                return {
                  ...e,
                  series: e.series.map(s => (s.id === serie.id ? serie : s)),
                };
              }
              return e;
            }),
          };
        }
        return t;
      })
    );
  };

  const deleteSerie = async (treinoId: string, exercicioId: string, serieId: string) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('series')
          .delete()
          .eq('id', serieId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting serie:', error);
      }
    }

    setTreinos(
      treinos.map(t => {
        if (t.id === treinoId) {
          return {
            ...t,
            exercicios: t.exercicios.map(e => {
              if (e.id === exercicioId) {
                return {
                  ...e,
                  series: e.series.filter(s => s.id !== serieId),
                };
              }
              return e;
            }),
          };
        }
        return t;
      })
    );
  };

  const completeTreino = async (id: string) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino) return;

    const now = new Date().toISOString();
    let finalDuration = treino.duration;
    
    // If not paused, add the time since start/resume
    if (!treino.isPaused) {
      const lastActiveTime = treino.pausedAt ? new Date(treino.pausedAt).getTime() : new Date(treino.startTime).getTime();
      const additionalTime = Math.floor((Date.now() - lastActiveTime) / 1000);
      finalDuration += additionalTime;
    }

    const updatedTreino = {
      ...treino,
      completed: true,
      endTime: now,
      duration: finalDuration,
      isPaused: false,
    };

    await updateTreino(updatedTreino);
  };

  const pauseTreino = async (id: string) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino || treino.completed) return;

    const now = new Date().toISOString();
    let newDuration = treino.duration;
    
    // Add elapsed time since last resume/start
    if (!treino.isPaused) {
      const lastActiveTime = treino.pausedAt ? new Date(treino.pausedAt).getTime() : new Date(treino.startTime).getTime();
      const elapsedTime = Math.floor((Date.now() - lastActiveTime) / 1000);
      newDuration += elapsedTime;
    }

    const updatedTreino = {
      ...treino,
      isPaused: true,
      pausedAt: now,
      duration: newDuration,
    };

    await updateTreino(updatedTreino);
  };

  const resumeTreino = async (id: string) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino || treino.completed) return;

    const updatedTreino = {
      ...treino,
      isPaused: false,
      pausedAt: new Date().toISOString(),
    };

    await updateTreino(updatedTreino);
  };

  const adjustTreinoTime = async (id: string, seconds: number) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino) return;

    const updatedTreino = {
      ...treino,
      duration: Math.max(0, treino.duration + seconds),
    };

    await updateTreino(updatedTreino);
  };

  const updateTreinoDuration = async (id: string, duration: number) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino) return;

    const updatedTreino = {
      ...treino,
      duration: Math.max(0, duration),
    };

    await updateTreino(updatedTreino);
  };

  return (
    <WorkoutContext.Provider
      value={{
        treinos,
        loading,
        addTreino,
        updateTreino,
        deleteTreino,
        addExercicio,
        updateExercicio,
        deleteExercicio,
        addSerie,
        updateSerie,
        deleteSerie,
        completeTreino,
        pauseTreino,
        resumeTreino,
        adjustTreinoTime,
        updateTreinoDuration,
        syncData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};