"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = void 0;
const ts = require("typescript");
function emit(transpileResult) {
    transpileResult.transpiledFiles.forEach((transpiledFile) => {
        const outputFileName = transpiledFile.fileName.replace(".lua", ".ts");
        ts.sys.writeFile(outputFileName, transpiledFile.tsCode);
    });
}
exports.emit = emit;
