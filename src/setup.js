const chalk = require('chalk');
const childProcess = require('child_process');
const cmdify = require('cmdify');
const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');

let filepath;
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
      default: 70,
      validator: Number
    },
    {
      type: 'confirm',
      name: 'retina',
      message: 'Retina @2x for png?',
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
    const deps = [];

    let jsonContent = {
      input: a.input.trim(),
      output: a.output.trim(),
      watch: a.watch,
      openGUI: true
    };
    if (a.dataOutput !== null) {
      jsonContent.dataOutput = a.dataOutput;
    }
    jsonContent.filters = [];

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
        retina: [2]
      });
    }
    if (a.webp) {
      deps.push('lepto-webp');
      jpgPlugins.push({
        name: 'lepto-webp',
        quality: 70
      });
    }
    if (a.vibrant) {
      deps.push('lepto-vibrant-color');
      jpgPlugins.push('lepto-vibrant-color');
    }

    jpgPlugins.push({
      name: 'lepto.jpeg',
      quality: parseInt(a.jpgQ)
    });
    pngPlugins.push({
      name: 'lepto.png',
      quality: '70-80'
    });

    jsonContent.filters.push({
      glob: [
        '**/*.jpg',
        '**/*.jpeg'
      ],
      use: jpgPlugins
    });
    jsonContent.filters.push({
      glob: '**/*.png',
      use: pngPlugins
    });

    const jsonStr = JSON.stringify(jsonContent, null, 2);
    filepath = a.filepath;
    fse.outputFile(filepath, jsonStr, err => {
      if (err) {
        console.log(chalk.red.bold(`\nUnable to save config file ${filepath}`));
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
        console.log('$', chalk.bold(`npm i -D ${deps.join(' ')}`));
        console.log(`\nThen, you can launch lepto with this command:`);
        console.log('$', chalk.bold(`lepto -c ${filepath}\n`));

        const askForInstallation = () => {
          inquirer.prompt([
            {
              type: 'confirm',
              name: 'install',
              message: 'Do you want I install the dependencies?',
              default: true
            },
          ]).then(a => {
            if (!a.install) {
              console.log(`\nOkay!`);
            }
            else {
              const loader = ['/ Installing dependencies', '| Installing dependencies', '\\ Installing dependencies', '- Installing dependencies'];
              let i = 4;
              let ui = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });

              setInterval(() => {
                ui.updateBottomBar(loader[i++ % 4]);
              }, 170);

              const cmdOpts = ['i', '-D'];
              for (let dep of deps) {
                cmdOpts.push(dep);
              }
              const cmd = childProcess.spawn(cmdify('npm'), cmdOpts, { stdio: 'pipe' });
              cmd.stdout.pipe(ui.log);
              cmd.stdout.on('data', function(data) {
                console.log('\n' + chalk(data));
              });
              cmd.stderr.on('data', function(data) {
                if (!/No description/gi.test(data.toString())
                  && !/created a lockfile/gi.test(data.toString())
                  && !/No repository field/gi.test(data.toString())
                  && !/No license field/gi.test(data.toString())) {
                  console.log('\n' + chalk.red(data));
                }
              });
              cmd.on('close', () => {
                ui.updateBottomBar(chalk.hex('#33cc33')('\n✔ ') + 'Installation done!\n');
                console.log(`\nYou can launch lepto with this command:`);
                console.log('$', chalk.bold(`lepto -c ${filepath}`));
                process.exit();
              });
            }
          });
        };

        if (!fs.existsSync('./package.json')) {
          console.log(chalk('No package.json found, I create it for you\n'));
          const pkgContent = {
            name: process.cwd().substr(process.cwd().lastIndexOf('/') + 1, process.cwd().length),
            version: '1.0.0',
            description: ''
          };
          fse.outputFile('./package.json', JSON.stringify(pkgContent, null, 2), err => {
            if (err) {
              console.log(chalk.red.bold(`Unable to create package.json`));
              console.log(`Here is package.json content:\n`);
              console.log(pkgContent);
              console.log(`\n`);
            }
            setTimeout(askForInstallation, 150);
          });
        }
        else {
          setTimeout(askForInstallation, 150);
        }

      }
    })
  });
};

module.exports = setup;
