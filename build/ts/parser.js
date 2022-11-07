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
exports.parse = void 0;
const ast = __importStar(require("./ast"));
const peg = __importStar(require("./peg"));
function astify_binary_expr([comp, ops]) {
    let cur;
    while (cur = ops.shift()) {
        let [op, right] = cur;
        let op_ast;
        switch (op.type()) {
            case "'+'":
                op_ast = ast.BinaryOperator.Plus;
                break;
            case "'-'":
                op_ast = ast.BinaryOperator.Minus;
                break;
            case "'*'":
                op_ast = ast.BinaryOperator.Star;
                break;
            case "'/'":
                op_ast = ast.BinaryOperator.Slash;
                break;
            case "'<'":
                op_ast = ast.BinaryOperator.Less;
                break;
            case "'='":
                op_ast = ast.BinaryOperator.Equal;
                break;
            case "'>'":
                op_ast = ast.BinaryOperator.Greater;
                break;
            case "'!'":
                op_ast = ast.BinaryOperator.Bang;
                break;
            case "'<='":
                op_ast = ast.BinaryOperator.LessEqual;
                break;
            case "'=='":
                op_ast = ast.BinaryOperator.EqualEqual;
                break;
            case "'>='":
                op_ast = ast.BinaryOperator.GreaterEqual;
                break;
            case "'!='":
                op_ast = ast.BinaryOperator.BangEqual;
                break;
            default: throw Error('unreachable');
        }
        comp = new ast.BinaryExpr(comp, right, op_ast);
    }
    return comp;
}
let block;
let expression;
let expression_indirect = () => expression;
let args = new peg.Indirect(expression_indirect).chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Indirect(expression_indirect))));
let params = new peg.Token("identifier").chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Token("identifier"))));
let fn = new peg.Token("identifier").chain(new peg.Token("'('")).chain(new peg.Optional(params)).chain(new peg.Token("')'")).chain(new peg.Indirect(() => block));
let primary = new peg.Token('bool literal').apply(tok => new ast.Literal(tok.bool)).choice(new peg.Token("'nil'").apply(tok => new ast.Literal(null))).choice(new peg.Token('number literal').apply(tok => new ast.Literal(tok.num))).choice(new peg.Token('string literal').apply(tok => new ast.Literal(tok.str))).choice(new peg.Token("identifier").apply(ident => new ast.VarExpr(ident.name))).choice(new peg.Token("'('").chain(new peg.Indirect(expression_indirect)).chain(new peg.Token("')'")).apply(([[oparen, expr], cparen]) => expr));
let call = primary.chain(new peg.ZeroMore(new peg.Choice(new peg.Token("'('").chain(new peg.Optional(args)).chain(new peg.Token("')'")), new peg.Token("'.'").chain(new peg.Token("identifier")))));
let unary;
unary =
    (new peg.Token("'-'").choice(new peg.Token("'!'"))).chain(new peg.Indirect(() => unary)).apply(([op, expr]) => {
        let op_ast;
        switch (op.type()) {
            case "'-'":
                op_ast = ast.UnaryOperator.Minus;
                break;
            case "'!'":
                op_ast = ast.UnaryOperator.Bang;
                break;
            default: throw Error('unreachable');
        }
        return new ast.UnaryExpr(op_ast, expr);
    })
        .choice(call);
let factor = new peg.Apply(astify_binary_expr, new peg.Chain(unary, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'*'"), new peg.Token("'/'")), unary))));
let term = new peg.Apply(astify_binary_expr, new peg.Chain(factor, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'+'"), new peg.Token("'-'")), factor))));
let comparison = new peg.Apply(astify_binary_expr, new peg.Chain(term, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Token("'<'"), new peg.Token("'<='")), new peg.Token("'>'")), new peg.Token("'>='")), term))));
let equality = new peg.Apply(astify_binary_expr, new peg.Chain(comparison, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'=='"), new peg.Token("'!='")), comparison))));
let logic_and = equality.chain(new peg.ZeroMore(new peg.Token("'and'").chain(equality)));
let logic_or = logic_and.chain(new peg.ZeroMore(new peg.Token("'or'").chain(logic_and)));
let assignment;
assignment =
    new peg.Optional(call.chain(new peg.Token("'.'"))).chain(new peg.Token("identifier")).chain(new peg.Token("'='")).chain(new peg.Indirect(() => assignment))
        .choice(logic_or);
expression = assignment;
let expr_stmt = new peg.Apply(([expr, semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Indirect(expression_indirect), new peg.Token("';'")));
let print_stmt = new peg.Apply(([[print, expr], semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Chain(new peg.Token("'print'"), new peg.Indirect(expression_indirect)), new peg.Token("';'")));
let var_decl;
let statement;
let statement_indirect = () => statement;
let declaration;
let declaration_indirect = () => declaration;
let for_stmt = new peg.Apply(() => (0), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'for'"), new peg.Token("'('")), new peg.Choice(new peg.Choice(new peg.Indirect(() => var_decl), expr_stmt), new peg.Token("';'"))), new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))), new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))), new peg.Token("')'")), new peg.Indirect(statement_indirect)));
let if_stmt = new peg.Apply(() => (0), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'if'"), new peg.Token("'('")), new peg.Indirect(expression_indirect)), new peg.Token("')'")), new peg.Indirect(statement_indirect)), new peg.Optional(new peg.Chain(new peg.Token("'else'"), new peg.Indirect(statement_indirect)))));
let return_stmt = new peg.Apply(() => 0, new peg.Chain(new peg.Chain(new peg.Token("'return'"), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("';'")));
let while_stmt = new peg.Apply(() => (0), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'while'"), new peg.Token("'('")), new peg.Indirect(expression_indirect)), new peg.Token("')'")), new peg.Indirect(statement_indirect)));
block =
    new peg.Apply(([[obrace, decls], cbrace]) => decls, new peg.Chain(new peg.Chain(new peg.Token("'{'"), new peg.ZeroMore(new peg.Indirect(declaration_indirect))), new peg.Token("'}'")));
statement = new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(expr_stmt, print_stmt), for_stmt), if_stmt), return_stmt), while_stmt), block);
var_decl =
    new peg.Apply(([[[var_, ident], m_initializer], semi]) => new ast.VarDecl(ident.name, m_initializer ? m_initializer[1] : null), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'var'"), new peg.Token("identifier")), new peg.Optional(new peg.Chain(new peg.Token("'='"), new peg.Indirect(expression_indirect)))), new peg.Token("';'")));
let fun_decl = new peg.Chain(new peg.Token("'fun'"), fn);
declaration = new peg.Choice(new peg.Choice(fun_decl, var_decl), statement);
let script = new peg.Apply(([stmts, eof]) => stmts, new peg.Chain(new peg.ZeroMore(declaration), new peg.Token("eof")));
function parse([tokens, eof]) {
    let parser = new peg.Parser(tokens, eof);
    let location = new peg.ParseLocation(parser, 0);
    let res = script.parse(parser, location);
    if (res) {
        return res[1];
    }
    else {
        parser.report_error();
        return null;
    }
}
exports.parse = parse;
