import type { FileMap } from '../../src/shared/contracts.js';

export interface LessonFixture {
  lessonId: string;
  typeTests: string;
  runtimeTests?: string;
  alternatives: FileMap[];
  invalid: { name: string; files: FileMap }[];
  compilerOptions?: {
    exactOptionalPropertyTypes?: boolean;
    verbatimModuleSyntax?: boolean;
  };
}
