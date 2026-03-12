# Ollama Setup Helper

This directory contains the Ollama initialization script.
The Ollama service runs in a Docker container and automatically loads llama3.2:3b on startup.

## Automatic Model Loading

The `init-model.sh` script automatically pulls the llama3.2:3b model when the container starts.

## Pull Additional Models

To download another Ollama model:

```bash
docker exec -it ollama-server ollama pull mistral
```

## List Models

To see installed models:

```bash
docker exec -it ollama-server ollama list
```

## Run Interactive Shell

To interact with Ollama directly:

```bash
docker exec -it ollama-server ollama run llama3.2:3b
```

## Available Models

Visit https://ollama.ai/library for a complete list of available models:
- llama3.2 (1B, 3B)
- llama3.1 (8B, 70B, 405B)
- mistral
- codellama
- phi3
- gemma2
- and many more...
