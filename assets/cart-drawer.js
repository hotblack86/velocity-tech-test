class CartDrawer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.overlay = this.querySelector('.cart-drawer__overlay');
        this.overlay.addEventListener('click', () => this.close());

        const triggers = document.querySelectorAll('[data-cart-trigger]');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => this.open());
        });
    }

    disconnectedCallback() {
        document.querySelectorAll('[data-cart-trigger]').forEach((button) => {
            button.removeEventListener('click', () => this.open());
        });

        this.overlay.removeEventListener('click', () => this.close());
    }

    open() {
        this.setAttribute('aria-hidden', false);
        this.classList.add('is-active');
    }

    close() {
        this.setAttribute('aria-hidden', true);
        this.classList.remove('is-active');
    }
}

customElements.define('cart-drawer', CartDrawer);