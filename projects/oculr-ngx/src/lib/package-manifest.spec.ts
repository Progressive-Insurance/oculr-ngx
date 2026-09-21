/*
 * @license
 * Copyright (c) 2026 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const specDir = dirname(fileURLToPath(import.meta.url));
const libRoot = resolve(specDir, '..', '..');
const repoRoot = resolve(libRoot, '..', '..');
const distRoot = join(repoRoot, 'dist', 'oculr-ngx');

function listFiles(dir: string, matches: (name: string) => boolean): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, matches));
    } else if (matches(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const IMPORT_PATTERNS: RegExp[] = [
  /\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function packageRoot(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function externalPackageRoots(files: string[]): Map<string, string[]> {
  const roots = new Map<string, string[]>();
  for (const file of files) {
    for (const specifier of extractImportSpecifiers(readFileSync(file, 'utf8'))) {
      if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) {
        continue;
      }
      const root = packageRoot(specifier);
      const specifiers = roots.get(root) ?? [];
      if (!specifiers.includes(specifier)) {
        specifiers.push(specifier);
      }
      roots.set(root, specifiers);
    }
  }
  return roots;
}

function declaredPackages(manifestPath: string): Set<string> {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  return new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);
}

function expectRootsDeclared(roots: Map<string, string[]>, manifestPath: string): void {
  const declared = declaredPackages(manifestPath);
  const missing = [...roots.entries()]
    .filter(([root]) => !declared.has(root))
    .map(([root, specifiers]) => `${root} (imported as ${specifiers.sort().join(', ')})`)
    .sort();
  expect(missing, `External package roots imported but not declared in ${manifestPath}: ${missing.join('; ')}`).toEqual(
    []
  );
}

describe('package manifest declarations', () => {
  it('declares every external package root imported by the library source', () => {
    const sourceFiles = listFiles(join(libRoot, 'src'), (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'));
    expect(sourceFiles.length).toBeGreaterThan(0);
    expectRootsDeclared(externalPackageRoots(sourceFiles), join(libRoot, 'package.json'));
  });

  it.runIf(existsSync(join(distRoot, 'package.json')))(
    'declares every external package root imported by the built artifact',
    () => {
      const artifactFiles = [
        ...listFiles(join(distRoot, 'fesm2022'), (name) => name.endsWith('.mjs')),
        ...listFiles(join(distRoot, 'types'), (name) => name.endsWith('.d.ts')),
      ];
      expect(artifactFiles.length).toBeGreaterThan(0);
      expectRootsDeclared(externalPackageRoots(artifactFiles), join(distRoot, 'package.json'));
    }
  );
});
