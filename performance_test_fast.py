#!/usr/bin/env python3
"""
Performance Test Script for GET API Routes - Fast Version
Measures latency across Preview, Caddy, and Cloudflare providers
Uses 3 iterations per route per provider for faster testing
"""

import requests
import time
import json
from datetime import datetime
from typing import Dict, Tuple

# URLs to test
URLS = {
    'preview': 'https://malle-deployment.preview.emergentagent.com',
    'caddy': 'https://jovial-mccarthy-2.emergent.host',
    'cloudflare': 'https://jovial-mccarthy-2.emergent.host'
}

# GET routes discovered from the backend
GET_ROUTES = [
    ('/api/villas', 'Get all villas'),
    ('/api/villas?location=Lonavala', 'Get villas by location'),
    ('/api/villas?minPrice=5000&maxPrice=25000', 'Get villas by price range'),
    ('/api/locations', 'Get all locations'),
    ('/api/reviews', 'Get reviews'),
    ('/api/guest-reviews', 'Get guest reviews'),
]

class PerformanceTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Performance-Test-Script/1.0'
        })
        
    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def measure_latency(self, url: str, iterations: int = 3) -> Tuple[float, float, float]:
        """
        Measure latency for a URL
        Returns: (avg_latency, min_latency, max_latency) in milliseconds
        """
        latencies = []
        
        for _ in range(iterations):
            try:
                start_time = time.time()
                response = self.session.get(url, timeout=30)
                end_time = time.time()
                
                latency_ms = (end_time - start_time) * 1000
                latencies.append(latency_ms)
                
                if response.status_code >= 400:
                    self.log(f"Response status {response.status_code} for {url}", "WARN")
                    
            except Exception as e:
                self.log(f"Error testing {url}: {str(e)}", "ERROR")
                
        if latencies:
            avg_latency = sum(latencies) / len(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
        else:
            avg_latency = min_latency = max_latency = 0
            
        return avg_latency, min_latency, max_latency
    
    def test_route_on_provider(self, route: str, description: str, provider: str, iterations: int = 3) -> Dict:
        """Test a single route on a provider"""
        base_url = URLS[provider]
        full_url = f"{base_url}{route}"
        
        self.log(f"Testing {provider}: {description}")
        avg_latency, min_latency, max_latency = self.measure_latency(full_url, iterations)
        
        return {
            "provider": provider,
            "latencyInMs": round(avg_latency, 2),
            "minLatencyInMs": round(min_latency, 2),
            "maxLatencyInMs": round(max_latency, 2)
        }
    
    def run_tests(self, iterations: int = 3):
        """Run performance tests for all routes and providers"""
        self.log("Starting performance testing for GET routes...")
        self.log(f"Iterations per route per provider: {iterations}")
        
        test_results = []
        
        for route, description in GET_ROUTES:
            self.log(f"\n=== Testing: {description} ({route}) ===")
            
            backend_results = []
            
            for provider in ['preview', 'caddy', 'cloudflare']:
                provider_result = self.test_route_on_provider(route, description, provider, iterations)
                backend_results.append(provider_result)
            
            test_result = {
                "description": description,
                "iterations": iterations,
                "route": route,
                "backend_perf_result": backend_results
            }
            
            test_results.append(test_result)
        
        return test_results

def main():
    """Main execution"""
    tester = PerformanceTester()
    
    # Run tests with 3 iterations per route per provider
    results = tester.run_tests(iterations=3)
    
    # Prepare final result
    final_result = {
        "appName": "malle-stays-1",
        "testDate": datetime.utcnow().isoformat() + "Z",
        "previewUrl": URLS['preview'],
        "deployedUrl": URLS['caddy'],
        "result": results
    }
    
    # Print results as JSON
    print("\n" + "="*80)
    print("PERFORMANCE TEST RESULTS")
    print("="*80)
    print(json.dumps(final_result, indent=2))
    
    # Save to file
    with open('/tmp/performance_results.json', 'w') as f:
        json.dump(final_result, f, indent=2)
    
    print("\nResults saved to /tmp/performance_results.json")
    
    return final_result

if __name__ == "__main__":
    main()
