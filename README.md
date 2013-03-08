domos
=====

Domos provides support for UI transitions that use CSS3 with the ease of use of Jquery transitions.

It can be obtained from
 * full source - http://nuisanceofcats.github.com/domos/domos.src.js
 * minified    - http://nuisanceofcats.github.com/domos/domos.min.js

It can be used from as a require module, when require is not available it exports to the global object "window.domos".

API
===

```javascript
  domos.transition($('#id'), 'opacity', 1, function (cancelled) {
    // This function is called when all corresponding css3 transitions
    // have finished, or immediately if there are none.
    // If the transition doesn't complete before another transition
    // occurs on the element then "cancelled" will be true.
  })

  domos.transition($('#id'), { opacity: 0, width: 0 }, function (cncld) {
    // Changes multiple attributes in one go.
    // If a transition causes width/height/opacity to reach 0 then the
    // "display: none" is set on the node.
    // Conversely "display: none" is removed if a transition causes the
    // node to be visible again.
  })
```

test page
=========

http://nuisanceofcats.github.com/domos

The bug https://bugzil.la/849399 currently affects the test in Firefox.
