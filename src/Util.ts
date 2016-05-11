namespace ex.Extensions.Pack.Util {
   
   /**
    * Whether or not a given filename ends with any of the provided extensions (without a '.')
    */
   export function hasFileExtensions(filename: string, ...extensions: string[]) {
      var paths = filename.split('/');
      var file = paths[paths.length - 1];
      var parts = file.split('.');
      var extension = parts[parts.length - 1];
      
      return extensions.indexOf(extension) > -1;
   }
   
   export function wrapGenericResource(file: PackManifestFile, zip: JSZip, handler: (zipFile: JSZipObject) => any): ex.Resource<any> {
      var resource = new ex.Resource<any>(<string>file.path, 'application/octet-binary');
      resource.processData = handler;
      resource.setData(zip.file(<string>file.path));
      
      return resource;
   }
   
   export function createBlob(zipFile: JSZipObject): Blob {
      return new Blob([zipFile.asUint8Array()], { type: 'application/octet-binary' });
   }
}