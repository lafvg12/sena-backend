FROM postgres:13

ENV POSTGRES_DB=login
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=example

COPY init.sql /docker-entrypoint-initdb.d/
