import * as lexer from './lexer';

document.querySelector('form')?.addEventListener('submit', function() {
    let inputcodebox: any = document.getElementById('inputcodebox')!;
    let input: string = inputcodebox.value;

    document.getElementById("codeview")!.textContent = input;

    let lexed = lexer.lex(input);
    console.log(lexed);
});
