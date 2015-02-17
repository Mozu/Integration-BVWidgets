'use strict';

module.exports = function(grunt) {
  grunt.registerTask('updatereferences', 'Update references folder with core theme and any other dependent themes', function() {
    var done = this.async(),
    bower = require('bower');
    bower.commands.cache.clean().on('end', function() {
      ([4,5]).reduceRight(function(cb, ver) {
        return function() {
          var j = bower.commands.install(['core' + ver + '=mozu/core-theme#^' + ver], { production: true }, { directory: 'references' });
          j.on('log', function(arg) {
            grunt.log.ok(arg.message);
          });
          j.on('end', cb);
        }
      }, done)();
    });
  });
}