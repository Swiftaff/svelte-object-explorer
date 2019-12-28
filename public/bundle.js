
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
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
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
            ? instance(component, prop_values, (i, ret, value = ret) => {
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
        document.dispatchEvent(custom_event(type, detail));
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

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.16.7 */

    const file = "node_modules\\svelte-icons\\components\\IconBase.svelte";

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
    		const props = options.props || ({});

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

    /* node_modules\svelte-icons\fa\FaChevronRight.svelte generated by Svelte v3.16.7 */
    const file$1 = "node_modules\\svelte-icons\\fa\\FaChevronRight.svelte";

    // (4:0) <IconBase viewBox="0 0 320 512" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z");
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
    		source: "(4:0) <IconBase viewBox=\\\"0 0 320 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 320 512" }, /*$$props*/ ctx[0]];

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

    class FaChevronRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronRight",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaChevronDown.svelte generated by Svelte v3.16.7 */
    const file$2 = "node_modules\\svelte-icons\\fa\\FaChevronDown.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z");
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

    class FaChevronDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronDown",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaChevronUp.svelte generated by Svelte v3.16.7 */
    const file$3 = "node_modules\\svelte-icons\\fa\\FaChevronUp.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z");
    			add_location(path, file$3, 4, 0, 119);
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
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronUp",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaRegCheckSquare.svelte generated by Svelte v3.16.7 */
    const file$4 = "node_modules\\svelte-icons\\fa\\FaRegCheckSquare.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 400H48V80h352v352zm-35.864-241.724L191.547 361.48c-4.705 4.667-12.303 4.637-16.97-.068l-90.781-91.516c-4.667-4.705-4.637-12.303.069-16.971l22.719-22.536c4.705-4.667 12.303-4.637 16.97.069l59.792 60.277 141.352-140.216c4.705-4.667 12.303-4.637 16.97.068l22.536 22.718c4.667 4.706 4.637 12.304-.068 16.971z");
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
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

    class FaRegCheckSquare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaRegCheckSquare",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaRegSquare.svelte generated by Svelte v3.16.7 */
    const file$5 = "node_modules\\svelte-icons\\fa\\FaRegSquare.svelte";

    // (4:0) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z");
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
    		id: create_default_slot$4.name,
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

    class FaRegSquare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaRegSquare",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaClipboard.svelte generated by Svelte v3.16.7 */
    const file$6 = "node_modules\\svelte-icons\\fa\\FaClipboard.svelte";

    // (4:0) <IconBase viewBox="0 0 384 512" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z");
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:0) <IconBase viewBox=\\\"0 0 384 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
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

    class FaClipboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaClipboard",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaClipboardCheck.svelte generated by Svelte v3.16.7 */
    const file$7 = "node_modules\\svelte-icons\\fa\\FaClipboardCheck.svelte";

    // (4:0) <IconBase viewBox="0 0 384 512" {...$$props}>
    function create_default_slot$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm121.2 231.8l-143 141.8c-4.7 4.7-12.3 4.6-17-.1l-82.6-83.3c-4.7-4.7-4.6-12.3.1-17L99.1 285c4.7-4.7 12.3-4.6 17 .1l46 46.4 106-105.2c4.7-4.7 12.3-4.6 17 .1l28.2 28.4c4.7 4.8 4.6 12.3-.1 17z");
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
    		id: create_default_slot$6.name,
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

    class FaClipboardCheck extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaClipboardCheck",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Index.svelte generated by Svelte v3.16.7 */

    const { Object: Object_1 } = globals;
    const file$8 = "src\\Index.svelte";

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

    // (770:0) {:else}
    function create_else_block_4(ctx) {
    	let t;
    	let span;
    	let current;
    	const fachevronup = new FaChevronUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Show\n");
    			span = element("span");
    			create_component(fachevronup.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 771, 0, 12244);
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
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(770:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (765:0) {#if toggle}
    function create_if_block_10(ctx) {
    	let t;
    	let span;
    	let current;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Hide\n");
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 766, 0, 12182);
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
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(765:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (790:0) {#if displayClass(testy)}
    function create_if_block_8(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_9, create_else_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*openIndex*/ ctx[3] === /*i*/ ctx[42]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 790, 0, 12647);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(790:0) {#if displayClass(testy)}",
    		ctx
    	});

    	return block;
    }

    // (794:0) {:else}
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
    		source: "(794:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (792:0) {#if openIndex === i}
    function create_if_block_9(ctx) {
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(792:0) {#if openIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (804:0) {#if openIndex === i}
    function create_if_block$1(ctx) {
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
    	const if_block_creators = [create_if_block_7, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*showAll*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block_6, create_else_block_1];
    	const if_blocks_1 = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*showClipboardText*/ ctx[8]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_3(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	let each_value_1 = /*valueFormatterToArr*/ ctx[12](/*testy*/ ctx[40].val);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			t4 = text("\n");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			attr_dev(td0, "colspan", "3");
    			attr_dev(td0, "class", "treeVal svelte-hsvar4");
    			add_location(td0, file$8, 806, 0, 12952);
    			attr_dev(tr0, "class", "svelte-hsvar4");
    			add_location(tr0, file$8, 804, 0, 12858);
    			attr_dev(div0, "class", "toggleShowAll nopointer svelte-hsvar4");
    			add_location(div0, file$8, 812, 0, 13099);
    			attr_dev(input, "id", "hiddenClipboard");
    			attr_dev(input, "class", "svelte-hsvar4");
    			add_location(input, file$8, 838, 0, 13547);
    			attr_dev(div1, "class", "copyToClipbord nopointer svelte-hsvar4");
    			add_location(div1, file$8, 824, 0, 13305);
    			attr_dev(pre, "class", "svelte-hsvar4");
    			add_location(pre, file$8, 811, 0, 13093);
    			attr_dev(td1, "colspan", "3");
    			attr_dev(td1, "class", "treeVal svelte-hsvar4");
    			add_location(td1, file$8, 809, 0, 13052);
    			attr_dev(tr1, "class", "treeVal svelte-hsvar4");
    			add_location(tr1, file$8, 808, 0, 12993);

    			dispose = [
    				listen_dev(div0, "click", /*toggleShowAll*/ ctx[9], false, false, false),
    				listen_dev(div1, "click", /*copyToClipboard*/ ctx[13], false, false, false),
    				listen_dev(tr1, "mouseout", /*mouseout_handler*/ ctx[39], false, false, false)
    			];
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(pre, null);
    			}

    			append_dev(tr1, t5);
    			current = true;
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

    			if (dirty[0] & /*rowsToShow, valueFormatterToArr, testyArr, hoverRow, rowContract, rowExpand*/ 7344) {
    				each_value_1 = /*valueFormatterToArr*/ ctx[12](/*testy*/ ctx[40].val);
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
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(tr1);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(804:0) {#if openIndex === i}",
    		ctx
    	});

    	return block;
    }

    // (818:0) {:else}
    function create_else_block_2(ctx) {
    	let span;
    	let current;
    	const faregsquare = new FaRegSquare({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faregsquare.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 818, 0, 13236);
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
    		source: "(818:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (814:0) {#if showAll}
    function create_if_block_7(ctx) {
    	let span;
    	let current;
    	const faregchecksquare = new FaRegCheckSquare({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faregchecksquare.$$.fragment);
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 814, 0, 13176);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(814:0) {#if showAll}",
    		ctx
    	});

    	return block;
    }

    // (833:0) {:else}
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
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 833, 0, 13476);
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
    		source: "(833:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (828:0) {#if showClipboardText}
    function create_if_block_6(ctx) {
    	let span;
    	let t;
    	let current;
    	const faclipboardcheck = new FaClipboardCheck({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(faclipboardcheck.$$.fragment);
    			t = text("\nCopied to clipboard!");
    			attr_dev(span, "class", "smaller svelte-hsvar4");
    			add_location(span, file$8, 828, 0, 13395);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(828:0) {#if showClipboardText}",
    		ctx
    	});

    	return block;
    }

    // (842:0) {#if rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && rowsToShow.includes(row.indexRef)))}
    function create_if_block_1(ctx) {
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
    	let if_block0 = /*row*/ ctx[43].type && create_if_block_5(ctx);
    	let if_block1 = /*row*/ ctx[43].len && create_if_block_4(ctx);
    	let if_block2 = /*row*/ ctx[43].expandable && create_if_block_2(ctx);

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[38](/*row*/ ctx[43], ...args);
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
    			add_location(span, file$8, 845, 0, 13904);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[5] === /*row*/ ctx[43].indexRef || /*row*/ ctx[43].parentIndexRef.startsWith(/*hoverRow*/ ctx[5])
    			? "row hoverRow"
    			: "row") + " svelte-hsvar4"));

    			add_location(div, file$8, 842, 0, 13749);
    			dispose = listen_dev(div, "mouseover", mouseover_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t4);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*testyArr*/ 128) && t0_value !== (t0_value = /*row*/ ctx[43].output + "")) set_data_dev(t0, t0_value);

    			if (/*row*/ ctx[43].type) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*row*/ ctx[43].len) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, t3);
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
    					if_block2 = create_if_block_2(ctx);
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

    			if (!current || dirty[0] & /*hoverRow, testyArr*/ 160 && div_class_value !== (div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[5] === /*row*/ ctx[43].indexRef || /*row*/ ctx[43].parentIndexRef.startsWith(/*hoverRow*/ ctx[5])
    			? "row hoverRow"
    			: "row") + " svelte-hsvar4"))) {
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(842:0) {#if rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && rowsToShow.includes(row.indexRef)))}",
    		ctx
    	});

    	return block;
    }

    // (847:0) {#if row.type}
    function create_if_block_5(ctx) {
    	let span;
    	let t_value = /*row*/ ctx[43].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "type svelte-hsvar4");
    			add_location(span, file$8, 847, 0, 13945);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*testyArr*/ 128 && t_value !== (t_value = /*row*/ ctx[43].type + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(847:0) {#if row.type}",
    		ctx
    	});

    	return block;
    }

    // (850:0) {#if row.len}
    function create_if_block_4(ctx) {
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
    			attr_dev(span, "class", "len svelte-hsvar4");
    			add_location(span, file$8, 850, 0, 14002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*testyArr*/ 128 && t1_value !== (t1_value = /*row*/ ctx[43].len + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(850:0) {#if row.len}",
    		ctx
    	});

    	return block;
    }

    // (853:0) {#if row.expandable}
    function create_if_block_2(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (dirty[0] & /*rowsToShow, testyArr*/ 144) show_if = !!/*rowsToShow*/ ctx[4].includes(/*row*/ ctx[43].indexRef);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(853:0) {#if row.expandable}",
    		ctx
    	});

    	return block;
    }

    // (860:0) {:else}
    function create_else_block(ctx) {
    	let span;
    	let current;
    	let dispose;
    	const fachevronright = new FaChevronRight({ $$inline: true });

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[37](/*row*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevronright.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-hsvar4");
    			add_location(span, file$8, 860, 0, 14217);
    			dispose = listen_dev(span, "click", click_handler_2, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevronright, span, null);
    			current = true;
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(860:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (854:0) {#if rowsToShow.includes(row.indexRef)}
    function create_if_block_3(ctx) {
    	let span;
    	let current;
    	let dispose;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[36](/*row*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(fachevrondown.$$.fragment);
    			attr_dev(span, "class", "smallest dataArrow svelte-hsvar4");
    			add_location(span, file$8, 854, 0, 14106);
    			dispose = listen_dev(span, "click", click_handler_1, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(fachevrondown, span, null);
    			current = true;
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(854:0) {#if rowsToShow.includes(row.indexRef)}",
    		ctx
    	});

    	return block;
    }

    // (841:0) {#each valueFormatterToArr(testy.val) as row}
    function create_each_block_1(ctx) {
    	let show_if = /*rowsToShow*/ ctx[4].includes(/*row*/ ctx[43].parentIndexRef) && (!/*row*/ ctx[43].bracket || /*row*/ ctx[43].bracket && /*rowsToShow*/ ctx[4].includes(/*row*/ ctx[43].indexRef));
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1(ctx);

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
    			if (dirty[0] & /*rowsToShow, testyArr*/ 144) show_if = /*rowsToShow*/ ctx[4].includes(/*row*/ ctx[43].parentIndexRef) && (!/*row*/ ctx[43].bracket || /*row*/ ctx[43].bracket && /*rowsToShow*/ ctx[4].includes(/*row*/ ctx[43].indexRef));

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
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
    		source: "(841:0) {#each valueFormatterToArr(testy.val) as row}",
    		ctx
    	});

    	return block;
    }

    // (785:0) {#each testyArr as testy, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let show_if = displayClass(/*testy*/ ctx[40]);
    	let t0;
    	let t1_value = displayVal(/*testy*/ ctx[40].val) + "";
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
    	let if_block0 = show_if && create_if_block_8(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[35](/*i*/ ctx[42], /*testy*/ ctx[40], ...args);
    	}

    	let if_block1 = /*openIndex*/ ctx[3] === /*i*/ ctx[42] && create_if_block$1(ctx);

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
    			attr_dev(td0, "class", "link svelte-hsvar4");
    			add_location(td0, file$8, 788, 0, 12603);
    			add_location(td1, file$8, 800, 0, 12787);
    			add_location(td2, file$8, 801, 0, 12809);
    			attr_dev(tr, "class", tr_class_value = "" + (null_to_empty(displayClass(/*testy*/ ctx[40])) + " svelte-hsvar4"));
    			add_location(tr, file$8, 785, 0, 12521);
    			dispose = listen_dev(tr, "click", click_handler, false, false, false);
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
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*testyArr*/ 128) show_if = displayClass(/*testy*/ ctx[40]);

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_8(ctx);
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

    			if ((!current || dirty[0] & /*testyArr*/ 128) && t1_value !== (t1_value = displayVal(/*testy*/ ctx[40].val) + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*testyArr*/ 128) && t3_value !== (t3_value = /*testy*/ ctx[40].type + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty[0] & /*testyArr*/ 128) && t5_value !== (t5_value = /*testy*/ ctx[40].key + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty[0] & /*testyArr*/ 128 && tr_class_value !== (tr_class_value = "" + (null_to_empty(displayClass(/*testy*/ ctx[40])) + " svelte-hsvar4"))) {
    				attr_dev(tr, "class", tr_class_value);
    			}

    			if (/*openIndex*/ ctx[3] === /*i*/ ctx[42]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
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
    		source: "(785:0) {#each testyArr as testy, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let table;
    	let colgroup;
    	let col0;
    	let t1;
    	let col1;
    	let t2;
    	let col2;
    	let t3;
    	let div1_class_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_10, create_else_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*toggle*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*testyArr*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			div1 = element("div");
    			table = element("table");
    			colgroup = element("colgroup");
    			col0 = element("col");
    			t1 = space();
    			col1 = element("col");
    			t2 = space();
    			col2 = element("col");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty((/*toggle*/ ctx[6]
    			? "toggle toggleShow"
    			: "toggle toggleHide") + " toggle" + /*tabPosition*/ ctx[0] + (/*fade*/ ctx[1] ? "" : " noFade")) + " svelte-hsvar4"));

    			add_location(div0, file$8, 761, 0, 12025);
    			set_style(col0, "width", "35%");
    			add_location(col0, file$8, 780, 0, 12402);
    			set_style(col1, "width", "10%");
    			add_location(col1, file$8, 781, 0, 12428);
    			set_style(col2, "width", "55%");
    			add_location(col2, file$8, 782, 0, 12454);
    			add_location(colgroup, file$8, 779, 0, 12391);
    			attr_dev(table, "class", "svelte-hsvar4");
    			add_location(table, file$8, 778, 0, 12383);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[6] ? "" : " tree-hide") + (/*fade*/ ctx[1] ? "" : " noFade")) + " svelte-hsvar4"));
    			add_location(div1, file$8, 777, 0, 12305);
    			attr_dev(div2, "class", "wrapper tortoise svelte-hsvar4");
    			add_location(div2, file$8, 760, 0, 11994);
    			dispose = listen_dev(div0, "click", /*doToggle*/ ctx[14], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, table);
    			append_dev(table, colgroup);
    			append_dev(colgroup, col0);
    			append_dev(colgroup, t1);
    			append_dev(colgroup, col1);
    			append_dev(colgroup, t2);
    			append_dev(colgroup, col2);
    			append_dev(table, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				if_block.m(div0, null);
    			}

    			if (!current || dirty[0] & /*toggle, tabPosition, fade*/ 67 && div0_class_value !== (div0_class_value = "" + (null_to_empty((/*toggle*/ ctx[6]
    			? "toggle toggleShow"
    			: "toggle toggleHide") + " toggle" + /*tabPosition*/ ctx[0] + (/*fade*/ ctx[1] ? "" : " noFade")) + " svelte-hsvar4"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty[0] & /*openIndex, hoverRow, valueFormatterToArr, testyArr, rowsToShow, rowContract, rowExpand, copyToClipboard, showClipboardText, toggleShowAll, showAll, click*/ 49084) {
    				each_value = /*testyArr*/ ctx[7];
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

    			if (!current || dirty[0] & /*toggle, fade*/ 66 && div1_class_value !== (div1_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[6] ? "" : " tree-hide") + (/*fade*/ ctx[1] ? "" : " noFade")) + " svelte-hsvar4"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			destroy_each(each_blocks, detaching);
    			dispose();
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

    function sort_byKey(a, b) {
    	var nameA = a.key.toUpperCase();
    	var nameB = b.key.toUpperCase();

    	if (nameA < nameB) {
    		return -1;
    	}

    	if (nameA > nameB) {
    		return 1;
    	}

    	return 0;
    }

    function getType(val) {
    	return Array.isArray(val) ? "array" : typeof val;
    }

    function displayVal(val) {
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

    function displayClass(testy) {
    	let isObject = testy.val ? Object.entries(testy.val).length : false;
    	let accordion = testy.type !== "string" ? "accordion" : "";

    	return testy.val !== [] && testy.val !== null && isObject
    	? accordion + " tree_" + testy.type
    	: "";
    }

    function code_format_index(optionalIndex) {
    	return typeof optionalIndex !== "undefined"
    	? optionalIndex + ": "
    	: "";
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { myStore } = $$props;
    	let { tabPosition = "top" } = $$props;
    	let { open = null } = $$props;
    	let { fade = false } = $$props;
    	let showAll = false;
    	let openIndex = null;

    	onMount(async () => {
    		$$invalidate(4, rowsToShow = showAll ? showAllArr : showManuallySelected);
    		let i = testyArr.filter(item => item.key === open);
    		if (i.length) $$invalidate(3, openIndex = i[0].index);
    		valueFormatterToArr(testyArr[i]);
    		createArray();
    	});

    	let indentSpaces = 2;
    	let showAllArr = [];
    	let showManuallySelected = ["0", "0.0"];
    	let rowsToShow = [];

    	function toggleShowAll() {
    		$$invalidate(2, showAll = !showAll);
    	}

    	function rowContract(rowIndex) {
    		$$invalidate(2, showAll = false);
    		$$invalidate(19, showManuallySelected = showManuallySelected.filter(row => !row.startsWith(rowIndex)));
    	}

    	function rowExpand(rowIndex) {
    		$$invalidate(19, showManuallySelected = showManuallySelected.filter(row => row !== rowIndex));
    		showManuallySelected.push(rowIndex);
    	}

    	let hoverRow = "none";
    	let toggle = true;
    	let testyArr = [];

    	function createArray() {
    		$$invalidate(7, testyArr = []);

    		for (const key in myStore) {
    			if (myStore.hasOwnProperty(key)) {
    				testyArr.push({
    					key,
    					val: myStore[key],
    					type: getType(myStore[key])
    				});
    			}
    		}

    		testyArr.sort(sort_byKey);

    		$$invalidate(7, testyArr = testyArr.map((item, index) => {
    			return { ...item, index };
    		}));
    	}

    	function valueFormatterToArr(object) {
    		let parentArr = [];
    		formatByType("0.0", "0", 0, parentArr, object, 0);
    		$$invalidate(18, showAllArr = []);

    		parentArr.map(row => {
    			showAllArr.push(row.indexRef);
    		});

    		return parentArr;
    	}

    	let showClipboardText = false;
    	let clipboardCode = "";

    	function copyToClipboard() {
    		let clipboardEl = document.getElementById("hiddenClipboard");
    		clipboardEl.value = clipboardCode;
    		clipboardEl.select();
    		document.execCommand("copy");
    		$$invalidate(8, showClipboardText = true);

    		setTimeout(
    			() => {
    				$$invalidate(8, showClipboardText = false);
    			},
    			2000
    		);
    	}

    	function doToggle() {
    		$$invalidate(6, toggle = !toggle);
    	}

    	function click(index, val, type) {
    		if (Object.entries(val).length && type === "object" || val.length && type === "array") {
    			if (openIndex === index) {
    				$$invalidate(3, openIndex = null);
    			} else {
    				$$invalidate(3, openIndex = index);
    			}
    		}
    	}

    	function code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "null", level),
    			type: "Null"
    		});
    	}

    	function code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "undefined", level),
    			type: "Undefined"
    		});
    	}

    	function code_format_boolean(indexRef, parentIndexRef, index, parentArr, bool, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + (bool ? "true" : "false"), level),
    			type: "Boolean"
    		});
    	}

    	function code_format_string(indexRef, parentIndexRef, index, parentArr, str, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "'" + str + "'", level),
    			type: "String"
    		});
    	}

    	function code_format_number(indexRef, parentIndexRef, index, parentArr, num, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + num, level),
    			type: "Number"
    		});
    	}

    	function code_format_symbol(indexRef, parentIndexRef, index, parentArr, sym, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "'" + sym.toString() + "'", level),
    			type: "Symbol"
    		});
    	}

    	function code_format_function(indexRef, parentIndexRef, index, parentArr, fn, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "'" + fn.name + "'", level),
    			type: "Function"
    		});
    	}

    	function code_format_array(
    		indexRef,
    	parentIndexRef,
    	index,
    	parentArr,
    	arr,
    	level,
    	optionalIndex,
    	optionalNewLine
    	) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row((optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex), level + (optionalIndex ? 1 : 0)),
    			type: "Array",
    			len: arr.length,
    			expandable: true
    		});

    		if (optionalNewLine) {
    			parentArr.push({
    				indexRef,
    				parentIndexRef,
    				index,
    				output: indent_row("[", level + (optionalIndex ? 2 : 1)),
    				bracket: true
    			});
    		}

    		arr.map((value, arrIndex) => formatByType(indexRef + "." + arrIndex, indexRef, arrIndex, parentArr, value, level + (optionalIndex ? 2 : 1), arrIndex, true));

    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row("]", level + (optionalIndex ? 2 : 1)),
    			bracket: true
    		});
    	}

    	function code_format_object(
    		indexRef,
    	parentIndexRef,
    	index,
    	parentArr,
    	obj,
    	level,
    	optionalIndex,
    	optionalNewLine
    	) {
    		let object = Object.entries(obj);

    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row((optionalNewLine ? "" : code_format_index(optionalIndex)) + code_format_index(optionalIndex), level + (optionalIndex || optionalNewLine ? 0 : 0)),
    			type: "Object",
    			len: object.length,
    			expandable: true
    		});

    		if (optionalNewLine) {
    			parentArr.push({
    				indexRef,
    				parentIndexRef,
    				index,
    				output: indent_row("{", level + (optionalIndex || optionalNewLine ? 1 : 0)),
    				bracket: true
    			});
    		}

    		object.forEach(([key, value], objIndex) => {
    			formatByType(indexRef + "." + objIndex, indexRef, objIndex, parentArr, value, level + (optionalIndex || optionalNewLine ? 2 : 1), key, true);
    		});

    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row("}", level + (optionalIndex || optionalNewLine ? 1 : 0)),
    			bracket: true
    		});
    	}

    	function code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex) {
    		parentArr.push({
    			indexRef,
    			parentIndexRef,
    			index,
    			output: indent_row(code_format_index(optionalIndex) + "!!unknown!!", level)
    		});
    	}

    	function indent_row(row, level) {
    		return (" ").repeat(level * indentSpaces) + row;
    	}

    	function formatByType(
    		indexRef,
    	parentIndexRef,
    	index,
    	parentArr,
    	value,
    	level,
    	optionalIndex,
    	optionalNewLine
    	) {
    		let newindexRef = parentIndexRef + "." + index.toString(10);
    		let newParentIndexRef = parentIndexRef + "." + index.toString(10);
    		if (value === null) code_format_null(indexRef, parentIndexRef, index, parentArr, level, optionalIndex); else if (typeof value === "undefined") code_format_undefined(indexRef, parentIndexRef, index, parentArr, level, optionalIndex); else if (typeof value === "boolean") code_format_boolean(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex); else if (typeof value === "string") code_format_string(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex); else if (typeof value === "number") code_format_number(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex); else if (typeof value === "symbol") code_format_symbol(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex); else if (typeof value === "function") code_format_function(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex); else if (Array.isArray(value)) code_format_array(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine); else if (typeof value === "object") code_format_object(indexRef, parentIndexRef, index, parentArr, value, level, optionalIndex, optionalNewLine); else code_format_unknown(indexRef, parentIndexRef, index, parentArr, level, optionalIndex);
    	}

    	const writable_props = ["myStore", "tabPosition", "open", "fade"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, testy) => click(i, testy.val, testy.type);
    	const click_handler_1 = row => rowContract(row.indexRef);
    	const click_handler_2 = row => rowExpand(row.indexRef);
    	const mouseover_handler = row => $$invalidate(5, hoverRow = row.indexRef);
    	const mouseout_handler = () => $$invalidate(5, hoverRow = null);

    	$$self.$set = $$props => {
    		if ("myStore" in $$props) $$invalidate(16, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(17, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    	};

    	$$self.$capture_state = () => {
    		return {
    			myStore,
    			tabPosition,
    			open,
    			fade,
    			showAll,
    			openIndex,
    			indentSpaces,
    			showAllArr,
    			showManuallySelected,
    			rowsToShow,
    			hoverRow,
    			toggle,
    			testyArr,
    			showClipboardText,
    			clipboardCode
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("myStore" in $$props) $$invalidate(16, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(17, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    		if ("showAll" in $$props) $$invalidate(2, showAll = $$props.showAll);
    		if ("openIndex" in $$props) $$invalidate(3, openIndex = $$props.openIndex);
    		if ("indentSpaces" in $$props) indentSpaces = $$props.indentSpaces;
    		if ("showAllArr" in $$props) $$invalidate(18, showAllArr = $$props.showAllArr);
    		if ("showManuallySelected" in $$props) $$invalidate(19, showManuallySelected = $$props.showManuallySelected);
    		if ("rowsToShow" in $$props) $$invalidate(4, rowsToShow = $$props.rowsToShow);
    		if ("hoverRow" in $$props) $$invalidate(5, hoverRow = $$props.hoverRow);
    		if ("toggle" in $$props) $$invalidate(6, toggle = $$props.toggle);
    		if ("testyArr" in $$props) $$invalidate(7, testyArr = $$props.testyArr);
    		if ("showClipboardText" in $$props) $$invalidate(8, showClipboardText = $$props.showClipboardText);
    		if ("clipboardCode" in $$props) clipboardCode = $$props.clipboardCode;
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*showAll, showAllArr, showManuallySelected*/ 786436) {
    			 $$invalidate(4, rowsToShow = showAll ? showAllArr : showManuallySelected);
    		}

    		if ($$self.$$.dirty[0] & /*myStore*/ 65536) {
    			 if (myStore) {
    				createArray();
    			}
    		}
    	};

    	return [
    		tabPosition,
    		fade,
    		showAll,
    		openIndex,
    		rowsToShow,
    		hoverRow,
    		toggle,
    		testyArr,
    		showClipboardText,
    		toggleShowAll,
    		rowContract,
    		rowExpand,
    		valueFormatterToArr,
    		copyToClipboard,
    		doToggle,
    		click,
    		myStore,
    		open,
    		showAllArr,
    		showManuallySelected,
    		indentSpaces,
    		createArray,
    		clipboardCode,
    		code_format_null,
    		code_format_undefined,
    		code_format_boolean,
    		code_format_string,
    		code_format_number,
    		code_format_symbol,
    		code_format_function,
    		code_format_array,
    		code_format_object,
    		code_format_unknown,
    		indent_row,
    		formatByType,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		mouseover_handler,
    		mouseout_handler
    	];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				myStore: 16,
    				tabPosition: 0,
    				open: 17,
    				fade: 1
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*myStore*/ ctx[16] === undefined && !("myStore" in props)) {
    			console.warn("<Index> was created without expected prop 'myStore'");
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

    /* src\Example.svelte generated by Svelte v3.16.7 */
    const file$9 = "src\\Example.svelte";

    function create_fragment$9(ctx) {
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
    			props: { myStore: /*myStore*/ ctx[1] },
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
    			p1.textContent = "Provides a simple to use, quick a dirty hideable list of whatever data you\r\nwish to temporarily view whilst you are developing your app, rather than\r\nconsole.logging or debugging.";
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
    			t12 = text(/*$count*/ ctx[2]);
    			t13 = space();
    			button0 = element("button");
    			button0.textContent = "-";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t17 = space();
    			button2 = element("button");
    			button2.textContent = "reset";
    			add_location(h1, file$9, 33, 0, 630);
    			add_location(p0, file$9, 34, 0, 663);
    			add_location(p1, file$9, 37, 0, 690);
    			add_location(p2, file$9, 42, 0, 882);
    			add_location(h20, file$9, 46, 0, 972);
    			add_location(h21, file$9, 48, 0, 1028);
    			add_location(button0, file$9, 50, 0, 1083);
    			add_location(button1, file$9, 51, 0, 1130);
    			add_location(button2, file$9, 52, 0, 1177);

    			dispose = [
    				listen_dev(button0, "click", count.decrement, false, false, false),
    				listen_dev(button1, "click", count.increment, false, false, false),
    				listen_dev(button2, "click", count.reset, false, false, false)
    			];
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
    			p0.innerHTML = /*string*/ ctx[3];
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
    		},
    		p: function update(ctx, [dirty]) {
    			const svelteobjectexplorer_changes = {};
    			if (dirty & /*myStore*/ 2) svelteobjectexplorer_changes.myStore = /*myStore*/ ctx[1];
    			svelteobjectexplorer.$set(svelteobjectexplorer_changes);
    			if (!current || dirty & /*counter*/ 1) set_data_dev(t9, /*counter*/ ctx[0]);
    			if (!current || dirty & /*$count*/ 4) set_data_dev(t12, /*$count*/ ctx[2]);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(2, $count = $$value));
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
    			1000
    		);
    	}

    	incr();
    	let myStore;
    	let string = "< SvelteObjectExplorer {myStore} />";

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("counter" in $$props) $$invalidate(0, counter = $$props.counter);
    		if ("array" in $$props) $$invalidate(4, array = $$props.array);
    		if ("myStore" in $$props) $$invalidate(1, myStore = $$props.myStore);
    		if ("string" in $$props) $$invalidate(3, string = $$props.string);
    		if ("$count" in $$props) count.set($count = $$props.$count);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*counter, $count*/ 5) {
    			 $$invalidate(1, myStore = {
    				arrays: array,
    				componentStateVariable: counter,
    				customStore: count,
    				customStoreValue: $count,
    				hardCodedValues: { test2: "test" }
    			});
    		}
    	};

    	return [counter, myStore, $count, string];
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Example",
    			options,
    			id: create_fragment$9.name
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
