// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerCommandCreate } from './cmd_create';
import { registerCommandRun } from './cmd_run';
import { activateFrontmatterDecor } from './decor_frontmatter';
import { activateMessageDecor } from './decor_message';
import { registerFoldingMessage } from './fold_message';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"handyllm" extension is now active!');

	registerCommandCreate(context);
	registerCommandRun(context);
	registerFoldingMessage(context);
	activateFrontmatterDecor(context);
	activateMessageDecor(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
