var app = new (function App() {

    var me = this;

    this.state = {
        columns: [],
        cells: []
    };

    this.loadState = function loadState() {

        try {

            me.state = JSON.parse(localStorage.getItem("gameState"));
            if (!me.state || !me.state.columns || !me.state.cells) {

                throw "State not initialized."
            }
        }
        catch (ex) {

            me.state = {
                columns: [],
                cells: []
            };
        }

        try {

            var playerCheckBoxes = document.querySelectorAll(".njuskalo-drawer .mdl-navigation .mdl-switch__input");
            for (var i = 0; i < me.state.columns.length; i++) {

                if (typeof(me.state.columns[i].checked) == "undefined") {

                    me.state.columns[i] = {
                        id: playerCheckBoxes[i].id.substring("switch-".length, 100),
                        checked: playerCheckBoxes[i].checked
                    };
                }

                var checked = !!me.state.columns[i].checked;
                if (!playerCheckBoxes[i].checked && checked) {

                    playerCheckBoxes[i].parentElement.MaterialSwitch.on();
                }
                else if (playerCheckBoxes[i].checked && !checked) {

                    playerCheckBoxes[i].parentElement.MaterialSwitch.off();
                }
            }
        }
        catch (ex) {
        }
    }

    this.saveState = function saveState() {

        try {

            me.state.columns = [];

            var playerCheckBoxes = document.querySelectorAll(".njuskalo-drawer .mdl-navigation .mdl-switch__input");
            for (var i = 0; i < playerCheckBoxes.length; i++) {

                var checkBox = playerCheckBoxes[i];

                me.state.columns.push({
                    id: checkBox.id.substring("switch-".length, 100),
                    checked: checkBox.checked
                });
            }

            localStorage.setItem("gameState", JSON.stringify(me.state));
        }
        catch (ex) {
        }
    }

    this.init = function init() {

        var playerCheckBoxes = document.querySelectorAll(".mdl-switch__input");
        for (var i = 0; i < playerCheckBoxes.length; i++) {

            $(playerCheckBoxes[i]).change(function () {

                me.saveState();
            });
        }

        me.loadState();

        $("#GameLink").click(function() {

            app.gfx.screens.game.load();

            $(".mdl-layout__obfuscator").removeClass("is-visible");
            $(".njuskalo-drawer").removeClass("is-visible");
        });

        $("#ClearAllMenuItem").click((function() {

            if (app.state && app.state.cells) {

                for (var i = 0; i < app.state.cells.length; i++) {

                    app.state.cells[i] = "icon icon0";
                }
            }

            this.saveState();
            
            app.gfx.screens.game.load();

            $(".mdl-layout__obfuscator").removeClass("is-visible");
            $(".njuskalo-drawer").removeClass("is-visible");
            
        }).bind(this));

        $("#ManualLink").click(function() {

            app.gfx.screens.manual.load();

            $(".mdl-layout__obfuscator").removeClass("is-visible");
            $(".njuskalo-drawer").removeClass("is-visible");
        });
    }

    this.run = function run() {

        app.utility.init();
        app.gfx.init();
        app.keyboard.init();
        app.pointer.init();
        app.init();
        
        app.gfx.screens.splash.load();
    }

})();

$(document).ready(app.run);
