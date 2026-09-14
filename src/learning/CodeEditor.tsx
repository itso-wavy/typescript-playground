import type { FileMap } from '../shared/contracts.js';
import { useRef, useState } from 'react';

interface CodeEditorProps {
  files: FileMap;
  editableFiles: string[];
  activeFile: string;
  onActiveFileChange(file: string): void;
  onChange(file: string, value: string): void;
  onRun(): void;
  running: boolean;
}

export function CodeEditor({ files, editableFiles, activeFile, onActiveFileChange, onChange, onRun, running }: CodeEditorProps) {
  const value = files[activeFile] ?? '';
  const editable = editableFiles.includes(activeFile);
  const lineCount = Math.max(1, value.split('\n').length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  const updateValue = (nextValue: string, selectionStart?: number, selectionEnd?: number) => {
    onChange(activeFile, nextValue);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea || selectionStart === undefined || selectionEnd === undefined) return;
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
    });
  };

  const highlightedValue = highlightTypeScript(value);

  return (
    <section className="editor-card" aria-label="코드 편집기">
      <div className="editor-topline">
        <div className="file-tabs" role="tablist" aria-label="파일">
          {Object.keys(files).map((file) => (
            <button
              className={`file-tab ${activeFile === file ? 'is-active' : ''}`}
              key={file}
              type="button"
              role="tab"
              aria-selected={activeFile === file}
              onClick={() => onActiveFileChange(file)}
            >
              {file}
            </button>
          ))}
        </div>
        <button className="run-key" type="button" onClick={onRun} disabled={running}>
          {running ? '확인 중…' : '⌘↵ 실행'}
        </button>
      </div>
      <div className="code-area">
        <div className="line-numbers" aria-hidden="true" style={{ transform: `translateY(-${scroll.top}px)` }}>
          {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <div className="code-editor-layer">
          <pre className="code-highlight" aria-hidden="true" style={{ transform: `translate(${-scroll.left}px, ${-scroll.top}px)` }} dangerouslySetInnerHTML={{ __html: highlightedValue }} />
          <textarea
            ref={textareaRef}
            aria-label={`${activeFile} 코드`}
            className="code-input"
            spellCheck="false"
            value={value}
            readOnly={!editable}
            onChange={(event) => onChange(activeFile, event.target.value)}
            onScroll={(event) => setScroll({ top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft })}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                onRun();
                return;
              }
              if (!editable || event.key !== 'Tab') return;
              event.preventDefault();
              const textarea = event.currentTarget;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const hasSelection = start !== end;
              const lineStart = value.lastIndexOf('\n', start - 1) + 1;
              const lineEnd = hasSelection ? (value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end)) : end;
              const selectedText = value.slice(lineStart, lineEnd);
              const lines = selectedText.split('\n');
              const outdent = event.shiftKey;
              const replacement = outdent
                ? lines.map((line) => line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line).join('\n')
                : lines.map((line) => `  ${line}`).join('\n');
              const nextValue = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
              const delta = replacement.length - selectedText.length;
              const nextStart = hasSelection ? lineStart : start + (outdent ? Math.max(-2, -value.slice(lineStart, start).length) : 2);
              const nextEnd = hasSelection ? end + delta : nextStart;
              updateValue(nextValue, nextStart, nextEnd);
            }}
          />
        </div>
      </div>
      {!editable && <p className="editor-note">이 파일은 과제 계약을 위해 읽기 전용입니다.</p>}
    </section>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
}

function highlightTypeScript(value: string) {
  const keywords = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'export', 'interface', 'type', 'class', 'new', 'async', 'await', 'true', 'false', 'null', 'undefined']);
  let html = '';
  let index = 0;
  while (index < value.length) {
    if (value.startsWith('//', index)) {
      const end = value.indexOf('\n', index);
      const comment = value.slice(index, end === -1 ? value.length : end);
      html += `<span class="syntax-comment">${escapeHtml(comment)}</span>`;
      index += comment.length;
      continue;
    }
    const character = value[index];
    if (character === '"' || character === "'" || character === '`') {
      let end = index + 1;
      while (end < value.length) {
        if (value[end] === '\\') end += 2;
        else if (value[end] === character) { end += 1; break; }
        else end += 1;
      }
      html += `<span class="syntax-string">${escapeHtml(value.slice(index, end))}</span>`;
      index = end;
      continue;
    }
    const identifier = value.slice(index).match(/^[A-Za-z_$][\w$]*/)?.[0];
    if (identifier) {
      html += keywords.has(identifier) ? `<span class="syntax-keyword">${identifier}</span>` : escapeHtml(identifier);
      index += identifier.length;
      continue;
    }
    const number = value.slice(index).match(/^\d+(?:\.\d+)?/)?.[0];
    if (number) {
      html += `<span class="syntax-number">${number}</span>`;
      index += number.length;
      continue;
    }
    html += escapeHtml(character);
    index += 1;
  }
  return value.endsWith('\n') ? `${html} ` : html;
}
