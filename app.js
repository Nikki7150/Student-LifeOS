const bootScreen = document.getElementById('boot-screen');
const bootTextEl = document.getElementById('boot-text');

const boottext = `Student LifeOS v1.1.0

Initializing system...
Doing stuff...
Memory Test... OK
Made with ♡ by Nishka Kanchan

Loading modules...
Starting services...
SYSTEM.DAT........OK
COMMAND.COM.......OK

Initializing GUI...`;

let _typing = false;

function startBootSequence() {
    
    bootScreen.classList.add('visible');
    bootTextEl.textContent = '';
    _typing = true;
    let index = 0;

    function typeNext() {
        if (index >= boottext.length) {
            _typing = false;
            setTimeout(() => {
                bootScreen.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = './main.html';
                }, 900);
            }, 700);
            return;
        }

        const ch = boottext.charAt(index);
        bootTextEl.textContent += ch;
        index++;

        let delay = 22;
        if (ch === '\n') delay = 120;
        if (ch === '.' || ch === ',') delay = 60;
        if (ch === ' ') delay = 12;

        setTimeout(typeNext, delay);
    }

    typeNext();
}

if (bootScreen) startBootSequence();