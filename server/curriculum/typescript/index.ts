import type { LessonFixture } from '../types.js';
import { fixtures as diagnostics } from './diagnostics.js';
import { fixtures as foundations } from './foundations.js';
import { fixtures as functions } from './functions.js';
import { fixtures as runtimeBoundaries } from './runtime-boundaries.js';
import { fixtures as languageRuntime } from './language-runtime.js';
import { fixtures as handoffCapstone } from './handoff-capstone.js';

export const fixtures: LessonFixture[] = [
  ...diagnostics,
  ...foundations,
  ...functions,
  ...runtimeBoundaries,
  ...languageRuntime,
  ...handoffCapstone,
];
