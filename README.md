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
