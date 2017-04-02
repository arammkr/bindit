class Scope {
  constructor(domElement) {
    this.$$watchers = [];
    this.domElement = domElement || document.body;
    this.nodes = null;
  }
  
  $watch(watchFn, listenerFn, eq) {
    const watcher = {
      watchFn: watchFn,
      listenerFn: listenerFn || function() {},
      eq: !!eq
    };
    this.$$watchers.push(watcher);
    
    //returning watcher destroy function;
    return () => {
      var index = this.$$watchers.indexOf(watcher);
      if (index >= 0) {
        self.$$watchers.splice(index, 1);
      }
    };
  }
  
  $$digestOnce() {
      let dirty = false;
      this.$$watchers.forEach(watch => {
        var newValue = watch.watchFn(this);
        var oldValue = watch.last;

        if (!this.$$areEquel(newValue, oldValue, watch.eq)) {
          watch.listenerFn(newValue, oldValue, this);
          dirty = true;
          watch.last = watch.eq ? this.$copy(newValue) : newValue;
        }
      });
      return dirty;
  }
  
  $digest() {
      let ttl = 10;
      let dirty;
      do {
        dirty = this.$$digestOnce();
        if (dirty && !(ttl--)) {
          throw "10 digest iterations reached";
        }
      } while (dirty);
  }
  
  $$areEquel (newValue, oldValue, valueEq) {
    if (valueEq) {
      return _.isEqual(newValue, oldValue);
    } else {
      return newValue === oldValue;
    }
  };
  
  $$arrayCopy(arr) {
    return arr.slice();
  }
  
  $$objCopy(obj) {
    return Object.assing({}, obj);
  }
  
  $copy(elem) {
    if (elem instanceof Array) {
      return this.$$arrayCopy(elem);
    } else if (elem instanceof Object) {
      return this.$$objCopy(elem);
    } 
    
    return elem;
  }
  
  
  $render() {
    let innerHtml = this.domElement.innerHTML;
    
    
    let bindings = this.$$textNodesUnder();
    
    bindings.forEach(el => {
      
      try {
        const scopeValue = eval('scope.' + el.value);
        el.node.nodeValue = scopeValue;
      } catch (e) {
        // console.error(e);
      }
    });
  }
  
  $$textNodesUnder() {

    if ( this.nodes !== null) {
      return this.nodes;
    }
    
    this.nodes = [];
    const regex = new RegExp('{{\s*(.+)\s*}}', 'g');
    
    let n, a = [],
        walk = document.createTreeWalker(this.domElement, NodeFilter.SHOW_TEXT, function(node) {
          console.log(node);
          return regex.test(node.nodeValue);
        }, false);
    
    while (n = walk.nextNode()) {
      let value = n.nodeValue.replace('{{', '').replace('}}', '').replace(' ', '');
      this.nodes.push({node: n, value: value});
    };
    return this.nodes;
  }
}

module.expots = Scope;
