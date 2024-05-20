import * as vscode from 'vscode';


export function registerCommandCreate(context: vscode.ExtensionContext) {
    let disposableCreateHprompt = vscode.commands.registerCommand('handyllm.createHprompt', function () {
		vscode.workspace.openTextDocument({
			content: '---\n# add YAML frontmatter data here\n\n---\n\n$system$\nYou are a helpful assistant.\n\n$user$\nPlace you instructions here.\n\n',
			language: 'hprompt' // set the language mode to hprompt
		}).then(document => {
			vscode.window.showTextDocument(document);
		});
	});

	context.subscriptions.push(disposableCreateHprompt);
}
