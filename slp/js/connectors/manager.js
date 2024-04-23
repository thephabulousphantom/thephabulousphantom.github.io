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

    removeFromNode(id) {

        for (var i = 0; i < this.connectors.length; i++) {

            const connector = this.connectors[i];

            if (connector.from.node.properties.id == id
            || connector.to.node.properties.id == id) {

                this.remove(connector.id);
                i--;
                continue;
            }
        }
    }

    hideForNode(id) {

        for (var i = 0; i < this.connectors.length; i++) {

            const connector = this.connectors[i];

            if (connector.from.node.properties.id == id
            || connector.to.node.properties.id == id) {

                connector.hide(connector.id);
                continue;
            }
        }
    }

    showForNode(id) {
        
        for (var i = 0; i < this.connectors.length; i++) {

            const connector = this.connectors[i];

            if (connector.from.node.properties.id == id
            || connector.to.node.properties.id == id) {

                if (connector.from.node.properties.hidden || connector.to.node.properties.hidden) {

                    connector.hide(connector.id);
                }
                else {

                    connector.show(connector.id);
                }
                continue;
            }
        }
    }

    remove(id) {

        for (var i = 0; i < this.connectors.length; i++) {

            const connector = this.connectors[i];
            if (connector.id == id) {

                connector.remove();
                this.connectors.splice(i, 1);
                return connector;
            }
        }
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
                            App.processCommand(`!text ${connector.to.node.properties.id}, "${result.toString().replaceAll("\"", "'").replaceAll(",", ";")}"`);
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