import {Block, If, Statement} from '../parser/statements';

interface StatementHandler {
    getChilds(stmt: Statement): Array<Statement>;
}

class IfHandler implements StatementHandler {

    public getChilds(stmt: If): Array<Statement> {
        let childs = [];
        if (stmt.body) {
            childs = childs.concat(stmt.body);
        }
        if (stmt.alternate) {
            childs = childs.concat(stmt.alternate);
        }

        return childs;
    }

}

class BlockHandler implements StatementHandler {

    public getChilds(stmt: Block): Array<Statement> {
        return stmt.children;
    }

}

export class RequireStatementsExtractor {

    private statements: Array<any>;

    private requireStatements: Array<any> = [];

    constructor(private parser) {
    }

    public extractRequireStatements(source: string) {
        const program = this.parser.parseCode(source);
        this.statements = program.children;
        this.extractRequireStatementFromStatements(this.statements);

        return this.requireStatements;
    }

    private extractRequireStatementFromStatements(stmts: Array<Statement>) {
        stmts.forEach((stmt: Statement) => {
            if (stmt.kind === 'include') {
                this.requireStatements.push(stmt);
            }

            if (stmt.kind === 'if') {
                const handler = new IfHandler();
                this.extractRequireStatementFromStatements(handler.getChilds(stmt as If));
            }

            if (stmt.kind === 'block') {
                const handler = new BlockHandler();
                this.extractRequireStatementFromStatements(handler.getChilds(stmt as Block));
            }
        });
    }

}
