var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var appRoot = 'src/';
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));


var output = 'dist/';

if (gutil.env.dev) {
  output = path.join(process.cwd(), '../skeleton-interface/jspm_packages/npm/aurelia/aurelia-animator-css@' + pkg.version);
}
module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  style: 'styles/**/*.css',
  output: output,
  doc:'./doc',
  e2eSpecsSrc: 'test/e2e/src/*.js',
  e2eSpecsDist: 'test/e2e/dist/',
  packageName: pkg.name
};
