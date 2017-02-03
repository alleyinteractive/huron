#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cliBuildPath = path.join(__dirname, '../dist/cli/huron-cli.js');
const cliBuild = fs.readFileSync(cliBuildPath, 'utf8');

fs.writeFileSync(cliBuildPath, `#!/usr/bin/env node\n\n${cliBuild}`);
