var Size = (function() {

  // define private access variables.
  var _elem = null,
      _self = null,
      _w = window,
      _d = _w.document,
      _de = _d.documentElement,
      _dv = _d.defaultView,
      _gcs = _dv.getComputedStyle;

  // define the constructor.
  // this is what we'll return at the end of this 
  // class-creation iife.
  function Size (elem) {
    
    // TODO - make this constructor "safe" from
    // being called without the new operator

    // make a copy of this we can reliably use 
    // from our private functions.
    _self = this;

    // TODO - do we need to be returning this
    //        value if we use a "safe" constructor,
    //        guaranteeing that this the object is created
    //        with the new keyword?
    //
    // Why does it seem to work even when 
    // I don't return self? I think it's too 
    // late. Must sleep. My warm wife is calling me.
    return _self.elem(elem);
  }
  
  //
  // an element's font pixel size is easily obtained
  // from its computed styles.
  //
  function _px (preferString) {
    preferString = Boolean(preferString);
    _self.string.px = _gcs(_elem).getPropertyValue('font-size');
    _self.value.px = parseFloat(_self.string.px);
    return preferString ? _self.string.px : _self.value.px;
  }
  
  //
  // converting an element's pixel size to its em size
  // means we compare the element's font pixel size to the 
  // pixel size of the element's parent (which is, in effect,
  // the element's inherited font pixel size).
  //
  function _em (preferString) {
    preferString = Boolean(preferString);
    var parentFontSize = parseInt(_gcs(_elem.parentNode).fontSize, 10),
        elemFontSize = parseInt(_gcs(_elem).fontSize, 10),
        pxInEms = Math.floor((elemFontSize / parentFontSize) * 100) / 100;
    _self.value.em = pxInEms;
    _self.string.em = pxInEms + 'em';
    return preferString ? _self.string.em : _self.value.em;
  }
  
  //
  // converting an element's pixel size to rem size
  // means we compare the element's font pixel size to the 
  // font pixel size of the root element. in a browser,
  // this is the <html> element.
  //
  function _rem (preferString) {
    var htmlFontSize = parseInt(_gcs(_de).fontSize, 10),
        elemFontSize = parseInt(_gcs(_elem).fontSize, 10),
        pxInRems = Math.floor((elemFontSize / htmlFontSize) * 100) / 100;
    _self.value.rem = pxInRems;
    _self.string.rem = pxInRems + 'rem';
    return preferString ? _self.string.rem : _self.value.rem;
  }

  //
  // We'll calculate a "real" pixels-to-points ratio based on 
  // actual text sizing even though the css2 spec specifies that 
  // 1px === 0.75pt. For reference, see
  // http://www.w3.org/TR/CSS21/syndata.html#length-units
  //
  function _pt (preferString) {
    var ptTestDiv = _d.createElement('div');
    ptTestDiv.style.fontSize = '72pt';
    ptTestDiv.style.visibility = 'hidden'; // TODO - does this need to be hidden? it doesn't contain any content.
    _d.body.appendChild(ptTestDiv);
    
    var px = parseFloat(_gcs(ptTestDiv).getPropertyValue('font-size')),
        pt = parseFloat(ptTestDiv.style.fontSize);
    //console.log('px1', px, 'pt1', pt);

    var px2ptRatio = px/pt;
    var pt2pxRatio = pt/px;

    _d.body.removeChild(ptTestDiv);
    //console.log('px2ptRatio', px2ptRatio, 'pt2pxRatio', pt2pxRatio);


    // calculate
    var calcd = parseFloat((_px() * pt2pxRatio).toFixed(2));
    //console.log('calcd', calcd);
    _self.value.pt = calcd;
    _self.string.pt = calcd + 'pt';
    return preferString ? _self.string.pt : _self.value.pt;
  }

  function _calc (preferString) {
    _px();
    _em();
    _rem();
    _pt();
    
    // TODO - _calc() needs to return a value.
    //        either the string object or the value
    //        object depending on the value of 
    //        preferString.
  }
  
  Size.prototype.recalc = {
    all: function (r) { return _calc(r); },
    px: function (r) { return _px(r); },
    em: function (r) { return _em(r); },
    rem: function (r) { return _rem(r); },
    pt: function (r) { return _pt(r); }
  };
  
  //console.error('how many times does this run?');
  
  /*
  //
  // maintain a reference to the target element
  // in a getter/setter-accessible property.
  //
  Object.defineProperty(Size.prototype, 'elem', {
    get: function () {
      return _elem;
    },
    set: function (elem) {
      // replace our old elem reference with the new one.
      _elem = elem;
      
      // reset public variables.
      _self.value = {
        px: null,
        pt: null,
        em: null,
        rem: null
      };
      _self.string = {
        px: null,
        pt: null,
        em: null,
        rem: null
      };
      
      // recalculate everything.
      _calc();
      
      // return this for chaining.
      // PROBLEM - chaining doesn't seem to work for 
      //           property setters. funny i never 
      //           tried this before.
      return _self;
    }
  });
  */
  
  // TODO - define this elem property with Object.defineProperty(),
  //        but this time use this function, and make the property
  //        non-enumerable.
  Size.prototype.elem = (function (elem) {
    
    function _get_set_elem (elem) {
      //console.log('getting or setting elem');
      
      // if we received no arguments, then 
      // treat this call as a getter.
      //if (arguments.length === 0) {
      if (elem === undefined) {
        //console.log('getting elem');
        return _elem;
      }

      // if we did receive an argument, 
      // then treat this call as a setter.

      // make pretty sure the argument is a DOM element.
      try {
        if (elem.constructor.toString().search(/HTML.*Element/) === -1) {
          //console.log('argument is not a dom element');
          return false;
        }
      } catch (e) {
        //console.log('exception while investigating dom element');
        return false;
      }

      //
      // if this function is still executing, then 
      // we'll accept the risk of assuming that elem is
      // actually an html element.
      // TODO - accept jquery and other library objects as well.
      //
      //console.log('setting elem');

      // replace our old elem reference with the new one.
      _elem = elem;

      // initialize or reset public variables.
      /*
      self.value = {
        px: null,
        pt: null,
        em: null,
        rem: null
      };
      self.string = {
        px: null,
        pt: null,
        em: null,
        rem: null
      };
      */
      
      // TODO - our value.* and string.* properties need to
      //        be read-only properties. we'll need to use
      //        Object.defineProperty to access private value.*
      //        and string.* variables.
      _self.value = Object.create(null, {
        px:  { writable:true, enumerable: true, value: null },
        pt:  { writable:true, enumerable: true, value: null },
        em:  { writable:true, enumerable: true, value: null },
        rem: { writable:true, enumerable: true, value: null }
      });
      _self.string = Object.create(null, {
        px:  { writable:true, enumerable: true, value: null },
        pt:  { writable:true, enumerable: true, value: null },
        em:  { writable:true, enumerable: true, value: null },
        rem: { writable:true, enumerable: true, value: null }
      });

      // recalculate everything.
      _calc();

      // return this for chaining.
      return _self;
    }
    
    return function (elem) { return _get_set_elem(elem); };
    
  }());
  

  return Size;

}());

