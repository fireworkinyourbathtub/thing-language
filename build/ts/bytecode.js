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
exports.pretty_print = void 0;
const diagnostics = __importStar(require("./diagnostics"));
const ast = __importStar(require("./ast"));
function pretty_print(instrs) {
    let indentation = 0;
    let result = '';
    let cur_number = 0;
    let mapping = new Map();
    function blank_line() {
        result += '\n';
    }
    function append(instr, s, sp) {
        let sp_contents = sp.contents;
        let sp_annotation = sp_contents.split('\n').length > 1 ? `${sp_contents.split('\n')[0]}...` : sp_contents;
        append_no_span(instr, `${s}${' '.repeat(40 - s.length)}// ${sp_annotation}`);
    }
    function append_no_span(instr, s) {
        let append = `${' '.repeat(indentation * 4)}${s}\n`;
        if (instr != undefined)
            mapping.set(instr, [result.length, result.length + append.length]);
        result += append;
    }
    function append_marker(instr, s) {
        blank_line();
        append_no_span(instr, s);
    }
    function pp_instrs(instrs) {
        for (let instr of instrs) {
            pp_instr(instr);
        }
    }
    function pp_instr(instr) {
        switch (instr.type) {
            case 'Print': {
                append(instr, `print ${instr.value.pretty_print()};`, instr.span);
                break;
            }
            case 'MakeVar': {
                append(instr, `make_var ${instr.name} = ${instr.value.pretty_print()};`, instr.span);
                break;
            }
            case 'While': {
                append(instr, 'while {', instr.span);
                indent();
                pp_instrs(instr.check_code);
                append_no_span(undefined, `check ${instr.check.pretty_print()}`);
                dedent();
                append_no_span(undefined, '}');
                append_no_span(undefined, '{');
                indent();
                pp_instrs(instr.body_code);
                dedent();
                append_no_span(undefined, '}');
                break;
            }
            case 'If': {
                append(instr, `if ${instr.cond.pretty_print()} {`, instr.span);
                indent();
                pp_instrs(instr.true_branch);
                dedent();
                if (instr.false_branch) {
                    append_no_span(instr, '} else {');
                    indent();
                    pp_instrs(instr.false_branch);
                    dedent();
                    append_no_span(instr, '}');
                }
                else {
                    append_no_span(instr, '}');
                }
                break;
            }
            case 'Return': {
                append(instr, `return ${instr.value.pretty_print()};`, instr.span);
                break;
            }
            case 'StartScope': {
                append(instr, `start_scope;`, instr.span);
                break;
            }
            case 'EndScope': {
                append(instr, `end_scope;`, instr.span);
                break;
            }
            case 'ReadVar': {
                append(instr, `read_var ${instr.name} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }
            case 'MakeFunction': {
                append(instr, `make_function ${instr.name}(${instr.params.join()}) { ... }`, instr.span);
                break;
            }
            case 'Assign': {
                append(instr, `assign ${instr.name} = ${instr.value.pretty_print()};`, instr.span);
                break;
            }
            case 'Call': {
                append(instr, `call ${instr.callee.pretty_print()}(${instr.args.map(a => a.pretty_print()).join()}) -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }
            case 'BinaryOp': {
                let op_name;
                switch (instr.op) {
                    case ast.BinaryOperator.Plus:
                        op_name = 'add';
                        break;
                    case ast.BinaryOperator.Minus:
                        op_name = 'sub';
                        break;
                    case ast.BinaryOperator.Star:
                        op_name = 'mul';
                        break;
                    case ast.BinaryOperator.Slash:
                        op_name = 'div';
                        break;
                    case ast.BinaryOperator.Less:
                        op_name = 'cmp<';
                        break;
                    case ast.BinaryOperator.Greater:
                        op_name = 'cmp>';
                        break;
                    case ast.BinaryOperator.LessEqual:
                        op_name = 'cmp<=';
                        break;
                    case ast.BinaryOperator.EqualEqual:
                        op_name = 'cmp==';
                        break;
                    case ast.BinaryOperator.GreaterEqual:
                        op_name = 'cmp>=';
                        break;
                    case ast.BinaryOperator.BangEqual:
                        op_name = 'cmp!=';
                        break;
                }
                append(instr, `${op_name} ${instr.l.pretty_print()} ${instr.r.pretty_print()} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }
            case 'UnaryOp': {
                let op_name;
                switch (instr.op) {
                    case ast.UnaryOperator.Minus:
                        op_name = 'neg';
                        break;
                    case ast.UnaryOperator.Bang:
                        op_name = 'logic_neg';
                        break;
                }
                append(instr, `${op_name} ${instr.v.pretty_print()} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }
            case 'StmtMarker': {
                append_marker(instr, `// line ${instr.span.start_line}: ${diagnostics.get_line(instr.span.source, instr.span.start_line)}`);
                break;
            }
        }
    }
    function indent() {
        ++indentation;
    }
    function dedent() {
        --indentation;
    }
    pp_instrs(instrs);
    return [result, mapping];
}
exports.pretty_print = pretty_print;
