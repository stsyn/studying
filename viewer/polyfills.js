Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(r){if(null==this)throw new TypeError('"this" is null or not defined');var t=Object(this),o=t.length>>>0;if("function"!=typeof r)throw new TypeError("predicate must be a function");for(var e=arguments[1],n=0;n<o;){var i=t[n];if(r.call(e,i,n,t))return i;n++}},configurable:!0,writable:!0}),Array.prototype.forEach||(Array.prototype.forEach=function(r,t){var o,e;if(null==this)throw new TypeError(" this is null or not defined");var n=Object(this),i=n.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(o=t),e=0;e<i;){var f;e in n&&(f=n[e],r.call(o,f,e,n)),e++}});Array.from||Object.defineProperty(Array,"from",{value:function(r){return [].map.call(r,function(i){return i})}});