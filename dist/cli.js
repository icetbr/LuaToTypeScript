"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandLine = void 0;
const program = require("commander");
const emit_1 = require("./emit");
const transpile_1 = require("./transpile");
const declaration_1 = require("./declaration");
const diagnose_1 = require("./diagnose");
program
    .usage("[options] <luaFiles...>")
    .option("-s, --show-semantic-errors", "Show semantic issues with Lua code via transpilation")
    .option("-m, --module", "Use the @module tag to transform a module")
    .option("-c, --classmod", "Use the @classmod tag to transform a class")
    .option("-d, --declaration", "Generate declaration files only");
function parseCommandLine(args) {
    program.parse(args);
    if (program.args) {
        const showSemanticErrors = program.showSemanticErrors === true;
        const module = program.module === true;
        const classmod = program.classmod === true;
        const transpileResult = transpile_1.transpile(program.args, {
            showSemanticErrors,
            module,
            classmod,
        });
        if (showSemanticErrors) {
            const diagnostics = diagnose_1.getSemanticDiagnostics(transpileResult, {});
            diagnostics.forEach((diagnostic) => {
                console.log(diagnostic.messageText);
            });
        }
        if (program.declaration) {
            const declarationFiles = declaration_1.generateDeclarations(transpileResult);
            emit_1.emit(declarationFiles);
        }
        else {
            emit_1.emit(transpileResult);
        }
    }
}
exports.parseCommandLine = parseCommandLine;
