import debounce from 'lodash.debounce';
import * as vscode from 'vscode';

import { isHpromptDoc, matchRole } from './utils';


class MessageConfig {
  private _enabled: boolean = true;
  private _boundaryDecoration: vscode.TextEditorDecorationType | undefined;
  private _delayMs: number = 200;

  constructor() {}
  
  get enabled() {
    return this._enabled;
  }
  
  get boundaryDecoration() {
    return this._boundaryDecoration;
  }

  get delayMs() {
    return this._delayMs;
  }

  public update() {
    const config = vscode.workspace.getConfiguration("handyllm");
    this._enabled = config.get("message.boundary.enabled", true);

    if (this._boundaryDecoration) {
      this._boundaryDecoration.dispose();
    }

    const boundaryWidth = config.get("message.boundary.width", 1);
    this._boundaryDecoration = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      borderWidth: `0 0 ${boundaryWidth}px 0`,  // set to bottom border
      borderStyle: config.get("message.boundary.style", "dotted"),
      light: {
        borderColor: config.get("message.boundary.light", "#acacac"),
      },
      dark: {
        borderColor: config.get("message.boundary.dark", "#545454"),
      },
    });
  }
}

const messageConfig = new MessageConfig();

function triggerUpdateEditor(editor: vscode.TextEditor, throttle = false) {
  if (throttle) {
    debounce(
      () => updateEditor(editor),
      messageConfig.delayMs,
      { leading: true }
    )();
  } else {
    updateEditor(editor);
  }
}

function triggerUpdateAllVisibleEditors() {
  for (const editor of vscode.window.visibleTextEditors) {
    triggerUpdateEditor(editor);
  }
}

function updateEditor(editor: vscode.TextEditor) {
  if (!editor || !isHpromptDoc(editor.document)) {
    return;
  }

  // ranges to highlight
  const frontmatterRanges: vscode.Range[] = [];

  if (messageConfig.enabled) {
    for (let i = 0; i < editor.document.lineCount; i++) {
      const text = editor.document.lineAt(i).text;
      const match = matchRole(text);
      if (match) {
        const start = new vscode.Position(i, 0);
        const end = new vscode.Position(i, text.length);
        frontmatterRanges.push(new vscode.Range(start, end));
      }
    }
    
    // set the decorations
    editor.setDecorations(messageConfig.boundaryDecoration!, frontmatterRanges);
  }
}

export function activateMessageDecor(context: vscode.ExtensionContext) {
  messageConfig.update();
  triggerUpdateAllVisibleEditors();

  // update decorations when configuration changes
  vscode.workspace.onDidChangeConfiguration(() => {
    messageConfig.update();
    triggerUpdateAllVisibleEditors();
  }, null, context.subscriptions);

  // update decorations when editing a text document
  vscode.workspace.onDidChangeTextDocument(event => {
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateEditor(activeEditor, true);
    }
  }, null, context.subscriptions);

  // update decorations when switching between editors
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      triggerUpdateEditor(editor);
    }
  }, null, context.subscriptions);

  // update decorations when language ID changes
  vscode.workspace.onDidOpenTextDocument(doc => {
    if (vscode.window.activeTextEditor?.document === doc) {
      if (isHpromptDoc(doc)) {
        triggerUpdateEditor(vscode.window.activeTextEditor);
      } else {
        // clear decorations
        vscode.window.activeTextEditor?.setDecorations(messageConfig.boundaryDecoration!, []);
      }
    }
  }, null, context.subscriptions);

  // update decorations when visible editors change
  vscode.window.onDidChangeVisibleTextEditors(editors => {
    for (const editor of editors) {
      triggerUpdateEditor(editor);
    }
  }, null, context.subscriptions);
}

