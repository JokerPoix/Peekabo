"""
Test script for the Bird Classification API

This script demonstrates how to use the API endpoints.
"""

import requests
import json


def test_predict_with_file(image_path: str, api_url: str = "http://peekaboo_class_model_service:8060"):
    """Test the /predict endpoint with a local file."""
    print(f"\n=== Testing /predict with file: {image_path} ===")
    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'top_k': 3}
        
        response = requests.post(f"{api_url}/predict", files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_predict_with_url(image_url: str, api_url: str = "http://peekaboo_class_model_service:8060"):
    """Test the /predict/url endpoint."""
    print(f"\n=== Testing /predict/url with URL: {image_url} ===")
    
    payload = {
        'url': image_url,
        'top_k': 3
    }
    
    response = requests.post(
        f"{api_url}/predict/url",
        json=payload,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_health_check(api_url: str = "http://peekaboo_class_model_service:8060"):
    """Test the /health endpoint."""
    print(f"\n=== Testing /health ===")
    
    response = requests.get(f"{api_url}/health")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_species_list(api_url: str = "http://peekaboo_class_model_service:8060"):
    """Test the /species endpoint."""
    print(f"\n=== Testing /species ===")
    
    response = requests.get(f"{api_url}/species")
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Total species: {result.get('count', 0)}")
    print(f"First 5 species: {result.get('species', [])[:5]}")


if __name__ == "__main__":
    API_URL = "http://peekaboo_class_model_service:8060"
    
    # Test health check
    test_health_check(API_URL)
    
    # Test with local file (update path as needed)
    test_predict_with_file(
        "./external_data/bird6.jpg",
        API_URL
    )
    
    # Test species list
    test_species_list(API_URL)