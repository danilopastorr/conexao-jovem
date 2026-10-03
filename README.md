# Conexão Jovem — Na Mesa

Versão Next.js pronta para Vercel + Supabase.

## 1. Supabase
Crie um projeto no Supabase, abra o SQL Editor e execute `supabase.sql`.
Depois copie URL e Service Role Key para as variáveis de ambiente da Vercel.

## 2. Vercel
Importe este projeto. Configure:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

## 3. Uso
Página pública: `/`
Painel: `/admin`

Os dados enviados são: nome, 7 respostas, data/hora e conclusão.
A Service Role Key fica somente no servidor; nunca coloque essa chave no código do navegador.
