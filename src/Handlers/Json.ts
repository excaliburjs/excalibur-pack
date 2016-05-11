namespace ex.Extensions.Pack.Handlers {
   
   export var json: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         return Util.hasFileExtensions(filename, 'json');
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
                 
         return Util.wrapGenericResource(file, zip, (zipFile) => {
            if (!zipFile) return null;
            
            var json = JSON.parse(zipFile.asText());
            
            ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `json` for file", zipFile.name, json);
            
            return json;
         });
      }
   }
   
}