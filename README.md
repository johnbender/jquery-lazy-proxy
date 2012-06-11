# A Standard For Speed

For either of the proxy objects to have any value, plug-in authors and ideally the jQuery core team, must provide the `HTMLElement` altering functions that underlie many of the jQuery core methods in one form or another. That is, while many of them don't actually use `jQuery.fn.map` or `jQuery.fn.each` they could be implemented that way or the composable alteration could be provided along side. Without those functions end users cannot compose them to reduce the full set iterations for the proposed performance gain. For more information on those ideas please see the following links:

* http://johnbender.us/2012/02/29/faster-javascript-through-category-theory/
* http://johnbender.github.com/auto-jquery-optimization-paper/ (work in progress)

### `composable`

The simplest and most flexible method for exposing the `HTMLElement` altering function that may underlie a given jQuery method is to use the `composable` attribute as a function to partially apply arguments. An example:

```javascript
$.fn.f.composable = function( a, b ){
  return function( elem ){
    return $.fn.f.htmlMorphism( a, b, elem );
  }
}

$.fn.g.composable = function( a ){
  return function( elem ){
    return $.fn.f.htmlMorphism( a, elem );
  }
}
```

Then, given a simple composition function for html morphisms:

```javascript
$.compose( $.fn.f.composable( "foo", "bar" ), $.fn.g.composable( "baz" ) );
```

Mind you that this is not general in the sense that you can't define your own new jQuery method with it because the arguments would be different at each invocation but the overhead would be negligible. Additionally, because of JavaScript's variable function argument capture a generic form of this composable function could be provided to apply some arbitrary number of arguments sure to exceed those in practical use. Eg:

```javascript
$.createComposable = function( fn, a, b, c, d, e, f, g ){
  return function( elem ){
    return fn( elem, a, b, c, d, e, f, g );
  };
}
```

which would see use in the form:

```javascript
$.createComposable( $.fn.f.composable, "foo, "bar" );
```

More thought required, though it seems requiring the definition of composable as a function is a cleaner standard.

## jQuery.WarningProxy

This is a simplification of the original `jQuery.LazyProxy` (which is still included in the repository for further work). The idea is that developers should receive warnings when they are chaining one or more `$.fn` methods that iterate over the full set and have the pure function available for composition/fusing.

### Operation

This library is only meant as a development tool as its inclusion does incur a performance penalty. Again, it is only meant to alert the developer to areas for quick performance wins. To begin just include jQuery and the proxies library.

```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="warning.js"></script>
```

Then before your jQuery chains execute

```javascript
jQuery.WarningProxy.init();
```

That will alter the jQuery object initialization to include an instance of the `jQuery.WarningProxy` in the prototype chain above the jQuery object instance but below `jQuery.fn` where all the methods we know and love reside. Ultimately the library will log a warning to the console if the console object exists on `window` with the names of the methods that were chained.

## jQuery.LazyProxy

This is a proof of concept for automatic loop fusion over jQuery sets using lazy chaining. The ideas behind library and information about the types of `$.fn` methods that can be defined for this library can be found [here](http://johnbender.us/2012/02/29/faster-javascript-through-category-theory/).

### Operation

[Loop fusion](http://en.wikipedia.org/wiki/Loop_fusion) is a fairly common performance optimization and in most cases results in faster code. By making jquery `$.fn` methods lazy by placing a proxy in the prototype chain between a new jQuery object and its normal prototype `$.fn` this library tracks and can, in certain cases, perform automatic loop fusion.

```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="lazy.js"></script>
```

Then before your jQuery chains execute

```javascript
jQuery.WarningProxy.init();
```

An example:

```javascript
var addClassRaw = function( elem, className ){
  elem.setAttribute( "class", elem.getAttribute( "class" ) + " " + className );
  return elem;
};

var clearClassRaw = function( elem ) {
  elem.setAttribute( "class", "" );
  return elem;
};

$.fn.lazyClearClass = $.functor(clearClassRaw);

$.fn.lazyAddClass = $.functor(addClassRaw);
```

By using the `$.functor` method provided by LazyProxy the raw HTMLElement function will be mapped over the jQuery set and tagged with the pure method. When the two newly defined `$.fn` methods are invoked on a jQuery object set:

```javascript
var $divs = $( "div" ).lazyClearClass().lazyAddClass( "foo" );
```

nothing happens! That's because the pure functions have been composed and are waiting to be executed either explicitly or by invoking any non lazy `$.fn` method.

```javascript
$divs.force()

//OR

$divs.show() // any $.fn will do
```

## Performance

Obviously it's important to measure the situations in which the lazy proxy plugin and the underlying composition actually provide performance benefits. Existing information and planned performance tests are documented below.

### Lazy Fusion Performance

Sadly the performance benefits of of the lazy loop fusion appear to be outweighed by the argument juggling required to support arbitrary arguments, and also possibly by the JIT compilers/similar optimizations in modern browsers. A simple [jsperf example](http://jsperf.com/lazy-loop-fusion-vs-traditional-method-chaning/5) shows that the vanilla method chaining (unfused loops) beats the LazyProxy approach (lazily fused loops) but looses out to simple fusion through function composition.

You can view the performance setup for the jsperf sample under `test/proxies-perf.js`

### Manual Loop Fusion Performance

In the interest of solidifying my understanding of when and where composition is a win I've constructed a few additional performance tests. At the time of this writing it appears that small element sets with faster/simpler functions provide speedups under composition.

Performances tests.

1. [Remove attr and remove data composed vs chained](http://jsperf.com/remove-attr-and-remove-data-composed-vs-vanilla-chained)
2. [Remove attr composed vs chained simple methods](http://jsperf.com/remove-attr-composed-vs-chained-simple-methods)
3. [Closest attr check and remove attr composed vs chained](http://jsperf.com/closest-attr-check-and-remove-attr-composed-vs-chained)
4. [Add class and clear class composed vs chained](http://jsperf.com/add-class-and-clear-class-composed-vs-chained)

Performance tests still left TODO

1. Chaining more than two methods
2. Very small sets (< 5)
3. Very large sets (> 100)
