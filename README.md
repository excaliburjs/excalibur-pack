# excalibur-pack

Excalibur.js utility and extension that makes it easy to pack 
up assets (during build) and load them in-game.

# Features

- Load assets from a compressed file
- Pack assets during build/compilation of your game (Gulp/Grunt)

# Quickstart

In your grunt/gulp file, you need to define the asset paths and types you want
to load in the pack file.

```js
// grunt task
excalibur_pack: {
   
   packs: [
      {
         // name of pack file
         name: "sounds",
         
         // type of resource
         // options: sound, texture, binary
         type: "sound",
         
         // output filename (override global outFile)
         outFile: "sounds.expack",
         
         // output directory (override global outDir)
         outDir: "assets/packs",
         
         // load all files into pack, with default keys and uses
         // filename to create fallback values
         files: "assets/sounds/**/*.{mp3,wav}",
         
         // custom file hashmap using custom keys
         // that will be used when loading into Excalibur
         files: {
            
            // fallback values (array)
            foo: ["assets/sounds/foo.mp3", "assets/sounds/foo.wav"],
            
            // single value
            bar: "assets/sounds/bar.wav"
         }
      }
   ],
   
   // global options
   options: {
      
      // output directory for all pack files
      outDir: "assets/packs",
      
      // compression algorithm to use
      // options: DEFLATE, null
      compression: "DEFLATE"
   }
}

```

```ts
// define a structure to load asset references into
var PackFileResource = ex.Extensions.Pack.PackFileResource;

var Resources = {
   Sounds: <SoundResources>{}
};

var loader = new ex.Loader();

// reference asset pack file
loader.addResource(
   new PackFileResource("assets/sounds.expack", Resources.Sounds));

game.start(loader).then(() => {
  
  // reference an asset from loaded pack file
  var sprite = new ex.Sprite(Resources.Sounds.foo);
   
});
```