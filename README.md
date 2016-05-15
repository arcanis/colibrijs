# Colibrijs ([demo](http://arcanis.github.io/colibrijs/demo/))

Colibrijs is a small library that can extract the dominant colors from any image.

![Examples](http://i.imgur.com/YPxA3.png)

The algorithm used in the library has been ported over from the following [StackOverflow answer](http://stackoverflow.com/questions/13637892/how-does-the-algorithm-to-color-the-song-list-in-itunes-11-work#answer-13675803).

## Installation

```
$> npm install colibrijs
```

## Usage

**Node:**

```js
let fs = require('fs');

let Colibri = require('colibrijs');
let Image = require('canvas').Image;

let img = new Image();
img.src = fs.readFileSync('myImage.jpg');

console.log(Colibri.extractImageColors(img, 'css'));
```

**Browser:**

```js
let img = new Image();
img.src = 'myImage.jpg';

img.addEventListener('load', function () {
    alert(Colibri.extractImageColors(img, 'css'));
});
```

Note that it won't work as expected if you try to load a remote image subject to cross-origin restrictions. However, if the target host is properly configured (and if you're not using IE), you should be able to do the following :

```js
let img = new Image();

img.crossOrigin = 'Anonymous';
img.src = 'http://i.imgur.com/OUmDIOqb.jpg';

img.addEventListener('load', function () {
    alert(Colibri.extractImageColors(img, 'css'));
});
```

## Performances

  - Performance issues might arise if you try to extract dominant colors from a lot of images (dozen of them). If you happen to hit this issue, maybe generating these colors the server side might be a better.

  - Since we're iterating on every pixel of the images, large ones might take a long time to complete. In order to avoid this issue, try to only extract colors from small images. If necessary, you can resize them at runtime before giving them to Colibrijs:

    ```js
    let img = new Image();

    img.crossOrigin = 'Anonymous';
    img.src = 'http://i.imgur.com/OUmDIOq.jpg';

    img.addEventListener('load', function () {

        var canvas = document.createElement( 'canvas' );
        var context = canvas.getContext( '2d' );

        var maxWidth = 200, maxHeight = 200;
        var widthRatio = Math.max( 1, img.width / maxWidth );
        var heightRatio = Math.max( 1, img.height / maxHeight );
        var maxRatio = Math.max( widthRatio, heightRatio );

        canvas.width = img.width / maxRatio;
        canvas.height = img.height / maxRatio;

        context.drawImage( img, 0, 0, canvas.width, canvas.height );

        alert( Colibri.extractImageColors( canvas, 'css' ) );

    });
    ```

## License (MIT)

> **Copyright © 2016 Maël Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
