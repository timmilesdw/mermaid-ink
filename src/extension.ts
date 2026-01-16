import * as vscode from 'vscode';
import { mermaidPlugin } from './markdownPlugin';

export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: markdownit) {
      return md.use(mermaidPlugin);
    }
  };
}

export function deactivate() {}
