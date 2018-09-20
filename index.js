const prompts = require('prompts');
// {
// 	title: ''
// 	value: ''
// }
let response = await prompts(
	{
		type: 'multiselect',
		name: 'osb-modules',
		message: 'Select modules to deploy',
		choices: [
			{ title: 'Red', value: '#ff0000' },
			{ title: 'Green', value: '#00ff00' },
			{ title: 'Blue', value: '#0000ff', selected: true }
		],
		hint: '- Space to select. Return to submit'
	}
)

console.log(response);