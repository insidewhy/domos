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

if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('util',['require','exports','module'],function (require, exports) {
  var $each = exports.$each = function (nodes, from, to, callback) {
      if (callback === undefined) {
        if (to === undefined) {
          callback = from;
          from = 0;
        } else {
          callback = to;
        }
        to = nodes.length;
      }
      for (var i = from; i < to; ++i)
        callback($(nodes[i]), i);
    }.bind(this);
  var compCss = exports.compCss = function (node, type) {
      return getComputedStyle(node[0], null)[type];
    }.bind(this);
  var css = exports.css = function (node, type, newVal) {
      if (newVal !== undefined) {
        node.css(type, newVal);
      } else {
        var ret = node[0].style[type];
        return ret === "" ? compCss(node, type) : ret;
      }
    }.bind(this);
});
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('transitions',['require','exports','module','./util'],function (require, exports) {
  var __util = require("./util"), $each = __util.$each, compCss = __util.compCss, css = __util.css;
  var SWITCH_ATTRS = [
      "opacity",
      "width",
      "height"
    ];
  var VERY_SMALL = 0.00001;
  var STATE_INCORRECT_AFTER_SET = /Firefox\/(?:1[7-9]|20)?/.test(navigator.userAgent), STATE_INCORRECT_AFTER_SET_LAG = 20;
  var TRANSITIONS_AUTO_AS_0px = /Chrome\/2[0-6]?/.test(navigator.userAgent);
  var transition = exports.transition = function (nodes, name, value, callback) {
      var changes;
      if (typeof name === "string") {
        changes = {};
        changes[name] = value;
      } else {
        changes = name;
        callback = value;
      }
      var attributes = Object.keys(changes), nChanges = attributes.length;
      attributes.some(function (type) {
        if (SWITCH_ATTRS.indexOf(type) !== -1 && parseFloat(changes[type]) > VERY_SMALL) {
          nodes.show();
        }
      }.bind(this));
      fixAutos(nodes, attributes, function () {
        var nTrans = nodes.length;
        if (!callback || nTrans === 1) {
          transitionElement(nodes, attributes, changes, callback);
        } else {
          var nTransitions = nodes.length;
          var onSingleTransition = function (cancelled) {
              if (nTransitions === -1)
                return;
              if (cancelled) {
                nTransitions = -1;
                callback(true);
              } else if (!--nTrans)
                callback();
            }.bind(this);
          $each(nodes, function (node) {
            transitionElement(node, attributes, changes, onSingleTransition);
          }.bind(this));
        }
      }.bind(this));
    };
  var fixAutos = exports.fixAutos = function (nodes, attributes, callback) {
      if (typeof attributes === "string")
        attributes = [attributes];
      if (TRANSITIONS_AUTO_AS_0px) {
        var autosToFix = [];
        $each(nodes, function (node) {
          attributes.forEach(function (type) {
            var val = node[0].style[type];
            if (val === "" || val === "auto")
              autosToFix.push({
                type: type,
                node: node
              });
          }.bind(this));
        }.bind(this));
        if (autosToFix.length) {
          withoutTransitions(nodes, function () {
            autosToFix.forEach(function (fix) {
              css(fix.node, fix.type, compCss(fix.node, fix.type));
            }.bind(this));
          }.bind(this), callback);
        } else if (callback) {
          callback();
        }
      } else {
        $each(nodes, function (node) {
          attributes.forEach(function (type) {
            var val = node[0].style[type];
            if (val === "" || val === "auto")
              css(node, type, compCss(node, type));
          }.bind(this));
        }.bind(this));
        if (callback)
          callback();
      }
    };
  function removeTransitionState(nod, type, removeEmpty) {
    if (nod.__domosTransition[type]) {
      delete nod.__domosTransition[type];
      if (--nod.__domosTransition.nKeys === 0 && removeEmpty)
        delete nod.__domosTransition;
    }
  }
  var withoutTransitions = exports.withoutTransitions = function (nodes, without, after) {
      if (TRANSITIONS_AUTO_AS_0px) {
        $each(nodes, function (node) {
          node[0].__domosBackupTrans = compCss(node, "transition");
          css(node, "transition", "none");
        }.bind(this));
        if (without)
          without();
        setTimeout(function () {
          $each(nodes, function (node) {
            css(node, "transition", node[0].__domosBackupTrans);
            delete node[0].__domosBackupTrans;
          }.bind(this));
          if (after)
            after();
        }.bind(this));
      } else {
        if (without)
          without();
        if (after)
          after();
      }
    };
  function transitionElement(node, attributes, _changes, callback) {
    var changes = Object.create(_changes);
    var autoTypes = [];
    var makeCssChanges = function () {
        node.css(changes);
        var pendingChanges = function () {
            return attributes.some(function (type) {
              return Math.abs(parseFloat(compCss(node, type)) - parseFloat(changes[type])) > VERY_SMALL;
            }.bind(this));
          }.bind(this);
        var finishedTransition = false;
        if (pendingChanges()) {
          var nod = node[0];
          var handleTransition = function (e) {
              if (finishedTransition)
                return;
              if (!e) {
                if (callback)
                  callback(true);
                finishedTransition = true;
                return;
              }
              if (SWITCH_ATTRS.indexOf(e.propertyName) !== -1 && parseFloat(compCss(node, e.propertyName)) < VERY_SMALL) {
                node.css("display", "none");
              }
              if (!pendingChanges()) {
                attributes.forEach(function (type) {
                  removeTransitionState(nod, type, true);
                }.bind(this));
                nod.removeEventListener("transitionend", handleTransition);
                nod.removeEventListener("webkitTransitionEnd", handleTransition);
                finishedTransition = true;
                withoutTransitions(node, function () {
                  autoTypes.forEach(function (type) {
                    css(node, type, "auto");
                  }.bind(this));
                }.bind(this), callback);
              }
            }.bind(this);
          if (nod.__domosTransition) {
            attributes.forEach(function (type) {
              var listener = nod.__domosTransition[type];
              if (listener) {
                listener(null);
                nod.removeEventListener("transitionend", listener);
                nod.removeEventListener("webkitTransitionEnd", listener);
                removeTransitionState(nod, type);
              }
            }.bind(this));
          } else {
            nod.__domosTransition = {};
          }
          attributes.forEach(function (type) {
            nod.__domosTransition[type] = handleTransition;
          }.bind(this));
          nod.__domosTransition.nKeys = attributes.length;
          nod.addEventListener("transitionend", handleTransition);
          nod.addEventListener("webkitTransitionEnd", handleTransition);
        } else {
          if (attributes.some(function (type) {
              return SWITCH_ATTRS.indexOf(type) !== -1 && parseFloat(changes[type]) < VERY_SMALL;
            }.bind(this))) {
            node.css("display", "none");
          }
          if (callback)
            callback();
        }
      }.bind(this);
    var makeCssChangesHelper = function () {
        if (STATE_INCORRECT_AFTER_SET)
          setTimeout(makeCssChanges, STATE_INCORRECT_AFTER_SET_LAG);
        else
          makeCssChanges();
      }.bind(this);
    attributes.forEach(function (type) {
      if (_changes[type] === "auto")
        autoTypes.push(type);
    }.bind(this));
    if (autoTypes.length) {
      withoutTransitions(node, function () {
        autoTypes.forEach(function (type) {
          var bak = compCss(node, type);
          css(node, type, "auto");
          changes[type] = compCss(node, type);
          css(node, type, bak);
        }.bind(this));
      }.bind(this), makeCssChangesHelper);
    } else {
      makeCssChangesHelper();
    }
  }
});
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('state',['require','exports','module','./transitions','./util'],function (require, exports) {
  var transition = require("./transitions").transition;
  var __util = require("./util"), $each = __util.$each, css = __util.css;
  var isNullState = function (val) {
      return val === null || val === "null";
    }.bind(this);
  var State = exports.State = function () {
      function State(opts) {
        _.extend(this, Backbone.Events);
        if (!opts)
          opts = {};
        this._selectorMap = opts.selectorMap || {};
        this._defaultSelector = opts.default || $("body");
        this.statePrefix = opts.statePrefix || "s-";
        this.state = {};
      }
      State.prototype._isChange = function (type, val) {
        var prevVal = this.state[type] || null;
        if (prevVal === null)
          return isNullState(val) ? null : "null";
        else
          return prevVal === val ? null : "" + prevVal;
      };
      State.prototype.set = function (type, val, callback, opts) {
        if (typeof type === "object") {
          opts = callback || {};
          callback = val;
          val = type;
          opts = Object.create(opts);
          opts.noStateChangeEvent = true;
          var changes = {};
          var changeTypes = Object.keys(val).filter(function (type) {
              var typeVal = val[type];
              var prevVal = this._isChange(type, typeVal);
              if (prevVal === null) {
                this._trigger("redo", type, "" + typeVal);
                return false;
              }
              changes[type] = prevVal;
              return true;
            }.bind(this));
          var nChangesLeft = changes.length = changeTypes.length;
          if (nChangesLeft === 0)
            return;
          var onSingleStateChange = function (cancelled) {
              if (nChangesLeft === -1)
                return;
              if (cancelled) {
                nChangesLeft = -1;
                if (callback)
                  callback(true);
              } else if (--nChangesLeft === 0) {
                this.trigger("state-change", this.state, changes);
                if (callback)
                  callback();
              }
            }.bind(this);
          changeTypes.forEach(function (type) {
            this.set(type, val[type], onSingleStateChange, opts);
          }.bind(this));
          this.trigger("before:state-change", this.state, changes);
          return;
        }
        if (!opts)
          opts = {};
        var prevVal = this._isChange(type, val);
        if (prevVal === null) {
          this._trigger("redo", type, "" + val);
          return;
        }
        if (isNullState(val)) {
          val = "null";
          delete this.state[type];
        } else {
          this.state[type] = val;
        }
        var transitions = this._getTransitions(type, val, opts);
        this._trigger("before", type, val);
        if (!opts.noStateChangeEvent) {
          var changes = { length: 1 };
          changes[type] = prevVal;
          this.trigger("before:state-change", this.state, changes);
        }
        var fadeOutTrans = $();
        for (var i = 0; i < transitions.length;) {
          var action = transitions[i].action;
          if (action.cssType === "opacity" && action.cssVal == 0) {
            fadeOutTrans = fadeOutTrans.add(transitions[i].node);
            transitions.splice(i, 1);
          } else
            ++i;
        }
        var afterFadeOut = function (cancelled) {
            if (cancelled) {
              if (callback)
                callback(cancelled);
              return;
            }
            var nTrans = transitions.length;
            var runAfter = function (cancelled) {
                if (nTrans === -1)
                  return;
                if (cancelled) {
                  nTrans = -1;
                  if (callback)
                    callback(cancelled);
                } else if (--nTrans === 0) {
                  if (callback)
                    callback();
                  this._trigger(type, val);
                  if (!opts.noStateChangeEvent)
                    this.trigger("state-change", this.state, changes);
                }
              }.bind(this);
            transitions.forEach(function (trans) {
              transition(trans.node, trans.action.cssType, trans.action.cssVal, runAfter);
            }.bind(this));
          }.bind(this);
        if (fadeOutTrans.length)
          transition(fadeOutTrans, "opacity", 0, afterFadeOut);
        else
          afterFadeOut();
      };
      State.prototype._selectorFor = function (type) {
        return this._selectorMap[type] || this._defaultSelector;
      };
      State.prototype._getTransitions = function (type, val, opts) {
        var transitions = [];
        var sel = opts && opts.sel;
        if (!sel)
          sel = this._selectorFor(type);
        var dataTag = "data-" + this.statePrefix + type;
        $each(sel.find("[" + dataTag + "]"), function (node) {
          var cssType, cssVal, activated = false;
          var nod = node[0], currentState = nod.__domosState;
          if (currentState && currentState[type] === val)
            return;
          activated = node.attr(dataTag).split("|").some(function (state) {
            var colonIdx = state.indexOf(":");
            cssType = "opacity", cssVal = 1;
            if (colonIdx !== -1) {
              var action = state.substr(colonIdx + 1), eqIdx = action.indexOf("=");
              if (eqIdx === -1)
                throw new Error("invalid transition type " + action);
              action = action.split(eqIdx);
              cssType = action[0];
              cssVal = action[1];
              state = state.substr(colonIdx);
            }
            if (state[0] === "!" ? val !== state.substr(1) : val === state) {
              transitions.push({
                node: node,
                action: {
                  cssType: cssType,
                  cssVal: cssVal
                }
              });
              return true;
            } else
              return false;
          }.bind(this));
          if (nod.__domosUndo) {
            if (!activated) {
              transitions.push({
                node: node,
                action: nod.__domosUndo
              });
            } else if (cssType !== nod.__domosUndo.cssType) {
              transitions.push({
                node: node,
                action: nod.__domosUndo
              });
            } else if (cssVal == css(node, cssType)) {
              return;
            }
            delete nod.__domosUndo;
          }
          if (activated) {
            if (!nod.__domosState)
              nod.__domosState = {};
            var prevCssVal = css(node, cssType);
            nod.__domosState[type] = val;
            nod.__domosUndo = {
              cssType: cssType,
              cssVal: prevCssVal
            };
          } else {
            if (nod.__domosState && nod.__domosState[type])
              delete nod.__domosState[type];
          }
        }.bind(this));
        return transitions;
      };
      State.prototype._trigger = function (prefix, type, val) {
        if (!val) {
          val = type;
          type = prefix;
          prefix = "";
        } else {
          prefix = prefix + ":";
        }
        this.trigger(prefix + type + "=" + val, val);
        this.trigger(prefix + type, val);
      };
      State.prototype.restore = function (state, opts) {
        this.state = state;
        _.each(state, function (val, type) {
          if (val === null || val === "null") {
            val = "null";
            delete this.state[type];
          }
          var transitions = this._getTransitions(type, val, opts);
          this._trigger("before", type, val);
          transitions.forEach(function (trans) {
            var cssType = trans.action.cssType, cssVal = trans.action.cssVal, node = trans.node;
            var prevCssVal = css(node, cssType);
            node.show();
            css(node, cssType, cssVal);
            node[0].__domosUndo = {
              cssType: cssType,
              cssVal: prevCssVal
            };
          }.bind(this));
          this._trigger(type, val);
        }.bind(this));
      };
      return State;
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
      TemplateCollectionInstantiation.prototype.indexOf = function (node) {
        if (typeof node === "number")
          return node;
        return this.children.indexOf(node);
      };
      TemplateCollectionInstantiation.prototype.swap = function (a, b) {
        var idxa = this.indexOf(a), idxb = this.indexOf(b);
        if (idxa === idxb)
          return;
        if (idxa > idxb) {
          var tmp = idxa;
          idxa = idxb;
          idxb = tmp;
        }
        var b = this.children.splice(idxb, 1)[0];
        a = this.children.splice(idxa, 1)[0];
        this.insert(b, idxa);
        this.insert(a, idxb);
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
      }.bind(this),
      if: function (value) {
        return function (node, model) {
          if (!value.call(this, model))
            node.hide();
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
        node = $(node.contents()[idx]);
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
        var recurse = function (node) {
            var isStateful = false;
            _.each(node.data(), function (value, key) {
              if (!isStateful) {
                if (isStateful = /^s([A-Z][a-z]+)/.test(key))
                  return;
              }
              var match = /^t([A-Z][a-z]+)/.exec(key);
              if (!match)
                return;
              var attr = match[1].toLowerCase();
              node.removeAttr("data-t-" + attr);
              if (attr === "template")
                return;
              var getValue = getValueFactory(value);
              var transform = transforms[attr];
              transform = transform ? transform(getValue) : setAttr(attr, getValue);
              subs.push({
                pos: _.clone(pos),
                transform: transform
              });
            }.bind(this));
            if (isStateful) {
              subs.push({
                pos: _.clone(pos),
                transform: function (newNode) {
                  var undo = node[0].__domosUndo;
                  if (undo) {
                    newNode[0].__domosUndo = _.clone(undo);
                    if (undo.cssType === "opacity" && undo.cssVal === "0") {
                      newNode.css("opacity", 1);
                      newNode.show();
                    }
                  }
                }
              });
            }
            var idx = 0;
            pos.push(idx);
            _.each(node.contents(), function (child) {
              child = $(child);
              pos[pos.length - 1] = idx++;
              recurse(child);
            }.bind(this));
            pos.pop();
          }.bind(this);
        recurse(node);
        return subs;
      };
      Template.prototype.updateElement = function (model, node) {
        model = model.attributes || model;
        this._subs.forEach(function (sub) {
          var pos = sub.pos, transform = sub.transform;
          var child = getNode(node, pos);
          transform.call(child, child, model);
        }.bind(this));
      };
      Template.prototype.makeElement = function (model) {
        if (model instanceof $)
          return model;
        var node = this.template$.clone();
        this.updateElement(model, node);
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
if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports);
  };
}
define('select',['require','exports','module','./util','./transitions'],function (require, exports) {
  var __util = require("./util"), $each = __util.$each, css = __util.css, compCss = __util.compCss;
  var transition = require("./transitions").transition;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var N_HEAD_NODES = 2;
  var LINK_STYLE_OVERRIDES = {
      color: "inherit",
      fontWeight: "inherit",
      textDecoration: "inherit"
    };
  var Select = function () {
      function Select(node, options) {
        _.extend(options, {
          buttonPadding: 4,
          class: "domos-select",
          buttonClass: "button",
          optionClass: "option"
        });
        this._selectedIndex = node.prop("selectedIndex");
        var mainText = $("<a/>", {
            css: LINK_STYLE_OVERRIDES,
            text: node.children(":selected").text(),
            href: "javascript:void(0)"
          });
        this.$ = $("<div/>", {
          class: options.class,
          css: {
            float: "left",
            overflow: "hidden"
          }
        });
        this.$.append(mainText);
        var fromAttr = node[0].attributes, toAttr = this.$[0].attributes;
        this.$.css("display", node.css("display"));
        for (var i = 0; i < fromAttr.length;) {
          var attr = fromAttr[0];
          if (attr.name.indexOf("data-") === 0) {
            fromAttr.removeNamedItem(attr.name);
            toAttr.setNamedItem(attr);
          } else
            ++i;
        }
        var button = $("<div/>", {
            class: options.buttonClass,
            css: { float: "right" }
          });
        this.$.append(button);
        node.before(this.$).hide();
        var buttonPad = options.buttonPadding, height = this.$.height() - buttonPad * 2;
        var mainHeight = compCss(this.$, "height");
        css(this.$, "height", compCss(this.$, "height"));
        button.css({
          height: height,
          width: height,
          padding: options.buttonPadding
        });
        if (options.drawButton) {
          options.drawButton(button);
        } else {
          var svg = document.createElementNS(SVG_NS, "svg"), path = document.createElementNS(SVG_NS, "path");
          path.setAttributeNS(null, "d", "M 0 " + height % 2 + " l " + height + " 0 " + " l -" + height / 2 + " " + height + " z");
          svg.appendChild(path);
          button.append(svg);
        }
        var highlightedIdx = -1;
        var highlightIdx = function (idx, force) {
            if (!force && idx === highlightedIdx)
              return;
            highlightedIdx = idx;
            $each(this.$.children(), N_HEAD_NODES, function (node, i) {
              if (i - N_HEAD_NODES === idx)
                node.addClass("active");
              else
                node.removeClass("active");
            }.bind(this));
          }.bind(this);
        var enableIdx = function (idx) {
            if (this._selectedIndex === idx)
              return;
            node.prop("selectedIndex", this._selectedIndex = idx);
            mainText.text(node.children(":selected").text());
          }.bind(this);
        var selectOptions = node.children("option");
        this.nOptions = selectOptions.length;
        $each(selectOptions, function (option, idx) {
          var optionDiv = $("<div/>", {
              text: option.text(),
              class: options.optionClass
            });
          optionDiv.on("mouseenter", function () {
            highlightIdx(idx);
          }.bind(this));
          optionDiv.on("click", function () {
            enableIdx(idx);
          }.bind(this));
          this.$.append(optionDiv);
        }.bind(this));
        var isOpen = false;
        var openSelect = function () {
            if (isOpen)
              return;
            isOpen = true;
            transition(this.$, "height", "auto");
            this.$.addClass("open");
            highlightIdx(this._selectedIndex, true);
            var onKeydown = function (e) {
                if (e.which === 40) {
                  if (highlightedIdx < this.nOptions - 1)
                    highlightIdx(highlightedIdx + 1);
                } else if (e.which === 38) {
                  if (highlightedIdx > 0)
                    highlightIdx(highlightedIdx - 1);
                } else
                  return;
                enableIdx(highlightedIdx);
                e.preventDefault();
              }.bind(this);
            $(document).on("keydown", onKeydown);
            setTimeout(function () {
              var defoc = _.once(function () {
                  if (!isOpen)
                    return;
                  $(document).off("keydown", onKeydown);
                  $each(this.$.children(), N_HEAD_NODES, function (node) {
                    node.removeClass("active");
                  }.bind(this));
                  this.$.removeClass("open");
                  transition(this.$, "height", mainHeight);
                  setTimeout(function () {
                    isOpen = false;
                  }.bind(this), 200);
                }.bind(this));
              $("body").one("click", defoc);
              mainText.one("blur", defoc);
            }.bind(this), 200);
          }.bind(this);
        this.$.on("click focus", openSelect);
        mainText.on("click focus", openSelect);
      }
      Select.prototype._selectIndex = function (idx) {
        var input = this.$.children("a");
        input.text($(this.$.children()[idx + N_HEAD_NODES]).text());
      };
      return Select;
    }();
  var enhanceSelects = exports.enhanceSelects = function (nodes, options) {
      options = options || {};
      $each(nodes, function (node) {
        new Select(node, options);
      }.bind(this));
    }.bind(this);
});
define('domos',['require','exports','module','./state','./tooltip','./templates','./transitions','./select','./util'],function(require, exports) {
  require('./state')
  require('./tooltip')
  require('./templates')
  require('./transitions')
  require('./select')
  require('./util')
})
;