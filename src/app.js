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
    --version         : Display current version
    -p                : Print all selected modules
    -f <string>       : Filter searched paths
    -v                : Verbose

    Usage    : fam [customGradleCommand] [task] [task]
    example  : fam runGradle clean deploy

    Calling ${chalk.bold('fam')} by itself will default to ${chalk.bold('-p')}
  `);
  process.exit(0);
}

if (argv.version) {
  shell.echo(`
    ${pkg.version}
  `);
  process.exit(0);
}

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}
const SILENT_OPTS = {silent: true}

const SRC_DIR = shell.exec('pwd', SILENT_OPTS);

/**
 * Return array of directories containing build.gradle file
 */
const getDirectories = () => {

  let results = shell.exec('git ls-files', SILENT_OPTS);

  results = results.grep('build.gradle');

  if (argv.f && typeof argv.f === 'string') {
    results = results.grep(argv.f);
  }

  results = results.exec('xargs -I {} dirname {}', SILENT_OPTS);

  return results.split('\n');
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
const executeAll = response => {
  shell.echo(chalk.yellow(`Executing ${chalk.bold(argv._.join(' '))}`));

  response.map(modulePath => {
    if (modulePath !== '.') {
      shell.cd(modulePath);
      shell.echo(chalk.yellow(`Current target: ${chalk.bold(modulePath)}`));

      const {stderr} = shell.exec(`${argv._.join(' ')}`, {silent: !argv.v});

      if (stderr) {
        process.stderr.write(chalk.red('Encountered an error: ', stderr));
        // process.exit(1);
      } else {
        process.stdout.write(chalk.green(`Done\n`));
      }

      shell.cd(SRC_DIR);
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
    message: `Will attempt to execute ${chalk.bold(argv._.length > 0 ? argv._.join(' '): 'print')} on selection`,
    choices: payload,
    hint: '- Space to select. Return to submit'
  });

  if (!response.selection) {
    response.selection = [];
  }

  if (argv._.length === 0 || argv.p) {
    printAll(response.selection);
  } else {
    executeAll(response.selection);
  }
};

module.exports = {
  main
};
