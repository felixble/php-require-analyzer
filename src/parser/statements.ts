export interface Statement {
    kind: string,
    children?: Array<Statement>;
}

export interface If extends Statement {
    body: Statement|null;
    alternate: Statement|null;
    test: Statement|null;
}

export interface RetIf extends Statement {
    falseExpr: Statement;
    trueExpr: Statement;
    test: Statement;
}

export interface For extends Statement {
    body: Statement;
    increment: Array<Statement>;
    init: Array<Statement>;
    test: Array<Statement>;
}

export interface Block extends Statement {
    children: Array<Statement>;
}

export interface Echo extends Statement {
    arguments: Array<Statement>;
}

export interface Variable extends Statement {
    name: string;
}

export interface Assign extends Statement {
    left: Statement,
    right: Statement,
}

export interface OffsetLookup extends Statement {
    offset: Statement,
    what: Statement,
}

export interface PropertyLookup extends Statement {
    offset: Statement;
    what: Statement;
}

export interface ConstRef extends Statement {
    name: string;
}

export interface Bin extends Statement {
    left: Statement,
    right: Statement,
}

export interface Isset extends Statement {
    arguments: Array<Statement>;
}

export interface Function extends Statement {
    name: string;
    arguments: Array<Statement>;
    body: Statement;
}

export interface Call extends Statement {
    arguments: Array<Statement>;
    what: Statement;
}

export interface Identifier extends Statement {
    name: string;
    resolution: string;
}

export interface Unary extends Statement {
    what: Statement;
}

export interface Empty extends Statement {
    arguments: Array<Statement>;
}

export interface Encapsed extends Statement {
    value: Array<Statement>;
}
