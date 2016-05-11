namespace ex.Extensions.Pack.Handlers {
   
   export var blob: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         // must use explicitly
         return false;
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
                 
         return Util.wrapGenericResource(file, zip, (zipFile) => {
            if (!zipFile) return null;
            
            var blob = Util.createBlob(zipFile);
            var blobUrl = URL.createObjectURL(blob);
            
            ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `blob` for file", zipFile.name, blobUrl);
            
            return blobUrl;
         });
      }
   }
   
}