#!/usr/bin/env python3
"""
Debug upload endpoint issues
"""

import requests
import io
from PIL import Image

BASE_URL = "https://malle-stays-1.preview.emergentagent.com"

def create_test_image(size_mb=1):
    """Create a test image of specific size"""
    # Calculate dimensions for target file size
    target_size = size_mb * 1024 * 1024
    pixels_needed = target_size * 10 // 3
    dimension = int(pixels_needed ** 0.5)
    
    img = Image.new('RGB', (dimension, dimension), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=85)
    img_bytes.seek(0)
    
    return img_bytes

def test_no_file():
    """Test upload with no file"""
    print("Testing upload with no file...")
    response = requests.post(f"{BASE_URL}/api/upload", files={})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print()

def test_large_file():
    """Test upload with large file"""
    print("Testing upload with 6MB file...")
    large_image = create_test_image(6)
    
    files = {'file': ('large.jpg', large_image, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print()

def test_valid_file():
    """Test upload with valid file"""
    print("Testing upload with valid 1MB file...")
    valid_image = create_test_image(1)
    
    files = {'file': ('valid.jpg', valid_image, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print()

if __name__ == "__main__":
    test_no_file()
    test_large_file()
    test_valid_file()