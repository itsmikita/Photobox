jQuery Photobox
===============

Photobox is a responsive and mobile optimized gallery slideshow plugin.

Demo: http://designed.bymikita.com/photobox/example/

How to use
----------

1. Include jQuery and `photobox.min.js` in your document.
2. Add links to full source images.
3. Apply Photobox on these links, like `$( 'a.photobox-image' ).photobox();`.

Changelog
---------

__0.1__
* Main slide methods added
* Added touch events
* Added shortcut commands

__0.2__
* Removed junk methods, simplified the code
* Organaized repository
* Added `photobox.min.js`
* Updated README.MD

__0.3__
* Added How-to
* Updated code standard

__0.5__
* Fixed bug when loading any image but first
* Removed fading controls (redesign this function later)
* Prev/Next controls now disappear on first and last image
* Added CSS3 support for all browsers (before: webkit only)

Future plans
------------
* Fix tilt/zoom (now buggy)
* Simplify the code even more
* Fallback CSS (in case styles are not loaded, for easier implementation)