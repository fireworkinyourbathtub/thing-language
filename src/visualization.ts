import * as bytecode from './bytecode';
import * as runtime from './runtime';
import * as d3 from 'd3';

const USE_AST = false;

export class CallStackFrame {
    elem: HTMLElement;
    code: HTMLElement;
    focus: HTMLElement;
    pp: string;
    mapping: Map<bytecode.Instruction, [number, number]>;

    constructor(instrs: bytecode.Instruction[]) {
        [this.pp, this.mapping] = bytecode.pretty_print(instrs);
        this.elem = document.createElement("div");
        this.elem.className = "callstackframe";

        {
            let pre = document.createElement("pre");
            this.focus = document.createElement("code");
            pre.appendChild(this.focus);
            this.elem.appendChild(pre);
        }

        this.elem.appendChild(document.createElement('hr'));

        {
            let pre = document.createElement("pre");
            this.code = document.createElement("code");
            pre.appendChild(this.code);
            this.elem.appendChild(pre);
        }

        let callstack = document.getElementById("callstack")!;
        callstack.insertBefore(this.elem, callstack.firstChild);
    }

    focus_instr(instr: bytecode.Instruction) {
        let before_text, highlight_text, after_text;
        if (USE_AST) {
            let src = instr.span.source;
            let [start, end] = [instr.span.start, instr.span.end];
            before_text = document.createTextNode(src.substring(0, start));
            highlight_text = document.createTextNode(src.substring(start, end));
            after_text = document.createTextNode(src.substring(end));
        } else {
            let [start, end] = this.mapping.get(instr)!;
            before_text = document.createTextNode(this.pp.substring(0, start));
            highlight_text = document.createTextNode(this.pp.substring(start, end));
            after_text = document.createTextNode(this.pp.substring(end));
        }

        let instr_span = document.createElement('span');
        instr_span.className = "cur_instruction";
        instr_span.appendChild(highlight_text);

        this.code.innerHTML = "";
        this.code.appendChild(before_text);
        this.code.appendChild(instr_span);
        this.code.appendChild(after_text);

        let instr_text = bytecode.pretty_print([instr])[0];
        this.focus.innerHTML = "";
        this.focus.appendChild(document.createTextNode(instr_text));
    }

    done() {
        document.getElementById("callstack")!.removeChild(this.elem);
    }
}

let objsp = d3.select('#objectspace');

objsp.append('h5').text('registers');
let registers_table = objsp.append('table');
objsp.append('h5').text('variables');
let variables_tables_div = objsp.append('div');

export function current_environment(env: runtime.Environment, registers: runtime.RuntimeValue[]) {
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
        let cur_env: runtime.Environment | null = env;
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
