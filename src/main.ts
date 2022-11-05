import * as lexer from './lexer';

declare const ace: any;

let editor = ace.edit("codeeditor");

editor.setOption("printMarginColumn", false);

document.getElementById('submitbutton')!.addEventListener('click', function() {
    let inputcodebox: any = document.getElementById('inputcodebox')!;
    let input: string = editor.getValue();

    document.getElementById("codeview")!.textContent = input;

    let lexed = lexer.lex(input);
    console.log(lexed);
});
