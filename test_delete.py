#!/usr/bin/env python3
"""
Quick test of DELETE endpoint after fix
"""

import requests

BASE_URL = "https://malle-stays-1.preview.emergentagent.com"
ADMIN_EMAIL = "admin@mallestays.com"
ADMIN_PASSWORD = "admin123"

def test_delete_after_fix():
    session = requests.Session()
    
    # Authenticate
    login_url = f"{BASE_URL}/admin/login"
    session.get(login_url)
    
    auth_url = f"{BASE_URL}/api/auth/callback/credentials"
    auth_data = {
        'email': ADMIN_EMAIL,
        'password': ADMIN_PASSWORD,
        'redirect': 'false'
    }
    session.post(auth_url, data=auth_data)
    
    # Create a test review first
    review_data = {
        'guestName': 'Test Delete User',
        'location': 'Test Location',
        'reviewText': 'Test review for deletion',
        'rating': 5,
        'imageUrl': 'https://res.cloudinary.com/test/test.jpg',
        'source': 'Test'
    }
    
    response = session.post(f"{BASE_URL}/api/admin/guest-reviews", 
                           json=review_data,
                           headers={'Content-Type': 'application/json'})
    
    if response.status_code == 200:
        review_id = response.json()['review']['id']
        print(f"Created test review: {review_id}")
        
        # Now try to delete it
        delete_response = session.delete(f"{BASE_URL}/api/admin/guest-reviews/{review_id}")
        print(f"Delete status: {delete_response.status_code}")
        print(f"Delete response: {delete_response.text}")
    else:
        print(f"Failed to create test review: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_delete_after_fix()