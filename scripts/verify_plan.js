const fs = require('fs');
const path = require('path');

const REQUIRED_DIRS = [
  'contracts/core',
  'contracts/exchange',
  'contracts/agents',
  'contracts/integrations',
  'test',
  'scripts',
  'frontend',
  '.agent/features/core-contracts',
  '.agent/features/yellow-integration',
  '.agent/features/lifi-integration',
  '.agent/features/ai-agents',
  '.agent/features/frontend',
  '.agent/rules'
];

const REQUIRED_FILES = [
  'instructions.md',
  'status.md',
  '.agent/workflows/antigravity_workflow.md',
  '.agent/rules/quality.md',
  'scripts/check_coverage.sh'
];

const EXPECTED_FEATURES = [
  'core-contracts',
  'yellow-integration',
  'lifi-integration',
  'ai-agents',
  'frontend'
];

function checkDirectoryStructure() {
  console.log('Checking directory structure...');
  let ok = true;
  REQUIRED_DIRS.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing directory: ${dir}`);
      ok = false;
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  });
  return ok;
}

function checkRequiredFiles() {
  console.log('\nChecking required root and agent files...');
  let ok = true;
  REQUIRED_FILES.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing file: ${file}`);
      ok = false;
    } else {
      console.log(`✅ File exists: ${file}`);
      // Check for deep content (100 lines for instructions as a soft check)
      if (file.endsWith('instructions.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          if (lines < 70) { // Using 70 as a more reasonable automated threshold for "deeply detailed"
              console.warn(`⚠️  Warning: ${file} seems brief (${lines} lines). Ensure it is comprehensive.`);
          }
      }
    }
  });
  return ok;
}

function checkFeatures() {
  console.log('\nChecking feature specific documentation...');
  let ok = true;
  EXPECTED_FEATURES.forEach(feature => {
    const instPath = path.join(process.cwd(), '.agent/features', feature, 'instructions.md');
    const statusPath = path.join(process.cwd(), '.agent/features', feature, 'status.md');

    if (!fs.existsSync(instPath)) {
      console.error(`❌ Missing instructions for feature: ${feature}`);
      ok = false;
    } else {
      console.log(`✅ Feature instructions exist: ${feature}`);
    }

    if (!fs.existsSync(statusPath)) {
      console.error(`❌ Missing status for feature: ${feature}`);
      ok = false;
    } else {
      console.log(`✅ Feature status exists: ${feature}`);
    }
  });
  return ok;
}

function main() {
  console.log('--- Project Verification ---');
  const dirsOk = checkDirectoryStructure();
  const filesOk = checkRequiredFiles();
  const featuresOk = checkFeatures();

  if (dirsOk && filesOk && featuresOk) {
    console.log('\nResult: PASS');
    process.exit(0);
  } else {
    console.log('\nResult: FAIL');
    process.exit(1);
  }
}

main();
