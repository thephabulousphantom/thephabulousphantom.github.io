app.Command=function(e){var n=this;var o={};o.queued=false;o.code=e;o.time=null;n.code=function(){return o.code};n.time=function(e){if(e!==undefined){o.time=e}return o.time};n.queued=function(e){if(e===undefined){return o.queued}return o.queued=!!e}};app.Command.pools={};app.Command.register=function(e){var n=new app.CommandPool(e);app.Command.pools[n.code()]=n};app.Command.get=function(e,n){return app.Command.pools[e].get(n)};