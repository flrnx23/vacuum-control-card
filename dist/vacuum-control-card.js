/*!
* This bundle includes Lit 3.3.3.
* Copyright (c) 2017 Google LLC. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice,
*    this list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the documentation
*    and/or other materials provided with the distribution.
* 3. Neither the name of the copyright holder nor the names of its contributors
*    may be used to endorse or promote products derived from this software
*    without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
* INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
* CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
* ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/
//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: ee, getPrototypeOf: te } = Object, p = globalThis, m = p.trustedTypes, h = m ? m.emptyScript : "", ne = p.reactiveElementPolyfillSupport, re = (e, t) => e, ie = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? h : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ae = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: ie,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), p.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(re("elementProperties"))) return;
		let e = te(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(re("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(re("properties"))) {
			let e = this.properties, t = [...f(e), ...ee(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ie : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ie : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[re("elementProperties")] = /* @__PURE__ */ new Map(), g[re("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: g }), (p.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, le = se.trustedTypes, ue = le ? le.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + _, pe = `<${fe}>`, v = document, y = () => v.createComment(""), b = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", ge = "[ 	\n\f\r]", x = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _e = /-->/g, ve = />/g, S = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ye = /'/g, be = /"/g, xe = /^(?:script|style|textarea|title)$/i, C = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), w = Symbol.for("lit-noChange"), T = Symbol.for("lit-nothing"), Se = /* @__PURE__ */ new WeakMap(), E = v.createTreeWalker(v, 129);
function Ce(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var we = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = x;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === x ? c[1] === "!--" ? o = _e : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = S) : (xe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = S) : o = ve : o === S ? c[0] === ">" ? (o = i ?? x, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? S : c[3] === "\"" ? be : ye) : o === be || o === ye ? o = S : o === _e || o === ve ? o = x : (o = S, i = void 0);
		let d = o === S && e[t + 1].startsWith("/>") ? " " : "";
		a += o === x ? n + pe : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + _ + d) : n + _ + (l === -2 ? t : d);
	}
	return [Ce(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Te = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = we(t, n);
		if (this.el = e.createElement(l, r), E.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = E.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(_), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ke : r[1] === "?" ? Ae : r[1] === "@" ? je : Oe
					}), i.removeAttribute(e);
				} else e.startsWith(_) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (xe.test(i.tagName)) {
					let e = i.textContent.split(_), t = e.length - 1;
					if (t > 0) {
						i.textContent = le ? le.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], y()), E.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], y());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === fe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(_, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += _.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = v.createElement("template");
		return n.innerHTML = e, n;
	}
};
function D(e, t, n = e, r) {
	if (t === w) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = b(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = D(e, i._$AS(e, t.values), i, r)), t;
}
var Ee = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? v).importNode(t, !0);
		E.currentNode = r;
		let i = E.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new De(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Me(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = E.nextNode(), a++);
		}
		return E.currentNode = v, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, De = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = D(this, e, t), b(e) ? e === T || e == null || e === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : e !== this._$AH && e !== w && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== T && b(this._$AH) ? this._$AA.nextSibling.data = e : this.T(v.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Te.createElement(Ce(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Ee(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Se.get(e.strings);
		return t === void 0 && Se.set(e.strings, t = new Te(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(y()), this.O(y()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Oe = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = T, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = T;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = D(this, e, t, 0), a = !b(e) || e !== this._$AH && e !== w, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = D(this, r[n + o], t, o), s === w && (s = this._$AH[o]), a ||= !b(s) || s !== this._$AH[o], s === T ? e = T : e !== T && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ke = class extends Oe {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === T ? void 0 : e;
	}
}, Ae = class extends Oe {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== T);
	}
}, je = class extends Oe {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = D(this, e, t, 0) ?? T) === w) return;
		let n = this._$AH, r = e === T && n !== T || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== T && (n === T || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Me = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		D(this, e);
	}
}, Ne = {
	M: de,
	P: _,
	A: fe,
	C: 1,
	L: we,
	R: Ee,
	D: he,
	V: D,
	I: De,
	H: Oe,
	N: Ae,
	U: je,
	B: ke,
	F: Me
}, Pe = se.litHtmlPolyfillSupport;
Pe?.(Te, De), (se.litHtmlVersions ??= []).push("3.3.3");
var Fe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new De(t.insertBefore(y(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ie = globalThis, O = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Fe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return w;
	}
};
O._$litElement$ = !0, O.finalized = !0, Ie.litElementHydrateSupport?.({ LitElement: O });
var Le = Ie.litElementPolyfillSupport;
Le?.({ LitElement: O }), (Ie.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/editor.ts
var Re = [
	"combined",
	"robot",
	"dock"
], ze = [
	"auto",
	"compact",
	"comfortable",
	"detailed"
], Be = ["adaptive", "accent"], Ve = [
	"expanded",
	"collapsed",
	"hidden"
], He = [
	"unknown",
	"ok",
	"warning",
	"active",
	"installed",
	"missing"
], Ue = [
	"vacuum",
	"mop",
	"combo",
	"unknown"
], We = [
	"battery",
	"progress",
	"area",
	"duration"
], Ge = [
	"activity",
	"controls",
	"programs",
	"alerts",
	"dock",
	"details",
	"maintenance",
	"map",
	"diagnostics"
], Ke = [
	"activity",
	"controls",
	"programs",
	"alerts",
	"dock"
], qe = [
	"activity",
	"controls",
	"programs",
	"alerts"
], Je = [
	"alerts",
	"dock",
	"maintenance",
	"diagnostics"
], Ye = [
	"activity",
	"controls",
	"programs",
	"alerts",
	"dock",
	"details",
	"maintenance",
	"map",
	"diagnostics"
], Xe = [
	{
		key: "status",
		domains: ["sensor"]
	},
	{
		key: "battery",
		domains: ["sensor"]
	},
	{
		key: "charging",
		domains: ["binary_sensor"]
	},
	{
		key: "cleaning",
		domains: ["binary_sensor"]
	},
	{
		key: "progress",
		domains: ["sensor"]
	},
	{
		key: "area",
		domains: ["sensor"]
	},
	{
		key: "duration",
		domains: ["sensor"]
	},
	{
		key: "last_start",
		domains: ["sensor"]
	},
	{
		key: "last_end",
		domains: ["sensor"]
	},
	{
		key: "map",
		domains: ["image", "camera"]
	},
	{
		key: "vacuum_mode",
		domains: ["select"]
	},
	{
		key: "mop_mode",
		domains: ["select"]
	},
	{
		key: "mop_intensity",
		domains: ["select"]
	},
	{
		key: "volume",
		domains: ["number"]
	},
	{
		key: "mop_attached",
		domains: ["binary_sensor"]
	},
	{
		key: "water_tank_attached",
		domains: ["binary_sensor"]
	},
	{
		key: "water_shortage",
		domains: ["binary_sensor"]
	},
	{
		key: "vacuum_error",
		domains: ["sensor"]
	}
], Ze = {
	de: {
		title: "Vacuum Control Card",
		basic: "Basis",
		basicHint: "Roboter, Kartenansicht und Informationsdichte festlegen.",
		robot: "Saugroboter",
		name: "Name (optional)",
		view: "Ansicht",
		density: "Dichte",
		appearance: "Design",
		entities: "Entitäten",
		entitiesHint: "Optionale Quellen für Status, Fortschritt, Wischen und Karte.",
		programs: "Programme",
		programsHint: "Reinigungsprogramme und Routinen werden als Button-Entitäten hinzugefügt. Vor jedem Start fragt die Karte immer nach einer Bestätigung.",
		noPrograms: "Noch keine Programme ausgewählt.",
		chooseButton: "Button-Entität auswählen",
		add: "Hinzufügen",
		remove: "Entfernen",
		program: "Programm",
		programName: "Anzeigename (optional)",
		kind: "Reinigungsart",
		confirmation: "Start immer bestätigen",
		duplicateProgram: "Dieses Programm wurde bereits hinzugefügt.",
		missingRobot: "Bitte eine vacuum-Entität auswählen.",
		unknownValue: "Unbekannter Wert",
		viewCombined: "Roboter und Station",
		viewRobot: "Nur Roboter",
		viewDock: "Nur Station",
		densityAuto: "Automatisch",
		densityCompact: "Kompakt",
		densityComfortable: "Komfortabel",
		densityDetailed: "Detailliert",
		appearanceAdaptive: "An Dashboard/Theme angepasst (empfohlen)",
		appearanceAccent: "Akzentreich",
		quickInfo: "Schnellinformationen",
		quickInfoHint: "Wähle die kompakten Werte unter dem Status. Name und Status bleiben immer sichtbar.",
		visibleSections: "Sichtbare Bereiche",
		visibleSectionsHint: "Wähle, welche Bereiche die Karte anzeigen soll.",
		alertsOptional: "Hinweise sind optional. Kritische Roboterfehler bleiben weiterhin im Hauptstatus erkennbar.",
		sectionActivity: "Aktivität",
		sectionControls: "Steuerung",
		sectionPrograms: "Programme",
		sectionAlerts: "Hinweise",
		sectionDock: "Station",
		sectionDetails: "Robotereinstellungen",
		sectionMaintenance: "Wartung",
		sectionMap: "Karte",
		sectionDiagnostics: "Technische Diagnose",
		kindVacuum: "Saugen",
		kindMop: "Wischen",
		kindCombo: "Saugen und Wischen",
		kindUnknown: "Nicht festgelegt",
		status: "Status",
		battery: "Batterie",
		charging: "Ladestatus",
		cleaning: "Reinigt",
		progress: "Reinigungsfortschritt",
		area: "Reinigungsfläche",
		duration: "Reinigungszeit",
		last_start: "Letzter Reinigungsbeginn",
		last_end: "Letztes Reinigungsende",
		map: "Karte",
		vacuum_mode: "Saugmodus",
		mop_mode: "Wischmodus",
		mop_intensity: "Wischintensität",
		volume: "Lautstärke",
		mop_attached: "Mopp angebracht",
		water_tank_attached: "Wassertank angebracht",
		water_shortage: "Wasserknappheit",
		vacuum_error: "Staubsaugerfehler",
		dock: "Station",
		dockHint: "Darstellung, Aktivitäten, Füllstände und Einstellungen der Reinigungsstation festlegen.",
		dockDisplay: "Darstellung",
		displayExpanded: "Ausgeklappt",
		displayCollapsed: "Eingeklappt",
		displayHidden: "Ausgeblendet",
		dockError: "Stationsfehler",
		mopDrying: "Mopp-Trocknung",
		dryingRemaining: "Verbleibende Trocknungszeit",
		emptyingMode: "Entleerungsmodus",
		childLock: "Kindersicherung",
		cleanWaterTank: "Frischwassertank",
		dirtyWaterTank: "Schmutzwassertank",
		cleaningSolution: "Reinigungsflüssigkeit",
		onMeaning: "Bedeutung des Zustands „on“",
		onUnknown: "Unbekannt / neutral",
		onOk: "In Ordnung",
		onWarning: "Warnung",
		onActive: "Aktiv",
		onInstalled: "Vorhanden / eingesetzt",
		onMissing: "Fehlt"
	},
	en: {
		title: "Vacuum Control Card",
		basic: "Basics",
		basicHint: "Choose the robot, card view, and information density.",
		robot: "Vacuum robot",
		name: "Name (optional)",
		view: "View",
		density: "Density",
		appearance: "Design",
		entities: "Entities",
		entitiesHint: "Optional sources for status, progress, mopping, and the map.",
		programs: "Programs",
		programsHint: "Cleaning programs and routines are added as button entities. The card always asks for confirmation before starting one.",
		noPrograms: "No programs selected yet.",
		chooseButton: "Choose button entity",
		add: "Add",
		remove: "Remove",
		program: "Program",
		programName: "Display name (optional)",
		kind: "Cleaning type",
		confirmation: "Always confirm start",
		duplicateProgram: "This program has already been added.",
		missingRobot: "Please select a vacuum entity.",
		unknownValue: "Unknown value",
		viewCombined: "Robot and dock",
		viewRobot: "Robot only",
		viewDock: "Dock only",
		densityAuto: "Automatic",
		densityCompact: "Compact",
		densityComfortable: "Comfortable",
		densityDetailed: "Detailed",
		appearanceAdaptive: "Match dashboard/theme (recommended)",
		appearanceAccent: "Accent-rich",
		quickInfo: "Quick information",
		quickInfoHint: "Choose the compact values shown below the status. Name and status always remain visible.",
		visibleSections: "Visible sections",
		visibleSectionsHint: "Choose which sections the card should display.",
		alertsOptional: "Notices are optional. Critical robot errors remain visible in the main status.",
		sectionActivity: "Activity",
		sectionControls: "Controls",
		sectionPrograms: "Programs",
		sectionAlerts: "Notices",
		sectionDock: "Dock",
		sectionDetails: "Robot settings",
		sectionMaintenance: "Maintenance",
		sectionMap: "Map",
		sectionDiagnostics: "Technical diagnostics",
		kindVacuum: "Vacuum",
		kindMop: "Mop",
		kindCombo: "Vacuum and mop",
		kindUnknown: "Not specified",
		status: "Status",
		battery: "Battery",
		charging: "Charging state",
		cleaning: "Cleaning",
		progress: "Cleaning progress",
		area: "Cleaned area",
		duration: "Cleaning duration",
		last_start: "Last cleaning start",
		last_end: "Last cleaning end",
		map: "Map",
		vacuum_mode: "Vacuum mode",
		mop_mode: "Mop mode",
		mop_intensity: "Mop intensity",
		volume: "Volume",
		mop_attached: "Mop attached",
		water_tank_attached: "Water tank attached",
		water_shortage: "Water shortage",
		vacuum_error: "Vacuum error",
		dock: "Dock",
		dockHint: "Configure the cleaning dock's display, activities, levels, and settings.",
		dockDisplay: "Display",
		displayExpanded: "Expanded",
		displayCollapsed: "Collapsed",
		displayHidden: "Hidden",
		dockError: "Dock error",
		mopDrying: "Mop drying",
		dryingRemaining: "Drying time remaining",
		emptyingMode: "Emptying mode",
		childLock: "Child lock",
		cleanWaterTank: "Clean-water tank",
		dirtyWaterTank: "Dirty-water tank",
		cleaningSolution: "Cleaning solution",
		onMeaning: "Meaning of the “on” state",
		onUnknown: "Unknown / neutral",
		onOk: "OK",
		onWarning: "Warning",
		onActive: "Active",
		onInstalled: "Present / installed",
		onMissing: "Missing"
	}
};
function k(e) {
	if (Array.isArray(e)) return e.map((e) => k(e));
	if (typeof e == "object" && e) {
		let t = {};
		for (let [n, r] of Object.entries(e)) t[n] = k(r);
		return t;
	}
	return e;
}
function Qe(e) {
	let t = k(e);
	if (!t.programs) return t;
	let n = (t.programs.items ?? []).map((e) => ({
		...e,
		guard: "confirm"
	}));
	return {
		...t,
		programs: {
			...t.programs,
			guard: "confirm",
			items: n
		}
	};
}
function A(e) {
	if (e instanceof CustomEvent) {
		let t = e.detail;
		if (typeof t?.value == "string") return t.value;
	}
	let t = e.currentTarget;
	return typeof t?.value == "string" ? t.value : "";
}
var $e = class extends O {
	constructor(...e) {
		super(...e), this._newProgramEntity = "", this._programMessage = "", this._addProgram = () => {
			let e = this._config, t = this._newProgramEntity;
			if (!e || !t) return;
			if ((e.programs?.items ?? []).some((e) => e.entity === t)) {
				this._programMessage = Ze[this._language].duplicateProgram;
				return;
			}
			let n = {
				entity: t,
				guard: "confirm",
				kind: "unknown"
			}, r = this.hass?.states[t]?.attributes.friendly_name;
			r && (n.name = r);
			let i = k(e);
			i.programs = {
				...i.programs ?? {},
				guard: "confirm",
				items: [...i.programs?.items ?? [], n]
			}, this._newProgramEntity = "", this._programMessage = "", this._commit(i);
		};
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_newProgramEntity: { state: !0 },
			_programMessage: { state: !0 }
		};
	}
	static {
		this.styles = o`
    :host {
      display: block;
      color: var(--primary-text-color);
      --editor-accent: var(--primary-color, #4f8f83);
    }
    * { box-sizing: border-box; }
    .editor { display: grid; gap: 16px; }
    h2, h3, p { margin: 0; }
    h2 { font-size: 1.2rem; font-weight: 650; letter-spacing: -0.01em; }
    h3 { font-size: 1rem; font-weight: 650; }
    .section {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.24));
      border-radius: 14px;
      background: var(--card-background-color, var(--ha-card-background, transparent));
    }
    .section-heading { display: grid; gap: 4px; }
    .hint, .empty, .source-note {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      line-height: 1.4;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }
    .field { display: grid; gap: 6px; min-width: 0; }
    .field.full { grid-column: 1 / -1; }
    label {
      color: var(--secondary-text-color);
      font-size: 0.79rem;
      font-weight: 600;
    }
    input:not([type="checkbox"]), select {
      width: 100%;
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid var(--outline-color, var(--divider-color, #9a9a9a));
      border-radius: 10px;
      outline: none;
      background: var(--card-background-color, var(--ha-card-background, transparent));
      color: var(--primary-text-color);
      font: inherit;
    }
    input:not([type="checkbox"]):focus, select:focus {
      border-color: var(--editor-accent);
      box-shadow: 0 0 0 1px var(--editor-accent);
    }
    fieldset {
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    legend {
      margin-bottom: 8px;
      color: var(--primary-text-color);
      font-size: 0.9rem;
      font-weight: 650;
    }
    .choice-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .checkbox-option {
      display: flex;
      min-height: 44px;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.24));
      border-radius: 10px;
      color: var(--primary-text-color);
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
    }
    .checkbox-option:hover {
      background: color-mix(in srgb, var(--secondary-background-color, #f1f1f1) 58%, transparent);
    }
    .checkbox-option:focus-within {
      border-color: var(--editor-accent);
      box-shadow: 0 0 0 1px var(--editor-accent);
    }
    .checkbox-option input {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
      margin: 0;
      accent-color: var(--editor-accent);
      cursor: pointer;
    }
    .safety-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--warning-color, #ad6700) 10%, transparent);
      color: var(--secondary-text-color);
      font-size: 0.84rem;
      line-height: 1.4;
    }
    .safety-note::before {
      content: "⚠";
      color: var(--warning-color, #ad6700);
      font-weight: 700;
    }
    ha-entity-picker { display: block; width: 100%; }
    .program-list { display: grid; gap: 10px; }
    .program {
      display: grid;
      gap: 12px;
      padding: 13px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--secondary-background-color, #f1f1f1) 72%, transparent);
    }
    .program-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .program-title {
      min-width: 0;
      font-size: 0.9rem;
      font-weight: 650;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .safe {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--success-color, #2e7d62);
      font-size: 0.78rem;
      font-weight: 600;
    }
    .safe::before {
      content: "✓";
      display: inline-grid;
      width: 18px;
      height: 18px;
      place-items: center;
      border-radius: 50%;
      background: color-mix(in srgb, currentColor 14%, transparent);
    }
    .add-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 10px;
    }
    button {
      min-height: 40px;
      padding: 0 14px;
      border: 0;
      border-radius: 10px;
      background: var(--editor-accent);
      color: var(--text-primary-color, white);
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }
    button.secondary {
      min-height: 34px;
      padding: 0 10px;
      background: transparent;
      color: var(--error-color, #c62828);
    }
    button:hover:not(:disabled) { filter: brightness(1.05); }
    button:focus-visible { outline: 2px solid var(--editor-accent); outline-offset: 2px; }
    button:disabled { cursor: default; opacity: 0.45; }
    .warning { color: var(--warning-color, #ad6700); font-size: 0.84rem; }
    @media (max-width: 600px) {
      .add-row, .choice-grid { grid-template-columns: 1fr; }
    }
  `;
	}
	setConfig(e) {
		this._config = Qe(e), this._newProgramEntity = "", this._programMessage = "";
	}
	render() {
		let e = this._config;
		if (!e) return C``;
		let t = Ze[this._language], n = e.programs?.items ?? [], r = new Set(this._effectiveOverviewItems(e)), i = new Set(this._effectiveSectionOrder(e)), a = e.view ?? "combined", o = this._sectionsForView(a), s = this._entityFieldsForContext(a, i), c = a !== "dock", l = a !== "robot" && i.has("dock"), u = a !== "dock" && i.has("programs"), d = {
			activity: t.sectionActivity,
			controls: t.sectionControls,
			programs: t.sectionPrograms,
			alerts: t.sectionAlerts,
			dock: t.sectionDock,
			details: t.sectionDetails,
			maintenance: t.sectionMaintenance,
			map: t.sectionMap,
			diagnostics: t.sectionDiagnostics
		};
		return C`
      <div class="editor">
        <h2>${t.title}</h2>
        <section class="section" aria-labelledby="basic-heading">
          <div class="section-heading">
            <h3 id="basic-heading">${t.basic}</h3>
            <p class="hint">${t.basicHint}</p>
          </div>
          <div class="grid">
            <div class="field full">
              ${this._entityPicker(e.entity ?? "", ["vacuum"], t.robot, (e) => this._updateTopLevel("entity", e))}
              ${e.entity ? T : C`<span class="warning">${t.missingRobot}</span>`}
            </div>
            <div class="field full">
              <label for="card-name">${t.name}</label>
              <input id="card-name" type="text" .value=${e.name ?? ""}
                @input=${(e) => this._updateTopLevel("name", A(e))} />
            </div>
            <div class="field">
              <label for="card-view">${t.view}</label>
              <select id="card-view" .value=${e.view ?? "combined"}
                @change=${(e) => this._updateTopLevel("view", A(e))}>
                ${this._unknownOption(e.view, Re)}
                <option value="combined">${t.viewCombined}</option>
                <option value="robot">${t.viewRobot}</option>
                <option value="dock">${t.viewDock}</option>
              </select>
            </div>
            <div class="field">
              <label for="card-density">${t.density}</label>
              <select id="card-density" .value=${e.density ?? "auto"}
                @change=${(e) => this._updateTopLevel("density", A(e))}>
                ${this._unknownOption(e.density, ze)}
                <option value="auto">${t.densityAuto}</option>
                <option value="compact">${t.densityCompact}</option>
                <option value="comfortable">${t.densityComfortable}</option>
                <option value="detailed">${t.densityDetailed}</option>
              </select>
            </div>
            <div class="field">
              <label for="card-appearance">${t.appearance}</label>
              <select id="card-appearance"
                @change=${(e) => this._updateTopLevel("appearance", A(e))}>
                ${this._unknownOption(e.appearance, Be)}
                <option value="adaptive" .selected=${e.appearance === void 0 || e.appearance === "adaptive"}>
                  ${t.appearanceAdaptive}
                </option>
                <option value="accent" .selected=${e.appearance === "accent"}>
                  ${t.appearanceAccent}
                </option>
              </select>
            </div>
          </div>
        </section>

        ${c ? C`<section class="section" aria-labelledby="quick-info-heading">
          <div class="section-heading">
            <h3 id="quick-info-heading">${t.quickInfo}</h3>
            <p class="hint" id="quick-info-hint">${t.quickInfoHint}</p>
          </div>
          <fieldset aria-labelledby="quick-info-heading" aria-describedby="quick-info-hint">
            <div class="choice-grid">
              ${We.map((e) => C`
                <label class="checkbox-option" for="overview-${e}">
                  <input
                    id="overview-${e}"
                    type="checkbox"
                    .checked=${r.has(e)}
                    @change=${(t) => this._updateOverviewItem(e, t.currentTarget.checked)}
                  />
                  <span>${t[e]}</span>
                </label>
              `)}
            </div>
          </fieldset>
        </section>` : T}

        <section class="section" aria-labelledby="visible-sections-heading">
          <div class="section-heading">
            <h3 id="visible-sections-heading">${t.visibleSections}</h3>
            <p class="hint" id="visible-sections-hint">${t.visibleSectionsHint}</p>
          </div>
          <fieldset
            aria-labelledby="visible-sections-heading"
            aria-describedby="visible-sections-hint alerts-optional-note"
          >
            <div class="choice-grid">
              ${o.map((e) => C`
                <label class="checkbox-option" for="section-${e}">
                  <input
                    id="section-${e}"
                    type="checkbox"
                    .checked=${i.has(e)}
                    @change=${(t) => this._updateSection(e, t.currentTarget.checked)}
                  />
                  <span>${d[e]}</span>
                </label>
              `)}
            </div>
          </fieldset>
          <p class="safety-note" id="alerts-optional-note">${t.alertsOptional}</p>
        </section>

        ${s.length > 0 ? C`<section class="section" aria-labelledby="entities-heading">
          <div class="section-heading">
            <h3 id="entities-heading">${t.entities}</h3>
            <p class="hint">${t.entitiesHint}</p>
          </div>
          <div class="grid">
            ${s.map((n) => C`
              <div class="field">
                ${this._entityPicker(e.entities?.[n.key] ?? "", n.domains, t[n.key], (e) => this._updateSemanticEntity(n.key, e))}
              </div>
            `)}
          </div>
        </section>` : T}

        ${l ? C`<section class="section" aria-labelledby="dock-heading">
          <div class="section-heading">
            <h3 id="dock-heading">${t.dock}</h3>
            <p class="hint">${t.dockHint}</p>
          </div>
          <div class="grid">
            <div class="field full">
              <label for="dock-display">${t.dockDisplay}</label>
              <select id="dock-display" .value=${e.dock?.display ?? "collapsed"}
                @change=${(e) => this._updateDockDisplay(A(e))}>
                ${this._unknownOption(e.dock?.display, Ve)}
                <option value="expanded">${t.displayExpanded}</option>
                <option value="collapsed">${t.displayCollapsed}</option>
                <option value="hidden">${t.displayHidden}</option>
              </select>
            </div>
            <div class="field">
              ${this._entityPicker(e.dock?.entities?.error ?? "", ["sensor"], t.dockError, (e) => this._updateSimpleDockEntity("error", e))}
            </div>
            <div class="field">
              ${this._entityPicker(e.dock?.entities?.mop_drying ?? "", ["binary_sensor"], t.mopDrying, (e) => this._updateSimpleDockEntity("mop_drying", e))}
            </div>
            <div class="field">
              ${this._entityPicker(e.dock?.entities?.drying_remaining ?? "", ["sensor"], t.dryingRemaining, (e) => this._updateSimpleDockEntity("drying_remaining", e))}
            </div>
            <div class="field">
              ${this._entityPicker(e.dock?.entities?.emptying_mode ?? "", ["select"], t.emptyingMode, (e) => this._updateSimpleDockEntity("emptying_mode", e))}
            </div>
            <div class="field">
              ${this._entityPicker(e.dock?.entities?.child_lock ?? "", ["switch"], t.childLock, (e) => this._updateSimpleDockEntity("child_lock", e))}
            </div>
            ${this._renderBinaryDockField("clean_water_tank", e.dock?.entities?.clean_water_tank, t.cleanWaterTank)}
            ${this._renderBinaryDockField("dirty_water_tank", e.dock?.entities?.dirty_water_tank, t.dirtyWaterTank)}
            ${this._renderBinaryDockField("cleaning_solution", e.dock?.entities?.cleaning_solution, t.cleaningSolution)}
          </div>
        </section>` : T}

        ${u ? C`<section class="section" aria-labelledby="programs-heading">
          <div class="section-heading">
            <h3 id="programs-heading">${t.programs}</h3>
            <p class="hint">${t.programsHint}</p>
          </div>
          <div class="safe">${t.confirmation}</div>
          ${n.length === 0 ? C`<p class="empty">${t.noPrograms}</p>` : C`<div class="program-list">
                ${n.map((e, t) => this._renderProgram(e, t))}
              </div>`}
          <div class="add-row">
            <div class="field">
              ${this._entityPicker(this._newProgramEntity, ["button"], t.chooseButton, (e) => {
			this._newProgramEntity = e, this._programMessage = "";
		})}
            </div>
            <button type="button" ?disabled=${!this._newProgramEntity} @click=${this._addProgram}>
              ${t.add}
            </button>
          </div>
          ${this._programMessage ? C`<p class="warning" role="status">${this._programMessage}</p>` : T}
        </section>` : T}
      </div>
    `;
	}
	get _language() {
		return (this.hass?.locale?.language ?? this.hass?.language ?? globalThis.navigator?.language ?? "en").toLowerCase().startsWith("de") ? "de" : "en";
	}
	_entityPicker(e, t, n, r) {
		return C`<ha-entity-picker
      .hass=${this.hass}
      .value=${e}
      .label=${n}
      .includeDomains=${t}
      .allowCustomEntity=${!0}
      @value-changed=${(e) => r(A(e))}
    ></ha-entity-picker>`;
	}
	_unknownOption(e, t) {
		return !e || t.includes(e) ? T : C`<option value=${e} .selected=${!0}>
      ${Ze[this._language].unknownValue}: ${e}
    </option>`;
	}
	_renderProgram(e, t) {
		let n = Ze[this._language], r = e.name || (e.entity ? this.hass?.states[e.entity]?.attributes.friendly_name : void 0) || e.entity || `${n.program} ${t + 1}`, i = e.kind;
		return C`<article class="program">
      <div class="program-head">
        <span class="program-title" title=${r}>${r}</span>
        <button class="secondary" type="button" aria-label="${n.remove}: ${r}"
          @click=${() => this._removeProgram(t)}>${n.remove}</button>
      </div>
      <div class="grid">
        <div class="field full">
          ${e.action && !e.entity ? C`<span class="source-note">Home Assistant action</span>` : this._entityPicker(e.entity ?? "", ["button"], n.chooseButton, (e) => this._updateProgramEntity(t, e))}
        </div>
        <div class="field">
          <label for="program-name-${t}">${n.programName}</label>
          <input id="program-name-${t}" type="text" .value=${e.name ?? ""}
            @input=${(e) => this._updateProgramName(t, A(e))} />
        </div>
        <div class="field">
          <label for="program-kind-${t}">${n.kind}</label>
          <select id="program-kind-${t}" .value=${i ?? "unknown"}
            @change=${(e) => this._updateProgram(t, { kind: A(e) })}>
            ${this._unknownOption(i, Ue)}
            <option value="vacuum">${n.kindVacuum}</option>
            <option value="mop">${n.kindMop}</option>
            <option value="combo">${n.kindCombo}</option>
            <option value="unknown">${n.kindUnknown}</option>
          </select>
        </div>
      </div>
    </article>`;
	}
	_renderBinaryDockField(e, t, n) {
		let r = Ze[this._language], i = typeof t == "string" ? t : t?.entity ?? "", a = typeof t == "object" ? t.on_is : void 0, o = a ?? "unknown";
		return C`<div class="field">
      ${this._entityPicker(i, ["binary_sensor"], n, (t) => this._updateBinaryDockEntity(e, t))}
      <label for="dock-${e}-on-is">${r.onMeaning}</label>
      <select id="dock-${e}-on-is" .value=${o} ?disabled=${!i}
        @change=${(t) => this._updateBinaryDockMeaning(e, A(t))}>
        ${this._unknownOption(a, He)}
        <option value="unknown">${r.onUnknown}</option>
        <option value="ok">${r.onOk}</option>
        <option value="warning">${r.onWarning}</option>
        <option value="active">${r.onActive}</option>
        <option value="installed">${r.onInstalled}</option>
        <option value="missing">${r.onMissing}</option>
      </select>
    </div>`;
	}
	_effectiveOverviewItems(e) {
		return e.overview?.items === void 0 ? e.density === "compact" ? ["battery"] : ["battery", "progress"] : e.overview.items;
	}
	_defaultSectionOrder(e, t) {
		return e === "dock" ? Je : e === "robot" || t === "compact" ? qe : Ke;
	}
	_effectiveSectionOrder(e) {
		return e.sections?.order === void 0 ? this._defaultSectionOrder(e.view ?? "combined", e.density) : e.sections.order;
	}
	_sectionsForView(e) {
		return e === "dock" ? [
			"alerts",
			"dock",
			"maintenance",
			"diagnostics"
		] : e === "robot" ? [
			"activity",
			"controls",
			"programs",
			"alerts",
			"details",
			"maintenance",
			"map",
			"diagnostics"
		] : Ge;
	}
	_entityFieldsForContext(e, t) {
		if (e === "dock") return [];
		let n = /* @__PURE__ */ new Set([
			"status",
			"battery",
			"charging",
			"cleaning"
		]);
		if (t.has("activity")) for (let e of [
			"progress",
			"area",
			"duration"
		]) n.add(e);
		if (t.has("details")) for (let e of [
			"last_start",
			"last_end",
			"vacuum_mode",
			"mop_mode",
			"mop_intensity",
			"volume"
		]) n.add(e);
		return t.has("map") && n.add("map"), t.has("alerts") && (n.add("water_shortage"), n.add("vacuum_error")), t.has("programs") && (n.add("mop_attached"), n.add("water_tank_attached")), Xe.filter((e) => n.has(e.key));
	}
	_updateOverviewItem(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = this._effectiveOverviewItems(n), a = new Set(i);
		t ? a.add(e) : a.delete(e);
		let o = We.filter((e) => a.has(e)), s = i.filter((e, t) => !We.includes(e) && i.indexOf(e) === t);
		r.overview = {
			...r.overview ?? {},
			items: [...o, ...s]
		}, this._commit(r);
	}
	_updateSection(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = this._effectiveSectionOrder(n), a = new Set(i);
		t ? a.add(e) : a.delete(e);
		let o = Ye.filter((e) => a.has(e)), s = i.filter((e, t) => !Ye.includes(e) && i.indexOf(e) === t);
		r.sections = {
			...r.sections ?? {},
			order: [...o, ...s]
		}, this._commit(r);
	}
	_updateTopLevel(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n);
		if (e === "name") t ? r.name = t : delete r.name;
		else if (e === "entity") r.entity = t;
		else if (e === "view") {
			let e = t;
			r.view = e, r.sections = {
				...r.sections ?? {},
				order: [...this._defaultSectionOrder(e, r.density)]
			};
		} else e === "density" ? r.density = t : r.appearance = t;
		this._commit(r);
	}
	_updateSemanticEntity(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = { ...r.entities ?? {} };
		t ? i[e] = t : delete i[e], Object.keys(i).length > 0 ? r.entities = i : delete r.entities, this._commit(r);
	}
	_updateDockDisplay(e) {
		let t = this._config;
		if (!t) return;
		let n = k(t);
		n.dock = {
			...n.dock ?? {},
			display: e
		}, this._commit(n);
	}
	_updateSimpleDockEntity(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = { ...r.dock ?? {} }, a = { ...i.entities ?? {} };
		t ? a[e] = t : delete a[e], this._replaceDockEntities(r, i, a);
	}
	_updateBinaryDockEntity(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = { ...r.dock ?? {} }, a = { ...i.entities ?? {} }, o = a[e];
		if (t) {
			let n = typeof o == "object" && o ? o : void 0;
			a[e] = {
				...n ?? {},
				entity: t,
				on_is: n?.on_is ?? "unknown"
			};
		} else delete a[e];
		this._replaceDockEntities(r, i, a);
	}
	_updateBinaryDockMeaning(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = { ...r.dock ?? {} }, a = { ...i.entities ?? {} }, o = a[e], s = typeof o == "string" ? o : typeof o == "object" && o ? o.entity : void 0;
		s && (a[e] = {
			...typeof o == "object" && o ? o : {},
			entity: s,
			on_is: t
		}, this._replaceDockEntities(r, i, a));
	}
	_replaceDockEntities(e, t, n) {
		Object.keys(n).length > 0 ? t.entities = n : delete t.entities, e.dock = t, this._commit(e);
	}
	_removeProgram(e) {
		let t = this._config;
		if (!t?.programs) return;
		let n = k(t), r = [...n.programs?.items ?? []];
		r.splice(e, 1), n.programs = {
			...n.programs,
			guard: "confirm",
			items: r
		}, this._commit(n);
	}
	_updateProgram(e, t) {
		let n = this._config, r = n?.programs?.items?.[e];
		if (!n || !r) return;
		let i = k(n), a = [...i.programs?.items ?? []];
		a[e] = {
			...a[e],
			...t,
			guard: "confirm"
		}, i.programs = {
			...i.programs ?? {},
			guard: "confirm",
			items: a
		}, this._commit(i);
	}
	_updateProgramName(e, t) {
		let n = this._config, r = n?.programs?.items?.[e];
		if (!n || !r) return;
		let i = k(r);
		t ? i.name = t : delete i.name, i.guard = "confirm", this._replaceProgram(e, i);
	}
	_updateProgramEntity(e, t) {
		let n = this._config, r = n?.programs?.items?.[e];
		if (!n || !r) return;
		let i = k(r);
		t ? (i.entity = t, delete i.action) : delete i.entity, i.guard = "confirm", this._replaceProgram(e, i);
	}
	_replaceProgram(e, t) {
		let n = this._config;
		if (!n) return;
		let r = k(n), i = [...r.programs?.items ?? []];
		i[e] = t, r.programs = {
			...r.programs ?? {},
			guard: "confirm",
			items: i
		}, this._commit(r);
	}
	_commit(e) {
		let t = Qe(e);
		this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: k(t) },
			bubbles: !0,
			composed: !0
		}));
	}
};
customElements.get("vacuum-control-card-editor") || customElements.define("vacuum-control-card-editor", $e);
//#endregion
//#region node_modules/lit-html/directive.js
var j = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, et = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), tt = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: nt } = Ne, rt = (e) => e.strings === void 0, it = {}, at = (e, t = it) => e._$AH = t, ot = et(class extends tt {
	constructor(e) {
		if (super(e), e.type !== j.PROPERTY && e.type !== j.ATTRIBUTE && e.type !== j.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!rt(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === w || t === T) return t;
		let n = e.element, r = e.name;
		if (e.type === j.PROPERTY) {
			if (t === n[r]) return w;
		} else if (e.type === j.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return w;
		} else if (e.type === j.ATTRIBUTE && n.getAttribute(r) === t + "") return w;
		return at(e), t;
	}
}), st = 15e3, ct = [
	"0",
	"none",
	"ok",
	"no_error"
], lt = [
	"activity",
	"controls",
	"programs",
	"alerts",
	"dock"
], ut = [
	"activity",
	"controls",
	"programs",
	"alerts"
], dt = [
	"alerts",
	"dock",
	"maintenance",
	"diagnostics"
], ft = ["battery", "progress"], pt = ["battery"], mt = [
	"combined",
	"robot",
	"dock"
], ht = [
	"auto",
	"compact",
	"comfortable",
	"detailed"
], gt = ["adaptive", "accent"], _t = [
	"battery",
	"progress",
	"area",
	"duration"
], vt = [
	"expanded",
	"collapsed",
	"hidden"
], yt = ["confirm"], bt = [
	"vacuum",
	"mop",
	"combo",
	"unknown"
], xt = [
	"ok",
	"warning",
	"active",
	"installed",
	"missing",
	"unknown"
], St = [
	"none",
	"subtle",
	"expressive"
], Ct = [
	"more-info",
	"toggle",
	"perform-action",
	"navigate",
	"url",
	"assist",
	"none"
], wt = [
	"status",
	"battery",
	"charging",
	"cleaning",
	"progress",
	"area",
	"duration",
	"last_start",
	"last_end",
	"map",
	"vacuum_mode",
	"mop_mode",
	"mop_intensity",
	"volume",
	"mop_attached",
	"water_tank_attached",
	"water_shortage",
	"vacuum_error"
], Tt = /^[a-z0-9_]+\.[a-z0-9_]+$/, M = class extends Error {
	constructor(e) {
		super(`Vacuum Control Card: ${e}`), this.name = "VacuumCardConfigError";
	}
};
function N(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function P(e, t) {
	return typeof t == "string" && e.includes(t);
}
function F(e, t) {
	if (e !== void 0 && !N(e)) throw new M(`"${t}" muss ein Objekt sein.`);
}
function Et(e, t) {
	if (e !== void 0 && !Array.isArray(e)) throw new M(`"${t}" muss eine Liste sein.`);
}
function I(e, t) {
	if (typeof e != "string" || !Tt.test(e)) throw new M(`"${t}" muss eine gültige Home-Assistant-Entitäts-ID sein.`);
}
function L(e, t) {
	if (e !== void 0 && typeof e != "string") throw new M(`"${t}" muss Text sein.`);
}
function R(e, t) {
	if (e !== void 0 && typeof e != "boolean") throw new M(`"${t}" muss true oder false sein.`);
}
function Dt(e, t) {
	if (e !== void 0 && (typeof e != "number" || !Number.isFinite(e))) throw new M(`"${t}" muss eine endliche Zahl sein.`);
}
function Ot(e, t) {
	if (!Array.isArray(e) || e.some((e) => typeof e != "string")) throw new M(`"${t}" muss eine Liste aus Textwerten sein.`);
}
function z(e, t, n) {
	if (e !== void 0 && !P(t, e)) throw new M(`"${n}" muss einer der Werte ${t.join(", ")} sein.`);
}
function kt(e, t, n = "entity") {
	if (typeof e != "string" || !Tt.test(e)) throw new M(`"${n}" muss eine g\u00fcltige ${t}-Entit\u00e4ts-ID sein (z. B. "${t}.mein_geraet").`);
	let r = e.slice(0, e.indexOf("."));
	if (r !== t) throw new M(`"${n}" muss zur Domain "${t}" geh\u00f6ren; erhalten wurde "${r}".`);
}
function At(e, t = "entity") {
	kt(e, "vacuum", t);
}
function jt(e, t = "programs.items[].entity") {
	kt(e, "button", t);
}
function Mt(e, t = "programs.guard") {
	if (!P(yt, e)) throw new M(`"${t}" darf nicht ungesichert sein. Erlaubt ist nur "confirm".`);
}
function Nt(e, t) {
	if (e !== void 0 && typeof e != "boolean") {
		if (!N(e)) throw new M(`"${t}" muss true, false oder ein Best\u00e4tigungsobjekt sein.`);
		for (let n of [
			"title",
			"text",
			"confirm_text",
			"dismiss_text"
		]) {
			let r = e[n];
			if (r !== void 0 && typeof r != "string") throw new M(`"${t}.${n}" muss Text sein.`);
		}
	}
}
function Pt(e, t) {
	if (!N(e)) throw new M(`"${t}" muss eine Dashboard-Aktion sein.`);
	if (!P(Ct, e.action)) throw new M(`"${t}.action" enth\u00e4lt keinen unterst\u00fctzten Dashboard-Aktionstyp.`);
	Nt(e.confirmation, `${t}.confirmation`);
	for (let n of [
		"perform_action",
		"navigation_path",
		"url_path"
	]) L(e[n], `${t}.${n}`);
	if (F(e.target, `${t}.target`), F(e.data, `${t}.data`), e.action === "perform-action" && typeof e.perform_action != "string") throw new M(`"${t}.perform_action" ist für eine perform-action-Aktion erforderlich.`);
	if (e.action === "navigate" && typeof e.navigation_path != "string") throw new M(`"${t}.navigation_path" ist für eine navigate-Aktion erforderlich.`);
	if (e.action === "url" && typeof e.url_path != "string") throw new M(`"${t}.url_path" ist für eine url-Aktion erforderlich.`);
}
function Ft(e, t) {
	if (!N(e)) throw new M(`"${t}" muss ein Objekt sein.`);
	if (!P(wt, e.condition)) throw new M(`"${t}.condition" referenziert keine unterst\u00fctzte semantische Entit\u00e4t.`);
	if (typeof e.expected != "boolean" && typeof e.expected != "string" && typeof e.expected != "number") throw new M(`"${t}.expected" muss boolean, Text oder eine Zahl sein.`);
	if (typeof e.expected == "number" && !Number.isFinite(e.expected)) throw new M(`"${t}.expected" muss eine endliche Zahl sein.`);
	if (e.severity !== void 0 && !P([
		"block",
		"warn",
		"ignore"
	], e.severity)) throw new M(`"${t}.severity" muss "block", "warn" oder "ignore" sein.`);
	if (e.message !== void 0 && typeof e.message != "string") throw new M(`"${t}.message" muss Text sein.`);
}
function It(e, t = 0) {
	let n = `programs.items[${t}]`;
	if (!N(e)) throw new M(`"${n}" muss ein Objekt sein.`);
	let r = e.entity !== void 0;
	if (r === (e.action !== void 0)) throw new M(`"${n}" muss genau eine Quelle aus "entity" oder "action" besitzen.`);
	r ? jt(e.entity, `${n}.entity`) : Pt(e.action, `${n}.action`);
	for (let t of [
		"name",
		"icon",
		"description",
		"color"
	]) L(e[t], `${n}.${t}`);
	if (R(e.hidden, `${n}.hidden`), e.confirmation !== void 0 && Nt(e.confirmation, `${n}.confirmation`), e.guard !== void 0 && Mt(e.guard, `${n}.guard`), e.kind !== void 0 && !P(bt, e.kind)) throw new M(`"${n}.kind" muss vacuum, mop, combo oder unknown sein.`);
	if (e.requires !== void 0) {
		if (!Array.isArray(e.requires)) throw new M(`"${n}.requires" muss eine Liste sein.`);
		e.requires.forEach((e, t) => {
			Ft(e, `${n}.requires[${t}]`);
		});
	}
}
function Lt(e = st) {
	let t;
	if (typeof e == "number") t = e;
	else if (typeof e == "string") {
		let n = /^([0-9]+(?:\.[0-9]+)?)\s*(ms|s|m|h)?$/i.exec(e.trim());
		if (n === null) throw new M("\"programs.acknowledgement_timeout\" muss eine positive Dauer wie \"15s\" oder eine Millisekundenzahl sein.");
		t = Number(n[1]) * {
			ms: 1,
			s: 1e3,
			m: 6e4,
			h: 36e5
		}[n[2]?.toLowerCase() ?? "ms"];
	} else throw new M("\"programs.acknowledgement_timeout\" muss Text oder eine Zahl sein.");
	let n = Math.round(t);
	if (!Number.isSafeInteger(n) || n <= 0) throw new M("\"programs.acknowledgement_timeout\" muss größer als 0 sein.");
	return n;
}
function Rt(e) {
	if (e !== void 0 && (F(e, "entities"), N(e))) for (let t of wt) {
		let n = e[t];
		n !== void 0 && I(n, `entities.${t}`);
	}
}
function zt(e) {
	if (e !== void 0 && (F(e, "controls"), N(e))) {
		for (let t of [
			"start_pause",
			"stop",
			"return_home",
			"locate"
		]) {
			let n = e[t];
			if (n !== void 0 && n !== !0 && n !== !1 && n !== "auto") throw new M(`"controls.${t}" muss true, false oder "auto" sein.`);
		}
		R(e.confirm_stop_while_active, "controls.confirm_stop_while_active"), R(e.confirm_return_while_active, "controls.confirm_return_while_active");
	}
}
function Bt(e) {
	if (e !== void 0 && (F(e, "overview"), !(!N(e) || e.items === void 0))) {
		if (!Array.isArray(e.items)) throw new M("\"overview.items\" muss eine Liste sein.");
		e.items.forEach((e, t) => {
			if (!P(_t, e)) throw new M(`"overview.items[${t}]" muss einer der Werte ${_t.join(", ")} sein.`);
		});
	}
}
function Vt(e, t) {
	if (typeof e == "string") {
		I(e, t);
		return;
	}
	if (!N(e)) throw new M(`"${t}" muss eine Entitäts-ID oder ein Objekt sein.`);
	I(e.entity, `${t}.entity`), z(e.on_is, xt, `${t}.on_is`), L(e.name, `${t}.name`);
}
function Ht(e) {
	if (e !== void 0 && (F(e, "dock"), N(e))) {
		z(e.display, vt, "dock.display");
		for (let t of [
			"auto_expand_on_activity",
			"auto_expand_on_warning",
			"show_activity_in_header",
			"show_warnings_in_header"
		]) R(e[t], `dock.${t}`);
		if (F(e.entities, "dock.entities"), N(e.entities)) {
			for (let t of [
				"error",
				"mop_drying",
				"drying_remaining",
				"emptying_mode",
				"child_lock"
			]) {
				let n = e.entities[t];
				n !== void 0 && I(n, `dock.entities.${t}`);
			}
			for (let t of [
				"clean_water_tank",
				"dirty_water_tank",
				"cleaning_solution"
			]) {
				let n = e.entities[t];
				n !== void 0 && Vt(n, `dock.entities.${t}`);
			}
		}
	}
}
function Ut(e) {
	if (e !== void 0 && (F(e, "maintenance"), N(e) && (z(e.display, vt, "maintenance.display"), F(e.defaults, "maintenance.defaults"), N(e.defaults) && (Dt(e.defaults.warning_below, "maintenance.defaults.warning_below"), Dt(e.defaults.critical_below, "maintenance.defaults.critical_below")), e.items !== void 0))) {
		if (!Array.isArray(e.items)) throw new M("\"maintenance.items\" muss eine Liste sein.");
		e.items.forEach((e, t) => {
			let n = `maintenance.items[${t}]`;
			if (!N(e)) throw new M(`"${n}" muss ein Objekt sein.`);
			I(e.entity, `${n}.entity`);
			for (let t of [
				"name",
				"icon",
				"kind"
			]) L(e[t], `${n}.${t}`);
			Dt(e.warning_below, `${n}.warning_below`), Dt(e.critical_below, `${n}.critical_below`);
		});
	}
}
function Wt(e) {
	if (e !== void 0 && (F(e, "diagnostics"), N(e) && (z(e.display, vt, "diagnostics.display"), e.items !== void 0))) {
		if (!Array.isArray(e.items)) throw new M("\"diagnostics.items\" muss eine Liste sein.");
		e.items.forEach((e, t) => {
			let n = `diagnostics.items[${t}]`;
			if (!N(e)) throw new M(`"${n}" muss ein Objekt sein.`);
			I(e.entity, `${n}.entity`), L(e.name, `${n}.name`), L(e.icon, `${n}.icon`), z(e.confirmation, ["always", "never"], `${n}.confirmation`);
		});
	}
}
function Gt(e) {
	e !== void 0 && (F(e, "animations"), N(e) && (R(e.enabled, "animations.enabled"), z(e.intensity, St, "animations.intensity"), R(e.respect_reduced_motion, "animations.respect_reduced_motion")));
}
function Kt(e) {
	e !== void 0 && (F(e, "error_handling"), N(e) && (e.clear_states !== void 0 && Ot(e.clear_states, "error_handling.clear_states"), R(e.show_raw_unknown_states, "error_handling.show_raw_unknown_states")));
}
function qt(e) {
	e !== void 0 && (F(e, "sections"), N(e) && e.order !== void 0 && Ot(e.order, "sections.order"));
}
function Jt(e) {
	if (e !== void 0 && (F(e, "state_map"), N(e))) for (let t of ["activity", "task_kind"]) {
		let n = e[t];
		if (n !== void 0) {
			if (!N(n)) throw new M(`"state_map.${t}" muss ein Objekt sein.`);
			for (let [e, r] of Object.entries(n)) Ot(r, `state_map.${t}.${e}`);
		}
	}
}
function Yt(e) {
	if (!N(e)) throw new M("Die Kartenkonfiguration muss ein Objekt sein.");
	if (e.type !== "custom:vacuum-control-card") throw new M("\"type\" muss exakt \"custom:vacuum-control-card\" sein.");
	At(e.entity), L(e.name, "name"), L(e.icon, "icon"), z(e.view, mt, "view"), z(e.density, ht, "density"), z(e.appearance, gt, "appearance"), Bt(e.overview), Rt(e.entities), zt(e.controls), F(e.programs, "programs"), N(e.programs) && (e.programs.guard !== void 0 && Mt(e.programs.guard), Lt(e.programs.acknowledgement_timeout), Et(e.programs.items, "programs.items"), Array.isArray(e.programs.items) && e.programs.items.forEach((e, t) => {
		It(e, t);
	})), Ht(e.dock), Ut(e.maintenance), Wt(e.diagnostics), Gt(e.animations), Kt(e.error_handling), qt(e.sections), Jt(e.state_map);
}
function B(e, t = /* @__PURE__ */ new WeakMap()) {
	if (Array.isArray(e)) {
		let n = t.get(e);
		if (n !== void 0) return n;
		let r = [];
		t.set(e, r);
		for (let n of e) r.push(B(n, t));
		return r;
	}
	if (N(e)) {
		let n = t.get(e);
		if (n !== void 0) return n;
		let r = Object.fromEntries([]);
		t.set(e, r);
		for (let [n, i] of Object.entries(e)) r[n] = B(i, t);
		return r;
	}
	return e;
}
function Xt(e) {
	let t = B(e);
	return t.action !== void 0 && (t.action.confirmation === void 0 || t.action.confirmation === !1) && (t.action.confirmation = !0), t;
}
function Zt(e, t) {
	if (e.entity) return `entity:${e.entity}`;
	try {
		return `action:${JSON.stringify(e.action)}`;
	} catch {
		return `action:${t}`;
	}
}
function Qt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = [];
	return e.forEach((e, i) => {
		let a = Zt(e, i);
		if (n.has(a)) {
			t.push({
				code: "duplicate_program",
				value: e.name ?? e.entity ?? `#${i + 1}`
			});
			return;
		}
		n.add(a), r.push(Xt(e));
	}), r;
}
function $t(e, t) {
	let n = /* @__PURE__ */ new Set();
	return e.filter((e) => n.has(e) ? (t.push({
		code: "duplicate_section",
		value: e
	}), !1) : (n.add(e), !0));
}
function en(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r) || (t.add(r), n.push(r));
	return n;
}
function tn(e) {
	Yt(e);
	let t = e, n = t.programs, r = t.maintenance, i = [], a = t.density ?? "auto", o = a === "compact" ? pt : ft, s = t.view ?? "combined", c = s === "dock" ? dt : s === "robot" || a === "compact" ? ut : lt, l = {
		type: "custom:vacuum-control-card",
		entity: t.entity,
		view: s,
		density: a,
		appearance: t.appearance ?? "adaptive",
		overview: { items: en(B(t.overview?.items ?? [...o])) },
		entities: B(t.entities ?? {}),
		controls: {
			start_pause: t.controls?.start_pause ?? "auto",
			stop: t.controls?.stop ?? "auto",
			return_home: t.controls?.return_home ?? "auto",
			locate: t.controls?.locate ?? "auto",
			confirm_stop_while_active: t.controls?.confirm_stop_while_active ?? !0,
			confirm_return_while_active: t.controls?.confirm_return_while_active ?? !0
		},
		programs: {
			guard: n?.guard ?? "confirm",
			acknowledgement_timeout: Lt(n?.acknowledgement_timeout),
			items: Qt(n?.items ?? [], i)
		},
		dock: {
			display: t.dock?.display ?? "collapsed",
			auto_expand_on_activity: t.dock?.auto_expand_on_activity ?? !1,
			auto_expand_on_warning: t.dock?.auto_expand_on_warning ?? !1,
			show_activity_in_header: t.dock?.show_activity_in_header ?? !0,
			show_warnings_in_header: t.dock?.show_warnings_in_header ?? !0,
			entities: B(t.dock?.entities ?? {})
		},
		maintenance: {
			display: r?.display ?? "collapsed",
			defaults: {
				warning_below: r?.defaults?.warning_below ?? 20,
				critical_below: r?.defaults?.critical_below ?? 5
			},
			items: B(r?.items ?? [])
		},
		diagnostics: {
			display: t.diagnostics?.display ?? "hidden",
			items: B(t.diagnostics?.items ?? [])
		},
		animations: {
			enabled: t.animations?.enabled ?? !0,
			intensity: t.animations?.intensity ?? "subtle",
			respect_reduced_motion: t.animations?.respect_reduced_motion ?? !0
		},
		error_handling: {
			clear_states: B(t.error_handling?.clear_states ?? [...ct]),
			show_raw_unknown_states: t.error_handling?.show_raw_unknown_states ?? !0
		},
		sections: { order: $t(B(t.sections?.order ?? [...c]), i) },
		state_map: B(t.state_map ?? {}),
		configurationWarnings: i
	};
	return t.name !== void 0 && (l.name = t.name), t.icon !== void 0 && (l.icon = t.icon), l;
}
//#endregion
//#region src/ha.ts
var V = {
	PAUSE: 4,
	STOP: 8,
	RETURN_HOME: 16,
	LOCATE: 512,
	START: 8192
};
function nn(e, t) {
	if (!e) return !1;
	let n = Number(e.attributes.supported_features ?? 0);
	return Number.isFinite(n) && (n & t) !== 0;
}
function rn(e, ...t) {
	return !!(e && t.includes(e.state.toLowerCase()));
}
function H(e, t) {
	if (!t) return "";
	if (e.formatEntityName) try {
		return e.formatEntityName(t, { type: "entity" });
	} catch {}
	return t.attributes.friendly_name ?? t.entity_id;
}
function U(e, t) {
	if (!t) return "";
	if (e.formatEntityState) try {
		return e.formatEntityState(t);
	} catch {}
	let n = t.attributes.unit_of_measurement;
	return n ? `${t.state} ${n}` : t.state;
}
function W(e, t) {
	e.dispatchEvent(new CustomEvent("hass-more-info", {
		bubbles: !0,
		composed: !0,
		detail: { entityId: t }
	}));
}
function an(e, t, n) {
	e.dispatchEvent(new CustomEvent("hass-action", {
		bubbles: !0,
		composed: !0,
		detail: {
			config: {
				...n ? { entity: n } : {},
				tap_action: t
			},
			action: "tap"
		}
	}));
}
function on(e, t) {
	let n = t.attributes.entity_picture;
	if (n) return /^https?:\/\//i.test(n) ? n : e.hassUrl ? e.hassUrl(n) : n;
}
function sn(e) {
	if (!(!e || rn(e, "unknown", "unavailable"))) {
		if (rn(e, "on", "true", "yes", "1", "active", "connected", "home")) return !0;
		if (rn(e, "off", "false", "no", "0", "inactive", "disconnected", "not_home")) return !1;
	}
}
//#endregion
//#region src/localize.ts
var cn = {
	de: {
		"card.default_name": "Saugroboter",
		"card.default_dock_name": "Saugroboter-Station",
		"card.dock_name": "{name} – Station",
		"state.unavailable": "Nicht verfügbar",
		"state.offline": "Offline",
		"state.error": "Fehler",
		"state.idle": "Bereit",
		"state.docked": "An der Station",
		"state.charging": "Lädt",
		"state.charged": "Voll geladen",
		"state.cleaning": "Reinigt",
		"state.paused": "Pausiert",
		"state.returning": "Fährt zur Station",
		"state.unknown": "Status unbekannt",
		"task.vacuum": "Saugt",
		"task.mop": "Wischt",
		"task.combo": "Saugt und wischt",
		"task.unknown": "Reinigt",
		"action.start": "Starten",
		"action.pause": "Pause",
		"action.resume": "Fortsetzen",
		"action.stop": "Stoppen",
		"action.return": "Zur Station",
		"action.locate": "Orten",
		"action.programs": "Programm wählen",
		"action.confirm": "Starten",
		"action.cancel": "Abbrechen",
		"action.close": "Schließen",
		"action.details": "Details",
		"action.more_info": "Mehr Informationen",
		"section.activity": "Aktuelle Reinigung",
		"section.last_cleaning": "Letzte Reinigung",
		"section.controls": "Steuerung",
		"section.programs": "Programme",
		"section.alerts": "Hinweise",
		"section.dock": "Station",
		"section.details": "Robotereinstellungen",
		"section.maintenance": "Wartung",
		"section.map": "Karte",
		"section.diagnostics": "Technische Diagnose",
		"metric.battery": "Batterie",
		"metric.progress": "Fortschritt",
		"metric.area": "Fläche",
		"metric.duration": "Dauer",
		"metric.last_start": "Letzter Beginn",
		"metric.last_end": "Letztes Ende",
		"compact.alert_count": "{count} Hinweise",
		"compact.dock_active": "Station aktiv",
		"program.confirm_title": "Programm starten?",
		"program.confirm_text": "„{name}“ wirklich auf „{robot}“ starten?",
		"program.sent": "Anfrage für „{name}“ gesendet.",
		"program.started": "„{name}“ wurde gestartet.",
		"program.unconfirmed": "Anfrage gesendet, Start von „{name}“ nicht bestätigt.",
		"program.failed": "„{name}“ konnte nicht gestartet werden.",
		"program.pending": "Start wird angefordert …",
		"program.unavailable": "Programm ist nicht verfügbar.",
		"program.busy": "Während der aktuellen Aktivität kann kein anderes Programm gestartet werden.",
		"program.requirement_failed": "Voraussetzung „{name}“ ist nicht erfüllt.",
		"program.no_items": "Keine Programme konfiguriert.",
		"confirm.stop_title": "Reinigung stoppen?",
		"confirm.stop_text": "Die aktuelle Reinigung wird beendet und nicht automatisch fortgesetzt.",
		"confirm.return_title": "Zur Station zurückkehren?",
		"confirm.return_text": "Die aktuelle Reinigung wird für die Rückfahrt unterbrochen.",
		"confirm.switch_title": "Schalter ändern?",
		"command.failed": "Der Befehl konnte nicht ausgeführt werden.",
		"command.sent": "Befehl wurde gesendet.",
		"dock.ready": "Station bereit",
		"dock.details": "Stationsdetails",
		"dock.drying": "Mopp wird getrocknet",
		"dock.error": "Stationsfehler",
		"dock.unknown": "Status prüfen",
		"dock.unavailable": "Station nicht verfügbar",
		"dock.on": "Ein",
		"dock.off": "Aus",
		"binary.ok": "In Ordnung",
		"binary.check": "Prüfen",
		"binary.installed": "Vorhanden",
		"binary.missing": "Fehlt",
		"alert.robot_unavailable": "Roboter nicht verfügbar",
		"alert.robot_offline": "Roboter offline",
		"alert.vacuum_error": "Roboterfehler",
		"alert.dock_error": "Stationsfehler",
		"alert.water_shortage": "Wasserknappheit",
		"alert.dock_clean_water_tank": "Frischwassertank prüfen",
		"alert.dock_dirty_water_tank": "Schmutzwassertank prüfen",
		"alert.dock_cleaning_solution": "Reinigungsflüssigkeit prüfen",
		"setting.vacuum_mode": "Reinigungsmodus",
		"setting.mop_mode": "Wischmodus",
		"setting.mop_intensity": "Wischintensität",
		"setting.volume": "Lautstärke",
		"setting.emptying_mode": "Entleerungsmodus",
		"setting.child_lock": "Kindersicherung",
		"diagnostic.switch_aria": "{name}: {action}",
		"diagnostic.raw_state": "Rohzustand",
		"diagnostic.last_changed": "Geändert",
		"action.turn_on": "einschalten",
		"action.turn_off": "ausschalten",
		"config.warning.duplicate_program": "Das doppelte Programm „{value}“ wurde nur einmal übernommen.",
		"config.warning.duplicate_section": "Der doppelte Abschnitt „{value}“ wurde nur einmal übernommen.",
		"maintenance.remaining": "Verbleibend",
		"maintenance.alert_summary": "{count} Wartungshinweise",
		"maintenance.most_urgent": "Am dringendsten: {name} · {value}",
		"common.unknown": "Unbekannt",
		"common.unavailable": "Nicht verfügbar",
		"common.warning": "Warnung",
		"common.critical": "Kritisch"
	},
	en: {
		"card.default_name": "Vacuum",
		"card.default_dock_name": "Vacuum dock",
		"card.dock_name": "{name} – Dock",
		"state.unavailable": "Unavailable",
		"state.offline": "Offline",
		"state.error": "Error",
		"state.idle": "Ready",
		"state.docked": "Docked",
		"state.charging": "Charging",
		"state.charged": "Fully charged",
		"state.cleaning": "Cleaning",
		"state.paused": "Paused",
		"state.returning": "Returning to dock",
		"state.unknown": "Status unknown",
		"task.vacuum": "Vacuuming",
		"task.mop": "Mopping",
		"task.combo": "Vacuuming and mopping",
		"task.unknown": "Cleaning",
		"action.start": "Start",
		"action.pause": "Pause",
		"action.resume": "Resume",
		"action.stop": "Stop",
		"action.return": "Return to dock",
		"action.locate": "Locate",
		"action.programs": "Choose program",
		"action.confirm": "Start",
		"action.cancel": "Cancel",
		"action.close": "Close",
		"action.details": "Details",
		"action.more_info": "More information",
		"section.activity": "Current cleaning",
		"section.last_cleaning": "Last cleaning",
		"section.controls": "Controls",
		"section.programs": "Programs",
		"section.alerts": "Notices",
		"section.dock": "Dock",
		"section.details": "Robot settings",
		"section.maintenance": "Maintenance",
		"section.map": "Map",
		"section.diagnostics": "Technical diagnostics",
		"metric.battery": "Battery",
		"metric.progress": "Progress",
		"metric.area": "Area",
		"metric.duration": "Duration",
		"metric.last_start": "Last start",
		"metric.last_end": "Last end",
		"compact.alert_count": "{count} notices",
		"compact.dock_active": "Dock active",
		"program.confirm_title": "Start program?",
		"program.confirm_text": "Start “{name}” on “{robot}” now?",
		"program.sent": "Request for “{name}” sent.",
		"program.started": "“{name}” started.",
		"program.unconfirmed": "Request sent, but start of “{name}” was not confirmed.",
		"program.failed": "“{name}” could not be started.",
		"program.pending": "Requesting start …",
		"program.unavailable": "Program is unavailable.",
		"program.busy": "Another program cannot be started during the current activity.",
		"program.requirement_failed": "Requirement “{name}” is not met.",
		"program.no_items": "No programs configured.",
		"confirm.stop_title": "Stop cleaning?",
		"confirm.stop_text": "The current cleaning will end and will not resume automatically.",
		"confirm.return_title": "Return to dock?",
		"confirm.return_text": "The current cleaning will be interrupted for the return trip.",
		"confirm.switch_title": "Change switch?",
		"command.failed": "The command could not be performed.",
		"command.sent": "Command sent.",
		"dock.ready": "Dock ready",
		"dock.details": "Dock details",
		"dock.drying": "Mop is drying",
		"dock.error": "Dock error",
		"dock.unknown": "Check status",
		"dock.unavailable": "Dock unavailable",
		"dock.on": "On",
		"dock.off": "Off",
		"binary.ok": "OK",
		"binary.check": "Check",
		"binary.installed": "Installed",
		"binary.missing": "Missing",
		"alert.robot_unavailable": "Robot unavailable",
		"alert.robot_offline": "Robot offline",
		"alert.vacuum_error": "Robot error",
		"alert.dock_error": "Dock error",
		"alert.water_shortage": "Water shortage",
		"alert.dock_clean_water_tank": "Check clean-water tank",
		"alert.dock_dirty_water_tank": "Check dirty-water tank",
		"alert.dock_cleaning_solution": "Check cleaning solution",
		"setting.vacuum_mode": "Cleaning mode",
		"setting.mop_mode": "Mop mode",
		"setting.mop_intensity": "Mop intensity",
		"setting.volume": "Volume",
		"setting.emptying_mode": "Emptying mode",
		"setting.child_lock": "Child lock",
		"diagnostic.switch_aria": "{name}: {action}",
		"diagnostic.raw_state": "Raw state",
		"diagnostic.last_changed": "Changed",
		"action.turn_on": "turn on",
		"action.turn_off": "turn off",
		"config.warning.duplicate_program": "The duplicate program “{value}” was included only once.",
		"config.warning.duplicate_section": "The duplicate section “{value}” was included only once.",
		"maintenance.remaining": "Remaining",
		"maintenance.alert_summary": "{count} maintenance notices",
		"maintenance.most_urgent": "Most urgent: {name} · {value}",
		"common.unknown": "Unknown",
		"common.unavailable": "Unavailable",
		"common.warning": "Warning",
		"common.critical": "Critical"
	}
};
function ln(e) {
	return (e?.locale?.language ?? e?.language ?? "en").toLowerCase().startsWith("de") ? "de" : "en";
}
function G(e, t, n) {
	let r = cn[ln(e)][t] ?? cn.en[t] ?? t;
	for (let [e, t] of Object.entries(n ?? {})) r = r.replaceAll(`{${e}}`, String(t));
	return r;
}
function un(e, t) {
	return G(e, `state.${t}`);
}
function dn(e, t) {
	return G(e, `task.${t}`);
}
//#endregion
//#region src/layout.ts
var fn = /* @__PURE__ */ new Set([
	"activity",
	"controls",
	"programs",
	"alerts",
	"details",
	"maintenance",
	"map",
	"diagnostics"
]), pn = /* @__PURE__ */ new Set([
	"alerts",
	"dock",
	"maintenance",
	"diagnostics"
]);
function K(e, t) {
	return e.sections.order.includes(t) ? e.view === "robot" ? fn.has(t) : e.view !== "dock" || pn.has(t) : !1;
}
function mn(e) {
	if (!K(e, "controls")) return 0;
	let t = [
		e.controls.start_pause,
		e.controls.stop,
		e.controls.return_home,
		e.controls.locate
	].filter((e) => e !== !1).length;
	return Math.max(0, Math.ceil(t / 4) - 1);
}
function hn(e) {
	if (!K(e, "activity")) return 0;
	let t = e.overview.items.filter((t) => t !== "battery" && !!e.entities[t]);
	return Math.ceil(new Set(t).size / 3);
}
function gn(e) {
	if (!K(e, "programs")) return 0;
	let t = e.programs.items.filter((e) => !e.hidden).length, n = e.density === "compact" ? 3 : 2;
	return Math.ceil(t / n);
}
function _n(e) {
	return K(e, "programs") ? e.programs.items.filter((e) => !e.hidden).length : 0;
}
function vn(e) {
	return K(e, "activity") ? e.overview.items.filter((t) => t !== "battery" && !!e.entities[t]).length : 0;
}
function yn(e) {
	return Math.ceil(e / 3);
}
function bn(e) {
	if (!K(e, "dock") || e.dock.display === "hidden" && e.view !== "dock") return 0;
	let t = Object.values(e.dock.entities).filter(Boolean).length;
	return t === 0 ? 0 : 1 + (e.dock.display === "expanded" || e.view === "dock" ? yn(t) : 0);
}
function xn(e) {
	if (!K(e, "details")) return 0;
	let t = [
		e.entities.last_start,
		e.entities.last_end,
		e.entities.vacuum_mode,
		e.entities.mop_mode,
		e.entities.mop_intensity,
		e.entities.volume
	].filter(Boolean).length;
	return t === 0 ? 0 : 1 + (e.density === "detailed" ? yn(t) : 0);
}
function Sn(e) {
	if (!K(e, "maintenance") || e.maintenance.display === "hidden") return 0;
	let t = e.view === "dock" ? e.maintenance.items.filter((e) => e.kind?.startsWith("dock")) : e.maintenance.items;
	return t.length === 0 ? 0 : 1 + (e.maintenance.display === "expanded" ? yn(t.length) : 0);
}
function Cn(e) {
	return K(e, "map") && e.entities.map ? 1 : 0;
}
function wn(e) {
	return !K(e, "diagnostics") || e.diagnostics.display === "hidden" || e.diagnostics.items.length === 0 ? 0 : 1 + (e.diagnostics.display === "expanded" ? yn(e.diagnostics.items.length) : 0);
}
function Tn(e) {
	return bn(e) + xn(e) + Sn(e) + Cn(e) + wn(e);
}
function En(e) {
	let t = mn(e) + hn(e) + gn(e) + Tn(e), n = e.density === "compact", r = (n ? 2 : 6) + t, i = n ? 6 : e.density === "detailed" ? 12 : e.density === "comfortable" || _n(e) >= 2 || vn(e) >= 2 || Tn(e) >= 2 ? 9 : 6;
	return {
		rows: r,
		columns: n ? 6 : 12,
		min_rows: r,
		min_columns: i
	};
}
//#endregion
//#region src/state.ts
var q = [
	"0",
	"none",
	"ok",
	"no_error"
], Dn = /* @__PURE__ */ new Set(["unavailable"]), On = /* @__PURE__ */ new Set(["unknown", "unavailable"]), kn = /* @__PURE__ */ new Set([
	"on",
	"true",
	"1"
]), An = /* @__PURE__ */ new Set([
	"off",
	"false",
	"0"
]), jn = [
	"unavailable",
	"offline",
	"error",
	"cleaning",
	"paused",
	"returning",
	"charging",
	"docked",
	"idle",
	"unknown"
], Mn = [
	"error",
	"offline",
	"unavailable",
	"cleaning",
	"paused",
	"returning",
	"charging",
	"docked",
	"idle",
	"unknown"
], Nn = [
	"combo",
	"mop",
	"vacuum",
	"unknown"
], Pn = {
	unavailable: "unavailable",
	offline: "offline",
	error: "error",
	cleaning: "cleaning",
	vacuuming: "cleaning",
	mopping: "cleaning",
	sweeping: "cleaning",
	paused: "paused",
	pause: "paused",
	returning: "returning",
	returning_home: "returning",
	"returning home": "returning",
	going_home: "returning",
	charging: "charging",
	docked: "docked",
	at_base: "docked",
	"at base": "docked",
	charging_complete: "docked",
	idle: "idle",
	ready: "idle",
	standby: "idle",
	unknown: "unknown"
};
function J(e) {
	if (typeof e != "string" && typeof e != "number") return;
	let t = String(e).trim().toLocaleLowerCase("en-US");
	return t.length > 0 ? t : void 0;
}
function Y(e, t) {
	if (t) return e.states[t];
}
function Fn(e) {
	if (!e) return !0;
	let t = J(e.state);
	return t === void 0 || Dn.has(t);
}
function X(e) {
	let t = J(e?.state);
	return t !== void 0 && !On.has(t);
}
function Z(e) {
	let t = J(e?.state);
	return t !== void 0 && kn.has(t);
}
function In(e) {
	let t = J(e?.state);
	return t !== void 0 && An.has(t);
}
function Ln(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
	if (typeof e != "string") return;
	let t = e.trim();
	if (t.length === 0 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(t)) return;
	let n = Number(t);
	return Number.isFinite(n) ? n : void 0;
}
function Rn(e) {
	let t = Ln(e);
	if (t !== void 0) return Math.min(100, Math.max(0, t));
}
function zn(e) {
	if (X(e)) return Rn(e?.state);
}
function Bn(e, t = q) {
	let n = J(e);
	return n === void 0 || t.some((e) => {
		let t = J(e);
		return t !== void 0 && t === n;
	});
}
function Vn(e, t = q) {
	return X(e) ? !Bn(e?.state, t) : !1;
}
function Hn(e, t) {
	let n = J(e), r = J(t);
	return n !== void 0 && r !== void 0 && n === r;
}
function Un(e, t) {
	let n = t?.activity;
	if (!(!n || J(e) === void 0)) for (let t of jn) {
		let r = n[t];
		if (Array.isArray(r) && r.some((t) => Hn(e, t))) return t;
	}
}
function Wn(e) {
	let t = J(e);
	return t === void 0 ? void 0 : Pn[t];
}
function Gn(e, t) {
	if (e) return Un(e.state, t) ?? Wn(e.state);
}
function Kn(e) {
	for (let t of Mn) if (e.includes(t)) return t;
}
function qn(e, t, n = q) {
	let { primary: r, status: i, cleaning: a, charging: o, vacuumError: s } = e;
	if (Fn(r)) return "unavailable";
	if (Vn(s, n)) return "error";
	let c = Kn([Gn(r, t), X(i) ? Gn(i, t) : void 0]);
	return c === "error" || c === "offline" || c === "unavailable" || c === "paused" || c === "returning" ? c : c === "cleaning" || Z(a) ? "cleaning" : c === "charging" || Z(o) ? "charging" : c ?? "unknown";
}
function Jn(e, t) {
	let n = t?.task_kind;
	if (!(!n || J(e) === void 0)) for (let t of Nn) {
		let r = n[t];
		if (Array.isArray(r) && r.some((t) => Hn(e, t))) return t;
	}
}
function Yn(e) {
	return e === "vacuum" || e === "mop" || e === "combo" || e === "unknown";
}
function Xn(e, t, n, r) {
	if (!t) return "unknown";
	let i = [
		e.status,
		e.primary,
		e.vacuumMode,
		e.mopMode,
		e.mopIntensity
	];
	for (let e of i) {
		if (!X(e)) continue;
		let t = Jn(e?.state, n);
		if (t !== void 0) return t;
	}
	return Yn(r) ? r : "unknown";
}
function Zn(e) {
	return typeof e == "string" ? {
		entity: e,
		on_is: "unknown"
	} : e;
}
function Q(e, t) {
	let n = e?.attributes.friendly_name;
	return typeof n == "string" && n.trim().length > 0 ? n : t;
}
function $(e, t, n, r) {
	let i = {
		key: e,
		severity: t,
		label: n
	};
	return r && (i.entityId = r.entity_id, i.rawState = r.state), i;
}
function Qn(e, t, n, r, i) {
	let a = Zn(r);
	if (!a || a.on_is === "unknown" || !a.on_is) return;
	let o = Y(t, a.entity);
	X(o) && ((a.on_is === "warning" || a.on_is === "missing") && Z(o) || (a.on_is === "ok" || a.on_is === "installed") && In(o)) && e.push($(n, "warning", a.name ?? Q(o, i), o));
}
function $n(e, t) {
	let n = t.maintenance?.items ?? [], r = t.maintenance?.defaults?.warning_below ?? 20, i = t.maintenance?.defaults?.critical_below ?? 5, a = [];
	for (let t of n) {
		let n = Y(e, t.entity);
		if (!X(n)) continue;
		let o = Ln(n?.state);
		if (o === void 0) continue;
		let s = t.warning_below ?? r, c = o <= (t.critical_below ?? i) ? "critical" : o <= s ? "warning" : void 0;
		c && a.push($(`maintenance:${t.entity}`, c, t.name ?? Q(n, "Maintenance required"), n));
	}
	return a;
}
function er(e, t, n) {
	let r = t.error_handling?.clear_states ?? q, i = [], a = Y(e, t.entity), o = Y(e, t.entities?.vacuum_error), s = Y(e, t.dock?.entities?.error);
	if (n === "unavailable" ? i.push($("robot_unavailable", "critical", "Vacuum unavailable", a)) : n === "offline" && i.push($("robot_offline", "critical", "Vacuum offline", a)), Vn(o, r)) i.push($("vacuum_error", "critical", Q(o, "Vacuum error"), o));
	else if (n === "error") {
		let n = Y(e, t.entities?.status), r = Wn(a?.state) === "error" ? a : n;
		i.push($("vacuum_error", "critical", Q(r, "Vacuum error"), r));
	}
	Vn(s, r) && i.push($("dock_error", "critical", Q(s, "Dock error"), s));
	let c = Y(e, t.entities?.water_shortage);
	Z(c) && i.push($("water_shortage", "warning", Q(c, "Water shortage"), c));
	let l = t.dock?.entities;
	return Qn(i, e, "dock_clean_water_tank", l?.clean_water_tank, "Clean-water tank"), Qn(i, e, "dock_dirty_water_tank", l?.dirty_water_tank, "Dirty-water tank"), Qn(i, e, "dock_cleaning_solution", l?.cleaning_solution, "Cleaning solution"), i.push(...$n(e, t)), i;
}
function tr(e) {
	return Object.values(e.dock?.entities ?? {}).some(Boolean);
}
function nr(e, t, n = []) {
	let r = t.dock?.entities;
	if (!r || !tr(t)) return [];
	let i = [], a = Y(e, r.mop_drying), o = Y(e, r.error);
	return Vn(o, t.error_handling?.clear_states ?? q) && i.push("error"), Z(a) && i.push("mop_drying"), n.some((e) => e.key.startsWith("maintenance:") && t.maintenance?.items?.some((t) => t.entity === e.entityId && t.kind?.startsWith("dock") === !0)) && i.push("maintenance_required"), i.length > 0 ? i : X(a) || X(o) ? ["idle"] : [];
}
function rr(e) {
	return X(e) ? e : void 0;
}
function ir(e, t) {
	let n = zn(t);
	return n === void 0 ? Rn(e?.attributes.battery_level) : n;
}
function ar(e, t, n) {
	let r = Y(e, t.entity), i = t.entities ?? {}, a = Y(e, i.status), o = Y(e, i.cleaning), s = Y(e, i.charging), c = Y(e, i.vacuum_error), l = t.error_handling?.clear_states ?? q, u = qn({
		primary: r,
		status: a,
		cleaning: o,
		charging: s,
		vacuumError: c
	}, t.state_map, l), d = r !== void 0 && u !== "unavailable" && u !== "offline", f = d && Z(o), ee = d && u !== "error" && (f || u === "cleaning" || u === "paused"), te = d && (u === "charging" || Z(s)), p = Xn({
		primary: r,
		status: a,
		vacuumMode: Y(e, i.vacuum_mode),
		mopMode: Y(e, i.mop_mode),
		mopIntensity: Y(e, i.mop_intensity)
	}, ee, t.state_map, n), m = er(e, t, u), h = d;
	return {
		primary: r,
		activity: u,
		taskKind: p,
		sessionActive: ee,
		battery: h ? ir(r, Y(e, i.battery)) : void 0,
		charging: te,
		progress: h ? zn(Y(e, i.progress)) : void 0,
		area: h ? rr(Y(e, i.area)) : void 0,
		duration: h ? rr(Y(e, i.duration)) : void 0,
		status: h ? rr(a) ?? rr(r) : void 0,
		dockActivities: nr(e, t, m),
		alerts: m
	};
}
//#endregion
//#region src/styles.ts
var or = o`
  :host {
    display: block;
    container-type: inline-size;
    color: var(--primary-text-color, #1f2937);
    --vc-accent: var(--vacuum-control-card-accent-color, var(--primary-color, #3f8cff));
    --vc-success: var(--vacuum-control-card-success-color, var(--success-color, #3ba272));
    --vc-warning: var(--vacuum-control-card-warning-color, var(--warning-color, #e6a23c));
    --vc-error: var(--vacuum-control-card-error-color, var(--error-color, #db4455));
    --vc-water: var(--vacuum-control-card-water-color, var(--info-color, var(--primary-color, #27a9e1)));
    --vc-icon: var(--state-icon-color, var(--secondary-text-color, #687386));
    --vc-icon-active: var(--state-icon-active-color, var(--primary-color, #3f8cff));
    --vc-on-accent: var(--text-primary-color, #fff);
    --vc-surface: var(
      --vacuum-control-card-surface-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --vc-control: var(--vacuum-control-card-control-background, color-mix(in srgb, var(--vc-accent) 10%, transparent));
    --vc-radius: var(--vacuum-control-card-border-radius, var(--ha-card-border-radius, 18px));
    --vc-gap: var(--vacuum-control-card-spacing, 14px);
    --vc-speed: var(--vacuum-control-card-animation-speed, 2.4s);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ha-card,
  .card {
    display: block;
    overflow: hidden;
    border-radius: var(--vc-radius);
    background: var(--vc-surface);
  }

  .shell {
    padding: 18px;
    display: grid;
    gap: var(--vc-gap);
  }

  .shell[data-animation-intensity="subtle"] {
    --vc-speed: var(--vacuum-control-card-animation-speed, 2.8s);
  }

  .shell[data-animation-intensity="expressive"] {
    --vc-speed: var(--vacuum-control-card-animation-speed, 1.55s);
  }

  .header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
  }

  .header-trailing {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .title-row {
    min-width: 0;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .title-copy {
    min-width: 0;
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.18rem;
    line-height: 1.25;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  h3 {
    font-size: 0.92rem;
    line-height: 1.25;
  }

  .status-line {
    margin-block-start: 3px;
    color: var(--secondary-text-color, #687386);
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .robot-mark {
    inline-size: 46px;
    block-size: 46px;
    flex: 0 0 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--vc-on-accent);
    font-weight: 800;
    background: linear-gradient(145deg, color-mix(in srgb, var(--vc-accent) 76%, white), var(--vc-accent));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--vc-accent) 28%, transparent);
  }

  .robot-mark ha-icon {
    display: block;
    inline-size: 25px;
    block-size: 25px;
    --mdc-icon-size: 25px;
  }

  .battery {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-block-size: 34px;
    padding-inline: 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 6%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 650;
    white-space: nowrap;
  }

  .battery[data-charging="true"] {
    color: var(--vc-success);
  }

  .hero {
    min-block-size: 154px;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    align-items: center;
    gap: 20px;
    padding: 16px;
    border-radius: calc(var(--vc-radius) - 4px);
    background:
      radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--vc-accent) 18%, transparent), transparent 42%),
      color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .robot-visual {
    position: relative;
    inline-size: 112px;
    block-size: 112px;
    margin: auto;
    display: grid;
    place-items: center;
  }

  .robot-body {
    z-index: 2;
    inline-size: 84px;
    block-size: 84px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--vc-accent);
    background: var(--vc-surface);
    border: 3px solid color-mix(in srgb, var(--vc-accent) 65%, transparent);
    box-shadow: 0 10px 25px color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
    font-size: 1.7rem;
  }

  .robot-visual::before,
  .robot-visual::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .robot-visual::before {
    inset: 2px;
    border: 2px dashed color-mix(in srgb, var(--vc-accent) 45%, transparent);
    opacity: 0;
  }

  .robot-visual[data-active="true"]::before {
    opacity: 1;
    animation: vc-spin var(--vc-speed) linear infinite;
  }

  .robot-visual[data-kind="mop"]::after,
  .robot-visual[data-kind="combo"]::after {
    inset-inline: 10px;
    inset-block-end: 2px;
    block-size: 18px;
    border: 3px solid color-mix(in srgb, var(--vc-water) 55%, transparent);
    border-block-start-color: transparent;
  }

  .robot-visual[data-active="true"][data-kind="mop"]::after,
  .robot-visual[data-active="true"][data-kind="combo"]::after {
    animation: vc-wave calc(var(--vc-speed) * 0.8) ease-in-out infinite alternate;
  }

  .robot-visual[data-active="true"][data-activity="returning"] {
    animation: vc-return var(--vc-speed) ease-in-out infinite;
  }

  .robot-visual[data-active="true"][data-activity="charging"] .robot-body {
    animation: vc-pulse var(--vc-speed) ease-in-out infinite;
  }

  .hero-copy {
    min-width: 0;
    display: grid;
    gap: 12px;
  }

  .hero-state {
    font-size: clamp(1.1rem, 5cqi, 1.45rem);
    font-weight: 720;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .metric {
    min-width: 0;
  }

  .metric-button {
    inline-size: 100%;
    min-block-size: 44px;
    padding: 7px 8px;
    border-radius: 10px;
    text-align: start;
    background: transparent;
  }

  .metric-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--vc-accent) 9%, transparent);
  }

  .metric-label-row {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .metric-label {
    color: var(--secondary-text-color, #687386);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.035em;
  }

  .metric-value {
    margin-block-start: 3px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  progress {
    inline-size: 100%;
    block-size: 8px;
    border: 0;
    border-radius: 99px;
    overflow: hidden;
    accent-color: var(--vc-accent);
  }

  progress::-webkit-progress-bar {
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 10%, transparent);
  }

  progress::-webkit-progress-value {
    background: var(--vc-accent);
    border-radius: 99px;
  }

  .section {
    display: grid;
    gap: 10px;
  }

  .activity-card {
    min-block-size: 68px;
    display: grid;
    grid-template-columns: auto minmax(92px, 0.8fr) minmax(0, 1.35fr);
    align-items: center;
    gap: 10px;
    padding: 9px 11px;
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .activity-card[data-session-active="true"] {
    background: color-mix(in srgb, var(--vc-accent) 7%, transparent);
  }

  .activity-visual {
    position: relative;
    inline-size: 44px;
    block-size: 44px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--secondary-text-color, #687386);
    background: var(--vc-surface);
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  }

  .activity-visual ha-icon {
    position: relative;
    z-index: 2;
    inline-size: 23px;
    block-size: 23px;
    --mdc-icon-size: 23px;
  }

  .activity-card[data-session-active="true"] .activity-visual {
    color: var(--vc-accent);
  }

  .activity-visual[data-active="true"][data-activity="cleaning"] ha-icon {
    animation: vc-clean-drive var(--vc-speed) ease-in-out infinite;
  }

  .activity-visual[data-active="true"] .activity-trail {
    position: absolute;
    inset-inline: 5px;
    inset-block-end: 4px;
    block-size: 5px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--vc-accent) 28%, transparent);
    animation: vc-trail var(--vc-speed) ease-in-out infinite;
  }

  .activity-visual[data-kind="mop"] .activity-trail,
  .activity-visual[data-kind="combo"] .activity-trail {
    background: color-mix(in srgb, var(--vc-water) 45%, transparent);
  }

  .activity-copy {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .activity-copy h3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .activity-progress-value {
    flex: 0 0 auto;
    color: var(--vc-accent);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }

  .activity-secondary {
    min-block-size: 4px;
    color: var(--secondary-text-color, #687386);
    font-size: 0.76rem;
  }

  .activity-metrics {
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
    gap: 4px;
  }

  .activity-card .metric,
  .activity-card .metric-button {
    min-block-size: 44px;
    padding: 4px 6px;
    background: transparent;
  }

  .activity-card .metric-label-row {
    min-block-size: 0;
  }

  .activity-card .metric-label {
    font-size: 0.67rem;
  }

  .activity-card .metric-value {
    margin-block-start: 2px;
    font-size: 0.82rem;
  }

  .last-cleaning {
    padding: 11px 12px;
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .last-cleaning .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 8px;
  }

  .shell:not([data-density="compact"]) [data-section="controls"] {
    gap: 0;
  }

  .shell:not([data-density="compact"]) [data-section="controls"] .section-heading {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .shell:not([data-density="compact"]) .controls {
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 4px;
    padding: 4px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .shell:not([data-density="compact"]) .controls button {
    min-block-size: 46px;
    padding: 7px 9px;
    border-radius: 10px;
    background: transparent;
  }

  .shell:not([data-density="compact"]) .control-text {
    font-size: 0.76rem;
    line-height: 1.15;
  }

  .shell:not([data-density="compact"]) .controls .primary {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 10%, transparent);
  }

  .shell:not([data-density="compact"]) .controls .danger:not(:disabled) {
    background: color-mix(in srgb, var(--vc-error) 8%, transparent);
  }

  .controls button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .control-icon {
    display: block;
    flex: 0 0 auto;
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  button,
  select,
  input {
    font: inherit;
  }

  button {
    min-block-size: 44px;
    border: 0;
    border-radius: 13px;
    padding: 9px 12px;
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-control);
    cursor: pointer;
    transition: transform 120ms ease, background-color 120ms ease, opacity 120ms ease;
  }

  button:hover:not(:disabled):not([aria-disabled="true"]) {
    background: color-mix(in srgb, var(--vc-accent) 17%, transparent);
  }

  button:active:not(:disabled):not([aria-disabled="true"]) {
    transform: translateY(1px);
  }

  button:focus-visible,
  select:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--vc-accent) 70%, var(--vc-surface));
    outline-offset: 2px;
  }

  button:disabled,
  button[aria-disabled="true"],
  select:disabled,
  input:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .primary {
    color: var(--vc-on-accent);
    background: var(--vc-accent);
    font-weight: 700;
  }

  .primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--vc-accent) 84%, var(--primary-text-color, #1f2937));
  }

  .danger {
    color: var(--vc-error);
    background: color-mix(in srgb, var(--vc-error) 10%, transparent);
  }

  .program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 9px;
  }

  .program {
    min-block-size: 76px;
    text-align: start;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--program-color, var(--vc-accent)) 13%, transparent), transparent),
      color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .program-icon {
    inline-size: 34px;
    block-size: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: var(--program-color, var(--vc-accent));
    background: color-mix(in srgb, var(--program-color, var(--vc-accent)) 13%, transparent);
  }

  .program-icon ha-icon {
    display: block;
    inline-size: 21px;
    block-size: 21px;
    --mdc-icon-size: 21px;
  }

  .program-name {
    display: block;
    font-weight: 680;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .program-description {
    display: block;
    margin-block-start: 4px;
    color: var(--secondary-text-color, #687386);
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .alert-list {
    display: grid;
    gap: 7px;
  }

  .alert {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 11px;
    border-radius: 12px;
    border-inline-start: 4px solid var(--alert-color, var(--vc-warning));
    background: color-mix(in srgb, var(--alert-color, var(--vc-warning)) 9%, transparent);
  }

  .alert[data-severity="critical"] {
    --alert-color: var(--vc-error);
  }

  .alert[data-severity="info"] {
    --alert-color: var(--vc-accent);
  }

  .alert-icon {
    flex: 0 0 auto;
    inline-size: 20px;
    block-size: 20px;
    color: var(--alert-color, var(--vc-warning));
    --mdc-icon-size: 20px;
  }

  .alert-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 2px;
    font-weight: 650;
  }

  .alert-detail {
    color: var(--secondary-text-color, #687386);
    font-size: 0.78rem;
    font-weight: 450;
    overflow-wrap: anywhere;
  }

  .alert-action {
    margin-inline-start: auto;
    min-block-size: 44px;
    min-inline-size: 44px;
    padding: 7px;
    display: grid;
    place-items: center;
  }

  .alert-action ha-icon {
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  .dock-strip {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 11px 12px;
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
    cursor: pointer;
    list-style: none;
  }

  .dock-strip::-webkit-details-marker {
    display: none;
  }

  .dock-details[open] .dock-chevron {
    transform: rotate(90deg);
  }

  .dock-trailing {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .dock-chevron {
    inline-size: 18px;
    block-size: 18px;
    --mdc-icon-size: 18px;
    transition: transform 140ms ease;
  }

  .dock-section:not([data-view="dock"]) .section-heading {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .dock-symbol[data-active="true"] {
    color: var(--vc-accent);
    animation: vc-wave var(--vc-speed) ease-in-out infinite alternate;
  }

  details {
    border-radius: 13px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  summary {
    min-block-size: 44px;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    font-weight: 650;
  }

  .details-content {
    padding: 2px 12px 12px;
    display: grid;
    gap: 10px;
  }

  .entity-row,
  .setting-row {
    min-block-size: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(100px, auto);
    gap: 10px;
    align-items: center;
    border-block-start: 1px solid color-mix(in srgb, var(--primary-text-color, #1f2937) 9%, transparent);
  }

  .entity-row:first-child,
  .setting-row:first-child {
    border-block-start: 0;
  }

  .entity-value {
    text-align: end;
    color: var(--secondary-text-color, #687386);
    overflow-wrap: anywhere;
  }

  .icon-action {
    min-inline-size: 44px;
    min-block-size: 44px;
    padding: 7px;
    display: inline-grid;
    place-items: center;
  }

  .icon-action ha-icon {
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  select,
  input[type="range"] {
    inline-size: min(100%, 220px);
    min-block-size: 44px;
  }

  .maintenance-bar {
    display: inline-block;
    inline-size: 110px;
    block-size: 7px;
    margin-inline-start: auto;
    overflow: hidden;
    border-radius: 99px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 10%, transparent);
  }

  .maintenance-value {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .diagnostic-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .maintenance-bar > span {
    display: block;
    block-size: 100%;
    inline-size: var(--remaining, 0%);
    background: var(--bar-color, var(--vc-success));
  }

  .map-image {
    inline-size: 100%;
    max-block-size: 480px;
    object-fit: contain;
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent);
  }

  .notice {
    min-block-size: 42px;
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 11px;
    color: var(--primary-text-color, #1f2937);
    background: color-mix(in srgb, var(--vc-accent) 10%, transparent);
  }

  .notice[data-kind="error"] {
    background: color-mix(in srgb, var(--vc-error) 12%, transparent);
  }

  .dialog-backdrop {
    position: fixed;
    z-index: 999;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgb(0 0 0 / 48%);
  }

  .dialog {
    inline-size: min(440px, 100%);
    max-block-size: min(620px, calc(100dvh - 36px));
    overflow: auto;
    padding: 20px;
    border-radius: 18px;
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-surface);
    box-shadow: 0 24px 80px rgb(0 0 0 / 34%);
  }

  .dialog h3 {
    font-size: 1.2rem;
  }

  .dialog p {
    margin-block-start: 10px;
    color: var(--secondary-text-color, #687386);
    line-height: 1.5;
  }

  .dialog-issues {
    margin-block: 14px 0;
    padding-inline-start: 20px;
  }

  .dialog-actions {
    margin-block-start: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .empty {
    color: var(--secondary-text-color, #687386);
    font-size: 0.88rem;
  }

  @container (max-width: 420px) {
    .shell {
      padding: 14px;
    }

    .hero {
      grid-template-columns: 88px minmax(0, 1fr);
      padding: 12px;
      gap: 10px;
    }

    .robot-visual {
      inline-size: 78px;
      block-size: 78px;
    }

    .robot-body {
      inline-size: 62px;
      block-size: 62px;
      font-size: 1.25rem;
    }

    .metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .activity-card {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .activity-metrics {
      grid-column: 1 / -1;
    }
  }

  @container (max-width: 320px) {
    .shell:not([data-density="compact"]) .program-grid {
      grid-template-columns: 1fr;
    }
  }

  @container (max-width: 280px) {
    .shell:not([data-density="compact"]) .controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @container (min-width: 321px) and (max-width: 620px) {
    .shell:not([data-density="compact"]) .program-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .shell:not([data-density="compact"]) .program-description {
      display: none;
    }
  }

  @container (min-width: 760px) {
    .shell[data-view="combined"] {
      grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
      align-items: start;
    }

    .shell[data-view="combined"] .header,
    .shell[data-view="combined"] .notice,
    .shell[data-view="combined"] .dialog-backdrop {
      grid-column: 1 / -1;
    }

    .shell[data-view="combined"] .section[data-section="dock"],
    .shell[data-view="combined"] .section[data-section="maintenance"],
    .shell[data-view="combined"] .section[data-section="diagnostics"] {
      grid-column: 2;
    }

    .shell[data-view="combined"] .section[data-section="activity"],
    .shell[data-view="combined"] .section[data-section="controls"],
    .shell[data-view="combined"] .section[data-section="programs"],
    .shell[data-view="combined"] .section[data-section="alerts"],
    .shell[data-view="combined"] .section[data-section="details"],
    .shell[data-view="combined"] .section[data-section="map"] {
      grid-column: 1;
    }
  }

  /*
   * Compact is a real HA tile-sized presentation, not a scaled-down version
   * of the large card. Text and touch targets keep readable sizes while
   * decorative and secondary content is reduced.
   */
  .shell[data-density="compact"] {
    --vc-gap: 7px;
    padding: 10px 12px;
    grid-template-columns: minmax(0, 1fr);
  }

  .shell[data-density="compact"] .header {
    align-items: center;
    gap: 6px;
  }

  .shell[data-density="compact"] .title-row {
    gap: 8px;
  }

  .shell[data-density="compact"] .robot-mark {
    inline-size: 36px;
    block-size: 36px;
    flex-basis: 36px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--vc-accent) 22%, transparent);
  }

  .shell[data-density="compact"] .robot-mark[data-active="true"] {
    animation: vc-pulse var(--vc-speed) ease-in-out infinite;
  }

  .shell[data-density="compact"] .robot-mark ha-icon {
    inline-size: 20px;
    block-size: 20px;
    --mdc-icon-size: 20px;
  }

  .shell[data-density="compact"] h2 {
    font-size: 0.94rem;
    line-height: 1.16;
    -webkit-line-clamp: 1;
  }

  .shell[data-density="compact"] .status-line {
    margin-block-start: 1px;
    font-size: 0.76rem;
  }

  .shell[data-density="compact"] .battery {
    min-block-size: 28px;
    gap: 4px;
    padding-inline: 7px;
    font-size: 0.76rem;
  }

  .compact-status-badge {
    min-inline-size: 32px;
    min-block-size: 32px;
    padding: 4px 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: 999px;
    color: var(--vc-warning);
    background: color-mix(in srgb, var(--vc-warning) 14%, transparent);
    font-size: 0.75rem;
    font-weight: 750;
  }

  .compact-status-badge[data-severity="critical"] {
    color: var(--vc-error);
    background: color-mix(in srgb, var(--vc-error) 14%, transparent);
  }

  .compact-status-badge[data-severity="info"] {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 12%, transparent);
  }

  button.compact-status-badge {
    min-inline-size: 44px;
    min-block-size: 44px;
  }

  .shell[data-density="compact"] .section {
    gap: 6px;
  }

  .shell[data-density="compact"] .section-heading {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .shell[data-density="compact"] .compact-overview {
    padding-block: 2px;
  }

  .shell[data-density="compact"] .compact-overview .metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .metric {
    position: relative;
    min-block-size: 44px;
    padding: 5px 7px;
    display: grid;
    align-content: center;
    border-radius: 9px;
    background: color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent);
  }

  .shell[data-density="compact"] .metric-label-row {
    min-block-size: 0;
  }

  .shell[data-density="compact"] .metric-label {
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shell[data-density="compact"] .metric-value {
    margin-block-start: 1px;
    font-size: 0.84rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shell[data-density="compact"] progress {
    block-size: 5px;
  }

  .compact-progress {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
    color: var(--vc-accent);
    font-size: 0.75rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  .shell[data-density="compact"] .controls {
    grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .controls button {
    min-inline-size: 44px;
    min-block-size: 44px;
    padding: 7px;
    border-radius: 11px;
  }

  .shell[data-density="compact"] .control-text {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .shell[data-density="compact"] .program-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .shell[data-density="compact"] .program {
    min-block-size: 58px;
    padding: 5px 3px;
    grid-template-columns: minmax(0, 1fr);
    place-items: center;
    align-content: center;
    gap: 3px;
    text-align: center;
    border-radius: 10px;
  }

  .shell[data-density="compact"] .program-icon {
    inline-size: 25px;
    block-size: 25px;
    border-radius: 8px;
  }

  .shell[data-density="compact"] .program-icon ha-icon {
    inline-size: 17px;
    block-size: 17px;
    --mdc-icon-size: 17px;
  }

  .shell[data-density="compact"] .program-name {
    min-width: 0;
    max-width: 100%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 0.72rem;
    line-height: 1.08;
  }

  .shell[data-density="compact"] .program-description {
    display: none;
  }

  .shell[data-density="compact"] .dock-strip,
  .shell[data-density="compact"] summary,
  .shell[data-density="compact"] .notice {
    min-block-size: 44px;
    padding: 7px 9px;
    font-size: 0.8rem;
  }

  @container (max-width: 420px) {
    .shell[data-density="auto"] {
      --vc-gap: 8px;
      padding: 12px;
    }

    .shell[data-density="auto"] .robot-mark {
      inline-size: 38px;
      block-size: 38px;
      flex-basis: 38px;
    }

    .shell[data-density="auto"] .hero {
      min-block-size: 0;
      grid-template-columns: minmax(0, 1fr);
      padding: 10px;
    }

    .shell[data-density="auto"] .robot-visual {
      display: none;
    }

    .shell[data-density="auto"] .program-description {
      display: none;
    }
  }

  /*
   * Adaptive keeps the component modern while borrowing the quiet visual
   * language of Home Assistant's native Tile cards. Every color comes from
   * the active HA theme; accent is reserved for live state and warnings.
   */
  ha-card[data-appearance="adaptive"] {
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color, rgb(127 127 127 / 24%)));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .shell[data-appearance="adaptive"] {
    --vc-radius: var(--ha-card-border-radius, 12px);
    --vc-control: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 6%, transparent)
    );
  }

  .shell[data-appearance="adaptive"] .robot-mark {
    color: var(--vc-icon);
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 7%, transparent)
    );
    border: 1px solid transparent;
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .robot-mark[data-active="true"] {
    color: var(--vc-icon-active);
    background: color-mix(in srgb, var(--vc-accent) 11%, var(--vc-surface));
    border-color: color-mix(in srgb, var(--vc-accent) 24%, transparent);
  }

  .shell[data-appearance="adaptive"][data-density="compact"] .robot-mark[data-active="true"] {
    animation-name: vc-adaptive-pulse;
  }

  .shell[data-appearance="adaptive"] .hero {
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 4%, transparent)
    );
    border: 1px solid var(--divider-color, rgb(127 127 127 / 16%));
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .robot-body {
    color: var(--secondary-text-color, #687386);
    border-color: color-mix(in srgb, var(--secondary-text-color, #687386) 34%, transparent);
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] button {
    border-radius: 10px;
  }

  .shell[data-appearance="adaptive"] .primary {
    color: var(--primary-text-color, #1f2937);
    background: var(--vc-control);
    font-weight: 650;
  }

  .shell[data-appearance="adaptive"] .primary:hover:not(:disabled) {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 10%, var(--vc-control));
  }

  .shell[data-appearance="adaptive"][data-activity="cleaning"] .controls .primary,
  .shell[data-appearance="adaptive"][data-activity="paused"] .controls .primary {
    color: var(--vc-accent);
    background: color-mix(in srgb, var(--vc-accent) 10%, var(--vc-control));
  }

  .shell[data-appearance="adaptive"] .program {
    background: var(--vc-control);
    border: 1px solid var(--divider-color, rgb(127 127 127 / 12%));
    box-shadow: none;
  }

  .shell[data-appearance="adaptive"] .program-icon {
    color: var(--program-color, var(--secondary-text-color, #687386));
    background: color-mix(
      in srgb,
      var(--program-color, var(--secondary-text-color, #687386)) 9%,
      transparent
    );
  }

  .shell[data-appearance="adaptive"] .battery,
  .shell[data-appearance="adaptive"] .metric,
  .shell[data-appearance="adaptive"] .dock-strip,
  .shell[data-appearance="adaptive"] details {
    background: var(
      --secondary-background-color,
      color-mix(in srgb, var(--primary-text-color, #1f2937) 5%, transparent)
    );
  }

  .shell[data-appearance="adaptive"] .activity-card .metric {
    background: transparent;
  }

  .shell[data-appearance="adaptive"] .battery[data-charging="true"] {
    color: var(--state-vacuum-active-color, var(--vc-success));
  }

  .shell[data-appearance="adaptive"][data-density="compact"] .battery {
    padding-inline: 3px;
    background: transparent;
  }

  .shell[data-appearance="adaptive"] .control-icon {
    color: var(--vc-icon);
  }

  .shell[data-appearance="adaptive"] .dialog-actions .primary {
    color: var(--vc-on-accent);
    background: var(--vc-accent);
  }

  .shell[data-appearance="adaptive"] .control-icon,
  .shell[data-appearance="adaptive"] .program-icon {
    transition: color 140ms ease, background-color 140ms ease;
  }

  @keyframes vc-adaptive-pulse {
    50% {
      border-color: color-mix(in srgb, var(--vc-accent) 45%, transparent);
      opacity: 0.82;
    }
  }

  @keyframes vc-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes vc-wave {
    from { transform: translateX(-3px); opacity: 0.55; }
    to { transform: translateX(3px); opacity: 1; }
  }

  @keyframes vc-pulse {
    50% { transform: scale(1.04); box-shadow: 0 10px 30px color-mix(in srgb, var(--vc-success) 34%, transparent); }
  }

  @keyframes vc-return {
    50% { transform: translateX(7px); }
  }

  @keyframes vc-clean-drive {
    0%, 100% { transform: translateX(-3px) rotate(-4deg); }
    50% { transform: translateX(5px) rotate(4deg); }
  }

  @keyframes vc-trail {
    0%, 100% { transform: scaleX(0.55); opacity: 0.35; }
    50% { transform: scaleX(1); opacity: 0.9; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`, sr = [
	"cleaning",
	"paused",
	"returning"
], cr = 400;
function lr(e) {
	switch (e) {
		case "vacuum": return "◌";
		case "mop": return "≈";
		case "combo": return "◉";
		default: return "▶";
	}
}
function ur(e) {
	if (!e) return;
	let t = e.trim();
	return /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/iu.test(t) ? t : void 0;
}
function dr(e) {
	return typeof e == "string" ? {
		entity: e,
		on_is: "unknown"
	} : e;
}
var fr = class extends O {
	constructor(...e) {
		super(...e), this._confirmationArmed = !1, this._commandBusy = !1, this._mapOpen = !1, this._confirmationSequence = 0, this._nextProgramToken = 0, this._configRevision = 0, this._serviceRequestToken = 0, this._focusPrograms = () => {
			let e = this.renderRoot.querySelector("#vc-programs button:not(:disabled)");
			e?.scrollIntoView({
				behavior: "smooth",
				block: "nearest"
			}), e?.focus();
		}, this._closeConfirmation = () => {
			let e = this._dialogReturnFocus;
			this._clearConfirmationArmTimer(), this._confirmationSequence += 1, this._confirmationArmed = !1, this._confirmation = void 0, this._dialogReturnFocus = void 0, this.updateComplete.then(() => {
				if (this.isConnected) {
					if (e?.isConnected && !(e instanceof HTMLButtonElement && e.disabled)) {
						e.focus();
						return;
					}
					(this.renderRoot.querySelector(".notice[tabindex]") ?? this.renderRoot.querySelector(".header h2"))?.focus();
				}
			});
		}, this._onBackdropClick = (e) => {
			e.target === e.currentTarget && this._closeConfirmation();
		}, this._onDialogKeydown = (e) => {
			if (e.key === "Escape") {
				e.preventDefault(), this._closeConfirmation();
				return;
			}
			if (e.key !== "Tab") return;
			let t = Array.from(this.renderRoot.querySelectorAll(".dialog button:not(:disabled)"));
			if (t.length === 0) {
				e.preventDefault(), this.renderRoot.querySelector(".dialog")?.focus();
				return;
			}
			if (t.length === 1) {
				e.preventDefault(), t[0]?.focus();
				return;
			}
			let n = t.indexOf(this.shadowRoot?.activeElement), r = e.shiftKey ? n <= 0 ? t.length - 1 : n - 1 : n >= t.length - 1 ? 0 : n + 1;
			e.preventDefault(), t[r]?.focus();
		}, this._confirmCurrent = () => {
			let e = this._confirmation;
			if (!(!e || !this._confirmationArmed)) {
				if (this._confirmationArmed = !1, this._clearConfirmationArmTimer(), e.kind === "program") {
					this._performProgram(e);
					return;
				}
				this._closeConfirmation(), this._executeService(e.domain, e.service, e.entityId);
			}
		};
	}
	static {
		this.styles = or;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_confirmation: { state: !0 },
			_confirmationArmed: { state: !0 },
			_pendingProgram: { state: !0 },
			_programTransport: { state: !0 },
			_commandBusy: { state: !0 },
			_notice: { state: !0 },
			_confirmedProgramKind: { state: !0 },
			_mapOpen: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("vacuum-control-card-editor");
	}
	static getStubConfig(e) {
		return {
			type: "custom:vacuum-control-card",
			entity: Object.keys(e?.states ?? {}).find((e) => e.startsWith("vacuum.")) ?? "vacuum.my_robot"
		};
	}
	setConfig(e) {
		let t = tn(e);
		this._configRevision += 1, this._clearPendingTimer(), this._pendingProgram = void 0, this._confirmedProgramKind = void 0, this._acknowledgedProgramToken = void 0, this._notice = void 0, this._mapOpen = !1, this._confirmation && this._closeConfirmation(), this._config = t, this.requestUpdate();
	}
	getCardSize() {
		if (!this._config) return 3;
		let { rows: e } = En(this._config);
		return Math.max(1, Math.ceil(e * 1.15));
	}
	getGridOptions() {
		return this._config ? En(this._config) : {
			rows: 2,
			columns: 6,
			min_rows: 2,
			min_columns: 6
		};
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._clearPendingTimer(), this._clearConfirmationArmTimer(), this._confirmationSequence += 1, this._serviceRequestToken += 1, this._confirmation = void 0, this._confirmationArmed = !1, this._pendingProgram = void 0, this._programTransport = void 0, this._commandBusy = !1, this._confirmedProgramKind = void 0, this._acknowledgedProgramToken = void 0, this._dialogReturnFocus = void 0, this._mapOpen = !1;
	}
	updated(e) {
		if (super.updated(e), this._setBackgroundInert(!!this._confirmation), e.has("_confirmation") && this._confirmation && queueMicrotask(() => {
			this.renderRoot.querySelector("[data-dialog-cancel]")?.focus();
		}), !this.hass || !this._config) return;
		let t = ar(this.hass, this._config, this._confirmedProgramKind), n = this._pendingProgram ?? this._programTransport;
		if (n && n.configRevision === this._configRevision && this._acknowledgedProgramToken !== n.token && t.activity === "cleaning") {
			let e = n;
			this._clearPendingTimer(), this._pendingProgram?.token === e.token && (this._pendingProgram = void 0), this._acknowledgedProgramToken = e.token, this._confirmedProgramKind = e.kind, this._notice = {
				kind: "success",
				text: G(this.hass, "program.started", { name: e.name })
			};
		}
		if (this._confirmedProgramKind && !t.sessionActive && !sr.includes(t.activity) && (this._confirmedProgramKind = void 0), e.has("hass") && this._confirmation?.kind === "program") {
			let e = this._confirmation, n = this._programPreflight(e.program, t);
			(e.openedActivity !== t.activity || !this._samePreflightIssues(e.issues, n)) && this._openConfirmation({
				...e,
				openedActivity: t.activity,
				issues: n
			}, this._dialogReturnFocus);
		}
	}
	render() {
		if (!this.hass || !this._config) return T;
		let e = ar(this.hass, this._config, this._confirmedProgramKind), t = this._config.view, n = this._visibleSections(t), r = this._config.sections.order.filter((e) => n.has(e));
		return r.includes("alerts") || r.unshift("alerts"), C`
      <ha-card data-appearance=${this._config.appearance}>
        <div
          class="shell"
          data-view=${t}
          data-density=${this._config.density}
          data-appearance=${this._config.appearance}
          data-activity=${e.activity}
          data-animation-intensity=${this._config.animations.intensity}
        >
          ${this._renderHeader(e)}
          ${this._config.configurationWarnings.map((e) => C`<div class="notice" data-kind="warning" role="status">
              ${G(this.hass, `config.warning.${e.code}`, { value: e.value })}
            </div>`)}
          ${this._notice ? C`<div
                class="notice"
                data-kind=${this._notice.kind}
                role="status"
                aria-live="polite"
                tabindex="-1"
              >
                ${this._notice.text}
              </div>` : T}
          ${r.map((t) => this._renderSection(t, e))}
          ${this._renderConfirmation()}
        </div>
      </ha-card>
    `;
	}
	_visibleSections(e) {
		return e === "dock" ? /* @__PURE__ */ new Set([
			"alerts",
			"dock",
			"maintenance",
			"diagnostics"
		]) : e === "robot" ? /* @__PURE__ */ new Set([
			"activity",
			"controls",
			"programs",
			"alerts",
			"details",
			"maintenance",
			"map",
			"diagnostics"
		]) : new Set(this._config?.sections.order ?? []);
	}
	_renderHeader(e) {
		if (!this.hass || !this._config) return T;
		let t = this._config.view === "dock", n = e.primary ? H(this.hass, e.primary) : void 0, r = this._config.name ?? (t ? n ? G(this.hass, "card.dock_name", { name: n }) : G(this.hass, "card.default_dock_name") : n ?? G(this.hass, "card.default_name")), i = t ? this._dockHeaderStatus(e) : e.activity === "charging" && e.battery !== void 0 && e.battery >= 99.5 ? G(this.hass, "state.charged") : e.activity === "cleaning" ? dn(this.hass, e.taskKind) : un(this.hass, e.activity), a = !t && this._config.overview.items.includes("battery"), o = this._renderCompactStatusBadge(e), s = this._config.animations.enabled && this._config.animations.intensity !== "none" && [
			"cleaning",
			"returning",
			"charging"
		].includes(e.activity);
		return C`
      <header class="header">
        <div class="title-row">
          <div
            class="robot-mark"
            data-kind=${t ? "dock" : "robot"}
            data-active=${String(s)}
            aria-hidden="true"
          >
            ${this._config.icon ? C`<ha-icon icon=${this._config.icon}></ha-icon>` : t ? "⌂" : "◎"}
          </div>
          <div class="title-copy">
            <h2 tabindex="-1">${r}</h2>
            <div class="status-line">${i}</div>
          </div>
        </div>
        <div class="header-trailing">
          ${a && e.battery !== void 0 ? C`<div
                class="battery"
                data-charging=${String(e.charging)}
                title=${G(this.hass, "metric.battery")}
                aria-label=${`${G(this.hass, "metric.battery")}: ${Math.round(e.battery)} %`}
              >
                <span aria-hidden="true">${e.charging ? "⚡" : "▰"}</span>
                ${Math.round(e.battery)} %
              </div>` : T}
          ${o}
        </div>
      </header>
    `;
	}
	_renderCompactStatusBadge(e) {
		if (!this.hass || !this._config || this._config.density !== "compact") return T;
		let t = this._config.sections.order.includes("alerts") ? this._visibleAlerts(e) : [], n = t[0];
		if (n) {
			let e = this._alertLabel(n.key, n.label), r = t.length > 1 ? G(this.hass, "compact.alert_count", { count: t.length }) : e;
			return n.entityId ? C`<button
            class="compact-status-badge"
            data-severity=${n.severity}
            title=${r}
            aria-label=${r}
            @click=${() => W(this, n.entityId)}
          ><span aria-hidden="true">!</span>${t.length > 1 ? t.length : T}</button>` : C`<span
            class="compact-status-badge"
            data-severity=${n.severity}
            role=${n.severity === "critical" ? "alert" : "status"}
            title=${r}
            aria-label=${r}
          ><span aria-hidden="true">!</span>${t.length > 1 ? t.length : T}</span>`;
		}
		return e.dockActivities.some((e) => ![
			"idle",
			"error",
			"maintenance_required",
			"unknown"
		].includes(e)) ? C`<span
          class="compact-status-badge"
          data-severity="info"
          role="status"
          title=${G(this.hass, "compact.dock_active")}
          aria-label=${G(this.hass, "compact.dock_active")}
        ><span aria-hidden="true">⌂</span></span>` : T;
	}
	_dockHeaderStatus(e) {
		if (!this.hass || !this._config) return "";
		let t = this._dockEntityIds().map((e) => this.hass.states[e]), n = t.some((e) => e && !["unknown", "unavailable"].includes(e.state.toLowerCase())), r = t.some((e) => e?.state.toLowerCase() === "unknown"), i = this._dockAlerts(e)[0];
		return i ? this._alertLabel(i.key, i.label) : e.dockActivities.includes("mop_drying") ? G(this.hass, "dock.drying") : n ? e.dockActivities.some((e) => e !== "idle") ? G(this.hass, "section.dock") : G(this.hass, "dock.ready") : G(this.hass, r ? "dock.unknown" : "dock.unavailable");
	}
	_renderSection(e, t) {
		switch (e) {
			case "activity": return this._renderActivity(t);
			case "controls": return this._renderControls(t);
			case "programs": return this._renderPrograms(t);
			case "alerts": return this._renderAlerts(t);
			case "dock": return this._renderDock(t);
			case "details": return this._renderDetails(t);
			case "maintenance": return this._renderMaintenance();
			case "map": return this._renderMap();
			case "diagnostics": return this._renderDiagnostics();
			default: return T;
		}
	}
	_renderActivity(e) {
		if (!this.hass || !this._config) return T;
		let t = new Set(this._config.overview.items), n = e.sessionActive && t.has("progress") && e.progress !== void 0, r = this._config.overview.items.some((t) => t === "progress" && e.sessionActive && e.progress !== void 0 || t === "area" && !!e.area || t === "duration" && !!e.duration), i = this._config.overview.items.map((t) => this._renderOverviewMetric(t, e, !1)), a = e.activity === "cleaning" ? dn(this.hass, e.taskKind) : un(this.hass, e.activity), o = e.sessionActive ? a : G(this.hass, "section.last_cleaning");
		if (this._config.density === "compact") return r ? C`
        <section
          class="section compact-overview"
          data-section="activity"
          data-session-active=${String(e.sessionActive)}
          aria-label=${o}
        >
          ${n ? C`<div class="compact-progress">
                <progress
                  max="100"
                  .value=${e.progress}
                  aria-label=${G(this.hass, "metric.progress")}
                ></progress>
                <span>${Math.round(e.progress)} %</span>
              </div>` : T}
          <div class="metrics">
            ${i}
          </div>
        </section>
      ` : T;
		if (!e.sessionActive && !r) return T;
		let s = this._config.animations.enabled && this._config.animations.intensity !== "none" && e.activity === "cleaning", c = e.sessionActive ? "mdi:robot-vacuum" : "mdi:history";
		return C`
      <section
        class="activity-card"
        data-section="activity"
        data-session-active=${String(e.sessionActive)}
        aria-labelledby="vc-activity-title"
      >
        <div
          class="activity-visual"
          data-active=${String(s)}
          data-kind=${e.taskKind}
          data-activity=${e.activity}
          aria-hidden="true"
        >
          <ha-icon icon=${c}></ha-icon>
          <span class="activity-trail"></span>
        </div>
        <div class="activity-copy">
          <h3 id="vc-activity-title">
            <span>${o}</span>
            ${n ? C`<span class="activity-progress-value">${Math.round(e.progress)} %</span>` : T}
          </h3>
          ${n ? C`<progress
                max="100"
                .value=${e.progress}
                aria-label=${G(this.hass, "metric.progress")}
              ></progress>` : C`<span class="activity-secondary"></span>`}
        </div>
        <div class="activity-metrics">
          ${i}
        </div>
      </section>
    `;
	}
	_renderOverviewMetric(e, t, n = !0) {
		return !this.hass || !this._config || e === "battery" ? T : e === "progress" && n && t.progress !== void 0 ? this._metric(G(this.hass, "metric.progress"), `${Math.round(t.progress)} %`, this._config.entities.progress) : e === "area" && t.area ? this._metric(G(this.hass, "metric.area"), U(this.hass, t.area), t.area.entity_id) : e === "duration" && t.duration ? this._metric(G(this.hass, "metric.duration"), U(this.hass, t.duration), t.duration.entity_id) : T;
	}
	_metric(e, t, n) {
		let r = C`
      <div class="metric-label-row">
        <div class="metric-label">${e}</div>
      </div>
      <div class="metric-value">${t}</div>
    `;
		return n ? C`<button
          class="metric metric-button"
          aria-label=${`${e}: ${t}. ${G(this.hass, "action.more_info")}`}
          @click=${() => W(this, n)}
        >${r}</button>` : C`<div class="metric">${r}</div>`;
	}
	_renderControls(e) {
		if (!this.hass || !this._config || !e.primary) return T;
		let t = this._config.controls, n = (t, n) => t === !0 || t === "auto" && nn(e.primary, n), r = sr.includes(e.activity), i = this._commandBusy || this._programBusy() || e.activity === "unavailable", a = this._config.programs.items.some((e) => !e.hidden), o = this._config.sections.order.includes("programs") && this._visibleSections(this._config.view).has("programs"), s = a && !o;
		return C`
      <section class="section" data-section="controls" aria-labelledby="vc-controls-title">
        <div class="section-heading"><h3 id="vc-controls-title">${G(this.hass, "section.controls")}</h3></div>
        <div class="controls">
          ${e.activity === "cleaning" && n(t.start_pause, V.PAUSE) ? C`<button class="primary" ?disabled=${i} @click=${() => this._executeVacuum("pause")}>
                ${this._controlContent("mdi:pause", G(this.hass, "action.pause"))}
              </button>` : e.activity === "paused" && n(t.start_pause, V.START) ? C`<button class="primary" ?disabled=${i} @click=${() => this._executeVacuum("start")}>
                  ${this._controlContent("mdi:play", G(this.hass, "action.resume"))}
                </button>` : s && this._config.density !== "compact" && [
			"idle",
			"docked",
			"charging"
		].includes(e.activity) ? C`<button class="primary" ?disabled=${i} @click=${this._focusPrograms}>
                    ${this._controlContent("mdi:playlist-play", G(this.hass, "action.programs"))}
                  </button>` : n(t.start_pause, V.START) ? C`<button class="primary" ?disabled=${i} @click=${() => this._executeVacuum("start")}>
                      ${this._controlContent("mdi:play", G(this.hass, "action.start"))}
                    </button>` : T}
          ${n(t.stop, V.STOP) ? C`<button
                class="danger"
                ?disabled=${i || !r}
                @click=${(t) => this._requestStop(e, t.currentTarget)}
              >
                ${this._controlContent("mdi:stop", G(this.hass, "action.stop"))}
              </button>` : T}
          ${n(t.return_home, V.RETURN_HOME) ? C`<button
                ?disabled=${i || e.activity === "docked"}
                @click=${(t) => this._requestReturn(e, t.currentTarget)}
              >
                ${this._controlContent("mdi:home-map-marker", G(this.hass, "action.return"))}
              </button>` : T}
          ${n(t.locate, V.LOCATE) ? C`<button ?disabled=${i} @click=${() => this._executeVacuum("locate")}>
                ${this._controlContent("mdi:crosshairs-gps", G(this.hass, "action.locate"))}
              </button>` : T}
        </div>
      </section>
    `;
	}
	_controlContent(e, t) {
		return C`<ha-icon class="control-icon" icon=${e} aria-hidden="true"></ha-icon><span class="control-text">${t}</span>`;
	}
	_requestStop(e, t) {
		if (!(!this.hass || !this._config)) {
			if (sr.includes(e.activity) && this._config.controls.confirm_stop_while_active) {
				this._openConfirmation({
					kind: "service",
					title: G(this.hass, "confirm.stop_title"),
					text: G(this.hass, "confirm.stop_text"),
					domain: "vacuum",
					service: "stop",
					entityId: this._config.entity
				}, t);
				return;
			}
			this._executeVacuum("stop");
		}
	}
	_requestReturn(e, t) {
		if (!(!this.hass || !this._config)) {
			if (sr.includes(e.activity) && this._config.controls.confirm_return_while_active) {
				this._openConfirmation({
					kind: "service",
					title: G(this.hass, "confirm.return_title"),
					text: G(this.hass, "confirm.return_text"),
					domain: "vacuum",
					service: "return_to_base",
					entityId: this._config.entity
				}, t);
				return;
			}
			this._executeVacuum("return_to_base");
		}
	}
	async _executeVacuum(e) {
		!this.hass || !this._config || this._commandBusy || await this._executeService("vacuum", e, this._config.entity);
	}
	async _executeService(e, t, n) {
		if (!this.hass || this._writeBusy()) return;
		let r = this.hass, i = ++this._serviceRequestToken;
		this._commandBusy = !0;
		try {
			if (await r.callService(e, t, {}, { entity_id: n }), i !== this._serviceRequestToken) return;
			this._notice = {
				kind: "info",
				text: G(r, "command.sent")
			};
		} catch {
			if (i !== this._serviceRequestToken) return;
			this._notice = {
				kind: "error",
				text: G(r, "command.failed")
			};
		} finally {
			i === this._serviceRequestToken && (this._commandBusy = !1);
		}
	}
	_renderPrograms(e) {
		if (!this.hass || !this._config) return T;
		let t = this._config.programs.items.filter((e) => !e.hidden);
		return t.length === 0 ? T : C`
      <section class="section" data-section="programs" id="vc-programs" aria-labelledby="vc-programs-title">
        <div class="section-heading"><h3 id="vc-programs-title">${G(this.hass, "section.programs")}</h3></div>
        <div class="program-grid">
          ${t.map((e, t) => {
			let n = this._programName(e, t), r = e.entity ? this.hass?.states[e.entity] : void 0, i = !!(e.entity && (!r || r.state === "unavailable")), a = ur(e.color), o = `vc-program-status-${t}`;
			return C`<button
              class="program"
              style=${a ? `--program-color:${a}` : ""}
              ?disabled=${this._writeBusy()}
              aria-disabled=${i ? "true" : "false"}
              aria-describedby=${i ? o : T}
              aria-label=${n}
              title=${i ? G(this.hass, "program.unavailable") : n}
              @click=${(n) => this._openProgram(e, t, n.currentTarget)}
            >
              <span class="program-icon" aria-hidden="true">
                ${e.icon ? C`<ha-icon icon=${e.icon}></ha-icon>` : lr(e.kind)}
              </span>
              <span>
                <span class="program-name">${n}</span>
                ${e.description ? C`<span class="program-description">${e.description}</span>` : T}
                ${i ? C`<span class="program-description" id=${o}>
                      ${G(this.hass, "program.unavailable")}
                    </span>` : T}
              </span>
            </button>`;
		})}
        </div>
      </section>
    `;
	}
	_programName(e, t) {
		if (e.name) return e.name;
		let n = e.entity && this.hass ? this.hass.states[e.entity] : void 0;
		return n && this.hass ? H(this.hass, n) : `${G(this.hass, "section.programs")} ${t + 1}`;
	}
	_openProgram(e, t, n) {
		if (!this.hass || !this._config || this._writeBusy()) return;
		let r = ar(this.hass, this._config, this._confirmedProgramKind);
		this._openConfirmation({
			kind: "program",
			program: e,
			index: t,
			openedActivity: r.activity,
			issues: this._programPreflight(e, r)
		}, n);
	}
	_programPreflight(e, t) {
		if (!this.hass || !this._config) return [];
		let n = [];
		if ([
			"cleaning",
			"paused",
			"returning",
			"error",
			"unavailable",
			"offline",
			"unknown"
		].includes(t.activity) && n.push({
			severity: "block",
			label: G(this.hass, "program.busy")
		}), e.entity) {
			let t = this.hass.states[e.entity];
			(!t || t.state.toLowerCase() === "unavailable") && n.push({
				severity: "block",
				label: G(this.hass, "program.unavailable")
			});
		}
		for (let t of e.requires ?? []) {
			let e = t.severity ?? "warn";
			if (e === "ignore") continue;
			let r = this._config.entities[t.condition], i = r ? this.hass.states[r] : void 0;
			if (!this._requirementMatches(i, t.expected)) {
				let r = t.message ?? G(this.hass, "program.requirement_failed", { name: i ? H(this.hass, i) : String(t.condition) });
				n.push({
					severity: e,
					label: r
				});
			}
		}
		return n;
	}
	_requirementMatches(e, t) {
		return !e || ["unknown", "unavailable"].includes(e.state.toLowerCase()) ? !1 : typeof t == "boolean" ? sn(e) === t : typeof t == "number" ? Number(e.state) === t : e.state.toLowerCase() === t.toLowerCase();
	}
	_samePreflightIssues(e, t) {
		return e.length === t.length && e.every((e, n) => e.severity === t[n]?.severity && e.label === t[n]?.label);
	}
	async _performProgram(e) {
		if (!this.hass || !this._config || this._writeBusy()) return;
		let t = this.hass, n = this._config, r = ar(t, n, this._confirmedProgramKind), i = this._programPreflight(e.program, r);
		if (!this._samePreflightIssues(e.issues, i)) {
			this._openConfirmation({
				...e,
				openedActivity: r.activity,
				issues: i
			}, this._dialogReturnFocus);
			return;
		}
		if (i.some((e) => e.severity === "block")) {
			this._openConfirmation({
				...e,
				issues: i
			}, this._dialogReturnFocus);
			return;
		}
		let a = e.program, o = this._programName(a, e.index), s = a.entity ?? `${e.index}:${o}`, c = {
			token: ++this._nextProgramToken,
			configRevision: this._configRevision,
			key: s,
			name: o,
			kind: a.kind ?? "unknown"
		};
		this._closeConfirmation(), this._programTransport = c, this._pendingProgram = c, this._notice = {
			kind: "info",
			text: G(t, "program.sent", { name: o })
		}, this._startPendingTimer(c.token);
		try {
			if (a.entity) await t.callService("button", "press", {}, { entity_id: a.entity });
			else if (a.action) {
				let e = { ...a.action };
				delete e.confirmation, an(this, e, n.entity);
			}
		} catch {
			if (this._programTransport?.token !== c.token || (this._programTransport = void 0, c.configRevision !== this._configRevision) || this._acknowledgedProgramToken === c.token) return;
			this._pendingProgram?.token === c.token && (this._clearPendingTimer(), this._pendingProgram = void 0), this._notice = {
				kind: "error",
				text: G(t, "program.failed", { name: o })
			};
			return;
		}
		this._programTransport?.token === c.token && (this._programTransport = void 0);
	}
	_startPendingTimer(e) {
		if (!this._config || !this._pendingProgram) return;
		this._clearPendingTimer();
		let t = Lt(this._config.programs.acknowledgement_timeout);
		this._pendingTimer = window.setTimeout(() => {
			if (this._pendingProgram?.token !== e) return;
			let t = this._pendingProgram;
			this._pendingProgram = void 0, this._notice = {
				kind: "info",
				text: G(this.hass, "program.unconfirmed", { name: t.name })
			}, this._pendingTimer = void 0;
		}, t);
	}
	_clearPendingTimer() {
		this._pendingTimer !== void 0 && (window.clearTimeout(this._pendingTimer), this._pendingTimer = void 0);
	}
	_programBusy() {
		return !!(this._pendingProgram || this._programTransport);
	}
	_writeBusy() {
		return this._commandBusy || this._programBusy();
	}
	_renderAlerts(e) {
		if (!this.hass || !this._config || this._config.density === "compact") return T;
		let t = this._visibleAlerts(e);
		if (t.length === 0) return T;
		let n = t.filter((e) => e.key.startsWith("maintenance:")), r = t.filter((e) => !e.key.startsWith("maintenance:"));
		return C`
      <section class="section" data-section="alerts" aria-labelledby="vc-alerts-title">
        <div class="section-heading"><h3 id="vc-alerts-title">${G(this.hass, "section.alerts")}</h3></div>
        <div class="alert-list">
          ${r.map((e) => this._renderAlert(e))}
          ${n.length > 0 ? this._renderMaintenanceAlertSummary(n) : T}
        </div>
      </section>
    `;
	}
	_renderAlert(e) {
		let t = this._alertLabel(e.key, e.label), n = e.severity === "critical" ? "mdi:alert-circle" : e.severity === "warning" ? "mdi:alert" : "mdi:information-outline";
		return C`<div
      class="alert"
      data-severity=${e.severity}
      role=${e.severity === "critical" ? "alert" : "status"}
    >
      <ha-icon class="alert-icon" icon=${n} aria-hidden="true"></ha-icon>
      <span class="alert-copy">${t}</span>
      ${e.entityId ? C`<button
            class="alert-action"
            aria-label=${`${t}: ${G(this.hass, "action.more_info")}`}
            @click=${() => W(this, e.entityId)}
          ><ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon></button>` : T}
    </div>`;
	}
	_renderMaintenanceAlertSummary(e) {
		if (!this.hass) return T;
		let t = {
			critical: 0,
			warning: 1,
			info: 2
		}, n = [...e].sort((e, n) => {
			let r = t[e.severity] - t[n.severity];
			if (r !== 0) return r;
			let i = Number(e.rawState), a = Number(n.rawState);
			return Number.isFinite(i) && Number.isFinite(a) ? i - a : 0;
		})[0], r = n.entityId ? this.hass.states[n.entityId] : void 0, i = r ? U(this.hass, r) : n.rawState, a = e.length === 1 ? n.label : G(this.hass, "maintenance.alert_summary", { count: e.length }), o = i ? e.length === 1 ? i : G(this.hass, "maintenance.most_urgent", {
			name: n.label,
			value: i
		}) : void 0;
		return C`<div
      class="alert maintenance-alert"
      data-severity=${n.severity}
      role=${n.severity === "critical" ? "alert" : "status"}
    >
      <ha-icon class="alert-icon" icon="mdi:wrench-clock" aria-hidden="true"></ha-icon>
      <span class="alert-copy">
        <span>${a}</span>
        ${o ? C`<span class="alert-detail">${o}</span>` : T}
      </span>
      ${n.entityId ? C`<button
            class="alert-action"
            aria-label=${`${n.label}: ${G(this.hass, "action.more_info")}`}
            @click=${() => W(this, n.entityId)}
          ><ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon></button>` : T}
    </div>`;
	}
	_visibleAlerts(e) {
		return this._config ? this._config.view === "dock" ? this._dockAlerts(e) : e.alerts : [];
	}
	_alertLabel(e, t) {
		let n = G(this.hass, `alert.${e}`);
		return n === `alert.${e}` ? t : n;
	}
	_dockEntityIds() {
		return this._config ? Object.values(this._config.dock.entities).flatMap((e) => typeof e == "string" ? [e] : e?.entity ? [e.entity] : []) : [];
	}
	_dockAlerts(e) {
		if (!this._config) return [];
		let t = new Set(this._dockEntityIds()), n = new Set(this._config.maintenance.items.filter((e) => e.kind?.startsWith("dock")).map((e) => e.entity)), r = {
			critical: 0,
			warning: 1,
			info: 2
		};
		return e.alerts.filter((e) => e.key.startsWith("dock_") || !!(e.entityId && (t.has(e.entityId) || n.has(e.entityId)))).sort((e, t) => r[e.severity] - r[t.severity]);
	}
	_renderDock(e) {
		if (!this.hass || !this._config) return T;
		let t = this._config.dock, n = t.entities;
		if (!Object.values(n).some(Boolean) || t.display === "hidden" && this._config.view !== "dock") return T;
		let r = e.dockActivities.includes("mop_drying"), i = e.dockActivities.some((e) => ![
			"idle",
			"error",
			"maintenance_required"
		].includes(e)), a = this._dockEntityIds().map((e) => this.hass.states[e]), o = a.some((e) => e && !["unknown", "unavailable"].includes(e.state.toLowerCase())), s = a.some((e) => e?.state.toLowerCase() === "unknown"), c = this._dockAlerts(e), l = c[0], u = c.length > 0, d = t.show_warnings_in_header && !!l, f = t.show_activity_in_header && i, ee = n.drying_remaining ? this.hass.states[n.drying_remaining] : void 0, te = d && l ? this._alertLabel(l.key, l.label) : f && r ? G(this.hass, "dock.drying") : o ? u || i ? G(this.hass, "section.dock") : G(this.hass, "dock.ready") : G(this.hass, s ? "dock.unknown" : "dock.unavailable"), p = t.display === "expanded" || this._config.view === "dock" || t.auto_expand_on_activity && i || t.auto_expand_on_warning && u, m = f && this._config.animations.enabled && this._config.animations.intensity !== "none", h = d ? "!" : f ? "≈" : o ? u || i ? "·" : "✓" : "?";
		return C`
      <section
        class="section dock-section"
        data-section="dock"
        data-view=${this._config.view}
        aria-labelledby="vc-dock-title"
      >
        <div class="section-heading"><h3 id="vc-dock-title">${G(this.hass, "section.dock")}</h3></div>
        <details class="dock-details" ?open=${p}>
          <summary class="dock-strip">
            <span class="dock-symbol" data-active=${String(m)} aria-hidden="true">⌂</span>
            <span>
              <strong>${te}</strong>
              ${f && r && ee ? C`<span class="program-description">${U(this.hass, ee)}</span>` : T}
            </span>
            <span class="dock-trailing" aria-hidden="true">
              <span>${h}</span>
              <ha-icon class="dock-chevron" icon="mdi:chevron-right"></ha-icon>
            </span>
          </summary>
          <div class="details-content">
            ${this._renderBinaryDockEntity(n.clean_water_tank)}
            ${this._renderBinaryDockEntity(n.dirty_water_tank)}
            ${this._renderBinaryDockEntity(n.cleaning_solution)}
            ${n.emptying_mode ? this._renderSelectSetting(n.emptying_mode, G(this.hass, "setting.emptying_mode"), !1) : T}
            ${n.child_lock ? this._renderChildLock(n.child_lock) : T}
          </div>
        </details>
      </section>
    `;
	}
	_renderBinaryDockEntity(e) {
		if (!this.hass) return T;
		let t = dr(e);
		if (!t) return T;
		let n = this.hass.states[t.entity];
		if (!n) return T;
		let r = sn(n), i = U(this.hass, n);
		if (t.on_is && t.on_is !== "unknown" && r !== void 0) switch (t.on_is) {
			case "ok":
				i = G(this.hass, r ? "binary.ok" : "binary.check");
				break;
			case "warning":
				i = G(this.hass, r ? "common.warning" : "binary.ok");
				break;
			case "active":
				i = G(this.hass, r ? "dock.on" : "dock.off");
				break;
			case "installed":
				i = G(this.hass, r ? "binary.installed" : "binary.missing");
				break;
			case "missing": i = G(this.hass, r ? "binary.missing" : "binary.installed");
		}
		return this._entityRow(t.name ?? H(this.hass, n), i, n.entity_id);
	}
	_renderChildLock(e) {
		if (!this.hass) return T;
		let t = this.hass.states[e];
		if (!t) return T;
		let n = sn(t) === !0;
		return C`<div class="setting-row">
      <span>${G(this.hass, "setting.child_lock")}</span>
      <button
        ?disabled=${this._writeBusy() || ["unknown", "unavailable"].includes(t.state.toLowerCase())}
        @click=${() => this._requestSwitch(e, !n, n)}
      >${n ? G(this.hass, "dock.on") : G(this.hass, "dock.off")}</button>
    </div>`;
	}
	_requestSwitch(e, t, n) {
		if (!this.hass || this._writeBusy()) return;
		let r = t ? "turn_on" : "turn_off";
		if (n) {
			this._openConfirmation({
				kind: "service",
				title: G(this.hass, "confirm.switch_title"),
				text: `${e}: ${t ? G(this.hass, "dock.on") : G(this.hass, "dock.off")}`,
				domain: "switch",
				service: r,
				entityId: e
			});
			return;
		}
		this._executeService("switch", r, e);
	}
	_renderDetails(e) {
		if (!this.hass || !this._config) return T;
		let t = this._config.entities;
		if (![
			t.last_start,
			t.last_end,
			t.vacuum_mode,
			t.mop_mode,
			t.mop_intensity,
			t.volume
		].some(Boolean)) return T;
		let n = sr.includes(e.activity);
		return C`
      <section class="section" data-section="details">
        <details ?open=${this._config.density === "detailed"}>
          <summary>${G(this.hass, "section.details")}</summary>
          <div class="details-content">
            ${t.last_start ? this._configuredEntityRow(t.last_start, G(this.hass, "metric.last_start")) : T}
            ${t.last_end ? this._configuredEntityRow(t.last_end, G(this.hass, "metric.last_end")) : T}
            ${t.vacuum_mode ? this._renderSelectSetting(t.vacuum_mode, G(this.hass, "setting.vacuum_mode"), n) : T}
            ${t.mop_mode ? this._renderSelectSetting(t.mop_mode, G(this.hass, "setting.mop_mode"), n) : T}
            ${t.mop_intensity ? this._renderSelectSetting(t.mop_intensity, G(this.hass, "setting.mop_intensity"), n) : T}
            ${t.volume ? this._renderVolume(t.volume, n) : T}
          </div>
        </details>
      </section>
    `;
	}
	_configuredEntityRow(e, t) {
		if (!this.hass) return T;
		let n = this.hass.states[e];
		return n ? this._entityRow(t, U(this.hass, n), e) : T;
	}
	_entityRow(e, t, n) {
		return C`<div class="entity-row">
      <span>${e}</span>
      <span class="entity-value">
        ${t}
        <button class="icon-action" aria-label=${G(this.hass, "action.more_info")} @click=${() => W(this, n)}>
          <ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon>
        </button>
      </span>
    </div>`;
	}
	_renderSelectSetting(e, t, n) {
		if (!this.hass) return T;
		let r = this.hass.states[e];
		if (!r) return T;
		let i = Array.isArray(r.attributes.options) ? r.attributes.options : [];
		return C`<label class="setting-row">
      <span>${t}</span>
      <select
        .value=${ot(r.state)}
        ?disabled=${n || this._writeBusy() || ["unknown", "unavailable"].includes(r.state)}
        @change=${(t) => {
			let n = t.currentTarget;
			this._setSelectOption(e, n.value, n);
		}}
      >
        ${i.map((e) => C`<option .value=${e}>${e}</option>`)}
      </select>
    </label>`;
	}
	async _setSelectOption(e, t, n) {
		let r = this.hass?.states[e]?.state;
		if (!this.hass || this._writeBusy()) {
			n && r !== void 0 && (n.value = r);
			return;
		}
		let i = this.hass, a = ++this._serviceRequestToken;
		this._commandBusy = !0;
		try {
			await i.callService("select", "select_option", { option: t }, { entity_id: e });
		} catch {
			if (a !== this._serviceRequestToken) return;
			let t = i.states[e]?.state;
			n && t !== void 0 && (n.value = t), this._notice = {
				kind: "error",
				text: G(i, "command.failed")
			};
		} finally {
			a === this._serviceRequestToken && (this._commandBusy = !1);
		}
	}
	_renderVolume(e, t) {
		if (!this.hass) return T;
		let n = this.hass.states[e];
		if (!n) return T;
		let r = Number(n.state), i = Number(n.attributes.min ?? 0), a = Number(n.attributes.max ?? 100), o = Number(n.attributes.step ?? 1);
		return [
			r,
			i,
			a,
			o
		].every(Number.isFinite) ? C`<label class="setting-row">
      <span>${G(this.hass, "setting.volume")} · ${r}</span>
      <input
        type="range"
        .value=${ot(String(r))}
        min=${String(i)}
        max=${String(a)}
        step=${String(o)}
        ?disabled=${t || this._writeBusy()}
        @change=${(t) => {
			let n = t.currentTarget;
			this._setNumberValue(e, Number(n.value), n);
		}}
      />
    </label>` : T;
	}
	async _setNumberValue(e, t, n) {
		let r = Number(this.hass?.states[e]?.state);
		if (!this.hass || this._writeBusy() || !Number.isFinite(t)) {
			n && Number.isFinite(r) && (n.value = String(r));
			return;
		}
		let i = this.hass, a = ++this._serviceRequestToken;
		this._commandBusy = !0;
		try {
			await i.callService("number", "set_value", { value: t }, { entity_id: e });
		} catch {
			if (a !== this._serviceRequestToken) return;
			let t = Number(i.states[e]?.state);
			n && Number.isFinite(t) && (n.value = String(t)), this._notice = {
				kind: "error",
				text: G(i, "command.failed")
			};
		} finally {
			a === this._serviceRequestToken && (this._commandBusy = !1);
		}
	}
	_renderMaintenance() {
		if (!this.hass || !this._config) return T;
		let e = this._config.maintenance, t = this._config.view === "dock" ? e.items.filter((e) => e.kind?.startsWith("dock")) : e.items;
		return e.display === "hidden" || t.length === 0 ? T : C`
      <section class="section" data-section="maintenance">
        <details ?open=${e.display === "expanded"}>
          <summary>${G(this.hass, "section.maintenance")}</summary>
          <div class="details-content">
            ${t.map((e) => this._renderMaintenanceItem(e))}
          </div>
        </details>
      </section>
    `;
	}
	_renderMaintenanceItem(e) {
		if (!this.hass || !this._config) return T;
		let t = this.hass.states[e.entity];
		if (!t) return T;
		let n = Number(t.state), r = e.warning_below ?? this._config.maintenance.defaults.warning_below ?? 20, i = e.critical_below ?? this._config.maintenance.defaults.critical_below ?? 5, a = Number.isFinite(n) ? n <= i ? "var(--vc-error)" : n <= r ? "var(--vc-warning)" : "var(--vc-success)" : "var(--secondary-text-color)", o = Number.isFinite(n) && t.attributes.unit_of_measurement === "%" ? Math.min(100, Math.max(0, n)) : void 0, s = e.name ?? H(this.hass, t);
		return C`<div class="entity-row">
      <span>${s}</span>
      <span class="entity-value maintenance-value">
        ${U(this.hass, t)}
        ${o === void 0 ? T : C`<span class="maintenance-bar" aria-hidden="true"><span style=${`--remaining:${o}%;--bar-color:${a}`}></span></span>`}
        <button
          aria-label=${`${s}: ${G(this.hass, "action.more_info")}`}
          @click=${() => W(this, e.entity)}
        >${"…"}</button>
      </span>
    </div>`;
	}
	_renderMap() {
		if (!this.hass || !this._config?.entities.map) return T;
		let e = this.hass.states[this._config.entities.map];
		if (!e) return T;
		let t = on(this.hass, e);
		return t ? C`
      <section class="section" data-section="map">
        <details ?open=${this._mapOpen} @toggle=${this._handleMapToggle}>
          <summary>${G(this.hass, "section.map")}</summary>
          ${this._mapOpen ? C`<div class="details-content">
                <img class="map-image" src=${t} loading="lazy" decoding="async" alt=${H(this.hass, e)} />
              </div>` : T}
        </details>
      </section>
    ` : T;
	}
	_handleMapToggle(e) {
		this._mapOpen = e.currentTarget.open;
	}
	_renderDiagnostics() {
		if (!this.hass || !this._config) return T;
		let e = this._config.diagnostics;
		return e.display === "hidden" || e.items.length === 0 ? T : C`
      <section class="section" data-section="diagnostics">
        <details ?open=${e.display === "expanded"}>
          <summary>${G(this.hass, "section.diagnostics")}</summary>
          <div class="details-content">
            ${e.items.map((e) => {
			let t = this.hass?.states[e.entity];
			if (!t || !this.hass) return T;
			let n = e.entity.startsWith("switch."), r = e.name ?? H(this.hass, t), i = sn(t) !== !0;
			return C`<div class="entity-row">
                <span class="diagnostic-copy">
                  <span>${r}</span>
                  <span class="program-description">${e.entity}</span>
                  <span class="program-description">
                    ${G(this.hass, "diagnostic.raw_state")}: ${t.state}
                    · ${G(this.hass, "diagnostic.last_changed")}:
                    <time datetime=${t.last_changed}>${t.last_changed}</time>
                  </span>
                </span>
                <span class="entity-value">
                  ${U(this.hass, t)}
                  ${n ? C`<button
                        ?disabled=${this._writeBusy() || ["unknown", "unavailable"].includes(t.state.toLowerCase())}
                        aria-label=${G(this.hass, "diagnostic.switch_aria", {
				name: r,
				action: G(this.hass, i ? "action.turn_on" : "action.turn_off")
			})}
                        @click=${() => this._requestDiagnosticSwitch(e.entity, i, e.confirmation === "always")}
                      >↕</button>` : C`<button class="icon-action" aria-label=${G(this.hass, "action.more_info")} @click=${() => W(this, e.entity)}>
                        <ha-icon icon="mdi:information-outline" aria-hidden="true"></ha-icon>
                      </button>`}
                </span>
              </div>`;
		})}
          </div>
        </details>
      </section>
    `;
	}
	_requestDiagnosticSwitch(e, t, n) {
		if (!this.hass || this._writeBusy()) return;
		let r = t ? "turn_on" : "turn_off";
		n || !t ? this._openConfirmation({
			kind: "service",
			title: G(this.hass, "confirm.switch_title"),
			text: `${e}: ${t ? G(this.hass, "dock.on") : G(this.hass, "dock.off")}`,
			domain: "switch",
			service: r,
			entityId: e
		}) : this._executeService("switch", r, e);
	}
	_openConfirmation(e, t) {
		let n = this.shadowRoot?.activeElement;
		this._dialogReturnFocus = t ?? this._dialogReturnFocus ?? (n instanceof HTMLElement ? n : void 0), this._clearConfirmationArmTimer();
		let r = ++this._confirmationSequence;
		this._confirmationArmed = !1, this._confirmation = e, this._confirmationArmTimer = window.setTimeout(() => {
			r !== this._confirmationSequence || !this._confirmation || (this._confirmationArmTimer = void 0, this._confirmationArmed = !0);
		}, cr);
	}
	_clearConfirmationArmTimer() {
		this._confirmationArmTimer !== void 0 && (window.clearTimeout(this._confirmationArmTimer), this._confirmationArmTimer = void 0);
	}
	_setBackgroundInert(e) {
		for (let t of this.renderRoot.querySelectorAll(".shell > :not(.dialog-backdrop)")) t.toggleAttribute("inert", e);
	}
	_renderConfirmation() {
		if (!this.hass || !this._confirmation) return T;
		let e = this._confirmation, t = e.kind === "program", n = t ? this._programName(e.program, e.index) : "", r = this._config ? H(this.hass, this.hass.states[this._config.entity]) || this._config.name || this._config.entity : "", i = t ? e.program.confirmation?.title ?? G(this.hass, "program.confirm_title") : e.title, a = t ? e.program.confirmation?.text ?? G(this.hass, "program.confirm_text", {
			name: n,
			robot: r
		}) : e.text, o = t && e.issues.some((e) => e.severity === "block"), s = t ? e.program.confirmation?.confirm_text ?? G(this.hass, "action.confirm") : G(this.hass, "action.confirm"), c = t ? e.program.confirmation?.dismiss_text ?? G(this.hass, "action.cancel") : G(this.hass, "action.cancel");
		return C`<div
      class="dialog-backdrop"
      @click=${this._onBackdropClick}
      @keydown=${this._onDialogKeydown}
    >
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vc-dialog-title"
        aria-describedby="vc-dialog-text"
        tabindex="-1"
      >
        <h3 id="vc-dialog-title">${i}</h3>
        <p id="vc-dialog-text">${a}</p>
        ${t && e.issues.length > 0 ? C`<ul class="dialog-issues">
              ${e.issues.map((e) => C`<li><strong>${e.severity === "block" ? "!" : "⚠"}</strong> ${e.label}</li>`)}
            </ul>` : T}
        <div class="dialog-actions">
          <button data-dialog-cancel @click=${this._closeConfirmation}>${c}</button>
          <button
            class=${t ? "primary" : e.service === "stop" ? "danger" : "primary"}
            data-dialog-primary
            ?disabled=${!this._confirmationArmed || o || this._commandBusy || this._programBusy()}
            @click=${this._confirmCurrent}
          >${s}</button>
        </div>
      </div>
    </div>`;
	}
};
//#endregion
//#region src/index.ts
customElements.get("vacuum-control-card") || customElements.define("vacuum-control-card", fr);
var pr = window;
pr.customCards = pr.customCards ?? [], pr.customCards.some((e) => e.type === "vacuum-control-card") || pr.customCards.push({
	type: "vacuum-control-card",
	name: "Vacuum Control Card",
	description: "Safe and elegant controls for vacuum and mop robots with optional dock status.",
	preview: !0,
	getEntitySuggestion: (e, t) => t.startsWith("vacuum.") ? { config: {
		type: "custom:vacuum-control-card",
		entity: t
	} } : null
});
//#endregion
export { fr as VacuumCard, $e as VacuumCardEditor, ar as buildViewModel, En as computeLayoutProfile, tn as normalizeConfig };
