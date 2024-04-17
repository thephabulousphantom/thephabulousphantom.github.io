import App from "../app.js";
import Connector from "./connector.js";
import Node from "../nodes/node.js"

class ConnectorManager {
    
    connectors = [];

    constructor() {

    }

    add(from, to, type) {

        const connector = new Connector(from, to, type);
        this.connectors.push(connector);

        App.svg.appendChild(connector.svg);

        return connector;
    }

    async addFromState(id) {

        const connector = await Connector.fromState(id);
        this.connectors.push(connector);

        App.svg.appendChild(connector.svg);

        return connector;
    }

    onResult(result) {

        if (result.source && result.source instanceof Node) {

            const node = result.source;
            for (const connector of this.connectors) {

                if (connector.from.node == node && connector.from.socket.type == result.value.type) {

                    switch (result.value.type) {

                        case "error":
                        case "text":
                        case "image":
                            App.processCommand(`invoke ${connector.to.node.properties.id}, "${result.toString().replace("\"", "\\\"")}"`);
                            break;
                    }
                }
            }
        }
    }

    updateUiFrame() {

        for (const connector of this.connectors) {

            connector.updateUiFrame();
        }
    }
}

const connectorManager = new ConnectorManager();

export default connectorManager;