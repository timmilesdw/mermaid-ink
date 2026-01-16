import type MarkdownIt from 'markdown-it';

export function mermaidPlugin(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim().toLowerCase();

    if (info === 'mermaid') {
      const content = token.content.trim();
      const escapedContent = escapeHtml(content);
      
      return `<div class="mermaid-container">
        <pre class="mermaid-source" style="display:none;">${escapedContent}</pre>
        <div class="mermaid-diagram" data-processed="false"></div>
      </div>`;
    }

    if (defaultFence) {
      return defaultFence(tokens, idx, options, env, self);
    }

    return self.renderToken(tokens, idx, options);
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
