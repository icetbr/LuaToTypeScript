"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Printer = void 0;
const ts = require("typescript");
const source_map_1 = require("source-map");
class Printer {
    constructor(printer) {
        this.printer = printer;
        this.currentIndent = "";
    }
    printSourceFile(sourceFile, map) {
        this.map = map;
        this.sourceFile = sourceFile;
        const statements = sourceFile.statements.map((statement) => this.printStatement(statement));
        const rootNode = new source_map_1.SourceNode(null, null, sourceFile.fileName, statements);
        return rootNode.toStringWithSourceMap();
    }
    pushIndent() {
        this.currentIndent = this.currentIndent + "    ";
    }
    popIndent() {
        this.currentIndent = this.currentIndent.slice(4);
    }
    indent(input = "") {
        return this.currentIndent;
    }
    createSourceNode(node, chunks) {
        const name = this.printer.printNode(ts.EmitHint.Unspecified, node, this.sourceFile);
        const original = this.map && this.map.get(node);
        if (original) {
            return new source_map_1.SourceNode(original.loc.start.line, original.loc.start.column, this.sourceFile.fileName, `${this.currentIndent}${chunks ? chunks : name}`, name);
        }
        return new source_map_1.SourceNode(null, null, this.sourceFile.fileName, chunks ? chunks : name, name);
    }
    printStatement(node) {
        if (ts.isVariableStatement(node)) {
            return this.printVariableStatement(node);
        }
        if (ts.isFunctionDeclaration(node)) {
            return this.printFunctionDeclaration(node);
        }
        return new source_map_1.SourceNode();
    }
    printVariableStatement(node) {
        return this.createSourceNode(node);
    }
    printIdentifier(node) {
        return this.createSourceNode(node);
    }
    printParameterDeclaration(node) {
        return this.createSourceNode(node);
    }
    printFunctionDeclaration(node) {
        if (!node.body || !node.name) {
            return this.createSourceNode(node);
        }
        const chunks = [];
        chunks.push("function ");
        chunks.push(this.printIdentifier(node.name));
        chunks.push("(");
        chunks.push(...node.parameters.map((parameter) => this.printParameterDeclaration(parameter)));
        chunks.push(") {\n");
        this.pushIndent();
        chunks.push(...node.body.statements.map((statement) => this.printStatement(statement)));
        this.popIndent();
        chunks.push("}");
        return this.createSourceNode(node, chunks);
    }
}
exports.Printer = Printer;