/*
var s1 = new Size(document.getElementById('text'));
//s1.elem = document.getElementById('text2');
var s2 = new Size(document.getElementById('text2'));
console.log(s1);
console.log(s2);
*/

/*
var s1 = new Size(document.getElementById('text'));
console.log(s1.value, s1.string);
console.log(s1.elem(document.getElementById('text2')).value);
console.log(s1.value, s1.string);
console.log(s1.elem());
*/


/*************************************************************************

This code was originally "forked" from:
http://jsfiddle.net/davidThomas/nEnNC/2
as mentioned on stackoverflow by David Thomas:
http://stackoverflow.com/a/10306155/1298086

*************************************************************************

For the css2 length units specification, see:
http://www.w3.org/TR/CSS21/syndata.html#length-units

Specifically:
* Relative units:
  * em: the 'font-size' of the relevant font
  * ex: the 'x-height' of the relevant font
* Absolute length units (fixed in relation to each other):
  * in: inches — 1in is equal to 2.54cm.
  * cm: centimeters
  * mm: millimeters
  * pt: points — the points used by CSS are equal to 1/72nd of 1in.
  * pc: picas — 1pc is equal to 12pt.
  * px: pixel units — 1px is equal to 0.75pt.

*************************************************************************

For a probably better getComputedStyle() method (that's 
compatible with older IE clients, see:
http://stackoverflow.com/a/2664055/1298086

*************************************************************************

I haven't tested any of this code in IE, but due to the use of
getComputedStyle(), I don't expect it to work nelow IE v8.

*************************************************************************/
