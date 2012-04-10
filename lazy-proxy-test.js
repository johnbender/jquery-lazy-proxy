(function( $, QUnit ) {
	test( "LazyProxy properties should be functions", function() {
		var proxy = new $.LazyProxy();

		for( prop in proxy ){
			// TODO fragile
			if( proxy.hasOwnProperty(prop) && prop !== "accumulatedCalls" ) {
				ok( typeof proxy[prop] === "function" );
			}
		}
	});

	test( "arguments are forwarded properly to functions created with jQuery.functor", function() {
		var first, second;

		$.fn.bar = jQuery.functor(function( elem, arg1, arg2 ){
			first = arg1;
			second = arg2;
			return elem;
		});

		$("div").bar("first", "second").force();

		deepEqual(first, "first");
		deepEqual(second, "second");
	});

	test( "non lazy function following a lazy function forces the execution of composed morphisms", function() {
		var fooRan = false, $divs;

		$.fn.foo = jQuery.functor(function( elem ){
			fooRan = true;
			return elem;
		});

		$divs = $( "div" );
		$divs.foo();

		ok( !fooRan, "foo has not yet run" );

		$divs.addClass( "none" );

		ok( fooRan, "foo has run" );
	});

	test( "two lazy functions get fused", function() {
		var elementOrder = [], $divs, pushOrder;

		pushOrder = function( elem ){
			elementOrder.push(elem);
			return elem;
		};

		$.fn.foo = jQuery.functor(pushOrder);
		$.fn.bar = jQuery.functor(pushOrder);

		$divs = $( "div" ).foo().bar().force();

		// the first element should be pushed on the stack twice
		deepEqual( [$divs[0], $divs[0]], elementOrder.slice(0, 2) );
	});

	test( "two non lazy functions don't get fused", function() {
		var elementOrder = [], $divs, pushOrder;

		pushOrder = function( elem ){
			elementOrder.push(elem);
			return elem;
		};

		$.fn.foo = function() {
			return this.map(pushOrder);
		};

		$.fn.bar = function() {
			return this.map(pushOrder);
		};

		$divs = $( "div" ).foo().bar().force();

		deepEqual( [$divs[0], $divs[1]], elementOrder.slice(0, 2) );
	});
})( jQuery, QUnit );