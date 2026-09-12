#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Test the villa creation (POST) functionality to identify the error shown in the admin panel. User is getting 'An error occurred' message when trying to add a new villa at /admin/villas/add with amenities: pool, wifi, gym."

backend:
  - task: "Villa Creation API - POST endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/admin/villas endpoint implemented for creating new villas with proper authentication and validation"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Villa creation API working perfectly: Successfully creates villas with all required fields (name, location, category, description, pricePerNight, bedrooms, bathrooms, maxGuests, parking, amenities, images), proper authentication required (401 without session), validation working (400 for missing fields), database persistence confirmed. Tested with exact user data: amenities ['pool', 'wifi', 'gym'] - all successful."

  - task: "Villa Creation API - Authentication"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Authentication implemented using NextAuth session validation via checkAuth function"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Authentication working correctly: Proper NextAuth session validation, returns 401 for unauthenticated requests, allows villa creation with valid admin session"

  - task: "Villa Creation API - Validation"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Field validation implemented for required fields: name, location, category, description, pricePerNight"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Validation working correctly: Returns 400 'Missing required fields' for incomplete data, accepts valid villa data with proper field types"

  - task: "Villa Update API - Authentication"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "checkAuth function return format was fixed to properly return user object and error status"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Authentication working correctly: NextAuth session established successfully, checkAuth function returns proper user object with role, admin stats endpoint accessible with valid session"

  - task: "Villa Update API - PUT endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/admin/villas/{id} endpoint implemented for updating villa details with proper authentication"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Villa update endpoint working perfectly: successfully updates all fields (name, description, pricePerNight, bedrooms, bathrooms, maxGuests, parking, amenities, images, SEO fields), properly parses numeric fields from strings, saves changes to database correctly, returns 200 with success message"

  - task: "Villa Update API - Error handling"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Error handling implemented for non-existent villa updates"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Error handling working correctly: returns 404 Not Found for non-existent villa IDs, proper error messages returned"

  - task: "Cloudinary Upload API"
    implemented: true
    working: true
    file: "/app/app/api/upload/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Cloudinary upload endpoint implemented with file validation, size limits, and proper error handling"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Upload API working correctly: validates file types (rejects non-images), validates file size (rejects >5MB), uploads to Cloudinary successfully, returns proper response structure with Cloudinary URLs"

  - task: "Guest Reviews API - GET all reviews"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/admin/guest-reviews endpoint implemented for fetching all guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - GET endpoint working correctly, returns proper JSON structure with reviews array"

  - task: "Guest Reviews API - POST create review"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/admin/guest-reviews endpoint implemented for creating new guest reviews with image URLs"
      - working: true
        agent: "testing"
        comment: "✅ PASS - POST endpoint working correctly, creates reviews with Cloudinary image URLs, returns review ID"

  - task: "Guest Reviews API - PUT update review"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/admin/guest-reviews/{id} endpoint implemented for updating guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - PUT endpoint working correctly, updates review data successfully"

  - task: "Guest Reviews API - DELETE review"
    implemented: true
    working: false
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 1
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "DELETE /api/admin/guest-reviews/{id} endpoint implemented for deleting guest reviews"
      - working: false
        agent: "testing"
        comment: "❌ FAIL - DELETE endpoint has authentication issue: session.user.role is undefined, causing 403 Forbidden error. Made minor fix to handle undefined role more gracefully, but session configuration needs review"

  - task: "Public Guest Reviews API"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/guest-reviews endpoint implemented for public display of guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Public GET endpoint working correctly, returns reviews for public display"

frontend:
  - task: "Villa Creation Frontend - Session Management"
    implemented: true
    working: false
    file: "/app/app/admin/villas/add/page.js"
    stuck_count: 1
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Frontend villa creation form implemented with NextAuth session handling"
      - working: false
        agent: "testing"
        comment: "❌ FAIL - Frontend session management issue: User gets redirected to login page when accessing /admin/villas/add, indicating session is not being maintained properly in the browser. This causes 'An error occurred' message when trying to create villas. Backend API works perfectly when proper authentication is provided."

  - task: "Frontend Integration Testing"
    implemented: false
    working: "NA"
    file: "N/A"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Frontend testing not required as per testing agent guidelines"

