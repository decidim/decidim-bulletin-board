window.decidimBulletinBoard = (() => {
  var e = {
      4259: (e, t, n) => {
        "use strict";
        n.d(t, { h4: () => _e, ab: () => ue });
        var r = null,
          i = {},
          o = 1,
          s = "@wry/context:Slot",
          a = Array,
          c =
            a[s] ||
            (function () {
              var e = (function () {
                function e() {
                  this.id = [
                    "slot",
                    o++,
                    Date.now(),
                    Math.random().toString(36).slice(2),
                  ].join(":");
                }
                return (
                  (e.prototype.hasValue = function () {
                    for (var e = r; e; e = e.parent)
                      if (this.id in e.slots) {
                        var t = e.slots[this.id];
                        if (t === i) break;
                        return e !== r && (r.slots[this.id] = t), !0;
                      }
                    return r && (r.slots[this.id] = i), !1;
                  }),
                  (e.prototype.getValue = function () {
                    if (this.hasValue()) return r.slots[this.id];
                  }),
                  (e.prototype.withValue = function (e, t, n, i) {
                    var o,
                      s = (((o = { __proto__: null })[this.id] = e), o),
                      a = r;
                    r = { parent: a, slots: s };
                    try {
                      return t.apply(i, n);
                    } finally {
                      r = a;
                    }
                  }),
                  (e.bind = function (e) {
                    var t = r;
                    return function () {
                      var n = r;
                      try {
                        return (r = t), e.apply(this, arguments);
                      } finally {
                        r = n;
                      }
                    };
                  }),
                  (e.noContext = function (e, t, n) {
                    if (!r) return e.apply(n, t);
                    var i = r;
                    try {
                      return (r = null), e.apply(n, t);
                    } finally {
                      r = i;
                    }
                  }),
                  e
                );
              })();
              try {
                Object.defineProperty(a, s, {
                  value: (a[s] = e),
                  enumerable: !1,
                  writable: !1,
                  configurable: !1,
                });
              } finally {
                return e;
              }
            })();
        c.bind, c.noContext;
        function u() {}
        var l = (function () {
            function e(e, t) {
              void 0 === e && (e = 1 / 0),
                void 0 === t && (t = u),
                (this.max = e),
                (this.dispose = t),
                (this.map = new Map()),
                (this.newest = null),
                (this.oldest = null);
            }
            return (
              (e.prototype.has = function (e) {
                return this.map.has(e);
              }),
              (e.prototype.get = function (e) {
                var t = this.getEntry(e);
                return t && t.value;
              }),
              (e.prototype.getEntry = function (e) {
                var t = this.map.get(e);
                if (t && t !== this.newest) {
                  var n = t.older,
                    r = t.newer;
                  r && (r.older = n),
                    n && (n.newer = r),
                    (t.older = this.newest),
                    (t.older.newer = t),
                    (t.newer = null),
                    (this.newest = t),
                    t === this.oldest && (this.oldest = r);
                }
                return t;
              }),
              (e.prototype.set = function (e, t) {
                var n = this.getEntry(e);
                return n
                  ? (n.value = t)
                  : ((n = {
                      key: e,
                      value: t,
                      newer: null,
                      older: this.newest,
                    }),
                    this.newest && (this.newest.newer = n),
                    (this.newest = n),
                    (this.oldest = this.oldest || n),
                    this.map.set(e, n),
                    n.value);
              }),
              (e.prototype.clean = function () {
                for (; this.oldest && this.map.size > this.max; )
                  this.delete(this.oldest.key);
              }),
              (e.prototype.delete = function (e) {
                var t = this.map.get(e);
                return (
                  !!t &&
                  (t === this.newest && (this.newest = t.older),
                  t === this.oldest && (this.oldest = t.newer),
                  t.newer && (t.newer.older = t.older),
                  t.older && (t.older.newer = t.newer),
                  this.map.delete(e),
                  this.dispose(t.value, e),
                  !0)
                );
              }),
              e
            );
          })(),
          f = new c();
        function p(e) {
          var t = e.unsubscribe;
          "function" == typeof t && ((e.unsubscribe = void 0), t());
        }
        var h = [];
        function d(e, t) {
          if (!e) throw new Error(t || "assertion failure");
        }
        function v(e) {
          switch (e.length) {
            case 0:
              throw new Error("unknown value");
            case 1:
              return e[0];
            case 2:
              throw e[1];
          }
        }
        var y = (function () {
          function e(t, n) {
            (this.fn = t),
              (this.args = n),
              (this.parents = new Set()),
              (this.childValues = new Map()),
              (this.dirtyChildren = null),
              (this.dirty = !0),
              (this.recomputing = !1),
              (this.value = []),
              (this.deps = null),
              ++e.count;
          }
          return (
            (e.prototype.peek = function () {
              if (1 === this.value.length && !b(this)) return this.value[0];
            }),
            (e.prototype.recompute = function () {
              return (
                d(!this.recomputing, "already recomputing"),
                (function (e) {
                  var t = f.getValue();
                  if (t)
                    e.parents.add(t),
                      t.childValues.has(e) || t.childValues.set(e, []),
                      b(e) ? E(t, e) : T(t, e);
                })(this),
                b(this)
                  ? (function (e) {
                      w(e),
                        f.withValue(e, m, [e]),
                        (function (e) {
                          if ("function" == typeof e.subscribe)
                            try {
                              p(e),
                                (e.unsubscribe = e.subscribe.apply(
                                  null,
                                  e.args
                                ));
                            } catch (t) {
                              return e.setDirty(), !1;
                            }
                          return !0;
                        })(e) &&
                          (function (e) {
                            if (((e.dirty = !1), b(e))) return;
                            k(e);
                          })(e);
                      return v(e.value);
                    })(this)
                  : v(this.value)
              );
            }),
            (e.prototype.setDirty = function () {
              this.dirty ||
                ((this.dirty = !0),
                (this.value.length = 0),
                g(this),
                w(this),
                p(this));
            }),
            (e.prototype.dispose = function () {
              var e = this;
              w(this),
                p(this),
                this.parents.forEach(function (t) {
                  t.setDirty(), O(t, e);
                });
            }),
            (e.prototype.dependOn = function (e) {
              e.add(this),
                this.deps || (this.deps = h.pop() || new Set()),
                this.deps.add(e);
            }),
            (e.prototype.forgetDeps = function () {
              var e = this;
              this.deps &&
                (this.deps.forEach(function (t) {
                  return t.delete(e);
                }),
                this.deps.clear(),
                h.push(this.deps),
                (this.deps = null));
            }),
            (e.count = 0),
            e
          );
        })();
        function m(e) {
          (e.recomputing = !0), (e.value.length = 0);
          try {
            e.value[0] = e.fn.apply(null, e.args);
          } catch (t) {
            e.value[1] = t;
          }
          e.recomputing = !1;
        }
        function b(e) {
          return e.dirty || !(!e.dirtyChildren || !e.dirtyChildren.size);
        }
        function g(e) {
          e.parents.forEach(function (t) {
            return E(t, e);
          });
        }
        function k(e) {
          e.parents.forEach(function (t) {
            return T(t, e);
          });
        }
        function E(e, t) {
          if ((d(e.childValues.has(t)), d(b(t)), e.dirtyChildren)) {
            if (e.dirtyChildren.has(t)) return;
          } else e.dirtyChildren = h.pop() || new Set();
          e.dirtyChildren.add(t), g(e);
        }
        function T(e, t) {
          d(e.childValues.has(t)), d(!b(t));
          var n,
            r,
            i,
            o = e.childValues.get(t);
          0 === o.length
            ? e.childValues.set(t, t.value.slice(0))
            : ((n = o),
              (r = t.value),
              ((i = n.length) > 0 && i === r.length && n[i - 1] === r[i - 1]) ||
                e.setDirty()),
            S(e, t),
            b(e) || k(e);
        }
        function S(e, t) {
          var n = e.dirtyChildren;
          n &&
            (n.delete(t),
            0 === n.size &&
              (h.length < 100 && h.push(n), (e.dirtyChildren = null)));
        }
        function w(e) {
          e.childValues.size > 0 &&
            e.childValues.forEach(function (t, n) {
              O(e, n);
            }),
            e.forgetDeps(),
            d(null === e.dirtyChildren);
        }
        function O(e, t) {
          t.parents.delete(e), e.childValues.delete(t), S(e, t);
        }
        var _ = function () {
            return Object.create(null);
          },
          I = Array.prototype,
          N = I.forEach,
          x = I.slice,
          D = (function () {
            function e(e, t) {
              void 0 === t && (t = _), (this.weakness = e), (this.makeData = t);
            }
            return (
              (e.prototype.lookup = function () {
                for (var e = [], t = 0; t < arguments.length; t++)
                  e[t] = arguments[t];
                return this.lookupArray(e);
              }),
              (e.prototype.lookupArray = function (e) {
                var t = this;
                return (
                  N.call(e, function (e) {
                    return (t = t.getChildTrie(e));
                  }),
                  t.data || (t.data = this.makeData(x.call(e)))
                );
              }),
              (e.prototype.getChildTrie = function (t) {
                var n =
                    this.weakness &&
                    (function (e) {
                      switch (typeof e) {
                        case "object":
                          if (null === e) break;
                        case "function":
                          return !0;
                      }
                      return !1;
                    })(t)
                      ? this.weak || (this.weak = new WeakMap())
                      : this.strong || (this.strong = new Map()),
                  r = n.get(t);
                return (
                  r || n.set(t, (r = new e(this.weakness, this.makeData))), r
                );
              }),
              e
            );
          })();
        function A(e) {
          var t = new Map(),
            n = e && e.subscribe;
          function r(e) {
            var r = f.getValue();
            if (r) {
              var i = t.get(e);
              i || t.set(e, (i = new Set())),
                r.dependOn(i),
                "function" == typeof n && (p(i), (i.unsubscribe = n(e)));
            }
          }
          return (
            (r.dirty = function (e) {
              var n = t.get(e);
              n &&
                (n.forEach(function (e) {
                  return e.setDirty();
                }),
                t.delete(e),
                p(n));
            }),
            r
          );
        }
        var R = new D("function" == typeof WeakMap);
        function C() {
          for (var e = [], t = 0; t < arguments.length; t++)
            e[t] = arguments[t];
          return R.lookupArray(e);
        }
        var F = new Set();
        function P(e, t) {
          void 0 === t && (t = Object.create(null));
          var n = new l(t.max || Math.pow(2, 16), function (e) {
              return e.dispose();
            }),
            r =
              t.keyArgs ||
              function () {
                for (var e = [], t = 0; t < arguments.length; t++)
                  e[t] = arguments[t];
                return e;
              },
            i = t.makeCacheKey || C;
          function o() {
            var o = i.apply(null, r.apply(null, arguments));
            if (void 0 === o) return e.apply(null, arguments);
            var s = Array.prototype.slice.call(arguments),
              a = n.get(o);
            a
              ? (a.args = s)
              : ((a = new y(e, s)), n.set(o, a), (a.subscribe = t.subscribe));
            var c = a.recompute();
            return (
              n.set(o, a),
              F.add(n),
              f.hasValue() ||
                (F.forEach(function (e) {
                  return e.clean();
                }),
                F.clear()),
              c
            );
          }
          function s() {
            var e = i.apply(null, arguments);
            if (void 0 !== e) return n.get(e);
          }
          return (
            (o.dirty = function () {
              var e = s.apply(null, arguments);
              e && e.setDirty();
            }),
            (o.peek = function () {
              var e = s.apply(null, arguments);
              if (e) return e.peek();
            }),
            (o.forget = function () {
              var e = i.apply(null, arguments);
              return void 0 !== e && n.delete(e);
            }),
            o
          );
        }
        var M,
          L = n(9188),
          j = (function () {
            function e() {
              this.getFragmentDoc = P(L.Yk);
            }
            return (
              (e.prototype.recordOptimisticTransaction = function (e, t) {
                this.performTransaction(e, t);
              }),
              (e.prototype.transformDocument = function (e) {
                return e;
              }),
              (e.prototype.identify = function (e) {}),
              (e.prototype.gc = function () {
                return [];
              }),
              (e.prototype.modify = function (e) {
                return !1;
              }),
              (e.prototype.transformForLink = function (e) {
                return e;
              }),
              (e.prototype.readQuery = function (e, t) {
                return (
                  void 0 === t && (t = !1),
                  this.read({
                    rootId: e.id || "ROOT_QUERY",
                    query: e.query,
                    variables: e.variables,
                    optimistic: t,
                  })
                );
              }),
              (e.prototype.readFragment = function (e, t) {
                return (
                  void 0 === t && (t = !1),
                  this.read({
                    query: this.getFragmentDoc(e.fragment, e.fragmentName),
                    variables: e.variables,
                    rootId: e.id,
                    optimistic: t,
                  })
                );
              }),
              (e.prototype.writeQuery = function (e) {
                return this.write({
                  dataId: e.id || "ROOT_QUERY",
                  result: e.data,
                  query: e.query,
                  variables: e.variables,
                  broadcast: e.broadcast,
                });
              }),
              (e.prototype.writeFragment = function (e) {
                return this.write({
                  dataId: e.id,
                  result: e.data,
                  variables: e.variables,
                  query: this.getFragmentDoc(e.fragment, e.fragmentName),
                  broadcast: e.broadcast,
                });
              }),
              e
            );
          })();
        M || (M = {});
        var q = function (e, t, n, r, i) {
            (this.message = e),
              (this.path = t),
              (this.query = n),
              (this.clientOnly = r),
              (this.variables = i);
          },
          K = n(655),
          V = n(7591),
          Q = n(2152),
          B = Object.prototype.hasOwnProperty;
        var U = /^[_a-z][_0-9a-z]*/i;
        function G(e) {
          var t = e.match(U);
          return t ? t[0] : e;
        }
        function Y(e, t, n) {
          return (
            !(!t || "object" != typeof t) &&
            (Array.isArray(t)
              ? t.every(function (t) {
                  return Y(e, t, n);
                })
              : e.selections.every(function (e) {
                  if ((0, L.My)(e) && (0, L.LZ)(e, n)) {
                    var r = (0, L.u2)(e);
                    return (
                      B.call(t, r) &&
                      (!e.selectionSet || Y(e.selectionSet, t[r], n))
                    );
                  }
                  return !0;
                }))
          );
        }
        function J(e) {
          return (
            null !== e &&
            "object" == typeof e &&
            !(0, L.hh)(e) &&
            !Array.isArray(e)
          );
        }
        function $(e) {
          var t = e && e.__field;
          return t && (0, L.My)(t);
        }
        var H = function (e, t, n) {
            var r = e[n],
              i = t[n];
            return $(r)
              ? ((r.__value = this.merge(r.__value, $(i) ? i.__value : i)), r)
              : $(i)
              ? ((i.__value = this.merge(r, i.__value)), i)
              : this.merge(r, i);
          },
          W = Object.create(null),
          z = function () {
            return W;
          },
          X = Object.create(null),
          Z = (function () {
            function e(e, t) {
              var n = this;
              (this.policies = e),
                (this.group = t),
                (this.data = Object.create(null)),
                (this.rootIds = Object.create(null)),
                (this.refs = Object.create(null)),
                (this.getFieldValue = function (e, t) {
                  return (0, L.Jv)(
                    (0, L.hh)(e) ? n.get(e.__ref, t) : e && e[t]
                  );
                }),
                (this.canRead = function (e) {
                  return (0, L.hh)(e) ? n.has(e.__ref) : "object" == typeof e;
                }),
                (this.toReference = function (e, t) {
                  if ("string" == typeof e) return (0, L.kQ)(e);
                  if ((0, L.hh)(e)) return e;
                  var r = n.policies.identify(e)[0];
                  if (r) {
                    var i = (0, L.kQ)(r);
                    return t && n.merge(r, e), i;
                  }
                });
            }
            return (
              (e.prototype.toObject = function () {
                return (0, K.pi)({}, this.data);
              }),
              (e.prototype.has = function (e) {
                return void 0 !== this.lookup(e, !0);
              }),
              (e.prototype.get = function (e, t) {
                if ((this.group.depend(e, t), B.call(this.data, e))) {
                  var n = this.data[e];
                  if (n && B.call(n, t)) return n[t];
                }
                return "__typename" === t &&
                  B.call(this.policies.rootTypenamesById, e)
                  ? this.policies.rootTypenamesById[e]
                  : this instanceof ne
                  ? this.parent.get(e, t)
                  : void 0;
              }),
              (e.prototype.lookup = function (e, t) {
                return (
                  t && this.group.depend(e, "__exists"),
                  B.call(this.data, e)
                    ? this.data[e]
                    : this instanceof ne
                    ? this.parent.lookup(e, t)
                    : void 0
                );
              }),
              (e.prototype.merge = function (e, t) {
                var n = this,
                  r = this.lookup(e),
                  i = new L.w0(re).merge(r, t);
                if (
                  ((this.data[e] = i),
                  i !== r && (delete this.refs[e], this.group.caching))
                ) {
                  var o = Object.create(null);
                  r || (o.__exists = 1),
                    Object.keys(t).forEach(function (e) {
                      (r && r[e] === i[e]) ||
                        ((o[G(e)] = 1),
                        void 0 !== i[e] || n instanceof ne || delete i[e]);
                    }),
                    Object.keys(o).forEach(function (t) {
                      return n.group.dirty(e, t);
                    });
                }
              }),
              (e.prototype.modify = function (e, t) {
                var n = this,
                  r = this.lookup(e);
                if (r) {
                  var i = Object.create(null),
                    o = !1,
                    s = !0,
                    a = {
                      DELETE: W,
                      INVALIDATE: X,
                      isReference: L.hh,
                      toReference: this.toReference,
                      canRead: this.canRead,
                      readField: function (t, r) {
                        return n.policies.readField(
                          "string" == typeof t
                            ? { fieldName: t, from: r || (0, L.kQ)(e) }
                            : t,
                          { store: n }
                        );
                      },
                    };
                  if (
                    (Object.keys(r).forEach(function (c) {
                      var u = G(c),
                        l = r[c];
                      if (void 0 !== l) {
                        var f = "function" == typeof t ? t : t[c] || t[u];
                        if (f) {
                          var p =
                            f === z
                              ? W
                              : f(
                                  (0, L.Jv)(l),
                                  (0, K.pi)((0, K.pi)({}, a), {
                                    fieldName: u,
                                    storeFieldName: c,
                                    storage: n.getStorage(e, c),
                                  })
                                );
                          p === X
                            ? n.group.dirty(e, c)
                            : (p === W && (p = void 0),
                              p !== l && ((i[c] = p), (o = !0), (l = p)));
                        }
                        void 0 !== l && (s = !1);
                      }
                    }),
                    o)
                  )
                    return (
                      this.merge(e, i),
                      s &&
                        (this instanceof ne
                          ? (this.data[e] = void 0)
                          : delete this.data[e],
                        this.group.dirty(e, "__exists")),
                      !0
                    );
                }
                return !1;
              }),
              (e.prototype.delete = function (e, t, n) {
                var r,
                  i = this.lookup(e);
                if (i) {
                  var o = this.getFieldValue(i, "__typename"),
                    s =
                      t && n
                        ? this.policies.getStoreFieldName({
                            typename: o,
                            fieldName: t,
                            args: n,
                          })
                        : t;
                  return this.modify(e, s ? (((r = {})[s] = z), r) : z);
                }
                return !1;
              }),
              (e.prototype.evict = function (e) {
                var t = !1;
                return (
                  e.id &&
                    (B.call(this.data, e.id) &&
                      (t = this.delete(e.id, e.fieldName, e.args)),
                    this instanceof ne && (t = this.parent.evict(e) || t),
                    (e.fieldName || t) &&
                      this.group.dirty(e.id, e.fieldName || "__exists")),
                  t
                );
              }),
              (e.prototype.clear = function () {
                this.replace(null);
              }),
              (e.prototype.replace = function (e) {
                var t = this;
                Object.keys(this.data).forEach(function (n) {
                  (e && B.call(e, n)) || t.delete(n);
                }),
                  e &&
                    Object.keys(e).forEach(function (n) {
                      t.merge(n, e[n]);
                    });
              }),
              (e.prototype.retain = function (e) {
                return (this.rootIds[e] = (this.rootIds[e] || 0) + 1);
              }),
              (e.prototype.release = function (e) {
                if (this.rootIds[e] > 0) {
                  var t = --this.rootIds[e];
                  return t || delete this.rootIds[e], t;
                }
                return 0;
              }),
              (e.prototype.getRootIdSet = function (e) {
                return (
                  void 0 === e && (e = new Set()),
                  Object.keys(this.rootIds).forEach(e.add, e),
                  this instanceof ne
                    ? this.parent.getRootIdSet(e)
                    : Object.keys(this.policies.rootTypenamesById).forEach(
                        e.add,
                        e
                      ),
                  e
                );
              }),
              (e.prototype.gc = function () {
                var e = this,
                  t = this.getRootIdSet(),
                  n = this.toObject();
                t.forEach(function (r) {
                  B.call(n, r) &&
                    (Object.keys(e.findChildRefIds(r)).forEach(t.add, t),
                    delete n[r]);
                });
                var r = Object.keys(n);
                if (r.length) {
                  for (var i = this; i instanceof ne; ) i = i.parent;
                  r.forEach(function (e) {
                    return i.delete(e);
                  });
                }
                return r;
              }),
              (e.prototype.findChildRefIds = function (e) {
                if (!B.call(this.refs, e)) {
                  var t = (this.refs[e] = Object.create(null)),
                    n = new Set([this.data[e]]),
                    r = function (e) {
                      return null !== e && "object" == typeof e;
                    };
                  n.forEach(function (e) {
                    (0, L.hh)(e)
                      ? (t[e.__ref] = !0)
                      : r(e) && Object.values(e).filter(r).forEach(n.add, n);
                  });
                }
                return this.refs[e];
              }),
              (e.prototype.makeCacheKey = function () {
                for (var e = [], t = 0; t < arguments.length; t++)
                  e[t] = arguments[t];
                return this.group.keyMaker.lookupArray(e);
              }),
              e
            );
          })(),
          ee = (function () {
            function e(e) {
              (this.caching = e),
                (this.d = null),
                (this.keyMaker = new D(L.mr)),
                (this.d = e ? A() : null);
            }
            return (
              (e.prototype.depend = function (e, t) {
                this.d && this.d(te(e, t));
              }),
              (e.prototype.dirty = function (e, t) {
                this.d && this.d.dirty(te(e, t));
              }),
              e
            );
          })();
        function te(e, t) {
          return G(t) + "#" + e;
        }
        !(function (e) {
          var t = (function (e) {
            function t(t) {
              var n = t.policies,
                r = t.resultCaching,
                i = void 0 === r || r,
                o = t.seed,
                s = e.call(this, n, new ee(i)) || this;
              return (
                (s.storageTrie = new D(L.mr)),
                (s.sharedLayerGroup = new ee(i)),
                o && s.replace(o),
                s
              );
            }
            return (
              (0, K.ZT)(t, e),
              (t.prototype.addLayer = function (e, t) {
                return new ne(e, this, t, this.sharedLayerGroup);
              }),
              (t.prototype.removeLayer = function () {
                return this;
              }),
              (t.prototype.getStorage = function (e, t) {
                return this.storageTrie.lookup(e, t);
              }),
              t
            );
          })(e);
          e.Root = t;
        })(Z || (Z = {}));
        var ne = (function (e) {
          function t(t, n, r, i) {
            var o = e.call(this, n.policies, i) || this;
            return (
              (o.id = t), (o.parent = n), (o.replay = r), (o.group = i), r(o), o
            );
          }
          return (
            (0, K.ZT)(t, e),
            (t.prototype.addLayer = function (e, n) {
              return new t(e, this, n, this.group);
            }),
            (t.prototype.removeLayer = function (e) {
              var t = this,
                n = this.parent.removeLayer(e);
              return e === this.id
                ? (this.group.caching &&
                    Object.keys(this.data).forEach(function (e) {
                      t.data[e] !== n.lookup(e) && t.delete(e);
                    }),
                  n)
                : n === this.parent
                ? this
                : n.addLayer(this.id, this.replay);
            }),
            (t.prototype.toObject = function () {
              return (0, K.pi)(
                (0, K.pi)({}, this.parent.toObject()),
                this.data
              );
            }),
            (t.prototype.findChildRefIds = function (t) {
              var n = this.parent.findChildRefIds(t);
              return B.call(this.data, t)
                ? (0, K.pi)(
                    (0, K.pi)({}, n),
                    e.prototype.findChildRefIds.call(this, t)
                  )
                : n;
            }),
            (t.prototype.getStorage = function (e, t) {
              return this.parent.getStorage(e, t);
            }),
            t
          );
        })(Z);
        function re(e, t, n) {
          var r = e[n],
            i = t[n];
          return (0, Q.D)(r, i) ? r : i;
        }
        function ie(e) {
          return !!(e instanceof Z && e.group.caching);
        }
        function oe(e, t) {
          return new q(
            e.message,
            t.path.slice(),
            t.query,
            t.clientOnly,
            t.variables
          );
        }
        var se = (function () {
          function e(e) {
            var t = this;
            (this.config = e),
              (this.executeSelectionSet = P(
                function (e) {
                  return t.execSelectionSetImpl(e);
                },
                {
                  keyArgs: function (e) {
                    return [e.selectionSet, e.objectOrReference, e.context];
                  },
                  makeCacheKey: function (e, t, n) {
                    if (ie(n.store))
                      return n.store.makeCacheKey(
                        e,
                        (0, L.hh)(t) ? t.__ref : t,
                        n.varString
                      );
                  },
                }
              )),
              (this.knownResults = new WeakMap()),
              (this.executeSubSelectedArray = P(
                function (e) {
                  return t.execSubSelectedArrayImpl(e);
                },
                {
                  makeCacheKey: function (e) {
                    var t = e.field,
                      n = e.array,
                      r = e.context;
                    if (ie(r.store))
                      return r.store.makeCacheKey(t, n, r.varString);
                  },
                }
              )),
              (this.config = (0, K.pi)({ addTypename: !0 }, e));
          }
          return (
            (e.prototype.diffQueryAgainstStore = function (e) {
              var t = e.store,
                n = e.query,
                r = e.rootId,
                i = void 0 === r ? "ROOT_QUERY" : r,
                o = e.variables,
                s = e.returnPartialData,
                a = void 0 === s || s,
                c = this.config.cache.policies;
              o = (0, K.pi)((0, K.pi)({}, (0, L.O4)((0, L.iW)(n))), o);
              var u = this.executeSelectionSet({
                  selectionSet: (0, L.p$)(n).selectionSet,
                  objectOrReference: (0, L.kQ)(i),
                  context: {
                    store: t,
                    query: n,
                    policies: c,
                    variables: o,
                    varString: JSON.stringify(o),
                    fragmentMap: (0, L.F)((0, L.kU)(n)),
                    path: [],
                    clientOnly: !1,
                  },
                }),
                l = u.missing && u.missing.length > 0;
              if (l && !a) throw u.missing[0];
              return { result: u.result, missing: u.missing, complete: !l };
            }),
            (e.prototype.isFresh = function (e, t, n, r) {
              if (ie(r.store) && this.knownResults.get(e) === n) {
                var i = this.executeSelectionSet.peek(n, t, r);
                if (i && e === i.result) return !0;
              }
              return !1;
            }),
            (e.prototype.execSelectionSetImpl = function (e) {
              var t = this,
                n = e.selectionSet,
                r = e.objectOrReference,
                i = e.context;
              if (
                (0, L.hh)(r) &&
                !i.policies.rootTypenamesById[r.__ref] &&
                !i.store.has(r.__ref)
              )
                return { result: {}, missing: [oe(new V.ej(4), i)] };
              var o = i.variables,
                s = i.policies,
                a = i.store,
                c = [],
                u = { result: null },
                l = a.getFieldValue(r, "__typename");
              function f() {
                return u.missing || (u.missing = []);
              }
              function p(e) {
                var t;
                return (
                  e.missing && (t = f()).push.apply(t, e.missing), e.result
                );
              }
              this.config.addTypename &&
                "string" == typeof l &&
                !s.rootIdsByTypename[l] &&
                c.push({ __typename: l });
              var h = new Set(n.selections);
              return (
                h.forEach(function (e) {
                  var n;
                  if ((0, L.LZ)(e, o))
                    if ((0, L.My)(e)) {
                      var a = s.readField(
                          {
                            fieldName: e.name.value,
                            field: e,
                            variables: i.variables,
                            from: r,
                          },
                          i
                        ),
                        u = (0, L.u2)(e);
                      i.path.push(u);
                      var d = i.clientOnly;
                      (i.clientOnly =
                        d ||
                        !(
                          !e.directives ||
                          !e.directives.some(function (e) {
                            return "client" === e.name.value;
                          })
                        )),
                        void 0 === a
                          ? L.Gw.added(e) || f().push(oe(new V.ej(5), i))
                          : Array.isArray(a)
                          ? (a = p(
                              t.executeSubSelectedArray({
                                field: e,
                                array: a,
                                context: i,
                              })
                            ))
                          : e.selectionSet &&
                            null != a &&
                            (a = p(
                              t.executeSelectionSet({
                                selectionSet: e.selectionSet,
                                objectOrReference: a,
                                context: i,
                              })
                            )),
                        void 0 !== a && c.push((((n = {})[u] = a), n)),
                        (i.clientOnly = d),
                        (0, V.kG)(i.path.pop() === u);
                    } else {
                      var v = (0, L.hi)(e, i.fragmentMap);
                      v &&
                        s.fragmentMatches(v, l) &&
                        v.selectionSet.selections.forEach(h.add, h);
                    }
                }),
                (u.result = (0, L.bw)(c)),
                this.knownResults.set(u.result, n),
                u
              );
            }),
            (e.prototype.execSubSelectedArrayImpl = function (e) {
              var t,
                n = this,
                r = e.field,
                i = e.array,
                o = e.context;
              function s(e, n) {
                return (
                  e.missing && (t = t || []).push.apply(t, e.missing),
                  (0, V.kG)(o.path.pop() === n),
                  e.result
                );
              }
              return (
                r.selectionSet && (i = i.filter(o.store.canRead)),
                {
                  result: (i = i.map(function (e, t) {
                    return null === e
                      ? null
                      : (o.path.push(t),
                        Array.isArray(e)
                          ? s(
                              n.executeSubSelectedArray({
                                field: r,
                                array: e,
                                context: o,
                              }),
                              t
                            )
                          : r.selectionSet
                          ? s(
                              n.executeSelectionSet({
                                selectionSet: r.selectionSet,
                                objectOrReference: e,
                                context: o,
                              }),
                              t
                            )
                          : ((0, V.kG)(o.path.pop() === t), e));
                  })),
                  missing: t,
                }
              );
            }),
            e
          );
        })();
        var ae = (function () {
          function e(e, t) {
            (this.cache = e), (this.reader = t);
          }
          return (
            (e.prototype.writeToStore = function (e) {
              var t = e.query,
                n = e.result,
                r = e.dataId,
                i = e.store,
                o = e.variables,
                s = (0, L.$H)(t),
                a = new L.w0(H);
              o = (0, K.pi)((0, K.pi)({}, (0, L.O4)(s)), o);
              var c = this.processSelectionSet({
                result: n || Object.create(null),
                dataId: r,
                selectionSet: s.selectionSet,
                context: {
                  store: i,
                  written: Object.create(null),
                  merge: function (e, t) {
                    return a.merge(e, t);
                  },
                  variables: o,
                  varString: JSON.stringify(o),
                  fragmentMap: (0, L.F)((0, L.kU)(t)),
                },
              });
              if (!(0, L.hh)(c)) throw new V.ej(7);
              return i.retain(c.__ref), c;
            }),
            (e.prototype.processSelectionSet = function (e) {
              var t = this,
                n = e.dataId,
                r = e.result,
                i = e.selectionSet,
                o = e.context,
                s = e.out,
                a = void 0 === s ? { shouldApplyMerges: !1 } : s,
                c = this.cache.policies,
                u = c.identify(r, i, o.fragmentMap),
                l = u[0],
                f = u[1];
              if ("string" == typeof (n = n || l)) {
                var p = o.written[n] || (o.written[n] = []),
                  h = (0, L.kQ)(n);
                if (p.indexOf(i) >= 0) return h;
                if ((p.push(i), this.reader && this.reader.isFresh(r, h, i, o)))
                  return h;
              }
              var d = Object.create(null);
              f && (d = o.merge(d, f));
              var v =
                (n && c.rootTypenamesById[n]) ||
                (0, L.qw)(r, i, o.fragmentMap) ||
                (n && o.store.get(n, "__typename"));
              "string" == typeof v && (d.__typename = v);
              var y = new Set(i.selections);
              if (
                (y.forEach(function (e) {
                  var n;
                  if ((0, L.LZ)(e, o.variables))
                    if ((0, L.My)(e)) {
                      var i = (0, L.u2)(e),
                        s = r[i];
                      if (void 0 !== s) {
                        var u = c.getStoreFieldName({
                            typename: v,
                            fieldName: e.name.value,
                            field: e,
                            variables: o.variables,
                          }),
                          l = t.processFieldValue(s, e, o, a);
                        c.hasMergeFunction(v, e.name.value) &&
                          ((l = { __field: e, __typename: v, __value: l }),
                          (a.shouldApplyMerges = !0)),
                          (d = o.merge(d, (((n = {})[u] = l), n)));
                      } else if (
                        c.usingPossibleTypes &&
                        !(0, L.FS)(["defer", "client"], e)
                      )
                        throw new V.ej(8);
                    } else {
                      var f = (0, L.hi)(e, o.fragmentMap);
                      f &&
                        c.fragmentMatches(f, v, r, o.variables) &&
                        f.selectionSet.selections.forEach(y.add, y);
                    }
                }),
                "string" == typeof n)
              ) {
                var m = (0, L.kQ)(n);
                return (
                  a.shouldApplyMerges && (d = c.applyMerges(m, d, o)),
                  o.store.merge(n, d),
                  m
                );
              }
              return d;
            }),
            (e.prototype.processFieldValue = function (e, t, n, r) {
              var i = this;
              return t.selectionSet && null !== e
                ? Array.isArray(e)
                  ? e.map(function (e) {
                      return i.processFieldValue(e, t, n, r);
                    })
                  : this.processSelectionSet({
                      result: e,
                      selectionSet: t.selectionSet,
                      context: n,
                      out: r,
                    })
                : e;
            }),
            e
          );
        })();
        new Set();
        var ce = A(),
          ue = new c();
        function le(e, t) {
          var n = [];
          e.forEach(function (e) {
            return n.push(e);
          }),
            e.clear(),
            n.forEach(t);
        }
        function fe(e) {
          var t = new Set(),
            n = new Set(),
            r = function (i) {
              if (arguments.length > 0)
                e !== i &&
                  ((e = i),
                  ce.dirty(r),
                  t.forEach(pe),
                  le(n, function (t) {
                    return t(e);
                  }));
              else {
                var o = ue.getValue();
                o && t.add(o), ce(r);
              }
              return e;
            };
          return (
            (r.onNextChange = function (e) {
              return (
                n.add(e),
                function () {
                  n.delete(e);
                }
              );
            }),
            r
          );
        }
        function pe(e) {
          e.broadcastWatches && e.broadcastWatches();
        }
        function he(e) {
          return void 0 !== e.args
            ? e.args
            : e.field
            ? (0, L.NC)(e.field, e.variables)
            : null;
        }
        var de = function (e, t) {
            var n = e.__typename,
              r = e.id,
              i = e._id;
            if (
              "string" == typeof n &&
              (t &&
                (t.keyObject =
                  void 0 !== r
                    ? { id: r }
                    : void 0 !== i
                    ? { _id: i }
                    : void 0),
              void 0 === r && (r = i),
              void 0 !== r)
            )
              return (
                n +
                ":" +
                ("number" == typeof r || "string" == typeof r
                  ? r
                  : JSON.stringify(r))
              );
          },
          ve = function () {},
          ye = function (e, t) {
            return t.fieldName;
          },
          me = function (e, t, n) {
            return (0, n.mergeObjects)(e, t);
          },
          be = function (e, t) {
            return t;
          },
          ge = (function () {
            function e(e) {
              (this.config = e),
                (this.typePolicies = Object.create(null)),
                (this.supertypeMap = new Map()),
                (this.fuzzySubtypes = new Map()),
                (this.rootIdsByTypename = Object.create(null)),
                (this.rootTypenamesById = Object.create(null)),
                (this.usingPossibleTypes = !1),
                (this.config = (0, K.pi)({ dataIdFromObject: de }, e)),
                (this.cache = this.config.cache),
                this.setRootTypename("Query"),
                this.setRootTypename("Mutation"),
                this.setRootTypename("Subscription"),
                e.possibleTypes && this.addPossibleTypes(e.possibleTypes),
                e.typePolicies && this.addTypePolicies(e.typePolicies);
            }
            return (
              (e.prototype.identify = function (e, t, n) {
                var r = t && n ? (0, L.qw)(e, t, n) : e.__typename;
                if (r === this.rootTypenamesById.ROOT_QUERY)
                  return ["ROOT_QUERY"];
                for (
                  var i,
                    o = { typename: r, selectionSet: t, fragmentMap: n },
                    s = this.getTypePolicy(r, !1),
                    a = (s && s.keyFn) || this.config.dataIdFromObject;
                  a;

                ) {
                  var c = a(e, o);
                  if (!Array.isArray(c)) {
                    i = c;
                    break;
                  }
                  a = Te(c);
                }
                return (
                  (i = i && String(i)), o.keyObject ? [i, o.keyObject] : [i]
                );
              }),
              (e.prototype.addTypePolicies = function (e) {
                var t = this;
                Object.keys(e).forEach(function (n) {
                  var r = t.getTypePolicy(n, !0),
                    i = e[n],
                    o = i.keyFields,
                    s = i.fields;
                  i.queryType && t.setRootTypename("Query", n),
                    i.mutationType && t.setRootTypename("Mutation", n),
                    i.subscriptionType && t.setRootTypename("Subscription", n),
                    (r.keyFn =
                      !1 === o
                        ? ve
                        : Array.isArray(o)
                        ? Te(o)
                        : "function" == typeof o
                        ? o
                        : r.keyFn),
                    s &&
                      Object.keys(s).forEach(function (e) {
                        var r = t.getFieldPolicy(n, e, !0),
                          i = s[e];
                        if ("function" == typeof i) r.read = i;
                        else {
                          var o = i.keyArgs,
                            a = i.read,
                            c = i.merge;
                          (r.keyFn =
                            !1 === o
                              ? ye
                              : Array.isArray(o)
                              ? Ee(o)
                              : "function" == typeof o
                              ? o
                              : r.keyFn),
                            "function" == typeof a && (r.read = a),
                            (r.merge =
                              "function" == typeof c
                                ? c
                                : !0 === c
                                ? me
                                : !1 === c
                                ? be
                                : r.merge);
                        }
                        r.read && r.merge && (r.keyFn = r.keyFn || ye);
                      });
                });
              }),
              (e.prototype.setRootTypename = function (e, t) {
                void 0 === t && (t = e);
                var n = "ROOT_" + e.toUpperCase(),
                  r = this.rootTypenamesById[n];
                t !== r &&
                  ((0, V.kG)(!r || r === e, 1),
                  r && delete this.rootIdsByTypename[r],
                  (this.rootIdsByTypename[t] = n),
                  (this.rootTypenamesById[n] = t));
              }),
              (e.prototype.addPossibleTypes = function (e) {
                var t = this;
                (this.usingPossibleTypes = !0),
                  Object.keys(e).forEach(function (n) {
                    t.getSupertypeSet(n, !0),
                      e[n].forEach(function (e) {
                        t.getSupertypeSet(e, !0).add(n);
                        var r = e.match(U);
                        (r && r[0] === e) ||
                          t.fuzzySubtypes.set(e, new RegExp(e));
                      });
                  });
              }),
              (e.prototype.getTypePolicy = function (e, t) {
                if (e)
                  return (
                    this.typePolicies[e] ||
                    (t && (this.typePolicies[e] = Object.create(null)))
                  );
              }),
              (e.prototype.getFieldPolicy = function (e, t, n) {
                var r = this.getTypePolicy(e, n);
                if (r) {
                  var i = r.fields || (n && (r.fields = Object.create(null)));
                  if (i) return i[t] || (n && (i[t] = Object.create(null)));
                }
              }),
              (e.prototype.getSupertypeSet = function (e, t) {
                var n = this.supertypeMap.get(e);
                return !n && t && this.supertypeMap.set(e, (n = new Set())), n;
              }),
              (e.prototype.fragmentMatches = function (e, t, n, r) {
                var i = this;
                if (!e.typeCondition) return !0;
                if (!t) return !1;
                var o = e.typeCondition.name.value;
                if (t === o) return !0;
                if (this.usingPossibleTypes && this.supertypeMap.has(o))
                  for (
                    var s = this.getSupertypeSet(t, !0),
                      a = [s],
                      c = function (e) {
                        var t = i.getSupertypeSet(e, !1);
                        t && t.size && a.indexOf(t) < 0 && a.push(t);
                      },
                      u = !(!n || !this.fuzzySubtypes.size),
                      l = 0;
                    l < a.length;
                    ++l
                  ) {
                    var f = a[l];
                    if (f.has(o)) return s.has(o) || s.add(o), !0;
                    f.forEach(c),
                      u &&
                        l === a.length - 1 &&
                        Y(e.selectionSet, n, r) &&
                        ((u = !1),
                        !0,
                        this.fuzzySubtypes.forEach(function (e, n) {
                          var r = t.match(e);
                          r && r[0] === t && c(n);
                        }));
                  }
                return !1;
              }),
              (e.prototype.getStoreFieldName = function (e) {
                var t,
                  n = e.typename,
                  r = e.fieldName,
                  i = this.getFieldPolicy(n, r, !1),
                  o = i && i.keyFn;
                if (o && n)
                  for (
                    var s = {
                        typename: n,
                        fieldName: r,
                        field: e.field || null,
                        variables: e.variables,
                      },
                      a = he(e);
                    o;

                  ) {
                    var c = o(a, s);
                    if (!Array.isArray(c)) {
                      t = c || r;
                      break;
                    }
                    o = Ee(c);
                  }
                return (
                  void 0 === t &&
                    (t = e.field
                      ? (0, L.vf)(e.field, e.variables)
                      : (0, L.PT)(r, he(e))),
                  r === G(t) ? t : r + ":" + t
                );
              }),
              (e.prototype.readField = function (e, t) {
                var n = e.from;
                if (n && (e.field || e.fieldName)) {
                  if (void 0 === e.typename) {
                    var r = t.store.getFieldValue(n, "__typename");
                    r && (e.typename = r);
                  }
                  var i = this.getStoreFieldName(e),
                    o = G(i),
                    s = t.store.getFieldValue(n, i),
                    a = this.getFieldPolicy(e.typename, o, !1),
                    c = a && a.read;
                  if (c) {
                    var u = ke(
                      this,
                      n,
                      e,
                      t,
                      t.store.getStorage((0, L.hh)(n) ? n.__ref : n, i)
                    );
                    return ue.withValue(this.cache, c, [s, u]);
                  }
                  return s;
                }
              }),
              (e.prototype.hasMergeFunction = function (e, t) {
                var n = this.getFieldPolicy(e, t, !1);
                return !(!n || !n.merge);
              }),
              (e.prototype.applyMerges = function (e, t, n, r) {
                var i,
                  o = this;
                if ($(t)) {
                  var s = t.__field,
                    a = s.name.value;
                  t = (0, this.getFieldPolicy(t.__typename, a, !1).merge)(
                    e,
                    t.__value,
                    ke(
                      this,
                      void 0,
                      {
                        typename: t.__typename,
                        fieldName: a,
                        field: s,
                        variables: n.variables,
                      },
                      n,
                      r
                        ? (i = n.store).getStorage.apply(i, r)
                        : Object.create(null)
                    )
                  );
                }
                if (Array.isArray(t))
                  return t.map(function (e) {
                    return o.applyMerges(void 0, e, n);
                  });
                if (J(t)) {
                  var c,
                    u = e,
                    l = t,
                    f = (0, L.hh)(u) ? u.__ref : "object" == typeof u && u;
                  if (
                    (Object.keys(l).forEach(function (e) {
                      var t = l[e],
                        r = o.applyMerges(
                          n.store.getFieldValue(u, e),
                          t,
                          n,
                          f ? [f, e] : void 0
                        );
                      r !== t && ((c = c || Object.create(null))[e] = r);
                    }),
                    c)
                  )
                    return (0, K.pi)((0, K.pi)({}, l), c);
                }
                return t;
              }),
              e
            );
          })();
        function ke(e, t, n, r, i) {
          var o = e.getStoreFieldName(n),
            s = G(o),
            a = n.variables || r.variables,
            c = r.store,
            u = c.getFieldValue,
            l = c.toReference,
            f = c.canRead;
          return {
            args: he(n),
            field: n.field || null,
            fieldName: s,
            storeFieldName: o,
            variables: a,
            isReference: L.hh,
            toReference: l,
            storage: i,
            cache: e.cache,
            canRead: f,
            readField: function (n, i) {
              var o =
                "string" == typeof n
                  ? { fieldName: n, from: i }
                  : (0, K.pi)({}, n);
              return (
                void 0 === o.from && (o.from = t),
                void 0 === o.variables && (o.variables = a),
                e.readField(o, r)
              );
            },
            mergeObjects: function (t, n) {
              if (Array.isArray(t) || Array.isArray(n)) throw new V.ej(2);
              if (t && "object" == typeof t && n && "object" == typeof n) {
                var i = u(t, "__typename"),
                  o = u(n, "__typename"),
                  s = i && o && i !== o,
                  a = e.applyMerges(s ? void 0 : t, n, r);
                return !s && J(t) && J(a) ? (0, K.pi)((0, K.pi)({}, t), a) : a;
              }
              return n;
            },
          };
        }
        function Ee(e) {
          return function (t, n) {
            return t
              ? n.fieldName + ":" + JSON.stringify(we(t, e))
              : n.fieldName;
          };
        }
        function Te(e) {
          var t = new D(L.mr);
          return function (n, r) {
            var i;
            if (r.selectionSet && r.fragmentMap) {
              var o = t.lookupArray([r.selectionSet, r.fragmentMap]);
              i =
                o.aliasMap || (o.aliasMap = Se(r.selectionSet, r.fragmentMap));
            }
            var s = (r.keyObject = we(n, e, i));
            return r.typename + ":" + JSON.stringify(s);
          };
        }
        function Se(e, t) {
          var n = Object.create(null),
            r = new Set([e]);
          return (
            r.forEach(function (e) {
              e.selections.forEach(function (e) {
                if ((0, L.My)(e)) {
                  if (e.alias) {
                    var i = e.alias.value,
                      o = e.name.value;
                    if (o !== i)
                      (n.aliases || (n.aliases = Object.create(null)))[o] = i;
                  }
                  if (e.selectionSet)
                    (n.subsets || (n.subsets = Object.create(null)))[
                      e.name.value
                    ] = Se(e.selectionSet, t);
                } else {
                  var s = (0, L.hi)(e, t);
                  s && r.add(s.selectionSet);
                }
              });
            }),
            n
          );
        }
        function we(e, t, n) {
          var r,
            i = Object.create(null);
          return (
            t.forEach(function (t) {
              if (Array.isArray(t)) {
                if ("string" == typeof r) {
                  var o = n && n.subsets,
                    s = o && o[r];
                  i[r] = we(e[r], t, s);
                }
              } else {
                var a = n && n.aliases,
                  c = (a && a[t]) || t;
                (0, V.kG)(B.call(e, c), 3), (i[(r = t)] = e[c]);
              }
            }),
            i
          );
        }
        var Oe = {
            dataIdFromObject: de,
            addTypename: !0,
            resultCaching: !0,
            typePolicies: {},
          },
          _e = (function (e) {
            function t(t) {
              void 0 === t && (t = {});
              var n = e.call(this) || this;
              return (
                (n.watches = new Set()),
                (n.typenameDocumentCache = new Map()),
                (n.makeVar = fe),
                (n.txCount = 0),
                (n.maybeBroadcastWatch = P(
                  function (e, t) {
                    return n.broadcastWatch.call(n, e, !!t);
                  },
                  {
                    makeCacheKey: function (e) {
                      var t = e.optimistic ? n.optimisticData : n.data;
                      if (ie(t)) {
                        var r = e.optimistic,
                          i = e.rootId,
                          o = e.variables;
                        return t.makeCacheKey(
                          e.query,
                          e.callback,
                          JSON.stringify({
                            optimistic: r,
                            rootId: i,
                            variables: o,
                          })
                        );
                      }
                    },
                  }
                )),
                (n.watchDep = A()),
                (n.config = (0, K.pi)((0, K.pi)({}, Oe), t)),
                (n.addTypename = !!n.config.addTypename),
                (n.policies = new ge({
                  cache: n,
                  dataIdFromObject: n.config.dataIdFromObject,
                  possibleTypes: n.config.possibleTypes,
                  typePolicies: n.config.typePolicies,
                })),
                (n.data = new Z.Root({
                  policies: n.policies,
                  resultCaching: n.config.resultCaching,
                })),
                (n.optimisticData = n.data),
                (n.storeWriter = new ae(
                  n,
                  (n.storeReader = new se({
                    cache: n,
                    addTypename: n.addTypename,
                  }))
                )),
                n
              );
            }
            return (
              (0, K.ZT)(t, e),
              (t.prototype.restore = function (e) {
                return e && this.data.replace(e), this;
              }),
              (t.prototype.extract = function (e) {
                return (
                  void 0 === e && (e = !1),
                  (e ? this.optimisticData : this.data).toObject()
                );
              }),
              (t.prototype.read = function (e) {
                var t = e.optimistic ? this.optimisticData : this.data;
                return (
                  (("string" != typeof e.rootId || t.has(e.rootId)) &&
                    this.storeReader.diffQueryAgainstStore({
                      store: t,
                      query: e.query,
                      variables: e.variables,
                      rootId: e.rootId,
                      config: this.config,
                      returnPartialData: !1,
                    }).result) ||
                  null
                );
              }),
              (t.prototype.write = function (e) {
                try {
                  return (
                    ++this.txCount,
                    this.storeWriter.writeToStore({
                      store: this.data,
                      query: e.query,
                      result: e.result,
                      dataId: e.dataId,
                      variables: e.variables,
                    })
                  );
                } finally {
                  --this.txCount ||
                    !1 === e.broadcast ||
                    this.broadcastWatches();
                }
              }),
              (t.prototype.modify = function (e) {
                if (B.call(e, "id") && !e.id) return !1;
                var t = e.optimistic ? this.optimisticData : this.data;
                try {
                  return (
                    ++this.txCount, t.modify(e.id || "ROOT_QUERY", e.fields)
                  );
                } finally {
                  --this.txCount ||
                    !1 === e.broadcast ||
                    this.broadcastWatches();
                }
              }),
              (t.prototype.diff = function (e) {
                return this.storeReader.diffQueryAgainstStore({
                  store: e.optimistic ? this.optimisticData : this.data,
                  rootId: e.id || "ROOT_QUERY",
                  query: e.query,
                  variables: e.variables,
                  returnPartialData: e.returnPartialData,
                  config: this.config,
                });
              }),
              (t.prototype.watch = function (e) {
                var t = this;
                return (
                  this.watches.add(e),
                  e.immediate && this.maybeBroadcastWatch(e),
                  function () {
                    t.watches.delete(e),
                      t.watchDep.dirty(e),
                      t.maybeBroadcastWatch.forget(e);
                  }
                );
              }),
              (t.prototype.gc = function () {
                return this.optimisticData.gc();
              }),
              (t.prototype.retain = function (e, t) {
                return (t ? this.optimisticData : this.data).retain(e);
              }),
              (t.prototype.release = function (e, t) {
                return (t ? this.optimisticData : this.data).release(e);
              }),
              (t.prototype.identify = function (e) {
                return (0, L.hh)(e) ? e.__ref : this.policies.identify(e)[0];
              }),
              (t.prototype.evict = function (e) {
                if (!e.id) {
                  if (B.call(e, "id")) return !1;
                  e = (0, K.pi)((0, K.pi)({}, e), { id: "ROOT_QUERY" });
                }
                try {
                  return ++this.txCount, this.optimisticData.evict(e);
                } finally {
                  --this.txCount ||
                    !1 === e.broadcast ||
                    this.broadcastWatches();
                }
              }),
              (t.prototype.reset = function () {
                return (
                  this.data.clear(),
                  (this.optimisticData = this.data),
                  this.broadcastWatches(),
                  Promise.resolve()
                );
              }),
              (t.prototype.removeOptimistic = function (e) {
                var t = this.optimisticData.removeLayer(e);
                t !== this.optimisticData &&
                  ((this.optimisticData = t), this.broadcastWatches());
              }),
              (t.prototype.performTransaction = function (e, t) {
                var n = this,
                  r = function (t) {
                    var r = n,
                      i = r.data,
                      o = r.optimisticData;
                    ++n.txCount, t && (n.data = n.optimisticData = t);
                    try {
                      e(n);
                    } finally {
                      --n.txCount, (n.data = i), (n.optimisticData = o);
                    }
                  },
                  i = !1;
                "string" == typeof t
                  ? ((this.optimisticData = this.optimisticData.addLayer(t, r)),
                    (i = !0))
                  : null === t
                  ? r(this.data)
                  : r(),
                  this.broadcastWatches(i);
              }),
              (t.prototype.transformDocument = function (e) {
                if (this.addTypename) {
                  var t = this.typenameDocumentCache.get(e);
                  return (
                    t ||
                      ((t = (0, L.Gw)(e)),
                      this.typenameDocumentCache.set(e, t),
                      this.typenameDocumentCache.set(t, t)),
                    t
                  );
                }
                return e;
              }),
              (t.prototype.broadcastWatches = function (e) {
                var t = this;
                this.txCount ||
                  this.watches.forEach(function (n) {
                    return t.maybeBroadcastWatch(n, e);
                  });
              }),
              (t.prototype.broadcastWatch = function (e, t) {
                this.watchDep.dirty(e), this.watchDep(e);
                var n = this.diff({
                  query: e.query,
                  variables: e.variables,
                  optimistic: e.optimistic,
                });
                e.optimistic && t && (n.fromOptimisticTransaction = !0),
                  e.callback(n);
              }),
              t
            );
          })(j);
      },
      5367: () => {},
      7945: (e, t, n) => {
        "use strict";
        n.d(t, { f: () => S });
        var r = n(655),
          i = n(7591),
          o = n(1707),
          s = n(9188),
          a = n(3729),
          c = n(2152),
          u = n(1498),
          l = (function () {
            function e() {
              this.store = {};
            }
            return (
              (e.prototype.getStore = function () {
                return this.store;
              }),
              (e.prototype.get = function (e) {
                return this.store[e];
              }),
              (e.prototype.initMutation = function (e, t, n) {
                this.store[e] = {
                  mutation: t,
                  variables: n || {},
                  loading: !0,
                  error: null,
                };
              }),
              (e.prototype.markMutationError = function (e, t) {
                var n = this.store[e];
                n && ((n.loading = !1), (n.error = t));
              }),
              (e.prototype.markMutationResult = function (e) {
                var t = this.store[e];
                t && ((t.loading = !1), (t.error = null));
              }),
              (e.prototype.reset = function () {
                this.store = {};
              }),
              e
            );
          })(),
          f = n(6282),
          p = n(5942),
          h = n(4079),
          d = n(4259),
          v = (function () {
            function e(e) {
              var t = e.cache,
                n = e.client,
                r = e.resolvers,
                i = e.fragmentMatcher;
              (this.cache = t),
                n && (this.client = n),
                r && this.addResolvers(r),
                i && this.setFragmentMatcher(i);
            }
            return (
              (e.prototype.addResolvers = function (e) {
                var t = this;
                (this.resolvers = this.resolvers || {}),
                  Array.isArray(e)
                    ? e.forEach(function (e) {
                        t.resolvers = (0, s.Ee)(t.resolvers, e);
                      })
                    : (this.resolvers = (0, s.Ee)(this.resolvers, e));
              }),
              (e.prototype.setResolvers = function (e) {
                (this.resolvers = {}), this.addResolvers(e);
              }),
              (e.prototype.getResolvers = function () {
                return this.resolvers || {};
              }),
              (e.prototype.runResolvers = function (e) {
                var t = e.document,
                  n = e.remoteResult,
                  i = e.context,
                  o = e.variables,
                  s = e.onlyRunForcedResolvers,
                  a = void 0 !== s && s;
                return (0, r.mG)(this, void 0, void 0, function () {
                  return (0, r.Jh)(this, function (e) {
                    return t
                      ? [
                          2,
                          this.resolveDocument(
                            t,
                            n.data,
                            i,
                            o,
                            this.fragmentMatcher,
                            a
                          ).then(function (e) {
                            return (0,
                            r.pi)((0, r.pi)({}, n), { data: e.result });
                          }),
                        ]
                      : [2, n];
                  });
                });
              }),
              (e.prototype.setFragmentMatcher = function (e) {
                this.fragmentMatcher = e;
              }),
              (e.prototype.getFragmentMatcher = function () {
                return this.fragmentMatcher;
              }),
              (e.prototype.clientQuery = function (e) {
                return (0, s.FS)(["client"], e) && this.resolvers ? e : null;
              }),
              (e.prototype.serverQuery = function (e) {
                return (0, s.ob)(e);
              }),
              (e.prototype.prepareContext = function (e) {
                var t = this.cache;
                return (0, r.pi)((0, r.pi)({}, e), {
                  cache: t,
                  getCacheKey: function (e) {
                    return t.identify(e);
                  },
                });
              }),
              (e.prototype.addExportedVariables = function (e, t, n) {
                return (
                  void 0 === t && (t = {}),
                  void 0 === n && (n = {}),
                  (0, r.mG)(this, void 0, void 0, function () {
                    return (0, r.Jh)(this, function (i) {
                      return e
                        ? [
                            2,
                            this.resolveDocument(
                              e,
                              this.buildRootValueFromCache(e, t) || {},
                              this.prepareContext(n),
                              t
                            ).then(function (e) {
                              return (0,
                              r.pi)((0, r.pi)({}, t), e.exportedVariables);
                            }),
                          ]
                        : [2, (0, r.pi)({}, t)];
                    });
                  })
                );
              }),
              (e.prototype.shouldForceResolvers = function (e) {
                var t = !1;
                return (
                  (0, h.Vn)(e, {
                    Directive: {
                      enter: function (e) {
                        if (
                          "client" === e.name.value &&
                          e.arguments &&
                          (t = e.arguments.some(function (e) {
                            return (
                              "always" === e.name.value &&
                              "BooleanValue" === e.value.kind &&
                              !0 === e.value.value
                            );
                          }))
                        )
                          return h.$_;
                      },
                    },
                  }),
                  t
                );
              }),
              (e.prototype.buildRootValueFromCache = function (e, t) {
                return this.cache.diff({
                  query: (0, s.aL)(e),
                  variables: t,
                  returnPartialData: !0,
                  optimistic: !1,
                }).result;
              }),
              (e.prototype.resolveDocument = function (e, t, n, i, o, a) {
                return (
                  void 0 === n && (n = {}),
                  void 0 === i && (i = {}),
                  void 0 === o &&
                    (o = function () {
                      return !0;
                    }),
                  void 0 === a && (a = !1),
                  (0, r.mG)(this, void 0, void 0, function () {
                    var c, u, l, f, p, h, d, v, y;
                    return (0, r.Jh)(this, function (m) {
                      return (
                        (c = (0, s.p$)(e)),
                        (u = (0, s.kU)(e)),
                        (l = (0, s.F)(u)),
                        (f = c.operation),
                        (p = f
                          ? f.charAt(0).toUpperCase() + f.slice(1)
                          : "Query"),
                        (d = (h = this).cache),
                        (v = h.client),
                        (y = {
                          fragmentMap: l,
                          context: (0, r.pi)((0, r.pi)({}, n), {
                            cache: d,
                            client: v,
                          }),
                          variables: i,
                          fragmentMatcher: o,
                          defaultOperationType: p,
                          exportedVariables: {},
                          onlyRunForcedResolvers: a,
                        }),
                        [
                          2,
                          this.resolveSelectionSet(c.selectionSet, t, y).then(
                            function (e) {
                              return {
                                result: e,
                                exportedVariables: y.exportedVariables,
                              };
                            }
                          ),
                        ]
                      );
                    });
                  })
                );
              }),
              (e.prototype.resolveSelectionSet = function (e, t, n) {
                return (0, r.mG)(this, void 0, void 0, function () {
                  var o,
                    a,
                    c,
                    u,
                    l,
                    f = this;
                  return (0, r.Jh)(this, function (p) {
                    return (
                      (o = n.fragmentMap),
                      (a = n.context),
                      (c = n.variables),
                      (u = [t]),
                      (l = function (e) {
                        return (0, r.mG)(f, void 0, void 0, function () {
                          var l, f;
                          return (0, r.Jh)(this, function (r) {
                            return (0, s.LZ)(e, c)
                              ? (0, s.My)(e)
                                ? [
                                    2,
                                    this.resolveField(e, t, n).then(function (
                                      t
                                    ) {
                                      var n;
                                      void 0 !== t &&
                                        u.push(
                                          (((n = {})[(0, s.u2)(e)] = t), n)
                                        );
                                    }),
                                  ]
                                : ((0, s.Ao)(e)
                                    ? (l = e)
                                    : ((l = o[e.name.value]), (0, i.kG)(l, 11)),
                                  l &&
                                  l.typeCondition &&
                                  ((f = l.typeCondition.name.value),
                                  n.fragmentMatcher(t, f, a))
                                    ? [
                                        2,
                                        this.resolveSelectionSet(
                                          l.selectionSet,
                                          t,
                                          n
                                        ).then(function (e) {
                                          u.push(e);
                                        }),
                                      ]
                                    : [2])
                              : [2];
                          });
                        });
                      }),
                      [
                        2,
                        Promise.all(e.selections.map(l)).then(function () {
                          return (0, s.bw)(u);
                        }),
                      ]
                    );
                  });
                });
              }),
              (e.prototype.resolveField = function (e, t, n) {
                return (0, r.mG)(this, void 0, void 0, function () {
                  var i,
                    o,
                    a,
                    c,
                    u,
                    l,
                    f,
                    p,
                    h,
                    v = this;
                  return (0, r.Jh)(this, function (r) {
                    return (
                      (i = n.variables),
                      (o = e.name.value),
                      (a = (0, s.u2)(e)),
                      (c = o !== a),
                      (u = t[a] || t[o]),
                      (l = Promise.resolve(u)),
                      (n.onlyRunForcedResolvers &&
                        !this.shouldForceResolvers(e)) ||
                        ((f = t.__typename || n.defaultOperationType),
                        (p = this.resolvers && this.resolvers[f]) &&
                          (h = p[c ? o : a]) &&
                          (l = Promise.resolve(
                            d.ab.withValue(this.cache, h, [
                              t,
                              (0, s.NC)(e, i),
                              n.context,
                              { field: e, fragmentMap: n.fragmentMap },
                            ])
                          ))),
                      [
                        2,
                        l.then(function (t) {
                          return (
                            void 0 === t && (t = u),
                            e.directives &&
                              e.directives.forEach(function (e) {
                                "export" === e.name.value &&
                                  e.arguments &&
                                  e.arguments.forEach(function (e) {
                                    "as" === e.name.value &&
                                      "StringValue" === e.value.kind &&
                                      (n.exportedVariables[e.value.value] = t);
                                  });
                              }),
                            e.selectionSet
                              ? null == t
                                ? t
                                : Array.isArray(t)
                                ? v.resolveSubSelectedArray(e, t, n)
                                : e.selectionSet
                                ? v.resolveSelectionSet(e.selectionSet, t, n)
                                : void 0
                              : t
                          );
                        }),
                      ]
                    );
                  });
                });
              }),
              (e.prototype.resolveSubSelectedArray = function (e, t, n) {
                var r = this;
                return Promise.all(
                  t.map(function (t) {
                    return null === t
                      ? null
                      : Array.isArray(t)
                      ? r.resolveSubSelectedArray(e, t, n)
                      : e.selectionSet
                      ? r.resolveSelectionSet(e.selectionSet, t, n)
                      : void 0;
                  })
                );
              }),
              e
            );
          })(),
          y = new (s.mr ? WeakMap : Map)();
        function m(e, t) {
          var n = e[t];
          "function" == typeof n &&
            (e[t] = function () {
              return y.set(e, (y.get(e) + 1) % 1e15), n.apply(this, arguments);
            });
        }
        var b = (function () {
          function e(e) {
            (this.cache = e),
              (this.listeners = new Set()),
              (this.document = null),
              (this.lastRequestId = 1),
              (this.subscriptions = new Set()),
              (this.dirty = !1),
              (this.diff = null),
              (this.observableQuery = null),
              y.has(e) ||
                (y.set(e, 0), m(e, "evict"), m(e, "modify"), m(e, "reset"));
          }
          return (
            (e.prototype.init = function (e) {
              var t = e.networkStatus || p.I.loading;
              return (
                this.variables &&
                  this.networkStatus !== p.I.loading &&
                  !(0, c.D)(this.variables, e.variables) &&
                  (t = p.I.setVariables),
                (0, c.D)(e.variables, this.variables) || (this.diff = null),
                Object.assign(this, {
                  document: e.document,
                  variables: e.variables,
                  networkError: null,
                  graphQLErrors: this.graphQLErrors || [],
                  networkStatus: t,
                }),
                e.observableQuery && this.setObservableQuery(e.observableQuery),
                e.lastRequestId && (this.lastRequestId = e.lastRequestId),
                this
              );
            }),
            (e.prototype.getDiff = function (e) {
              return (
                void 0 === e && (e = this.variables),
                this.diff && (0, c.D)(e, this.variables)
                  ? this.diff
                  : (this.updateWatch((this.variables = e)),
                    (this.diff = this.cache.diff({
                      query: this.document,
                      variables: e,
                      returnPartialData: !0,
                      optimistic: !0,
                    })))
              );
            }),
            (e.prototype.setDiff = function (e) {
              var t = this,
                n = this.diff;
              (this.diff = e),
                this.dirty ||
                  (e && e.result) === (n && n.result) ||
                  ((this.dirty = !0),
                  this.notifyTimeout ||
                    (this.notifyTimeout = setTimeout(function () {
                      return t.notify();
                    }, 0)));
            }),
            (e.prototype.setObservableQuery = function (e) {
              var t = this;
              e !== this.observableQuery &&
                (this.oqListener && this.listeners.delete(this.oqListener),
                (this.observableQuery = e),
                e
                  ? ((e.queryInfo = this),
                    this.listeners.add(
                      (this.oqListener = function () {
                        t.getDiff().fromOptimisticTransaction
                          ? e.observe()
                          : e.reobserve();
                      })
                    ))
                  : delete this.oqListener);
            }),
            (e.prototype.notify = function () {
              var e = this;
              this.notifyTimeout &&
                (clearTimeout(this.notifyTimeout),
                (this.notifyTimeout = void 0)),
                this.shouldNotify() &&
                  this.listeners.forEach(function (t) {
                    return t(e);
                  }),
                (this.dirty = !1);
            }),
            (e.prototype.shouldNotify = function () {
              if (!this.dirty || !this.listeners.size) return !1;
              if ((0, p.O)(this.networkStatus) && this.observableQuery) {
                var e = this.observableQuery.options.fetchPolicy;
                if ("cache-only" !== e && "cache-and-network" !== e) return !1;
              }
              return !0;
            }),
            (e.prototype.stop = function () {
              this.cancel(), delete this.cancel;
              var e = this.observableQuery;
              e && e.stopPolling();
            }),
            (e.prototype.cancel = function () {}),
            (e.prototype.updateWatch = function (e) {
              var t = this;
              void 0 === e && (e = this.variables);
              var n = this.observableQuery;
              (n && "no-cache" === n.options.fetchPolicy) ||
                (this.lastWatch &&
                  this.lastWatch.query === this.document &&
                  (0, c.D)(e, this.lastWatch.variables)) ||
                (this.cancel(),
                (this.cancel = this.cache.watch(
                  (this.lastWatch = {
                    query: this.document,
                    variables: e,
                    optimistic: !0,
                    callback: function (e) {
                      return t.setDiff(e);
                    },
                  })
                )));
            }),
            (e.prototype.shouldWrite = function (e, t) {
              var n = this.lastWrite;
              return !(
                n &&
                n.dmCount === y.get(this.cache) &&
                (0, c.D)(t, n.variables) &&
                (0, c.D)(e.data, n.result.data)
              );
            }),
            (e.prototype.markResult = function (e, t, n) {
              var r = this;
              (this.graphQLErrors = (0, s.Of)(e.errors) ? e.errors : []),
                "no-cache" === t.fetchPolicy
                  ? (this.diff = { result: e.data, complete: !0 })
                  : n &&
                    (g(e, t.errorPolicy)
                      ? this.cache.performTransaction(function (n) {
                          if (r.shouldWrite(e, t.variables))
                            n.writeQuery({
                              query: r.document,
                              data: e.data,
                              variables: t.variables,
                            }),
                              (r.lastWrite = {
                                result: e,
                                variables: t.variables,
                                dmCount: y.get(r.cache),
                              });
                          else if (r.diff && r.diff.complete)
                            return void (e.data = r.diff.result);
                          var i = n.diff({
                            query: r.document,
                            variables: t.variables,
                            returnPartialData: !0,
                            optimistic: !0,
                          });
                          r.updateWatch(t.variables),
                            (r.diff = i),
                            i.complete && (e.data = i.result);
                        })
                      : (this.lastWrite = void 0));
            }),
            (e.prototype.markReady = function () {
              return (
                (this.networkError = null), (this.networkStatus = p.I.ready)
              );
            }),
            (e.prototype.markError = function (e) {
              return (
                (this.networkStatus = p.I.error),
                (this.lastWrite = void 0),
                e.graphQLErrors && (this.graphQLErrors = e.graphQLErrors),
                e.networkError && (this.networkError = e.networkError),
                e
              );
            }),
            e
          );
        })();
        function g(e, t) {
          void 0 === t && (t = "none");
          var n = "ignore" === t || "all" === t,
            r = !(0, s.d2)(e);
          return !r && n && e.data && (r = !0), r;
        }
        var k = Object.prototype.hasOwnProperty,
          E = (function () {
            function e(e) {
              var t = e.cache,
                n = e.link,
                r = e.queryDeduplication,
                i = void 0 !== r && r,
                o = e.onBroadcast,
                a = void 0 === o ? function () {} : o,
                c = e.ssrMode,
                u = void 0 !== c && c,
                f = e.clientAwareness,
                p = void 0 === f ? {} : f,
                h = e.localState,
                d = e.assumeImmutableResults;
              (this.mutationStore = new l()),
                (this.clientAwareness = {}),
                (this.queries = new Map()),
                (this.fetchCancelFns = new Map()),
                (this.transformCache = new (s.mr ? WeakMap : Map)()),
                (this.queryIdCounter = 1),
                (this.requestIdCounter = 1),
                (this.mutationIdCounter = 1),
                (this.inFlightLinkObservables = new Map()),
                (this.cache = t),
                (this.link = n),
                (this.queryDeduplication = i),
                (this.onBroadcast = a),
                (this.clientAwareness = p),
                (this.localState = h || new v({ cache: t })),
                (this.ssrMode = u),
                (this.assumeImmutableResults = !!d);
            }
            return (
              (e.prototype.stop = function () {
                var e = this;
                this.queries.forEach(function (t, n) {
                  e.stopQueryNoBroadcast(n);
                }),
                  this.cancelPendingFetches(new i.ej(12));
              }),
              (e.prototype.cancelPendingFetches = function (e) {
                this.fetchCancelFns.forEach(function (t) {
                  return t(e);
                }),
                  this.fetchCancelFns.clear();
              }),
              (e.prototype.mutate = function (e) {
                var t = e.mutation,
                  n = e.variables,
                  o = e.optimisticResponse,
                  a = e.updateQueries,
                  c = e.refetchQueries,
                  l = void 0 === c ? [] : c,
                  f = e.awaitRefetchQueries,
                  p = void 0 !== f && f,
                  h = e.update,
                  d = e.errorPolicy,
                  v = void 0 === d ? "none" : d,
                  y = e.fetchPolicy,
                  m = e.context,
                  b = void 0 === m ? {} : m;
                return (0, r.mG)(this, void 0, void 0, function () {
                  var e,
                    c,
                    f,
                    d,
                    m = this;
                  return (0, r.Jh)(this, function (g) {
                    switch (g.label) {
                      case 0:
                        return (
                          (0, i.kG)(t, 13),
                          (0, i.kG)(!y || "no-cache" === y, 14),
                          (e = this.generateMutationId()),
                          (t = this.transform(t).document),
                          (n = this.getVariables(t, n)),
                          this.transform(t).hasClientExports
                            ? [4, this.localState.addExportedVariables(t, n, b)]
                            : [3, 2]
                        );
                      case 1:
                        (n = g.sent()), (g.label = 2);
                      case 2:
                        return (
                          (c = function () {
                            var e = {};
                            return (
                              a &&
                                m.queries.forEach(function (t, n) {
                                  var r = t.observableQuery;
                                  if (r) {
                                    var i = r.queryName;
                                    i &&
                                      k.call(a, i) &&
                                      (e[n] = {
                                        updater: a[i],
                                        queryInfo: m.queries.get(n),
                                      });
                                  }
                                }),
                              e
                            );
                          }),
                          this.mutationStore.initMutation(e, t, n),
                          o &&
                            ((f = "function" == typeof o ? o(n) : o),
                            this.cache.recordOptimisticTransaction(function (
                              r
                            ) {
                              try {
                                T(
                                  {
                                    mutationId: e,
                                    result: { data: f },
                                    document: t,
                                    variables: n,
                                    errorPolicy: v,
                                    queryUpdatersById: c(),
                                    update: h,
                                  },
                                  r
                                );
                              } catch (e) {}
                            },
                            e)),
                          this.broadcastQueries(),
                          (d = this),
                          [
                            2,
                            new Promise(function (i, a) {
                              var f, m;
                              d.getObservableFromLink(
                                t,
                                (0, r.pi)((0, r.pi)({}, b), {
                                  optimisticResponse: o,
                                }),
                                n,
                                !1
                              ).subscribe({
                                next: function (r) {
                                  if ((0, s.d2)(r) && "none" === v)
                                    m = new u.c({ graphQLErrors: r.errors });
                                  else {
                                    if (
                                      (d.mutationStore.markMutationResult(e),
                                      "no-cache" !== y)
                                    )
                                      try {
                                        T(
                                          {
                                            mutationId: e,
                                            result: r,
                                            document: t,
                                            variables: n,
                                            errorPolicy: v,
                                            queryUpdatersById: c(),
                                            update: h,
                                          },
                                          d.cache
                                        );
                                      } catch (e) {
                                        return void (m = new u.c({
                                          networkError: e,
                                        }));
                                      }
                                    f = r;
                                  }
                                },
                                error: function (t) {
                                  d.mutationStore.markMutationError(e, t),
                                    o && d.cache.removeOptimistic(e),
                                    d.broadcastQueries(),
                                    a(new u.c({ networkError: t }));
                                },
                                complete: function () {
                                  if (
                                    (m &&
                                      d.mutationStore.markMutationError(e, m),
                                    o && d.cache.removeOptimistic(e),
                                    d.broadcastQueries(),
                                    m)
                                  )
                                    a(m);
                                  else {
                                    "function" == typeof l && (l = l(f));
                                    var t = [];
                                    (0, s.Of)(l) &&
                                      l.forEach(function (e) {
                                        if ("string" == typeof e)
                                          d.queries.forEach(function (n) {
                                            var r = n.observableQuery;
                                            r &&
                                              r.queryName === e &&
                                              t.push(r.refetch());
                                          });
                                        else {
                                          var n = {
                                            query: e.query,
                                            variables: e.variables,
                                            fetchPolicy: "network-only",
                                          };
                                          e.context && (n.context = e.context),
                                            t.push(d.query(n));
                                        }
                                      }),
                                      Promise.all(p ? t : []).then(function () {
                                        "ignore" === v &&
                                          f &&
                                          (0, s.d2)(f) &&
                                          delete f.errors,
                                          i(f);
                                      }, a);
                                  }
                                },
                              });
                            }),
                          ]
                        );
                    }
                  });
                });
              }),
              (e.prototype.fetchQuery = function (e, t, n) {
                return this.fetchQueryObservable(e, t, n).promise;
              }),
              (e.prototype.getQueryStore = function () {
                var e = Object.create(null);
                return (
                  this.queries.forEach(function (t, n) {
                    e[n] = {
                      variables: t.variables,
                      networkStatus: t.networkStatus,
                      networkError: t.networkError,
                      graphQLErrors: t.graphQLErrors,
                    };
                  }),
                  e
                );
              }),
              (e.prototype.resetErrors = function (e) {
                var t = this.queries.get(e);
                t && ((t.networkError = void 0), (t.graphQLErrors = []));
              }),
              (e.prototype.transform = function (e) {
                var t = this.transformCache;
                if (!t.has(e)) {
                  var n = this.cache.transformDocument(e),
                    r = (0, s.Fo)(this.cache.transformForLink(n)),
                    i = this.localState.clientQuery(n),
                    o = r && this.localState.serverQuery(r),
                    a = {
                      document: n,
                      hasClientExports: (0, s.mj)(n),
                      hasForcedResolvers: this.localState.shouldForceResolvers(
                        n
                      ),
                      clientQuery: i,
                      serverQuery: o,
                      defaultVars: (0, s.O4)((0, s.$H)(n)),
                    },
                    c = function (e) {
                      e && !t.has(e) && t.set(e, a);
                    };
                  c(e), c(n), c(i), c(o);
                }
                return t.get(e);
              }),
              (e.prototype.getVariables = function (e, t) {
                return (0, r.pi)(
                  (0, r.pi)({}, this.transform(e).defaultVars),
                  t
                );
              }),
              (e.prototype.watchQuery = function (e) {
                void 0 ===
                  (e = (0, r.pi)((0, r.pi)({}, e), {
                    variables: this.getVariables(e.query, e.variables),
                  })).notifyOnNetworkStatusChange &&
                  (e.notifyOnNetworkStatusChange = !1);
                var t = new b(this.cache),
                  n = new f.u({ queryManager: this, queryInfo: t, options: e });
                return (
                  this.queries.set(n.queryId, t),
                  t.init({
                    document: e.query,
                    observableQuery: n,
                    variables: e.variables,
                  }),
                  n
                );
              }),
              (e.prototype.query = function (e) {
                var t = this;
                (0, i.kG)(e.query, 15),
                  (0, i.kG)("Document" === e.query.kind, 16),
                  (0, i.kG)(!e.returnPartialData, 17),
                  (0, i.kG)(!e.pollInterval, 18);
                var n = this.generateQueryId();
                return this.fetchQuery(n, e).finally(function () {
                  return t.stopQuery(n);
                });
              }),
              (e.prototype.generateQueryId = function () {
                return String(this.queryIdCounter++);
              }),
              (e.prototype.generateRequestId = function () {
                return this.requestIdCounter++;
              }),
              (e.prototype.generateMutationId = function () {
                return String(this.mutationIdCounter++);
              }),
              (e.prototype.stopQueryInStore = function (e) {
                this.stopQueryInStoreNoBroadcast(e), this.broadcastQueries();
              }),
              (e.prototype.stopQueryInStoreNoBroadcast = function (e) {
                var t = this.queries.get(e);
                t && t.stop();
              }),
              (e.prototype.clearStore = function () {
                return (
                  this.cancelPendingFetches(new i.ej(19)),
                  this.queries.forEach(function (e) {
                    e.observableQuery
                      ? (e.networkStatus = p.I.loading)
                      : e.stop();
                  }),
                  this.mutationStore.reset(),
                  this.cache.reset()
                );
              }),
              (e.prototype.resetStore = function () {
                var e = this;
                return this.clearStore().then(function () {
                  return e.reFetchObservableQueries();
                });
              }),
              (e.prototype.reFetchObservableQueries = function (e) {
                var t = this;
                void 0 === e && (e = !1);
                var n = [];
                return (
                  this.queries.forEach(function (r, i) {
                    var o = r.observableQuery;
                    if (o && o.hasObservers()) {
                      var s = o.options.fetchPolicy;
                      o.resetLastResults(),
                        "cache-only" === s ||
                          (!e && "standby" === s) ||
                          n.push(o.refetch()),
                        t.getQuery(i).setDiff(null);
                    }
                  }),
                  this.broadcastQueries(),
                  Promise.all(n)
                );
              }),
              (e.prototype.setObservableQuery = function (e) {
                this.getQuery(e.queryId).setObservableQuery(e);
              }),
              (e.prototype.startGraphQLSubscription = function (e) {
                var t = this,
                  n = e.query,
                  r = e.fetchPolicy,
                  i = e.errorPolicy,
                  o = e.variables,
                  a = e.context,
                  c = void 0 === a ? {} : a;
                (n = this.transform(n).document), (o = this.getVariables(n, o));
                var l = function (e) {
                  return t.getObservableFromLink(n, c, e, !1).map(function (o) {
                    if (
                      ("no-cache" !== r &&
                        (g(o, i) &&
                          t.cache.write({
                            query: n,
                            result: o.data,
                            dataId: "ROOT_SUBSCRIPTION",
                            variables: e,
                          }),
                        t.broadcastQueries()),
                      (0, s.d2)(o))
                    )
                      throw new u.c({ graphQLErrors: o.errors });
                    return o;
                  });
                };
                if (this.transform(n).hasClientExports) {
                  var f = this.localState.addExportedVariables(n, o, c).then(l);
                  return new s.y$(function (e) {
                    var t = null;
                    return (
                      f.then(function (n) {
                        return (t = n.subscribe(e));
                      }, e.error),
                      function () {
                        return t && t.unsubscribe();
                      }
                    );
                  });
                }
                return l(o);
              }),
              (e.prototype.stopQuery = function (e) {
                this.stopQueryNoBroadcast(e), this.broadcastQueries();
              }),
              (e.prototype.stopQueryNoBroadcast = function (e) {
                this.stopQueryInStoreNoBroadcast(e), this.removeQuery(e);
              }),
              (e.prototype.removeQuery = function (e) {
                this.fetchCancelFns.delete(e),
                  this.getQuery(e).subscriptions.forEach(function (e) {
                    return e.unsubscribe();
                  }),
                  this.queries.delete(e);
              }),
              (e.prototype.broadcastQueries = function () {
                this.onBroadcast(),
                  this.queries.forEach(function (e) {
                    return e.notify();
                  });
              }),
              (e.prototype.getLocalState = function () {
                return this.localState;
              }),
              (e.prototype.getObservableFromLink = function (e, t, n, i) {
                var a,
                  c,
                  u = this;
                void 0 === i &&
                  (i =
                    null !== (a = null == t ? void 0 : t.queryDeduplication) &&
                    void 0 !== a
                      ? a
                      : this.queryDeduplication);
                var l = this.transform(e).serverQuery;
                if (l) {
                  var f = this.inFlightLinkObservables,
                    p = this.link,
                    h = {
                      query: l,
                      variables: n,
                      operationName: (0, s.rY)(l) || void 0,
                      context: this.prepareContext(
                        (0, r.pi)((0, r.pi)({}, t), { forceFetch: !i })
                      ),
                    };
                  if (((t = h.context), i)) {
                    var d = f.get(l) || new Map();
                    f.set(l, d);
                    var v = JSON.stringify(n);
                    if (!(c = d.get(v))) {
                      var y = new s.X_([(0, o.ht)(p, h)]);
                      d.set(v, (c = y)),
                        y.cleanup(function () {
                          d.delete(v) && d.size < 1 && f.delete(l);
                        });
                    }
                  } else c = new s.X_([(0, o.ht)(p, h)]);
                } else
                  (c = new s.X_([s.y$.of({ data: {} })])),
                    (t = this.prepareContext(t));
                var m = this.transform(e).clientQuery;
                return (
                  m &&
                    (c = (0, s.sz)(c, function (e) {
                      return u.localState.runResolvers({
                        document: m,
                        remoteResult: e,
                        context: t,
                        variables: n,
                      });
                    })),
                  c
                );
              }),
              (e.prototype.getResultsFromLink = function (e, t, n) {
                var r = e.lastRequestId;
                return (0, s.sz)(
                  this.getObservableFromLink(
                    e.document,
                    n.context,
                    n.variables
                  ),
                  function (i) {
                    var o = (0, s.Of)(i.errors);
                    if (r >= e.lastRequestId) {
                      if (o && "none" === n.errorPolicy)
                        throw e.markError(new u.c({ graphQLErrors: i.errors }));
                      e.markResult(i, n, t), e.markReady();
                    }
                    var a = {
                      data: i.data,
                      loading: !1,
                      networkStatus: e.networkStatus || p.I.ready,
                    };
                    return (
                      o && "ignore" !== n.errorPolicy && (a.errors = i.errors),
                      a
                    );
                  },
                  function (t) {
                    var n = (0, u.M)(t) ? t : new u.c({ networkError: t });
                    throw (r >= e.lastRequestId && e.markError(n), n);
                  }
                );
              }),
              (e.prototype.fetchQueryObservable = function (e, t, n) {
                var r = this;
                void 0 === n && (n = p.I.loading);
                var i = this.transform(t.query).document,
                  o = this.getVariables(i, t.variables),
                  a = this.getQuery(e),
                  c = a.networkStatus,
                  u = t.fetchPolicy,
                  l = void 0 === u ? "cache-first" : u,
                  f = t.errorPolicy,
                  h = void 0 === f ? "none" : f,
                  d = t.returnPartialData,
                  v = void 0 !== d && d,
                  y = t.notifyOnNetworkStatusChange,
                  m = void 0 !== y && y,
                  b = t.context,
                  g = void 0 === b ? {} : b;
                ("cache-first" === l ||
                  "cache-and-network" === l ||
                  "network-only" === l ||
                  "no-cache" === l) &&
                  m &&
                  "number" == typeof c &&
                  c !== n &&
                  (0, p.O)(n) &&
                  ("cache-first" !== l && (l = "cache-and-network"), (v = !0));
                var k = Object.assign({}, t, {
                    query: i,
                    variables: o,
                    fetchPolicy: l,
                    errorPolicy: h,
                    returnPartialData: v,
                    notifyOnNetworkStatusChange: m,
                    context: g,
                  }),
                  E = function (e) {
                    return (k.variables = e), r.fetchQueryByPolicy(a, k, n);
                  };
                this.fetchCancelFns.set(e, function (e) {
                  Promise.resolve().then(function () {
                    return T.cancel(e);
                  });
                });
                var T = new s.X_(
                  this.transform(k.query).hasClientExports
                    ? this.localState
                        .addExportedVariables(k.query, k.variables, k.context)
                        .then(E)
                    : E(k.variables)
                );
                return (
                  T.cleanup(function () {
                    r.fetchCancelFns.delete(e);
                    var n = t.nextFetchPolicy;
                    n &&
                      ((t.nextFetchPolicy = void 0),
                      (t.fetchPolicy =
                        "function" == typeof n
                          ? n.call(t, t.fetchPolicy || "cache-first")
                          : n));
                  }),
                  T
                );
              }),
              (e.prototype.fetchQueryByPolicy = function (e, t, n) {
                var i = this,
                  o = t.query,
                  a = t.variables,
                  c = t.fetchPolicy,
                  u = t.errorPolicy,
                  l = t.returnPartialData,
                  f = t.context;
                e.init({
                  document: o,
                  variables: a,
                  lastRequestId: this.generateRequestId(),
                  networkStatus: n,
                });
                var h = function () {
                    return e.getDiff(a);
                  },
                  d = function (t, n) {
                    void 0 === n && (n = e.networkStatus || p.I.loading);
                    var c = t.result;
                    var u = function (e) {
                      return s.y$.of(
                        (0, r.pi)(
                          { data: e, loading: (0, p.O)(n), networkStatus: n },
                          t.complete ? null : { partial: !0 }
                        )
                      );
                    };
                    return i.transform(o).hasForcedResolvers
                      ? i.localState
                          .runResolvers({
                            document: o,
                            remoteResult: { data: c },
                            context: f,
                            variables: a,
                            onlyRunForcedResolvers: !0,
                          })
                          .then(function (e) {
                            return u(e.data);
                          })
                      : u(c);
                  },
                  v = function (t) {
                    return i.getResultsFromLink(e, t, {
                      variables: a,
                      context: f,
                      fetchPolicy: c,
                      errorPolicy: u,
                    });
                  };
                switch (c) {
                  default:
                  case "cache-first":
                    return (y = h()).complete
                      ? [d(y, e.markReady())]
                      : l
                      ? [d(y), v(!0)]
                      : [v(!0)];
                  case "cache-and-network":
                    var y;
                    return (y = h()).complete || l ? [d(y), v(!0)] : [v(!0)];
                  case "cache-only":
                    return [d(h(), e.markReady())];
                  case "network-only":
                    return [v(!0)];
                  case "no-cache":
                    return [v(!1)];
                  case "standby":
                    return [];
                }
              }),
              (e.prototype.getQuery = function (e) {
                return (
                  e &&
                    !this.queries.has(e) &&
                    this.queries.set(e, new b(this.cache)),
                  this.queries.get(e)
                );
              }),
              (e.prototype.prepareContext = function (e) {
                void 0 === e && (e = {});
                var t = this.localState.prepareContext(e);
                return (0, r.pi)((0, r.pi)({}, t), {
                  clientAwareness: this.clientAwareness,
                });
              }),
              e
            );
          })();
        function T(e, t) {
          if (g(e.result, e.errorPolicy)) {
            var n = [
                {
                  result: e.result.data,
                  dataId: "ROOT_MUTATION",
                  query: e.document,
                  variables: e.variables,
                },
              ],
              r = e.queryUpdatersById;
            r &&
              Object.keys(r).forEach(function (i) {
                var o = r[i],
                  a = o.updater,
                  c = o.queryInfo,
                  u = c.document,
                  l = c.variables,
                  f = t.diff({
                    query: u,
                    variables: l,
                    returnPartialData: !0,
                    optimistic: !1,
                  }),
                  p = f.result;
                if (f.complete && p) {
                  var h = a(p, {
                    mutationResult: e.result,
                    queryName: (0, s.rY)(u) || void 0,
                    queryVariables: l,
                  });
                  h &&
                    n.push({
                      result: h,
                      dataId: "ROOT_QUERY",
                      query: u,
                      variables: l,
                    });
                }
              }),
              t.performTransaction(function (t) {
                n.forEach(function (e) {
                  return t.write(e);
                });
                var r = e.update;
                r && r(t, e.result);
              }, null);
          }
        }
        var S = (function () {
          function e(e) {
            var t = this;
            (this.defaultOptions = {}),
              (this.resetStoreCallbacks = []),
              (this.clearStoreCallbacks = []);
            var n = e.uri,
              r = e.credentials,
              s = e.headers,
              c = e.cache,
              u = e.ssrMode,
              l = void 0 !== u && u,
              f = e.ssrForceFetchDelay,
              p = void 0 === f ? 0 : f,
              h = e.connectToDevTools,
              d = e.queryDeduplication,
              y = void 0 === d || d,
              m = e.defaultOptions,
              b = e.assumeImmutableResults,
              g = void 0 !== b && b,
              k = e.resolvers,
              T = e.typeDefs,
              S = e.fragmentMatcher,
              w = e.name,
              O = e.version,
              _ = e.link;
            if (
              (_ ||
                (_ = n
                  ? new a.uG({ uri: n, credentials: r, headers: s })
                  : o.i0.empty()),
              !c)
            )
              throw new i.ej(9);
            (this.link = _),
              (this.cache = c),
              (this.disableNetworkFetches = l || p > 0),
              (this.queryDeduplication = y),
              (this.defaultOptions = m || {}),
              (this.typeDefs = T),
              p &&
                setTimeout(function () {
                  return (t.disableNetworkFetches = !1);
                }, p),
              (this.watchQuery = this.watchQuery.bind(this)),
              (this.query = this.query.bind(this)),
              (this.mutate = this.mutate.bind(this)),
              (this.resetStore = this.resetStore.bind(this)),
              (this.reFetchObservableQueries = this.reFetchObservableQueries.bind(
                this
              ));
            void 0 !== h &&
              h &&
              "undefined" != typeof window &&
              (window.__APOLLO_CLIENT__ = this),
              (this.version = "local"),
              (this.localState = new v({
                cache: c,
                client: this,
                resolvers: k,
                fragmentMatcher: S,
              })),
              (this.queryManager = new E({
                cache: this.cache,
                link: this.link,
                queryDeduplication: y,
                ssrMode: l,
                clientAwareness: { name: w, version: O },
                localState: this.localState,
                assumeImmutableResults: g,
                onBroadcast: function () {
                  t.devToolsHookCb &&
                    t.devToolsHookCb({
                      action: {},
                      state: {
                        queries: t.queryManager.getQueryStore(),
                        mutations: t.queryManager.mutationStore.getStore(),
                      },
                      dataWithOptimisticResults: t.cache.extract(!0),
                    });
                },
              }));
          }
          return (
            (e.prototype.stop = function () {
              this.queryManager.stop();
            }),
            (e.prototype.watchQuery = function (e) {
              return (
                this.defaultOptions.watchQuery &&
                  (e = (0, s.oA)(this.defaultOptions.watchQuery, e)),
                !this.disableNetworkFetches ||
                  ("network-only" !== e.fetchPolicy &&
                    "cache-and-network" !== e.fetchPolicy) ||
                  (e = (0, r.pi)((0, r.pi)({}, e), {
                    fetchPolicy: "cache-first",
                  })),
                this.queryManager.watchQuery(e)
              );
            }),
            (e.prototype.query = function (e) {
              return (
                this.defaultOptions.query &&
                  (e = (0, s.oA)(this.defaultOptions.query, e)),
                (0, i.kG)("cache-and-network" !== e.fetchPolicy, 10),
                this.disableNetworkFetches &&
                  "network-only" === e.fetchPolicy &&
                  (e = (0, r.pi)((0, r.pi)({}, e), {
                    fetchPolicy: "cache-first",
                  })),
                this.queryManager.query(e)
              );
            }),
            (e.prototype.mutate = function (e) {
              return (
                this.defaultOptions.mutate &&
                  (e = (0, s.oA)(this.defaultOptions.mutate, e)),
                this.queryManager.mutate(e)
              );
            }),
            (e.prototype.subscribe = function (e) {
              return this.queryManager.startGraphQLSubscription(e);
            }),
            (e.prototype.readQuery = function (e, t) {
              return void 0 === t && (t = !1), this.cache.readQuery(e, t);
            }),
            (e.prototype.readFragment = function (e, t) {
              return void 0 === t && (t = !1), this.cache.readFragment(e, t);
            }),
            (e.prototype.writeQuery = function (e) {
              this.cache.writeQuery(e), this.queryManager.broadcastQueries();
            }),
            (e.prototype.writeFragment = function (e) {
              this.cache.writeFragment(e), this.queryManager.broadcastQueries();
            }),
            (e.prototype.__actionHookForDevTools = function (e) {
              this.devToolsHookCb = e;
            }),
            (e.prototype.__requestRaw = function (e) {
              return (0, o.ht)(this.link, e);
            }),
            (e.prototype.resetStore = function () {
              var e = this;
              return Promise.resolve()
                .then(function () {
                  return e.queryManager.clearStore();
                })
                .then(function () {
                  return Promise.all(
                    e.resetStoreCallbacks.map(function (e) {
                      return e();
                    })
                  );
                })
                .then(function () {
                  return e.reFetchObservableQueries();
                });
            }),
            (e.prototype.clearStore = function () {
              var e = this;
              return Promise.resolve()
                .then(function () {
                  return e.queryManager.clearStore();
                })
                .then(function () {
                  return Promise.all(
                    e.clearStoreCallbacks.map(function (e) {
                      return e();
                    })
                  );
                });
            }),
            (e.prototype.onResetStore = function (e) {
              var t = this;
              return (
                this.resetStoreCallbacks.push(e),
                function () {
                  t.resetStoreCallbacks = t.resetStoreCallbacks.filter(
                    function (t) {
                      return t !== e;
                    }
                  );
                }
              );
            }),
            (e.prototype.onClearStore = function (e) {
              var t = this;
              return (
                this.clearStoreCallbacks.push(e),
                function () {
                  t.clearStoreCallbacks = t.clearStoreCallbacks.filter(
                    function (t) {
                      return t !== e;
                    }
                  );
                }
              );
            }),
            (e.prototype.reFetchObservableQueries = function (e) {
              return this.queryManager.reFetchObservableQueries(e);
            }),
            (e.prototype.extract = function (e) {
              return this.cache.extract(e);
            }),
            (e.prototype.restore = function (e) {
              return this.cache.restore(e);
            }),
            (e.prototype.addResolvers = function (e) {
              this.localState.addResolvers(e);
            }),
            (e.prototype.setResolvers = function (e) {
              this.localState.setResolvers(e);
            }),
            (e.prototype.getResolvers = function () {
              return this.localState.getResolvers();
            }),
            (e.prototype.setLocalStateFragmentMatcher = function (e) {
              this.localState.setFragmentMatcher(e);
            }),
            (e.prototype.setLink = function (e) {
              this.link = this.queryManager.link = e;
            }),
            e
          );
        })();
      },
      6282: (e, t, n) => {
        "use strict";
        n.d(t, { u: () => u });
        var r = n(655),
          i = n(7591),
          o = n(2152),
          s = n(5942),
          a = n(9188),
          c = (function () {
            function e(e, t, n, r) {
              (this.observer = e),
                (this.options = t),
                (this.fetch = n),
                (this.shouldFetch = r);
            }
            return (
              (e.prototype.reobserve = function (e, t) {
                e ? this.updateOptions(e) : this.updatePolling();
                var n = this.fetch(this.options, t);
                return (
                  this.concast &&
                    this.concast.removeObserver(this.observer, !0),
                  n.addObserver(this.observer),
                  (this.concast = n).promise
                );
              }),
              (e.prototype.updateOptions = function (e) {
                return (
                  Object.assign(this.options, (0, a.oA)(e)),
                  this.updatePolling(),
                  this
                );
              }),
              (e.prototype.stop = function () {
                this.concast &&
                  (this.concast.removeObserver(this.observer),
                  delete this.concast),
                  this.pollingInfo &&
                    (clearTimeout(this.pollingInfo.timeout),
                    (this.options.pollInterval = 0),
                    this.updatePolling());
              }),
              (e.prototype.updatePolling = function () {
                var e = this,
                  t = this.pollingInfo,
                  n = this.options.pollInterval;
                if (n) {
                  if (
                    (!t || t.interval !== n) &&
                    ((0, i.kG)(n, 20), !1 !== this.shouldFetch)
                  ) {
                    (t || (this.pollingInfo = {})).interval = n;
                    var r = function () {
                        e.pollingInfo &&
                          (e.shouldFetch && e.shouldFetch()
                            ? e
                                .reobserve(
                                  {
                                    fetchPolicy: "network-only",
                                    nextFetchPolicy:
                                      e.options.fetchPolicy || "cache-first",
                                  },
                                  s.I.poll
                                )
                                .then(o, o)
                            : o());
                      },
                      o = function () {
                        var t = e.pollingInfo;
                        t &&
                          (clearTimeout(t.timeout),
                          (t.timeout = setTimeout(r, t.interval)));
                      };
                    o();
                  }
                } else t && (clearTimeout(t.timeout), delete this.pollingInfo);
              }),
              e
            );
          })(),
          u = (function (e) {
            function t(t) {
              var n = t.queryManager,
                i = t.queryInfo,
                o = t.options,
                c =
                  e.call(this, function (e) {
                    return c.onSubscribe(e);
                  }) || this;
              (c.observers = new Set()),
                (c.subscriptions = new Set()),
                (c.observer = {
                  next: function (e) {
                    (c.lastError || c.isDifferentFromLastResult(e)) &&
                      (c.updateLastResult(e),
                      (0, a.pM)(c.observers, "next", e));
                  },
                  error: function (e) {
                    c.updateLastResult(
                      (0, r.pi)((0, r.pi)({}, c.lastResult), {
                        error: e,
                        errors: e.graphQLErrors,
                        networkStatus: s.I.error,
                        loading: !1,
                      })
                    ),
                      (0, a.pM)(c.observers, "error", (c.lastError = e));
                  },
                }),
                (c.isTornDown = !1),
                (c.options = o),
                (c.queryId = n.generateQueryId());
              var u = (0, a.$H)(o.query);
              return (
                (c.queryName = u && u.name && u.name.value),
                (c.queryManager = n),
                (c.queryInfo = i),
                c
              );
            }
            return (
              (0, r.ZT)(t, e),
              Object.defineProperty(t.prototype, "variables", {
                get: function () {
                  return this.options.variables;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (t.prototype.result = function () {
                var e = this;
                return new Promise(function (t, n) {
                  var r = {
                      next: function (n) {
                        t(n),
                          e.observers.delete(r),
                          e.observers.size ||
                            e.queryManager.removeQuery(e.queryId),
                          setTimeout(function () {
                            i.unsubscribe();
                          }, 0);
                      },
                      error: n,
                    },
                    i = e.subscribe(r);
                });
              }),
              (t.prototype.getCurrentResult = function (e) {
                void 0 === e && (e = !0);
                var t = this.lastResult,
                  n =
                    this.queryInfo.networkStatus ||
                    (t && t.networkStatus) ||
                    s.I.ready,
                  i = (0, r.pi)((0, r.pi)({}, t), {
                    loading: (0, s.O)(n),
                    networkStatus: n,
                  });
                if (this.isTornDown) return i;
                var o = this.options.fetchPolicy,
                  a = void 0 === o ? "cache-first" : o;
                if ("no-cache" === a || "network-only" === a) delete i.partial;
                else if (
                  !i.data ||
                  !this.queryManager.transform(this.options.query)
                    .hasForcedResolvers
                ) {
                  var c = this.queryInfo.getDiff();
                  (i.data =
                    c.complete || this.options.returnPartialData
                      ? c.result
                      : void 0),
                    c.complete
                      ? (i.networkStatus !== s.I.loading ||
                          ("cache-first" !== a && "cache-only" !== a) ||
                          ((i.networkStatus = s.I.ready), (i.loading = !1)),
                        delete i.partial)
                      : (i.partial = !0);
                }
                return e && this.updateLastResult(i), i;
              }),
              (t.prototype.isDifferentFromLastResult = function (e) {
                return !(0, o.D)(this.lastResultSnapshot, e);
              }),
              (t.prototype.getLastResult = function () {
                return this.lastResult;
              }),
              (t.prototype.getLastError = function () {
                return this.lastError;
              }),
              (t.prototype.resetLastResults = function () {
                delete this.lastResult,
                  delete this.lastResultSnapshot,
                  delete this.lastError,
                  (this.isTornDown = !1);
              }),
              (t.prototype.resetQueryStoreErrors = function () {
                this.queryManager.resetErrors(this.queryId);
              }),
              (t.prototype.refetch = function (e) {
                var t = { pollInterval: 0 },
                  n = this.options.fetchPolicy;
                return (
                  "no-cache" !== n &&
                    "cache-and-network" !== n &&
                    ((t.fetchPolicy = "network-only"),
                    (t.nextFetchPolicy = n || "cache-first")),
                  e &&
                    !(0, o.D)(this.options.variables, e) &&
                    (t.variables = this.options.variables = (0, r.pi)(
                      (0, r.pi)({}, this.options.variables),
                      e
                    )),
                  this.newReobserver(!1).reobserve(t, s.I.refetch)
                );
              }),
              (t.prototype.fetchMore = function (e) {
                var t = this,
                  n = (0, r.pi)(
                    (0, r.pi)(
                      {},
                      e.query
                        ? e
                        : (0, r.pi)((0, r.pi)((0, r.pi)({}, this.options), e), {
                            variables: (0, r.pi)(
                              (0, r.pi)({}, this.options.variables),
                              e.variables
                            ),
                          })
                    ),
                    { fetchPolicy: "no-cache" }
                  ),
                  i = this.queryManager.generateQueryId();
                return (
                  n.notifyOnNetworkStatusChange &&
                    ((this.queryInfo.networkStatus = s.I.fetchMore),
                    this.observe()),
                  this.queryManager
                    .fetchQuery(i, n, s.I.fetchMore)
                    .then(function (r) {
                      var i = r.data,
                        o = e.updateQuery;
                      return (
                        o
                          ? t.updateQuery(function (e) {
                              return o(e, {
                                fetchMoreResult: i,
                                variables: n.variables,
                              });
                            })
                          : t.queryManager.cache.writeQuery({
                              query: n.query,
                              variables: n.variables,
                              data: i,
                            }),
                        r
                      );
                    })
                    .finally(function () {
                      t.queryManager.stopQuery(i), t.reobserve();
                    })
                );
              }),
              (t.prototype.subscribeToMore = function (e) {
                var t = this,
                  n = this.queryManager
                    .startGraphQLSubscription({
                      query: e.document,
                      variables: e.variables,
                      context: e.context,
                    })
                    .subscribe({
                      next: function (n) {
                        var r = e.updateQuery;
                        r &&
                          t.updateQuery(function (e, t) {
                            var i = t.variables;
                            return r(e, { subscriptionData: n, variables: i });
                          });
                      },
                      error: function (t) {
                        e.onError && e.onError(t);
                      },
                    });
                return (
                  this.subscriptions.add(n),
                  function () {
                    t.subscriptions.delete(n) && n.unsubscribe();
                  }
                );
              }),
              (t.prototype.setOptions = function (e) {
                return this.reobserve(e);
              }),
              (t.prototype.setVariables = function (e) {
                if ((0, o.D)(this.variables, e))
                  return this.observers.size
                    ? this.result()
                    : Promise.resolve();
                if (((this.options.variables = e), !this.observers.size))
                  return Promise.resolve();
                var t = this.options.fetchPolicy,
                  n = void 0 === t ? "cache-first" : t,
                  r = { fetchPolicy: n, variables: e };
                return (
                  "cache-first" !== n &&
                    "no-cache" !== n &&
                    "network-only" !== n &&
                    ((r.fetchPolicy = "cache-and-network"),
                    (r.nextFetchPolicy = n)),
                  this.reobserve(r, s.I.setVariables)
                );
              }),
              (t.prototype.updateQuery = function (e) {
                var t,
                  n = this.queryManager,
                  r = e(
                    n.cache.diff({
                      query: this.options.query,
                      variables: this.variables,
                      previousResult:
                        null === (t = this.lastResult) || void 0 === t
                          ? void 0
                          : t.data,
                      returnPartialData: !0,
                      optimistic: !1,
                    }).result,
                    { variables: this.variables }
                  );
                r &&
                  (n.cache.writeQuery({
                    query: this.options.query,
                    data: r,
                    variables: this.variables,
                  }),
                  n.broadcastQueries());
              }),
              (t.prototype.startPolling = function (e) {
                this.getReobserver().updateOptions({ pollInterval: e });
              }),
              (t.prototype.stopPolling = function () {
                this.reobserver &&
                  this.reobserver.updateOptions({ pollInterval: 0 });
              }),
              (t.prototype.updateLastResult = function (e) {
                var t = this.lastResult;
                return (
                  (this.lastResult = e),
                  (this.lastResultSnapshot = this.queryManager
                    .assumeImmutableResults
                    ? e
                    : (0, a.Xh)(e)),
                  (0, a.Of)(e.errors) || delete this.lastError,
                  t
                );
              }),
              (t.prototype.onSubscribe = function (e) {
                var t = this;
                if (e === this.observer) return function () {};
                try {
                  var n = e._subscription._observer;
                  n && !n.error && (n.error = l);
                } catch (e) {}
                var r = !this.observers.size;
                return (
                  this.observers.add(e),
                  this.lastError
                    ? e.error && e.error(this.lastError)
                    : this.lastResult && e.next && e.next(this.lastResult),
                  r && this.reobserve().catch(function (e) {}),
                  function () {
                    t.observers.delete(e) &&
                      !t.observers.size &&
                      t.tearDownQuery();
                  }
                );
              }),
              (t.prototype.getReobserver = function () {
                return (
                  this.reobserver || (this.reobserver = this.newReobserver(!0))
                );
              }),
              (t.prototype.newReobserver = function (e) {
                var t = this,
                  n = this.queryManager,
                  i = this.queryId;
                return (
                  n.setObservableQuery(this),
                  new c(
                    this.observer,
                    e ? this.options : (0, r.pi)({}, this.options),
                    function (e, r) {
                      return (
                        n.setObservableQuery(t), n.fetchQueryObservable(i, e, r)
                      );
                    },
                    !n.ssrMode &&
                      function () {
                        return !(0, s.O)(t.queryInfo.networkStatus);
                      }
                  )
                );
              }),
              (t.prototype.reobserve = function (e, t) {
                return (
                  (this.isTornDown = !1), this.getReobserver().reobserve(e, t)
                );
              }),
              (t.prototype.observe = function () {
                this.observer.next(this.getCurrentResult(!1));
              }),
              (t.prototype.hasObservers = function () {
                return this.observers.size > 0;
              }),
              (t.prototype.tearDownQuery = function () {
                var e = this.queryManager;
                this.reobserver &&
                  (this.reobserver.stop(), delete this.reobserver),
                  (this.isTornDown = !0),
                  this.subscriptions.forEach(function (e) {
                    return e.unsubscribe();
                  }),
                  this.subscriptions.clear(),
                  e.stopQuery(this.queryId),
                  this.observers.clear();
              }),
              t
            );
          })(a.y$);
        function l(e) {}
      },
      1439: (e, t, n) => {
        "use strict";
        n.d(t, { fe: () => r.f, h4: () => o.h4, HttpLink: () => c.uG });
        var r = n(7945),
          i = (n(6282), n(5942), n(2191));
        n.o(i, "HttpLink") &&
          n.d(t, {
            HttpLink: function () {
              return i.HttpLink;
            },
          });
        n(1498);
        var o = n(4259),
          s = n(5367);
        n.o(s, "HttpLink") &&
          n.d(t, {
            HttpLink: function () {
              return s.HttpLink;
            },
          });
        var a = n(1707);
        n.o(a, "HttpLink") &&
          n.d(t, {
            HttpLink: function () {
              return a.HttpLink;
            },
          });
        var c = n(3729),
          u = (n(4913), n(9188), n(4119)),
          l = n.n(u);
        l().resetCaches,
          l().disableFragmentWarnings,
          l().enableExperimentalFragmentVariables,
          l().disableExperimentalFragmentVariables;
      },
      5942: (e, t, n) => {
        "use strict";
        var r;
        function i(e) {
          return !!e && e < 7;
        }
        n.d(t, { I: () => r, O: () => i }),
          (function (e) {
            (e[(e.loading = 1)] = "loading"),
              (e[(e.setVariables = 2)] = "setVariables"),
              (e[(e.fetchMore = 3)] = "fetchMore"),
              (e[(e.refetch = 4)] = "refetch"),
              (e[(e.poll = 6)] = "poll"),
              (e[(e.ready = 7)] = "ready"),
              (e[(e.error = 8)] = "error");
          })(r || (r = {}));
      },
      2191: () => {},
      1498: (e, t, n) => {
        "use strict";
        n.d(t, { M: () => o, c: () => s });
        var r = n(655),
          i = n(9188);
        function o(e) {
          return e.hasOwnProperty("graphQLErrors");
        }
        var s = (function (e) {
          function t(n) {
            var r,
              o,
              s = n.graphQLErrors,
              a = n.networkError,
              c = n.errorMessage,
              u = n.extraInfo,
              l = e.call(this, c) || this;
            return (
              (l.graphQLErrors = s || []),
              (l.networkError = a || null),
              (l.message =
                c ||
                ((r = l),
                (o = ""),
                (0, i.Of)(r.graphQLErrors) &&
                  r.graphQLErrors.forEach(function (e) {
                    var t = e ? e.message : "Error message not found.";
                    o += t + "\n";
                  }),
                r.networkError && (o += r.networkError.message + "\n"),
                (o = o.replace(/\n$/, "")))),
              (l.extraInfo = u),
              (l.__proto__ = t.prototype),
              l
            );
          }
          return (0, r.ZT)(t, e), t;
        })(Error);
      },
      7222: (e, t, n) => {
        "use strict";
        n.d(t, { i: () => l });
        var r = n(655),
          i = n(7591),
          o = n(9188),
          s = n(4913);
        function a(e, t) {
          return t ? t(e) : o.y$.of();
        }
        function c(e) {
          return "function" == typeof e ? new l(e) : e;
        }
        function u(e) {
          return e.request.length <= 1;
        }
        !(function (e) {
          function t(t, n) {
            var r = e.call(this, t) || this;
            return (r.link = n), r;
          }
          (0, r.ZT)(t, e);
        })(Error);
        var l = (function () {
          function e(e) {
            e && (this.request = e);
          }
          return (
            (e.empty = function () {
              return new e(function () {
                return o.y$.of();
              });
            }),
            (e.from = function (t) {
              return 0 === t.length
                ? e.empty()
                : t.map(c).reduce(function (e, t) {
                    return e.concat(t);
                  });
            }),
            (e.split = function (t, n, r) {
              var i = c(n),
                s = c(r || new e(a));
              return u(i) && u(s)
                ? new e(function (e) {
                    return t(e)
                      ? i.request(e) || o.y$.of()
                      : s.request(e) || o.y$.of();
                  })
                : new e(function (e, n) {
                    return t(e)
                      ? i.request(e, n) || o.y$.of()
                      : s.request(e, n) || o.y$.of();
                  });
            }),
            (e.execute = function (e, t) {
              return (
                e.request((0, s.zi)(t.context, (0, s.DQ)((0, s.Ak)(t)))) ||
                o.y$.of()
              );
            }),
            (e.concat = function (t, n) {
              var r = c(t);
              if (u(r)) return r;
              var i = c(n);
              return u(i)
                ? new e(function (e) {
                    return (
                      r.request(e, function (e) {
                        return i.request(e) || o.y$.of();
                      }) || o.y$.of()
                    );
                  })
                : new e(function (e, t) {
                    return (
                      r.request(e, function (e) {
                        return i.request(e, t) || o.y$.of();
                      }) || o.y$.of()
                    );
                  });
            }),
            (e.prototype.split = function (t, n, r) {
              return this.concat(e.split(t, n, r || new e(a)));
            }),
            (e.prototype.concat = function (t) {
              return e.concat(this, t);
            }),
            (e.prototype.request = function (e, t) {
              throw new i.ej(21);
            }),
            (e.prototype.onError = function (e) {
              throw e;
            }),
            (e.prototype.setOnError = function (e) {
              return (this.onError = e), this;
            }),
            e
          );
        })();
      },
      4957: (e, t, n) => {
        "use strict";
        n(7222).i.concat;
      },
      7325: (e, t, n) => {
        "use strict";
        n(7222).i.empty;
      },
      2550: (e, t, n) => {
        "use strict";
        n.d(t, { h: () => r });
        var r = n(7222).i.execute;
      },
      4674: (e, t, n) => {
        "use strict";
        n(7222).i.from;
      },
      1707: (e, t, n) => {
        "use strict";
        n.d(t, { ht: () => r.h, i0: () => i.i });
        n(7325), n(4674), n(4738), n(4957);
        var r = n(2550),
          i = n(7222),
          o = n(9875);
        n.o(o, "HttpLink") &&
          n.d(t, {
            HttpLink: function () {
              return o.HttpLink;
            },
          });
      },
      4738: (e, t, n) => {
        "use strict";
        n(7222).i.split;
      },
      9875: () => {},
      3729: (e, t, n) => {
        "use strict";
        n.d(t, { uG: () => T });
        var r = n(4913),
          i = Object.prototype.hasOwnProperty;
        var o = n(7591),
          s = function (e, t) {
            var n;
            try {
              n = JSON.stringify(e);
            } catch (e) {
              var r = new o.ej(23);
              throw ((r.parseError = e), r);
            }
            return n;
          },
          a = n(655),
          c = n(4079);
        function u(e) {
          return (0, c.Vn)(e, { leave: l });
        }
        var l = {
          Name: function (e) {
            return e.value;
          },
          Variable: function (e) {
            return "$" + e.name;
          },
          Document: function (e) {
            return p(e.definitions, "\n\n") + "\n";
          },
          OperationDefinition: function (e) {
            var t = e.operation,
              n = e.name,
              r = d("(", p(e.variableDefinitions, ", "), ")"),
              i = p(e.directives, " "),
              o = e.selectionSet;
            return n || i || r || "query" !== t
              ? p([t, p([n, r]), i, o], " ")
              : o;
          },
          VariableDefinition: function (e) {
            var t = e.variable,
              n = e.type,
              r = e.defaultValue,
              i = e.directives;
            return t + ": " + n + d(" = ", r) + d(" ", p(i, " "));
          },
          SelectionSet: function (e) {
            return h(e.selections);
          },
          Field: function (e) {
            var t = e.alias,
              n = e.name,
              r = e.arguments,
              i = e.directives,
              o = e.selectionSet,
              s = d("", t, ": ") + n,
              a = s + d("(", p(r, ", "), ")");
            return (
              a.length > 80 && (a = s + d("(\n", v(p(r, "\n")), "\n)")),
              p([a, p(i, " "), o], " ")
            );
          },
          Argument: function (e) {
            return e.name + ": " + e.value;
          },
          FragmentSpread: function (e) {
            return "..." + e.name + d(" ", p(e.directives, " "));
          },
          InlineFragment: function (e) {
            var t = e.typeCondition,
              n = e.directives,
              r = e.selectionSet;
            return p(["...", d("on ", t), p(n, " "), r], " ");
          },
          FragmentDefinition: function (e) {
            var t = e.name,
              n = e.typeCondition,
              r = e.variableDefinitions,
              i = e.directives,
              o = e.selectionSet;
            return (
              "fragment ".concat(t).concat(d("(", p(r, ", "), ")"), " ") +
              "on ".concat(n, " ").concat(d("", p(i, " "), " ")) +
              o
            );
          },
          IntValue: function (e) {
            return e.value;
          },
          FloatValue: function (e) {
            return e.value;
          },
          StringValue: function (e, t) {
            var n = e.value;
            return e.block
              ? (function (e) {
                  var t =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : "",
                    n =
                      arguments.length > 2 &&
                      void 0 !== arguments[2] &&
                      arguments[2],
                    r = -1 === e.indexOf("\n"),
                    i = " " === e[0] || "\t" === e[0],
                    o = '"' === e[e.length - 1],
                    s = "\\" === e[e.length - 1],
                    a = !r || o || s || n,
                    c = "";
                  return (
                    !a || (r && i) || (c += "\n" + t),
                    (c += t ? e.replace(/\n/g, "\n" + t) : e),
                    a && (c += "\n"),
                    '"""' + c.replace(/"""/g, '\\"""') + '"""'
                  );
                })(n, "description" === t ? "" : "  ")
              : JSON.stringify(n);
          },
          BooleanValue: function (e) {
            return e.value ? "true" : "false";
          },
          NullValue: function () {
            return "null";
          },
          EnumValue: function (e) {
            return e.value;
          },
          ListValue: function (e) {
            return "[" + p(e.values, ", ") + "]";
          },
          ObjectValue: function (e) {
            return "{" + p(e.fields, ", ") + "}";
          },
          ObjectField: function (e) {
            return e.name + ": " + e.value;
          },
          Directive: function (e) {
            return "@" + e.name + d("(", p(e.arguments, ", "), ")");
          },
          NamedType: function (e) {
            return e.name;
          },
          ListType: function (e) {
            return "[" + e.type + "]";
          },
          NonNullType: function (e) {
            return e.type + "!";
          },
          SchemaDefinition: f(function (e) {
            var t = e.directives,
              n = e.operationTypes;
            return p(["schema", p(t, " "), h(n)], " ");
          }),
          OperationTypeDefinition: function (e) {
            return e.operation + ": " + e.type;
          },
          ScalarTypeDefinition: f(function (e) {
            return p(["scalar", e.name, p(e.directives, " ")], " ");
          }),
          ObjectTypeDefinition: f(function (e) {
            var t = e.name,
              n = e.interfaces,
              r = e.directives,
              i = e.fields;
            return p(
              ["type", t, d("implements ", p(n, " & ")), p(r, " "), h(i)],
              " "
            );
          }),
          FieldDefinition: f(function (e) {
            var t = e.name,
              n = e.arguments,
              r = e.type,
              i = e.directives;
            return (
              t +
              (m(n)
                ? d("(\n", v(p(n, "\n")), "\n)")
                : d("(", p(n, ", "), ")")) +
              ": " +
              r +
              d(" ", p(i, " "))
            );
          }),
          InputValueDefinition: f(function (e) {
            var t = e.name,
              n = e.type,
              r = e.defaultValue,
              i = e.directives;
            return p([t + ": " + n, d("= ", r), p(i, " ")], " ");
          }),
          InterfaceTypeDefinition: f(function (e) {
            var t = e.name,
              n = e.interfaces,
              r = e.directives,
              i = e.fields;
            return p(
              ["interface", t, d("implements ", p(n, " & ")), p(r, " "), h(i)],
              " "
            );
          }),
          UnionTypeDefinition: f(function (e) {
            var t = e.name,
              n = e.directives,
              r = e.types;
            return p(
              [
                "union",
                t,
                p(n, " "),
                r && 0 !== r.length ? "= " + p(r, " | ") : "",
              ],
              " "
            );
          }),
          EnumTypeDefinition: f(function (e) {
            var t = e.name,
              n = e.directives,
              r = e.values;
            return p(["enum", t, p(n, " "), h(r)], " ");
          }),
          EnumValueDefinition: f(function (e) {
            return p([e.name, p(e.directives, " ")], " ");
          }),
          InputObjectTypeDefinition: f(function (e) {
            var t = e.name,
              n = e.directives,
              r = e.fields;
            return p(["input", t, p(n, " "), h(r)], " ");
          }),
          DirectiveDefinition: f(function (e) {
            var t = e.name,
              n = e.arguments,
              r = e.repeatable,
              i = e.locations;
            return (
              "directive @" +
              t +
              (m(n)
                ? d("(\n", v(p(n, "\n")), "\n)")
                : d("(", p(n, ", "), ")")) +
              (r ? " repeatable" : "") +
              " on " +
              p(i, " | ")
            );
          }),
          SchemaExtension: function (e) {
            var t = e.directives,
              n = e.operationTypes;
            return p(["extend schema", p(t, " "), h(n)], " ");
          },
          ScalarTypeExtension: function (e) {
            return p(["extend scalar", e.name, p(e.directives, " ")], " ");
          },
          ObjectTypeExtension: function (e) {
            var t = e.name,
              n = e.interfaces,
              r = e.directives,
              i = e.fields;
            return p(
              [
                "extend type",
                t,
                d("implements ", p(n, " & ")),
                p(r, " "),
                h(i),
              ],
              " "
            );
          },
          InterfaceTypeExtension: function (e) {
            var t = e.name,
              n = e.interfaces,
              r = e.directives,
              i = e.fields;
            return p(
              [
                "extend interface",
                t,
                d("implements ", p(n, " & ")),
                p(r, " "),
                h(i),
              ],
              " "
            );
          },
          UnionTypeExtension: function (e) {
            var t = e.name,
              n = e.directives,
              r = e.types;
            return p(
              [
                "extend union",
                t,
                p(n, " "),
                r && 0 !== r.length ? "= " + p(r, " | ") : "",
              ],
              " "
            );
          },
          EnumTypeExtension: function (e) {
            var t = e.name,
              n = e.directives,
              r = e.values;
            return p(["extend enum", t, p(n, " "), h(r)], " ");
          },
          InputObjectTypeExtension: function (e) {
            var t = e.name,
              n = e.directives,
              r = e.fields;
            return p(["extend input", t, p(n, " "), h(r)], " ");
          },
        };
        function f(e) {
          return function (t) {
            return p([t.description, e(t)], "\n");
          };
        }
        function p(e) {
          var t,
            n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "";
          return null !==
            (t =
              null == e
                ? void 0
                : e
                    .filter(function (e) {
                      return e;
                    })
                    .join(n)) && void 0 !== t
            ? t
            : "";
        }
        function h(e) {
          return d("{\n", v(p(e, "\n")), "\n}");
        }
        function d(e, t) {
          var n =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "";
          return null != t && "" !== t ? e + t + n : "";
        }
        function v(e) {
          return d("  ", e.replace(/\n/g, "\n  "));
        }
        function y(e) {
          return -1 !== e.indexOf("\n");
        }
        function m(e) {
          return null != e && e.some(y);
        }
        var b = {
            http: { includeQuery: !0, includeExtensions: !1 },
            headers: { accept: "*/*", "content-type": "application/json" },
            options: { method: "POST" },
          },
          g = n(1707),
          k = n(9188);
        var E = function (e) {
            void 0 === e && (e = {});
            var t = e.uri,
              n = void 0 === t ? "/graphql" : t,
              c = e.fetch,
              l = e.includeExtensions,
              f = e.useGETForQueries,
              p = (0, a._T)(e, [
                "uri",
                "fetch",
                "includeExtensions",
                "useGETForQueries",
              ]);
            !(function (e) {
              if (!e && "undefined" == typeof fetch) throw new o.ej(22);
            })(c),
              c || (c = fetch);
            var h = {
              http: { includeExtensions: l },
              options: p.fetchOptions,
              credentials: p.credentials,
              headers: p.headers,
            };
            return new g.i0(function (e) {
              var t = (function (e, t) {
                  return (
                    e.getContext().uri ||
                    ("function" == typeof t ? t(e) : t || "/graphql")
                  );
                })(e, n),
                o = e.getContext(),
                l = {};
              if (o.clientAwareness) {
                var p = o.clientAwareness,
                  d = p.name,
                  v = p.version;
                d && (l["apollographql-client-name"] = d),
                  v && (l["apollographql-client-version"] = v);
              }
              var y,
                m = (0, a.pi)((0, a.pi)({}, l), o.headers),
                g = {
                  http: o.http,
                  options: o.fetchOptions,
                  credentials: o.credentials,
                  headers: m,
                },
                E = (function (e, t) {
                  for (var n = [], r = 2; r < arguments.length; r++)
                    n[r - 2] = arguments[r];
                  var i = (0, a.pi)((0, a.pi)({}, t.options), {
                      headers: t.headers,
                      credentials: t.credentials,
                    }),
                    o = t.http || {};
                  n.forEach(function (e) {
                    (i = (0, a.pi)((0, a.pi)((0, a.pi)({}, i), e.options), {
                      headers: (0, a.pi)((0, a.pi)({}, i.headers), e.headers),
                    })),
                      e.credentials && (i.credentials = e.credentials),
                      (o = (0, a.pi)((0, a.pi)({}, o), e.http));
                  });
                  var s = e.operationName,
                    c = e.extensions,
                    l = e.variables,
                    f = e.query,
                    p = { operationName: s, variables: l };
                  return (
                    o.includeExtensions && (p.extensions = c),
                    o.includeQuery && (p.query = u(f)),
                    { options: i, body: p }
                  );
                })(e, b, h, g),
                T = E.options,
                S = E.body;
              if (!T.signal) {
                var w = (function () {
                    if ("undefined" == typeof AbortController)
                      return { controller: !1, signal: !1 };
                    var e = new AbortController();
                    return { controller: e, signal: e.signal };
                  })(),
                  O = w.controller,
                  _ = w.signal;
                (y = O) && (T.signal = _);
              }
              if (
                (f &&
                  !e.query.definitions.some(function (e) {
                    return (
                      "OperationDefinition" === e.kind &&
                      "mutation" === e.operation
                    );
                  }) &&
                  (T.method = "GET"),
                "GET" === T.method)
              ) {
                var I = (function (e, t) {
                    var n = [],
                      r = function (e, t) {
                        n.push(e + "=" + encodeURIComponent(t));
                      };
                    if (
                      ("query" in t && r("query", t.query),
                      t.operationName && r("operationName", t.operationName),
                      t.variables)
                    ) {
                      var i = void 0;
                      try {
                        i = s(t.variables);
                      } catch (e) {
                        return { parseError: e };
                      }
                      r("variables", i);
                    }
                    if (t.extensions) {
                      var o = void 0;
                      try {
                        o = s(t.extensions);
                      } catch (e) {
                        return { parseError: e };
                      }
                      r("extensions", o);
                    }
                    var a = "",
                      c = e,
                      u = e.indexOf("#");
                    -1 !== u && ((a = e.substr(u)), (c = e.substr(0, u)));
                    var l = -1 === c.indexOf("?") ? "?" : "&";
                    return { newURI: c + l + n.join("&") + a };
                  })(t, S),
                  N = I.newURI,
                  x = I.parseError;
                if (x) return (0, r.Qc)(x);
                t = N;
              } else
                try {
                  T.body = s(S);
                } catch (x) {
                  return (0, r.Qc)(x);
                }
              return new k.y$(function (n) {
                var o;
                return (
                  c(t, T)
                    .then(function (t) {
                      return e.setContext({ response: t }), t;
                    })
                    .then(
                      ((o = e),
                      function (e) {
                        return e
                          .text()
                          .then(function (t) {
                            try {
                              return JSON.parse(t);
                            } catch (r) {
                              var n = r;
                              throw (
                                ((n.name = "ServerParseError"),
                                (n.response = e),
                                (n.statusCode = e.status),
                                (n.bodyText = t),
                                n)
                              );
                            }
                          })
                          .then(function (t) {
                            return (
                              e.status >= 300 &&
                                (0, r.PW)(
                                  e,
                                  t,
                                  "Response not successful: Received status code " +
                                    e.status
                                ),
                              Array.isArray(t) ||
                                i.call(t, "data") ||
                                i.call(t, "errors") ||
                                (0, r.PW)(
                                  e,
                                  t,
                                  "Server response was missing for query '" +
                                    (Array.isArray(o)
                                      ? o.map(function (e) {
                                          return e.operationName;
                                        })
                                      : o.operationName) +
                                    "'."
                                ),
                              t
                            );
                          });
                      })
                    )
                    .then(function (e) {
                      return n.next(e), n.complete(), e;
                    })
                    .catch(function (e) {
                      "AbortError" !== e.name &&
                        (e.result &&
                          e.result.errors &&
                          e.result.data &&
                          n.next(e.result),
                        n.error(e));
                    }),
                  function () {
                    y && y.abort();
                  }
                );
              });
            });
          },
          T = (function (e) {
            function t(t) {
              void 0 === t && (t = {});
              var n = e.call(this, E(t).request) || this;
              return (n.options = t), n;
            }
            return (0, a.ZT)(t, e), t;
          })(g.i0);
      },
      4913: (e, t, n) => {
        "use strict";
        n.d(t, {
          zi: () => u,
          Qc: () => i,
          PW: () => s,
          DQ: () => l,
          Ak: () => a,
        });
        var r = n(9188);
        function i(e) {
          return new r.y$(function (t) {
            t.error(e);
          });
        }
        var o = n(7591);
        var s = function (e, t, n) {
          var r = new Error(n);
          throw (
            ((r.name = "ServerError"),
            (r.response = e),
            (r.statusCode = e.status),
            (r.result = t),
            r)
          );
        };
        function a(e) {
          for (
            var t = [
                "query",
                "operationName",
                "variables",
                "extensions",
                "context",
              ],
              n = 0,
              r = Object.keys(e);
            n < r.length;
            n++
          ) {
            var i = r[n];
            if (t.indexOf(i) < 0) throw new o.ej(26);
          }
          return e;
        }
        var c = n(655);
        function u(e, t) {
          var n = (0, c.pi)({}, e);
          return (
            Object.defineProperty(t, "setContext", {
              enumerable: !1,
              value: function (e) {
                n =
                  "function" == typeof e
                    ? (0, c.pi)((0, c.pi)({}, n), e(n))
                    : (0, c.pi)((0, c.pi)({}, n), e);
              },
            }),
            Object.defineProperty(t, "getContext", {
              enumerable: !1,
              value: function () {
                return (0, c.pi)({}, n);
              },
            }),
            t
          );
        }
        function l(e) {
          var t = {
            variables: e.variables || {},
            extensions: e.extensions || {},
            operationName: e.operationName,
            query: e.query,
          };
          return (
            t.operationName ||
              (t.operationName =
                "string" != typeof t.query ? (0, r.rY)(t.query) || void 0 : ""),
            t
          );
        }
      },
      9188: (e, t, n) => {
        "use strict";
        n.d(t, {
          X_: () => oe,
          w0: () => H,
          y$: () => z(),
          Gw: () => j,
          NC: () => k,
          sz: () => re,
          aL: () => Q,
          mr: () => ce,
          Xh: () => Z,
          oA: () => ue,
          F: () => l,
          O4: () => A,
          kU: () => N,
          hi: () => f,
          Yk: () => u,
          p$: () => D,
          $H: () => _,
          rY: () => I,
          iW: () => x,
          PT: () => g,
          qw: () => T,
          d2: () => ae,
          mj: () => a,
          FS: () => s,
          My: () => S,
          Ao: () => w,
          Of: () => se,
          hh: () => v,
          pM: () => ne,
          kQ: () => d,
          Jv: () => te,
          Ee: () => G,
          bw: () => Y,
          ob: () => B,
          Fo: () => K,
          u2: () => E,
          LZ: () => o,
          vf: () => m,
        });
        var r = n(4079),
          i = n(7591);
        function o(e, t) {
          var n = e.directives;
          return (
            !n ||
            !n.length ||
            (function (e) {
              var t = [];
              e &&
                e.length &&
                e.forEach(function (e) {
                  if (
                    (function (e) {
                      var t = e.name.value;
                      return "skip" === t || "include" === t;
                    })(e)
                  ) {
                    var n = e.arguments;
                    e.name.value;
                    (0, i.kG)(n && 1 === n.length, 39);
                    var r = n[0];
                    (0, i.kG)(r.name && "if" === r.name.value, 40);
                    var o = r.value;
                    (0, i.kG)(
                      o && ("Variable" === o.kind || "BooleanValue" === o.kind),
                      41
                    ),
                      t.push({ directive: e, ifArgument: r });
                  }
                });
              return t;
            })(n).every(function (e) {
              var n = e.directive,
                r = e.ifArgument,
                o = !1;
              return (
                "Variable" === r.value.kind
                  ? ((o = t && t[r.value.name.value]),
                    (0, i.kG)(void 0 !== o, 38))
                  : (o = r.value.value),
                "skip" === n.name.value ? !o : o
              );
            })
          );
        }
        function s(e, t) {
          return (function (e) {
            var t = [];
            return (
              (0, r.Vn)(e, {
                Directive: function (e) {
                  t.push(e.name.value);
                },
              }),
              t
            );
          })(t).some(function (t) {
            return e.indexOf(t) > -1;
          });
        }
        function a(e) {
          return e && s(["client"], e) && s(["export"], e);
        }
        var c = n(655);
        function u(e, t) {
          var n = t,
            r = [];
          return (
            e.definitions.forEach(function (e) {
              if ("OperationDefinition" === e.kind) throw new i.ej(42);
              "FragmentDefinition" === e.kind && r.push(e);
            }),
            void 0 === n &&
              ((0, i.kG)(1 === r.length, 43), (n = r[0].name.value)),
            (0, c.pi)((0, c.pi)({}, e), {
              definitions: (0, c.pr)(
                [
                  {
                    kind: "OperationDefinition",
                    operation: "query",
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "FragmentSpread",
                          name: { kind: "Name", value: n },
                        },
                      ],
                    },
                  },
                ],
                e.definitions
              ),
            })
          );
        }
        function l(e) {
          void 0 === e && (e = []);
          var t = {};
          return (
            e.forEach(function (e) {
              t[e.name.value] = e;
            }),
            t
          );
        }
        function f(e, t) {
          switch (e.kind) {
            case "InlineFragment":
              return e;
            case "FragmentSpread":
              var n = t && t[e.name.value];
              return (0, i.kG)(n, 44), n;
            default:
              return null;
          }
        }
        var p = n(5035),
          h = n.n(p);
        function d(e) {
          return { __ref: String(e) };
        }
        function v(e) {
          return Boolean(
            e && "object" == typeof e && "string" == typeof e.__ref
          );
        }
        function y(e, t, n, r) {
          if (
            (function (e) {
              return "IntValue" === e.kind;
            })(n) ||
            (function (e) {
              return "FloatValue" === e.kind;
            })(n)
          )
            e[t.value] = Number(n.value);
          else if (
            (function (e) {
              return "BooleanValue" === e.kind;
            })(n) ||
            (function (e) {
              return "StringValue" === e.kind;
            })(n)
          )
            e[t.value] = n.value;
          else if (
            (function (e) {
              return "ObjectValue" === e.kind;
            })(n)
          ) {
            var o = {};
            n.fields.map(function (e) {
              return y(o, e.name, e.value, r);
            }),
              (e[t.value] = o);
          } else if (
            (function (e) {
              return "Variable" === e.kind;
            })(n)
          ) {
            var s = (r || {})[n.name.value];
            e[t.value] = s;
          } else if (
            (function (e) {
              return "ListValue" === e.kind;
            })(n)
          )
            e[t.value] = n.values.map(function (e) {
              var n = {};
              return y(n, t, e, r), n[t.value];
            });
          else if (
            (function (e) {
              return "EnumValue" === e.kind;
            })(n)
          )
            e[t.value] = n.value;
          else {
            if (
              !(function (e) {
                return "NullValue" === e.kind;
              })(n)
            )
              throw new i.ej(53);
            e[t.value] = null;
          }
        }
        function m(e, t) {
          var n = null;
          e.directives &&
            ((n = {}),
            e.directives.forEach(function (e) {
              (n[e.name.value] = {}),
                e.arguments &&
                  e.arguments.forEach(function (r) {
                    var i = r.name,
                      o = r.value;
                    return y(n[e.name.value], i, o, t);
                  });
            }));
          var r = null;
          return (
            e.arguments &&
              e.arguments.length &&
              ((r = {}),
              e.arguments.forEach(function (e) {
                var n = e.name,
                  i = e.value;
                return y(r, n, i, t);
              })),
            g(e.name.value, r, n)
          );
        }
        var b = ["connection", "include", "skip", "client", "rest", "export"];
        function g(e, t, n) {
          if (t && n && n.connection && n.connection.key) {
            if (n.connection.filter && n.connection.filter.length > 0) {
              var r = n.connection.filter ? n.connection.filter : [];
              r.sort();
              var i = {};
              return (
                r.forEach(function (e) {
                  i[e] = t[e];
                }),
                n.connection.key + "(" + JSON.stringify(i) + ")"
              );
            }
            return n.connection.key;
          }
          var o = e;
          if (t) {
            var s = h()(t);
            o += "(" + s + ")";
          }
          return (
            n &&
              Object.keys(n).forEach(function (e) {
                -1 === b.indexOf(e) &&
                  (n[e] && Object.keys(n[e]).length
                    ? (o += "@" + e + "(" + JSON.stringify(n[e]) + ")")
                    : (o += "@" + e));
              }),
            o
          );
        }
        function k(e, t) {
          if (e.arguments && e.arguments.length) {
            var n = {};
            return (
              e.arguments.forEach(function (e) {
                var r = e.name,
                  i = e.value;
                return y(n, r, i, t);
              }),
              n
            );
          }
          return null;
        }
        function E(e) {
          return e.alias ? e.alias.value : e.name.value;
        }
        function T(e, t, n) {
          if ("string" == typeof e.__typename) return e.__typename;
          for (var r = 0, i = t.selections; r < i.length; r++) {
            var o = i[r];
            if (S(o)) {
              if ("__typename" === o.name.value) return e[E(o)];
            } else {
              var s = T(e, f(o, n).selectionSet, n);
              if ("string" == typeof s) return s;
            }
          }
        }
        function S(e) {
          return "Field" === e.kind;
        }
        function w(e) {
          return "InlineFragment" === e.kind;
        }
        function O(e) {
          (0, i.kG)(e && "Document" === e.kind, 45);
          var t = e.definitions
            .filter(function (e) {
              return "FragmentDefinition" !== e.kind;
            })
            .map(function (e) {
              if ("OperationDefinition" !== e.kind) throw new i.ej(46);
              return e;
            });
          return (0, i.kG)(t.length <= 1, 47), e;
        }
        function _(e) {
          return (
            O(e),
            e.definitions.filter(function (e) {
              return "OperationDefinition" === e.kind;
            })[0]
          );
        }
        function I(e) {
          return (
            e.definitions
              .filter(function (e) {
                return "OperationDefinition" === e.kind && e.name;
              })
              .map(function (e) {
                return e.name.value;
              })[0] || null
          );
        }
        function N(e) {
          return e.definitions.filter(function (e) {
            return "FragmentDefinition" === e.kind;
          });
        }
        function x(e) {
          var t = _(e);
          return (0, i.kG)(t && "query" === t.operation, 48), t;
        }
        function D(e) {
          var t;
          O(e);
          for (var n = 0, r = e.definitions; n < r.length; n++) {
            var o = r[n];
            if ("OperationDefinition" === o.kind) {
              var s = o.operation;
              if ("query" === s || "mutation" === s || "subscription" === s)
                return o;
            }
            "FragmentDefinition" !== o.kind || t || (t = o);
          }
          if (t) return t;
          throw new i.ej(52);
        }
        function A(e) {
          var t = Object.create(null),
            n = e && e.variableDefinitions;
          return (
            n &&
              n.length &&
              n.forEach(function (e) {
                e.defaultValue && y(t, e.variable.name, e.defaultValue);
              }),
            t
          );
        }
        function R(e, t, n) {
          var r = 0;
          return (
            e.forEach(function (n, i) {
              t.call(this, n, i, e) && (e[r++] = n);
            }, n),
            (e.length = r),
            e
          );
        }
        var C = { kind: "Field", name: { kind: "Name", value: "__typename" } };
        function F(e, t) {
          return e.selectionSet.selections.every(function (e) {
            return "FragmentSpread" === e.kind && F(t[e.name.value], t);
          });
        }
        function P(e) {
          return F(
            _(e) ||
              (function (e) {
                (0, i.kG)("Document" === e.kind, 49),
                  (0, i.kG)(e.definitions.length <= 1, 50);
                var t = e.definitions[0];
                return (0, i.kG)("FragmentDefinition" === t.kind, 51), t;
              })(e),
            l(N(e))
          )
            ? null
            : e;
        }
        function M(e) {
          return function (t) {
            return e.some(function (e) {
              return (
                (e.name && e.name === t.name.value) || (e.test && e.test(t))
              );
            });
          };
        }
        function L(e, t) {
          var n = Object.create(null),
            i = [],
            o = Object.create(null),
            s = [],
            a = P(
              (0, r.Vn)(t, {
                Variable: {
                  enter: function (e, t, r) {
                    "VariableDefinition" !== r.kind && (n[e.name.value] = !0);
                  },
                },
                Field: {
                  enter: function (t) {
                    if (
                      e &&
                      t.directives &&
                      e.some(function (e) {
                        return e.remove;
                      }) &&
                      t.directives &&
                      t.directives.some(M(e))
                    )
                      return (
                        t.arguments &&
                          t.arguments.forEach(function (e) {
                            "Variable" === e.value.kind &&
                              i.push({ name: e.value.name.value });
                          }),
                        t.selectionSet &&
                          V(t.selectionSet).forEach(function (e) {
                            s.push({ name: e.name.value });
                          }),
                        null
                      );
                  },
                },
                FragmentSpread: {
                  enter: function (e) {
                    o[e.name.value] = !0;
                  },
                },
                Directive: {
                  enter: function (t) {
                    if (M(e)(t)) return null;
                  },
                },
              })
            );
          return (
            a &&
              R(i, function (e) {
                return !!e.name && !n[e.name];
              }).length &&
              (a = (function (e, t) {
                var n = (function (e) {
                  return function (t) {
                    return e.some(function (e) {
                      return (
                        t.value &&
                        "Variable" === t.value.kind &&
                        t.value.name &&
                        (e.name === t.value.name.value || (e.test && e.test(t)))
                      );
                    });
                  };
                })(e);
                return P(
                  (0, r.Vn)(t, {
                    OperationDefinition: {
                      enter: function (t) {
                        return (0, c.pi)((0, c.pi)({}, t), {
                          variableDefinitions: t.variableDefinitions
                            ? t.variableDefinitions.filter(function (t) {
                                return !e.some(function (e) {
                                  return e.name === t.variable.name.value;
                                });
                              })
                            : [],
                        });
                      },
                    },
                    Field: {
                      enter: function (t) {
                        if (
                          e.some(function (e) {
                            return e.remove;
                          })
                        ) {
                          var r = 0;
                          if (
                            (t.arguments &&
                              t.arguments.forEach(function (e) {
                                n(e) && (r += 1);
                              }),
                            1 === r)
                          )
                            return null;
                        }
                      },
                    },
                    Argument: {
                      enter: function (e) {
                        if (n(e)) return null;
                      },
                    },
                  })
                );
              })(i, a)),
            a &&
              R(s, function (e) {
                return !!e.name && !o[e.name];
              }).length &&
              (a = (function (e, t) {
                function n(t) {
                  if (
                    e.some(function (e) {
                      return e.name === t.name.value;
                    })
                  )
                    return null;
                }
                return P(
                  (0, r.Vn)(t, {
                    FragmentSpread: { enter: n },
                    FragmentDefinition: { enter: n },
                  })
                );
              })(s, a)),
            a
          );
        }
        function j(e) {
          return (0, r.Vn)(O(e), {
            SelectionSet: {
              enter: function (e, t, n) {
                if (!n || "OperationDefinition" !== n.kind) {
                  var r = e.selections;
                  if (r)
                    if (
                      !r.some(function (e) {
                        return (
                          S(e) &&
                          ("__typename" === e.name.value ||
                            0 === e.name.value.lastIndexOf("__", 0))
                        );
                      })
                    ) {
                      var i = n;
                      if (
                        !(
                          S(i) &&
                          i.directives &&
                          i.directives.some(function (e) {
                            return "export" === e.name.value;
                          })
                        )
                      )
                        return (0, c.pi)((0, c.pi)({}, e), {
                          selections: (0, c.pr)(r, [C]),
                        });
                    }
                }
              },
            },
          });
        }
        j.added = function (e) {
          return e === C;
        };
        var q = {
          test: function (e) {
            var t = "connection" === e.name.value;
            return (
              t &&
                (!e.arguments ||
                  e.arguments.some(function (e) {
                    return "key" === e.name.value;
                  })),
              t
            );
          },
        };
        function K(e) {
          return L([q], O(e));
        }
        function V(e) {
          var t = [];
          return (
            e.selections.forEach(function (e) {
              (S(e) || w(e)) && e.selectionSet
                ? V(e.selectionSet).forEach(function (e) {
                    return t.push(e);
                  })
                : "FragmentSpread" === e.kind && t.push(e);
            }),
            t
          );
        }
        function Q(e) {
          return "query" === D(e).operation
            ? e
            : (0, r.Vn)(e, {
                OperationDefinition: {
                  enter: function (e) {
                    return (0, c.pi)((0, c.pi)({}, e), { operation: "query" });
                  },
                },
              });
        }
        function B(e) {
          O(e);
          var t = L(
            [
              {
                test: function (e) {
                  return "client" === e.name.value;
                },
                remove: !0,
              },
            ],
            e
          );
          return (
            t &&
              (t = (0, r.Vn)(t, {
                FragmentDefinition: {
                  enter: function (e) {
                    if (
                      e.selectionSet &&
                      e.selectionSet.selections.every(function (e) {
                        return S(e) && "__typename" === e.name.value;
                      })
                    )
                      return null;
                  },
                },
              })),
            t
          );
        }
        var U = Object.prototype.hasOwnProperty;
        function G() {
          for (var e = [], t = 0; t < arguments.length; t++)
            e[t] = arguments[t];
          return Y(e);
        }
        function Y(e) {
          var t = e[0] || {},
            n = e.length;
          if (n > 1)
            for (var r = new H(), i = 1; i < n; ++i) t = r.merge(t, e[i]);
          return t;
        }
        function J(e) {
          return null !== e && "object" == typeof e;
        }
        var $ = function (e, t, n) {
            return this.merge(e[n], t[n]);
          },
          H = (function () {
            function e(e) {
              void 0 === e && (e = $),
                (this.reconciler = e),
                (this.isObject = J),
                (this.pastCopies = new Set());
            }
            return (
              (e.prototype.merge = function (e, t) {
                for (var n = this, r = [], i = 2; i < arguments.length; i++)
                  r[i - 2] = arguments[i];
                return J(t) && J(e)
                  ? (Object.keys(t).forEach(function (i) {
                      if (U.call(e, i)) {
                        var o = e[i];
                        if (t[i] !== o) {
                          var s = n.reconciler.apply(
                            n,
                            (0, c.pr)([e, t, i], r)
                          );
                          s !== o && ((e = n.shallowCopyForMerge(e))[i] = s);
                        }
                      } else (e = n.shallowCopyForMerge(e))[i] = t[i];
                    }),
                    e)
                  : t;
              }),
              (e.prototype.shallowCopyForMerge = function (e) {
                return (
                  J(e) &&
                    !this.pastCopies.has(e) &&
                    ((e = Array.isArray(e)
                      ? e.slice(0)
                      : (0, c.pi)({ __proto__: Object.getPrototypeOf(e) }, e)),
                    this.pastCopies.add(e)),
                  e
                );
              }),
              e
            );
          })();
        var W = n(9329),
          z = n.n(W);
        n(7121);
        z().prototype["@@observable"] = function () {
          return this;
        };
        var X = Object.prototype.toString;
        function Z(e) {
          return ee(e);
        }
        function ee(e, t) {
          switch (X.call(e)) {
            case "[object Array]":
              if ((t = t || new Map()).has(e)) return t.get(e);
              var n = e.slice(0);
              return (
                t.set(e, n),
                n.forEach(function (e, r) {
                  n[r] = ee(e, t);
                }),
                n
              );
            case "[object Object]":
              if ((t = t || new Map()).has(e)) return t.get(e);
              var r = Object.create(Object.getPrototypeOf(e));
              return (
                t.set(e, r),
                Object.keys(e).forEach(function (n) {
                  r[n] = ee(e[n], t);
                }),
                r
              );
            default:
              return e;
          }
        }
        function te(e) {
          return e;
        }
        function ne(e, t, n) {
          var r = [];
          e.forEach(function (e) {
            return e[t] && r.push(e);
          }),
            r.forEach(function (e) {
              return e[t](n);
            });
        }
        function re(e, t, n) {
          return new (z())(function (r) {
            var i = r.next,
              o = r.error,
              s = r.complete,
              a = 0,
              c = !1;
            function u(e, t) {
              return e
                ? function (t) {
                    ++a,
                      new Promise(function (n) {
                        return n(e(t));
                      }).then(
                        function (e) {
                          --a, i && i.call(r, e), c && l.complete();
                        },
                        function (e) {
                          --a, o && o.call(r, e);
                        }
                      );
                  }
                : function (e) {
                    return t && t.call(r, e);
                  };
            }
            var l = {
                next: u(t, i),
                error: u(n, o),
                complete: function () {
                  (c = !0), a || (s && s.call(r));
                },
              },
              f = e.subscribe(l);
            return function () {
              return f.unsubscribe();
            };
          });
        }
        function ie(e) {
          return e && "function" == typeof e.then;
        }
        var oe = (function (e) {
          function t(t) {
            var n =
              e.call(this, function (e) {
                return (
                  n.addObserver(e),
                  function () {
                    return n.removeObserver(e);
                  }
                );
              }) || this;
            return (
              (n.observers = new Set()),
              (n.promise = new Promise(function (e, t) {
                (n.resolve = e), (n.reject = t);
              })),
              (n.handlers = {
                next: function (e) {
                  null !== n.sub &&
                    ((n.latest = ["next", e]), ne(n.observers, "next", e));
                },
                error: function (e) {
                  null !== n.sub &&
                    (n.sub && n.sub.unsubscribe(),
                    (n.sub = null),
                    (n.latest = ["error", e]),
                    n.reject(e),
                    ne(n.observers, "error", e));
                },
                complete: function () {
                  if (null !== n.sub) {
                    var e = n.sources.shift();
                    e
                      ? ie(e)
                        ? e.then(function (e) {
                            return (n.sub = e.subscribe(n.handlers));
                          })
                        : (n.sub = e.subscribe(n.handlers))
                      : ((n.sub = null),
                        n.latest && "next" === n.latest[0]
                          ? n.resolve(n.latest[1])
                          : n.resolve(),
                        ne(n.observers, "complete"));
                  }
                },
              }),
              (n.cancel = function (e) {
                n.reject(e), (n.sources = []), n.handlers.complete();
              }),
              n.promise.catch(function (e) {}),
              ie(t)
                ? t.then(function (e) {
                    return n.start(e);
                  }, n.handlers.error)
                : n.start(t),
              n
            );
          }
          return (
            (0, c.ZT)(t, e),
            (t.prototype.start = function (e) {
              void 0 === this.sub &&
                ((this.sources = Array.from(e)), this.handlers.complete());
            }),
            (t.prototype.addObserver = function (e) {
              if (!this.observers.has(e)) {
                if (this.latest) {
                  var t = this.latest[0],
                    n = e[t];
                  n && n.call(e, this.latest[1]),
                    null === this.sub &&
                      "next" === t &&
                      e.complete &&
                      e.complete();
                }
                this.observers.add(e);
              }
            }),
            (t.prototype.removeObserver = function (e, t) {
              if (this.observers.delete(e) && this.observers.size < 1) {
                if (t) return;
                this.sub &&
                  (this.sub.unsubscribe(),
                  this.reject(new Error("Observable cancelled prematurely"))),
                  (this.sub = null);
              }
            }),
            (t.prototype.cleanup = function (e) {
              var t = this,
                n = !1,
                r = function () {
                  n || ((n = !0), t.observers.delete(i), e());
                },
                i = { next: r, error: r, complete: r };
              this.addObserver(i);
            }),
            t
          );
        })(z());
        function se(e) {
          return Array.isArray(e) && e.length > 0;
        }
        function ae(e) {
          return (e.errors && e.errors.length > 0) || !1;
        }
        "function" == typeof Symbol &&
          Symbol.species &&
          Object.defineProperty(oe, Symbol.species, { value: z() });
        var ce =
          "function" == typeof WeakMap &&
          !(
            "object" == typeof navigator && "ReactNative" === navigator.product
          );
        function ue() {
          for (var e = [], t = 0; t < arguments.length; t++)
            e[t] = arguments[t];
          var n = Object.create(null);
          return (
            e.forEach(function (e) {
              e &&
                Object.keys(e).forEach(function (t) {
                  var r = e[t];
                  void 0 !== r && (n[t] = r);
                });
            }),
            n
          );
        }
      },
      2152: (e, t, n) => {
        "use strict";
        n.d(t, { D: () => c });
        var r = Object.prototype,
          i = r.toString,
          o = r.hasOwnProperty,
          s = Function.prototype.toString,
          a = new Map();
        function c(e, t) {
          try {
            return u(e, t);
          } finally {
            a.clear();
          }
        }
        function u(e, t) {
          if (e === t) return !0;
          var n,
            r,
            a,
            c = i.call(e);
          if (c !== i.call(t)) return !1;
          switch (c) {
            case "[object Array]":
              if (e.length !== t.length) return !1;
            case "[object Object]":
              if (f(e, t)) return !0;
              var p = Object.keys(e),
                h = Object.keys(t),
                d = p.length;
              if (d !== h.length) return !1;
              for (var v = 0; v < d; ++v) if (!o.call(t, p[v])) return !1;
              for (v = 0; v < d; ++v) {
                var y = p[v];
                if (!u(e[y], t[y])) return !1;
              }
              return !0;
            case "[object Error]":
              return e.name === t.name && e.message === t.message;
            case "[object Number]":
              if (e != e) return t != t;
            case "[object Boolean]":
            case "[object Date]":
              return +e == +t;
            case "[object RegExp]":
            case "[object String]":
              return e == "" + t;
            case "[object Map]":
            case "[object Set]":
              if (e.size !== t.size) return !1;
              if (f(e, t)) return !0;
              for (var m = e.entries(), b = "[object Map]" === c; ; ) {
                var g = m.next();
                if (g.done) break;
                var k = g.value,
                  E = k[0],
                  T = k[1];
                if (!t.has(E)) return !1;
                if (b && !u(T, t.get(E))) return !1;
              }
              return !0;
            case "[object Function]":
              var S = s.call(e);
              return (
                S === s.call(t) &&
                ((r = l),
                !(
                  (a = (n = S).length - r.length) >= 0 && n.indexOf(r, a) === a
                ))
              );
          }
          return !1;
        }
        var l = "{ [native code] }";
        function f(e, t) {
          var n = a.get(e);
          if (n) {
            if (n.has(t)) return !0;
          } else a.set(e, (n = new Set()));
          return n.add(t), !1;
        }
      },
      5035: (e) => {
        "use strict";
        e.exports = function (e, t) {
          t || (t = {}), "function" == typeof t && (t = { cmp: t });
          var n,
            r = "boolean" == typeof t.cycles && t.cycles,
            i =
              t.cmp &&
              ((n = t.cmp),
              function (e) {
                return function (t, r) {
                  var i = { key: t, value: e[t] },
                    o = { key: r, value: e[r] };
                  return n(i, o);
                };
              }),
            o = [];
          return (function e(t) {
            if (
              (t &&
                t.toJSON &&
                "function" == typeof t.toJSON &&
                (t = t.toJSON()),
              void 0 !== t)
            ) {
              if ("number" == typeof t) return isFinite(t) ? "" + t : "null";
              if ("object" != typeof t) return JSON.stringify(t);
              var n, s;
              if (Array.isArray(t)) {
                for (s = "[", n = 0; n < t.length; n++)
                  n && (s += ","), (s += e(t[n]) || "null");
                return s + "]";
              }
              if (null === t) return "null";
              if (-1 !== o.indexOf(t)) {
                if (r) return JSON.stringify("__cycle__");
                throw new TypeError("Converting circular structure to JSON");
              }
              var a = o.push(t) - 1,
                c = Object.keys(t).sort(i && i(t));
              for (s = "", n = 0; n < c.length; n++) {
                var u = c[n],
                  l = e(t[u]);
                l && (s && (s += ","), (s += JSON.stringify(u) + ":" + l));
              }
              return o.splice(a, 1), "{" + s + "}";
            }
          })(e);
        };
      },
      4206: (e) => {
        var t = {
          kind: "Document",
          definitions: [
            {
              kind: "OperationDefinition",
              operation: "query",
              name: { kind: "Name", value: "GetElectionLogEntries" },
              variableDefinitions: [
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "electionUniqueId" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "after" },
                  },
                  type: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "String" },
                  },
                  directives: [],
                },
              ],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "election" },
                    arguments: [
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "uniqueId" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "electionUniqueId" },
                        },
                      },
                    ],
                    directives: [],
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "logEntries" },
                          arguments: [
                            {
                              kind: "Argument",
                              name: { kind: "Name", value: "after" },
                              value: {
                                kind: "Variable",
                                name: { kind: "Name", value: "after" },
                              },
                            },
                          ],
                          directives: [],
                          selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "id" },
                                arguments: [],
                                directives: [],
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "messageId" },
                                arguments: [],
                                directives: [],
                              },
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "signedData" },
                                arguments: [],
                                directives: [],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          loc: { start: 0, end: 202 },
        };
        t.loc.source = {
          body:
            "query GetElectionLogEntries($electionUniqueId: String!, $after: String) {\n  election(uniqueId: $electionUniqueId) {\n    logEntries(after: $after) {\n      id\n      messageId\n      signedData\n    }\n  }\n}\n",
          name: "GraphQL request",
          locationOffset: { line: 1, column: 1 },
        };
        function n(e, t) {
          if ("FragmentSpread" === e.kind) t.add(e.name.value);
          else if ("VariableDefinition" === e.kind) {
            var r = e.type;
            "NamedType" === r.kind && t.add(r.name.value);
          }
          e.selectionSet &&
            e.selectionSet.selections.forEach(function (e) {
              n(e, t);
            }),
            e.variableDefinitions &&
              e.variableDefinitions.forEach(function (e) {
                n(e, t);
              }),
            e.definitions &&
              e.definitions.forEach(function (e) {
                n(e, t);
              });
        }
        var r = {};
        function i(e, t) {
          for (var n = 0; n < e.definitions.length; n++) {
            var r = e.definitions[n];
            if (r.name && r.name.value == t) return r;
          }
        }
        t.definitions.forEach(function (e) {
          if (e.name) {
            var t = new Set();
            n(e, t), (r[e.name.value] = t);
          }
        }),
          (e.exports = t),
          (e.exports.GetElectionLogEntries = (function (e, t) {
            var n = { kind: e.kind, definitions: [i(e, t)] };
            e.hasOwnProperty("loc") && (n.loc = e.loc);
            var o = r[t] || new Set(),
              s = new Set(),
              a = new Set();
            for (
              o.forEach(function (e) {
                a.add(e);
              });
              a.size > 0;

            ) {
              var c = a;
              (a = new Set()),
                c.forEach(function (e) {
                  s.has(e) ||
                    (s.add(e),
                    (r[e] || new Set()).forEach(function (e) {
                      a.add(e);
                    }));
                });
            }
            return (
              s.forEach(function (t) {
                var r = i(e, t);
                r && n.definitions.push(r);
              }),
              n
            );
          })(t, "GetElectionLogEntries"));
      },
      5073: (e) => {
        var t = {
          kind: "Document",
          definitions: [
            {
              kind: "OperationDefinition",
              operation: "query",
              name: { kind: "Name", value: "GetLogEntry" },
              variableDefinitions: [
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "electionUniqueId" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "contentHash" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
              ],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "logEntry" },
                    arguments: [
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "electionUniqueId" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "electionUniqueId" },
                        },
                      },
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "contentHash" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "contentHash" },
                        },
                      },
                    ],
                    directives: [],
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "messageId" },
                          arguments: [],
                          directives: [],
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "signedData" },
                          arguments: [],
                          directives: [],
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "contentHash" },
                          arguments: [],
                          directives: [],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          loc: { start: 0, end: 199 },
        };
        t.loc.source = {
          body:
            "query GetLogEntry($electionUniqueId: String!, $contentHash: String!) {\n  logEntry(electionUniqueId: $electionUniqueId, contentHash: $contentHash) {\n    messageId\n    signedData\n    contentHash\n  }\n}\n",
          name: "GraphQL request",
          locationOffset: { line: 1, column: 1 },
        };
        function n(e, t) {
          if ("FragmentSpread" === e.kind) t.add(e.name.value);
          else if ("VariableDefinition" === e.kind) {
            var r = e.type;
            "NamedType" === r.kind && t.add(r.name.value);
          }
          e.selectionSet &&
            e.selectionSet.selections.forEach(function (e) {
              n(e, t);
            }),
            e.variableDefinitions &&
              e.variableDefinitions.forEach(function (e) {
                n(e, t);
              }),
            e.definitions &&
              e.definitions.forEach(function (e) {
                n(e, t);
              });
        }
        var r = {};
        function i(e, t) {
          for (var n = 0; n < e.definitions.length; n++) {
            var r = e.definitions[n];
            if (r.name && r.name.value == t) return r;
          }
        }
        t.definitions.forEach(function (e) {
          if (e.name) {
            var t = new Set();
            n(e, t), (r[e.name.value] = t);
          }
        }),
          (e.exports = t),
          (e.exports.GetLogEntry = (function (e, t) {
            var n = { kind: e.kind, definitions: [i(e, t)] };
            e.hasOwnProperty("loc") && (n.loc = e.loc);
            var o = r[t] || new Set(),
              s = new Set(),
              a = new Set();
            for (
              o.forEach(function (e) {
                a.add(e);
              });
              a.size > 0;

            ) {
              var c = a;
              (a = new Set()),
                c.forEach(function (e) {
                  s.has(e) ||
                    (s.add(e),
                    (r[e] || new Set()).forEach(function (e) {
                      a.add(e);
                    }));
                });
            }
            return (
              s.forEach(function (t) {
                var r = i(e, t);
                r && n.definitions.push(r);
              }),
              n
            );
          })(t, "GetLogEntry"));
      },
      5053: (e) => {
        var t = {
          kind: "Document",
          definitions: [
            {
              kind: "OperationDefinition",
              operation: "query",
              name: { kind: "Name", value: "GetPendingMessageByMessageId" },
              variableDefinitions: [
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "messageId" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
              ],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "pendingMessage" },
                    arguments: [
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "messageId" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "messageId" },
                        },
                      },
                    ],
                    directives: [],
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "status" },
                          arguments: [],
                          directives: [],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          loc: { start: 0, end: 117 },
        };
        t.loc.source = {
          body:
            "query GetPendingMessageByMessageId($messageId: String!) {\n  pendingMessage(messageId: $messageId) {\n    status\n  }\n}\n",
          name: "GraphQL request",
          locationOffset: { line: 1, column: 1 },
        };
        function n(e, t) {
          if ("FragmentSpread" === e.kind) t.add(e.name.value);
          else if ("VariableDefinition" === e.kind) {
            var r = e.type;
            "NamedType" === r.kind && t.add(r.name.value);
          }
          e.selectionSet &&
            e.selectionSet.selections.forEach(function (e) {
              n(e, t);
            }),
            e.variableDefinitions &&
              e.variableDefinitions.forEach(function (e) {
                n(e, t);
              }),
            e.definitions &&
              e.definitions.forEach(function (e) {
                n(e, t);
              });
        }
        var r = {};
        function i(e, t) {
          for (var n = 0; n < e.definitions.length; n++) {
            var r = e.definitions[n];
            if (r.name && r.name.value == t) return r;
          }
        }
        t.definitions.forEach(function (e) {
          if (e.name) {
            var t = new Set();
            n(e, t), (r[e.name.value] = t);
          }
        }),
          (e.exports = t),
          (e.exports.GetPendingMessageByMessageId = (function (e, t) {
            var n = { kind: e.kind, definitions: [i(e, t)] };
            e.hasOwnProperty("loc") && (n.loc = e.loc);
            var o = r[t] || new Set(),
              s = new Set(),
              a = new Set();
            for (
              o.forEach(function (e) {
                a.add(e);
              });
              a.size > 0;

            ) {
              var c = a;
              (a = new Set()),
                c.forEach(function (e) {
                  s.has(e) ||
                    (s.add(e),
                    (r[e] || new Set()).forEach(function (e) {
                      a.add(e);
                    }));
                });
            }
            return (
              s.forEach(function (t) {
                var r = i(e, t);
                r && n.definitions.push(r);
              }),
              n
            );
          })(t, "GetPendingMessageByMessageId"));
      },
      9120: (e) => {
        var t = {
          kind: "Document",
          definitions: [
            {
              kind: "OperationDefinition",
              operation: "mutation",
              name: { kind: "Name", value: "ProcessKeyCeremonyStep" },
              variableDefinitions: [
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "messageId" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
                {
                  kind: "VariableDefinition",
                  variable: {
                    kind: "Variable",
                    name: { kind: "Name", value: "signedData" },
                  },
                  type: {
                    kind: "NonNullType",
                    type: {
                      kind: "NamedType",
                      name: { kind: "Name", value: "String" },
                    },
                  },
                  directives: [],
                },
              ],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    name: { kind: "Name", value: "processKeyCeremonyStep" },
                    arguments: [
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "messageId" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "messageId" },
                        },
                      },
                      {
                        kind: "Argument",
                        name: { kind: "Name", value: "signedData" },
                        value: {
                          kind: "Variable",
                          name: { kind: "Name", value: "signedData" },
                        },
                      },
                    ],
                    directives: [],
                    selectionSet: {
                      kind: "SelectionSet",
                      selections: [
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "pendingMessage" },
                          arguments: [],
                          directives: [],
                          selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                              {
                                kind: "Field",
                                name: { kind: "Name", value: "signedData" },
                                arguments: [],
                                directives: [],
                              },
                            ],
                          },
                        },
                        {
                          kind: "Field",
                          name: { kind: "Name", value: "error" },
                          arguments: [],
                          directives: [],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          loc: { start: 0, end: 212 },
        };
        t.loc.source = {
          body:
            "mutation ProcessKeyCeremonyStep($messageId: String!, $signedData: String!) {\n  processKeyCeremonyStep(messageId: $messageId, signedData: $signedData) {\n    pendingMessage {\n      signedData\n    }\n    error\n  }\n}\n",
          name: "GraphQL request",
          locationOffset: { line: 1, column: 1 },
        };
        function n(e, t) {
          if ("FragmentSpread" === e.kind) t.add(e.name.value);
          else if ("VariableDefinition" === e.kind) {
            var r = e.type;
            "NamedType" === r.kind && t.add(r.name.value);
          }
          e.selectionSet &&
            e.selectionSet.selections.forEach(function (e) {
              n(e, t);
            }),
            e.variableDefinitions &&
              e.variableDefinitions.forEach(function (e) {
                n(e, t);
              }),
            e.definitions &&
              e.definitions.forEach(function (e) {
                n(e, t);
              });
        }
        var r = {};
        function i(e, t) {
          for (var n = 0; n < e.definitions.length; n++) {
            var r = e.definitions[n];
            if (r.name && r.name.value == t) return r;
          }
        }
        t.definitions.forEach(function (e) {
          if (e.name) {
            var t = new Set();
            n(e, t), (r[e.name.value] = t);
          }
        }),
          (e.exports = t),
          (e.exports.ProcessKeyCeremonyStep = (function (e, t) {
            var n = { kind: e.kind, definitions: [i(e, t)] };
            e.hasOwnProperty("loc") && (n.loc = e.loc);
            var o = r[t] || new Set(),
              s = new Set(),
              a = new Set();
            for (
              o.forEach(function (e) {
                a.add(e);
              });
              a.size > 0;

            ) {
              var c = a;
              (a = new Set()),
                c.forEach(function (e) {
                  s.has(e) ||
                    (s.add(e),
                    (r[e] || new Set()).forEach(function (e) {
                      a.add(e);
                    }));
                });
            }
            return (
              s.forEach(function (t) {
                var r = i(e, t);
                r && n.definitions.push(r);
              }),
              n
            );
          })(t, "ProcessKeyCeremonyStep"));
      },
      4119: (e, t, n) => {
        var r = n(8370).parse;
        function i(e) {
          return e.replace(/[\s,]+/g, " ").trim();
        }
        var o = {},
          s = {};
        var a = !0;
        function c(e, t) {
          var n = Object.prototype.toString.call(e);
          if ("[object Array]" === n)
            return e.map(function (e) {
              return c(e, t);
            });
          if ("[object Object]" !== n) throw new Error("Unexpected input.");
          t && e.loc && delete e.loc,
            e.loc && (delete e.loc.startToken, delete e.loc.endToken);
          var r,
            i,
            o,
            s = Object.keys(e);
          for (r in s)
            s.hasOwnProperty(r) &&
              ((i = e[s[r]]),
              ("[object Object]" !== (o = Object.prototype.toString.call(i)) &&
                "[object Array]" !== o) ||
                (e[s[r]] = c(i, !0)));
          return e;
        }
        var u = !1;
        function l(e) {
          var t = i(e);
          if (o[t]) return o[t];
          var n = r(e, { experimentalFragmentVariables: u });
          if (!n || "Document" !== n.kind)
            throw new Error("Not a valid GraphQL document.");
          return (
            (n = c(
              (n = (function (e) {
                for (
                  var t, n = {}, r = [], o = 0;
                  o < e.definitions.length;
                  o++
                ) {
                  var c = e.definitions[o];
                  if ("FragmentDefinition" === c.kind) {
                    var u = c.name.value,
                      l = i((t = c.loc).source.body.substring(t.start, t.end));
                    s.hasOwnProperty(u) && !s[u][l]
                      ? (a &&
                          console.warn(
                            "Warning: fragment with name " +
                              u +
                              " already exists.\ngraphql-tag enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://dev.apollodata.com/core/fragments.html#unique-names"
                          ),
                        (s[u][l] = !0))
                      : s.hasOwnProperty(u) || ((s[u] = {}), (s[u][l] = !0)),
                      n[l] || ((n[l] = !0), r.push(c));
                  } else r.push(c);
                }
                return (e.definitions = r), e;
              })(n)),
              !1
            )),
            (o[t] = n),
            n
          );
        }
        function f() {
          for (
            var e = Array.prototype.slice.call(arguments),
              t = e[0],
              n = "string" == typeof t ? t : t[0],
              r = 1;
            r < e.length;
            r++
          )
            e[r] && e[r].kind && "Document" === e[r].kind
              ? (n += e[r].loc.source.body)
              : (n += e[r]),
              (n += t[r]);
          return l(n);
        }
        (f.default = f),
          (f.resetCaches = function () {
            (o = {}), (s = {});
          }),
          (f.disableFragmentWarnings = function () {
            a = !1;
          }),
          (f.enableExperimentalFragmentVariables = function () {
            u = !0;
          }),
          (f.disableExperimentalFragmentVariables = function () {
            u = !1;
          }),
          (e.exports = f);
      },
      5822: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.printError = b),
          (t.GraphQLError = void 0);
        var r,
          i = (r = n(5690)) && r.__esModule ? r : { default: r },
          o = n(3098),
          s = n(9016),
          a = n(8038);
        function c(e) {
          return (c =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                })(e);
        }
        function u(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              "value" in r && (r.writable = !0),
              Object.defineProperty(e, r.key, r);
          }
        }
        function l(e, t) {
          return !t || ("object" !== c(t) && "function" != typeof t) ? f(e) : t;
        }
        function f(e) {
          if (void 0 === e)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return e;
        }
        function p(e) {
          var t = "function" == typeof Map ? new Map() : void 0;
          return (p = function (e) {
            if (
              null === e ||
              ((n = e),
              -1 === Function.toString.call(n).indexOf("[native code]"))
            )
              return e;
            var n;
            if ("function" != typeof e)
              throw new TypeError(
                "Super expression must either be null or a function"
              );
            if (void 0 !== t) {
              if (t.has(e)) return t.get(e);
              t.set(e, r);
            }
            function r() {
              return h(e, arguments, y(this).constructor);
            }
            return (
              (r.prototype = Object.create(e.prototype, {
                constructor: {
                  value: r,
                  enumerable: !1,
                  writable: !0,
                  configurable: !0,
                },
              })),
              v(r, e)
            );
          })(e);
        }
        function h(e, t, n) {
          return (h = d()
            ? Reflect.construct
            : function (e, t, n) {
                var r = [null];
                r.push.apply(r, t);
                var i = new (Function.bind.apply(e, r))();
                return n && v(i, n.prototype), i;
              }).apply(null, arguments);
        }
        function d() {
          if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ("function" == typeof Proxy) return !0;
          try {
            return (
              Date.prototype.toString.call(
                Reflect.construct(Date, [], function () {})
              ),
              !0
            );
          } catch (e) {
            return !1;
          }
        }
        function v(e, t) {
          return (v =
            Object.setPrototypeOf ||
            function (e, t) {
              return (e.__proto__ = t), e;
            })(e, t);
        }
        function y(e) {
          return (y = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              })(e);
        }
        var m = (function (e) {
          !(function (e, t) {
            if ("function" != typeof t && null !== t)
              throw new TypeError(
                "Super expression must either be null or a function"
              );
            (e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              t && v(e, t);
          })(h, e);
          var t,
            n,
            r,
            a,
            c,
            p =
              ((t = h),
              (n = d()),
              function () {
                var e,
                  r = y(t);
                if (n) {
                  var i = y(this).constructor;
                  e = Reflect.construct(r, arguments, i);
                } else e = r.apply(this, arguments);
                return l(this, e);
              });
          function h(e, t, n, r, o, a, c) {
            var u, d, v, y, m;
            !(function (e, t) {
              if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function");
            })(this, h),
              (m = p.call(this, e));
            var b,
              g = Array.isArray(t)
                ? 0 !== t.length
                  ? t
                  : void 0
                : t
                ? [t]
                : void 0,
              k = n;
            !k &&
              g &&
              (k = null === (b = g[0].loc) || void 0 === b ? void 0 : b.source);
            var E,
              T = r;
            !T &&
              g &&
              (T = g.reduce(function (e, t) {
                return t.loc && e.push(t.loc.start), e;
              }, [])),
              T && 0 === T.length && (T = void 0),
              r && n
                ? (E = r.map(function (e) {
                    return (0, s.getLocation)(n, e);
                  }))
                : g &&
                  (E = g.reduce(function (e, t) {
                    return (
                      t.loc &&
                        e.push((0, s.getLocation)(t.loc.source, t.loc.start)),
                      e
                    );
                  }, []));
            var S = c;
            if (null == S && null != a) {
              var w = a.extensions;
              (0, i.default)(w) && (S = w);
            }
            return (
              Object.defineProperties(f(m), {
                name: { value: "GraphQLError" },
                message: { value: e, enumerable: !0, writable: !0 },
                locations: {
                  value: null !== (u = E) && void 0 !== u ? u : void 0,
                  enumerable: null != E,
                },
                path: { value: null != o ? o : void 0, enumerable: null != o },
                nodes: { value: null != g ? g : void 0 },
                source: {
                  value: null !== (d = k) && void 0 !== d ? d : void 0,
                },
                positions: {
                  value: null !== (v = T) && void 0 !== v ? v : void 0,
                },
                originalError: { value: a },
                extensions: {
                  value: null !== (y = S) && void 0 !== y ? y : void 0,
                  enumerable: null != S,
                },
              }),
              (null == a ? void 0 : a.stack)
                ? (Object.defineProperty(f(m), "stack", {
                    value: a.stack,
                    writable: !0,
                    configurable: !0,
                  }),
                  l(m))
                : (Error.captureStackTrace
                    ? Error.captureStackTrace(f(m), h)
                    : Object.defineProperty(f(m), "stack", {
                        value: Error().stack,
                        writable: !0,
                        configurable: !0,
                      }),
                  m)
            );
          }
          return (
            (r = h),
            (a = [
              {
                key: "toString",
                value: function () {
                  return b(this);
                },
              },
              {
                key: o.SYMBOL_TO_STRING_TAG,
                get: function () {
                  return "Object";
                },
              },
            ]) && u(r.prototype, a),
            c && u(r, c),
            h
          );
        })(p(Error));
        function b(e) {
          var t = e.message;
          if (e.nodes)
            for (var n = 0, r = e.nodes; n < r.length; n++) {
              var i = r[n];
              i.loc && (t += "\n\n" + (0, a.printLocation)(i.loc));
            }
          else if (e.source && e.locations)
            for (var o = 0, s = e.locations; o < s.length; o++) {
              var c = s[o];
              t += "\n\n" + (0, a.printSourceLocation)(e.source, c);
            }
          return t;
        }
        t.GraphQLError = m;
      },
      338: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.syntaxError = function (e, t, n) {
            return new r.GraphQLError("Syntax Error: ".concat(n), void 0, e, [
              t,
            ]);
          });
        var r = n(5822);
      },
      972: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.prototype.toJSON;
            "function" == typeof t || (0, r.default)(0),
              (e.prototype.inspect = t),
              i.default && (e.prototype[i.default] = t);
          });
        var r = o(n(7706)),
          i = o(n(8554));
        function o(e) {
          return e && e.__esModule ? e : { default: e };
        }
      },
      7242: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            if (!Boolean(e)) throw new Error(t);
          });
      },
      8002: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return s(e, []);
          });
        var r,
          i = (r = n(8554)) && r.__esModule ? r : { default: r };
        function o(e) {
          return (o =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                })(e);
        }
        function s(e, t) {
          switch (o(e)) {
            case "string":
              return JSON.stringify(e);
            case "function":
              return e.name ? "[function ".concat(e.name, "]") : "[function]";
            case "object":
              return null === e
                ? "null"
                : (function (e, t) {
                    if (-1 !== t.indexOf(e)) return "[Circular]";
                    var n = [].concat(t, [e]),
                      r = (function (e) {
                        var t = e[String(i.default)];
                        if ("function" == typeof t) return t;
                        if ("function" == typeof e.inspect) return e.inspect;
                      })(e);
                    if (void 0 !== r) {
                      var o = r.call(e);
                      if (o !== e) return "string" == typeof o ? o : s(o, n);
                    } else if (Array.isArray(e))
                      return (function (e, t) {
                        if (0 === e.length) return "[]";
                        if (t.length > 2) return "[Array]";
                        for (
                          var n = Math.min(10, e.length),
                            r = e.length - n,
                            i = [],
                            o = 0;
                          o < n;
                          ++o
                        )
                          i.push(s(e[o], t));
                        1 === r
                          ? i.push("... 1 more item")
                          : r > 1 && i.push("... ".concat(r, " more items"));
                        return "[" + i.join(", ") + "]";
                      })(e, n);
                    return (function (e, t) {
                      var n = Object.keys(e);
                      if (0 === n.length) return "{}";
                      if (t.length > 2)
                        return (
                          "[" +
                          (function (e) {
                            var t = Object.prototype.toString
                              .call(e)
                              .replace(/^\[object /, "")
                              .replace(/]$/, "");
                            if (
                              "Object" === t &&
                              "function" == typeof e.constructor
                            ) {
                              var n = e.constructor.name;
                              if ("string" == typeof n && "" !== n) return n;
                            }
                            return t;
                          })(e) +
                          "]"
                        );
                      return (
                        "{ " +
                        n
                          .map(function (n) {
                            return n + ": " + s(e[n], t);
                          })
                          .join(", ") +
                        " }"
                      );
                    })(e, n);
                  })(e, t);
            default:
              return String(e);
          }
        }
      },
      5752: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var n = function (e, t) {
          return e instanceof t;
        };
        t.default = n;
      },
      7706: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            if (!Boolean(e))
              throw new Error(
                null != t ? t : "Unexpected invariant triggered."
              );
          });
      },
      5690: (e, t) => {
        "use strict";
        function n(e) {
          return (n =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                })(e);
        }
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return "object" == n(e) && null !== e;
          });
      },
      8554: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var n =
          "function" == typeof Symbol && "function" == typeof Symbol.for
            ? Symbol.for("nodejs.util.inspect.custom")
            : void 0;
        t.default = n;
      },
      1807: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.isNode = function (e) {
            return null != e && "string" == typeof e.kind;
          }),
          (t.Token = t.Location = void 0);
        var r,
          i = (r = n(972)) && r.__esModule ? r : { default: r };
        var o = (function () {
          function e(e, t, n) {
            (this.start = e.start),
              (this.end = t.end),
              (this.startToken = e),
              (this.endToken = t),
              (this.source = n);
          }
          return (
            (e.prototype.toJSON = function () {
              return { start: this.start, end: this.end };
            }),
            e
          );
        })();
        (t.Location = o), (0, i.default)(o);
        var s = (function () {
          function e(e, t, n, r, i, o, s) {
            (this.kind = e),
              (this.start = t),
              (this.end = n),
              (this.line = r),
              (this.column = i),
              (this.value = s),
              (this.prev = o),
              (this.next = null);
          }
          return (
            (e.prototype.toJSON = function () {
              return {
                kind: this.kind,
                value: this.value,
                line: this.line,
                column: this.column,
              };
            }),
            e
          );
        })();
        (t.Token = s), (0, i.default)(s);
      },
      849: (e, t) => {
        "use strict";
        function n(e) {
          for (var t = 0; t < e.length; ++t)
            if (" " !== e[t] && "\t" !== e[t]) return !1;
          return !0;
        }
        function r(e) {
          for (var t, n = !0, r = !0, i = 0, o = null, s = 0; s < e.length; ++s)
            switch (e.charCodeAt(s)) {
              case 13:
                10 === e.charCodeAt(s + 1) && ++s;
              case 10:
                (n = !1), (r = !0), (i = 0);
                break;
              case 9:
              case 32:
                ++i;
                break;
              default:
                r && !n && (null === o || i < o) && (o = i), (r = !1);
            }
          return null !== (t = o) && void 0 !== t ? t : 0;
        }
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.dedentBlockStringValue = function (e) {
            var t = e.split(/\r\n|[\n\r]/g),
              i = r(e);
            if (0 !== i)
              for (var o = 1; o < t.length; o++) t[o] = t[o].slice(i);
            var s = 0;
            for (; s < t.length && n(t[s]); ) ++s;
            var a = t.length;
            for (; a > s && n(t[a - 1]); ) --a;
            return t.slice(s, a).join("\n");
          }),
          (t.getBlockStringIndentation = r),
          (t.printBlockString = function (e) {
            var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : "",
              n =
                arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
              r = -1 === e.indexOf("\n"),
              i = " " === e[0] || "\t" === e[0],
              o = '"' === e[e.length - 1],
              s = "\\" === e[e.length - 1],
              a = !r || o || s || n,
              c = "";
            !a || (r && i) || (c += "\n" + t);
            (c += t ? e.replace(/\n/g, "\n" + t) : e), a && (c += "\n");
            return '"""' + c.replace(/"""/g, '\\"""') + '"""';
          });
      },
      8333: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.DirectiveLocation = void 0);
        var n = Object.freeze({
          QUERY: "QUERY",
          MUTATION: "MUTATION",
          SUBSCRIPTION: "SUBSCRIPTION",
          FIELD: "FIELD",
          FRAGMENT_DEFINITION: "FRAGMENT_DEFINITION",
          FRAGMENT_SPREAD: "FRAGMENT_SPREAD",
          INLINE_FRAGMENT: "INLINE_FRAGMENT",
          VARIABLE_DEFINITION: "VARIABLE_DEFINITION",
          SCHEMA: "SCHEMA",
          SCALAR: "SCALAR",
          OBJECT: "OBJECT",
          FIELD_DEFINITION: "FIELD_DEFINITION",
          ARGUMENT_DEFINITION: "ARGUMENT_DEFINITION",
          INTERFACE: "INTERFACE",
          UNION: "UNION",
          ENUM: "ENUM",
          ENUM_VALUE: "ENUM_VALUE",
          INPUT_OBJECT: "INPUT_OBJECT",
          INPUT_FIELD_DEFINITION: "INPUT_FIELD_DEFINITION",
        });
        t.DirectiveLocation = n;
      },
      2828: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.Kind = void 0);
        var n = Object.freeze({
          NAME: "Name",
          DOCUMENT: "Document",
          OPERATION_DEFINITION: "OperationDefinition",
          VARIABLE_DEFINITION: "VariableDefinition",
          SELECTION_SET: "SelectionSet",
          FIELD: "Field",
          ARGUMENT: "Argument",
          FRAGMENT_SPREAD: "FragmentSpread",
          INLINE_FRAGMENT: "InlineFragment",
          FRAGMENT_DEFINITION: "FragmentDefinition",
          VARIABLE: "Variable",
          INT: "IntValue",
          FLOAT: "FloatValue",
          STRING: "StringValue",
          BOOLEAN: "BooleanValue",
          NULL: "NullValue",
          ENUM: "EnumValue",
          LIST: "ListValue",
          OBJECT: "ObjectValue",
          OBJECT_FIELD: "ObjectField",
          DIRECTIVE: "Directive",
          NAMED_TYPE: "NamedType",
          LIST_TYPE: "ListType",
          NON_NULL_TYPE: "NonNullType",
          SCHEMA_DEFINITION: "SchemaDefinition",
          OPERATION_TYPE_DEFINITION: "OperationTypeDefinition",
          SCALAR_TYPE_DEFINITION: "ScalarTypeDefinition",
          OBJECT_TYPE_DEFINITION: "ObjectTypeDefinition",
          FIELD_DEFINITION: "FieldDefinition",
          INPUT_VALUE_DEFINITION: "InputValueDefinition",
          INTERFACE_TYPE_DEFINITION: "InterfaceTypeDefinition",
          UNION_TYPE_DEFINITION: "UnionTypeDefinition",
          ENUM_TYPE_DEFINITION: "EnumTypeDefinition",
          ENUM_VALUE_DEFINITION: "EnumValueDefinition",
          INPUT_OBJECT_TYPE_DEFINITION: "InputObjectTypeDefinition",
          DIRECTIVE_DEFINITION: "DirectiveDefinition",
          SCHEMA_EXTENSION: "SchemaExtension",
          SCALAR_TYPE_EXTENSION: "ScalarTypeExtension",
          OBJECT_TYPE_EXTENSION: "ObjectTypeExtension",
          INTERFACE_TYPE_EXTENSION: "InterfaceTypeExtension",
          UNION_TYPE_EXTENSION: "UnionTypeExtension",
          ENUM_TYPE_EXTENSION: "EnumTypeExtension",
          INPUT_OBJECT_TYPE_EXTENSION: "InputObjectTypeExtension",
        });
        t.Kind = n;
      },
      4274: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.isPunctuatorTokenKind = function (e) {
            return (
              e === o.TokenKind.BANG ||
              e === o.TokenKind.DOLLAR ||
              e === o.TokenKind.AMP ||
              e === o.TokenKind.PAREN_L ||
              e === o.TokenKind.PAREN_R ||
              e === o.TokenKind.SPREAD ||
              e === o.TokenKind.COLON ||
              e === o.TokenKind.EQUALS ||
              e === o.TokenKind.AT ||
              e === o.TokenKind.BRACKET_L ||
              e === o.TokenKind.BRACKET_R ||
              e === o.TokenKind.BRACE_L ||
              e === o.TokenKind.PIPE ||
              e === o.TokenKind.BRACE_R
            );
          }),
          (t.Lexer = void 0);
        var r = n(338),
          i = n(1807),
          o = n(3175),
          s = n(849),
          a = (function () {
            function e(e) {
              var t = new i.Token(o.TokenKind.SOF, 0, 0, 0, 0, null);
              (this.source = e),
                (this.lastToken = t),
                (this.token = t),
                (this.line = 1),
                (this.lineStart = 0);
            }
            var t = e.prototype;
            return (
              (t.advance = function () {
                return (
                  (this.lastToken = this.token), (this.token = this.lookahead())
                );
              }),
              (t.lookahead = function () {
                var e = this.token;
                if (e.kind !== o.TokenKind.EOF)
                  do {
                    var t;
                    e =
                      null !== (t = e.next) && void 0 !== t
                        ? t
                        : (e.next = u(this, e));
                  } while (e.kind === o.TokenKind.COMMENT);
                return e;
              }),
              e
            );
          })();
        function c(e) {
          return isNaN(e)
            ? o.TokenKind.EOF
            : e < 127
            ? JSON.stringify(String.fromCharCode(e))
            : '"\\u'.concat(
                ("00" + e.toString(16).toUpperCase()).slice(-4),
                '"'
              );
        }
        function u(e, t) {
          for (var n = e.source, s = n.body, a = s.length, c = t.end; c < a; ) {
            var u = s.charCodeAt(c),
              h = e.line,
              y = 1 + c - e.lineStart;
            switch (u) {
              case 65279:
              case 9:
              case 32:
              case 44:
                ++c;
                continue;
              case 10:
                ++c, ++e.line, (e.lineStart = c);
                continue;
              case 13:
                10 === s.charCodeAt(c + 1) ? (c += 2) : ++c,
                  ++e.line,
                  (e.lineStart = c);
                continue;
              case 33:
                return new i.Token(o.TokenKind.BANG, c, c + 1, h, y, t);
              case 35:
                return f(n, c, h, y, t);
              case 36:
                return new i.Token(o.TokenKind.DOLLAR, c, c + 1, h, y, t);
              case 38:
                return new i.Token(o.TokenKind.AMP, c, c + 1, h, y, t);
              case 40:
                return new i.Token(o.TokenKind.PAREN_L, c, c + 1, h, y, t);
              case 41:
                return new i.Token(o.TokenKind.PAREN_R, c, c + 1, h, y, t);
              case 46:
                if (46 === s.charCodeAt(c + 1) && 46 === s.charCodeAt(c + 2))
                  return new i.Token(o.TokenKind.SPREAD, c, c + 3, h, y, t);
                break;
              case 58:
                return new i.Token(o.TokenKind.COLON, c, c + 1, h, y, t);
              case 61:
                return new i.Token(o.TokenKind.EQUALS, c, c + 1, h, y, t);
              case 64:
                return new i.Token(o.TokenKind.AT, c, c + 1, h, y, t);
              case 91:
                return new i.Token(o.TokenKind.BRACKET_L, c, c + 1, h, y, t);
              case 93:
                return new i.Token(o.TokenKind.BRACKET_R, c, c + 1, h, y, t);
              case 123:
                return new i.Token(o.TokenKind.BRACE_L, c, c + 1, h, y, t);
              case 124:
                return new i.Token(o.TokenKind.PIPE, c, c + 1, h, y, t);
              case 125:
                return new i.Token(o.TokenKind.BRACE_R, c, c + 1, h, y, t);
              case 34:
                return 34 === s.charCodeAt(c + 1) && 34 === s.charCodeAt(c + 2)
                  ? v(n, c, h, y, t, e)
                  : d(n, c, h, y, t);
              case 45:
              case 48:
              case 49:
              case 50:
              case 51:
              case 52:
              case 53:
              case 54:
              case 55:
              case 56:
              case 57:
                return p(n, c, u, h, y, t);
              case 65:
              case 66:
              case 67:
              case 68:
              case 69:
              case 70:
              case 71:
              case 72:
              case 73:
              case 74:
              case 75:
              case 76:
              case 77:
              case 78:
              case 79:
              case 80:
              case 81:
              case 82:
              case 83:
              case 84:
              case 85:
              case 86:
              case 87:
              case 88:
              case 89:
              case 90:
              case 95:
              case 97:
              case 98:
              case 99:
              case 100:
              case 101:
              case 102:
              case 103:
              case 104:
              case 105:
              case 106:
              case 107:
              case 108:
              case 109:
              case 110:
              case 111:
              case 112:
              case 113:
              case 114:
              case 115:
              case 116:
              case 117:
              case 118:
              case 119:
              case 120:
              case 121:
              case 122:
                return m(n, c, h, y, t);
            }
            throw (0, r.syntaxError)(n, c, l(u));
          }
          var b = e.line,
            g = 1 + c - e.lineStart;
          return new i.Token(o.TokenKind.EOF, a, a, b, g, t);
        }
        function l(e) {
          return e < 32 && 9 !== e && 10 !== e && 13 !== e
            ? "Cannot contain the invalid character ".concat(c(e), ".")
            : 39 === e
            ? "Unexpected single quote character ('), did you mean to use a double quote (\")?"
            : "Cannot parse the unexpected character ".concat(c(e), ".");
        }
        function f(e, t, n, r, s) {
          var a,
            c = e.body,
            u = t;
          do {
            a = c.charCodeAt(++u);
          } while (!isNaN(a) && (a > 31 || 9 === a));
          return new i.Token(
            o.TokenKind.COMMENT,
            t,
            u,
            n,
            r,
            s,
            c.slice(t + 1, u)
          );
        }
        function p(e, t, n, s, a, u) {
          var l = e.body,
            f = n,
            p = t,
            d = !1;
          if ((45 === f && (f = l.charCodeAt(++p)), 48 === f)) {
            if ((f = l.charCodeAt(++p)) >= 48 && f <= 57)
              throw (0, r.syntaxError)(
                e,
                p,
                "Invalid number, unexpected digit after 0: ".concat(c(f), ".")
              );
          } else (p = h(e, p, f)), (f = l.charCodeAt(p));
          if (
            (46 === f &&
              ((d = !0),
              (f = l.charCodeAt(++p)),
              (p = h(e, p, f)),
              (f = l.charCodeAt(p))),
            (69 !== f && 101 !== f) ||
              ((d = !0),
              (43 !== (f = l.charCodeAt(++p)) && 45 !== f) ||
                (f = l.charCodeAt(++p)),
              (p = h(e, p, f)),
              (f = l.charCodeAt(p))),
            46 === f ||
              (function (e) {
                return (
                  95 === e || (e >= 65 && e <= 90) || (e >= 97 && e <= 122)
                );
              })(f))
          )
            throw (0, r.syntaxError)(
              e,
              p,
              "Invalid number, expected digit but got: ".concat(c(f), ".")
            );
          return new i.Token(
            d ? o.TokenKind.FLOAT : o.TokenKind.INT,
            t,
            p,
            s,
            a,
            u,
            l.slice(t, p)
          );
        }
        function h(e, t, n) {
          var i = e.body,
            o = t,
            s = n;
          if (s >= 48 && s <= 57) {
            do {
              s = i.charCodeAt(++o);
            } while (s >= 48 && s <= 57);
            return o;
          }
          throw (0, r.syntaxError)(
            e,
            o,
            "Invalid number, expected digit but got: ".concat(c(s), ".")
          );
        }
        function d(e, t, n, s, a) {
          for (
            var u, l, f, p, h = e.body, d = t + 1, v = d, m = 0, b = "";
            d < h.length &&
            !isNaN((m = h.charCodeAt(d))) &&
            10 !== m &&
            13 !== m;

          ) {
            if (34 === m)
              return (
                (b += h.slice(v, d)),
                new i.Token(o.TokenKind.STRING, t, d + 1, n, s, a, b)
              );
            if (m < 32 && 9 !== m)
              throw (0, r.syntaxError)(
                e,
                d,
                "Invalid character within String: ".concat(c(m), ".")
              );
            if ((++d, 92 === m)) {
              switch (((b += h.slice(v, d - 1)), (m = h.charCodeAt(d)))) {
                case 34:
                  b += '"';
                  break;
                case 47:
                  b += "/";
                  break;
                case 92:
                  b += "\\";
                  break;
                case 98:
                  b += "\b";
                  break;
                case 102:
                  b += "\f";
                  break;
                case 110:
                  b += "\n";
                  break;
                case 114:
                  b += "\r";
                  break;
                case 116:
                  b += "\t";
                  break;
                case 117:
                  var g =
                    ((u = h.charCodeAt(d + 1)),
                    (l = h.charCodeAt(d + 2)),
                    (f = h.charCodeAt(d + 3)),
                    (p = h.charCodeAt(d + 4)),
                    (y(u) << 12) | (y(l) << 8) | (y(f) << 4) | y(p));
                  if (g < 0) {
                    var k = h.slice(d + 1, d + 5);
                    throw (0, r.syntaxError)(
                      e,
                      d,
                      "Invalid character escape sequence: \\u".concat(k, ".")
                    );
                  }
                  (b += String.fromCharCode(g)), (d += 4);
                  break;
                default:
                  throw (0, r.syntaxError)(
                    e,
                    d,
                    "Invalid character escape sequence: \\".concat(
                      String.fromCharCode(m),
                      "."
                    )
                  );
              }
              v = ++d;
            }
          }
          throw (0, r.syntaxError)(e, d, "Unterminated string.");
        }
        function v(e, t, n, a, u, l) {
          for (
            var f = e.body, p = t + 3, h = p, d = 0, v = "";
            p < f.length && !isNaN((d = f.charCodeAt(p)));

          ) {
            if (
              34 === d &&
              34 === f.charCodeAt(p + 1) &&
              34 === f.charCodeAt(p + 2)
            )
              return (
                (v += f.slice(h, p)),
                new i.Token(
                  o.TokenKind.BLOCK_STRING,
                  t,
                  p + 3,
                  n,
                  a,
                  u,
                  (0, s.dedentBlockStringValue)(v)
                )
              );
            if (d < 32 && 9 !== d && 10 !== d && 13 !== d)
              throw (0, r.syntaxError)(
                e,
                p,
                "Invalid character within String: ".concat(c(d), ".")
              );
            10 === d
              ? (++p, ++l.line, (l.lineStart = p))
              : 13 === d
              ? (10 === f.charCodeAt(p + 1) ? (p += 2) : ++p,
                ++l.line,
                (l.lineStart = p))
              : 92 === d &&
                34 === f.charCodeAt(p + 1) &&
                34 === f.charCodeAt(p + 2) &&
                34 === f.charCodeAt(p + 3)
              ? ((v += f.slice(h, p) + '"""'), (h = p += 4))
              : ++p;
          }
          throw (0, r.syntaxError)(e, p, "Unterminated string.");
        }
        function y(e) {
          return e >= 48 && e <= 57
            ? e - 48
            : e >= 65 && e <= 70
            ? e - 55
            : e >= 97 && e <= 102
            ? e - 87
            : -1;
        }
        function m(e, t, n, r, s) {
          for (
            var a = e.body, c = a.length, u = t + 1, l = 0;
            u !== c &&
            !isNaN((l = a.charCodeAt(u))) &&
            (95 === l ||
              (l >= 48 && l <= 57) ||
              (l >= 65 && l <= 90) ||
              (l >= 97 && l <= 122));

          )
            ++u;
          return new i.Token(o.TokenKind.NAME, t, u, n, r, s, a.slice(t, u));
        }
        t.Lexer = a;
      },
      9016: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.getLocation = function (e, t) {
            var n,
              r = /\r\n|[\n\r]/g,
              i = 1,
              o = t + 1;
            for (; (n = r.exec(e.body)) && n.index < t; )
              (i += 1), (o = t + 1 - (n.index + n[0].length));
            return { line: i, column: o };
          });
      },
      8370: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.parse = function (e, t) {
            return new l(e, t).parseDocument();
          }),
          (t.parseValue = function (e, t) {
            var n = new l(e, t);
            n.expectToken(s.TokenKind.SOF);
            var r = n.parseValueLiteral(!1);
            return n.expectToken(s.TokenKind.EOF), r;
          }),
          (t.parseType = function (e, t) {
            var n = new l(e, t);
            n.expectToken(s.TokenKind.SOF);
            var r = n.parseTypeReference();
            return n.expectToken(s.TokenKind.EOF), r;
          }),
          (t.Parser = void 0);
        var r = n(338),
          i = n(2828),
          o = n(1807),
          s = n(3175),
          a = n(2412),
          c = n(8333),
          u = n(4274);
        var l = (function () {
          function e(e, t) {
            var n = (0, a.isSource)(e) ? e : new a.Source(e);
            (this._lexer = new u.Lexer(n)), (this._options = t);
          }
          var t = e.prototype;
          return (
            (t.parseName = function () {
              var e = this.expectToken(s.TokenKind.NAME);
              return { kind: i.Kind.NAME, value: e.value, loc: this.loc(e) };
            }),
            (t.parseDocument = function () {
              var e = this._lexer.token;
              return {
                kind: i.Kind.DOCUMENT,
                definitions: this.many(
                  s.TokenKind.SOF,
                  this.parseDefinition,
                  s.TokenKind.EOF
                ),
                loc: this.loc(e),
              };
            }),
            (t.parseDefinition = function () {
              if (this.peek(s.TokenKind.NAME))
                switch (this._lexer.token.value) {
                  case "query":
                  case "mutation":
                  case "subscription":
                    return this.parseOperationDefinition();
                  case "fragment":
                    return this.parseFragmentDefinition();
                  case "schema":
                  case "scalar":
                  case "type":
                  case "interface":
                  case "union":
                  case "enum":
                  case "input":
                  case "directive":
                    return this.parseTypeSystemDefinition();
                  case "extend":
                    return this.parseTypeSystemExtension();
                }
              else {
                if (this.peek(s.TokenKind.BRACE_L))
                  return this.parseOperationDefinition();
                if (this.peekDescription())
                  return this.parseTypeSystemDefinition();
              }
              throw this.unexpected();
            }),
            (t.parseOperationDefinition = function () {
              var e = this._lexer.token;
              if (this.peek(s.TokenKind.BRACE_L))
                return {
                  kind: i.Kind.OPERATION_DEFINITION,
                  operation: "query",
                  name: void 0,
                  variableDefinitions: [],
                  directives: [],
                  selectionSet: this.parseSelectionSet(),
                  loc: this.loc(e),
                };
              var t,
                n = this.parseOperationType();
              return (
                this.peek(s.TokenKind.NAME) && (t = this.parseName()),
                {
                  kind: i.Kind.OPERATION_DEFINITION,
                  operation: n,
                  name: t,
                  variableDefinitions: this.parseVariableDefinitions(),
                  directives: this.parseDirectives(!1),
                  selectionSet: this.parseSelectionSet(),
                  loc: this.loc(e),
                }
              );
            }),
            (t.parseOperationType = function () {
              var e = this.expectToken(s.TokenKind.NAME);
              switch (e.value) {
                case "query":
                  return "query";
                case "mutation":
                  return "mutation";
                case "subscription":
                  return "subscription";
              }
              throw this.unexpected(e);
            }),
            (t.parseVariableDefinitions = function () {
              return this.optionalMany(
                s.TokenKind.PAREN_L,
                this.parseVariableDefinition,
                s.TokenKind.PAREN_R
              );
            }),
            (t.parseVariableDefinition = function () {
              var e = this._lexer.token;
              return {
                kind: i.Kind.VARIABLE_DEFINITION,
                variable: this.parseVariable(),
                type:
                  (this.expectToken(s.TokenKind.COLON),
                  this.parseTypeReference()),
                defaultValue: this.expectOptionalToken(s.TokenKind.EQUALS)
                  ? this.parseValueLiteral(!0)
                  : void 0,
                directives: this.parseDirectives(!0),
                loc: this.loc(e),
              };
            }),
            (t.parseVariable = function () {
              var e = this._lexer.token;
              return (
                this.expectToken(s.TokenKind.DOLLAR),
                {
                  kind: i.Kind.VARIABLE,
                  name: this.parseName(),
                  loc: this.loc(e),
                }
              );
            }),
            (t.parseSelectionSet = function () {
              var e = this._lexer.token;
              return {
                kind: i.Kind.SELECTION_SET,
                selections: this.many(
                  s.TokenKind.BRACE_L,
                  this.parseSelection,
                  s.TokenKind.BRACE_R
                ),
                loc: this.loc(e),
              };
            }),
            (t.parseSelection = function () {
              return this.peek(s.TokenKind.SPREAD)
                ? this.parseFragment()
                : this.parseField();
            }),
            (t.parseField = function () {
              var e,
                t,
                n = this._lexer.token,
                r = this.parseName();
              return (
                this.expectOptionalToken(s.TokenKind.COLON)
                  ? ((e = r), (t = this.parseName()))
                  : (t = r),
                {
                  kind: i.Kind.FIELD,
                  alias: e,
                  name: t,
                  arguments: this.parseArguments(!1),
                  directives: this.parseDirectives(!1),
                  selectionSet: this.peek(s.TokenKind.BRACE_L)
                    ? this.parseSelectionSet()
                    : void 0,
                  loc: this.loc(n),
                }
              );
            }),
            (t.parseArguments = function (e) {
              var t = e ? this.parseConstArgument : this.parseArgument;
              return this.optionalMany(
                s.TokenKind.PAREN_L,
                t,
                s.TokenKind.PAREN_R
              );
            }),
            (t.parseArgument = function () {
              var e = this._lexer.token,
                t = this.parseName();
              return (
                this.expectToken(s.TokenKind.COLON),
                {
                  kind: i.Kind.ARGUMENT,
                  name: t,
                  value: this.parseValueLiteral(!1),
                  loc: this.loc(e),
                }
              );
            }),
            (t.parseConstArgument = function () {
              var e = this._lexer.token;
              return {
                kind: i.Kind.ARGUMENT,
                name: this.parseName(),
                value:
                  (this.expectToken(s.TokenKind.COLON),
                  this.parseValueLiteral(!0)),
                loc: this.loc(e),
              };
            }),
            (t.parseFragment = function () {
              var e = this._lexer.token;
              this.expectToken(s.TokenKind.SPREAD);
              var t = this.expectOptionalKeyword("on");
              return !t && this.peek(s.TokenKind.NAME)
                ? {
                    kind: i.Kind.FRAGMENT_SPREAD,
                    name: this.parseFragmentName(),
                    directives: this.parseDirectives(!1),
                    loc: this.loc(e),
                  }
                : {
                    kind: i.Kind.INLINE_FRAGMENT,
                    typeCondition: t ? this.parseNamedType() : void 0,
                    directives: this.parseDirectives(!1),
                    selectionSet: this.parseSelectionSet(),
                    loc: this.loc(e),
                  };
            }),
            (t.parseFragmentDefinition = function () {
              var e,
                t = this._lexer.token;
              return (
                this.expectKeyword("fragment"),
                !0 ===
                (null === (e = this._options) || void 0 === e
                  ? void 0
                  : e.experimentalFragmentVariables)
                  ? {
                      kind: i.Kind.FRAGMENT_DEFINITION,
                      name: this.parseFragmentName(),
                      variableDefinitions: this.parseVariableDefinitions(),
                      typeCondition:
                        (this.expectKeyword("on"), this.parseNamedType()),
                      directives: this.parseDirectives(!1),
                      selectionSet: this.parseSelectionSet(),
                      loc: this.loc(t),
                    }
                  : {
                      kind: i.Kind.FRAGMENT_DEFINITION,
                      name: this.parseFragmentName(),
                      typeCondition:
                        (this.expectKeyword("on"), this.parseNamedType()),
                      directives: this.parseDirectives(!1),
                      selectionSet: this.parseSelectionSet(),
                      loc: this.loc(t),
                    }
              );
            }),
            (t.parseFragmentName = function () {
              if ("on" === this._lexer.token.value) throw this.unexpected();
              return this.parseName();
            }),
            (t.parseValueLiteral = function (e) {
              var t = this._lexer.token;
              switch (t.kind) {
                case s.TokenKind.BRACKET_L:
                  return this.parseList(e);
                case s.TokenKind.BRACE_L:
                  return this.parseObject(e);
                case s.TokenKind.INT:
                  return (
                    this._lexer.advance(),
                    { kind: i.Kind.INT, value: t.value, loc: this.loc(t) }
                  );
                case s.TokenKind.FLOAT:
                  return (
                    this._lexer.advance(),
                    { kind: i.Kind.FLOAT, value: t.value, loc: this.loc(t) }
                  );
                case s.TokenKind.STRING:
                case s.TokenKind.BLOCK_STRING:
                  return this.parseStringLiteral();
                case s.TokenKind.NAME:
                  switch ((this._lexer.advance(), t.value)) {
                    case "true":
                      return {
                        kind: i.Kind.BOOLEAN,
                        value: !0,
                        loc: this.loc(t),
                      };
                    case "false":
                      return {
                        kind: i.Kind.BOOLEAN,
                        value: !1,
                        loc: this.loc(t),
                      };
                    case "null":
                      return { kind: i.Kind.NULL, loc: this.loc(t) };
                    default:
                      return {
                        kind: i.Kind.ENUM,
                        value: t.value,
                        loc: this.loc(t),
                      };
                  }
                case s.TokenKind.DOLLAR:
                  if (!e) return this.parseVariable();
              }
              throw this.unexpected();
            }),
            (t.parseStringLiteral = function () {
              var e = this._lexer.token;
              return (
                this._lexer.advance(),
                {
                  kind: i.Kind.STRING,
                  value: e.value,
                  block: e.kind === s.TokenKind.BLOCK_STRING,
                  loc: this.loc(e),
                }
              );
            }),
            (t.parseList = function (e) {
              var t = this,
                n = this._lexer.token;
              return {
                kind: i.Kind.LIST,
                values: this.any(
                  s.TokenKind.BRACKET_L,
                  function () {
                    return t.parseValueLiteral(e);
                  },
                  s.TokenKind.BRACKET_R
                ),
                loc: this.loc(n),
              };
            }),
            (t.parseObject = function (e) {
              var t = this,
                n = this._lexer.token;
              return {
                kind: i.Kind.OBJECT,
                fields: this.any(
                  s.TokenKind.BRACE_L,
                  function () {
                    return t.parseObjectField(e);
                  },
                  s.TokenKind.BRACE_R
                ),
                loc: this.loc(n),
              };
            }),
            (t.parseObjectField = function (e) {
              var t = this._lexer.token,
                n = this.parseName();
              return (
                this.expectToken(s.TokenKind.COLON),
                {
                  kind: i.Kind.OBJECT_FIELD,
                  name: n,
                  value: this.parseValueLiteral(e),
                  loc: this.loc(t),
                }
              );
            }),
            (t.parseDirectives = function (e) {
              for (var t = []; this.peek(s.TokenKind.AT); )
                t.push(this.parseDirective(e));
              return t;
            }),
            (t.parseDirective = function (e) {
              var t = this._lexer.token;
              return (
                this.expectToken(s.TokenKind.AT),
                {
                  kind: i.Kind.DIRECTIVE,
                  name: this.parseName(),
                  arguments: this.parseArguments(e),
                  loc: this.loc(t),
                }
              );
            }),
            (t.parseTypeReference = function () {
              var e,
                t = this._lexer.token;
              return (
                this.expectOptionalToken(s.TokenKind.BRACKET_L)
                  ? ((e = this.parseTypeReference()),
                    this.expectToken(s.TokenKind.BRACKET_R),
                    (e = { kind: i.Kind.LIST_TYPE, type: e, loc: this.loc(t) }))
                  : (e = this.parseNamedType()),
                this.expectOptionalToken(s.TokenKind.BANG)
                  ? { kind: i.Kind.NON_NULL_TYPE, type: e, loc: this.loc(t) }
                  : e
              );
            }),
            (t.parseNamedType = function () {
              var e = this._lexer.token;
              return {
                kind: i.Kind.NAMED_TYPE,
                name: this.parseName(),
                loc: this.loc(e),
              };
            }),
            (t.parseTypeSystemDefinition = function () {
              var e = this.peekDescription()
                ? this._lexer.lookahead()
                : this._lexer.token;
              if (e.kind === s.TokenKind.NAME)
                switch (e.value) {
                  case "schema":
                    return this.parseSchemaDefinition();
                  case "scalar":
                    return this.parseScalarTypeDefinition();
                  case "type":
                    return this.parseObjectTypeDefinition();
                  case "interface":
                    return this.parseInterfaceTypeDefinition();
                  case "union":
                    return this.parseUnionTypeDefinition();
                  case "enum":
                    return this.parseEnumTypeDefinition();
                  case "input":
                    return this.parseInputObjectTypeDefinition();
                  case "directive":
                    return this.parseDirectiveDefinition();
                }
              throw this.unexpected(e);
            }),
            (t.peekDescription = function () {
              return (
                this.peek(s.TokenKind.STRING) ||
                this.peek(s.TokenKind.BLOCK_STRING)
              );
            }),
            (t.parseDescription = function () {
              if (this.peekDescription()) return this.parseStringLiteral();
            }),
            (t.parseSchemaDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("schema");
              var n = this.parseDirectives(!0),
                r = this.many(
                  s.TokenKind.BRACE_L,
                  this.parseOperationTypeDefinition,
                  s.TokenKind.BRACE_R
                );
              return {
                kind: i.Kind.SCHEMA_DEFINITION,
                description: t,
                directives: n,
                operationTypes: r,
                loc: this.loc(e),
              };
            }),
            (t.parseOperationTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseOperationType();
              this.expectToken(s.TokenKind.COLON);
              var n = this.parseNamedType();
              return {
                kind: i.Kind.OPERATION_TYPE_DEFINITION,
                operation: t,
                type: n,
                loc: this.loc(e),
              };
            }),
            (t.parseScalarTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("scalar");
              var n = this.parseName(),
                r = this.parseDirectives(!0);
              return {
                kind: i.Kind.SCALAR_TYPE_DEFINITION,
                description: t,
                name: n,
                directives: r,
                loc: this.loc(e),
              };
            }),
            (t.parseObjectTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("type");
              var n = this.parseName(),
                r = this.parseImplementsInterfaces(),
                o = this.parseDirectives(!0),
                s = this.parseFieldsDefinition();
              return {
                kind: i.Kind.OBJECT_TYPE_DEFINITION,
                description: t,
                name: n,
                interfaces: r,
                directives: o,
                fields: s,
                loc: this.loc(e),
              };
            }),
            (t.parseImplementsInterfaces = function () {
              var e;
              if (!this.expectOptionalKeyword("implements")) return [];
              if (
                !0 ===
                (null === (e = this._options) || void 0 === e
                  ? void 0
                  : e.allowLegacySDLImplementsInterfaces)
              ) {
                var t = [];
                this.expectOptionalToken(s.TokenKind.AMP);
                do {
                  t.push(this.parseNamedType());
                } while (
                  this.expectOptionalToken(s.TokenKind.AMP) ||
                  this.peek(s.TokenKind.NAME)
                );
                return t;
              }
              return this.delimitedMany(s.TokenKind.AMP, this.parseNamedType);
            }),
            (t.parseFieldsDefinition = function () {
              var e;
              return !0 ===
                (null === (e = this._options) || void 0 === e
                  ? void 0
                  : e.allowLegacySDLEmptyFields) &&
                this.peek(s.TokenKind.BRACE_L) &&
                this._lexer.lookahead().kind === s.TokenKind.BRACE_R
                ? (this._lexer.advance(), this._lexer.advance(), [])
                : this.optionalMany(
                    s.TokenKind.BRACE_L,
                    this.parseFieldDefinition,
                    s.TokenKind.BRACE_R
                  );
            }),
            (t.parseFieldDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription(),
                n = this.parseName(),
                r = this.parseArgumentDefs();
              this.expectToken(s.TokenKind.COLON);
              var o = this.parseTypeReference(),
                a = this.parseDirectives(!0);
              return {
                kind: i.Kind.FIELD_DEFINITION,
                description: t,
                name: n,
                arguments: r,
                type: o,
                directives: a,
                loc: this.loc(e),
              };
            }),
            (t.parseArgumentDefs = function () {
              return this.optionalMany(
                s.TokenKind.PAREN_L,
                this.parseInputValueDef,
                s.TokenKind.PAREN_R
              );
            }),
            (t.parseInputValueDef = function () {
              var e = this._lexer.token,
                t = this.parseDescription(),
                n = this.parseName();
              this.expectToken(s.TokenKind.COLON);
              var r,
                o = this.parseTypeReference();
              this.expectOptionalToken(s.TokenKind.EQUALS) &&
                (r = this.parseValueLiteral(!0));
              var a = this.parseDirectives(!0);
              return {
                kind: i.Kind.INPUT_VALUE_DEFINITION,
                description: t,
                name: n,
                type: o,
                defaultValue: r,
                directives: a,
                loc: this.loc(e),
              };
            }),
            (t.parseInterfaceTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("interface");
              var n = this.parseName(),
                r = this.parseImplementsInterfaces(),
                o = this.parseDirectives(!0),
                s = this.parseFieldsDefinition();
              return {
                kind: i.Kind.INTERFACE_TYPE_DEFINITION,
                description: t,
                name: n,
                interfaces: r,
                directives: o,
                fields: s,
                loc: this.loc(e),
              };
            }),
            (t.parseUnionTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("union");
              var n = this.parseName(),
                r = this.parseDirectives(!0),
                o = this.parseUnionMemberTypes();
              return {
                kind: i.Kind.UNION_TYPE_DEFINITION,
                description: t,
                name: n,
                directives: r,
                types: o,
                loc: this.loc(e),
              };
            }),
            (t.parseUnionMemberTypes = function () {
              return this.expectOptionalToken(s.TokenKind.EQUALS)
                ? this.delimitedMany(s.TokenKind.PIPE, this.parseNamedType)
                : [];
            }),
            (t.parseEnumTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("enum");
              var n = this.parseName(),
                r = this.parseDirectives(!0),
                o = this.parseEnumValuesDefinition();
              return {
                kind: i.Kind.ENUM_TYPE_DEFINITION,
                description: t,
                name: n,
                directives: r,
                values: o,
                loc: this.loc(e),
              };
            }),
            (t.parseEnumValuesDefinition = function () {
              return this.optionalMany(
                s.TokenKind.BRACE_L,
                this.parseEnumValueDefinition,
                s.TokenKind.BRACE_R
              );
            }),
            (t.parseEnumValueDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription(),
                n = this.parseName(),
                r = this.parseDirectives(!0);
              return {
                kind: i.Kind.ENUM_VALUE_DEFINITION,
                description: t,
                name: n,
                directives: r,
                loc: this.loc(e),
              };
            }),
            (t.parseInputObjectTypeDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("input");
              var n = this.parseName(),
                r = this.parseDirectives(!0),
                o = this.parseInputFieldsDefinition();
              return {
                kind: i.Kind.INPUT_OBJECT_TYPE_DEFINITION,
                description: t,
                name: n,
                directives: r,
                fields: o,
                loc: this.loc(e),
              };
            }),
            (t.parseInputFieldsDefinition = function () {
              return this.optionalMany(
                s.TokenKind.BRACE_L,
                this.parseInputValueDef,
                s.TokenKind.BRACE_R
              );
            }),
            (t.parseTypeSystemExtension = function () {
              var e = this._lexer.lookahead();
              if (e.kind === s.TokenKind.NAME)
                switch (e.value) {
                  case "schema":
                    return this.parseSchemaExtension();
                  case "scalar":
                    return this.parseScalarTypeExtension();
                  case "type":
                    return this.parseObjectTypeExtension();
                  case "interface":
                    return this.parseInterfaceTypeExtension();
                  case "union":
                    return this.parseUnionTypeExtension();
                  case "enum":
                    return this.parseEnumTypeExtension();
                  case "input":
                    return this.parseInputObjectTypeExtension();
                }
              throw this.unexpected(e);
            }),
            (t.parseSchemaExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("schema");
              var t = this.parseDirectives(!0),
                n = this.optionalMany(
                  s.TokenKind.BRACE_L,
                  this.parseOperationTypeDefinition,
                  s.TokenKind.BRACE_R
                );
              if (0 === t.length && 0 === n.length) throw this.unexpected();
              return {
                kind: i.Kind.SCHEMA_EXTENSION,
                directives: t,
                operationTypes: n,
                loc: this.loc(e),
              };
            }),
            (t.parseScalarTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("scalar");
              var t = this.parseName(),
                n = this.parseDirectives(!0);
              if (0 === n.length) throw this.unexpected();
              return {
                kind: i.Kind.SCALAR_TYPE_EXTENSION,
                name: t,
                directives: n,
                loc: this.loc(e),
              };
            }),
            (t.parseObjectTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("type");
              var t = this.parseName(),
                n = this.parseImplementsInterfaces(),
                r = this.parseDirectives(!0),
                o = this.parseFieldsDefinition();
              if (0 === n.length && 0 === r.length && 0 === o.length)
                throw this.unexpected();
              return {
                kind: i.Kind.OBJECT_TYPE_EXTENSION,
                name: t,
                interfaces: n,
                directives: r,
                fields: o,
                loc: this.loc(e),
              };
            }),
            (t.parseInterfaceTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("interface");
              var t = this.parseName(),
                n = this.parseImplementsInterfaces(),
                r = this.parseDirectives(!0),
                o = this.parseFieldsDefinition();
              if (0 === n.length && 0 === r.length && 0 === o.length)
                throw this.unexpected();
              return {
                kind: i.Kind.INTERFACE_TYPE_EXTENSION,
                name: t,
                interfaces: n,
                directives: r,
                fields: o,
                loc: this.loc(e),
              };
            }),
            (t.parseUnionTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("union");
              var t = this.parseName(),
                n = this.parseDirectives(!0),
                r = this.parseUnionMemberTypes();
              if (0 === n.length && 0 === r.length) throw this.unexpected();
              return {
                kind: i.Kind.UNION_TYPE_EXTENSION,
                name: t,
                directives: n,
                types: r,
                loc: this.loc(e),
              };
            }),
            (t.parseEnumTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("enum");
              var t = this.parseName(),
                n = this.parseDirectives(!0),
                r = this.parseEnumValuesDefinition();
              if (0 === n.length && 0 === r.length) throw this.unexpected();
              return {
                kind: i.Kind.ENUM_TYPE_EXTENSION,
                name: t,
                directives: n,
                values: r,
                loc: this.loc(e),
              };
            }),
            (t.parseInputObjectTypeExtension = function () {
              var e = this._lexer.token;
              this.expectKeyword("extend"), this.expectKeyword("input");
              var t = this.parseName(),
                n = this.parseDirectives(!0),
                r = this.parseInputFieldsDefinition();
              if (0 === n.length && 0 === r.length) throw this.unexpected();
              return {
                kind: i.Kind.INPUT_OBJECT_TYPE_EXTENSION,
                name: t,
                directives: n,
                fields: r,
                loc: this.loc(e),
              };
            }),
            (t.parseDirectiveDefinition = function () {
              var e = this._lexer.token,
                t = this.parseDescription();
              this.expectKeyword("directive"), this.expectToken(s.TokenKind.AT);
              var n = this.parseName(),
                r = this.parseArgumentDefs(),
                o = this.expectOptionalKeyword("repeatable");
              this.expectKeyword("on");
              var a = this.parseDirectiveLocations();
              return {
                kind: i.Kind.DIRECTIVE_DEFINITION,
                description: t,
                name: n,
                arguments: r,
                repeatable: o,
                locations: a,
                loc: this.loc(e),
              };
            }),
            (t.parseDirectiveLocations = function () {
              return this.delimitedMany(
                s.TokenKind.PIPE,
                this.parseDirectiveLocation
              );
            }),
            (t.parseDirectiveLocation = function () {
              var e = this._lexer.token,
                t = this.parseName();
              if (void 0 !== c.DirectiveLocation[t.value]) return t;
              throw this.unexpected(e);
            }),
            (t.loc = function (e) {
              var t;
              if (
                !0 !==
                (null === (t = this._options) || void 0 === t
                  ? void 0
                  : t.noLocation)
              )
                return new o.Location(
                  e,
                  this._lexer.lastToken,
                  this._lexer.source
                );
            }),
            (t.peek = function (e) {
              return this._lexer.token.kind === e;
            }),
            (t.expectToken = function (e) {
              var t = this._lexer.token;
              if (t.kind === e) return this._lexer.advance(), t;
              throw (0, r.syntaxError)(
                this._lexer.source,
                t.start,
                "Expected ".concat(p(e), ", found ").concat(f(t), ".")
              );
            }),
            (t.expectOptionalToken = function (e) {
              var t = this._lexer.token;
              if (t.kind === e) return this._lexer.advance(), t;
            }),
            (t.expectKeyword = function (e) {
              var t = this._lexer.token;
              if (t.kind !== s.TokenKind.NAME || t.value !== e)
                throw (0, r.syntaxError)(
                  this._lexer.source,
                  t.start,
                  'Expected "'.concat(e, '", found ').concat(f(t), ".")
                );
              this._lexer.advance();
            }),
            (t.expectOptionalKeyword = function (e) {
              var t = this._lexer.token;
              return (
                t.kind === s.TokenKind.NAME &&
                t.value === e &&
                (this._lexer.advance(), !0)
              );
            }),
            (t.unexpected = function (e) {
              var t = null != e ? e : this._lexer.token;
              return (0, r.syntaxError)(
                this._lexer.source,
                t.start,
                "Unexpected ".concat(f(t), ".")
              );
            }),
            (t.any = function (e, t, n) {
              this.expectToken(e);
              for (var r = []; !this.expectOptionalToken(n); )
                r.push(t.call(this));
              return r;
            }),
            (t.optionalMany = function (e, t, n) {
              if (this.expectOptionalToken(e)) {
                var r = [];
                do {
                  r.push(t.call(this));
                } while (!this.expectOptionalToken(n));
                return r;
              }
              return [];
            }),
            (t.many = function (e, t, n) {
              this.expectToken(e);
              var r = [];
              do {
                r.push(t.call(this));
              } while (!this.expectOptionalToken(n));
              return r;
            }),
            (t.delimitedMany = function (e, t) {
              this.expectOptionalToken(e);
              var n = [];
              do {
                n.push(t.call(this));
              } while (this.expectOptionalToken(e));
              return n;
            }),
            e
          );
        })();
        function f(e) {
          var t = e.value;
          return p(e.kind) + (null != t ? ' "'.concat(t, '"') : "");
        }
        function p(e) {
          return (0, u.isPunctuatorTokenKind)(e) ? '"'.concat(e, '"') : e;
        }
        t.Parser = l;
      },
      8038: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.printLocation = function (e) {
            return i(e.source, (0, r.getLocation)(e.source, e.start));
          }),
          (t.printSourceLocation = i);
        var r = n(9016);
        function i(e, t) {
          var n = e.locationOffset.column - 1,
            r = s(n) + e.body,
            i = t.line - 1,
            a = e.locationOffset.line - 1,
            c = t.line + a,
            u = 1 === t.line ? n : 0,
            l = t.column + u,
            f = "".concat(e.name, ":").concat(c, ":").concat(l, "\n"),
            p = r.split(/\r\n|[\n\r]/g),
            h = p[i];
          if (h.length > 120) {
            for (
              var d = Math.floor(l / 80), v = l % 80, y = [], m = 0;
              m < h.length;
              m += 80
            )
              y.push(h.slice(m, m + 80));
            return (
              f +
              o(
                [["".concat(c), y[0]]].concat(
                  y.slice(1, d + 1).map(function (e) {
                    return ["", e];
                  }),
                  [
                    [" ", s(v - 1) + "^"],
                    ["", y[d + 1]],
                  ]
                )
              )
            );
          }
          return (
            f +
            o([
              ["".concat(c - 1), p[i - 1]],
              ["".concat(c), h],
              ["", s(l - 1) + "^"],
              ["".concat(c + 1), p[i + 1]],
            ])
          );
        }
        function o(e) {
          var t = e.filter(function (e) {
              e[0];
              return void 0 !== e[1];
            }),
            n = Math.max.apply(
              Math,
              t.map(function (e) {
                return e[0].length;
              })
            );
          return t
            .map(function (e) {
              var t,
                r = e[0],
                i = e[1];
              return s(n - (t = r).length) + t + (i ? " | " + i : " |");
            })
            .join("\n");
        }
        function s(e) {
          return Array(e + 1).join(" ");
        }
      },
      2412: (e, t, n) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.isSource = function (e) {
            return (0, s.default)(e, u);
          }),
          (t.Source = void 0);
        var r = n(3098),
          i = a(n(8002)),
          o = a(n(7242)),
          s = a(n(5752));
        function a(e) {
          return e && e.__esModule ? e : { default: e };
        }
        function c(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              "value" in r && (r.writable = !0),
              Object.defineProperty(e, r.key, r);
          }
        }
        var u = (function () {
          function e(e) {
            var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : "GraphQL request",
              n =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : { line: 1, column: 1 };
            "string" == typeof e ||
              (0, o.default)(
                0,
                "Body must be a string. Received: ".concat(
                  (0, i.default)(e),
                  "."
                )
              ),
              (this.body = e),
              (this.name = t),
              (this.locationOffset = n),
              this.locationOffset.line > 0 ||
                (0, o.default)(
                  0,
                  "line in locationOffset is 1-indexed and must be positive."
                ),
              this.locationOffset.column > 0 ||
                (0, o.default)(
                  0,
                  "column in locationOffset is 1-indexed and must be positive."
                );
          }
          var t, n, s;
          return (
            (t = e),
            (n = [
              {
                key: r.SYMBOL_TO_STRING_TAG,
                get: function () {
                  return "Source";
                },
              },
            ]) && c(t.prototype, n),
            s && c(t, s),
            e
          );
        })();
        t.Source = u;
      },
      3175: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.TokenKind = void 0);
        var n = Object.freeze({
          SOF: "<SOF>",
          EOF: "<EOF>",
          BANG: "!",
          DOLLAR: "$",
          AMP: "&",
          PAREN_L: "(",
          PAREN_R: ")",
          SPREAD: "...",
          COLON: ":",
          EQUALS: "=",
          AT: "@",
          BRACKET_L: "[",
          BRACKET_R: "]",
          BRACE_L: "{",
          PIPE: "|",
          BRACE_R: "}",
          NAME: "Name",
          INT: "Int",
          FLOAT: "Float",
          STRING: "String",
          BLOCK_STRING: "BlockString",
          COMMENT: "Comment",
        });
        t.TokenKind = n;
      },
      4079: (e, t, n) => {
        "use strict";
        n.d(t, { $_: () => l, Vn: () => f });
        const r =
          "function" == typeof Symbol && "function" == typeof Symbol.for
            ? Symbol.for("nodejs.util.inspect.custom")
            : void 0;
        function i(e) {
          return (i =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                })(e);
        }
        function o(e) {
          return s(e, []);
        }
        function s(e, t) {
          switch (i(e)) {
            case "string":
              return JSON.stringify(e);
            case "function":
              return e.name ? "[function ".concat(e.name, "]") : "[function]";
            case "object":
              return null === e
                ? "null"
                : (function (e, t) {
                    if (-1 !== t.indexOf(e)) return "[Circular]";
                    var n = [].concat(t, [e]),
                      i = (function (e) {
                        var t = e[String(r)];
                        if ("function" == typeof t) return t;
                        if ("function" == typeof e.inspect) return e.inspect;
                      })(e);
                    if (void 0 !== i) {
                      var o = i.call(e);
                      if (o !== e) return "string" == typeof o ? o : s(o, n);
                    } else if (Array.isArray(e))
                      return (function (e, t) {
                        if (0 === e.length) return "[]";
                        if (t.length > 2) return "[Array]";
                        for (
                          var n = Math.min(10, e.length),
                            r = e.length - n,
                            i = [],
                            o = 0;
                          o < n;
                          ++o
                        )
                          i.push(s(e[o], t));
                        1 === r
                          ? i.push("... 1 more item")
                          : r > 1 && i.push("... ".concat(r, " more items"));
                        return "[" + i.join(", ") + "]";
                      })(e, n);
                    return (function (e, t) {
                      var n = Object.keys(e);
                      if (0 === n.length) return "{}";
                      if (t.length > 2)
                        return (
                          "[" +
                          (function (e) {
                            var t = Object.prototype.toString
                              .call(e)
                              .replace(/^\[object /, "")
                              .replace(/]$/, "");
                            if (
                              "Object" === t &&
                              "function" == typeof e.constructor
                            ) {
                              var n = e.constructor.name;
                              if ("string" == typeof n && "" !== n) return n;
                            }
                            return t;
                          })(e) +
                          "]"
                        );
                      return (
                        "{ " +
                        n
                          .map(function (n) {
                            return n + ": " + s(e[n], t);
                          })
                          .join(", ") +
                        " }"
                      );
                    })(e, n);
                  })(e, t);
            default:
              return String(e);
          }
        }
        function a(e) {
          var t = e.prototype.toJSON;
          "function" == typeof t ||
            (function (e, t) {
              if (!Boolean(e))
                throw new Error(
                  null != t ? t : "Unexpected invariant triggered."
                );
            })(0),
            (e.prototype.inspect = t),
            r && (e.prototype[r] = t);
        }
        function c(e) {
          return null != e && "string" == typeof e.kind;
        }
        a(
          (function () {
            function e(e, t, n) {
              (this.start = e.start),
                (this.end = t.end),
                (this.startToken = e),
                (this.endToken = t),
                (this.source = n);
            }
            return (
              (e.prototype.toJSON = function () {
                return { start: this.start, end: this.end };
              }),
              e
            );
          })()
        ),
          a(
            (function () {
              function e(e, t, n, r, i, o, s) {
                (this.kind = e),
                  (this.start = t),
                  (this.end = n),
                  (this.line = r),
                  (this.column = i),
                  (this.value = s),
                  (this.prev = o),
                  (this.next = null);
              }
              return (
                (e.prototype.toJSON = function () {
                  return {
                    kind: this.kind,
                    value: this.value,
                    line: this.line,
                    column: this.column,
                  };
                }),
                e
              );
            })()
          );
        var u = {
            Name: [],
            Document: ["definitions"],
            OperationDefinition: [
              "name",
              "variableDefinitions",
              "directives",
              "selectionSet",
            ],
            VariableDefinition: [
              "variable",
              "type",
              "defaultValue",
              "directives",
            ],
            Variable: ["name"],
            SelectionSet: ["selections"],
            Field: ["alias", "name", "arguments", "directives", "selectionSet"],
            Argument: ["name", "value"],
            FragmentSpread: ["name", "directives"],
            InlineFragment: ["typeCondition", "directives", "selectionSet"],
            FragmentDefinition: [
              "name",
              "variableDefinitions",
              "typeCondition",
              "directives",
              "selectionSet",
            ],
            IntValue: [],
            FloatValue: [],
            StringValue: [],
            BooleanValue: [],
            NullValue: [],
            EnumValue: [],
            ListValue: ["values"],
            ObjectValue: ["fields"],
            ObjectField: ["name", "value"],
            Directive: ["name", "arguments"],
            NamedType: ["name"],
            ListType: ["type"],
            NonNullType: ["type"],
            SchemaDefinition: ["description", "directives", "operationTypes"],
            OperationTypeDefinition: ["type"],
            ScalarTypeDefinition: ["description", "name", "directives"],
            ObjectTypeDefinition: [
              "description",
              "name",
              "interfaces",
              "directives",
              "fields",
            ],
            FieldDefinition: [
              "description",
              "name",
              "arguments",
              "type",
              "directives",
            ],
            InputValueDefinition: [
              "description",
              "name",
              "type",
              "defaultValue",
              "directives",
            ],
            InterfaceTypeDefinition: [
              "description",
              "name",
              "interfaces",
              "directives",
              "fields",
            ],
            UnionTypeDefinition: ["description", "name", "directives", "types"],
            EnumTypeDefinition: ["description", "name", "directives", "values"],
            EnumValueDefinition: ["description", "name", "directives"],
            InputObjectTypeDefinition: [
              "description",
              "name",
              "directives",
              "fields",
            ],
            DirectiveDefinition: [
              "description",
              "name",
              "arguments",
              "locations",
            ],
            SchemaExtension: ["directives", "operationTypes"],
            ScalarTypeExtension: ["name", "directives"],
            ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
            InterfaceTypeExtension: [
              "name",
              "interfaces",
              "directives",
              "fields",
            ],
            UnionTypeExtension: ["name", "directives", "types"],
            EnumTypeExtension: ["name", "directives", "values"],
            InputObjectTypeExtension: ["name", "directives", "fields"],
          },
          l = Object.freeze({});
        function f(e, t) {
          var n =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : u,
            r = void 0,
            i = Array.isArray(e),
            s = [e],
            a = -1,
            f = [],
            h = void 0,
            d = void 0,
            v = void 0,
            y = [],
            m = [],
            b = e;
          do {
            var g = ++a === s.length,
              k = g && 0 !== f.length;
            if (g) {
              if (
                ((d = 0 === m.length ? void 0 : y[y.length - 1]),
                (h = v),
                (v = m.pop()),
                k)
              ) {
                if (i) h = h.slice();
                else {
                  for (
                    var E = {}, T = 0, S = Object.keys(h);
                    T < S.length;
                    T++
                  ) {
                    var w = S[T];
                    E[w] = h[w];
                  }
                  h = E;
                }
                for (var O = 0, _ = 0; _ < f.length; _++) {
                  var I = f[_][0],
                    N = f[_][1];
                  i && (I -= O),
                    i && null === N ? (h.splice(I, 1), O++) : (h[I] = N);
                }
              }
              (a = r.index),
                (s = r.keys),
                (f = r.edits),
                (i = r.inArray),
                (r = r.prev);
            } else {
              if (
                ((d = v ? (i ? a : s[a]) : void 0), null == (h = v ? v[d] : b))
              )
                continue;
              v && y.push(d);
            }
            var x,
              D = void 0;
            if (!Array.isArray(h)) {
              if (!c(h))
                throw new Error("Invalid AST Node: ".concat(o(h), "."));
              var A = p(t, h.kind, g);
              if (A) {
                if ((D = A.call(t, h, d, v, y, m)) === l) break;
                if (!1 === D) {
                  if (!g) {
                    y.pop();
                    continue;
                  }
                } else if (void 0 !== D && (f.push([d, D]), !g)) {
                  if (!c(D)) {
                    y.pop();
                    continue;
                  }
                  h = D;
                }
              }
            }
            if ((void 0 === D && k && f.push([d, h]), g)) y.pop();
            else
              (r = { inArray: i, index: a, keys: s, edits: f, prev: r }),
                (s = (i = Array.isArray(h))
                  ? h
                  : null !== (x = n[h.kind]) && void 0 !== x
                  ? x
                  : []),
                (a = -1),
                (f = []),
                v && m.push(v),
                (v = h);
          } while (void 0 !== r);
          return 0 !== f.length && (b = f[f.length - 1][1]), b;
        }
        function p(e, t, n) {
          var r = e[t];
          if (r) {
            if (!n && "function" == typeof r) return r;
            var i = n ? r.leave : r.enter;
            if ("function" == typeof i) return i;
          } else {
            var o = n ? e.leave : e.enter;
            if (o) {
              if ("function" == typeof o) return o;
              var s = o[t];
              if ("function" == typeof s) return s;
            }
          }
        }
      },
      3098: (e, t) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.SYMBOL_TO_STRING_TAG = t.SYMBOL_ASYNC_ITERATOR = t.SYMBOL_ITERATOR = void 0);
        var n =
          "function" == typeof Symbol && null != Symbol.iterator
            ? Symbol.iterator
            : "@@iterator";
        t.SYMBOL_ITERATOR = n;
        var r =
          "function" == typeof Symbol && null != Symbol.asyncIterator
            ? Symbol.asyncIterator
            : "@@asyncIterator";
        t.SYMBOL_ASYNC_ITERATOR = r;
        var i =
          "function" == typeof Symbol && null != Symbol.toStringTag
            ? Symbol.toStringTag
            : "@@toStringTag";
        t.SYMBOL_TO_STRING_TAG = i;
      },
      7121: (e, t, n) => {
        "use strict";
        e = n.hmd(e);
        !(function (e) {
          var t,
            n = e.Symbol;
          if ("function" == typeof n)
            if (n.observable) t = n.observable;
            else {
              t = n.for("https://github.com/benlesh/symbol-observable");
              try {
                n.observable = t;
              } catch (e) {}
            }
          else t = "@@observable";
        })(
          "undefined" != typeof self
            ? self
            : "undefined" != typeof window
            ? window
            : void 0 !== n.g
            ? n.g
            : e
        );
      },
      7591: (e, t, n) => {
        "use strict";
        n.d(t, { ej: () => a, kG: () => c });
        var r = n(655),
          i = "Invariant Violation",
          o = Object.setPrototypeOf,
          s =
            void 0 === o
              ? function (e, t) {
                  return (e.__proto__ = t), e;
                }
              : o,
          a = (function (e) {
            function t(n) {
              void 0 === n && (n = i);
              var r =
                e.call(
                  this,
                  "number" == typeof n
                    ? i +
                        ": " +
                        n +
                        " (see https://github.com/apollographql/invariant-packages)"
                    : n
                ) || this;
              return (r.framesToPop = 1), (r.name = i), s(r, t.prototype), r;
            }
            return (0, r.ZT)(t, e), t;
          })(Error);
        function c(e, t) {
          if (!e) throw new a(t);
        }
        var u = ["log", "warn", "error", "silent"],
          l = u.indexOf("log");
        function f(e) {
          return function () {
            if (u.indexOf(e) >= l) return console[e].apply(console, arguments);
          };
        }
        !(function (e) {
          (e.log = f("log")), (e.warn = f("warn")), (e.error = f("error"));
        })(c || (c = {}));
        var p = { env: {} };
        if ("object" == typeof process) p = process;
        else
          try {
            Function("stub", "process = stub")(p);
          } catch (e) {}
      },
      655: (e, t, n) => {
        "use strict";
        n.d(t, {
          ZT: () => i,
          pi: () => o,
          _T: () => s,
          mG: () => a,
          Jh: () => c,
          pr: () => u,
        });
        /*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
        var r = function (e, t) {
          return (r =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (e, t) {
                e.__proto__ = t;
              }) ||
            function (e, t) {
              for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
            })(e, t);
        };
        function i(e, t) {
          function n() {
            this.constructor = e;
          }
          r(e, t),
            (e.prototype =
              null === t
                ? Object.create(t)
                : ((n.prototype = t.prototype), new n()));
        }
        var o = function () {
          return (o =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var i in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
              return e;
            }).apply(this, arguments);
        };
        function s(e, t) {
          var n = {};
          for (var r in e)
            Object.prototype.hasOwnProperty.call(e, r) &&
              t.indexOf(r) < 0 &&
              (n[r] = e[r]);
          if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
            var i = 0;
            for (r = Object.getOwnPropertySymbols(e); i < r.length; i++)
              t.indexOf(r[i]) < 0 &&
                Object.prototype.propertyIsEnumerable.call(e, r[i]) &&
                (n[r[i]] = e[r[i]]);
          }
          return n;
        }
        function a(e, t, n, r) {
          return new (n || (n = Promise))(function (i, o) {
            function s(e) {
              try {
                c(r.next(e));
              } catch (e) {
                o(e);
              }
            }
            function a(e) {
              try {
                c(r.throw(e));
              } catch (e) {
                o(e);
              }
            }
            function c(e) {
              var t;
              e.done
                ? i(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(s, a);
            }
            c((r = r.apply(e, t || [])).next());
          });
        }
        function c(e, t) {
          var n,
            r,
            i,
            o,
            s = {
              label: 0,
              sent: function () {
                if (1 & i[0]) throw i[1];
                return i[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (o = { next: a(0), throw: a(1), return: a(2) }),
            "function" == typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function a(o) {
            return function (a) {
              return (function (o) {
                if (n) throw new TypeError("Generator is already executing.");
                for (; s; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (i =
                          2 & o[0]
                            ? r.return
                            : o[0]
                            ? r.throw || ((i = r.return) && i.call(r), 0)
                            : r.next) &&
                        !(i = i.call(r, o[1])).done)
                    )
                      return i;
                    switch (((r = 0), i && (o = [2 & o[0], i.value]), o[0])) {
                      case 0:
                      case 1:
                        i = o;
                        break;
                      case 4:
                        return s.label++, { value: o[1], done: !1 };
                      case 5:
                        s.label++, (r = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = s.ops.pop()), s.trys.pop();
                        continue;
                      default:
                        if (
                          !((i = s.trys),
                          (i = i.length > 0 && i[i.length - 1]) ||
                            (6 !== o[0] && 2 !== o[0]))
                        ) {
                          s = 0;
                          continue;
                        }
                        if (
                          3 === o[0] &&
                          (!i || (o[1] > i[0] && o[1] < i[3]))
                        ) {
                          s.label = o[1];
                          break;
                        }
                        if (6 === o[0] && s.label < i[1]) {
                          (s.label = i[1]), (i = o);
                          break;
                        }
                        if (i && s.label < i[2]) {
                          (s.label = i[2]), s.ops.push(o);
                          break;
                        }
                        i[2] && s.ops.pop(), s.trys.pop();
                        continue;
                    }
                    o = t.call(e, s);
                  } catch (e) {
                    (o = [6, e]), (r = 0);
                  } finally {
                    n = i = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, a]);
            };
          }
        }
        function u() {
          for (var e = 0, t = 0, n = arguments.length; t < n; t++)
            e += arguments[t].length;
          var r = Array(e),
            i = 0;
          for (t = 0; t < n; t++)
            for (var o = arguments[t], s = 0, a = o.length; s < a; s++, i++)
              r[i] = o[s];
          return r;
        }
      },
      9329: (e, t, n) => {
        e.exports = n(516).Observable;
      },
      516: (e, t) => {
        "use strict";
        function n(e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        }
        function r(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              "value" in r && (r.writable = !0),
              Object.defineProperty(e, r.key, r);
          }
        }
        function i(e, t, n) {
          return t && r(e.prototype, t), n && r(e, n), e;
        }
        t.Observable = void 0;
        var o = function () {
            return "function" == typeof Symbol;
          },
          s = function (e) {
            return o() && Boolean(Symbol[e]);
          },
          a = function (e) {
            return s(e) ? Symbol[e] : "@@" + e;
          };
        o() && !s("observable") && (Symbol.observable = Symbol("observable"));
        var c = a("iterator"),
          u = a("observable"),
          l = a("species");
        function f(e, t) {
          var n = e[t];
          if (null != n) {
            if ("function" != typeof n)
              throw new TypeError(n + " is not a function");
            return n;
          }
        }
        function p(e) {
          var t = e.constructor;
          return (
            void 0 !== t && null === (t = t[l]) && (t = void 0),
            void 0 !== t ? t : T
          );
        }
        function h(e) {
          return e instanceof T;
        }
        function d(e) {
          d.log
            ? d.log(e)
            : setTimeout(function () {
                throw e;
              });
        }
        function v(e) {
          Promise.resolve().then(function () {
            try {
              e();
            } catch (e) {
              d(e);
            }
          });
        }
        function y(e) {
          var t = e._cleanup;
          if (void 0 !== t && ((e._cleanup = void 0), t))
            try {
              if ("function" == typeof t) t();
              else {
                var n = f(t, "unsubscribe");
                n && n.call(t);
              }
            } catch (e) {
              d(e);
            }
        }
        function m(e) {
          (e._observer = void 0), (e._queue = void 0), (e._state = "closed");
        }
        function b(e, t, n) {
          e._state = "running";
          var r = e._observer;
          try {
            var i = f(r, t);
            switch (t) {
              case "next":
                i && i.call(r, n);
                break;
              case "error":
                if ((m(e), !i)) throw n;
                i.call(r, n);
                break;
              case "complete":
                m(e), i && i.call(r);
            }
          } catch (e) {
            d(e);
          }
          "closed" === e._state
            ? y(e)
            : "running" === e._state && (e._state = "ready");
        }
        function g(e, t, n) {
          if ("closed" !== e._state) {
            if ("buffering" !== e._state)
              return "ready" !== e._state
                ? ((e._state = "buffering"),
                  (e._queue = [{ type: t, value: n }]),
                  void v(function () {
                    return (function (e) {
                      var t = e._queue;
                      if (t) {
                        (e._queue = void 0), (e._state = "ready");
                        for (
                          var n = 0;
                          n < t.length &&
                          (b(e, t[n].type, t[n].value), "closed" !== e._state);
                          ++n
                        );
                      }
                    })(e);
                  }))
                : void b(e, t, n);
            e._queue.push({ type: t, value: n });
          }
        }
        var k = (function () {
            function e(t, r) {
              n(this, e),
                (this._cleanup = void 0),
                (this._observer = t),
                (this._queue = void 0),
                (this._state = "initializing");
              var i = new E(this);
              try {
                this._cleanup = r.call(void 0, i);
              } catch (e) {
                i.error(e);
              }
              "initializing" === this._state && (this._state = "ready");
            }
            return (
              i(e, [
                {
                  key: "unsubscribe",
                  value: function () {
                    "closed" !== this._state && (m(this), y(this));
                  },
                },
                {
                  key: "closed",
                  get: function () {
                    return "closed" === this._state;
                  },
                },
              ]),
              e
            );
          })(),
          E = (function () {
            function e(t) {
              n(this, e), (this._subscription = t);
            }
            return (
              i(e, [
                {
                  key: "next",
                  value: function (e) {
                    g(this._subscription, "next", e);
                  },
                },
                {
                  key: "error",
                  value: function (e) {
                    g(this._subscription, "error", e);
                  },
                },
                {
                  key: "complete",
                  value: function () {
                    g(this._subscription, "complete");
                  },
                },
                {
                  key: "closed",
                  get: function () {
                    return "closed" === this._subscription._state;
                  },
                },
              ]),
              e
            );
          })(),
          T = (function () {
            function e(t) {
              if ((n(this, e), !(this instanceof e)))
                throw new TypeError(
                  "Observable cannot be called as a function"
                );
              if ("function" != typeof t)
                throw new TypeError(
                  "Observable initializer must be a function"
                );
              this._subscriber = t;
            }
            return (
              i(
                e,
                [
                  {
                    key: "subscribe",
                    value: function (e) {
                      return (
                        ("object" == typeof e && null !== e) ||
                          (e = {
                            next: e,
                            error: arguments[1],
                            complete: arguments[2],
                          }),
                        new k(e, this._subscriber)
                      );
                    },
                  },
                  {
                    key: "forEach",
                    value: function (e) {
                      var t = this;
                      return new Promise(function (n, r) {
                        if ("function" == typeof e)
                          var i = t.subscribe({
                            next: function (t) {
                              try {
                                e(t, o);
                              } catch (e) {
                                r(e), i.unsubscribe();
                              }
                            },
                            error: r,
                            complete: n,
                          });
                        else r(new TypeError(e + " is not a function"));
                        function o() {
                          i.unsubscribe(), n();
                        }
                      });
                    },
                  },
                  {
                    key: "map",
                    value: function (e) {
                      var t = this;
                      if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                      return new (p(this))(function (n) {
                        return t.subscribe({
                          next: function (t) {
                            try {
                              t = e(t);
                            } catch (e) {
                              return n.error(e);
                            }
                            n.next(t);
                          },
                          error: function (e) {
                            n.error(e);
                          },
                          complete: function () {
                            n.complete();
                          },
                        });
                      });
                    },
                  },
                  {
                    key: "filter",
                    value: function (e) {
                      var t = this;
                      if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                      return new (p(this))(function (n) {
                        return t.subscribe({
                          next: function (t) {
                            try {
                              if (!e(t)) return;
                            } catch (e) {
                              return n.error(e);
                            }
                            n.next(t);
                          },
                          error: function (e) {
                            n.error(e);
                          },
                          complete: function () {
                            n.complete();
                          },
                        });
                      });
                    },
                  },
                  {
                    key: "reduce",
                    value: function (e) {
                      var t = this;
                      if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                      var n = p(this),
                        r = arguments.length > 1,
                        i = !1,
                        o = arguments[1],
                        s = o;
                      return new n(function (n) {
                        return t.subscribe({
                          next: function (t) {
                            var o = !i;
                            if (((i = !0), !o || r))
                              try {
                                s = e(s, t);
                              } catch (e) {
                                return n.error(e);
                              }
                            else s = t;
                          },
                          error: function (e) {
                            n.error(e);
                          },
                          complete: function () {
                            if (!i && !r)
                              return n.error(
                                new TypeError("Cannot reduce an empty sequence")
                              );
                            n.next(s), n.complete();
                          },
                        });
                      });
                    },
                  },
                  {
                    key: "concat",
                    value: function () {
                      for (
                        var e = this,
                          t = arguments.length,
                          n = new Array(t),
                          r = 0;
                        r < t;
                        r++
                      )
                        n[r] = arguments[r];
                      var i = p(this);
                      return new i(function (t) {
                        var r,
                          o = 0;
                        return (
                          (function e(s) {
                            r = s.subscribe({
                              next: function (e) {
                                t.next(e);
                              },
                              error: function (e) {
                                t.error(e);
                              },
                              complete: function () {
                                o === n.length
                                  ? ((r = void 0), t.complete())
                                  : e(i.from(n[o++]));
                              },
                            });
                          })(e),
                          function () {
                            r && (r.unsubscribe(), (r = void 0));
                          }
                        );
                      });
                    },
                  },
                  {
                    key: "flatMap",
                    value: function (e) {
                      var t = this;
                      if ("function" != typeof e)
                        throw new TypeError(e + " is not a function");
                      var n = p(this);
                      return new n(function (r) {
                        var i = [],
                          o = t.subscribe({
                            next: function (t) {
                              if (e)
                                try {
                                  t = e(t);
                                } catch (e) {
                                  return r.error(e);
                                }
                              var o = n.from(t).subscribe({
                                next: function (e) {
                                  r.next(e);
                                },
                                error: function (e) {
                                  r.error(e);
                                },
                                complete: function () {
                                  var e = i.indexOf(o);
                                  e >= 0 && i.splice(e, 1), s();
                                },
                              });
                              i.push(o);
                            },
                            error: function (e) {
                              r.error(e);
                            },
                            complete: function () {
                              s();
                            },
                          });
                        function s() {
                          o.closed && 0 === i.length && r.complete();
                        }
                        return function () {
                          i.forEach(function (e) {
                            return e.unsubscribe();
                          }),
                            o.unsubscribe();
                        };
                      });
                    },
                  },
                  {
                    key: u,
                    value: function () {
                      return this;
                    },
                  },
                ],
                [
                  {
                    key: "from",
                    value: function (t) {
                      var n = "function" == typeof this ? this : e;
                      if (null == t)
                        throw new TypeError(t + " is not an object");
                      var r = f(t, u);
                      if (r) {
                        var i = r.call(t);
                        if (Object(i) !== i)
                          throw new TypeError(i + " is not an object");
                        return h(i) && i.constructor === n
                          ? i
                          : new n(function (e) {
                              return i.subscribe(e);
                            });
                      }
                      if (s("iterator") && (r = f(t, c)))
                        return new n(function (e) {
                          v(function () {
                            if (!e.closed) {
                              var n = !0,
                                i = !1,
                                o = void 0;
                              try {
                                for (
                                  var s, a = r.call(t)[Symbol.iterator]();
                                  !(n = (s = a.next()).done);
                                  n = !0
                                ) {
                                  var c = s.value;
                                  if ((e.next(c), e.closed)) return;
                                }
                              } catch (e) {
                                (i = !0), (o = e);
                              } finally {
                                try {
                                  n || null == a.return || a.return();
                                } finally {
                                  if (i) throw o;
                                }
                              }
                              e.complete();
                            }
                          });
                        });
                      if (Array.isArray(t))
                        return new n(function (e) {
                          v(function () {
                            if (!e.closed) {
                              for (var n = 0; n < t.length; ++n)
                                if ((e.next(t[n]), e.closed)) return;
                              e.complete();
                            }
                          });
                        });
                      throw new TypeError(t + " is not observable");
                    },
                  },
                  {
                    key: "of",
                    value: function () {
                      for (
                        var t = arguments.length, n = new Array(t), r = 0;
                        r < t;
                        r++
                      )
                        n[r] = arguments[r];
                      var i = "function" == typeof this ? this : e;
                      return new i(function (e) {
                        v(function () {
                          if (!e.closed) {
                            for (var t = 0; t < n.length; ++t)
                              if ((e.next(n[t]), e.closed)) return;
                            e.complete();
                          }
                        });
                      });
                    },
                  },
                  {
                    key: l,
                    get: function () {
                      return this;
                    },
                  },
                ]
              ),
              e
            );
          })();
        (t.Observable = T),
          o() &&
            Object.defineProperty(T, Symbol("extensions"), {
              value: { symbol: u, hostReportError: d },
              configurable: !0,
            });
      },
      2285: (e, t, n) => {
        "use strict";
        n.r(t),
          n.d(t, {
            Client: () => h,
            KeyCeremony: () => G,
            MessageIdentifier: () => j,
            Voter: () => J,
          });
        var r = n(1439),
          i = n(4206),
          o = n.n(i),
          s = n(9120),
          a = n.n(s),
          c = n(5073),
          u = n.n(c),
          l = n(5053),
          f = n.n(l);
        class p {
          constructor({ apiEndpointUrl: e, headers: t }) {
            const n = new r.HttpLink({ uri: e, headers: t });
            this.apolloClient = new r.fe({ link: n, cache: new r.h4() });
          }
          async getLogEntry({ electionUniqueId: e, contentHash: t }) {
            return (
              await this.apolloClient.query({
                query: u(),
                variables: { electionUniqueId: e, contentHash: t },
              })
            ).data.logEntry;
          }
          async getElectionLogEntries({ electionUniqueId: e, after: t }) {
            return (
              await this.apolloClient.query({
                query: o(),
                variables: { electionUniqueId: e, after: t },
                fetchPolicy: "no-cache",
              })
            ).data.election.logEntries;
          }
          async processKeyCeremonyStep({ messageId: e, signedData: t }) {
            const n = await this.apolloClient.mutate({
              mutation: a(),
              variables: { signedData: t, messageId: e },
            });
            if (n.data.processKeyCeremonyStep.error)
              throw new Error(n.data.processKeyCeremonyStep.error);
            return n.data.processKeyCeremonyStep.pendingMessage;
          }
          async getPendingMessageByMessageId({ messageId: e }) {
            return (
              await this.apolloClient.query({
                query: f(),
                variables: { messageId: e },
              })
            ).data.pendingMessage;
          }
        }
        class h {
          constructor(e) {
            this.apiClient = new p(e);
          }
          getLogEntry({ electionUniqueId: e, contentHash: t }) {
            return this.apiClient.getLogEntry({
              electionUniqueId: e,
              contentHash: t,
            });
          }
          getElectionLogEntries(e) {
            return this.apiClient.getElectionLogEntries(e);
          }
          processKeyCeremonyStep({ messageId: e, signedData: t }) {
            return this.apiClient.processKeyCeremonyStep({
              messageId: e,
              signedData: t,
            });
          }
          getPendingMessageByMessageId({ messageId: e }) {
            return this.apiClient.getPendingMessageByMessageId({
              messageId: e,
            });
          }
        }
        var d = n(655);
        function v(e) {
          return "function" == typeof e;
        }
        var y = !1,
          m = {
            Promise: void 0,
            set useDeprecatedSynchronousErrorHandling(e) {
              e && new Error().stack;
              y = e;
            },
            get useDeprecatedSynchronousErrorHandling() {
              return y;
            },
          };
        function b(e) {
          setTimeout(function () {
            throw e;
          }, 0);
        }
        var g = {
            closed: !0,
            next: function (e) {},
            error: function (e) {
              if (m.useDeprecatedSynchronousErrorHandling) throw e;
              b(e);
            },
            complete: function () {},
          },
          k = (function () {
            return (
              Array.isArray ||
              function (e) {
                return e && "number" == typeof e.length;
              }
            );
          })();
        var E = (function () {
            function e(e) {
              return (
                Error.call(this),
                (this.message = e
                  ? e.length +
                    " errors occurred during unsubscription:\n" +
                    e
                      .map(function (e, t) {
                        return t + 1 + ") " + e.toString();
                      })
                      .join("\n  ")
                  : ""),
                (this.name = "UnsubscriptionError"),
                (this.errors = e),
                this
              );
            }
            return (e.prototype = Object.create(Error.prototype)), e;
          })(),
          T = (function () {
            function e(e) {
              (this.closed = !1),
                (this._parentOrParents = null),
                (this._subscriptions = null),
                e && ((this._ctorUnsubscribe = !0), (this._unsubscribe = e));
            }
            return (
              (e.prototype.unsubscribe = function () {
                var t;
                if (!this.closed) {
                  var n,
                    r = this,
                    i = r._parentOrParents,
                    o = r._ctorUnsubscribe,
                    s = r._unsubscribe,
                    a = r._subscriptions;
                  if (
                    ((this.closed = !0),
                    (this._parentOrParents = null),
                    (this._subscriptions = null),
                    i instanceof e)
                  )
                    i.remove(this);
                  else if (null !== i)
                    for (var c = 0; c < i.length; ++c) {
                      i[c].remove(this);
                    }
                  if (v(s)) {
                    o && (this._unsubscribe = void 0);
                    try {
                      s.call(this);
                    } catch (e) {
                      t = e instanceof E ? S(e.errors) : [e];
                    }
                  }
                  if (k(a)) {
                    c = -1;
                    for (var u = a.length; ++c < u; ) {
                      var l = a[c];
                      if (null !== (n = l) && "object" == typeof n)
                        try {
                          l.unsubscribe();
                        } catch (e) {
                          (t = t || []),
                            e instanceof E
                              ? (t = t.concat(S(e.errors)))
                              : t.push(e);
                        }
                    }
                  }
                  if (t) throw new E(t);
                }
              }),
              (e.prototype.add = function (t) {
                var n = t;
                if (!t) return e.EMPTY;
                switch (typeof t) {
                  case "function":
                    n = new e(t);
                  case "object":
                    if (
                      n === this ||
                      n.closed ||
                      "function" != typeof n.unsubscribe
                    )
                      return n;
                    if (this.closed) return n.unsubscribe(), n;
                    if (!(n instanceof e)) {
                      var r = n;
                      (n = new e())._subscriptions = [r];
                    }
                    break;
                  default:
                    throw new Error(
                      "unrecognized teardown " + t + " added to Subscription."
                    );
                }
                var i = n._parentOrParents;
                if (null === i) n._parentOrParents = this;
                else if (i instanceof e) {
                  if (i === this) return n;
                  n._parentOrParents = [i, this];
                } else {
                  if (-1 !== i.indexOf(this)) return n;
                  i.push(this);
                }
                var o = this._subscriptions;
                return null === o ? (this._subscriptions = [n]) : o.push(n), n;
              }),
              (e.prototype.remove = function (e) {
                var t = this._subscriptions;
                if (t) {
                  var n = t.indexOf(e);
                  -1 !== n && t.splice(n, 1);
                }
              }),
              (e.EMPTY = (function (e) {
                return (e.closed = !0), e;
              })(new e())),
              e
            );
          })();
        function S(e) {
          return e.reduce(function (e, t) {
            return e.concat(t instanceof E ? t.errors : t);
          }, []);
        }
        var w = (function () {
            return "function" == typeof Symbol
              ? Symbol("rxSubscriber")
              : "@@rxSubscriber_" + Math.random();
          })(),
          O = (function (e) {
            function t(n, r, i) {
              var o = e.call(this) || this;
              switch (
                ((o.syncErrorValue = null),
                (o.syncErrorThrown = !1),
                (o.syncErrorThrowable = !1),
                (o.isStopped = !1),
                arguments.length)
              ) {
                case 0:
                  o.destination = g;
                  break;
                case 1:
                  if (!n) {
                    o.destination = g;
                    break;
                  }
                  if ("object" == typeof n) {
                    n instanceof t
                      ? ((o.syncErrorThrowable = n.syncErrorThrowable),
                        (o.destination = n),
                        n.add(o))
                      : ((o.syncErrorThrowable = !0),
                        (o.destination = new _(o, n)));
                    break;
                  }
                default:
                  (o.syncErrorThrowable = !0),
                    (o.destination = new _(o, n, r, i));
              }
              return o;
            }
            return (
              d.ZT(t, e),
              (t.prototype[w] = function () {
                return this;
              }),
              (t.create = function (e, n, r) {
                var i = new t(e, n, r);
                return (i.syncErrorThrowable = !1), i;
              }),
              (t.prototype.next = function (e) {
                this.isStopped || this._next(e);
              }),
              (t.prototype.error = function (e) {
                this.isStopped || ((this.isStopped = !0), this._error(e));
              }),
              (t.prototype.complete = function () {
                this.isStopped || ((this.isStopped = !0), this._complete());
              }),
              (t.prototype.unsubscribe = function () {
                this.closed ||
                  ((this.isStopped = !0), e.prototype.unsubscribe.call(this));
              }),
              (t.prototype._next = function (e) {
                this.destination.next(e);
              }),
              (t.prototype._error = function (e) {
                this.destination.error(e), this.unsubscribe();
              }),
              (t.prototype._complete = function () {
                this.destination.complete(), this.unsubscribe();
              }),
              (t.prototype._unsubscribeAndRecycle = function () {
                var e = this._parentOrParents;
                return (
                  (this._parentOrParents = null),
                  this.unsubscribe(),
                  (this.closed = !1),
                  (this.isStopped = !1),
                  (this._parentOrParents = e),
                  this
                );
              }),
              t
            );
          })(T),
          _ = (function (e) {
            function t(t, n, r, i) {
              var o,
                s = e.call(this) || this;
              s._parentSubscriber = t;
              var a = s;
              return (
                v(n)
                  ? (o = n)
                  : n &&
                    ((o = n.next),
                    (r = n.error),
                    (i = n.complete),
                    n !== g &&
                      (v((a = Object.create(n)).unsubscribe) &&
                        s.add(a.unsubscribe.bind(a)),
                      (a.unsubscribe = s.unsubscribe.bind(s)))),
                (s._context = a),
                (s._next = o),
                (s._error = r),
                (s._complete = i),
                s
              );
            }
            return (
              d.ZT(t, e),
              (t.prototype.next = function (e) {
                if (!this.isStopped && this._next) {
                  var t = this._parentSubscriber;
                  m.useDeprecatedSynchronousErrorHandling &&
                  t.syncErrorThrowable
                    ? this.__tryOrSetError(t, this._next, e) &&
                      this.unsubscribe()
                    : this.__tryOrUnsub(this._next, e);
                }
              }),
              (t.prototype.error = function (e) {
                if (!this.isStopped) {
                  var t = this._parentSubscriber,
                    n = m.useDeprecatedSynchronousErrorHandling;
                  if (this._error)
                    n && t.syncErrorThrowable
                      ? (this.__tryOrSetError(t, this._error, e),
                        this.unsubscribe())
                      : (this.__tryOrUnsub(this._error, e), this.unsubscribe());
                  else if (t.syncErrorThrowable)
                    n
                      ? ((t.syncErrorValue = e), (t.syncErrorThrown = !0))
                      : b(e),
                      this.unsubscribe();
                  else {
                    if ((this.unsubscribe(), n)) throw e;
                    b(e);
                  }
                }
              }),
              (t.prototype.complete = function () {
                var e = this;
                if (!this.isStopped) {
                  var t = this._parentSubscriber;
                  if (this._complete) {
                    var n = function () {
                      return e._complete.call(e._context);
                    };
                    m.useDeprecatedSynchronousErrorHandling &&
                    t.syncErrorThrowable
                      ? (this.__tryOrSetError(t, n), this.unsubscribe())
                      : (this.__tryOrUnsub(n), this.unsubscribe());
                  } else this.unsubscribe();
                }
              }),
              (t.prototype.__tryOrUnsub = function (e, t) {
                try {
                  e.call(this._context, t);
                } catch (e) {
                  if (
                    (this.unsubscribe(),
                    m.useDeprecatedSynchronousErrorHandling)
                  )
                    throw e;
                  b(e);
                }
              }),
              (t.prototype.__tryOrSetError = function (e, t, n) {
                if (!m.useDeprecatedSynchronousErrorHandling)
                  throw new Error("bad call");
                try {
                  t.call(this._context, n);
                } catch (t) {
                  return m.useDeprecatedSynchronousErrorHandling
                    ? ((e.syncErrorValue = t), (e.syncErrorThrown = !0), !0)
                    : (b(t), !0);
                }
                return !1;
              }),
              (t.prototype._unsubscribe = function () {
                var e = this._parentSubscriber;
                (this._context = null),
                  (this._parentSubscriber = null),
                  e.unsubscribe();
              }),
              t
            );
          })(O);
        var I = (function () {
          return (
            ("function" == typeof Symbol && Symbol.observable) || "@@observable"
          );
        })();
        function N(e) {
          return e;
        }
        function x(e) {
          return 0 === e.length
            ? N
            : 1 === e.length
            ? e[0]
            : function (t) {
                return e.reduce(function (e, t) {
                  return t(e);
                }, t);
              };
        }
        var D = (function () {
          function e(e) {
            (this._isScalar = !1), e && (this._subscribe = e);
          }
          return (
            (e.prototype.lift = function (t) {
              var n = new e();
              return (n.source = this), (n.operator = t), n;
            }),
            (e.prototype.subscribe = function (e, t, n) {
              var r = this.operator,
                i = (function (e, t, n) {
                  if (e) {
                    if (e instanceof O) return e;
                    if (e[w]) return e[w]();
                  }
                  return e || t || n ? new O(e, t, n) : new O(g);
                })(e, t, n);
              if (
                (r
                  ? i.add(r.call(i, this.source))
                  : i.add(
                      this.source ||
                        (m.useDeprecatedSynchronousErrorHandling &&
                          !i.syncErrorThrowable)
                        ? this._subscribe(i)
                        : this._trySubscribe(i)
                    ),
                m.useDeprecatedSynchronousErrorHandling &&
                  i.syncErrorThrowable &&
                  ((i.syncErrorThrowable = !1), i.syncErrorThrown))
              )
                throw i.syncErrorValue;
              return i;
            }),
            (e.prototype._trySubscribe = function (e) {
              try {
                return this._subscribe(e);
              } catch (t) {
                m.useDeprecatedSynchronousErrorHandling &&
                  ((e.syncErrorThrown = !0), (e.syncErrorValue = t)),
                  !(function (e) {
                    for (; e; ) {
                      var t = e,
                        n = t.closed,
                        r = t.destination,
                        i = t.isStopped;
                      if (n || i) return !1;
                      e = r && r instanceof O ? r : null;
                    }
                    return !0;
                  })(e)
                    ? console.warn(t)
                    : e.error(t);
              }
            }),
            (e.prototype.forEach = function (e, t) {
              var n = this;
              return new (t = A(t))(function (t, r) {
                var i;
                i = n.subscribe(
                  function (t) {
                    try {
                      e(t);
                    } catch (e) {
                      r(e), i && i.unsubscribe();
                    }
                  },
                  r,
                  t
                );
              });
            }),
            (e.prototype._subscribe = function (e) {
              var t = this.source;
              return t && t.subscribe(e);
            }),
            (e.prototype[I] = function () {
              return this;
            }),
            (e.prototype.pipe = function () {
              for (var e = [], t = 0; t < arguments.length; t++)
                e[t] = arguments[t];
              return 0 === e.length ? this : x(e)(this);
            }),
            (e.prototype.toPromise = function (e) {
              var t = this;
              return new (e = A(e))(function (e, n) {
                var r;
                t.subscribe(
                  function (e) {
                    return (r = e);
                  },
                  function (e) {
                    return n(e);
                  },
                  function () {
                    return e(r);
                  }
                );
              });
            }),
            (e.create = function (t) {
              return new e(t);
            }),
            e
          );
        })();
        function A(e) {
          if ((e || (e = m.Promise || Promise), !e))
            throw new Error("no Promise impl found");
          return e;
        }
        var R = (function () {
            function e() {
              return (
                Error.call(this),
                (this.message = "object unsubscribed"),
                (this.name = "ObjectUnsubscribedError"),
                this
              );
            }
            return (e.prototype = Object.create(Error.prototype)), e;
          })(),
          C = (function (e) {
            function t(t, n) {
              var r = e.call(this) || this;
              return (r.subject = t), (r.subscriber = n), (r.closed = !1), r;
            }
            return (
              d.ZT(t, e),
              (t.prototype.unsubscribe = function () {
                if (!this.closed) {
                  this.closed = !0;
                  var e = this.subject,
                    t = e.observers;
                  if (
                    ((this.subject = null),
                    t && 0 !== t.length && !e.isStopped && !e.closed)
                  ) {
                    var n = t.indexOf(this.subscriber);
                    -1 !== n && t.splice(n, 1);
                  }
                }
              }),
              t
            );
          })(T),
          F = (function (e) {
            function t(t) {
              var n = e.call(this, t) || this;
              return (n.destination = t), n;
            }
            return d.ZT(t, e), t;
          })(O),
          P = (function (e) {
            function t() {
              var t = e.call(this) || this;
              return (
                (t.observers = []),
                (t.closed = !1),
                (t.isStopped = !1),
                (t.hasError = !1),
                (t.thrownError = null),
                t
              );
            }
            return (
              d.ZT(t, e),
              (t.prototype[w] = function () {
                return new F(this);
              }),
              (t.prototype.lift = function (e) {
                var t = new M(this, this);
                return (t.operator = e), t;
              }),
              (t.prototype.next = function (e) {
                if (this.closed) throw new R();
                if (!this.isStopped)
                  for (
                    var t = this.observers, n = t.length, r = t.slice(), i = 0;
                    i < n;
                    i++
                  )
                    r[i].next(e);
              }),
              (t.prototype.error = function (e) {
                if (this.closed) throw new R();
                (this.hasError = !0),
                  (this.thrownError = e),
                  (this.isStopped = !0);
                for (
                  var t = this.observers, n = t.length, r = t.slice(), i = 0;
                  i < n;
                  i++
                )
                  r[i].error(e);
                this.observers.length = 0;
              }),
              (t.prototype.complete = function () {
                if (this.closed) throw new R();
                this.isStopped = !0;
                for (
                  var e = this.observers, t = e.length, n = e.slice(), r = 0;
                  r < t;
                  r++
                )
                  n[r].complete();
                this.observers.length = 0;
              }),
              (t.prototype.unsubscribe = function () {
                (this.isStopped = !0),
                  (this.closed = !0),
                  (this.observers = null);
              }),
              (t.prototype._trySubscribe = function (t) {
                if (this.closed) throw new R();
                return e.prototype._trySubscribe.call(this, t);
              }),
              (t.prototype._subscribe = function (e) {
                if (this.closed) throw new R();
                return this.hasError
                  ? (e.error(this.thrownError), T.EMPTY)
                  : this.isStopped
                  ? (e.complete(), T.EMPTY)
                  : (this.observers.push(e), new C(this, e));
              }),
              (t.prototype.asObservable = function () {
                var e = new D();
                return (e.source = this), e;
              }),
              (t.create = function (e, t) {
                return new M(e, t);
              }),
              t
            );
          })(D),
          M = (function (e) {
            function t(t, n) {
              var r = e.call(this) || this;
              return (r.destination = t), (r.source = n), r;
            }
            return (
              d.ZT(t, e),
              (t.prototype.next = function (e) {
                var t = this.destination;
                t && t.next && t.next(e);
              }),
              (t.prototype.error = function (e) {
                var t = this.destination;
                t && t.error && this.destination.error(e);
              }),
              (t.prototype.complete = function () {
                var e = this.destination;
                e && e.complete && this.destination.complete();
              }),
              (t.prototype._subscribe = function (e) {
                return this.source ? this.source.subscribe(e) : T.EMPTY;
              }),
              t
            );
          })(P);
        const L = ["a", "b", "v", "t"];
        class j {
          static parse(e) {
            const [t, n] = e.split("+"),
              [r, i, o, s] = t.split(".", 4),
              [a, c] = n.split(".", 2),
              u = s ? "." + s : "";
            if (!L.includes(a))
              throw new Error("Invalid message identifier format");
            return {
              electionId: `${r}.${i}`,
              type: o,
              subtype: s,
              typeSubtype: `${o}${u}`,
              author: { type: a, id: c },
            };
          }
          static format(e, t, n, r) {
            return `${e}.${t}+${n}.${r}`;
          }
        }
        const q = "create_election",
          K = "key_ceremony.step_1",
          V = "key_ceremony.joint_election_key";
        class Q {
          constructor({ trusteeId: e }) {
            (this.trusteeId = e),
              (this.electionId = null),
              (this.status = q),
              (this.electionTrusteesCount = 0),
              (this.processedMessages = []);
          }
          backup() {
            return JSON.stringify(this);
          }
          checkRestoreNeeded(e) {
            return e && this.status === q;
          }
          restore(e, t) {
            if (!this.checkRestoreNeeded(t)) return !1;
            const n = JSON.parse(e);
            if (n.trusteeId !== this.trusteeId || (t && n.status === q))
              return !1;
            try {
              Object.assign(this, n);
            } catch (e) {
              return !1;
            }
            return !0;
          }
          processMessage(e, t) {
            const n = j.parse(e);
            switch (this.status) {
              case q:
                if (n.type === q)
                  return (
                    (this.status = K),
                    (this.electionId = n.electionId),
                    (this.processedMessages = []),
                    (this.electionTrusteesCount = t.trustees.length),
                    {
                      done: !1,
                      save: !0,
                      message: {
                        message_id: j.format(
                          this.electionId,
                          K,
                          "t",
                          this.trusteeId
                        ),
                        content: JSON.stringify({
                          election_public_key: 7,
                          owner_id: this.trusteeId,
                        }),
                      },
                    }
                  );
                break;
              case K:
                if (
                  n.typeSubtype === K &&
                  ((this.processedMessages = [...this.processedMessages, t]),
                  this.processedMessages.length === this.electionTrusteesCount)
                )
                  return (
                    (this.status = V), { done: !1, save: !1, message: null }
                  );
                break;
              case V:
                if (n.typeSubtype === V)
                  return { done: !0, save: !1, message: null };
            }
          }
        }
        class B {
          async parse(e) {
            if (await this.verify(e)) {
              const t = e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
                n = decodeURIComponent(
                  atob(t)
                    .split("")
                    .map(function (e) {
                      return (
                        "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2)
                      );
                    })
                    .join("")
                );
              return JSON.parse(n);
            }
            throw new Error(e + " is not valid.");
          }
          verify(e) {
            return Promise.resolve(!0);
          }
        }
        class U {
          constructor({ id: e, identificationKeys: t }) {
            (this.id = e),
              (this.wrapper = new Q({ trusteeId: e })),
              (this.parser = new B()),
              (this.identificationKeys = t);
          }
          async processLogEntry({ messageId: e, signedData: t }) {
            const n = await this.parser.parse(t);
            return this.wrapper.processMessage(e, n);
          }
          sign(e) {
            return this.identificationKeys.sign(e);
          }
          backup() {
            return this.wrapper.backup();
          }
          checkRestoreNeeded(e) {
            return this.wrapper.checkRestoreNeeded(e);
          }
          restore(e, t) {
            return this.wrapper.restore(e, t);
          }
        }
        class G {
          constructor({
            bulletinBoardClient: e,
            electionContext: t,
            options: n,
          }) {
            (this.bulletinBoardClient = e),
              (this.electionContext = t),
              (this.currentTrustee = null),
              (this.options = n || { bulletinBoardWaitTime: 1e3 }),
              (this.pollingIntervalId = null),
              (this.electionLogEntries = []),
              (this.response = null),
              (this.events = new P());
          }
          async setup() {
            const { currentTrusteeContext: e } = this.electionContext;
            (this.currentTrustee = new U(e)),
              await this.getLogEntries(),
              (this.nextLogEntryIndexToProcess = 0);
          }
          async getLogEntries() {
            const { id: e } = this.electionContext,
              t = this.electionLogEntries[this.electionLogEntries.length - 1],
              n = (t && t.id) || null;
            this.bulletinBoardClient
              .getElectionLogEntries({ electionUniqueId: e, after: n })
              .then((e) => {
                e.length &&
                  (this.electionLogEntries = [
                    ...this.electionLogEntries,
                    ...e,
                  ]);
              });
          }
          restoreNeeded() {
            const e = this.lastMessageSent();
            return e && this.currentTrustee.checkRestoreNeeded(e.messageId);
          }
          lastMessageSent() {
            for (let e = this.electionLogEntries.length - 1; e >= 0; e--) {
              const t = this.electionLogEntries[e],
                n = j.parse(t.messageId);
              if (
                "t" === n.author.type &&
                n.author.id === this.currentTrustee.id
              )
                return t;
            }
          }
          backup() {
            return this.currentTrustee.backup();
          }
          restore(e) {
            if (!this.restoreNeeded()) return !1;
            const t = this.lastMessageSent();
            return this.currentTrustee.restore(e, t && t.messageId);
          }
          async run() {
            if (this.restoreNeeded())
              throw new Error(
                "You need to restore the wrapper state to continue"
              );
            return (
              this.pollingIntervalId ||
                (this.pollingIntervalId = setInterval(() => {
                  this.getLogEntries();
                }, this.options.bulletinBoardWaitTime)),
              this.response &&
                (await this.sendMessageToBulletinBoard(this.response)),
              this.waitForNextLogEntryResult().then(
                async ({ message: e, done: t, save: n }) => {
                  if (((this.response = e), t))
                    clearInterval(this.pollingIntervalId);
                  else if (!n) return this.run();
                }
              )
            );
          }
          waitForNextLogEntryResult() {
            return new Promise((e) => {
              const t = setInterval(async () => {
                let n;
                this.electionLogEntries.length >
                  this.nextLogEntryIndexToProcess &&
                  (n = await this.processNextLogEntry()),
                  n && (clearInterval(t), e(n));
              }, this.options.bulletinBoardWaitTime);
            });
          }
          async processNextLogEntry() {
            const e = this.electionLogEntries[this.nextLogEntryIndexToProcess];
            this.events.next({ type: "[Message] Received", message: e });
            const t = await this.currentTrustee.processLogEntry(e);
            return (
              this.events.next({
                type: "[Message] Processed",
                message: e,
                result: t,
              }),
              (this.nextLogEntryIndexToProcess += 1),
              t
            );
          }
          async sendMessageToBulletinBoard(e) {
            if (
              this.electionLogEntries.find((t) => t.messageId === e.message_id)
            )
              return;
            const t = await this.currentTrustee.sign({
              iat: Math.floor(new Date() / 1e3),
              ...e,
            });
            return this.bulletinBoardClient.processKeyCeremonyStep({
              messageId: e.message_id,
              signedData: t,
            });
          }
        }
        class Y {
          constructor({ voterId: e }) {
            this.voterId = e;
          }
          encrypt(e) {
            return JSON.stringify(e);
          }
        }
        class J {
          constructor({
            id: e,
            bulletinBoardClient: t,
            electionContext: n,
            options: r,
          }) {
            (this.id = e),
              (this.wrapper = new Y({ voterId: e })),
              (this.bulletinBoardClient = t),
              (this.electionContext = n),
              (this.options = r || { bulletinBoardWaitTime: 1e3 });
          }
          async encrypt(e) {
            return this.wrapper.encrypt(e);
          }
          isVoteConfirmed(e) {
            return new Promise((t, n) => {
              this.bulletinBoardClient
                .getPendingMessageByMessageId({ messageId: e })
                .then((e) => {
                  t("accepted" === e.status);
                });
            });
          }
          async verifyVote(e) {
            const { id: t } = this.electionContext;
            return new Promise((n) => {
              const r = setInterval(() => {
                this.bulletinBoardClient
                  .getLogEntry({ electionUniqueId: t, contentHash: e })
                  .then((e) => {
                    e && (clearInterval(r), n());
                  });
              }, this.options.bulletinBoardWaitTime);
            });
          }
        }
      },
    },
    t = {};
  function n(r) {
    if (t[r]) return t[r].exports;
    var i = (t[r] = { id: r, loaded: !1, exports: {} });
    return e[r](i, i.exports, n), (i.loaded = !0), i.exports;
  }
  return (
    (n.n = (e) => {
      var t = e && e.__esModule ? () => e.default : () => e;
      return n.d(t, { a: t }), t;
    }),
    (n.d = (e, t) => {
      for (var r in t)
        n.o(t, r) &&
          !n.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (n.hmd = (e) => (
      (e = Object.create(e)).children || (e.children = []),
      Object.defineProperty(e, "exports", {
        enumerable: !0,
        set: () => {
          throw new Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              e.id
          );
        },
      }),
      e
    )),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (n.r = (e) => {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    n(2285)
  );
})();
