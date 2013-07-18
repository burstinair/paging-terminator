(function (document) {

var each = 
Array.prototype.each =
NodeList.prototype.each =
HTMLCollection.prototype.each =
function (callback) {
    for(var i = 0; i < this.length; ++i) {
        callback(i, this[i]);
    }
};
var indexOf = 
Array.prototype.each =
NodeList.prototype.each =
HTMLCollection.prototype.indexOf =
function (item) {
    for(var i = 0; i < this.length; ++i) {
        if(item === this[i]) {
            return i;
        }
    }
};
var get_wrap_ancient = function (el) {
    var res = el.parentElement;
    while(res.parentElement.children.length == 1) {
        res = res.parentElement;
    }
    return res;
};
var load_document = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4) {
            var el = document.createElement("html");
            el.innerHTML = xhr.responseText;
            var res = document.createDocumentFragment();
            res.appendChild(el);
            callback(res);
        }
    };
    xhr.open("GET", url, false);
    xhr.send();
};
var is_next_btn = function (btn) {
    return btn.tagName.toLowerCase() == 'a' && /^.?下一页.?$/.test(btn.innerText);
};
var get_position = function(el) {
    var res = [];
    var p = el;
    while(p.tagName.toLowerCase() != 'body') {
        res.push(p.parentElement.children.indexOf(p));
        p = el.parentElement;
    }
    var classList = [];
    each.call(el.classList, function (i, c) {
        classList.push(c);
    });
    return {
        tagName: el.tagName,
        classList: classList,
        id: el.id,
        indexes: res.reverse()
    };
};
var get_el = function(position, document, satisfy) {
    var query = position.tagName;
    if(position.classList.length > 0) {
        query += "." + position.classList.join('.');
    }
    if(position.id && position.id != '') {
        query += '#' + position.id;
    }
    each.call(document.querySelectorAll(query), function (i, el) {
        if(el.id == position.id && (!satisfy || satisfy(el))) {
            return el;
        }
    });
    var res = document.querySelector('body');
    for(var i = 0; i < position.length; ++i) {
        res = res.children[position[i]];
        if(res == null) {
            break;
        }
    }
    if(!satisfy || satisfy(res)) {
        return res;
    }
};

var current_context, view_container;
var detect_context = function (document) {
    var res = {};
    if(!current_context) {
        var next_btns = document.querySelectorAll('a');
        each.call(next_btns, function (i, btn) {
            if(is_next_btn(btn)) {
                res.next_btn = btn;
            //    res.next_btn_position = get_position(btn);
                res.pager = get_wrap_ancient(res.next_btn);
            }
        });
    console.log(next_btns.length);
        //var next_document = load_document(res.next_url);
        //next_document
        res.container = document.querySelector(".picture-list").children[0];
        //res.container_position = get_position(res.container);
    } else {
        res.next_btn_position = current_context.next_btn_position;
        res.container_position = current_context.container_position;
        res.next_btn = get_el(res.next_btn_position, document, is_next_btn);
        res.container = get_el(res.container_position, document);
    }
    
    if(res.next_btn == null) {
        return null;
    }
    res.next_url = res.next_btn.attributes['href'].value;
    res.items = res.container.children;
    return res;
};

var merge_view = function (view_container, context) {
    context.items.each(function (i, el) {
        console.log(el);
        view_container.appendChild(el);
    });
};

var load_next_page = function () {
    load_document(current_context.next_url, function (next_doc) {
        current_context = detect_context(next_doc);
        console.log("fin");
        merge_view(view_container, current_context);
    });
};

var SCROLL_TRIG_LIMIT = 100;
var register_scroll_check = function () {
    document.addEventListener('scroll', function () {
        if(document.height - window.screen.availHeight - window.scrollY < SCROLL_TRIG_LIMIT) {
            load_next_page();
        }
    });
};

var enable = function () {
    current_context = detect_context(document);
    if(current_context) {
        view_container = current_context.container;
        current_context.pager.style.display = 'none';
        register_scroll_check();
    }
};
enable();

})(document);