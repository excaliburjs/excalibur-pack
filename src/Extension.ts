/// <reference path="../Excalibur/dist/Excalibur.d.ts" />
/// <reference path="../lib/jszip.d.ts" />
/// <reference path="ManifestFileType.ts" />
/// <reference path="PackManifest.ts" />
/// <reference path="PackManifestFile.ts" />

namespace ex.Extensions.Pack {           
   
   export class PackFile extends ex.Resource<{[key: string]: ILoadable}> {
      
      private _resourceObj: {[key: string]: ILoadable};
      
      /**
       * Load a pack file
       * 
       * @param path The path to the pack file
       * @param factories Handlers for generic resource types that take a JSZipObject and return the processed data
       * @param resourceObj A reference to an object to attach loaded assets to
       */
      constructor(path: string, resourceObj: {[key: string]: ILoadable}, public factories: {[key: string]: (zipFile: JSZipObject) => any} = {}, bustCache = false) {
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
      public processData(data: any): {[key: string]: ILoadable} {
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
            
            // load assets according to manifest
            for (var file of manifest.files) {
               
               // process file
               var resource: ILoadable;
               
               switch (file.type) {
                  case ManifestFileType.Sound:
                     var paths: string[] = typeof file.path === "string" ? [<string>file.path] : <string[]>file.path;
                     resource = new (Function.prototype.bind.apply(ex.Sound, paths));
                     
                     var zf = zip.file((<ex.Sound>resource).sound.path);
                     
                     // try arraybuffer (WebAudio)
                     try {
                           resource.setData(zf.asArrayBuffer());
                     } catch (e) {
                        // try blob (AudioTag)
                        resource.setData(new Blob([
                              zip.file((<ex.Sound>resource).sound.path).asUint8Array()
                        ], { type: 'application/octet-binary' }));
                     }
                     
                     break;
                  case ManifestFileType.Texture:
                     resource = new ex.Texture(<string>file.path, this.bustCache);
                     
                     resource.setData(new Blob([
                        zip.file(<string>file.path).asUint8Array()
                     ], { type: 'application/octet-binary' }));                     
                     
                     break;
                  case ManifestFileType.Generic:
                     if (!file.factory) {
                        ex.Logger.getInstance().warn(`No resource factory defined for asset ${file.path}, skipping resource...`);
                        continue;
                     }
                     var resourceFactory = this.factories[file.factory];
                     if (!resourceFactory) {
                        ex.Logger.getInstance().warn(`The factory function '${file.factory}' was not found for resource ${file.path}, skipping resource...`);
                        continue;
                     }
                     resource = new ex.Resource<any>(file.path, '');
                     resource.processData = resourceFactory;
                     resource.setData(zip.file(<string>file.path));
                     break;
               }
               
               // load immediately to resolve pending promises
               resource.load();
               
               // populate resource hashmap
               this._resourceObj[file.name] = resource;                             
            }
            
            return this._resourceObj;
         }
      }
   }    
   
   /**
    * Finds a function from its string representation, if it exists.
    *
    * @param str The function name
    * @see http://stackoverflow.com/a/2441972
    */
   var strToFn = function strToFn(fnName: string, scope: any): any {
      
      // split namespaces
      var arr = fnName.split(".");

      // access scope to find function
      var fn: {} = (scope || window || this), i: number, len: number;    
      
      // find function starting from global namespace  
      for (i = 0, len = arr.length; i < len; i++) {
         fn = fn[arr[i]];
      }
      
      return <FunctionConstructor>fn;
   } 
}