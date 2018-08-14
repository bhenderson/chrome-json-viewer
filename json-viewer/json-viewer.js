var port = chrome.runtime.connect(), collapsers, options, jsonObject;

function addClass(e, klass) {
  var classes = e.className.split(/\s+/);
  var index = classes.indexOf(klass);
  if (index < 0) {
    classes.push(klass);
    e.className = classes.join(" ");
  }
}

function removeClass(e, klass) {
  var classes = e.className.split(/\s+/);
  var index = classes.indexOf(klass);
  if (index > -1) {
    classes.splice(index, 1);
    e.className = classes.join(" ");
  }
}

function collapsible(event) {
  var div = this.querySelector("div");
  event.stopPropagation();
  if (!div) return;

  this.isHidden = !this.isHidden;
  if (this.isHidden) {
    addClass(this, "hidden");
  } else {
    removeClass(this, "hidden");
  }
  while (div.nodeName === "DIV") {
    div.hidden = this.isHidden;
    div = div.nextSibling;
  }
}

function loop(obj, callback) {
  if (Array.isArray(obj)) {
    var len = obj.length - 1;
    return obj.map(function(val, idx) {
      return callback(val, idx, idx === len);
    });
  }
  if (typeof obj === "object") {
    var keys = Object.keys(obj);
    var len = keys.length - 1;
    return keys.map(function(key, idx) {
      var val = obj[key];
      return callback(val, key, idx === len);
    });
  }
}

function create(el, props) {
  var e = document.createElement(el);
  if (props) {
    Object.keys(props).forEach(function(key) {
      e[key] = props[key];
    });
  }
  e.inner = function(obj) {
    e.append(obj);
    return e;
  };
  e.addTail = function(add) {
    if (add) e.inner(",");
    return e;
  };
  e.loop = function(obj, callback) {
    e.append.apply(e, loop(obj, callback));
    return e;
  };

  if (e.tagName === "DIV") {
    addClass(e, "hoverable");
    e.ondblclick = collapsible.bind(e);
    e.onmouseover = function(ev) { ev.stopPropagation(); addClass(e, "hovered"); };
    e.onmouseout = function(ev) { ev.stopPropagation(); removeClass(e, "hovered"); };
  }

  return e;
}

function createArrayElem(val, key, last) {
  return create("div")
    .inner(parse(val))
    .addTail(!last);
}

function createObjectElem(val, key, last) {
  return create("div")
    .inner(parse(key, "key"))
    .inner(":  ")
    .inner(parse(val))
    .addTail(!last);
}

function length(obj) {
  if (typeof obj === "object" && obj) {
    return Object.keys(obj).length;
  }
  if (typeof obj.length !== "undefined") {
    return obj.length;
  }
}

function tooltip(inner, tip) {
  return create("span", {title: tip}).inner(inner);
}

function parse(obj, klass) {
  if (!klass) klass = ("type-" + (obj === null ? "null" : typeof obj));
  var span = create("span", {className: klass});

  if (Array.isArray(obj)) {
    span
      .inner(tooltip("[", length(obj)))
      .loop(obj, createArrayElem)
      .inner(tooltip("]", length(obj)))
    return span;
  }

  if (typeof obj === "object" && obj !== null) {
    span
      .inner(tooltip("{", length(obj)))
      .loop(obj, createObjectElem)
      .inner(tooltip("}", length(obj)))
    return span;
  }

  var text = JSON.stringify(obj);
  if (typeof obj === "string" && obj.match("^https?://")) {
    var alink = create("a", {className: klass, href: obj})
      .inner(text.slice(1, text.length-1));
    span
      .inner('"')
      .inner(alink)
      .inner('"');
  } else {
    span
      .inner(text);
  }

  return span;
}

function extractData(raw) {
  // w00t!
  var f = raw.charAt(0),
      l = raw.charAt(raw.length-1);
  if ((f == '{' && l == '}') || (f == '[' && l == ']'))
    try { return JSON.parse(raw); } catch (e) { }
}

function init(data) {
  var style = create("link", {
    type: "text/css",
    rel: "stylesheet",
    href: chrome.runtime.getURL("json-viewer.css"),
    media: "all"
  });
  document.head.append(style);
  window.json = data;
  var data = create("div").inner(parse(window.json));
  document.body.innerHTML = "";
  document.body.append(data);
}

function load() {
  var data = extractData(document.body.innerText.trim());
  if (data)
    init(data);
}

load();
