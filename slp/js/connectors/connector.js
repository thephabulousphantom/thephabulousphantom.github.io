class Connector {

    id = Connector.nextId++;
    
    from = {
        agent: null,
        socket: null
    };

    to = {
        agent: null,
        socket: null
    };

    type = null;
    svg = null;

    constructor(from, to, type) {

        this.from.agent = from;
        this.to.agent = to;

        for (const outputSocket of from.sockets.output) {

            for (const inputSocket of to.sockets.input) {

                if ((type !== undefined && (outputSocket.type == type && inputSocket.type == type))
                    || (outputSocket.type == inputSocket.type)) {

                    this.from.socket = outputSocket;
                    this.to.socket = inputSocket;
                    break;
                }
            }

            if (this.from.socket) {

                break;
            }
        }

        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("id", this.id);
        line.classList.add("uiConnector");
        switch (this.from.socket.type) {
            case "error": line.classList.add("uiConnectorError"); break;
            case "text": line.classList.add("uiConnectorText"); break;
        }
        line.setAttribute("x1", "-1");
        line.setAttribute("y1", "-1");
        line.setAttribute("x2", "-1");
        line.setAttribute("y2", "-1");

        this.svg = line;
    }

    updateUiFrame() {

        const fromClientRect = this.from.socket.svg.getClientRects()[0];
        this.svg.setAttribute("x1", fromClientRect.x + fromClientRect.width / 2);
        this.svg.setAttribute("y1", fromClientRect.y + fromClientRect.height / 2);

        const toClientRect = this.to.socket.svg.getClientRects()[0];
        this.svg.setAttribute("x2", toClientRect.x + toClientRect.width / 2);
        this.svg.setAttribute("y2", toClientRect.y + toClientRect.height / 2);
    }
}

Connector.nextId = 0;

export default Connector;