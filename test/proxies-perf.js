jQuery.LazyProxy.init();

for( var i = 0; i <= (window.testElementCount || 100); i++ ){
	var div = document.createElement("div");
	div.setAttribute("data-test", "true");
	div.setAttribute("data-test-foo", "true");
	$( div ).data("baz", "bak").appendTo( "body" );
}

var addClassRaw = function( elem ){
	elem.setAttribute( "class", elem.getAttribute( "class" ) + " foo" );
	return elem;
};

var clearClassRaw = function( elem ) {
	elem.setAttribute( "class", "" );
	return elem;
};

$.fn.simpleAddClass = function(){
	$.map(this, addClassRaw);
	return this;
};

$.fn.simpleClearClass = function(){
	$.map(this, clearClassRaw);
	return this;
};

$.fn.lazyClearClass = $.functor(clearClassRaw);

$.fn.lazyAddClass = $.functor(addClassRaw);

$.fn.manualAddClearClass = function(){
	$.map(this, function( elem ){
		addClassRaw(clearClassRaw(elem));
	});
};

$.fn.removeAttr.composable = function( value ) {
	return function( elem ) {
		return $.removeAttr( elem, value );
	};
};

$.fn.removeData.composable = function( name ) {
	return function( elem ) {
		return $.removeAttr( elem, name );
	};
};

var rspace = /\s+/,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.extend({
	// simply add the return value
	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}

		return elem;
	}
});

$.fn.cleanUpWithArgs = function( attrKey, dataKey ) {
	return $.map( this, function( elem ) {
		$.removeData( $.removeAttr( elem, attrKey ), dataKey );
		return elem;
	});
};

$.fn.cleanUpWithArgsElementReplace = function( attrKey, dataKey ) {
	var length = this.length, elem;
	for( var i = 0; i < length; i++ ){
		elem = this[i];
		$.removeData( $.removeAttr( elem, attrKey ), dataKey );
		this[i] = elem;
	}

	return this;
};

$.fn.cleanUpWithArgsElementAlter = function( attrKey, dataKey ) {
	var length = this.length;
	for( var i = 0; i < length; i++ ){
		$.removeData( $.removeAttr( this[i], attrKey ), dataKey );
	}

	return this;
};

$.fn.cleanUpWithArgsElementAlterThree = function( fstAttrKey, sndAttrKey, dataKey ) {
	var length = this.length, elem;
	while( length-- ){
		$.removeData( $.removeAttr($.removeAttr( this[length], fstAttrKey ), sndAttrKey ), dataKey );
	}

	return this;
};

$.fn.cleanUpJustAttrs = function( fstAttrKey, sndAttrKey ) {
	var length = this.length;

	while( length-- ){
		$.removeAttr($.removeAttr( this[length], fstAttrKey ), sndAttrKey );
	}

	return this;
};

$.enhanceable = function( elem ) {
	var e = elem, c;

	while ( e ) {
		c = e.getAttribute ? e.getAttribute( "data-enhance" ) : "";

		if ( c === "false" ) {
			return undefined;
		}

		e = e.parentNode;
	}

	return elem;
};

$.fn.enhanceable = function() {
	return this.map(function( i, elem ) {
		return $.enhanceable( elem );
	});
};

$.fn.enhanceableCleanAttr = function( cleanAttr ) {
	return this.map(function( i, elem ) {
		elem = $.enhanceable( elem );

		if( elem ){
			$.removeAttr( elem, cleanAttr );
		}

		return elem;
	});
};

$.fn.removeThreeAttrs = function( fst, snd, thd ){
	return this.each(function() {
		jQuery.removeAttr( this, fst );
		jQuery.removeAttr( this, snd );
		jQuery.removeAttr( this, thd );
	});
};