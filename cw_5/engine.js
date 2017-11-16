var content = {};
var es = {};
var map = [];
var current = 'title', scrollspeed = 7, overlayImgs = {};

function addElem(tag, values, parent) {
	if (values != undefined && values.id != undefined && document.getElementById(values.id) != undefined) return document.getElementById(values.id);
	var t = document.createElement(tag);
	for (var i in values) if (i!='events') t[i] = values[i];
	if (values.events != undefined) values.events.forEach(function(v,i,a) {
		try {
			t.addEventListener(v.t, v.f);
		}
		catch (e) {
		}
	});
	
	parent.appendChild(t);
	return t;
}

function compileMap() {
	var c = 'title';
	while (c != undefined) {
		map.push({name:content[c].name, id:content[c].id});
		c = content[c].next;
	}
	for (var i=0; i<map.length; i++) {
		addElem('a', {innerHTML:map[i].name, href:'#'+map[i].id, id:'id_'+map[i].id, events:[{t:'click',f:function(e) {render(e.target.id.slice(3))}}]}, es.m);
	}
}

function postProcessor() {
	var p = es.c.getElementsByTagName('p');
	for (var i=0; i<p.length; i++) {
		//image fit
		if (p[i].innerHTML.indexOf('/combineImages')>-1) {
			p[i].innerHTML = p[i].innerHTML.replace('/combineImages', '');
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].style.width = 'calc('+100/im.length+'% - 1em)';
			}
		}
		
		//image zoom
		if (p[i].innerHTML.indexOf('/zoomImages')>-1) {
			p[i].innerHTML = p[i].innerHTML.replace('/zoomImages', '');
			var im = p[i].getElementsByTagName('img');
			for (var j=0; j<im.length; j++) {
				im[j].addEventListener('click', function(e) {overlay(e.target)});
				im[j].classList.add('active');
				if (j>0) im[j].prev = im[j-1];
				else im[j].prev = undefined;
				if (j+1<im.length) im[j].next = im[j+1];
				else im[j].next = undefined;
			}
		}
	}
}

function render(id) {
	scrollTo(0,0);
	current = id;
	for (var i=0; i<map.length; i++) {
		if (current != map[i].id) es.m.childNodes[i].classList.remove('active');
		else es.m.childNodes[i].classList.add('active');
	}
	es.c.innerHTML = (content[current].markdown?markdown.toHTML(content[current].c):content[current].c);
	if (content[current].prev != undefined) es.prev.href = '#'+content[current].prev;
	else es.prev.removeAttribute('href');
	if (content[current].next != undefined) es.next.href = '#'+content[current].next;
	else es.next.removeAttribute('href');
	postProcessor();
}

function hideOverlay() {
	document.body.classList.remove('overlay');
}

function overlay(img) {
	es.oi.src = img.src;
	es.od.innerHTML = img.alt;
	overlayImgs.prev = img.prev;
	overlayImgs.next = img.next;
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

function prevNav() {
	setTimeout(function() {if (content[current].prev != undefined) render(content[current].prev)},1);
}

function nextNav() {
	setTimeout(function() {if (content[current].next != undefined) render(content[current].next)},1);
}

function overlayNextNav() {
	if (overlayImgs.next == undefined) return;
	setTimeout(function() {overlay(overlayImgs.next)},1);
}

function overlayPrevNav() {
	if (overlayImgs.prev == undefined) return;
	setTimeout(function() {overlay(overlayImgs.prev)},1);
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
	es.oip.addEventListener('click', overlayPrevNav);
	es.oin.addEventListener('click', overlayNextNav);
	compileMap();
	if (location.hash == '' || content[location.hash.slice(1)] == undefined) render('title');
	else render(location.hash.slice(1));
});