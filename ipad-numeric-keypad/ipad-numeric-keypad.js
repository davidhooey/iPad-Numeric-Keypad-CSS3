(function() {

	var focusNode=null;
	var focusScrollBy=0;
	var keypadVisible=false;

	function showIPadNumericKeyboard(evt) {
		var keypad = document.getElementById('ipad-numeric-keypad');
		
		var spacerNodes = document.getElementsByClassName('ipad-numeric-keypad-spacer');
		
		for (var i = 0; i < spacerNodes.length; i ++) {
			var spacerNode = spacerNodes[i];
			spacerNode.style.visibility = 'visible';
			spacerNode.style.height = keypad.offsetHeight + 'px';
		}
		
		if (focusNode) {			
			var top = focusNode.offsetTop;
			var left = focusNode.offsetLeft;
			var height = focusNode.offsetHeight;
			
			var p = focusNode;
			while(p.offsetParent) {
				p = p.offsetParent;
				top += p.offsetTop;
				left += p.offsetLeft;
			}
			
			var bottom = top + height + 20;
			var keypadTop = window.pageYOffset + keypad.offsetTop;
			
			if (bottom > keypadTop) {
				//focusScrollBy = bottom - keypadTop;
				//window.scrollBy(0, focusScrollBy);
			} else {
				focusScrollBy = 0;
			}
			
			//keypad.style.left = (left + (focusNode.offsetWidth - keypad.offsetWidth) / 2) + 'px';
			keypad.style.left = ((window.innerWidth - keypad.offsetWidth) / 2) + 'px';
		}
		
				
		keypad.style.visibility = 'visible';
		
		keypadVisible = true;
	}
	
	function hideIPadNumericKeyboard() {
		var keypad = document.getElementById('ipad-numeric-keypad');
		
		keypad.style.visibility = 'hidden';
		
		var spacerNodes = document.getElementsByClassName('ipad-numeric-keypad-spacer');
		
		for (var i = 0; i < spacerNodes.length; i ++) {
			var spacerNode = spacerNodes[i];
			spacerNode.style.visibility = 'hidden';
			spacerNode.style.height = '0px';
		}
		
		//window.scrollBy(0, -focusScrollBy);
		
		keypadVisible = false;
	}
	
	function onInputFocus(evt) {
		evt.preventDefault();
			
		if (focusNode) {
			focusNode.className = focusNode.className.split(' focused').join('');
			focusNode = null;
		}
				
		focusNode = evt.target;
		
		focusNode.className += ' focused';
		focusNode.blur();
		
		var prevNodes = document.getElementById('ipad-numeric-keypad-specials').getElementsByClassName('prev');
		for (var i = 0; i < prevNodes.length; i++) {
			var prevNode = prevNodes[i];
			if (focusNode.attributes['onPrevV']) {
				prevNode.className = prevNode.className.split(' inactive').join('');
			} else {
				prevNode.className += ' inactive';
			}
		}
		
		var nextNodes = document.getElementById('ipad-numeric-keypad-specials').getElementsByClassName('next');
		for (var i = 0; i < prevNodes.length; i++) {
			var nextNode = nextNodes[i];
			if (focusNode.attributes['onNextV']) {
				nextNode.className = nextNode.className.split(' inactive').join('');
			} else {
				nextNode.className += ' inactive';
			}
		}
		
		showIPadNumericKeyboard();
	}
	
	function onTouchStart(evt) {
		var keypad = document.getElementById('ipad-numeric-keypad');
		if (keypadVisible && evt.target.nodeName.toLowerCase() != 'input' && 
			(evt.pageY < window.pageYOffset + keypad.offsetTop ||
			 evt.pageX < window.pageXOffset + keypad.offsetLeft ||
			 evt.pageX > window.pageXOffset + keypad.offsetLeft + keypad.offsetWidth)) {
			
			hideIPadNumericKeyboard();
			
			if (focusNode) {
				focusNode.className = focusNode.className.split(' focused').join('');
				focusNode = null;
			}
		}
	}
	
	function onOrientationChange(evt) {
		if (keypadVisible) {
			hideIPadNumericKeyboard();
			
			if (focusNode) {
				focusNode.className = focusNode.className.split(' focused').join('');
				focusNode = null;
			}
		}
	}
	
	window.onload = function() {
		
		var inputNodes = document.getElementsByTagName('input');
		var tabIndex = 0;
		
		for (var i = 0; i < inputNodes.length; i++) {
			var n = inputNodes[i];
						
			if(n.attributes['type'].value == 'number') {
				n.setAttribute('readonly', 'true');
				
				n.setAttribute('tabIndex', tabIndex);
				tabIndex++;
				
				n.addEventListener('focus', onInputFocus, false);
			}
		}
		
		var buttonNodes = document.getElementById('ipad-numeric-keypad').getElementsByTagName('button');
		
		for (var n = 0; n < buttonNodes.length; n++) {
			var b = buttonNodes[n];
			
			b.addEventListener('touchstart', function(evt) {
				evt.preventDefault();
			
				var t = evt.target;
				while(t.nodeName.toLowerCase() != 'button' && t.parentNode) {
					t = t.parentNode;
				}
				
				if (t.className.indexOf('backspace') > -1) {
					var v = focusNode.value;
					focusNode.value = v.substr(0, v.length-1);
				} else if (t.className.indexOf('close') > -1) {
					hideIPadNumericKeyboard();
					
					if (focusNode) {
						focusNode.className = focusNode.className.split(' focused').join('');
						focusNode = null;
					}
				} else if (t.className.indexOf('prev') > -1) {
					if (focusNode && focusNode.attributes['onPrevV']) {
						eval(focusNode.attributes['onPrevV'].value);
					}
				} else if (t.className.indexOf('next') > -1) {
					if (focusNode && focusNode.attributes['onNextV']) {
						eval(focusNode.attributes['onNextV'].value);
					}
				} else {
					if (focusNode.value.length < 5) {
						if (focusNode.value == '' || focusNode.value == '0') {
							focusNode.value = t.innerHTML;
						} else {
							focusNode.value += t.innerHTML;
						}
						
						var evt = document.createEvent("HTMLEvents");
						evt.initEvent("input",true,true);
						focusNode.dispatchEvent( evt );
					}
				}
			}, false);
		}		
		
	};
	
	document.ontouchstart = onTouchStart;
	window.onorientationchange = onOrientationChange;
})();