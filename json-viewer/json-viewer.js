javascript:(
  function (){
    var collapsible = function(event) {
      var div = this.querySelector("div");
      event.stopPropagation();
      if (!div) return;

      this.isHidden = !this.isHidden;
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
      e.inner_text = function(obj) {
        return e.inner(document.createTextNode(obj));
      };
      e.inner = function(obj) {
        e.appendChild(obj);
        return e;
      };
      e.addTail = function(add) {
        if (add) e.inner_text(",");
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
        e.ondblclick = collapsible.bind(e);
        e.onmouseover = function(ev) { ev.stopPropagation(); e.className = "hoverable hovered"; };
        e.onmouseout = function(ev) { ev.stopPropagation(); e.className = "hoverable"; };
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
        .inner_text(":  ")
        .inner(parse(val))
        .addTail(!last);
    };

    var parse = function(obj, klass) {
      if (!klass) var klass = ("type-" + (obj === null ? "null" : typeof obj));
      var span = create("span", {className: klass});

      if (Array.isArray(obj)) {
        span
          .inner_text("[")
          .loop(obj, createArrayElem)
          .inner_text("]");
        return span;
      }

      if (typeof obj === "object" && obj !== null) {
        span
          .inner_text("{")
          .loop(obj, createObjectElem)
          .inner_text("}");
        return span;
      }

      if (typeof obj === "string" && obj.match("^https?://")) {
        var alink = create("a", {className: klass, href: obj})
          .inner_text(obj);
        span
          .inner_text('"')
          .inner(alink)
          .inner_text('"');
      } else {
        span
          .inner_text(JSON.stringify(obj));
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
