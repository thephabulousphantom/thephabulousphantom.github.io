app.gfx.screens.game = new app.gfx.Screen("game", {

    onload: function onload() {

        this.header = document.getElementById("#gameContainer #header");
        this.mainMenu = document.getElementById("#gameContainer #mainMenu");

        this.clickableCells = document.querySelectorAll("#gameContainer #content .clickable.cell");
        for (var i = 0; i < this.clickableCells.length; i++) {

            this.makeClickable(this.clickableCells[i]);
        }
    },

    makeClickable: function makeClickable(cell) {

        var icon = document.createElement("div");
        icon.className = "icon icon0";
        cell.appendChild(icon);
        cell.icon = icon;
        app.pointer.onpress(cell, this.onCellClicked);
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
