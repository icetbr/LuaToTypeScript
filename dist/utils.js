"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndParseConfigFileOptions = exports.createVirtualProgram = void 0;
const ts = require("typescript");
const path = require("path");
function createVirtualProgram(typeScriptFiles, options) {
    const sourceFiles = {};
    typeScriptFiles.forEach((sourceFile) => {
        sourceFiles[sourceFile.fileName.replace(".lua", ".ts")] = sourceFile.tsCode;
    });
    const compilerHost = ts.createCompilerHost(options);
    const formerGetSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = (fileName, ...args) => {
        if (fileName in sourceFiles) {
            return ts.createSourceFile(fileName, sourceFiles[fileName], ts.ScriptTarget.Latest, false);
        }
        else {
            return formerGetSourceFile(fileName, ...args);
        }
    };
    return ts.createProgram(Object.keys(sourceFiles), options, compilerHost);
}
exports.createVirtualProgram = createVirtualProgram;
function findAndParseConfigFileOptions(options) {
    const configFilePath = ts.findConfigFile(".", ts.sys.fileExists);
    if (configFilePath) {
        const { options: mergedOptions } = ts.parseJsonSourceFileConfigFileContent(ts.readJsonConfigFile(configFilePath, ts.sys.readFile), ts.sys, path.dirname(configFilePath), options, configFilePath);
        return mergedOptions;
    }
    else {
        throw new Error("Could not find tsconfig.json");
    }
}
exports.findAndParseConfigFileOptions = findAndParseConfigFileOptions;
