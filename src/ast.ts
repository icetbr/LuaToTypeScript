export type TextRange = [number, number];

export type NodeTypes = "Chunk"
    | "Comment"
    | "Identifier"
    | "AssignmentStatement"
    | "LocalStatement"
    | "NumericLiteral";

export type Block = Statement[];

export interface Node {
    range: TextRange;
    raw: string;
}

export interface Chunk extends Node {
    type: "Chunk";
    body: Statement[];
    comments: Comment[];
}

export interface Comment extends Node {
    type: "Comment";
    value: string;
}

export type Statement = AssignmentStatement
    | LocalStatement
    | FunctionDeclaration
    | CallStatement
    | IfStatement
    | ForGenericStatement
    | ForNumericStatement;

export interface Identifier extends Node {
    type: "Identifier";
    name: string;
}

export interface MemberExpression extends Node {
    type: "MemberExpression";
    indexer: "." | ":";
    identifier: Identifier;
    base: Identifier | MemberExpression;
}

export interface AssignmentStatement extends Node {
    type: "AssignmentStatement";
    variables: Array<Identifier | MemberExpression>;
    init: Expression[];
}

export interface IfStatement extends Node {
    type: "IfStatement";
    clauses: [IfClause, ...Array<ElseifClause | ElseClause>];
}

export interface ForGenericStatement extends Node {
    type: "ForGenericStatement";
    variables: Identifier[];
    iterators: Expression[];
    body: Statement[];
}

export interface ForNumericStatement extends Node {
    type: "ForNumericStatement";
    variable: Identifier;
    start: Expression;
    end: Expression;
    step: Expression | null;
    body: Statement[];
}

export interface IfClause extends Node {
    type: "IfClause";
    condition: Expression;
    body: Statement[];
}

export interface ElseifClause extends Node {
    type: "ElseifClause";
    condition: Expression;
    body: Statement[];
}

export interface ElseClause extends Node {
    type: "ElseClause";
    condition: Expression;
    body: Statement[];
}

export interface LocalStatement extends Node {
    type: "LocalStatement";
    variables: Identifier[];
    init: Expression[];
}

export interface FunctionDeclaration extends Node {
    type: "FunctionDeclaration";
    identifier: Identifier | MemberExpression;
    isLocal: boolean;
    parameters: Identifier[];
    body: Statement[];
}

export interface FunctionExpression extends Node {
    type: "FunctionDeclaration";
    identifier: null;
    isLocal: false;
    parameters: Identifier[];
    body: Statement[];
}

export interface CallStatement extends Node {
    type: "CallStatement";
    expression: CallExpression;
}

export interface CallExpression extends Node {
    type: "CallExpression";
    base: Identifier | MemberExpression;
    arguments: Expression[];
}

export interface TableConstructorExpression extends Node {
    type: "TableConstructorExpression";
    fields: Array<TableValue | TableKeyString>;
}

export interface UnaryExpression extends Node {
    type: "UnaryExpression";
    operator: "not" | "-" | "~" | "#";
    argument: Expression;
}

export interface LogicalExpression extends Node {
    type: "LogicalExpression";
    operator: "and" | "or";
    left: Expression;
    right: Expression;
}

export interface BinaryExpression extends Node {
    type: "BinaryExpression";
    operator: "+"
        | "-"
        | "*"
        | "/"
        | "%"
        | "^"
        | "-"
        | "=="
        | "~="
        | ">"
        | "<"
        | ">="
        | "<="
        | "..";
    left: Expression;
    right: Expression;
}

export interface TableValue extends Node {
    type: "TableValue";
    value: Expression;
}

export interface TableKeyString extends Node {
    type: "TableKeyString";
    key: Expression;
    value: Expression;
}

export interface NumericLiteral extends Node {
    type: "NumericLiteral";
    value: number;
}

export interface StringLiteral extends Node {
    type: "StringLiteral";
    value: string;
}

export type Expression = NumericLiteral
    | StringLiteral
    | Identifier
    | TableConstructorExpression
    | FunctionExpression
    | UnaryExpression
    | LogicalExpression
    | BinaryExpression
    | MemberExpression
    | CallExpression;