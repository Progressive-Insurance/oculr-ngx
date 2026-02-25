/*
 * @license
 * Copyright (c) 2026 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    unstubGlobals: true,
    environment: 'node',
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
