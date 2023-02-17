import {ReactiveEffect} from './effect'

export type Dep =Set<ReactiveEffect>

// 塞入方法的数组
export const createDep = (effects?:ReactiveEffect[]):Dep => {
    const dep = new Set<ReactiveEffect>(effects) as Dep

    return dep
}