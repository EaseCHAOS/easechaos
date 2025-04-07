.PHONY: run-backend run-frontend install build up down local clean test lint format

DOCKER_COMPOSE_FILE=docker-compose.dev.yml
VOLUMES=easechaose_redis-data

install:
	pip install -r requirements.txt
	cd frontend && pnpm install

run-backend:
	python3 -m uvicorn app:app --reload

run-frontend:
	cd frontend && pnpm run dev

local:
	make install
	make run-backend &
	make run-frontend

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
