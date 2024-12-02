# Instructions

to be able to run this program

### first make sure to serve ollama in the termila:
ollama serve

### you have to run :

docker compose up --build 

### Link:

then open localhost:3000 in browser

### notes

make sure to change the .env to config the model and the ollama link:
ex : llama3.1 ollama: LLAMA_URL=http://host.docker.internal:11434

please keep the host.docker.internal to be able to run in docker
