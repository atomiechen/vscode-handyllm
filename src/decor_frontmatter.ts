import * as vscode from 'vscode';
import debounce from 'lodash.debounce';

import { isFrontmatterBoundary, isHpromptDoc } from './utils';


class FrontmatterConfig {
  private _enabled: boolean = true;
  private _backgroundDecoration: vscode.TextEditorDecorationType | undefined;
  private _delayMs: number = 200;

  constructor() {}
  
  get enabled() {
    return this._enabled;
  }
  
  get backgroundDecoration() {
    return this._backgroundDecoration;
  }

  get delayMs() {
    return this._delayMs;
  }

  public update() {
    const config = vscode.workspace.getConfiguration("handyllm");
    this._enabled = config.get("frontmatter.background.enabled", true);

    if (this._backgroundDecoration) {
      this._backgroundDecoration.dispose();
    }
    this._backgroundDecoration = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      light: {
        backgroundColor: config.get("frontmatter.background.light", "#acacac36"),
      },
      dark: {
        backgroundColor: config.get("frontmatter.background.dark", "#54545436"),
      },
    });
  }
}

const frontmatterConfig = new FrontmatterConfig();

function triggerUpdateEditor(editor: vscode.TextEditor, throttle = false) {
  if (throttle) {
    debounce(
      () => updateEditor(editor),
      frontmatterConfig.delayMs,
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

  if (frontmatterConfig.enabled) {
    // find frontmatter wrapped in ---
    const firstLine = editor.document.lineAt(0);
    // check if first line matches boundary
    if (isFrontmatterBoundary(firstLine.text)) {
      // find the next boundary line
      for (let i=1; i<editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        if (isFrontmatterBoundary(line.text)) {
          const start = new vscode.Position(0, 0);
          const end = new vscode.Position(i, line.range.end.character);
          frontmatterRanges.push(new vscode.Range(start, end));
          break;
        }
      }
    }
    
    // set the decorations
    editor.setDecorations(frontmatterConfig.backgroundDecoration!, frontmatterRanges);
  }
}

export function activateFrontmatterDecor(context: vscode.ExtensionContext) {
  frontmatterConfig.update();
  triggerUpdateAllVisibleEditors();

  // when configuration changes, update the decorations
  vscode.workspace.onDidChangeConfiguration(() => {
    frontmatterConfig.update();
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
        vscode.window.activeTextEditor?.setDecorations(frontmatterConfig.backgroundDecoration!, []);
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

