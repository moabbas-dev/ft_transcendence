// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"cAPdp":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "7dd44675b7a05eb9";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == 'https:' && ![
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
    ].includes(hostname) ? 'wss' : 'ws';
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
    } catch (err) {
        if (err.message) console.error(err.message);
        ws = {};
    }
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    // $FlowFixMe
    ws.onmessage = async function(event /*: {data: string, ...} */ ) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        disposedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data /*: HMRMessage */  = JSON.parse(event.data);
        if (data.type === 'reload') fullReload();
        else if (data.type === 'update') {
            // Remove error overlay if there is one
            if (typeof document !== 'undefined') removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH);
            // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
                await hmrApplyUpdates(assets);
                hmrDisposeQueue();
                // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                let processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === 'error') {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
            }
            if (typeof document !== 'undefined') {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html);
                // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    if (ws instanceof WebSocket) {
        ws.onerror = function(e) {
            if (e.message) console.error(e.message);
        };
        ws.onclose = function() {
            console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
        };
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ('reload' in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"jeorp":[function(require,module,exports,__globalThis) {
var _routerJs = require("./router.js");
console.log('App initialized!');

},{"./router.js":"4QFWt"}],"4QFWt":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "navigate", ()=>navigate);
var _registerJs = require("./pages/register.js");
var _registerJsDefault = parcelHelpers.interopDefault(_registerJs);
var _notfoundJs = require("./pages/notfound.js");
var _notfoundJsDefault = parcelHelpers.interopDefault(_notfoundJs);
const routes = {
    // '/': HomePage,
    // '/about': AboutPage,
    '/': (0, _registerJsDefault.default)
};
function router() {
    const path = window.location.pathname;
    const page = routes[path] || (0, _notfoundJsDefault.default);
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '';
    page.render(appContainer);
}
function navigate(path) {
    window.history.pushState({}, '', path);
    router();
}
window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);

},{"./pages/register.js":"a1ZYr","./pages/notfound.js":"kGuWM","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"a1ZYr":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _signInJs = require("../components/SignIn.js");
var _signUpJs = require("../components/SignUp.js");
var _pingPongAnimationJs = require("../components/PingPongAnimation.js");
exports.default = {
    render: (container)=>{
        container.innerHTML = `
		<div class="loaded-div fixed inset-0 overflow-hidden">
			<canvas id="pongCanvas" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-0 sm:left-0 z-0 w-[100vh] h-[100vw] sm:w-[100vw] sm:h-[100vh] inset-0 rotate-90 origin-center sm:rotate-0"></canvas>
			<div class="relative z-10 flex items-center justify-center">
				<section class="flex items-center justify-center h-screen opacity-90">
					<div class="bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] shadow-white rounded-lg">
						<aside class="transition-opacity duration-400">
						</aside>
						<!-- SignIn, SignUp Forms Here -->
						<div class="flex flex-col gap-3">
							<div class="w-full p-1">
								<button type="button" class="w-full flex items-center justify-start p-2 text-white bg-[var(--main-color)] hover:cursor-pointer hover:opacity-80 rounded-md transition-all duration-300">
									<i class='bx bxl-google text-2xl'></i>
									<span class="flex-1 text-center">Continue with google</span>
								</button>
							</div>	
						</div>
					</div>
				</section>
			</div>
		</div>
		`;
        const animateTransition = (newComponentFn)=>{
            section.classList.add('opacity-0');
            setTimeout(()=>{
                section.innerHTML = '';
                section.appendChild(newComponentFn());
                section.classList.remove('opacity-0');
            }, 400);
        };
        const section = container.querySelector('aside');
        const renderSignIn = ()=>{
            animateTransition(()=>(0, _signInJs.SignIn)({
                    styles: 'mx-auto',
                    onSwitchToSignUp: renderSignUp
                }));
        };
        const renderSignUp = ()=>{
            animateTransition(()=>(0, _signUpJs.SignUp)({
                    styles: 'mx-auto',
                    onSwitchToSignIn: renderSignIn
                }));
        };
        renderSignIn();
        console.log('Script loaded');
        const canvas = document.getElementById('pongCanvas');
        console.log('Canvas element:', canvas);
        if (canvas) {
            const pong = new (0, _pingPongAnimationJs.PongAnimation)(canvas);
            console.log('PongAnimation instantiated:', pong);
        }
    }
};

},{"../components/SignIn.js":"c2Pjp","../components/SignUp.js":"HID90","../components/PingPongAnimation.js":"PczXh","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"c2Pjp":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "SignIn", ()=>SignIn);
var _buttonJs = require("./Button.js");
var _stateManagerJs = require("../utils/StateManager.js");
var _routerJs = require("../router.js");
var _formValidationJs = require("../utils/FormValidation.js");
const SignIn = (0, _stateManagerJs.createComponent)((props)=>{
    const form = document.createElement('div');
    form.className = `w-[93vw] sm:w-96 xl:w-[30vw] bg-white rounded-lg p-4 sm:p-8 ${props.styles || ''}`;
    form.innerHTML = `
  <div class="flex flex-col gap-3">
    <h1 class="text-2xl font-bold text-center underline">Welcome Back!</h1>
    <form class="flex flex-col gap-2">
      <div>
        <label for="email" class="block text-base font-medium text-gray-700">Email</label>
        <div>
          <input type="email" id="email" placeholder="Your Email here!" autocomplete="email" name="email" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
        </div>
      </div>
      <div>
        <label for="password" class="block text-base font-medium text-gray-700">Password</label>
        <div class="relative mt-1">
          <div>
            <input type="password" id="password" placeholder="Your Password here!" autocomplete="current-password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
          </div>
          <span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
            <i class='bx bx-hide hide-show pointer-events-none'></i>
          </span>
        </div>
      </div>
    <div class="flex items-center justify-end w-full forgot">
      <!-- Forgot Password Button -->
    </div>
    <!-- Sign In Button -->
    </form>
    <div class="w-full text-center pt-1">
      Don't have an Account? <span class="signup-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">Let's SignUp</span>
    </div>
    </div>
  `;
    const formElement = form.querySelector('form');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const signInButton = (0, _buttonJs.Button)({
        type: 'submit',
        text: 'Sign In',
        styles: 'w-full font-semibold p-2 text-base text-white',
        eventType: 'click',
        onClick: (e)=>{
            if (!(0, _formValidationJs.validateEmail)(emailInput) || !(0, _formValidationJs.validatePassword)(passwordInput)) e.preventDefault();
            else console.log('email and pass are nice!');
        }
    });
    formElement.appendChild(signInButton);
    const forgotBtn = (0, _buttonJs.Button)({
        type: 'button',
        text: 'forgot password?',
        styles: 'bg-white text-[var(--main-color)] p-0 rounded-none',
        eventType: 'click',
        onClick: (e)=>{
            e.preventDefault();
            (0, _routerJs.navigate)('/resetpass');
        }
    });
    form.querySelector('.forgot').appendChild(forgotBtn);
    const signupLink = form.querySelector('.signup-link');
    signupLink.addEventListener('click', (e)=>{
        e.preventDefault();
        if (props.onSwitchToSignUp) props.onSwitchToSignUp();
    });
    const togglePassword = form.querySelector('.toggle-password');
    const eyeIcon = togglePassword.querySelector('.hide-show');
    const handleTogglePassword = (e)=>{
        e.preventDefault();
        const wasPassword = passwordInput.type === 'password';
        passwordInput.type = wasPassword ? 'text' : 'password';
        eyeIcon.classList.remove('bx-show', 'bx-hide');
        eyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
    };
    togglePassword.addEventListener('click', handleTogglePassword);
    (0, _stateManagerJs.useCleanup)(()=>togglePassword.removeEventListener('click', handleTogglePassword));
    return form;
});

},{"./Button.js":"a24OL","../utils/StateManager.js":"gx27U","../router.js":"4QFWt","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","../utils/FormValidation.js":"eneDa"}],"a24OL":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Button", ()=>Button);
var _stateManagerJs = require("../utils/StateManager.js");
const Button = (0, _stateManagerJs.createComponent)((props)=>{
    const button = document.createElement('button');
    button.innerHTML = props.text;
    button.type = props.type;
    button.className = `flex items-center justify-center hover:opacity-80 hover:cursor-pointer transition-all duration-300 bg-[var(--main-color)] rounded-full ${props.styles}`;
    button.addEventListener(props.eventType, props.onClick);
    (0, _stateManagerJs.useCleanup)(()=>button.removeEventListener(props.eventType, props.onClick));
    return button;
});

},{"../utils/StateManager.js":"gx27U","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gx27U":[function(require,module,exports,__globalThis) {
// STATE MANAGER IMPROVEMENTS
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createComponent", ()=>createComponent);
parcelHelpers.export(exports, "useCleanup", ()=>useCleanup);
parcelHelpers.export(exports, "StateManager", ()=>StateManager);
let currentInstance = null;
const componentStates = new WeakMap();
const hookStates = new WeakMap();
const hookIndices = new WeakMap();
const cleanupFns = new WeakMap();
function createComponent(renderFn) {
    return (props = {})=>{
        const instance = {
            id: Symbol('component'),
            props,
            render: function() {
                const prevInstance = currentInstance;
                currentInstance = instance;
                hookIndices.set(instance, 0);
                // Run cleanup before new render
                if (cleanupFns.has(instance)) {
                    const cleanup = cleanupFns.get(instance);
                    cleanup();
                }
                const dom = renderFn(instance.props);
                // Store/update DOM reference
                if (!componentStates.has(instance)) componentStates.set(instance, dom);
                currentInstance = prevInstance;
                return dom;
            }
        };
        // Initial render and DOM storage
        const initialDom = instance.render();
        componentStates.set(instance, initialDom);
        return initialDom;
    };
}
function useCleanup(cleanupFn) {
    if (!currentInstance) throw new Error('useCleanup must be called within a component');
    cleanupFns.set(currentInstance, cleanupFn);
}
const StateManager = {
    useState (initialValue) {
        if (!currentInstance) throw new Error('Hooks must be called within a component');
        const currentHookIndex = hookIndices.get(currentInstance) || 0;
        // Capture the hook index so it won’t be affected by later calls
        const hookIndex = currentHookIndex;
        hookIndices.set(currentInstance, currentHookIndex + 1);
        if (!hookStates.has(currentInstance)) hookStates.set(currentInstance, []);
        const hooks = hookStates.get(currentInstance);
        const instance = currentInstance;
        if (hookIndex >= hooks.length) hooks.push({
            state: typeof initialValue === 'function' ? initialValue(instance.props) : initialValue,
            // In StateManager's setState
            setState: (newValue)=>{
                const prevState = hooks[hookIndex].state;
                const nextState = typeof newValue === 'function' ? newValue(prevState) : newValue;
                // Only update if state actually changed
                if (prevState !== nextState) {
                    hooks[hookIndex].state = nextState;
                    // Batch DOM updates
                    requestAnimationFrame(()=>{
                        const oldDom = componentStates.get(instance);
                        if (oldDom && document.body.contains(oldDom)) {
                            const newDom = instance.render();
                            oldDom.replaceWith(newDom);
                            componentStates.set(instance, newDom);
                        }
                    });
                }
            }
        });
        return [
            hooks[hookIndex].state,
            hooks[hookIndex].setState
        ];
    }
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"eneDa":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "validateEmail", ()=>validateEmail);
parcelHelpers.export(exports, "validatePassword", ()=>validatePassword);
parcelHelpers.export(exports, "validateConfirmPassword", ()=>validateConfirmPassword);
function createErrorMessage(input, message) {
    if (input.nextElementSibling) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-700 text-sm mt-1'; // Tailwind CSS classes for styling
    errorDiv.textContent = message;
    // Insert the error message div after the input element
    input.insertAdjacentElement('afterend', errorDiv);
}
function removeErrorMessage(input) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv) errorDiv.remove();
}
function validateEmail(emailInput) {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        createErrorMessage(emailInput, "Enter a valid email address (e.g., user@example.com)");
        return false;
    } else {
        removeErrorMessage(emailInput);
        return true;
    }
}
function validatePassword(passwordInput) {
    const password = passwordInput.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        createErrorMessage(passwordInput, "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character.");
        return false;
    } else {
        removeErrorMessage(passwordInput);
        return true;
    }
}
function validateConfirmPassword(passwordInput, confirmPasswordInput) {
    const password = passwordInput.value;
    const confPassword = confirmPasswordInput.value;
    if (password !== confPassword) {
        createErrorMessage(confirmPasswordInput, "Passwords do not match.");
        return false;
    } else {
        removeErrorMessage(confirmPasswordInput);
        return true;
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"HID90":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "SignUp", ()=>SignUp);
var _stateManagerJs = require("../utils/StateManager.js");
var _buttonJs = require("./Button.js");
var _formValidationJs = require("../utils/FormValidation.js");
const SignUp = (0, _stateManagerJs.createComponent)((props)=>{
    const form = document.createElement('div');
    form.className = `w-[93vw] sm:w-96 bg-white rounded-lg p-4 sm:p-8  ${props.styles || ''}`;
    form.innerHTML = `
	<div class="flex flex-col gap-5">
	  <h1 class="text-2xl font-bold text-center underline">Create a new Account</h1>
	  <form class="flex flex-col gap-3">
		<div>
		  <label for="email" class="block text-base font-medium text-gray-700">Email</label>
		  <div>
		  	<input type="email" id="email" placeholder="Enter an email: user@example.com" autocomplete="email" name="email" class="relative w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base">
		  </div> 
		</div>
		<div>
		  <label for="password" class="block text-base font-medium text-gray-700">Password</label>
		  <div class="relative mt-1">
		  	<div>
				<input type="password" id="password" placeholder="Enter a strong Password" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password text-lg">
			  <i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
		  </div>
		</div>
		<div>
			<label for="conf-password" class="block text-base font-medium text-gray-700">Confirm Password</label>
			<div class="relative mt-1">
			<div>
				<input type="password" id="conf-password" placeholder="Retype your password" autocomplete="current-password" name="password" class="relative w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--main-color)] focus:border-[var(--main-color)] sm:text-base pr-10">
			</div>
			<span class="absolute inset-y-0 right-0 flex items-center h-fit py-3 pr-3 cursor-pointer toggle-password text-lg">
				<i class='bx bx-hide hide-show pointer-events-none'></i>
			</span>
			</div>
	  	</div>
		<!-- SignUp Button -->
	  </form>
	  <div class="w-full text-center pt-1">
	  	Already have an Account? <span class="signin-link hover:cursor-pointer hover:opacity-80 text-[var(--main-color)]">Let's Login</span>
	  </div>
	</div>
	`;
    const formElement = form.querySelector('form');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#conf-password');
    const signUpButton = (0, _buttonJs.Button)({
        type: 'submit',
        text: 'Sign Up',
        styles: 'w-full font-semibold p-2 text-base text-white',
        eventType: 'click',
        onClick: (e)=>{
            if (!(0, _formValidationJs.validateEmail)(emailInput) || !(0, _formValidationJs.validatePassword)(passwordInput) || !(0, _formValidationJs.validateConfirmPassword)(passwordInput, confirmPasswordInput)) e.preventDefault();
            else console.log('email and pass are nice!');
        }
    });
    formElement.appendChild(signUpButton);
    const signinLink = form.querySelector('.signin-link');
    signinLink.addEventListener('click', (e)=>{
        e.preventDefault();
        if (props.onSwitchToSignIn) props.onSwitchToSignIn();
    });
    const togglePassword = form.querySelectorAll('.toggle-password');
    const eyeIcon = togglePassword[0].querySelector('.hide-show');
    const confEyeIcon = togglePassword[1].querySelector('.hide-show');
    const handleTogglePassword = (e)=>{
        e.preventDefault();
        const wasPassword = passwordInput.type === 'password';
        passwordInput.type = wasPassword ? 'text' : 'password';
        confirmPasswordInput.type = passwordInput.type;
        eyeIcon.classList.remove('bx-show', 'bx-hide');
        eyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
        confEyeIcon.classList.remove('bx-show', 'bx-hide');
        confEyeIcon.classList.add(wasPassword ? 'bx-show' : 'bx-hide');
    };
    togglePassword[0].addEventListener('click', handleTogglePassword);
    togglePassword[1].addEventListener('click', handleTogglePassword);
    (0, _stateManagerJs.useCleanup)(()=>togglePassword[0].removeEventListener('click', handleTogglePassword));
    (0, _stateManagerJs.useCleanup)(()=>togglePassword[1].removeEventListener('click', handleTogglePassword));
    return form;
});

},{"../utils/StateManager.js":"gx27U","./Button.js":"a24OL","../utils/FormValidation.js":"eneDa","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"PczXh":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "PongAnimation", ()=>PongAnimation);
class PongAnimation {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 12,
            dx: 4,
            dy: 4
        };
        this.paddles = {
            left: {
                y: this.canvas.height / 2 - 50,
                height: 120
            },
            right: {
                y: this.canvas.height / 2 - 50,
                height: 120
            }
        };
        // Animation frame reference
        this.animationFrame = null;
        this.init();
    }
    resize() {
        if (window.matchMedia("(max-width: 640px)").matches) {
            this.canvas.width = window.innerHeight;
            this.canvas.height = window.innerWidth;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    init() {
        // Add resize listener
        window.addEventListener('resize', ()=>this.resize());
        // Start animation loop
        this.animate();
    }
    draw() {
        if (this.ctx === null) return;
        // Clear canvas
        this.ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'; // Match bg-gray-900 with opacity
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw center line
        this.ctx.setLineDash([
            5,
            15
        ]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        // Enable glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'; // White glow
        // Draw ball with glow
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white'; // Ball color
        this.ctx.fill();
        // Draw paddles with glow
        this.ctx.fillRect(20, this.paddles.left.y, 20, this.paddles.left.height);
        this.ctx.fillRect(this.canvas.width - 30, this.paddles.right.y, 20, this.paddles.right.height);
        // Reset glow effect after drawing
        this.ctx.shadowBlur = 0;
    }
    update() {
        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        // Ball collision with top/bottom
        if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) this.ball.dy *= -1;
        // Ball collision with paddles
        if (this.ball.x - this.ball.radius < 30 && this.ball.y > this.paddles.left.y && this.ball.y < this.paddles.left.y + this.paddles.left.height || this.ball.x + this.ball.radius > this.canvas.width - 30 && this.ball.y > this.paddles.right.y && this.ball.y < this.paddles.right.y + this.paddles.right.height) this.ball.dx *= -1;
        // Reset ball if it goes out
        if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
        }
        // Move paddles
        this.paddles.left.y += (this.ball.y - (this.paddles.left.y + 50)) * 0.1;
        this.paddles.right.y += (this.ball.y - (this.paddles.right.y + 50)) * 0.1;
    }
    animate() {
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(()=>this.animate());
    }
    destroy() {
        if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
        window.removeEventListener('resize', this.resize);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kGuWM":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _buttonJs = require("../components/Button.js");
var _routerJs = require("../router.js");
exports.default = {
    render: (container)=>{
        container.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
		  <div class="text-center page-body">
			<!-- 404 Icon -->
			<i class='bx bx-ghost text-9xl 2xl:text-[16rem] mb-6 drop-shadow-[1px_1px_20px_white] animate-pulse '></i>
			
			<!-- Title -->
			<h1 class="text-6xl 2xl:text-[6rem] font-bold mb-4">404</h1>
			
			<!-- Subtitle -->
			<h2 class="text-2xl 2xl:text-4xl font-semibold mb-8">Page Not Found</h2>
			
			<!-- Message -->
			<p class="text-gray-400 mb-8 max-w-md mx-auto 2xl:text-lg">
			  Oops! The page you're looking for has vanished like a ghost. Let's get you back to the game!
			</p>
			
			<!-- Back to Home Button -->

		  </div>
		</div>
	  `;
        const HomeBtn = (0, _buttonJs.Button)({
            text: '<i class="bx bx-home text-xl mr-2"></i> Back to Home',
            styles: 'inline-flex px-6 2xl:px-8 py-3 2xl:py-5 text-white bg-[var(--main-color)] font-semibold sm:text-lg 2xl:text-xl rounded-lg',
            type: 'button',
            eventType: 'click',
            onClick: (e)=>(0, _routerJs.navigate)('/')
        });
        container.querySelector('.page-body').appendChild(HomeBtn);
    }
};

},{"../components/Button.js":"a24OL","../router.js":"4QFWt","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["cAPdp","jeorp"], "jeorp", "parcelRequire94c2")

//# sourceMappingURL=index.b7a05eb9.js.map
