import * as path from "path";
import {OutputStream} from './output/output-stream';


export class DependencyMap {

    public map: {[filePath: string]: Array<string>} = {};

    public addDependenciesFor(filePath: string, dependencies: Array<string>): void {
        this.map[filePath] = dependencies;
    }

    public hasDependenciesFor(filePath: string): boolean {
        return !!this.map[filePath];
    }

    public printGraph(stream: OutputStream): void {
        let result = 'digraph dependencies {\n';

        Object.keys(this.map).forEach((file: string) => {
            this.map[file].forEach((dependency: string) => {
                const convert = (file) => {
                    if (file.indexOf('admin/') !== -1) {
                        return 'admin/' + path.basename(file);
                    }
                    return path.basename(file);
                };
                result += `"${convert(file)}"[${this.formatNode(file)}]`;
                result += `"${convert(file)}" -> "${convert(dependency)}"\n`; //  [color=red]
            });
        });

        result += '}\n';
        stream.write(result);
    }

    private formatNode(filePathOfNode: string): string {
        const isDependencyOfAnyScript =  Object.keys(this.map).some((file: string) => {
            return !!this.map[file].find((dependency: string) => filePathOfNode === dependency);
        });
        return (isDependencyOfAnyScript) ? '' : 'fillcolor = gray, style=filled';
    }

    public printDependencies(stream: OutputStream): void {
        const dependencies = {};

        Object.keys(this.map).forEach((file: string) => {
            this.map[file].forEach((dependency: string) => {
                dependencies[dependency] = true;
            });
        });

        Object.keys(dependencies).forEach((dependency) => {
            stream.write(`${dependency}\n`);
        })
    }

}
