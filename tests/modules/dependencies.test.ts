import {assert} from 'chai';
import {describe, it, xit, beforeEach, afterEach} from 'mocha';
import {OutputStream} from '../../src/output/output-stream';
import {Dependencies} from '../../src/modules/dependencies';

const promisify: () => Promise<void> = () => {
    return new Promise((resolve)=> {
        resolve();
    });
};

describe('Dependencies', () => {

    const FILE = './tests/modules/testfiles/scope/page.php';
    const FILE_OUTER_SCOPE = './tests/modules/testfiles/scope/page-access-outer-scope.php';

    let actualOutput = '', outputEmitter;

    beforeEach(() => {
        outputEmitter = {
            stream: {
                write: (content) => {
                    actualOutput += content;
                },
                flush: () => promisify(),
            } as OutputStream,
            close: () => {},
        };
    });

    afterEach(() => {
        actualOutput = '';
    });

    it('should find all dependencies', async () => {
        const dependencies = new Dependencies(
            [FILE],
            {},
            outputEmitter,
        );

        const expectedOutput = 'digraph dependencies {\n' +
            '"page.php"[fillcolor = gray, style=filled]"page.php" -> "support.inc.php"\n' +
            '"support.inc.php"[]"support.inc.php" -> "common.inc.php"\n' +
            '}\n';

        await dependencies.printGraph();

        assert.strictEqual(actualOutput, expectedOutput);
    }).timeout(5000);

    it('should list but not analyze excluded files', async () => {
        const dependencies = new Dependencies(
            [FILE],
            {},
            outputEmitter,
            ['support.inc.php'],
        );

        const expectedOutput = 'digraph dependencies {\n' +
            '"page.php"[fillcolor = gray, style=filled]"page.php" -> "support.inc.php"\n' +
            '}\n';

        await dependencies.printGraph();

        assert.strictEqual(actualOutput, expectedOutput);
    }).timeout(5000);

    it('should list but not analyze files which are not in the expected scope', async () => {
        const dependencies = new Dependencies(
            [FILE_OUTER_SCOPE],
            {},
            outputEmitter,
            [],
            ['scope'],
        );

        const expectedOutput = 'digraph dependencies {\n' +
            '"page-access-outer-scope.php"[fillcolor = gray, style=filled]"page-access-outer-scope.php" -> "out-of-scope.inc.php"\n' +
            '}\n';

        await dependencies.printGraph();

        assert.strictEqual(actualOutput, expectedOutput);
    });

    it('should find all dependencies if no scope is given', async () => {
        const dependencies = new Dependencies(
            [FILE_OUTER_SCOPE],
            {},
            outputEmitter,
        );

        const expectedOutput = 'digraph dependencies {\n' +
            '"page-access-outer-scope.php"[fillcolor = gray, style=filled]"page-access-outer-scope.php" -> "out-of-scope.inc.php"\n' +
            '"out-of-scope.inc.php"[]"out-of-scope.inc.php" -> "out-of-scope-too.inc.php"\n' +
            '}\n';

        await dependencies.printGraph();

        assert.strictEqual(actualOutput, expectedOutput);
    }).timeout(5000);

});
