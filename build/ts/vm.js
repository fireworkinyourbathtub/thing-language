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
function* instruction_list(env, instructions) {
    for (let instr of instructions) {
        yield* instruction_list_1(env, instr);
    }
}
function* instruction_list_1(env, instr) {
    switch (instr.type) {
        case 'If': {
            if (instr.cond.to_runtime_value(env).is_truthy()) {
                yield* instruction_list(env, instr.true_branch);
            }
            else {
                if (instr.false_branch) {
                    yield* instruction_list(env, instr.false_branch);
                }
            }
            break;
        }
        case 'While': {
            while (true) {
                yield* instruction_list(env, instr.check_code);
                if (!instr.check.to_runtime_value(env).is_truthy())
                    break;
                yield* instruction_list(env, instr.body_code);
            }
            break;
        }
        default: {
            yield instr;
            break;
        }
    }
}
function interpret(instructions) {
    let env = new runtime.Environment(null);
    for (let instr of instruction_list(env, instructions)) {
        console.log(bytecode.pretty_print([instr]));
        switch (instr.type) {
            case 'StmtMarker': {
                break;
            }
            case 'UnaryOp': {
                break;
            }
            case 'BinaryOp': {
                break;
            }
            case 'Call': {
                break;
            }
            case 'Assign': {
                break;
            }
            case 'ReadVar': {
                break;
            }
            case 'EndScope': {
                break;
            }
            case 'StartScope': {
                break;
            }
            case 'Return': {
                break;
            }
            case 'If': {
                break;
            }
            case 'While': {
                break;
            }
            case 'MakeVar': {
                break;
            }
            case 'Print': {
                break;
            }
        }
    }
}
exports.interpret = interpret;
