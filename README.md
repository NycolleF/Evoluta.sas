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

## Publicar Gratis (Online)

### 1) Backend no Render (Free)

1. Crie conta em `render.com` e conecte ao GitHub.
2. Clique em New + Web Service.
3. Selecione este repositorio.
4. Configure:
	- Root Directory: `backend`
	- Environment: `Java`
	- Build Command: `mvn clean package -DskipTests`
	- Start Command: `java -jar target/evoluta-manager-api-1.0.0.jar`
5. Em Environment Variables adicione:
	- `SPRING_DATASOURCE_URL` (opcional; sem isso usa H2)
	- `SPRING_DATASOURCE_USERNAME` (opcional)
	- `SPRING_DATASOURCE_PASSWORD` (opcional)
	- `SPRING_DATASOURCE_DRIVER_CLASS_NAME` (opcional)
	- `SPRING_JPA_DATABASE_PLATFORM` (opcional)
	- `APP_CORS_ALLOWED_ORIGINS=https://SEU-FRONTEND.vercel.app`

### 2) Frontend no Vercel (Free)

1. Crie conta em `vercel.com` e conecte ao GitHub.
2. Clique em Add New Project e selecione este repositorio.
3. Configure:
	- Root Directory: `frontend`
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Em Environment Variables adicione:
	- `VITE_API_BASE_URL=https://SEU-BACKEND.onrender.com/api`
5. Deploy.

### 3) Confirmar acesso

- Abra a URL do Vercel e teste login.
- Usuario padrao:
  - Email: `deborah@evoluta.com`
  - Senha: `password`
