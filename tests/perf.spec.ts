/**
 * Performance tests for CommitWeave
 * Tests lazy loading and performance measurement utilities
 */

import { sinceStart, maybeReport, mark, measure } from '../src/utils/perf.js';
import { lazy, lazyCached, clearImportCache } from '../src/utils/lazyImport.js';

// Helper function for assertions
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

async function runPerformanceTests(): Promise<void> {
  console.log('🧪 Running Performance Tests');
  console.log('============================');

  let testCount = 0;
  let passedTests = 0;

  async function runTest(name: string, testFn: () => Promise<void> | void): Promise<void> {
    testCount++;
    try {
      console.log(`\n${testCount}. Testing ${name}...`);
      await testFn();
      console.log(`   ✅ ${name} passed`);
      passedTests++;
    } catch (error) {
      console.error(`   ❌ ${name} failed:`, error);
    }
  }

  // Test 1: Performance timing
  await runTest('performance timing utilities', () => {
    const startTime = sinceStart();
    assert(typeof startTime === 'number', 'sinceStart should return a number');
    assert(startTime >= 0, 'sinceStart should return a non-negative number');

    // Test mark function
    const end = mark('test-operation');
    assert(typeof end === 'function', 'mark should return a function');
    end(); // Should not throw
  });

  // Test 2: Performance reporting with debug flag
  await runTest('debug performance reporting', () => {
    // Capture console output
    const originalLog = console.log;
    let logOutput = '';
    console.log = (...args: any[]) => {
      logOutput += args.join(' ') + '\n';
    };

    // Test without debug flag
    delete process.env.COMMITWEAVE_DEBUG_PERF;
    maybeReport();
    assert(logOutput === '', 'Should not report without debug flag');

    // Test with debug flag
    process.env.COMMITWEAVE_DEBUG_PERF = '1';
    maybeReport();
    assert(logOutput.includes('cold-start:'), 'Should report with debug flag');
    assert(logOutput.includes('ms'), 'Should include time unit');

    // Restore console.log
    console.log = originalLog;
  });

  // Test 3: Measure function
  await runTest('measure function wrapper', async () => {
    let operationRan = false;

    const result = await measure('test-async-op', async () => {
      operationRan = true;
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'success';
    });

    assert(operationRan, 'Operation should have been executed');
    assert(result === 'success', 'Should return the operation result');
  });

  // Test 4: Measure function with error
  await runTest('measure function with error handling', async () => {
    try {
      await measure('test-error-op', async () => {
        throw new Error('Test error');
      });
      assert(false, 'Should have thrown an error');
    } catch (error) {
      assert(error instanceof Error, 'Should propagate the error');
      assert(error.message === 'Test error', 'Should preserve error message');
    }
  });

  // Test 5: Lazy import basic functionality
  await runTest('lazy import basic functionality', async () => {
    const result = await lazy(() => import('path'));
    assert(result, 'Should return imported module');
    assert(typeof result.join === 'function', 'Should have expected path.join function');
  });

  // Test 6: Lazy import with caching
  await runTest('lazy import with caching', async () => {
    clearImportCache();

    let importCount = 0;
    const mockFactory = async () => {
      importCount++;
      return { value: importCount };
    };

    const result1 = await lazyCached('test-module', mockFactory);
    const result2 = await lazyCached('test-module', mockFactory);

    assert(importCount === 1, 'Should only import once');
    assert(result1.value === 1, 'First result should have correct value');
    assert(result2.value === 1, 'Second result should be cached (same value)');
  });

  // Test 7: Clear import cache
  await runTest('import cache clearing', async () => {
    await lazyCached('clear-test', async () => ({ test: true }));

    clearImportCache();

    let importCount = 0;
    const result = await lazyCached('clear-test', async () => {
      importCount++;
      return { test: true };
    });

    assert(importCount === 1, 'Should import again after cache clear');
    assert(result.test === true, 'Should have correct result');
  });

  // Test 8: Performance baseline (startup time simulation)
  await runTest('startup time performance baseline', async () => {
    const startTime = performance.now();

    // Simulate typical startup operations
    await lazy(() => import('path'));
    await lazy(() => import('fs'));

    const endTime = performance.now();
    const duration = endTime - startTime;

    // These imports should be fast (well under 100ms)
    assert(duration < 100, `Lazy imports should be fast, took ${duration.toFixed(1)}ms`);
    console.log(`   📊 Lazy import performance: ${duration.toFixed(1)}ms`);
  });

  // Test 9: Performance with environment variables
  await runTest('environment variable performance flags', () => {
    const originalEnv = process.env.COMMITWEAVE_DEBUG_PERF;

    // Test enabling debug mode
    process.env.COMMITWEAVE_DEBUG_PERF = '1';

    const originalLog = console.log;
    let logged = false;
    console.log = () => {
      logged = true;
    };

    maybeReport();
    assert(logged, 'Should log when debug mode is enabled');

    // Test disabling debug mode
    delete process.env.COMMITWEAVE_DEBUG_PERF;
    logged = false;
    maybeReport();
    assert(!logged, 'Should not log when debug mode is disabled');

    // Restore
    console.log = originalLog;
    if (originalEnv) {
      process.env.COMMITWEAVE_DEBUG_PERF = originalEnv;
    }
  });

  // Test 10: Concurrent lazy imports
  await runTest('concurrent lazy imports', async () => {
    clearImportCache();

    const start = performance.now();

    // Run multiple lazy imports concurrently
    const promises = [
      lazy(() => import('path')),
      lazy(() => import('fs')),
      lazy(() => import('os')),
      lazyCached('concurrent-1', async () => ({ id: 1 })),
      lazyCached('concurrent-2', async () => ({ id: 2 }))
    ];

    const results = await Promise.all(promises);
    const end = performance.now();

    assert(results.length === 5, 'Should complete all imports');
    assert(results[0].join, 'Path module should be imported');
    assert(results[3].id === 1, 'Cached module 1 should have correct value');
    assert(results[4].id === 2, 'Cached module 2 should have correct value');

    console.log(`   📊 Concurrent import performance: ${(end - start).toFixed(1)}ms`);
  });

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedTests}/${testCount}`);
  console.log(`❌ Failed: ${testCount - passedTests}/${testCount}`);

  if (passedTests === testCount) {
    console.log('\n🎉 All performance tests passed!');
    console.log('   Performance utilities are working correctly.');

    // Show final performance measurement
    console.log('\n⚡ Final Performance Check');
    console.log('==========================');
    process.env.COMMITWEAVE_DEBUG_PERF = '1';
    maybeReport();

    process.exit(0);
  } else {
    console.log('\n💥 Some performance tests failed!');
    console.log('   Performance optimizations may not be working correctly.');
    process.exit(1);
  }
}

// Run the tests
runPerformanceTests().catch(error => {
  console.error('💥 Performance tests crashed:', error);
  process.exit(1);
});
