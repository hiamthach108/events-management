IMAGE_NAME=events_management_server

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -p 8080:8080 $(IMAGE_NAME)

migration:
	npx prisma migrate dev --name $(name)

db-pull:
	npx prisma db pull

.PHONY: build run migrate release