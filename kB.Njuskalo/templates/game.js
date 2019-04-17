app.gfx.screens.game = new app.gfx.Screen("game", {

    dimensions: null,

    iconOrder: [9,10,11,12,13,14,15,16,17,18,19,20,0,1,2,3,4,5,6,7,8],

    updateView: function updateView() {

        var gameLayoutStyle = document.getElementById("gameLayoutStyle");
        if (!gameLayoutStyle) {

            return;
        }

        var windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        var columnCount = 1;
        var playerCss = "";
        for (var i = 0; i < 6; i++) {

            if ((i >= app.state.columns.length) || app.state.columns[i].checked) {

                columnCount++;
            }
            else {

                playerCss += "#gameContainer #content .cell." + app.state.columns[i].id + " { display: none }";
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

        // Update player icons
        var icons = document.querySelectorAll(".double.cell .icon");
        for (var i = 0; i < icons.length; i++) {

            var icon = icons[i];
            var position = icon.dataset.position | 0;
            icon.style.backgroundPosition = "" + (-this.dimensions.icon.width * this.iconOrder[position]) + "px -" + this.dimensions.icon.width + "px";
        }

        // Update checked icons
        if (this.clickableCells && app.state.cells) {

            for (var i = 0; i < app.state.cells.length; i++) {

                if (this.clickableCells.length > i) {

                    this.clickableCells[i].icon.className = "" + app.state.cells[i];
                }
            }
        }
    },

    onColumnChange: function () {

        this.updateView();
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

        app.gfx.press(cell, null, 0.20);

        if (icon.className == "icon icon3") {

            icon.className = "icon icon0";
        }
        else {
            
            icon.className = "icon icon3";
        }
    },

    clearAllMenuItemHandler: function() {

        this.loadState();
        this.updateView();
    },

    addIcon: function addIcon(cell, position) {

        var icon = document.createElement("div");
        icon.className = "icon";
        icon.dataset.position = position;
        icon.style.backgroundPosition = "" + (-this.dimensions.icon.width * this.iconOrder[position]) + "px -" + this.dimensions.icon.width + "px";
        cell.appendChild(icon);
    },

    saveState: function () {

        app.state.cells = [];
        for (var i = 0; i < this.clickableCells.length; i++) {

            app.state.cells.push(this.clickableCells[i].icon.className);
        }
       
        app.saveState();
    },

    loadState: function() {

        app.loadState();
    },

    oninit: function() {

        window.onresize = this.updateView.bind(this);
    },

    onload: function onload() {

        this.loadState();
        this.updateView();

        this.header = document.getElementById("#gameContainer #header");
        this.mainMenu = document.getElementById("#gameContainer #mainMenu");
        this.playerCheckBoxes = document.querySelectorAll(".mdl-switch__input");

        for (var i = 0; i < this.playerCheckBoxes.length; i++) {

            $(this.playerCheckBoxes[i]).bind("change.gameScreen", this.onColumnChange.bind(this));
        }

        $("#ClearAllMenuItem").bind("click.gameScreen", this.clearAllMenuItemHandler.bind(this));

        this.clickableCells = document.querySelectorAll("#gameContainer #content .clickable.cell");
        for (var i = 0; i < this.clickableCells.length; i++) {

            var cell = this.clickableCells[i];
            var icon = document.createElement("div");
            icon.className = (app.state && app.state.cells && app.state.cells.length > i)
                ? app.state.cells[i]
                : "icon icon0";
            cell.appendChild(icon);
            cell.icon = icon;

            app.pointer.onpress(
                cell,
                this.onCellClicked.bind(this),
                this.onCellLongclicked.bind(this, icon, cell)
            );
        }

        this.iconCells = document.querySelectorAll("#gameContainer #content .double.cell");
        for (var i = 0; i < this.iconCells.length; i++) {

            this.addIcon(this.iconCells[i], i);
        }
    },

    onunload: function onunload() {

        this.playerCheckBoxes = document.querySelectorAll(".mdl-switch__input");
        for (var i = 0; i < this.playerCheckBoxes.length; i++) {

            $(this.playerCheckBoxes[i]).unbind(".gameScreen");
        }

        $("#ClearAllMenuItem").unbind(".gameScreen");
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },
});
