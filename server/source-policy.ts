import { parse } from '@babel/parser';

export class SourcePolicyError extends Error {}

const ALLOWED_PACKAGES = new Set(['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime']);
const RELATIVE = /^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+(?:\.(?:ts|tsx|d\.ts|js|jsx))?$/;

function walk(value: unknown, visit: (node: Record<string, unknown>) => void): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  const node = value as Record<string, unknown>;
  if (typeof node.type === 'string') visit(node);
  for (const [key, child] of Object.entries(node)) {
    if (key !== 'loc' && key !== 'start' && key !== 'end' && key !== 'extra') walk(child, visit);
  }
}

function moduleLiteral(node: Record<string, unknown>): string | undefined {
  const source = node.source;
  return source && typeof source === 'object' && typeof (source as { value?: unknown }).value === 'string'
    ? (source as { value: string }).value
    : undefined;
}

/** Reject syntax that could make the compiler or bundler resolve arbitrary input. */
export function assertSafeSource(path: string, source: string, allowedPackages: ReadonlySet<string> = ALLOWED_PACKAGES): void {
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators'],
      errorRecovery: false,
      attachComment: true,
    });
  } catch (error) {
    throw new SourcePolicyError(`${path}: syntax is not valid TypeScript: ${error instanceof Error ? error.message : 'parse error'}`);
  }

  const comments = (ast as unknown as { comments?: Array<{ value: string }> }).comments ?? [];
  for (const comment of comments) {
    if (/^\/\s*<reference\b/i.test(comment.value.trim())) {
      throw new SourcePolicyError(`${path}: triple-slash references are not allowed`);
    }
  }

  walk(ast, (node) => {
    const type = node.type;
    if (type === 'ImportDeclaration' || type === 'ExportNamedDeclaration' || type === 'ExportAllDeclaration') {
      const specifier = moduleLiteral(node);
      if (specifier && !(allowedPackages.has(specifier) || specifier.startsWith('./') && RELATIVE.test(specifier.slice(2)))) throw new SourcePolicyError(`${path}: import path is not allowed`);
    }
    if (type === 'TSImportType') {
      const argument = node.argument as { type?: string; value?: unknown } | undefined;
      if (argument?.type !== 'StringLiteral' || typeof argument.value !== 'string' || !(allowedPackages.has(argument.value) || argument.value.startsWith('./') && RELATIVE.test(argument.value.slice(2)))) {
        throw new SourcePolicyError(`${path}: import type path is not allowed`);
      }
    }
    if (type === 'ImportExpression' || type === 'CallExpression' && (node.callee as { name?: string } | undefined)?.name === 'require') {
      throw new SourcePolicyError(`${path}: dynamic module loading is not allowed`);
    }
  });

  if (/@ts-(?:ignore|nocheck)\b/.test(source)) {
    throw new SourcePolicyError(`${path}: diagnostic suppression is not allowed`);
  }
}

export function assertSafeFiles(files: Record<string, string>, allowedPackages?: ReadonlySet<string>): void {
  for (const [path, source] of Object.entries(files)) assertSafeSource(path, source, allowedPackages);
}
