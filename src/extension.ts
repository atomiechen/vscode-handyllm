// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getOrCreateTerminal(name: string): vscode.Terminal {
    // check if the terminal already exists
    const existingTerminal = vscode.window.terminals.find(terminal => terminal.name === name);
    if (existingTerminal) {
        return existingTerminal;
    } else {
        return vscode.window.createTerminal(name);
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"handyllm" extension is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableRunHprompt = vscode.commands.registerCommand('handyllm.runHprompt', () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			// get the file path of the currently active file
			const filePath = activeEditor.document.uri.fsPath;
			const terminal = getOrCreateTerminal("hprompt");
			terminal.show(true);
			// run the hprompt command in the terminal
			terminal.sendText(`handyllm hprompt ${filePath}`);
		} else {
			// Display a message box to the user
			vscode.window.showErrorMessage('No active editor found!');
		}
	});

	context.subscriptions.push(disposableRunHprompt);
}

// This method is called when your extension is deactivated
export function deactivate() {}
