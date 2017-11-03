#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const pug = require('pug');

const projectPath = path.resolve(__dirname);
const testsPath = path.join(projectPath, 'tests');
const files = fs.readdirSync(testsPath).filter(file => file.endsWith('.pug'));
const testingList = [];


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
        runTests();
    });

});

function runTests() {
    if (testingList.length !== files.length) return;
    testingList.map(function(row) {
        let pagHtml = pug.renderFile(row.pug, undefined, undefined);
        let es5ComponentFunc = require(row.es5).default;
        let es5Component = React.createFactory(es5ComponentFunc);
        let es5Html = ReactDOMServer.renderToStaticMarkup(es5Component());

        console.log(pagHtml, es5Html)
        //todo: no compile errors
        //todo: assert html output is equal
    })
}

