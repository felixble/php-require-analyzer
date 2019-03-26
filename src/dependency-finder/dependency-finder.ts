import {RequireStatementsExtractor} from './require-statements-extractor';

interface RelativePath {
    constantPrefix?: string,
    path: string,
}

export class DependencyFinder {

    private basePath: string;

    private requireStatements: Array<any> = [];

    private relativePaths: Array<RelativePath>;

    private currentStatement?: any;

    constructor(private parser, private pathModule, private constantPathMap: {[constantName:string]: string}) {
    }

    /**
     * Analyzes source code to extract the absolute path of all
     * dependencies integrated via require or include statements
     *
     * @param {string} source
     * @param basePath The path of the folder containing the source file
     * @returns {Array<string>} Absolute path to all files required by the given source.
     */
    public analyzeSource(source: string, basePath: string): Array<string> {
        this.requireStatements = [];
        this.basePath = basePath;
        try {
            this.extractRequireStatementsFrom(source);
            this.extractRelativePaths();
            return this.determineAbsolutePaths();
        } catch (e) {
            if (this.currentStatement) {
                console.error('Could not analyze the following statement:');
                console.error(this.currentStatement);
            }
            throw e;
        }
    }

    private extractRequireStatementsFrom(source: string) {
        const extractor = new RequireStatementsExtractor(this.parser);
        this.requireStatements = extractor.extractRequireStatements(source);
    }

    private extractRelativePaths(): void {
        this.relativePaths = this.requireStatements.map((stmt) => {
            this.currentStatement = stmt;

            const target = stmt.target;

            if (target.kind === 'string') {
                return {
                    path: target.value,
                };
            } else if (target.kind === 'bin') {
                switch (target.left.kind) {
                    case 'magic':
                        return {
                            constantPrefix: target.left.value,
                            path: target.right.value,
                        };
                    case 'call':
                        return {
                            constantPrefix: '__DIR__',
                            path: target.right.value,
                        };
                    default:
                        return {
                            constantPrefix: target.left.name.name,
                            path: target.right.value,
                        };
                }
            }
        });
    }

    private determineAbsolutePaths(): Array<string> {
        return this.relativePaths.map((relativePath: RelativePath) => {
            const pathPrefix = (relativePath.constantPrefix)
                ? this.resolveConstant(relativePath.constantPrefix)
                : this.basePath;



            let completeRelativePath = `${pathPrefix}/${relativePath.path}`;
            return this.pathModule.resolve(completeRelativePath);
        });
    }

    private resolveConstant(constant: string): string {
        switch (constant) {
            case '__DIR__':
                return this.basePath;
            default:
                if (this.constantPathMap[constant]) {
                    return this.constantPathMap[constant];
                }
                throw new Error(`Cannot resolve constant <${constant}>`);
        }
    };

}