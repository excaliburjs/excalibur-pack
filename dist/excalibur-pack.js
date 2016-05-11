var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
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
                function PackFile(path, resourceObj, typeHandlers, bustCache) {
                    if (typeHandlers === void 0) { typeHandlers = {}; }
                    if (bustCache === void 0) { bustCache = false; }
                    _super.call(this, path, "arraybuffer", bustCache);
                    this.typeHandlers = typeHandlers;
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
                        var loaded = 0;
                        // load assets according to manifest
                        for (var _i = 0, _a = manifest.files; _i < _a.length; _i++) {
                            var file = _a[_i];
                            // process file
                            var resource;
                            var resourceHandler;
                            var handlers = ex.Extensions.Pack.Handlers;
                            // iterate all handlers
                            for (var type in handlers) {
                                if (!handlers.hasOwnProperty(type))
                                    continue;
                                // override matcher and use this handler
                                if (file.type === type) {
                                    resourceHandler = handlers[type];
                                    break;
                                }
                                // check if handler can handle this file extension(s)
                                var h = handlers[type];
                                if (!h.canHandle)
                                    continue;
                                if (typeof file.path === "string" && h.canHandle(file.path)) {
                                    resourceHandler = h;
                                    break;
                                }
                                else if (file.path instanceof Array) {
                                    // check each path
                                    for (var _b = 0, _c = file.path; _b < _c.length; _b++) {
                                        var path = _c[_b];
                                        // handles at least one of the files
                                        if (h.canHandle(path)) {
                                            resourceHandler = h;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!resourceHandler) {
                                ex.Logger.getInstance().warn("Could not find resource handler for file", file, "of type", file.type);
                                continue;
                            }
                            // handle resource
                            resource = resourceHandler.handle(file, zip);
                            // load immediately to resolve pending promises
                            resource.load();
                            // progress               
                            loaded++;
                            this.onprogress({ loaded: loaded, total: manifest.files.length });
                            // populate resource hashmap
                            this._resourceObj[file.name] = resource;
                        }
                        return this._resourceObj;
                    }
                };
                return PackFile;
            }(ex.Resource));
            Pack.PackFile = PackFile;
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Util;
            (function (Util) {
                /**
                 * Whether or not a given filename ends with any of the provided extensions (without a '.')
                 */
                function hasFileExtensions(filename) {
                    var extensions = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        extensions[_i - 1] = arguments[_i];
                    }
                    var paths = filename.split('/');
                    var file = paths[paths.length - 1];
                    var parts = file.split('.');
                    var extension = parts[parts.length - 1];
                    return extensions.indexOf(extension) > -1;
                }
                Util.hasFileExtensions = hasFileExtensions;
                function wrapGenericResource(file, zip, handler) {
                    var resource = new ex.Resource(file.path, 'application/octet-binary');
                    resource.processData = handler;
                    resource.setData(zip.file(file.path));
                    return resource;
                }
                Util.wrapGenericResource = wrapGenericResource;
                function createBlob(zipFile) {
                    return new Blob([zipFile.asUint8Array()], { type: 'application/octet-binary' });
                }
                Util.createBlob = createBlob;
            })(Util = Pack.Util || (Pack.Util = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.binary = {
                    canHandle: function (filename) {
                        // must use explicitly
                        return false;
                    },
                    handle: function (file, zip) {
                        return Pack.Util.wrapGenericResource(file, zip, function (zipFile) {
                            if (!zipFile)
                                return null;
                            return zipFile.asBinary();
                        });
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.blob = {
                    canHandle: function (filename) {
                        // must use explicitly
                        return false;
                    },
                    handle: function (file, zip) {
                        return Pack.Util.wrapGenericResource(file, zip, function (zipFile) {
                            if (!zipFile)
                                return null;
                            var blob = Pack.Util.createBlob(zipFile);
                            var blobUrl = URL.createObjectURL(blob);
                            ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `blob` for file", zipFile.name, blobUrl);
                            return blobUrl;
                        });
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.json = {
                    canHandle: function (filename) {
                        return Pack.Util.hasFileExtensions(filename, 'json');
                    },
                    handle: function (file, zip) {
                        return Pack.Util.wrapGenericResource(file, zip, function (zipFile) {
                            if (!zipFile)
                                return null;
                            var json = JSON.parse(zipFile.asText());
                            ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `json` for file", zipFile.name, json);
                            return json;
                        });
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.sound = {
                    canHandle: function (filename) {
                        return Pack.Util.hasFileExtensions(filename, 'wav', 'mp3', 'ogg');
                    },
                    handle: function (file, zip) {
                        var paths = typeof file.path === "string" ? [file.path] : file.path;
                        var resource = new (Function.prototype.bind.apply(ex.Sound, paths));
                        var zf = zip.file(resource.sound.path);
                        // try arraybuffer (WebAudio)
                        try {
                            resource.setData(zf.asArrayBuffer());
                        }
                        catch (e) {
                            // try blob (AudioTag)
                            resource.setData(new Blob([
                                zf.asUint8Array()
                            ], { type: 'application/octet-binary' }));
                        }
                        ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `sound` for file", zf.name);
                        return resource;
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.text = {
                    canHandle: function (filename) {
                        return Pack.Util.hasFileExtensions(filename, 'txt');
                    },
                    handle: function (file, zip) {
                        return Pack.Util.wrapGenericResource(file, zip, function (zipFile) {
                            if (!zipFile)
                                return null;
                            return zipFile.asText();
                        });
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var ex;
(function (ex) {
    var Extensions;
    (function (Extensions) {
        var Pack;
        (function (Pack) {
            var Handlers;
            (function (Handlers) {
                Handlers.texture = {
                    canHandle: function (filename) {
                        return Pack.Util.hasFileExtensions(filename, 'jpg', 'png', 'gif');
                    },
                    handle: function (file, zip) {
                        var resource = new ex.Texture(file.path, this.bustCache);
                        var zf = zip.file(file.path);
                        resource.setData(Pack.Util.createBlob(zf));
                        ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `texture` for file", zf.name);
                        return resource;
                    }
                };
            })(Handlers = Pack.Handlers || (Pack.Handlers = {}));
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
