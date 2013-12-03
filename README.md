# Colibri.js ([demo](http://arcanis.github.io/colibri.js/demo/))

Colibri is a lightweight library allowing easy computation of colors based on an image. It allows this kind of thing :

![Examples](http://i.imgur.com/YPxA3.png)

## Usage

```js
var img = new Image( );
img.onload = function ( ) { alert( Colibri.extractImageColors( img, 'css' ) ); };
img.src = 'myImage.jpg';
```

Please note that it will not work if you try to load a remote image subject to cross-origin restrictions. However, if the target host is properly configured (and if you're not using IE), you should be able to do the following :

```js
var img = new Image( );
img.onload = function ( ) { alert( Colibri.extractImageColors( img, 'css' ) ); };
img.crossOrigin = 'Anonymous';
img.src = 'http://i.imgur.com/OUmDIOqb.jpg';
```

## Performances

You should be aware of performance issue on a large number of images on some devices such as iPad. I think it would be for the best if you could precompute the colors and store them somewhere. I plan to publish this library as a NPM package, don't forget to star the repo to be notified of further updates.

<hr />

Use this script on **little** images (thumbnail-like). If necessary, you can resize the images yourself :

```js
var img = new Image( );

img.onload = function ( ) {
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
};

img.crossOrigin = 'Anonymous';
img.src = 'http://i.imgur.com/OUmDIOq.jpg';
```
