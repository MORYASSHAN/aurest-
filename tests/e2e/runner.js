#!/usr/bin/env node

/**
 * AUREST Automated E2E Test Suite Master Runner
 * Executes Tiers 1-4 requirement-driven tests, validates exit codes and reports diagnostics.
 * Usage:
 *   node tests/e2e/runner.js
 *   node tests/e2e/runner.js --tier 1
 *   node tests/e2e/runner.js --tier 2
 *   node tests/e2e/runner.js --tier 3
 *   node tests/e2e/runner.js --tier 4
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { defaultHarness } from './helpers/harness.js';

// Parse CLI flags
const args = process.argv.slice(2);
let tierFilter = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tier' && args[i + 1]) {
    tierFilter = args[i + 1];
    i++;
  } else if (args[i].startsWith('--tier=')) {
    tierFilter = args[i].split('=')[1];
  }
}

// Silence expected route fallback warning when SMTP is intentionally unconfigured in test environment
const origError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[contact] SMTP_USER / SMTP_PASS are not set')) {
    return;
  }
  origError(...args);
};

// Registry of all test suite modules in execution order
const testModules = [
  // Tier 1: Feature Coverage (F1 to F10)
  './tier1_features/f1_media_payload.test.js',
  './tier1_features/f2_privacy_cdn.test.js',
  './tier1_features/f3_canvas_dirty_rect.test.js',
  './tier1_features/f4_canvas_batching.test.js',
  './tier1_features/f5_webgl_loop.test.js',
  './tier1_features/f6_security_headers.test.js',
  './tier1_features/f7_crlf_defense.test.js',
  './tier1_features/f8_rate_limiter.test.js',
  './tier1_features/f9_tree_shaking_bundle.test.js',
  './tier1_features/f10_zero_cls.test.js',

  // Tier 2: Boundary & Corner Cases (F1 to F10)
  './tier2_boundary/f1_f2_assets_boundary.test.js',
  './tier2_boundary/f3_f4_f5_canvas_webgl_boundary.test.js',
  './tier2_boundary/f6_f7_f8_security_api_boundary.test.js',
  './tier2_boundary/f9_f10_bundle_cls_boundary.test.js',

  // Tier 3: Cross-Feature Combinations
  './tier3_cross_feature/cross_feature_combinations.test.js',

  // Tier 4: Real-World Application Scenarios
  './tier4_scenarios/real_world_workloads.test.js',
];

async function main() {
  console.log('='.repeat(78));
  console.log('  AUREST BIOTECHNOLOGY PLATFORM — AUTOMATED E2E TEST RUNNER');
  console.log('  Specification: ORIGINAL_REQUEST.md & PROJECT.md (Tiers 1–4)');
  if (tierFilter) {
    console.log(`  Filtered Tier: Tier ${tierFilter}`);
  }
  console.log('='.repeat(78));
  console.log('');

  const currentDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

  // Load all test modules into the harness
  for (const modPath of testModules) {
    const absPath = path.resolve(currentDir, modPath);
    await import(pathToFileURL(absPath).href);
  }

  // Run all loaded suites through the harness
  const summary = await defaultHarness.run({
    tier: tierFilter ? `Tier ${tierFilter}` : null,
  });

  // Display results grouped by Tier
  let currentGroup = '';
  for (const r of defaultHarness.results) {
    const groupKey = `[${r.tier}] ${r.suite}`;
    if (groupKey !== currentGroup) {
      console.log(`\n--- ${groupKey} ---`);
      currentGroup = groupKey;
    }
    const icon = r.pass ? '✓' : '✗ FAIL';
    console.log(`  ${icon} ${r.name} (${r.duration}ms)`);
    if (!r.pass) {
      console.error(`      Error: ${r.error}`);
      if (r.stack) {
        console.error(`      ${r.stack.split('\n').slice(0, 3).join('\n      ')}`);
      }
    }
  }

  // Display Summary Table
  console.log('\n' + '='.repeat(78));
  console.log('  EXECUTION SUMMARY');
  console.log('='.repeat(78));
  for (const [tier, stats] of Object.entries(summary.tierBreakdown)) {
    const status = stats.failed === 0 ? 'PASS' : 'FAIL';
    console.log(
      `  ${tier.padEnd(42)} : ${String(stats.passed).padStart(3)} passed, ${String(stats.failed).padStart(2)} failed [ ${status} ]`
    );
  }
  console.log('-'.repeat(78));
  console.log(
    `  Total Tests : ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Duration: ${summary.duration}ms`
  );
  console.log('='.repeat(78));

  if (summary.failed > 0) {
    console.error(`\n❌ TEST SUITE FAILED with ${summary.failed} failure(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ ALL ${summary.total} E2E TESTS PASSED SUCCESSFULLY (Exit Code 0).`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
