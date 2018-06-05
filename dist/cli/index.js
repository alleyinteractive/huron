!function(e){var t={};function n(o){if(t[o])return t[o].exports;var s=t[o]={i:o,l:!1,exports:{}};return e[o].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="../",n(n.s=30)}([function(e,t){e.exports=require("path")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.normalizeSectionData=function(e){const t=e.data||e;t.referenceURI&&""!==t.referenceURI||(t.referenceURI=e.referenceURI());return t},t.writeSectionData=function(e,t,n=!1){let s,l=n;!l&&{}.hasOwnProperty.call(t,"kssPath")&&(s=o.default.parse(t.kssPath),l=o.default.join(s.dir,`${s.name}.json`));if(l)return c(t.referenceURI,"section",l,JSON.stringify(t),e);return console.warn(r.default.red(`Failed to write data for ${t.referenceURI}`)),!1},t.getTemplateDataPair=function(e,t,n){const s=n.get("config"),r=d(e.dir,s);if(r){const l=o.default.relative(o.default.resolve(a,r),e.dir),u=".json"===e.ext?"template":"data",c=".json"===e.ext?s.get("templates").extension:".json",d=o.default.join(l,i(t.referenceURI,u,c,n));return`./${d}`}return!1},t.normalizeHeader=function(e){return e.toLowerCase().replace(/\s?\W\s?/g,"-")},t.wrapMarkup=u,t.generateFilename=i,t.writeFile=c,t.removeFile=function(e,t,n,l){const u=l.get("config"),c=o.default.parse(n),f=i(e,t,c.ext,l),p=d(n,u);if(p){const e=o.default.relative(o.default.resolve(a,p),c.dir),t=o.default.join(u.get("output"),e,`${f}`),n=o.default.resolve(a,u.get("root"),t);try{s.default.removeSync(n),console.log(r.default.green(`Removing ${t}`))}catch(e){console.log(r.default.red(`${t} does not exist or cannot be deleted`))}return`./${t.replace(`${u.get("output")}/`,"")}`}return!1},t.writeSectionTemplate=function(e,t){const n=t.get("config"),l=u(s.default.readFileSync(e,"utf8")),i=o.default.join(a,n.get("root"),"./huron-assets/section.hbs");return s.default.outputFileSync(i,l),console.log(r.default.green(`writing section template to ${i}`)),t.set("sectionTemplatePath","./huron-assets/section.hbs")},t.getSection=function(e,t,n){const o=n.getIn(["sections","sectionsByPath"]).valueSeq();let s=!1;s=t?o.filter(n=>n[t]===e).get(0):n.getIn(["sections","sectionsByPath",e]);return s},t.matchKssDir=d,t.getClassnamesFromJSON=function(e){let t={};if(".json"===o.default.parse(e).ext)try{const n=s.default.readFileSync(e,"utf8");t=JSON.parse(n)}catch(e){console.warn(r.default.red(e))}return t},t.removeTrailingSlash=function(e){if("/"===e.slice(-1))return e.slice(0,-1);return e};var o=l(n(0)),s=l(n(2)),r=l(n(3));function l(e){return e&&e.__esModule?e:{default:e}}const a=process.cwd();function u(e,t){return`<dom-module>\n<template id="${t}">\n${e}\n</template>\n</dom-module>\n`}function i(e,t,n,o){const s=o.get("types"),r=".scss"!==n?n:".html";return-1===s.indexOf(t)?(console.log(`Huron data ${t} does not exist`),!1):`${e}-${t}${r}`}function c(e,t,n,l,c){const f=c.get("config"),p=o.default.parse(n),m=i(e,t,p.ext,c),h=d(n,f);if(h){const n=o.default.relative(o.default.resolve(a,h),p.dir),i=o.default.join(f.get("output"),n,`${m}`),c=o.default.resolve(a,f.get("root"),i);let d=l;"data"!==t&&"section"!==t&&(d=u(l,e));try{s.default.outputFileSync(c,d),console.log(r.default.green(`Writing ${i}`))}catch(e){console.log(r.default.red(`Failed to write ${i}`))}return`./${i.replace(`${f.get("output")}/`,"")}`}return!1}function d(e,t){const n=t.get("kss").filter(t=>e.includes(`/${t}`));return!!n.length&&n[0]}},function(e,t){e.exports=require("fs-extra")},function(e,t){e.exports=require("chalk")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=r(n(22)),s=r(n(0));function r(e){return e&&e.__esModule?e:{default:e}}!function(){const e={};process.argv=process.argv.filter(t=>{if(-1!==t.indexOf("--env")){const n=t.split(".")[1].split("=");return e[n[0]]=n[1]||!0,!1}return!0}),o.default.version("1.0.1").option("-c, --huron-config [huronConfig]","[huronConfig] for all huron options",s.default.resolve(__dirname,"../defaultConfig/huron.config.js")).option("-w, --webpack-config [webpackConfig]","[webpackConfig] for all webpack options",s.default.resolve(__dirname,"../defaultConfig/webpack.config.js")).option("-p, --production","compile assets once for production"),o.default.env=e,process.env.npm_lifecycle_event&&"test"===process.env.npm_lifecycle_event||o.default.parse(process.argv)}(),t.default=o.default},function(e,t){e.exports=require("webpack")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.config=t.defaultStore=void 0;var o,s=n(17),r=n(16),l=(o=r)&&o.__esModule?o:{default:o},a=n(1);const u=(0,l.default)();u.huron.kss=[].concat(u.huron.kss);const i=(0,s.Map)({types:["template","data","description","section","prototype","sections-template"],config:(0,s.Map)(u.huron),classNames:(0,a.getClassnamesFromJSON)(u.huron.classNames),sections:(0,s.Map)({sectionsByPath:(0,s.Map)({}),sectionsByURI:(0,s.Map)({}),sorted:{}}),templates:(0,s.Map)({}),prototypes:(0,s.Map)({}),sectionTemplatePath:"",referenceDelimiter:"."});t.defaultStore=i,t.config=u},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.writeStore=t.requireTemplates=void 0;var o=l(n(0)),s=l(n(2)),r=l(n(23));function l(e){return e&&e.__esModule?e:{default:e}}const a=process.cwd(),u=s.default.readFileSync(o.default.join(__dirname,"../web/index.js"),"utf8");t.requireTemplates=function(e){const t=e.get("config"),n=o.default.join(a,t.get("root"),"huron-assets"),l={sectionTemplatePath:`'${t.get("sectionTemplate")}'`,requireRegex:new RegExp(`\\.html|\\.json|\\${t.get("templates").extension}$`),requirePath:`'../${t.get("output")}'`},i=Object.keys(l).reduce((e,t)=>e.replace(new RegExp(`hotScope.${t}`,"g"),l[t]),r.default);s.default.outputFileSync(o.default.join(n,"index.js"),i),s.default.outputFileSync(o.default.join(n,"insertNodes.js"),u)},t.writeStore=function(e,t=!1){const n=t||e,r=n.get("config"),l=o.default.join(a,r.get("root"),"huron-assets");s.default.outputFileSync(o.default.join(l,"huron-store.js"),`module.exports = ${JSON.stringify(n.toJSON())}`)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.updateTemplate=function(e,t,n){const a=o.default.parse(e),u=l.getTemplateDataPair(a,t,n),i=".json"===a.ext?"data":"template",c=t,d=n;let f=!1;try{f=s.default.readFileSync(e,"utf8")}catch(t){console.log(r.default.red(`${e} does not exist`))}if(f){const t=l.writeFile(c.referenceURI,i,e,f,d);return c[`${i}Path`]=t,"template"===i&&(c.templateContent=f,c.sectionPath=l.writeSectionData(d,c)),d.setIn(["templates",t],u).setIn(["sections","sectionsByPath",c.kssPath],c).setIn(["sections","sectionsByURI",c.referenceURI],c)}return d},t.deleteTemplate=function(e,t,n){const s=".json"===o.default.parse(e).ext?"data":"template",r=t,a=n,u=l.removeFile(r.referenceURI,s,e,a);return delete r[`${s}Path`],a.deleteIn(["templates",u]).setIn(["sections","sectionsByPath",r.kssPath],r).setIn(["sections","sectionsByURI",r.referenceURI],r)};var o=a(n(0)),s=a(n(2)),r=a(n(3)),l=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(n(1));function a(e){return e&&e.__esModule?e:{default:e}}},function(e,t){e.exports=require("gaze")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.watchedFiles=t.extensions=void 0;var o,s=n(9),r=n(0),l=(o=r)&&o.__esModule?o:{default:o},a=n(1);const u=n(6).defaultStore.get("config"),i=t.extensions=[u.get("kssExtension"),u.get("templates").extension,"html","json"].map(e=>e.replace(".","")),c=t.watchedFiles=[];c.push(l.default.resolve(u.get("sectionTemplate"))),u.get("classNames")&&c.push(l.default.resolve(u.get("classNames"))),u.get("kss").forEach(e=>{c.push(`${(0,a.removeTrailingSlash)(e)}/**/*.+(${i.join("|")})`)});const d=new s.Gaze(c);t.default=d},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o,s=n(0),r=(o=s)&&o.__esModule?o:{default:o};t.default={css:[],entry:"huron",js:[],kss:"css/",kssExtension:".css",kssOptions:{multiline:!0,markdown:!0,custom:["data"]},output:"partials",port:8080,prototypes:["index"],root:"dist/",sectionTemplate:r.default.join(__dirname,"../../templates/section.hbs"),classNames:!1,templates:{rule:{test:/\.(hbs|handlebars)$/,use:"handlebars-loader"},extension:".hbs"},window:{}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=l(n(5)),s=l(n(0)),r=l(n(4));function l(e){return e&&e.__esModule?e:{default:e}}t.default=(({root:e,output:t})=>({mode:"development",entry:{},output:{path:s.default.join(process.cwd(),e),publicPath:r.default.production?"":`/${e}`,filename:"[name].js",chunkFilename:"[name].chunk.min.js"},optimization:{namedModules:!0},plugins:[new o.default.HotModuleReplacementPlugin],resolve:{modulesDirectories:[s.default.resolve(__dirname,"../src/js")]},resolveLoader:{modulesDirectories:["web_loaders","web_modules","node_loaders","node_modules",s.default.resolve(__dirname,"../node_modules")]},module:{rules:[{test:/\.html$/,include:[s.default.join(process.cwd(),e,t)],use:"html-loader"},{test:/\.(hbs|handlebars)$/,include:[s.default.join(process.cwd(),e,"huron-assets")],use:{loader:"handlebars-loader",query:{helperDirs:[s.default.join(__dirname,"../../","templates/handlebarsHelpers")]}}}]}}))},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return require(e)}},function(e,t){e.exports=require("html-webpack-plugin")},function(e,t){e.exports=require("url")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){let e=h,t=g;"function"==typeof e&&(e=e(u.default.env));"function"==typeof t&&(t=t(u.default.env));return t=Object.assign({},d.default,t),m=(0,c.default)(t),e.output=Object.assign({},m.output,e.output),e.output.path=m.output.path,e.output.publicPath=m.output.publicPath,e=function(e,t){const n=t;return n.plugins=t.plugins||[],u.default.production||(n.plugins&&n.plugins.length&&(n.plugins=n.plugins.filter(e=>"HotModuleReplacementPlugin"!==e.constructor.name&&"NamedModulesPlugin"!==e.constructor.name)),n.plugins=n.plugins.concat([new l.default.HotModuleReplacementPlugin,new l.default.NamedModulesPlugin])),n}(0,e=function({entry:e,root:t,port:n},s){const r=s.entry[e],l=u.default.production?[]:[`webpack-dev-server/client/index.js?http://localhost:${n}/`,"webpack/hot/dev-server"];return Object.assign({},s,{entry:{[e]:Array.prototype.concat(l,o.default.join(p,t,"huron-assets/index"),r)}})}(t,e)),e=function(e,t){const n=e.templates.rule||{},s=t;return n.include=[o.default.join(p,e.root,e.output)],s.module=s.module||{},s.module.rules=s.module.rules||s.module.loaders||[],s.module.rules=m.module.rules.concat(s.module.rules,n),s}(t,e),delete(e=function(e,t){const n=r.default.readFileSync(o.default.join(__dirname,"../../templates/prototypeTemplate.hbs"),"utf8"),s={title:"Huron",window:e.window,js:[],css:[],filename:"index.html",template:o.default.join(p,e.root,"huron-assets/prototypeTemplate.hbs"),chunks:[e.entry]},l=t;return r.default.outputFileSync(o.default.join(p,e.root,"huron-assets/prototypeTemplate.hbs"),n),e.prototypes.forEach(t=>{const n=t;let o={};"string"==typeof t?o=Object.assign({},s,{title:t,filename:`${t}.html`}):"object"==typeof t&&{}.hasOwnProperty.call(t,"title")&&(t.filename||(n.filename=`${t.title}.html`),t.css&&(n.css=y(t.css,"css",e)),t.js&&(n.js=y(t.js,"js",e)),o=Object.assign({},s,n)),e.css.length&&(o.css=o.css.concat(y(e.css,"css",e))),e.js.length&&(o.js=o.js.concat(y(e.js,"js",e))),Object.keys(o).length&&l.plugins.push(new a.default(o))}),l}(t,e)).devServer,{huron:t,webpack:e}};var o=f(n(0)),s=f(n(15)),r=f(n(2)),l=f(n(5)),a=f(n(14)),u=f(n(4)),i=f(n(13)),c=f(n(12)),d=f(n(11));function f(e){return e&&e.__esModule?e:{default:e}}const p=process.cwd();let m=!1;const h=(0,i.default)(o.default.resolve(u.default.webpackConfig)),g=(0,i.default)(o.default.resolve(u.default.huronConfig));function y(e,t="",n){const l=[];return[].concat(e).forEach(e=>{const a=o.default.parse(e),u=s.default.parse(e),i=o.default.join(p,e),c=o.default.resolve(p,n.root,t,a.base),d=o.default.join(t,a.base);let f=!1;if(o.default.isAbsolute(e)||u.protocol)l.push(e);else{try{f=r.default.readFileSync(i)}catch(e){console.warn(`could not read ${i}`)}f&&(r.default.outputFileSync(c,f),l.push(d))}}),l}},function(e,t){e.exports=require("immutable")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=(e=>({hot:!0,host:"localhost",quiet:!1,noInfo:!1,overlay:!0,stats:{colors:!0,hash:!1,version:!1,assets:!1,chunks:!1,modules:!1,reasons:!1,children:!1,source:!1},publicPath:`/${e.root}`}))},function(e,t){e.exports=require("opn")},function(e,t){e.exports=require("webpack-dev-server")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){const{huron:t,webpack:n}=e,c=(0,o.default)(n);u.default.progress&&c.apply(new o.default.ProgressPlugin((e,t)=>{console.log(`${100*e}% `,t)}));if(u.default.production)c.run((e,t)=>{const n=t.toJson();e&&console.log(e),t.hasErrors()&&console.error(r.default.red("Webpack encountered errors during compile: ",n.errors)),t.hasWarnings()&&console.error(r.default.yellow("Webpack encountered warnings during compile: ",n.warnings))});else{const e=new s.default(c,(0,a.default)(t)),n=t.prototypes[0].title||t.prototypes[0];e.listen(t.port,"localhost",e=>e?console.log(e):(console.log(`Listening at http://localhost:${t.port}/`),(0,l.default)(`http://localhost:${t.port}/${(0,i.removeTrailingSlash)(t.root)}/${n}.html`),!0))}};var o=c(n(5)),s=c(n(20)),r=c(n(3)),l=c(n(19)),a=c(n(18)),u=c(n(4)),i=n(1);function c(e){return e&&e.__esModule?e:{default:e}}},function(e,t){e.exports=require("commander")},function(e,t){e.exports="'use strict';\n\nvar _huronStore = require('./huron-store');\n\nvar _huronStore2 = _interopRequireDefault(_huronStore);\n\nvar _insertNodes = require('./insertNodes');\n\nvar _insertNodes2 = _interopRequireDefault(_insertNodes);\n\nvar _section = require('./section.hbs');\n\nvar _section2 = _interopRequireDefault(_section);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/* eslint-enable */\n\nconst assets = require.context(hotScope.requirePath, true, hotScope.requireRegex); /* globals hotScope */\n\n// NOTE: This is not a normal JS file! It is pulled in by the CLI as a string\n// and prepended to the browser script after replacing anything referenced via `hotScope[variable]`\n// with CLI arguments or config properties passed in by the user.\n\n/* eslint-disable */\n\nconst modules = {};\n\nmodules[hotScope.sectionTemplatePath] = _section2.default;\n\nassets.keys().forEach(key => {\n  modules[key] = assets(key);\n});\n\nconst insert = new _insertNodes2.default(modules, _huronStore2.default);\n\nif (module.hot) {\n  // Hot Module Replacement for huron components (json, hbs, html)\n  module.hot.accept(assets.id, () => {\n    const newAssets = require.context(hotScope.requirePath, true, hotScope.requireRegex);\n    const newModules = newAssets.keys().map(key => [key, newAssets(key)]).filter(newModule => modules[newModule[0]] !== newModule[1]);\n\n    updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved\n    newModules.forEach(module => {\n      modules[module[0]] = module[1]; // eslint-disable-line prefer-destructuring\n      hotReplace(module[0], module[1], modules);\n    });\n  });\n\n  // Hot Module Replacement for sections template\n  module.hot.accept('./section.hbs', () => {\n    const newSectionTemplate = require('./section.hbs'); // eslint-disable-line global-require, import/no-unresolved\n\n    modules[hotScope.sectionTemplatePath] = newSectionTemplate;\n    hotReplace('./huron-assets/section.hbs', newSectionTemplate, modules);\n  });\n\n  // Hot Module Replacement for data store\n  module.hot.accept('./huron-store.js', () => {\n    updateStore(require('./huron-store.js')); // eslint-disable-line global-require, import/no-unresolved\n  });\n}\n\nfunction hotReplace(key, module, newModules) {\n  insert.modules = newModules;\n  if (key === _huronStore2.default.sectionTemplatePath) {\n    insert.cycleSections();\n  } else {\n    insert.inserted = [];\n    insert.loadModule(key, module, false);\n  }\n}\n\nfunction updateStore(newStore) {\n  insert.store = newStore;\n}"},function(e,t){e.exports=require("kss")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.updateKSS=function(e,t){const n=s.default.readFileSync(e,"utf8"),c=t.get("config"),m=a.getSection(e,!1,t)||{},h=o.default.parse(e);let g=t;if(n){const t=(0,r.parse)(n,c.get("kssOptions"));if(t.data.sections.length){const n=a.normalizeSectionData(t.data.sections[0]);return n.reference&&n.referenceURI?(g=function(e,t,n,s){const r=o.default.parse(e),l=o.default.join(r.dir,`${r.name}.json`),i=null!==t.markup.match(/<\/[^>]*>/),c=function e(t,n,o){const s=n.split(o);const r=t[s[0]]||{};const l=t;if(1<s.length){const t=s.filter((e,t)=>0!==t);l[s[0]]=e(r,t.join(o),o)}else l[s[0]]=r;return l}(s.getIn(["sections","sorted"]),t.reference,s.get("referenceDelimiter")),d=Object.assign({},n,t);let f=s;d.kssPath=e,i?f=function(e,t,n,o){const s=n,r=o;if(p(t,n,"markup"))return s.templatePath=a.writeFile(n.referenceURI,"template",e,n.markup,o),s.templateContent=n.markup,r.setIn(["sections","sectionsByPath",e],s).setIn(["sections","sectionsByURI",n.referenceURI],s);return r}(e,n,d,f):(a.removeFile(d.referenceURI,"template",e,s),f=function(e,t,n,s){const r=o.default.format(e),l=n;let a="",i="",c=s;return["data","markup"].forEach(n=>{l[n]?(t[n]&&(i=o.default.join(e.dir,t[n]),c=(0,u.deleteTemplate)(i,t,c)),a=o.default.join(e.dir,l[n]),c=(0,u.updateTemplate)(a,l,c)):(delete l[n],c=c.setIn(["sections","sectionsByPath",r],l).setIn(["sections","sectionsByURI",l.referenceURI],l))}),c}(r,n,d,f));return f=function(e,t,n,o){const s=n,r=o;return p(t,n,"description")?(s.descriptionPath=a.writeFile(n.referenceURI,"description",e,n.description,o),r.setIn(["sections","sectionsByPath",e],s).setIn(["sections","sectionsByURI",n.referenceURI],s)):r}(e,n,d,f),d.sectionPath=a.writeSectionData(f,d,l),f.setIn(["sections","sorted"],c).setIn(["sections","sectionsByPath",e],d).setIn(["sections","sectionsByURI",t.referenceURI],d)}(e,n,m,g),m&&m.referenceURI&&m.referenceURI!==n.referenceURI&&(g=f(m,h,g,!1)),(0,i.writeStore)(g),console.log(l.default.green(`KSS source in ${e} changed or added`)),g):(console.log(l.default.magenta(`KSS section in ${e} is missing a section reference`)),g)}return console.log(l.default.magenta(`No KSS found in ${e}`)),g}m&&(g=d(e,m,g));return console.log(l.default.red(`${e} not found or empty`)),g},t.deleteKSS=d;var o=c(n(0)),s=c(n(2)),r=n(24),l=c(n(3)),a=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(n(1)),u=n(8),i=n(7);function c(e){return e&&e.__esModule?e:{default:e}}function d(e,t,n){const s=o.default.parse(e);return t.reference&&t.referenceURI?f(t,s,n,!0):n}function f(e,t,n,s){const r=n.getIn(["sections","sorted"]),l=o.default.format(t),u=o.default.join(t.dir,`${t.name}.json`),i=e.markup&&null!==e.markup.match(/<\/[^>]*>/),c=function e(t,n,o){const s=n.split(o);const r=Object.keys(t[s[0]]);const l=t;if(r.length){if(1<s.length){const t=s.filter((e,t)=>0!==t);l[s[0]]=e(l[s[0]],t.join(o),o)}}else delete l[s[0]];return l}(r,e.reference,n.get("referenceDelimiter"));let d=n;return a.removeFile(e.referenceURI,"section",u,d),i&&a.removeFile(e.referenceURI,"template",l,d),a.removeFile(e.referenceURI,"description",l,d),s&&(d=d.deleteIn(["sections","sectionsByPath",l])),d.deleteIn(["sections","sectionsByURI",e.referenceURI]).setIn(["sections","sorted"],c)}function p(e,t,n){return e&&(e[n]!==t[n]||e.referenceURI!==t.referenceURI)||!e}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.updateHTML=function(e,t,n){const l=o.default.parse(e),a=s.default.readFileSync(e,"utf8"),u=t;if(a)return u.templatePath=r.writeFile(t.referenceURI,"template",e,a,n),u.templateContent=a,u.sectionPath=r.writeSectionData(n,u),n.setIn(["sections","sectionsByPath",t.kssPath],u).setIn(["sections","sectionsByURI",t.referenceURI],u);return console.log(`File ${l.base} could not be read`),n},t.deleteHTML=function(e,t,n){const o=t;return r.removeFile(o.referenceURI,"template",e,n),delete o.templatePath,n.setIn(["sections","sectionsByPath",t.kssPath],o).setIn(["sections","sectionsByURI",t.referenceURI],o)},t.updatePrototype=function(e,t){const n=o.default.parse(e),l=s.default.readFileSync(e,"utf8");if(l){const o=r.writeFile(n.name,"prototype",e,l,t);return t.setIn(["prototypes",n.name],o)}return console.log(`File ${n.base} could not be read`),t},t.deletePrototype=function(e,t){const n=o.default.parse(e),s=r.removeFile(n.name,"prototype",e,t);return t.setIn(["prototypes",n.name],s)};var o=l(n(0)),s=l(n(2)),r=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(n(1));function l(e){return e&&e.__esModule?e:{default:e}}},function(e,t){e.exports=require("lodash/isEqual")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.initFiles=function e(t,n,s=0){const r=Object.prototype.toString.call(t);const l=n.get("config");let a=n;let u;let i;switch(r){case"[object Object]":i=Object.keys(t),a=i.reduce((n,o)=>e(t[o],n,s),a);break;case"[object Array]":a=t.reduce((t,n)=>e(n,t,s),a);break;case"[object String]":(u=o.default.parse(t)).ext&&!t.includes(l.get("classNames"))&&(a=d(t,n))}return a},t.updateFile=d,t.deleteFile=function(e,t){const n=t.get("config"),r=o.default.parse(e);let c="",d=null,f=t;switch(r.ext){case".html":(d=i.getSection(r.base,"markup",t))?f=(0,l.deleteHTML)(e,d,t):r.dir.includes("prototypes")&&r.name.includes("prototype-")&&(f=(0,l.deletePrototype)(e,t));break;case n.get("templates").extension:case".json":c=".json"===r.ext?"data":"markup",(d=i.getSection(r.base,c,t))&&(f=(0,a.deleteTemplate)(e,d,t));break;case n.get("kssExtension"):(d=i.getSection(e,!1,t))&&(f=(0,u.deleteKSS)(e,d,t));break;default:console.warn(s.default.red(`Could not delete: ${r.name}`))}return f},t.updateClassNames=function(e,t){const n=t.getIn(["config","classNames"]);if(e.includes(n)){const e=t.get("classNames"),o=i.getClassnamesFromJSON(n);if(!(0,r.default)(e,o))return t.set("classNames",o)}return t};var o=c(n(0)),s=c(n(3)),r=c(n(27)),l=n(26),a=n(8),u=n(25),i=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(n(1));function c(e){return e&&e.__esModule?e:{default:e}}function d(e,t){const n=t.get("config"),r=o.default.parse(e);let c,d;if(e.includes(n.get("sectionTemplate")))return i.writeSectionTemplate(e,t);switch(r.ext){case".html":if(d=i.getSection(r.base,"markup",t))return(0,l.updateHTML)(e,d,t);if(r.dir.includes("prototypes")&&r.name.includes("prototype-"))return(0,l.updatePrototype)(e,t);console.log(s.default.red(`Failed to write file: ${r.name}`));break;case n.get("templates").extension:case".json":if(c=".json"===r.ext?"data":"markup",d=i.getSection(r.base,c,t))return(0,a.updateTemplate)(e,d,t);console.log(s.default.red(`Failed to find KSS section for ${e}`));break;case n.get("kssExtension"):return(0,u.updateKSS)(e,t);default:return t}return t}},function(e,t,n){"use strict";var o=d(n(3)),s=n(28),r=n(7),l=n(1),a=d(n(4)),u=d(n(21)),i=n(6),c=d(n(10));function d(e){return e&&e.__esModule?e:{default:e}}const f=i.defaultStore.get("config");let p=(0,s.initFiles)(c.default.watched(),i.defaultStore);(0,r.requireTemplates)(p),(0,r.writeStore)(p),a.default.production&&c.default.close(),c.default.on("all",(e,t)=>{p=(0,s.updateClassNames)(t,p),(0,r.writeStore)(p)}),c.default.on("changed",e=>{(0,l.matchKssDir)(e,f)&&(p=(0,s.updateFile)(e,p)),console.log(o.default.green(`${e} updated!`))}),c.default.on("added",e=>{(0,l.matchKssDir)(e,f)&&(p=(0,s.updateFile)(e,p),(0,r.writeStore)(p)),console.log(o.default.blue(`${e} added!`))}),c.default.on("renamed",(e,t)=>{(0,l.matchKssDir)(e,f)&&(p=(0,s.deleteFile)(t,p),p=(0,s.updateFile)(e,p),(0,r.writeStore)(p)),console.log(o.default.blue(`${e} added!`))}),c.default.on("deleted",e=>{(0,l.matchKssDir)(e,f)&&(p=(0,s.deleteFile)(e,p),(0,r.writeStore)(p)),console.log(o.default.red(`${e} deleted`))}),(0,u.default)(i.config)},function(e,t,n){e.exports=n(29)}]);
//# sourceMappingURL=index.js.map