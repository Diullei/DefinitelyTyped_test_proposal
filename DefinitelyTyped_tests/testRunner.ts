/// <reference path='src/helper.ts' />
/// <reference path='src/exec.ts' />
/// <reference path='src/io.ts' />

var cfg = {
	root: '..',
	pattern: /.\-tests\.ts/g,
	exclude: {
		'.git': true,
		'.gitignore': true,
		'Jakefile': true,
		'.DefinitelyTyped_file_test': true,
		'LICENSE': true,
		'README.md': true
	}
};

if(process.argv.length > 2) {
	cfg.root = process.argv[2];
}

class TestFile {
	public name: string;
	public errors: string[] = [];

	public toHtml(lib: string){
		var html = '<li class="{=status}" id="qunit-test-output0">\
						<strong>\
							[<span class="module-name">{=lib}</span>] \
							<span class="test-name">{=file}</span>\
							<b class="counts">(<b class="status">{=failed} failed</b>)</b>\
						</strong>'
			.replace(/\{=lib\}/g, lib)
			.replace(/\{=file\}/g, this.name.substr(cfg.root.length))
			.replace(/\{=failed\}/g, <string><any>this.errors.length)
			.replace(/\{=status\}/g, this.errors.length == 0 ? 'pass' : 'fail');

		if(this.errors.length > 0) {
			html += '<ol style="display: block;">';
			for(var i = 0; i < this.errors.length; i++) {
				html += '<li class="{=status}"><span class="test-message">{=errors}</span></li>'
					.replace(/\{=errors\}/g, this.errors[i])
					.replace(/\{=status\}/g, this.errors.length == 0 ? 'pass' : 'fail');
			}
			html += '</ol>';
		}

		html += '</li>';
		return html;
	}
}

class Test {
	public lib: string;
	public files: TestFile[] = [];

	public failed(): number {
		var count = 0;
		if(this.files) {
			for(var i = 0; i < this.files.length; i++) {
				count += this.files[i].errors.length;
			}
		}
		return count;
	}

	public total(): number {
		return this.files.length;
	}

	public toHtml(){
		var testsHtml = '';

		if(this.files.length > 0) {
			for(var i = 0; i < this.files.length; i++) {
				testsHtml += this.files[i].toHtml(this.lib);
			}

			if(testsHtml){
				return '<ul id="qunit-tests">{=tests}</ul>'.replace(/\{=tests\}/g, testsHtml);
			} else {
				return '';
			}
		} else {
			return '<ul id="qunit-tests"><li class="inconclusive" id="qunit-test-output0">\
					<strong>\
						[<span class="module-name">{=lib}</span>] Without tests\
					</strong>\
				</li></ul>'
			.replace(/\{=lib\}/g, this.lib)
		}
	}	
}

class Tests {
	public tests: Test[] = [];

	public total(): number {
		var count = 0;
		for(var i = 0; i < this.tests.length; i++) {
			count += this.tests[i].total();
		}
		return count;
	}

	public failed(): number {
		var count = 0;
		for(var i = 0; i < this.tests.length; i++) {
			count += this.tests[i].failed();
		}
		return count;
	}

	public nodeVersion(): string {
		return (<any>process).version;
	}

	public typescriptVersion(): string {
		return tscVersion;
	}

	public toHtml(withoutTestsCount: number){
		var html = '<h2 id="qunit-banner" class="qunit-{=status}"></h2>\
			<h2 id="qunit-userAgent">{=platform}</h2>\
			<p id="qunit-testresult" class="result">\
				<span class="failed">{=failed}</span> tests failed and {=withoutTestsCount} definitions without tests.\
			</p>'
			.replace(/\{=status\}/g, this.failed() == 0 ? 'pass' : 'fail')
			.replace(/\{=platform\}/g, 'NodeJS Version: ' + this.nodeVersion() + ', Microsoft TypeScript: ' + this.typescriptVersion())
			.replace(/\{=withoutTestsCount\}/g, <string><any>withoutTestsCount)
			.replace(/\{=failed\}/g, <string><any>this.failed());

		for(var i = 0; i < this.tests.length; i++) {
			html += this.tests[i].toHtml();
		}

		return html;
	}	
}

