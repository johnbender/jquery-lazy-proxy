(function( jQuery, undefined ) {
	// TODO this is going to be the primary slowdown in the inclusion of this library
	//      speeding up the init will reduce the object set size required for the loop
	//      fusion to be a net win
	jQuery.LazyProxy = function() {
		//TODO create a _proxy object to avoid namespace collisions
		this.identity = function ( elem ){
			return elem;
		};

		// TODO assignment of properties directly on this may be faster
		this.compose = function( a, aArgs, b ) {
			return function( elem ){
				var args = Array.prototype.slice.call(aArgs);

				args.unshift(b.call( elem, elem ));
				return a.apply( elem, args );
			};
		};

		this.force = function() {
			if( !this.composed ) { return this; };
			jQuery.map( this, this.composed );
			this.composed = undefined;
			return this;
		};

		this.proxyCallback = function( prop ){
			var property = jQuery.fn[ prop ];

			return function() {
				if( property.htmlMorphism ) {
					this.composed = this.compose( property.htmlMorphism, arguments, this.composed || this.identity );

					return this;
				} else {
					if( this.composed ) {
						this.force();
					}

					return property.apply( this, arguments );
				}
			};
		};

		// TODO compilation step to generate method definitions might be faster
		for( prop in jQuery.fn ){
			if( !jQuery.fn.hasOwnProperty( prop ) || typeof jQuery.fn[ prop ] !== "function" ){
				continue;
			}

			this[ prop ] = this.proxyCallback( prop );
		}
	};

	jQuery.WarningProxy = function() {
		this._proxyState = {
			chainCount: 0,
			methodNames: []
		};

		// TODO compilation step to generate method definitions might be faster
		for( prop in jQuery.fn ){
			if( !jQuery.fn.hasOwnProperty( prop ) || typeof jQuery.fn[ prop ] !== "function" ){
				continue;
			}

			this[ prop ] = this._proxy.insert( prop );
		}
	};

	jQuery.WarningProxy.prototype = jQuery.fn;

	jQuery.WarningProxy.prototype._proxy = {
		warnThreshold: 1,

		log: function( msg ){
			if( window.console ){
				console.log( msg );
			}
		},

		insert: function( prop ) {
			var property = jQuery.fn[ prop ],
				propertyName = prop;

			return function() {
				var	proxy = this._proxy,
					proxyState = this._proxyState;

				// if the pure underlying dom manipulation is available count it
				if( property.htmlMorphism ) {
					proxyState.methodNames.push( propertyName );
					proxyState.chainCount++;
				}

				// if the count gets larger than the configured threshold "log" it
				if( proxyState.chainCount > proxy.warnThreshold ){
					proxy.log( proxyState.methodNames.toString() );
				}

				property.apply( this, arguments );
				return this;
			};
		}
	};

	jQuery.functor = function( htmlMorphism ) {
		var fnMethod = function(){
			var argsArray = Array.prototype.slice.call( arguments );

			return this.map(function( i, elem ){
				var args = argsArray;
				args.unshift( elem );
				return htmlMorphism.apply( elem, args );
			});
		};

		fnMethod.htmlMorphism = htmlMorphism;
		return fnMethod;
	};

	jQuery.LazyProxy.init = function() {
		var oldInit = this.oldInit;

		jQuery.fn.init = function( selector, context, rootjQuery ) {
			oldInit.prototype = new jQuery.LazyProxy();
			var jQueryArray = new oldInit( selector, context, rootjQuery );
			return jQueryArray;
		};
	};

 	jQuery.WarningProxy.init = function() {
		var oldInit = this.oldInit;

		jQuery.fn.init = function( selector, context, rootjQuery ) {
			oldInit.prototype = new jQuery.WarningProxy();
			var jQueryArray = new oldInit( selector, context, rootjQuery );
			return jQueryArray;
		};
	};

	jQuery.LazyProxy.revert = jQuery.WarningProxy.revert = function() {
		jQuery.fn.init = this.oldInit;
	};

	jQuery.LazyProxy.prototype = jQuery.fn;
	jQuery.LazyProxy.oldInit = jQuery.WarningProxy.oldInit = jQuery.fn.init;
})( jQuery );