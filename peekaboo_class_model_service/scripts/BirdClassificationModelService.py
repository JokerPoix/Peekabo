"""
Bird Species Classification Model Service

This service handles loading and inference for the bird species classifier model.
"""

import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
from typing import List, Tuple, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BirdClassificationModelService:
    """
    Service class for bird species classification using a pre-trained transformer model.
    
    This service loads the model once and provides methods for predicting bird species
    from images with confidence scores.
    """
    
    def __init__(self, model_name: str = "chriamue/bird-species-classifier"):
        """
        Initialize the model service.
        
        Args:
            model_name (str): HuggingFace model identifier
        """
        self.model_name = model_name
        self.processor = None
        self.model = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the model and processor from HuggingFace."""
        try:
            logger.info(f"Loading model: {self.model_name}")
            self.processor = AutoImageProcessor.from_pretrained(self.model_name)
            self.model = AutoModelForImageClassification.from_pretrained(self.model_name)
            self.model.eval()
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

    def predict(
        self, 
        image: Image.Image, 
        top_k: int = 3
    ) -> Tuple[List[str], List[float]]:
        """
        Predict bird species from an image.
        
        Args:
            image (PIL.Image.Image): Input image
            top_k (int): Number of top predictions to return
            
        Returns:
            Tuple[List[str], List[float]]: Lists of predicted labels and their confidence scores
        """
        try:
            # Ensure image is RGB
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Prepare image for the model
            inputs = self.processor(images=image, return_tensors="pt")
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            # Get probabilities
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Get top k predictions
            top_values = torch.topk(probs, k=min(top_k, probs.shape[-1]))
            top_indices = top_values.indices[0].tolist()
            top_probs = top_values.values[0].tolist()
            
            # Get predicted labels
            predicted_labels = [self.model.config.id2label[idx] for idx in top_indices]
            
            return predicted_labels, top_probs
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            raise
    
    def predict_from_path(
        self, 
        image_path: str, 
        top_k: int = 3
    ) -> Tuple[List[str], List[float]]:
        """
        Predict bird species from an image file path.
        
        Args:
            image_path (str): Path to image file
            top_k (int): Number of top predictions to return
            
        Returns:
            Tuple[List[str], List[float]]: Lists of predicted labels and their confidence scores
        """
        try:
            image = Image.open(image_path)
            return self.predict(image, top_k)
        except Exception as e:
            logger.error(f"Error loading image from {image_path}: {e}")
            raise
    
    def get_prediction_result(
        self, 
        image: Image.Image, 
        top_k: int = 3
    ) -> Dict:
        """
        Get structured prediction result with metadata.
        
        Args:
            image (PIL.Image.Image): Input image
            top_k (int): Number of top predictions to return
            
        Returns:
            Dict: Dictionary containing predictions and metadata
        """
        labels, confidences = self.predict(image, top_k)
        
        return {
            "success": True,
            "predictions": [
                {
                    "species": label,
                    "confidence": float(conf),
                    "rank": i + 1
                }
                for i, (label, conf) in enumerate(zip(labels, confidences))
            ],
            "top_prediction": {
                "species": labels[0],
                "confidence": float(confidences[0])
            }
        }