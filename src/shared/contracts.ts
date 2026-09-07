export type FileMap = Record<string, string>;
export type LessonKind = 'practice' | 'diagnostic';
export type RunMode = 'typecheck' | 'runtime' | 'react';

export interface SourceLink {
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  chapter: number;
  order: number;
  kind: LessonKind;
  title: string;
  summary: string;
  story: string;
  concept: string[];
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
