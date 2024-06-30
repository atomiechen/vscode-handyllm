import * as vscode from 'vscode';
import debounce from 'lodash.debounce';

import { isHpromptDoc } from './utils';


class HiddenLineConfig {
  private _enabled: boolean = true;
  private _lineDecoration: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({});
  private _delayMs: number = 200;
  private _length_limit: number = 80;

  constructor() {}
  
  get enabled() {
    return this._enabled;
  }
  
  get lineDecoration() {
    return this._lineDecoration;
  }

  get delayMs() {
    return this._delayMs;
  }

  get lengthLimit() {
    return this._length_limit;
  }

  public update() {
    const config = vscode.workspace.getConfiguration("handyllm");
    this._enabled = config.get("hiddenline.enabled", true);
    this._length_limit = config.get("hiddenline.limit", 80);
  }
}

const hiddenLineConfig = new HiddenLineConfig();

function triggerUpdateEditor(editor: vscode.TextEditor, throttle = false) {
  if (throttle) {
    debounce(
      () => updateEditor(editor),
      hiddenLineConfig.delayMs,
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

  const hiddenLineDecorations: vscode.DecorationOptions[] = [];

  if (hiddenLineConfig.enabled) {
    // build regEx using hiddenLineConfig
    const regEx = new RegExp(`.{${hiddenLineConfig.lengthLimit},}`, 'g');
    const text = editor.document.getText();
    let match;
    while (match = regEx.exec(text)) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const line = startPos.line;
      const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(startPos, endPos),
        renderOptions: {
            after: {
                contentText: '... (hidden)',
                color: 'rgba(200, 200, 200, 0.5)',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                textDecoration: 'none; cursor: pointer;'
            }
        },
        hoverMessage: {
            language: 'plaintext',
            value: 'Click to show full line'
        }
      };
      hiddenLineDecorations.push(decoration);
    }
    
    // set the decorations
    editor.setDecorations(hiddenLineConfig.lineDecoration!, hiddenLineDecorations);
  }
}

export function activateHiddenLineDecor(context: vscode.ExtensionContext) {
  hiddenLineConfig.update();
  triggerUpdateAllVisibleEditors();

  // when configuration changes, update the decorations
  vscode.workspace.onDidChangeConfiguration(() => {
    hiddenLineConfig.update();
    triggerUpdateAllVisibleEditors();
  }, null, context.subscriptions);

  // when editing a document, update the decorations
  vscode.workspace.onDidChangeTextDocument(event => {
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateEditor(activeEditor, true);
    }
  }, null, context.subscriptions);

  // when switching tabs, update the decorations
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      triggerUpdateEditor(editor);
    }
  }, null, context.subscriptions);

  // when language ID changes, update the decorations
  vscode.workspace.onDidOpenTextDocument(doc => {
    if (vscode.window.activeTextEditor?.document === doc) {
      if (isHpromptDoc(doc)) {
        triggerUpdateEditor(vscode.window.activeTextEditor);
      } else {
        // clear decorations
        vscode.window.activeTextEditor?.setDecorations(hiddenLineConfig.lineDecoration!, []);
      }
    }
  }, null, context.subscriptions);

  // when visible editors change, update the decorations
  vscode.window.onDidChangeVisibleTextEditors(editors => {
    for (const editor of editors) {
      triggerUpdateEditor(editor);
    }
  }, null, context.subscriptions);
}

