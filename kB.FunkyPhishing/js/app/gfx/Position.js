app.gfx.Position=function(r,e){this.x=r;this.y=e;var n=this;var t=app.gfx.Driver.current.screenSize.translate.x;var i=app.gfx.Driver.current.screenSize.translate.y;var a=app.gfx.Driver.current.devicePixelRatio();this.setBrowser=function(r,e){n.x=(Math.round(a*r)-t)/app.gfx.Driver.current.screenSize.scale.x;n.y=(Math.round(a*e)-i)/app.gfx.Driver.current.screenSize.scale.y};this.getBrowserX=function(){return Math.round(app.gfx.Driver.current.screenSize.scale.x*n.x+app.gfx.Driver.current.screenSize.translate.x)/a};this.getBrowserY=function(){return Math.round(app.gfx.Driver.current.screenSize.scale.y*n.y+app.gfx.Driver.current.screenSize.translate.y)/a};this.getPhysicalX=function(){return Math.round(app.gfx.Driver.current.screenSize.scale.x*n.x+app.gfx.Driver.current.screenSize.translate.x)};this.getPhysicalY=function(){return Math.round(app.gfx.Driver.current.screenSize.scale.y*n.y+app.gfx.Driver.current.screenSize.translate.y)}};app.gfx.Position.getPhysicalX=function(r){return Math.round(app.gfx.Driver.current.screenSize.scale.x*r+app.gfx.Driver.current.screenSize.translate.x)};app.gfx.Position.getPhysicalY=function(r){return Math.round(app.gfx.Driver.current.screenSize.scale.y*r+app.gfx.Driver.current.screenSize.translate.y)};