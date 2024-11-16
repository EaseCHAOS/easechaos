.PHONY: build up down clean test lint format

DOCKER_COMPOSE_FILE=docker-compose.dev.yml
VOLUMES=easechaose_redis-data

build:
	docker-compose -f $(DOCKER_COMPOSE_FILE) build

up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up

down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

clean:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v
	docker volume rm $(VOLUMES)

test:
	pytest tests/ -v

lint:
	flake8 .
	black . --check
	isort . --check-only

format:
	black .
	isort .