namespace ex.Extensions.Pack.Handlers {
   
   export var binary: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         // must use explicitly
         return false;
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
                 
         return Util.wrapGenericResource(file, zip, (zipFile) => {
            if (!zipFile) return null;
            
            return zipFile.asBinary();
         });
      }
   }
   
}