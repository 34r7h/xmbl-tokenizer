const fs = require('fs');
const path = require('path');

// Configuration
const FEATURES_DIR = '.agent/features';
const MASTER_DOC = 'development-master.md';
const REQUIRED_FILES = ['instructions.md', 'status.md'];
const REQUIRED_DIRS = [
  'contracts',
  'contracts/core',
  'contracts/exchange',
  'contracts/agents',
  'contracts/integrations',
  'test',
  'scripts',
  'frontend',
];

// Read master document to extract expected features (simplified parsing logic)
// In a real scenario, this would parse markdown headers.
// For this MVP, we hardcode the expected features based on the plan.
const EXPECTED_FEATURES = [
  'core-contracts',
  'yellow-integration',
  'lifi-integration',
  'ai-agents',
  'frontend',
];

function checkDirectoryStructure() {
  console.log('Checking directory structure...');
  let missing = [];
  REQUIRED_DIRS.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      missing.push(dir);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing directories: ${missing.join(', ')}`);
    return false;
  }
  console.log('✅ Directory structure OK');
  return true;
}

function checkFeatures() {
  console.log('Checking features...');
  let missing = [];
  let incomplete = [];

  EXPECTED_FEATURES.forEach((feature) => {
    const featurePath = path.join(FEATURES_DIR, feature);
    if (!fs.existsSync(featurePath)) {
      missing.push(feature);
    } else {
      REQUIRED_FILES.forEach((file) => {
        if (!fs.existsSync(path.join(featurePath, file))) {
          incomplete.push(`${feature}/${file}`);
        }
      });
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing features: ${missing.join(', ')}`);
    return false;
  }

  if (incomplete.length > 0) {
    console.error(`❌ Incomplete features (missing files): ${incomplete.join(', ')}`);
    return false;
  }

  console.log('✅ Features OK');
  return true;
}

function main() {
  console.log('--- Project Verification ---');
  const dirsOk = checkDirectoryStructure();
  const featuresOk = checkFeatures();

  if (dirsOk && featuresOk) {
    console.log('\nResult: PASS');
    process.exit(0);
  } else {
    console.log('\nResult: FAIL');
    process.exit(1);
  }
}

main();
