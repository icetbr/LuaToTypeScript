"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeclarations = void 0;
const utils_1 = require("./utils");
function generateDeclarations(result) {
    const options = utils_1.findAndParseConfigFileOptions({ declaration: true });
    const program = utils_1.createVirtualProgram(result.transpiledFiles, options);
    const outputFiles = {};
    const writeFile = (fileName, content) => {
        outputFiles[fileName] = content;
    };
    program.emit(undefined, writeFile, undefined, true);
    return {
        transpiledFiles: Object.keys(outputFiles).map((outputFileName) => {
            return {
                ast: new WeakMap(),
                diagnostics: [],
                fileName: outputFileName,
                tsCode: outputFiles[outputFileName],
            };
        }),
    };
}
exports.generateDeclarations = generateDeclarations;
