app.sfx.MobileHtml5Driver=function(){var e=Class.inherit(this,app.sfx.Driver);var n={};n.sounds={};n.playbacks={};n.onmousedown=null;n.muted=false;e.init=function(){app.sfx.MobileHtml5Driver.audioPool=new function(){var e=Class.inherit(this);var n={};n.pool=[];e.init=function(){for(var o=0;o<app.sfx.MobileHtml5Driver.audioPoolSize;o++){var a={used:false,element:document.createElement("audio"),oncanplayHandler:null,ontimeupdateHandler:null,onendedHandler:null,initializing:true,playbackStartTime:0};a.element.preload="auto";a.element.poolEntry=a;a.element.addEventListener("canplay",app.sfx.MobileHtml5Driver.audioPool.canplayHandler);a.element.addEventListener("timeupdate",app.sfx.MobileHtml5Driver.audioPool.timeupdateHandler);a.element.addEventListener("ended",app.sfx.MobileHtml5Driver.audioPool.endedHandler);var l=app.sfx.Driver.forceAudioMediaType;if(!l){if(!!(audio.canPlayType&&audio.canPlayType("audio/mpeg;").replace(/no/,""))){l=".mp3"}else if(!!(audio.canPlayType&&audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/,""))){l=".ogg"}else{l=".mp3"}}document.body.appendChild(a.element);a.element.src="sfx/silence"+l;a.element.play();n.pool.push(a)}document.removeEventListener("mousedown",e.init,false);document.removeEventListener("touchstart",e.init,false)};document.addEventListener("mousedown",e.init,false);document.addEventListener("touchstart",e.init,false);e.getAudio=function(){for(var e=0;e<app.sfx.MobileHtml5Driver.audioPoolSize;e++){if(!n.pool[e].used){n.pool[e].used=true;return n.pool[e].element}}};e.releaseAudio=function(e){var n=e.poolEntry;e.pause();e.currentTime=0;if(n.onendedHandler){n.onendedHandler();n.onendedHandler=null}n.used=false};e.canplayHandler=function(){if(this.poolEntry.oncanplayHandler){this.poolEntry.oncanplayHandler.call(this);this.poolEntry.oncanplayHandler=null}};e.timeupdateHandler=function(){if(this.poolEntry.initializing){this.pause();this.poolEntry.initializing=false;return}if(this.poolEntry.ontimeupdateHandler){this.poolEntry.ontimeupdateHandler()}};e.endedHandler=function(){this.poolEntry.removeEventListener("canplay",app.sfx.MobileHtml5Driver.audioPool.canplayHandler);this.poolEntry.removeEventListener("timeupdate",app.sfx.MobileHtml5Driver.audioPool.timeupdateHandler);this.poolEntry.removeEventListener("ended",app.sfx.MobileHtml5Driver.audioPool.endedHandler);if(this.poolEntry.onendedHandler){this.poolEntry.onendedHandler();this.poolEntry.onendedHandler=null}}}};e.cleanup=function(){};e.mute=function(e){if(e===undefined){return n.muted}e=!!e;for(playbackId in n.playbacks){n.playbacks[playbackId].audio.volume=e?0:1;n.playbacks[playbackId].audio.muted=e}n.muted=e};e.loadSound=function(e,o){var a=app.sfx.MobileHtml5Driver.audioPool.getAudio();var l=app.sfx.Driver.forceAudioMediaType;if(!l){if(!!(a.canPlayType&&a.canPlayType("audio/mpeg;").replace(/no/,""))){l=".mp3"}else if(!!(a.canPlayType&&a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/,""))){l=".ogg"}else{return false}}var i={sound:e,url:e.url()+l,audio:a,callback:o};n.sounds[e.id()]=i;a.data=i;a.poolEntry.oncanplayHandler=n.oncanplayHandler;a.src=i.url;a.load();return true};n.oncanplayHandler=function(){var e=this.data;e.sound.loaded(true);if(e.callback){e.callback()}};e.removeSound=function(e){if(!n.sounds[e]){return}app.sfx.MobileHtml5Driver.audioPool.releaseAudio(n.sounds[e].audio);n.sounds[e].audio=null;delete n.sounds[e]};e.play=function(e,o,a,l){if(!n.sounds[e]){return null}var i=n.sounds[e].audio;if(!i.paused){i.pause()}i.currentTime=0;if(i.poolEntry.onendedHandler){i.poolEntry.onendedHandler();i.poolEntry.onendedHandler=null}var r={playbackId:app.sfx.MobileHtml5Driver.nextPlaybackId++,soundId:e,audio:i,url:n.sounds[e].url,startTime:null,onstarted:o,onfinished:a,onprogress:l};n.playbacks[r.playbackId]=r;if(r.onstarted){i.poolEntry.oncanplayHandler=r.onstarted}if(r.onprogress){i.poolEntry.ontimeupdateHandler=function(){if(!r.audio.currentTime){return}if(!r.startTime){if(app.sfx.MobileHtml5Driver.resync){r.audio.currentTime=0;r.audio.volume=n.muted?0:1;r.startTime=performance.now()|0}else{r.startTime=performance.now()-r.audio.currentTime*1e3|0}}r.onprogress(performance.now()-r.startTime|0)}}i.poolEntry.onendedHandler=function(){if(r.onfinished){r.onfinished();r.onfinished=null}delete n.playbacks[r.playbackId]};i.volume=l&&app.sfx.MobileHtml5Driver.resync?0:n.muted?0:1;i.muted=n.muted;i.play();return r.playbackId};e.stop=function(e){if(!n.playbacks[e]){return}var o=n.playbacks[e];o.audio.pause();o.audio.currentTime=0;if(o.audio.poolEntry.onendedHandler){o.audio.poolEntry.onendedHandler();o.audio.poolEntry.onendedHandler=null}}};app.sfx.MobileHtml5Driver.nextPlaybackId=0;app.sfx.MobileHtml5Driver.audioPoolSize=4;app.sfx.MobileHtml5Driver.resync=true;