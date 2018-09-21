require('babel-polyfill');

const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const path = require('path');
const prompts = require('prompts');
const shell = require('shelljs');

const pkg = require(path.resolve(__dirname, '../package.json'));

shell.config.fatal = true;

if (argv.h || argv.help) {
  shell.echo(`
    Liferay OSB Module Finder

    -h, --help        : Display this help text
    -v, --version     : Display current version
    -p                : Print all selected modules

    Usage    : fam [customGradleCommand] [task] [task]
    example  : fam runGradle clean deploy

    Calling ${chalk.bold('fam')} by itself will default to ${chalk.bold('-p')}
  `);
  process.exit(0);
}

if (argv.v || argv.version) {
  shell.echo(`
    ${pkg.version}
  `);
  process.exit(0);
}

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

const srcDir = shell.exec('pwd', { silent: true });

/**
 * Return array of directories containing build.gradle file
 */
const getDirectories = () => {
  const shellResults = shell.exec(
    'git ls-files | grep build.gradle | xargs -I {} dirname {}',
    { silent: true }
  );

  return shellResults.split('\n');
};

/**
 * Accept array of file paths
 * Return array of objects formatted for prompts
 */
const buildPayload = (directories = []) => {
  let dirName;
  let retVal = [];

  directories.map(directory => {
    dirName = directory.substring(directory.lastIndexOf('/') + 1);

    retVal.push({ title: dirName, value: directory });
  });

  return retVal;
};

/**
 * Execute the parsed argv as commands to run against each module path selected
 */
const executeAll = async response => {
  response.map(modulePath => {
    try {
      if (modulePath !== '.') {
        shell.cd(modulePath);
        shell.echo(chalk.green(`Changed to ${modulePath}`));
        shell.echo(chalk.green(`Executing ${chalk.bold(argv._.join(' '))}`));
        shell.exec(`${argv._.join(' ')}`);
        shell.cd(srcDir);
      }
    } catch (error) {
      process.stderr.write(chalk.red('Encountered an error: ', error));
      process.exit(1);
    }
  });
};

/**
 * Default process. Print all selected paths if no arguments or -p flag was entered
 */
const printAll = response => {
  shell.echo(
    chalk.yellow(`
    You selected the following modules, but did not provide any arguments.
    Try running ${chalk.bold(
      'fam myGradleCommand deploy'
    )} to deploy these modules.
  `)
  );

  response.map(modulePath => {
    process.stdout.write(`${modulePath}\n`);
  });
};

const main = async () => {
  const directories = getDirectories();
  const payload = buildPayload(directories);

  let response = await prompts({
    type: 'multiselect',
    name: 'selection',
    message: 'Select module(s) to deploy',
    choices: payload,
    hint: '- Space to select. Return to submit'
  });

  if (!response.selection) {
    response.selection = [];
  }

  if ((Object.keys(argv).length === 1 && argv._.length === 0) || argv.p) {
    printAll(response.selection);
  } else if (Object.keys(argv).length === 1 && argv._.length > 0) {
    executeAll(response.selection);
  }
};

module.exports = {
  main
};
