# domos

domos is a library that provides an alternative set of UI concepts to Backbone along with some API designed to ease some of CSS3 and HTML5's rough edges.

### domos.transitions
 * A JavaScript API for use with CSS3 transitions.
 * Callbacks contain the "cancelled" argument to allow detection of whether the transition completed fully or whether another attribute change cancelled them.
 * Allows transitions to be configured and turned off from CSS. Callbacks run immediately when no transition is necessary.
 * A state change can be performed on many elements and in this case a single callback is fired. The cancelled argument is false only if all of the transitions finished successfully.
 * Elements are automatically hidden and re-displayed as attributes cause them to shrink to 0 in (max) width/height or fade to 0 opacity. This removes ugly borders on elements with 0 width/height and avoids faded elements interfering with the flow of the page.
 * Transitions to/from a height/width of "auto" (currently Webkit based browsers treat auto as "0px" and Firefox avoids transitions to/from auto).

### domos.state
The domos state mechanism is an alternative to the [Backbone Router](http://backbonejs.org/#Router) mechanism for web applications that would benefit from maintaining multiple states.  Rather than routing on the URL path the domos state system allows routing multiple states based on a JavaScript object.

It provides:
 * A UI system that uses [data attributes](http://caniuse.com/#feat=dataset) to customise element styles based on the value of certain states (similar to the styling system seen in later versions of flash).
 * A rich set of events is provided that allow the UI to respond to various state modifications. Callbacks are provided:
    * When a single state value changes.
    * When a single state value is redone (set to the same value).
    * Before corresponding UI transitions are enacted.
    * After corresponding UI transitions are enacted.
    * When a state value changes the state object.

Rather than providing its own history API shim as [Backbone Router](http://backbonejs.org/#Router) does this library allows this to be done by the user and provides appropriate events to facilitate the use of such a shim. This allows the user flexibility in choosing what type of state changes should add new history events (navigable with the browser forward/back buttons) or replace the current state (not adding a history item).

### domos.tooltip
 * Tooltips with pointers. These make a great customisable alternative to default HTML5 form validation tooltips provided by current browsers. 

### domos.select
 * Select box override
 * Fully customisable with CSS.
 * No special API needed to create or query data, replaces an existing select box which is hidden in the page. As the user interacts with the replacement the hidden select box is updated.

### domos.template
 * UI templates based on [data attributes](http://caniuse.com/#feat=dataset).

## Obtaining
It can be obtained from
 * full source - http://nuisanceofcats.github.com/domos/domos.src.js
 * minified    - http://nuisanceofcats.github.com/domos/domos.min.js

domos can optionally be used as a require module and when require is not available the API is exported to the global object "window.domos".

## API
[domos API](/doc/api.md)

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

## Bugs this library works around
 * https://bugzil.la/849399
 * https://bugs.webkit.org/show_bug.cgi?id=113871

## Known limitatio;ns
 * Currently firefox includes the margin in the computed css dimensions for border-box elements but not when setting it via the css property. This can cause termination events not to fire on such elements.
 * domos probably does not work with Internet Explorer 8 or below and may not work with Internet Explorer 9 either. This may be fixed in the future.

## Test Platforms
 * Firefox 17+
 * Chromium 24+
 * Internet Explorer 10
 * [Opera Mini](https://play.google.com/store/apps/details?id=com.opera.browser)
 * [Dolphin Browser Beta](https://play.google.com/store/apps/details?id=com.dolphin.browser.lab.en)

# Websites using domos
 * [tlk.chilon.net](http://tlk.chilon.net) - Real-time article aggregation site that rates articles by view time.
