"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformLuaToTypeScript = exports.transpile = void 0;
const luaparse = require("luaparse");
const ts = require("typescript");
const Transformer_1 = require("./transformation/Transformer");
function transpile(files, options) {
    const transpiledFiles = files
        .filter(ts.sys.fileExists)
        .map((fileName) => {
        return {
            contents: ts.sys.readFile(fileName, "utf8") || "",
            fileName,
        };
    })
        .map(({ contents, fileName }) => {
        const { ast, tsCode, diagnostics } = transformLuaToTypeScript(contents.toString(), options);
        return {
            ast,
            diagnostics,
            fileName,
            tsCode,
        };
    });
    return {
        transpiledFiles,
    };
}
exports.transpile = transpile;
function transformLuaToTypeScript(luaCode, options = {}, fileName = "dummy.ts", transformer = new Transformer_1.Transformer(undefined, options)) {
    const sourceFile = ts.createSourceFile("dummy.ts", "", ts.ScriptTarget.ESNext);
    const luaAst = luaparse.parse(luaCode, { ranges: true, locations: true });
    const statements = transformer.transformChunk(luaAst);
    const ast = transformer.getBuilder().getMap();
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    const tsCode = statements
        .map((statement) => {
        return printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile);
    })
        .join("\n");
    return {
        ast,
        diagnostics: transformer.getDiagnostics(),
        fileName,
        tsCode,
    };
}
exports.transformLuaToTypeScript = transformLuaToTypeScript;
