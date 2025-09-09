class CartDrawer extends HTMLElement {
    constructor() {
        super();

        this.openHandler = this.open.bind(this);
        this.closeHandler = this.close.bind(this);
    }

    connectedCallback() {
        this.overlay = this.querySelector('.cart-drawer__overlay');
        this.overlay.addEventListener('click', () => this.closeHandler());

        this.triggers = document.querySelectorAll('[data-cart-trigger]');
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', () => this.openHandler());
        });
    }

    disconnectedCallback() {
        this.overlay.removeEventListener('click', () => this.close());
        this.triggers.forEach(trigger => trigger.removeEventListener('click', this.openHandler));
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