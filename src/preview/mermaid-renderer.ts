import mermaid from 'mermaid';

interface ThemeConfig {
  theme: string;
  themeVariables?: Record<string, string>;
}

function getVSCodeTheme(): 'dark' | 'light' | 'high-contrast' {
  const body = document.body;
  if (body.classList.contains('vscode-high-contrast')) {
    return 'high-contrast';
  }
  if (body.classList.contains('vscode-dark')) {
    return 'dark';
  }
  return 'light';
}

function getMermaidConfig(vsCodeTheme: 'dark' | 'light' | 'high-contrast'): ThemeConfig {
  const configs: Record<string, ThemeConfig> = {
    dark: {
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#334155',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        textColor: '#f1f5f9',
        nodeTextColor: '#f1f5f9',
        nodeBorder: '#60a5fa',
        clusterBkg: '#1e293b',
        clusterBorder: '#475569',
        titleColor: '#f8fafc',
        edgeLabelBackground: '#1e293b',
        actorTextColor: '#f1f5f9',
        actorBorder: '#60a5fa',
        actorBkg: '#1e293b',
        signalColor: '#94a3b8',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#1e293b',
        labelBoxBorderColor: '#475569',
        labelTextColor: '#f1f5f9',
        loopTextColor: '#f1f5f9',
        noteBorderColor: '#60a5fa',
        noteBkgColor: '#1e293b',
        noteTextColor: '#f1f5f9',
        activationBorderColor: '#60a5fa',
        activationBkgColor: '#334155',
        sequenceNumberColor: '#f1f5f9',
      }
    },
    light: {
      theme: 'default',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#2563eb',
        lineColor: '#64748b',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#e2e8f0',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        secondBkg: '#f1f5f9',
        textColor: '#1e293b',
        nodeTextColor: '#1e293b',
        nodeBorder: '#2563eb',
        clusterBkg: '#f1f5f9',
        clusterBorder: '#cbd5e1',
        titleColor: '#0f172a',
        edgeLabelBackground: '#f8fafc',
      }
    },
    'high-contrast': {
      theme: 'dark',
      themeVariables: {
        primaryColor: '#00ff00',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#00ff00',
        lineColor: '#ffffff',
        secondaryColor: '#000000',
        tertiaryColor: '#1a1a1a',
        background: '#000000',
        mainBkg: '#000000',
        textColor: '#ffffff',
        nodeTextColor: '#ffffff',
        nodeBorder: '#00ff00',
        clusterBkg: '#000000',
        clusterBorder: '#ffffff',
        titleColor: '#ffffff',
        edgeLabelBackground: '#000000',
      }
    }
  };

  return configs[vsCodeTheme];
}

async function initMermaid(): Promise<void> {
  const vsCodeTheme = getVSCodeTheme();
  const config = getMermaidConfig(vsCodeTheme);

  mermaid.initialize({
    startOnLoad: false,
    theme: config.theme as 'dark' | 'default' | 'forest' | 'neutral' | 'base',
    themeVariables: config.themeVariables,
    securityLevel: 'loose',
    fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  });
}

async function renderDiagrams(): Promise<void> {
  const containers = document.querySelectorAll('.mermaid-container');

  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const sourceEl = container.querySelector('.mermaid-source');
    const diagramEl = container.querySelector('.mermaid-diagram');

    if (!sourceEl || !diagramEl) continue;

    const processed = diagramEl.getAttribute('data-processed');
    if (processed === 'true') continue;

    const source = sourceEl.textContent || '';
    if (!source.trim()) continue;

    try {
      const id = `mermaid-diagram-${i}-${Date.now()}`;
      const { svg } = await mermaid.render(id, source);
      diagramEl.innerHTML = svg;
      diagramEl.setAttribute('data-processed', 'true');
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      diagramEl.innerHTML = `<pre class="mermaid-error">Error rendering diagram:\n${error instanceof Error ? error.message : String(error)}</pre>`;
      diagramEl.setAttribute('data-processed', 'true');
    }
  }
}

async function reRenderAll(): Promise<void> {
  const diagrams = document.querySelectorAll('.mermaid-diagram');
  diagrams.forEach(el => el.setAttribute('data-processed', 'false'));
  
  await initMermaid();
  await renderDiagrams();
}

function observeThemeChanges(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        reRenderAll();
        break;
      }
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

function observeNewContent(): void {
  const observer = new MutationObserver(() => {
    renderDiagrams();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

async function main(): Promise<void> {
  await initMermaid();
  await renderDiagrams();
  observeThemeChanges();
  observeNewContent();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
