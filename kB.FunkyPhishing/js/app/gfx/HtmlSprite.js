app.gfx.HtmlSprite=function(n,a,i,e,t,l){var u=Class.inherit(this,app.gfx.Visual,[n,null,1]);var r={};r.animateDelay=1e3/4;r.animateFrames=[];r.animateFrame=0;r.nextFrameTime=null;r.tag=null;u.position.x=i;u.position.y=e;u.size.x=t;u.size.y=l;u.html(a);u.onclick=null;u.onclickAliases=null;u.animation=function(n,a){};u.frame=function(n){return u.base.frame(n)};u.timeToAnimate=function(n){return false};u.animate=function(n){return};u.tag=function(n){if(n!==undefined){r.tag=n}return r.tag};u.cleanup=function(){u.base.cleanup();r=null;u=null}};