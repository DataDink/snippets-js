(function(undefined) {
	// Extensions
	String.prototype.trim = String.prototype.trim || function() { return this.replace(/^\s+|\s+$/g, ''); }
	
	Object.prototype.toArray = function() { try { return Array.prototype.slice.call(this, 0); } catch (ex) { return [this]; } };
	Object.prototype.mpathGet = function(path) { var m = this; var mp = path.split('.').select(function(v) { return v.trim(); }); while(mp.length > 1) { m = m[mp.shift()]; } return m[mp[0]]; };
	Object.prototype.mpathSet = function(path, value) { var m = this; var mp = path.split('.').select(function(v) { return v.trim(); }); while(mp.length > 1) { m = m[mp.shift()]; } m[mp[0]] = value; };
	Object.prototype.applySettings = function(settings) { for (var m in settings) { this[m] = settings[m]; } };
	Object.prototype.applyConfig = function(config) { for (var m in config) { if (!(m in this)) { this[m] = config[m]; } } };
	Object.prototype.clone = function(deep) { if (this === undefined) { return undefined; } deep = deep && typeof(this) === 'object'; var result = {}; for (var m in this) { result[m] = (deep ? Object.prototype.clone.call(this[m]) : this[m]); } return result; };
	
	Array.prototype.each = function(action) { for (var i = 0; i < this.length; i++) { action(this[i], i); } };
	Array.prototype.remove = function(value) { for (var i = this.length - 1; i >= 0; i--) { if (this[i] === value) { this.splice(i, 1); } }	};
	Array.prototype.select = function(func) { var newitems = new Array(); for (var i = 0; i < this.length; i++) { newitems.push(func(this[i], i)); } return newitems; };
	Array.prototype.where = function(func) { var newitems = new Array(); for (var i = 0; i < this.length; i++) { if (func(this[i])) { newitems.push(this[i]); } } return newitems; };
	Array.prototype.first = function(func) { for (var i = 0; i < this.length; i++) { if (func(this[i])) { return this[i]; } } };
	Array.prototype.last = function(func) { for (var i = this.length - 1; i >= 0; i--) { if (func(this[i])) { return this[i]; } } };
	
	var prefixes = ['', 'webkit', 'khtml', 'moz', 'ms', 'o'];
	Object.prototype.getPrefixMember = function(name) { var t = this; return prefixes.select(function(p) {return p + name;}).first(function(n) { return n in t; }); };
	
	Element.prototype.getStyle = function(name) { return this.style[this.style.getPrefixMember(name)]; };
	Element.prototype.setStyle = function(name, value) { this.style[this.style.getPrefixMember(name)] = value; };
	Element.prototype.append = function(nodes) { var nodeItems = nodes.toArray(); while (nodeItems.length) { this.appendChild(nodeItems.shift()); } }
	Element.prototype.prepend = function(nodes) { var nodeItems = nodes.toArray(); while (nodeItems.length) { this.insertBefore(nodeItems.pop(), this.firstChild); } }
	Element.prototype.clearAll = function() { while (this.firstChild) { this.removeChild(this.firstChild); } };
	
	Math.toRadians = function(degrees) { return degrees * Math.PI / 180; }
	Math.toDegrees = function(radians) { return radians * 180 / Math.PI; }
	Math.magnitude = function(x1, y1, x2, y2) { var x = x2 - x1; var y = y2 - y1; return Math.sqrt(x*x + y*y); }
	Math.direction = function(x1, y1, x2, y2) { var x = x2 - x1; var y = y2 - y1; return Math.toDegrees((Math.atan2(x, -y)) + 450) % 360; }
	Math.plot = function(direction, magnitude) { var rads = Math.toRadians((direction + 630) % 360); return { x: Math.cos(rads) * magnitude, y: Math.sin(rads) * magnitude } }

	// Templates
	function loadTemplate(template, model) {
		if (typeof(template) === 'string') { template = document.querySelector(template); }
		var content = document.importNode(template.content, true);
		var valueContainers = content.querySelectorAll('[data-template-member]');
		for (var i = 0; i < valueContainers.length; i++) {
			var node = valueContainers[i];
			var mpath = node.getAttribute('data-template-member');
			var value = (model.mpathGet(node.getAttribute('data-template-member')) || '').toString();
			node.clear();
			node.appendChild(document.createTextElement(value));
		}
		return content.childNodes.toArray();
	}
	
	Element.prototype.prependTemplate = function(template, model) {
		var content = loadTemplate(template, model), mark = this.firstChild;
		for (var i = 0; i < content.length; i++) { this.insertBefore(content[i], mark); }
	}
	
	Element.prototype.appendTemplate = function(template, model) {
		var content = loadTemplate(template, model);
		for (var i = 0; i < content.length; i++) { this.appendChild(content[i]); }
	}
	
	Element.prototype.setTemplate = function(template, model) {
		var content = loadTemplate(template, model); this.clear();
		for (var i = 0; i < content.length; i++) { this.appendChild(content[i]); }
	}

	// Eventing
	function customEventPolyfill(event, params) { // IE polyfill
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}
	customEventPolyfill.prototype = window.Event.prototype;
	window.CustomEvent = window.CustomEvent || customEventPolyfill;
	
	Element.prototype.triggerEvent = function(event, detail) { // Trigger Event extension
		this.dispatchEvent(new CustomEvent(event, {
			bubbles: true,
			cancelable: true,
			detail: detail
		}));
	}
})();