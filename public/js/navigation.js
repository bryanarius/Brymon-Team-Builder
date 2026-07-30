'use strict';

const toggle = document.querySelector('.mobile-nav-toggle');
const menu = document.querySelector('#mobile-navigation');

if (toggle && menu) {
    const closeMenu = () => {
        toggle.classList.remove('is-open');
        menu.classList.remove('is-open');
        menu.hidden = true;

        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
    };

    const openMenu = () => {
        toggle.classList.add('is-open');
        menu.classList.add('is-open');
        menu.hidden = false;

        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
    };

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (
            !menu.hidden &&
            !menu.contains(event.target) &&
            !toggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 860) {
            closeMenu();
        }
    });
}