app.analytics.GoogleAnalyticsCpaDriver=function(){var n=Class.inherit(this,app.analytics.Driver);var i={};i.service=null;i.tracker=null;n.init=function(){i.service=analytics.getService("funkyPhishing");i.tracker=i.service.getTracker("UA-59911956-1")};n.cleanup=function(){};n.onSceneShown=function(n){if(!i.tracker){return}i.tracker.sendAppView(n.id())};n.onLost=function(){};n.onWon=function(){}};