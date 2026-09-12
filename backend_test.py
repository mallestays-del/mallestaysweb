#!/usr/bin/env python3
"""
Backend API Testing for Malle Stays - Locations CRUD API
Tests all location endpoints and villa originalPrice field
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://stays-checkout-flow.preview.emergentagent.com"
ADMIN_EMAIL = "admin@mallestays.com"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result with color"""
    status = f"{Colors.GREEN}✅ PASS{Colors.END}" if passed else f"{Colors.RED}❌ FAIL{Colors.END}"
    print(f"{status} - {name}")
    if details:
        print(f"  {details}")

def print_section(title: str):
    """Print section header"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{title}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")

def get_csrf_token(session: requests.Session) -> Optional[str]:
    """Get CSRF token from NextAuth"""
    try:
        response = session.get(f"{BASE_URL}/api/auth/csrf")
        if response.status_code == 200:
            data = response.json()
            return data.get('csrfToken')
    except Exception as e:
        print(f"Error getting CSRF token: {e}")
    return None

def login_admin(session: requests.Session) -> bool:
    """Login as admin using NextAuth credentials provider"""
    try:
        # Get CSRF token
        csrf_token = get_csrf_token(session)
        if not csrf_token:
            print_test("Get CSRF Token", False, "Failed to get CSRF token")
            return False
        
        print_test("Get CSRF Token", True, f"Token: {csrf_token[:20]}...")
        
        # Login with credentials
        login_data = {
            'email': ADMIN_EMAIL,
            'password': ADMIN_PASSWORD,
            'csrfToken': csrf_token,
            'callbackUrl': f"{BASE_URL}/admin",
            'json': 'true'
        }
        
        response = session.post(
            f"{BASE_URL}/api/auth/callback/credentials",
            data=login_data,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            allow_redirects=False
        )
        
        # Check if login was successful (NextAuth returns redirect or JSON)
        if response.status_code in [200, 302]:
            # Verify session by calling an authenticated endpoint
            verify_response = session.get(f"{BASE_URL}/api/admin/stats")
            if verify_response.status_code == 200:
                print_test("Admin Login", True, f"Logged in as {ADMIN_EMAIL}")
                return True
            else:
                print_test("Admin Login", False, f"Session verification failed: {verify_response.status_code}")
                return False
        else:
            print_test("Admin Login", False, f"Login failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_test("Admin Login", False, f"Exception: {str(e)}")
        return False

def test_get_locations_public(session: requests.Session) -> Dict[str, Any]:
    """Test GET /api/locations (public endpoint)"""
    print_section("TEST 1: GET /api/locations (Public)")
    
    try:
        response = session.get(f"{BASE_URL}/api/locations")
        
        if response.status_code != 200:
            print_test("GET /api/locations", False, f"Status: {response.status_code}")
            return {"passed": False, "locations": []}
        
        data = response.json()
        locations = data.get('locations', [])
        
        # Check structure
        if not isinstance(locations, list):
            print_test("GET /api/locations", False, "Response is not a list")
            return {"passed": False, "locations": []}
        
        print_test("GET /api/locations", True, f"Returned {len(locations)} locations")
        
        # Verify seeded locations
        expected_names = ['Lonavala', 'Alibaug', 'Karjat', 'Igatpuri', 'Neral', 'Khopoli', 'Badlapur']
        found_names = [loc.get('name') for loc in locations]
        
        seeded_found = [name for name in expected_names if name in found_names]
        print_test("Seeded Locations Present", len(seeded_found) >= 7, 
                  f"Found {len(seeded_found)}/7 seeded locations: {', '.join(seeded_found)}")
        
        # Check for Mahabaleshwar
        has_mahabaleshwar = 'Mahabaleshwar' in found_names
        if has_mahabaleshwar:
            print(f"  {Colors.YELLOW}ℹ️  Found 'Mahabaleshwar' location (will be deleted){Colors.END}")
        
        # Verify structure of first location
        if locations:
            first = locations[0]
            required_fields = ['id', 'name', 'image', 'order', 'isActive', 'createdAt']
            has_all_fields = all(field in first for field in required_fields)
            print_test("Location Structure", has_all_fields, 
                      f"Fields: {', '.join(first.keys())}")
            
            # Verify sorted by order
            orders = [loc.get('order', 999) for loc in locations]
            is_sorted = orders == sorted(orders)
            print_test("Sorted by Order", is_sorted, f"Orders: {orders[:5]}...")
            
            # Verify only active locations (isActive != false)
            inactive_count = sum(1 for loc in locations if loc.get('isActive') == False)
            print_test("Only Active Locations", inactive_count == 0, 
                      f"Inactive count: {inactive_count}")
        
        return {"passed": True, "locations": locations}
        
    except Exception as e:
        print_test("GET /api/locations", False, f"Exception: {str(e)}")
        return {"passed": False, "locations": []}

def test_get_locations_all(session: requests.Session) -> Dict[str, Any]:
    """Test GET /api/locations?all=true"""
    print_section("TEST 2: GET /api/locations?all=true")
    
    try:
        response = session.get(f"{BASE_URL}/api/locations?all=true")
        
        if response.status_code != 200:
            print_test("GET /api/locations?all=true", False, f"Status: {response.status_code}")
            return {"passed": False, "locations": []}
        
        data = response.json()
        locations = data.get('locations', [])
        
        print_test("GET /api/locations?all=true", True, f"Returned {len(locations)} locations (including inactive)")
        
        # Check if it includes inactive locations
        inactive_count = sum(1 for loc in locations if loc.get('isActive') == False)
        print(f"  {Colors.YELLOW}ℹ️  Inactive locations: {inactive_count}{Colors.END}")
        
        return {"passed": True, "locations": locations}
        
    except Exception as e:
        print_test("GET /api/locations?all=true", False, f"Exception: {str(e)}")
        return {"passed": False, "locations": []}

def test_create_location(session: requests.Session) -> Optional[str]:
    """Test POST /api/admin/locations"""
    print_section("TEST 3: POST /api/admin/locations (Create)")
    
    # Test 1: Create without auth (should fail)
    try:
        no_auth_session = requests.Session()
        response = no_auth_session.post(
            f"{BASE_URL}/api/admin/locations",
            json={"name": "Test Location", "image": "https://example.com/test.jpg"}
        )
        
        print_test("Create Without Auth", response.status_code == 401, 
                  f"Status: {response.status_code} (expected 401)")
    except Exception as e:
        print_test("Create Without Auth", False, f"Exception: {str(e)}")
    
    # Test 2: Create with missing name (should fail)
    try:
        response = session.post(
            f"{BASE_URL}/api/admin/locations",
            json={"image": "https://example.com/test.jpg"}
        )
        
        print_test("Create Without Name", response.status_code == 400, 
                  f"Status: {response.status_code} (expected 400)")
    except Exception as e:
        print_test("Create Without Name", False, f"Exception: {str(e)}")
    
    # Test 3: Create valid location
    try:
        test_location = {
            "name": "Test Location Mumbai",
            "image": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400"
        }
        
        response = session.post(
            f"{BASE_URL}/api/admin/locations",
            json=test_location
        )
        
        if response.status_code == 200:
            data = response.json()
            location = data.get('location', {})
            location_id = location.get('id')
            
            print_test("Create Valid Location", True, 
                      f"Created location ID: {location_id}")
            print(f"  Location: {location.get('name')}, Order: {location.get('order')}, Active: {location.get('isActive')}")
            
            return location_id
        else:
            print_test("Create Valid Location", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return None
            
    except Exception as e:
        print_test("Create Valid Location", False, f"Exception: {str(e)}")
        return None

def test_create_duplicate_location(session: requests.Session):
    """Test POST /api/admin/locations with duplicate name"""
    print_section("TEST 4: POST /api/admin/locations (Duplicate)")
    
    try:
        # Try to create duplicate "Lonavala"
        response = session.post(
            f"{BASE_URL}/api/admin/locations",
            json={"name": "Lonavala", "image": "https://example.com/test.jpg"}
        )
        
        print_test("Create Duplicate Location", response.status_code == 409, 
                  f"Status: {response.status_code} (expected 409 Conflict)")
        
        if response.status_code == 409:
            data = response.json()
            print(f"  Error message: {data.get('error')}")
            
    except Exception as e:
        print_test("Create Duplicate Location", False, f"Exception: {str(e)}")

def test_update_location(session: requests.Session, location_id: str) -> bool:
    """Test PUT /api/admin/locations/:id"""
    print_section("TEST 5: PUT /api/admin/locations/:id (Update)")
    
    if not location_id:
        print_test("Update Location", False, "No location ID provided")
        return False
    
    # Test 1: Update name
    try:
        response = session.put(
            f"{BASE_URL}/api/admin/locations/{location_id}",
            json={"name": "Test Location Mumbai Updated"}
        )
        
        if response.status_code == 200:
            data = response.json()
            location = data.get('location', {})
            print_test("Update Location Name", True, 
                      f"Updated name: {location.get('name')}")
        else:
            print_test("Update Location Name", False, 
                      f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        print_test("Update Location Name", False, f"Exception: {str(e)}")
        return False
    
    # Test 2: Update order
    try:
        response = session.put(
            f"{BASE_URL}/api/admin/locations/{location_id}",
            json={"order": 999}
        )
        
        if response.status_code == 200:
            data = response.json()
            location = data.get('location', {})
            print_test("Update Location Order", True, 
                      f"Updated order: {location.get('order')}")
        else:
            print_test("Update Location Order", False, 
                      f"Status: {response.status_code}")
            
    except Exception as e:
        print_test("Update Location Order", False, f"Exception: {str(e)}")
    
    # Test 3: Set isActive to false (hide location)
    try:
        response = session.put(
            f"{BASE_URL}/api/admin/locations/{location_id}",
            json={"isActive": False}
        )
        
        if response.status_code == 200:
            data = response.json()
            location = data.get('location', {})
            print_test("Set Location Inactive", True, 
                      f"isActive: {location.get('isActive')}")
            return True
        else:
            print_test("Set Location Inactive", False, 
                      f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        print_test("Set Location Inactive", False, f"Exception: {str(e)}")
        return False

def test_inactive_location_visibility(session: requests.Session, location_id: str):
    """Test that isActive=false hides location from public GET but shows in ?all=true"""
    print_section("TEST 6: Inactive Location Visibility")
    
    if not location_id:
        print_test("Inactive Location Visibility", False, "No location ID provided")
        return
    
    # Test 1: Should NOT appear in public GET
    try:
        response = session.get(f"{BASE_URL}/api/locations")
        data = response.json()
        locations = data.get('locations', [])
        
        found = any(loc.get('id') == location_id for loc in locations)
        print_test("Hidden from Public GET", not found, 
                  f"Location {'found' if found else 'not found'} in public list")
        
    except Exception as e:
        print_test("Hidden from Public GET", False, f"Exception: {str(e)}")
    
    # Test 2: SHOULD appear in GET ?all=true
    try:
        response = session.get(f"{BASE_URL}/api/locations?all=true")
        data = response.json()
        locations = data.get('locations', [])
        
        found = any(loc.get('id') == location_id for loc in locations)
        print_test("Visible in GET ?all=true", found, 
                  f"Location {'found' if found else 'not found'} in ?all=true list")
        
    except Exception as e:
        print_test("Visible in GET ?all=true", False, f"Exception: {str(e)}")

def test_update_nonexistent_location(session: requests.Session):
    """Test PUT /api/admin/locations/:id with non-existent ID"""
    print_section("TEST 7: PUT Non-existent Location")
    
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = session.put(
            f"{BASE_URL}/api/admin/locations/{fake_id}",
            json={"name": "Should Not Work"}
        )
        
        print_test("Update Non-existent Location", response.status_code == 404, 
                  f"Status: {response.status_code} (expected 404)")
        
    except Exception as e:
        print_test("Update Non-existent Location", False, f"Exception: {str(e)}")

def test_delete_location(session: requests.Session, location_id: str) -> bool:
    """Test DELETE /api/admin/locations/:id"""
    print_section("TEST 8: DELETE /api/admin/locations/:id")
    
    if not location_id:
        print_test("Delete Location", False, "No location ID provided")
        return False
    
    # Test 1: Delete without auth (should fail)
    try:
        no_auth_session = requests.Session()
        response = no_auth_session.delete(f"{BASE_URL}/api/admin/locations/{location_id}")
        
        print_test("Delete Without Auth", response.status_code == 401, 
                  f"Status: {response.status_code} (expected 401)")
    except Exception as e:
        print_test("Delete Without Auth", False, f"Exception: {str(e)}")
    
    # Test 2: Delete with auth
    try:
        response = session.delete(f"{BASE_URL}/api/admin/locations/{location_id}")
        
        if response.status_code == 200:
            print_test("Delete Location", True, f"Deleted location ID: {location_id}")
            
            # Verify deletion
            verify_response = session.get(f"{BASE_URL}/api/locations?all=true")
            data = verify_response.json()
            locations = data.get('locations', [])
            still_exists = any(loc.get('id') == location_id for loc in locations)
            
            print_test("Verify Deletion", not still_exists, 
                      f"Location {'still exists' if still_exists else 'successfully deleted'}")
            return True
        else:
            print_test("Delete Location", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test("Delete Location", False, f"Exception: {str(e)}")
        return False

def test_delete_nonexistent_location(session: requests.Session):
    """Test DELETE /api/admin/locations/:id with non-existent ID"""
    print_section("TEST 9: DELETE Non-existent Location")
    
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = session.delete(f"{BASE_URL}/api/admin/locations/{fake_id}")
        
        print_test("Delete Non-existent Location", response.status_code == 404, 
                  f"Status: {response.status_code} (expected 404)")
        
    except Exception as e:
        print_test("Delete Non-existent Location", False, f"Exception: {str(e)}")

def cleanup_mahabaleshwar(session: requests.Session):
    """Delete Mahabaleshwar location if it exists"""
    print_section("CLEANUP: Delete Mahabaleshwar Location")
    
    try:
        # Get all locations
        response = session.get(f"{BASE_URL}/api/locations?all=true")
        data = response.json()
        locations = data.get('locations', [])
        
        # Find Mahabaleshwar
        mahabaleshwar = next((loc for loc in locations if loc.get('name') == 'Mahabaleshwar'), None)
        
        if mahabaleshwar:
            location_id = mahabaleshwar.get('id')
            delete_response = session.delete(f"{BASE_URL}/api/admin/locations/{location_id}")
            
            if delete_response.status_code == 200:
                print_test("Delete Mahabaleshwar", True, f"Deleted location ID: {location_id}")
            else:
                print_test("Delete Mahabaleshwar", False, 
                          f"Status: {delete_response.status_code}")
        else:
            print(f"  {Colors.YELLOW}ℹ️  Mahabaleshwar location not found (nothing to clean up){Colors.END}")
            
    except Exception as e:
        print_test("Delete Mahabaleshwar", False, f"Exception: {str(e)}")

def test_villas_original_price(session: requests.Session):
    """Test GET /api/villas returns originalPrice field"""
    print_section("TEST 10: GET /api/villas - originalPrice Field")
    
    try:
        response = session.get(f"{BASE_URL}/api/villas")
        
        if response.status_code != 200:
            print_test("GET /api/villas", False, f"Status: {response.status_code}")
            return
        
        data = response.json()
        villas = data.get('villas', [])
        
        print_test("GET /api/villas", True, f"Returned {len(villas)} villas")
        
        # Check for rudra-villa specifically
        rudra = next((v for v in villas if v.get('slug') == 'rudra-villa'), None)
        
        if rudra:
            has_original_price = 'originalPrice' in rudra
            original_price = rudra.get('originalPrice')
            price_per_night = rudra.get('pricePerNight')
            
            print_test("Rudra Villa Has originalPrice Field", has_original_price, 
                      f"originalPrice: {original_price}, pricePerNight: {price_per_night}")
            
            if original_price == 24000 and price_per_night == 20000:
                print_test("Rudra Villa Price Values", True, 
                          "originalPrice=24000, pricePerNight=20000 ✓")
            else:
                print_test("Rudra Villa Price Values", False, 
                          f"Expected originalPrice=24000, pricePerNight=20000, got {original_price}, {price_per_night}")
        else:
            print(f"  {Colors.YELLOW}ℹ️  Rudra Villa not found in results{Colors.END}")
        
        # Check if any villa has originalPrice
        villas_with_original = [v for v in villas if v.get('originalPrice') is not None]
        print(f"  {Colors.YELLOW}ℹ️  {len(villas_with_original)}/{len(villas)} villas have originalPrice set{Colors.END}")
        
    except Exception as e:
        print_test("GET /api/villas", False, f"Exception: {str(e)}")

def main():
    """Main test execution"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Malle Stays - Locations CRUD API Testing{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    
    # Create session with cookies
    session = requests.Session()
    
    # Step 1: Login
    print_section("AUTHENTICATION")
    if not login_admin(session):
        print(f"\n{Colors.RED}❌ Authentication failed. Cannot proceed with tests.{Colors.END}")
        sys.exit(1)
    
    # Step 2: Test public GET endpoints
    test_get_locations_public(session)
    test_get_locations_all(session)
    
    # Step 3: Test CREATE
    location_id = test_create_location(session)
    test_create_duplicate_location(session)
    
    # Step 4: Test UPDATE
    if location_id:
        test_update_location(session, location_id)
        test_inactive_location_visibility(session, location_id)
    
    test_update_nonexistent_location(session)
    
    # Step 5: Test DELETE
    if location_id:
        test_delete_location(session, location_id)
    
    test_delete_nonexistent_location(session)
    
    # Step 6: Cleanup Mahabaleshwar
    cleanup_mahabaleshwar(session)
    
    # Step 7: Test villas originalPrice
    test_villas_original_price(session)
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}✅ Testing Complete!{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()
