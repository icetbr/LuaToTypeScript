"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemanticDiagnosticsFromLuaCode = exports.getSemanticDiagnostics = void 0;
const transpile_1 = require("./transpile");
const utils_1 = require("./utils");
function getSemanticDiagnostics(result, options) {
    const program = utils_1.createVirtualProgram(result.transpiledFiles, options);
    return program.getSemanticDiagnostics();
}
exports.getSemanticDiagnostics = getSemanticDiagnostics;
function getSemanticDiagnosticsFromLuaCode(luaCode) {
    const transpiledFile = transpile_1.transformLuaToTypeScript(luaCode);
    const program = utils_1.createVirtualProgram([transpiledFile], {});
    return program.getSemanticDiagnostics();
}
exports.getSemanticDiagnosticsFromLuaCode = getSemanticDiagnosticsFromLuaCode;
