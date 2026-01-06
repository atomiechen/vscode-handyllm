import * as vscode from 'vscode';
import { extractFrontmatter, matchRole, lineCount } from './utils';


/**
 * Create a DocumentSymbol for a given range in the document.
 * @param document The text document.
 * @param start The starting line number.
 * @param end The ending line number (inclusive).
 * @param detail Additional detail for the symbol.
 * @returns A DocumentSymbol representing the specified range.
 */
function createSymbol(document: vscode.TextDocument, start: number, end: number, detail: string): vscode.DocumentSymbol {
  const startLineText = document.lineAt(start).text;
  // full range
  let range = null;
  if (end >= document.lineCount - 1) {
    // if it's the last line, adjust the range to the end of the document
    range = new vscode.Range(start, 0, end, document.lineAt(end).text.length);
  } else {
    // otherwise, go to the start of the next line (exclusive)
    // NOTE: if set to end line's end, the sticky scroll header will leave an extra line
    range = new vscode.Range(start, 0, end + 1, 0);
  }
  // where the cursor goes when clicked
  const selectionRange = new vscode.Range(start, 0, start, startLineText.length);
  // create symbol
  return new vscode.DocumentSymbol(
    startLineText,
    detail,
    vscode.SymbolKind.String,
    range,
    selectionRange
  );
}

export function registerDocumentSymbolProvider(context: vscode.ExtensionContext) {
  const disposableSymbolProvider = vscode.languages.registerDocumentSymbolProvider({ language: 'hprompt' }, {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
      const symbols: vscode.DocumentSymbol[] = [];

      // Add frontmatter symbol if exists
      const frontmatter = extractFrontmatter(document.getText());
      if (frontmatter) {
        // line number of frontmatter end
        const frontmatterLines = lineCount(frontmatter) + 1; // +1 for the ending ---
        symbols.push(createSymbol(document, 0, frontmatterLines, 'Frontmatter'));
      }

      let roleLineNumber = -1;
      // Add message symbols
      for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        const match = matchRole(text);
        if (match) {
          if (roleLineNumber !== -1) {
            symbols.push(createSymbol(document, roleLineNumber, i - 1, 'Message'));
          }
          roleLineNumber = i;
        }
      }
      if (roleLineNumber !== -1) {
        symbols.push(createSymbol(document, roleLineNumber, document.lineCount - 1, 'Message'));
      }

      return symbols;
    }
  });

  context.subscriptions.push(disposableSymbolProvider);
}
