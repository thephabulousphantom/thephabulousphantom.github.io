import App from "../app.js";

class ConnectorSocket {

    agent = null;
    direction = null;
    position = 0;
    type = null;
    svg = null;

    constructor(agent, direction, position, type) {
    
        this.agent = agent;
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

        const agentClientRect = this.agent.dom.querySelector(".nodeTitle").getClientRects()[0];
        const center_r = agentClientRect.height / 2;
        const actual_r = App.size.zoom / 2;

        this.svg.setAttribute("cx", this.direction == "input"
            ? agentClientRect.x - center_r
            : agentClientRect.x + agentClientRect.width + center_r
        );
        this.svg.setAttribute("cy", agentClientRect.y + center_r + (2 * App.size.zoom * this.position));
        this.svg.setAttribute("r", actual_r);
    }
}

export default ConnectorSocket;