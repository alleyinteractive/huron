#!/usr/bin/env node

// Requires
var fs = require('fs'),
	path = require('path'),
	kss = require('kss'),
	connect = require('connect'),
	serveStatic = require('serve-static'),
	jsdom = require('jsdom');

// Vars
var directory = '',
	destination = path.join(__dirname, '../', 'partials/generated'),
	serveRoot = path.join(__dirname, '../'),
	options = {};

process.argv.forEach(function(value, idx){
	var ksspath, destpath, servpath;

	// Location of KSS documentation to parse
	if ( value.indexOf('kss-source') >= 0 ) {
		kssPath = value.replace('--kss-source=', '');
		directory = path.join(__dirname, '../', kssPath);
	}

	// Output destination for partials
	if ( value.indexOf('destination') >= 0 ) {
		destPath = value.replace('--destination=', '');
		destination = path.join(__dirname, '../', destPath);
	}

	// Root directory for server
	if ( value.indexOf('serve-root') >= 0 ) {
		servePath = value.replace('--serve-root=', '');
		serveRoot = path.join(__dirname, '../../', servePath);
	}
})

// Start connect server
startServer();

// Parse KSS and insert into an HTML partial
kss.traverse(directory, options, function(err, styleguide) {
	// Loop through sections
	styleguide.data.sections.forEach(function(section, idx) {
		var sectionData = styleguide.section(section.data.reference);
		if ('undefined' !== typeof sectionData.data && 'undefined' !== section.data.markup) {
			var partialHeader = normalizeHeader(sectionData.header()),
				filename = '',
				htmlOutput = '',
				inserts;

			// Check if we have markup
			if ('string' === typeof section.data.markup) {
				var tempOutput = writeMarkup(section.data.markup, styleguide, partialHeader);
			}
		}
	});
});

// Make sure we have a normalized string for filename
function normalizeHeader(header) {
	return header
		.toLowerCase()
		.replace(/\s?\W\s?/g, '-');
}

// Parse the section markup
function writeMarkup(markup, styleguide, partialHeader) {
	// Create filename string
	var filename = destination + '/' + partialHeader + '.html',
		htmlOutput = '',
		linkList = [];

	// Use jsdom to parse section html
	jsdom.env({
		html: markup,
		done: function(err, window) {
			if (err) throw err;

			var doc = window.document,
				inserts = doc.getElementsByTagName('sg-insert'),
				skip = doc.querySelectorAll('[proto-skip]'),
				ignore = doc.querySelectorAll('[proto-ignore]');

			// Find sg-insert elements, replace with prototype insert, add a corresponding html import <link>
			if (!ignore.length) {
				if (inserts.length) {
					for (var i = 0; i < inserts.length; i++) {
						var insert = inserts.item(i),
							pathOverride = insert.parentElement.attributes.path,
							section = styleguide.section(insert.textContent),
							subsectionName = normalizeHeader(section.header()),
							reference = doc.createElement('div'),
							link = doc.createElement('link');

						// Create partial insert point
						reference.className = subsectionName;
						reference.setAttribute('partial', '');

						// Create link element for html import
						link.rel = 'import';

						// Create link href, checking if there is a path override in the styleguide
						link.href = '';
						if ( 'undefined' !== typeof pathOverride ) {
							link.href += pathOverride.nodeValue + '/';
						}
						link.href += subsectionName + '.html';

						// Replace sg-insert with parital insert reference
						insert.parentElement.replaceChild(reference, insert);

						// If link element hasn't been inserted yet, insert it!
						if (linkList.indexOf(subsectionName) < 0) {
							doc.body.insertBefore(link, doc.body.children.item(0));
						}

						// Add link name to link list so it's not duplicated in markup
						linkList.push(subsectionName);
					}
				}

				// Remove styleguide-only elements
				if (skip.length) {
					for (var j = 0; j < skip.length; j++) {
						var exclude = skip.item(j);

						exclude.parentElement.removeChild(exclude);
					}
				}

				htmlOutput = doc.body.innerHTML;

				// Write the html
				if ( '' !== doc.body.innerHTML ) {
					console.log('Writing ' + partialHeader + '.html' );
					fs.writeFileSync(filename, htmlOutput, {}, function(err) {
						if (err) throw err;
					});
				}
			}
		}
	});
}

function startServer() {
	// Start server
	connect().use(
		serveStatic(serveRoot)
	).listen(8080);
	console.log('Serving from localhost:8080...');
}