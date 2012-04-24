(function( jQuery, undefined ) {
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

 	jQuery.WarningProxy.init = function() {
		var oldInit = this.oldInit;

		jQuery.fn.init = function( selector, context, rootjQuery ) {
			oldInit.prototype = new jQuery.WarningProxy();
			var jQueryArray = new oldInit( selector, context, rootjQuery );
			return jQueryArray;
		};
	};

	jQuery.WarningProxy.revert = function() {
		jQuery.fn.init = this.oldInit;
	};
	
	jQuery.WarningProxy.oldInit = jQuery.fn.init;
})( jQuery );