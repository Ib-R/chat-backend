-- Deploy fresh database tables with seeding
source /docker-entrypoint-initdb.d/tables/users.sql
source /docker-entrypoint-initdb.d/tables/users_seed.sql