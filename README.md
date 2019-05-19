# mixin配合class实现多继承的绝佳妙用

## 什么是mixin

mixin一般翻译为“混入”、“混合”,  
早期一般解释为：把一个对象的方法和属性拷贝到另一个对象上；  
也可以简单理解为能够被继承的类，  
最终目的是实现代码的复用。  


## 从一个需求说起

为了使你能够最快的清楚我在说什么，我们从一个需求说起：

一个项目中有多个弹层需求；  
一些是公共方法，比如点击关闭按钮关闭弹层；  
一些弹层是可以拖动的，且有蒙层；  
一些弹层是可以缩放的；  
其他都是业务方法，无可复用性。

你可以先在心里想下，如果是你，你会怎样完成这个需求？


## 脑海中规划下

我们为公共方法写个类：`BaseModal`  
为可拖动的弹层写个类：`DragModal`  
为可缩放的弹层写个类：`ScaleModal`  
为自定义的业务需求写个类：`CustomModal`  

画个脑图的话，会是下面图片中的样子：

![不同类之间的关系图](http://oxk008h6r.bkt.clouddn.com/WX20180626-132952@2x.png)


## extends简单实现下

### 看代码

```javascript
// 公共方法
class BaseModal {
  close(){
    console.log('close');
  }
}

// 可以缩放的弹层，我们写一个单独的类
class ScaleModal extends BaseModal {
  scale() {
    console.log('scale');
  }
}

// 可以拖动的弹层，我们写一个单独的类
class DragModal extends BaseModal {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
}

// 业务方法
class CustomModal extends DragModal {
  close(){
    console.log('custom-close');
  }
  do() {
    console.log('do');
  }
}

let c = new CustomModal();
c.close(); // custom-close
c.drag(); // drag
c.do(); // do
c.hasLayer; // true
```

### 抛出问题

-  如何使`CustomModal`能够同时继承`DragModal`和`ScaleModal`？
-  某个相同方法希望不覆盖，而是都执行


## 试试早期的mixin方法实现多继承

### 看代码

```javascript
// 可以拖动的弹层，我们写一个单独的类
class DragModal extends BaseModal {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
}

// 可以缩放的弹层，我们写一个单独的类
class ScaleModal extends BaseModal {
  scale() {
    console.log('scale');
  }
}

// 获取原型对象的所有属性和方法
function getPrototypes(ClassPrototype) {
  return Object.getOwnPropertyNames(ClassPrototype).slice(1);
}

function mixin(...mixins){
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
@mixin(DragModal, ScaleModal)
class CustomModal {
  scale(){
    console.log('custom-scale');
  } 
  do() {
    console.log('do');
  }
}
let c = new CustomModal();
c.close(); // 报错，因为 close 没在 DragModal 或 ScaleModal 的 prototype 上，而是在 DragModal.prototype.__proto__ 上
c.drag(); // drag
c.scale(); // scale  并非是我们想要的custom-scale
console.log(c.hasLayer); // undefined
```

### 存在的问题
以上`mixin`方式实现了多继承，但存在以下问题

-  会修改`target`类的原型对象
-  `target`类的相同方法名会被被继承类的相同方法名覆盖
-  实例属性无法继承
-  `BaseModal`类无法被继承


## 完美的多继承

### 看代码
```javascript
class BaseModal {
  close() {
    console.log('close');
  }
}

let DragModalMinxin = (extendsClass) => class extends extendsClass {
  hasLayer = true;
  drag() {
    console.log('drag');
  }
};
let ScaleModalMinxin = (extendsClass) => class extends extendsClass {
  scale() {
    console.log('scale');
  }
  close() {
    console.log('scale-close');
    if (super.close) super.close();
  }
};

@DragModalMinxin
@ScaleModalMinxin
class CustomModal extends BaseModal {
  close() {
    console.log('custom-close');
    if (super.close) super.close();
  }
  do() {
    console.log('do');
  }
}

let c = new CustomModal();

c.hasLayer // true
c.close(); // scale-close  ->  custom-close  ->  close
```

可以看到，通过高阶函数的形式，我们既使`CustomModal`同时继承了`DragModal`和`ScaleModal`，  
又使某个相同方法不覆盖，都可以执行。

注：以上是修饰器写法，需要配置`babel`支持，如果不支持时，可以这样写
```js
CustomModal = DragModalMinxin(ScaleModalMinxin(CustomModal));
```


## 总结

Mixin是一种思想，用来实现代码高度可复用性，又可以用来解决多继承的问题，是一种非常灵活的设计模式，如果你多多琢磨，相信你也会发现一些其他的妙用的，看好你哟！
