import * as vscode from 'vscode';
import { matchRole } from './utils';


export function registerFoldingMessage(context: vscode.ExtensionContext) {
    const disposableFoldingMessage = vscode.languages.registerFoldingRangeProvider({ language: 'hprompt' }, {
        provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
            const folds: vscode.FoldingRange[] = [];
            let start = -1;
            for (let i = 0; i < document.lineCount; i++) {
                const text = document.lineAt(i).text;
                const match = matchRole(text);
                if (match) {
                    if (start !== -1) {
                        folds.push(new vscode.FoldingRange(start, i - 1));
                    }
                    start = i;
                }
            }
            if (start !== -1) {
                folds.push(new vscode.FoldingRange(start, document.lineCount - 1));
            }
            return folds;
        }
    });

    context.subscriptions.push(disposableFoldingMessage);
}

