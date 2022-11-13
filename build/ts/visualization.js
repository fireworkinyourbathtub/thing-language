"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallStackFrame = void 0;
const bytecode = __importStar(require("./bytecode"));
class CallStackFrame {
    constructor(instrs) {
        [this.pp, this.mapping] = bytecode.pretty_print(instrs);
        this.elem = document.createElement("div");
        this.elem.className = "callstackframe";
        let pre = document.createElement("pre");
        this.code = document.createElement("code");
        pre.appendChild(this.code);
        this.elem.appendChild(pre);
        let callstack = document.getElementById("callstack");
        callstack.insertBefore(this.elem, callstack.firstChild);
    }
    focus_instr(instr) {
        let [start, end] = this.mapping.get(instr);
        let before_text = document.createTextNode(this.pp.substring(0, start));
        let instr_text = document.createTextNode(this.pp.substring(start, end));
        let after_text = document.createTextNode(this.pp.substring(end));
        let instr_span = document.createElement('span');
        instr_span.className = "cur_instruction";
        instr_span.appendChild(instr_text);
        this.code.innerHTML = "";
        this.code.appendChild(before_text);
        this.code.appendChild(instr_span);
        this.code.appendChild(after_text);
    }
    done() {
        document.getElementById("callstack").removeChild(this.elem);
    }
}
exports.CallStackFrame = CallStackFrame;
