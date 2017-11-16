var content = {};
var es = {};
var map = [];
var current = 'title', scrollspeed = 10;

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
}

function prevNav() {
	setTimeout(function() {if (content[current].prev != undefined) render(content[current].prev)},1);
}

function nextNav() {
	setTimeout(function() {if (content[current].next != undefined) render(content[current].next)},1);
}

function smoothScroll() {
	scrollBy(0,-scrollspeed);
	scrollspeed*=1.2;
	if (window.pageYOffset == 0) scrollspeed=1;
	else setTimeout(smoothScroll, 30);
}

document.addEventListener('DOMContentLoaded', function() {
	es.c = document.getElementById('main');
	es.m = document.getElementById('sidebar');
	es.t = document.getElementById('topNav');
	es.prev = document.getElementById('leftNav');
	es.next = document.getElementById('rightNav');
	es.t.addEventListener('click', smoothScroll);
	es.prev.addEventListener('click', prevNav);
	es.next.addEventListener('click', nextNav);
	compileMap();
	if (location.hash == '' || content[location.hash.slice(1)] == undefined) render('title');
	else render(location.hash.slice(1));
});