#!/usr/bin/env python3
"""
Comprehensive Performance Test for all GET API Routes
Tests: preview, caddy (deployed), cloudflare (deployed)
"""

import requests
import time
import json
import sys
from datetime import datetime
from typing import Dict, Tuple, List

# Configuration
PROVIDERS = {
    'preview': 'https://malle-deployment.preview.emergentagent.com',
    'caddy': 'https://jovial-mccarthy-2.emergent.host',
    'cloudflare': 'https://jovial-mccarthy-2.emergent.host'
}

# All GET routes discovered from the backend code
GET_ROUTES = [
    ('/api/villas', 'Get all villas'),
    ('/api/villas?location=Lonavala', 'Get villas by location filter'),
    ('/api/villas?minPrice=5000&maxPrice=25000', 'Get villas by price range'),
    ('/api/villas?guests=4', 'Get villas by guest count'),
    ('/api/villas?bedrooms=2', 'Get villas by bedroom count'),
    ('/api/villas/test-villa', 'Get villa by slug'),
    ('/api/villas/test-villa/reviews', 'Get reviews for villa'),
    ('/api/locations', 'Get all locations'),
    ('/api/reviews', 'Get all reviews'),
    ('/api/reviews?villaId=test-villa-id', 'Get reviews by villa ID'),
    ('/api/guest-reviews', 'Get guest reviews'),
]

class PerfTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Performance-Test/1.0',
            'Content-Type': 'application/json'
        })
        self.session.timeout = 30
        
    def log(self, msg, level="INFO"):
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {level}: {msg}", flush=True)
        
    def test_url(self, url: str, iterations: int = 2) -> Tuple[float, float, float]:
        """Test a URL and return (avg, min, max) latencies in ms"""
        latencies = []
        
        for i in range(iterations):
            try:
                start = time.time()
                resp = self.session.get(url, timeout=30)
                elapsed = (time.time() - start) * 1000
                latencies.append(elapsed)
                
                if resp.status_code >= 400:
                    self.log(f"Status {resp.status_code}: {url}", "WARN")
            except Exception as e:
                self.log(f"Failed to test {url}: {str(e)}", "ERROR")
                # Don't retry - continue
                
        if latencies:
            return (round(sum(latencies)/len(latencies), 2), 
                   round(min(latencies), 2), 
                   round(max(latencies), 2))
        return (0, 0, 0)
    
    def run_all_tests(self, iterations: int = 2) -> List[Dict]:
        """Run tests for all routes"""
        results = []
        
        for route, description in GET_ROUTES:
            self.log(f"Testing: {description}")
            backend_results = []
            
            for provider_name, base_url in PROVIDERS.items():
                url = base_url + route
                avg, min_lat, max_lat = self.test_url(url, iterations)
                
                backend_results.append({
                    "provider": provider_name,
                    "latencyInMs": avg,
                    "minLatencyInMs": min_lat,
                    "maxLatencyInMs": max_lat
                })
            
            results.append({
                "description": description,
                "iterations": iterations,
                "route": route,
                "backend_perf_result": backend_results
            })
        
        return results

def main():
    tester = PerfTester()
    tester.log("Starting GET Routes Performance Tests")
    tester.log(f"Routes to test: {len(GET_ROUTES)}")
    tester.log(f"Providers: {', '.join(PROVIDERS.keys())}")
    
    results = tester.run_all_tests(iterations=2)
    
    final = {
        "appName": "malle-stays-1",
        "testDate": datetime.utcnow().isoformat() + "Z",
        "previewUrl": PROVIDERS['preview'],
        "deployedUrl": PROVIDERS['caddy'],
        "result": results
    }
    
    # Output JSON
    print("\n" + "="*80)
    print(json.dumps(final, indent=2))
    print("="*80)
    
    # Save to file
    with open('/tmp/perf_results_complete.json', 'w') as f:
        json.dump(final, f, indent=2)
    
    tester.log("Results saved to /tmp/perf_results_complete.json")
    
    return final

if __name__ == "__main__":
    main()
