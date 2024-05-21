import * as vscode from "vscode";


export const hpromptLanguageId = "hprompt";

export function isLanguageDoc(languageId: string, doc?: vscode.TextDocument) {
  return !!doc && doc.languageId === languageId;
}

export function isHpromptDoc(doc?: vscode.TextDocument) {
  return isLanguageDoc(hpromptLanguageId, doc);
}

