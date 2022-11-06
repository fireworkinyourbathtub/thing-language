import * as diagnostics from './diagnostics';
import * as lexer from './lexer';
import * as parser from './parser';

declare const ace: any;

let editor = ace.edit("codeeditor");

editor.setOption("printMarginColumn", false);

document.getElementById('submitbutton')!.addEventListener('click', function() {
    let inputcodebox: any = document.getElementById('inputcodebox')!;
    let input: string = editor.getValue();
    diagnostics.clear();
    let result = parser.parse(lexer.lex(input));
    console.log(result);
});
