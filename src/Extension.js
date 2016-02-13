/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
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
            var ManifestFileType;
            (function (ManifestFileType) {
                ManifestFileType[ManifestFileType["Sound"] = 0] = "Sound";
                ManifestFileType[ManifestFileType["Texture"] = 1] = "Texture";
                ManifestFileType[ManifestFileType["Generic"] = 2] = "Generic";
            })(ManifestFileType || (ManifestFileType = {}));
            // split namespaces
            var arr = fnName.split(".");
            // access global scope to find function
            var fn = (window || this), i, len;
            // find function starting from global namespace  
            for (i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }
            return fn;
        })(Pack = Extensions.Pack || (Extensions.Pack = {}));
    })(Extensions = ex.Extensions || (ex.Extensions = {}));
})(ex || (ex = {}));
var PackFile = (function (_super) {
    __extends(PackFile, _super);
    /**
     * Load a pack file
     *
     * @param path The path to the pack file
     * @param resourceObj A reference to an object to attach loaded assets to
     */
    function PackFile(path, resourceObj, bustCache) {
        if (bustCache === void 0) { bustCache = false; }
        _super.call(this, path, "arraybuffer", bustCache);
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
                var data;
                switch (file.type) {
                    case ManifestFileType.Sound:
                        var paths = typeof file.path === "string" ? [file.path] : file.path;
                        resource = ex.Sound.apply(this, paths);
                        data = zip.file(resource.sound.path);
                        break;
                    case ManifestFileType.Texture:
                        resource = new ex.Texture(file.path, this.bustCache);
                        data = zip.file(file.path);
                        break;
                    case ManifestFileType.Generic:
                        if (!file.resourceType) {
                            ex.Logger.getInstance().warn("No resource type found for asset " + file.path + ", skipping resource...");
                            continue;
                        }
                        var fn = strToFn(file.resourceType);
                        if (!fn) {
                            ex.Logger.getInstance().warn("The function prototype '" + file.resourceType + "' was not found for resource " + file.path + ", skipping resource...");
                            continue;
                        }
                        resource = new fn(file.path, file.responseType, this.bustCache);
                        break;
                }
                // load and process resource
                resource.processData(data);
                // populate resource hashmap
                this._resourceObj[file.name] = resource;
            }
            return this._resourceObj;
        }
    };
    return PackFile;
})(ex.Resource);
exports.PackFile = PackFile;
