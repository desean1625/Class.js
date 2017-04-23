Class = function() {};
Class.prototype.setOptions = function(options) {
    //Updates destenation object with source values
    if (!this.options) this.options = {};
    var update = function(dst, src) {
        for (var prop in src) {
            var val = src[prop];
            if (typeof val === "object") { // recursive
                if (typeof dst[prop] !== "object") dst[prop] = {};
                update(dst[prop], val);
            } else {
                dst[prop] = val;
            }
        }
        return dst; // return dst to allow method chaining
    }
    this.options = update(this.options, options);
    this.emit("setOptions",this.options)
    return this.options;
};
Class.extend = function(props) {
	props = props || {};
    var _extend = function(dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;
        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    }
    var update = function(dst, src) {
        for (var prop in src) {
            var val = src[prop];
            if (typeof val === "object") { // recursive
                if (typeof dst[prop] !== "object") dst[prop] = {};
                update(dst[prop], val);
            } else {
                dst[prop] = val;
            }
        }
        return dst; // return dst to allow method chaining
    }
    // extended class with the new prototype
    var NewClass = function() {
        // merge options
        this.options = {};
        if (proto.options) {
            update(this.options, proto.options);
        }
        if (props.options) {
            update(this.options, props.options);
        }
        // call the constructor
        if (this.init) {
            this.init.apply(this, arguments);
        }
        // call all constructor hooks
        if (this._initHooks) {
            this.callInitHooks();
        }
    };
    // instantiate class without calling constructor
    var F = function() {};
    F.prototype = this.prototype;
    var proto = new F();
    proto.constructor = NewClass;
    NewClass.prototype = proto;
    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }
    events = {
        on: function(type, listener){
        	if(!this._events) this._events = {};
        	if(!this._events[type]) this._events[type] = []
        	this._events[type].push(listener);
        },
        emit: function(type,event){
        	if(!this._events) this._events = {};
        	if(!this._events[type]) this._events[type] = [];
        	for (var i = this._events.length - 1; i >= 0; i--) {
        		this._events[i].call(this,event);
        	}
        }
    }
    _extend(proto,events)
    // mix given properties into the prototype
    _extend(proto, props);
    proto._initHooks = [];
    var parent = this;
    // jshint camelcase: false
    NewClass.__super__ = parent.prototype;
    // add method for calling all hooks
    proto.callInitHooks = function() {
        if (this._initHooksCalled) {
            return;
        }
        if (parent.prototype.callInitHooks) {
            parent.prototype.callInitHooks.call(this);
        }
        this._initHooksCalled = true;
        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };
    return NewClass;
};
Class.addInitHook = function(fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);
    var init = typeof fn === 'function' ? fn : function() {
        this[fn].apply(this, args);
    };
    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};