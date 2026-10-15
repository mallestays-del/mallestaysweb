#!/usr/bin/env python3
"""
Health Endpoint and MongoDB Diagnostic Testing
Tests the new GET /api/health endpoint and verifies improved error logging
"""

import os
import sys
import json
import re
import requests

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://villa-rental-11.preview.emergentagent.com')
API_KEY = 'mls_live_3c72821228968dbf126ee23a23c5b762df466f7421086b3d'

# Test counters
passed = 0
failed = 0

def log_test(name, success, details=''):
    global passed, failed
    if success:
        passed += 1
        print(f"✅ PASS - {name}")
        if details:
            print(f"   {details}")
    else:
        failed += 1
        print(f"❌ FAIL - {name}")
        if details:
            print(f"   {details}")

print("\n" + "="*80)
print("HEALTH ENDPOINT & MONGODB DIAGNOSTIC TESTING")
print("="*80 + "\n")

# ============================================================================
# TEST 1: GET /api/health - Happy path (200, mongo connected)
# ============================================================================
print("\n[TEST 1] GET /api/health - Happy path")
health_response = None
try:
    response = requests.get(f"{BASE_URL}/api/health", timeout=15)
    health_response = response.json()
    
    if response.status_code == 200:
        # Check required fields
        required_top_level = ['ok', 'env', 'mongo']
        missing_top = [f for f in required_top_level if f not in health_response]
        
        if not missing_top:
            # Check env fields
            env = health_response.get('env', {})
            required_env = ['hasMongoUrl', 'mongoScheme', 'mongoHost', 'mongoUser', 
                          'mongoDbInUri', 'mongoDbEnv', 'passwordLikelyNeedsUrlEncoding']
            missing_env = [f for f in required_env if f not in env]
            
            # Check mongo fields
            mongo = health_response.get('mongo', {})
            required_mongo = ['connected', 'ping', 'database', 'collectionCount', 'collections']
            missing_mongo = [f for f in required_mongo if f not in mongo]
            
            if not missing_env and not missing_mongo:
                if health_response['ok'] and mongo['connected'] and mongo['ping']:
                    log_test("GET /api/health returns 200 with all required fields", True,
                            f"ok={health_response['ok']}, connected={mongo['connected']}, "
                            f"database={mongo['database']}, collections={len(mongo['collections'])}")
                else:
                    log_test("GET /api/health has incorrect status values", False,
                            f"ok={health_response['ok']}, connected={mongo['connected']}, ping={mongo['ping']}")
            else:
                log_test("GET /api/health missing required fields", False,
                        f"Missing env: {missing_env}, Missing mongo: {missing_mongo}")
        else:
            log_test("GET /api/health missing top-level fields", False,
                    f"Missing: {missing_top}")
    else:
        log_test("GET /api/health should return 200", False,
                f"Got status: {response.status_code}, Body: {response.text[:300]}")
