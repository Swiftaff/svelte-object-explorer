
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
    	let current;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

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

    /* src/PauseButton.svelte generated by Svelte v3.18.2 */

    const file$4 = "src/PauseButton.svelte";

    // (9:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Pause";
    			attr_dev(button, "class", "svelte-kgp2c3");
    			add_location(button, file$4, 9, 0, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

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
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
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
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "un-Pause";
    			attr_dev(button, "class", "svelte-kgp2c3");
    			add_location(button, file$4, 7, 0, 94);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

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
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
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
    	let { isPaused } = $$props;
    	let { pause } = $$props;
    	let { unpause } = $$props;
    	const writable_props = ["isPaused", "pause", "unpause"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PauseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("isPaused" in $$props) $$invalidate(0, isPaused = $$props.isPaused);
    		if ("pause" in $$props) $$invalidate(1, pause = $$props.pause);
    		if ("unpause" in $$props) $$invalidate(2, unpause = $$props.unpause);
    	};

    	$$self.$capture_state = () => {
    		return { isPaused, pause, unpause };
    	};

    	$$self.$inject_state = $$props => {
    		if ("isPaused" in $$props) $$invalidate(0, isPaused = $$props.isPaused);
    		if ("pause" in $$props) $$invalidate(1, pause = $$props.pause);
    		if ("unpause" in $$props) $$invalidate(2, unpause = $$props.unpause);
    	};

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

    /* src/CacheDisplay.svelte generated by Svelte v3.18.2 */

    const file$5 = "src/CacheDisplay.svelte";

    function create_fragment$5(ctx) {
    	let t0;
    	let t1_value = /*cache*/ ctx[0].dataChanges + "";
    	let t1;
    	let t2;
    	let t3_value = /*cache*/ ctx[0].viewChanges + "";
    	let t3;
    	let t4;
    	let br;
    	let t5;
    	let t6_value = /*cache*/ ctx[0].formatted + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			t0 = text("Data Changes(");
    			t1 = text(t1_value);
    			t2 = text(") View Changes(");
    			t3 = text(t3_value);
    			t4 = text(")\n");
    			br = element("br");
    			t5 = text("\nLast Updated(");
    			t6 = text(t6_value);
    			t7 = text(")");
    			add_location(br, file$5, 5, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cache*/ 1 && t1_value !== (t1_value = /*cache*/ ctx[0].dataChanges + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*cache*/ 1 && t3_value !== (t3_value = /*cache*/ ctx[0].viewChanges + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*cache*/ 1 && t6_value !== (t6_value = /*cache*/ ctx[0].formatted + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
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
    	let { cache } = $$props;
    	const writable_props = ["cache"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CacheDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("cache" in $$props) $$invalidate(0, cache = $$props.cache);
    	};

    	$$self.$capture_state = () => {
    		return { cache };
    	};

    	$$self.$inject_state = $$props => {
    		if ("cache" in $$props) $$invalidate(0, cache = $$props.cache);
    	};

    	return [cache];
    }

    class CacheDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { cache: 0 });

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
    	}

    	get cache() {
    		throw new Error("<CacheDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cache(value) {
    		throw new Error("<CacheDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/fa/FaChevronRight.svelte generated by Svelte v3.18.2 */
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

    /* src/ChevronButtons.svelte generated by Svelte v3.18.2 */
    const file$7 = "src/ChevronButtons.svelte";

    // (10:0) {#if row.expandable}
    function create_if_block$3(ctx) {
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(10:0) {#if row.expandable}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let current;
    	let dispose;
    	const fachevronright = new FaChevronRight({ $$inline: true });

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
    			dispose = listen_dev(span, "mousedown", /*mousedown_handler_1*/ ctx[5], false, false, false);
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
    	let current;
    	let dispose;
    	const fachevrondown = new FaChevronDown({ $$inline: true });

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
    			dispose = listen_dev(span, "mousedown", /*mousedown_handler*/ ctx[4], false, false, false);
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
    	let if_block = /*row*/ ctx[0].expandable && create_if_block$3(ctx);

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
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$3(ctx);
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

    	$$self.$set = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    		if ("rowsToShow" in $$props) $$invalidate(1, rowsToShow = $$props.rowsToShow);
    		if ("rowContract" in $$props) $$invalidate(2, rowContract = $$props.rowContract);
    		if ("rowExpand" in $$props) $$invalidate(3, rowExpand = $$props.rowExpand);
    	};

    	$$self.$capture_state = () => {
    		return { row, rowsToShow, rowContract, rowExpand };
    	};

    	$$self.$inject_state = $$props => {
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

    /* src/RowText.svelte generated by Svelte v3.18.2 */

    const file$8 = "src/RowText.svelte";

    // (7:0) {:else}
    function create_else_block$3(ctx) {
    	let span;
    	let t0_value = /*row*/ ctx[0].output + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block0 = /*row*/ ctx[0].type && create_if_block_2(ctx);
    	let if_block1 = /*row*/ ctx[0].len && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$8, 7, 0, 79);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(span, t2);
    			if (if_block1) if_block1.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t0_value !== (t0_value = /*row*/ ctx[0].output + "")) set_data_dev(t0, t0_value);

    			if (/*row*/ ctx[0].type) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(span, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*row*/ ctx[0].len) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(span, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(7:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if row.type === "Tag"}
    function create_if_block$4(ctx) {
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(5:0) {#if row.type === \\\"Tag\\\"}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#if row.type}
    function create_if_block_2(ctx) {
    	let span;
    	let t_value = /*row*/ ctx[0].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "type svelte-1j5usoi");
    			add_location(span, file$8, 10, 0, 114);
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
    		source: "(10:0) {#if row.type}",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#if row.len}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*row*/ ctx[0].len + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(span, "class", "len svelte-1j5usoi");
    			add_location(span, file$8, 13, 0, 171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1 && t1_value !== (t1_value = /*row*/ ctx[0].len + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(13:0) {#if row.len}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*row*/ ctx[0].type === "Tag") return create_if_block$4;
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
    	let { row } = $$props;
    	const writable_props = ["row"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RowText> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    	};

    	$$self.$capture_state = () => {
    		return { row };
    	};

    	$$self.$inject_state = $$props => {
    		if ("row" in $$props) $$invalidate(0, row = $$props.row);
    	};

    	return [row];
    }

    class RowText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { row: 0 });

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
    }

    function domParser() {
        // parses the dom from body downwards into a simplified ast, e.g.
        // { class: "classname", "svelte-explorer-tag": "H1", children: [el, el, el] }

        let html = document.body;
        console.log(html);
        let arr = getTag(html);
        console.log(arr);

        function getTag(el) {
            if (el.tagName && el.tagName !== "SCRIPT" && !el.className.includes("svelte-object-explorer-wrapper ")) {
                return { class: el.className, "svelte-explorer-tag": el.tagName, children: getChildren(el) };
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

    const indentSpaces = 1;

    function convertObjectToArrayOfOutputPanelRows({ key, val }) {
        let arr = []; // [{indexRef, parentIndexRef, output, type, bracket(optional), expandable(optional)}]
        let row_settings = { indexRef: "0.0", parentIndexRef: "0", key, val, level: 0 };
        appendRowsByType(row_settings, arr);
        console.log("outputRowsArray", arr);
        return arr;
    }

    function appendRowsByType(row_settings, arr) {
        let type = getTypeName(row_settings.val);
        let new_settings = { ...row_settings, type };
        if (type === "object") appendRowsForObject(new_settings, arr);
        if (type === "string") appendRowForString(new_settings, arr);
    }

    function getTypeName(value) {
        let type = getNullOrOtherType(value);
        console.log("type", type);
        return type;
    }

    function getNullOrOtherType(value) {
        return value === null ? "null" : getObjectOrStandardType(value);
    }

    function getObjectOrStandardType(value) {
        return typeof value === "object" ? getArrayOrObject(value) : typeof value;
    }

    function getArrayOrObject(value) {
        return Array.isArray(value) ? "array" : "object";
    }

    function appendRowsForObject(row_settings, arr) {
        arr.push(getRowForBracketOpen(row_settings));
        Object.entries(row_settings.val).forEach(([k, v], i) => {
            appendRowsByType(getRowsForChild(row_settings, k, v, i), arr);
        });
        arr.push(getRowForBracketClose(row_settings));
    }

    function getRowForBracketOpen(row_settings) {
        const output = indent_row(row_settings.key + ": {", row_settings.level);
        return { ...row_settings, output, type: "object", bracket: true, expandable: true };
    }

    function getRowsForChild(row_settings, key, val, index) {
        return {
            indexRef: row_settings.indexRef + "." + index,
            parentIndexRef: row_settings.indexRef,
            index,
            key,
            val,
            level: row_settings.level + 1,
        };
    }

    function getRowForBracketClose(row_settings) {
        const output = indent_row("}", row_settings.level);
        return { ...row_settings, output, type: "", bracket: true };
    }

    function appendRowForString(row_settings, arr) {
        let { key, val, level, ...rest } = row_settings;
        arr.push({ ...rest, output: indent_row(key + ": " + val, level), type: "string" });
    }

    function indent_row(row, level) {
        return " ".repeat(level * indentSpaces) + row;
    }

    function transform_data(cache) {
        let tempArr = [];
        let tempItem = {
            key: "TOP LEVEL",
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
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    // (130:0) {#if toggle}
    function create_if_block$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let table;
    	let div_class_value;
    	let current;
    	let dispose;

    	const pausebutton = new PauseButton({
    			props: {
    				isPaused: /*isPaused*/ ctx[2],
    				pause: /*pause*/ ctx[14],
    				unpause: /*unpause*/ ctx[13]
    			},
    			$$inline: true
    		});

    	const cachedisplay = new CacheDisplay({
    			props: { cache: /*cache*/ ctx[9] },
    			$$inline: true
    		});

    	let each_value = /*topLevelObjectArray*/ ctx[8];
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
    			add_location(table, file$9, 138, 0, 3525);
    			attr_dev(div, "id", "svelteObjectExplorer");

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[7] ? "" : " tree-hide") + (/*fade*/ ctx[1]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
    			: " noFade")) + " svelte-10jhld9"));

    			add_location(div, file$9, 130, 0, 3240);
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

    			dispose = [
    				listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[30], false, false, false),
    				listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[31], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			const pausebutton_changes = {};
    			if (dirty[0] & /*isPaused*/ 4) pausebutton_changes.isPaused = /*isPaused*/ ctx[2];
    			pausebutton.$set(pausebutton_changes);
    			const cachedisplay_changes = {};
    			if (dirty[0] & /*cache*/ 512) cachedisplay_changes.cache = /*cache*/ ctx[9];
    			cachedisplay.$set(cachedisplay_changes);

    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand, openIndex*/ 6512) {
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

    			if (!current || dirty[0] & /*toggle, fade, hovering*/ 138 && div_class_value !== (div_class_value = "" + (null_to_empty("tree" + (/*toggle*/ ctx[7] ? "" : " tree-hide") + (/*fade*/ ctx[1]
    			? /*hovering*/ ctx[3] ? " noFade" : " fade"
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
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(130:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (141:0) {#if openIndex === topLevelObject_index}
    function create_if_block_1$2(ctx) {
    	let tr;
    	let td;
    	let pre;
    	let t;
    	let current;
    	let dispose;
    	let if_block = /*openIndex*/ ctx[4] === /*topLevelObject_index*/ ctx[34] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			pre = element("pre");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(pre, "class", "svelte-10jhld9");
    			add_location(pre, file$9, 144, 0, 3730);
    			attr_dev(td, "class", "treeVal svelte-10jhld9");
    			add_location(td, file$9, 142, 0, 3701);
    			attr_dev(tr, "class", "treeVal svelte-10jhld9");
    			add_location(tr, file$9, 141, 0, 3642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, pre);
    			if (if_block) if_block.m(pre, null);
    			append_dev(tr, t);
    			current = true;
    			dispose = listen_dev(tr, "mouseout", /*mouseout_handler*/ ctx[29], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*openIndex*/ ctx[4] === /*topLevelObject_index*/ ctx[34]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(pre, null);
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
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(141:0) {#if openIndex === topLevelObject_index}",
    		ctx
    	});

    	return block;
    }

    // (146:0) {#if openIndex === topLevelObject_index}
    function create_if_block_2$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*topLevelObject*/ ctx[32].childRows;
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
    			if (dirty[0] & /*hoverRow, topLevelObjectArray, rowsToShow, rowContract, rowExpand*/ 6496) {
    				each_value_1 = /*topLevelObject*/ ctx[32].childRows;
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(146:0) {#if openIndex === topLevelObject_index}",
    		ctx
    	});

    	return block;
    }

    // (148:0) {#if ( rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef)))) )}
    function create_if_block_3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let dispose;

    	const rowtext = new RowText({
    			props: { row: /*row*/ ctx[35] },
    			$$inline: true
    		});

    	const chevronbuttons = new ChevronButtons({
    			props: {
    				row: /*row*/ ctx[35],
    				rowsToShow: /*rowsToShow*/ ctx[5],
    				rowContract: /*rowContract*/ ctx[11],
    				rowExpand: /*rowExpand*/ ctx[12]
    			},
    			$$inline: true
    		});

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[27](/*row*/ ctx[35], ...args);
    	}

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[28](/*row*/ ctx[35], /*topLevelObject*/ ctx[32], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(rowtext.$$.fragment);
    			t0 = text("\n");
    			create_component(chevronbuttons.$$.fragment);
    			t1 = text("\n");

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[6] === /*row*/ ctx[35].indexRef || /*row*/ ctx[35].parentIndexRef.startsWith(/*hoverRow*/ ctx[6])
    			? "row hoverRow"
    			: "row") + " svelte-10jhld9"));

    			add_location(div, file$9, 151, 0, 3959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(rowtext, div, null);
    			append_dev(div, t0);
    			mount_component(chevronbuttons, div, null);
    			append_dev(div, t1);
    			current = true;

    			dispose = [
    				listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    				listen_dev(div, "mousedown", mousedown_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const rowtext_changes = {};
    			if (dirty[0] & /*topLevelObjectArray*/ 256) rowtext_changes.row = /*row*/ ctx[35];
    			rowtext.$set(rowtext_changes);
    			const chevronbuttons_changes = {};
    			if (dirty[0] & /*topLevelObjectArray*/ 256) chevronbuttons_changes.row = /*row*/ ctx[35];
    			if (dirty[0] & /*rowsToShow*/ 32) chevronbuttons_changes.rowsToShow = /*rowsToShow*/ ctx[5];
    			chevronbuttons.$set(chevronbuttons_changes);

    			if (!current || dirty[0] & /*hoverRow, topLevelObjectArray*/ 320 && div_class_value !== (div_class_value = "" + (null_to_empty(/*hoverRow*/ ctx[6] === /*row*/ ctx[35].indexRef || /*row*/ ctx[35].parentIndexRef.startsWith(/*hoverRow*/ ctx[6])
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
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(148:0) {#if ( rowsToShow.includes(row.parentIndexRef) && (!row.bracket || (row.bracket && (row.expandable || rowsToShow.includes(row.indexRef)))) )}",
    		ctx
    	});

    	return block;
    }

    // (147:0) {#each topLevelObject.childRows as row}
    function create_each_block_1(ctx) {
    	let show_if = /*rowsToShow*/ ctx[5].includes(/*row*/ ctx[35].parentIndexRef) && (!/*row*/ ctx[35].bracket || /*row*/ ctx[35].bracket && (/*row*/ ctx[35].expandable || /*rowsToShow*/ ctx[5].includes(/*row*/ ctx[35].indexRef)));
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
    			if (dirty[0] & /*rowsToShow, topLevelObjectArray*/ 288) show_if = /*rowsToShow*/ ctx[5].includes(/*row*/ ctx[35].parentIndexRef) && (!/*row*/ ctx[35].bracket || /*row*/ ctx[35].bracket && (/*row*/ ctx[35].expandable || /*rowsToShow*/ ctx[5].includes(/*row*/ ctx[35].indexRef)));

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
    		source: "(147:0) {#each topLevelObject.childRows as row}",
    		ctx
    	});

    	return block;
    }

    // (140:0) {#each topLevelObjectArray as topLevelObject, topLevelObject_index}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*openIndex*/ ctx[4] === /*topLevelObject_index*/ ctx[34] && create_if_block_1$2(ctx);

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
    			if (/*openIndex*/ ctx[4] === /*topLevelObject_index*/ ctx[34]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(140:0) {#each topLevelObjectArray as topLevelObject, topLevelObject_index}",
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
    				toggle: /*toggle*/ ctx[7],
    				tabPosition: /*tabPosition*/ ctx[0],
    				fade: /*fade*/ ctx[1],
    				hovering: /*hovering*/ ctx[3],
    				doToggle: /*doToggle*/ ctx[10]
    			},
    			$$inline: true
    		});

    	let if_block = /*toggle*/ ctx[7] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabbutton.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-object-explorer-wrapper svelte-10jhld9");
    			add_location(div, file$9, 127, 0, 3116);
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
    			if (dirty[0] & /*toggle*/ 128) tabbutton_changes.toggle = /*toggle*/ ctx[7];
    			if (dirty[0] & /*tabPosition*/ 1) tabbutton_changes.tabPosition = /*tabPosition*/ ctx[0];
    			if (dirty[0] & /*fade*/ 2) tabbutton_changes.fade = /*fade*/ ctx[1];
    			if (dirty[0] & /*hovering*/ 8) tabbutton_changes.hovering = /*hovering*/ ctx[3];
    			tabbutton.$set(tabbutton_changes);

    			if (/*toggle*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$5(ctx);
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
    	let openIndex = 0; // opens the relevant row if an object or array. 0 = 1st row
    	let openIndexSetOnce = false;
    	let showAllArr = []; //populated later with all row references
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
    		//console.log(isPaused);
    		$$invalidate(5, rowsToShow = showAll ? showAllArr : showManuallySelected);

    		if (!myStore) $$invalidate(15, myStore = lib.domParser());
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
    				$$invalidate(9, cache.dataUpdated = new Date(), cache);
    				$$invalidate(9, cache.dataChanges = cache.dataChanges + 1, cache);
    			}

    			if (cache.dataUpdated - cache.viewUpdated > rateLimit && !isPaused) {
    				$$invalidate(9, cache.myStore = JSON.parse(JSON.stringify(myStore)), cache);
    				$$invalidate(9, cache.viewChanges = cache.viewChanges + 1, cache);
    				$$invalidate(9, cache.viewUpdated = new Date(), cache);
    				$$invalidate(9, cache.formatted = formatDate(cache.viewUpdated), cache);
    				$$invalidate(8, topLevelObjectArray = transform_data$1.transform_data(cache)); //this should trigger a redraw

    				//if (!openIndexSetOnce)
    				//openIndex = transform_data.getOpenIndex(topLevelObjectArray, open, openIndexSetOnce);
    				$$invalidate(20, showAllArr = transform_data$1.getAllIndexes(topLevelObjectArray, openIndex));
    			}
    		}

    		function formatDate(d) {
    			return d.toDateString() + " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + ":" + d.getUTCMilliseconds();
    		}
    	}

    	// UI functions
    	function doToggle() {
    		$$invalidate(7, toggle = !toggle);
    	}

    	function rowContract(rowIndex) {
    		$$invalidate(19, showAll = false);
    		$$invalidate(21, showManuallySelected = showManuallySelected.filter(row => !row.startsWith(rowIndex)));
    	}

    	function rowExpand(rowIndex) {
    		$$invalidate(21, showManuallySelected = showManuallySelected.filter(row => row !== rowIndex));
    		showManuallySelected.push(rowIndex);
    	}

    	function click(index, val, type) {
    		console.log("click", index, val, type, openIndex);

    		if (Object.entries(val).length && type === "object" || val.length && type === "array") {
    			if (openIndex === index) {
    				$$invalidate(4, openIndex = null);
    			} else {
    				$$invalidate(4, openIndex = index);
    			}
    		}
    	}

    	function unpause() {
    		$$invalidate(2, isPaused = false);
    		console.log(isPaused);
    	}

    	function pause() {
    		$$invalidate(2, isPaused = true);
    		console.log(isPaused);
    	}

    	const writable_props = ["myStore", "tabPosition", "open", "fade", "rateLimit", "initialToggleState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = row => $$invalidate(6, hoverRow = row.indexRef);
    	const mousedown_handler = (row, topLevelObject) => console.log(row.indexRef, topLevelObject.childRows, rowsToShow);
    	const mouseout_handler = () => $$invalidate(6, hoverRow = null);
    	const mouseover_handler_1 = () => $$invalidate(3, hovering = true);
    	const mouseleave_handler = () => $$invalidate(3, hovering = false);

    	$$self.$set = $$props => {
    		if ("myStore" in $$props) $$invalidate(15, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(16, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(17, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(18, initialToggleState = $$props.initialToggleState);
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
    			hoverRow,
    			toggle,
    			topLevelObjectArray,
    			cache,
    			mainLoop
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("myStore" in $$props) $$invalidate(15, myStore = $$props.myStore);
    		if ("tabPosition" in $$props) $$invalidate(0, tabPosition = $$props.tabPosition);
    		if ("open" in $$props) $$invalidate(16, open = $$props.open);
    		if ("fade" in $$props) $$invalidate(1, fade = $$props.fade);
    		if ("rateLimit" in $$props) $$invalidate(17, rateLimit = $$props.rateLimit);
    		if ("initialToggleState" in $$props) $$invalidate(18, initialToggleState = $$props.initialToggleState);
    		if ("isPaused" in $$props) $$invalidate(2, isPaused = $$props.isPaused);
    		if ("hovering" in $$props) $$invalidate(3, hovering = $$props.hovering);
    		if ("showAll" in $$props) $$invalidate(19, showAll = $$props.showAll);
    		if ("openIndex" in $$props) $$invalidate(4, openIndex = $$props.openIndex);
    		if ("openIndexSetOnce" in $$props) openIndexSetOnce = $$props.openIndexSetOnce;
    		if ("showAllArr" in $$props) $$invalidate(20, showAllArr = $$props.showAllArr);
    		if ("showManuallySelected" in $$props) $$invalidate(21, showManuallySelected = $$props.showManuallySelected);
    		if ("rowsToShow" in $$props) $$invalidate(5, rowsToShow = $$props.rowsToShow);
    		if ("hoverRow" in $$props) $$invalidate(6, hoverRow = $$props.hoverRow);
    		if ("toggle" in $$props) $$invalidate(7, toggle = $$props.toggle);
    		if ("topLevelObjectArray" in $$props) $$invalidate(8, topLevelObjectArray = $$props.topLevelObjectArray);
    		if ("cache" in $$props) $$invalidate(9, cache = $$props.cache);
    		if ("mainLoop" in $$props) mainLoop = $$props.mainLoop;
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*toggle, showAll, showAllArr, showManuallySelected*/ 3670144) {
    			 if (toggle) $$invalidate(5, rowsToShow = showAll ? showAllArr : showManuallySelected);
    		}
    	};

    	return [
    		tabPosition,
    		fade,
    		isPaused,
    		hovering,
    		openIndex,
    		rowsToShow,
    		hoverRow,
    		toggle,
    		topLevelObjectArray,
    		cache,
    		doToggle,
    		rowContract,
    		rowExpand,
    		unpause,
    		pause,
    		myStore,
    		open,
    		rateLimit,
    		initialToggleState,
    		showAll,
    		showAllArr,
    		showManuallySelected,
    		mainLoop,
    		openIndexSetOnce,
    		timer,
    		refreshDataAndCache,
    		click,
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
    				myStore: 15,
    				tabPosition: 0,
    				open: 16,
    				fade: 1,
    				rateLimit: 17,
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

    		if (/*myStore*/ ctx[15] === undefined && !("myStore" in props)) {
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

    /* src/Example.svelte generated by Svelte v3.18.2 */
    const file$a = "src/Example.svelte";

    function create_fragment$a(ctx) {
    	let t0;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let p1;
    	let t4;
    	let span2;
    	let t5;
    	let span1;
    	let t6;
    	let span0;
    	let t8;
    	let p2;
    	let t10;
    	let h20;
    	let t13;
    	let h21;
    	let t14;
    	let t15;
    	let t16;
    	let button0;
    	let t18;
    	let button1;
    	let t20;
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
    			t4 = text("Provides a simple to use, quick a dirty hideable list of whatever data you wish to temporarily view whilst you are\ndeveloping your app, rather than console.logging or debugging.\n");
    			span2 = element("span");
    			t5 = text("level 1");
    			span1 = element("span");
    			t6 = text("level 2");
    			span0 = element("span");
    			span0.textContent = "level 3";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Displays most kinds of data: array, object, string, number, boolean, symbol";
    			t10 = space();
    			h20 = element("h2");
    			h20.textContent = `Autocounter from component state: ${/*counter*/ ctx[1]}`;
    			t13 = space();
    			h21 = element("h2");
    			t14 = text("Manual counter from custom store: ");
    			t15 = text(/*$count*/ ctx[0]);
    			t16 = space();
    			button0 = element("button");
    			button0.textContent = "-";
    			t18 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			t20 = space();
    			button2 = element("button");
    			button2.textContent = "reset";
    			add_location(h1, file$a, 60, 0, 1242);
    			add_location(p0, file$a, 62, 0, 1275);
    			add_location(span0, file$a, 68, 26, 1507);
    			add_location(span1, file$a, 68, 13, 1494);
    			add_location(span2, file$a, 68, 0, 1481);
    			add_location(p1, file$a, 65, 0, 1299);
    			add_location(p2, file$a, 70, 0, 1547);
    			add_location(h20, file$a, 72, 0, 1631);
    			add_location(h21, file$a, 74, 0, 1685);
    			attr_dev(button0, "id", "decr");
    			add_location(button0, file$a, 76, 0, 1738);
    			attr_dev(button1, "id", "incr");
    			add_location(button1, file$a, 77, 0, 1794);
    			attr_dev(button2, "id", "reset");
    			add_location(button2, file$a, 78, 0, 1850);
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
    			append_dev(p1, t4);
    			append_dev(p1, span2);
    			append_dev(span2, t5);
    			append_dev(span2, span1);
    			append_dev(span1, t6);
    			append_dev(span1, span0);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t14);
    			append_dev(h21, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, button2, anchor);
    			current = true;

    			dispose = [
    				listen_dev(button0, "click", count.decrement, false, false, false),
    				listen_dev(button1, "click", count.increment, false, false, false),
    				listen_dev(button2, "click", count.reset, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$count*/ 1) set_data_dev(t15, /*$count*/ ctx[0]);
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
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t20);
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
    //counter++;

    function instance$a($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(0, $count = $$value));
    	let counter = 1;

    	let array = [
    		{ first: "Bob", surname: "Marley" },
    		{ first: "John", surname: "Lennon" },
    		{
    			first: "The Chuckle",
    			surname: "Brothers"
    		}
    	];

    	let myStore = {
    		string1: "testy",
    		string2: "testy",
    		variousTypes: {
    			//boolean: true,
    			string2: "test"
    		}, /*
    number: 123,
    array: [[["test1", "test2"], "test2"], "test2"],
    longarray: new Array(4000).fill("test"),
    object: {
    test1: {
    test1: { test1: { test1: "test1", test2: "test2" }, test2: "test2" },
    test2: "test2",
    },
    test2: "test2",
    },
    arrowfunction: () => {},
    function: function test() {
    console.log("test");
    },
    symbol: Symbol(),
    null: null,
    undefined: typeof bananaman,
    */
    		
    	}; //SvelteVariable: counter,
    	//customStore: count,
    	//customStoreValue: $count,

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
    		if ("counter" in $$props) $$invalidate(1, counter = $$props.counter);
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

    	return [$count, counter, myStore, open, fade, tabPosition, rateLimit, string];
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
