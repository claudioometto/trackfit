export interface Serie {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface Exercicio {
  id: string;
  name: string;
  muscleGroup: string;
  series: Serie[];
  notes?: string;
}

export interface Treino {
  id: string;
  name: string;
  date: string;
  exercicios: Exercicio[];
  completed: boolean;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  isPaused: boolean;
  pausedAt?: string;
}

export type MuscleGroup = 
  | 'peito' 
  | 'costas' 
  | 'pernas' 
  | 'ombros' 
  | 'biceps' 
  | 'triceps' 
  | 'abdomen' 
  | 'gluteos' 
  | 'outros';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  birth_date: string;
  gender: 'masculino' | 'feminino' | 'outro';
  height: number; // cm
  weight: number; // kg
  neck_measurement: number; // cm
  waist_measurement: number; // cm
  hip_measurement?: number; // cm (opcional)
  main_goal: 'emagrecer' | 'ganhar_massa' | 'manter' | 'definir' | 'resistencia';
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: 'masculino' | 'feminino' | 'outro';
  height: number;
  weight: number;
  neckMeasurement: number;
  waistMeasurement: number;
  hipMeasurement?: number;
  mainGoal: 'emagrecer' | 'ganhar_massa' | 'manter' | 'definir' | 'resistencia';
}