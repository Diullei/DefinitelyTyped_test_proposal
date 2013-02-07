var fs = require("fs");
var path = require("path");

// Variables
var testRunnerDirectory = "DefinitelyTyped_tests/";

desc("Builds the test infrastructure.");
task("tests", {async: true}, function() {
	var command = "tsc " + path.join(testRunnerDirectory, "testRunner.ts") + " --out " + path.join(testRunnerDirectory, "run.js");
	console.log(command);
	var ex = jake.createExec([command]);
	ex.addListener("stdout", function(output) {
		process.stdout.write(output);
	});
	ex.addListener("stderr", function(error) {
		process.stderr.write(error);
	});
	ex.addListener("cmdEnd", function() {
		complete();
	});
	ex.run();
});

desc("Runs all definition test files. Syntax is jake runtests.");
task("runtests", ["tests"], function() {
	var command = "node " + path.join(testRunnerDirectory, "run.js") + " " + testRunnerDirectory + "..";
	console.log(command);
	var ex = jake.createExec([command]);
	ex.addListener("stdout", function(output) {
		process.stdout.write(output);
	});
	ex.addListener("stderr", function(error) {
		process.stderr.write(error);
	});
	ex.addListener("cmdEnd", function() {
		complete();
	});
	ex.run();
});
