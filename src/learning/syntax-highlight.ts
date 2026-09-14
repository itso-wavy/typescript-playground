export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
}

export function highlightTypeScript(value: string) {
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
