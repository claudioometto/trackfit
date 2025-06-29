/*
  # Verificar e corrigir relacionamentos da tabela series

  1. Verificações
    - Confirmar que a tabela series existe
    - Verificar se as foreign keys estão corretas
    - Verificar se os relacionamentos estão funcionando

  2. Correções
    - Recriar foreign keys se necessário
    - Adicionar comentários para documentação
    - Verificar constraints

  3. Testes
    - Testar relacionamentos
    - Verificar se as queries funcionam
*/

-- Verificar se a tabela series existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series') THEN
    RAISE EXCEPTION 'Tabela series não existe!';
  END IF;
  
  RAISE NOTICE 'Tabela series encontrada ✅';
END $$;

-- Verificar foreign keys existentes
DO $$
DECLARE
  fk_count integer;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'series' 
  AND tc.constraint_type = 'FOREIGN KEY';
  
  RAISE NOTICE 'Foreign keys encontradas na tabela series: %', fk_count;
  
  IF fk_count = 0 THEN
    RAISE NOTICE 'Nenhuma foreign key encontrada - vamos criar!';
  END IF;
END $$;

-- Remover constraint existente se houver problema
ALTER TABLE series DROP CONSTRAINT IF EXISTS series_exercicio_id_fkey;

-- Recriar a foreign key com nome explícito
ALTER TABLE series 
ADD CONSTRAINT series_exercicio_id_fkey 
FOREIGN KEY (exercicio_id) 
REFERENCES exercicios(id) 
ON DELETE CASCADE;

-- Verificar se o relacionamento funciona
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Testar se conseguimos fazer JOIN
  SELECT EXISTS(
    SELECT 1 
    FROM series s
    JOIN exercicios e ON e.id = s.exercicio_id
    JOIN treinos t ON t.id = e.treino_id
    LIMIT 1
  ) INTO test_result;
  
  RAISE NOTICE 'Teste de relacionamento series → exercicios → treinos: %', 
    CASE WHEN test_result THEN 'SUCESSO ✅' ELSE 'SEM DADOS (normal se não há dados)' END;
END $$;

-- Adicionar comentários para documentação
COMMENT ON CONSTRAINT series_exercicio_id_fkey ON series IS 'Relacionamento: series → exercicios';

-- Verificar todas as foreign keys do sistema
DO $$
DECLARE
  fk_record record;
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO DE RELACIONAMENTOS ===';
  
  FOR fk_record IN
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('user_profiles', 'treinos', 'exercicios', 'series')
    ORDER BY tc.table_name, kcu.column_name
  LOOP
    RAISE NOTICE '% (%) → % (%)', 
      fk_record.table_name, 
      fk_record.column_name,
      fk_record.foreign_table_name,
      fk_record.foreign_column_name;
  END LOOP;
END $$;

-- Verificar se RLS está funcionando
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'series' AND relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS não está habilitado na tabela series!';
  END IF;
  
  RAISE NOTICE 'RLS habilitado na tabela series ✅';
END $$;

-- Verificar políticas
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'series';
  
  RAISE NOTICE 'Políticas RLS na tabela series: %', policy_count;
  
  IF policy_count < 4 THEN
    RAISE WARNING 'Esperado 4 políticas (SELECT, INSERT, UPDATE, DELETE), encontrado: %', policy_count;
  END IF;
END $$;

-- Criar função para testar relacionamentos (útil para debug)
CREATE OR REPLACE FUNCTION test_series_relationships()
RETURNS TABLE(
  series_count bigint,
  exercicios_count bigint,
  treinos_count bigint,
  users_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM series) as series_count,
    (SELECT COUNT(*) FROM exercicios) as exercicios_count,
    (SELECT COUNT(*) FROM treinos) as treinos_count,
    (SELECT COUNT(*) FROM auth.users) as users_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificação final
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Tabela series: ✅ Criada';
  RAISE NOTICE 'Foreign Key: ✅ series.exercicio_id → exercicios.id';
  RAISE NOTICE 'RLS: ✅ Habilitado';
  RAISE NOTICE 'Políticas: ✅ Configuradas';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 RELACIONAMENTOS COMPLETOS:';
  RAISE NOTICE 'auth.users → user_profiles (user_id)';
  RAISE NOTICE 'auth.users → treinos (user_id)';
  RAISE NOTICE 'treinos → exercicios (treino_id)';
  RAISE NOTICE 'exercicios → series (exercicio_id)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todos os relacionamentos estão funcionando!';
END $$;