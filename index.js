const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const formatMessage = require("format-message");
const AdapterBaseClient = require("../scratch3_eim/codelab_adapter_base.js");
const ScratchUIHelper = require("../scratch3_eim/scratch_ui_helper.js");

const FormHelp = {
    en: "help",
    "zh-cn": "帮助",
};

const FormReset = {
    en: "reset",
    "zh-cn": "重置",
};

const Form_whenMessageReceive = {
    en: "when I receive [content]",
    "zh-cn": "当接收到 [content]",
};

const Form_whenAnyMessageReceive = {
    en: "when I receive any message",
    "zh-cn": "当接收到任何消息",
};

const Form_getComingMessage = {
    en: "received message",
    "zh-cn": "收到的消息",
};

const Form_sendMessageAndWait = {
    en: "broadcast [content] and wait",
    "zh-cn": "广播[content]并等待",
};

const Form_set_radio_channel = {
    en: "set radio channel to [content]",
    "zh-cn": "无线设置组[content]",
};

const Form_sendMessage = {
    en: "broadcast [content]",
    "zh-cn": "广播 [content]",
};

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0i5Zu+5bGCXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDAgNDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwIDQwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDojRkZGRkZGO30NCjwvc3R5bGU+DQo8dGl0bGU+5omp5bGV5o+S5Lu26YWN5Zu+6K6+6K6hPC90aXRsZT4NCjxnPg0KCTxnPg0KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjMuMywxMi45bC0xMi41LTAuMWMtNC41LDAtOC4zLDMuNy04LjMsOC4ybDAsMGMwLDQuNSwzLjcsOC4zLDguMiw4LjNsMTIuNSwwLjFjNC41LDAsOC4zLTMuNyw4LjMtOC4ybDAsMA0KCQkJQzMxLjUsMTYuNiwyNy44LDEyLjksMjMuMywxMi45eiBNMjcuOCwyMS4xYzAsMi42LTIuMiw0LjgtNC44LDQuOGwtMTIuMy0wLjFjLTIuNiwwLTQuOC0yLjItNC44LTQuOGwwLDBsMCwwDQoJCQljMC0yLjYsMi4yLTQuOCw0LjgtNC44TDIzLDE2LjNDMjUuNiwxNi4zLDI3LjgsMTguNCwyNy44LDIxLjFMMjcuOCwyMS4xeiIvPg0KCTwvZz4NCjwvZz4NCjxnPg0KCTxnPg0KCQk8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSIxMS43IiBjeT0iMjEuMSIgcj0iMS42Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQoJPGc+DQoJCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjIyLjMiIGN5PSIyMS4xIiByPSIxLjYiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjkuMSwxMC4xYy0wLjUsMC4yLTAuNywwLjUtMC41LDFzMC41LDAuNywxLDAuNWMwLjktMC4zLDEuOCwwLDIuNSwwLjZjMC43LDAuNywwLjgsMS44LDAuMywyLjgNCgkJYy0wLjIsMC41LDAsMC45LDAuMywxLjFjMC4xLDAuMSwwLjMsMC4xLDAuNCwwLjFjMC4xLDAsMC4yLDAsMC4zLTAuMWwwLDBoMC4xYzAuMi0wLjEsMC4yLTAuMSwwLjQtMC40YzAuOS0xLjUsMC43LTMuNS0wLjUtNC44DQoJCUMzMi4zLDEwLjEsMzAuNiw5LjYsMjkuMSwxMC4xeiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zNy4yLDEwLjRjLTAuNS0xLjUtMS41LTIuNy0yLjgtMy4zYy0xLjQtMC42LTIuOC0wLjctNC4yLTAuMmMtMC40LDAuMi0wLjYsMC42LTAuNSwxYzAuMiwwLjQsMC42LDAuNiwxLDAuNQ0KCQljMS0wLjMsMi0wLjIsMywwLjJjMC45LDAuNCwxLjYsMS4zLDEuOSwyLjNjMC40LDEsMC4zLDIuMi0wLjQsMy4zYy0wLjIsMC41LDAsMC45LDAuMywxLjFjMC4yLDAuMSwwLjMsMC4yLDAuNCwwLjINCgkJYzAuMSwwLDAuMSwwLDAuMiwwbDAsMGMwLjItMC4xLDAuMy0wLjIsMC4zLTAuM2MwLDAsMC4xLTAuMSwwLjEtMC4yQzM3LjUsMTMuNywzNy43LDEyLjEsMzcuMiwxMC40eiIvPg0KPC9nPg0KPC9zdmc+DQo=';
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDAgNDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwIDQwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cjx0aXRsZT7mianlsZXmj5Lku7bphY3lm77orr7orqE8L3RpdGxlPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMy43LDEyLjNMOS43LDEyLjJjLTUsMC05LjMsNC4xLTkuMyw5LjFsMCwwYzAsNSw0LjEsOS4zLDkuMSw5LjNsMTMuOSwwLjFjNSwwLDkuMy00LjEsOS4zLTkuMWwwLDAKCQkJQzMyLjgsMTYuNCwyOC43LDEyLjMsMjMuNywxMi4zeiBNMjguNywyMS41YzAsMi45LTIuNSw1LjQtNS40LDUuNEw5LjYsMjYuN2MtMi45LDAtNS40LTIuNS01LjQtNS40bDAsMGwwLDAKCQkJYzAtMi45LDIuNS01LjQsNS40LTUuNGwxMy43LDAuMUMyNi4yLDE2LjEsMjguNywxOC40LDI4LjcsMjEuNUwyOC43LDIxLjV6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIxMC43IiBjeT0iMjEuNSIgcj0iMS44Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIyMi42IiBjeT0iMjEuNSIgcj0iMS44Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8cGF0aCBkPSJNMzAuMiw5LjJjLTAuNiwwLjItMC44LDAuNi0wLjYsMS4xczAuNiwwLjgsMS4xLDAuNmMxLTAuMywyLDAsMi44LDAuN2MwLjgsMC44LDAuOSwyLDAuMywzLjFjLTAuMiwwLjYsMCwxLDAuMywxLjIKCQljMC4xLDAuMSwwLjMsMC4xLDAuNCwwLjFjMC4xLDAsMC4yLDAsMC4zLTAuMWwwLDBoMC4xYzAuMi0wLjEsMC4yLTAuMSwwLjQtMC40YzEtMS43LDAuOC0zLjktMC42LTUuNEMzMy43LDkuMiwzMS44LDguNiwzMC4yLDkuMnoKCQkiLz4KCTxwYXRoIGQ9Ik0zOS4yLDkuNWMtMC42LTEuNy0xLjctMy0zLjEtMy43Yy0xLjYtMC43LTMuMS0wLjgtNC43LTAuMmMtMC40LDAuMi0wLjcsMC43LTAuNiwxLjFjMC4yLDAuNCwwLjcsMC43LDEuMSwwLjYKCQljMS4xLTAuMywyLjItMC4yLDMuMywwLjJjMSwwLjQsMS44LDEuNSwyLjEsMi42YzAuNCwxLjEsMC4zLDIuNS0wLjQsMy43Yy0wLjIsMC42LDAsMSwwLjMsMS4yYzAuMiwwLjEsMC4zLDAuMiwwLjQsMC4yCgkJYzAuMSwwLDAuMSwwLDAuMiwwbDAsMGMwLjItMC4xLDAuMy0wLjIsMC4zLTAuM2MwLDAsMC4xLTAuMSwwLjEtMC4yQzM5LjUsMTMuMiwzOS43LDExLjQsMzkuMiw5LjV6Ii8+CjwvZz4KPC9zdmc+Cg==';

