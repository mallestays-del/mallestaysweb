#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Cloudinary Upload Integration
Tests the upload endpoint and guest reviews CRUD operations
"""

import requests
import json
import os
import io
from PIL import Image
import tempfile
import time

# Configuration
BASE_URL = "https://malle-stays-1.preview.emergentagent.com"
ADMIN_EMAIL = "admin@mallestays.com"
ADMIN_PASSWORD = "admin123"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
    
    def create_test_image(self, size_mb=1, format='JPEG'):
        """Create a test image file"""
        # Calculate dimensions for target file size
        target_size = size_mb * 1024 * 1024  # Convert MB to bytes
        # Rough estimation: JPEG compression ~10:1, so 1MB file needs ~10MB raw data
        pixels_needed = target_size * 10 // 3  # 3 bytes per pixel (RGB)
        dimension = int(pixels_needed ** 0.5)
        
        # Create image
        img = Image.new('RGB', (dimension, dimension), color='red')
        
        # Save to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format, quality=85)
        img_bytes.seek(0)
        
        return img_bytes
    
    def authenticate(self):
        """Authenticate with the admin API"""
        try:
            # First, get the login page to establish session
            login_url = f"{BASE_URL}/admin/login"
            response = self.session.get(login_url)
            
            if response.status_code != 200:
                self.log_result("Authentication Setup", False, f"Failed to access login page: {response.status_code}")
                return False
            
            # Try to authenticate via NextAuth
            auth_url = f"{BASE_URL}/api/auth/callback/credentials"
            auth_data = {
                'email': ADMIN_EMAIL,
                'password': ADMIN_PASSWORD,
                'redirect': 'false'
            }
            
            response = self.session.post(auth_url, data=auth_data)
            
            # Check if we have session cookies
            has_session = any('next-auth' in cookie.name.lower() for cookie in self.session.cookies)
            
            if has_session or response.status_code in [200, 302]:
                self.log_result("Authentication", True, "Successfully authenticated with admin credentials")
                return True
            else:
                self.log_result("Authentication", False, f"Authentication failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def test_upload_valid_image(self):
        """Test uploading a valid image file"""
        try:
            # Create a small test image (1MB)
            test_image = self.create_test_image(1, 'JPEG')
            
            files = {
                'file': ('test_image.jpg', test_image, 'image/jpeg')
            }
            
            response = self.session.post(f"{BASE_URL}/api/upload", files=files)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['success', 'url', 'publicId', 'fileName', 'message']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Upload Valid Image", False, f"Missing response fields: {missing_fields}")
                    return False
                
                # Verify Cloudinary URL
                if data['url'].startswith('https://res.cloudinary.com'):
                    self.log_result("Upload Valid Image", True, "Successfully uploaded image to Cloudinary", 
                                  f"URL: {data['url'][:50]}...")
                    return data['url']  # Return URL for later tests
                else:
                    self.log_result("Upload Valid Image", False, f"Invalid Cloudinary URL: {data['url']}")
                    return False
            else:
                self.log_result("Upload Valid Image", False, f"Upload failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Upload Valid Image", False, f"Upload test error: {str(e)}")
            return False
    
    def test_upload_file_size_validation(self):
        """Test file size validation (>5MB should fail)"""
        try:
            # Create a large test image (6MB)
            test_image = self.create_test_image(6, 'JPEG')
            
            files = {
                'file': ('large_image.jpg', test_image, 'image/jpeg')
            }
            
            response = self.session.post(f"{BASE_URL}/api/upload", files=files)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and '5MB' in data['error']:
                    self.log_result("Upload Size Validation", True, "Correctly rejected file >5MB")
                    return True
                else:
                    self.log_result("Upload Size Validation", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Upload Size Validation", False, f"Should have rejected large file, got status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Upload Size Validation", False, f"Size validation test error: {str(e)}")
            return False
    
    def test_upload_file_type_validation(self):
        """Test file type validation (non-images should fail)"""
        try:
            # Create a text file
            text_content = "This is not an image file"
            
            files = {
                'file': ('test.txt', io.StringIO(text_content), 'text/plain')
            }
            
            response = self.session.post(f"{BASE_URL}/api/upload", files=files)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'image' in data['error'].lower():
                    self.log_result("Upload Type Validation", True, "Correctly rejected non-image file")
                    return True
                else:
                    self.log_result("Upload Type Validation", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Upload Type Validation", False, f"Should have rejected non-image file, got status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Upload Type Validation", False, f"Type validation test error: {str(e)}")
            return False
    
    def test_upload_no_file(self):
        """Test upload endpoint with no file"""
        try:
            response = self.session.post(f"{BASE_URL}/api/upload", files={})
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'no file' in data['error'].lower():
                    self.log_result("Upload No File", True, "Correctly rejected request with no file")
                    return True
                else:
                    self.log_result("Upload No File", False, f"Wrong error message: {data}")
                    return False
            else:
                self.log_result("Upload No File", False, f"Should have rejected no file request, got status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Upload No File", False, f"No file test error: {str(e)}")
            return False
    
    def test_guest_reviews_get(self):
        """Test GET /api/admin/guest-reviews"""
        try:
            response = self.session.get(f"{BASE_URL}/api/admin/guest-reviews")
            
            if response.status_code == 200:
                data = response.json()
                if 'reviews' in data and isinstance(data['reviews'], list):
                    self.log_result("Guest Reviews GET", True, f"Successfully fetched {len(data['reviews'])} guest reviews")
                    return True
                else:
                    self.log_result("Guest Reviews GET", False, f"Invalid response structure: {data}")
                    return False
            elif response.status_code == 401:
                self.log_result("Guest Reviews GET", False, "Authentication required - session may have expired")
                return False
            else:
                self.log_result("Guest Reviews GET", False, f"GET request failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Guest Reviews GET", False, f"GET test error: {str(e)}")
            return False
    
    def test_guest_reviews_post(self, image_url=None):
        """Test POST /api/admin/guest-reviews"""
        try:
            # Use uploaded image URL or a placeholder
            test_image_url = image_url or "https://res.cloudinary.com/drwpabrdg/image/upload/v1/malle-stays/reviews/test_image.jpg"
            
            review_data = {
                'guestName': 'John Doe',
                'location': 'Lonavala Villa',
                'reviewText': 'Amazing stay! The villa was beautiful and the service was excellent.',
                'rating': 5,
                'imageUrl': test_image_url,
                'source': 'WhatsApp Review'
            }
            
            response = self.session.post(f"{BASE_URL}/api/admin/guest-reviews", 
                                       json=review_data,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if 'review' in data and 'id' in data['review']:
                    self.log_result("Guest Reviews POST", True, "Successfully created guest review", 
                                  f"Review ID: {data['review']['id']}")
                    return data['review']['id']  # Return ID for update/delete tests
                else:
                    self.log_result("Guest Reviews POST", False, f"Invalid response structure: {data}")
                    return False
            elif response.status_code == 401:
                self.log_result("Guest Reviews POST", False, "Authentication required - session may have expired")
                return False
            else:
                self.log_result("Guest Reviews POST", False, f"POST request failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Guest Reviews POST", False, f"POST test error: {str(e)}")
            return False
    
    def test_guest_reviews_put(self, review_id):
        """Test PUT /api/admin/guest-reviews/{id}"""
        if not review_id:
            self.log_result("Guest Reviews PUT", False, "No review ID provided for update test")
            return False
            
        try:
            updated_data = {
                'guestName': 'John Doe Updated',
                'location': 'Lonavala Villa Premium',
                'reviewText': 'Updated: Amazing stay! The villa was beautiful and the service was excellent.',
                'rating': 4,
                'imageUrl': 'https://res.cloudinary.com/drwpabrdg/image/upload/v1/malle-stays/reviews/updated_image.jpg',
                'source': 'WhatsApp Review Updated'
            }
            
            response = self.session.put(f"{BASE_URL}/api/admin/guest-reviews/{review_id}", 
                                      json=updated_data,
                                      headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'updated' in data['message'].lower():
                    self.log_result("Guest Reviews PUT", True, "Successfully updated guest review")
                    return True
                else:
                    self.log_result("Guest Reviews PUT", False, f"Unexpected response: {data}")
                    return False
            elif response.status_code == 404:
                self.log_result("Guest Reviews PUT", False, "Review not found for update")
                return False
            elif response.status_code == 401:
                self.log_result("Guest Reviews PUT", False, "Authentication required - session may have expired")
                return False
            else:
                self.log_result("Guest Reviews PUT", False, f"PUT request failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Guest Reviews PUT", False, f"PUT test error: {str(e)}")
            return False
    
    def test_guest_reviews_delete(self, review_id):
        """Test DELETE /api/admin/guest-reviews/{id}"""
        if not review_id:
            self.log_result("Guest Reviews DELETE", False, "No review ID provided for delete test")
            return False
            
        try:
            response = self.session.delete(f"{BASE_URL}/api/admin/guest-reviews/{review_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'deleted' in data['message'].lower():
                    self.log_result("Guest Reviews DELETE", True, "Successfully deleted guest review")
                    return True
                else:
                    self.log_result("Guest Reviews DELETE", False, f"Unexpected response: {data}")
                    return False
            elif response.status_code == 404:
                self.log_result("Guest Reviews DELETE", False, "Review not found for deletion")
                return False
            elif response.status_code == 401:
                self.log_result("Guest Reviews DELETE", False, "Authentication required - session may have expired")
                return False
            else:
                self.log_result("Guest Reviews DELETE", False, f"DELETE request failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Guest Reviews DELETE", False, f"DELETE test error: {str(e)}")
            return False
    
    def test_public_guest_reviews(self):
        """Test GET /api/guest-reviews (public endpoint)"""
        try:
            response = self.session.get(f"{BASE_URL}/api/guest-reviews")
            
            if response.status_code == 200:
                data = response.json()
                if 'reviews' in data and isinstance(data['reviews'], list):
                    self.log_result("Public Guest Reviews", True, f"Successfully fetched {len(data['reviews'])} public guest reviews")
                    return True
                else:
                    self.log_result("Public Guest Reviews", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_result("Public Guest Reviews", False, f"Public GET request failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Public Guest Reviews", False, f"Public GET test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Cloudinary Upload Integration Tests")
        print("=" * 60)
        
        # Authentication
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with admin tests")
            return False
        
        # Upload API Tests
        print("\n📤 Testing Upload API...")
        uploaded_image_url = self.test_upload_valid_image()
        self.test_upload_file_size_validation()
        self.test_upload_file_type_validation()
        self.test_upload_no_file()
        
        # Guest Reviews API Tests
        print("\n📝 Testing Guest Reviews API...")
        self.test_guest_reviews_get()
        review_id = self.test_guest_reviews_post(uploaded_image_url)
        
        if review_id:
            self.test_guest_reviews_put(review_id)
            self.test_guest_reviews_delete(review_id)
        
        # Public API Test
        print("\n🌐 Testing Public API...")
        self.test_public_guest_reviews()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # List failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        exit(0)
    else:
        print("\n⚠️  Some tests failed - check details above")
        exit(1)