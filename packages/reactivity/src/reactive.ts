import { isObject } from "@vue/shared"
import { mutableHandlers } from "./baseHandlers"

// 使用weakmap 进行数据存储
export const reactiveMap =new WeakMap<object,any>()

// 导出响应式对象
export function reactive(target:object) {
    // 返回函数
    return createReactiveObject(target,mutableHandlers,reactiveMap)
}

function createReactiveObject(
    target:object, // 响应式对象
    baseHandlers:ProxyHandler<any>, // 代理
    proxyMap:WeakMap<object,any> // 存储数据
){
    // 获取存储的信息
    const existingProxy = proxyMap.get(target)
    // 如果存在直接返回
    if(existingProxy){
        return existingProxy
    }

    // 设置响应式代理值
    const proxy =new Proxy(target,baseHandlers)
    // 存储响应式代理
    proxyMap.set(target,proxy)
    // 可见返回的是代理对象
    return proxy

}

export const toReactive=<T extends unknown>(value:T):T=>{
    return isObject(value)? reactive(value as object):value
}