import { app as ht, ipcMain as we, shell as vo, BrowserWindow as yo } from "electron";
import * as ae from "path";
import * as pe from "fs/promises";
import yn from "process";
import _n from "buffer";
import _o from "stream";
import ml from "events";
import bn from "util";
var Be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function bo(d) {
  return d && d.__esModule && Object.prototype.hasOwnProperty.call(d, "default") ? d.default : d;
}
var be = {}, Ar = {}, Er = {}, Ne = {}, Pn;
function ye() {
  if (Pn) return Ne;
  Pn = 1;
  const d = Symbol.for("yaml.alias"), h = Symbol.for("yaml.document"), m = Symbol.for("yaml.map"), u = Symbol.for("yaml.pair"), v = Symbol.for("yaml.scalar"), f = Symbol.for("yaml.seq"), n = Symbol.for("yaml.node.type"), l = (y) => !!y && typeof y == "object" && y[n] === d, a = (y) => !!y && typeof y == "object" && y[n] === h, o = (y) => !!y && typeof y == "object" && y[n] === m, r = (y) => !!y && typeof y == "object" && y[n] === u, e = (y) => !!y && typeof y == "object" && y[n] === v, t = (y) => !!y && typeof y == "object" && y[n] === f;
  function i(y) {
    if (y && typeof y == "object")
      switch (y[n]) {
        case m:
        case f:
          return !0;
      }
    return !1;
  }
  function s(y) {
    if (y && typeof y == "object")
      switch (y[n]) {
        case d:
        case m:
        case v:
        case f:
          return !0;
      }
    return !1;
  }
  const c = (y) => (e(y) || i(y)) && !!y.anchor;
  return Ne.ALIAS = d, Ne.DOC = h, Ne.MAP = m, Ne.NODE_TYPE = n, Ne.PAIR = u, Ne.SCALAR = v, Ne.SEQ = f, Ne.hasAnchor = c, Ne.isAlias = l, Ne.isCollection = i, Ne.isDocument = a, Ne.isMap = o, Ne.isNode = s, Ne.isPair = r, Ne.isScalar = e, Ne.isSeq = t, Ne;
}
var Yt = {}, Mn;
function cr() {
  if (Mn) return Yt;
  Mn = 1;
  var d = ye();
  const h = Symbol("break visit"), m = Symbol("skip children"), u = Symbol("remove node");
  function v(e, t) {
    const i = a(t);
    d.isDocument(e) ? f(null, e.contents, i, Object.freeze([e])) === u && (e.contents = null) : f(null, e, i, Object.freeze([]));
  }
  v.BREAK = h, v.SKIP = m, v.REMOVE = u;
  function f(e, t, i, s) {
    const c = o(e, t, i, s);
    if (d.isNode(c) || d.isPair(c))
      return r(e, s, c), f(e, c, i, s);
    if (typeof c != "symbol") {
      if (d.isCollection(t)) {
        s = Object.freeze(s.concat(t));
        for (let y = 0; y < t.items.length; ++y) {
          const g = f(y, t.items[y], i, s);
          if (typeof g == "number")
            y = g - 1;
          else {
            if (g === h)
              return h;
            g === u && (t.items.splice(y, 1), y -= 1);
          }
        }
      } else if (d.isPair(t)) {
        s = Object.freeze(s.concat(t));
        const y = f("key", t.key, i, s);
        if (y === h)
          return h;
        y === u && (t.key = null);
        const g = f("value", t.value, i, s);
        if (g === h)
          return h;
        g === u && (t.value = null);
      }
    }
    return c;
  }
  async function n(e, t) {
    const i = a(t);
    d.isDocument(e) ? await l(null, e.contents, i, Object.freeze([e])) === u && (e.contents = null) : await l(null, e, i, Object.freeze([]));
  }
  n.BREAK = h, n.SKIP = m, n.REMOVE = u;
  async function l(e, t, i, s) {
    const c = await o(e, t, i, s);
    if (d.isNode(c) || d.isPair(c))
      return r(e, s, c), l(e, c, i, s);
    if (typeof c != "symbol") {
      if (d.isCollection(t)) {
        s = Object.freeze(s.concat(t));
        for (let y = 0; y < t.items.length; ++y) {
          const g = await l(y, t.items[y], i, s);
          if (typeof g == "number")
            y = g - 1;
          else {
            if (g === h)
              return h;
            g === u && (t.items.splice(y, 1), y -= 1);
          }
        }
      } else if (d.isPair(t)) {
        s = Object.freeze(s.concat(t));
        const y = await l("key", t.key, i, s);
        if (y === h)
          return h;
        y === u && (t.key = null);
        const g = await l("value", t.value, i, s);
        if (g === h)
          return h;
        g === u && (t.value = null);
      }
    }
    return c;
  }
  function a(e) {
    return typeof e == "object" && (e.Collection || e.Node || e.Value) ? Object.assign({
      Alias: e.Node,
      Map: e.Node,
      Scalar: e.Node,
      Seq: e.Node
    }, e.Value && {
      Map: e.Value,
      Scalar: e.Value,
      Seq: e.Value
    }, e.Collection && {
      Map: e.Collection,
      Seq: e.Collection
    }, e) : e;
  }
  function o(e, t, i, s) {
    var c, y, g, _, w;
    if (typeof i == "function")
      return i(e, t, s);
    if (d.isMap(t))
      return (c = i.Map) == null ? void 0 : c.call(i, e, t, s);
    if (d.isSeq(t))
      return (y = i.Seq) == null ? void 0 : y.call(i, e, t, s);
    if (d.isPair(t))
      return (g = i.Pair) == null ? void 0 : g.call(i, e, t, s);
    if (d.isScalar(t))
      return (_ = i.Scalar) == null ? void 0 : _.call(i, e, t, s);
    if (d.isAlias(t))
      return (w = i.Alias) == null ? void 0 : w.call(i, e, t, s);
  }
  function r(e, t, i) {
    const s = t[t.length - 1];
    if (d.isCollection(s))
      s.items[e] = i;
    else if (d.isPair(s))
      e === "key" ? s.key = i : s.value = i;
    else if (d.isDocument(s))
      s.contents = i;
    else {
      const c = d.isAlias(s) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${c} parent`);
    }
  }
  return Yt.visit = v, Yt.visitAsync = n, Yt;
}
var qn;
function wo() {
  if (qn) return Er;
  qn = 1;
  var d = ye(), h = cr();
  const m = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  }, u = (f) => f.replace(/[!,[\]{}]/g, (n) => m[n]);
  class v {
    constructor(n, l) {
      this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, v.defaultYaml, n), this.tags = Object.assign({}, v.defaultTags, l);
    }
    clone() {
      const n = new v(this.yaml, this.tags);
      return n.docStart = this.docStart, n;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
      const n = new v(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = !0;
          break;
        case "1.2":
          this.atNextDocument = !1, this.yaml = {
            explicit: v.defaultYaml.explicit,
            version: "1.2"
          }, this.tags = Object.assign({}, v.defaultTags);
          break;
      }
      return n;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(n, l) {
      this.atNextDocument && (this.yaml = { explicit: v.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, v.defaultTags), this.atNextDocument = !1);
      const a = n.trim().split(/[ \t]+/), o = a.shift();
      switch (o) {
        case "%TAG": {
          if (a.length !== 2 && (l(0, "%TAG directive should contain exactly two parts"), a.length < 2))
            return !1;
          const [r, e] = a;
          return this.tags[r] = e, !0;
        }
        case "%YAML": {
          if (this.yaml.explicit = !0, a.length !== 1)
            return l(0, "%YAML directive should contain exactly one part"), !1;
          const [r] = a;
          if (r === "1.1" || r === "1.2")
            return this.yaml.version = r, !0;
          {
            const e = /^\d+\.\d+$/.test(r);
            return l(6, `Unsupported YAML version ${r}`, e), !1;
          }
        }
        default:
          return l(0, `Unknown directive ${o}`, !0), !1;
      }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(n, l) {
      if (n === "!")
        return "!";
      if (n[0] !== "!")
        return l(`Not a valid tag: ${n}`), null;
      if (n[1] === "<") {
        const e = n.slice(2, -1);
        return e === "!" || e === "!!" ? (l(`Verbatim tags aren't resolved, so ${n} is invalid.`), null) : (n[n.length - 1] !== ">" && l("Verbatim tags must end with a >"), e);
      }
      const [, a, o] = n.match(/^(.*!)([^!]*)$/s);
      o || l(`The ${n} tag has no suffix`);
      const r = this.tags[a];
      if (r)
        try {
          return r + decodeURIComponent(o);
        } catch (e) {
          return l(String(e)), null;
        }
      return a === "!" ? n : (l(`Could not resolve tag: ${n}`), null);
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(n) {
      for (const [l, a] of Object.entries(this.tags))
        if (n.startsWith(a))
          return l + u(n.substring(a.length));
      return n[0] === "!" ? n : `!<${n}>`;
    }
    toString(n) {
      const l = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], a = Object.entries(this.tags);
      let o;
      if (n && a.length > 0 && d.isNode(n.contents)) {
        const r = {};
        h.visit(n.contents, (e, t) => {
          d.isNode(t) && t.tag && (r[t.tag] = !0);
        }), o = Object.keys(r);
      } else
        o = [];
      for (const [r, e] of a)
        r === "!!" && e === "tag:yaml.org,2002:" || (!n || o.some((t) => t.startsWith(e))) && l.push(`%TAG ${r} ${e}`);
      return l.join(`
`);
    }
  }
  return v.defaultYaml = { explicit: !1, version: "1.2" }, v.defaultTags = { "!!": "tag:yaml.org,2002:" }, Er.Directives = v, Er;
}
var Cr = {}, Tr = {}, _t = {}, Bn;
function wn() {
  if (Bn) return _t;
  Bn = 1;
  var d = ye(), h = cr();
  function m(n) {
    if (/[\x00-\x19\s,[\]{}]/.test(n)) {
      const a = `Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;
      throw new Error(a);
    }
    return !0;
  }
  function u(n) {
    const l = /* @__PURE__ */ new Set();
    return h.visit(n, {
      Value(a, o) {
        o.anchor && l.add(o.anchor);
      }
    }), l;
  }
  function v(n, l) {
    for (let a = 1; ; ++a) {
      const o = `${n}${a}`;
      if (!l.has(o))
        return o;
    }
  }
  function f(n, l) {
    const a = [], o = /* @__PURE__ */ new Map();
    let r = null;
    return {
      onAnchor: (e) => {
        a.push(e), r ?? (r = u(n));
        const t = v(l, r);
        return r.add(t), t;
      },
      /**
       * With circular references, the source node is only resolved after all
       * of its child nodes are. This is why anchors are set only after all of
       * the nodes have been created.
       */
      setAnchors: () => {
        for (const e of a) {
          const t = o.get(e);
          if (typeof t == "object" && t.anchor && (d.isScalar(t.node) || d.isCollection(t.node)))
            t.node.anchor = t.anchor;
          else {
            const i = new Error("Failed to resolve repeated object (this should not happen)");
            throw i.source = e, i;
          }
        }
      },
      sourceObjects: o
    };
  }
  return _t.anchorIsValid = m, _t.anchorNames = u, _t.createNodeAnchors = f, _t.findNewAnchor = v, _t;
}
var Rr = {}, Nr = {}, Fn;
function So() {
  if (Fn) return Nr;
  Fn = 1;
  function d(h, m, u, v) {
    if (v && typeof v == "object")
      if (Array.isArray(v))
        for (let f = 0, n = v.length; f < n; ++f) {
          const l = v[f], a = d(h, v, String(f), l);
          a === void 0 ? delete v[f] : a !== l && (v[f] = a);
        }
      else if (v instanceof Map)
        for (const f of Array.from(v.keys())) {
          const n = v.get(f), l = d(h, v, f, n);
          l === void 0 ? v.delete(f) : l !== n && v.set(f, l);
        }
      else if (v instanceof Set)
        for (const f of Array.from(v)) {
          const n = d(h, v, f, f);
          n === void 0 ? v.delete(f) : n !== f && (v.delete(f), v.add(n));
        }
      else
        for (const [f, n] of Object.entries(v)) {
          const l = d(h, v, f, n);
          l === void 0 ? delete v[f] : l !== n && (v[f] = l);
        }
    return h.call(m, u, v);
  }
  return Nr.applyReviver = d, Nr;
}
var Or = {}, jn;
function dt() {
  if (jn) return Or;
  jn = 1;
  var d = ye();
  function h(m, u, v) {
    if (Array.isArray(m))
      return m.map((f, n) => h(f, String(n), v));
    if (m && typeof m.toJSON == "function") {
      if (!v || !d.hasAnchor(m))
        return m.toJSON(u, v);
      const f = { aliasCount: 0, count: 1, res: void 0 };
      v.anchors.set(m, f), v.onCreate = (l) => {
        f.res = l, delete v.onCreate;
      };
      const n = m.toJSON(u, v);
      return v.onCreate && v.onCreate(n), n;
    }
    return typeof m == "bigint" && !(v != null && v.keep) ? Number(m) : m;
  }
  return Or.toJS = h, Or;
}
var $n;
function Sn() {
  if ($n) return Rr;
  $n = 1;
  var d = So(), h = ye(), m = dt();
  class u {
    constructor(f) {
      Object.defineProperty(this, h.NODE_TYPE, { value: f });
    }
    /** Create a copy of this node.  */
    clone() {
      const f = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return this.range && (f.range = this.range.slice()), f;
    }
    /** A plain JavaScript representation of this node. */
    toJS(f, { mapAsMap: n, maxAliasCount: l, onAnchor: a, reviver: o } = {}) {
      if (!h.isDocument(f))
        throw new TypeError("A document argument is required");
      const r = {
        anchors: /* @__PURE__ */ new Map(),
        doc: f,
        keep: !0,
        mapAsMap: n === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof l == "number" ? l : 100
      }, e = m.toJS(this, "", r);
      if (typeof a == "function")
        for (const { count: t, res: i } of r.anchors.values())
          a(i, t);
      return typeof o == "function" ? d.applyReviver(o, { "": e }, "", e) : e;
    }
  }
  return Rr.NodeBase = u, Rr;
}
var Un;
function hr() {
  if (Un) return Tr;
  Un = 1;
  var d = wn(), h = cr(), m = ye(), u = Sn(), v = dt();
  let f = class extends u.NodeBase {
    constructor(a) {
      super(m.ALIAS), this.source = a, Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(a, o) {
      let r;
      o != null && o.aliasResolveCache ? r = o.aliasResolveCache : (r = [], h.visit(a, {
        Node: (t, i) => {
          (m.isAlias(i) || m.hasAnchor(i)) && r.push(i);
        }
      }), o && (o.aliasResolveCache = r));
      let e;
      for (const t of r) {
        if (t === this)
          break;
        t.anchor === this.source && (e = t);
      }
      return e;
    }
    toJSON(a, o) {
      if (!o)
        return { source: this.source };
      const { anchors: r, doc: e, maxAliasCount: t } = o, i = this.resolve(e, o);
      if (!i) {
        const c = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(c);
      }
      let s = r.get(i);
      if (s || (v.toJS(i, null, o), s = r.get(i)), (s == null ? void 0 : s.res) === void 0) {
        const c = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(c);
      }
      if (t >= 0 && (s.count += 1, s.aliasCount === 0 && (s.aliasCount = n(e, i, r)), s.count * s.aliasCount > t)) {
        const c = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(c);
      }
      return s.res;
    }
    toString(a, o, r) {
      const e = `*${this.source}`;
      if (a) {
        if (d.anchorIsValid(this.source), a.options.verifyAliasOrder && !a.anchors.has(this.source)) {
          const t = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(t);
        }
        if (a.implicitKey)
          return `${e} `;
      }
      return e;
    }
  };
  function n(l, a, o) {
    if (m.isAlias(a)) {
      const r = a.resolve(l), e = o && r && o.get(r);
      return e ? e.count * e.aliasCount : 0;
    } else if (m.isCollection(a)) {
      let r = 0;
      for (const e of a.items) {
        const t = n(l, e, o);
        t > r && (r = t);
      }
      return r;
    } else if (m.isPair(a)) {
      const r = n(l, a.key, o), e = n(l, a.value, o);
      return Math.max(r, e);
    }
    return 1;
  }
  return Tr.Alias = f, Tr;
}
var Tt = {}, xr = {}, Zt = {}, zn;
function Re() {
  if (zn) return Zt;
  zn = 1;
  var d = ye(), h = Sn(), m = dt();
  const u = (f) => !f || typeof f != "function" && typeof f != "object";
  let v = class extends h.NodeBase {
    constructor(n) {
      super(d.SCALAR), this.value = n;
    }
    toJSON(n, l) {
      return l != null && l.keep ? this.value : m.toJS(this.value, n, l);
    }
    toString() {
      return String(this.value);
    }
  };
  return v.BLOCK_FOLDED = "BLOCK_FOLDED", v.BLOCK_LITERAL = "BLOCK_LITERAL", v.PLAIN = "PLAIN", v.QUOTE_DOUBLE = "QUOTE_DOUBLE", v.QUOTE_SINGLE = "QUOTE_SINGLE", Zt.Scalar = v, Zt.isScalarValue = u, Zt;
}
var Kn;
function dr() {
  if (Kn) return xr;
  Kn = 1;
  var d = hr(), h = ye(), m = Re();
  const u = "tag:yaml.org,2002:";
  function v(n, l, a) {
    if (l) {
      const o = a.filter((e) => e.tag === l), r = o.find((e) => !e.format) ?? o[0];
      if (!r)
        throw new Error(`Tag ${l} not found`);
      return r;
    }
    return a.find((o) => {
      var r;
      return ((r = o.identify) == null ? void 0 : r.call(o, n)) && !o.format;
    });
  }
  function f(n, l, a) {
    var g, _, w;
    if (h.isDocument(n) && (n = n.contents), h.isNode(n))
      return n;
    if (h.isPair(n)) {
      const A = (_ = (g = a.schema[h.MAP]).createNode) == null ? void 0 : _.call(g, a.schema, null, a);
      return A.items.push(n), A;
    }
    (n instanceof String || n instanceof Number || n instanceof Boolean || typeof BigInt < "u" && n instanceof BigInt) && (n = n.valueOf());
    const { aliasDuplicateObjects: o, onAnchor: r, onTagObj: e, schema: t, sourceObjects: i } = a;
    let s;
    if (o && n && typeof n == "object") {
      if (s = i.get(n), s)
        return s.anchor ?? (s.anchor = r(n)), new d.Alias(s.anchor);
      s = { anchor: null, node: null }, i.set(n, s);
    }
    l != null && l.startsWith("!!") && (l = u + l.slice(2));
    let c = v(n, l, t.tags);
    if (!c) {
      if (n && typeof n.toJSON == "function" && (n = n.toJSON()), !n || typeof n != "object") {
        const A = new m.Scalar(n);
        return s && (s.node = A), A;
      }
      c = n instanceof Map ? t[h.MAP] : Symbol.iterator in Object(n) ? t[h.SEQ] : t[h.MAP];
    }
    e && (e(c), delete a.onTagObj);
    const y = c != null && c.createNode ? c.createNode(a.schema, n, a) : typeof ((w = c == null ? void 0 : c.nodeClass) == null ? void 0 : w.from) == "function" ? c.nodeClass.from(a.schema, n, a) : new m.Scalar(n);
    return l ? y.tag = l : c.default || (y.tag = c.tag), s && (s.node = y), y;
  }
  return xr.createNode = f, xr;
}
var Wn;
function kn() {
  if (Wn) return Tt;
  Wn = 1;
  var d = dr(), h = ye(), m = Sn();
  function u(n, l, a) {
    let o = a;
    for (let r = l.length - 1; r >= 0; --r) {
      const e = l[r];
      if (typeof e == "number" && Number.isInteger(e) && e >= 0) {
        const t = [];
        t[e] = o, o = t;
      } else
        o = /* @__PURE__ */ new Map([[e, o]]);
    }
    return d.createNode(o, void 0, {
      aliasDuplicateObjects: !1,
      keepUndefined: !1,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema: n,
      sourceObjects: /* @__PURE__ */ new Map()
    });
  }
  const v = (n) => n == null || typeof n == "object" && !!n[Symbol.iterator]().next().done;
  let f = class extends m.NodeBase {
    constructor(l, a) {
      super(l), Object.defineProperty(this, "schema", {
        value: a,
        configurable: !0,
        enumerable: !1,
        writable: !0
      });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(l) {
      const a = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return l && (a.schema = l), a.items = a.items.map((o) => h.isNode(o) || h.isPair(o) ? o.clone(l) : o), this.range && (a.range = this.range.slice()), a;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(l, a) {
      if (v(l))
        this.add(a);
      else {
        const [o, ...r] = l, e = this.get(o, !0);
        if (h.isCollection(e))
          e.addIn(r, a);
        else if (e === void 0 && this.schema)
          this.set(o, u(this.schema, r, a));
        else
          throw new Error(`Expected YAML collection at ${o}. Remaining path: ${r}`);
      }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(l) {
      const [a, ...o] = l;
      if (o.length === 0)
        return this.delete(a);
      const r = this.get(a, !0);
      if (h.isCollection(r))
        return r.deleteIn(o);
      throw new Error(`Expected YAML collection at ${a}. Remaining path: ${o}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(l, a) {
      const [o, ...r] = l, e = this.get(o, !0);
      return r.length === 0 ? !a && h.isScalar(e) ? e.value : e : h.isCollection(e) ? e.getIn(r, a) : void 0;
    }
    hasAllNullValues(l) {
      return this.items.every((a) => {
        if (!h.isPair(a))
          return !1;
        const o = a.value;
        return o == null || l && h.isScalar(o) && o.value == null && !o.commentBefore && !o.comment && !o.tag;
      });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(l) {
      const [a, ...o] = l;
      if (o.length === 0)
        return this.has(a);
      const r = this.get(a, !0);
      return h.isCollection(r) ? r.hasIn(o) : !1;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(l, a) {
      const [o, ...r] = l;
      if (r.length === 0)
        this.set(o, a);
      else {
        const e = this.get(o, !0);
        if (h.isCollection(e))
          e.setIn(r, a);
        else if (e === void 0 && this.schema)
          this.set(o, u(this.schema, r, a));
        else
          throw new Error(`Expected YAML collection at ${o}. Remaining path: ${r}`);
      }
    }
  };
  return Tt.Collection = f, Tt.collectionFromPath = u, Tt.isEmptyPath = v, Tt;
}
var Jt = {}, Ir = {}, Vt = {}, Rt = {}, Hn;
function pr() {
  if (Hn) return Rt;
  Hn = 1;
  const d = (u) => u.replace(/^(?!$)(?: $)?/gm, "#");
  function h(u, v) {
    return /^\n+$/.test(u) ? u.substring(1) : v ? u.replace(/^(?! *$)/gm, v) : u;
  }
  const m = (u, v, f) => u.endsWith(`
`) ? h(f, v) : f.includes(`
`) ? `
` + h(f, v) : (u.endsWith(" ") ? "" : " ") + f;
  return Rt.indentComment = h, Rt.lineComment = m, Rt.stringifyComment = d, Rt;
}
var Dr = {}, bt = {}, Yn;
function gl() {
  if (Yn) return bt;
  Yn = 1;
  const d = "flow", h = "block", m = "quoted";
  function u(f, n, l = "flow", { indentAtStart: a, lineWidth: o = 80, minContentWidth: r = 20, onFold: e, onOverflow: t } = {}) {
    if (!o || o < 0)
      return f;
    o < r && (r = 0);
    const i = Math.max(1 + r, 1 + o - n.length);
    if (f.length <= i)
      return f;
    const s = [], c = {};
    let y = o - n.length;
    typeof a == "number" && (a > o - Math.max(2, r) ? s.push(0) : y = o - a);
    let g, _, w = !1, A = -1, E = -1, O = -1;
    l === h && (A = v(f, A, n.length), A !== -1 && (y = A + i));
    for (let L; L = f[A += 1]; ) {
      if (l === m && L === "\\") {
        switch (E = A, f[A + 1]) {
          case "x":
            A += 3;
            break;
          case "u":
            A += 5;
            break;
          case "U":
            A += 9;
            break;
          default:
            A += 1;
        }
        O = A;
      }
      if (L === `
`)
        l === h && (A = v(f, A, n.length)), y = A + n.length + i, g = void 0;
      else {
        if (L === " " && _ && _ !== " " && _ !== `
` && _ !== "	") {
          const P = f[A + 1];
          P && P !== " " && P !== `
` && P !== "	" && (g = A);
        }
        if (A >= y)
          if (g)
            s.push(g), y = g + i, g = void 0;
          else if (l === m) {
            for (; _ === " " || _ === "	"; )
              _ = L, L = f[A += 1], w = !0;
            const P = A > O + 1 ? A - 2 : E - 1;
            if (c[P])
              return f;
            s.push(P), c[P] = !0, y = P + i, g = void 0;
          } else
            w = !0;
      }
      _ = L;
    }
    if (w && t && t(), s.length === 0)
      return f;
    e && e();
    let D = f.slice(0, s[0]);
    for (let L = 0; L < s.length; ++L) {
      const P = s[L], K = s[L + 1] || f.length;
      P === 0 ? D = `
${n}${f.slice(0, K)}` : (l === m && c[P] && (D += `${f[P]}\\`), D += `
${n}${f.slice(P + 1, K)}`);
    }
    return D;
  }
  function v(f, n, l) {
    let a = n, o = n + 1, r = f[o];
    for (; r === " " || r === "	"; )
      if (n < o + l)
        r = f[++n];
      else {
        do
          r = f[++n];
        while (r && r !== `
`);
        a = n, o = n + 1, r = f[o];
      }
    return a;
  }
  return bt.FOLD_BLOCK = h, bt.FOLD_FLOW = d, bt.FOLD_QUOTED = m, bt.foldFlowLines = u, bt;
}
var Zn;
function mr() {
  if (Zn) return Dr;
  Zn = 1;
  var d = Re(), h = gl();
  const m = (t, i) => ({
    indentAtStart: i ? t.indent.length : t.indentAtStart,
    lineWidth: t.options.lineWidth,
    minContentWidth: t.options.minContentWidth
  }), u = (t) => /^(%|---|\.\.\.)/m.test(t);
  function v(t, i, s) {
    if (!i || i < 0)
      return !1;
    const c = i - s, y = t.length;
    if (y <= c)
      return !1;
    for (let g = 0, _ = 0; g < y; ++g)
      if (t[g] === `
`) {
        if (g - _ > c)
          return !0;
        if (_ = g + 1, y - _ <= c)
          return !1;
      }
    return !0;
  }
  function f(t, i) {
    const s = JSON.stringify(t);
    if (i.options.doubleQuotedAsJSON)
      return s;
    const { implicitKey: c } = i, y = i.options.doubleQuotedMinMultiLineLength, g = i.indent || (u(t) ? "  " : "");
    let _ = "", w = 0;
    for (let A = 0, E = s[A]; E; E = s[++A])
      if (E === " " && s[A + 1] === "\\" && s[A + 2] === "n" && (_ += s.slice(w, A) + "\\ ", A += 1, w = A, E = "\\"), E === "\\")
        switch (s[A + 1]) {
          case "u":
            {
              _ += s.slice(w, A);
              const O = s.substr(A + 2, 4);
              switch (O) {
                case "0000":
                  _ += "\\0";
                  break;
                case "0007":
                  _ += "\\a";
                  break;
                case "000b":
                  _ += "\\v";
                  break;
                case "001b":
                  _ += "\\e";
                  break;
                case "0085":
                  _ += "\\N";
                  break;
                case "00a0":
                  _ += "\\_";
                  break;
                case "2028":
                  _ += "\\L";
                  break;
                case "2029":
                  _ += "\\P";
                  break;
                default:
                  O.substr(0, 2) === "00" ? _ += "\\x" + O.substr(2) : _ += s.substr(A, 6);
              }
              A += 5, w = A + 1;
            }
            break;
          case "n":
            if (c || s[A + 2] === '"' || s.length < y)
              A += 1;
            else {
              for (_ += s.slice(w, A) + `

`; s[A + 2] === "\\" && s[A + 3] === "n" && s[A + 4] !== '"'; )
                _ += `
`, A += 2;
              _ += g, s[A + 2] === " " && (_ += "\\"), A += 1, w = A + 1;
            }
            break;
          default:
            A += 1;
        }
    return _ = w ? _ + s.slice(w) : s, c ? _ : h.foldFlowLines(_, g, h.FOLD_QUOTED, m(i, !1));
  }
  function n(t, i) {
    if (i.options.singleQuote === !1 || i.implicitKey && t.includes(`
`) || /[ \t]\n|\n[ \t]/.test(t))
      return f(t, i);
    const s = i.indent || (u(t) ? "  " : ""), c = "'" + t.replace(/'/g, "''").replace(/\n+/g, `$&
${s}`) + "'";
    return i.implicitKey ? c : h.foldFlowLines(c, s, h.FOLD_FLOW, m(i, !1));
  }
  function l(t, i) {
    const { singleQuote: s } = i.options;
    let c;
    if (s === !1)
      c = f;
    else {
      const y = t.includes('"'), g = t.includes("'");
      y && !g ? c = n : g && !y ? c = f : c = s ? n : f;
    }
    return c(t, i);
  }
  let a;
  try {
    a = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    a = /\n+(?!\n|$)/g;
  }
  function o({ comment: t, type: i, value: s }, c, y, g) {
    const { blockQuote: _, commentString: w, lineWidth: A } = c.options;
    if (!_ || /\n[\t ]+$/.test(s))
      return l(s, c);
    const E = c.indent || (c.forceBlockIndent || u(s) ? "  " : ""), O = _ === "literal" ? !0 : _ === "folded" || i === d.Scalar.BLOCK_FOLDED ? !1 : i === d.Scalar.BLOCK_LITERAL ? !0 : !v(s, A, E.length);
    if (!s)
      return O ? `|
` : `>
`;
    let D, L;
    for (L = s.length; L > 0; --L) {
      const R = s[L - 1];
      if (R !== `
` && R !== "	" && R !== " ")
        break;
    }
    let P = s.substring(L);
    const K = P.indexOf(`
`);
    K === -1 ? D = "-" : s === P || K !== P.length - 1 ? (D = "+", g && g()) : D = "", P && (s = s.slice(0, -P.length), P[P.length - 1] === `
` && (P = P.slice(0, -1)), P = P.replace(a, `$&${E}`));
    let V = !1, W, H = -1;
    for (W = 0; W < s.length; ++W) {
      const R = s[W];
      if (R === " ")
        V = !0;
      else if (R === `
`)
        H = W;
      else
        break;
    }
    let re = s.substring(0, H < W ? H + 1 : W);
    re && (s = s.substring(re.length), re = re.replace(/\n+/g, `$&${E}`));
    let ce = (V ? E ? "2" : "1" : "") + D;
    if (t && (ce += " " + w(t.replace(/ ?[\r\n]+/g, " ")), y && y()), !O) {
      const R = s.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${E}`);
      let I = !1;
      const F = m(c, !0);
      _ !== "folded" && i !== d.Scalar.BLOCK_FOLDED && (F.onOverflow = () => {
        I = !0;
      });
      const Z = h.foldFlowLines(`${re}${R}${P}`, E, h.FOLD_BLOCK, F);
      if (!I)
        return `>${ce}
${E}${Z}`;
    }
    return s = s.replace(/\n+/g, `$&${E}`), `|${ce}
${E}${re}${s}${P}`;
  }
  function r(t, i, s, c) {
    const { type: y, value: g } = t, { actualString: _, implicitKey: w, indent: A, indentStep: E, inFlow: O } = i;
    if (w && g.includes(`
`) || O && /[[\]{},]/.test(g))
      return l(g, i);
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(g))
      return w || O || !g.includes(`
`) ? l(g, i) : o(t, i, s, c);
    if (!w && !O && y !== d.Scalar.PLAIN && g.includes(`
`))
      return o(t, i, s, c);
    if (u(g)) {
      if (A === "")
        return i.forceBlockIndent = !0, o(t, i, s, c);
      if (w && A === E)
        return l(g, i);
    }
    const D = g.replace(/\n+/g, `$&
${A}`);
    if (_) {
      const L = (V) => {
        var W;
        return V.default && V.tag !== "tag:yaml.org,2002:str" && ((W = V.test) == null ? void 0 : W.test(D));
      }, { compat: P, tags: K } = i.doc.schema;
      if (K.some(L) || P != null && P.some(L))
        return l(g, i);
    }
    return w ? D : h.foldFlowLines(D, A, h.FOLD_FLOW, m(i, !1));
  }
  function e(t, i, s, c) {
    const { implicitKey: y, inFlow: g } = i, _ = typeof t.value == "string" ? t : Object.assign({}, t, { value: String(t.value) });
    let { type: w } = t;
    w !== d.Scalar.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(_.value) && (w = d.Scalar.QUOTE_DOUBLE);
    const A = (O) => {
      switch (O) {
        case d.Scalar.BLOCK_FOLDED:
        case d.Scalar.BLOCK_LITERAL:
          return y || g ? l(_.value, i) : o(_, i, s, c);
        case d.Scalar.QUOTE_DOUBLE:
          return f(_.value, i);
        case d.Scalar.QUOTE_SINGLE:
          return n(_.value, i);
        case d.Scalar.PLAIN:
          return r(_, i, s, c);
        default:
          return null;
      }
    };
    let E = A(w);
    if (E === null) {
      const { defaultKeyType: O, defaultStringType: D } = i.options, L = y && O || D;
      if (E = A(L), E === null)
        throw new Error(`Unsupported default string type ${L}`);
    }
    return E;
  }
  return Dr.stringifyString = e, Dr;
}
var Jn;
function gr() {
  if (Jn) return Vt;
  Jn = 1;
  var d = wn(), h = ye(), m = pr(), u = mr();
  function v(a, o) {
    const r = Object.assign({
      blockQuote: !0,
      commentString: m.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: !1,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: !0,
      indentSeq: !0,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: !1,
      singleQuote: null,
      trueStr: "true",
      verifyAliasOrder: !0
    }, a.schema.toStringOptions, o);
    let e;
    switch (r.collectionStyle) {
      case "block":
        e = !1;
        break;
      case "flow":
        e = !0;
        break;
      default:
        e = null;
    }
    return {
      anchors: /* @__PURE__ */ new Set(),
      doc: a,
      flowCollectionPadding: r.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof r.indent == "number" ? " ".repeat(r.indent) : "  ",
      inFlow: e,
      options: r
    };
  }
  function f(a, o) {
    var t;
    if (o.tag) {
      const i = a.filter((s) => s.tag === o.tag);
      if (i.length > 0)
        return i.find((s) => s.format === o.format) ?? i[0];
    }
    let r, e;
    if (h.isScalar(o)) {
      e = o.value;
      let i = a.filter((s) => {
        var c;
        return (c = s.identify) == null ? void 0 : c.call(s, e);
      });
      if (i.length > 1) {
        const s = i.filter((c) => c.test);
        s.length > 0 && (i = s);
      }
      r = i.find((s) => s.format === o.format) ?? i.find((s) => !s.format);
    } else
      e = o, r = a.find((i) => i.nodeClass && e instanceof i.nodeClass);
    if (!r) {
      const i = ((t = e == null ? void 0 : e.constructor) == null ? void 0 : t.name) ?? (e === null ? "null" : typeof e);
      throw new Error(`Tag not resolved for ${i} value`);
    }
    return r;
  }
  function n(a, o, { anchors: r, doc: e }) {
    if (!e.directives)
      return "";
    const t = [], i = (h.isScalar(a) || h.isCollection(a)) && a.anchor;
    i && d.anchorIsValid(i) && (r.add(i), t.push(`&${i}`));
    const s = a.tag ?? (o.default ? null : o.tag);
    return s && t.push(e.directives.tagString(s)), t.join(" ");
  }
  function l(a, o, r, e) {
    var y;
    if (h.isPair(a))
      return a.toString(o, r, e);
    if (h.isAlias(a)) {
      if (o.doc.directives)
        return a.toString(o);
      if ((y = o.resolvedAliases) != null && y.has(a))
        throw new TypeError("Cannot stringify circular structure without alias nodes");
      o.resolvedAliases ? o.resolvedAliases.add(a) : o.resolvedAliases = /* @__PURE__ */ new Set([a]), a = a.resolve(o.doc);
    }
    let t;
    const i = h.isNode(a) ? a : o.doc.createNode(a, { onTagObj: (g) => t = g });
    t ?? (t = f(o.doc.schema.tags, i));
    const s = n(i, t, o);
    s.length > 0 && (o.indentAtStart = (o.indentAtStart ?? 0) + s.length + 1);
    const c = typeof t.stringify == "function" ? t.stringify(i, o, r, e) : h.isScalar(i) ? u.stringifyString(i, o, r, e) : i.toString(o, r, e);
    return s ? h.isScalar(i) || c[0] === "{" || c[0] === "[" ? `${s} ${c}` : `${s}
${o.indent}${c}` : c;
  }
  return Vt.createStringifyContext = v, Vt.stringify = l, Vt;
}
var Vn;
function vl() {
  if (Vn) return Ir;
  Vn = 1;
  var d = ye(), h = Re(), m = gr(), u = pr();
  function v({ key: f, value: n }, l, a, o) {
    const { allNullValues: r, doc: e, indent: t, indentStep: i, options: { commentString: s, indentSeq: c, simpleKeys: y } } = l;
    let g = d.isNode(f) && f.comment || null;
    if (y) {
      if (g)
        throw new Error("With simple keys, key nodes cannot have comments");
      if (d.isCollection(f) || !d.isNode(f) && typeof f == "object") {
        const W = "With simple keys, collection cannot be used as a key value";
        throw new Error(W);
      }
    }
    let _ = !y && (!f || g && n == null && !l.inFlow || d.isCollection(f) || (d.isScalar(f) ? f.type === h.Scalar.BLOCK_FOLDED || f.type === h.Scalar.BLOCK_LITERAL : typeof f == "object"));
    l = Object.assign({}, l, {
      allNullValues: !1,
      implicitKey: !_ && (y || !r),
      indent: t + i
    });
    let w = !1, A = !1, E = m.stringify(f, l, () => w = !0, () => A = !0);
    if (!_ && !l.inFlow && E.length > 1024) {
      if (y)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      _ = !0;
    }
    if (l.inFlow) {
      if (r || n == null)
        return w && a && a(), E === "" ? "?" : _ ? `? ${E}` : E;
    } else if (r && !y || n == null && _)
      return E = `? ${E}`, g && !w ? E += u.lineComment(E, l.indent, s(g)) : A && o && o(), E;
    w && (g = null), _ ? (g && (E += u.lineComment(E, l.indent, s(g))), E = `? ${E}
${t}:`) : (E = `${E}:`, g && (E += u.lineComment(E, l.indent, s(g))));
    let O, D, L;
    d.isNode(n) ? (O = !!n.spaceBefore, D = n.commentBefore, L = n.comment) : (O = !1, D = null, L = null, n && typeof n == "object" && (n = e.createNode(n))), l.implicitKey = !1, !_ && !g && d.isScalar(n) && (l.indentAtStart = E.length + 1), A = !1, !c && i.length >= 2 && !l.inFlow && !_ && d.isSeq(n) && !n.flow && !n.tag && !n.anchor && (l.indent = l.indent.substring(2));
    let P = !1;
    const K = m.stringify(n, l, () => P = !0, () => A = !0);
    let V = " ";
    if (g || O || D) {
      if (V = O ? `
` : "", D) {
        const W = s(D);
        V += `
${u.indentComment(W, l.indent)}`;
      }
      K === "" && !l.inFlow ? V === `
` && L && (V = `

`) : V += `
${l.indent}`;
    } else if (!_ && d.isCollection(n)) {
      const W = K[0], H = K.indexOf(`
`), re = H !== -1, ue = l.inFlow ?? n.flow ?? n.items.length === 0;
      if (re || !ue) {
        let ce = !1;
        if (re && (W === "&" || W === "!")) {
          let R = K.indexOf(" ");
          W === "&" && R !== -1 && R < H && K[R + 1] === "!" && (R = K.indexOf(" ", R + 1)), (R === -1 || H < R) && (ce = !0);
        }
        ce || (V = `
${l.indent}`);
      }
    } else (K === "" || K[0] === `
`) && (V = "");
    return E += V + K, l.inFlow ? P && a && a() : L && !P ? E += u.lineComment(E, l.indent, s(L)) : A && o && o(), E;
  }
  return Ir.stringifyPair = v, Ir;
}
var Lr = {}, Gt = {}, Gn;
function ko() {
  if (Gn) return Gt;
  Gn = 1;
  var d = yn;
  function h(u, ...v) {
    u === "debug" && console.log(...v);
  }
  function m(u, v) {
    (u === "debug" || u === "warn") && (typeof d.emitWarning == "function" ? d.emitWarning(v) : console.warn(v));
  }
  return Gt.debug = h, Gt.warn = m, Gt;
}
var Nt = {}, Xn;
function An() {
  if (Xn) return Nt;
  Xn = 1;
  var d = ye(), h = Re();
  const m = "<<", u = {
    identify: (l) => l === m || typeof l == "symbol" && l.description === m,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new h.Scalar(Symbol(m)), {
      addToJSMap: f
    }),
    stringify: () => m
  }, v = (l, a) => (u.identify(a) || d.isScalar(a) && (!a.type || a.type === h.Scalar.PLAIN) && u.identify(a.value)) && (l == null ? void 0 : l.doc.schema.tags.some((o) => o.tag === u.tag && o.default));
  function f(l, a, o) {
    if (o = l && d.isAlias(o) ? o.resolve(l.doc) : o, d.isSeq(o))
      for (const r of o.items)
        n(l, a, r);
    else if (Array.isArray(o))
      for (const r of o)
        n(l, a, r);
    else
      n(l, a, o);
  }
  function n(l, a, o) {
    const r = l && d.isAlias(o) ? o.resolve(l.doc) : o;
    if (!d.isMap(r))
      throw new Error("Merge sources must be maps or map aliases");
    const e = r.toJSON(null, l, Map);
    for (const [t, i] of e)
      a instanceof Map ? a.has(t) || a.set(t, i) : a instanceof Set ? a.add(t) : Object.prototype.hasOwnProperty.call(a, t) || Object.defineProperty(a, t, {
        value: i,
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
    return a;
  }
  return Nt.addMergeToJSMap = f, Nt.isMergeKey = v, Nt.merge = u, Nt;
}
var Qn;
function Ao() {
  if (Qn) return Lr;
  Qn = 1;
  var d = ko(), h = An(), m = gr(), u = ye(), v = dt();
  function f(l, a, { key: o, value: r }) {
    if (u.isNode(o) && o.addToJSMap)
      o.addToJSMap(l, a, r);
    else if (h.isMergeKey(l, o))
      h.addMergeToJSMap(l, a, r);
    else {
      const e = v.toJS(o, "", l);
      if (a instanceof Map)
        a.set(e, v.toJS(r, e, l));
      else if (a instanceof Set)
        a.add(e);
      else {
        const t = n(o, e, l), i = v.toJS(r, t, l);
        t in a ? Object.defineProperty(a, t, {
          value: i,
          writable: !0,
          enumerable: !0,
          configurable: !0
        }) : a[t] = i;
      }
    }
    return a;
  }
  function n(l, a, o) {
    if (a === null)
      return "";
    if (typeof a != "object")
      return String(a);
    if (u.isNode(l) && (o != null && o.doc)) {
      const r = m.createStringifyContext(o.doc, {});
      r.anchors = /* @__PURE__ */ new Set();
      for (const t of o.anchors.keys())
        r.anchors.add(t.anchor);
      r.inFlow = !0, r.inStringifyKey = !0;
      const e = l.toString(r);
      if (!o.mapKeyWarned) {
        let t = JSON.stringify(e);
        t.length > 40 && (t = t.substring(0, 36) + '..."'), d.warn(o.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${t}. Set mapAsMap: true to use object keys.`), o.mapKeyWarned = !0;
      }
      return e;
    }
    return JSON.stringify(a);
  }
  return Lr.addPairToJSMap = f, Lr;
}
var ea;
function pt() {
  if (ea) return Jt;
  ea = 1;
  var d = dr(), h = vl(), m = Ao(), u = ye();
  function v(n, l, a) {
    const o = d.createNode(n, void 0, a), r = d.createNode(l, void 0, a);
    return new f(o, r);
  }
  let f = class Eo {
    constructor(l, a = null) {
      Object.defineProperty(this, u.NODE_TYPE, { value: u.PAIR }), this.key = l, this.value = a;
    }
    clone(l) {
      let { key: a, value: o } = this;
      return u.isNode(a) && (a = a.clone(l)), u.isNode(o) && (o = o.clone(l)), new Eo(a, o);
    }
    toJSON(l, a) {
      const o = a != null && a.mapAsMap ? /* @__PURE__ */ new Map() : {};
      return m.addPairToJSMap(a, o, this);
    }
    toString(l, a, o) {
      return l != null && l.doc ? h.stringifyPair(this, l, a, o) : JSON.stringify(this);
    }
  };
  return Jt.Pair = f, Jt.createPair = v, Jt;
}
var Pr = {}, Mr = {}, Xt = {}, qr = {}, ta;
function Co() {
  if (ta) return qr;
  ta = 1;
  var d = ye(), h = gr(), m = pr();
  function u(l, a, o) {
    return (a.inFlow ?? l.flow ? f : v)(l, a, o);
  }
  function v({ comment: l, items: a }, o, { blockItemPrefix: r, flowChars: e, itemIndent: t, onChompKeep: i, onComment: s }) {
    const { indent: c, options: { commentString: y } } = o, g = Object.assign({}, o, { indent: t, type: null });
    let _ = !1;
    const w = [];
    for (let E = 0; E < a.length; ++E) {
      const O = a[E];
      let D = null;
      if (d.isNode(O))
        !_ && O.spaceBefore && w.push(""), n(o, w, O.commentBefore, _), O.comment && (D = O.comment);
      else if (d.isPair(O)) {
        const P = d.isNode(O.key) ? O.key : null;
        P && (!_ && P.spaceBefore && w.push(""), n(o, w, P.commentBefore, _));
      }
      _ = !1;
      let L = h.stringify(O, g, () => D = null, () => _ = !0);
      D && (L += m.lineComment(L, t, y(D))), _ && D && (_ = !1), w.push(r + L);
    }
    let A;
    if (w.length === 0)
      A = e.start + e.end;
    else {
      A = w[0];
      for (let E = 1; E < w.length; ++E) {
        const O = w[E];
        A += O ? `
${c}${O}` : `
`;
      }
    }
    return l ? (A += `
` + m.indentComment(y(l), c), s && s()) : _ && i && i(), A;
  }
  function f({ items: l }, a, { flowChars: o, itemIndent: r }) {
    const { indent: e, indentStep: t, flowCollectionPadding: i, options: { commentString: s } } = a;
    r += t;
    const c = Object.assign({}, a, {
      indent: r,
      inFlow: !0,
      type: null
    });
    let y = !1, g = 0;
    const _ = [];
    for (let E = 0; E < l.length; ++E) {
      const O = l[E];
      let D = null;
      if (d.isNode(O))
        O.spaceBefore && _.push(""), n(a, _, O.commentBefore, !1), O.comment && (D = O.comment);
      else if (d.isPair(O)) {
        const P = d.isNode(O.key) ? O.key : null;
        P && (P.spaceBefore && _.push(""), n(a, _, P.commentBefore, !1), P.comment && (y = !0));
        const K = d.isNode(O.value) ? O.value : null;
        K ? (K.comment && (D = K.comment), K.commentBefore && (y = !0)) : O.value == null && (P != null && P.comment) && (D = P.comment);
      }
      D && (y = !0);
      let L = h.stringify(O, c, () => D = null);
      E < l.length - 1 && (L += ","), D && (L += m.lineComment(L, r, s(D))), !y && (_.length > g || L.includes(`
`)) && (y = !0), _.push(L), g = _.length;
    }
    const { start: w, end: A } = o;
    if (_.length === 0)
      return w + A;
    if (!y) {
      const E = _.reduce((O, D) => O + D.length + 2, 2);
      y = a.options.lineWidth > 0 && E > a.options.lineWidth;
    }
    if (y) {
      let E = w;
      for (const O of _)
        E += O ? `
${t}${e}${O}` : `
`;
      return `${E}
${e}${A}`;
    } else
      return `${w}${i}${_.join(" ")}${i}${A}`;
  }
  function n({ indent: l, options: { commentString: a } }, o, r, e) {
    if (r && e && (r = r.replace(/^\n+/, "")), r) {
      const t = m.indentComment(a(r), l);
      o.push(t.trimStart());
    }
  }
  return qr.stringifyCollection = u, qr;
}
var ra;
function mt() {
  if (ra) return Xt;
  ra = 1;
  var d = Co(), h = Ao(), m = kn(), u = ye(), v = pt(), f = Re();
  function n(a, o) {
    const r = u.isScalar(o) ? o.value : o;
    for (const e of a)
      if (u.isPair(e) && (e.key === o || e.key === r || u.isScalar(e.key) && e.key.value === r))
        return e;
  }
  let l = class extends m.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(o) {
      super(u.MAP, o), this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(o, r, e) {
      const { keepUndefined: t, replacer: i } = e, s = new this(o), c = (y, g) => {
        if (typeof i == "function")
          g = i.call(r, y, g);
        else if (Array.isArray(i) && !i.includes(y))
          return;
        (g !== void 0 || t) && s.items.push(v.createPair(y, g, e));
      };
      if (r instanceof Map)
        for (const [y, g] of r)
          c(y, g);
      else if (r && typeof r == "object")
        for (const y of Object.keys(r))
          c(y, r[y]);
      return typeof o.sortMapEntries == "function" && s.items.sort(o.sortMapEntries), s;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(o, r) {
      var s;
      let e;
      u.isPair(o) ? e = o : !o || typeof o != "object" || !("key" in o) ? e = new v.Pair(o, o == null ? void 0 : o.value) : e = new v.Pair(o.key, o.value);
      const t = n(this.items, e.key), i = (s = this.schema) == null ? void 0 : s.sortMapEntries;
      if (t) {
        if (!r)
          throw new Error(`Key ${e.key} already set`);
        u.isScalar(t.value) && f.isScalarValue(e.value) ? t.value.value = e.value : t.value = e.value;
      } else if (i) {
        const c = this.items.findIndex((y) => i(e, y) < 0);
        c === -1 ? this.items.push(e) : this.items.splice(c, 0, e);
      } else
        this.items.push(e);
    }
    delete(o) {
      const r = n(this.items, o);
      return r ? this.items.splice(this.items.indexOf(r), 1).length > 0 : !1;
    }
    get(o, r) {
      const e = n(this.items, o), t = e == null ? void 0 : e.value;
      return (!r && u.isScalar(t) ? t.value : t) ?? void 0;
    }
    has(o) {
      return !!n(this.items, o);
    }
    set(o, r) {
      this.add(new v.Pair(o, r), !0);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(o, r, e) {
      const t = e ? new e() : r != null && r.mapAsMap ? /* @__PURE__ */ new Map() : {};
      r != null && r.onCreate && r.onCreate(t);
      for (const i of this.items)
        h.addPairToJSMap(r, t, i);
      return t;
    }
    toString(o, r, e) {
      if (!o)
        return JSON.stringify(this);
      for (const t of this.items)
        if (!u.isPair(t))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(t)} instead`);
      return !o.allNullValues && this.hasAllNullValues(!1) && (o = Object.assign({}, o, { allNullValues: !0 })), d.stringifyCollection(this, o, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: o.indent || "",
        onChompKeep: e,
        onComment: r
      });
    }
  };
  return Xt.YAMLMap = l, Xt.findPair = n, Xt;
}
var ia;
function qt() {
  if (ia) return Mr;
  ia = 1;
  var d = ye(), h = mt();
  const m = {
    collection: "map",
    default: !0,
    nodeClass: h.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(u, v) {
      return d.isMap(u) || v("Expected a mapping for this tag"), u;
    },
    createNode: (u, v, f) => h.YAMLMap.from(u, v, f)
  };
  return Mr.map = m, Mr;
}
var Br = {}, Fr = {}, na;
function gt() {
  if (na) return Fr;
  na = 1;
  var d = dr(), h = Co(), m = kn(), u = ye(), v = Re(), f = dt();
  let n = class extends m.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(o) {
      super(u.SEQ, o), this.items = [];
    }
    add(o) {
      this.items.push(o);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(o) {
      const r = l(o);
      return typeof r != "number" ? !1 : this.items.splice(r, 1).length > 0;
    }
    get(o, r) {
      const e = l(o);
      if (typeof e != "number")
        return;
      const t = this.items[e];
      return !r && u.isScalar(t) ? t.value : t;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(o) {
      const r = l(o);
      return typeof r == "number" && r < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(o, r) {
      const e = l(o);
      if (typeof e != "number")
        throw new Error(`Expected a valid index, not ${o}.`);
      const t = this.items[e];
      u.isScalar(t) && v.isScalarValue(r) ? t.value = r : this.items[e] = r;
    }
    toJSON(o, r) {
      const e = [];
      r != null && r.onCreate && r.onCreate(e);
      let t = 0;
      for (const i of this.items)
        e.push(f.toJS(i, String(t++), r));
      return e;
    }
    toString(o, r, e) {
      return o ? h.stringifyCollection(this, o, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (o.indent || "") + "  ",
        onChompKeep: e,
        onComment: r
      }) : JSON.stringify(this);
    }
    static from(o, r, e) {
      const { replacer: t } = e, i = new this(o);
      if (r && Symbol.iterator in Object(r)) {
        let s = 0;
        for (let c of r) {
          if (typeof t == "function") {
            const y = r instanceof Set ? c : String(s++);
            c = t.call(r, y, c);
          }
          i.items.push(d.createNode(c, void 0, e));
        }
      }
      return i;
    }
  };
  function l(a) {
    let o = u.isScalar(a) ? a.value : a;
    return o && typeof o == "string" && (o = Number(o)), typeof o == "number" && Number.isInteger(o) && o >= 0 ? o : null;
  }
  return Fr.YAMLSeq = n, Fr;
}
var aa;
function Bt() {
  if (aa) return Br;
  aa = 1;
  var d = ye(), h = gt();
  const m = {
    collection: "seq",
    default: !0,
    nodeClass: h.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(u, v) {
      return d.isSeq(u) || v("Expected a sequence for this tag"), u;
    },
    createNode: (u, v, f) => h.YAMLSeq.from(u, v, f)
  };
  return Br.seq = m, Br;
}
var jr = {}, sa;
function vr() {
  if (sa) return jr;
  sa = 1;
  var d = mr();
  const h = {
    identify: (m) => typeof m == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (m) => m,
    stringify(m, u, v, f) {
      return u = Object.assign({ actualString: !0 }, u), d.stringifyString(m, u, v, f);
    }
  };
  return jr.string = h, jr;
}
var Qt = {}, $r = {}, oa;
function En() {
  if (oa) return $r;
  oa = 1;
  var d = Re();
  const h = {
    identify: (m) => m == null,
    createNode: () => new d.Scalar(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new d.Scalar(null),
    stringify: ({ source: m }, u) => typeof m == "string" && h.test.test(m) ? m : u.options.nullStr
  };
  return $r.nullTag = h, $r;
}
var Ur = {}, la;
function To() {
  if (la) return Ur;
  la = 1;
  var d = Re();
  const h = {
    identify: (m) => typeof m == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (m) => new d.Scalar(m[0] === "t" || m[0] === "T"),
    stringify({ source: m, value: u }, v) {
      if (m && h.test.test(m)) {
        const f = m[0] === "t" || m[0] === "T";
        if (u === f)
          return m;
      }
      return u ? v.options.trueStr : v.options.falseStr;
    }
  };
  return Ur.boolTag = h, Ur;
}
var Ot = {}, zr = {}, fa;
function Ft() {
  if (fa) return zr;
  fa = 1;
  function d({ format: h, minFractionDigits: m, tag: u, value: v }) {
    if (typeof v == "bigint")
      return String(v);
    const f = typeof v == "number" ? v : Number(v);
    if (!isFinite(f))
      return isNaN(f) ? ".nan" : f < 0 ? "-.inf" : ".inf";
    let n = Object.is(v, -0) ? "-0" : JSON.stringify(v);
    if (!h && m && (!u || u === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
      let l = n.indexOf(".");
      l < 0 && (l = n.length, n += ".");
      let a = m - (n.length - l - 1);
      for (; a-- > 0; )
        n += "0";
    }
    return n;
  }
  return zr.stringifyNumber = d, zr;
}
var ua;
function Ro() {
  if (ua) return Ot;
  ua = 1;
  var d = Re(), h = Ft();
  const m = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (f) => f.slice(-3).toLowerCase() === "nan" ? NaN : f[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: h.stringifyNumber
  }, u = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (f) => parseFloat(f),
    stringify(f) {
      const n = Number(f.value);
      return isFinite(n) ? n.toExponential() : h.stringifyNumber(f);
    }
  }, v = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(f) {
      const n = new d.Scalar(parseFloat(f)), l = f.indexOf(".");
      return l !== -1 && f[f.length - 1] === "0" && (n.minFractionDigits = f.length - l - 1), n;
    },
    stringify: h.stringifyNumber
  };
  return Ot.float = v, Ot.floatExp = u, Ot.floatNaN = m, Ot;
}
var xt = {}, ca;
function No() {
  if (ca) return xt;
  ca = 1;
  var d = Ft();
  const h = (l) => typeof l == "bigint" || Number.isInteger(l), m = (l, a, o, { intAsBigInt: r }) => r ? BigInt(l) : parseInt(l.substring(a), o);
  function u(l, a, o) {
    const { value: r } = l;
    return h(r) && r >= 0 ? o + r.toString(a) : d.stringifyNumber(l);
  }
  const v = {
    identify: (l) => h(l) && l >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (l, a, o) => m(l, 2, 8, o),
    stringify: (l) => u(l, 8, "0o")
  }, f = {
    identify: h,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (l, a, o) => m(l, 0, 10, o),
    stringify: d.stringifyNumber
  }, n = {
    identify: (l) => h(l) && l >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (l, a, o) => m(l, 2, 16, o),
    stringify: (l) => u(l, 16, "0x")
  };
  return xt.int = f, xt.intHex = n, xt.intOct = v, xt;
}
var Kr = {}, ha;
function yl() {
  if (ha) return Kr;
  ha = 1;
  var d = qt(), h = En(), m = Bt(), u = vr(), v = To(), f = Ro(), n = No();
  const l = [
    d.map,
    m.seq,
    u.string,
    h.nullTag,
    v.boolTag,
    n.intOct,
    n.int,
    n.intHex,
    f.floatNaN,
    f.floatExp,
    f.float
  ];
  return Kr.schema = l, Kr;
}
var Wr = {}, da;
function _l() {
  if (da) return Wr;
  da = 1;
  var d = Re(), h = qt(), m = Bt();
  function u(a) {
    return typeof a == "bigint" || Number.isInteger(a);
  }
  const v = ({ value: a }) => JSON.stringify(a), f = [
    {
      identify: (a) => typeof a == "string",
      default: !0,
      tag: "tag:yaml.org,2002:str",
      resolve: (a) => a,
      stringify: v
    },
    {
      identify: (a) => a == null,
      createNode: () => new d.Scalar(null),
      default: !0,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: v
    },
    {
      identify: (a) => typeof a == "boolean",
      default: !0,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (a) => a === "true",
      stringify: v
    },
    {
      identify: u,
      default: !0,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (a, o, { intAsBigInt: r }) => r ? BigInt(a) : parseInt(a, 10),
      stringify: ({ value: a }) => u(a) ? a.toString() : JSON.stringify(a)
    },
    {
      identify: (a) => typeof a == "number",
      default: !0,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (a) => parseFloat(a),
      stringify: v
    }
  ], n = {
    default: !0,
    tag: "",
    test: /^/,
    resolve(a, o) {
      return o(`Unresolved plain scalar ${JSON.stringify(a)}`), a;
    }
  }, l = [h.map, m.seq].concat(f, n);
  return Wr.schema = l, Wr;
}
var Hr = {}, pa;
function Oo() {
  if (pa) return Hr;
  pa = 1;
  var d = _n, h = Re(), m = mr();
  const u = {
    identify: (v) => v instanceof Uint8Array,
    // Buffer inherits from Uint8Array
    default: !1,
    tag: "tag:yaml.org,2002:binary",
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(v, f) {
      if (typeof d.Buffer == "function")
        return d.Buffer.from(v, "base64");
      if (typeof atob == "function") {
        const n = atob(v.replace(/[\n\r]/g, "")), l = new Uint8Array(n.length);
        for (let a = 0; a < n.length; ++a)
          l[a] = n.charCodeAt(a);
        return l;
      } else
        return f("This environment does not support reading binary tags; either Buffer or atob is required"), v;
    },
    stringify({ comment: v, type: f, value: n }, l, a, o) {
      if (!n)
        return "";
      const r = n;
      let e;
      if (typeof d.Buffer == "function")
        e = r instanceof d.Buffer ? r.toString("base64") : d.Buffer.from(r.buffer).toString("base64");
      else if (typeof btoa == "function") {
        let t = "";
        for (let i = 0; i < r.length; ++i)
          t += String.fromCharCode(r[i]);
        e = btoa(t);
      } else
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      if (f ?? (f = h.Scalar.BLOCK_LITERAL), f !== h.Scalar.QUOTE_DOUBLE) {
        const t = Math.max(l.options.lineWidth - l.indent.length, l.options.minContentWidth), i = Math.ceil(e.length / t), s = new Array(i);
        for (let c = 0, y = 0; c < i; ++c, y += t)
          s[c] = e.substr(y, t);
        e = s.join(f === h.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return m.stringifyString({ comment: v, type: f, value: e }, l, a, o);
    }
  };
  return Hr.binary = u, Hr;
}
var er = {}, It = {}, ma;
function Cn() {
  if (ma) return It;
  ma = 1;
  var d = ye(), h = pt(), m = Re(), u = gt();
  function v(l, a) {
    if (d.isSeq(l))
      for (let o = 0; o < l.items.length; ++o) {
        let r = l.items[o];
        if (!d.isPair(r)) {
          if (d.isMap(r)) {
            r.items.length > 1 && a("Each pair must have its own sequence indicator");
            const e = r.items[0] || new h.Pair(new m.Scalar(null));
            if (r.commentBefore && (e.key.commentBefore = e.key.commentBefore ? `${r.commentBefore}
${e.key.commentBefore}` : r.commentBefore), r.comment) {
              const t = e.value ?? e.key;
              t.comment = t.comment ? `${r.comment}
${t.comment}` : r.comment;
            }
            r = e;
          }
          l.items[o] = d.isPair(r) ? r : new h.Pair(r);
        }
      }
    else
      a("Expected a sequence for this tag");
    return l;
  }
  function f(l, a, o) {
    const { replacer: r } = o, e = new u.YAMLSeq(l);
    e.tag = "tag:yaml.org,2002:pairs";
    let t = 0;
    if (a && Symbol.iterator in Object(a))
      for (let i of a) {
        typeof r == "function" && (i = r.call(a, String(t++), i));
        let s, c;
        if (Array.isArray(i))
          if (i.length === 2)
            s = i[0], c = i[1];
          else
            throw new TypeError(`Expected [key, value] tuple: ${i}`);
        else if (i && i instanceof Object) {
          const y = Object.keys(i);
          if (y.length === 1)
            s = y[0], c = i[s];
          else
            throw new TypeError(`Expected tuple with one key, not ${y.length} keys`);
        } else
          s = i;
        e.items.push(h.createPair(s, c, o));
      }
    return e;
  }
  const n = {
    collection: "seq",
    default: !1,
    tag: "tag:yaml.org,2002:pairs",
    resolve: v,
    createNode: f
  };
  return It.createPairs = f, It.pairs = n, It.resolvePairs = v, It;
}
var ga;
function xo() {
  if (ga) return er;
  ga = 1;
  var d = ye(), h = dt(), m = mt(), u = gt(), v = Cn();
  class f extends u.YAMLSeq {
    constructor() {
      super(), this.add = m.YAMLMap.prototype.add.bind(this), this.delete = m.YAMLMap.prototype.delete.bind(this), this.get = m.YAMLMap.prototype.get.bind(this), this.has = m.YAMLMap.prototype.has.bind(this), this.set = m.YAMLMap.prototype.set.bind(this), this.tag = f.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(a, o) {
      if (!o)
        return super.toJSON(a);
      const r = /* @__PURE__ */ new Map();
      o != null && o.onCreate && o.onCreate(r);
      for (const e of this.items) {
        let t, i;
        if (d.isPair(e) ? (t = h.toJS(e.key, "", o), i = h.toJS(e.value, t, o)) : t = h.toJS(e, "", o), r.has(t))
          throw new Error("Ordered maps must not include duplicate keys");
        r.set(t, i);
      }
      return r;
    }
    static from(a, o, r) {
      const e = v.createPairs(a, o, r), t = new this();
      return t.items = e.items, t;
    }
  }
  f.tag = "tag:yaml.org,2002:omap";
  const n = {
    collection: "seq",
    identify: (l) => l instanceof Map,
    nodeClass: f,
    default: !1,
    tag: "tag:yaml.org,2002:omap",
    resolve(l, a) {
      const o = v.resolvePairs(l, a), r = [];
      for (const { key: e } of o.items)
        d.isScalar(e) && (r.includes(e.value) ? a(`Ordered maps must not include duplicate keys: ${e.value}`) : r.push(e.value));
      return Object.assign(new f(), o);
    },
    createNode: (l, a, o) => f.from(l, a, o)
  };
  return er.YAMLOMap = f, er.omap = n, er;
}
var Yr = {}, tr = {}, va;
function bl() {
  if (va) return tr;
  va = 1;
  var d = Re();
  function h({ value: v, source: f }, n) {
    return f && (v ? m : u).test.test(f) ? f : v ? n.options.trueStr : n.options.falseStr;
  }
  const m = {
    identify: (v) => v === !0,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new d.Scalar(!0),
    stringify: h
  }, u = {
    identify: (v) => v === !1,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new d.Scalar(!1),
    stringify: h
  };
  return tr.falseTag = u, tr.trueTag = m, tr;
}
var Dt = {}, ya;
function wl() {
  if (ya) return Dt;
  ya = 1;
  var d = Re(), h = Ft();
  const m = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (f) => f.slice(-3).toLowerCase() === "nan" ? NaN : f[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: h.stringifyNumber
  }, u = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (f) => parseFloat(f.replace(/_/g, "")),
    stringify(f) {
      const n = Number(f.value);
      return isFinite(n) ? n.toExponential() : h.stringifyNumber(f);
    }
  }, v = {
    identify: (f) => typeof f == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(f) {
      const n = new d.Scalar(parseFloat(f.replace(/_/g, ""))), l = f.indexOf(".");
      if (l !== -1) {
        const a = f.substring(l + 1).replace(/_/g, "");
        a[a.length - 1] === "0" && (n.minFractionDigits = a.length);
      }
      return n;
    },
    stringify: h.stringifyNumber
  };
  return Dt.float = v, Dt.floatExp = u, Dt.floatNaN = m, Dt;
}
var wt = {}, _a;
function Sl() {
  if (_a) return wt;
  _a = 1;
  var d = Ft();
  const h = (a) => typeof a == "bigint" || Number.isInteger(a);
  function m(a, o, r, { intAsBigInt: e }) {
    const t = a[0];
    if ((t === "-" || t === "+") && (o += 1), a = a.substring(o).replace(/_/g, ""), e) {
      switch (r) {
        case 2:
          a = `0b${a}`;
          break;
        case 8:
          a = `0o${a}`;
          break;
        case 16:
          a = `0x${a}`;
          break;
      }
      const s = BigInt(a);
      return t === "-" ? BigInt(-1) * s : s;
    }
    const i = parseInt(a, r);
    return t === "-" ? -1 * i : i;
  }
  function u(a, o, r) {
    const { value: e } = a;
    if (h(e)) {
      const t = e.toString(o);
      return e < 0 ? "-" + r + t.substr(1) : r + t;
    }
    return d.stringifyNumber(a);
  }
  const v = {
    identify: h,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (a, o, r) => m(a, 2, 2, r),
    stringify: (a) => u(a, 2, "0b")
  }, f = {
    identify: h,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (a, o, r) => m(a, 1, 8, r),
    stringify: (a) => u(a, 8, "0")
  }, n = {
    identify: h,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (a, o, r) => m(a, 0, 10, r),
    stringify: d.stringifyNumber
  }, l = {
    identify: h,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (a, o, r) => m(a, 2, 16, r),
    stringify: (a) => u(a, 16, "0x")
  };
  return wt.int = n, wt.intBin = v, wt.intHex = l, wt.intOct = f, wt;
}
var rr = {}, ba;
function Io() {
  if (ba) return rr;
  ba = 1;
  var d = ye(), h = pt(), m = mt();
  class u extends m.YAMLMap {
    constructor(n) {
      super(n), this.tag = u.tag;
    }
    add(n) {
      let l;
      d.isPair(n) ? l = n : n && typeof n == "object" && "key" in n && "value" in n && n.value === null ? l = new h.Pair(n.key, null) : l = new h.Pair(n, null), m.findPair(this.items, l.key) || this.items.push(l);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(n, l) {
      const a = m.findPair(this.items, n);
      return !l && d.isPair(a) ? d.isScalar(a.key) ? a.key.value : a.key : a;
    }
    set(n, l) {
      if (typeof l != "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof l}`);
      const a = m.findPair(this.items, n);
      a && !l ? this.items.splice(this.items.indexOf(a), 1) : !a && l && this.items.push(new h.Pair(n));
    }
    toJSON(n, l) {
      return super.toJSON(n, l, Set);
    }
    toString(n, l, a) {
      if (!n)
        return JSON.stringify(this);
      if (this.hasAllNullValues(!0))
        return super.toString(Object.assign({}, n, { allNullValues: !0 }), l, a);
      throw new Error("Set items must all have null values");
    }
    static from(n, l, a) {
      const { replacer: o } = a, r = new this(n);
      if (l && Symbol.iterator in Object(l))
        for (let e of l)
          typeof o == "function" && (e = o.call(l, e, e)), r.items.push(h.createPair(e, null, a));
      return r;
    }
  }
  u.tag = "tag:yaml.org,2002:set";
  const v = {
    collection: "map",
    identify: (f) => f instanceof Set,
    nodeClass: u,
    default: !1,
    tag: "tag:yaml.org,2002:set",
    createNode: (f, n, l) => u.from(f, n, l),
    resolve(f, n) {
      if (d.isMap(f)) {
        if (f.hasAllNullValues(!0))
          return Object.assign(new u(), f);
        n("Set items must all have null values");
      } else
        n("Expected a mapping for this tag");
      return f;
    }
  };
  return rr.YAMLSet = u, rr.set = v, rr;
}
var Lt = {}, wa;
function Do() {
  if (wa) return Lt;
  wa = 1;
  var d = Ft();
  function h(n, l) {
    const a = n[0], o = a === "-" || a === "+" ? n.substring(1) : n, r = (t) => l ? BigInt(t) : Number(t), e = o.replace(/_/g, "").split(":").reduce((t, i) => t * r(60) + r(i), r(0));
    return a === "-" ? r(-1) * e : e;
  }
  function m(n) {
    let { value: l } = n, a = (t) => t;
    if (typeof l == "bigint")
      a = (t) => BigInt(t);
    else if (isNaN(l) || !isFinite(l))
      return d.stringifyNumber(n);
    let o = "";
    l < 0 && (o = "-", l *= a(-1));
    const r = a(60), e = [l % r];
    return l < 60 ? e.unshift(0) : (l = (l - e[0]) / r, e.unshift(l % r), l >= 60 && (l = (l - e[0]) / r, e.unshift(l))), o + e.map((t) => String(t).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  const u = {
    identify: (n) => typeof n == "bigint" || Number.isInteger(n),
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (n, l, { intAsBigInt: a }) => h(n, a),
    stringify: m
  }, v = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (n) => h(n, !1),
    stringify: m
  }, f = {
    identify: (n) => n instanceof Date,
    default: !0,
    tag: "tag:yaml.org,2002:timestamp",
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
    resolve(n) {
      const l = n.match(f.test);
      if (!l)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, a, o, r, e, t, i] = l.map(Number), s = l[7] ? Number((l[7] + "00").substr(1, 3)) : 0;
      let c = Date.UTC(a, o - 1, r, e || 0, t || 0, i || 0, s);
      const y = l[8];
      if (y && y !== "Z") {
        let g = h(y, !1);
        Math.abs(g) < 30 && (g *= 60), c -= 6e4 * g;
      }
      return new Date(c);
    },
    stringify: ({ value: n }) => (n == null ? void 0 : n.toISOString().replace(/(T00:00:00)?\.000Z$/, "")) ?? ""
  };
  return Lt.floatTime = v, Lt.intTime = u, Lt.timestamp = f, Lt;
}
var Sa;
function kl() {
  if (Sa) return Yr;
  Sa = 1;
  var d = qt(), h = En(), m = Bt(), u = vr(), v = Oo(), f = bl(), n = wl(), l = Sl(), a = An(), o = xo(), r = Cn(), e = Io(), t = Do();
  const i = [
    d.map,
    m.seq,
    u.string,
    h.nullTag,
    f.trueTag,
    f.falseTag,
    l.intBin,
    l.intOct,
    l.int,
    l.intHex,
    n.floatNaN,
    n.floatExp,
    n.float,
    v.binary,
    a.merge,
    o.omap,
    r.pairs,
    e.set,
    t.intTime,
    t.floatTime,
    t.timestamp
  ];
  return Yr.schema = i, Yr;
}
var ka;
function Al() {
  if (ka) return Qt;
  ka = 1;
  var d = qt(), h = En(), m = Bt(), u = vr(), v = To(), f = Ro(), n = No(), l = yl(), a = _l(), o = Oo(), r = An(), e = xo(), t = Cn(), i = kl(), s = Io(), c = Do();
  const y = /* @__PURE__ */ new Map([
    ["core", l.schema],
    ["failsafe", [d.map, m.seq, u.string]],
    ["json", a.schema],
    ["yaml11", i.schema],
    ["yaml-1.1", i.schema]
  ]), g = {
    binary: o.binary,
    bool: v.boolTag,
    float: f.float,
    floatExp: f.floatExp,
    floatNaN: f.floatNaN,
    floatTime: c.floatTime,
    int: n.int,
    intHex: n.intHex,
    intOct: n.intOct,
    intTime: c.intTime,
    map: d.map,
    merge: r.merge,
    null: h.nullTag,
    omap: e.omap,
    pairs: t.pairs,
    seq: m.seq,
    set: s.set,
    timestamp: c.timestamp
  }, _ = {
    "tag:yaml.org,2002:binary": o.binary,
    "tag:yaml.org,2002:merge": r.merge,
    "tag:yaml.org,2002:omap": e.omap,
    "tag:yaml.org,2002:pairs": t.pairs,
    "tag:yaml.org,2002:set": s.set,
    "tag:yaml.org,2002:timestamp": c.timestamp
  };
  function w(A, E, O) {
    const D = y.get(E);
    if (D && !A)
      return O && !D.includes(r.merge) ? D.concat(r.merge) : D.slice();
    let L = D;
    if (!L)
      if (Array.isArray(A))
        L = [];
      else {
        const P = Array.from(y.keys()).filter((K) => K !== "yaml11").map((K) => JSON.stringify(K)).join(", ");
        throw new Error(`Unknown schema "${E}"; use one of ${P} or define customTags array`);
      }
    if (Array.isArray(A))
      for (const P of A)
        L = L.concat(P);
    else typeof A == "function" && (L = A(L.slice()));
    return O && (L = L.concat(r.merge)), L.reduce((P, K) => {
      const V = typeof K == "string" ? g[K] : K;
      if (!V) {
        const W = JSON.stringify(K), H = Object.keys(g).map((re) => JSON.stringify(re)).join(", ");
        throw new Error(`Unknown custom tag ${W}; use one of ${H}`);
      }
      return P.includes(V) || P.push(V), P;
    }, []);
  }
  return Qt.coreKnownTags = _, Qt.getTags = w, Qt;
}
var Aa;
function Po() {
  if (Aa) return Pr;
  Aa = 1;
  var d = ye(), h = qt(), m = Bt(), u = vr(), v = Al();
  const f = (l, a) => l.key < a.key ? -1 : l.key > a.key ? 1 : 0;
  let n = class Lo {
    constructor({ compat: a, customTags: o, merge: r, resolveKnownTags: e, schema: t, sortMapEntries: i, toStringDefaults: s }) {
      this.compat = Array.isArray(a) ? v.getTags(a, "compat") : a ? v.getTags(null, a) : null, this.name = typeof t == "string" && t || "core", this.knownTags = e ? v.coreKnownTags : {}, this.tags = v.getTags(o, this.name, r), this.toStringOptions = s ?? null, Object.defineProperty(this, d.MAP, { value: h.map }), Object.defineProperty(this, d.SCALAR, { value: u.string }), Object.defineProperty(this, d.SEQ, { value: m.seq }), this.sortMapEntries = typeof i == "function" ? i : i === !0 ? f : null;
    }
    clone() {
      const a = Object.create(Lo.prototype, Object.getOwnPropertyDescriptors(this));
      return a.tags = this.tags.slice(), a;
    }
  };
  return Pr.Schema = n, Pr;
}
var Zr = {}, Ea;
function El() {
  if (Ea) return Zr;
  Ea = 1;
  var d = ye(), h = gr(), m = pr();
  function u(v, f) {
    var t;
    const n = [];
    let l = f.directives === !0;
    if (f.directives !== !1 && v.directives) {
      const i = v.directives.toString(v);
      i ? (n.push(i), l = !0) : v.directives.docStart && (l = !0);
    }
    l && n.push("---");
    const a = h.createStringifyContext(v, f), { commentString: o } = a.options;
    if (v.commentBefore) {
      n.length !== 1 && n.unshift("");
      const i = o(v.commentBefore);
      n.unshift(m.indentComment(i, ""));
    }
    let r = !1, e = null;
    if (v.contents) {
      if (d.isNode(v.contents)) {
        if (v.contents.spaceBefore && l && n.push(""), v.contents.commentBefore) {
          const c = o(v.contents.commentBefore);
          n.push(m.indentComment(c, ""));
        }
        a.forceBlockIndent = !!v.comment, e = v.contents.comment;
      }
      const i = e ? void 0 : () => r = !0;
      let s = h.stringify(v.contents, a, () => e = null, i);
      e && (s += m.lineComment(s, "", o(e))), (s[0] === "|" || s[0] === ">") && n[n.length - 1] === "---" ? n[n.length - 1] = `--- ${s}` : n.push(s);
    } else
      n.push(h.stringify(v.contents, a));
    if ((t = v.directives) != null && t.docEnd)
      if (v.comment) {
        const i = o(v.comment);
        i.includes(`
`) ? (n.push("..."), n.push(m.indentComment(i, ""))) : n.push(`... ${i}`);
      } else
        n.push("...");
    else {
      let i = v.comment;
      i && r && (i = i.replace(/^\n+/, "")), i && ((!r || e) && n[n.length - 1] !== "" && n.push(""), n.push(m.indentComment(o(i), "")));
    }
    return n.join(`
`) + `
`;
  }
  return Zr.stringifyDocument = u, Zr;
}
var Ca;
function yr() {
  if (Ca) return Cr;
  Ca = 1;
  var d = hr(), h = kn(), m = ye(), u = pt(), v = dt(), f = Po(), n = El(), l = wn(), a = So(), o = dr(), r = wo();
  let e = class Mo {
    constructor(s, c, y) {
      this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, m.NODE_TYPE, { value: m.DOC });
      let g = null;
      typeof c == "function" || Array.isArray(c) ? g = c : y === void 0 && c && (y = c, c = void 0);
      const _ = Object.assign({
        intAsBigInt: !1,
        keepSourceTokens: !1,
        logLevel: "warn",
        prettyErrors: !0,
        strict: !0,
        stringKeys: !1,
        uniqueKeys: !0,
        version: "1.2"
      }, y);
      this.options = _;
      let { version: w } = _;
      y != null && y._directives ? (this.directives = y._directives.atDocument(), this.directives.yaml.explicit && (w = this.directives.yaml.version)) : this.directives = new r.Directives({ version: w }), this.setSchema(w, y), this.contents = s === void 0 ? null : this.createNode(s, g, y);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
      const s = Object.create(Mo.prototype, {
        [m.NODE_TYPE]: { value: m.DOC }
      });
      return s.commentBefore = this.commentBefore, s.comment = this.comment, s.errors = this.errors.slice(), s.warnings = this.warnings.slice(), s.options = Object.assign({}, this.options), this.directives && (s.directives = this.directives.clone()), s.schema = this.schema.clone(), s.contents = m.isNode(this.contents) ? this.contents.clone(s.schema) : this.contents, this.range && (s.range = this.range.slice()), s;
    }
    /** Adds a value to the document. */
    add(s) {
      t(this.contents) && this.contents.add(s);
    }
    /** Adds a value to the document. */
    addIn(s, c) {
      t(this.contents) && this.contents.addIn(s, c);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(s, c) {
      if (!s.anchor) {
        const y = l.anchorNames(this);
        s.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !c || y.has(c) ? l.findNewAnchor(c || "a", y) : c;
      }
      return new d.Alias(s.anchor);
    }
    createNode(s, c, y) {
      let g;
      if (typeof c == "function")
        s = c.call({ "": s }, "", s), g = c;
      else if (Array.isArray(c)) {
        const H = (ue) => typeof ue == "number" || ue instanceof String || ue instanceof Number, re = c.filter(H).map(String);
        re.length > 0 && (c = c.concat(re)), g = c;
      } else y === void 0 && c && (y = c, c = void 0);
      const { aliasDuplicateObjects: _, anchorPrefix: w, flow: A, keepUndefined: E, onTagObj: O, tag: D } = y ?? {}, { onAnchor: L, setAnchors: P, sourceObjects: K } = l.createNodeAnchors(
        this,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        w || "a"
      ), V = {
        aliasDuplicateObjects: _ ?? !0,
        keepUndefined: E ?? !1,
        onAnchor: L,
        onTagObj: O,
        replacer: g,
        schema: this.schema,
        sourceObjects: K
      }, W = o.createNode(s, D, V);
      return A && m.isCollection(W) && (W.flow = !0), P(), W;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(s, c, y = {}) {
      const g = this.createNode(s, null, y), _ = this.createNode(c, null, y);
      return new u.Pair(g, _);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(s) {
      return t(this.contents) ? this.contents.delete(s) : !1;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(s) {
      return h.isEmptyPath(s) ? this.contents == null ? !1 : (this.contents = null, !0) : t(this.contents) ? this.contents.deleteIn(s) : !1;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(s, c) {
      return m.isCollection(this.contents) ? this.contents.get(s, c) : void 0;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(s, c) {
      return h.isEmptyPath(s) ? !c && m.isScalar(this.contents) ? this.contents.value : this.contents : m.isCollection(this.contents) ? this.contents.getIn(s, c) : void 0;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(s) {
      return m.isCollection(this.contents) ? this.contents.has(s) : !1;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(s) {
      return h.isEmptyPath(s) ? this.contents !== void 0 : m.isCollection(this.contents) ? this.contents.hasIn(s) : !1;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(s, c) {
      this.contents == null ? this.contents = h.collectionFromPath(this.schema, [s], c) : t(this.contents) && this.contents.set(s, c);
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(s, c) {
      h.isEmptyPath(s) ? this.contents = c : this.contents == null ? this.contents = h.collectionFromPath(this.schema, Array.from(s), c) : t(this.contents) && this.contents.setIn(s, c);
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(s, c = {}) {
      typeof s == "number" && (s = String(s));
      let y;
      switch (s) {
        case "1.1":
          this.directives ? this.directives.yaml.version = "1.1" : this.directives = new r.Directives({ version: "1.1" }), y = { resolveKnownTags: !1, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          this.directives ? this.directives.yaml.version = s : this.directives = new r.Directives({ version: s }), y = { resolveKnownTags: !0, schema: "core" };
          break;
        case null:
          this.directives && delete this.directives, y = null;
          break;
        default: {
          const g = JSON.stringify(s);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${g}`);
        }
      }
      if (c.schema instanceof Object)
        this.schema = c.schema;
      else if (y)
        this.schema = new f.Schema(Object.assign(y, c));
      else
        throw new Error("With a null YAML version, the { schema: Schema } option is required");
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json: s, jsonArg: c, mapAsMap: y, maxAliasCount: g, onAnchor: _, reviver: w } = {}) {
      const A = {
        anchors: /* @__PURE__ */ new Map(),
        doc: this,
        keep: !s,
        mapAsMap: y === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof g == "number" ? g : 100
      }, E = v.toJS(this.contents, c ?? "", A);
      if (typeof _ == "function")
        for (const { count: O, res: D } of A.anchors.values())
          _(D, O);
      return typeof w == "function" ? a.applyReviver(w, { "": E }, "", E) : E;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(s, c) {
      return this.toJS({ json: !0, jsonArg: s, mapAsMap: !1, onAnchor: c });
    }
    /** A YAML representation of the document. */
    toString(s = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in s && (!Number.isInteger(s.indent) || Number(s.indent) <= 0)) {
        const c = JSON.stringify(s.indent);
        throw new Error(`"indent" option must be a positive integer, not ${c}`);
      }
      return n.stringifyDocument(this, s);
    }
  };
  function t(i) {
    if (m.isCollection(i))
      return !0;
    throw new Error("Expected a YAML collection as document contents");
  }
  return Cr.Document = e, Cr;
}
var St = {}, Ta;
function _r() {
  if (Ta) return St;
  Ta = 1;
  class d extends Error {
    constructor(f, n, l, a) {
      super(), this.name = f, this.code = l, this.message = a, this.pos = n;
    }
  }
  class h extends d {
    constructor(f, n, l) {
      super("YAMLParseError", f, n, l);
    }
  }
  class m extends d {
    constructor(f, n, l) {
      super("YAMLWarning", f, n, l);
    }
  }
  const u = (v, f) => (n) => {
    if (n.pos[0] === -1)
      return;
    n.linePos = n.pos.map((e) => f.linePos(e));
    const { line: l, col: a } = n.linePos[0];
    n.message += ` at line ${l}, column ${a}`;
    let o = a - 1, r = v.substring(f.lineStarts[l - 1], f.lineStarts[l]).replace(/[\n\r]+$/, "");
    if (o >= 60 && r.length > 80) {
      const e = Math.min(o - 39, r.length - 79);
      r = "…" + r.substring(e), o -= e - 1;
    }
    if (r.length > 80 && (r = r.substring(0, 79) + "…"), l > 1 && /^ *$/.test(r.substring(0, o))) {
      let e = v.substring(f.lineStarts[l - 2], f.lineStarts[l - 1]);
      e.length > 80 && (e = e.substring(0, 79) + `…
`), r = e + r;
    }
    if (/[^ ]/.test(r)) {
      let e = 1;
      const t = n.linePos[1];
      (t == null ? void 0 : t.line) === l && t.col > a && (e = Math.max(1, Math.min(t.col - a, 80 - o)));
      const i = " ".repeat(o) + "^".repeat(e);
      n.message += `:

${r}
${i}
`;
    }
  };
  return St.YAMLError = d, St.YAMLParseError = h, St.YAMLWarning = m, St.prettifyError = u, St;
}
var Jr = {}, ir = {}, Vr = {}, Gr = {}, Xr = {}, Ra;
function br() {
  if (Ra) return Xr;
  Ra = 1;
  function d(h, { flow: m, indicator: u, next: v, offset: f, onError: n, parentIndent: l, startOnNewline: a }) {
    let o = !1, r = a, e = a, t = "", i = "", s = !1, c = !1, y = null, g = null, _ = null, w = null, A = null, E = null, O = null;
    for (const P of h)
      switch (c && (P.type !== "space" && P.type !== "newline" && P.type !== "comma" && n(P.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), c = !1), y && (r && P.type !== "comment" && P.type !== "newline" && n(y, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), y = null), P.type) {
        case "space":
          !m && (u !== "doc-start" || (v == null ? void 0 : v.type) !== "flow-collection") && P.source.includes("	") && (y = P), e = !0;
          break;
        case "comment": {
          e || n(P, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const K = P.source.substring(1) || " ";
          t ? t += i + K : t = K, i = "", r = !1;
          break;
        }
        case "newline":
          r ? t ? t += P.source : (!E || u !== "seq-item-ind") && (o = !0) : i += P.source, r = !0, s = !0, (g || _) && (w = P), e = !0;
          break;
        case "anchor":
          g && n(P, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), P.source.endsWith(":") && n(P.offset + P.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), g = P, O ?? (O = P.offset), r = !1, e = !1, c = !0;
          break;
        case "tag": {
          _ && n(P, "MULTIPLE_TAGS", "A node can have at most one tag"), _ = P, O ?? (O = P.offset), r = !1, e = !1, c = !0;
          break;
        }
        case u:
          (g || _) && n(P, "BAD_PROP_ORDER", `Anchors and tags must be after the ${P.source} indicator`), E && n(P, "UNEXPECTED_TOKEN", `Unexpected ${P.source} in ${m ?? "collection"}`), E = P, r = u === "seq-item-ind" || u === "explicit-key-ind", e = !1;
          break;
        case "comma":
          if (m) {
            A && n(P, "UNEXPECTED_TOKEN", `Unexpected , in ${m}`), A = P, r = !1, e = !1;
            break;
          }
        // else fallthrough
        default:
          n(P, "UNEXPECTED_TOKEN", `Unexpected ${P.type} token`), r = !1, e = !1;
      }
    const D = h[h.length - 1], L = D ? D.offset + D.source.length : f;
    return c && v && v.type !== "space" && v.type !== "newline" && v.type !== "comma" && (v.type !== "scalar" || v.source !== "") && n(v.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), y && (r && y.indent <= l || (v == null ? void 0 : v.type) === "block-map" || (v == null ? void 0 : v.type) === "block-seq") && n(y, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
      comma: A,
      found: E,
      spaceBefore: o,
      comment: t,
      hasNewline: s,
      anchor: g,
      tag: _,
      newlineAfterProp: w,
      end: L,
      start: O ?? L
    };
  }
  return Xr.resolveProps = d, Xr;
}
var Qr = {}, Na;
function Tn() {
  if (Na) return Qr;
  Na = 1;
  function d(h) {
    if (!h)
      return null;
    switch (h.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (h.source.includes(`
`))
          return !0;
        if (h.end) {
          for (const m of h.end)
            if (m.type === "newline")
              return !0;
        }
        return !1;
      case "flow-collection":
        for (const m of h.items) {
          for (const u of m.start)
            if (u.type === "newline")
              return !0;
          if (m.sep) {
            for (const u of m.sep)
              if (u.type === "newline")
                return !0;
          }
          if (d(m.key) || d(m.value))
            return !0;
        }
        return !1;
      default:
        return !0;
    }
  }
  return Qr.containsNewline = d, Qr;
}
var ei = {}, Oa;
function qo() {
  if (Oa) return ei;
  Oa = 1;
  var d = Tn();
  function h(m, u, v) {
    if ((u == null ? void 0 : u.type) === "flow-collection") {
      const f = u.end[0];
      f.indent === m && (f.source === "]" || f.source === "}") && d.containsNewline(u) && v(f, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
    }
  }
  return ei.flowIndentCheck = h, ei;
}
var ti = {}, xa;
function Bo() {
  if (xa) return ti;
  xa = 1;
  var d = ye();
  function h(m, u, v) {
    const { uniqueKeys: f } = m.options;
    if (f === !1)
      return !1;
    const n = typeof f == "function" ? f : (l, a) => l === a || d.isScalar(l) && d.isScalar(a) && l.value === a.value;
    return u.some((l) => n(l.key, v));
  }
  return ti.mapIncludes = h, ti;
}
var Ia;
function Cl() {
  if (Ia) return Gr;
  Ia = 1;
  var d = pt(), h = mt(), m = br(), u = Tn(), v = qo(), f = Bo();
  const n = "All mapping items must start at the same column";
  function l({ composeNode: a, composeEmptyNode: o }, r, e, t, i) {
    var _;
    const s = (i == null ? void 0 : i.nodeClass) ?? h.YAMLMap, c = new s(r.schema);
    r.atRoot && (r.atRoot = !1);
    let y = e.offset, g = null;
    for (const w of e.items) {
      const { start: A, key: E, sep: O, value: D } = w, L = m.resolveProps(A, {
        indicator: "explicit-key-ind",
        next: E ?? (O == null ? void 0 : O[0]),
        offset: y,
        onError: t,
        parentIndent: e.indent,
        startOnNewline: !0
      }), P = !L.found;
      if (P) {
        if (E && (E.type === "block-seq" ? t(y, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in E && E.indent !== e.indent && t(y, "BAD_INDENT", n)), !L.anchor && !L.tag && !O) {
          g = L.end, L.comment && (c.comment ? c.comment += `
` + L.comment : c.comment = L.comment);
          continue;
        }
        (L.newlineAfterProp || u.containsNewline(E)) && t(E ?? A[A.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      } else ((_ = L.found) == null ? void 0 : _.indent) !== e.indent && t(y, "BAD_INDENT", n);
      r.atKey = !0;
      const K = L.end, V = E ? a(r, E, L, t) : o(r, K, A, null, L, t);
      r.schema.compat && v.flowIndentCheck(e.indent, E, t), r.atKey = !1, f.mapIncludes(r, c.items, V) && t(K, "DUPLICATE_KEY", "Map keys must be unique");
      const W = m.resolveProps(O ?? [], {
        indicator: "map-value-ind",
        next: D,
        offset: V.range[2],
        onError: t,
        parentIndent: e.indent,
        startOnNewline: !E || E.type === "block-scalar"
      });
      if (y = W.end, W.found) {
        P && ((D == null ? void 0 : D.type) === "block-map" && !W.hasNewline && t(y, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), r.options.strict && L.start < W.found.offset - 1024 && t(V.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
        const H = D ? a(r, D, W, t) : o(r, y, O, null, W, t);
        r.schema.compat && v.flowIndentCheck(e.indent, D, t), y = H.range[2];
        const re = new d.Pair(V, H);
        r.options.keepSourceTokens && (re.srcToken = w), c.items.push(re);
      } else {
        P && t(V.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), W.comment && (V.comment ? V.comment += `
` + W.comment : V.comment = W.comment);
        const H = new d.Pair(V);
        r.options.keepSourceTokens && (H.srcToken = w), c.items.push(H);
      }
    }
    return g && g < y && t(g, "IMPOSSIBLE", "Map comment with trailing content"), c.range = [e.offset, y, g ?? y], c;
  }
  return Gr.resolveBlockMap = l, Gr;
}
var ri = {}, Da;
function Tl() {
  if (Da) return ri;
  Da = 1;
  var d = gt(), h = br(), m = qo();
  function u({ composeNode: v, composeEmptyNode: f }, n, l, a, o) {
    const r = (o == null ? void 0 : o.nodeClass) ?? d.YAMLSeq, e = new r(n.schema);
    n.atRoot && (n.atRoot = !1), n.atKey && (n.atKey = !1);
    let t = l.offset, i = null;
    for (const { start: s, value: c } of l.items) {
      const y = h.resolveProps(s, {
        indicator: "seq-item-ind",
        next: c,
        offset: t,
        onError: a,
        parentIndent: l.indent,
        startOnNewline: !0
      });
      if (!y.found)
        if (y.anchor || y.tag || c)
          (c == null ? void 0 : c.type) === "block-seq" ? a(y.end, "BAD_INDENT", "All sequence items must start at the same column") : a(t, "MISSING_CHAR", "Sequence item without - indicator");
        else {
          i = y.end, y.comment && (e.comment = y.comment);
          continue;
        }
      const g = c ? v(n, c, y, a) : f(n, y.end, s, null, y, a);
      n.schema.compat && m.flowIndentCheck(l.indent, c, a), t = g.range[2], e.items.push(g);
    }
    return e.range = [l.offset, t, i ?? t], e;
  }
  return ri.resolveBlockSeq = u, ri;
}
var ii = {}, ni = {}, La;
function jt() {
  if (La) return ni;
  La = 1;
  function d(h, m, u, v) {
    let f = "";
    if (h) {
      let n = !1, l = "";
      for (const a of h) {
        const { source: o, type: r } = a;
        switch (r) {
          case "space":
            n = !0;
            break;
          case "comment": {
            u && !n && v(a, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const e = o.substring(1) || " ";
            f ? f += l + e : f = e, l = "";
            break;
          }
          case "newline":
            f && (l += o), n = !0;
            break;
          default:
            v(a, "UNEXPECTED_TOKEN", `Unexpected ${r} at node end`);
        }
        m += o.length;
      }
    }
    return { comment: f, offset: m };
  }
  return ni.resolveEnd = d, ni;
}
var Pa;
function Rl() {
  if (Pa) return ii;
  Pa = 1;
  var d = ye(), h = pt(), m = mt(), u = gt(), v = jt(), f = br(), n = Tn(), l = Bo();
  const a = "Block collections are not allowed within flow collections", o = (e) => e && (e.type === "block-map" || e.type === "block-seq");
  function r({ composeNode: e, composeEmptyNode: t }, i, s, c, y) {
    var V;
    const g = s.start.source === "{", _ = g ? "flow map" : "flow sequence", w = (y == null ? void 0 : y.nodeClass) ?? (g ? m.YAMLMap : u.YAMLSeq), A = new w(i.schema);
    A.flow = !0;
    const E = i.atRoot;
    E && (i.atRoot = !1), i.atKey && (i.atKey = !1);
    let O = s.offset + s.start.source.length;
    for (let W = 0; W < s.items.length; ++W) {
      const H = s.items[W], { start: re, key: ue, sep: ce, value: R } = H, I = f.resolveProps(re, {
        flow: _,
        indicator: "explicit-key-ind",
        next: ue ?? (ce == null ? void 0 : ce[0]),
        offset: O,
        onError: c,
        parentIndent: s.indent,
        startOnNewline: !1
      });
      if (!I.found) {
        if (!I.anchor && !I.tag && !ce && !R) {
          W === 0 && I.comma ? c(I.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${_}`) : W < s.items.length - 1 && c(I.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${_}`), I.comment && (A.comment ? A.comment += `
` + I.comment : A.comment = I.comment), O = I.end;
          continue;
        }
        !g && i.options.strict && n.containsNewline(ue) && c(
          ue,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
      }
      if (W === 0)
        I.comma && c(I.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${_}`);
      else if (I.comma || c(I.start, "MISSING_CHAR", `Missing , between ${_} items`), I.comment) {
        let F = "";
        e: for (const Z of re)
          switch (Z.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              F = Z.source.substring(1);
              break e;
            default:
              break e;
          }
        if (F) {
          let Z = A.items[A.items.length - 1];
          d.isPair(Z) && (Z = Z.value ?? Z.key), Z.comment ? Z.comment += `
` + F : Z.comment = F, I.comment = I.comment.substring(F.length + 1);
        }
      }
      if (!g && !ce && !I.found) {
        const F = R ? e(i, R, I, c) : t(i, I.end, ce, null, I, c);
        A.items.push(F), O = F.range[2], o(R) && c(F.range, "BLOCK_IN_FLOW", a);
      } else {
        i.atKey = !0;
        const F = I.end, Z = ue ? e(i, ue, I, c) : t(i, F, re, null, I, c);
        o(ue) && c(Z.range, "BLOCK_IN_FLOW", a), i.atKey = !1;
        const te = f.resolveProps(ce ?? [], {
          flow: _,
          indicator: "map-value-ind",
          next: R,
          offset: Z.range[2],
          onError: c,
          parentIndent: s.indent,
          startOnNewline: !1
        });
        if (te.found) {
          if (!g && !I.found && i.options.strict) {
            if (ce)
              for (const he of ce) {
                if (he === te.found)
                  break;
                if (he.type === "newline") {
                  c(he, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            I.start < te.found.offset - 1024 && c(te.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else R && ("source" in R && ((V = R.source) == null ? void 0 : V[0]) === ":" ? c(R, "MISSING_CHAR", `Missing space after : in ${_}`) : c(te.start, "MISSING_CHAR", `Missing , or : between ${_} items`));
        const ie = R ? e(i, R, te, c) : te.found ? t(i, te.end, ce, null, te, c) : null;
        ie ? o(R) && c(ie.range, "BLOCK_IN_FLOW", a) : te.comment && (Z.comment ? Z.comment += `
` + te.comment : Z.comment = te.comment);
        const se = new h.Pair(Z, ie);
        if (i.options.keepSourceTokens && (se.srcToken = H), g) {
          const he = A;
          l.mapIncludes(i, he.items, Z) && c(F, "DUPLICATE_KEY", "Map keys must be unique"), he.items.push(se);
        } else {
          const he = new m.YAMLMap(i.schema);
          he.flow = !0, he.items.push(se);
          const _e = (ie ?? Z).range;
          he.range = [Z.range[0], _e[1], _e[2]], A.items.push(he);
        }
        O = ie ? ie.range[2] : te.end;
      }
    }
    const D = g ? "}" : "]", [L, ...P] = s.end;
    let K = O;
    if ((L == null ? void 0 : L.source) === D)
      K = L.offset + L.source.length;
    else {
      const W = _[0].toUpperCase() + _.substring(1), H = E ? `${W} must end with a ${D}` : `${W} in block collection must be sufficiently indented and end with a ${D}`;
      c(O, E ? "MISSING_CHAR" : "BAD_INDENT", H), L && L.source.length !== 1 && P.unshift(L);
    }
    if (P.length > 0) {
      const W = v.resolveEnd(P, K, i.options.strict, c);
      W.comment && (A.comment ? A.comment += `
` + W.comment : A.comment = W.comment), A.range = [s.offset, K, W.offset];
    } else
      A.range = [s.offset, K, K];
    return A;
  }
  return ii.resolveFlowCollection = r, ii;
}
var Ma;
function Nl() {
  if (Ma) return Vr;
  Ma = 1;
  var d = ye(), h = Re(), m = mt(), u = gt(), v = Cl(), f = Tl(), n = Rl();
  function l(o, r, e, t, i, s) {
    const c = e.type === "block-map" ? v.resolveBlockMap(o, r, e, t, s) : e.type === "block-seq" ? f.resolveBlockSeq(o, r, e, t, s) : n.resolveFlowCollection(o, r, e, t, s), y = c.constructor;
    return i === "!" || i === y.tagName ? (c.tag = y.tagName, c) : (i && (c.tag = i), c);
  }
  function a(o, r, e, t, i) {
    var E;
    const s = t.tag, c = s ? r.directives.tagName(s.source, (O) => i(s, "TAG_RESOLVE_FAILED", O)) : null;
    if (e.type === "block-seq") {
      const { anchor: O, newlineAfterProp: D } = t, L = O && s ? O.offset > s.offset ? O : s : O ?? s;
      L && (!D || D.offset < L.offset) && i(L, "MISSING_CHAR", "Missing newline after block sequence props");
    }
    const y = e.type === "block-map" ? "map" : e.type === "block-seq" ? "seq" : e.start.source === "{" ? "map" : "seq";
    if (!s || !c || c === "!" || c === m.YAMLMap.tagName && y === "map" || c === u.YAMLSeq.tagName && y === "seq")
      return l(o, r, e, i, c);
    let g = r.schema.tags.find((O) => O.tag === c && O.collection === y);
    if (!g) {
      const O = r.schema.knownTags[c];
      if ((O == null ? void 0 : O.collection) === y)
        r.schema.tags.push(Object.assign({}, O, { default: !1 })), g = O;
      else
        return O ? i(s, "BAD_COLLECTION_TYPE", `${O.tag} used for ${y} collection, but expects ${O.collection ?? "scalar"}`, !0) : i(s, "TAG_RESOLVE_FAILED", `Unresolved tag: ${c}`, !0), l(o, r, e, i, c);
    }
    const _ = l(o, r, e, i, c, g), w = ((E = g.resolve) == null ? void 0 : E.call(g, _, (O) => i(s, "TAG_RESOLVE_FAILED", O), r.options)) ?? _, A = d.isNode(w) ? w : new h.Scalar(w);
    return A.range = _.range, A.tag = c, g != null && g.format && (A.format = g.format), A;
  }
  return Vr.composeCollection = a, Vr;
}
var ai = {}, si = {}, qa;
function Fo() {
  if (qa) return si;
  qa = 1;
  var d = Re();
  function h(v, f, n) {
    const l = f.offset, a = m(f, v.options.strict, n);
    if (!a)
      return { value: "", type: null, comment: "", range: [l, l, l] };
    const o = a.mode === ">" ? d.Scalar.BLOCK_FOLDED : d.Scalar.BLOCK_LITERAL, r = f.source ? u(f.source) : [];
    let e = r.length;
    for (let w = r.length - 1; w >= 0; --w) {
      const A = r[w][1];
      if (A === "" || A === "\r")
        e = w;
      else
        break;
    }
    if (e === 0) {
      const w = a.chomp === "+" && r.length > 0 ? `
`.repeat(Math.max(1, r.length - 1)) : "";
      let A = l + a.length;
      return f.source && (A += f.source.length), { value: w, type: o, comment: a.comment, range: [l, A, A] };
    }
    let t = f.indent + a.indent, i = f.offset + a.length, s = 0;
    for (let w = 0; w < e; ++w) {
      const [A, E] = r[w];
      if (E === "" || E === "\r")
        a.indent === 0 && A.length > t && (t = A.length);
      else {
        A.length < t && n(i + A.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), a.indent === 0 && (t = A.length), s = w, t === 0 && !v.atRoot && n(i, "BAD_INDENT", "Block scalar values in collections must be indented");
        break;
      }
      i += A.length + E.length + 1;
    }
    for (let w = r.length - 1; w >= e; --w)
      r[w][0].length > t && (e = w + 1);
    let c = "", y = "", g = !1;
    for (let w = 0; w < s; ++w)
      c += r[w][0].slice(t) + `
`;
    for (let w = s; w < e; ++w) {
      let [A, E] = r[w];
      i += A.length + E.length + 1;
      const O = E[E.length - 1] === "\r";
      if (O && (E = E.slice(0, -1)), E && A.length < t) {
        const L = `Block scalar lines must not be less indented than their ${a.indent ? "explicit indentation indicator" : "first line"}`;
        n(i - E.length - (O ? 2 : 1), "BAD_INDENT", L), A = "";
      }
      o === d.Scalar.BLOCK_LITERAL ? (c += y + A.slice(t) + E, y = `
`) : A.length > t || E[0] === "	" ? (y === " " ? y = `
` : !g && y === `
` && (y = `

`), c += y + A.slice(t) + E, y = `
`, g = !0) : E === "" ? y === `
` ? c += `
` : y = `
` : (c += y + E, y = " ", g = !1);
    }
    switch (a.chomp) {
      case "-":
        break;
      case "+":
        for (let w = e; w < r.length; ++w)
          c += `
` + r[w][0].slice(t);
        c[c.length - 1] !== `
` && (c += `
`);
        break;
      default:
        c += `
`;
    }
    const _ = l + a.length + f.source.length;
    return { value: c, type: o, comment: a.comment, range: [l, _, _] };
  }
  function m({ offset: v, props: f }, n, l) {
    if (f[0].type !== "block-scalar-header")
      return l(f[0], "IMPOSSIBLE", "Block scalar header not found"), null;
    const { source: a } = f[0], o = a[0];
    let r = 0, e = "", t = -1;
    for (let y = 1; y < a.length; ++y) {
      const g = a[y];
      if (!e && (g === "-" || g === "+"))
        e = g;
      else {
        const _ = Number(g);
        !r && _ ? r = _ : t === -1 && (t = v + y);
      }
    }
    t !== -1 && l(t, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${a}`);
    let i = !1, s = "", c = a.length;
    for (let y = 1; y < f.length; ++y) {
      const g = f[y];
      switch (g.type) {
        case "space":
          i = !0;
        // fallthrough
        case "newline":
          c += g.source.length;
          break;
        case "comment":
          n && !i && l(g, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), c += g.source.length, s = g.source.substring(1);
          break;
        case "error":
          l(g, "UNEXPECTED_TOKEN", g.message), c += g.source.length;
          break;
        /* istanbul ignore next should not happen */
        default: {
          const _ = `Unexpected token in block scalar header: ${g.type}`;
          l(g, "UNEXPECTED_TOKEN", _);
          const w = g.source;
          w && typeof w == "string" && (c += w.length);
        }
      }
    }
    return { mode: o, indent: r, chomp: e, comment: s, length: c };
  }
  function u(v) {
    const f = v.split(/\n( *)/), n = f[0], l = n.match(/^( *)/), o = [l != null && l[1] ? [l[1], n.slice(l[1].length)] : ["", n]];
    for (let r = 1; r < f.length; r += 2)
      o.push([f[r], f[r + 1]]);
    return o;
  }
  return si.resolveBlockScalar = h, si;
}
var oi = {}, Ba;
function jo() {
  if (Ba) return oi;
  Ba = 1;
  var d = Re(), h = jt();
  function m(r, e, t) {
    const { offset: i, type: s, source: c, end: y } = r;
    let g, _;
    const w = (O, D, L) => t(i + O, D, L);
    switch (s) {
      case "scalar":
        g = d.Scalar.PLAIN, _ = u(c, w);
        break;
      case "single-quoted-scalar":
        g = d.Scalar.QUOTE_SINGLE, _ = v(c, w);
        break;
      case "double-quoted-scalar":
        g = d.Scalar.QUOTE_DOUBLE, _ = n(c, w);
        break;
      /* istanbul ignore next should not happen */
      default:
        return t(r, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${s}`), {
          value: "",
          type: null,
          comment: "",
          range: [i, i + c.length, i + c.length]
        };
    }
    const A = i + c.length, E = h.resolveEnd(y, A, e, t);
    return {
      value: _,
      type: g,
      comment: E.comment,
      range: [i, A, E.offset]
    };
  }
  function u(r, e) {
    let t = "";
    switch (r[0]) {
      /* istanbul ignore next should not happen */
      case "	":
        t = "a tab character";
        break;
      case ",":
        t = "flow indicator character ,";
        break;
      case "%":
        t = "directive indicator character %";
        break;
      case "|":
      case ">": {
        t = `block scalar indicator ${r[0]}`;
        break;
      }
      case "@":
      case "`": {
        t = `reserved character ${r[0]}`;
        break;
      }
    }
    return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), f(r);
  }
  function v(r, e) {
    return (r[r.length - 1] !== "'" || r.length === 1) && e(r.length, "MISSING_CHAR", "Missing closing 'quote"), f(r.slice(1, -1)).replace(/''/g, "'");
  }
  function f(r) {
    let e, t;
    try {
      e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let i = e.exec(r);
    if (!i)
      return r;
    let s = i[1], c = " ", y = e.lastIndex;
    for (t.lastIndex = y; i = t.exec(r); )
      i[1] === "" ? c === `
` ? s += c : c = `
` : (s += c + i[1], c = " "), y = t.lastIndex;
    const g = /[ \t]*(.*)/sy;
    return g.lastIndex = y, i = g.exec(r), s + c + ((i == null ? void 0 : i[1]) ?? "");
  }
  function n(r, e) {
    let t = "";
    for (let i = 1; i < r.length - 1; ++i) {
      const s = r[i];
      if (!(s === "\r" && r[i + 1] === `
`))
        if (s === `
`) {
          const { fold: c, offset: y } = l(r, i);
          t += c, i = y;
        } else if (s === "\\") {
          let c = r[++i];
          const y = a[c];
          if (y)
            t += y;
          else if (c === `
`)
            for (c = r[i + 1]; c === " " || c === "	"; )
              c = r[++i + 1];
          else if (c === "\r" && r[i + 1] === `
`)
            for (c = r[++i + 1]; c === " " || c === "	"; )
              c = r[++i + 1];
          else if (c === "x" || c === "u" || c === "U") {
            const g = { x: 2, u: 4, U: 8 }[c];
            t += o(r, i + 1, g, e), i += g;
          } else {
            const g = r.substr(i - 1, 2);
            e(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${g}`), t += g;
          }
        } else if (s === " " || s === "	") {
          const c = i;
          let y = r[i + 1];
          for (; y === " " || y === "	"; )
            y = r[++i + 1];
          y !== `
` && !(y === "\r" && r[i + 2] === `
`) && (t += i > c ? r.slice(c, i + 1) : s);
        } else
          t += s;
    }
    return (r[r.length - 1] !== '"' || r.length === 1) && e(r.length, "MISSING_CHAR", 'Missing closing "quote'), t;
  }
  function l(r, e) {
    let t = "", i = r[e + 1];
    for (; (i === " " || i === "	" || i === `
` || i === "\r") && !(i === "\r" && r[e + 2] !== `
`); )
      i === `
` && (t += `
`), e += 1, i = r[e + 1];
    return t || (t = " "), { fold: t, offset: e };
  }
  const a = {
    0: "\0",
    // null character
    a: "\x07",
    // bell character
    b: "\b",
    // backspace
    e: "\x1B",
    // escape character
    f: "\f",
    // form feed
    n: `
`,
    // line feed
    r: "\r",
    // carriage return
    t: "	",
    // horizontal tab
    v: "\v",
    // vertical tab
    N: "",
    // Unicode next line
    _: " ",
    // Unicode non-breaking space
    L: "\u2028",
    // Unicode line separator
    P: "\u2029",
    // Unicode paragraph separator
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "	": "	"
  };
  function o(r, e, t, i) {
    const s = r.substr(e, t), y = s.length === t && /^[0-9a-fA-F]+$/.test(s) ? parseInt(s, 16) : NaN;
    if (isNaN(y)) {
      const g = r.substr(e - 2, t + 2);
      return i(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${g}`), g;
    }
    return String.fromCodePoint(y);
  }
  return oi.resolveFlowScalar = m, oi;
}
var Fa;
function Ol() {
  if (Fa) return ai;
  Fa = 1;
  var d = ye(), h = Re(), m = Fo(), u = jo();
  function v(l, a, o, r) {
    const { value: e, type: t, comment: i, range: s } = a.type === "block-scalar" ? m.resolveBlockScalar(l, a, r) : u.resolveFlowScalar(a, l.options.strict, r), c = o ? l.directives.tagName(o.source, (_) => r(o, "TAG_RESOLVE_FAILED", _)) : null;
    let y;
    l.options.stringKeys && l.atKey ? y = l.schema[d.SCALAR] : c ? y = f(l.schema, e, c, o, r) : a.type === "scalar" ? y = n(l, e, a, r) : y = l.schema[d.SCALAR];
    let g;
    try {
      const _ = y.resolve(e, (w) => r(o ?? a, "TAG_RESOLVE_FAILED", w), l.options);
      g = d.isScalar(_) ? _ : new h.Scalar(_);
    } catch (_) {
      const w = _ instanceof Error ? _.message : String(_);
      r(o ?? a, "TAG_RESOLVE_FAILED", w), g = new h.Scalar(e);
    }
    return g.range = s, g.source = e, t && (g.type = t), c && (g.tag = c), y.format && (g.format = y.format), i && (g.comment = i), g;
  }
  function f(l, a, o, r, e) {
    var s;
    if (o === "!")
      return l[d.SCALAR];
    const t = [];
    for (const c of l.tags)
      if (!c.collection && c.tag === o)
        if (c.default && c.test)
          t.push(c);
        else
          return c;
    for (const c of t)
      if ((s = c.test) != null && s.test(a))
        return c;
    const i = l.knownTags[o];
    return i && !i.collection ? (l.tags.push(Object.assign({}, i, { default: !1, test: void 0 })), i) : (e(r, "TAG_RESOLVE_FAILED", `Unresolved tag: ${o}`, o !== "tag:yaml.org,2002:str"), l[d.SCALAR]);
  }
  function n({ atKey: l, directives: a, schema: o }, r, e, t) {
    const i = o.tags.find((s) => {
      var c;
      return (s.default === !0 || l && s.default === "key") && ((c = s.test) == null ? void 0 : c.test(r));
    }) || o[d.SCALAR];
    if (o.compat) {
      const s = o.compat.find((c) => {
        var y;
        return c.default && ((y = c.test) == null ? void 0 : y.test(r));
      }) ?? o[d.SCALAR];
      if (i.tag !== s.tag) {
        const c = a.tagString(i.tag), y = a.tagString(s.tag), g = `Value may be parsed as either ${c} or ${y}`;
        t(e, "TAG_RESOLVE_FAILED", g, !0);
      }
    }
    return i;
  }
  return ai.composeScalar = v, ai;
}
var li = {}, ja;
function xl() {
  if (ja) return li;
  ja = 1;
  function d(h, m, u) {
    if (m) {
      u ?? (u = m.length);
      for (let v = u - 1; v >= 0; --v) {
        let f = m[v];
        switch (f.type) {
          case "space":
          case "comment":
          case "newline":
            h -= f.source.length;
            continue;
        }
        for (f = m[++v]; (f == null ? void 0 : f.type) === "space"; )
          h += f.source.length, f = m[++v];
        break;
      }
    }
    return h;
  }
  return li.emptyScalarPosition = d, li;
}
var $a;
function Il() {
  if ($a) return ir;
  $a = 1;
  var d = hr(), h = ye(), m = Nl(), u = Ol(), v = jt(), f = xl();
  const n = { composeNode: l, composeEmptyNode: a };
  function l(r, e, t, i) {
    const s = r.atKey, { spaceBefore: c, comment: y, anchor: g, tag: _ } = t;
    let w, A = !0;
    switch (e.type) {
      case "alias":
        w = o(r, e, i), (g || _) && i(e, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        w = u.composeScalar(r, e, _, i), g && (w.anchor = g.source.substring(1));
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        w = m.composeCollection(n, r, e, t, i), g && (w.anchor = g.source.substring(1));
        break;
      default: {
        const E = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
        i(e, "UNEXPECTED_TOKEN", E), w = a(r, e.offset, void 0, null, t, i), A = !1;
      }
    }
    return g && w.anchor === "" && i(g, "BAD_ALIAS", "Anchor cannot be an empty string"), s && r.options.stringKeys && (!h.isScalar(w) || typeof w.value != "string" || w.tag && w.tag !== "tag:yaml.org,2002:str") && i(_ ?? e, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), c && (w.spaceBefore = !0), y && (e.type === "scalar" && e.source === "" ? w.comment = y : w.commentBefore = y), r.options.keepSourceTokens && A && (w.srcToken = e), w;
  }
  function a(r, e, t, i, { spaceBefore: s, comment: c, anchor: y, tag: g, end: _ }, w) {
    const A = {
      type: "scalar",
      offset: f.emptyScalarPosition(e, t, i),
      indent: -1,
      source: ""
    }, E = u.composeScalar(r, A, g, w);
    return y && (E.anchor = y.source.substring(1), E.anchor === "" && w(y, "BAD_ALIAS", "Anchor cannot be an empty string")), s && (E.spaceBefore = !0), c && (E.comment = c, E.range[2] = _), E;
  }
  function o({ options: r }, { offset: e, source: t, end: i }, s) {
    const c = new d.Alias(t.substring(1));
    c.source === "" && s(e, "BAD_ALIAS", "Alias cannot be an empty string"), c.source.endsWith(":") && s(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
    const y = e + t.length, g = v.resolveEnd(i, y, r.strict, s);
    return c.range = [e, y, g.offset], g.comment && (c.comment = g.comment), c;
  }
  return ir.composeEmptyNode = a, ir.composeNode = l, ir;
}
var Ua;
function Dl() {
  if (Ua) return Jr;
  Ua = 1;
  var d = yr(), h = Il(), m = jt(), u = br();
  function v(f, n, { offset: l, start: a, value: o, end: r }, e) {
    const t = Object.assign({ _directives: n }, f), i = new d.Document(void 0, t), s = {
      atKey: !1,
      atRoot: !0,
      directives: i.directives,
      options: i.options,
      schema: i.schema
    }, c = u.resolveProps(a, {
      indicator: "doc-start",
      next: o ?? (r == null ? void 0 : r[0]),
      offset: l,
      onError: e,
      parentIndent: 0,
      startOnNewline: !0
    });
    c.found && (i.directives.docStart = !0, o && (o.type === "block-map" || o.type === "block-seq") && !c.hasNewline && e(c.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), i.contents = o ? h.composeNode(s, o, c, e) : h.composeEmptyNode(s, c.end, a, null, c, e);
    const y = i.contents.range[2], g = m.resolveEnd(r, y, !1, e);
    return g.comment && (i.comment = g.comment), i.range = [l, y, g.offset], i;
  }
  return Jr.composeDoc = v, Jr;
}
var za;
function $o() {
  if (za) return Ar;
  za = 1;
  var d = yn, h = wo(), m = yr(), u = _r(), v = ye(), f = Dl(), n = jt();
  function l(r) {
    if (typeof r == "number")
      return [r, r + 1];
    if (Array.isArray(r))
      return r.length === 2 ? r : [r[0], r[1]];
    const { offset: e, source: t } = r;
    return [e, e + (typeof t == "string" ? t.length : 1)];
  }
  function a(r) {
    var s;
    let e = "", t = !1, i = !1;
    for (let c = 0; c < r.length; ++c) {
      const y = r[c];
      switch (y[0]) {
        case "#":
          e += (e === "" ? "" : i ? `

` : `
`) + (y.substring(1) || " "), t = !0, i = !1;
          break;
        case "%":
          ((s = r[c + 1]) == null ? void 0 : s[0]) !== "#" && (c += 1), t = !1;
          break;
        default:
          t || (i = !0), t = !1;
      }
    }
    return { comment: e, afterEmptyLine: i };
  }
  class o {
    constructor(e = {}) {
      this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, i, s, c) => {
        const y = l(t);
        c ? this.warnings.push(new u.YAMLWarning(y, i, s)) : this.errors.push(new u.YAMLParseError(y, i, s));
      }, this.directives = new h.Directives({ version: e.version || "1.2" }), this.options = e;
    }
    decorate(e, t) {
      const { comment: i, afterEmptyLine: s } = a(this.prelude);
      if (i) {
        const c = e.contents;
        if (t)
          e.comment = e.comment ? `${e.comment}
${i}` : i;
        else if (s || e.directives.docStart || !c)
          e.commentBefore = i;
        else if (v.isCollection(c) && !c.flow && c.items.length > 0) {
          let y = c.items[0];
          v.isPair(y) && (y = y.key);
          const g = y.commentBefore;
          y.commentBefore = g ? `${i}
${g}` : i;
        } else {
          const y = c.commentBefore;
          c.commentBefore = y ? `${i}
${y}` : i;
        }
      }
      t ? (Array.prototype.push.apply(e.errors, this.errors), Array.prototype.push.apply(e.warnings, this.warnings)) : (e.errors = this.errors, e.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
      return {
        comment: a(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(e, t = !1, i = -1) {
      for (const s of e)
        yield* this.next(s);
      yield* this.end(t, i);
    }
    /** Advance the composer by one CST token. */
    *next(e) {
      switch (d.env.LOG_STREAM && console.dir(e, { depth: null }), e.type) {
        case "directive":
          this.directives.add(e.source, (t, i, s) => {
            const c = l(e);
            c[0] += t, this.onError(c, "BAD_DIRECTIVE", i, s);
          }), this.prelude.push(e.source), this.atDirectives = !0;
          break;
        case "document": {
          const t = f.composeDoc(this.options, this.directives, e, this.onError);
          this.atDirectives && !t.directives.docStart && this.onError(e, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(t, !1), this.doc && (yield this.doc), this.doc = t, this.atDirectives = !1;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(e.source);
          break;
        case "error": {
          const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, i = new u.YAMLParseError(l(e), "UNEXPECTED_TOKEN", t);
          this.atDirectives || !this.doc ? this.errors.push(i) : this.doc.errors.push(i);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const i = "Unexpected doc-end without preceding document";
            this.errors.push(new u.YAMLParseError(l(e), "UNEXPECTED_TOKEN", i));
            break;
          }
          this.doc.directives.docEnd = !0;
          const t = n.resolveEnd(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
          if (this.decorate(this.doc, !0), t.comment) {
            const i = this.doc.comment;
            this.doc.comment = i ? `${i}
${t.comment}` : t.comment;
          }
          this.doc.range[2] = t.offset;
          break;
        }
        default:
          this.errors.push(new u.YAMLParseError(l(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
      }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(e = !1, t = -1) {
      if (this.doc)
        this.decorate(this.doc, !0), yield this.doc, this.doc = null;
      else if (e) {
        const i = Object.assign({ _directives: this.directives }, this.options), s = new m.Document(void 0, i);
        this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), s.range = [0, t, t], this.decorate(s, !1), yield s;
      }
    }
  }
  return Ar.Composer = o, Ar;
}
var $e = {}, Pt = {}, Ka;
function Ll() {
  if (Ka) return Pt;
  Ka = 1;
  var d = Fo(), h = jo(), m = _r(), u = mr();
  function v(r, e = !0, t) {
    if (r) {
      const i = (s, c, y) => {
        const g = typeof s == "number" ? s : Array.isArray(s) ? s[0] : s.offset;
        if (t)
          t(g, c, y);
        else
          throw new m.YAMLParseError([g, g + 1], c, y);
      };
      switch (r.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return h.resolveFlowScalar(r, e, i);
        case "block-scalar":
          return d.resolveBlockScalar({ options: { strict: e } }, r, i);
      }
    }
    return null;
  }
  function f(r, e) {
    const { implicitKey: t = !1, indent: i, inFlow: s = !1, offset: c = -1, type: y = "PLAIN" } = e, g = u.stringifyString({ type: y, value: r }, {
      implicitKey: t,
      indent: i > 0 ? " ".repeat(i) : "",
      inFlow: s,
      options: { blockQuote: !0, lineWidth: -1 }
    }), _ = e.end ?? [
      { type: "newline", offset: -1, indent: i, source: `
` }
    ];
    switch (g[0]) {
      case "|":
      case ">": {
        const w = g.indexOf(`
`), A = g.substring(0, w), E = g.substring(w + 1) + `
`, O = [
          { type: "block-scalar-header", offset: c, indent: i, source: A }
        ];
        return a(O, _) || O.push({ type: "newline", offset: -1, indent: i, source: `
` }), { type: "block-scalar", offset: c, indent: i, props: O, source: E };
      }
      case '"':
        return { type: "double-quoted-scalar", offset: c, indent: i, source: g, end: _ };
      case "'":
        return { type: "single-quoted-scalar", offset: c, indent: i, source: g, end: _ };
      default:
        return { type: "scalar", offset: c, indent: i, source: g, end: _ };
    }
  }
  function n(r, e, t = {}) {
    let { afterKey: i = !1, implicitKey: s = !1, inFlow: c = !1, type: y } = t, g = "indent" in r ? r.indent : null;
    if (i && typeof g == "number" && (g += 2), !y)
      switch (r.type) {
        case "single-quoted-scalar":
          y = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          y = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const w = r.props[0];
          if (w.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          y = w.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          y = "PLAIN";
      }
    const _ = u.stringifyString({ type: y, value: e }, {
      implicitKey: s || g === null,
      indent: g !== null && g > 0 ? " ".repeat(g) : "",
      inFlow: c,
      options: { blockQuote: !0, lineWidth: -1 }
    });
    switch (_[0]) {
      case "|":
      case ">":
        l(r, _);
        break;
      case '"':
        o(r, _, "double-quoted-scalar");
        break;
      case "'":
        o(r, _, "single-quoted-scalar");
        break;
      default:
        o(r, _, "scalar");
    }
  }
  function l(r, e) {
    const t = e.indexOf(`
`), i = e.substring(0, t), s = e.substring(t + 1) + `
`;
    if (r.type === "block-scalar") {
      const c = r.props[0];
      if (c.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      c.source = i, r.source = s;
    } else {
      const { offset: c } = r, y = "indent" in r ? r.indent : -1, g = [
        { type: "block-scalar-header", offset: c, indent: y, source: i }
      ];
      a(g, "end" in r ? r.end : void 0) || g.push({ type: "newline", offset: -1, indent: y, source: `
` });
      for (const _ of Object.keys(r))
        _ !== "type" && _ !== "offset" && delete r[_];
      Object.assign(r, { type: "block-scalar", indent: y, props: g, source: s });
    }
  }
  function a(r, e) {
    if (e)
      for (const t of e)
        switch (t.type) {
          case "space":
          case "comment":
            r.push(t);
            break;
          case "newline":
            return r.push(t), !0;
        }
    return !1;
  }
  function o(r, e, t) {
    switch (r.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        r.type = t, r.source = e;
        break;
      case "block-scalar": {
        const i = r.props.slice(1);
        let s = e.length;
        r.props[0].type === "block-scalar-header" && (s -= r.props[0].source.length);
        for (const c of i)
          c.offset += s;
        delete r.props, Object.assign(r, { type: t, source: e, end: i });
        break;
      }
      case "block-map":
      case "block-seq": {
        const s = { type: "newline", offset: r.offset + e.length, indent: r.indent, source: `
` };
        delete r.items, Object.assign(r, { type: t, source: e, end: [s] });
        break;
      }
      default: {
        const i = "indent" in r ? r.indent : -1, s = "end" in r && Array.isArray(r.end) ? r.end.filter((c) => c.type === "space" || c.type === "comment" || c.type === "newline") : [];
        for (const c of Object.keys(r))
          c !== "type" && c !== "offset" && delete r[c];
        Object.assign(r, { type: t, indent: i, source: e, end: s });
      }
    }
  }
  return Pt.createScalarToken = f, Pt.resolveAsScalar = v, Pt.setScalarValue = n, Pt;
}
var fi = {}, Wa;
function Pl() {
  if (Wa) return fi;
  Wa = 1;
  const d = (u) => "type" in u ? h(u) : m(u);
  function h(u) {
    switch (u.type) {
      case "block-scalar": {
        let v = "";
        for (const f of u.props)
          v += h(f);
        return v + u.source;
      }
      case "block-map":
      case "block-seq": {
        let v = "";
        for (const f of u.items)
          v += m(f);
        return v;
      }
      case "flow-collection": {
        let v = u.start.source;
        for (const f of u.items)
          v += m(f);
        for (const f of u.end)
          v += f.source;
        return v;
      }
      case "document": {
        let v = m(u);
        if (u.end)
          for (const f of u.end)
            v += f.source;
        return v;
      }
      default: {
        let v = u.source;
        if ("end" in u && u.end)
          for (const f of u.end)
            v += f.source;
        return v;
      }
    }
  }
  function m({ start: u, key: v, sep: f, value: n }) {
    let l = "";
    for (const a of u)
      l += a.source;
    if (v && (l += h(v)), f)
      for (const a of f)
        l += a.source;
    return n && (l += h(n)), l;
  }
  return fi.stringify = d, fi;
}
var ui = {}, Ha;
function Ml() {
  if (Ha) return ui;
  Ha = 1;
  const d = Symbol("break visit"), h = Symbol("skip children"), m = Symbol("remove item");
  function u(f, n) {
    "type" in f && f.type === "document" && (f = { start: f.start, value: f.value }), v(Object.freeze([]), f, n);
  }
  u.BREAK = d, u.SKIP = h, u.REMOVE = m, u.itemAtPath = (f, n) => {
    let l = f;
    for (const [a, o] of n) {
      const r = l == null ? void 0 : l[a];
      if (r && "items" in r)
        l = r.items[o];
      else
        return;
    }
    return l;
  }, u.parentCollection = (f, n) => {
    const l = u.itemAtPath(f, n.slice(0, -1)), a = n[n.length - 1][0], o = l == null ? void 0 : l[a];
    if (o && "items" in o)
      return o;
    throw new Error("Parent collection not found");
  };
  function v(f, n, l) {
    let a = l(n, f);
    if (typeof a == "symbol")
      return a;
    for (const o of ["key", "value"]) {
      const r = n[o];
      if (r && "items" in r) {
        for (let e = 0; e < r.items.length; ++e) {
          const t = v(Object.freeze(f.concat([[o, e]])), r.items[e], l);
          if (typeof t == "number")
            e = t - 1;
          else {
            if (t === d)
              return d;
            t === m && (r.items.splice(e, 1), e -= 1);
          }
        }
        typeof a == "function" && o === "key" && (a = a(n, f));
      }
    }
    return typeof a == "function" ? a(n, f) : a;
  }
  return ui.visit = u, ui;
}
var Ya;
function Rn() {
  if (Ya) return $e;
  Ya = 1;
  var d = Ll(), h = Pl(), m = Ml();
  const u = "\uFEFF", v = "", f = "", n = "", l = (e) => !!e && "items" in e, a = (e) => !!e && (e.type === "scalar" || e.type === "single-quoted-scalar" || e.type === "double-quoted-scalar" || e.type === "block-scalar");
  function o(e) {
    switch (e) {
      case u:
        return "<BOM>";
      case v:
        return "<DOC>";
      case f:
        return "<FLOW_END>";
      case n:
        return "<SCALAR>";
      default:
        return JSON.stringify(e);
    }
  }
  function r(e) {
    switch (e) {
      case u:
        return "byte-order-mark";
      case v:
        return "doc-mode";
      case f:
        return "flow-error-end";
      case n:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (e[0]) {
      case " ":
      case "	":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  return $e.createScalarToken = d.createScalarToken, $e.resolveAsScalar = d.resolveAsScalar, $e.setScalarValue = d.setScalarValue, $e.stringify = h.stringify, $e.visit = m.visit, $e.BOM = u, $e.DOCUMENT = v, $e.FLOW_END = f, $e.SCALAR = n, $e.isCollection = l, $e.isScalar = a, $e.prettyToken = o, $e.tokenType = r, $e;
}
var ci = {}, Za;
function Uo() {
  if (Za) return ci;
  Za = 1;
  var d = Rn();
  function h(a) {
    switch (a) {
      case void 0:
      case " ":
      case `
`:
      case "\r":
      case "	":
        return !0;
      default:
        return !1;
    }
  }
  const m = new Set("0123456789ABCDEFabcdef"), u = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), v = new Set(",[]{}"), f = new Set(` ,[]{}
\r	`), n = (a) => !a || f.has(a);
  class l {
    constructor() {
      this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(o, r = !1) {
      if (o) {
        if (typeof o != "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + o : o, this.lineEndPos = null;
      }
      this.atEnd = !r;
      let e = this.next ?? "stream";
      for (; e && (r || this.hasChars(1)); )
        e = yield* this.parseNext(e);
    }
    atLineEnd() {
      let o = this.pos, r = this.buffer[o];
      for (; r === " " || r === "	"; )
        r = this.buffer[++o];
      return !r || r === "#" || r === `
` ? !0 : r === "\r" ? this.buffer[o + 1] === `
` : !1;
    }
    charAt(o) {
      return this.buffer[this.pos + o];
    }
    continueScalar(o) {
      let r = this.buffer[o];
      if (this.indentNext > 0) {
        let e = 0;
        for (; r === " "; )
          r = this.buffer[++e + o];
        if (r === "\r") {
          const t = this.buffer[e + o + 1];
          if (t === `
` || !t && !this.atEnd)
            return o + e + 1;
        }
        return r === `
` || e >= this.indentNext || !r && !this.atEnd ? o + e : -1;
      }
      if (r === "-" || r === ".") {
        const e = this.buffer.substr(o, 3);
        if ((e === "---" || e === "...") && h(this.buffer[o + 3]))
          return -1;
      }
      return o;
    }
    getLine() {
      let o = this.lineEndPos;
      return (typeof o != "number" || o !== -1 && o < this.pos) && (o = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = o), o === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[o - 1] === "\r" && (o -= 1), this.buffer.substring(this.pos, o));
    }
    hasChars(o) {
      return this.pos + o <= this.buffer.length;
    }
    setNext(o) {
      return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = o, null;
    }
    peek(o) {
      return this.buffer.substr(this.pos, o);
    }
    *parseNext(o) {
      switch (o) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let o = this.getLine();
      if (o === null)
        return this.setNext("stream");
      if (o[0] === d.BOM && (yield* this.pushCount(1), o = o.substring(1)), o[0] === "%") {
        let r = o.length, e = o.indexOf("#");
        for (; e !== -1; ) {
          const i = o[e - 1];
          if (i === " " || i === "	") {
            r = e - 1;
            break;
          } else
            e = o.indexOf("#", e + 1);
        }
        for (; ; ) {
          const i = o[r - 1];
          if (i === " " || i === "	")
            r -= 1;
          else
            break;
        }
        const t = (yield* this.pushCount(r)) + (yield* this.pushSpaces(!0));
        return yield* this.pushCount(o.length - t), this.pushNewline(), "stream";
      }
      if (this.atLineEnd()) {
        const r = yield* this.pushSpaces(!0);
        return yield* this.pushCount(o.length - r), yield* this.pushNewline(), "stream";
      }
      return yield d.DOCUMENT, yield* this.parseLineStart();
    }
    *parseLineStart() {
      const o = this.charAt(0);
      if (!o && !this.atEnd)
        return this.setNext("line-start");
      if (o === "-" || o === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const r = this.peek(3);
        if ((r === "---" || r === "...") && h(this.charAt(3)))
          return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, r === "---" ? "doc" : "stream";
      }
      return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !h(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [o, r] = this.peek(2);
      if (!r && !this.atEnd)
        return this.setNext("block-start");
      if ((o === "-" || o === "?" || o === ":") && h(r)) {
        const e = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
        return this.indentNext = this.indentValue + 1, this.indentValue += e, yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(!0);
      const o = this.getLine();
      if (o === null)
        return this.setNext("doc");
      let r = yield* this.pushIndicators();
      switch (o[r]) {
        case "#":
          yield* this.pushCount(o.length - r);
        // fallthrough
        case void 0:
          return yield* this.pushNewline(), yield* this.parseLineStart();
        case "{":
        case "[":
          return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
        case "}":
        case "]":
          return yield* this.pushCount(1), "doc";
        case "*":
          return yield* this.pushUntil(n), "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          return r += yield* this.parseBlockScalarHeader(), r += yield* this.pushSpaces(!0), yield* this.pushCount(o.length - r), yield* this.pushNewline(), yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let o, r, e = -1;
      do
        o = yield* this.pushNewline(), o > 0 ? (r = yield* this.pushSpaces(!1), this.indentValue = e = r) : r = 0, r += yield* this.pushSpaces(!0);
      while (o + r > 0);
      const t = this.getLine();
      if (t === null)
        return this.setNext("flow");
      if ((e !== -1 && e < this.indentNext && t[0] !== "#" || e === 0 && (t.startsWith("---") || t.startsWith("...")) && h(t[3])) && !(e === this.indentNext - 1 && this.flowLevel === 1 && (t[0] === "]" || t[0] === "}")))
        return this.flowLevel = 0, yield d.FLOW_END, yield* this.parseLineStart();
      let i = 0;
      for (; t[i] === ","; )
        i += yield* this.pushCount(1), i += yield* this.pushSpaces(!0), this.flowKey = !1;
      switch (i += yield* this.pushIndicators(), t[i]) {
        case void 0:
          return "flow";
        case "#":
          return yield* this.pushCount(t.length - i), "flow";
        case "{":
        case "[":
          return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
        case "}":
        case "]":
          return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
        case "*":
          return yield* this.pushUntil(n), "flow";
        case '"':
        case "'":
          return this.flowKey = !0, yield* this.parseQuotedScalar();
        case ":": {
          const s = this.charAt(1);
          if (this.flowKey || h(s) || s === ",")
            return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
        }
        // fallthrough
        default:
          return this.flowKey = !1, yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const o = this.charAt(0);
      let r = this.buffer.indexOf(o, this.pos + 1);
      if (o === "'")
        for (; r !== -1 && this.buffer[r + 1] === "'"; )
          r = this.buffer.indexOf("'", r + 2);
      else
        for (; r !== -1; ) {
          let i = 0;
          for (; this.buffer[r - 1 - i] === "\\"; )
            i += 1;
          if (i % 2 === 0)
            break;
          r = this.buffer.indexOf('"', r + 1);
        }
      const e = this.buffer.substring(0, r);
      let t = e.indexOf(`
`, this.pos);
      if (t !== -1) {
        for (; t !== -1; ) {
          const i = this.continueScalar(t + 1);
          if (i === -1)
            break;
          t = e.indexOf(`
`, i);
        }
        t !== -1 && (r = t - (e[t - 1] === "\r" ? 2 : 1));
      }
      if (r === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        r = this.buffer.length;
      }
      return yield* this.pushToIndex(r + 1, !1), this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1, this.blockScalarKeep = !1;
      let o = this.pos;
      for (; ; ) {
        const r = this.buffer[++o];
        if (r === "+")
          this.blockScalarKeep = !0;
        else if (r > "0" && r <= "9")
          this.blockScalarIndent = Number(r) - 1;
        else if (r !== "-")
          break;
      }
      return yield* this.pushUntil((r) => h(r) || r === "#");
    }
    *parseBlockScalar() {
      let o = this.pos - 1, r = 0, e;
      e: for (let i = this.pos; e = this.buffer[i]; ++i)
        switch (e) {
          case " ":
            r += 1;
            break;
          case `
`:
            o = i, r = 0;
            break;
          case "\r": {
            const s = this.buffer[i + 1];
            if (!s && !this.atEnd)
              return this.setNext("block-scalar");
            if (s === `
`)
              break;
          }
          // fallthrough
          default:
            break e;
        }
      if (!e && !this.atEnd)
        return this.setNext("block-scalar");
      if (r >= this.indentNext) {
        this.blockScalarIndent === -1 ? this.indentNext = r : this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        do {
          const i = this.continueScalar(o + 1);
          if (i === -1)
            break;
          o = this.buffer.indexOf(`
`, i);
        } while (o !== -1);
        if (o === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          o = this.buffer.length;
        }
      }
      let t = o + 1;
      for (e = this.buffer[t]; e === " "; )
        e = this.buffer[++t];
      if (e === "	") {
        for (; e === "	" || e === " " || e === "\r" || e === `
`; )
          e = this.buffer[++t];
        o = t - 1;
      } else if (!this.blockScalarKeep)
        do {
          let i = o - 1, s = this.buffer[i];
          s === "\r" && (s = this.buffer[--i]);
          const c = i;
          for (; s === " "; )
            s = this.buffer[--i];
          if (s === `
` && i >= this.pos && i + 1 + r > c)
            o = i;
          else
            break;
        } while (!0);
      return yield d.SCALAR, yield* this.pushToIndex(o + 1, !0), yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const o = this.flowLevel > 0;
      let r = this.pos - 1, e = this.pos - 1, t;
      for (; t = this.buffer[++e]; )
        if (t === ":") {
          const i = this.buffer[e + 1];
          if (h(i) || o && v.has(i))
            break;
          r = e;
        } else if (h(t)) {
          let i = this.buffer[e + 1];
          if (t === "\r" && (i === `
` ? (e += 1, t = `
`, i = this.buffer[e + 1]) : r = e), i === "#" || o && v.has(i))
            break;
          if (t === `
`) {
            const s = this.continueScalar(e + 1);
            if (s === -1)
              break;
            e = Math.max(e, s - 2);
          }
        } else {
          if (o && v.has(t))
            break;
          r = e;
        }
      return !t && !this.atEnd ? this.setNext("plain-scalar") : (yield d.SCALAR, yield* this.pushToIndex(r + 1, !0), o ? "flow" : "doc");
    }
    *pushCount(o) {
      return o > 0 ? (yield this.buffer.substr(this.pos, o), this.pos += o, o) : 0;
    }
    *pushToIndex(o, r) {
      const e = this.buffer.slice(this.pos, o);
      return e ? (yield e, this.pos += e.length, e.length) : (r && (yield ""), 0);
    }
    *pushIndicators() {
      switch (this.charAt(0)) {
        case "!":
          return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        case "&":
          return (yield* this.pushUntil(n)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        case "-":
        // this is an error
        case "?":
        // this is an error outside flow collections
        case ":": {
          const o = this.flowLevel > 0, r = this.charAt(1);
          if (h(r) || o && v.has(r))
            return o ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let o = this.pos + 2, r = this.buffer[o];
        for (; !h(r) && r !== ">"; )
          r = this.buffer[++o];
        return yield* this.pushToIndex(r === ">" ? o + 1 : o, !1);
      } else {
        let o = this.pos + 1, r = this.buffer[o];
        for (; r; )
          if (u.has(r))
            r = this.buffer[++o];
          else if (r === "%" && m.has(this.buffer[o + 1]) && m.has(this.buffer[o + 2]))
            r = this.buffer[o += 3];
          else
            break;
        return yield* this.pushToIndex(o, !1);
      }
    }
    *pushNewline() {
      const o = this.buffer[this.pos];
      return o === `
` ? yield* this.pushCount(1) : o === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
    }
    *pushSpaces(o) {
      let r = this.pos - 1, e;
      do
        e = this.buffer[++r];
      while (e === " " || o && e === "	");
      const t = r - this.pos;
      return t > 0 && (yield this.buffer.substr(this.pos, t), this.pos = r), t;
    }
    *pushUntil(o) {
      let r = this.pos, e = this.buffer[r];
      for (; !o(e); )
        e = this.buffer[++r];
      return yield* this.pushToIndex(r, !1);
    }
  }
  return ci.Lexer = l, ci;
}
var hi = {}, Ja;
function zo() {
  if (Ja) return hi;
  Ja = 1;
  class d {
    constructor() {
      this.lineStarts = [], this.addNewLine = (m) => this.lineStarts.push(m), this.linePos = (m) => {
        let u = 0, v = this.lineStarts.length;
        for (; u < v; ) {
          const n = u + v >> 1;
          this.lineStarts[n] < m ? u = n + 1 : v = n;
        }
        if (this.lineStarts[u] === m)
          return { line: u + 1, col: 1 };
        if (u === 0)
          return { line: 0, col: m };
        const f = this.lineStarts[u - 1];
        return { line: u, col: m - f + 1 };
      };
    }
  }
  return hi.LineCounter = d, hi;
}
var di = {}, Va;
function Ko() {
  if (Va) return di;
  Va = 1;
  var d = yn, h = Rn(), m = Uo();
  function u(r, e) {
    for (let t = 0; t < r.length; ++t)
      if (r[t].type === e)
        return !0;
    return !1;
  }
  function v(r) {
    for (let e = 0; e < r.length; ++e)
      switch (r[e].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return e;
      }
    return -1;
  }
  function f(r) {
    switch (r == null ? void 0 : r.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return !0;
      default:
        return !1;
    }
  }
  function n(r) {
    switch (r.type) {
      case "document":
        return r.start;
      case "block-map": {
        const e = r.items[r.items.length - 1];
        return e.sep ?? e.start;
      }
      case "block-seq":
        return r.items[r.items.length - 1].start;
      /* istanbul ignore next should not happen */
      default:
        return [];
    }
  }
  function l(r) {
    var t;
    if (r.length === 0)
      return [];
    let e = r.length;
    e: for (; --e >= 0; )
      switch (r[e].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break e;
      }
    for (; ((t = r[++e]) == null ? void 0 : t.type) === "space"; )
      ;
    return r.splice(e, r.length);
  }
  function a(r) {
    if (r.start.type === "flow-seq-start")
      for (const e of r.items)
        e.sep && !e.value && !u(e.start, "explicit-key-ind") && !u(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, f(e.value) ? e.value.end ? Array.prototype.push.apply(e.value.end, e.sep) : e.value.end = e.sep : Array.prototype.push.apply(e.start, e.sep), delete e.sep);
  }
  class o {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(e) {
      this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new m.Lexer(), this.onNewLine = e;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(e, t = !1) {
      this.onNewLine && this.offset === 0 && this.onNewLine(0);
      for (const i of this.lexer.lex(e, t))
        yield* this.next(i);
      t || (yield* this.end());
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(e) {
      if (this.source = e, d.env.LOG_TOKENS && console.log("|", h.prettyToken(e)), this.atScalar) {
        this.atScalar = !1, yield* this.step(), this.offset += e.length;
        return;
      }
      const t = h.tokenType(e);
      if (t)
        if (t === "scalar")
          this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
        else {
          switch (this.type = t, yield* this.step(), t) {
            case "newline":
              this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + e.length);
              break;
            case "space":
              this.atNewLine && e[0] === " " && (this.indent += e.length);
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              this.atNewLine && (this.indent += e.length);
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = !1;
          }
          this.offset += e.length;
        }
      else {
        const i = `Not a YAML token: ${e}`;
        yield* this.pop({ type: "error", offset: this.offset, message: i, source: e }), this.offset += e.length;
      }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
      for (; this.stack.length > 0; )
        yield* this.pop();
    }
    get sourceToken() {
      return {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    *step() {
      const e = this.peek(1);
      if (this.type === "doc-end" && (e == null ? void 0 : e.type) !== "doc-end") {
        for (; this.stack.length > 0; )
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!e)
        return yield* this.stream();
      switch (e.type) {
        case "document":
          return yield* this.document(e);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(e);
        case "block-scalar":
          return yield* this.blockScalar(e);
        case "block-map":
          return yield* this.blockMap(e);
        case "block-seq":
          return yield* this.blockSequence(e);
        case "flow-collection":
          return yield* this.flowCollection(e);
        case "doc-end":
          return yield* this.documentEnd(e);
      }
      yield* this.pop();
    }
    peek(e) {
      return this.stack[this.stack.length - e];
    }
    *pop(e) {
      const t = e ?? this.stack.pop();
      if (!t)
        yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
      else if (this.stack.length === 0)
        yield t;
      else {
        const i = this.peek(1);
        switch (t.type === "block-scalar" ? t.indent = "indent" in i ? i.indent : 0 : t.type === "flow-collection" && i.type === "document" && (t.indent = 0), t.type === "flow-collection" && a(t), i.type) {
          case "document":
            i.value = t;
            break;
          case "block-scalar":
            i.props.push(t);
            break;
          case "block-map": {
            const s = i.items[i.items.length - 1];
            if (s.value) {
              i.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
              return;
            } else if (s.sep)
              s.value = t;
            else {
              Object.assign(s, { key: t, sep: [] }), this.onKeyLine = !s.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const s = i.items[i.items.length - 1];
            s.value ? i.items.push({ start: [], value: t }) : s.value = t;
            break;
          }
          case "flow-collection": {
            const s = i.items[i.items.length - 1];
            !s || s.value ? i.items.push({ start: [], key: t, sep: [] }) : s.sep ? s.value = t : Object.assign(s, { key: t, sep: [] });
            return;
          }
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop(), yield* this.pop(t);
        }
        if ((i.type === "document" || i.type === "block-map" || i.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
          const s = t.items[t.items.length - 1];
          s && !s.sep && !s.value && s.start.length > 0 && v(s.start) === -1 && (t.indent === 0 || s.start.every((c) => c.type !== "comment" || c.indent < t.indent)) && (i.type === "document" ? i.end = s.start : i.items.push({ start: s.start }), t.items.splice(-1, 1));
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const e = {
            type: "document",
            offset: this.offset,
            start: []
          };
          this.type === "doc-start" && e.start.push(this.sourceToken), this.stack.push(e);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(e) {
      if (e.value)
        return yield* this.lineEnd(e);
      switch (this.type) {
        case "doc-start": {
          v(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          e.start.push(this.sourceToken);
          return;
      }
      const t = this.startBlockValue(e);
      t ? this.stack.push(t) : yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
    *scalar(e) {
      if (this.type === "map-value-ind") {
        const t = n(this.peek(2)), i = l(t);
        let s;
        e.end ? (s = e.end, s.push(this.sourceToken), delete e.end) : s = [this.sourceToken];
        const c = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: i, key: e, sep: s }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = c;
      } else
        yield* this.lineEnd(e);
    }
    *blockScalar(e) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          e.props.push(this.sourceToken);
          return;
        case "scalar":
          if (e.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
            let t = this.source.indexOf(`
`) + 1;
            for (; t !== 0; )
              this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
          }
          yield* this.pop();
          break;
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop(), yield* this.step();
      }
    }
    *blockMap(e) {
      var i;
      const t = e.items[e.items.length - 1];
      switch (this.type) {
        case "newline":
          if (this.onKeyLine = !1, t.value) {
            const s = "end" in t.value ? t.value.end : void 0, c = Array.isArray(s) ? s[s.length - 1] : void 0;
            (c == null ? void 0 : c.type) === "comment" ? s == null || s.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
          } else t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (t.value)
            e.items.push({ start: [this.sourceToken] });
          else if (t.sep)
            t.sep.push(this.sourceToken);
          else {
            if (this.atIndentedComment(t.start, e.indent)) {
              const s = e.items[e.items.length - 2], c = (i = s == null ? void 0 : s.value) == null ? void 0 : i.end;
              if (Array.isArray(c)) {
                Array.prototype.push.apply(c, t.start), c.push(this.sourceToken), e.items.pop();
                return;
              }
            }
            t.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= e.indent) {
        const s = !this.onKeyLine && this.indent === e.indent, c = s && (t.sep || t.explicitKey) && this.type !== "seq-item-ind";
        let y = [];
        if (c && t.sep && !t.value) {
          const g = [];
          for (let _ = 0; _ < t.sep.length; ++_) {
            const w = t.sep[_];
            switch (w.type) {
              case "newline":
                g.push(_);
                break;
              case "space":
                break;
              case "comment":
                w.indent > e.indent && (g.length = 0);
                break;
              default:
                g.length = 0;
            }
          }
          g.length >= 2 && (y = t.sep.splice(g[1]));
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            c || t.value ? (y.push(this.sourceToken), e.items.push({ start: y }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
            return;
          case "explicit-key-ind":
            !t.sep && !t.explicitKey ? (t.start.push(this.sourceToken), t.explicitKey = !0) : c || t.value ? (y.push(this.sourceToken), e.items.push({ start: y, explicitKey: !0 })) : this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: !0 }]
            }), this.onKeyLine = !0;
            return;
          case "map-value-ind":
            if (t.explicitKey)
              if (t.sep)
                if (t.value)
                  e.items.push({ start: [], key: null, sep: [this.sourceToken] });
                else if (u(t.sep, "map-value-ind"))
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: y, key: null, sep: [this.sourceToken] }]
                  });
                else if (f(t.key) && !u(t.sep, "newline")) {
                  const g = l(t.start), _ = t.key, w = t.sep;
                  w.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: g, key: _, sep: w }]
                  });
                } else y.length > 0 ? t.sep = t.sep.concat(y, this.sourceToken) : t.sep.push(this.sourceToken);
              else if (u(t.start, "newline"))
                Object.assign(t, { key: null, sep: [this.sourceToken] });
              else {
                const g = l(t.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: g, key: null, sep: [this.sourceToken] }]
                });
              }
            else
              t.sep ? t.value || c ? e.items.push({ start: y, key: null, sep: [this.sourceToken] }) : u(t.sep, "map-value-ind") ? this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              }) : t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
            this.onKeyLine = !0;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const g = this.flowScalar(this.type);
            c || t.value ? (e.items.push({ start: y, key: g, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(g) : (Object.assign(t, { key: g, sep: [] }), this.onKeyLine = !0);
            return;
          }
          default: {
            const g = this.startBlockValue(e);
            if (g) {
              if (g.type === "block-seq") {
                if (!t.explicitKey && t.sep && !u(t.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else s && e.items.push({ start: y });
              this.stack.push(g);
              return;
            }
          }
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *blockSequence(e) {
      var i;
      const t = e.items[e.items.length - 1];
      switch (this.type) {
        case "newline":
          if (t.value) {
            const s = "end" in t.value ? t.value.end : void 0, c = Array.isArray(s) ? s[s.length - 1] : void 0;
            (c == null ? void 0 : c.type) === "comment" ? s == null || s.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
          } else
            t.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (t.value)
            e.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(t.start, e.indent)) {
              const s = e.items[e.items.length - 2], c = (i = s == null ? void 0 : s.value) == null ? void 0 : i.end;
              if (Array.isArray(c)) {
                Array.prototype.push.apply(c, t.start), c.push(this.sourceToken), e.items.pop();
                return;
              }
            }
            t.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (t.value || this.indent <= e.indent)
            break;
          t.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== e.indent)
            break;
          t.value || u(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
      }
      if (this.indent > e.indent) {
        const s = this.startBlockValue(e);
        if (s) {
          this.stack.push(s);
          return;
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *flowCollection(e) {
      const t = e.items[e.items.length - 1];
      if (this.type === "flow-error-end") {
        let i;
        do
          yield* this.pop(), i = this.peek(1);
        while ((i == null ? void 0 : i.type) === "flow-collection");
      } else if (e.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            !t || t.sep ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            !t || t.value ? e.items.push({ start: [], key: null, sep: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            !t || t.value ? e.items.push({ start: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const s = this.flowScalar(this.type);
            !t || t.value ? e.items.push({ start: [], key: s, sep: [] }) : t.sep ? this.stack.push(s) : Object.assign(t, { key: s, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            e.end.push(this.sourceToken);
            return;
        }
        const i = this.startBlockValue(e);
        i ? this.stack.push(i) : (yield* this.pop(), yield* this.step());
      } else {
        const i = this.peek(2);
        if (i.type === "block-map" && (this.type === "map-value-ind" && i.indent === e.indent || this.type === "newline" && !i.items[i.items.length - 1].sep))
          yield* this.pop(), yield* this.step();
        else if (this.type === "map-value-ind" && i.type !== "flow-collection") {
          const s = n(i), c = l(s);
          a(e);
          const y = e.end.splice(1, e.end.length);
          y.push(this.sourceToken);
          const g = {
            type: "block-map",
            offset: e.offset,
            indent: e.indent,
            items: [{ start: c, key: e, sep: y }]
          };
          this.onKeyLine = !0, this.stack[this.stack.length - 1] = g;
        } else
          yield* this.lineEnd(e);
      }
    }
    flowScalar(e) {
      if (this.onNewLine) {
        let t = this.source.indexOf(`
`) + 1;
        for (; t !== 0; )
          this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
      }
      return {
        type: e,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(e) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = !0;
          const t = n(e), i = l(t);
          return i.push(this.sourceToken), {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: i, explicitKey: !0 }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = !0;
          const t = n(e), i = l(t);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: i, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(e, t) {
      return this.type !== "comment" || this.indent <= t ? !1 : e.every((i) => i.type === "newline" || i.type === "space");
    }
    *documentEnd(e) {
      this.type !== "doc-mode" && (e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
    }
    *lineEnd(e) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop(), yield* this.step();
          break;
        case "newline":
          this.onKeyLine = !1;
        // fallthrough
        case "space":
        case "comment":
        default:
          e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
      }
    }
  }
  return di.Parser = o, di;
}
var kt = {}, Ga;
function ql() {
  if (Ga) return kt;
  Ga = 1;
  var d = $o(), h = yr(), m = _r(), u = ko(), v = ye(), f = zo(), n = Ko();
  function l(t) {
    const i = t.prettyErrors !== !1;
    return { lineCounter: t.lineCounter || i && new f.LineCounter() || null, prettyErrors: i };
  }
  function a(t, i = {}) {
    const { lineCounter: s, prettyErrors: c } = l(i), y = new n.Parser(s == null ? void 0 : s.addNewLine), g = new d.Composer(i), _ = Array.from(g.compose(y.parse(t)));
    if (c && s)
      for (const w of _)
        w.errors.forEach(m.prettifyError(t, s)), w.warnings.forEach(m.prettifyError(t, s));
    return _.length > 0 ? _ : Object.assign([], { empty: !0 }, g.streamInfo());
  }
  function o(t, i = {}) {
    const { lineCounter: s, prettyErrors: c } = l(i), y = new n.Parser(s == null ? void 0 : s.addNewLine), g = new d.Composer(i);
    let _ = null;
    for (const w of g.compose(y.parse(t), !0, t.length))
      if (!_)
        _ = w;
      else if (_.options.logLevel !== "silent") {
        _.errors.push(new m.YAMLParseError(w.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    return c && s && (_.errors.forEach(m.prettifyError(t, s)), _.warnings.forEach(m.prettifyError(t, s))), _;
  }
  function r(t, i, s) {
    let c;
    typeof i == "function" ? c = i : s === void 0 && i && typeof i == "object" && (s = i);
    const y = o(t, s);
    if (!y)
      return null;
    if (y.warnings.forEach((g) => u.warn(y.options.logLevel, g)), y.errors.length > 0) {
      if (y.options.logLevel !== "silent")
        throw y.errors[0];
      y.errors = [];
    }
    return y.toJS(Object.assign({ reviver: c }, s));
  }
  function e(t, i, s) {
    let c = null;
    if (typeof i == "function" || Array.isArray(i) ? c = i : s === void 0 && i && (s = i), typeof s == "string" && (s = s.length), typeof s == "number") {
      const y = Math.round(s);
      s = y < 1 ? void 0 : y > 8 ? { indent: 8 } : { indent: y };
    }
    if (t === void 0) {
      const { keepUndefined: y } = s ?? i ?? {};
      if (!y)
        return;
    }
    return v.isDocument(t) && !c ? t.toString(s) : new h.Document(t, c, s).toString(s);
  }
  return kt.parse = r, kt.parseAllDocuments = a, kt.parseDocument = o, kt.stringify = e, kt;
}
var Xa;
function Bl() {
  if (Xa) return be;
  Xa = 1;
  var d = $o(), h = yr(), m = Po(), u = _r(), v = hr(), f = ye(), n = pt(), l = Re(), a = mt(), o = gt(), r = Rn(), e = Uo(), t = zo(), i = Ko(), s = ql(), c = cr();
  return be.Composer = d.Composer, be.Document = h.Document, be.Schema = m.Schema, be.YAMLError = u.YAMLError, be.YAMLParseError = u.YAMLParseError, be.YAMLWarning = u.YAMLWarning, be.Alias = v.Alias, be.isAlias = f.isAlias, be.isCollection = f.isCollection, be.isDocument = f.isDocument, be.isMap = f.isMap, be.isNode = f.isNode, be.isPair = f.isPair, be.isScalar = f.isScalar, be.isSeq = f.isSeq, be.Pair = n.Pair, be.Scalar = l.Scalar, be.YAMLMap = a.YAMLMap, be.YAMLSeq = o.YAMLSeq, be.CST = r, be.Lexer = e.Lexer, be.LineCounter = t.LineCounter, be.Parser = i.Parser, be.parse = s.parse, be.parseAllDocuments = s.parseAllDocuments, be.parseDocument = s.parseDocument, be.stringify = s.stringify, be.visit = c.visit, be.visitAsync = c.visitAsync, be;
}
var Fl = Bl();
const jl = /* @__PURE__ */ bo(Fl);
var pi = {}, mi = {}, ze = {}, nr = { exports: {} }, ar = { exports: {} }, Qa;
function wr() {
  if (Qa) return ar.exports;
  Qa = 1, typeof process > "u" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0 ? ar.exports = { nextTick: d } : ar.exports = process;
  function d(h, m, u, v) {
    if (typeof h != "function")
      throw new TypeError('"callback" argument must be a function');
    var f = arguments.length, n, l;
    switch (f) {
      case 0:
      case 1:
        return process.nextTick(h);
      case 2:
        return process.nextTick(function() {
          h.call(null, m);
        });
      case 3:
        return process.nextTick(function() {
          h.call(null, m, u);
        });
      case 4:
        return process.nextTick(function() {
          h.call(null, m, u, v);
        });
      default:
        for (n = new Array(f - 1), l = 0; l < n.length; )
          n[l++] = arguments[l];
        return process.nextTick(function() {
          h.apply(null, n);
        });
    }
  }
  return ar.exports;
}
var gi, es;
function $l() {
  if (es) return gi;
  es = 1;
  var d = {}.toString;
  return gi = Array.isArray || function(h) {
    return d.call(h) == "[object Array]";
  }, gi;
}
var vi, ts;
function Wo() {
  return ts || (ts = 1, vi = _o), vi;
}
var sr = { exports: {} }, rs;
function Sr() {
  return rs || (rs = 1, (function(d, h) {
    var m = _n, u = m.Buffer;
    function v(n, l) {
      for (var a in n)
        l[a] = n[a];
    }
    u.from && u.alloc && u.allocUnsafe && u.allocUnsafeSlow ? d.exports = m : (v(m, h), h.Buffer = f);
    function f(n, l, a) {
      return u(n, l, a);
    }
    v(u, f), f.from = function(n, l, a) {
      if (typeof n == "number")
        throw new TypeError("Argument must not be a number");
      return u(n, l, a);
    }, f.alloc = function(n, l, a) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      var o = u(n);
      return l !== void 0 ? typeof a == "string" ? o.fill(l, a) : o.fill(l) : o.fill(0), o;
    }, f.allocUnsafe = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return u(n);
    }, f.allocUnsafeSlow = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return m.SlowBuffer(n);
    };
  })(sr, sr.exports)), sr.exports;
}
var Ie = {}, is;
function $t() {
  if (is) return Ie;
  is = 1;
  function d(c) {
    return Array.isArray ? Array.isArray(c) : s(c) === "[object Array]";
  }
  Ie.isArray = d;
  function h(c) {
    return typeof c == "boolean";
  }
  Ie.isBoolean = h;
  function m(c) {
    return c === null;
  }
  Ie.isNull = m;
  function u(c) {
    return c == null;
  }
  Ie.isNullOrUndefined = u;
  function v(c) {
    return typeof c == "number";
  }
  Ie.isNumber = v;
  function f(c) {
    return typeof c == "string";
  }
  Ie.isString = f;
  function n(c) {
    return typeof c == "symbol";
  }
  Ie.isSymbol = n;
  function l(c) {
    return c === void 0;
  }
  Ie.isUndefined = l;
  function a(c) {
    return s(c) === "[object RegExp]";
  }
  Ie.isRegExp = a;
  function o(c) {
    return typeof c == "object" && c !== null;
  }
  Ie.isObject = o;
  function r(c) {
    return s(c) === "[object Date]";
  }
  Ie.isDate = r;
  function e(c) {
    return s(c) === "[object Error]" || c instanceof Error;
  }
  Ie.isError = e;
  function t(c) {
    return typeof c == "function";
  }
  Ie.isFunction = t;
  function i(c) {
    return c === null || typeof c == "boolean" || typeof c == "number" || typeof c == "string" || typeof c == "symbol" || // ES6 symbol
    typeof c > "u";
  }
  Ie.isPrimitive = i, Ie.isBuffer = _n.Buffer.isBuffer;
  function s(c) {
    return Object.prototype.toString.call(c);
  }
  return Ie;
}
var or = { exports: {} }, lr = { exports: {} }, ns;
function Ul() {
  return ns || (ns = 1, typeof Object.create == "function" ? lr.exports = function(h, m) {
    m && (h.super_ = m, h.prototype = Object.create(m.prototype, {
      constructor: {
        value: h,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : lr.exports = function(h, m) {
    if (m) {
      h.super_ = m;
      var u = function() {
      };
      u.prototype = m.prototype, h.prototype = new u(), h.prototype.constructor = h;
    }
  }), lr.exports;
}
var as;
function Ut() {
  if (as) return or.exports;
  as = 1;
  try {
    var d = require("util");
    if (typeof d.inherits != "function") throw "";
    or.exports = d.inherits;
  } catch {
    or.exports = Ul();
  }
  return or.exports;
}
var yi = { exports: {} }, ss;
function zl() {
  return ss || (ss = 1, (function(d) {
    function h(f, n) {
      if (!(f instanceof n))
        throw new TypeError("Cannot call a class as a function");
    }
    var m = Sr().Buffer, u = bn;
    function v(f, n, l) {
      f.copy(n, l);
    }
    d.exports = (function() {
      function f() {
        h(this, f), this.head = null, this.tail = null, this.length = 0;
      }
      return f.prototype.push = function(l) {
        var a = { data: l, next: null };
        this.length > 0 ? this.tail.next = a : this.head = a, this.tail = a, ++this.length;
      }, f.prototype.unshift = function(l) {
        var a = { data: l, next: this.head };
        this.length === 0 && (this.tail = a), this.head = a, ++this.length;
      }, f.prototype.shift = function() {
        if (this.length !== 0) {
          var l = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, l;
        }
      }, f.prototype.clear = function() {
        this.head = this.tail = null, this.length = 0;
      }, f.prototype.join = function(l) {
        if (this.length === 0) return "";
        for (var a = this.head, o = "" + a.data; a = a.next; )
          o += l + a.data;
        return o;
      }, f.prototype.concat = function(l) {
        if (this.length === 0) return m.alloc(0);
        for (var a = m.allocUnsafe(l >>> 0), o = this.head, r = 0; o; )
          v(o.data, a, r), r += o.data.length, o = o.next;
        return a;
      }, f;
    })(), u && u.inspect && u.inspect.custom && (d.exports.prototype[u.inspect.custom] = function() {
      var f = u.inspect({ length: this.length });
      return this.constructor.name + " " + f;
    });
  })(yi)), yi.exports;
}
var _i, os;
function Ho() {
  if (os) return _i;
  os = 1;
  var d = wr();
  function h(v, f) {
    var n = this, l = this._readableState && this._readableState.destroyed, a = this._writableState && this._writableState.destroyed;
    return l || a ? (f ? f(v) : v && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, d.nextTick(u, this, v)) : d.nextTick(u, this, v)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(v || null, function(o) {
      !f && o ? n._writableState ? n._writableState.errorEmitted || (n._writableState.errorEmitted = !0, d.nextTick(u, n, o)) : d.nextTick(u, n, o) : f && f(o);
    }), this);
  }
  function m() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function u(v, f) {
    v.emit("error", f);
  }
  return _i = {
    destroy: h,
    undestroy: m
  }, _i;
}
var bi, ls;
function Kl() {
  return ls || (ls = 1, bi = bn.deprecate), bi;
}
var wi, fs;
function Yo() {
  if (fs) return wi;
  fs = 1;
  var d = wr();
  wi = c;
  function h(R) {
    var I = this;
    this.next = null, this.entry = null, this.finish = function() {
      ce(I, R);
    };
  }
  var m = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : d.nextTick, u;
  c.WritableState = i;
  var v = Object.create($t());
  v.inherits = Ut();
  var f = {
    deprecate: Kl()
  }, n = Wo(), l = Sr().Buffer, a = (typeof Be < "u" ? Be : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function o(R) {
    return l.from(R);
  }
  function r(R) {
    return l.isBuffer(R) || R instanceof a;
  }
  var e = Ho();
  v.inherits(c, n);
  function t() {
  }
  function i(R, I) {
    u = u || Ct(), R = R || {};
    var F = I instanceof u;
    this.objectMode = !!R.objectMode, F && (this.objectMode = this.objectMode || !!R.writableObjectMode);
    var Z = R.highWaterMark, te = R.writableHighWaterMark, ie = this.objectMode ? 16 : 16 * 1024;
    Z || Z === 0 ? this.highWaterMark = Z : F && (te || te === 0) ? this.highWaterMark = te : this.highWaterMark = ie, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var se = R.decodeStrings === !1;
    this.decodeStrings = !se, this.defaultEncoding = R.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(he) {
      D(I, he);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new h(this);
  }
  i.prototype.getBuffer = function() {
    for (var I = this.bufferedRequest, F = []; I; )
      F.push(I), I = I.next;
    return F;
  }, (function() {
    try {
      Object.defineProperty(i.prototype, "buffer", {
        get: f.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  })();
  var s;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (s = Function.prototype[Symbol.hasInstance], Object.defineProperty(c, Symbol.hasInstance, {
    value: function(R) {
      return s.call(this, R) ? !0 : this !== c ? !1 : R && R._writableState instanceof i;
    }
  })) : s = function(R) {
    return R instanceof this;
  };
  function c(R) {
    if (u = u || Ct(), !s.call(c, this) && !(this instanceof u))
      return new c(R);
    this._writableState = new i(R, this), this.writable = !0, R && (typeof R.write == "function" && (this._write = R.write), typeof R.writev == "function" && (this._writev = R.writev), typeof R.destroy == "function" && (this._destroy = R.destroy), typeof R.final == "function" && (this._final = R.final)), n.call(this);
  }
  c.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function y(R, I) {
    var F = new Error("write after end");
    R.emit("error", F), d.nextTick(I, F);
  }
  function g(R, I, F, Z) {
    var te = !0, ie = !1;
    return F === null ? ie = new TypeError("May not write null values to stream") : typeof F != "string" && F !== void 0 && !I.objectMode && (ie = new TypeError("Invalid non-string/buffer chunk")), ie && (R.emit("error", ie), d.nextTick(Z, ie), te = !1), te;
  }
  c.prototype.write = function(R, I, F) {
    var Z = this._writableState, te = !1, ie = !Z.objectMode && r(R);
    return ie && !l.isBuffer(R) && (R = o(R)), typeof I == "function" && (F = I, I = null), ie ? I = "buffer" : I || (I = Z.defaultEncoding), typeof F != "function" && (F = t), Z.ended ? y(this, F) : (ie || g(this, Z, R, F)) && (Z.pendingcb++, te = w(this, Z, ie, R, I, F)), te;
  }, c.prototype.cork = function() {
    var R = this._writableState;
    R.corked++;
  }, c.prototype.uncork = function() {
    var R = this._writableState;
    R.corked && (R.corked--, !R.writing && !R.corked && !R.bufferProcessing && R.bufferedRequest && K(this, R));
  }, c.prototype.setDefaultEncoding = function(I) {
    if (typeof I == "string" && (I = I.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((I + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + I);
    return this._writableState.defaultEncoding = I, this;
  };
  function _(R, I, F) {
    return !R.objectMode && R.decodeStrings !== !1 && typeof I == "string" && (I = l.from(I, F)), I;
  }
  Object.defineProperty(c.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function w(R, I, F, Z, te, ie) {
    if (!F) {
      var se = _(I, Z, te);
      Z !== se && (F = !0, te = "buffer", Z = se);
    }
    var he = I.objectMode ? 1 : Z.length;
    I.length += he;
    var _e = I.length < I.highWaterMark;
    if (_e || (I.needDrain = !0), I.writing || I.corked) {
      var me = I.lastBufferedRequest;
      I.lastBufferedRequest = {
        chunk: Z,
        encoding: te,
        isBuf: F,
        callback: ie,
        next: null
      }, me ? me.next = I.lastBufferedRequest : I.bufferedRequest = I.lastBufferedRequest, I.bufferedRequestCount += 1;
    } else
      A(R, I, !1, he, Z, te, ie);
    return _e;
  }
  function A(R, I, F, Z, te, ie, se) {
    I.writelen = Z, I.writecb = se, I.writing = !0, I.sync = !0, F ? R._writev(te, I.onwrite) : R._write(te, ie, I.onwrite), I.sync = !1;
  }
  function E(R, I, F, Z, te) {
    --I.pendingcb, F ? (d.nextTick(te, Z), d.nextTick(re, R, I), R._writableState.errorEmitted = !0, R.emit("error", Z)) : (te(Z), R._writableState.errorEmitted = !0, R.emit("error", Z), re(R, I));
  }
  function O(R) {
    R.writing = !1, R.writecb = null, R.length -= R.writelen, R.writelen = 0;
  }
  function D(R, I) {
    var F = R._writableState, Z = F.sync, te = F.writecb;
    if (O(F), I) E(R, F, Z, I, te);
    else {
      var ie = V(F);
      !ie && !F.corked && !F.bufferProcessing && F.bufferedRequest && K(R, F), Z ? m(L, R, F, ie, te) : L(R, F, ie, te);
    }
  }
  function L(R, I, F, Z) {
    F || P(R, I), I.pendingcb--, Z(), re(R, I);
  }
  function P(R, I) {
    I.length === 0 && I.needDrain && (I.needDrain = !1, R.emit("drain"));
  }
  function K(R, I) {
    I.bufferProcessing = !0;
    var F = I.bufferedRequest;
    if (R._writev && F && F.next) {
      var Z = I.bufferedRequestCount, te = new Array(Z), ie = I.corkedRequestsFree;
      ie.entry = F;
      for (var se = 0, he = !0; F; )
        te[se] = F, F.isBuf || (he = !1), F = F.next, se += 1;
      te.allBuffers = he, A(R, I, !0, I.length, te, "", ie.finish), I.pendingcb++, I.lastBufferedRequest = null, ie.next ? (I.corkedRequestsFree = ie.next, ie.next = null) : I.corkedRequestsFree = new h(I), I.bufferedRequestCount = 0;
    } else {
      for (; F; ) {
        var _e = F.chunk, me = F.encoding, C = F.callback, T = I.objectMode ? 1 : _e.length;
        if (A(R, I, !1, T, _e, me, C), F = F.next, I.bufferedRequestCount--, I.writing)
          break;
      }
      F === null && (I.lastBufferedRequest = null);
    }
    I.bufferedRequest = F, I.bufferProcessing = !1;
  }
  c.prototype._write = function(R, I, F) {
    F(new Error("_write() is not implemented"));
  }, c.prototype._writev = null, c.prototype.end = function(R, I, F) {
    var Z = this._writableState;
    typeof R == "function" ? (F = R, R = null, I = null) : typeof I == "function" && (F = I, I = null), R != null && this.write(R, I), Z.corked && (Z.corked = 1, this.uncork()), Z.ending || ue(this, Z, F);
  };
  function V(R) {
    return R.ending && R.length === 0 && R.bufferedRequest === null && !R.finished && !R.writing;
  }
  function W(R, I) {
    R._final(function(F) {
      I.pendingcb--, F && R.emit("error", F), I.prefinished = !0, R.emit("prefinish"), re(R, I);
    });
  }
  function H(R, I) {
    !I.prefinished && !I.finalCalled && (typeof R._final == "function" ? (I.pendingcb++, I.finalCalled = !0, d.nextTick(W, R, I)) : (I.prefinished = !0, R.emit("prefinish")));
  }
  function re(R, I) {
    var F = V(I);
    return F && (H(R, I), I.pendingcb === 0 && (I.finished = !0, R.emit("finish"))), F;
  }
  function ue(R, I, F) {
    I.ending = !0, re(R, I), F && (I.finished ? d.nextTick(F) : R.once("finish", F)), I.ended = !0, R.writable = !1;
  }
  function ce(R, I, F) {
    var Z = R.entry;
    for (R.entry = null; Z; ) {
      var te = Z.callback;
      I.pendingcb--, te(F), Z = Z.next;
    }
    I.corkedRequestsFree.next = R;
  }
  return Object.defineProperty(c.prototype, "destroyed", {
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(R) {
      this._writableState && (this._writableState.destroyed = R);
    }
  }), c.prototype.destroy = e.destroy, c.prototype._undestroy = e.undestroy, c.prototype._destroy = function(R, I) {
    this.end(), I(R);
  }, wi;
}
var Si, us;
function Ct() {
  if (us) return Si;
  us = 1;
  var d = wr(), h = Object.keys || function(e) {
    var t = [];
    for (var i in e)
      t.push(i);
    return t;
  };
  Si = a;
  var m = Object.create($t());
  m.inherits = Ut();
  var u = Zo(), v = Yo();
  m.inherits(a, u);
  for (var f = h(v.prototype), n = 0; n < f.length; n++) {
    var l = f[n];
    a.prototype[l] || (a.prototype[l] = v.prototype[l]);
  }
  function a(e) {
    if (!(this instanceof a)) return new a(e);
    u.call(this, e), v.call(this, e), e && e.readable === !1 && (this.readable = !1), e && e.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, e && e.allowHalfOpen === !1 && (this.allowHalfOpen = !1), this.once("end", o);
  }
  Object.defineProperty(a.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function o() {
    this.allowHalfOpen || this._writableState.ended || d.nextTick(r, this);
  }
  function r(e) {
    e.end();
  }
  return Object.defineProperty(a.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(e) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = e, this._writableState.destroyed = e);
    }
  }), a.prototype._destroy = function(e, t) {
    this.push(null), this.end(), d.nextTick(t, e);
  }, Si;
}
var ki = {}, cs;
function hs() {
  if (cs) return ki;
  cs = 1;
  var d = Sr().Buffer, h = d.isEncoding || function(g) {
    switch (g = "" + g, g && g.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function m(g) {
    if (!g) return "utf8";
    for (var _; ; )
      switch (g) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return g;
        default:
          if (_) return;
          g = ("" + g).toLowerCase(), _ = !0;
      }
  }
  function u(g) {
    var _ = m(g);
    if (typeof _ != "string" && (d.isEncoding === h || !h(g))) throw new Error("Unknown encoding: " + g);
    return _ || g;
  }
  ki.StringDecoder = v;
  function v(g) {
    this.encoding = u(g);
    var _;
    switch (this.encoding) {
      case "utf16le":
        this.text = e, this.end = t, _ = 4;
        break;
      case "utf8":
        this.fillLast = a, _ = 4;
        break;
      case "base64":
        this.text = i, this.end = s, _ = 3;
        break;
      default:
        this.write = c, this.end = y;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = d.allocUnsafe(_);
  }
  v.prototype.write = function(g) {
    if (g.length === 0) return "";
    var _, w;
    if (this.lastNeed) {
      if (_ = this.fillLast(g), _ === void 0) return "";
      w = this.lastNeed, this.lastNeed = 0;
    } else
      w = 0;
    return w < g.length ? _ ? _ + this.text(g, w) : this.text(g, w) : _ || "";
  }, v.prototype.end = r, v.prototype.text = o, v.prototype.fillLast = function(g) {
    if (this.lastNeed <= g.length)
      return g.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    g.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, g.length), this.lastNeed -= g.length;
  };
  function f(g) {
    return g <= 127 ? 0 : g >> 5 === 6 ? 2 : g >> 4 === 14 ? 3 : g >> 3 === 30 ? 4 : g >> 6 === 2 ? -1 : -2;
  }
  function n(g, _, w) {
    var A = _.length - 1;
    if (A < w) return 0;
    var E = f(_[A]);
    return E >= 0 ? (E > 0 && (g.lastNeed = E - 1), E) : --A < w || E === -2 ? 0 : (E = f(_[A]), E >= 0 ? (E > 0 && (g.lastNeed = E - 2), E) : --A < w || E === -2 ? 0 : (E = f(_[A]), E >= 0 ? (E > 0 && (E === 2 ? E = 0 : g.lastNeed = E - 3), E) : 0));
  }
  function l(g, _, w) {
    if ((_[0] & 192) !== 128)
      return g.lastNeed = 0, "�";
    if (g.lastNeed > 1 && _.length > 1) {
      if ((_[1] & 192) !== 128)
        return g.lastNeed = 1, "�";
      if (g.lastNeed > 2 && _.length > 2 && (_[2] & 192) !== 128)
        return g.lastNeed = 2, "�";
    }
  }
  function a(g) {
    var _ = this.lastTotal - this.lastNeed, w = l(this, g);
    if (w !== void 0) return w;
    if (this.lastNeed <= g.length)
      return g.copy(this.lastChar, _, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    g.copy(this.lastChar, _, 0, g.length), this.lastNeed -= g.length;
  }
  function o(g, _) {
    var w = n(this, g, _);
    if (!this.lastNeed) return g.toString("utf8", _);
    this.lastTotal = w;
    var A = g.length - (w - this.lastNeed);
    return g.copy(this.lastChar, 0, A), g.toString("utf8", _, A);
  }
  function r(g) {
    var _ = g && g.length ? this.write(g) : "";
    return this.lastNeed ? _ + "�" : _;
  }
  function e(g, _) {
    if ((g.length - _) % 2 === 0) {
      var w = g.toString("utf16le", _);
      if (w) {
        var A = w.charCodeAt(w.length - 1);
        if (A >= 55296 && A <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = g[g.length - 2], this.lastChar[1] = g[g.length - 1], w.slice(0, -1);
      }
      return w;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = g[g.length - 1], g.toString("utf16le", _, g.length - 1);
  }
  function t(g) {
    var _ = g && g.length ? this.write(g) : "";
    if (this.lastNeed) {
      var w = this.lastTotal - this.lastNeed;
      return _ + this.lastChar.toString("utf16le", 0, w);
    }
    return _;
  }
  function i(g, _) {
    var w = (g.length - _) % 3;
    return w === 0 ? g.toString("base64", _) : (this.lastNeed = 3 - w, this.lastTotal = 3, w === 1 ? this.lastChar[0] = g[g.length - 1] : (this.lastChar[0] = g[g.length - 2], this.lastChar[1] = g[g.length - 1]), g.toString("base64", _, g.length - w));
  }
  function s(g) {
    var _ = g && g.length ? this.write(g) : "";
    return this.lastNeed ? _ + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : _;
  }
  function c(g) {
    return g.toString(this.encoding);
  }
  function y(g) {
    return g && g.length ? this.write(g) : "";
  }
  return ki;
}
var Ai, ds;
function Zo() {
  if (ds) return Ai;
  ds = 1;
  var d = wr();
  Ai = _;
  var h = $l(), m;
  _.ReadableState = g, ml.EventEmitter;
  var u = function(C, T) {
    return C.listeners(T).length;
  }, v = Wo(), f = Sr().Buffer, n = (typeof Be < "u" ? Be : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function l(C) {
    return f.from(C);
  }
  function a(C) {
    return f.isBuffer(C) || C instanceof n;
  }
  var o = Object.create($t());
  o.inherits = Ut();
  var r = bn, e = void 0;
  r && r.debuglog ? e = r.debuglog("stream") : e = function() {
  };
  var t = zl(), i = Ho(), s;
  o.inherits(_, v);
  var c = ["error", "close", "destroy", "pause", "resume"];
  function y(C, T, $) {
    if (typeof C.prependListener == "function") return C.prependListener(T, $);
    !C._events || !C._events[T] ? C.on(T, $) : h(C._events[T]) ? C._events[T].unshift($) : C._events[T] = [$, C._events[T]];
  }
  function g(C, T) {
    m = m || Ct(), C = C || {};
    var $ = T instanceof m;
    this.objectMode = !!C.objectMode, $ && (this.objectMode = this.objectMode || !!C.readableObjectMode);
    var J = C.highWaterMark, fe = C.readableHighWaterMark, G = this.objectMode ? 16 : 16 * 1024;
    J || J === 0 ? this.highWaterMark = J : $ && (fe || fe === 0) ? this.highWaterMark = fe : this.highWaterMark = G, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new t(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = C.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, C.encoding && (s || (s = hs().StringDecoder), this.decoder = new s(C.encoding), this.encoding = C.encoding);
  }
  function _(C) {
    if (m = m || Ct(), !(this instanceof _)) return new _(C);
    this._readableState = new g(C, this), this.readable = !0, C && (typeof C.read == "function" && (this._read = C.read), typeof C.destroy == "function" && (this._destroy = C.destroy)), v.call(this);
  }
  Object.defineProperty(_.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(C) {
      this._readableState && (this._readableState.destroyed = C);
    }
  }), _.prototype.destroy = i.destroy, _.prototype._undestroy = i.undestroy, _.prototype._destroy = function(C, T) {
    this.push(null), T(C);
  }, _.prototype.push = function(C, T) {
    var $ = this._readableState, J;
    return $.objectMode ? J = !0 : typeof C == "string" && (T = T || $.defaultEncoding, T !== $.encoding && (C = f.from(C, T), T = ""), J = !0), w(this, C, T, !1, J);
  }, _.prototype.unshift = function(C) {
    return w(this, C, null, !0, !1);
  };
  function w(C, T, $, J, fe) {
    var G = C._readableState;
    if (T === null)
      G.reading = !1, K(C, G);
    else {
      var oe;
      fe || (oe = E(G, T)), oe ? C.emit("error", oe) : G.objectMode || T && T.length > 0 ? (typeof T != "string" && !G.objectMode && Object.getPrototypeOf(T) !== f.prototype && (T = l(T)), J ? G.endEmitted ? C.emit("error", new Error("stream.unshift() after end event")) : A(C, G, T, !0) : G.ended ? C.emit("error", new Error("stream.push() after EOF")) : (G.reading = !1, G.decoder && !$ ? (T = G.decoder.write(T), G.objectMode || T.length !== 0 ? A(C, G, T, !1) : H(C, G)) : A(C, G, T, !1))) : J || (G.reading = !1);
    }
    return O(G);
  }
  function A(C, T, $, J) {
    T.flowing && T.length === 0 && !T.sync ? (C.emit("data", $), C.read(0)) : (T.length += T.objectMode ? 1 : $.length, J ? T.buffer.unshift($) : T.buffer.push($), T.needReadable && V(C)), H(C, T);
  }
  function E(C, T) {
    var $;
    return !a(T) && typeof T != "string" && T !== void 0 && !C.objectMode && ($ = new TypeError("Invalid non-string/buffer chunk")), $;
  }
  function O(C) {
    return !C.ended && (C.needReadable || C.length < C.highWaterMark || C.length === 0);
  }
  _.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, _.prototype.setEncoding = function(C) {
    return s || (s = hs().StringDecoder), this._readableState.decoder = new s(C), this._readableState.encoding = C, this;
  };
  var D = 8388608;
  function L(C) {
    return C >= D ? C = D : (C--, C |= C >>> 1, C |= C >>> 2, C |= C >>> 4, C |= C >>> 8, C |= C >>> 16, C++), C;
  }
  function P(C, T) {
    return C <= 0 || T.length === 0 && T.ended ? 0 : T.objectMode ? 1 : C !== C ? T.flowing && T.length ? T.buffer.head.data.length : T.length : (C > T.highWaterMark && (T.highWaterMark = L(C)), C <= T.length ? C : T.ended ? T.length : (T.needReadable = !0, 0));
  }
  _.prototype.read = function(C) {
    e("read", C), C = parseInt(C, 10);
    var T = this._readableState, $ = C;
    if (C !== 0 && (T.emittedReadable = !1), C === 0 && T.needReadable && (T.length >= T.highWaterMark || T.ended))
      return e("read: emitReadable", T.length, T.ended), T.length === 0 && T.ended ? he(this) : V(this), null;
    if (C = P(C, T), C === 0 && T.ended)
      return T.length === 0 && he(this), null;
    var J = T.needReadable;
    e("need readable", J), (T.length === 0 || T.length - C < T.highWaterMark) && (J = !0, e("length less than watermark", J)), T.ended || T.reading ? (J = !1, e("reading or ended", J)) : J && (e("do read"), T.reading = !0, T.sync = !0, T.length === 0 && (T.needReadable = !0), this._read(T.highWaterMark), T.sync = !1, T.reading || (C = P($, T)));
    var fe;
    return C > 0 ? fe = Z(C, T) : fe = null, fe === null ? (T.needReadable = !0, C = 0) : T.length -= C, T.length === 0 && (T.ended || (T.needReadable = !0), $ !== C && T.ended && he(this)), fe !== null && this.emit("data", fe), fe;
  };
  function K(C, T) {
    if (!T.ended) {
      if (T.decoder) {
        var $ = T.decoder.end();
        $ && $.length && (T.buffer.push($), T.length += T.objectMode ? 1 : $.length);
      }
      T.ended = !0, V(C);
    }
  }
  function V(C) {
    var T = C._readableState;
    T.needReadable = !1, T.emittedReadable || (e("emitReadable", T.flowing), T.emittedReadable = !0, T.sync ? d.nextTick(W, C) : W(C));
  }
  function W(C) {
    e("emit readable"), C.emit("readable"), F(C);
  }
  function H(C, T) {
    T.readingMore || (T.readingMore = !0, d.nextTick(re, C, T));
  }
  function re(C, T) {
    for (var $ = T.length; !T.reading && !T.flowing && !T.ended && T.length < T.highWaterMark && (e("maybeReadMore read 0"), C.read(0), $ !== T.length); )
      $ = T.length;
    T.readingMore = !1;
  }
  _.prototype._read = function(C) {
    this.emit("error", new Error("_read() is not implemented"));
  }, _.prototype.pipe = function(C, T) {
    var $ = this, J = this._readableState;
    switch (J.pipesCount) {
      case 0:
        J.pipes = C;
        break;
      case 1:
        J.pipes = [J.pipes, C];
        break;
      default:
        J.pipes.push(C);
        break;
    }
    J.pipesCount += 1, e("pipe count=%d opts=%j", J.pipesCount, T);
    var fe = (!T || T.end !== !1) && C !== process.stdout && C !== process.stderr, G = fe ? Ke : He;
    J.endEmitted ? d.nextTick(G) : $.once("end", G), C.on("unpipe", oe);
    function oe(je, Oe) {
      e("onunpipe"), je === $ && Oe && Oe.hasUnpiped === !1 && (Oe.hasUnpiped = !0, ke());
    }
    function Ke() {
      e("onend"), C.end();
    }
    var De = ue($);
    C.on("drain", De);
    var Le = !1;
    function ke() {
      e("cleanup"), C.removeListener("close", We), C.removeListener("finish", Pe), C.removeListener("drain", De), C.removeListener("error", Qe), C.removeListener("unpipe", oe), $.removeListener("end", Ke), $.removeListener("end", He), $.removeListener("data", Fe), Le = !0, J.awaitDrain && (!C._writableState || C._writableState.needDrain) && De();
    }
    var de = !1;
    $.on("data", Fe);
    function Fe(je) {
      e("ondata"), de = !1;
      var Oe = C.write(je);
      Oe === !1 && !de && ((J.pipesCount === 1 && J.pipes === C || J.pipesCount > 1 && me(J.pipes, C) !== -1) && !Le && (e("false write response, pause", J.awaitDrain), J.awaitDrain++, de = !0), $.pause());
    }
    function Qe(je) {
      e("onerror", je), He(), C.removeListener("error", Qe), u(C, "error") === 0 && C.emit("error", je);
    }
    y(C, "error", Qe);
    function We() {
      C.removeListener("finish", Pe), He();
    }
    C.once("close", We);
    function Pe() {
      e("onfinish"), C.removeListener("close", We), He();
    }
    C.once("finish", Pe);
    function He() {
      e("unpipe"), $.unpipe(C);
    }
    return C.emit("pipe", $), J.flowing || (e("pipe resume"), $.resume()), C;
  };
  function ue(C) {
    return function() {
      var T = C._readableState;
      e("pipeOnDrain", T.awaitDrain), T.awaitDrain && T.awaitDrain--, T.awaitDrain === 0 && u(C, "data") && (T.flowing = !0, F(C));
    };
  }
  _.prototype.unpipe = function(C) {
    var T = this._readableState, $ = { hasUnpiped: !1 };
    if (T.pipesCount === 0) return this;
    if (T.pipesCount === 1)
      return C && C !== T.pipes ? this : (C || (C = T.pipes), T.pipes = null, T.pipesCount = 0, T.flowing = !1, C && C.emit("unpipe", this, $), this);
    if (!C) {
      var J = T.pipes, fe = T.pipesCount;
      T.pipes = null, T.pipesCount = 0, T.flowing = !1;
      for (var G = 0; G < fe; G++)
        J[G].emit("unpipe", this, { hasUnpiped: !1 });
      return this;
    }
    var oe = me(T.pipes, C);
    return oe === -1 ? this : (T.pipes.splice(oe, 1), T.pipesCount -= 1, T.pipesCount === 1 && (T.pipes = T.pipes[0]), C.emit("unpipe", this, $), this);
  }, _.prototype.on = function(C, T) {
    var $ = v.prototype.on.call(this, C, T);
    if (C === "data")
      this._readableState.flowing !== !1 && this.resume();
    else if (C === "readable") {
      var J = this._readableState;
      !J.endEmitted && !J.readableListening && (J.readableListening = J.needReadable = !0, J.emittedReadable = !1, J.reading ? J.length && V(this) : d.nextTick(ce, this));
    }
    return $;
  }, _.prototype.addListener = _.prototype.on;
  function ce(C) {
    e("readable nexttick read 0"), C.read(0);
  }
  _.prototype.resume = function() {
    var C = this._readableState;
    return C.flowing || (e("resume"), C.flowing = !0, R(this, C)), this;
  };
  function R(C, T) {
    T.resumeScheduled || (T.resumeScheduled = !0, d.nextTick(I, C, T));
  }
  function I(C, T) {
    T.reading || (e("resume read 0"), C.read(0)), T.resumeScheduled = !1, T.awaitDrain = 0, C.emit("resume"), F(C), T.flowing && !T.reading && C.read(0);
  }
  _.prototype.pause = function() {
    return e("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (e("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
  };
  function F(C) {
    var T = C._readableState;
    for (e("flow", T.flowing); T.flowing && C.read() !== null; )
      ;
  }
  _.prototype.wrap = function(C) {
    var T = this, $ = this._readableState, J = !1;
    C.on("end", function() {
      if (e("wrapped end"), $.decoder && !$.ended) {
        var oe = $.decoder.end();
        oe && oe.length && T.push(oe);
      }
      T.push(null);
    }), C.on("data", function(oe) {
      if (e("wrapped data"), $.decoder && (oe = $.decoder.write(oe)), !($.objectMode && oe == null) && !(!$.objectMode && (!oe || !oe.length))) {
        var Ke = T.push(oe);
        Ke || (J = !0, C.pause());
      }
    });
    for (var fe in C)
      this[fe] === void 0 && typeof C[fe] == "function" && (this[fe] = /* @__PURE__ */ (function(oe) {
        return function() {
          return C[oe].apply(C, arguments);
        };
      })(fe));
    for (var G = 0; G < c.length; G++)
      C.on(c[G], this.emit.bind(this, c[G]));
    return this._read = function(oe) {
      e("wrapped _read", oe), J && (J = !1, C.resume());
    }, this;
  }, Object.defineProperty(_.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), _._fromList = Z;
  function Z(C, T) {
    if (T.length === 0) return null;
    var $;
    return T.objectMode ? $ = T.buffer.shift() : !C || C >= T.length ? (T.decoder ? $ = T.buffer.join("") : T.buffer.length === 1 ? $ = T.buffer.head.data : $ = T.buffer.concat(T.length), T.buffer.clear()) : $ = te(C, T.buffer, T.decoder), $;
  }
  function te(C, T, $) {
    var J;
    return C < T.head.data.length ? (J = T.head.data.slice(0, C), T.head.data = T.head.data.slice(C)) : C === T.head.data.length ? J = T.shift() : J = $ ? ie(C, T) : se(C, T), J;
  }
  function ie(C, T) {
    var $ = T.head, J = 1, fe = $.data;
    for (C -= fe.length; $ = $.next; ) {
      var G = $.data, oe = C > G.length ? G.length : C;
      if (oe === G.length ? fe += G : fe += G.slice(0, C), C -= oe, C === 0) {
        oe === G.length ? (++J, $.next ? T.head = $.next : T.head = T.tail = null) : (T.head = $, $.data = G.slice(oe));
        break;
      }
      ++J;
    }
    return T.length -= J, fe;
  }
  function se(C, T) {
    var $ = f.allocUnsafe(C), J = T.head, fe = 1;
    for (J.data.copy($), C -= J.data.length; J = J.next; ) {
      var G = J.data, oe = C > G.length ? G.length : C;
      if (G.copy($, $.length - C, 0, oe), C -= oe, C === 0) {
        oe === G.length ? (++fe, J.next ? T.head = J.next : T.head = T.tail = null) : (T.head = J, J.data = G.slice(oe));
        break;
      }
      ++fe;
    }
    return T.length -= fe, $;
  }
  function he(C) {
    var T = C._readableState;
    if (T.length > 0) throw new Error('"endReadable()" called on non-empty stream');
    T.endEmitted || (T.ended = !0, d.nextTick(_e, T, C));
  }
  function _e(C, T) {
    !C.endEmitted && C.length === 0 && (C.endEmitted = !0, T.readable = !1, T.emit("end"));
  }
  function me(C, T) {
    for (var $ = 0, J = C.length; $ < J; $++)
      if (C[$] === T) return $;
    return -1;
  }
  return Ai;
}
var Ei, ps;
function Jo() {
  if (ps) return Ei;
  ps = 1, Ei = u;
  var d = Ct(), h = Object.create($t());
  h.inherits = Ut(), h.inherits(u, d);
  function m(n, l) {
    var a = this._transformState;
    a.transforming = !1;
    var o = a.writecb;
    if (!o)
      return this.emit("error", new Error("write callback called multiple times"));
    a.writechunk = null, a.writecb = null, l != null && this.push(l), o(n);
    var r = this._readableState;
    r.reading = !1, (r.needReadable || r.length < r.highWaterMark) && this._read(r.highWaterMark);
  }
  function u(n) {
    if (!(this instanceof u)) return new u(n);
    d.call(this, n), this._transformState = {
      afterTransform: m.bind(this),
      needTransform: !1,
      transforming: !1,
      writecb: null,
      writechunk: null,
      writeencoding: null
    }, this._readableState.needReadable = !0, this._readableState.sync = !1, n && (typeof n.transform == "function" && (this._transform = n.transform), typeof n.flush == "function" && (this._flush = n.flush)), this.on("prefinish", v);
  }
  function v() {
    var n = this;
    typeof this._flush == "function" ? this._flush(function(l, a) {
      f(n, l, a);
    }) : f(this, null, null);
  }
  u.prototype.push = function(n, l) {
    return this._transformState.needTransform = !1, d.prototype.push.call(this, n, l);
  }, u.prototype._transform = function(n, l, a) {
    throw new Error("_transform() is not implemented");
  }, u.prototype._write = function(n, l, a) {
    var o = this._transformState;
    if (o.writecb = a, o.writechunk = n, o.writeencoding = l, !o.transforming) {
      var r = this._readableState;
      (o.needTransform || r.needReadable || r.length < r.highWaterMark) && this._read(r.highWaterMark);
    }
  }, u.prototype._read = function(n) {
    var l = this._transformState;
    l.writechunk !== null && l.writecb && !l.transforming ? (l.transforming = !0, this._transform(l.writechunk, l.writeencoding, l.afterTransform)) : l.needTransform = !0;
  }, u.prototype._destroy = function(n, l) {
    var a = this;
    d.prototype._destroy.call(this, n, function(o) {
      l(o), a.emit("close");
    });
  };
  function f(n, l, a) {
    if (l) return n.emit("error", l);
    if (a != null && n.push(a), n._writableState.length) throw new Error("Calling transform done when ws.length != 0");
    if (n._transformState.transforming) throw new Error("Calling transform done when still transforming");
    return n.push(null);
  }
  return Ei;
}
var Ci, ms;
function Wl() {
  if (ms) return Ci;
  ms = 1, Ci = m;
  var d = Jo(), h = Object.create($t());
  h.inherits = Ut(), h.inherits(m, d);
  function m(u) {
    if (!(this instanceof m)) return new m(u);
    d.call(this, u);
  }
  return m.prototype._transform = function(u, v, f) {
    f(null, u);
  }, Ci;
}
var gs;
function Vo() {
  return gs || (gs = 1, (function(d, h) {
    var m = _o;
    process.env.READABLE_STREAM === "disable" && m ? (d.exports = m, h = d.exports = m.Readable, h.Readable = m.Readable, h.Writable = m.Writable, h.Duplex = m.Duplex, h.Transform = m.Transform, h.PassThrough = m.PassThrough, h.Stream = m) : (h = d.exports = Zo(), h.Stream = m || h, h.Readable = h, h.Writable = Yo(), h.Duplex = Ct(), h.Transform = Jo(), h.PassThrough = Wl());
  })(nr, nr.exports)), nr.exports;
}
var vs;
function lt() {
  if (vs) return ze;
  if (vs = 1, ze.base64 = !0, ze.array = !0, ze.string = !0, ze.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", ze.nodebuffer = typeof Buffer < "u", ze.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u")
    ze.blob = !1;
  else {
    var d = new ArrayBuffer(0);
    try {
      ze.blob = new Blob([d], {
        type: "application/zip"
      }).size === 0;
    } catch {
      try {
        var h = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, m = new h();
        m.append(d), ze.blob = m.getBlob("application/zip").size === 0;
      } catch {
        ze.blob = !1;
      }
    }
  }
  try {
    ze.nodestream = !!Vo().Readable;
  } catch {
    ze.nodestream = !1;
  }
  return ze;
}
var fr = {}, ys;
function Go() {
  if (ys) return fr;
  ys = 1;
  var d = Ee(), h = lt(), m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  return fr.encode = function(u) {
    for (var v = [], f, n, l, a, o, r, e, t = 0, i = u.length, s = i, c = d.getTypeOf(u) !== "string"; t < u.length; )
      s = i - t, c ? (f = u[t++], n = t < i ? u[t++] : 0, l = t < i ? u[t++] : 0) : (f = u.charCodeAt(t++), n = t < i ? u.charCodeAt(t++) : 0, l = t < i ? u.charCodeAt(t++) : 0), a = f >> 2, o = (f & 3) << 4 | n >> 4, r = s > 1 ? (n & 15) << 2 | l >> 6 : 64, e = s > 2 ? l & 63 : 64, v.push(m.charAt(a) + m.charAt(o) + m.charAt(r) + m.charAt(e));
    return v.join("");
  }, fr.decode = function(u) {
    var v, f, n, l, a, o, r, e = 0, t = 0, i = "data:";
    if (u.substr(0, i.length) === i)
      throw new Error("Invalid base64 input, it looks like a data url.");
    u = u.replace(/[^A-Za-z0-9+/=]/g, "");
    var s = u.length * 3 / 4;
    if (u.charAt(u.length - 1) === m.charAt(64) && s--, u.charAt(u.length - 2) === m.charAt(64) && s--, s % 1 !== 0)
      throw new Error("Invalid base64 input, bad content length.");
    var c;
    for (h.uint8array ? c = new Uint8Array(s | 0) : c = new Array(s | 0); e < u.length; )
      l = m.indexOf(u.charAt(e++)), a = m.indexOf(u.charAt(e++)), o = m.indexOf(u.charAt(e++)), r = m.indexOf(u.charAt(e++)), v = l << 2 | a >> 4, f = (a & 15) << 4 | o >> 2, n = (o & 3) << 6 | r, c[t++] = v, o !== 64 && (c[t++] = f), r !== 64 && (c[t++] = n);
    return c;
  }, fr;
}
var Ti, _s;
function kr() {
  return _s || (_s = 1, Ti = {
    /**
     * True if this is running in Nodejs, will be undefined in a browser.
     * In a browser, browserify won't include this file and the whole module
     * will be resolved an empty object.
     */
    isNode: typeof Buffer < "u",
    /**
     * Create a new nodejs Buffer from an existing content.
     * @param {Object} data the data to pass to the constructor.
     * @param {String} encoding the encoding to use.
     * @return {Buffer} a new Buffer.
     */
    newBufferFrom: function(d, h) {
      if (Buffer.from && Buffer.from !== Uint8Array.from)
        return Buffer.from(d, h);
      if (typeof d == "number")
        throw new Error('The "data" argument must not be a number');
      return new Buffer(d, h);
    },
    /**
     * Create a new nodejs Buffer with the specified size.
     * @param {Integer} size the size of the buffer.
     * @return {Buffer} a new Buffer.
     */
    allocBuffer: function(d) {
      if (Buffer.alloc)
        return Buffer.alloc(d);
      var h = new Buffer(d);
      return h.fill(0), h;
    },
    /**
     * Find out if an object is a Buffer.
     * @param {Object} b the object to test.
     * @return {Boolean} true if the object is a Buffer, false otherwise.
     */
    isBuffer: function(d) {
      return Buffer.isBuffer(d);
    },
    isStream: function(d) {
      return d && typeof d.on == "function" && typeof d.pause == "function" && typeof d.resume == "function";
    }
  }), Ti;
}
var Ri, bs;
function Hl() {
  if (bs) return Ri;
  bs = 1;
  var d = Be.MutationObserver || Be.WebKitMutationObserver, h;
  if (process.browser)
    if (d) {
      var m = 0, u = new d(a), v = Be.document.createTextNode("");
      u.observe(v, {
        characterData: !0
      }), h = function() {
        v.data = m = ++m % 2;
      };
    } else if (!Be.setImmediate && typeof Be.MessageChannel < "u") {
      var f = new Be.MessageChannel();
      f.port1.onmessage = a, h = function() {
        f.port2.postMessage(0);
      };
    } else "document" in Be && "onreadystatechange" in Be.document.createElement("script") ? h = function() {
      var r = Be.document.createElement("script");
      r.onreadystatechange = function() {
        a(), r.onreadystatechange = null, r.parentNode.removeChild(r), r = null;
      }, Be.document.documentElement.appendChild(r);
    } : h = function() {
      setTimeout(a, 0);
    };
  else
    h = function() {
      process.nextTick(a);
    };
  var n, l = [];
  function a() {
    n = !0;
    for (var r, e, t = l.length; t; ) {
      for (e = l, l = [], r = -1; ++r < t; )
        e[r]();
      t = l.length;
    }
    n = !1;
  }
  Ri = o;
  function o(r) {
    l.push(r) === 1 && !n && h();
  }
  return Ri;
}
var Ni, ws;
function Yl() {
  if (ws) return Ni;
  ws = 1;
  var d = Hl();
  function h() {
  }
  var m = {}, u = ["REJECTED"], v = ["FULFILLED"], f = ["PENDING"];
  if (!process.browser)
    var n = ["UNHANDLED"];
  Ni = l;
  function l(g) {
    if (typeof g != "function")
      throw new TypeError("resolver must be a function");
    this.state = f, this.queue = [], this.outcome = void 0, process.browser || (this.handled = n), g !== h && e(this, g);
  }
  l.prototype.finally = function(g) {
    if (typeof g != "function")
      return this;
    var _ = this.constructor;
    return this.then(w, A);
    function w(E) {
      function O() {
        return E;
      }
      return _.resolve(g()).then(O);
    }
    function A(E) {
      function O() {
        throw E;
      }
      return _.resolve(g()).then(O);
    }
  }, l.prototype.catch = function(g) {
    return this.then(null, g);
  }, l.prototype.then = function(g, _) {
    if (typeof g != "function" && this.state === v || typeof _ != "function" && this.state === u)
      return this;
    var w = new this.constructor(h);
    if (process.browser || this.handled === n && (this.handled = null), this.state !== f) {
      var A = this.state === v ? g : _;
      o(w, A, this.outcome);
    } else
      this.queue.push(new a(w, g, _));
    return w;
  };
  function a(g, _, w) {
    this.promise = g, typeof _ == "function" && (this.onFulfilled = _, this.callFulfilled = this.otherCallFulfilled), typeof w == "function" && (this.onRejected = w, this.callRejected = this.otherCallRejected);
  }
  a.prototype.callFulfilled = function(g) {
    m.resolve(this.promise, g);
  }, a.prototype.otherCallFulfilled = function(g) {
    o(this.promise, this.onFulfilled, g);
  }, a.prototype.callRejected = function(g) {
    m.reject(this.promise, g);
  }, a.prototype.otherCallRejected = function(g) {
    o(this.promise, this.onRejected, g);
  };
  function o(g, _, w) {
    d(function() {
      var A;
      try {
        A = _(w);
      } catch (E) {
        return m.reject(g, E);
      }
      A === g ? m.reject(g, new TypeError("Cannot resolve promise with itself")) : m.resolve(g, A);
    });
  }
  m.resolve = function(g, _) {
    var w = t(r, _);
    if (w.status === "error")
      return m.reject(g, w.value);
    var A = w.value;
    if (A)
      e(g, A);
    else {
      g.state = v, g.outcome = _;
      for (var E = -1, O = g.queue.length; ++E < O; )
        g.queue[E].callFulfilled(_);
    }
    return g;
  }, m.reject = function(g, _) {
    g.state = u, g.outcome = _, process.browser || g.handled === n && d(function() {
      g.handled === n && process.emit("unhandledRejection", _, g);
    });
    for (var w = -1, A = g.queue.length; ++w < A; )
      g.queue[w].callRejected(_);
    return g;
  };
  function r(g) {
    var _ = g && g.then;
    if (g && (typeof g == "object" || typeof g == "function") && typeof _ == "function")
      return function() {
        _.apply(g, arguments);
      };
  }
  function e(g, _) {
    var w = !1;
    function A(L) {
      w || (w = !0, m.reject(g, L));
    }
    function E(L) {
      w || (w = !0, m.resolve(g, L));
    }
    function O() {
      _(E, A);
    }
    var D = t(O);
    D.status === "error" && A(D.value);
  }
  function t(g, _) {
    var w = {};
    try {
      w.value = g(_), w.status = "success";
    } catch (A) {
      w.status = "error", w.value = A;
    }
    return w;
  }
  l.resolve = i;
  function i(g) {
    return g instanceof this ? g : m.resolve(new this(h), g);
  }
  l.reject = s;
  function s(g) {
    var _ = new this(h);
    return m.reject(_, g);
  }
  l.all = c;
  function c(g) {
    var _ = this;
    if (Object.prototype.toString.call(g) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var w = g.length, A = !1;
    if (!w)
      return this.resolve([]);
    for (var E = new Array(w), O = 0, D = -1, L = new this(h); ++D < w; )
      P(g[D], D);
    return L;
    function P(K, V) {
      _.resolve(K).then(W, function(H) {
        A || (A = !0, m.reject(L, H));
      });
      function W(H) {
        E[V] = H, ++O === w && !A && (A = !0, m.resolve(L, E));
      }
    }
  }
  l.race = y;
  function y(g) {
    var _ = this;
    if (Object.prototype.toString.call(g) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var w = g.length, A = !1;
    if (!w)
      return this.resolve([]);
    for (var E = -1, O = new this(h); ++E < w; )
      D(g[E]);
    return O;
    function D(L) {
      _.resolve(L).then(function(P) {
        A || (A = !0, m.resolve(O, P));
      }, function(P) {
        A || (A = !0, m.reject(O, P));
      });
    }
  }
  return Ni;
}
var Oi, Ss;
function zt() {
  if (Ss) return Oi;
  Ss = 1;
  var d = null;
  return typeof Promise < "u" ? d = Promise : d = Yl(), Oi = {
    Promise: d
  }, Oi;
}
var xi = {}, ks;
function Zl() {
  return ks || (ks = 1, (function(d, h) {
    if (d.setImmediate)
      return;
    var m = 1, u = {}, v = !1, f = d.document, n;
    function l(_) {
      typeof _ != "function" && (_ = new Function("" + _));
      for (var w = new Array(arguments.length - 1), A = 0; A < w.length; A++)
        w[A] = arguments[A + 1];
      var E = { callback: _, args: w };
      return u[m] = E, n(m), m++;
    }
    function a(_) {
      delete u[_];
    }
    function o(_) {
      var w = _.callback, A = _.args;
      switch (A.length) {
        case 0:
          w();
          break;
        case 1:
          w(A[0]);
          break;
        case 2:
          w(A[0], A[1]);
          break;
        case 3:
          w(A[0], A[1], A[2]);
          break;
        default:
          w.apply(h, A);
          break;
      }
    }
    function r(_) {
      if (v)
        setTimeout(r, 0, _);
      else {
        var w = u[_];
        if (w) {
          v = !0;
          try {
            o(w);
          } finally {
            a(_), v = !1;
          }
        }
      }
    }
    function e() {
      n = function(_) {
        process.nextTick(function() {
          r(_);
        });
      };
    }
    function t() {
      if (d.postMessage && !d.importScripts) {
        var _ = !0, w = d.onmessage;
        return d.onmessage = function() {
          _ = !1;
        }, d.postMessage("", "*"), d.onmessage = w, _;
      }
    }
    function i() {
      var _ = "setImmediate$" + Math.random() + "$", w = function(A) {
        A.source === d && typeof A.data == "string" && A.data.indexOf(_) === 0 && r(+A.data.slice(_.length));
      };
      d.addEventListener ? d.addEventListener("message", w, !1) : d.attachEvent("onmessage", w), n = function(A) {
        d.postMessage(_ + A, "*");
      };
    }
    function s() {
      var _ = new MessageChannel();
      _.port1.onmessage = function(w) {
        var A = w.data;
        r(A);
      }, n = function(w) {
        _.port2.postMessage(w);
      };
    }
    function c() {
      var _ = f.documentElement;
      n = function(w) {
        var A = f.createElement("script");
        A.onreadystatechange = function() {
          r(w), A.onreadystatechange = null, _.removeChild(A), A = null;
        }, _.appendChild(A);
      };
    }
    function y() {
      n = function(_) {
        setTimeout(r, 0, _);
      };
    }
    var g = Object.getPrototypeOf && Object.getPrototypeOf(d);
    g = g && g.setTimeout ? g : d, {}.toString.call(d.process) === "[object process]" ? e() : t() ? i() : d.MessageChannel ? s() : f && "onreadystatechange" in f.createElement("script") ? c() : y(), g.setImmediate = l, g.clearImmediate = a;
  })(typeof self > "u" ? typeof Be > "u" ? xi : Be : self)), xi;
}
var As;
function Ee() {
  return As || (As = 1, (function(d) {
    var h = lt(), m = Go(), u = kr(), v = zt();
    Zl();
    function f(t) {
      var i = null;
      return h.uint8array ? i = new Uint8Array(t.length) : i = new Array(t.length), l(t, i);
    }
    d.newBlob = function(t, i) {
      d.checkSupport("blob");
      try {
        return new Blob([t], {
          type: i
        });
      } catch {
        try {
          var s = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, c = new s();
          return c.append(t), c.getBlob(i);
        } catch {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function n(t) {
      return t;
    }
    function l(t, i) {
      for (var s = 0; s < t.length; ++s)
        i[s] = t.charCodeAt(s) & 255;
      return i;
    }
    var a = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(t, i, s) {
        var c = [], y = 0, g = t.length;
        if (g <= s)
          return String.fromCharCode.apply(null, t);
        for (; y < g; )
          i === "array" || i === "nodebuffer" ? c.push(String.fromCharCode.apply(null, t.slice(y, Math.min(y + s, g)))) : c.push(String.fromCharCode.apply(null, t.subarray(y, Math.min(y + s, g)))), y += s;
        return c.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(t) {
        for (var i = "", s = 0; s < t.length; s++)
          i += String.fromCharCode(t[s]);
        return i;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function() {
          try {
            return h.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch {
            return !1;
          }
        })(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: (function() {
          try {
            return h.nodebuffer && String.fromCharCode.apply(null, u.allocBuffer(1)).length === 1;
          } catch {
            return !1;
          }
        })()
      }
    };
    function o(t) {
      var i = 65536, s = d.getTypeOf(t), c = !0;
      if (s === "uint8array" ? c = a.applyCanBeUsed.uint8array : s === "nodebuffer" && (c = a.applyCanBeUsed.nodebuffer), c)
        for (; i > 1; )
          try {
            return a.stringifyByChunk(t, s, i);
          } catch {
            i = Math.floor(i / 2);
          }
      return a.stringifyByChar(t);
    }
    d.applyFromCharCode = o;
    function r(t, i) {
      for (var s = 0; s < t.length; s++)
        i[s] = t[s];
      return i;
    }
    var e = {};
    e.string = {
      string: n,
      array: function(t) {
        return l(t, new Array(t.length));
      },
      arraybuffer: function(t) {
        return e.string.uint8array(t).buffer;
      },
      uint8array: function(t) {
        return l(t, new Uint8Array(t.length));
      },
      nodebuffer: function(t) {
        return l(t, u.allocBuffer(t.length));
      }
    }, e.array = {
      string: o,
      array: n,
      arraybuffer: function(t) {
        return new Uint8Array(t).buffer;
      },
      uint8array: function(t) {
        return new Uint8Array(t);
      },
      nodebuffer: function(t) {
        return u.newBufferFrom(t);
      }
    }, e.arraybuffer = {
      string: function(t) {
        return o(new Uint8Array(t));
      },
      array: function(t) {
        return r(new Uint8Array(t), new Array(t.byteLength));
      },
      arraybuffer: n,
      uint8array: function(t) {
        return new Uint8Array(t);
      },
      nodebuffer: function(t) {
        return u.newBufferFrom(new Uint8Array(t));
      }
    }, e.uint8array = {
      string: o,
      array: function(t) {
        return r(t, new Array(t.length));
      },
      arraybuffer: function(t) {
        return t.buffer;
      },
      uint8array: n,
      nodebuffer: function(t) {
        return u.newBufferFrom(t);
      }
    }, e.nodebuffer = {
      string: o,
      array: function(t) {
        return r(t, new Array(t.length));
      },
      arraybuffer: function(t) {
        return e.nodebuffer.uint8array(t).buffer;
      },
      uint8array: function(t) {
        return r(t, new Uint8Array(t.length));
      },
      nodebuffer: n
    }, d.transformTo = function(t, i) {
      if (i || (i = ""), !t)
        return i;
      d.checkSupport(t);
      var s = d.getTypeOf(i), c = e[s][t](i);
      return c;
    }, d.resolve = function(t) {
      for (var i = t.split("/"), s = [], c = 0; c < i.length; c++) {
        var y = i[c];
        y === "." || y === "" && c !== 0 && c !== i.length - 1 || (y === ".." ? s.pop() : s.push(y));
      }
      return s.join("/");
    }, d.getTypeOf = function(t) {
      if (typeof t == "string")
        return "string";
      if (Object.prototype.toString.call(t) === "[object Array]")
        return "array";
      if (h.nodebuffer && u.isBuffer(t))
        return "nodebuffer";
      if (h.uint8array && t instanceof Uint8Array)
        return "uint8array";
      if (h.arraybuffer && t instanceof ArrayBuffer)
        return "arraybuffer";
    }, d.checkSupport = function(t) {
      var i = h[t.toLowerCase()];
      if (!i)
        throw new Error(t + " is not supported by this platform");
    }, d.MAX_VALUE_16BITS = 65535, d.MAX_VALUE_32BITS = -1, d.pretty = function(t) {
      var i = "", s, c;
      for (c = 0; c < (t || "").length; c++)
        s = t.charCodeAt(c), i += "\\x" + (s < 16 ? "0" : "") + s.toString(16).toUpperCase();
      return i;
    }, d.delay = function(t, i, s) {
      setImmediate(function() {
        t.apply(s || null, i || []);
      });
    }, d.inherits = function(t, i) {
      var s = function() {
      };
      s.prototype = i.prototype, t.prototype = new s();
    }, d.extend = function() {
      var t = {}, i, s;
      for (i = 0; i < arguments.length; i++)
        for (s in arguments[i])
          Object.prototype.hasOwnProperty.call(arguments[i], s) && typeof t[s] > "u" && (t[s] = arguments[i][s]);
      return t;
    }, d.prepareContent = function(t, i, s, c, y) {
      var g = v.Promise.resolve(i).then(function(_) {
        var w = h.blob && (_ instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(_)) !== -1);
        return w && typeof FileReader < "u" ? new v.Promise(function(A, E) {
          var O = new FileReader();
          O.onload = function(D) {
            A(D.target.result);
          }, O.onerror = function(D) {
            E(D.target.error);
          }, O.readAsArrayBuffer(_);
        }) : _;
      });
      return g.then(function(_) {
        var w = d.getTypeOf(_);
        return w ? (w === "arraybuffer" ? _ = d.transformTo("uint8array", _) : w === "string" && (y ? _ = m.decode(_) : s && c !== !0 && (_ = f(_))), _) : v.Promise.reject(
          new Error("Can't read the data of '" + t + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
        );
      });
    };
  })(mi)), mi;
}
var Ii, Es;
function Ve() {
  if (Es) return Ii;
  Es = 1;
  function d(h) {
    this.name = h || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = {
      data: [],
      end: [],
      error: []
    }, this.previous = null;
  }
  return d.prototype = {
    /**
     * Push a chunk to the next workers.
     * @param {Object} chunk the chunk to push
     */
    push: function(h) {
      this.emit("data", h);
    },
    /**
     * End the stream.
     * @return {Boolean} true if this call ended the worker, false otherwise.
     */
    end: function() {
      if (this.isFinished)
        return !1;
      this.flush();
      try {
        this.emit("end"), this.cleanUp(), this.isFinished = !0;
      } catch (h) {
        this.emit("error", h);
      }
      return !0;
    },
    /**
     * End the stream with an error.
     * @param {Error} e the error which caused the premature end.
     * @return {Boolean} true if this call ended the worker with an error, false otherwise.
     */
    error: function(h) {
      return this.isFinished ? !1 : (this.isPaused ? this.generatedError = h : (this.isFinished = !0, this.emit("error", h), this.previous && this.previous.error(h), this.cleanUp()), !0);
    },
    /**
     * Add a callback on an event.
     * @param {String} name the name of the event (data, end, error)
     * @param {Function} listener the function to call when the event is triggered
     * @return {GenericWorker} the current object for chainability
     */
    on: function(h, m) {
      return this._listeners[h].push(m), this;
    },
    /**
     * Clean any references when a worker is ending.
     */
    cleanUp: function() {
      this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
    },
    /**
     * Trigger an event. This will call registered callback with the provided arg.
     * @param {String} name the name of the event (data, end, error)
     * @param {Object} arg the argument to call the callback with.
     */
    emit: function(h, m) {
      if (this._listeners[h])
        for (var u = 0; u < this._listeners[h].length; u++)
          this._listeners[h][u].call(this, m);
    },
    /**
     * Chain a worker with an other.
     * @param {Worker} next the worker receiving events from the current one.
     * @return {worker} the next worker for chainability
     */
    pipe: function(h) {
      return h.registerPrevious(this);
    },
    /**
     * Same as `pipe` in the other direction.
     * Using an API with `pipe(next)` is very easy.
     * Implementing the API with the point of view of the next one registering
     * a source is easier, see the ZipFileWorker.
     * @param {Worker} previous the previous worker, sending events to this one
     * @return {Worker} the current worker for chainability
     */
    registerPrevious: function(h) {
      if (this.isLocked)
        throw new Error("The stream '" + this + "' has already been used.");
      this.streamInfo = h.streamInfo, this.mergeStreamInfo(), this.previous = h;
      var m = this;
      return h.on("data", function(u) {
        m.processChunk(u);
      }), h.on("end", function() {
        m.end();
      }), h.on("error", function(u) {
        m.error(u);
      }), this;
    },
    /**
     * Pause the stream so it doesn't send events anymore.
     * @return {Boolean} true if this call paused the worker, false otherwise.
     */
    pause: function() {
      return this.isPaused || this.isFinished ? !1 : (this.isPaused = !0, this.previous && this.previous.pause(), !0);
    },
    /**
     * Resume a paused stream.
     * @return {Boolean} true if this call resumed the worker, false otherwise.
     */
    resume: function() {
      if (!this.isPaused || this.isFinished)
        return !1;
      this.isPaused = !1;
      var h = !1;
      return this.generatedError && (this.error(this.generatedError), h = !0), this.previous && this.previous.resume(), !h;
    },
    /**
     * Flush any remaining bytes as the stream is ending.
     */
    flush: function() {
    },
    /**
     * Process a chunk. This is usually the method overridden.
     * @param {Object} chunk the chunk to process.
     */
    processChunk: function(h) {
      this.push(h);
    },
    /**
     * Add a key/value to be added in the workers chain streamInfo once activated.
     * @param {String} key the key to use
     * @param {Object} value the associated value
     * @return {Worker} the current worker for chainability
     */
    withStreamInfo: function(h, m) {
      return this.extraStreamInfo[h] = m, this.mergeStreamInfo(), this;
    },
    /**
     * Merge this worker's streamInfo into the chain's streamInfo.
     */
    mergeStreamInfo: function() {
      for (var h in this.extraStreamInfo)
        Object.prototype.hasOwnProperty.call(this.extraStreamInfo, h) && (this.streamInfo[h] = this.extraStreamInfo[h]);
    },
    /**
     * Lock the stream to prevent further updates on the workers chain.
     * After calling this method, all calls to pipe will fail.
     */
    lock: function() {
      if (this.isLocked)
        throw new Error("The stream '" + this + "' has already been used.");
      this.isLocked = !0, this.previous && this.previous.lock();
    },
    /**
     *
     * Pretty print the workers chain.
     */
    toString: function() {
      var h = "Worker " + this.name;
      return this.previous ? this.previous + " -> " + h : h;
    }
  }, Ii = d, Ii;
}
var Cs;
function Kt() {
  return Cs || (Cs = 1, (function(d) {
    for (var h = Ee(), m = lt(), u = kr(), v = Ve(), f = new Array(256), n = 0; n < 256; n++)
      f[n] = n >= 252 ? 6 : n >= 248 ? 5 : n >= 240 ? 4 : n >= 224 ? 3 : n >= 192 ? 2 : 1;
    f[254] = f[254] = 1;
    var l = function(t) {
      var i, s, c, y, g, _ = t.length, w = 0;
      for (y = 0; y < _; y++)
        s = t.charCodeAt(y), (s & 64512) === 55296 && y + 1 < _ && (c = t.charCodeAt(y + 1), (c & 64512) === 56320 && (s = 65536 + (s - 55296 << 10) + (c - 56320), y++)), w += s < 128 ? 1 : s < 2048 ? 2 : s < 65536 ? 3 : 4;
      for (m.uint8array ? i = new Uint8Array(w) : i = new Array(w), g = 0, y = 0; g < w; y++)
        s = t.charCodeAt(y), (s & 64512) === 55296 && y + 1 < _ && (c = t.charCodeAt(y + 1), (c & 64512) === 56320 && (s = 65536 + (s - 55296 << 10) + (c - 56320), y++)), s < 128 ? i[g++] = s : s < 2048 ? (i[g++] = 192 | s >>> 6, i[g++] = 128 | s & 63) : s < 65536 ? (i[g++] = 224 | s >>> 12, i[g++] = 128 | s >>> 6 & 63, i[g++] = 128 | s & 63) : (i[g++] = 240 | s >>> 18, i[g++] = 128 | s >>> 12 & 63, i[g++] = 128 | s >>> 6 & 63, i[g++] = 128 | s & 63);
      return i;
    }, a = function(t, i) {
      var s;
      for (i = i || t.length, i > t.length && (i = t.length), s = i - 1; s >= 0 && (t[s] & 192) === 128; )
        s--;
      return s < 0 || s === 0 ? i : s + f[t[s]] > i ? s : i;
    }, o = function(t) {
      var i, s, c, y, g = t.length, _ = new Array(g * 2);
      for (s = 0, i = 0; i < g; ) {
        if (c = t[i++], c < 128) {
          _[s++] = c;
          continue;
        }
        if (y = f[c], y > 4) {
          _[s++] = 65533, i += y - 1;
          continue;
        }
        for (c &= y === 2 ? 31 : y === 3 ? 15 : 7; y > 1 && i < g; )
          c = c << 6 | t[i++] & 63, y--;
        if (y > 1) {
          _[s++] = 65533;
          continue;
        }
        c < 65536 ? _[s++] = c : (c -= 65536, _[s++] = 55296 | c >> 10 & 1023, _[s++] = 56320 | c & 1023);
      }
      return _.length !== s && (_.subarray ? _ = _.subarray(0, s) : _.length = s), h.applyFromCharCode(_);
    };
    d.utf8encode = function(i) {
      return m.nodebuffer ? u.newBufferFrom(i, "utf-8") : l(i);
    }, d.utf8decode = function(i) {
      return m.nodebuffer ? h.transformTo("nodebuffer", i).toString("utf-8") : (i = h.transformTo(m.uint8array ? "uint8array" : "array", i), o(i));
    };
    function r() {
      v.call(this, "utf-8 decode"), this.leftOver = null;
    }
    h.inherits(r, v), r.prototype.processChunk = function(t) {
      var i = h.transformTo(m.uint8array ? "uint8array" : "array", t.data);
      if (this.leftOver && this.leftOver.length) {
        if (m.uint8array) {
          var s = i;
          i = new Uint8Array(s.length + this.leftOver.length), i.set(this.leftOver, 0), i.set(s, this.leftOver.length);
        } else
          i = this.leftOver.concat(i);
        this.leftOver = null;
      }
      var c = a(i), y = i;
      c !== i.length && (m.uint8array ? (y = i.subarray(0, c), this.leftOver = i.subarray(c, i.length)) : (y = i.slice(0, c), this.leftOver = i.slice(c, i.length))), this.push({
        data: d.utf8decode(y),
        meta: t.meta
      });
    }, r.prototype.flush = function() {
      this.leftOver && this.leftOver.length && (this.push({
        data: d.utf8decode(this.leftOver),
        meta: {}
      }), this.leftOver = null);
    }, d.Utf8DecodeWorker = r;
    function e() {
      v.call(this, "utf-8 encode");
    }
    h.inherits(e, v), e.prototype.processChunk = function(t) {
      this.push({
        data: d.utf8encode(t.data),
        meta: t.meta
      });
    }, d.Utf8EncodeWorker = e;
  })(pi)), pi;
}
var Di, Ts;
function Jl() {
  if (Ts) return Di;
  Ts = 1;
  var d = Ve(), h = Ee();
  function m(u) {
    d.call(this, "ConvertWorker to " + u), this.destType = u;
  }
  return h.inherits(m, d), m.prototype.processChunk = function(u) {
    this.push({
      data: h.transformTo(this.destType, u.data),
      meta: u.meta
    });
  }, Di = m, Di;
}
var Li, Rs;
function Vl() {
  if (Rs) return Li;
  Rs = 1;
  var d = Vo().Readable, h = Ee();
  h.inherits(m, d);
  function m(u, v, f) {
    d.call(this, v), this._helper = u;
    var n = this;
    u.on("data", function(l, a) {
      n.push(l) || n._helper.pause(), f && f(a);
    }).on("error", function(l) {
      n.emit("error", l);
    }).on("end", function() {
      n.push(null);
    });
  }
  return m.prototype._read = function() {
    this._helper.resume();
  }, Li = m, Li;
}
var Pi, Ns;
function Xo() {
  if (Ns) return Pi;
  Ns = 1;
  var d = Ee(), h = Jl(), m = Ve(), u = Go(), v = lt(), f = zt(), n = null;
  if (v.nodestream)
    try {
      n = Vl();
    } catch {
    }
  function l(e, t, i) {
    switch (e) {
      case "blob":
        return d.newBlob(d.transformTo("arraybuffer", t), i);
      case "base64":
        return u.encode(t);
      default:
        return d.transformTo(e, t);
    }
  }
  function a(e, t) {
    var i, s = 0, c = null, y = 0;
    for (i = 0; i < t.length; i++)
      y += t[i].length;
    switch (e) {
      case "string":
        return t.join("");
      case "array":
        return Array.prototype.concat.apply([], t);
      case "uint8array":
        for (c = new Uint8Array(y), i = 0; i < t.length; i++)
          c.set(t[i], s), s += t[i].length;
        return c;
      case "nodebuffer":
        return Buffer.concat(t);
      default:
        throw new Error("concat : unsupported type '" + e + "'");
    }
  }
  function o(e, t) {
    return new f.Promise(function(i, s) {
      var c = [], y = e._internalType, g = e._outputType, _ = e._mimeType;
      e.on("data", function(w, A) {
        c.push(w), t && t(A);
      }).on("error", function(w) {
        c = [], s(w);
      }).on("end", function() {
        try {
          var w = l(g, a(y, c), _);
          i(w);
        } catch (A) {
          s(A);
        }
        c = [];
      }).resume();
    });
  }
  function r(e, t, i) {
    var s = t;
    switch (t) {
      case "blob":
      case "arraybuffer":
        s = "uint8array";
        break;
      case "base64":
        s = "string";
        break;
    }
    try {
      this._internalType = s, this._outputType = t, this._mimeType = i, d.checkSupport(s), this._worker = e.pipe(new h(s)), e.lock();
    } catch (c) {
      this._worker = new m("error"), this._worker.error(c);
    }
  }
  return r.prototype = {
    /**
     * Listen a StreamHelper, accumulate its content and concatenate it into a
     * complete block.
     * @param {Function} updateCb the update callback.
     * @return Promise the promise for the accumulation.
     */
    accumulate: function(e) {
      return o(this, e);
    },
    /**
     * Add a listener on an event triggered on a stream.
     * @param {String} evt the name of the event
     * @param {Function} fn the listener
     * @return {StreamHelper} the current helper.
     */
    on: function(e, t) {
      var i = this;
      return e === "data" ? this._worker.on(e, function(s) {
        t.call(i, s.data, s.meta);
      }) : this._worker.on(e, function() {
        d.delay(t, arguments, i);
      }), this;
    },
    /**
     * Resume the flow of chunks.
     * @return {StreamHelper} the current helper.
     */
    resume: function() {
      return d.delay(this._worker.resume, [], this._worker), this;
    },
    /**
     * Pause the flow of chunks.
     * @return {StreamHelper} the current helper.
     */
    pause: function() {
      return this._worker.pause(), this;
    },
    /**
     * Return a nodejs stream for this helper.
     * @param {Function} updateCb the update callback.
     * @return {NodejsStreamOutputAdapter} the nodejs stream.
     */
    toNodejsStream: function(e) {
      if (d.checkSupport("nodestream"), this._outputType !== "nodebuffer")
        throw new Error(this._outputType + " is not supported by this method");
      return new n(this, {
        objectMode: this._outputType !== "nodebuffer"
      }, e);
    }
  }, Pi = r, Pi;
}
var Ze = {}, Os;
function Qo() {
  return Os || (Os = 1, Ze.base64 = !1, Ze.binary = !1, Ze.dir = !1, Ze.createFolders = !0, Ze.date = null, Ze.compression = null, Ze.compressionOptions = null, Ze.comment = null, Ze.unixPermissions = null, Ze.dosPermissions = null), Ze;
}
var Mi, xs;
function el() {
  if (xs) return Mi;
  xs = 1;
  var d = Ee(), h = Ve(), m = 16 * 1024;
  function u(v) {
    h.call(this, "DataWorker");
    var f = this;
    this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, v.then(function(n) {
      f.dataIsReady = !0, f.data = n, f.max = n && n.length || 0, f.type = d.getTypeOf(n), f.isPaused || f._tickAndRepeat();
    }, function(n) {
      f.error(n);
    });
  }
  return d.inherits(u, h), u.prototype.cleanUp = function() {
    h.prototype.cleanUp.call(this), this.data = null;
  }, u.prototype.resume = function() {
    return h.prototype.resume.call(this) ? (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, d.delay(this._tickAndRepeat, [], this)), !0) : !1;
  }, u.prototype._tickAndRepeat = function() {
    this._tickScheduled = !1, !(this.isPaused || this.isFinished) && (this._tick(), this.isFinished || (d.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
  }, u.prototype._tick = function() {
    if (this.isPaused || this.isFinished)
      return !1;
    var v = m, f = null, n = Math.min(this.max, this.index + v);
    if (this.index >= this.max)
      return this.end();
    switch (this.type) {
      case "string":
        f = this.data.substring(this.index, n);
        break;
      case "uint8array":
        f = this.data.subarray(this.index, n);
        break;
      case "array":
      case "nodebuffer":
        f = this.data.slice(this.index, n);
        break;
    }
    return this.index = n, this.push({
      data: f,
      meta: {
        percent: this.max ? this.index / this.max * 100 : 0
      }
    });
  }, Mi = u, Mi;
}
var qi, Is;
function Nn() {
  if (Is) return qi;
  Is = 1;
  var d = Ee();
  function h() {
    for (var f, n = [], l = 0; l < 256; l++) {
      f = l;
      for (var a = 0; a < 8; a++)
        f = f & 1 ? 3988292384 ^ f >>> 1 : f >>> 1;
      n[l] = f;
    }
    return n;
  }
  var m = h();
  function u(f, n, l, a) {
    var o = m, r = a + l;
    f = f ^ -1;
    for (var e = a; e < r; e++)
      f = f >>> 8 ^ o[(f ^ n[e]) & 255];
    return f ^ -1;
  }
  function v(f, n, l, a) {
    var o = m, r = a + l;
    f = f ^ -1;
    for (var e = a; e < r; e++)
      f = f >>> 8 ^ o[(f ^ n.charCodeAt(e)) & 255];
    return f ^ -1;
  }
  return qi = function(n, l) {
    if (typeof n > "u" || !n.length)
      return 0;
    var a = d.getTypeOf(n) !== "string";
    return a ? u(l | 0, n, n.length, 0) : v(l | 0, n, n.length, 0);
  }, qi;
}
var Bi, Ds;
function tl() {
  if (Ds) return Bi;
  Ds = 1;
  var d = Ve(), h = Nn(), m = Ee();
  function u() {
    d.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
  }
  return m.inherits(u, d), u.prototype.processChunk = function(v) {
    this.streamInfo.crc32 = h(v.data, this.streamInfo.crc32 || 0), this.push(v);
  }, Bi = u, Bi;
}
var Fi, Ls;
function Gl() {
  if (Ls) return Fi;
  Ls = 1;
  var d = Ee(), h = Ve();
  function m(u) {
    h.call(this, "DataLengthProbe for " + u), this.propName = u, this.withStreamInfo(u, 0);
  }
  return d.inherits(m, h), m.prototype.processChunk = function(u) {
    if (u) {
      var v = this.streamInfo[this.propName] || 0;
      this.streamInfo[this.propName] = v + u.data.length;
    }
    h.prototype.processChunk.call(this, u);
  }, Fi = m, Fi;
}
var ji, Ps;
function On() {
  if (Ps) return ji;
  Ps = 1;
  var d = zt(), h = el(), m = tl(), u = Gl();
  function v(f, n, l, a, o) {
    this.compressedSize = f, this.uncompressedSize = n, this.crc32 = l, this.compression = a, this.compressedContent = o;
  }
  return v.prototype = {
    /**
     * Create a worker to get the uncompressed content.
     * @return {GenericWorker} the worker.
     */
    getContentWorker: function() {
      var f = new h(d.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new u("data_length")), n = this;
      return f.on("end", function() {
        if (this.streamInfo.data_length !== n.uncompressedSize)
          throw new Error("Bug : uncompressed data size mismatch");
      }), f;
    },
    /**
     * Create a worker to get the compressed content.
     * @return {GenericWorker} the worker.
     */
    getCompressedWorker: function() {
      return new h(d.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
    }
  }, v.createWorkerFrom = function(f, n, l) {
    return f.pipe(new m()).pipe(new u("uncompressedSize")).pipe(n.compressWorker(l)).pipe(new u("compressedSize")).withStreamInfo("compression", n);
  }, ji = v, ji;
}
var $i, Ms;
function Xl() {
  if (Ms) return $i;
  Ms = 1;
  var d = Xo(), h = el(), m = Kt(), u = On(), v = Ve(), f = function(o, r, e) {
    this.name = o, this.dir = e.dir, this.date = e.date, this.comment = e.comment, this.unixPermissions = e.unixPermissions, this.dosPermissions = e.dosPermissions, this._data = r, this._dataBinary = e.binary, this.options = {
      compression: e.compression,
      compressionOptions: e.compressionOptions
    };
  };
  f.prototype = {
    /**
     * Create an internal stream for the content of this object.
     * @param {String} type the type of each chunk.
     * @return StreamHelper the stream.
     */
    internalStream: function(o) {
      var r = null, e = "string";
      try {
        if (!o)
          throw new Error("No output type specified.");
        e = o.toLowerCase();
        var t = e === "string" || e === "text";
        (e === "binarystring" || e === "text") && (e = "string"), r = this._decompressWorker();
        var i = !this._dataBinary;
        i && !t && (r = r.pipe(new m.Utf8EncodeWorker())), !i && t && (r = r.pipe(new m.Utf8DecodeWorker()));
      } catch (s) {
        r = new v("error"), r.error(s);
      }
      return new d(r, e, "");
    },
    /**
     * Prepare the content in the asked type.
     * @param {String} type the type of the result.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Promise the promise of the result.
     */
    async: function(o, r) {
      return this.internalStream(o).accumulate(r);
    },
    /**
     * Prepare the content as a nodejs stream.
     * @param {String} type the type of each chunk.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Stream the stream.
     */
    nodeStream: function(o, r) {
      return this.internalStream(o || "nodebuffer").toNodejsStream(r);
    },
    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    _compressWorker: function(o, r) {
      if (this._data instanceof u && this._data.compression.magic === o.magic)
        return this._data.getCompressedWorker();
      var e = this._decompressWorker();
      return this._dataBinary || (e = e.pipe(new m.Utf8EncodeWorker())), u.createWorkerFrom(e, o, r);
    },
    /**
     * Return a worker for the decompressed content.
     * @private
     * @return Worker the worker.
     */
    _decompressWorker: function() {
      return this._data instanceof u ? this._data.getContentWorker() : this._data instanceof v ? this._data : new h(this._data);
    }
  };
  for (var n = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
  }, a = 0; a < n.length; a++)
    f.prototype[n[a]] = l;
  return $i = f, $i;
}
var Ui = {}, ur = {}, Mt = {}, zi = {}, qs;
function ft() {
  return qs || (qs = 1, (function(d) {
    var h = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
    function m(f, n) {
      return Object.prototype.hasOwnProperty.call(f, n);
    }
    d.assign = function(f) {
      for (var n = Array.prototype.slice.call(arguments, 1); n.length; ) {
        var l = n.shift();
        if (l) {
          if (typeof l != "object")
            throw new TypeError(l + "must be non-object");
          for (var a in l)
            m(l, a) && (f[a] = l[a]);
        }
      }
      return f;
    }, d.shrinkBuf = function(f, n) {
      return f.length === n ? f : f.subarray ? f.subarray(0, n) : (f.length = n, f);
    };
    var u = {
      arraySet: function(f, n, l, a, o) {
        if (n.subarray && f.subarray) {
          f.set(n.subarray(l, l + a), o);
          return;
        }
        for (var r = 0; r < a; r++)
          f[o + r] = n[l + r];
      },
      // Join array of chunks to single array.
      flattenChunks: function(f) {
        var n, l, a, o, r, e;
        for (a = 0, n = 0, l = f.length; n < l; n++)
          a += f[n].length;
        for (e = new Uint8Array(a), o = 0, n = 0, l = f.length; n < l; n++)
          r = f[n], e.set(r, o), o += r.length;
        return e;
      }
    }, v = {
      arraySet: function(f, n, l, a, o) {
        for (var r = 0; r < a; r++)
          f[o + r] = n[l + r];
      },
      // Join array of chunks to single array.
      flattenChunks: function(f) {
        return [].concat.apply([], f);
      }
    };
    d.setTyped = function(f) {
      f ? (d.Buf8 = Uint8Array, d.Buf16 = Uint16Array, d.Buf32 = Int32Array, d.assign(d, u)) : (d.Buf8 = Array, d.Buf16 = Array, d.Buf32 = Array, d.assign(d, v));
    }, d.setTyped(h);
  })(zi)), zi;
}
var At = {}, Ge = {}, ut = {}, Bs;
function Ql() {
  if (Bs) return ut;
  Bs = 1;
  var d = ft(), h = 4, m = 0, u = 1, v = 2;
  function f(k) {
    for (var U = k.length; --U >= 0; )
      k[U] = 0;
  }
  var n = 0, l = 1, a = 2, o = 3, r = 258, e = 29, t = 256, i = t + 1 + e, s = 30, c = 19, y = 2 * i + 1, g = 15, _ = 16, w = 7, A = 256, E = 16, O = 17, D = 18, L = (
    /* extra bits for each length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
  ), P = (
    /* extra bits for each distance code */
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  ), K = (
    /* extra bits for each bit length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
  ), V = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], W = 512, H = new Array((i + 2) * 2);
  f(H);
  var re = new Array(s * 2);
  f(re);
  var ue = new Array(W);
  f(ue);
  var ce = new Array(r - o + 1);
  f(ce);
  var R = new Array(e);
  f(R);
  var I = new Array(s);
  f(I);
  function F(k, U, Y, ee, x) {
    this.static_tree = k, this.extra_bits = U, this.extra_base = Y, this.elems = ee, this.max_length = x, this.has_stree = k && k.length;
  }
  var Z, te, ie;
  function se(k, U) {
    this.dyn_tree = k, this.max_code = 0, this.stat_desc = U;
  }
  function he(k) {
    return k < 256 ? ue[k] : ue[256 + (k >>> 7)];
  }
  function _e(k, U) {
    k.pending_buf[k.pending++] = U & 255, k.pending_buf[k.pending++] = U >>> 8 & 255;
  }
  function me(k, U, Y) {
    k.bi_valid > _ - Y ? (k.bi_buf |= U << k.bi_valid & 65535, _e(k, k.bi_buf), k.bi_buf = U >> _ - k.bi_valid, k.bi_valid += Y - _) : (k.bi_buf |= U << k.bi_valid & 65535, k.bi_valid += Y);
  }
  function C(k, U, Y) {
    me(
      k,
      Y[U * 2],
      Y[U * 2 + 1]
      /*.Len*/
    );
  }
  function T(k, U) {
    var Y = 0;
    do
      Y |= k & 1, k >>>= 1, Y <<= 1;
    while (--U > 0);
    return Y >>> 1;
  }
  function $(k) {
    k.bi_valid === 16 ? (_e(k, k.bi_buf), k.bi_buf = 0, k.bi_valid = 0) : k.bi_valid >= 8 && (k.pending_buf[k.pending++] = k.bi_buf & 255, k.bi_buf >>= 8, k.bi_valid -= 8);
  }
  function J(k, U) {
    var Y = U.dyn_tree, ee = U.max_code, x = U.stat_desc.static_tree, j = U.stat_desc.has_stree, b = U.stat_desc.extra_bits, z = U.stat_desc.extra_base, le = U.stat_desc.max_length, p, q, B, S, N, M, ne = 0;
    for (S = 0; S <= g; S++)
      k.bl_count[S] = 0;
    for (Y[k.heap[k.heap_max] * 2 + 1] = 0, p = k.heap_max + 1; p < y; p++)
      q = k.heap[p], S = Y[Y[q * 2 + 1] * 2 + 1] + 1, S > le && (S = le, ne++), Y[q * 2 + 1] = S, !(q > ee) && (k.bl_count[S]++, N = 0, q >= z && (N = b[q - z]), M = Y[q * 2], k.opt_len += M * (S + N), j && (k.static_len += M * (x[q * 2 + 1] + N)));
    if (ne !== 0) {
      do {
        for (S = le - 1; k.bl_count[S] === 0; )
          S--;
        k.bl_count[S]--, k.bl_count[S + 1] += 2, k.bl_count[le]--, ne -= 2;
      } while (ne > 0);
      for (S = le; S !== 0; S--)
        for (q = k.bl_count[S]; q !== 0; )
          B = k.heap[--p], !(B > ee) && (Y[B * 2 + 1] !== S && (k.opt_len += (S - Y[B * 2 + 1]) * Y[B * 2], Y[B * 2 + 1] = S), q--);
    }
  }
  function fe(k, U, Y) {
    var ee = new Array(g + 1), x = 0, j, b;
    for (j = 1; j <= g; j++)
      ee[j] = x = x + Y[j - 1] << 1;
    for (b = 0; b <= U; b++) {
      var z = k[b * 2 + 1];
      z !== 0 && (k[b * 2] = T(ee[z]++, z));
    }
  }
  function G() {
    var k, U, Y, ee, x, j = new Array(g + 1);
    for (Y = 0, ee = 0; ee < e - 1; ee++)
      for (R[ee] = Y, k = 0; k < 1 << L[ee]; k++)
        ce[Y++] = ee;
    for (ce[Y - 1] = ee, x = 0, ee = 0; ee < 16; ee++)
      for (I[ee] = x, k = 0; k < 1 << P[ee]; k++)
        ue[x++] = ee;
    for (x >>= 7; ee < s; ee++)
      for (I[ee] = x << 7, k = 0; k < 1 << P[ee] - 7; k++)
        ue[256 + x++] = ee;
    for (U = 0; U <= g; U++)
      j[U] = 0;
    for (k = 0; k <= 143; )
      H[k * 2 + 1] = 8, k++, j[8]++;
    for (; k <= 255; )
      H[k * 2 + 1] = 9, k++, j[9]++;
    for (; k <= 279; )
      H[k * 2 + 1] = 7, k++, j[7]++;
    for (; k <= 287; )
      H[k * 2 + 1] = 8, k++, j[8]++;
    for (fe(H, i + 1, j), k = 0; k < s; k++)
      re[k * 2 + 1] = 5, re[k * 2] = T(k, 5);
    Z = new F(H, L, t + 1, i, g), te = new F(re, P, 0, s, g), ie = new F(new Array(0), K, 0, c, w);
  }
  function oe(k) {
    var U;
    for (U = 0; U < i; U++)
      k.dyn_ltree[U * 2] = 0;
    for (U = 0; U < s; U++)
      k.dyn_dtree[U * 2] = 0;
    for (U = 0; U < c; U++)
      k.bl_tree[U * 2] = 0;
    k.dyn_ltree[A * 2] = 1, k.opt_len = k.static_len = 0, k.last_lit = k.matches = 0;
  }
  function Ke(k) {
    k.bi_valid > 8 ? _e(k, k.bi_buf) : k.bi_valid > 0 && (k.pending_buf[k.pending++] = k.bi_buf), k.bi_buf = 0, k.bi_valid = 0;
  }
  function De(k, U, Y, ee) {
    Ke(k), _e(k, Y), _e(k, ~Y), d.arraySet(k.pending_buf, k.window, U, Y, k.pending), k.pending += Y;
  }
  function Le(k, U, Y, ee) {
    var x = U * 2, j = Y * 2;
    return k[x] < k[j] || k[x] === k[j] && ee[U] <= ee[Y];
  }
  function ke(k, U, Y) {
    for (var ee = k.heap[Y], x = Y << 1; x <= k.heap_len && (x < k.heap_len && Le(U, k.heap[x + 1], k.heap[x], k.depth) && x++, !Le(U, ee, k.heap[x], k.depth)); )
      k.heap[Y] = k.heap[x], Y = x, x <<= 1;
    k.heap[Y] = ee;
  }
  function de(k, U, Y) {
    var ee, x, j = 0, b, z;
    if (k.last_lit !== 0)
      do
        ee = k.pending_buf[k.d_buf + j * 2] << 8 | k.pending_buf[k.d_buf + j * 2 + 1], x = k.pending_buf[k.l_buf + j], j++, ee === 0 ? C(k, x, U) : (b = ce[x], C(k, b + t + 1, U), z = L[b], z !== 0 && (x -= R[b], me(k, x, z)), ee--, b = he(ee), C(k, b, Y), z = P[b], z !== 0 && (ee -= I[b], me(k, ee, z)));
      while (j < k.last_lit);
    C(k, A, U);
  }
  function Fe(k, U) {
    var Y = U.dyn_tree, ee = U.stat_desc.static_tree, x = U.stat_desc.has_stree, j = U.stat_desc.elems, b, z, le = -1, p;
    for (k.heap_len = 0, k.heap_max = y, b = 0; b < j; b++)
      Y[b * 2] !== 0 ? (k.heap[++k.heap_len] = le = b, k.depth[b] = 0) : Y[b * 2 + 1] = 0;
    for (; k.heap_len < 2; )
      p = k.heap[++k.heap_len] = le < 2 ? ++le : 0, Y[p * 2] = 1, k.depth[p] = 0, k.opt_len--, x && (k.static_len -= ee[p * 2 + 1]);
    for (U.max_code = le, b = k.heap_len >> 1; b >= 1; b--)
      ke(k, Y, b);
    p = j;
    do
      b = k.heap[
        1
        /*SMALLEST*/
      ], k.heap[
        1
        /*SMALLEST*/
      ] = k.heap[k.heap_len--], ke(
        k,
        Y,
        1
        /*SMALLEST*/
      ), z = k.heap[
        1
        /*SMALLEST*/
      ], k.heap[--k.heap_max] = b, k.heap[--k.heap_max] = z, Y[p * 2] = Y[b * 2] + Y[z * 2], k.depth[p] = (k.depth[b] >= k.depth[z] ? k.depth[b] : k.depth[z]) + 1, Y[b * 2 + 1] = Y[z * 2 + 1] = p, k.heap[
        1
        /*SMALLEST*/
      ] = p++, ke(
        k,
        Y,
        1
        /*SMALLEST*/
      );
    while (k.heap_len >= 2);
    k.heap[--k.heap_max] = k.heap[
      1
      /*SMALLEST*/
    ], J(k, U), fe(Y, le, k.bl_count);
  }
  function Qe(k, U, Y) {
    var ee, x = -1, j, b = U[1], z = 0, le = 7, p = 4;
    for (b === 0 && (le = 138, p = 3), U[(Y + 1) * 2 + 1] = 65535, ee = 0; ee <= Y; ee++)
      j = b, b = U[(ee + 1) * 2 + 1], !(++z < le && j === b) && (z < p ? k.bl_tree[j * 2] += z : j !== 0 ? (j !== x && k.bl_tree[j * 2]++, k.bl_tree[E * 2]++) : z <= 10 ? k.bl_tree[O * 2]++ : k.bl_tree[D * 2]++, z = 0, x = j, b === 0 ? (le = 138, p = 3) : j === b ? (le = 6, p = 3) : (le = 7, p = 4));
  }
  function We(k, U, Y) {
    var ee, x = -1, j, b = U[1], z = 0, le = 7, p = 4;
    for (b === 0 && (le = 138, p = 3), ee = 0; ee <= Y; ee++)
      if (j = b, b = U[(ee + 1) * 2 + 1], !(++z < le && j === b)) {
        if (z < p)
          do
            C(k, j, k.bl_tree);
          while (--z !== 0);
        else j !== 0 ? (j !== x && (C(k, j, k.bl_tree), z--), C(k, E, k.bl_tree), me(k, z - 3, 2)) : z <= 10 ? (C(k, O, k.bl_tree), me(k, z - 3, 3)) : (C(k, D, k.bl_tree), me(k, z - 11, 7));
        z = 0, x = j, b === 0 ? (le = 138, p = 3) : j === b ? (le = 6, p = 3) : (le = 7, p = 4);
      }
  }
  function Pe(k) {
    var U;
    for (Qe(k, k.dyn_ltree, k.l_desc.max_code), Qe(k, k.dyn_dtree, k.d_desc.max_code), Fe(k, k.bl_desc), U = c - 1; U >= 3 && k.bl_tree[V[U] * 2 + 1] === 0; U--)
      ;
    return k.opt_len += 3 * (U + 1) + 5 + 5 + 4, U;
  }
  function He(k, U, Y, ee) {
    var x;
    for (me(k, U - 257, 5), me(k, Y - 1, 5), me(k, ee - 4, 4), x = 0; x < ee; x++)
      me(k, k.bl_tree[V[x] * 2 + 1], 3);
    We(k, k.dyn_ltree, U - 1), We(k, k.dyn_dtree, Y - 1);
  }
  function je(k) {
    var U = 4093624447, Y;
    for (Y = 0; Y <= 31; Y++, U >>>= 1)
      if (U & 1 && k.dyn_ltree[Y * 2] !== 0)
        return m;
    if (k.dyn_ltree[18] !== 0 || k.dyn_ltree[20] !== 0 || k.dyn_ltree[26] !== 0)
      return u;
    for (Y = 32; Y < t; Y++)
      if (k.dyn_ltree[Y * 2] !== 0)
        return u;
    return m;
  }
  var Oe = !1;
  function vt(k) {
    Oe || (G(), Oe = !0), k.l_desc = new se(k.dyn_ltree, Z), k.d_desc = new se(k.dyn_dtree, te), k.bl_desc = new se(k.bl_tree, ie), k.bi_buf = 0, k.bi_valid = 0, oe(k);
  }
  function nt(k, U, Y, ee) {
    me(k, (n << 1) + (ee ? 1 : 0), 3), De(k, U, Y);
  }
  function Me(k) {
    me(k, l << 1, 3), C(k, A, H), $(k);
  }
  function et(k, U, Y, ee) {
    var x, j, b = 0;
    k.level > 0 ? (k.strm.data_type === v && (k.strm.data_type = je(k)), Fe(k, k.l_desc), Fe(k, k.d_desc), b = Pe(k), x = k.opt_len + 3 + 7 >>> 3, j = k.static_len + 3 + 7 >>> 3, j <= x && (x = j)) : x = j = Y + 5, Y + 4 <= x && U !== -1 ? nt(k, U, Y, ee) : k.strategy === h || j === x ? (me(k, (l << 1) + (ee ? 1 : 0), 3), de(k, H, re)) : (me(k, (a << 1) + (ee ? 1 : 0), 3), He(k, k.l_desc.max_code + 1, k.d_desc.max_code + 1, b + 1), de(k, k.dyn_ltree, k.dyn_dtree)), oe(k), ee && Ke(k);
  }
  function yt(k, U, Y) {
    return k.pending_buf[k.d_buf + k.last_lit * 2] = U >>> 8 & 255, k.pending_buf[k.d_buf + k.last_lit * 2 + 1] = U & 255, k.pending_buf[k.l_buf + k.last_lit] = Y & 255, k.last_lit++, U === 0 ? k.dyn_ltree[Y * 2]++ : (k.matches++, U--, k.dyn_ltree[(ce[Y] + t + 1) * 2]++, k.dyn_dtree[he(U) * 2]++), k.last_lit === k.lit_bufsize - 1;
  }
  return ut._tr_init = vt, ut._tr_stored_block = nt, ut._tr_flush_block = et, ut._tr_tally = yt, ut._tr_align = Me, ut;
}
var Ki, Fs;
function rl() {
  if (Fs) return Ki;
  Fs = 1;
  function d(h, m, u, v) {
    for (var f = h & 65535 | 0, n = h >>> 16 & 65535 | 0, l = 0; u !== 0; ) {
      l = u > 2e3 ? 2e3 : u, u -= l;
      do
        f = f + m[v++] | 0, n = n + f | 0;
      while (--l);
      f %= 65521, n %= 65521;
    }
    return f | n << 16 | 0;
  }
  return Ki = d, Ki;
}
var Wi, js;
function il() {
  if (js) return Wi;
  js = 1;
  function d() {
    for (var u, v = [], f = 0; f < 256; f++) {
      u = f;
      for (var n = 0; n < 8; n++)
        u = u & 1 ? 3988292384 ^ u >>> 1 : u >>> 1;
      v[f] = u;
    }
    return v;
  }
  var h = d();
  function m(u, v, f, n) {
    var l = h, a = n + f;
    u ^= -1;
    for (var o = n; o < a; o++)
      u = u >>> 8 ^ l[(u ^ v[o]) & 255];
    return u ^ -1;
  }
  return Wi = m, Wi;
}
var Hi, $s;
function xn() {
  return $s || ($s = 1, Hi = {
    2: "need dictionary",
    /* Z_NEED_DICT       2  */
    1: "stream end",
    /* Z_STREAM_END      1  */
    0: "",
    /* Z_OK              0  */
    "-1": "file error",
    /* Z_ERRNO         (-1) */
    "-2": "stream error",
    /* Z_STREAM_ERROR  (-2) */
    "-3": "data error",
    /* Z_DATA_ERROR    (-3) */
    "-4": "insufficient memory",
    /* Z_MEM_ERROR     (-4) */
    "-5": "buffer error",
    /* Z_BUF_ERROR     (-5) */
    "-6": "incompatible version"
    /* Z_VERSION_ERROR (-6) */
  }), Hi;
}
var Us;
function ef() {
  if (Us) return Ge;
  Us = 1;
  var d = ft(), h = Ql(), m = rl(), u = il(), v = xn(), f = 0, n = 1, l = 3, a = 4, o = 5, r = 0, e = 1, t = -2, i = -3, s = -5, c = -1, y = 1, g = 2, _ = 3, w = 4, A = 0, E = 2, O = 8, D = 9, L = 15, P = 8, K = 29, V = 256, W = V + 1 + K, H = 30, re = 19, ue = 2 * W + 1, ce = 15, R = 3, I = 258, F = I + R + 1, Z = 32, te = 42, ie = 69, se = 73, he = 91, _e = 103, me = 113, C = 666, T = 1, $ = 2, J = 3, fe = 4, G = 3;
  function oe(p, q) {
    return p.msg = v[q], q;
  }
  function Ke(p) {
    return (p << 1) - (p > 4 ? 9 : 0);
  }
  function De(p) {
    for (var q = p.length; --q >= 0; )
      p[q] = 0;
  }
  function Le(p) {
    var q = p.state, B = q.pending;
    B > p.avail_out && (B = p.avail_out), B !== 0 && (d.arraySet(p.output, q.pending_buf, q.pending_out, B, p.next_out), p.next_out += B, q.pending_out += B, p.total_out += B, p.avail_out -= B, q.pending -= B, q.pending === 0 && (q.pending_out = 0));
  }
  function ke(p, q) {
    h._tr_flush_block(p, p.block_start >= 0 ? p.block_start : -1, p.strstart - p.block_start, q), p.block_start = p.strstart, Le(p.strm);
  }
  function de(p, q) {
    p.pending_buf[p.pending++] = q;
  }
  function Fe(p, q) {
    p.pending_buf[p.pending++] = q >>> 8 & 255, p.pending_buf[p.pending++] = q & 255;
  }
  function Qe(p, q, B, S) {
    var N = p.avail_in;
    return N > S && (N = S), N === 0 ? 0 : (p.avail_in -= N, d.arraySet(q, p.input, p.next_in, N, B), p.state.wrap === 1 ? p.adler = m(p.adler, q, N, B) : p.state.wrap === 2 && (p.adler = u(p.adler, q, N, B)), p.next_in += N, p.total_in += N, N);
  }
  function We(p, q) {
    var B = p.max_chain_length, S = p.strstart, N, M, ne = p.prev_length, X = p.nice_match, Q = p.strstart > p.w_size - F ? p.strstart - (p.w_size - F) : 0, ge = p.window, rt = p.w_mask, Ae = p.prev, ve = p.strstart + I, Te = ge[S + ne - 1], qe = ge[S + ne];
    p.prev_length >= p.good_match && (B >>= 2), X > p.lookahead && (X = p.lookahead);
    do
      if (N = q, !(ge[N + ne] !== qe || ge[N + ne - 1] !== Te || ge[N] !== ge[S] || ge[++N] !== ge[S + 1])) {
        S += 2, N++;
        do
          ;
        while (ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && ge[++S] === ge[++N] && S < ve);
        if (M = I - (ve - S), S = ve - I, M > ne) {
          if (p.match_start = q, ne = M, M >= X)
            break;
          Te = ge[S + ne - 1], qe = ge[S + ne];
        }
      }
    while ((q = Ae[q & rt]) > Q && --B !== 0);
    return ne <= p.lookahead ? ne : p.lookahead;
  }
  function Pe(p) {
    var q = p.w_size, B, S, N, M, ne;
    do {
      if (M = p.window_size - p.lookahead - p.strstart, p.strstart >= q + (q - F)) {
        d.arraySet(p.window, p.window, q, q, 0), p.match_start -= q, p.strstart -= q, p.block_start -= q, S = p.hash_size, B = S;
        do
          N = p.head[--B], p.head[B] = N >= q ? N - q : 0;
        while (--S);
        S = q, B = S;
        do
          N = p.prev[--B], p.prev[B] = N >= q ? N - q : 0;
        while (--S);
        M += q;
      }
      if (p.strm.avail_in === 0)
        break;
      if (S = Qe(p.strm, p.window, p.strstart + p.lookahead, M), p.lookahead += S, p.lookahead + p.insert >= R)
        for (ne = p.strstart - p.insert, p.ins_h = p.window[ne], p.ins_h = (p.ins_h << p.hash_shift ^ p.window[ne + 1]) & p.hash_mask; p.insert && (p.ins_h = (p.ins_h << p.hash_shift ^ p.window[ne + R - 1]) & p.hash_mask, p.prev[ne & p.w_mask] = p.head[p.ins_h], p.head[p.ins_h] = ne, ne++, p.insert--, !(p.lookahead + p.insert < R)); )
          ;
    } while (p.lookahead < F && p.strm.avail_in !== 0);
  }
  function He(p, q) {
    var B = 65535;
    for (B > p.pending_buf_size - 5 && (B = p.pending_buf_size - 5); ; ) {
      if (p.lookahead <= 1) {
        if (Pe(p), p.lookahead === 0 && q === f)
          return T;
        if (p.lookahead === 0)
          break;
      }
      p.strstart += p.lookahead, p.lookahead = 0;
      var S = p.block_start + B;
      if ((p.strstart === 0 || p.strstart >= S) && (p.lookahead = p.strstart - S, p.strstart = S, ke(p, !1), p.strm.avail_out === 0) || p.strstart - p.block_start >= p.w_size - F && (ke(p, !1), p.strm.avail_out === 0))
        return T;
    }
    return p.insert = 0, q === a ? (ke(p, !0), p.strm.avail_out === 0 ? J : fe) : (p.strstart > p.block_start && (ke(p, !1), p.strm.avail_out === 0), T);
  }
  function je(p, q) {
    for (var B, S; ; ) {
      if (p.lookahead < F) {
        if (Pe(p), p.lookahead < F && q === f)
          return T;
        if (p.lookahead === 0)
          break;
      }
      if (B = 0, p.lookahead >= R && (p.ins_h = (p.ins_h << p.hash_shift ^ p.window[p.strstart + R - 1]) & p.hash_mask, B = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h], p.head[p.ins_h] = p.strstart), B !== 0 && p.strstart - B <= p.w_size - F && (p.match_length = We(p, B)), p.match_length >= R)
        if (S = h._tr_tally(p, p.strstart - p.match_start, p.match_length - R), p.lookahead -= p.match_length, p.match_length <= p.max_lazy_match && p.lookahead >= R) {
          p.match_length--;
          do
            p.strstart++, p.ins_h = (p.ins_h << p.hash_shift ^ p.window[p.strstart + R - 1]) & p.hash_mask, B = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h], p.head[p.ins_h] = p.strstart;
          while (--p.match_length !== 0);
          p.strstart++;
        } else
          p.strstart += p.match_length, p.match_length = 0, p.ins_h = p.window[p.strstart], p.ins_h = (p.ins_h << p.hash_shift ^ p.window[p.strstart + 1]) & p.hash_mask;
      else
        S = h._tr_tally(p, 0, p.window[p.strstart]), p.lookahead--, p.strstart++;
      if (S && (ke(p, !1), p.strm.avail_out === 0))
        return T;
    }
    return p.insert = p.strstart < R - 1 ? p.strstart : R - 1, q === a ? (ke(p, !0), p.strm.avail_out === 0 ? J : fe) : p.last_lit && (ke(p, !1), p.strm.avail_out === 0) ? T : $;
  }
  function Oe(p, q) {
    for (var B, S, N; ; ) {
      if (p.lookahead < F) {
        if (Pe(p), p.lookahead < F && q === f)
          return T;
        if (p.lookahead === 0)
          break;
      }
      if (B = 0, p.lookahead >= R && (p.ins_h = (p.ins_h << p.hash_shift ^ p.window[p.strstart + R - 1]) & p.hash_mask, B = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h], p.head[p.ins_h] = p.strstart), p.prev_length = p.match_length, p.prev_match = p.match_start, p.match_length = R - 1, B !== 0 && p.prev_length < p.max_lazy_match && p.strstart - B <= p.w_size - F && (p.match_length = We(p, B), p.match_length <= 5 && (p.strategy === y || p.match_length === R && p.strstart - p.match_start > 4096) && (p.match_length = R - 1)), p.prev_length >= R && p.match_length <= p.prev_length) {
        N = p.strstart + p.lookahead - R, S = h._tr_tally(p, p.strstart - 1 - p.prev_match, p.prev_length - R), p.lookahead -= p.prev_length - 1, p.prev_length -= 2;
        do
          ++p.strstart <= N && (p.ins_h = (p.ins_h << p.hash_shift ^ p.window[p.strstart + R - 1]) & p.hash_mask, B = p.prev[p.strstart & p.w_mask] = p.head[p.ins_h], p.head[p.ins_h] = p.strstart);
        while (--p.prev_length !== 0);
        if (p.match_available = 0, p.match_length = R - 1, p.strstart++, S && (ke(p, !1), p.strm.avail_out === 0))
          return T;
      } else if (p.match_available) {
        if (S = h._tr_tally(p, 0, p.window[p.strstart - 1]), S && ke(p, !1), p.strstart++, p.lookahead--, p.strm.avail_out === 0)
          return T;
      } else
        p.match_available = 1, p.strstart++, p.lookahead--;
    }
    return p.match_available && (S = h._tr_tally(p, 0, p.window[p.strstart - 1]), p.match_available = 0), p.insert = p.strstart < R - 1 ? p.strstart : R - 1, q === a ? (ke(p, !0), p.strm.avail_out === 0 ? J : fe) : p.last_lit && (ke(p, !1), p.strm.avail_out === 0) ? T : $;
  }
  function vt(p, q) {
    for (var B, S, N, M, ne = p.window; ; ) {
      if (p.lookahead <= I) {
        if (Pe(p), p.lookahead <= I && q === f)
          return T;
        if (p.lookahead === 0)
          break;
      }
      if (p.match_length = 0, p.lookahead >= R && p.strstart > 0 && (N = p.strstart - 1, S = ne[N], S === ne[++N] && S === ne[++N] && S === ne[++N])) {
        M = p.strstart + I;
        do
          ;
        while (S === ne[++N] && S === ne[++N] && S === ne[++N] && S === ne[++N] && S === ne[++N] && S === ne[++N] && S === ne[++N] && S === ne[++N] && N < M);
        p.match_length = I - (M - N), p.match_length > p.lookahead && (p.match_length = p.lookahead);
      }
      if (p.match_length >= R ? (B = h._tr_tally(p, 1, p.match_length - R), p.lookahead -= p.match_length, p.strstart += p.match_length, p.match_length = 0) : (B = h._tr_tally(p, 0, p.window[p.strstart]), p.lookahead--, p.strstart++), B && (ke(p, !1), p.strm.avail_out === 0))
        return T;
    }
    return p.insert = 0, q === a ? (ke(p, !0), p.strm.avail_out === 0 ? J : fe) : p.last_lit && (ke(p, !1), p.strm.avail_out === 0) ? T : $;
  }
  function nt(p, q) {
    for (var B; ; ) {
      if (p.lookahead === 0 && (Pe(p), p.lookahead === 0)) {
        if (q === f)
          return T;
        break;
      }
      if (p.match_length = 0, B = h._tr_tally(p, 0, p.window[p.strstart]), p.lookahead--, p.strstart++, B && (ke(p, !1), p.strm.avail_out === 0))
        return T;
    }
    return p.insert = 0, q === a ? (ke(p, !0), p.strm.avail_out === 0 ? J : fe) : p.last_lit && (ke(p, !1), p.strm.avail_out === 0) ? T : $;
  }
  function Me(p, q, B, S, N) {
    this.good_length = p, this.max_lazy = q, this.nice_length = B, this.max_chain = S, this.func = N;
  }
  var et;
  et = [
    /*      good lazy nice chain */
    new Me(0, 0, 0, 0, He),
    /* 0 store only */
    new Me(4, 4, 8, 4, je),
    /* 1 max speed, no lazy matches */
    new Me(4, 5, 16, 8, je),
    /* 2 */
    new Me(4, 6, 32, 32, je),
    /* 3 */
    new Me(4, 4, 16, 16, Oe),
    /* 4 lazy matches */
    new Me(8, 16, 32, 32, Oe),
    /* 5 */
    new Me(8, 16, 128, 128, Oe),
    /* 6 */
    new Me(8, 32, 128, 256, Oe),
    /* 7 */
    new Me(32, 128, 258, 1024, Oe),
    /* 8 */
    new Me(32, 258, 258, 4096, Oe)
    /* 9 max compression */
  ];
  function yt(p) {
    p.window_size = 2 * p.w_size, De(p.head), p.max_lazy_match = et[p.level].max_lazy, p.good_match = et[p.level].good_length, p.nice_match = et[p.level].nice_length, p.max_chain_length = et[p.level].max_chain, p.strstart = 0, p.block_start = 0, p.lookahead = 0, p.insert = 0, p.match_length = p.prev_length = R - 1, p.match_available = 0, p.ins_h = 0;
  }
  function k() {
    this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = O, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new d.Buf16(ue * 2), this.dyn_dtree = new d.Buf16((2 * H + 1) * 2), this.bl_tree = new d.Buf16((2 * re + 1) * 2), De(this.dyn_ltree), De(this.dyn_dtree), De(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new d.Buf16(ce + 1), this.heap = new d.Buf16(2 * W + 1), De(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new d.Buf16(2 * W + 1), De(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
  }
  function U(p) {
    var q;
    return !p || !p.state ? oe(p, t) : (p.total_in = p.total_out = 0, p.data_type = E, q = p.state, q.pending = 0, q.pending_out = 0, q.wrap < 0 && (q.wrap = -q.wrap), q.status = q.wrap ? te : me, p.adler = q.wrap === 2 ? 0 : 1, q.last_flush = f, h._tr_init(q), r);
  }
  function Y(p) {
    var q = U(p);
    return q === r && yt(p.state), q;
  }
  function ee(p, q) {
    return !p || !p.state || p.state.wrap !== 2 ? t : (p.state.gzhead = q, r);
  }
  function x(p, q, B, S, N, M) {
    if (!p)
      return t;
    var ne = 1;
    if (q === c && (q = 6), S < 0 ? (ne = 0, S = -S) : S > 15 && (ne = 2, S -= 16), N < 1 || N > D || B !== O || S < 8 || S > 15 || q < 0 || q > 9 || M < 0 || M > w)
      return oe(p, t);
    S === 8 && (S = 9);
    var X = new k();
    return p.state = X, X.strm = p, X.wrap = ne, X.gzhead = null, X.w_bits = S, X.w_size = 1 << X.w_bits, X.w_mask = X.w_size - 1, X.hash_bits = N + 7, X.hash_size = 1 << X.hash_bits, X.hash_mask = X.hash_size - 1, X.hash_shift = ~~((X.hash_bits + R - 1) / R), X.window = new d.Buf8(X.w_size * 2), X.head = new d.Buf16(X.hash_size), X.prev = new d.Buf16(X.w_size), X.lit_bufsize = 1 << N + 6, X.pending_buf_size = X.lit_bufsize * 4, X.pending_buf = new d.Buf8(X.pending_buf_size), X.d_buf = 1 * X.lit_bufsize, X.l_buf = 3 * X.lit_bufsize, X.level = q, X.strategy = M, X.method = B, Y(p);
  }
  function j(p, q) {
    return x(p, q, O, L, P, A);
  }
  function b(p, q) {
    var B, S, N, M;
    if (!p || !p.state || q > o || q < 0)
      return p ? oe(p, t) : t;
    if (S = p.state, !p.output || !p.input && p.avail_in !== 0 || S.status === C && q !== a)
      return oe(p, p.avail_out === 0 ? s : t);
    if (S.strm = p, B = S.last_flush, S.last_flush = q, S.status === te)
      if (S.wrap === 2)
        p.adler = 0, de(S, 31), de(S, 139), de(S, 8), S.gzhead ? (de(
          S,
          (S.gzhead.text ? 1 : 0) + (S.gzhead.hcrc ? 2 : 0) + (S.gzhead.extra ? 4 : 0) + (S.gzhead.name ? 8 : 0) + (S.gzhead.comment ? 16 : 0)
        ), de(S, S.gzhead.time & 255), de(S, S.gzhead.time >> 8 & 255), de(S, S.gzhead.time >> 16 & 255), de(S, S.gzhead.time >> 24 & 255), de(S, S.level === 9 ? 2 : S.strategy >= g || S.level < 2 ? 4 : 0), de(S, S.gzhead.os & 255), S.gzhead.extra && S.gzhead.extra.length && (de(S, S.gzhead.extra.length & 255), de(S, S.gzhead.extra.length >> 8 & 255)), S.gzhead.hcrc && (p.adler = u(p.adler, S.pending_buf, S.pending, 0)), S.gzindex = 0, S.status = ie) : (de(S, 0), de(S, 0), de(S, 0), de(S, 0), de(S, 0), de(S, S.level === 9 ? 2 : S.strategy >= g || S.level < 2 ? 4 : 0), de(S, G), S.status = me);
      else {
        var ne = O + (S.w_bits - 8 << 4) << 8, X = -1;
        S.strategy >= g || S.level < 2 ? X = 0 : S.level < 6 ? X = 1 : S.level === 6 ? X = 2 : X = 3, ne |= X << 6, S.strstart !== 0 && (ne |= Z), ne += 31 - ne % 31, S.status = me, Fe(S, ne), S.strstart !== 0 && (Fe(S, p.adler >>> 16), Fe(S, p.adler & 65535)), p.adler = 1;
      }
    if (S.status === ie)
      if (S.gzhead.extra) {
        for (N = S.pending; S.gzindex < (S.gzhead.extra.length & 65535) && !(S.pending === S.pending_buf_size && (S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), Le(p), N = S.pending, S.pending === S.pending_buf_size)); )
          de(S, S.gzhead.extra[S.gzindex] & 255), S.gzindex++;
        S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), S.gzindex === S.gzhead.extra.length && (S.gzindex = 0, S.status = se);
      } else
        S.status = se;
    if (S.status === se)
      if (S.gzhead.name) {
        N = S.pending;
        do {
          if (S.pending === S.pending_buf_size && (S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), Le(p), N = S.pending, S.pending === S.pending_buf_size)) {
            M = 1;
            break;
          }
          S.gzindex < S.gzhead.name.length ? M = S.gzhead.name.charCodeAt(S.gzindex++) & 255 : M = 0, de(S, M);
        } while (M !== 0);
        S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), M === 0 && (S.gzindex = 0, S.status = he);
      } else
        S.status = he;
    if (S.status === he)
      if (S.gzhead.comment) {
        N = S.pending;
        do {
          if (S.pending === S.pending_buf_size && (S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), Le(p), N = S.pending, S.pending === S.pending_buf_size)) {
            M = 1;
            break;
          }
          S.gzindex < S.gzhead.comment.length ? M = S.gzhead.comment.charCodeAt(S.gzindex++) & 255 : M = 0, de(S, M);
        } while (M !== 0);
        S.gzhead.hcrc && S.pending > N && (p.adler = u(p.adler, S.pending_buf, S.pending - N, N)), M === 0 && (S.status = _e);
      } else
        S.status = _e;
    if (S.status === _e && (S.gzhead.hcrc ? (S.pending + 2 > S.pending_buf_size && Le(p), S.pending + 2 <= S.pending_buf_size && (de(S, p.adler & 255), de(S, p.adler >> 8 & 255), p.adler = 0, S.status = me)) : S.status = me), S.pending !== 0) {
      if (Le(p), p.avail_out === 0)
        return S.last_flush = -1, r;
    } else if (p.avail_in === 0 && Ke(q) <= Ke(B) && q !== a)
      return oe(p, s);
    if (S.status === C && p.avail_in !== 0)
      return oe(p, s);
    if (p.avail_in !== 0 || S.lookahead !== 0 || q !== f && S.status !== C) {
      var Q = S.strategy === g ? nt(S, q) : S.strategy === _ ? vt(S, q) : et[S.level].func(S, q);
      if ((Q === J || Q === fe) && (S.status = C), Q === T || Q === J)
        return p.avail_out === 0 && (S.last_flush = -1), r;
      if (Q === $ && (q === n ? h._tr_align(S) : q !== o && (h._tr_stored_block(S, 0, 0, !1), q === l && (De(S.head), S.lookahead === 0 && (S.strstart = 0, S.block_start = 0, S.insert = 0))), Le(p), p.avail_out === 0))
        return S.last_flush = -1, r;
    }
    return q !== a ? r : S.wrap <= 0 ? e : (S.wrap === 2 ? (de(S, p.adler & 255), de(S, p.adler >> 8 & 255), de(S, p.adler >> 16 & 255), de(S, p.adler >> 24 & 255), de(S, p.total_in & 255), de(S, p.total_in >> 8 & 255), de(S, p.total_in >> 16 & 255), de(S, p.total_in >> 24 & 255)) : (Fe(S, p.adler >>> 16), Fe(S, p.adler & 65535)), Le(p), S.wrap > 0 && (S.wrap = -S.wrap), S.pending !== 0 ? r : e);
  }
  function z(p) {
    var q;
    return !p || !p.state ? t : (q = p.state.status, q !== te && q !== ie && q !== se && q !== he && q !== _e && q !== me && q !== C ? oe(p, t) : (p.state = null, q === me ? oe(p, i) : r));
  }
  function le(p, q) {
    var B = q.length, S, N, M, ne, X, Q, ge, rt;
    if (!p || !p.state || (S = p.state, ne = S.wrap, ne === 2 || ne === 1 && S.status !== te || S.lookahead))
      return t;
    for (ne === 1 && (p.adler = m(p.adler, q, B, 0)), S.wrap = 0, B >= S.w_size && (ne === 0 && (De(S.head), S.strstart = 0, S.block_start = 0, S.insert = 0), rt = new d.Buf8(S.w_size), d.arraySet(rt, q, B - S.w_size, S.w_size, 0), q = rt, B = S.w_size), X = p.avail_in, Q = p.next_in, ge = p.input, p.avail_in = B, p.next_in = 0, p.input = q, Pe(S); S.lookahead >= R; ) {
      N = S.strstart, M = S.lookahead - (R - 1);
      do
        S.ins_h = (S.ins_h << S.hash_shift ^ S.window[N + R - 1]) & S.hash_mask, S.prev[N & S.w_mask] = S.head[S.ins_h], S.head[S.ins_h] = N, N++;
      while (--M);
      S.strstart = N, S.lookahead = R - 1, Pe(S);
    }
    return S.strstart += S.lookahead, S.block_start = S.strstart, S.insert = S.lookahead, S.lookahead = 0, S.match_length = S.prev_length = R - 1, S.match_available = 0, p.next_in = Q, p.input = ge, p.avail_in = X, S.wrap = ne, r;
  }
  return Ge.deflateInit = j, Ge.deflateInit2 = x, Ge.deflateReset = Y, Ge.deflateResetKeep = U, Ge.deflateSetHeader = ee, Ge.deflate = b, Ge.deflateEnd = z, Ge.deflateSetDictionary = le, Ge.deflateInfo = "pako deflate (from Nodeca project)", Ge;
}
var ct = {}, zs;
function nl() {
  if (zs) return ct;
  zs = 1;
  var d = ft(), h = !0, m = !0;
  try {
    String.fromCharCode.apply(null, [0]);
  } catch {
    h = !1;
  }
  try {
    String.fromCharCode.apply(null, new Uint8Array(1));
  } catch {
    m = !1;
  }
  for (var u = new d.Buf8(256), v = 0; v < 256; v++)
    u[v] = v >= 252 ? 6 : v >= 248 ? 5 : v >= 240 ? 4 : v >= 224 ? 3 : v >= 192 ? 2 : 1;
  u[254] = u[254] = 1, ct.string2buf = function(n) {
    var l, a, o, r, e, t = n.length, i = 0;
    for (r = 0; r < t; r++)
      a = n.charCodeAt(r), (a & 64512) === 55296 && r + 1 < t && (o = n.charCodeAt(r + 1), (o & 64512) === 56320 && (a = 65536 + (a - 55296 << 10) + (o - 56320), r++)), i += a < 128 ? 1 : a < 2048 ? 2 : a < 65536 ? 3 : 4;
    for (l = new d.Buf8(i), e = 0, r = 0; e < i; r++)
      a = n.charCodeAt(r), (a & 64512) === 55296 && r + 1 < t && (o = n.charCodeAt(r + 1), (o & 64512) === 56320 && (a = 65536 + (a - 55296 << 10) + (o - 56320), r++)), a < 128 ? l[e++] = a : a < 2048 ? (l[e++] = 192 | a >>> 6, l[e++] = 128 | a & 63) : a < 65536 ? (l[e++] = 224 | a >>> 12, l[e++] = 128 | a >>> 6 & 63, l[e++] = 128 | a & 63) : (l[e++] = 240 | a >>> 18, l[e++] = 128 | a >>> 12 & 63, l[e++] = 128 | a >>> 6 & 63, l[e++] = 128 | a & 63);
    return l;
  };
  function f(n, l) {
    if (l < 65534 && (n.subarray && m || !n.subarray && h))
      return String.fromCharCode.apply(null, d.shrinkBuf(n, l));
    for (var a = "", o = 0; o < l; o++)
      a += String.fromCharCode(n[o]);
    return a;
  }
  return ct.buf2binstring = function(n) {
    return f(n, n.length);
  }, ct.binstring2buf = function(n) {
    for (var l = new d.Buf8(n.length), a = 0, o = l.length; a < o; a++)
      l[a] = n.charCodeAt(a);
    return l;
  }, ct.buf2string = function(n, l) {
    var a, o, r, e, t = l || n.length, i = new Array(t * 2);
    for (o = 0, a = 0; a < t; ) {
      if (r = n[a++], r < 128) {
        i[o++] = r;
        continue;
      }
      if (e = u[r], e > 4) {
        i[o++] = 65533, a += e - 1;
        continue;
      }
      for (r &= e === 2 ? 31 : e === 3 ? 15 : 7; e > 1 && a < t; )
        r = r << 6 | n[a++] & 63, e--;
      if (e > 1) {
        i[o++] = 65533;
        continue;
      }
      r < 65536 ? i[o++] = r : (r -= 65536, i[o++] = 55296 | r >> 10 & 1023, i[o++] = 56320 | r & 1023);
    }
    return f(i, o);
  }, ct.utf8border = function(n, l) {
    var a;
    for (l = l || n.length, l > n.length && (l = n.length), a = l - 1; a >= 0 && (n[a] & 192) === 128; )
      a--;
    return a < 0 || a === 0 ? l : a + u[n[a]] > l ? a : l;
  }, ct;
}
var Yi, Ks;
function al() {
  if (Ks) return Yi;
  Ks = 1;
  function d() {
    this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
  }
  return Yi = d, Yi;
}
var Ws;
function tf() {
  if (Ws) return At;
  Ws = 1;
  var d = ef(), h = ft(), m = nl(), u = xn(), v = al(), f = Object.prototype.toString, n = 0, l = 4, a = 0, o = 1, r = 2, e = -1, t = 0, i = 8;
  function s(_) {
    if (!(this instanceof s)) return new s(_);
    this.options = h.assign({
      level: e,
      method: i,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: t,
      to: ""
    }, _ || {});
    var w = this.options;
    w.raw && w.windowBits > 0 ? w.windowBits = -w.windowBits : w.gzip && w.windowBits > 0 && w.windowBits < 16 && (w.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new v(), this.strm.avail_out = 0;
    var A = d.deflateInit2(
      this.strm,
      w.level,
      w.method,
      w.windowBits,
      w.memLevel,
      w.strategy
    );
    if (A !== a)
      throw new Error(u[A]);
    if (w.header && d.deflateSetHeader(this.strm, w.header), w.dictionary) {
      var E;
      if (typeof w.dictionary == "string" ? E = m.string2buf(w.dictionary) : f.call(w.dictionary) === "[object ArrayBuffer]" ? E = new Uint8Array(w.dictionary) : E = w.dictionary, A = d.deflateSetDictionary(this.strm, E), A !== a)
        throw new Error(u[A]);
      this._dict_set = !0;
    }
  }
  s.prototype.push = function(_, w) {
    var A = this.strm, E = this.options.chunkSize, O, D;
    if (this.ended)
      return !1;
    D = w === ~~w ? w : w === !0 ? l : n, typeof _ == "string" ? A.input = m.string2buf(_) : f.call(_) === "[object ArrayBuffer]" ? A.input = new Uint8Array(_) : A.input = _, A.next_in = 0, A.avail_in = A.input.length;
    do {
      if (A.avail_out === 0 && (A.output = new h.Buf8(E), A.next_out = 0, A.avail_out = E), O = d.deflate(A, D), O !== o && O !== a)
        return this.onEnd(O), this.ended = !0, !1;
      (A.avail_out === 0 || A.avail_in === 0 && (D === l || D === r)) && (this.options.to === "string" ? this.onData(m.buf2binstring(h.shrinkBuf(A.output, A.next_out))) : this.onData(h.shrinkBuf(A.output, A.next_out)));
    } while ((A.avail_in > 0 || A.avail_out === 0) && O !== o);
    return D === l ? (O = d.deflateEnd(this.strm), this.onEnd(O), this.ended = !0, O === a) : (D === r && (this.onEnd(a), A.avail_out = 0), !0);
  }, s.prototype.onData = function(_) {
    this.chunks.push(_);
  }, s.prototype.onEnd = function(_) {
    _ === a && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = h.flattenChunks(this.chunks)), this.chunks = [], this.err = _, this.msg = this.strm.msg;
  };
  function c(_, w) {
    var A = new s(w);
    if (A.push(_, !0), A.err)
      throw A.msg || u[A.err];
    return A.result;
  }
  function y(_, w) {
    return w = w || {}, w.raw = !0, c(_, w);
  }
  function g(_, w) {
    return w = w || {}, w.gzip = !0, c(_, w);
  }
  return At.Deflate = s, At.deflate = c, At.deflateRaw = y, At.gzip = g, At;
}
var Et = {}, Je = {}, Zi, Hs;
function rf() {
  if (Hs) return Zi;
  Hs = 1;
  var d = 30, h = 12;
  return Zi = function(u, v) {
    var f, n, l, a, o, r, e, t, i, s, c, y, g, _, w, A, E, O, D, L, P, K, V, W, H;
    f = u.state, n = u.next_in, W = u.input, l = n + (u.avail_in - 5), a = u.next_out, H = u.output, o = a - (v - u.avail_out), r = a + (u.avail_out - 257), e = f.dmax, t = f.wsize, i = f.whave, s = f.wnext, c = f.window, y = f.hold, g = f.bits, _ = f.lencode, w = f.distcode, A = (1 << f.lenbits) - 1, E = (1 << f.distbits) - 1;
    e:
      do {
        g < 15 && (y += W[n++] << g, g += 8, y += W[n++] << g, g += 8), O = _[y & A];
        t:
          for (; ; ) {
            if (D = O >>> 24, y >>>= D, g -= D, D = O >>> 16 & 255, D === 0)
              H[a++] = O & 65535;
            else if (D & 16) {
              L = O & 65535, D &= 15, D && (g < D && (y += W[n++] << g, g += 8), L += y & (1 << D) - 1, y >>>= D, g -= D), g < 15 && (y += W[n++] << g, g += 8, y += W[n++] << g, g += 8), O = w[y & E];
              r:
                for (; ; ) {
                  if (D = O >>> 24, y >>>= D, g -= D, D = O >>> 16 & 255, D & 16) {
                    if (P = O & 65535, D &= 15, g < D && (y += W[n++] << g, g += 8, g < D && (y += W[n++] << g, g += 8)), P += y & (1 << D) - 1, P > e) {
                      u.msg = "invalid distance too far back", f.mode = d;
                      break e;
                    }
                    if (y >>>= D, g -= D, D = a - o, P > D) {
                      if (D = P - D, D > i && f.sane) {
                        u.msg = "invalid distance too far back", f.mode = d;
                        break e;
                      }
                      if (K = 0, V = c, s === 0) {
                        if (K += t - D, D < L) {
                          L -= D;
                          do
                            H[a++] = c[K++];
                          while (--D);
                          K = a - P, V = H;
                        }
                      } else if (s < D) {
                        if (K += t + s - D, D -= s, D < L) {
                          L -= D;
                          do
                            H[a++] = c[K++];
                          while (--D);
                          if (K = 0, s < L) {
                            D = s, L -= D;
                            do
                              H[a++] = c[K++];
                            while (--D);
                            K = a - P, V = H;
                          }
                        }
                      } else if (K += s - D, D < L) {
                        L -= D;
                        do
                          H[a++] = c[K++];
                        while (--D);
                        K = a - P, V = H;
                      }
                      for (; L > 2; )
                        H[a++] = V[K++], H[a++] = V[K++], H[a++] = V[K++], L -= 3;
                      L && (H[a++] = V[K++], L > 1 && (H[a++] = V[K++]));
                    } else {
                      K = a - P;
                      do
                        H[a++] = H[K++], H[a++] = H[K++], H[a++] = H[K++], L -= 3;
                      while (L > 2);
                      L && (H[a++] = H[K++], L > 1 && (H[a++] = H[K++]));
                    }
                  } else if ((D & 64) === 0) {
                    O = w[(O & 65535) + (y & (1 << D) - 1)];
                    continue r;
                  } else {
                    u.msg = "invalid distance code", f.mode = d;
                    break e;
                  }
                  break;
                }
            } else if ((D & 64) === 0) {
              O = _[(O & 65535) + (y & (1 << D) - 1)];
              continue t;
            } else if (D & 32) {
              f.mode = h;
              break e;
            } else {
              u.msg = "invalid literal/length code", f.mode = d;
              break e;
            }
            break;
          }
      } while (n < l && a < r);
    L = g >> 3, n -= L, g -= L << 3, y &= (1 << g) - 1, u.next_in = n, u.next_out = a, u.avail_in = n < l ? 5 + (l - n) : 5 - (n - l), u.avail_out = a < r ? 257 + (r - a) : 257 - (a - r), f.hold = y, f.bits = g;
  }, Zi;
}
var Ji, Ys;
function nf() {
  if (Ys) return Ji;
  Ys = 1;
  var d = ft(), h = 15, m = 852, u = 592, v = 0, f = 1, n = 2, l = [
    /* Length codes 257..285 base */
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    13,
    15,
    17,
    19,
    23,
    27,
    31,
    35,
    43,
    51,
    59,
    67,
    83,
    99,
    115,
    131,
    163,
    195,
    227,
    258,
    0,
    0
  ], a = [
    /* Length codes 257..285 extra */
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    16,
    72,
    78
  ], o = [
    /* Distance codes 0..29 base */
    1,
    2,
    3,
    4,
    5,
    7,
    9,
    13,
    17,
    25,
    33,
    49,
    65,
    97,
    129,
    193,
    257,
    385,
    513,
    769,
    1025,
    1537,
    2049,
    3073,
    4097,
    6145,
    8193,
    12289,
    16385,
    24577,
    0,
    0
  ], r = [
    /* Distance codes 0..29 extra */
    16,
    16,
    16,
    16,
    17,
    17,
    18,
    18,
    19,
    19,
    20,
    20,
    21,
    21,
    22,
    22,
    23,
    23,
    24,
    24,
    25,
    25,
    26,
    26,
    27,
    27,
    28,
    28,
    29,
    29,
    64,
    64
  ];
  return Ji = function(t, i, s, c, y, g, _, w) {
    var A = w.bits, E = 0, O = 0, D = 0, L = 0, P = 0, K = 0, V = 0, W = 0, H = 0, re = 0, ue, ce, R, I, F, Z = null, te = 0, ie, se = new d.Buf16(h + 1), he = new d.Buf16(h + 1), _e = null, me = 0, C, T, $;
    for (E = 0; E <= h; E++)
      se[E] = 0;
    for (O = 0; O < c; O++)
      se[i[s + O]]++;
    for (P = A, L = h; L >= 1 && se[L] === 0; L--)
      ;
    if (P > L && (P = L), L === 0)
      return y[g++] = 1 << 24 | 64 << 16 | 0, y[g++] = 1 << 24 | 64 << 16 | 0, w.bits = 1, 0;
    for (D = 1; D < L && se[D] === 0; D++)
      ;
    for (P < D && (P = D), W = 1, E = 1; E <= h; E++)
      if (W <<= 1, W -= se[E], W < 0)
        return -1;
    if (W > 0 && (t === v || L !== 1))
      return -1;
    for (he[1] = 0, E = 1; E < h; E++)
      he[E + 1] = he[E] + se[E];
    for (O = 0; O < c; O++)
      i[s + O] !== 0 && (_[he[i[s + O]]++] = O);
    if (t === v ? (Z = _e = _, ie = 19) : t === f ? (Z = l, te -= 257, _e = a, me -= 257, ie = 256) : (Z = o, _e = r, ie = -1), re = 0, O = 0, E = D, F = g, K = P, V = 0, R = -1, H = 1 << P, I = H - 1, t === f && H > m || t === n && H > u)
      return 1;
    for (; ; ) {
      C = E - V, _[O] < ie ? (T = 0, $ = _[O]) : _[O] > ie ? (T = _e[me + _[O]], $ = Z[te + _[O]]) : (T = 96, $ = 0), ue = 1 << E - V, ce = 1 << K, D = ce;
      do
        ce -= ue, y[F + (re >> V) + ce] = C << 24 | T << 16 | $ | 0;
      while (ce !== 0);
      for (ue = 1 << E - 1; re & ue; )
        ue >>= 1;
      if (ue !== 0 ? (re &= ue - 1, re += ue) : re = 0, O++, --se[E] === 0) {
        if (E === L)
          break;
        E = i[s + _[O]];
      }
      if (E > P && (re & I) !== R) {
        for (V === 0 && (V = P), F += D, K = E - V, W = 1 << K; K + V < L && (W -= se[K + V], !(W <= 0)); )
          K++, W <<= 1;
        if (H += 1 << K, t === f && H > m || t === n && H > u)
          return 1;
        R = re & I, y[R] = P << 24 | K << 16 | F - g | 0;
      }
    }
    return re !== 0 && (y[F + re] = E - V << 24 | 64 << 16 | 0), w.bits = P, 0;
  }, Ji;
}
var Zs;
function af() {
  if (Zs) return Je;
  Zs = 1;
  var d = ft(), h = rl(), m = il(), u = rf(), v = nf(), f = 0, n = 1, l = 2, a = 4, o = 5, r = 6, e = 0, t = 1, i = 2, s = -2, c = -3, y = -4, g = -5, _ = 8, w = 1, A = 2, E = 3, O = 4, D = 5, L = 6, P = 7, K = 8, V = 9, W = 10, H = 11, re = 12, ue = 13, ce = 14, R = 15, I = 16, F = 17, Z = 18, te = 19, ie = 20, se = 21, he = 22, _e = 23, me = 24, C = 25, T = 26, $ = 27, J = 28, fe = 29, G = 30, oe = 31, Ke = 32, De = 852, Le = 592, ke = 15, de = ke;
  function Fe(x) {
    return (x >>> 24 & 255) + (x >>> 8 & 65280) + ((x & 65280) << 8) + ((x & 255) << 24);
  }
  function Qe() {
    this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new d.Buf16(320), this.work = new d.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
  }
  function We(x) {
    var j;
    return !x || !x.state ? s : (j = x.state, x.total_in = x.total_out = j.total = 0, x.msg = "", j.wrap && (x.adler = j.wrap & 1), j.mode = w, j.last = 0, j.havedict = 0, j.dmax = 32768, j.head = null, j.hold = 0, j.bits = 0, j.lencode = j.lendyn = new d.Buf32(De), j.distcode = j.distdyn = new d.Buf32(Le), j.sane = 1, j.back = -1, e);
  }
  function Pe(x) {
    var j;
    return !x || !x.state ? s : (j = x.state, j.wsize = 0, j.whave = 0, j.wnext = 0, We(x));
  }
  function He(x, j) {
    var b, z;
    return !x || !x.state || (z = x.state, j < 0 ? (b = 0, j = -j) : (b = (j >> 4) + 1, j < 48 && (j &= 15)), j && (j < 8 || j > 15)) ? s : (z.window !== null && z.wbits !== j && (z.window = null), z.wrap = b, z.wbits = j, Pe(x));
  }
  function je(x, j) {
    var b, z;
    return x ? (z = new Qe(), x.state = z, z.window = null, b = He(x, j), b !== e && (x.state = null), b) : s;
  }
  function Oe(x) {
    return je(x, de);
  }
  var vt = !0, nt, Me;
  function et(x) {
    if (vt) {
      var j;
      for (nt = new d.Buf32(512), Me = new d.Buf32(32), j = 0; j < 144; )
        x.lens[j++] = 8;
      for (; j < 256; )
        x.lens[j++] = 9;
      for (; j < 280; )
        x.lens[j++] = 7;
      for (; j < 288; )
        x.lens[j++] = 8;
      for (v(n, x.lens, 0, 288, nt, 0, x.work, { bits: 9 }), j = 0; j < 32; )
        x.lens[j++] = 5;
      v(l, x.lens, 0, 32, Me, 0, x.work, { bits: 5 }), vt = !1;
    }
    x.lencode = nt, x.lenbits = 9, x.distcode = Me, x.distbits = 5;
  }
  function yt(x, j, b, z) {
    var le, p = x.state;
    return p.window === null && (p.wsize = 1 << p.wbits, p.wnext = 0, p.whave = 0, p.window = new d.Buf8(p.wsize)), z >= p.wsize ? (d.arraySet(p.window, j, b - p.wsize, p.wsize, 0), p.wnext = 0, p.whave = p.wsize) : (le = p.wsize - p.wnext, le > z && (le = z), d.arraySet(p.window, j, b - z, le, p.wnext), z -= le, z ? (d.arraySet(p.window, j, b - z, z, 0), p.wnext = z, p.whave = p.wsize) : (p.wnext += le, p.wnext === p.wsize && (p.wnext = 0), p.whave < p.wsize && (p.whave += le))), 0;
  }
  function k(x, j) {
    var b, z, le, p, q, B, S, N, M, ne, X, Q, ge, rt, Ae = 0, ve, Te, qe, Ue, Wt, Ht, Ce, Ye, xe = new d.Buf8(4), it, tt, Ln = (
      /* permutation of code lengths */
      [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
    );
    if (!x || !x.state || !x.output || !x.input && x.avail_in !== 0)
      return s;
    b = x.state, b.mode === re && (b.mode = ue), q = x.next_out, le = x.output, S = x.avail_out, p = x.next_in, z = x.input, B = x.avail_in, N = b.hold, M = b.bits, ne = B, X = S, Ye = e;
    e:
      for (; ; )
        switch (b.mode) {
          case w:
            if (b.wrap === 0) {
              b.mode = ue;
              break;
            }
            for (; M < 16; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if (b.wrap & 2 && N === 35615) {
              b.check = 0, xe[0] = N & 255, xe[1] = N >>> 8 & 255, b.check = m(b.check, xe, 2, 0), N = 0, M = 0, b.mode = A;
              break;
            }
            if (b.flags = 0, b.head && (b.head.done = !1), !(b.wrap & 1) || /* check if zlib header allowed */
            (((N & 255) << 8) + (N >> 8)) % 31) {
              x.msg = "incorrect header check", b.mode = G;
              break;
            }
            if ((N & 15) !== _) {
              x.msg = "unknown compression method", b.mode = G;
              break;
            }
            if (N >>>= 4, M -= 4, Ce = (N & 15) + 8, b.wbits === 0)
              b.wbits = Ce;
            else if (Ce > b.wbits) {
              x.msg = "invalid window size", b.mode = G;
              break;
            }
            b.dmax = 1 << Ce, x.adler = b.check = 1, b.mode = N & 512 ? W : re, N = 0, M = 0;
            break;
          case A:
            for (; M < 16; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if (b.flags = N, (b.flags & 255) !== _) {
              x.msg = "unknown compression method", b.mode = G;
              break;
            }
            if (b.flags & 57344) {
              x.msg = "unknown header flags set", b.mode = G;
              break;
            }
            b.head && (b.head.text = N >> 8 & 1), b.flags & 512 && (xe[0] = N & 255, xe[1] = N >>> 8 & 255, b.check = m(b.check, xe, 2, 0)), N = 0, M = 0, b.mode = E;
          /* falls through */
          case E:
            for (; M < 32; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            b.head && (b.head.time = N), b.flags & 512 && (xe[0] = N & 255, xe[1] = N >>> 8 & 255, xe[2] = N >>> 16 & 255, xe[3] = N >>> 24 & 255, b.check = m(b.check, xe, 4, 0)), N = 0, M = 0, b.mode = O;
          /* falls through */
          case O:
            for (; M < 16; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            b.head && (b.head.xflags = N & 255, b.head.os = N >> 8), b.flags & 512 && (xe[0] = N & 255, xe[1] = N >>> 8 & 255, b.check = m(b.check, xe, 2, 0)), N = 0, M = 0, b.mode = D;
          /* falls through */
          case D:
            if (b.flags & 1024) {
              for (; M < 16; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              b.length = N, b.head && (b.head.extra_len = N), b.flags & 512 && (xe[0] = N & 255, xe[1] = N >>> 8 & 255, b.check = m(b.check, xe, 2, 0)), N = 0, M = 0;
            } else b.head && (b.head.extra = null);
            b.mode = L;
          /* falls through */
          case L:
            if (b.flags & 1024 && (Q = b.length, Q > B && (Q = B), Q && (b.head && (Ce = b.head.extra_len - b.length, b.head.extra || (b.head.extra = new Array(b.head.extra_len)), d.arraySet(
              b.head.extra,
              z,
              p,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              Q,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              Ce
            )), b.flags & 512 && (b.check = m(b.check, z, Q, p)), B -= Q, p += Q, b.length -= Q), b.length))
              break e;
            b.length = 0, b.mode = P;
          /* falls through */
          case P:
            if (b.flags & 2048) {
              if (B === 0)
                break e;
              Q = 0;
              do
                Ce = z[p + Q++], b.head && Ce && b.length < 65536 && (b.head.name += String.fromCharCode(Ce));
              while (Ce && Q < B);
              if (b.flags & 512 && (b.check = m(b.check, z, Q, p)), B -= Q, p += Q, Ce)
                break e;
            } else b.head && (b.head.name = null);
            b.length = 0, b.mode = K;
          /* falls through */
          case K:
            if (b.flags & 4096) {
              if (B === 0)
                break e;
              Q = 0;
              do
                Ce = z[p + Q++], b.head && Ce && b.length < 65536 && (b.head.comment += String.fromCharCode(Ce));
              while (Ce && Q < B);
              if (b.flags & 512 && (b.check = m(b.check, z, Q, p)), B -= Q, p += Q, Ce)
                break e;
            } else b.head && (b.head.comment = null);
            b.mode = V;
          /* falls through */
          case V:
            if (b.flags & 512) {
              for (; M < 16; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              if (N !== (b.check & 65535)) {
                x.msg = "header crc mismatch", b.mode = G;
                break;
              }
              N = 0, M = 0;
            }
            b.head && (b.head.hcrc = b.flags >> 9 & 1, b.head.done = !0), x.adler = b.check = 0, b.mode = re;
            break;
          case W:
            for (; M < 32; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            x.adler = b.check = Fe(N), N = 0, M = 0, b.mode = H;
          /* falls through */
          case H:
            if (b.havedict === 0)
              return x.next_out = q, x.avail_out = S, x.next_in = p, x.avail_in = B, b.hold = N, b.bits = M, i;
            x.adler = b.check = 1, b.mode = re;
          /* falls through */
          case re:
            if (j === o || j === r)
              break e;
          /* falls through */
          case ue:
            if (b.last) {
              N >>>= M & 7, M -= M & 7, b.mode = $;
              break;
            }
            for (; M < 3; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            switch (b.last = N & 1, N >>>= 1, M -= 1, N & 3) {
              case 0:
                b.mode = ce;
                break;
              case 1:
                if (et(b), b.mode = ie, j === r) {
                  N >>>= 2, M -= 2;
                  break e;
                }
                break;
              case 2:
                b.mode = F;
                break;
              case 3:
                x.msg = "invalid block type", b.mode = G;
            }
            N >>>= 2, M -= 2;
            break;
          case ce:
            for (N >>>= M & 7, M -= M & 7; M < 32; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if ((N & 65535) !== (N >>> 16 ^ 65535)) {
              x.msg = "invalid stored block lengths", b.mode = G;
              break;
            }
            if (b.length = N & 65535, N = 0, M = 0, b.mode = R, j === r)
              break e;
          /* falls through */
          case R:
            b.mode = I;
          /* falls through */
          case I:
            if (Q = b.length, Q) {
              if (Q > B && (Q = B), Q > S && (Q = S), Q === 0)
                break e;
              d.arraySet(le, z, p, Q, q), B -= Q, p += Q, S -= Q, q += Q, b.length -= Q;
              break;
            }
            b.mode = re;
            break;
          case F:
            for (; M < 14; ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if (b.nlen = (N & 31) + 257, N >>>= 5, M -= 5, b.ndist = (N & 31) + 1, N >>>= 5, M -= 5, b.ncode = (N & 15) + 4, N >>>= 4, M -= 4, b.nlen > 286 || b.ndist > 30) {
              x.msg = "too many length or distance symbols", b.mode = G;
              break;
            }
            b.have = 0, b.mode = Z;
          /* falls through */
          case Z:
            for (; b.have < b.ncode; ) {
              for (; M < 3; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              b.lens[Ln[b.have++]] = N & 7, N >>>= 3, M -= 3;
            }
            for (; b.have < 19; )
              b.lens[Ln[b.have++]] = 0;
            if (b.lencode = b.lendyn, b.lenbits = 7, it = { bits: b.lenbits }, Ye = v(f, b.lens, 0, 19, b.lencode, 0, b.work, it), b.lenbits = it.bits, Ye) {
              x.msg = "invalid code lengths set", b.mode = G;
              break;
            }
            b.have = 0, b.mode = te;
          /* falls through */
          case te:
            for (; b.have < b.nlen + b.ndist; ) {
              for (; Ae = b.lencode[N & (1 << b.lenbits) - 1], ve = Ae >>> 24, Te = Ae >>> 16 & 255, qe = Ae & 65535, !(ve <= M); ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              if (qe < 16)
                N >>>= ve, M -= ve, b.lens[b.have++] = qe;
              else {
                if (qe === 16) {
                  for (tt = ve + 2; M < tt; ) {
                    if (B === 0)
                      break e;
                    B--, N += z[p++] << M, M += 8;
                  }
                  if (N >>>= ve, M -= ve, b.have === 0) {
                    x.msg = "invalid bit length repeat", b.mode = G;
                    break;
                  }
                  Ce = b.lens[b.have - 1], Q = 3 + (N & 3), N >>>= 2, M -= 2;
                } else if (qe === 17) {
                  for (tt = ve + 3; M < tt; ) {
                    if (B === 0)
                      break e;
                    B--, N += z[p++] << M, M += 8;
                  }
                  N >>>= ve, M -= ve, Ce = 0, Q = 3 + (N & 7), N >>>= 3, M -= 3;
                } else {
                  for (tt = ve + 7; M < tt; ) {
                    if (B === 0)
                      break e;
                    B--, N += z[p++] << M, M += 8;
                  }
                  N >>>= ve, M -= ve, Ce = 0, Q = 11 + (N & 127), N >>>= 7, M -= 7;
                }
                if (b.have + Q > b.nlen + b.ndist) {
                  x.msg = "invalid bit length repeat", b.mode = G;
                  break;
                }
                for (; Q--; )
                  b.lens[b.have++] = Ce;
              }
            }
            if (b.mode === G)
              break;
            if (b.lens[256] === 0) {
              x.msg = "invalid code -- missing end-of-block", b.mode = G;
              break;
            }
            if (b.lenbits = 9, it = { bits: b.lenbits }, Ye = v(n, b.lens, 0, b.nlen, b.lencode, 0, b.work, it), b.lenbits = it.bits, Ye) {
              x.msg = "invalid literal/lengths set", b.mode = G;
              break;
            }
            if (b.distbits = 6, b.distcode = b.distdyn, it = { bits: b.distbits }, Ye = v(l, b.lens, b.nlen, b.ndist, b.distcode, 0, b.work, it), b.distbits = it.bits, Ye) {
              x.msg = "invalid distances set", b.mode = G;
              break;
            }
            if (b.mode = ie, j === r)
              break e;
          /* falls through */
          case ie:
            b.mode = se;
          /* falls through */
          case se:
            if (B >= 6 && S >= 258) {
              x.next_out = q, x.avail_out = S, x.next_in = p, x.avail_in = B, b.hold = N, b.bits = M, u(x, X), q = x.next_out, le = x.output, S = x.avail_out, p = x.next_in, z = x.input, B = x.avail_in, N = b.hold, M = b.bits, b.mode === re && (b.back = -1);
              break;
            }
            for (b.back = 0; Ae = b.lencode[N & (1 << b.lenbits) - 1], ve = Ae >>> 24, Te = Ae >>> 16 & 255, qe = Ae & 65535, !(ve <= M); ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if (Te && (Te & 240) === 0) {
              for (Ue = ve, Wt = Te, Ht = qe; Ae = b.lencode[Ht + ((N & (1 << Ue + Wt) - 1) >> Ue)], ve = Ae >>> 24, Te = Ae >>> 16 & 255, qe = Ae & 65535, !(Ue + ve <= M); ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              N >>>= Ue, M -= Ue, b.back += Ue;
            }
            if (N >>>= ve, M -= ve, b.back += ve, b.length = qe, Te === 0) {
              b.mode = T;
              break;
            }
            if (Te & 32) {
              b.back = -1, b.mode = re;
              break;
            }
            if (Te & 64) {
              x.msg = "invalid literal/length code", b.mode = G;
              break;
            }
            b.extra = Te & 15, b.mode = he;
          /* falls through */
          case he:
            if (b.extra) {
              for (tt = b.extra; M < tt; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              b.length += N & (1 << b.extra) - 1, N >>>= b.extra, M -= b.extra, b.back += b.extra;
            }
            b.was = b.length, b.mode = _e;
          /* falls through */
          case _e:
            for (; Ae = b.distcode[N & (1 << b.distbits) - 1], ve = Ae >>> 24, Te = Ae >>> 16 & 255, qe = Ae & 65535, !(ve <= M); ) {
              if (B === 0)
                break e;
              B--, N += z[p++] << M, M += 8;
            }
            if ((Te & 240) === 0) {
              for (Ue = ve, Wt = Te, Ht = qe; Ae = b.distcode[Ht + ((N & (1 << Ue + Wt) - 1) >> Ue)], ve = Ae >>> 24, Te = Ae >>> 16 & 255, qe = Ae & 65535, !(Ue + ve <= M); ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              N >>>= Ue, M -= Ue, b.back += Ue;
            }
            if (N >>>= ve, M -= ve, b.back += ve, Te & 64) {
              x.msg = "invalid distance code", b.mode = G;
              break;
            }
            b.offset = qe, b.extra = Te & 15, b.mode = me;
          /* falls through */
          case me:
            if (b.extra) {
              for (tt = b.extra; M < tt; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              b.offset += N & (1 << b.extra) - 1, N >>>= b.extra, M -= b.extra, b.back += b.extra;
            }
            if (b.offset > b.dmax) {
              x.msg = "invalid distance too far back", b.mode = G;
              break;
            }
            b.mode = C;
          /* falls through */
          case C:
            if (S === 0)
              break e;
            if (Q = X - S, b.offset > Q) {
              if (Q = b.offset - Q, Q > b.whave && b.sane) {
                x.msg = "invalid distance too far back", b.mode = G;
                break;
              }
              Q > b.wnext ? (Q -= b.wnext, ge = b.wsize - Q) : ge = b.wnext - Q, Q > b.length && (Q = b.length), rt = b.window;
            } else
              rt = le, ge = q - b.offset, Q = b.length;
            Q > S && (Q = S), S -= Q, b.length -= Q;
            do
              le[q++] = rt[ge++];
            while (--Q);
            b.length === 0 && (b.mode = se);
            break;
          case T:
            if (S === 0)
              break e;
            le[q++] = b.length, S--, b.mode = se;
            break;
          case $:
            if (b.wrap) {
              for (; M < 32; ) {
                if (B === 0)
                  break e;
                B--, N |= z[p++] << M, M += 8;
              }
              if (X -= S, x.total_out += X, b.total += X, X && (x.adler = b.check = /*UPDATE(state.check, put - _out, _out);*/
              b.flags ? m(b.check, le, X, q - X) : h(b.check, le, X, q - X)), X = S, (b.flags ? N : Fe(N)) !== b.check) {
                x.msg = "incorrect data check", b.mode = G;
                break;
              }
              N = 0, M = 0;
            }
            b.mode = J;
          /* falls through */
          case J:
            if (b.wrap && b.flags) {
              for (; M < 32; ) {
                if (B === 0)
                  break e;
                B--, N += z[p++] << M, M += 8;
              }
              if (N !== (b.total & 4294967295)) {
                x.msg = "incorrect length check", b.mode = G;
                break;
              }
              N = 0, M = 0;
            }
            b.mode = fe;
          /* falls through */
          case fe:
            Ye = t;
            break e;
          case G:
            Ye = c;
            break e;
          case oe:
            return y;
          case Ke:
          /* falls through */
          default:
            return s;
        }
    return x.next_out = q, x.avail_out = S, x.next_in = p, x.avail_in = B, b.hold = N, b.bits = M, (b.wsize || X !== x.avail_out && b.mode < G && (b.mode < $ || j !== a)) && yt(x, x.output, x.next_out, X - x.avail_out), ne -= x.avail_in, X -= x.avail_out, x.total_in += ne, x.total_out += X, b.total += X, b.wrap && X && (x.adler = b.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
    b.flags ? m(b.check, le, X, x.next_out - X) : h(b.check, le, X, x.next_out - X)), x.data_type = b.bits + (b.last ? 64 : 0) + (b.mode === re ? 128 : 0) + (b.mode === ie || b.mode === R ? 256 : 0), (ne === 0 && X === 0 || j === a) && Ye === e && (Ye = g), Ye;
  }
  function U(x) {
    if (!x || !x.state)
      return s;
    var j = x.state;
    return j.window && (j.window = null), x.state = null, e;
  }
  function Y(x, j) {
    var b;
    return !x || !x.state || (b = x.state, (b.wrap & 2) === 0) ? s : (b.head = j, j.done = !1, e);
  }
  function ee(x, j) {
    var b = j.length, z, le, p;
    return !x || !x.state || (z = x.state, z.wrap !== 0 && z.mode !== H) ? s : z.mode === H && (le = 1, le = h(le, j, b, 0), le !== z.check) ? c : (p = yt(x, j, b, b), p ? (z.mode = oe, y) : (z.havedict = 1, e));
  }
  return Je.inflateReset = Pe, Je.inflateReset2 = He, Je.inflateResetKeep = We, Je.inflateInit = Oe, Je.inflateInit2 = je, Je.inflate = k, Je.inflateEnd = U, Je.inflateGetHeader = Y, Je.inflateSetDictionary = ee, Je.inflateInfo = "pako inflate (from Nodeca project)", Je;
}
var Vi, Js;
function sl() {
  return Js || (Js = 1, Vi = {
    /* Allowed flush values; see deflate() and inflate() below for details */
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    /* Return codes for the compression/decompression functions. Negative values
    * are errors, positive values are used for special but normal events.
    */
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    //Z_MEM_ERROR:     -4,
    Z_BUF_ERROR: -5,
    //Z_VERSION_ERROR: -6,
    /* compression levels */
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    /* Possible values of the data_type field (though see inflate()) */
    Z_BINARY: 0,
    Z_TEXT: 1,
    //Z_ASCII:                1, // = Z_TEXT (deprecated)
    Z_UNKNOWN: 2,
    /* The deflate compression method */
    Z_DEFLATED: 8
    //Z_NULL:                 null // Use -1 or null inline, depending on var type
  }), Vi;
}
var Gi, Vs;
function sf() {
  if (Vs) return Gi;
  Vs = 1;
  function d() {
    this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
  }
  return Gi = d, Gi;
}
var Gs;
function of() {
  if (Gs) return Et;
  Gs = 1;
  var d = af(), h = ft(), m = nl(), u = sl(), v = xn(), f = al(), n = sf(), l = Object.prototype.toString;
  function a(e) {
    if (!(this instanceof a)) return new a(e);
    this.options = h.assign({
      chunkSize: 16384,
      windowBits: 0,
      to: ""
    }, e || {});
    var t = this.options;
    t.raw && t.windowBits >= 0 && t.windowBits < 16 && (t.windowBits = -t.windowBits, t.windowBits === 0 && (t.windowBits = -15)), t.windowBits >= 0 && t.windowBits < 16 && !(e && e.windowBits) && (t.windowBits += 32), t.windowBits > 15 && t.windowBits < 48 && (t.windowBits & 15) === 0 && (t.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new f(), this.strm.avail_out = 0;
    var i = d.inflateInit2(
      this.strm,
      t.windowBits
    );
    if (i !== u.Z_OK)
      throw new Error(v[i]);
    if (this.header = new n(), d.inflateGetHeader(this.strm, this.header), t.dictionary && (typeof t.dictionary == "string" ? t.dictionary = m.string2buf(t.dictionary) : l.call(t.dictionary) === "[object ArrayBuffer]" && (t.dictionary = new Uint8Array(t.dictionary)), t.raw && (i = d.inflateSetDictionary(this.strm, t.dictionary), i !== u.Z_OK)))
      throw new Error(v[i]);
  }
  a.prototype.push = function(e, t) {
    var i = this.strm, s = this.options.chunkSize, c = this.options.dictionary, y, g, _, w, A, E = !1;
    if (this.ended)
      return !1;
    g = t === ~~t ? t : t === !0 ? u.Z_FINISH : u.Z_NO_FLUSH, typeof e == "string" ? i.input = m.binstring2buf(e) : l.call(e) === "[object ArrayBuffer]" ? i.input = new Uint8Array(e) : i.input = e, i.next_in = 0, i.avail_in = i.input.length;
    do {
      if (i.avail_out === 0 && (i.output = new h.Buf8(s), i.next_out = 0, i.avail_out = s), y = d.inflate(i, u.Z_NO_FLUSH), y === u.Z_NEED_DICT && c && (y = d.inflateSetDictionary(this.strm, c)), y === u.Z_BUF_ERROR && E === !0 && (y = u.Z_OK, E = !1), y !== u.Z_STREAM_END && y !== u.Z_OK)
        return this.onEnd(y), this.ended = !0, !1;
      i.next_out && (i.avail_out === 0 || y === u.Z_STREAM_END || i.avail_in === 0 && (g === u.Z_FINISH || g === u.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (_ = m.utf8border(i.output, i.next_out), w = i.next_out - _, A = m.buf2string(i.output, _), i.next_out = w, i.avail_out = s - w, w && h.arraySet(i.output, i.output, _, w, 0), this.onData(A)) : this.onData(h.shrinkBuf(i.output, i.next_out))), i.avail_in === 0 && i.avail_out === 0 && (E = !0);
    } while ((i.avail_in > 0 || i.avail_out === 0) && y !== u.Z_STREAM_END);
    return y === u.Z_STREAM_END && (g = u.Z_FINISH), g === u.Z_FINISH ? (y = d.inflateEnd(this.strm), this.onEnd(y), this.ended = !0, y === u.Z_OK) : (g === u.Z_SYNC_FLUSH && (this.onEnd(u.Z_OK), i.avail_out = 0), !0);
  }, a.prototype.onData = function(e) {
    this.chunks.push(e);
  }, a.prototype.onEnd = function(e) {
    e === u.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = h.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
  };
  function o(e, t) {
    var i = new a(t);
    if (i.push(e, !0), i.err)
      throw i.msg || v[i.err];
    return i.result;
  }
  function r(e, t) {
    return t = t || {}, t.raw = !0, o(e, t);
  }
  return Et.Inflate = a, Et.inflate = o, Et.inflateRaw = r, Et.ungzip = o, Et;
}
var Xi, Xs;
function lf() {
  if (Xs) return Xi;
  Xs = 1;
  var d = ft().assign, h = tf(), m = of(), u = sl(), v = {};
  return d(v, h, m, u), Xi = v, Xi;
}
var Qs;
function ff() {
  if (Qs) return Mt;
  Qs = 1;
  var d = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", h = lf(), m = Ee(), u = Ve(), v = d ? "uint8array" : "array";
  Mt.magic = "\b\0";
  function f(n, l) {
    u.call(this, "FlateWorker/" + n), this._pako = null, this._pakoAction = n, this._pakoOptions = l, this.meta = {};
  }
  return m.inherits(f, u), f.prototype.processChunk = function(n) {
    this.meta = n.meta, this._pako === null && this._createPako(), this._pako.push(m.transformTo(v, n.data), !1);
  }, f.prototype.flush = function() {
    u.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
  }, f.prototype.cleanUp = function() {
    u.prototype.cleanUp.call(this), this._pako = null;
  }, f.prototype._createPako = function() {
    this._pako = new h[this._pakoAction]({
      raw: !0,
      level: this._pakoOptions.level || -1
      // default compression
    });
    var n = this;
    this._pako.onData = function(l) {
      n.push({
        data: l,
        meta: n.meta
      });
    };
  }, Mt.compressWorker = function(n) {
    return new f("Deflate", n);
  }, Mt.uncompressWorker = function() {
    return new f("Inflate", {});
  }, Mt;
}
var eo;
function ol() {
  if (eo) return ur;
  eo = 1;
  var d = Ve();
  return ur.STORE = {
    magic: "\0\0",
    compressWorker: function() {
      return new d("STORE compression");
    },
    uncompressWorker: function() {
      return new d("STORE decompression");
    }
  }, ur.DEFLATE = ff(), ur;
}
var at = {}, to;
function ll() {
  return to || (to = 1, at.LOCAL_FILE_HEADER = "PK", at.CENTRAL_FILE_HEADER = "PK", at.CENTRAL_DIRECTORY_END = "PK", at.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", at.ZIP64_CENTRAL_DIRECTORY_END = "PK", at.DATA_DESCRIPTOR = "PK\x07\b"), at;
}
var Qi, ro;
function uf() {
  if (ro) return Qi;
  ro = 1;
  var d = Ee(), h = Ve(), m = Kt(), u = Nn(), v = ll(), f = function(t, i) {
    var s = "", c;
    for (c = 0; c < i; c++)
      s += String.fromCharCode(t & 255), t = t >>> 8;
    return s;
  }, n = function(t, i) {
    var s = t;
    return t || (s = i ? 16893 : 33204), (s & 65535) << 16;
  }, l = function(t) {
    return (t || 0) & 63;
  }, a = function(t, i, s, c, y, g) {
    var _ = t.file, w = t.compression, A = g !== m.utf8encode, E = d.transformTo("string", g(_.name)), O = d.transformTo("string", m.utf8encode(_.name)), D = _.comment, L = d.transformTo("string", g(D)), P = d.transformTo("string", m.utf8encode(D)), K = O.length !== _.name.length, V = P.length !== D.length, W, H, re = "", ue = "", ce = "", R = _.dir, I = _.date, F = {
      crc32: 0,
      compressedSize: 0,
      uncompressedSize: 0
    };
    (!i || s) && (F.crc32 = t.crc32, F.compressedSize = t.compressedSize, F.uncompressedSize = t.uncompressedSize);
    var Z = 0;
    i && (Z |= 8), !A && (K || V) && (Z |= 2048);
    var te = 0, ie = 0;
    R && (te |= 16), y === "UNIX" ? (ie = 798, te |= n(_.unixPermissions, R)) : (ie = 20, te |= l(_.dosPermissions)), W = I.getUTCHours(), W = W << 6, W = W | I.getUTCMinutes(), W = W << 5, W = W | I.getUTCSeconds() / 2, H = I.getUTCFullYear() - 1980, H = H << 4, H = H | I.getUTCMonth() + 1, H = H << 5, H = H | I.getUTCDate(), K && (ue = // Version
    f(1, 1) + // NameCRC32
    f(u(E), 4) + // UnicodeName
    O, re += // Info-ZIP Unicode Path Extra Field
    "up" + // size
    f(ue.length, 2) + // content
    ue), V && (ce = // Version
    f(1, 1) + // CommentCRC32
    f(u(L), 4) + // UnicodeName
    P, re += // Info-ZIP Unicode Path Extra Field
    "uc" + // size
    f(ce.length, 2) + // content
    ce);
    var se = "";
    se += `
\0`, se += f(Z, 2), se += w.magic, se += f(W, 2), se += f(H, 2), se += f(F.crc32, 4), se += f(F.compressedSize, 4), se += f(F.uncompressedSize, 4), se += f(E.length, 2), se += f(re.length, 2);
    var he = v.LOCAL_FILE_HEADER + se + E + re, _e = v.CENTRAL_FILE_HEADER + // version made by (00: DOS)
    f(ie, 2) + // file header (common to file and central directory)
    se + // file comment length
    f(L.length, 2) + // disk number start
    "\0\0\0\0" + // external file attributes
    f(te, 4) + // relative offset of local header
    f(c, 4) + // file name
    E + // extra field
    re + // file comment
    L;
    return {
      fileRecord: he,
      dirRecord: _e
    };
  }, o = function(t, i, s, c, y) {
    var g = "", _ = d.transformTo("string", y(c));
    return g = v.CENTRAL_DIRECTORY_END + // number of this disk
    "\0\0\0\0" + // total number of entries in the central directory on this disk
    f(t, 2) + // total number of entries in the central directory
    f(t, 2) + // size of the central directory   4 bytes
    f(i, 4) + // offset of start of central directory with respect to the starting disk number
    f(s, 4) + // .ZIP file comment length
    f(_.length, 2) + // .ZIP file comment
    _, g;
  }, r = function(t) {
    var i = "";
    return i = v.DATA_DESCRIPTOR + // crc-32                          4 bytes
    f(t.crc32, 4) + // compressed size                 4 bytes
    f(t.compressedSize, 4) + // uncompressed size               4 bytes
    f(t.uncompressedSize, 4), i;
  };
  function e(t, i, s, c) {
    h.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = i, this.zipPlatform = s, this.encodeFileName = c, this.streamFiles = t, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
  }
  return d.inherits(e, h), e.prototype.push = function(t) {
    var i = t.meta.percent || 0, s = this.entriesCount, c = this._sources.length;
    this.accumulate ? this.contentBuffer.push(t) : (this.bytesWritten += t.data.length, h.prototype.push.call(this, {
      data: t.data,
      meta: {
        currentFile: this.currentFile,
        percent: s ? (i + 100 * (s - c - 1)) / s : 100
      }
    }));
  }, e.prototype.openedSource = function(t) {
    this.currentSourceOffset = this.bytesWritten, this.currentFile = t.file.name;
    var i = this.streamFiles && !t.file.dir;
    if (i) {
      var s = a(t, i, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.push({
        data: s.fileRecord,
        meta: { percent: 0 }
      });
    } else
      this.accumulate = !0;
  }, e.prototype.closedSource = function(t) {
    this.accumulate = !1;
    var i = this.streamFiles && !t.file.dir, s = a(t, i, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
    if (this.dirRecords.push(s.dirRecord), i)
      this.push({
        data: r(t),
        meta: { percent: 100 }
      });
    else
      for (this.push({
        data: s.fileRecord,
        meta: { percent: 0 }
      }); this.contentBuffer.length; )
        this.push(this.contentBuffer.shift());
    this.currentFile = null;
  }, e.prototype.flush = function() {
    for (var t = this.bytesWritten, i = 0; i < this.dirRecords.length; i++)
      this.push({
        data: this.dirRecords[i],
        meta: { percent: 100 }
      });
    var s = this.bytesWritten - t, c = o(this.dirRecords.length, s, t, this.zipComment, this.encodeFileName);
    this.push({
      data: c,
      meta: { percent: 100 }
    });
  }, e.prototype.prepareNextSource = function() {
    this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
  }, e.prototype.registerPrevious = function(t) {
    this._sources.push(t);
    var i = this;
    return t.on("data", function(s) {
      i.processChunk(s);
    }), t.on("end", function() {
      i.closedSource(i.previous.streamInfo), i._sources.length ? i.prepareNextSource() : i.end();
    }), t.on("error", function(s) {
      i.error(s);
    }), this;
  }, e.prototype.resume = function() {
    if (!h.prototype.resume.call(this))
      return !1;
    if (!this.previous && this._sources.length)
      return this.prepareNextSource(), !0;
    if (!this.previous && !this._sources.length && !this.generatedError)
      return this.end(), !0;
  }, e.prototype.error = function(t) {
    var i = this._sources;
    if (!h.prototype.error.call(this, t))
      return !1;
    for (var s = 0; s < i.length; s++)
      try {
        i[s].error(t);
      } catch {
      }
    return !0;
  }, e.prototype.lock = function() {
    h.prototype.lock.call(this);
    for (var t = this._sources, i = 0; i < t.length; i++)
      t[i].lock();
  }, Qi = e, Qi;
}
var io;
function cf() {
  if (io) return Ui;
  io = 1;
  var d = ol(), h = uf(), m = function(u, v) {
    var f = u || v, n = d[f];
    if (!n)
      throw new Error(f + " is not a valid compression method !");
    return n;
  };
  return Ui.generateWorker = function(u, v, f) {
    var n = new h(v.streamFiles, f, v.platform, v.encodeFileName), l = 0;
    try {
      u.forEach(function(a, o) {
        l++;
        var r = m(o.options.compression, v.compression), e = o.options.compressionOptions || v.compressionOptions || {}, t = o.dir, i = o.date;
        o._compressWorker(r, e).withStreamInfo("file", {
          name: a,
          dir: t,
          date: i,
          comment: o.comment || "",
          unixPermissions: o.unixPermissions,
          dosPermissions: o.dosPermissions
        }).pipe(n);
      }), n.entriesCount = l;
    } catch (a) {
      n.error(a);
    }
    return n;
  }, Ui;
}
var en, no;
function hf() {
  if (no) return en;
  no = 1;
  var d = Ee(), h = Ve();
  function m(u, v) {
    h.call(this, "Nodejs stream input adapter for " + u), this._upstreamEnded = !1, this._bindStream(v);
  }
  return d.inherits(m, h), m.prototype._bindStream = function(u) {
    var v = this;
    this._stream = u, u.pause(), u.on("data", function(f) {
      v.push({
        data: f,
        meta: {
          percent: 0
        }
      });
    }).on("error", function(f) {
      v.isPaused ? this.generatedError = f : v.error(f);
    }).on("end", function() {
      v.isPaused ? v._upstreamEnded = !0 : v.end();
    });
  }, m.prototype.pause = function() {
    return h.prototype.pause.call(this) ? (this._stream.pause(), !0) : !1;
  }, m.prototype.resume = function() {
    return h.prototype.resume.call(this) ? (this._upstreamEnded ? this.end() : this._stream.resume(), !0) : !1;
  }, en = m, en;
}
var tn, ao;
function df() {
  if (ao) return tn;
  ao = 1;
  var d = Kt(), h = Ee(), m = Ve(), u = Xo(), v = Qo(), f = On(), n = Xl(), l = cf(), a = kr(), o = hf(), r = function(y, g, _) {
    var w = h.getTypeOf(g), A, E = h.extend(_ || {}, v);
    E.date = E.date || /* @__PURE__ */ new Date(), E.compression !== null && (E.compression = E.compression.toUpperCase()), typeof E.unixPermissions == "string" && (E.unixPermissions = parseInt(E.unixPermissions, 8)), E.unixPermissions && E.unixPermissions & 16384 && (E.dir = !0), E.dosPermissions && E.dosPermissions & 16 && (E.dir = !0), E.dir && (y = t(y)), E.createFolders && (A = e(y)) && i.call(this, A, !0);
    var O = w === "string" && E.binary === !1 && E.base64 === !1;
    (!_ || typeof _.binary > "u") && (E.binary = !O);
    var D = g instanceof f && g.uncompressedSize === 0;
    (D || E.dir || !g || g.length === 0) && (E.base64 = !1, E.binary = !0, g = "", E.compression = "STORE", w = "string");
    var L = null;
    g instanceof f || g instanceof m ? L = g : a.isNode && a.isStream(g) ? L = new o(y, g) : L = h.prepareContent(y, g, E.binary, E.optimizedBinaryString, E.base64);
    var P = new n(y, L, E);
    this.files[y] = P;
  }, e = function(y) {
    y.slice(-1) === "/" && (y = y.substring(0, y.length - 1));
    var g = y.lastIndexOf("/");
    return g > 0 ? y.substring(0, g) : "";
  }, t = function(y) {
    return y.slice(-1) !== "/" && (y += "/"), y;
  }, i = function(y, g) {
    return g = typeof g < "u" ? g : v.createFolders, y = t(y), this.files[y] || r.call(this, y, null, {
      dir: !0,
      createFolders: g
    }), this.files[y];
  };
  function s(y) {
    return Object.prototype.toString.call(y) === "[object RegExp]";
  }
  var c = {
    /**
     * @see loadAsync
     */
    load: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    },
    /**
     * Call a callback function for each entry at this folder level.
     * @param {Function} cb the callback function:
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     */
    forEach: function(y) {
      var g, _, w;
      for (g in this.files)
        w = this.files[g], _ = g.slice(this.root.length, g.length), _ && g.slice(0, this.root.length) === this.root && y(_, w);
    },
    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function(y) {
      var g = [];
      return this.forEach(function(_, w) {
        y(_, w) && g.push(w);
      }), g;
    },
    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function(y, g, _) {
      if (arguments.length === 1)
        if (s(y)) {
          var w = y;
          return this.filter(function(E, O) {
            return !O.dir && w.test(E);
          });
        } else {
          var A = this.files[this.root + y];
          return A && !A.dir ? A : null;
        }
      else
        y = this.root + y, r.call(this, y, g, _);
      return this;
    },
    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function(y) {
      if (!y)
        return this;
      if (s(y))
        return this.filter(function(A, E) {
          return E.dir && y.test(A);
        });
      var g = this.root + y, _ = i.call(this, g), w = this.clone();
      return w.root = _.name, w;
    },
    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function(y) {
      y = this.root + y;
      var g = this.files[y];
      if (g || (y.slice(-1) !== "/" && (y += "/"), g = this.files[y]), g && !g.dir)
        delete this.files[y];
      else
        for (var _ = this.filter(function(A, E) {
          return E.name.slice(0, y.length) === y;
        }), w = 0; w < _.length; w++)
          delete this.files[_[w].name];
      return this;
    },
    /**
     * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
     */
    generate: function() {
      throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
    },
    /**
     * Generate the complete zip file as an internal stream.
     * @param {Object} options the options to generate the zip file :
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {StreamHelper} the streamed zip file.
     */
    generateInternalStream: function(y) {
      var g, _ = {};
      try {
        if (_ = h.extend(y || {}, {
          streamFiles: !1,
          compression: "STORE",
          compressionOptions: null,
          type: "",
          platform: "DOS",
          comment: null,
          mimeType: "application/zip",
          encodeFileName: d.utf8encode
        }), _.type = _.type.toLowerCase(), _.compression = _.compression.toUpperCase(), _.type === "binarystring" && (_.type = "string"), !_.type)
          throw new Error("No output type specified.");
        h.checkSupport(_.type), (_.platform === "darwin" || _.platform === "freebsd" || _.platform === "linux" || _.platform === "sunos") && (_.platform = "UNIX"), _.platform === "win32" && (_.platform = "DOS");
        var w = _.comment || this.comment || "";
        g = l.generateWorker(this, _, w);
      } catch (A) {
        g = new m("error"), g.error(A);
      }
      return new u(g, _.type || "string", _.mimeType);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateAsync: function(y, g) {
      return this.generateInternalStream(y).accumulate(g);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateNodeStream: function(y, g) {
      return y = y || {}, y.type || (y.type = "nodebuffer"), this.generateInternalStream(y).toNodejsStream(g);
    }
  };
  return tn = c, tn;
}
var rn, so;
function fl() {
  if (so) return rn;
  so = 1;
  var d = Ee();
  function h(m) {
    this.data = m, this.length = m.length, this.index = 0, this.zero = 0;
  }
  return h.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function(m) {
      this.checkIndex(this.index + m);
    },
    /**
     * Check that the specified index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function(m) {
      if (this.length < this.zero + m || m < 0)
        throw new Error("End of data reached (data length = " + this.length + ", asked index = " + m + "). Corrupted zip ?");
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function(m) {
      this.checkIndex(m), this.index = m;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function(m) {
      this.setIndex(this.index + m);
    },
    /**
     * Get the byte at the specified index.
     * @param {number} i the index to use.
     * @return {number} a byte.
     */
    byteAt: function() {
    },
    /**
     * Get the next number with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {number} the corresponding number.
     */
    readInt: function(m) {
      var u = 0, v;
      for (this.checkOffset(m), v = this.index + m - 1; v >= this.index; v--)
        u = (u << 8) + this.byteAt(v);
      return this.index += m, u;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function(m) {
      return d.transformTo("string", this.readData(m));
    },
    /**
     * Get raw data without conversion, <size> bytes.
     * @param {number} size the number of bytes to read.
     * @return {Object} the raw data, implementation specific.
     */
    readData: function() {
    },
    /**
     * Find the last occurrence of a zip signature (4 bytes).
     * @param {string} sig the signature to find.
     * @return {number} the index of the last occurrence, -1 if not found.
     */
    lastIndexOfSignature: function() {
    },
    /**
     * Read the signature (4 bytes) at the current position and compare it with sig.
     * @param {string} sig the expected signature
     * @return {boolean} true if the signature matches, false otherwise.
     */
    readAndCheckSignature: function() {
    },
    /**
     * Get the next date.
     * @return {Date} the date.
     */
    readDate: function() {
      var m = this.readInt(4);
      return new Date(Date.UTC(
        (m >> 25 & 127) + 1980,
        // year
        (m >> 21 & 15) - 1,
        // month
        m >> 16 & 31,
        // day
        m >> 11 & 31,
        // hour
        m >> 5 & 63,
        // minute
        (m & 31) << 1
      ));
    }
  }, rn = h, rn;
}
var nn, oo;
function ul() {
  if (oo) return nn;
  oo = 1;
  var d = fl(), h = Ee();
  function m(u) {
    d.call(this, u);
    for (var v = 0; v < this.data.length; v++)
      u[v] = u[v] & 255;
  }
  return h.inherits(m, d), m.prototype.byteAt = function(u) {
    return this.data[this.zero + u];
  }, m.prototype.lastIndexOfSignature = function(u) {
    for (var v = u.charCodeAt(0), f = u.charCodeAt(1), n = u.charCodeAt(2), l = u.charCodeAt(3), a = this.length - 4; a >= 0; --a)
      if (this.data[a] === v && this.data[a + 1] === f && this.data[a + 2] === n && this.data[a + 3] === l)
        return a - this.zero;
    return -1;
  }, m.prototype.readAndCheckSignature = function(u) {
    var v = u.charCodeAt(0), f = u.charCodeAt(1), n = u.charCodeAt(2), l = u.charCodeAt(3), a = this.readData(4);
    return v === a[0] && f === a[1] && n === a[2] && l === a[3];
  }, m.prototype.readData = function(u) {
    if (this.checkOffset(u), u === 0)
      return [];
    var v = this.data.slice(this.zero + this.index, this.zero + this.index + u);
    return this.index += u, v;
  }, nn = m, nn;
}
var an, lo;
function pf() {
  if (lo) return an;
  lo = 1;
  var d = fl(), h = Ee();
  function m(u) {
    d.call(this, u);
  }
  return h.inherits(m, d), m.prototype.byteAt = function(u) {
    return this.data.charCodeAt(this.zero + u);
  }, m.prototype.lastIndexOfSignature = function(u) {
    return this.data.lastIndexOf(u) - this.zero;
  }, m.prototype.readAndCheckSignature = function(u) {
    var v = this.readData(4);
    return u === v;
  }, m.prototype.readData = function(u) {
    this.checkOffset(u);
    var v = this.data.slice(this.zero + this.index, this.zero + this.index + u);
    return this.index += u, v;
  }, an = m, an;
}
var sn, fo;
function cl() {
  if (fo) return sn;
  fo = 1;
  var d = ul(), h = Ee();
  function m(u) {
    d.call(this, u);
  }
  return h.inherits(m, d), m.prototype.readData = function(u) {
    if (this.checkOffset(u), u === 0)
      return new Uint8Array(0);
    var v = this.data.subarray(this.zero + this.index, this.zero + this.index + u);
    return this.index += u, v;
  }, sn = m, sn;
}
var on, uo;
function mf() {
  if (uo) return on;
  uo = 1;
  var d = cl(), h = Ee();
  function m(u) {
    d.call(this, u);
  }
  return h.inherits(m, d), m.prototype.readData = function(u) {
    this.checkOffset(u);
    var v = this.data.slice(this.zero + this.index, this.zero + this.index + u);
    return this.index += u, v;
  }, on = m, on;
}
var ln, co;
function hl() {
  if (co) return ln;
  co = 1;
  var d = Ee(), h = lt(), m = ul(), u = pf(), v = mf(), f = cl();
  return ln = function(n) {
    var l = d.getTypeOf(n);
    return d.checkSupport(l), l === "string" && !h.uint8array ? new u(n) : l === "nodebuffer" ? new v(n) : h.uint8array ? new f(d.transformTo("uint8array", n)) : new m(d.transformTo("array", n));
  }, ln;
}
var fn, ho;
function gf() {
  if (ho) return fn;
  ho = 1;
  var d = hl(), h = Ee(), m = On(), u = Nn(), v = Kt(), f = ol(), n = lt(), l = 0, a = 3, o = function(e) {
    for (var t in f)
      if (Object.prototype.hasOwnProperty.call(f, t) && f[t].magic === e)
        return f[t];
    return null;
  };
  function r(e, t) {
    this.options = e, this.loadOptions = t;
  }
  return r.prototype = {
    /**
     * say if the file is encrypted.
     * @return {boolean} true if the file is encrypted, false otherwise.
     */
    isEncrypted: function() {
      return (this.bitFlag & 1) === 1;
    },
    /**
     * say if the file has utf-8 filename/comment.
     * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
     */
    useUTF8: function() {
      return (this.bitFlag & 2048) === 2048;
    },
    /**
     * Read the local part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readLocalPart: function(e) {
      var t, i;
      if (e.skip(22), this.fileNameLength = e.readInt(2), i = e.readInt(2), this.fileName = e.readData(this.fileNameLength), e.skip(i), this.compressedSize === -1 || this.uncompressedSize === -1)
        throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
      if (t = o(this.compressionMethod), t === null)
        throw new Error("Corrupted zip : compression " + h.pretty(this.compressionMethod) + " unknown (inner file : " + h.transformTo("string", this.fileName) + ")");
      this.decompressed = new m(this.compressedSize, this.uncompressedSize, this.crc32, t, e.readData(this.compressedSize));
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readCentralPart: function(e) {
      this.versionMadeBy = e.readInt(2), e.skip(2), this.bitFlag = e.readInt(2), this.compressionMethod = e.readString(2), this.date = e.readDate(), this.crc32 = e.readInt(4), this.compressedSize = e.readInt(4), this.uncompressedSize = e.readInt(4);
      var t = e.readInt(2);
      if (this.extraFieldsLength = e.readInt(2), this.fileCommentLength = e.readInt(2), this.diskNumberStart = e.readInt(2), this.internalFileAttributes = e.readInt(2), this.externalFileAttributes = e.readInt(4), this.localHeaderOffset = e.readInt(4), this.isEncrypted())
        throw new Error("Encrypted zip are not supported");
      e.skip(t), this.readExtraFields(e), this.parseZIP64ExtraField(e), this.fileComment = e.readData(this.fileCommentLength);
    },
    /**
     * Parse the external file attributes and get the unix/dos permissions.
     */
    processAttributes: function() {
      this.unixPermissions = null, this.dosPermissions = null;
      var e = this.versionMadeBy >> 8;
      this.dir = !!(this.externalFileAttributes & 16), e === l && (this.dosPermissions = this.externalFileAttributes & 63), e === a && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), !this.dir && this.fileNameStr.slice(-1) === "/" && (this.dir = !0);
    },
    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function() {
      if (this.extraFields[1]) {
        var e = d(this.extraFields[1].value);
        this.uncompressedSize === h.MAX_VALUE_32BITS && (this.uncompressedSize = e.readInt(8)), this.compressedSize === h.MAX_VALUE_32BITS && (this.compressedSize = e.readInt(8)), this.localHeaderOffset === h.MAX_VALUE_32BITS && (this.localHeaderOffset = e.readInt(8)), this.diskNumberStart === h.MAX_VALUE_32BITS && (this.diskNumberStart = e.readInt(4));
      }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function(e) {
      var t = e.index + this.extraFieldsLength, i, s, c;
      for (this.extraFields || (this.extraFields = {}); e.index + 4 < t; )
        i = e.readInt(2), s = e.readInt(2), c = e.readData(s), this.extraFields[i] = {
          id: i,
          length: s,
          value: c
        };
      e.setIndex(t);
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function() {
      var e = n.uint8array ? "uint8array" : "array";
      if (this.useUTF8())
        this.fileNameStr = v.utf8decode(this.fileName), this.fileCommentStr = v.utf8decode(this.fileComment);
      else {
        var t = this.findExtraFieldUnicodePath();
        if (t !== null)
          this.fileNameStr = t;
        else {
          var i = h.transformTo(e, this.fileName);
          this.fileNameStr = this.loadOptions.decodeFileName(i);
        }
        var s = this.findExtraFieldUnicodeComment();
        if (s !== null)
          this.fileCommentStr = s;
        else {
          var c = h.transformTo(e, this.fileComment);
          this.fileCommentStr = this.loadOptions.decodeFileName(c);
        }
      }
    },
    /**
     * Find the unicode path declared in the extra field, if any.
     * @return {String} the unicode path, null otherwise.
     */
    findExtraFieldUnicodePath: function() {
      var e = this.extraFields[28789];
      if (e) {
        var t = d(e.value);
        return t.readInt(1) !== 1 || u(this.fileName) !== t.readInt(4) ? null : v.utf8decode(t.readData(e.length - 5));
      }
      return null;
    },
    /**
     * Find the unicode comment declared in the extra field, if any.
     * @return {String} the unicode comment, null otherwise.
     */
    findExtraFieldUnicodeComment: function() {
      var e = this.extraFields[25461];
      if (e) {
        var t = d(e.value);
        return t.readInt(1) !== 1 || u(this.fileComment) !== t.readInt(4) ? null : v.utf8decode(t.readData(e.length - 5));
      }
      return null;
    }
  }, fn = r, fn;
}
var un, po;
function vf() {
  if (po) return un;
  po = 1;
  var d = hl(), h = Ee(), m = ll(), u = gf(), v = lt();
  function f(n) {
    this.files = [], this.loadOptions = n;
  }
  return f.prototype = {
    /**
     * Check that the reader is on the specified signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function(n) {
      if (!this.reader.readAndCheckSignature(n)) {
        this.reader.index -= 4;
        var l = this.reader.readString(4);
        throw new Error("Corrupted zip or bug: unexpected signature (" + h.pretty(l) + ", expected " + h.pretty(n) + ")");
      }
    },
    /**
     * Check if the given signature is at the given index.
     * @param {number} askedIndex the index to check.
     * @param {string} expectedSignature the signature to expect.
     * @return {boolean} true if the signature is here, false otherwise.
     */
    isSignature: function(n, l) {
      var a = this.reader.index;
      this.reader.setIndex(n);
      var o = this.reader.readString(4), r = o === l;
      return this.reader.setIndex(a), r;
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function() {
      this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
      var n = this.reader.readData(this.zipCommentLength), l = v.uint8array ? "uint8array" : "array", a = h.transformTo(l, n);
      this.zipComment = this.loadOptions.decodeFileName(a);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function() {
      this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
      for (var n = this.zip64EndOfCentralSize - 44, l = 0, a, o, r; l < n; )
        a = this.reader.readInt(2), o = this.reader.readInt(4), r = this.reader.readData(o), this.zip64ExtensibleData[a] = {
          id: a,
          length: o,
          value: r
        };
    },
    /**
     * Read the end of the Zip 64 central directory locator.
     */
    readBlockZip64EndOfCentralLocator: function() {
      if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), this.disksCount > 1)
        throw new Error("Multi-volumes zip are not supported");
    },
    /**
     * Read the local files, based on the offset read in the central part.
     */
    readLocalFiles: function() {
      var n, l;
      for (n = 0; n < this.files.length; n++)
        l = this.files[n], this.reader.setIndex(l.localHeaderOffset), this.checkSignature(m.LOCAL_FILE_HEADER), l.readLocalPart(this.reader), l.handleUTF8(), l.processAttributes();
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function() {
      var n;
      for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(m.CENTRAL_FILE_HEADER); )
        n = new u({
          zip64: this.zip64
        }, this.loadOptions), n.readCentralPart(this.reader), this.files.push(n);
      if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0)
        throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function() {
      var n = this.reader.lastIndexOfSignature(m.CENTRAL_DIRECTORY_END);
      if (n < 0) {
        var l = !this.isSignature(0, m.LOCAL_FILE_HEADER);
        throw l ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
      }
      this.reader.setIndex(n);
      var a = n;
      if (this.checkSignature(m.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === h.MAX_VALUE_16BITS || this.diskWithCentralDirStart === h.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === h.MAX_VALUE_16BITS || this.centralDirRecords === h.MAX_VALUE_16BITS || this.centralDirSize === h.MAX_VALUE_32BITS || this.centralDirOffset === h.MAX_VALUE_32BITS) {
        if (this.zip64 = !0, n = this.reader.lastIndexOfSignature(m.ZIP64_CENTRAL_DIRECTORY_LOCATOR), n < 0)
          throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
        if (this.reader.setIndex(n), this.checkSignature(m.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, m.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(m.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0))
          throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
        this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(m.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
      }
      var o = this.centralDirOffset + this.centralDirSize;
      this.zip64 && (o += 20, o += 12 + this.zip64EndOfCentralSize);
      var r = a - o;
      if (r > 0)
        this.isSignature(a, m.CENTRAL_FILE_HEADER) || (this.reader.zero = r);
      else if (r < 0)
        throw new Error("Corrupted zip: missing " + Math.abs(r) + " bytes.");
    },
    prepareReader: function(n) {
      this.reader = d(n);
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function(n) {
      this.prepareReader(n), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
    }
  }, un = f, un;
}
var cn, mo;
function yf() {
  if (mo) return cn;
  mo = 1;
  var d = Ee(), h = zt(), m = Kt(), u = vf(), v = tl(), f = kr();
  function n(l) {
    return new h.Promise(function(a, o) {
      var r = l.decompressed.getContentWorker().pipe(new v());
      r.on("error", function(e) {
        o(e);
      }).on("end", function() {
        r.streamInfo.crc32 !== l.decompressed.crc32 ? o(new Error("Corrupted zip : CRC32 mismatch")) : a();
      }).resume();
    });
  }
  return cn = function(l, a) {
    var o = this;
    return a = d.extend(a || {}, {
      base64: !1,
      checkCRC32: !1,
      optimizedBinaryString: !1,
      createFolders: !1,
      decodeFileName: m.utf8decode
    }), f.isNode && f.isStream(l) ? h.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : d.prepareContent("the loaded zip file", l, !0, a.optimizedBinaryString, a.base64).then(function(r) {
      var e = new u(a);
      return e.load(r), e;
    }).then(function(e) {
      var t = [h.Promise.resolve(e)], i = e.files;
      if (a.checkCRC32)
        for (var s = 0; s < i.length; s++)
          t.push(n(i[s]));
      return h.Promise.all(t);
    }).then(function(e) {
      for (var t = e.shift(), i = t.files, s = 0; s < i.length; s++) {
        var c = i[s], y = c.fileNameStr, g = d.resolve(c.fileNameStr);
        o.file(g, c.decompressed, {
          binary: !0,
          optimizedBinaryString: !0,
          date: c.date,
          dir: c.dir,
          comment: c.fileCommentStr.length ? c.fileCommentStr : null,
          unixPermissions: c.unixPermissions,
          dosPermissions: c.dosPermissions,
          createFolders: a.createFolders
        }), c.dir || (o.file(g).unsafeOriginalName = y);
      }
      return t.zipComment.length && (o.comment = t.zipComment), o;
    });
  }, cn;
}
var hn, go;
function _f() {
  if (go) return hn;
  go = 1;
  function d() {
    if (!(this instanceof d))
      return new d();
    if (arguments.length)
      throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
      var h = new d();
      for (var m in this)
        typeof this[m] != "function" && (h[m] = this[m]);
      return h;
    };
  }
  return d.prototype = df(), d.prototype.loadAsync = yf(), d.support = lt(), d.defaults = Qo(), d.version = "3.10.1", d.loadAsync = function(h, m) {
    return new d().loadAsync(h, m);
  }, d.external = zt(), hn = d, hn;
}
var bf = _f();
const wf = /* @__PURE__ */ bo(bf);
let dn = null;
ht.setName("com.zincs.kpa-electron");
const dl = () => {
  dn = new yo({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: ae.join(import.meta.dirname, "../preload/preload.js")
    },
    autoHideMenuBar: !0
  }), ht.isPackaged ? dn.loadFile(ae.join(import.meta.dirname, "../../index.html")) : dn.loadURL("http://localhost:1420");
};
let st, pn, mn, gn, vn;
function Se() {
  return st || (st = ae.join(ht.getPath("userData")), pn = ae.join(st, "charts"), mn = ae.join(st, "trash"), gn = ae.join(st, "respack"), vn = ae.join(st, "downloads")), { APP_DATA_DIR: st, CHART_DIR: pn, TRASH_DIR: mn, RESPACK_DIR: gn, DOWNLOAD_DIR: vn };
}
async function Xe(d) {
  try {
    await pe.access(d);
  } catch {
    await pe.mkdir(d, { recursive: !0 });
  }
}
async function ot(d) {
  try {
    return await pe.access(d), !0;
  } catch {
    return !1;
  }
}
async function In(d) {
  return (await pe.readdir(d, { withFileTypes: !0 })).map((m) => ({ name: m.name, isDirectory: m.isDirectory() }));
}
we.handle("fs:queryMeta", async () => {
  const { APP_DATA_DIR: d, CHART_DIR: h, TRASH_DIR: m, RESPACK_DIR: u, DOWNLOAD_DIR: v } = Se();
  return { APP_DATA_DIR: d, CHART_DIR: h, TRASH_DIR: m, RESPACK_DIR: u, DOWNLOAD_DIR: v };
});
we.handle("fs:queryCharts", async () => {
  var u;
  const { CHART_DIR: d } = Se(), h = await In(d), m = [];
  for (const v of h)
    if (v.isDirectory)
      try {
        const f = JSON.parse(await pe.readFile(ae.join(d, v.name, "metadata.json"), "utf-8")), n = await Dn(v.name);
        m.push({
          chartPath: f.chart,
          identifier: v.name,
          title: f.title,
          illustration: f.illustration,
          // 返回文件名，由前端加载
          type: f.type,
          lastModified: ((u = n == null ? void 0 : n[n.length - 1]) == null ? void 0 : u.time) ?? 0
        });
      } catch (f) {
        console.error(`Failed to read chart ${v.name}:`, f);
      }
  return m.sort((v, f) => f.lastModified - v.lastModified), m;
});
we.handle("fs:queryChartMeta", async (d, h) => {
  const { CHART_DIR: m } = Se(), u = ae.join(m, h, "metadata.json");
  return JSON.parse(await pe.readFile(u, "utf-8"));
});
async function Dn(d) {
  const { CHART_DIR: h } = Se(), m = ae.join(h, d, "history.json");
  if (!await ot(m)) return null;
  try {
    const u = JSON.parse(await pe.readFile(m, "utf-8"));
    return Array.isArray(u) ? u : null;
  } catch {
    return null;
  }
}
we.handle("fs:queryChartHistory", async (d, h) => Dn(h));
we.handle("fs:saveChartMeta", async (d, h, m) => {
  const { CHART_DIR: u } = Se(), v = ae.join(u, h, "metadata.json");
  await pe.writeFile(v, JSON.stringify(m, null, 2), "utf-8");
});
we.handle("fs:saveChart", async (d, h, m, u, v = !1) => {
  const { CHART_DIR: f } = Se(), n = JSON.parse(await pe.readFile(ae.join(f, h, "metadata.json"), "utf-8")), l = v ? JSON.stringify(m, null, 2) : JSON.stringify(m), a = /* @__PURE__ */ new Date(), r = `chart.${a.toISOString().replace(/:/g, "-").replace(/\./g, "_").replace(/T/g, " ").replace(/Z/g, "")}.kpa2.json`;
  n.chart = r, n.type !== "KPA2" && (n.type = "KPA2");
  const e = ae.join(f, h, "history.json");
  let t = await Dn(h) || [];
  t.push({
    summary: u,
    filename: r,
    time: a.getTime()
  }), await pe.writeFile(e, JSON.stringify(t, null, 2), "utf-8"), await pe.writeFile(ae.join(f, h, "metadata.json"), JSON.stringify(n, null, 2), "utf-8"), await pe.writeFile(ae.join(f, h, r), l, "utf-8");
});
we.handle("fs:getChartData", async (d, h) => {
  const { CHART_DIR: m } = Se(), u = JSON.parse(await pe.readFile(ae.join(m, h, "metadata.json"), "utf-8"));
  return { chartData: JSON.parse(await pe.readFile(ae.join(m, h, u.chart), "utf-8")), chartType: u.type, durationSecs: u.durationSecs };
});
we.handle("fs:getChartProjectData", async (d, h) => {
  const { CHART_DIR: m } = Se(), u = JSON.parse(await pe.readFile(ae.join(m, h, "metadata.json"), "utf-8")), v = JSON.parse(await pe.readFile(ae.join(m, h, u.chart), "utf-8")), f = await pe.readFile(ae.join(m, h, u.music)), n = await pe.readFile(ae.join(m, h, u.illustration));
  return {
    chartData: v,
    chartType: u.type,
    durationSecs: u.durationSecs,
    music: f,
    illustration: n
  };
});
we.handle("fs:readChart", async (d, h, m) => {
  const { CHART_DIR: u } = Se();
  return JSON.parse(await pe.readFile(ae.join(u, h, m), "utf-8"));
});
we.handle("fs:readAFileInChart", async (d, h, m) => {
  const { CHART_DIR: u } = Se();
  return await pe.readFile(ae.join(u, h, m));
});
we.handle("fs:loadChartImage", async (d, h, m) => {
  const { CHART_DIR: u } = Se(), v = ae.join(u, h, m);
  return await pe.readFile(v);
});
we.handle("fs:saveAFileToChart", async (d, h, m, u) => {
  const { CHART_DIR: v } = Se();
  await pe.writeFile(ae.join(v, h, m), new Uint8Array(u));
});
we.handle("fs:disposeChart", async (d, h) => {
  const { CHART_DIR: m, TRASH_DIR: u } = Se();
  await Xe(u), await pe.rename(ae.join(m, h), ae.join(u, h));
});
we.handle("fs:getTextures", async (d, h) => {
  const { CHART_DIR: m } = Se(), u = ae.join(m, h, "textures");
  if (!await ot(u)) return [];
  const f = (await In(u)).filter((n) => !n.isDirectory).map((n) => n.name).filter((n) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(n));
  return f.includes("line.png") || f.push("line.png"), f;
});
we.handle("fs:uploadTexture", async (d, h, m, u) => {
  const { CHART_DIR: v } = Se(), f = ae.join(v, h, "textures");
  await Xe(f), await pe.writeFile(ae.join(f, m), new Uint8Array(u));
});
we.handle("fs:fetchTexture", async (d, h, m) => {
  const { CHART_DIR: u } = Se(), v = ae.join(u, h, "textures");
  let f = ae.join(v, m);
  return !await ot(f) && (f = ae.join(u, h, m), !await ot(f)) ? null : await pe.readFile(f);
});
we.handle("fs:queryRespackList", async () => {
  const { RESPACK_DIR: d } = Se(), h = await In(d), m = [];
  for (const u of h)
    if (u.isDirectory) {
      const v = ae.join(d, u.name, "info.yml");
      if (await ot(v))
        try {
          const f = jl.parse(await pe.readFile(v, "utf-8"));
          f.name && m.push({
            pathname: ae.join(d, u.name),
            name: f.name,
            shortPathname: u.name
          });
        } catch (f) {
          console.error(f);
        }
    }
  return m;
});
we.handle("fs:getFileInRespack", async (d, h, m) => {
  const { RESPACK_DIR: u } = Se();
  if (h === "Default") return null;
  const v = ae.join(u, h, m);
  return await ot(v) ? await pe.readFile(v) : null;
});
we.handle("fs:uploadRespack", async (d, h, m) => {
  const { RESPACK_DIR: u } = Se(), v = ae.join(u, h);
  if (await ot(v)) throw new Error("Occupied.");
  const f = await wf.loadAsync(m);
  await pe.mkdir(v, { recursive: !0 });
  for (const [n, l] of Object.entries(f.files))
    if (!l.dir) {
      const a = ae.join(v, n);
      await pe.mkdir(ae.dirname(a), { recursive: !0 }), await pe.writeFile(a, await l.async("nodebuffer"));
    }
});
we.handle("fs:downloadFile", async (d, h, m, u = !1) => {
  const { DOWNLOAD_DIR: v } = Se();
  await Xe(v);
  const f = ae.join(v, h);
  await pe.writeFile(f, m), u && vo.showItemInFolder(f);
});
we.handle("fs:checkChartDirExists", async (d, h) => {
  const { CHART_DIR: m } = Se();
  return await ot(ae.join(m, h));
});
we.handle("fs:createChartDir", async (d, h) => {
  const { CHART_DIR: m } = Se(), u = ae.join(m, h);
  await Xe(u);
});
we.handle("fs:saveTextFile", async (d, h, m, u) => {
  const { CHART_DIR: v } = Se(), f = ae.join(v, h, m);
  await pe.writeFile(f, u, "utf-8");
});
we.handle("fs:saveBinaryFile", async (d, h, m, u) => {
  const { CHART_DIR: v } = Se(), f = ae.join(v, h, m);
  await pe.writeFile(f, new Uint8Array(u));
});
we.handle("fs:createNestedDir", async (d, h, m) => {
  const { CHART_DIR: u } = Se(), v = ae.join(u, h, m);
  await Xe(v);
});
async function pl(d) {
  const { CHART_DIR: h } = Se(), m = ae.join(h, d.id);
  await Xe(m);
  const u = {
    title: d.title,
    chart: `chart.${d.chartType === "RPE" ? "rpe" : "kpa"}.json`,
    music: `music.${d.musicExtension}`,
    illustration: `illustration.${d.illustrationExtension}`,
    type: d.chartType,
    durationSecs: d.durationSecs
  };
  if (await pe.writeFile(
    ae.join(m, "metadata.json"),
    JSON.stringify(u, null, 4),
    "utf-8"
  ), await pe.writeFile(
    ae.join(m, u.chart),
    d.chartContent,
    "utf-8"
  ), await pe.writeFile(
    ae.join(m, u.music),
    new Uint8Array(d.musicData)
  ), await pe.writeFile(
    ae.join(m, u.illustration),
    new Uint8Array(d.illustrationData)
  ), d.extraFiles)
    for (const v of d.extraFiles) {
      const f = ae.join(m, v.name);
      await pe.mkdir(ae.dirname(f), { recursive: !0 }), await pe.writeFile(f, new Uint8Array(v.data));
    }
  return d.id;
}
we.handle("fs:importChart", async (d, h) => pl(h));
we.handle("fs:saveChartProject", async (d, h) => pl(h));
we.handle("shell:openPath", async (d, h) => {
  vo.showItemInFolder(h);
});
Se();
Promise.all([
  Xe(st),
  Xe(pn),
  Xe(mn),
  Xe(gn),
  Xe(vn),
  ht.whenReady()
]).then(() => {
  dl();
});
ht.on("window-all-closed", () => {
  process.platform !== "darwin" && ht.quit();
});
ht.on("activate", () => {
  yo.getAllWindows().length === 0 && dl();
});
