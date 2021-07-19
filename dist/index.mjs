function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}

// Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.
let is_hydrating = false;
function start_hydrating() {
    is_hydrating = true;
}
function end_hydrating() {
    is_hydrating = false;
}
function upper_bound(low, high, key, value) {
    // Return first index of value larger than input value in the range [low, high)
    while (low < high) {
        const mid = low + ((high - low) >> 1);
        if (key(mid) <= value) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return low;
}
function init_hydrate(target) {
    if (target.hydrate_init)
        return;
    target.hydrate_init = true;
    // We know that all children have claim_order values since the unclaimed have been detached
    const children = target.childNodes;
    /*
    * Reorder claimed children optimally.
    * We can reorder claimed children optimally by finding the longest subsequence of
    * nodes that are already claimed in order and only moving the rest. The longest
    * subsequence subsequence of nodes that are claimed in order can be found by
    * computing the longest increasing subsequence of .claim_order values.
    *
    * This algorithm is optimal in generating the least amount of reorder operations
    * possible.
    *
    * Proof:
    * We know that, given a set of reordering operations, the nodes that do not move
    * always form an increasing subsequence, since they do not move among each other
    * meaning that they must be already ordered among each other. Thus, the maximal
    * set of nodes that do not move form a longest increasing subsequence.
    */
    // Compute longest increasing subsequence
    // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
    const m = new Int32Array(children.length + 1);
    // Predecessor indices + 1
    const p = new Int32Array(children.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children.length; i++) {
        const current = children[i].claim_order;
        // Find the largest subsequence length such that it ends in a value less than our current value
        // upper_bound returns first greater value, so we subtract one
        const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
        p[i] = m[seqLen] + 1;
        const newLen = seqLen + 1;
        // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
        m[newLen] = i;
        longest = Math.max(newLen, longest);
    }
    // The longest increasing subsequence of nodes (initially reversed)
    const lis = [];
    // The rest of the nodes, nodes that will be moved
    const toMove = [];
    let last = children.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
        lis.push(children[cur - 1]);
        for (; last >= cur; last--) {
            toMove.push(children[last]);
        }
        last--;
    }
    for (; last >= 0; last--) {
        toMove.push(children[last]);
    }
    lis.reverse();
    // We sort the nodes being moved to guarantee that their insertion order matches the claim order
    toMove.sort((a, b) => a.claim_order - b.claim_order);
    // Finally, we move the nodes
    for (let i = 0, j = 0; i < toMove.length; i++) {
        while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
            j++;
        }
        const anchor = j < lis.length ? lis[j] : null;
        target.insertBefore(toMove[i], anchor);
    }
}
function append(target, node) {
    if (is_hydrating) {
        init_hydrate(target);
        if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
            target.actual_end_child = target.firstChild;
        }
        if (node !== target.actual_end_child) {
            target.insertBefore(node, target.actual_end_child);
        }
        else {
            target.actual_end_child = node.nextSibling;
        }
    }
    else if (node.parentNode !== target) {
        target.appendChild(node);
    }
}
function insert(target, node, anchor) {
    if (is_hydrating && !anchor) {
        append(target, node);
    }
    else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
        target.insertBefore(node, anchor || null);
    }
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
        result[attribute.name] = attribute.value;
    }
    return result;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            start_hydrating();
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        end_hydrating();
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            const { on_mount } = this.$$;
            this.$$.on_disconnect = on_mount.map(run).filter(is_function);
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        disconnectedCallback() {
            run_all(this.$$.on_disconnect);
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    };
}

/*
This file was generated directly by 'https://github.com/Swiftaff/svelte-iconify-svg' 
or via the rollup plugin 'https://github.com/Swiftaff/rollup-plugin-iconify-svg'.
*/

