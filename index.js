#!/usr/bin/env node
/* eslint-disable no-unexpected-multiline */

const term = require('terminal-kit').terminal;
const fs = require('fs');
const beautify_css = require('js-beautify').css;

let termwidthline = '';

for (let i = 0; i < term.width; i++) {
	termwidthline += '━';
}

const start = async () => {
	term.clear();
	term.cyan(termwidthline);
	term.white('Welcome! Where do you want to go?');

	term.singleColumnMenu(['Create new CSS', 'Exit'], function(error, response) {
		if(response.selectedIndex === 0) {
			createNew();
		}
		else if(response.selectedIndex === 1) {
			exit();
		}
	});
};

const exit = async () => {
	term.clear();
	term.white('Exiting...\n');
	process.exit();
};

const createNew = async () => {
	term.clear();
	term.cyan(termwidthline);
	const config = {};
	term.white('What would you like to call this config?\nName: ');
	term.inputField(function(error, input) {
		config.name = input;
		// term.green(JSON.stringify(config));
		// process.exit();

		chooseModules(config);
	});
};

const chooseModules = async (config) => {
	term.clear();
	term.cyan(termwidthline);
	term.white('Select an item to view details and add\n');

	const itemsfiles = fs.readdirSync(__dirname + '/modules').filter(file => file.endsWith('.json'));

	const items = [];

	for (const val of itemsfiles) {
		items.push(val.replace('.json', ''));
	}

	items.push('done');

	term.gridMenu(items, function(error, response) {
		if(response.selectedText === 'done') {
			return review(config);
		}
		else {
			const item = require(`./modules/${response.selectedText}.json`);
			term.clear();
			term.cyan(termwidthline);
			term.white(`Do you want to add this item?\nName: ${item.name}\nDescription: ${item.description}\nY/n`);
			term.yesOrNo({ yes: [ 'y', 'ENTER' ], no: [ 'n' ] }, function(error, result) {

				if (result) {
					if(!config.modules) {
						config.modules = [ item.hardname ];
					}
					else {
						(config.modules).push(item.hardname);
					}
					chooseModules(config);
				}
				else {
					config.modules = config.modules.filter(e => e !== item.hardname);
					chooseModules(config);
				}
			});
		}
	});
};

const review = async (config) => {
	term.clear();
	term.cyan(termwidthline);

	term.white(`Is this how you want your config?\nName: ${config.name}\nModules: ${config.modules}`);

	term.yesOrNo({ yes: [ 'y', 'ENTER' ], no: [ 'n' ] }, function(error, result) {

		if (result) {
			mkConfig(config);
		}
		else {
			chooseModules(config);
		}
	});
};

const mkConfig = async (config) => {
	const modules = config.modules;

	let cssconf = '';

	modules.forEach(element => {
		const module = require(`./modules/${element}.json`);
		cssconf += `${module.css} `;
	});

	term.clear();

	term.white('Done!\n');


	fs.writeFileSync('custom.css', beautify_css(cssconf, { indent_size: 2, space_in_empty_paren: true }), function(err) {
		if (err) return console.log(err);
	});

	process.exit();
};

start();