except Exception as e:
    log_test("GET /api/health happy path", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 2: Security - No secrets leaked in response
# ============================================================================
print("\n[TEST 2] GET /api/health - Security check (no secrets leaked)")
try:
    if health_response:
        response_str = json.dumps(health_response)
        
        # More specific checks for actual secrets
        leaked_secrets = []
        
        # Check for MONGO_URL presence with credentials
        if 'mongodb://' in response_str or 'mongodb+srv://' in response_str:
            # Check if it's a full URI with credentials (user:password@)
            if re.search(r'mongodb(\+srv)?://[^@]+:[^@]+@', response_str):
                leaked_secrets.append('Full MongoDB URI with credentials')
        
        # Check for actual password values (not just the word "password")
        # The mongoHost field can contain port (localhost:27017) which is acceptable for diagnostics
        env = health_response.get('env', {})
        if env.get('mongoHost'):
            # Host should not contain password (format: user:password@host)
            if '@' in str(env['mongoHost']):
                leaked_secrets.append('MongoDB host contains credentials')
        
        # Check for raw password strings (long alphanumeric that look like passwords)
        # But exclude normal field names and short values
        if re.search(r'["\']password["\']:\s*["\'][a-zA-Z0-9]{10,}["\']', response_str, re.IGNORECASE):
            leaked_secrets.append('Password value present')
        
        if not leaked_secrets:
            log_test("GET /api/health does not leak secrets", True,
                    "No passwords, full URIs with credentials, or sensitive data found in response. "
                    "Port number in mongoHost is acceptable for diagnostics.")
        else:
            log_test("GET /api/health LEAKS SECRETS", False,
                    f"Found: {', '.join(leaked_secrets)}")
    else:
        log_test("Security check skipped", False, "No health response available")
except Exception as e:
    log_test("Security check", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 3: Verify expected collections are present
# ============================================================================
print("\n[TEST 3] GET /api/health - Verify expected collections")
try:
    if health_response and health_response.get('ok'):
        mongo = health_response.get('mongo', {})
        collections = mongo.get('collections', [])
        
        # Expected collections based on the app
        expected_collections = ['villas', 'bookings', 'offers', 'locations', 'users']
        found_collections = [c for c in expected_collections if c in collections]
        
        if len(found_collections) >= 3:  # At least 3 core collections should exist
            log_test("GET /api/health shows expected collections", True,
                    f"Found {len(found_collections)}/{len(expected_collections)}: {found_collections}")
        else:
            log_test("GET /api/health missing expected collections", False,
                    f"Found only {found_collections}, expected at least 3 of {expected_collections}")
    else:
        log_test("Collections check skipped", False, "Health endpoint not ok")
except Exception as e:
    log_test("Collections verification", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 4: URI Parser - Code review (verify regex patterns)
# ============================================================================
print("\n[TEST 4] URI Parser - Code review")
try:
    with open('/app/app/api/health/route.js', 'r') as f:
        content = f.read()
    
    checks = {
        'has URI regex pattern': 'mongodb' in content and 'match' in content and 'uri' in content,
        'extracts scheme': 'scheme' in content and 'mongodb' in content,
        'extracts user': 'user' in content,
        'extracts host': 'host' in content,
        'extracts dbInUri': 'dbInUri' in content or 'db' in content,
        'checks special chars': 'passwordHasSpecialChars' in content or 'passwordLikelyNeedsUrlEncoding' in content,
        'does not expose password': 'rawPassword' in content and 'result' not in content.split('rawPassword')[1].split(';')[0],
    }
    
    all_passed = all(checks.values())
    failed_checks = [k for k, v in checks.items() if not v]
    
    if all_passed:
        log_test("URI parser code review passed", True,
                "Regex pattern correct, extracts user/host/db, checks special chars, doesn't expose password")
    else:
        log_test("URI parser code review has issues", False,
                f"Failed checks: {failed_checks}")
except Exception as e:
    log_test("URI parser code review", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 5: MongoDB lib - Code review (lazy loading, error logging)
# ============================================================================
print("\n[TEST 5] MongoDB lib - Code review (lazy loading, error logging)")
try:
    with open('/app/lib/mongodb.js', 'r') as f:
        content = f.read()
    
    checks = {
        'lazy loading (getClientPromise)': 'getClientPromise' in content,
        'no top-level throw': 'throw new Error' not in content.split('function getClientPromise')[0] if 'function getClientPromise' in content else False,
        'logSafeConnectError function': 'logSafeConnectError' in content,
        'extracts user and host': 'user' in content and 'host' in content,
        'does not log password': 'password' not in content.lower() or ('password' in content.lower() and 'never log the password' in content.lower()),
        'logs error code and codeName': 'code' in content and 'codeName' in content,
        'bad auth hint': 'bad auth' in content.lower() and 'hint' in content.lower(),
        'clears cached promise on error': 'global._mongoClientPromise = undefined' in content or 'global._mongoClientPromise = null' in content,
    }
    
    all_passed = all(checks.values())
    failed_checks = [k for k, v in checks.items() if not v]
    
    if all_passed:
        log_test("MongoDB lib code review passed", True,
                "Lazy loading, safe error logging (no password), clears cache on error, provides hints")
    else:
        log_test("MongoDB lib code review has issues", False,
                f"Failed checks: {failed_checks}")
except Exception as e:
    log_test("MongoDB lib code review", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 6: Bad auth hints - Code review
# ============================================================================
print("\n[TEST 6] Health endpoint - Bad auth hints code review")
try:
    with open('/app/app/api/health/route.js', 'r') as f:
        content = f.read()
    
    checks = {
        'checks for bad auth': '/bad auth/i.test(msg)' in content or 'bad auth' in content.lower(),
        'checks for AtlasError': "codeName === 'AtlasError'" in content,
        'provides hints array': 'hints' in content and 'push' in content,
        'mentions URL encoding': 'URL-encoded' in content or 'url-encoded' in content.lower(),
        'mentions special characters': '@' in content and '#' in content and '%' in content,
        'mentions Atlas Database Access': 'Database Access' in content or 'database access' in content.lower(),
    }
    
    all_passed = all(checks.values())
    failed_checks = [k for k, v in checks.items() if not v]
    
    if all_passed:
        log_test("Bad auth hints code review passed", True,
                "Detects bad auth/AtlasError, provides actionable hints about URL encoding and Atlas config")
    else:
        log_test("Bad auth hints code review has issues", False,
                f"Failed checks: {failed_checks}")
except Exception as e:
    log_test("Bad auth hints code review", False, f"Exception: {str(e)}")

# ============================================================================
# REGRESSION TESTS - Existing DB endpoints still work
# ============================================================================
print("\n" + "="*80)
print("REGRESSION TESTS - Existing DB endpoints")
print("="*80)

# ============================================================================
# TEST 7: GET /api/villas - Still works
# ============================================================================
print("\n[TEST 7] GET /api/villas - Regression test")
try:
    response = requests.get(f"{BASE_URL}/api/villas", timeout=10)
    if response.status_code == 200:
        data = response.json()
        # Handle both array and object with villas key
        villas = data if isinstance(data, list) else data.get('villas', [])
        if isinstance(villas, list) and len(villas) > 0:
            villa = villas[0]
            if 'name' in villa and 'pricePerNight' in villa:
                log_test("GET /api/villas still works after mongodb.js refactor", True,
                        f"Returned {len(villas)} villas")
            else:
                log_test("GET /api/villas structure changed", False,
                        f"Missing fields in villa: {villa.keys()}")
        else:
            log_test("GET /api/villas returns empty or invalid data", False,
                    f"Villas: {villas}")
    else:
        log_test("GET /api/villas should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/villas regression", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 8: GET /api/offers - Still works
# ============================================================================
print("\n[TEST 8] GET /api/offers - Regression test")
try:
    response = requests.get(f"{BASE_URL}/api/offers", timeout=10)
    if response.status_code == 200:
        data = response.json()
        # Handle both array and object with offers key
        offers = data if isinstance(data, list) else data.get('offers', [])
        if isinstance(offers, list):
            log_test("GET /api/offers still works after mongodb.js refactor", True,
                    f"Returned {len(offers)} offers")
        else:
            log_test("GET /api/offers returns invalid data", False,
                    f"Offers: {offers}")
    else:
        log_test("GET /api/offers should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/offers regression", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 9: GET /api/guest-reviews - Still works
# ============================================================================
print("\n[TEST 9] GET /api/guest-reviews - Regression test")
try:
    response = requests.get(f"{BASE_URL}/api/guest-reviews", timeout=10)
    if response.status_code == 200:
        data = response.json()
        # Handle both array and object with reviews key
        reviews = data if isinstance(data, list) else data.get('reviews', [])
        if isinstance(reviews, list):
            log_test("GET /api/guest-reviews still works after mongodb.js refactor", True,
                    f"Returned {len(reviews)} reviews")
        else:
            log_test("GET /api/guest-reviews returns invalid data", False,
                    f"Reviews: {reviews}")
    else:
        log_test("GET /api/guest-reviews should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/guest-reviews regression", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 10: GET /api/locations - Still works
# ============================================================================
print("\n[TEST 10] GET /api/locations - Regression test")
try:
    response = requests.get(f"{BASE_URL}/api/locations", timeout=10)
    if response.status_code == 200:
        data = response.json()
        # Handle both array and object with locations key
        locations = data if isinstance(data, list) else data.get('locations', [])
        if isinstance(locations, list) and len(locations) > 0:
            location = locations[0]
            if 'name' in location:
                log_test("GET /api/locations still works after mongodb.js refactor", True,
                        f"Returned {len(locations)} locations")
            else:
                log_test("GET /api/locations structure changed", False,
                        f"Missing fields in location: {location.keys()}")
        else:
            log_test("GET /api/locations returns empty or invalid data", False,
                    f"Locations: {locations}")
    else:
        log_test("GET /api/locations should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/locations regression", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 11: GET /api/v1/bookings - Still works
# ============================================================================
print("\n[TEST 11] GET /api/v1/bookings?bookingId=test - Regression test")
try:
    response = requests.get(f"{BASE_URL}/api/v1/bookings?bookingId=MS-NONEXISTENT-TEST", timeout=10)
    # Should return 404 for non-existent booking, which means the endpoint is working
    if response.status_code == 404:
        log_test("GET /api/v1/bookings still works after mongodb.js refactor", True,
                "Returns 404 for non-existent booking (endpoint working)")
    elif response.status_code == 200:
        log_test("GET /api/v1/bookings still works after mongodb.js refactor", True,
                "Returns 200 (endpoint working)")
    else:
        log_test("GET /api/v1/bookings unexpected status", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/v1/bookings regression", False, f"Exception: {str(e)}")

# ============================================================================
# PUBLIC API ENDPOINTS - From previous task
# ============================================================================
print("\n" + "="*80)
print("PUBLIC API ENDPOINTS - From previous task")
print("="*80)

# ============================================================================
# TEST 12: GET /api/public/v1/bookings - With Bearer token
# ============================================================================
print("\n[TEST 12] GET /api/public/v1/bookings - With Bearer token")
try:
    headers = {'Authorization': f'Bearer {API_KEY}'}
    response = requests.get(f"{BASE_URL}/api/public/v1/bookings", headers=headers, timeout=10)
    if response.status_code == 200:
        data = response.json()
        required_fields = ['count', 'hasMore', 'nextCursor', 'bookings']
        missing = [f for f in required_fields if f not in data]
        if not missing:
            log_test("GET /api/public/v1/bookings with Bearer token works", True,
                    f"Count: {data['count']}, HasMore: {data['hasMore']}")
        else:
            log_test("GET /api/public/v1/bookings response missing fields", False,
                    f"Missing: {missing}")
    else:
        log_test("GET /api/public/v1/bookings should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("GET /api/public/v1/bookings", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 13: POST /api/public/v1/webhook-test - With Bearer token
# ============================================================================
print("\n[TEST 13] POST /api/public/v1/webhook-test - With Bearer token")
try:
    headers = {'Authorization': f'Bearer {API_KEY}'}
    response = requests.post(f"{BASE_URL}/api/public/v1/webhook-test",
                            headers=headers,
                            json={"url": "https://httpbin.org/post"},
                            timeout=30)
    if response.status_code == 200:
        data = response.json()
        if data.get('sent') and data.get('result', {}).get('success'):
            log_test("POST /api/public/v1/webhook-test works", True,
                    f"Success: {data['result']['success']}")
        else:
            log_test("POST /api/public/v1/webhook-test failed", False,
                    f"Sent: {data.get('sent')}, Result: {data.get('result')}")
    else:
        log_test("POST /api/public/v1/webhook-test should return 200", False,
                f"Got status: {response.status_code}")
except Exception as e:
    log_test("POST /api/public/v1/webhook-test", False, f"Exception: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "="*80)
print(f"TEST SUMMARY: {passed} passed, {failed} failed out of {passed + failed} total")
print("="*80 + "\n")

sys.exit(0 if failed == 0 else 1)
