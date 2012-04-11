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