var icons = {
  "fluent:chevron-down-12-filled": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 12 12">
<g fill="none"><path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 0 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z" fill="currentColor"/></g>
<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />
</svg>`,
    "fluent:chevron-right-12-filled": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 12 12">
<g fill="none"><path d="M4.47 2.22a.75.75 0 0 0 0 1.06L7.19 6L4.47 8.72a.75.75 0 0 0 1.06 1.06l3.25-3.25a.75.75 0 0 0 0-1.06L5.53 2.22a.75.75 0 0 0-1.06 0z" fill="currentColor"/></g>
<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />
</svg>`,
    "fluent:chevron-up-12-filled": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 12 12">
<g fill="none"><path d="M2.22 7.53a.75.75 0 0 0 1.06 0L6 4.81l2.72 2.72a.75.75 0 0 0 1.06-1.06L6.53 3.22a.75.75 0 0 0-1.06 0L2.22 6.47a.75.75 0 0 0 0 1.06z" fill="currentColor"/></g>
<rect x="0" y="0" width="12" height="12" fill="rgba(0, 0, 0, 0)" />
</svg>`,
    };

/* src/TabButton.svelte generated by Svelte v3.38.3 */

function create_else_block$3(ctx) {
	let t;
	let span;
	let raw_value = icons["fluent:chevron-up-12-filled"] + "";

	return {
		c() {
			t = text("Show\n        ");
			span = element("span");
			attr(span, "class", "smaller");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, span, anchor);
			span.innerHTML = raw_value;
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(span);
		}
	};
}

// (17:4) {#if toggle}
function create_if_block$5(ctx) {
	let t;
	let span;
	let raw_value = icons["fluent:chevron-down-12-filled"] + "";

	return {
		c() {
			t = text("Hide\n        ");
			span = element("span");
			attr(span, "class", "smaller");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, span, anchor);
			span.innerHTML = raw_value;
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(span);
		}
	};
}

function create_fragment$6(ctx) {
	let div;
	let div_class_value;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*toggle*/ ctx[0]) return create_if_block$5;
		return create_else_block$3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			this.c = noop;

			attr(div, "class", div_class_value = (/*toggle*/ ctx[0]
			? "toggle toggleShow"
			: "toggle toggleHide") + " toggle" + /*tabposition*/ ctx[1] + (/*fade*/ ctx[2]
			? /*hovering*/ ctx[3] ? " noFade" : " fade"
			: " noFade"));
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);

			if (!mounted) {
				dispose = listen(div, "mousedown", function () {
					if (is_function(/*doToggle*/ ctx[4])) /*doToggle*/ ctx[4].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}

			if (dirty & /*toggle, tabposition, fade, hovering*/ 15 && div_class_value !== (div_class_value = (/*toggle*/ ctx[0]
			? "toggle toggleShow"
			: "toggle toggleHide") + " toggle" + /*tabposition*/ ctx[1] + (/*fade*/ ctx[2]
			? /*hovering*/ ctx[3] ? " noFade" : " fade"
			: " noFade"))) {
				attr(div, "class", div_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { toggle } = $$props;
	let { tabposition } = $$props;
	let { fade } = $$props;
	let { hovering } = $$props;
	let { doToggle } = $$props;

	$$self.$$set = $$props => {
		if ("toggle" in $$props) $$invalidate(0, toggle = $$props.toggle);
		if ("tabposition" in $$props) $$invalidate(1, tabposition = $$props.tabposition);
		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
		if ("doToggle" in $$props) $$invalidate(4, doToggle = $$props.doToggle);
	};

	return [toggle, tabposition, fade, hovering, doToggle];
}

class TabButton extends SvelteElement {
	constructor(options) {
		super();
		

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$6,
			create_fragment$6,
			safe_not_equal,
			{
				toggle: 0,
				tabposition: 1,
				fade: 2,
				hovering: 3,
				doToggle: 4
			}
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["toggle", "tabposition", "fade", "hovering", "doToggle"];
	}

	get toggle() {
		return this.$$.ctx[0];
	}

	set toggle(toggle) {
		this.$set({ toggle });
		flush();
	}

	get tabposition() {
		return this.$$.ctx[1];
	}

	set tabposition(tabposition) {
		this.$set({ tabposition });
		flush();
	}

	get fade() {
		return this.$$.ctx[2];
	}

	set fade(fade) {
		this.$set({ fade });
		flush();
	}

	get hovering() {
		return this.$$.ctx[3];
	}

	set hovering(hovering) {
		this.$set({ hovering });
		flush();
	}

	get doToggle() {
		return this.$$.ctx[4];
	}

	set doToggle(doToggle) {
		this.$set({ doToggle });
		flush();
	}
}

customElements.define("svelte-object-explorer-tab-button", TabButton);

/* src/ResetButton.svelte generated by Svelte v3.38.3 */

function create_fragment$5(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Reset";
			this.c = noop;
			attr(button, "class", "reset");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "mouseup", function () {
					if (is_function(/*reset*/ ctx[0])) /*reset*/ ctx[0].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { reset } = $$props;

	$$self.$$set = $$props => {
		if ("reset" in $$props) $$invalidate(0, reset = $$props.reset);
	};

	return [reset];
}

class ResetButton extends SvelteElement {
	constructor(options) {
		super();
		

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$5,
			create_fragment$5,
			safe_not_equal,
			{ reset: 0 }
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["reset"];
	}

	get reset() {
		return this.$$.ctx[0];
	}

	set reset(reset) {
		this.$set({ reset });
		flush();
	}
}

customElements.define("svelte-object-explorer-reset-button", ResetButton);

/* src/PauseButton.svelte generated by Svelte v3.38.3 */

function create_else_block$2(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Pause";
			attr(button, "class", "pause");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "mouseup", function () {
					if (is_function(/*pause*/ ctx[1])) /*pause*/ ctx[1].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

// (9:0) {#if isPaused}
function create_if_block$4(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "un-Pause";
			attr(button, "class", "pause");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "mouseup", function () {
					if (is_function(/*unpause*/ ctx[2])) /*unpause*/ ctx[2].apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$4(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*isPaused*/ ctx[0]) return create_if_block$4;
		return create_else_block$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
			this.c = noop;
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { isPaused } = $$props;
	let { pause } = $$props;
	let { unpause } = $$props;

	$$self.$$set = $$props => {
		if ("isPaused" in $$props) $$invalidate(0, isPaused = $$props.isPaused);
		if ("pause" in $$props) $$invalidate(1, pause = $$props.pause);
		if ("unpause" in $$props) $$invalidate(2, unpause = $$props.unpause);
	};

	return [isPaused, pause, unpause];
}

class PauseButton extends SvelteElement {
	constructor(options) {
		super();
		

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$4,
			create_fragment$4,
			safe_not_equal,
			{ isPaused: 0, pause: 1, unpause: 2 }
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["isPaused", "pause", "unpause"];
	}

	get isPaused() {
		return this.$$.ctx[0];
	}

	set isPaused(isPaused) {
		this.$set({ isPaused });
		flush();
	}

	get pause() {
		return this.$$.ctx[1];
	}

	set pause(pause) {
		this.$set({ pause });
		flush();
	}

	get unpause() {
		return this.$$.ctx[2];
	}

	set unpause(unpause) {
		this.$set({ unpause });
		flush();
	}
}

customElements.define("svelte-object-explorer-pause-button", PauseButton);

/* src/CacheDisplay.svelte generated by Svelte v3.38.3 */

function create_if_block$3(ctx) {
	let t0;
	let span0;
	let t1_value = /*cache*/ ctx[0].dataChanges + "";
	let t1;
	let t2;
	let span1;
	let t3_value = /*cache*/ ctx[0].viewChanges + "";
	let t3;
	let t4;
	let t5;
	let br;
	let t6;
	let span2;
	let t7_value = /*cache*/ ctx[0].formatted + "";
	let t7;
	let t8;
	let if_block = /*ratelimit*/ ctx[1] !== /*ratelimitDefault*/ ctx[2] && create_if_block_1$3(ctx);

	return {
		c() {
			t0 = text("Data Changes(");
			span0 = element("span");
			t1 = text(t1_value);
			t2 = text(") View Changes(");
			span1 = element("span");
			t3 = text(t3_value);
			t4 = text(") ");
			if (if_block) if_block.c();
			t5 = space();
			br = element("br");
			t6 = text("\n    Last Updated(");
			span2 = element("span");
			t7 = text(t7_value);
			t8 = text(")");
			attr(span0, "class", "cache_data");
			attr(span1, "class", "cache_view");
			attr(span2, "class", "cache_last");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, span0, anchor);
			append(span0, t1);
			insert(target, t2, anchor);
			insert(target, span1, anchor);
			append(span1, t3);
			insert(target, t4, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, t5, anchor);
			insert(target, br, anchor);
			insert(target, t6, anchor);
			insert(target, span2, anchor);
			append(span2, t7);
			insert(target, t8, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*cache*/ 1 && t1_value !== (t1_value = /*cache*/ ctx[0].dataChanges + "")) set_data(t1, t1_value);
			if (dirty & /*cache*/ 1 && t3_value !== (t3_value = /*cache*/ ctx[0].viewChanges + "")) set_data(t3, t3_value);

			if (/*ratelimit*/ ctx[1] !== /*ratelimitDefault*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1$3(ctx);
					if_block.c();
					if_block.m(t5.parentNode, t5);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*cache*/ 1 && t7_value !== (t7_value = /*cache*/ ctx[0].formatted + "")) set_data(t7, t7_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(span0);
			if (detaching) detach(t2);
			if (detaching) detach(span1);
			if (detaching) detach(t4);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(t5);
			if (detaching) detach(br);
			if (detaching) detach(t6);
			if (detaching) detach(span2);
			if (detaching) detach(t8);
		}
	};
}

// (12:7) {#if ratelimit !== ratelimitDefault}
function create_if_block_1$3(ctx) {
	let t0;
	let span;
	let t1;
	let t2;

	return {
		c() {
			t0 = text("Rate Limited: ");
			span = element("span");
			t1 = text(/*ratelimit*/ ctx[1]);
			t2 = text("ms");
			attr(span, "class", "cache_ratelimit");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, span, anchor);
			append(span, t1);
			insert(target, t2, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*ratelimit*/ 2) set_data(t1, /*ratelimit*/ ctx[1]);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(span);
			if (detaching) detach(t2);
		}
	};
}

function create_fragment$3(ctx) {
	let if_block_anchor;
	let if_block = /*cache*/ ctx[0] && /*cache*/ ctx[0].dataChanges && /*cache*/ ctx[0].viewChanges && /*cache*/ ctx[0].formatted && create_if_block$3(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.c = noop;
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*cache*/ ctx[0] && /*cache*/ ctx[0].dataChanges && /*cache*/ ctx[0].viewChanges && /*cache*/ ctx[0].formatted) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { cache } = $$props;
	let { ratelimit } = $$props;
	let { ratelimitDefault } = $$props;

	$$self.$$set = $$props => {
		if ("cache" in $$props) $$invalidate(0, cache = $$props.cache);
		if ("ratelimit" in $$props) $$invalidate(1, ratelimit = $$props.ratelimit);
		if ("ratelimitDefault" in $$props) $$invalidate(2, ratelimitDefault = $$props.ratelimitDefault);
	};

	return [cache, ratelimit, ratelimitDefault];
}

class CacheDisplay extends SvelteElement {
	constructor(options) {
		super();

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$3,
			create_fragment$3,
			safe_not_equal,
			{
				cache: 0,
				ratelimit: 1,
				ratelimitDefault: 2
			}
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["cache", "ratelimit", "ratelimitDefault"];
	}

	get cache() {
		return this.$$.ctx[0];
	}

	set cache(cache) {
		this.$set({ cache });
		flush();
	}

	get ratelimit() {
		return this.$$.ctx[1];
	}

	set ratelimit(ratelimit) {
		this.$set({ ratelimit });
		flush();
	}

	get ratelimitDefault() {
		return this.$$.ctx[2];
	}

	set ratelimitDefault(ratelimitDefault) {
		this.$set({ ratelimitDefault });
		flush();
	}
}

customElements.define("svelte-object-explorer-cache-display", CacheDisplay);

/* src/ChevronButtons.svelte generated by Svelte v3.38.3 */

function create_if_block$2(ctx) {
	let if_block_anchor;
	let if_block = /*row*/ ctx[0].expandable && create_if_block_1$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*row*/ ctx[0].expandable) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (12:4) {#if row.expandable}
function create_if_block_1$2(ctx) {
	let show_if;
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (show_if == null || dirty & /*rowsToShow, row*/ 3) show_if = !!/*rowsToShow*/ ctx[1].includes(/*row*/ ctx[0].indexRef);
		if (show_if) return create_if_block_2$1;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx, -1);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (17:8) {:else}
function create_else_block$1(ctx) {
	let span;
	let raw_value = icons["fluent:chevron-right-12-filled"] + "";
	let mounted;
	let dispose;

	return {
		c() {
			span = element("span");
			attr(span, "class", "smallest dataArrow");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			span.innerHTML = raw_value;

			if (!mounted) {
				dispose = listen(span, "mousedown", /*mousedown_handler_1*/ ctx[5]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(span);
			mounted = false;
			dispose();
		}
	};
}

// (13:8) {#if rowsToShow.includes(row.indexRef)}
function create_if_block_2$1(ctx) {
	let span;
	let raw_value = icons["fluent:chevron-down-12-filled"] + "";
	let mounted;
	let dispose;

	return {
		c() {
			span = element("span");
			attr(span, "class", "smallest white dataArrow");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			span.innerHTML = raw_value;

			if (!mounted) {
				dispose = listen(span, "mousedown", /*mousedown_handler*/ ctx[4]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(span);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$2(ctx) {
	let if_block_anchor;
	let if_block = /*row*/ ctx[0] && create_if_block$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.c = noop;
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*row*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { row } = $$props;
	let { rowsToShow } = $$props;
	let { rowContract } = $$props;
	let { rowExpand } = $$props;
	const mousedown_handler = () => rowContract(row.indexRef);
	const mousedown_handler_1 = () => rowExpand(row.indexRef);

	$$self.$$set = $$props => {
		if ("row" in $$props) $$invalidate(0, row = $$props.row);
		if ("rowsToShow" in $$props) $$invalidate(1, rowsToShow = $$props.rowsToShow);
		if ("rowContract" in $$props) $$invalidate(2, rowContract = $$props.rowContract);
		if ("rowExpand" in $$props) $$invalidate(3, rowExpand = $$props.rowExpand);
	};

	return [
		row,
		rowsToShow,
		rowContract,
		rowExpand,
		mousedown_handler,
		mousedown_handler_1
	];
}

class ChevronButtons extends SvelteElement {
	constructor(options) {
		super();
		

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$2,
			create_fragment$2,
			safe_not_equal,
			{
				row: 0,
				rowsToShow: 1,
				rowContract: 2,
				rowExpand: 3
			}
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["row", "rowsToShow", "rowContract", "rowExpand"];
	}

	get row() {
		return this.$$.ctx[0];
	}

	set row(row) {
		this.$set({ row });
		flush();
	}

	get rowsToShow() {
		return this.$$.ctx[1];
	}

	set rowsToShow(rowsToShow) {
		this.$set({ rowsToShow });
		flush();
	}

	get rowContract() {
		return this.$$.ctx[2];
	}

	set rowContract(rowContract) {
		this.$set({ rowContract });
		flush();
	}

	get rowExpand() {
		return this.$$.ctx[3];
	}

	set rowExpand(rowExpand) {
		this.$set({ rowExpand });
		flush();
	}
}

customElements.define("svelte-object-explorer-chevron-buttons", ChevronButtons);

/* src/RowText.svelte generated by Svelte v3.38.3 */

function create_if_block$1(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*row*/ ctx[0].type === "Tag") return create_if_block_1$1;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (11:4) {:else}
function create_else_block(ctx) {
	let span;
	let t0;
	let t1;

	function select_block_type_1(ctx, dirty) {
		if (/*isExpanded*/ ctx[1]) return create_if_block_4;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*row*/ ctx[0].type && /*row*/ ctx[0].type !== "ARRAY+OBJECT" && /*row*/ ctx[0].type !== "ARRAY+SUB_ARRAY" && create_if_block_3(ctx);
	let if_block2 = /*row*/ ctx[0].len && create_if_block_2(ctx);

	return {
		c() {
			span = element("span");
			if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
		},
		m(target, anchor) {
			insert(target, span, anchor);
			if_block0.m(span, null);
			append(span, t0);
			if (if_block1) if_block1.m(span, null);
			append(span, t1);
			if (if_block2) if_block2.m(span, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(span, t0);
				}
			}

			if (/*row*/ ctx[0].type && /*row*/ ctx[0].type !== "ARRAY+OBJECT" && /*row*/ ctx[0].type !== "ARRAY+SUB_ARRAY") {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_3(ctx);
					if_block1.c();
					if_block1.m(span, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*row*/ ctx[0].len) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_2(ctx);
					if_block2.c();
					if_block2.m(span, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		d(detaching) {
			if (detaching) detach(span);
			if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
		}
	};
}

// (9:4) {#if row.type === "Tag"}
function create_if_block_1$1(ctx) {
	let t_value = /*row*/ ctx[0].tag + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t_value !== (t_value = /*row*/ ctx[0].tag + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (18:12) {:else}
function create_else_block_1(ctx) {
	let t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "";
	let t0;
	let t1;
	let span;
	let t2_value = /*row*/ ctx[0].val + "";
	let t2;
	let if_block2_anchor;
	let if_block0 = "key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "" && create_if_block_8(ctx);
	let if_block1 = /*row*/ ctx[0].type === "string" && create_if_block_7();
	let if_block2 = /*row*/ ctx[0].is_last_multiline && (!/*row*/ ctx[0].type || /*row*/ ctx[0].type === "string") && create_if_block_6();

	return {
		c() {
			t0 = text(t0_value);
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			span = element("span");
			t2 = text(t2_value);
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
			attr(span, "class", "val");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t1, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, span, anchor);
			append(span, t2);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, if_block2_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t0_value !== (t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "")) set_data(t0, t0_value);

			if ("key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "") {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_8(ctx);
					if_block0.c();
					if_block0.m(t1.parentNode, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*row*/ ctx[0].type === "string") {
				if (if_block1) ; else {
					if_block1 = create_if_block_7();
					if_block1.c();
					if_block1.m(span.parentNode, span);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*row*/ 1 && t2_value !== (t2_value = /*row*/ ctx[0].val + "")) set_data(t2, t2_value);

			if (/*row*/ ctx[0].is_last_multiline && (!/*row*/ ctx[0].type || /*row*/ ctx[0].type === "string")) {
				if (if_block2) ; else {
					if_block2 = create_if_block_6();
					if_block2.c();
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t1);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(span);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach(if_block2_anchor);
		}
	};
}

// (13:13) {#if isExpanded}
function create_if_block_4(ctx) {
	let t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "";
	let t0;
	let t1;
	let span;
	let t2_value = /*row*/ ctx[0].val.substring(0, /*row*/ ctx[0].val.length - /*row*/ ctx[0].bracket) + "";
	let t2;
	let if_block = "key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "" && create_if_block_5(ctx);

	return {
		c() {
			t0 = text(t0_value);
			if (if_block) if_block.c();
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			attr(span, "class", "val");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, t1, anchor);
			insert(target, span, anchor);
			append(span, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t0_value !== (t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "")) set_data(t0, t0_value);

			if ("key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "") {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_5(ctx);
					if_block.c();
					if_block.m(t1.parentNode, t1);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*row*/ 1 && t2_value !== (t2_value = /*row*/ ctx[0].val.substring(0, /*row*/ ctx[0].val.length - /*row*/ ctx[0].bracket) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(t1);
			if (detaching) detach(span);
		}
	};
}

// (18:43) {#if "key" in row && row.key !== ""}
function create_if_block_8(ctx) {
	let span;
	let t0_value = /*row*/ ctx[0].key + "";
	let t0;
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(":");
			attr(span, "class", "key");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t0_value !== (t0_value = /*row*/ ctx[0].key + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) detach(span);
			if (detaching) detach(t1);
		}
	};
}

// (19:16) {#if row.type === "string"}
function create_if_block_7(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "\"";
			attr(span, "class", "white");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (20:17) {#if row.is_last_multiline && (!row.type || row.type === "string")}
function create_if_block_6(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "\"";
			attr(span, "class", "white");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (13:53) {#if "key" in row && row.key !== ""}
function create_if_block_5(ctx) {
	let span;
	let t0_value = /*row*/ ctx[0].key + "";
	let t0;
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(":");
			attr(span, "class", "key");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t0_value !== (t0_value = /*row*/ ctx[0].key + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) detach(span);
			if (detaching) detach(t1);
		}
	};
}

// (22:12) {#if row.type && row.type !== "ARRAY+OBJECT" && row.type !== "ARRAY+SUB_ARRAY"}
function create_if_block_3(ctx) {
	let span;
	let t_value = /*row*/ ctx[0].type + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "type");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t_value !== (t_value = /*row*/ ctx[0].type + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (25:12) {#if row.len}
function create_if_block_2(ctx) {
	let span;
	let t0;
	let t1_value = /*row*/ ctx[0].len + "";
	let t1;
	let t2;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t0 = text("(");
			t1 = text(t1_value);
			t2 = text(")");
			attr(span, "class", span_class_value = "len" + (/*isExpanded*/ ctx[1] ? " grey" : ""));
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
			append(span, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*row*/ 1 && t1_value !== (t1_value = /*row*/ ctx[0].len + "")) set_data(t1, t1_value);

			if (dirty & /*isExpanded*/ 2 && span_class_value !== (span_class_value = "len" + (/*isExpanded*/ ctx[1] ? " grey" : ""))) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$1(ctx) {
	let if_block_anchor;
	let if_block = /*row*/ ctx[0] && create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.c = noop;
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*row*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { row } = $$props;
	let { isExpanded = false } = $$props;

	$$self.$$set = $$props => {
		if ("row" in $$props) $$invalidate(0, row = $$props.row);
		if ("isExpanded" in $$props) $$invalidate(1, isExpanded = $$props.isExpanded);
	};

	return [row, isExpanded];
}

class RowText extends SvelteElement {
	constructor(options) {
		super();
		

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{ row: 0, isExpanded: 1 }
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["row", "isExpanded"];
	}

	get row() {
		return this.$$.ctx[0];
	}

	set row(row) {
		this.$set({ row });
		flush();
	}

	get isExpanded() {
		return this.$$.ctx[1];
	}

	set isExpanded(isExpanded) {
		this.$set({ isExpanded });
		flush();
	}
}

customElements.define("svelte-object-explorer-row-text", RowText);

function domParser(node) {
    // parses the dom from body downwards into a simplified ast, e.g.
    // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }
    //console.log("NODE", node);
    let html = node || document.body;
    //console.log("html", html);
    let arr = getTag(html);
    //console.log("arr", arr);

    function getTag(el) {
        //console.log("getTag", el.tagName);
        if (
            el &&
            el.nodeName &&
            el.nodeName !== "SCRIPT" &&
            el.nodeName !== "SVELTE-OBJECT-EXPLORER" &&
            (!el.className || (el.className && !el.className.includes("svelte-object-explorer-wrapper ")))
        ) {
            const textContent = el.nodeName === "#text" ? el.nodeValue : "";
            const svelteExplorerTag = isSvelteExplorerTag(el) ? el.dataset["svelteExplorerTag"] : el.nodeName;
            return textContent
                ? textContent
                : {
                      class: el.className,
                      "svelte-explorer-tag": svelteExplorerTag,
                      children:
                          isSvelteExplorerTag(el) &&
                          svelteExplorerTag.substring(0, 3) !== "#if" &&
                          svelteExplorerTag.substring(0, 5) !== "#each" &&
                          svelteExplorerTag.substring(0, 6) !== "#await"
                              ? []
                              : getChildren(el),
                      textContent,
                  };
        } else {
            return null;
        }
    }

    function isSvelteExplorerTag(el) {
        return el.dataset && el.dataset["svelteExplorerTag"];
    }

    function getChildren(el) {
        const removeUnecessaryItems = (t) => t !== null;
        return [...el.childNodes].map(getTag).filter(removeUnecessaryItems);
    }
    return arr;
}

var lib = { domParser };

const indentSpaces = 2;
const max_array_length = 10;
const max_line_length = 38;

function convertObjectToArrayOfOutputPanelRows({ key, val }) {
    let arr = [];
    // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional), len(optional)}]
    let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
    appendRowsByType(row_settings, arr);
    return arr;
}

function appendRowsByType(row_settings, arr) {
    const type = getTypeName(row_settings.val, row_settings.type, row_settings.key);
    const simpleTypes = ["string", "number", "boolean", "null", "undefined"];
    const new_settings = { ...row_settings, type };
    const type_matcher = {
        object: appendRowsForObject,
        array: appendRowsForArray,
        "ARRAY+": appendRowsForArrayLong, //raw long array, before being converted to object
        "ARRAY+OBJECT": appendRowsForArrayLongObject, //after being converted to object
        "ARRAY+SUB_ARRAY": appendRowsForArrayLongSubArray,
        symbol: appendRowForSymbol,
        function: appendRowsForFunction,
        HTML: appendRowsForSvelteExplorerTag,
        Node: appendRowsForDomNode,
    };
    if (simpleTypes.includes(type)) appendRowForSimpleTypes(new_settings, arr);
    if (type in type_matcher) type_matcher[type](new_settings, arr);
}

function getTypeName(value, type, key) {
    return type || getNullOrOtherType(value);

    function getNullOrOtherType(value) {
        return value === null ? "null" : getObjectOrStandardType(value);
    }

    function getObjectOrStandardType(value) {
        return typeof value === "object" ? getArrayOrObject(value) : typeof value;
    }

    function getArrayOrObject(value) {
        return Array.isArray(value) ? getArrayOrLongArray(value) : getObjectOrSpecialObject(value);
    }

    function getArrayOrLongArray(value) {
        return value.length > max_array_length ? "ARRAY+" : "array";
    }

    function getObjectOrSpecialObject(value) {
        const longArraySubArrayProperties = ["start", "end", "sub_array"];
        const svelteExplorerTagProperties = ["class", "svelte-explorer-tag", "children", "textContent"];
        return object_has_only_these_properties(value, longArraySubArrayProperties)
            ? "ARRAY+OBJECT"
            : object_has_only_these_properties(value, svelteExplorerTagProperties)
            ? "HTML"
            : isNode(value)
            ? "Node"
            : "object";
    }

    function object_has_only_these_properties(value, arr) {
        return arr.filter((prop) => prop in value).length === arr.length;
    }

    function isNode(o) {
        return typeof Node === "object"
            ? o instanceof Node
            : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    }
}

function appendRowsForObject(row_settings, arr) {
    const children = Object.entries(row_settings.val);
    const brackets = "{}";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "object"));
    children.forEach(([k, v], i) => appendRowsByType(getRowForChild(row_settings, k, v, i), arr));
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArray(row_settings, arr) {
    let children = row_settings.val;
    const brackets = "[]";
    arr.push(getRowForBracketOpen(row_settings, children.length, brackets, row_settings.type));
    for (let i = 0; i < children.length; i++) {
        appendRowsByType(getRowForChild(row_settings, i, children[i], i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArrayLong(row_settings, arr) {
    const converted = recursive_get_chunked_array(row_settings.val);
    appendRowsForArrayLongObject({ ...row_settings, val: converted }, arr);
}

function appendRowsForArrayLongObject(row_settings, arr) {
    const item = row_settings.val;
    const brackets = "[]";
    const text = "long arrays are chunked";
    arr.push(getRowForBracketOpen(row_settings, item.end + 1, brackets, row_settings.type));
    appendRowsForArrayLongSubArray(getRowForChild(row_settings, text, item.sub_array, 1), arr, item.start);
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowsForArrayLongSubArray(row_settings, arr, parent_item_start) {
    let item = row_settings.val;
    for (let i = 0; i < item.length; i++) {
        const key = getLongArrayRange(item[i], parent_item_start + i);
        const val = item[i];
        const indexRef = row_settings.indexRef + "." + i;
        appendRowsByType({ ...row_settings, key, val, indexRef }, arr);
    }
    function getLongArrayRange(long_array_object, i) {
        return typeof long_array_object !== "undefined" && typeof long_array_object.start !== "undefined"
            ? "{" + long_array_object.start + ".." + long_array_object.end + "}"
            : i;
    }
}

function appendRowForSimpleTypes(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const row_is_too_wide = val && "" + val.length > max_line_length - level * indentSpaces;
    if (row_is_too_wide) appendRowForSimpleTypesMultiLine(row_settings, arr);
    else
        arr.push({
            ...rest,
            key,
            val,
            indent: level * indentSpaces,
            is_last_multiline: true,
        });
}

function appendRowForSimpleTypesMultiLine(row_settings, arr) {
    const { key, val, level } = row_settings;
    const key_length = ("" + key).length;
    const available_chars_based_on_indent = max_line_length - key_length - level * indentSpaces;
    const regex_to_split_into_chunks = new RegExp("[^]{1," + available_chars_based_on_indent + "}", "gi");
    const array_of_rows = ("" + val).match(regex_to_split_into_chunks);
    const only_show_type_in_first_row = (settings, i) => (i ? "" : settings.type);
    let new_row_settings = row_settings;
    const push_each_row = (val_new, i, a) => {
        const key_new = i ? "" : key; //only show key in first row of multiline
        const indent = i ? key_length + level + 3 : level + 1;
        new_row_settings = {
            ...new_row_settings,
            key: key_new,
            val: val_new,
            indent: indent,
            is_last_multiline: i === a.length - 1,
            type: only_show_type_in_first_row(new_row_settings, i),
        };
        // we don't change the indexRef - so that all rows have the same row reference and highlight together
        arr.push(new_row_settings, arr);
    };
    array_of_rows.map(push_each_row);
}

function appendRowsForFunction(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const val_as_string = "" + val;
    const val_as_array = val_as_string.split("\n");

    const brackets = "{}";
    const type = val_as_array[0] && val_as_array[0].substring(0, 1) === "f" ? "function" : "arrow fn";
    arr.push(getRowForBracketOpen(row_settings, val_as_array.length, brackets, type));
    for (let i = 0; i < val_as_array.length; i++) {
        const function_row = val_as_array[i].trim();
        if (!function_row.length) continue;
        appendRowsByType(getRowForChild(row_settings, i, function_row, i), arr);
    }
    arr.push(getRowForBracketClose(row_settings, brackets));
}

function appendRowForSymbol(row_settings, arr) {
    const { key, val, level } = row_settings;
    let val_new = val.toString();
    if (val_new !== "Symbol()") val_new = `Symbol('${val_new.substring(7, val_new.length - 1)}')`;
    arr.push({ ...row_settings, key, val: val_new, indent: level * indentSpaces });
}

function appendRowsForDomNode(row_settings, arr) {
    const converted = lib.domParser(row_settings.val);
    appendRowsForSvelteExplorerTag({ ...row_settings, val: converted }, arr);
}

function appendRowsForSvelteExplorerTag(row_settings, arr) {
    const { key, val, level, ...rest } = row_settings;
    const text = row_settings.val.textContent;
    const children = row_settings.val.children;
    const tag = row_settings.val["svelte-explorer-tag"].toLowerCase();
    const is_svelte_tag = ["#", "/", ":"].includes(tag[0]);
    const start_bracket = "<" + tag;
    const end_bracket = is_svelte_tag ? ">" : "</" + tag + ">";
    const brackets = is_svelte_tag ? start_bracket + end_bracket : start_bracket + ">" + end_bracket;
    const has_text = text.length ? 1 : 0;
    if (children.length || has_text) {
        arr.push(getRowForBracketOpen(row_settings, children.length, brackets, "HTML", end_bracket.length));
        if (has_text) appendRowsByType(getRowForChild(row_settings, "", text, 0), arr);
        children.map((a, i) => appendRowsByType(getRowForChild(row_settings, i + has_text, a, i + has_text), arr));
        //children.map((a, i) => appendRowsByType(getRowForChild(row_settings, i, a, i), arr));
        arr.push(getRowForBracketClose(row_settings, brackets, end_bracket.length));
    } else {
        const indent = level * indentSpaces;
        arr.push({ ...rest, key, val: brackets, indent });
    }
}

function recursive_get_chunked_array(supplied = [], supplied_options = {}) {
    const options = override_default_options();
    const recurrence_count = options.recurrence_count;
    const array_length_max = options.array_length_max;
    const max_recursions = options.recurrence_max;
    const initial_obj = get_obj_from_arr_or_obj(supplied);
    return get_short_or_chunked_array();

    function override_default_options() {
        return {
            recurrence_count: 0,
            recurrence_max: 4,
            array_length_max: max_array_length,
            ...supplied_options,
        };
    }

    function get_obj_from_arr_or_obj(supplied) {
        if (Array.isArray(supplied)) return { start: 0, end: supplied.length - 1, sub_array: supplied };
        else return supplied;
    }

    function get_short_or_chunked_array() {
        if (initial_obj.sub_array.length > array_length_max) return get_recursive_chunked_array();
        else return supplied;
    }

    function get_recursive_chunked_array() {
        const chunked_array = get_single_level_chunked_array(initial_obj);
        return recurse_or_return(chunked_array, initial_obj, recurrence_count);
    }

    function recurse_or_return(chunked_array, initial_obj, recurrence_count) {
        if (chunked_array.length > array_length_max && recurrence_count < max_recursions) {
            initial_obj.sub_array = chunked_array;
            return recursive_get_chunked_array(initial_obj, { ...options, recurrence_count: recurrence_count + 1 });
        } else {
            initial_obj.sub_array = chunked_array;
            return initial_obj;
        }
    }
    function get_single_level_chunked_array(initial_obj) {
        let chunked_array = [];
        for (let start = 0; start < initial_obj.sub_array.length; start += array_length_max) {
            const end = get_chunk_end(initial_obj, start);
            const chunk_array = initial_obj.sub_array.slice(start, end + 1);
            const chunk_obj = get_chunk_object(start, end, chunk_array);
            chunked_array.push(chunk_obj);
            chunked_array = get_chunked_array_without_duplicate_nested_last_item(chunked_array);
        }
        return chunked_array;
    }

    function get_chunk_end(initial_obj, start) {
        let end = start + array_length_max - 1;
        let last_item_index = initial_obj.sub_array.length - 1;
        let chunk_array_is_short = end > last_item_index;
        if (chunk_array_is_short) end = last_item_index;
        return end;
    }

    function get_chunk_object(chunk_start, chunk_end, chunk_array) {
        //get chunk range depending on if its just the root array, or from range of all child chunks
        const chunk_item_first = chunk_array[0];
        const chunk_item_last = chunk_array[chunk_array.length - 1];
        const contains_child_chunks =
            //is not just a plain array, because it has start and end items
            typeof chunk_item_first.start !== "undefined" && typeof chunk_item_last.end !== "undefined";
        const start = contains_child_chunks ? chunk_array[0].start : chunk_start;
        const end = contains_child_chunks ? chunk_array[chunk_array.length - 1].end : chunk_end;
        return { start, end, sub_array: chunk_array };
    }

    function get_chunked_array_without_duplicate_nested_last_item(chunked_array) {
        // this fixes tests 10 and 11 when the last item is a single item
        // incorrectly looks like this: { start: 9, end: 9, sub_array: { start: 9, end: 9, sub_array: [9] } }
        // correctly looks like this:   { start: 9, end: 9, sub_array: [9] }
        let last_added_chunk_object = chunked_array[chunked_array.length - 1];
        let has_only_one_items = last_added_chunk_object.sub_array.length === 1;
        let sub_item_start = last_added_chunk_object.sub_array[0].start;
        let sub_item_end = last_added_chunk_object.sub_array[0].end;
        if (
            has_only_one_items &&
            sub_item_start === last_added_chunk_object.start &&
            sub_item_end === last_added_chunk_object.end
        ) {
            chunked_array[chunked_array.length - 1] = chunked_array[chunked_array.length - 1].sub_array[0];
        }
        return chunked_array;
    }
}

function getRowForBracketOpen(row_settings, len, brackets, type, close_bracket_length = 1) {
    return {
        ...row_settings,
        val: brackets,
        indent: row_settings.level * indentSpaces,
        type,
        bracket: close_bracket_length,
        expandable: true,
        len,
    };
}

function getRowForBracketClose(row_settings, brackets, close_bracket_length = 1) {
    const close_bracket = brackets.substring(brackets.length - close_bracket_length, brackets.length);
    return {
        ...row_settings,
        key: "",
        val: close_bracket,
        indent: row_settings.level * indentSpaces,
        type: "",
        bracket: close_bracket_length,
    };
}

function getRowForChild(row_settings, key, val, index) {
    const indexRef = row_settings.indexRef + "." + index;
    const parentIndexRef = row_settings.indexRef;
    const level = row_settings.level + 1;
    return { indexRef, parentIndexRef, index, key, val, level };
}

function transform_data(cache) {
    let tempArr = [];
    let tempItem = {
        key: "Svelte Object Explorer",
        val: cache.value,
    };
    tempItem.class = "";
    tempItem.valType = "";
    tempItem.childRows = convertObjectToArrayOfOutputPanelRows(tempItem);
    tempArr.push(tempItem);
    tempArr.sort(sort_byKey);
    tempArr = tempArr.map((item, index) => {
        return { ...item, index };
    });
    return tempArr;
}

function sort_byKey(a, b) {
    var nameA = a.key.toUpperCase(); // ignore upper and lowercase
    var nameB = b.key.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // else name are equal
    return 0;
}

function getOpenIndex(arr, item_requested_to_open) {
    let i = null;
    if (open && arr && arr[0] && arr[0].childRows) {
        const all_items_under_svelte_object_explorer = arr[0].childRows;
        all_items_under_svelte_object_explorer.map((item) => {
            if (item_requested_to_open === item.key && item.expandable) i = item.indexRef;
        });
    }
    return i;
}

function formatDate(d) {
    return (
        d.toDateString() +
        " " +
        d.getUTCHours() +
        ":" +
        d.getUTCMinutes() +
        ":" +
        d.getUTCSeconds() +
        ":" +
        d.getUTCMilliseconds()
    );
}

var transform_data$1 = { transform_data, getOpenIndex, formatDate };

/* src/Index.svelte generated by Svelte v3.38.3 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[30] = list[i];
	child_ctx[32] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[33] = list[i];
	return child_ctx;
}

// (135:4) {#if toggle}
function create_if_block(ctx) {
	let div;
	let resetbutton;
	let pausebutton;
	let cachedisplay;
	let table;
	let div_class_value;
	let current;
	let mounted;
	let dispose;
	resetbutton = new ResetButton({ props: { reset: /*reset*/ ctx[15] } });

	pausebutton = new PauseButton({
			props: {
				isPaused: /*isPaused*/ ctx[4],
				pause: /*pause*/ ctx[14],
				unpause: /*unpause*/ ctx[13]
			}
		});

	cachedisplay = new CacheDisplay({
			props: {
				cache: /*cache*/ ctx[9],
				ratelimit: /*ratelimit*/ ctx[0],
				ratelimitDefault
			}
		});

	let each_value = /*topLevelObjectArray*/ ctx[8];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");
			create_component(resetbutton.$$.fragment);
			create_component(pausebutton.$$.fragment);
			create_component(cachedisplay.$$.fragment);
			table = element("table");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "id", "svelteObjectExplorer");

			attr(div, "class", div_class_value = "tree" + (/*toggle*/ ctx[3] ? "" : " tree-hide") + (/*fade*/ ctx[2]
			? /*hovering*/ ctx[5] ? " noFade" : " fade"
			: " noFade"));
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(resetbutton, div, null);
			mount_component(pausebutton, div, null);
			mount_component(cachedisplay, div, null);
			append(div, table);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(table, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "mouseover", /*mouseover_handler_1*/ ctx[23]),
					listen(div, "mouseleave", /*mouseleave_handler*/ ctx[24])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			const pausebutton_changes = {};
			if (dirty[0] & /*isPaused*/ 16) pausebutton_changes.isPaused = /*isPaused*/ ctx[4];
			pausebutton.$set(pausebutton_changes);
			const cachedisplay_changes = {};
			if (dirty[0] & /*cache*/ 512) cachedisplay_changes.cache = /*cache*/ ctx[9];
			if (dirty[0] & /*ratelimit*/ 1) cachedisplay_changes.ratelimit = /*ratelimit*/ ctx[0];
			cachedisplay.$set(cachedisplay_changes);

			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 6592) {
				each_value = /*topLevelObjectArray*/ ctx[8];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(table, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty[0] & /*toggle, fade, hovering*/ 44 && div_class_value !== (div_class_value = "tree" + (/*toggle*/ ctx[3] ? "" : " tree-hide") + (/*fade*/ ctx[2]
			? /*hovering*/ ctx[5] ? " noFade" : " fade"
			: " noFade"))) {
				attr(div, "class", div_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(resetbutton.$$.fragment, local);
			transition_in(pausebutton.$$.fragment, local);
			transition_in(cachedisplay.$$.fragment, local);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(resetbutton.$$.fragment, local);
			transition_out(pausebutton.$$.fragment, local);
			transition_out(cachedisplay.$$.fragment, local);
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(resetbutton);
			destroy_component(pausebutton);
			destroy_component(cachedisplay);
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (145:36) {#if (                                       rowsToShow.includes(row.parentIndexRef) &&                                       (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef))))                                     )}
function create_if_block_1(ctx) {
	let div;
	let rowtext;
	let chevronbuttons;
	let div_class_value;
	let current;
	let mounted;
	let dispose;

	rowtext = new RowText({
			props: {
				row: /*row*/ ctx[33],
				isExpanded: /*row*/ ctx[33].expandable && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)
			}
		});

	chevronbuttons = new ChevronButtons({
			props: {
				row: /*row*/ ctx[33],
				rowsToShow: /*rowsToShow*/ ctx[6],
				rowContract: /*rowContract*/ ctx[11],
				rowExpand: /*rowExpand*/ ctx[12]
			}
		});

	function mouseover_handler() {
		return /*mouseover_handler*/ ctx[20](/*row*/ ctx[33]);
	}

	function mousedown_handler() {
		return /*mousedown_handler*/ ctx[21](/*row*/ ctx[33], /*topLevelObject*/ ctx[30]);
	}

	return {
		c() {
			div = element("div");
			create_component(rowtext.$$.fragment);
			create_component(chevronbuttons.$$.fragment);

			attr(div, "class", div_class_value = /*hoverRow*/ ctx[7] === /*row*/ ctx[33].indexRef || /*row*/ ctx[33].parentIndexRef.startsWith(/*hoverRow*/ ctx[7])
			? "row hoverRow"
			: "row");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(rowtext, div, null);
			mount_component(chevronbuttons, div, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "mouseover", mouseover_handler),
					listen(div, "mousedown", mousedown_handler)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const rowtext_changes = {};
			if (dirty[0] & /*topLevelObjectArray*/ 256) rowtext_changes.row = /*row*/ ctx[33];
			if (dirty[0] & /*topLevelObjectArray, rowsToShow*/ 320) rowtext_changes.isExpanded = /*row*/ ctx[33].expandable && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef);
			rowtext.$set(rowtext_changes);
			const chevronbuttons_changes = {};
			if (dirty[0] & /*topLevelObjectArray*/ 256) chevronbuttons_changes.row = /*row*/ ctx[33];
			if (dirty[0] & /*rowsToShow*/ 64) chevronbuttons_changes.rowsToShow = /*rowsToShow*/ ctx[6];
			chevronbuttons.$set(chevronbuttons_changes);

			if (!current || dirty[0] & /*hoverRow, topLevelObjectArray*/ 384 && div_class_value !== (div_class_value = /*hoverRow*/ ctx[7] === /*row*/ ctx[33].indexRef || /*row*/ ctx[33].parentIndexRef.startsWith(/*hoverRow*/ ctx[7])
			? "row hoverRow"
			: "row")) {
				attr(div, "class", div_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(rowtext.$$.fragment, local);
			transition_in(chevronbuttons.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(rowtext.$$.fragment, local);
			transition_out(chevronbuttons.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(rowtext);
			destroy_component(chevronbuttons);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (144:34) {#each topLevelObject.childRows as row}
function create_each_block_1(ctx) {
	let show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].parentIndexRef) && (!/*row*/ ctx[33].bracket || /*row*/ ctx[33].bracket && (/*row*/ ctx[33].expandable || /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)));
	let if_block_anchor;
	let current;
	let if_block = show_if && create_if_block_1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 320) show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].parentIndexRef) && (!/*row*/ ctx[33].bracket || /*row*/ ctx[33].bracket && (/*row*/ ctx[33].expandable || /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)));

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 320) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (142:16) {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
function create_each_block(ctx) {
	let tr;
	let td;
	let pre;
	let t;
	let current;
	let mounted;
	let dispose;
	let each_value_1 = /*topLevelObject*/ ctx[30].childRows;
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			tr = element("tr");
			td = element("td");
			pre = element("pre");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = text("\n                              ");
			attr(td, "class", "treeVal");
			attr(tr, "class", "treeVal");
		},
		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td);
			append(td, pre);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(pre, null);
			}

			append(pre, t);
			current = true;

			if (!mounted) {
				dispose = listen(tr, "mouseout", /*mouseout_handler*/ ctx[22]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 6592) {
				each_value_1 = /*topLevelObject*/ ctx[30].childRows;
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(pre, t);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment(ctx) {
	let div;
	let tabbutton;
	let t;
	let current;

	tabbutton = new TabButton({
			props: {
				toggle: /*toggle*/ ctx[3],
				tabposition: /*tabposition*/ ctx[1],
				fade: /*fade*/ ctx[2],
				hovering: /*hovering*/ ctx[5],
				doToggle: /*doToggle*/ ctx[10]
			}
		});

	let if_block = /*toggle*/ ctx[3] && create_if_block(ctx);

	return {
		c() {
			div = element("div");
			create_component(tabbutton.$$.fragment);
			t = space();
			if (if_block) if_block.c();
			this.c = noop;
			attr(div, "class", "svelte-object-explorer-wrapper");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(tabbutton, div, null);
			append(div, t);
			if (if_block) if_block.m(div, null);
			current = true;
		},
		p(ctx, dirty) {
			const tabbutton_changes = {};
			if (dirty[0] & /*toggle*/ 8) tabbutton_changes.toggle = /*toggle*/ ctx[3];
			if (dirty[0] & /*tabposition*/ 2) tabbutton_changes.tabposition = /*tabposition*/ ctx[1];
			if (dirty[0] & /*fade*/ 4) tabbutton_changes.fade = /*fade*/ ctx[2];
			if (dirty[0] & /*hovering*/ 32) tabbutton_changes.hovering = /*hovering*/ ctx[5];
			tabbutton.$set(tabbutton_changes);

			if (/*toggle*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty[0] & /*toggle*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(tabbutton.$$.fragment, local);
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(tabbutton.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(tabbutton);
			if (if_block) if_block.d();
		}
	};
}

let ratelimitDefault = 100;

function instance($$self, $$props, $$invalidate) {
	let stringifiedValueCache = "";
	let { value } = $$props;
	let { tabposition = "top" } = $$props;
	let { open = null } = $$props;
	let { fade = false } = $$props;
	let { ratelimit = ratelimitDefault } = $$props;
	let { initialtogglestate = true } = $$props;
	let isPaused = false;
	let hovering = false;
	let openIndexSetOnce = false;
	let showManuallySelected = ["0", "0.0"];
	let rowsToShow = [];
	let hoverRow = "none";
	let toggle = initialtogglestate;
	let topLevelObjectArray = [];

	let cache = {
		dataChanges: 0,
		viewChanges: 0,
		dataUpdated: new Date(),
		viewUpdated: new Date(),
		formatted: "",
		value: null
	};

	onMount(async () => {
		$$invalidate(6, rowsToShow = showManuallySelected);
		timer();
	});

	function timer() {
		setInterval(
			() => {
				//console.log(value);
				refreshDataAndCache();
			},
			ratelimit
		);
	}

	function refreshDataAndCache() {
		if (toggle) {
			if (window && window.svelteobjectexplorer) {
				const obj = window.svelteobjectexplorer;
				if ("value" in obj) $$invalidate(16, value = obj.value);
				if ("open" in obj) $$invalidate(17, open = obj.open);
				if ("fade" in obj) $$invalidate(2, fade = obj.fade);
				if ("tabposition" in obj) $$invalidate(1, tabposition = obj.tabposition);
				if ("ratelimit" in obj) $$invalidate(0, ratelimit = obj.ratelimit);
			}

			let newvalue = value || lib.domParser();
			const stringifiedValue = JSON.stringify(newvalue);

			if (stringifiedValue !== stringifiedValueCache) {
				$$invalidate(9, cache.dataUpdated = new Date(), cache);
				$$invalidate(9, cache.dataChanges = cache.dataChanges + 1, cache);
				stringifiedValueCache = stringifiedValue;
			}

			const time_since_last_check = cache.dataUpdated - cache.viewUpdated;

			if (time_since_last_check > ratelimit && !isPaused) {
				$$invalidate(9, cache.value = newvalue, cache);
				$$invalidate(9, cache.viewChanges = cache.viewChanges + 1, cache);
				$$invalidate(9, cache.viewUpdated = new Date(), cache);
				$$invalidate(9, cache.dataUpdated = cache.viewUpdated, cache);
				$$invalidate(9, cache.formatted = transform_data$1.formatDate(cache.viewUpdated), cache);
				stringifiedValueCache = JSON.stringify(cache.value);
				$$invalidate(8, topLevelObjectArray = transform_data$1.transform_data(cache)); //this should trigger a redraw
			}

			//open requested object
			if (!openIndexSetOnce) {
				let openIndexRef = transform_data$1.getOpenIndex(topLevelObjectArray, open);

				if (openIndexRef) {
					rowExpand(openIndexRef);
					if (showManuallySelected.includes(openIndexRef)) openIndexSetOnce = true;
				}
			}
		}
	}

	// UI functions
	function doToggle() {
		$$invalidate(3, toggle = !toggle);
	}

	function rowContract(rowIndex) {
		$$invalidate(19, showManuallySelected = showManuallySelected.filter(row => !row.startsWith(rowIndex)));
	}

	function rowExpand(rowIndex) {
		$$invalidate(19, showManuallySelected = showManuallySelected.filter(row => row !== rowIndex));
		showManuallySelected.push(rowIndex);
	}

	function unpause() {
		$$invalidate(4, isPaused = false);
	}

	function pause() {
		$$invalidate(4, isPaused = true);
	}

	function reset() {
		$$invalidate(9, cache.viewChanges = 1, cache);
		$$invalidate(9, cache.dataChanges = 1, cache);
	}

	const mouseover_handler = row => $$invalidate(7, hoverRow = row.indexRef);
	const mousedown_handler = (row, topLevelObject) => console.log(row.indexRef, topLevelObject.childRows, rowsToShow);
	const mouseout_handler = () => $$invalidate(7, hoverRow = null);
	const mouseover_handler_1 = () => $$invalidate(5, hovering = true);
	const mouseleave_handler = () => $$invalidate(5, hovering = false);

	$$self.$$set = $$props => {
		if ("value" in $$props) $$invalidate(16, value = $$props.value);
		if ("tabposition" in $$props) $$invalidate(1, tabposition = $$props.tabposition);
		if ("open" in $$props) $$invalidate(17, open = $$props.open);
		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
		if ("ratelimit" in $$props) $$invalidate(0, ratelimit = $$props.ratelimit);
		if ("initialtogglestate" in $$props) $$invalidate(18, initialtogglestate = $$props.initialtogglestate);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*toggle, showManuallySelected*/ 524296) {
			if (toggle) $$invalidate(6, rowsToShow = showManuallySelected);
		}

		if ($$self.$$.dirty[0] & /*ratelimit*/ 1) {
			if (ratelimit === null) $$invalidate(0, ratelimit = ratelimitDefault);
		}
	};

	return [
		ratelimit,
		tabposition,
		fade,
		toggle,
		isPaused,
		hovering,
		rowsToShow,
		hoverRow,
		topLevelObjectArray,
		cache,
		doToggle,
		rowContract,
		rowExpand,
		unpause,
		pause,
		reset,
		value,
		open,
		initialtogglestate,
		showManuallySelected,
		mouseover_handler,
		mousedown_handler,
		mouseout_handler,
		mouseover_handler_1,
		mouseleave_handler
	];
}

class Index extends SvelteElement {
	constructor(options) {
		super();
		this.shadowRoot.innerHTML = `<style>.svelte-object-explorer-wrapper{position:fixed;top:0px;left:0px;width:100vw;height:100vh;padding:0px;margin:0px;z-index:100000000000000000 !important;pointer-events:none;font-family:"Roboto", "Arial", sans-serif !important}.fade{opacity:0.3 !important}.noFade{opacity:1 !important}.tree{pointer-events:all;transition:0.2s;position:fixed;right:0px;top:0px;width:500px;height:100vh;background-color:#aaa;z-index:10000000;overflow:auto;font-size:small;margin:0;font-size:14px;line-height:1.3em;-webkit-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);-moz-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15)}.tree-hide{right:-500px;transition:0.2s}.treeVal{min-height:10px;overflow-wrap:break-word;max-width:480px;overflow:auto;background-color:#666 !important;color:white}.toggle:hover{pointer-events:all;opacity:1}.toggle{pointer-events:all;cursor:pointer;position:fixed;width:70px;height:20px;text-align:center;transform:rotate(-90deg);background-color:#aaa;z-index:10000000;margin:0;font-size:14px;line-height:1.3em}.toggletop{top:25px}.togglemiddle{top:calc(50vh - 25px)}.togglebottom{bottom:25px}.toggleShow{pointer-events:all;transition:0.2s;right:475px}.toggleHide{pointer-events:all;transition:0.2s;right:-25px}.accordion{background-color:#666 !important;color:white}.icon1{width:15px;height:15px}.smaller{width:15px;height:15px;display:inline-block;position:relative;top:2px}.smallest{width:15px;height:15px;display:inline-block;position:relative;top:1px;left:0px !important;color:green}.link{cursor:pointer}.link:hover{background-color:#888}.row{background-color:#999;position:relative;padding-left:15px;display:block;white-space:pre;height:1.5em}.row:nth-child(even){background-color:#aaa}.dataArrow{position:absolute;left:0px;cursor:pointer}.dataArrow:hover{color:black}.len{color:black;position:absolute;right:70px;top:0px}.type{color:green;position:absolute;top:0px;right:5px}.nopointer{cursor:pointer;user-select:none}.hoverRow{background-color:#68f !important}.toggleShowAll,.copyToClipbord{display:inline}.reset{position:absolute;top:3px;right:50px}button.pause{position:absolute;top:3px;right:3px}.smallest{width:15px;height:15px;display:inline-block;position:relative;top:1px;left:0px !important;color:green}.dataArrow{position:absolute;left:0px;cursor:pointer}.dataArrow:hover{color:black}.white{color:white}.len{color:black;position:absolute;right:70px;top:0px}.type{color:green;position:absolute;top:0px;right:5px}.grey{color:#666}.white{color:white}.svelte-object-explorer-wrapper{position:fixed;top:0px;left:0px;width:100vw;height:100vh;padding:0px;margin:0px;z-index:100000000000000000 !important;pointer-events:none;font-family:"Roboto", "Arial", sans-serif !important}.fade{opacity:0.3 !important}.noFade{opacity:1 !important}.tree{pointer-events:all;transition:0.2s;position:fixed;right:0px;top:0px;width:500px;height:100vh;background-color:#aaa;z-index:10000000;overflow:auto;font-size:small;margin:0;font-size:14px;line-height:1.3em;-webkit-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);-moz-box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15);box-shadow:-4px 4px 10px 0px rgba(0, 0, 0, 0.15)}.tree-hide{right:-500px;transition:0.2s}.tree table{table-layout:fixed;width:480px}.tree tr:nth-child(odd){background-color:#ccc}.treeVal{min-height:10px;overflow-wrap:break-word;max-width:480px;overflow:auto;background-color:#666 !important;color:white}pre{margin:0px;white-space:normal;padding:0px}.row{background-color:#999;position:relative;padding-left:15px;display:block;white-space:pre;height:1.5em}.row:nth-child(even){background-color:#aaa}.hoverRow{background-color:#68f !important}.val{color:black}<style>`;

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance,
			create_fragment,
			safe_not_equal,
			{
				value: 16,
				tabposition: 1,
				open: 17,
				fade: 2,
				ratelimit: 0,
				initialtogglestate: 18
			},
			[-1, -1]
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["value", "tabposition", "open", "fade", "ratelimit", "initialtogglestate"];
	}

	get value() {
		return this.$$.ctx[16];
	}

	set value(value) {
		this.$set({ value });
		flush();
	}

	get tabposition() {
		return this.$$.ctx[1];
	}

	set tabposition(tabposition) {
		this.$set({ tabposition });
		flush();
	}

	get open() {
		return this.$$.ctx[17];
	}

	set open(open) {
		this.$set({ open });
		flush();
	}

	get fade() {
		return this.$$.ctx[2];
	}

	set fade(fade) {
		this.$set({ fade });
		flush();
	}

	get ratelimit() {
		return this.$$.ctx[0];
	}

	set ratelimit(ratelimit) {
		this.$set({ ratelimit });
		flush();
	}

	get initialtogglestate() {
		return this.$$.ctx[18];
	}

	set initialtogglestate(initialtogglestate) {
		this.$set({ initialtogglestate });
		flush();
	}
}

customElements.define("svelte-object-explorer", Index);

//used by root rollup.config.js to create custom_element index.mjs distributable

export default Index;
//# sourceMappingURL=index.mjs.map
