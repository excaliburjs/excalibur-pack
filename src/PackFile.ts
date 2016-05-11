/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
/// <reference path="PackManifest.ts" />
/// <reference path="PackManifestFile.ts" />

namespace ex.Extensions.Pack {

   export class PackFile extends ex.Resource<{ [key: string]: ILoadable }> {

      private _resourceObj: { [key: string]: ILoadable };

      /**
       * Load a pack file
       * 
       * @param path The path to the pack file
       * @param factories Handlers for generic resource types that take a JSZipObject and return the processed data
       * @param resourceObj A reference to an object to attach loaded assets to
       */
      constructor(path: string, resourceObj: { [key: string]: ILoadable }, public typeHandlers: { [key: string]: (zipFile: JSZipObject) => any } = {}, bustCache = false) {
         super(path, "arraybuffer", bustCache);

         // ensure we have a valid object to attach properties to
         if (!resourceObj || typeof resourceObj !== "object") {
            throw "Must pass a reference object to fill resource hash on";
         }

         this._resourceObj = resourceObj;
      }

      /**
       * Overrides processDownload and decompresses/unzips the pack file
       */
      public processData(data: any): { [key: string]: ILoadable } {
         if (data) {

            ex.Logger.getInstance().debug(`Loading '${this.path}' pack file`);

            // load zip data (binary arraybuffer)            
            var zip = new JSZip(data);

            ex.Logger.getInstance().debug(`Discovering manifest.json in pack file ${this.path}`);

            // load manifest file to find paths to assets (and type)
            var manifestFile = zip.file("manifest.json");

            if (!manifestFile) {

               // fatal error, can't read pack file
               throw "Could not find manifest.json in pack file " + this.path;
            }

            // read JSON from manifest
            var manifest = <PackManifest>JSON.parse(manifestFile.asText());
            var loaded = 0;
            
            // load assets according to manifest
            for (var file of manifest.files) {

               // process file
               var resource: ILoadable;
               var resourceHandler: ResourceHandler;
               var handlers = ex.Extensions.Pack.Handlers;

               // iterate all handlers
               for (var type in handlers) {
                  if (!handlers.hasOwnProperty(type)) continue;
                     
                  // override matcher and use this handler
                  if (file.type === type) {
                     resourceHandler = handlers[type];
                     break;
                  }
                  
                  // check if handler can handle this file extension(s)
                  let h: ResourceHandler = handlers[type];
                  
                  if (!h.canHandle) continue;
                  
                  if (typeof file.path === "string" && h.canHandle(<string>file.path)) {
                     resourceHandler = h;
                     break;
                  } else if (file.path instanceof Array) {
                     
                     // check each path
                     for (var path of file.path) {
                        
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
      }
   }
}