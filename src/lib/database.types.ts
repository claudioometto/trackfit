export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      treinos: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          completed: boolean
          start_time: string
          end_time: string | null
          duration: number
          is_paused: boolean
          paused_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date?: string
          completed?: boolean
          start_time?: string
          end_time?: string | null
          duration?: number
          is_paused?: boolean
          paused_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          completed?: boolean
          start_time?: string
          end_time?: string | null
          duration?: number
          is_paused?: boolean
          paused_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exercicios: {
        Row: {
          id: string
          treino_id: string
          name: string
          muscle_group: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          treino_id: string
          name: string
          muscle_group: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          treino_id?: string
          name?: string
          muscle_group?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      series: {
        Row: {
          id: string
          exercicio_id: string
          weight: number
          reps: number
          completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exercicio_id: string
          weight: number
          reps: number
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exercicio_id?: string
          weight?: number
          reps?: number
          completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          birth_date: string
          gender: 'masculino' | 'feminino' | 'outro'
          height: number
          weight: number
          neck_measurement: number
          waist_measurement: number
          hip_measurement: number | null
          main_goal: 'emagrecer' | 'ganhar_massa' | 'manter' | 'definir' | 'resistencia'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          birth_date: string
          gender: 'masculino' | 'feminino' | 'outro'
          height: number
          weight: number
          neck_measurement: number
          waist_measurement: number
          hip_measurement?: number | null
          main_goal: 'emagrecer' | 'ganhar_massa' | 'manter' | 'definir' | 'resistencia'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          birth_date?: string
          gender?: 'masculino' | 'feminino' | 'outro'
          height?: number
          weight?: number
          neck_measurement?: number
          waist_measurement?: number
          hip_measurement?: number | null
          main_goal?: 'emagrecer' | 'ganhar_massa' | 'manter' | 'definir' | 'resistencia'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}