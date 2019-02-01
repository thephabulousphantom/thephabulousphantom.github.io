app.ff.MainMenuScene=function(){var t=Class.inherit(this,app.Scene,["menuScene","img/menuBackground.jpg"]);var o={};o.original={sfxDriver:app.Application.configuration.sfxDriver};o.configurationState="off";o.configureButton=new app.gfx.Sprite("configureButton","img/configureButton.png",3,2450-1630/2,13580-1580/2,1630,1580);o.difficultyButton=new app.gfx.Sprite("difficultyButton","img/difficultyButton.png",4,2450-1630/2,13580-1580/2,1630,1580);o.soundButton=new app.gfx.Sprite("soundButton","img/soundButton.png",2,2450-1630/2,13580-1480/2,1630,1580);o.playButton=new app.gfx.Sprite("playButton","img/playButton.png",1,6e3-3490/2,13640-3460/2,3490,3460);o.quitButton=new app.gfx.Sprite("quitButton","img/quitButton.png",1,9490-1630/2,13620-1580/2,1630,1580);o.baloon=new app.gfx.Text("baloon","img/dialogLeft.png","X",512,85,"ComicBookFont","#444",2450,13580-4e3-3190,3820,3190,550,true,true,550,350,350,950);o.bubbles=[new app.gfx.Sprite("bubble1","img/fish4.png",4,0,0,7960/4*(3/4),1890*(3/4)),new app.gfx.Sprite("bubble2","img/fish4.png",4,0,0,7960/4*(3/4),1890*(3/4))];t.init=function(n,e){t.loading(6+o.bubbles.length,e);t.base.init(n,function(){for(var n=0;n<o.bubbles.length;n++){t.addSprite(o.bubbles[n],t.loaded)}t.addSprite(o.playButton,t.loaded);t.addSprite(o.soundButton,t.loaded);t.addSprite(o.difficultyButton,t.loaded);t.addSprite(o.configureButton,t.loaded);t.addSprite(o.quitButton,t.loaded);t.addSprite(o.baloon,t.loaded);o.baloon.onclick=o.onbaloon;o.playButton.onclick=t.onplay;o.playButton.onclickAliases=["action"];o.difficultyButton.onclick=t.ondifficulty;o.soundButton.onclick=t.onsound;o.configureButton.onclick=t.onconfigure;o.quitButton.onclick=t.onquit;o.bubbles[0].onclick=o.bootclicked;o.bubbles[1].onclick=o.bootclicked;o.playButton.show();o.soundButton.hide();o.configureButton.show();o.quitButton.show();if(app.ff.State.sound()==="off"){o.soundButton.frame(1)}else{o.soundButton.frame(0)}o.difficultyButton.frame(app.ff.State.difficulty());o.moveBubble(o.bubbles[0],Math.random()*4e3);o.bubbles[0].animation([0,1,2],200);o.moveBubble(o.bubbles[1],Math.random()*4e3+6e3);o.bubbles[1].animation([2,0,1],200)})};o.bootclickTimes=0;o.bootclicked=function(){if(++o.bootclickTimes>10){app.ff.State.addScore(500);o.bootclickTimes=0}};o.moveBubble=function(n,e){n.position.x=e=e===undefined?12e3:e;n.position.y=1400;n.show();t.move(n.id(),-n.size.x,1400,e+n.size.x,o.moveBubble)};t.onplay=function(){t.bounce("playButton",-300,200,function(){app.ff.State.mapPosition(0);app.Scene.change(app.ff.MapScene)})};t.onquit=function(){t.bounce("quitButton",-300,200,function(){app.Application.quit()})};t.onscore=function(){app.Scene.change(app.ff.ScoreScene)};t.onconfigure=function(){switch(o.configurationState){case"off":t.bounce(o.configureButton.id(),-300,200,function(){o.configurationState="opening";o.soundButton.show();o.difficultyButton.show();o.configureButton.animation([1,2,0],200/6);t.move(o.difficultyButton.id(),2530-1630/2,13580-1580/2-4e3,200);t.move(o.soundButton.id(),2530-1630/2,13580-1580/2-2e3,200,function(){o.configureButton.frame(0);o.configurationState="on"})});break;case"on":t.bounce(o.configureButton.id(),-300,200,function(){t.abortdelay(o.baloon.hide);o.baloon.hide();o.configurationState="closing";o.configureButton.animation([2,1,0],200/6);t.move(o.difficultyButton.id(),2530-1630/2,13580-1580/2,200);t.move(o.soundButton.id(),2530-1630/2,13580-1580/2,200,function(){o.difficultyButton.hide();o.soundButton.hide();o.configureButton.frame(0);o.configurationState="off"})});break}};o.onbaloon=function(){t.abortdelay(o.baloon.hide);o.baloon.hide()};o.say=function(n,e){t.abortdelay(o.baloon.hide);o.baloon.position.x=n.position.x+n.size.x/2;o.baloon.position.y=n.position.y+n.size.y/2-o.baloon.size.y;if(app.ff.State.level()==3){o.baloon.text(app.data.Strings.get(e,Math.floor(Math.random()*2)+1))}else{o.baloon.text(app.data.Strings.get(e))}o.baloon.show();t.delay(2e3,o.baloon.hide)};t.ondifficulty=function(){if(app.ff.State.level()==3){app.ff.State.difficulty((app.ff.State.difficulty()+1)%(app.ff.State.level()+1))}else{app.ff.State.difficulty(app.ff.State.level()+1)}o.difficultyButton.frame(app.ff.State.difficulty());switch(o.difficultyButton,app.ff.State.difficulty()){case 0:o.say(o.difficultyButton,"whiteBandSelected");break;case 1:o.say(o.difficultyButton,"yellowBandSelected");break;case 2:o.say(o.difficultyButton,"redBandSelected");break;case 3:o.say(o.difficultyButton,"blackBandSelected");break}};t.soundClickedCount=0;t.onsound=function(){if(++t.soundClickedCount==10){t.soundClickedCount=0;app.ff.State.level((app.ff.State.level()+1)%4)}if(o.configurationState!="on"){return}if(app.ff.State.sound()==="off"){app.sfx.Driver.current.mute(false);o.soundButton.frame(0);app.ff.State.sound("on");o.say(o.soundButton,"soundOn")}else{app.sfx.Driver.current.mute(true);o.soundButton.frame(1);app.ff.State.sound("off");o.say(o.soundButton,"soundOff")}};t.processCommand=function(o){var n=t.base.processCommand(o);if(n){return n}switch(o.code()){case"back":t.onquit();break;default:break}};t.updateFrame=function(o){t.base.updateFrame(o)};t.cleanup=function(){t.base.cleanup();o=null;t=null}};