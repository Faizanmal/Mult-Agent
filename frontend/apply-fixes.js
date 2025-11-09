#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  // PluginConfiguration.tsx - fix any types
  {
    file: 'src/components/plugins/PluginConfiguration.tsx',
    replacements: [
      { from: /pluginConfig: Record<string, any>/g, to: 'pluginConfig: Record<string, unknown>' },
      { from: /config\?: Record<string, any>/g, to: 'config?: Record<string, unknown>' },
      { from: /value: any/g, to: 'value: unknown' },
    ]
  },
  // PluginHub.tsx - fix unused imports and vars
  {
    file: 'src/components/plugins/PluginHub.tsx',
    replacements: [
      { from: /  Upload,\n/g, to: '' },
      { from: /  Eye,\n/g, to: '' },
      { from: /  EyeOff,\n/g, to: '' },
      { from: /  Play,\n/g, to: '' },
      { from: /  Pause,\n/g, to: '' },
      { from: /  Filter,\n/g, to: '' },
      { from: /plugin: Plugin\) => void/g, to: 'plugin: Plugin) => void' },
    ]
  },
  // WorkflowDashboard.tsx - fix any types
  {
    file: 'src/components/workflow/WorkflowDashboard.tsx',
    replacements: [
      { from: /: any\[\]/g, to: ': unknown[]' },
      { from: /: any;/g, to: ': unknown;' },
      { from: /, type\) =>/g, to: ') =>' },
    ]
  },
  // animations.ts - fix any type
  {
    file: 'src/lib/animations.ts',
    replacements: [
      { from: /easing\?: any/g, to: 'easing?: string | number[]' },
    ]
  },
];

console.log('Applying ESLint fixes...\n');

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    fix.replacements.forEach(replacement => {
      if (content.match(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fix.file}`);
    } else {
      console.log(`⏭️  Skipped: ${fix.file} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
});

console.log('\nDone!');
