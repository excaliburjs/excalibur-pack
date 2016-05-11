namespace ex.Extensions.Pack.Handlers {
   
   export var sound: ResourceHandler = {
      
      canHandle: function(filename: string): boolean {
         return Util.hasFileExtensions(filename, 'wav', 'mp3', 'ogg');
      },
      
      handle: function(file: PackManifestFile, zip: JSZip): ILoadable {
         var paths: string[] = typeof file.path === "string" ? [<string>file.path] : <string[]>file.path;
         var resource = new (Function.prototype.bind.apply(ex.Sound, paths));
         
         var zf = zip.file((<ex.Sound>resource).sound.path);
         
         // try arraybuffer (WebAudio)
         try {
               resource.setData(zf.asArrayBuffer());
         } catch (e) {
            // try blob (AudioTag)
            resource.setData(new Blob([
                  zf.asUint8Array()
            ], { type: 'application/octet-binary' }));
         }
         
         ex.Logger.getInstance().debug("[ex.Extensions.Pack] Loaded resource type `sound` for file", zf.name);
         
         return resource;
      }
   }
   
}