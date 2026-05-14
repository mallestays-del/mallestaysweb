#!/usr/bin/env python3
"""
Performance Testing Suite for Luxury Rental Test App
Tests all GET endpoints across different backend providers
"""

import requests
import json
import time
from datetime import datetime, timezone
from typing import List, Dict, Tuple
import sys

# Backend URLs
BACKENDS = {
    'preview': 'https://luxury-rental-test.preview.emergentagent.com',
    'caddy': 'https://jovial-mccarthy-2.emergent.host',
    'cloudflare': 'https://jovial-mccarthy-2.emergent.host'
}

# GET Routes to test
GET_ROUTES = [
    # Public Routes
    {
        'route': '/api/villas',
        'description': 'Get all villas',
        'params': {}
    },
    {
        'route': '/api/locations',
        'description': 'Get all locations',
        'params': {}
    },
    {
        'route': '/api/reviews',
        'description': 'Get all reviews',
        'params': {}
    },
    {
        'route': '/api/guest-reviews',
        'description': 'Get guest reviews (public)',
        'params': {}
    },
    {
        'route': '/api/villas',
        'description': 'Get villas with filters (price range)',
        'params': {'minPrice': '5000', 'maxPrice': '15000'}
    },
    {
        'route': '/api/villas/[slug]',
        'description': 'Get single villa by slug',
        'params': {}
    },
    {
        'route': '/api/villas/[villaId]/reviews',
        'description': 'Get villa reviews',
        'params': {}
    },
    # Authenticated Routes
    {
        'route': '/api/bookings',
        'description': 'Get bookings (authenticated)',
        'params': {}
    },
    {
        'route': '/api/admin/stats',
        'description': 'Get admin stats (authenticated)',
        'params': {}
    },
    {
        'route': '/api/admin/users',
        'description': 'Get admin users list (authenticated)',
        'params': {}
    },
    {
        'route': '/api/admin/guest-reviews',
        'description': 'Get admin guest reviews (authenticated)',
        'params': {}
    }
]

