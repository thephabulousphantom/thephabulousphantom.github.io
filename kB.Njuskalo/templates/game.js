app.gfx.screens.game = new app.gfx.Screen("game", {

    dimensions: {

        tileset: {
            width: 840,
            height: 80
        },
        icon: {
            width: 40,
            height: 40,
            width2: 80,
            width3: 120
        },
        column: {
            standard: (100 / 7)
        }
    },

    oninit: function() {

        window.onresize = (function onWindowResized() {

            var windowDimensions = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            var iconSize = Math.floor((windowDimensions.width - (2 * 20)) / 7) - 4;

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
                    standard: Math.floor((windowDimensions.width - (2 * 20)) / 7) - 4
                }
            };

            if (app.gfx.screens.current == this) {

                this.reload();
            }

        }).bind(this);

        window.onresize();
    },

    onload: function onload() {

        this.header = document.getElementById("#gameContainer #header");
        this.mainMenu = document.getElementById("#gameContainer #mainMenu");

        this.clickableCells = document.querySelectorAll("#gameContainer #content .clickable.cell");
        for (var i = 0; i < this.clickableCells.length; i++) {

            this.makeClickable(this.clickableCells[i]);
        }

        this.iconCells = document.querySelectorAll("#gameContainer #content .double.cell");
        for (var i = 0; i < this.iconCells.length; i++) {

            this.addIcon(this.iconCells[i], i);
        }
    },

    makeClickable: function makeClickable(cell) {

        var icon = document.createElement("div");
        icon.className = "icon icon0";
        cell.appendChild(icon);
        cell.icon = icon;
        cell.onclick = this.onCellClicked;
    },

    iconOrder: [9,10,11,12,13,14,15,16,17,18,19,20,0,1,2,3,4,5,6,7,8],

    addIcon: function addIcon(cell, position) {

        var icon = document.createElement("div");
        icon.className = "icon";
        icon.style.backgroundPosition = "" + (-this.dimensions.icon.width * this.iconOrder[position]) + "px -" + this.dimensions.icon.width + "px";
        cell.appendChild(icon);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onCellClicked: function onCellClicked(e) {

        var cell = e.currentTarget;
        switch (cell.icon.className) {

            case "icon icon0": cell.icon.className = "icon icon1"; break;
            case "icon icon1": cell.icon.className = "icon icon2"; break;
            case "icon icon2": cell.icon.className = "icon icon0"; break;
            /*case "icon icon3": cell.icon.className = "icon icon0"; break;*/
        }
    },

    onunload: function onunload() {
    }
});
