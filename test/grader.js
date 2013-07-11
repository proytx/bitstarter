#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var objRestler = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// This function crafted from previous HW example of Yahoofinance API
var objFunctionReturn = function(strUrlFile, strChecksFile) {
    var objCallbackOnUrlLoad = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            // write the file locally, so we can reuse existing function
            fs.writeFileSync(strUrlFile,result);
            // this part repeats some of what used to go on in 'main'
            var checkJson = checkHtmlFile(strUrlFile, strChecksFile);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        } // end if else result 
    } // end callback function 
    return objCallbackOnUrlLoad;
}

// Foregoing malformed URL checks
var objCheckUrl = function(strUrl, strChecksFile) {
    // a local copy of url files may cause issues overwriting, especially with index.html
    var strUrlFile = strUrl.replace(/[\/\:\.]/g,'_') + ((new Date()).getTime());
    // create the callback function reference for restler
    var objCallbackOnUrlLoad = objFunctionReturn(strUrlFile, strChecksFile);
    // asynchronous call so as not to bog process down in idle loop
    objRestler.get(strUrl).on('complete', objCallbackOnUrlLoad);
}

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --urlin <input_url>', 'URL to check')
        .parse(process.argv);

    // first check for Url input, because there is no default for this - if empty run with file
    if (program.urlin) {
      objCheckUrl(program.urlin, program.checks);
    } else {
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = objCheckUrl;
}
