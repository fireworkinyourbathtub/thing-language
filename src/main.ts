import * as diagnostics from './diagnostics';
import * as lexer from './lexer';
import * as parser from './parser';
import * as compiler from './compiler';

declare const ace: any;

let editor = ace.edit("codeeditor");

editor.setOption("printMarginColumn", false);

document.getElementById('submitbutton')!.addEventListener('click', function() {
    let inputcodebox: any = document.getElementById('inputcodebox')!;
    let input: string = editor.getValue();
    diagnostics.clear();

    let lexed = lexer.lex(input);
    let parsed = parser.parse(lexed);
    if (parsed) {
        let result = compiler.compile(parsed);
        let s = "";
        for (let instr of result) {
            s += instr.pretty_print();
            s += '\n';
        }
        document.getElementById('compiledcodeview')!.innerHTML = s;
        console.log(result);
    }
});
