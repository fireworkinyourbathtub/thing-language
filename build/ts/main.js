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
const diagnostics = __importStar(require("./diagnostics"));
const bytecode = __importStar(require("./bytecode"));
const lexer = __importStar(require("./lexer"));
const parser = __importStar(require("./parser"));
const compiler = __importStar(require("./compiler"));
const vm = __importStar(require("./vm"));
let editor = ace.edit("codeeditor");
editor.setOption("printMarginColumn", false);
document.getElementById('submitbutton').addEventListener('click', function () {
    let inputcodebox = document.getElementById('inputcodebox');
    let input = editor.getValue();
    diagnostics.clear();
    let lexed = lexer.lex(input);
    let parsed = parser.parse(lexed);
    if (parsed) {
        let compiled = compiler.compile(parsed);
        vm.interpret(compiled);
        let ppc = new bytecode.PrettyPrintContext();
        ppc.pretty_print_instrs(compiled);
        document.getElementById('compiledcodeview').textContent = ppc.result;
        console.log(compiled);
        console.log(ppc.result);
    }
});
