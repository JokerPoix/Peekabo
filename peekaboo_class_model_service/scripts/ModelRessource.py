"""
Flask API for Bird Species Classification

This API provides endpoints for uploading bird images and receiving species predictions.
"""

from flask import Flask, request, jsonify, Response, stream_with_context
from PIL import Image
import os
import sys
import json
from io import BytesIO
import logging
import requests as http_requests

# Add parent directory to path to import model service
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from BirdClassificationModelService import BirdClassificationModelService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Ollama configuration
OLLAMA_BASE_URL = os.environ.get("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")

# In-memory chat history keyed by session_id
chat_sessions: dict = {}
MAX_HISTORY_MESSAGES = 20  # keep last N messages per session

# Initialize model service eagerly at startup so the model is warm before any request arrives
logger.info("Initializing model service at startup...")
model_service = BirdClassificationModelService()
model_service.load_label_translations()
logger.info("Model service ready.")


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_model_service() -> BirdClassificationModelService:
    """Return the pre-loaded model service instance."""
    return model_service


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Bird Species Classifier API"
    }), 200



@app.route('/predict', methods=['POST'])
def predict_bird_species_french():
    """
    Predict bird species from uploaded image (French labels).
    
    Expected request:
        - Multipart form data with 'image' file
        - Optional: 'top_k' parameter (default: 3)
    
    Returns:
        JSON response with predictions and confidence scores (French species names)
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided"
            }), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No selected file"
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Get top_k parameter (default: 3)
        top_k = request.form.get('top_k', 3, type=int)
        if top_k < 1 or top_k > 10:
            top_k = 3
        
        # Load image
        image = Image.open(BytesIO(file.read()))
        
        # Get model service and make prediction (French)
        service = get_model_service()
        result = service.get_prediction_result_french(image, top_k=top_k)
        
        logger.info(f"Prediction successful (FR): {result['top_prediction']['species']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error during prediction (FR): {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/predict/url', methods=['POST'])
def predict_from_url():
    """
    Predict bird species from image URL.
    
    Expected request:
        JSON body with 'url' field
        Optional: 'top_k' parameter (default: 3)
    
    Returns:
        JSON response with predictions and confidence scores
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                "success": False,
                "error": "No URL provided"
            }), 400
        
        url = data['url']
        top_k = data.get('top_k', 3)
        
        if top_k < 1 or top_k > 10:
            top_k = 3
        
        # Download and open image
        response = http_requests.get(url, timeout=10)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        
        # Get model service and make prediction
        service = get_model_service()
        result = service.get_prediction_result(image, top_k=top_k)
        
        logger.info(f"Prediction successful from URL: {result['top_prediction']['species']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error during prediction from URL: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/species', methods=['GET'])
def get_species_list():
    """
    Get list of all supported bird species.
    
    Returns:
        JSON response with list of species
    """
    try:
        service = get_model_service()
        species_list = list(service.model.config.id2label.values())
        
        return jsonify({
            "success": True,
            "count": len(species_list),
            "species": species_list
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting species list: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/llm/get-chat-birds/', methods=['POST'])
def llm_get_chat_birds():
    """
    Send a bird-related question to Ollama and stream the response token by token.

    Expected request:
        JSON body with 'message' field (string)

    Returns:
        Streaming plain-text response (text/plain)
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"success": False, "error": "No message provided"}), 400

    user_message = str(data['message'])

    system_prompt = (
        "You are an expert ornithologist assistant for the Peekaboo bird-watching application. "
        "Answer questions about birds, their species, habitats, behaviours, and characteristics. "
        "Be concise and informative."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    def generate():
        try:
            resp = http_requests.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={"model": OLLAMA_MODEL, "messages": messages, "stream": True},
                stream=True,
                timeout=120,
            )
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        yield token
                    if chunk.get("done"):
                        break
        except Exception as e:
            logger.error(f"Ollama bird-chat streaming error: {e}")
            yield f"[ERROR] {str(e)}"

    return Response(stream_with_context(generate()), content_type="text/plain; charset=utf-8")


@app.route('/llm/chat/', methods=['POST'])
def llm_chat():
    """
    General chat endpoint with light server-side history management.

    Expected request:
        JSON body with:
          - 'message' (str): user message
          - 'session_id' (str, optional): client session identifier (default: 'default')

    Returns:
        Streaming plain-text response (text/plain).
        History is kept in memory per session_id (last MAX_HISTORY_MESSAGES turns).
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"success": False, "error": "No message provided"}), 400

    user_message = str(data['message'])
    session_id = str(data.get('session_id', 'default'))

    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    history = chat_sessions[session_id]
    history.append({"role": "user", "content": user_message})

    # Trim to keep only the most recent messages
    if len(history) > MAX_HISTORY_MESSAGES:
        chat_sessions[session_id] = history[-MAX_HISTORY_MESSAGES:]
        history = chat_sessions[session_id]

    system_prompt = (
        "You are a helpful assistant for the Peekaboo bird-watching application. "
        "You can help users identify birds, learn about bird species, and answer general questions."
    )

    messages = [{"role": "system", "content": system_prompt}] + history

    def generate():
        assistant_tokens = []
        try:
            resp = http_requests.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={"model": OLLAMA_MODEL, "messages": messages, "stream": True},
                stream=True,
                timeout=120,
            )
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        assistant_tokens.append(token)
                        yield token
                    if chunk.get("done"):
                        break
        except Exception as e:
            logger.error(f"Ollama chat streaming error: {e}")
            yield f"[ERROR] {str(e)}"
        finally:
            # Persist the full assistant reply in session history
            full_reply = "".join(assistant_tokens)
            if full_reply:
                chat_sessions[session_id].append({"role": "assistant", "content": full_reply})
                if len(chat_sessions[session_id]) > MAX_HISTORY_MESSAGES:
                    chat_sessions[session_id] = chat_sessions[session_id][-MAX_HISTORY_MESSAGES:]

    return Response(stream_with_context(generate()), content_type="text/plain; charset=utf-8")


if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=8060, debug=True)

