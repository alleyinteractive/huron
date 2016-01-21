/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a <div> using a class corresponding to the filename of the html import you wish
 * to insert.
 */

require('../../prototype/index.html');

class InsertNodes {

	constructor(links, context) {
		this.links = links;
		this.context = context;

		// Inits
		this.loopLinks();
		this.insertScripts();
	}

	loopLinks() {
		// Loop through html import <link> elements
		for (let i = 0; i < this.links.length; i++) {
			// Grab the link contents and the href for insertion
			var linkNode = this.links.item(i),
				template = linkNode.import,
				href = linkNode.attributes.getNamedItem('href'),
				target = this.getTarget(href);

			this.replaceTarget(template, target);
		};
	}

	replaceTarget(template, target) {
		var contents, contentBody, childLinks;

		// Check if we have both imported html and a target
		if (null !== template && null !== target) {
			// Find all the html imports in the partial
			childLinks = template.querySelectorAll('link[rel="import"]');
			contentBody = template.body;
			contents = template.body.children;

			// Recursively instantiate InsertNodes() for child templates
			if (childLinks.length) {
				new InsertNodes(childLinks, contentBody);
			}

			// Loop through each target and replace with the html import
			for (let i = 0; i < target.length; i++) {
				var currentTarget = target.item(i);

				// Make sure this is intended to be a partial insertion point by checking the 'partial' attribute
				if ('undefined' !== typeof currentTarget.attributes.partial) {

					// Loop through contents of template
					for (var j = 0; j < contents.length; j++) {
						var childNode = contents.item(j),
							clone = childNode.cloneNode(true);

						// Add in contents
						currentTarget.parentElement.insertBefore(clone, currentTarget);
					}

					// Remove target node as it is no longer needed
					currentTarget.parentElement.removeChild(currentTarget);
				}
			};
		}
	}

	getTarget(href) {
		var targetId, target;

		// Convert href into a class string
		if ('undefined' !== href) {
			targetId = href.nodeValue
				.replace(/^.*[\\\/]/, '')
				.replace('.html', '');

			// Search for replaceable targets (divs with a class corresponding to an html import filename)
			target = this.context.querySelectorAll('.' + targetId);

			return target;
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
