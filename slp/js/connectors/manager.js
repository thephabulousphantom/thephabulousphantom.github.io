import App from "../app.js";
import Connector from "./connector.js";

class ConnectorManager {
    
    connectors = [];

    dom = null;

    constructor() {

    }

    init() {

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.classList.add("uiSvg");
        
        this.dom = svgElement;

        App.dom.appendChild(this.dom);
    }

    add(from, to) {

        if (!this.dom) {

            this.init();
        }

        const connector = new Connector(from, to);
        this.connectors.push(connector);

        this.dom.appendChild(connector.dom);

        return connector;
    }

    updateUiFrame() {

        for (const connector of this.connectors) {

            connector.updateUiFrame();
        }
    }
}

const connectorManager = new ConnectorManager();

export default connectorManager;