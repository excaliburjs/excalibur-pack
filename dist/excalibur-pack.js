var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            (function (ManifestFileType) {
                ManifestFileType[ManifestFileType["Sound"] = 0] = "Sound";
                ManifestFileType[ManifestFileType["Texture"] = 1] = "Texture";
                ManifestFileType[ManifestFileType["Generic"] = 2] = "Generic";
            })(Pack.ManifestFileType || (Pack.ManifestFileType = {}));
            var ManifestFileType = Pack.ManifestFileType;
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
/// <reference path="ManifestFileType.ts" />
/// <reference path="PackManifest.ts" />
/// <reference path="PackManifestFile.ts" />
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var PackFile = (function (_super) {
                __extends(PackFile, _super);
                /**
                 * Load a pack file
                 *
                 * @param path The path to the pack file
                 * @param factories Handlers for generic resource types that take a JSZipObject and return the processed data
                 * @param resourceObj A reference to an object to attach loaded assets to
                 */
                function PackFile(path, resourceObj, factories, bustCache) {
                    if (factories === void 0) { factories = {}; }
                    if (bustCache === void 0) { bustCache = false; }
                    _super.call(this, path, "arraybuffer", bustCache);
                    this.factories = factories;
                    // ensure we have a valid object to attach properties to
                    if (!resourceObj || typeof resourceObj !== "object") {
                        throw "Must pass a reference object to fill resource hash on";
                    }
                    this._resourceObj = resourceObj;
                }
                /**
                 * Overrides processDownload and decompresses/unzips the pack file
                 */
                PackFile.prototype.processData = function (data) {
                    if (data) {
                        ex.Logger.getInstance().debug("Loading '" + this.path + "' pack file");
                        // load zip data (binary arraybuffer)            
                        var zip = new JSZip(data);
                        ex.Logger.getInstance().debug("Discovering manifest.json in pack file " + this.path);
                        // load manifest file to find paths to assets (and type)
                        var manifestFile = zip.file("manifest.json");
                        if (!manifestFile) {
                            // fatal error, can't read pack file
                            throw "Could not find manifest.json in pack file " + this.path;
                        }
                        // read JSON from manifest
                        var manifest = JSON.parse(manifestFile.asText());
                        // load assets according to manifest
                        for (var _i = 0, _a = manifest.files; _i < _a.length; _i++) {
                            var file = _a[_i];
                            // process file
                            var resource;
                            switch (file.type) {
                                case Pack.ManifestFileType.Sound:
                                    var paths = typeof file.path === "string" ? [file.path] : file.path;
                                    resource = new (Function.prototype.bind.apply(ex.Sound, paths));
                                    var zf = zip.file(resource.sound.path);
                                    // try arraybuffer (WebAudio)
                                    try {
                                        resource.setData(zf.asArrayBuffer());
                                    }
                                    catch (e) {
                                        // try blob (AudioTag)
                                        resource.setData(new Blob([
                                            zip.file(resource.sound.path).asUint8Array()
                                        ], { type: 'application/octet-binary' }));
                                    }
                                    break;
                                case Pack.ManifestFileType.Texture:
                                    resource = new ex.Texture(file.path, this.bustCache);
                                    resource.setData(new Blob([
                                        zip.file(file.path).asUint8Array()
                                    ], { type: 'application/octet-binary' }));
                                    break;
                                case Pack.ManifestFileType.Generic:
                                    if (!file.factory) {
                                        ex.Logger.getInstance().warn("No resource factory defined for asset " + file.path + ", skipping resource...");
                                        continue;
                                    }
                                    var resourceFactory = this.factories[file.factory];
                                    if (!resourceFactory) {
                                        ex.Logger.getInstance().warn("The factory function '" + file.factory + "' was not found for resource " + file.path + ", skipping resource...");
                                        continue;
                                    }
                                    resource = new ex.Resource(file.path, '');
                                    resource.processData = resourceFactory;
                                    resource.setData(zip.file(file.path));
                                    break;
                            }
                            // load immediately to resolve pending promises
                            resource.load();
                            // populate resource hashmap
                            this._resourceObj[file.name] = resource;
                        }
                        return this._resourceObj;
                    }
                };
                return PackFile;
            }(ex.Resource));
            Pack.PackFile = PackFile;
            /**
             * Finds a function from its string representation, if it exists.
             *
             * @param str The function name
             * @see http://stackoverflow.com/a/2441972
             */
            var strToFn = function strToFn(fnName, scope) {
                // split namespaces
                var arr = fnName.split(".");
                // access scope to find function
                var fn = (scope || window || this), i, len;
                // find function starting from global namespace  
                for (i = 0, len = arr.length; i < len; i++) {
                    fn = fn[arr[i]];
                }
                return fn;
            };
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
