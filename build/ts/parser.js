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
const lexer = __importStar(require("./lexer"));
const diagnostics = __importStar(require("./diagnostics"));
const ast = __importStar(require("./ast"));
const peg = __importStar(require("./peg"));
function astify_binary_expr([comp, ops]) {
    let cur;
    while (cur = ops.shift()) {
        let [op, right] = cur;
        let op_ast;
        switch (op.type) {
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
        comp = new ast.BinaryExpr(diagnostics.join_spans(comp.span, right.span), comp, right, op_ast);
    }
    return comp;
}
let block;
let expression;
let expression_indirect = () => expression;
let args = new peg.Indirect(expression_indirect).chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Indirect(expression_indirect)))).apply(([first, more]) => [first].concat(more.map(x => x[1])));
let params = new peg.Token("identifier").chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Token("identifier")))).apply(([first, more]) => [first].concat(more.map(x => x[1])));
let fn = new peg.Token("identifier").chain(new peg.Token("'('")).chain(new peg.Optional(params)).chain(new peg.Token("')'")).chain(new peg.Indirect(() => block))
    .apply(([[[[identifier, oparen], params], cparen], block]) => [identifier, params ? params : [], block]);
let primary = new peg.Token('bool literal').apply(tok => new ast.BoolLiteral(tok.span, tok.bool)).choice(new peg.Token("'nil'").apply(tok => new ast.NilLiteral(tok.span))).choice(new peg.Token('number literal').apply(tok => new ast.NumberLiteral(tok.span, tok.num))).choice(new peg.Token('string literal').apply(tok => new ast.StringLiteral(tok.span, tok.str))).choice(new peg.Token("identifier").apply(ident => new ast.VarExpr(ident.span, ident.name))).choice(new peg.Token("'('").chain(new peg.Indirect(expression_indirect)).chain(new peg.Token("')'")).apply(([[oparen, expr], cparen]) => expr));
let call = primary.chain(new peg.ZeroMore(new peg.Choice(new peg.Token("'('").chain(new peg.Optional(args)).chain(new peg.Token("')'")).apply(([[oparen, args], cparen]) => args), new peg.Token("'.'").chain(new peg.Token("identifier")).apply(([dot, ident]) => ident)))).apply(([expr, ops]) => {
    let cur_op;
    while (cur_op = ops.shift()) {
        if (cur_op instanceof lexer.Identifier) {
            let ident = cur_op;
        }
        else {
            let args;
            if (cur_op == null) {
                args = [];
            }
            else {
                args = cur_op[1];
            }
        }
    }
    return expr;
});
let unary;
unary =
    (new peg.Token("'-'").choice(new peg.Token("'!'"))).chain(new peg.Indirect(() => unary)).apply(([op, expr]) => {
        let op_ast;
        switch (op.type) {
            case "'-'":
                op_ast = ast.UnaryOperator.Minus;
                break;
            case "'!'":
                op_ast = ast.UnaryOperator.Bang;
                break;
            default: throw Error('unreachable');
        }
        return new ast.UnaryExpr(diagnostics.join_spans(op.span, expr.span), op_ast, expr);
    })
        .choice(call);
let factor = new peg.Apply(astify_binary_expr, new peg.Chain(unary, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'*'"), new peg.Token("'/'")), unary))));
let term = new peg.Apply(astify_binary_expr, new peg.Chain(factor, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'+'"), new peg.Token("'-'")), factor))));
let comparison = new peg.Apply(astify_binary_expr, new peg.Chain(term, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Token("'<'"), new peg.Token("'<='")), new peg.Token("'>'")), new peg.Token("'>='")), term))));
let equality = new peg.Apply(astify_binary_expr, new peg.Chain(comparison, new peg.ZeroMore(new peg.Chain(new peg.Choice(new peg.Token("'=='"), new peg.Token("'!='")), comparison))));
let logic_and = equality.chain(new peg.ZeroMore(new peg.Token("'and'").chain(equality))).apply(astify_binary_expr);
let logic_or = logic_and.chain(new peg.ZeroMore(new peg.Token("'or'").chain(logic_and))).apply(astify_binary_expr);
let assignment;
assignment =
    new peg.Optional(call.chain(new peg.Token("'.'"))).chain(new peg.Token("identifier")).chain(new peg.Token("'='")).chain(new peg.Indirect(() => assignment))
        .apply(([[[m_call, ident], eq], assignment]) => new ast.AssignExpr(diagnostics.join_spans(ident.span, assignment.span), ident.name, assignment))
        .choice(logic_or);
