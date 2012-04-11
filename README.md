# jQuery.LazyProxy

This is a proof of concept for automatic loop fusion over jQuery sets using lazy chaining. The ideas behind library and information about the types of `$.fn` methods that can be defined for this library can be found [here](http://johnbender.us/2012/02/29/faster-javascript-through-category-theory/).

## Operation

[Loop fusion](http://en.wikipedia.org/wiki/Loop_fusion) is a fairly common performance optimization and in most cases results in must faster code. By making jquery `$.fn` methods lazy by placing a proxy in the prototype chain between a new jQuery object and its normal prototype `$.fn` this library tracks and can, in certain cases, perform automatic loop fusion.

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

Sadly the performance benefits of of the loop fusion appear to be outweighed by the argument juggling required to support arbitrary arguments, and also possibly by the JIT compilers/similar optimaztions in modern browsers. A simple [jsperf example](http://jsperf.com/lazy-loop-fusion-vs-traditional-method-chaning/3) shows that the vanilla method chaining (unfused loops) beats the LazyProxy approach (lazily fused loops) but looses out to simple fusion through function composition.

You can view the performance setup for the jsperf sample under `test/lazy-proxy-perf.js`
