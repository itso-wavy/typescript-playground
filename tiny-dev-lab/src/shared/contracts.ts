export type FileMap = Record<string, string>;
export type LessonKind = 'practice' | 'diagnostic';
export type RunMode = 'typecheck' | 'runtime' | 'react';
export type EvidenceAxis = 'understanding' | 'application' | 'explanation';
export type CurriculumClassification = 'core' | 'optional';

export interface SourceLink {
  title: string;
  url: string;
}

export interface CourseDefinition {
  schemaVersion?: 'curriculum-harness/v1';
  courseId?: string;
  version?: string;
  audience: {
    description: string;
    prerequisites: string[];
  };
  completionOutcomes: string[];
  flow: Array<{
    id: string;
    title: string;
    rationale: string;
    outcomeRefs: number[];
    lessonIds: string[];
  }>;
  practicePlan: {
    minimum: number;
    maximum: number;
    rationale: string;
    decision: 'approved' | 'revise' | 'pending';
  };
  /**
   * Course-level learning contract. It is optional only while older stacks are
   * migrated; every new or redesigned course must publish this manifest.
   */
  harness?: CurriculumHarness;
}

export interface CurriculumEvidence {
  id: string;
  axis: EvidenceAxis;
  outputId: string;
  description: string;
}

export interface CurriculumCapability {
  id: string;
  description: string;
  classification: CurriculumClassification;
  classificationRationale: string;
  prerequisiteCapabilityIds: string[];
  outputIds: string[];
  requiredEvidence: Record<EvidenceAxis, string[]>;
}

export interface CurriculumOutput {
  id: string;
  capabilityIds: string[];
  lessonIds: string[];
  outcomeRefs: number[];
  expected: {
    normal: string[];
    failure: string[];
    boundary: string[];
  };
  evidenceIds: string[];
  reusedByOutputIds: string[];
}

export interface CurriculumDiagnosticRoute {
  lessonId: string;
  capabilityIds: string[];
  remediationOutputIds: string[];
  includedInCompletion: false;
}

export interface CurriculumHandoff {
  id: string;
  toCourseId: string;
  providedCapabilityIds: string[];
  requiredCapabilityIds: string[];
  transferredOutputIds: string[];
}

export interface CurriculumHarness {
  capabilities: CurriculumCapability[];
  outputs: CurriculumOutput[];
  evidence: CurriculumEvidence[];
  diagnostics: CurriculumDiagnosticRoute[];
  lessonClassification: Record<CurriculumClassification, string[]>;
  handoffs: CurriculumHandoff[];
}

export interface Lesson {
  id: string;
  chapter: number;
  order: number;
  kind: LessonKind;
  title: string;
  navTitle?: string;
  summary: string;
  story: string;
  concept: string[];
  workedExample?: {
    title: string;
    code: string;
    result: string[];
  };
  mission: string;
  goals: string[];
  hints: string[];
  explanation: string[];
  starter: FileMap;
  solution: FileMap;
  editableFiles: string[];
  mode: RunMode;
  sources: SourceLink[];
  checkedAt: string;
  compilerVersion: string;
  revision: number;
  minutes: number;
  interview?: {
    question: string;
    answer: string;
    points: string[];
  };
}

export interface Diagnostic {
  file: string;
  line: number;
  column: number;
  code: number;
  message: string;
}

export interface CheckRequest {
  lessonId: string;
  files: FileMap;
  requestId: string;
  codeRevision: number;
}

export interface CheckResult {
  requestId: string;
  lessonId: string;
  codeRevision: number;
  status: 'ready' | 'type-error' | 'contract-error' | 'system-error';
  diagnostics: Diagnostic[];
  checks: { name: string; passed: boolean }[];
  bundle?: string;
  compilerVersion: string;
  message?: string;
}

export interface RuntimeResult {
  status: 'passed' | 'failed' | 'timeout';
  checks: { name: string; passed: boolean }[];
  logs: string[];
  html?: string;
  error?: string;
}

export interface LessonProgress {
  lessonId: string;
  lessonRevision: number;
  files: FileMap;
  version: number;
  completedAt: string | null;
  completedCode: string | null;
  note: string;
  updatedAt: string;
}

export type SaveResult =
  | { status: 'saved'; progress: LessonProgress }
  | { status: 'conflict'; remote: LessonProgress }
  | { status: 'offline'; message: string };
