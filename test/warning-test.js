(function( $, QUnit ) {
	module( "jQuery.WarningProxy", {
		setup: function() {
			$.fn.foo = jQuery.functor(function( elem ) {
				return elem;
			});

			$.fn.bar = jQuery.functor(function( elem ) {
				return elem;
			});

			$.fn.baz = function() { return this; };

			jQuery.WarningProxy.init();
		}
	});

	test( "should increment its count on method invocation", function() {
		var $divs = $( "div" );

		deepEqual( $divs._proxyState.chainCount, 0, "chainCount should init to 0");

		$divs.bar().baz();

		deepEqual( $divs._proxyState.chainCount, 1, "chainCount should increment on $.fn method invocation");
	});

	test( "should log a message with all the method names", function() {
		var $divs = $( "div" ), msg;

		$divs._proxy.log = function( val ) {
			msg = val;
		};

		// TODO make # of chained methods dependent on _proxy.warnThreshold
		$divs.foo().bar().baz();

		deepEqual( ["foo", "bar"].toString(), msg );
	});

	test( "default jQuery.fn methods should behave as normal", function() {
		var $divs = $( "div" );

		$divs.addClass( "normal-method-test" );

		$divs.each(function(i, elem) {
		  ok( elem.getAttribute( "class" ).indexOf( "normal-method-test" ) >= 0 );
		});
	});
})( jQuery, QUnit );