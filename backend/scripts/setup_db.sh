#!/bin/bash

# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS postgres;"
psql -U postgres -c "CREATE DATABASE postgres;"

# Run migrations
psql -U postgres -d postgres -f db/migrations/000001_init_schema.up.sql

# Run seed script
go run scripts/seed.go 