metadata:
  created_by: "testing_agent"
  version: "1.1"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "Villa Creation API - POST endpoint"
    - "Villa Creation Frontend - Session Management"
  stuck_tasks:
    - "Villa Creation Frontend - Session Management"
    - "Guest Reviews API - DELETE review"
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "testing"
    message: "Starting comprehensive testing of Cloudinary upload integration and guest reviews API. Will test file upload validation, Cloudinary integration, and full CRUD operations for guest reviews."
  - agent: "testing"
    message: "✅ TESTING COMPLETE - Cloudinary upload integration working excellently. All upload validations work correctly, files upload to Cloudinary successfully with proper URLs. Guest reviews CRUD mostly working - only DELETE endpoint has session role issue (403 error). Made minor fix to handle undefined role gracefully. Core functionality is solid."
  - agent: "testing"
    message: "🔄 VILLA UPDATE TESTING COMPLETE - All villa update functionality working perfectly! Authentication fixed: NextAuth session properly established, checkAuth function returns correct user object with role. PUT endpoint working flawlessly: updates all villa fields correctly (name, description, numeric fields like bathrooms/parking), proper data type parsing, database persistence verified. Error handling working: 404 for non-existent villas. The checkAuth fix resolved the authentication issues completely."
  - agent: "testing"
    message: "🏠 VILLA CREATION TESTING COMPLETE - ROOT CAUSE IDENTIFIED: Backend API is working perfectly! Villa creation POST endpoint successfully creates villas with all required fields including user's exact amenities ['pool', 'wifi', 'gym']. Authentication, validation, and database operations all working correctly. The issue is in the FRONTEND SESSION MANAGEMENT - users are being redirected to login page when accessing /admin/villas/add, indicating NextAuth session is not being maintained properly in the browser. This explains the 'An error occurred' message users see."

backend:
  - task: "Villa Update API - Authentication"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "checkAuth function return format was fixed to properly return user object and error status"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Authentication working correctly: NextAuth session established successfully, checkAuth function returns proper user object with role, admin stats endpoint accessible with valid session"

  - task: "Villa Update API - PUT endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/admin/villas/{id} endpoint implemented for updating villa details with proper authentication"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Villa update endpoint working perfectly: successfully updates all fields (name, description, pricePerNight, bedrooms, bathrooms, maxGuests, parking, amenities, images, SEO fields), properly parses numeric fields from strings, saves changes to database correctly, returns 200 with success message"

  - task: "Villa Update API - Error handling"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Error handling implemented for non-existent villa updates"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Error handling working correctly: returns 404 Not Found for non-existent villa IDs, proper error messages returned"

  - task: "Cloudinary Upload API"
    implemented: true
    working: true
    file: "/app/app/api/upload/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Cloudinary upload endpoint implemented with file validation, size limits, and proper error handling"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Upload API working correctly: validates file types (rejects non-images), validates file size (rejects >5MB), uploads to Cloudinary successfully, returns proper response structure with Cloudinary URLs"

  - task: "Guest Reviews API - GET all reviews"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/admin/guest-reviews endpoint implemented for fetching all guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - GET endpoint working correctly, returns proper JSON structure with reviews array"

  - task: "Guest Reviews API - POST create review"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/admin/guest-reviews endpoint implemented for creating new guest reviews with image URLs"
      - working: true
        agent: "testing"
        comment: "✅ PASS - POST endpoint working correctly, creates reviews with Cloudinary image URLs, returns review ID"

  - task: "Guest Reviews API - PUT update review"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/admin/guest-reviews/{id} endpoint implemented for updating guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - PUT endpoint working correctly, updates review data successfully"

  - task: "Guest Reviews API - DELETE review"
    implemented: true
    working: false
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 1
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "DELETE /api/admin/guest-reviews/{id} endpoint implemented for deleting guest reviews"
      - working: false
        agent: "testing"
        comment: "❌ FAIL - DELETE endpoint has authentication issue: session.user.role is undefined, causing 403 Forbidden error. Made minor fix to handle undefined role more gracefully, but session configuration needs review"

  - task: "Public Guest Reviews API"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/guest-reviews endpoint implemented for public display of guest reviews"
      - working: true
        agent: "testing"
        comment: "✅ PASS - Public GET endpoint working correctly, returns reviews for public display"


  - task: "Locations API - GET public endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/locations endpoint implemented with auto-seeding of 7 default locations, sorted by order, returns only active locations (isActive != false)"
      - working: true
        agent: "testing"
        comment: "✅ PASS - GET /api/locations working perfectly: Returns 7 seeded locations (Lonavala, Alibaug, Karjat, Igatpuri, Neral, Khopoli, Badlapur), proper structure with all required fields (id, name, image, order, isActive, createdAt), sorted by order ascending, only active locations returned. GET ?all=true includes inactive locations."

  - task: "Locations API - POST create location"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/admin/locations endpoint implemented with authentication, name validation, duplicate checking (case-insensitive), auto-incrementing order"
      - working: true
        agent: "testing"
        comment: "✅ PASS - POST /api/admin/locations working perfectly: Requires authentication (401 without session), validates required name field (400 if missing), checks for duplicate names case-insensitively (409 Conflict), creates location with proper structure, auto-assigns next order number, returns created location with ID."

  - task: "Locations API - PUT update location"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/admin/locations/:id endpoint implemented with authentication, supports updating name, image, order (number), isActive (boolean), duplicate name checking"
      - working: true
        agent: "testing"
        comment: "✅ PASS - PUT /api/admin/locations/:id working perfectly: Updates name with duplicate checking (409 if duplicate), updates order field, updates isActive flag, returns 404 for non-existent location IDs, returns updated location object. isActive=false correctly hides location from public GET but shows in ?all=true."

  - task: "Locations API - DELETE location"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "DELETE /api/admin/locations/:id endpoint implemented with authentication (super_admin or sub_admin only), returns 404 for non-existent IDs"
      - working: true
        agent: "testing"
        comment: "✅ PASS - DELETE /api/admin/locations/:id working perfectly: Requires authentication (401 without session), requires admin role (super_admin or sub_admin), deletes location successfully, returns 404 for non-existent IDs, deletion verified in database."

  - task: "Villas API - originalPrice field"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/villas endpoint includes originalPrice field in projection for OTA-style pricing display"
      - working: true
        agent: "testing"
        comment: "✅ PASS - GET /api/villas originalPrice field working correctly: Field included in response, rudra-villa has correct values (originalPrice=24000, pricePerNight=20000), 3/4 villas have originalPrice set."

