(function( jQuery, undefined ) {
	// TODO this is going to be the primary slowdown in the inclusion of this library
	//      speeding up the init will reduce the object set size required for the loop
	//      fusion to be a net win
	jQuery.LazyProxy = function() {
		this.identity = this.composed = function identity( elem ){
			return elem;
		};

		// TODO assignment of properties directly on this may be faster
		$.extend(this, {
			compose: function( a, aArgs, b ) {
				return function( elem ){
					var args = Array.prototype.slice.call(aArgs);

					args.unshift(b.call( elem, elem ));
					return a.apply( elem, args );
				};
			},

			force: function() {
				return jQuery( jQuery.map(this, this.composed) );
			},

			proxyCallback: function( prop ){
				var property = jQuery.fn[ prop ];

				return function() {
					if( property.htmlMorphism ){
						this.composed = this.compose(property.htmlMorphism, arguments, this.composed);

						return this;
					} else {
						if( this.composed !== this.identity ) {
							this.force();
						}

						return property.apply(this, arguments);
					}
				};
			}
		});

		// TODO compilation step to generate method definitions might be faster
		for( prop in jQuery.fn ){
			if( typeof jQuery.fn[ prop ] !== "function" ){
				continue;
			}

			this[ prop ] = this.proxyCallback( prop );
		}
	};

	jQuery.functor = function( htmlMorphism ) {
		var fnMethod = function(){
			var $this = this, argsArray = arguments;

			$.map(this, function( elem ){
				var args = Array.prototype.slice.call( argsArray );
				args.unshift( elem );
				return htmlMorphism.apply( $this, args );
			});

			return this;
		};

		fnMethod.htmlMorphism = htmlMorphism;
		return fnMethod;
	};

	jQuery.LazyProxy.init = function() {
		var oldInit = jQuery.fn.init;

		jQuery.fn.init = function( selector, context, rootjQuery ) {
			oldInit.prototype = new jQuery.LazyProxy();
			var jQueryArray = new oldInit( selector, context, rootjQuery );
			return jQueryArray;
		};
	};

	jQuery.LazyProxy.prototype = jQuery.fn;
	jQuery.LazyProxy.init();
})( jQuery );