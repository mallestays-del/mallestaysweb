#!/usr/bin/env python3
"""
Detailed debug of upload issues
"""

import requests
import io
from PIL import Image

BASE_URL = "https://malle-stays-1.preview.emergentagent.com"

def create_test_image_exact_size(size_mb):
    """Create a test image of exact size"""
    target_bytes = size_mb * 1024 * 1024
    
    # Start with a small image and adjust quality to reach target size
    img = Image.new('RGB', (1000, 1000), color='red')
    
    # Try different quality settings to get close to target size
    for quality in range(95, 10, -5):
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG', quality=quality)
        current_size = img_bytes.tell()
        
        if current_size <= target_bytes:
            img_bytes.seek(0)
            print(f"Created image: target={target_bytes} bytes, actual={current_size} bytes, quality={quality}")
            return img_bytes, current_size
    
    # If we can't get small enough, create a larger image with low quality
    img = Image.new('RGB', (2000, 2000), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=10)
    current_size = img_bytes.tell()
    img_bytes.seek(0)
    print(f"Created large image: target={target_bytes} bytes, actual={current_size} bytes")
    return img_bytes, current_size

def test_file_sizes():
    """Test different file sizes"""
    
    # Test 4MB (should pass)
    print("Testing 4MB file (should pass)...")
    img_4mb, actual_size = create_test_image_exact_size(4)
    files = {'file': ('4mb.jpg', img_4mb, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"4MB test - Status: {response.status_code}, Actual size: {actual_size} bytes")
    print(f"Response: {response.text[:200]}...")
    print()
    
    # Test 6MB (should fail)
    print("Testing 6MB file (should fail)...")
    img_6mb, actual_size = create_test_image_exact_size(6)
    files = {'file': ('6mb.jpg', img_6mb, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"6MB test - Status: {response.status_code}, Actual size: {actual_size} bytes")
    print(f"Response: {response.text[:200]}...")
    print()

def test_empty_form():
    """Test with proper form data but no file"""
    print("Testing with proper multipart form but no file...")
    
    # Send multipart form data with no file field
    response = requests.post(f"{BASE_URL}/api/upload", data={})
    print(f"Empty form - Status: {response.status_code}")
    print(f"Response: {response.text}")
    print()
    
    # Send multipart form data with empty file field
    files = {'file': ('', io.BytesIO(b''), 'application/octet-stream')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    print(f"Empty file field - Status: {response.status_code}")
    print(f"Response: {response.text}")
    print()

if __name__ == "__main__":
    test_file_sizes()
    test_empty_form()