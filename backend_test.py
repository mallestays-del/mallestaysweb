#!/usr/bin/env python3
"""
Backend API Testing Script for Razorpay Payment Integration
Tests the complete payment flow from villa selection to order creation
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# Base URL from environment
BASE_URL = "https://stays-checkout-flow.preview.emergentagent.com"

def log_test(test_name, status, message=""):
    """Log test results"""
    symbol = "✅" if status == "PASS" else "❌"
    print(f"\n{symbol} {test_name}: {status}")
    if message:
        print(f"   {message}")

def test_razorpay_payment_flow():
    """Test complete Razorpay payment integration flow"""
    print("\n" + "="*80)
    print("RAZORPAY PAYMENT INTEGRATION TEST")
    print("="*80)
    
    booking_id = None
    villa_id = None
    
    try:
        # Step 1: GET /api/villas - pick rudra-villa
        print("\n[Step 1] GET /api/villas - Fetch villas list")
        response = requests.get(f"{BASE_URL}/api/villas", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/villas", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        villas = data.get('villas', [])
        
        # Find rudra-villa
        rudra_villa = None
        for villa in villas:
            if villa.get('slug') == 'rudra-villa':
                rudra_villa = villa
                villa_id = villa.get('id') or villa.get('slug')
                break
        
        if not rudra_villa:
            log_test("GET /api/villas", "FAIL", "rudra-villa not found in villas list")
            return False
        
        log_test("GET /api/villas", "PASS", f"Found rudra-villa (id: {villa_id})")
        
        # Step 2: GET /api/v1/pricing - Get pricing breakdown
        print("\n[Step 2] GET /api/v1/pricing - Get pricing for rudra-villa")
        
        # Calculate dates: 60 days ahead for check-in, +2 days for check-out
        check_in_date = (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d')
        check_out_date = (datetime.now() + timedelta(days=62)).strftime('%Y-%m-%d')
        
        pricing_url = f"{BASE_URL}/api/v1/pricing?villaId=rudra-villa&checkIn={check_in_date}&checkOut={check_out_date}&guests=2"
        response = requests.get(pricing_url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/v1/pricing", "FAIL", f"Expected 200, got {response.status_code}")
            return False
        
        pricing_data = response.json()
        breakdown = pricing_data.get('breakdown', {})
        total_amount = breakdown.get('totalAmount', 0)
        advance_amount = breakdown.get('advanceAmount', 0)
        
        if not total_amount:
            log_test("GET /api/v1/pricing", "FAIL", "No totalAmount in breakdown")
            return False
        
        log_test("GET /api/v1/pricing", "PASS", 
                f"Total: ₹{total_amount}, Advance (20%): ₹{advance_amount}")
        
        # Step 3: POST /api/v1/bookings - Create booking
        print("\n[Step 3] POST /api/v1/bookings - Create booking")
        
        booking_payload = {
            "villaId": "rudra-villa",
            "villaName": "Rudra Villa",
            "villaSlug": "rudra-villa",
            "villaLocation": "Karjat",
            "checkIn": check_in_date,
            "checkOut": check_out_date,
            "guests": 2,
            "guestName": "Rajesh Kumar",
            "guestEmail": "rajesh.kumar@example.com",
            "guestPhone": "9876543210",
            "paymentMode": "advance",
            "specialRequests": "automated test - razorpay integration",
            "pricing": breakdown
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/bookings",
            json=booking_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code not in [200, 201]:
            log_test("POST /api/v1/bookings", "FAIL", 
                    f"Expected 200/201, got {response.status_code}: {response.text}")
            return False
        
        booking_data = response.json()
        booking = booking_data.get('booking', {})
        booking_id = booking.get('bookingId')
        
        if not booking_id:
            log_test("POST /api/v1/bookings", "FAIL", "No bookingId in response")
            return False
        
        log_test("POST /api/v1/bookings", "PASS", 
                f"Booking created: {booking_id}")
        
        # Step 4: POST /api/v1/payments/create-order - Create Razorpay order (KEY TEST)
        print("\n[Step 4] POST /api/v1/payments/create-order - Create Razorpay order")
        print("⚠️  This is the critical test - checking Razorpay authentication")
        
        order_payload = {
            "bookingId": booking_id,
            "paymentMode": "advance"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/payments/create-order",
            json=order_payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 502:
            error_data = response.json()
            error_msg = error_data.get('error', 'Unknown error')
            log_test("POST /api/v1/payments/create-order", "FAIL", 
                    f"502 Bad Gateway - Razorpay API error: {error_msg}")
            print("\n🔍 DIAGNOSIS:")
            if "authentication failed" in error_msg.lower() or "401" in error_msg:
                print("   - Razorpay returned 401 Authentication Failed")
                print("   - This means RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is invalid")
                print("   - Check if the keys in /app/.env are correct")
            return False
        
        if response.status_code != 200:
            log_test("POST /api/v1/payments/create-order", "FAIL", 
                    f"Expected 200, got {response.status_code}: {response.text}")
            return False
        
        order_data = response.json()
        order_id = order_data.get('orderId')
        amount = order_data.get('amount')
        currency = order_data.get('currency')
        key_id = order_data.get('keyId')
        
        # Validate response structure
        validation_errors = []
        
        if not order_id:
            validation_errors.append("Missing orderId")
        elif not order_id.startswith('order_'):
            validation_errors.append(f"orderId doesn't start with 'order_': {order_id}")
        
        if not amount:
            validation_errors.append("Missing amount")
        else:
            # Amount should be in paise (~20% of total)
            expected_amount_paise = int(advance_amount * 100)
            if abs(amount - expected_amount_paise) > 100:  # Allow 1 rupee tolerance
                validation_errors.append(
                    f"Amount mismatch: expected ~{expected_amount_paise} paise, got {amount} paise"
                )
        
        if currency != 'INR':
            validation_errors.append(f"Currency should be 'INR', got '{currency}'")
        
        if not key_id:
            validation_errors.append("Missing keyId")
        elif not key_id.startswith('rzp_live_'):
            validation_errors.append(f"keyId doesn't start with 'rzp_live_': {key_id}")
        
        if validation_errors:
            log_test("POST /api/v1/payments/create-order", "FAIL", 
                    "Response validation failed:\n   - " + "\n   - ".join(validation_errors))
            return False
        
        log_test("POST /api/v1/payments/create-order", "PASS", 
                f"Razorpay order created successfully!\n" +
                f"   - Order ID: {order_id}\n" +
                f"   - Amount: {amount} paise (₹{amount/100})\n" +
                f"   - Currency: {currency}\n" +
                f"   - Key ID: {key_id}")
        
        # Step 5: GET /api/v1/bookings?bookingId=<id> - Verify booking updated
        print("\n[Step 5] GET /api/v1/bookings?bookingId=<id> - Verify booking updated")
        
        response = requests.get(
            f"{BASE_URL}/api/v1/bookings?bookingId={booking_id}",
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("GET /api/v1/bookings (verify update)", "FAIL", 
                    f"Expected 200, got {response.status_code}")
            return False
        
        booking_data = response.json()
        booking = booking_data.get('booking', {})
        razorpay_order_id = booking.get('razorpayOrderId')
        
        if razorpay_order_id != order_id:
            log_test("GET /api/v1/bookings (verify update)", "FAIL", 
                    f"razorpayOrderId not updated. Expected: {order_id}, Got: {razorpay_order_id}")
            return False
        
        log_test("GET /api/v1/bookings (verify update)", "PASS", 
                f"Booking updated with razorpayOrderId: {razorpay_order_id}")
        
        # Step 6: Negative test - POST /api/v1/payments/verify with fake signature
        print("\n[Step 6] POST /api/v1/payments/verify - Negative test (fake signature)")
        
        verify_payload = {
            "razorpay_payment_id": "pay_fake123456789",
            "razorpay_order_id": order_id,
            "razorpay_signature": "fake_signature_12345678901234567890123456789012",
            "bookingId": booking_id
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/payments/verify",
            json=verify_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 500:
            log_test("POST /api/v1/payments/verify (negative)", "FAIL", 
                    "Expected 400 for invalid signature, got 500 (server error)")
            return False
        
        if response.status_code != 400:
            log_test("POST /api/v1/payments/verify (negative)", "FAIL", 
                    f"Expected 400 for invalid signature, got {response.status_code}")
            return False
        
        error_data = response.json()
        error_msg = error_data.get('error', '')
        
        if 'signature' not in error_msg.lower():
            log_test("POST /api/v1/payments/verify (negative)", "FAIL", 
                    f"Expected signature error message, got: {error_msg}")
            return False
        
        log_test("POST /api/v1/payments/verify (negative)", "PASS", 
                f"Correctly rejected fake signature with 400: {error_msg}")
        
        # Step 7: Negative test - POST /api/v1/payments/create-order without bookingId
        print("\n[Step 7] POST /api/v1/payments/create-order - Negative test (no bookingId)")
        
        response = requests.post(
            f"{BASE_URL}/api/v1/payments/create-order",
            json={},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code != 400:
            log_test("POST /api/v1/payments/create-order (negative)", "FAIL", 
                    f"Expected 400 for missing bookingId, got {response.status_code}")
            return False
        
        log_test("POST /api/v1/payments/create-order (negative)", "PASS", 
                "Correctly rejected request without bookingId with 400")
        
        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED - RAZORPAY INTEGRATION WORKING!")
        print("="*80)
        return True
        
    except requests.exceptions.RequestException as e:
        log_test("Request Error", "FAIL", f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test("Unexpected Error", "FAIL", f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Cleanup: Cancel the test booking
        if booking_id:
            print("\n[Cleanup] Cancelling test booking...")
            try:
                cleanup_response = requests.put(
                    f"{BASE_URL}/api/v1/bookings",
                    json={"bookingId": booking_id, "status": "cancelled"},
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                if cleanup_response.status_code == 200:
                    print(f"✅ Test booking {booking_id} cancelled successfully")
                else:
                    print(f"⚠️  Failed to cancel booking: {cleanup_response.status_code}")
            except Exception as e:
                print(f"⚠️  Cleanup error: {str(e)}")

if __name__ == "__main__":
    success = test_razorpay_payment_flow()
    sys.exit(0 if success else 1)
