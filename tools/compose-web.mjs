import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const mobileDist = resolve('apps/mobile/dist');
const portalDist = resolve('apps/portal/dist');
const portalTarget = resolve(mobileDist, 'portal');

await rm(portalTarget, { recursive: true, force: true });
await mkdir(portalTarget, { recursive: true });
await cp(portalDist, portalTarget, { recursive: true });
