import * as vscode from 'vscode';
import { isFrontmatterBoundary } from './utils';


export function registerFoldingFrontmatter(context: vscode.ExtensionContext) {
    const disposableFoldingFrontmatter = vscode.languages.registerFoldingRangeProvider({ language: 'hprompt' }, {
        provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
            const folds: vscode.FoldingRange[] = [];
            // find frontmatter wrapped in ---
            const firstLine = document.lineAt(0);
            let end = -1;
            if (isFrontmatterBoundary(firstLine.text)) {
                for (let i = 1; i < document.lineCount; i++) {
                    const text = document.lineAt(i).text;
                    if (isFrontmatterBoundary(text)) {
                        folds.push(new vscode.FoldingRange(0, i - 1));
                        end = i;
                        break;
                    }
                }
                if (end === -1) {
                    folds.push(new vscode.FoldingRange(0, document.lineCount - 1));
                }
            }
            return folds;
        }
    });

    context.subscriptions.push(disposableFoldingFrontmatter);
}

