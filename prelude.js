
if (! require && ! define) {
  if (! window) {
    var window = {}
  }
  var exports = window.domos = {},
      require = function (name) {
        return require.modules[name.replace(/^\.\//,"")]
      },
      define = function (name, ignore, module) {
        require.modules[name] = module
        module(require, exports)
      }

  require.modules = {}
}