frontend:
  - task: "Frontend Integration Testing"
    implemented: false
    working: "NA"
    file: "N/A"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Frontend testing not required as per testing agent guidelines"

metadata:
  created_by: "testing_agent"
  version: "1.2"
  test_sequence: 3
  run_ui: false

test_plan:
  current_focus:
    - "Locations API - GET public endpoint"
    - "Locations API - POST create location"
    - "Locations API - PUT update location"
    - "Locations API - DELETE location"
    - "Villas API - originalPrice field"
  stuck_tasks:
    - "Guest Reviews API - DELETE review"
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "testing"
    message: "Starting comprehensive testing of Cloudinary upload integration and guest reviews API. Will test file upload validation, Cloudinary integration, and full CRUD operations for guest reviews."
  - agent: "testing"
    message: "✅ TESTING COMPLETE - Cloudinary upload integration working excellently. All upload validations work correctly, files upload to Cloudinary successfully with proper URLs. Guest reviews CRUD mostly working - only DELETE endpoint has session role issue (403 error). Made minor fix to handle undefined role gracefully. Core functionality is solid."
  - agent: "testing"
    message: "🔄 VILLA UPDATE TESTING COMPLETE - All villa update functionality working perfectly! Authentication fixed: NextAuth session properly established, checkAuth function returns correct user object with role. PUT endpoint working flawlessly: updates all villa fields correctly (name, description, numeric fields like bathrooms/parking), proper data type parsing, database persistence verified. Error handling working: 404 for non-existent villas. The checkAuth fix resolved the authentication issues completely."
  - agent: "testing"
    message: "🎯 LOCATIONS CRUD API TESTING COMPLETE - All endpoints working perfectly! GET /api/locations returns 7 seeded locations sorted by order, GET ?all=true includes inactive locations, POST creates with auth/validation/duplicate checking (409), PUT updates name/order/isActive with duplicate checking, DELETE requires auth and returns proper 404. isActive=false correctly hides from public GET but shows in ?all=true. Villa originalPrice field confirmed working (rudra-villa: originalPrice=24000, pricePerNight=20000). All 27 test cases passed. Test data cleaned up successfully."

## Session: Premium OTA-style Price Display (Feb 2026)
- Created shared `/app/components/PriceDisplay.js` (bold current price, inline strikethrough original, "per night" below).
- Applied to: homepage carousel + property grid (`app/page.js`), listings (`app/villas/page.js`), villa detail booking card (`app/villa/[slug]/page.js`).
- `AvailabilityCalendar` now rendered on villa detail page (left column, below amenities) - verified via screenshot.
- Added `originalPrice` field support: API projection/create/update in `app/api/[[...path]]/route.js`; admin add/edit villa forms have new "Original Price" input.
- Seeded originalPrice on azure-villa/rudra-villa/serenity-villa for demo.
- Verified via screenshots on /, /villas, /villa/rudra-villa. Backend/frontend testing agents not run (small UI change).

## Session: Locations CRUD API Testing (Current)
- Tested complete Locations CRUD API implementation
- All endpoints working: GET /api/locations (public), GET ?all=true, POST /api/admin/locations, PUT /api/admin/locations/:id, DELETE /api/admin/locations/:id
- Authentication, validation, duplicate checking, error handling all working correctly
- isActive flag properly controls visibility (hidden from public, visible in ?all=true)
- Villa originalPrice field confirmed working in GET /api/villas
- 27/27 test cases passed, test data cleaned up

## Session: Admin Locations Manager (Feb 2026)
- New API: GET /api/locations (public, ?all=true for hidden), POST /api/admin/locations, PUT/DELETE /api/admin/locations/:id in app/api/[[...path]]/route.js. Backend tested: 27/27 passed.
- New admin page /app/app/admin/locations/page.js: add (Cloudinary upload or URL), edit, delete, reorder (up/down), show/hide.
- Quick-links toolbar added on /admin (Locations, Offers, Pricing, Bookings, Guest Reviews, Settings, Full Dashboard); Locations card added on /admin/dashboard.
- Homepage "Prestigious Locations" + search dropdowns, /villas location filter, and admin villa add/edit location field (datalist) now driven by /api/locations.
- Known pre-existing issue (untouched): DELETE /api/admin/guest-reviews/:id returns 403 (session.user.role undefined).
