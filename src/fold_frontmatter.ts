import * as vscode from 'vscode';
import { extractFrontmatter, lineCount } from './utils';


export function registerFoldingFrontmatter(context: vscode.ExtensionContext) {
    const disposableFoldingFrontmatter = vscode.languages.registerFoldingRangeProvider({ language: 'hprompt' }, {
        provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
            const folds: vscode.FoldingRange[] = [];
            // find frontmatter wrapped in ---
            const frontmatter = extractFrontmatter(document.getText());
            if (frontmatter) {
                folds.push(new vscode.FoldingRange(0, lineCount(frontmatter) + 1));
            }
            return folds;
        }
    });

    context.subscriptions.push(disposableFoldingFrontmatter);
}

