/*
  # Corrigir estrutura do banco e vincular dados aos usuários

  1. Verificações e Correções
    - Verificar se tabelas existem
    - Corrigir relacionamentos com usuários
    - Garantir que todos os dados sejam vinculados aos usuários

  2. Tabelas Principais
    - `user_profiles` - Perfis completos dos usuários
    - `treinos` - Treinos vinculados aos usuários
    - `exercicios` - Exercícios vinculados aos treinos
    - `series` - Séries vinculadas aos exercícios

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários acessarem apenas seus dados
    - Relacionamentos com CASCADE DELETE

  4. Performance
    - Índices otimizados
    - Triggers para updated_at automático
*/

-- Verificar e criar função de updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. TABELA DE PERFIS DE USUÁRIO
-- Criar tabela de perfis se não existir
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

-- 2. TABELA DE TREINOS
-- Verificar se a coluna user_id existe na tabela treinos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'treinos' AND column_name = 'user_id'
  ) THEN
    -- Se a tabela treinos existe mas não tem user_id, adicionar
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treinos') THEN
      ALTER TABLE treinos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      -- Atualizar registros existentes (se houver) - remover dados órfãos
      DELETE FROM treinos WHERE user_id IS NULL;
      ALTER TABLE treinos ALTER COLUMN user_id SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Criar tabela de treinos se não existir
CREATE TABLE IF NOT EXISTS treinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  date timestamptz DEFAULT now() NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  start_time timestamptz DEFAULT now() NOT NULL,
  end_time timestamptz,
  duration integer DEFAULT 0 NOT NULL,
  is_paused boolean DEFAULT false NOT NULL,
  paused_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. TABELA DE EXERCÍCIOS
-- Criar tabela de exercícios se não existir
CREATE TABLE IF NOT EXISTS exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_id uuid REFERENCES treinos(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  muscle_group text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. TABELA DE SÉRIES
-- Criar tabela de séries se não existir
CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio_id uuid REFERENCES exercicios(id) ON DELETE CASCADE NOT NULL,
  weight decimal(5,2) NOT NULL,
  reps integer NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

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

-- Políticas para treinos
DROP POLICY IF EXISTS "Users can view own treinos" ON treinos;
DROP POLICY IF EXISTS "Users can insert own treinos" ON treinos;
DROP POLICY IF EXISTS "Users can update own treinos" ON treinos;
DROP POLICY IF EXISTS "Users can delete own treinos" ON treinos;

CREATE POLICY "Users can view own treinos"
  ON treinos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treinos"
  ON treinos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treinos"
  ON treinos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own treinos"
  ON treinos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para exercicios
DROP POLICY IF EXISTS "Users can view own exercicios" ON exercicios;
DROP POLICY IF EXISTS "Users can insert own exercicios" ON exercicios;
DROP POLICY IF EXISTS "Users can update own exercicios" ON exercicios;
DROP POLICY IF EXISTS "Users can delete own exercicios" ON exercicios;

CREATE POLICY "Users can view own exercicios"
  ON exercicios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treinos 
      WHERE treinos.id = exercicios.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercicios"
  ON exercicios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM treinos 
      WHERE treinos.id = exercicios.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercicios"
  ON exercicios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treinos 
      WHERE treinos.id = exercicios.treino_id 
      AND treinos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM treinos 
      WHERE treinos.id = exercicios.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercicios"
  ON exercicios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treinos 
      WHERE treinos.id = exercicios.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

-- Políticas para series
DROP POLICY IF EXISTS "Users can view own series" ON series;
DROP POLICY IF EXISTS "Users can insert own series" ON series;
DROP POLICY IF EXISTS "Users can update own series" ON series;
DROP POLICY IF EXISTS "Users can delete own series" ON series;

CREATE POLICY "Users can view own series"
  ON series
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercicios 
      JOIN treinos ON treinos.id = exercicios.treino_id
      WHERE exercicios.id = series.exercicio_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own series"
  ON series
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercicios 
      JOIN treinos ON treinos.id = exercicios.treino_id
      WHERE exercicios.id = series.exercicio_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own series"
  ON series
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercicios 
      JOIN treinos ON treinos.id = exercicios.treino_id
      WHERE exercicios.id = series.exercicio_id 
      AND treinos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercicios 
      JOIN treinos ON treinos.id = exercicios.treino_id
      WHERE exercicios.id = series.exercicio_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own series"
  ON series
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercicios 
      JOIN treinos ON treinos.id = exercicios.treino_id
      WHERE exercicios.id = series.exercicio_id 
      AND treinos.user_id = auth.uid()
    )
  );

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_main_goal ON user_profiles(main_goal);

CREATE INDEX IF NOT EXISTS idx_treinos_user_id ON treinos(user_id);
CREATE INDEX IF NOT EXISTS idx_treinos_date ON treinos(date);
CREATE INDEX IF NOT EXISTS idx_treinos_completed ON treinos(completed);

CREATE INDEX IF NOT EXISTS idx_exercicios_treino_id ON exercicios(treino_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_muscle_group ON exercicios(muscle_group);

CREATE INDEX IF NOT EXISTS idx_series_exercicio_id ON series(exercicio_id);
CREATE INDEX IF NOT EXISTS idx_series_completed ON series(completed);

-- 8. TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_treinos_updated_at ON treinos;
DROP TRIGGER IF EXISTS update_exercicios_updated_at ON exercicios;
DROP TRIGGER IF EXISTS update_series_updated_at ON series;

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treinos_updated_at 
  BEFORE UPDATE ON treinos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercicios_updated_at 
  BEFORE UPDATE ON exercicios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at 
  BEFORE UPDATE ON series 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. FUNÇÃO PARA VERIFICAR RLS (para debug)
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS boolean AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = table_name;
  
  RETURN COALESCE(rls_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE user_profiles IS 'Perfis completos dos usuários com dados pessoais e corporais';
COMMENT ON TABLE treinos IS 'Treinos de musculação vinculados aos usuários';
COMMENT ON TABLE exercicios IS 'Exercícios específicos de cada treino';
COMMENT ON TABLE series IS 'Séries individuais de cada exercício com peso e repetições';

-- 11. VERIFICAÇÃO FINAL
DO $$
BEGIN
  -- Verificar se todas as tabelas foram criadas
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE EXCEPTION 'Tabela user_profiles não foi criada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treinos') THEN
    RAISE EXCEPTION 'Tabela treinos não foi criada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercicios') THEN
    RAISE EXCEPTION 'Tabela exercicios não foi criada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series') THEN
    RAISE EXCEPTION 'Tabela series não foi criada';
  END IF;
  
  RAISE NOTICE 'Todas as tabelas foram criadas com sucesso!';
END $$;