app.CommandQueue=function(){var l=Class.inherit(this);var n={};n.queue=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];n.nextCommand=0;n.lastCommand=0;l.full=function(){return((n.lastCommand+1)%app.CommandQueue.size|0)===n.nextCommand};l.empty=function(){return n.nextCommand==n.lastCommand};l.dequeue=function(){if(n.nextCommand==n.lastCommand){return null}var l=n.queue[n.nextCommand];n.queue[n.nextCommand]=null;n.nextCommand=(n.nextCommand+1)%app.CommandQueue.size|0;l.queued(false);return l};l.enqueue=function(u){if(!u){return null}if(l.full()){throw new app.CommandQueueFullException}n.queue[n.lastCommand]=u;n.lastCommand=(n.lastCommand+1)%app.CommandQueue.size;u.queued(true);return u}};app.CommandQueue.size=64;