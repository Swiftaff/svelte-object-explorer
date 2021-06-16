
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
            if (typeof $$scope.dirty === 'object') {
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
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
            throw new Error(`Function called outside component initialization`);
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

    const globals = (typeof window !== 'undefined' ? window : global);

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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
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
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.18.2 */

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    /* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.18.2 */

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
    	const default_slot_template = /*$$slots*/ ctx[3].default;
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

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
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
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { title, viewBox };
    	};

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	return [title, viewBox, $$scope, $$slots];
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

    /* node_modules/svelte-icons/fa/FaChevronDown.svelte generated by Svelte v3.18.2 */
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
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

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

    /* node_modules/svelte-icons/fa/FaChevronUp.svelte generated by Svelte v3.18.2 */
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
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

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

    /* src/TabButton.svelte generated by Svelte v3.18.2 */
    const file$3 = "src/TabButton.svelte";

    // (23:0) {:else}
    function create_else_block(ctx) {
    	let t;
    	let span;
    	let current;
    	const fachevronup = new FaChevronUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Show\n");
    			span = element("span");
    			create_component(fachevronup.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
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
    	let current;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Hide\n");
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
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
    			: " noFade")) + " svelte-1y2qsdu"));

    			add_location(div, file$3, 10, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

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
    			: " noFade")) + " svelte-1y2qsdu"))) {
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
    	let { toggle } = $$props;
    	let { tabPosition } = $$props;
    	let { fade } = $$props;
    	let { hovering } = $$props;
    	let { doToggle } = $$props;
    	const writable_props = ["toggle", "tabPosition", "fade", "hovering", "doToggle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$props.toggle);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("doToggle" in $$props) $$invalidate(4, doToggle = $$props.doToggle);
    	};

    	$$self.$capture_state = () => {
    		return {
    			toggle,
    			tabPosition,
    			fade,
    			hovering,
    			doToggle
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$props.toggle);
    		if ("tabPosition" in $$props) $$invalidate(1, tabPosition = $$props.tabPosition);
    		if ("fade" in $$props) $$invalidate(2, fade = $$props.fade);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("doToggle" in $$props) $$invalidate(4, doToggle = $$props.doToggle);
    	};

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

    /* node_modules/svelte-icons/fa/FaChevronRight.svelte generated by Svelte v3.18.2 */
    const file$4 = "node_modules/svelte-icons/fa/FaChevronRight.svelte";

    // (4:0) <IconBase viewBox="0 0 320 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z");
    			add_location(path, file$4, 4, 0, 119);
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

    function create_fragment$4(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 320 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChevronRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronRight",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaRegCheckSquare.svelte generated by Svelte v3.18.2 */
    const file$5 = "node_modules/svelte-icons/fa/FaRegCheckSquare.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 400H48V80h352v352zm-35.864-241.724L191.547 361.48c-4.705 4.667-12.303 4.637-16.97-.068l-90.781-91.516c-4.667-4.705-4.637-12.303.069-16.971l22.719-22.536c4.705-4.667 12.303-4.637 16.97.069l59.792 60.277 141.352-140.216c4.705-4.667 12.303-4.637 16.97.068l22.536 22.718c4.667 4.706 4.637 12.304-.068 16.971z");
    			add_location(path, file$5, 4, 0, 119);
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaRegCheckSquare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaRegCheckSquare",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaRegSquare.svelte generated by Svelte v3.18.2 */
    const file$6 = "node_modules/svelte-icons/fa/FaRegSquare.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z");
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
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaRegSquare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaRegSquare",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaClipboard.svelte generated by Svelte v3.18.2 */
    const file$7 = "node_modules/svelte-icons/fa/FaClipboard.svelte";

    // (4:0) <IconBase viewBox="0 0 384 512" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z");
    			add_location(path, file$7, 4, 0, 119);
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 384 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 384 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaClipboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaClipboard",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaClipboardCheck.svelte generated by Svelte v3.18.2 */
    const file$8 = "node_modules/svelte-icons/fa/FaClipboardCheck.svelte";

    // (4:0) <IconBase viewBox="0 0 384 512" {...$$props}>
    function create_default_slot$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z");
    			add_location(path, file$8, 4, 0, 119);
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
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 384 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 384 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	const iconbase = new IconBase({ props: iconbase_props, $$inline: true });

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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaClipboardCheck extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaClipboardCheck",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    function domParser() {
        // parses the dom from body downwards into a simplified ast, e.g.
        // { class: "classname", tag: "H1", children: [el, el, el] }

        let html = document.body;
        console.log(html);
        let arr = getTag(html);
        console.log(arr);

        function getTag(el) {
            if (el.tagName && el.tagName !== "SCRIPT" && !el.className.includes("svelte-objet-explorer-wrapper ")) {
                return { class: el.className, tag: el.tagName, children: getChildren(el) };
            } else {
                return null;
            }
        }

        function getChildren(el) {
            return [...el.childNodes].map(getTag).filter((t) => t !== null);
        }
        return arr;
    }

    var lib = { domParser };

    const indentSpaces = 2;

    function code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "null", level),
            type: "Null",
        });
    }

    function code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "undefined", level),
            type: "Undefined",
        });
    }

    function code_format_boolean(indexRef, parentIndexRef, index, parentArr, bool, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + (bool ? "true" : "false"), level),
            type: "Boolean",
        });
    }

    function code_format_string(indexRef, parentIndexRef, index, parentArr, str, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "'" + str + "'", level),
            type: "String",
        });
    }

    function code_format_number(indexRef, parentIndexRef, index, parentArr, num, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + num, level),
            type: "Number",
        });
    }

    function code_format_symbol(indexRef, parentIndexRef, index, parentArr, sym, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "'" + sym.toString() + "'", level),
            type: "Symbol",
        });
    }

    function code_format_function(indexRef, parentIndexRef, index, parentArr, fn, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "'" + fn.name + "'", level),
            type: "Function",
        });
    }

    function code_format_array(indexRef, parentIndexRef, index, parentArr, arr, level, optionalIndex, optionalNewLine) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(
                (optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex),
                level
            ),
            type: "Array",
            len: arr.length,
            expandable: true,
        });
        if (optionalNewLine) {
            parentArr.push({
                indexRef,
                parentIndexRef,
                index,
                output: indent_row("[", level + (optionalIndex ? 1 : 0)),
                bracket: true,
            });
        }
        arr.map((value, arrIndex) =>
            formatByType(
                indexRef + "." + arrIndex,
                indexRef,
                arrIndex,
                parentArr,
                value,
                level + (optionalIndex ? 2 : 1),
                arrIndex,
                true
            )
        );
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row("]", level + (optionalIndex ? 1 : 0)),
            bracket: true,
        });
    }

    function code_format_array_long(
        indexRef,
        parentIndexRef,
        index,
        parentArr,
        arr,
        level,
        optionalIndex,
        optionalNewLine
    ) {
        code_format_string(
            indexRef,
            parentIndexRef,
            index,
            parentArr,
            "Array is very long (" + value.length + ")",
            level,
            optionalIndex
        );
        for (let i = 0; i < value.length; i += 100) {
            let end = i + 100 > value.length - 1 ? value.length : i + 99;
            let tempArr = value.slice(i, end);
            code_format_array(
                indexRef + "." + i,
                parentIndexRef,
                index,
                parentArr,
                tempArr,
                level + 1,
                optionalIndex + " (" + i + " to " + end + ")",
                optionalNewLine
            );
        }
    }

    function code_format_object(indexRef, parentIndexRef, index, parentArr, obj, level, optionalIndex, optionalNewLine) {
        let object = Object.entries(obj);
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(
                (optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex),
                level
            ),
            type: "Object",
            len: object.length,
            expandable: true,
        });
        if (optionalNewLine) {
            parentArr.push({
                indexRef,
                parentIndexRef,
                index,
                output: indent_row("{", level + (optionalIndex ? 1 : 0)),
                bracket: true,
            });
        }
        object.forEach(([key, value], objIndex) => {
            formatByType(
                indexRef + "." + objIndex,
                indexRef,
                objIndex,
                parentArr,
                value,
                level + (optionalIndex || optionalNewLine ? 2 : 1),
                key,
                true
            );
        });
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row("}", level + (optionalIndex || optionalNewLine ? 1 : 0)),
            bracket: true,
        });
    }

    function code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
        parentArr.push({
            indexRef,
            parentIndexRef,
            index,
            output: indent_row(code_format_index(optionalIndex) + "!!unknown!!", level),
        });
    }

    function code_format_index(optionalIndex) {
        return typeof optionalIndex !== "undefined" ? optionalIndex + ": " : "";
    }

    function indent_row(row, level) {
        return " ".repeat(level * indentSpaces) + row;
    }

    //formatByType("0.0", "0", 0, parentArr, object, 0);
    function formatByType(
        //
        indexRef,
        parentIndexRef, //e.g. "1.1.2.3"
        index, // e.g. 4, if this item is 1.1.2.3.4
        //
        parentArr,
        value,
        level,
        optionalIndex,
        optionalNewLine
    ) {
        //console.log("formatByType", value);
        if (value === null) code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
        else if (typeof value === "undefined")
            code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
        else if (typeof value === "boolean")
            code_format_boolean(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
        else if (typeof value === "string")
            code_format_string(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
        else if (typeof value === "number")
            code_format_number(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
        else if (typeof value === "symbol")
            code_format_symbol(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
        else if (typeof value === "function")
            code_format_function(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex);
        else if (Array.isArray(value))
            if (value.length > 100) {
                code_format_array_long(
                    indexRef,
                    parentIndexRef,
                    index,
                    parentArr,
                    value,
                    level,
                    optionalIndex,
                    optionalNewLine
                );
            } else {
                code_format_array(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine);
            }
        else if (typeof value === "object")
            code_format_object(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine);
        else code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
    }

    function valueFormatterToArr(object) {
        //console.log("valueFormatterToArr");
        let parentArr = []; //[{ output: '   test:"test"', type: "string" }];
        formatByType("0.0", "0", 0, parentArr, object, 0); // <- make this assign to parentArr specifically instead of with JS magic

        return parentArr;
    }

    function transform_data(cache) {
        let tempArr = [];
        for (const key in cache.myStore) {
            if (cache.myStore.hasOwnProperty(key)) {
                let tempItem = {
                    key,
                    val: cache.myStore[key],
                    type: getType(cache.myStore[key]),
                };
                tempItem.class = displayClass(tempItem);
                tempItem.valType = displayValType(tempItem.val);
                tempItem.childRows = valueFormatterToArr(tempItem.val);
                tempArr.push(tempItem);
            }
        }
        tempArr.sort(sort_byKey);
        tempArr = tempArr.map((item, index) => {
            return { ...item, index };
        });
        return tempArr;
    }

    function displayValType(val) {
        if (val === null) {
            return "null";
        } else if (getType(val) === "function") {
            return "fn()";
        } else if (getType(val) === "object") {
            return Object.entries(val).length ? "view Obj..." : "{ }";
        } else if (getType(val) === "array") {
            return val.length ? "view Arr..." : "[ ]";
        } else if (getType(val) === "boolean") {
            return val ? "true" : "false";
        } else if (getType(val) === "string") {
            return val;
        } else if (getType(val) === "number") {
            return JSON.stringify(val);
        }
    }

    function getType(val) {
        return Array.isArray(val) ? "array" : typeof val;
    }

    function displayClass(testy) {
        let isObject = testy.val ? Object.entries(testy.val).length : false;
        let accordion = testy.type !== "string" ? "accordion" : "";
        return testy.val !== [] && testy.val !== null && isObject ? accordion + " tree_" + testy.type : "";
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

    function getOpenIndex(arr, open, openIndexSetOnce) {
        console.log(arr);
        let i = null;
        if (arr && arr.length) {
            arr.map((item, index) => {
                if (item.key === open && (item.type === "object" || item.type == "array")) i = index;
            });
        }
        return i;
    }

    function getAllIndexes(arrayToMap, openIndex) {
        //update the showallarray with all rows from parentArr
        //console.log(arrayToMap, openIndex);
        let arr = [];
        if (openIndex && arrayToMap[openIndex] && arrayToMap[openIndex].childRows)
            arrayToMap[openIndex].childRows.map((row) => {
                arr.push(row.index);
            });
        return arr;
    }

    var transform_data$1 = { transform_data, getOpenIndex, getAllIndexes };

    /* src/Index.svelte generated by Svelte v3.18.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$9 = "src/Index.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    // (139:0) {#if toggle}
    function create_if_block$2(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*cache*/ ctx[11].dataChanges + "";
    	let t1;
    	let t2;
    	let t3_value = /*cache*/ ctx[11].viewChanges + "";
    	let t3;
    	let t4;
    	let br;
    	let t5;
    	let t6_value = /*cache*/ ctx[11].formatted + "";
    	let t6;
    	let t7;
    	let table;
    	let colgroup;
    	let col0;
    	let t8;
    	let col1;
    	let t9;
    	let col2;
    	let t10;
    	let div_class_value;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isPaused*/ ctx[2]) return create_if_block_12;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*topLevelObjectArray*/ ctx[10];
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
    			if_block.c();
    			t0 = text("\nData Changes(");
    			t1 = text(t1_value);
    			t2 = text(") View Changes(");
    			t3 = text(t3_value);
    			t4 = text(")\n");
    			br = element("br");
    			t5 = text("\nLast Updated(");
    			t6 = text(t6_value);
    			t7 = text(")\n");
    			table = element("table");
    			colgroup = element("colgroup");
    			col0 = element("col");
    			t8 = space();
    			col1 = element("col");
    			t9 = space();
    			col2 = element("col");
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(br, file$9, 165, 0, 4155);
    			set_style(col0, "width", "35%");
    			add_location(col0, file$9, 169, 0, 4213);
    			set_style(col1, "width", "10%");
    			add_location(col1, file$9, 170, 0, 4239);
    			set_style(col2, "width", "55%");
    			add_location(col2, file$9, 171, 0, 4265);
    			add_location(colgroup, file$9, 168, 0, 4202);
    			attr_dev(table, "class", "svelte-1y2qsdu");
    			add_location(table, file$9, 167, 0, 4194);
    			attr_dev(div, "id", "svelteObjectExplorer");

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[9] ? "" : " tree-hide") + (/*fade*/ ctx[1]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
    			: " noFade")) + " svelte-1y2qsdu"));

    			add_location(div, file$9, 139, 0, 3661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, br);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, table);
    			append_dev(table, colgroup);
    			append_dev(colgroup, col0);
    			append_dev(colgroup, t8);
    			append_dev(colgroup, col1);
    			append_dev(colgroup, t9);
    			append_dev(colgroup, col2);
    			append_dev(table, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[38], false, false, false),
    				listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[39], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			}

    			if ((!current || dirty[0] & /*cache*/ 2048) && t1_value !== (t1_value = /*cache*/ ctx[11].dataChanges + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*cache*/ 2048) && t3_value !== (t3_value = /*cache*/ ctx[11].viewChanges + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*cache*/ 2048) && t6_value !== (t6_value = /*cache*/ ctx[11].formatted + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand, openIndex, copyToClipboard, showClipboardText, toggleShowAll, showAll, click*/ 251376) {
    				each_value = /*topLevelObjectArray*/ ctx[10];
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

    			if (!current || dirty[0] & /*toggle, fade, hovering*/ 522 && div_class_value !== (div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[9] ? "" : " tree-hide") + (/*fade*/ ctx[1]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
    			: " noFade")) + " svelte-1y2qsdu"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
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
    			if (detaching) detach_dev(div);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(139:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (155:0) {:else}
    function create_else_block_4(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Pause";
    			attr_dev(button, "class", "svelte-1y2qsdu");
    			add_location(button, file$9, 155, 0, 3992);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "mouseup", /*mouseup_handler_1*/ ctx[31], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(155:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (146:0) {#if isPaused}
    function create_if_block_12(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "un-Pause";
    			attr_dev(button, "class", "svelte-1y2qsdu");
    			add_location(button, file$9, 146, 0, 3891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "mouseup", /*mouseup_handler*/ ctx[30], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(146:0) {#if isPaused}",
    		ctx
    	});

    	return block;
    }

    // (180:0) {#if testy.class}
    function create_if_block_10(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_11, create_else_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*openIndex*/ ctx[5] === /*i*/ ctx[42]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
    			add_location(span, file$9, 180, 0, 4493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

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
    				if_block.m(span, null);
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
    			if (detaching) detach_dev(span);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(180:0) {#if testy.class}",
    		ctx
    	});

    	return block;
    }

    // (184:0) {:else}
    function create_else_block_3(ctx) {
    	let current;
    	const fachevronright = new FaChevronRight({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fachevronright.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fachevronright, target, anchor);
    			current = true;
    		},
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
    			destroy_component(fachevronright, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(184:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (182:0) {#if openIndex === i}
    function create_if_block_11(ctx) {
    	let current;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fachevrondown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fachevrondown, target, anchor);
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
    			destroy_component(fachevrondown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(182:0) {#if openIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (194:0) {#if openIndex === i}
    function create_if_block_1(ctx) {
    	let tr0;
    	let td0;
    	let t0;
    	let tr1;
    	let td1;
    	let pre;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let t2;
    	let div1;
    	let current_block_type_index_1;
    	let if_block1;
    	let t3;
    	let input;
    	let t4;
    	let t5;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_9, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*showAll*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block_8, create_else_block_1];
    	const if_blocks_1 = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*showClipboardText*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_3(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	let if_block2 = /*openIndex*/ ctx[5] === /*i*/ ctx[42] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			t0 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			pre = element("pre");
    			div0 = element("div");
    			if_block0.c();
    			t1 = text("\nShow all");
    			t2 = text("\n");
    			div1 = element("div");
    			if_block1.c();
    			t3 = text("\n");
    			input = element("input");
    			t4 = text("\n\n");
    			if (if_block2) if_block2.c();
    			t5 = space();
    			attr_dev(td0, "colspan", "3");
    			attr_dev(td0, "class", "treeVal svelte-1y2qsdu");
    			add_location(td0, file$9, 196, 0, 4790);
    			attr_dev(tr0, "class", "svelte-1y2qsdu");
    			add_location(tr0, file$9, 194, 0, 4696);
    			attr_dev(div0, "class", "toggleShowAll nopointer svelte-1y2qsdu");
    			add_location(div0, file$9, 202, 0, 4937);
    			attr_dev(input, "id", "hiddenClipboard");
    			attr_dev(input, "class", "svelte-1y2qsdu");
    			add_location(input, file$9, 230, 0, 5393);
    			attr_dev(div1, "class", "copyToClipbord nopointer svelte-1y2qsdu");
    			add_location(div1, file$9, 216, 0, 5147);
    			attr_dev(pre, "class", "svelte-1y2qsdu");
    			add_location(pre, file$9, 201, 0, 4931);
    			attr_dev(td1, "colspan", "3");
    			attr_dev(td1, "class", "treeVal svelte-1y2qsdu");
    			add_location(td1, file$9, 199, 0, 4890);
    			attr_dev(tr1, "class", "treeVal svelte-1y2qsdu");
    			add_location(tr1, file$9, 198, 0, 4831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td1);
    			append_dev(td1, pre);
    			append_dev(pre, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t1);
    			append_dev(pre, t2);
    			append_dev(pre, div1);
    			if_blocks_1[current_block_type_index_1].m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, input);
    			append_dev(pre, t4);
    			if (if_block2) if_block2.m(pre, null);
    			append_dev(tr1, t5);
    			current = true;

    			dispose = [
    				listen_dev(div0, "mousedown", /*toggleShowAll*/ ctx[12], false, false, false),
    				listen_dev(div1, "mousedown", /*copyToClipboard*/ ctx[16], false, false, false),
    				listen_dev(tr1, "mouseout", /*mouseout_handler*/ ctx[37], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t1);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_3(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div1, t3);
    			}

    			if (/*openIndex*/ ctx[5] === /*i*/ ctx[42]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(pre, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(tr1);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
    			if (if_block2) if_block2.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(194:0) {#if openIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (210:0) {:else}
    function create_else_block_2(ctx) {
    	let span;
    	let current;
    	const faregsquare = new FaRegSquare({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faregsquare.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
    			add_location(span, file$9, 210, 0, 5078);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(faregsquare, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faregsquare.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faregsquare.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faregsquare);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(210:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (206:0) {#if showAll}
    function create_if_block_9(ctx) {
    	let span;
    	let current;
    	const faregchecksquare = new FaRegCheckSquare({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faregchecksquare.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
    			add_location(span, file$9, 206, 0, 5018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(faregchecksquare, span, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faregchecksquare.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faregchecksquare.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faregchecksquare);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(206:0) {#if showAll}",
    		ctx
    	});

    	return block;
    }

    // (225:0) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t;
    	let current;
    	const faclipboard = new FaClipboard({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faclipboard.$$.fragment);
    			t = text("\nCopy to clipboard");
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
    			add_location(span, file$9, 225, 0, 5322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(faclipboard, span, null);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faclipboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faclipboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faclipboard);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(225:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (220:0) {#if showClipboardText}
    function create_if_block_8(ctx) {
    	let span;
    	let t;
    	let current;
    	const faclipboardcheck = new FaClipboardCheck({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faclipboardcheck.$$.fragment);
    			t = text("\nCopied to clipboard!");
    			attr_dev(span, "class", "smaller svelte-1y2qsdu");
    			add_location(span, file$9, 220, 0, 5241);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(faclipboardcheck, span, null);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faclipboardcheck.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faclipboardcheck.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(faclipboardcheck);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(220:0) {#if showClipboardText}",
    		ctx
    	});

    	return block;
    }

    // (234:0) {#if openIndex === i}
    function create_if_block_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*testy*/ ctx[40].childRows;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 50496) {
    				each_value_1 = /*testy*/ ctx[40].childRows;
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
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(234:0) {#if openIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (236:0) {#if rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && rowsToShow.includes(row.indexRef)))}
    function create_if_block_3(ctx) {
    	let div;
    	let span;
    	let t0_value = /*row*/ ctx[43].output + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div_class_value;
    	let current;
    	let dispose;
    	let if_block0 = /*row*/ ctx[43].type && create_if_block_7(ctx);
    	let if_block1 = /*row*/ ctx[43].len && create_if_block_6(ctx);
    	let if_block2 = /*row*/ ctx[43].expandable && create_if_block_4(ctx);

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[35](/*row*/ ctx[43], ...args);
    	}

    	function mousedown_handler_3(...args) {
    		return /*mousedown_handler_3*/ ctx[36](/*row*/ ctx[43], /*testy*/ ctx[40], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text("\n");
    			if (if_block0) if_block0.c();
    			t2 = text("\n");
    			if (if_block1) if_block1.c();
    			t3 = text("\n");
    			if (if_block2) if_block2.c();
    			t4 = text("\n");
    			add_location(span, file$9, 240, 0, 5834);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[8] === /*row*/ ctx[43].indexRef || /*row*/ ctx[43].parentIndexRef.startsWith(/*hoverRow*/ ctx[8])
    			? "row hoverRow"
    			: "row") + " svelte-1y2qsdu"));

    			add_location(div, file$9, 236, 0, 5603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t2);
    			if (if_block1) if_block1.m(span, null);
    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t4);
    			current = true;

    			dispose = [
    				listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    				listen_dev(div, "mousedown", mousedown_handler_3, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*topLevelObjectArray*/ 1024) && t0_value !== (t0_value = /*row*/ ctx[43].output + "")) set_data_dev(t0, t0_value);

    			if (/*row*/ ctx[43].type) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(span, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*row*/ ctx[43].len) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*row*/ ctx[43].expandable) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*hoverRow, topLevelObjectArray*/ 1280 && div_class_value !== (div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[8] === /*row*/ ctx[43].indexRef || /*row*/ ctx[43].parentIndexRef.startsWith(/*hoverRow*/ ctx[8])
    			? "row hoverRow"
    			: "row") + " svelte-1y2qsdu"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(236:0) {#if rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && rowsToShow.includes(row.indexRef)))}",
    		ctx
    	});

    	return block;
    }

    // (243:0) {#if row.type}
    function create_if_block_7(ctx) {
    	let span;
    	let t_value = /*row*/ ctx[43].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "type svelte-1y2qsdu");
    			add_location(span, file$9, 243, 0, 5869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*topLevelObjectArray*/ 1024 && t_value !== (t_value = /*row*/ ctx[43].type + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(243:0) {#if row.type}",
    		ctx
    	});

    	return block;
    }

    // (246:0) {#if row.len}
    function create_if_block_6(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*row*/ ctx[43].len + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(span, "class", "len svelte-1y2qsdu");
    			add_location(span, file$9, 246, 0, 5926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*topLevelObjectArray*/ 1024 && t1_value !== (t1_value = /*row*/ ctx[43].len + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(246:0) {#if row.len}",
    		ctx
    	});

    	return block;
    }

    // (250:0) {#if row.expandable}
    function create_if_block_4(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 1088) show_if = !!/*rowsToShow*/ ctx[6].includes(/*row*/ ctx[43].indexRef);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_4(ctx, -1);
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
    			current_block_type_index = select_block_type_4(ctx, dirty);

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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(250:0) {#if row.expandable}",
    		ctx
    	});

    	return block;
    }

    // (257:0) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let current;
    	let dispose;
    	const fachevronright = new FaChevronRight({ $$inline: true });

    	function mousedown_handler_2(...args) {
    		return /*mousedown_handler_2*/ ctx[34](/*row*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevronright.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-1y2qsdu");
    			add_location(span, file$9, 257, 0, 6153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevronright, span, null);
    			current = true;
    			dispose = listen_dev(span, "mousedown", mousedown_handler_2, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(257:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (251:0) {#if rowsToShow.includes(row.indexRef)}
    function create_if_block_5(ctx) {
    	let span;
    	let current;
    	let dispose;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

    	function mousedown_handler_1(...args) {
    		return /*mousedown_handler_1*/ ctx[33](/*row*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-1y2qsdu");
    			add_location(span, file$9, 251, 0, 6038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevrondown, span, null);
    			current = true;
    			dispose = listen_dev(span, "mousedown", mousedown_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
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
    			if (detaching) detach_dev(span);
    			destroy_component(fachevrondown);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(251:0) {#if rowsToShow.includes(row.indexRef)}",
    		ctx
    	});

    	return block;
    }

    // (235:0) {#each testy.childRows as row}
    function create_each_block_1(ctx) {
    	let show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[43].parentIndexRef) && (!/*row*/ ctx[43].bracket || /*row*/ ctx[43].bracket && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[43].indexRef));
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_3(ctx);

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
    			if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 1088) show_if = /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[43].parentIndexRef) && (!/*row*/ ctx[43].bracket || /*row*/ ctx[43].bracket && /*rowsToShow*/ ctx[6].includes(/*row*/ ctx[43].indexRef));

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_3(ctx);
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
    		source: "(235:0) {#each testy.childRows as row}",
    		ctx
    	});

    	return block;
    }

    // (174:0) {#each topLevelObjectArray as testy, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let t1_value = /*testy*/ ctx[40].valType + "";
    	let t1;
    	let t2;
    	let td1;
    	let t3_value = /*testy*/ ctx[40].type + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5_value = /*testy*/ ctx[40].key + "";
    	let t5;
    	let tr_class_value;
    	let t6;
    	let if_block1_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*testy*/ ctx[40].class && create_if_block_10(ctx);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[32](/*i*/ ctx[42], /*testy*/ ctx[40], ...args);
    	}

    	let if_block1 = /*openIndex*/ ctx[5] === /*i*/ ctx[42] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			td1 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(td0, "class", "link svelte-1y2qsdu");
    			add_location(td0, file$9, 178, 0, 4457);
    			add_location(td1, file$9, 190, 0, 4625);
    			add_location(td2, file$9, 191, 0, 4647);
    			attr_dev(tr, "class", tr_class_value = "" + (null_to_empty(/*testy*/ ctx[40].class + (/*openIndex*/ ctx[5] === /*i*/ ctx[42] ? " open" : "")) + " svelte-1y2qsdu"));
    			add_location(tr, file$9, 174, 0, 4343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			if (if_block0) if_block0.m(td0, null);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, t5);
    			insert_dev(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    			dispose = listen_dev(tr, "mousedown", mousedown_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*testy*/ ctx[40].class) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(td0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty[0] & /*topLevelObjectArray*/ 1024) && t1_value !== (t1_value = /*testy*/ ctx[40].valType + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*topLevelObjectArray*/ 1024) && t3_value !== (t3_value = /*testy*/ ctx[40].type + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*topLevelObjectArray*/ 1024) && t5_value !== (t5_value = /*testy*/ ctx[40].key + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty[0] & /*topLevelObjectArray, openIndex*/ 1056 && tr_class_value !== (tr_class_value = "" + (null_to_empty(/*testy*/ ctx[40].class + (/*openIndex*/ ctx[5] === /*i*/ ctx[42] ? " open" : "")) + " svelte-1y2qsdu"))) {
    				attr_dev(tr, "class", tr_class_value);
    			}

    			if (/*openIndex*/ ctx[5] === /*i*/ ctx[42]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(174:0) {#each topLevelObjectArray as testy, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t;
    	let current;

    	const tabbutton = new TabButton({
    			props: {
    				toggle: /*toggle*/ ctx[9],
    				tabPosition: /*tabPosition*/ ctx[0],
    				fade: /*fade*/ ctx[1],
    				hovering: /*hovering*/ ctx[3],
    				doToggle: /*doToggle*/ ctx[13]
    			},
    			$$inline: true
    		});

    	let if_block = /*toggle*/ ctx[9] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabbutton.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-objet-explorer-wrapper svelte-1y2qsdu");
    			add_location(div, file$9, 136, 0, 3538);
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
    			if (dirty[0] & /*toggle*/ 512) tabbutton_changes.toggle = /*toggle*/ ctx[9];
    			if (dirty[0] & /*tabPosition*/ 1) tabbutton_changes.tabPosition = /*tabPosition*/ ctx[0];
    			if (dirty[0] & /*fade*/ 2) tabbutton_changes.fade = /*fade*/ ctx[1];
    			if (dirty[0] & /*hovering*/ 8) tabbutton_changes.hovering = /*hovering*/ ctx[3];
    			tabbutton.$set(tabbutton_changes);

    			if (/*toggle*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
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

    function instance$9($$self, $$props, $$invalidate) {
    	let { myStore } = $$props;
    	let { tabPosition = "top" } = $$props;
    	let { open = null } = $$props;
    	let { fade = false } = $$props;
    	let { rateLimit = 100 } = $$props;
    	let { initialToggleState = true } = $$props;
    	let isPaused = false;
    	let hovering = false;
    	let showAll = false;
    	let openIndex = null;
    	let openIndexSetOnce = false;
    	let showAllArr = []; //populated later with all row references
    	let showManuallySelected = ["0", "0.0"];
    	let rowsToShow = [];
    	let showClipboardText = false;
    	let clipboardCode = "";
    	let hoverRow = "none";
    	let toggle = initialToggleState;
    	let topLevelObjectArray = [];
    	let openedObjectArray = [];

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
    		//console.log(isPaused);
    		$$invalidate(6, rowsToShow = showAll ? showAllArr : showManuallySelected);

    		$$invalidate(18, myStore = lib.domParser());
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
    			if (JSON.stringify(myStore) !== JSON.stringify(cache.myStore)) {
    				$$invalidate(11, cache.dataUpdated = new Date(), cache);
    				$$invalidate(11, cache.dataChanges = cache.dataChanges + 1, cache);
    			}

    			if (cache.dataUpdated - cache.viewUpdated > rateLimit && !isPaused) {
    				$$invalidate(11, cache.myStore = JSON.parse(JSON.stringify(myStore)), cache);
    				$$invalidate(11, cache.viewChanges = cache.viewChanges + 1, cache);
    				$$invalidate(11, cache.viewUpdated = new Date(), cache);
    				$$invalidate(11, cache.formatted = formatDate(cache.viewUpdated), cache);
    				$$invalidate(10, topLevelObjectArray = transform_data$1.transform_data(cache)); //this should trigger a redraw
    				if (!openIndexSetOnce) $$invalidate(5, openIndex = transform_data$1.getOpenIndex(topLevelObjectArray, open, openIndexSetOnce));
    				$$invalidate(22, showAllArr = transform_data$1.getAllIndexes(topLevelObjectArray, openIndex));
    			}
    		}

    		function formatDate(d) {
    			return d.toDateString() + " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + ":" + d.getUTCMilliseconds();
    		}
    	}

    	// UI functions
    	function toggleShowAll() {
    		$$invalidate(4, showAll = !showAll);
    	}

    	function doToggle() {
    		$$invalidate(9, toggle = !toggle);
    	}

    	function rowContract(rowIndex) {
    		$$invalidate(4, showAll = false);
    		$$invalidate(23, showManuallySelected = showManuallySelected.filter(row => !row.startsWith(rowIndex)));
    	}

    	function rowExpand(rowIndex) {
    		$$invalidate(23, showManuallySelected = showManuallySelected.filter(row => row !== rowIndex));
    		showManuallySelected.push(rowIndex);
    	}

    	function copyToClipboard(txt) {
    		let clipboardEl = document.getElementById("hiddenClipboard");
    		clipboardEl.value = txt ? JSON.stringify(txt) : JSON.stringify(myStore);
    		clipboardEl.select();
    		document.execCommand("copy");
    		$$invalidate(7, showClipboardText = true);

    		setTimeout(
    			() => {
    				$$invalidate(7, showClipboardText = false);
    			},
    			2000
    		);
    	}

    	function click(index, val, type) {
    		//console.log("click", index, val, type, openIndex);
    		if (Object.entries(val).length && type === "object" || val.length && type === "array") {
    			if (openIndex === index) {
    				$$invalidate(5, openIndex = null);
    			} else {
    				$$invalidate(5, openIndex = index);
    			}
    		}
    	}

    	const writable_props = ["myStore", "tabPosition", "open", "fade", "rateLimit", "initialToggleState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const mouseup_handler = () => {
    		$$invalidate(2, isPaused = false);
    		console.log(isPaused);
    	};

    	const mouseup_handler_1 = () => {
    		$$invalidate(2, isPaused = true);
    		console.log(isPaused);
    	};

    	const mousedown_handler = (i, testy) => click(i, testy.val, testy.type);
    	const mousedown_handler_1 = row => rowContract(row.indexRef);
    	const mousedown_handler_2 = row => rowExpand(row.indexRef);
    	const mouseover_handler = row => $$invalidate(8, hoverRow = row.indexRef);
    	const mousedown_handler_3 = (row, testy) => console.log(row.indexRef, testy.childRows, rowsToShow);
    	const mouseout_handler = () => $$invalidate(8, hoverRow = null);
    	const mouseover_handler_1 = () => $$invalidate(3, hovering = true);
    	const mouseleave_handler = () => $$invalidate(3, hovering = false);

    	$$self.$set = $$props => {
    		if ("myStore" in $$props) $$invalidate(18, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(19, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(20, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(21, initialToggleState = $$props.initialToggleState);
    	};

    	$$self.$capture_state = () => {
    		return {
    			myStore,
    			tabPosition,
    			open,
    			fade,
    			rateLimit,
    			initialToggleState,
    			isPaused,
    			hovering,
    			showAll,
    			openIndex,
    			openIndexSetOnce,
    			showAllArr,
    			showManuallySelected,
    			rowsToShow,
    			showClipboardText,
    			clipboardCode,
    			hoverRow,
    			toggle,
    			topLevelObjectArray,
    			openedObjectArray,
    			cache,
    			mainLoop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("myStore" in $$props) $$invalidate(18, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(19, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(20, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(21, initialToggleState = $$props.initialToggleState);
    		if ("isPaused" in $$props) $$invalidate(2, isPaused = $$props.isPaused);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("showAll" in $$props) $$invalidate(4, showAll = $$props.showAll);
    		if ("openIndex" in $$props) $$invalidate(5, openIndex = $$props.openIndex);
    		if ("openIndexSetOnce" in $$props) openIndexSetOnce = $$props.openIndexSetOnce;
    		if ("showAllArr" in $$props) $$invalidate(22, showAllArr = $$props.showAllArr);
    		if ("showManuallySelected" in $$props) $$invalidate(23, showManuallySelected = $$props.showManuallySelected);
    		if ("rowsToShow" in $$props) $$invalidate(6, rowsToShow = $$props.rowsToShow);
    		if ("showClipboardText" in $$props) $$invalidate(7, showClipboardText = $$props.showClipboardText);
    		if ("clipboardCode" in $$props) clipboardCode = $$props.clipboardCode;
    		if ("hoverRow" in $$props) $$invalidate(8, hoverRow = $$props.hoverRow);
    		if ("toggle" in $$props) $$invalidate(9, toggle = $$props.toggle);
    		if ("topLevelObjectArray" in $$props) $$invalidate(10, topLevelObjectArray = $$props.topLevelObjectArray);
    		if ("openedObjectArray" in $$props) openedObjectArray = $$props.openedObjectArray;
    		if ("cache" in $$props) $$invalidate(11, cache = $$props.cache);
    		if ("mainLoop" in $$props) mainLoop = $$props.mainLoop;
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*toggle, showAll, showAllArr, showManuallySelected*/ 12583440) {
    			 if (toggle) $$invalidate(6, rowsToShow = showAll ? showAllArr : showManuallySelected);
    		}
    	};

    	return [
    		tabPosition,
    		fade,
    		isPaused,
    		hovering,
    		showAll,
    		openIndex,
    		rowsToShow,
    		showClipboardText,
    		hoverRow,
    		toggle,
    		topLevelObjectArray,
    		cache,
    		toggleShowAll,
    		doToggle,
    		rowContract,
    		rowExpand,
    		copyToClipboard,
    		click,
    		myStore,
    		open,
    		rateLimit,
    		initialToggleState,
    		showAllArr,
    		showManuallySelected,
    		mainLoop,
    		openIndexSetOnce,
    		clipboardCode,
    		openedObjectArray,
    		timer,
    		refreshDataAndCache,
    		mouseup_handler,
    		mouseup_handler_1,
    		mousedown_handler,
    		mousedown_handler_1,
    		mousedown_handler_2,
    		mouseover_handler,
    		mousedown_handler_3,
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
    				myStore: 18,
    				tabPosition: 0,
    				open: 19,
    				fade: 1,
    				rateLimit: 20,
    				initialToggleState: 21
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

    		if (/*myStore*/ ctx[18] === undefined && !("myStore" in props)) {
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

    /* src/Example.svelte generated by Svelte v3.18.2 */
    const file$a = "src/Example.svelte";

    function create_fragment$a(ctx) {
    	let t0;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let h20;
    	let t8;
    	let t9;
    	let t10;
    	let h21;
    	let t11;
    	let t12;
    	let t13;
    	let button0;
    	let t15;
    	let button1;
    	let t17;
    	let button2;
    	let current;
    	let dispose;

    	const svelteobjectexplorer = new Index({
    			props: {
    				myStore: /*myStore*/ ctx[2],
    				open: /*open*/ ctx[3],
    				fade: /*fade*/ ctx[4],
    				tabPosition: /*tabPosition*/ ctx[5],
    				rateLimit: /*rateLimit*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svelteobjectexplorer.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Svelte Object Explorer";
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Provides a simple to use, quick a dirty hideable list of whatever data you wish to temporarily view whilst you are\ndeveloping your app, rather than console.logging or debugging.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Displays most kinds of data: array, object, string, number, boolean, symbol";
    			t7 = space();
    			h20 = element("h2");
    			t8 = text("Autocounter from component state: ");
    			t9 = text(/*counter*/ ctx[0]);
    			t10 = space();
    			h21 = element("h2");
    			t11 = text("Manual counter from custom store: ");
    			t12 = text(/*$count*/ ctx[1]);
    			t13 = space();
    			button0 = element("button");
    			button0.textContent = "-";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t17 = space();
    			button2 = element("button");
    			button2.textContent = "reset";
    			add_location(h1, file$a, 57, 0, 1244);
    			add_location(p0, file$a, 59, 0, 1277);
    			add_location(p1, file$a, 62, 0, 1301);
    			add_location(p2, file$a, 66, 0, 1488);
    			add_location(h20, file$a, 68, 0, 1572);
    			add_location(h21, file$a, 70, 0, 1626);
    			attr_dev(button0, "id", "decr");
    			add_location(button0, file$a, 72, 0, 1679);
    			attr_dev(button1, "id", "incr");
    			add_location(button1, file$a, 73, 0, 1735);
    			attr_dev(button2, "id", "reset");
    			add_location(button2, file$a, 74, 0, 1791);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svelteobjectexplorer, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p0, anchor);
    			p0.innerHTML = /*string*/ ctx[7];
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t8);
    			append_dev(h20, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t11);
    			append_dev(h21, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, button2, anchor);
    			current = true;

    			dispose = [
    				listen_dev(button0, "click", count.decrement, false, false, false),
    				listen_dev(button1, "click", count.increment, false, false, false),
    				listen_dev(button2, "click", count.reset, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*counter*/ 1) set_data_dev(t9, /*counter*/ ctx[0]);
    			if (!current || dirty & /*$count*/ 2) set_data_dev(t12, /*$count*/ ctx[1]);
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
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(button2);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(1, $count = $$value));
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
    				$$invalidate(0, counter++, counter);
    			},
    			100
    		);
    	}

    	incr();

    	let myStore = {
    		variousTypes: {
    			boolean: true,
    			string: "test",
    			number: 123,
    			array: [[["test1", "test2"], "test2"], "test2"],
    			longarray: new Array(4000).fill("test"),
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
    			arrowfunction: () => {
    				
    			},
    			function: function test() {
    				console.log("test");
    			},
    			symbol: Symbol(),
    			null: null,
    			undefined: typeof bananaman
    		},
    		SvelteVariable: counter,
    		customStore: count,
    		customStoreValue: $count
    	};

    	let params = new URL(document.location).searchParams;
    	let open = params.get("open");
    	let fade = params.get("fade");
    	let tabPosition = params.get("tabPosition");
    	let rateLimit = params.get("rateLimit");
    	let string = "< SvelteObjectExplorer {myStore} />";

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("counter" in $$props) $$invalidate(0, counter = $$props.counter);
    		if ("array" in $$props) array = $$props.array;
    		if ("myStore" in $$props) $$invalidate(2, myStore = $$props.myStore);
    		if ("params" in $$props) params = $$props.params;
    		if ("open" in $$props) $$invalidate(3, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(4, fade = $$props.fade);
    		if ("tabPosition" in $$props) $$invalidate(5, tabPosition = $$props.tabPosition);
    		if ("rateLimit" in $$props) $$invalidate(6, rateLimit = $$props.rateLimit);
    		if ("string" in $$props) $$invalidate(7, string = $$props.string);
    		if ("$count" in $$props) count.set($count = $$props.$count);
    	};

    	return [counter, $count, myStore, open, fade, tabPosition, rateLimit, string];
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
