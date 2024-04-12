class Connector {

    id = Connector.nextId++;
    
    from = null;
    to = null;
    dom = null;

    constructor(from, to) {

        this.from = from;
        this.to = to;

        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("id", this.id);
        line.setAttribute("x1", "-1");
        line.setAttribute("y1", "-1");
        line.setAttribute("x2", "-1");
        line.setAttribute("y2", "-1");

        this.dom = line;
    }

    updateUiFrame() {

        const fromClientRect = this.from.dom.getClientRects()[0];
        this.dom.setAttribute("x1", fromClientRect.x + fromClientRect.width / 2);
        this.dom.setAttribute("y1", fromClientRect.y + fromClientRect.height);

        const toClientRect = this.to.dom.getClientRects()[0];
        this.dom.setAttribute("x2", toClientRect.x + toClientRect.width / 2);
        this.dom.setAttribute("y2", toClientRect.y);
    }
}

Connector.nextId = 0;

export default Connector;