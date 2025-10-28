(() => {
    const elPrev = document.getElementById('prev');
    const elCurr = document.getElementById('curr');

    let current = '';
    let previous = '';
    let operator = null;
    let overwrite = false;

    const fmt = (str) => {
        if (!str) return '0';
        if (str === 'Error') return 'Error';
        const n = Number(str);
        if (!isFinite(n)) return 'Error';
        const [int, dec] = String(str).split('.');
        const neg = int.startsWith('-');
        const intAbs = neg ? int.slice(1) : int;
        const intFmt = Number(intAbs).toLocaleString('es-ES');
        return (neg ? '-' : '') + intFmt + (dec != null && dec !== '' ? '.' + dec : '');
    };

    const update = () => {
        elCurr.textContent = fmt(current || (previous && !current && !operator ? previous : '0'));
        elPrev.textContent = previous && operator ? `${fmt(previous)} ${operator}` : '';
    };

    const clearAll = () => { current = ''; previous = ''; operator = null; overwrite = false; update(); };
    const del = () => {
        if (overwrite) { current = ''; overwrite = false; update(); return; }
        if (!current) return;
        current = current.slice(0, -1);
        update();
    };
    const append = (ch) => {
        if (current === 'Error') current = '';
        if (overwrite) { current = ''; overwrite = false; }
        if (ch === '.') {
            if (!current) current = '0';
            if (current.includes('.')) return;
        }
        if (ch === '0' && current === '0') return;
        if (current === '0' && ch !== '.') current = '';
        current += ch;
        update();
    };
    const chooseOp = (op) => {
        if (current === 'Error') return;
        if (!current && previous) { operator = op; update(); return; }
        if (!current) return;
        if (!previous) {
            previous = current; current = ''; operator = op; update(); return;
        }
        // compute chain
        compute();
        operator = op;
        previous = current;
        current = '';
        overwrite = false;
        update();
    };
    const percent = () => {
        if (!current) return;
        const n = parseFloat(current);
        if (!isFinite(n)) return;
        current = (n / 100).toString();
        update();
    };
    const plusminus = () => {
        if (!current) return;
        if (current.startsWith('-')) current = current.slice(1);
        else if (current !== '0') current = '-' + current;
        update();
    };
    const compute = () => {
        if (!previous || !current || !operator) return;
        const a = parseFloat(previous);
        const b = parseFloat(current);
        let res;
        switch (operator) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '×': res = a * b; break;
            case '÷':
                if (b === 0) { current = 'Error'; previous = ''; operator = null; overwrite = true; update(); return; }
                res = a / b; break;
            default: return;
        }
        current = Number.isFinite(res) ? String(res) : 'Error';
        previous = '';
        operator = null;
        overwrite = true;
        update();
    };

    // Bind buttons
    document.querySelectorAll('[data-number]').forEach(b => {
        b.addEventListener('click', () => append(b.getAttribute('data-number')));
    });
    document.querySelectorAll('[data-operator]').forEach(b => {
        b.addEventListener('click', () => chooseOp(b.getAttribute('data-operator')));
    });
    document.querySelector('[data-action="clear"]').addEventListener('click', clearAll);
    document.querySelector('[data-action="delete"]').addEventListener('click', del);
    document.querySelector('[data-action="percent"]').addEventListener('click', percent);
    document.querySelector('[data-action="plusminus"]').addEventListener('click', plusminus);
    document.querySelector('[data-action="equals"]').addEventListener('click', compute);

    // Keyboard support
    const keyOp = (k) => ({ '*': '×', 'x': '×', 'X': '×', '/': '÷' }[k] || k);
    window.addEventListener('keydown', (e) => {
        const k = e.key;
        if ((k >= '0' && k <= '9') || k === '.') { append(k); return; }
        if (['+', '-', '*', '/', 'x', 'X'].includes(k)) { chooseOp(keyOp(k)); e.preventDefault(); return; }
        if (k === 'Enter' || k === '=') { compute(); e.preventDefault(); return; }
        if (k === 'Backspace') { del(); return; }
        if (k === 'Escape' || k.toLowerCase() === 'c') { clearAll(); return; }
        if (k === '%') { percent(); return; }
    });

    update();
})();