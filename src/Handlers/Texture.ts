namespace ex.Extensions.Pack.Handlers {
   
   export var texture: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         return Util.hasFileExtensions(filename, 'jpg', 'png', 'gif');
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
         var resource = new ex.Texture(<string>file.path, this.bustCache);
         var zf = zip.file(<string>file.path);
                              
         resource.setData(Util.createBlob(zf));
         
         ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `texture` for file", zf.name);
         
         return resource;
      }
   }
   
}