.PHONY: fetch-openapi test lint typecheck build check format fetch-features e2e e2e-run

fetch-openapi:
	@./scripts/fetch-openapi.sh

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

build:
	npm run build

check: typecheck lint test build
	@echo "All checks passed."

fetch-features:
	bash scripts/fetch-features.sh

e2e: fetch-features
	docker compose -f docker-compose.e2e.yml up -d --wait
	bash scripts/e2e-bootstrap.sh
	set -a && . .env.e2e && set +a && $(MAKE) e2e-run
	docker compose -f docker-compose.e2e.yml down -v

e2e-run:
	npm run test:e2e
