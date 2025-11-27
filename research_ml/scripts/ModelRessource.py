"""
Flask API for Bird Species Classification

This API provides endpoints for uploading bird images and receiving species predictions.
"""

from flask import Flask, request, jsonify
from PIL import Image
import os
import sys
from io import BytesIO
import logging

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

# Initialize model service (singleton)
model_service = None


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_model_service() -> BirdClassificationModelService:
    """Get or create model service instance."""
    global model_service
    if model_service is None:
        model_service = BirdClassificationModelService()
    return model_service


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Bird Species Classifier API"
    }), 200


@app.route('/predict', methods=['POST'])
def predict_bird_species():
    """
    Predict bird species from uploaded image.
    
    Expected request:
        - Multipart form data with 'image' file
        - Optional: 'top_k' parameter (default: 3)
    
    Returns:
        JSON response with predictions and confidence scores
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
        
        # Get model service and make prediction
        service = get_model_service()
        result = service.get_prediction_result(image, top_k=top_k)
        
        logger.info(f"Prediction successful: {result['top_prediction']['species']}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
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
        import requests
        response = requests.get(url, timeout=10)
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


if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)

