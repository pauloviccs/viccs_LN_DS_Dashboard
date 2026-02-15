# Guia de Configuração Manual - Lumia SaaS (Supabase)

Como estamos criando um novo projeto, siga estes passos para configurar a infraestrutura backend manualmente.

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/dashboard)
2. Crie um novo projeto (ex: `Lumia-SaaS`).
3. Defina a senha do banco de dados e aguarde a inicialização.

## Passo 2: Executar o Schema SQL

1. No dashboard, vá em **SQL Editor**.
2. Clique em **New Query**.
3. Copie e cole todo o conteúdo do arquivo `supabase_schema.sql` deste projeto.
4. Clique em **Run**.

Isso irá criar:

* Tabelas: `profiles`, `media`, `playlists`, `screens`
* Políticas RLS básicas (Segurança)
* Trigger para criar perfil automaticamente ao cadastrar usuário
* Bucket de Storage `media`

## Passo 3: Configurar Autenticação

1. Vá em **Authentication** > **Providers**.
2. Garanta que **Email** está habilitado.
3. Desabilite "Confirm email" por enquanto (para facilitar testes) em **Authentication** > **URL Configuration** (ou Auth Settings dependendo da versão do painel).

## Passo 4: Conectar ao Frontend

1. Vá em **Project Settings** > **API**.
2. Copie o **Project URL**.
3. Copie a **anon** public key.
4. Atualize o arquivo `.env` na raiz do projeto `Lumia_DigitalSinage` com esses valores.

```env
VITE_SUPABASE_URL=seu_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

## Passo 5: Criar seu Usuário Admin

Como o padrão é `client`, você precisará se promover manualmente a Admin após criar a conta.

1. Rode o projeto web (`npm run dev`) e crie uma conta na tela de Login.
2. Vá no **Table Editor** do Supabase > tabela `profiles`.
3. Encontre seu usuário e mude a coluna `role` de `client` para `admin`.

---

**Pronto!** Agora o sistema tem backend funcional.
