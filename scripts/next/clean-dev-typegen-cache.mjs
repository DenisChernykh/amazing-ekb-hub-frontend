#!/usr/bin/env node

import { rm } from 'node:fs/promises';

await rm('.next/dev', { force: true, recursive: true });
