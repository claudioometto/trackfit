/*
  # Tabela de Perfis de Usuário

  1. Nova Tabela
    - `user_profiles` - Armazena informações completas do usuário
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `full_name` (text)
      - `birth_date` (date)
      - `gender` (text)
      - `height` (decimal, em cm)
      - `weight` (decimal, em kg)
      - `neck_measurement` (decimal, em cm)
      - `waist_measurement` (decimal, em cm)
      - `hip_measurement` (decimal, em cm, opcional)
      - `main_goal` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Políticas para usuários acessarem apenas seu próprio perfil

  3. Performance
    - Índices otimizados
    - Trigger para updated_at automático
*/

-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro')),
  height decimal(5,2) NOT NULL CHECK (height >= 100 AND height <= 250),
  weight decimal(5,2) NOT NULL CHECK (weight >= 30 AND weight <= 300),
  neck_measurement decimal(5,2) NOT NULL CHECK (neck_measurement >= 20 AND neck_measurement <= 60),
  waist_measurement decimal(5,2) NOT NULL CHECK (waist_measurement >= 50 AND waist_measurement <= 200),
  hip_measurement decimal(5,2) CHECK (hip_measurement >= 50 AND hip_measurement <= 200),
  main_goal text NOT NULL CHECK (main_goal IN ('emagrecer', 'ganhar_massa', 'manter', 'definir', 'resistencia')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis de usuário
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_main_goal ON user_profiles(main_goal);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta função será chamada por um trigger no auth.users
  -- Por enquanto, apenas retornamos NEW
  RETURN NEW;
END;
$$ language 'plpgsql';