import * as bytecode from './bytecode';
import * as runtime from './runtime';
import * as d3 from 'd3';

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
