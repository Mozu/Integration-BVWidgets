var childProcess = require('child_process');
  (function(cmds, done) {
    return cmds.reduceRight(function(cb, cmd) {
      return function() {
        console.log('\n>> ' + cmd.msg + "...");
        childProcess.exec(cmd.cmd, function(err, stdout, stderr) {
          if (err || stderr) {
            console.error(err || stderr);
            process.exit(1);
          }
          if (process.argv.pop() === "--verbose") console.log(stdout);
          cb();
        });
      }
    }, done);
  })([
    {
      msg: 'Installing global Grunt',
      cmd: 'npm install --silent -g grunt-cli'
    },
    {
      msg: 'Installing global Bower',
      cmd: 'npm install --silent -g bower'
    },
    {
      msg: 'Installing local npm dependencies',
      cmd: 'npm install --silent'
    },
    {
      msg: 'Linking Bower for local references',
      cmd: 'npm link bower --silent'
    },
    {
      msg: 'Running grunt updatereferences task to install core theme references',
      cmd: 'grunt updatereferences'
    }
  ], function() {
      console.log('\n>> Done! Your system and this directory are now set up to work with Mozu themes.\n');
      process.exit(0);
  })();