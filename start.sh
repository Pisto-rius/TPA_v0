#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TPA Tool...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p uploads
mkdir -p backend/uploads

# Check if .env files exist, create if not
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi

if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    echo "CORS_ORIGINS=http://localhost:3000,http://frontend:3000" > backend/.env
    echo "UPLOAD_FOLDER=/app/uploads" >> backend/.env
    echo "SQLALCHEMY_DATABASE_URI=sqlite:///./tpa_tool.db" >> backend/.env
fi

# Start the application with Docker Compose
echo -e "${GREEN}Starting the application with Docker Compose...${NC}"
docker-compose up --build

# Exit gracefully
echo -e "${GREEN}Shutting down...${NC}"

