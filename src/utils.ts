import * as vscode from "vscode";


export const hpromptLanguageId = "hprompt";

export function isLanguageDoc(languageId: string, doc?: vscode.TextDocument) {
  return !!doc && doc.languageId === languageId;
}

export function isHpromptDoc(doc?: vscode.TextDocument) {
  return isLanguageDoc(hpromptLanguageId, doc);
}

export function matchRole(text: string) {
  // find lines that matches roles: \$\w+\$[^\S\r\n]*({[^{}]*?})?[^\S\r\n]*$
  return text.match(/^\$\w+\$[^\S\r\n]*({[^{}]*?})?[^\S\r\n]*$/);
}

export function isFrontmatterBoundary(text: string) {
  // check if text matches ---\s*
  return /^---\s*$/.test(text);
}

export function extractFrontmatter(text: string) {
  // extract frontmatter wrapped in ---, including empty leading/trailing lines
  const match = /^---[^\S\r\n]*\n([\s\S]*?)\n---/.exec(text);
  return match ? match[1] : null;
}

export function lineCount(text: string) {
  return text.split('\n').length;
}
