
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
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
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.38.3 */

    const file = "node_modules/svelte-icons/components/IconBase.svelte";

    // (18:0) {#if title}
    function create_if_block(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file, 18, 0, 258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-12tuj21");
    			add_location(svg, file, 16, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], !current ? -1 : dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconBase", slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/fa/FaChevronDown.svelte generated by Svelte v3.38.3 */
    const file$1 = "node_modules/svelte-icons/fa/FaChevronDown.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z");
    			add_location(path, file$1, 4, 0, 119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaChevronDown", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChevronDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronDown",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaChevronUp.svelte generated by Svelte v3.38.3 */
    const file$2 = "node_modules/svelte-icons/fa/FaChevronUp.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z");
    			add_location(path, file$2, 4, 0, 119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaChevronUp", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChevronUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronUp",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/TabButton.svelte generated by Svelte v3.38.3 */
    const file$3 = "src/TabButton.svelte";

    // (23:0) {:else}
    function create_else_block(ctx) {
    	let t;
    	let span;
    	let fachevronup;
    	let current;
    	fachevronup = new FaChevronUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Show\n");
    			span = element("span");
    			create_component(fachevronup.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-fctfdr");
    			add_location(span, file$3, 24, 0, 504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(fachevronup, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fachevronup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fachevronup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(fachevronup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(23:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if toggle}
    function create_if_block$1(ctx) {
    	let t;
    	let span;
    	let fachevrondown;
    	let current;
    	fachevrondown = new FaChevronDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Hide\n");
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-fctfdr");
    			add_location(span, file$3, 19, 0, 442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(fachevrondown, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fachevrondown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fachevrondown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(fachevrondown);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*toggle*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty((/*toggle*/ ctx[0]
    			? "toggle toggleShow"
    			: "toggle toggleHide") + " toggle" + /*tabPosition*/ ctx[1] + (/*fade*/ ctx[2]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
    			: " noFade")) + " svelte-fctfdr"));

    			add_location(div, file$3, 10, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"mousedown",
    					function () {
    						if (is_function(/*doToggle*/ ctx[4])) /*doToggle*/ ctx[4].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*toggle, tabPosition, fade, hovering*/ 15 && div_class_value !== (div_class_value = "" + (null_to_empty((/*toggle*/ ctx[0]
    			? "toggle toggleShow"
    			: "toggle toggleHide") + " toggle" + /*tabPosition*/ ctx[1] + (/*fade*/ ctx[2]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
    			: " noFade")) + " svelte-fctfdr"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabButton", slots, []);
    	let { toggle } = $$props;
    	let { tabPosition } = $$props;
    	let { fade } = $$props;
    	let { hovering } = $$props;
    	let { doToggle } = $$props;
    	const writable_props = ["toggle", "tabPosition", "fade", "hovering", "doToggle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$props.toggle);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("doToggle" in $$props) $$invalidate(4, doToggle = $$props.doToggle);
    	};

    	$$self.$capture_state = () => ({
    		FaChevronDown,
    		FaChevronUp,
    		toggle,
    		tabPosition,
    		fade,
    		hovering,
    		doToggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$props.toggle);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("doToggle" in $$props) $$invalidate(4, doToggle = $$props.doToggle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggle, tabPosition, fade, hovering, doToggle];
    }

    class TabButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			toggle: 0,
    			tabPosition: 1,
    			fade: 2,
    			hovering: 3,
    			doToggle: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabButton",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggle*/ ctx[0] === undefined && !("toggle" in props)) {
    			console.warn("<TabButton> was created without expected prop 'toggle'");
    		}

    		if (/*tabPosition*/ ctx[1] === undefined && !("tabPosition" in props)) {
    			console.warn("<TabButton> was created without expected prop 'tabPosition'");
    		}

    		if (/*fade*/ ctx[2] === undefined && !("fade" in props)) {
    			console.warn("<TabButton> was created without expected prop 'fade'");
    		}

    		if (/*hovering*/ ctx[3] === undefined && !("hovering" in props)) {
    			console.warn("<TabButton> was created without expected prop 'hovering'");
    		}

    		if (/*doToggle*/ ctx[4] === undefined && !("doToggle" in props)) {
    			console.warn("<TabButton> was created without expected prop 'doToggle'");
    		}
    	}

    	get toggle() {
    		throw new Error("<TabButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<TabButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabPosition() {
    		throw new Error("<TabButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabPosition(value) {
    		throw new Error("<TabButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<TabButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<TabButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hovering() {
    		throw new Error("<TabButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovering(value) {
    		throw new Error("<TabButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doToggle() {
    		throw new Error("<TabButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doToggle(value) {
    		throw new Error("<TabButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PauseButton.svelte generated by Svelte v3.38.3 */

    const file$4 = "src/PauseButton.svelte";

    // (9:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Pause";
    			attr_dev(button, "class", "pause svelte-kgp2c3");
    			add_location(button, file$4, 9, 0, 165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"mouseup",
    					function () {
    						if (is_function(/*pause*/ ctx[1])) /*pause*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(9:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:0) {#if isPaused}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "un-Pause";
    			attr_dev(button, "class", "pause svelte-kgp2c3");
    			add_location(button, file$4, 7, 0, 94);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"mouseup",
    					function () {
    						if (is_function(/*unpause*/ ctx[2])) /*unpause*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(7:0) {#if isPaused}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*isPaused*/ ctx[0]) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PauseButton", slots, []);
    	let { isPaused } = $$props;
    	let { pause } = $$props;
    	let { unpause } = $$props;
    	const writable_props = ["isPaused", "pause", "unpause"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PauseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isPaused" in $$props) $$invalidate(0, isPaused = $$props.isPaused);
    		if ("pause" in $$props) $$invalidate(1, pause = $$props.pause);
    		if ("unpause" in $$props) $$invalidate(2, unpause = $$props.unpause);
    	};

    	$$self.$capture_state = () => ({ isPaused, pause, unpause });

    	$$self.$inject_state = $$props => {
    		if ("isPaused" in $$props) $$invalidate(0, isPaused = $$props.isPaused);
    		if ("pause" in $$props) $$invalidate(1, pause = $$props.pause);
    		if ("unpause" in $$props) $$invalidate(2, unpause = $$props.unpause);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isPaused, pause, unpause];
    }

    class PauseButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { isPaused: 0, pause: 1, unpause: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PauseButton",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isPaused*/ ctx[0] === undefined && !("isPaused" in props)) {
    			console.warn("<PauseButton> was created without expected prop 'isPaused'");
    		}

    		if (/*pause*/ ctx[1] === undefined && !("pause" in props)) {
    			console.warn("<PauseButton> was created without expected prop 'pause'");
    		}

    		if (/*unpause*/ ctx[2] === undefined && !("unpause" in props)) {
    			console.warn("<PauseButton> was created without expected prop 'unpause'");
    		}
    	}

    	get isPaused() {
    		throw new Error("<PauseButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPaused(value) {
    		throw new Error("<PauseButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pause() {
    		throw new Error("<PauseButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pause(value) {
    		throw new Error("<PauseButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unpause() {
    		throw new Error("<PauseButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unpause(value) {
    		throw new Error("<PauseButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CacheDisplay.svelte generated by Svelte v3.38.3 */

    const file$5 = "src/CacheDisplay.svelte";

    // (9:3) {#if rateLimit !== rateLimitDefault}
    function create_if_block$3(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Rate Limited: ");
    			span = element("span");
    			t1 = text(/*rateLimit*/ ctx[1]);
    			t2 = text("ms");
    			attr_dev(span, "class", "cache_ratelimit");
    			add_location(span, file$5, 8, 54, 274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rateLimit*/ 2) set_data_dev(t1, /*rateLimit*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(9:3) {#if rateLimit !== rateLimitDefault}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    	let if_block = /*rateLimit*/ ctx[1] !== /*rateLimitDefault*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
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
    			t6 = text("\nLast Updated(");
    			span2 = element("span");
    			t7 = text(t7_value);
    			t8 = text(")");
    			attr_dev(span0, "class", "cache_data");
    			add_location(span0, file$5, 6, 13, 102);
    			attr_dev(span1, "class", "cache_view");
    			add_location(span1, file$5, 6, 79, 168);
    			add_location(br, file$5, 9, 0, 330);
    			attr_dev(span2, "class", "cache_last");
    			add_location(span2, file$5, 10, 13, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, t7);
    			insert_dev(target, t8, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cache*/ 1 && t1_value !== (t1_value = /*cache*/ ctx[0].dataChanges + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*cache*/ 1 && t3_value !== (t3_value = /*cache*/ ctx[0].viewChanges + "")) set_data_dev(t3, t3_value);

    			if (/*rateLimit*/ ctx[1] !== /*rateLimitDefault*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(t5.parentNode, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*cache*/ 1 && t7_value !== (t7_value = /*cache*/ ctx[0].formatted + "")) set_data_dev(t7, t7_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CacheDisplay", slots, []);
    	let { cache } = $$props;
    	let { rateLimit } = $$props;
    	let { rateLimitDefault } = $$props;
    	const writable_props = ["cache", "rateLimit", "rateLimitDefault"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CacheDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("cache" in $$props) $$invalidate(0, cache = $$props.cache);
    		if ("rateLimit" in $$props) $$invalidate(1, rateLimit = $$props.rateLimit);
    		if ("rateLimitDefault" in $$props) $$invalidate(2, rateLimitDefault = $$props.rateLimitDefault);
    	};

    	$$self.$capture_state = () => ({ cache, rateLimit, rateLimitDefault });

    	$$self.$inject_state = $$props => {
    		if ("cache" in $$props) $$invalidate(0, cache = $$props.cache);
    		if ("rateLimit" in $$props) $$invalidate(1, rateLimit = $$props.rateLimit);
    		if ("rateLimitDefault" in $$props) $$invalidate(2, rateLimitDefault = $$props.rateLimitDefault);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cache, rateLimit, rateLimitDefault];
    }

    class CacheDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			cache: 0,
    			rateLimit: 1,
    			rateLimitDefault: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CacheDisplay",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cache*/ ctx[0] === undefined && !("cache" in props)) {
    			console.warn("<CacheDisplay> was created without expected prop 'cache'");
    		}

    		if (/*rateLimit*/ ctx[1] === undefined && !("rateLimit" in props)) {
    			console.warn("<CacheDisplay> was created without expected prop 'rateLimit'");
    		}

    		if (/*rateLimitDefault*/ ctx[2] === undefined && !("rateLimitDefault" in props)) {
    			console.warn("<CacheDisplay> was created without expected prop 'rateLimitDefault'");
    		}
    	}

    	get cache() {
    		throw new Error("<CacheDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cache(value) {
    		throw new Error("<CacheDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rateLimit() {
    		throw new Error("<CacheDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rateLimit(value) {
    		throw new Error("<CacheDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rateLimitDefault() {
    		throw new Error("<CacheDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rateLimitDefault(value) {
    		throw new Error("<CacheDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/fa/FaChevronRight.svelte generated by Svelte v3.38.3 */
    const file$6 = "node_modules/svelte-icons/fa/FaChevronRight.svelte";

    // (4:0) <IconBase viewBox="0 0 320 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z");
    			add_location(path, file$6, 4, 0, 119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 320 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 320 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FaChevronRight", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChevronRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronRight",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/ChevronButtons.svelte generated by Svelte v3.38.3 */
    const file$7 = "src/ChevronButtons.svelte";

    // (10:0) {#if row.expandable}
    function create_if_block$4(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*rowsToShow, row*/ 3) show_if = !!/*rowsToShow*/ ctx[1].includes(/*row*/ ctx[0].indexRef);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(10:0) {#if row.expandable}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let fachevronright;
    	let current;
    	let mounted;
    	let dispose;
    	fachevronright = new FaChevronRight({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevronright.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-1kpcu08");
    			add_location(span, file$7, 15, 0, 415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevronright, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "mousedown", /*mousedown_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fachevronright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fachevronright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(fachevronright);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(15:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if rowsToShow.includes(row.indexRef)}
    function create_if_block_1(ctx) {
    	let span;
    	let fachevrondown;
    	let current;
    	let mounted;
    	let dispose;
    	fachevrondown = new FaChevronDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-1kpcu08");
    			add_location(span, file$7, 11, 0, 300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevrondown, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "mousedown", /*mousedown_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fachevrondown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fachevrondown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(fachevrondown);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(11:0) {#if rowsToShow.includes(row.indexRef)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*row*/ ctx[0].expandable && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*row*/ ctx[0].expandable) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*row*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChevronButtons", slots, []);
    	let { row } = $$props;
    	let { rowsToShow } = $$props;
    	let { rowContract } = $$props;
    	let { rowExpand } = $$props;
    	const writable_props = ["row", "rowsToShow", "rowContract", "rowExpand"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChevronButtons> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = () => rowContract(row.indexRef);
    	const mousedown_handler_1 = () => rowExpand(row.indexRef);

    	$$self.$$set = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    		if ("rowsToShow" in $$props) $$invalidate(1, rowsToShow = $$props.rowsToShow);
    		if ("rowContract" in $$props) $$invalidate(2, rowContract = $$props.rowContract);
    		if ("rowExpand" in $$props) $$invalidate(3, rowExpand = $$props.rowExpand);
    	};

    	$$self.$capture_state = () => ({
    		FaChevronRight,
    		FaChevronDown,
    		row,
    		rowsToShow,
    		rowContract,
    		rowExpand
    	});

    	$$self.$inject_state = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    		if ("rowsToShow" in $$props) $$invalidate(1, rowsToShow = $$props.rowsToShow);
    		if ("rowContract" in $$props) $$invalidate(2, rowContract = $$props.rowContract);
    		if ("rowExpand" in $$props) $$invalidate(3, rowExpand = $$props.rowExpand);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		row,
    		rowsToShow,
    		rowContract,
    		rowExpand,
    		mousedown_handler,
    		mousedown_handler_1
    	];
    }

    class ChevronButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			row: 0,
    			rowsToShow: 1,
    			rowContract: 2,
    			rowExpand: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronButtons",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*row*/ ctx[0] === undefined && !("row" in props)) {
    			console.warn("<ChevronButtons> was created without expected prop 'row'");
    		}

    		if (/*rowsToShow*/ ctx[1] === undefined && !("rowsToShow" in props)) {
    			console.warn("<ChevronButtons> was created without expected prop 'rowsToShow'");
    		}

    		if (/*rowContract*/ ctx[2] === undefined && !("rowContract" in props)) {
    			console.warn("<ChevronButtons> was created without expected prop 'rowContract'");
    		}

    		if (/*rowExpand*/ ctx[3] === undefined && !("rowExpand" in props)) {
    			console.warn("<ChevronButtons> was created without expected prop 'rowExpand'");
    		}
    	}

    	get row() {
    		throw new Error("<ChevronButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<ChevronButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowsToShow() {
    		throw new Error("<ChevronButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowsToShow(value) {
    		throw new Error("<ChevronButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowContract() {
    		throw new Error("<ChevronButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowContract(value) {
    		throw new Error("<ChevronButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowExpand() {
    		throw new Error("<ChevronButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowExpand(value) {
    		throw new Error("<ChevronButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/RowText.svelte generated by Svelte v3.38.3 */

    const file$8 = "src/RowText.svelte";

    // (8:0) {:else}
    function create_else_block$3(ctx) {
    	let span;
    	let t0;
    	let t1;

    	function select_block_type_1(ctx, dirty) {
    		if (/*isExpanded*/ ctx[1]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*row*/ ctx[0].type && /*row*/ ctx[0].type !== "ARRAY+OBJECT" && /*row*/ ctx[0].type !== "ARRAY+SUB_ARRAY" && create_if_block_2(ctx);
    	let if_block2 = /*row*/ ctx[0].len && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			add_location(span, file$8, 8, 0, 110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block0.m(span, null);
    			append_dev(span, t0);
    			if (if_block1) if_block1.m(span, null);
    			append_dev(span, t1);
    			if (if_block2) if_block2.m(span, null);
    		},
    		p: function update(ctx, dirty) {
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
    					if_block1 = create_if_block_2(ctx);
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
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(span, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(8:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if row.type === "Tag"}
    function create_if_block$5(ctx) {
    	let t_value = /*row*/ ctx[0].tag + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t_value !== (t_value = /*row*/ ctx[0].tag + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(6:0) {#if row.type === \\\"Tag\\\"}",
    		ctx
    	});

    	return block;
    }

    // (13:0) {:else}
    function create_else_block_1(ctx) {
    	let t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*row*/ ctx[0].val + "";
    	let t2;
    	let if_block = "key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "" && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			if (if_block) if_block.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "val");
    			add_location(span, file$8, 13, 0, 422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t0_value !== (t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "")) set_data_dev(t0, t0_value);

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

    			if (dirty & /*row*/ 1 && t2_value !== (t2_value = /*row*/ ctx[0].val + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(13:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:1) {#if isExpanded}
    function create_if_block_3(ctx) {
    	let t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*row*/ ctx[0].val.substring(0, /*row*/ ctx[0].val.length - /*row*/ ctx[0].bracket) + "";
    	let t2;
    	let if_block = "key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "" && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			if (if_block) if_block.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "val");
    			add_location(span, file$8, 11, 0, 235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t0_value !== (t0_value = (" ").repeat(/*row*/ ctx[0].indent) + "")) set_data_dev(t0, t0_value);

    			if ("key" in /*row*/ ctx[0] && /*row*/ ctx[0].key !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*row*/ 1 && t2_value !== (t2_value = /*row*/ ctx[0].val.substring(0, /*row*/ ctx[0].val.length - /*row*/ ctx[0].bracket) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(10:1) {#if isExpanded}",
    		ctx
    	});

    	return block;
    }

    // (13:31) {#if "key" in row && row.key !== ""}
    function create_if_block_5(ctx) {
    	let span;
    	let t0_value = /*row*/ ctx[0].key + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			attr_dev(span, "class", "key");
    			add_location(span, file$8, 12, 67, 380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t0_value !== (t0_value = /*row*/ ctx[0].key + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(13:31) {#if \\\"key\\\" in row && row.key !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (10:41) {#if "key" in row && row.key !== ""}
    function create_if_block_4(ctx) {
    	let span;
    	let t0_value = /*row*/ ctx[0].key + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			attr_dev(span, "class", "key");
    			add_location(span, file$8, 9, 77, 193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t0_value !== (t0_value = /*row*/ ctx[0].key + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(10:41) {#if \\\"key\\\" in row && row.key !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if row.type && row.type !== "ARRAY+OBJECT" && row.type !== "ARRAY+SUB_ARRAY"}
    function create_if_block_2(ctx) {
    	let span;
    	let t_value = /*row*/ ctx[0].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "type svelte-1lljhvw");
    			add_location(span, file$8, 15, 0, 542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t_value !== (t_value = /*row*/ ctx[0].type + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(15:0) {#if row.type && row.type !== \\\"ARRAY+OBJECT\\\" && row.type !== \\\"ARRAY+SUB_ARRAY\\\"}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if row.len}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*row*/ ctx[0].len + "";
    	let t1;
    	let t2;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty("len" + (/*isExpanded*/ ctx[1] ? " grey" : "")) + " svelte-1lljhvw"));
    			add_location(span, file$8, 18, 0, 599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t1_value !== (t1_value = /*row*/ ctx[0].len + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*isExpanded*/ 2 && span_class_value !== (span_class_value = "" + (null_to_empty("len" + (/*isExpanded*/ ctx[1] ? " grey" : "")) + " svelte-1lljhvw"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(18:0) {#if row.len}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*row*/ ctx[0].type === "Tag") return create_if_block$5;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
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
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RowText", slots, []);
    	let { row } = $$props;
    	let { isExpanded = false } = $$props;
    	const writable_props = ["row", "isExpanded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RowText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    		if ("isExpanded" in $$props) $$invalidate(1, isExpanded = $$props.isExpanded);
    	};

    	$$self.$capture_state = () => ({ row, isExpanded });

    	$$self.$inject_state = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    		if ("isExpanded" in $$props) $$invalidate(1, isExpanded = $$props.isExpanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [row, isExpanded];
    }

    class RowText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { row: 0, isExpanded: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RowText",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*row*/ ctx[0] === undefined && !("row" in props)) {
    			console.warn("<RowText> was created without expected prop 'row'");
    		}
    	}

    	get row() {
    		throw new Error("<RowText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<RowText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isExpanded() {
    		throw new Error("<RowText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isExpanded(value) {
    		throw new Error("<RowText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function domParser(node) {
        // parses the dom from body downwards into a simplified ast, e.g.
        // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }

        let html = node || document.body;
        let arr = getTag(html);

        function getTag(el) {
            if (el && el.tagName && el.tagName !== "SCRIPT" && !el.className.includes("svelte-object-explorer-wrapper ")) {
                const textContent = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild.textContent : "";
                const svelteExplorerTag = isSvelteExplorerTag(el) ? el.dataset["svelteExplorerTag"] : el.tagName;
                return {
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
            return [...el.childNodes].map(getTag).filter((t) => t !== null);
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
        const push_each_row = (val_new, i) => {
            const key_new = i ? "" : key; //only show key in first row of multiline
            const indent = i ? key_length + level + 3 : level + 1;
            new_row_settings = {
                ...new_row_settings,
                key: key_new,
                val: val_new,
                indent: indent,
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
            val: cache.myStore,
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

    const { Object: Object_1, console: console_1 } = globals;
    const file$9 = "src/Index.svelte";

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

    // (131:0) {#if toggle}
    function create_if_block$6(ctx) {
    	let div;
    	let pausebutton;
    	let t0;
    	let cachedisplay;
    	let t1;
    	let table;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	pausebutton = new PauseButton({
    			props: {
    				isPaused: /*isPaused*/ ctx[4],
    				pause: /*pause*/ ctx[15],
    				unpause: /*unpause*/ ctx[14]
    			},
    			$$inline: true
    		});

    	cachedisplay = new CacheDisplay({
    			props: {
    				cache: /*cache*/ ctx[9],
    				rateLimit: /*rateLimit*/ ctx[0],
    				rateLimitDefault: /*rateLimitDefault*/ ctx[10]
    			},
    			$$inline: true
    		});

    	let each_value = /*topLevelObjectArray*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pausebutton.$$.fragment);
    			t0 = space();
    			create_component(cachedisplay.$$.fragment);
    			t1 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(table, "class", "svelte-10jhld9");
    			add_location(table, file$9, 139, 0, 3705);
    			attr_dev(div, "id", "svelteObjectExplorer");

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[3] ? "" : " tree-hide") + (/*fade*/ ctx[2]
    			? /*hovering*/ ctx[5] ? " noFade" : " fade"
    			: " noFade")) + " svelte-10jhld9"));

    			add_location(div, file$9, 131, 0, 3389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pausebutton, div, null);
    			append_dev(div, t0);
    			mount_component(cachedisplay, div, null);
    			append_dev(div, t1);
    			append_dev(div, table);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[23], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const pausebutton_changes = {};
    			if (dirty[0] & /*isPaused*/ 16) pausebutton_changes.isPaused = /*isPaused*/ ctx[4];
    			pausebutton.$set(pausebutton_changes);
    			const cachedisplay_changes = {};
    			if (dirty[0] & /*cache*/ 512) cachedisplay_changes.cache = /*cache*/ ctx[9];
    			if (dirty[0] & /*rateLimit*/ 1) cachedisplay_changes.rateLimit = /*rateLimit*/ ctx[0];
    			cachedisplay.$set(cachedisplay_changes);

    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 12736) {
    				each_value = /*topLevelObjectArray*/ ctx[8];
    				validate_each_argument(each_value);
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

    			if (!current || dirty[0] & /*toggle, fade, hovering*/ 44 && div_class_value !== (div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[3] ? "" : " tree-hide") + (/*fade*/ ctx[2]
    			? /*hovering*/ ctx[5] ? " noFade" : " fade"
    			: " noFade")) + " svelte-10jhld9"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pausebutton.$$.fragment, local);
    			transition_in(cachedisplay.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pausebutton.$$.fragment, local);
    			transition_out(cachedisplay.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pausebutton);
    			destroy_component(cachedisplay);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(131:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (148:0) {#if ( rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef)))) )}
    function create_if_block_1$2(ctx) {
    	let div;
    	let rowtext;
    	let t0;
    	let chevronbuttons;
    	let t1;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	rowtext = new RowText({
    			props: {
    				row: /*row*/ ctx[33],
    				isExpanded: /*row*/ ctx[33].expandable && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)
    			},
    			$$inline: true
    		});

    	chevronbuttons = new ChevronButtons({
    			props: {
    				row: /*row*/ ctx[33],
    				rowsToShow: /*rowsToShow*/ ctx[6],
    				rowContract: /*rowContract*/ ctx[12],
    				rowExpand: /*rowExpand*/ ctx[13]
    			},
    			$$inline: true
    		});

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[20](/*row*/ ctx[33]);
    	}

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[21](/*row*/ ctx[33], /*topLevelObject*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(rowtext.$$.fragment);
    			t0 = text("\n");
    			create_component(chevronbuttons.$$.fragment);
    			t1 = text("\n");

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[7] === /*row*/ ctx[33].indexRef || /*row*/ ctx[33].parentIndexRef.startsWith(/*hoverRow*/ ctx[7])
    			? "row hoverRow"
    			: "row") + " svelte-10jhld9"));

    			add_location(div, file$9, 151, 0, 4058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(rowtext, div, null);
    			append_dev(div, t0);
    			mount_component(chevronbuttons, div, null);
    			append_dev(div, t1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const rowtext_changes = {};
    			if (dirty[0] & /*topLevelObjectArray*/ 256) rowtext_changes.row = /*row*/ ctx[33];
    			if (dirty[0] & /*topLevelObjectArray, rowsToShow*/ 320) rowtext_changes.isExpanded = /*row*/ ctx[33].expandable && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef);
    			rowtext.$set(rowtext_changes);
    			const chevronbuttons_changes = {};
    			if (dirty[0] & /*topLevelObjectArray*/ 256) chevronbuttons_changes.row = /*row*/ ctx[33];
    			if (dirty[0] & /*rowsToShow*/ 64) chevronbuttons_changes.rowsToShow = /*rowsToShow*/ ctx[6];
    			chevronbuttons.$set(chevronbuttons_changes);

    			if (!current || dirty[0] & /*hoverRow, topLevelObjectArray*/ 384 && div_class_value !== (div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[7] === /*row*/ ctx[33].indexRef || /*row*/ ctx[33].parentIndexRef.startsWith(/*hoverRow*/ ctx[7])
    			? "row hoverRow"
    			: "row") + " svelte-10jhld9"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rowtext.$$.fragment, local);
    			transition_in(chevronbuttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rowtext.$$.fragment, local);
    			transition_out(chevronbuttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(rowtext);
    			destroy_component(chevronbuttons);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(148:0) {#if ( rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef)))) )}",
    		ctx
    	});

    	return block;
    }

    // (147:0) {#each topLevelObject.childRows as row}
    function create_each_block_1(ctx) {
    	let show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].parentIndexRef) && (!/*row*/ ctx[33].bracket || /*row*/ ctx[33].bracket && (/*row*/ ctx[33].expandable || /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)));
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 320) show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].parentIndexRef) && (!/*row*/ ctx[33].bracket || /*row*/ ctx[33].bracket && (/*row*/ ctx[33].expandable || /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[33].indexRef)));

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 320) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(147:0) {#each topLevelObject.childRows as row}",
    		ctx
    	});

    	return block;
    }

    // (141:0) {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
    function create_each_block(ctx) {
    	let tr;
    	let td;
    	let pre;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*topLevelObject*/ ctx[30].childRows;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			pre = element("pre");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(pre, "class", "svelte-10jhld9");
    			add_location(pre, file$9, 144, 0, 3869);
    			attr_dev(td, "class", "treeVal svelte-10jhld9");
    			add_location(td, file$9, 142, 0, 3840);
    			attr_dev(tr, "class", "treeVal svelte-10jhld9");
    			add_location(tr, file$9, 141, 0, 3781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, pre);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(pre, null);
    			}

    			append_dev(tr, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "mouseout", /*mouseout_handler*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 12736) {
    				each_value_1 = /*topLevelObject*/ ctx[30].childRows;
    				validate_each_argument(each_value_1);
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
    						each_blocks[i].m(pre, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(141:0) {#each topLevelObjectArray as topLevelObject, topLevelObject_index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let tabbutton;
    	let t;
    	let current;

    	tabbutton = new TabButton({
    			props: {
    				toggle: /*toggle*/ ctx[3],
    				tabPosition: /*tabPosition*/ ctx[1],
    				fade: /*fade*/ ctx[2],
    				hovering: /*hovering*/ ctx[5],
    				doToggle: /*doToggle*/ ctx[11]
    			},
    			$$inline: true
    		});

    	let if_block = /*toggle*/ ctx[3] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabbutton.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-object-explorer-wrapper svelte-10jhld9");
    			add_location(div, file$9, 128, 0, 3265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabbutton, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabbutton_changes = {};
    			if (dirty[0] & /*toggle*/ 8) tabbutton_changes.toggle = /*toggle*/ ctx[3];
    			if (dirty[0] & /*tabPosition*/ 2) tabbutton_changes.tabPosition = /*tabPosition*/ ctx[1];
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
    					if_block = create_if_block$6(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabbutton.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabbutton.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabbutton);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function click(index, val, type) {
    	console.log("click", index, val, type, openIndex);

    	if (Object.entries(val).length && type === "object" || val.length && type === "array") {
    		if (openIndex === index) {
    			openIndex = null;
    		} else {
    			openIndex = index;
    		}
    	}
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);
    	let rateLimitDefault = 100;
    	let stringifiedMyStoreCache = "";
    	let { myStore } = $$props;
    	let { tabPosition = "top" } = $$props;
    	let { open = null } = $$props;
    	let { fade = false } = $$props;
    	let { rateLimit = rateLimitDefault } = $$props;
    	let { initialToggleState = true } = $$props;
    	let isPaused = false;
    	let hovering = false;
    	let openIndexSetOnce = false;
    	let showManuallySelected = ["0", "0.0"];
    	let rowsToShow = [];
    	let hoverRow = "none";
    	let toggle = initialToggleState;
    	let topLevelObjectArray = [];

    	let cache = {
    		dataChanges: 0,
    		viewChanges: 0,
    		dataUpdated: new Date(),
    		viewUpdated: new Date(),
    		formatted: "",
    		myStore: null
    	};

    	let mainLoop;

    	onMount(async () => {
    		$$invalidate(6, rowsToShow = showManuallySelected);
    		if (!myStore) $$invalidate(16, myStore = lib.domParser());
    		mainLoop = timer();
    	});

    	function timer() {
    		setInterval(
    			() => {
    				refreshDataAndCache();
    			},
    			rateLimit
    		);
    	}

    	function refreshDataAndCache() {
    		if (toggle) {
    			/*
    attempt to allow bigint
    const stringifiedMyStore = JSON.stringify(myStore, (key, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
    );
    const stringifiedMyStoreCache = JSON.stringify(cache.myStore, (key, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
    );
    */
    			const stringifiedMyStore = JSON.stringify(myStore);

    			if (stringifiedMyStore !== stringifiedMyStoreCache) {
    				$$invalidate(9, cache.dataUpdated = new Date(), cache);
    				$$invalidate(9, cache.dataChanges = cache.dataChanges + 1, cache);
    				stringifiedMyStoreCache = stringifiedMyStore;
    			}

    			const time_since_last_check = cache.dataUpdated - cache.viewUpdated;

    			if (time_since_last_check > rateLimit && !isPaused) {
    				$$invalidate(9, cache.myStore = myStore, cache);
    				$$invalidate(9, cache.viewChanges = cache.viewChanges + 1, cache);
    				$$invalidate(9, cache.viewUpdated = new Date(), cache);
    				$$invalidate(9, cache.dataUpdated = cache.viewUpdated, cache);
    				$$invalidate(9, cache.formatted = transform_data$1.formatDate(cache.viewUpdated), cache);
    				stringifiedMyStoreCache = JSON.stringify(cache.myStore);
    				$$invalidate(8, topLevelObjectArray = transform_data$1.transform_data(cache)); //this should trigger a redraw

    				//open requested object
    				let openIndexRef;

    				if (!openIndexSetOnce) {
    					openIndexRef = transform_data$1.getOpenIndex(topLevelObjectArray, open);
    					openIndexSetOnce = true;
    					if (openIndexRef) rowExpand(openIndexRef);
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

    	const writable_props = ["myStore", "tabPosition", "open", "fade", "rateLimit", "initialToggleState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = row => $$invalidate(7, hoverRow = row.indexRef);
    	const mousedown_handler = (row, topLevelObject) => console.log(row.indexRef, topLevelObject.childRows, rowsToShow);
    	const mouseout_handler = () => $$invalidate(7, hoverRow = null);
    	const mouseover_handler_1 = () => $$invalidate(5, hovering = true);
    	const mouseleave_handler = () => $$invalidate(5, hovering = false);

    	$$self.$$set = $$props => {
    		if ("myStore" in $$props) $$invalidate(16, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(17, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(0, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(18, initialToggleState = $$props.initialToggleState);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		TabButton,
    		PauseButton,
    		CacheDisplay,
    		ChevronButtons,
    		RowText,
    		lib,
    		transform_data: transform_data$1,
    		rateLimitDefault,
    		stringifiedMyStoreCache,
    		myStore,
    		tabPosition,
    		open,
    		fade,
    		rateLimit,
    		initialToggleState,
    		isPaused,
    		hovering,
    		openIndexSetOnce,
    		showManuallySelected,
    		rowsToShow,
    		hoverRow,
    		toggle,
    		topLevelObjectArray,
    		cache,
    		mainLoop,
    		timer,
    		refreshDataAndCache,
    		doToggle,
    		rowContract,
    		rowExpand,
    		click,
    		unpause,
    		pause
    	});

    	$$self.$inject_state = $$props => {
    		if ("rateLimitDefault" in $$props) $$invalidate(10, rateLimitDefault = $$props.rateLimitDefault);
    		if ("stringifiedMyStoreCache" in $$props) stringifiedMyStoreCache = $$props.stringifiedMyStoreCache;
    		if ("myStore" in $$props) $$invalidate(16, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(17, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(0, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(18, initialToggleState = $$props.initialToggleState);
    		if ("isPaused" in $$props) $$invalidate(4, isPaused = $$props.isPaused);
    		if ("hovering" in $$props) $$invalidate(5, hovering = $$props.hovering);
    		if ("openIndexSetOnce" in $$props) openIndexSetOnce = $$props.openIndexSetOnce;
    		if ("showManuallySelected" in $$props) $$invalidate(19, showManuallySelected = $$props.showManuallySelected);
    		if ("rowsToShow" in $$props) $$invalidate(6, rowsToShow = $$props.rowsToShow);
    		if ("hoverRow" in $$props) $$invalidate(7, hoverRow = $$props.hoverRow);
    		if ("toggle" in $$props) $$invalidate(3, toggle = $$props.toggle);
    		if ("topLevelObjectArray" in $$props) $$invalidate(8, topLevelObjectArray = $$props.topLevelObjectArray);
    		if ("cache" in $$props) $$invalidate(9, cache = $$props.cache);
    		if ("mainLoop" in $$props) mainLoop = $$props.mainLoop;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*toggle, showManuallySelected*/ 524296) {
    			 if (toggle) $$invalidate(6, rowsToShow = showManuallySelected);
    		}

    		if ($$self.$$.dirty[0] & /*rateLimit*/ 1) {
    			 if (rateLimit === null) $$invalidate(0, rateLimit = rateLimitDefault);
    		}
    	};

    	return [
    		rateLimit,
    		tabPosition,
    		fade,
    		toggle,
    		isPaused,
    		hovering,
    		rowsToShow,
    		hoverRow,
    		topLevelObjectArray,
    		cache,
    		rateLimitDefault,
    		doToggle,
    		rowContract,
    		rowExpand,
    		unpause,
    		pause,
    		myStore,
    		open,
    		initialToggleState,
    		showManuallySelected,
    		mouseover_handler,
    		mousedown_handler,
    		mouseout_handler,
    		mouseover_handler_1,
    		mouseleave_handler
    	];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				myStore: 16,
    				tabPosition: 1,
    				open: 17,
    				fade: 2,
    				rateLimit: 0,
    				initialToggleState: 18
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*myStore*/ ctx[16] === undefined && !("myStore" in props)) {
    			console_1.warn("<Index> was created without expected prop 'myStore'");
    		}
    	}

    	get myStore() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set myStore(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabPosition() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabPosition(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rateLimit() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rateLimit(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialToggleState() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialToggleState(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function createCount() {
        const { subscribe, set, update } = writable(0);

        return {
            subscribe,
            increment: () => update(n => n + 1),
            decrement: () => update(n => n - 1),
            reset: () => set(0)
        };
    }

    const count = createCount();

    /* src/Example.svelte generated by Svelte v3.38.3 */

    const { Error: Error_1, console: console_1$1 } = globals;
    const file$a = "src/Example.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (121:0) {:else}
    function create_else_block$4(ctx) {
    	let span0;
    	let t0;
    	let span3;
    	let t1;
    	let span2;
    	let t2;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = space();
    			span3 = element("span");
    			t1 = text("level 4\n");
    			span2 = element("span");
    			t2 = text("level 5 ");
    			span1 = element("span");
    			span1.textContent = "level 6";
    			attr_dev(span0, "data-svelte-explorer-tag", ":else");
    			add_location(span0, file$a, 121, 0, 2678);
    			add_location(span1, file$a, 125, 8, 2750);
    			add_location(span2, file$a, 124, 0, 2735);
    			add_location(span3, file$a, 122, 0, 2720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span3, anchor);
    			append_dev(span3, t1);
    			append_dev(span3, span2);
    			append_dev(span2, t2);
    			append_dev(span2, span1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(121:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:0) {#if counter % 2}
    function create_if_block$7(ctx) {
    	let span1;
    	let t0;
    	let span0;
    	let t2;
    	let span2;

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			t0 = text("level 2\n");
    			span0 = element("span");
    			span0.textContent = "level 3";
    			t2 = space();
    			span2 = element("span");
    			add_location(span0, file$a, 117, 0, 2598);
    			add_location(span1, file$a, 115, 0, 2583);
    			attr_dev(span2, "data-svelte-explorer-tag", ":else");
    			add_location(span2, file$a, 119, 0, 2628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(115:0) {#if counter % 2}",
    		ctx
    	});

    	return block;
    }

    // (133:0) {#each array as person}
    function create_each_block$1(ctx) {
    	let span;
    	let t0_value = /*person*/ ctx[18].first + "";
    	let t0;
    	let t1;
    	let t2_value = /*person*/ ctx[18].surname + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = text(",");
    			add_location(span, file$a, 133, 0, 2887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(133:0) {#each array as person}",
    		ctx
    	});

    	return block;
    }

    // (149:0) {:catch error}
    function create_catch_block(ctx) {
    	let span;
    	let t0;
    	let p;
    	let t1_value = /*error*/ ctx[17].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(span, "data-svelte-explorer-tag", ":catch error");
    			add_location(span, file$a, 149, 0, 3395);
    			set_style(p, "color", "red");
    			add_location(p, file$a, 150, 0, 3444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 16 && t1_value !== (t1_value = /*error*/ ctx[17].message + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(149:0) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (145:0) {:then message}
    function create_then_block(ctx) {
    	let span0;
    	let t0;
    	let p;
    	let t1;
    	let t2_value = /*message*/ ctx[16] + "";
    	let t2;
    	let t3;
    	let t4;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = space();
    			p = element("p");
    			t1 = text("Async Timer Message is '");
    			t2 = text(t2_value);
    			t3 = text("'");
    			t4 = space();
    			span1 = element("span");
    			attr_dev(span0, "data-svelte-explorer-tag", ":then message");
    			add_location(span0, file$a, 145, 0, 3239);
    			add_location(p, file$a, 146, 0, 3289);
    			attr_dev(span1, "data-svelte-explorer-tag", ":catch error");
    			add_location(span1, file$a, 147, 0, 3331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 16 && t2_value !== (t2_value = /*message*/ ctx[16] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(145:0) {:then message}",
    		ctx
    	});

    	return block;
    }

    // (141:16)  <p>...waiting</p> <span data-svelte-explorer-tag=":then message" /> <span data-svelte-explorer-tag=":catch error" /> {:then message}
    function create_pending_block(ctx) {
    	let p;
    	let t1;
    	let span0;
    	let t2;
    	let span1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			t1 = space();
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			add_location(p, file$a, 141, 0, 3106);
    			attr_dev(span0, "data-svelte-explorer-tag", ":then message");
    			add_location(span0, file$a, 142, 0, 3124);
    			attr_dev(span1, "data-svelte-explorer-tag", ":catch error");
    			add_location(span1, file$a, 143, 0, 3174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(141:16)  <p>...waiting</p> <span data-svelte-explorer-tag=\\\":then message\\\" /> <span data-svelte-explorer-tag=\\\":catch error\\\" /> {:then message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let svelteobjectexplorer;
    	let t0;
    	let div3;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let span0;
    	let t6;
    	let div2;
    	let t7;
    	let span1;
    	let t8;
    	let div0;
    	let span2;
    	let t9;
    	let div1;
    	let button0;
    	let t11;
    	let span3;
    	let promise_1;
    	let t12;
    	let span4;
    	let t13;
    	let p2;
    	let t15;
    	let h20;
    	let t16;
    	let t17;
    	let t18;
    	let h21;
    	let t19;
    	let t20;
    	let t21;
    	let button1;
    	let t23;
    	let button2;
    	let t25;
    	let button3;
    	let current;
    	let mounted;
    	let dispose;

    	svelteobjectexplorer = new Index({
    			props: {
    				myStore: /*myStore*/ ctx[3],
    				open: /*open*/ ctx[6],
    				fade: /*fade*/ ctx[7],
    				tabPosition: /*tabPosition*/ ctx[8],
    				rateLimit: /*rateLimit*/ ctx[9]
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*counter*/ ctx[1] % 2) return create_if_block$7;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*array*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 16,
    		error: 17
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[4], info);

    	const block = {
    		c: function create() {
    			create_component(svelteobjectexplorer.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte Object Explorer";
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Provides a simple to use, quick a dirty hideable list of whatever data you wish to temporarily view whilst you\nare developing your app, rather than console.logging or debugging.";
    			t5 = space();
    			span0 = element("span");
    			t6 = space();
    			div2 = element("div");
    			t7 = text("level 1\n");
    			span1 = element("span");
    			if_block.c();
    			t8 = space();
    			div0 = element("div");
    			span2 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Trigger Async Timer again";
    			t11 = space();
    			span3 = element("span");
    			info.block.c();
    			t12 = space();
    			span4 = element("span");
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Displays most kinds of data: array, object, string, number, boolean, symbol";
    			t15 = space();
    			h20 = element("h2");
    			t16 = text("Autocounter from component state: ");
    			t17 = text(/*counter*/ ctx[1]);
    			t18 = space();
    			h21 = element("h2");
    			t19 = text("Manual counter from custom store: ");
    			t20 = text(/*$count*/ ctx[2]);
    			t21 = space();
    			button1 = element("button");
    			button1.textContent = "-";
    			t23 = space();
    			button2 = element("button");
    			button2.textContent = "+";
    			t25 = space();
    			button3 = element("button");
    			button3.textContent = "reset";
    			add_location(h1, file$a, 101, 0, 2195);
    			add_location(p0, file$a, 103, 0, 2228);
    			add_location(p1, file$a, 106, 0, 2252);
    			attr_dev(span0, "data-svelte-explorer-tag", "#component:src/App.svelte");
    			add_location(span0, file$a, 110, 0, 2439);
    			attr_dev(span1, "data-svelte-explorer-tag", "#if counter % 2");
    			add_location(span1, file$a, 113, 0, 2515);
    			attr_dev(span2, "data-svelte-explorer-tag", "#each array as person");
    			add_location(span2, file$a, 131, 0, 2807);
    			add_location(div0, file$a, 130, 0, 2801);
    			add_location(button0, file$a, 138, 0, 2962);
    			attr_dev(span3, "data-svelte-explorer-tag", "#await promise");
    			add_location(span3, file$a, 139, 0, 3040);
    			add_location(div1, file$a, 137, 0, 2956);
    			add_location(div2, file$a, 111, 0, 2501);
    			attr_dev(span4, "data-svelte-explorer-tag", "/component:src/App.svelte");
    			add_location(span4, file$a, 155, 0, 3517);
    			add_location(p2, file$a, 157, 0, 3580);
    			add_location(h20, file$a, 159, 0, 3664);
    			add_location(h21, file$a, 161, 0, 3718);
    			attr_dev(button1, "id", "decr");
    			add_location(button1, file$a, 163, 0, 3771);
    			attr_dev(button2, "id", "incr");
    			add_location(button2, file$a, 164, 0, 3827);
    			attr_dev(button3, "id", "reset");
    			add_location(button3, file$a, 165, 0, 3883);
    			add_location(div3, file$a, 100, 0, 2168);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svelteobjectexplorer, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h1);
    			append_dev(div3, t2);
    			append_dev(div3, p0);
    			p0.innerHTML = /*string*/ ctx[10];
    			append_dev(div3, t3);
    			append_dev(div3, p1);
    			append_dev(div3, t5);
    			append_dev(div3, span0);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, t7);
    			append_dev(div2, span1);
    			if_block.m(span1, null);
    			append_dev(div2, t8);
    			append_dev(div2, div0);
    			append_dev(div0, span2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span2, null);
    			}

    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t11);
    			append_dev(div1, span3);
    			info.block.m(span3, info.anchor = null);
    			info.mount = () => span3;
    			info.anchor = null;
    			append_dev(div3, t12);
    			append_dev(div3, span4);
    			append_dev(div3, t13);
    			append_dev(div3, p2);
    			append_dev(div3, t15);
    			append_dev(div3, h20);
    			append_dev(h20, t16);
    			append_dev(h20, t17);
    			append_dev(div3, t18);
    			append_dev(div3, h21);
    			append_dev(h21, t19);
    			append_dev(h21, t20);
    			append_dev(div3, t21);
    			append_dev(div3, button1);
    			append_dev(div3, t23);
    			append_dev(div3, button2);
    			append_dev(div3, t25);
    			append_dev(div3, button3);
    			/*div3_binding*/ ctx[12](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleAsyncTimerClick*/ ctx[11], false, false, false),
    					listen_dev(button1, "click", count.decrement, false, false, false),
    					listen_dev(button2, "click", count.increment, false, false, false),
    					listen_dev(button3, "click", count.reset, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const svelteobjectexplorer_changes = {};
    			if (dirty & /*myStore*/ 8) svelteobjectexplorer_changes.myStore = /*myStore*/ ctx[3];
    			svelteobjectexplorer.$set(svelteobjectexplorer_changes);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			}

    			if (dirty & /*array*/ 32) {
    				each_value = /*array*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			info.ctx = ctx;

    			if (dirty & /*promise*/ 16 && promise_1 !== (promise_1 = /*promise*/ ctx[4]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}

    			if (!current || dirty & /*counter*/ 2) set_data_dev(t17, /*counter*/ ctx[1]);
    			if (!current || dirty & /*$count*/ 4) set_data_dev(t20, /*$count*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svelteobjectexplorer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svelteobjectexplorer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svelteobjectexplorer, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			info.block.d();
    			info.token = null;
    			info = null;
    			/*div3_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function getAsyncTimer() {
    	const res = await timeout(3000);

    	if (res) {
    		return "async timer done";
    	} else {
    		throw new Error("async error");
    	}
    }

    function timeout(ms) {
    	return new Promise(resolve => setTimeout(() => resolve("success"), ms));
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(2, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Example", slots, []);
    	let thisPage;
    	let counter = 1;

    	let array = [
    		{ first: "Bob", surname: "Marley" },
    		{ first: "John", surname: "Lennon" },
    		{
    			first: "The Chuckle",
    			surname: "Brothers"
    		}
    	];

    	function incr() {
    		setInterval(
    			() => {
    				$$invalidate(1, counter++, counter);
    			},
    			1000
    		);
    	}

    	incr();
    	const longarray = new Array(101).fill("x").map((x, i) => "" + i);
    	let myStore;
    	let params = new URL(document.location).searchParams;
    	let open = params.get("open");
    	let fade = params.get("fade");
    	let tabPosition = params.get("tabPosition");
    	let rateLimit = params.get("rateLimit");
    	let string = "< SvelteObjectExplorer {myStore} />";
    	let promise = getAsyncTimer();

    	function handleAsyncTimerClick() {
    		$$invalidate(4, promise = getAsyncTimer());
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Example> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			thisPage = $$value;
    			$$invalidate(0, thisPage);
    		});
    	}

    	$$self.$capture_state = () => ({
    		SvelteObjectExplorer: Index,
    		count,
    		thisPage,
    		counter,
    		array,
    		incr,
    		longarray,
    		myStore,
    		params,
    		open,
    		fade,
    		tabPosition,
    		rateLimit,
    		string,
    		getAsyncTimer,
    		timeout,
    		promise,
    		handleAsyncTimerClick,
    		$count
    	});

    	$$self.$inject_state = $$props => {
    		if ("thisPage" in $$props) $$invalidate(0, thisPage = $$props.thisPage);
    		if ("counter" in $$props) $$invalidate(1, counter = $$props.counter);
    		if ("array" in $$props) $$invalidate(5, array = $$props.array);
    		if ("myStore" in $$props) $$invalidate(3, myStore = $$props.myStore);
    		if ("params" in $$props) params = $$props.params;
    		if ("open" in $$props) $$invalidate(6, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(7, fade = $$props.fade);
    		if ("tabPosition" in $$props) $$invalidate(8, tabPosition = $$props.tabPosition);
    		if ("rateLimit" in $$props) $$invalidate(9, rateLimit = $$props.rateLimit);
    		if ("string" in $$props) $$invalidate(10, string = $$props.string);
    		if ("promise" in $$props) $$invalidate(4, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*counter, $count, thisPage*/ 7) {
    			 if (counter || $count) {
    				$$invalidate(3, myStore = {
    					html: thisPage,
    					string1: "testy",
    					longstring: "Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.",
    					array,
    					array2: [[["test1", "test2"], "test2"], "test2"],
    					longarray,
    					object: {
    						test1: {
    							test1: {
    								test1: { test1: "test1", test2: "test2" },
    								test2: "test2"
    							},
    							test2: "test2"
    						},
    						test2: "test2"
    					},
    					number1: 123,
    					number2: 123.456789,
    					boolean1: true,
    					boolean2: false,
    					null: null,
    					undefined,
    					symbol1: Symbol(),
    					symbol2: Symbol("foo"),
    					arrowfunction: () => {
    						
    					},
    					arrowfunction2: (a, b, c, d) => {
    						console.log("long, long, long, long comment test");
    						arrowfunction();
    					},
    					function: function test(a, b, c, d) {
    						console.log("test");
    					},
    					deep: {
    						deep: {
    							deep: {
    								deep: {
    									deep: {
    										arrowfunction2: (a, b, c, d) => {
    											console.log("long, long, long, long comment test");
    											arrowfunction();
    										}
    									}
    								}
    							}
    						},
    						SvelteVariable: counter
    					},
    					SvelteVariable: counter,
    					customStore: count,
    					customStoreValue: $count
    				});
    			}
    		}
    	};

    	return [
    		thisPage,
    		counter,
    		$count,
    		myStore,
    		promise,
    		array,
    		open,
    		fade,
    		tabPosition,
    		rateLimit,
    		string,
    		handleAsyncTimerClick,
    		div3_binding
    	];
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    let smallTestObject = {
        test: 1,
        test2: "test2",
        test3: { test4: 4, test5: { test6: ["test6", "test7"] } }
    };

    let mediumTestObject = {
        test: [smallTestObject, smallTestObject, smallTestObject, smallTestObject, smallTestObject]
    };

    let largeTestObject = {
        test: [
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject,
            smallTestObject
        ]
    };

    const app = new Example({
        target: document.body,
        props: { testObject: { mediumTestObject, largeTestObject } }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
