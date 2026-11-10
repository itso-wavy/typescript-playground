import type { CheckRequest, FileMap } from './contracts';

const MAX_TOTAL_SOURCE_BYTES = 64 * 1024;
const FILE_PATH = /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:ts|tsx|d\.ts)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFileMap(value: unknown): value is FileMap {
  if (!isRecord(value)) {
    return false;
  }

  const files = Object.entries(value);
  if (files.length === 0) {
    return false;
  }

  let totalBytes = 0;
  for (const [path, source] of files) {
    if (!FILE_PATH.test(path) || typeof source !== 'string') {
      return false;
    }
    totalBytes += new TextEncoder().encode(source).byteLength;
    if (totalBytes > MAX_TOTAL_SOURCE_BYTES) {
      return false;
    }
  }

  return true;
}

export function validateCheckRequest(value: unknown): value is CheckRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.lessonId === 'string' && value.lessonId.trim().length > 0 &&
    typeof value.requestId === 'string' && value.requestId.trim().length > 0 &&
    typeof value.codeRevision === 'number' &&
    Number.isSafeInteger(value.codeRevision) &&
    value.codeRevision >= 0 &&
    isFileMap(value.files)
  );
}
