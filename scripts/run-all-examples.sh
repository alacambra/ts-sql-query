#!/bin/bash
set -x #echo on

#npm install any-db-transaction any-db-mssql any-db-mysql any-db-postgres any-db-sqlite3 better-sqlite3 mssql mysql2 mysql oracledb pg sqlite3 tedious loopback-connector-sqlite3 loopback-connector-postgresql loopback-connector-mysql loopback-connector-mssql loopback-connector-oracle

# On Linux
# Download and uncompress instantclient-basic-linux: https://www.oracle.com/es/database/technologies/instant-client/linux-x86-64-downloads.html
# sudo apt-get install build-essential libaio1
#
# On Mac OS
# Download and uncompress instantclient-basic-macos: https://www.oracle.com/es/database/technologies/instant-client/macos-intel-x86-downloads.html
# Execute the commmand in the uncompressed folder: xattr -d com.apple.quarantine *
export LD_LIBRARY_PATH="$HOME/Downloads/instantclient_19_8/"

node ./dist/examples/SqliteExample.js || exit 1
node ./dist/examples/Sqlite3Example.js || exit 1
node ./dist/examples/BetterSqlite3Example.js || exit 1
node ./dist/examples/AnyDBSqlite3Example.js || exit 1
node ./dist/examples/LoopBackSqlite3Example.js || exit 1

docker run --name ts-sql-query-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
sleep 20
node ./dist/examples/PgExample.js || { docker stop ts-sql-query-postgres; docker rm ts-sql-query-postgres; exit 1; }
node ./dist/examples/EncriptedIDPgExample.js || { docker stop ts-sql-query-postgres; docker rm ts-sql-query-postgres; exit 1; }
node ./dist/examples/AnyDBPostgresExample.js || { docker stop ts-sql-query-postgres; docker rm ts-sql-query-postgres; exit 1; }
node ./dist/examples/LoopBackPostgresqlExample.js || { docker stop ts-sql-query-postgres; docker rm ts-sql-query-postgres; exit 1; }
docker stop ts-sql-query-postgres
docker rm ts-sql-query-postgres

docker run --name ts-sql-query-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:5.7.29
sleep 20
node ./dist/examples/MySqlExample.js || { docker stop ts-sql-query-mysql; docker rm ts-sql-query-mysql; exit 1; }
node ./dist/examples/AnyDBMySqlExample.js || { docker stop ts-sql-query-mysql; docker rm ts-sql-query-mysql; exit 1; }
node ./dist/examples/LoopBackMySqlExample.js || { docker stop ts-sql-query-mysql; docker rm ts-sql-query-mysql; exit 1; }
docker stop ts-sql-query-mysql
docker rm ts-sql-query-mysql

docker run --name ts-sql-query-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql
sleep 40
node ./dist/examples/MySql2Example.js || { docker stop ts-sql-query-mysql; docker rm ts-sql-query-mysql; exit 1; }
docker stop ts-sql-query-mysql
docker rm ts-sql-query-mysql

docker run --name ts-sql-query-mariadb -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mariadb
sleep 30
node ./dist/examples/MariaDBExample.js || { docker stop ts-sql-query-mariadb; docker rm ts-sql-query-mariadb; exit 1; }
docker stop ts-sql-query-mariadb
docker rm ts-sql-query-mariadb

docker run --name ts-sql-query-sqlserver -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=yourStrong(!)Password' -e 'MSSQL_PID=Express' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2017-latest-ubuntu
sleep 20
node ./dist/examples/TediousExample.js || { docker stop ts-sql-query-sqlserver; docker rm ts-sql-query-sqlserver; exit 1; }
node ./dist/examples/MssqlTediousExample.js || { docker stop ts-sql-query-sqlserver; docker rm ts-sql-query-sqlserver; exit 1; }
node ./dist/examples/AnyDBMssqlTediousExample.js || { docker stop ts-sql-query-sqlserver; docker rm ts-sql-query-sqlserver; exit 1; }
node ./dist/examples/LoopBackMssqlTediousExample.js || { docker stop ts-sql-query-sqlserver; docker rm ts-sql-query-sqlserver; exit 1; }
docker stop ts-sql-query-sqlserver
docker rm ts-sql-query-sqlserver

docker run --name ts-sql-query-oracle -d -p 1521:1521 quillbuilduser/oracle-18-xe
sleep 50
node ./dist/examples/OracleDBExample.js || { docker stop ts-sql-query-oracle; docker rm ts-sql-query-oracle; exit 1; }
node ./dist/examples/LoopBackOracleDBExample.js || { docker stop ts-sql-query-oracle; docker rm ts-sql-query-oracle; exit 1; }
docker stop ts-sql-query-oracle
docker rm ts-sql-query-oracle

echo 'All examples ok'