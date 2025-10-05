#!/bin/bash

# Docker build and run script for PrimeLogic Solution Backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from docker.env template..."
        if [ -f docker.env ]; then
            cp docker.env .env
            print_status "Created .env file from docker.env template"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_error "docker.env template not found. Please create .env file manually"
            exit 1
        fi
    else
        print_status ".env file found"
    fi
}

# Function to build and start services
start_services() {
    local mode=${1:-production}
    
    print_status "Starting services in $mode mode..."
    
    case $mode in
        "dev"|"development")
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
            ;;
        "prod"|"production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
            ;;
        *)
            docker-compose up --build
            ;;
    esac
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
}

# Function to show logs
show_logs() {
    local service=${1:-}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [mode]     Start services (dev|prod|default)"
    echo "  stop             Stop services"
    echo "  restart [mode]   Restart services"
    echo "  logs [service]   Show logs (optionally for specific service)"
    echo "  clean            Clean up Docker resources"
    echo "  status           Show service status"
    echo "  shell [service]  Access shell in container"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start dev     # Start in development mode"
    echo "  $0 start prod    # Start in production mode"
    echo "  $0 logs app      # Show application logs"
    echo "  $0 shell app     # Access application container shell"
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to access shell
access_shell() {
    local service=${1:-app}
    print_status "Accessing shell in $service container..."
    docker-compose exec "$service" sh
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        "start")
            check_docker
            check_env
            start_services "$2"
            ;;
        "stop")
            check_docker
            stop_services
            ;;
        "restart")
            check_docker
            stop_services
            sleep 2
            start_services "$2"
            ;;
        "logs")
            check_docker
            show_logs "$2"
            ;;
        "clean")
            check_docker
            cleanup
            ;;
        "status")
            check_docker
            show_status
            ;;
        "shell")
            check_docker
            access_shell "$2"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"



