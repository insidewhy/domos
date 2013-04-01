# domos

Domos is a library that provides an alternative set of UI concepts to Backbone and a number of extra features designed for easing use of CSS3 and HTML5.

### domos.state
The Domos state mechanism is an alternative to the Backbone Router mechanism for web applications that would benefit from maintaining multiple states.  Rather than routing on the URL path the domos state system allows routing multiple states based on a JavaScript object.

It provides:
 * A UI system that uses [data attributes](http://caniuse.com/#feat=dataset) to customise element styles based on the value of certain states (similar to the styling system seen in later versions of flash).
 * A rich set of events is provided that allow the UI to respond to various state modifications. Callbacks are provided:
    * When a single state value changes.
    * When a single state value is redone (set to the same value).
    * Before corresponding UI transitions are enacted.
    * After corresponding UI transitions are enacted.
    * When a state value changes the state object.

Rather than providing its own history API shim as Backbone Router does this library allows this to be done by the user and provides appropriate events to facilitate the use of such a shim. This allows the user flexibility in choosing what type of state changes should add new history events (navigable with the browser forward/back buttons) or replace the current state (not adding a history item).

### domos.transitions
 * A JavaScript API for use with CSS3 transitions.
 * Callbacks contain the "cancelled" argument to allow detection of whether the transition completed fully or whether another attribute change cancelled them.
 * Allows transitions to be configured and turned off from CSS. Callbacks run immediately when no transition is necessary.
 * A state change can be performed on many elements and in this case a single callback is fired. The cancelled argument is false only if all of the transitions finished successfully.
 * Elements are automatically hidden and re-displayed as attributes cause them to shrink to 0 in (max) width/height or fade to 0 opacity. This removes ugly borders on elements with 0 width/height and avoids faded elements interfering with the flow of the page.

### domos.tooltip
 * Tooltips with pointers. These make a great customisable alternative to default HTML5 form validation tooltips provided by current browsers. 

### domos.select
 * Customisable select box override
 * Fully customisable with CSS.
 * No special API needed to create or query data, replaces an existing select box which is hidden in the page. As the user interacts with the replacement the hidden select box is updated.

### domos.template
 * UI templates based on [data attributes](http://caniuse.com/#feat=dataset).

## Obtaining
It can be obtained from
 * full source - http://nuisanceofcats.github.com/domos/domos.src.js
 * minified    - http://nuisanceofcats.github.com/domos/domos.min.js

It can be used from as a require module, when require is not available it exports to the global object "window.domos".

## API

### domos.transition
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

### domos.select
```javascript
  /// This converts a select to a javascript implementation that contains
  /// no stylings.
  /// Now use .domos-select to style the element.
  /// .domos-select >.button, .domos-select >.option and
  /// .domos-select >.option.enabled can be used to style sub-components.
  /// The button is automatically floated right and receives the width and
  /// height equalling the height of the select box.
  domos.enhanceSelects($('select'))
```

By default an upside down triangle is drawn as a button but a callback can be provided to draw a custom button.

```javascript
  domos.enhanceSelects($('select'), {
    drawButton: function(button) {
      // button is a jquery selector with it's width and height already
      // set to the height of the select box.
    }
  })
```

## Including domos
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

## Using domos with require
```javascript
  require.config({
    paths: {
      domos: 'http://nuisanceofcats.github.com/domos/domos.min.js'
      // Use whatever versions you want, jquery can be replaced with Zepto.
      jquery: 'http://code.jquery.com/jquery-1.9.1.min',
      underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min',
      backbone: 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.10/backbone-min'
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

## Dependencies
 * [Jquery](http://jquery.com) or [Zepto](http://zeptojs.com).
 * [Backbone](http://backbonejs.org)

## Test Page
http://nuisanceofcats.github.com/domos

## Known issues
 * A bug with Firefox 17+ currently can cause flicker when fading from 0 to 1 in certain circumstances.
 * Domos probably does not work with Internet Explorer 8 or below and may not work with Internet Explorer 9 either. This may be fixed in the future.

## Test Platforms
 * Firefox 17+
 * Chromium 24+
 * Internet Explorer 10

# Websites using domos
 * [tlk.chilon.net](http://tlk.chilon.net) - Real-time article aggregation site that rates articles by readership time. Domos was spun-off from this website as an independently useful set of tools for creating modern web applications.
