"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
const ts = require("typescript");
const helper = require("./helper");
const classmod = require("./classmod");
const moduleTag = require("./module");
const TsBuilder_1 = require("./TsBuilder");
class Transformer {
    constructor(program, options) {
        this.options = options;
        this.blockScopeLevel = 0;
        if (program) {
            this.checker = program.getTypeChecker();
        }
        this.diagnostics = [];
        this.builder = new TsBuilder_1.TsBuilder();
    }
    getDiagnostics() {
        return this.diagnostics;
    }
    getBuilder() {
        return this.builder;
    }
    transformChunk(ast) {
        this.chunk = ast;
        this.blockScopeLevel = 0;
        let statements = ast.body;
        const result = [];
        if (this.options.module && moduleTag.canBeTransformedToModule(statements, this.chunk)) {
            const [exportedFunctions, remainingStatements] = this.transformExportedFunctionMembers(statements);
            statements = remainingStatements;
            result.push(...exportedFunctions);
        }
        result.push(...this.transformBlock(statements));
        return result;
    }
    transformBlock(statements) {
        this.blockScopeLevel++;
        const result = [];
        if (this.options.classmod && classmod.canBeTransformedToClass(statements, this.chunk)) {
            const [classDeclaration, ...remainingStatements] = this.transformStatementsAsClass(statements);
            statements = remainingStatements;
            result.push(classDeclaration);
        }
        const remainingStatements = statements.map((statement) => this.transformStatement(statement));
        result.push(...remainingStatements);
        this.blockScopeLevel--;
        return result;
    }
    transformStatementsAsClass(statements) {
        const [localStatement, ...statementsToCheck] = statements;
        const memberExpressionFunctionDeclarations = [];
        const remainingStatements = statementsToCheck.filter((statement) => {
            if (statement.type === "FunctionDeclaration" && statement.identifier.type === "MemberExpression") {
                memberExpressionFunctionDeclarations.push(statement);
            }
            else {
                return true;
            }
        });
        const name = localStatement && localStatement.type === "LocalStatement" ? localStatement.variables[0].name : undefined;
        const methods = memberExpressionFunctionDeclarations.map((statement) => this.transformFunctionDeclarationAsMethod(statement));
        const classDeclaration = this.builder.createClassDeclaration(undefined, undefined, name ? this.builder.createIdentifier(name, localStatement) : undefined, undefined, undefined, methods, localStatement);
        return [classDeclaration, ...remainingStatements];
    }
    transformExportedFunctionMembers(statements) {
        const exportedFunctions = [];
        const remainingStatements = statements.slice(1).filter((statement) => {
            if (statement.type === "FunctionDeclaration" && statement.identifier.type === "MemberExpression") {
                const functionDeclaration = this.transformFunctionDeclarationAsExportedFunction(statement);
                exportedFunctions.push(functionDeclaration);
                return false;
            }
            else {
                return true;
            }
        });
        return [exportedFunctions, remainingStatements];
    }
    transformStatement(node) {
        switch (node.type) {
            case "LocalStatement":
                return this.transformLocalStatement(node);
            case "ReturnStatement":
                return this.transformReturnStatement(node);
            case "FunctionDeclaration":
                return this.transformFunctionDeclaration(node);
            case "AssignmentStatement":
                return this.transformAssignmentStatement(node);
            case "CallStatement":
                return this.transformCallStatement(node);
            case "IfStatement":
                return this.transformIfStatement(node);
            case "ForGenericStatement":
                return this.transformForGenericStatement(node);
            case "ForNumericStatement":
                return this.transformForNumericStatement(node);
            case "WhileStatement":
                return this.transformWhileStatement(node);
            case "BreakStatement":
                return this.transformBreakStatement(node);
            default:
                throw new Error(`Unknown Statement Type: ${node.type}`);
        }
    }
    transformExpression(node) {
        switch (node.type) {
            case "NumericLiteral":
                return this.transformNumericLiteral(node);
            case "StringLiteral":
                return this.transformStringLiteral(node);
            case "Identifier":
                return this.transformIdentifier(node);
            case "TableConstructorExpression":
                return this.transformTableConstructorExpression(node);
            case "FunctionDeclaration":
                return this.transformFunctionExpression(node);
            case "UnaryExpression":
                return this.transformUnaryExpression(node);
            case "LogicalExpression":
                return this.transformLogicalExpression(node);
            case "BinaryExpression":
                return this.transformBinaryExpression(node);
            case "MemberExpression":
                return this.transformMemberExpression(node);
            case "CallExpression":
                return this.transformCallExpression(node);
            case "StringCallExpression":
                return this.transformStringCallExpression(node);
            case "TableCallExpression":
                return this.transformTableCallExpression(node);
            case "BooleanLiteral":
                return this.transformBooleanLiteral(node);
            case "VarargLiteral":
                return this.transformVarargLiteral(node);
            case "NilLiteral":
                return this.transformNilLiteral(node);
            case "IndexExpression":
                return this.transformIndexExpression(node);
            default:
                throw new Error(`Unknown Expression Type: ${node.type} ${node.range}`);
        }
    }
    transformNilLiteral(node) {
        return this.builder.createIdentifier("undefined");
    }
    transformIndexExpression(node) {
        return this.builder.createElementAccess(this.transformExpression(node.base), this.transformExpression(node.index));
    }
    transformVarargLiteral(node) {
        return this.builder.createSpread(this.builder.createIdentifier("vararg"));
    }
    transformBooleanLiteral(node) {
        if (node.value) {
            return this.builder.createTrue();
        }
        else {
            return this.builder.createFalse();
        }
    }
    transformBinaryExpression(node) {
        let operator;
        switch (node.operator) {
            case "%":
                operator = ts.SyntaxKind.PercentToken;
                break;
            case "*":
                operator = ts.SyntaxKind.AsteriskToken;
                break;
            case "+":
                operator = ts.SyntaxKind.PlusToken;
                break;
            case "-":
                operator = ts.SyntaxKind.MinusToken;
                break;
            case "..":
                operator = ts.SyntaxKind.PlusToken;
                break;
            case "/":
                operator = ts.SyntaxKind.SlashToken;
                break;
            case "<":
                operator = ts.SyntaxKind.LessThanToken;
                break;
            case "<=":
                operator = ts.SyntaxKind.LessThanEqualsToken;
                break;
            case "==":
                operator = ts.SyntaxKind.EqualsEqualsEqualsToken;
                break;
            case ">":
                operator = ts.SyntaxKind.GreaterThanToken;
                break;
            case ">=":
                operator = ts.SyntaxKind.GreaterThanEqualsToken;
                break;
            case "^":
                operator = ts.SyntaxKind.CaretToken;
                break;
            case "~=":
                operator = ts.SyntaxKind.ExclamationEqualsEqualsToken;
                break;
            default:
                throw new Error("Unknown operator");
        }
        return this.builder.createBinary(this.transformExpression(node.left), operator, this.transformExpression(node.right));
    }
    transformLogicalExpression(node) {
        const operator = node.operator === "and"
            ? ts.SyntaxKind.AmpersandAmpersandToken
            : node.operator === "or"
                ? ts.SyntaxKind.BarBarToken
                : undefined;
        if (!operator) {
            throw new Error("Unknown operator");
        }
        return this.builder.createBinary(this.transformExpression(node.left), operator, this.transformExpression(node.right));
    }
    transformUnaryExpression(node) {
        let operator;
        switch (node.operator) {
            case "#":
                return this.builder.createPropertyAccess(this.transformExpression(node.argument), this.builder.createIdentifier("length"));
            case "~":
                operator = ts.SyntaxKind.ExclamationToken;
                break;
            case "-":
                operator = ts.SyntaxKind.MinusToken;
                break;
            case "not":
                operator = ts.SyntaxKind.ExclamationToken;
                break;
            default:
                throw new Error("Unknown operator");
        }
        return this.builder.createPrefix(operator, this.transformExpression(node.argument));
    }
    transformMemberExpression(node) {
        return this.builder.createPropertyAccess(this.transformExpression(node.base), this.transformIdentifier(node.identifier));
    }
    transformIdentifier(node) {
        let chosenName;
        switch (node.name) {
            case "_G": {
                chosenName = "globalThis";
                break;
            }
            default: {
                chosenName = node.name;
            }
        }
        return this.builder.createIdentifier(chosenName, node);
    }
    transformIfStatement(node) {
        const ifClause = node.clauses[0];
        const rootIfStatement = this.builder.createIf(this.transformExpression(ifClause.condition), this.builder.createBlock(ifClause.body.map((statement) => this.transformStatement(statement)), undefined, ifClause), undefined, node);
        let lastIfStatement = rootIfStatement;
        node.clauses.forEach((clause) => {
            switch (clause.type) {
                case "ElseifClause":
                    lastIfStatement.elseStatement = this.builder.createIf(this.transformExpression(ifClause.condition), this.builder.createBlock(ifClause.body.map((statement) => this.transformStatement(statement)), undefined, ifClause));
                    lastIfStatement = lastIfStatement.elseStatement;
                    break;
                case "ElseClause":
                    lastIfStatement.elseStatement = this.builder.createBlock(clause.body.map((statement) => this.transformStatement(statement)));
                    break;
            }
        });
        return rootIfStatement;
    }
    transformType(type) {
        const types = type.split("|").map((typeString) => {
            switch (typeString) {
                case "number":
                    return this.builder.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
                case "string":
                    return this.builder.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
                default:
                    throw new Error(`Unknown type ${typeString}`);
            }
        });
        if (types.length === 1) {
            return types[0];
        }
        else {
            return this.builder.createUnionTypeNode(types);
        }
    }
    transformForNumericStatement(node) {
        const identifier = this.transformIdentifier(node.variable);
        const incrementor = node.step === null
            ? this.builder.createPostfix(identifier, ts.SyntaxKind.PlusPlusToken)
            : this.builder.createBinary(identifier, this.builder.createToken(ts.SyntaxKind.FirstCompoundAssignment), this.transformExpression(node.step));
        return this.builder.createFor(this.builder.createVariableDeclarationList([
            this.builder.createVariableDeclaration(identifier, undefined, this.transformExpression(node.start), node.start),
        ], ts.NodeFlags.Let, node.start), this.builder.createBinary(identifier, this.builder.createToken(ts.SyntaxKind.LessThanEqualsToken, node.end), this.transformExpression(node.end), node.end), incrementor, this.builder.createBlock(node.body.map((statement) => this.transformStatement(statement)), true, node), node);
    }
    transformForGenericStatement(node) {
        return this.builder.createForOf(undefined, this.builder.createVariableDeclarationList([
            this.builder.createVariableDeclaration(this.builder.createArrayBindingPattern(node.variables.map((identifier) => this.builder.createBindingElement(undefined, undefined, this.transformIdentifier(identifier), undefined, identifier)))),
        ], ts.NodeFlags.Const, node), this.transformExpression(node.iterators[0]), this.builder.createBlock(this.transformBlock(node.body), true), node);
    }
    transformWhileStatement(node) {
        return this.builder.createWhile(this.transformExpression(node.condition), this.builder.createBlock(this.transformBlock(node.body), true, node), node);
    }
    transformBreakStatement(node) {
        return this.builder.createBreak(node);
    }
    transformTableKeyString(node) {
        const name = node.key.type === "Identifier"
            ? this.transformIdentifier(node.key)
            : this.builder.createComputedPropertyName(this.transformExpression(node.key), node.key);
        return this.builder.createPropertyAssignment(name, this.transformExpression(node.value), node);
    }
    transformTableValue(node) {
        return this.transformExpression(node.value);
    }
    transformTableConstructorExpression(node) {
        const usingTableKeyStrings = node.fields.some((field) => field.type === "TableKeyString");
        const usingTableValues = node.fields.some((field) => field.type === "TableValue");
        if (usingTableKeyStrings && usingTableValues) {
            throw new Error("Cannot use table keys and values together");
        }
        if (usingTableValues) {
            return this.builder.createArrayLiteral(node.fields.map((field) => this.transformTableValue(field)));
        }
        else {
            return this.builder.createObjectLiteral(node.fields.map((field) => this.transformTableKeyString(field)));
        }
    }
    transformParameterDeclaration(node, availableTags) {
        const tparams = helper.getParameterTParam(node, availableTags);
        if (Array.isArray(tparams)) {
            const name = node.type === "Identifier" ? node.name : node.value;
            if (tparams.length === 0) {
                this.diagnostics.push(helper.noLeadingWhitespace `
                    Parameter ${name} does not have a type signature.
                    Use "@tparam <type> ${name}" to define this.
                `);
            }
            else {
                this.diagnostics.push(`Many @tparams found for parameter ${name}. Using the first one.`);
            }
        }
        const tparam = Array.isArray(tparams) ? tparams[0] : tparams;
        const type = tparam ? this.transformType(tparam.type) : undefined;
        switch (node.type) {
            case "Identifier":
                return this.builder.createParameter(undefined, undefined, undefined, this.transformIdentifier(node), undefined, type, undefined, node);
            case "VarargLiteral":
                return this.builder.createParameter(undefined, undefined, this.builder.createToken(ts.SyntaxKind.DotDotDotToken, node), this.builder.createIdentifier("vararg", node), undefined, type, undefined, node);
        }
    }
    transformNumericLiteral(node) {
        return this.builder.createNumericLiteral(node.value.toString(), node);
    }
    transformStringLiteral(node) {
        return this.builder.createStringLiteral(node.value, node);
    }
    transformAssignmentLeftHandSideExpression(node) {
        switch (node.type) {
            case "Identifier":
                return this.transformIdentifier(node);
            case "MemberExpression":
                return this.transformMemberExpression(node);
            case "IndexExpression":
                return this.transformIndexExpression(node);
        }
    }
    transformAssignment(variables, expressions) {
        const transformedVariables = variables.map((variable) => this.transformAssignmentLeftHandSideExpression(variable));
        const transformedExpressions = expressions.map((expression) => this.transformExpression(expression));
        if (variables.length > 1) {
            return {
                left: this.builder.createArrayLiteral(transformedVariables, false),
                right: this.builder.createArrayLiteral(transformedExpressions, false),
            };
        }
        else {
            return {
                left: transformedVariables[0],
                right: transformedExpressions[0],
            };
        }
    }
    transformAssignmentStatement(node) {
        const { left, right } = this.transformAssignment(node.variables, node.init);
        return this.builder.createExpressionStatement(this.builder.createBinary(left, this.builder.createToken(ts.SyntaxKind.FirstAssignment, node), right, node));
    }
    transformCallStatement(node) {
        return this.builder.createExpressionStatement(this.transformExpression(node.expression));
    }
    transformCallExpression(node) {
        return this.builder.createCall(this.transformExpression(node.base), undefined, node.arguments.map((expression) => this.transformExpression(expression)), node);
    }
    transformStringCallExpression(node) {
        return this.builder.createCall(this.transformExpression(node.base), undefined, [this.transformExpression(node.argument)], node);
    }
    transformTableCallExpression(node) {
        return this.builder.createCall(this.transformExpression(node.base), undefined, [this.transformExpression(node.arguments)], node);
    }
    transformLocalBindingPattern(variables, expressions) {
        const transformedVariables = variables.map((variable) => this.transformIdentifier(variable));
        const transformedExpressions = expressions.map((expression) => this.transformExpression(expression));
        if (variables.length > 1) {
            return {
                left: this.builder.createArrayBindingPattern(transformedVariables.map((variable) => this.builder.createBindingElement(undefined, undefined, variable, undefined))),
                right: this.builder.createArrayLiteral(transformedExpressions, false),
            };
        }
        else {
            return {
                left: transformedVariables[0],
                right: transformedExpressions[0],
            };
        }
    }
    transformLocalStatement(node) {
        const { left, right } = this.transformLocalBindingPattern(node.variables, node.init);
        const [tag] = helper.getTagsOfKind("type", node, this.chunk);
        const type = tag ? this.transformType(tag.type) : undefined;
        return this.builder.createVariableStatement(undefined, this.builder.createVariableDeclarationList([this.builder.createVariableDeclaration(left, type, right)], ts.NodeFlags.Let, node), node);
    }
    transformReturnStatement(node) {
        const returnArguments = node.arguments.map((argument) => this.transformExpression(argument));
        const returnExpression = returnArguments.length > 0
            ? returnArguments.length === 1
                ? returnArguments[0]
                : this.builder.createArrayLiteral(returnArguments, false, node)
            : undefined;
        if (this.blockScopeLevel === 1 && returnExpression) {
            return this.builder.createExportAssignment(undefined, undefined, true, returnExpression, node);
        }
        else {
            return this.builder.createReturn(returnExpression, node);
        }
    }
    transformFunctionDeclaration(node) {
        const comments = helper.getComments(this.chunk, node);
        const availableTags = helper.getTags(comments);
        const treturns = availableTags.filter((currentTag) => currentTag.kind === "treturn");
        const treturnTypes = treturns.map((treturn) => this.transformType(treturn.type));
        const type = treturnTypes.length > 0
            ? treturnTypes.length > 1
                ? this.builder.createTupleTypeNode(treturnTypes)
                : treturnTypes[0]
            : this.builder.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
        switch (node.identifier.type) {
            case "Identifier":
                return this.builder.createFunctionDeclaration(undefined, undefined, undefined, this.transformIdentifier(node.identifier), undefined, node.parameters.map((identifier) => this.transformParameterDeclaration(identifier, availableTags)), type, this.builder.createBlock(this.transformBlock(node.body), true, node), node);
            case "MemberExpression": {
                if (node.identifier.indexer === ":") {
                    node.parameters.unshift({
                        type: "Identifier",
                        name: "self",
                        range: node.range,
                        loc: node.identifier.loc,
                        raw: "self",
                    });
                }
                return this.builder.createExpressionStatement(this.builder.createAssignment(this.transformExpression(node.identifier), this.transformFunctionExpression(node), node.identifier), node);
            }
            default:
                throw new Error(`Unknown function declaration ${node.identifier.type}`);
        }
    }
    transformFunctionDeclarationAsMethod(node) {
        if (node.identifier.type === "Identifier") {
            throw new Error("Expected a member expression");
        }
        const comments = helper.getComments(this.chunk, node);
        const availableTags = helper.getTags(comments);
        const treturns = availableTags.filter((currentTag) => currentTag.kind === "treturn");
        const treturnTypes = treturns.map((treturn) => this.transformType(treturn.type));
        const type = treturnTypes.length > 0
            ? treturnTypes.length > 1
                ? this.builder.createTupleTypeNode(treturnTypes)
                : treturnTypes[0]
            : this.builder.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
        return this.builder.createMethod(undefined, undefined, undefined, this.builder.createIdentifier(node.identifier.identifier.name, node.identifier), undefined, undefined, node.parameters.map((identifier) => this.transformParameterDeclaration(identifier, availableTags)), type, ts.createBlock(this.transformBlock(node.body)), node);
    }
    transformFunctionDeclarationAsExportedFunction(node) {
        const comments = helper.getComments(this.chunk, node);
        const availableTags = helper.getTags(comments);
        const treturns = availableTags.filter((currentTag) => currentTag.kind === "treturn");
        const treturnTypes = treturns.map((treturn) => this.transformType(treturn.type));
        const type = treturnTypes.length > 0
            ? treturnTypes.length > 1
                ? this.builder.createTupleTypeNode(treturnTypes)
                : treturnTypes[0]
            : this.builder.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
        const modifiers = [ts.createModifier(ts.SyntaxKind.ExportKeyword)];
        if (node.identifier.type === "Identifier") {
            throw new Error("Cannot export a non-MemberExpression function");
        }
        if (node.identifier.base.type === "MemberExpression") {
            throw new Error("Cannot export nested member expression functions");
        }
        const name = this.transformIdentifier(node.identifier.identifier);
        return this.builder.createFunctionDeclaration(undefined, modifiers, undefined, name, undefined, node.parameters.map((identifier) => this.transformParameterDeclaration(identifier, availableTags)), type, this.builder.createBlock(this.transformBlock(node.body), true, node), node);
    }
    transformFunctionExpression(node, modifiers) {
        return this.builder.createFunctionExpression(modifiers, undefined, undefined, undefined, node.parameters.map((parameter) => this.transformParameterDeclaration(parameter, [])), undefined, this.builder.createBlock(this.transformBlock(node.body), true, node), node);
    }
}
exports.Transformer = Transformer;
