// 需求：
// 项目中有多个弹层需求，
// 一些是公共方法，比如都可以点击关闭按钮关闭弹层
// 一些弹层是可以拖动的,且有蒙层
// 一些弹层是可以缩放的
// 其他大部分都是业务方法，无可复用性

// extends 简单实现下

class BaseModal {
  close(){
    console.log('close');
  }
}

class DragModal extends BaseModal {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
}

class ScaleModal extends BaseModal {
  scale() {
    console.log('scale');
  }
}

class CustomModal extends DragModal {
  do() {
    console.log('do');
  }
}

let c = new CustomModal();
d.close(); // close
c.drag(); // drag
c.do(); // do
c.hasLayer; // true


// 抛出问题：
// 1，如何使CustomModal能够同时继承DragModal和ScaleModal？
// 2，某个相同方法希望不覆盖，而是都执行



// 早期的mixin方法实现多继承

function getPrototypes(ClassPrototype) {
  return Object.getOwnPropertyNames(ClassPrototype).slice(1);
}

function mix(...mixins){
  return function(target){
    if (!mixins || !Array.isArray(mixins)) return target;
    let cp = target.prototype;
    for (let C of mixins) {
      let mp = C.prototype;
      for (let m of getPrototypes(mp)) {
        cp[m] = mp[m];
      }
    }
  }
}
@mix(DragModal, ScaleModal)
class CustomModal extends DragModal {
  scale(){
    console.log('custom-scale');
  } 
  do() {
    console.log('do');
  }
}
let c = new CustomModal();
c.close(); // 报错，因为dobase没在A或B的prototype上，而是在A.prototype.__proto__上
c.drag(); // drag
c.scale(); // scale  并非是我们想要的custom-scale
console.log(c.hasLayer); // undefined

// 以上mix方式实现了多继承，
// 但有以下缺点：
// 1，会修改target类的原型对象
// 2，target类的相同方法名会被被继承类的相同方法名覆盖
// 3，实例属性无法继承
// 4，Base类无法被继承



// 第三种只继承不修改prototype的实现方式

class BaseModal {
  close() {
    console.log('close');
  }
}

let DragModalMixin = (extendsClass) => class extends extendsClass {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
};

class CustomModal extends DragModalMixin(BaseModal) {
  drag() {
    console.log('custom-drag');
  }
  do() {
    console.log('do');
  }
}

let c = new CustomModal();

c.close(); // close
c.drag(); // custom-drag
console.log(c.hasLayer); // true

// 如何让CustomModal再继承ScaleModal呢
// 其实很简单，在上面基础上，我们再写一个ScaleModalMixinMixin类就可以了

let ScaleModalMixin = (extendsClass) => class extends extendsClass {
  scale() {
    console.log('scale');
  }
};

class CustomModal extends ScaleModalMixin(DragModalMixin(BaseModal)) {
  drag() {
    console.log('custom-drag');
  }
  do() {
    console.log('do');
  }
}

let c = new CustomModal();

c.close(); // close
c.drag(); // custom-drag
c.scale(); // scale
console.log(c.hasLayer); // true

// 这种方式不会修改父类的原型对象，但是如果纯在跟父类同名的方法，只会执行父类的，而不回执行被继承的类的方法，
// 那么如何使相同方法分别执行呢？

class BaseModal {
  close() {
    console.log('close');
  }
}

let DragModalMixin = (extendsClass) => class extends extendsClass {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
};
let ScaleModalMixin = (extendsClass) => class extends extendsClass {
  scale() {
    console.log('scale');
  }
  close() {
    console.log('scale-close');
    if (super.close) super.close();
  }
};

class CustomModal extends ScaleModalMixin(DragModalMixin(BaseModal)) {
  close() {
    console.log('custom-close');
    if (super.close) super.close();
  }
  do() {
    console.log('do');
  }
}

let c = new CustomModal();

c.close(); // custom-close   ->   scale-close   ->   close



