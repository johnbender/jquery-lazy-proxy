(function( jQuery, undefined ) {
	// TODO this is going to be the primary slowdown in the inclusion of this library
	//      speeding up the init will reduce the object set size required for the loop
	//      fusion to be a net win
	jQuery.LazyProxy = function() {
		this._proxyState = {
			composed: undefined
		};

		// TODO compilation step to generate method definitions might be faster
		for( prop in jQuery.fn ){
			if( !jQuery.fn.hasOwnProperty( prop ) ||
					typeof jQuery.fn[ prop ] !== "function" ||
					prop === "force" ){
				continue;
			}

			this[ prop ] = this._proxy.insert( prop );
		}
	};

	jQuery.LazyProxy.prototype = jQuery.fn;

	jQuery.LazyProxy.prototype._proxy = {
		//TODO create a _proxy object to avoid namespace collisions
		identity: function ( elem ){
			return elem;
		},

		// TODO assignment of properties directly on this may be faster
		compose: function( a, aArgs, b ) {
			return function( elem ){
				var args = Array.prototype.slice.call(aArgs);

				args.unshift(b.call( elem, elem ));
				return a.apply( elem, args );
			};
		},

		force: function() {
			if( !this._proxyState.composed ) { return this; };
			jQuery.map( this, this._proxyState.composed );
			this._proxyState.composed = undefined;
			return this;
		},

		insert: function( prop ){
			var property = jQuery.fn[ prop ];

			return function( a, b, c, d, e, f, g ) {
				var proxy = this._proxy,
					state = this._proxyState,
					result;

				if( property.composable ) {
					state.composed = proxy.compose( property.composable, arguments, state.composed || proxy.identity );

					return this;
				} else {
					if( state.composed ) {
						result = proxy.force.call( this );
					}

					return property.apply( result || this, arguments );
				}
			};
		}
	};

	jQuery.fn.force = function() {
		return this._proxy.force.call( this );
	};

	jQuery.functor = function( composable ) {
		var fnMethod = function(){
			var argsArray = Array.prototype.slice.call( arguments );

			return this.map(function( i, elem ){
				var args = argsArray;
				args.unshift( elem );
				return composable.apply( elem, args );
			});
		};

		fnMethod.composable = composable;
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

	jQuery.LazyProxy.revert = function() {
		jQuery.fn.init = this.oldInit;
	};

	jQuery.LazyProxy.oldInit = jQuery.fn.init;
})( jQuery );