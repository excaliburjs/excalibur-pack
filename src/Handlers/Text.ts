namespace ex.Extensions.Pack.Handlers {
   
   export var text: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         return Util.hasFileExtensions(filename, 'txt');
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
                 
         return Util.wrapGenericResource(file, zip, (zipFile) => {
            if (!zipFile) return null;
            
            return zipFile.asText();
         });
      }
   }
   
}