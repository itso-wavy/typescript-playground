import type { Lesson } from '../../shared/contracts.js';
import { lessons as diagnostics } from './diagnostics.js';
import { lessons as foundations } from './foundations.js';
import { lessons as functions } from './functions.js';
import { lessons as runtimeBoundaries } from './runtime-boundaries.js';
import { lessons as languageRuntime } from './language-runtime.js';
import { lessons as handoffCapstone } from './handoff-capstone.js';

export { course } from './course.js';

export const lessons: Lesson[] = [
  ...diagnostics,
  ...foundations,
  ...functions,
  ...runtimeBoundaries,
  ...languageRuntime,
  ...handoffCapstone,
];
