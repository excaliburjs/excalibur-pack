/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
declare namespace ex.Extensions.Pack {
    enum ManifestFileType {
        Sound = 0,
        Texture = 1,
        Generic = 2,
    }
}
declare namespace ex.Extensions.Pack {
}
declare namespace ex.Extensions.Pack {
    interface PackManifestFile {
        type: ManifestFileType;
        path: string | string[];
        name: string;
        resourceType?: string;
        responseType?: string;
    }
}
declare namespace ex.Extensions.Pack {
    class PackFile extends ex.Resource<{
        [key: string]: ILoadable;
    }> {
        factories: {
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
        }, factories?: {
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
