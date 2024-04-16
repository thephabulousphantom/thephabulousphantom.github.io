import App from "../app.js";

class ConnectorSocket {

    node = null;
    direction = null;
    position = 0;
    type = null;
    svg = null;

    constructor(node, direction, position, type) {
    
        this.node = node;
        this.direction = direction;
        this.position = position;
        this.type = type;
    }

    async initUi() {

        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        circle.classList.add("uiSocket");
        switch (this.type) {

            case "error": circle.classList.add("uiConnectorError"); break;
            case "text": circle.classList.add("uiConnectorText"); break;
        }

        circle.setAttribute("cx", "-1");
        circle.setAttribute("cy", "-1");
        circle.setAttribute("r", "0");
        circle.setAttribute("fill", "var(--appColorSecondary)");

        this.svg = circle;
    }

    updateUiFrame() {

        if (!this.svg || !document.body.contains(this.svg)) {

            this.initUi().then((function () {

                App.svg.appendChild(this.svg);
                
            }).bind(this));
            return;
        }
        
        const isMinimised = this.node.dom.classList.contains("uiMinimised");

        const agentClientRect = this.node.dom.querySelector(".nodeTitle").getClientRects()[0];
        const center_r = agentClientRect.height / 2;
        const actual_r = App.size.zoom / 2;

        this.svg.setAttribute("cx", this.direction == "input"
            ? agentClientRect.x + (isMinimised ? 1 : -1) * actual_r
            : agentClientRect.x + agentClientRect.width + (isMinimised ? -1 : 1) * actual_r
        );
        this.svg.setAttribute("cy", agentClientRect.y + center_r + ((isMinimised ? 0 : 2) * App.size.zoom * this.position));
        this.svg.setAttribute("r", actual_r);
    }
}

export default ConnectorSocket;