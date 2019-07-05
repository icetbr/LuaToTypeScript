import { tsquery } from "@phenomnomnominal/tsquery";
import * as ts from "typescript";
import * as lua from "./ast";
import * as helper from "./helper";
import * as tags from "./tags";

export class Transformer {

    private chunk!: lua.Chunk;
    private checker?: ts.TypeChecker;
    private diagnostics: string[];

    constructor(program?: ts.Program) {
        if (program) {
            this.checker = program.getTypeChecker();
        }
        this.diagnostics = [];
    }

    public getDiagnostics(): string[] {
        return this.diagnostics;
    }

    public transformChunk(ast: lua.Chunk): ts.Statement[] {
        this.chunk = ast;
        return this.transformBlock(ast.body);
    }

    private transformBlock(node: lua.Block): ts.Statement[] {
        return node.map(statement => this.transformStatement(statement));
    }

    private joinObjectAssignmentStatements(
        statements: ts.Statement[],
    ): ts.Statement[] {
        const block = ts.createBlock(statements);
        // tsquery(block, "ExpressionStatement > BinaryExpression > PropertyAccessExpression > Identifier[name=x]")
        // tsquery(ts.createBlock(statements),)
        const variableDeclarations = statements.filter(
            statement => ts.isVariableStatement(statement)
                && ts.isVariableDeclaration(statement.declarationList.declarations[0])
                && ts.isIdentifier(statement.declarationList.declarations[0].name),
        ) as ts.VariableStatement[] & { declarationList: { declarations: [{ name: ts.Identifier }] } };
        const objectLiteralDeclarations = variableDeclarations.filter(variableDeclaration =>
            variableDeclaration.declarationList.declarations[0].initializer
            && ts.isObjectLiteralExpression(variableDeclaration.declarationList.declarations[0].initializer),
        ) as Array<ts.VariableStatement & {
            declarationList: { declarations: [{ name: ts.Identifier, initializer: ts.Expression }] },
        }>;
        const objectLiteralNodes = objectLiteralDeclarations.map(objectLiteralDeclaration => ({
            identifier: objectLiteralDeclaration.declarationList.declarations[0].name,
            objectLiteralExpression: objectLiteralDeclaration.declarationList.declarations[0].initializer,
        })) as Array<{ identifier: ts.Identifier, objectLiteralExpression: ts.ObjectLiteralExpression }>;
        return objectLiteralDeclarations;
    }


