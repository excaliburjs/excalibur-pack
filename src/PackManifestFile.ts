namespace ex.Extensions.Pack {   
   
   export interface PackManifestFile {
      
      type: ManifestFileType;
      
      path: string|string[];
      
      name: string;
      
      //
      // Generic resource options
      //
      
      resourceType?: string;
      responseType?: string;
   }
}