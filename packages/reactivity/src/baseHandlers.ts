
import {track,trigger} from './effect'
const get = createGetter()
// get 返回
function createGetter(){
    return function get(target:object,key:string|symbol,receiver:object){
        const res= Reflect.get(target,key,receiver)
        // 触发收集   
        track(target,key)
        return res
    }
}

const set = createSetter()
// 设置方法
function createSetter(){
    return function set(target:object,key:string|symbol,value:unknown,receiver:object){
        const res= Reflect.set(target,key,value,receiver)
        // 触发依赖
        trigger(target,key,value)
        return res
    }
}

// 暴露代理对象
export const mutableHandlers: ProxyHandler<object> = {
    get,
    set
}