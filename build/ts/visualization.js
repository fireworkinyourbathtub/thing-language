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
exports.current_environment = exports.CallStackFrame = void 0;
const bytecode = __importStar(require("./bytecode"));
const d3 = __importStar(require("d3"));
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
let objsp = d3.select('#objectspace');
objsp.append('h5').text('registers');
let registers_table = objsp.append('table');
// registers_table.append('tr')
//     .attr('class', 'headerrow')
//     .selectAll('th')
//     .data(['index', 'value'])
//     .enter()
//     .append('th')
//     .text(i => i);
objsp.append('h5').text('variables');
let variables_tables_div = objsp.append('div');
// variables_table.append('tr')
//     .attr('class', 'headerrow')
//     .selectAll('th')
//     .data(['index', 'value'])
//     .enter()
//     .append('th')
//     .text(i => i);
function current_environment(env, registers) {
    registers_table
        .selectAll('tr:not(.headerrow)').remove();
    {
        let rows = registers_table
            .selectAll('tr:not(.headerrow)')
            .data(registers)
            .enter()
            .append('tr');
        rows.append('td')
            .attr('class', 'key')
            .text((val, i) => `%${i}`);
        rows.append('td')
            .attr('class', 'value')
            .text((val, i) => val.stringify());
    }
    {
        variables_tables_div.selectAll('table').remove();
        let cur_env = env;
        while (cur_env) {
            let rows = variables_tables_div
                .append('table')
                .selectAll('tr')
                .data(cur_env.variables)
                .enter()
                .append('tr');
            rows.append('td')
                .attr('class', 'key')
                .text(([name, val]) => name);
            rows.append('td')
                .attr('class', 'value')
                .text(([name, val]) => val.stringify());
            cur_env = cur_env.parent;
        }
    }
}
exports.current_environment = current_environment;
