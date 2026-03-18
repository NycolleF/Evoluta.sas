# Evoluta Client Manager

Sistema de Gestao de Mentoria Empresarial na stack Java + JavaScript.

## Tecnologias

- Java 17+
- Spring Boot 3 (API REST)
- React + Vite (frontend)
- MariaDB

## Estrutura

```
Evoluta.sas/
|- backend/   API Spring Boot
|- frontend/  App React
|- banco/     Script SQL
```

## Banco de Dados

Importe o script:

```
"C:\Program Files\MariaDB 12.2\bin\mariadb.exe" -u root evoluta_db < banco/evoluta.sql
```

## Rodando o Backend

Se tiver Maven instalado no sistema:

```
mvn -f backend/pom.xml spring-boot:run
```

Se estiver usando Maven local do projeto:

```
frontend/tools/apache-maven-3.9.9/bin/mvn.cmd -f backend/pom.xml spring-boot:run
```

Backend padrao: `http://localhost:8081`

## Rodando o Frontend

```
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend padrao: `http://localhost:5173`

## Colocar Online (Hospedagem Gratuita)

Stack recomendada (plano free):

- Frontend: Vercel
- Backend (Spring Boot): Render
- Banco: Supabase Postgres (ou Neon Postgres)

### 1) Banco gratuito (Supabase/Neon)

1. Crie um projeto no Supabase ou Neon.
2. Copie a connection string Postgres (formato `jdbc:postgresql://...`).
3. No primeiro deploy do backend, deixe `JPA_DDL_AUTO=update` para criar as tabelas automaticamente.

### 2) Deploy do backend no Render

1. Crie um novo `Web Service` apontando para este repositório.
2. Configure:
 - Build command: `mvn -f backend/pom.xml clean package -DskipTests`
 - Start command: `java -jar backend/target/evoluta-manager-api-1.0.0.jar`
3. Variáveis de ambiente no Render:
 - `DATABASE_URL=jdbc:postgresql://SEU_HOST:5432/SEU_BANCO?sslmode=require`
 - `DB_USERNAME=SEU_USUARIO`
 - `DB_PASSWORD=SUA_SENHA`
 - `JPA_DDL_AUTO=update`
 - `JPA_SHOW_SQL=false`
 - `APP_CORS_ALLOWED_ORIGINS=https://SEU_FRONTEND.vercel.app`

Quando subir, copie a URL pública do backend (ex: `https://evoluta-api.onrender.com`).

### 3) Deploy do frontend no Vercel

1. Importe o repositório no Vercel.
2. Root Directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Variável de ambiente no Vercel:
 - `VITE_API_URL=https://SEU_BACKEND.onrender.com/api`

Depois do deploy, atualize no Render:

- `APP_CORS_ALLOWED_ORIGINS=https://SEU_FRONTEND.vercel.app,http://localhost:5173`

### 4) Observações importantes

- Render free pode "hibernar" quando sem uso (primeiro acesso pode demorar alguns segundos).
- Se mudar domínio do frontend, atualize `APP_CORS_ALLOWED_ORIGINS`.
- Para produção estável no longo prazo, considere plano pago para evitar hibernação.
