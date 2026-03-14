#!/usr/bin/env python3
"""
Backend API Testing Script for Villa Creation and Update Functionality
Tests the POST /api/admin/villas and PUT /api/admin/villas/{id} endpoints with authentication
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://malle-stays-1.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_EMAIL = "admin@mallestays.com"
ADMIN_PASSWORD = "admin123"

class VillaUpdateTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Backend-Test-Script/1.0'
        })
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def login(self):
        """Login to get session authentication"""
        try:
            self.log("🔐 Attempting admin login...")
            
            # First get the CSRF token
            csrf_response = self.session.get(f"{BASE_URL}/api/auth/csrf")
            if csrf_response.status_code == 200:
                csrf_token = csrf_response.json().get('csrfToken')
                self.log(f"Got CSRF token: {csrf_token[:20]}...")
            else:
                self.log("Failed to get CSRF token, proceeding without it")
                csrf_token = None
            
            # Prepare login data
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "redirect": "false",
                "json": "true"
            }
            
            if csrf_token:
                login_data["csrfToken"] = csrf_token
            
            # Try NextAuth signin endpoint with form data
            auth_response = self.session.post(
                f"{BASE_URL}/api/auth/callback/credentials",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            self.log(f"Auth response status: {auth_response.status_code}")
            self.log(f"Auth response text: {auth_response.text[:200]}...")
            
            # Check if we have session cookies
            cookies = self.session.cookies.get_dict()
            self.log(f"Session cookies: {list(cookies.keys())}")
            
            # Check for NextAuth session token
            has_session = any('next-auth.session-token' in cookie for cookie in cookies.keys())
            
            if has_session or auth_response.status_code == 200:
                self.log("✅ Login successful - session established")
                return True
            else:
                self.log("❌ Login failed - no session token found")
                return False
                
        except Exception as e:
            self.log(f"❌ Login error: {str(e)}", "ERROR")
            return False
    
    def test_auth_check(self):
        """Test authentication by calling a protected endpoint"""
        try:
            self.log("🔍 Testing authentication with admin stats endpoint...")
            
            response = self.session.get(f"{API_BASE}/admin/stats")
            self.log(f"Auth test response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Authentication working - got stats: {data}")
                return True
            elif response.status_code == 401:
                self.log("❌ Authentication failed - 401 Unauthorized")
                return False
            else:
                self.log(f"❌ Unexpected auth response: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Auth test error: {str(e)}", "ERROR")
            return False
    
    def get_villa_for_testing(self):
        """Get a villa to test updates on"""
        try:
            self.log("🏠 Getting villa for testing...")
            
            # First try to get all villas (public endpoint)
            response = self.session.get(f"{API_BASE}/villas")
            
            if response.status_code == 200:
                data = response.json()
                villas = data.get('villas', [])
                
                if villas:
                    villa = villas[0]  # Get first villa
                    villa_id = villa.get('id')
                    self.log(f"✅ Found villa for testing: {villa.get('name')} (ID: {villa_id})")
                    
                    # Now get full villa details using admin endpoint
                    admin_response = self.session.get(f"{API_BASE}/admin/villas/{villa_id}")
                    
                    if admin_response.status_code == 200:
                        full_villa = admin_response.json().get('villa')
                        self.log(f"✅ Got full villa details for testing")
                        return full_villa
                    else:
                        self.log(f"❌ Failed to get full villa details: {admin_response.status_code}")
                        return None
                else:
                    self.log("❌ No villas found in database")
                    return None
            else:
                self.log(f"❌ Failed to get villas: {response.status_code}")
                return None
                
        except Exception as e:
            self.log(f"❌ Error getting villa: {str(e)}", "ERROR")
            return None
    
    def test_villa_update(self, villa):
        """Test villa update functionality"""
        try:
            villa_id = villa.get('id')
            original_name = villa.get('name')
            original_description = villa.get('description')
            original_bathrooms = villa.get('bathrooms', 1)
            original_parking = villa.get('parking', 1)
            
            self.log(f"🔄 Testing villa update for: {original_name}")
            self.log(f"Original bathrooms: {original_bathrooms}, parking: {original_parking}")
            
            # Prepare update data with modified values
            update_data = {
                "name": f"{original_name} - Updated Test",
                "location": villa.get('location'),
                "description": f"{original_description} - Updated for testing",
                "category": villa.get('category'),
                "pricePerNight": villa.get('pricePerNight', 10000),
                "bedrooms": villa.get('bedrooms', 2),
                "bathrooms": original_bathrooms + 1,  # Increment bathrooms
                "maxGuests": villa.get('maxGuests', 4),
                "parking": original_parking + 1,  # Increment parking
                "amenities": villa.get('amenities', []),
                "images": villa.get('images', []),
                "mapLocation": villa.get('mapLocation', ''),
                "seoTitle": f"{original_name} - Updated Test",
                "seoDescription": "Updated SEO description for testing",
                "seoKeywords": "updated, test, villa"
            }
            
            self.log(f"Update data - bathrooms: {update_data['bathrooms']}, parking: {update_data['parking']}")
            
            # Make PUT request
            response = self.session.put(
                f"{API_BASE}/admin/villas/{villa_id}",
                json=update_data
            )
            
            self.log(f"PUT response status: {response.status_code}")
            self.log(f"PUT response body: {response.text}")
            
            if response.status_code == 200:
                response_data = response.json()
                self.log(f"✅ Villa update successful: {response_data.get('message')}")
                
                # Verify the update by fetching the villa again
                verify_response = self.session.get(f"{API_BASE}/admin/villas/{villa_id}")
                
                if verify_response.status_code == 200:
                    updated_villa = verify_response.json().get('villa')
                    
                    # Check if updates were saved correctly
                    checks = [
                        ("name", update_data['name'], updated_villa.get('name')),
                        ("description", update_data['description'], updated_villa.get('description')),
                        ("bathrooms", update_data['bathrooms'], updated_villa.get('bathrooms')),
                        ("parking", update_data['parking'], updated_villa.get('parking')),
                        ("seoTitle", update_data['seoTitle'], updated_villa.get('seoTitle')),
                    ]
                    
                    all_correct = True
                    for field, expected, actual in checks:
                        if expected == actual:
                            self.log(f"✅ {field}: {actual} (correct)")
                        else:
                            self.log(f"❌ {field}: expected {expected}, got {actual}")
                            all_correct = False
                    
                    if all_correct:
                        self.log("✅ All villa fields updated correctly!")
                        
                        # Restore original values
                        restore_data = {
                            "name": original_name,
                            "location": villa.get('location'),
                            "description": original_description,
                            "category": villa.get('category'),
                            "pricePerNight": villa.get('pricePerNight'),
                            "bedrooms": villa.get('bedrooms'),
                            "bathrooms": original_bathrooms,
                            "maxGuests": villa.get('maxGuests'),
                            "parking": original_parking,
                            "amenities": villa.get('amenities', []),
                            "images": villa.get('images', []),
                            "mapLocation": villa.get('mapLocation', ''),
                            "seoTitle": villa.get('seoTitle', original_name),
                            "seoDescription": villa.get('seoDescription', ''),
                            "seoKeywords": villa.get('seoKeywords', '')
                        }
                        
                        restore_response = self.session.put(
                            f"{API_BASE}/admin/villas/{villa_id}",
                            json=restore_data
                        )
                        
                        if restore_response.status_code == 200:
                            self.log("✅ Villa data restored to original values")
                        else:
                            self.log(f"⚠️ Failed to restore original data: {restore_response.status_code}")
                        
                        return True
                    else:
                        self.log("❌ Some villa fields were not updated correctly")
                        return False
                else:
                    self.log(f"❌ Failed to verify update: {verify_response.status_code}")
                    return False
            else:
                self.log(f"❌ Villa update failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Villa update test error: {str(e)}", "ERROR")
            return False
    
    def test_update_nonexistent_villa(self):
        """Test updating a non-existent villa"""
        try:
            self.log("🔍 Testing update of non-existent villa...")
            
            fake_id = "non-existent-villa-id"
            update_data = {
                "name": "Test Villa",
                "location": "Test Location",
                "description": "Test Description",
                "category": "luxury",
                "pricePerNight": 10000,
                "bedrooms": 2,
                "bathrooms": 2,
                "maxGuests": 4,
                "parking": 1,
                "amenities": [],
                "images": []
            }
            
            response = self.session.put(
                f"{API_BASE}/admin/villas/{fake_id}",
                json=update_data
            )
            
            self.log(f"Non-existent villa update status: {response.status_code}")
            
            if response.status_code == 404:
                self.log("✅ Correctly returned 404 for non-existent villa")
                return True
            else:
                self.log(f"❌ Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Non-existent villa test error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all villa update tests"""
        self.log("🚀 Starting Villa Update API Tests")
        self.log("=" * 50)
        
        results = {
            'login': False,
            'auth_check': False,
            'villa_update': False,
            'nonexistent_villa': False
        }
        
        # Test 1: Login
        results['login'] = self.login()
        if not results['login']:
            self.log("❌ Cannot proceed without login")
            return results
        
        # Test 2: Authentication check
        results['auth_check'] = self.test_auth_check()
        if not results['auth_check']:
            self.log("❌ Cannot proceed without authentication")
            return results
        
        # Test 3: Get villa and test update
        villa = self.get_villa_for_testing()
        if villa:
            results['villa_update'] = self.test_villa_update(villa)
        else:
            self.log("❌ Cannot test villa update without a villa")
        
        # Test 4: Test non-existent villa
        results['nonexistent_villa'] = self.test_update_nonexistent_villa()
        
        # Summary
        self.log("=" * 50)
        self.log("📊 TEST RESULTS SUMMARY:")
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            self.log(f"  {test_name}: {status}")
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        self.log(f"📈 Overall: {passed_tests}/{total_tests} tests passed")
        
        return results

def main():
    """Main test execution"""
    tester = VillaUpdateTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if all(results.values()):
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()