    private transformStatement(node: lua.Statement): ts.Statement {
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
            default:
                throw new Error(`Unknown Statement Type: ${node!.type}`);
        }
    }

    private transformExpression(node: lua.Expression): ts.Expression {
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
            case "BooleanLiteral":
                return this.transformBooleanLiteral(node);
            case "VarargLiteral":
                return this.transformVarargLiteral(node);
            case "NilLiteral":
                return this.transformNilLiteral(node);
            case "IndexExpression":
                return this.transformIndexExpression(node);
            default:
                throw new Error(`Unknown Expression Type: ${node!.type}`);
        }
    }

    private transformNilLiteral(node: lua.NilLiteral): ts.Identifier {
        return ts.createIdentifier("undefined");
    }

    private transformIndexExpression(node: lua.IndexExpression): ts.ElementAccessExpression {
        return ts.createElementAccess(
            this.transformExpression(node.base),
            this.transformExpression(node.index),
        );
    }

    private transformVarargLiteral(node: lua.VarargLiteral): ts.Expression {
        return ts.createSpread(ts.createIdentifier("vararg"));
    }

    private transformBooleanLiteral(node: lua.BooleanLiteral): ts.Expression {
        if (node.value) {
            return ts.createTrue();
        } else {
            return ts.createFalse();
        }
    }

    private transformBinaryExpression(node: lua.BinaryExpression): ts.BinaryExpression {
        let operator: ts.SyntaxKind;
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

        return ts.createBinary(
            this.transformExpression(node.left),
            operator,
            this.transformExpression(node.right),
        );
    }

    private transformLogicalExpression(node: lua.LogicalExpression): ts.BinaryExpression {
        const operator = node.operator === "and" ? ts.SyntaxKind.AsteriskAsteriskToken
            : node.operator === "or" ? ts.SyntaxKind.BarBarToken : undefined;
        if (!operator) {
            throw new Error("Unknown operator");
        }

        return ts.createBinary(
            this.transformExpression(node.left),
            operator,
            this.transformExpression(node.right),
        );
    }

    private transformUnaryExpression(node: lua.UnaryExpression): ts.UnaryExpression {
        let operator: ts.SyntaxKind;
        switch (node.operator) {
            case "#":
                return ts.createPropertyAccess(
                    this.transformExpression(node.argument),
                    ts.createIdentifier("length"),
                );
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

        return ts.createPrefix(operator, this.transformExpression(node.argument));
    }

    private transformMemberExpression(node: lua.MemberExpression): ts.PropertyAccessExpression {
        return ts.createPropertyAccess(
            this.transformExpression(node.base),
            this.transformIdentifier(node.identifier),
        );
    }

    private transformIdentifier(node: lua.Identifier): ts.Identifier {
        return ts.createIdentifier(node.name);
    }

    private transformIfStatement(node: lua.IfStatement): ts.IfStatement {
        const ifClause: lua.IfClause = node.clauses[0];
        const rootIfStatement = ts.createIf(
            this.transformExpression(ifClause.condition),
            ts.createBlock(
                ifClause.body.map(statement => this.transformStatement(statement)),
            ),
        );
        let lastIfStatement = rootIfStatement;

        node.clauses.forEach(clause => {
            switch (clause.type) {
                case "ElseifClause":
                    lastIfStatement.elseStatement = ts.createIf(
                        this.transformExpression(ifClause.condition),
                        ts.createBlock(
                            ifClause.body.map(statement => this.transformStatement(statement)),
                        ),
                    );
                    lastIfStatement = lastIfStatement.elseStatement as ts.IfStatement;
                    break;
                case "ElseClause":
                    lastIfStatement.elseStatement = ts.createBlock(
                        clause.body.map(statement => this.transformStatement(statement)),
                    );
                    break;
            }
        });

        return rootIfStatement;
    }

    private transformType(type: string): ts.TypeNode {
        const types = type.split("|").map(typeString => {
            switch (typeString) {
                case "number":
                    return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
                case "string":
                    return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
                default:
                    throw new Error(`Unknown type ${typeString}`);
            }
        });
        if (types.length === 1) {
            return types[0];
        } else {
            return ts.createUnionTypeNode(types);
        }
    }

    private transformForNumericStatement(node: lua.ForNumericStatement): ts.ForStatement {
        const identifier = this.transformIdentifier(node.variable);
        const incrementor = node.step === null
            ? ts.createPostfix(identifier, ts.SyntaxKind.PlusPlusToken)
            : ts.createBinary(
                identifier,
                ts.createToken(ts.SyntaxKind.FirstCompoundAssignment),
                this.transformExpression(node.step),
            );

        return ts.createFor(
            ts.createVariableDeclarationList(
                [
                    ts.createVariableDeclaration(
                        identifier,
                        undefined,
                        this.transformExpression(node.start),
                    ),
                ],
                ts.NodeFlags.Let,
            ),
            ts.createBinary(
                identifier,
                ts.createToken(ts.SyntaxKind.LessThanEqualsToken),
                this.transformExpression(node.end),
            ),
            incrementor,
            ts.createBlock(
                node.body.map(statement => this.transformStatement(statement)),
                true,
            ),
        )
    }

    private transformForGenericStatement(node: lua.ForGenericStatement): ts.ForOfStatement {
        return ts.createForOf(
            undefined,
            ts.createVariableDeclarationList(
                [
                    ts.createVariableDeclaration(
                        ts.createArrayBindingPattern(
                            node.variables.map(identifier => ts.createBindingElement(
                                undefined,
                                undefined,
                                this.transformIdentifier(identifier),
                                undefined,
                            )),
                        ),
                    ),
                ],
                ts.NodeFlags.Const,
            ),
            this.transformExpression(node.iterators[0]),
            ts.createBlock(this.transformBlock(node.body), true),
        );
    }

    private transformTableKeyString(node: lua.TableKeyString): ts.ObjectLiteralElementLike {
        const name = node.key.type === "Identifier"
            ? this.transformIdentifier(node.key)
            : ts.createComputedPropertyName(this.transformExpression(node.key));

        return ts.createPropertyAssignment(
            name,
            this.transformExpression(node.value),
        );
    }

    private transformTableValue(node: lua.TableValue): ts.Expression {
        return this.transformExpression(node.value);
    }

    private transformTableConstructorExpression(
        node: lua.TableConstructorExpression,
    ): ts.ObjectLiteralExpression | ts.ArrayLiteralExpression {
        const usingTableKeyStrings = node.fields.some(field => field.type === "TableKeyString");
        const usingTableValues = node.fields.some(field => field.type === "TableValue");
        if (usingTableKeyStrings && usingTableValues) {
            throw new Error("Cannot use table keys and values together");
        }

        if (usingTableValues) {
            return ts.createArrayLiteral(
                node.fields.map(field => this.transformTableValue(field as lua.TableValue)),
            );
        } else {
            return ts.createObjectLiteral(
                node.fields.map(field => this.transformTableKeyString(field as lua.TableKeyString)),
            );
        }
    }

    private transformParameterDeclaration(
        node: lua.Identifier | lua.VarargLiteral,
        availableTags: tags.Tag[],
    ): ts.ParameterDeclaration {
        const tparams = helper.getParameterTParam(node, availableTags);
        if (Array.isArray(tparams)) {
            const name = node.type === "Identifier" ?
                node.name :
                node.value;
            if (tparams.length === 0) {
                this.diagnostics.push(helper.noLeadingWhitespace`
                    Parameter ${name} does not have a type signature.
                    Use "@tparam <type> ${name}" to define this.
                `);
            } else {
                this.diagnostics.push(`Many @tparams found for parameter ${name}. Using the first one.`);
            }
        }
        const tparam: tags.TParamTag | undefined = Array.isArray(tparams) ? tparams[0] : tparams;
        const type = tparam ?
            this.transformType(tparam.type) :
            undefined;

        switch (node.type) {
            case "Identifier":
                return ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    this.transformIdentifier(node),
                    undefined,
                    type,
                );
            case "VarargLiteral":
                return ts.createParameter(
                    undefined,
                    undefined,
                    ts.createToken(ts.SyntaxKind.DotDotDotToken),
                    ts.createIdentifier("vararg"),
                    undefined,
                    type,
                );
        }
    }

    private transformNumericLiteral(node: lua.NumericLiteral): ts.NumericLiteral {
        return ts.createNumericLiteral(node.value.toString());
    }

    private transformStringLiteral(node: lua.StringLiteral): ts.StringLiteral {
        return ts.createStringLiteral(node.value);
    }

    private transformAssignmentLeftHandSideExpression(
        node: lua.Identifier | lua.MemberExpression | lua.IndexExpression,
    ): ts.Identifier | ts.PropertyAccessExpression | ts.ElementAccessExpression {
        switch (node.type) {
            case "Identifier":
                return this.transformIdentifier(node);
            case "MemberExpression":
                return this.transformMemberExpression(node);
            case "IndexExpression":
                return this.transformIndexExpression(node);
        }
    }

    private transformAssignment(
        variables: Array<lua.Identifier | lua.MemberExpression | lua.IndexExpression>,
        expressions: lua.Expression[],
    ): {
        left: ts.Identifier | ts.PropertyAccessExpression | ts.ElementAccessExpression,
        right: ts.Expression,
    } | {
        left: ts.ArrayLiteralExpression,
        right: ts.ArrayLiteralExpression,
    } {
        const transformedVariables = variables.map(
            variable => this.transformAssignmentLeftHandSideExpression(variable),
        );
        const transformedExpressions = expressions.map(expression => this.transformExpression(expression));
        if (variables.length > 1) {
            return {
                left: ts.createArrayLiteral(transformedVariables, false),
                right: ts.createArrayLiteral(transformedExpressions, false)
            };
        } else {
            return {
                left: transformedVariables[0],
                right: transformedExpressions[0],
            };
        }
    }

    private transformAssignmentStatement(node: lua.AssignmentStatement): ts.ExpressionStatement {
        const { left, right } = this.transformAssignment(node.variables, node.init);
        return ts.createExpressionStatement(
            ts.createBinary(
                left,
                ts.createToken(ts.SyntaxKind.FirstAssignment),
                right,
            ),
        );
    }

    private transformCallStatement(node: lua.CallStatement): ts.ExpressionStatement {
        return ts.createExpressionStatement(this.transformCallExpression(node.expression));
    }

    private transformCallExpression(node: lua.CallExpression): ts.CallExpression {
        return ts.createCall(
            this.transformExpression(node.base),
            undefined,
            node.arguments.map(expression => this.transformExpression(expression)),
        );
    }

    private transformLocalBindingPattern(
        variables: lua.Identifier[],
        expressions: lua.Expression[],
    ): {
        left: ts.Identifier,
        right: ts.Expression,
    } | {
        left: ts.ArrayBindingPattern,
        right: ts.ArrayLiteralExpression,
    } {
        const transformedVariables = variables.map(variable => this.transformIdentifier(variable));
        const transformedExpressions = expressions.map(expression => this.transformExpression(expression));
        if (variables.length > 1) {
            return {
                left: ts.createArrayBindingPattern(
                    transformedVariables.map(
                        variable => ts.createBindingElement(
                            undefined,
                            undefined,
                            variable,
                            undefined))),
                right: ts.createArrayLiteral(transformedExpressions, false),
            };
        } else {
            return {
                left: transformedVariables[0],
                right: transformedExpressions[0],
            };
        }
    }

    private transformLocalStatement(node: lua.LocalStatement): ts.VariableStatement {
        const { left, right } = this.transformLocalBindingPattern(node.variables, node.init);
        const tag = helper
            .getTags(helper.getComments(this.chunk, node))
            .find(associatedTag => associatedTag.kind === "type") as tags.TypeTag;
        const type = tag ?
            this.transformType(tag.type) :
            undefined;

        return ts.createVariableStatement(
            undefined,
            ts.createVariableDeclarationList(
                [
                    ts.createVariableDeclaration(
                        left,
                        type,
                        right,
                    ),
                ],
                ts.NodeFlags.Let,
            ),
        );
    }

    private transformReturnStatement(node: lua.ReturnStatement): ts.ReturnStatement {
        const returnArguments = node.arguments.map(argument => this.transformExpression(argument));
        const returnNode = returnArguments.length > 0 ?
            returnArguments.length === 1 ?
                returnArguments[0] :
                ts.createArrayLiteral(returnArguments, false) :
            undefined;

        return ts.createReturn(returnNode);
    }

    private transformFunctionDeclaration(
        node: lua.FunctionDeclaration,
    ): ts.FunctionDeclaration | ts.ExpressionStatement {
        const comments = helper.getComments(this.chunk, node);
        const availableTags = helper.getTags(comments);
        const treturns = availableTags.filter(currentTag => currentTag.kind === "treturn") as tags.TReturnTag[];
        const treturnTypes = treturns.map(treturn => this.transformType(treturn.type));
        const type = treturnTypes.length > 0 ?
            treturnTypes.length > 1 ?
                ts.createTupleTypeNode(treturnTypes) :
                treturnTypes[0] :
            ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);

        switch (node.identifier.type) {
            case "Identifier":
                return ts.createFunctionDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    this.transformIdentifier(node.identifier),
                    undefined,
                    node.parameters.map(identifier => this.transformParameterDeclaration(identifier, availableTags)),
                    type,
                    ts.createBlock(
                        this.transformBlock(node.body),
                        true,
                    ),
                );
            case "MemberExpression": {
                return ts.createExpressionStatement(
                    ts.createAssignment(
                        this.transformExpression(node.identifier),
                        this.transformFunctionExpression(node),
                    ),
                );
            }
            default:
                throw new Error(`Unknown function declaration ${node.identifier!.type}`);
        }
    }

    private transformFunctionExpression(node: lua.FunctionExpression | lua.FunctionDeclaration): ts.FunctionExpression {
        return ts.createFunctionExpression(
            undefined,
            undefined,
            undefined,
            undefined,
            node.parameters.map(parameter => this.transformParameterDeclaration(parameter, [])),
            undefined,
            ts.createBlock(
                this.transformBlock(node.body),
                true,
            ),
        );
    }

}
