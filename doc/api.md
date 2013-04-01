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

## domos.select
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
