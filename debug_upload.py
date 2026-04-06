#!/usr/bin/env python3
"""
Create a real large file for testing
"""

import requests
import io
import os

BASE_URL = "https://malle-deployment.preview.emergentagent.com"

def create_large_file():
    """Create a real 6MB file"""
    # Create 6MB of random data
    large_data = os.urandom(6 * 1024 * 1024)
    
    # Create a fake JPEG header to make it look like an image
    jpeg_header = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00'
    jpeg_footer = b'\xff\xd9'
    
    fake_jpeg = jpeg_header + large_data + jpeg_footer
    
    return io.BytesIO(fake_jpeg), len(fake_jpeg)

def test_real_large_file():
    """Test with a real large file"""
    print("Creating real 6MB file...")
    large_file, size = create_large_file()
    
    print(f"File size: {size} bytes ({size / (1024*1024):.1f} MB)")
    
    files = {'file': ('large.jpg', large_file, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_real_large_file()