domos
=====

Domos provides support for UI transitions that use CSS3 with the ease of use of Jquery transitions.

It can be obtained from
 * full source - http://nuisanceofcats.github.com/domos/domos.src.js
 * minified    - http://nuisanceofcats.github.com/domos/domos.min.js

It can be used from as a require module, when require is not available it exports to the global object "window.domos".

Advantages to using pure Jquery
===============================
* Callbacks contain the "cancelled" argument to allow detection of whether the transition completed fully or whether another attribute change cancelled them.
* Allows transitions to be turned on and off from CSS, callbacks run immediately when no transition is necessary.
* A state change can be performed on many elements and in this case a single callback is fired. The cancelled argument is false only if all of the transitions finished successfully.
* Nodes are automatically hidden and re-displayed as attributes cause them to shrink to 0 in (max) width/height or fade to 0 opacity. This removes ugly borders on elements with 0 width/height and avoids faded elements interfering with the flow of the page.

API
===
This changes some attributes on an HTML element. The callback is called when
all corresponding css3 transitions have finished, or immediately if there are
none. If the transition doesn't complete before another transition occurs on
the element then the first argument "cancelled" will be true.

```javascript
  domos.transition($('#id'), 'opacity', 1, function (cancelled) {
  })
```

Changes multiple attributes in one go. If a transition causes
width/height/opacity to reach 0 then the CSS style "display: none" is set on
the node. Conversely "display: none" is removed if a transition causes the
node to become visible again.

```javascript
  domos.transition($('#id'), { opacity: 0, width: 0 }, function (cncld) {
  })
```

Including domos
===============
```html
  <script src="http://nuisanceofcats.github.com/domos/domos.min.js"></script>
  <script type="text/javascript">
    domos.transition(...)
  </script>
```

Using domos with require
========================
```javascript
  require.config({
    paths: {
      domos: 'http://nuisanceofcats.github.com/domos/domos.min.js'
    }
  })
  var domos = require('domos')
  domos.transition(...)
```

Test Page
=========
http://nuisanceofcats.github.com/domos

The bug https://bugzil.la/849399 currently affects display in Firefox 17+.
