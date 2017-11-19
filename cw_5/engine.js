var content = {};
var es = {};
var map = [];
var galleries = [];
var current = 'title', scrollspeed = 7, currentGallery = 0, currentInGallery = 0, overlayImgs = {};

function addElem(tag, values, parent) {
	if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) return document.getElementById(values.id);
	var t = document.createElement(tag);
	for (var i in values) if (i!='events' && i!='dataset') t[i] = values[i];
	if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.events != undefined) values.events.forEach(function(v,i,a) {
		t.addEventListener(v.t, v.f);
	});
	
	parent.appendChild(t);
	return t;
}

function InfernoAddElem(tag, values, childs) {
	var t;
	if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) {
		if (document.querySelectorAll(tag+'#'+values.id).length == 0) {
			t = document.getElementById(values.id);
			t.parentNode.removeChild(t);
			t = document.createElement(tag);
		}
		else {
			t = document.getElementById(values.id);
			while (t.firstChild) {
			  t.removeChild(t.firstChild);
			}
		}
	}
	else t = document.createElement(tag);
	
	for (var i in values) if (i!='events' && i!='dataset') t[i] = values[i];
	if (values.dataset != undefined) for (var i in values.dataset) t.dataset[i] = values.dataset[i];
	if (values.events != undefined) values.events.forEach(function(v,i,a) {
		t.addEventListener(v.t, v.f);
	});
	
	if (childs != undefined && childs.length != undefined) childs.forEach(function(c,i,a) {
		t.appendChild(c);
	});
	
	return t;
}

function compileMap() {
	var c = 'title';
	while (c != undefined) {
		var m = content[c];
		addElem('a', {
			innerHTML:m.name,
			classList:'l1',
			href:'?'+m.id+(m.multilevel?'#'+m.first:''),
			id:'id_'+m.id,
			events:[{t:'click',f:function(e) {renderWrapper(e,e.target.href.split('?')[1])}}]
		}, es.m);
		if (!m.multilevel) map.push(m.id);
		else {
			var c2 = m.first;
			var els = [];
			while (c2 != undefined) {
				els.push(InfernoAddElem('a', {
					innerHTML:m.l2[c2].name,
					classList:'l2',
					href:'?'+m.id+'#'+m.l2[c2].id,
					id:'ld_'+m.id+'#'+m.l2[c2].id,
					events:[{t:'click',f:function(e) {renderWrapper(e,e.target.id.slice(3))}}]
				}, []));
				map.push(m.id+'#'+m.l2[c2].id);
				c2 = m.l2[c2].next;
			}
			es.m.appendChild(InfernoAddElem('div', {classList:'l2c'}, els));
		}
		c = m.next;
	}
}

function postProcessor() {
	galleries = [];
	var props = {};
	var metaTags = ['zoomImages', 'combineImages', 'showLabels', 'continueGallery', 'fullGif', 'floatRight', 'applyToNext', 'nativeHTML', 'skipCurrent'];
	var p = es.c.childNodes;
	for (var i=0; i<p.length; i++) {	
		if (p[i].innerHTML == undefined) continue;
		if (p[i].classList.contains('noParse')) continue;
		
		if (!props.applyToNext) {
			props = {};
			metaTags.forEach(function (v) {
				props[v] = (p[i].innerHTML.indexOf('/'+v)>-1);
				p[i].innerHTML = p[i].innerHTML.replace('/'+v, '');
			});
		}
		else props.applyToNext = false;
		
		console.log(i, props);
		
		if (props.skipCurrent) {
			props.skipCurrent = false;
			continue;
		}
		
		var gallery = [];
	
		//Override lt
		if (props.nativeHTML) {
			var s  = p[i].innerHTML.replace(new RegExp('&lt;','g'), '<');
			p[i].innerHTML = s.replace(new RegExp('&gt;','g'), '>');
		}
	
		//image zoom
		if (props.zoomImages) {
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].dataset.gallery = galleries.length;
				im[j].dataset.inGallery = j;
				im[j].dataset.fullGif = props.fullGif;
				im[j].addEventListener('click', function(e){
					currentGallery = parseInt(e.target.dataset.gallery);
					currentInGallery = parseInt(e.target.dataset.inGallery);
					overlay();
				}, false);
				im[j].classList.add('active');
				if (props.continueGallery) galleries[galleries.length-1].push(im[j]);
				else gallery.push(im[j]);
			}
		}
		
		//image fit
		if (props.combineImages) {
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].style.width = 'calc('+100/im.length+'% - 1em)';
				im[j].classList.add('oneLine');
			}
			
			//labels 
			if (props.showLabels) {
				var t = [];
				for (var j=0; j<im.length; j++) {
					t.push(InfernoAddElem('div',{
						img:im[j],
						className:'label'+(props.zoomImages?' active':''),
						style:'width:calc('+100/im.length+'% - 1em)',
						innerHTML:im[j].alt, 
						dataset:im[j].dataset,
						events:(props.zoomImages?
							[{t:'click',f:function(e) {
								currentGallery = parseInt(e.target.dataset.gallery);
								currentInGallery = parseInt(e.target.dataset.inGallery);
								overlay();
							}}]:
							[])
					}));
				}
				es.c.insertBefore(InfernoAddElem('div',{className:'labelsCont noParse'}, t), p[i].nextSibling);
			}
		}
		
		//labels 
		if (props.showLabels && !props.combineImages) {
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				var t = InfernoAddElem('div',{
					img:im[j],
					className:'label'+(props.zoomImages?' active':''),
					style:'width:100%',
					innerHTML:im[j].alt+(props.fullGif?' (анимировано)':''), 
					dataset:im[j].dataset,
					events:(props.zoomImages?
						[{t:'click',f:function(e) {
							currentGallery = parseInt(e.target.dataset.gallery);
							currentInGallery = parseInt(e.target.dataset.inGallery);
							overlay();
						}}]:
						[])
				});
				console.log(t);
				if (j < im.length-1) p[i].insertBefore(InfernoAddElem('div',{className:'labelsCont'}, [t]), im[j].nextSibling);
				else p[i].appendChild(InfernoAddElem('div',{className:'labelsCont'}, [t]));
			}
		}
		
		//float
		if (props.floatRight) {
			p[i].classList.add('fl_r');
		}
		
		//links patching
		var as = p[i].getElementsByTagName('a');
		for (var j=0; j<as.length; j++) {
			if (location.hostname+location.pathname == as[j].hostname+as[j].pathname) {
				as[j].addEventListener('click', function(e) {renderWrapper(e,e.target.href.split('?')[1])});
			}
		}
		
		if (props.zoomImages && !props.continueGallery) galleries.push(gallery);
	}
}

