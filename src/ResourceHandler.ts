namespace ex.Extensions.Pack {
   
   /**
    * An object that can handle a resource type
    */
   export interface ResourceHandler {
      
      /**
       * Whether or not this handler can handle the provided file. Usually based on
       * file extension. Return `false` if user must explicitly use specify to use 
       * this resource handler.
       */
      canHandle(filename: string): boolean;
      
      /**
       * A callback to return an Excalibur `ILoadable` to pass to the loader. Use this to
       * create and populate resources.
       */
      handle(file: PackManifestFile, zip: JSZip): ILoadable;
   }
}