const SCRATCH_EXT_ID = "microbit_radio"; //vm gui 与此一致
const NODE_NAME = `extension_${SCRATCH_EXT_ID}`;
const NODE_ID = `eim/${NODE_NAME}`;
const NODE_MIN_VERSION = "2.0.0"; //node最低版本， 依赖
const HELP_URL = `https://adapter.codelab.club/extension_guide/${SCRATCH_EXT_ID}/`;

class Client {
    onAdapterPluginMessage(msg) {
        this.node_id = msg.message.payload.node_id;
        if (
            this.node_id === this.NODE_ID ||
            this.node_id === "ExtensionManager"
        ) {
            if (msg.message.payload.message_type === "radio_message") {
                this.radio_message = msg.message.payload.content;
                this.adapter_node_content_hat = msg.message.payload.content;
            }
            // todo 响应插件关闭消息， 从terminate关闭，可以自关闭

            this.adapter_node_content_reporter = msg.message.payload.content;
            if (
                this.adapter_node_content_reporter &&
                this.adapter_node_content_reporter.ports
            ) {
                this.ports = this.adapter_node_content_reporter.ports;
            }
        }
    }

    notify_callback(msg) {
        // 使用通知机制直到自己退出
        // todo 重置
        console.log("notify_callback ->", msg);
        if (msg.message === `停止 ${this.NODE_ID}`) {
            this.ScratchUIHelper.reset();
        }
        if (msg.message === `${this.NODE_ID} 已断开`) {
            this.ScratchUIHelper.reset();
        }
        if (msg.message === `正在刷入固件...`) {
            // https://github.com/LLK/scratch-vm/blob/3e65526ed83d6ef769bd33e4b73e87b8e7184c9b/src/engine/runtime.js#L637
            setTimeout(() => {
                this._runtime.emit(
                    this._runtime.constructor.PERIPHERAL_REQUEST_ERROR,
                    {
                        message: `固件已烧录，请重新连接`,
                        extensionId: "microbitRadio",
                    }
                );
                // reject(`timeout(${timeout}ms)`);
            }, 12000);
        }
    }

