# Browser (front-end) script

This directory contains the source code for the Huron browser script, used to insert or replace markup in the DOM at the location of Huron placeholder tags. This script is also used to handle the implementation of HMR for replacing that markup when some aspect of it has changed. This HMR functionality will be triggered from changes to:
* Templates (HTML or Handlebars)
* Template data (JSON)
* KSS source (CSS). NOTE: Some KSS fields may cause problems with HMR, most notably the styleguide section reference. This part of Huron is actively under refinement. Changes to the KSS `description`, `header`/`title` or in-line markup should work just fine, however.

Further documentation on the InsertNodes class, which contains all this logic, is provided via jsdoc. See the [CLI](src/cli/README.md) readme