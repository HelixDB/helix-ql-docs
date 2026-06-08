#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_JSON = path.join(REPO_ROOT, 'docs.json');
const OUT = path.join(REPO_ROOT, 'llms-full.txt');

const HEADER = `# HelixDB

> HelixDB Enterprise is an object-storage-backed graph database with integrated approximate vector search and BM25 full-text search. Queries are authored with Helix SDK DSLs or dynamic JSON and invoked over HTTP. This file is the full markdown corpus for AI agents — Enterprise architecture, concepts, guarantees, and the complete CLI v2 reference.

`;

function flattenPages(node, acc = []) {
  if (typeof node === 'string') {
    acc.push(node);
  } else if (node && Array.isArray(node.pages)) {
    for (const child of node.pages) flattenPages(child, acc);
  }
  return acc;
}

function slugToTitle(slug) {
  return slug
    .split('/')
    .pop()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadPage(slug) {
  const file = path.join(REPO_ROOT, slug + '.mdx');
  if (!fs.existsSync(file)) return { missing: true, slug };
  const raw = fs.readFileSync(file, 'utf8');

  let title = slugToTitle(slug);
  let body = raw;

  const fmMatch = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleLine = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleLine) title = titleLine[1];
    body = body.slice(fmMatch[0].length);
  }

  body = body.replace(/^import\s+[^\n]*\n/gm, '');

  body = body.replace(
    /^>\s*For the complete documentation index optimized for AI agents,\s*see \[llms\.txt\]\(\/llms\.txt\)\.\s*$/gm,
    ''
  );

  // Strip self-closing JSX components: <ComponentName ... />
  body = body.replace(/^<[A-Z][A-Za-z0-9]*\b[\s\S]*?\/>\s*$/gm, '');

  // Strip paired JSX components on their own lines: <ComponentName ...>...</ComponentName>
  body = body.replace(
    /^<([A-Z][A-Za-z0-9]*)\b[^>]*>[\s\S]*?<\/\1>\s*$/gm,
    ''
  );

  body = body.replace(/\n{3,}/g, '\n\n').trim();

  return { title, body };
}

function build() {
  const docs = JSON.parse(fs.readFileSync(DOCS_JSON, 'utf8'));
  const missingSlugs = [];
  const seenSlugs = new Set();
  const parts = [HEADER];

  for (const tab of docs.navigation.tabs) {
    for (const group of tab.groups) {
      const slugs = flattenPages(group);
      const pages = [];
      for (const slug of slugs) {
        if (seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);
        const page = loadPage(slug);
        if (page.missing) {
          missingSlugs.push(slug);
          continue;
        }
        pages.push(page);
      }
      if (pages.length === 0) continue;
      for (const p of pages) {
        parts.push(`# ${p.title}\n\n${p.body}\n`);
      }
    }
  }

  return { output: parts.join('\n') + '\n', missingSlugs };
}

const args = process.argv.slice(2);
const { output, missingSlugs } = build();

if (missingSlugs.length > 0) {
  console.error('Missing .mdx files for the following slugs in docs.json:');
  for (const s of missingSlugs) console.error(`  - ${s}`);
}

if (args.includes('--check')) {
  const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (existing !== output) {
    console.error('\nllms-full.txt is out of date. Run `npm run generate-llms` to regenerate.');
    process.exit(1);
  }
  console.log('llms-full.txt is up to date.');
} else {
  fs.writeFileSync(OUT, output);
  console.log(
    `Wrote ${path.relative(REPO_ROOT, OUT)} — ${output.length} chars${
      missingSlugs.length > 0 ? `, ${missingSlugs.length} missing slugs (see above)` : ''
    }`
  );
}
