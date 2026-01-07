import type MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';


const allThemes = ['github-dark', 'github-light'];


function mapVscodeThemeToShikiTheme(vscodeKind: vscode.ColorThemeKind): string {
  switch (vscodeKind) {
    case vscode.ColorThemeKind.Dark:
    case vscode.ColorThemeKind.HighContrast:
      return 'github-dark';
    case vscode.ColorThemeKind.Light:
    case vscode.ColorThemeKind.HighContrastLight:
    default:
      return 'github-light';
  }
}


export function getExtendMarkdownIt(context: vscode.ExtensionContext) {
  return function extendMarkdownIt(md: MarkdownIt) {
    let highlighter: any | null = null;
    let initializing: Promise<void> | null = null;

    async function ensureHighlighter() {
      if (highlighter || initializing) {
        return initializing;
      }

      initializing = (async () => {
        console.log('[handyllm] Initializing Shiki highlighter for hprompt...');
        const shiki = await import('./shiki.bundle.mjs');

        // Load grammar from the extension's static resource path
        const uri = vscode.Uri.joinPath(
          context.extensionUri,
          'syntaxes',
          'hprompt.tmLanguage.json'
        );
        const bytes = await vscode.workspace.fs.readFile(uri);
        const grammar = JSON.parse(new TextDecoder().decode(bytes));

        highlighter = await shiki.createHighlighter({
          themes: allThemes,
          langs: [
            'markdown',
            'yaml',
            {
              ...grammar,
              name: 'hprompt',
              scopeName: 'source.hprompt',
            }
          ]
        });
        console.log('[handyllm] Shiki highlighter for hprompt is ready.');
      })();

      return initializing;
    }

    const fallbackHighlight = md.options.highlight ?? (() => '');

    md.options.highlight = (code: string, lang: string, attrs: string) => {
      if (lang === 'hprompt' || lang === 'hpr') {
        if (highlighter) {
          try {
            const activeShikiTheme = mapVscodeThemeToShikiTheme(vscode.window.activeColorTheme.kind);
            return highlighter.codeToHtml(code, {
              lang: 'hprompt',
              theme: activeShikiTheme,
              transformers: [
                {
                  pre(node: any) {
                    // Remove background style to match default markdown preview
                    delete node.properties.style;
                  },
                },
              ],
            });
          } catch {}
        } else {
          // First time, trigger initialization but do not block
          ensureHighlighter();
          console.log('[handyllm] Shiki highlighter for hprompt is initializing, fallback to default highlighting.');
        }
      }
      // Fallback to default highlighting
      return fallbackHighlight(code, lang, attrs);
    };

    return md;
  };
}
