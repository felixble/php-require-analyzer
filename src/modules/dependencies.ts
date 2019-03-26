import {OutputEmitter} from '../output/output-emitter';
import {readFile} from '../lib/read-file';
import * as engine from 'php-parser';
import * as path from "path";
import {DependencyFinder} from '../dependency-finder/dependency-finder';
import {DependencyMap} from '../dependency-map';

const parser = new engine({
    parser: {
        extractDoc: false,
        php7: true,
    },
});

export class Dependencies {

    private dependencyMap: DependencyMap = new DependencyMap();

    /**
     *
     * @param {Array<string>} entryPoints List of file paths to all entry points
     * @param constantPathMap {Object.<string, string>} constant-name -> path dictionary
     * @param emitter used to write the output
     * @param excludeFiles
     * @param scope
     */
    constructor(
        private entryPoints: Array<string>,
        private constantPathMap: { [constant: string]: string },
        private emitter: OutputEmitter,
        private excludeFiles: Array<string> = [],
        private scope: Array<string> = [],
    ) {
    }

    public async printGraph(): Promise<void> {
        await this.buildMap();

        this.dependencyMap.printGraph(this.emitter.stream);

        await this.closeStream();
    }

    public async printList(): Promise<void> {
        await this.buildMap();

        this.dependencyMap.printDependencies(this.emitter.stream);

        await this.closeStream();
    }

    private async buildMap(): Promise<void> {
        for (const entryPointFilePath of this.entryPoints) {
            const dependencyFinder = new DependencyFinder(parser, path,this.constantPathMap);

            await this.analyzeFileRecursively(entryPointFilePath, dependencyFinder, this.dependencyMap);
        }
    }

    private async closeStream(): Promise<void>  {
        await this.emitter.stream.flush();
        this.emitter.close();
    }

    private async analyzeFileRecursively(filePath: string, dependencyFinder: DependencyFinder, dependencyMap: DependencyMap): Promise<void> {
        if (dependencyMap.hasDependenciesFor(filePath) || this.isFileExcluded(filePath) || !this.fileIsInScope(filePath)) {
            return;
        }

        const content = await readFile(filePath);
        let fileDependencies = dependencyFinder.analyzeSource(content, path.dirname(filePath));
        dependencyMap.addDependenciesFor(filePath, fileDependencies);

        fileDependencies = fileDependencies
            .filter((path: string) => path.indexOf('vendor') === -1)
            .filter((path: string) => !dependencyMap.hasDependenciesFor(path));

        for (const dependencyPath of fileDependencies) {
            await this.analyzeFileRecursively(dependencyPath, dependencyFinder, dependencyMap);
        }
    }

    private isFileExcluded(filePath: string): boolean {
        return this.excludeFiles.some((excludeFile) => {
            return filePath.indexOf(excludeFile) !== -1;
        });
    }

    private fileIsInScope(filePath: string): boolean {
        return !this.scope.length || this.scope.some((scopeDir) => {
            return filePath.indexOf(`${scopeDir}/`) !== -1
        });
    }
}