expression = assignment;
let expr_stmt = new peg.Apply(([expr, semi]) => new ast.ExprStmt(diagnostics.join_spans(expr.span, semi.span), expr), new peg.Chain(new peg.Indirect(expression_indirect), new peg.Token("';'")));
let print_stmt = new peg.Apply(([[print, expr], semi]) => new ast.PrintStmt(diagnostics.join_spans(print.span, semi.span), expr), new peg.Chain(new peg.Chain(new peg.Token("'print'"), new peg.Indirect(expression_indirect)), new peg.Token("';'")));
let var_decl;
let statement;
let statement_indirect = () => statement;
let declaration;
let declaration_indirect = () => declaration;
let for_stmt = new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'for'"), new peg.Token("'('")), new peg.Choice(new peg.Choice(new peg.Indirect(() => var_decl), expr_stmt), new peg.Token("';'").apply(() => null))), new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("')'")), new peg.Indirect(statement_indirect))
    .apply(([[[[[[for_, oparen], initializer], cond], inc], cparen], body]) => {
    return new ast.ForStmt(diagnostics.join_spans(for_.span, body.span), initializer, cond[0], inc, body);
});
let if_stmt = new peg.Apply(([[[[[if_, oparen], cond], cparen], body], m_else]) => new ast.IfStmt(diagnostics.join_spans(if_.span, m_else ? m_else[1].span : body.span), cond, body, m_else ? m_else[1] : null), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'if'"), new peg.Token("'('")), new peg.Indirect(expression_indirect)), new peg.Token("')'")), new peg.Indirect(statement_indirect)), new peg.Optional(new peg.Chain(new peg.Token("'else'"), new peg.Indirect(statement_indirect)))));
let return_stmt = new peg.Apply(([[return_, m_expr], semi]) => new ast.ReturnStmt(diagnostics.join_spans(return_.span, semi.span), m_expr), new peg.Chain(new peg.Chain(new peg.Token("'return'"), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("';'")));
let while_stmt = new peg.Apply(([[[[while_, oparen], cond], cparen], body]) => new ast.WhileStmt(diagnostics.join_spans(while_.span, body.span), cond, body), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'while'"), new peg.Token("'('")), new peg.Indirect(expression_indirect)), new peg.Token("')'")), new peg.Indirect(statement_indirect)));
block =
    new peg.Apply(([[obrace, decls], cbrace]) => new ast.BlockStmt(diagnostics.join_spans(obrace.span, cbrace.span), decls), new peg.Chain(new peg.Chain(new peg.Token("'{'"), new peg.ZeroMore(new peg.Indirect(declaration_indirect))), new peg.Token("'}'")));
statement =
    expr_stmt
        .choice(print_stmt)
        .choice(for_stmt)
        .choice(if_stmt)
        .choice(return_stmt)
        .choice(while_stmt)
        .choice(block);
var_decl =
    new peg.Apply(([[[var_, ident], m_initializer], semi]) => new ast.VarStmt(diagnostics.join_spans(var_.span, semi.span), ident.name, m_initializer ? m_initializer[1] : null), new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'var'"), new peg.Token("identifier")), new peg.Optional(new peg.Chain(new peg.Token("'='"), new peg.Indirect(expression_indirect)))), new peg.Token("';'")));
let fun_decl = new peg.Chain(new peg.Token("'fun'"), fn).apply(([fun, [identifier, params, block]]) => new ast.FunctionStmt(diagnostics.join_spans(fun.span, block.span), identifier.name, params.map(x => x.name), block));
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
