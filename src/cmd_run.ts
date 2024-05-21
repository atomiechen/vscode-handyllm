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

export function registerCommandRun(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableRunHprompt = vscode.commands.registerCommand('handyllm.runHprompt', (uri: vscode.Uri) => {
		let filePath = undefined;
		if (uri) {
			filePath = uri.fsPath;
		} else {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				// get the file path of the currently active file
				filePath = activeEditor.document.uri.fsPath;
			}
		}
		if (filePath) {
			// get handyllm command name from the settings
			let handyllmCommand = vscode.workspace.getConfiguration().get('handyllm.commandName', 'handyllm').trim();
			if (handyllmCommand === '') {
				handyllmCommand = 'handyllm';
			}
			// get or create a terminal with the name "hprompt"
			const terminal = getOrCreateTerminal("hprompt");
			terminal.show(true);
			// run the hprompt command in the terminal
			terminal.sendText(`${handyllmCommand} hprompt ${filePath}`);
		} else {
			// Display a message box to the user
			vscode.window.showErrorMessage('No active editor found!');
		}
	});

    context.subscriptions.push(disposableRunHprompt);
}
