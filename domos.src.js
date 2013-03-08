
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

if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('transitions',['require','exports','module'],function (require, exports) {
  var SWITCH_ATTRS = [
      "opacity",
      "width",
      "height"
    ];
  var VERY_SMALL = 0.00001;
  var transition = exports.transition = function (node, name, value, callback) {
      var changes;
      if (typeof name === "string") {
        changes = {};
        changes[name] = value;
      } else {
        changes = name;
        callback = value;
      }
      var changeTypes = Object.keys(changes), nChanges = changeTypes.length;
      if (changeTypes.some(function (type) {
          return SWITCH_ATTRS.indexOf(type) !== -1 && parseFloat(changes[type]) > VERY_SMALL;
        }.bind(this))) {
        node.show();
      }
      node.css(changes);
      var pendingChanges = function () {
          return changeTypes.some(function (type) {
            return Math.abs(parseFloat(node.css(type)) - parseFloat(changes[type])) > VERY_SMALL;
          }.bind(this));
        }.bind(this);
      if (pendingChanges()) {
        var nod = node[0];
        var handleTransition = function (e) {
            if (!e) {
              if (callback)
                callback(true);
              return;
            }
            if (SWITCH_ATTRS.indexOf(e.propertyName) !== -1 && parseFloat(node.css(e.propertyName)) < VERY_SMALL) {
              node.css("display", "none");
            }
            if (!pendingChanges()) {
              delete nod.__domosTransition;
              nod.removeEventListener("transitionend", handleTransition);
              nod.removeEventListener("webkitTransitionEnd", handleTransition);
              if (callback)
                callback();
            }
          }.bind(this);
        if (nod.__domosTransition) {
          nod.removeEventListener("transitionend", nod.__domosTransition);
          nod.removeEventListener("webkitTransitionEnd", nod.__domosTransition);
          nod.__domosTransition(null);
        }
        nod.__domosTransition = handleTransition;
        nod.addEventListener("transitionend", handleTransition);
        nod.addEventListener("webkitTransitionEnd", handleTransition);
      } else {
        if (changeTypes.some(function (type) {
            return SWITCH_ATTRS.indexOf(type) !== -1 && parseFloat(changes[type]) < VERY_SMALL;
          }.bind(this))) {
          node.css("display", "none");
        }
        if (callback)
          callback();
      }
    };
});
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('states',['require','exports','module','./transitions'],function (require, exports) {
  var transition = require("./transitions").transition;
  var runTransition = function (sel, action, value, callback) {
      if (!callback) {
        transition(sel, action, value);
        return;
      }
      var nCalls = sel.length, afterTransition = function () {
          if (!--nCalls)
            callback();
        }.bind(this);
      for (var i = 0; i < sel.length; ++i) {
        transition($(sel[i]), action, value, afterTransition);
      }
    }.bind(this);
  var transitionTypes = exports.transitionTypes = {
      show: {
        undoAction: function (node) {
          return "hide";
        },
        run: function (node, callback) {
          runTransition(node, "opacity", 1, callback);
        }
      },
      hide: {
        run: function (node, callback) {
          runTransition(node, "opacity", 0, callback);
        }
      }
    };
  var States = exports.States = function () {
      function States(opts) {
        _.extend(this, Backbone.Events);
        if (!opts)
          opts = {};
        this._selectorMap = opts.selectorMap || {};
        this._defaultSelector = opts.default || $("body");
        this.statePrefix = opts.statePrefix || "s-";
        this.state = {};
      }
      States.prototype.set = function (type, val, callback, sel) {
        if (val === null || val === "null") {
          if (!this.state[type]) {
            this.trigger("redo-" + type + "-null");
            return;
          }
          val = "null";
          delete this.state[type];
        } else {
          if (this.state[type] === val) {
            this.trigger("redo-" + type + "-" + val, val);
            return;
          }
          this.state[type] = val;
        }
        var transitions = this._getTransitions(type, val);
        var runAfter = function () {
            if (callback)
              callback();
            this.trigger("state-change", this.state);
            this.trigger(type + "-" + val, val);
          }.bind(this);
        if (transitions.hide && transitions.show) {
          runTransition(transitions.hide, "opacity", 0, function () {
            delete transitions.hide;
            this._runTransitions(transitions, runAfter);
          }.bind(this));
        } else
          this._runTransitions(transitions, runAfter);
      };
      States.prototype._runTransitions = function (transitions, callback) {
        var actions = Object.keys(transitions);
        var nActions = actions.length;
        actions.forEach(function (action) {
          transitionTypes[action].run(transitions[action]);
          if (!--nActions && callback)
            callback();
        }.bind(this));
      };
      States.prototype._selectorFor = function (type) {
        return this._selectorMap[type] || this._defaultSelector;
      };
      States.prototype._getTransitions = function (type, val, sel) {
        var transitions = {}, addTransition = function (name, node) {
            var existing = transitions[name];
            transitions[name] = existing ? existing.add(node) : node;
          }.bind(this);
        if (!sel)
          sel = this._selectorFor(type);
        var dataTag = "data-" + this.statePrefix + type;
        _.each(sel.find("[" + dataTag + "]"), function (node) {
          node = $(node);
          var matches = {}, failures = {};
          node.attr(dataTag).split("|").forEach(function (state) {
            var colonIdx = state.indexOf(":"), action = "show";
            if (colonIdx !== -1) {
              action = state.substr(colonIdx + 1);
              if (!transitionTypes[action])
                throw new Error("invalid transition type " + action);
              state = state.substr(colonIdx);
            }
            var result = state[0] === "!" ? val !== state.substr(1) : val === state;
            if (result)
              matches[action] = true;
            else
              failures[action] = true;
          }.bind(this));
          Object.keys(matches).forEach(function (action) {
            delete failures[action];
            addTransition(action, node);
          }.bind(this));
          Object.keys(failures).forEach(function (action) {
            var getUndo = transitionTypes[action].undoAction;
            if (getUndo) {
              var undo = getUndo(node);
              if (undo)
                addTransition(undo, node);
            }
          }.bind(this));
        }.bind(this));
        return transitions;
      };
      States.prototype.restore = function (state) {
        this.state = state;
        _.each(state, function (val, type) {
          if (val === null || val === "null") {
            val = "null";
            delete this.state[type];
          }
          var transitions = this._getTransitions(type, val);
          if (transitions.hide) {
            transitions.hide.hide();
            delete transitions.hide;
          }
          if (transitions.show) {
            transitions.show.show();
            delete transitions.show;
          }
          this._runTransitions(transitions);
          this.trigger(type + "-" + val, val);
        }.bind(this));
      };
      return States;
    }();
});
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('tooltip',['require','exports','module','./transitions'],function (require, exports) {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var transition = require("./transitions").transition;
  var Tooltip = exports.Tooltip = function () {
      function Tooltip(opts) {
        this.closed = true;
        _.extend(this, Backbone.Events);
        this.opts = _.extend({
          position: "top-left",
          arrowMargin: 10,
          arrowHeight: 10,
          className: "tooltip",
          closeText: "close"
        }, opts || {});
        this.$ = $("<div/>", { class: this.opts.className });
        this._closeLink = $("<a/>", {
          html: this.opts.closeText,
          href: "javascript:void(0)"
        });
      }
      Tooltip.prototype.content = function (fields) {
        if (fields.html)
          this.$.html(fields.html);
        if (fields.title) {
        }
      };
      Tooltip.prototype._makeArrow = function (conf) {
        var arrow = document.createElementNS(SVG_NS, "svg"), path = document.createElementNS(SVG_NS, "path");
        arrow.setAttribute("version", "1.1");
        arrow.style.position = "absolute";
        var h = this.opts.arrowHeight, sx = "0 " + h, l1 = h + " -" + h, l2 = h + " " + h, sw = parseInt(this.$.css("border-top-width")), width = (h + sw) * 2;
        path.setAttributeNS(null, "d", "M " + sx + " l " + l1 + " l " + l2);
        arrow.appendChild(path);
        arrow.style.top = -h + "px";
        arrow.style.width = width;
        arrow.style.height = h + sw;
        this.$.append(arrow);
        if (conf.position === "top-right") {
          arrow.style.left = this.$.outerWidth() - conf.arrowMargin - width;
        } else {
          arrow.style.left = conf.arrowMargin;
        }
        path.style.strokeWidth = sw;
        path.style.stroke = this.$.css("border-top-color");
        path.style.fill = this.$.css("background-color");
        return arrow;
      };
      Tooltip.prototype.display = function (node, fields, conf) {
        this.closed = false;
        if (fields)
          this.content(fields);
        conf = _.extend({
          topOffset: 0,
          leftOffset: 0
        }, this.opts, conf || {});
        var isTop = conf.position === "top-left" || conf.position === "top-right", isLeft = conf.position === "top-left" || conf.position === "bottom-left";
        $("body").append(this.$);
        this.$.append(this._closeLink);
        transition(this.$, "opacity", 1);
        var top = node.offset(), left = top.left, top = top.top;
        top = Math.floor(top + conf.topOffset) + conf.arrowHeight;
        left = Math.floor(left + conf.leftOffset);
        if (isTop) {
          this.$.css({
            top: top + node.outerHeight(),
            left: 0
          });
        }
        if (!isLeft) {
          this.$.css({ left: left + node.outerWidth() - this.$.outerWidth() });
        } else
          this.$.css({ left: left });
        this._makeArrow(conf);
        this._closeLink.off("click");
        if (conf.noClose) {
          this._closeLink.hide();
        } else {
          this._closeLink.show();
          this._closeLink.on("click", function () {
            this.close();
          }.bind(this));
        }
      };
      Tooltip.prototype.close = function () {
        if (this.closed)
          return;
        this.closed = true;
        this.trigger("close");
        transition(this.$, "opacity", 0);
      };
      return Tooltip;
    }();
});
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('templates',['require','exports','module'],function (require, exports) {
  var TemplateCollectionInstantiation = function () {
      function TemplateCollectionInstantiation(template, opts) {
        this._template = template;
        this.children = [];
        opts = opts || {};
        if (opts.parent)
          this._parent = opts.parent;
        else
          this._after = opts.after || template.template$;
      }
      TemplateCollectionInstantiation.prototype.reset = function (collection) {
        for (var i = 0; i < this.children.length; ++i)
          this.children[i].remove();
        this.children.length = 0;
        if (collection)
          collection.forEach(function (model) {
            this.append(model).show();
          }.bind(this));
      };
      TemplateCollectionInstantiation.prototype.insert = function (model, idx) {
        if (this.children.length <= idx)
          return this.append(model);
        var model$ = this._template.makeElement(model);
        this.children[idx].before(model$);
        this.children.splice(idx, 0, model$);
        return model$;
      };
      TemplateCollectionInstantiation.prototype.append = function (model) {
        var model$ = this._template.makeElement(model);
        if (this.children.length === 0) {
          if (this._after)
            this._after.after(model$);
          else if (this._parent)
            this._parent.append(model$);
        } else
          this.children[this.children.length - 1].after(model$);
        this.children.push(model$);
        return model$;
      };
      return TemplateCollectionInstantiation;
    }();
  var transforms = {
      text: function (value) {
        return function (node, model) {
          node.html(value.call(this, model));
        };
      }.bind(this)
    };
  var setAttr = function (attrName, value) {
      return function (node, model) {
        node.attr(attrName, value.call(this, model));
      };
    }.bind(this);
  var getNode = function (node, pos) {
      pos.forEach(function (idx) {
        node = $(node.children()[idx]);
      }.bind(this));
      return node;
    }.bind(this);
  var valComponent = /[^\$]+|\$[a-zA-Z_][a-zA-Z0-9_]+|\${[^}]+}/g;
  var getValueFactory = function (value) {
      var callbacks = [];
      var _match;
      while (_match = valComponent.exec(value)) {
        (function () {
          var match = _match[0];
          if (match[0] === "$") {
            if (match[1] === "{") {
              var evalSt = "with (model) { " + match.slice(2, -1) + " }";
              callbacks.push(function (model) {
                return eval(evalSt);
              });
            } else {
              var key = match.substring(1);
              callbacks.push(function (model) {
                return model[key];
              }.bind(this));
            }
          } else {
            callbacks.push(function (model) {
              return match;
            }.bind(this));
          }
        }());
      }
      if (callbacks.length === 1)
        return callbacks[0];
      else
        return function (model) {
          var ret = "";
          callbacks.forEach(function (callback) {
            ret += callback(model);
          }.bind(this));
          return ret;
        }.bind(this);
    }.bind(this);
  var Template = function () {
      function Template(name, node) {
        this.name = name;
        this.template$ = node;
        this._subs = this.parseTemplate(node);
        node.hide();
      }
      Template.prototype.parseTemplate = function (node) {
        var subs = [], pos = [];
        recurse = function (node) {
          _.each(node.data(), function (value, key) {
            var match = /^t([A-Z][a-z]+)/.exec(key);
            if (!match)
              return;
            var attr = match[1].toLowerCase();
            node.removeAttr("data-t-" + attr);
            var getValue = getValueFactory(value);
            var transform = transforms[attr];
            transform = transform ? transform(getValue) : setAttr(attr, getValue);
            subs.push({
              pos: _.clone(pos),
              transform: transform
            });
          }.bind(this));
          var idx = 0;
          pos.push(idx);
          _.each(node.children(), function (child) {
            child = $(child);
            pos[pos.length - 1] = idx++;
            recurse(child);
          }.bind(this));
          pos.pop();
        }.bind(this);
        recurse(node);
        return subs;
      };
      Template.prototype.makeElement = function (model) {
        var node = this.template$.clone();
        node.removeAttr("data-t-template");
        model = model.attributes || model;
        this._subs.forEach(function (sub) {
          var pos = sub.pos, transform = sub.transform;
          var child = getNode(node, pos);
          transform.call(child, child, model);
        }.bind(this));
        return node;
      };
      Template.prototype.instantiateCollection = function (opts) {
        return new TemplateCollectionInstantiation(this, opts);
      };
      return Template;
    }();
  var Templates = exports.Templates = function () {
      function Templates(opts) {
        opts = opts || {};
        this._templates = {};
        this._container = opts.container || $("body");
      }
      Templates.prototype.get = function (name) {
        var existing = this._templates[name];
        if (existing)
          return existing;
        var node = this._container.find("[data-t-template=" + name + "]");
        if (node.length === 0)
          throw new Error("could not find template");
        else if (node.length !== 1)
          throw new Error("multiple matches for template");
        return this._templates[name] = new Template(name, node);
      };
      return Templates;
    }();
});
define('domos',['require','exports','module','./states','./tooltip','./templates','./transitions'],function(require, exports) {
  require('./states')
  require('./tooltip')
  require('./templates')
  require('./transitions')
})
;