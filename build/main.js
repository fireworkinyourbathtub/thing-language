/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./build/ts/diagnostics.js":
/*!*********************************!*\
  !*** ./build/ts/diagnostics.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.report_diagnostic = exports.Diagnostic = void 0;\nclass Diagnostic {\n}\nexports.Diagnostic = Diagnostic;\nfunction report_diagnostic(diagnostic) {\n}\nexports.report_diagnostic = report_diagnostic;\n\n\n//# sourceURL=webpack://thing/./build/ts/diagnostics.js?");

/***/ }),

/***/ "./build/ts/lexer.js":
/*!***************************!*\
  !*** ./build/ts/lexer.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.lex = void 0;\nconst diagnostics = __importStar(__webpack_require__(/*! ./diagnostics */ \"./build/ts/diagnostics.js\"));\nclass Token {\n}\nclass OParen extends Token {\n}\nclass CParen extends Token {\n}\nclass Comma extends Token {\n}\nclass Dot extends Token {\n}\nclass Plus extends Token {\n}\nclass Minus extends Token {\n}\nclass Star extends Token {\n}\nclass Slash extends Token {\n}\nclass OBrace extends Token {\n}\nclass CBrace extends Token {\n}\nclass Semicolon extends Token {\n}\nclass Less extends Token {\n}\nclass Equal extends Token {\n}\nclass Greater extends Token {\n}\nclass Bang extends Token {\n}\nclass LessEqual extends Token {\n}\nclass EqualEqual extends Token {\n}\nclass GreaterEqual extends Token {\n}\nclass BangEqual extends Token {\n}\nclass And extends Token {\n}\nclass Class extends Token {\n}\nclass Else extends Token {\n}\nclass False extends Token {\n}\nclass For extends Token {\n}\nclass Fun extends Token {\n}\nclass If extends Token {\n}\nclass Nil extends Token {\n}\nclass Or extends Token {\n}\nclass Print extends Token {\n}\nclass Return extends Token {\n}\nclass Super extends Token {\n}\nclass This extends Token {\n}\nclass True extends Token {\n}\nclass Var extends Token {\n}\nclass While extends Token {\n}\nclass Identifier extends Token {\n    constructor(name) {\n        super();\n        this.name = name;\n    }\n}\nclass StringLiteral extends Token {\n    constructor(str) {\n        super();\n        this.str = str;\n    }\n}\nclass NumberLiteral extends Token {\n    constructor(num) {\n        super();\n        this.num = num;\n    }\n}\nclass BadCharacter extends diagnostics.Diagnostic {\n    // TODO: span\n    constructor(ch) {\n        super();\n        this.ch = ch;\n    }\n}\nclass Lexer {\n    constructor(source) {\n        this.source = source;\n        this.source = source;\n        this.ind = 0;\n    }\n    lex() {\n        let tokens = [];\n        while (!this.at_end()) {\n            let tok_start = this.ind;\n            let tok = this.lex_single_token();\n            let tok_end = this.ind;\n            if (tok != null) {\n                tokens.push(tok);\n            }\n        }\n        return tokens;\n    }\n    lex_single_token() {\n        let c = this.advance();\n        if (c == null) {\n            return null;\n        }\n        switch (c) {\n            case '(': return new OParen();\n            case ')': return new CParen();\n            case ',': return new Comma();\n            case '.': return new Dot();\n            case '+': return new Plus();\n            case '-': return new Minus();\n            case '*': return new Star();\n            case '/':\n                if (this.match('/')) {\n                    while (!this.at_end() && this.peek() != '\\n') {\n                        this.advance();\n                    }\n                    ;\n                    return null;\n                }\n                else {\n                    return new Slash();\n                }\n            case '{': return new OBrace();\n            case '}': return new CBrace();\n            case ';': return new Semicolon();\n            case ' ':\n            case '\\n':\n            case '\\r':\n            case '\\t':\n                return null;\n            case '!': return this.match('=') ? new BangEqual() : new Bang();\n            case '=': return this.match('=') ? new EqualEqual() : new Equal();\n            case '<': return this.match('=') ? new LessEqual() : new Less();\n            case '>': return this.match('=') ? new GreaterEqual() : new Greater();\n            case '\"': return this.string();\n            default:\n                if (this.is_digit(c)) {\n                    return this.number();\n                }\n                else if (this.is_alpha(c)) {\n                    return this.identifier();\n                }\n                else {\n                    // TODO: report error return new BadCharacter(c);\n                    return null;\n                }\n        }\n    }\n    string() {\n        let lit_start = this.ind;\n        while (!this.at_end() && this.peek() != '\"') {\n            this.advance();\n        }\n        if (this.at_end()) {\n            // TODO: Lox.error(line, \"Unterminated string.\");\n            return null;\n        }\n        let lit_end = this.ind;\n        this.advance();\n        let value = this.source.substring(lit_start, lit_end);\n        return new StringLiteral(value);\n    }\n    number() {\n        let start = this.ind - 1;\n        while (this.is_digit_(this.peek())) {\n            this.advance();\n        }\n        if (this.peek() == '.' && this.is_digit_(this.double_peek())) {\n            this.advance();\n            while (this.is_digit_(this.peek()))\n                this.advance();\n        }\n        return new NumberLiteral(parseFloat(this.source.substring(start, this.ind)));\n    }\n    identifier() {\n        let start = this.ind - 1;\n        while (this.is_alphanumeric_(this.peek())) {\n            this.advance();\n        }\n        let str = this.source.substring(start, this.ind);\n        switch (str) {\n            case \"and\": return new And();\n            case \"class\": return new Class();\n            case \"else\": return new Else();\n            case \"false\": return new False();\n            case \"for\": return new For();\n            case \"fun\": return new Fun();\n            case \"if\": return new If();\n            case \"nil\": return new Nil();\n            case \"or\": return new Or();\n            case \"print\": return new Print();\n            case \"return\": return new Return();\n            case \"super\": return new Super();\n            case \"this\": return new This();\n            case \"true\": return new True();\n            case \"var\": return new Var();\n            case \"while\": return new While();\n            default: return new Identifier(str);\n        }\n    }\n    is_digit(x) {\n        return /\\d/.test(x);\n    }\n    is_digit_(x) {\n        if (x == null) {\n            return false;\n        }\n        return /\\d/.test(x);\n    }\n    is_alpha(x) {\n        return /[a-zA-Z]/.test(x);\n    }\n    is_alphanumeric(x) {\n        return this.is_digit(x) || this.is_alpha(x);\n    }\n    is_alphanumeric_(x) {\n        if (x == null) {\n            return false;\n        }\n        return this.is_digit(x) || this.is_alpha(x);\n    }\n    at_end() {\n        return this.ind >= this.source.length;\n    }\n    peek() {\n        if (this.at_end()) {\n            return null;\n        }\n        else {\n            return this.source[this.ind];\n        }\n    }\n    double_peek() {\n        if (this.ind + 1 >= this.source.length) {\n            return null;\n        }\n        else {\n            return this.source[this.ind + 1];\n        }\n    }\n    advance() {\n        if (this.at_end()) {\n            return null;\n        }\n        else {\n            return this.source[this.ind++];\n        }\n    }\n    match(x) {\n        if (this.peek() == x) {\n            this.advance();\n            return true;\n        }\n        else {\n            return false;\n        }\n    }\n}\nfunction lex(input) {\n    return new Lexer(input).lex();\n}\nexports.lex = lex;\n\n\n//# sourceURL=webpack://thing/./build/ts/lexer.js?");

/***/ }),

/***/ "./build/ts/main.js":
/*!**************************!*\
  !*** ./build/ts/main.js ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst lexer = __importStar(__webpack_require__(/*! ./lexer */ \"./build/ts/lexer.js\"));\nlet editor = ace.edit(\"codeeditor\");\neditor.setOption(\"printMarginColumn\", false);\ndocument.getElementById('submitbutton').addEventListener('click', function () {\n    let inputcodebox = document.getElementById('inputcodebox');\n    let input = editor.getValue();\n    document.getElementById(\"codeview\").textContent = input;\n    let lexed = lexer.lex(input);\n    console.log(lexed);\n});\n\n\n//# sourceURL=webpack://thing/./build/ts/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./build/ts/main.js");
/******/ 	
/******/ })()
;