"""
Bird Species Classification Model Service

This service handles loading and inference for the bird species classifier model.
"""
import json
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

    def load_label_translations(
        self,
        en_json_path: str = "scripts/bird_species_labels_en.json",
        fr_json_path: str = "scripts/bird_species_labels_fr.json"
    ) -> None:
        """
        Load English and French label dictionaries from JSON files.
        Also build a reverse mapping from English label to ID for fast lookup.
        """
        try:
            with open(en_json_path, "r") as f_en, open(fr_json_path, "r") as f_fr:
                self.labels_en = json.load(f_en)
                self.labels_fr = json.load(f_fr)
                # Build reverse mapping: English label -> ID
                self.en_label_to_id = {v: k for k, v in self.labels_en.items()}
        except Exception as e:
            logger.error(f"Error loading label translation files: {e}")
            self.labels_en = {}
            self.labels_fr = {}
            self.en_label_to_id = {}

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


    def predict_french(
        self,
        image: Image.Image,
        top_k: int = 3
    ) -> Tuple[List[str], List[float]]:
        """
        Predict bird species from an image and return French labels.
        """
        labels_en, confidences = self.predict(image, top_k)

        labels_fr = []
        for label_en in labels_en:
            id_str = self.en_label_to_id.get(label_en)

            if id_str and id_str in self.labels_fr:
                labels_fr.append(self.labels_fr[id_str])

            else:
                labels_fr.append(label_en)  # fallback to English


        return labels_fr, confidences
    

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
    
    def get_prediction_result_french(
        self,
        image: Image.Image,
        top_k: int = 3
    ) -> Dict:
        """
        Get structured prediction result with French species names.
        """
        labels_fr, confidences = self.predict_french(image, top_k)
        print(f"[DEBUG] get_prediction_result_french: labels_fr={labels_fr}, confidences={confidences}")
        return {
            "success": True,
            "predictions": [
                {
                    "species": label,
                    "confidence": float(conf),
                    "rank": i + 1
                }
                for i, (label, conf) in enumerate(zip(labels_fr, confidences))
            ],
            "top_prediction": {
                "species": labels_fr[0],
                "confidence": float(confidences[0])
            }
        }