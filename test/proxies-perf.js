jQuery.LazyProxy.init();

for( var i = 0; i <= 100; i++ ){
  var div = document.createElement("div");
  div.setAttribute("data-test", "true");
  $( div ).appendTo( "body" );
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

$.fn.cleanUpWithCompose = function( attrKey, dataKey ) {
	var cleanAttr = $.fn.removeAttr.composable( attrKey ),
		cleanData = $.fn.removeData.composable( dataKey ),
		composed = function( elem ) { return cleanAttr( cleanData( elem )); };

	return $.map( this, composed );
};

$.fn.cleanUpWithArgs = function( attrKey, dataKey ) {
	return $.map( this, function( elem ) {
		$.removeAttr( elem, attrKey );
		return $.removeData( elem, dataKey );
	});
};
