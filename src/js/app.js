'use strict';

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a <div> using a class corresponding to the filename of the html import you wish
 * to insert.
 */

class InsertNodes {

	constructor(links, context) {
		this.links = links;
		this.context = context;

		// Inits
		this.loopLinks();
		this.insertScripts();
	}

	loopLinks() {
		var targetList = [];

		// Loop through html import <link> elements
		for (let i = 0; i < this.links.length; i++) {
			// Grab the link contents and the href for insertion
			var linkNode = this.links.item(i),
				template = linkNode.import,
				href = linkNode.attributes.getNamedItem('href'),
				targetID = this.getTargetID(href);

			if (-1 === targetList.indexOf(targetID)) {
				targetList.push(targetID);
				this.buildCustomElement(template, targetID);
			}
		};
	}

	buildCustomElement(template, targetID) {
		let elProto = Object.create(HTMLElement.prototype),
			t = template;

		elProto.createdCallback = function() {
			this.innerHTML = template.getElementById(targetID).innerHTML;
		}

		document.registerElement(targetID, {prototype: elProto});
	}

	getTargetID(href) {
		var targetID;

		// Convert href into a class string
		if ('undefined' !== href) {
			targetID = href.nodeValue
				.replace(/^.*[\\\/]/, '')
				.replace('.html', '');

			return targetID;
		}

		return false;
	}

	insertScripts() {
		if (document === this.context && 'undefined' !== window.protoScripts && window.protoScripts.length) {
			var scriptArray = protoScripts,
				bodyNodes = document.body.children;

			scriptArray.forEach((value) => {
				var scriptTag = document.createElement('script');

				scriptTag.type = 'text/javascript';
				scriptTag.src = value;

				document.body.insertBefore(scriptTag, bodyNodes[bodyNodes.length - 1]);
			});
		}
	}
}

// Top level insert
var initLinks = document.querySelectorAll('link[rel="import"]');
new InsertNodes(initLinks, document);
