if (! require && ! define) {
  if (! window)
    var window = {}

  var exports = window.domos = {},
      require = function (name) {
        return exports
      },
      define = function (name, deps, module) {
        module(require, exports)
      }
}
