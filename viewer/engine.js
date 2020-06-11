var content = {};
var map = [];
var root = {_id: '', _children: map, order: Math.Infinity, content: null, name: '[root]'};
var galleries = [];
var documentMap = {};
var current, scrollspeed = 7, currentGallery = 0, currentInGallery = 0, overlayImgs = {};

function compileMap() {
  for (var i in content) {
    var position = createPathIfNotExist(i);
    position.content = content[i];
  }
  
  sortIteration(root);
  castMenuIteration(root, documentMap.menu);
}

function scroll(hash) {
  if (hash) {
    var anchor = document.getElementById(hash);
    if (anchor) {
      setTimeout(function() {window.scrollTo(0, anchor.offsetTop);}, 10);
      return;
    }
  }
  setTimeout(function() {window.scrollTo(0, 0);}, 10);
}

function go(e) {
  e.preventDefault();
  if (!e.target.search) return;
  render(validateURI(e.target));
}

function postProcessing() {
  // clickable headers
  Array.from(documentMap.content.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .forEach(function (item) {
      wrapElement(createElement('a.header-link', {href: '#' + item.id}), item);
    });
    
  // don't reload if the link is local
  // also make outgoing link open in new tab
  Array.from(documentMap.content.querySelectorAll('a'))
    .forEach(function (item) {
      if (item.pathname !== location.pathname) {
        item.target = '_blank';
        return;
      }
      item.addEventListener('click', function (event) {
        event.preventDefault();
        render(validateURI(item));
      });
    });
    
  // spoilers
  Array.from(documentMap.content.querySelectorAll('spoiler'))
    .forEach(function (item, index) {
      var parent = item.parentNode, last;
      parent.insertBefore(createElement('input', {type: 'checkbox', id: '$spoiler_' + (index + 1), style: 'display: none'}), item);
      parent.insertBefore(createElement('label.spoiler-trigger', {for: '$spoiler_' + (index + 1)}, '[' + (index + 1) + ']'), item);
      parent.insertBefore(createElement('span.spoiler-borders', ': ['), item);
      parent.insertBefore(last = createElement('span.spoiler-borders', ']'), item);
      parent.insertBefore(item, last);
    });
}

function render(fullPath, noUrlChange) {
  var path = fullPath.split('#')[0];
  var node = getNode(path);
  if (!node) throw 'Not found ' + path;
  var hash = fullPath.split('#')[1];
  revealNavigation(path);

  if (node.content) {
    current = node;
    documentMap.content.innerHTML = marked(node.content);
    document.title = node.name;
    postProcessing();
    if (!noUrlChange) {
      history.pushState('', '', '?' + path + (hash ? '#' + hash : ''));
    }
    
    if (node._previous) {
      documentMap.prev.href = '?' + node._previous._fullPath;
    } else {
      documentMap.prev.removeAttribute('href');
    }
    if (node._next) {
      documentMap.next.href = '?' + node._next._fullPath;
    } else {
      documentMap.next.removeAttribute('href');
    }
    scroll(hash);
    
    var activeMenuItem = documentMap.menu.getElementsByClassName('active')[0];
    if (activeMenuItem) activeMenuItem.classList.remove('active');
    node._menuNode.classList.add('active');
  }
}

function renderFirst() {
  render(findFirst(root)._fullPath);
}

function castMenuIteration(position, container) {
  position._children.forEach(function (item) {
    var internalContainer;
    container.appendChild(createElement('div.iteration', [
      item._revealer = createElement('input.hidden', {type: 'checkbox', id: '$revealer_' + item._fullPath}),
      item._menuNode = createElement('div.line', [
        createElement('label.revealer', {for: '$revealer_' + item._fullPath, className: item._children.length ? '' : 'hidden'}, [
          createElement('span.revealed', '−'),
          createElement('span.spoilered', '+'),
        ]),
        createElement(!item.content ? 'span' : 'a', {
          href: '?' + item._fullPath,
          events:{'click':function(e) {
            e.preventDefault();
            render(item._fullPath);
          }}
        }, item.name)
      ]),
      internalContainer = createElement('div.iteration-container')
    ]));
    
    castMenuIteration(item, internalContainer);
  });
}


function sortIteration(node) {
  var childrenToSort = node._children.filter(function (item) {
    return !item.order;
  }).sort();
  
  var childrenToInsert = node._children.filter(function (item) {
    return item.order;
  }).sort(function (a, b) {
    return a.order - b.order;
  });
  
  childrenToInsert.forEach(function (item) {
    childrenToSort.splice(item.order - 1, 0, item);
  });
  
  node._children = childrenToSort;
  
  var previous;
  node._children.forEach(function(item) {
    if (previous) {
      item._previous = previous;
      previous._next = item;
    }
    item._parent = node;
    previous = item;
    sortIteration(item);
  });
}

function extractOrdering(pathSegment) {
  var results = /^!(\d+)\s*/.exec(pathSegment);
  if (results) {
    return {
      order: results[1],
      id: pathSegment.slice(results[0].length)
    }
  }
}

function createPathIfNotExist(path) {
  var segments = path.split('/');
  var partPath = [];
  var position = root;
  segments.forEach(function (item) {
    var extracted = extractOrdering(item);
    var order = null;
    if (extracted) {
      item = extracted.id;
      order = extracted.order;
    }
  
    partPath.push(item);
    var node = position._children.find(function (pos) {
      return pos._id === item;
    });
    
    if (!node) {
      node = makePosition(item, partPath.join('/'));
      position._children.push(node);
      node.order = order;
    }
    
    position = node;
  });
  
  return position;
}

function getNode(fullPath) {
  var path = fullPath.split('#')[0];
  var segments = path.split('/');
  var position = root;
  segments.forEach(function (item) {
    var node = position._children.find(function (pos) {
      return pos._id === item;
    });
    
    if (!node) {
      return null;
    }
    
    position = node;
  });
  
  return position;
}

function revealNavigation(path) {
  var segments = path.split('/');
  var position = root;
  segments.forEach(function (item) {
    var node = position._children.find(function (pos) {
      return pos._id === item;
    });
    
    if (!node) {
      return null;
    }
    node._revealer.checked = true;
    
    position = node;
  });
  
  return position;
}

function makePosition(id, fullPath) {
  return {
    content: null,
    name: id,
    order: Math.Infinity,
    
    _id: id,
    _children: [],
    _fullPath: fullPath,
    _parent: null,
    _next: null,
    _previous: null
  };
}

function findFirst(node) {
  if (node.content) return node;
  
  // note: not .forEach, because I need to raise deepest found node, instead of top node which contains found
  for (var i=0; i<node._children.length; i++) {
    var found = findFirst(node._children[i]);
    if (found) {
      return found;
    }
  }
}

function smoothScroll() {
	scrollBy(0,-scrollspeed);
	scrollspeed*=1.2;
	if (window.pageYOffset == 0) scrollspeed=1;
	else setTimeout(smoothScroll, 15);
}

function validateURI(url) {
  return decodeURI(url.search.slice(1)) + decodeURI(url.hash);
}

document.addEventListener('DOMContentLoaded', function() {
	documentMap.content = document.getElementById('main');
	documentMap.menu = document.getElementById('sidebar');
	documentMap.overlay = document.getElementById('overlay');
	documentMap.overlayImg = document.getElementById('overlayImg');
	documentMap.overlayImgPrev = document.getElementById('overlayPrev');
	documentMap.overlayImgNext = document.getElementById('overlayNext');
	documentMap.overlayDescription = documentMap.overlay.getElementsByTagName('span')[0];
	documentMap.top = document.getElementById('topNav');
	documentMap.prev = document.getElementById('leftNav');
	documentMap.next = document.getElementById('rightNav');
	
	documentMap.top.addEventListener('click', smoothScroll);
	documentMap.prev.addEventListener('click', go);
	documentMap.next.addEventListener('click', go);
	/*documentMap.overlay.addEventListener('click', hideOverlay);
	documentMap.overlayImg.addEventListener('click', overlayNextNav);
	documentMap.overlayImgPrev.addEventListener('click', overlayPrevNav);
	documentMap.overlayImgNext.addEventListener('click', overlayNextNav);*/
  
	compileMap();
  
	window.onpopstate = function(event) {
		render(validateURI(location), true);
	};
	if (location.search == '' || !getNode(validateURI(location))) renderFirst();
	else render(validateURI(location));
});