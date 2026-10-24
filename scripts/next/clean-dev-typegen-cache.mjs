#!/usr/bin/env node

import { rm } from 'node:fs/promises';

await Promise.all([
  rm('.next/dev', { force: true, recursive: true }),
  rm('.next/types', { force: true, recursive: true }),
]);
