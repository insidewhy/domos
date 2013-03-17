# domos

Domos provides a nice JavaScript API for use with CSS3 transitions.

It also supplies an event based UI state and template API built on top
of the transition API that both use HTML5 data attributes.

It can be obtained from
 * full source - http://nuisanceofcats.github.com/domos/domos.src.js
 * minified    - http://nuisanceofcats.github.com/domos/domos.min.js

It can be used from as a require module, when require is not available it exports to the global object "window.domos".

## Advantages to using Jquery transitions
* Callbacks contain the "cancelled" argument to allow detection of whether the transition completed fully or whether another attribute change cancelled them.
* Allows transitions to be configured and turned off from CSS. Callbacks run immediately when no transition is necessary.
* A state change can be performed on many elements and in this case a single callback is fired. The cancelled argument is false only if all of the transitions finished successfully.
* Elements are automatically hidden and re-displayed as attributes cause them to shrink to 0 in (max) width/height or fade to 0 opacity. This removes ugly borders on elements with 0 width/height and avoids faded elements interfering with the flow of the page.
* Transitions should be smoother as they are performed by browser engine rather than JavaScript.

## Disadvantages to using Jquery transitions
* Elements will not transition in browsers that do not support CSS3 transitions (callbacks will fire immediately).

# API

## domos.transition
This changes some attributes on an HTML element. The callback is called when
all corresponding css3 transitions have finished, or immediately if there are
none. If the transition doesn't complete before another transition occurs on
the element then the first argument "cancelled" will be true.

```javascript
  domos.transition($('#id'), 'opacity', 1, function (cancelled) {
    if (cancelled)
      console.log("element never became fully visible")
    else
      console.log("element has opacity 1")
  })
```

Changes multiple attributes in one go. If a transition causes
width/height/opacity to reach 0 then the CSS style "display: none" is set on
the node. Conversely "display: none" is removed if a transition causes the
node to become visible again.

```javascript
  domos.transition($('#id'), { opacity: 0, width: 0 }, function (cncld) {
    if (cncld)
      console.log("opacity and/or width never reached 0")
    else
      console.log("opacity and width are 0 so 'display: none' has been set.")
  })
```

# Including domos
```html
  <!-- can change versions and replace jquery with zepto -->
  <script src="http://code.jquery.com/jquery-1.9.1.min"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.10/backbone-min"></script>
  <script src="http://nuisanceofcats.github.com/domos/domos.min.js"></script>
  <script type="text/javascript">
    domos.transition(...)
  </script>
```

# Using domos with require
```javascript
  require.config({
    paths: {
      domos: 'http://nuisanceofcats.github.com/domos/domos.min.js'
      // Use whatever versions you want, jquery can be replaced with Zepto.
      jquery: 'http://code.jquery.com/jquery-1.9.1.min',
      underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min',
      backbone: 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.10/backbone-min',
    },
    shim: {
      jquery:     { exports: '$' },
      underscore: { exports: '_' },
      backbone:   {
        exports: 'Backbone',
        deps: ['underscore', 'jquery']
      }
    }
  })
  require('backbone') // backbone must be required first
  var domos = require('domos')
  domos.transition(...)
```

# Requirements
* [Jquery](http://jquery.com) or [Zepto](http://zeptojs.com).
* [Backbone](http://backbonejs.org)

# Test Page
http://nuisanceofcats.github.com/domos

The bug https://bugzil.la/849399 currently affects display in Firefox 17+.
