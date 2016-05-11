/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
declare namespace ex.Extensions.Pack {
    interface PackManifest {
        /**
         * List of asset file definitions
        */
        files: PackManifestFile[];
    }
}
declare namespace ex.Extensions.Pack {
    interface PackManifestFile {
        type: string;
        path: string | string[];
        name: string;
    }
}
declare namespace ex.Extensions.Pack {
    class PackFile extends ex.Resource<{
        [key: string]: ILoadable;
    }> {
        typeHandlers: {
            [key: string]: (zipFile: JSZipObject) => any;
        };
        private _resourceObj;
        /**
         * Load a pack file
         *
         * @param path The path to the pack file
         * @param factories Handlers for generic resource types that take a JSZipObject and return the processed data
         * @param resourceObj A reference to an object to attach loaded assets to
         */
        constructor(path: string, resourceObj: {
            [key: string]: ILoadable;
        }, typeHandlers?: {
            [key: string]: (zipFile: JSZipObject) => any;
        }, bustCache?: boolean);
        /**
         * Overrides processDownload and decompresses/unzips the pack file
         */
        processData(data: any): {
            [key: string]: ILoadable;
        };
    }
}
declare namespace ex.Extensions.Pack {
    /**
     * An object that can handle a resource type
     */
    interface ResourceHandler {
        /**
         * Whether or not this handler can handle the provided file. Usually based on
         * file extension. Return `false` if user must explicitly use specify to use
         * this resource handler.
         */
        canHandle(filename: string): boolean;
        /**
         * A callback to return an Excalibur `ILoadable` to pass to the loader. Use this to
         * create and populate resources.
         */
        handle(file: PackManifestFile, zip: JSZip): ILoadable;
    }
}
declare namespace ex.Extensions.Pack.Util {
    /**
     * Whether or not a given filename ends with any of the provided extensions (without a '.')
     */
    function hasFileExtensions(filename: string, ...extensions: string[]): boolean;
    function wrapGenericResource(file: PackManifestFile, zip: JSZip, handler: (zipFile: JSZipObject) => any): ex.Resource<any>;
    function createBlob(zipFile: JSZipObject): Blob;
}
declare namespace ex.Extensions.Pack.Handlers {
    var binary: ResourceHandler;
}
declare namespace ex.Extensions.Pack.Handlers {
    var blob: ResourceHandler;
}
declare namespace ex.Extensions.Pack.Handlers {
    var json: ResourceHandler;
}
declare namespace ex.Extensions.Pack.Handlers {
    var sound: ResourceHandler;
}
declare namespace ex.Extensions.Pack.Handlers {
    var text: ResourceHandler;
}
declare namespace ex.Extensions.Pack.Handlers {
    var texture: ResourceHandler;
}
