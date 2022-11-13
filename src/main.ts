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
    let input: string = editor.getValue();
    diagnostics.clear();

    {
        let printoutput = document.getElementById('printoutput')!;
        while (printoutput.lastChild) {
            printoutput.removeChild(printoutput.lastChild);
        }
    }

    let lexed = lexer.lex(input);
    let parsed = parser.parse(lexed);
    if (parsed) {
        vm.interpret(compiler.compile(parsed));
    }
});
