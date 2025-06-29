import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Bug, ChevronDown, ChevronUp, Database, User, Settings, RefreshCw, Search } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useAuth();

  // Só mostrar em desenvolvimento
  if (!import.meta.env.DEV) {
    return null;
  }

  const runDatabaseTests = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      supabaseConfigured: isSupabaseConfigured(),
      environment: {
        url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
        keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      },
      tests: {}
    };

    try {
      console.log('🧪 === INICIANDO TESTES DO BANCO DE DADOS ===');

      // Teste 1: Verificar conexão básica
      console.log('🧪 Teste 1: Verificando conexão...');
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        results.tests.connection = {
          success: !error,
          error: error?.message,
          message: error ? 'Falha na conexão' : 'Conexão OK'
        };
        console.log('✅ Conexão:', results.tests.connection);
      } catch (err) {
        results.tests.connection = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido',
          message: 'Erro de rede ou configuração'
        };
        console.log('❌ Conexão:', results.tests.connection);
      }

      // Teste 2: Verificar tabelas existem
      console.log('🧪 Teste 2: Verificando tabelas...');
      const tables = ['user_profiles', 'treinos', 'exercicios', 'series'];
      results.tests.tables = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          results.tests.tables[table] = {
            exists: !error || error.code !== '42P01', // 42P01 = relation does not exist
            error: error?.message,
            errorCode: error?.code,
            accessible: !error,
            data: data
          };
          console.log(`📋 Tabela ${table}:`, results.tests.tables[table]);
        } catch (err) {
          results.tests.tables[table] = {
            exists: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
            accessible: false
          };
          console.log(`❌ Tabela ${table}:`, results.tests.tables[table]);
        }
      }

      // Teste 2.1: Verificar estrutura da tabela series especificamente
      console.log('🧪 Teste 2.1: Verificando estrutura da tabela series...');
      try {
        // Tentar diferentes variações do nome da tabela
        const tableVariations = ['series', 'serie', 'sets', 'workout_sets'];
        results.tests.seriesVariations = {};
        
        for (const tableName of tableVariations) {
          try {
            const { data, error } = await supabase.from(tableName).select('*').limit(1);
            results.tests.seriesVariations[tableName] = {
              exists: !error,
              error: error?.message,
              errorCode: error?.code,
              accessible: !error
            };
          } catch (err) {
            results.tests.seriesVariations[tableName] = {
              exists: false,
              error: err instanceof Error ? err.message : 'Erro desconhecido'
            };
          }
        }
        console.log('🔍 Variações de tabela series:', results.tests.seriesVariations);
      } catch (err) {
        results.tests.seriesVariations = {
          error: 'Erro ao verificar variações'
        };
      }

      // Teste 2.2: Listar todas as tabelas disponíveis
      console.log('🧪 Teste 2.2: Listando todas as tabelas...');
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .order('table_name');
        
        results.tests.allTables = {
          success: !error,
          error: error?.message,
          tables: data?.map(t => t.table_name) || []
        };
        console.log('📋 Todas as tabelas:', results.tests.allTables);
      } catch (err) {
        // Método alternativo usando RPC
        try {
          const { data, error } = await supabase.rpc('get_table_list');
          results.tests.allTables = {
            success: !error,
            error: error?.message,
            tables: data || [],
            method: 'rpc'
          };
        } catch (err2) {
          results.tests.allTables = {
            success: false,
            error: 'Não foi possível listar tabelas',
            method: 'failed'
          };
        }
      }

      // Teste 3: Verificar dados de usuários
      console.log('🧪 Teste 3: Verificando dados de usuários...');
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');
        
        results.tests.userProfiles = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          data: data?.map(p => ({ 
            id: p.id, 
            user_id: p.user_id, 
            full_name: p.full_name,
            created_at: p.created_at 
          }))
        };
        console.log('👥 Perfis de usuário:', results.tests.userProfiles);
      } catch (err) {
        results.tests.userProfiles = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido',
          count: 0
        };
        console.log('❌ Perfis de usuário:', results.tests.userProfiles);
      }

      // Teste 4: Verificar dados de treinos
      console.log('🧪 Teste 4: Verificando dados de treinos...');
      try {
        const { data, error } = await supabase
          .from('treinos')
          .select('id, user_id, name, created_at');
        
        results.tests.treinos = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          withUserId: data?.filter(t => t.user_id).length || 0,
          data: data?.slice(0, 5) // Primeiros 5 registros
        };
        console.log('🏋️ Treinos:', results.tests.treinos);
      } catch (err) {
        results.tests.treinos = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido',
          count: 0
        };
        console.log('❌ Treinos:', results.tests.treinos);
      }

      // Teste 5: Verificar dados de exercícios
      console.log('🧪 Teste 5: Verificando dados de exercícios...');
      try {
        const { data, error } = await supabase
          .from('exercicios')
          .select('id, treino_id, name, muscle_group, created_at');
        
        results.tests.exercicios = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          data: data?.slice(0, 5)
        };
        console.log('💪 Exercícios:', results.tests.exercicios);
      } catch (err) {
        results.tests.exercicios = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido',
          count: 0
        };
        console.log('❌ Exercícios:', results.tests.exercicios);
      }

      // Teste 6: Verificar dados de séries (com diferentes nomes)
      console.log('🧪 Teste 6: Verificando dados de séries...');
      const seriesTableNames = ['series', 'serie', 'sets', 'workout_sets'];
      results.tests.seriesData = {};
      
      for (const tableName of seriesTableNames) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id, exercicio_id, weight, reps, completed, created_at');
          
          results.tests.seriesData[tableName] = {
            success: !error,
            error: error?.message,
            count: data?.length || 0,
            data: data?.slice(0, 5)
          };
          console.log(`🔢 Séries (${tableName}):`, results.tests.seriesData[tableName]);
        } catch (err) {
          results.tests.seriesData[tableName] = {
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
            count: 0
          };
        }
      }

      // Teste 7: Verificar RLS
      console.log('🧪 Teste 7: Verificando RLS...');
      try {
        const rlsResults = {};
        for (const table of tables) {
          try {
            const { data, error } = await supabase.rpc('check_rls_enabled', { table_name: table });
            rlsResults[table] = {
              enabled: data,
              error: error?.message
            };
          } catch (err) {
            rlsResults[table] = {
              enabled: null,
              error: 'Função não disponível'
            };
          }
        }
        results.tests.rls = rlsResults;
        console.log('🔒 RLS:', results.tests.rls);
      } catch (err) {
        results.tests.rls = {
          error: 'Erro ao verificar RLS'
        };
        console.log('❌ RLS:', results.tests.rls);
      }

      // Teste 8: Verificar perfil do usuário atual
      if (user) {
        console.log('🧪 Teste 8: Verificando perfil do usuário atual...');
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id);
          
          results.tests.currentUserProfile = {
            success: !error,
            error: error?.message,
            found: data && data.length > 0,
            data: data?.[0]
          };
          console.log('👤 Perfil atual:', results.tests.currentUserProfile);
        } catch (err) {
          results.tests.currentUserProfile = {
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
            found: false
          };
          console.log('❌ Perfil atual:', results.tests.currentUserProfile);
        }

        // Teste 9: Verificar treinos do usuário atual
        console.log('🧪 Teste 9: Verificando treinos do usuário atual...');
        try {
          const { data, error } = await supabase
            .from('treinos')
            .select('*')
            .eq('user_id', user.id);
          
          results.tests.currentUserTreinos = {
            success: !error,
            error: error?.message,
            count: data?.length || 0,
            data: data?.slice(0, 3)
          };
          console.log('🏋️ Treinos do usuário:', results.tests.currentUserTreinos);
        } catch (err) {
          results.tests.currentUserTreinos = {
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
            count: 0
          };
          console.log('❌ Treinos do usuário:', results.tests.currentUserTreinos);
        }
      }

      // Teste 10: Verificar auth.users (se possível)
      console.log('🧪 Teste 10: Verificando usuários autenticados...');
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        results.tests.authUsers = {
          success: !error,
          error: error?.message,
          currentUser: currentUser ? {
            id: currentUser.id,
            email: currentUser.email,
            created_at: currentUser.created_at
          } : null
        };
        console.log('🔐 Auth users:', results.tests.authUsers);
      } catch (err) {
        results.tests.authUsers = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        };
        console.log('❌ Auth users:', results.tests.authUsers);
      }

      // Teste 11: Verificar relacionamentos
      console.log('🧪 Teste 11: Verificando relacionamentos...');
      try {
        const { data, error } = await supabase
          .from('treinos')
          .select(`
            id,
            name,
            user_id,
            exercicios (
              id,
              name,
              muscle_group,
              series:series (
                id,
                weight,
                reps,
                completed
              )
            )
          `)
          .limit(2);
        
        results.tests.relationships = {
          success: !error,
          error: error?.message,
          data: data
        };
        console.log('🔗 Relacionamentos:', results.tests.relationships);
      } catch (err) {
        results.tests.relationships = {
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        };
        console.log('❌ Relacionamentos:', results.tests.relationships);
      }

    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
      results.generalError = error instanceof Error ? error.message : 'Erro desconhecido';
    }

    setTestResults(results);
    setLoading(false);
    console.log('🧪 === TESTES CONCLUÍDOS ===');
    console.log('📊 Resultados completos:', results);
  };

  const getStatusColor = (success: boolean | null) => {
    if (success === null) return 'text-yellow-400';
    return success ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return '⚠️';
    return success ? '✅' : '❌';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl max-w-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <Bug size={16} className="mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Debug Panel - Investigação Series</span>
            {testResults && (
              <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                {new Date(testResults.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="p-4 border-t border-gray-700 max-h-96 overflow-y-auto">
            {/* Status atual */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Settings size={14} className="mr-1" />
                Status Atual
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Supabase:</span>
                  <span className={isSupabaseConfigured() ? 'text-green-400' : 'text-red-400'}>
                    {isSupabaseConfigured() ? 'Configurado' : 'Não configurado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usuário:</span>
                  <span className={user ? 'text-green-400' : 'text-red-400'}>
                    {user ? 'Logado' : 'Não logado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Perfil:</span>
                  <span className={userProfile ? 'text-green-400' : 'text-red-400'}>
                    {userProfile ? 'Carregado' : 'Não encontrado'}
                  </span>
                </div>
                {testResults?.environment && (
                  <>
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span className="text-gray-300 text-xs">{testResults.environment.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Length:</span>
                      <span className="text-gray-300">{testResults.environment.keyLength}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informações do usuário */}
            {user && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <User size={14} className="mr-1" />
                  Usuário Atual
                </h3>
                <div className="text-xs space-y-1">
                  <div><strong>ID:</strong> <span className="text-gray-300">{user.id}</span></div>
                  <div><strong>Email:</strong> <span className="text-gray-300">{user.email}</span></div>
                  <div><strong>Criado:</strong> <span className="text-gray-300">{new Date(user.created_at).toLocaleString()}</span></div>
                </div>
              </div>
            )}

            {/* Botão de teste */}
            <button
              onClick={runDatabaseTests}
              disabled={loading || !isSupabaseConfigured()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center mb-4"
            >
              {loading ? (
                <RefreshCw size={14} className="mr-1 animate-spin" />
              ) : (
                <Search size={14} className="mr-1" />
              )}
              {loading ? 'Investigando...' : 'Investigar Tabela Series'}
            </button>

            {/* Resultados dos testes */}
            {testResults && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Resultados da Investigação</h3>
                <div className="text-xs space-y-2">
                  
                  {/* Teste de conexão */}
                  {testResults.tests.connection && (
                    <div className="border border-gray-600 rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Conexão</span>
                        <span className={getStatusColor(testResults.tests.connection.success)}>
                          {getStatusIcon(testResults.tests.connection.success)}
                        </span>
                      </div>
                      <div className="text-gray-300">{testResults.tests.connection.message}</div>
                      {testResults.tests.connection.error && (
                        <div className="text-red-300 text-xs mt-1">{testResults.tests.connection.error}</div>
                      )}
                    </div>
                  )}

                  {/* Teste de tabelas principais */}
                  {testResults.tests.tables && (
                    <div className="border border-gray-600 rounded p-2">
                      <div className="font-medium mb-2">Tabelas Principais</div>
                      {Object.entries(testResults.tests.tables).map(([table, result]: [string, any]) => (
                        <div key={table} className="flex justify-between items-center mb-1">
                          <span className="text-gray-300">{table}</span>
                          <div className="flex items-center space-x-1">
                            <span className={getStatusColor(result.exists)}>
                              {result.exists ? '📋' : '❌'}
                            </span>
                            <span className={getStatusColor(result.accessible)}>
                              {result.accessible ? '🔓' : '🔒'}
                            </span>
                          </div>
                          {result.error && (
                            <div className="text-red-300 text-xs mt-1">
                              {result.errorCode}: {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Variações da tabela series */}
                  {testResults.tests.seriesVariations && (
                    <div className="border border-yellow-600 rounded p-2 bg-yellow-900/20">
                      <div className="font-medium mb-2 text-yellow-300">🔍 Investigação: Tabela Series</div>
                      {Object.entries(testResults.tests.seriesVariations).map(([table, result]: [string, any]) => (
                        <div key={table} className="flex justify-between items-center mb-1">
                          <span className="text-gray-300">{table}</span>
                          <div className="flex items-center space-x-1">
                            <span className={getStatusColor(result.exists)}>
                              {result.exists ? '✅ ENCONTRADA' : '❌ NÃO EXISTE'}
                            </span>
                          </div>
                          {result.error && (
                            <div className="text-red-300 text-xs mt-1">
                              {result.errorCode}: {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista de todas as tabelas */}
                  {testResults.tests.allTables && (
                    <div className="border border-blue-600 rounded p-2 bg-blue-900/20">
                      <div className="font-medium mb-2 text-blue-300">📋 Todas as Tabelas no Banco</div>
                      {testResults.tests.allTables.success ? (
                        <div className="text-gray-300 text-xs">
                          <div className="mb-1">Total: {testResults.tests.allTables.tables.length} tabelas</div>
                          <div className="max-h-20 overflow-y-auto">
                            {testResults.tests.allTables.tables.map((table: string) => (
                              <div key={table} className="py-0.5">
                                • {table}
                                {table.includes('serie') && <span className="text-yellow-300"> ⭐ SÉRIE!</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-300 text-xs">{testResults.tests.allTables.error}</div>
                      )}
                    </div>
                  )}

                  {/* Dados de séries */}
                  {testResults.tests.seriesData && (
                    <div className="border border-green-600 rounded p-2 bg-green-900/20">
                      <div className="font-medium mb-2 text-green-300">🔢 Dados de Séries</div>
                      {Object.entries(testResults.tests.seriesData).map(([table, result]: [string, any]) => (
                        <div key={table} className="mb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{table}</span>
                            <span className={getStatusColor(result.success)}>
                              {result.success ? `✅ ${result.count} registros` : '❌ Erro'}
                            </span>
                          </div>
                          {result.error && (
                            <div className="text-red-300 text-xs mt-1">{result.error}</div>
                          )}
                          {result.data && result.data.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              Exemplo: {JSON.stringify(result.data[0], null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teste de relacionamentos */}
                  {testResults.tests.relationships && (
                    <div className="border border-purple-600 rounded p-2 bg-purple-900/20">
                      <div className="font-medium mb-2 text-purple-300">🔗 Teste de Relacionamentos</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Treinos → Exercícios → Séries</span>
                        <span className={getStatusColor(testResults.tests.relationships.success)}>
                          {getStatusIcon(testResults.tests.relationships.success)}
                        </span>
                      </div>
                      {testResults.tests.relationships.error && (
                        <div className="text-red-300 text-xs mt-1">{testResults.tests.relationships.error}</div>
                      )}
                      {testResults.tests.relationships.data && (
                        <div className="text-xs text-gray-400 mt-1">
                          Dados encontrados: {JSON.stringify(testResults.tests.relationships.data, null, 2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outros testes */}
                  {Object.entries(testResults.tests).map(([testName, result]: [string, any]) => {
                    if (['connection', 'tables', 'seriesVariations', 'allTables', 'seriesData', 'relationships'].includes(testName)) return null;
                    
                    return (
                      <div key={testName} className="border border-gray-600 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{testName}</span>
                          <span className={getStatusColor(result.success)}>
                            {getStatusIcon(result.success)}
                          </span>
                        </div>
                        {result.count !== undefined && (
                          <div className="text-gray-300">Registros: {result.count}</div>
                        )}
                        {result.withUserId !== undefined && (
                          <div className="text-gray-300">Com user_id: {result.withUserId}</div>
                        )}
                        {result.found !== undefined && (
                          <div className="text-gray-300">Encontrado: {result.found ? 'Sim' : 'Não'}</div>
                        )}
                        {result.error && (
                          <div className="text-red-300 text-xs mt-1">{result.error}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;