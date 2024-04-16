import App from "../app.js";
import Connector from "./connector.js";
import Agent from "../agents/agent.js"

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

        if (result.source && result.source instanceof Agent) {

            const agent = result.source;
            for (const connector of this.connectors) {

                if (connector.from.agent == agent && connector.from.socket.type == result.value.type) {

                    switch (result.value.type) {

                        case "error":
                        case "text":
                            App.processCommand(`agentinvoke ${connector.to.agent.properties.id}, "${result.toString().replace("\"", "\\\"")}"`);
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