
PORT ?= 8080
BUILD_IMAGE_VERSION_TAG ?= latest
ARTIFACTORY_REGION ?= us-east1
PROJECT_ID_DEV ?= blitzy-platform-stage
REPOSITORY ?= gcf-artifacts
IMAGE_NAME ?= archie-job-reverse-file-mapper
ENV ?= qa

# Full image path
IMAGE_PATH := $(ARTIFACTORY_REGION)-docker.pkg.dev/$(PROJECT_ID_DEV)/$(REPOSITORY)/$(IMAGE_NAME):$(BUILD_IMAGE_VERSION_TAG)

all: build

install-deployment-utils:
	python -m pip install --upgrade pip keyrings.google-artifactregistry-auth toml
	@echo "Installing deployment utils"
	pip install --extra-index-url https://us-east1-python.pkg.dev/$(PROJECT_ID_DEV)/python-us-east1/simple deployment-utils


init:
	pip install -r requirements.txt

build:
	@if [ "$(GITHUB_ACTIONS)" = "true" ]; then \
         DOCKER_BUILDKIT=1 docker build \
            --secret id=google_credentials,src=$$GOOGLE_APPLICATION_CREDENTIALS \
            -t $(IMAGE_PATH) .; \
    else \
        DOCKER_BUILDKIT=1 docker build \
            --secret id=google_credentials,src=$$SERVICE_ACCOUNT_KEY_PATH \
            -t $(IMAGE_PATH) .; \
    fi
	@echo "Building docker image with tag $(IMAGE_PATH)"

clean:
	docker rmi -f $(docker images -f "dangling=true" -q)

deploy:
	@if [ -n "$(tag)" ]; then \
		echo "Deploying with tag from command line: $(tag)"; \
		deploy-to-cloud-run --type job --image-tag=$(tag) --yaml-file=$(YAML_FILE) --vars-file=env_config/env-$(ENV).yaml --skip-confirmation; \
	else \
		echo "Deploying with IMAGE_PATH: $(IMAGE_PATH)"; \
		deploy-to-cloud-run --type job --image-tag=$(IMAGE_PATH) --yaml-file=$(YAML_FILE) --vars-file=env_config/env-$(ENV).yaml --skip-confirmation; \
	fi

install-dev:
	pip install -r ../requirements-dev.txt

test:
	cd .. && pytest

test-cov:
	cd .. && pytest --cov=app --cov-report=term-missing --cov-report=xml --cov-fail-under=15

test-html:
	cd .. && pytest --cov=app --cov-report=html

test-unit:
	cd .. && pytest -m unit

.PHONY: init deploy test test-cov test-html test-unit install-dev
