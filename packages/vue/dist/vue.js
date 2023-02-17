var Vue = (function (exports) {
    'use strict';

    /**
     * 判断会否为一个数组
     */
    var isArray = Array.isArray;
    var isObject = function (val) { return val !== null && typeof val === 'object'; };
    /**
     * 对比两个数据是否发生改变
     */
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };

    // 塞入方法的数组
    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var targetMap = new WeakMap();
    function effect(fn) {
        // 响应式构造函数
        var _effect = new ReactiveEffect(fn);
        _effect.run();
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn) {
            this.fn = fn;
        }
        // 触发回调
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        return ReactiveEffect;
    }());
    /**
     * 收集依赖
     * @param target
     * @param key
     */
    function track(target, key) {
        console.log('tarck-收集依赖');
        if (!activeEffect) {
            return;
        }
        var depsMap = targetMap.get(target);
        // 如果不存在进行设置
        if (!depsMap) {
            targetMap.set(target, depsMap = new Map());
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
        console.log(targetMap);
    }
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    /**
     * 触发依赖
     */
    function trigger(target, key, newValue) {
        console.log('trigger-触发依赖');
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        var dep = depsMap.get(key);
        if (!dep) {
            return;
        }
        triggerEffects(dep);
    }
    /**
     * 依次触发 dep中保存的依赖
     */
    function triggerEffects(dep) {
        var e_1, _a;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            // 依次触发依赖
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                effect_1.run();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }

    var get = createGetter();
    // get 返回
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            // 触发收集   
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    // 设置方法
    function createSetter() {
        return function set(target, key, value, receiver) {
            var res = Reflect.set(target, key, value, receiver);
            // 触发依赖
            trigger(target, key);
            return res;
        };
    }
    // 暴露代理对象
    var mutableHandlers = {
        get: get,
        set: set
    };

    // 使用weakmap 进行数据存储
    var reactiveMap = new WeakMap();
    // 导出响应式对象
    function reactive(target) {
        // 返回函数
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, // 响应式对象
    baseHandlers, // 代理
    proxyMap // 存储数据
    ) {
        // 获取存储的信息
        var existingProxy = proxyMap.get(target);
        // 如果存在直接返回
        if (existingProxy) {
            return existingProxy;
        }
        // 设置响应式代理值
        var proxy = new Proxy(target, baseHandlers);
        // 存储响应式代理
        proxyMap.set(target, proxy);
        // 可见返回的是代理对象
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };

    function ref(value) {
        return createRef(value, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                if (hasChanged(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    /**
     *收集依赖
     */
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    /**
     *
     * 触发依赖
     * @returns
     */
    function triggerRefValue(ref) {
        ref.dep && triggerEffects(ref.dep);
    }
    /**
     *
     * 是否为ref
     */
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }

    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
