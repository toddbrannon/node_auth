docker-all:
	docker rm /nodeauth.v1 && \
	docker build -t nodeauth.v1 . && \
	docker run --name nodeauth.v1 -p 9000:3000 nodeauth.v1

docker-rm:
	docker rm /nodeauth.v1

docker-build:
	docker build -t nodeauth.v1 . && \
	docker run --name nodeauth.v1 -p 9000:3000 nodeauth.v1