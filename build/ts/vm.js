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
exports.interpret = void 0;
const bytecode = __importStar(require("./bytecode"));
const runtime = __importStar(require("./runtime"));
class InstructionLister {
    constructor(env) {
        this.env = env;
    }
    *visitStmtMarker(instr) { yield instr; }
    *visitUnaryOp(instr) { yield instr; }
    *visitBinaryOp(instr) { yield instr; }
    *visitCall(instr) { yield instr; }
    *visitAssign(instr) { yield instr; }
    *visitReadVar(instr) { yield instr; }
    *visitEndScope(instr) { yield instr; }
    *visitStartScope(instr) { yield instr; }
    *visitReturn(instr) { yield instr; }
    *visitIf(instr) {
        if (instr.cond.to_runtime_value(this.env).is_truthy()) {
            yield* instruction_list(this.env, instr.true_branch);
        }
        else {
            if (instr.false_branch) {
                yield* instruction_list(this.env, instr.false_branch);
            }
        }
    }
    *visitWhile(instr) {
        while (true) {
            yield* instruction_list(this.env, instr.check_code);
            if (!instr.check.to_runtime_value(this.env).is_truthy())
                break;
            yield* instruction_list(this.env, instr.body_code);
        }
    }
    *visitMakeVar(instr) { yield instr; }
    *visitPrint(instr) { yield instr; }
}
function* instruction_list(env, instructions) {
    for (let instr of instructions) {
        yield* instr.accept(new InstructionLister(env));
    }
}
function interpret(instructions) {
    let env = new runtime.Environment(null);
    for (let instr of instruction_list(env, instructions)) {
        let ppc = new bytecode.PrettyPrintContext();
        instr.pretty_print(ppc);
        console.log(ppc.result);
    }
}
exports.interpret = interpret;
