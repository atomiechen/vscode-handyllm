import * as vscode from 'vscode';
import { extractFrontmatter, isHpromptDoc } from './utils';


// Virtual document scheme
const virtualDocScheme = 'hprompt-fm-virtual';
// Store virtual document contents
const virtualDocumentContents = new Map<string, string>();
// Register virtual document content provider
const virtualContentProvider = new class implements vscode.TextDocumentContentProvider {
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;
  provideTextDocumentContent(uri: vscode.Uri): string {
      return virtualDocumentContents.get(uri.toString()) || '';
  }
};
// Create diagnostic collection
const diagnosticCollection = vscode.languages.createDiagnosticCollection('hprompt-fm-diagnostic');

function buildVirtualDocUri(uri: vscode.Uri) {
  return vscode.Uri.from({
      scheme: virtualDocScheme,
      authority: 'yaml',
      path: '/' + encodeURIComponent(uri.toString(false)) + '.yaml',
  });
}

function getOriginalDocUri(uri: vscode.Uri) {
  return vscode.Uri.parse(decodeURIComponent(uri.path.slice(1, -5)));
}

function closeRelatedVirtualDoc(doc: vscode.TextDocument) {
  if (!isHpromptDoc(doc)) {
    return;
  }
  const virtualDocUri = buildVirtualDocUri(doc.uri);
  // Clean up virtual document content
  virtualDocumentContents.delete(virtualDocUri.toString());
  // Fire event to update virtual document content
  virtualContentProvider.onDidChangeEmitter.fire(virtualDocUri);
  // Clean up diagnostics
  diagnosticCollection.delete(doc.uri);
}

async function checkVirtualDoc(doc: vscode.TextDocument) {
  if (!isHpromptDoc(doc)) {
    return;
  }

  const text = doc.getText();
  const frontmatter = extractFrontmatter(text);
  if (!frontmatter) {
      closeRelatedVirtualDoc(doc);
      return;
  }

  // Create virtual document URI for source document
  const virtualDocUri = buildVirtualDocUri(doc.uri);

  // check if the virtual document content is changed
  if (virtualDocumentContents.get(virtualDocUri.toString()) === frontmatter) {
      return;
  }

  // Update virtual document content
  virtualDocumentContents.set(virtualDocUri.toString(), frontmatter);
  virtualContentProvider.onDidChangeEmitter.fire(virtualDocUri);

  // Open virtual document (invisible)
  await vscode.workspace.openTextDocument(virtualDocUri);
}

function getVirtualPosition(document: vscode.TextDocument, position: vscode.Position) {
  if (!isHpromptDoc(document)) {
    return null;
  }

  // Check if position is within frontmatter region
  const text = document.getText();
  const frontmatter = extractFrontmatter(text);
  if (!frontmatter || position.line < 1 || position.line > frontmatter.split('\n').length) {
    return null;
  }

  // Get corresponding virtual document
  const virtualDocUri = buildVirtualDocUri(document.uri);

  // Adjust position: subtract frontmatter start offset
  const virtualPosition = new vscode.Position(
    position.line - 1,
    position.character
  );

  return {
    virtualDocUri,
    virtualPosition
  };
}

export function registerValidateFrontmatter(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // Register virtual document content provider
    vscode.workspace.registerTextDocumentContentProvider(virtualDocScheme, virtualContentProvider),

    // Create diagnostic collection
    diagnosticCollection,

    // Listen for document open events
    vscode.workspace.onDidOpenTextDocument(async doc => {
        await checkVirtualDoc(doc);
    }),

    // Listen for hprompt document changes
    vscode.workspace.onDidChangeTextDocument(async e => {
        await checkVirtualDoc(e.document);
    }),

    // Listen for document close events
    vscode.workspace.onDidCloseTextDocument(doc => {
      closeRelatedVirtualDoc(doc);
    }),

    // Listen for diagnostic changes
    vscode.languages.onDidChangeDiagnostics(e => {
    for (const uri of e.uris) {
        // Check if this is our virtual document
        if (uri.scheme !== virtualDocScheme) {
            continue;
        }
        
        // Get original document URI
        const originalUri = getOriginalDocUri(uri);
        
        // Get diagnostics for virtual document
        const diagnostics = vscode.languages.getDiagnostics(uri);
        
        // Adjust diagnostic positions (considering frontmatter start position)
        const adjustedDiagnostics = diagnostics.map(d => {
            const newDiag = {...d};
            // Adjust range, add frontmatter start offset (3 is length of "---\n")
            newDiag.range = new vscode.Range(
                d.range.start.line + 1,  // +1 for "---\n"
                d.range.start.character,
                d.range.end.line + 1,
                d.range.end.character
            );
            return newDiag;
        });

        // Set to diagnostic collection
        diagnosticCollection.set(originalUri, adjustedDiagnostics);
        }
    }),

    vscode.languages.registerHoverProvider(['hprompt'], {
      async provideHover(document: vscode.TextDocument, position: vscode.Position) {
          const virtualInfo = getVirtualPosition(document, position);
          if (!virtualInfo) {
            return;
          }

          // Get hover from YAML extension
          return await vscode.commands.executeCommand<vscode.Hover[]>(
              'vscode.executeHoverProvider',
              virtualInfo.virtualDocUri,
              virtualInfo.virtualPosition
          ).then(hovers => hovers?.[0]);
      }
    }),

    // Add completion provider
    vscode.languages.registerCompletionItemProvider(['hprompt'], 
      {
      async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, _context: vscode.CompletionContext) {
        // console.log('provideCompletionItems', document.uri.toString(), position.line, position.character, _context.triggerCharacter);
        const virtualInfo = getVirtualPosition(document, position);
        if (!virtualInfo) {
          // console.log('provideCompletionItems', 'no virtualInfo');
          return;
        }

        // Get completion items from YAML extension
        const ret = await vscode.commands.executeCommand<vscode.CompletionList>(
          'vscode.executeCompletionItemProvider',
          virtualInfo.virtualDocUri,
          virtualInfo.virtualPosition,
          _context.triggerCharacter,
        );
        // console.log('provideCompletionItems', ret);
        // remove range from completion items to avoid invalid error (don't know why)
        ret.items.forEach(item => {
          if (item.range) {
            item.range = undefined;
          }
        });
        return ret;
      }
    })
  );
}
