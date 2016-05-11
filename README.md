# excalibur-pack

Excalibur.js utility and extension that makes it easy to pack 
up assets (during build) and load them in-game.

# Features

- Load assets from a compressed file
- Pack assets during build/compilation of your game (Gulp/Grunt)

# Quickstart

Install the extension via bower:

    bower install excalibur-pack

Include a reference to the `excalibur-pack.js` file **after** the Excalibur.js reference.

## Make some assets

Let's say you have some images and sounds in the following directories:

- assets/tx
- assets/sd

To pack up those directories into an `expack` file, you will need to use a task-runner tool like Grunt or Gulp to
pack up the directories into a pack file. You can also manually define a `manifest.json` file and zip up the contents 
of a folder. See *Creating a Custom Manifest*.

Once you have generated an `expack` or `zip` file, you can now load it using the extension.

On the start of your game, define a `PackFile` resource to load your asset pack file. You must pass in
a reference to a Javacript object to **be populated** by the pack file. The keys of the object
will correspond to the pack definition you defined in your build script (reflected in a `manifest.json`
file inside the pack file).

```ts
// shortcut type alias
type PackFile = ex.Extensions.Pack.PackFile;

// define a structure to load asset references into
interface Assets {
  snd: ex.Sound;
  img: ex.Texture;
}
var Resources: Assets = {};

var loader = new ex.Loader();

// reference asset pack file
loader.addResource(
   new PackFile("assets/assets.expack", Resources));

game.start(loader).then(() => {
  
  // reference an asset from loaded pack file
  Resources.snd.play();
  
  var spr = Resources.img.asSprite();
   
});
```

Refer to `test\index.html` for an example.

## Resource Handlers

Excalibur Pack supports "resource handlers" which are just simple objects that have two methods `canHandle` and `handle`. If
a resource handler specifies it can handle a file in the asset pack, it will process the file and create an Excalibur resource.

Excalibur Pack has several built-in handlers already:

- `texture` - A handler that will create Excalibur `Texture` resources from PNG, GIF, and JPG files
- `sound` - A handler that will create Excalibur `Sound` resources from WAV, MP3, and OGG files
- `json` - A handler which will return a generic Excalibur `Resource` with a JSON object parsed from a JSON file
- `text` - A handler which will return a generic Excalibur `Resource` with the plain text from a TXT file
- `binary` - A handler which will return a generic Excalibur `Resource` with the binary data from a file
- `blob` - A handler which will return a generic Excalibur `Resource` with a `Blob` object from a file

You can **explicitly** set a resource handler by specifying the `type` property in your build definition. This will
override the automatic selection mechanism and use that handler.

## Creating a Custom Resource Handler

You can define your own custom resource handler and attach it to the `ex.Extensions.Pack.Handlers` namespace/object:

```js
ex.Extensions.Pack.Handlers.custom = {
   canHandle: function (filename) {
      return ex.Extensions.Pack.Util.hasPathExtensions(filename, 'custom');
   },
   handle: function (file, zip) {
      return ex.Extensions.Pack.Util.wrapGenericResource(file, zip, function (zipFile) {
         
         // process zip file and return data
         return zipFile.asText();
      });
   }
```

Reference `src\Handlers` for examples of built-in handlers.

## Creating a Custom Manifest

A pack file is simply a Zip file with a special `manifest.json` file at the root of the zip. You can "pack up" your own
assets by simply zipping up the contents of a directory and adding a manifest to it.

A manifest file is very simple:

```json
{
   "files": [
      {
         "name": "background",
         "path": ["sounds/background.mp3", "sounds/background.wav"]
      },
      {
         "name": "config",
         "path": "config.json"
      },
      {
         "name": "enemies",
         "path": "enemies.ini"
      },
      {
         "type": "binary", // custom resource handler
         "name": "maps_level1",
         "path": "maps/level1.xyz"
      }
   ]
}
```

A task-runner makes it much easier to generate this manifest due to file globbing but you can always create your own as you see fit.

## Using Grunt Task Runner

The Grunt plugin options look like this:

```js
// grunt task
excalibur_pack: {
   
   packs: [
      {
         // name of pack file
         name: "sounds",
                  
         // output filename (override global outFile)
         outFile: "sounds.expack",
         
         // output directory (override global outDir)
         outDir: "assets/packs",
         
         // globbing expressions will use default
         // values for types and names
         files: "assets/sounds/**/*.{mp3,wav}",
         
         // custom file hashmap using custom keys
         // that will be used when loading into Excalibur
         files: {
            
            // globbing expressions will use default
            // values for types and names
            all: "assets/sounds/**/*.{mp3,wav}",
            
            // override default type of previous file
            // using same key
            background: {
               type: 'blob',
               path: ['assets/sounds/background.mp3', 'assets/sounds/background.wav']
            },
            
            // fallback values (array)
            foo: ["assets/sounds/foo.mp3", "assets/sounds/foo.wav"],
            
            // single value
            bar: "assets/sounds/bar.wav",
            
            // custom resource handler
            map: {
               type: 'binary',
               path: 'assets/bin/map.bin'
            }
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