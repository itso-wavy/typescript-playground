import { Fragment } from 'react';
import { highlightTypeScript } from './syntax-highlight.js';

export function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(`[^`\n]+`)/g);
  return parts.map((part, index) => part.startsWith('`') && part.endsWith('`')
    ? <code className="inline-code" key={`${part}-${index}`}>{part.slice(1, -1)}</code>
    : <Fragment key={`${part}-${index}`}>{part}</Fragment>);
}

export function HighlightedTypeScript({ code }: { code: string }) {
  return <code dangerouslySetInnerHTML={{ __html: highlightTypeScript(code) }} />;
}
