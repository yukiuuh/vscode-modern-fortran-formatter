"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { execSync, exec, ChildProcess, ExecException } from "child_process";
import { formatWarningMessage } from "./warningMessage";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  const outputChannel = vscode.window.createOutputChannel(
    "Modern Fortran Formatter"
  );

  let disposable = vscode.languages.registerDocumentFormattingEditProvider(
    "FortranFreeForm",
    {
      provideDocumentFormattingEdits: (document) => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);

        const fileName = document.fileName;

        const configuration = vscode.workspace.getConfiguration();

        const fprettifyPath =
          configuration.get<string>("modernFortranFormatter.fprettifyPath") ||
          "fprettify";

        const fprettifyArgs = configuration.get<string>(
          "modernFortranFormatter.fprettifyArgs"
        );
        const args = "-s " + fprettifyArgs;
        const wholeTextRange = new vscode.Range(
          firstLine.range.start,
          lastLine.range.end
        );

        return (() =>
          new Promise<string>((resolve, reject) => {
            let fprettifyProcess: ChildProcess = exec(
              fprettifyPath + " " + args,
              async (error, stdout, stderr) => {
                if (error) {
                  return reject(error);
                }
                if (stderr) {
                  vscode.window.showInformationMessage(
                    "WARNING in formatting Fortran file"
                  );

                  outputChannel.appendLine(new Date().toString());

                  outputChannel.append(formatWarningMessage(fileName, stderr));

                  outputChannel.show();
                }
                return resolve(stdout);
              }
            );

            fprettifyProcess.stdin?.write(document.getText());
            fprettifyProcess.stdin?.end();
          }))()
          .then((formattedText) => {
            return [vscode.TextEdit.replace(wholeTextRange, formattedText)];
          })
          .catch((reason: ExecException) => {
            vscode.window.showInformationMessage(reason.message);
            return [];
          });

        //
      },
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(outputChannel);
}

// this method is called when your extension is deactivated
export function deactivate() {}
