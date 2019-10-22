
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
        else
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
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    /* src\index.svelte generated by Svelte v3.12.1 */
    const { Object: Object_1 } = globals;

    const file = "src\\index.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.testy = list[i];
    	return child_ctx;
    }

    // (424:4) {:else}
    function create_else_block_1(ctx) {
    	var t, i;

    	const block = {
    		c: function create() {
    			t = text("Show\n      ");
    			i = element("i");
    			attr_dev(i, "class", "fas fa-chevron-up");
    			add_location(i, file, 425, 6, 9646);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1.name, type: "else", source: "(424:4) {:else}", ctx });
    	return block;
    }

    // (421:4) {#if toggle}
    function create_if_block_3(ctx) {
    	var t, i;

    	const block = {
    		c: function create() {
    			t = text("Hide\n      ");
    			i = element("i");
    			attr_dev(i, "class", "fas fa-chevron-down");
    			add_location(i, file, 422, 6, 9583);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(421:4) {#if toggle}", ctx });
    	return block;
    }

    // (442:12) {#if displayClass(testy)}
    function create_if_block_1(ctx) {
    	var if_block_anchor;

    	function select_block_type_1(changed, ctx) {
    		if (ctx.debugStoreHovered === ctx.testy.key) return create_if_block_2;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type_1(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type !== (current_block_type = select_block_type_1(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(442:12) {#if displayClass(testy)}", ctx });
    	return block;
    }

    // (445:14) {:else}
    function create_else_block(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-chevron-right");
    			add_location(i, file, 445, 16, 10244);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(445:14) {:else}", ctx });
    	return block;
    }

    // (443:14) {#if debugStoreHovered === testy.key}
    function create_if_block_2(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-chevron-down");
    			add_location(i, file, 443, 16, 10172);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(443:14) {#if debugStoreHovered === testy.key}", ctx });
    	return block;
    }

    // (455:8) {#if debugStoreHovered === testy.key}
    function create_if_block(ctx) {
    	var tr0, td0, t0, tr1, td1, pre, t1_value = ctx.valueFormatter(ctx.testy.val) + "", t1, t2;

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			t0 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			pre = element("pre");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(td0, "colspan", "3");
    			attr_dev(td0, "class", "treeVal svelte-1wshp4h");
    			add_location(td0, file, 457, 12, 10621);
    			attr_dev(tr0, "class", "svelte-1wshp4h");
    			add_location(tr0, file, 455, 10, 10503);
    			attr_dev(pre, "class", "svelte-1wshp4h");
    			add_location(pre, file, 461, 14, 10762);
    			attr_dev(td1, "colspan", "3");
    			attr_dev(td1, "class", "treeVal svelte-1wshp4h");
    			add_location(td1, file, 460, 12, 10715);
    			attr_dev(tr1, "class", "treeVal svelte-1wshp4h");
    			add_location(tr1, file, 459, 10, 10682);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td1);
    			append_dev(td1, pre);
    			append_dev(pre, t1);
    			append_dev(tr1, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.testyArr) && t1_value !== (t1_value = ctx.valueFormatter(ctx.testy.val) + "")) {
    				set_data_dev(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr0);
    				detach_dev(t0);
    				detach_dev(tr1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(455:8) {#if debugStoreHovered === testy.key}", ctx });
    	return block;
    }

    // (437:6) {#each testyArr as testy}
    function create_each_block(ctx) {
    	var tr, td0, show_if = displayClass(ctx.testy), t0, t1_value = displayVal(ctx.testy.val) + "", t1, t2, td1, t3_value = ctx.testy.type + "", t3, t4, td2, t5_value = ctx.testy.key + "", t5, tr_class_value, t6, if_block1_anchor, dispose;

    	var if_block0 = (show_if) && create_if_block_1(ctx);

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	var if_block1 = (ctx.debugStoreHovered === ctx.testy.key) && create_if_block(ctx);

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
    			add_location(td0, file, 440, 10, 10061);
    			add_location(td1, file, 450, 10, 10379);
    			add_location(td2, file, 451, 10, 10411);
    			attr_dev(tr, "class", tr_class_value = "" + null_to_empty(displayClass(ctx.testy)) + " svelte-1wshp4h");
    			add_location(tr, file, 437, 8, 9941);
    			dispose = listen_dev(tr, "click", click_handler);
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
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.testyArr) show_if = displayClass(ctx.testy);

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(td0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((changed.testyArr) && t1_value !== (t1_value = displayVal(ctx.testy.val) + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((changed.testyArr) && t3_value !== (t3_value = ctx.testy.type + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if ((changed.testyArr) && t5_value !== (t5_value = ctx.testy.key + "")) {
    				set_data_dev(t5, t5_value);
    			}

    			if ((changed.testyArr) && tr_class_value !== (tr_class_value = "" + null_to_empty(displayClass(ctx.testy)) + " svelte-1wshp4h")) {
    				attr_dev(tr, "class", tr_class_value);
    			}

    			if (ctx.debugStoreHovered === ctx.testy.key) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}

    			if (if_block0) if_block0.d();

    			if (detaching) {
    				detach_dev(t6);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(if_block1_anchor);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(437:6) {#each testyArr as testy}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div2, div0, div0_class_value, t0, div1, table, colgroup, col0, t1, col1, t2, col2, t3, div1_class_value, dispose;

    	function select_block_type(changed, ctx) {
    		if (ctx.toggle) return create_if_block_3;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	let each_value = ctx.testyArr;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

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
    			attr_dev(div0, "class", div0_class_value = "" + null_to_empty(((ctx.toggle ? 'toggle toggleShow' : 'toggle toggleHide') + (ctx.top ? ' toggleTop' : ' toggleBottom'))) + " svelte-1wshp4h");
    			add_location(div0, file, 417, 2, 9413);
    			set_style(col0, "width", "35%");
    			add_location(col0, file, 432, 8, 9789);
    			set_style(col1, "width", "10%");
    			add_location(col1, file, 433, 8, 9823);
    			set_style(col2, "width", "55%");
    			add_location(col2, file, 434, 8, 9857);
    			add_location(colgroup, file, 431, 6, 9770);
    			attr_dev(table, "class", "svelte-1wshp4h");
    			add_location(table, file, 430, 4, 9756);
    			attr_dev(div1, "class", div1_class_value = "" + null_to_empty(('tree' + (ctx.toggle ? '' : ' tree-hide'))) + " svelte-1wshp4h");
    			add_location(div1, file, 429, 2, 9700);
    			attr_dev(div2, "class", "wrapper svelte-1wshp4h");
    			add_location(div2, file, 416, 0, 9389);
    			dispose = listen_dev(div0, "click", ctx.doToggle);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if_block.m(div0, null);
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
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type !== (current_block_type = select_block_type(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if ((changed.toggle || changed.top) && div0_class_value !== (div0_class_value = "" + null_to_empty(((ctx.toggle ? 'toggle toggleShow' : 'toggle toggleHide') + (ctx.top ? ' toggleTop' : ' toggleBottom'))) + " svelte-1wshp4h")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (changed.debugStoreHovered || changed.testyArr || changed.valueFormatter || changed.displayClass || changed.displayVal) {
    				each_value = ctx.testyArr;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.toggle) && div1_class_value !== (div1_class_value = "" + null_to_empty(('tree' + (ctx.toggle ? '' : ' tree-hide'))) + " svelte-1wshp4h")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if_block.d();

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
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
      } //
      else if (getType(val) === "boolean") {
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

    function code_format_null(parentArr, level, optionalIndex) {
      parentArr.push({
        output: indent_row(code_format_index(optionalIndex) + "null", level),
        type: "Null"
      });
    }

    function code_format_undefined(parentArr, level, optionalIndex) {
      parentArr.push({
        output: indent_row(code_format_index(optionalIndex) + "undefined", level),
        type: "Undefined"
      });
    }

    function code_format_boolean(parentArr, bool, level, optionalIndex) {
      parentArr.push({
        output: indent_row(
          code_format_index(optionalIndex) + (bool ? "true" : "false"),
          level
        ),
        type: "Boolean"
      });
    }

    function code_format_string(parentArr, str, level, optionalIndex) {
      parentArr.push({
        output: indent_row(
          code_format_index(optionalIndex) + "'" + str + "'",
          level
        ),
        type: "String"
      });
    }

    function code_format_number(parentArr, num, level, optionalIndex) {
      parentArr.push({
        output: indent_row(code_format_index(optionalIndex) + num, level),
        type: "Number"
      });
    }

    function code_format_symbol(parentArr, sym, level, optionalIndex) {
      parentArr.push({
        output: indent_row(
          code_format_index(optionalIndex) + "'" + sym.toString() + "'",
          level
        ),
        type: "Symbol"
      });
    }

    function code_format_function(parentArr, fn, level, optionalIndex) {
      parentArr.push({
        output: indent_row(
          code_format_index(optionalIndex) + "'" + fn.name + "'",
          level
        ),
        type: "Function"
      });
    }

    function code_format_unknown(parentArr, level, optionalIndex) {
      parentArr.push({
        output: indent_row(
          code_format_index(optionalIndex) + "!!unknown!!",
          level
        )
      });
    }

    function code_format_index(optionalIndex) {
      return typeof optionalIndex !== "undefined" ? optionalIndex + ": " : "";
    }

    function indent_row(row, level) {
      return " ".repeat(level * 3) + row;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { myStore, top = false } = $$props;
      let toggle = true;
      let debugStoreHovered = null;
      let testyArr = [];

      function doToggle() {
        $$invalidate('toggle', toggle = !toggle);
      }

      function click(key, val, type) {
        if (
          (Object.entries(val).length && type === "object") ||
          (val.length && type === "array")
        ) {
          if (debugStoreHovered === key) {
            $$invalidate('debugStoreHovered', debugStoreHovered = null);
          } else {
            $$invalidate('debugStoreHovered', debugStoreHovered = key);
          }
        }
      }

      function code_format_array(
        parentArr,
        arr,
        level,
        optionalIndex,
        optionalNewLine
      ) {
        if (optionalNewLine) {
          parentArr.push({
            output: indent_row(code_format_index(optionalIndex), level)
          });
        }
        /*
          parentArr.push({
            output: indent_row(
              "[  Array (" + arr.length + ")",
              level + (optionalIndex ? 2 : 1)
            )
          });
          arr.map((value, index) =>
            formatByType(parentArr, value, level + (optionalIndex ? 3 : 2), index)
          );
          parentArr.push({
            output: indent_row("]", level + (optionalIndex ? 2 : 1))
          });
        } else {*/
        parentArr.push({
          output: indent_row(
            (optionalNewLine ? "" : code_format_index(optionalIndex)) +
              "[  Array (" +
              arr.length +
              ")",
            level + (optionalIndex ? 1 : 0)
          )
        });
        arr.map((value, index) =>
          formatByType(
            parentArr,
            value,
            level + (optionalIndex ? 2 : 1),
            index,
            true
          )
        );
        parentArr.push({
          output: indent_row("]", level + (optionalIndex ? 1 : 0))
        });
        //}
      }

      function code_format_object(
        parentArr,
        obj,
        level,
        optionalIndex,
        optionalNewLine
      ) {
        let object = Object.entries(obj);
        if (optionalNewLine) {
          parentArr.push({
            output: indent_row(code_format_index(optionalIndex), level)
          });
        }
        parentArr.push({
          output: indent_row(
            (optionalNewLine ? "" : code_format_index(optionalIndex)) +
              "{  Object (" +
              object.length +
              ")",
            level + (optionalIndex || optionalNewLine ? 1 : 0)
          )
        });
        object.forEach(([key, value], index) => {
          formatByType(
            parentArr,
            value,
            level + (optionalIndex || optionalNewLine ? 2 : 1),
            key,
            true
          );
        });

        parentArr.push({
          output: indent_row(
            "}",
            level + (optionalIndex || optionalNewLine ? 1 : 0)
          )
        });
      }

      function formatByType(
        parentArr,
        value,
        level,
        optionalIndex,
        optionalNewLine
      ) {
        if (value === null) code_format_null(parentArr, level, optionalIndex);
        else if (typeof value === "undefined")
          code_format_undefined(parentArr, level, optionalIndex);
        else if (typeof value === "boolean")
          code_format_boolean(parentArr, value, level, optionalIndex);
        else if (typeof value === "string")
          code_format_string(parentArr, value, level, optionalIndex);
        else if (typeof value === "number")
          code_format_number(parentArr, value, level, optionalIndex);
        else if (typeof value === "symbol")
          code_format_symbol(parentArr, value, level, optionalIndex);
        else if (typeof value === "function")
          code_format_function(parentArr, value, level, optionalIndex);
        else if (Array.isArray(value))
          code_format_array(
            parentArr,
            value,
            level,
            optionalIndex,
            optionalNewLine
          );
        else if (typeof value === "object")
          code_format_object(
            parentArr,
            value,
            level,
            optionalIndex,
            optionalNewLine
          );
        else code_format_unknown(parentArr, level, optionalIndex);
      }

      function valueFormatter(object) {
        let parentArr = []; //[{ output: '   test:"test"', type: "string" }];
        //let test = { test: ["test", { test: 1, test2: 2 }], test: 3, test2: 4 };
        /*let test = {
          test0: { test5: 1234 },
          test: "test",
          test2: 123,
          test3: [123],
          test4: { test5: 1234 },
          test5: 2,
          test6: "3",
          test7: [4, 5, 6]
        };*/
        formatByType(parentArr, object, 0);

        let str = "";
        parentArr.map(
          row =>
            (str += row.output + (row.type ? " (" + row.type + ")" : "") + "\n")
        );
        return str;
      }

    	const writable_props = ['myStore', 'top'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ({ testy }) => click(testy.key, testy.val, testy.type);

    	$$self.$set = $$props => {
    		if ('myStore' in $$props) $$invalidate('myStore', myStore = $$props.myStore);
    		if ('top' in $$props) $$invalidate('top', top = $$props.top);
    	};

    	$$self.$capture_state = () => {
    		return { myStore, top, toggle, debugStoreHovered, testyArr };
    	};

    	$$self.$inject_state = $$props => {
    		if ('myStore' in $$props) $$invalidate('myStore', myStore = $$props.myStore);
    		if ('top' in $$props) $$invalidate('top', top = $$props.top);
    		if ('toggle' in $$props) $$invalidate('toggle', toggle = $$props.toggle);
    		if ('debugStoreHovered' in $$props) $$invalidate('debugStoreHovered', debugStoreHovered = $$props.debugStoreHovered);
    		if ('testyArr' in $$props) $$invalidate('testyArr', testyArr = $$props.testyArr);
    	};

    	$$self.$$.update = ($$dirty = { myStore: 1, testyArr: 1 }) => {
    		if ($$dirty.myStore || $$dirty.testyArr) { {
            $$invalidate('testyArr', testyArr = []);
            for (const key in myStore) {
              if (myStore.hasOwnProperty(key)) {
                testyArr.push({ key, val: myStore[key], type: getType(myStore[key]) });
              }
            }
            testyArr.sort(sort_byKey);
          } }
    	};

    	return {
    		myStore,
    		top,
    		toggle,
    		debugStoreHovered,
    		testyArr,
    		doToggle,
    		click,
    		valueFormatter,
    		click_handler
    	};
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["myStore", "top"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Index", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.myStore === undefined && !('myStore' in props)) {
    			console.warn("<Index> was created without expected prop 'myStore'");
    		}
    	}

    	get myStore() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set myStore(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\example.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\example.svelte";

    function create_fragment$1(ctx) {
    	var t0, h1, t2, t3_value = JSON.stringify(ctx.testObject) + "", t3, current;

    	var svelteobjectexplorer = new Index({
    		props: { myStore: ctx.testObject },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			svelteobjectexplorer.$$.fragment.c();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Example Object";
    			t2 = space();
    			t3 = text(t3_value);
    			add_location(h1, file$1, 7, 0, 157);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(svelteobjectexplorer, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var svelteobjectexplorer_changes = {};
    			if (changed.testObject) svelteobjectexplorer_changes.myStore = ctx.testObject;
    			svelteobjectexplorer.$set(svelteobjectexplorer_changes);

    			if ((!current || changed.testObject) && t3_value !== (t3_value = JSON.stringify(ctx.testObject) + "")) {
    				set_data_dev(t3, t3_value);
    			}
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

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(h1);
    				detach_dev(t2);
    				detach_dev(t3);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { testObject } = $$props;

    	const writable_props = ['testObject'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Example> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('testObject' in $$props) $$invalidate('testObject', testObject = $$props.testObject);
    	};

    	$$self.$capture_state = () => {
    		return { testObject };
    	};

    	$$self.$inject_state = $$props => {
    		if ('testObject' in $$props) $$invalidate('testObject', testObject = $$props.testObject);
    	};

    	return { testObject };
    }

    class Example extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["testObject"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Example", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.testObject === undefined && !('testObject' in props)) {
    			console.warn("<Example> was created without expected prop 'testObject'");
    		}
    	}

    	get testObject() {
    		throw new Error("<Example>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set testObject(value) {
    		throw new Error("<Example>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let smallTestObject = {
        test: 1,
        test2: "test2",
        test3: { test4: 4, test5: { test6: ["test6", "test7"] } }
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
        props: { testObject: largeTestObject, top: true }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
