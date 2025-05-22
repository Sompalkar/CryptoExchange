#!/bin/bash

# Install swag if not installed
if ! command -v swag &> /dev/null; then
    go install github.com/swaggo/swag/cmd/swag@latest
fi

# Generate Swagger documentation
swag init -g main.go -o docs

echo "Swagger documentation generated successfully!" 