    constructor(node_id, help_url, runtime, _Blocks) {
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

        let list_timeout = 10000;
        // 生成 UI 类
        this.ScratchUIHelper = new ScratchUIHelper(
            "microbitRadio",
            NODE_NAME,
            NODE_ID,
            NODE_MIN_VERSION,
            runtime,
            this.adapter_base_client,
            list_timeout
        );
    }

    isTargetTopicMessage(targetContent) {
        if (
            // targetContent === "_any"
            (targetContent === this.adapter_node_content_hat ||
                targetContent === "_any") &&
            this.NODE_ID === this.node_id
        ) {
            setTimeout(() => {
                this.adapter_node_content_hat = null; // 每次清空
                this.node_id = null;
            }, 1); //ms
            return true;
        }
    }
}

class microbitRadioBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this._runtime = runtime;
        this._runtime.registerPeripheralExtension("microbitRadio", this); // 主要使用UI runtime
        this.client = new Client(NODE_ID, HELP_URL, runtime, this); // this is microbitRadioBlocks
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */

    scan() {
        return this.client.ScratchUIHelper.scan();
    }
    connect(id) {
        return this.client.ScratchUIHelper.connect(id, 10000);
    }
    disconnect() {
        return this.client.ScratchUIHelper.disconnect();
    }
    reset() {
        return this.client.ScratchUIHelper.reset();
    }
    isConnected() {
        return this.client.ScratchUIHelper.isConnected();
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
                    opcode: "control_extension",
                    blockType: BlockType.COMMAND,
                    text: FormReset[the_locale],
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
            },
        };
    }

    open_help_url(args) {
        window.open(HELP_URL);
    }

    getComingMessage(args) {
        // {"proximity":proximity, "delta":delta} gesture
        let result = this.client.radio_message;
        // 避免未定义
        if (result) {
            return JSON.stringify(result);
        } else {
            return "";
        }
    }

    whenMessageReceive(args) {
        const targetContent = args.content;
        return this.client.isTargetTopicMessage(targetContent);
    }

    whenAnyMessageReceive(args) {
        return this.client.isTargetTopicMessage("_any");
    }

    broadcastMessageAndWait(args) {
        const content = args.content;
        const python_code = `thing.write('${content}\\n')`;
        return this.client.adapter_base_client.emit_with_messageid(
            NODE_ID,
            python_code
        );
    }

    set_radio_channel(args) {
        const content = args.content;
        const python_code = `thing.write('radio_${content}\\n')`;
        return this.client.adapter_base_client.emit_with_messageid(
            NODE_ID,
            python_code
        );
    }

    broadcastMessage(args) {
        const content = args.content;
        const python_code = `thing.write('${content}\\n')`;
        this.client.adapter_base_client.emit_without_messageid(
            NODE_ID,
            python_code
        );
        return;
    }

    control_extension(args) {
        const content = "stop";
        const ext_name = NODE_NAME;
        return this.client.adapter_base_client.emit_with_messageid_for_control(
            NODE_ID,
            content,
            ext_name,
            "extension"
        );
    }
}

module.exports = microbitRadioBlocks;
