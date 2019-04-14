app.gfx.screens.game = new app.gfx.Screen("game", {

    dimensions: null,

    updateLayout: function updateLayout() {

        var gameLayoutStyle = document.getElementById("gameLayoutStyle");
        if (!gameLayoutStyle) {

            return;
        }

        var windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        var columnCount = 1;
        
        var playerCheckBoxes = document.querySelectorAll(".mdl-switch__input");
        var playerCss = "";
        for (var i = 0; i < playerCheckBoxes.length; i++) {

            var checkBox = playerCheckBoxes[i];
            if (checkBox.checked) {

                columnCount++;
            }
            else {

                playerCss += "#gameContainer #content .cell." + checkBox.id.substring("switch-".length, 100) + " { display: none }";
            }
        }        

        var iconSize = Math.floor((windowDimensions.width - (2 * 20)) / columnCount) - 4;

        this.dimensions = {

            tileset: {
                width: iconSize * 21,
                height: iconSize * 2
            },
            icon: {
                width: iconSize,
                height: iconSize,
                width2: iconSize * 2,
                width3: iconSize * 3
            },
            column: {
                standard: Math.floor((windowDimensions.width - (2 * 20)) / columnCount) - 4
            }
        };

        gameLayoutStyle.innerText =
            "#gameContainer #content .row {" +
            "   height: " + this.dimensions.icon.height + "px;" +
            "}" +
            "#gameContainer #content .cell {" +
            "   width: " + this.dimensions.column.standard + "px;" +
            "   height: " + this.dimensions.icon.height + "px;" +
            "}" +
            "#gameContainer #content .cell .icon {" +
            "   width: " + this.dimensions.icon.width + "px;" +
            "   height: " + this.dimensions.icon.height + "px;" +
            "   background-size: " + this.dimensions.tileset.width + "px " + this.dimensions.tileset.height + "px;" +
            "}" +
            "#gameContainer #content .clickable.cell .icon.icon1 {" +
            "   background-position: -" + this.dimensions.icon.width + "px 0px;" +
            "}" +
            "#gameContainer #content .clickable.cell .icon.icon2 {" +
            "   background-position: -" + this.dimensions.icon.width2 + "px 0px;" +
            "}" +
            "#gameContainer #content .clickable.cell .icon.icon3 {" +
            "   background-position: -" + this.dimensions.icon.width3 + "px 0px;" +
            "}" +
            "#gameContainer #content .double.cell {" +
            "   width: " + this.dimensions.column.first + "px;" +
            "}" +   
            playerCss;

        var icons = document.querySelectorAll(".double.cell .icon");
        for (var i = 0; i < icons.length; i++) {

            var icon = icons[i];
            var position = icon.dataset.position | 0;
            icon.style.backgroundPosition = "" + (-this.dimensions.icon.width * this.iconOrder[position]) + "px -" + this.dimensions.icon.width + "px";
        }
    },

    saveState: function () {

        var state = {
            columns: [],
            cells: []
        };

        for (var i = 0; i < this.playerCheckBoxes.length; i++) {

            state.columns.push(this.playerCheckBoxes[i].checked);
        }

        for (var i = 0; i < this.clickableCells.length; i++) {

            state.cells.push(this.clickableCells[i].icon.className);
        }

        localStorage.setItem("gameState", JSON.stringify(state));
    },

    loadState: function() {

        try {

            var state = JSON.parse(localStorage.getItem("gameState"));
            for (var i = 0; i < state.columns.length; i++) {

                if (!this.playerCheckBoxes[i].checked && state.columns[i]) {

                    this.playerCheckBoxes[i].parentElement.MaterialSwitch.on();
                }
                else if (this.playerCheckBoxes[i].checked && !state.columns[i]) {

                    this.playerCheckBoxes[i].parentElement.MaterialSwitch.off();
                }
            }

            for (var i = 0; i < state.cells.length; i++) {

                this.clickableCells[i].icon.className = state.cells[i];
            }
        }
        catch (ex) {
        }
    },

    oninit: function() {

        window.onresize = this.updateLayout.bind(this);
    },

    onload: function onload() {

        this.updateLayout();
        
        this.header = document.getElementById("#gameContainer #header");
        this.mainMenu = document.getElementById("#gameContainer #mainMenu");
        this.dialog = document.querySelector("#gameContainer #content #specialDialog");

        if (!this.dialog.showModal) {

            dialogPolyfill.registerDialog(this.dialog);
        }

        this.dialog.querySelector(".close").addEventListener("click", (function() {

            this.dialog.close();

        }).bind(this));;

        this.playerCheckBoxes = document.querySelectorAll(".mdl-switch__input");
        for (var i = 0; i < this.playerCheckBoxes.length; i++) {

            this.playerCheckBoxes[i].onchange = (function () {

                this.updateLayout();
                this.saveState();

            }).bind(this);
        }

        $("#ClearAllMenuItem").click((function() {

            var state = JSON.parse(localStorage.getItem("gameState"));
            for (var i = 0; i < state.cells.length; i++) {

                state.cells[i] = "icon icon0";
            }
            localStorage.setItem("gameState", JSON.stringify(state));
            this.loadState();            
            this.updateLayout();

            $(".mdl-layout__obfuscator").removeClass("is-visible");
            $(".njuskalo-drawer").removeClass("is-visible");
            
        }).bind(this));

        this.clickableCells = document.querySelectorAll("#gameContainer #content .clickable.cell");
        for (var i = 0; i < this.clickableCells.length; i++) {

            this.makeClickable(this.clickableCells[i]);
        }

        this.iconCells = document.querySelectorAll("#gameContainer #content .double.cell");
        for (var i = 0; i < this.iconCells.length; i++) {

            this.addIcon(this.iconCells[i], i);
        }

        this.loadState();
        this.updateLayout();
    },

    makeClickable: function makeClickable(cell) {

        var icon = document.createElement("div");
        icon.className = "icon icon0";
        cell.appendChild(icon);
        cell.icon = icon;
        app.pointer.onpress(
            cell,
            this.onCellClicked.bind(this),
            this.onCellLongclicked.bind(this, icon, cell)
        );
    },

    iconOrder: [9,10,11,12,13,14,15,16,17,18,19,20,0,1,2,3,4,5,6,7,8],

    addIcon: function addIcon(cell, position) {

        var icon = document.createElement("div");
        icon.className = "icon";
        icon.dataset.position = position;
        icon.style.backgroundPosition = "" + (-this.dimensions.icon.width * this.iconOrder[position]) + "px -" + this.dimensions.icon.width + "px";
        cell.appendChild(icon);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onCellClicked: function onCellClicked(e) {

        var cell = e.currentTarget;
        app.gfx.press(cell,null,0.20);
        switch (cell.icon.className) {

            case "icon icon0": cell.icon.className = "icon icon1"; break;
            case "icon icon1": cell.icon.className = "icon icon2"; break;
            case "icon icon2": cell.icon.className = "icon icon0"; break;
            case "icon icon3": cell.icon.className = "icon icon0"; break;
        }

        this.saveState();
    },

    onCellLongclicked: function(icon, cell) {

        //this.dialog.showModal();
        
        app.gfx.press(cell,null,0.20);

        if (icon.className == "icon icon3") {

            icon.className = "icon icon0";
        }
        else {
            
            icon.className = "icon icon3";
        }
    },

    onunload: function onunload() {
    }
});