class PerformanceTester:
    def __init__(self):
        self.results = []
        self.timeout = 10  # seconds

    def measure_latency(self, url: str, route: str, params: Dict = None) -> Tuple[float, str]:
        """Measure latency for a single request"""
        try:
            full_url = f"{url}{route}"
            start_time = time.time()
            
            response = requests.get(
                full_url,
                params=params,
                timeout=self.timeout,
                allow_redirects=True
            )
            
            elapsed_time = (time.time() - start_time) * 1000  # Convert to ms
            return elapsed_time, None
        except requests.Timeout:
            return None, "Timeout"
        except requests.ConnectionError as e:
            return None, f"Connection Error"
        except Exception as e:
            return None, f"Error"

    def test_route(self, route_config: Dict, provider: str, backend_url: str, iterations: int = 5) -> Dict:
        """Test a single route across specified iterations"""
        route = route_config['route']
        description = route_config['description']
        params = route_config.get('params', {})
        
        latencies = []
        errors = []
        
        for i in range(iterations):
            latency, error = self.measure_latency(backend_url, route, params)
            
            if error:
                errors.append(error)
            else:
                latencies.append(latency)
            
            time.sleep(0.05)  # Small delay between requests
        
        if latencies:
            avg_latency = sum(latencies) / len(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            success_count = len(latencies)
        else:
            avg_latency = None
            min_latency = None
            max_latency = None
            success_count = 0
        
        return {
            'route': route,
            'description': description,
            'provider': provider,
            'iterations': iterations,
            'successful_requests': success_count,
            'failed_requests': len(errors),
            'avg_latency_ms': avg_latency,
            'min_latency_ms': min_latency,
            'max_latency_ms': max_latency,
            'errors': errors if errors else []
        }

    def run_tests(self, iterations: int = 5):
        """Run performance tests for all GET routes"""
        print("\n" + "="*80)
        print("LUXURY RENTAL TEST - PERFORMANCE TEST SUITE")
        print("="*80)
        
        all_results = []
        
        # Test all routes across all backends
        for backend_name, backend_url in BACKENDS.items():
            print(f"\n\nTesting Backend: {backend_name}")
            print(f"URL: {backend_url}")
            print("-" * 80)
            
            for route_config in GET_ROUTES:
                result = self.test_route(route_config, backend_name, backend_url, iterations)
                
                # Only add to results if we got valid data
                if result['successful_requests'] > 0:
                    all_results.append(result)
                    print(f"  {result['description'][:50]:50} | "
                          f"Avg: {result['avg_latency_ms']:6.1f}ms | "
                          f"Min: {result['min_latency_ms']:6.1f}ms | "
                          f"Max: {result['max_latency_ms']:6.1f}ms")
        
        return all_results

    def generate_report(self, results: List[Dict], backend_urls: Dict[str, str]) -> Dict:
        """Generate final report with aggregated metrics"""
        test_date = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        report = {
            'appName': 'luxury-rental-test',
            'testDate': test_date,
            'previewUrl': backend_urls.get('preview', ''),
            'deployedUrl': backend_urls.get('caddy', ''),
            'result': []
        }
        
        # Group results by route
        routes_data = {}
        
        for result in results:
            route = result['route']
            description = result['description']
            provider = result['provider']
            
            key = f"{route}_{description}"
            
            if key not in routes_data:
                routes_data[key] = {
                    'route': route,
                    'description': description,
                    'iterations': result['iterations'],
                    'providers_data': {}
                }
            
            routes_data[key]['providers_data'][provider] = {
                'provider': provider,
                'latencyInMs': int(round(result['avg_latency_ms'])) if result['avg_latency_ms'] else 0,
                'minLatencyInMs': int(round(result['min_latency_ms'])) if result['min_latency_ms'] else 0,
                'maxLatencyInMs': int(round(result['max_latency_ms'])) if result['max_latency_ms'] else 0
            }
        
        # Convert to final format
        for key, data in routes_data.items():
            backend_perf_result = [
                data['providers_data'][provider] 
                for provider in ['preview', 'caddy', 'cloudflare']
                if provider in data['providers_data']
            ]
            
            if backend_perf_result:
                report['result'].append({
                    'description': data['description'],
                    'iterations': data['iterations'],
                    'route': data['route'],
                    'backend_perf_result': backend_perf_result
                })
        
        return report

    def print_summary(self, results: List[Dict]):
        """Print summary of test results"""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        successful = sum(1 for r in results if r['successful_requests'] > 0)
        failed = sum(1 for r in results if r['failed_requests'] > 0)
        
        print(f"Total Tests Run: {len(results)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        
        print("\n" + "-"*80)
        print("PERFORMANCE BY PROVIDER")
        print("-"*80)
        
        # Group by provider
        by_provider = {}
        for result in results:
            provider = result['provider']
            if provider not in by_provider:
                by_provider[provider] = []
            by_provider[provider].append(result)
        
        for provider in ['preview', 'caddy', 'cloudflare']:
            if provider in by_provider:
                avg_latencies = [r['avg_latency_ms'] for r in by_provider[provider] if r['avg_latency_ms']]
                if avg_latencies:
                    overall_avg = sum(avg_latencies) / len(avg_latencies)
                    print(f"\n{provider.upper():15} | Overall Avg: {overall_avg:6.1f}ms | "
                          f"Min: {min(avg_latencies):6.1f}ms | Max: {max(avg_latencies):6.1f}ms")


def main():
    """Main execution"""
    print("Starting performance tests...")
    
    tester = PerformanceTester()
    
    # Run tests with 5 iterations per route
    iterations = 5
    results = tester.run_tests(iterations=iterations)
    
    # Print summary
    tester.print_summary(results)
    
    # Generate report
    report = tester.generate_report(results, BACKENDS)
    
    # Print JSON report
    print("\n" + "="*80)
    print("JSON REPORT")
    print("="*80)
    print(json.dumps(report, indent=2))
    
    # Save report to file
    report_path = '/tmp/performance_test_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"\nReport saved to: {report_path}")
    
    return report


if __name__ == '__main__':
    report = main()
