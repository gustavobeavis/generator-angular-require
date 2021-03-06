'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');
var chalk = require('chalk');

var ScriptBase = yeoman.generators.NamedBase.extend({
  constructor: function(name) {
    yeoman.generators.NamedBase.apply(this, arguments);

    try {
      this.appname = require(path.join(process.cwd(), 'bower.json')).name;
    }
    catch (e) {
      this.appname = path.basename(process.cwd());
    }
    this.appname = this._.slugify(this._.humanize(this.appname));
    this.scriptAppName = this._.camelize(this.appname) + angularUtils.appName(this);

    this.cameledName = this._.camelize(this.name);
    this.classedName = this._.classify(this.name);

    if (typeof this.env.options.appPath === 'undefined') {
      this.env.options.appPath = this.options.appPath;

      if (!this.env.options.appPath) {
        try {
          this.env.options.appPath = this.config.get('appPath');
        } catch (e) {}
      }
      this.env.options.appPath = this.env.options.appPath || 'app';
      this.options.appPath = this.env.options.appPath;
    }

    if (typeof this.env.options.testPath === 'undefined') {
      try {
        this.env.options.testPath = require(path.join(process.cwd(), 'bower.json')).testPath;
      } catch (e) {}
      this.env.options.testPath = this.env.options.testPath || 'test/spec';
    }

    var sourceRoot = '/templates/javascript';
    this.scriptSuffix = '.js';

    this.sourceRoot(path.join(__dirname, sourceRoot));

    // util.inherits(ScriptBase, yeoman.generators.NamedBase);
  },

  appTemplate: function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
      src + this.scriptSuffix,
      path.join(this.config.get('appPath'), dest.toLowerCase()) + this.scriptSuffix
    ]);
  },

  testTemplate: function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
      src + this.scriptSuffix,
      path.join(this.env.options.testPath, dest.toLowerCase()) + 'Spec' + this.scriptSuffix
    ]);
  },

  htmlTemplate: function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
      src,
      path.join(this.config.get('appPath'), dest.toLowerCase())
    ]);
  },

  addScriptToIndex: function(script) {
    try {
      var appPath = this.env.options.appPath;
      var fullPath = path.join(appPath, 'index.html');
      angularUtils.rewriteFile({
        file: fullPath,
        needle: '<!-- endbuild -->',
        splicable: [
          '<script src="scripts/' + script.replace(/\\/g, '/') + '.js"></script>'
        ]
      });
    } catch (e) {
      this.log.error(chalk.yellow(
        '\nUnable to find ' + fullPath + '. Reference to ' + script + '.js ' + 'not added.\n'
       ));
    }
  },

  generateSourceAndTest: function(appTemplate, testTemplate, targetDirectory, skipAdd) {
    // Services use classified names
    if (this.options.namespace === 'angular-require:service') {
      this.cameledName = this.classedName;
    }

    this.appTemplate(appTemplate, path.join('scripts', targetDirectory, this.name));
    this.testTemplate(testTemplate, path.join(targetDirectory, this.name));
    if (!skipAdd) {
      this.addScriptToIndex(path.join(targetDirectory, this.name));
    }
  }
});

module.exports = ScriptBase;
