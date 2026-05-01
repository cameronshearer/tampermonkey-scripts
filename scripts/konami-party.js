// ==UserScript==
// @name         Konami Party Mode
// @namespace    https://github.com/cameronshearer/tampermonkey-scripts
// @version      1.0
// @description  Enter the Konami Code (↑↑↓↓←→←→BA) on any website to unleash party mode! 🎉
// @author       cameronshearer
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const KONAMI_CODE = [
        'ArrowUp', 'ArrowUp',
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'b', 'a',
    ];

    const EMOJIS = ['🎉', '🎊', '🎈', '✨', '🌟', '🍾', '🥳', '🎆', '🎇', '🦄', '🌈', '💥'];
    const PARTY_DURATION_MS = 5000;
    const PARTICLE_COUNT = 150;

    let inputSequence = [];
    let partyActive = false;
    let partyTimeout = null;
    let particles = [];

    // ── Konami Code listener ────────────────────────────────────────────────

    document.addEventListener('keydown', (e) => {
        inputSequence.push(e.key);

        // Keep only the last N keys (length of the code)
        if (inputSequence.length > KONAMI_CODE.length) {
            inputSequence.shift();
        }

        if (inputSequence.join(',') === KONAMI_CODE.join(',')) {
            inputSequence = [];
            togglePartyMode();
        }
    });

    // ── Party Mode ──────────────────────────────────────────────────────────

    function togglePartyMode() {
        if (partyActive) {
            stopParty();
        } else {
            startParty();
        }
    }

    function startParty() {
        if (partyActive) return;
        partyActive = true;

        showBanner();
        launchParticles();

        partyTimeout = setTimeout(stopParty, PARTY_DURATION_MS);
    }

    function stopParty() {
        partyActive = false;
        clearTimeout(partyTimeout);

        // Remove all particle elements
        particles.forEach((p) => p.element && p.element.remove());
        particles = [];

        // Remove the banner
        const banner = document.getElementById('konami-party-banner');
        if (banner) banner.remove();
    }

    // ── Banner ──────────────────────────────────────────────────────────────

    function showBanner() {
        const existing = document.getElementById('konami-party-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'konami-party-banner';
        Object.assign(banner.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            zIndex: '2147483647',
            background: 'linear-gradient(135deg, #ff6fd8, #3813c2)',
            color: '#fff',
            fontFamily: 'sans-serif',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            padding: '1.2rem 2.5rem',
            borderRadius: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            textAlign: 'center',
            pointerEvents: 'none',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            whiteSpace: 'nowrap',
        });
        banner.textContent = '🎉 PARTY TIME! 🎉';
        document.body.appendChild(banner);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                banner.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });

        // Animate out before removal
        setTimeout(() => {
            banner.style.transform = 'translate(-50%, -50%) scale(0)';
        }, PARTY_DURATION_MS - 300);
    }

    // ── Confetti / Emoji Particles ──────────────────────────────────────────

    function launchParticles() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            setTimeout(() => {
                if (!partyActive) return;
                createParticle();
            }, Math.random() * (PARTY_DURATION_MS - 500));
        }
    }

    function createParticle() {
        const el = document.createElement('div');
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const startX = Math.random() * window.innerWidth;
        const size = 1.2 + Math.random() * 1.8; // rem
        const duration = 2 + Math.random() * 2;  // seconds
        const sway = (Math.random() - 0.5) * 200; // px horizontal drift

        el.textContent = emoji;
        Object.assign(el.style, {
            position: 'fixed',
            top: '-3rem',
            left: `${startX}px`,
            fontSize: `${size}rem`,
            zIndex: '2147483646',
            pointerEvents: 'none',
            userSelect: 'none',
            animation: `konami-fall ${duration}s ease-in forwards`,
            '--sway': `${sway}px`,
        });

        document.body.appendChild(el);

        const particle = { element: el };
        particles.push(particle);

        el.addEventListener('animationend', () => {
            el.remove();
            const idx = particles.indexOf(particle);
            if (idx !== -1) particles.splice(idx, 1);
        });
    }

    // ── Inject keyframe animation ───────────────────────────────────────────

    const style = document.createElement('style');
    style.textContent = `
        @keyframes konami-fall {
            0%   { transform: translateY(0)    translateX(0)               rotate(0deg);   opacity: 1; }
            100% { transform: translateY(110vh) translateX(var(--sway, 0px)) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();
