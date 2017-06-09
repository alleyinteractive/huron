/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var chunk = require("./" + "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
/******/ 		try {
/******/ 			var update = require("./" + "" + hotCurrentHash + ".hot-update.json");
/******/ 		} catch(e) {
/******/ 			return Promise.resolve();
/******/ 		}
/******/ 		return Promise.resolve(update);
/******/ 	}
/******/ 	
/******/ 	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "eb7bd4cbb1431bf8aefa"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest().then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate).then(function(result) {
/******/ 				deferred.resolve(result);
/******/ 			}, function(err) {
/******/ 				deferred.reject(err);
/******/ 			});
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					dependency = moduleOutdatedDependencies[i];
/******/ 					cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(i = 0; i < callbacks.length; i++) {
/******/ 					cb = callbacks[i];
/******/ 					try {
/******/ 						cb(moduleOutdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "accept-errored",
/******/ 								moduleId: moduleId,
/******/ 								dependencyId: moduleOutdatedDependencies[i],
/******/ 								error: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err;
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(11)(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/hot/log-apply-result.js":
/* no static exports found */
/* all exports used */
/*!*****************************************!*\
  !*** (webpack)/hot/log-apply-result.js ***!
  \*****************************************/
/***/ (function(module, exports) {

eval("/*\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Tobias Koppers @sokra\r\n*/\r\nmodule.exports = function(updatedModules, renewedModules) {\r\n\tvar unacceptedModules = updatedModules.filter(function(moduleId) {\r\n\t\treturn renewedModules && renewedModules.indexOf(moduleId) < 0;\r\n\t});\r\n\r\n\tif(unacceptedModules.length > 0) {\r\n\t\tconsole.warn(\"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)\");\r\n\t\tunacceptedModules.forEach(function(moduleId) {\r\n\t\t\tconsole.warn(\"[HMR]  - \" + moduleId);\r\n\t\t});\r\n\t}\r\n\r\n\tif(!renewedModules || renewedModules.length === 0) {\r\n\t\tconsole.log(\"[HMR] Nothing hot updated.\");\r\n\t} else {\r\n\t\tconsole.log(\"[HMR] Updated modules:\");\r\n\t\trenewedModules.forEach(function(moduleId) {\r\n\t\t\tconsole.log(\"[HMR]  - \" + moduleId);\r\n\t\t});\r\n\t\tvar numberIds = renewedModules.every(function(moduleId) {\r\n\t\t\treturn typeof moduleId === \"number\";\r\n\t\t});\r\n\t\tif(numberIds)\r\n\t\t\tconsole.log(\"[HMR] Consider using the NamedModulesPlugin for module names.\");\r\n\t}\r\n};\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvd2VicGFjay9ob3QvbG9nLWFwcGx5LXJlc3VsdC5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8od2VicGFjaykvaG90L2xvZy1hcHBseS1yZXN1bHQuanM/ZDc2MiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVwZGF0ZWRNb2R1bGVzLCByZW5ld2VkTW9kdWxlcykge1xyXG5cdHZhciB1bmFjY2VwdGVkTW9kdWxlcyA9IHVwZGF0ZWRNb2R1bGVzLmZpbHRlcihmdW5jdGlvbihtb2R1bGVJZCkge1xyXG5cdFx0cmV0dXJuIHJlbmV3ZWRNb2R1bGVzICYmIHJlbmV3ZWRNb2R1bGVzLmluZGV4T2YobW9kdWxlSWQpIDwgMDtcclxuXHR9KTtcclxuXHJcblx0aWYodW5hY2NlcHRlZE1vZHVsZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gVGhlIGZvbGxvd2luZyBtb2R1bGVzIGNvdWxkbid0IGJlIGhvdCB1cGRhdGVkOiAoVGhleSB3b3VsZCBuZWVkIGEgZnVsbCByZWxvYWQhKVwiKTtcclxuXHRcdHVuYWNjZXB0ZWRNb2R1bGVzLmZvckVhY2goZnVuY3Rpb24obW9kdWxlSWQpIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gIC0gXCIgKyBtb2R1bGVJZCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGlmKCFyZW5ld2VkTW9kdWxlcyB8fCByZW5ld2VkTW9kdWxlcy5sZW5ndGggPT09IDApIHtcclxuXHRcdGNvbnNvbGUubG9nKFwiW0hNUl0gTm90aGluZyBob3QgdXBkYXRlZC5cIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNvbnNvbGUubG9nKFwiW0hNUl0gVXBkYXRlZCBtb2R1bGVzOlwiKTtcclxuXHRcdHJlbmV3ZWRNb2R1bGVzLmZvckVhY2goZnVuY3Rpb24obW9kdWxlSWQpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJbSE1SXSAgLSBcIiArIG1vZHVsZUlkKTtcclxuXHRcdH0pO1xyXG5cdFx0dmFyIG51bWJlcklkcyA9IHJlbmV3ZWRNb2R1bGVzLmV2ZXJ5KGZ1bmN0aW9uKG1vZHVsZUlkKSB7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgbW9kdWxlSWQgPT09IFwibnVtYmVyXCI7XHJcblx0XHR9KTtcclxuXHRcdGlmKG51bWJlcklkcylcclxuXHRcdFx0Y29uc29sZS5sb2coXCJbSE1SXSBDb25zaWRlciB1c2luZyB0aGUgTmFtZWRNb2R1bGVzUGx1Z2luIGZvciBtb2R1bGUgbmFtZXMuXCIpO1xyXG5cdH1cclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2hvdC9sb2ctYXBwbHktcmVzdWx0LmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy93ZWJwYWNrL2hvdC9sb2ctYXBwbHktcmVzdWx0LmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ "./node_modules/webpack/hot/poll.js":
/* no static exports found */
/* all exports used */
/*!*****************************!*\
  !*** (webpack)/hot/poll.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(__resourceQuery) {/*\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Tobias Koppers @sokra\r\n*/\r\n/*globals __resourceQuery */\r\nif(true) {\r\n\tvar hotPollInterval = +(__resourceQuery.substr(1)) || (10 * 60 * 1000);\r\n\r\n\tvar checkForUpdate = function checkForUpdate(fromUpdate) {\r\n\t\tif(module.hot.status() === \"idle\") {\r\n\t\t\tmodule.hot.check(true).then(function(updatedModules) {\r\n\t\t\t\tif(!updatedModules) {\r\n\t\t\t\t\tif(fromUpdate) console.log(\"[HMR] Update applied.\");\r\n\t\t\t\t\treturn;\r\n\t\t\t\t}\r\n\t\t\t\t__webpack_require__(/*! ./log-apply-result */ \"./node_modules/webpack/hot/log-apply-result.js\")(updatedModules, updatedModules);\r\n\t\t\t\tcheckForUpdate(true);\r\n\t\t\t}).catch(function(err) {\r\n\t\t\t\tvar status = module.hot.status();\r\n\t\t\t\tif([\"abort\", \"fail\"].indexOf(status) >= 0) {\r\n\t\t\t\t\tconsole.warn(\"[HMR] Cannot apply update.\");\r\n\t\t\t\t\tconsole.warn(\"[HMR] \" + err.stack || err.message);\r\n\t\t\t\t\tconsole.warn(\"[HMR] You need to restart the application!\");\r\n\t\t\t\t} else {\r\n\t\t\t\t\tconsole.warn(\"[HMR] Update failed: \" + err.stack || err.message);\r\n\t\t\t\t}\r\n\t\t\t});\r\n\t\t}\r\n\t};\r\n\tsetInterval(checkForUpdate, hotPollInterval);\r\n} else {\r\n\tthrow new Error(\"[HMR] Hot Module Replacement is disabled.\");\r\n}\r\n\n/* WEBPACK VAR INJECTION */}.call(exports, \"\"))//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvd2VicGFjay9ob3QvcG9sbC5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8od2VicGFjaykvaG90L3BvbGwuanM/MWI4NyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXHJcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxyXG4qL1xyXG4vKmdsb2JhbHMgX19yZXNvdXJjZVF1ZXJ5ICovXHJcbmlmKG1vZHVsZS5ob3QpIHtcclxuXHR2YXIgaG90UG9sbEludGVydmFsID0gKyhfX3Jlc291cmNlUXVlcnkuc3Vic3RyKDEpKSB8fCAoMTAgKiA2MCAqIDEwMDApO1xyXG5cclxuXHR2YXIgY2hlY2tGb3JVcGRhdGUgPSBmdW5jdGlvbiBjaGVja0ZvclVwZGF0ZShmcm9tVXBkYXRlKSB7XHJcblx0XHRpZihtb2R1bGUuaG90LnN0YXR1cygpID09PSBcImlkbGVcIikge1xyXG5cdFx0XHRtb2R1bGUuaG90LmNoZWNrKHRydWUpLnRoZW4oZnVuY3Rpb24odXBkYXRlZE1vZHVsZXMpIHtcclxuXHRcdFx0XHRpZighdXBkYXRlZE1vZHVsZXMpIHtcclxuXHRcdFx0XHRcdGlmKGZyb21VcGRhdGUpIGNvbnNvbGUubG9nKFwiW0hNUl0gVXBkYXRlIGFwcGxpZWQuXCIpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXF1aXJlKFwiLi9sb2ctYXBwbHktcmVzdWx0XCIpKHVwZGF0ZWRNb2R1bGVzLCB1cGRhdGVkTW9kdWxlcyk7XHJcblx0XHRcdFx0Y2hlY2tGb3JVcGRhdGUodHJ1ZSk7XHJcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG5cdFx0XHRcdHZhciBzdGF0dXMgPSBtb2R1bGUuaG90LnN0YXR1cygpO1xyXG5cdFx0XHRcdGlmKFtcImFib3J0XCIsIFwiZmFpbFwiXS5pbmRleE9mKHN0YXR1cykgPj0gMCkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gQ2Fubm90IGFwcGx5IHVwZGF0ZS5cIik7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSBcIiArIGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXCJbSE1SXSBZb3UgbmVlZCB0byByZXN0YXJ0IHRoZSBhcHBsaWNhdGlvbiFcIik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIltITVJdIFVwZGF0ZSBmYWlsZWQ6IFwiICsgZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0c2V0SW50ZXJ2YWwoY2hlY2tGb3JVcGRhdGUsIGhvdFBvbGxJbnRlcnZhbCk7XHJcbn0gZWxzZSB7XHJcblx0dGhyb3cgbmV3IEVycm9yKFwiW0hNUl0gSG90IE1vZHVsZSBSZXBsYWNlbWVudCBpcyBkaXNhYmxlZC5cIik7XHJcbn1cclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2hvdC9wb2xsLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy93ZWJwYWNrL2hvdC9wb2xsLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }),

/***/ "./src/cli/actions.js":
/* no static exports found */
/* all exports used */
/*!****************************!*\
  !*** ./src/cli/actions.js ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.initFiles = initFiles;\nexports.updateFile = updateFile;\nexports.deleteFile = deleteFile;\n\nvar _handleHtml = __webpack_require__(/*! ./handle-html */ \"./src/cli/handle-html.js\");\n\nvar _handleTemplates = __webpack_require__(/*! ./handle-templates */ \"./src/cli/handle-templates.js\");\n\nvar _handleKss = __webpack_require__(/*! ./handle-kss */ \"./src/cli/handle-kss.js\");\n\nvar _utils = __webpack_require__(/*! ./utils */ \"./src/cli/utils.js\");\n\n// Requires\n/** @module cli/actions */\n\n// Imports\nconst path = __webpack_require__(/*! path */ 0);\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n// EXPORTED FUNCTIONS\n\n/**\n * Recursively loop through initial watched files list from Gaze.\n *\n * @param {object} data - object containing directory and file paths\n * @param {object} store - memory store\n * @param {object} huron - huron configuration options\n * @return {object} newStore - map object of entire data store\n */\nfunction initFiles(data, store, depth = 0) {\n  const type = Object.prototype.toString.call(data);\n  let newStore = store;\n  let info;\n  let files;\n\n  switch (type) {\n    case '[object Object]':\n      files = Object.keys(data);\n      newStore = files.reduce((prevStore, file) => initFiles(data[file], prevStore, depth), newStore);\n      break;\n\n    case '[object Array]':\n      newStore = data.reduce((prevStore, file) => initFiles(file, prevStore, depth), newStore);\n      break;\n\n    case '[object String]':\n      info = path.parse(data);\n      if (info.ext) {\n        newStore = updateFile(data, store);\n      }\n      break;\n\n    default:\n      break;\n  }\n\n  return newStore;\n}\n\n/**\n * Logic for updating and writing file information based on file type (extension)\n *\n * @param {string} filepath - path to updated file. usually passed in from Gaze\n * @param {object} store - memory store\n * @return {object} store - map object of map object of entire data store\n */\nfunction updateFile(filepath, store) {\n  const huron = store.get('config');\n  const file = path.parse(filepath);\n  let field;\n  let section;\n\n  if (-1 !== filepath.indexOf(huron.get('sectionTemplate'))) {\n    return _utils.utils.writeSectionTemplate(filepath, store);\n  }\n\n  switch (file.ext) {\n    // Plain HTML template, external\n    case '.html':\n      section = _utils.utils.getSection(file.base, 'markup', store);\n\n      if (section) {\n        return _handleHtml.htmlHandler.updateTemplate(filepath, section, store);\n      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {\n        return _handleHtml.htmlHandler.updatePrototype(filepath, store);\n      }\n\n      console.log(chalk.red(`Failed to write file: ${ file.name }`));\n      break;\n\n    // Handlebars template, external\n    case huron.get('templates').extension:\n    case '.json':\n      field = '.json' === file.ext ? 'data' : 'markup';\n      section = _utils.utils.getSection(file.base, field, store);\n\n      if (section) {\n        return _handleTemplates.templateHandler.updateTemplate(filepath, section, store);\n      }\n\n      console.log( // eslint-disable-line no-console\n      chalk.red(`Could not find associated KSS section for ${ filepath }`));\n      break;\n\n    // KSS documentation (default extension is `.css`)\n    // Will also output a template if markup is inline\n    // Note: inline markup does _not_ support handlebars currently\n    case huron.get('kssExtension'):\n      return _handleKss.kssHandler.updateKSS(filepath, store);\n\n    // This should never happen if Gaze is working properly\n    default:\n      return store;\n  }\n\n  return store;\n}\n\n/**\n * Logic for deleting file information and files based on file type (extension)\n *\n * @param {string} filepath - path to updated file. usually passed in from Gaze\n * @param {object} store - memory store\n * @return {object} newStore - map object of map object of entire data store\n */\nfunction deleteFile(filepath, store) {\n  const huron = store.get('config');\n  const file = path.parse(filepath);\n  let field = '';\n  let section = null;\n  let newStore = store;\n\n  switch (file.ext) {\n    // Plain HTML template, external\n    case '.html':\n      section = _utils.utils.getSection(file.base, 'markup', store);\n\n      if (section) {\n        newStore = _handleHtml.htmlHandler.deleteTemplate(filepath, section, store);\n      } else if (-1 !== file.dir.indexOf('prototypes') && -1 !== file.name.indexOf('prototype-')) {\n        newStore = _handleHtml.htmlHandler.deletePrototype(filepath, store);\n      }\n      break;\n\n    case huron.get('templates').extension:\n    case '.json':\n      field = '.json' === file.ext ? 'data' : 'markup';\n      section = _utils.utils.getSection(file.base, field, store);\n\n      if (section) {\n        newStore = _handleTemplates.templateHandler.deleteTemplate(filepath, section, store);\n      }\n      break;\n\n    case huron.get('kssExtension'):\n      section = _utils.utils.getSection(filepath, false, store);\n\n      if (section) {\n        newStore = _handleKss.kssHandler.deleteKSS(filepath, section, store);\n      }\n      break;\n\n    default:\n      console.warn( // eslint-disable-line no-console\n      chalk.red(`Could not delete: ${ file.name }`));\n      break;\n  }\n\n  return newStore;\n}//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2FjdGlvbnMuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2NsaS9hY3Rpb25zLmpzPzVlNWEiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBtb2R1bGUgY2xpL2FjdGlvbnMgKi9cblxuLy8gSW1wb3J0c1xuaW1wb3J0IHsgaHRtbEhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZS1odG1sJztcbmltcG9ydCB7IHRlbXBsYXRlSGFuZGxlciB9IGZyb20gJy4vaGFuZGxlLXRlbXBsYXRlcyc7XG5pbXBvcnQgeyBrc3NIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGUta3NzJztcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIFJlcXVpcmVzXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpOyAvLyBDb2xvcml6ZSB0ZXJtaW5hbCBvdXRwdXRcblxuLy8gRVhQT1JURUQgRlVOQ1RJT05TXG5cbi8qKlxuICogUmVjdXJzaXZlbHkgbG9vcCB0aHJvdWdoIGluaXRpYWwgd2F0Y2hlZCBmaWxlcyBsaXN0IGZyb20gR2F6ZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSAtIG9iamVjdCBjb250YWluaW5nIGRpcmVjdG9yeSBhbmQgZmlsZSBwYXRoc1xuICogQHBhcmFtIHtvYmplY3R9IHN0b3JlIC0gbWVtb3J5IHN0b3JlXG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3U3RvcmUgLSBtYXAgb2JqZWN0IG9mIGVudGlyZSBkYXRhIHN0b3JlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0RmlsZXMoZGF0YSwgc3RvcmUsIGRlcHRoID0gMCkge1xuICBjb25zdCB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpO1xuICBsZXQgbmV3U3RvcmUgPSBzdG9yZTtcbiAgbGV0IGluZm87XG4gIGxldCBmaWxlcztcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgZmlsZXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcbiAgICAgIG5ld1N0b3JlID0gZmlsZXMucmVkdWNlKFxuICAgICAgICAocHJldlN0b3JlLCBmaWxlKSA9PiBpbml0RmlsZXMoZGF0YVtmaWxlXSwgcHJldlN0b3JlLCBkZXB0aCksXG4gICAgICAgIG5ld1N0b3JlXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgICBuZXdTdG9yZSA9IGRhdGEucmVkdWNlKFxuICAgICAgICAocHJldlN0b3JlLCBmaWxlKSA9PiBpbml0RmlsZXMoZmlsZSwgcHJldlN0b3JlLCBkZXB0aCksXG4gICAgICAgIG5ld1N0b3JlXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgaW5mbyA9IHBhdGgucGFyc2UoZGF0YSk7XG4gICAgICBpZiAoaW5mby5leHQpIHtcbiAgICAgICAgbmV3U3RvcmUgPSB1cGRhdGVGaWxlKGRhdGEsIHN0b3JlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIG5ld1N0b3JlO1xufVxuXG4vKipcbiAqIExvZ2ljIGZvciB1cGRhdGluZyBhbmQgd3JpdGluZyBmaWxlIGluZm9ybWF0aW9uIGJhc2VkIG9uIGZpbGUgdHlwZSAoZXh0ZW5zaW9uKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlcGF0aCAtIHBhdGggdG8gdXBkYXRlZCBmaWxlLiB1c3VhbGx5IHBhc3NlZCBpbiBmcm9tIEdhemVcbiAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICogQHJldHVybiB7b2JqZWN0fSBzdG9yZSAtIG1hcCBvYmplY3Qgb2YgbWFwIG9iamVjdCBvZiBlbnRpcmUgZGF0YSBzdG9yZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRmlsZShmaWxlcGF0aCwgc3RvcmUpIHtcbiAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICBjb25zdCBmaWxlID0gcGF0aC5wYXJzZShmaWxlcGF0aCk7XG4gIGxldCBmaWVsZDtcbiAgbGV0IHNlY3Rpb247XG5cbiAgaWYgKC0gMSAhPT0gZmlsZXBhdGguaW5kZXhPZihodXJvbi5nZXQoJ3NlY3Rpb25UZW1wbGF0ZScpKSkge1xuICAgIHJldHVybiB1dGlscy53cml0ZVNlY3Rpb25UZW1wbGF0ZShmaWxlcGF0aCwgc3RvcmUpO1xuICB9XG5cbiAgc3dpdGNoIChmaWxlLmV4dCkge1xuICAgIC8vIFBsYWluIEhUTUwgdGVtcGxhdGUsIGV4dGVybmFsXG4gICAgY2FzZSAnLmh0bWwnOlxuICAgICAgc2VjdGlvbiA9IHV0aWxzLmdldFNlY3Rpb24oZmlsZS5iYXNlLCAnbWFya3VwJywgc3RvcmUpO1xuXG4gICAgICBpZiAoc2VjdGlvbikge1xuICAgICAgICByZXR1cm4gaHRtbEhhbmRsZXIudXBkYXRlVGVtcGxhdGUoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIC0gMSAhPT0gZmlsZS5kaXIuaW5kZXhPZigncHJvdG90eXBlcycpICYmXG4gICAgICAgIC0gMSAhPT0gZmlsZS5uYW1lLmluZGV4T2YoJ3Byb3RvdHlwZS0nKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBodG1sSGFuZGxlci51cGRhdGVQcm90b3R5cGUoZmlsZXBhdGgsIHN0b3JlKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKGBGYWlsZWQgdG8gd3JpdGUgZmlsZTogJHtmaWxlLm5hbWV9YCkpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBIYW5kbGViYXJzIHRlbXBsYXRlLCBleHRlcm5hbFxuICAgIGNhc2UgaHVyb24uZ2V0KCd0ZW1wbGF0ZXMnKS5leHRlbnNpb246XG4gICAgY2FzZSAnLmpzb24nOlxuICAgICAgZmllbGQgPSAoJy5qc29uJyA9PT0gZmlsZS5leHQpID8gJ2RhdGEnIDogJ21hcmt1cCc7XG4gICAgICBzZWN0aW9uID0gdXRpbHMuZ2V0U2VjdGlvbihmaWxlLmJhc2UsIGZpZWxkLCBzdG9yZSk7XG5cbiAgICAgIGlmIChzZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUhhbmRsZXIudXBkYXRlVGVtcGxhdGUoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjaGFsay5yZWQoYENvdWxkIG5vdCBmaW5kIGFzc29jaWF0ZWQgS1NTIHNlY3Rpb24gZm9yICR7ZmlsZXBhdGh9YClcbiAgICAgICk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEtTUyBkb2N1bWVudGF0aW9uIChkZWZhdWx0IGV4dGVuc2lvbiBpcyBgLmNzc2ApXG4gICAgLy8gV2lsbCBhbHNvIG91dHB1dCBhIHRlbXBsYXRlIGlmIG1hcmt1cCBpcyBpbmxpbmVcbiAgICAvLyBOb3RlOiBpbmxpbmUgbWFya3VwIGRvZXMgX25vdF8gc3VwcG9ydCBoYW5kbGViYXJzIGN1cnJlbnRseVxuICAgIGNhc2UgaHVyb24uZ2V0KCdrc3NFeHRlbnNpb24nKTpcbiAgICAgIHJldHVybiBrc3NIYW5kbGVyLnVwZGF0ZUtTUyhmaWxlcGF0aCwgc3RvcmUpO1xuXG4gICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGlmIEdhemUgaXMgd29ya2luZyBwcm9wZXJseVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RvcmU7XG4gIH1cblxuICByZXR1cm4gc3RvcmU7XG59XG5cbi8qKlxuICogTG9naWMgZm9yIGRlbGV0aW5nIGZpbGUgaW5mb3JtYXRpb24gYW5kIGZpbGVzIGJhc2VkIG9uIGZpbGUgdHlwZSAoZXh0ZW5zaW9uKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlcGF0aCAtIHBhdGggdG8gdXBkYXRlZCBmaWxlLiB1c3VhbGx5IHBhc3NlZCBpbiBmcm9tIEdhemVcbiAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICogQHJldHVybiB7b2JqZWN0fSBuZXdTdG9yZSAtIG1hcCBvYmplY3Qgb2YgbWFwIG9iamVjdCBvZiBlbnRpcmUgZGF0YSBzdG9yZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlRmlsZShmaWxlcGF0aCwgc3RvcmUpIHtcbiAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICBjb25zdCBmaWxlID0gcGF0aC5wYXJzZShmaWxlcGF0aCk7XG4gIGxldCBmaWVsZCA9ICcnO1xuICBsZXQgc2VjdGlvbiA9IG51bGw7XG4gIGxldCBuZXdTdG9yZSA9IHN0b3JlO1xuXG4gIHN3aXRjaCAoZmlsZS5leHQpIHtcbiAgICAvLyBQbGFpbiBIVE1MIHRlbXBsYXRlLCBleHRlcm5hbFxuICAgIGNhc2UgJy5odG1sJzpcbiAgICAgIHNlY3Rpb24gPSB1dGlscy5nZXRTZWN0aW9uKGZpbGUuYmFzZSwgJ21hcmt1cCcsIHN0b3JlKTtcblxuICAgICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgICAgbmV3U3RvcmUgPSBodG1sSGFuZGxlci5kZWxldGVUZW1wbGF0ZShmaWxlcGF0aCwgc2VjdGlvbiwgc3RvcmUpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgLSAxICE9PSBmaWxlLmRpci5pbmRleE9mKCdwcm90b3R5cGVzJykgJiZcbiAgICAgICAgLSAxICE9PSBmaWxlLm5hbWUuaW5kZXhPZigncHJvdG90eXBlLScpXG4gICAgICApIHtcbiAgICAgICAgbmV3U3RvcmUgPSBodG1sSGFuZGxlci5kZWxldGVQcm90b3R5cGUoZmlsZXBhdGgsIHN0b3JlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBodXJvbi5nZXQoJ3RlbXBsYXRlcycpLmV4dGVuc2lvbjpcbiAgICBjYXNlICcuanNvbic6XG4gICAgICBmaWVsZCA9ICgnLmpzb24nID09PSBmaWxlLmV4dCkgPyAnZGF0YScgOiAnbWFya3VwJztcbiAgICAgIHNlY3Rpb24gPSB1dGlscy5nZXRTZWN0aW9uKGZpbGUuYmFzZSwgZmllbGQsIHN0b3JlKTtcblxuICAgICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgICAgbmV3U3RvcmUgPSB0ZW1wbGF0ZUhhbmRsZXIuZGVsZXRlVGVtcGxhdGUoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBodXJvbi5nZXQoJ2tzc0V4dGVuc2lvbicpOlxuICAgICAgc2VjdGlvbiA9IHV0aWxzLmdldFNlY3Rpb24oZmlsZXBhdGgsIGZhbHNlLCBzdG9yZSk7XG5cbiAgICAgIGlmIChzZWN0aW9uKSB7XG4gICAgICAgIG5ld1N0b3JlID0ga3NzSGFuZGxlci5kZWxldGVLU1MoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUud2FybiggIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjaGFsay5yZWQoYENvdWxkIG5vdCBkZWxldGU6ICR7ZmlsZS5uYW1lfWApXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gbmV3U3RvcmU7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2NsaS9hY3Rpb25zLmpzIl0sIm1hcHBpbmdzIjoiOzs7OztBQXNCQTtBQTJDQTtBQStEQTtBQUNBO0FBOUhBO0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXhCQTtBQUNBO0FBMEJBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXhDQTtBQUNBO0FBMENBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQXJDQTtBQUNBO0FBdUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/generate-config.js":
/* no static exports found */
/* all exports used */
/*!************************************!*\
  !*** ./src/cli/generate-config.js ***!
  \************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = generateConfig;\n\nvar _parseArgs = __webpack_require__(/*! ./parse-args */ \"./src/cli/parse-args.js\");\n\nvar _parseArgs2 = _interopRequireDefault(_parseArgs);\n\nvar _requireExternal = __webpack_require__(/*! ./require-external */ \"./src/cli/require-external.js\");\n\nvar _requireExternal2 = _interopRequireDefault(_requireExternal);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/** @module cli/generate-config */\n\nconst cwd = process.cwd();\nconst path = __webpack_require__(/*! path */ 0);\nconst url = __webpack_require__(/*! url */ 9);\nconst fs = __webpack_require__(/*! fs-extra */ 2);\nconst webpack = __webpack_require__(/*! webpack */ 3);\nconst HTMLWebpackPlugin = __webpack_require__(/*! html-webpack-plugin */ 6);\nconst defaultConfig = __webpack_require__(/*! ../default-config/webpack.config */ \"./src/default-config/webpack.config.js\");\nconst defaultHuron = __webpack_require__(/*! ../default-config/huron.config */ \"./src/default-config/huron.config.js\");\n\n// Require configs passed in by user from CLI\nconst localConfigPath = path.join(cwd, _parseArgs2.default.webpackConfig);\nconst localHuronPath = path.join(cwd, _parseArgs2.default.huronConfig);\nconst localConfig = (0, _requireExternal2.default)(localConfigPath);\nconst localHuron = (0, _requireExternal2.default)(localHuronPath);\n\n/**\n * Generate a mutant hybrid of the huron default webpack config and your local webpack config\n *\n * @function generateConfig\n * @param {object} config - local webpack config\n * @return {object} newConfig - updated data store\n */\nfunction generateConfig() {\n  let newConfig = localConfig;\n  let newHuron = localHuron;\n\n  // Execute config function, if provided\n  if ('function' === typeof newConfig) {\n    newConfig = newConfig(_parseArgs2.default.env);\n  }\n\n  // Execute huron config function, if provided\n  if ('function' === typeof newHuron) {\n    newHuron = newHuron(_parseArgs2.default.env);\n  }\n\n  newHuron = Object.assign({}, defaultHuron, newHuron);\n\n  // Set ouput options\n  newConfig.output = Object.assign({}, defaultConfig.output, newConfig.output);\n  newConfig.output.path = path.resolve(cwd, newHuron.root);\n  if (!_parseArgs2.default.production) {\n    newConfig.output.publicPath = `http://localhost:${ newHuron.port }/${ newHuron.root }`;\n  } else {\n    newConfig.output.publicPath = '';\n  }\n\n  // configure entries\n  newConfig = configureEntries(newHuron, newConfig);\n\n  // configure plugins\n  newConfig = configurePlugins(newHuron, newConfig);\n\n  // configure loaders\n  newConfig = configureLoaders(newHuron, newConfig);\n\n  // Add HTMLWebpackPlugin for each configured prototype\n  newConfig = configurePrototypes(newHuron, newConfig);\n\n  // Remove existing devServer settings\n  delete newConfig.devServer;\n\n  return {\n    huron: newHuron,\n    webpack: newConfig\n  };\n}\n\n/**\n * Configure and manage webpack entry points\n *\n * @param {object} huron - huron configuration object\n * @param {object} config - webpack configuration object\n * @return {object} newConfig - updated data store\n */\nfunction configureEntries(huron, config) {\n  const entry = config.entry[huron.entry];\n  const newConfig = config;\n\n  newConfig.entry = {};\n  if (!_parseArgs2.default.production) {\n    newConfig.entry[huron.entry] = [`webpack-dev-server/client?http://localhost:${ huron.port }`, 'webpack/hot/dev-server', path.join(cwd, huron.root, 'huron-assets/huron')].concat(entry);\n  } else {\n    newConfig.entry[huron.entry] = [path.join(cwd, huron.root, 'huron-assets/huron')].concat(entry);\n  }\n\n  return newConfig;\n}\n\n/**\n * Configure and manage webpack plugins\n *\n * @param {object} huron - huron configuration object\n * @param {object} config - webpack configuration object\n * @return {object} newConfig - updated data store\n */\nfunction configurePlugins(huron, config) {\n  const newConfig = config;\n\n  newConfig.plugins = config.plugins || [];\n\n  if (!_parseArgs2.default.production) {\n    if (newConfig.plugins && newConfig.plugins.length) {\n      newConfig.plugins = newConfig.plugins.filter(plugin => 'HotModuleReplacementPlugin' !== plugin.constructor.name && 'NamedModulesPlugin' !== plugin.constructor.name);\n    }\n    newConfig.plugins = newConfig.plugins.concat([new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()]);\n  }\n\n  return newConfig;\n}\n\n/**\n * Configure and manage webpack loaders\n *\n * @param {object} huron - huron configuration object\n * @param {object} config - webpack configuration object\n * @return {object} newConfig - updated data store\n */\nfunction configureLoaders(huron, config) {\n  // Manage loaders\n  const templatesLoader = huron.templates.rule || {};\n  const newConfig = config;\n\n  templatesLoader.include = [path.join(cwd, huron.root)];\n  newConfig.module = newConfig.module || {};\n  newConfig.module.rules = newConfig.module.rules || newConfig.module.loaders || [];\n  newConfig.module.rules.push({\n    test: /\\.html$/,\n    use: 'html-loader',\n    include: [path.join(cwd, huron.root)]\n  }, templatesLoader);\n\n  return newConfig;\n}\n\n/**\n * Create an HTML webpack plugin for each configured prototype\n *\n * @param {object} huron - huron configuration object\n * @param {object} config - webpack configuration object\n * @return {object} newConfig - updated data store\n */\nfunction configurePrototypes(huron, config) {\n  const wrapperTemplate = fs.readFileSync(path.join(__dirname, '../../templates/prototype-template.ejs'), 'utf8');\n\n  const defaultHTMLPluginOptions = {\n    title: '',\n    window: huron.window,\n    js: [],\n    css: [],\n    filename: 'index.html',\n    template: path.join(cwd, huron.root, 'huron-assets/prototype-template.ejs'),\n    inject: false,\n    chunks: [huron.entry]\n  };\n  const newConfig = config;\n\n  // Write prototype template file for HTML webpack plugin\n  fs.outputFileSync(path.join(cwd, huron.root, 'huron-assets/prototype-template.ejs'), wrapperTemplate);\n\n  huron.prototypes.forEach(prototype => {\n    const newPrototype = prototype;\n    let opts = {};\n\n    // Merge configured settings with default settings\n    if ('string' === typeof prototype) {\n      opts = Object.assign({}, defaultHTMLPluginOptions, {\n        title: prototype,\n        filename: `${ prototype }.html`\n      });\n    } else if ('object' === typeof prototype && {}.hasOwnProperty.call(prototype, 'title')) {\n      // Create filename based on configured title if not provided\n      if (!prototype.filename) {\n        newPrototype.filename = `${ prototype.title }.html`;\n      }\n\n      // Move css assets for this prototype,\n      // reset css option with new file paths\n      if (prototype.css) {\n        newPrototype.css = moveAdditionalAssets(prototype.css, 'css', huron);\n      }\n\n      // Move js assets for this prototype,\n      // reset js option with new file paths\n      if (prototype.js) {\n        newPrototype.js = moveAdditionalAssets(prototype.js, 'js', huron);\n      }\n\n      opts = Object.assign({}, defaultHTMLPluginOptions, newPrototype);\n    }\n\n    // Move global css assets,\n    // reset css option with new file paths\n    if (huron.css.length) {\n      opts.css = opts.css.concat(moveAdditionalAssets(huron.css, 'css', huron));\n    }\n\n    // Move global js assets,\n    // reset js option with new file paths\n    if (huron.js.length) {\n      opts.js = opts.js.concat(moveAdditionalAssets(huron.js, 'js', huron));\n    }\n\n    // Push a new plugin for each configured prototype\n    if (Object.keys(opts).length) {\n      newConfig.plugins.push(new HTMLWebpackPlugin(opts));\n    }\n  });\n\n  return newConfig;\n}\n\n/**\n * Move relative (and local) js and css assets provided in huron options\n *\n * @param {array|string} assets - array of assets or single asset\n * @param {string} subdir - subdirectory in huron root from which to load additional asset\n * @param {object} huron - huron configuration object\n * @return {array} assetResults - paths to js and css assets\n */\nfunction moveAdditionalAssets(assets, subdir = '', huron) {\n  const currentAssets = [].concat(assets);\n  const assetResults = [];\n\n  currentAssets.forEach(asset => {\n    const assetInfo = path.parse(asset);\n    const assetURL = url.parse(asset);\n    const sourcePath = path.join(cwd, asset);\n    const outputPath = path.resolve(cwd, huron.root, subdir, assetInfo.base);\n    const loadPath = _parseArgs2.default.production ? path.join(subdir, assetInfo.base) : path.join('/', subdir, assetInfo.base); // Use absolute path in development\n    let contents = false;\n\n    if (!path.isAbsolute(asset) && !assetURL.protocol) {\n      try {\n        contents = fs.readFileSync(sourcePath);\n      } catch (e) {\n        console.warn(`could not read ${ sourcePath }`);\n      }\n\n      if (contents) {\n        fs.outputFileSync(outputPath, contents);\n        assetResults.push(loadPath);\n      }\n    } else {\n      assetResults.push(asset);\n    }\n  });\n\n  return assetResults;\n}//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2dlbmVyYXRlLWNvbmZpZy5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvY2xpL2dlbmVyYXRlLWNvbmZpZy5qcz9hNWY5Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAbW9kdWxlIGNsaS9nZW5lcmF0ZS1jb25maWcgKi9cblxuaW1wb3J0IHByb2dyYW0gZnJvbSAnLi9wYXJzZS1hcmdzJztcbmltcG9ydCByZXF1aXJlRXh0ZXJuYWwgZnJvbSAnLi9yZXF1aXJlLWV4dGVybmFsJztcblxuY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmNvbnN0IHdlYnBhY2sgPSByZXF1aXJlKCd3ZWJwYWNrJyk7XG5jb25zdCBIVE1MV2VicGFja1BsdWdpbiA9IHJlcXVpcmUoJ2h0bWwtd2VicGFjay1wbHVnaW4nKTtcbmNvbnN0IGRlZmF1bHRDb25maWcgPSByZXF1aXJlKCcuLi9kZWZhdWx0LWNvbmZpZy93ZWJwYWNrLmNvbmZpZycpO1xuY29uc3QgZGVmYXVsdEh1cm9uID0gcmVxdWlyZSgnLi4vZGVmYXVsdC1jb25maWcvaHVyb24uY29uZmlnJyk7XG5cbi8vIFJlcXVpcmUgY29uZmlncyBwYXNzZWQgaW4gYnkgdXNlciBmcm9tIENMSVxuY29uc3QgbG9jYWxDb25maWdQYXRoID0gcGF0aC5qb2luKGN3ZCwgcHJvZ3JhbS53ZWJwYWNrQ29uZmlnKTtcbmNvbnN0IGxvY2FsSHVyb25QYXRoID0gcGF0aC5qb2luKGN3ZCwgcHJvZ3JhbS5odXJvbkNvbmZpZyk7XG5jb25zdCBsb2NhbENvbmZpZyA9IHJlcXVpcmVFeHRlcm5hbChsb2NhbENvbmZpZ1BhdGgpO1xuY29uc3QgbG9jYWxIdXJvbiA9IHJlcXVpcmVFeHRlcm5hbChsb2NhbEh1cm9uUGF0aCk7XG5cbi8qKlxuICogR2VuZXJhdGUgYSBtdXRhbnQgaHlicmlkIG9mIHRoZSBodXJvbiBkZWZhdWx0IHdlYnBhY2sgY29uZmlnIGFuZCB5b3VyIGxvY2FsIHdlYnBhY2sgY29uZmlnXG4gKlxuICogQGZ1bmN0aW9uIGdlbmVyYXRlQ29uZmlnXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gbG9jYWwgd2VicGFjayBjb25maWdcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3Q29uZmlnIC0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdlbmVyYXRlQ29uZmlnKCkge1xuICBsZXQgbmV3Q29uZmlnID0gbG9jYWxDb25maWc7XG4gIGxldCBuZXdIdXJvbiA9IGxvY2FsSHVyb247XG5cbiAgLy8gRXhlY3V0ZSBjb25maWcgZnVuY3Rpb24sIGlmIHByb3ZpZGVkXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbmV3Q29uZmlnKSB7XG4gICAgbmV3Q29uZmlnID0gbmV3Q29uZmlnKHByb2dyYW0uZW52KTtcbiAgfVxuXG4gIC8vIEV4ZWN1dGUgaHVyb24gY29uZmlnIGZ1bmN0aW9uLCBpZiBwcm92aWRlZFxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG5ld0h1cm9uKSB7XG4gICAgbmV3SHVyb24gPSBuZXdIdXJvbihwcm9ncmFtLmVudik7XG4gIH1cblxuICBuZXdIdXJvbiA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRIdXJvbiwgbmV3SHVyb24pO1xuXG4gIC8vIFNldCBvdXB1dCBvcHRpb25zXG4gIG5ld0NvbmZpZy5vdXRwdXQgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0Q29uZmlnLm91dHB1dCwgbmV3Q29uZmlnLm91dHB1dCk7XG4gIG5ld0NvbmZpZy5vdXRwdXQucGF0aCA9IHBhdGgucmVzb2x2ZShjd2QsIG5ld0h1cm9uLnJvb3QpO1xuICBpZiAoISBwcm9ncmFtLnByb2R1Y3Rpb24pIHtcbiAgICBuZXdDb25maWcub3V0cHV0LnB1YmxpY1BhdGggPSBgaHR0cDovL2xvY2FsaG9zdDoke25ld0h1cm9uLnBvcnR9LyR7bmV3SHVyb24ucm9vdH1gO1xuICB9IGVsc2Uge1xuICAgIG5ld0NvbmZpZy5vdXRwdXQucHVibGljUGF0aCA9ICcnO1xuICB9XG5cbiAgLy8gY29uZmlndXJlIGVudHJpZXNcbiAgbmV3Q29uZmlnID0gY29uZmlndXJlRW50cmllcyhuZXdIdXJvbiwgbmV3Q29uZmlnKTtcblxuICAvLyBjb25maWd1cmUgcGx1Z2luc1xuICBuZXdDb25maWcgPSBjb25maWd1cmVQbHVnaW5zKG5ld0h1cm9uLCBuZXdDb25maWcpO1xuXG4gIC8vIGNvbmZpZ3VyZSBsb2FkZXJzXG4gIG5ld0NvbmZpZyA9IGNvbmZpZ3VyZUxvYWRlcnMobmV3SHVyb24sIG5ld0NvbmZpZyk7XG5cbiAgLy8gQWRkIEhUTUxXZWJwYWNrUGx1Z2luIGZvciBlYWNoIGNvbmZpZ3VyZWQgcHJvdG90eXBlXG4gIG5ld0NvbmZpZyA9IGNvbmZpZ3VyZVByb3RvdHlwZXMobmV3SHVyb24sIG5ld0NvbmZpZyk7XG5cbiAgLy8gUmVtb3ZlIGV4aXN0aW5nIGRldlNlcnZlciBzZXR0aW5nc1xuICBkZWxldGUgbmV3Q29uZmlnLmRldlNlcnZlcjtcblxuICByZXR1cm4ge1xuICAgIGh1cm9uOiBuZXdIdXJvbixcbiAgICB3ZWJwYWNrOiBuZXdDb25maWcsXG4gIH07XG59XG5cbi8qKlxuICogQ29uZmlndXJlIGFuZCBtYW5hZ2Ugd2VicGFjayBlbnRyeSBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdlYnBhY2sgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3Q29uZmlnIC0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ3VyZUVudHJpZXMoaHVyb24sIGNvbmZpZykge1xuICBjb25zdCBlbnRyeSA9IGNvbmZpZy5lbnRyeVtodXJvbi5lbnRyeV07XG4gIGNvbnN0IG5ld0NvbmZpZyA9IGNvbmZpZztcblxuICBuZXdDb25maWcuZW50cnkgPSB7fTtcbiAgaWYgKCEgcHJvZ3JhbS5wcm9kdWN0aW9uKSB7XG4gICAgbmV3Q29uZmlnLmVudHJ5W2h1cm9uLmVudHJ5XSA9IFtcbiAgICAgIGB3ZWJwYWNrLWRldi1zZXJ2ZXIvY2xpZW50P2h0dHA6Ly9sb2NhbGhvc3Q6JHtodXJvbi5wb3J0fWAsXG4gICAgICAnd2VicGFjay9ob3QvZGV2LXNlcnZlcicsXG4gICAgICBwYXRoLmpvaW4oY3dkLCBodXJvbi5yb290LCAnaHVyb24tYXNzZXRzL2h1cm9uJyksXG4gICAgXS5jb25jYXQoZW50cnkpO1xuICB9IGVsc2Uge1xuICAgIG5ld0NvbmZpZy5lbnRyeVtodXJvbi5lbnRyeV0gPSBbXG4gICAgICBwYXRoLmpvaW4oY3dkLCBodXJvbi5yb290LCAnaHVyb24tYXNzZXRzL2h1cm9uJyksXG4gICAgXS5jb25jYXQoZW50cnkpO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NvbmZpZztcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgYW5kIG1hbmFnZSB3ZWJwYWNrIHBsdWdpbnNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdlYnBhY2sgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3Q29uZmlnIC0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ3VyZVBsdWdpbnMoaHVyb24sIGNvbmZpZykge1xuICBjb25zdCBuZXdDb25maWcgPSBjb25maWc7XG5cbiAgbmV3Q29uZmlnLnBsdWdpbnMgPSBjb25maWcucGx1Z2lucyB8fCBbXTtcblxuICBpZiAoISBwcm9ncmFtLnByb2R1Y3Rpb24pIHtcbiAgICBpZiAobmV3Q29uZmlnLnBsdWdpbnMgJiYgbmV3Q29uZmlnLnBsdWdpbnMubGVuZ3RoKSB7XG4gICAgICBuZXdDb25maWcucGx1Z2lucyA9IG5ld0NvbmZpZy5wbHVnaW5zLmZpbHRlcihcbiAgICAgICAgKHBsdWdpbikgPT4gJ0hvdE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luJyAhPT0gcGx1Z2luLmNvbnN0cnVjdG9yLm5hbWUgJiZcbiAgICAgICAgICAnTmFtZWRNb2R1bGVzUGx1Z2luJyAhPT0gcGx1Z2luLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICk7XG4gICAgfVxuICAgIG5ld0NvbmZpZy5wbHVnaW5zID0gbmV3Q29uZmlnLnBsdWdpbnNcbiAgICAgIC5jb25jYXQoW1xuICAgICAgICBuZXcgd2VicGFjay5Ib3RNb2R1bGVSZXBsYWNlbWVudFBsdWdpbigpLFxuICAgICAgICBuZXcgd2VicGFjay5OYW1lZE1vZHVsZXNQbHVnaW4oKSxcbiAgICAgIF0pO1xuICB9XG5cbiAgcmV0dXJuIG5ld0NvbmZpZztcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgYW5kIG1hbmFnZSB3ZWJwYWNrIGxvYWRlcnNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdlYnBhY2sgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3Q29uZmlnIC0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ3VyZUxvYWRlcnMoaHVyb24sIGNvbmZpZykge1xuICAvLyBNYW5hZ2UgbG9hZGVyc1xuICBjb25zdCB0ZW1wbGF0ZXNMb2FkZXIgPSBodXJvbi50ZW1wbGF0ZXMucnVsZSB8fCB7fTtcbiAgY29uc3QgbmV3Q29uZmlnID0gY29uZmlnO1xuXG4gIHRlbXBsYXRlc0xvYWRlci5pbmNsdWRlID0gW3BhdGguam9pbihjd2QsIGh1cm9uLnJvb3QpXTtcbiAgbmV3Q29uZmlnLm1vZHVsZSA9IG5ld0NvbmZpZy5tb2R1bGUgfHwge307XG4gIG5ld0NvbmZpZy5tb2R1bGUucnVsZXMgPSBuZXdDb25maWcubW9kdWxlLnJ1bGVzIHx8XG4gICAgbmV3Q29uZmlnLm1vZHVsZS5sb2FkZXJzIHx8XG4gICAgW107XG4gIG5ld0NvbmZpZy5tb2R1bGUucnVsZXMucHVzaChcbiAgICB7XG4gICAgICB0ZXN0OiAvXFwuaHRtbCQvLFxuICAgICAgdXNlOiAnaHRtbC1sb2FkZXInLFxuICAgICAgaW5jbHVkZTogW3BhdGguam9pbihjd2QsIGh1cm9uLnJvb3QpXSxcbiAgICB9LFxuICAgIHRlbXBsYXRlc0xvYWRlclxuICApO1xuXG4gIHJldHVybiBuZXdDb25maWc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIEhUTUwgd2VicGFjayBwbHVnaW4gZm9yIGVhY2ggY29uZmlndXJlZCBwcm90b3R5cGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdlYnBhY2sgY29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEByZXR1cm4ge29iamVjdH0gbmV3Q29uZmlnIC0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ3VyZVByb3RvdHlwZXMoaHVyb24sIGNvbmZpZykge1xuICBjb25zdCB3cmFwcGVyVGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL3RlbXBsYXRlcy9wcm90b3R5cGUtdGVtcGxhdGUuZWpzJyksXG4gICAgJ3V0ZjgnXG4gICk7XG5cbiAgY29uc3QgZGVmYXVsdEhUTUxQbHVnaW5PcHRpb25zID0ge1xuICAgIHRpdGxlOiAnJyxcbiAgICB3aW5kb3c6IGh1cm9uLndpbmRvdyxcbiAgICBqczogW10sXG4gICAgY3NzOiBbXSxcbiAgICBmaWxlbmFtZTogJ2luZGV4Lmh0bWwnLFxuICAgIHRlbXBsYXRlOiBwYXRoLmpvaW4oXG4gICAgICBjd2QsXG4gICAgICBodXJvbi5yb290LFxuICAgICAgJ2h1cm9uLWFzc2V0cy9wcm90b3R5cGUtdGVtcGxhdGUuZWpzJ1xuICAgICksXG4gICAgaW5qZWN0OiBmYWxzZSxcbiAgICBjaHVua3M6IFtodXJvbi5lbnRyeV0sXG4gIH07XG4gIGNvbnN0IG5ld0NvbmZpZyA9IGNvbmZpZztcblxuICAvLyBXcml0ZSBwcm90b3R5cGUgdGVtcGxhdGUgZmlsZSBmb3IgSFRNTCB3ZWJwYWNrIHBsdWdpblxuICBmcy5vdXRwdXRGaWxlU3luYyhcbiAgICBwYXRoLmpvaW4oY3dkLCBodXJvbi5yb290LCAnaHVyb24tYXNzZXRzL3Byb3RvdHlwZS10ZW1wbGF0ZS5lanMnKSxcbiAgICB3cmFwcGVyVGVtcGxhdGVcbiAgKTtcblxuICBodXJvbi5wcm90b3R5cGVzLmZvckVhY2goKHByb3RvdHlwZSkgPT4ge1xuICAgIGNvbnN0IG5ld1Byb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICBsZXQgb3B0cyA9IHt9O1xuXG4gICAgLy8gTWVyZ2UgY29uZmlndXJlZCBzZXR0aW5ncyB3aXRoIGRlZmF1bHQgc2V0dGluZ3NcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBwcm90b3R5cGUpIHtcbiAgICAgIG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0SFRNTFBsdWdpbk9wdGlvbnMsIHtcbiAgICAgICAgdGl0bGU6IHByb3RvdHlwZSxcbiAgICAgICAgZmlsZW5hbWU6IGAke3Byb3RvdHlwZX0uaHRtbGAsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgJ29iamVjdCcgPT09IHR5cGVvZiBwcm90b3R5cGUgJiZcbiAgICAgIHt9Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG90eXBlLCAndGl0bGUnKVxuICAgICkge1xuICAgICAgLy8gQ3JlYXRlIGZpbGVuYW1lIGJhc2VkIG9uIGNvbmZpZ3VyZWQgdGl0bGUgaWYgbm90IHByb3ZpZGVkXG4gICAgICBpZiAoISBwcm90b3R5cGUuZmlsZW5hbWUpIHtcbiAgICAgICAgbmV3UHJvdG90eXBlLmZpbGVuYW1lID0gYCR7cHJvdG90eXBlLnRpdGxlfS5odG1sYDtcbiAgICAgIH1cblxuICAgICAgLy8gTW92ZSBjc3MgYXNzZXRzIGZvciB0aGlzIHByb3RvdHlwZSxcbiAgICAgIC8vIHJlc2V0IGNzcyBvcHRpb24gd2l0aCBuZXcgZmlsZSBwYXRoc1xuICAgICAgaWYgKHByb3RvdHlwZS5jc3MpIHtcbiAgICAgICAgbmV3UHJvdG90eXBlLmNzcyA9IG1vdmVBZGRpdGlvbmFsQXNzZXRzKHByb3RvdHlwZS5jc3MsICdjc3MnLCBodXJvbik7XG4gICAgICB9XG5cbiAgICAgIC8vIE1vdmUganMgYXNzZXRzIGZvciB0aGlzIHByb3RvdHlwZSxcbiAgICAgIC8vIHJlc2V0IGpzIG9wdGlvbiB3aXRoIG5ldyBmaWxlIHBhdGhzXG4gICAgICBpZiAocHJvdG90eXBlLmpzKSB7XG4gICAgICAgIG5ld1Byb3RvdHlwZS5qcyA9IG1vdmVBZGRpdGlvbmFsQXNzZXRzKHByb3RvdHlwZS5qcywgJ2pzJywgaHVyb24pO1xuICAgICAgfVxuXG4gICAgICBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdEhUTUxQbHVnaW5PcHRpb25zLCBuZXdQcm90b3R5cGUpO1xuICAgIH1cblxuICAgIC8vIE1vdmUgZ2xvYmFsIGNzcyBhc3NldHMsXG4gICAgLy8gcmVzZXQgY3NzIG9wdGlvbiB3aXRoIG5ldyBmaWxlIHBhdGhzXG4gICAgaWYgKGh1cm9uLmNzcy5sZW5ndGgpIHtcbiAgICAgIG9wdHMuY3NzID0gb3B0cy5jc3MuY29uY2F0KFxuICAgICAgICBtb3ZlQWRkaXRpb25hbEFzc2V0cyhodXJvbi5jc3MsICdjc3MnLCBodXJvbilcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gTW92ZSBnbG9iYWwganMgYXNzZXRzLFxuICAgIC8vIHJlc2V0IGpzIG9wdGlvbiB3aXRoIG5ldyBmaWxlIHBhdGhzXG4gICAgaWYgKGh1cm9uLmpzLmxlbmd0aCkge1xuICAgICAgb3B0cy5qcyA9IG9wdHMuanMuY29uY2F0KFxuICAgICAgICBtb3ZlQWRkaXRpb25hbEFzc2V0cyhodXJvbi5qcywgJ2pzJywgaHVyb24pXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFB1c2ggYSBuZXcgcGx1Z2luIGZvciBlYWNoIGNvbmZpZ3VyZWQgcHJvdG90eXBlXG4gICAgaWYgKE9iamVjdC5rZXlzKG9wdHMpLmxlbmd0aCkge1xuICAgICAgbmV3Q29uZmlnLnBsdWdpbnMucHVzaChcbiAgICAgICAgbmV3IEhUTUxXZWJwYWNrUGx1Z2luKG9wdHMpXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG5ld0NvbmZpZztcbn1cblxuLyoqXG4gKiBNb3ZlIHJlbGF0aXZlIChhbmQgbG9jYWwpIGpzIGFuZCBjc3MgYXNzZXRzIHByb3ZpZGVkIGluIGh1cm9uIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge2FycmF5fHN0cmluZ30gYXNzZXRzIC0gYXJyYXkgb2YgYXNzZXRzIG9yIHNpbmdsZSBhc3NldFxuICogQHBhcmFtIHtzdHJpbmd9IHN1YmRpciAtIHN1YmRpcmVjdG9yeSBpbiBodXJvbiByb290IGZyb20gd2hpY2ggdG8gbG9hZCBhZGRpdGlvbmFsIGFzc2V0XG4gKiBAcGFyYW0ge29iamVjdH0gaHVyb24gLSBodXJvbiBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHJldHVybiB7YXJyYXl9IGFzc2V0UmVzdWx0cyAtIHBhdGhzIHRvIGpzIGFuZCBjc3MgYXNzZXRzXG4gKi9cbmZ1bmN0aW9uIG1vdmVBZGRpdGlvbmFsQXNzZXRzKGFzc2V0cywgc3ViZGlyID0gJycsIGh1cm9uKSB7XG4gIGNvbnN0IGN1cnJlbnRBc3NldHMgPSBbXS5jb25jYXQoYXNzZXRzKTtcbiAgY29uc3QgYXNzZXRSZXN1bHRzID0gW107XG5cbiAgY3VycmVudEFzc2V0cy5mb3JFYWNoKChhc3NldCkgPT4ge1xuICAgIGNvbnN0IGFzc2V0SW5mbyA9IHBhdGgucGFyc2UoYXNzZXQpO1xuICAgIGNvbnN0IGFzc2V0VVJMID0gdXJsLnBhcnNlKGFzc2V0KTtcbiAgICBjb25zdCBzb3VyY2VQYXRoID0gcGF0aC5qb2luKGN3ZCwgYXNzZXQpO1xuICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLnJlc29sdmUoY3dkLCBodXJvbi5yb290LCBzdWJkaXIsIGFzc2V0SW5mby5iYXNlKTtcbiAgICBjb25zdCBsb2FkUGF0aCA9IHByb2dyYW0ucHJvZHVjdGlvbiA/XG4gICAgICBwYXRoLmpvaW4oc3ViZGlyLCBhc3NldEluZm8uYmFzZSkgOlxuICAgICAgcGF0aC5qb2luKCcvJywgc3ViZGlyLCBhc3NldEluZm8uYmFzZSk7IC8vIFVzZSBhYnNvbHV0ZSBwYXRoIGluIGRldmVsb3BtZW50XG4gICAgbGV0IGNvbnRlbnRzID0gZmFsc2U7XG5cbiAgICBpZiAoXG4gICAgICAhIHBhdGguaXNBYnNvbHV0ZShhc3NldCkgJiZcbiAgICAgICEgYXNzZXRVUkwucHJvdG9jb2xcbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKHNvdXJjZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYGNvdWxkIG5vdCByZWFkICR7c291cmNlUGF0aH1gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbnRlbnRzKSB7XG4gICAgICAgIGZzLm91dHB1dEZpbGVTeW5jKG91dHB1dFBhdGgsIGNvbnRlbnRzKTtcbiAgICAgICAgYXNzZXRSZXN1bHRzLnB1c2gobG9hZFBhdGgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhc3NldFJlc3VsdHMucHVzaChhc3NldCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXNzZXRSZXN1bHRzO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9jbGkvZ2VuZXJhdGUtY29uZmlnLmpzIl0sIm1hcHBpbmdzIjoiOzs7OztBQTJCQTtBQUNBO0FBMUJBO0FBQ0E7OztBQUFBO0FBQ0E7Ozs7O0FBSkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTs7Ozs7OztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBRUE7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBWkE7QUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/handle-html.js":
/* no static exports found */
/* all exports used */
/*!********************************!*\
  !*** ./src/cli/handle-html.js ***!
  \********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.htmlHandler = undefined;\n\nvar _utils = __webpack_require__(/*! ./utils */ \"./src/cli/utils.js\");\n\nconst path = __webpack_require__(/*! path */ 0); /** @module cli/html-handler */\n\nconst fs = __webpack_require__(/*! fs-extra */ 2);\n\n/* eslint-disable */\nconst htmlHandler = exports.htmlHandler = {\n  /* eslint-enable */\n\n  /**\n   * Handle update of an HMTL template\n   *\n   * @function updateTemplate\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} section - contains KSS section data\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  updateTemplate(filepath, section, store) {\n    const file = path.parse(filepath);\n    const content = fs.readFileSync(filepath, 'utf8');\n    const newSection = section;\n\n    if (content) {\n      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, content, store);\n      newSection.templateContent = content;\n\n      // Rewrite section data with template content\n      newSection.sectionPath = _utils.utils.writeSectionData(store, newSection);\n\n      return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);\n    }\n\n    console.log(`File ${ file.base } could not be read`);\n    return store;\n  },\n\n  /**\n   * Handle removal of an HMTL template\n   *\n   * @function deleteTemplate\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} section - contains KSS section data\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  deleteTemplate(filepath, section, store) {\n    const newSection = section;\n\n    _utils.utils.removeFile(newSection.referenceURI, 'template', filepath, store);\n\n    delete newSection.templatePath;\n\n    return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);\n  },\n\n  /**\n   * Handle update for a prototype file\n   *\n   * @function updatePrototype\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  updatePrototype(filepath, store) {\n    const file = path.parse(filepath);\n    const content = fs.readFileSync(filepath, 'utf8');\n\n    if (content) {\n      const requirePath = _utils.utils.writeFile(file.name, 'prototype', filepath, content, store);\n\n      return store.setIn(['prototypes', file.name], requirePath);\n    }\n\n    console.log(`File ${ file.base } could not be read`);\n    return store;\n  },\n\n  /**\n   * Handle removal of a prototype file\n   *\n   * @function deletePrototype\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  deletePrototype(filepath, store) {\n    const file = path.parse(filepath);\n    const requirePath = _utils.utils.removeFile(file.name, 'prototype', filepath, store);\n\n    return store.setIn(['prototypes', file.name], requirePath);\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2hhbmRsZS1odG1sLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3NyYy9jbGkvaGFuZGxlLWh0bWwuanM/YWM3YiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSBjbGkvaHRtbC1oYW5kbGVyICovXG5cbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5leHBvcnQgY29uc3QgaHRtbEhhbmRsZXIgPSB7XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbiAgLyoqXG4gICAqIEhhbmRsZSB1cGRhdGUgb2YgYW4gSE1UTCB0ZW1wbGF0ZVxuICAgKlxuICAgKiBAZnVuY3Rpb24gdXBkYXRlVGVtcGxhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gY29udGFpbnMgS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cGRhdGVkIGRhdGEgc3RvcmVcbiAgICovXG4gIHVwZGF0ZVRlbXBsYXRlKGZpbGVwYXRoLCBzZWN0aW9uLCBzdG9yZSkge1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCAndXRmOCcpO1xuICAgIGNvbnN0IG5ld1NlY3Rpb24gPSBzZWN0aW9uO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIG5ld1NlY3Rpb24udGVtcGxhdGVQYXRoID0gdXRpbHMud3JpdGVGaWxlKFxuICAgICAgICBzZWN0aW9uLnJlZmVyZW5jZVVSSSxcbiAgICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICAgZmlsZXBhdGgsXG4gICAgICAgIGNvbnRlbnQsXG4gICAgICAgIHN0b3JlXG4gICAgICApO1xuICAgICAgbmV3U2VjdGlvbi50ZW1wbGF0ZUNvbnRlbnQgPSBjb250ZW50O1xuXG4gICAgICAvLyBSZXdyaXRlIHNlY3Rpb24gZGF0YSB3aXRoIHRlbXBsYXRlIGNvbnRlbnRcbiAgICAgIG5ld1NlY3Rpb24uc2VjdGlvblBhdGggPSB1dGlscy53cml0ZVNlY3Rpb25EYXRhKHN0b3JlLCBuZXdTZWN0aW9uKTtcblxuICAgICAgcmV0dXJuIHN0b3JlXG4gICAgICAgIC5zZXRJbihcbiAgICAgICAgICBbJ3NlY3Rpb25zJywgJ3NlY3Rpb25zQnlQYXRoJywgc2VjdGlvbi5rc3NQYXRoXSxcbiAgICAgICAgICBuZXdTZWN0aW9uXG4gICAgICAgIClcbiAgICAgICAgLnNldEluKFxuICAgICAgICAgIFsnc2VjdGlvbnMnLCAnc2VjdGlvbnNCeVVSSScsIHNlY3Rpb24ucmVmZXJlbmNlVVJJXSxcbiAgICAgICAgICBuZXdTZWN0aW9uXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEZpbGUgJHtmaWxlLmJhc2V9IGNvdWxkIG5vdCBiZSByZWFkYCk7XG4gICAgcmV0dXJuIHN0b3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgcmVtb3ZhbCBvZiBhbiBITVRMIHRlbXBsYXRlXG4gICAqXG4gICAqIEBmdW5jdGlvbiBkZWxldGVUZW1wbGF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZXBhdGggLSBmaWxlcGF0aCBvZiBjaGFuZ2VkIGZpbGUgKGNvbWVzIGZyb20gZ2F6ZSlcbiAgICogQHBhcmFtIHtvYmplY3R9IHNlY3Rpb24gLSBjb250YWlucyBLU1Mgc2VjdGlvbiBkYXRhXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZVxuICAgKi9cbiAgZGVsZXRlVGVtcGxhdGUoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKSB7XG4gICAgY29uc3QgbmV3U2VjdGlvbiA9IHNlY3Rpb247XG5cbiAgICB1dGlscy5yZW1vdmVGaWxlKFxuICAgICAgbmV3U2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICAndGVtcGxhdGUnLFxuICAgICAgZmlsZXBhdGgsXG4gICAgICBzdG9yZVxuICAgICk7XG5cbiAgICBkZWxldGUgbmV3U2VjdGlvbi50ZW1wbGF0ZVBhdGg7XG5cbiAgICByZXR1cm4gc3RvcmVcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIHNlY3Rpb24ua3NzUGF0aF0sXG4gICAgICAgIG5ld1NlY3Rpb25cbiAgICAgIClcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5VVJJJywgc2VjdGlvbi5yZWZlcmVuY2VVUkldLFxuICAgICAgICBuZXdTZWN0aW9uXG4gICAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgdXBkYXRlIGZvciBhIHByb3RvdHlwZSBmaWxlXG4gICAqXG4gICAqIEBmdW5jdGlvbiB1cGRhdGVQcm90b3R5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZVxuICAgKi9cbiAgdXBkYXRlUHJvdG90eXBlKGZpbGVwYXRoLCBzdG9yZSkge1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCAndXRmOCcpO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIGNvbnN0IHJlcXVpcmVQYXRoID0gdXRpbHMud3JpdGVGaWxlKFxuICAgICAgICBmaWxlLm5hbWUsXG4gICAgICAgICdwcm90b3R5cGUnLFxuICAgICAgICBmaWxlcGF0aCxcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgc3RvcmVcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBzdG9yZS5zZXRJbihcbiAgICAgICAgICBbJ3Byb3RvdHlwZXMnLCBmaWxlLm5hbWVdLFxuICAgICAgICAgIHJlcXVpcmVQYXRoXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYEZpbGUgJHtmaWxlLmJhc2V9IGNvdWxkIG5vdCBiZSByZWFkYCk7XG4gICAgcmV0dXJuIHN0b3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgcmVtb3ZhbCBvZiBhIHByb3RvdHlwZSBmaWxlXG4gICAqXG4gICAqIEBmdW5jdGlvbiBkZWxldGVQcm90b3R5cGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZVxuICAgKi9cbiAgZGVsZXRlUHJvdG90eXBlKGZpbGVwYXRoLCBzdG9yZSkge1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCByZXF1aXJlUGF0aCA9IHV0aWxzLnJlbW92ZUZpbGUoXG4gICAgICBmaWxlLm5hbWUsXG4gICAgICAncHJvdG90eXBlJyxcbiAgICAgIGZpbGVwYXRoLFxuICAgICAgc3RvcmVcbiAgICApO1xuXG4gICAgcmV0dXJuIHN0b3JlLnNldEluKFxuICAgICAgICBbJ3Byb3RvdHlwZXMnLCBmaWxlLm5hbWVdLFxuICAgICAgICByZXF1aXJlUGF0aFxuICAgICAgKTtcbiAgfSxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2NsaS9oYW5kbGUtaHRtbC5qcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFJQTtBQWpJQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ "./src/cli/handle-kss.js":
/* no static exports found */
/* all exports used */
/*!*******************************!*\
  !*** ./src/cli/handle-kss.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.kssHandler = undefined;\n\nvar _utils = __webpack_require__(/*! ./utils */ \"./src/cli/utils.js\");\n\nvar _handleTemplates = __webpack_require__(/*! ./handle-templates */ \"./src/cli/handle-templates.js\");\n\nvar _requireTemplates = __webpack_require__(/*! ./require-templates */ \"./src/cli/require-templates.js\");\n\nconst path = __webpack_require__(/*! path */ 0); /** @module cli/kss-handler */\n\nconst fs = __webpack_require__(/*! fs-extra */ 2);\nconst parse = __webpack_require__(/*! kss */ 8).parse;\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n/* eslint-disable */\nconst kssHandler = exports.kssHandler = {\n  /* eslint-enable */\n\n  /**\n   * Handle update of a KSS section\n   *\n   * @function updateKSS\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  updateKSS(filepath, store) {\n    const kssSource = fs.readFileSync(filepath, 'utf8');\n    const huron = store.get('config');\n    const oldSection = _utils.utils.getSection(filepath, false, store) || {};\n    const file = path.parse(filepath);\n    let newStore = store;\n\n    if (kssSource) {\n      const styleguide = parse(kssSource, huron.get('kssOptions'));\n\n      if (styleguide.data.sections.length) {\n        const section = _utils.utils.normalizeSectionData(styleguide.data.sections[0]);\n\n        if (section.reference && section.referenceURI) {\n          // Update or add section data\n          newStore = kssHandler.updateSectionData(filepath, section, oldSection, newStore);\n\n          // Remove old section data if reference URI has changed\n          if (oldSection && oldSection.referenceURI && oldSection.referenceURI !== section.referenceURI) {\n            newStore = this.unsetSection(oldSection, file, newStore, false);\n          }\n\n          (0, _requireTemplates.writeStore)(newStore);\n          console.log(chalk.green(`KSS source in ${ filepath } changed or added`));\n          return newStore;\n        }\n\n        console.log(chalk.magenta(`KSS section in ${ filepath } is missing a section reference`));\n        return newStore;\n      }\n\n      console.log(chalk.magenta(`No KSS found in ${ filepath }`));\n      return newStore;\n    }\n\n    if (oldSection) {\n      newStore = kssHandler.deleteKSS(filepath, oldSection, newStore);\n    }\n\n    console.log(chalk.red(`${ filepath } not found or empty`)); // eslint-disable-line no-console\n    return newStore;\n  },\n\n  /**\n   * Handle removal of a KSS section\n   *\n   * @function deleteKSS\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} section - KSS section data\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  deleteKSS(filepath, section, store) {\n    const file = path.parse(filepath);\n\n    if (section.reference && section.referenceURI) {\n      // Remove section data from memory store\n      return kssHandler.unsetSection(section, file, store, true);\n    }\n\n    return store;\n  },\n\n  /**\n   * Update the sections store with new data for a specific section\n   *\n   * @function updateSectionData\n   * @param {object} section - contains updated section data\n   * @param {string} kssPath - path to KSS section\n   * @param {object} store - memory store\n   * @return {object} updated data store\n   */\n  updateSectionData(kssPath, section, oldSection, store) {\n    const sectionFileInfo = path.parse(kssPath);\n    const dataFilepath = path.join(sectionFileInfo.dir, `${ sectionFileInfo.name }.json`);\n    const isInline = null !== section.markup.match(/<\\/[^>]*>/);\n    const newSort = kssHandler.sortSection(store.getIn(['sections', 'sorted']), section.reference, store.get('referenceDelimiter'));\n    const newSection = Object.assign({}, oldSection, section);\n    let newStore = store;\n\n    // Required for reference from templates and data\n    newSection.kssPath = kssPath;\n\n    if (isInline) {\n      // Set section value if inlineTempalte() returned a path\n      newStore = kssHandler.updateInlineTemplate(kssPath, oldSection, newSection, newStore);\n    } else {\n      // Remove inline template, if it exists\n      _utils.utils.removeFile(newSection.referenceURI, 'template', kssPath, store);\n      // Update markup and data fields\n      newStore = kssHandler.updateTemplateFields(sectionFileInfo, oldSection, newSection, newStore);\n    }\n\n    // Output section description\n    newStore = kssHandler.updateDescription(kssPath, oldSection, newSection, newStore);\n\n    // Output section data to a JSON file\n    newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection, dataFilepath);\n\n    // Update section sorting\n    return newStore.setIn(['sections', 'sorted'], newSort).setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);\n  },\n\n  /**\n   * Handle detection and output of inline templates, which is markup written\n   * in the KSS documentation itself as opposed to an external file\n   *\n   * @function updateInlineTemplate\n   * @param {string} oldSection - previous iteration of KSS data, if updated\n   * @param {object} section - KSS section data\n   * @return {object} updated data store with new template path info\n   */\n  updateInlineTemplate(filepath, oldSection, section, store) {\n    const newSection = section;\n    const newStore = store;\n\n    // If we have inline markup\n    if (this.fieldShouldOutput(oldSection, section, 'markup')) {\n      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, section.markup, store);\n      newSection.templateContent = section.markup;\n\n      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);\n    }\n\n    return newStore;\n  },\n\n  /**\n   * Handle output of section description\n   *\n   * @function updateDescription\n   * @param {string} oldSection - previous iteration of KSS data, if updated\n   * @param {object} section - KSS section data\n   * @return {object} updated data store with new descripton path info\n   */\n  updateDescription(filepath, oldSection, section, store) {\n    const newSection = section;\n    const newStore = store;\n\n    // If we don't have previous KSS or the KSS has been updated\n    if (this.fieldShouldOutput(oldSection, section, 'description')) {\n      // Write new description\n      newSection.descriptionPath = _utils.utils.writeFile(section.referenceURI, 'description', filepath, section.description, store);\n\n      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);\n    }\n\n    return newStore;\n  },\n\n  /**\n   * Handle Data and Markup fields\n   *\n   * @function updateTemplateFields\n   * @param {string} file - File data for KSS file from path.parse()\n   * @param {object} oldSection - outdated KSS data\n   * @param {object} section - KSS section data\n   * @param {object} store - memory store\n   * @return {object} KSS section data with updated asset paths\n   */\n  updateTemplateFields(file, oldSection, section, store) {\n    const kssPath = path.format(file);\n    const newSection = section;\n    let filepath = '';\n    let oldFilepath = '';\n    let newStore = store;\n\n    ['data', 'markup'].forEach(field => {\n      if (newSection[field]) {\n        if (oldSection[field]) {\n          oldFilepath = path.join(file.dir, oldSection[field]);\n          newStore = _handleTemplates.templateHandler.deleteTemplate(oldFilepath, oldSection, newStore);\n        }\n\n        filepath = path.join(file.dir, newSection[field]);\n        newStore = _handleTemplates.templateHandler.updateTemplate(filepath, newSection, newStore);\n      } else {\n        delete newSection[field];\n        newStore = newStore.setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);\n      }\n    });\n\n    return newStore;\n  },\n\n  /**\n   * Remove a section from the memory store\n   *\n   * @function unsetSection\n   * @param {object} section - contains updated section data\n   * @param {string} file - file object from path.parse()\n   * @param {object} store - memory store\n   * @param {bool} removed - has the file been removed or just the section information changed?\n   * @return {object} updated data store with new descripton path info\n   */\n  unsetSection(section, file, store, removed) {\n    const sorted = store.getIn(['sections', 'sorted']);\n    const kssPath = path.format(file);\n    const dataFilepath = path.join(file.dir, `${ file.name }.json`);\n    const isInline = section.markup && null !== section.markup.match(/<\\/[^>]*>/);\n    const newSort = kssHandler.unsortSection(sorted, section.reference, store.get('referenceDelimiter'));\n    let newStore = store;\n\n    // Remove old section data\n    _utils.utils.removeFile(section.referenceURI, 'section', dataFilepath, newStore);\n\n    // Remove associated inline template\n    if (isInline) {\n      _utils.utils.removeFile(section.referenceURI, 'template', kssPath, newStore);\n    }\n\n    // Remove description template\n    _utils.utils.removeFile(section.referenceURI, 'description', kssPath, newStore);\n\n    // Remove data from sectionsByPath if file has been removed\n    if (removed) {\n      newStore = newStore.deleteIn(['sections', 'sectionsByPath', kssPath]);\n    }\n\n    return newStore.deleteIn(['sections', 'sectionsByURI', section.referenceURI]).setIn(['sections', 'sorted'], newSort);\n  },\n\n  /**\n   * Sort sections and subsections\n   *\n   * @function sortSection\n   * @param {object} sorted - currently sorted sections\n   * @param {string} reference - reference URI of section to sort\n   * @return {object} updated data store with new descripton path info\n   */\n  sortSection(sorted, reference, delimiter) {\n    const parts = reference.split(delimiter);\n    const newSort = sorted[parts[0]] || {};\n    const newSorted = sorted;\n\n    if (1 < parts.length) {\n      const newParts = parts.filter((part, idx) => 0 !== idx);\n      newSorted[parts[0]] = kssHandler.sortSection(newSort, newParts.join(delimiter), delimiter);\n    } else {\n      newSorted[parts[0]] = newSort;\n    }\n\n    return newSorted;\n  },\n\n  /**\n   * Remove a section from the sorted sections\n   *\n   * @function unsortSection\n   * @param {object} sorted - currently sorted sections\n   * @param {string} reference - reference URI of section to sort\n   * @return {object} updated data store with new descripton path info\n   */\n  unsortSection(sorted, reference, delimiter) {\n    const parts = reference.split(delimiter);\n    const subsections = Object.keys(sorted[parts[0]]);\n    const newSorted = sorted;\n\n    if (subsections.length) {\n      if (1 < parts.length) {\n        const newParts = parts.filter((part, idx) => 0 !== idx);\n        newSorted[parts[0]] = kssHandler.unsortSection(newSorted[parts[0]], newParts.join(delimiter), delimiter);\n      }\n    } else {\n      delete newSorted[parts[0]];\n    }\n\n    return newSorted;\n  },\n\n  /**\n   * Compare a KSS field between old and new KSS data to see if we need to output\n   * a new module for that field\n   *\n   * @function fieldShouldOutput\n   * @param {object} oldSection - currently sorted sections\n   * @param {object} newSection - reference URI of section to sort\n   * @param {string} field - KSS field to check\n   * @return {bool} output a new module for the KSS field\n   */\n  fieldShouldOutput(oldSection, newSection, field) {\n    return oldSection && (oldSection[field] !== newSection[field] || oldSection.referenceURI !== newSection.referenceURI) || !oldSection;\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2hhbmRsZS1rc3MuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2NsaS9oYW5kbGUta3NzLmpzP2QyNzYiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBtb2R1bGUgY2xpL2tzcy1oYW5kbGVyICovXG5cbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZUhhbmRsZXIgfSBmcm9tICcuL2hhbmRsZS10ZW1wbGF0ZXMnO1xuaW1wb3J0IHsgd3JpdGVTdG9yZSB9IGZyb20gJy4vcmVxdWlyZS10ZW1wbGF0ZXMnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCdrc3MnKS5wYXJzZTtcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTsgLy8gQ29sb3JpemUgdGVybWluYWwgb3V0cHV0XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5leHBvcnQgY29uc3Qga3NzSGFuZGxlciA9IHtcbi8qIGVzbGludC1lbmFibGUgKi9cblxuICAvKipcbiAgICogSGFuZGxlIHVwZGF0ZSBvZiBhIEtTUyBzZWN0aW9uXG4gICAqXG4gICAqIEBmdW5jdGlvbiB1cGRhdGVLU1NcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZSAtIG1lbW9yeSBzdG9yZVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZVxuICAgKi9cbiAgdXBkYXRlS1NTKGZpbGVwYXRoLCBzdG9yZSkge1xuICAgIGNvbnN0IGtzc1NvdXJjZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCBodXJvbiA9IHN0b3JlLmdldCgnY29uZmlnJyk7XG4gICAgY29uc3Qgb2xkU2VjdGlvbiA9IHV0aWxzLmdldFNlY3Rpb24oZmlsZXBhdGgsIGZhbHNlLCBzdG9yZSkgfHwge307XG4gICAgY29uc3QgZmlsZSA9IHBhdGgucGFyc2UoZmlsZXBhdGgpO1xuICAgIGxldCBuZXdTdG9yZSA9IHN0b3JlO1xuXG4gICAgaWYgKGtzc1NvdXJjZSkge1xuICAgICAgY29uc3Qgc3R5bGVndWlkZSA9IHBhcnNlKGtzc1NvdXJjZSwgaHVyb24uZ2V0KCdrc3NPcHRpb25zJykpO1xuXG4gICAgICBpZiAoc3R5bGVndWlkZS5kYXRhLnNlY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBzZWN0aW9uID0gdXRpbHMubm9ybWFsaXplU2VjdGlvbkRhdGEoXG4gICAgICAgICAgc3R5bGVndWlkZS5kYXRhLnNlY3Rpb25zWzBdXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHNlY3Rpb24ucmVmZXJlbmNlICYmIHNlY3Rpb24ucmVmZXJlbmNlVVJJKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIG9yIGFkZCBzZWN0aW9uIGRhdGFcbiAgICAgICAgICBuZXdTdG9yZSA9IGtzc0hhbmRsZXIudXBkYXRlU2VjdGlvbkRhdGEoXG4gICAgICAgICAgICBmaWxlcGF0aCxcbiAgICAgICAgICAgIHNlY3Rpb24sXG4gICAgICAgICAgICBvbGRTZWN0aW9uLFxuICAgICAgICAgICAgbmV3U3RvcmVcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIG9sZCBzZWN0aW9uIGRhdGEgaWYgcmVmZXJlbmNlIFVSSSBoYXMgY2hhbmdlZFxuICAgICAgICAgIGlmIChvbGRTZWN0aW9uICYmXG4gICAgICAgICAgICBvbGRTZWN0aW9uLnJlZmVyZW5jZVVSSSAmJlxuICAgICAgICAgICAgb2xkU2VjdGlvbi5yZWZlcmVuY2VVUkkgIT09IHNlY3Rpb24ucmVmZXJlbmNlVVJJXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdTdG9yZSA9IHRoaXMudW5zZXRTZWN0aW9uKG9sZFNlY3Rpb24sIGZpbGUsIG5ld1N0b3JlLCBmYWxzZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JpdGVTdG9yZShuZXdTdG9yZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBjaGFsay5ncmVlbihcbiAgICAgICAgICAgICAgYEtTUyBzb3VyY2UgaW4gJHtmaWxlcGF0aH0gY2hhbmdlZCBvciBhZGRlZGBcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBuZXdTdG9yZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIGNoYWxrLm1hZ2VudGEoXG4gICAgICAgICAgICBgS1NTIHNlY3Rpb24gaW4gJHtmaWxlcGF0aH0gaXMgbWlzc2luZyBhIHNlY3Rpb24gcmVmZXJlbmNlYFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG5ld1N0b3JlO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5tYWdlbnRhKGBObyBLU1MgZm91bmQgaW4gJHtmaWxlcGF0aH1gKSk7XG4gICAgICByZXR1cm4gbmV3U3RvcmU7XG4gICAgfVxuXG4gICAgaWYgKG9sZFNlY3Rpb24pIHtcbiAgICAgIG5ld1N0b3JlID0ga3NzSGFuZGxlci5kZWxldGVLU1MoZmlsZXBhdGgsIG9sZFNlY3Rpb24sIG5ld1N0b3JlKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQoYCR7ZmlsZXBhdGh9IG5vdCBmb3VuZCBvciBlbXB0eWApKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuIG5ld1N0b3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgcmVtb3ZhbCBvZiBhIEtTUyBzZWN0aW9uXG4gICAqXG4gICAqIEBmdW5jdGlvbiBkZWxldGVLU1NcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cGRhdGVkIGRhdGEgc3RvcmVcbiAgICovXG4gIGRlbGV0ZUtTUyhmaWxlcGF0aCwgc2VjdGlvbiwgc3RvcmUpIHtcbiAgICBjb25zdCBmaWxlID0gcGF0aC5wYXJzZShmaWxlcGF0aCk7XG5cbiAgICBpZiAoc2VjdGlvbi5yZWZlcmVuY2UgJiYgc2VjdGlvbi5yZWZlcmVuY2VVUkkpIHtcbiAgICAgIC8vIFJlbW92ZSBzZWN0aW9uIGRhdGEgZnJvbSBtZW1vcnkgc3RvcmVcbiAgICAgIHJldHVybiBrc3NIYW5kbGVyLnVuc2V0U2VjdGlvbihzZWN0aW9uLCBmaWxlLCBzdG9yZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0b3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHNlY3Rpb25zIHN0b3JlIHdpdGggbmV3IGRhdGEgZm9yIGEgc3BlY2lmaWMgc2VjdGlvblxuICAgKlxuICAgKiBAZnVuY3Rpb24gdXBkYXRlU2VjdGlvbkRhdGFcbiAgICogQHBhcmFtIHtvYmplY3R9IHNlY3Rpb24gLSBjb250YWlucyB1cGRhdGVkIHNlY3Rpb24gZGF0YVxuICAgKiBAcGFyYW0ge3N0cmluZ30ga3NzUGF0aCAtIHBhdGggdG8gS1NTIHNlY3Rpb25cbiAgICogQHBhcmFtIHtvYmplY3R9IHN0b3JlIC0gbWVtb3J5IHN0b3JlXG4gICAqIEByZXR1cm4ge29iamVjdH0gdXBkYXRlZCBkYXRhIHN0b3JlXG4gICAqL1xuICB1cGRhdGVTZWN0aW9uRGF0YShrc3NQYXRoLCBzZWN0aW9uLCBvbGRTZWN0aW9uLCBzdG9yZSkge1xuICAgIGNvbnN0IHNlY3Rpb25GaWxlSW5mbyA9IHBhdGgucGFyc2Uoa3NzUGF0aCk7XG4gICAgY29uc3QgZGF0YUZpbGVwYXRoID0gcGF0aC5qb2luKFxuICAgICAgc2VjdGlvbkZpbGVJbmZvLmRpcixcbiAgICAgIGAke3NlY3Rpb25GaWxlSW5mby5uYW1lfS5qc29uYFxuICAgICk7XG4gICAgY29uc3QgaXNJbmxpbmUgPSBudWxsICE9PSBzZWN0aW9uLm1hcmt1cC5tYXRjaCgvPFxcL1tePl0qPi8pO1xuICAgIGNvbnN0IG5ld1NvcnQgPSBrc3NIYW5kbGVyLnNvcnRTZWN0aW9uKFxuICAgICAgc3RvcmUuZ2V0SW4oWydzZWN0aW9ucycsICdzb3J0ZWQnXSksXG4gICAgICBzZWN0aW9uLnJlZmVyZW5jZSxcbiAgICAgIHN0b3JlLmdldCgncmVmZXJlbmNlRGVsaW1pdGVyJylcbiAgICApO1xuICAgIGNvbnN0IG5ld1NlY3Rpb24gPSBPYmplY3QuYXNzaWduKHt9LCBvbGRTZWN0aW9uLCBzZWN0aW9uKTtcbiAgICBsZXQgbmV3U3RvcmUgPSBzdG9yZTtcblxuICAgIC8vIFJlcXVpcmVkIGZvciByZWZlcmVuY2UgZnJvbSB0ZW1wbGF0ZXMgYW5kIGRhdGFcbiAgICBuZXdTZWN0aW9uLmtzc1BhdGggPSBrc3NQYXRoO1xuXG4gICAgaWYgKGlzSW5saW5lKSB7XG4gICAgICAvLyBTZXQgc2VjdGlvbiB2YWx1ZSBpZiBpbmxpbmVUZW1wYWx0ZSgpIHJldHVybmVkIGEgcGF0aFxuICAgICAgbmV3U3RvcmUgPSBrc3NIYW5kbGVyLnVwZGF0ZUlubGluZVRlbXBsYXRlKFxuICAgICAgICBrc3NQYXRoLFxuICAgICAgICBvbGRTZWN0aW9uLFxuICAgICAgICBuZXdTZWN0aW9uLFxuICAgICAgICBuZXdTdG9yZVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVtb3ZlIGlubGluZSB0ZW1wbGF0ZSwgaWYgaXQgZXhpc3RzXG4gICAgICB1dGlscy5yZW1vdmVGaWxlKFxuICAgICAgICBuZXdTZWN0aW9uLnJlZmVyZW5jZVVSSSxcbiAgICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICAga3NzUGF0aCxcbiAgICAgICAgc3RvcmVcbiAgICAgICk7XG4gICAgICAvLyBVcGRhdGUgbWFya3VwIGFuZCBkYXRhIGZpZWxkc1xuICAgICAgbmV3U3RvcmUgPSBrc3NIYW5kbGVyLnVwZGF0ZVRlbXBsYXRlRmllbGRzKFxuICAgICAgICBzZWN0aW9uRmlsZUluZm8sXG4gICAgICAgIG9sZFNlY3Rpb24sXG4gICAgICAgIG5ld1NlY3Rpb24sXG4gICAgICAgIG5ld1N0b3JlXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE91dHB1dCBzZWN0aW9uIGRlc2NyaXB0aW9uXG4gICAgbmV3U3RvcmUgPSBrc3NIYW5kbGVyLnVwZGF0ZURlc2NyaXB0aW9uKFxuICAgICAga3NzUGF0aCxcbiAgICAgIG9sZFNlY3Rpb24sXG4gICAgICBuZXdTZWN0aW9uLFxuICAgICAgbmV3U3RvcmVcbiAgICApO1xuXG4gICAgLy8gT3V0cHV0IHNlY3Rpb24gZGF0YSB0byBhIEpTT04gZmlsZVxuICAgIG5ld1NlY3Rpb24uc2VjdGlvblBhdGggPSB1dGlscy53cml0ZVNlY3Rpb25EYXRhKFxuICAgICAgbmV3U3RvcmUsXG4gICAgICBuZXdTZWN0aW9uLFxuICAgICAgZGF0YUZpbGVwYXRoXG4gICAgKTtcblxuICAgIC8vIFVwZGF0ZSBzZWN0aW9uIHNvcnRpbmdcbiAgICByZXR1cm4gbmV3U3RvcmVcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzb3J0ZWQnXSxcbiAgICAgICAgbmV3U29ydFxuICAgICAgKVxuICAgICAgLnNldEluKFxuICAgICAgICBbJ3NlY3Rpb25zJywgJ3NlY3Rpb25zQnlQYXRoJywga3NzUGF0aF0sXG4gICAgICAgIG5ld1NlY3Rpb25cbiAgICAgIClcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5VVJJJywgc2VjdGlvbi5yZWZlcmVuY2VVUkldLFxuICAgICAgICBuZXdTZWN0aW9uXG4gICAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZGV0ZWN0aW9uIGFuZCBvdXRwdXQgb2YgaW5saW5lIHRlbXBsYXRlcywgd2hpY2ggaXMgbWFya3VwIHdyaXR0ZW5cbiAgICogaW4gdGhlIEtTUyBkb2N1bWVudGF0aW9uIGl0c2VsZiBhcyBvcHBvc2VkIHRvIGFuIGV4dGVybmFsIGZpbGVcbiAgICpcbiAgICogQGZ1bmN0aW9uIHVwZGF0ZUlubGluZVRlbXBsYXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvbGRTZWN0aW9uIC0gcHJldmlvdXMgaXRlcmF0aW9uIG9mIEtTUyBkYXRhLCBpZiB1cGRhdGVkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZSB3aXRoIG5ldyB0ZW1wbGF0ZSBwYXRoIGluZm9cbiAgICovXG4gIHVwZGF0ZUlubGluZVRlbXBsYXRlKGZpbGVwYXRoLCBvbGRTZWN0aW9uLCBzZWN0aW9uLCBzdG9yZSkge1xuICAgIGNvbnN0IG5ld1NlY3Rpb24gPSBzZWN0aW9uO1xuICAgIGNvbnN0IG5ld1N0b3JlID0gc3RvcmU7XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGlubGluZSBtYXJrdXBcbiAgICBpZiAodGhpcy5maWVsZFNob3VsZE91dHB1dChvbGRTZWN0aW9uLCBzZWN0aW9uLCAnbWFya3VwJykpIHtcbiAgICAgIG5ld1NlY3Rpb24udGVtcGxhdGVQYXRoID0gdXRpbHMud3JpdGVGaWxlKFxuICAgICAgICBzZWN0aW9uLnJlZmVyZW5jZVVSSSxcbiAgICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICAgZmlsZXBhdGgsXG4gICAgICAgIHNlY3Rpb24ubWFya3VwLFxuICAgICAgICBzdG9yZVxuICAgICAgKTtcbiAgICAgIG5ld1NlY3Rpb24udGVtcGxhdGVDb250ZW50ID0gc2VjdGlvbi5tYXJrdXA7XG5cbiAgICAgIHJldHVybiBuZXdTdG9yZVxuICAgICAgICAuc2V0SW4oXG4gICAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIGZpbGVwYXRoXSxcbiAgICAgICAgICBuZXdTZWN0aW9uXG4gICAgICAgIClcbiAgICAgICAgLnNldEluKFxuICAgICAgICAgIFsnc2VjdGlvbnMnLCAnc2VjdGlvbnNCeVVSSScsIHNlY3Rpb24ucmVmZXJlbmNlVVJJXSxcbiAgICAgICAgICBuZXdTZWN0aW9uXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld1N0b3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgb3V0cHV0IG9mIHNlY3Rpb24gZGVzY3JpcHRpb25cbiAgICpcbiAgICogQGZ1bmN0aW9uIHVwZGF0ZURlc2NyaXB0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvbGRTZWN0aW9uIC0gcHJldmlvdXMgaXRlcmF0aW9uIG9mIEtTUyBkYXRhLCBpZiB1cGRhdGVkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZSB3aXRoIG5ldyBkZXNjcmlwdG9uIHBhdGggaW5mb1xuICAgKi9cbiAgdXBkYXRlRGVzY3JpcHRpb24oZmlsZXBhdGgsIG9sZFNlY3Rpb24sIHNlY3Rpb24sIHN0b3JlKSB7XG4gICAgY29uc3QgbmV3U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgY29uc3QgbmV3U3RvcmUgPSBzdG9yZTtcblxuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgcHJldmlvdXMgS1NTIG9yIHRoZSBLU1MgaGFzIGJlZW4gdXBkYXRlZFxuICAgIGlmICh0aGlzLmZpZWxkU2hvdWxkT3V0cHV0KG9sZFNlY3Rpb24sIHNlY3Rpb24sICdkZXNjcmlwdGlvbicpKSB7XG4gICAgICAvLyBXcml0ZSBuZXcgZGVzY3JpcHRpb25cbiAgICAgIG5ld1NlY3Rpb24uZGVzY3JpcHRpb25QYXRoID0gdXRpbHMud3JpdGVGaWxlKFxuICAgICAgICBzZWN0aW9uLnJlZmVyZW5jZVVSSSxcbiAgICAgICAgJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgZmlsZXBhdGgsXG4gICAgICAgIHNlY3Rpb24uZGVzY3JpcHRpb24sXG4gICAgICAgIHN0b3JlXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gbmV3U3RvcmVcbiAgICAgICAgLnNldEluKFxuICAgICAgICAgIFsnc2VjdGlvbnMnLCAnc2VjdGlvbnNCeVBhdGgnLCBmaWxlcGF0aF0sXG4gICAgICAgICAgbmV3U2VjdGlvblxuICAgICAgICApXG4gICAgICAgIC5zZXRJbihcbiAgICAgICAgICBbJ3NlY3Rpb25zJywgJ3NlY3Rpb25zQnlVUkknLCBzZWN0aW9uLnJlZmVyZW5jZVVSSV0sXG4gICAgICAgICAgbmV3U2VjdGlvblxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdTdG9yZTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlIERhdGEgYW5kIE1hcmt1cCBmaWVsZHNcbiAgICpcbiAgICogQGZ1bmN0aW9uIHVwZGF0ZVRlbXBsYXRlRmllbGRzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIC0gRmlsZSBkYXRhIGZvciBLU1MgZmlsZSBmcm9tIHBhdGgucGFyc2UoKVxuICAgKiBAcGFyYW0ge29iamVjdH0gb2xkU2VjdGlvbiAtIG91dGRhdGVkIEtTUyBkYXRhXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAgICogQHJldHVybiB7b2JqZWN0fSBLU1Mgc2VjdGlvbiBkYXRhIHdpdGggdXBkYXRlZCBhc3NldCBwYXRoc1xuICAgKi9cbiAgdXBkYXRlVGVtcGxhdGVGaWVsZHMoZmlsZSwgb2xkU2VjdGlvbiwgc2VjdGlvbiwgc3RvcmUpIHtcbiAgICBjb25zdCBrc3NQYXRoID0gcGF0aC5mb3JtYXQoZmlsZSk7XG4gICAgY29uc3QgbmV3U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgbGV0IGZpbGVwYXRoID0gJyc7XG4gICAgbGV0IG9sZEZpbGVwYXRoID0gJyc7XG4gICAgbGV0IG5ld1N0b3JlID0gc3RvcmU7XG5cbiAgICBbJ2RhdGEnLCAnbWFya3VwJ10uZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICAgIGlmIChuZXdTZWN0aW9uW2ZpZWxkXSkge1xuICAgICAgICBpZiAob2xkU2VjdGlvbltmaWVsZF0pIHtcbiAgICAgICAgICBvbGRGaWxlcGF0aCA9IHBhdGguam9pbihmaWxlLmRpciwgb2xkU2VjdGlvbltmaWVsZF0pO1xuICAgICAgICAgIG5ld1N0b3JlID0gdGVtcGxhdGVIYW5kbGVyLmRlbGV0ZVRlbXBsYXRlKFxuICAgICAgICAgICAgb2xkRmlsZXBhdGgsXG4gICAgICAgICAgICBvbGRTZWN0aW9uLFxuICAgICAgICAgICAgbmV3U3RvcmVcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZmlsZXBhdGggPSBwYXRoLmpvaW4oZmlsZS5kaXIsIG5ld1NlY3Rpb25bZmllbGRdKTtcbiAgICAgICAgbmV3U3RvcmUgPSB0ZW1wbGF0ZUhhbmRsZXIudXBkYXRlVGVtcGxhdGUoXG4gICAgICAgICAgZmlsZXBhdGgsXG4gICAgICAgICAgbmV3U2VjdGlvbixcbiAgICAgICAgICBuZXdTdG9yZVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIG5ld1NlY3Rpb25bZmllbGRdO1xuICAgICAgICBuZXdTdG9yZSA9IG5ld1N0b3JlXG4gICAgICAgICAgLnNldEluKFxuICAgICAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIGtzc1BhdGhdLFxuICAgICAgICAgICAgbmV3U2VjdGlvblxuICAgICAgICAgIClcbiAgICAgICAgICAuc2V0SW4oXG4gICAgICAgICAgICBbJ3NlY3Rpb25zJywgJ3NlY3Rpb25zQnlVUkknLCBuZXdTZWN0aW9uLnJlZmVyZW5jZVVSSV0sXG4gICAgICAgICAgICBuZXdTZWN0aW9uXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXdTdG9yZTtcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGEgc2VjdGlvbiBmcm9tIHRoZSBtZW1vcnkgc3RvcmVcbiAgICpcbiAgICogQGZ1bmN0aW9uIHVuc2V0U2VjdGlvblxuICAgKiBAcGFyYW0ge29iamVjdH0gc2VjdGlvbiAtIGNvbnRhaW5zIHVwZGF0ZWQgc2VjdGlvbiBkYXRhXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIC0gZmlsZSBvYmplY3QgZnJvbSBwYXRoLnBhcnNlKClcbiAgICogQHBhcmFtIHtvYmplY3R9IHN0b3JlIC0gbWVtb3J5IHN0b3JlXG4gICAqIEBwYXJhbSB7Ym9vbH0gcmVtb3ZlZCAtIGhhcyB0aGUgZmlsZSBiZWVuIHJlbW92ZWQgb3IganVzdCB0aGUgc2VjdGlvbiBpbmZvcm1hdGlvbiBjaGFuZ2VkP1xuICAgKiBAcmV0dXJuIHtvYmplY3R9IHVwZGF0ZWQgZGF0YSBzdG9yZSB3aXRoIG5ldyBkZXNjcmlwdG9uIHBhdGggaW5mb1xuICAgKi9cbiAgdW5zZXRTZWN0aW9uKHNlY3Rpb24sIGZpbGUsIHN0b3JlLCByZW1vdmVkKSB7XG4gICAgY29uc3Qgc29ydGVkID0gc3RvcmUuZ2V0SW4oWydzZWN0aW9ucycsICdzb3J0ZWQnXSk7XG4gICAgY29uc3Qga3NzUGF0aCA9IHBhdGguZm9ybWF0KGZpbGUpO1xuICAgIGNvbnN0IGRhdGFGaWxlcGF0aCA9IHBhdGguam9pbihmaWxlLmRpciwgYCR7ZmlsZS5uYW1lfS5qc29uYCk7XG4gICAgY29uc3QgaXNJbmxpbmUgPSBzZWN0aW9uLm1hcmt1cCAmJlxuICAgICAgbnVsbCAhPT0gc2VjdGlvbi5tYXJrdXAubWF0Y2goLzxcXC9bXj5dKj4vKTtcbiAgICBjb25zdCBuZXdTb3J0ID0ga3NzSGFuZGxlci51bnNvcnRTZWN0aW9uKFxuICAgICAgc29ydGVkLFxuICAgICAgc2VjdGlvbi5yZWZlcmVuY2UsXG4gICAgICBzdG9yZS5nZXQoJ3JlZmVyZW5jZURlbGltaXRlcicpXG4gICAgKTtcbiAgICBsZXQgbmV3U3RvcmUgPSBzdG9yZTtcblxuICAgIC8vIFJlbW92ZSBvbGQgc2VjdGlvbiBkYXRhXG4gICAgdXRpbHMucmVtb3ZlRmlsZShcbiAgICAgIHNlY3Rpb24ucmVmZXJlbmNlVVJJLFxuICAgICAgJ3NlY3Rpb24nLFxuICAgICAgZGF0YUZpbGVwYXRoLFxuICAgICAgbmV3U3RvcmVcbiAgICApO1xuXG4gICAgIC8vIFJlbW92ZSBhc3NvY2lhdGVkIGlubGluZSB0ZW1wbGF0ZVxuICAgIGlmIChpc0lubGluZSkge1xuICAgICAgdXRpbHMucmVtb3ZlRmlsZShzZWN0aW9uLnJlZmVyZW5jZVVSSSwgJ3RlbXBsYXRlJywga3NzUGF0aCwgbmV3U3RvcmUpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBkZXNjcmlwdGlvbiB0ZW1wbGF0ZVxuICAgIHV0aWxzLnJlbW92ZUZpbGUoc2VjdGlvbi5yZWZlcmVuY2VVUkksICdkZXNjcmlwdGlvbicsIGtzc1BhdGgsIG5ld1N0b3JlKTtcblxuICAgIC8vIFJlbW92ZSBkYXRhIGZyb20gc2VjdGlvbnNCeVBhdGggaWYgZmlsZSBoYXMgYmVlbiByZW1vdmVkXG4gICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgIG5ld1N0b3JlID0gbmV3U3RvcmUuZGVsZXRlSW4oWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIGtzc1BhdGhdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U3RvcmVcbiAgICAgIC5kZWxldGVJbihbJ3NlY3Rpb25zJywgJ3NlY3Rpb25zQnlVUkknLCBzZWN0aW9uLnJlZmVyZW5jZVVSSV0pXG4gICAgICAuc2V0SW4oWydzZWN0aW9ucycsICdzb3J0ZWQnXSwgbmV3U29ydCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNvcnQgc2VjdGlvbnMgYW5kIHN1YnNlY3Rpb25zXG4gICAqXG4gICAqIEBmdW5jdGlvbiBzb3J0U2VjdGlvblxuICAgKiBAcGFyYW0ge29iamVjdH0gc29ydGVkIC0gY3VycmVudGx5IHNvcnRlZCBzZWN0aW9uc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVmZXJlbmNlIC0gcmVmZXJlbmNlIFVSSSBvZiBzZWN0aW9uIHRvIHNvcnRcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cGRhdGVkIGRhdGEgc3RvcmUgd2l0aCBuZXcgZGVzY3JpcHRvbiBwYXRoIGluZm9cbiAgICovXG4gIHNvcnRTZWN0aW9uKHNvcnRlZCwgcmVmZXJlbmNlLCBkZWxpbWl0ZXIpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHJlZmVyZW5jZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgIGNvbnN0IG5ld1NvcnQgPSBzb3J0ZWRbcGFydHNbMF1dIHx8IHt9O1xuICAgIGNvbnN0IG5ld1NvcnRlZCA9IHNvcnRlZDtcblxuICAgIGlmICgxIDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBuZXdQYXJ0cyA9IHBhcnRzLmZpbHRlcigocGFydCwgaWR4KSA9PiAwICE9PSBpZHgpO1xuICAgICAgbmV3U29ydGVkW3BhcnRzWzBdXSA9IGtzc0hhbmRsZXIuc29ydFNlY3Rpb24oXG4gICAgICAgIG5ld1NvcnQsXG4gICAgICAgIG5ld1BhcnRzLmpvaW4oZGVsaW1pdGVyKSxcbiAgICAgICAgZGVsaW1pdGVyXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdTb3J0ZWRbcGFydHNbMF1dID0gbmV3U29ydDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U29ydGVkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzZWN0aW9uIGZyb20gdGhlIHNvcnRlZCBzZWN0aW9uc1xuICAgKlxuICAgKiBAZnVuY3Rpb24gdW5zb3J0U2VjdGlvblxuICAgKiBAcGFyYW0ge29iamVjdH0gc29ydGVkIC0gY3VycmVudGx5IHNvcnRlZCBzZWN0aW9uc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVmZXJlbmNlIC0gcmVmZXJlbmNlIFVSSSBvZiBzZWN0aW9uIHRvIHNvcnRcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cGRhdGVkIGRhdGEgc3RvcmUgd2l0aCBuZXcgZGVzY3JpcHRvbiBwYXRoIGluZm9cbiAgICovXG4gIHVuc29ydFNlY3Rpb24oc29ydGVkLCByZWZlcmVuY2UsIGRlbGltaXRlcikge1xuICAgIGNvbnN0IHBhcnRzID0gcmVmZXJlbmNlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgY29uc3Qgc3Vic2VjdGlvbnMgPSBPYmplY3Qua2V5cyhzb3J0ZWRbcGFydHNbMF1dKTtcbiAgICBjb25zdCBuZXdTb3J0ZWQgPSBzb3J0ZWQ7XG5cbiAgICBpZiAoc3Vic2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgICBpZiAoMSA8IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBuZXdQYXJ0cyA9IHBhcnRzLmZpbHRlcigocGFydCwgaWR4KSA9PiAwICE9PSBpZHgpO1xuICAgICAgICBuZXdTb3J0ZWRbcGFydHNbMF1dID0ga3NzSGFuZGxlci51bnNvcnRTZWN0aW9uKFxuICAgICAgICAgIG5ld1NvcnRlZFtwYXJ0c1swXV0sXG4gICAgICAgICAgbmV3UGFydHMuam9pbihkZWxpbWl0ZXIpLFxuICAgICAgICAgIGRlbGltaXRlclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbmV3U29ydGVkW3BhcnRzWzBdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U29ydGVkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDb21wYXJlIGEgS1NTIGZpZWxkIGJldHdlZW4gb2xkIGFuZCBuZXcgS1NTIGRhdGEgdG8gc2VlIGlmIHdlIG5lZWQgdG8gb3V0cHV0XG4gICAqIGEgbmV3IG1vZHVsZSBmb3IgdGhhdCBmaWVsZFxuICAgKlxuICAgKiBAZnVuY3Rpb24gZmllbGRTaG91bGRPdXRwdXRcbiAgICogQHBhcmFtIHtvYmplY3R9IG9sZFNlY3Rpb24gLSBjdXJyZW50bHkgc29ydGVkIHNlY3Rpb25zXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBuZXdTZWN0aW9uIC0gcmVmZXJlbmNlIFVSSSBvZiBzZWN0aW9uIHRvIHNvcnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpZWxkIC0gS1NTIGZpZWxkIHRvIGNoZWNrXG4gICAqIEByZXR1cm4ge2Jvb2x9IG91dHB1dCBhIG5ldyBtb2R1bGUgZm9yIHRoZSBLU1MgZmllbGRcbiAgICovXG4gIGZpZWxkU2hvdWxkT3V0cHV0KG9sZFNlY3Rpb24sIG5ld1NlY3Rpb24sIGZpZWxkKSB7XG4gICAgcmV0dXJuIChvbGRTZWN0aW9uICYmXG4gICAgICAgIChvbGRTZWN0aW9uW2ZpZWxkXSAhPT0gbmV3U2VjdGlvbltmaWVsZF0gfHxcbiAgICAgICAgb2xkU2VjdGlvbi5yZWZlcmVuY2VVUkkgIT09IG5ld1NlY3Rpb24ucmVmZXJlbmNlVVJJKVxuICAgICAgKSB8fFxuICAgICAgISBvbGRTZWN0aW9uO1xuICB9LFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvY2xpL2hhbmRsZS1rc3MuanMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTtBQUNBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FBU0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQWFBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FBVUE7QUFDQTtBQUtBO0FBdGFBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }),

/***/ "./src/cli/handle-templates.js":
/* no static exports found */
/* all exports used */
/*!*************************************!*\
  !*** ./src/cli/handle-templates.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.templateHandler = undefined;\n\nvar _utils = __webpack_require__(/*! ./utils */ \"./src/cli/utils.js\");\n\nconst path = __webpack_require__(/*! path */ 0); /** @module cli/template-handler */\n\nconst fs = __webpack_require__(/*! fs-extra */ 2);\nconst chalk = __webpack_require__(/*! chalk */ 1);\n\n/* eslint-disable */\nconst templateHandler = exports.templateHandler = {\n  /* eslint-enable */\n  /**\n   * Handle update of a template or data (json) file\n   *\n   * @function updateTemplate\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} section - contains KSS section data\n   * @param {object} store - memory store\n   * @return {object} updated memory store\n   */\n  updateTemplate(filepath, section, store) {\n    const file = path.parse(filepath);\n    const pairPath = _utils.utils.getTemplateDataPair(file, section, store);\n    const type = '.json' === file.ext ? 'data' : 'template';\n    const newSection = section;\n    const newStore = store;\n    let content = false;\n\n    try {\n      content = fs.readFileSync(filepath, 'utf8');\n    } catch (e) {\n      console.log(chalk.red(`${ filepath } does not exist`));\n    }\n\n    if (content) {\n      const requirePath = _utils.utils.writeFile(newSection.referenceURI, type, filepath, content, newStore);\n      newSection[`${ type }Path`] = requirePath;\n\n      if ('template' === type) {\n        newSection.templateContent = content;\n\n        // Rewrite section data with template content\n        newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection);\n      }\n\n      return newStore.setIn(['templates', requirePath], pairPath).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);\n    }\n\n    return newStore;\n  },\n\n  /**\n   * Handle removal of a template or data (json) file\n   *\n   * @function deleteTemplate\n   * @param {string} filepath - filepath of changed file (comes from gaze)\n   * @param {object} section - contains KSS section data\n   * @param {object} store - memory store\n   * @return {object} updated memory store\n   */\n  deleteTemplate(filepath, section, store) {\n    const file = path.parse(filepath);\n    const type = '.json' === file.ext ? 'data' : 'template';\n    const newSection = section;\n    const newStore = store;\n\n    // Remove partner\n    const requirePath = _utils.utils.removeFile(newSection.referenceURI, type, filepath, newStore);\n    delete newSection[`${ type }Path`];\n\n    return newStore.deleteIn(['templates', requirePath]).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2hhbmRsZS10ZW1wbGF0ZXMuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2NsaS9oYW5kbGUtdGVtcGxhdGVzLmpzP2RkZjkiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBtb2R1bGUgY2xpL3RlbXBsYXRlLWhhbmRsZXIgKi9cbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5leHBvcnQgY29uc3QgdGVtcGxhdGVIYW5kbGVyID0ge1xuLyogZXNsaW50LWVuYWJsZSAqL1xuICAvKipcbiAgICogSGFuZGxlIHVwZGF0ZSBvZiBhIHRlbXBsYXRlIG9yIGRhdGEgKGpzb24pIGZpbGVcbiAgICpcbiAgICogQGZ1bmN0aW9uIHVwZGF0ZVRlbXBsYXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlcGF0aCAtIGZpbGVwYXRoIG9mIGNoYW5nZWQgZmlsZSAoY29tZXMgZnJvbSBnYXplKVxuICAgKiBAcGFyYW0ge29iamVjdH0gc2VjdGlvbiAtIGNvbnRhaW5zIEtTUyBzZWN0aW9uIGRhdGFcbiAgICogQHBhcmFtIHtvYmplY3R9IHN0b3JlIC0gbWVtb3J5IHN0b3JlXG4gICAqIEByZXR1cm4ge29iamVjdH0gdXBkYXRlZCBtZW1vcnkgc3RvcmVcbiAgICovXG4gIHVwZGF0ZVRlbXBsYXRlKGZpbGVwYXRoLCBzZWN0aW9uLCBzdG9yZSkge1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCBwYWlyUGF0aCA9IHV0aWxzLmdldFRlbXBsYXRlRGF0YVBhaXIoZmlsZSwgc2VjdGlvbiwgc3RvcmUpO1xuICAgIGNvbnN0IHR5cGUgPSAnLmpzb24nID09PSBmaWxlLmV4dCA/ICdkYXRhJyA6ICd0ZW1wbGF0ZSc7XG4gICAgY29uc3QgbmV3U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgY29uc3QgbmV3U3RvcmUgPSBzdG9yZTtcbiAgICBsZXQgY29udGVudCA9IGZhbHNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZXBhdGgsICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKGAke2ZpbGVwYXRofSBkb2VzIG5vdCBleGlzdGApKTtcbiAgICB9XG5cbiAgICBpZiAoY29udGVudCkge1xuICAgICAgY29uc3QgcmVxdWlyZVBhdGggPSB1dGlscy53cml0ZUZpbGUoXG4gICAgICAgIG5ld1NlY3Rpb24ucmVmZXJlbmNlVVJJLFxuICAgICAgICB0eXBlLFxuICAgICAgICBmaWxlcGF0aCxcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgbmV3U3RvcmVcbiAgICAgICk7XG4gICAgICBuZXdTZWN0aW9uW2Ake3R5cGV9UGF0aGBdID0gcmVxdWlyZVBhdGg7XG5cbiAgICAgIGlmICgndGVtcGxhdGUnID09PSB0eXBlKSB7XG4gICAgICAgIG5ld1NlY3Rpb24udGVtcGxhdGVDb250ZW50ID0gY29udGVudDtcblxuICAgICAgICAvLyBSZXdyaXRlIHNlY3Rpb24gZGF0YSB3aXRoIHRlbXBsYXRlIGNvbnRlbnRcbiAgICAgICAgbmV3U2VjdGlvbi5zZWN0aW9uUGF0aCA9IHV0aWxzLndyaXRlU2VjdGlvbkRhdGEobmV3U3RvcmUsIG5ld1NlY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3U3RvcmVcbiAgICAgICAgLnNldEluKFxuICAgICAgICAgIFsndGVtcGxhdGVzJywgcmVxdWlyZVBhdGhdLFxuICAgICAgICAgIHBhaXJQYXRoXG4gICAgICAgIClcbiAgICAgICAgLnNldEluKFxuICAgICAgICAgIFsnc2VjdGlvbnMnLCAnc2VjdGlvbnNCeVBhdGgnLCBuZXdTZWN0aW9uLmtzc1BhdGhdLFxuICAgICAgICAgIG5ld1NlY3Rpb25cbiAgICAgICAgKVxuICAgICAgICAuc2V0SW4oXG4gICAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5VVJJJywgbmV3U2VjdGlvbi5yZWZlcmVuY2VVUkldLFxuICAgICAgICAgIG5ld1NlY3Rpb25cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U3RvcmU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSByZW1vdmFsIG9mIGEgdGVtcGxhdGUgb3IgZGF0YSAoanNvbikgZmlsZVxuICAgKlxuICAgKiBAZnVuY3Rpb24gZGVsZXRlVGVtcGxhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBmaWxlIChjb21lcyBmcm9tIGdhemUpXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gY29udGFpbnMgS1NTIHNlY3Rpb24gZGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAgICogQHJldHVybiB7b2JqZWN0fSB1cGRhdGVkIG1lbW9yeSBzdG9yZVxuICAgKi9cbiAgZGVsZXRlVGVtcGxhdGUoZmlsZXBhdGgsIHNlY3Rpb24sIHN0b3JlKSB7XG4gICAgY29uc3QgZmlsZSA9IHBhdGgucGFyc2UoZmlsZXBhdGgpO1xuICAgIGNvbnN0IHR5cGUgPSAnLmpzb24nID09PSBmaWxlLmV4dCA/ICdkYXRhJyA6ICd0ZW1wbGF0ZSc7XG4gICAgY29uc3QgbmV3U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgY29uc3QgbmV3U3RvcmUgPSBzdG9yZTtcblxuICAgIC8vIFJlbW92ZSBwYXJ0bmVyXG4gICAgY29uc3QgcmVxdWlyZVBhdGggPSB1dGlscy5yZW1vdmVGaWxlKFxuICAgICAgbmV3U2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICB0eXBlLFxuICAgICAgZmlsZXBhdGgsXG4gICAgICBuZXdTdG9yZVxuICAgICk7XG4gICAgZGVsZXRlIG5ld1NlY3Rpb25bYCR7dHlwZX1QYXRoYF07XG5cbiAgICByZXR1cm4gbmV3U3RvcmVcbiAgICAgIC5kZWxldGVJbihbJ3RlbXBsYXRlcycsIHJlcXVpcmVQYXRoXSlcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIG5ld1NlY3Rpb24ua3NzUGF0aF0sXG4gICAgICAgIG5ld1NlY3Rpb25cbiAgICAgIClcbiAgICAgIC5zZXRJbihcbiAgICAgICAgWydzZWN0aW9ucycsICdzZWN0aW9uc0J5VVJJJywgbmV3U2VjdGlvbi5yZWZlcmVuY2VVUkldLFxuICAgICAgICBuZXdTZWN0aW9uXG4gICAgICApO1xuICB9LFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvY2xpL2hhbmRsZS10ZW1wbGF0ZXMuanMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBVUE7QUE5RkEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/huron-cli.js":
/* no static exports found */
/* all exports used */
/*!******************************!*\
  !*** ./src/cli/huron-cli.js ***!
  \******************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _actions = __webpack_require__(/*! ./actions */ \"./src/cli/actions.js\");\n\nvar _requireTemplates = __webpack_require__(/*! ./require-templates */ \"./src/cli/require-templates.js\");\n\nvar _parseArgs = __webpack_require__(/*! ./parse-args */ \"./src/cli/parse-args.js\");\n\nvar _parseArgs2 = _interopRequireDefault(_parseArgs);\n\nvar _generateConfig = __webpack_require__(/*! ./generate-config */ \"./src/cli/generate-config.js\");\n\nvar _generateConfig2 = _interopRequireDefault(_generateConfig);\n\nvar _server = __webpack_require__(/*! ./server */ \"./src/cli/server.js\");\n\nvar _server2 = _interopRequireDefault(_server);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Modules\nconst path = __webpack_require__(/*! path */ 0); // Local imports\n\nconst Gaze = __webpack_require__(/*! gaze */ 5).Gaze;\nconst Immutable = __webpack_require__(/*! immutable */ 7);\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n// Merge Huron default webpack config with user config\nconst config = (0, _generateConfig2.default)();\n\n/**\n * Huron configuration object\n *\n * @global\n */\nconst huron = config.huron;\n\n// Make sure the kss option is represented as an array\nhuron.kss = Array.isArray(huron.kss) ? huron.kss : [huron.kss];\n\n/**\n * Available file extensions. Extensions should not include the leading '.'\n *\n * @global\n */\nconst extensions = [huron.kssExtension, huron.templates.extension, 'html', 'json'].map(extension => extension.replace('.', ''));\n\n// Create initial data structure\n/* eslint-disable */\n/**\n * Initial structure for immutable data store\n *\n * @global\n */\nconst dataStructure = Immutable.Map({\n  types: ['template', 'data', 'description', 'section', 'prototype', 'sections-template'],\n  config: Immutable.Map(config.huron),\n  sections: Immutable.Map({\n    sectionsByPath: Immutable.Map({}),\n    sectionsByURI: Immutable.Map({}),\n    sorted: {}\n  }),\n  templates: Immutable.Map({}),\n  prototypes: Immutable.Map({}),\n  sectionTemplatePath: '',\n  referenceDelimiter: '.'\n});\n/* eslint-enable */\n\n// Generate watch list for Gaze, start gaze\nconst gazeWatch = [];\n\n// Push KSS source directories and section template to Gaze\ngazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));\nhuron.kss.forEach(sourceDir => {\n  let gazeDir = sourceDir;\n\n  /* eslint-disable space-unary-ops */\n  if ('/' === sourceDir.slice(-1)) {\n    gazeDir = sourceDir.slice(0, -1);\n  }\n  /* eslint-enable space-unary-ops */\n\n  gazeWatch.push(`${ gazeDir }/**/*.+(${ extensions.join('|') })`);\n});\n\n/**\n * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON\n *\n * @global\n */\nconst gaze = new Gaze(gazeWatch);\n\n/**\n * Initialize data store with files from gaze and original data structure\n *\n * @global\n */\nconst store = (0, _actions.initFiles)(gaze.watched(), dataStructure);\n\n(0, _requireTemplates.requireTemplates)(store);\n(0, _requireTemplates.writeStore)(store);\n\nif (!_parseArgs2.default.production) {\n  /** @module cli/gaze */\n  let newStore = store;\n\n  /**\n   * Anonymous handler for Gaze 'changed' event indicating a file has changed\n   *\n   * @callback changed\n   * @listens gaze:changed\n   * @param {string} filepath - absolute path of changed file\n   */\n  gaze.on('changed', filepath => {\n    newStore = (0, _actions.updateFile)(filepath, newStore);\n    console.log(chalk.green(`${ filepath } updated!`));\n  });\n\n  /**\n   * Anonymous handler for Gaze 'added' event indicating a file has been added to the watched directories\n   *\n   * @callback added\n   * @listens gaze:added\n   * @param {string} filepath - absolute path of changed file\n   */\n  gaze.on('added', filepath => {\n    newStore = (0, _actions.updateFile)(filepath, newStore);\n    (0, _requireTemplates.writeStore)(newStore);\n    console.log(chalk.blue(`${ filepath } added!`));\n  });\n\n  /**\n   * Anonymous handler for Gaze 'renamed' event indicating a file has been renamed\n   *\n   * @callback renamed\n   * @listens gaze:renamed\n   * @param {string} filepath - absolute path of changed file\n   */\n  gaze.on('renamed', (newPath, oldPath) => {\n    newStore = (0, _actions.deleteFile)(oldPath, newStore);\n    newStore = (0, _actions.updateFile)(newPath, newStore);\n    (0, _requireTemplates.writeStore)(newStore);\n    console.log(chalk.blue(`${ newPath } added!`));\n  });\n\n  /**\n   * Anonymous handler for Gaze 'deleted' event indicating a file has been removed\n   *\n   * @callback deleted\n   * @listens gaze:deleted\n   * @param {string} filepath - absolute path of changed file\n   */\n  gaze.on('deleted', filepath => {\n    newStore = (0, _actions.deleteFile)(filepath, newStore);\n    (0, _requireTemplates.writeStore)(newStore);\n    console.log(chalk.red(`${ filepath } deleted`));\n  });\n} else {\n  gaze.close();\n}\n\n// Start webpack or build for production\n(0, _server2.default)(config);\n\nif (true) {\n  module.hot.accept();\n}//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL2h1cm9uLWNsaS5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvY2xpL2h1cm9uLWNsaS5qcz85N2I4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIExvY2FsIGltcG9ydHNcbmltcG9ydCB7IGluaXRGaWxlcywgdXBkYXRlRmlsZSwgZGVsZXRlRmlsZSB9IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQgeyByZXF1aXJlVGVtcGxhdGVzLCB3cml0ZVN0b3JlIH0gZnJvbSAnLi9yZXF1aXJlLXRlbXBsYXRlcyc7XG5pbXBvcnQgcHJvZ3JhbSBmcm9tICcuL3BhcnNlLWFyZ3MnO1xuaW1wb3J0IGdlbmVyYXRlQ29uZmlnIGZyb20gJy4vZ2VuZXJhdGUtY29uZmlnJztcbmltcG9ydCBzdGFydFdlYnBhY2sgZnJvbSAnLi9zZXJ2ZXInO1xuXG4vLyBNb2R1bGVzXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgR2F6ZSA9IHJlcXVpcmUoJ2dhemUnKS5HYXplO1xuY29uc3QgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7IC8vIENvbG9yaXplIHRlcm1pbmFsIG91dHB1dFxuXG4vLyBNZXJnZSBIdXJvbiBkZWZhdWx0IHdlYnBhY2sgY29uZmlnIHdpdGggdXNlciBjb25maWdcbmNvbnN0IGNvbmZpZyA9IGdlbmVyYXRlQ29uZmlnKCk7XG5cbi8qKlxuICogSHVyb24gY29uZmlndXJhdGlvbiBvYmplY3RcbiAqXG4gKiBAZ2xvYmFsXG4gKi9cbmNvbnN0IGh1cm9uID0gY29uZmlnLmh1cm9uO1xuXG4vLyBNYWtlIHN1cmUgdGhlIGtzcyBvcHRpb24gaXMgcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXlcbmh1cm9uLmtzcyA9IEFycmF5LmlzQXJyYXkoaHVyb24ua3NzKSA/XG4gIGh1cm9uLmtzcyA6XG4gIFtodXJvbi5rc3NdO1xuXG4vKipcbiAqIEF2YWlsYWJsZSBmaWxlIGV4dGVuc2lvbnMuIEV4dGVuc2lvbnMgc2hvdWxkIG5vdCBpbmNsdWRlIHRoZSBsZWFkaW5nICcuJ1xuICpcbiAqIEBnbG9iYWxcbiAqL1xuY29uc3QgZXh0ZW5zaW9ucyA9IFtcbiAgaHVyb24ua3NzRXh0ZW5zaW9uLFxuICBodXJvbi50ZW1wbGF0ZXMuZXh0ZW5zaW9uLFxuICAnaHRtbCcsXG4gICdqc29uJyxcbl0ubWFwKChleHRlbnNpb24pID0+IGV4dGVuc2lvbi5yZXBsYWNlKCcuJywgJycpKTtcblxuLy8gQ3JlYXRlIGluaXRpYWwgZGF0YSBzdHJ1Y3R1cmVcbi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIEluaXRpYWwgc3RydWN0dXJlIGZvciBpbW11dGFibGUgZGF0YSBzdG9yZVxuICpcbiAqIEBnbG9iYWxcbiAqL1xuY29uc3QgZGF0YVN0cnVjdHVyZSA9IEltbXV0YWJsZS5NYXAoe1xuICB0eXBlczogW1xuICAgICd0ZW1wbGF0ZScsXG4gICAgJ2RhdGEnLFxuICAgICdkZXNjcmlwdGlvbicsXG4gICAgJ3NlY3Rpb24nLFxuICAgICdwcm90b3R5cGUnLFxuICAgICdzZWN0aW9ucy10ZW1wbGF0ZScsXG4gIF0sXG4gIGNvbmZpZzogSW1tdXRhYmxlLk1hcChjb25maWcuaHVyb24pLFxuICBzZWN0aW9uczogSW1tdXRhYmxlLk1hcCh7XG4gICAgc2VjdGlvbnNCeVBhdGg6IEltbXV0YWJsZS5NYXAoe30pLFxuICAgIHNlY3Rpb25zQnlVUkk6IEltbXV0YWJsZS5NYXAoe30pLFxuICAgIHNvcnRlZDoge30sXG4gIH0pLFxuICB0ZW1wbGF0ZXM6IEltbXV0YWJsZS5NYXAoe30pLFxuICBwcm90b3R5cGVzOiBJbW11dGFibGUuTWFwKHt9KSxcbiAgc2VjdGlvblRlbXBsYXRlUGF0aDogJycsXG4gIHJlZmVyZW5jZURlbGltaXRlcjogJy4nLFxufSk7XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbi8vIEdlbmVyYXRlIHdhdGNoIGxpc3QgZm9yIEdhemUsIHN0YXJ0IGdhemVcbmNvbnN0IGdhemVXYXRjaCA9IFtdO1xuXG4vLyBQdXNoIEtTUyBzb3VyY2UgZGlyZWN0b3JpZXMgYW5kIHNlY3Rpb24gdGVtcGxhdGUgdG8gR2F6ZVxuZ2F6ZVdhdGNoLnB1c2gocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgaHVyb24uc2VjdGlvblRlbXBsYXRlKSk7XG5odXJvbi5rc3MuZm9yRWFjaCgoc291cmNlRGlyKSA9PiB7XG4gIGxldCBnYXplRGlyID0gc291cmNlRGlyO1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIHNwYWNlLXVuYXJ5LW9wcyAqL1xuICBpZiAoJy8nID09PSBzb3VyY2VEaXIuc2xpY2UoLTEpKSB7XG4gICAgZ2F6ZURpciA9IHNvdXJjZURpci5zbGljZSgwLCAtMSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBzcGFjZS11bmFyeS1vcHMgKi9cblxuICBnYXplV2F0Y2gucHVzaChcbiAgICBgJHtnYXplRGlyfS8qKi8qLisoJHtleHRlbnNpb25zLmpvaW4oJ3wnKX0pYFxuICApO1xufSk7XG5cbi8qKlxuICogR2F6ZSBpbnN0YW5jZSBmb3Igd2F0Y2hpbmcgYWxsIGZpbGVzLCBpbmNsdWRpbmcgS1NTLCBodG1sLCBoYnMvdGVtcGxhdGUsIGFuZCBKU09OXG4gKlxuICogQGdsb2JhbFxuICovXG5jb25zdCBnYXplID0gbmV3IEdhemUoZ2F6ZVdhdGNoKTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGRhdGEgc3RvcmUgd2l0aCBmaWxlcyBmcm9tIGdhemUgYW5kIG9yaWdpbmFsIGRhdGEgc3RydWN0dXJlXG4gKlxuICogQGdsb2JhbFxuICovXG5jb25zdCBzdG9yZSA9IGluaXRGaWxlcyhnYXplLndhdGNoZWQoKSwgZGF0YVN0cnVjdHVyZSk7XG5cbnJlcXVpcmVUZW1wbGF0ZXMoc3RvcmUpO1xud3JpdGVTdG9yZShzdG9yZSk7XG5cbmlmICghIHByb2dyYW0ucHJvZHVjdGlvbikge1xuICAvKiogQG1vZHVsZSBjbGkvZ2F6ZSAqL1xuICBsZXQgbmV3U3RvcmUgPSBzdG9yZTtcblxuICAvKipcbiAgICogQW5vbnltb3VzIGhhbmRsZXIgZm9yIEdhemUgJ2NoYW5nZWQnIGV2ZW50IGluZGljYXRpbmcgYSBmaWxlIGhhcyBjaGFuZ2VkXG4gICAqXG4gICAqIEBjYWxsYmFjayBjaGFuZ2VkXG4gICAqIEBsaXN0ZW5zIGdhemU6Y2hhbmdlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZXBhdGggLSBhYnNvbHV0ZSBwYXRoIG9mIGNoYW5nZWQgZmlsZVxuICAgKi9cbiAgZ2F6ZS5vbignY2hhbmdlZCcsIChmaWxlcGF0aCkgPT4ge1xuICAgIG5ld1N0b3JlID0gdXBkYXRlRmlsZShmaWxlcGF0aCwgbmV3U3RvcmUpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKGAke2ZpbGVwYXRofSB1cGRhdGVkIWApKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEFub255bW91cyBoYW5kbGVyIGZvciBHYXplICdhZGRlZCcgZXZlbnQgaW5kaWNhdGluZyBhIGZpbGUgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHdhdGNoZWQgZGlyZWN0b3JpZXNcbiAgICpcbiAgICogQGNhbGxiYWNrIGFkZGVkXG4gICAqIEBsaXN0ZW5zIGdhemU6YWRkZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gYWJzb2x1dGUgcGF0aCBvZiBjaGFuZ2VkIGZpbGVcbiAgICovXG4gIGdhemUub24oJ2FkZGVkJywgKGZpbGVwYXRoKSA9PiB7XG4gICAgbmV3U3RvcmUgPSB1cGRhdGVGaWxlKGZpbGVwYXRoLCBuZXdTdG9yZSk7XG4gICAgd3JpdGVTdG9yZShuZXdTdG9yZSk7XG4gICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZShgJHtmaWxlcGF0aH0gYWRkZWQhYCkpO1xuICB9KTtcblxuICAvKipcbiAgICogQW5vbnltb3VzIGhhbmRsZXIgZm9yIEdhemUgJ3JlbmFtZWQnIGV2ZW50IGluZGljYXRpbmcgYSBmaWxlIGhhcyBiZWVuIHJlbmFtZWRcbiAgICpcbiAgICogQGNhbGxiYWNrIHJlbmFtZWRcbiAgICogQGxpc3RlbnMgZ2F6ZTpyZW5hbWVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlcGF0aCAtIGFic29sdXRlIHBhdGggb2YgY2hhbmdlZCBmaWxlXG4gICAqL1xuICBnYXplLm9uKCdyZW5hbWVkJywgKG5ld1BhdGgsIG9sZFBhdGgpID0+IHtcbiAgICBuZXdTdG9yZSA9IGRlbGV0ZUZpbGUob2xkUGF0aCwgbmV3U3RvcmUpO1xuICAgIG5ld1N0b3JlID0gdXBkYXRlRmlsZShuZXdQYXRoLCBuZXdTdG9yZSk7XG4gICAgd3JpdGVTdG9yZShuZXdTdG9yZSk7XG4gICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZShgJHtuZXdQYXRofSBhZGRlZCFgKSk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBbm9ueW1vdXMgaGFuZGxlciBmb3IgR2F6ZSAnZGVsZXRlZCcgZXZlbnQgaW5kaWNhdGluZyBhIGZpbGUgaGFzIGJlZW4gcmVtb3ZlZFxuICAgKlxuICAgKiBAY2FsbGJhY2sgZGVsZXRlZFxuICAgKiBAbGlzdGVucyBnYXplOmRlbGV0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVwYXRoIC0gYWJzb2x1dGUgcGF0aCBvZiBjaGFuZ2VkIGZpbGVcbiAgICovXG4gIGdhemUub24oJ2RlbGV0ZWQnLCAoZmlsZXBhdGgpID0+IHtcbiAgICBuZXdTdG9yZSA9IGRlbGV0ZUZpbGUoZmlsZXBhdGgsIG5ld1N0b3JlKTtcbiAgICB3cml0ZVN0b3JlKG5ld1N0b3JlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQoYCR7ZmlsZXBhdGh9IGRlbGV0ZWRgKSk7XG4gIH0pO1xufSBlbHNlIHtcbiAgZ2F6ZS5jbG9zZSgpO1xufVxuXG4vLyBTdGFydCB3ZWJwYWNrIG9yIGJ1aWxkIGZvciBwcm9kdWN0aW9uXG5zdGFydFdlYnBhY2soY29uZmlnKTtcblxuaWYgKG1vZHVsZS5ob3QpIHtcbiAgbW9kdWxlLmhvdC5hY2NlcHQoKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvY2xpL2h1cm9uLWNsaS5qcyJdLCJtYXBwaW5ncyI6Ijs7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7OztBQUFBO0FBQ0E7OztBQUFBO0FBQ0E7Ozs7O0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7Ozs7O0FBS0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFsQkE7QUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTs7Ozs7QUFLQTtBQUNBO0FBQ0E7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/parse-args.js":
/* no static exports found */
/* all exports used */
/*!*******************************!*\
  !*** ./src/cli/parse-args.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n/** @module cli/parse-arguments */\n/* eslint-disable space-unary-ops */\n\n// Requires\n/** @global */\nconst program = __webpack_require__(/*! commander */ 4); // Easy program flags\nconst path = __webpack_require__(/*! path */ 0);\n\nexports.default = program;\n\n/**\n * Process huron CLI arguments\n *\n * @function parseArgs\n * @example node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production\n */\n\nfunction parseArgs() {\n  const envArg = {};\n\n  process.argv = process.argv.filter(arg => {\n    if (-1 !== arg.indexOf('--env')) {\n      const envParts = arg.split('.')[1].split('=');\n\n      envArg[envParts[0]] = envParts[1] || true;\n      return false;\n    }\n\n    return true;\n  });\n\n  program.version('1.0.1').option('-c, --huron-config [huronConfig]', '[huronConfig] for all huron options', path.resolve(__dirname, '../default-config/huron.config.js')).option('-w, --webpack-config [webpackConfig]', '[webpackConfig] for all webpack options', path.resolve(__dirname, '../default-config/webpack.config.js')).option('-p, --production', 'compile assets once for production').parse(process.argv);\n\n  program.env = envArg;\n}\n\nparseArgs();\n/* eslint-enable *///# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3BhcnNlLWFyZ3MuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2NsaS9wYXJzZS1hcmdzLmpzPzkzYWMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBtb2R1bGUgY2xpL3BhcnNlLWFyZ3VtZW50cyAqL1xuLyogZXNsaW50LWRpc2FibGUgc3BhY2UtdW5hcnktb3BzICovXG5cbi8vIFJlcXVpcmVzXG4vKiogQGdsb2JhbCAqL1xuY29uc3QgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpOyAvLyBFYXN5IHByb2dyYW0gZmxhZ3NcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmV4cG9ydCBkZWZhdWx0IHByb2dyYW07XG5cbi8qKlxuICogUHJvY2VzcyBodXJvbiBDTEkgYXJndW1lbnRzXG4gKlxuICogQGZ1bmN0aW9uIHBhcnNlQXJnc1xuICogQGV4YW1wbGUgbm9kZSBodXJvbi9kaXN0L2NsaS9odXJvbi1jbGkuanMgLS1jb25maWcgJ2NsaWVudC9jb25maWcvd2VicGFjay5jb25maWcuanMnIC0tcHJvZHVjdGlvblxuICovXG5mdW5jdGlvbiBwYXJzZUFyZ3MoKSB7XG4gIGNvbnN0IGVudkFyZyA9IHt9O1xuXG4gIHByb2Nlc3MuYXJndiA9IHByb2Nlc3MuYXJndi5maWx0ZXIoKGFyZykgPT4ge1xuICAgIGlmICgtMSAhPT0gYXJnLmluZGV4T2YoJy0tZW52JykpIHtcbiAgICAgIGNvbnN0IGVudlBhcnRzID0gYXJnXG4gICAgICAgIC5zcGxpdCgnLicpWzFdXG4gICAgICAgIC5zcGxpdCgnPScpO1xuXG4gICAgICBlbnZBcmdbZW52UGFydHNbMF1dID0gZW52UGFydHNbMV0gfHwgdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgcHJvZ3JhbS52ZXJzaW9uKCcxLjAuMScpXG4gICAgLm9wdGlvbihcbiAgICAgICctYywgLS1odXJvbi1jb25maWcgW2h1cm9uQ29uZmlnXScsXG4gICAgICAnW2h1cm9uQ29uZmlnXSBmb3IgYWxsIGh1cm9uIG9wdGlvbnMnLFxuICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlZmF1bHQtY29uZmlnL2h1cm9uLmNvbmZpZy5qcycpXG4gICAgKVxuICAgIC5vcHRpb24oXG4gICAgICAnLXcsIC0td2VicGFjay1jb25maWcgW3dlYnBhY2tDb25maWddJyxcbiAgICAgICdbd2VicGFja0NvbmZpZ10gZm9yIGFsbCB3ZWJwYWNrIG9wdGlvbnMnLFxuICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlZmF1bHQtY29uZmlnL3dlYnBhY2suY29uZmlnLmpzJylcbiAgICApXG4gICAgLm9wdGlvbignLXAsIC0tcHJvZHVjdGlvbicsICdjb21waWxlIGFzc2V0cyBvbmNlIGZvciBwcm9kdWN0aW9uJylcbiAgICAucGFyc2UocHJvY2Vzcy5hcmd2KTtcblxuICBwcm9ncmFtLmVudiA9IGVudkFyZztcbn1cblxucGFyc2VBcmdzKCk7XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2NsaS9wYXJzZS1hcmdzLmpzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/require-external.js":
/* no static exports found */
/* all exports used */
/*!*************************************!*\
  !*** ./src/cli/require-external.js ***!
  \*************************************/
/***/ (function(module, exports) {

eval("\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = requireExternal;\n// Necessary to remove require statement from Webpack processing preserve it in output\n/* eslint-disable import/no-dynamic-require, global-require */\nfunction requireExternal(requirePath) {\n  return require(requirePath);\n}\n/* eslint-enable *///# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3JlcXVpcmUtZXh0ZXJuYWwuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2NsaS9yZXF1aXJlLWV4dGVybmFsLmpzPzgzMmYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTmVjZXNzYXJ5IHRvIHJlbW92ZSByZXF1aXJlIHN0YXRlbWVudCBmcm9tIFdlYnBhY2sgcHJvY2Vzc2luZyBwcmVzZXJ2ZSBpdCBpbiBvdXRwdXRcbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmUsIGdsb2JhbC1yZXF1aXJlICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXF1aXJlRXh0ZXJuYWwocmVxdWlyZVBhdGgpIHtcbiAgcmV0dXJuIHJlcXVpcmUocmVxdWlyZVBhdGgpO1xufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9jbGkvcmVxdWlyZS1leHRlcm5hbC5qcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTtBQUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ "./src/cli/require-templates.js":
/* no static exports found */
/* all exports used */
/*!**************************************!*\
  !*** ./src/cli/require-templates.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n/** @module cli/require-templates */\n\nconst path = __webpack_require__(/*! path */ 0);\nconst fs = __webpack_require__(/*! fs-extra */ 2);\n\nconst cwd = process.cwd();\nconst huronScript = fs.readFileSync(path.join(__dirname, '../web/huron.js'), 'utf8');\n\n/**\n * Write code for requiring all generated huron assets\n * Note: prepended and appended code in this file should roughly follow es5 syntax for now,\n *  as it will not pass through the Huron internal babel build nor can we assume the user is\n *  working with babel.\n *\n * @function requireTemplates\n * @param {object} store - memory store\n */\nconst requireTemplates = exports.requireTemplates = function requireTemplates(store) {\n  const huron = store.get('config');\n  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');\n  const requireRegex = new RegExp(`\\\\.html|\\\\.json|\\\\${ huron.get('templates').extension }$`);\n  const requirePath = `'../${ huron.get('output') }'`;\n\n  // Initialize templates, js, css and HMR acceptance logic\n  const prepend = `\nvar store = require('./huron-store.js');\nvar assets = require.context(${ requirePath }, true, ${ requireRegex });\nvar modules = {};\n\nassets.keys().forEach(function(key) {\n  modules[key] = assets(key);\n});\n\nif (module.hot) {\n  module.hot.accept(\n    assets.id,\n    () => {\n      var newAssets = require.context(\n        ${ requirePath },\n        true,\n        ${ requireRegex }\n      );\n      var newModules = newAssets.keys()\n        .map((key) => {\n          return [key, newAssets(key)];\n        })\n        .filter((newModule) => {\n          return modules[newModule[0]] !== newModule[1];\n        });\n\n      updateStore(require('./huron-store.js'));\n\n      newModules.forEach((module) => {\n        modules[module[0]] = module[1];\n        hotReplace(module[0], module[1], modules);\n      });\n    }\n  );\n\n  module.hot.accept(\n    './huron-store.js',\n    () => {\n      updateStore(require('./huron-store.js'));\n    }\n  );\n}\\n`;\n\n  const append = `\nfunction hotReplace(key, module, modules) {\n  insert.modules = modules;\n  if (key === store.sectionTemplatePath) {\n    insert.cycleSections();\n  } else {\n    insert.inserted = [];\n    insert.loadModule(key, module, false);\n  }\n};\n\nfunction updateStore(newStore) {\n  insert.store = newStore;\n}\\n`;\n\n  // Write the contents of this script.\n  // @todo lint this file.\n  fs.outputFileSync(path.join(outputPath, 'huron.js'), `/*eslint-disable*/\\n\n${ prepend }\\n\\n${ huronScript }\\n\\n${ append }\\n\n/*eslint-enable*/\\n`);\n};\n\n/**\n * Output entire data store to a JS object and handle if any KSS data has changed\n *\n * @function writeStore\n * @param {object} store - memory store\n * @param {string} changed - filepath of changed KSS section, if applicable\n */\nconst writeStore = exports.writeStore = function writeStore(store) {\n  const huron = store.get('config');\n  const outputPath = path.join(cwd, huron.get('root'), 'huron-assets');\n\n  // Write updated data store\n  // @todo lint this file.\n  fs.outputFileSync(path.join(outputPath, 'huron-store.js'), `/*eslint-disable*/\n    module.exports = ${ JSON.stringify(store.toJSON()) }\n    /*eslint-disable*/\\n`);\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3JlcXVpcmUtdGVtcGxhdGVzLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3NyYy9jbGkvcmVxdWlyZS10ZW1wbGF0ZXMuanM/YjZkMCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSBjbGkvcmVxdWlyZS10ZW1wbGF0ZXMgKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcblxuY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbmNvbnN0IGh1cm9uU2NyaXB0ID0gZnMucmVhZEZpbGVTeW5jKFxuICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vd2ViL2h1cm9uLmpzJyksXG4gICd1dGY4J1xuKTtcblxuLyoqXG4gKiBXcml0ZSBjb2RlIGZvciByZXF1aXJpbmcgYWxsIGdlbmVyYXRlZCBodXJvbiBhc3NldHNcbiAqIE5vdGU6IHByZXBlbmRlZCBhbmQgYXBwZW5kZWQgY29kZSBpbiB0aGlzIGZpbGUgc2hvdWxkIHJvdWdobHkgZm9sbG93IGVzNSBzeW50YXggZm9yIG5vdyxcbiAqICBhcyBpdCB3aWxsIG5vdCBwYXNzIHRocm91Z2ggdGhlIEh1cm9uIGludGVybmFsIGJhYmVsIGJ1aWxkIG5vciBjYW4gd2UgYXNzdW1lIHRoZSB1c2VyIGlzXG4gKiAgd29ya2luZyB3aXRoIGJhYmVsLlxuICpcbiAqIEBmdW5jdGlvbiByZXF1aXJlVGVtcGxhdGVzXG4gKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAqL1xuZXhwb3J0IGNvbnN0IHJlcXVpcmVUZW1wbGF0ZXMgPSBmdW5jdGlvbiByZXF1aXJlVGVtcGxhdGVzKHN0b3JlKSB7XG4gIGNvbnN0IGh1cm9uID0gc3RvcmUuZ2V0KCdjb25maWcnKTtcbiAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjd2QsIGh1cm9uLmdldCgncm9vdCcpLCAnaHVyb24tYXNzZXRzJyk7XG4gIGNvbnN0IHJlcXVpcmVSZWdleCA9IG5ldyBSZWdFeHAoYFxcXFwuaHRtbHxcXFxcLmpzb258XFxcXCR7XG4gICAgaHVyb24uZ2V0KCd0ZW1wbGF0ZXMnKS5leHRlbnNpb25cbiAgfSRgKTtcbiAgY29uc3QgcmVxdWlyZVBhdGggPSBgJy4uLyR7aHVyb24uZ2V0KCdvdXRwdXQnKX0nYDtcblxuICAvLyBJbml0aWFsaXplIHRlbXBsYXRlcywganMsIGNzcyBhbmQgSE1SIGFjY2VwdGFuY2UgbG9naWNcbiAgY29uc3QgcHJlcGVuZCA9IGBcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4vaHVyb24tc3RvcmUuanMnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlLmNvbnRleHQoJHtyZXF1aXJlUGF0aH0sIHRydWUsICR7cmVxdWlyZVJlZ2V4fSk7XG52YXIgbW9kdWxlcyA9IHt9O1xuXG5hc3NldHMua2V5cygpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gIG1vZHVsZXNba2V5XSA9IGFzc2V0cyhrZXkpO1xufSk7XG5cbmlmIChtb2R1bGUuaG90KSB7XG4gIG1vZHVsZS5ob3QuYWNjZXB0KFxuICAgIGFzc2V0cy5pZCxcbiAgICAoKSA9PiB7XG4gICAgICB2YXIgbmV3QXNzZXRzID0gcmVxdWlyZS5jb250ZXh0KFxuICAgICAgICAke3JlcXVpcmVQYXRofSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgJHtyZXF1aXJlUmVnZXh9XG4gICAgICApO1xuICAgICAgdmFyIG5ld01vZHVsZXMgPSBuZXdBc3NldHMua2V5cygpXG4gICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgIHJldHVybiBba2V5LCBuZXdBc3NldHMoa2V5KV07XG4gICAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoKG5ld01vZHVsZSkgPT4ge1xuICAgICAgICAgIHJldHVybiBtb2R1bGVzW25ld01vZHVsZVswXV0gIT09IG5ld01vZHVsZVsxXTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHVwZGF0ZVN0b3JlKHJlcXVpcmUoJy4vaHVyb24tc3RvcmUuanMnKSk7XG5cbiAgICAgIG5ld01vZHVsZXMuZm9yRWFjaCgobW9kdWxlKSA9PiB7XG4gICAgICAgIG1vZHVsZXNbbW9kdWxlWzBdXSA9IG1vZHVsZVsxXTtcbiAgICAgICAgaG90UmVwbGFjZShtb2R1bGVbMF0sIG1vZHVsZVsxXSwgbW9kdWxlcyk7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG5cbiAgbW9kdWxlLmhvdC5hY2NlcHQoXG4gICAgJy4vaHVyb24tc3RvcmUuanMnLFxuICAgICgpID0+IHtcbiAgICAgIHVwZGF0ZVN0b3JlKHJlcXVpcmUoJy4vaHVyb24tc3RvcmUuanMnKSk7XG4gICAgfVxuICApO1xufVxcbmA7XG5cbiAgY29uc3QgYXBwZW5kID0gYFxuZnVuY3Rpb24gaG90UmVwbGFjZShrZXksIG1vZHVsZSwgbW9kdWxlcykge1xuICBpbnNlcnQubW9kdWxlcyA9IG1vZHVsZXM7XG4gIGlmIChrZXkgPT09IHN0b3JlLnNlY3Rpb25UZW1wbGF0ZVBhdGgpIHtcbiAgICBpbnNlcnQuY3ljbGVTZWN0aW9ucygpO1xuICB9IGVsc2Uge1xuICAgIGluc2VydC5pbnNlcnRlZCA9IFtdO1xuICAgIGluc2VydC5sb2FkTW9kdWxlKGtleSwgbW9kdWxlLCBmYWxzZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHVwZGF0ZVN0b3JlKG5ld1N0b3JlKSB7XG4gIGluc2VydC5zdG9yZSA9IG5ld1N0b3JlO1xufVxcbmA7XG5cbiAgLy8gV3JpdGUgdGhlIGNvbnRlbnRzIG9mIHRoaXMgc2NyaXB0LlxuICAvLyBAdG9kbyBsaW50IHRoaXMgZmlsZS5cbiAgZnMub3V0cHV0RmlsZVN5bmMoXG4gICAgcGF0aC5qb2luKG91dHB1dFBhdGgsICdodXJvbi5qcycpLFxuICAgIGAvKmVzbGludC1kaXNhYmxlKi9cXG5cbiR7cHJlcGVuZH1cXG5cXG4ke2h1cm9uU2NyaXB0fVxcblxcbiR7YXBwZW5kfVxcblxuLyplc2xpbnQtZW5hYmxlKi9cXG5gXG4gICk7XG59O1xuXG4vKipcbiAqIE91dHB1dCBlbnRpcmUgZGF0YSBzdG9yZSB0byBhIEpTIG9iamVjdCBhbmQgaGFuZGxlIGlmIGFueSBLU1MgZGF0YSBoYXMgY2hhbmdlZFxuICpcbiAqIEBmdW5jdGlvbiB3cml0ZVN0b3JlXG4gKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBtZW1vcnkgc3RvcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjaGFuZ2VkIC0gZmlsZXBhdGggb2YgY2hhbmdlZCBLU1Mgc2VjdGlvbiwgaWYgYXBwbGljYWJsZVxuICovXG5leHBvcnQgY29uc3Qgd3JpdGVTdG9yZSA9IGZ1bmN0aW9uIHdyaXRlU3RvcmUoc3RvcmUpIHtcbiAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGN3ZCwgaHVyb24uZ2V0KCdyb290JyksICdodXJvbi1hc3NldHMnKTtcblxuICAvLyBXcml0ZSB1cGRhdGVkIGRhdGEgc3RvcmVcbiAgLy8gQHRvZG8gbGludCB0aGlzIGZpbGUuXG4gIGZzLm91dHB1dEZpbGVTeW5jKFxuICAgIHBhdGguam9pbihvdXRwdXRQYXRoLCAnaHVyb24tc3RvcmUuanMnKSxcbiAgICBgLyplc2xpbnQtZGlzYWJsZSovXG4gICAgbW9kdWxlLmV4cG9ydHMgPSAke0pTT04uc3RyaW5naWZ5KHN0b3JlLnRvSlNPTigpKX1cbiAgICAvKmVzbGludC1kaXNhYmxlKi9cXG5gXG4gICk7XG59O1xuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2NsaS9yZXF1aXJlLXRlbXBsYXRlcy5qcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7Ozs7Ozs7OztBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBQUE7Ozs7Ozs7Ozs7OztBQUVBOztBQVlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZEE7QUFDQTtBQTBDQTs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFjQTtBQUNBO0FBQ0E7QUFFQTtBQUZBO0FBTUE7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUZBO0FBTUEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/cli/server.js":
/* no static exports found */
/* all exports used */
/*!***************************!*\
  !*** ./src/cli/server.js ***!
  \***************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = startWebpack;\n\nvar _parseArgs = __webpack_require__(/*! ./parse-args */ \"./src/cli/parse-args.js\");\n\nvar _parseArgs2 = _interopRequireDefault(_parseArgs);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nconst webpack = __webpack_require__(/*! webpack */ 3); /** @module cli/webpack-server */\n\nconst WebpackDevServer = __webpack_require__(/*! webpack-dev-server */ 10);\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n/**\n * Spin up webpack-dev-server or, if production flag is set, run webpack a single time\n *\n * @function startWebpack\n * @param {object} config - webpack configuration, preprocessed by {@link module:cli/generate-config generateConfig}\n * @see {@link module:cli/generate-config generateConfig}\n */\nfunction startWebpack(config) {\n  const huron = config.huron;\n  const webpackConfig = config.webpack;\n  const compiler = webpack(webpackConfig);\n\n  if (_parseArgs2.default.progress) {\n    compiler.apply(new webpack.ProgressPlugin((percentage, msg) => {\n      console.log(`${ percentage * 100 }% `, msg);\n    }));\n  }\n\n  if (_parseArgs2.default.production) {\n    compiler.run((err, stats) => {\n      const info = stats.toJson();\n\n      if (err) {\n        console.log(err);\n      }\n\n      if (stats.hasErrors()) {\n        console.error(chalk.red('Webpack encountered errors during compile: ', info.errors));\n      }\n\n      if (stats.hasWarnings()) {\n        console.error(chalk.yellow('Webpack encountered warnings during compile: ', info.warnings));\n      }\n    });\n  } else {\n    const server = new WebpackDevServer(compiler, {\n      hot: true,\n      quiet: false,\n      noInfo: false,\n      stats: {\n        colors: true,\n        hash: false,\n        version: false,\n        assets: false,\n        chunks: false,\n        modules: false,\n        reasons: false,\n        children: false,\n        source: false\n      },\n      contentBase: huron.root,\n      publicPath: `http://localhost:${ huron.port }/${ huron.root }`\n    });\n    server.listen(huron.port, 'localhost', err => {\n      if (err) {\n        return console.log(err);\n      }\n\n      console.log(`Listening at http://localhost:${ huron.port }/`);\n      return true;\n    });\n  }\n}//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3NlcnZlci5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9zcmMvY2xpL3NlcnZlci5qcz84MmUxIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKiBAbW9kdWxlIGNsaS93ZWJwYWNrLXNlcnZlciAqL1xuXG5pbXBvcnQgcHJvZ3JhbSBmcm9tICcuL3BhcnNlLWFyZ3MnO1xuXG5jb25zdCB3ZWJwYWNrID0gcmVxdWlyZSgnd2VicGFjaycpO1xuY29uc3QgV2VicGFja0RldlNlcnZlciA9IHJlcXVpcmUoJ3dlYnBhY2stZGV2LXNlcnZlcicpO1xuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpOyAvLyBDb2xvcml6ZSB0ZXJtaW5hbCBvdXRwdXRcblxuLyoqXG4gKiBTcGluIHVwIHdlYnBhY2stZGV2LXNlcnZlciBvciwgaWYgcHJvZHVjdGlvbiBmbGFnIGlzIHNldCwgcnVuIHdlYnBhY2sgYSBzaW5nbGUgdGltZVxuICpcbiAqIEBmdW5jdGlvbiBzdGFydFdlYnBhY2tcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3ZWJwYWNrIGNvbmZpZ3VyYXRpb24sIHByZXByb2Nlc3NlZCBieSB7QGxpbmsgbW9kdWxlOmNsaS9nZW5lcmF0ZS1jb25maWcgZ2VuZXJhdGVDb25maWd9XG4gKiBAc2VlIHtAbGluayBtb2R1bGU6Y2xpL2dlbmVyYXRlLWNvbmZpZyBnZW5lcmF0ZUNvbmZpZ31cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnRXZWJwYWNrKGNvbmZpZykge1xuICBjb25zdCBodXJvbiA9IGNvbmZpZy5odXJvbjtcbiAgY29uc3Qgd2VicGFja0NvbmZpZyA9IGNvbmZpZy53ZWJwYWNrO1xuICBjb25zdCBjb21waWxlciA9IHdlYnBhY2sod2VicGFja0NvbmZpZyk7XG5cbiAgaWYgKHByb2dyYW0ucHJvZ3Jlc3MpIHtcbiAgICBjb21waWxlci5hcHBseShcbiAgICAgIG5ldyB3ZWJwYWNrLlByb2dyZXNzUGx1Z2luKFxuICAgICAgICAocGVyY2VudGFnZSwgbXNnKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7KHBlcmNlbnRhZ2UgKiAxMDApfSUgYCwgbXNnKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBpZiAocHJvZ3JhbS5wcm9kdWN0aW9uKSB7XG4gICAgY29tcGlsZXIucnVuKChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICBjb25zdCBpbmZvID0gc3RhdHMudG9Kc29uKCk7XG5cbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRzLmhhc0Vycm9ycygpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgY2hhbGsucmVkKFxuICAgICAgICAgICAgJ1dlYnBhY2sgZW5jb3VudGVyZWQgZXJyb3JzIGR1cmluZyBjb21waWxlOiAnLFxuICAgICAgICAgICAgaW5mby5lcnJvcnNcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0cy5oYXNXYXJuaW5ncygpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgY2hhbGsueWVsbG93KFxuICAgICAgICAgICAgJ1dlYnBhY2sgZW5jb3VudGVyZWQgd2FybmluZ3MgZHVyaW5nIGNvbXBpbGU6ICcsIGluZm8ud2FybmluZ3NcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc2VydmVyID0gbmV3IFdlYnBhY2tEZXZTZXJ2ZXIoY29tcGlsZXIsIHtcbiAgICAgIGhvdDogdHJ1ZSxcbiAgICAgIHF1aWV0OiBmYWxzZSxcbiAgICAgIG5vSW5mbzogZmFsc2UsXG4gICAgICBzdGF0czoge1xuICAgICAgICBjb2xvcnM6IHRydWUsXG4gICAgICAgIGhhc2g6IGZhbHNlLFxuICAgICAgICB2ZXJzaW9uOiBmYWxzZSxcbiAgICAgICAgYXNzZXRzOiBmYWxzZSxcbiAgICAgICAgY2h1bmtzOiBmYWxzZSxcbiAgICAgICAgbW9kdWxlczogZmFsc2UsXG4gICAgICAgIHJlYXNvbnM6IGZhbHNlLFxuICAgICAgICBjaGlsZHJlbjogZmFsc2UsXG4gICAgICAgIHNvdXJjZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgY29udGVudEJhc2U6IGh1cm9uLnJvb3QsXG4gICAgICBwdWJsaWNQYXRoOiBgaHR0cDovL2xvY2FsaG9zdDoke2h1cm9uLnBvcnR9LyR7aHVyb24ucm9vdH1gLFxuICAgIH0pO1xuICAgIHNlcnZlci5saXN0ZW4oXG4gICAgICBodXJvbi5wb3J0LFxuICAgICAgJ2xvY2FsaG9zdCcsXG4gICAgICAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGBMaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDoke2h1cm9uLnBvcnR9L2ApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICApO1xuICB9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2NsaS9zZXJ2ZXIuanMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBZUE7QUFDQTtBQWRBO0FBQ0E7Ozs7O0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVEE7QUFXQTtBQUNBO0FBaEJBO0FBa0JBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }),

/***/ "./src/cli/utils.js":
/* no static exports found */
/* all exports used */
/*!**************************!*\
  !*** ./src/cli/utils.js ***!
  \**************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n/** @module cli/utilities */\n\nconst cwd = process.cwd(); // Current working directory\nconst path = __webpack_require__(/*! path */ 0);\nconst fs = __webpack_require__(/*! fs-extra */ 2);\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n// Exports\n/* eslint-disable */\nconst utils = exports.utils = {\n  /* eslint-enable */\n\n  /**\n   * Ensure predictable data structure for KSS section data\n   *\n   * @function normalizeSectionData\n   * @param {object} section - section data\n   * @return {object} section data\n   */\n  normalizeSectionData(section) {\n    const data = section.data || section;\n\n    if (!data.referenceURI || '' === data.referenceURI) {\n      data.referenceURI = section.referenceURI();\n    }\n\n    return data;\n  },\n\n  /**\n   * Ensure predictable data structure for KSS section data\n   *\n   * @function writeSectionData\n   * @param {object} store - data store\n   * @param {object} section - section data\n   * @param {string} sectionPath - output destination for section data file\n   */\n  writeSectionData(store, section, sectionPath = false) {\n    let outputPath = sectionPath;\n    let sectionFileInfo;\n\n    if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {\n      sectionFileInfo = path.parse(section.kssPath);\n      outputPath = path.join(sectionFileInfo.dir, `${ sectionFileInfo.name }.json`);\n    }\n\n    // Output section data\n    if (outputPath) {\n      return utils.writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);\n    }\n\n    console.warn( // eslint-disable-line no-console\n    chalk.red(`Failed to write section data for ${ section.referenceURI }`));\n    return false;\n  },\n\n  /**\n   * Find .json from a template file or vice versa\n   *\n   * @function getTemplateDataPair\n   * @param {object} file - file object from path.parse()\n   * @param {object} section - KSS section data\n   * @return {string} relative path to module JSON file\n   */\n  getTemplateDataPair(file, section, store) {\n    const huron = store.get('config');\n    const kssDir = utils.matchKssDir(file.dir, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const partnerType = '.json' === file.ext ? 'template' : 'data';\n      const partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';\n\n      const pairPath = path.join(componentPath, utils.generateFilename(section.referenceURI, partnerType, partnerExt, store));\n\n      return `./${ pairPath }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Normalize a section title for use as a filename\n   *\n   * @function normalizeHeader\n   * @param {string} header - section header extracted from KSS documentation\n   * @return {string} modified header, lowercase and words separated by dash\n   */\n  normalizeHeader(header) {\n    return header.toLowerCase().replace(/\\s?\\W\\s?/g, '-');\n  },\n\n  /**\n   * Wrap html in required template tags\n   *\n   * @function wrapMarkup\n   * @param {string} content - html or template markup\n   * @param {string} templateId - id of template (should be section reference)\n   * @return {string} modified HTML\n   */\n  wrapMarkup(content, templateId) {\n    return `<dom-module>\n<template id=\"${ templateId }\">\n${ content }\n</template>\n</dom-module>\\n`;\n  },\n\n  /**\n   * Generate a filename based on referenceURI, type and file object\n   *\n   * @function generateFilename\n   * @param  {string} id - The name of the file (with extension).\n   * @param  {string} type - the type of file output\n   * @param  {object} ext - file extension\n   * @param  {store} store - data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  generateFilename(id, type, ext, store) {\n    // Type of file and its corresponding extension(s)\n    const types = store.get('types');\n    const outputExt = '.scss' !== ext ? ext : '.html';\n\n    /* eslint-disable */\n    if (-1 === types.indexOf(type)) {\n      console.log(`Huron data ${ type } does not exist`);\n      return false;\n    }\n    /* eslint-enable */\n\n    return `${ id }-${ type }${ outputExt }`;\n  },\n\n  /**\n   * Copy an HTML file into the huron output directory.\n   *\n   * @function writeFile\n   * @param  {string} id - The name of the file (with extension).\n   * @param  {string} content - The content of the file to write.\n   * @param  {string} type - the type of file output\n   * @param  {object} store - The data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  writeFile(id, type, filepath, content, store) {\n    const huron = store.get('config');\n    const file = path.parse(filepath);\n    const filename = utils.generateFilename(id, type, file.ext, store);\n    const kssDir = utils.matchKssDir(filepath, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const outputRelative = path.join(huron.get('output'), componentPath, `${ filename }`);\n      const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);\n      let newContent = content;\n\n      if ('data' !== type && 'section' !== type) {\n        newContent = utils.wrapMarkup(content, id);\n      }\n\n      try {\n        fs.outputFileSync(outputPath, newContent);\n        console.log(chalk.green(`Writing ${ outputRelative }`)); // eslint-disable-line no-console\n      } catch (e) {\n        console.log(chalk.red(`Failed to write ${ outputRelative }`)); // eslint-disable-line no-console\n      }\n\n      return `./${ outputRelative.replace(`${ huron.get('output') }/`, '') }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Delete a file in the huron output directory\n   *\n   * @function removeFile\n   * @param  {string} filename - The name of the file (with extension).\n   * @param  {object} store - The data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  removeFile(id, type, filepath, store) {\n    const huron = store.get('config');\n    const file = path.parse(filepath);\n    const filename = utils.generateFilename(id, type, file.ext, store);\n    const kssDir = utils.matchKssDir(filepath, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const outputRelative = path.join(huron.get('output'), componentPath, `${ filename }`);\n      const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);\n\n      try {\n        fs.removeSync(outputPath);\n        console.log(chalk.green(`Removing ${ outputRelative }`)); // eslint-disable-line no-console\n      } catch (e) {\n        console.log( // eslint-disable-line no-console\n        chalk.red(`${ outputRelative } does not exist or cannot be deleted`));\n      }\n\n      return `./${ outputRelative.replace(`${ huron.get('output') }/`, '') }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Write a template for sections\n   *\n   * @function writeSectionTemplate\n   * @param  {string} filepath - the original template file\n   * @param  {object} store - data store\n   * @return {object} updated store\n   */\n  writeSectionTemplate(filepath, store) {\n    const huron = store.get('config');\n    const sectionTemplate = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'));\n    const componentPath = './huron-sections/sections.hbs';\n    const output = path.join(cwd, huron.get('root'), huron.get('output'), componentPath);\n\n    // Move huron script and section template into huron root\n    fs.outputFileSync(output, sectionTemplate);\n    console.log(chalk.green(`writing section template to ${ output }`)); // eslint-disable-line no-console\n\n    return store.set('sectionTemplatePath', componentPath);\n  },\n\n  /**\n   * Request for section data based on section reference\n   *\n   * @function writeSectionTemplate\n   * @param {string} search - key on which to match section\n   * @param {field} string - field in which to look to determine section\n   * @param {obj} store - sections memory store\n   */\n  getSection(search, field, store) {\n    const sectionValues = store.getIn(['sections', 'sectionsByPath']).valueSeq();\n    let selectedSection = false;\n\n    if (field) {\n      selectedSection = sectionValues.filter(value => value[field] === search).get(0);\n    } else {\n      selectedSection = store.getIn(['sections', 'sectionsByPath', search]);\n    }\n\n    return selectedSection;\n  },\n\n  /**\n   * Find which configured KSS directory a filepath exists in\n   *\n   * @function matchKssDir\n   * @param {string} filepath - filepath to search for\n   * @param {object} huron - huron configuration\n   * @return {string} kssMatch - relative path to KSS directory\n   */\n  matchKssDir(filepath, huron) {\n    const kssSource = huron.get('kss');\n    /* eslint-disable space-unary-ops */\n    // Include forward slash in our test to make sure we're matchin a directory, not a file extension\n    const kssMatch = kssSource.filter(dir => filepath.includes(`${ dir }/`));\n    /* eslint-enable space-unary-ops */\n\n    if (kssMatch.length) {\n      return kssMatch[0];\n    }\n\n    console.error(chalk.red(`filepath ${ filepath } does not exist in any\n      of the configured KSS directories`));\n    return false;\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3V0aWxzLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3NyYy9jbGkvdXRpbHMuanM/ZTcxYyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSBjbGkvdXRpbGl0aWVzICovXG5cbmNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7IC8vIEN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7IC8vIENvbG9yaXplIHRlcm1pbmFsIG91dHB1dFxuXG4vLyBFeHBvcnRzXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuLyogZXNsaW50LWVuYWJsZSAqL1xuXG4gIC8qKlxuICAgKiBFbnN1cmUgcHJlZGljdGFibGUgZGF0YSBzdHJ1Y3R1cmUgZm9yIEtTUyBzZWN0aW9uIGRhdGFcbiAgICpcbiAgICogQGZ1bmN0aW9uIG5vcm1hbGl6ZVNlY3Rpb25EYXRhXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gc2VjdGlvbiBkYXRhXG4gICAqIEByZXR1cm4ge29iamVjdH0gc2VjdGlvbiBkYXRhXG4gICAqL1xuICBub3JtYWxpemVTZWN0aW9uRGF0YShzZWN0aW9uKSB7XG4gICAgY29uc3QgZGF0YSA9IHNlY3Rpb24uZGF0YSB8fCBzZWN0aW9uO1xuXG4gICAgaWYgKCEgZGF0YS5yZWZlcmVuY2VVUkkgfHwgJycgPT09IGRhdGEucmVmZXJlbmNlVVJJKSB7XG4gICAgICBkYXRhLnJlZmVyZW5jZVVSSSA9IHNlY3Rpb24ucmVmZXJlbmNlVVJJKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuc3VyZSBwcmVkaWN0YWJsZSBkYXRhIHN0cnVjdHVyZSBmb3IgS1NTIHNlY3Rpb24gZGF0YVxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uRGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gc2VjdGlvbiBkYXRhXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWN0aW9uUGF0aCAtIG91dHB1dCBkZXN0aW5hdGlvbiBmb3Igc2VjdGlvbiBkYXRhIGZpbGVcbiAgICovXG4gIHdyaXRlU2VjdGlvbkRhdGEoc3RvcmUsIHNlY3Rpb24sIHNlY3Rpb25QYXRoID0gZmFsc2UpIHtcbiAgICBsZXQgb3V0cHV0UGF0aCA9IHNlY3Rpb25QYXRoO1xuICAgIGxldCBzZWN0aW9uRmlsZUluZm87XG5cbiAgICBpZiAoISBvdXRwdXRQYXRoICYmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoc2VjdGlvbiwgJ2tzc1BhdGgnKSkge1xuICAgICAgc2VjdGlvbkZpbGVJbmZvID0gcGF0aC5wYXJzZShzZWN0aW9uLmtzc1BhdGgpO1xuICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgc2VjdGlvbkZpbGVJbmZvLmRpcixcbiAgICAgICAgYCR7c2VjdGlvbkZpbGVJbmZvLm5hbWV9Lmpzb25gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE91dHB1dCBzZWN0aW9uIGRhdGFcbiAgICBpZiAob3V0cHV0UGF0aCkge1xuICAgICAgcmV0dXJuIHV0aWxzLndyaXRlRmlsZShcbiAgICAgICAgc2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICAgICdzZWN0aW9uJyxcbiAgICAgICAgb3V0cHV0UGF0aCxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoc2VjdGlvbiksXG4gICAgICAgIHN0b3JlXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnNvbGUud2FybiggLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICBjaGFsay5yZWQoYEZhaWxlZCB0byB3cml0ZSBzZWN0aW9uIGRhdGEgZm9yICR7c2VjdGlvbi5yZWZlcmVuY2VVUkl9YClcbiAgICApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogRmluZCAuanNvbiBmcm9tIGEgdGVtcGxhdGUgZmlsZSBvciB2aWNlIHZlcnNhXG4gICAqXG4gICAqIEBmdW5jdGlvbiBnZXRUZW1wbGF0ZURhdGFQYWlyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIC0gZmlsZSBvYmplY3QgZnJvbSBwYXRoLnBhcnNlKClcbiAgICogQHBhcmFtIHtvYmplY3R9IHNlY3Rpb24gLSBLU1Mgc2VjdGlvbiBkYXRhXG4gICAqIEByZXR1cm4ge3N0cmluZ30gcmVsYXRpdmUgcGF0aCB0byBtb2R1bGUgSlNPTiBmaWxlXG4gICAqL1xuICBnZXRUZW1wbGF0ZURhdGFQYWlyKGZpbGUsIHNlY3Rpb24sIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IGtzc0RpciA9IHV0aWxzLm1hdGNoS3NzRGlyKGZpbGUuZGlyLCBodXJvbik7XG5cbiAgICBpZiAoa3NzRGlyKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRQYXRoID0gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgcGF0aC5yZXNvbHZlKGN3ZCwga3NzRGlyKSxcbiAgICAgICAgZmlsZS5kaXJcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJ0bmVyVHlwZSA9ICcuanNvbicgPT09IGZpbGUuZXh0ID8gJ3RlbXBsYXRlJyA6ICdkYXRhJztcbiAgICAgIGNvbnN0IHBhcnRuZXJFeHQgPSAnLmpzb24nID09PSBmaWxlLmV4dCA/XG4gICAgICAgIGh1cm9uLmdldCgndGVtcGxhdGVzJykuZXh0ZW5zaW9uIDpcbiAgICAgICAgJy5qc29uJztcblxuICAgICAgY29uc3QgcGFpclBhdGggPSBwYXRoLmpvaW4oXG4gICAgICAgIGNvbXBvbmVudFBhdGgsXG4gICAgICAgIHV0aWxzLmdlbmVyYXRlRmlsZW5hbWUoXG4gICAgICAgICAgc2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICAgICAgcGFydG5lclR5cGUsXG4gICAgICAgICAgcGFydG5lckV4dCxcbiAgICAgICAgICBzdG9yZVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gYC4vJHtwYWlyUGF0aH1gO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogTm9ybWFsaXplIGEgc2VjdGlvbiB0aXRsZSBmb3IgdXNlIGFzIGEgZmlsZW5hbWVcbiAgICpcbiAgICogQGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyIC0gc2VjdGlvbiBoZWFkZXIgZXh0cmFjdGVkIGZyb20gS1NTIGRvY3VtZW50YXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSBtb2RpZmllZCBoZWFkZXIsIGxvd2VyY2FzZSBhbmQgd29yZHMgc2VwYXJhdGVkIGJ5IGRhc2hcbiAgICovXG4gIG5vcm1hbGl6ZUhlYWRlcihoZWFkZXIpIHtcbiAgICByZXR1cm4gaGVhZGVyXG4gICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgLnJlcGxhY2UoL1xccz9cXFdcXHM/L2csICctJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdyYXAgaHRtbCBpbiByZXF1aXJlZCB0ZW1wbGF0ZSB0YWdzXG4gICAqXG4gICAqIEBmdW5jdGlvbiB3cmFwTWFya3VwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IC0gaHRtbCBvciB0ZW1wbGF0ZSBtYXJrdXBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlSWQgLSBpZCBvZiB0ZW1wbGF0ZSAoc2hvdWxkIGJlIHNlY3Rpb24gcmVmZXJlbmNlKVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IG1vZGlmaWVkIEhUTUxcbiAgICovXG4gIHdyYXBNYXJrdXAoY29udGVudCwgdGVtcGxhdGVJZCkge1xuICAgIHJldHVybiBgPGRvbS1tb2R1bGU+XG48dGVtcGxhdGUgaWQ9XCIke3RlbXBsYXRlSWR9XCI+XG4ke2NvbnRlbnR9XG48L3RlbXBsYXRlPlxuPC9kb20tbW9kdWxlPlxcbmA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgZmlsZW5hbWUgYmFzZWQgb24gcmVmZXJlbmNlVVJJLCB0eXBlIGFuZCBmaWxlIG9iamVjdFxuICAgKlxuICAgKiBAZnVuY3Rpb24gZ2VuZXJhdGVGaWxlbmFtZVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkIC0gVGhlIG5hbWUgb2YgdGhlIGZpbGUgKHdpdGggZXh0ZW5zaW9uKS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZmlsZSBvdXRwdXRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBleHQgLSBmaWxlIGV4dGVuc2lvblxuICAgKiBAcGFyYW0gIHtzdG9yZX0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIGdlbmVyYXRlRmlsZW5hbWUoaWQsIHR5cGUsIGV4dCwgc3RvcmUpIHtcbiAgICAvLyBUeXBlIG9mIGZpbGUgYW5kIGl0cyBjb3JyZXNwb25kaW5nIGV4dGVuc2lvbihzKVxuICAgIGNvbnN0IHR5cGVzID0gc3RvcmUuZ2V0KCd0eXBlcycpO1xuICAgIGNvbnN0IG91dHB1dEV4dCA9ICcuc2NzcycgIT09IGV4dCA/IGV4dCA6ICcuaHRtbCc7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgIGlmICgtMSA9PT0gdHlwZXMuaW5kZXhPZih0eXBlKSkge1xuICAgICAgY29uc29sZS5sb2coYEh1cm9uIGRhdGEgJHt0eXBlfSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlICovXG5cbiAgICByZXR1cm4gYCR7aWR9LSR7dHlwZX0ke291dHB1dEV4dH1gO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDb3B5IGFuIEhUTUwgZmlsZSBpbnRvIHRoZSBodXJvbiBvdXRwdXQgZGlyZWN0b3J5LlxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVGaWxlXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWQgLSBUaGUgbmFtZSBvZiB0aGUgZmlsZSAod2l0aCBleHRlbnNpb24pLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNvbnRlbnQgLSBUaGUgY29udGVudCBvZiB0aGUgZmlsZSB0byB3cml0ZS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZmlsZSBvdXRwdXRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9yZSAtIFRoZSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIHdyaXRlRmlsZShpZCwgdHlwZSwgZmlsZXBhdGgsIGNvbnRlbnQsIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHV0aWxzLmdlbmVyYXRlRmlsZW5hbWUoaWQsIHR5cGUsIGZpbGUuZXh0LCBzdG9yZSk7XG4gICAgY29uc3Qga3NzRGlyID0gdXRpbHMubWF0Y2hLc3NEaXIoZmlsZXBhdGgsIGh1cm9uKTtcblxuICAgIGlmIChrc3NEaXIpIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFBhdGggPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICBwYXRoLnJlc29sdmUoY3dkLCBrc3NEaXIpLFxuICAgICAgICBmaWxlLmRpclxuICAgICAgKTtcbiAgICAgIGNvbnN0IG91dHB1dFJlbGF0aXZlID0gcGF0aC5qb2luKFxuICAgICAgICBodXJvbi5nZXQoJ291dHB1dCcpLFxuICAgICAgICBjb21wb25lbnRQYXRoLFxuICAgICAgICBgJHtmaWxlbmFtZX1gXG4gICAgICApO1xuICAgICAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGgucmVzb2x2ZShjd2QsIGh1cm9uLmdldCgncm9vdCcpLCBvdXRwdXRSZWxhdGl2ZSk7XG4gICAgICBsZXQgbmV3Q29udGVudCA9IGNvbnRlbnQ7XG5cbiAgICAgIGlmICgnZGF0YScgIT09IHR5cGUgJiYgJ3NlY3Rpb24nICE9PSB0eXBlKSB7XG4gICAgICAgIG5ld0NvbnRlbnQgPSB1dGlscy53cmFwTWFya3VwKGNvbnRlbnQsIGlkKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMub3V0cHV0RmlsZVN5bmMob3V0cHV0UGF0aCwgbmV3Q29udGVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKGBXcml0aW5nICR7b3V0cHV0UmVsYXRpdmV9YCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKGBGYWlsZWQgdG8gd3JpdGUgJHtvdXRwdXRSZWxhdGl2ZX1gKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYC4vJHtvdXRwdXRSZWxhdGl2ZS5yZXBsYWNlKGAke2h1cm9uLmdldCgnb3V0cHV0Jyl9L2AsICcnKX1gO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGEgZmlsZSBpbiB0aGUgaHVyb24gb3V0cHV0IGRpcmVjdG9yeVxuICAgKlxuICAgKiBAZnVuY3Rpb24gcmVtb3ZlRmlsZVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGZpbGUgKHdpdGggZXh0ZW5zaW9uKS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9yZSAtIFRoZSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIHJlbW92ZUZpbGUoaWQsIHR5cGUsIGZpbGVwYXRoLCBzdG9yZSkge1xuICAgIGNvbnN0IGh1cm9uID0gc3RvcmUuZ2V0KCdjb25maWcnKTtcbiAgICBjb25zdCBmaWxlID0gcGF0aC5wYXJzZShmaWxlcGF0aCk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSB1dGlscy5nZW5lcmF0ZUZpbGVuYW1lKGlkLCB0eXBlLCBmaWxlLmV4dCwgc3RvcmUpO1xuICAgIGNvbnN0IGtzc0RpciA9IHV0aWxzLm1hdGNoS3NzRGlyKGZpbGVwYXRoLCBodXJvbik7XG5cbiAgICBpZiAoa3NzRGlyKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRQYXRoID0gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgcGF0aC5yZXNvbHZlKGN3ZCwga3NzRGlyKSxcbiAgICAgICAgZmlsZS5kaXJcbiAgICAgICk7XG4gICAgICBjb25zdCBvdXRwdXRSZWxhdGl2ZSA9IHBhdGguam9pbihcbiAgICAgICAgaHVyb24uZ2V0KCdvdXRwdXQnKSxcbiAgICAgICAgY29tcG9uZW50UGF0aCxcbiAgICAgICAgYCR7ZmlsZW5hbWV9YFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLnJlc29sdmUoY3dkLCBodXJvbi5nZXQoJ3Jvb3QnKSwgb3V0cHV0UmVsYXRpdmUpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmcy5yZW1vdmVTeW5jKG91dHB1dFBhdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihgUmVtb3ZpbmcgJHtvdXRwdXRSZWxhdGl2ZX1gKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyggLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgY2hhbGsucmVkKGAke291dHB1dFJlbGF0aXZlfSBkb2VzIG5vdCBleGlzdCBvciBjYW5ub3QgYmUgZGVsZXRlZGApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBgLi8ke291dHB1dFJlbGF0aXZlLnJlcGxhY2UoYCR7aHVyb24uZ2V0KCdvdXRwdXQnKX0vYCwgJycpfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXcml0ZSBhIHRlbXBsYXRlIGZvciBzZWN0aW9uc1xuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uVGVtcGxhdGVcbiAgICogQHBhcmFtICB7c3RyaW5nfSBmaWxlcGF0aCAtIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBmaWxlXG4gICAqIEBwYXJhbSAge29iamVjdH0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge29iamVjdH0gdXBkYXRlZCBzdG9yZVxuICAgKi9cbiAgd3JpdGVTZWN0aW9uVGVtcGxhdGUoZmlsZXBhdGgsIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IHNlY3Rpb25UZW1wbGF0ZSA9IHV0aWxzLndyYXBNYXJrdXAoZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCAndXRmOCcpKTtcbiAgICBjb25zdCBjb21wb25lbnRQYXRoID0gJy4vaHVyb24tc2VjdGlvbnMvc2VjdGlvbnMuaGJzJztcbiAgICBjb25zdCBvdXRwdXQgPSBwYXRoLmpvaW4oXG4gICAgICBjd2QsXG4gICAgICBodXJvbi5nZXQoJ3Jvb3QnKSxcbiAgICAgIGh1cm9uLmdldCgnb3V0cHV0JyksXG4gICAgICBjb21wb25lbnRQYXRoXG4gICAgKTtcblxuICAgIC8vIE1vdmUgaHVyb24gc2NyaXB0IGFuZCBzZWN0aW9uIHRlbXBsYXRlIGludG8gaHVyb24gcm9vdFxuICAgIGZzLm91dHB1dEZpbGVTeW5jKG91dHB1dCwgc2VjdGlvblRlbXBsYXRlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihgd3JpdGluZyBzZWN0aW9uIHRlbXBsYXRlIHRvICR7b3V0cHV0fWApKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KCdzZWN0aW9uVGVtcGxhdGVQYXRoJywgY29tcG9uZW50UGF0aCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgZm9yIHNlY3Rpb24gZGF0YSBiYXNlZCBvbiBzZWN0aW9uIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uVGVtcGxhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaCAtIGtleSBvbiB3aGljaCB0byBtYXRjaCBzZWN0aW9uXG4gICAqIEBwYXJhbSB7ZmllbGR9IHN0cmluZyAtIGZpZWxkIGluIHdoaWNoIHRvIGxvb2sgdG8gZGV0ZXJtaW5lIHNlY3Rpb25cbiAgICogQHBhcmFtIHtvYmp9IHN0b3JlIC0gc2VjdGlvbnMgbWVtb3J5IHN0b3JlXG4gICAqL1xuICBnZXRTZWN0aW9uKHNlYXJjaCwgZmllbGQsIHN0b3JlKSB7XG4gICAgY29uc3Qgc2VjdGlvblZhbHVlcyA9IHN0b3JlXG4gICAgICAuZ2V0SW4oWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCddKVxuICAgICAgLnZhbHVlU2VxKCk7XG4gICAgbGV0IHNlbGVjdGVkU2VjdGlvbiA9IGZhbHNlO1xuXG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBzZWxlY3RlZFNlY3Rpb24gPSBzZWN0aW9uVmFsdWVzXG4gICAgICAgIC5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZVtmaWVsZF0gPT09IHNlYXJjaClcbiAgICAgICAgLmdldCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRTZWN0aW9uID0gc3RvcmUuZ2V0SW4oWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIHNlYXJjaF0pO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RlZFNlY3Rpb247XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmQgd2hpY2ggY29uZmlndXJlZCBLU1MgZGlyZWN0b3J5IGEgZmlsZXBhdGggZXhpc3RzIGluXG4gICAqXG4gICAqIEBmdW5jdGlvbiBtYXRjaEtzc0RpclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZXBhdGggLSBmaWxlcGF0aCB0byBzZWFyY2ggZm9yXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBodXJvbiAtIGh1cm9uIGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSBrc3NNYXRjaCAtIHJlbGF0aXZlIHBhdGggdG8gS1NTIGRpcmVjdG9yeVxuICAgKi9cbiAgbWF0Y2hLc3NEaXIoZmlsZXBhdGgsIGh1cm9uKSB7XG4gICAgY29uc3Qga3NzU291cmNlID0gaHVyb24uZ2V0KCdrc3MnKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBzcGFjZS11bmFyeS1vcHMgKi9cbiAgICAvLyBJbmNsdWRlIGZvcndhcmQgc2xhc2ggaW4gb3VyIHRlc3QgdG8gbWFrZSBzdXJlIHdlJ3JlIG1hdGNoaW4gYSBkaXJlY3RvcnksIG5vdCBhIGZpbGUgZXh0ZW5zaW9uXG4gICAgY29uc3Qga3NzTWF0Y2ggPSBrc3NTb3VyY2UuZmlsdGVyKChkaXIpID0+IGZpbGVwYXRoLmluY2x1ZGVzKGAke2Rpcn0vYCkpO1xuICAgIC8qIGVzbGludC1lbmFibGUgc3BhY2UtdW5hcnktb3BzICovXG5cbiAgICBpZiAoa3NzTWF0Y2gubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ga3NzTWF0Y2hbMF07XG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIGNoYWxrLnJlZChgZmlsZXBhdGggJHtmaWxlcGF0aH0gZG9lcyBub3QgZXhpc3QgaW4gYW55XG4gICAgICBvZiB0aGUgY29uZmlndXJlZCBLU1MgZGlyZWN0b3JpZXNgKVxuICAgICk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvY2xpL3V0aWxzLmpzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQU9BO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUFBO0FBQ0E7O0FBREE7QUFLQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUF2VEEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/default-config/huron.config.js":
/* no static exports found */
/* all exports used */
/*!********************************************!*\
  !*** ./src/default-config/huron.config.js ***!
  \********************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nconst path = __webpack_require__(/*! path */ 0);\n\nmodule.exports = {\n  css: [],\n  entry: 'huron',\n  js: [],\n  kss: 'css/',\n  kssExtension: '.css',\n  kssOptions: {\n    multiline: true,\n    markdown: true,\n    custom: ['data']\n  },\n  output: 'partials',\n  port: 8080,\n  prototypes: ['index'],\n  root: 'dist/',\n  sectionTemplate: path.join(__dirname, '../templates/section.hbs'),\n  templates: {\n    rule: {\n      test: /\\.(hbs|handlebars)$/,\n      use: 'handlebars-template-loader'\n    },\n    extension: '.hbs'\n  },\n  window: {}\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZGVmYXVsdC1jb25maWcvaHVyb24uY29uZmlnLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3NyYy9kZWZhdWx0LWNvbmZpZy9odXJvbi5jb25maWcuanM/MmQ2MiJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3NzOiBbXSxcbiAgZW50cnk6ICdodXJvbicsXG4gIGpzOiBbXSxcbiAga3NzOiAnY3NzLycsXG4gIGtzc0V4dGVuc2lvbjogJy5jc3MnLFxuICBrc3NPcHRpb25zOiB7XG4gICAgbXVsdGlsaW5lOiB0cnVlLFxuICAgIG1hcmtkb3duOiB0cnVlLFxuICAgIGN1c3RvbTogWydkYXRhJ10sXG4gIH0sXG4gIG91dHB1dDogJ3BhcnRpYWxzJyxcbiAgcG9ydDogODA4MCxcbiAgcHJvdG90eXBlczogWydpbmRleCddLFxuICByb290OiAnZGlzdC8nLFxuICBzZWN0aW9uVGVtcGxhdGU6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi90ZW1wbGF0ZXMvc2VjdGlvbi5oYnMnKSxcbiAgdGVtcGxhdGVzOiB7XG4gICAgcnVsZToge1xuICAgICAgdGVzdDogL1xcLihoYnN8aGFuZGxlYmFycykkLyxcbiAgICAgIHVzZTogJ2hhbmRsZWJhcnMtdGVtcGxhdGUtbG9hZGVyJyxcbiAgICB9LFxuICAgIGV4dGVuc2lvbjogJy5oYnMnLFxuICB9LFxuICB3aW5kb3c6IHt9LFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzcmMvZGVmYXVsdC1jb25maWcvaHVyb24uY29uZmlnLmpzIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUxBO0FBT0E7QUF2QkEiLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),

/***/ "./src/default-config/webpack.config.js":
/* no static exports found */
/* all exports used */
/*!**********************************************!*\
  !*** ./src/default-config/webpack.config.js ***!
  \**********************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nconst webpack = __webpack_require__(/*! webpack */ 3);\nconst path = __webpack_require__(/*! path */ 0);\n\nmodule.exports = {\n  entry: {},\n  output: {\n    // path: [huron root directory],\n    filename: '[name].js',\n    chunkFilename: '[name].chunk.min.js'\n  },\n  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()],\n  resolve: {\n    modulesDirectories: [path.resolve(__dirname, '../src/js')]\n  },\n  resolveLoader: {\n    modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', 'node_modules', path.resolve(__dirname, '../node_modules')]\n  },\n  module: {\n    rules: [{\n      test: /\\.html?$/,\n      use: [{\n        loader: 'dom-loader',\n        options: {\n          tag: 'dom-module'\n        }\n      }, 'html-loader']\n    }]\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZGVmYXVsdC1jb25maWcvd2VicGFjay5jb25maWcuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vc3JjL2RlZmF1bHQtY29uZmlnL3dlYnBhY2suY29uZmlnLmpzPzFiY2YiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbnRyeToge30sXG4gIG91dHB1dDoge1xuICAgIC8vIHBhdGg6IFtodXJvbiByb290IGRpcmVjdG9yeV0sXG4gICAgZmlsZW5hbWU6ICdbbmFtZV0uanMnLFxuICAgIGNodW5rRmlsZW5hbWU6ICdbbmFtZV0uY2h1bmsubWluLmpzJyxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIG5ldyB3ZWJwYWNrLkhvdE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luKCksXG4gICAgbmV3IHdlYnBhY2suTmFtZWRNb2R1bGVzUGx1Z2luKCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBtb2R1bGVzRGlyZWN0b3JpZXM6IFtcbiAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zcmMvanMnKSxcbiAgICBdLFxuICB9LFxuICByZXNvbHZlTG9hZGVyOiB7XG4gICAgbW9kdWxlc0RpcmVjdG9yaWVzOiBbXG4gICAgICAnd2ViX2xvYWRlcnMnLFxuICAgICAgJ3dlYl9tb2R1bGVzJyxcbiAgICAgICdub2RlX2xvYWRlcnMnLFxuICAgICAgJ25vZGVfbW9kdWxlcycsXG4gICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vbm9kZV9tb2R1bGVzJyksXG4gICAgXSxcbiAgfSxcbiAgbW9kdWxlOiB7XG4gICAgcnVsZXM6IFtcbiAgICAgIHtcbiAgICAgICAgdGVzdDogL1xcLmh0bWw/JC8sXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxvYWRlcjogJ2RvbS1sb2FkZXInLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICB0YWc6ICdkb20tbW9kdWxlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICAnaHRtbC1sb2FkZXInLFxuICAgICAgICBdLFxuICAgICAgICAvLyBpbmNsdWRlOiBbJ3BhdGgvdG8vdGVtcGxhdGVzJ11cbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3JjL2RlZmF1bHQtY29uZmlnL3dlYnBhY2suY29uZmlnLmpzIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFJQTtBQUNBO0FBREE7QUFLQTtBQUNBO0FBREE7QUFTQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQURBO0FBRkE7QUFIQTtBQUZBO0FBekJBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }),

/***/ 0:
/* no static exports found */
/* all exports used */
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcInBhdGhcIj81YjJhIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJwYXRoXCJcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 1:
/* no static exports found */
/* all exports used */
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"chalk\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImNoYWxrXCI/NTNmNyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFsa1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImNoYWxrXCJcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 10:
/* no static exports found */
/* all exports used */
/*!*************************************!*\
  !*** external "webpack-dev-server" ***!
  \*************************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack-dev-server\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTAuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ3ZWJwYWNrLWRldi1zZXJ2ZXJcIj8xYmVhIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndlYnBhY2stZGV2LXNlcnZlclwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcIndlYnBhY2stZGV2LXNlcnZlclwiXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwibWFwcGluZ3MiOiJBQUFBIiwic291cmNlUm9vdCI6IiJ9");

/***/ }),

/***/ 11:
/* no static exports found */
/* all exports used */
/*!**************************************************!*\
  !*** multi webpack/hot/poll ./src/cli/huron-cli ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! webpack/hot/poll */"./node_modules/webpack/hot/poll.js");
module.exports = __webpack_require__(/*! ./src/cli/huron-cli */"./src/cli/huron-cli.js");


/***/ }),

/***/ 2:
/* no static exports found */
/* all exports used */
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"fs-extra\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMi5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImZzLWV4dHJhXCI/N2NhNiJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmcy1leHRyYVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzLWV4dHJhXCJcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 3:
/* no static exports found */
/* all exports used */
/*!**************************!*\
  !*** external "webpack" ***!
  \**************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcIndlYnBhY2tcIj8zOTNkIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndlYnBhY2tcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJ3ZWJwYWNrXCJcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 4:
/* no static exports found */
/* all exports used */
/*!****************************!*\
  !*** external "commander" ***!
  \****************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"commander\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImNvbW1hbmRlclwiPzc1NzMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29tbWFuZGVyXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiY29tbWFuZGVyXCJcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 5:
/* no static exports found */
/* all exports used */
/*!***********************!*\
  !*** external "gaze" ***!
  \***********************/
/***/ (function(module, exports) {

eval("module.exports = require(\"gaze\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImdhemVcIj9mMjE4Il0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImdhemVcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJnYXplXCJcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 6:
/* no static exports found */
/* all exports used */
/*!**************************************!*\
  !*** external "html-webpack-plugin" ***!
  \**************************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"html-webpack-plugin\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNi5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImh0bWwtd2VicGFjay1wbHVnaW5cIj8xOGVjIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImh0bWwtd2VicGFjay1wbHVnaW5cIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJodG1sLXdlYnBhY2stcGx1Z2luXCJcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 7:
/* no static exports found */
/* all exports used */
/*!****************************!*\
  !*** external "immutable" ***!
  \****************************/
/***/ (function(module, exports) {

eval("module.exports = require(\"immutable\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImltbXV0YWJsZVwiPzFkMjAiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaW1tdXRhYmxlXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiaW1tdXRhYmxlXCJcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 8:
/* no static exports found */
/* all exports used */
/*!**********************!*\
  !*** external "kss" ***!
  \**********************/
/***/ (function(module, exports) {

eval("module.exports = require(\"kss\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImtzc1wiP2NkMDIiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwia3NzXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwia3NzXCJcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),

/***/ 9:
/* no static exports found */
/* all exports used */
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ (function(module, exports) {

eval("module.exports = require(\"url\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcInVybFwiP2NhZWMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXJsXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidXJsXCJcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ })

/******/ });