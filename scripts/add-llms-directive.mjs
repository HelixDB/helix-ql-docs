#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DIRECTIVE =
  '> For the complete documentation index optimized for AI agents, see [llms.txt](/llms.txt).';
const MARKER = '[llms.txt](/llms.txt)';
const SKIP_DIRS = new Set(['node_modules', 'archive', 'snippets', '.git']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name) || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function inject(content) {
  if (content.includes(MARKER)) return null;
  const fm = content.match(/^---\n[\s\S]*?\n---\n/);
  if (fm) {
    const head = content.slice(0, fm[0].length);
    const rest = content.slice(fm[0].length);
    const sep = rest.startsWith('\n') ? '' : '\n';
    return head + '\n' + DIRECTIVE + '\n' + sep + rest;
  }
  return DIRECTIVE + '\n\n' + content;
}

const files = walk(REPO_ROOT);
let added = 0;
let skipped = 0;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const next = inject(content);
  if (next === null) {
    skipped++;
    continue;
  }
  fs.writeFileSync(f, next);
  added++;
}
console.log(`Directive added to ${added} files, skipped ${skipped} (already present).`);
