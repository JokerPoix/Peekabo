#!/bin/bash

# Start Ollama in the background
/bin/ollama serve &

# Wait for Ollama to be ready
echo "Waiting for Ollama service to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:11434/ > /dev/null 2>&1; then
        echo "✅ Ollama service is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Pull the llama3.2:3b model
echo "Pulling llama3.2:3b model..."
ollama pull llama3.2:3b

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo "✅ Model llama3.2:3b successfully loaded!"
else
    echo "❌ Failed to pull model llama3.2:3b"
    echo "You can pull it manually later with: docker exec -it ollama-server ollama pull llama3.2:3b"
fi

# Keep the container running
wait
