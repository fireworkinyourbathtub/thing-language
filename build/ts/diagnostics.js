"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.report = exports.join_spans = exports.clear = exports.get_line = exports.Span = void 0;
const errors_div = document.getElementById('errors');
class Span {
    constructor(source, start, end) {
        this.source = source;
        this.start = start;
        this.end = end;
        [this.start_line, this.start_column] = get_linecol(source, start);
        [this.end_line, this.end_column] = get_linecol(source, end);
        this.contents = source.substring(start, end);
    }
}
exports.Span = Span;
function get_linecol(source, ind) {
    let line = (source.substring(0, ind).match(/^/mg) || []).length;
    let lines = source.substring(0, ind).match(/^.+/mg);
    if (lines) {
        return [line, lines[lines.length - 1].length + 1];
    }
    else {
        return [line, 0];
    }
}
function get_line(source, line) {
    return source.split('\n')[line - 1];
}
exports.get_line = get_line;
function clear() {
    while (errors_div.lastChild) {
        errors_div.removeChild(errors_div.lastChild);
    }
}
exports.clear = clear;
function join_spans(sp1, sp2) {
    return new Span(sp1.source, Math.min(sp1.start, sp2.start), Math.max(sp1.end, sp2.end));
}
exports.join_spans = join_spans;
function report(diagnostic) {
    let div = document.createElement('div');
    div.className = 'error';
    {
        let heading = document.createElement('p');
        heading.className = 'error_heading';
        heading.innerHTML = `error at ${diagnostic.span.start_line}:${diagnostic.span.start_column}: ${diagnostic.message}`;
        div.appendChild(heading);
    }
    {
        function make_line_view(source, nr, highlight_start_col, highlight_end_col) {
            let line_view = document.createElement('div');
            line_view.className = 'error_line_view';
            let line_number = document.createElement('p');
            line_number.innerHTML = nr.toString();
            line_number.className = 'error_linenumber';
            let pre = document.createElement('pre');
            let code = document.createElement('code');
            pre.className = 'error_pre';
            code.className = 'error_code';
            if (highlight_start_col == null || highlight_end_col == null) {
                code.innerHTML = source[nr - 1];
            }
            else {
                let line_contents = source[nr - 1];
                let start = highlight_start_col - 1;
                let end = highlight_end_col == -1 ? line_contents.length : highlight_end_col - 1;
                code.innerHTML = `${line_contents.substring(0, start)}<strong>${line_contents.substring(start, end)}</strong>${line_contents.substring(end)}`;
            }
            line_view.appendChild(line_number);
            pre.appendChild(code);
            line_view.appendChild(pre);
            return line_view;
        }
        let view = document.createElement('div');
        view.className = 'error_view';
        let source_lines = diagnostic.span.source.split('\n');
        for (let i = diagnostic.span.start_line; i <= diagnostic.span.end_line; ++i) {
            let highlight_start_col = diagnostic.span.start_line == i ? diagnostic.span.start_column :
                diagnostic.span.start_line < i ? 0 : null;
            let highlight_end_col = diagnostic.span.end_line == i ? diagnostic.span.end_column :
                diagnostic.span.end_line < i ? null : -1;
            view.appendChild(make_line_view(source_lines, i, highlight_start_col, highlight_end_col));
        }
        div.appendChild(view);
    }
    if (diagnostic.explanation) {
        let explanation = document.createElement('p');
        explanation.className = 'error_explanation';
        explanation.innerHTML = diagnostic.explanation;
        div.appendChild(explanation);
    }
    errors_div.appendChild(div);
}
exports.report = report;
