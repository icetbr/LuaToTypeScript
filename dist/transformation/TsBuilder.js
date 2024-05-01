"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsBuilder = void 0;
const ts = require("typescript");
class TsBuilder {
    constructor() {
        this.map = new WeakMap();
    }
    getMap() {
        return this.map;
    }
    createNumericLiteral(value, original) {
        const tsNode = ts.createNumericLiteral(value);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createStringLiteral(text, original) {
        const tsNode = ts.createStringLiteral(text);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createIdentifier(text, original) {
        const tsNode = ts.createIdentifier(text);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createSuper(original) {
        const tsNode = ts.createSuper();
        this.map.set(tsNode, original);
        return tsNode;
    }
    createThis(original) {
        const tsNode = ts.createThis();
        this.map.set(tsNode, original);
        return tsNode;
    }
    createNull(original) {
        const tsNode = ts.createNull();
        this.map.set(tsNode, original);
        return tsNode;
    }
    createTrue(original) {
        const tsNode = ts.createTrue();
        this.map.set(tsNode, original);
        return tsNode;
    }
    createFalse(original) {
        const tsNode = ts.createFalse();
        this.map.set(tsNode, original);
        return tsNode;
    }
    createIf(expression, thenStatement, elseStatement, original) {
        const tsNode = ts.createIf(expression, thenStatement, elseStatement);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createBlock(statements, multiLine, original) {
        const tsNode = ts.createBlock(statements, multiLine);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createArrayLiteral(elements, multiLine, original) {
        const tsNode = ts.createArrayLiteral(elements, multiLine);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createObjectLiteral(properties, multiLine, original) {
        const tsNode = ts.createObjectLiteral(properties, multiLine);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createParameter(decorators, modifiers, dotDotDotToken, name, questionToken, type, initializer, original) {
        const tsNode = ts.createParameter(decorators, modifiers, dotDotDotToken, name, questionToken, type, initializer);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createElementAccess(expression, index, original) {
        const tsNode = ts.createElementAccess(expression, index);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createSpread(expression, original) {
        const tsNode = ts.createSpread(expression);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createBinary(left, operator, right, original) {
        const tsNode = ts.createBinary(left, operator, right);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createPropertyAccess(expression, name, original) {
        const tsNode = ts.createPropertyAccess(expression, name);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createPrefix(operator, operand, original) {
        const tsNode = ts.createPrefix(operator, operand);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createKeywordTypeNode(kind, original) {
        const tsNode = ts.createKeywordTypeNode(kind);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createUnionTypeNode(types, original) {
        const tsNode = ts.createUnionTypeNode(types);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createPostfix(operand, operator, original) {
        const tsNode = ts.createPostfix(operand, operator);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createToken(token, original) {
        const tsNode = ts.createToken(token);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createFor(initializer, condition, incrementor, statement, original) {
        const tsNode = ts.createFor(initializer, condition, incrementor, statement);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createVariableDeclarationList(declarations, flags, original) {
        const tsNode = ts.createVariableDeclarationList(declarations, flags);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createVariableDeclaration(name, type, initializer, original) {
        const tsNode = ts.createVariableDeclaration(name, type, initializer);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createForOf(awaitModifier, initializer, expression, statement, original) {
        const tsNode = ts.createForOf(awaitModifier, initializer, expression, statement);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createArrayBindingPattern(elements, original) {
        const tsNode = ts.createArrayBindingPattern(elements);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createBindingElement(dotDotDotToken, propertyName, name, initializer, original) {
        const tsNode = ts.createBindingElement(dotDotDotToken, propertyName, name, initializer);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createComputedPropertyName(expression, original) {
        const tsNode = ts.createComputedPropertyName(expression);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createPropertyAssignment(name, initializer, original) {
        const tsNode = ts.createPropertyAssignment(name, initializer);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createExpressionStatement(expression, original) {
        const tsNode = ts.createExpressionStatement(expression);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createCall(expression, typeArguments, argumentsArray, original) {
        const tsNode = ts.createCall(expression, typeArguments, argumentsArray);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createVariableStatement(modifiers, declarationList, original) {
        const tsNode = ts.createVariableStatement(modifiers, declarationList);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createReturn(expression, original) {
        const tsNode = ts.createReturn(expression);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createTupleTypeNode(elementTypes, original) {
        const tsNode = ts.createTupleTypeNode(elementTypes);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createFunctionDeclaration(decorators, modifiers, asteriskToken, name, typeParameters, parameters, type, body, original) {
        const tsNode = ts.createFunctionDeclaration(decorators, modifiers, asteriskToken, name, typeParameters, parameters, type, body);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createAssignment(left, right, original) {
        const tsNode = ts.createAssignment(left, right);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body, original) {
        const tsNode = ts.createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createClassDeclaration(decorators, modifiers, name, typeParameters, heritageClauses, members, original) {
        const tsNode = ts.createClassDeclaration(decorators, modifiers, name, typeParameters, heritageClauses, members);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createExportAssignment(decorators, modifiers, isExportEquals, expression, original) {
        const tsNode = ts.createExportAssignment(decorators, modifiers, isExportEquals, expression);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createMethod(decorators, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body, original) {
        const tsNode = ts.createMethod(decorators, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createWhile(expression, block, original) {
        const tsNode = ts.createWhile(expression, block);
        this.map.set(tsNode, original);
        return tsNode;
    }
    createBreak(original) {
        const tsNode = ts.createBreak();
        this.map.set(tsNode, original);
        return tsNode;
    }
}
exports.TsBuilder = TsBuilder;
