
(function( jQuery, undefined ) {
	jQuery.LazyProxy = function() {
		this.identity = this.composed = function identity( elem ){
			return elem;
		};

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
				var property = jQuery.fn[prop];

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

		for( prop in jQuery.fn ){
			var property;

			if( typeof jQuery.fn[prop] !== "function" ){
				continue;
			}

			this[prop] = this.proxyCallback( prop );
		}
	};

	jQuery.functor = function( htmlMorphism ) {
		var fnMethod = function(){
			var $this = this,
			args = Array.prototype.slice.call(arguments);

			this.map(function( elem ){
				return htmlMorphism.apply( $this, args.shift(elem) );
			});
		};

		fnMethod.htmlMorphism = htmlMorphism;
		return fnMethod;
	};

	jQuery.eachFunctor = function( htmlMorphism ) {
		var fnMethod = function(){
			var $this = this,
			args = Array.prototype.slice.call(arguments);

			console.log( args );

			this.each(function( i, elem ){
				htmlMorphism.apply( $this, args.shift(elem) );
			});
		};

		fnMethod.htmlMorphism = htmlMorphism;
		return fnMethod;
	};

	jQuery.LazyProxy.init = function() {
		jQuery.LazyProxy.prototype = jQuery.fn;
		jQuery.fn.init.prototype = new jQuery.LazyProxy();
	};

	jQuery.LazyProxy.init();
})( jQuery );