import {expect} from 'chai';
import {describe, xit} from 'mocha';
import * as engine from 'php-parser';

/*
Simple manual test script to execute the php-parser with a custom source to visualize the resulting ast
 */

describe('PhpParser', () => {

    xit('parses nested requires', () => {
        const parser = new engine({
            parser: {
                extractDoc: false,
                php7: true,
            },
        });

        const source = 'if (!defined("dbhostcb")) {\n' +
            '    require_once(__DIR__ . "/local.inc.php");\n' +
            '}';

        const ast = parser.parseEval(source);
    });

    xit('parses requires with dirname-call', () => {
        const parser = new engine({
            parser: {
                extractDoc: false,
                php7: true,
            },
        });

        const source = 'require_once(dirname(__FILE__) . \'/mimepart.php\');';

        const ast = parser.parseEval(source);
    });

});
