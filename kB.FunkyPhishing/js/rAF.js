(function(){var n=0;var i=["ms","moz","webkit","o"];for(var e=0;e<i.length&&!window.requestAnimationFrame;++e){window.requestAnimationFrame=window[i[e]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[i[e]+"CancelAnimationFrame"]||window[i[e]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(i,e){var a=(new Date).getTime();var o=Math.max(0,16-(a-n));var t=window.setTimeout(function(){i(a+o)},o);n=a+o;return t};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(n){clearTimeout(n)}})();