const prompts = require('prompts');
const shell = require('shelljs');

if (!shell.which('git')) {
	shell.echo('Sorry, this script requires git');
	shell.exit(1);
}

const cwd = shell.exec('pwd')

/**
 * Return array of directories containing build.gradle file
 */
const getDirectories = () => {
	const shellResults = shell.exec('git ls-files | grep build.gradle')

	let osbProjects = [];

	shellResults.stdout.split('\n').map(
		directory => {
			const trimmedDir = directory.substring(0, directory.lastIndexOf("/"));

			if (trimmedDir !== '') {
				osbProjects.push(trimmedDir);
			}
		}
	)

	return osbProjects;
}

/**
 * Accept array of file paths
 * Return array of objects formatted for prompts
 */
const buildPayload = (directories) => {
	let dirName;
	let retVal = [];

	directories.map(directory => {
		dirName = directory.substring(directory.lastIndexOf("/") + 1)

		retVal.push({title: dirName, value: directory})
	})

	return retVal;
}

const main = async () => {
	const directories = getDirectories();
	const payload = buildPayload(directories);

	let response = await prompts(
		{
			type: 'multiselect',
			name: 'osb-modules',
			message: 'Select modules to deploy',
			choices: payload,
			hint: '- Space to select. Return to submit'
		}
	)

	console.log(response);
};

main();