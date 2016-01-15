/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a <div> using a class corresponding to the filename of the html import you wish
 * to insert.
 */

var initLinks = document.querySelectorAll('link[rel="import"]');

// Top level insert
insertNodes(initLinks, document);

// Recursive function for replacing nodes
function insertNodes(links, context) {
	// Loop through html import <link> elements
	for (var i = 0; i < links.length; i++) {
		// Grab the link contents and the href for insertion
		var linkNode = links.item(i),
			template = links.item(i).import,
			href = linkNode.attributes.getNamedItem('href'),
			contents, contentBody, target, targetId, childLinks;

		// Convert href into a class string
		if ('undefined' !== href) {
			targetId = href.nodeValue
				.replace(/^.*[\\\/]/, '')
				.replace('.html', '');

			// Search for replaceable targets (divs with a class corresponding to an html import filename)
			target = context.querySelectorAll('.' + targetId);
		}

		// Check if we have both imported html and a target
		if (null !== template && null !== target) {
			// Find all the html imports in the partial
			childLinks = template.querySelectorAll('link[rel="import"]');
			contentBody = template.body;
			contents = template.body.children;

			// Recursively call insertNodes() for child templates
			if (childLinks.length) {
				insertNodes(childLinks, contentBody);
			}

			// Loop through each target and replace with the html import
			for (var k = 0; k < target.length; k++) {
				var currentTarget = target.item(k);

				// Make sure this is intended to be a partial insertion point by checking the 'partial' attribute
				if ( 'undefined' !== typeof currentTarget.attributes.partial ) {

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
			}
		}
	}

	if ( document === context && 'undefined' !== window.protoScripts && window.protoScripts.length ) {
		var scriptArray = protoScripts,
			bodyNodes = document.body.children;

		scriptArray.forEach(function(value, id) {
			var scriptTag = document.createElement('script');

			scriptTag.type = 'text/javascript';
			scriptTag.src = value;

			document.body.insertBefore(scriptTag, bodyNodes[bodyNodes.length - 1]);
		});
	}
}
