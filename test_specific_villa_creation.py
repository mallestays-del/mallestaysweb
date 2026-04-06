#!/usr/bin/env python3
"""
Test the specific villa creation scenario mentioned by the user
"""

import requests
import json

# Configuration
BASE_URL = "https://malle-deployment.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_specific_villa_creation():
    """Test villa creation with the exact data user mentioned"""
    
    # Create session and login
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': 'Villa-Creation-Test/1.0'
    })
    
    print("🔐 Logging in...")
    
    # Get CSRF token
    csrf_response = session.get(f"{BASE_URL}/api/auth/csrf")
    csrf_token = csrf_response.json().get('csrfToken') if csrf_response.status_code == 200 else None
    
    # Login
    login_data = {
        "email": "admin@mallestays.com",
        "password": "admin123",
        "redirect": "false",
        "json": "true"
    }
    
    if csrf_token:
        login_data["csrfToken"] = csrf_token
    
    auth_response = session.post(
        f"{BASE_URL}/api/auth/callback/credentials",
        data=login_data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    print(f"Login status: {auth_response.status_code}")
    
    # Test with the exact data user mentioned
    villa_data = {
        "name": "Test Luxury Villa",
        "location": "Lonavala",
        "category": "Luxury Villa", 
        "description": "Beautiful luxury villa for testing",
        "pricePerNight": 25000,
        "bedrooms": 4,
        "bathrooms": 3,
        "maxGuests": 8,
        "parking": 2,
        "amenities": ["pool", "wifi", "gym"],  # Exact amenities user mentioned
        "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
    }
    
    print("\n🏠 Testing villa creation with user's exact data...")
    print(f"Data: {json.dumps(villa_data, indent=2)}")
    
    response = session.post(f"{API_BASE}/admin/villas", json=villa_data)
    
    print(f"\n📊 Results:")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    try:
        result = response.json()
        print(f"Response Body: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Villa created successfully!")
            print(f"Villa ID: {result.get('villa', {}).get('id')}")
        else:
            print("❌ FAILED: Villa creation failed")
            print(f"Error: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"Raw Response: {response.text}")

if __name__ == "__main__":
    test_specific_villa_creation()