
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
            mount_component(component, options.target, options.anchor);
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
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
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
            $set() {
                // overridden by instance, if it has props
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
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
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* Scrollmation.svelte generated by Svelte v3.20.1 */
    const file = "Scrollmation.svelte";

    // (214:2) {#if !loading}
    function create_if_block(ctx) {
    	let div1;
    	let slot;
    	let t0;
    	let div0;
    	let div1_resize_listener;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			slot = element("slot");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = " ";
    			add_location(slot, file, 218, 6, 5959);
    			attr_dev(div0, "class", "scrollmation-scroll-spacer");
    			add_location(div0, file, 219, 6, 5974);
    			attr_dev(div1, "class", "scrollmation-fg");
    			set_style(div1, "margin-top", /*containerHeight*/ ctx[4] + /*startpos*/ ctx[0] + "px");
    			set_style(div1, "margin-bottom", /*containerHeight*/ ctx[4] + /*endpos*/ ctx[1] + "px");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[33].call(div1));
    			add_location(div1, file, 214, 4, 5775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, slot);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[33].bind(div1));
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*containerHeight, startpos*/ 17) {
    				set_style(div1, "margin-top", /*containerHeight*/ ctx[4] + /*startpos*/ ctx[0] + "px");
    			}

    			if (dirty[0] & /*containerHeight, endpos*/ 18) {
    				set_style(div1, "margin-bottom", /*containerHeight*/ ctx[4] + /*endpos*/ ctx[1] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			div1_resize_listener.cancel();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(214:2) {#if !loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let div_resize_listener;
    	let dispose;
    	let if_block = !/*loading*/ ctx[6] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			this.c = noop;
    			attr_dev(div, "class", "scrollmation-container");
    			set_style(div, "opacity", /*loading*/ ctx[6] ? 0 : 1);
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[35].call(div));
    			add_location(div, file, 206, 0, 5572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[34](div);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[35].bind(div));
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div, "scroll", /*onScroll*/ ctx[7], false, false, false),
    				listen_dev(div, "wheel", /*onWheel*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!/*loading*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*loading*/ 64) {
    				set_style(div, "opacity", /*loading*/ ctx[6] ? 0 : 1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[34](null);
    			div_resize_listener.cancel();
    			run_all(dispose);
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

    const toHomeRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) => (homeScrollPos - scrollPosPx) / (homeScrollPos - startScrollPosPx);
    const toStartRatio = ({ homeScrollPos, scrollPosPx, startScrollPosPx }) => (scrollPosPx - startScrollPosPx) / (homeScrollPos - startScrollPosPx);
    const toEndRatio = ({ scrollPosPx, endScrollPosPx, homeScrollPos }) => (scrollPosPx - endScrollPosPx) / (homeScrollPos - endScrollPosPx);
    const toRangeRatio = ({ scrollPosPx, endScrollPosPx, startScrollPosPx }) => (scrollPosPx - endScrollPosPx) / (startScrollPosPx - endScrollPosPx);
    const fullRangePx = ({ endScrollPosPx, startScrollPosPx }) => endScrollPosPx - startScrollPosPx;
    const toHomePx = ({ homeScrollPos, scrollPosPx }) => homeScrollPos - scrollPosPx;
    const toEndPx = ({ endScrollPosPx, scrollPosPx }) => endScrollPosPx - scrollPosPx;
    const toStartPx = ({ startScrollPosPx, scrollPosPx }) => startScrollPosPx - scrollPosPx;

    function instance($$self, $$props, $$invalidate) {
    	let $progress,
    		$$unsubscribe_progress = noop,
    		$$subscribe_progress = () => ($$unsubscribe_progress(), $$unsubscribe_progress = subscribe(progress, $$value => $$invalidate(27, $progress = $$value)), progress);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progress());
    	const component = get_current_component();
    	const svelteDispatch = createEventDispatcher();

    	const dispatch = (name, detail) => {
    		svelteDispatch(name, detail);

    		component.dispatchEvent && component.dispatchEvent(new CustomEvent(name,
    		{
    				detail,
    				bubbles: true,
    				cancelable: true,
    				composed: true, // makes the event jump shadow DOM boundary
    				
    			}));
    	};

    	let contentHeight;
    	let containerHeight;
    	let container;
    	let scrollPosPx = 0;
    	let animatingScroll = false;
    	let endScrollPosPx;
    	let startScrollPosPx = 0;
    	let prevScrollPosPx;
    	let targetScrollPx;
    	let scrollDir;
    	let targetPos = "home";
    	let loading = true;
    	let { startpos = 0 } = $$props; // px past the end
    	let { homepos = 0 } = $$props; //px from the top
    	let { endpos = 0 } = $$props; // px above the top - or negative value for before the end
    	let { duration = 900 } = $$props;
    	let { easing = cubicOut } = $$props;
    	let { scrolldata = {} } = $$props;
    	let { isPrevNav = false } = $$props;
    	let { scrolltoposition = null } = $$props;
    	let { jumptoposition = null } = $$props;
    	let { pgId = 0 } = $$props;

    	async function onScroll(e) {
    		$$invalidate(22, prevScrollPosPx = scrollPosPx);
    		$$invalidate(19, scrollPosPx = e.target.scrollTop);

    		if (!animatingScroll) {
    			progress.set(scrollPosPx, { duration: 0 });
    		}

    		let action = null;

    		if (prevScrollPosPx !== scrollPosPx) {
    			dispatch("scroll", scrolldata);

    			if (scrollPosPx === endScrollPosPx) {
    				action = "next";
    			}

    			if (scrollPosPx === startScrollPosPx) {
    				action = "prev";
    			}

    			if (scrollPosPx === homeScrollPos) {
    				action = "home";
    			}

    			if (animatingScroll && scrollPosPx === targetScrollPx) {
    				dispatch(action, scrolldata);
    				return;
    			}

    			if (!animatingScroll && action) {
    				dispatch(action, scrolldata);
    			}
    		}
    	}

    	function onWheel(e) {
    		if (animatingScroll) {
    			e.preventDefault();
    		}
    	}

    	let { progress = tweened(0, { duration, easing }) } = $$props;
    	validate_store(progress, "progress");
    	$$subscribe_progress();

    	async function jumpToPos(destPos) {
    		return await scrollToPos(destPos, false);
    	}

    	async function scrollToPos(destPos = "home", anim = true) {
    		if (!destPos) {
    			return;
    		}

    		targetPos = destPos;

    		switch (destPos) {
    			case "offscreen":
    				targetScrollPx = endScrollPosPx + 100;
    				break;
    			case "start":
    				targetScrollPx = startScrollPosPx;
    				break;
    			case "end":
    				targetScrollPx = endScrollPosPx;
    				break;
    			case "beforeStart":
    				targetScrollPx = startScrollPosPx + 1;
    				break;
    			case "beforeEnd":
    				targetScrollPx = endScrollPosPx - 1;
    				break;
    			default:
    				targetScrollPx = homeScrollPos;
    				break;
    		}

    		if (anim) {
    			$$invalidate(20, animatingScroll = true);
    			await progress.set(targetScrollPx);
    			$$invalidate(20, animatingScroll = false);
    		} else {
    			await progress.set(targetScrollPx, { duration: 0 });
    		}
    	}

    	// this needs some explaining. what problem am I solving here? initialisation of the frame at some point
    	//   providing a natural flow when going back
    	async function initPos(p) {
    		setTimeout(
    			async () => {
    				if (isPrevNav) {
    					await scrollToPos("beforeEnd", false);
    				} else {
    					await scrollToPos("beforeStart", false);
    				}

    				$$invalidate(20, animatingScroll = true);
    				$$invalidate(6, loading = false);
    				await scrollToPos("home");
    			},
    			200
    		);
    	}

    	const writable_props = [
    		"startpos",
    		"homepos",
    		"endpos",
    		"duration",
    		"easing",
    		"scrolldata",
    		"isPrevNav",
    		"scrolltoposition",
    		"jumptoposition",
    		"pgId",
    		"progress"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<scroll-mation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("scroll-mation", $$slots, []);

    	function div1_elementresize_handler() {
    		contentHeight = this.clientHeight;
    		$$invalidate(3, contentHeight);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(5, container = $$value);
    		});
    	}

    	function div_elementresize_handler() {
    		containerHeight = this.clientHeight;
    		$$invalidate(4, containerHeight);
    	}

    	$$self.$set = $$props => {
    		if ("startpos" in $$props) $$invalidate(0, startpos = $$props.startpos);
    		if ("homepos" in $$props) $$invalidate(10, homepos = $$props.homepos);
    		if ("endpos" in $$props) $$invalidate(1, endpos = $$props.endpos);
    		if ("duration" in $$props) $$invalidate(11, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(12, easing = $$props.easing);
    		if ("scrolldata" in $$props) $$invalidate(9, scrolldata = $$props.scrolldata);
    		if ("isPrevNav" in $$props) $$invalidate(13, isPrevNav = $$props.isPrevNav);
    		if ("scrolltoposition" in $$props) $$invalidate(14, scrolltoposition = $$props.scrolltoposition);
    		if ("jumptoposition" in $$props) $$invalidate(15, jumptoposition = $$props.jumptoposition);
    		if ("pgId" in $$props) $$invalidate(16, pgId = $$props.pgId);
    		if ("progress" in $$props) $$subscribe_progress($$invalidate(2, progress = $$props.progress));
    	};

    	$$self.$capture_state = () => ({
    		toHomeRatio,
    		toStartRatio,
    		toEndRatio,
    		toRangeRatio,
    		fullRangePx,
    		toHomePx,
    		toEndPx,
    		toStartPx,
    		afterUpdate,
    		createEventDispatcher,
    		onMount,
    		tweened,
    		cubicOut,
    		linear: identity,
    		get_current_component,
    		component,
    		svelteDispatch,
    		dispatch,
    		contentHeight,
    		containerHeight,
    		container,
    		scrollPosPx,
    		animatingScroll,
    		endScrollPosPx,
    		startScrollPosPx,
    		prevScrollPosPx,
    		targetScrollPx,
    		scrollDir,
    		targetPos,
    		loading,
    		startpos,
    		homepos,
    		endpos,
    		duration,
    		easing,
    		scrolldata,
    		isPrevNav,
    		scrolltoposition,
    		jumptoposition,
    		pgId,
    		onScroll,
    		onWheel,
    		progress,
    		jumpToPos,
    		scrollToPos,
    		initPos,
    		homeScrollPos,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentHeight" in $$props) $$invalidate(3, contentHeight = $$props.contentHeight);
    		if ("containerHeight" in $$props) $$invalidate(4, containerHeight = $$props.containerHeight);
    		if ("container" in $$props) $$invalidate(5, container = $$props.container);
    		if ("scrollPosPx" in $$props) $$invalidate(19, scrollPosPx = $$props.scrollPosPx);
    		if ("animatingScroll" in $$props) $$invalidate(20, animatingScroll = $$props.animatingScroll);
    		if ("endScrollPosPx" in $$props) $$invalidate(21, endScrollPosPx = $$props.endScrollPosPx);
    		if ("startScrollPosPx" in $$props) $$invalidate(31, startScrollPosPx = $$props.startScrollPosPx);
    		if ("prevScrollPosPx" in $$props) $$invalidate(22, prevScrollPosPx = $$props.prevScrollPosPx);
    		if ("targetScrollPx" in $$props) targetScrollPx = $$props.targetScrollPx;
    		if ("scrollDir" in $$props) $$invalidate(24, scrollDir = $$props.scrollDir);
    		if ("targetPos" in $$props) targetPos = $$props.targetPos;
    		if ("loading" in $$props) $$invalidate(6, loading = $$props.loading);
    		if ("startpos" in $$props) $$invalidate(0, startpos = $$props.startpos);
    		if ("homepos" in $$props) $$invalidate(10, homepos = $$props.homepos);
    		if ("endpos" in $$props) $$invalidate(1, endpos = $$props.endpos);
    		if ("duration" in $$props) $$invalidate(11, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(12, easing = $$props.easing);
    		if ("scrolldata" in $$props) $$invalidate(9, scrolldata = $$props.scrolldata);
    		if ("isPrevNav" in $$props) $$invalidate(13, isPrevNav = $$props.isPrevNav);
    		if ("scrolltoposition" in $$props) $$invalidate(14, scrolltoposition = $$props.scrolltoposition);
    		if ("jumptoposition" in $$props) $$invalidate(15, jumptoposition = $$props.jumptoposition);
    		if ("pgId" in $$props) $$invalidate(16, pgId = $$props.pgId);
    		if ("progress" in $$props) $$subscribe_progress($$invalidate(2, progress = $$props.progress));
    		if ("homeScrollPos" in $$props) $$invalidate(26, homeScrollPos = $$props.homeScrollPos);
    	};

    	let homeScrollPos;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*animatingScroll, $progress*/ 135266304) {
    			 if (animatingScroll) $$invalidate(5, container.scrollTop = $progress, container);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight, contentHeight, endpos, startpos*/ 27) {
    			 $$invalidate(21, endScrollPosPx = containerHeight + contentHeight + endpos + startpos);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight, homepos, startpos*/ 1041) {
    			 $$invalidate(26, homeScrollPos = containerHeight - homepos + startpos);
    		}

    		if ($$self.$$.dirty[0] & /*scrollPosPx, prevScrollPosPx*/ 4718592) {
    			 $$invalidate(24, scrollDir = scrollPosPx - prevScrollPosPx);
    		}

    		if ($$self.$$.dirty[0] & /*scrolltoposition*/ 16384) {
    			 scrollToPos(scrolltoposition);
    		}

    		if ($$self.$$.dirty[0] & /*jumptoposition*/ 32768) {
    			 jumpToPos(jumptoposition);
    		}

    		if ($$self.$$.dirty[0] & /*pgId*/ 65536) {
    			 initPos();
    		}

    		if ($$self.$$.dirty[0] & /*contentHeight, containerHeight, scrollPosPx, endScrollPosPx, homeScrollPos, scrollDir*/ 86507544) {
    			 {
    				$$invalidate(9, scrolldata = {
    					contentHeight,
    					containerHeight,
    					scrollPosPx,
    					endScrollPosPx,
    					startScrollPosPx,
    					homeScrollPos,
    					scrollDir
    				});
    			}
    		}
    	};

    	return [
    		startpos,
    		endpos,
    		progress,
    		contentHeight,
    		containerHeight,
    		container,
    		loading,
    		onScroll,
    		onWheel,
    		scrolldata,
    		homepos,
    		duration,
    		easing,
    		isPrevNav,
    		scrolltoposition,
    		jumptoposition,
    		pgId,
    		jumpToPos,
    		scrollToPos,
    		scrollPosPx,
    		animatingScroll,
    		endScrollPosPx,
    		prevScrollPosPx,
    		targetScrollPx,
    		scrollDir,
    		targetPos,
    		homeScrollPos,
    		$progress,
    		component,
    		svelteDispatch,
    		dispatch,
    		startScrollPosPx,
    		initPos,
    		div1_elementresize_handler,
    		div_binding,
    		div_elementresize_handler
    	];
    }

    class Scrollmation extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.scrollmation-container{width:100%;height:100%;overflow:auto;scrollbar-width:none;overscroll-behavior:none}.scrollmation-container::-webkit-scrollbar{display:none}.scrollmation-scroll-spacer{height:1px}</style>`;

    		init(
    			this,
    			{ target: this.shadowRoot },
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				startpos: 0,
    				homepos: 10,
    				endpos: 1,
    				duration: 11,
    				easing: 12,
    				scrolldata: 9,
    				isPrevNav: 13,
    				scrolltoposition: 14,
    				jumptoposition: 15,
    				pgId: 16,
    				progress: 2,
    				jumpToPos: 17,
    				scrollToPos: 18
    			},
    			[-1, -1]
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return [
    			"startpos",
    			"homepos",
    			"endpos",
    			"duration",
    			"easing",
    			"scrolldata",
    			"isPrevNav",
    			"scrolltoposition",
    			"jumptoposition",
    			"pgId",
    			"progress",
    			"jumpToPos",
    			"scrollToPos"
    		];
    	}

    	get startpos() {
    		return this.$$.ctx[0];
    	}

    	set startpos(startpos) {
    		this.$set({ startpos });
    		flush();
    	}

    	get homepos() {
    		return this.$$.ctx[10];
    	}

    	set homepos(homepos) {
    		this.$set({ homepos });
    		flush();
    	}

    	get endpos() {
    		return this.$$.ctx[1];
    	}

    	set endpos(endpos) {
    		this.$set({ endpos });
    		flush();
    	}

    	get duration() {
    		return this.$$.ctx[11];
    	}

    	set duration(duration) {
    		this.$set({ duration });
    		flush();
    	}

    	get easing() {
    		return this.$$.ctx[12];
    	}

    	set easing(easing) {
    		this.$set({ easing });
    		flush();
    	}

    	get scrolldata() {
    		return this.$$.ctx[9];
    	}

    	set scrolldata(scrolldata) {
    		this.$set({ scrolldata });
    		flush();
    	}

    	get isPrevNav() {
    		return this.$$.ctx[13];
    	}

    	set isPrevNav(isPrevNav) {
    		this.$set({ isPrevNav });
    		flush();
    	}

    	get scrolltoposition() {
    		return this.$$.ctx[14];
    	}

    	set scrolltoposition(scrolltoposition) {
    		this.$set({ scrolltoposition });
    		flush();
    	}

    	get jumptoposition() {
    		return this.$$.ctx[15];
    	}

    	set jumptoposition(jumptoposition) {
    		this.$set({ jumptoposition });
    		flush();
    	}

    	get pgId() {
    		return this.$$.ctx[16];
    	}

    	set pgId(pgId) {
    		this.$set({ pgId });
    		flush();
    	}

    	get progress() {
    		return this.$$.ctx[2];
    	}

    	set progress(progress) {
    		this.$set({ progress });
    		flush();
    	}

    	get jumpToPos() {
    		return this.$$.ctx[17];
    	}

    	set jumpToPos(value) {
    		throw new Error("<scroll-mation>: Cannot set read-only property 'jumpToPos'");
    	}

    	get scrollToPos() {
    		return this.$$.ctx[18];
    	}

    	set scrollToPos(value) {
    		throw new Error("<scroll-mation>: Cannot set read-only property 'scrollToPos'");
    	}
    }

    customElements.define("scroll-mation", Scrollmation);

    exports.default = Scrollmation;
    exports.fullRangePx = fullRangePx;
    exports.toEndPx = toEndPx;
    exports.toEndRatio = toEndRatio;
    exports.toHomePx = toHomePx;
    exports.toHomeRatio = toHomeRatio;
    exports.toRangeRatio = toRangeRatio;
    exports.toStartPx = toStartPx;
    exports.toStartRatio = toStartRatio;

    return exports;

}({}));
//# sourceMappingURL=scrollmation.js.map
