/*
  # Criar tabela series

  1. Nova Tabela
    - `series` - Armazena séries de cada exercício
      - `id` (uuid, primary key)
      - `exercicio_id` (uuid, foreign key para exercicios)
      - `weight` (decimal)
      - `reps` (integer)
      - `completed` (boolean)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela series
    - Políticas para usuários acessarem apenas suas próprias séries
    - Relacionamento CASCADE com exercicios

  3. Performance
    - Índices otimizados
    - Trigger para updated_at automático

  4. Relacionamentos
    - series.exercicio_id → exercicios.id
    - exercicios.treino_id → treinos.id
    - treinos.user_id → auth.users.id
*/

-- Verificar se a função update_updated_at_column existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela series
CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio_id uuid REFERENCES exercicios(id) ON DELETE CASCADE NOT NULL,
  weight decimal(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 1000),
  reps integer NOT NULL CHECK (reps >= 0 AND reps <= 1000),
  completed boolean DEFAULT false NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own series" ON series;
DROP POLICY IF EXISTS "Users can insert own series" ON series;
DROP POLICY IF EXISTS "Users can update own series" ON series;
DROP POLICY IF EXISTS "Users can delete own series" ON series;

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
CREATE INDEX IF NOT EXISTS idx_series_exercicio_id ON series(exercicio_id);
CREATE INDEX IF NOT EXISTS idx_series_completed ON series(completed);
CREATE INDEX IF NOT EXISTS idx_series_weight ON series(weight);
CREATE INDEX IF NOT EXISTS idx_series_created_at ON series(created_at);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at 
  BEFORE UPDATE ON series 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentário para documentação
COMMENT ON TABLE series IS 'Séries individuais de cada exercício com peso, repetições e status de conclusão';
COMMENT ON COLUMN series.exercicio_id IS 'Referência ao exercício ao qual esta série pertence';
COMMENT ON COLUMN series.weight IS 'Peso utilizado na série (em kg)';
COMMENT ON COLUMN series.reps IS 'Número de repetições realizadas';
COMMENT ON COLUMN series.completed IS 'Indica se a série foi concluída';
COMMENT ON COLUMN series.notes IS 'Observações opcionais sobre a série';

-- Verificação final
DO $$
BEGIN
  -- Verificar se a tabela foi criada
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series') THEN
    RAISE EXCEPTION 'Tabela series não foi criada';
  END IF;
  
  -- Verificar se RLS está habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'series' AND relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS não está habilitado na tabela series';
  END IF;
  
  -- Verificar se as políticas foram criadas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'series' AND policyname = 'Users can view own series'
  ) THEN
    RAISE EXCEPTION 'Política de SELECT não foi criada para a tabela series';
  END IF;
  
  RAISE NOTICE 'Tabela series criada com sucesso com todas as políticas e índices!';
END $$;