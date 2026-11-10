import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormattedText, HighlightedTypeScript } from '../src/learning/FormattedText.js';

describe('lesson text formatting', () => {
  it('renders backtick-delimited text as inline code', () => {
    const html = renderToStaticMarkup(<p><FormattedText text="`as const`로 값을 고정합니다." /></p>);

    expect(html).toContain('<code class="inline-code">as const</code>');
    expect(html).toContain('로 값을 고정합니다.');
  });

  it('highlights TypeScript code while escaping source HTML', () => {
    const html = renderToStaticMarkup(<pre><HighlightedTypeScript code={'const count = 2;\nconst tag = "<script>";'} /></pre>);

    expect(html).toContain('<span class="syntax-keyword">const</span>');
    expect(html).toContain('<span class="syntax-number">2</span>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
