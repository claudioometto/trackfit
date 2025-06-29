/*
  # Criar estrutura do banco de dados TrackFit

  1. Novas Tabelas
    - `treinos` - Armazena informações dos treinos
    - `exercicios` - Armazena exercícios de cada treino  
    - `series` - Armazena séries de cada exercício

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários verem apenas seus próprios dados
    - Relacionamentos com CASCADE DELETE

  3. Performance
    - Índices otimizados
    - Triggers para updated_at automático
*/

-- Criar tabela de treinos
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

-- Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_id uuid REFERENCES treinos(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  muscle_group text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Criar tabela de séries
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

-- Habilitar RLS
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Políticas para treinos
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

-- Políticas para exercícios
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

-- Políticas para séries
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_treinos_user_id ON treinos(user_id);
CREATE INDEX IF NOT EXISTS idx_treinos_date ON treinos(date);
CREATE INDEX IF NOT EXISTS idx_exercicios_treino_id ON exercicios(treino_id);
CREATE INDEX IF NOT EXISTS idx_series_exercicio_id ON series(exercicio_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_treinos_updated_at 
  BEFORE UPDATE ON treinos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercicios_updated_at 
  BEFORE UPDATE ON exercicios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at 
  BEFORE UPDATE ON series 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();