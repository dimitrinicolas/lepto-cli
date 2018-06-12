const chalk = require('chalk');
const childProcess = require('child_process');
const cmdify = require('cmdify');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');

const setup = () => {
  const questions = [

    {
      type: 'input',
      name: 'filepath',
      message: 'Path to your config file',
      default: 'lepto.config.json'
    },
    {
      type: 'input',
      name: 'input',
      message: 'Your input directory',
      default: 'assets/input'
    },
    {
      type: 'input',
      name: 'output',
      message: 'Your output directory',
      default: 'assets/output'
    },
    {
      type: 'confirm',
      name: 'watch',
      message: 'Watch files changes?',
      default: true
    },


    {
      type: 'list',
      name: 'optimType',
      message: 'What kind of optimization do you need?',
      choices: ['Quick', 'Expert'],
      filter: function(val) {
        return val.toLowerCase();
      }
    },

    {
      type: 'input',
      name: 'jpgQ',
      message: 'Quality for your jpgs (1-100)',
      default: 80,
      validator: Number
    },
    {
      type: 'confirm',
      name: 'retina',
      message: 'Retina @2x and @3x for png?',
      default: true
    },

    {
      type: 'confirm',
      name: 'resize',
      message: 'Resize your images?',
      default: true,
      when: function(a) {
        return a.optimType === 'expert';
      }
    },
    {
      type: 'input',
      name: 'resizeMaxWidth',
      message: 'Maximum width in px',
      default: 1200,
      when: function(a) {
        return a.optimType === 'expert' && a.resize;
      }
    },
    {
      type: 'confirm',
      name: 'webp',
      message: 'webp alternative for your jpgs?',
      default: true,
      when: function(a) {
        return a.optimType === 'expert';
      }
    },
    {
      type: 'confirm',
      name: 'vibrant',
      message: `Regroup all the vibrants colors of your images into a single json?`,
      default: true,
      when: function(a) {
        return a.optimType === 'expert';
      }
    },
    {
      type: 'input',
      name: 'dataOutput',
      message: 'Set the path of this json file',
      default: function(a) {
        return a.output + '/data.json';
      },
      when: function(a) {
        return a.optimType === 'expert' && a.vibrant;
      }
    },

  ];

  inquirer.prompt(questions).then(a => {
    const deps = ['lepto-cli'];

    let jsonContent = {
      input: a.input,
      output: a.output,
      watch: a.watch,
      dataOutput: null
    };
    if (a.dataOutput !== null) {
      jsonContent.dataOutput = a.dataOutput;
    }
    jsonContent.use = [];
    jsonContent.filters = [];

    jsonContent.use.push({
      name: 'lepto.jpeg',
      quality: parseInt(a.jpgQ)
    });
    jsonContent.use.push({
      name: 'lepto.png',
      compression: 9
    });

    const jpgPlugins = [];
    const pngPlugins = [];
    if (a.resizeMaxWidth || a.retina) {
      deps.push('lepto-resize');
    }
    if (a.resizeMaxWidth) {
      jpgPlugins.push({
        name: 'lepto-resize',
        maxWidth: parseInt(a.resizeMaxWidth)
      });
    }
    if (a.retina) {
      pngPlugins.push({
        name: 'lepto-resize',
        retina: [2, 3]
      });
    }
    if (a.webp) {
      jpgPlugins.push({
        name: 'lepto.webp',
        quality: 80
      });
    }
    if (a.vibrant) {
      deps.push('lepto-vibrant-color');
      jpgPlugins.push('lepto-vibrant-color');
    }

    if (jpgPlugins.length) {
      jsonContent.filters.push({
        glob: '**/*.{jpg,jpeg}',
        use: jpgPlugins
      });
    }
    if (pngPlugins.length) {
      jsonContent.filters.push({
        glob: '**/*.png',
        use: pngPlugins
      });
    }
    const jsonStr = JSON.stringify(jsonContent, null, 2);
    fse.outputFile(a.filepath, jsonStr, err => {
      if (err) {
        console.log(chalk.red.bold(`\nUnable to save config file ${a.filepath}`));
        console.log(`Here is the json file content:\n`);
        console.log(jsonStr);
        console.log(`\n`);
      }
      else {
        console.log('Config file written!');
        if (a.optimType === 'quick') {
          console.log(`\nCool! You can include even more optimizations by looking into lepto's readme: https://github.com/dimitrinicolas/lepto`);
        }
        else if (a.optimType === 'expert') {
          console.log(`\nGreat choice! Find more into lepto's readme: https://github.com/dimitrinicolas/lepto`);
        }
        console.log(`\nYou have some plugins to install:`);
        console.log('$', chalk.white.bold(`npm i -D ${deps.join(' ')}`));
        console.log(`\nThen, you can launch lepto with this command:`);
        console.log('$', chalk.white.bold(`lepto -c ${a.filepath}\n`));

        setTimeout(() => {
          inquirer.prompt([
            {
              type: 'confirm',
              name: 'install',
              message: 'Do you want I install the dependencies?',
              default: true
            },
          ]).then(a => {
            if (!a.install) {
              console.log(`\nOkay!:`);
            }
            else {
              const loader = ['/ Installing dependencies', '| Installing dependencies', '\\ Installing dependencies', '- Installing dependencies'];
              let i = 4;
              let ui = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });

              setInterval(() => {
                ui.updateBottomBar(loader[i++ % 4]);
              }, 300);

              const cmdOpts = ['i', '-D'];
              for (let dep of deps) {
                cmdOpts.push(dep);
              }
              let installationErrors = false;
              const cmd = childProcess.spawn(cmdify('npm'), cmdOpts, { stdio: 'pipe' });
              cmd.stdout.pipe(ui.log);
              cmd.stdout.on('data', function(data) {
                console.log(data);
              });
              cmd.stderr.on('data', function(data) {
                installationErrors = true;
                console.log(chalk.red(data));
              });
              cmd.on('close', () => {
                if (!installationErrors) {
                  ui.updateBottomBar(chalk.keyword('lime')('\nInstallation done!\n'));
                }
                process.exit();
              });
            }
          });
        }, 300);

      }
    })
  });
};

module.exports = setup;