var template = '<html>\
	<head>\
	  <meta charset="utf-8">\
	  <title>DefinitelyTyped - Global Test Runner</title>\
	  <style>#qunit-tests,#qunit-header,#qunit-banner,#qunit-testrunner-toolbar,#qunit-userAgent,#qunit-testresult{font-family:"Helvetica Neue Light","HelveticaNeue-Light","Helvetica Neue",Calibri,Helvetica,Arial,sans-serif}#qunit-testrunner-toolbar,#qunit-userAgent,#qunit-testresult,#qunit-tests li{font-size:small}#qunit-tests{font-size:smaller}#qunit-tests,#qunit-tests ol,#qunit-header,#qunit-banner,#qunit-userAgent,#qunit-testresult{margin:0;padding:0}#qunit-header{padding:.5em 0 .5em 1em;color:#8699a4;background-color:#0d3349;font-size:1.5em;line-height:1em;font-weight:normal}#qunit-header a{text-decoration:none;color:#c2ccd1}#qunit-header a:hover,#qunit-header a:focus{color:#fff}#qunit-header label{display:inline-block;padding-left:.5em}#qunit-banner{height:5px}#qunit-testrunner-toolbar{padding:.5em 0 .5em 2em;color:#5e740b;background-color:#eee}#qunit-userAgent{padding:.5em 0 .5em 2.5em;background-color:#2b81af;color:#fff;text-shadow:rgba(0,0,0,0.5) 2px 2px 1px}#qunit-tests{list-style-position:inside}#qunit-tests li{padding:.4em .5em .4em 2.5em;border-bottom:1px solid #fff;list-style-position:inside}#qunit-tests.hidepass li.pass,#qunit-tests.hidepass li.running{display:none}#qunit-tests li strong{cursor:pointer}#qunit-tests li a{padding:.5em;color:#c2ccd1;text-decoration:none}#qunit-tests li a:hover,#qunit-tests li a:focus{color:#000}#qunit-tests ol{margin-top:.5em;padding:.5em;background-color:#fff;box-shadow:inset 0 2px 13px #999;-moz-box-shadow:inset 0 2px 13px #999;-webkit-box-shadow:inset 0 2px 13px #999}#qunit-tests table{border-collapse:collapse;margin-top:.2em}#qunit-tests th{text-align:right;vertical-align:top;padding:0 .5em 0 0}#qunit-tests td{vertical-align:top}#qunit-tests pre{margin:0;white-space:pre-wrap;word-wrap:break-word}#qunit-tests del{background-color:#e0f2be;color:#374e0c;text-decoration:none}#qunit-tests ins{background-color:#ffcaca;color:#500;text-decoration:none}#qunit-tests b.counts{color:black}#qunit-tests b.passed{color:#5e740b}#qunit-tests b.failed{color:#710909}#qunit-tests li li{margin:.5em;padding:.4em .5em .4em .5em;background-color:#fff;border-bottom:0;list-style-position:inside}#qunit-tests li li.pass{color:#5e740b;background-color:#fff;border-left:26px solid #c6e746}#qunit-tests .pass{color:#528ce0;background-color:#d2e0e6}#qunit-tests .pass .test-name{color:#366097}#qunit-tests .pass .test-actual,#qunit-tests .pass .test-expected{color:#999}#qunit-banner.qunit-pass{background-color:#c6e746}#qunit-tests li li.fail{color:#710909;background-color:#fff;border-left:26px solid #ee5757;white-space:pre}#qunit-tests .inconclusive{color:#000;background-color:#d9d936}#qunit-tests .fail{color:#000;background-color:#ee5757}#qunit-tests .fail .test-name,#qunit-tests .fail .module-name{color:#000}#qunit-tests .fail .test-actual{color:#ee5757}#qunit-tests .fail .test-expected{color:green}#qunit-banner.qunit-fail{background-color:#ee5757}#qunit-testresult{padding:.5em .5em .5em 2.5em;color:#2b81af;background-color:#d2e0e6;border-bottom:1px solid white}#qunit-testresult .module-name{font-weight:bold}#qunit-fixture{position:absolute;top:-10000px;left:-10000px;width:1000px;height:1000px}ul{list-style-type:none}</style>\
	</head>\
	<body>\
	<div id="qunit">\
		<h1 id="qunit-header">\
			<a href="#">DefinitelyTyped - Global Test Runner</a> \
		</h1>\
		{=content}\
	</div>\
	</body>\
</html>';

var testFiles = IO.dir(cfg.root, cfg.pattern, { recursive: true });
var allFiles = IO.dir(cfg.root, null, { recursive: true });

var totalTest = testFiles.length;
var testIndex = 0;
var testFolders = {};

function runTests(testFiles) {
	var tests = new Tests();

	var splitContentByNewlines = function(content: string) {
	    var lines = content.split('\r\n');
	    if (lines.length === 1) {
	        lines = content.split('\n');
	    }
	    return lines;
	}

	Exec.exec(
		'tsc',
		[testFiles[testIndex]],
		(ExecResult) => {
			var lib = testFiles[testIndex].substr(cfg.root.length).split('/')[1];
			testFolders[lib] = true;
			var test = new Test();
			test.lib = lib;
			var testFile = new TestFile();
			testFile.name = testFiles[testIndex];

			var errors = splitContentByNewlines(ExecResult.stderr);
			var count = 0;
			for(var i = 0; i < errors.length; i++){
				if(errors[i]) {
					testFile.errors.push(errors[i]);
					count++;
				}
			}
			console.log('  [' + lib + '] ' + testFiles[testIndex].substr(cfg.root.length) + ' (' + count + ' error(s))');

			test.files.push(testFile);
			tests.tests.push(test);


			testIndex++;
			if(testIndex < totalTest) {
				Exec.exec(
					'tsc',
					[testFiles[testIndex]],
					<(ExecResult) => any>arguments.callee);
			} else {
				var withoutTests = {};
				for(var k = 0; k < allFiles.length; k++) {
					var rootFolder = allFiles[k].substr(cfg.root.length).split('/')[1];
					if(!(rootFolder in cfg.exclude)) {
						if(!(rootFolder in testFolders)) {
							withoutTests[rootFolder] = true;
						}
					}
				}
			
				var withoutTestsCount = 0;
				for(var attr in withoutTests) {

					var test = new Test();
					test.lib = attr;
					tests.tests.push(test);

					console.log('  ['+attr+'] Without tests');
					withoutTestsCount++;
				}
			
				console.log('\n> ' + tests.failed() + ' tests failed. and '+withoutTestsCount+' definitions without tests.\n');

				IO.writeFile('test-result.html', template.replace(/\{=content\}/g, tests.toHtml(withoutTestsCount)));
			}
		});
}

var tscVersion = '?.?.?';
Exec.exec('tsc', ['-version'], (ExecResult) => {
	tscVersion = ExecResult.stdout;
	runTests(testFiles);
});
