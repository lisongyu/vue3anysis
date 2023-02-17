import { Dep,createDep } from './dep';
import { isArray } from '@vue/shared';



type KeyToDepMap =Map<any,Dep>
const targetMap =new WeakMap<any,KeyToDepMap>()
export function effect<T = any>(fn: ()=> T) {
    // 响应式构造函数
    const _effect =new ReactiveEffect(fn)
    _effect.run()
}

export let activeEffect: ReactiveEffect|undefined

export class ReactiveEffect<T =any>{
    constructor(public fn:()=>T){
        
    }
    // 触发回调
    run() {
        activeEffect=this
        return this.fn()
    }
}


/**
 * 收集依赖
 * @param target 
 * @param key 
 */

export function track(target:object,key:unknown){
    console.log('tarck-收集依赖')
    if(!activeEffect){
        return 
    }
    let depsMap = targetMap.get(target)
    // 如果不存在进行设置
    if(!depsMap){
        targetMap.set(target,depsMap= new Map())
    }
    let dep =depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep = createDep()))
    }
    trackEffects(dep)
    console.log(targetMap)
}

export function trackEffects(dep:Dep){
    dep.add(activeEffect!)
}


/**
 * 触发依赖
 */

export function trigger(target:object,key:unknown,newValue:unknown){
    console.log('trigger-触发依赖')
   const depsMap = targetMap.get(target)
   if(!depsMap){
    return
   }

   const dep:Dep | undefined =depsMap.get(key)
   if(!dep){
    return 
   }
   triggerEffects(dep)

}

/**
 * 依次触发 dep中保存的依赖
 */

export function triggerEffects(dep:Dep){
    const effects=isArray(dep)?dep:[...dep]

    // 依次触发依赖
    for(const effect of effects){
        effect.run()
    }

}