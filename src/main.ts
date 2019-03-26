import {OutputFactory} from './output/output-factory';
import {OutputEmitter} from './output/output-emitter';
import {Dependencies} from './modules/dependencies';
import * as cli from 'commander';

cli
    .arguments('<files> Files of the project to analyze')
    .option('-g, --graph', 'Draw graph (default)')
    .option('-l, --list', 'List files')
    .option('-s, --scope [items]', 'Analysis scope (separated by space)')
    .option('-e, --exclude [items]', 'Files to exclude (separated by space)')
    .option('-r, --resolve [constant=path]', 'Files to exclude (separated by space)')
    .parse(process.argv);

export async function main(emitter: OutputEmitter) {
    if (!process.argv.slice(2).length) {
        cli.outputHelp();
        return;
    }

    const scope = (cli.scope) ? cli.scope.split(' ') : [];
    const exclude = (cli.exclude) ? cli.exclude.split(' ') : [];
    const resolve = (cli.resolve) ? cli.resolve.split(' ') : [];
    const resolveMap = {};
    resolve.forEach((resolve) => {
        const name = resolve.split('=')[0];
        resolveMap[name] = resolve.split('=')[1];
    });

    const dependencies = new Dependencies(
        cli.args,
        resolveMap,
        emitter,
        exclude,
        scope,
    );
    if (cli.list) {
        await dependencies.printList();
    } else {
        await dependencies.printGraph();

    }
}

OutputFactory.createEmitter()
    .then((emitter: OutputEmitter) => {
        main(emitter).catch(console.error);
    });
