/*
function log(target) {
  const desc = Object.getOwnPropertyDescriptors(target.prototype)

  for (const key of Object.keys(desc)) {
    if (key === 'constructor') {
      continue
    }
    const func = desc[key].value
    if (typeof func === 'function') {
      Object.defineProperty(target.prototype, key, {
        value(...args) {
          console.log('before' + key)
          const ret = func.apply(this, args)
          console.log('after' + key)
          return ret
        }
      })
    }
  }
}

// 类的实例对象，类成员的名称（pi），描述符
function readonly(target, key, descriptor) {
  descriptor.writable = false
}

function validate(target, key, descriptor) {
  const func = descriptor.value
  descriptor.value = function (...args) {
    for (let num of args) {
      if ('number ' !== typeof num) {
        throw new Error(`${num} is not a number`)
      }
    }
  return func.apply(this, args)
  }
}

@log
class Number {
  @readonly PI = 3.14

// 调用之前检查参数，用报错警告
  @validate
  add(...nums) {
    return nums.reduce((p, n) => (p + n), 0)
  }
}

new Number().add(1, 2)
new Number().add(1, 3)
*/

// 什么是observable？一种让数据的变化可以被观察的方法（原始类型，对象，数组，map）
// mobx常用api-对可观察的数据做出反应，观察数据变化的方式computed，autorun，when，reaction
import {computed, extendObservable, isArrayLike, observable, autorun, when, reaction, action, runInAction} from 'mobx'

//array object map
const arr = observable(['a', 'b', 'c'])
console.log(arr, Array.isArray(arr), isArrayLike(arr), arr[1])

const obj = observable({'a': 1, 'b': 2})
//新增属性
// extendObservable({'c': 3})
console.log(obj.a, obj.b)

const map = observable(new Map())
map.set('a', 1)
console.log(map)
console.log(map.has('a'))
map.delete('a')
console.log(map.has('a'))

// 基本数据类型必须要用observable.box

var num = observable.box(20)
var str = observable.box('hello')
var bool = observable.box(true)
str.set('world')
console.log(num.get(), str.get(), bool)


class Store {
  @observable array = []
  @observable obj = {}
  @observable map = new Map()

  @observable string = 'hello'
  @observable number = 20
  @observable bool = false
  @observable _bool = true

  @computed get mixed() {
    return store.string + '+' + store.number
  }

  @action bar() {
    this.string = 'hello bar world'
    this.number = 1010

  }

  @action.bound winBar() {
    this.string = 'bound world'
    this.number = 900
  }
}

// 观察数据变化的方法
// computed,autorun,when,reaction

// computed将多个可观察数据组合成一个可观察数据
var store = new Store()
var foo = computed(() => {
  return store.string + '+' + store.number
})
foo.observe(change => {  //监听
  console.log(change)
})
store.string = "world"
store.number = 40
console.log(foo.get()) //hello+20

// autorun自动追踪其所引用的观察数据，在数据发生变化的时候，重新触发
autorun(() => {
  console.log(store.string + '+' + store.number)
  console.log(store.mixed)
})
store.string = 'hello world'
store.number = 100

// when提供了条件执行逻辑，autorun的一种变种
when(() => store.bool, () => console.log('it true'))
store.bool = true


console.log('before')
when(() => store._bool, () => console.log('true true'))
console.log('after')

// reaction分离可观察数据声明，以副作用的方式对autorun做出改进
reaction(() => [store.string, store.number], arr => console.log(arr.join('')))
store.string = 'big world'
store.number = 90

// 修改可观察数据action
store.bar()
store.winBar()

runInAction(() => {
  store.string = 'runInActive world'
  store.number = 444
})

runInAction('modify', () => {
  store.string = 'runInActive modify world'
  store.number = 333
})