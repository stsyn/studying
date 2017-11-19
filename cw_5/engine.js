var content = {};
var es = {};
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
		if (m.multilevel) {
			var c2 = m.first;
			while (c2 != undefined) {
				addElem('a', {
					innerHTML:m.l2[c2].name,
					classList:'l2',
					href:'?'+m.id+'#'+m.l2[c2].id,
					id:'ld_'+m.id+'#'+m.l2[c2].id,
					events:[{t:'click',f:function(e) {renderWrapper(e,e.target.id.slice(3))}}]
				}, es.m);
				c2 = m.l2[c2].next;
			}
		}
		c = m.next;
	}
}

function postProcessor() {
	galleries = [];
	var p = es.c.getElementsByTagName('p');
	for (var i=0; i<p.length; i++) {	
		var props = {};
		props.hasZoom = (p[i].innerHTML.indexOf('/zoomImages')>-1);
		p[i].innerHTML = p[i].innerHTML.replace('/zoomImages', '');
		props.combine = (p[i].innerHTML.indexOf('/combineImages')>-1);
		p[i].innerHTML = p[i].innerHTML.replace('/combineImages', '');
		props.labels = (p[i].innerHTML.indexOf('/showLabels')>-1);
		p[i].innerHTML = p[i].innerHTML.replace('/showLabels', '');
		var gallery = [];
	
		//image zoom
		if (props.hasZoom) {
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].dataset.gallery = galleries.length;
				im[j].dataset.inGallery = j;
				im[j].addEventListener('click', function(e){
					currentGallery = parseInt(e.target.dataset.gallery);
					currentInGallery = parseInt(e.target.dataset.inGallery);
					overlay();
				}, false);
				im[j].classList.add('active');
				gallery.push(im[j]);
			}
		}
		
		//image fit
		if (props.combine) {
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].style.width = 'calc('+100/im.length+'% - 1em)';
				im[j].classList.add('oneLine');
			}
			
			//labels 
			if (props.labels) {
				var t = [];
				for (var j=0; j<im.length; j++) {
					t.push(InfernoAddElem('div',{
						img:im[j],
						className:'label'+(props.hasZoom?' active':''),
						style:'width:calc('+100/im.length+'% - 1em)',
						innerHTML:im[j].alt, 
						dataset:im[j].dataset,
						events:(props.hasZoom)?
							[{t:'click',f:function(e) {
								currentGallery = parseInt(e.target.dataset.gallery);
								currentInGallery = parseInt(e.target.dataset.inGallery);
								overlay();
							}}]:
							[]
					}));
				}
				es.c.insertBefore(InfernoAddElem('div',{className:'labelsCont'}, t), p[i].nextSibling);
			}
		}
		
		if (props.hasZoom) galleries.push(gallery);
	}
}

function renderWrapper(e, id) {
	e.preventDefault();
	render(id);
}

function render(id) {
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
	if (mult) {
		if (c[1].previousSibling.href != c[1].href) es.prev.href = c[1].previousSibling.href;
		else if (c[1].previousSibling.previousSibling != null) es.prev.href = c[1].previousSibling.previousSibling.href;
		else es.prev.removeAttribute('href');
	}
	else {
		if (c[0].previousSibling != null) es.prev.href = c[0].previousSibling.href
		else es.prev.removeAttribute('href');
	}
	
	
	if (mult) {
		if (c[1].nextSibling != null) es.next.href = c[1].nextSibling.href;
		else es.next.removeAttribute('href');
	}
	else {
		if (c[0].nextSibling != null) es.next.href = c[0].nextSibling.href;
		else es.next.removeAttribute('href');
	}
	history.pushState('', '', '?'+id);
	postProcessor();
}

function hideOverlay(e) {
	if (e.target.id != 'overlay') return;
	document.body.classList.remove('overlay');
}

function overlay() {
	var img = galleries[currentGallery][currentInGallery];
	es.oi.src = img.src;
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
	compileMap();
	if (location.search == '' || content[location.search.slice(1)] == undefined) render('title');
	else render(location.search.slice(1));
});