function renderWrapper(e, id) {
	e.preventDefault();
	render(id);
}

function render(id, noUrlChange) {
	var xcont;
	var mult = id.split('#').length>1;
	var n = id.split('#');
	var c = [];
	
	if (content[n[0]].multilevel && n[1] == undefined) {
		id += '#'+content[id].first;
		mult = id.split('#').length>1;
		n = id.split('#');
	}
	current = id;
	for (var i=0; i<es.m.querySelectorAll('.l1').length; i++) {
		var e = es.m.querySelectorAll('.l1')[i];
		if ('id_'+n[0] != e.id) e.classList.remove('active');
		else {
			c[0] = e;
			e.classList.add('active');
		}
	}
	if (mult) {
		xcont = content[n[0]].l2[n[1]];
		for (var i=0; i<es.m.querySelectorAll('.l2').length; i++) {
			var e = es.m.querySelectorAll('.l2')[i];
			if ('ld_'+current != e.id) e.classList.remove('active');
			else {
				c[1] = e;
				e.classList.add('active');
			}
		}
	}
	else {
		for (var i=0; i<es.m.querySelectorAll('.l2').length; i++) {
			var e = es.m.querySelectorAll('.l2')[i];
			e.classList.remove('active');
		}
		xcont = content[current];
	}
	
	scrollTo(0,0);
	es.c.innerHTML = (xcont.markdown?markdown.toHTML(xcont.c):xcont.c);
	
	var x = map.indexOf(id);
	if (map[x-1] != undefined) es.prev.href = '?'+map[x-1];
	else es.prev.removeAttribute('href');
	
	if (map[x+1] != undefined) es.next.href = '?'+map[x+1];
	else es.next.removeAttribute('href');
	
	if (!noUrlChange) history.pushState('', '', '?'+id);
	postProcessor();
}

function hideOverlay(e) {
	if (e.target.id != 'overlay') return;
	es.oi.removeAttribute('src');
	document.body.classList.remove('overlay');
}

function overlay() {
	var img = galleries[currentGallery][currentInGallery];
	es.oi.src = img.src;
	if (JSON.parse(img.dataset.fullGif)) es.oi.src = es.oi.src.replace('.png', '.gif');
	es.od.innerHTML = img.alt;
	overlayImgs.prev = galleries[currentGallery][currentInGallery-1];
	overlayImgs.next = galleries[currentGallery][currentInGallery+1];
	if (overlayImgs.prev != undefined) {
		es.oip.classList.remove('hidden');
		es.oip.src = overlayImgs.prev.src;
	}
	else es.oip.classList.add('hidden');
	if (overlayImgs.next != undefined) {
		es.oin.classList.remove('hidden');
		es.oin.src = overlayImgs.next.src;
	}
	else es.oin.classList.add('hidden');
	document.body.classList.add('overlay');
}

function prevNav(e) {
	e.preventDefault();
	setTimeout(function() {render(e.target.href.split('?')[1])},1);
}

function nextNav(e) {
	e.preventDefault();
	setTimeout(function() {render(e.target.href.split('?')[1])},1);
}

function overlayNextNav() {
	if (overlayImgs.next == undefined) currentInGallery=0;
	else currentInGallery++;
	overlay();
}

function overlayPrevNav() {
	if (overlayImgs.prev == undefined) currentInGallery=galleries[currentGallery].length-1;
	else currentInGallery--;
	overlay();
}

function smoothScroll() {
	scrollBy(0,-scrollspeed);
	scrollspeed*=1.2;
	if (window.pageYOffset == 0) scrollspeed=1;
	else setTimeout(smoothScroll, 15);
}

document.addEventListener('DOMContentLoaded', function() {
	es.c = document.getElementById('main');
	es.m = document.getElementById('sidebar');
	es.o = document.getElementById('overlay');
	es.oi = document.getElementById('overlayImg');
	es.oip = document.getElementById('overlayPrev');
	es.oin = document.getElementById('overlayNext');
	es.od = es.o.getElementsByTagName('span')[0];
	es.t = document.getElementById('topNav');
	es.prev = document.getElementById('leftNav');
	es.next = document.getElementById('rightNav');
	
	es.t.addEventListener('click', smoothScroll);
	es.prev.addEventListener('click', prevNav);
	es.next.addEventListener('click', nextNav);
	es.o.addEventListener('click', hideOverlay);
	es.oi.addEventListener('click', overlayNextNav);
	es.oip.addEventListener('click', overlayPrevNav);
	es.oin.addEventListener('click', overlayNextNav);
	window.onpopstate = function(event) {
		render(location.href.split('?')[1], true);
	};
	compileMap();
	if (location.search == '' || content[location.search.slice(1)] == undefined) render('title');
	else render(location.href.split('?')[1]);
});