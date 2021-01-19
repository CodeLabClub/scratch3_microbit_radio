const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const formatMessage = require("format-message");
const AdapterBaseClient = require("../scratch3_eim/codelab_adapter_base.js");

const FormHelp = {
    en: "help",
    "zh-cn": "帮助",
};

const Form_update_ports = {
    en: "update ports",
    "zh-cn": "更新串口信息",
};
const Form_connect = {
    en: "connect port [port]",
    "zh-cn": "连接到 [port]",
};

const Form_whenMessageReceive = {
    en: "when I receive [content]",
    "zh-cn": "当接收到 [content]",
};

const Form_control_extension = {
    en: "[turn] [ext_name]",
    "zh-cn": "[turn] [ext_name]",
};

const Form_whenAnyMessageReceive = {
    en: "when I receive any message",
    "zh-cn": "当接收到任何消息",
};

const Form_getComingMessage = {
    en: "received message",
    "zh-cn": "收到的消息",
}

const Form_sendMessageAndWait = {
    en: "broadcast [content] and wait",
    "zh-cn": "广播[content]并等待",
}

const Form_set_radio_channel = {
    en: "set radio channel to [content]",
    "zh-cn": "无线设置组[content]",
}


const Form_sendMessage = {
    en: "broadcast [content]",
    "zh-cn": "广播 [content]",
}

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = require('./icon_block.svg');
const menuIconURI = require('./icon.svg');

const NODE_ID = "eim/extension_microbit_radio";
const HELP_URL = "https://adapter.codelab.club/extension_guide/microbit_radio/";

class Client {
    onAdapterPluginMessage(msg) {
        this.node_id = msg.message.payload.node_id;
        if (
            this.node_id === this.NODE_ID ||
            this.node_id === "ExtensionManager"
        ) {
            // todo 响应插件关闭消息， 从terminate关闭，可以自关闭
            this.adapter_node_content_hat = msg.message.payload.content;
            this.adapter_node_content_reporter = msg.message.payload.content;
            if(this.adapter_node_content_reporter && this.adapter_node_content_reporter.ports){
                this.ports = this.adapter_node_content_reporter.ports;
            }
        }
    }

    notify_callback(msg) {
        // 使用通知机制直到自己退出
        if (msg.message === `${this.NODE_ID} stopped`){
            this._Blocks.reset();
        }
    }


    constructor(node_id, help_url,runtime, _Blocks) {
        this.NODE_ID = node_id;
        this.HELP_URL = help_url;
        this._Blocks = _Blocks;

        this.adapter_base_client = new AdapterBaseClient(
            null, // onConnect,
            null, // onDisconnect,
            null, // onMessage,
            this.onAdapterPluginMessage.bind(this), // onAdapterPluginMessage,
            null, // update_nodes_status,
            null, // node_statu_change_callback,
            this.notify_callback.bind(this), // notify_callback,
            null, // error_message_callback,
            null, // update_adapter_status
            20,
            runtime
        );
    }

    isTargetTopicMessage(targetContent) {
        if (
            // targetContent === "_any"
            (targetContent === this.adapter_node_content_hat || targetContent === "_any") &&
            this.NODE_ID === this.node_id
        ) {
            setTimeout(() => {
                this.adapter_node_content_hat = null; // 每次清空
                this.node_id = null;
            }, 1); //ms
            return true;
        }
    }

    formatPorts() {
        // text value list
        console.log("ports -> ", this.ports);
        if (Array.isArray(this.ports) && this.ports.length) {
            // list
            // window.extensions_statu = this.exts_statu;
            let ports = this.ports.map((x) => ({ text: x, value: x }));
            return ports;
        }
        return [
            {
                text: "",
                value: "",
            },
        ];
    }

}

class microbitRadioBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this._runtime = runtime;
        this.client = new Client(NODE_ID, HELP_URL,runtime, this); // this is microbitRadioBlocks

        this._runtime.registerPeripheralExtension('microbitRadio', this); // 主要使用UI runtime
    }

    start_extension(){
        // todo: disconnect
        const content = 'start';
        const ext_name = 'extension_microbit_radio';
        return this.client.adapter_base_client.emit_with_messageid_for_control(
            NODE_ID,
            content,
            ext_name,
            "extension"
        ).then(() => {
            console.log(`start ${ext_name}`)
            //todo update_ports
        })
    }

    scan() {
        if (!this.client.adapter_base_client.connected) {
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
                message: `Codelab adapter 未连接`,
                extensionId: "microbitRadio"
            });
            return
        }
        let promise = Promise.resolve()

        //  自动打开插件
        promise = promise.then(() => {
            return this.start_extension()
        })


        const code = `microbitHelper.update_ports()`; // 广播 , 收到特定信息更新变量
        promise.then(() => {
            return this.client.adapter_base_client.emit_with_messageid(
                NODE_ID,
                code,
                10000
            )
        }).then(() => {
            let ports = this.client.formatPorts()
            let portsObj = ports
                .filter(port => !!port.value)
                .map(port => ({"name":port.value,"peripheralId": port.value,"rssi":-0}))
                .reduce((prev, curr) => {
                    prev[curr.peripheralId] = curr
                    return prev
                }, {})
            this._runtime.emit(
                this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
                portsObj
            );
        }).catch(e => console.error(e))

        console.log("scan");
    }
    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */

    connect(id) {
        // UI 触发
        console.log(`ready to connect ${id}`);
        if (this.client) {
            const port = id;
            const firmware = "makecode_radio";
            const code = `microbitHelper.connect("${port}","${firmware}")`; // disconnect()

            this.client.adapter_base_client.emit_with_messageid(
                NODE_ID,
                code,
                10000
            ).then((msg) => {
                // console.debug("connect msg->",msg)
                if (msg == "ok"){
                    this.connected = true
                    this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
                };
                if (msg == "flash..."){
                    // https://github.com/LLK/scratch-vm/blob/3e65526ed83d6ef769bd33e4b73e87b8e7184c9b/src/engine/runtime.js#L637
                    setTimeout(() => {
                        this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR,
                            {
                                message: `固件已烧录，请重新连接`,
                                extensionId: "microbitRadio",
                            }
                            );
                        // reject(`timeout(${timeout}ms)`);
                      }, 15000);                };
            })
        }
    }

    disconnect() {
        // todo: disconnect: `microbitHelper.disconnect()`;
        this.reset();

        if (!this.client.adapter_base_client.connected) {
            return
        }

        const code = `microbitHelper.disconnect()`; // disconnect()
        this.client.adapter_base_client.emit_with_messageid(
            NODE_ID,
            code
        ).then((res) => {
            // 这个消息没有 resolve
           console.log(res)
        }).catch(e => console.error(e))
    }

    reset() {
        this.extensionId = "microbitRadio";
        console.log("reset");
        this.connected = false
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
        // 断开
    }

    isConnected() {
        let connected = false;
        if (this.client) {
            connected = this.client.adapter_base_client.connected && this.connected;
        }
        return connected;
    }

    /**
     * The key to load & store a target's test-related state.
     * @type {string}
     */
    static get STATE_KEY() {
        return "Scratch.microbitRadio";
    }

    _setLocale() {
        let now_locale = "";
        switch (formatMessage.setup().locale) {
            case "en":
                now_locale = "en";
                break;
            case "zh-cn":
                now_locale = "zh-cn";
                break;
            default:
                now_locale = "zh-cn";
                break;
        }
        return now_locale;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        let the_locale = this._setLocale();
        return {
            id: "microbitRadio",
            name: "micro:bit radio",
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: "open_help_url",
                    blockType: BlockType.COMMAND,
                    text: FormHelp[the_locale],
                    arguments: {},
                },
                {
                    opcode: "set_radio_channel",
                    blockType: BlockType.COMMAND,
                    text: Form_set_radio_channel[the_locale],
                    arguments: {
                        content: {
                            type: ArgumentType.STRING,
                            defaultValue: "1",
                        },
                    },
                },
                // radio_8
                /*
                {
                    opcode: "control_extension",
                    blockType: BlockType.COMMAND,
                    text: Form_control_extension[the_locale],
                    arguments: {
                        turn: {
                            type: ArgumentType.STRING,
                            defaultValue: "start",
                            menu: "turn",
                        },
                        ext_name: {
                            type: ArgumentType.STRING,
                            defaultValue: "extension_microbit_radio",
                        },
                    },
                },
                {
                    opcode: "update_ports",
                    blockType: BlockType.COMMAND,
                    text: Form_update_ports[the_locale],
                    arguments: {},
                },
                {
                    opcode: "connect_port",
                    blockType: BlockType.COMMAND,
                    text: Form_connect[the_locale],
                    arguments: {
                        port: {
                            type: ArgumentType.STRING,
                            defaultValue: "",
                            menu: "ports",
                        },
                    },
                },
                */
                {
                    opcode: "whenAnyMessageReceive",
                    blockType: BlockType.HAT,
                    text: Form_whenAnyMessageReceive[the_locale],
                    arguments: {},
                },
                {
                    opcode: "whenMessageReceive",
                    blockType: BlockType.HAT,
                    text: Form_whenMessageReceive[the_locale],
                    arguments: {
                        content: {
                            type: ArgumentType.STRING,
                            defaultValue: "a",
                        },
                    },
                },

                {
                    opcode: "getComingMessage",
                    blockType: BlockType.REPORTER, // BOOLEAN, COMMAND
                    text: Form_getComingMessage[the_locale],
                    arguments: {},
                },
                {
                    opcode: "broadcastMessageAndWait",
                    blockType: BlockType.COMMAND,
                    text: Form_sendMessageAndWait[the_locale],
                    arguments: {
                        content: {
                            type: ArgumentType.STRING,
                            defaultValue: "c",
                        },
                    },
                },
                {
                    opcode: "broadcastMessage",
                    blockType: BlockType.COMMAND,
                    text: Form_sendMessage[the_locale],
                    arguments: {
                        content: {
                            type: ArgumentType.STRING,
                            defaultValue: "c",
                        },
                    },
                },
            ],
            menus: {
                turn: {
                    acceptReporters: true,
                    items: ["start", "stop"],
                },
                ports: {
                    acceptReporters: true,
                    items: "_formatPorts",
                },
            },
        };
    }

    _formatPorts() {
        return this.client.formatPorts();
    }

    open_help_url(args) {
        window.open(HELP_URL);
    }



    getComingMessage(args) {
        // {"proximity":proximity, "delta":delta} gesture
        let result = this.client.adapter_node_content_reporter;
        // 避免未定义
        if (result){
            return JSON.stringify(result)
        } else{return ""}
    }

    whenMessageReceive(args) {
        const targetContent = args.content;
        return this.client.isTargetTopicMessage(targetContent);
    }

    whenAnyMessageReceive(args) {
        return this.client.isTargetTopicMessage("_any");
    }

    control_extension(args) {
        const content = args.turn;
        const ext_name = args.ext_name;
        return this.client.adapter_base_client.emit_with_messageid_for_control(
            NODE_ID,
            content,
            ext_name,
            "extension"
        );
    }

    broadcastMessageAndWait(args) {
        const content = args.content;
        const python_code = `microbitHelper.write('${content}\\n')`;
        return this.client.adapter_base_client.emit_with_messageid(NODE_ID, python_code);
    }

    set_radio_channel(args){
        const content = args.content;
        const python_code = `microbitHelper.write('radio_${content}\\n')`;
        return this.client.adapter_base_client.emit_with_messageid(NODE_ID, python_code);
    }

    broadcastMessage(args) {
        const content = args.content;
        const python_code = `microbitHelper.write('${content}\\n')`;
        this.client.adapter_base_client.emit_without_messageid(NODE_ID, python_code);
        return;
    }
    /*
    update_ports(args) {
        const code = `microbitHelper.update_ports()`; // 广播 , 收到特定信息更新变量
        return this.client.adapter_base_client.emit_with_messageid(
            NODE_ID,
            code
        );
    }

    connect_port(args) {
        const port = args.port;
        const code = `microbitHelper.connect("${port}")`;
        return this.client.adapter_base_client.emit_with_messageid(
            NODE_ID,
            code
        );
    }*/

}

module.exports = microbitRadioBlocks;
