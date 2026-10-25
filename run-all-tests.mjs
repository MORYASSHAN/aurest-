import path from 'node:path';
import { defaultHarness } from './tests/e2e/helpers/harness.js';

// Tier 1 test files
import './tests/e2e/tier1_features/f1_media_payload.test.js';
import './tests/e2e/tier1_features/f2_privacy_cdn.test.js';
import './tests/e2e/tier1_features/f3_canvas_dirty_rect.test.js';
import './tests/e2e/tier1_features/f4_canvas_batching.test.js';
import './tests/e2e/tier1_features/f5_webgl_loop.test.js';
import './tests/e2e/tier1_features/f6_security_headers.test.js';
import './tests/e2e/tier1_features/f7_crlf_defense.test.js';
import './tests/e2e/tier1_features/f8_rate_limiter.test.js';
import './tests/e2e/tier1_features/f9_tree_shaking_bundle.test.js';
import './tests/e2e/tier1_features/f10_zero_cls.test.js';

// Tier 2 boundary test files
import './tests/e2e/tier2_boundary/f1_f2_assets_boundary.test.js';
import './tests/e2e/tier2_boundary/f3_f4_f5_canvas_webgl_boundary.test.js';
import './tests/e2e/tier2_boundary/f6_f7_f8_security_api_boundary.test.js';
import './tests/e2e/tier2_boundary/f9_f10_bundle_cls_boundary.test.js';

async function main() {
  console.log('Running all 14 test suites...');
  const summary = await defaultHarness.run();

  console.log('\n================ TEST SUMMARY ================');
  console.log(`Total tests: ${summary.total}`);
  console.log(`Passed:      ${summary.passed}`);
  console.log(`Failed:      ${summary.failed}`);
  console.log(`Duration:    ${summary.duration}ms`);
  console.log('\nTier breakdown:');
  for (const [tier, counts] of Object.entries(summary.tierBreakdown)) {
    console.log(`  ${tier}: ${counts.passed}/${counts.total} passed`);
  }

  if (summary.failed > 0) {
    console.error('\nFAILURES:');
    for (const f of summary.failures) {
      console.error(`  [FAIL] ${f.suite} -> ${f.name}`);
      console.error(`         ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL TESTS PASSED SUCCESSFULLY!');
  }
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
