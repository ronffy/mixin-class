
// extends 实现单继承

class B {
	dob(){
		console.log('b');
	}
}

class A extends B {
	doa(){
		console.log('a');
	}
}


// mixin实现多继承

function getPrototypes(ClassPrototype) {
	return Object.getOwnPropertyNames(ClassPrototype).slice(1);
}
class A {
	doa() {
		console.log('a');
	}
}
class B {
	dob() {
		console.log('b');
	}
}
	// 第一种实现方式
	  /**
   * mixin混入模式，实现继承多个类
   * 实现原理：属性拷贝
   * @param C 实现继承的类
   * @mixins 被继承的类集合
   * @return 扩展后的类C
   */
  // function mixins(target, ...classes) {
  //   if (!classes || !Array.isArray(classes)) return target;
  //   let cp = target.prototype;
  //   for (let mixin of classes) {
  //     let mp = mixin.prototype;
  //     for (let m of getPrototypes(mp)) {
  //       cp[m] = mp[m];
  //     }
  //   }
  //   return target;
  // }
  // class C {
  //   doc() {
  //     console.log('c');
  //   }
  // }
  // mixins(C, A, B);
  // let c = new C();
  // c.doa();
  // 第二种实现使用方式
  // function mixins(...classes){
  //   return function(target){
  //     if (!classes || !Array.isArray(classes)) return target;
  //     let cp = target.prototype;
  //     for (let C of classes) {
  //       let mp = C.prototype;
  //       for (let m of getPrototypes(mp)) {
  //         cp[m] = mp[m];
  //       }
  //     }
  //   }
  // }
  // @mixins(A, B)
  // class C {
  //   doc() {
  //     console.log('c');
  //   }
  // }
  // let c = new C();
  // c.doa();
  // 以上两种实现方式有个缺点，就是会修改target类的原型对象

  // 第三种只继承不修改prototype的实现方式

  // 1，混入单个类

  // 2，混入多个类

  // 这种方式不会修改父类的原型对象，但是如果纯在跟父类同名的方法，只会执行父类的，而不回执行被继承的类的方法，
  // 那么如何



// 第二种方式：

class Mixin {
	constructor() {
		this.mixins = this.mixins || [];
		mixin(this, ...this.mixins)
	}
}

class C extends Mixin {
	mixins = [A, B]
	doc() {
		console.log('c');
	}
}

// 第三种方式

function mixins(...Classes) {
	return function(target){
		Object.assign(target.prototype, ...Classes)
	}
}

@mixins(A, B)
class C{
	doc(){
		console.log('c');
	}
}


