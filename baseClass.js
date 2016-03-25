var base = {};
var slice = [].slice;
var bind = function (scope, fun, args) {
    args = args || [];
    return function () {
        fun.apply(scope, args.concat(slice.call(arguments)));
    };
};

base.Class = function (supClass, childAttr) {
    //若是第一个是类，便是继承；如果第一个是对象，第二个参数无意义，便是新建一个类
    if (typeof supClass === 'object') {
        childAttr = supClass;
        supClass = function () { };
    }
    //新建临时类，最后作为新类返回，可能是继承可能是新类
    /***
    这里非常关键，为整个方法的入口，一定得看到初始化后，这里会执行构造函数
    ***/
    var newClass = function () {
        //每个类都会使用该函数，作为第一步初始化，告诉类有哪些属性
        this._propertys_ && this._propertys_();
        //第二步初始化，相当于子类的构造函数，比较重要，初始化方法不一定会出现
        this.init && this.init.apply(this, arguments);
    };
    //发生继承关系，可能为空类
    newClass.prototype = new supClass();

    //新建类必定会包含初始化函数，要么继承，如果没继承，这里也会新建
    var supInit = newClass.prototype.init || function () { };
    //传入的子对象可能包含他的初始化方法，如果有一定要使用，至于父类使用与否看子类心情
    var childInit = childAttr.init || function () { };
    //父类的properys方法便是指定会具有哪些属性，一定会执行
    var _supAttr = newClass.prototype._propertys_ || function () { };
    //子类的初始化也一定会触发，先执行父类再执行子类
    var _childAttr = childAttr._propertys_ || function () { };

    //为新建类（可能继承可能新建）初始化原型，上面的会重写，没有就不管他
    for (var k in childAttr) {
        childAttr.hasOwnProperty(k) && (newClass.prototype[k] = childAttr[k]);
    }

    //处理继承情况
    if (arguments.length && arguments[0].prototype && arguments[0].prototype.init === supInit) {
        //根据父类重写新建类构造时会用到的方法
        newClass.prototype.init = function () {
            var scope = this;
            var args = [function () {
                //第一个参数为父类的初始化函数，执行与否看子类心情
                supInit.apply(scope, arguments)
            } ];
            childInit.apply(scope, args.concat(slice.call(arguments)));
        };
    }
    //前面说到的，父类与子类的初始化方法一定会执行，先父后子
    newClass.prototype._propertys_ = function () {
        _supAttr.call(this);
        _childAttr.call(this);
    };

    //成员属性也得继承
    for (var k in supClass) {
        supClass.hasOwnProperty(k) && (newClass[k] = supClass[k]);
    }
    return newClass;
};