app.gfx.screens.game = new app.gfx.Screen("game", {

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
        icon.style.backgroundPosition = "" + (-32 * this.iconOrder[position]) + "px -32px";
        icon.style.marginTop = "-10px";
        cell.appendChild(icon);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onCellClicked: function onCellClicked(e) {

        var cell = e.currentTarget;
        switch (cell.icon.className) {

            case "icon icon0": cell.icon.className = "icon icon1"; break;
            case "icon icon1": cell.icon.className = "icon icon2"; break;
            case "icon icon2": cell.icon.className = "icon icon3"; break;
            case "icon icon3": cell.icon.className = "icon icon0"; break;
        }
    },

    onunload: function onunload() {
    }
});
