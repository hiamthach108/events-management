IMAGE_NAME=events_management_server

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -p 8080:8080 $(IMAGE_NAME)

migration:
	npx prisma migrate dev --name $(name)

apply-migration:
	npx prisma migrate deploy

db-pull:
	npx prisma db pull

run-app:
	docker-compose up	 --build -d

.PHONY: build run migration apply-migration db-pull run-app