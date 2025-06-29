# TrackFit - Aplicação de Rastreamento de Treinos

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/claudioometto/trackfit.git)

## 🏋️‍♂️ Sobre o Projeto

TrackFit é uma aplicação web completa para rastreamento de treinos de musculação, desenvolvida em React com TypeScript e Supabase. O sistema permite aos usuários criar contas completas, gerenciar e acompanhar seus treinos, exercícios e séries, com funcionalidades avançadas de cronometragem e análise de progresso.

### ✨ Principais Funcionalidades

- 👤 **Sistema completo de cadastro** com dados pessoais e corporais
- 🔐 **Autenticação segura** com Supabase Auth
- ⏱️ **Sistema de cronometragem em tempo real**
- 📊 **Análise de progresso com gráficos**
- 🌙 **Modo escuro/claro**
- 📱 **Design responsivo**
- ☁️ **Sincronização na nuvem** com Supabase
- 💾 **Backup automático** e modo offline
- 🎨 **Interface moderna e intuitiva**

## 🚀 Deploy

### Vercel (Recomendado)

1. **Deploy Automático**: Clique no botão "Deploy with Vercel" acima
2. **Deploy Manual**:
   - Acesse [vercel.com](https://vercel.com)
   - Conecte sua conta GitHub
   - Importe o repositório `claudioometto/trackfit`
   - Configure as variáveis de ambiente (Supabase)
   - Deploy automático!

### Configurações de Deploy

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (opcional, funciona offline)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/claudioometto/trackfit.git

# Entre no diretório
cd trackfit

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificação de código
```

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Configure:
   - **Name**: TrackFit
   - **Database Password**: (senha segura)
   - **Region**: (mais próxima de você)
6. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie as informações:
   - **Project URL**
   - **anon public key**
3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3. Executar Migrações

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute as migrações na ordem:
   - `supabase/migrations/20250629020000_fix_user_data_structure.sql`

Ou use a CLI do Supabase:

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Fazer login
supabase login

# Conectar ao projeto
supabase link --project-ref seu-project-ref

# Executar migrações
supabase db push
```

### 4. Verificar Configuração

1. Execute a aplicação: `npm run dev`
2. Abra o **Debug Panel** (canto inferior direito)
3. Clique em "Testar Banco de Dados"
4. Verifique se todos os testes passaram ✅

## 🏗️ Tecnologias Utilizadas

### Core
- **React 18.3.1** - Biblioteca principal
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.4.2** - Build tool e dev server

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança de dados

### UI/UX
- **Tailwind CSS 3.4.1** - Framework CSS
- **Lucide React 0.344.0** - Ícones
- **Recharts 2.12.2** - Gráficos

### Roteamento & Estado
- **React Router DOM 6.22.2** - Navegação SPA
- **React Context** - Gerenciamento de estado

## 📱 Funcionalidades Detalhadas

### Sistema de Autenticação
- Cadastro completo com dados pessoais e corporais
- Login seguro com email e senha
- Recuperação de senha
- Perfis de usuário com medidas corporais
- Objetivos personalizados (emagrecer, ganhar massa, etc.)

### Sistema de Treinos
- Criação e gerenciamento de treinos
- Cronômetro integrado com controles avançados
- Status de treino (ativo, pausado, completo)
- Histórico completo de treinos
- Sincronização automática na nuvem

### Gerenciamento de Exercícios
- Biblioteca de exercícios por grupo muscular
- Adição dinâmica de exercícios aos treinos
- Estatísticas automáticas (peso médio, repetições médias)
- Sistema de séries com peso e repetições

### Análise de Progresso
- Gráficos de evolução por exercício
- Cálculo de percentual de melhoria
- Histórico temporal de performance
- Estatísticas gerais da aplicação

### Interface e Experiência
- Design responsivo para todos os dispositivos
- Modo escuro/claro com persistência
- Navegação intuitiva e moderna
- Feedback visual em todas as ações
- Debug panel para desenvolvimento

## 📊 Estrutura do Banco de Dados

```sql
-- Perfis de usuário
user_profiles (
  id, user_id, full_name, birth_date, gender,
  height, weight, neck_measurement, waist_measurement,
  hip_measurement, main_goal, created_at, updated_at
)

-- Treinos
treinos (
  id, user_id, name, date, completed,
  start_time, end_time, duration, is_paused,
  paused_at, created_at, updated_at
)

-- Exercícios
exercicios (
  id, treino_id, name, muscle_group,
  notes, created_at, updated_at
)

-- Séries
series (
  id, exercicio_id, weight, reps,
  completed, notes, created_at, updated_at
)
```

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** que garantem que usuários vejam apenas seus dados
- **Autenticação JWT** com Supabase Auth
- **Validação de dados** no frontend e backend
- **Relacionamentos CASCADE** para integridade referencial

## 💾 Persistência de Dados

A aplicação funciona em dois modos:

### Modo Online (Supabase configurado)
- ✅ Dados salvos na nuvem
- ✅ Sincronização automática
- ✅ Backup automático
- ✅ Acesso de múltiplos dispositivos

### Modo Offline (Supabase não configurado)
- ✅ Dados salvos localmente (localStorage)
- ✅ Funcionamento completo offline
- ✅ Privacidade total dos dados
- ✅ Performance instantânea

## 🐛 Debug e Desenvolvimento

### Debug Panel
- Painel de debug disponível em desenvolvimento
- Testes automáticos de conectividade
- Verificação de tabelas e dados
- Logs detalhados no console
- Status em tempo real

### Logs
- Console logs detalhados para todas as operações
- Rastreamento de erros e sucessos
- Informações de performance
- Debug de autenticação e dados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Claudio Ometto**
- GitHub: [@claudioometto](https://github.com/claudioometto)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

## 🆘 Suporte

Se você encontrar problemas:

1. **Verifique o Debug Panel** (modo desenvolvimento)
2. **Consulte os logs** no console do navegador
3. **Verifique as configurações** do Supabase
4. **Abra uma issue** no GitHub com detalhes do problema

### Problemas Comuns

**❌ "Supabase não configurado"**
- Verifique se o arquivo `.env` existe
- Confirme se as variáveis estão corretas
- Teste a conectividade no Debug Panel

**❌ "Tabelas não encontradas"**
- Execute as migrações do banco
- Verifique se o projeto Supabase está ativo
- Confirme as permissões de acesso

**❌ "Usuários não aparecem no Supabase"**
- Verifique se RLS está configurado
- Confirme se as políticas estão ativas
- Teste com o Debug Panel