import {expect} from 'chai';
import {describe, it, beforeEach} from 'mocha';
import {RequireStatementsExtractor} from '../../src/dependency-finder/require-statements-extractor';
import * as assert from 'assert';
import * as engine from 'php-parser';


describe('RequireStatementsExtractor', () => {

    let extractor;

    beforeEach(() => {
        const parser = new engine({
            parser: {
                extractDoc: false,
                php7: true,
            },
        });

        extractor = new RequireStatementsExtractor(parser);
    });

    it('should extract a require statement at top level', () => {
        const source = '<?php\n\nrequire_once("start.inc.php");\n\necho "hallo";';
        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 1);
        assert.strictEqual(stmts[0].kind, 'include');
        assert.strictEqual(stmts[0].target.value, 'start.inc.php');
    });

    it('should extract a require statement which is nested in an if-stmt', () => {
        const source = '<?php\n\nif (true) {\n\n\trequire_once("start.inc.php");\n\n}\n\necho "hallo";';
        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 1);
        assert.strictEqual(stmts[0].kind, 'include');
        assert.strictEqual(stmts[0].target.value, 'start.inc.php');
    });

    it('should extract a require statement which is nested in an else-stmt', () => {
        const source = '<?php\n\nif (false) {} else {\n\n\trequire_once("start.inc.php");\n\n}\n\necho "hallo";';
        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 1);
        assert.strictEqual(stmts[0].kind, 'include');
        assert.strictEqual(stmts[0].target.value, 'start.inc.php');
    });

    it('should extract a require statement which is nested in a double-nested if statement', () => {
        const source = `<?php
if (!is_numeric($id)) {
    if (is_numeric($storno)) {
        include "start.inc.php";
    }
}
        `;

        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 1);
        assert.strictEqual(stmts[0].kind, 'include');
        assert.strictEqual(stmts[0].target.value, 'start.inc.php');

    });

    it('should extract a require statement which is nested in the else-if block of a double-nested if statement', () => {
        const source = `<?php
if (!is_numeric($id)) {
    if (is_numeric($storno)) {
        echo "hello world";
    } else if (false) {
        include "start.inc.php";
    }
}
        `;

        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 1);
        assert.strictEqual(stmts[0].kind, 'include');
        assert.strictEqual(stmts[0].target.value, 'start.inc.php');

    });

    it('should parse a real world example source', () => {
        const source = `<?php
require_once("start.inc.php");
require_once("../includes/datenbanken.inc.php");
require_once(cblibdir."cbfunc.php");
require_once(cblibdir."validator.php");
require_once("adminlog.inc.php");
require_once("../includes/template.inc.php");
require_once("../includes/drkmail.inc.php");
require_once("../includes/sms.inc.php");
require_once("../includes/rechnung_hiorg.inc.php");

$system = new \\HiOrg\\Infrastructure\\System();

if (!empty($resubmit)) {
    include __DIR__ . "/rech_edit/create_or_update_invoice.php";
}
else {
    include __DIR__ . "/rech_edit/query_view_data.php";
}

include __DIR__ . "/rech_edit/view.php";

page_close();
        `;
        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 12);
    });

    it('should parse another real world example source', () => {
        const source = `<?php
$felder = "rechnr,ov,datum,bezahlt,bezahltvon,betrag,empf,pro_monate,pro_bis,kurse_monate,kurse_bis,posfrei,posbetr,smsbetrag,speicher_mb,hinweis,kdnr,kundenstornierbar";

if (!is_numeric($id)) {
    include __DIR__ . "/support/calc_next_invoice_number.php";
    $datum = date("d.m.Y");

    if (is_numeric($storno)) {
        include __DIR__ . "/support/query_data_to_create_annulation.php";
    }
    else if(!empty($ov)) {
        include __DIR__ . "/support/query_customer_id_and_recipient_by_ov.php";
    }
} else {
    include __DIR__ . "/support/query_invoice_by_id.php";
}
// zusätzliche Infos laden, unabhänging, wie die Seite geladen wurde
if (!empty($ov)) {
    include __DIR__ . "/support/query_customer_data_for_invoice_by_ov.php";
}

if(!empty($noabopro)) {
    $show_abopro = true;
}
if(!empty($noabokurse)) {
    $show_abokurse = true;
}
        `;

        const stmts = extractor.extractRequireStatements(source);

        assert.strictEqual(stmts.length, 5);
    });

});
