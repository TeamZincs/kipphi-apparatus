import lr, { app as Wt, protocol as om, ipcMain as Ue, shell as lm, BrowserWindow as um, net as bu } from "electron";
import * as Ie from "path";
import Ye from "path";
import * as xe from "fs/promises";
import Pl from "process";
import xl from "buffer";
import ur from "stream";
import Ll from "events";
import Pr from "util";
import Kt, { existsSync as T0 } from "fs";
import O0 from "constants";
import cm from "assert";
import gi from "child_process";
import _n from "crypto";
import fm from "tty";
import vi from "os";
import Vt from "url";
import dm from "zlib";
import k0 from "http";
var Me = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function hm(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var qe = {}, Bi = {}, ji = {}, st = {}, Eu;
function Fe() {
  if (Eu) return st;
  Eu = 1;
  const o = Symbol.for("yaml.alias"), d = Symbol.for("yaml.document"), p = Symbol.for("yaml.map"), c = Symbol.for("yaml.pair"), h = Symbol.for("yaml.scalar"), u = Symbol.for("yaml.seq"), n = Symbol.for("yaml.node.type"), l = (m) => !!m && typeof m == "object" && m[n] === o, i = (m) => !!m && typeof m == "object" && m[n] === d, a = (m) => !!m && typeof m == "object" && m[n] === p, r = (m) => !!m && typeof m == "object" && m[n] === c, e = (m) => !!m && typeof m == "object" && m[n] === h, t = (m) => !!m && typeof m == "object" && m[n] === u;
  function s(m) {
    if (m && typeof m == "object")
      switch (m[n]) {
        case p:
        case u:
          return !0;
      }
    return !1;
  }
  function f(m) {
    if (m && typeof m == "object")
      switch (m[n]) {
        case o:
        case p:
        case h:
        case u:
          return !0;
      }
    return !1;
  }
  const g = (m) => (e(m) || s(m)) && !!m.anchor;
  return st.ALIAS = o, st.DOC = d, st.MAP = p, st.NODE_TYPE = n, st.PAIR = c, st.SCALAR = h, st.SEQ = u, st.hasAnchor = g, st.isAlias = l, st.isCollection = s, st.isDocument = i, st.isMap = a, st.isNode = f, st.isPair = r, st.isScalar = e, st.isSeq = t, st;
}
var qn = {}, Su;
function yi() {
  if (Su) return qn;
  Su = 1;
  var o = Fe();
  const d = Symbol("break visit"), p = Symbol("skip children"), c = Symbol("remove node");
  function h(e, t) {
    const s = i(t);
    o.isDocument(e) ? u(null, e.contents, s, Object.freeze([e])) === c && (e.contents = null) : u(null, e, s, Object.freeze([]));
  }
  h.BREAK = d, h.SKIP = p, h.REMOVE = c;
  function u(e, t, s, f) {
    const g = a(e, t, s, f);
    if (o.isNode(g) || o.isPair(g))
      return r(e, f, g), u(e, g, s, f);
    if (typeof g != "symbol") {
      if (o.isCollection(t)) {
        f = Object.freeze(f.concat(t));
        for (let m = 0; m < t.items.length; ++m) {
          const v = u(m, t.items[m], s, f);
          if (typeof v == "number")
            m = v - 1;
          else {
            if (v === d)
              return d;
            v === c && (t.items.splice(m, 1), m -= 1);
          }
        }
      } else if (o.isPair(t)) {
        f = Object.freeze(f.concat(t));
        const m = u("key", t.key, s, f);
        if (m === d)
          return d;
        m === c && (t.key = null);
        const v = u("value", t.value, s, f);
        if (v === d)
          return d;
        v === c && (t.value = null);
      }
    }
    return g;
  }
  async function n(e, t) {
    const s = i(t);
    o.isDocument(e) ? await l(null, e.contents, s, Object.freeze([e])) === c && (e.contents = null) : await l(null, e, s, Object.freeze([]));
  }
  n.BREAK = d, n.SKIP = p, n.REMOVE = c;
  async function l(e, t, s, f) {
    const g = await a(e, t, s, f);
    if (o.isNode(g) || o.isPair(g))
      return r(e, f, g), l(e, g, s, f);
    if (typeof g != "symbol") {
      if (o.isCollection(t)) {
        f = Object.freeze(f.concat(t));
        for (let m = 0; m < t.items.length; ++m) {
          const v = await l(m, t.items[m], s, f);
          if (typeof v == "number")
            m = v - 1;
          else {
            if (v === d)
              return d;
            v === c && (t.items.splice(m, 1), m -= 1);
          }
        }
      } else if (o.isPair(t)) {
        f = Object.freeze(f.concat(t));
        const m = await l("key", t.key, s, f);
        if (m === d)
          return d;
        m === c && (t.key = null);
        const v = await l("value", t.value, s, f);
        if (v === d)
          return d;
        v === c && (t.value = null);
      }
    }
    return g;
  }
  function i(e) {
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
  function a(e, t, s, f) {
    var g, m, v, y, E;
    if (typeof s == "function")
      return s(e, t, f);
    if (o.isMap(t))
      return (g = s.Map) == null ? void 0 : g.call(s, e, t, f);
    if (o.isSeq(t))
      return (m = s.Seq) == null ? void 0 : m.call(s, e, t, f);
    if (o.isPair(t))
      return (v = s.Pair) == null ? void 0 : v.call(s, e, t, f);
    if (o.isScalar(t))
      return (y = s.Scalar) == null ? void 0 : y.call(s, e, t, f);
    if (o.isAlias(t))
      return (E = s.Alias) == null ? void 0 : E.call(s, e, t, f);
  }
  function r(e, t, s) {
    const f = t[t.length - 1];
    if (o.isCollection(f))
      f.items[e] = s;
    else if (o.isPair(f))
      e === "key" ? f.key = s : f.value = s;
    else if (o.isDocument(f))
      f.contents = s;
    else {
      const g = o.isAlias(f) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${g} parent`);
    }
  }
  return qn.visit = h, qn.visitAsync = n, qn;
}
var Au;
function pm() {
  if (Au) return ji;
  Au = 1;
  var o = Fe(), d = yi();
  const p = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  }, c = (u) => u.replace(/[!,[\]{}]/g, (n) => p[n]);
  class h {
    constructor(n, l) {
      this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, h.defaultYaml, n), this.tags = Object.assign({}, h.defaultTags, l);
    }
    clone() {
      const n = new h(this.yaml, this.tags);
      return n.docStart = this.docStart, n;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
      const n = new h(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = !0;
          break;
        case "1.2":
          this.atNextDocument = !1, this.yaml = {
            explicit: h.defaultYaml.explicit,
            version: "1.2"
          }, this.tags = Object.assign({}, h.defaultTags);
          break;
      }
      return n;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(n, l) {
      this.atNextDocument && (this.yaml = { explicit: h.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, h.defaultTags), this.atNextDocument = !1);
      const i = n.trim().split(/[ \t]+/), a = i.shift();
      switch (a) {
        case "%TAG": {
          if (i.length !== 2 && (l(0, "%TAG directive should contain exactly two parts"), i.length < 2))
            return !1;
          const [r, e] = i;
          return this.tags[r] = e, !0;
        }
        case "%YAML": {
          if (this.yaml.explicit = !0, i.length !== 1)
            return l(0, "%YAML directive should contain exactly one part"), !1;
          const [r] = i;
          if (r === "1.1" || r === "1.2")
            return this.yaml.version = r, !0;
          {
            const e = /^\d+\.\d+$/.test(r);
            return l(6, `Unsupported YAML version ${r}`, e), !1;
          }
        }
        default:
          return l(0, `Unknown directive ${a}`, !0), !1;
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
      const [, i, a] = n.match(/^(.*!)([^!]*)$/s);
      a || l(`The ${n} tag has no suffix`);
      const r = this.tags[i];
      if (r)
        try {
          return r + decodeURIComponent(a);
        } catch (e) {
          return l(String(e)), null;
        }
      return i === "!" ? n : (l(`Could not resolve tag: ${n}`), null);
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(n) {
      for (const [l, i] of Object.entries(this.tags))
        if (n.startsWith(i))
          return l + c(n.substring(i.length));
      return n[0] === "!" ? n : `!<${n}>`;
    }
    toString(n) {
      const l = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], i = Object.entries(this.tags);
      let a;
      if (n && i.length > 0 && o.isNode(n.contents)) {
        const r = {};
        d.visit(n.contents, (e, t) => {
          o.isNode(t) && t.tag && (r[t.tag] = !0);
        }), a = Object.keys(r);
      } else
        a = [];
      for (const [r, e] of i)
        r === "!!" && e === "tag:yaml.org,2002:" || (!n || a.some((t) => t.startsWith(e))) && l.push(`%TAG ${r} ${e}`);
      return l.join(`
`);
    }
  }
  return h.defaultYaml = { explicit: !1, version: "1.2" }, h.defaultTags = { "!!": "tag:yaml.org,2002:" }, ji.Directives = h, ji;
}
var Hi = {}, zi = {}, wr = {}, Cu;
function Fl() {
  if (Cu) return wr;
  Cu = 1;
  var o = Fe(), d = yi();
  function p(n) {
    if (/[\x00-\x19\s,[\]{}]/.test(n)) {
      const i = `Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;
      throw new Error(i);
    }
    return !0;
  }
  function c(n) {
    const l = /* @__PURE__ */ new Set();
    return d.visit(n, {
      Value(i, a) {
        a.anchor && l.add(a.anchor);
      }
    }), l;
  }
  function h(n, l) {
    for (let i = 1; ; ++i) {
      const a = `${n}${i}`;
      if (!l.has(a))
        return a;
    }
  }
  function u(n, l) {
    const i = [], a = /* @__PURE__ */ new Map();
    let r = null;
    return {
      onAnchor: (e) => {
        i.push(e), r ?? (r = c(n));
        const t = h(l, r);
        return r.add(t), t;
      },
      /**
       * With circular references, the source node is only resolved after all
       * of its child nodes are. This is why anchors are set only after all of
       * the nodes have been created.
       */
      setAnchors: () => {
        for (const e of i) {
          const t = a.get(e);
          if (typeof t == "object" && t.anchor && (o.isScalar(t.node) || o.isCollection(t.node)))
            t.node.anchor = t.anchor;
          else {
            const s = new Error("Failed to resolve repeated object (this should not happen)");
            throw s.source = e, s;
          }
        }
      },
      sourceObjects: a
    };
  }
  return wr.anchorIsValid = p, wr.anchorNames = c, wr.createNodeAnchors = u, wr.findNewAnchor = h, wr;
}
var Gi = {}, Wi = {}, Ru;
function mm() {
  if (Ru) return Wi;
  Ru = 1;
  function o(d, p, c, h) {
    if (h && typeof h == "object")
      if (Array.isArray(h))
        for (let u = 0, n = h.length; u < n; ++u) {
          const l = h[u], i = o(d, h, String(u), l);
          i === void 0 ? delete h[u] : i !== l && (h[u] = i);
        }
      else if (h instanceof Map)
        for (const u of Array.from(h.keys())) {
          const n = h.get(u), l = o(d, h, u, n);
          l === void 0 ? h.delete(u) : l !== n && h.set(u, l);
        }
      else if (h instanceof Set)
        for (const u of Array.from(h)) {
          const n = o(d, h, u, u);
          n === void 0 ? h.delete(u) : n !== u && (h.delete(u), h.add(n));
        }
      else
        for (const [u, n] of Object.entries(h)) {
          const l = o(d, h, u, n);
          l === void 0 ? delete h[u] : l !== n && (h[u] = l);
        }
    return d.call(p, c, h);
  }
  return Wi.applyReviver = o, Wi;
}
var Yi = {}, Tu;
function cr() {
  if (Tu) return Yi;
  Tu = 1;
  var o = Fe();
  function d(p, c, h) {
    if (Array.isArray(p))
      return p.map((u, n) => d(u, String(n), h));
    if (p && typeof p.toJSON == "function") {
      if (!h || !o.hasAnchor(p))
        return p.toJSON(c, h);
      const u = { aliasCount: 0, count: 1, res: void 0 };
      h.anchors.set(p, u), h.onCreate = (l) => {
        u.res = l, delete h.onCreate;
      };
      const n = p.toJSON(c, h);
      return h.onCreate && h.onCreate(n), n;
    }
    return typeof p == "bigint" && !(h != null && h.keep) ? Number(p) : p;
  }
  return Yi.toJS = d, Yi;
}
var Ou;
function Ul() {
  if (Ou) return Gi;
  Ou = 1;
  var o = mm(), d = Fe(), p = cr();
  class c {
    constructor(u) {
      Object.defineProperty(this, d.NODE_TYPE, { value: u });
    }
    /** Create a copy of this node.  */
    clone() {
      const u = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return this.range && (u.range = this.range.slice()), u;
    }
    /** A plain JavaScript representation of this node. */
    toJS(u, { mapAsMap: n, maxAliasCount: l, onAnchor: i, reviver: a } = {}) {
      if (!d.isDocument(u))
        throw new TypeError("A document argument is required");
      const r = {
        anchors: /* @__PURE__ */ new Map(),
        doc: u,
        keep: !0,
        mapAsMap: n === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof l == "number" ? l : 100
      }, e = p.toJS(this, "", r);
      if (typeof i == "function")
        for (const { count: t, res: s } of r.anchors.values())
          i(s, t);
      return typeof a == "function" ? o.applyReviver(a, { "": e }, "", e) : e;
    }
  }
  return Gi.NodeBase = c, Gi;
}
var ku;
function wi() {
  if (ku) return zi;
  ku = 1;
  var o = Fl(), d = yi(), p = Fe(), c = Ul(), h = cr();
  let u = class extends c.NodeBase {
    constructor(i) {
      super(p.ALIAS), this.source = i, Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(i, a) {
      let r;
      a != null && a.aliasResolveCache ? r = a.aliasResolveCache : (r = [], d.visit(i, {
        Node: (t, s) => {
          (p.isAlias(s) || p.hasAnchor(s)) && r.push(s);
        }
      }), a && (a.aliasResolveCache = r));
      let e;
      for (const t of r) {
        if (t === this)
          break;
        t.anchor === this.source && (e = t);
      }
      return e;
    }
    toJSON(i, a) {
      if (!a)
        return { source: this.source };
      const { anchors: r, doc: e, maxAliasCount: t } = a, s = this.resolve(e, a);
      if (!s) {
        const g = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(g);
      }
      let f = r.get(s);
      if (f || (h.toJS(s, null, a), f = r.get(s)), (f == null ? void 0 : f.res) === void 0) {
        const g = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(g);
      }
      if (t >= 0 && (f.count += 1, f.aliasCount === 0 && (f.aliasCount = n(e, s, r)), f.count * f.aliasCount > t)) {
        const g = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(g);
      }
      return f.res;
    }
    toString(i, a, r) {
      const e = `*${this.source}`;
      if (i) {
        if (o.anchorIsValid(this.source), i.options.verifyAliasOrder && !i.anchors.has(this.source)) {
          const t = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(t);
        }
        if (i.implicitKey)
          return `${e} `;
      }
      return e;
    }
  };
  function n(l, i, a) {
    if (p.isAlias(i)) {
      const r = i.resolve(l), e = a && r && a.get(r);
      return e ? e.count * e.aliasCount : 0;
    } else if (p.isCollection(i)) {
      let r = 0;
      for (const e of i.items) {
        const t = n(l, e, a);
        t > r && (r = t);
      }
      return r;
    } else if (p.isPair(i)) {
      const r = n(l, i.key, a), e = n(l, i.value, a);
      return Math.max(r, e);
    }
    return 1;
  }
  return zi.Alias = u, zi;
}
var qr = {}, Ki = {}, Mn = {}, Nu;
function nt() {
  if (Nu) return Mn;
  Nu = 1;
  var o = Fe(), d = Ul(), p = cr();
  const c = (u) => !u || typeof u != "function" && typeof u != "object";
  let h = class extends d.NodeBase {
    constructor(n) {
      super(o.SCALAR), this.value = n;
    }
    toJSON(n, l) {
      return l != null && l.keep ? this.value : p.toJS(this.value, n, l);
    }
    toString() {
      return String(this.value);
    }
  };
  return h.BLOCK_FOLDED = "BLOCK_FOLDED", h.BLOCK_LITERAL = "BLOCK_LITERAL", h.PLAIN = "PLAIN", h.QUOTE_DOUBLE = "QUOTE_DOUBLE", h.QUOTE_SINGLE = "QUOTE_SINGLE", Mn.Scalar = h, Mn.isScalarValue = c, Mn;
}
var Iu;
function _i() {
  if (Iu) return Ki;
  Iu = 1;
  var o = wi(), d = Fe(), p = nt();
  const c = "tag:yaml.org,2002:";
  function h(n, l, i) {
    if (l) {
      const a = i.filter((e) => e.tag === l), r = a.find((e) => !e.format) ?? a[0];
      if (!r)
        throw new Error(`Tag ${l} not found`);
      return r;
    }
    return i.find((a) => {
      var r;
      return ((r = a.identify) == null ? void 0 : r.call(a, n)) && !a.format;
    });
  }
  function u(n, l, i) {
    var v, y, E;
    if (d.isDocument(n) && (n = n.contents), d.isNode(n))
      return n;
    if (d.isPair(n)) {
      const R = (y = (v = i.schema[d.MAP]).createNode) == null ? void 0 : y.call(v, i.schema, null, i);
      return R.items.push(n), R;
    }
    (n instanceof String || n instanceof Number || n instanceof Boolean || typeof BigInt < "u" && n instanceof BigInt) && (n = n.valueOf());
    const { aliasDuplicateObjects: a, onAnchor: r, onTagObj: e, schema: t, sourceObjects: s } = i;
    let f;
    if (a && n && typeof n == "object") {
      if (f = s.get(n), f)
        return f.anchor ?? (f.anchor = r(n)), new o.Alias(f.anchor);
      f = { anchor: null, node: null }, s.set(n, f);
    }
    l != null && l.startsWith("!!") && (l = c + l.slice(2));
    let g = h(n, l, t.tags);
    if (!g) {
      if (n && typeof n.toJSON == "function" && (n = n.toJSON()), !n || typeof n != "object") {
        const R = new p.Scalar(n);
        return f && (f.node = R), R;
      }
      g = n instanceof Map ? t[d.MAP] : Symbol.iterator in Object(n) ? t[d.SEQ] : t[d.MAP];
    }
    e && (e(g), delete i.onTagObj);
    const m = g != null && g.createNode ? g.createNode(i.schema, n, i) : typeof ((E = g == null ? void 0 : g.nodeClass) == null ? void 0 : E.from) == "function" ? g.nodeClass.from(i.schema, n, i) : new p.Scalar(n);
    return l ? m.tag = l : g.default || (m.tag = g.tag), f && (f.node = m), m;
  }
  return Ki.createNode = u, Ki;
}
var Du;
function $l() {
  if (Du) return qr;
  Du = 1;
  var o = _i(), d = Fe(), p = Ul();
  function c(n, l, i) {
    let a = i;
    for (let r = l.length - 1; r >= 0; --r) {
      const e = l[r];
      if (typeof e == "number" && Number.isInteger(e) && e >= 0) {
        const t = [];
        t[e] = a, a = t;
      } else
        a = /* @__PURE__ */ new Map([[e, a]]);
    }
    return o.createNode(a, void 0, {
      aliasDuplicateObjects: !1,
      keepUndefined: !1,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema: n,
      sourceObjects: /* @__PURE__ */ new Map()
    });
  }
  const h = (n) => n == null || typeof n == "object" && !!n[Symbol.iterator]().next().done;
  let u = class extends p.NodeBase {
    constructor(l, i) {
      super(l), Object.defineProperty(this, "schema", {
        value: i,
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
      const i = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      return l && (i.schema = l), i.items = i.items.map((a) => d.isNode(a) || d.isPair(a) ? a.clone(l) : a), this.range && (i.range = this.range.slice()), i;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(l, i) {
      if (h(l))
        this.add(i);
      else {
        const [a, ...r] = l, e = this.get(a, !0);
        if (d.isCollection(e))
          e.addIn(r, i);
        else if (e === void 0 && this.schema)
          this.set(a, c(this.schema, r, i));
        else
          throw new Error(`Expected YAML collection at ${a}. Remaining path: ${r}`);
      }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(l) {
      const [i, ...a] = l;
      if (a.length === 0)
        return this.delete(i);
      const r = this.get(i, !0);
      if (d.isCollection(r))
        return r.deleteIn(a);
      throw new Error(`Expected YAML collection at ${i}. Remaining path: ${a}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(l, i) {
      const [a, ...r] = l, e = this.get(a, !0);
      return r.length === 0 ? !i && d.isScalar(e) ? e.value : e : d.isCollection(e) ? e.getIn(r, i) : void 0;
    }
    hasAllNullValues(l) {
      return this.items.every((i) => {
        if (!d.isPair(i))
          return !1;
        const a = i.value;
        return a == null || l && d.isScalar(a) && a.value == null && !a.commentBefore && !a.comment && !a.tag;
      });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(l) {
      const [i, ...a] = l;
      if (a.length === 0)
        return this.has(i);
      const r = this.get(i, !0);
      return d.isCollection(r) ? r.hasIn(a) : !1;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(l, i) {
      const [a, ...r] = l;
      if (r.length === 0)
        this.set(a, i);
      else {
        const e = this.get(a, !0);
        if (d.isCollection(e))
          e.setIn(r, i);
        else if (e === void 0 && this.schema)
          this.set(a, c(this.schema, r, i));
        else
          throw new Error(`Expected YAML collection at ${a}. Remaining path: ${r}`);
      }
    }
  };
  return qr.Collection = u, qr.collectionFromPath = c, qr.isEmptyPath = h, qr;
}
var Bn = {}, Vi = {}, jn = {}, Mr = {}, Pu;
function bi() {
  if (Pu) return Mr;
  Pu = 1;
  const o = (c) => c.replace(/^(?!$)(?: $)?/gm, "#");
  function d(c, h) {
    return /^\n+$/.test(c) ? c.substring(1) : h ? c.replace(/^(?! *$)/gm, h) : c;
  }
  const p = (c, h, u) => c.endsWith(`
`) ? d(u, h) : u.includes(`
`) ? `
` + d(u, h) : (c.endsWith(" ") ? "" : " ") + u;
  return Mr.indentComment = d, Mr.lineComment = p, Mr.stringifyComment = o, Mr;
}
var Ji = {}, _r = {}, xu;
function N0() {
  if (xu) return _r;
  xu = 1;
  const o = "flow", d = "block", p = "quoted";
  function c(u, n, l = "flow", { indentAtStart: i, lineWidth: a = 80, minContentWidth: r = 20, onFold: e, onOverflow: t } = {}) {
    if (!a || a < 0)
      return u;
    a < r && (r = 0);
    const s = Math.max(1 + r, 1 + a - n.length);
    if (u.length <= s)
      return u;
    const f = [], g = {};
    let m = a - n.length;
    typeof i == "number" && (i > a - Math.max(2, r) ? f.push(0) : m = a - i);
    let v, y, E = !1, R = -1, C = -1, I = -1;
    l === d && (R = h(u, R, n.length), R !== -1 && (m = R + s));
    for (let O; O = u[R += 1]; ) {
      if (l === p && O === "\\") {
        switch (C = R, u[R + 1]) {
          case "x":
            R += 3;
            break;
          case "u":
            R += 5;
            break;
          case "U":
            R += 9;
            break;
          default:
            R += 1;
        }
        I = R;
      }
      if (O === `
`)
        l === d && (R = h(u, R, n.length)), m = R + n.length + s, v = void 0;
      else {
        if (O === " " && y && y !== " " && y !== `
` && y !== "	") {
          const A = u[R + 1];
          A && A !== " " && A !== `
` && A !== "	" && (v = R);
        }
        if (R >= m)
          if (v)
            f.push(v), m = v + s, v = void 0;
          else if (l === p) {
            for (; y === " " || y === "	"; )
              y = O, O = u[R += 1], E = !0;
            const A = R > I + 1 ? R - 2 : C - 1;
            if (g[A])
              return u;
            f.push(A), g[A] = !0, m = A + s, v = void 0;
          } else
            E = !0;
      }
      y = O;
    }
    if (E && t && t(), f.length === 0)
      return u;
    e && e();
    let k = u.slice(0, f[0]);
    for (let O = 0; O < f.length; ++O) {
      const A = f[O], M = f[O + 1] || u.length;
      A === 0 ? k = `
${n}${u.slice(0, M)}` : (l === p && g[A] && (k += `${u[A]}\\`), k += `
${n}${u.slice(A + 1, M)}`);
    }
    return k;
  }
  function h(u, n, l) {
    let i = n, a = n + 1, r = u[a];
    for (; r === " " || r === "	"; )
      if (n < a + l)
        r = u[++n];
      else {
        do
          r = u[++n];
        while (r && r !== `
`);
        i = n, a = n + 1, r = u[a];
      }
    return i;
  }
  return _r.FOLD_BLOCK = d, _r.FOLD_FLOW = o, _r.FOLD_QUOTED = p, _r.foldFlowLines = c, _r;
}
var Lu;
function Ei() {
  if (Lu) return Ji;
  Lu = 1;
  var o = nt(), d = N0();
  const p = (t, s) => ({
    indentAtStart: s ? t.indent.length : t.indentAtStart,
    lineWidth: t.options.lineWidth,
    minContentWidth: t.options.minContentWidth
  }), c = (t) => /^(%|---|\.\.\.)/m.test(t);
  function h(t, s, f) {
    if (!s || s < 0)
      return !1;
    const g = s - f, m = t.length;
    if (m <= g)
      return !1;
    for (let v = 0, y = 0; v < m; ++v)
      if (t[v] === `
`) {
        if (v - y > g)
          return !0;
        if (y = v + 1, m - y <= g)
          return !1;
      }
    return !0;
  }
  function u(t, s) {
    const f = JSON.stringify(t);
    if (s.options.doubleQuotedAsJSON)
      return f;
    const { implicitKey: g } = s, m = s.options.doubleQuotedMinMultiLineLength, v = s.indent || (c(t) ? "  " : "");
    let y = "", E = 0;
    for (let R = 0, C = f[R]; C; C = f[++R])
      if (C === " " && f[R + 1] === "\\" && f[R + 2] === "n" && (y += f.slice(E, R) + "\\ ", R += 1, E = R, C = "\\"), C === "\\")
        switch (f[R + 1]) {
          case "u":
            {
              y += f.slice(E, R);
              const I = f.substr(R + 2, 4);
              switch (I) {
                case "0000":
                  y += "\\0";
                  break;
                case "0007":
                  y += "\\a";
                  break;
                case "000b":
                  y += "\\v";
                  break;
                case "001b":
                  y += "\\e";
                  break;
                case "0085":
                  y += "\\N";
                  break;
                case "00a0":
                  y += "\\_";
                  break;
                case "2028":
                  y += "\\L";
                  break;
                case "2029":
                  y += "\\P";
                  break;
                default:
                  I.substr(0, 2) === "00" ? y += "\\x" + I.substr(2) : y += f.substr(R, 6);
              }
              R += 5, E = R + 1;
            }
            break;
          case "n":
            if (g || f[R + 2] === '"' || f.length < m)
              R += 1;
            else {
              for (y += f.slice(E, R) + `

`; f[R + 2] === "\\" && f[R + 3] === "n" && f[R + 4] !== '"'; )
                y += `
`, R += 2;
              y += v, f[R + 2] === " " && (y += "\\"), R += 1, E = R + 1;
            }
            break;
          default:
            R += 1;
        }
    return y = E ? y + f.slice(E) : f, g ? y : d.foldFlowLines(y, v, d.FOLD_QUOTED, p(s, !1));
  }
  function n(t, s) {
    if (s.options.singleQuote === !1 || s.implicitKey && t.includes(`
`) || /[ \t]\n|\n[ \t]/.test(t))
      return u(t, s);
    const f = s.indent || (c(t) ? "  " : ""), g = "'" + t.replace(/'/g, "''").replace(/\n+/g, `$&
${f}`) + "'";
    return s.implicitKey ? g : d.foldFlowLines(g, f, d.FOLD_FLOW, p(s, !1));
  }
  function l(t, s) {
    const { singleQuote: f } = s.options;
    let g;
    if (f === !1)
      g = u;
    else {
      const m = t.includes('"'), v = t.includes("'");
      m && !v ? g = n : v && !m ? g = u : g = f ? n : u;
    }
    return g(t, s);
  }
  let i;
  try {
    i = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    i = /\n+(?!\n|$)/g;
  }
  function a({ comment: t, type: s, value: f }, g, m, v) {
    const { blockQuote: y, commentString: E, lineWidth: R } = g.options;
    if (!y || /\n[\t ]+$/.test(f))
      return l(f, g);
    const C = g.indent || (g.forceBlockIndent || c(f) ? "  " : ""), I = y === "literal" ? !0 : y === "folded" || s === o.Scalar.BLOCK_FOLDED ? !1 : s === o.Scalar.BLOCK_LITERAL ? !0 : !h(f, R, C.length);
    if (!f)
      return I ? `|
` : `>
`;
    let k, O;
    for (O = f.length; O > 0; --O) {
      const N = f[O - 1];
      if (N !== `
` && N !== "	" && N !== " ")
        break;
    }
    let A = f.substring(O);
    const M = A.indexOf(`
`);
    M === -1 ? k = "-" : f === A || M !== A.length - 1 ? (k = "+", v && v()) : k = "", A && (f = f.slice(0, -A.length), A[A.length - 1] === `
` && (A = A.slice(0, -1)), A = A.replace(i, `$&${C}`));
    let z = !1, U, j = -1;
    for (U = 0; U < f.length; ++U) {
      const N = f[U];
      if (N === " ")
        z = !0;
      else if (N === `
`)
        j = U;
      else
        break;
    }
    let B = f.substring(0, j < U ? j + 1 : U);
    B && (f = f.substring(B.length), B = B.replace(/\n+/g, `$&${C}`));
    let te = (z ? C ? "2" : "1" : "") + k;
    if (t && (te += " " + E(t.replace(/ ?[\r\n]+/g, " ")), m && m()), !I) {
      const N = f.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${C}`);
      let F = !1;
      const G = p(g, !0);
      y !== "folded" && s !== o.Scalar.BLOCK_FOLDED && (G.onOverflow = () => {
        F = !0;
      });
      const Q = d.foldFlowLines(`${B}${N}${A}`, C, d.FOLD_BLOCK, G);
      if (!F)
        return `>${te}
${C}${Q}`;
    }
    return f = f.replace(/\n+/g, `$&${C}`), `|${te}
${C}${B}${f}${A}`;
  }
  function r(t, s, f, g) {
    const { type: m, value: v } = t, { actualString: y, implicitKey: E, indent: R, indentStep: C, inFlow: I } = s;
    if (E && v.includes(`
`) || I && /[[\]{},]/.test(v))
      return l(v, s);
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(v))
      return E || I || !v.includes(`
`) ? l(v, s) : a(t, s, f, g);
    if (!E && !I && m !== o.Scalar.PLAIN && v.includes(`
`))
      return a(t, s, f, g);
    if (c(v)) {
      if (R === "")
        return s.forceBlockIndent = !0, a(t, s, f, g);
      if (E && R === C)
        return l(v, s);
    }
    const k = v.replace(/\n+/g, `$&
${R}`);
    if (y) {
      const O = (z) => {
        var U;
        return z.default && z.tag !== "tag:yaml.org,2002:str" && ((U = z.test) == null ? void 0 : U.test(k));
      }, { compat: A, tags: M } = s.doc.schema;
      if (M.some(O) || A != null && A.some(O))
        return l(v, s);
    }
    return E ? k : d.foldFlowLines(k, R, d.FOLD_FLOW, p(s, !1));
  }
  function e(t, s, f, g) {
    const { implicitKey: m, inFlow: v } = s, y = typeof t.value == "string" ? t : Object.assign({}, t, { value: String(t.value) });
    let { type: E } = t;
    E !== o.Scalar.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(y.value) && (E = o.Scalar.QUOTE_DOUBLE);
    const R = (I) => {
      switch (I) {
        case o.Scalar.BLOCK_FOLDED:
        case o.Scalar.BLOCK_LITERAL:
          return m || v ? l(y.value, s) : a(y, s, f, g);
        case o.Scalar.QUOTE_DOUBLE:
          return u(y.value, s);
        case o.Scalar.QUOTE_SINGLE:
          return n(y.value, s);
        case o.Scalar.PLAIN:
          return r(y, s, f, g);
        default:
          return null;
      }
    };
    let C = R(E);
    if (C === null) {
      const { defaultKeyType: I, defaultStringType: k } = s.options, O = m && I || k;
      if (C = R(O), C === null)
        throw new Error(`Unsupported default string type ${O}`);
    }
    return C;
  }
  return Ji.stringifyString = e, Ji;
}
var Fu;
function Si() {
  if (Fu) return jn;
  Fu = 1;
  var o = Fl(), d = Fe(), p = bi(), c = Ei();
  function h(i, a) {
    const r = Object.assign({
      blockQuote: !0,
      commentString: p.stringifyComment,
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
    }, i.schema.toStringOptions, a);
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
      doc: i,
      flowCollectionPadding: r.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof r.indent == "number" ? " ".repeat(r.indent) : "  ",
      inFlow: e,
      options: r
    };
  }
  function u(i, a) {
    var t;
    if (a.tag) {
      const s = i.filter((f) => f.tag === a.tag);
      if (s.length > 0)
        return s.find((f) => f.format === a.format) ?? s[0];
    }
    let r, e;
    if (d.isScalar(a)) {
      e = a.value;
      let s = i.filter((f) => {
        var g;
        return (g = f.identify) == null ? void 0 : g.call(f, e);
      });
      if (s.length > 1) {
        const f = s.filter((g) => g.test);
        f.length > 0 && (s = f);
      }
      r = s.find((f) => f.format === a.format) ?? s.find((f) => !f.format);
    } else
      e = a, r = i.find((s) => s.nodeClass && e instanceof s.nodeClass);
    if (!r) {
      const s = ((t = e == null ? void 0 : e.constructor) == null ? void 0 : t.name) ?? (e === null ? "null" : typeof e);
      throw new Error(`Tag not resolved for ${s} value`);
    }
    return r;
  }
  function n(i, a, { anchors: r, doc: e }) {
    if (!e.directives)
      return "";
    const t = [], s = (d.isScalar(i) || d.isCollection(i)) && i.anchor;
    s && o.anchorIsValid(s) && (r.add(s), t.push(`&${s}`));
    const f = i.tag ?? (a.default ? null : a.tag);
    return f && t.push(e.directives.tagString(f)), t.join(" ");
  }
  function l(i, a, r, e) {
    var m;
    if (d.isPair(i))
      return i.toString(a, r, e);
    if (d.isAlias(i)) {
      if (a.doc.directives)
        return i.toString(a);
      if ((m = a.resolvedAliases) != null && m.has(i))
        throw new TypeError("Cannot stringify circular structure without alias nodes");
      a.resolvedAliases ? a.resolvedAliases.add(i) : a.resolvedAliases = /* @__PURE__ */ new Set([i]), i = i.resolve(a.doc);
    }
    let t;
    const s = d.isNode(i) ? i : a.doc.createNode(i, { onTagObj: (v) => t = v });
    t ?? (t = u(a.doc.schema.tags, s));
    const f = n(s, t, a);
    f.length > 0 && (a.indentAtStart = (a.indentAtStart ?? 0) + f.length + 1);
    const g = typeof t.stringify == "function" ? t.stringify(s, a, r, e) : d.isScalar(s) ? c.stringifyString(s, a, r, e) : s.toString(a, r, e);
    return f ? d.isScalar(s) || g[0] === "{" || g[0] === "[" ? `${f} ${g}` : `${f}
${a.indent}${g}` : g;
  }
  return jn.createStringifyContext = h, jn.stringify = l, jn;
}
var Uu;
function I0() {
  if (Uu) return Vi;
  Uu = 1;
  var o = Fe(), d = nt(), p = Si(), c = bi();
  function h({ key: u, value: n }, l, i, a) {
    const { allNullValues: r, doc: e, indent: t, indentStep: s, options: { commentString: f, indentSeq: g, simpleKeys: m } } = l;
    let v = o.isNode(u) && u.comment || null;
    if (m) {
      if (v)
        throw new Error("With simple keys, key nodes cannot have comments");
      if (o.isCollection(u) || !o.isNode(u) && typeof u == "object") {
        const U = "With simple keys, collection cannot be used as a key value";
        throw new Error(U);
      }
    }
    let y = !m && (!u || v && n == null && !l.inFlow || o.isCollection(u) || (o.isScalar(u) ? u.type === d.Scalar.BLOCK_FOLDED || u.type === d.Scalar.BLOCK_LITERAL : typeof u == "object"));
    l = Object.assign({}, l, {
      allNullValues: !1,
      implicitKey: !y && (m || !r),
      indent: t + s
    });
    let E = !1, R = !1, C = p.stringify(u, l, () => E = !0, () => R = !0);
    if (!y && !l.inFlow && C.length > 1024) {
      if (m)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      y = !0;
    }
    if (l.inFlow) {
      if (r || n == null)
        return E && i && i(), C === "" ? "?" : y ? `? ${C}` : C;
    } else if (r && !m || n == null && y)
      return C = `? ${C}`, v && !E ? C += c.lineComment(C, l.indent, f(v)) : R && a && a(), C;
    E && (v = null), y ? (v && (C += c.lineComment(C, l.indent, f(v))), C = `? ${C}
${t}:`) : (C = `${C}:`, v && (C += c.lineComment(C, l.indent, f(v))));
    let I, k, O;
    o.isNode(n) ? (I = !!n.spaceBefore, k = n.commentBefore, O = n.comment) : (I = !1, k = null, O = null, n && typeof n == "object" && (n = e.createNode(n))), l.implicitKey = !1, !y && !v && o.isScalar(n) && (l.indentAtStart = C.length + 1), R = !1, !g && s.length >= 2 && !l.inFlow && !y && o.isSeq(n) && !n.flow && !n.tag && !n.anchor && (l.indent = l.indent.substring(2));
    let A = !1;
    const M = p.stringify(n, l, () => A = !0, () => R = !0);
    let z = " ";
    if (v || I || k) {
      if (z = I ? `
` : "", k) {
        const U = f(k);
        z += `
${c.indentComment(U, l.indent)}`;
      }
      M === "" && !l.inFlow ? z === `
` && O && (z = `

`) : z += `
${l.indent}`;
    } else if (!y && o.isCollection(n)) {
      const U = M[0], j = M.indexOf(`
`), B = j !== -1, H = l.inFlow ?? n.flow ?? n.items.length === 0;
      if (B || !H) {
        let te = !1;
        if (B && (U === "&" || U === "!")) {
          let N = M.indexOf(" ");
          U === "&" && N !== -1 && N < j && M[N + 1] === "!" && (N = M.indexOf(" ", N + 1)), (N === -1 || j < N) && (te = !0);
        }
        te || (z = `
${l.indent}`);
      }
    } else (M === "" || M[0] === `
`) && (z = "");
    return C += z + M, l.inFlow ? A && i && i() : O && !A ? C += c.lineComment(C, l.indent, f(O)) : R && a && a(), C;
  }
  return Vi.stringifyPair = h, Vi;
}
var Zi = {}, Hn = {}, $u;
function gm() {
  if ($u) return Hn;
  $u = 1;
  var o = Pl;
  function d(c, ...h) {
    c === "debug" && console.log(...h);
  }
  function p(c, h) {
    (c === "debug" || c === "warn") && (typeof o.emitWarning == "function" ? o.emitWarning(h) : console.warn(h));
  }
  return Hn.debug = d, Hn.warn = p, Hn;
}
var Br = {}, qu;
function ql() {
  if (qu) return Br;
  qu = 1;
  var o = Fe(), d = nt();
  const p = "<<", c = {
    identify: (l) => l === p || typeof l == "symbol" && l.description === p,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new d.Scalar(Symbol(p)), {
      addToJSMap: u
    }),
    stringify: () => p
  }, h = (l, i) => (c.identify(i) || o.isScalar(i) && (!i.type || i.type === d.Scalar.PLAIN) && c.identify(i.value)) && (l == null ? void 0 : l.doc.schema.tags.some((a) => a.tag === c.tag && a.default));
  function u(l, i, a) {
    if (a = l && o.isAlias(a) ? a.resolve(l.doc) : a, o.isSeq(a))
      for (const r of a.items)
        n(l, i, r);
    else if (Array.isArray(a))
      for (const r of a)
        n(l, i, r);
    else
      n(l, i, a);
  }
  function n(l, i, a) {
    const r = l && o.isAlias(a) ? a.resolve(l.doc) : a;
    if (!o.isMap(r))
      throw new Error("Merge sources must be maps or map aliases");
    const e = r.toJSON(null, l, Map);
    for (const [t, s] of e)
      i instanceof Map ? i.has(t) || i.set(t, s) : i instanceof Set ? i.add(t) : Object.prototype.hasOwnProperty.call(i, t) || Object.defineProperty(i, t, {
        value: s,
        writable: !0,
        enumerable: !0,
        configurable: !0
      });
    return i;
  }
  return Br.addMergeToJSMap = u, Br.isMergeKey = h, Br.merge = c, Br;
}
var Mu;
function vm() {
  if (Mu) return Zi;
  Mu = 1;
  var o = gm(), d = ql(), p = Si(), c = Fe(), h = cr();
  function u(l, i, { key: a, value: r }) {
    if (c.isNode(a) && a.addToJSMap)
      a.addToJSMap(l, i, r);
    else if (d.isMergeKey(l, a))
      d.addMergeToJSMap(l, i, r);
    else {
      const e = h.toJS(a, "", l);
      if (i instanceof Map)
        i.set(e, h.toJS(r, e, l));
      else if (i instanceof Set)
        i.add(e);
      else {
        const t = n(a, e, l), s = h.toJS(r, t, l);
        t in i ? Object.defineProperty(i, t, {
          value: s,
          writable: !0,
          enumerable: !0,
          configurable: !0
        }) : i[t] = s;
      }
    }
    return i;
  }
  function n(l, i, a) {
    if (i === null)
      return "";
    if (typeof i != "object")
      return String(i);
    if (c.isNode(l) && (a != null && a.doc)) {
      const r = p.createStringifyContext(a.doc, {});
      r.anchors = /* @__PURE__ */ new Set();
      for (const t of a.anchors.keys())
        r.anchors.add(t.anchor);
      r.inFlow = !0, r.inStringifyKey = !0;
      const e = l.toString(r);
      if (!a.mapKeyWarned) {
        let t = JSON.stringify(e);
        t.length > 40 && (t = t.substring(0, 36) + '..."'), o.warn(a.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${t}. Set mapAsMap: true to use object keys.`), a.mapKeyWarned = !0;
      }
      return e;
    }
    return JSON.stringify(i);
  }
  return Zi.addPairToJSMap = u, Zi;
}
var Bu;
function fr() {
  if (Bu) return Bn;
  Bu = 1;
  var o = _i(), d = I0(), p = vm(), c = Fe();
  function h(n, l, i) {
    const a = o.createNode(n, void 0, i), r = o.createNode(l, void 0, i);
    return new u(a, r);
  }
  let u = class ym {
    constructor(l, i = null) {
      Object.defineProperty(this, c.NODE_TYPE, { value: c.PAIR }), this.key = l, this.value = i;
    }
    clone(l) {
      let { key: i, value: a } = this;
      return c.isNode(i) && (i = i.clone(l)), c.isNode(a) && (a = a.clone(l)), new ym(i, a);
    }
    toJSON(l, i) {
      const a = i != null && i.mapAsMap ? /* @__PURE__ */ new Map() : {};
      return p.addPairToJSMap(i, a, this);
    }
    toString(l, i, a) {
      return l != null && l.doc ? d.stringifyPair(this, l, i, a) : JSON.stringify(this);
    }
  };
  return Bn.Pair = u, Bn.createPair = h, Bn;
}
var Xi = {}, Qi = {}, zn = {}, ea = {}, ju;
function wm() {
  if (ju) return ea;
  ju = 1;
  var o = Fe(), d = Si(), p = bi();
  function c(l, i, a) {
    return (i.inFlow ?? l.flow ? u : h)(l, i, a);
  }
  function h({ comment: l, items: i }, a, { blockItemPrefix: r, flowChars: e, itemIndent: t, onChompKeep: s, onComment: f }) {
    const { indent: g, options: { commentString: m } } = a, v = Object.assign({}, a, { indent: t, type: null });
    let y = !1;
    const E = [];
    for (let C = 0; C < i.length; ++C) {
      const I = i[C];
      let k = null;
      if (o.isNode(I))
        !y && I.spaceBefore && E.push(""), n(a, E, I.commentBefore, y), I.comment && (k = I.comment);
      else if (o.isPair(I)) {
        const A = o.isNode(I.key) ? I.key : null;
        A && (!y && A.spaceBefore && E.push(""), n(a, E, A.commentBefore, y));
      }
      y = !1;
      let O = d.stringify(I, v, () => k = null, () => y = !0);
      k && (O += p.lineComment(O, t, m(k))), y && k && (y = !1), E.push(r + O);
    }
    let R;
    if (E.length === 0)
      R = e.start + e.end;
    else {
      R = E[0];
      for (let C = 1; C < E.length; ++C) {
        const I = E[C];
        R += I ? `
${g}${I}` : `
`;
      }
    }
    return l ? (R += `
` + p.indentComment(m(l), g), f && f()) : y && s && s(), R;
  }
  function u({ items: l }, i, { flowChars: a, itemIndent: r }) {
    const { indent: e, indentStep: t, flowCollectionPadding: s, options: { commentString: f } } = i;
    r += t;
    const g = Object.assign({}, i, {
      indent: r,
      inFlow: !0,
      type: null
    });
    let m = !1, v = 0;
    const y = [];
    for (let C = 0; C < l.length; ++C) {
      const I = l[C];
      let k = null;
      if (o.isNode(I))
        I.spaceBefore && y.push(""), n(i, y, I.commentBefore, !1), I.comment && (k = I.comment);
      else if (o.isPair(I)) {
        const A = o.isNode(I.key) ? I.key : null;
        A && (A.spaceBefore && y.push(""), n(i, y, A.commentBefore, !1), A.comment && (m = !0));
        const M = o.isNode(I.value) ? I.value : null;
        M ? (M.comment && (k = M.comment), M.commentBefore && (m = !0)) : I.value == null && (A != null && A.comment) && (k = A.comment);
      }
      k && (m = !0);
      let O = d.stringify(I, g, () => k = null);
      C < l.length - 1 && (O += ","), k && (O += p.lineComment(O, r, f(k))), !m && (y.length > v || O.includes(`
`)) && (m = !0), y.push(O), v = y.length;
    }
    const { start: E, end: R } = a;
    if (y.length === 0)
      return E + R;
    if (!m) {
      const C = y.reduce((I, k) => I + k.length + 2, 2);
      m = i.options.lineWidth > 0 && C > i.options.lineWidth;
    }
    if (m) {
      let C = E;
      for (const I of y)
        C += I ? `
${t}${e}${I}` : `
`;
      return `${C}
${e}${R}`;
    } else
      return `${E}${s}${y.join(" ")}${s}${R}`;
  }
  function n({ indent: l, options: { commentString: i } }, a, r, e) {
    if (r && e && (r = r.replace(/^\n+/, "")), r) {
      const t = p.indentComment(i(r), l);
      a.push(t.trimStart());
    }
  }
  return ea.stringifyCollection = c, ea;
}
var Hu;
function dr() {
  if (Hu) return zn;
  Hu = 1;
  var o = wm(), d = vm(), p = $l(), c = Fe(), h = fr(), u = nt();
  function n(i, a) {
    const r = c.isScalar(a) ? a.value : a;
    for (const e of i)
      if (c.isPair(e) && (e.key === a || e.key === r || c.isScalar(e.key) && e.key.value === r))
        return e;
  }
  let l = class extends p.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(a) {
      super(c.MAP, a), this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(a, r, e) {
      const { keepUndefined: t, replacer: s } = e, f = new this(a), g = (m, v) => {
        if (typeof s == "function")
          v = s.call(r, m, v);
        else if (Array.isArray(s) && !s.includes(m))
          return;
        (v !== void 0 || t) && f.items.push(h.createPair(m, v, e));
      };
      if (r instanceof Map)
        for (const [m, v] of r)
          g(m, v);
      else if (r && typeof r == "object")
        for (const m of Object.keys(r))
          g(m, r[m]);
      return typeof a.sortMapEntries == "function" && f.items.sort(a.sortMapEntries), f;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(a, r) {
      var f;
      let e;
      c.isPair(a) ? e = a : !a || typeof a != "object" || !("key" in a) ? e = new h.Pair(a, a == null ? void 0 : a.value) : e = new h.Pair(a.key, a.value);
      const t = n(this.items, e.key), s = (f = this.schema) == null ? void 0 : f.sortMapEntries;
      if (t) {
        if (!r)
          throw new Error(`Key ${e.key} already set`);
        c.isScalar(t.value) && u.isScalarValue(e.value) ? t.value.value = e.value : t.value = e.value;
      } else if (s) {
        const g = this.items.findIndex((m) => s(e, m) < 0);
        g === -1 ? this.items.push(e) : this.items.splice(g, 0, e);
      } else
        this.items.push(e);
    }
    delete(a) {
      const r = n(this.items, a);
      return r ? this.items.splice(this.items.indexOf(r), 1).length > 0 : !1;
    }
    get(a, r) {
      const e = n(this.items, a), t = e == null ? void 0 : e.value;
      return (!r && c.isScalar(t) ? t.value : t) ?? void 0;
    }
    has(a) {
      return !!n(this.items, a);
    }
    set(a, r) {
      this.add(new h.Pair(a, r), !0);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(a, r, e) {
      const t = e ? new e() : r != null && r.mapAsMap ? /* @__PURE__ */ new Map() : {};
      r != null && r.onCreate && r.onCreate(t);
      for (const s of this.items)
        d.addPairToJSMap(r, t, s);
      return t;
    }
    toString(a, r, e) {
      if (!a)
        return JSON.stringify(this);
      for (const t of this.items)
        if (!c.isPair(t))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(t)} instead`);
      return !a.allNullValues && this.hasAllNullValues(!1) && (a = Object.assign({}, a, { allNullValues: !0 })), o.stringifyCollection(this, a, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: a.indent || "",
        onChompKeep: e,
        onComment: r
      });
    }
  };
  return zn.YAMLMap = l, zn.findPair = n, zn;
}
var zu;
function bn() {
  if (zu) return Qi;
  zu = 1;
  var o = Fe(), d = dr();
  const p = {
    collection: "map",
    default: !0,
    nodeClass: d.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(c, h) {
      return o.isMap(c) || h("Expected a mapping for this tag"), c;
    },
    createNode: (c, h, u) => d.YAMLMap.from(c, h, u)
  };
  return Qi.map = p, Qi;
}
var ta = {}, ra = {}, Gu;
function hr() {
  if (Gu) return ra;
  Gu = 1;
  var o = _i(), d = wm(), p = $l(), c = Fe(), h = nt(), u = cr();
  let n = class extends p.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(a) {
      super(c.SEQ, a), this.items = [];
    }
    add(a) {
      this.items.push(a);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(a) {
      const r = l(a);
      return typeof r != "number" ? !1 : this.items.splice(r, 1).length > 0;
    }
    get(a, r) {
      const e = l(a);
      if (typeof e != "number")
        return;
      const t = this.items[e];
      return !r && c.isScalar(t) ? t.value : t;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(a) {
      const r = l(a);
      return typeof r == "number" && r < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(a, r) {
      const e = l(a);
      if (typeof e != "number")
        throw new Error(`Expected a valid index, not ${a}.`);
      const t = this.items[e];
      c.isScalar(t) && h.isScalarValue(r) ? t.value = r : this.items[e] = r;
    }
    toJSON(a, r) {
      const e = [];
      r != null && r.onCreate && r.onCreate(e);
      let t = 0;
      for (const s of this.items)
        e.push(u.toJS(s, String(t++), r));
      return e;
    }
    toString(a, r, e) {
      return a ? d.stringifyCollection(this, a, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (a.indent || "") + "  ",
        onChompKeep: e,
        onComment: r
      }) : JSON.stringify(this);
    }
    static from(a, r, e) {
      const { replacer: t } = e, s = new this(a);
      if (r && Symbol.iterator in Object(r)) {
        let f = 0;
        for (let g of r) {
          if (typeof t == "function") {
            const m = r instanceof Set ? g : String(f++);
            g = t.call(r, m, g);
          }
          s.items.push(o.createNode(g, void 0, e));
        }
      }
      return s;
    }
  };
  function l(i) {
    let a = c.isScalar(i) ? i.value : i;
    return a && typeof a == "string" && (a = Number(a)), typeof a == "number" && Number.isInteger(a) && a >= 0 ? a : null;
  }
  return ra.YAMLSeq = n, ra;
}
var Wu;
function En() {
  if (Wu) return ta;
  Wu = 1;
  var o = Fe(), d = hr();
  const p = {
    collection: "seq",
    default: !0,
    nodeClass: d.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(c, h) {
      return o.isSeq(c) || h("Expected a sequence for this tag"), c;
    },
    createNode: (c, h, u) => d.YAMLSeq.from(c, h, u)
  };
  return ta.seq = p, ta;
}
var na = {}, Yu;
function Ai() {
  if (Yu) return na;
  Yu = 1;
  var o = Ei();
  const d = {
    identify: (p) => typeof p == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (p) => p,
    stringify(p, c, h, u) {
      return c = Object.assign({ actualString: !0 }, c), o.stringifyString(p, c, h, u);
    }
  };
  return na.string = d, na;
}
var Gn = {}, ia = {}, Ku;
function Ml() {
  if (Ku) return ia;
  Ku = 1;
  var o = nt();
  const d = {
    identify: (p) => p == null,
    createNode: () => new o.Scalar(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new o.Scalar(null),
    stringify: ({ source: p }, c) => typeof p == "string" && d.test.test(p) ? p : c.options.nullStr
  };
  return ia.nullTag = d, ia;
}
var aa = {}, Vu;
function _m() {
  if (Vu) return aa;
  Vu = 1;
  var o = nt();
  const d = {
    identify: (p) => typeof p == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (p) => new o.Scalar(p[0] === "t" || p[0] === "T"),
    stringify({ source: p, value: c }, h) {
      if (p && d.test.test(p)) {
        const u = p[0] === "t" || p[0] === "T";
        if (c === u)
          return p;
      }
      return c ? h.options.trueStr : h.options.falseStr;
    }
  };
  return aa.boolTag = d, aa;
}
var jr = {}, sa = {}, Ju;
function Sn() {
  if (Ju) return sa;
  Ju = 1;
  function o({ format: d, minFractionDigits: p, tag: c, value: h }) {
    if (typeof h == "bigint")
      return String(h);
    const u = typeof h == "number" ? h : Number(h);
    if (!isFinite(u))
      return isNaN(u) ? ".nan" : u < 0 ? "-.inf" : ".inf";
    let n = Object.is(h, -0) ? "-0" : JSON.stringify(h);
    if (!d && p && (!c || c === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
      let l = n.indexOf(".");
      l < 0 && (l = n.length, n += ".");
      let i = p - (n.length - l - 1);
      for (; i-- > 0; )
        n += "0";
    }
    return n;
  }
  return sa.stringifyNumber = o, sa;
}
var Zu;
function bm() {
  if (Zu) return jr;
  Zu = 1;
  var o = nt(), d = Sn();
  const p = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (u) => u.slice(-3).toLowerCase() === "nan" ? NaN : u[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: d.stringifyNumber
  }, c = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (u) => parseFloat(u),
    stringify(u) {
      const n = Number(u.value);
      return isFinite(n) ? n.toExponential() : d.stringifyNumber(u);
    }
  }, h = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(u) {
      const n = new o.Scalar(parseFloat(u)), l = u.indexOf(".");
      return l !== -1 && u[u.length - 1] === "0" && (n.minFractionDigits = u.length - l - 1), n;
    },
    stringify: d.stringifyNumber
  };
  return jr.float = h, jr.floatExp = c, jr.floatNaN = p, jr;
}
var Hr = {}, Xu;
function Em() {
  if (Xu) return Hr;
  Xu = 1;
  var o = Sn();
  const d = (l) => typeof l == "bigint" || Number.isInteger(l), p = (l, i, a, { intAsBigInt: r }) => r ? BigInt(l) : parseInt(l.substring(i), a);
  function c(l, i, a) {
    const { value: r } = l;
    return d(r) && r >= 0 ? a + r.toString(i) : o.stringifyNumber(l);
  }
  const h = {
    identify: (l) => d(l) && l >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (l, i, a) => p(l, 2, 8, a),
    stringify: (l) => c(l, 8, "0o")
  }, u = {
    identify: d,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (l, i, a) => p(l, 0, 10, a),
    stringify: o.stringifyNumber
  }, n = {
    identify: (l) => d(l) && l >= 0,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (l, i, a) => p(l, 2, 16, a),
    stringify: (l) => c(l, 16, "0x")
  };
  return Hr.int = u, Hr.intHex = n, Hr.intOct = h, Hr;
}
var oa = {}, Qu;
function D0() {
  if (Qu) return oa;
  Qu = 1;
  var o = bn(), d = Ml(), p = En(), c = Ai(), h = _m(), u = bm(), n = Em();
  const l = [
    o.map,
    p.seq,
    c.string,
    d.nullTag,
    h.boolTag,
    n.intOct,
    n.int,
    n.intHex,
    u.floatNaN,
    u.floatExp,
    u.float
  ];
  return oa.schema = l, oa;
}
var la = {}, ec;
function P0() {
  if (ec) return la;
  ec = 1;
  var o = nt(), d = bn(), p = En();
  function c(i) {
    return typeof i == "bigint" || Number.isInteger(i);
  }
  const h = ({ value: i }) => JSON.stringify(i), u = [
    {
      identify: (i) => typeof i == "string",
      default: !0,
      tag: "tag:yaml.org,2002:str",
      resolve: (i) => i,
      stringify: h
    },
    {
      identify: (i) => i == null,
      createNode: () => new o.Scalar(null),
      default: !0,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: h
    },
    {
      identify: (i) => typeof i == "boolean",
      default: !0,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (i) => i === "true",
      stringify: h
    },
    {
      identify: c,
      default: !0,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (i, a, { intAsBigInt: r }) => r ? BigInt(i) : parseInt(i, 10),
      stringify: ({ value: i }) => c(i) ? i.toString() : JSON.stringify(i)
    },
    {
      identify: (i) => typeof i == "number",
      default: !0,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (i) => parseFloat(i),
      stringify: h
    }
  ], n = {
    default: !0,
    tag: "",
    test: /^/,
    resolve(i, a) {
      return a(`Unresolved plain scalar ${JSON.stringify(i)}`), i;
    }
  }, l = [d.map, p.seq].concat(u, n);
  return la.schema = l, la;
}
var ua = {}, tc;
function Sm() {
  if (tc) return ua;
  tc = 1;
  var o = xl, d = nt(), p = Ei();
  const c = {
    identify: (h) => h instanceof Uint8Array,
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
    resolve(h, u) {
      if (typeof o.Buffer == "function")
        return o.Buffer.from(h, "base64");
      if (typeof atob == "function") {
        const n = atob(h.replace(/[\n\r]/g, "")), l = new Uint8Array(n.length);
        for (let i = 0; i < n.length; ++i)
          l[i] = n.charCodeAt(i);
        return l;
      } else
        return u("This environment does not support reading binary tags; either Buffer or atob is required"), h;
    },
    stringify({ comment: h, type: u, value: n }, l, i, a) {
      if (!n)
        return "";
      const r = n;
      let e;
      if (typeof o.Buffer == "function")
        e = r instanceof o.Buffer ? r.toString("base64") : o.Buffer.from(r.buffer).toString("base64");
      else if (typeof btoa == "function") {
        let t = "";
        for (let s = 0; s < r.length; ++s)
          t += String.fromCharCode(r[s]);
        e = btoa(t);
      } else
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      if (u ?? (u = d.Scalar.BLOCK_LITERAL), u !== d.Scalar.QUOTE_DOUBLE) {
        const t = Math.max(l.options.lineWidth - l.indent.length, l.options.minContentWidth), s = Math.ceil(e.length / t), f = new Array(s);
        for (let g = 0, m = 0; g < s; ++g, m += t)
          f[g] = e.substr(m, t);
        e = f.join(u === d.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return p.stringifyString({ comment: h, type: u, value: e }, l, i, a);
    }
  };
  return ua.binary = c, ua;
}
var Wn = {}, zr = {}, rc;
function Bl() {
  if (rc) return zr;
  rc = 1;
  var o = Fe(), d = fr(), p = nt(), c = hr();
  function h(l, i) {
    if (o.isSeq(l))
      for (let a = 0; a < l.items.length; ++a) {
        let r = l.items[a];
        if (!o.isPair(r)) {
          if (o.isMap(r)) {
            r.items.length > 1 && i("Each pair must have its own sequence indicator");
            const e = r.items[0] || new d.Pair(new p.Scalar(null));
            if (r.commentBefore && (e.key.commentBefore = e.key.commentBefore ? `${r.commentBefore}
${e.key.commentBefore}` : r.commentBefore), r.comment) {
              const t = e.value ?? e.key;
              t.comment = t.comment ? `${r.comment}
${t.comment}` : r.comment;
            }
            r = e;
          }
          l.items[a] = o.isPair(r) ? r : new d.Pair(r);
        }
      }
    else
      i("Expected a sequence for this tag");
    return l;
  }
  function u(l, i, a) {
    const { replacer: r } = a, e = new c.YAMLSeq(l);
    e.tag = "tag:yaml.org,2002:pairs";
    let t = 0;
    if (i && Symbol.iterator in Object(i))
      for (let s of i) {
        typeof r == "function" && (s = r.call(i, String(t++), s));
        let f, g;
        if (Array.isArray(s))
          if (s.length === 2)
            f = s[0], g = s[1];
          else
            throw new TypeError(`Expected [key, value] tuple: ${s}`);
        else if (s && s instanceof Object) {
          const m = Object.keys(s);
          if (m.length === 1)
            f = m[0], g = s[f];
          else
            throw new TypeError(`Expected tuple with one key, not ${m.length} keys`);
        } else
          f = s;
        e.items.push(d.createPair(f, g, a));
      }
    return e;
  }
  const n = {
    collection: "seq",
    default: !1,
    tag: "tag:yaml.org,2002:pairs",
    resolve: h,
    createNode: u
  };
  return zr.createPairs = u, zr.pairs = n, zr.resolvePairs = h, zr;
}
var nc;
function Am() {
  if (nc) return Wn;
  nc = 1;
  var o = Fe(), d = cr(), p = dr(), c = hr(), h = Bl();
  class u extends c.YAMLSeq {
    constructor() {
      super(), this.add = p.YAMLMap.prototype.add.bind(this), this.delete = p.YAMLMap.prototype.delete.bind(this), this.get = p.YAMLMap.prototype.get.bind(this), this.has = p.YAMLMap.prototype.has.bind(this), this.set = p.YAMLMap.prototype.set.bind(this), this.tag = u.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(i, a) {
      if (!a)
        return super.toJSON(i);
      const r = /* @__PURE__ */ new Map();
      a != null && a.onCreate && a.onCreate(r);
      for (const e of this.items) {
        let t, s;
        if (o.isPair(e) ? (t = d.toJS(e.key, "", a), s = d.toJS(e.value, t, a)) : t = d.toJS(e, "", a), r.has(t))
          throw new Error("Ordered maps must not include duplicate keys");
        r.set(t, s);
      }
      return r;
    }
    static from(i, a, r) {
      const e = h.createPairs(i, a, r), t = new this();
      return t.items = e.items, t;
    }
  }
  u.tag = "tag:yaml.org,2002:omap";
  const n = {
    collection: "seq",
    identify: (l) => l instanceof Map,
    nodeClass: u,
    default: !1,
    tag: "tag:yaml.org,2002:omap",
    resolve(l, i) {
      const a = h.resolvePairs(l, i), r = [];
      for (const { key: e } of a.items)
        o.isScalar(e) && (r.includes(e.value) ? i(`Ordered maps must not include duplicate keys: ${e.value}`) : r.push(e.value));
      return Object.assign(new u(), a);
    },
    createNode: (l, i, a) => u.from(l, i, a)
  };
  return Wn.YAMLOMap = u, Wn.omap = n, Wn;
}
var ca = {}, Yn = {}, ic;
function x0() {
  if (ic) return Yn;
  ic = 1;
  var o = nt();
  function d({ value: h, source: u }, n) {
    return u && (h ? p : c).test.test(u) ? u : h ? n.options.trueStr : n.options.falseStr;
  }
  const p = {
    identify: (h) => h === !0,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new o.Scalar(!0),
    stringify: d
  }, c = {
    identify: (h) => h === !1,
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new o.Scalar(!1),
    stringify: d
  };
  return Yn.falseTag = c, Yn.trueTag = p, Yn;
}
var Gr = {}, ac;
function L0() {
  if (ac) return Gr;
  ac = 1;
  var o = nt(), d = Sn();
  const p = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (u) => u.slice(-3).toLowerCase() === "nan" ? NaN : u[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: d.stringifyNumber
  }, c = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (u) => parseFloat(u.replace(/_/g, "")),
    stringify(u) {
      const n = Number(u.value);
      return isFinite(n) ? n.toExponential() : d.stringifyNumber(u);
    }
  }, h = {
    identify: (u) => typeof u == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(u) {
      const n = new o.Scalar(parseFloat(u.replace(/_/g, ""))), l = u.indexOf(".");
      if (l !== -1) {
        const i = u.substring(l + 1).replace(/_/g, "");
        i[i.length - 1] === "0" && (n.minFractionDigits = i.length);
      }
      return n;
    },
    stringify: d.stringifyNumber
  };
  return Gr.float = h, Gr.floatExp = c, Gr.floatNaN = p, Gr;
}
var br = {}, sc;
function F0() {
  if (sc) return br;
  sc = 1;
  var o = Sn();
  const d = (i) => typeof i == "bigint" || Number.isInteger(i);
  function p(i, a, r, { intAsBigInt: e }) {
    const t = i[0];
    if ((t === "-" || t === "+") && (a += 1), i = i.substring(a).replace(/_/g, ""), e) {
      switch (r) {
        case 2:
          i = `0b${i}`;
          break;
        case 8:
          i = `0o${i}`;
          break;
        case 16:
          i = `0x${i}`;
          break;
      }
      const f = BigInt(i);
      return t === "-" ? BigInt(-1) * f : f;
    }
    const s = parseInt(i, r);
    return t === "-" ? -1 * s : s;
  }
  function c(i, a, r) {
    const { value: e } = i;
    if (d(e)) {
      const t = e.toString(a);
      return e < 0 ? "-" + r + t.substr(1) : r + t;
    }
    return o.stringifyNumber(i);
  }
  const h = {
    identify: d,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (i, a, r) => p(i, 2, 2, r),
    stringify: (i) => c(i, 2, "0b")
  }, u = {
    identify: d,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (i, a, r) => p(i, 1, 8, r),
    stringify: (i) => c(i, 8, "0")
  }, n = {
    identify: d,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (i, a, r) => p(i, 0, 10, r),
    stringify: o.stringifyNumber
  }, l = {
    identify: d,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (i, a, r) => p(i, 2, 16, r),
    stringify: (i) => c(i, 16, "0x")
  };
  return br.int = n, br.intBin = h, br.intHex = l, br.intOct = u, br;
}
var Kn = {}, oc;
function Cm() {
  if (oc) return Kn;
  oc = 1;
  var o = Fe(), d = fr(), p = dr();
  class c extends p.YAMLMap {
    constructor(n) {
      super(n), this.tag = c.tag;
    }
    add(n) {
      let l;
      o.isPair(n) ? l = n : n && typeof n == "object" && "key" in n && "value" in n && n.value === null ? l = new d.Pair(n.key, null) : l = new d.Pair(n, null), p.findPair(this.items, l.key) || this.items.push(l);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(n, l) {
      const i = p.findPair(this.items, n);
      return !l && o.isPair(i) ? o.isScalar(i.key) ? i.key.value : i.key : i;
    }
    set(n, l) {
      if (typeof l != "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof l}`);
      const i = p.findPair(this.items, n);
      i && !l ? this.items.splice(this.items.indexOf(i), 1) : !i && l && this.items.push(new d.Pair(n));
    }
    toJSON(n, l) {
      return super.toJSON(n, l, Set);
    }
    toString(n, l, i) {
      if (!n)
        return JSON.stringify(this);
      if (this.hasAllNullValues(!0))
        return super.toString(Object.assign({}, n, { allNullValues: !0 }), l, i);
      throw new Error("Set items must all have null values");
    }
    static from(n, l, i) {
      const { replacer: a } = i, r = new this(n);
      if (l && Symbol.iterator in Object(l))
        for (let e of l)
          typeof a == "function" && (e = a.call(l, e, e)), r.items.push(d.createPair(e, null, i));
      return r;
    }
  }
  c.tag = "tag:yaml.org,2002:set";
  const h = {
    collection: "map",
    identify: (u) => u instanceof Set,
    nodeClass: c,
    default: !1,
    tag: "tag:yaml.org,2002:set",
    createNode: (u, n, l) => c.from(u, n, l),
    resolve(u, n) {
      if (o.isMap(u)) {
        if (u.hasAllNullValues(!0))
          return Object.assign(new c(), u);
        n("Set items must all have null values");
      } else
        n("Expected a mapping for this tag");
      return u;
    }
  };
  return Kn.YAMLSet = c, Kn.set = h, Kn;
}
var Wr = {}, lc;
function Rm() {
  if (lc) return Wr;
  lc = 1;
  var o = Sn();
  function d(n, l) {
    const i = n[0], a = i === "-" || i === "+" ? n.substring(1) : n, r = (t) => l ? BigInt(t) : Number(t), e = a.replace(/_/g, "").split(":").reduce((t, s) => t * r(60) + r(s), r(0));
    return i === "-" ? r(-1) * e : e;
  }
  function p(n) {
    let { value: l } = n, i = (t) => t;
    if (typeof l == "bigint")
      i = (t) => BigInt(t);
    else if (isNaN(l) || !isFinite(l))
      return o.stringifyNumber(n);
    let a = "";
    l < 0 && (a = "-", l *= i(-1));
    const r = i(60), e = [l % r];
    return l < 60 ? e.unshift(0) : (l = (l - e[0]) / r, e.unshift(l % r), l >= 60 && (l = (l - e[0]) / r, e.unshift(l))), a + e.map((t) => String(t).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  const c = {
    identify: (n) => typeof n == "bigint" || Number.isInteger(n),
    default: !0,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (n, l, { intAsBigInt: i }) => d(n, i),
    stringify: p
  }, h = {
    identify: (n) => typeof n == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (n) => d(n, !1),
    stringify: p
  }, u = {
    identify: (n) => n instanceof Date,
    default: !0,
    tag: "tag:yaml.org,2002:timestamp",
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
    resolve(n) {
      const l = n.match(u.test);
      if (!l)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, i, a, r, e, t, s] = l.map(Number), f = l[7] ? Number((l[7] + "00").substr(1, 3)) : 0;
      let g = Date.UTC(i, a - 1, r, e || 0, t || 0, s || 0, f);
      const m = l[8];
      if (m && m !== "Z") {
        let v = d(m, !1);
        Math.abs(v) < 30 && (v *= 60), g -= 6e4 * v;
      }
      return new Date(g);
    },
    stringify: ({ value: n }) => (n == null ? void 0 : n.toISOString().replace(/(T00:00:00)?\.000Z$/, "")) ?? ""
  };
  return Wr.floatTime = h, Wr.intTime = c, Wr.timestamp = u, Wr;
}
var uc;
function U0() {
  if (uc) return ca;
  uc = 1;
  var o = bn(), d = Ml(), p = En(), c = Ai(), h = Sm(), u = x0(), n = L0(), l = F0(), i = ql(), a = Am(), r = Bl(), e = Cm(), t = Rm();
  const s = [
    o.map,
    p.seq,
    c.string,
    d.nullTag,
    u.trueTag,
    u.falseTag,
    l.intBin,
    l.intOct,
    l.int,
    l.intHex,
    n.floatNaN,
    n.floatExp,
    n.float,
    h.binary,
    i.merge,
    a.omap,
    r.pairs,
    e.set,
    t.intTime,
    t.floatTime,
    t.timestamp
  ];
  return ca.schema = s, ca;
}
var cc;
function $0() {
  if (cc) return Gn;
  cc = 1;
  var o = bn(), d = Ml(), p = En(), c = Ai(), h = _m(), u = bm(), n = Em(), l = D0(), i = P0(), a = Sm(), r = ql(), e = Am(), t = Bl(), s = U0(), f = Cm(), g = Rm();
  const m = /* @__PURE__ */ new Map([
    ["core", l.schema],
    ["failsafe", [o.map, p.seq, c.string]],
    ["json", i.schema],
    ["yaml11", s.schema],
    ["yaml-1.1", s.schema]
  ]), v = {
    binary: a.binary,
    bool: h.boolTag,
    float: u.float,
    floatExp: u.floatExp,
    floatNaN: u.floatNaN,
    floatTime: g.floatTime,
    int: n.int,
    intHex: n.intHex,
    intOct: n.intOct,
    intTime: g.intTime,
    map: o.map,
    merge: r.merge,
    null: d.nullTag,
    omap: e.omap,
    pairs: t.pairs,
    seq: p.seq,
    set: f.set,
    timestamp: g.timestamp
  }, y = {
    "tag:yaml.org,2002:binary": a.binary,
    "tag:yaml.org,2002:merge": r.merge,
    "tag:yaml.org,2002:omap": e.omap,
    "tag:yaml.org,2002:pairs": t.pairs,
    "tag:yaml.org,2002:set": f.set,
    "tag:yaml.org,2002:timestamp": g.timestamp
  };
  function E(R, C, I) {
    const k = m.get(C);
    if (k && !R)
      return I && !k.includes(r.merge) ? k.concat(r.merge) : k.slice();
    let O = k;
    if (!O)
      if (Array.isArray(R))
        O = [];
      else {
        const A = Array.from(m.keys()).filter((M) => M !== "yaml11").map((M) => JSON.stringify(M)).join(", ");
        throw new Error(`Unknown schema "${C}"; use one of ${A} or define customTags array`);
      }
    if (Array.isArray(R))
      for (const A of R)
        O = O.concat(A);
    else typeof R == "function" && (O = R(O.slice()));
    return I && (O = O.concat(r.merge)), O.reduce((A, M) => {
      const z = typeof M == "string" ? v[M] : M;
      if (!z) {
        const U = JSON.stringify(M), j = Object.keys(v).map((B) => JSON.stringify(B)).join(", ");
        throw new Error(`Unknown custom tag ${U}; use one of ${j}`);
      }
      return A.includes(z) || A.push(z), A;
    }, []);
  }
  return Gn.coreKnownTags = y, Gn.getTags = E, Gn;
}
var fc;
function Om() {
  if (fc) return Xi;
  fc = 1;
  var o = Fe(), d = bn(), p = En(), c = Ai(), h = $0();
  const u = (l, i) => l.key < i.key ? -1 : l.key > i.key ? 1 : 0;
  let n = class Tm {
    constructor({ compat: i, customTags: a, merge: r, resolveKnownTags: e, schema: t, sortMapEntries: s, toStringDefaults: f }) {
      this.compat = Array.isArray(i) ? h.getTags(i, "compat") : i ? h.getTags(null, i) : null, this.name = typeof t == "string" && t || "core", this.knownTags = e ? h.coreKnownTags : {}, this.tags = h.getTags(a, this.name, r), this.toStringOptions = f ?? null, Object.defineProperty(this, o.MAP, { value: d.map }), Object.defineProperty(this, o.SCALAR, { value: c.string }), Object.defineProperty(this, o.SEQ, { value: p.seq }), this.sortMapEntries = typeof s == "function" ? s : s === !0 ? u : null;
    }
    clone() {
      const i = Object.create(Tm.prototype, Object.getOwnPropertyDescriptors(this));
      return i.tags = this.tags.slice(), i;
    }
  };
  return Xi.Schema = n, Xi;
}
var fa = {}, dc;
function q0() {
  if (dc) return fa;
  dc = 1;
  var o = Fe(), d = Si(), p = bi();
  function c(h, u) {
    var t;
    const n = [];
    let l = u.directives === !0;
    if (u.directives !== !1 && h.directives) {
      const s = h.directives.toString(h);
      s ? (n.push(s), l = !0) : h.directives.docStart && (l = !0);
    }
    l && n.push("---");
    const i = d.createStringifyContext(h, u), { commentString: a } = i.options;
    if (h.commentBefore) {
      n.length !== 1 && n.unshift("");
      const s = a(h.commentBefore);
      n.unshift(p.indentComment(s, ""));
    }
    let r = !1, e = null;
    if (h.contents) {
      if (o.isNode(h.contents)) {
        if (h.contents.spaceBefore && l && n.push(""), h.contents.commentBefore) {
          const g = a(h.contents.commentBefore);
          n.push(p.indentComment(g, ""));
        }
        i.forceBlockIndent = !!h.comment, e = h.contents.comment;
      }
      const s = e ? void 0 : () => r = !0;
      let f = d.stringify(h.contents, i, () => e = null, s);
      e && (f += p.lineComment(f, "", a(e))), (f[0] === "|" || f[0] === ">") && n[n.length - 1] === "---" ? n[n.length - 1] = `--- ${f}` : n.push(f);
    } else
      n.push(d.stringify(h.contents, i));
    if ((t = h.directives) != null && t.docEnd)
      if (h.comment) {
        const s = a(h.comment);
        s.includes(`
`) ? (n.push("..."), n.push(p.indentComment(s, ""))) : n.push(`... ${s}`);
      } else
        n.push("...");
    else {
      let s = h.comment;
      s && r && (s = s.replace(/^\n+/, "")), s && ((!r || e) && n[n.length - 1] !== "" && n.push(""), n.push(p.indentComment(a(s), "")));
    }
    return n.join(`
`) + `
`;
  }
  return fa.stringifyDocument = c, fa;
}
var hc;
function Ci() {
  if (hc) return Hi;
  hc = 1;
  var o = wi(), d = $l(), p = Fe(), c = fr(), h = cr(), u = Om(), n = q0(), l = Fl(), i = mm(), a = _i(), r = pm();
  let e = class km {
    constructor(f, g, m) {
      this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, p.NODE_TYPE, { value: p.DOC });
      let v = null;
      typeof g == "function" || Array.isArray(g) ? v = g : m === void 0 && g && (m = g, g = void 0);
      const y = Object.assign({
        intAsBigInt: !1,
        keepSourceTokens: !1,
        logLevel: "warn",
        prettyErrors: !0,
        strict: !0,
        stringKeys: !1,
        uniqueKeys: !0,
        version: "1.2"
      }, m);
      this.options = y;
      let { version: E } = y;
      m != null && m._directives ? (this.directives = m._directives.atDocument(), this.directives.yaml.explicit && (E = this.directives.yaml.version)) : this.directives = new r.Directives({ version: E }), this.setSchema(E, m), this.contents = f === void 0 ? null : this.createNode(f, v, m);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
      const f = Object.create(km.prototype, {
        [p.NODE_TYPE]: { value: p.DOC }
      });
      return f.commentBefore = this.commentBefore, f.comment = this.comment, f.errors = this.errors.slice(), f.warnings = this.warnings.slice(), f.options = Object.assign({}, this.options), this.directives && (f.directives = this.directives.clone()), f.schema = this.schema.clone(), f.contents = p.isNode(this.contents) ? this.contents.clone(f.schema) : this.contents, this.range && (f.range = this.range.slice()), f;
    }
    /** Adds a value to the document. */
    add(f) {
      t(this.contents) && this.contents.add(f);
    }
    /** Adds a value to the document. */
    addIn(f, g) {
      t(this.contents) && this.contents.addIn(f, g);
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
    createAlias(f, g) {
      if (!f.anchor) {
        const m = l.anchorNames(this);
        f.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !g || m.has(g) ? l.findNewAnchor(g || "a", m) : g;
      }
      return new o.Alias(f.anchor);
    }
    createNode(f, g, m) {
      let v;
      if (typeof g == "function")
        f = g.call({ "": f }, "", f), v = g;
      else if (Array.isArray(g)) {
        const j = (H) => typeof H == "number" || H instanceof String || H instanceof Number, B = g.filter(j).map(String);
        B.length > 0 && (g = g.concat(B)), v = g;
      } else m === void 0 && g && (m = g, g = void 0);
      const { aliasDuplicateObjects: y, anchorPrefix: E, flow: R, keepUndefined: C, onTagObj: I, tag: k } = m ?? {}, { onAnchor: O, setAnchors: A, sourceObjects: M } = l.createNodeAnchors(
        this,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        E || "a"
      ), z = {
        aliasDuplicateObjects: y ?? !0,
        keepUndefined: C ?? !1,
        onAnchor: O,
        onTagObj: I,
        replacer: v,
        schema: this.schema,
        sourceObjects: M
      }, U = a.createNode(f, k, z);
      return R && p.isCollection(U) && (U.flow = !0), A(), U;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(f, g, m = {}) {
      const v = this.createNode(f, null, m), y = this.createNode(g, null, m);
      return new c.Pair(v, y);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(f) {
      return t(this.contents) ? this.contents.delete(f) : !1;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(f) {
      return d.isEmptyPath(f) ? this.contents == null ? !1 : (this.contents = null, !0) : t(this.contents) ? this.contents.deleteIn(f) : !1;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(f, g) {
      return p.isCollection(this.contents) ? this.contents.get(f, g) : void 0;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(f, g) {
      return d.isEmptyPath(f) ? !g && p.isScalar(this.contents) ? this.contents.value : this.contents : p.isCollection(this.contents) ? this.contents.getIn(f, g) : void 0;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(f) {
      return p.isCollection(this.contents) ? this.contents.has(f) : !1;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(f) {
      return d.isEmptyPath(f) ? this.contents !== void 0 : p.isCollection(this.contents) ? this.contents.hasIn(f) : !1;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(f, g) {
      this.contents == null ? this.contents = d.collectionFromPath(this.schema, [f], g) : t(this.contents) && this.contents.set(f, g);
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(f, g) {
      d.isEmptyPath(f) ? this.contents = g : this.contents == null ? this.contents = d.collectionFromPath(this.schema, Array.from(f), g) : t(this.contents) && this.contents.setIn(f, g);
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(f, g = {}) {
      typeof f == "number" && (f = String(f));
      let m;
      switch (f) {
        case "1.1":
          this.directives ? this.directives.yaml.version = "1.1" : this.directives = new r.Directives({ version: "1.1" }), m = { resolveKnownTags: !1, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          this.directives ? this.directives.yaml.version = f : this.directives = new r.Directives({ version: f }), m = { resolveKnownTags: !0, schema: "core" };
          break;
        case null:
          this.directives && delete this.directives, m = null;
          break;
        default: {
          const v = JSON.stringify(f);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${v}`);
        }
      }
      if (g.schema instanceof Object)
        this.schema = g.schema;
      else if (m)
        this.schema = new u.Schema(Object.assign(m, g));
      else
        throw new Error("With a null YAML version, the { schema: Schema } option is required");
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json: f, jsonArg: g, mapAsMap: m, maxAliasCount: v, onAnchor: y, reviver: E } = {}) {
      const R = {
        anchors: /* @__PURE__ */ new Map(),
        doc: this,
        keep: !f,
        mapAsMap: m === !0,
        mapKeyWarned: !1,
        maxAliasCount: typeof v == "number" ? v : 100
      }, C = h.toJS(this.contents, g ?? "", R);
      if (typeof y == "function")
        for (const { count: I, res: k } of R.anchors.values())
          y(k, I);
      return typeof E == "function" ? i.applyReviver(E, { "": C }, "", C) : C;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(f, g) {
      return this.toJS({ json: !0, jsonArg: f, mapAsMap: !1, onAnchor: g });
    }
    /** A YAML representation of the document. */
    toString(f = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in f && (!Number.isInteger(f.indent) || Number(f.indent) <= 0)) {
        const g = JSON.stringify(f.indent);
        throw new Error(`"indent" option must be a positive integer, not ${g}`);
      }
      return n.stringifyDocument(this, f);
    }
  };
  function t(s) {
    if (p.isCollection(s))
      return !0;
    throw new Error("Expected a YAML collection as document contents");
  }
  return Hi.Document = e, Hi;
}
var Er = {}, pc;
function Ri() {
  if (pc) return Er;
  pc = 1;
  class o extends Error {
    constructor(u, n, l, i) {
      super(), this.name = u, this.code = l, this.message = i, this.pos = n;
    }
  }
  class d extends o {
    constructor(u, n, l) {
      super("YAMLParseError", u, n, l);
    }
  }
  class p extends o {
    constructor(u, n, l) {
      super("YAMLWarning", u, n, l);
    }
  }
  const c = (h, u) => (n) => {
    if (n.pos[0] === -1)
      return;
    n.linePos = n.pos.map((e) => u.linePos(e));
    const { line: l, col: i } = n.linePos[0];
    n.message += ` at line ${l}, column ${i}`;
    let a = i - 1, r = h.substring(u.lineStarts[l - 1], u.lineStarts[l]).replace(/[\n\r]+$/, "");
    if (a >= 60 && r.length > 80) {
      const e = Math.min(a - 39, r.length - 79);
      r = "…" + r.substring(e), a -= e - 1;
    }
    if (r.length > 80 && (r = r.substring(0, 79) + "…"), l > 1 && /^ *$/.test(r.substring(0, a))) {
      let e = h.substring(u.lineStarts[l - 2], u.lineStarts[l - 1]);
      e.length > 80 && (e = e.substring(0, 79) + `…
`), r = e + r;
    }
    if (/[^ ]/.test(r)) {
      let e = 1;
      const t = n.linePos[1];
      (t == null ? void 0 : t.line) === l && t.col > i && (e = Math.max(1, Math.min(t.col - i, 80 - a)));
      const s = " ".repeat(a) + "^".repeat(e);
      n.message += `:

${r}
${s}
`;
    }
  };
  return Er.YAMLError = o, Er.YAMLParseError = d, Er.YAMLWarning = p, Er.prettifyError = c, Er;
}
var da = {}, Vn = {}, ha = {}, pa = {}, ma = {}, mc;
function Ti() {
  if (mc) return ma;
  mc = 1;
  function o(d, { flow: p, indicator: c, next: h, offset: u, onError: n, parentIndent: l, startOnNewline: i }) {
    let a = !1, r = i, e = i, t = "", s = "", f = !1, g = !1, m = null, v = null, y = null, E = null, R = null, C = null, I = null;
    for (const A of d)
      switch (g && (A.type !== "space" && A.type !== "newline" && A.type !== "comma" && n(A.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), g = !1), m && (r && A.type !== "comment" && A.type !== "newline" && n(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), m = null), A.type) {
        case "space":
          !p && (c !== "doc-start" || (h == null ? void 0 : h.type) !== "flow-collection") && A.source.includes("	") && (m = A), e = !0;
          break;
        case "comment": {
          e || n(A, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const M = A.source.substring(1) || " ";
          t ? t += s + M : t = M, s = "", r = !1;
          break;
        }
        case "newline":
          r ? t ? t += A.source : (!C || c !== "seq-item-ind") && (a = !0) : s += A.source, r = !0, f = !0, (v || y) && (E = A), e = !0;
          break;
        case "anchor":
          v && n(A, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), A.source.endsWith(":") && n(A.offset + A.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), v = A, I ?? (I = A.offset), r = !1, e = !1, g = !0;
          break;
        case "tag": {
          y && n(A, "MULTIPLE_TAGS", "A node can have at most one tag"), y = A, I ?? (I = A.offset), r = !1, e = !1, g = !0;
          break;
        }
        case c:
          (v || y) && n(A, "BAD_PROP_ORDER", `Anchors and tags must be after the ${A.source} indicator`), C && n(A, "UNEXPECTED_TOKEN", `Unexpected ${A.source} in ${p ?? "collection"}`), C = A, r = c === "seq-item-ind" || c === "explicit-key-ind", e = !1;
          break;
        case "comma":
          if (p) {
            R && n(A, "UNEXPECTED_TOKEN", `Unexpected , in ${p}`), R = A, r = !1, e = !1;
            break;
          }
        // else fallthrough
        default:
          n(A, "UNEXPECTED_TOKEN", `Unexpected ${A.type} token`), r = !1, e = !1;
      }
    const k = d[d.length - 1], O = k ? k.offset + k.source.length : u;
    return g && h && h.type !== "space" && h.type !== "newline" && h.type !== "comma" && (h.type !== "scalar" || h.source !== "") && n(h.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), m && (r && m.indent <= l || (h == null ? void 0 : h.type) === "block-map" || (h == null ? void 0 : h.type) === "block-seq") && n(m, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
      comma: R,
      found: C,
      spaceBefore: a,
      comment: t,
      hasNewline: f,
      anchor: v,
      tag: y,
      newlineAfterProp: E,
      end: O,
      start: I ?? O
    };
  }
  return ma.resolveProps = o, ma;
}
var ga = {}, gc;
function jl() {
  if (gc) return ga;
  gc = 1;
  function o(d) {
    if (!d)
      return null;
    switch (d.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (d.source.includes(`
`))
          return !0;
        if (d.end) {
          for (const p of d.end)
            if (p.type === "newline")
              return !0;
        }
        return !1;
      case "flow-collection":
        for (const p of d.items) {
          for (const c of p.start)
            if (c.type === "newline")
              return !0;
          if (p.sep) {
            for (const c of p.sep)
              if (c.type === "newline")
                return !0;
          }
          if (o(p.key) || o(p.value))
            return !0;
        }
        return !1;
      default:
        return !0;
    }
  }
  return ga.containsNewline = o, ga;
}
var va = {}, vc;
function Nm() {
  if (vc) return va;
  vc = 1;
  var o = jl();
  function d(p, c, h) {
    if ((c == null ? void 0 : c.type) === "flow-collection") {
      const u = c.end[0];
      u.indent === p && (u.source === "]" || u.source === "}") && o.containsNewline(c) && h(u, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
    }
  }
  return va.flowIndentCheck = d, va;
}
var ya = {}, yc;
function Im() {
  if (yc) return ya;
  yc = 1;
  var o = Fe();
  function d(p, c, h) {
    const { uniqueKeys: u } = p.options;
    if (u === !1)
      return !1;
    const n = typeof u == "function" ? u : (l, i) => l === i || o.isScalar(l) && o.isScalar(i) && l.value === i.value;
    return c.some((l) => n(l.key, h));
  }
  return ya.mapIncludes = d, ya;
}
var wc;
function M0() {
  if (wc) return pa;
  wc = 1;
  var o = fr(), d = dr(), p = Ti(), c = jl(), h = Nm(), u = Im();
  const n = "All mapping items must start at the same column";
  function l({ composeNode: i, composeEmptyNode: a }, r, e, t, s) {
    var y;
    const f = (s == null ? void 0 : s.nodeClass) ?? d.YAMLMap, g = new f(r.schema);
    r.atRoot && (r.atRoot = !1);
    let m = e.offset, v = null;
    for (const E of e.items) {
      const { start: R, key: C, sep: I, value: k } = E, O = p.resolveProps(R, {
        indicator: "explicit-key-ind",
        next: C ?? (I == null ? void 0 : I[0]),
        offset: m,
        onError: t,
        parentIndent: e.indent,
        startOnNewline: !0
      }), A = !O.found;
      if (A) {
        if (C && (C.type === "block-seq" ? t(m, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in C && C.indent !== e.indent && t(m, "BAD_INDENT", n)), !O.anchor && !O.tag && !I) {
          v = O.end, O.comment && (g.comment ? g.comment += `
` + O.comment : g.comment = O.comment);
          continue;
        }
        (O.newlineAfterProp || c.containsNewline(C)) && t(C ?? R[R.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      } else ((y = O.found) == null ? void 0 : y.indent) !== e.indent && t(m, "BAD_INDENT", n);
      r.atKey = !0;
      const M = O.end, z = C ? i(r, C, O, t) : a(r, M, R, null, O, t);
      r.schema.compat && h.flowIndentCheck(e.indent, C, t), r.atKey = !1, u.mapIncludes(r, g.items, z) && t(M, "DUPLICATE_KEY", "Map keys must be unique");
      const U = p.resolveProps(I ?? [], {
        indicator: "map-value-ind",
        next: k,
        offset: z.range[2],
        onError: t,
        parentIndent: e.indent,
        startOnNewline: !C || C.type === "block-scalar"
      });
      if (m = U.end, U.found) {
        A && ((k == null ? void 0 : k.type) === "block-map" && !U.hasNewline && t(m, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), r.options.strict && O.start < U.found.offset - 1024 && t(z.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
        const j = k ? i(r, k, U, t) : a(r, m, I, null, U, t);
        r.schema.compat && h.flowIndentCheck(e.indent, k, t), m = j.range[2];
        const B = new o.Pair(z, j);
        r.options.keepSourceTokens && (B.srcToken = E), g.items.push(B);
      } else {
        A && t(z.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), U.comment && (z.comment ? z.comment += `
` + U.comment : z.comment = U.comment);
        const j = new o.Pair(z);
        r.options.keepSourceTokens && (j.srcToken = E), g.items.push(j);
      }
    }
    return v && v < m && t(v, "IMPOSSIBLE", "Map comment with trailing content"), g.range = [e.offset, m, v ?? m], g;
  }
  return pa.resolveBlockMap = l, pa;
}
var wa = {}, _c;
function B0() {
  if (_c) return wa;
  _c = 1;
  var o = hr(), d = Ti(), p = Nm();
  function c({ composeNode: h, composeEmptyNode: u }, n, l, i, a) {
    const r = (a == null ? void 0 : a.nodeClass) ?? o.YAMLSeq, e = new r(n.schema);
    n.atRoot && (n.atRoot = !1), n.atKey && (n.atKey = !1);
    let t = l.offset, s = null;
    for (const { start: f, value: g } of l.items) {
      const m = d.resolveProps(f, {
        indicator: "seq-item-ind",
        next: g,
        offset: t,
        onError: i,
        parentIndent: l.indent,
        startOnNewline: !0
      });
      if (!m.found)
        if (m.anchor || m.tag || g)
          (g == null ? void 0 : g.type) === "block-seq" ? i(m.end, "BAD_INDENT", "All sequence items must start at the same column") : i(t, "MISSING_CHAR", "Sequence item without - indicator");
        else {
          s = m.end, m.comment && (e.comment = m.comment);
          continue;
        }
      const v = g ? h(n, g, m, i) : u(n, m.end, f, null, m, i);
      n.schema.compat && p.flowIndentCheck(l.indent, g, i), t = v.range[2], e.items.push(v);
    }
    return e.range = [l.offset, t, s ?? t], e;
  }
  return wa.resolveBlockSeq = c, wa;
}
var _a = {}, ba = {}, bc;
function An() {
  if (bc) return ba;
  bc = 1;
  function o(d, p, c, h) {
    let u = "";
    if (d) {
      let n = !1, l = "";
      for (const i of d) {
        const { source: a, type: r } = i;
        switch (r) {
          case "space":
            n = !0;
            break;
          case "comment": {
            c && !n && h(i, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const e = a.substring(1) || " ";
            u ? u += l + e : u = e, l = "";
            break;
          }
          case "newline":
            u && (l += a), n = !0;
            break;
          default:
            h(i, "UNEXPECTED_TOKEN", `Unexpected ${r} at node end`);
        }
        p += a.length;
      }
    }
    return { comment: u, offset: p };
  }
  return ba.resolveEnd = o, ba;
}
var Ec;
function j0() {
  if (Ec) return _a;
  Ec = 1;
  var o = Fe(), d = fr(), p = dr(), c = hr(), h = An(), u = Ti(), n = jl(), l = Im();
  const i = "Block collections are not allowed within flow collections", a = (e) => e && (e.type === "block-map" || e.type === "block-seq");
  function r({ composeNode: e, composeEmptyNode: t }, s, f, g, m) {
    var z;
    const v = f.start.source === "{", y = v ? "flow map" : "flow sequence", E = (m == null ? void 0 : m.nodeClass) ?? (v ? p.YAMLMap : c.YAMLSeq), R = new E(s.schema);
    R.flow = !0;
    const C = s.atRoot;
    C && (s.atRoot = !1), s.atKey && (s.atKey = !1);
    let I = f.offset + f.start.source.length;
    for (let U = 0; U < f.items.length; ++U) {
      const j = f.items[U], { start: B, key: H, sep: te, value: N } = j, F = u.resolveProps(B, {
        flow: y,
        indicator: "explicit-key-ind",
        next: H ?? (te == null ? void 0 : te[0]),
        offset: I,
        onError: g,
        parentIndent: f.indent,
        startOnNewline: !1
      });
      if (!F.found) {
        if (!F.anchor && !F.tag && !te && !N) {
          U === 0 && F.comma ? g(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${y}`) : U < f.items.length - 1 && g(F.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${y}`), F.comment && (R.comment ? R.comment += `
` + F.comment : R.comment = F.comment), I = F.end;
          continue;
        }
        !v && s.options.strict && n.containsNewline(H) && g(
          H,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
      }
      if (U === 0)
        F.comma && g(F.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${y}`);
      else if (F.comma || g(F.start, "MISSING_CHAR", `Missing , between ${y} items`), F.comment) {
        let G = "";
        e: for (const Q of B)
          switch (Q.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              G = Q.source.substring(1);
              break e;
            default:
              break e;
          }
        if (G) {
          let Q = R.items[R.items.length - 1];
          o.isPair(Q) && (Q = Q.value ?? Q.key), Q.comment ? Q.comment += `
` + G : Q.comment = G, F.comment = F.comment.substring(G.length + 1);
        }
      }
      if (!v && !te && !F.found) {
        const G = N ? e(s, N, F, g) : t(s, F.end, te, null, F, g);
        R.items.push(G), I = G.range[2], a(N) && g(G.range, "BLOCK_IN_FLOW", i);
      } else {
        s.atKey = !0;
        const G = F.end, Q = H ? e(s, H, F, g) : t(s, G, B, null, F, g);
        a(H) && g(Q.range, "BLOCK_IN_FLOW", i), s.atKey = !1;
        const ce = u.resolveProps(te ?? [], {
          flow: y,
          indicator: "map-value-ind",
          next: N,
          offset: Q.range[2],
          onError: g,
          parentIndent: f.indent,
          startOnNewline: !1
        });
        if (ce.found) {
          if (!v && !F.found && s.options.strict) {
            if (te)
              for (const we of te) {
                if (we === ce.found)
                  break;
                if (we.type === "newline") {
                  g(we, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            F.start < ce.found.offset - 1024 && g(ce.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else N && ("source" in N && ((z = N.source) == null ? void 0 : z[0]) === ":" ? g(N, "MISSING_CHAR", `Missing space after : in ${y}`) : g(ce.start, "MISSING_CHAR", `Missing , or : between ${y} items`));
        const ae = N ? e(s, N, ce, g) : ce.found ? t(s, ce.end, te, null, ce, g) : null;
        ae ? a(N) && g(ae.range, "BLOCK_IN_FLOW", i) : ce.comment && (Q.comment ? Q.comment += `
` + ce.comment : Q.comment = ce.comment);
        const ve = new d.Pair(Q, ae);
        if (s.options.keepSourceTokens && (ve.srcToken = j), v) {
          const we = R;
          l.mapIncludes(s, we.items, Q) && g(G, "DUPLICATE_KEY", "Map keys must be unique"), we.items.push(ve);
        } else {
          const we = new p.YAMLMap(s.schema);
          we.flow = !0, we.items.push(ve);
          const ie = (ae ?? Q).range;
          we.range = [Q.range[0], ie[1], ie[2]], R.items.push(we);
        }
        I = ae ? ae.range[2] : ce.end;
      }
    }
    const k = v ? "}" : "]", [O, ...A] = f.end;
    let M = I;
    if ((O == null ? void 0 : O.source) === k)
      M = O.offset + O.source.length;
    else {
      const U = y[0].toUpperCase() + y.substring(1), j = C ? `${U} must end with a ${k}` : `${U} in block collection must be sufficiently indented and end with a ${k}`;
      g(I, C ? "MISSING_CHAR" : "BAD_INDENT", j), O && O.source.length !== 1 && A.unshift(O);
    }
    if (A.length > 0) {
      const U = h.resolveEnd(A, M, s.options.strict, g);
      U.comment && (R.comment ? R.comment += `
` + U.comment : R.comment = U.comment), R.range = [f.offset, M, U.offset];
    } else
      R.range = [f.offset, M, M];
    return R;
  }
  return _a.resolveFlowCollection = r, _a;
}
var Sc;
function H0() {
  if (Sc) return ha;
  Sc = 1;
  var o = Fe(), d = nt(), p = dr(), c = hr(), h = M0(), u = B0(), n = j0();
  function l(a, r, e, t, s, f) {
    const g = e.type === "block-map" ? h.resolveBlockMap(a, r, e, t, f) : e.type === "block-seq" ? u.resolveBlockSeq(a, r, e, t, f) : n.resolveFlowCollection(a, r, e, t, f), m = g.constructor;
    return s === "!" || s === m.tagName ? (g.tag = m.tagName, g) : (s && (g.tag = s), g);
  }
  function i(a, r, e, t, s) {
    var C;
    const f = t.tag, g = f ? r.directives.tagName(f.source, (I) => s(f, "TAG_RESOLVE_FAILED", I)) : null;
    if (e.type === "block-seq") {
      const { anchor: I, newlineAfterProp: k } = t, O = I && f ? I.offset > f.offset ? I : f : I ?? f;
      O && (!k || k.offset < O.offset) && s(O, "MISSING_CHAR", "Missing newline after block sequence props");
    }
    const m = e.type === "block-map" ? "map" : e.type === "block-seq" ? "seq" : e.start.source === "{" ? "map" : "seq";
    if (!f || !g || g === "!" || g === p.YAMLMap.tagName && m === "map" || g === c.YAMLSeq.tagName && m === "seq")
      return l(a, r, e, s, g);
    let v = r.schema.tags.find((I) => I.tag === g && I.collection === m);
    if (!v) {
      const I = r.schema.knownTags[g];
      if ((I == null ? void 0 : I.collection) === m)
        r.schema.tags.push(Object.assign({}, I, { default: !1 })), v = I;
      else
        return I ? s(f, "BAD_COLLECTION_TYPE", `${I.tag} used for ${m} collection, but expects ${I.collection ?? "scalar"}`, !0) : s(f, "TAG_RESOLVE_FAILED", `Unresolved tag: ${g}`, !0), l(a, r, e, s, g);
    }
    const y = l(a, r, e, s, g, v), E = ((C = v.resolve) == null ? void 0 : C.call(v, y, (I) => s(f, "TAG_RESOLVE_FAILED", I), r.options)) ?? y, R = o.isNode(E) ? E : new d.Scalar(E);
    return R.range = y.range, R.tag = g, v != null && v.format && (R.format = v.format), R;
  }
  return ha.composeCollection = i, ha;
}
var Ea = {}, Sa = {}, Ac;
function Dm() {
  if (Ac) return Sa;
  Ac = 1;
  var o = nt();
  function d(h, u, n) {
    const l = u.offset, i = p(u, h.options.strict, n);
    if (!i)
      return { value: "", type: null, comment: "", range: [l, l, l] };
    const a = i.mode === ">" ? o.Scalar.BLOCK_FOLDED : o.Scalar.BLOCK_LITERAL, r = u.source ? c(u.source) : [];
    let e = r.length;
    for (let E = r.length - 1; E >= 0; --E) {
      const R = r[E][1];
      if (R === "" || R === "\r")
        e = E;
      else
        break;
    }
    if (e === 0) {
      const E = i.chomp === "+" && r.length > 0 ? `
`.repeat(Math.max(1, r.length - 1)) : "";
      let R = l + i.length;
      return u.source && (R += u.source.length), { value: E, type: a, comment: i.comment, range: [l, R, R] };
    }
    let t = u.indent + i.indent, s = u.offset + i.length, f = 0;
    for (let E = 0; E < e; ++E) {
      const [R, C] = r[E];
      if (C === "" || C === "\r")
        i.indent === 0 && R.length > t && (t = R.length);
      else {
        R.length < t && n(s + R.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), i.indent === 0 && (t = R.length), f = E, t === 0 && !h.atRoot && n(s, "BAD_INDENT", "Block scalar values in collections must be indented");
        break;
      }
      s += R.length + C.length + 1;
    }
    for (let E = r.length - 1; E >= e; --E)
      r[E][0].length > t && (e = E + 1);
    let g = "", m = "", v = !1;
    for (let E = 0; E < f; ++E)
      g += r[E][0].slice(t) + `
`;
    for (let E = f; E < e; ++E) {
      let [R, C] = r[E];
      s += R.length + C.length + 1;
      const I = C[C.length - 1] === "\r";
      if (I && (C = C.slice(0, -1)), C && R.length < t) {
        const O = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
        n(s - C.length - (I ? 2 : 1), "BAD_INDENT", O), R = "";
      }
      a === o.Scalar.BLOCK_LITERAL ? (g += m + R.slice(t) + C, m = `
`) : R.length > t || C[0] === "	" ? (m === " " ? m = `
` : !v && m === `
` && (m = `

`), g += m + R.slice(t) + C, m = `
`, v = !0) : C === "" ? m === `
` ? g += `
` : m = `
` : (g += m + C, m = " ", v = !1);
    }
    switch (i.chomp) {
      case "-":
        break;
      case "+":
        for (let E = e; E < r.length; ++E)
          g += `
` + r[E][0].slice(t);
        g[g.length - 1] !== `
` && (g += `
`);
        break;
      default:
        g += `
`;
    }
    const y = l + i.length + u.source.length;
    return { value: g, type: a, comment: i.comment, range: [l, y, y] };
  }
  function p({ offset: h, props: u }, n, l) {
    if (u[0].type !== "block-scalar-header")
      return l(u[0], "IMPOSSIBLE", "Block scalar header not found"), null;
    const { source: i } = u[0], a = i[0];
    let r = 0, e = "", t = -1;
    for (let m = 1; m < i.length; ++m) {
      const v = i[m];
      if (!e && (v === "-" || v === "+"))
        e = v;
      else {
        const y = Number(v);
        !r && y ? r = y : t === -1 && (t = h + m);
      }
    }
    t !== -1 && l(t, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${i}`);
    let s = !1, f = "", g = i.length;
    for (let m = 1; m < u.length; ++m) {
      const v = u[m];
      switch (v.type) {
        case "space":
          s = !0;
        // fallthrough
        case "newline":
          g += v.source.length;
          break;
        case "comment":
          n && !s && l(v, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), g += v.source.length, f = v.source.substring(1);
          break;
        case "error":
          l(v, "UNEXPECTED_TOKEN", v.message), g += v.source.length;
          break;
        /* istanbul ignore next should not happen */
        default: {
          const y = `Unexpected token in block scalar header: ${v.type}`;
          l(v, "UNEXPECTED_TOKEN", y);
          const E = v.source;
          E && typeof E == "string" && (g += E.length);
        }
      }
    }
    return { mode: a, indent: r, chomp: e, comment: f, length: g };
  }
  function c(h) {
    const u = h.split(/\n( *)/), n = u[0], l = n.match(/^( *)/), a = [l != null && l[1] ? [l[1], n.slice(l[1].length)] : ["", n]];
    for (let r = 1; r < u.length; r += 2)
      a.push([u[r], u[r + 1]]);
    return a;
  }
  return Sa.resolveBlockScalar = d, Sa;
}
var Aa = {}, Cc;
function Pm() {
  if (Cc) return Aa;
  Cc = 1;
  var o = nt(), d = An();
  function p(r, e, t) {
    const { offset: s, type: f, source: g, end: m } = r;
    let v, y;
    const E = (I, k, O) => t(s + I, k, O);
    switch (f) {
      case "scalar":
        v = o.Scalar.PLAIN, y = c(g, E);
        break;
      case "single-quoted-scalar":
        v = o.Scalar.QUOTE_SINGLE, y = h(g, E);
        break;
      case "double-quoted-scalar":
        v = o.Scalar.QUOTE_DOUBLE, y = n(g, E);
        break;
      /* istanbul ignore next should not happen */
      default:
        return t(r, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${f}`), {
          value: "",
          type: null,
          comment: "",
          range: [s, s + g.length, s + g.length]
        };
    }
    const R = s + g.length, C = d.resolveEnd(m, R, e, t);
    return {
      value: y,
      type: v,
      comment: C.comment,
      range: [s, R, C.offset]
    };
  }
  function c(r, e) {
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
    return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), u(r);
  }
  function h(r, e) {
    return (r[r.length - 1] !== "'" || r.length === 1) && e(r.length, "MISSING_CHAR", "Missing closing 'quote"), u(r.slice(1, -1)).replace(/''/g, "'");
  }
  function u(r) {
    let e, t;
    try {
      e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let s = e.exec(r);
    if (!s)
      return r;
    let f = s[1], g = " ", m = e.lastIndex;
    for (t.lastIndex = m; s = t.exec(r); )
      s[1] === "" ? g === `
` ? f += g : g = `
` : (f += g + s[1], g = " "), m = t.lastIndex;
    const v = /[ \t]*(.*)/sy;
    return v.lastIndex = m, s = v.exec(r), f + g + ((s == null ? void 0 : s[1]) ?? "");
  }
  function n(r, e) {
    let t = "";
    for (let s = 1; s < r.length - 1; ++s) {
      const f = r[s];
      if (!(f === "\r" && r[s + 1] === `
`))
        if (f === `
`) {
          const { fold: g, offset: m } = l(r, s);
          t += g, s = m;
        } else if (f === "\\") {
          let g = r[++s];
          const m = i[g];
          if (m)
            t += m;
          else if (g === `
`)
            for (g = r[s + 1]; g === " " || g === "	"; )
              g = r[++s + 1];
          else if (g === "\r" && r[s + 1] === `
`)
            for (g = r[++s + 1]; g === " " || g === "	"; )
              g = r[++s + 1];
          else if (g === "x" || g === "u" || g === "U") {
            const v = { x: 2, u: 4, U: 8 }[g];
            t += a(r, s + 1, v, e), s += v;
          } else {
            const v = r.substr(s - 1, 2);
            e(s - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${v}`), t += v;
          }
        } else if (f === " " || f === "	") {
          const g = s;
          let m = r[s + 1];
          for (; m === " " || m === "	"; )
            m = r[++s + 1];
          m !== `
` && !(m === "\r" && r[s + 2] === `
`) && (t += s > g ? r.slice(g, s + 1) : f);
        } else
          t += f;
    }
    return (r[r.length - 1] !== '"' || r.length === 1) && e(r.length, "MISSING_CHAR", 'Missing closing "quote'), t;
  }
  function l(r, e) {
    let t = "", s = r[e + 1];
    for (; (s === " " || s === "	" || s === `
` || s === "\r") && !(s === "\r" && r[e + 2] !== `
`); )
      s === `
` && (t += `
`), e += 1, s = r[e + 1];
    return t || (t = " "), { fold: t, offset: e };
  }
  const i = {
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
  function a(r, e, t, s) {
    const f = r.substr(e, t), m = f.length === t && /^[0-9a-fA-F]+$/.test(f) ? parseInt(f, 16) : NaN;
    if (isNaN(m)) {
      const v = r.substr(e - 2, t + 2);
      return s(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${v}`), v;
    }
    return String.fromCodePoint(m);
  }
  return Aa.resolveFlowScalar = p, Aa;
}
var Rc;
function z0() {
  if (Rc) return Ea;
  Rc = 1;
  var o = Fe(), d = nt(), p = Dm(), c = Pm();
  function h(l, i, a, r) {
    const { value: e, type: t, comment: s, range: f } = i.type === "block-scalar" ? p.resolveBlockScalar(l, i, r) : c.resolveFlowScalar(i, l.options.strict, r), g = a ? l.directives.tagName(a.source, (y) => r(a, "TAG_RESOLVE_FAILED", y)) : null;
    let m;
    l.options.stringKeys && l.atKey ? m = l.schema[o.SCALAR] : g ? m = u(l.schema, e, g, a, r) : i.type === "scalar" ? m = n(l, e, i, r) : m = l.schema[o.SCALAR];
    let v;
    try {
      const y = m.resolve(e, (E) => r(a ?? i, "TAG_RESOLVE_FAILED", E), l.options);
      v = o.isScalar(y) ? y : new d.Scalar(y);
    } catch (y) {
      const E = y instanceof Error ? y.message : String(y);
      r(a ?? i, "TAG_RESOLVE_FAILED", E), v = new d.Scalar(e);
    }
    return v.range = f, v.source = e, t && (v.type = t), g && (v.tag = g), m.format && (v.format = m.format), s && (v.comment = s), v;
  }
  function u(l, i, a, r, e) {
    var f;
    if (a === "!")
      return l[o.SCALAR];
    const t = [];
    for (const g of l.tags)
      if (!g.collection && g.tag === a)
        if (g.default && g.test)
          t.push(g);
        else
          return g;
    for (const g of t)
      if ((f = g.test) != null && f.test(i))
        return g;
    const s = l.knownTags[a];
    return s && !s.collection ? (l.tags.push(Object.assign({}, s, { default: !1, test: void 0 })), s) : (e(r, "TAG_RESOLVE_FAILED", `Unresolved tag: ${a}`, a !== "tag:yaml.org,2002:str"), l[o.SCALAR]);
  }
  function n({ atKey: l, directives: i, schema: a }, r, e, t) {
    const s = a.tags.find((f) => {
      var g;
      return (f.default === !0 || l && f.default === "key") && ((g = f.test) == null ? void 0 : g.test(r));
    }) || a[o.SCALAR];
    if (a.compat) {
      const f = a.compat.find((g) => {
        var m;
        return g.default && ((m = g.test) == null ? void 0 : m.test(r));
      }) ?? a[o.SCALAR];
      if (s.tag !== f.tag) {
        const g = i.tagString(s.tag), m = i.tagString(f.tag), v = `Value may be parsed as either ${g} or ${m}`;
        t(e, "TAG_RESOLVE_FAILED", v, !0);
      }
    }
    return s;
  }
  return Ea.composeScalar = h, Ea;
}
var Ca = {}, Tc;
function G0() {
  if (Tc) return Ca;
  Tc = 1;
  function o(d, p, c) {
    if (p) {
      c ?? (c = p.length);
      for (let h = c - 1; h >= 0; --h) {
        let u = p[h];
        switch (u.type) {
          case "space":
          case "comment":
          case "newline":
            d -= u.source.length;
            continue;
        }
        for (u = p[++h]; (u == null ? void 0 : u.type) === "space"; )
          d += u.source.length, u = p[++h];
        break;
      }
    }
    return d;
  }
  return Ca.emptyScalarPosition = o, Ca;
}
var Oc;
function W0() {
  if (Oc) return Vn;
  Oc = 1;
  var o = wi(), d = Fe(), p = H0(), c = z0(), h = An(), u = G0();
  const n = { composeNode: l, composeEmptyNode: i };
  function l(r, e, t, s) {
    const f = r.atKey, { spaceBefore: g, comment: m, anchor: v, tag: y } = t;
    let E, R = !0;
    switch (e.type) {
      case "alias":
        E = a(r, e, s), (v || y) && s(e, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        E = c.composeScalar(r, e, y, s), v && (E.anchor = v.source.substring(1));
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        E = p.composeCollection(n, r, e, t, s), v && (E.anchor = v.source.substring(1));
        break;
      default: {
        const C = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
        s(e, "UNEXPECTED_TOKEN", C), E = i(r, e.offset, void 0, null, t, s), R = !1;
      }
    }
    return v && E.anchor === "" && s(v, "BAD_ALIAS", "Anchor cannot be an empty string"), f && r.options.stringKeys && (!d.isScalar(E) || typeof E.value != "string" || E.tag && E.tag !== "tag:yaml.org,2002:str") && s(y ?? e, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), g && (E.spaceBefore = !0), m && (e.type === "scalar" && e.source === "" ? E.comment = m : E.commentBefore = m), r.options.keepSourceTokens && R && (E.srcToken = e), E;
  }
  function i(r, e, t, s, { spaceBefore: f, comment: g, anchor: m, tag: v, end: y }, E) {
    const R = {
      type: "scalar",
      offset: u.emptyScalarPosition(e, t, s),
      indent: -1,
      source: ""
    }, C = c.composeScalar(r, R, v, E);
    return m && (C.anchor = m.source.substring(1), C.anchor === "" && E(m, "BAD_ALIAS", "Anchor cannot be an empty string")), f && (C.spaceBefore = !0), g && (C.comment = g, C.range[2] = y), C;
  }
  function a({ options: r }, { offset: e, source: t, end: s }, f) {
    const g = new o.Alias(t.substring(1));
    g.source === "" && f(e, "BAD_ALIAS", "Alias cannot be an empty string"), g.source.endsWith(":") && f(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
    const m = e + t.length, v = h.resolveEnd(s, m, r.strict, f);
    return g.range = [e, m, v.offset], v.comment && (g.comment = v.comment), g;
  }
  return Vn.composeEmptyNode = i, Vn.composeNode = l, Vn;
}
var kc;
function Y0() {
  if (kc) return da;
  kc = 1;
  var o = Ci(), d = W0(), p = An(), c = Ti();
  function h(u, n, { offset: l, start: i, value: a, end: r }, e) {
    const t = Object.assign({ _directives: n }, u), s = new o.Document(void 0, t), f = {
      atKey: !1,
      atRoot: !0,
      directives: s.directives,
      options: s.options,
      schema: s.schema
    }, g = c.resolveProps(i, {
      indicator: "doc-start",
      next: a ?? (r == null ? void 0 : r[0]),
      offset: l,
      onError: e,
      parentIndent: 0,
      startOnNewline: !0
    });
    g.found && (s.directives.docStart = !0, a && (a.type === "block-map" || a.type === "block-seq") && !g.hasNewline && e(g.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), s.contents = a ? d.composeNode(f, a, g, e) : d.composeEmptyNode(f, g.end, i, null, g, e);
    const m = s.contents.range[2], v = p.resolveEnd(r, m, !1, e);
    return v.comment && (s.comment = v.comment), s.range = [l, m, v.offset], s;
  }
  return da.composeDoc = h, da;
}
var Nc;
function xm() {
  if (Nc) return Bi;
  Nc = 1;
  var o = Pl, d = pm(), p = Ci(), c = Ri(), h = Fe(), u = Y0(), n = An();
  function l(r) {
    if (typeof r == "number")
      return [r, r + 1];
    if (Array.isArray(r))
      return r.length === 2 ? r : [r[0], r[1]];
    const { offset: e, source: t } = r;
    return [e, e + (typeof t == "string" ? t.length : 1)];
  }
  function i(r) {
    var f;
    let e = "", t = !1, s = !1;
    for (let g = 0; g < r.length; ++g) {
      const m = r[g];
      switch (m[0]) {
        case "#":
          e += (e === "" ? "" : s ? `

` : `
`) + (m.substring(1) || " "), t = !0, s = !1;
          break;
        case "%":
          ((f = r[g + 1]) == null ? void 0 : f[0]) !== "#" && (g += 1), t = !1;
          break;
        default:
          t || (s = !0), t = !1;
      }
    }
    return { comment: e, afterEmptyLine: s };
  }
  class a {
    constructor(e = {}) {
      this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, s, f, g) => {
        const m = l(t);
        g ? this.warnings.push(new c.YAMLWarning(m, s, f)) : this.errors.push(new c.YAMLParseError(m, s, f));
      }, this.directives = new d.Directives({ version: e.version || "1.2" }), this.options = e;
    }
    decorate(e, t) {
      const { comment: s, afterEmptyLine: f } = i(this.prelude);
      if (s) {
        const g = e.contents;
        if (t)
          e.comment = e.comment ? `${e.comment}
${s}` : s;
        else if (f || e.directives.docStart || !g)
          e.commentBefore = s;
        else if (h.isCollection(g) && !g.flow && g.items.length > 0) {
          let m = g.items[0];
          h.isPair(m) && (m = m.key);
          const v = m.commentBefore;
          m.commentBefore = v ? `${s}
${v}` : s;
        } else {
          const m = g.commentBefore;
          g.commentBefore = m ? `${s}
${m}` : s;
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
        comment: i(this.prelude).comment,
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
    *compose(e, t = !1, s = -1) {
      for (const f of e)
        yield* this.next(f);
      yield* this.end(t, s);
    }
    /** Advance the composer by one CST token. */
    *next(e) {
      switch (o.env.LOG_STREAM && console.dir(e, { depth: null }), e.type) {
        case "directive":
          this.directives.add(e.source, (t, s, f) => {
            const g = l(e);
            g[0] += t, this.onError(g, "BAD_DIRECTIVE", s, f);
          }), this.prelude.push(e.source), this.atDirectives = !0;
          break;
        case "document": {
          const t = u.composeDoc(this.options, this.directives, e, this.onError);
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
          const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, s = new c.YAMLParseError(l(e), "UNEXPECTED_TOKEN", t);
          this.atDirectives || !this.doc ? this.errors.push(s) : this.doc.errors.push(s);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const s = "Unexpected doc-end without preceding document";
            this.errors.push(new c.YAMLParseError(l(e), "UNEXPECTED_TOKEN", s));
            break;
          }
          this.doc.directives.docEnd = !0;
          const t = n.resolveEnd(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
          if (this.decorate(this.doc, !0), t.comment) {
            const s = this.doc.comment;
            this.doc.comment = s ? `${s}
${t.comment}` : t.comment;
          }
          this.doc.range[2] = t.offset;
          break;
        }
        default:
          this.errors.push(new c.YAMLParseError(l(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
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
        const s = Object.assign({ _directives: this.directives }, this.options), f = new p.Document(void 0, s);
        this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), f.range = [0, t, t], this.decorate(f, !1), yield f;
      }
    }
  }
  return Bi.Composer = a, Bi;
}
var ht = {}, Yr = {}, Ic;
function K0() {
  if (Ic) return Yr;
  Ic = 1;
  var o = Dm(), d = Pm(), p = Ri(), c = Ei();
  function h(r, e = !0, t) {
    if (r) {
      const s = (f, g, m) => {
        const v = typeof f == "number" ? f : Array.isArray(f) ? f[0] : f.offset;
        if (t)
          t(v, g, m);
        else
          throw new p.YAMLParseError([v, v + 1], g, m);
      };
      switch (r.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return d.resolveFlowScalar(r, e, s);
        case "block-scalar":
          return o.resolveBlockScalar({ options: { strict: e } }, r, s);
      }
    }
    return null;
  }
  function u(r, e) {
    const { implicitKey: t = !1, indent: s, inFlow: f = !1, offset: g = -1, type: m = "PLAIN" } = e, v = c.stringifyString({ type: m, value: r }, {
      implicitKey: t,
      indent: s > 0 ? " ".repeat(s) : "",
      inFlow: f,
      options: { blockQuote: !0, lineWidth: -1 }
    }), y = e.end ?? [
      { type: "newline", offset: -1, indent: s, source: `
` }
    ];
    switch (v[0]) {
      case "|":
      case ">": {
        const E = v.indexOf(`
`), R = v.substring(0, E), C = v.substring(E + 1) + `
`, I = [
          { type: "block-scalar-header", offset: g, indent: s, source: R }
        ];
        return i(I, y) || I.push({ type: "newline", offset: -1, indent: s, source: `
` }), { type: "block-scalar", offset: g, indent: s, props: I, source: C };
      }
      case '"':
        return { type: "double-quoted-scalar", offset: g, indent: s, source: v, end: y };
      case "'":
        return { type: "single-quoted-scalar", offset: g, indent: s, source: v, end: y };
      default:
        return { type: "scalar", offset: g, indent: s, source: v, end: y };
    }
  }
  function n(r, e, t = {}) {
    let { afterKey: s = !1, implicitKey: f = !1, inFlow: g = !1, type: m } = t, v = "indent" in r ? r.indent : null;
    if (s && typeof v == "number" && (v += 2), !m)
      switch (r.type) {
        case "single-quoted-scalar":
          m = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          m = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const E = r.props[0];
          if (E.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          m = E.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          m = "PLAIN";
      }
    const y = c.stringifyString({ type: m, value: e }, {
      implicitKey: f || v === null,
      indent: v !== null && v > 0 ? " ".repeat(v) : "",
      inFlow: g,
      options: { blockQuote: !0, lineWidth: -1 }
    });
    switch (y[0]) {
      case "|":
      case ">":
        l(r, y);
        break;
      case '"':
        a(r, y, "double-quoted-scalar");
        break;
      case "'":
        a(r, y, "single-quoted-scalar");
        break;
      default:
        a(r, y, "scalar");
    }
  }
  function l(r, e) {
    const t = e.indexOf(`
`), s = e.substring(0, t), f = e.substring(t + 1) + `
`;
    if (r.type === "block-scalar") {
      const g = r.props[0];
      if (g.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      g.source = s, r.source = f;
    } else {
      const { offset: g } = r, m = "indent" in r ? r.indent : -1, v = [
        { type: "block-scalar-header", offset: g, indent: m, source: s }
      ];
      i(v, "end" in r ? r.end : void 0) || v.push({ type: "newline", offset: -1, indent: m, source: `
` });
      for (const y of Object.keys(r))
        y !== "type" && y !== "offset" && delete r[y];
      Object.assign(r, { type: "block-scalar", indent: m, props: v, source: f });
    }
  }
  function i(r, e) {
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
  function a(r, e, t) {
    switch (r.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        r.type = t, r.source = e;
        break;
      case "block-scalar": {
        const s = r.props.slice(1);
        let f = e.length;
        r.props[0].type === "block-scalar-header" && (f -= r.props[0].source.length);
        for (const g of s)
          g.offset += f;
        delete r.props, Object.assign(r, { type: t, source: e, end: s });
        break;
      }
      case "block-map":
      case "block-seq": {
        const f = { type: "newline", offset: r.offset + e.length, indent: r.indent, source: `
` };
        delete r.items, Object.assign(r, { type: t, source: e, end: [f] });
        break;
      }
      default: {
        const s = "indent" in r ? r.indent : -1, f = "end" in r && Array.isArray(r.end) ? r.end.filter((g) => g.type === "space" || g.type === "comment" || g.type === "newline") : [];
        for (const g of Object.keys(r))
          g !== "type" && g !== "offset" && delete r[g];
        Object.assign(r, { type: t, indent: s, source: e, end: f });
      }
    }
  }
  return Yr.createScalarToken = u, Yr.resolveAsScalar = h, Yr.setScalarValue = n, Yr;
}
var Ra = {}, Dc;
function V0() {
  if (Dc) return Ra;
  Dc = 1;
  const o = (c) => "type" in c ? d(c) : p(c);
  function d(c) {
    switch (c.type) {
      case "block-scalar": {
        let h = "";
        for (const u of c.props)
          h += d(u);
        return h + c.source;
      }
      case "block-map":
      case "block-seq": {
        let h = "";
        for (const u of c.items)
          h += p(u);
        return h;
      }
      case "flow-collection": {
        let h = c.start.source;
        for (const u of c.items)
          h += p(u);
        for (const u of c.end)
          h += u.source;
        return h;
      }
      case "document": {
        let h = p(c);
        if (c.end)
          for (const u of c.end)
            h += u.source;
        return h;
      }
      default: {
        let h = c.source;
        if ("end" in c && c.end)
          for (const u of c.end)
            h += u.source;
        return h;
      }
    }
  }
  function p({ start: c, key: h, sep: u, value: n }) {
    let l = "";
    for (const i of c)
      l += i.source;
    if (h && (l += d(h)), u)
      for (const i of u)
        l += i.source;
    return n && (l += d(n)), l;
  }
  return Ra.stringify = o, Ra;
}
var Ta = {}, Pc;
function J0() {
  if (Pc) return Ta;
  Pc = 1;
  const o = Symbol("break visit"), d = Symbol("skip children"), p = Symbol("remove item");
  function c(u, n) {
    "type" in u && u.type === "document" && (u = { start: u.start, value: u.value }), h(Object.freeze([]), u, n);
  }
  c.BREAK = o, c.SKIP = d, c.REMOVE = p, c.itemAtPath = (u, n) => {
    let l = u;
    for (const [i, a] of n) {
      const r = l == null ? void 0 : l[i];
      if (r && "items" in r)
        l = r.items[a];
      else
        return;
    }
    return l;
  }, c.parentCollection = (u, n) => {
    const l = c.itemAtPath(u, n.slice(0, -1)), i = n[n.length - 1][0], a = l == null ? void 0 : l[i];
    if (a && "items" in a)
      return a;
    throw new Error("Parent collection not found");
  };
  function h(u, n, l) {
    let i = l(n, u);
    if (typeof i == "symbol")
      return i;
    for (const a of ["key", "value"]) {
      const r = n[a];
      if (r && "items" in r) {
        for (let e = 0; e < r.items.length; ++e) {
          const t = h(Object.freeze(u.concat([[a, e]])), r.items[e], l);
          if (typeof t == "number")
            e = t - 1;
          else {
            if (t === o)
              return o;
            t === p && (r.items.splice(e, 1), e -= 1);
          }
        }
        typeof i == "function" && a === "key" && (i = i(n, u));
      }
    }
    return typeof i == "function" ? i(n, u) : i;
  }
  return Ta.visit = c, Ta;
}
var xc;
function Hl() {
  if (xc) return ht;
  xc = 1;
  var o = K0(), d = V0(), p = J0();
  const c = "\uFEFF", h = "", u = "", n = "", l = (e) => !!e && "items" in e, i = (e) => !!e && (e.type === "scalar" || e.type === "single-quoted-scalar" || e.type === "double-quoted-scalar" || e.type === "block-scalar");
  function a(e) {
    switch (e) {
      case c:
        return "<BOM>";
      case h:
        return "<DOC>";
      case u:
        return "<FLOW_END>";
      case n:
        return "<SCALAR>";
      default:
        return JSON.stringify(e);
    }
  }
  function r(e) {
    switch (e) {
      case c:
        return "byte-order-mark";
      case h:
        return "doc-mode";
      case u:
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
  return ht.createScalarToken = o.createScalarToken, ht.resolveAsScalar = o.resolveAsScalar, ht.setScalarValue = o.setScalarValue, ht.stringify = d.stringify, ht.visit = p.visit, ht.BOM = c, ht.DOCUMENT = h, ht.FLOW_END = u, ht.SCALAR = n, ht.isCollection = l, ht.isScalar = i, ht.prettyToken = a, ht.tokenType = r, ht;
}
var Oa = {}, Lc;
function Lm() {
  if (Lc) return Oa;
  Lc = 1;
  var o = Hl();
  function d(i) {
    switch (i) {
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
  const p = new Set("0123456789ABCDEFabcdef"), c = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), h = new Set(",[]{}"), u = new Set(` ,[]{}
\r	`), n = (i) => !i || u.has(i);
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
    *lex(a, r = !1) {
      if (a) {
        if (typeof a != "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + a : a, this.lineEndPos = null;
      }
      this.atEnd = !r;
      let e = this.next ?? "stream";
      for (; e && (r || this.hasChars(1)); )
        e = yield* this.parseNext(e);
    }
    atLineEnd() {
      let a = this.pos, r = this.buffer[a];
      for (; r === " " || r === "	"; )
        r = this.buffer[++a];
      return !r || r === "#" || r === `
` ? !0 : r === "\r" ? this.buffer[a + 1] === `
` : !1;
    }
    charAt(a) {
      return this.buffer[this.pos + a];
    }
    continueScalar(a) {
      let r = this.buffer[a];
      if (this.indentNext > 0) {
        let e = 0;
        for (; r === " "; )
          r = this.buffer[++e + a];
        if (r === "\r") {
          const t = this.buffer[e + a + 1];
          if (t === `
` || !t && !this.atEnd)
            return a + e + 1;
        }
        return r === `
` || e >= this.indentNext || !r && !this.atEnd ? a + e : -1;
      }
      if (r === "-" || r === ".") {
        const e = this.buffer.substr(a, 3);
        if ((e === "---" || e === "...") && d(this.buffer[a + 3]))
          return -1;
      }
      return a;
    }
    getLine() {
      let a = this.lineEndPos;
      return (typeof a != "number" || a !== -1 && a < this.pos) && (a = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = a), a === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[a - 1] === "\r" && (a -= 1), this.buffer.substring(this.pos, a));
    }
    hasChars(a) {
      return this.pos + a <= this.buffer.length;
    }
    setNext(a) {
      return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = a, null;
    }
    peek(a) {
      return this.buffer.substr(this.pos, a);
    }
    *parseNext(a) {
      switch (a) {
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
      let a = this.getLine();
      if (a === null)
        return this.setNext("stream");
      if (a[0] === o.BOM && (yield* this.pushCount(1), a = a.substring(1)), a[0] === "%") {
        let r = a.length, e = a.indexOf("#");
        for (; e !== -1; ) {
          const s = a[e - 1];
          if (s === " " || s === "	") {
            r = e - 1;
            break;
          } else
            e = a.indexOf("#", e + 1);
        }
        for (; ; ) {
          const s = a[r - 1];
          if (s === " " || s === "	")
            r -= 1;
          else
            break;
        }
        const t = (yield* this.pushCount(r)) + (yield* this.pushSpaces(!0));
        return yield* this.pushCount(a.length - t), this.pushNewline(), "stream";
      }
      if (this.atLineEnd()) {
        const r = yield* this.pushSpaces(!0);
        return yield* this.pushCount(a.length - r), yield* this.pushNewline(), "stream";
      }
      return yield o.DOCUMENT, yield* this.parseLineStart();
    }
    *parseLineStart() {
      const a = this.charAt(0);
      if (!a && !this.atEnd)
        return this.setNext("line-start");
      if (a === "-" || a === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const r = this.peek(3);
        if ((r === "---" || r === "...") && d(this.charAt(3)))
          return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, r === "---" ? "doc" : "stream";
      }
      return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !d(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [a, r] = this.peek(2);
      if (!r && !this.atEnd)
        return this.setNext("block-start");
      if ((a === "-" || a === "?" || a === ":") && d(r)) {
        const e = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
        return this.indentNext = this.indentValue + 1, this.indentValue += e, yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(!0);
      const a = this.getLine();
      if (a === null)
        return this.setNext("doc");
      let r = yield* this.pushIndicators();
      switch (a[r]) {
        case "#":
          yield* this.pushCount(a.length - r);
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
          return r += yield* this.parseBlockScalarHeader(), r += yield* this.pushSpaces(!0), yield* this.pushCount(a.length - r), yield* this.pushNewline(), yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let a, r, e = -1;
      do
        a = yield* this.pushNewline(), a > 0 ? (r = yield* this.pushSpaces(!1), this.indentValue = e = r) : r = 0, r += yield* this.pushSpaces(!0);
      while (a + r > 0);
      const t = this.getLine();
      if (t === null)
        return this.setNext("flow");
      if ((e !== -1 && e < this.indentNext && t[0] !== "#" || e === 0 && (t.startsWith("---") || t.startsWith("...")) && d(t[3])) && !(e === this.indentNext - 1 && this.flowLevel === 1 && (t[0] === "]" || t[0] === "}")))
        return this.flowLevel = 0, yield o.FLOW_END, yield* this.parseLineStart();
      let s = 0;
      for (; t[s] === ","; )
        s += yield* this.pushCount(1), s += yield* this.pushSpaces(!0), this.flowKey = !1;
      switch (s += yield* this.pushIndicators(), t[s]) {
        case void 0:
          return "flow";
        case "#":
          return yield* this.pushCount(t.length - s), "flow";
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
          const f = this.charAt(1);
          if (this.flowKey || d(f) || f === ",")
            return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
        }
        // fallthrough
        default:
          return this.flowKey = !1, yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const a = this.charAt(0);
      let r = this.buffer.indexOf(a, this.pos + 1);
      if (a === "'")
        for (; r !== -1 && this.buffer[r + 1] === "'"; )
          r = this.buffer.indexOf("'", r + 2);
      else
        for (; r !== -1; ) {
          let s = 0;
          for (; this.buffer[r - 1 - s] === "\\"; )
            s += 1;
          if (s % 2 === 0)
            break;
          r = this.buffer.indexOf('"', r + 1);
        }
      const e = this.buffer.substring(0, r);
      let t = e.indexOf(`
`, this.pos);
      if (t !== -1) {
        for (; t !== -1; ) {
          const s = this.continueScalar(t + 1);
          if (s === -1)
            break;
          t = e.indexOf(`
`, s);
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
      let a = this.pos;
      for (; ; ) {
        const r = this.buffer[++a];
        if (r === "+")
          this.blockScalarKeep = !0;
        else if (r > "0" && r <= "9")
          this.blockScalarIndent = Number(r) - 1;
        else if (r !== "-")
          break;
      }
      return yield* this.pushUntil((r) => d(r) || r === "#");
    }
    *parseBlockScalar() {
      let a = this.pos - 1, r = 0, e;
      e: for (let s = this.pos; e = this.buffer[s]; ++s)
        switch (e) {
          case " ":
            r += 1;
            break;
          case `
`:
            a = s, r = 0;
            break;
          case "\r": {
            const f = this.buffer[s + 1];
            if (!f && !this.atEnd)
              return this.setNext("block-scalar");
            if (f === `
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
          const s = this.continueScalar(a + 1);
          if (s === -1)
            break;
          a = this.buffer.indexOf(`
`, s);
        } while (a !== -1);
        if (a === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          a = this.buffer.length;
        }
      }
      let t = a + 1;
      for (e = this.buffer[t]; e === " "; )
        e = this.buffer[++t];
      if (e === "	") {
        for (; e === "	" || e === " " || e === "\r" || e === `
`; )
          e = this.buffer[++t];
        a = t - 1;
      } else if (!this.blockScalarKeep)
        do {
          let s = a - 1, f = this.buffer[s];
          f === "\r" && (f = this.buffer[--s]);
          const g = s;
          for (; f === " "; )
            f = this.buffer[--s];
          if (f === `
` && s >= this.pos && s + 1 + r > g)
            a = s;
          else
            break;
        } while (!0);
      return yield o.SCALAR, yield* this.pushToIndex(a + 1, !0), yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const a = this.flowLevel > 0;
      let r = this.pos - 1, e = this.pos - 1, t;
      for (; t = this.buffer[++e]; )
        if (t === ":") {
          const s = this.buffer[e + 1];
          if (d(s) || a && h.has(s))
            break;
          r = e;
        } else if (d(t)) {
          let s = this.buffer[e + 1];
          if (t === "\r" && (s === `
` ? (e += 1, t = `
`, s = this.buffer[e + 1]) : r = e), s === "#" || a && h.has(s))
            break;
          if (t === `
`) {
            const f = this.continueScalar(e + 1);
            if (f === -1)
              break;
            e = Math.max(e, f - 2);
          }
        } else {
          if (a && h.has(t))
            break;
          r = e;
        }
      return !t && !this.atEnd ? this.setNext("plain-scalar") : (yield o.SCALAR, yield* this.pushToIndex(r + 1, !0), a ? "flow" : "doc");
    }
    *pushCount(a) {
      return a > 0 ? (yield this.buffer.substr(this.pos, a), this.pos += a, a) : 0;
    }
    *pushToIndex(a, r) {
      const e = this.buffer.slice(this.pos, a);
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
          const a = this.flowLevel > 0, r = this.charAt(1);
          if (d(r) || a && h.has(r))
            return a ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let a = this.pos + 2, r = this.buffer[a];
        for (; !d(r) && r !== ">"; )
          r = this.buffer[++a];
        return yield* this.pushToIndex(r === ">" ? a + 1 : a, !1);
      } else {
        let a = this.pos + 1, r = this.buffer[a];
        for (; r; )
          if (c.has(r))
            r = this.buffer[++a];
          else if (r === "%" && p.has(this.buffer[a + 1]) && p.has(this.buffer[a + 2]))
            r = this.buffer[a += 3];
          else
            break;
        return yield* this.pushToIndex(a, !1);
      }
    }
    *pushNewline() {
      const a = this.buffer[this.pos];
      return a === `
` ? yield* this.pushCount(1) : a === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
    }
    *pushSpaces(a) {
      let r = this.pos - 1, e;
      do
        e = this.buffer[++r];
      while (e === " " || a && e === "	");
      const t = r - this.pos;
      return t > 0 && (yield this.buffer.substr(this.pos, t), this.pos = r), t;
    }
    *pushUntil(a) {
      let r = this.pos, e = this.buffer[r];
      for (; !a(e); )
        e = this.buffer[++r];
      return yield* this.pushToIndex(r, !1);
    }
  }
  return Oa.Lexer = l, Oa;
}
var ka = {}, Fc;
function Fm() {
  if (Fc) return ka;
  Fc = 1;
  class o {
    constructor() {
      this.lineStarts = [], this.addNewLine = (p) => this.lineStarts.push(p), this.linePos = (p) => {
        let c = 0, h = this.lineStarts.length;
        for (; c < h; ) {
          const n = c + h >> 1;
          this.lineStarts[n] < p ? c = n + 1 : h = n;
        }
        if (this.lineStarts[c] === p)
          return { line: c + 1, col: 1 };
        if (c === 0)
          return { line: 0, col: p };
        const u = this.lineStarts[c - 1];
        return { line: c, col: p - u + 1 };
      };
    }
  }
  return ka.LineCounter = o, ka;
}
var Na = {}, Uc;
function Um() {
  if (Uc) return Na;
  Uc = 1;
  var o = Pl, d = Hl(), p = Lm();
  function c(r, e) {
    for (let t = 0; t < r.length; ++t)
      if (r[t].type === e)
        return !0;
    return !1;
  }
  function h(r) {
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
  function u(r) {
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
  function i(r) {
    if (r.start.type === "flow-seq-start")
      for (const e of r.items)
        e.sep && !e.value && !c(e.start, "explicit-key-ind") && !c(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, u(e.value) ? e.value.end ? Array.prototype.push.apply(e.value.end, e.sep) : e.value.end = e.sep : Array.prototype.push.apply(e.start, e.sep), delete e.sep);
  }
  class a {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(e) {
      this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new p.Lexer(), this.onNewLine = e;
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
      for (const s of this.lexer.lex(e, t))
        yield* this.next(s);
      t || (yield* this.end());
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(e) {
      if (this.source = e, o.env.LOG_TOKENS && console.log("|", d.prettyToken(e)), this.atScalar) {
        this.atScalar = !1, yield* this.step(), this.offset += e.length;
        return;
      }
      const t = d.tokenType(e);
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
        const s = `Not a YAML token: ${e}`;
        yield* this.pop({ type: "error", offset: this.offset, message: s, source: e }), this.offset += e.length;
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
        const s = this.peek(1);
        switch (t.type === "block-scalar" ? t.indent = "indent" in s ? s.indent : 0 : t.type === "flow-collection" && s.type === "document" && (t.indent = 0), t.type === "flow-collection" && i(t), s.type) {
          case "document":
            s.value = t;
            break;
          case "block-scalar":
            s.props.push(t);
            break;
          case "block-map": {
            const f = s.items[s.items.length - 1];
            if (f.value) {
              s.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
              return;
            } else if (f.sep)
              f.value = t;
            else {
              Object.assign(f, { key: t, sep: [] }), this.onKeyLine = !f.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const f = s.items[s.items.length - 1];
            f.value ? s.items.push({ start: [], value: t }) : f.value = t;
            break;
          }
          case "flow-collection": {
            const f = s.items[s.items.length - 1];
            !f || f.value ? s.items.push({ start: [], key: t, sep: [] }) : f.sep ? f.value = t : Object.assign(f, { key: t, sep: [] });
            return;
          }
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop(), yield* this.pop(t);
        }
        if ((s.type === "document" || s.type === "block-map" || s.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
          const f = t.items[t.items.length - 1];
          f && !f.sep && !f.value && f.start.length > 0 && h(f.start) === -1 && (t.indent === 0 || f.start.every((g) => g.type !== "comment" || g.indent < t.indent)) && (s.type === "document" ? s.end = f.start : s.items.push({ start: f.start }), t.items.splice(-1, 1));
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
          h(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
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
        const t = n(this.peek(2)), s = l(t);
        let f;
        e.end ? (f = e.end, f.push(this.sourceToken), delete e.end) : f = [this.sourceToken];
        const g = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: s, key: e, sep: f }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = g;
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
      var s;
      const t = e.items[e.items.length - 1];
      switch (this.type) {
        case "newline":
          if (this.onKeyLine = !1, t.value) {
            const f = "end" in t.value ? t.value.end : void 0, g = Array.isArray(f) ? f[f.length - 1] : void 0;
            (g == null ? void 0 : g.type) === "comment" ? f == null || f.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
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
              const f = e.items[e.items.length - 2], g = (s = f == null ? void 0 : f.value) == null ? void 0 : s.end;
              if (Array.isArray(g)) {
                Array.prototype.push.apply(g, t.start), g.push(this.sourceToken), e.items.pop();
                return;
              }
            }
            t.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= e.indent) {
        const f = !this.onKeyLine && this.indent === e.indent, g = f && (t.sep || t.explicitKey) && this.type !== "seq-item-ind";
        let m = [];
        if (g && t.sep && !t.value) {
          const v = [];
          for (let y = 0; y < t.sep.length; ++y) {
            const E = t.sep[y];
            switch (E.type) {
              case "newline":
                v.push(y);
                break;
              case "space":
                break;
              case "comment":
                E.indent > e.indent && (v.length = 0);
                break;
              default:
                v.length = 0;
            }
          }
          v.length >= 2 && (m = t.sep.splice(v[1]));
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            g || t.value ? (m.push(this.sourceToken), e.items.push({ start: m }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
            return;
          case "explicit-key-ind":
            !t.sep && !t.explicitKey ? (t.start.push(this.sourceToken), t.explicitKey = !0) : g || t.value ? (m.push(this.sourceToken), e.items.push({ start: m, explicitKey: !0 })) : this.stack.push({
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
                else if (c(t.sep, "map-value-ind"))
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: m, key: null, sep: [this.sourceToken] }]
                  });
                else if (u(t.key) && !c(t.sep, "newline")) {
                  const v = l(t.start), y = t.key, E = t.sep;
                  E.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: v, key: y, sep: E }]
                  });
                } else m.length > 0 ? t.sep = t.sep.concat(m, this.sourceToken) : t.sep.push(this.sourceToken);
              else if (c(t.start, "newline"))
                Object.assign(t, { key: null, sep: [this.sourceToken] });
              else {
                const v = l(t.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: v, key: null, sep: [this.sourceToken] }]
                });
              }
            else
              t.sep ? t.value || g ? e.items.push({ start: m, key: null, sep: [this.sourceToken] }) : c(t.sep, "map-value-ind") ? this.stack.push({
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
            const v = this.flowScalar(this.type);
            g || t.value ? (e.items.push({ start: m, key: v, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(v) : (Object.assign(t, { key: v, sep: [] }), this.onKeyLine = !0);
            return;
          }
          default: {
            const v = this.startBlockValue(e);
            if (v) {
              if (v.type === "block-seq") {
                if (!t.explicitKey && t.sep && !c(t.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else f && e.items.push({ start: m });
              this.stack.push(v);
              return;
            }
          }
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *blockSequence(e) {
      var s;
      const t = e.items[e.items.length - 1];
      switch (this.type) {
        case "newline":
          if (t.value) {
            const f = "end" in t.value ? t.value.end : void 0, g = Array.isArray(f) ? f[f.length - 1] : void 0;
            (g == null ? void 0 : g.type) === "comment" ? f == null || f.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
          } else
            t.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (t.value)
            e.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(t.start, e.indent)) {
              const f = e.items[e.items.length - 2], g = (s = f == null ? void 0 : f.value) == null ? void 0 : s.end;
              if (Array.isArray(g)) {
                Array.prototype.push.apply(g, t.start), g.push(this.sourceToken), e.items.pop();
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
          t.value || c(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
      }
      if (this.indent > e.indent) {
        const f = this.startBlockValue(e);
        if (f) {
          this.stack.push(f);
          return;
        }
      }
      yield* this.pop(), yield* this.step();
    }
    *flowCollection(e) {
      const t = e.items[e.items.length - 1];
      if (this.type === "flow-error-end") {
        let s;
        do
          yield* this.pop(), s = this.peek(1);
        while ((s == null ? void 0 : s.type) === "flow-collection");
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
            const f = this.flowScalar(this.type);
            !t || t.value ? e.items.push({ start: [], key: f, sep: [] }) : t.sep ? this.stack.push(f) : Object.assign(t, { key: f, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            e.end.push(this.sourceToken);
            return;
        }
        const s = this.startBlockValue(e);
        s ? this.stack.push(s) : (yield* this.pop(), yield* this.step());
      } else {
        const s = this.peek(2);
        if (s.type === "block-map" && (this.type === "map-value-ind" && s.indent === e.indent || this.type === "newline" && !s.items[s.items.length - 1].sep))
          yield* this.pop(), yield* this.step();
        else if (this.type === "map-value-ind" && s.type !== "flow-collection") {
          const f = n(s), g = l(f);
          i(e);
          const m = e.end.splice(1, e.end.length);
          m.push(this.sourceToken);
          const v = {
            type: "block-map",
            offset: e.offset,
            indent: e.indent,
            items: [{ start: g, key: e, sep: m }]
          };
          this.onKeyLine = !0, this.stack[this.stack.length - 1] = v;
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
          const t = n(e), s = l(t);
          return s.push(this.sourceToken), {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: s, explicitKey: !0 }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = !0;
          const t = n(e), s = l(t);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: s, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(e, t) {
      return this.type !== "comment" || this.indent <= t ? !1 : e.every((s) => s.type === "newline" || s.type === "space");
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
  return Na.Parser = a, Na;
}
var Sr = {}, $c;
function Z0() {
  if ($c) return Sr;
  $c = 1;
  var o = xm(), d = Ci(), p = Ri(), c = gm(), h = Fe(), u = Fm(), n = Um();
  function l(t) {
    const s = t.prettyErrors !== !1;
    return { lineCounter: t.lineCounter || s && new u.LineCounter() || null, prettyErrors: s };
  }
  function i(t, s = {}) {
    const { lineCounter: f, prettyErrors: g } = l(s), m = new n.Parser(f == null ? void 0 : f.addNewLine), v = new o.Composer(s), y = Array.from(v.compose(m.parse(t)));
    if (g && f)
      for (const E of y)
        E.errors.forEach(p.prettifyError(t, f)), E.warnings.forEach(p.prettifyError(t, f));
    return y.length > 0 ? y : Object.assign([], { empty: !0 }, v.streamInfo());
  }
  function a(t, s = {}) {
    const { lineCounter: f, prettyErrors: g } = l(s), m = new n.Parser(f == null ? void 0 : f.addNewLine), v = new o.Composer(s);
    let y = null;
    for (const E of v.compose(m.parse(t), !0, t.length))
      if (!y)
        y = E;
      else if (y.options.logLevel !== "silent") {
        y.errors.push(new p.YAMLParseError(E.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    return g && f && (y.errors.forEach(p.prettifyError(t, f)), y.warnings.forEach(p.prettifyError(t, f))), y;
  }
  function r(t, s, f) {
    let g;
    typeof s == "function" ? g = s : f === void 0 && s && typeof s == "object" && (f = s);
    const m = a(t, f);
    if (!m)
      return null;
    if (m.warnings.forEach((v) => c.warn(m.options.logLevel, v)), m.errors.length > 0) {
      if (m.options.logLevel !== "silent")
        throw m.errors[0];
      m.errors = [];
    }
    return m.toJS(Object.assign({ reviver: g }, f));
  }
  function e(t, s, f) {
    let g = null;
    if (typeof s == "function" || Array.isArray(s) ? g = s : f === void 0 && s && (f = s), typeof f == "string" && (f = f.length), typeof f == "number") {
      const m = Math.round(f);
      f = m < 1 ? void 0 : m > 8 ? { indent: 8 } : { indent: m };
    }
    if (t === void 0) {
      const { keepUndefined: m } = f ?? s ?? {};
      if (!m)
        return;
    }
    return h.isDocument(t) && !g ? t.toString(f) : new d.Document(t, g, f).toString(f);
  }
  return Sr.parse = r, Sr.parseAllDocuments = i, Sr.parseDocument = a, Sr.stringify = e, Sr;
}
var qc;
function X0() {
  if (qc) return qe;
  qc = 1;
  var o = xm(), d = Ci(), p = Om(), c = Ri(), h = wi(), u = Fe(), n = fr(), l = nt(), i = dr(), a = hr(), r = Hl(), e = Lm(), t = Fm(), s = Um(), f = Z0(), g = yi();
  return qe.Composer = o.Composer, qe.Document = d.Document, qe.Schema = p.Schema, qe.YAMLError = c.YAMLError, qe.YAMLParseError = c.YAMLParseError, qe.YAMLWarning = c.YAMLWarning, qe.Alias = h.Alias, qe.isAlias = u.isAlias, qe.isCollection = u.isCollection, qe.isDocument = u.isDocument, qe.isMap = u.isMap, qe.isNode = u.isNode, qe.isPair = u.isPair, qe.isScalar = u.isScalar, qe.isSeq = u.isSeq, qe.Pair = n.Pair, qe.Scalar = l.Scalar, qe.YAMLMap = i.YAMLMap, qe.YAMLSeq = a.YAMLSeq, qe.CST = r, qe.Lexer = e.Lexer, qe.LineCounter = t.LineCounter, qe.Parser = s.Parser, qe.parse = f.parse, qe.parseAllDocuments = f.parseAllDocuments, qe.parseDocument = f.parseDocument, qe.stringify = f.stringify, qe.visit = g.visit, qe.visitAsync = g.visitAsync, qe;
}
var Q0 = X0();
const ev = /* @__PURE__ */ hm(Q0);
var Ia = {}, Da = {}, vt = {}, Jn = { exports: {} }, Zn = { exports: {} }, Mc;
function Oi() {
  if (Mc) return Zn.exports;
  Mc = 1, typeof process > "u" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0 ? Zn.exports = { nextTick: o } : Zn.exports = process;
  function o(d, p, c, h) {
    if (typeof d != "function")
      throw new TypeError('"callback" argument must be a function');
    var u = arguments.length, n, l;
    switch (u) {
      case 0:
      case 1:
        return process.nextTick(d);
      case 2:
        return process.nextTick(function() {
          d.call(null, p);
        });
      case 3:
        return process.nextTick(function() {
          d.call(null, p, c);
        });
      case 4:
        return process.nextTick(function() {
          d.call(null, p, c, h);
        });
      default:
        for (n = new Array(u - 1), l = 0; l < n.length; )
          n[l++] = arguments[l];
        return process.nextTick(function() {
          d.apply(null, n);
        });
    }
  }
  return Zn.exports;
}
var Pa, Bc;
function tv() {
  if (Bc) return Pa;
  Bc = 1;
  var o = {}.toString;
  return Pa = Array.isArray || function(d) {
    return o.call(d) == "[object Array]";
  }, Pa;
}
var xa, jc;
function $m() {
  return jc || (jc = 1, xa = ur), xa;
}
var Xn = { exports: {} }, Hc;
function ki() {
  return Hc || (Hc = 1, (function(o, d) {
    var p = xl, c = p.Buffer;
    function h(n, l) {
      for (var i in n)
        l[i] = n[i];
    }
    c.from && c.alloc && c.allocUnsafe && c.allocUnsafeSlow ? o.exports = p : (h(p, d), d.Buffer = u);
    function u(n, l, i) {
      return c(n, l, i);
    }
    h(c, u), u.from = function(n, l, i) {
      if (typeof n == "number")
        throw new TypeError("Argument must not be a number");
      return c(n, l, i);
    }, u.alloc = function(n, l, i) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      var a = c(n);
      return l !== void 0 ? typeof i == "string" ? a.fill(l, i) : a.fill(l) : a.fill(0), a;
    }, u.allocUnsafe = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return c(n);
    }, u.allocUnsafeSlow = function(n) {
      if (typeof n != "number")
        throw new TypeError("Argument must be a number");
      return p.SlowBuffer(n);
    };
  })(Xn, Xn.exports)), Xn.exports;
}
var ut = {}, zc;
function Cn() {
  if (zc) return ut;
  zc = 1;
  function o(g) {
    return Array.isArray ? Array.isArray(g) : f(g) === "[object Array]";
  }
  ut.isArray = o;
  function d(g) {
    return typeof g == "boolean";
  }
  ut.isBoolean = d;
  function p(g) {
    return g === null;
  }
  ut.isNull = p;
  function c(g) {
    return g == null;
  }
  ut.isNullOrUndefined = c;
  function h(g) {
    return typeof g == "number";
  }
  ut.isNumber = h;
  function u(g) {
    return typeof g == "string";
  }
  ut.isString = u;
  function n(g) {
    return typeof g == "symbol";
  }
  ut.isSymbol = n;
  function l(g) {
    return g === void 0;
  }
  ut.isUndefined = l;
  function i(g) {
    return f(g) === "[object RegExp]";
  }
  ut.isRegExp = i;
  function a(g) {
    return typeof g == "object" && g !== null;
  }
  ut.isObject = a;
  function r(g) {
    return f(g) === "[object Date]";
  }
  ut.isDate = r;
  function e(g) {
    return f(g) === "[object Error]" || g instanceof Error;
  }
  ut.isError = e;
  function t(g) {
    return typeof g == "function";
  }
  ut.isFunction = t;
  function s(g) {
    return g === null || typeof g == "boolean" || typeof g == "number" || typeof g == "string" || typeof g == "symbol" || // ES6 symbol
    typeof g > "u";
  }
  ut.isPrimitive = s, ut.isBuffer = xl.Buffer.isBuffer;
  function f(g) {
    return Object.prototype.toString.call(g);
  }
  return ut;
}
var Qn = { exports: {} }, ei = { exports: {} }, Gc;
function rv() {
  return Gc || (Gc = 1, typeof Object.create == "function" ? ei.exports = function(d, p) {
    p && (d.super_ = p, d.prototype = Object.create(p.prototype, {
      constructor: {
        value: d,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : ei.exports = function(d, p) {
    if (p) {
      d.super_ = p;
      var c = function() {
      };
      c.prototype = p.prototype, d.prototype = new c(), d.prototype.constructor = d;
    }
  }), ei.exports;
}
var Wc;
function Rn() {
  if (Wc) return Qn.exports;
  Wc = 1;
  try {
    var o = require("util");
    if (typeof o.inherits != "function") throw "";
    Qn.exports = o.inherits;
  } catch {
    Qn.exports = rv();
  }
  return Qn.exports;
}
var La = { exports: {} }, Yc;
function nv() {
  return Yc || (Yc = 1, (function(o) {
    function d(u, n) {
      if (!(u instanceof n))
        throw new TypeError("Cannot call a class as a function");
    }
    var p = ki().Buffer, c = Pr;
    function h(u, n, l) {
      u.copy(n, l);
    }
    o.exports = (function() {
      function u() {
        d(this, u), this.head = null, this.tail = null, this.length = 0;
      }
      return u.prototype.push = function(l) {
        var i = { data: l, next: null };
        this.length > 0 ? this.tail.next = i : this.head = i, this.tail = i, ++this.length;
      }, u.prototype.unshift = function(l) {
        var i = { data: l, next: this.head };
        this.length === 0 && (this.tail = i), this.head = i, ++this.length;
      }, u.prototype.shift = function() {
        if (this.length !== 0) {
          var l = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, l;
        }
      }, u.prototype.clear = function() {
        this.head = this.tail = null, this.length = 0;
      }, u.prototype.join = function(l) {
        if (this.length === 0) return "";
        for (var i = this.head, a = "" + i.data; i = i.next; )
          a += l + i.data;
        return a;
      }, u.prototype.concat = function(l) {
        if (this.length === 0) return p.alloc(0);
        for (var i = p.allocUnsafe(l >>> 0), a = this.head, r = 0; a; )
          h(a.data, i, r), r += a.data.length, a = a.next;
        return i;
      }, u;
    })(), c && c.inspect && c.inspect.custom && (o.exports.prototype[c.inspect.custom] = function() {
      var u = c.inspect({ length: this.length });
      return this.constructor.name + " " + u;
    });
  })(La)), La.exports;
}
var Fa, Kc;
function qm() {
  if (Kc) return Fa;
  Kc = 1;
  var o = Oi();
  function d(h, u) {
    var n = this, l = this._readableState && this._readableState.destroyed, i = this._writableState && this._writableState.destroyed;
    return l || i ? (u ? u(h) : h && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, o.nextTick(c, this, h)) : o.nextTick(c, this, h)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(h || null, function(a) {
      !u && a ? n._writableState ? n._writableState.errorEmitted || (n._writableState.errorEmitted = !0, o.nextTick(c, n, a)) : o.nextTick(c, n, a) : u && u(a);
    }), this);
  }
  function p() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function c(h, u) {
    h.emit("error", u);
  }
  return Fa = {
    destroy: d,
    undestroy: p
  }, Fa;
}
var Ua, Vc;
function iv() {
  return Vc || (Vc = 1, Ua = Pr.deprecate), Ua;
}
var $a, Jc;
function Mm() {
  if (Jc) return $a;
  Jc = 1;
  var o = Oi();
  $a = g;
  function d(N) {
    var F = this;
    this.next = null, this.entry = null, this.finish = function() {
      te(F, N);
    };
  }
  var p = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : o.nextTick, c;
  g.WritableState = s;
  var h = Object.create(Cn());
  h.inherits = Rn();
  var u = {
    deprecate: iv()
  }, n = $m(), l = ki().Buffer, i = (typeof Me < "u" ? Me : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function a(N) {
    return l.from(N);
  }
  function r(N) {
    return l.isBuffer(N) || N instanceof i;
  }
  var e = qm();
  h.inherits(g, n);
  function t() {
  }
  function s(N, F) {
    c = c || Dr(), N = N || {};
    var G = F instanceof c;
    this.objectMode = !!N.objectMode, G && (this.objectMode = this.objectMode || !!N.writableObjectMode);
    var Q = N.highWaterMark, ce = N.writableHighWaterMark, ae = this.objectMode ? 16 : 16 * 1024;
    Q || Q === 0 ? this.highWaterMark = Q : G && (ce || ce === 0) ? this.highWaterMark = ce : this.highWaterMark = ae, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var ve = N.decodeStrings === !1;
    this.decodeStrings = !ve, this.defaultEncoding = N.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(we) {
      k(F, we);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new d(this);
  }
  s.prototype.getBuffer = function() {
    for (var F = this.bufferedRequest, G = []; F; )
      G.push(F), F = F.next;
    return G;
  }, (function() {
    try {
      Object.defineProperty(s.prototype, "buffer", {
        get: u.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  })();
  var f;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (f = Function.prototype[Symbol.hasInstance], Object.defineProperty(g, Symbol.hasInstance, {
    value: function(N) {
      return f.call(this, N) ? !0 : this !== g ? !1 : N && N._writableState instanceof s;
    }
  })) : f = function(N) {
    return N instanceof this;
  };
  function g(N) {
    if (c = c || Dr(), !f.call(g, this) && !(this instanceof c))
      return new g(N);
    this._writableState = new s(N, this), this.writable = !0, N && (typeof N.write == "function" && (this._write = N.write), typeof N.writev == "function" && (this._writev = N.writev), typeof N.destroy == "function" && (this._destroy = N.destroy), typeof N.final == "function" && (this._final = N.final)), n.call(this);
  }
  g.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function m(N, F) {
    var G = new Error("write after end");
    N.emit("error", G), o.nextTick(F, G);
  }
  function v(N, F, G, Q) {
    var ce = !0, ae = !1;
    return G === null ? ae = new TypeError("May not write null values to stream") : typeof G != "string" && G !== void 0 && !F.objectMode && (ae = new TypeError("Invalid non-string/buffer chunk")), ae && (N.emit("error", ae), o.nextTick(Q, ae), ce = !1), ce;
  }
  g.prototype.write = function(N, F, G) {
    var Q = this._writableState, ce = !1, ae = !Q.objectMode && r(N);
    return ae && !l.isBuffer(N) && (N = a(N)), typeof F == "function" && (G = F, F = null), ae ? F = "buffer" : F || (F = Q.defaultEncoding), typeof G != "function" && (G = t), Q.ended ? m(this, G) : (ae || v(this, Q, N, G)) && (Q.pendingcb++, ce = E(this, Q, ae, N, F, G)), ce;
  }, g.prototype.cork = function() {
    var N = this._writableState;
    N.corked++;
  }, g.prototype.uncork = function() {
    var N = this._writableState;
    N.corked && (N.corked--, !N.writing && !N.corked && !N.bufferProcessing && N.bufferedRequest && M(this, N));
  }, g.prototype.setDefaultEncoding = function(F) {
    if (typeof F == "string" && (F = F.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((F + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + F);
    return this._writableState.defaultEncoding = F, this;
  };
  function y(N, F, G) {
    return !N.objectMode && N.decodeStrings !== !1 && typeof F == "string" && (F = l.from(F, G)), F;
  }
  Object.defineProperty(g.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function E(N, F, G, Q, ce, ae) {
    if (!G) {
      var ve = y(F, Q, ce);
      Q !== ve && (G = !0, ce = "buffer", Q = ve);
    }
    var we = F.objectMode ? 1 : Q.length;
    F.length += we;
    var ie = F.length < F.highWaterMark;
    if (ie || (F.needDrain = !0), F.writing || F.corked) {
      var be = F.lastBufferedRequest;
      F.lastBufferedRequest = {
        chunk: Q,
        encoding: ce,
        isBuf: G,
        callback: ae,
        next: null
      }, be ? be.next = F.lastBufferedRequest : F.bufferedRequest = F.lastBufferedRequest, F.bufferedRequestCount += 1;
    } else
      R(N, F, !1, we, Q, ce, ae);
    return ie;
  }
  function R(N, F, G, Q, ce, ae, ve) {
    F.writelen = Q, F.writecb = ve, F.writing = !0, F.sync = !0, G ? N._writev(ce, F.onwrite) : N._write(ce, ae, F.onwrite), F.sync = !1;
  }
  function C(N, F, G, Q, ce) {
    --F.pendingcb, G ? (o.nextTick(ce, Q), o.nextTick(B, N, F), N._writableState.errorEmitted = !0, N.emit("error", Q)) : (ce(Q), N._writableState.errorEmitted = !0, N.emit("error", Q), B(N, F));
  }
  function I(N) {
    N.writing = !1, N.writecb = null, N.length -= N.writelen, N.writelen = 0;
  }
  function k(N, F) {
    var G = N._writableState, Q = G.sync, ce = G.writecb;
    if (I(G), F) C(N, G, Q, F, ce);
    else {
      var ae = z(G);
      !ae && !G.corked && !G.bufferProcessing && G.bufferedRequest && M(N, G), Q ? p(O, N, G, ae, ce) : O(N, G, ae, ce);
    }
  }
  function O(N, F, G, Q) {
    G || A(N, F), F.pendingcb--, Q(), B(N, F);
  }
  function A(N, F) {
    F.length === 0 && F.needDrain && (F.needDrain = !1, N.emit("drain"));
  }
  function M(N, F) {
    F.bufferProcessing = !0;
    var G = F.bufferedRequest;
    if (N._writev && G && G.next) {
      var Q = F.bufferedRequestCount, ce = new Array(Q), ae = F.corkedRequestsFree;
      ae.entry = G;
      for (var ve = 0, we = !0; G; )
        ce[ve] = G, G.isBuf || (we = !1), G = G.next, ve += 1;
      ce.allBuffers = we, R(N, F, !0, F.length, ce, "", ae.finish), F.pendingcb++, F.lastBufferedRequest = null, ae.next ? (F.corkedRequestsFree = ae.next, ae.next = null) : F.corkedRequestsFree = new d(F), F.bufferedRequestCount = 0;
    } else {
      for (; G; ) {
        var ie = G.chunk, be = G.encoding, S = G.callback, b = F.objectMode ? 1 : ie.length;
        if (R(N, F, !1, b, ie, be, S), G = G.next, F.bufferedRequestCount--, F.writing)
          break;
      }
      G === null && (F.lastBufferedRequest = null);
    }
    F.bufferedRequest = G, F.bufferProcessing = !1;
  }
  g.prototype._write = function(N, F, G) {
    G(new Error("_write() is not implemented"));
  }, g.prototype._writev = null, g.prototype.end = function(N, F, G) {
    var Q = this._writableState;
    typeof N == "function" ? (G = N, N = null, F = null) : typeof F == "function" && (G = F, F = null), N != null && this.write(N, F), Q.corked && (Q.corked = 1, this.uncork()), Q.ending || H(this, Q, G);
  };
  function z(N) {
    return N.ending && N.length === 0 && N.bufferedRequest === null && !N.finished && !N.writing;
  }
  function U(N, F) {
    N._final(function(G) {
      F.pendingcb--, G && N.emit("error", G), F.prefinished = !0, N.emit("prefinish"), B(N, F);
    });
  }
  function j(N, F) {
    !F.prefinished && !F.finalCalled && (typeof N._final == "function" ? (F.pendingcb++, F.finalCalled = !0, o.nextTick(U, N, F)) : (F.prefinished = !0, N.emit("prefinish")));
  }
  function B(N, F) {
    var G = z(F);
    return G && (j(N, F), F.pendingcb === 0 && (F.finished = !0, N.emit("finish"))), G;
  }
  function H(N, F, G) {
    F.ending = !0, B(N, F), G && (F.finished ? o.nextTick(G) : N.once("finish", G)), F.ended = !0, N.writable = !1;
  }
  function te(N, F, G) {
    var Q = N.entry;
    for (N.entry = null; Q; ) {
      var ce = Q.callback;
      F.pendingcb--, ce(G), Q = Q.next;
    }
    F.corkedRequestsFree.next = N;
  }
  return Object.defineProperty(g.prototype, "destroyed", {
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(N) {
      this._writableState && (this._writableState.destroyed = N);
    }
  }), g.prototype.destroy = e.destroy, g.prototype._undestroy = e.undestroy, g.prototype._destroy = function(N, F) {
    this.end(), F(N);
  }, $a;
}
var qa, Zc;
function Dr() {
  if (Zc) return qa;
  Zc = 1;
  var o = Oi(), d = Object.keys || function(e) {
    var t = [];
    for (var s in e)
      t.push(s);
    return t;
  };
  qa = i;
  var p = Object.create(Cn());
  p.inherits = Rn();
  var c = Bm(), h = Mm();
  p.inherits(i, c);
  for (var u = d(h.prototype), n = 0; n < u.length; n++) {
    var l = u[n];
    i.prototype[l] || (i.prototype[l] = h.prototype[l]);
  }
  function i(e) {
    if (!(this instanceof i)) return new i(e);
    c.call(this, e), h.call(this, e), e && e.readable === !1 && (this.readable = !1), e && e.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, e && e.allowHalfOpen === !1 && (this.allowHalfOpen = !1), this.once("end", a);
  }
  Object.defineProperty(i.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function a() {
    this.allowHalfOpen || this._writableState.ended || o.nextTick(r, this);
  }
  function r(e) {
    e.end();
  }
  return Object.defineProperty(i.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(e) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = e, this._writableState.destroyed = e);
    }
  }), i.prototype._destroy = function(e, t) {
    this.push(null), this.end(), o.nextTick(t, e);
  }, qa;
}
var Ma = {}, Xc;
function Qc() {
  if (Xc) return Ma;
  Xc = 1;
  var o = ki().Buffer, d = o.isEncoding || function(v) {
    switch (v = "" + v, v && v.toLowerCase()) {
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
  function p(v) {
    if (!v) return "utf8";
    for (var y; ; )
      switch (v) {
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
          return v;
        default:
          if (y) return;
          v = ("" + v).toLowerCase(), y = !0;
      }
  }
  function c(v) {
    var y = p(v);
    if (typeof y != "string" && (o.isEncoding === d || !d(v))) throw new Error("Unknown encoding: " + v);
    return y || v;
  }
  Ma.StringDecoder = h;
  function h(v) {
    this.encoding = c(v);
    var y;
    switch (this.encoding) {
      case "utf16le":
        this.text = e, this.end = t, y = 4;
        break;
      case "utf8":
        this.fillLast = i, y = 4;
        break;
      case "base64":
        this.text = s, this.end = f, y = 3;
        break;
      default:
        this.write = g, this.end = m;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = o.allocUnsafe(y);
  }
  h.prototype.write = function(v) {
    if (v.length === 0) return "";
    var y, E;
    if (this.lastNeed) {
      if (y = this.fillLast(v), y === void 0) return "";
      E = this.lastNeed, this.lastNeed = 0;
    } else
      E = 0;
    return E < v.length ? y ? y + this.text(v, E) : this.text(v, E) : y || "";
  }, h.prototype.end = r, h.prototype.text = a, h.prototype.fillLast = function(v) {
    if (this.lastNeed <= v.length)
      return v.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    v.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, v.length), this.lastNeed -= v.length;
  };
  function u(v) {
    return v <= 127 ? 0 : v >> 5 === 6 ? 2 : v >> 4 === 14 ? 3 : v >> 3 === 30 ? 4 : v >> 6 === 2 ? -1 : -2;
  }
  function n(v, y, E) {
    var R = y.length - 1;
    if (R < E) return 0;
    var C = u(y[R]);
    return C >= 0 ? (C > 0 && (v.lastNeed = C - 1), C) : --R < E || C === -2 ? 0 : (C = u(y[R]), C >= 0 ? (C > 0 && (v.lastNeed = C - 2), C) : --R < E || C === -2 ? 0 : (C = u(y[R]), C >= 0 ? (C > 0 && (C === 2 ? C = 0 : v.lastNeed = C - 3), C) : 0));
  }
  function l(v, y, E) {
    if ((y[0] & 192) !== 128)
      return v.lastNeed = 0, "�";
    if (v.lastNeed > 1 && y.length > 1) {
      if ((y[1] & 192) !== 128)
        return v.lastNeed = 1, "�";
      if (v.lastNeed > 2 && y.length > 2 && (y[2] & 192) !== 128)
        return v.lastNeed = 2, "�";
    }
  }
  function i(v) {
    var y = this.lastTotal - this.lastNeed, E = l(this, v);
    if (E !== void 0) return E;
    if (this.lastNeed <= v.length)
      return v.copy(this.lastChar, y, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    v.copy(this.lastChar, y, 0, v.length), this.lastNeed -= v.length;
  }
  function a(v, y) {
    var E = n(this, v, y);
    if (!this.lastNeed) return v.toString("utf8", y);
    this.lastTotal = E;
    var R = v.length - (E - this.lastNeed);
    return v.copy(this.lastChar, 0, R), v.toString("utf8", y, R);
  }
  function r(v) {
    var y = v && v.length ? this.write(v) : "";
    return this.lastNeed ? y + "�" : y;
  }
  function e(v, y) {
    if ((v.length - y) % 2 === 0) {
      var E = v.toString("utf16le", y);
      if (E) {
        var R = E.charCodeAt(E.length - 1);
        if (R >= 55296 && R <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = v[v.length - 2], this.lastChar[1] = v[v.length - 1], E.slice(0, -1);
      }
      return E;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = v[v.length - 1], v.toString("utf16le", y, v.length - 1);
  }
  function t(v) {
    var y = v && v.length ? this.write(v) : "";
    if (this.lastNeed) {
      var E = this.lastTotal - this.lastNeed;
      return y + this.lastChar.toString("utf16le", 0, E);
    }
    return y;
  }
  function s(v, y) {
    var E = (v.length - y) % 3;
    return E === 0 ? v.toString("base64", y) : (this.lastNeed = 3 - E, this.lastTotal = 3, E === 1 ? this.lastChar[0] = v[v.length - 1] : (this.lastChar[0] = v[v.length - 2], this.lastChar[1] = v[v.length - 1]), v.toString("base64", y, v.length - E));
  }
  function f(v) {
    var y = v && v.length ? this.write(v) : "";
    return this.lastNeed ? y + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : y;
  }
  function g(v) {
    return v.toString(this.encoding);
  }
  function m(v) {
    return v && v.length ? this.write(v) : "";
  }
  return Ma;
}
var Ba, ef;
function Bm() {
  if (ef) return Ba;
  ef = 1;
  var o = Oi();
  Ba = y;
  var d = tv(), p;
  y.ReadableState = v, Ll.EventEmitter;
  var c = function(S, b) {
    return S.listeners(b).length;
  }, h = $m(), u = ki().Buffer, n = (typeof Me < "u" ? Me : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function l(S) {
    return u.from(S);
  }
  function i(S) {
    return u.isBuffer(S) || S instanceof n;
  }
  var a = Object.create(Cn());
  a.inherits = Rn();
  var r = Pr, e = void 0;
  r && r.debuglog ? e = r.debuglog("stream") : e = function() {
  };
  var t = nv(), s = qm(), f;
  a.inherits(y, h);
  var g = ["error", "close", "destroy", "pause", "resume"];
  function m(S, b, W) {
    if (typeof S.prependListener == "function") return S.prependListener(b, W);
    !S._events || !S._events[b] ? S.on(b, W) : d(S._events[b]) ? S._events[b].unshift(W) : S._events[b] = [W, S._events[b]];
  }
  function v(S, b) {
    p = p || Dr(), S = S || {};
    var W = b instanceof p;
    this.objectMode = !!S.objectMode, W && (this.objectMode = this.objectMode || !!S.readableObjectMode);
    var $ = S.highWaterMark, he = S.readableHighWaterMark, le = this.objectMode ? 16 : 16 * 1024;
    $ || $ === 0 ? this.highWaterMark = $ : W && (he || he === 0) ? this.highWaterMark = he : this.highWaterMark = le, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new t(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = S.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, S.encoding && (f || (f = Qc().StringDecoder), this.decoder = new f(S.encoding), this.encoding = S.encoding);
  }
  function y(S) {
    if (p = p || Dr(), !(this instanceof y)) return new y(S);
    this._readableState = new v(S, this), this.readable = !0, S && (typeof S.read == "function" && (this._read = S.read), typeof S.destroy == "function" && (this._destroy = S.destroy)), h.call(this);
  }
  Object.defineProperty(y.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(S) {
      this._readableState && (this._readableState.destroyed = S);
    }
  }), y.prototype.destroy = s.destroy, y.prototype._undestroy = s.undestroy, y.prototype._destroy = function(S, b) {
    this.push(null), b(S);
  }, y.prototype.push = function(S, b) {
    var W = this._readableState, $;
    return W.objectMode ? $ = !0 : typeof S == "string" && (b = b || W.defaultEncoding, b !== W.encoding && (S = u.from(S, b), b = ""), $ = !0), E(this, S, b, !1, $);
  }, y.prototype.unshift = function(S) {
    return E(this, S, null, !0, !1);
  };
  function E(S, b, W, $, he) {
    var le = S._readableState;
    if (b === null)
      le.reading = !1, M(S, le);
    else {
      var me;
      he || (me = C(le, b)), me ? S.emit("error", me) : le.objectMode || b && b.length > 0 ? (typeof b != "string" && !le.objectMode && Object.getPrototypeOf(b) !== u.prototype && (b = l(b)), $ ? le.endEmitted ? S.emit("error", new Error("stream.unshift() after end event")) : R(S, le, b, !0) : le.ended ? S.emit("error", new Error("stream.push() after EOF")) : (le.reading = !1, le.decoder && !W ? (b = le.decoder.write(b), le.objectMode || b.length !== 0 ? R(S, le, b, !1) : j(S, le)) : R(S, le, b, !1))) : $ || (le.reading = !1);
    }
    return I(le);
  }
  function R(S, b, W, $) {
    b.flowing && b.length === 0 && !b.sync ? (S.emit("data", W), S.read(0)) : (b.length += b.objectMode ? 1 : W.length, $ ? b.buffer.unshift(W) : b.buffer.push(W), b.needReadable && z(S)), j(S, b);
  }
  function C(S, b) {
    var W;
    return !i(b) && typeof b != "string" && b !== void 0 && !S.objectMode && (W = new TypeError("Invalid non-string/buffer chunk")), W;
  }
  function I(S) {
    return !S.ended && (S.needReadable || S.length < S.highWaterMark || S.length === 0);
  }
  y.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, y.prototype.setEncoding = function(S) {
    return f || (f = Qc().StringDecoder), this._readableState.decoder = new f(S), this._readableState.encoding = S, this;
  };
  var k = 8388608;
  function O(S) {
    return S >= k ? S = k : (S--, S |= S >>> 1, S |= S >>> 2, S |= S >>> 4, S |= S >>> 8, S |= S >>> 16, S++), S;
  }
  function A(S, b) {
    return S <= 0 || b.length === 0 && b.ended ? 0 : b.objectMode ? 1 : S !== S ? b.flowing && b.length ? b.buffer.head.data.length : b.length : (S > b.highWaterMark && (b.highWaterMark = O(S)), S <= b.length ? S : b.ended ? b.length : (b.needReadable = !0, 0));
  }
  y.prototype.read = function(S) {
    e("read", S), S = parseInt(S, 10);
    var b = this._readableState, W = S;
    if (S !== 0 && (b.emittedReadable = !1), S === 0 && b.needReadable && (b.length >= b.highWaterMark || b.ended))
      return e("read: emitReadable", b.length, b.ended), b.length === 0 && b.ended ? we(this) : z(this), null;
    if (S = A(S, b), S === 0 && b.ended)
      return b.length === 0 && we(this), null;
    var $ = b.needReadable;
    e("need readable", $), (b.length === 0 || b.length - S < b.highWaterMark) && ($ = !0, e("length less than watermark", $)), b.ended || b.reading ? ($ = !1, e("reading or ended", $)) : $ && (e("do read"), b.reading = !0, b.sync = !0, b.length === 0 && (b.needReadable = !0), this._read(b.highWaterMark), b.sync = !1, b.reading || (S = A(W, b)));
    var he;
    return S > 0 ? he = Q(S, b) : he = null, he === null ? (b.needReadable = !0, S = 0) : b.length -= S, b.length === 0 && (b.ended || (b.needReadable = !0), W !== S && b.ended && we(this)), he !== null && this.emit("data", he), he;
  };
  function M(S, b) {
    if (!b.ended) {
      if (b.decoder) {
        var W = b.decoder.end();
        W && W.length && (b.buffer.push(W), b.length += b.objectMode ? 1 : W.length);
      }
      b.ended = !0, z(S);
    }
  }
  function z(S) {
    var b = S._readableState;
    b.needReadable = !1, b.emittedReadable || (e("emitReadable", b.flowing), b.emittedReadable = !0, b.sync ? o.nextTick(U, S) : U(S));
  }
  function U(S) {
    e("emit readable"), S.emit("readable"), G(S);
  }
  function j(S, b) {
    b.readingMore || (b.readingMore = !0, o.nextTick(B, S, b));
  }
  function B(S, b) {
    for (var W = b.length; !b.reading && !b.flowing && !b.ended && b.length < b.highWaterMark && (e("maybeReadMore read 0"), S.read(0), W !== b.length); )
      W = b.length;
    b.readingMore = !1;
  }
  y.prototype._read = function(S) {
    this.emit("error", new Error("_read() is not implemented"));
  }, y.prototype.pipe = function(S, b) {
    var W = this, $ = this._readableState;
    switch ($.pipesCount) {
      case 0:
        $.pipes = S;
        break;
      case 1:
        $.pipes = [$.pipes, S];
        break;
      default:
        $.pipes.push(S);
        break;
    }
    $.pipesCount += 1, e("pipe count=%d opts=%j", $.pipesCount, b);
    var he = (!b || b.end !== !1) && S !== process.stdout && S !== process.stderr, le = he ? Ne : re;
    $.endEmitted ? o.nextTick(le) : W.once("end", le), S.on("unpipe", me);
    function me(oe, ge) {
      e("onunpipe"), oe === W && ge && ge.hasUnpiped === !1 && (ge.hasUnpiped = !0, Oe());
    }
    function Ne() {
      e("onend"), S.end();
    }
    var Te = H(W);
    S.on("drain", Te);
    var $e = !1;
    function Oe() {
      e("cleanup"), S.removeListener("close", Ge), S.removeListener("finish", _), S.removeListener("drain", Te), S.removeListener("error", Qe), S.removeListener("unpipe", me), W.removeListener("end", Ne), W.removeListener("end", re), W.removeListener("data", He), $e = !0, $.awaitDrain && (!S._writableState || S._writableState.needDrain) && Te();
    }
    var ke = !1;
    W.on("data", He);
    function He(oe) {
      e("ondata"), ke = !1;
      var ge = S.write(oe);
      ge === !1 && !ke && (($.pipesCount === 1 && $.pipes === S || $.pipesCount > 1 && be($.pipes, S) !== -1) && !$e && (e("false write response, pause", $.awaitDrain), $.awaitDrain++, ke = !0), W.pause());
    }
    function Qe(oe) {
      e("onerror", oe), re(), S.removeListener("error", Qe), c(S, "error") === 0 && S.emit("error", oe);
    }
    m(S, "error", Qe);
    function Ge() {
      S.removeListener("finish", _), re();
    }
    S.once("close", Ge);
    function _() {
      e("onfinish"), S.removeListener("close", Ge), re();
    }
    S.once("finish", _);
    function re() {
      e("unpipe"), W.unpipe(S);
    }
    return S.emit("pipe", W), $.flowing || (e("pipe resume"), W.resume()), S;
  };
  function H(S) {
    return function() {
      var b = S._readableState;
      e("pipeOnDrain", b.awaitDrain), b.awaitDrain && b.awaitDrain--, b.awaitDrain === 0 && c(S, "data") && (b.flowing = !0, G(S));
    };
  }
  y.prototype.unpipe = function(S) {
    var b = this._readableState, W = { hasUnpiped: !1 };
    if (b.pipesCount === 0) return this;
    if (b.pipesCount === 1)
      return S && S !== b.pipes ? this : (S || (S = b.pipes), b.pipes = null, b.pipesCount = 0, b.flowing = !1, S && S.emit("unpipe", this, W), this);
    if (!S) {
      var $ = b.pipes, he = b.pipesCount;
      b.pipes = null, b.pipesCount = 0, b.flowing = !1;
      for (var le = 0; le < he; le++)
        $[le].emit("unpipe", this, { hasUnpiped: !1 });
      return this;
    }
    var me = be(b.pipes, S);
    return me === -1 ? this : (b.pipes.splice(me, 1), b.pipesCount -= 1, b.pipesCount === 1 && (b.pipes = b.pipes[0]), S.emit("unpipe", this, W), this);
  }, y.prototype.on = function(S, b) {
    var W = h.prototype.on.call(this, S, b);
    if (S === "data")
      this._readableState.flowing !== !1 && this.resume();
    else if (S === "readable") {
      var $ = this._readableState;
      !$.endEmitted && !$.readableListening && ($.readableListening = $.needReadable = !0, $.emittedReadable = !1, $.reading ? $.length && z(this) : o.nextTick(te, this));
    }
    return W;
  }, y.prototype.addListener = y.prototype.on;
  function te(S) {
    e("readable nexttick read 0"), S.read(0);
  }
  y.prototype.resume = function() {
    var S = this._readableState;
    return S.flowing || (e("resume"), S.flowing = !0, N(this, S)), this;
  };
  function N(S, b) {
    b.resumeScheduled || (b.resumeScheduled = !0, o.nextTick(F, S, b));
  }
  function F(S, b) {
    b.reading || (e("resume read 0"), S.read(0)), b.resumeScheduled = !1, b.awaitDrain = 0, S.emit("resume"), G(S), b.flowing && !b.reading && S.read(0);
  }
  y.prototype.pause = function() {
    return e("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (e("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
  };
  function G(S) {
    var b = S._readableState;
    for (e("flow", b.flowing); b.flowing && S.read() !== null; )
      ;
  }
  y.prototype.wrap = function(S) {
    var b = this, W = this._readableState, $ = !1;
    S.on("end", function() {
      if (e("wrapped end"), W.decoder && !W.ended) {
        var me = W.decoder.end();
        me && me.length && b.push(me);
      }
      b.push(null);
    }), S.on("data", function(me) {
      if (e("wrapped data"), W.decoder && (me = W.decoder.write(me)), !(W.objectMode && me == null) && !(!W.objectMode && (!me || !me.length))) {
        var Ne = b.push(me);
        Ne || ($ = !0, S.pause());
      }
    });
    for (var he in S)
      this[he] === void 0 && typeof S[he] == "function" && (this[he] = /* @__PURE__ */ (function(me) {
        return function() {
          return S[me].apply(S, arguments);
        };
      })(he));
    for (var le = 0; le < g.length; le++)
      S.on(g[le], this.emit.bind(this, g[le]));
    return this._read = function(me) {
      e("wrapped _read", me), $ && ($ = !1, S.resume());
    }, this;
  }, Object.defineProperty(y.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), y._fromList = Q;
  function Q(S, b) {
    if (b.length === 0) return null;
    var W;
    return b.objectMode ? W = b.buffer.shift() : !S || S >= b.length ? (b.decoder ? W = b.buffer.join("") : b.buffer.length === 1 ? W = b.buffer.head.data : W = b.buffer.concat(b.length), b.buffer.clear()) : W = ce(S, b.buffer, b.decoder), W;
  }
  function ce(S, b, W) {
    var $;
    return S < b.head.data.length ? ($ = b.head.data.slice(0, S), b.head.data = b.head.data.slice(S)) : S === b.head.data.length ? $ = b.shift() : $ = W ? ae(S, b) : ve(S, b), $;
  }
  function ae(S, b) {
    var W = b.head, $ = 1, he = W.data;
    for (S -= he.length; W = W.next; ) {
      var le = W.data, me = S > le.length ? le.length : S;
      if (me === le.length ? he += le : he += le.slice(0, S), S -= me, S === 0) {
        me === le.length ? (++$, W.next ? b.head = W.next : b.head = b.tail = null) : (b.head = W, W.data = le.slice(me));
        break;
      }
      ++$;
    }
    return b.length -= $, he;
  }
  function ve(S, b) {
    var W = u.allocUnsafe(S), $ = b.head, he = 1;
    for ($.data.copy(W), S -= $.data.length; $ = $.next; ) {
      var le = $.data, me = S > le.length ? le.length : S;
      if (le.copy(W, W.length - S, 0, me), S -= me, S === 0) {
        me === le.length ? (++he, $.next ? b.head = $.next : b.head = b.tail = null) : (b.head = $, $.data = le.slice(me));
        break;
      }
      ++he;
    }
    return b.length -= he, W;
  }
  function we(S) {
    var b = S._readableState;
    if (b.length > 0) throw new Error('"endReadable()" called on non-empty stream');
    b.endEmitted || (b.ended = !0, o.nextTick(ie, b, S));
  }
  function ie(S, b) {
    !S.endEmitted && S.length === 0 && (S.endEmitted = !0, b.readable = !1, b.emit("end"));
  }
  function be(S, b) {
    for (var W = 0, $ = S.length; W < $; W++)
      if (S[W] === b) return W;
    return -1;
  }
  return Ba;
}
var ja, tf;
function jm() {
  if (tf) return ja;
  tf = 1, ja = c;
  var o = Dr(), d = Object.create(Cn());
  d.inherits = Rn(), d.inherits(c, o);
  function p(n, l) {
    var i = this._transformState;
    i.transforming = !1;
    var a = i.writecb;
    if (!a)
      return this.emit("error", new Error("write callback called multiple times"));
    i.writechunk = null, i.writecb = null, l != null && this.push(l), a(n);
    var r = this._readableState;
    r.reading = !1, (r.needReadable || r.length < r.highWaterMark) && this._read(r.highWaterMark);
  }
  function c(n) {
    if (!(this instanceof c)) return new c(n);
    o.call(this, n), this._transformState = {
      afterTransform: p.bind(this),
      needTransform: !1,
      transforming: !1,
      writecb: null,
      writechunk: null,
      writeencoding: null
    }, this._readableState.needReadable = !0, this._readableState.sync = !1, n && (typeof n.transform == "function" && (this._transform = n.transform), typeof n.flush == "function" && (this._flush = n.flush)), this.on("prefinish", h);
  }
  function h() {
    var n = this;
    typeof this._flush == "function" ? this._flush(function(l, i) {
      u(n, l, i);
    }) : u(this, null, null);
  }
  c.prototype.push = function(n, l) {
    return this._transformState.needTransform = !1, o.prototype.push.call(this, n, l);
  }, c.prototype._transform = function(n, l, i) {
    throw new Error("_transform() is not implemented");
  }, c.prototype._write = function(n, l, i) {
    var a = this._transformState;
    if (a.writecb = i, a.writechunk = n, a.writeencoding = l, !a.transforming) {
      var r = this._readableState;
      (a.needTransform || r.needReadable || r.length < r.highWaterMark) && this._read(r.highWaterMark);
    }
  }, c.prototype._read = function(n) {
    var l = this._transformState;
    l.writechunk !== null && l.writecb && !l.transforming ? (l.transforming = !0, this._transform(l.writechunk, l.writeencoding, l.afterTransform)) : l.needTransform = !0;
  }, c.prototype._destroy = function(n, l) {
    var i = this;
    o.prototype._destroy.call(this, n, function(a) {
      l(a), i.emit("close");
    });
  };
  function u(n, l, i) {
    if (l) return n.emit("error", l);
    if (i != null && n.push(i), n._writableState.length) throw new Error("Calling transform done when ws.length != 0");
    if (n._transformState.transforming) throw new Error("Calling transform done when still transforming");
    return n.push(null);
  }
  return ja;
}
var Ha, rf;
function av() {
  if (rf) return Ha;
  rf = 1, Ha = p;
  var o = jm(), d = Object.create(Cn());
  d.inherits = Rn(), d.inherits(p, o);
  function p(c) {
    if (!(this instanceof p)) return new p(c);
    o.call(this, c);
  }
  return p.prototype._transform = function(c, h, u) {
    u(null, c);
  }, Ha;
}
var nf;
function Hm() {
  return nf || (nf = 1, (function(o, d) {
    var p = ur;
    process.env.READABLE_STREAM === "disable" && p ? (o.exports = p, d = o.exports = p.Readable, d.Readable = p.Readable, d.Writable = p.Writable, d.Duplex = p.Duplex, d.Transform = p.Transform, d.PassThrough = p.PassThrough, d.Stream = p) : (d = o.exports = Bm(), d.Stream = p || d, d.Readable = d, d.Writable = Mm(), d.Duplex = Dr(), d.Transform = jm(), d.PassThrough = av());
  })(Jn, Jn.exports)), Jn.exports;
}
var af;
function Jt() {
  if (af) return vt;
  if (af = 1, vt.base64 = !0, vt.array = !0, vt.string = !0, vt.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", vt.nodebuffer = typeof Buffer < "u", vt.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u")
    vt.blob = !1;
  else {
    var o = new ArrayBuffer(0);
    try {
      vt.blob = new Blob([o], {
        type: "application/zip"
      }).size === 0;
    } catch {
      try {
        var d = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, p = new d();
        p.append(o), vt.blob = p.getBlob("application/zip").size === 0;
      } catch {
        vt.blob = !1;
      }
    }
  }
  try {
    vt.nodestream = !!Hm().Readable;
  } catch {
    vt.nodestream = !1;
  }
  return vt;
}
var ti = {}, sf;
function zm() {
  if (sf) return ti;
  sf = 1;
  var o = Je(), d = Jt(), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  return ti.encode = function(c) {
    for (var h = [], u, n, l, i, a, r, e, t = 0, s = c.length, f = s, g = o.getTypeOf(c) !== "string"; t < c.length; )
      f = s - t, g ? (u = c[t++], n = t < s ? c[t++] : 0, l = t < s ? c[t++] : 0) : (u = c.charCodeAt(t++), n = t < s ? c.charCodeAt(t++) : 0, l = t < s ? c.charCodeAt(t++) : 0), i = u >> 2, a = (u & 3) << 4 | n >> 4, r = f > 1 ? (n & 15) << 2 | l >> 6 : 64, e = f > 2 ? l & 63 : 64, h.push(p.charAt(i) + p.charAt(a) + p.charAt(r) + p.charAt(e));
    return h.join("");
  }, ti.decode = function(c) {
    var h, u, n, l, i, a, r, e = 0, t = 0, s = "data:";
    if (c.substr(0, s.length) === s)
      throw new Error("Invalid base64 input, it looks like a data url.");
    c = c.replace(/[^A-Za-z0-9+/=]/g, "");
    var f = c.length * 3 / 4;
    if (c.charAt(c.length - 1) === p.charAt(64) && f--, c.charAt(c.length - 2) === p.charAt(64) && f--, f % 1 !== 0)
      throw new Error("Invalid base64 input, bad content length.");
    var g;
    for (d.uint8array ? g = new Uint8Array(f | 0) : g = new Array(f | 0); e < c.length; )
      l = p.indexOf(c.charAt(e++)), i = p.indexOf(c.charAt(e++)), a = p.indexOf(c.charAt(e++)), r = p.indexOf(c.charAt(e++)), h = l << 2 | i >> 4, u = (i & 15) << 4 | a >> 2, n = (a & 3) << 6 | r, g[t++] = h, a !== 64 && (g[t++] = u), r !== 64 && (g[t++] = n);
    return g;
  }, ti;
}
var za, of;
function Ni() {
  return of || (of = 1, za = {
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
    newBufferFrom: function(o, d) {
      if (Buffer.from && Buffer.from !== Uint8Array.from)
        return Buffer.from(o, d);
      if (typeof o == "number")
        throw new Error('The "data" argument must not be a number');
      return new Buffer(o, d);
    },
    /**
     * Create a new nodejs Buffer with the specified size.
     * @param {Integer} size the size of the buffer.
     * @return {Buffer} a new Buffer.
     */
    allocBuffer: function(o) {
      if (Buffer.alloc)
        return Buffer.alloc(o);
      var d = new Buffer(o);
      return d.fill(0), d;
    },
    /**
     * Find out if an object is a Buffer.
     * @param {Object} b the object to test.
     * @return {Boolean} true if the object is a Buffer, false otherwise.
     */
    isBuffer: function(o) {
      return Buffer.isBuffer(o);
    },
    isStream: function(o) {
      return o && typeof o.on == "function" && typeof o.pause == "function" && typeof o.resume == "function";
    }
  }), za;
}
var Ga, lf;
function sv() {
  if (lf) return Ga;
  lf = 1;
  var o = Me.MutationObserver || Me.WebKitMutationObserver, d;
  if (process.browser)
    if (o) {
      var p = 0, c = new o(i), h = Me.document.createTextNode("");
      c.observe(h, {
        characterData: !0
      }), d = function() {
        h.data = p = ++p % 2;
      };
    } else if (!Me.setImmediate && typeof Me.MessageChannel < "u") {
      var u = new Me.MessageChannel();
      u.port1.onmessage = i, d = function() {
        u.port2.postMessage(0);
      };
    } else "document" in Me && "onreadystatechange" in Me.document.createElement("script") ? d = function() {
      var r = Me.document.createElement("script");
      r.onreadystatechange = function() {
        i(), r.onreadystatechange = null, r.parentNode.removeChild(r), r = null;
      }, Me.document.documentElement.appendChild(r);
    } : d = function() {
      setTimeout(i, 0);
    };
  else
    d = function() {
      process.nextTick(i);
    };
  var n, l = [];
  function i() {
    n = !0;
    for (var r, e, t = l.length; t; ) {
      for (e = l, l = [], r = -1; ++r < t; )
        e[r]();
      t = l.length;
    }
    n = !1;
  }
  Ga = a;
  function a(r) {
    l.push(r) === 1 && !n && d();
  }
  return Ga;
}
var Wa, uf;
function ov() {
  if (uf) return Wa;
  uf = 1;
  var o = sv();
  function d() {
  }
  var p = {}, c = ["REJECTED"], h = ["FULFILLED"], u = ["PENDING"];
  if (!process.browser)
    var n = ["UNHANDLED"];
  Wa = l;
  function l(v) {
    if (typeof v != "function")
      throw new TypeError("resolver must be a function");
    this.state = u, this.queue = [], this.outcome = void 0, process.browser || (this.handled = n), v !== d && e(this, v);
  }
  l.prototype.finally = function(v) {
    if (typeof v != "function")
      return this;
    var y = this.constructor;
    return this.then(E, R);
    function E(C) {
      function I() {
        return C;
      }
      return y.resolve(v()).then(I);
    }
    function R(C) {
      function I() {
        throw C;
      }
      return y.resolve(v()).then(I);
    }
  }, l.prototype.catch = function(v) {
    return this.then(null, v);
  }, l.prototype.then = function(v, y) {
    if (typeof v != "function" && this.state === h || typeof y != "function" && this.state === c)
      return this;
    var E = new this.constructor(d);
    if (process.browser || this.handled === n && (this.handled = null), this.state !== u) {
      var R = this.state === h ? v : y;
      a(E, R, this.outcome);
    } else
      this.queue.push(new i(E, v, y));
    return E;
  };
  function i(v, y, E) {
    this.promise = v, typeof y == "function" && (this.onFulfilled = y, this.callFulfilled = this.otherCallFulfilled), typeof E == "function" && (this.onRejected = E, this.callRejected = this.otherCallRejected);
  }
  i.prototype.callFulfilled = function(v) {
    p.resolve(this.promise, v);
  }, i.prototype.otherCallFulfilled = function(v) {
    a(this.promise, this.onFulfilled, v);
  }, i.prototype.callRejected = function(v) {
    p.reject(this.promise, v);
  }, i.prototype.otherCallRejected = function(v) {
    a(this.promise, this.onRejected, v);
  };
  function a(v, y, E) {
    o(function() {
      var R;
      try {
        R = y(E);
      } catch (C) {
        return p.reject(v, C);
      }
      R === v ? p.reject(v, new TypeError("Cannot resolve promise with itself")) : p.resolve(v, R);
    });
  }
  p.resolve = function(v, y) {
    var E = t(r, y);
    if (E.status === "error")
      return p.reject(v, E.value);
    var R = E.value;
    if (R)
      e(v, R);
    else {
      v.state = h, v.outcome = y;
      for (var C = -1, I = v.queue.length; ++C < I; )
        v.queue[C].callFulfilled(y);
    }
    return v;
  }, p.reject = function(v, y) {
    v.state = c, v.outcome = y, process.browser || v.handled === n && o(function() {
      v.handled === n && process.emit("unhandledRejection", y, v);
    });
    for (var E = -1, R = v.queue.length; ++E < R; )
      v.queue[E].callRejected(y);
    return v;
  };
  function r(v) {
    var y = v && v.then;
    if (v && (typeof v == "object" || typeof v == "function") && typeof y == "function")
      return function() {
        y.apply(v, arguments);
      };
  }
  function e(v, y) {
    var E = !1;
    function R(O) {
      E || (E = !0, p.reject(v, O));
    }
    function C(O) {
      E || (E = !0, p.resolve(v, O));
    }
    function I() {
      y(C, R);
    }
    var k = t(I);
    k.status === "error" && R(k.value);
  }
  function t(v, y) {
    var E = {};
    try {
      E.value = v(y), E.status = "success";
    } catch (R) {
      E.status = "error", E.value = R;
    }
    return E;
  }
  l.resolve = s;
  function s(v) {
    return v instanceof this ? v : p.resolve(new this(d), v);
  }
  l.reject = f;
  function f(v) {
    var y = new this(d);
    return p.reject(y, v);
  }
  l.all = g;
  function g(v) {
    var y = this;
    if (Object.prototype.toString.call(v) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var E = v.length, R = !1;
    if (!E)
      return this.resolve([]);
    for (var C = new Array(E), I = 0, k = -1, O = new this(d); ++k < E; )
      A(v[k], k);
    return O;
    function A(M, z) {
      y.resolve(M).then(U, function(j) {
        R || (R = !0, p.reject(O, j));
      });
      function U(j) {
        C[z] = j, ++I === E && !R && (R = !0, p.resolve(O, C));
      }
    }
  }
  l.race = m;
  function m(v) {
    var y = this;
    if (Object.prototype.toString.call(v) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var E = v.length, R = !1;
    if (!E)
      return this.resolve([]);
    for (var C = -1, I = new this(d); ++C < E; )
      k(v[C]);
    return I;
    function k(O) {
      y.resolve(O).then(function(A) {
        R || (R = !0, p.resolve(I, A));
      }, function(A) {
        R || (R = !0, p.reject(I, A));
      });
    }
  }
  return Wa;
}
var Ya, cf;
function Tn() {
  if (cf) return Ya;
  cf = 1;
  var o = null;
  return typeof Promise < "u" ? o = Promise : o = ov(), Ya = {
    Promise: o
  }, Ya;
}
var Ka = {}, ff;
function lv() {
  return ff || (ff = 1, (function(o, d) {
    if (o.setImmediate)
      return;
    var p = 1, c = {}, h = !1, u = o.document, n;
    function l(y) {
      typeof y != "function" && (y = new Function("" + y));
      for (var E = new Array(arguments.length - 1), R = 0; R < E.length; R++)
        E[R] = arguments[R + 1];
      var C = { callback: y, args: E };
      return c[p] = C, n(p), p++;
    }
    function i(y) {
      delete c[y];
    }
    function a(y) {
      var E = y.callback, R = y.args;
      switch (R.length) {
        case 0:
          E();
          break;
        case 1:
          E(R[0]);
          break;
        case 2:
          E(R[0], R[1]);
          break;
        case 3:
          E(R[0], R[1], R[2]);
          break;
        default:
          E.apply(d, R);
          break;
      }
    }
    function r(y) {
      if (h)
        setTimeout(r, 0, y);
      else {
        var E = c[y];
        if (E) {
          h = !0;
          try {
            a(E);
          } finally {
            i(y), h = !1;
          }
        }
      }
    }
    function e() {
      n = function(y) {
        process.nextTick(function() {
          r(y);
        });
      };
    }
    function t() {
      if (o.postMessage && !o.importScripts) {
        var y = !0, E = o.onmessage;
        return o.onmessage = function() {
          y = !1;
        }, o.postMessage("", "*"), o.onmessage = E, y;
      }
    }
    function s() {
      var y = "setImmediate$" + Math.random() + "$", E = function(R) {
        R.source === o && typeof R.data == "string" && R.data.indexOf(y) === 0 && r(+R.data.slice(y.length));
      };
      o.addEventListener ? o.addEventListener("message", E, !1) : o.attachEvent("onmessage", E), n = function(R) {
        o.postMessage(y + R, "*");
      };
    }
    function f() {
      var y = new MessageChannel();
      y.port1.onmessage = function(E) {
        var R = E.data;
        r(R);
      }, n = function(E) {
        y.port2.postMessage(E);
      };
    }
    function g() {
      var y = u.documentElement;
      n = function(E) {
        var R = u.createElement("script");
        R.onreadystatechange = function() {
          r(E), R.onreadystatechange = null, y.removeChild(R), R = null;
        }, y.appendChild(R);
      };
    }
    function m() {
      n = function(y) {
        setTimeout(r, 0, y);
      };
    }
    var v = Object.getPrototypeOf && Object.getPrototypeOf(o);
    v = v && v.setTimeout ? v : o, {}.toString.call(o.process) === "[object process]" ? e() : t() ? s() : o.MessageChannel ? f() : u && "onreadystatechange" in u.createElement("script") ? g() : m(), v.setImmediate = l, v.clearImmediate = i;
  })(typeof self > "u" ? typeof Me > "u" ? Ka : Me : self)), Ka;
}
var df;
function Je() {
  return df || (df = 1, (function(o) {
    var d = Jt(), p = zm(), c = Ni(), h = Tn();
    lv();
    function u(t) {
      var s = null;
      return d.uint8array ? s = new Uint8Array(t.length) : s = new Array(t.length), l(t, s);
    }
    o.newBlob = function(t, s) {
      o.checkSupport("blob");
      try {
        return new Blob([t], {
          type: s
        });
      } catch {
        try {
          var f = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, g = new f();
          return g.append(t), g.getBlob(s);
        } catch {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function n(t) {
      return t;
    }
    function l(t, s) {
      for (var f = 0; f < t.length; ++f)
        s[f] = t.charCodeAt(f) & 255;
      return s;
    }
    var i = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(t, s, f) {
        var g = [], m = 0, v = t.length;
        if (v <= f)
          return String.fromCharCode.apply(null, t);
        for (; m < v; )
          s === "array" || s === "nodebuffer" ? g.push(String.fromCharCode.apply(null, t.slice(m, Math.min(m + f, v)))) : g.push(String.fromCharCode.apply(null, t.subarray(m, Math.min(m + f, v)))), m += f;
        return g.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(t) {
        for (var s = "", f = 0; f < t.length; f++)
          s += String.fromCharCode(t[f]);
        return s;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function() {
          try {
            return d.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch {
            return !1;
          }
        })(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: (function() {
          try {
            return d.nodebuffer && String.fromCharCode.apply(null, c.allocBuffer(1)).length === 1;
          } catch {
            return !1;
          }
        })()
      }
    };
    function a(t) {
      var s = 65536, f = o.getTypeOf(t), g = !0;
      if (f === "uint8array" ? g = i.applyCanBeUsed.uint8array : f === "nodebuffer" && (g = i.applyCanBeUsed.nodebuffer), g)
        for (; s > 1; )
          try {
            return i.stringifyByChunk(t, f, s);
          } catch {
            s = Math.floor(s / 2);
          }
      return i.stringifyByChar(t);
    }
    o.applyFromCharCode = a;
    function r(t, s) {
      for (var f = 0; f < t.length; f++)
        s[f] = t[f];
      return s;
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
        return l(t, c.allocBuffer(t.length));
      }
    }, e.array = {
      string: a,
      array: n,
      arraybuffer: function(t) {
        return new Uint8Array(t).buffer;
      },
      uint8array: function(t) {
        return new Uint8Array(t);
      },
      nodebuffer: function(t) {
        return c.newBufferFrom(t);
      }
    }, e.arraybuffer = {
      string: function(t) {
        return a(new Uint8Array(t));
      },
      array: function(t) {
        return r(new Uint8Array(t), new Array(t.byteLength));
      },
      arraybuffer: n,
      uint8array: function(t) {
        return new Uint8Array(t);
      },
      nodebuffer: function(t) {
        return c.newBufferFrom(new Uint8Array(t));
      }
    }, e.uint8array = {
      string: a,
      array: function(t) {
        return r(t, new Array(t.length));
      },
      arraybuffer: function(t) {
        return t.buffer;
      },
      uint8array: n,
      nodebuffer: function(t) {
        return c.newBufferFrom(t);
      }
    }, e.nodebuffer = {
      string: a,
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
    }, o.transformTo = function(t, s) {
      if (s || (s = ""), !t)
        return s;
      o.checkSupport(t);
      var f = o.getTypeOf(s), g = e[f][t](s);
      return g;
    }, o.resolve = function(t) {
      for (var s = t.split("/"), f = [], g = 0; g < s.length; g++) {
        var m = s[g];
        m === "." || m === "" && g !== 0 && g !== s.length - 1 || (m === ".." ? f.pop() : f.push(m));
      }
      return f.join("/");
    }, o.getTypeOf = function(t) {
      if (typeof t == "string")
        return "string";
      if (Object.prototype.toString.call(t) === "[object Array]")
        return "array";
      if (d.nodebuffer && c.isBuffer(t))
        return "nodebuffer";
      if (d.uint8array && t instanceof Uint8Array)
        return "uint8array";
      if (d.arraybuffer && t instanceof ArrayBuffer)
        return "arraybuffer";
    }, o.checkSupport = function(t) {
      var s = d[t.toLowerCase()];
      if (!s)
        throw new Error(t + " is not supported by this platform");
    }, o.MAX_VALUE_16BITS = 65535, o.MAX_VALUE_32BITS = -1, o.pretty = function(t) {
      var s = "", f, g;
      for (g = 0; g < (t || "").length; g++)
        f = t.charCodeAt(g), s += "\\x" + (f < 16 ? "0" : "") + f.toString(16).toUpperCase();
      return s;
    }, o.delay = function(t, s, f) {
      setImmediate(function() {
        t.apply(f || null, s || []);
      });
    }, o.inherits = function(t, s) {
      var f = function() {
      };
      f.prototype = s.prototype, t.prototype = new f();
    }, o.extend = function() {
      var t = {}, s, f;
      for (s = 0; s < arguments.length; s++)
        for (f in arguments[s])
          Object.prototype.hasOwnProperty.call(arguments[s], f) && typeof t[f] > "u" && (t[f] = arguments[s][f]);
      return t;
    }, o.prepareContent = function(t, s, f, g, m) {
      var v = h.Promise.resolve(s).then(function(y) {
        var E = d.blob && (y instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(y)) !== -1);
        return E && typeof FileReader < "u" ? new h.Promise(function(R, C) {
          var I = new FileReader();
          I.onload = function(k) {
            R(k.target.result);
          }, I.onerror = function(k) {
            C(k.target.error);
          }, I.readAsArrayBuffer(y);
        }) : y;
      });
      return v.then(function(y) {
        var E = o.getTypeOf(y);
        return E ? (E === "arraybuffer" ? y = o.transformTo("uint8array", y) : E === "string" && (m ? y = p.decode(y) : f && g !== !0 && (y = u(y))), y) : h.Promise.reject(
          new Error("Can't read the data of '" + t + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
        );
      });
    };
  })(Da)), Da;
}
var Va, hf;
function Tt() {
  if (hf) return Va;
  hf = 1;
  function o(d) {
    this.name = d || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = {
      data: [],
      end: [],
      error: []
    }, this.previous = null;
  }
  return o.prototype = {
    /**
     * Push a chunk to the next workers.
     * @param {Object} chunk the chunk to push
     */
    push: function(d) {
      this.emit("data", d);
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
      } catch (d) {
        this.emit("error", d);
      }
      return !0;
    },
    /**
     * End the stream with an error.
     * @param {Error} e the error which caused the premature end.
     * @return {Boolean} true if this call ended the worker with an error, false otherwise.
     */
    error: function(d) {
      return this.isFinished ? !1 : (this.isPaused ? this.generatedError = d : (this.isFinished = !0, this.emit("error", d), this.previous && this.previous.error(d), this.cleanUp()), !0);
    },
    /**
     * Add a callback on an event.
     * @param {String} name the name of the event (data, end, error)
     * @param {Function} listener the function to call when the event is triggered
     * @return {GenericWorker} the current object for chainability
     */
    on: function(d, p) {
      return this._listeners[d].push(p), this;
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
    emit: function(d, p) {
      if (this._listeners[d])
        for (var c = 0; c < this._listeners[d].length; c++)
          this._listeners[d][c].call(this, p);
    },
    /**
     * Chain a worker with an other.
     * @param {Worker} next the worker receiving events from the current one.
     * @return {worker} the next worker for chainability
     */
    pipe: function(d) {
      return d.registerPrevious(this);
    },
    /**
     * Same as `pipe` in the other direction.
     * Using an API with `pipe(next)` is very easy.
     * Implementing the API with the point of view of the next one registering
     * a source is easier, see the ZipFileWorker.
     * @param {Worker} previous the previous worker, sending events to this one
     * @return {Worker} the current worker for chainability
     */
    registerPrevious: function(d) {
      if (this.isLocked)
        throw new Error("The stream '" + this + "' has already been used.");
      this.streamInfo = d.streamInfo, this.mergeStreamInfo(), this.previous = d;
      var p = this;
      return d.on("data", function(c) {
        p.processChunk(c);
      }), d.on("end", function() {
        p.end();
      }), d.on("error", function(c) {
        p.error(c);
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
      var d = !1;
      return this.generatedError && (this.error(this.generatedError), d = !0), this.previous && this.previous.resume(), !d;
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
    processChunk: function(d) {
      this.push(d);
    },
    /**
     * Add a key/value to be added in the workers chain streamInfo once activated.
     * @param {String} key the key to use
     * @param {Object} value the associated value
     * @return {Worker} the current worker for chainability
     */
    withStreamInfo: function(d, p) {
      return this.extraStreamInfo[d] = p, this.mergeStreamInfo(), this;
    },
    /**
     * Merge this worker's streamInfo into the chain's streamInfo.
     */
    mergeStreamInfo: function() {
      for (var d in this.extraStreamInfo)
        Object.prototype.hasOwnProperty.call(this.extraStreamInfo, d) && (this.streamInfo[d] = this.extraStreamInfo[d]);
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
      var d = "Worker " + this.name;
      return this.previous ? this.previous + " -> " + d : d;
    }
  }, Va = o, Va;
}
var pf;
function On() {
  return pf || (pf = 1, (function(o) {
    for (var d = Je(), p = Jt(), c = Ni(), h = Tt(), u = new Array(256), n = 0; n < 256; n++)
      u[n] = n >= 252 ? 6 : n >= 248 ? 5 : n >= 240 ? 4 : n >= 224 ? 3 : n >= 192 ? 2 : 1;
    u[254] = u[254] = 1;
    var l = function(t) {
      var s, f, g, m, v, y = t.length, E = 0;
      for (m = 0; m < y; m++)
        f = t.charCodeAt(m), (f & 64512) === 55296 && m + 1 < y && (g = t.charCodeAt(m + 1), (g & 64512) === 56320 && (f = 65536 + (f - 55296 << 10) + (g - 56320), m++)), E += f < 128 ? 1 : f < 2048 ? 2 : f < 65536 ? 3 : 4;
      for (p.uint8array ? s = new Uint8Array(E) : s = new Array(E), v = 0, m = 0; v < E; m++)
        f = t.charCodeAt(m), (f & 64512) === 55296 && m + 1 < y && (g = t.charCodeAt(m + 1), (g & 64512) === 56320 && (f = 65536 + (f - 55296 << 10) + (g - 56320), m++)), f < 128 ? s[v++] = f : f < 2048 ? (s[v++] = 192 | f >>> 6, s[v++] = 128 | f & 63) : f < 65536 ? (s[v++] = 224 | f >>> 12, s[v++] = 128 | f >>> 6 & 63, s[v++] = 128 | f & 63) : (s[v++] = 240 | f >>> 18, s[v++] = 128 | f >>> 12 & 63, s[v++] = 128 | f >>> 6 & 63, s[v++] = 128 | f & 63);
      return s;
    }, i = function(t, s) {
      var f;
      for (s = s || t.length, s > t.length && (s = t.length), f = s - 1; f >= 0 && (t[f] & 192) === 128; )
        f--;
      return f < 0 || f === 0 ? s : f + u[t[f]] > s ? f : s;
    }, a = function(t) {
      var s, f, g, m, v = t.length, y = new Array(v * 2);
      for (f = 0, s = 0; s < v; ) {
        if (g = t[s++], g < 128) {
          y[f++] = g;
          continue;
        }
        if (m = u[g], m > 4) {
          y[f++] = 65533, s += m - 1;
          continue;
        }
        for (g &= m === 2 ? 31 : m === 3 ? 15 : 7; m > 1 && s < v; )
          g = g << 6 | t[s++] & 63, m--;
        if (m > 1) {
          y[f++] = 65533;
          continue;
        }
        g < 65536 ? y[f++] = g : (g -= 65536, y[f++] = 55296 | g >> 10 & 1023, y[f++] = 56320 | g & 1023);
      }
      return y.length !== f && (y.subarray ? y = y.subarray(0, f) : y.length = f), d.applyFromCharCode(y);
    };
    o.utf8encode = function(s) {
      return p.nodebuffer ? c.newBufferFrom(s, "utf-8") : l(s);
    }, o.utf8decode = function(s) {
      return p.nodebuffer ? d.transformTo("nodebuffer", s).toString("utf-8") : (s = d.transformTo(p.uint8array ? "uint8array" : "array", s), a(s));
    };
    function r() {
      h.call(this, "utf-8 decode"), this.leftOver = null;
    }
    d.inherits(r, h), r.prototype.processChunk = function(t) {
      var s = d.transformTo(p.uint8array ? "uint8array" : "array", t.data);
      if (this.leftOver && this.leftOver.length) {
        if (p.uint8array) {
          var f = s;
          s = new Uint8Array(f.length + this.leftOver.length), s.set(this.leftOver, 0), s.set(f, this.leftOver.length);
        } else
          s = this.leftOver.concat(s);
        this.leftOver = null;
      }
      var g = i(s), m = s;
      g !== s.length && (p.uint8array ? (m = s.subarray(0, g), this.leftOver = s.subarray(g, s.length)) : (m = s.slice(0, g), this.leftOver = s.slice(g, s.length))), this.push({
        data: o.utf8decode(m),
        meta: t.meta
      });
    }, r.prototype.flush = function() {
      this.leftOver && this.leftOver.length && (this.push({
        data: o.utf8decode(this.leftOver),
        meta: {}
      }), this.leftOver = null);
    }, o.Utf8DecodeWorker = r;
    function e() {
      h.call(this, "utf-8 encode");
    }
    d.inherits(e, h), e.prototype.processChunk = function(t) {
      this.push({
        data: o.utf8encode(t.data),
        meta: t.meta
      });
    }, o.Utf8EncodeWorker = e;
  })(Ia)), Ia;
}
var Ja, mf;
function uv() {
  if (mf) return Ja;
  mf = 1;
  var o = Tt(), d = Je();
  function p(c) {
    o.call(this, "ConvertWorker to " + c), this.destType = c;
  }
  return d.inherits(p, o), p.prototype.processChunk = function(c) {
    this.push({
      data: d.transformTo(this.destType, c.data),
      meta: c.meta
    });
  }, Ja = p, Ja;
}
var Za, gf;
function cv() {
  if (gf) return Za;
  gf = 1;
  var o = Hm().Readable, d = Je();
  d.inherits(p, o);
  function p(c, h, u) {
    o.call(this, h), this._helper = c;
    var n = this;
    c.on("data", function(l, i) {
      n.push(l) || n._helper.pause(), u && u(i);
    }).on("error", function(l) {
      n.emit("error", l);
    }).on("end", function() {
      n.push(null);
    });
  }
  return p.prototype._read = function() {
    this._helper.resume();
  }, Za = p, Za;
}
var Xa, vf;
function Gm() {
  if (vf) return Xa;
  vf = 1;
  var o = Je(), d = uv(), p = Tt(), c = zm(), h = Jt(), u = Tn(), n = null;
  if (h.nodestream)
    try {
      n = cv();
    } catch {
    }
  function l(e, t, s) {
    switch (e) {
      case "blob":
        return o.newBlob(o.transformTo("arraybuffer", t), s);
      case "base64":
        return c.encode(t);
      default:
        return o.transformTo(e, t);
    }
  }
  function i(e, t) {
    var s, f = 0, g = null, m = 0;
    for (s = 0; s < t.length; s++)
      m += t[s].length;
    switch (e) {
      case "string":
        return t.join("");
      case "array":
        return Array.prototype.concat.apply([], t);
      case "uint8array":
        for (g = new Uint8Array(m), s = 0; s < t.length; s++)
          g.set(t[s], f), f += t[s].length;
        return g;
      case "nodebuffer":
        return Buffer.concat(t);
      default:
        throw new Error("concat : unsupported type '" + e + "'");
    }
  }
  function a(e, t) {
    return new u.Promise(function(s, f) {
      var g = [], m = e._internalType, v = e._outputType, y = e._mimeType;
      e.on("data", function(E, R) {
        g.push(E), t && t(R);
      }).on("error", function(E) {
        g = [], f(E);
      }).on("end", function() {
        try {
          var E = l(v, i(m, g), y);
          s(E);
        } catch (R) {
          f(R);
        }
        g = [];
      }).resume();
    });
  }
  function r(e, t, s) {
    var f = t;
    switch (t) {
      case "blob":
      case "arraybuffer":
        f = "uint8array";
        break;
      case "base64":
        f = "string";
        break;
    }
    try {
      this._internalType = f, this._outputType = t, this._mimeType = s, o.checkSupport(f), this._worker = e.pipe(new d(f)), e.lock();
    } catch (g) {
      this._worker = new p("error"), this._worker.error(g);
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
      return a(this, e);
    },
    /**
     * Add a listener on an event triggered on a stream.
     * @param {String} evt the name of the event
     * @param {Function} fn the listener
     * @return {StreamHelper} the current helper.
     */
    on: function(e, t) {
      var s = this;
      return e === "data" ? this._worker.on(e, function(f) {
        t.call(s, f.data, f.meta);
      }) : this._worker.on(e, function() {
        o.delay(t, arguments, s);
      }), this;
    },
    /**
     * Resume the flow of chunks.
     * @return {StreamHelper} the current helper.
     */
    resume: function() {
      return o.delay(this._worker.resume, [], this._worker), this;
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
      if (o.checkSupport("nodestream"), this._outputType !== "nodebuffer")
        throw new Error(this._outputType + " is not supported by this method");
      return new n(this, {
        objectMode: this._outputType !== "nodebuffer"
      }, e);
    }
  }, Xa = r, Xa;
}
var Ct = {}, yf;
function Wm() {
  return yf || (yf = 1, Ct.base64 = !1, Ct.binary = !1, Ct.dir = !1, Ct.createFolders = !0, Ct.date = null, Ct.compression = null, Ct.compressionOptions = null, Ct.comment = null, Ct.unixPermissions = null, Ct.dosPermissions = null), Ct;
}
var Qa, wf;
function Ym() {
  if (wf) return Qa;
  wf = 1;
  var o = Je(), d = Tt(), p = 16 * 1024;
  function c(h) {
    d.call(this, "DataWorker");
    var u = this;
    this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, h.then(function(n) {
      u.dataIsReady = !0, u.data = n, u.max = n && n.length || 0, u.type = o.getTypeOf(n), u.isPaused || u._tickAndRepeat();
    }, function(n) {
      u.error(n);
    });
  }
  return o.inherits(c, d), c.prototype.cleanUp = function() {
    d.prototype.cleanUp.call(this), this.data = null;
  }, c.prototype.resume = function() {
    return d.prototype.resume.call(this) ? (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, o.delay(this._tickAndRepeat, [], this)), !0) : !1;
  }, c.prototype._tickAndRepeat = function() {
    this._tickScheduled = !1, !(this.isPaused || this.isFinished) && (this._tick(), this.isFinished || (o.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
  }, c.prototype._tick = function() {
    if (this.isPaused || this.isFinished)
      return !1;
    var h = p, u = null, n = Math.min(this.max, this.index + h);
    if (this.index >= this.max)
      return this.end();
    switch (this.type) {
      case "string":
        u = this.data.substring(this.index, n);
        break;
      case "uint8array":
        u = this.data.subarray(this.index, n);
        break;
      case "array":
      case "nodebuffer":
        u = this.data.slice(this.index, n);
        break;
    }
    return this.index = n, this.push({
      data: u,
      meta: {
        percent: this.max ? this.index / this.max * 100 : 0
      }
    });
  }, Qa = c, Qa;
}
var es, _f;
function zl() {
  if (_f) return es;
  _f = 1;
  var o = Je();
  function d() {
    for (var u, n = [], l = 0; l < 256; l++) {
      u = l;
      for (var i = 0; i < 8; i++)
        u = u & 1 ? 3988292384 ^ u >>> 1 : u >>> 1;
      n[l] = u;
    }
    return n;
  }
  var p = d();
  function c(u, n, l, i) {
    var a = p, r = i + l;
    u = u ^ -1;
    for (var e = i; e < r; e++)
      u = u >>> 8 ^ a[(u ^ n[e]) & 255];
    return u ^ -1;
  }
  function h(u, n, l, i) {
    var a = p, r = i + l;
    u = u ^ -1;
    for (var e = i; e < r; e++)
      u = u >>> 8 ^ a[(u ^ n.charCodeAt(e)) & 255];
    return u ^ -1;
  }
  return es = function(n, l) {
    if (typeof n > "u" || !n.length)
      return 0;
    var i = o.getTypeOf(n) !== "string";
    return i ? c(l | 0, n, n.length, 0) : h(l | 0, n, n.length, 0);
  }, es;
}
var ts, bf;
function Km() {
  if (bf) return ts;
  bf = 1;
  var o = Tt(), d = zl(), p = Je();
  function c() {
    o.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
  }
  return p.inherits(c, o), c.prototype.processChunk = function(h) {
    this.streamInfo.crc32 = d(h.data, this.streamInfo.crc32 || 0), this.push(h);
  }, ts = c, ts;
}
var rs, Ef;
function fv() {
  if (Ef) return rs;
  Ef = 1;
  var o = Je(), d = Tt();
  function p(c) {
    d.call(this, "DataLengthProbe for " + c), this.propName = c, this.withStreamInfo(c, 0);
  }
  return o.inherits(p, d), p.prototype.processChunk = function(c) {
    if (c) {
      var h = this.streamInfo[this.propName] || 0;
      this.streamInfo[this.propName] = h + c.data.length;
    }
    d.prototype.processChunk.call(this, c);
  }, rs = p, rs;
}
var ns, Sf;
function Gl() {
  if (Sf) return ns;
  Sf = 1;
  var o = Tn(), d = Ym(), p = Km(), c = fv();
  function h(u, n, l, i, a) {
    this.compressedSize = u, this.uncompressedSize = n, this.crc32 = l, this.compression = i, this.compressedContent = a;
  }
  return h.prototype = {
    /**
     * Create a worker to get the uncompressed content.
     * @return {GenericWorker} the worker.
     */
    getContentWorker: function() {
      var u = new d(o.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new c("data_length")), n = this;
      return u.on("end", function() {
        if (this.streamInfo.data_length !== n.uncompressedSize)
          throw new Error("Bug : uncompressed data size mismatch");
      }), u;
    },
    /**
     * Create a worker to get the compressed content.
     * @return {GenericWorker} the worker.
     */
    getCompressedWorker: function() {
      return new d(o.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
    }
  }, h.createWorkerFrom = function(u, n, l) {
    return u.pipe(new p()).pipe(new c("uncompressedSize")).pipe(n.compressWorker(l)).pipe(new c("compressedSize")).withStreamInfo("compression", n);
  }, ns = h, ns;
}
var is, Af;
function dv() {
  if (Af) return is;
  Af = 1;
  var o = Gm(), d = Ym(), p = On(), c = Gl(), h = Tt(), u = function(a, r, e) {
    this.name = a, this.dir = e.dir, this.date = e.date, this.comment = e.comment, this.unixPermissions = e.unixPermissions, this.dosPermissions = e.dosPermissions, this._data = r, this._dataBinary = e.binary, this.options = {
      compression: e.compression,
      compressionOptions: e.compressionOptions
    };
  };
  u.prototype = {
    /**
     * Create an internal stream for the content of this object.
     * @param {String} type the type of each chunk.
     * @return StreamHelper the stream.
     */
    internalStream: function(a) {
      var r = null, e = "string";
      try {
        if (!a)
          throw new Error("No output type specified.");
        e = a.toLowerCase();
        var t = e === "string" || e === "text";
        (e === "binarystring" || e === "text") && (e = "string"), r = this._decompressWorker();
        var s = !this._dataBinary;
        s && !t && (r = r.pipe(new p.Utf8EncodeWorker())), !s && t && (r = r.pipe(new p.Utf8DecodeWorker()));
      } catch (f) {
        r = new h("error"), r.error(f);
      }
      return new o(r, e, "");
    },
    /**
     * Prepare the content in the asked type.
     * @param {String} type the type of the result.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Promise the promise of the result.
     */
    async: function(a, r) {
      return this.internalStream(a).accumulate(r);
    },
    /**
     * Prepare the content as a nodejs stream.
     * @param {String} type the type of each chunk.
     * @param {Function} onUpdate a function to call on each internal update.
     * @return Stream the stream.
     */
    nodeStream: function(a, r) {
      return this.internalStream(a || "nodebuffer").toNodejsStream(r);
    },
    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    _compressWorker: function(a, r) {
      if (this._data instanceof c && this._data.compression.magic === a.magic)
        return this._data.getCompressedWorker();
      var e = this._decompressWorker();
      return this._dataBinary || (e = e.pipe(new p.Utf8EncodeWorker())), c.createWorkerFrom(e, a, r);
    },
    /**
     * Return a worker for the decompressed content.
     * @private
     * @return Worker the worker.
     */
    _decompressWorker: function() {
      return this._data instanceof c ? this._data.getContentWorker() : this._data instanceof h ? this._data : new d(this._data);
    }
  };
  for (var n = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
  }, i = 0; i < n.length; i++)
    u.prototype[n[i]] = l;
  return is = u, is;
}
var as = {}, ri = {}, Kr = {}, ss = {}, Cf;
function Zt() {
  return Cf || (Cf = 1, (function(o) {
    var d = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
    function p(u, n) {
      return Object.prototype.hasOwnProperty.call(u, n);
    }
    o.assign = function(u) {
      for (var n = Array.prototype.slice.call(arguments, 1); n.length; ) {
        var l = n.shift();
        if (l) {
          if (typeof l != "object")
            throw new TypeError(l + "must be non-object");
          for (var i in l)
            p(l, i) && (u[i] = l[i]);
        }
      }
      return u;
    }, o.shrinkBuf = function(u, n) {
      return u.length === n ? u : u.subarray ? u.subarray(0, n) : (u.length = n, u);
    };
    var c = {
      arraySet: function(u, n, l, i, a) {
        if (n.subarray && u.subarray) {
          u.set(n.subarray(l, l + i), a);
          return;
        }
        for (var r = 0; r < i; r++)
          u[a + r] = n[l + r];
      },
      // Join array of chunks to single array.
      flattenChunks: function(u) {
        var n, l, i, a, r, e;
        for (i = 0, n = 0, l = u.length; n < l; n++)
          i += u[n].length;
        for (e = new Uint8Array(i), a = 0, n = 0, l = u.length; n < l; n++)
          r = u[n], e.set(r, a), a += r.length;
        return e;
      }
    }, h = {
      arraySet: function(u, n, l, i, a) {
        for (var r = 0; r < i; r++)
          u[a + r] = n[l + r];
      },
      // Join array of chunks to single array.
      flattenChunks: function(u) {
        return [].concat.apply([], u);
      }
    };
    o.setTyped = function(u) {
      u ? (o.Buf8 = Uint8Array, o.Buf16 = Uint16Array, o.Buf32 = Int32Array, o.assign(o, c)) : (o.Buf8 = Array, o.Buf16 = Array, o.Buf32 = Array, o.assign(o, h));
    }, o.setTyped(d);
  })(ss)), ss;
}
var Ar = {}, Dt = {}, rr = {}, Rf;
function hv() {
  if (Rf) return rr;
  Rf = 1;
  var o = Zt(), d = 4, p = 0, c = 1, h = 2;
  function u(L) {
    for (var se = L.length; --se >= 0; )
      L[se] = 0;
  }
  var n = 0, l = 1, i = 2, a = 3, r = 258, e = 29, t = 256, s = t + 1 + e, f = 30, g = 19, m = 2 * s + 1, v = 15, y = 16, E = 7, R = 256, C = 16, I = 17, k = 18, O = (
    /* extra bits for each length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
  ), A = (
    /* extra bits for each distance code */
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  ), M = (
    /* extra bits for each bit length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
  ), z = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], U = 512, j = new Array((s + 2) * 2);
  u(j);
  var B = new Array(f * 2);
  u(B);
  var H = new Array(U);
  u(H);
  var te = new Array(r - a + 1);
  u(te);
  var N = new Array(e);
  u(N);
  var F = new Array(f);
  u(F);
  function G(L, se, ne, P, x) {
    this.static_tree = L, this.extra_bits = se, this.extra_base = ne, this.elems = P, this.max_length = x, this.has_stree = L && L.length;
  }
  var Q, ce, ae;
  function ve(L, se) {
    this.dyn_tree = L, this.max_code = 0, this.stat_desc = se;
  }
  function we(L) {
    return L < 256 ? H[L] : H[256 + (L >>> 7)];
  }
  function ie(L, se) {
    L.pending_buf[L.pending++] = se & 255, L.pending_buf[L.pending++] = se >>> 8 & 255;
  }
  function be(L, se, ne) {
    L.bi_valid > y - ne ? (L.bi_buf |= se << L.bi_valid & 65535, ie(L, L.bi_buf), L.bi_buf = se >> y - L.bi_valid, L.bi_valid += ne - y) : (L.bi_buf |= se << L.bi_valid & 65535, L.bi_valid += ne);
  }
  function S(L, se, ne) {
    be(
      L,
      ne[se * 2],
      ne[se * 2 + 1]
      /*.Len*/
    );
  }
  function b(L, se) {
    var ne = 0;
    do
      ne |= L & 1, L >>>= 1, ne <<= 1;
    while (--se > 0);
    return ne >>> 1;
  }
  function W(L) {
    L.bi_valid === 16 ? (ie(L, L.bi_buf), L.bi_buf = 0, L.bi_valid = 0) : L.bi_valid >= 8 && (L.pending_buf[L.pending++] = L.bi_buf & 255, L.bi_buf >>= 8, L.bi_valid -= 8);
  }
  function $(L, se) {
    var ne = se.dyn_tree, P = se.max_code, x = se.stat_desc.static_tree, Y = se.stat_desc.has_stree, T = se.stat_desc.extra_bits, J = se.stat_desc.extra_base, ue = se.stat_desc.max_length, w, V, Z, D, K, ee, _e = 0;
    for (D = 0; D <= v; D++)
      L.bl_count[D] = 0;
    for (ne[L.heap[L.heap_max] * 2 + 1] = 0, w = L.heap_max + 1; w < m; w++)
      V = L.heap[w], D = ne[ne[V * 2 + 1] * 2 + 1] + 1, D > ue && (D = ue, _e++), ne[V * 2 + 1] = D, !(V > P) && (L.bl_count[D]++, K = 0, V >= J && (K = T[V - J]), ee = ne[V * 2], L.opt_len += ee * (D + K), Y && (L.static_len += ee * (x[V * 2 + 1] + K)));
    if (_e !== 0) {
      do {
        for (D = ue - 1; L.bl_count[D] === 0; )
          D--;
        L.bl_count[D]--, L.bl_count[D + 1] += 2, L.bl_count[ue]--, _e -= 2;
      } while (_e > 0);
      for (D = ue; D !== 0; D--)
        for (V = L.bl_count[D]; V !== 0; )
          Z = L.heap[--w], !(Z > P) && (ne[Z * 2 + 1] !== D && (L.opt_len += (D - ne[Z * 2 + 1]) * ne[Z * 2], ne[Z * 2 + 1] = D), V--);
    }
  }
  function he(L, se, ne) {
    var P = new Array(v + 1), x = 0, Y, T;
    for (Y = 1; Y <= v; Y++)
      P[Y] = x = x + ne[Y - 1] << 1;
    for (T = 0; T <= se; T++) {
      var J = L[T * 2 + 1];
      J !== 0 && (L[T * 2] = b(P[J]++, J));
    }
  }
  function le() {
    var L, se, ne, P, x, Y = new Array(v + 1);
    for (ne = 0, P = 0; P < e - 1; P++)
      for (N[P] = ne, L = 0; L < 1 << O[P]; L++)
        te[ne++] = P;
    for (te[ne - 1] = P, x = 0, P = 0; P < 16; P++)
      for (F[P] = x, L = 0; L < 1 << A[P]; L++)
        H[x++] = P;
    for (x >>= 7; P < f; P++)
      for (F[P] = x << 7, L = 0; L < 1 << A[P] - 7; L++)
        H[256 + x++] = P;
    for (se = 0; se <= v; se++)
      Y[se] = 0;
    for (L = 0; L <= 143; )
      j[L * 2 + 1] = 8, L++, Y[8]++;
    for (; L <= 255; )
      j[L * 2 + 1] = 9, L++, Y[9]++;
    for (; L <= 279; )
      j[L * 2 + 1] = 7, L++, Y[7]++;
    for (; L <= 287; )
      j[L * 2 + 1] = 8, L++, Y[8]++;
    for (he(j, s + 1, Y), L = 0; L < f; L++)
      B[L * 2 + 1] = 5, B[L * 2] = b(L, 5);
    Q = new G(j, O, t + 1, s, v), ce = new G(B, A, 0, f, v), ae = new G(new Array(0), M, 0, g, E);
  }
  function me(L) {
    var se;
    for (se = 0; se < s; se++)
      L.dyn_ltree[se * 2] = 0;
    for (se = 0; se < f; se++)
      L.dyn_dtree[se * 2] = 0;
    for (se = 0; se < g; se++)
      L.bl_tree[se * 2] = 0;
    L.dyn_ltree[R * 2] = 1, L.opt_len = L.static_len = 0, L.last_lit = L.matches = 0;
  }
  function Ne(L) {
    L.bi_valid > 8 ? ie(L, L.bi_buf) : L.bi_valid > 0 && (L.pending_buf[L.pending++] = L.bi_buf), L.bi_buf = 0, L.bi_valid = 0;
  }
  function Te(L, se, ne, P) {
    Ne(L), ie(L, ne), ie(L, ~ne), o.arraySet(L.pending_buf, L.window, se, ne, L.pending), L.pending += ne;
  }
  function $e(L, se, ne, P) {
    var x = se * 2, Y = ne * 2;
    return L[x] < L[Y] || L[x] === L[Y] && P[se] <= P[ne];
  }
  function Oe(L, se, ne) {
    for (var P = L.heap[ne], x = ne << 1; x <= L.heap_len && (x < L.heap_len && $e(se, L.heap[x + 1], L.heap[x], L.depth) && x++, !$e(se, P, L.heap[x], L.depth)); )
      L.heap[ne] = L.heap[x], ne = x, x <<= 1;
    L.heap[ne] = P;
  }
  function ke(L, se, ne) {
    var P, x, Y = 0, T, J;
    if (L.last_lit !== 0)
      do
        P = L.pending_buf[L.d_buf + Y * 2] << 8 | L.pending_buf[L.d_buf + Y * 2 + 1], x = L.pending_buf[L.l_buf + Y], Y++, P === 0 ? S(L, x, se) : (T = te[x], S(L, T + t + 1, se), J = O[T], J !== 0 && (x -= N[T], be(L, x, J)), P--, T = we(P), S(L, T, ne), J = A[T], J !== 0 && (P -= F[T], be(L, P, J)));
      while (Y < L.last_lit);
    S(L, R, se);
  }
  function He(L, se) {
    var ne = se.dyn_tree, P = se.stat_desc.static_tree, x = se.stat_desc.has_stree, Y = se.stat_desc.elems, T, J, ue = -1, w;
    for (L.heap_len = 0, L.heap_max = m, T = 0; T < Y; T++)
      ne[T * 2] !== 0 ? (L.heap[++L.heap_len] = ue = T, L.depth[T] = 0) : ne[T * 2 + 1] = 0;
    for (; L.heap_len < 2; )
      w = L.heap[++L.heap_len] = ue < 2 ? ++ue : 0, ne[w * 2] = 1, L.depth[w] = 0, L.opt_len--, x && (L.static_len -= P[w * 2 + 1]);
    for (se.max_code = ue, T = L.heap_len >> 1; T >= 1; T--)
      Oe(L, ne, T);
    w = Y;
    do
      T = L.heap[
        1
        /*SMALLEST*/
      ], L.heap[
        1
        /*SMALLEST*/
      ] = L.heap[L.heap_len--], Oe(
        L,
        ne,
        1
        /*SMALLEST*/
      ), J = L.heap[
        1
        /*SMALLEST*/
      ], L.heap[--L.heap_max] = T, L.heap[--L.heap_max] = J, ne[w * 2] = ne[T * 2] + ne[J * 2], L.depth[w] = (L.depth[T] >= L.depth[J] ? L.depth[T] : L.depth[J]) + 1, ne[T * 2 + 1] = ne[J * 2 + 1] = w, L.heap[
        1
        /*SMALLEST*/
      ] = w++, Oe(
        L,
        ne,
        1
        /*SMALLEST*/
      );
    while (L.heap_len >= 2);
    L.heap[--L.heap_max] = L.heap[
      1
      /*SMALLEST*/
    ], $(L, se), he(ne, ue, L.bl_count);
  }
  function Qe(L, se, ne) {
    var P, x = -1, Y, T = se[1], J = 0, ue = 7, w = 4;
    for (T === 0 && (ue = 138, w = 3), se[(ne + 1) * 2 + 1] = 65535, P = 0; P <= ne; P++)
      Y = T, T = se[(P + 1) * 2 + 1], !(++J < ue && Y === T) && (J < w ? L.bl_tree[Y * 2] += J : Y !== 0 ? (Y !== x && L.bl_tree[Y * 2]++, L.bl_tree[C * 2]++) : J <= 10 ? L.bl_tree[I * 2]++ : L.bl_tree[k * 2]++, J = 0, x = Y, T === 0 ? (ue = 138, w = 3) : Y === T ? (ue = 6, w = 3) : (ue = 7, w = 4));
  }
  function Ge(L, se, ne) {
    var P, x = -1, Y, T = se[1], J = 0, ue = 7, w = 4;
    for (T === 0 && (ue = 138, w = 3), P = 0; P <= ne; P++)
      if (Y = T, T = se[(P + 1) * 2 + 1], !(++J < ue && Y === T)) {
        if (J < w)
          do
            S(L, Y, L.bl_tree);
          while (--J !== 0);
        else Y !== 0 ? (Y !== x && (S(L, Y, L.bl_tree), J--), S(L, C, L.bl_tree), be(L, J - 3, 2)) : J <= 10 ? (S(L, I, L.bl_tree), be(L, J - 3, 3)) : (S(L, k, L.bl_tree), be(L, J - 11, 7));
        J = 0, x = Y, T === 0 ? (ue = 138, w = 3) : Y === T ? (ue = 6, w = 3) : (ue = 7, w = 4);
      }
  }
  function _(L) {
    var se;
    for (Qe(L, L.dyn_ltree, L.l_desc.max_code), Qe(L, L.dyn_dtree, L.d_desc.max_code), He(L, L.bl_desc), se = g - 1; se >= 3 && L.bl_tree[z[se] * 2 + 1] === 0; se--)
      ;
    return L.opt_len += 3 * (se + 1) + 5 + 5 + 4, se;
  }
  function re(L, se, ne, P) {
    var x;
    for (be(L, se - 257, 5), be(L, ne - 1, 5), be(L, P - 4, 4), x = 0; x < P; x++)
      be(L, L.bl_tree[z[x] * 2 + 1], 3);
    Ge(L, L.dyn_ltree, se - 1), Ge(L, L.dyn_dtree, ne - 1);
  }
  function oe(L) {
    var se = 4093624447, ne;
    for (ne = 0; ne <= 31; ne++, se >>>= 1)
      if (se & 1 && L.dyn_ltree[ne * 2] !== 0)
        return p;
    if (L.dyn_ltree[18] !== 0 || L.dyn_ltree[20] !== 0 || L.dyn_ltree[26] !== 0)
      return c;
    for (ne = 32; ne < t; ne++)
      if (L.dyn_ltree[ne * 2] !== 0)
        return c;
    return p;
  }
  var ge = !1;
  function fe(L) {
    ge || (le(), ge = !0), L.l_desc = new ve(L.dyn_ltree, Q), L.d_desc = new ve(L.dyn_dtree, ce), L.bl_desc = new ve(L.bl_tree, ae), L.bi_buf = 0, L.bi_valid = 0, me(L);
  }
  function ye(L, se, ne, P) {
    be(L, (n << 1) + (P ? 1 : 0), 3), Te(L, se, ne);
  }
  function de(L) {
    be(L, l << 1, 3), S(L, R, j), W(L);
  }
  function Ee(L, se, ne, P) {
    var x, Y, T = 0;
    L.level > 0 ? (L.strm.data_type === h && (L.strm.data_type = oe(L)), He(L, L.l_desc), He(L, L.d_desc), T = _(L), x = L.opt_len + 3 + 7 >>> 3, Y = L.static_len + 3 + 7 >>> 3, Y <= x && (x = Y)) : x = Y = ne + 5, ne + 4 <= x && se !== -1 ? ye(L, se, ne, P) : L.strategy === d || Y === x ? (be(L, (l << 1) + (P ? 1 : 0), 3), ke(L, j, B)) : (be(L, (i << 1) + (P ? 1 : 0), 3), re(L, L.l_desc.max_code + 1, L.d_desc.max_code + 1, T + 1), ke(L, L.dyn_ltree, L.dyn_dtree)), me(L), P && Ne(L);
  }
  function Ce(L, se, ne) {
    return L.pending_buf[L.d_buf + L.last_lit * 2] = se >>> 8 & 255, L.pending_buf[L.d_buf + L.last_lit * 2 + 1] = se & 255, L.pending_buf[L.l_buf + L.last_lit] = ne & 255, L.last_lit++, se === 0 ? L.dyn_ltree[ne * 2]++ : (L.matches++, se--, L.dyn_ltree[(te[ne] + t + 1) * 2]++, L.dyn_dtree[we(se) * 2]++), L.last_lit === L.lit_bufsize - 1;
  }
  return rr._tr_init = fe, rr._tr_stored_block = ye, rr._tr_flush_block = Ee, rr._tr_tally = Ce, rr._tr_align = de, rr;
}
var os, Tf;
function Vm() {
  if (Tf) return os;
  Tf = 1;
  function o(d, p, c, h) {
    for (var u = d & 65535 | 0, n = d >>> 16 & 65535 | 0, l = 0; c !== 0; ) {
      l = c > 2e3 ? 2e3 : c, c -= l;
      do
        u = u + p[h++] | 0, n = n + u | 0;
      while (--l);
      u %= 65521, n %= 65521;
    }
    return u | n << 16 | 0;
  }
  return os = o, os;
}
var ls, Of;
function Jm() {
  if (Of) return ls;
  Of = 1;
  function o() {
    for (var c, h = [], u = 0; u < 256; u++) {
      c = u;
      for (var n = 0; n < 8; n++)
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      h[u] = c;
    }
    return h;
  }
  var d = o();
  function p(c, h, u, n) {
    var l = d, i = n + u;
    c ^= -1;
    for (var a = n; a < i; a++)
      c = c >>> 8 ^ l[(c ^ h[a]) & 255];
    return c ^ -1;
  }
  return ls = p, ls;
}
var us, kf;
function Wl() {
  return kf || (kf = 1, us = {
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
  }), us;
}
var Nf;
function pv() {
  if (Nf) return Dt;
  Nf = 1;
  var o = Zt(), d = hv(), p = Vm(), c = Jm(), h = Wl(), u = 0, n = 1, l = 3, i = 4, a = 5, r = 0, e = 1, t = -2, s = -3, f = -5, g = -1, m = 1, v = 2, y = 3, E = 4, R = 0, C = 2, I = 8, k = 9, O = 15, A = 8, M = 29, z = 256, U = z + 1 + M, j = 30, B = 19, H = 2 * U + 1, te = 15, N = 3, F = 258, G = F + N + 1, Q = 32, ce = 42, ae = 69, ve = 73, we = 91, ie = 103, be = 113, S = 666, b = 1, W = 2, $ = 3, he = 4, le = 3;
  function me(w, V) {
    return w.msg = h[V], V;
  }
  function Ne(w) {
    return (w << 1) - (w > 4 ? 9 : 0);
  }
  function Te(w) {
    for (var V = w.length; --V >= 0; )
      w[V] = 0;
  }
  function $e(w) {
    var V = w.state, Z = V.pending;
    Z > w.avail_out && (Z = w.avail_out), Z !== 0 && (o.arraySet(w.output, V.pending_buf, V.pending_out, Z, w.next_out), w.next_out += Z, V.pending_out += Z, w.total_out += Z, w.avail_out -= Z, V.pending -= Z, V.pending === 0 && (V.pending_out = 0));
  }
  function Oe(w, V) {
    d._tr_flush_block(w, w.block_start >= 0 ? w.block_start : -1, w.strstart - w.block_start, V), w.block_start = w.strstart, $e(w.strm);
  }
  function ke(w, V) {
    w.pending_buf[w.pending++] = V;
  }
  function He(w, V) {
    w.pending_buf[w.pending++] = V >>> 8 & 255, w.pending_buf[w.pending++] = V & 255;
  }
  function Qe(w, V, Z, D) {
    var K = w.avail_in;
    return K > D && (K = D), K === 0 ? 0 : (w.avail_in -= K, o.arraySet(V, w.input, w.next_in, K, Z), w.state.wrap === 1 ? w.adler = p(w.adler, V, K, Z) : w.state.wrap === 2 && (w.adler = c(w.adler, V, K, Z)), w.next_in += K, w.total_in += K, K);
  }
  function Ge(w, V) {
    var Z = w.max_chain_length, D = w.strstart, K, ee, _e = w.prev_length, Ae = w.nice_match, Se = w.strstart > w.w_size - G ? w.strstart - (w.w_size - G) : 0, De = w.window, kt = w.w_mask, ze = w.prev, Le = w.strstart + F, Ze = De[D + _e - 1], tt = De[D + _e];
    w.prev_length >= w.good_match && (Z >>= 2), Ae > w.lookahead && (Ae = w.lookahead);
    do
      if (K = V, !(De[K + _e] !== tt || De[K + _e - 1] !== Ze || De[K] !== De[D] || De[++K] !== De[D + 1])) {
        D += 2, K++;
        do
          ;
        while (De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && De[++D] === De[++K] && D < Le);
        if (ee = F - (Le - D), D = Le - F, ee > _e) {
          if (w.match_start = V, _e = ee, ee >= Ae)
            break;
          Ze = De[D + _e - 1], tt = De[D + _e];
        }
      }
    while ((V = ze[V & kt]) > Se && --Z !== 0);
    return _e <= w.lookahead ? _e : w.lookahead;
  }
  function _(w) {
    var V = w.w_size, Z, D, K, ee, _e;
    do {
      if (ee = w.window_size - w.lookahead - w.strstart, w.strstart >= V + (V - G)) {
        o.arraySet(w.window, w.window, V, V, 0), w.match_start -= V, w.strstart -= V, w.block_start -= V, D = w.hash_size, Z = D;
        do
          K = w.head[--Z], w.head[Z] = K >= V ? K - V : 0;
        while (--D);
        D = V, Z = D;
        do
          K = w.prev[--Z], w.prev[Z] = K >= V ? K - V : 0;
        while (--D);
        ee += V;
      }
      if (w.strm.avail_in === 0)
        break;
      if (D = Qe(w.strm, w.window, w.strstart + w.lookahead, ee), w.lookahead += D, w.lookahead + w.insert >= N)
        for (_e = w.strstart - w.insert, w.ins_h = w.window[_e], w.ins_h = (w.ins_h << w.hash_shift ^ w.window[_e + 1]) & w.hash_mask; w.insert && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[_e + N - 1]) & w.hash_mask, w.prev[_e & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = _e, _e++, w.insert--, !(w.lookahead + w.insert < N)); )
          ;
    } while (w.lookahead < G && w.strm.avail_in !== 0);
  }
  function re(w, V) {
    var Z = 65535;
    for (Z > w.pending_buf_size - 5 && (Z = w.pending_buf_size - 5); ; ) {
      if (w.lookahead <= 1) {
        if (_(w), w.lookahead === 0 && V === u)
          return b;
        if (w.lookahead === 0)
          break;
      }
      w.strstart += w.lookahead, w.lookahead = 0;
      var D = w.block_start + Z;
      if ((w.strstart === 0 || w.strstart >= D) && (w.lookahead = w.strstart - D, w.strstart = D, Oe(w, !1), w.strm.avail_out === 0) || w.strstart - w.block_start >= w.w_size - G && (Oe(w, !1), w.strm.avail_out === 0))
        return b;
    }
    return w.insert = 0, V === i ? (Oe(w, !0), w.strm.avail_out === 0 ? $ : he) : (w.strstart > w.block_start && (Oe(w, !1), w.strm.avail_out === 0), b);
  }
  function oe(w, V) {
    for (var Z, D; ; ) {
      if (w.lookahead < G) {
        if (_(w), w.lookahead < G && V === u)
          return b;
        if (w.lookahead === 0)
          break;
      }
      if (Z = 0, w.lookahead >= N && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + N - 1]) & w.hash_mask, Z = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart), Z !== 0 && w.strstart - Z <= w.w_size - G && (w.match_length = Ge(w, Z)), w.match_length >= N)
        if (D = d._tr_tally(w, w.strstart - w.match_start, w.match_length - N), w.lookahead -= w.match_length, w.match_length <= w.max_lazy_match && w.lookahead >= N) {
          w.match_length--;
          do
            w.strstart++, w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + N - 1]) & w.hash_mask, Z = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart;
          while (--w.match_length !== 0);
          w.strstart++;
        } else
          w.strstart += w.match_length, w.match_length = 0, w.ins_h = w.window[w.strstart], w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + 1]) & w.hash_mask;
      else
        D = d._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++;
      if (D && (Oe(w, !1), w.strm.avail_out === 0))
        return b;
    }
    return w.insert = w.strstart < N - 1 ? w.strstart : N - 1, V === i ? (Oe(w, !0), w.strm.avail_out === 0 ? $ : he) : w.last_lit && (Oe(w, !1), w.strm.avail_out === 0) ? b : W;
  }
  function ge(w, V) {
    for (var Z, D, K; ; ) {
      if (w.lookahead < G) {
        if (_(w), w.lookahead < G && V === u)
          return b;
        if (w.lookahead === 0)
          break;
      }
      if (Z = 0, w.lookahead >= N && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + N - 1]) & w.hash_mask, Z = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart), w.prev_length = w.match_length, w.prev_match = w.match_start, w.match_length = N - 1, Z !== 0 && w.prev_length < w.max_lazy_match && w.strstart - Z <= w.w_size - G && (w.match_length = Ge(w, Z), w.match_length <= 5 && (w.strategy === m || w.match_length === N && w.strstart - w.match_start > 4096) && (w.match_length = N - 1)), w.prev_length >= N && w.match_length <= w.prev_length) {
        K = w.strstart + w.lookahead - N, D = d._tr_tally(w, w.strstart - 1 - w.prev_match, w.prev_length - N), w.lookahead -= w.prev_length - 1, w.prev_length -= 2;
        do
          ++w.strstart <= K && (w.ins_h = (w.ins_h << w.hash_shift ^ w.window[w.strstart + N - 1]) & w.hash_mask, Z = w.prev[w.strstart & w.w_mask] = w.head[w.ins_h], w.head[w.ins_h] = w.strstart);
        while (--w.prev_length !== 0);
        if (w.match_available = 0, w.match_length = N - 1, w.strstart++, D && (Oe(w, !1), w.strm.avail_out === 0))
          return b;
      } else if (w.match_available) {
        if (D = d._tr_tally(w, 0, w.window[w.strstart - 1]), D && Oe(w, !1), w.strstart++, w.lookahead--, w.strm.avail_out === 0)
          return b;
      } else
        w.match_available = 1, w.strstart++, w.lookahead--;
    }
    return w.match_available && (D = d._tr_tally(w, 0, w.window[w.strstart - 1]), w.match_available = 0), w.insert = w.strstart < N - 1 ? w.strstart : N - 1, V === i ? (Oe(w, !0), w.strm.avail_out === 0 ? $ : he) : w.last_lit && (Oe(w, !1), w.strm.avail_out === 0) ? b : W;
  }
  function fe(w, V) {
    for (var Z, D, K, ee, _e = w.window; ; ) {
      if (w.lookahead <= F) {
        if (_(w), w.lookahead <= F && V === u)
          return b;
        if (w.lookahead === 0)
          break;
      }
      if (w.match_length = 0, w.lookahead >= N && w.strstart > 0 && (K = w.strstart - 1, D = _e[K], D === _e[++K] && D === _e[++K] && D === _e[++K])) {
        ee = w.strstart + F;
        do
          ;
        while (D === _e[++K] && D === _e[++K] && D === _e[++K] && D === _e[++K] && D === _e[++K] && D === _e[++K] && D === _e[++K] && D === _e[++K] && K < ee);
        w.match_length = F - (ee - K), w.match_length > w.lookahead && (w.match_length = w.lookahead);
      }
      if (w.match_length >= N ? (Z = d._tr_tally(w, 1, w.match_length - N), w.lookahead -= w.match_length, w.strstart += w.match_length, w.match_length = 0) : (Z = d._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++), Z && (Oe(w, !1), w.strm.avail_out === 0))
        return b;
    }
    return w.insert = 0, V === i ? (Oe(w, !0), w.strm.avail_out === 0 ? $ : he) : w.last_lit && (Oe(w, !1), w.strm.avail_out === 0) ? b : W;
  }
  function ye(w, V) {
    for (var Z; ; ) {
      if (w.lookahead === 0 && (_(w), w.lookahead === 0)) {
        if (V === u)
          return b;
        break;
      }
      if (w.match_length = 0, Z = d._tr_tally(w, 0, w.window[w.strstart]), w.lookahead--, w.strstart++, Z && (Oe(w, !1), w.strm.avail_out === 0))
        return b;
    }
    return w.insert = 0, V === i ? (Oe(w, !0), w.strm.avail_out === 0 ? $ : he) : w.last_lit && (Oe(w, !1), w.strm.avail_out === 0) ? b : W;
  }
  function de(w, V, Z, D, K) {
    this.good_length = w, this.max_lazy = V, this.nice_length = Z, this.max_chain = D, this.func = K;
  }
  var Ee;
  Ee = [
    /*      good lazy nice chain */
    new de(0, 0, 0, 0, re),
    /* 0 store only */
    new de(4, 4, 8, 4, oe),
    /* 1 max speed, no lazy matches */
    new de(4, 5, 16, 8, oe),
    /* 2 */
    new de(4, 6, 32, 32, oe),
    /* 3 */
    new de(4, 4, 16, 16, ge),
    /* 4 lazy matches */
    new de(8, 16, 32, 32, ge),
    /* 5 */
    new de(8, 16, 128, 128, ge),
    /* 6 */
    new de(8, 32, 128, 256, ge),
    /* 7 */
    new de(32, 128, 258, 1024, ge),
    /* 8 */
    new de(32, 258, 258, 4096, ge)
    /* 9 max compression */
  ];
  function Ce(w) {
    w.window_size = 2 * w.w_size, Te(w.head), w.max_lazy_match = Ee[w.level].max_lazy, w.good_match = Ee[w.level].good_length, w.nice_match = Ee[w.level].nice_length, w.max_chain_length = Ee[w.level].max_chain, w.strstart = 0, w.block_start = 0, w.lookahead = 0, w.insert = 0, w.match_length = w.prev_length = N - 1, w.match_available = 0, w.ins_h = 0;
  }
  function L() {
    this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = I, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new o.Buf16(H * 2), this.dyn_dtree = new o.Buf16((2 * j + 1) * 2), this.bl_tree = new o.Buf16((2 * B + 1) * 2), Te(this.dyn_ltree), Te(this.dyn_dtree), Te(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new o.Buf16(te + 1), this.heap = new o.Buf16(2 * U + 1), Te(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new o.Buf16(2 * U + 1), Te(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
  }
  function se(w) {
    var V;
    return !w || !w.state ? me(w, t) : (w.total_in = w.total_out = 0, w.data_type = C, V = w.state, V.pending = 0, V.pending_out = 0, V.wrap < 0 && (V.wrap = -V.wrap), V.status = V.wrap ? ce : be, w.adler = V.wrap === 2 ? 0 : 1, V.last_flush = u, d._tr_init(V), r);
  }
  function ne(w) {
    var V = se(w);
    return V === r && Ce(w.state), V;
  }
  function P(w, V) {
    return !w || !w.state || w.state.wrap !== 2 ? t : (w.state.gzhead = V, r);
  }
  function x(w, V, Z, D, K, ee) {
    if (!w)
      return t;
    var _e = 1;
    if (V === g && (V = 6), D < 0 ? (_e = 0, D = -D) : D > 15 && (_e = 2, D -= 16), K < 1 || K > k || Z !== I || D < 8 || D > 15 || V < 0 || V > 9 || ee < 0 || ee > E)
      return me(w, t);
    D === 8 && (D = 9);
    var Ae = new L();
    return w.state = Ae, Ae.strm = w, Ae.wrap = _e, Ae.gzhead = null, Ae.w_bits = D, Ae.w_size = 1 << Ae.w_bits, Ae.w_mask = Ae.w_size - 1, Ae.hash_bits = K + 7, Ae.hash_size = 1 << Ae.hash_bits, Ae.hash_mask = Ae.hash_size - 1, Ae.hash_shift = ~~((Ae.hash_bits + N - 1) / N), Ae.window = new o.Buf8(Ae.w_size * 2), Ae.head = new o.Buf16(Ae.hash_size), Ae.prev = new o.Buf16(Ae.w_size), Ae.lit_bufsize = 1 << K + 6, Ae.pending_buf_size = Ae.lit_bufsize * 4, Ae.pending_buf = new o.Buf8(Ae.pending_buf_size), Ae.d_buf = 1 * Ae.lit_bufsize, Ae.l_buf = 3 * Ae.lit_bufsize, Ae.level = V, Ae.strategy = ee, Ae.method = Z, ne(w);
  }
  function Y(w, V) {
    return x(w, V, I, O, A, R);
  }
  function T(w, V) {
    var Z, D, K, ee;
    if (!w || !w.state || V > a || V < 0)
      return w ? me(w, t) : t;
    if (D = w.state, !w.output || !w.input && w.avail_in !== 0 || D.status === S && V !== i)
      return me(w, w.avail_out === 0 ? f : t);
    if (D.strm = w, Z = D.last_flush, D.last_flush = V, D.status === ce)
      if (D.wrap === 2)
        w.adler = 0, ke(D, 31), ke(D, 139), ke(D, 8), D.gzhead ? (ke(
          D,
          (D.gzhead.text ? 1 : 0) + (D.gzhead.hcrc ? 2 : 0) + (D.gzhead.extra ? 4 : 0) + (D.gzhead.name ? 8 : 0) + (D.gzhead.comment ? 16 : 0)
        ), ke(D, D.gzhead.time & 255), ke(D, D.gzhead.time >> 8 & 255), ke(D, D.gzhead.time >> 16 & 255), ke(D, D.gzhead.time >> 24 & 255), ke(D, D.level === 9 ? 2 : D.strategy >= v || D.level < 2 ? 4 : 0), ke(D, D.gzhead.os & 255), D.gzhead.extra && D.gzhead.extra.length && (ke(D, D.gzhead.extra.length & 255), ke(D, D.gzhead.extra.length >> 8 & 255)), D.gzhead.hcrc && (w.adler = c(w.adler, D.pending_buf, D.pending, 0)), D.gzindex = 0, D.status = ae) : (ke(D, 0), ke(D, 0), ke(D, 0), ke(D, 0), ke(D, 0), ke(D, D.level === 9 ? 2 : D.strategy >= v || D.level < 2 ? 4 : 0), ke(D, le), D.status = be);
      else {
        var _e = I + (D.w_bits - 8 << 4) << 8, Ae = -1;
        D.strategy >= v || D.level < 2 ? Ae = 0 : D.level < 6 ? Ae = 1 : D.level === 6 ? Ae = 2 : Ae = 3, _e |= Ae << 6, D.strstart !== 0 && (_e |= Q), _e += 31 - _e % 31, D.status = be, He(D, _e), D.strstart !== 0 && (He(D, w.adler >>> 16), He(D, w.adler & 65535)), w.adler = 1;
      }
    if (D.status === ae)
      if (D.gzhead.extra) {
        for (K = D.pending; D.gzindex < (D.gzhead.extra.length & 65535) && !(D.pending === D.pending_buf_size && (D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), $e(w), K = D.pending, D.pending === D.pending_buf_size)); )
          ke(D, D.gzhead.extra[D.gzindex] & 255), D.gzindex++;
        D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), D.gzindex === D.gzhead.extra.length && (D.gzindex = 0, D.status = ve);
      } else
        D.status = ve;
    if (D.status === ve)
      if (D.gzhead.name) {
        K = D.pending;
        do {
          if (D.pending === D.pending_buf_size && (D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), $e(w), K = D.pending, D.pending === D.pending_buf_size)) {
            ee = 1;
            break;
          }
          D.gzindex < D.gzhead.name.length ? ee = D.gzhead.name.charCodeAt(D.gzindex++) & 255 : ee = 0, ke(D, ee);
        } while (ee !== 0);
        D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), ee === 0 && (D.gzindex = 0, D.status = we);
      } else
        D.status = we;
    if (D.status === we)
      if (D.gzhead.comment) {
        K = D.pending;
        do {
          if (D.pending === D.pending_buf_size && (D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), $e(w), K = D.pending, D.pending === D.pending_buf_size)) {
            ee = 1;
            break;
          }
          D.gzindex < D.gzhead.comment.length ? ee = D.gzhead.comment.charCodeAt(D.gzindex++) & 255 : ee = 0, ke(D, ee);
        } while (ee !== 0);
        D.gzhead.hcrc && D.pending > K && (w.adler = c(w.adler, D.pending_buf, D.pending - K, K)), ee === 0 && (D.status = ie);
      } else
        D.status = ie;
    if (D.status === ie && (D.gzhead.hcrc ? (D.pending + 2 > D.pending_buf_size && $e(w), D.pending + 2 <= D.pending_buf_size && (ke(D, w.adler & 255), ke(D, w.adler >> 8 & 255), w.adler = 0, D.status = be)) : D.status = be), D.pending !== 0) {
      if ($e(w), w.avail_out === 0)
        return D.last_flush = -1, r;
    } else if (w.avail_in === 0 && Ne(V) <= Ne(Z) && V !== i)
      return me(w, f);
    if (D.status === S && w.avail_in !== 0)
      return me(w, f);
    if (w.avail_in !== 0 || D.lookahead !== 0 || V !== u && D.status !== S) {
      var Se = D.strategy === v ? ye(D, V) : D.strategy === y ? fe(D, V) : Ee[D.level].func(D, V);
      if ((Se === $ || Se === he) && (D.status = S), Se === b || Se === $)
        return w.avail_out === 0 && (D.last_flush = -1), r;
      if (Se === W && (V === n ? d._tr_align(D) : V !== a && (d._tr_stored_block(D, 0, 0, !1), V === l && (Te(D.head), D.lookahead === 0 && (D.strstart = 0, D.block_start = 0, D.insert = 0))), $e(w), w.avail_out === 0))
        return D.last_flush = -1, r;
    }
    return V !== i ? r : D.wrap <= 0 ? e : (D.wrap === 2 ? (ke(D, w.adler & 255), ke(D, w.adler >> 8 & 255), ke(D, w.adler >> 16 & 255), ke(D, w.adler >> 24 & 255), ke(D, w.total_in & 255), ke(D, w.total_in >> 8 & 255), ke(D, w.total_in >> 16 & 255), ke(D, w.total_in >> 24 & 255)) : (He(D, w.adler >>> 16), He(D, w.adler & 65535)), $e(w), D.wrap > 0 && (D.wrap = -D.wrap), D.pending !== 0 ? r : e);
  }
  function J(w) {
    var V;
    return !w || !w.state ? t : (V = w.state.status, V !== ce && V !== ae && V !== ve && V !== we && V !== ie && V !== be && V !== S ? me(w, t) : (w.state = null, V === be ? me(w, s) : r));
  }
  function ue(w, V) {
    var Z = V.length, D, K, ee, _e, Ae, Se, De, kt;
    if (!w || !w.state || (D = w.state, _e = D.wrap, _e === 2 || _e === 1 && D.status !== ce || D.lookahead))
      return t;
    for (_e === 1 && (w.adler = p(w.adler, V, Z, 0)), D.wrap = 0, Z >= D.w_size && (_e === 0 && (Te(D.head), D.strstart = 0, D.block_start = 0, D.insert = 0), kt = new o.Buf8(D.w_size), o.arraySet(kt, V, Z - D.w_size, D.w_size, 0), V = kt, Z = D.w_size), Ae = w.avail_in, Se = w.next_in, De = w.input, w.avail_in = Z, w.next_in = 0, w.input = V, _(D); D.lookahead >= N; ) {
      K = D.strstart, ee = D.lookahead - (N - 1);
      do
        D.ins_h = (D.ins_h << D.hash_shift ^ D.window[K + N - 1]) & D.hash_mask, D.prev[K & D.w_mask] = D.head[D.ins_h], D.head[D.ins_h] = K, K++;
      while (--ee);
      D.strstart = K, D.lookahead = N - 1, _(D);
    }
    return D.strstart += D.lookahead, D.block_start = D.strstart, D.insert = D.lookahead, D.lookahead = 0, D.match_length = D.prev_length = N - 1, D.match_available = 0, w.next_in = Se, w.input = De, w.avail_in = Ae, D.wrap = _e, r;
  }
  return Dt.deflateInit = Y, Dt.deflateInit2 = x, Dt.deflateReset = ne, Dt.deflateResetKeep = se, Dt.deflateSetHeader = P, Dt.deflate = T, Dt.deflateEnd = J, Dt.deflateSetDictionary = ue, Dt.deflateInfo = "pako deflate (from Nodeca project)", Dt;
}
var nr = {}, If;
function Zm() {
  if (If) return nr;
  If = 1;
  var o = Zt(), d = !0, p = !0;
  try {
    String.fromCharCode.apply(null, [0]);
  } catch {
    d = !1;
  }
  try {
    String.fromCharCode.apply(null, new Uint8Array(1));
  } catch {
    p = !1;
  }
  for (var c = new o.Buf8(256), h = 0; h < 256; h++)
    c[h] = h >= 252 ? 6 : h >= 248 ? 5 : h >= 240 ? 4 : h >= 224 ? 3 : h >= 192 ? 2 : 1;
  c[254] = c[254] = 1, nr.string2buf = function(n) {
    var l, i, a, r, e, t = n.length, s = 0;
    for (r = 0; r < t; r++)
      i = n.charCodeAt(r), (i & 64512) === 55296 && r + 1 < t && (a = n.charCodeAt(r + 1), (a & 64512) === 56320 && (i = 65536 + (i - 55296 << 10) + (a - 56320), r++)), s += i < 128 ? 1 : i < 2048 ? 2 : i < 65536 ? 3 : 4;
    for (l = new o.Buf8(s), e = 0, r = 0; e < s; r++)
      i = n.charCodeAt(r), (i & 64512) === 55296 && r + 1 < t && (a = n.charCodeAt(r + 1), (a & 64512) === 56320 && (i = 65536 + (i - 55296 << 10) + (a - 56320), r++)), i < 128 ? l[e++] = i : i < 2048 ? (l[e++] = 192 | i >>> 6, l[e++] = 128 | i & 63) : i < 65536 ? (l[e++] = 224 | i >>> 12, l[e++] = 128 | i >>> 6 & 63, l[e++] = 128 | i & 63) : (l[e++] = 240 | i >>> 18, l[e++] = 128 | i >>> 12 & 63, l[e++] = 128 | i >>> 6 & 63, l[e++] = 128 | i & 63);
    return l;
  };
  function u(n, l) {
    if (l < 65534 && (n.subarray && p || !n.subarray && d))
      return String.fromCharCode.apply(null, o.shrinkBuf(n, l));
    for (var i = "", a = 0; a < l; a++)
      i += String.fromCharCode(n[a]);
    return i;
  }
  return nr.buf2binstring = function(n) {
    return u(n, n.length);
  }, nr.binstring2buf = function(n) {
    for (var l = new o.Buf8(n.length), i = 0, a = l.length; i < a; i++)
      l[i] = n.charCodeAt(i);
    return l;
  }, nr.buf2string = function(n, l) {
    var i, a, r, e, t = l || n.length, s = new Array(t * 2);
    for (a = 0, i = 0; i < t; ) {
      if (r = n[i++], r < 128) {
        s[a++] = r;
        continue;
      }
      if (e = c[r], e > 4) {
        s[a++] = 65533, i += e - 1;
        continue;
      }
      for (r &= e === 2 ? 31 : e === 3 ? 15 : 7; e > 1 && i < t; )
        r = r << 6 | n[i++] & 63, e--;
      if (e > 1) {
        s[a++] = 65533;
        continue;
      }
      r < 65536 ? s[a++] = r : (r -= 65536, s[a++] = 55296 | r >> 10 & 1023, s[a++] = 56320 | r & 1023);
    }
    return u(s, a);
  }, nr.utf8border = function(n, l) {
    var i;
    for (l = l || n.length, l > n.length && (l = n.length), i = l - 1; i >= 0 && (n[i] & 192) === 128; )
      i--;
    return i < 0 || i === 0 ? l : i + c[n[i]] > l ? i : l;
  }, nr;
}
var cs, Df;
function Xm() {
  if (Df) return cs;
  Df = 1;
  function o() {
    this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
  }
  return cs = o, cs;
}
var Pf;
function mv() {
  if (Pf) return Ar;
  Pf = 1;
  var o = pv(), d = Zt(), p = Zm(), c = Wl(), h = Xm(), u = Object.prototype.toString, n = 0, l = 4, i = 0, a = 1, r = 2, e = -1, t = 0, s = 8;
  function f(y) {
    if (!(this instanceof f)) return new f(y);
    this.options = d.assign({
      level: e,
      method: s,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: t,
      to: ""
    }, y || {});
    var E = this.options;
    E.raw && E.windowBits > 0 ? E.windowBits = -E.windowBits : E.gzip && E.windowBits > 0 && E.windowBits < 16 && (E.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new h(), this.strm.avail_out = 0;
    var R = o.deflateInit2(
      this.strm,
      E.level,
      E.method,
      E.windowBits,
      E.memLevel,
      E.strategy
    );
    if (R !== i)
      throw new Error(c[R]);
    if (E.header && o.deflateSetHeader(this.strm, E.header), E.dictionary) {
      var C;
      if (typeof E.dictionary == "string" ? C = p.string2buf(E.dictionary) : u.call(E.dictionary) === "[object ArrayBuffer]" ? C = new Uint8Array(E.dictionary) : C = E.dictionary, R = o.deflateSetDictionary(this.strm, C), R !== i)
        throw new Error(c[R]);
      this._dict_set = !0;
    }
  }
  f.prototype.push = function(y, E) {
    var R = this.strm, C = this.options.chunkSize, I, k;
    if (this.ended)
      return !1;
    k = E === ~~E ? E : E === !0 ? l : n, typeof y == "string" ? R.input = p.string2buf(y) : u.call(y) === "[object ArrayBuffer]" ? R.input = new Uint8Array(y) : R.input = y, R.next_in = 0, R.avail_in = R.input.length;
    do {
      if (R.avail_out === 0 && (R.output = new d.Buf8(C), R.next_out = 0, R.avail_out = C), I = o.deflate(R, k), I !== a && I !== i)
        return this.onEnd(I), this.ended = !0, !1;
      (R.avail_out === 0 || R.avail_in === 0 && (k === l || k === r)) && (this.options.to === "string" ? this.onData(p.buf2binstring(d.shrinkBuf(R.output, R.next_out))) : this.onData(d.shrinkBuf(R.output, R.next_out)));
    } while ((R.avail_in > 0 || R.avail_out === 0) && I !== a);
    return k === l ? (I = o.deflateEnd(this.strm), this.onEnd(I), this.ended = !0, I === i) : (k === r && (this.onEnd(i), R.avail_out = 0), !0);
  }, f.prototype.onData = function(y) {
    this.chunks.push(y);
  }, f.prototype.onEnd = function(y) {
    y === i && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = y, this.msg = this.strm.msg;
  };
  function g(y, E) {
    var R = new f(E);
    if (R.push(y, !0), R.err)
      throw R.msg || c[R.err];
    return R.result;
  }
  function m(y, E) {
    return E = E || {}, E.raw = !0, g(y, E);
  }
  function v(y, E) {
    return E = E || {}, E.gzip = !0, g(y, E);
  }
  return Ar.Deflate = f, Ar.deflate = g, Ar.deflateRaw = m, Ar.gzip = v, Ar;
}
var Cr = {}, Rt = {}, fs, xf;
function gv() {
  if (xf) return fs;
  xf = 1;
  var o = 30, d = 12;
  return fs = function(c, h) {
    var u, n, l, i, a, r, e, t, s, f, g, m, v, y, E, R, C, I, k, O, A, M, z, U, j;
    u = c.state, n = c.next_in, U = c.input, l = n + (c.avail_in - 5), i = c.next_out, j = c.output, a = i - (h - c.avail_out), r = i + (c.avail_out - 257), e = u.dmax, t = u.wsize, s = u.whave, f = u.wnext, g = u.window, m = u.hold, v = u.bits, y = u.lencode, E = u.distcode, R = (1 << u.lenbits) - 1, C = (1 << u.distbits) - 1;
    e:
      do {
        v < 15 && (m += U[n++] << v, v += 8, m += U[n++] << v, v += 8), I = y[m & R];
        t:
          for (; ; ) {
            if (k = I >>> 24, m >>>= k, v -= k, k = I >>> 16 & 255, k === 0)
              j[i++] = I & 65535;
            else if (k & 16) {
              O = I & 65535, k &= 15, k && (v < k && (m += U[n++] << v, v += 8), O += m & (1 << k) - 1, m >>>= k, v -= k), v < 15 && (m += U[n++] << v, v += 8, m += U[n++] << v, v += 8), I = E[m & C];
              r:
                for (; ; ) {
                  if (k = I >>> 24, m >>>= k, v -= k, k = I >>> 16 & 255, k & 16) {
                    if (A = I & 65535, k &= 15, v < k && (m += U[n++] << v, v += 8, v < k && (m += U[n++] << v, v += 8)), A += m & (1 << k) - 1, A > e) {
                      c.msg = "invalid distance too far back", u.mode = o;
                      break e;
                    }
                    if (m >>>= k, v -= k, k = i - a, A > k) {
                      if (k = A - k, k > s && u.sane) {
                        c.msg = "invalid distance too far back", u.mode = o;
                        break e;
                      }
                      if (M = 0, z = g, f === 0) {
                        if (M += t - k, k < O) {
                          O -= k;
                          do
                            j[i++] = g[M++];
                          while (--k);
                          M = i - A, z = j;
                        }
                      } else if (f < k) {
                        if (M += t + f - k, k -= f, k < O) {
                          O -= k;
                          do
                            j[i++] = g[M++];
                          while (--k);
                          if (M = 0, f < O) {
                            k = f, O -= k;
                            do
                              j[i++] = g[M++];
                            while (--k);
                            M = i - A, z = j;
                          }
                        }
                      } else if (M += f - k, k < O) {
                        O -= k;
                        do
                          j[i++] = g[M++];
                        while (--k);
                        M = i - A, z = j;
                      }
                      for (; O > 2; )
                        j[i++] = z[M++], j[i++] = z[M++], j[i++] = z[M++], O -= 3;
                      O && (j[i++] = z[M++], O > 1 && (j[i++] = z[M++]));
                    } else {
                      M = i - A;
                      do
                        j[i++] = j[M++], j[i++] = j[M++], j[i++] = j[M++], O -= 3;
                      while (O > 2);
                      O && (j[i++] = j[M++], O > 1 && (j[i++] = j[M++]));
                    }
                  } else if ((k & 64) === 0) {
                    I = E[(I & 65535) + (m & (1 << k) - 1)];
                    continue r;
                  } else {
                    c.msg = "invalid distance code", u.mode = o;
                    break e;
                  }
                  break;
                }
            } else if ((k & 64) === 0) {
              I = y[(I & 65535) + (m & (1 << k) - 1)];
              continue t;
            } else if (k & 32) {
              u.mode = d;
              break e;
            } else {
              c.msg = "invalid literal/length code", u.mode = o;
              break e;
            }
            break;
          }
      } while (n < l && i < r);
    O = v >> 3, n -= O, v -= O << 3, m &= (1 << v) - 1, c.next_in = n, c.next_out = i, c.avail_in = n < l ? 5 + (l - n) : 5 - (n - l), c.avail_out = i < r ? 257 + (r - i) : 257 - (i - r), u.hold = m, u.bits = v;
  }, fs;
}
var ds, Lf;
function vv() {
  if (Lf) return ds;
  Lf = 1;
  var o = Zt(), d = 15, p = 852, c = 592, h = 0, u = 1, n = 2, l = [
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
  ], i = [
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
  ], a = [
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
  return ds = function(t, s, f, g, m, v, y, E) {
    var R = E.bits, C = 0, I = 0, k = 0, O = 0, A = 0, M = 0, z = 0, U = 0, j = 0, B = 0, H, te, N, F, G, Q = null, ce = 0, ae, ve = new o.Buf16(d + 1), we = new o.Buf16(d + 1), ie = null, be = 0, S, b, W;
    for (C = 0; C <= d; C++)
      ve[C] = 0;
    for (I = 0; I < g; I++)
      ve[s[f + I]]++;
    for (A = R, O = d; O >= 1 && ve[O] === 0; O--)
      ;
    if (A > O && (A = O), O === 0)
      return m[v++] = 1 << 24 | 64 << 16 | 0, m[v++] = 1 << 24 | 64 << 16 | 0, E.bits = 1, 0;
    for (k = 1; k < O && ve[k] === 0; k++)
      ;
    for (A < k && (A = k), U = 1, C = 1; C <= d; C++)
      if (U <<= 1, U -= ve[C], U < 0)
        return -1;
    if (U > 0 && (t === h || O !== 1))
      return -1;
    for (we[1] = 0, C = 1; C < d; C++)
      we[C + 1] = we[C] + ve[C];
    for (I = 0; I < g; I++)
      s[f + I] !== 0 && (y[we[s[f + I]]++] = I);
    if (t === h ? (Q = ie = y, ae = 19) : t === u ? (Q = l, ce -= 257, ie = i, be -= 257, ae = 256) : (Q = a, ie = r, ae = -1), B = 0, I = 0, C = k, G = v, M = A, z = 0, N = -1, j = 1 << A, F = j - 1, t === u && j > p || t === n && j > c)
      return 1;
    for (; ; ) {
      S = C - z, y[I] < ae ? (b = 0, W = y[I]) : y[I] > ae ? (b = ie[be + y[I]], W = Q[ce + y[I]]) : (b = 96, W = 0), H = 1 << C - z, te = 1 << M, k = te;
      do
        te -= H, m[G + (B >> z) + te] = S << 24 | b << 16 | W | 0;
      while (te !== 0);
      for (H = 1 << C - 1; B & H; )
        H >>= 1;
      if (H !== 0 ? (B &= H - 1, B += H) : B = 0, I++, --ve[C] === 0) {
        if (C === O)
          break;
        C = s[f + y[I]];
      }
      if (C > A && (B & F) !== N) {
        for (z === 0 && (z = A), G += k, M = C - z, U = 1 << M; M + z < O && (U -= ve[M + z], !(U <= 0)); )
          M++, U <<= 1;
        if (j += 1 << M, t === u && j > p || t === n && j > c)
          return 1;
        N = B & F, m[N] = A << 24 | M << 16 | G - v | 0;
      }
    }
    return B !== 0 && (m[G + B] = C - z << 24 | 64 << 16 | 0), E.bits = A, 0;
  }, ds;
}
var Ff;
function yv() {
  if (Ff) return Rt;
  Ff = 1;
  var o = Zt(), d = Vm(), p = Jm(), c = gv(), h = vv(), u = 0, n = 1, l = 2, i = 4, a = 5, r = 6, e = 0, t = 1, s = 2, f = -2, g = -3, m = -4, v = -5, y = 8, E = 1, R = 2, C = 3, I = 4, k = 5, O = 6, A = 7, M = 8, z = 9, U = 10, j = 11, B = 12, H = 13, te = 14, N = 15, F = 16, G = 17, Q = 18, ce = 19, ae = 20, ve = 21, we = 22, ie = 23, be = 24, S = 25, b = 26, W = 27, $ = 28, he = 29, le = 30, me = 31, Ne = 32, Te = 852, $e = 592, Oe = 15, ke = Oe;
  function He(x) {
    return (x >>> 24 & 255) + (x >>> 8 & 65280) + ((x & 65280) << 8) + ((x & 255) << 24);
  }
  function Qe() {
    this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new o.Buf16(320), this.work = new o.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
  }
  function Ge(x) {
    var Y;
    return !x || !x.state ? f : (Y = x.state, x.total_in = x.total_out = Y.total = 0, x.msg = "", Y.wrap && (x.adler = Y.wrap & 1), Y.mode = E, Y.last = 0, Y.havedict = 0, Y.dmax = 32768, Y.head = null, Y.hold = 0, Y.bits = 0, Y.lencode = Y.lendyn = new o.Buf32(Te), Y.distcode = Y.distdyn = new o.Buf32($e), Y.sane = 1, Y.back = -1, e);
  }
  function _(x) {
    var Y;
    return !x || !x.state ? f : (Y = x.state, Y.wsize = 0, Y.whave = 0, Y.wnext = 0, Ge(x));
  }
  function re(x, Y) {
    var T, J;
    return !x || !x.state || (J = x.state, Y < 0 ? (T = 0, Y = -Y) : (T = (Y >> 4) + 1, Y < 48 && (Y &= 15)), Y && (Y < 8 || Y > 15)) ? f : (J.window !== null && J.wbits !== Y && (J.window = null), J.wrap = T, J.wbits = Y, _(x));
  }
  function oe(x, Y) {
    var T, J;
    return x ? (J = new Qe(), x.state = J, J.window = null, T = re(x, Y), T !== e && (x.state = null), T) : f;
  }
  function ge(x) {
    return oe(x, ke);
  }
  var fe = !0, ye, de;
  function Ee(x) {
    if (fe) {
      var Y;
      for (ye = new o.Buf32(512), de = new o.Buf32(32), Y = 0; Y < 144; )
        x.lens[Y++] = 8;
      for (; Y < 256; )
        x.lens[Y++] = 9;
      for (; Y < 280; )
        x.lens[Y++] = 7;
      for (; Y < 288; )
        x.lens[Y++] = 8;
      for (h(n, x.lens, 0, 288, ye, 0, x.work, { bits: 9 }), Y = 0; Y < 32; )
        x.lens[Y++] = 5;
      h(l, x.lens, 0, 32, de, 0, x.work, { bits: 5 }), fe = !1;
    }
    x.lencode = ye, x.lenbits = 9, x.distcode = de, x.distbits = 5;
  }
  function Ce(x, Y, T, J) {
    var ue, w = x.state;
    return w.window === null && (w.wsize = 1 << w.wbits, w.wnext = 0, w.whave = 0, w.window = new o.Buf8(w.wsize)), J >= w.wsize ? (o.arraySet(w.window, Y, T - w.wsize, w.wsize, 0), w.wnext = 0, w.whave = w.wsize) : (ue = w.wsize - w.wnext, ue > J && (ue = J), o.arraySet(w.window, Y, T - J, ue, w.wnext), J -= ue, J ? (o.arraySet(w.window, Y, T - J, J, 0), w.wnext = J, w.whave = w.wsize) : (w.wnext += ue, w.wnext === w.wsize && (w.wnext = 0), w.whave < w.wsize && (w.whave += ue))), 0;
  }
  function L(x, Y) {
    var T, J, ue, w, V, Z, D, K, ee, _e, Ae, Se, De, kt, ze = 0, Le, Ze, tt, it, Et, vr, Ke, gt, rt = new o.Buf8(4), Nt, et, Dn = (
      /* permutation of code lengths */
      [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
    );
    if (!x || !x.state || !x.output || !x.input && x.avail_in !== 0)
      return f;
    T = x.state, T.mode === B && (T.mode = H), V = x.next_out, ue = x.output, D = x.avail_out, w = x.next_in, J = x.input, Z = x.avail_in, K = T.hold, ee = T.bits, _e = Z, Ae = D, gt = e;
    e:
      for (; ; )
        switch (T.mode) {
          case E:
            if (T.wrap === 0) {
              T.mode = H;
              break;
            }
            for (; ee < 16; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if (T.wrap & 2 && K === 35615) {
              T.check = 0, rt[0] = K & 255, rt[1] = K >>> 8 & 255, T.check = p(T.check, rt, 2, 0), K = 0, ee = 0, T.mode = R;
              break;
            }
            if (T.flags = 0, T.head && (T.head.done = !1), !(T.wrap & 1) || /* check if zlib header allowed */
            (((K & 255) << 8) + (K >> 8)) % 31) {
              x.msg = "incorrect header check", T.mode = le;
              break;
            }
            if ((K & 15) !== y) {
              x.msg = "unknown compression method", T.mode = le;
              break;
            }
            if (K >>>= 4, ee -= 4, Ke = (K & 15) + 8, T.wbits === 0)
              T.wbits = Ke;
            else if (Ke > T.wbits) {
              x.msg = "invalid window size", T.mode = le;
              break;
            }
            T.dmax = 1 << Ke, x.adler = T.check = 1, T.mode = K & 512 ? U : B, K = 0, ee = 0;
            break;
          case R:
            for (; ee < 16; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if (T.flags = K, (T.flags & 255) !== y) {
              x.msg = "unknown compression method", T.mode = le;
              break;
            }
            if (T.flags & 57344) {
              x.msg = "unknown header flags set", T.mode = le;
              break;
            }
            T.head && (T.head.text = K >> 8 & 1), T.flags & 512 && (rt[0] = K & 255, rt[1] = K >>> 8 & 255, T.check = p(T.check, rt, 2, 0)), K = 0, ee = 0, T.mode = C;
          /* falls through */
          case C:
            for (; ee < 32; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            T.head && (T.head.time = K), T.flags & 512 && (rt[0] = K & 255, rt[1] = K >>> 8 & 255, rt[2] = K >>> 16 & 255, rt[3] = K >>> 24 & 255, T.check = p(T.check, rt, 4, 0)), K = 0, ee = 0, T.mode = I;
          /* falls through */
          case I:
            for (; ee < 16; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            T.head && (T.head.xflags = K & 255, T.head.os = K >> 8), T.flags & 512 && (rt[0] = K & 255, rt[1] = K >>> 8 & 255, T.check = p(T.check, rt, 2, 0)), K = 0, ee = 0, T.mode = k;
          /* falls through */
          case k:
            if (T.flags & 1024) {
              for (; ee < 16; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              T.length = K, T.head && (T.head.extra_len = K), T.flags & 512 && (rt[0] = K & 255, rt[1] = K >>> 8 & 255, T.check = p(T.check, rt, 2, 0)), K = 0, ee = 0;
            } else T.head && (T.head.extra = null);
            T.mode = O;
          /* falls through */
          case O:
            if (T.flags & 1024 && (Se = T.length, Se > Z && (Se = Z), Se && (T.head && (Ke = T.head.extra_len - T.length, T.head.extra || (T.head.extra = new Array(T.head.extra_len)), o.arraySet(
              T.head.extra,
              J,
              w,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              Se,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              Ke
            )), T.flags & 512 && (T.check = p(T.check, J, Se, w)), Z -= Se, w += Se, T.length -= Se), T.length))
              break e;
            T.length = 0, T.mode = A;
          /* falls through */
          case A:
            if (T.flags & 2048) {
              if (Z === 0)
                break e;
              Se = 0;
              do
                Ke = J[w + Se++], T.head && Ke && T.length < 65536 && (T.head.name += String.fromCharCode(Ke));
              while (Ke && Se < Z);
              if (T.flags & 512 && (T.check = p(T.check, J, Se, w)), Z -= Se, w += Se, Ke)
                break e;
            } else T.head && (T.head.name = null);
            T.length = 0, T.mode = M;
          /* falls through */
          case M:
            if (T.flags & 4096) {
              if (Z === 0)
                break e;
              Se = 0;
              do
                Ke = J[w + Se++], T.head && Ke && T.length < 65536 && (T.head.comment += String.fromCharCode(Ke));
              while (Ke && Se < Z);
              if (T.flags & 512 && (T.check = p(T.check, J, Se, w)), Z -= Se, w += Se, Ke)
                break e;
            } else T.head && (T.head.comment = null);
            T.mode = z;
          /* falls through */
          case z:
            if (T.flags & 512) {
              for (; ee < 16; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              if (K !== (T.check & 65535)) {
                x.msg = "header crc mismatch", T.mode = le;
                break;
              }
              K = 0, ee = 0;
            }
            T.head && (T.head.hcrc = T.flags >> 9 & 1, T.head.done = !0), x.adler = T.check = 0, T.mode = B;
            break;
          case U:
            for (; ee < 32; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            x.adler = T.check = He(K), K = 0, ee = 0, T.mode = j;
          /* falls through */
          case j:
            if (T.havedict === 0)
              return x.next_out = V, x.avail_out = D, x.next_in = w, x.avail_in = Z, T.hold = K, T.bits = ee, s;
            x.adler = T.check = 1, T.mode = B;
          /* falls through */
          case B:
            if (Y === a || Y === r)
              break e;
          /* falls through */
          case H:
            if (T.last) {
              K >>>= ee & 7, ee -= ee & 7, T.mode = W;
              break;
            }
            for (; ee < 3; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            switch (T.last = K & 1, K >>>= 1, ee -= 1, K & 3) {
              case 0:
                T.mode = te;
                break;
              case 1:
                if (Ee(T), T.mode = ae, Y === r) {
                  K >>>= 2, ee -= 2;
                  break e;
                }
                break;
              case 2:
                T.mode = G;
                break;
              case 3:
                x.msg = "invalid block type", T.mode = le;
            }
            K >>>= 2, ee -= 2;
            break;
          case te:
            for (K >>>= ee & 7, ee -= ee & 7; ee < 32; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if ((K & 65535) !== (K >>> 16 ^ 65535)) {
              x.msg = "invalid stored block lengths", T.mode = le;
              break;
            }
            if (T.length = K & 65535, K = 0, ee = 0, T.mode = N, Y === r)
              break e;
          /* falls through */
          case N:
            T.mode = F;
          /* falls through */
          case F:
            if (Se = T.length, Se) {
              if (Se > Z && (Se = Z), Se > D && (Se = D), Se === 0)
                break e;
              o.arraySet(ue, J, w, Se, V), Z -= Se, w += Se, D -= Se, V += Se, T.length -= Se;
              break;
            }
            T.mode = B;
            break;
          case G:
            for (; ee < 14; ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if (T.nlen = (K & 31) + 257, K >>>= 5, ee -= 5, T.ndist = (K & 31) + 1, K >>>= 5, ee -= 5, T.ncode = (K & 15) + 4, K >>>= 4, ee -= 4, T.nlen > 286 || T.ndist > 30) {
              x.msg = "too many length or distance symbols", T.mode = le;
              break;
            }
            T.have = 0, T.mode = Q;
          /* falls through */
          case Q:
            for (; T.have < T.ncode; ) {
              for (; ee < 3; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              T.lens[Dn[T.have++]] = K & 7, K >>>= 3, ee -= 3;
            }
            for (; T.have < 19; )
              T.lens[Dn[T.have++]] = 0;
            if (T.lencode = T.lendyn, T.lenbits = 7, Nt = { bits: T.lenbits }, gt = h(u, T.lens, 0, 19, T.lencode, 0, T.work, Nt), T.lenbits = Nt.bits, gt) {
              x.msg = "invalid code lengths set", T.mode = le;
              break;
            }
            T.have = 0, T.mode = ce;
          /* falls through */
          case ce:
            for (; T.have < T.nlen + T.ndist; ) {
              for (; ze = T.lencode[K & (1 << T.lenbits) - 1], Le = ze >>> 24, Ze = ze >>> 16 & 255, tt = ze & 65535, !(Le <= ee); ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              if (tt < 16)
                K >>>= Le, ee -= Le, T.lens[T.have++] = tt;
              else {
                if (tt === 16) {
                  for (et = Le + 2; ee < et; ) {
                    if (Z === 0)
                      break e;
                    Z--, K += J[w++] << ee, ee += 8;
                  }
                  if (K >>>= Le, ee -= Le, T.have === 0) {
                    x.msg = "invalid bit length repeat", T.mode = le;
                    break;
                  }
                  Ke = T.lens[T.have - 1], Se = 3 + (K & 3), K >>>= 2, ee -= 2;
                } else if (tt === 17) {
                  for (et = Le + 3; ee < et; ) {
                    if (Z === 0)
                      break e;
                    Z--, K += J[w++] << ee, ee += 8;
                  }
                  K >>>= Le, ee -= Le, Ke = 0, Se = 3 + (K & 7), K >>>= 3, ee -= 3;
                } else {
                  for (et = Le + 7; ee < et; ) {
                    if (Z === 0)
                      break e;
                    Z--, K += J[w++] << ee, ee += 8;
                  }
                  K >>>= Le, ee -= Le, Ke = 0, Se = 11 + (K & 127), K >>>= 7, ee -= 7;
                }
                if (T.have + Se > T.nlen + T.ndist) {
                  x.msg = "invalid bit length repeat", T.mode = le;
                  break;
                }
                for (; Se--; )
                  T.lens[T.have++] = Ke;
              }
            }
            if (T.mode === le)
              break;
            if (T.lens[256] === 0) {
              x.msg = "invalid code -- missing end-of-block", T.mode = le;
              break;
            }
            if (T.lenbits = 9, Nt = { bits: T.lenbits }, gt = h(n, T.lens, 0, T.nlen, T.lencode, 0, T.work, Nt), T.lenbits = Nt.bits, gt) {
              x.msg = "invalid literal/lengths set", T.mode = le;
              break;
            }
            if (T.distbits = 6, T.distcode = T.distdyn, Nt = { bits: T.distbits }, gt = h(l, T.lens, T.nlen, T.ndist, T.distcode, 0, T.work, Nt), T.distbits = Nt.bits, gt) {
              x.msg = "invalid distances set", T.mode = le;
              break;
            }
            if (T.mode = ae, Y === r)
              break e;
          /* falls through */
          case ae:
            T.mode = ve;
          /* falls through */
          case ve:
            if (Z >= 6 && D >= 258) {
              x.next_out = V, x.avail_out = D, x.next_in = w, x.avail_in = Z, T.hold = K, T.bits = ee, c(x, Ae), V = x.next_out, ue = x.output, D = x.avail_out, w = x.next_in, J = x.input, Z = x.avail_in, K = T.hold, ee = T.bits, T.mode === B && (T.back = -1);
              break;
            }
            for (T.back = 0; ze = T.lencode[K & (1 << T.lenbits) - 1], Le = ze >>> 24, Ze = ze >>> 16 & 255, tt = ze & 65535, !(Le <= ee); ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if (Ze && (Ze & 240) === 0) {
              for (it = Le, Et = Ze, vr = tt; ze = T.lencode[vr + ((K & (1 << it + Et) - 1) >> it)], Le = ze >>> 24, Ze = ze >>> 16 & 255, tt = ze & 65535, !(it + Le <= ee); ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              K >>>= it, ee -= it, T.back += it;
            }
            if (K >>>= Le, ee -= Le, T.back += Le, T.length = tt, Ze === 0) {
              T.mode = b;
              break;
            }
            if (Ze & 32) {
              T.back = -1, T.mode = B;
              break;
            }
            if (Ze & 64) {
              x.msg = "invalid literal/length code", T.mode = le;
              break;
            }
            T.extra = Ze & 15, T.mode = we;
          /* falls through */
          case we:
            if (T.extra) {
              for (et = T.extra; ee < et; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              T.length += K & (1 << T.extra) - 1, K >>>= T.extra, ee -= T.extra, T.back += T.extra;
            }
            T.was = T.length, T.mode = ie;
          /* falls through */
          case ie:
            for (; ze = T.distcode[K & (1 << T.distbits) - 1], Le = ze >>> 24, Ze = ze >>> 16 & 255, tt = ze & 65535, !(Le <= ee); ) {
              if (Z === 0)
                break e;
              Z--, K += J[w++] << ee, ee += 8;
            }
            if ((Ze & 240) === 0) {
              for (it = Le, Et = Ze, vr = tt; ze = T.distcode[vr + ((K & (1 << it + Et) - 1) >> it)], Le = ze >>> 24, Ze = ze >>> 16 & 255, tt = ze & 65535, !(it + Le <= ee); ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              K >>>= it, ee -= it, T.back += it;
            }
            if (K >>>= Le, ee -= Le, T.back += Le, Ze & 64) {
              x.msg = "invalid distance code", T.mode = le;
              break;
            }
            T.offset = tt, T.extra = Ze & 15, T.mode = be;
          /* falls through */
          case be:
            if (T.extra) {
              for (et = T.extra; ee < et; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              T.offset += K & (1 << T.extra) - 1, K >>>= T.extra, ee -= T.extra, T.back += T.extra;
            }
            if (T.offset > T.dmax) {
              x.msg = "invalid distance too far back", T.mode = le;
              break;
            }
            T.mode = S;
          /* falls through */
          case S:
            if (D === 0)
              break e;
            if (Se = Ae - D, T.offset > Se) {
              if (Se = T.offset - Se, Se > T.whave && T.sane) {
                x.msg = "invalid distance too far back", T.mode = le;
                break;
              }
              Se > T.wnext ? (Se -= T.wnext, De = T.wsize - Se) : De = T.wnext - Se, Se > T.length && (Se = T.length), kt = T.window;
            } else
              kt = ue, De = V - T.offset, Se = T.length;
            Se > D && (Se = D), D -= Se, T.length -= Se;
            do
              ue[V++] = kt[De++];
            while (--Se);
            T.length === 0 && (T.mode = ve);
            break;
          case b:
            if (D === 0)
              break e;
            ue[V++] = T.length, D--, T.mode = ve;
            break;
          case W:
            if (T.wrap) {
              for (; ee < 32; ) {
                if (Z === 0)
                  break e;
                Z--, K |= J[w++] << ee, ee += 8;
              }
              if (Ae -= D, x.total_out += Ae, T.total += Ae, Ae && (x.adler = T.check = /*UPDATE(state.check, put - _out, _out);*/
              T.flags ? p(T.check, ue, Ae, V - Ae) : d(T.check, ue, Ae, V - Ae)), Ae = D, (T.flags ? K : He(K)) !== T.check) {
                x.msg = "incorrect data check", T.mode = le;
                break;
              }
              K = 0, ee = 0;
            }
            T.mode = $;
          /* falls through */
          case $:
            if (T.wrap && T.flags) {
              for (; ee < 32; ) {
                if (Z === 0)
                  break e;
                Z--, K += J[w++] << ee, ee += 8;
              }
              if (K !== (T.total & 4294967295)) {
                x.msg = "incorrect length check", T.mode = le;
                break;
              }
              K = 0, ee = 0;
            }
            T.mode = he;
          /* falls through */
          case he:
            gt = t;
            break e;
          case le:
            gt = g;
            break e;
          case me:
            return m;
          case Ne:
          /* falls through */
          default:
            return f;
        }
    return x.next_out = V, x.avail_out = D, x.next_in = w, x.avail_in = Z, T.hold = K, T.bits = ee, (T.wsize || Ae !== x.avail_out && T.mode < le && (T.mode < W || Y !== i)) && Ce(x, x.output, x.next_out, Ae - x.avail_out), _e -= x.avail_in, Ae -= x.avail_out, x.total_in += _e, x.total_out += Ae, T.total += Ae, T.wrap && Ae && (x.adler = T.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
    T.flags ? p(T.check, ue, Ae, x.next_out - Ae) : d(T.check, ue, Ae, x.next_out - Ae)), x.data_type = T.bits + (T.last ? 64 : 0) + (T.mode === B ? 128 : 0) + (T.mode === ae || T.mode === N ? 256 : 0), (_e === 0 && Ae === 0 || Y === i) && gt === e && (gt = v), gt;
  }
  function se(x) {
    if (!x || !x.state)
      return f;
    var Y = x.state;
    return Y.window && (Y.window = null), x.state = null, e;
  }
  function ne(x, Y) {
    var T;
    return !x || !x.state || (T = x.state, (T.wrap & 2) === 0) ? f : (T.head = Y, Y.done = !1, e);
  }
  function P(x, Y) {
    var T = Y.length, J, ue, w;
    return !x || !x.state || (J = x.state, J.wrap !== 0 && J.mode !== j) ? f : J.mode === j && (ue = 1, ue = d(ue, Y, T, 0), ue !== J.check) ? g : (w = Ce(x, Y, T, T), w ? (J.mode = me, m) : (J.havedict = 1, e));
  }
  return Rt.inflateReset = _, Rt.inflateReset2 = re, Rt.inflateResetKeep = Ge, Rt.inflateInit = ge, Rt.inflateInit2 = oe, Rt.inflate = L, Rt.inflateEnd = se, Rt.inflateGetHeader = ne, Rt.inflateSetDictionary = P, Rt.inflateInfo = "pako inflate (from Nodeca project)", Rt;
}
var hs, Uf;
function Qm() {
  return Uf || (Uf = 1, hs = {
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
  }), hs;
}
var ps, $f;
function wv() {
  if ($f) return ps;
  $f = 1;
  function o() {
    this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
  }
  return ps = o, ps;
}
var qf;
function _v() {
  if (qf) return Cr;
  qf = 1;
  var o = yv(), d = Zt(), p = Zm(), c = Qm(), h = Wl(), u = Xm(), n = wv(), l = Object.prototype.toString;
  function i(e) {
    if (!(this instanceof i)) return new i(e);
    this.options = d.assign({
      chunkSize: 16384,
      windowBits: 0,
      to: ""
    }, e || {});
    var t = this.options;
    t.raw && t.windowBits >= 0 && t.windowBits < 16 && (t.windowBits = -t.windowBits, t.windowBits === 0 && (t.windowBits = -15)), t.windowBits >= 0 && t.windowBits < 16 && !(e && e.windowBits) && (t.windowBits += 32), t.windowBits > 15 && t.windowBits < 48 && (t.windowBits & 15) === 0 && (t.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new u(), this.strm.avail_out = 0;
    var s = o.inflateInit2(
      this.strm,
      t.windowBits
    );
    if (s !== c.Z_OK)
      throw new Error(h[s]);
    if (this.header = new n(), o.inflateGetHeader(this.strm, this.header), t.dictionary && (typeof t.dictionary == "string" ? t.dictionary = p.string2buf(t.dictionary) : l.call(t.dictionary) === "[object ArrayBuffer]" && (t.dictionary = new Uint8Array(t.dictionary)), t.raw && (s = o.inflateSetDictionary(this.strm, t.dictionary), s !== c.Z_OK)))
      throw new Error(h[s]);
  }
  i.prototype.push = function(e, t) {
    var s = this.strm, f = this.options.chunkSize, g = this.options.dictionary, m, v, y, E, R, C = !1;
    if (this.ended)
      return !1;
    v = t === ~~t ? t : t === !0 ? c.Z_FINISH : c.Z_NO_FLUSH, typeof e == "string" ? s.input = p.binstring2buf(e) : l.call(e) === "[object ArrayBuffer]" ? s.input = new Uint8Array(e) : s.input = e, s.next_in = 0, s.avail_in = s.input.length;
    do {
      if (s.avail_out === 0 && (s.output = new d.Buf8(f), s.next_out = 0, s.avail_out = f), m = o.inflate(s, c.Z_NO_FLUSH), m === c.Z_NEED_DICT && g && (m = o.inflateSetDictionary(this.strm, g)), m === c.Z_BUF_ERROR && C === !0 && (m = c.Z_OK, C = !1), m !== c.Z_STREAM_END && m !== c.Z_OK)
        return this.onEnd(m), this.ended = !0, !1;
      s.next_out && (s.avail_out === 0 || m === c.Z_STREAM_END || s.avail_in === 0 && (v === c.Z_FINISH || v === c.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (y = p.utf8border(s.output, s.next_out), E = s.next_out - y, R = p.buf2string(s.output, y), s.next_out = E, s.avail_out = f - E, E && d.arraySet(s.output, s.output, y, E, 0), this.onData(R)) : this.onData(d.shrinkBuf(s.output, s.next_out))), s.avail_in === 0 && s.avail_out === 0 && (C = !0);
    } while ((s.avail_in > 0 || s.avail_out === 0) && m !== c.Z_STREAM_END);
    return m === c.Z_STREAM_END && (v = c.Z_FINISH), v === c.Z_FINISH ? (m = o.inflateEnd(this.strm), this.onEnd(m), this.ended = !0, m === c.Z_OK) : (v === c.Z_SYNC_FLUSH && (this.onEnd(c.Z_OK), s.avail_out = 0), !0);
  }, i.prototype.onData = function(e) {
    this.chunks.push(e);
  }, i.prototype.onEnd = function(e) {
    e === c.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
  };
  function a(e, t) {
    var s = new i(t);
    if (s.push(e, !0), s.err)
      throw s.msg || h[s.err];
    return s.result;
  }
  function r(e, t) {
    return t = t || {}, t.raw = !0, a(e, t);
  }
  return Cr.Inflate = i, Cr.inflate = a, Cr.inflateRaw = r, Cr.ungzip = a, Cr;
}
var ms, Mf;
function bv() {
  if (Mf) return ms;
  Mf = 1;
  var o = Zt().assign, d = mv(), p = _v(), c = Qm(), h = {};
  return o(h, d, p, c), ms = h, ms;
}
var Bf;
function Ev() {
  if (Bf) return Kr;
  Bf = 1;
  var o = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", d = bv(), p = Je(), c = Tt(), h = o ? "uint8array" : "array";
  Kr.magic = "\b\0";
  function u(n, l) {
    c.call(this, "FlateWorker/" + n), this._pako = null, this._pakoAction = n, this._pakoOptions = l, this.meta = {};
  }
  return p.inherits(u, c), u.prototype.processChunk = function(n) {
    this.meta = n.meta, this._pako === null && this._createPako(), this._pako.push(p.transformTo(h, n.data), !1);
  }, u.prototype.flush = function() {
    c.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
  }, u.prototype.cleanUp = function() {
    c.prototype.cleanUp.call(this), this._pako = null;
  }, u.prototype._createPako = function() {
    this._pako = new d[this._pakoAction]({
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
  }, Kr.compressWorker = function(n) {
    return new u("Deflate", n);
  }, Kr.uncompressWorker = function() {
    return new u("Inflate", {});
  }, Kr;
}
var jf;
function eg() {
  if (jf) return ri;
  jf = 1;
  var o = Tt();
  return ri.STORE = {
    magic: "\0\0",
    compressWorker: function() {
      return new o("STORE compression");
    },
    uncompressWorker: function() {
      return new o("STORE decompression");
    }
  }, ri.DEFLATE = Ev(), ri;
}
var jt = {}, Hf;
function tg() {
  return Hf || (Hf = 1, jt.LOCAL_FILE_HEADER = "PK", jt.CENTRAL_FILE_HEADER = "PK", jt.CENTRAL_DIRECTORY_END = "PK", jt.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", jt.ZIP64_CENTRAL_DIRECTORY_END = "PK", jt.DATA_DESCRIPTOR = "PK\x07\b"), jt;
}
var gs, zf;
function Sv() {
  if (zf) return gs;
  zf = 1;
  var o = Je(), d = Tt(), p = On(), c = zl(), h = tg(), u = function(t, s) {
    var f = "", g;
    for (g = 0; g < s; g++)
      f += String.fromCharCode(t & 255), t = t >>> 8;
    return f;
  }, n = function(t, s) {
    var f = t;
    return t || (f = s ? 16893 : 33204), (f & 65535) << 16;
  }, l = function(t) {
    return (t || 0) & 63;
  }, i = function(t, s, f, g, m, v) {
    var y = t.file, E = t.compression, R = v !== p.utf8encode, C = o.transformTo("string", v(y.name)), I = o.transformTo("string", p.utf8encode(y.name)), k = y.comment, O = o.transformTo("string", v(k)), A = o.transformTo("string", p.utf8encode(k)), M = I.length !== y.name.length, z = A.length !== k.length, U, j, B = "", H = "", te = "", N = y.dir, F = y.date, G = {
      crc32: 0,
      compressedSize: 0,
      uncompressedSize: 0
    };
    (!s || f) && (G.crc32 = t.crc32, G.compressedSize = t.compressedSize, G.uncompressedSize = t.uncompressedSize);
    var Q = 0;
    s && (Q |= 8), !R && (M || z) && (Q |= 2048);
    var ce = 0, ae = 0;
    N && (ce |= 16), m === "UNIX" ? (ae = 798, ce |= n(y.unixPermissions, N)) : (ae = 20, ce |= l(y.dosPermissions)), U = F.getUTCHours(), U = U << 6, U = U | F.getUTCMinutes(), U = U << 5, U = U | F.getUTCSeconds() / 2, j = F.getUTCFullYear() - 1980, j = j << 4, j = j | F.getUTCMonth() + 1, j = j << 5, j = j | F.getUTCDate(), M && (H = // Version
    u(1, 1) + // NameCRC32
    u(c(C), 4) + // UnicodeName
    I, B += // Info-ZIP Unicode Path Extra Field
    "up" + // size
    u(H.length, 2) + // content
    H), z && (te = // Version
    u(1, 1) + // CommentCRC32
    u(c(O), 4) + // UnicodeName
    A, B += // Info-ZIP Unicode Path Extra Field
    "uc" + // size
    u(te.length, 2) + // content
    te);
    var ve = "";
    ve += `
\0`, ve += u(Q, 2), ve += E.magic, ve += u(U, 2), ve += u(j, 2), ve += u(G.crc32, 4), ve += u(G.compressedSize, 4), ve += u(G.uncompressedSize, 4), ve += u(C.length, 2), ve += u(B.length, 2);
    var we = h.LOCAL_FILE_HEADER + ve + C + B, ie = h.CENTRAL_FILE_HEADER + // version made by (00: DOS)
    u(ae, 2) + // file header (common to file and central directory)
    ve + // file comment length
    u(O.length, 2) + // disk number start
    "\0\0\0\0" + // external file attributes
    u(ce, 4) + // relative offset of local header
    u(g, 4) + // file name
    C + // extra field
    B + // file comment
    O;
    return {
      fileRecord: we,
      dirRecord: ie
    };
  }, a = function(t, s, f, g, m) {
    var v = "", y = o.transformTo("string", m(g));
    return v = h.CENTRAL_DIRECTORY_END + // number of this disk
    "\0\0\0\0" + // total number of entries in the central directory on this disk
    u(t, 2) + // total number of entries in the central directory
    u(t, 2) + // size of the central directory   4 bytes
    u(s, 4) + // offset of start of central directory with respect to the starting disk number
    u(f, 4) + // .ZIP file comment length
    u(y.length, 2) + // .ZIP file comment
    y, v;
  }, r = function(t) {
    var s = "";
    return s = h.DATA_DESCRIPTOR + // crc-32                          4 bytes
    u(t.crc32, 4) + // compressed size                 4 bytes
    u(t.compressedSize, 4) + // uncompressed size               4 bytes
    u(t.uncompressedSize, 4), s;
  };
  function e(t, s, f, g) {
    d.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = s, this.zipPlatform = f, this.encodeFileName = g, this.streamFiles = t, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
  }
  return o.inherits(e, d), e.prototype.push = function(t) {
    var s = t.meta.percent || 0, f = this.entriesCount, g = this._sources.length;
    this.accumulate ? this.contentBuffer.push(t) : (this.bytesWritten += t.data.length, d.prototype.push.call(this, {
      data: t.data,
      meta: {
        currentFile: this.currentFile,
        percent: f ? (s + 100 * (f - g - 1)) / f : 100
      }
    }));
  }, e.prototype.openedSource = function(t) {
    this.currentSourceOffset = this.bytesWritten, this.currentFile = t.file.name;
    var s = this.streamFiles && !t.file.dir;
    if (s) {
      var f = i(t, s, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
      this.push({
        data: f.fileRecord,
        meta: { percent: 0 }
      });
    } else
      this.accumulate = !0;
  }, e.prototype.closedSource = function(t) {
    this.accumulate = !1;
    var s = this.streamFiles && !t.file.dir, f = i(t, s, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
    if (this.dirRecords.push(f.dirRecord), s)
      this.push({
        data: r(t),
        meta: { percent: 100 }
      });
    else
      for (this.push({
        data: f.fileRecord,
        meta: { percent: 0 }
      }); this.contentBuffer.length; )
        this.push(this.contentBuffer.shift());
    this.currentFile = null;
  }, e.prototype.flush = function() {
    for (var t = this.bytesWritten, s = 0; s < this.dirRecords.length; s++)
      this.push({
        data: this.dirRecords[s],
        meta: { percent: 100 }
      });
    var f = this.bytesWritten - t, g = a(this.dirRecords.length, f, t, this.zipComment, this.encodeFileName);
    this.push({
      data: g,
      meta: { percent: 100 }
    });
  }, e.prototype.prepareNextSource = function() {
    this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
  }, e.prototype.registerPrevious = function(t) {
    this._sources.push(t);
    var s = this;
    return t.on("data", function(f) {
      s.processChunk(f);
    }), t.on("end", function() {
      s.closedSource(s.previous.streamInfo), s._sources.length ? s.prepareNextSource() : s.end();
    }), t.on("error", function(f) {
      s.error(f);
    }), this;
  }, e.prototype.resume = function() {
    if (!d.prototype.resume.call(this))
      return !1;
    if (!this.previous && this._sources.length)
      return this.prepareNextSource(), !0;
    if (!this.previous && !this._sources.length && !this.generatedError)
      return this.end(), !0;
  }, e.prototype.error = function(t) {
    var s = this._sources;
    if (!d.prototype.error.call(this, t))
      return !1;
    for (var f = 0; f < s.length; f++)
      try {
        s[f].error(t);
      } catch {
      }
    return !0;
  }, e.prototype.lock = function() {
    d.prototype.lock.call(this);
    for (var t = this._sources, s = 0; s < t.length; s++)
      t[s].lock();
  }, gs = e, gs;
}
var Gf;
function Av() {
  if (Gf) return as;
  Gf = 1;
  var o = eg(), d = Sv(), p = function(c, h) {
    var u = c || h, n = o[u];
    if (!n)
      throw new Error(u + " is not a valid compression method !");
    return n;
  };
  return as.generateWorker = function(c, h, u) {
    var n = new d(h.streamFiles, u, h.platform, h.encodeFileName), l = 0;
    try {
      c.forEach(function(i, a) {
        l++;
        var r = p(a.options.compression, h.compression), e = a.options.compressionOptions || h.compressionOptions || {}, t = a.dir, s = a.date;
        a._compressWorker(r, e).withStreamInfo("file", {
          name: i,
          dir: t,
          date: s,
          comment: a.comment || "",
          unixPermissions: a.unixPermissions,
          dosPermissions: a.dosPermissions
        }).pipe(n);
      }), n.entriesCount = l;
    } catch (i) {
      n.error(i);
    }
    return n;
  }, as;
}
var vs, Wf;
function Cv() {
  if (Wf) return vs;
  Wf = 1;
  var o = Je(), d = Tt();
  function p(c, h) {
    d.call(this, "Nodejs stream input adapter for " + c), this._upstreamEnded = !1, this._bindStream(h);
  }
  return o.inherits(p, d), p.prototype._bindStream = function(c) {
    var h = this;
    this._stream = c, c.pause(), c.on("data", function(u) {
      h.push({
        data: u,
        meta: {
          percent: 0
        }
      });
    }).on("error", function(u) {
      h.isPaused ? this.generatedError = u : h.error(u);
    }).on("end", function() {
      h.isPaused ? h._upstreamEnded = !0 : h.end();
    });
  }, p.prototype.pause = function() {
    return d.prototype.pause.call(this) ? (this._stream.pause(), !0) : !1;
  }, p.prototype.resume = function() {
    return d.prototype.resume.call(this) ? (this._upstreamEnded ? this.end() : this._stream.resume(), !0) : !1;
  }, vs = p, vs;
}
var ys, Yf;
function Rv() {
  if (Yf) return ys;
  Yf = 1;
  var o = On(), d = Je(), p = Tt(), c = Gm(), h = Wm(), u = Gl(), n = dv(), l = Av(), i = Ni(), a = Cv(), r = function(m, v, y) {
    var E = d.getTypeOf(v), R, C = d.extend(y || {}, h);
    C.date = C.date || /* @__PURE__ */ new Date(), C.compression !== null && (C.compression = C.compression.toUpperCase()), typeof C.unixPermissions == "string" && (C.unixPermissions = parseInt(C.unixPermissions, 8)), C.unixPermissions && C.unixPermissions & 16384 && (C.dir = !0), C.dosPermissions && C.dosPermissions & 16 && (C.dir = !0), C.dir && (m = t(m)), C.createFolders && (R = e(m)) && s.call(this, R, !0);
    var I = E === "string" && C.binary === !1 && C.base64 === !1;
    (!y || typeof y.binary > "u") && (C.binary = !I);
    var k = v instanceof u && v.uncompressedSize === 0;
    (k || C.dir || !v || v.length === 0) && (C.base64 = !1, C.binary = !0, v = "", C.compression = "STORE", E = "string");
    var O = null;
    v instanceof u || v instanceof p ? O = v : i.isNode && i.isStream(v) ? O = new a(m, v) : O = d.prepareContent(m, v, C.binary, C.optimizedBinaryString, C.base64);
    var A = new n(m, O, C);
    this.files[m] = A;
  }, e = function(m) {
    m.slice(-1) === "/" && (m = m.substring(0, m.length - 1));
    var v = m.lastIndexOf("/");
    return v > 0 ? m.substring(0, v) : "";
  }, t = function(m) {
    return m.slice(-1) !== "/" && (m += "/"), m;
  }, s = function(m, v) {
    return v = typeof v < "u" ? v : h.createFolders, m = t(m), this.files[m] || r.call(this, m, null, {
      dir: !0,
      createFolders: v
    }), this.files[m];
  };
  function f(m) {
    return Object.prototype.toString.call(m) === "[object RegExp]";
  }
  var g = {
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
    forEach: function(m) {
      var v, y, E;
      for (v in this.files)
        E = this.files[v], y = v.slice(this.root.length, v.length), y && v.slice(0, this.root.length) === this.root && m(y, E);
    },
    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function(m) {
      var v = [];
      return this.forEach(function(y, E) {
        m(y, E) && v.push(E);
      }), v;
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
    file: function(m, v, y) {
      if (arguments.length === 1)
        if (f(m)) {
          var E = m;
          return this.filter(function(C, I) {
            return !I.dir && E.test(C);
          });
        } else {
          var R = this.files[this.root + m];
          return R && !R.dir ? R : null;
        }
      else
        m = this.root + m, r.call(this, m, v, y);
      return this;
    },
    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function(m) {
      if (!m)
        return this;
      if (f(m))
        return this.filter(function(R, C) {
          return C.dir && m.test(R);
        });
      var v = this.root + m, y = s.call(this, v), E = this.clone();
      return E.root = y.name, E;
    },
    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function(m) {
      m = this.root + m;
      var v = this.files[m];
      if (v || (m.slice(-1) !== "/" && (m += "/"), v = this.files[m]), v && !v.dir)
        delete this.files[m];
      else
        for (var y = this.filter(function(R, C) {
          return C.name.slice(0, m.length) === m;
        }), E = 0; E < y.length; E++)
          delete this.files[y[E].name];
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
    generateInternalStream: function(m) {
      var v, y = {};
      try {
        if (y = d.extend(m || {}, {
          streamFiles: !1,
          compression: "STORE",
          compressionOptions: null,
          type: "",
          platform: "DOS",
          comment: null,
          mimeType: "application/zip",
          encodeFileName: o.utf8encode
        }), y.type = y.type.toLowerCase(), y.compression = y.compression.toUpperCase(), y.type === "binarystring" && (y.type = "string"), !y.type)
          throw new Error("No output type specified.");
        d.checkSupport(y.type), (y.platform === "darwin" || y.platform === "freebsd" || y.platform === "linux" || y.platform === "sunos") && (y.platform = "UNIX"), y.platform === "win32" && (y.platform = "DOS");
        var E = y.comment || this.comment || "";
        v = l.generateWorker(this, y, E);
      } catch (R) {
        v = new p("error"), v.error(R);
      }
      return new c(v, y.type || "string", y.mimeType);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateAsync: function(m, v) {
      return this.generateInternalStream(m).accumulate(v);
    },
    /**
     * Generate the complete zip file asynchronously.
     * @see generateInternalStream
     */
    generateNodeStream: function(m, v) {
      return m = m || {}, m.type || (m.type = "nodebuffer"), this.generateInternalStream(m).toNodejsStream(v);
    }
  };
  return ys = g, ys;
}
var ws, Kf;
function rg() {
  if (Kf) return ws;
  Kf = 1;
  var o = Je();
  function d(p) {
    this.data = p, this.length = p.length, this.index = 0, this.zero = 0;
  }
  return d.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function(p) {
      this.checkIndex(this.index + p);
    },
    /**
     * Check that the specified index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function(p) {
      if (this.length < this.zero + p || p < 0)
        throw new Error("End of data reached (data length = " + this.length + ", asked index = " + p + "). Corrupted zip ?");
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function(p) {
      this.checkIndex(p), this.index = p;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function(p) {
      this.setIndex(this.index + p);
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
    readInt: function(p) {
      var c = 0, h;
      for (this.checkOffset(p), h = this.index + p - 1; h >= this.index; h--)
        c = (c << 8) + this.byteAt(h);
      return this.index += p, c;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function(p) {
      return o.transformTo("string", this.readData(p));
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
      var p = this.readInt(4);
      return new Date(Date.UTC(
        (p >> 25 & 127) + 1980,
        // year
        (p >> 21 & 15) - 1,
        // month
        p >> 16 & 31,
        // day
        p >> 11 & 31,
        // hour
        p >> 5 & 63,
        // minute
        (p & 31) << 1
      ));
    }
  }, ws = d, ws;
}
var _s, Vf;
function ng() {
  if (Vf) return _s;
  Vf = 1;
  var o = rg(), d = Je();
  function p(c) {
    o.call(this, c);
    for (var h = 0; h < this.data.length; h++)
      c[h] = c[h] & 255;
  }
  return d.inherits(p, o), p.prototype.byteAt = function(c) {
    return this.data[this.zero + c];
  }, p.prototype.lastIndexOfSignature = function(c) {
    for (var h = c.charCodeAt(0), u = c.charCodeAt(1), n = c.charCodeAt(2), l = c.charCodeAt(3), i = this.length - 4; i >= 0; --i)
      if (this.data[i] === h && this.data[i + 1] === u && this.data[i + 2] === n && this.data[i + 3] === l)
        return i - this.zero;
    return -1;
  }, p.prototype.readAndCheckSignature = function(c) {
    var h = c.charCodeAt(0), u = c.charCodeAt(1), n = c.charCodeAt(2), l = c.charCodeAt(3), i = this.readData(4);
    return h === i[0] && u === i[1] && n === i[2] && l === i[3];
  }, p.prototype.readData = function(c) {
    if (this.checkOffset(c), c === 0)
      return [];
    var h = this.data.slice(this.zero + this.index, this.zero + this.index + c);
    return this.index += c, h;
  }, _s = p, _s;
}
var bs, Jf;
function Tv() {
  if (Jf) return bs;
  Jf = 1;
  var o = rg(), d = Je();
  function p(c) {
    o.call(this, c);
  }
  return d.inherits(p, o), p.prototype.byteAt = function(c) {
    return this.data.charCodeAt(this.zero + c);
  }, p.prototype.lastIndexOfSignature = function(c) {
    return this.data.lastIndexOf(c) - this.zero;
  }, p.prototype.readAndCheckSignature = function(c) {
    var h = this.readData(4);
    return c === h;
  }, p.prototype.readData = function(c) {
    this.checkOffset(c);
    var h = this.data.slice(this.zero + this.index, this.zero + this.index + c);
    return this.index += c, h;
  }, bs = p, bs;
}
var Es, Zf;
function ig() {
  if (Zf) return Es;
  Zf = 1;
  var o = ng(), d = Je();
  function p(c) {
    o.call(this, c);
  }
  return d.inherits(p, o), p.prototype.readData = function(c) {
    if (this.checkOffset(c), c === 0)
      return new Uint8Array(0);
    var h = this.data.subarray(this.zero + this.index, this.zero + this.index + c);
    return this.index += c, h;
  }, Es = p, Es;
}
var Ss, Xf;
function Ov() {
  if (Xf) return Ss;
  Xf = 1;
  var o = ig(), d = Je();
  function p(c) {
    o.call(this, c);
  }
  return d.inherits(p, o), p.prototype.readData = function(c) {
    this.checkOffset(c);
    var h = this.data.slice(this.zero + this.index, this.zero + this.index + c);
    return this.index += c, h;
  }, Ss = p, Ss;
}
var As, Qf;
function ag() {
  if (Qf) return As;
  Qf = 1;
  var o = Je(), d = Jt(), p = ng(), c = Tv(), h = Ov(), u = ig();
  return As = function(n) {
    var l = o.getTypeOf(n);
    return o.checkSupport(l), l === "string" && !d.uint8array ? new c(n) : l === "nodebuffer" ? new h(n) : d.uint8array ? new u(o.transformTo("uint8array", n)) : new p(o.transformTo("array", n));
  }, As;
}
var Cs, ed;
function kv() {
  if (ed) return Cs;
  ed = 1;
  var o = ag(), d = Je(), p = Gl(), c = zl(), h = On(), u = eg(), n = Jt(), l = 0, i = 3, a = function(e) {
    for (var t in u)
      if (Object.prototype.hasOwnProperty.call(u, t) && u[t].magic === e)
        return u[t];
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
      var t, s;
      if (e.skip(22), this.fileNameLength = e.readInt(2), s = e.readInt(2), this.fileName = e.readData(this.fileNameLength), e.skip(s), this.compressedSize === -1 || this.uncompressedSize === -1)
        throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
      if (t = a(this.compressionMethod), t === null)
        throw new Error("Corrupted zip : compression " + d.pretty(this.compressionMethod) + " unknown (inner file : " + d.transformTo("string", this.fileName) + ")");
      this.decompressed = new p(this.compressedSize, this.uncompressedSize, this.crc32, t, e.readData(this.compressedSize));
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
      this.dir = !!(this.externalFileAttributes & 16), e === l && (this.dosPermissions = this.externalFileAttributes & 63), e === i && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), !this.dir && this.fileNameStr.slice(-1) === "/" && (this.dir = !0);
    },
    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function() {
      if (this.extraFields[1]) {
        var e = o(this.extraFields[1].value);
        this.uncompressedSize === d.MAX_VALUE_32BITS && (this.uncompressedSize = e.readInt(8)), this.compressedSize === d.MAX_VALUE_32BITS && (this.compressedSize = e.readInt(8)), this.localHeaderOffset === d.MAX_VALUE_32BITS && (this.localHeaderOffset = e.readInt(8)), this.diskNumberStart === d.MAX_VALUE_32BITS && (this.diskNumberStart = e.readInt(4));
      }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function(e) {
      var t = e.index + this.extraFieldsLength, s, f, g;
      for (this.extraFields || (this.extraFields = {}); e.index + 4 < t; )
        s = e.readInt(2), f = e.readInt(2), g = e.readData(f), this.extraFields[s] = {
          id: s,
          length: f,
          value: g
        };
      e.setIndex(t);
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function() {
      var e = n.uint8array ? "uint8array" : "array";
      if (this.useUTF8())
        this.fileNameStr = h.utf8decode(this.fileName), this.fileCommentStr = h.utf8decode(this.fileComment);
      else {
        var t = this.findExtraFieldUnicodePath();
        if (t !== null)
          this.fileNameStr = t;
        else {
          var s = d.transformTo(e, this.fileName);
          this.fileNameStr = this.loadOptions.decodeFileName(s);
        }
        var f = this.findExtraFieldUnicodeComment();
        if (f !== null)
          this.fileCommentStr = f;
        else {
          var g = d.transformTo(e, this.fileComment);
          this.fileCommentStr = this.loadOptions.decodeFileName(g);
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
        var t = o(e.value);
        return t.readInt(1) !== 1 || c(this.fileName) !== t.readInt(4) ? null : h.utf8decode(t.readData(e.length - 5));
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
        var t = o(e.value);
        return t.readInt(1) !== 1 || c(this.fileComment) !== t.readInt(4) ? null : h.utf8decode(t.readData(e.length - 5));
      }
      return null;
    }
  }, Cs = r, Cs;
}
var Rs, td;
function Nv() {
  if (td) return Rs;
  td = 1;
  var o = ag(), d = Je(), p = tg(), c = kv(), h = Jt();
  function u(n) {
    this.files = [], this.loadOptions = n;
  }
  return u.prototype = {
    /**
     * Check that the reader is on the specified signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function(n) {
      if (!this.reader.readAndCheckSignature(n)) {
        this.reader.index -= 4;
        var l = this.reader.readString(4);
        throw new Error("Corrupted zip or bug: unexpected signature (" + d.pretty(l) + ", expected " + d.pretty(n) + ")");
      }
    },
    /**
     * Check if the given signature is at the given index.
     * @param {number} askedIndex the index to check.
     * @param {string} expectedSignature the signature to expect.
     * @return {boolean} true if the signature is here, false otherwise.
     */
    isSignature: function(n, l) {
      var i = this.reader.index;
      this.reader.setIndex(n);
      var a = this.reader.readString(4), r = a === l;
      return this.reader.setIndex(i), r;
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function() {
      this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
      var n = this.reader.readData(this.zipCommentLength), l = h.uint8array ? "uint8array" : "array", i = d.transformTo(l, n);
      this.zipComment = this.loadOptions.decodeFileName(i);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function() {
      this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
      for (var n = this.zip64EndOfCentralSize - 44, l = 0, i, a, r; l < n; )
        i = this.reader.readInt(2), a = this.reader.readInt(4), r = this.reader.readData(a), this.zip64ExtensibleData[i] = {
          id: i,
          length: a,
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
        l = this.files[n], this.reader.setIndex(l.localHeaderOffset), this.checkSignature(p.LOCAL_FILE_HEADER), l.readLocalPart(this.reader), l.handleUTF8(), l.processAttributes();
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function() {
      var n;
      for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(p.CENTRAL_FILE_HEADER); )
        n = new c({
          zip64: this.zip64
        }, this.loadOptions), n.readCentralPart(this.reader), this.files.push(n);
      if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0)
        throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function() {
      var n = this.reader.lastIndexOfSignature(p.CENTRAL_DIRECTORY_END);
      if (n < 0) {
        var l = !this.isSignature(0, p.LOCAL_FILE_HEADER);
        throw l ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
      }
      this.reader.setIndex(n);
      var i = n;
      if (this.checkSignature(p.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === d.MAX_VALUE_16BITS || this.diskWithCentralDirStart === d.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === d.MAX_VALUE_16BITS || this.centralDirRecords === d.MAX_VALUE_16BITS || this.centralDirSize === d.MAX_VALUE_32BITS || this.centralDirOffset === d.MAX_VALUE_32BITS) {
        if (this.zip64 = !0, n = this.reader.lastIndexOfSignature(p.ZIP64_CENTRAL_DIRECTORY_LOCATOR), n < 0)
          throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
        if (this.reader.setIndex(n), this.checkSignature(p.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, p.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(p.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0))
          throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
        this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(p.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
      }
      var a = this.centralDirOffset + this.centralDirSize;
      this.zip64 && (a += 20, a += 12 + this.zip64EndOfCentralSize);
      var r = i - a;
      if (r > 0)
        this.isSignature(i, p.CENTRAL_FILE_HEADER) || (this.reader.zero = r);
      else if (r < 0)
        throw new Error("Corrupted zip: missing " + Math.abs(r) + " bytes.");
    },
    prepareReader: function(n) {
      this.reader = o(n);
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function(n) {
      this.prepareReader(n), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
    }
  }, Rs = u, Rs;
}
var Ts, rd;
function Iv() {
  if (rd) return Ts;
  rd = 1;
  var o = Je(), d = Tn(), p = On(), c = Nv(), h = Km(), u = Ni();
  function n(l) {
    return new d.Promise(function(i, a) {
      var r = l.decompressed.getContentWorker().pipe(new h());
      r.on("error", function(e) {
        a(e);
      }).on("end", function() {
        r.streamInfo.crc32 !== l.decompressed.crc32 ? a(new Error("Corrupted zip : CRC32 mismatch")) : i();
      }).resume();
    });
  }
  return Ts = function(l, i) {
    var a = this;
    return i = o.extend(i || {}, {
      base64: !1,
      checkCRC32: !1,
      optimizedBinaryString: !1,
      createFolders: !1,
      decodeFileName: p.utf8decode
    }), u.isNode && u.isStream(l) ? d.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : o.prepareContent("the loaded zip file", l, !0, i.optimizedBinaryString, i.base64).then(function(r) {
      var e = new c(i);
      return e.load(r), e;
    }).then(function(e) {
      var t = [d.Promise.resolve(e)], s = e.files;
      if (i.checkCRC32)
        for (var f = 0; f < s.length; f++)
          t.push(n(s[f]));
      return d.Promise.all(t);
    }).then(function(e) {
      for (var t = e.shift(), s = t.files, f = 0; f < s.length; f++) {
        var g = s[f], m = g.fileNameStr, v = o.resolve(g.fileNameStr);
        a.file(v, g.decompressed, {
          binary: !0,
          optimizedBinaryString: !0,
          date: g.date,
          dir: g.dir,
          comment: g.fileCommentStr.length ? g.fileCommentStr : null,
          unixPermissions: g.unixPermissions,
          dosPermissions: g.dosPermissions,
          createFolders: i.createFolders
        }), g.dir || (a.file(v).unsafeOriginalName = m);
      }
      return t.zipComment.length && (a.comment = t.zipComment), a;
    });
  }, Ts;
}
var Os, nd;
function Dv() {
  if (nd) return Os;
  nd = 1;
  function o() {
    if (!(this instanceof o))
      return new o();
    if (arguments.length)
      throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
      var d = new o();
      for (var p in this)
        typeof this[p] != "function" && (d[p] = this[p]);
      return d;
    };
  }
  return o.prototype = Rv(), o.prototype.loadAsync = Iv(), o.support = Jt(), o.defaults = Wm(), o.version = "3.10.1", o.loadAsync = function(d, p) {
    return new o().loadAsync(d, p);
  }, o.external = Tn(), Os = o, Os;
}
var Pv = Dv();
const xv = /* @__PURE__ */ hm(Pv);
var ir = {}, ks = {}, ni = {}, id;
function _t() {
  return id || (id = 1, ni.fromCallback = function(o) {
    return Object.defineProperty(function(...d) {
      if (typeof d[d.length - 1] == "function") o.apply(this, d);
      else
        return new Promise((p, c) => {
          d.push((h, u) => h != null ? c(h) : p(u)), o.apply(this, d);
        });
    }, "name", { value: o.name });
  }, ni.fromPromise = function(o) {
    return Object.defineProperty(function(...d) {
      const p = d[d.length - 1];
      if (typeof p != "function") return o.apply(this, d);
      d.pop(), o.apply(this, d).then((c) => p(null, c), p);
    }, "name", { value: o.name });
  }), ni;
}
var Ns, ad;
function Lv() {
  if (ad) return Ns;
  ad = 1;
  var o = O0, d = process.cwd, p = null, c = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return p || (p = d.call(process)), p;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var h = process.chdir;
    process.chdir = function(n) {
      p = null, h.call(process, n);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, h);
  }
  Ns = u;
  function u(n) {
    o.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && l(n), n.lutimes || i(n), n.chown = e(n.chown), n.fchown = e(n.fchown), n.lchown = e(n.lchown), n.chmod = a(n.chmod), n.fchmod = a(n.fchmod), n.lchmod = a(n.lchmod), n.chownSync = t(n.chownSync), n.fchownSync = t(n.fchownSync), n.lchownSync = t(n.lchownSync), n.chmodSync = r(n.chmodSync), n.fchmodSync = r(n.fchmodSync), n.lchmodSync = r(n.lchmodSync), n.stat = s(n.stat), n.fstat = s(n.fstat), n.lstat = s(n.lstat), n.statSync = f(n.statSync), n.fstatSync = f(n.fstatSync), n.lstatSync = f(n.lstatSync), n.chmod && !n.lchmod && (n.lchmod = function(m, v, y) {
      y && process.nextTick(y);
    }, n.lchmodSync = function() {
    }), n.chown && !n.lchown && (n.lchown = function(m, v, y, E) {
      E && process.nextTick(E);
    }, n.lchownSync = function() {
    }), c === "win32" && (n.rename = typeof n.rename != "function" ? n.rename : (function(m) {
      function v(y, E, R) {
        var C = Date.now(), I = 0;
        m(y, E, function k(O) {
          if (O && (O.code === "EACCES" || O.code === "EPERM" || O.code === "EBUSY") && Date.now() - C < 6e4) {
            setTimeout(function() {
              n.stat(E, function(A, M) {
                A && A.code === "ENOENT" ? m(y, E, k) : R(O);
              });
            }, I), I < 100 && (I += 10);
            return;
          }
          R && R(O);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(v, m), v;
    })(n.rename)), n.read = typeof n.read != "function" ? n.read : (function(m) {
      function v(y, E, R, C, I, k) {
        var O;
        if (k && typeof k == "function") {
          var A = 0;
          O = function(M, z, U) {
            if (M && M.code === "EAGAIN" && A < 10)
              return A++, m.call(n, y, E, R, C, I, O);
            k.apply(this, arguments);
          };
        }
        return m.call(n, y, E, R, C, I, O);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(v, m), v;
    })(n.read), n.readSync = typeof n.readSync != "function" ? n.readSync : /* @__PURE__ */ (function(m) {
      return function(v, y, E, R, C) {
        for (var I = 0; ; )
          try {
            return m.call(n, v, y, E, R, C);
          } catch (k) {
            if (k.code === "EAGAIN" && I < 10) {
              I++;
              continue;
            }
            throw k;
          }
      };
    })(n.readSync);
    function l(m) {
      m.lchmod = function(v, y, E) {
        m.open(
          v,
          o.O_WRONLY | o.O_SYMLINK,
          y,
          function(R, C) {
            if (R) {
              E && E(R);
              return;
            }
            m.fchmod(C, y, function(I) {
              m.close(C, function(k) {
                E && E(I || k);
              });
            });
          }
        );
      }, m.lchmodSync = function(v, y) {
        var E = m.openSync(v, o.O_WRONLY | o.O_SYMLINK, y), R = !0, C;
        try {
          C = m.fchmodSync(E, y), R = !1;
        } finally {
          if (R)
            try {
              m.closeSync(E);
            } catch {
            }
          else
            m.closeSync(E);
        }
        return C;
      };
    }
    function i(m) {
      o.hasOwnProperty("O_SYMLINK") && m.futimes ? (m.lutimes = function(v, y, E, R) {
        m.open(v, o.O_SYMLINK, function(C, I) {
          if (C) {
            R && R(C);
            return;
          }
          m.futimes(I, y, E, function(k) {
            m.close(I, function(O) {
              R && R(k || O);
            });
          });
        });
      }, m.lutimesSync = function(v, y, E) {
        var R = m.openSync(v, o.O_SYMLINK), C, I = !0;
        try {
          C = m.futimesSync(R, y, E), I = !1;
        } finally {
          if (I)
            try {
              m.closeSync(R);
            } catch {
            }
          else
            m.closeSync(R);
        }
        return C;
      }) : m.futimes && (m.lutimes = function(v, y, E, R) {
        R && process.nextTick(R);
      }, m.lutimesSync = function() {
      });
    }
    function a(m) {
      return m && function(v, y, E) {
        return m.call(n, v, y, function(R) {
          g(R) && (R = null), E && E.apply(this, arguments);
        });
      };
    }
    function r(m) {
      return m && function(v, y) {
        try {
          return m.call(n, v, y);
        } catch (E) {
          if (!g(E)) throw E;
        }
      };
    }
    function e(m) {
      return m && function(v, y, E, R) {
        return m.call(n, v, y, E, function(C) {
          g(C) && (C = null), R && R.apply(this, arguments);
        });
      };
    }
    function t(m) {
      return m && function(v, y, E) {
        try {
          return m.call(n, v, y, E);
        } catch (R) {
          if (!g(R)) throw R;
        }
      };
    }
    function s(m) {
      return m && function(v, y, E) {
        typeof y == "function" && (E = y, y = null);
        function R(C, I) {
          I && (I.uid < 0 && (I.uid += 4294967296), I.gid < 0 && (I.gid += 4294967296)), E && E.apply(this, arguments);
        }
        return y ? m.call(n, v, y, R) : m.call(n, v, R);
      };
    }
    function f(m) {
      return m && function(v, y) {
        var E = y ? m.call(n, v, y) : m.call(n, v);
        return E && (E.uid < 0 && (E.uid += 4294967296), E.gid < 0 && (E.gid += 4294967296)), E;
      };
    }
    function g(m) {
      if (!m || m.code === "ENOSYS")
        return !0;
      var v = !process.getuid || process.getuid() !== 0;
      return !!(v && (m.code === "EINVAL" || m.code === "EPERM"));
    }
  }
  return Ns;
}
var Is, sd;
function Fv() {
  if (sd) return Is;
  sd = 1;
  var o = ur.Stream;
  Is = d;
  function d(p) {
    return {
      ReadStream: c,
      WriteStream: h
    };
    function c(u, n) {
      if (!(this instanceof c)) return new c(u, n);
      o.call(this);
      var l = this;
      this.path = u, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, n = n || {};
      for (var i = Object.keys(n), a = 0, r = i.length; a < r; a++) {
        var e = i[a];
        this[e] = n[e];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          l._read();
        });
        return;
      }
      p.open(this.path, this.flags, this.mode, function(t, s) {
        if (t) {
          l.emit("error", t), l.readable = !1;
          return;
        }
        l.fd = s, l.emit("open", s), l._read();
      });
    }
    function h(u, n) {
      if (!(this instanceof h)) return new h(u, n);
      o.call(this), this.path = u, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, n = n || {};
      for (var l = Object.keys(n), i = 0, a = l.length; i < a; i++) {
        var r = l[i];
        this[r] = n[r];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = p.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Is;
}
var Ds, od;
function Uv() {
  if (od) return Ds;
  od = 1, Ds = d;
  var o = Object.getPrototypeOf || function(p) {
    return p.__proto__;
  };
  function d(p) {
    if (p === null || typeof p != "object")
      return p;
    if (p instanceof Object)
      var c = { __proto__: o(p) };
    else
      var c = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(p).forEach(function(h) {
      Object.defineProperty(c, h, Object.getOwnPropertyDescriptor(p, h));
    }), c;
  }
  return Ds;
}
var ii, ld;
function yt() {
  if (ld) return ii;
  ld = 1;
  var o = Kt, d = Lv(), p = Fv(), c = Uv(), h = Pr, u, n;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (u = Symbol.for("graceful-fs.queue"), n = Symbol.for("graceful-fs.previous")) : (u = "___graceful-fs.queue", n = "___graceful-fs.previous");
  function l() {
  }
  function i(m, v) {
    Object.defineProperty(m, u, {
      get: function() {
        return v;
      }
    });
  }
  var a = l;
  if (h.debuglog ? a = h.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (a = function() {
    var m = h.format.apply(h, arguments);
    m = "GFS4: " + m.split(/\n/).join(`
GFS4: `), console.error(m);
  }), !o[u]) {
    var r = Me[u] || [];
    i(o, r), o.close = (function(m) {
      function v(y, E) {
        return m.call(o, y, function(R) {
          R || f(), typeof E == "function" && E.apply(this, arguments);
        });
      }
      return Object.defineProperty(v, n, {
        value: m
      }), v;
    })(o.close), o.closeSync = (function(m) {
      function v(y) {
        m.apply(o, arguments), f();
      }
      return Object.defineProperty(v, n, {
        value: m
      }), v;
    })(o.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      a(o[u]), cm.equal(o[u].length, 0);
    });
  }
  Me[u] || i(Me, o[u]), ii = e(c(o)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !o.__patched && (ii = e(o), o.__patched = !0);
  function e(m) {
    d(m), m.gracefulify = e, m.createReadStream = ce, m.createWriteStream = ae;
    var v = m.readFile;
    m.readFile = y;
    function y(ie, be, S) {
      return typeof be == "function" && (S = be, be = null), b(ie, be, S);
      function b(W, $, he, le) {
        return v(W, $, function(me) {
          me && (me.code === "EMFILE" || me.code === "ENFILE") ? t([b, [W, $, he], me, le || Date.now(), Date.now()]) : typeof he == "function" && he.apply(this, arguments);
        });
      }
    }
    var E = m.writeFile;
    m.writeFile = R;
    function R(ie, be, S, b) {
      return typeof S == "function" && (b = S, S = null), W(ie, be, S, b);
      function W($, he, le, me, Ne) {
        return E($, he, le, function(Te) {
          Te && (Te.code === "EMFILE" || Te.code === "ENFILE") ? t([W, [$, he, le, me], Te, Ne || Date.now(), Date.now()]) : typeof me == "function" && me.apply(this, arguments);
        });
      }
    }
    var C = m.appendFile;
    C && (m.appendFile = I);
    function I(ie, be, S, b) {
      return typeof S == "function" && (b = S, S = null), W(ie, be, S, b);
      function W($, he, le, me, Ne) {
        return C($, he, le, function(Te) {
          Te && (Te.code === "EMFILE" || Te.code === "ENFILE") ? t([W, [$, he, le, me], Te, Ne || Date.now(), Date.now()]) : typeof me == "function" && me.apply(this, arguments);
        });
      }
    }
    var k = m.copyFile;
    k && (m.copyFile = O);
    function O(ie, be, S, b) {
      return typeof S == "function" && (b = S, S = 0), W(ie, be, S, b);
      function W($, he, le, me, Ne) {
        return k($, he, le, function(Te) {
          Te && (Te.code === "EMFILE" || Te.code === "ENFILE") ? t([W, [$, he, le, me], Te, Ne || Date.now(), Date.now()]) : typeof me == "function" && me.apply(this, arguments);
        });
      }
    }
    var A = m.readdir;
    m.readdir = z;
    var M = /^v[0-5]\./;
    function z(ie, be, S) {
      typeof be == "function" && (S = be, be = null);
      var b = M.test(process.version) ? function(he, le, me, Ne) {
        return A(he, W(
          he,
          le,
          me,
          Ne
        ));
      } : function(he, le, me, Ne) {
        return A(he, le, W(
          he,
          le,
          me,
          Ne
        ));
      };
      return b(ie, be, S);
      function W($, he, le, me) {
        return function(Ne, Te) {
          Ne && (Ne.code === "EMFILE" || Ne.code === "ENFILE") ? t([
            b,
            [$, he, le],
            Ne,
            me || Date.now(),
            Date.now()
          ]) : (Te && Te.sort && Te.sort(), typeof le == "function" && le.call(this, Ne, Te));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var U = p(m);
      N = U.ReadStream, G = U.WriteStream;
    }
    var j = m.ReadStream;
    j && (N.prototype = Object.create(j.prototype), N.prototype.open = F);
    var B = m.WriteStream;
    B && (G.prototype = Object.create(B.prototype), G.prototype.open = Q), Object.defineProperty(m, "ReadStream", {
      get: function() {
        return N;
      },
      set: function(ie) {
        N = ie;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(m, "WriteStream", {
      get: function() {
        return G;
      },
      set: function(ie) {
        G = ie;
      },
      enumerable: !0,
      configurable: !0
    });
    var H = N;
    Object.defineProperty(m, "FileReadStream", {
      get: function() {
        return H;
      },
      set: function(ie) {
        H = ie;
      },
      enumerable: !0,
      configurable: !0
    });
    var te = G;
    Object.defineProperty(m, "FileWriteStream", {
      get: function() {
        return te;
      },
      set: function(ie) {
        te = ie;
      },
      enumerable: !0,
      configurable: !0
    });
    function N(ie, be) {
      return this instanceof N ? (j.apply(this, arguments), this) : N.apply(Object.create(N.prototype), arguments);
    }
    function F() {
      var ie = this;
      we(ie.path, ie.flags, ie.mode, function(be, S) {
        be ? (ie.autoClose && ie.destroy(), ie.emit("error", be)) : (ie.fd = S, ie.emit("open", S), ie.read());
      });
    }
    function G(ie, be) {
      return this instanceof G ? (B.apply(this, arguments), this) : G.apply(Object.create(G.prototype), arguments);
    }
    function Q() {
      var ie = this;
      we(ie.path, ie.flags, ie.mode, function(be, S) {
        be ? (ie.destroy(), ie.emit("error", be)) : (ie.fd = S, ie.emit("open", S));
      });
    }
    function ce(ie, be) {
      return new m.ReadStream(ie, be);
    }
    function ae(ie, be) {
      return new m.WriteStream(ie, be);
    }
    var ve = m.open;
    m.open = we;
    function we(ie, be, S, b) {
      return typeof S == "function" && (b = S, S = null), W(ie, be, S, b);
      function W($, he, le, me, Ne) {
        return ve($, he, le, function(Te, $e) {
          Te && (Te.code === "EMFILE" || Te.code === "ENFILE") ? t([W, [$, he, le, me], Te, Ne || Date.now(), Date.now()]) : typeof me == "function" && me.apply(this, arguments);
        });
      }
    }
    return m;
  }
  function t(m) {
    a("ENQUEUE", m[0].name, m[1]), o[u].push(m), g();
  }
  var s;
  function f() {
    for (var m = Date.now(), v = 0; v < o[u].length; ++v)
      o[u][v].length > 2 && (o[u][v][3] = m, o[u][v][4] = m);
    g();
  }
  function g() {
    if (clearTimeout(s), s = void 0, o[u].length !== 0) {
      var m = o[u].shift(), v = m[0], y = m[1], E = m[2], R = m[3], C = m[4];
      if (R === void 0)
        a("RETRY", v.name, y), v.apply(null, y);
      else if (Date.now() - R >= 6e4) {
        a("TIMEOUT", v.name, y);
        var I = y.pop();
        typeof I == "function" && I.call(null, E);
      } else {
        var k = Date.now() - C, O = Math.max(C - R, 1), A = Math.min(O * 1.2, 100);
        k >= A ? (a("RETRY", v.name, y), v.apply(null, y.concat([R]))) : o[u].push(m);
      }
      s === void 0 && (s = setTimeout(g, 0));
    }
  }
  return ii;
}
var ud;
function xr() {
  return ud || (ud = 1, (function(o) {
    const d = _t().fromCallback, p = yt(), c = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((h) => typeof p[h] == "function");
    Object.assign(o, p), c.forEach((h) => {
      o[h] = d(p[h]);
    }), o.exists = function(h, u) {
      return typeof u == "function" ? p.exists(h, u) : new Promise((n) => p.exists(h, n));
    }, o.read = function(h, u, n, l, i, a) {
      return typeof a == "function" ? p.read(h, u, n, l, i, a) : new Promise((r, e) => {
        p.read(h, u, n, l, i, (t, s, f) => {
          if (t) return e(t);
          r({ bytesRead: s, buffer: f });
        });
      });
    }, o.write = function(h, u, ...n) {
      return typeof n[n.length - 1] == "function" ? p.write(h, u, ...n) : new Promise((l, i) => {
        p.write(h, u, ...n, (a, r, e) => {
          if (a) return i(a);
          l({ bytesWritten: r, buffer: e });
        });
      });
    }, typeof p.writev == "function" && (o.writev = function(h, u, ...n) {
      return typeof n[n.length - 1] == "function" ? p.writev(h, u, ...n) : new Promise((l, i) => {
        p.writev(h, u, ...n, (a, r, e) => {
          if (a) return i(a);
          l({ bytesWritten: r, buffers: e });
        });
      });
    }), typeof p.realpath.native == "function" ? o.realpath.native = d(p.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(ks)), ks;
}
var ai = {}, Ps = {}, cd;
function $v() {
  if (cd) return Ps;
  cd = 1;
  const o = Ye;
  return Ps.checkPath = function(p) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(p.replace(o.parse(p).root, ""))) {
      const h = new Error(`Path contains invalid characters: ${p}`);
      throw h.code = "EINVAL", h;
    }
  }, Ps;
}
var fd;
function qv() {
  if (fd) return ai;
  fd = 1;
  const o = /* @__PURE__ */ xr(), { checkPath: d } = /* @__PURE__ */ $v(), p = (c) => {
    const h = { mode: 511 };
    return typeof c == "number" ? c : { ...h, ...c }.mode;
  };
  return ai.makeDir = async (c, h) => (d(c), o.mkdir(c, {
    mode: p(h),
    recursive: !0
  })), ai.makeDirSync = (c, h) => (d(c), o.mkdirSync(c, {
    mode: p(h),
    recursive: !0
  })), ai;
}
var xs, dd;
function Ft() {
  if (dd) return xs;
  dd = 1;
  const o = _t().fromPromise, { makeDir: d, makeDirSync: p } = /* @__PURE__ */ qv(), c = o(d);
  return xs = {
    mkdirs: c,
    mkdirsSync: p,
    // alias
    mkdirp: c,
    mkdirpSync: p,
    ensureDir: c,
    ensureDirSync: p
  }, xs;
}
var Ls, hd;
function pr() {
  if (hd) return Ls;
  hd = 1;
  const o = _t().fromPromise, d = /* @__PURE__ */ xr();
  function p(c) {
    return d.access(c).then(() => !0).catch(() => !1);
  }
  return Ls = {
    pathExists: o(p),
    pathExistsSync: d.existsSync
  }, Ls;
}
var Fs, pd;
function sg() {
  if (pd) return Fs;
  pd = 1;
  const o = yt();
  function d(c, h, u, n) {
    o.open(c, "r+", (l, i) => {
      if (l) return n(l);
      o.futimes(i, h, u, (a) => {
        o.close(i, (r) => {
          n && n(a || r);
        });
      });
    });
  }
  function p(c, h, u) {
    const n = o.openSync(c, "r+");
    return o.futimesSync(n, h, u), o.closeSync(n);
  }
  return Fs = {
    utimesMillis: d,
    utimesMillisSync: p
  }, Fs;
}
var Us, md;
function Lr() {
  if (md) return Us;
  md = 1;
  const o = /* @__PURE__ */ xr(), d = Ye, p = Pr;
  function c(t, s, f) {
    const g = f.dereference ? (m) => o.stat(m, { bigint: !0 }) : (m) => o.lstat(m, { bigint: !0 });
    return Promise.all([
      g(t),
      g(s).catch((m) => {
        if (m.code === "ENOENT") return null;
        throw m;
      })
    ]).then(([m, v]) => ({ srcStat: m, destStat: v }));
  }
  function h(t, s, f) {
    let g;
    const m = f.dereference ? (y) => o.statSync(y, { bigint: !0 }) : (y) => o.lstatSync(y, { bigint: !0 }), v = m(t);
    try {
      g = m(s);
    } catch (y) {
      if (y.code === "ENOENT") return { srcStat: v, destStat: null };
      throw y;
    }
    return { srcStat: v, destStat: g };
  }
  function u(t, s, f, g, m) {
    p.callbackify(c)(t, s, g, (v, y) => {
      if (v) return m(v);
      const { srcStat: E, destStat: R } = y;
      if (R) {
        if (a(E, R)) {
          const C = d.basename(t), I = d.basename(s);
          return f === "move" && C !== I && C.toLowerCase() === I.toLowerCase() ? m(null, { srcStat: E, destStat: R, isChangingCase: !0 }) : m(new Error("Source and destination must not be the same."));
        }
        if (E.isDirectory() && !R.isDirectory())
          return m(new Error(`Cannot overwrite non-directory '${s}' with directory '${t}'.`));
        if (!E.isDirectory() && R.isDirectory())
          return m(new Error(`Cannot overwrite directory '${s}' with non-directory '${t}'.`));
      }
      return E.isDirectory() && r(t, s) ? m(new Error(e(t, s, f))) : m(null, { srcStat: E, destStat: R });
    });
  }
  function n(t, s, f, g) {
    const { srcStat: m, destStat: v } = h(t, s, g);
    if (v) {
      if (a(m, v)) {
        const y = d.basename(t), E = d.basename(s);
        if (f === "move" && y !== E && y.toLowerCase() === E.toLowerCase())
          return { srcStat: m, destStat: v, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (m.isDirectory() && !v.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${s}' with directory '${t}'.`);
      if (!m.isDirectory() && v.isDirectory())
        throw new Error(`Cannot overwrite directory '${s}' with non-directory '${t}'.`);
    }
    if (m.isDirectory() && r(t, s))
      throw new Error(e(t, s, f));
    return { srcStat: m, destStat: v };
  }
  function l(t, s, f, g, m) {
    const v = d.resolve(d.dirname(t)), y = d.resolve(d.dirname(f));
    if (y === v || y === d.parse(y).root) return m();
    o.stat(y, { bigint: !0 }, (E, R) => E ? E.code === "ENOENT" ? m() : m(E) : a(s, R) ? m(new Error(e(t, f, g))) : l(t, s, y, g, m));
  }
  function i(t, s, f, g) {
    const m = d.resolve(d.dirname(t)), v = d.resolve(d.dirname(f));
    if (v === m || v === d.parse(v).root) return;
    let y;
    try {
      y = o.statSync(v, { bigint: !0 });
    } catch (E) {
      if (E.code === "ENOENT") return;
      throw E;
    }
    if (a(s, y))
      throw new Error(e(t, f, g));
    return i(t, s, v, g);
  }
  function a(t, s) {
    return s.ino && s.dev && s.ino === t.ino && s.dev === t.dev;
  }
  function r(t, s) {
    const f = d.resolve(t).split(d.sep).filter((m) => m), g = d.resolve(s).split(d.sep).filter((m) => m);
    return f.reduce((m, v, y) => m && g[y] === v, !0);
  }
  function e(t, s, f) {
    return `Cannot ${f} '${t}' to a subdirectory of itself, '${s}'.`;
  }
  return Us = {
    checkPaths: u,
    checkPathsSync: n,
    checkParentPaths: l,
    checkParentPathsSync: i,
    isSrcSubdir: r,
    areIdentical: a
  }, Us;
}
var $s, gd;
function Mv() {
  if (gd) return $s;
  gd = 1;
  const o = yt(), d = Ye, p = Ft().mkdirs, c = pr().pathExists, h = sg().utimesMillis, u = /* @__PURE__ */ Lr();
  function n(z, U, j, B) {
    typeof j == "function" && !B ? (B = j, j = {}) : typeof j == "function" && (j = { filter: j }), B = B || function() {
    }, j = j || {}, j.clobber = "clobber" in j ? !!j.clobber : !0, j.overwrite = "overwrite" in j ? !!j.overwrite : j.clobber, j.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), u.checkPaths(z, U, "copy", j, (H, te) => {
      if (H) return B(H);
      const { srcStat: N, destStat: F } = te;
      u.checkParentPaths(z, N, U, "copy", (G) => G ? B(G) : j.filter ? i(l, F, z, U, j, B) : l(F, z, U, j, B));
    });
  }
  function l(z, U, j, B, H) {
    const te = d.dirname(j);
    c(te, (N, F) => {
      if (N) return H(N);
      if (F) return r(z, U, j, B, H);
      p(te, (G) => G ? H(G) : r(z, U, j, B, H));
    });
  }
  function i(z, U, j, B, H, te) {
    Promise.resolve(H.filter(j, B)).then((N) => N ? z(U, j, B, H, te) : te(), (N) => te(N));
  }
  function a(z, U, j, B, H) {
    return B.filter ? i(r, z, U, j, B, H) : r(z, U, j, B, H);
  }
  function r(z, U, j, B, H) {
    (B.dereference ? o.stat : o.lstat)(U, (N, F) => N ? H(N) : F.isDirectory() ? R(F, z, U, j, B, H) : F.isFile() || F.isCharacterDevice() || F.isBlockDevice() ? e(F, z, U, j, B, H) : F.isSymbolicLink() ? A(z, U, j, B, H) : F.isSocket() ? H(new Error(`Cannot copy a socket file: ${U}`)) : F.isFIFO() ? H(new Error(`Cannot copy a FIFO pipe: ${U}`)) : H(new Error(`Unknown file: ${U}`)));
  }
  function e(z, U, j, B, H, te) {
    return U ? t(z, j, B, H, te) : s(z, j, B, H, te);
  }
  function t(z, U, j, B, H) {
    if (B.overwrite)
      o.unlink(j, (te) => te ? H(te) : s(z, U, j, B, H));
    else return B.errorOnExist ? H(new Error(`'${j}' already exists`)) : H();
  }
  function s(z, U, j, B, H) {
    o.copyFile(U, j, (te) => te ? H(te) : B.preserveTimestamps ? f(z.mode, U, j, H) : y(j, z.mode, H));
  }
  function f(z, U, j, B) {
    return g(z) ? m(j, z, (H) => H ? B(H) : v(z, U, j, B)) : v(z, U, j, B);
  }
  function g(z) {
    return (z & 128) === 0;
  }
  function m(z, U, j) {
    return y(z, U | 128, j);
  }
  function v(z, U, j, B) {
    E(U, j, (H) => H ? B(H) : y(j, z, B));
  }
  function y(z, U, j) {
    return o.chmod(z, U, j);
  }
  function E(z, U, j) {
    o.stat(z, (B, H) => B ? j(B) : h(U, H.atime, H.mtime, j));
  }
  function R(z, U, j, B, H, te) {
    return U ? I(j, B, H, te) : C(z.mode, j, B, H, te);
  }
  function C(z, U, j, B, H) {
    o.mkdir(j, (te) => {
      if (te) return H(te);
      I(U, j, B, (N) => N ? H(N) : y(j, z, H));
    });
  }
  function I(z, U, j, B) {
    o.readdir(z, (H, te) => H ? B(H) : k(te, z, U, j, B));
  }
  function k(z, U, j, B, H) {
    const te = z.pop();
    return te ? O(z, te, U, j, B, H) : H();
  }
  function O(z, U, j, B, H, te) {
    const N = d.join(j, U), F = d.join(B, U);
    u.checkPaths(N, F, "copy", H, (G, Q) => {
      if (G) return te(G);
      const { destStat: ce } = Q;
      a(ce, N, F, H, (ae) => ae ? te(ae) : k(z, j, B, H, te));
    });
  }
  function A(z, U, j, B, H) {
    o.readlink(U, (te, N) => {
      if (te) return H(te);
      if (B.dereference && (N = d.resolve(process.cwd(), N)), z)
        o.readlink(j, (F, G) => F ? F.code === "EINVAL" || F.code === "UNKNOWN" ? o.symlink(N, j, H) : H(F) : (B.dereference && (G = d.resolve(process.cwd(), G)), u.isSrcSubdir(N, G) ? H(new Error(`Cannot copy '${N}' to a subdirectory of itself, '${G}'.`)) : z.isDirectory() && u.isSrcSubdir(G, N) ? H(new Error(`Cannot overwrite '${G}' with '${N}'.`)) : M(N, j, H)));
      else
        return o.symlink(N, j, H);
    });
  }
  function M(z, U, j) {
    o.unlink(U, (B) => B ? j(B) : o.symlink(z, U, j));
  }
  return $s = n, $s;
}
var qs, vd;
function Bv() {
  if (vd) return qs;
  vd = 1;
  const o = yt(), d = Ye, p = Ft().mkdirsSync, c = sg().utimesMillisSync, h = /* @__PURE__ */ Lr();
  function u(k, O, A) {
    typeof A == "function" && (A = { filter: A }), A = A || {}, A.clobber = "clobber" in A ? !!A.clobber : !0, A.overwrite = "overwrite" in A ? !!A.overwrite : A.clobber, A.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: M, destStat: z } = h.checkPathsSync(k, O, "copy", A);
    return h.checkParentPathsSync(k, M, O, "copy"), n(z, k, O, A);
  }
  function n(k, O, A, M) {
    if (M.filter && !M.filter(O, A)) return;
    const z = d.dirname(A);
    return o.existsSync(z) || p(z), i(k, O, A, M);
  }
  function l(k, O, A, M) {
    if (!(M.filter && !M.filter(O, A)))
      return i(k, O, A, M);
  }
  function i(k, O, A, M) {
    const U = (M.dereference ? o.statSync : o.lstatSync)(O);
    if (U.isDirectory()) return v(U, k, O, A, M);
    if (U.isFile() || U.isCharacterDevice() || U.isBlockDevice()) return a(U, k, O, A, M);
    if (U.isSymbolicLink()) return C(k, O, A, M);
    throw U.isSocket() ? new Error(`Cannot copy a socket file: ${O}`) : U.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${O}`) : new Error(`Unknown file: ${O}`);
  }
  function a(k, O, A, M, z) {
    return O ? r(k, A, M, z) : e(k, A, M, z);
  }
  function r(k, O, A, M) {
    if (M.overwrite)
      return o.unlinkSync(A), e(k, O, A, M);
    if (M.errorOnExist)
      throw new Error(`'${A}' already exists`);
  }
  function e(k, O, A, M) {
    return o.copyFileSync(O, A), M.preserveTimestamps && t(k.mode, O, A), g(A, k.mode);
  }
  function t(k, O, A) {
    return s(k) && f(A, k), m(O, A);
  }
  function s(k) {
    return (k & 128) === 0;
  }
  function f(k, O) {
    return g(k, O | 128);
  }
  function g(k, O) {
    return o.chmodSync(k, O);
  }
  function m(k, O) {
    const A = o.statSync(k);
    return c(O, A.atime, A.mtime);
  }
  function v(k, O, A, M, z) {
    return O ? E(A, M, z) : y(k.mode, A, M, z);
  }
  function y(k, O, A, M) {
    return o.mkdirSync(A), E(O, A, M), g(A, k);
  }
  function E(k, O, A) {
    o.readdirSync(k).forEach((M) => R(M, k, O, A));
  }
  function R(k, O, A, M) {
    const z = d.join(O, k), U = d.join(A, k), { destStat: j } = h.checkPathsSync(z, U, "copy", M);
    return l(j, z, U, M);
  }
  function C(k, O, A, M) {
    let z = o.readlinkSync(O);
    if (M.dereference && (z = d.resolve(process.cwd(), z)), k) {
      let U;
      try {
        U = o.readlinkSync(A);
      } catch (j) {
        if (j.code === "EINVAL" || j.code === "UNKNOWN") return o.symlinkSync(z, A);
        throw j;
      }
      if (M.dereference && (U = d.resolve(process.cwd(), U)), h.isSrcSubdir(z, U))
        throw new Error(`Cannot copy '${z}' to a subdirectory of itself, '${U}'.`);
      if (o.statSync(A).isDirectory() && h.isSrcSubdir(U, z))
        throw new Error(`Cannot overwrite '${U}' with '${z}'.`);
      return I(z, A);
    } else
      return o.symlinkSync(z, A);
  }
  function I(k, O) {
    return o.unlinkSync(O), o.symlinkSync(k, O);
  }
  return qs = u, qs;
}
var Ms, yd;
function Yl() {
  if (yd) return Ms;
  yd = 1;
  const o = _t().fromCallback;
  return Ms = {
    copy: o(/* @__PURE__ */ Mv()),
    copySync: /* @__PURE__ */ Bv()
  }, Ms;
}
var Bs, wd;
function jv() {
  if (wd) return Bs;
  wd = 1;
  const o = yt(), d = Ye, p = cm, c = process.platform === "win32";
  function h(f) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((m) => {
      f[m] = f[m] || o[m], m = m + "Sync", f[m] = f[m] || o[m];
    }), f.maxBusyTries = f.maxBusyTries || 3;
  }
  function u(f, g, m) {
    let v = 0;
    typeof g == "function" && (m = g, g = {}), p(f, "rimraf: missing path"), p.strictEqual(typeof f, "string", "rimraf: path should be a string"), p.strictEqual(typeof m, "function", "rimraf: callback function required"), p(g, "rimraf: invalid options argument provided"), p.strictEqual(typeof g, "object", "rimraf: options should be object"), h(g), n(f, g, function y(E) {
      if (E) {
        if ((E.code === "EBUSY" || E.code === "ENOTEMPTY" || E.code === "EPERM") && v < g.maxBusyTries) {
          v++;
          const R = v * 100;
          return setTimeout(() => n(f, g, y), R);
        }
        E.code === "ENOENT" && (E = null);
      }
      m(E);
    });
  }
  function n(f, g, m) {
    p(f), p(g), p(typeof m == "function"), g.lstat(f, (v, y) => {
      if (v && v.code === "ENOENT")
        return m(null);
      if (v && v.code === "EPERM" && c)
        return l(f, g, v, m);
      if (y && y.isDirectory())
        return a(f, g, v, m);
      g.unlink(f, (E) => {
        if (E) {
          if (E.code === "ENOENT")
            return m(null);
          if (E.code === "EPERM")
            return c ? l(f, g, E, m) : a(f, g, E, m);
          if (E.code === "EISDIR")
            return a(f, g, E, m);
        }
        return m(E);
      });
    });
  }
  function l(f, g, m, v) {
    p(f), p(g), p(typeof v == "function"), g.chmod(f, 438, (y) => {
      y ? v(y.code === "ENOENT" ? null : m) : g.stat(f, (E, R) => {
        E ? v(E.code === "ENOENT" ? null : m) : R.isDirectory() ? a(f, g, m, v) : g.unlink(f, v);
      });
    });
  }
  function i(f, g, m) {
    let v;
    p(f), p(g);
    try {
      g.chmodSync(f, 438);
    } catch (y) {
      if (y.code === "ENOENT")
        return;
      throw m;
    }
    try {
      v = g.statSync(f);
    } catch (y) {
      if (y.code === "ENOENT")
        return;
      throw m;
    }
    v.isDirectory() ? t(f, g, m) : g.unlinkSync(f);
  }
  function a(f, g, m, v) {
    p(f), p(g), p(typeof v == "function"), g.rmdir(f, (y) => {
      y && (y.code === "ENOTEMPTY" || y.code === "EEXIST" || y.code === "EPERM") ? r(f, g, v) : y && y.code === "ENOTDIR" ? v(m) : v(y);
    });
  }
  function r(f, g, m) {
    p(f), p(g), p(typeof m == "function"), g.readdir(f, (v, y) => {
      if (v) return m(v);
      let E = y.length, R;
      if (E === 0) return g.rmdir(f, m);
      y.forEach((C) => {
        u(d.join(f, C), g, (I) => {
          if (!R) {
            if (I) return m(R = I);
            --E === 0 && g.rmdir(f, m);
          }
        });
      });
    });
  }
  function e(f, g) {
    let m;
    g = g || {}, h(g), p(f, "rimraf: missing path"), p.strictEqual(typeof f, "string", "rimraf: path should be a string"), p(g, "rimraf: missing options"), p.strictEqual(typeof g, "object", "rimraf: options should be object");
    try {
      m = g.lstatSync(f);
    } catch (v) {
      if (v.code === "ENOENT")
        return;
      v.code === "EPERM" && c && i(f, g, v);
    }
    try {
      m && m.isDirectory() ? t(f, g, null) : g.unlinkSync(f);
    } catch (v) {
      if (v.code === "ENOENT")
        return;
      if (v.code === "EPERM")
        return c ? i(f, g, v) : t(f, g, v);
      if (v.code !== "EISDIR")
        throw v;
      t(f, g, v);
    }
  }
  function t(f, g, m) {
    p(f), p(g);
    try {
      g.rmdirSync(f);
    } catch (v) {
      if (v.code === "ENOTDIR")
        throw m;
      if (v.code === "ENOTEMPTY" || v.code === "EEXIST" || v.code === "EPERM")
        s(f, g);
      else if (v.code !== "ENOENT")
        throw v;
    }
  }
  function s(f, g) {
    if (p(f), p(g), g.readdirSync(f).forEach((m) => e(d.join(f, m), g)), c) {
      const m = Date.now();
      do
        try {
          return g.rmdirSync(f, g);
        } catch {
        }
      while (Date.now() - m < 500);
    } else
      return g.rmdirSync(f, g);
  }
  return Bs = u, u.sync = e, Bs;
}
var js, _d;
function Ii() {
  if (_d) return js;
  _d = 1;
  const o = yt(), d = _t().fromCallback, p = /* @__PURE__ */ jv();
  function c(u, n) {
    if (o.rm) return o.rm(u, { recursive: !0, force: !0 }, n);
    p(u, n);
  }
  function h(u) {
    if (o.rmSync) return o.rmSync(u, { recursive: !0, force: !0 });
    p.sync(u);
  }
  return js = {
    remove: d(c),
    removeSync: h
  }, js;
}
var Hs, bd;
function Hv() {
  if (bd) return Hs;
  bd = 1;
  const o = _t().fromPromise, d = /* @__PURE__ */ xr(), p = Ye, c = /* @__PURE__ */ Ft(), h = /* @__PURE__ */ Ii(), u = o(async function(i) {
    let a;
    try {
      a = await d.readdir(i);
    } catch {
      return c.mkdirs(i);
    }
    return Promise.all(a.map((r) => h.remove(p.join(i, r))));
  });
  function n(l) {
    let i;
    try {
      i = d.readdirSync(l);
    } catch {
      return c.mkdirsSync(l);
    }
    i.forEach((a) => {
      a = p.join(l, a), h.removeSync(a);
    });
  }
  return Hs = {
    emptyDirSync: n,
    emptydirSync: n,
    emptyDir: u,
    emptydir: u
  }, Hs;
}
var zs, Ed;
function zv() {
  if (Ed) return zs;
  Ed = 1;
  const o = _t().fromCallback, d = Ye, p = yt(), c = /* @__PURE__ */ Ft();
  function h(n, l) {
    function i() {
      p.writeFile(n, "", (a) => {
        if (a) return l(a);
        l();
      });
    }
    p.stat(n, (a, r) => {
      if (!a && r.isFile()) return l();
      const e = d.dirname(n);
      p.stat(e, (t, s) => {
        if (t)
          return t.code === "ENOENT" ? c.mkdirs(e, (f) => {
            if (f) return l(f);
            i();
          }) : l(t);
        s.isDirectory() ? i() : p.readdir(e, (f) => {
          if (f) return l(f);
        });
      });
    });
  }
  function u(n) {
    let l;
    try {
      l = p.statSync(n);
    } catch {
    }
    if (l && l.isFile()) return;
    const i = d.dirname(n);
    try {
      p.statSync(i).isDirectory() || p.readdirSync(i);
    } catch (a) {
      if (a && a.code === "ENOENT") c.mkdirsSync(i);
      else throw a;
    }
    p.writeFileSync(n, "");
  }
  return zs = {
    createFile: o(h),
    createFileSync: u
  }, zs;
}
var Gs, Sd;
function Gv() {
  if (Sd) return Gs;
  Sd = 1;
  const o = _t().fromCallback, d = Ye, p = yt(), c = /* @__PURE__ */ Ft(), h = pr().pathExists, { areIdentical: u } = /* @__PURE__ */ Lr();
  function n(i, a, r) {
    function e(t, s) {
      p.link(t, s, (f) => {
        if (f) return r(f);
        r(null);
      });
    }
    p.lstat(a, (t, s) => {
      p.lstat(i, (f, g) => {
        if (f)
          return f.message = f.message.replace("lstat", "ensureLink"), r(f);
        if (s && u(g, s)) return r(null);
        const m = d.dirname(a);
        h(m, (v, y) => {
          if (v) return r(v);
          if (y) return e(i, a);
          c.mkdirs(m, (E) => {
            if (E) return r(E);
            e(i, a);
          });
        });
      });
    });
  }
  function l(i, a) {
    let r;
    try {
      r = p.lstatSync(a);
    } catch {
    }
    try {
      const s = p.lstatSync(i);
      if (r && u(s, r)) return;
    } catch (s) {
      throw s.message = s.message.replace("lstat", "ensureLink"), s;
    }
    const e = d.dirname(a);
    return p.existsSync(e) || c.mkdirsSync(e), p.linkSync(i, a);
  }
  return Gs = {
    createLink: o(n),
    createLinkSync: l
  }, Gs;
}
var Ws, Ad;
function Wv() {
  if (Ad) return Ws;
  Ad = 1;
  const o = Ye, d = yt(), p = pr().pathExists;
  function c(u, n, l) {
    if (o.isAbsolute(u))
      return d.lstat(u, (i) => i ? (i.message = i.message.replace("lstat", "ensureSymlink"), l(i)) : l(null, {
        toCwd: u,
        toDst: u
      }));
    {
      const i = o.dirname(n), a = o.join(i, u);
      return p(a, (r, e) => r ? l(r) : e ? l(null, {
        toCwd: a,
        toDst: u
      }) : d.lstat(u, (t) => t ? (t.message = t.message.replace("lstat", "ensureSymlink"), l(t)) : l(null, {
        toCwd: u,
        toDst: o.relative(i, u)
      })));
    }
  }
  function h(u, n) {
    let l;
    if (o.isAbsolute(u)) {
      if (l = d.existsSync(u), !l) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: u,
        toDst: u
      };
    } else {
      const i = o.dirname(n), a = o.join(i, u);
      if (l = d.existsSync(a), l)
        return {
          toCwd: a,
          toDst: u
        };
      if (l = d.existsSync(u), !l) throw new Error("relative srcpath does not exist");
      return {
        toCwd: u,
        toDst: o.relative(i, u)
      };
    }
  }
  return Ws = {
    symlinkPaths: c,
    symlinkPathsSync: h
  }, Ws;
}
var Ys, Cd;
function Yv() {
  if (Cd) return Ys;
  Cd = 1;
  const o = yt();
  function d(c, h, u) {
    if (u = typeof h == "function" ? h : u, h = typeof h == "function" ? !1 : h, h) return u(null, h);
    o.lstat(c, (n, l) => {
      if (n) return u(null, "file");
      h = l && l.isDirectory() ? "dir" : "file", u(null, h);
    });
  }
  function p(c, h) {
    let u;
    if (h) return h;
    try {
      u = o.lstatSync(c);
    } catch {
      return "file";
    }
    return u && u.isDirectory() ? "dir" : "file";
  }
  return Ys = {
    symlinkType: d,
    symlinkTypeSync: p
  }, Ys;
}
var Ks, Rd;
function Kv() {
  if (Rd) return Ks;
  Rd = 1;
  const o = _t().fromCallback, d = Ye, p = /* @__PURE__ */ xr(), c = /* @__PURE__ */ Ft(), h = c.mkdirs, u = c.mkdirsSync, n = /* @__PURE__ */ Wv(), l = n.symlinkPaths, i = n.symlinkPathsSync, a = /* @__PURE__ */ Yv(), r = a.symlinkType, e = a.symlinkTypeSync, t = pr().pathExists, { areIdentical: s } = /* @__PURE__ */ Lr();
  function f(v, y, E, R) {
    R = typeof E == "function" ? E : R, E = typeof E == "function" ? !1 : E, p.lstat(y, (C, I) => {
      !C && I.isSymbolicLink() ? Promise.all([
        p.stat(v),
        p.stat(y)
      ]).then(([k, O]) => {
        if (s(k, O)) return R(null);
        g(v, y, E, R);
      }) : g(v, y, E, R);
    });
  }
  function g(v, y, E, R) {
    l(v, y, (C, I) => {
      if (C) return R(C);
      v = I.toDst, r(I.toCwd, E, (k, O) => {
        if (k) return R(k);
        const A = d.dirname(y);
        t(A, (M, z) => {
          if (M) return R(M);
          if (z) return p.symlink(v, y, O, R);
          h(A, (U) => {
            if (U) return R(U);
            p.symlink(v, y, O, R);
          });
        });
      });
    });
  }
  function m(v, y, E) {
    let R;
    try {
      R = p.lstatSync(y);
    } catch {
    }
    if (R && R.isSymbolicLink()) {
      const O = p.statSync(v), A = p.statSync(y);
      if (s(O, A)) return;
    }
    const C = i(v, y);
    v = C.toDst, E = e(C.toCwd, E);
    const I = d.dirname(y);
    return p.existsSync(I) || u(I), p.symlinkSync(v, y, E);
  }
  return Ks = {
    createSymlink: o(f),
    createSymlinkSync: m
  }, Ks;
}
var Vs, Td;
function Vv() {
  if (Td) return Vs;
  Td = 1;
  const { createFile: o, createFileSync: d } = /* @__PURE__ */ zv(), { createLink: p, createLinkSync: c } = /* @__PURE__ */ Gv(), { createSymlink: h, createSymlinkSync: u } = /* @__PURE__ */ Kv();
  return Vs = {
    // file
    createFile: o,
    createFileSync: d,
    ensureFile: o,
    ensureFileSync: d,
    // link
    createLink: p,
    createLinkSync: c,
    ensureLink: p,
    ensureLinkSync: c,
    // symlink
    createSymlink: h,
    createSymlinkSync: u,
    ensureSymlink: h,
    ensureSymlinkSync: u
  }, Vs;
}
var Js, Od;
function Kl() {
  if (Od) return Js;
  Od = 1;
  function o(p, { EOL: c = `
`, finalEOL: h = !0, replacer: u = null, spaces: n } = {}) {
    const l = h ? c : "", i = JSON.stringify(p, u, n);
    if (i === void 0)
      throw new TypeError(`Converting ${typeof p} value to JSON is not supported`);
    return i.replace(/\n/g, c) + l;
  }
  function d(p) {
    return Buffer.isBuffer(p) && (p = p.toString("utf8")), p.replace(/^\uFEFF/, "");
  }
  return Js = { stringify: o, stripBom: d }, Js;
}
var Zs, kd;
function Jv() {
  if (kd) return Zs;
  kd = 1;
  let o;
  try {
    o = yt();
  } catch {
    o = Kt;
  }
  const d = _t(), { stringify: p, stripBom: c } = Kl();
  async function h(r, e = {}) {
    typeof e == "string" && (e = { encoding: e });
    const t = e.fs || o, s = "throws" in e ? e.throws : !0;
    let f = await d.fromCallback(t.readFile)(r, e);
    f = c(f);
    let g;
    try {
      g = JSON.parse(f, e ? e.reviver : null);
    } catch (m) {
      if (s)
        throw m.message = `${r}: ${m.message}`, m;
      return null;
    }
    return g;
  }
  const u = d.fromPromise(h);
  function n(r, e = {}) {
    typeof e == "string" && (e = { encoding: e });
    const t = e.fs || o, s = "throws" in e ? e.throws : !0;
    try {
      let f = t.readFileSync(r, e);
      return f = c(f), JSON.parse(f, e.reviver);
    } catch (f) {
      if (s)
        throw f.message = `${r}: ${f.message}`, f;
      return null;
    }
  }
  async function l(r, e, t = {}) {
    const s = t.fs || o, f = p(e, t);
    await d.fromCallback(s.writeFile)(r, f, t);
  }
  const i = d.fromPromise(l);
  function a(r, e, t = {}) {
    const s = t.fs || o, f = p(e, t);
    return s.writeFileSync(r, f, t);
  }
  return Zs = {
    readFile: u,
    readFileSync: n,
    writeFile: i,
    writeFileSync: a
  }, Zs;
}
var Xs, Nd;
function Zv() {
  if (Nd) return Xs;
  Nd = 1;
  const o = Jv();
  return Xs = {
    // jsonfile exports
    readJson: o.readFile,
    readJsonSync: o.readFileSync,
    writeJson: o.writeFile,
    writeJsonSync: o.writeFileSync
  }, Xs;
}
var Qs, Id;
function Vl() {
  if (Id) return Qs;
  Id = 1;
  const o = _t().fromCallback, d = yt(), p = Ye, c = /* @__PURE__ */ Ft(), h = pr().pathExists;
  function u(l, i, a, r) {
    typeof a == "function" && (r = a, a = "utf8");
    const e = p.dirname(l);
    h(e, (t, s) => {
      if (t) return r(t);
      if (s) return d.writeFile(l, i, a, r);
      c.mkdirs(e, (f) => {
        if (f) return r(f);
        d.writeFile(l, i, a, r);
      });
    });
  }
  function n(l, ...i) {
    const a = p.dirname(l);
    if (d.existsSync(a))
      return d.writeFileSync(l, ...i);
    c.mkdirsSync(a), d.writeFileSync(l, ...i);
  }
  return Qs = {
    outputFile: o(u),
    outputFileSync: n
  }, Qs;
}
var eo, Dd;
function Xv() {
  if (Dd) return eo;
  Dd = 1;
  const { stringify: o } = Kl(), { outputFile: d } = /* @__PURE__ */ Vl();
  async function p(c, h, u = {}) {
    const n = o(h, u);
    await d(c, n, u);
  }
  return eo = p, eo;
}
var to, Pd;
function Qv() {
  if (Pd) return to;
  Pd = 1;
  const { stringify: o } = Kl(), { outputFileSync: d } = /* @__PURE__ */ Vl();
  function p(c, h, u) {
    const n = o(h, u);
    d(c, n, u);
  }
  return to = p, to;
}
var ro, xd;
function ey() {
  if (xd) return ro;
  xd = 1;
  const o = _t().fromPromise, d = /* @__PURE__ */ Zv();
  return d.outputJson = o(/* @__PURE__ */ Xv()), d.outputJsonSync = /* @__PURE__ */ Qv(), d.outputJSON = d.outputJson, d.outputJSONSync = d.outputJsonSync, d.writeJSON = d.writeJson, d.writeJSONSync = d.writeJsonSync, d.readJSON = d.readJson, d.readJSONSync = d.readJsonSync, ro = d, ro;
}
var no, Ld;
function ty() {
  if (Ld) return no;
  Ld = 1;
  const o = yt(), d = Ye, p = Yl().copy, c = Ii().remove, h = Ft().mkdirp, u = pr().pathExists, n = /* @__PURE__ */ Lr();
  function l(t, s, f, g) {
    typeof f == "function" && (g = f, f = {}), f = f || {};
    const m = f.overwrite || f.clobber || !1;
    n.checkPaths(t, s, "move", f, (v, y) => {
      if (v) return g(v);
      const { srcStat: E, isChangingCase: R = !1 } = y;
      n.checkParentPaths(t, E, s, "move", (C) => {
        if (C) return g(C);
        if (i(s)) return a(t, s, m, R, g);
        h(d.dirname(s), (I) => I ? g(I) : a(t, s, m, R, g));
      });
    });
  }
  function i(t) {
    const s = d.dirname(t);
    return d.parse(s).root === s;
  }
  function a(t, s, f, g, m) {
    if (g) return r(t, s, f, m);
    if (f)
      return c(s, (v) => v ? m(v) : r(t, s, f, m));
    u(s, (v, y) => v ? m(v) : y ? m(new Error("dest already exists.")) : r(t, s, f, m));
  }
  function r(t, s, f, g) {
    o.rename(t, s, (m) => m ? m.code !== "EXDEV" ? g(m) : e(t, s, f, g) : g());
  }
  function e(t, s, f, g) {
    p(t, s, {
      overwrite: f,
      errorOnExist: !0
    }, (v) => v ? g(v) : c(t, g));
  }
  return no = l, no;
}
var io, Fd;
function ry() {
  if (Fd) return io;
  Fd = 1;
  const o = yt(), d = Ye, p = Yl().copySync, c = Ii().removeSync, h = Ft().mkdirpSync, u = /* @__PURE__ */ Lr();
  function n(e, t, s) {
    s = s || {};
    const f = s.overwrite || s.clobber || !1, { srcStat: g, isChangingCase: m = !1 } = u.checkPathsSync(e, t, "move", s);
    return u.checkParentPathsSync(e, g, t, "move"), l(t) || h(d.dirname(t)), i(e, t, f, m);
  }
  function l(e) {
    const t = d.dirname(e);
    return d.parse(t).root === t;
  }
  function i(e, t, s, f) {
    if (f) return a(e, t, s);
    if (s)
      return c(t), a(e, t, s);
    if (o.existsSync(t)) throw new Error("dest already exists.");
    return a(e, t, s);
  }
  function a(e, t, s) {
    try {
      o.renameSync(e, t);
    } catch (f) {
      if (f.code !== "EXDEV") throw f;
      return r(e, t, s);
    }
  }
  function r(e, t, s) {
    return p(e, t, {
      overwrite: s,
      errorOnExist: !0
    }), c(e);
  }
  return io = n, io;
}
var ao, Ud;
function ny() {
  if (Ud) return ao;
  Ud = 1;
  const o = _t().fromCallback;
  return ao = {
    move: o(/* @__PURE__ */ ty()),
    moveSync: /* @__PURE__ */ ry()
  }, ao;
}
var so, $d;
function Xt() {
  return $d || ($d = 1, so = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ xr(),
    // Export extra methods:
    .../* @__PURE__ */ Yl(),
    .../* @__PURE__ */ Hv(),
    .../* @__PURE__ */ Vv(),
    .../* @__PURE__ */ ey(),
    .../* @__PURE__ */ Ft(),
    .../* @__PURE__ */ ny(),
    .../* @__PURE__ */ Vl(),
    .../* @__PURE__ */ pr(),
    .../* @__PURE__ */ Ii()
  }), so;
}
var Vr = {}, ar = {}, oo = {}, sr = {}, qd;
function Jl() {
  if (qd) return sr;
  qd = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.CancellationError = sr.CancellationToken = void 0;
  const o = Ll;
  let d = class extends o.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(h) {
      this.removeParentCancelHandler(), this._parent = h, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(h) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, h != null && (this.parent = h);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(h) {
      this.cancelled ? h() : this.once("cancel", h);
    }
    createPromise(h) {
      if (this.cancelled)
        return Promise.reject(new p());
      const u = () => {
        if (n != null)
          try {
            this.removeListener("cancel", n), n = null;
          } catch {
          }
      };
      let n = null;
      return new Promise((l, i) => {
        let a = null;
        if (n = () => {
          try {
            a != null && (a(), a = null);
          } finally {
            i(new p());
          }
        }, this.cancelled) {
          n();
          return;
        }
        this.onCancel(n), h(l, i, (r) => {
          a = r;
        });
      }).then((l) => (u(), l)).catch((l) => {
        throw u(), l;
      });
    }
    removeParentCancelHandler() {
      const h = this._parent;
      h != null && this.parentCancelHandler != null && (h.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  sr.CancellationToken = d;
  class p extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return sr.CancellationError = p, sr;
}
var si = {}, Md;
function Di() {
  if (Md) return si;
  Md = 1, Object.defineProperty(si, "__esModule", { value: !0 }), si.newError = o;
  function o(d, p) {
    const c = new Error(d);
    return c.code = p, c;
  }
  return si;
}
var ft = {}, oi = { exports: {} }, li = { exports: {} }, lo, Bd;
function iy() {
  if (Bd) return lo;
  Bd = 1;
  var o = 1e3, d = o * 60, p = d * 60, c = p * 24, h = c * 7, u = c * 365.25;
  lo = function(r, e) {
    e = e || {};
    var t = typeof r;
    if (t === "string" && r.length > 0)
      return n(r);
    if (t === "number" && isFinite(r))
      return e.long ? i(r) : l(r);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(r)
    );
  };
  function n(r) {
    if (r = String(r), !(r.length > 100)) {
      var e = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        r
      );
      if (e) {
        var t = parseFloat(e[1]), s = (e[2] || "ms").toLowerCase();
        switch (s) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return t * u;
          case "weeks":
          case "week":
          case "w":
            return t * h;
          case "days":
          case "day":
          case "d":
            return t * c;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return t * p;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return t * d;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return t * o;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return t;
          default:
            return;
        }
      }
    }
  }
  function l(r) {
    var e = Math.abs(r);
    return e >= c ? Math.round(r / c) + "d" : e >= p ? Math.round(r / p) + "h" : e >= d ? Math.round(r / d) + "m" : e >= o ? Math.round(r / o) + "s" : r + "ms";
  }
  function i(r) {
    var e = Math.abs(r);
    return e >= c ? a(r, e, c, "day") : e >= p ? a(r, e, p, "hour") : e >= d ? a(r, e, d, "minute") : e >= o ? a(r, e, o, "second") : r + " ms";
  }
  function a(r, e, t, s) {
    var f = e >= t * 1.5;
    return Math.round(r / t) + " " + s + (f ? "s" : "");
  }
  return lo;
}
var uo, jd;
function og() {
  if (jd) return uo;
  jd = 1;
  function o(d) {
    c.debug = c, c.default = c, c.coerce = a, c.disable = l, c.enable = u, c.enabled = i, c.humanize = iy(), c.destroy = r, Object.keys(d).forEach((e) => {
      c[e] = d[e];
    }), c.names = [], c.skips = [], c.formatters = {};
    function p(e) {
      let t = 0;
      for (let s = 0; s < e.length; s++)
        t = (t << 5) - t + e.charCodeAt(s), t |= 0;
      return c.colors[Math.abs(t) % c.colors.length];
    }
    c.selectColor = p;
    function c(e) {
      let t, s = null, f, g;
      function m(...v) {
        if (!m.enabled)
          return;
        const y = m, E = Number(/* @__PURE__ */ new Date()), R = E - (t || E);
        y.diff = R, y.prev = t, y.curr = E, t = E, v[0] = c.coerce(v[0]), typeof v[0] != "string" && v.unshift("%O");
        let C = 0;
        v[0] = v[0].replace(/%([a-zA-Z%])/g, (k, O) => {
          if (k === "%%")
            return "%";
          C++;
          const A = c.formatters[O];
          if (typeof A == "function") {
            const M = v[C];
            k = A.call(y, M), v.splice(C, 1), C--;
          }
          return k;
        }), c.formatArgs.call(y, v), (y.log || c.log).apply(y, v);
      }
      return m.namespace = e, m.useColors = c.useColors(), m.color = c.selectColor(e), m.extend = h, m.destroy = c.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => s !== null ? s : (f !== c.namespaces && (f = c.namespaces, g = c.enabled(e)), g),
        set: (v) => {
          s = v;
        }
      }), typeof c.init == "function" && c.init(m), m;
    }
    function h(e, t) {
      const s = c(this.namespace + (typeof t > "u" ? ":" : t) + e);
      return s.log = this.log, s;
    }
    function u(e) {
      c.save(e), c.namespaces = e, c.names = [], c.skips = [];
      const t = (typeof e == "string" ? e : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const s of t)
        s[0] === "-" ? c.skips.push(s.slice(1)) : c.names.push(s);
    }
    function n(e, t) {
      let s = 0, f = 0, g = -1, m = 0;
      for (; s < e.length; )
        if (f < t.length && (t[f] === e[s] || t[f] === "*"))
          t[f] === "*" ? (g = f, m = s, f++) : (s++, f++);
        else if (g !== -1)
          f = g + 1, m++, s = m;
        else
          return !1;
      for (; f < t.length && t[f] === "*"; )
        f++;
      return f === t.length;
    }
    function l() {
      const e = [
        ...c.names,
        ...c.skips.map((t) => "-" + t)
      ].join(",");
      return c.enable(""), e;
    }
    function i(e) {
      for (const t of c.skips)
        if (n(e, t))
          return !1;
      for (const t of c.names)
        if (n(e, t))
          return !0;
      return !1;
    }
    function a(e) {
      return e instanceof Error ? e.stack || e.message : e;
    }
    function r() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return c.enable(c.load()), c;
  }
  return uo = o, uo;
}
var Hd;
function ay() {
  return Hd || (Hd = 1, (function(o, d) {
    d.formatArgs = c, d.save = h, d.load = u, d.useColors = p, d.storage = n(), d.destroy = /* @__PURE__ */ (() => {
      let i = !1;
      return () => {
        i || (i = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), d.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function p() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let i;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (i = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(i[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function c(i) {
      if (i[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + i[0] + (this.useColors ? "%c " : " ") + "+" + o.exports.humanize(this.diff), !this.useColors)
        return;
      const a = "color: " + this.color;
      i.splice(1, 0, a, "color: inherit");
      let r = 0, e = 0;
      i[0].replace(/%[a-zA-Z%]/g, (t) => {
        t !== "%%" && (r++, t === "%c" && (e = r));
      }), i.splice(e, 0, a);
    }
    d.log = console.debug || console.log || (() => {
    });
    function h(i) {
      try {
        i ? d.storage.setItem("debug", i) : d.storage.removeItem("debug");
      } catch {
      }
    }
    function u() {
      let i;
      try {
        i = d.storage.getItem("debug") || d.storage.getItem("DEBUG");
      } catch {
      }
      return !i && typeof process < "u" && "env" in process && (i = process.env.DEBUG), i;
    }
    function n() {
      try {
        return localStorage;
      } catch {
      }
    }
    o.exports = og()(d);
    const { formatters: l } = o.exports;
    l.j = function(i) {
      try {
        return JSON.stringify(i);
      } catch (a) {
        return "[UnexpectedJSONParseError]: " + a.message;
      }
    };
  })(li, li.exports)), li.exports;
}
var ui = { exports: {} }, co, zd;
function sy() {
  return zd || (zd = 1, co = (o, d = process.argv) => {
    const p = o.startsWith("-") ? "" : o.length === 1 ? "-" : "--", c = d.indexOf(p + o), h = d.indexOf("--");
    return c !== -1 && (h === -1 || c < h);
  }), co;
}
var fo, Gd;
function oy() {
  if (Gd) return fo;
  Gd = 1;
  const o = vi, d = fm, p = sy(), { env: c } = process;
  let h;
  p("no-color") || p("no-colors") || p("color=false") || p("color=never") ? h = 0 : (p("color") || p("colors") || p("color=true") || p("color=always")) && (h = 1), "FORCE_COLOR" in c && (c.FORCE_COLOR === "true" ? h = 1 : c.FORCE_COLOR === "false" ? h = 0 : h = c.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(c.FORCE_COLOR, 10), 3));
  function u(i) {
    return i === 0 ? !1 : {
      level: i,
      hasBasic: !0,
      has256: i >= 2,
      has16m: i >= 3
    };
  }
  function n(i, a) {
    if (h === 0)
      return 0;
    if (p("color=16m") || p("color=full") || p("color=truecolor"))
      return 3;
    if (p("color=256"))
      return 2;
    if (i && !a && h === void 0)
      return 0;
    const r = h || 0;
    if (c.TERM === "dumb")
      return r;
    if (process.platform === "win32") {
      const e = o.release().split(".");
      return Number(e[0]) >= 10 && Number(e[2]) >= 10586 ? Number(e[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in c)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((e) => e in c) || c.CI_NAME === "codeship" ? 1 : r;
    if ("TEAMCITY_VERSION" in c)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(c.TEAMCITY_VERSION) ? 1 : 0;
    if (c.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in c) {
      const e = parseInt((c.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (c.TERM_PROGRAM) {
        case "iTerm.app":
          return e >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(c.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(c.TERM) || "COLORTERM" in c ? 1 : r;
  }
  function l(i) {
    const a = n(i, i && i.isTTY);
    return u(a);
  }
  return fo = {
    supportsColor: l,
    stdout: u(n(!0, d.isatty(1))),
    stderr: u(n(!0, d.isatty(2)))
  }, fo;
}
var Wd;
function ly() {
  return Wd || (Wd = 1, (function(o, d) {
    const p = fm, c = Pr;
    d.init = r, d.log = l, d.formatArgs = u, d.save = i, d.load = a, d.useColors = h, d.destroy = c.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), d.colors = [6, 2, 3, 4, 5, 1];
    try {
      const t = oy();
      t && (t.stderr || t).level >= 2 && (d.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    d.inspectOpts = Object.keys(process.env).filter((t) => /^debug_/i.test(t)).reduce((t, s) => {
      const f = s.substring(6).toLowerCase().replace(/_([a-z])/g, (m, v) => v.toUpperCase());
      let g = process.env[s];
      return /^(yes|on|true|enabled)$/i.test(g) ? g = !0 : /^(no|off|false|disabled)$/i.test(g) ? g = !1 : g === "null" ? g = null : g = Number(g), t[f] = g, t;
    }, {});
    function h() {
      return "colors" in d.inspectOpts ? !!d.inspectOpts.colors : p.isatty(process.stderr.fd);
    }
    function u(t) {
      const { namespace: s, useColors: f } = this;
      if (f) {
        const g = this.color, m = "\x1B[3" + (g < 8 ? g : "8;5;" + g), v = `  ${m};1m${s} \x1B[0m`;
        t[0] = v + t[0].split(`
`).join(`
` + v), t.push(m + "m+" + o.exports.humanize(this.diff) + "\x1B[0m");
      } else
        t[0] = n() + s + " " + t[0];
    }
    function n() {
      return d.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function l(...t) {
      return process.stderr.write(c.formatWithOptions(d.inspectOpts, ...t) + `
`);
    }
    function i(t) {
      t ? process.env.DEBUG = t : delete process.env.DEBUG;
    }
    function a() {
      return process.env.DEBUG;
    }
    function r(t) {
      t.inspectOpts = {};
      const s = Object.keys(d.inspectOpts);
      for (let f = 0; f < s.length; f++)
        t.inspectOpts[s[f]] = d.inspectOpts[s[f]];
    }
    o.exports = og()(d);
    const { formatters: e } = o.exports;
    e.o = function(t) {
      return this.inspectOpts.colors = this.useColors, c.inspect(t, this.inspectOpts).split(`
`).map((s) => s.trim()).join(" ");
    }, e.O = function(t) {
      return this.inspectOpts.colors = this.useColors, c.inspect(t, this.inspectOpts);
    };
  })(ui, ui.exports)), ui.exports;
}
var Yd;
function uy() {
  return Yd || (Yd = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? oi.exports = ay() : oi.exports = ly()), oi.exports;
}
var Jr = {}, Kd;
function lg() {
  if (Kd) return Jr;
  Kd = 1, Object.defineProperty(Jr, "__esModule", { value: !0 }), Jr.ProgressCallbackTransform = void 0;
  const o = ur;
  let d = class extends o.Transform {
    constructor(c, h, u) {
      super(), this.total = c, this.cancellationToken = h, this.onProgress = u, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(c, h, u) {
      if (this.cancellationToken.cancelled) {
        u(new Error("cancelled"), null);
        return;
      }
      this.transferred += c.length, this.delta += c.length;
      const n = Date.now();
      n >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = n + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((n - this.start) / 1e3))
      }), this.delta = 0), u(null, c);
    }
    _flush(c) {
      if (this.cancellationToken.cancelled) {
        c(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, c(null);
    }
  };
  return Jr.ProgressCallbackTransform = d, Jr;
}
var Vd;
function cy() {
  if (Vd) return ft;
  Vd = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.DigestTransform = ft.HttpExecutor = ft.HttpError = void 0, ft.createHttpError = a, ft.parseJson = t, ft.configureRequestOptionsFromUrl = g, ft.configureRequestUrl = m, ft.safeGetHeader = E, ft.configureRequestOptions = C, ft.safeStringifyJson = I;
  const o = _n, d = uy(), p = Kt, c = ur, h = Vt, u = Jl(), n = Di(), l = lg(), i = (0, d.default)("electron-builder");
  function a(k, O = null) {
    return new e(k.statusCode || -1, `${k.statusCode} ${k.statusMessage}` + (O == null ? "" : `
` + JSON.stringify(O, null, "  ")) + `
Headers: ` + I(k.headers), O);
  }
  const r = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class e extends Error {
    constructor(O, A = `HTTP error: ${r.get(O) || O}`, M = null) {
      super(A), this.statusCode = O, this.description = M, this.name = "HttpError", this.code = `HTTP_ERROR_${O}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  ft.HttpError = e;
  function t(k) {
    return k.then((O) => O == null || O.length === 0 ? null : JSON.parse(O));
  }
  class s {
    constructor() {
      this.maxRedirects = 10;
    }
    request(O, A = new u.CancellationToken(), M) {
      C(O);
      const z = M == null ? void 0 : JSON.stringify(M), U = z ? Buffer.from(z) : void 0;
      if (U != null) {
        i(z);
        const { headers: j, ...B } = O;
        O = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": U.length,
            ...j
          },
          ...B
        };
      }
      return this.doApiRequest(O, A, (j) => j.end(U));
    }
    doApiRequest(O, A, M, z = 0) {
      return i.enabled && i(`Request: ${I(O)}`), A.createPromise((U, j, B) => {
        const H = this.createRequest(O, (te) => {
          try {
            this.handleResponse(te, O, A, U, j, z, M);
          } catch (N) {
            j(N);
          }
        });
        this.addErrorAndTimeoutHandlers(H, j, O.timeout), this.addRedirectHandlers(H, O, j, z, (te) => {
          this.doApiRequest(te, A, M, z).then(U).catch(j);
        }), M(H, j), B(() => H.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(O, A, M, z, U) {
    }
    addErrorAndTimeoutHandlers(O, A, M = 60 * 1e3) {
      this.addTimeOutHandler(O, A, M), O.on("error", A), O.on("aborted", () => {
        A(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(O, A, M, z, U, j, B) {
      var H;
      if (i.enabled && i(`Response: ${O.statusCode} ${O.statusMessage}, request options: ${I(A)}`), O.statusCode === 404) {
        U(a(O, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (O.statusCode === 204) {
        z();
        return;
      }
      const te = (H = O.statusCode) !== null && H !== void 0 ? H : 0, N = te >= 300 && te < 400, F = E(O, "location");
      if (N && F != null) {
        if (j > this.maxRedirects) {
          U(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(s.prepareRedirectUrlOptions(F, A), M, B, j).then(z).catch(U);
        return;
      }
      O.setEncoding("utf8");
      let G = "";
      O.on("error", U), O.on("data", (Q) => G += Q), O.on("end", () => {
        try {
          if (O.statusCode != null && O.statusCode >= 400) {
            const Q = E(O, "content-type"), ce = Q != null && (Array.isArray(Q) ? Q.find((ae) => ae.includes("json")) != null : Q.includes("json"));
            U(a(O, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

          Data:
          ${ce ? JSON.stringify(JSON.parse(G)) : G}
          `));
          } else
            z(G.length === 0 ? null : G);
        } catch (Q) {
          U(Q);
        }
      });
    }
    async downloadToBuffer(O, A) {
      return await A.cancellationToken.createPromise((M, z, U) => {
        const j = [], B = {
          headers: A.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        m(O, B), C(B), this.doDownload(B, {
          destination: null,
          options: A,
          onCancel: U,
          callback: (H) => {
            H == null ? M(Buffer.concat(j)) : z(H);
          },
          responseHandler: (H, te) => {
            let N = 0;
            H.on("data", (F) => {
              if (N += F.length, N > 524288e3) {
                te(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              j.push(F);
            }), H.on("end", () => {
              te(null);
            });
          }
        }, 0);
      });
    }
    doDownload(O, A, M) {
      const z = this.createRequest(O, (U) => {
        if (U.statusCode >= 400) {
          A.callback(new Error(`Cannot download "${O.protocol || "https:"}//${O.hostname}${O.path}", status ${U.statusCode}: ${U.statusMessage}`));
          return;
        }
        U.on("error", A.callback);
        const j = E(U, "location");
        if (j != null) {
          M < this.maxRedirects ? this.doDownload(s.prepareRedirectUrlOptions(j, O), A, M++) : A.callback(this.createMaxRedirectError());
          return;
        }
        A.responseHandler == null ? R(A, U) : A.responseHandler(U, A.callback);
      });
      this.addErrorAndTimeoutHandlers(z, A.callback, O.timeout), this.addRedirectHandlers(z, O, A.callback, M, (U) => {
        this.doDownload(U, A, M++);
      }), z.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(O, A, M) {
      O.on("socket", (z) => {
        z.setTimeout(M, () => {
          O.abort(), A(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(O, A) {
      const M = g(O, { ...A }), z = M.headers;
      if (z != null && z.authorization) {
        const U = s.reconstructOriginalUrl(A), j = f(O, A);
        s.isCrossOriginRedirect(U, j) && (i.enabled && i(`Given the cross-origin redirect (from ${U.host} to ${j.host}), the Authorization header will be stripped out.`), delete z.authorization);
      }
      return M;
    }
    static reconstructOriginalUrl(O) {
      const A = O.protocol || "https:";
      if (!O.hostname)
        throw new Error("Missing hostname in request options");
      const M = O.hostname, z = O.port ? `:${O.port}` : "", U = O.path || "/";
      return new h.URL(`${A}//${M}${z}${U}`);
    }
    static isCrossOriginRedirect(O, A) {
      if (O.hostname.toLowerCase() !== A.hostname.toLowerCase())
        return !0;
      if (O.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
      ["80", ""].includes(O.port) && A.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
      ["443", ""].includes(A.port))
        return !1;
      if (O.protocol !== A.protocol)
        return !0;
      const M = O.port, z = A.port;
      return M !== z;
    }
    static retryOnServerError(O, A = 3) {
      for (let M = 0; ; M++)
        try {
          return O();
        } catch (z) {
          if (M < A && (z instanceof e && z.isServerError() || z.code === "EPIPE"))
            continue;
          throw z;
        }
    }
  }
  ft.HttpExecutor = s;
  function f(k, O) {
    try {
      return new h.URL(k);
    } catch {
      const A = O.hostname, M = O.protocol || "https:", z = O.port ? `:${O.port}` : "", U = `${M}//${A}${z}`;
      return new h.URL(k, U);
    }
  }
  function g(k, O) {
    const A = C(O), M = f(k, O);
    return m(M, A), A;
  }
  function m(k, O) {
    O.protocol = k.protocol, O.hostname = k.hostname, k.port ? O.port = k.port : O.port && delete O.port, O.path = k.pathname + k.search;
  }
  class v extends c.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(O, A = "sha512", M = "base64") {
      super(), this.expected = O, this.algorithm = A, this.encoding = M, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, o.createHash)(A);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(O, A, M) {
      this.digester.update(O), M(null, O);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(O) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (A) {
          O(A);
          return;
        }
      O(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, n.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, n.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  ft.DigestTransform = v;
  function y(k, O, A) {
    return k != null && O != null && k !== O ? (A(new Error(`checksum mismatch: expected ${O} but got ${k} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function E(k, O) {
    const A = k.headers[O];
    return A == null ? null : Array.isArray(A) ? A.length === 0 ? null : A[A.length - 1] : A;
  }
  function R(k, O) {
    if (!y(E(O, "X-Checksum-Sha2"), k.options.sha2, k.callback))
      return;
    const A = [];
    if (k.options.onProgress != null) {
      const j = E(O, "content-length");
      j != null && A.push(new l.ProgressCallbackTransform(parseInt(j, 10), k.options.cancellationToken, k.options.onProgress));
    }
    const M = k.options.sha512;
    M != null ? A.push(new v(M, "sha512", M.length === 128 && !M.includes("+") && !M.includes("Z") && !M.includes("=") ? "hex" : "base64")) : k.options.sha2 != null && A.push(new v(k.options.sha2, "sha256", "hex"));
    const z = (0, p.createWriteStream)(k.destination);
    A.push(z);
    let U = O;
    for (const j of A)
      j.on("error", (B) => {
        z.close(), k.options.cancellationToken.cancelled || k.callback(B);
      }), U = U.pipe(j);
    z.on("finish", () => {
      z.close(k.callback);
    });
  }
  function C(k, O, A) {
    A != null && (k.method = A), k.headers = { ...k.headers };
    const M = k.headers;
    return O != null && (M.authorization = O.startsWith("Basic") || O.startsWith("Bearer") ? O : `token ${O}`), M["User-Agent"] == null && (M["User-Agent"] = "electron-builder"), (A == null || A === "GET" || M["Cache-Control"] == null) && (M["Cache-Control"] = "no-cache"), k.protocol == null && process.versions.electron != null && (k.protocol = "https:"), k;
  }
  function I(k, O) {
    return JSON.stringify(k, (A, M) => A.endsWith("Authorization") || A.endsWith("authorization") || A.endsWith("Password") || A.endsWith("PASSWORD") || A.endsWith("Token") || A.includes("password") || A.includes("token") || O != null && O.has(A) ? "<stripped sensitive data>" : M, 2);
  }
  return ft;
}
var Zr = {}, Jd;
function fy() {
  if (Jd) return Zr;
  Jd = 1, Object.defineProperty(Zr, "__esModule", { value: !0 }), Zr.MemoLazy = void 0;
  let o = class {
    constructor(c, h) {
      this.selector = c, this.creator = h, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const c = this.selector();
      if (this._value !== void 0 && d(this.selected, c))
        return this._value;
      this.selected = c;
      const h = this.creator(c);
      return this.value = h, h;
    }
    set value(c) {
      this._value = c;
    }
  };
  Zr.MemoLazy = o;
  function d(p, c) {
    if (typeof p == "object" && p !== null && (typeof c == "object" && c !== null)) {
      const n = Object.keys(p), l = Object.keys(c);
      return n.length === l.length && n.every((i) => d(p[i], c[i]));
    }
    return p === c;
  }
  return Zr;
}
var Rr = {}, Zd;
function dy() {
  if (Zd) return Rr;
  Zd = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.githubUrl = o, Rr.githubTagPrefix = d, Rr.getS3LikeProviderBaseUrl = p;
  function o(n, l = "github.com") {
    return `${n.protocol || "https"}://${n.host || l}`;
  }
  function d(n) {
    var l;
    return n.tagNamePrefix ? n.tagNamePrefix : !((l = n.vPrefixedTagName) !== null && l !== void 0) || l ? "v" : "";
  }
  function p(n) {
    const l = n.provider;
    if (l === "s3")
      return c(n);
    if (l === "spaces")
      return u(n);
    throw new Error(`Not supported provider: ${l}`);
  }
  function c(n) {
    let l;
    if (n.accelerate == !0)
      l = `https://${n.bucket}.s3-accelerate.amazonaws.com`;
    else if (n.endpoint != null)
      l = `${n.endpoint}/${n.bucket}`;
    else if (n.bucket.includes(".")) {
      if (n.region == null)
        throw new Error(`Bucket name "${n.bucket}" includes a dot, but S3 region is missing`);
      n.region === "us-east-1" ? l = `https://s3.amazonaws.com/${n.bucket}` : l = `https://s3-${n.region}.amazonaws.com/${n.bucket}`;
    } else n.region === "cn-north-1" ? l = `https://${n.bucket}.s3.${n.region}.amazonaws.com.cn` : l = `https://${n.bucket}.s3.amazonaws.com`;
    return h(l, n.path);
  }
  function h(n, l) {
    return l != null && l.length > 0 && (l.startsWith("/") || (n += "/"), n += l), n;
  }
  function u(n) {
    if (n.name == null)
      throw new Error("name is missing");
    if (n.region == null)
      throw new Error("region is missing");
    return h(`https://${n.name}.${n.region}.digitaloceanspaces.com`, n.path);
  }
  return Rr;
}
var ci = {}, Xd;
function hy() {
  if (Xd) return ci;
  Xd = 1, Object.defineProperty(ci, "__esModule", { value: !0 }), ci.retry = d;
  const o = Jl();
  async function d(p, c) {
    var h;
    const { retries: u, interval: n, backoff: l = 0, attempt: i = 0, shouldRetry: a, cancellationToken: r = new o.CancellationToken() } = c;
    try {
      return await p();
    } catch (e) {
      if (await Promise.resolve((h = a == null ? void 0 : a(e)) !== null && h !== void 0 ? h : !0) && u > 0 && !r.cancelled)
        return await new Promise((t) => setTimeout(t, n + l * i)), await d(p, { ...c, retries: u - 1, attempt: i + 1 });
      throw e;
    }
  }
  return ci;
}
var fi = {}, Qd;
function py() {
  if (Qd) return fi;
  Qd = 1, Object.defineProperty(fi, "__esModule", { value: !0 }), fi.parseDn = o;
  function o(d) {
    let p = !1, c = null, h = "", u = 0;
    d = d.trim();
    const n = /* @__PURE__ */ new Map();
    for (let l = 0; l <= d.length; l++) {
      if (l === d.length) {
        c !== null && n.set(c, h);
        break;
      }
      const i = d[l];
      if (p) {
        if (i === '"') {
          p = !1;
          continue;
        }
      } else {
        if (i === '"') {
          p = !0;
          continue;
        }
        if (i === "\\") {
          l++;
          const a = parseInt(d.slice(l, l + 2), 16);
          Number.isNaN(a) ? h += d[l] : (l++, h += String.fromCharCode(a));
          continue;
        }
        if (c === null && i === "=") {
          c = h, h = "";
          continue;
        }
        if (i === "," || i === ";" || i === "+") {
          c !== null && n.set(c, h), c = null, h = "";
          continue;
        }
      }
      if (i === " " && !p) {
        if (h.length === 0)
          continue;
        if (l > u) {
          let a = l;
          for (; d[a] === " "; )
            a++;
          u = a;
        }
        if (u >= d.length || d[u] === "," || d[u] === ";" || c === null && d[u] === "=" || c !== null && d[u] === "+") {
          l = u - 1;
          continue;
        }
      }
      h += i;
    }
    return n;
  }
  return fi;
}
var or = {}, eh;
function my() {
  if (eh) return or;
  eh = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.nil = or.UUID = void 0;
  const o = _n, d = Di(), p = "options.name must be either a string or a Buffer", c = (0, o.randomBytes)(16);
  c[0] = c[0] | 1;
  const h = {}, u = [];
  for (let e = 0; e < 256; e++) {
    const t = (e + 256).toString(16).substr(1);
    h[t] = e, u[e] = t;
  }
  class n {
    constructor(t) {
      this.ascii = null, this.binary = null;
      const s = n.check(t);
      if (!s)
        throw new Error("not a UUID");
      this.version = s.version, s.format === "ascii" ? this.ascii = t : this.binary = t;
    }
    static v5(t, s) {
      return a(t, "sha1", 80, s);
    }
    toString() {
      return this.ascii == null && (this.ascii = r(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(t, s = 0) {
      if (typeof t == "string")
        return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (h[t[14] + t[15]] & 240) >> 4,
          variant: l((h[t[19] + t[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(t)) {
        if (t.length < s + 16)
          return !1;
        let f = 0;
        for (; f < 16 && t[s + f] === 0; f++)
          ;
        return f === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (t[s + 6] & 240) >> 4,
          variant: l((t[s + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, d.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(t) {
      const s = Buffer.allocUnsafe(16);
      let f = 0;
      for (let g = 0; g < 16; g++)
        s[g] = h[t[f++] + t[f++]], (g === 3 || g === 5 || g === 7 || g === 9) && (f += 1);
      return s;
    }
  }
  or.UUID = n, n.OID = n.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function l(e) {
    switch (e) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var i;
  (function(e) {
    e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
  })(i || (i = {}));
  function a(e, t, s, f, g = i.ASCII) {
    const m = (0, o.createHash)(t);
    if (typeof e != "string" && !Buffer.isBuffer(e))
      throw (0, d.newError)(p, "ERR_INVALID_UUID_NAME");
    m.update(f), m.update(e);
    const y = m.digest();
    let E;
    switch (g) {
      case i.BINARY:
        y[6] = y[6] & 15 | s, y[8] = y[8] & 63 | 128, E = y;
        break;
      case i.OBJECT:
        y[6] = y[6] & 15 | s, y[8] = y[8] & 63 | 128, E = new n(y);
        break;
      default:
        E = u[y[0]] + u[y[1]] + u[y[2]] + u[y[3]] + "-" + u[y[4]] + u[y[5]] + "-" + u[y[6] & 15 | s] + u[y[7]] + "-" + u[y[8] & 63 | 128] + u[y[9]] + "-" + u[y[10]] + u[y[11]] + u[y[12]] + u[y[13]] + u[y[14]] + u[y[15]];
        break;
    }
    return E;
  }
  function r(e) {
    return u[e[0]] + u[e[1]] + u[e[2]] + u[e[3]] + "-" + u[e[4]] + u[e[5]] + "-" + u[e[6]] + u[e[7]] + "-" + u[e[8]] + u[e[9]] + "-" + u[e[10]] + u[e[11]] + u[e[12]] + u[e[13]] + u[e[14]] + u[e[15]];
  }
  return or.nil = new n("00000000-0000-0000-0000-000000000000"), or;
}
var Tr = {}, ho = {}, th;
function gy() {
  return th || (th = 1, (function(o) {
    (function(d) {
      d.parser = function(S, b) {
        return new c(S, b);
      }, d.SAXParser = c, d.SAXStream = r, d.createStream = a, d.MAX_BUFFER_LENGTH = 64 * 1024;
      var p = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      d.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function c(S, b) {
        if (!(this instanceof c))
          return new c(S, b);
        var W = this;
        u(W), W.q = W.c = "", W.bufferCheckPosition = d.MAX_BUFFER_LENGTH, W.opt = b || {}, W.opt.lowercase = W.opt.lowercase || W.opt.lowercasetags, W.looseCase = W.opt.lowercase ? "toLowerCase" : "toUpperCase", W.tags = [], W.closed = W.closedRoot = W.sawRoot = !1, W.tag = W.error = null, W.strict = !!S, W.noscript = !!(S || W.opt.noscript), W.state = A.BEGIN, W.strictEntities = W.opt.strictEntities, W.ENTITIES = W.strictEntities ? Object.create(d.XML_ENTITIES) : Object.create(d.ENTITIES), W.attribList = [], W.opt.xmlns && (W.ns = Object.create(g)), W.opt.unquotedAttributeValues === void 0 && (W.opt.unquotedAttributeValues = !S), W.trackPosition = W.opt.position !== !1, W.trackPosition && (W.position = W.line = W.column = 0), z(W, "onready");
      }
      Object.create || (Object.create = function(S) {
        function b() {
        }
        b.prototype = S;
        var W = new b();
        return W;
      }), Object.keys || (Object.keys = function(S) {
        var b = [];
        for (var W in S) S.hasOwnProperty(W) && b.push(W);
        return b;
      });
      function h(S) {
        for (var b = Math.max(d.MAX_BUFFER_LENGTH, 10), W = 0, $ = 0, he = p.length; $ < he; $++) {
          var le = S[p[$]].length;
          if (le > b)
            switch (p[$]) {
              case "textNode":
                j(S);
                break;
              case "cdata":
                U(S, "oncdata", S.cdata), S.cdata = "";
                break;
              case "script":
                U(S, "onscript", S.script), S.script = "";
                break;
              default:
                H(S, "Max buffer length exceeded: " + p[$]);
            }
          W = Math.max(W, le);
        }
        var me = d.MAX_BUFFER_LENGTH - W;
        S.bufferCheckPosition = me + S.position;
      }
      function u(S) {
        for (var b = 0, W = p.length; b < W; b++)
          S[p[b]] = "";
      }
      function n(S) {
        j(S), S.cdata !== "" && (U(S, "oncdata", S.cdata), S.cdata = ""), S.script !== "" && (U(S, "onscript", S.script), S.script = "");
      }
      c.prototype = {
        end: function() {
          te(this);
        },
        write: be,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          n(this);
        }
      };
      var l;
      try {
        l = require("stream").Stream;
      } catch {
        l = function() {
        };
      }
      l || (l = function() {
      });
      var i = d.EVENTS.filter(function(S) {
        return S !== "error" && S !== "end";
      });
      function a(S, b) {
        return new r(S, b);
      }
      function r(S, b) {
        if (!(this instanceof r))
          return new r(S, b);
        l.apply(this), this._parser = new c(S, b), this.writable = !0, this.readable = !0;
        var W = this;
        this._parser.onend = function() {
          W.emit("end");
        }, this._parser.onerror = function($) {
          W.emit("error", $), W._parser.error = null;
        }, this._decoder = null, i.forEach(function($) {
          Object.defineProperty(W, "on" + $, {
            get: function() {
              return W._parser["on" + $];
            },
            set: function(he) {
              if (!he)
                return W.removeAllListeners($), W._parser["on" + $] = he, he;
              W.on($, he);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      r.prototype = Object.create(l.prototype, {
        constructor: {
          value: r
        }
      }), r.prototype.write = function(S) {
        return typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(S) && (this._decoder || (this._decoder = new TextDecoder("utf8")), S = this._decoder.decode(S, { stream: !0 })), this._parser.write(S.toString()), this.emit("data", S), !0;
      }, r.prototype.end = function(S) {
        if (S && S.length && this.write(S), this._decoder) {
          var b = this._decoder.decode();
          b && (this._parser.write(b), this.emit("data", b));
        }
        return this._parser.end(), !0;
      }, r.prototype.on = function(S, b) {
        var W = this;
        return !W._parser["on" + S] && i.indexOf(S) !== -1 && (W._parser["on" + S] = function() {
          var $ = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          $.splice(0, 0, S), W.emit.apply(W, $);
        }), l.prototype.on.call(W, S, b);
      };
      var e = "[CDATA[", t = "DOCTYPE", s = "http://www.w3.org/XML/1998/namespace", f = "http://www.w3.org/2000/xmlns/", g = { xml: s, xmlns: f }, m = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, v = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, y = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, E = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function R(S) {
        return S === " " || S === `
` || S === "\r" || S === "	";
      }
      function C(S) {
        return S === '"' || S === "'";
      }
      function I(S) {
        return S === ">" || R(S);
      }
      function k(S, b) {
        return S.test(b);
      }
      function O(S, b) {
        return !k(S, b);
      }
      var A = 0;
      d.STATE = {
        BEGIN: A++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: A++,
        // leading whitespace
        TEXT: A++,
        // general stuff
        TEXT_ENTITY: A++,
        // &amp and such.
        OPEN_WAKA: A++,
        // <
        SGML_DECL: A++,
        // <!BLARG
        SGML_DECL_QUOTED: A++,
        // <!BLARG foo "bar
        DOCTYPE: A++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: A++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: A++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: A++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: A++,
        // <!-
        COMMENT: A++,
        // <!--
        COMMENT_ENDING: A++,
        // <!-- blah -
        COMMENT_ENDED: A++,
        // <!-- blah --
        CDATA: A++,
        // <![CDATA[ something
        CDATA_ENDING: A++,
        // ]
        CDATA_ENDING_2: A++,
        // ]]
        PROC_INST: A++,
        // <?hi
        PROC_INST_BODY: A++,
        // <?hi there
        PROC_INST_ENDING: A++,
        // <?hi "there" ?
        OPEN_TAG: A++,
        // <strong
        OPEN_TAG_SLASH: A++,
        // <strong /
        ATTRIB: A++,
        // <a
        ATTRIB_NAME: A++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: A++,
        // <a foo _
        ATTRIB_VALUE: A++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: A++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: A++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: A++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: A++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: A++,
        // <foo bar=&quot
        CLOSE_TAG: A++,
        // </a
        CLOSE_TAG_SAW_WHITE: A++,
        // </a   >
        SCRIPT: A++,
        // <script> ...
        SCRIPT_ENDING: A++
        // <script> ... <
      }, d.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, d.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(d.ENTITIES).forEach(function(S) {
        var b = d.ENTITIES[S], W = typeof b == "number" ? String.fromCharCode(b) : b;
        d.ENTITIES[S] = W;
      });
      for (var M in d.STATE)
        d.STATE[d.STATE[M]] = M;
      A = d.STATE;
      function z(S, b, W) {
        S[b] && S[b](W);
      }
      function U(S, b, W) {
        S.textNode && j(S), z(S, b, W);
      }
      function j(S) {
        S.textNode = B(S.opt, S.textNode), S.textNode && z(S, "ontext", S.textNode), S.textNode = "";
      }
      function B(S, b) {
        return S.trim && (b = b.trim()), S.normalize && (b = b.replace(/\s+/g, " ")), b;
      }
      function H(S, b) {
        return j(S), S.trackPosition && (b += `
Line: ` + S.line + `
Column: ` + S.column + `
Char: ` + S.c), b = new Error(b), S.error = b, z(S, "onerror", b), S;
      }
      function te(S) {
        return S.sawRoot && !S.closedRoot && N(S, "Unclosed root tag"), S.state !== A.BEGIN && S.state !== A.BEGIN_WHITESPACE && S.state !== A.TEXT && H(S, "Unexpected end"), j(S), S.c = "", S.closed = !0, z(S, "onend"), c.call(S, S.strict, S.opt), S;
      }
      function N(S, b) {
        if (typeof S != "object" || !(S instanceof c))
          throw new Error("bad call to strictFail");
        S.strict && H(S, b);
      }
      function F(S) {
        S.strict || (S.tagName = S.tagName[S.looseCase]());
        var b = S.tags[S.tags.length - 1] || S, W = S.tag = { name: S.tagName, attributes: {} };
        S.opt.xmlns && (W.ns = b.ns), S.attribList.length = 0, U(S, "onopentagstart", W);
      }
      function G(S, b) {
        var W = S.indexOf(":"), $ = W < 0 ? ["", S] : S.split(":"), he = $[0], le = $[1];
        return b && S === "xmlns" && (he = "xmlns", le = ""), { prefix: he, local: le };
      }
      function Q(S) {
        if (S.strict || (S.attribName = S.attribName[S.looseCase]()), S.attribList.indexOf(S.attribName) !== -1 || S.tag.attributes.hasOwnProperty(S.attribName)) {
          S.attribName = S.attribValue = "";
          return;
        }
        if (S.opt.xmlns) {
          var b = G(S.attribName, !0), W = b.prefix, $ = b.local;
          if (W === "xmlns")
            if ($ === "xml" && S.attribValue !== s)
              N(
                S,
                "xml: prefix must be bound to " + s + `
Actual: ` + S.attribValue
              );
            else if ($ === "xmlns" && S.attribValue !== f)
              N(
                S,
                "xmlns: prefix must be bound to " + f + `
Actual: ` + S.attribValue
              );
            else {
              var he = S.tag, le = S.tags[S.tags.length - 1] || S;
              he.ns === le.ns && (he.ns = Object.create(le.ns)), he.ns[$] = S.attribValue;
            }
          S.attribList.push([S.attribName, S.attribValue]);
        } else
          S.tag.attributes[S.attribName] = S.attribValue, U(S, "onattribute", {
            name: S.attribName,
            value: S.attribValue
          });
        S.attribName = S.attribValue = "";
      }
      function ce(S, b) {
        if (S.opt.xmlns) {
          var W = S.tag, $ = G(S.tagName);
          W.prefix = $.prefix, W.local = $.local, W.uri = W.ns[$.prefix] || "", W.prefix && !W.uri && (N(
            S,
            "Unbound namespace prefix: " + JSON.stringify(S.tagName)
          ), W.uri = $.prefix);
          var he = S.tags[S.tags.length - 1] || S;
          W.ns && he.ns !== W.ns && Object.keys(W.ns).forEach(function(_) {
            U(S, "onopennamespace", {
              prefix: _,
              uri: W.ns[_]
            });
          });
          for (var le = 0, me = S.attribList.length; le < me; le++) {
            var Ne = S.attribList[le], Te = Ne[0], $e = Ne[1], Oe = G(Te, !0), ke = Oe.prefix, He = Oe.local, Qe = ke === "" ? "" : W.ns[ke] || "", Ge = {
              name: Te,
              value: $e,
              prefix: ke,
              local: He,
              uri: Qe
            };
            ke && ke !== "xmlns" && !Qe && (N(
              S,
              "Unbound namespace prefix: " + JSON.stringify(ke)
            ), Ge.uri = ke), S.tag.attributes[Te] = Ge, U(S, "onattribute", Ge);
          }
          S.attribList.length = 0;
        }
        S.tag.isSelfClosing = !!b, S.sawRoot = !0, S.tags.push(S.tag), U(S, "onopentag", S.tag), b || (!S.noscript && S.tagName.toLowerCase() === "script" ? S.state = A.SCRIPT : S.state = A.TEXT, S.tag = null, S.tagName = ""), S.attribName = S.attribValue = "", S.attribList.length = 0;
      }
      function ae(S) {
        if (!S.tagName) {
          N(S, "Weird empty close tag."), S.textNode += "</>", S.state = A.TEXT;
          return;
        }
        if (S.script) {
          if (S.tagName !== "script") {
            S.script += "</" + S.tagName + ">", S.tagName = "", S.state = A.SCRIPT;
            return;
          }
          U(S, "onscript", S.script), S.script = "";
        }
        var b = S.tags.length, W = S.tagName;
        S.strict || (W = W[S.looseCase]());
        for (var $ = W; b--; ) {
          var he = S.tags[b];
          if (he.name !== $)
            N(S, "Unexpected close tag");
          else
            break;
        }
        if (b < 0) {
          N(S, "Unmatched closing tag: " + S.tagName), S.textNode += "</" + S.tagName + ">", S.state = A.TEXT;
          return;
        }
        S.tagName = W;
        for (var le = S.tags.length; le-- > b; ) {
          var me = S.tag = S.tags.pop();
          S.tagName = S.tag.name, U(S, "onclosetag", S.tagName);
          var Ne = {};
          for (var Te in me.ns)
            Ne[Te] = me.ns[Te];
          var $e = S.tags[S.tags.length - 1] || S;
          S.opt.xmlns && me.ns !== $e.ns && Object.keys(me.ns).forEach(function(Oe) {
            var ke = me.ns[Oe];
            U(S, "onclosenamespace", { prefix: Oe, uri: ke });
          });
        }
        b === 0 && (S.closedRoot = !0), S.tagName = S.attribValue = S.attribName = "", S.attribList.length = 0, S.state = A.TEXT;
      }
      function ve(S) {
        var b = S.entity, W = b.toLowerCase(), $, he = "";
        return S.ENTITIES[b] ? S.ENTITIES[b] : S.ENTITIES[W] ? S.ENTITIES[W] : (b = W, b.charAt(0) === "#" && (b.charAt(1) === "x" ? (b = b.slice(2), $ = parseInt(b, 16), he = $.toString(16)) : (b = b.slice(1), $ = parseInt(b, 10), he = $.toString(10))), b = b.replace(/^0+/, ""), isNaN($) || he.toLowerCase() !== b || $ < 0 || $ > 1114111 ? (N(S, "Invalid character entity"), "&" + S.entity + ";") : String.fromCodePoint($));
      }
      function we(S, b) {
        b === "<" ? (S.state = A.OPEN_WAKA, S.startTagPosition = S.position) : R(b) || (N(S, "Non-whitespace before first tag."), S.textNode = b, S.state = A.TEXT);
      }
      function ie(S, b) {
        var W = "";
        return b < S.length && (W = S.charAt(b)), W;
      }
      function be(S) {
        var b = this;
        if (this.error)
          throw this.error;
        if (b.closed)
          return H(
            b,
            "Cannot write after close. Assign an onready handler."
          );
        if (S === null)
          return te(b);
        typeof S == "object" && (S = S.toString());
        for (var W = 0, $ = ""; $ = ie(S, W++), b.c = $, !!$; )
          switch (b.trackPosition && (b.position++, $ === `
` ? (b.line++, b.column = 0) : b.column++), b.state) {
            case A.BEGIN:
              if (b.state = A.BEGIN_WHITESPACE, $ === "\uFEFF")
                continue;
              we(b, $);
              continue;
            case A.BEGIN_WHITESPACE:
              we(b, $);
              continue;
            case A.TEXT:
              if (b.sawRoot && !b.closedRoot) {
                for (var le = W - 1; $ && $ !== "<" && $ !== "&"; )
                  $ = ie(S, W++), $ && b.trackPosition && (b.position++, $ === `
` ? (b.line++, b.column = 0) : b.column++);
                b.textNode += S.substring(le, W - 1);
              }
              $ === "<" && !(b.sawRoot && b.closedRoot && !b.strict) ? (b.state = A.OPEN_WAKA, b.startTagPosition = b.position) : (!R($) && (!b.sawRoot || b.closedRoot) && N(b, "Text data outside of root node."), $ === "&" ? b.state = A.TEXT_ENTITY : b.textNode += $);
              continue;
            case A.SCRIPT:
              $ === "<" ? b.state = A.SCRIPT_ENDING : b.script += $;
              continue;
            case A.SCRIPT_ENDING:
              $ === "/" ? b.state = A.CLOSE_TAG : (b.script += "<" + $, b.state = A.SCRIPT);
              continue;
            case A.OPEN_WAKA:
              if ($ === "!")
                b.state = A.SGML_DECL, b.sgmlDecl = "";
              else if (!R($)) if (k(m, $))
                b.state = A.OPEN_TAG, b.tagName = $;
              else if ($ === "/")
                b.state = A.CLOSE_TAG, b.tagName = "";
              else if ($ === "?")
                b.state = A.PROC_INST, b.procInstName = b.procInstBody = "";
              else {
                if (N(b, "Unencoded <"), b.startTagPosition + 1 < b.position) {
                  var he = b.position - b.startTagPosition;
                  $ = new Array(he).join(" ") + $;
                }
                b.textNode += "<" + $, b.state = A.TEXT;
              }
              continue;
            case A.SGML_DECL:
              if (b.sgmlDecl + $ === "--") {
                b.state = A.COMMENT, b.comment = "", b.sgmlDecl = "";
                continue;
              }
              b.doctype && b.doctype !== !0 && b.sgmlDecl ? (b.state = A.DOCTYPE_DTD, b.doctype += "<!" + b.sgmlDecl + $, b.sgmlDecl = "") : (b.sgmlDecl + $).toUpperCase() === e ? (U(b, "onopencdata"), b.state = A.CDATA, b.sgmlDecl = "", b.cdata = "") : (b.sgmlDecl + $).toUpperCase() === t ? (b.state = A.DOCTYPE, (b.doctype || b.sawRoot) && N(
                b,
                "Inappropriately located doctype declaration"
              ), b.doctype = "", b.sgmlDecl = "") : $ === ">" ? (U(b, "onsgmldeclaration", b.sgmlDecl), b.sgmlDecl = "", b.state = A.TEXT) : (C($) && (b.state = A.SGML_DECL_QUOTED), b.sgmlDecl += $);
              continue;
            case A.SGML_DECL_QUOTED:
              $ === b.q && (b.state = A.SGML_DECL, b.q = ""), b.sgmlDecl += $;
              continue;
            case A.DOCTYPE:
              $ === ">" ? (b.state = A.TEXT, U(b, "ondoctype", b.doctype), b.doctype = !0) : (b.doctype += $, $ === "[" ? b.state = A.DOCTYPE_DTD : C($) && (b.state = A.DOCTYPE_QUOTED, b.q = $));
              continue;
            case A.DOCTYPE_QUOTED:
              b.doctype += $, $ === b.q && (b.q = "", b.state = A.DOCTYPE);
              continue;
            case A.DOCTYPE_DTD:
              $ === "]" ? (b.doctype += $, b.state = A.DOCTYPE) : $ === "<" ? (b.state = A.OPEN_WAKA, b.startTagPosition = b.position) : C($) ? (b.doctype += $, b.state = A.DOCTYPE_DTD_QUOTED, b.q = $) : b.doctype += $;
              continue;
            case A.DOCTYPE_DTD_QUOTED:
              b.doctype += $, $ === b.q && (b.state = A.DOCTYPE_DTD, b.q = "");
              continue;
            case A.COMMENT:
              $ === "-" ? b.state = A.COMMENT_ENDING : b.comment += $;
              continue;
            case A.COMMENT_ENDING:
              $ === "-" ? (b.state = A.COMMENT_ENDED, b.comment = B(b.opt, b.comment), b.comment && U(b, "oncomment", b.comment), b.comment = "") : (b.comment += "-" + $, b.state = A.COMMENT);
              continue;
            case A.COMMENT_ENDED:
              $ !== ">" ? (N(b, "Malformed comment"), b.comment += "--" + $, b.state = A.COMMENT) : b.doctype && b.doctype !== !0 ? b.state = A.DOCTYPE_DTD : b.state = A.TEXT;
              continue;
            case A.CDATA:
              for (var le = W - 1; $ && $ !== "]"; )
                $ = ie(S, W++), $ && b.trackPosition && (b.position++, $ === `
` ? (b.line++, b.column = 0) : b.column++);
              b.cdata += S.substring(le, W - 1), $ === "]" && (b.state = A.CDATA_ENDING);
              continue;
            case A.CDATA_ENDING:
              $ === "]" ? b.state = A.CDATA_ENDING_2 : (b.cdata += "]" + $, b.state = A.CDATA);
              continue;
            case A.CDATA_ENDING_2:
              $ === ">" ? (b.cdata && U(b, "oncdata", b.cdata), U(b, "onclosecdata"), b.cdata = "", b.state = A.TEXT) : $ === "]" ? b.cdata += "]" : (b.cdata += "]]" + $, b.state = A.CDATA);
              continue;
            case A.PROC_INST:
              $ === "?" ? b.state = A.PROC_INST_ENDING : R($) ? b.state = A.PROC_INST_BODY : b.procInstName += $;
              continue;
            case A.PROC_INST_BODY:
              if (!b.procInstBody && R($))
                continue;
              $ === "?" ? b.state = A.PROC_INST_ENDING : b.procInstBody += $;
              continue;
            case A.PROC_INST_ENDING:
              $ === ">" ? (U(b, "onprocessinginstruction", {
                name: b.procInstName,
                body: b.procInstBody
              }), b.procInstName = b.procInstBody = "", b.state = A.TEXT) : (b.procInstBody += "?" + $, b.state = A.PROC_INST_BODY);
              continue;
            case A.OPEN_TAG:
              k(v, $) ? b.tagName += $ : (F(b), $ === ">" ? ce(b) : $ === "/" ? b.state = A.OPEN_TAG_SLASH : (R($) || N(b, "Invalid character in tag name"), b.state = A.ATTRIB));
              continue;
            case A.OPEN_TAG_SLASH:
              $ === ">" ? (ce(b, !0), ae(b)) : (N(
                b,
                "Forward-slash in opening tag not followed by >"
              ), b.state = A.ATTRIB);
              continue;
            case A.ATTRIB:
              if (R($))
                continue;
              $ === ">" ? ce(b) : $ === "/" ? b.state = A.OPEN_TAG_SLASH : k(m, $) ? (b.attribName = $, b.attribValue = "", b.state = A.ATTRIB_NAME) : N(b, "Invalid attribute name");
              continue;
            case A.ATTRIB_NAME:
              $ === "=" ? b.state = A.ATTRIB_VALUE : $ === ">" ? (N(b, "Attribute without value"), b.attribValue = b.attribName, Q(b), ce(b)) : R($) ? b.state = A.ATTRIB_NAME_SAW_WHITE : k(v, $) ? b.attribName += $ : N(b, "Invalid attribute name");
              continue;
            case A.ATTRIB_NAME_SAW_WHITE:
              if ($ === "=")
                b.state = A.ATTRIB_VALUE;
              else {
                if (R($))
                  continue;
                N(b, "Attribute without value"), b.tag.attributes[b.attribName] = "", b.attribValue = "", U(b, "onattribute", {
                  name: b.attribName,
                  value: ""
                }), b.attribName = "", $ === ">" ? ce(b) : k(m, $) ? (b.attribName = $, b.state = A.ATTRIB_NAME) : (N(b, "Invalid attribute name"), b.state = A.ATTRIB);
              }
              continue;
            case A.ATTRIB_VALUE:
              if (R($))
                continue;
              C($) ? (b.q = $, b.state = A.ATTRIB_VALUE_QUOTED) : (b.opt.unquotedAttributeValues || H(b, "Unquoted attribute value"), b.state = A.ATTRIB_VALUE_UNQUOTED, b.attribValue = $);
              continue;
            case A.ATTRIB_VALUE_QUOTED:
              if ($ !== b.q) {
                $ === "&" ? b.state = A.ATTRIB_VALUE_ENTITY_Q : b.attribValue += $;
                continue;
              }
              Q(b), b.q = "", b.state = A.ATTRIB_VALUE_CLOSED;
              continue;
            case A.ATTRIB_VALUE_CLOSED:
              R($) ? b.state = A.ATTRIB : $ === ">" ? ce(b) : $ === "/" ? b.state = A.OPEN_TAG_SLASH : k(m, $) ? (N(b, "No whitespace between attributes"), b.attribName = $, b.attribValue = "", b.state = A.ATTRIB_NAME) : N(b, "Invalid attribute name");
              continue;
            case A.ATTRIB_VALUE_UNQUOTED:
              if (!I($)) {
                $ === "&" ? b.state = A.ATTRIB_VALUE_ENTITY_U : b.attribValue += $;
                continue;
              }
              Q(b), $ === ">" ? ce(b) : b.state = A.ATTRIB;
              continue;
            case A.CLOSE_TAG:
              if (b.tagName)
                $ === ">" ? ae(b) : k(v, $) ? b.tagName += $ : b.script ? (b.script += "</" + b.tagName + $, b.tagName = "", b.state = A.SCRIPT) : (R($) || N(b, "Invalid tagname in closing tag"), b.state = A.CLOSE_TAG_SAW_WHITE);
              else {
                if (R($))
                  continue;
                O(m, $) ? b.script ? (b.script += "</" + $, b.state = A.SCRIPT) : N(b, "Invalid tagname in closing tag.") : b.tagName = $;
              }
              continue;
            case A.CLOSE_TAG_SAW_WHITE:
              if (R($))
                continue;
              $ === ">" ? ae(b) : N(b, "Invalid characters in closing tag");
              continue;
            case A.TEXT_ENTITY:
            case A.ATTRIB_VALUE_ENTITY_Q:
            case A.ATTRIB_VALUE_ENTITY_U:
              var me, Ne;
              switch (b.state) {
                case A.TEXT_ENTITY:
                  me = A.TEXT, Ne = "textNode";
                  break;
                case A.ATTRIB_VALUE_ENTITY_Q:
                  me = A.ATTRIB_VALUE_QUOTED, Ne = "attribValue";
                  break;
                case A.ATTRIB_VALUE_ENTITY_U:
                  me = A.ATTRIB_VALUE_UNQUOTED, Ne = "attribValue";
                  break;
              }
              if ($ === ";") {
                var Te = ve(b);
                b.opt.unparsedEntities && !Object.values(d.XML_ENTITIES).includes(Te) ? (b.entity = "", b.state = me, b.write(Te)) : (b[Ne] += Te, b.entity = "", b.state = me);
              } else k(b.entity.length ? E : y, $) ? b.entity += $ : (N(b, "Invalid character in entity name"), b[Ne] += "&" + b.entity + $, b.entity = "", b.state = me);
              continue;
            default:
              throw new Error(b, "Unknown state: " + b.state);
          }
        return b.position >= b.bufferCheckPosition && h(b), b;
      }
      /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
      String.fromCodePoint || (function() {
        var S = String.fromCharCode, b = Math.floor, W = function() {
          var $ = 16384, he = [], le, me, Ne = -1, Te = arguments.length;
          if (!Te)
            return "";
          for (var $e = ""; ++Ne < Te; ) {
            var Oe = Number(arguments[Ne]);
            if (!isFinite(Oe) || // `NaN`, `+Infinity`, or `-Infinity`
            Oe < 0 || // not a valid Unicode code point
            Oe > 1114111 || // not a valid Unicode code point
            b(Oe) !== Oe)
              throw RangeError("Invalid code point: " + Oe);
            Oe <= 65535 ? he.push(Oe) : (Oe -= 65536, le = (Oe >> 10) + 55296, me = Oe % 1024 + 56320, he.push(le, me)), (Ne + 1 === Te || he.length > $) && ($e += S.apply(null, he), he.length = 0);
          }
          return $e;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: W,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = W;
      })();
    })(o);
  })(ho)), ho;
}
var rh;
function vy() {
  if (rh) return Tr;
  rh = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.XElement = void 0, Tr.parseXml = n;
  const o = gy(), d = Di();
  class p {
    constructor(i) {
      if (this.name = i, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !i)
        throw (0, d.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!h(i))
        throw (0, d.newError)(`Invalid element name: ${i}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(i) {
      const a = this.attributes === null ? null : this.attributes[i];
      if (a == null)
        throw (0, d.newError)(`No attribute "${i}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return a;
    }
    removeAttribute(i) {
      this.attributes !== null && delete this.attributes[i];
    }
    element(i, a = !1, r = null) {
      const e = this.elementOrNull(i, a);
      if (e === null)
        throw (0, d.newError)(r || `No element "${i}"`, "ERR_XML_MISSED_ELEMENT");
      return e;
    }
    elementOrNull(i, a = !1) {
      if (this.elements === null)
        return null;
      for (const r of this.elements)
        if (u(r, i, a))
          return r;
      return null;
    }
    getElements(i, a = !1) {
      return this.elements === null ? [] : this.elements.filter((r) => u(r, i, a));
    }
    elementValueOrEmpty(i, a = !1) {
      const r = this.elementOrNull(i, a);
      return r === null ? "" : r.value;
    }
  }
  Tr.XElement = p;
  const c = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function h(l) {
    return c.test(l);
  }
  function u(l, i, a) {
    const r = l.name;
    return r === i || a === !0 && r.length === i.length && r.toLowerCase() === i.toLowerCase();
  }
  function n(l) {
    let i = null;
    const a = o.parser(!0, {}), r = [];
    return a.onopentag = (e) => {
      const t = new p(e.name);
      if (t.attributes = e.attributes, i === null)
        i = t;
      else {
        const s = r[r.length - 1];
        s.elements == null && (s.elements = []), s.elements.push(t);
      }
      r.push(t);
    }, a.onclosetag = () => {
      r.pop();
    }, a.ontext = (e) => {
      r.length > 0 && (r[r.length - 1].value = e);
    }, a.oncdata = (e) => {
      const t = r[r.length - 1];
      t.value = e, t.isCData = !0;
    }, a.onerror = (e) => {
      throw e;
    }, a.write(l), i;
  }
  return Tr;
}
var nh;
function ot() {
  return nh || (nh = 1, (function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.CURRENT_APP_PACKAGE_FILE_NAME = o.CURRENT_APP_INSTALLER_FILE_NAME = o.XElement = o.parseXml = o.UUID = o.parseDn = o.retry = o.githubTagPrefix = o.githubUrl = o.getS3LikeProviderBaseUrl = o.ProgressCallbackTransform = o.MemoLazy = o.safeStringifyJson = o.safeGetHeader = o.parseJson = o.HttpExecutor = o.HttpError = o.DigestTransform = o.createHttpError = o.configureRequestUrl = o.configureRequestOptionsFromUrl = o.configureRequestOptions = o.newError = o.CancellationToken = o.CancellationError = void 0, o.asArray = e;
    var d = Jl();
    Object.defineProperty(o, "CancellationError", { enumerable: !0, get: function() {
      return d.CancellationError;
    } }), Object.defineProperty(o, "CancellationToken", { enumerable: !0, get: function() {
      return d.CancellationToken;
    } });
    var p = Di();
    Object.defineProperty(o, "newError", { enumerable: !0, get: function() {
      return p.newError;
    } });
    var c = cy();
    Object.defineProperty(o, "configureRequestOptions", { enumerable: !0, get: function() {
      return c.configureRequestOptions;
    } }), Object.defineProperty(o, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return c.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(o, "configureRequestUrl", { enumerable: !0, get: function() {
      return c.configureRequestUrl;
    } }), Object.defineProperty(o, "createHttpError", { enumerable: !0, get: function() {
      return c.createHttpError;
    } }), Object.defineProperty(o, "DigestTransform", { enumerable: !0, get: function() {
      return c.DigestTransform;
    } }), Object.defineProperty(o, "HttpError", { enumerable: !0, get: function() {
      return c.HttpError;
    } }), Object.defineProperty(o, "HttpExecutor", { enumerable: !0, get: function() {
      return c.HttpExecutor;
    } }), Object.defineProperty(o, "parseJson", { enumerable: !0, get: function() {
      return c.parseJson;
    } }), Object.defineProperty(o, "safeGetHeader", { enumerable: !0, get: function() {
      return c.safeGetHeader;
    } }), Object.defineProperty(o, "safeStringifyJson", { enumerable: !0, get: function() {
      return c.safeStringifyJson;
    } });
    var h = fy();
    Object.defineProperty(o, "MemoLazy", { enumerable: !0, get: function() {
      return h.MemoLazy;
    } });
    var u = lg();
    Object.defineProperty(o, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return u.ProgressCallbackTransform;
    } });
    var n = dy();
    Object.defineProperty(o, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return n.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(o, "githubUrl", { enumerable: !0, get: function() {
      return n.githubUrl;
    } }), Object.defineProperty(o, "githubTagPrefix", { enumerable: !0, get: function() {
      return n.githubTagPrefix;
    } });
    var l = hy();
    Object.defineProperty(o, "retry", { enumerable: !0, get: function() {
      return l.retry;
    } });
    var i = py();
    Object.defineProperty(o, "parseDn", { enumerable: !0, get: function() {
      return i.parseDn;
    } });
    var a = my();
    Object.defineProperty(o, "UUID", { enumerable: !0, get: function() {
      return a.UUID;
    } });
    var r = vy();
    Object.defineProperty(o, "parseXml", { enumerable: !0, get: function() {
      return r.parseXml;
    } }), Object.defineProperty(o, "XElement", { enumerable: !0, get: function() {
      return r.XElement;
    } }), o.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", o.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function e(t) {
      return t == null ? [] : Array.isArray(t) ? t : [t];
    }
  })(oo)), oo;
}
var dt = {}, di = {}, Ht = {}, ih;
function kn() {
  if (ih) return Ht;
  ih = 1;
  function o(n) {
    return typeof n > "u" || n === null;
  }
  function d(n) {
    return typeof n == "object" && n !== null;
  }
  function p(n) {
    return Array.isArray(n) ? n : o(n) ? [] : [n];
  }
  function c(n, l) {
    var i, a, r, e;
    if (l)
      for (e = Object.keys(l), i = 0, a = e.length; i < a; i += 1)
        r = e[i], n[r] = l[r];
    return n;
  }
  function h(n, l) {
    var i = "", a;
    for (a = 0; a < l; a += 1)
      i += n;
    return i;
  }
  function u(n) {
    return n === 0 && Number.NEGATIVE_INFINITY === 1 / n;
  }
  return Ht.isNothing = o, Ht.isObject = d, Ht.toArray = p, Ht.repeat = h, Ht.isNegativeZero = u, Ht.extend = c, Ht;
}
var po, ah;
function Nn() {
  if (ah) return po;
  ah = 1;
  function o(p, c) {
    var h = "", u = p.reason || "(unknown reason)";
    return p.mark ? (p.mark.name && (h += 'in "' + p.mark.name + '" '), h += "(" + (p.mark.line + 1) + ":" + (p.mark.column + 1) + ")", !c && p.mark.snippet && (h += `

` + p.mark.snippet), u + " " + h) : u;
  }
  function d(p, c) {
    Error.call(this), this.name = "YAMLException", this.reason = p, this.mark = c, this.message = o(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return d.prototype = Object.create(Error.prototype), d.prototype.constructor = d, d.prototype.toString = function(c) {
    return this.name + ": " + o(this, c);
  }, po = d, po;
}
var mo, sh;
function yy() {
  if (sh) return mo;
  sh = 1;
  var o = kn();
  function d(h, u, n, l, i) {
    var a = "", r = "", e = Math.floor(i / 2) - 1;
    return l - u > e && (a = " ... ", u = l - e + a.length), n - l > e && (r = " ...", n = l + e - r.length), {
      str: a + h.slice(u, n).replace(/\t/g, "→") + r,
      pos: l - u + a.length
      // relative position
    };
  }
  function p(h, u) {
    return o.repeat(" ", u - h.length) + h;
  }
  function c(h, u) {
    if (u = Object.create(u || null), !h.buffer) return null;
    u.maxLength || (u.maxLength = 79), typeof u.indent != "number" && (u.indent = 1), typeof u.linesBefore != "number" && (u.linesBefore = 3), typeof u.linesAfter != "number" && (u.linesAfter = 2);
    for (var n = /\r?\n|\r|\0/g, l = [0], i = [], a, r = -1; a = n.exec(h.buffer); )
      i.push(a.index), l.push(a.index + a[0].length), h.position <= a.index && r < 0 && (r = l.length - 2);
    r < 0 && (r = l.length - 1);
    var e = "", t, s, f = Math.min(h.line + u.linesAfter, i.length).toString().length, g = u.maxLength - (u.indent + f + 3);
    for (t = 1; t <= u.linesBefore && !(r - t < 0); t++)
      s = d(
        h.buffer,
        l[r - t],
        i[r - t],
        h.position - (l[r] - l[r - t]),
        g
      ), e = o.repeat(" ", u.indent) + p((h.line - t + 1).toString(), f) + " | " + s.str + `
` + e;
    for (s = d(h.buffer, l[r], i[r], h.position, g), e += o.repeat(" ", u.indent) + p((h.line + 1).toString(), f) + " | " + s.str + `
`, e += o.repeat("-", u.indent + f + 3 + s.pos) + `^
`, t = 1; t <= u.linesAfter && !(r + t >= i.length); t++)
      s = d(
        h.buffer,
        l[r + t],
        i[r + t],
        h.position - (l[r] - l[r + t]),
        g
      ), e += o.repeat(" ", u.indent) + p((h.line + t + 1).toString(), f) + " | " + s.str + `
`;
    return e.replace(/\n$/, "");
  }
  return mo = c, mo;
}
var go, oh;
function pt() {
  if (oh) return go;
  oh = 1;
  var o = Nn(), d = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], p = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function c(u) {
    var n = {};
    return u !== null && Object.keys(u).forEach(function(l) {
      u[l].forEach(function(i) {
        n[String(i)] = l;
      });
    }), n;
  }
  function h(u, n) {
    if (n = n || {}, Object.keys(n).forEach(function(l) {
      if (d.indexOf(l) === -1)
        throw new o('Unknown option "' + l + '" is met in definition of "' + u + '" YAML type.');
    }), this.options = n, this.tag = u, this.kind = n.kind || null, this.resolve = n.resolve || function() {
      return !0;
    }, this.construct = n.construct || function(l) {
      return l;
    }, this.instanceOf = n.instanceOf || null, this.predicate = n.predicate || null, this.represent = n.represent || null, this.representName = n.representName || null, this.defaultStyle = n.defaultStyle || null, this.multi = n.multi || !1, this.styleAliases = c(n.styleAliases || null), p.indexOf(this.kind) === -1)
      throw new o('Unknown kind "' + this.kind + '" is specified for "' + u + '" YAML type.');
  }
  return go = h, go;
}
var vo, lh;
function ug() {
  if (lh) return vo;
  lh = 1;
  var o = Nn(), d = pt();
  function p(u, n) {
    var l = [];
    return u[n].forEach(function(i) {
      var a = l.length;
      l.forEach(function(r, e) {
        r.tag === i.tag && r.kind === i.kind && r.multi === i.multi && (a = e);
      }), l[a] = i;
    }), l;
  }
  function c() {
    var u = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, n, l;
    function i(a) {
      a.multi ? (u.multi[a.kind].push(a), u.multi.fallback.push(a)) : u[a.kind][a.tag] = u.fallback[a.tag] = a;
    }
    for (n = 0, l = arguments.length; n < l; n += 1)
      arguments[n].forEach(i);
    return u;
  }
  function h(u) {
    return this.extend(u);
  }
  return h.prototype.extend = function(n) {
    var l = [], i = [];
    if (n instanceof d)
      i.push(n);
    else if (Array.isArray(n))
      i = i.concat(n);
    else if (n && (Array.isArray(n.implicit) || Array.isArray(n.explicit)))
      n.implicit && (l = l.concat(n.implicit)), n.explicit && (i = i.concat(n.explicit));
    else
      throw new o("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    l.forEach(function(r) {
      if (!(r instanceof d))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (r.loadKind && r.loadKind !== "scalar")
        throw new o("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (r.multi)
        throw new o("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), i.forEach(function(r) {
      if (!(r instanceof d))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var a = Object.create(h.prototype);
    return a.implicit = (this.implicit || []).concat(l), a.explicit = (this.explicit || []).concat(i), a.compiledImplicit = p(a, "implicit"), a.compiledExplicit = p(a, "explicit"), a.compiledTypeMap = c(a.compiledImplicit, a.compiledExplicit), a;
  }, vo = h, vo;
}
var yo, uh;
function cg() {
  if (uh) return yo;
  uh = 1;
  var o = pt();
  return yo = new o("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(d) {
      return d !== null ? d : "";
    }
  }), yo;
}
var wo, ch;
function fg() {
  if (ch) return wo;
  ch = 1;
  var o = pt();
  return wo = new o("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(d) {
      return d !== null ? d : [];
    }
  }), wo;
}
var _o, fh;
function dg() {
  if (fh) return _o;
  fh = 1;
  var o = pt();
  return _o = new o("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(d) {
      return d !== null ? d : {};
    }
  }), _o;
}
var bo, dh;
function hg() {
  if (dh) return bo;
  dh = 1;
  var o = ug();
  return bo = new o({
    explicit: [
      cg(),
      fg(),
      dg()
    ]
  }), bo;
}
var Eo, hh;
function pg() {
  if (hh) return Eo;
  hh = 1;
  var o = pt();
  function d(h) {
    if (h === null) return !0;
    var u = h.length;
    return u === 1 && h === "~" || u === 4 && (h === "null" || h === "Null" || h === "NULL");
  }
  function p() {
    return null;
  }
  function c(h) {
    return h === null;
  }
  return Eo = new o("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: d,
    construct: p,
    predicate: c,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), Eo;
}
var So, ph;
function mg() {
  if (ph) return So;
  ph = 1;
  var o = pt();
  function d(h) {
    if (h === null) return !1;
    var u = h.length;
    return u === 4 && (h === "true" || h === "True" || h === "TRUE") || u === 5 && (h === "false" || h === "False" || h === "FALSE");
  }
  function p(h) {
    return h === "true" || h === "True" || h === "TRUE";
  }
  function c(h) {
    return Object.prototype.toString.call(h) === "[object Boolean]";
  }
  return So = new o("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: d,
    construct: p,
    predicate: c,
    represent: {
      lowercase: function(h) {
        return h ? "true" : "false";
      },
      uppercase: function(h) {
        return h ? "TRUE" : "FALSE";
      },
      camelcase: function(h) {
        return h ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), So;
}
var Ao, mh;
function gg() {
  if (mh) return Ao;
  mh = 1;
  var o = kn(), d = pt();
  function p(i) {
    return 48 <= i && i <= 57 || 65 <= i && i <= 70 || 97 <= i && i <= 102;
  }
  function c(i) {
    return 48 <= i && i <= 55;
  }
  function h(i) {
    return 48 <= i && i <= 57;
  }
  function u(i) {
    if (i === null) return !1;
    var a = i.length, r = 0, e = !1, t;
    if (!a) return !1;
    if (t = i[r], (t === "-" || t === "+") && (t = i[++r]), t === "0") {
      if (r + 1 === a) return !0;
      if (t = i[++r], t === "b") {
        for (r++; r < a; r++)
          if (t = i[r], t !== "_") {
            if (t !== "0" && t !== "1") return !1;
            e = !0;
          }
        return e && t !== "_";
      }
      if (t === "x") {
        for (r++; r < a; r++)
          if (t = i[r], t !== "_") {
            if (!p(i.charCodeAt(r))) return !1;
            e = !0;
          }
        return e && t !== "_";
      }
      if (t === "o") {
        for (r++; r < a; r++)
          if (t = i[r], t !== "_") {
            if (!c(i.charCodeAt(r))) return !1;
            e = !0;
          }
        return e && t !== "_";
      }
    }
    if (t === "_") return !1;
    for (; r < a; r++)
      if (t = i[r], t !== "_") {
        if (!h(i.charCodeAt(r)))
          return !1;
        e = !0;
      }
    return !(!e || t === "_");
  }
  function n(i) {
    var a = i, r = 1, e;
    if (a.indexOf("_") !== -1 && (a = a.replace(/_/g, "")), e = a[0], (e === "-" || e === "+") && (e === "-" && (r = -1), a = a.slice(1), e = a[0]), a === "0") return 0;
    if (e === "0") {
      if (a[1] === "b") return r * parseInt(a.slice(2), 2);
      if (a[1] === "x") return r * parseInt(a.slice(2), 16);
      if (a[1] === "o") return r * parseInt(a.slice(2), 8);
    }
    return r * parseInt(a, 10);
  }
  function l(i) {
    return Object.prototype.toString.call(i) === "[object Number]" && i % 1 === 0 && !o.isNegativeZero(i);
  }
  return Ao = new d("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: u,
    construct: n,
    predicate: l,
    represent: {
      binary: function(i) {
        return i >= 0 ? "0b" + i.toString(2) : "-0b" + i.toString(2).slice(1);
      },
      octal: function(i) {
        return i >= 0 ? "0o" + i.toString(8) : "-0o" + i.toString(8).slice(1);
      },
      decimal: function(i) {
        return i.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(i) {
        return i >= 0 ? "0x" + i.toString(16).toUpperCase() : "-0x" + i.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), Ao;
}
var Co, gh;
function vg() {
  if (gh) return Co;
  gh = 1;
  var o = kn(), d = pt(), p = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function c(i) {
    return !(i === null || !p.test(i) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    i[i.length - 1] === "_");
  }
  function h(i) {
    var a, r;
    return a = i.replace(/_/g, "").toLowerCase(), r = a[0] === "-" ? -1 : 1, "+-".indexOf(a[0]) >= 0 && (a = a.slice(1)), a === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : a === ".nan" ? NaN : r * parseFloat(a, 10);
  }
  var u = /^[-+]?[0-9]+e/;
  function n(i, a) {
    var r;
    if (isNaN(i))
      switch (a) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === i)
      switch (a) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === i)
      switch (a) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (o.isNegativeZero(i))
      return "-0.0";
    return r = i.toString(10), u.test(r) ? r.replace("e", ".e") : r;
  }
  function l(i) {
    return Object.prototype.toString.call(i) === "[object Number]" && (i % 1 !== 0 || o.isNegativeZero(i));
  }
  return Co = new d("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: c,
    construct: h,
    predicate: l,
    represent: n,
    defaultStyle: "lowercase"
  }), Co;
}
var Ro, vh;
function yg() {
  return vh || (vh = 1, Ro = hg().extend({
    implicit: [
      pg(),
      mg(),
      gg(),
      vg()
    ]
  })), Ro;
}
var To, yh;
function wg() {
  return yh || (yh = 1, To = yg()), To;
}
var Oo, wh;
function _g() {
  if (wh) return Oo;
  wh = 1;
  var o = pt(), d = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), p = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function c(n) {
    return n === null ? !1 : d.exec(n) !== null || p.exec(n) !== null;
  }
  function h(n) {
    var l, i, a, r, e, t, s, f = 0, g = null, m, v, y;
    if (l = d.exec(n), l === null && (l = p.exec(n)), l === null) throw new Error("Date resolve error");
    if (i = +l[1], a = +l[2] - 1, r = +l[3], !l[4])
      return new Date(Date.UTC(i, a, r));
    if (e = +l[4], t = +l[5], s = +l[6], l[7]) {
      for (f = l[7].slice(0, 3); f.length < 3; )
        f += "0";
      f = +f;
    }
    return l[9] && (m = +l[10], v = +(l[11] || 0), g = (m * 60 + v) * 6e4, l[9] === "-" && (g = -g)), y = new Date(Date.UTC(i, a, r, e, t, s, f)), g && y.setTime(y.getTime() - g), y;
  }
  function u(n) {
    return n.toISOString();
  }
  return Oo = new o("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: c,
    construct: h,
    instanceOf: Date,
    represent: u
  }), Oo;
}
var ko, _h;
function bg() {
  if (_h) return ko;
  _h = 1;
  var o = pt();
  function d(p) {
    return p === "<<" || p === null;
  }
  return ko = new o("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: d
  }), ko;
}
var No, bh;
function Eg() {
  if (bh) return No;
  bh = 1;
  var o = pt(), d = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function p(n) {
    if (n === null) return !1;
    var l, i, a = 0, r = n.length, e = d;
    for (i = 0; i < r; i++)
      if (l = e.indexOf(n.charAt(i)), !(l > 64)) {
        if (l < 0) return !1;
        a += 6;
      }
    return a % 8 === 0;
  }
  function c(n) {
    var l, i, a = n.replace(/[\r\n=]/g, ""), r = a.length, e = d, t = 0, s = [];
    for (l = 0; l < r; l++)
      l % 4 === 0 && l && (s.push(t >> 16 & 255), s.push(t >> 8 & 255), s.push(t & 255)), t = t << 6 | e.indexOf(a.charAt(l));
    return i = r % 4 * 6, i === 0 ? (s.push(t >> 16 & 255), s.push(t >> 8 & 255), s.push(t & 255)) : i === 18 ? (s.push(t >> 10 & 255), s.push(t >> 2 & 255)) : i === 12 && s.push(t >> 4 & 255), new Uint8Array(s);
  }
  function h(n) {
    var l = "", i = 0, a, r, e = n.length, t = d;
    for (a = 0; a < e; a++)
      a % 3 === 0 && a && (l += t[i >> 18 & 63], l += t[i >> 12 & 63], l += t[i >> 6 & 63], l += t[i & 63]), i = (i << 8) + n[a];
    return r = e % 3, r === 0 ? (l += t[i >> 18 & 63], l += t[i >> 12 & 63], l += t[i >> 6 & 63], l += t[i & 63]) : r === 2 ? (l += t[i >> 10 & 63], l += t[i >> 4 & 63], l += t[i << 2 & 63], l += t[64]) : r === 1 && (l += t[i >> 2 & 63], l += t[i << 4 & 63], l += t[64], l += t[64]), l;
  }
  function u(n) {
    return Object.prototype.toString.call(n) === "[object Uint8Array]";
  }
  return No = new o("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: p,
    construct: c,
    predicate: u,
    represent: h
  }), No;
}
var Io, Eh;
function Sg() {
  if (Eh) return Io;
  Eh = 1;
  var o = pt(), d = Object.prototype.hasOwnProperty, p = Object.prototype.toString;
  function c(u) {
    if (u === null) return !0;
    var n = [], l, i, a, r, e, t = u;
    for (l = 0, i = t.length; l < i; l += 1) {
      if (a = t[l], e = !1, p.call(a) !== "[object Object]") return !1;
      for (r in a)
        if (d.call(a, r))
          if (!e) e = !0;
          else return !1;
      if (!e) return !1;
      if (n.indexOf(r) === -1) n.push(r);
      else return !1;
    }
    return !0;
  }
  function h(u) {
    return u !== null ? u : [];
  }
  return Io = new o("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: c,
    construct: h
  }), Io;
}
var Do, Sh;
function Ag() {
  if (Sh) return Do;
  Sh = 1;
  var o = pt(), d = Object.prototype.toString;
  function p(h) {
    if (h === null) return !0;
    var u, n, l, i, a, r = h;
    for (a = new Array(r.length), u = 0, n = r.length; u < n; u += 1) {
      if (l = r[u], d.call(l) !== "[object Object]" || (i = Object.keys(l), i.length !== 1)) return !1;
      a[u] = [i[0], l[i[0]]];
    }
    return !0;
  }
  function c(h) {
    if (h === null) return [];
    var u, n, l, i, a, r = h;
    for (a = new Array(r.length), u = 0, n = r.length; u < n; u += 1)
      l = r[u], i = Object.keys(l), a[u] = [i[0], l[i[0]]];
    return a;
  }
  return Do = new o("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: p,
    construct: c
  }), Do;
}
var Po, Ah;
function Cg() {
  if (Ah) return Po;
  Ah = 1;
  var o = pt(), d = Object.prototype.hasOwnProperty;
  function p(h) {
    if (h === null) return !0;
    var u, n = h;
    for (u in n)
      if (d.call(n, u) && n[u] !== null)
        return !1;
    return !0;
  }
  function c(h) {
    return h !== null ? h : {};
  }
  return Po = new o("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: p,
    construct: c
  }), Po;
}
var xo, Ch;
function Zl() {
  return Ch || (Ch = 1, xo = wg().extend({
    implicit: [
      _g(),
      bg()
    ],
    explicit: [
      Eg(),
      Sg(),
      Ag(),
      Cg()
    ]
  })), xo;
}
var Rh;
function wy() {
  if (Rh) return di;
  Rh = 1;
  var o = kn(), d = Nn(), p = yy(), c = Zl(), h = Object.prototype.hasOwnProperty, u = 1, n = 2, l = 3, i = 4, a = 1, r = 2, e = 3, t = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, s = /[\x85\u2028\u2029]/, f = /[,\[\]\{\}]/, g = /^(?:!|!!|![a-z\-]+!)$/i, m = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function v(_) {
    return Object.prototype.toString.call(_);
  }
  function y(_) {
    return _ === 10 || _ === 13;
  }
  function E(_) {
    return _ === 9 || _ === 32;
  }
  function R(_) {
    return _ === 9 || _ === 32 || _ === 10 || _ === 13;
  }
  function C(_) {
    return _ === 44 || _ === 91 || _ === 93 || _ === 123 || _ === 125;
  }
  function I(_) {
    var re;
    return 48 <= _ && _ <= 57 ? _ - 48 : (re = _ | 32, 97 <= re && re <= 102 ? re - 97 + 10 : -1);
  }
  function k(_) {
    return _ === 120 ? 2 : _ === 117 ? 4 : _ === 85 ? 8 : 0;
  }
  function O(_) {
    return 48 <= _ && _ <= 57 ? _ - 48 : -1;
  }
  function A(_) {
    return _ === 48 ? "\0" : _ === 97 ? "\x07" : _ === 98 ? "\b" : _ === 116 || _ === 9 ? "	" : _ === 110 ? `
` : _ === 118 ? "\v" : _ === 102 ? "\f" : _ === 114 ? "\r" : _ === 101 ? "\x1B" : _ === 32 ? " " : _ === 34 ? '"' : _ === 47 ? "/" : _ === 92 ? "\\" : _ === 78 ? "" : _ === 95 ? " " : _ === 76 ? "\u2028" : _ === 80 ? "\u2029" : "";
  }
  function M(_) {
    return _ <= 65535 ? String.fromCharCode(_) : String.fromCharCode(
      (_ - 65536 >> 10) + 55296,
      (_ - 65536 & 1023) + 56320
    );
  }
  function z(_, re, oe) {
    re === "__proto__" ? Object.defineProperty(_, re, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: oe
    }) : _[re] = oe;
  }
  for (var U = new Array(256), j = new Array(256), B = 0; B < 256; B++)
    U[B] = A(B) ? 1 : 0, j[B] = A(B);
  function H(_, re) {
    this.input = _, this.filename = re.filename || null, this.schema = re.schema || c, this.onWarning = re.onWarning || null, this.legacy = re.legacy || !1, this.json = re.json || !1, this.listener = re.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = _.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function te(_, re) {
    var oe = {
      name: _.filename,
      buffer: _.input.slice(0, -1),
      // omit trailing \0
      position: _.position,
      line: _.line,
      column: _.position - _.lineStart
    };
    return oe.snippet = p(oe), new d(re, oe);
  }
  function N(_, re) {
    throw te(_, re);
  }
  function F(_, re) {
    _.onWarning && _.onWarning.call(null, te(_, re));
  }
  var G = {
    YAML: function(re, oe, ge) {
      var fe, ye, de;
      re.version !== null && N(re, "duplication of %YAML directive"), ge.length !== 1 && N(re, "YAML directive accepts exactly one argument"), fe = /^([0-9]+)\.([0-9]+)$/.exec(ge[0]), fe === null && N(re, "ill-formed argument of the YAML directive"), ye = parseInt(fe[1], 10), de = parseInt(fe[2], 10), ye !== 1 && N(re, "unacceptable YAML version of the document"), re.version = ge[0], re.checkLineBreaks = de < 2, de !== 1 && de !== 2 && F(re, "unsupported YAML version of the document");
    },
    TAG: function(re, oe, ge) {
      var fe, ye;
      ge.length !== 2 && N(re, "TAG directive accepts exactly two arguments"), fe = ge[0], ye = ge[1], g.test(fe) || N(re, "ill-formed tag handle (first argument) of the TAG directive"), h.call(re.tagMap, fe) && N(re, 'there is a previously declared suffix for "' + fe + '" tag handle'), m.test(ye) || N(re, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        ye = decodeURIComponent(ye);
      } catch {
        N(re, "tag prefix is malformed: " + ye);
      }
      re.tagMap[fe] = ye;
    }
  };
  function Q(_, re, oe, ge) {
    var fe, ye, de, Ee;
    if (re < oe) {
      if (Ee = _.input.slice(re, oe), ge)
        for (fe = 0, ye = Ee.length; fe < ye; fe += 1)
          de = Ee.charCodeAt(fe), de === 9 || 32 <= de && de <= 1114111 || N(_, "expected valid JSON character");
      else t.test(Ee) && N(_, "the stream contains non-printable characters");
      _.result += Ee;
    }
  }
  function ce(_, re, oe, ge) {
    var fe, ye, de, Ee;
    for (o.isObject(oe) || N(_, "cannot merge mappings; the provided source object is unacceptable"), fe = Object.keys(oe), de = 0, Ee = fe.length; de < Ee; de += 1)
      ye = fe[de], h.call(re, ye) || (z(re, ye, oe[ye]), ge[ye] = !0);
  }
  function ae(_, re, oe, ge, fe, ye, de, Ee, Ce) {
    var L, se;
    if (Array.isArray(fe))
      for (fe = Array.prototype.slice.call(fe), L = 0, se = fe.length; L < se; L += 1)
        Array.isArray(fe[L]) && N(_, "nested arrays are not supported inside keys"), typeof fe == "object" && v(fe[L]) === "[object Object]" && (fe[L] = "[object Object]");
    if (typeof fe == "object" && v(fe) === "[object Object]" && (fe = "[object Object]"), fe = String(fe), re === null && (re = {}), ge === "tag:yaml.org,2002:merge")
      if (Array.isArray(ye))
        for (L = 0, se = ye.length; L < se; L += 1)
          ce(_, re, ye[L], oe);
      else
        ce(_, re, ye, oe);
    else
      !_.json && !h.call(oe, fe) && h.call(re, fe) && (_.line = de || _.line, _.lineStart = Ee || _.lineStart, _.position = Ce || _.position, N(_, "duplicated mapping key")), z(re, fe, ye), delete oe[fe];
    return re;
  }
  function ve(_) {
    var re;
    re = _.input.charCodeAt(_.position), re === 10 ? _.position++ : re === 13 ? (_.position++, _.input.charCodeAt(_.position) === 10 && _.position++) : N(_, "a line break is expected"), _.line += 1, _.lineStart = _.position, _.firstTabInLine = -1;
  }
  function we(_, re, oe) {
    for (var ge = 0, fe = _.input.charCodeAt(_.position); fe !== 0; ) {
      for (; E(fe); )
        fe === 9 && _.firstTabInLine === -1 && (_.firstTabInLine = _.position), fe = _.input.charCodeAt(++_.position);
      if (re && fe === 35)
        do
          fe = _.input.charCodeAt(++_.position);
        while (fe !== 10 && fe !== 13 && fe !== 0);
      if (y(fe))
        for (ve(_), fe = _.input.charCodeAt(_.position), ge++, _.lineIndent = 0; fe === 32; )
          _.lineIndent++, fe = _.input.charCodeAt(++_.position);
      else
        break;
    }
    return oe !== -1 && ge !== 0 && _.lineIndent < oe && F(_, "deficient indentation"), ge;
  }
  function ie(_) {
    var re = _.position, oe;
    return oe = _.input.charCodeAt(re), !!((oe === 45 || oe === 46) && oe === _.input.charCodeAt(re + 1) && oe === _.input.charCodeAt(re + 2) && (re += 3, oe = _.input.charCodeAt(re), oe === 0 || R(oe)));
  }
  function be(_, re) {
    re === 1 ? _.result += " " : re > 1 && (_.result += o.repeat(`
`, re - 1));
  }
  function S(_, re, oe) {
    var ge, fe, ye, de, Ee, Ce, L, se, ne = _.kind, P = _.result, x;
    if (x = _.input.charCodeAt(_.position), R(x) || C(x) || x === 35 || x === 38 || x === 42 || x === 33 || x === 124 || x === 62 || x === 39 || x === 34 || x === 37 || x === 64 || x === 96 || (x === 63 || x === 45) && (fe = _.input.charCodeAt(_.position + 1), R(fe) || oe && C(fe)))
      return !1;
    for (_.kind = "scalar", _.result = "", ye = de = _.position, Ee = !1; x !== 0; ) {
      if (x === 58) {
        if (fe = _.input.charCodeAt(_.position + 1), R(fe) || oe && C(fe))
          break;
      } else if (x === 35) {
        if (ge = _.input.charCodeAt(_.position - 1), R(ge))
          break;
      } else {
        if (_.position === _.lineStart && ie(_) || oe && C(x))
          break;
        if (y(x))
          if (Ce = _.line, L = _.lineStart, se = _.lineIndent, we(_, !1, -1), _.lineIndent >= re) {
            Ee = !0, x = _.input.charCodeAt(_.position);
            continue;
          } else {
            _.position = de, _.line = Ce, _.lineStart = L, _.lineIndent = se;
            break;
          }
      }
      Ee && (Q(_, ye, de, !1), be(_, _.line - Ce), ye = de = _.position, Ee = !1), E(x) || (de = _.position + 1), x = _.input.charCodeAt(++_.position);
    }
    return Q(_, ye, de, !1), _.result ? !0 : (_.kind = ne, _.result = P, !1);
  }
  function b(_, re) {
    var oe, ge, fe;
    if (oe = _.input.charCodeAt(_.position), oe !== 39)
      return !1;
    for (_.kind = "scalar", _.result = "", _.position++, ge = fe = _.position; (oe = _.input.charCodeAt(_.position)) !== 0; )
      if (oe === 39)
        if (Q(_, ge, _.position, !0), oe = _.input.charCodeAt(++_.position), oe === 39)
          ge = _.position, _.position++, fe = _.position;
        else
          return !0;
      else y(oe) ? (Q(_, ge, fe, !0), be(_, we(_, !1, re)), ge = fe = _.position) : _.position === _.lineStart && ie(_) ? N(_, "unexpected end of the document within a single quoted scalar") : (_.position++, fe = _.position);
    N(_, "unexpected end of the stream within a single quoted scalar");
  }
  function W(_, re) {
    var oe, ge, fe, ye, de, Ee;
    if (Ee = _.input.charCodeAt(_.position), Ee !== 34)
      return !1;
    for (_.kind = "scalar", _.result = "", _.position++, oe = ge = _.position; (Ee = _.input.charCodeAt(_.position)) !== 0; ) {
      if (Ee === 34)
        return Q(_, oe, _.position, !0), _.position++, !0;
      if (Ee === 92) {
        if (Q(_, oe, _.position, !0), Ee = _.input.charCodeAt(++_.position), y(Ee))
          we(_, !1, re);
        else if (Ee < 256 && U[Ee])
          _.result += j[Ee], _.position++;
        else if ((de = k(Ee)) > 0) {
          for (fe = de, ye = 0; fe > 0; fe--)
            Ee = _.input.charCodeAt(++_.position), (de = I(Ee)) >= 0 ? ye = (ye << 4) + de : N(_, "expected hexadecimal character");
          _.result += M(ye), _.position++;
        } else
          N(_, "unknown escape sequence");
        oe = ge = _.position;
      } else y(Ee) ? (Q(_, oe, ge, !0), be(_, we(_, !1, re)), oe = ge = _.position) : _.position === _.lineStart && ie(_) ? N(_, "unexpected end of the document within a double quoted scalar") : (_.position++, ge = _.position);
    }
    N(_, "unexpected end of the stream within a double quoted scalar");
  }
  function $(_, re) {
    var oe = !0, ge, fe, ye, de = _.tag, Ee, Ce = _.anchor, L, se, ne, P, x, Y = /* @__PURE__ */ Object.create(null), T, J, ue, w;
    if (w = _.input.charCodeAt(_.position), w === 91)
      se = 93, x = !1, Ee = [];
    else if (w === 123)
      se = 125, x = !0, Ee = {};
    else
      return !1;
    for (_.anchor !== null && (_.anchorMap[_.anchor] = Ee), w = _.input.charCodeAt(++_.position); w !== 0; ) {
      if (we(_, !0, re), w = _.input.charCodeAt(_.position), w === se)
        return _.position++, _.tag = de, _.anchor = Ce, _.kind = x ? "mapping" : "sequence", _.result = Ee, !0;
      oe ? w === 44 && N(_, "expected the node content, but found ','") : N(_, "missed comma between flow collection entries"), J = T = ue = null, ne = P = !1, w === 63 && (L = _.input.charCodeAt(_.position + 1), R(L) && (ne = P = !0, _.position++, we(_, !0, re))), ge = _.line, fe = _.lineStart, ye = _.position, Oe(_, re, u, !1, !0), J = _.tag, T = _.result, we(_, !0, re), w = _.input.charCodeAt(_.position), (P || _.line === ge) && w === 58 && (ne = !0, w = _.input.charCodeAt(++_.position), we(_, !0, re), Oe(_, re, u, !1, !0), ue = _.result), x ? ae(_, Ee, Y, J, T, ue, ge, fe, ye) : ne ? Ee.push(ae(_, null, Y, J, T, ue, ge, fe, ye)) : Ee.push(T), we(_, !0, re), w = _.input.charCodeAt(_.position), w === 44 ? (oe = !0, w = _.input.charCodeAt(++_.position)) : oe = !1;
    }
    N(_, "unexpected end of the stream within a flow collection");
  }
  function he(_, re) {
    var oe, ge, fe = a, ye = !1, de = !1, Ee = re, Ce = 0, L = !1, se, ne;
    if (ne = _.input.charCodeAt(_.position), ne === 124)
      ge = !1;
    else if (ne === 62)
      ge = !0;
    else
      return !1;
    for (_.kind = "scalar", _.result = ""; ne !== 0; )
      if (ne = _.input.charCodeAt(++_.position), ne === 43 || ne === 45)
        a === fe ? fe = ne === 43 ? e : r : N(_, "repeat of a chomping mode identifier");
      else if ((se = O(ne)) >= 0)
        se === 0 ? N(_, "bad explicit indentation width of a block scalar; it cannot be less than one") : de ? N(_, "repeat of an indentation width identifier") : (Ee = re + se - 1, de = !0);
      else
        break;
    if (E(ne)) {
      do
        ne = _.input.charCodeAt(++_.position);
      while (E(ne));
      if (ne === 35)
        do
          ne = _.input.charCodeAt(++_.position);
        while (!y(ne) && ne !== 0);
    }
    for (; ne !== 0; ) {
      for (ve(_), _.lineIndent = 0, ne = _.input.charCodeAt(_.position); (!de || _.lineIndent < Ee) && ne === 32; )
        _.lineIndent++, ne = _.input.charCodeAt(++_.position);
      if (!de && _.lineIndent > Ee && (Ee = _.lineIndent), y(ne)) {
        Ce++;
        continue;
      }
      if (_.lineIndent < Ee) {
        fe === e ? _.result += o.repeat(`
`, ye ? 1 + Ce : Ce) : fe === a && ye && (_.result += `
`);
        break;
      }
      for (ge ? E(ne) ? (L = !0, _.result += o.repeat(`
`, ye ? 1 + Ce : Ce)) : L ? (L = !1, _.result += o.repeat(`
`, Ce + 1)) : Ce === 0 ? ye && (_.result += " ") : _.result += o.repeat(`
`, Ce) : _.result += o.repeat(`
`, ye ? 1 + Ce : Ce), ye = !0, de = !0, Ce = 0, oe = _.position; !y(ne) && ne !== 0; )
        ne = _.input.charCodeAt(++_.position);
      Q(_, oe, _.position, !1);
    }
    return !0;
  }
  function le(_, re) {
    var oe, ge = _.tag, fe = _.anchor, ye = [], de, Ee = !1, Ce;
    if (_.firstTabInLine !== -1) return !1;
    for (_.anchor !== null && (_.anchorMap[_.anchor] = ye), Ce = _.input.charCodeAt(_.position); Ce !== 0 && (_.firstTabInLine !== -1 && (_.position = _.firstTabInLine, N(_, "tab characters must not be used in indentation")), !(Ce !== 45 || (de = _.input.charCodeAt(_.position + 1), !R(de)))); ) {
      if (Ee = !0, _.position++, we(_, !0, -1) && _.lineIndent <= re) {
        ye.push(null), Ce = _.input.charCodeAt(_.position);
        continue;
      }
      if (oe = _.line, Oe(_, re, l, !1, !0), ye.push(_.result), we(_, !0, -1), Ce = _.input.charCodeAt(_.position), (_.line === oe || _.lineIndent > re) && Ce !== 0)
        N(_, "bad indentation of a sequence entry");
      else if (_.lineIndent < re)
        break;
    }
    return Ee ? (_.tag = ge, _.anchor = fe, _.kind = "sequence", _.result = ye, !0) : !1;
  }
  function me(_, re, oe) {
    var ge, fe, ye, de, Ee, Ce, L = _.tag, se = _.anchor, ne = {}, P = /* @__PURE__ */ Object.create(null), x = null, Y = null, T = null, J = !1, ue = !1, w;
    if (_.firstTabInLine !== -1) return !1;
    for (_.anchor !== null && (_.anchorMap[_.anchor] = ne), w = _.input.charCodeAt(_.position); w !== 0; ) {
      if (!J && _.firstTabInLine !== -1 && (_.position = _.firstTabInLine, N(_, "tab characters must not be used in indentation")), ge = _.input.charCodeAt(_.position + 1), ye = _.line, (w === 63 || w === 58) && R(ge))
        w === 63 ? (J && (ae(_, ne, P, x, Y, null, de, Ee, Ce), x = Y = T = null), ue = !0, J = !0, fe = !0) : J ? (J = !1, fe = !0) : N(_, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), _.position += 1, w = ge;
      else {
        if (de = _.line, Ee = _.lineStart, Ce = _.position, !Oe(_, oe, n, !1, !0))
          break;
        if (_.line === ye) {
          for (w = _.input.charCodeAt(_.position); E(w); )
            w = _.input.charCodeAt(++_.position);
          if (w === 58)
            w = _.input.charCodeAt(++_.position), R(w) || N(_, "a whitespace character is expected after the key-value separator within a block mapping"), J && (ae(_, ne, P, x, Y, null, de, Ee, Ce), x = Y = T = null), ue = !0, J = !1, fe = !1, x = _.tag, Y = _.result;
          else if (ue)
            N(_, "can not read an implicit mapping pair; a colon is missed");
          else
            return _.tag = L, _.anchor = se, !0;
        } else if (ue)
          N(_, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return _.tag = L, _.anchor = se, !0;
      }
      if ((_.line === ye || _.lineIndent > re) && (J && (de = _.line, Ee = _.lineStart, Ce = _.position), Oe(_, re, i, !0, fe) && (J ? Y = _.result : T = _.result), J || (ae(_, ne, P, x, Y, T, de, Ee, Ce), x = Y = T = null), we(_, !0, -1), w = _.input.charCodeAt(_.position)), (_.line === ye || _.lineIndent > re) && w !== 0)
        N(_, "bad indentation of a mapping entry");
      else if (_.lineIndent < re)
        break;
    }
    return J && ae(_, ne, P, x, Y, null, de, Ee, Ce), ue && (_.tag = L, _.anchor = se, _.kind = "mapping", _.result = ne), ue;
  }
  function Ne(_) {
    var re, oe = !1, ge = !1, fe, ye, de;
    if (de = _.input.charCodeAt(_.position), de !== 33) return !1;
    if (_.tag !== null && N(_, "duplication of a tag property"), de = _.input.charCodeAt(++_.position), de === 60 ? (oe = !0, de = _.input.charCodeAt(++_.position)) : de === 33 ? (ge = !0, fe = "!!", de = _.input.charCodeAt(++_.position)) : fe = "!", re = _.position, oe) {
      do
        de = _.input.charCodeAt(++_.position);
      while (de !== 0 && de !== 62);
      _.position < _.length ? (ye = _.input.slice(re, _.position), de = _.input.charCodeAt(++_.position)) : N(_, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; de !== 0 && !R(de); )
        de === 33 && (ge ? N(_, "tag suffix cannot contain exclamation marks") : (fe = _.input.slice(re - 1, _.position + 1), g.test(fe) || N(_, "named tag handle cannot contain such characters"), ge = !0, re = _.position + 1)), de = _.input.charCodeAt(++_.position);
      ye = _.input.slice(re, _.position), f.test(ye) && N(_, "tag suffix cannot contain flow indicator characters");
    }
    ye && !m.test(ye) && N(_, "tag name cannot contain such characters: " + ye);
    try {
      ye = decodeURIComponent(ye);
    } catch {
      N(_, "tag name is malformed: " + ye);
    }
    return oe ? _.tag = ye : h.call(_.tagMap, fe) ? _.tag = _.tagMap[fe] + ye : fe === "!" ? _.tag = "!" + ye : fe === "!!" ? _.tag = "tag:yaml.org,2002:" + ye : N(_, 'undeclared tag handle "' + fe + '"'), !0;
  }
  function Te(_) {
    var re, oe;
    if (oe = _.input.charCodeAt(_.position), oe !== 38) return !1;
    for (_.anchor !== null && N(_, "duplication of an anchor property"), oe = _.input.charCodeAt(++_.position), re = _.position; oe !== 0 && !R(oe) && !C(oe); )
      oe = _.input.charCodeAt(++_.position);
    return _.position === re && N(_, "name of an anchor node must contain at least one character"), _.anchor = _.input.slice(re, _.position), !0;
  }
  function $e(_) {
    var re, oe, ge;
    if (ge = _.input.charCodeAt(_.position), ge !== 42) return !1;
    for (ge = _.input.charCodeAt(++_.position), re = _.position; ge !== 0 && !R(ge) && !C(ge); )
      ge = _.input.charCodeAt(++_.position);
    return _.position === re && N(_, "name of an alias node must contain at least one character"), oe = _.input.slice(re, _.position), h.call(_.anchorMap, oe) || N(_, 'unidentified alias "' + oe + '"'), _.result = _.anchorMap[oe], we(_, !0, -1), !0;
  }
  function Oe(_, re, oe, ge, fe) {
    var ye, de, Ee, Ce = 1, L = !1, se = !1, ne, P, x, Y, T, J;
    if (_.listener !== null && _.listener("open", _), _.tag = null, _.anchor = null, _.kind = null, _.result = null, ye = de = Ee = i === oe || l === oe, ge && we(_, !0, -1) && (L = !0, _.lineIndent > re ? Ce = 1 : _.lineIndent === re ? Ce = 0 : _.lineIndent < re && (Ce = -1)), Ce === 1)
      for (; Ne(_) || Te(_); )
        we(_, !0, -1) ? (L = !0, Ee = ye, _.lineIndent > re ? Ce = 1 : _.lineIndent === re ? Ce = 0 : _.lineIndent < re && (Ce = -1)) : Ee = !1;
    if (Ee && (Ee = L || fe), (Ce === 1 || i === oe) && (u === oe || n === oe ? T = re : T = re + 1, J = _.position - _.lineStart, Ce === 1 ? Ee && (le(_, J) || me(_, J, T)) || $(_, T) ? se = !0 : (de && he(_, T) || b(_, T) || W(_, T) ? se = !0 : $e(_) ? (se = !0, (_.tag !== null || _.anchor !== null) && N(_, "alias node should not have any properties")) : S(_, T, u === oe) && (se = !0, _.tag === null && (_.tag = "?")), _.anchor !== null && (_.anchorMap[_.anchor] = _.result)) : Ce === 0 && (se = Ee && le(_, J))), _.tag === null)
      _.anchor !== null && (_.anchorMap[_.anchor] = _.result);
    else if (_.tag === "?") {
      for (_.result !== null && _.kind !== "scalar" && N(_, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + _.kind + '"'), ne = 0, P = _.implicitTypes.length; ne < P; ne += 1)
        if (Y = _.implicitTypes[ne], Y.resolve(_.result)) {
          _.result = Y.construct(_.result), _.tag = Y.tag, _.anchor !== null && (_.anchorMap[_.anchor] = _.result);
          break;
        }
    } else if (_.tag !== "!") {
      if (h.call(_.typeMap[_.kind || "fallback"], _.tag))
        Y = _.typeMap[_.kind || "fallback"][_.tag];
      else
        for (Y = null, x = _.typeMap.multi[_.kind || "fallback"], ne = 0, P = x.length; ne < P; ne += 1)
          if (_.tag.slice(0, x[ne].tag.length) === x[ne].tag) {
            Y = x[ne];
            break;
          }
      Y || N(_, "unknown tag !<" + _.tag + ">"), _.result !== null && Y.kind !== _.kind && N(_, "unacceptable node kind for !<" + _.tag + '> tag; it should be "' + Y.kind + '", not "' + _.kind + '"'), Y.resolve(_.result, _.tag) ? (_.result = Y.construct(_.result, _.tag), _.anchor !== null && (_.anchorMap[_.anchor] = _.result)) : N(_, "cannot resolve a node with !<" + _.tag + "> explicit tag");
    }
    return _.listener !== null && _.listener("close", _), _.tag !== null || _.anchor !== null || se;
  }
  function ke(_) {
    var re = _.position, oe, ge, fe, ye = !1, de;
    for (_.version = null, _.checkLineBreaks = _.legacy, _.tagMap = /* @__PURE__ */ Object.create(null), _.anchorMap = /* @__PURE__ */ Object.create(null); (de = _.input.charCodeAt(_.position)) !== 0 && (we(_, !0, -1), de = _.input.charCodeAt(_.position), !(_.lineIndent > 0 || de !== 37)); ) {
      for (ye = !0, de = _.input.charCodeAt(++_.position), oe = _.position; de !== 0 && !R(de); )
        de = _.input.charCodeAt(++_.position);
      for (ge = _.input.slice(oe, _.position), fe = [], ge.length < 1 && N(_, "directive name must not be less than one character in length"); de !== 0; ) {
        for (; E(de); )
          de = _.input.charCodeAt(++_.position);
        if (de === 35) {
          do
            de = _.input.charCodeAt(++_.position);
          while (de !== 0 && !y(de));
          break;
        }
        if (y(de)) break;
        for (oe = _.position; de !== 0 && !R(de); )
          de = _.input.charCodeAt(++_.position);
        fe.push(_.input.slice(oe, _.position));
      }
      de !== 0 && ve(_), h.call(G, ge) ? G[ge](_, ge, fe) : F(_, 'unknown document directive "' + ge + '"');
    }
    if (we(_, !0, -1), _.lineIndent === 0 && _.input.charCodeAt(_.position) === 45 && _.input.charCodeAt(_.position + 1) === 45 && _.input.charCodeAt(_.position + 2) === 45 ? (_.position += 3, we(_, !0, -1)) : ye && N(_, "directives end mark is expected"), Oe(_, _.lineIndent - 1, i, !1, !0), we(_, !0, -1), _.checkLineBreaks && s.test(_.input.slice(re, _.position)) && F(_, "non-ASCII line breaks are interpreted as content"), _.documents.push(_.result), _.position === _.lineStart && ie(_)) {
      _.input.charCodeAt(_.position) === 46 && (_.position += 3, we(_, !0, -1));
      return;
    }
    if (_.position < _.length - 1)
      N(_, "end of the stream or a document separator is expected");
    else
      return;
  }
  function He(_, re) {
    _ = String(_), re = re || {}, _.length !== 0 && (_.charCodeAt(_.length - 1) !== 10 && _.charCodeAt(_.length - 1) !== 13 && (_ += `
`), _.charCodeAt(0) === 65279 && (_ = _.slice(1)));
    var oe = new H(_, re), ge = _.indexOf("\0");
    for (ge !== -1 && (oe.position = ge, N(oe, "null byte is not allowed in input")), oe.input += "\0"; oe.input.charCodeAt(oe.position) === 32; )
      oe.lineIndent += 1, oe.position += 1;
    for (; oe.position < oe.length - 1; )
      ke(oe);
    return oe.documents;
  }
  function Qe(_, re, oe) {
    re !== null && typeof re == "object" && typeof oe > "u" && (oe = re, re = null);
    var ge = He(_, oe);
    if (typeof re != "function")
      return ge;
    for (var fe = 0, ye = ge.length; fe < ye; fe += 1)
      re(ge[fe]);
  }
  function Ge(_, re) {
    var oe = He(_, re);
    if (oe.length !== 0) {
      if (oe.length === 1)
        return oe[0];
      throw new d("expected a single document in the stream, but found more");
    }
  }
  return di.loadAll = Qe, di.load = Ge, di;
}
var Lo = {}, Th;
function _y() {
  if (Th) return Lo;
  Th = 1;
  var o = kn(), d = Nn(), p = Zl(), c = Object.prototype.toString, h = Object.prototype.hasOwnProperty, u = 65279, n = 9, l = 10, i = 13, a = 32, r = 33, e = 34, t = 35, s = 37, f = 38, g = 39, m = 42, v = 44, y = 45, E = 58, R = 61, C = 62, I = 63, k = 64, O = 91, A = 93, M = 96, z = 123, U = 124, j = 125, B = {};
  B[0] = "\\0", B[7] = "\\a", B[8] = "\\b", B[9] = "\\t", B[10] = "\\n", B[11] = "\\v", B[12] = "\\f", B[13] = "\\r", B[27] = "\\e", B[34] = '\\"', B[92] = "\\\\", B[133] = "\\N", B[160] = "\\_", B[8232] = "\\L", B[8233] = "\\P";
  var H = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], te = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function N(P, x) {
    var Y, T, J, ue, w, V, Z;
    if (x === null) return {};
    for (Y = {}, T = Object.keys(x), J = 0, ue = T.length; J < ue; J += 1)
      w = T[J], V = String(x[w]), w.slice(0, 2) === "!!" && (w = "tag:yaml.org,2002:" + w.slice(2)), Z = P.compiledTypeMap.fallback[w], Z && h.call(Z.styleAliases, V) && (V = Z.styleAliases[V]), Y[w] = V;
    return Y;
  }
  function F(P) {
    var x, Y, T;
    if (x = P.toString(16).toUpperCase(), P <= 255)
      Y = "x", T = 2;
    else if (P <= 65535)
      Y = "u", T = 4;
    else if (P <= 4294967295)
      Y = "U", T = 8;
    else
      throw new d("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + Y + o.repeat("0", T - x.length) + x;
  }
  var G = 1, Q = 2;
  function ce(P) {
    this.schema = P.schema || p, this.indent = Math.max(1, P.indent || 2), this.noArrayIndent = P.noArrayIndent || !1, this.skipInvalid = P.skipInvalid || !1, this.flowLevel = o.isNothing(P.flowLevel) ? -1 : P.flowLevel, this.styleMap = N(this.schema, P.styles || null), this.sortKeys = P.sortKeys || !1, this.lineWidth = P.lineWidth || 80, this.noRefs = P.noRefs || !1, this.noCompatMode = P.noCompatMode || !1, this.condenseFlow = P.condenseFlow || !1, this.quotingType = P.quotingType === '"' ? Q : G, this.forceQuotes = P.forceQuotes || !1, this.replacer = typeof P.replacer == "function" ? P.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function ae(P, x) {
    for (var Y = o.repeat(" ", x), T = 0, J = -1, ue = "", w, V = P.length; T < V; )
      J = P.indexOf(`
`, T), J === -1 ? (w = P.slice(T), T = V) : (w = P.slice(T, J + 1), T = J + 1), w.length && w !== `
` && (ue += Y), ue += w;
    return ue;
  }
  function ve(P, x) {
    return `
` + o.repeat(" ", P.indent * x);
  }
  function we(P, x) {
    var Y, T, J;
    for (Y = 0, T = P.implicitTypes.length; Y < T; Y += 1)
      if (J = P.implicitTypes[Y], J.resolve(x))
        return !0;
    return !1;
  }
  function ie(P) {
    return P === a || P === n;
  }
  function be(P) {
    return 32 <= P && P <= 126 || 161 <= P && P <= 55295 && P !== 8232 && P !== 8233 || 57344 <= P && P <= 65533 && P !== u || 65536 <= P && P <= 1114111;
  }
  function S(P) {
    return be(P) && P !== u && P !== i && P !== l;
  }
  function b(P, x, Y) {
    var T = S(P), J = T && !ie(P);
    return (
      // ns-plain-safe
      (Y ? (
        // c = flow-in
        T
      ) : T && P !== v && P !== O && P !== A && P !== z && P !== j) && P !== t && !(x === E && !J) || S(x) && !ie(x) && P === t || x === E && J
    );
  }
  function W(P) {
    return be(P) && P !== u && !ie(P) && P !== y && P !== I && P !== E && P !== v && P !== O && P !== A && P !== z && P !== j && P !== t && P !== f && P !== m && P !== r && P !== U && P !== R && P !== C && P !== g && P !== e && P !== s && P !== k && P !== M;
  }
  function $(P) {
    return !ie(P) && P !== E;
  }
  function he(P, x) {
    var Y = P.charCodeAt(x), T;
    return Y >= 55296 && Y <= 56319 && x + 1 < P.length && (T = P.charCodeAt(x + 1), T >= 56320 && T <= 57343) ? (Y - 55296) * 1024 + T - 56320 + 65536 : Y;
  }
  function le(P) {
    var x = /^\n* /;
    return x.test(P);
  }
  var me = 1, Ne = 2, Te = 3, $e = 4, Oe = 5;
  function ke(P, x, Y, T, J, ue, w, V) {
    var Z, D = 0, K = null, ee = !1, _e = !1, Ae = T !== -1, Se = -1, De = W(he(P, 0)) && $(he(P, P.length - 1));
    if (x || w)
      for (Z = 0; Z < P.length; D >= 65536 ? Z += 2 : Z++) {
        if (D = he(P, Z), !be(D))
          return Oe;
        De = De && b(D, K, V), K = D;
      }
    else {
      for (Z = 0; Z < P.length; D >= 65536 ? Z += 2 : Z++) {
        if (D = he(P, Z), D === l)
          ee = !0, Ae && (_e = _e || // Foldable line = too long, and not more-indented.
          Z - Se - 1 > T && P[Se + 1] !== " ", Se = Z);
        else if (!be(D))
          return Oe;
        De = De && b(D, K, V), K = D;
      }
      _e = _e || Ae && Z - Se - 1 > T && P[Se + 1] !== " ";
    }
    return !ee && !_e ? De && !w && !J(P) ? me : ue === Q ? Oe : Ne : Y > 9 && le(P) ? Oe : w ? ue === Q ? Oe : Ne : _e ? $e : Te;
  }
  function He(P, x, Y, T, J) {
    P.dump = (function() {
      if (x.length === 0)
        return P.quotingType === Q ? '""' : "''";
      if (!P.noCompatMode && (H.indexOf(x) !== -1 || te.test(x)))
        return P.quotingType === Q ? '"' + x + '"' : "'" + x + "'";
      var ue = P.indent * Math.max(1, Y), w = P.lineWidth === -1 ? -1 : Math.max(Math.min(P.lineWidth, 40), P.lineWidth - ue), V = T || P.flowLevel > -1 && Y >= P.flowLevel;
      function Z(D) {
        return we(P, D);
      }
      switch (ke(
        x,
        V,
        P.indent,
        w,
        Z,
        P.quotingType,
        P.forceQuotes && !T,
        J
      )) {
        case me:
          return x;
        case Ne:
          return "'" + x.replace(/'/g, "''") + "'";
        case Te:
          return "|" + Qe(x, P.indent) + Ge(ae(x, ue));
        case $e:
          return ">" + Qe(x, P.indent) + Ge(ae(_(x, w), ue));
        case Oe:
          return '"' + oe(x) + '"';
        default:
          throw new d("impossible error: invalid scalar style");
      }
    })();
  }
  function Qe(P, x) {
    var Y = le(P) ? String(x) : "", T = P[P.length - 1] === `
`, J = T && (P[P.length - 2] === `
` || P === `
`), ue = J ? "+" : T ? "" : "-";
    return Y + ue + `
`;
  }
  function Ge(P) {
    return P[P.length - 1] === `
` ? P.slice(0, -1) : P;
  }
  function _(P, x) {
    for (var Y = /(\n+)([^\n]*)/g, T = (function() {
      var D = P.indexOf(`
`);
      return D = D !== -1 ? D : P.length, Y.lastIndex = D, re(P.slice(0, D), x);
    })(), J = P[0] === `
` || P[0] === " ", ue, w; w = Y.exec(P); ) {
      var V = w[1], Z = w[2];
      ue = Z[0] === " ", T += V + (!J && !ue && Z !== "" ? `
` : "") + re(Z, x), J = ue;
    }
    return T;
  }
  function re(P, x) {
    if (P === "" || P[0] === " ") return P;
    for (var Y = / [^ ]/g, T, J = 0, ue, w = 0, V = 0, Z = ""; T = Y.exec(P); )
      V = T.index, V - J > x && (ue = w > J ? w : V, Z += `
` + P.slice(J, ue), J = ue + 1), w = V;
    return Z += `
`, P.length - J > x && w > J ? Z += P.slice(J, w) + `
` + P.slice(w + 1) : Z += P.slice(J), Z.slice(1);
  }
  function oe(P) {
    for (var x = "", Y = 0, T, J = 0; J < P.length; Y >= 65536 ? J += 2 : J++)
      Y = he(P, J), T = B[Y], !T && be(Y) ? (x += P[J], Y >= 65536 && (x += P[J + 1])) : x += T || F(Y);
    return x;
  }
  function ge(P, x, Y) {
    var T = "", J = P.tag, ue, w, V;
    for (ue = 0, w = Y.length; ue < w; ue += 1)
      V = Y[ue], P.replacer && (V = P.replacer.call(Y, String(ue), V)), (Ce(P, x, V, !1, !1) || typeof V > "u" && Ce(P, x, null, !1, !1)) && (T !== "" && (T += "," + (P.condenseFlow ? "" : " ")), T += P.dump);
    P.tag = J, P.dump = "[" + T + "]";
  }
  function fe(P, x, Y, T) {
    var J = "", ue = P.tag, w, V, Z;
    for (w = 0, V = Y.length; w < V; w += 1)
      Z = Y[w], P.replacer && (Z = P.replacer.call(Y, String(w), Z)), (Ce(P, x + 1, Z, !0, !0, !1, !0) || typeof Z > "u" && Ce(P, x + 1, null, !0, !0, !1, !0)) && ((!T || J !== "") && (J += ve(P, x)), P.dump && l === P.dump.charCodeAt(0) ? J += "-" : J += "- ", J += P.dump);
    P.tag = ue, P.dump = J || "[]";
  }
  function ye(P, x, Y) {
    var T = "", J = P.tag, ue = Object.keys(Y), w, V, Z, D, K;
    for (w = 0, V = ue.length; w < V; w += 1)
      K = "", T !== "" && (K += ", "), P.condenseFlow && (K += '"'), Z = ue[w], D = Y[Z], P.replacer && (D = P.replacer.call(Y, Z, D)), Ce(P, x, Z, !1, !1) && (P.dump.length > 1024 && (K += "? "), K += P.dump + (P.condenseFlow ? '"' : "") + ":" + (P.condenseFlow ? "" : " "), Ce(P, x, D, !1, !1) && (K += P.dump, T += K));
    P.tag = J, P.dump = "{" + T + "}";
  }
  function de(P, x, Y, T) {
    var J = "", ue = P.tag, w = Object.keys(Y), V, Z, D, K, ee, _e;
    if (P.sortKeys === !0)
      w.sort();
    else if (typeof P.sortKeys == "function")
      w.sort(P.sortKeys);
    else if (P.sortKeys)
      throw new d("sortKeys must be a boolean or a function");
    for (V = 0, Z = w.length; V < Z; V += 1)
      _e = "", (!T || J !== "") && (_e += ve(P, x)), D = w[V], K = Y[D], P.replacer && (K = P.replacer.call(Y, D, K)), Ce(P, x + 1, D, !0, !0, !0) && (ee = P.tag !== null && P.tag !== "?" || P.dump && P.dump.length > 1024, ee && (P.dump && l === P.dump.charCodeAt(0) ? _e += "?" : _e += "? "), _e += P.dump, ee && (_e += ve(P, x)), Ce(P, x + 1, K, !0, ee) && (P.dump && l === P.dump.charCodeAt(0) ? _e += ":" : _e += ": ", _e += P.dump, J += _e));
    P.tag = ue, P.dump = J || "{}";
  }
  function Ee(P, x, Y) {
    var T, J, ue, w, V, Z;
    for (J = Y ? P.explicitTypes : P.implicitTypes, ue = 0, w = J.length; ue < w; ue += 1)
      if (V = J[ue], (V.instanceOf || V.predicate) && (!V.instanceOf || typeof x == "object" && x instanceof V.instanceOf) && (!V.predicate || V.predicate(x))) {
        if (Y ? V.multi && V.representName ? P.tag = V.representName(x) : P.tag = V.tag : P.tag = "?", V.represent) {
          if (Z = P.styleMap[V.tag] || V.defaultStyle, c.call(V.represent) === "[object Function]")
            T = V.represent(x, Z);
          else if (h.call(V.represent, Z))
            T = V.represent[Z](x, Z);
          else
            throw new d("!<" + V.tag + '> tag resolver accepts not "' + Z + '" style');
          P.dump = T;
        }
        return !0;
      }
    return !1;
  }
  function Ce(P, x, Y, T, J, ue, w) {
    P.tag = null, P.dump = Y, Ee(P, Y, !1) || Ee(P, Y, !0);
    var V = c.call(P.dump), Z = T, D;
    T && (T = P.flowLevel < 0 || P.flowLevel > x);
    var K = V === "[object Object]" || V === "[object Array]", ee, _e;
    if (K && (ee = P.duplicates.indexOf(Y), _e = ee !== -1), (P.tag !== null && P.tag !== "?" || _e || P.indent !== 2 && x > 0) && (J = !1), _e && P.usedDuplicates[ee])
      P.dump = "*ref_" + ee;
    else {
      if (K && _e && !P.usedDuplicates[ee] && (P.usedDuplicates[ee] = !0), V === "[object Object]")
        T && Object.keys(P.dump).length !== 0 ? (de(P, x, P.dump, J), _e && (P.dump = "&ref_" + ee + P.dump)) : (ye(P, x, P.dump), _e && (P.dump = "&ref_" + ee + " " + P.dump));
      else if (V === "[object Array]")
        T && P.dump.length !== 0 ? (P.noArrayIndent && !w && x > 0 ? fe(P, x - 1, P.dump, J) : fe(P, x, P.dump, J), _e && (P.dump = "&ref_" + ee + P.dump)) : (ge(P, x, P.dump), _e && (P.dump = "&ref_" + ee + " " + P.dump));
      else if (V === "[object String]")
        P.tag !== "?" && He(P, P.dump, x, ue, Z);
      else {
        if (V === "[object Undefined]")
          return !1;
        if (P.skipInvalid) return !1;
        throw new d("unacceptable kind of an object to dump " + V);
      }
      P.tag !== null && P.tag !== "?" && (D = encodeURI(
        P.tag[0] === "!" ? P.tag.slice(1) : P.tag
      ).replace(/!/g, "%21"), P.tag[0] === "!" ? D = "!" + D : D.slice(0, 18) === "tag:yaml.org,2002:" ? D = "!!" + D.slice(18) : D = "!<" + D + ">", P.dump = D + " " + P.dump);
    }
    return !0;
  }
  function L(P, x) {
    var Y = [], T = [], J, ue;
    for (se(P, Y, T), J = 0, ue = T.length; J < ue; J += 1)
      x.duplicates.push(Y[T[J]]);
    x.usedDuplicates = new Array(ue);
  }
  function se(P, x, Y) {
    var T, J, ue;
    if (P !== null && typeof P == "object")
      if (J = x.indexOf(P), J !== -1)
        Y.indexOf(J) === -1 && Y.push(J);
      else if (x.push(P), Array.isArray(P))
        for (J = 0, ue = P.length; J < ue; J += 1)
          se(P[J], x, Y);
      else
        for (T = Object.keys(P), J = 0, ue = T.length; J < ue; J += 1)
          se(P[T[J]], x, Y);
  }
  function ne(P, x) {
    x = x || {};
    var Y = new ce(x);
    Y.noRefs || L(P, Y);
    var T = P;
    return Y.replacer && (T = Y.replacer.call({ "": T }, "", T)), Ce(Y, 0, T, !0, !0) ? Y.dump + `
` : "";
  }
  return Lo.dump = ne, Lo;
}
var Oh;
function Xl() {
  if (Oh) return dt;
  Oh = 1;
  var o = wy(), d = _y();
  function p(c, h) {
    return function() {
      throw new Error("Function yaml." + c + " is removed in js-yaml 4. Use yaml." + h + " instead, which is now safe by default.");
    };
  }
  return dt.Type = pt(), dt.Schema = ug(), dt.FAILSAFE_SCHEMA = hg(), dt.JSON_SCHEMA = yg(), dt.CORE_SCHEMA = wg(), dt.DEFAULT_SCHEMA = Zl(), dt.load = o.load, dt.loadAll = o.loadAll, dt.dump = d.dump, dt.YAMLException = Nn(), dt.types = {
    binary: Eg(),
    float: vg(),
    map: dg(),
    null: pg(),
    pairs: Ag(),
    set: Cg(),
    timestamp: _g(),
    bool: mg(),
    int: gg(),
    merge: bg(),
    omap: Sg(),
    seq: fg(),
    str: cg()
  }, dt.safeLoad = p("safeLoad", "load"), dt.safeLoadAll = p("safeLoadAll", "loadAll"), dt.safeDump = p("safeDump", "dump"), dt;
}
var Xr = {}, kh;
function by() {
  if (kh) return Xr;
  kh = 1, Object.defineProperty(Xr, "__esModule", { value: !0 }), Xr.Lazy = void 0;
  class o {
    constructor(p) {
      this._value = null, this.creator = p;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const p = this.creator();
      return this.value = p, p;
    }
    set value(p) {
      this._value = p, this.creator = null;
    }
  }
  return Xr.Lazy = o, Xr;
}
var hi = { exports: {} }, Fo, Nh;
function Pi() {
  if (Nh) return Fo;
  Nh = 1;
  const o = "2.0.0", d = 256, p = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, c = 16, h = d - 6;
  return Fo = {
    MAX_LENGTH: d,
    MAX_SAFE_COMPONENT_LENGTH: c,
    MAX_SAFE_BUILD_LENGTH: h,
    MAX_SAFE_INTEGER: p,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: o,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Fo;
}
var Uo, Ih;
function xi() {
  return Ih || (Ih = 1, Uo = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...d) => console.error("SEMVER", ...d) : () => {
  }), Uo;
}
var Dh;
function In() {
  return Dh || (Dh = 1, (function(o, d) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: p,
      MAX_SAFE_BUILD_LENGTH: c,
      MAX_LENGTH: h
    } = Pi(), u = xi();
    d = o.exports = {};
    const n = d.re = [], l = d.safeRe = [], i = d.src = [], a = d.safeSrc = [], r = d.t = {};
    let e = 0;
    const t = "[a-zA-Z0-9-]", s = [
      ["\\s", 1],
      ["\\d", h],
      [t, c]
    ], f = (m) => {
      for (const [v, y] of s)
        m = m.split(`${v}*`).join(`${v}{0,${y}}`).split(`${v}+`).join(`${v}{1,${y}}`);
      return m;
    }, g = (m, v, y) => {
      const E = f(v), R = e++;
      u(m, R, v), r[m] = R, i[R] = v, a[R] = E, n[R] = new RegExp(v, y ? "g" : void 0), l[R] = new RegExp(E, y ? "g" : void 0);
    };
    g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${t}*`), g("MAINVERSION", `(${i[r.NUMERICIDENTIFIER]})\\.(${i[r.NUMERICIDENTIFIER]})\\.(${i[r.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${i[r.NUMERICIDENTIFIERLOOSE]})\\.(${i[r.NUMERICIDENTIFIERLOOSE]})\\.(${i[r.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${i[r.NONNUMERICIDENTIFIER]}|${i[r.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${i[r.NONNUMERICIDENTIFIER]}|${i[r.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${i[r.PRERELEASEIDENTIFIER]}(?:\\.${i[r.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${i[r.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${i[r.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${t}+`), g("BUILD", `(?:\\+(${i[r.BUILDIDENTIFIER]}(?:\\.${i[r.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${i[r.MAINVERSION]}${i[r.PRERELEASE]}?${i[r.BUILD]}?`), g("FULL", `^${i[r.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${i[r.MAINVERSIONLOOSE]}${i[r.PRERELEASELOOSE]}?${i[r.BUILD]}?`), g("LOOSE", `^${i[r.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${i[r.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${i[r.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${i[r.XRANGEIDENTIFIER]})(?:\\.(${i[r.XRANGEIDENTIFIER]})(?:\\.(${i[r.XRANGEIDENTIFIER]})(?:${i[r.PRERELEASE]})?${i[r.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${i[r.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[r.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[r.XRANGEIDENTIFIERLOOSE]})(?:${i[r.PRERELEASELOOSE]})?${i[r.BUILD]}?)?)?`), g("XRANGE", `^${i[r.GTLT]}\\s*${i[r.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${i[r.GTLT]}\\s*${i[r.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${p}})(?:\\.(\\d{1,${p}}))?(?:\\.(\\d{1,${p}}))?`), g("COERCE", `${i[r.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", i[r.COERCEPLAIN] + `(?:${i[r.PRERELEASE]})?(?:${i[r.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", i[r.COERCE], !0), g("COERCERTLFULL", i[r.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${i[r.LONETILDE]}\\s+`, !0), d.tildeTrimReplace = "$1~", g("TILDE", `^${i[r.LONETILDE]}${i[r.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${i[r.LONETILDE]}${i[r.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${i[r.LONECARET]}\\s+`, !0), d.caretTrimReplace = "$1^", g("CARET", `^${i[r.LONECARET]}${i[r.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${i[r.LONECARET]}${i[r.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${i[r.GTLT]}\\s*(${i[r.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${i[r.GTLT]}\\s*(${i[r.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${i[r.GTLT]}\\s*(${i[r.LOOSEPLAIN]}|${i[r.XRANGEPLAIN]})`, !0), d.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${i[r.XRANGEPLAIN]})\\s+-\\s+(${i[r.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${i[r.XRANGEPLAINLOOSE]})\\s+-\\s+(${i[r.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(hi, hi.exports)), hi.exports;
}
var $o, Ph;
function Ql() {
  if (Ph) return $o;
  Ph = 1;
  const o = Object.freeze({ loose: !0 }), d = Object.freeze({});
  return $o = (c) => c ? typeof c != "object" ? o : c : d, $o;
}
var qo, xh;
function Rg() {
  if (xh) return qo;
  xh = 1;
  const o = /^[0-9]+$/, d = (c, h) => {
    if (typeof c == "number" && typeof h == "number")
      return c === h ? 0 : c < h ? -1 : 1;
    const u = o.test(c), n = o.test(h);
    return u && n && (c = +c, h = +h), c === h ? 0 : u && !n ? -1 : n && !u ? 1 : c < h ? -1 : 1;
  };
  return qo = {
    compareIdentifiers: d,
    rcompareIdentifiers: (c, h) => d(h, c)
  }, qo;
}
var Mo, Lh;
function mt() {
  if (Lh) return Mo;
  Lh = 1;
  const o = xi(), { MAX_LENGTH: d, MAX_SAFE_INTEGER: p } = Pi(), { safeRe: c, t: h } = In(), u = Ql(), { compareIdentifiers: n } = Rg();
  class l {
    constructor(a, r) {
      if (r = u(r), a instanceof l) {
        if (a.loose === !!r.loose && a.includePrerelease === !!r.includePrerelease)
          return a;
        a = a.version;
      } else if (typeof a != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof a}".`);
      if (a.length > d)
        throw new TypeError(
          `version is longer than ${d} characters`
        );
      o("SemVer", a, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
      const e = a.trim().match(r.loose ? c[h.LOOSE] : c[h.FULL]);
      if (!e)
        throw new TypeError(`Invalid Version: ${a}`);
      if (this.raw = a, this.major = +e[1], this.minor = +e[2], this.patch = +e[3], this.major > p || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > p || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > p || this.patch < 0)
        throw new TypeError("Invalid patch version");
      e[4] ? this.prerelease = e[4].split(".").map((t) => {
        if (/^[0-9]+$/.test(t)) {
          const s = +t;
          if (s >= 0 && s < p)
            return s;
        }
        return t;
      }) : this.prerelease = [], this.build = e[5] ? e[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(a) {
      if (o("SemVer.compare", this.version, this.options, a), !(a instanceof l)) {
        if (typeof a == "string" && a === this.version)
          return 0;
        a = new l(a, this.options);
      }
      return a.version === this.version ? 0 : this.compareMain(a) || this.comparePre(a);
    }
    compareMain(a) {
      return a instanceof l || (a = new l(a, this.options)), this.major < a.major ? -1 : this.major > a.major ? 1 : this.minor < a.minor ? -1 : this.minor > a.minor ? 1 : this.patch < a.patch ? -1 : this.patch > a.patch ? 1 : 0;
    }
    comparePre(a) {
      if (a instanceof l || (a = new l(a, this.options)), this.prerelease.length && !a.prerelease.length)
        return -1;
      if (!this.prerelease.length && a.prerelease.length)
        return 1;
      if (!this.prerelease.length && !a.prerelease.length)
        return 0;
      let r = 0;
      do {
        const e = this.prerelease[r], t = a.prerelease[r];
        if (o("prerelease compare", r, e, t), e === void 0 && t === void 0)
          return 0;
        if (t === void 0)
          return 1;
        if (e === void 0)
          return -1;
        if (e === t)
          continue;
        return n(e, t);
      } while (++r);
    }
    compareBuild(a) {
      a instanceof l || (a = new l(a, this.options));
      let r = 0;
      do {
        const e = this.build[r], t = a.build[r];
        if (o("build compare", r, e, t), e === void 0 && t === void 0)
          return 0;
        if (t === void 0)
          return 1;
        if (e === void 0)
          return -1;
        if (e === t)
          continue;
        return n(e, t);
      } while (++r);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(a, r, e) {
      if (a.startsWith("pre")) {
        if (!r && e === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (r) {
          const t = `-${r}`.match(this.options.loose ? c[h.PRERELEASELOOSE] : c[h.PRERELEASE]);
          if (!t || t[1] !== r)
            throw new Error(`invalid identifier: ${r}`);
        }
      }
      switch (a) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, e);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, e);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", r, e), this.inc("pre", r, e);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", r, e), this.inc("pre", r, e);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const t = Number(e) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [t];
          else {
            let s = this.prerelease.length;
            for (; --s >= 0; )
              typeof this.prerelease[s] == "number" && (this.prerelease[s]++, s = -2);
            if (s === -1) {
              if (r === this.prerelease.join(".") && e === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(t);
            }
          }
          if (r) {
            let s = [r, t];
            e === !1 && (s = [r]), n(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = s) : this.prerelease = s;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${a}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Mo = l, Mo;
}
var Bo, Fh;
function Fr() {
  if (Fh) return Bo;
  Fh = 1;
  const o = mt();
  return Bo = (p, c, h = !1) => {
    if (p instanceof o)
      return p;
    try {
      return new o(p, c);
    } catch (u) {
      if (!h)
        return null;
      throw u;
    }
  }, Bo;
}
var jo, Uh;
function Ey() {
  if (Uh) return jo;
  Uh = 1;
  const o = Fr();
  return jo = (p, c) => {
    const h = o(p, c);
    return h ? h.version : null;
  }, jo;
}
var Ho, $h;
function Sy() {
  if ($h) return Ho;
  $h = 1;
  const o = Fr();
  return Ho = (p, c) => {
    const h = o(p.trim().replace(/^[=v]+/, ""), c);
    return h ? h.version : null;
  }, Ho;
}
var zo, qh;
function Ay() {
  if (qh) return zo;
  qh = 1;
  const o = mt();
  return zo = (p, c, h, u, n) => {
    typeof h == "string" && (n = u, u = h, h = void 0);
    try {
      return new o(
        p instanceof o ? p.version : p,
        h
      ).inc(c, u, n).version;
    } catch {
      return null;
    }
  }, zo;
}
var Go, Mh;
function Cy() {
  if (Mh) return Go;
  Mh = 1;
  const o = Fr();
  return Go = (p, c) => {
    const h = o(p, null, !0), u = o(c, null, !0), n = h.compare(u);
    if (n === 0)
      return null;
    const l = n > 0, i = l ? h : u, a = l ? u : h, r = !!i.prerelease.length;
    if (!!a.prerelease.length && !r) {
      if (!a.patch && !a.minor)
        return "major";
      if (a.compareMain(i) === 0)
        return a.minor && !a.patch ? "minor" : "patch";
    }
    const t = r ? "pre" : "";
    return h.major !== u.major ? t + "major" : h.minor !== u.minor ? t + "minor" : h.patch !== u.patch ? t + "patch" : "prerelease";
  }, Go;
}
var Wo, Bh;
function Ry() {
  if (Bh) return Wo;
  Bh = 1;
  const o = mt();
  return Wo = (p, c) => new o(p, c).major, Wo;
}
var Yo, jh;
function Ty() {
  if (jh) return Yo;
  jh = 1;
  const o = mt();
  return Yo = (p, c) => new o(p, c).minor, Yo;
}
var Ko, Hh;
function Oy() {
  if (Hh) return Ko;
  Hh = 1;
  const o = mt();
  return Ko = (p, c) => new o(p, c).patch, Ko;
}
var Vo, zh;
function ky() {
  if (zh) return Vo;
  zh = 1;
  const o = Fr();
  return Vo = (p, c) => {
    const h = o(p, c);
    return h && h.prerelease.length ? h.prerelease : null;
  }, Vo;
}
var Jo, Gh;
function xt() {
  if (Gh) return Jo;
  Gh = 1;
  const o = mt();
  return Jo = (p, c, h) => new o(p, h).compare(new o(c, h)), Jo;
}
var Zo, Wh;
function Ny() {
  if (Wh) return Zo;
  Wh = 1;
  const o = xt();
  return Zo = (p, c, h) => o(c, p, h), Zo;
}
var Xo, Yh;
function Iy() {
  if (Yh) return Xo;
  Yh = 1;
  const o = xt();
  return Xo = (p, c) => o(p, c, !0), Xo;
}
var Qo, Kh;
function eu() {
  if (Kh) return Qo;
  Kh = 1;
  const o = mt();
  return Qo = (p, c, h) => {
    const u = new o(p, h), n = new o(c, h);
    return u.compare(n) || u.compareBuild(n);
  }, Qo;
}
var el, Vh;
function Dy() {
  if (Vh) return el;
  Vh = 1;
  const o = eu();
  return el = (p, c) => p.sort((h, u) => o(h, u, c)), el;
}
var tl, Jh;
function Py() {
  if (Jh) return tl;
  Jh = 1;
  const o = eu();
  return tl = (p, c) => p.sort((h, u) => o(u, h, c)), tl;
}
var rl, Zh;
function Li() {
  if (Zh) return rl;
  Zh = 1;
  const o = xt();
  return rl = (p, c, h) => o(p, c, h) > 0, rl;
}
var nl, Xh;
function tu() {
  if (Xh) return nl;
  Xh = 1;
  const o = xt();
  return nl = (p, c, h) => o(p, c, h) < 0, nl;
}
var il, Qh;
function Tg() {
  if (Qh) return il;
  Qh = 1;
  const o = xt();
  return il = (p, c, h) => o(p, c, h) === 0, il;
}
var al, ep;
function Og() {
  if (ep) return al;
  ep = 1;
  const o = xt();
  return al = (p, c, h) => o(p, c, h) !== 0, al;
}
var sl, tp;
function ru() {
  if (tp) return sl;
  tp = 1;
  const o = xt();
  return sl = (p, c, h) => o(p, c, h) >= 0, sl;
}
var ol, rp;
function nu() {
  if (rp) return ol;
  rp = 1;
  const o = xt();
  return ol = (p, c, h) => o(p, c, h) <= 0, ol;
}
var ll, np;
function kg() {
  if (np) return ll;
  np = 1;
  const o = Tg(), d = Og(), p = Li(), c = ru(), h = tu(), u = nu();
  return ll = (l, i, a, r) => {
    switch (i) {
      case "===":
        return typeof l == "object" && (l = l.version), typeof a == "object" && (a = a.version), l === a;
      case "!==":
        return typeof l == "object" && (l = l.version), typeof a == "object" && (a = a.version), l !== a;
      case "":
      case "=":
      case "==":
        return o(l, a, r);
      case "!=":
        return d(l, a, r);
      case ">":
        return p(l, a, r);
      case ">=":
        return c(l, a, r);
      case "<":
        return h(l, a, r);
      case "<=":
        return u(l, a, r);
      default:
        throw new TypeError(`Invalid operator: ${i}`);
    }
  }, ll;
}
var ul, ip;
function xy() {
  if (ip) return ul;
  ip = 1;
  const o = mt(), d = Fr(), { safeRe: p, t: c } = In();
  return ul = (u, n) => {
    if (u instanceof o)
      return u;
    if (typeof u == "number" && (u = String(u)), typeof u != "string")
      return null;
    n = n || {};
    let l = null;
    if (!n.rtl)
      l = u.match(n.includePrerelease ? p[c.COERCEFULL] : p[c.COERCE]);
    else {
      const s = n.includePrerelease ? p[c.COERCERTLFULL] : p[c.COERCERTL];
      let f;
      for (; (f = s.exec(u)) && (!l || l.index + l[0].length !== u.length); )
        (!l || f.index + f[0].length !== l.index + l[0].length) && (l = f), s.lastIndex = f.index + f[1].length + f[2].length;
      s.lastIndex = -1;
    }
    if (l === null)
      return null;
    const i = l[2], a = l[3] || "0", r = l[4] || "0", e = n.includePrerelease && l[5] ? `-${l[5]}` : "", t = n.includePrerelease && l[6] ? `+${l[6]}` : "";
    return d(`${i}.${a}.${r}${e}${t}`, n);
  }, ul;
}
var cl, ap;
function Ly() {
  if (ap) return cl;
  ap = 1;
  class o {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(p) {
      const c = this.map.get(p);
      if (c !== void 0)
        return this.map.delete(p), this.map.set(p, c), c;
    }
    delete(p) {
      return this.map.delete(p);
    }
    set(p, c) {
      if (!this.delete(p) && c !== void 0) {
        if (this.map.size >= this.max) {
          const u = this.map.keys().next().value;
          this.delete(u);
        }
        this.map.set(p, c);
      }
      return this;
    }
  }
  return cl = o, cl;
}
var fl, sp;
function Lt() {
  if (sp) return fl;
  sp = 1;
  const o = /\s+/g;
  class d {
    constructor(H, te) {
      if (te = h(te), H instanceof d)
        return H.loose === !!te.loose && H.includePrerelease === !!te.includePrerelease ? H : new d(H.raw, te);
      if (H instanceof u)
        return this.raw = H.value, this.set = [[H]], this.formatted = void 0, this;
      if (this.options = te, this.loose = !!te.loose, this.includePrerelease = !!te.includePrerelease, this.raw = H.trim().replace(o, " "), this.set = this.raw.split("||").map((N) => this.parseRange(N.trim())).filter((N) => N.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const N = this.set[0];
        if (this.set = this.set.filter((F) => !g(F[0])), this.set.length === 0)
          this.set = [N];
        else if (this.set.length > 1) {
          for (const F of this.set)
            if (F.length === 1 && m(F[0])) {
              this.set = [F];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let H = 0; H < this.set.length; H++) {
          H > 0 && (this.formatted += "||");
          const te = this.set[H];
          for (let N = 0; N < te.length; N++)
            N > 0 && (this.formatted += " "), this.formatted += te[N].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(H) {
      const N = ((this.options.includePrerelease && s) | (this.options.loose && f)) + ":" + H, F = c.get(N);
      if (F)
        return F;
      const G = this.options.loose, Q = G ? i[a.HYPHENRANGELOOSE] : i[a.HYPHENRANGE];
      H = H.replace(Q, U(this.options.includePrerelease)), n("hyphen replace", H), H = H.replace(i[a.COMPARATORTRIM], r), n("comparator trim", H), H = H.replace(i[a.TILDETRIM], e), n("tilde trim", H), H = H.replace(i[a.CARETTRIM], t), n("caret trim", H);
      let ce = H.split(" ").map((ie) => y(ie, this.options)).join(" ").split(/\s+/).map((ie) => z(ie, this.options));
      G && (ce = ce.filter((ie) => (n("loose invalid filter", ie, this.options), !!ie.match(i[a.COMPARATORLOOSE])))), n("range list", ce);
      const ae = /* @__PURE__ */ new Map(), ve = ce.map((ie) => new u(ie, this.options));
      for (const ie of ve) {
        if (g(ie))
          return [ie];
        ae.set(ie.value, ie);
      }
      ae.size > 1 && ae.has("") && ae.delete("");
      const we = [...ae.values()];
      return c.set(N, we), we;
    }
    intersects(H, te) {
      if (!(H instanceof d))
        throw new TypeError("a Range is required");
      return this.set.some((N) => v(N, te) && H.set.some((F) => v(F, te) && N.every((G) => F.every((Q) => G.intersects(Q, te)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(H) {
      if (!H)
        return !1;
      if (typeof H == "string")
        try {
          H = new l(H, this.options);
        } catch {
          return !1;
        }
      for (let te = 0; te < this.set.length; te++)
        if (j(this.set[te], H, this.options))
          return !0;
      return !1;
    }
  }
  fl = d;
  const p = Ly(), c = new p(), h = Ql(), u = Fi(), n = xi(), l = mt(), {
    safeRe: i,
    t: a,
    comparatorTrimReplace: r,
    tildeTrimReplace: e,
    caretTrimReplace: t
  } = In(), { FLAG_INCLUDE_PRERELEASE: s, FLAG_LOOSE: f } = Pi(), g = (B) => B.value === "<0.0.0-0", m = (B) => B.value === "", v = (B, H) => {
    let te = !0;
    const N = B.slice();
    let F = N.pop();
    for (; te && N.length; )
      te = N.every((G) => F.intersects(G, H)), F = N.pop();
    return te;
  }, y = (B, H) => (B = B.replace(i[a.BUILD], ""), n("comp", B, H), B = I(B, H), n("caret", B), B = R(B, H), n("tildes", B), B = O(B, H), n("xrange", B), B = M(B, H), n("stars", B), B), E = (B) => !B || B.toLowerCase() === "x" || B === "*", R = (B, H) => B.trim().split(/\s+/).map((te) => C(te, H)).join(" "), C = (B, H) => {
    const te = H.loose ? i[a.TILDELOOSE] : i[a.TILDE];
    return B.replace(te, (N, F, G, Q, ce) => {
      n("tilde", B, N, F, G, Q, ce);
      let ae;
      return E(F) ? ae = "" : E(G) ? ae = `>=${F}.0.0 <${+F + 1}.0.0-0` : E(Q) ? ae = `>=${F}.${G}.0 <${F}.${+G + 1}.0-0` : ce ? (n("replaceTilde pr", ce), ae = `>=${F}.${G}.${Q}-${ce} <${F}.${+G + 1}.0-0`) : ae = `>=${F}.${G}.${Q} <${F}.${+G + 1}.0-0`, n("tilde return", ae), ae;
    });
  }, I = (B, H) => B.trim().split(/\s+/).map((te) => k(te, H)).join(" "), k = (B, H) => {
    n("caret", B, H);
    const te = H.loose ? i[a.CARETLOOSE] : i[a.CARET], N = H.includePrerelease ? "-0" : "";
    return B.replace(te, (F, G, Q, ce, ae) => {
      n("caret", B, F, G, Q, ce, ae);
      let ve;
      return E(G) ? ve = "" : E(Q) ? ve = `>=${G}.0.0${N} <${+G + 1}.0.0-0` : E(ce) ? G === "0" ? ve = `>=${G}.${Q}.0${N} <${G}.${+Q + 1}.0-0` : ve = `>=${G}.${Q}.0${N} <${+G + 1}.0.0-0` : ae ? (n("replaceCaret pr", ae), G === "0" ? Q === "0" ? ve = `>=${G}.${Q}.${ce}-${ae} <${G}.${Q}.${+ce + 1}-0` : ve = `>=${G}.${Q}.${ce}-${ae} <${G}.${+Q + 1}.0-0` : ve = `>=${G}.${Q}.${ce}-${ae} <${+G + 1}.0.0-0`) : (n("no pr"), G === "0" ? Q === "0" ? ve = `>=${G}.${Q}.${ce}${N} <${G}.${Q}.${+ce + 1}-0` : ve = `>=${G}.${Q}.${ce}${N} <${G}.${+Q + 1}.0-0` : ve = `>=${G}.${Q}.${ce} <${+G + 1}.0.0-0`), n("caret return", ve), ve;
    });
  }, O = (B, H) => (n("replaceXRanges", B, H), B.split(/\s+/).map((te) => A(te, H)).join(" ")), A = (B, H) => {
    B = B.trim();
    const te = H.loose ? i[a.XRANGELOOSE] : i[a.XRANGE];
    return B.replace(te, (N, F, G, Q, ce, ae) => {
      n("xRange", B, N, F, G, Q, ce, ae);
      const ve = E(G), we = ve || E(Q), ie = we || E(ce), be = ie;
      return F === "=" && be && (F = ""), ae = H.includePrerelease ? "-0" : "", ve ? F === ">" || F === "<" ? N = "<0.0.0-0" : N = "*" : F && be ? (we && (Q = 0), ce = 0, F === ">" ? (F = ">=", we ? (G = +G + 1, Q = 0, ce = 0) : (Q = +Q + 1, ce = 0)) : F === "<=" && (F = "<", we ? G = +G + 1 : Q = +Q + 1), F === "<" && (ae = "-0"), N = `${F + G}.${Q}.${ce}${ae}`) : we ? N = `>=${G}.0.0${ae} <${+G + 1}.0.0-0` : ie && (N = `>=${G}.${Q}.0${ae} <${G}.${+Q + 1}.0-0`), n("xRange return", N), N;
    });
  }, M = (B, H) => (n("replaceStars", B, H), B.trim().replace(i[a.STAR], "")), z = (B, H) => (n("replaceGTE0", B, H), B.trim().replace(i[H.includePrerelease ? a.GTE0PRE : a.GTE0], "")), U = (B) => (H, te, N, F, G, Q, ce, ae, ve, we, ie, be) => (E(N) ? te = "" : E(F) ? te = `>=${N}.0.0${B ? "-0" : ""}` : E(G) ? te = `>=${N}.${F}.0${B ? "-0" : ""}` : Q ? te = `>=${te}` : te = `>=${te}${B ? "-0" : ""}`, E(ve) ? ae = "" : E(we) ? ae = `<${+ve + 1}.0.0-0` : E(ie) ? ae = `<${ve}.${+we + 1}.0-0` : be ? ae = `<=${ve}.${we}.${ie}-${be}` : B ? ae = `<${ve}.${we}.${+ie + 1}-0` : ae = `<=${ae}`, `${te} ${ae}`.trim()), j = (B, H, te) => {
    for (let N = 0; N < B.length; N++)
      if (!B[N].test(H))
        return !1;
    if (H.prerelease.length && !te.includePrerelease) {
      for (let N = 0; N < B.length; N++)
        if (n(B[N].semver), B[N].semver !== u.ANY && B[N].semver.prerelease.length > 0) {
          const F = B[N].semver;
          if (F.major === H.major && F.minor === H.minor && F.patch === H.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return fl;
}
var dl, op;
function Fi() {
  if (op) return dl;
  op = 1;
  const o = Symbol("SemVer ANY");
  class d {
    static get ANY() {
      return o;
    }
    constructor(r, e) {
      if (e = p(e), r instanceof d) {
        if (r.loose === !!e.loose)
          return r;
        r = r.value;
      }
      r = r.trim().split(/\s+/).join(" "), n("comparator", r, e), this.options = e, this.loose = !!e.loose, this.parse(r), this.semver === o ? this.value = "" : this.value = this.operator + this.semver.version, n("comp", this);
    }
    parse(r) {
      const e = this.options.loose ? c[h.COMPARATORLOOSE] : c[h.COMPARATOR], t = r.match(e);
      if (!t)
        throw new TypeError(`Invalid comparator: ${r}`);
      this.operator = t[1] !== void 0 ? t[1] : "", this.operator === "=" && (this.operator = ""), t[2] ? this.semver = new l(t[2], this.options.loose) : this.semver = o;
    }
    toString() {
      return this.value;
    }
    test(r) {
      if (n("Comparator.test", r, this.options.loose), this.semver === o || r === o)
        return !0;
      if (typeof r == "string")
        try {
          r = new l(r, this.options);
        } catch {
          return !1;
        }
      return u(r, this.operator, this.semver, this.options);
    }
    intersects(r, e) {
      if (!(r instanceof d))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new i(r.value, e).test(this.value) : r.operator === "" ? r.value === "" ? !0 : new i(this.value, e).test(r.semver) : (e = p(e), e.includePrerelease && (this.value === "<0.0.0-0" || r.value === "<0.0.0-0") || !e.includePrerelease && (this.value.startsWith("<0.0.0") || r.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && r.operator.startsWith(">") || this.operator.startsWith("<") && r.operator.startsWith("<") || this.semver.version === r.semver.version && this.operator.includes("=") && r.operator.includes("=") || u(this.semver, "<", r.semver, e) && this.operator.startsWith(">") && r.operator.startsWith("<") || u(this.semver, ">", r.semver, e) && this.operator.startsWith("<") && r.operator.startsWith(">")));
    }
  }
  dl = d;
  const p = Ql(), { safeRe: c, t: h } = In(), u = kg(), n = xi(), l = mt(), i = Lt();
  return dl;
}
var hl, lp;
function Ui() {
  if (lp) return hl;
  lp = 1;
  const o = Lt();
  return hl = (p, c, h) => {
    try {
      c = new o(c, h);
    } catch {
      return !1;
    }
    return c.test(p);
  }, hl;
}
var pl, up;
function Fy() {
  if (up) return pl;
  up = 1;
  const o = Lt();
  return pl = (p, c) => new o(p, c).set.map((h) => h.map((u) => u.value).join(" ").trim().split(" ")), pl;
}
var ml, cp;
function Uy() {
  if (cp) return ml;
  cp = 1;
  const o = mt(), d = Lt();
  return ml = (c, h, u) => {
    let n = null, l = null, i = null;
    try {
      i = new d(h, u);
    } catch {
      return null;
    }
    return c.forEach((a) => {
      i.test(a) && (!n || l.compare(a) === -1) && (n = a, l = new o(n, u));
    }), n;
  }, ml;
}
var gl, fp;
function $y() {
  if (fp) return gl;
  fp = 1;
  const o = mt(), d = Lt();
  return gl = (c, h, u) => {
    let n = null, l = null, i = null;
    try {
      i = new d(h, u);
    } catch {
      return null;
    }
    return c.forEach((a) => {
      i.test(a) && (!n || l.compare(a) === 1) && (n = a, l = new o(n, u));
    }), n;
  }, gl;
}
var vl, dp;
function qy() {
  if (dp) return vl;
  dp = 1;
  const o = mt(), d = Lt(), p = Li();
  return vl = (h, u) => {
    h = new d(h, u);
    let n = new o("0.0.0");
    if (h.test(n) || (n = new o("0.0.0-0"), h.test(n)))
      return n;
    n = null;
    for (let l = 0; l < h.set.length; ++l) {
      const i = h.set[l];
      let a = null;
      i.forEach((r) => {
        const e = new o(r.semver.version);
        switch (r.operator) {
          case ">":
            e.prerelease.length === 0 ? e.patch++ : e.prerelease.push(0), e.raw = e.format();
          /* fallthrough */
          case "":
          case ">=":
            (!a || p(e, a)) && (a = e);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${r.operator}`);
        }
      }), a && (!n || p(n, a)) && (n = a);
    }
    return n && h.test(n) ? n : null;
  }, vl;
}
var yl, hp;
function My() {
  if (hp) return yl;
  hp = 1;
  const o = Lt();
  return yl = (p, c) => {
    try {
      return new o(p, c).range || "*";
    } catch {
      return null;
    }
  }, yl;
}
var wl, pp;
function iu() {
  if (pp) return wl;
  pp = 1;
  const o = mt(), d = Fi(), { ANY: p } = d, c = Lt(), h = Ui(), u = Li(), n = tu(), l = nu(), i = ru();
  return wl = (r, e, t, s) => {
    r = new o(r, s), e = new c(e, s);
    let f, g, m, v, y;
    switch (t) {
      case ">":
        f = u, g = l, m = n, v = ">", y = ">=";
        break;
      case "<":
        f = n, g = i, m = u, v = "<", y = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (h(r, e, s))
      return !1;
    for (let E = 0; E < e.set.length; ++E) {
      const R = e.set[E];
      let C = null, I = null;
      if (R.forEach((k) => {
        k.semver === p && (k = new d(">=0.0.0")), C = C || k, I = I || k, f(k.semver, C.semver, s) ? C = k : m(k.semver, I.semver, s) && (I = k);
      }), C.operator === v || C.operator === y || (!I.operator || I.operator === v) && g(r, I.semver))
        return !1;
      if (I.operator === y && m(r, I.semver))
        return !1;
    }
    return !0;
  }, wl;
}
var _l, mp;
function By() {
  if (mp) return _l;
  mp = 1;
  const o = iu();
  return _l = (p, c, h) => o(p, c, ">", h), _l;
}
var bl, gp;
function jy() {
  if (gp) return bl;
  gp = 1;
  const o = iu();
  return bl = (p, c, h) => o(p, c, "<", h), bl;
}
var El, vp;
function Hy() {
  if (vp) return El;
  vp = 1;
  const o = Lt();
  return El = (p, c, h) => (p = new o(p, h), c = new o(c, h), p.intersects(c, h)), El;
}
var Sl, yp;
function zy() {
  if (yp) return Sl;
  yp = 1;
  const o = Ui(), d = xt();
  return Sl = (p, c, h) => {
    const u = [];
    let n = null, l = null;
    const i = p.sort((t, s) => d(t, s, h));
    for (const t of i)
      o(t, c, h) ? (l = t, n || (n = t)) : (l && u.push([n, l]), l = null, n = null);
    n && u.push([n, null]);
    const a = [];
    for (const [t, s] of u)
      t === s ? a.push(t) : !s && t === i[0] ? a.push("*") : s ? t === i[0] ? a.push(`<=${s}`) : a.push(`${t} - ${s}`) : a.push(`>=${t}`);
    const r = a.join(" || "), e = typeof c.raw == "string" ? c.raw : String(c);
    return r.length < e.length ? r : c;
  }, Sl;
}
var Al, wp;
function Gy() {
  if (wp) return Al;
  wp = 1;
  const o = Lt(), d = Fi(), { ANY: p } = d, c = Ui(), h = xt(), u = (e, t, s = {}) => {
    if (e === t)
      return !0;
    e = new o(e, s), t = new o(t, s);
    let f = !1;
    e: for (const g of e.set) {
      for (const m of t.set) {
        const v = i(g, m, s);
        if (f = f || v !== null, v)
          continue e;
      }
      if (f)
        return !1;
    }
    return !0;
  }, n = [new d(">=0.0.0-0")], l = [new d(">=0.0.0")], i = (e, t, s) => {
    if (e === t)
      return !0;
    if (e.length === 1 && e[0].semver === p) {
      if (t.length === 1 && t[0].semver === p)
        return !0;
      s.includePrerelease ? e = n : e = l;
    }
    if (t.length === 1 && t[0].semver === p) {
      if (s.includePrerelease)
        return !0;
      t = l;
    }
    const f = /* @__PURE__ */ new Set();
    let g, m;
    for (const O of e)
      O.operator === ">" || O.operator === ">=" ? g = a(g, O, s) : O.operator === "<" || O.operator === "<=" ? m = r(m, O, s) : f.add(O.semver);
    if (f.size > 1)
      return null;
    let v;
    if (g && m) {
      if (v = h(g.semver, m.semver, s), v > 0)
        return null;
      if (v === 0 && (g.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const O of f) {
      if (g && !c(O, String(g), s) || m && !c(O, String(m), s))
        return null;
      for (const A of t)
        if (!c(O, String(A), s))
          return !1;
      return !0;
    }
    let y, E, R, C, I = m && !s.includePrerelease && m.semver.prerelease.length ? m.semver : !1, k = g && !s.includePrerelease && g.semver.prerelease.length ? g.semver : !1;
    I && I.prerelease.length === 1 && m.operator === "<" && I.prerelease[0] === 0 && (I = !1);
    for (const O of t) {
      if (C = C || O.operator === ">" || O.operator === ">=", R = R || O.operator === "<" || O.operator === "<=", g) {
        if (k && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === k.major && O.semver.minor === k.minor && O.semver.patch === k.patch && (k = !1), O.operator === ">" || O.operator === ">=") {
          if (y = a(g, O, s), y === O && y !== g)
            return !1;
        } else if (g.operator === ">=" && !c(g.semver, String(O), s))
          return !1;
      }
      if (m) {
        if (I && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === I.major && O.semver.minor === I.minor && O.semver.patch === I.patch && (I = !1), O.operator === "<" || O.operator === "<=") {
          if (E = r(m, O, s), E === O && E !== m)
            return !1;
        } else if (m.operator === "<=" && !c(m.semver, String(O), s))
          return !1;
      }
      if (!O.operator && (m || g) && v !== 0)
        return !1;
    }
    return !(g && R && !m && v !== 0 || m && C && !g && v !== 0 || k || I);
  }, a = (e, t, s) => {
    if (!e)
      return t;
    const f = h(e.semver, t.semver, s);
    return f > 0 ? e : f < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
  }, r = (e, t, s) => {
    if (!e)
      return t;
    const f = h(e.semver, t.semver, s);
    return f < 0 ? e : f > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
  };
  return Al = u, Al;
}
var Cl, _p;
function Ng() {
  if (_p) return Cl;
  _p = 1;
  const o = In(), d = Pi(), p = mt(), c = Rg(), h = Fr(), u = Ey(), n = Sy(), l = Ay(), i = Cy(), a = Ry(), r = Ty(), e = Oy(), t = ky(), s = xt(), f = Ny(), g = Iy(), m = eu(), v = Dy(), y = Py(), E = Li(), R = tu(), C = Tg(), I = Og(), k = ru(), O = nu(), A = kg(), M = xy(), z = Fi(), U = Lt(), j = Ui(), B = Fy(), H = Uy(), te = $y(), N = qy(), F = My(), G = iu(), Q = By(), ce = jy(), ae = Hy(), ve = zy(), we = Gy();
  return Cl = {
    parse: h,
    valid: u,
    clean: n,
    inc: l,
    diff: i,
    major: a,
    minor: r,
    patch: e,
    prerelease: t,
    compare: s,
    rcompare: f,
    compareLoose: g,
    compareBuild: m,
    sort: v,
    rsort: y,
    gt: E,
    lt: R,
    eq: C,
    neq: I,
    gte: k,
    lte: O,
    cmp: A,
    coerce: M,
    Comparator: z,
    Range: U,
    satisfies: j,
    toComparators: B,
    maxSatisfying: H,
    minSatisfying: te,
    minVersion: N,
    validRange: F,
    outside: G,
    gtr: Q,
    ltr: ce,
    intersects: ae,
    simplifyRange: ve,
    subset: we,
    SemVer: p,
    re: o.re,
    src: o.src,
    tokens: o.t,
    SEMVER_SPEC_VERSION: d.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: d.RELEASE_TYPES,
    compareIdentifiers: c.compareIdentifiers,
    rcompareIdentifiers: c.rcompareIdentifiers
  }, Cl;
}
var Or = {}, wn = { exports: {} };
wn.exports;
var bp;
function Wy() {
  return bp || (bp = 1, (function(o, d) {
    var p = 200, c = "__lodash_hash_undefined__", h = 1, u = 2, n = 9007199254740991, l = "[object Arguments]", i = "[object Array]", a = "[object AsyncFunction]", r = "[object Boolean]", e = "[object Date]", t = "[object Error]", s = "[object Function]", f = "[object GeneratorFunction]", g = "[object Map]", m = "[object Number]", v = "[object Null]", y = "[object Object]", E = "[object Promise]", R = "[object Proxy]", C = "[object RegExp]", I = "[object Set]", k = "[object String]", O = "[object Symbol]", A = "[object Undefined]", M = "[object WeakMap]", z = "[object ArrayBuffer]", U = "[object DataView]", j = "[object Float32Array]", B = "[object Float64Array]", H = "[object Int8Array]", te = "[object Int16Array]", N = "[object Int32Array]", F = "[object Uint8Array]", G = "[object Uint8ClampedArray]", Q = "[object Uint16Array]", ce = "[object Uint32Array]", ae = /[\\^$.*+?()[\]{}|]/g, ve = /^\[object .+?Constructor\]$/, we = /^(?:0|[1-9]\d*)$/, ie = {};
    ie[j] = ie[B] = ie[H] = ie[te] = ie[N] = ie[F] = ie[G] = ie[Q] = ie[ce] = !0, ie[l] = ie[i] = ie[z] = ie[r] = ie[U] = ie[e] = ie[t] = ie[s] = ie[g] = ie[m] = ie[y] = ie[C] = ie[I] = ie[k] = ie[M] = !1;
    var be = typeof Me == "object" && Me && Me.Object === Object && Me, S = typeof self == "object" && self && self.Object === Object && self, b = be || S || Function("return this")(), W = d && !d.nodeType && d, $ = W && !0 && o && !o.nodeType && o, he = $ && $.exports === W, le = he && be.process, me = (function() {
      try {
        return le && le.binding && le.binding("util");
      } catch {
      }
    })(), Ne = me && me.isTypedArray;
    function Te(q, X) {
      for (var pe = -1, Re = q == null ? 0 : q.length, je = 0, Pe = []; ++pe < Re; ) {
        var Ve = q[pe];
        X(Ve, pe, q) && (Pe[je++] = Ve);
      }
      return Pe;
    }
    function $e(q, X) {
      for (var pe = -1, Re = X.length, je = q.length; ++pe < Re; )
        q[je + pe] = X[pe];
      return q;
    }
    function Oe(q, X) {
      for (var pe = -1, Re = q == null ? 0 : q.length; ++pe < Re; )
        if (X(q[pe], pe, q))
          return !0;
      return !1;
    }
    function ke(q, X) {
      for (var pe = -1, Re = Array(q); ++pe < q; )
        Re[pe] = X(pe);
      return Re;
    }
    function He(q) {
      return function(X) {
        return q(X);
      };
    }
    function Qe(q, X) {
      return q.has(X);
    }
    function Ge(q, X) {
      return q == null ? void 0 : q[X];
    }
    function _(q) {
      var X = -1, pe = Array(q.size);
      return q.forEach(function(Re, je) {
        pe[++X] = [je, Re];
      }), pe;
    }
    function re(q, X) {
      return function(pe) {
        return q(X(pe));
      };
    }
    function oe(q) {
      var X = -1, pe = Array(q.size);
      return q.forEach(function(Re) {
        pe[++X] = Re;
      }), pe;
    }
    var ge = Array.prototype, fe = Function.prototype, ye = Object.prototype, de = b["__core-js_shared__"], Ee = fe.toString, Ce = ye.hasOwnProperty, L = (function() {
      var q = /[^.]+$/.exec(de && de.keys && de.keys.IE_PROTO || "");
      return q ? "Symbol(src)_1." + q : "";
    })(), se = ye.toString, ne = RegExp(
      "^" + Ee.call(Ce).replace(ae, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), P = he ? b.Buffer : void 0, x = b.Symbol, Y = b.Uint8Array, T = ye.propertyIsEnumerable, J = ge.splice, ue = x ? x.toStringTag : void 0, w = Object.getOwnPropertySymbols, V = P ? P.isBuffer : void 0, Z = re(Object.keys, Object), D = yr(b, "DataView"), K = yr(b, "Map"), ee = yr(b, "Promise"), _e = yr(b, "Set"), Ae = yr(b, "WeakMap"), Se = yr(Object, "create"), De = er(D), kt = er(K), ze = er(ee), Le = er(_e), Ze = er(Ae), tt = x ? x.prototype : void 0, it = tt ? tt.valueOf : void 0;
    function Et(q) {
      var X = -1, pe = q == null ? 0 : q.length;
      for (this.clear(); ++X < pe; ) {
        var Re = q[X];
        this.set(Re[0], Re[1]);
      }
    }
    function vr() {
      this.__data__ = Se ? Se(null) : {}, this.size = 0;
    }
    function Ke(q) {
      var X = this.has(q) && delete this.__data__[q];
      return this.size -= X ? 1 : 0, X;
    }
    function gt(q) {
      var X = this.__data__;
      if (Se) {
        var pe = X[q];
        return pe === c ? void 0 : pe;
      }
      return Ce.call(X, q) ? X[q] : void 0;
    }
    function rt(q) {
      var X = this.__data__;
      return Se ? X[q] !== void 0 : Ce.call(X, q);
    }
    function Nt(q, X) {
      var pe = this.__data__;
      return this.size += this.has(q) ? 0 : 1, pe[q] = Se && X === void 0 ? c : X, this;
    }
    Et.prototype.clear = vr, Et.prototype.delete = Ke, Et.prototype.get = gt, Et.prototype.has = rt, Et.prototype.set = Nt;
    function et(q) {
      var X = -1, pe = q == null ? 0 : q.length;
      for (this.clear(); ++X < pe; ) {
        var Re = q[X];
        this.set(Re[0], Re[1]);
      }
    }
    function Dn() {
      this.__data__ = [], this.size = 0;
    }
    function zg(q) {
      var X = this.__data__, pe = xn(X, q);
      if (pe < 0)
        return !1;
      var Re = X.length - 1;
      return pe == Re ? X.pop() : J.call(X, pe, 1), --this.size, !0;
    }
    function Gg(q) {
      var X = this.__data__, pe = xn(X, q);
      return pe < 0 ? void 0 : X[pe][1];
    }
    function Wg(q) {
      return xn(this.__data__, q) > -1;
    }
    function Yg(q, X) {
      var pe = this.__data__, Re = xn(pe, q);
      return Re < 0 ? (++this.size, pe.push([q, X])) : pe[Re][1] = X, this;
    }
    et.prototype.clear = Dn, et.prototype.delete = zg, et.prototype.get = Gg, et.prototype.has = Wg, et.prototype.set = Yg;
    function Qt(q) {
      var X = -1, pe = q == null ? 0 : q.length;
      for (this.clear(); ++X < pe; ) {
        var Re = q[X];
        this.set(Re[0], Re[1]);
      }
    }
    function Kg() {
      this.size = 0, this.__data__ = {
        hash: new Et(),
        map: new (K || et)(),
        string: new Et()
      };
    }
    function Vg(q) {
      var X = Ln(this, q).delete(q);
      return this.size -= X ? 1 : 0, X;
    }
    function Jg(q) {
      return Ln(this, q).get(q);
    }
    function Zg(q) {
      return Ln(this, q).has(q);
    }
    function Xg(q, X) {
      var pe = Ln(this, q), Re = pe.size;
      return pe.set(q, X), this.size += pe.size == Re ? 0 : 1, this;
    }
    Qt.prototype.clear = Kg, Qt.prototype.delete = Vg, Qt.prototype.get = Jg, Qt.prototype.has = Zg, Qt.prototype.set = Xg;
    function Pn(q) {
      var X = -1, pe = q == null ? 0 : q.length;
      for (this.__data__ = new Qt(); ++X < pe; )
        this.add(q[X]);
    }
    function Qg(q) {
      return this.__data__.set(q, c), this;
    }
    function e0(q) {
      return this.__data__.has(q);
    }
    Pn.prototype.add = Pn.prototype.push = Qg, Pn.prototype.has = e0;
    function qt(q) {
      var X = this.__data__ = new et(q);
      this.size = X.size;
    }
    function t0() {
      this.__data__ = new et(), this.size = 0;
    }
    function r0(q) {
      var X = this.__data__, pe = X.delete(q);
      return this.size = X.size, pe;
    }
    function n0(q) {
      return this.__data__.get(q);
    }
    function i0(q) {
      return this.__data__.has(q);
    }
    function a0(q, X) {
      var pe = this.__data__;
      if (pe instanceof et) {
        var Re = pe.__data__;
        if (!K || Re.length < p - 1)
          return Re.push([q, X]), this.size = ++pe.size, this;
        pe = this.__data__ = new Qt(Re);
      }
      return pe.set(q, X), this.size = pe.size, this;
    }
    qt.prototype.clear = t0, qt.prototype.delete = r0, qt.prototype.get = n0, qt.prototype.has = i0, qt.prototype.set = a0;
    function s0(q, X) {
      var pe = Fn(q), Re = !pe && b0(q), je = !pe && !Re && Mi(q), Pe = !pe && !Re && !je && wu(q), Ve = pe || Re || je || Pe, at = Ve ? ke(q.length, String) : [], lt = at.length;
      for (var We in q)
        Ce.call(q, We) && !(Ve && // Safari 9 has enumerable `arguments.length` in strict mode.
        (We == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        je && (We == "offset" || We == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Pe && (We == "buffer" || We == "byteLength" || We == "byteOffset") || // Skip index properties.
        g0(We, lt))) && at.push(We);
      return at;
    }
    function xn(q, X) {
      for (var pe = q.length; pe--; )
        if (mu(q[pe][0], X))
          return pe;
      return -1;
    }
    function o0(q, X, pe) {
      var Re = X(q);
      return Fn(q) ? Re : $e(Re, pe(q));
    }
    function Ur(q) {
      return q == null ? q === void 0 ? A : v : ue && ue in Object(q) ? p0(q) : _0(q);
    }
    function fu(q) {
      return $r(q) && Ur(q) == l;
    }
    function du(q, X, pe, Re, je) {
      return q === X ? !0 : q == null || X == null || !$r(q) && !$r(X) ? q !== q && X !== X : l0(q, X, pe, Re, du, je);
    }
    function l0(q, X, pe, Re, je, Pe) {
      var Ve = Fn(q), at = Fn(X), lt = Ve ? i : Mt(q), We = at ? i : Mt(X);
      lt = lt == l ? y : lt, We = We == l ? y : We;
      var wt = lt == y, It = We == y, ct = lt == We;
      if (ct && Mi(q)) {
        if (!Mi(X))
          return !1;
        Ve = !0, wt = !1;
      }
      if (ct && !wt)
        return Pe || (Pe = new qt()), Ve || wu(q) ? hu(q, X, pe, Re, je, Pe) : d0(q, X, lt, pe, Re, je, Pe);
      if (!(pe & h)) {
        var St = wt && Ce.call(q, "__wrapped__"), At = It && Ce.call(X, "__wrapped__");
        if (St || At) {
          var Bt = St ? q.value() : q, Ut = At ? X.value() : X;
          return Pe || (Pe = new qt()), je(Bt, Ut, pe, Re, Pe);
        }
      }
      return ct ? (Pe || (Pe = new qt()), h0(q, X, pe, Re, je, Pe)) : !1;
    }
    function u0(q) {
      if (!yu(q) || y0(q))
        return !1;
      var X = gu(q) ? ne : ve;
      return X.test(er(q));
    }
    function c0(q) {
      return $r(q) && vu(q.length) && !!ie[Ur(q)];
    }
    function f0(q) {
      if (!w0(q))
        return Z(q);
      var X = [];
      for (var pe in Object(q))
        Ce.call(q, pe) && pe != "constructor" && X.push(pe);
      return X;
    }
    function hu(q, X, pe, Re, je, Pe) {
      var Ve = pe & h, at = q.length, lt = X.length;
      if (at != lt && !(Ve && lt > at))
        return !1;
      var We = Pe.get(q);
      if (We && Pe.get(X))
        return We == X;
      var wt = -1, It = !0, ct = pe & u ? new Pn() : void 0;
      for (Pe.set(q, X), Pe.set(X, q); ++wt < at; ) {
        var St = q[wt], At = X[wt];
        if (Re)
          var Bt = Ve ? Re(At, St, wt, X, q, Pe) : Re(St, At, wt, q, X, Pe);
        if (Bt !== void 0) {
          if (Bt)
            continue;
          It = !1;
          break;
        }
        if (ct) {
          if (!Oe(X, function(Ut, tr) {
            if (!Qe(ct, tr) && (St === Ut || je(St, Ut, pe, Re, Pe)))
              return ct.push(tr);
          })) {
            It = !1;
            break;
          }
        } else if (!(St === At || je(St, At, pe, Re, Pe))) {
          It = !1;
          break;
        }
      }
      return Pe.delete(q), Pe.delete(X), It;
    }
    function d0(q, X, pe, Re, je, Pe, Ve) {
      switch (pe) {
        case U:
          if (q.byteLength != X.byteLength || q.byteOffset != X.byteOffset)
            return !1;
          q = q.buffer, X = X.buffer;
        case z:
          return !(q.byteLength != X.byteLength || !Pe(new Y(q), new Y(X)));
        case r:
        case e:
        case m:
          return mu(+q, +X);
        case t:
          return q.name == X.name && q.message == X.message;
        case C:
        case k:
          return q == X + "";
        case g:
          var at = _;
        case I:
          var lt = Re & h;
          if (at || (at = oe), q.size != X.size && !lt)
            return !1;
          var We = Ve.get(q);
          if (We)
            return We == X;
          Re |= u, Ve.set(q, X);
          var wt = hu(at(q), at(X), Re, je, Pe, Ve);
          return Ve.delete(q), wt;
        case O:
          if (it)
            return it.call(q) == it.call(X);
      }
      return !1;
    }
    function h0(q, X, pe, Re, je, Pe) {
      var Ve = pe & h, at = pu(q), lt = at.length, We = pu(X), wt = We.length;
      if (lt != wt && !Ve)
        return !1;
      for (var It = lt; It--; ) {
        var ct = at[It];
        if (!(Ve ? ct in X : Ce.call(X, ct)))
          return !1;
      }
      var St = Pe.get(q);
      if (St && Pe.get(X))
        return St == X;
      var At = !0;
      Pe.set(q, X), Pe.set(X, q);
      for (var Bt = Ve; ++It < lt; ) {
        ct = at[It];
        var Ut = q[ct], tr = X[ct];
        if (Re)
          var _u = Ve ? Re(tr, Ut, ct, X, q, Pe) : Re(Ut, tr, ct, q, X, Pe);
        if (!(_u === void 0 ? Ut === tr || je(Ut, tr, pe, Re, Pe) : _u)) {
          At = !1;
          break;
        }
        Bt || (Bt = ct == "constructor");
      }
      if (At && !Bt) {
        var Un = q.constructor, $n = X.constructor;
        Un != $n && "constructor" in q && "constructor" in X && !(typeof Un == "function" && Un instanceof Un && typeof $n == "function" && $n instanceof $n) && (At = !1);
      }
      return Pe.delete(q), Pe.delete(X), At;
    }
    function pu(q) {
      return o0(q, A0, m0);
    }
    function Ln(q, X) {
      var pe = q.__data__;
      return v0(X) ? pe[typeof X == "string" ? "string" : "hash"] : pe.map;
    }
    function yr(q, X) {
      var pe = Ge(q, X);
      return u0(pe) ? pe : void 0;
    }
    function p0(q) {
      var X = Ce.call(q, ue), pe = q[ue];
      try {
        q[ue] = void 0;
        var Re = !0;
      } catch {
      }
      var je = se.call(q);
      return Re && (X ? q[ue] = pe : delete q[ue]), je;
    }
    var m0 = w ? function(q) {
      return q == null ? [] : (q = Object(q), Te(w(q), function(X) {
        return T.call(q, X);
      }));
    } : C0, Mt = Ur;
    (D && Mt(new D(new ArrayBuffer(1))) != U || K && Mt(new K()) != g || ee && Mt(ee.resolve()) != E || _e && Mt(new _e()) != I || Ae && Mt(new Ae()) != M) && (Mt = function(q) {
      var X = Ur(q), pe = X == y ? q.constructor : void 0, Re = pe ? er(pe) : "";
      if (Re)
        switch (Re) {
          case De:
            return U;
          case kt:
            return g;
          case ze:
            return E;
          case Le:
            return I;
          case Ze:
            return M;
        }
      return X;
    });
    function g0(q, X) {
      return X = X ?? n, !!X && (typeof q == "number" || we.test(q)) && q > -1 && q % 1 == 0 && q < X;
    }
    function v0(q) {
      var X = typeof q;
      return X == "string" || X == "number" || X == "symbol" || X == "boolean" ? q !== "__proto__" : q === null;
    }
    function y0(q) {
      return !!L && L in q;
    }
    function w0(q) {
      var X = q && q.constructor, pe = typeof X == "function" && X.prototype || ye;
      return q === pe;
    }
    function _0(q) {
      return se.call(q);
    }
    function er(q) {
      if (q != null) {
        try {
          return Ee.call(q);
        } catch {
        }
        try {
          return q + "";
        } catch {
        }
      }
      return "";
    }
    function mu(q, X) {
      return q === X || q !== q && X !== X;
    }
    var b0 = fu(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? fu : function(q) {
      return $r(q) && Ce.call(q, "callee") && !T.call(q, "callee");
    }, Fn = Array.isArray;
    function E0(q) {
      return q != null && vu(q.length) && !gu(q);
    }
    var Mi = V || R0;
    function S0(q, X) {
      return du(q, X);
    }
    function gu(q) {
      if (!yu(q))
        return !1;
      var X = Ur(q);
      return X == s || X == f || X == a || X == R;
    }
    function vu(q) {
      return typeof q == "number" && q > -1 && q % 1 == 0 && q <= n;
    }
    function yu(q) {
      var X = typeof q;
      return q != null && (X == "object" || X == "function");
    }
    function $r(q) {
      return q != null && typeof q == "object";
    }
    var wu = Ne ? He(Ne) : c0;
    function A0(q) {
      return E0(q) ? s0(q) : f0(q);
    }
    function C0() {
      return [];
    }
    function R0() {
      return !1;
    }
    o.exports = S0;
  })(wn, wn.exports)), wn.exports;
}
var Ep;
function Yy() {
  if (Ep) return Or;
  Ep = 1, Object.defineProperty(Or, "__esModule", { value: !0 }), Or.DownloadedUpdateHelper = void 0, Or.createTempUpdateFile = l;
  const o = _n, d = Kt, p = Wy(), c = /* @__PURE__ */ Xt(), h = Ye;
  let u = class {
    constructor(a) {
      this.cacheDir = a, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return h.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(a, r, e, t) {
      if (this.versionInfo != null && this.file === a && this.fileInfo != null)
        return p(this.versionInfo, r) && p(this.fileInfo.info, e.info) && await (0, c.pathExists)(a) ? a : null;
      const s = await this.getValidCachedUpdateFile(e, t);
      return s === null ? null : (t.info(`Update has already been downloaded to ${a}).`), this._file = s, s);
    }
    async setDownloadedFile(a, r, e, t, s, f) {
      this._file = a, this._packageFile = r, this.versionInfo = e, this.fileInfo = t, this._downloadedFileInfo = {
        fileName: s,
        sha512: t.info.sha512,
        isAdminRightsRequired: t.info.isAdminRightsRequired === !0
      }, f && await (0, c.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, c.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(a, r) {
      const e = this.getUpdateInfoFile();
      if (!await (0, c.pathExists)(e))
        return null;
      let s;
      try {
        s = await (0, c.readJson)(e);
      } catch (v) {
        let y = "No cached update info available";
        return v.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), y += ` (error on read: ${v.message})`), r.info(y), null;
      }
      if (!((s == null ? void 0 : s.fileName) !== null))
        return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (a.info.sha512 !== s.sha512)
        return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${s.sha512}, expected: ${a.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const g = h.join(this.cacheDirForPendingUpdate, s.fileName);
      if (!await (0, c.pathExists)(g))
        return r.info("Cached update file doesn't exist"), null;
      const m = await n(g);
      return a.info.sha512 !== m ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m}, expected: ${a.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = s, g);
    }
    getUpdateInfoFile() {
      return h.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Or.DownloadedUpdateHelper = u;
  function n(i, a = "sha512", r = "base64", e) {
    return new Promise((t, s) => {
      const f = (0, o.createHash)(a);
      f.on("error", s).setEncoding(r), (0, d.createReadStream)(i, {
        ...e,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", s).on("end", () => {
        f.end(), t(f.read());
      }).pipe(f, { end: !1 });
    });
  }
  async function l(i, a, r) {
    let e = 0, t = h.join(a, i);
    for (let s = 0; s < 3; s++)
      try {
        return await (0, c.unlink)(t), t;
      } catch (f) {
        if (f.code === "ENOENT")
          return t;
        r.warn(`Error on remove temp update file: ${f}`), t = h.join(a, `${e++}-${i}`);
      }
    return t;
  }
  return Or;
}
var Qr = {}, pi = {}, Sp;
function Ky() {
  if (Sp) return pi;
  Sp = 1, Object.defineProperty(pi, "__esModule", { value: !0 }), pi.getAppCacheDir = p;
  const o = Ye, d = vi;
  function p() {
    const c = (0, d.homedir)();
    let h;
    return process.platform === "win32" ? h = process.env.LOCALAPPDATA || o.join(c, "AppData", "Local") : process.platform === "darwin" ? h = o.join(c, "Library", "Caches") : h = process.env.XDG_CACHE_HOME || o.join(c, ".cache"), h;
  }
  return pi;
}
var Ap;
function Vy() {
  if (Ap) return Qr;
  Ap = 1, Object.defineProperty(Qr, "__esModule", { value: !0 }), Qr.ElectronAppAdapter = void 0;
  const o = Ye, d = Ky();
  let p = class {
    constructor(h = lr.app) {
      this.app = h;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? o.join(process.resourcesPath, "app-update.yml") : o.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, d.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(h) {
      this.app.once("quit", (u, n) => h(n));
    }
  };
  return Qr.ElectronAppAdapter = p, Qr;
}
var Rl = {}, Cp;
function Jy() {
  return Cp || (Cp = 1, (function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.ElectronHttpExecutor = o.NET_SESSION_NAME = void 0, o.getNetSession = p;
    const d = ot();
    o.NET_SESSION_NAME = "electron-updater";
    function p() {
      return lr.session.fromPartition(o.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class c extends d.HttpExecutor {
      constructor(u) {
        super(), this.proxyLoginCallback = u, this.cachedSession = null;
      }
      async download(u, n, l) {
        return await l.cancellationToken.createPromise((i, a, r) => {
          const e = {
            headers: l.headers || void 0,
            redirect: "manual"
          };
          (0, d.configureRequestUrl)(u, e), (0, d.configureRequestOptions)(e), this.doDownload(e, {
            destination: n,
            options: l,
            onCancel: r,
            callback: (t) => {
              t == null ? i(n) : a(t);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(u, n) {
        u.headers && u.headers.Host && (u.host = u.headers.Host, delete u.headers.Host), this.cachedSession == null && (this.cachedSession = p());
        const l = lr.net.request({
          ...u,
          session: this.cachedSession
        });
        return l.on("response", n), this.proxyLoginCallback != null && l.on("login", this.proxyLoginCallback), l;
      }
      addRedirectHandlers(u, n, l, i, a) {
        u.on("redirect", (r, e, t) => {
          u.abort(), i > this.maxRedirects ? l(this.createMaxRedirectError()) : a(d.HttpExecutor.prepareRedirectUrlOptions(t, n));
        });
      }
    }
    o.ElectronHttpExecutor = c;
  })(Rl)), Rl;
}
var en = {}, kr = {}, Rp;
function mr() {
  if (Rp) return kr;
  Rp = 1, Object.defineProperty(kr, "__esModule", { value: !0 }), kr.newBaseUrl = d, kr.newUrlFromBase = p, kr.getChannelFilename = c;
  const o = Vt;
  function d(h) {
    const u = new o.URL(h);
    return u.pathname.endsWith("/") || (u.pathname += "/"), u;
  }
  function p(h, u, n = !1) {
    const l = new o.URL(h, u), i = u.search;
    return i != null && i.length !== 0 ? l.search = i : n && (l.search = `noCache=${Date.now().toString(32)}`), l;
  }
  function c(h) {
    return `${h}.yml`;
  }
  return kr;
}
var $t = {}, Tl, Tp;
function Ig() {
  if (Tp) return Tl;
  Tp = 1;
  var o = "[object Symbol]", d = /[\\^$.*+?()[\]{}|]/g, p = RegExp(d.source), c = typeof Me == "object" && Me && Me.Object === Object && Me, h = typeof self == "object" && self && self.Object === Object && self, u = c || h || Function("return this")(), n = Object.prototype, l = n.toString, i = u.Symbol, a = i ? i.prototype : void 0, r = a ? a.toString : void 0;
  function e(m) {
    if (typeof m == "string")
      return m;
    if (s(m))
      return r ? r.call(m) : "";
    var v = m + "";
    return v == "0" && 1 / m == -1 / 0 ? "-0" : v;
  }
  function t(m) {
    return !!m && typeof m == "object";
  }
  function s(m) {
    return typeof m == "symbol" || t(m) && l.call(m) == o;
  }
  function f(m) {
    return m == null ? "" : e(m);
  }
  function g(m) {
    return m = f(m), m && p.test(m) ? m.replace(d, "\\$&") : m;
  }
  return Tl = g, Tl;
}
var Op;
function bt() {
  if (Op) return $t;
  Op = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.Provider = void 0, $t.findFile = n, $t.parseUpdateInfo = l, $t.getFileList = i, $t.resolveFiles = a;
  const o = ot(), d = Xl(), p = Vt, c = mr(), h = Ig();
  let u = class {
    constructor(e) {
      this.runtimeOptions = e, this.requestHeaders = null, this.executor = e.executor;
    }
    // By default, the blockmap file is in the same directory as the main file
    // But some providers may have a different blockmap file, so we need to override this method
    getBlockMapFiles(e, t, s, f = null) {
      const g = (0, c.newUrlFromBase)(`${e.pathname}.blockmap`, e);
      return [(0, c.newUrlFromBase)(`${e.pathname.replace(new RegExp(h(s), "g"), t)}.blockmap`, f ? new p.URL(f) : e), g];
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const e = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (e === "x64" ? "" : `-${e}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(e) {
      return `${e}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(e) {
      this.requestHeaders = e;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(e, t, s) {
      return this.executor.request(this.createRequestOptions(e, t), s);
    }
    createRequestOptions(e, t) {
      const s = {};
      return this.requestHeaders == null ? t != null && (s.headers = t) : s.headers = t == null ? this.requestHeaders : { ...this.requestHeaders, ...t }, (0, o.configureRequestUrl)(e, s), s;
    }
  };
  $t.Provider = u;
  function n(r, e, t) {
    var s;
    if (r.length === 0)
      throw (0, o.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const f = r.filter((m) => m.url.pathname.toLowerCase().endsWith(`.${e.toLowerCase()}`)), g = (s = f.find((m) => [m.url.pathname, m.info.url].some((v) => v.includes(process.arch)))) !== null && s !== void 0 ? s : f.shift();
    return g || (t == null ? r[0] : r.find((m) => !t.some((v) => m.url.pathname.toLowerCase().endsWith(`.${v.toLowerCase()}`))));
  }
  function l(r, e, t) {
    if (r == null)
      throw (0, o.newError)(`Cannot parse update info from ${e} in the latest release artifacts (${t}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let s;
    try {
      s = (0, d.load)(r);
    } catch (f) {
      throw (0, o.newError)(`Cannot parse update info from ${e} in the latest release artifacts (${t}): ${f.stack || f.message}, rawData: ${r}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return s;
  }
  function i(r) {
    const e = r.files;
    if (e != null && e.length > 0)
      return e;
    if (r.path != null)
      return [
        {
          url: r.path,
          sha2: r.sha2,
          sha512: r.sha512
        }
      ];
    throw (0, o.newError)(`No files provided: ${(0, o.safeStringifyJson)(r)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function a(r, e, t = (s) => s) {
    const f = i(r).map((v) => {
      if (v.sha2 == null && v.sha512 == null)
        throw (0, o.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, o.safeStringifyJson)(v)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, c.newUrlFromBase)(t(v.url), e),
        info: v
      };
    }), g = r.packages, m = g == null ? null : g[process.arch] || g.ia32;
    return m != null && (f[0].packageInfo = {
      ...m,
      path: (0, c.newUrlFromBase)(t(m.path), e).href
    }), f;
  }
  return $t;
}
var kp;
function Dg() {
  if (kp) return en;
  kp = 1, Object.defineProperty(en, "__esModule", { value: !0 }), en.GenericProvider = void 0;
  const o = ot(), d = mr(), p = bt();
  let c = class extends p.Provider {
    constructor(u, n, l) {
      super(l), this.configuration = u, this.updater = n, this.baseUrl = (0, d.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const u = this.updater.channel || this.configuration.channel;
      return u == null ? this.getDefaultChannelName() : this.getCustomChannelName(u);
    }
    async getLatestVersion() {
      const u = (0, d.getChannelFilename)(this.channel), n = (0, d.newUrlFromBase)(u, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let l = 0; ; l++)
        try {
          return (0, p.parseUpdateInfo)(await this.httpRequest(n), u, n);
        } catch (i) {
          if (i instanceof o.HttpError && i.statusCode === 404)
            throw (0, o.newError)(`Cannot find channel "${u}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (i.code === "ECONNREFUSED" && l < 3) {
            await new Promise((a, r) => {
              try {
                setTimeout(a, 1e3 * l);
              } catch (e) {
                r(e);
              }
            });
            continue;
          }
          throw i;
        }
    }
    resolveFiles(u) {
      return (0, p.resolveFiles)(u, this.baseUrl);
    }
  };
  return en.GenericProvider = c, en;
}
var tn = {}, rn = {}, Np;
function Zy() {
  if (Np) return rn;
  Np = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.BitbucketProvider = void 0;
  const o = ot(), d = mr(), p = bt();
  let c = class extends p.Provider {
    constructor(u, n, l) {
      super({
        ...l,
        isUseMultipleRangeRequest: !1
      }), this.configuration = u, this.updater = n;
      const { owner: i, slug: a } = u;
      this.baseUrl = (0, d.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${a}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const u = new o.CancellationToken(), n = (0, d.getChannelFilename)(this.getCustomChannelName(this.channel)), l = (0, d.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const i = await this.httpRequest(l, void 0, u);
        return (0, p.parseUpdateInfo)(i, n, l);
      } catch (i) {
        throw (0, o.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(u) {
      return (0, p.resolveFiles)(u, this.baseUrl);
    }
    toString() {
      const { owner: u, slug: n } = this.configuration;
      return `Bitbucket (owner: ${u}, slug: ${n}, channel: ${this.channel})`;
    }
  };
  return rn.BitbucketProvider = c, rn;
}
var zt = {}, Ip;
function Pg() {
  if (Ip) return zt;
  Ip = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.GitHubProvider = zt.BaseGitHubProvider = void 0, zt.computeReleaseNotes = a;
  const o = ot(), d = Ng(), p = Vt, c = mr(), h = bt(), u = /\/tag\/([^/]+)$/;
  class n extends h.Provider {
    constructor(e, t, s) {
      super({
        ...s,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = e, this.baseUrl = (0, c.newBaseUrl)((0, o.githubUrl)(e, t));
      const f = t === "github.com" ? "api.github.com" : t;
      this.baseApiUrl = (0, c.newBaseUrl)((0, o.githubUrl)(e, f));
    }
    computeGithubBasePath(e) {
      const t = this.options.host;
      return t && !["github.com", "api.github.com"].includes(t) ? `/api/v3${e}` : e;
    }
  }
  zt.BaseGitHubProvider = n;
  let l = class extends n {
    constructor(e, t, s) {
      super(e, "github.com", s), this.options = e, this.updater = t;
    }
    get channel() {
      const e = this.updater.channel || this.options.channel;
      return e == null ? this.getDefaultChannelName() : this.getCustomChannelName(e);
    }
    async getLatestVersion() {
      var e, t, s, f, g;
      const m = new o.CancellationToken(), v = await this.httpRequest((0, c.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, m), y = (0, o.parseXml)(v);
      let E = y.element("entry", !1, "No published versions on GitHub"), R = null;
      try {
        if (this.updater.allowPrerelease) {
          const M = ((e = this.updater) === null || e === void 0 ? void 0 : e.channel) || ((t = d.prerelease(this.updater.currentVersion)) === null || t === void 0 ? void 0 : t[0]) || null;
          if (M === null)
            R = u.exec(E.element("link").attribute("href"))[1];
          else
            for (const z of y.getElements("entry")) {
              const U = u.exec(z.element("link").attribute("href"));
              if (U === null)
                continue;
              const j = U[1], B = ((s = d.prerelease(j)) === null || s === void 0 ? void 0 : s[0]) || null, H = !M || ["alpha", "beta"].includes(M), te = B !== null && !["alpha", "beta"].includes(String(B));
              if (H && !te && !(M === "beta" && B === "alpha")) {
                R = j;
                break;
              }
              if (B && B === M) {
                R = j;
                break;
              }
            }
        } else {
          R = await this.getLatestTagName(m);
          for (const M of y.getElements("entry"))
            if (u.exec(M.element("link").attribute("href"))[1] === R) {
              E = M;
              break;
            }
        }
      } catch (M) {
        throw (0, o.newError)(`Cannot parse releases feed: ${M.stack || M.message},
XML:
${v}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (R == null)
        throw (0, o.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let C, I = "", k = "";
      const O = async (M) => {
        I = (0, c.getChannelFilename)(M), k = (0, c.newUrlFromBase)(this.getBaseDownloadPath(String(R), I), this.baseUrl);
        const z = this.createRequestOptions(k);
        try {
          return await this.executor.request(z, m);
        } catch (U) {
          throw U instanceof o.HttpError && U.statusCode === 404 ? (0, o.newError)(`Cannot find ${I} in the latest release artifacts (${k}): ${U.stack || U.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : U;
        }
      };
      try {
        let M = this.channel;
        this.updater.allowPrerelease && (!((f = d.prerelease(R)) === null || f === void 0) && f[0]) && (M = this.getCustomChannelName(String((g = d.prerelease(R)) === null || g === void 0 ? void 0 : g[0]))), C = await O(M);
      } catch (M) {
        if (this.updater.allowPrerelease)
          C = await O(this.getDefaultChannelName());
        else
          throw M;
      }
      const A = (0, h.parseUpdateInfo)(C, I, k);
      return A.releaseName == null && (A.releaseName = E.elementValueOrEmpty("title")), A.releaseNotes == null && (A.releaseNotes = a(this.updater.currentVersion, this.updater.fullChangelog, y, E)), {
        tag: R,
        ...A
      };
    }
    async getLatestTagName(e) {
      const t = this.options, s = t.host == null || t.host === "github.com" ? (0, c.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new p.URL(`${this.computeGithubBasePath(`/repos/${t.owner}/${t.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const f = await this.httpRequest(s, { Accept: "application/json" }, e);
        return f == null ? null : JSON.parse(f).tag_name;
      } catch (f) {
        throw (0, o.newError)(`Unable to find latest version on GitHub (${s}), please ensure a production release exists: ${f.stack || f.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(e) {
      return (0, h.resolveFiles)(e, this.baseUrl, (t) => this.getBaseDownloadPath(e.tag, t.replace(/ /g, "-")));
    }
    getBaseDownloadPath(e, t) {
      return `${this.basePath}/download/${e}/${t}`;
    }
  };
  zt.GitHubProvider = l;
  function i(r) {
    const e = r.elementValueOrEmpty("content");
    return e === "No content." ? "" : e;
  }
  function a(r, e, t, s) {
    if (!e)
      return i(s);
    const f = [];
    for (const g of t.getElements("entry")) {
      const m = /\/tag\/v?([^/]+)$/.exec(g.element("link").attribute("href"))[1];
      d.valid(m) && d.lt(r, m) && f.push({
        version: m,
        note: i(g)
      });
    }
    return f.sort((g, m) => d.rcompare(g.version, m.version));
  }
  return zt;
}
var nn = {}, Dp;
function Xy() {
  if (Dp) return nn;
  Dp = 1, Object.defineProperty(nn, "__esModule", { value: !0 }), nn.GitLabProvider = void 0;
  const o = ot(), d = Vt, p = Ig(), c = mr(), h = bt();
  let u = class extends h.Provider {
    /**
     * Normalizes filenames by replacing spaces and underscores with dashes.
     *
     * This is a workaround to handle filename formatting differences between tools:
     * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
     * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
     *
     * Because of this mismatch, we can't reliably extract the correct filename from
     * the asset path without normalization. This function ensures consistent matching
     * across different filename formats by converting all spaces and underscores to dashes.
     *
     * @param filename The filename to normalize
     * @returns The normalized filename with spaces and underscores replaced by dashes
     */
    normalizeFilename(l) {
      return l.replace(/ |_/g, "-");
    }
    constructor(l, i, a) {
      super({
        ...a,
        // GitLab might not support multiple range requests efficiently
        isUseMultipleRangeRequest: !1
      }), this.options = l, this.updater = i, this.cachedLatestVersion = null;
      const e = l.host || "gitlab.com";
      this.baseApiUrl = (0, c.newBaseUrl)(`https://${e}/api/v4`);
    }
    get channel() {
      const l = this.updater.channel || this.options.channel;
      return l == null ? this.getDefaultChannelName() : this.getCustomChannelName(l);
    }
    async getLatestVersion() {
      const l = new o.CancellationToken(), i = (0, c.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
      let a;
      try {
        const y = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, E = await this.httpRequest(i, y, l);
        if (!E)
          throw (0, o.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
        a = JSON.parse(E);
      } catch (y) {
        throw (0, o.newError)(`Unable to find latest release on GitLab (${i}): ${y.stack || y.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      const r = a.tag_name;
      let e = null, t = "", s = null;
      const f = async (y) => {
        t = (0, c.getChannelFilename)(y);
        const E = a.assets.links.find((C) => C.name === t);
        if (!E)
          throw (0, o.newError)(`Cannot find ${t} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        s = new d.URL(E.direct_asset_url);
        const R = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
        try {
          const C = await this.httpRequest(s, R, l);
          if (!C)
            throw (0, o.newError)(`Empty response from ${s}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          return C;
        } catch (C) {
          throw C instanceof o.HttpError && C.statusCode === 404 ? (0, o.newError)(`Cannot find ${t} in the latest release artifacts (${s}): ${C.stack || C.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : C;
        }
      };
      try {
        e = await f(this.channel);
      } catch (y) {
        if (this.channel !== this.getDefaultChannelName())
          e = await f(this.getDefaultChannelName());
        else
          throw y;
      }
      if (!e)
        throw (0, o.newError)(`Unable to parse channel data from ${t}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
      const g = (0, h.parseUpdateInfo)(e, t, s);
      g.releaseName == null && (g.releaseName = a.name), g.releaseNotes == null && (g.releaseNotes = a.description || null);
      const m = /* @__PURE__ */ new Map();
      for (const y of a.assets.links)
        m.set(this.normalizeFilename(y.name), y.direct_asset_url);
      const v = {
        tag: r,
        assets: m,
        ...g
      };
      return this.cachedLatestVersion = v, v;
    }
    /**
     * Utility function to convert GitlabReleaseAsset to Map<string, string>
     * Maps asset names to their download URLs
     */
    convertAssetsToMap(l) {
      const i = /* @__PURE__ */ new Map();
      for (const a of l.links)
        i.set(this.normalizeFilename(a.name), a.direct_asset_url);
      return i;
    }
    /**
     * Find blockmap file URL in assets map for a specific filename
     */
    findBlockMapInAssets(l, i) {
      const a = [`${i}.blockmap`, `${this.normalizeFilename(i)}.blockmap`];
      for (const r of a) {
        const e = l.get(r);
        if (e)
          return new d.URL(e);
      }
      return null;
    }
    async fetchReleaseInfoByVersion(l) {
      const i = new o.CancellationToken(), a = [`v${l}`, l];
      for (const r of a) {
        const e = (0, c.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(r)}`, this.baseApiUrl);
        try {
          const t = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, s = await this.httpRequest(e, t, i);
          if (s)
            return JSON.parse(s);
        } catch (t) {
          if (t instanceof o.HttpError && t.statusCode === 404)
            continue;
          throw (0, o.newError)(`Unable to find release ${r} on GitLab (${e}): ${t.stack || t.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
        }
      }
      throw (0, o.newError)(`Unable to find release with version ${l} (tried: ${a.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
    }
    setAuthHeaderForToken(l) {
      const i = {};
      return l != null && (l.startsWith("Bearer") ? i.authorization = l : i["PRIVATE-TOKEN"] = l), i;
    }
    /**
     * Get version info for blockmap files, using cache when possible
     */
    async getVersionInfoForBlockMap(l) {
      if (this.cachedLatestVersion && this.cachedLatestVersion.version === l)
        return this.cachedLatestVersion.assets;
      const i = await this.fetchReleaseInfoByVersion(l);
      return i && i.assets ? this.convertAssetsToMap(i.assets) : null;
    }
    /**
     * Find blockmap URLs from version assets
     */
    async findBlockMapUrlsFromAssets(l, i, a) {
      let r = null, e = null;
      const t = await this.getVersionInfoForBlockMap(i);
      t && (r = this.findBlockMapInAssets(t, a));
      const s = await this.getVersionInfoForBlockMap(l);
      if (s) {
        const f = a.replace(new RegExp(p(i), "g"), l);
        e = this.findBlockMapInAssets(s, f);
      }
      return [e, r];
    }
    async getBlockMapFiles(l, i, a, r = null) {
      if (this.options.uploadTarget === "project_upload") {
        const e = l.pathname.split("/").pop() || "", [t, s] = await this.findBlockMapUrlsFromAssets(i, a, e);
        if (!s)
          throw (0, o.newError)(`Cannot find blockmap file for ${a} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        if (!t)
          throw (0, o.newError)(`Cannot find blockmap file for ${i} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        return [t, s];
      } else
        return super.getBlockMapFiles(l, i, a, r);
    }
    resolveFiles(l) {
      return (0, h.getFileList)(l).map((i) => {
        const r = [
          i.url,
          // Original filename
          this.normalizeFilename(i.url)
          // Normalized filename (spaces/underscores → dashes)
        ].find((t) => l.assets.has(t)), e = r ? l.assets.get(r) : void 0;
        if (!e)
          throw (0, o.newError)(`Cannot find asset "${i.url}" in GitLab release assets. Available assets: ${Array.from(l.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new d.URL(e),
          info: i
        };
      });
    }
    toString() {
      return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
    }
  };
  return nn.GitLabProvider = u, nn;
}
var an = {}, Pp;
function Qy() {
  if (Pp) return an;
  Pp = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.KeygenProvider = void 0;
  const o = ot(), d = mr(), p = bt();
  let c = class extends p.Provider {
    constructor(u, n, l) {
      super({
        ...l,
        isUseMultipleRangeRequest: !1
      }), this.configuration = u, this.updater = n, this.defaultHostname = "api.keygen.sh";
      const i = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, d.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const u = new o.CancellationToken(), n = (0, d.getChannelFilename)(this.getCustomChannelName(this.channel)), l = (0, d.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const i = await this.httpRequest(l, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, u);
        return (0, p.parseUpdateInfo)(i, n, l);
      } catch (i) {
        throw (0, o.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(u) {
      return (0, p.resolveFiles)(u, this.baseUrl);
    }
    toString() {
      const { account: u, product: n, platform: l } = this.configuration;
      return `Keygen (account: ${u}, product: ${n}, platform: ${l}, channel: ${this.channel})`;
    }
  };
  return an.KeygenProvider = c, an;
}
var sn = {}, xp;
function ew() {
  if (xp) return sn;
  xp = 1, Object.defineProperty(sn, "__esModule", { value: !0 }), sn.PrivateGitHubProvider = void 0;
  const o = ot(), d = Xl(), p = Ye, c = Vt, h = mr(), u = Pg(), n = bt();
  let l = class extends u.BaseGitHubProvider {
    constructor(a, r, e, t) {
      super(a, "api.github.com", t), this.updater = r, this.token = e;
    }
    createRequestOptions(a, r) {
      const e = super.createRequestOptions(a, r);
      return e.redirect = "manual", e;
    }
    async getLatestVersion() {
      const a = new o.CancellationToken(), r = (0, h.getChannelFilename)(this.getDefaultChannelName()), e = await this.getLatestVersionInfo(a), t = e.assets.find((g) => g.name === r);
      if (t == null)
        throw (0, o.newError)(`Cannot find ${r} in the release ${e.html_url || e.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const s = new c.URL(t.url);
      let f;
      try {
        f = (0, d.load)(await this.httpRequest(s, this.configureHeaders("application/octet-stream"), a));
      } catch (g) {
        throw g instanceof o.HttpError && g.statusCode === 404 ? (0, o.newError)(`Cannot find ${r} in the latest release artifacts (${s}): ${g.stack || g.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : g;
      }
      return f.assets = e.assets, f;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(a) {
      return {
        accept: a,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(a) {
      const r = this.updater.allowPrerelease;
      let e = this.basePath;
      r || (e = `${e}/latest`);
      const t = (0, h.newUrlFromBase)(e, this.baseUrl);
      try {
        const s = JSON.parse(await this.httpRequest(t, this.configureHeaders("application/vnd.github.v3+json"), a));
        return r ? s.find((f) => f.prerelease) || s[0] : s;
      } catch (s) {
        throw (0, o.newError)(`Unable to find latest version on GitHub (${t}), please ensure a production release exists: ${s.stack || s.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(a) {
      return (0, n.getFileList)(a).map((r) => {
        const e = p.posix.basename(r.url).replace(/ /g, "-"), t = a.assets.find((s) => s != null && s.name === e);
        if (t == null)
          throw (0, o.newError)(`Cannot find asset "${e}" in: ${JSON.stringify(a.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new c.URL(t.url),
          info: r
        };
      });
    }
  };
  return sn.PrivateGitHubProvider = l, sn;
}
var Lp;
function tw() {
  if (Lp) return tn;
  Lp = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.isUrlProbablySupportMultiRangeRequests = l, tn.createClient = i;
  const o = ot(), d = Zy(), p = Dg(), c = Pg(), h = Xy(), u = Qy(), n = ew();
  function l(a) {
    return !a.includes("s3.amazonaws.com");
  }
  function i(a, r, e) {
    if (typeof a == "string")
      throw (0, o.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const t = a.provider;
    switch (t) {
      case "github": {
        const s = a, f = (s.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || s.token;
        return f == null ? new c.GitHubProvider(s, r, e) : new n.PrivateGitHubProvider(s, r, f, e);
      }
      case "bitbucket":
        return new d.BitbucketProvider(a, r, e);
      case "gitlab":
        return new h.GitLabProvider(a, r, e);
      case "keygen":
        return new u.KeygenProvider(a, r, e);
      case "s3":
      case "spaces":
        return new p.GenericProvider({
          provider: "generic",
          url: (0, o.getS3LikeProviderBaseUrl)(a),
          channel: a.channel || null
        }, r, {
          ...e,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const s = a;
        return new p.GenericProvider(s, r, {
          ...e,
          isUseMultipleRangeRequest: s.useMultipleRangeRequest !== !1 && l(s.url)
        });
      }
      case "custom": {
        const s = a, f = s.updateProvider;
        if (!f)
          throw (0, o.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new f(s, r, e);
      }
      default:
        throw (0, o.newError)(`Unsupported provider: ${t}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return tn;
}
var on = {}, ln = {}, Nr = {}, Ir = {}, Fp;
function au() {
  if (Fp) return Ir;
  Fp = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.OperationKind = void 0, Ir.computeOperations = d;
  var o;
  (function(n) {
    n[n.COPY = 0] = "COPY", n[n.DOWNLOAD = 1] = "DOWNLOAD";
  })(o || (Ir.OperationKind = o = {}));
  function d(n, l, i) {
    const a = u(n.files), r = u(l.files);
    let e = null;
    const t = l.files[0], s = [], f = t.name, g = a.get(f);
    if (g == null)
      throw new Error(`no file ${f} in old blockmap`);
    const m = r.get(f);
    let v = 0;
    const { checksumToOffset: y, checksumToOldSize: E } = h(a.get(f), g.offset, i);
    let R = t.offset;
    for (let C = 0; C < m.checksums.length; R += m.sizes[C], C++) {
      const I = m.sizes[C], k = m.checksums[C];
      let O = y.get(k);
      O != null && E.get(k) !== I && (i.warn(`Checksum ("${k}") matches, but size differs (old: ${E.get(k)}, new: ${I})`), O = void 0), O === void 0 ? (v++, e != null && e.kind === o.DOWNLOAD && e.end === R ? e.end += I : (e = {
        kind: o.DOWNLOAD,
        start: R,
        end: R + I
        // oldBlocks: null,
      }, c(e, s, k, C))) : e != null && e.kind === o.COPY && e.end === O ? e.end += I : (e = {
        kind: o.COPY,
        start: O,
        end: O + I
        // oldBlocks: [checksum]
      }, c(e, s, k, C));
    }
    return v > 0 && i.info(`File${t.name === "file" ? "" : " " + t.name} has ${v} changed blocks`), s;
  }
  const p = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function c(n, l, i, a) {
    if (p && l.length !== 0) {
      const r = l[l.length - 1];
      if (r.kind === n.kind && n.start < r.end && n.start > r.start) {
        const e = [r.start, r.end, n.start, n.end].reduce((t, s) => t < s ? t : s);
        throw new Error(`operation (block index: ${a}, checksum: ${i}, kind: ${o[n.kind]}) overlaps previous operation (checksum: ${i}):
abs: ${r.start} until ${r.end} and ${n.start} until ${n.end}
rel: ${r.start - e} until ${r.end - e} and ${n.start - e} until ${n.end - e}`);
      }
    }
    l.push(n);
  }
  function h(n, l, i) {
    const a = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
    let e = l;
    for (let t = 0; t < n.checksums.length; t++) {
      const s = n.checksums[t], f = n.sizes[t], g = r.get(s);
      if (g === void 0)
        a.set(s, e), r.set(s, f);
      else if (i.debug != null) {
        const m = g === f ? "(same size)" : `(size: ${g}, this size: ${f})`;
        i.debug(`${s} duplicated in blockmap ${m}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      e += f;
    }
    return { checksumToOffset: a, checksumToOldSize: r };
  }
  function u(n) {
    const l = /* @__PURE__ */ new Map();
    for (const i of n)
      l.set(i.name, i);
    return l;
  }
  return Ir;
}
var Up;
function xg() {
  if (Up) return Nr;
  Up = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.DataSplitter = void 0, Nr.copyData = n;
  const o = ot(), d = Kt, p = ur, c = au(), h = Buffer.from(`\r
\r
`);
  var u;
  (function(i) {
    i[i.INIT = 0] = "INIT", i[i.HEADER = 1] = "HEADER", i[i.BODY = 2] = "BODY";
  })(u || (u = {}));
  function n(i, a, r, e, t) {
    const s = (0, d.createReadStream)("", {
      fd: r,
      autoClose: !1,
      start: i.start,
      // end is inclusive
      end: i.end - 1
    });
    s.on("error", e), s.once("end", t), s.pipe(a, {
      end: !1
    });
  }
  let l = class extends p.Writable {
    constructor(a, r, e, t, s, f, g, m) {
      super(), this.out = a, this.options = r, this.partIndexToTaskIndex = e, this.partIndexToLength = s, this.finishHandler = f, this.grandTotalBytes = g, this.onProgress = m, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = u.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = t.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(a, r, e) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${a.length} bytes`);
        return;
      }
      this.handleData(a).then(() => {
        if (this.onProgress) {
          const t = Date.now();
          (t >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (t - this.start) / 1e3 && (this.nextUpdate = t + 1e3, this.onProgress({
            total: this.grandTotalBytes,
            delta: this.delta,
            transferred: this.transferred,
            percent: this.transferred / this.grandTotalBytes * 100,
            bytesPerSecond: Math.round(this.transferred / ((t - this.start) / 1e3))
          }), this.delta = 0);
        }
        e();
      }).catch(e);
    }
    async handleData(a) {
      let r = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, o.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const e = Math.min(this.ignoreByteCount, a.length);
        this.ignoreByteCount -= e, r = e;
      } else if (this.remainingPartDataCount > 0) {
        const e = Math.min(this.remainingPartDataCount, a.length);
        this.remainingPartDataCount -= e, await this.processPartData(a, 0, e), r = e;
      }
      if (r !== a.length) {
        if (this.readState === u.HEADER) {
          const e = this.searchHeaderListEnd(a, r);
          if (e === -1)
            return;
          r = e, this.readState = u.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === u.BODY)
            this.readState = u.INIT;
          else {
            this.partIndex++;
            let f = this.partIndexToTaskIndex.get(this.partIndex);
            if (f == null)
              if (this.isFinished)
                f = this.options.end;
              else
                throw (0, o.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const g = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (g < f)
              await this.copyExistingData(g, f);
            else if (g > f)
              throw (0, o.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (r = this.searchHeaderListEnd(a, r), r === -1) {
              this.readState = u.HEADER;
              return;
            }
          }
          const e = this.partIndexToLength[this.partIndex], t = r + e, s = Math.min(t, a.length);
          if (await this.processPartStarted(a, r, s), this.remainingPartDataCount = e - (s - r), this.remainingPartDataCount > 0)
            return;
          if (r = t + this.boundaryLength, r >= a.length) {
            this.ignoreByteCount = this.boundaryLength - (a.length - t);
            return;
          }
        }
      }
    }
    copyExistingData(a, r) {
      return new Promise((e, t) => {
        const s = () => {
          if (a === r) {
            e();
            return;
          }
          const f = this.options.tasks[a];
          if (f.kind !== c.OperationKind.COPY) {
            t(new Error("Task kind must be COPY"));
            return;
          }
          n(f, this.out, this.options.oldFileFd, t, () => {
            a++, s();
          });
        };
        s();
      });
    }
    searchHeaderListEnd(a, r) {
      const e = a.indexOf(h, r);
      if (e !== -1)
        return e + h.length;
      const t = r === 0 ? a : a.slice(r);
      return this.headerListBuffer == null ? this.headerListBuffer = t : this.headerListBuffer = Buffer.concat([this.headerListBuffer, t]), -1;
    }
    onPartEnd() {
      const a = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== a)
        throw (0, o.newError)(`Expected length: ${a} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(a, r, e) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(a, r, e);
    }
    processPartData(a, r, e) {
      this.actualPartLength += e - r, this.transferred += e - r, this.delta += e - r;
      const t = this.out;
      return t.write(r === 0 && a.length === e ? a : a.slice(r, e)) ? Promise.resolve() : new Promise((s, f) => {
        t.on("error", f), t.once("drain", () => {
          t.removeListener("error", f), s();
        });
      });
    }
  };
  return Nr.DataSplitter = l, Nr;
}
var un = {}, $p;
function rw() {
  if ($p) return un;
  $p = 1, Object.defineProperty(un, "__esModule", { value: !0 }), un.executeTasksUsingMultipleRangeRequests = c, un.checkIsRangesSupported = u;
  const o = ot(), d = xg(), p = au();
  function c(n, l, i, a, r) {
    const e = (t) => {
      if (t >= l.length) {
        n.fileMetadataBuffer != null && i.write(n.fileMetadataBuffer), i.end();
        return;
      }
      const s = t + 1e3;
      h(n, {
        tasks: l,
        start: t,
        end: Math.min(l.length, s),
        oldFileFd: a
      }, i, () => e(s), r);
    };
    return e;
  }
  function h(n, l, i, a, r) {
    let e = "bytes=", t = 0, s = 0;
    const f = /* @__PURE__ */ new Map(), g = [];
    for (let y = l.start; y < l.end; y++) {
      const E = l.tasks[y];
      E.kind === p.OperationKind.DOWNLOAD && (e += `${E.start}-${E.end - 1}, `, f.set(t, y), t++, g.push(E.end - E.start), s += E.end - E.start);
    }
    if (t <= 1) {
      const y = (E) => {
        if (E >= l.end) {
          a();
          return;
        }
        const R = l.tasks[E++];
        if (R.kind === p.OperationKind.COPY)
          (0, d.copyData)(R, i, l.oldFileFd, r, () => y(E));
        else {
          const C = n.createRequestOptions();
          C.headers.Range = `bytes=${R.start}-${R.end - 1}`;
          const I = n.httpExecutor.createRequest(C, (k) => {
            k.on("error", r), u(k, r) && (k.pipe(i, {
              end: !1
            }), k.once("end", () => y(E)));
          });
          n.httpExecutor.addErrorAndTimeoutHandlers(I, r), I.end();
        }
      };
      y(l.start);
      return;
    }
    const m = n.createRequestOptions();
    m.headers.Range = e.substring(0, e.length - 2);
    const v = n.httpExecutor.createRequest(m, (y) => {
      if (!u(y, r))
        return;
      const E = (0, o.safeGetHeader)(y, "content-type"), R = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(E);
      if (R == null) {
        r(new Error(`Content-Type "multipart/byteranges" is expected, but got "${E}"`));
        return;
      }
      const C = new d.DataSplitter(i, l, f, R[1] || R[2], g, a, s, n.options.onProgress);
      C.on("error", r), y.pipe(C), y.on("end", () => {
        setTimeout(() => {
          v.abort(), r(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    n.httpExecutor.addErrorAndTimeoutHandlers(v, r), v.end();
  }
  function u(n, l) {
    if (n.statusCode >= 400)
      return l((0, o.createHttpError)(n)), !1;
    if (n.statusCode !== 206) {
      const i = (0, o.safeGetHeader)(n, "accept-ranges");
      if (i == null || i === "none")
        return l(new Error(`Server doesn't support Accept-Ranges (response code ${n.statusCode})`)), !1;
    }
    return !0;
  }
  return un;
}
var cn = {}, qp;
function nw() {
  if (qp) return cn;
  qp = 1, Object.defineProperty(cn, "__esModule", { value: !0 }), cn.ProgressDifferentialDownloadCallbackTransform = void 0;
  const o = ur;
  var d;
  (function(c) {
    c[c.COPY = 0] = "COPY", c[c.DOWNLOAD = 1] = "DOWNLOAD";
  })(d || (d = {}));
  let p = class extends o.Transform {
    constructor(h, u, n) {
      super(), this.progressDifferentialDownloadInfo = h, this.cancellationToken = u, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = d.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(h, u, n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == d.COPY) {
        n(null, h);
        return;
      }
      this.transferred += h.length, this.delta += h.length;
      const l = Date.now();
      l >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = l + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((l - this.start) / 1e3))
      }), this.delta = 0), n(null, h);
    }
    beginFileCopy() {
      this.operationType = d.COPY;
    }
    beginRangeDownload() {
      this.operationType = d.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(h) {
      if (this.cancellationToken.cancelled) {
        h(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, h(null);
    }
  };
  return cn.ProgressDifferentialDownloadCallbackTransform = p, cn;
}
var Mp;
function Lg() {
  if (Mp) return ln;
  Mp = 1, Object.defineProperty(ln, "__esModule", { value: !0 }), ln.DifferentialDownloader = void 0;
  const o = ot(), d = /* @__PURE__ */ Xt(), p = Kt, c = xg(), h = Vt, u = au(), n = rw(), l = nw();
  let i = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(t, s, f) {
      this.blockAwareFileInfo = t, this.httpExecutor = s, this.options = f, this.fileMetadataBuffer = null, this.logger = f.logger;
    }
    createRequestOptions() {
      const t = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, o.configureRequestUrl)(this.options.newUrl, t), (0, o.configureRequestOptions)(t), t;
    }
    doDownload(t, s) {
      if (t.version !== s.version)
        throw new Error(`version is different (${t.version} - ${s.version}), full download is required`);
      const f = this.logger, g = (0, u.computeOperations)(t, s, f);
      f.debug != null && f.debug(JSON.stringify(g, null, 2));
      let m = 0, v = 0;
      for (const E of g) {
        const R = E.end - E.start;
        E.kind === u.OperationKind.DOWNLOAD ? m += R : v += R;
      }
      const y = this.blockAwareFileInfo.size;
      if (m + v + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== y)
        throw new Error(`Internal error, size mismatch: downloadSize: ${m}, copySize: ${v}, newSize: ${y}`);
      return f.info(`Full: ${a(y)}, To download: ${a(m)} (${Math.round(m / (y / 100))}%)`), this.downloadFile(g);
    }
    downloadFile(t) {
      const s = [], f = () => Promise.all(s.map((g) => (0, d.close)(g.descriptor).catch((m) => {
        this.logger.error(`cannot close file "${g.path}": ${m}`);
      })));
      return this.doDownloadFile(t, s).then(f).catch((g) => f().catch((m) => {
        try {
          this.logger.error(`cannot close files: ${m}`);
        } catch (v) {
          try {
            console.error(v);
          } catch {
          }
        }
        throw g;
      }).then(() => {
        throw g;
      }));
    }
    async doDownloadFile(t, s) {
      const f = await (0, d.open)(this.options.oldFile, "r");
      s.push({ descriptor: f, path: this.options.oldFile });
      const g = await (0, d.open)(this.options.newFile, "w");
      s.push({ descriptor: g, path: this.options.newFile });
      const m = (0, p.createWriteStream)(this.options.newFile, { fd: g });
      await new Promise((v, y) => {
        const E = [];
        let R;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const U = [];
          let j = 0;
          for (const H of t)
            H.kind === u.OperationKind.DOWNLOAD && (U.push(H.end - H.start), j += H.end - H.start);
          const B = {
            expectedByteCounts: U,
            grandTotal: j
          };
          R = new l.ProgressDifferentialDownloadCallbackTransform(B, this.options.cancellationToken, this.options.onProgress), E.push(R);
        }
        const C = new o.DigestTransform(this.blockAwareFileInfo.sha512);
        C.isValidateOnEnd = !1, E.push(C), m.on("finish", () => {
          m.close(() => {
            s.splice(1, 1);
            try {
              C.validate();
            } catch (U) {
              y(U);
              return;
            }
            v(void 0);
          });
        }), E.push(m);
        let I = null;
        for (const U of E)
          U.on("error", y), I == null ? I = U : I = I.pipe(U);
        const k = E[0];
        let O;
        if (this.options.isUseMultipleRangeRequest) {
          O = (0, n.executeTasksUsingMultipleRangeRequests)(this, t, k, f, y), O(0);
          return;
        }
        let A = 0, M = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const z = this.createRequestOptions();
        z.redirect = "manual", O = (U) => {
          var j, B;
          if (U >= t.length) {
            this.fileMetadataBuffer != null && k.write(this.fileMetadataBuffer), k.end();
            return;
          }
          const H = t[U++];
          if (H.kind === u.OperationKind.COPY) {
            R && R.beginFileCopy(), (0, c.copyData)(H, k, f, y, () => O(U));
            return;
          }
          const te = `bytes=${H.start}-${H.end - 1}`;
          z.headers.range = te, (B = (j = this.logger) === null || j === void 0 ? void 0 : j.debug) === null || B === void 0 || B.call(j, `download range: ${te}`), R && R.beginRangeDownload();
          const N = this.httpExecutor.createRequest(z, (F) => {
            F.on("error", y), F.on("aborted", () => {
              y(new Error("response has been aborted by the server"));
            }), F.statusCode >= 400 && y((0, o.createHttpError)(F)), F.pipe(k, {
              end: !1
            }), F.once("end", () => {
              R && R.endRangeDownload(), ++A === 100 ? (A = 0, setTimeout(() => O(U), 1e3)) : O(U);
            });
          });
          N.on("redirect", (F, G, Q) => {
            this.logger.info(`Redirect to ${r(Q)}`), M = Q, (0, o.configureRequestUrl)(new h.URL(M), z), N.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(N, y), N.end();
        }, O(0);
      });
    }
    async readRemoteBytes(t, s) {
      const f = Buffer.allocUnsafe(s + 1 - t), g = this.createRequestOptions();
      g.headers.range = `bytes=${t}-${s}`;
      let m = 0;
      if (await this.request(g, (v) => {
        v.copy(f, m), m += v.length;
      }), m !== f.length)
        throw new Error(`Received data length ${m} is not equal to expected ${f.length}`);
      return f;
    }
    request(t, s) {
      return new Promise((f, g) => {
        const m = this.httpExecutor.createRequest(t, (v) => {
          (0, n.checkIsRangesSupported)(v, g) && (v.on("error", g), v.on("aborted", () => {
            g(new Error("response has been aborted by the server"));
          }), v.on("data", s), v.on("end", () => f()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(m, g), m.end();
      });
    }
  };
  ln.DifferentialDownloader = i;
  function a(e, t = " KB") {
    return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
  }
  function r(e) {
    const t = e.indexOf("?");
    return t < 0 ? e : e.substring(0, t);
  }
  return ln;
}
var Bp;
function iw() {
  if (Bp) return on;
  Bp = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.GenericDifferentialDownloader = void 0;
  const o = Lg();
  let d = class extends o.DifferentialDownloader {
    download(c, h) {
      return this.doDownload(c, h);
    }
  };
  return on.GenericDifferentialDownloader = d, on;
}
var Ol = {}, jp;
function gr() {
  return jp || (jp = 1, (function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.UpdaterSignal = o.UPDATE_DOWNLOADED = o.DOWNLOAD_PROGRESS = o.CancellationToken = void 0, o.addHandler = c;
    const d = ot();
    Object.defineProperty(o, "CancellationToken", { enumerable: !0, get: function() {
      return d.CancellationToken;
    } }), o.DOWNLOAD_PROGRESS = "download-progress", o.UPDATE_DOWNLOADED = "update-downloaded";
    class p {
      constructor(u) {
        this.emitter = u;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(u) {
        c(this.emitter, "login", u);
      }
      progress(u) {
        c(this.emitter, o.DOWNLOAD_PROGRESS, u);
      }
      updateDownloaded(u) {
        c(this.emitter, o.UPDATE_DOWNLOADED, u);
      }
      updateCancelled(u) {
        c(this.emitter, "update-cancelled", u);
      }
    }
    o.UpdaterSignal = p;
    function c(h, u, n) {
      h.on(u, n);
    }
  })(Ol)), Ol;
}
var Hp;
function su() {
  if (Hp) return ar;
  Hp = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.NoOpLogger = ar.AppUpdater = void 0;
  const o = ot(), d = _n, p = vi, c = Ll, h = /* @__PURE__ */ Xt(), u = Xl(), n = by(), l = Ye, i = Ng(), a = Yy(), r = Vy(), e = Jy(), t = Dg(), s = tw(), f = dm, g = iw(), m = gr();
  let v = class Fg extends c.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(C) {
      if (this._channel != null) {
        if (typeof C != "string")
          throw (0, o.newError)(`Channel must be a string, but got: ${C}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (C.length === 0)
          throw (0, o.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = C, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(C) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: C
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, e.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(C) {
      this._logger = C ?? new E();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(C) {
      this.clientPromise = null, this._appUpdateConfigPath = C, this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(C) {
      C && (this._isUpdateSupported = C);
    }
    /**
     * Allows developer to override default logic for determining if the user is below the rollout threshold.
     * The default logic compares the staging percentage with numerical representation of user ID.
     * An override can define custom logic, or bypass it if needed.
     */
    get isUserWithinRollout() {
      return this._isUserWithinRollout;
    }
    set isUserWithinRollout(C) {
      C && (this._isUserWithinRollout = C);
    }
    constructor(C, I) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new m.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (A) => this.checkIfUpdateSupported(A), this._isUserWithinRollout = (A) => this.isStagingMatch(A), this.clientPromise = null, this.stagingUserIdPromise = new n.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (A) => {
        this._logger.error(`Error: ${A.stack || A.message}`);
      }), I == null ? (this.app = new r.ElectronAppAdapter(), this.httpExecutor = new e.ElectronHttpExecutor((A, M) => this.emit("login", A, M))) : (this.app = I, this.httpExecutor = null);
      const k = this.app.version, O = (0, i.parse)(k);
      if (O == null)
        throw (0, o.newError)(`App version is not a valid semver version: "${k}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = O, this.allowPrerelease = y(O), C != null && (this.setFeedURL(C), typeof C != "string" && C.requestHeaders && (this.requestHeaders = C.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(C) {
      const I = this.createProviderRuntimeOptions();
      let k;
      typeof C == "string" ? k = new t.GenericProvider({ provider: "generic", url: C }, this, {
        ...I,
        isUseMultipleRangeRequest: (0, s.isUrlProbablySupportMultiRangeRequests)(C)
      }) : k = (0, s.createClient)(C, this, I), this.clientPromise = Promise.resolve(k);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let C = this.checkForUpdatesPromise;
      if (C != null)
        return this._logger.info("Checking for update (already in progress)"), C;
      const I = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), C = this.doCheckForUpdates().then((k) => (I(), k)).catch((k) => {
        throw I(), this.emit("error", k, `Cannot check for updates: ${(k.stack || k).toString()}`), k;
      }), this.checkForUpdatesPromise = C, C;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(C) {
      return this.checkForUpdates().then((I) => I != null && I.downloadPromise ? (I.downloadPromise.then(() => {
        const k = Fg.formatDownloadNotification(I.updateInfo.version, this.app.name, C);
        new lr.Notification(k).show();
      }), I) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), I));
    }
    static formatDownloadNotification(C, I, k) {
      return k == null && (k = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), k = {
        title: k.title.replace("{appName}", I).replace("{version}", C),
        body: k.body.replace("{appName}", I).replace("{version}", C)
      }, k;
    }
    async isStagingMatch(C) {
      const I = C.stagingPercentage;
      let k = I;
      if (k == null)
        return !0;
      if (k = parseInt(k, 10), isNaN(k))
        return this._logger.warn(`Staging percentage is NaN: ${I}`), !0;
      k = k / 100;
      const O = await this.stagingUserIdPromise.value, M = o.UUID.parse(O).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${k}, percentage: ${M}, user id: ${O}`), M < k;
    }
    computeFinalHeaders(C) {
      return this.requestHeaders != null && Object.assign(C, this.requestHeaders), C;
    }
    async isUpdateAvailable(C) {
      const I = (0, i.parse)(C.version);
      if (I == null)
        throw (0, o.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${C.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const k = this.currentVersion;
      if ((0, i.eq)(I, k) || !await Promise.resolve(this.isUpdateSupported(C)) || !await Promise.resolve(this.isUserWithinRollout(C)))
        return !1;
      const A = (0, i.gt)(I, k), M = (0, i.lt)(I, k);
      return A ? !0 : this.allowDowngrade && M;
    }
    checkIfUpdateSupported(C) {
      const I = C == null ? void 0 : C.minimumSystemVersion, k = (0, p.release)();
      if (I)
        try {
          if ((0, i.lt)(k, I))
            return this._logger.info(`Current OS version ${k} is less than the minimum OS version required ${I} for version ${k}`), !1;
        } catch (O) {
          this._logger.warn(`Failed to compare current OS version(${k}) with minimum OS version(${I}): ${(O.message || O).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((k) => (0, s.createClient)(k, this, this.createProviderRuntimeOptions())));
      const C = await this.clientPromise, I = await this.stagingUserIdPromise.value;
      return C.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": I })), {
        info: await C.getLatestVersion(),
        provider: C
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const C = await this.getUpdateInfoAndProvider(), I = C.info;
      if (!await this.isUpdateAvailable(I))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${I.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", I), {
          isUpdateAvailable: !1,
          versionInfo: I,
          updateInfo: I
        };
      this.updateInfoAndProvider = C, this.onUpdateAvailable(I);
      const k = new o.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: I,
        updateInfo: I,
        cancellationToken: k,
        downloadPromise: this.autoDownload ? this.downloadUpdate(k) : null
      };
    }
    onUpdateAvailable(C) {
      this._logger.info(`Found version ${C.version} (url: ${(0, o.asArray)(C.files).map((I) => I.url).join(", ")})`), this.emit("update-available", C);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(C = new o.CancellationToken()) {
      const I = this.updateInfoAndProvider;
      if (I == null) {
        const O = new Error("Please check update first");
        return this.dispatchError(O), Promise.reject(O);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, o.asArray)(I.info.files).map((O) => O.url).join(", ")}`);
      const k = (O) => {
        if (!(O instanceof o.CancellationError))
          try {
            this.dispatchError(O);
          } catch (A) {
            this._logger.warn(`Cannot dispatch error event: ${A.stack || A}`);
          }
        return O;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: I,
        requestHeaders: this.computeRequestHeaders(I.provider),
        cancellationToken: C,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((O) => {
        throw k(O);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(C) {
      this.emit("error", C, (C.stack || C).toString());
    }
    dispatchUpdateDownloaded(C) {
      this.emit(m.UPDATE_DOWNLOADED, C);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, u.load)(await (0, h.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(C) {
      const I = C.fileExtraDownloadHeaders;
      if (I != null) {
        const k = this.requestHeaders;
        return k == null ? I : {
          ...I,
          ...k
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const C = l.join(this.app.userDataPath, ".updaterId");
      try {
        const k = await (0, h.readFile)(C, "utf-8");
        if (o.UUID.check(k))
          return k;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${k}`);
      } catch (k) {
        k.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${k}`);
      }
      const I = o.UUID.v5((0, d.randomBytes)(4096), o.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${I}`);
      try {
        await (0, h.outputFile)(C, I);
      } catch (k) {
        this._logger.warn(`Couldn't write out staging user ID: ${k}`);
      }
      return I;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const C = this.requestHeaders;
      if (C == null)
        return !0;
      for (const I of Object.keys(C)) {
        const k = I.toLowerCase();
        if (k === "authorization" || k === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let C = this.downloadedUpdateHelper;
      if (C == null) {
        const I = (await this.configOnDisk.value).updaterCacheDirName, k = this._logger;
        I == null && k.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const O = l.join(this.app.baseCachePath, I || this.app.name);
        k.debug != null && k.debug(`updater cache dir: ${O}`), C = new a.DownloadedUpdateHelper(O), this.downloadedUpdateHelper = C;
      }
      return C;
    }
    async executeDownload(C) {
      const I = C.fileInfo, k = {
        headers: C.downloadUpdateOptions.requestHeaders,
        cancellationToken: C.downloadUpdateOptions.cancellationToken,
        sha2: I.info.sha2,
        sha512: I.info.sha512
      };
      this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (k.onProgress = (ae) => this.emit(m.DOWNLOAD_PROGRESS, ae));
      const O = C.downloadUpdateOptions.updateInfoAndProvider.info, A = O.version, M = I.packageInfo;
      function z() {
        const ae = decodeURIComponent(C.fileInfo.url.pathname);
        return ae.toLowerCase().endsWith(`.${C.fileExtension.toLowerCase()}`) ? l.basename(ae) : C.fileInfo.info.url;
      }
      const U = await this.getOrCreateDownloadHelper(), j = U.cacheDirForPendingUpdate;
      await (0, h.mkdir)(j, { recursive: !0 });
      const B = z();
      let H = l.join(j, B);
      const te = M == null ? null : l.join(j, `package-${A}${l.extname(M.path) || ".7z"}`), N = async (ae) => {
        await U.setDownloadedFile(H, te, O, I, B, ae), await C.done({
          ...O,
          downloadedFile: H
        });
        const ve = l.join(j, "current.blockmap");
        return await (0, h.pathExists)(ve) && await (0, h.copyFile)(ve, l.join(U.cacheDir, "current.blockmap")), te == null ? [H] : [H, te];
      }, F = this._logger, G = await U.validateDownloadedPath(H, O, I, F);
      if (G != null)
        return H = G, await N(!1);
      const Q = async () => (await U.clear().catch(() => {
      }), await (0, h.unlink)(H).catch(() => {
      })), ce = await (0, a.createTempUpdateFile)(`temp-${B}`, j, F);
      try {
        await C.task(ce, k, te, Q), await (0, o.retry)(() => (0, h.rename)(ce, H), {
          retries: 60,
          interval: 500,
          shouldRetry: (ae) => ae instanceof Error && /^EBUSY:/.test(ae.message) ? !0 : (F.warn(`Cannot rename temp file to final file: ${ae.message || ae.stack}`), !1)
        });
      } catch (ae) {
        throw await Q(), ae instanceof o.CancellationError && (F.info("cancelled"), this.emit("update-cancelled", O)), ae;
      }
      return F.info(`New version ${A} has been downloaded to ${H}`), await N(!0);
    }
    async differentialDownloadInstaller(C, I, k, O, A) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const M = I.updateInfoAndProvider.provider, z = await M.getBlockMapFiles(C.url, this.app.version, I.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
        this._logger.info(`Download block maps (old: "${z[0]}", new: ${z[1]})`);
        const U = async (F) => {
          const G = await this.httpExecutor.downloadToBuffer(F, {
            headers: I.requestHeaders,
            cancellationToken: I.cancellationToken
          });
          if (G == null || G.length === 0)
            throw new Error(`Blockmap "${F.href}" is empty`);
          try {
            return JSON.parse((0, f.gunzipSync)(G).toString());
          } catch (Q) {
            throw new Error(`Cannot parse blockmap "${F.href}", error: ${Q}`);
          }
        }, j = {
          newUrl: C.url,
          oldFile: l.join(this.downloadedUpdateHelper.cacheDir, A),
          logger: this._logger,
          newFile: k,
          isUseMultipleRangeRequest: M.isUseMultipleRangeRequest,
          requestHeaders: I.requestHeaders,
          cancellationToken: I.cancellationToken
        };
        this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (j.onProgress = (F) => this.emit(m.DOWNLOAD_PROGRESS, F));
        const B = async (F, G) => {
          const Q = l.join(G, "current.blockmap");
          await (0, h.outputFile)(Q, (0, f.gzipSync)(JSON.stringify(F)));
        }, H = async (F) => {
          const G = l.join(F, "current.blockmap");
          try {
            if (await (0, h.pathExists)(G))
              return JSON.parse((0, f.gunzipSync)(await (0, h.readFile)(G)).toString());
          } catch (Q) {
            this._logger.warn(`Cannot parse blockmap "${G}", error: ${Q}`);
          }
          return null;
        }, te = await U(z[1]);
        await B(te, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
        let N = await H(this.downloadedUpdateHelper.cacheDir);
        return N == null && (N = await U(z[0])), await new g.GenericDifferentialDownloader(C.info, this.httpExecutor, j).download(N, te), !1;
      } catch (M) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${M.stack || M}`), this._testOnlyOptions != null)
          throw M;
        return !0;
      }
    }
  };
  ar.AppUpdater = v;
  function y(R) {
    const C = (0, i.prerelease)(R);
    return C != null && C.length > 0;
  }
  class E {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(C) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(C) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(C) {
    }
  }
  return ar.NoOpLogger = E, ar;
}
var zp;
function $i() {
  if (zp) return Vr;
  zp = 1, Object.defineProperty(Vr, "__esModule", { value: !0 }), Vr.BaseUpdater = void 0;
  const o = gi, d = su();
  let p = class extends d.AppUpdater {
    constructor(h, u) {
      super(h, u), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(h = !1, u = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(h, h ? u : this.autoRunAppAfterInstall) ? setImmediate(() => {
        lr.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(h) {
      return super.executeDownload({
        ...h,
        done: (u) => (this.dispatchUpdateDownloaded(u), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(h = !1, u = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const n = this.downloadedUpdateHelper, l = this.installerPath, i = n == null ? null : n.downloadedFileInfo;
      if (l == null || i == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${h}, isForceRunAfter: ${u}`), this.doInstall({
          isSilent: h,
          isForceRunAfter: u,
          isAdminRightsRequired: i.isAdminRightsRequired
        });
      } catch (a) {
        return this.dispatchError(a), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((h) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (h !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${h}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    spawnSyncLog(h, u = [], n = {}) {
      this._logger.info(`Executing: ${h} with args: ${u}`);
      const l = (0, o.spawnSync)(h, u, {
        env: { ...process.env, ...n },
        encoding: "utf-8",
        shell: !0
      }), { error: i, status: a, stdout: r, stderr: e } = l;
      if (i != null)
        throw this._logger.error(e), i;
      if (a != null && a !== 0)
        throw this._logger.error(e), new Error(`Command ${h} exited with code ${a}`);
      return r.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(h, u = [], n = void 0, l = "ignore") {
      return this._logger.info(`Executing: ${h} with args: ${u}`), new Promise((i, a) => {
        try {
          const r = { stdio: l, env: n, detached: !0 }, e = (0, o.spawn)(h, u, r);
          e.on("error", (t) => {
            a(t);
          }), e.unref(), e.pid !== void 0 && i(!0);
        } catch (r) {
          a(r);
        }
      });
    }
  };
  return Vr.BaseUpdater = p, Vr;
}
var fn = {}, dn = {}, Gp;
function Ug() {
  if (Gp) return dn;
  Gp = 1, Object.defineProperty(dn, "__esModule", { value: !0 }), dn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const o = /* @__PURE__ */ Xt(), d = Lg(), p = dm;
  let c = class extends d.DifferentialDownloader {
    async download() {
      const l = this.blockAwareFileInfo, i = l.size, a = i - (l.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(a, i - 1);
      const r = h(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await u(this.options.oldFile), r);
    }
  };
  dn.FileWithEmbeddedBlockMapDifferentialDownloader = c;
  function h(n) {
    return JSON.parse((0, p.inflateRawSync)(n).toString());
  }
  async function u(n) {
    const l = await (0, o.open)(n, "r");
    try {
      const i = (await (0, o.fstat)(l)).size, a = Buffer.allocUnsafe(4);
      await (0, o.read)(l, a, 0, a.length, i - a.length);
      const r = Buffer.allocUnsafe(a.readUInt32BE(0));
      return await (0, o.read)(l, r, 0, r.length, i - a.length - r.length), await (0, o.close)(l), h(r);
    } catch (i) {
      throw await (0, o.close)(l), i;
    }
  }
  return dn;
}
var Wp;
function Yp() {
  if (Wp) return fn;
  Wp = 1, Object.defineProperty(fn, "__esModule", { value: !0 }), fn.AppImageUpdater = void 0;
  const o = ot(), d = gi, p = /* @__PURE__ */ Xt(), c = Kt, h = Ye, u = $i(), n = Ug(), l = bt(), i = gr();
  let a = class extends u.BaseUpdater {
    constructor(e, t) {
      super(e, t);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider, s = (0, l.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: s,
        downloadUpdateOptions: e,
        task: async (f, g) => {
          const m = process.env.APPIMAGE;
          if (m == null)
            throw (0, o.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (e.disableDifferentialDownload || await this.downloadDifferential(s, m, f, t, e)) && await this.httpExecutor.download(s.url, f, g), await (0, p.chmod)(f, 493);
        }
      });
    }
    async downloadDifferential(e, t, s, f, g) {
      try {
        const m = {
          newUrl: e.url,
          oldFile: t,
          logger: this._logger,
          newFile: s,
          isUseMultipleRangeRequest: f.isUseMultipleRangeRequest,
          requestHeaders: g.requestHeaders,
          cancellationToken: g.cancellationToken
        };
        return this.listenerCount(i.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (v) => this.emit(i.DOWNLOAD_PROGRESS, v)), await new n.FileWithEmbeddedBlockMapDifferentialDownloader(e.info, this.httpExecutor, m).download(), !1;
      } catch (m) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${m.stack || m}`), process.platform === "linux";
      }
    }
    doInstall(e) {
      const t = process.env.APPIMAGE;
      if (t == null)
        throw (0, o.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, c.unlinkSync)(t);
      let s;
      const f = h.basename(t), g = this.installerPath;
      if (g == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      h.basename(g) === f || !/\d+\.\d+\.\d+/.test(f) ? s = t : s = h.join(h.dirname(t), h.basename(g)), (0, d.execFileSync)("mv", ["-f", g, s]), s !== t && this.emit("appimage-filename-updated", s);
      const m = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return e.isForceRunAfter ? this.spawnLog(s, [], m) : (m.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, d.execFileSync)(s, [], { env: m })), !0;
    }
  };
  return fn.AppImageUpdater = a, fn;
}
var hn = {}, pn = {}, Kp;
function ou() {
  if (Kp) return pn;
  Kp = 1, Object.defineProperty(pn, "__esModule", { value: !0 }), pn.LinuxUpdater = void 0;
  const o = $i();
  let d = class extends o.BaseUpdater {
    constructor(c, h) {
      super(c, h);
    }
    /**
     * Returns true if the current process is running as root.
     */
    isRunningAsRoot() {
      var c;
      return ((c = process.getuid) === null || c === void 0 ? void 0 : c.call(process)) === 0;
    }
    /**
     * Sanitizies the installer path for using with command line tools.
     */
    get installerPath() {
      var c, h;
      return (h = (c = super.installerPath) === null || c === void 0 ? void 0 : c.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && h !== void 0 ? h : null;
    }
    runCommandWithSudoIfNeeded(c) {
      if (this.isRunningAsRoot())
        return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(c[0], c.slice(1));
      const { name: h } = this.app, u = `"${h} would like to update"`, n = this.sudoWithArgs(u);
      this._logger.info(`Running as non-root user, using sudo to install: ${n}`);
      let l = '"';
      return (/pkexec/i.test(n[0]) || n[0] === "sudo") && (l = ""), this.spawnSyncLog(n[0], [...n.length > 1 ? n.slice(1) : [], `${l}/bin/bash`, "-c", `'${c.join(" ")}'${l}`]);
    }
    sudoWithArgs(c) {
      const h = this.determineSudoCommand(), u = [h];
      return /kdesudo/i.test(h) ? (u.push("--comment", c), u.push("-c")) : /gksudo/i.test(h) ? u.push("--message", c) : /pkexec/i.test(h) && u.push("--disable-internal-agent"), u;
    }
    hasCommand(c) {
      try {
        return this.spawnSyncLog("command", ["-v", c]), !0;
      } catch {
        return !1;
      }
    }
    determineSudoCommand() {
      const c = ["gksudo", "kdesudo", "pkexec", "beesu"];
      for (const h of c)
        if (this.hasCommand(h))
          return h;
      return "sudo";
    }
    /**
     * Detects the package manager to use based on the available commands.
     * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
     * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
     * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
     * @param pms - An array of package manager commands to check for, in priority order.
     * @returns The detected package manager command or "unknown" if none are found.
     */
    detectPackageManager(c) {
      var h;
      const u = (h = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || h === void 0 ? void 0 : h.trim();
      if (u)
        return u;
      for (const n of c)
        if (this.hasCommand(n))
          return n;
      return this._logger.warn(`No package manager found in the list: ${c.join(", ")}. Defaulting to the first one: ${c[0]}`), c[0];
    }
  };
  return pn.LinuxUpdater = d, pn;
}
var Vp;
function Jp() {
  if (Vp) return hn;
  Vp = 1, Object.defineProperty(hn, "__esModule", { value: !0 }), hn.DebUpdater = void 0;
  const o = bt(), d = gr(), p = ou();
  let c = class $g extends p.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, l = (0, o.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: l,
        downloadUpdateOptions: u,
        task: async (i, a) => {
          this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (r) => this.emit(d.DOWNLOAD_PROGRESS, r)), await this.httpExecutor.download(l.url, i, a);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
        return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
      const l = ["dpkg", "apt"], i = this.detectPackageManager(l);
      try {
        $g.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (a) {
        return this.dispatchError(a), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, l, i) {
      var a;
      if (u === "dpkg")
        try {
          l(["dpkg", "-i", n]);
        } catch (r) {
          i.warn((a = r.message) !== null && a !== void 0 ? a : r), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), l(["apt-get", "install", "-f", "-y"]);
        }
      else if (u === "apt")
        i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), l([
          "apt",
          "install",
          "-y",
          "--allow-unauthenticated",
          // needed for unsigned .debs
          "--allow-downgrades",
          // allow lower version installs
          "--allow-change-held-packages",
          n
        ]);
      else
        throw new Error(`Package manager ${u} not supported`);
    }
  };
  return hn.DebUpdater = c, hn;
}
var mn = {}, Zp;
function Xp() {
  if (Zp) return mn;
  Zp = 1, Object.defineProperty(mn, "__esModule", { value: !0 }), mn.PacmanUpdater = void 0;
  const o = gr(), d = bt(), p = ou();
  let c = class qg extends p.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, l = (0, d.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: l,
        downloadUpdateOptions: u,
        task: async (i, a) => {
          this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (r) => this.emit(o.DOWNLOAD_PROGRESS, r)), await this.httpExecutor.download(l.url, i, a);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      try {
        qg.installWithCommandRunner(n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (l) {
        return this.dispatchError(l), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, l) {
      var i;
      try {
        n(["pacman", "-U", "--noconfirm", u]);
      } catch (a) {
        l.warn((i = a.message) !== null && i !== void 0 ? i : a), l.warn("pacman installation failed, attempting to update package database and retry");
        try {
          n(["pacman", "-Sy", "--noconfirm"]), n(["pacman", "-U", "--noconfirm", u]);
        } catch (r) {
          throw l.error("Retry after pacman -Sy failed"), r;
        }
      }
    }
  };
  return mn.PacmanUpdater = c, mn;
}
var gn = {}, Qp;
function em() {
  if (Qp) return gn;
  Qp = 1, Object.defineProperty(gn, "__esModule", { value: !0 }), gn.RpmUpdater = void 0;
  const o = gr(), d = bt(), p = ou();
  let c = class Mg extends p.LinuxUpdater {
    constructor(u, n) {
      super(u, n);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const n = u.updateInfoAndProvider.provider, l = (0, d.findFile)(n.resolveFiles(u.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: l,
        downloadUpdateOptions: u,
        task: async (i, a) => {
          this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (r) => this.emit(o.DOWNLOAD_PROGRESS, r)), await this.httpExecutor.download(l.url, i, a);
        }
      });
    }
    doInstall(u) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const l = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(l);
      try {
        Mg.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (a) {
        return this.dispatchError(a), !1;
      }
      return u.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(u, n, l, i) {
      if (u === "zypper")
        return l(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", n]);
      if (u === "dnf")
        return l(["dnf", "install", "--nogpgcheck", "-y", n]);
      if (u === "yum")
        return l(["yum", "install", "--nogpgcheck", "-y", n]);
      if (u === "rpm")
        return i.warn("Installing with rpm only (no dependency resolution)."), l(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", n]);
      throw new Error(`Package manager ${u} not supported`);
    }
  };
  return gn.RpmUpdater = c, gn;
}
var vn = {}, tm;
function rm() {
  if (tm) return vn;
  tm = 1, Object.defineProperty(vn, "__esModule", { value: !0 }), vn.MacUpdater = void 0;
  const o = ot(), d = /* @__PURE__ */ Xt(), p = Kt, c = Ye, h = k0, u = su(), n = bt(), l = gi, i = _n;
  let a = class extends u.AppUpdater {
    constructor(e, t) {
      super(e, t), this.nativeUpdater = lr.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (s) => {
        this._logger.warn(s), this.emit("error", s);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(e) {
      this._logger.debug != null && this._logger.debug(e);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((e) => {
        e && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(e) {
      let t = e.updateInfoAndProvider.provider.resolveFiles(e.updateInfoAndProvider.info);
      const s = this._logger, f = "sysctl.proc_translated";
      let g = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), g = (0, l.execFileSync)("sysctl", [f], { encoding: "utf8" }).includes(`${f}: 1`), s.info(`Checked for macOS Rosetta environment (isRosetta=${g})`);
      } catch (C) {
        s.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${C}`);
      }
      let m = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const I = (0, l.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        s.info(`Checked 'uname -a': arm64=${I}`), m = m || I;
      } catch (C) {
        s.warn(`uname shell command to check for arm64 failed: ${C}`);
      }
      m = m || process.arch === "arm64" || g;
      const v = (C) => {
        var I;
        return C.url.pathname.includes("arm64") || ((I = C.info.url) === null || I === void 0 ? void 0 : I.includes("arm64"));
      };
      m && t.some(v) ? t = t.filter((C) => m === v(C)) : t = t.filter((C) => !v(C));
      const y = (0, n.findFile)(t, "zip", ["pkg", "dmg"]);
      if (y == null)
        throw (0, o.newError)(`ZIP file not provided: ${(0, o.safeStringifyJson)(t)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const E = e.updateInfoAndProvider.provider, R = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: y,
        downloadUpdateOptions: e,
        task: async (C, I) => {
          const k = c.join(this.downloadedUpdateHelper.cacheDir, R), O = () => (0, d.pathExistsSync)(k) ? !e.disableDifferentialDownload : (s.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let A = !0;
          O() && (A = await this.differentialDownloadInstaller(y, e, C, E, R)), A && await this.httpExecutor.download(y.url, C, I);
        },
        done: async (C) => {
          if (!e.disableDifferentialDownload)
            try {
              const I = c.join(this.downloadedUpdateHelper.cacheDir, R);
              await (0, d.copyFile)(C.downloadedFile, I);
            } catch (I) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${I.message}`);
            }
          return this.updateDownloaded(y, C);
        }
      });
    }
    async updateDownloaded(e, t) {
      var s;
      const f = t.downloadedFile, g = (s = e.info.size) !== null && s !== void 0 ? s : (await (0, d.stat)(f)).size, m = this._logger, v = `fileToProxy=${e.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${v})`), this.server = (0, h.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${v})`), this.server.on("close", () => {
        m.info(`Proxy server for native Squirrel.Mac is closed (${v})`);
      });
      const y = (E) => {
        const R = E.address();
        return typeof R == "string" ? R : `http://127.0.0.1:${R == null ? void 0 : R.port}`;
      };
      return await new Promise((E, R) => {
        const C = (0, i.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), I = Buffer.from(`autoupdater:${C}`, "ascii"), k = `/${(0, i.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (O, A) => {
          const M = O.url;
          if (m.info(`${M} requested`), M === "/") {
            if (!O.headers.authorization || O.headers.authorization.indexOf("Basic ") === -1) {
              A.statusCode = 401, A.statusMessage = "Invalid Authentication Credentials", A.end(), m.warn("No authenthication info");
              return;
            }
            const j = O.headers.authorization.split(" ")[1], B = Buffer.from(j, "base64").toString("ascii"), [H, te] = B.split(":");
            if (H !== "autoupdater" || te !== C) {
              A.statusCode = 401, A.statusMessage = "Invalid Authentication Credentials", A.end(), m.warn("Invalid authenthication credentials");
              return;
            }
            const N = Buffer.from(`{ "url": "${y(this.server)}${k}" }`);
            A.writeHead(200, { "Content-Type": "application/json", "Content-Length": N.length }), A.end(N);
            return;
          }
          if (!M.startsWith(k)) {
            m.warn(`${M} requested, but not supported`), A.writeHead(404), A.end();
            return;
          }
          m.info(`${k} requested by Squirrel.Mac, pipe ${f}`);
          let z = !1;
          A.on("finish", () => {
            z || (this.nativeUpdater.removeListener("error", R), E([]));
          });
          const U = (0, p.createReadStream)(f);
          U.on("error", (j) => {
            try {
              A.end();
            } catch (B) {
              m.warn(`cannot end response: ${B}`);
            }
            z = !0, this.nativeUpdater.removeListener("error", R), R(new Error(`Cannot pipe "${f}": ${j}`));
          }), A.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": g
          }), U.pipe(A);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${v})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${y(this.server)}, ${v})`), this.nativeUpdater.setFeedURL({
            url: y(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${I.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(t), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", R), this.nativeUpdater.checkForUpdates()) : E([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return vn.MacUpdater = a, vn;
}
var yn = {}, mi = {}, nm;
function aw() {
  if (nm) return mi;
  nm = 1, Object.defineProperty(mi, "__esModule", { value: !0 }), mi.verifySignature = u;
  const o = ot(), d = gi, p = vi, c = Ye;
  function h(a, r) {
    return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", a], {
      shell: !0,
      timeout: r
    }];
  }
  function u(a, r, e) {
    return new Promise((t, s) => {
      const f = r.replace(/'/g, "''");
      e.info(`Verifying signature ${f}`), (0, d.execFile)(...h(`"Get-AuthenticodeSignature -LiteralPath '${f}' | ConvertTo-Json -Compress"`, 20 * 1e3), (g, m, v) => {
        var y;
        try {
          if (g != null || v) {
            l(e, g, v, s), t(null);
            return;
          }
          const E = n(m);
          if (E.Status === 0) {
            try {
              const k = c.normalize(E.Path), O = c.normalize(r);
              if (e.info(`LiteralPath: ${k}. Update Path: ${O}`), k !== O) {
                l(e, new Error(`LiteralPath of ${k} is different than ${O}`), v, s), t(null);
                return;
              }
            } catch (k) {
              e.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(y = k.message) !== null && y !== void 0 ? y : k.stack}`);
            }
            const C = (0, o.parseDn)(E.SignerCertificate.Subject);
            let I = !1;
            for (const k of a) {
              const O = (0, o.parseDn)(k);
              if (O.size ? I = Array.from(O.keys()).every((M) => O.get(M) === C.get(M)) : k === C.get("CN") && (e.warn(`Signature validated using only CN ${k}. Please add your full Distinguished Name (DN) to publisherNames configuration`), I = !0), I) {
                t(null);
                return;
              }
            }
          }
          const R = `publisherNames: ${a.join(" | ")}, raw info: ` + JSON.stringify(E, (C, I) => C === "RawData" ? void 0 : I, 2);
          e.warn(`Sign verification failed, installer signed with incorrect certificate: ${R}`), t(R);
        } catch (E) {
          l(e, E, null, s), t(null);
          return;
        }
      });
    });
  }
  function n(a) {
    const r = JSON.parse(a);
    delete r.PrivateKey, delete r.IsOSBinary, delete r.SignatureType;
    const e = r.SignerCertificate;
    return e != null && (delete e.Archived, delete e.Extensions, delete e.Handle, delete e.HasPrivateKey, delete e.SubjectName), r;
  }
  function l(a, r, e, t) {
    if (i()) {
      a.warn(`Cannot execute Get-AuthenticodeSignature: ${r || e}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, d.execFileSync)(...h("ConvertTo-Json test", 10 * 1e3));
    } catch (s) {
      a.warn(`Cannot execute ConvertTo-Json: ${s.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    r != null && t(r), e && t(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${e}. Failing signature validation due to unknown stderr.`));
  }
  function i() {
    const a = p.release();
    return a.startsWith("6.") && !a.startsWith("6.3");
  }
  return mi;
}
var im;
function am() {
  if (im) return yn;
  im = 1, Object.defineProperty(yn, "__esModule", { value: !0 }), yn.NsisUpdater = void 0;
  const o = ot(), d = Ye, p = $i(), c = Ug(), h = gr(), u = bt(), n = /* @__PURE__ */ Xt(), l = aw(), i = Vt;
  let a = class extends p.BaseUpdater {
    constructor(e, t) {
      super(e, t), this._verifyUpdateCodeSignature = (s, f) => (0, l.verifySignature)(s, f, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(e) {
      e && (this._verifyUpdateCodeSignature = e);
    }
    /*** @private */
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider, s = (0, u.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: e,
        fileInfo: s,
        task: async (f, g, m, v) => {
          const y = s.packageInfo, E = y != null && m != null;
          if (E && e.disableWebInstaller)
            throw (0, o.newError)(`Unable to download new version ${e.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !E && !e.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (E || e.disableDifferentialDownload || await this.differentialDownloadInstaller(s, e, f, t, o.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(s.url, f, g);
          const R = await this.verifySignature(f);
          if (R != null)
            throw await v(), (0, o.newError)(`New version ${e.updateInfoAndProvider.info.version} is not signed by the application owner: ${R}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (E && await this.differentialDownloadWebPackage(e, y, m, t))
            try {
              await this.httpExecutor.download(new i.URL(y.path), m, {
                headers: e.requestHeaders,
                cancellationToken: e.cancellationToken,
                sha512: y.sha512
              });
            } catch (C) {
              try {
                await (0, n.unlink)(m);
              } catch {
              }
              throw C;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(e) {
      let t;
      try {
        if (t = (await this.configOnDisk.value).publisherName, t == null)
          return null;
      } catch (s) {
        if (s.code === "ENOENT")
          return null;
        throw s;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(t) ? t : [t], e);
    }
    doInstall(e) {
      const t = this.installerPath;
      if (t == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const s = ["--updated"];
      e.isSilent && s.push("/S"), e.isForceRunAfter && s.push("--force-run"), this.installDirectory && s.push(`/D=${this.installDirectory}`);
      const f = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      f != null && s.push(`--package-file=${f}`);
      const g = () => {
        this.spawnLog(d.join(process.resourcesPath, "elevate.exe"), [t].concat(s)).catch((m) => this.dispatchError(m));
      };
      return e.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), g(), !0) : (this.spawnLog(t, s).catch((m) => {
        const v = m.code;
        this._logger.info(`Cannot run installer: error code: ${v}, error message: "${m.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), v === "UNKNOWN" || v === "EACCES" ? g() : v === "ENOENT" ? lr.shell.openPath(t).catch((y) => this.dispatchError(y)) : this.dispatchError(m);
      }), !0);
    }
    async differentialDownloadWebPackage(e, t, s, f) {
      if (t.blockMapSize == null)
        return !0;
      try {
        const g = {
          newUrl: new i.URL(t.path),
          oldFile: d.join(this.downloadedUpdateHelper.cacheDir, o.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: s,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: f.isUseMultipleRangeRequest,
          cancellationToken: e.cancellationToken
        };
        this.listenerCount(h.DOWNLOAD_PROGRESS) > 0 && (g.onProgress = (m) => this.emit(h.DOWNLOAD_PROGRESS, m)), await new c.FileWithEmbeddedBlockMapDifferentialDownloader(t, this.httpExecutor, g).download();
      } catch (g) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${g.stack || g}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return yn.NsisUpdater = a, yn;
}
var sm;
function sw() {
  return sm || (sm = 1, (function(o) {
    var d = ir && ir.__createBinding || (Object.create ? (function(m, v, y, E) {
      E === void 0 && (E = y);
      var R = Object.getOwnPropertyDescriptor(v, y);
      (!R || ("get" in R ? !v.__esModule : R.writable || R.configurable)) && (R = { enumerable: !0, get: function() {
        return v[y];
      } }), Object.defineProperty(m, E, R);
    }) : (function(m, v, y, E) {
      E === void 0 && (E = y), m[E] = v[y];
    })), p = ir && ir.__exportStar || function(m, v) {
      for (var y in m) y !== "default" && !Object.prototype.hasOwnProperty.call(v, y) && d(v, m, y);
    };
    Object.defineProperty(o, "__esModule", { value: !0 }), o.NsisUpdater = o.MacUpdater = o.RpmUpdater = o.PacmanUpdater = o.DebUpdater = o.AppImageUpdater = o.Provider = o.NoOpLogger = o.AppUpdater = o.BaseUpdater = void 0;
    const c = /* @__PURE__ */ Xt(), h = Ye;
    var u = $i();
    Object.defineProperty(o, "BaseUpdater", { enumerable: !0, get: function() {
      return u.BaseUpdater;
    } });
    var n = su();
    Object.defineProperty(o, "AppUpdater", { enumerable: !0, get: function() {
      return n.AppUpdater;
    } }), Object.defineProperty(o, "NoOpLogger", { enumerable: !0, get: function() {
      return n.NoOpLogger;
    } });
    var l = bt();
    Object.defineProperty(o, "Provider", { enumerable: !0, get: function() {
      return l.Provider;
    } });
    var i = Yp();
    Object.defineProperty(o, "AppImageUpdater", { enumerable: !0, get: function() {
      return i.AppImageUpdater;
    } });
    var a = Jp();
    Object.defineProperty(o, "DebUpdater", { enumerable: !0, get: function() {
      return a.DebUpdater;
    } });
    var r = Xp();
    Object.defineProperty(o, "PacmanUpdater", { enumerable: !0, get: function() {
      return r.PacmanUpdater;
    } });
    var e = em();
    Object.defineProperty(o, "RpmUpdater", { enumerable: !0, get: function() {
      return e.RpmUpdater;
    } });
    var t = rm();
    Object.defineProperty(o, "MacUpdater", { enumerable: !0, get: function() {
      return t.MacUpdater;
    } });
    var s = am();
    Object.defineProperty(o, "NsisUpdater", { enumerable: !0, get: function() {
      return s.NsisUpdater;
    } }), p(gr(), o);
    let f;
    function g() {
      if (process.platform === "win32")
        f = new (am()).NsisUpdater();
      else if (process.platform === "darwin")
        f = new (rm()).MacUpdater();
      else {
        f = new (Yp()).AppImageUpdater();
        try {
          const m = h.join(process.resourcesPath, "package-type");
          if (!(0, c.existsSync)(m))
            return f;
          switch ((0, c.readFileSync)(m).toString().trim()) {
            case "deb":
              f = new (Jp()).DebUpdater();
              break;
            case "rpm":
              f = new (em()).RpmUpdater();
              break;
            case "pacman":
              f = new (Xp()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (m) {
          console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", m.message);
        }
      }
      return f;
    }
    Object.defineProperty(o, "autoUpdater", {
      enumerable: !0,
      get: () => f || g()
    });
  })(ir)), ir;
}
var Ot = sw();
let Xe = null;
Wt.setName("com.zincs.kpa-electron");
om.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: !0,
      // 声明为标准 URI 协议
      secure: !0,
      // 启用安全上下文（类似 https）
      supportFetchAPI: !0,
      // 允许 fetch 请求
      bypassCSP: !1
      // 除非必要，否则保持 false
    }
  }
]);
const Bg = () => {
  Xe = new um({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: Ie.join(import.meta.dirname, "../preload/preload.js")
    },
    autoHideMenuBar: !0
  }), Wt.isPackaged ? (om.handle("app", (o) => {
    console.log(o);
    const d = new URL(o.url), p = Ie.join(import.meta.dirname, "../../", d.pathname);
    return T0(p) ? bu.fetch(`file://${p}`) : bu.fetch(`file://${Ie.join(import.meta.dirname, "../../index.html")}`);
  }), console.log("App started."), Xe.loadURL("app://./").then(() => {
    console.log("first page loaded");
  })) : Xe.loadURL("http://localhost:1420");
};
let Gt, kl, Nl, Il, Dl;
function Be() {
  return Gt || (Gt = Ie.join(Wt.getPath("userData")), kl = Ie.join(Gt, "charts"), Nl = Ie.join(Gt, "trash"), Il = Ie.join(Gt, "respack"), Dl = Ie.join(Gt, "downloads")), { APP_DATA_DIR: Gt, CHART_DIR: kl, TRASH_DIR: Nl, RESPACK_DIR: Il, DOWNLOAD_DIR: Dl };
}
async function Pt(o) {
  try {
    await xe.access(o);
  } catch {
    await xe.mkdir(o, { recursive: !0 });
  }
}
async function Yt(o) {
  try {
    return await xe.access(o), !0;
  } catch {
    return !1;
  }
}
async function lu(o) {
  return (await xe.readdir(o, { withFileTypes: !0 })).map((p) => ({ name: p.name, isDirectory: p.isDirectory() }));
}
Ue.handle("fs:queryMeta", async () => {
  const { APP_DATA_DIR: o, CHART_DIR: d, TRASH_DIR: p, RESPACK_DIR: c, DOWNLOAD_DIR: h } = Be();
  return { APP_DATA_DIR: o, CHART_DIR: d, TRASH_DIR: p, RESPACK_DIR: c, DOWNLOAD_DIR: h };
});
Ue.handle("fs:queryCharts", async () => {
  var c;
  const { CHART_DIR: o } = Be(), d = await lu(o), p = [];
  for (const h of d)
    if (h.isDirectory)
      try {
        const u = JSON.parse(await xe.readFile(Ie.join(o, h.name, "metadata.json"), "utf-8")), n = await uu(h.name);
        p.push({
          chartPath: u.chart,
          identifier: h.name,
          title: u.title,
          illustration: u.illustration,
          // 返回文件名，由前端加载
          type: u.type,
          lastModified: ((c = n == null ? void 0 : n[n.length - 1]) == null ? void 0 : c.time) ?? 0
        });
      } catch (u) {
        console.error(`Failed to read chart ${h.name}:`, u);
      }
  return p.sort((h, u) => u.lastModified - h.lastModified), p;
});
Ue.handle("fs:queryChartMeta", async (o, d) => {
  const { CHART_DIR: p } = Be(), c = Ie.join(p, d, "metadata.json");
  return JSON.parse(await xe.readFile(c, "utf-8"));
});
async function uu(o) {
  const { CHART_DIR: d } = Be(), p = Ie.join(d, o, "history.json");
  if (!await Yt(p)) return null;
  try {
    const c = JSON.parse(await xe.readFile(p, "utf-8"));
    return Array.isArray(c) ? c : null;
  } catch {
    return null;
  }
}
Ue.handle("fs:queryChartHistory", async (o, d) => uu(d));
Ue.handle("fs:saveChartMeta", async (o, d, p) => {
  const { CHART_DIR: c } = Be(), h = Ie.join(c, d, "metadata.json");
  await xe.writeFile(h, JSON.stringify(p, null, 2), "utf-8");
});
Ue.handle("fs:saveChart", async (o, d, p, c, h = !1) => {
  const { CHART_DIR: u } = Be(), n = JSON.parse(await xe.readFile(Ie.join(u, d, "metadata.json"), "utf-8")), l = h ? JSON.stringify(p, null, 2) : JSON.stringify(p), i = /* @__PURE__ */ new Date(), r = `chart.${i.toISOString().replace(/:/g, "-").replace(/\./g, "_").replace(/T/g, " ").replace(/Z/g, "")}.kpa2.json`;
  n.chart = r, n.type !== "KPA2" && (n.type = "KPA2");
  const e = Ie.join(u, d, "history.json");
  let t = await uu(d) || [];
  t.push({
    summary: c,
    filename: r,
    time: i.getTime()
  }), await xe.writeFile(e, JSON.stringify(t, null, 2), "utf-8"), await xe.writeFile(Ie.join(u, d, "metadata.json"), JSON.stringify(n, null, 2), "utf-8"), await xe.writeFile(Ie.join(u, d, r), l, "utf-8");
});
Ue.handle("fs:getChartData", async (o, d) => {
  const { CHART_DIR: p } = Be(), c = JSON.parse(await xe.readFile(Ie.join(p, d, "metadata.json"), "utf-8"));
  return { chartData: JSON.parse(await xe.readFile(Ie.join(p, d, c.chart), "utf-8")), chartType: c.type, durationSecs: c.durationSecs };
});
Ue.handle("fs:getChartProjectData", async (o, d) => {
  const { CHART_DIR: p } = Be(), c = JSON.parse(await xe.readFile(Ie.join(p, d, "metadata.json"), "utf-8")), h = JSON.parse(await xe.readFile(Ie.join(p, d, c.chart), "utf-8")), u = await xe.readFile(Ie.join(p, d, c.music)), n = await xe.readFile(Ie.join(p, d, c.illustration));
  return {
    chartData: h,
    chartType: c.type,
    durationSecs: c.durationSecs,
    music: u,
    illustration: n
  };
});
Ue.handle("fs:readChart", async (o, d, p) => {
  const { CHART_DIR: c } = Be();
  return JSON.parse(await xe.readFile(Ie.join(c, d, p), "utf-8"));
});
Ue.handle("fs:readAFileInChart", async (o, d, p) => {
  const { CHART_DIR: c } = Be();
  return await xe.readFile(Ie.join(c, d, p));
});
Ue.handle("fs:loadChartImage", async (o, d, p) => {
  const { CHART_DIR: c } = Be(), h = Ie.join(c, d, p);
  return await xe.readFile(h);
});
Ue.handle("fs:saveAFileToChart", async (o, d, p, c) => {
  const { CHART_DIR: h } = Be();
  await xe.writeFile(Ie.join(h, d, p), new Uint8Array(c));
});
Ue.handle("fs:disposeChart", async (o, d) => {
  const { CHART_DIR: p, TRASH_DIR: c } = Be();
  await Pt(c), await xe.rename(Ie.join(p, d), Ie.join(c, d));
});
Ue.handle("fs:getTextures", async (o, d) => {
  const { CHART_DIR: p } = Be(), c = Ie.join(p, d, "textures");
  if (!await Yt(c)) return [];
  const u = (await lu(c)).filter((n) => !n.isDirectory).map((n) => n.name).filter((n) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(n));
  return u.includes("line.png") || u.push("line.png"), u;
});
Ue.handle("fs:uploadTexture", async (o, d, p, c) => {
  const { CHART_DIR: h } = Be(), u = Ie.join(h, d, "textures");
  await Pt(u), await xe.writeFile(Ie.join(u, p), new Uint8Array(c));
});
Ue.handle("fs:fetchTexture", async (o, d, p) => {
  const { CHART_DIR: c } = Be(), h = Ie.join(c, d, "textures");
  let u = Ie.join(h, p);
  return !await Yt(u) && (u = Ie.join(c, d, p), !await Yt(u)) ? null : await xe.readFile(u);
});
Ue.handle("fs:queryRespackList", async () => {
  const { RESPACK_DIR: o } = Be(), d = await lu(o), p = [];
  for (const c of d)
    if (c.isDirectory) {
      const h = Ie.join(o, c.name, "info.yml");
      if (await Yt(h))
        try {
          const u = ev.parse(await xe.readFile(h, "utf-8"));
          u.name && p.push({
            pathname: Ie.join(o, c.name),
            name: u.name,
            shortPathname: c.name
          });
        } catch (u) {
          console.error(u);
        }
    }
  return p;
});
Ue.handle("fs:getFileInRespack", async (o, d, p) => {
  const { RESPACK_DIR: c } = Be();
  if (d === "Default") return null;
  const h = Ie.join(c, d, p);
  return await Yt(h) ? await xe.readFile(h) : null;
});
Ue.handle("fs:uploadRespack", async (o, d, p) => {
  const { RESPACK_DIR: c } = Be(), h = Ie.join(c, d);
  if (await Yt(h)) throw new Error("Occupied.");
  const u = await xv.loadAsync(p);
  await xe.mkdir(h, { recursive: !0 });
  for (const [n, l] of Object.entries(u.files))
    if (!l.dir) {
      const i = Ie.join(h, n);
      await xe.mkdir(Ie.dirname(i), { recursive: !0 }), await xe.writeFile(i, await l.async("nodebuffer"));
    }
});
Ue.handle("fs:downloadFile", async (o, d, p, c = !1) => {
  const { DOWNLOAD_DIR: h } = Be();
  await Pt(h);
  const u = Ie.join(h, d);
  await xe.writeFile(u, p), c && lm.showItemInFolder(u);
});
Ue.handle("fs:checkChartDirExists", async (o, d) => {
  const { CHART_DIR: p } = Be();
  return await Yt(Ie.join(p, d));
});
Ue.handle("fs:createChartDir", async (o, d) => {
  const { CHART_DIR: p } = Be(), c = Ie.join(p, d);
  await Pt(c);
});
Ue.handle("fs:saveTextFile", async (o, d, p, c) => {
  const { CHART_DIR: h } = Be(), u = Ie.join(h, d, p);
  await xe.writeFile(u, c, "utf-8");
});
Ue.handle("fs:saveBinaryFile", async (o, d, p, c) => {
  const { CHART_DIR: h } = Be(), u = Ie.join(h, d, p);
  await xe.writeFile(u, new Uint8Array(c));
});
Ue.handle("fs:createNestedDir", async (o, d, p) => {
  const { CHART_DIR: c } = Be(), h = Ie.join(c, d, p);
  await Pt(h);
});
async function jg(o) {
  const { CHART_DIR: d } = Be(), p = Ie.join(d, o.id);
  await Pt(p);
  const c = {
    title: o.title,
    chart: `chart.${o.chartType === "RPE" ? "rpe" : "kpa"}.json`,
    music: `music.${o.musicExtension}`,
    illustration: `illustration.${o.illustrationExtension}`,
    type: o.chartType,
    durationSecs: o.durationSecs
  };
  if (await xe.writeFile(
    Ie.join(p, "metadata.json"),
    JSON.stringify(c, null, 4),
    "utf-8"
  ), await xe.writeFile(
    Ie.join(p, c.chart),
    o.chartContent,
    "utf-8"
  ), await xe.writeFile(
    Ie.join(p, c.music),
    new Uint8Array(o.musicData)
  ), await xe.writeFile(
    Ie.join(p, c.illustration),
    new Uint8Array(o.illustrationData)
  ), o.extraFiles)
    for (const h of o.extraFiles) {
      const u = Ie.join(p, h.name);
      await xe.mkdir(Ie.dirname(u), { recursive: !0 }), await xe.writeFile(u, new Uint8Array(h.data));
    }
  return o.id;
}
Ue.handle("fs:importChart", async (o, d) => jg(d));
Ue.handle("fs:saveChartProject", async (o, d) => jg(d));
Ue.handle("shell:openPath", async (o, d) => {
  lm.showItemInFolder(d);
});
Be();
Promise.all([
  Pt(Gt),
  Pt(kl),
  Pt(Nl),
  Pt(Il),
  Pt(Dl),
  Wt.whenReady()
]).then(() => {
  Bg();
});
Wt.on("window-all-closed", () => {
  process.platform !== "darwin" && Wt.quit();
});
Wt.on("activate", () => {
  um.getAllWindows().length === 0 && Bg();
});
Ot.autoUpdater.logger = console;
Ot.autoUpdater.autoDownload = !1;
Ot.autoUpdater.autoInstallOnAppQuit = !0;
let qi = !1, cu = !1, Hg = null;
Ot.autoUpdater.on("checking-for-update", () => {
  Xe == null || Xe.webContents.send("updater:checking");
});
Ot.autoUpdater.on("update-available", (o) => {
  qi = !0, Hg = o, Xe == null || Xe.webContents.send("updater:available", o);
});
Ot.autoUpdater.on("update-not-available", (o) => {
  qi = !1, Xe == null || Xe.webContents.send("updater:not-available", o);
});
Ot.autoUpdater.on("download-progress", (o) => {
  Xe == null || Xe.webContents.send("updater:progress", o);
});
Ot.autoUpdater.on("update-downloaded", (o) => {
  cu = !0, Xe == null || Xe.webContents.send("updater:downloaded", o);
});
Ot.autoUpdater.on("error", (o) => {
  Xe == null || Xe.webContents.send("updater:error", o.message);
});
Ue.handle("updater:check", async () => {
  if (!Wt.isPackaged)
    return { checking: !1, reason: "development" };
  try {
    const o = await Ot.autoUpdater.checkForUpdates();
    return { checking: !0, updateInfo: o == null ? void 0 : o.updateInfo };
  } catch (o) {
    return { checking: !1, error: o.message };
  }
});
Ue.handle("updater:download", async () => {
  if (!qi)
    return { success: !1, error: "No update available" };
  try {
    return await Ot.autoUpdater.downloadUpdate(), { success: !0 };
  } catch (o) {
    return { success: !1, error: o.message };
  }
});
Ue.handle("updater:install", () => cu ? (Ot.autoUpdater.quitAndInstall(!1, !0), { success: !0 }) : { success: !1, error: "Update not downloaded" });
Ue.handle("updater:status", () => ({
  updateAvailable: qi,
  updateDownloaded: cu,
  updateInfo: Hg
}));
