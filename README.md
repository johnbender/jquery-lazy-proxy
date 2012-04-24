# A Standard For Speed

For either of the proxy objects included in `proxies.js` to have any value to plug in authors, and ideally the jQuery core team, must provide the `HTMLElement` altering functions that underlie many of the jQuery core methods (eg `jQuery.fn.addClass` ) in one form or another. Without those functions end users cannot compose many of them to reduce the full set iterations for the proposed performance gain. For more information on those ideas please see the following links:

* http://johnbender.us/2012/02/29/faster-javascript-through-category-theory/
* http://johnbender.github.com/auto-jquery-optimization-paper/ (work in progress)

# jQuery.WarningProxy

This is a simplification of the original `jQuery.LazyProxy` (which is still included in the repository for further work). The idea is that developers should receive warnings when they care chaining one or more `$.fn` methods that iterate over the full set and have the pure function available for composition/fusing.

## Operation

This library is only meant as a development tool as its inclusion does incur a performance penalty. Again, it is only meant to alert the developer to areas for quick performance wins. To begin just include jQuery and the proxies library.

```html
<script type="text/javascript" src="jquery.js"></scrip>
<script type="text/javascript" src="proxies.js"></script>
```

Then before your jQuery chains execute

```javascript
jQuery.WarningProxy.init();
```

That will alter the jQuery object initialization to include an instance of the `jQuery.WarningProxy` in the prototype chain above the jQuery object instance but below `jQuery.fn` where all the methods we know and love reside. Ultimately the library will log a warning to the console if the console object exists on `window` with the names of the methods that were chained.

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

Sadly the performance benefits of of the loop fusion appear to be outweighed by the argument juggling required to support arbitrary arguments, and also possibly by the JIT compilers/similar optimizations in modern browsers. A simple [jsperf example](http://jsperf.com/lazy-loop-fusion-vs-traditional-method-chaning/3) shows that the vanilla method chaining (unfused loops) beats the LazyProxy approach (lazily fused loops) but looses out to simple fusion through function composition.

You can view the performance setup for the jsperf sample under `test/lazy-proxy-perf.js`
