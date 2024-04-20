import TemplateManager from "../templateManager.js";
import Node from "./node.js";
import ValueText from "../values/text.js";
import ValueEditor from "../values/editor.js";
import ConnectorSocket from "./connectorSocket.js";

class NodeTextFormat extends Node {

    constructor(name, type) {

        super(name, type ?? "TextFormat");

        this.sockets.input.push(new ConnectorSocket(this, "input", this.sockets.input.length, "text"));
        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "text"));

        this.properties.pre = "";
        this.properties.post = "";
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeTextFormat.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("pre");
        this.bindUiElement("post");

        const preInput = this.dom.querySelector(".nodePreInput");
        preInput.addEventListener("mousedown", this.onEditPre.bind(this));
        preInput.addEventListener("touchstart", this.onEditPre.bind(this));

        const postInput = this.dom.querySelector(".nodePostInput");
        postInput.addEventListener("mousedown", this.onEditPost.bind(this));
        postInput.addEventListener("touchstart", this.onEditPost.bind(this));
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    onEditPre() {

        const nameValue = new ValueText(this.properties.pre);
        const valueEditor = new ValueEditor(nameValue, this.updatePre.bind(this));
        valueEditor.initUi();
    }

    updatePre(pre) {

        this.properties.pre = pre;
        this.getPropertyUi("pre").value = pre;
    }

    onEditPost() {

        const nameValue = new ValueText(this.properties.post);
        const valueEditor = new ValueEditor(nameValue, this.updatePost.bind(this));
        valueEditor.initUi();
    }

    updatePost(post) {

        this.properties.post = post;
        this.getPropertyUi("post").value = post;
    }

    async invoke(text) {

        return this.saveResult( new ValueText(
            `${this.properties.pre}${text}${this.properties.post}`,
            this
        ));
    }
}
    
NodeTextFormat.template = await TemplateManager.getTemplate("nodeTextFormat");

export default NodeTextFormat;