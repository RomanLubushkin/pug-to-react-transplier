#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');
const assert = require('assert');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const pug = require('pug');

describe('Pug to React transpiler tests', function () {
    const currentPath = path.resolve(__dirname);
    const testsPath = path.join(currentPath, 'templates');
    const files = fs.readdirSync(testsPath).filter(file => file.endsWith('.pug'));
    const testingList = [];

    it('All pug templates should be transpiled without errors', function (done) {
        files.map((file) => {
            if (!file.endsWith('.pug')) return;

            const pubPath = path.join(testsPath, file);
            const reactPath = path.join(testsPath, file.split('.pug')[0] + '.js');
            const es5Path = path.join(testsPath, file.split('.pug')[0] + '.es5.js');
            const compileCommand = 'node index.js --in ' + pubPath + ' --out ' + reactPath +
                ' && ' +
                'babel ' + reactPath + ' --out-file ' + es5Path + ' --presets=es2015,react';

            exec(compileCommand, function (error, stdout, stderr) {
                testingList.push({
                    pug: pubPath,
                    react: reactPath,
                    es5: es5Path,
                    error: error,
                    stdout: stdout,
                    stderr: stderr
                });

                if (error) done(error);
                else if (stderr) done(stderr);
                else if (testingList.length === files.length) done();
            });

        });
    });

    it('All generated React components should have output equal to pug', function () {
        testingList.map(function (row) {
            const pagHtml = pug.renderFile(row.pug, undefined, undefined);
            const es5ComponentFunc = require(row.es5).default;
            const es5Component = React.createFactory(es5ComponentFunc);
            const es5Html = ReactDOMServer.renderToStaticMarkup(es5Component());

            assert.equal(row.error, null, 'Generation command is ok, ' + row.pug);
            assert.equal(row.stderr, '', 'No generation error occurred, ' + row.pug);
            assert.equal(pagHtml, es5Html, 'Result HTML is equal, ' + row.pug);
        });
    });
});

