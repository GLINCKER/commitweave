#!/usr/bin/env node
/**
 * Benchmark script for CommitWeave performance testing
 * Measures cold-start time for the CLI
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(process.cwd(), 'dist/bin.js');
const BENCHMARK_ITERATIONS = 5;
const TARGET_TIME_MS = 300; // Target: ≤300ms
const MAX_TIME_MS = 350; // Max allowed: ≤350ms on Windows

interface BenchmarkResult {
  iteration: number;
  timeMs: number;
  success: boolean;
}

function measureColdStart(): number {
  const start = performance.now();
  
  const result = spawnSync('node', [CLI_PATH, '--plain', '--version'], {
    stdio: 'ignore',
    timeout: 5000
  });
  
  const end = performance.now();
  
  if (result.error) {
    throw new Error(`Failed to execute CLI: ${result.error.message}`);
  }
  
  if (result.status !== 0) {
    throw new Error(`CLI exited with status ${result.status}`);
  }
  
  return end - start;
}

async function runBenchmark(): Promise<void> {
  console.log('🚀 CommitWeave Performance Benchmark');
  console.log('=====================================');
  
  // Check if CLI binary exists
  if (!existsSync(CLI_PATH)) {
    console.error(`❌ CLI binary not found at: ${CLI_PATH}`);
    console.error('   Run: npm run build');
    process.exit(1);
  }
  
  console.log(`📍 Testing CLI: ${CLI_PATH}`);
  console.log(`🎯 Target: ≤${TARGET_TIME_MS}ms`);
  console.log(`⏰ Max allowed: ≤${MAX_TIME_MS}ms`);
  console.log(`🔄 Iterations: ${BENCHMARK_ITERATIONS}\n`);
  
  const results: BenchmarkResult[] = [];
  
  // Warmup run (not counted)
  console.log('🔥 Warming up...');
  try {
    measureColdStart();
    console.log('✓ Warmup complete\n');
  } catch (error) {
    console.error('❌ Warmup failed:', error);
    process.exit(1);
  }
  
  // Run benchmark iterations
  console.log('📊 Running benchmark...');
  for (let i = 1; i <= BENCHMARK_ITERATIONS; i++) {
    try {
      const timeMs = measureColdStart();
      const success = timeMs <= MAX_TIME_MS;
      
      results.push({
        iteration: i,
        timeMs,
        success
      });
      
      const status = success ? '✓' : '❌';
      const color = success ? '\x1b[32m' : '\x1b[31m'; // Green or red
      const reset = '\x1b[0m';
      
      console.log(`  ${status} Iteration ${i}: ${color}${timeMs.toFixed(1)}ms${reset}`);
    } catch (error) {
      console.error(`  ❌ Iteration ${i}: Failed - ${error}`);
      results.push({
        iteration: i,
        timeMs: Infinity,
        success: false
      });
    }
  }
  
  // Calculate statistics
  const validResults = results.filter(r => isFinite(r.timeMs));
  const times = validResults.map(r => r.timeMs);
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length) * 100;
  
  // Report results
  console.log('\n📈 Results Summary');
  console.log('==================');
  console.log(`Average: ${avgTime.toFixed(1)}ms`);
  console.log(`Min: ${minTime.toFixed(1)}ms`);
  console.log(`Max: ${maxTime.toFixed(1)}ms`);
  console.log(`Success rate: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);
  
  // Performance assessment
  console.log('\n🎯 Performance Assessment');
  console.log('=========================');
  
  if (avgTime <= TARGET_TIME_MS) {
    console.log(`✅ EXCELLENT: Average ${avgTime.toFixed(1)}ms ≤ ${TARGET_TIME_MS}ms target`);
  } else if (avgTime <= MAX_TIME_MS) {
    console.log(`⚠️  ACCEPTABLE: Average ${avgTime.toFixed(1)}ms ≤ ${MAX_TIME_MS}ms max`);
  } else {
    console.log(`❌ NEEDS IMPROVEMENT: Average ${avgTime.toFixed(1)}ms > ${MAX_TIME_MS}ms max`);
  }
  
  if (successRate === 100) {
    console.log('✅ All iterations passed');
  } else if (successRate >= 80) {
    console.log(`⚠️  ${successRate.toFixed(1)}% success rate (some iterations failed)`);
  } else {
    console.log(`❌ Only ${successRate.toFixed(1)}% success rate (many failures)`);
  }
  
  // Platform-specific notes
  const platform = process.platform;
  console.log(`\n💻 Platform: ${platform} (${process.arch})`);
  console.log(`📦 Node.js: ${process.version}`);
  
  if (platform === 'win32' && avgTime > TARGET_TIME_MS && avgTime <= MAX_TIME_MS) {
    console.log('ℹ️  Note: Windows CI runners may be slower than the 300ms target');
  }
  
  // Exit with appropriate code
  const overallSuccess = avgTime <= MAX_TIME_MS && successRate >= 80;
  if (overallSuccess) {
    console.log('\n🎉 Benchmark PASSED');
    process.exit(0);
  } else {
    console.log('\n💥 Benchmark FAILED');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

// Run the benchmark
runBenchmark().catch((error) => {
  console.error('💥 Benchmark failed:', error);
  process.exit(1);
});