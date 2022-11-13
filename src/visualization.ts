import * as bytecode from './bytecode';

export class CallStackFrame {
    elem: HTMLElement;
    code: HTMLElement;
    pp: string;
    mapping: Map<bytecode.Instruction, [number, number]>;

    constructor(instrs: bytecode.Instruction[]) {
        [this.pp, this.mapping] = bytecode.pretty_print(instrs);
        this.elem = document.createElement("div");
        this.elem.className = "callstackframe";

        let pre = document.createElement("pre");
        this.code = document.createElement("code");
        pre.appendChild(this.code);
        this.elem.appendChild(pre);

        let callstack = document.getElementById("callstack")!;
        callstack.insertBefore(this.elem, callstack.firstChild);
    }

    focus_instr(instr: bytecode.Instruction) {
        let [start, end] = this.mapping.get(instr)!;
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
        document.getElementById("callstack")!.removeChild(this.elem);
    }
}
