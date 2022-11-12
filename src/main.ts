import * as diagnostics from './diagnostics';
import * as bytecode from './bytecode';
import * as lexer from './lexer';
import * as parser from './parser';
import * as compiler from './compiler';
import * as vm from './vm';

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
        let compiled = compiler.compile(parsed);
        vm.interpret(compiled);
        let ppc = new bytecode.PrettyPrintContext();
        ppc.pretty_print_instrs(compiled);
        document.getElementById('compiledcodeview')!.textContent = ppc.result;
        console.log(compiled);
        console.log(ppc.result);
    }
});
