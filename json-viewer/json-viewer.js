javascript:(
  function (){
    var addClass = function(e, klass) {
      var classes = e.className.split(/\s+/);
      var index = classes.indexOf(klass);
      if (index < 0) {
        classes.push(klass);
        e.className = classes.join(" ");
      }
    };

    var removeClass = function(e, klass) {
      var classes = e.className.split(/\s+/);
      var index = classes.indexOf(klass);
      if (index > -1) {
        classes.splice(index, 1);
        e.className = classes.join(" ");
      }
    };

    var collapsible = function(event) {
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
    };

    var loop = function(obj, callback) {
      if (Array.isArray(obj)) {
        var len = obj.length - 1;
        obj.forEach(function(val, idx) {
          callback(val, idx, idx === len);
        });
        return;
      }
      if (typeof obj === "object") {
        var keys = Object.keys(obj);
        var len = keys.length - 1;
        keys.forEach(function(key, idx) {
          var val = obj[key];
          callback(val, key, idx === len);
        });
        return;
      }
    };

    var create = function(el, props) {
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
        var innerLoop = function(val, key, last) {
          e.inner(callback(val, key, last));
        };
        loop(obj, innerLoop);
        return e;
      };

      if (e.tagName === "DIV") {
        addClass(e, "hoverable");
        e.ondblclick = collapsible.bind(e);
        e.onmouseover = function(ev) { ev.stopPropagation(); addClass(e, "hovered"); };
        e.onmouseout = function(ev) { ev.stopPropagation(); removeClass(e, "hovered"); };
      }

      return e;
    };

    var createArrayElem = function(val, key, last) {
      return create("div")
        .inner(parse(val))
        .addTail(!last);
    };

    var createObjectElem = function(val, key, last) {
      return create("div")
        .inner(parse(key, "key"))
        .inner(":  ")
        .inner(parse(val))
        .addTail(!last);
    };

    var parse = function(obj, klass) {
      if (!klass) var klass = ("type-" + (obj === null ? "null" : typeof obj));
      var span = create("span", {className: klass});

      if (Array.isArray(obj)) {
        span
          .inner("[")
          .loop(obj, createArrayElem)
          .inner("]");
        return span;
      }

      if (typeof obj === "object" && obj !== null) {
        span
          .inner("{")
          .loop(obj, createObjectElem)
          .inner("}");
        return span;
      }

      var text = JSON.stringify(obj);
      if (typeof obj === "string" && obj.match("^https?://")) {
        var alink = create("a", {className: klass, href: obj})
          .inner(text.slice(1, text.length-2));
        span
          .inner('"')
          .inner(alink)
          .inner('"');
      } else {
        span
          .inner(text);
      }

      return span;
    };

    document.head.innerHTML = "                                      " +
    "  <style>                                                       " +
    "    div {                                                       " +
    "      margin-left: 10px;                                        " +
    "    }                                                           " +
    "    .hoverable {                                                " +
    "      transition: background-color .0s ease-out 0s;             " +
    "      -webkit-transition: background-color .0s ease-out 0s;     " +
    "    }                                                           " +
    "    .hovered {                                                  " +
    "      transition-delay: .0s;                                    " +
    "      -webkit-transition-delay: .0s;                            " +
    "      background: #AED6F1;                                      " +
    "    }                                                           " +
    "    .type-boolean {                                             " +
    "      color: red;                                               " +
    "    }                                                           " +
    "    .type-string {                                              " +
    "      color: green;                                             " +
    "    }                                                           " +
    "    .type-number {                                              " +
    "      color: blue;                                              " +
    "    }                                                           " +
    "    .type-null {                                                " +
    "      color: gray;                                              " +
    "    }                                                           " +
    "  </style>                                                      " +
    "";

    window.json = JSON.parse(document.body.innerText);
    var data = create("div").inner(parse(window.json));
    document.body.innerHTML = "";
    document.body.appendChild(data);
  }
)()
