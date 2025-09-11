class CartDrawer extends HTMLElement {
  // ----- Private Fields ----
  #overlay;
  #cartIcon;
  #clearAllBtn;
  #itemsContainer;
  #totalItems;
  #totalPrice;
  #headerCartCount;
  #emptyState;

  #openHandler;
  #closeHandler;
  #clearAllHandler;
  #handleCartItemAction;

  constructor() {
    super();
    this.#openHandler = this.open.bind(this);
    this.#closeHandler = this.close.bind(this);
    this.#clearAllHandler = this.clearAll.bind(this);
    this.#handleCartItemAction = this.handleCartItemAction.bind(this);
  }

  connectedCallback() {
    // ---------------- Cache DOM Elements ----------------
    this.#overlay = this.querySelector('.cart-drawer__overlay');
    this.#cartIcon = document.querySelector('.header__icon--cart');
    this.#clearAllBtn = this.querySelector('.cart-drawer__header-clear-all');
    this.#itemsContainer = this.querySelector('.cart-drawer__items');
    this.#totalItems = this.querySelector('.cart__total-items');
    this.#totalPrice = this.querySelector('.cart__total-price');
    this.#headerCartCount = document.querySelector('.header__cart-count');
    this.#emptyState = this.querySelector('.cart-drawer__empty');

    // ---------------- Bind Events --------------------------------
    if (this.#overlay) this.#overlay.addEventListener('click', this.#closeHandler);
    if (this.#cartIcon) this.#cartIcon.addEventListener('click', this.#openHandler);
    if (this.#clearAllBtn) this.#clearAllBtn.addEventListener('click', this.#clearAllHandler);
    if (this.#itemsContainer) this.#itemsContainer.addEventListener('click', this.#handleCartItemAction);

    // ---- Setup Collection & ATC ----
    this.#setupCollectionQuantity();
    this.#setupAddToCartButton();

    // ---- Initial Cart Load ----
    this.refreshCart();
  }

  disconnectedCallback() {
    if (this.#overlay) this.#overlay.removeEventListener('click', this.#closeHandler);
    if (this.#cartIcon) this.#cartIcon.removeEventListener('click', this.#openHandler);
    if (this.#clearAllBtn) this.#clearAllBtn.removeEventListener('click', this.#clearAllHandler);
    if (this.#itemsContainer) this.#itemsContainer.removeEventListener('click', this.#handleCartItemAction);
  }

  // ---------------- Public Methods ----------------
  open() {
    this.setAttribute('aria-hidden', false);
    this.classList.add('is-active');
  }

  close() {
    this.setAttribute('aria-hidden', true);
    this.classList.remove('is-active');
  }

  async addToCart(variantId, quantity) {
    await this.#cartRequest('/cart/add.js', { id: variantId, quantity });
    const cart = await this.#cartRequest('/cart.js');
    this.#updateUI(cart);
    this.open();
  }

  async clearAll() {
    await this.#cartRequest('/cart/clear.js', {});
    this.refreshCart();
  }

  async updateCartLine(line, quantity) {
    await this.#cartRequest('/cart/change.js', { line, quantity });
    this.refreshCart();
  }

  async refreshCart() {
    const cart = await this.#cartRequest('/cart.js');
    this.#updateUI(cart);
  }

  // ---------------- Private Methods ----------------
  async #cartRequest(endpoint, payload = null) {
    try {
      const options = {
        method: payload ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined
      };
      const res = await fetch(endpoint, options);
      return await res.json();
    } catch (error) {
      console.error(`Cart API error (${endpoint}):`, error);
      throw error;
    }
  }

  #updateUI(cart) {
    this.#updateTotals(cart);
    this.#updateHeaderCount(cart);
    this.#renderItems(cart);
  }

  #updateTotals(cart) {
    if (this.#totalItems) {
      this.#totalItems.textContent = `${cart.item_count} item${cart.item_count !== 1 ? 's' : ''}`;
    }
    if (this.#totalPrice) {
      this.#totalPrice.textContent = (cart.total_price / 100).toLocaleString('en-GB', {
        style: 'currency',
        currency: 'GBP'
      });
    }
  }

  #updateHeaderCount(cart) {
    if (this.#headerCartCount) {
      const count = cart.item_count;
      this.#headerCartCount.style.display = count > 0 ? 'inline-block' : 'none';
      this.#headerCartCount.textContent = count;
    }
  }

  #renderItems(cart) {
    if (!this.#itemsContainer) return;

    this.#itemsContainer.innerHTML = '';

    if (cart.items.length === 0) {
      this.classList.add('is-empty');
      if (this.#emptyState) this.#emptyState.style.display = 'block';
      return;
    }

    this.classList.remove('is-empty');
    if (this.#emptyState) this.#emptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();
    cart.items.forEach((item, index) => {
      fragment.appendChild(this.#buildCartItem(item, index));
    });
    this.#itemsContainer.replaceChildren(fragment);
  }

  #buildCartItem(item, index) {
    const li = document.createElement('li');
    li.className = 'cart-drawer__item';
    li.dataset.line = index + 1;
    li.dataset.variantId = item.variant_id;
    li.dataset.price = item.final_price;

    li.innerHTML = `
      <div class="cart-drawer__item-info">
        <div class="cart-drawer__item-image">
          <img src="${item.image ? item.image.replace(/(\.(jpg|jpeg|png|gif|webp))/i, '_40x$1') : ''}" alt="${item.title}">
        </div>
        <h3 class="cart-drawer__item-title">${item.product_title}</h3>
        <button type="button" class="cart-drawer__item-remove">🗑️</button>
      </div>          
      <div class="cart-drawer__item-actions">
        <span class="cart-drawer__item-price">
          ${(item.final_line_price / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
        </span>
        <div class="cart-drawer__item-quantity">
          <button type="button" class="cart-drawer__item-quantity-btn" data-action="minus">-</button>
          <input type="number" value="${item.quantity}" min="1" class="cart-drawer__item-quantity-input">
          <button type="button" class="cart-drawer__item-quantity-btn" data-action="plus">+</button>
        </div>
      </div>
    `;
    return li;
  }

  #setupCollectionQuantity() {
    const quantityContainers = document.querySelectorAll('.product-card__quantity');
    quantityContainers.forEach(container => {
      const input = container.querySelector('.product-card__quantity-input');
      const plus = container.querySelector('.product-card__quantity-btn--plus');
      const minus = container.querySelector('.product-card__quantity-btn--minus');

      if (!input || !plus || !minus) return;

      input.addEventListener('change', () => input.value = Math.max(1, parseInt(input.value)));
      plus.addEventListener('click', () => input.value = parseInt(input.value) + 1);
      minus.addEventListener('click', () => input.value = Math.max(1, parseInt(input.value) - 1));
    });
  }

  #setupAddToCartButton() {
    const addButtons = document.querySelectorAll('.product-card__add-to-cart-btn');
    addButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const productCard = button.closest('.product-card');
        const quantityContainer = productCard.querySelector('.product-card__quantity');
        const input = quantityContainer?.querySelector('.product-card__quantity-input');
        if (!quantityContainer || !input) return;

        const variantId = quantityContainer.dataset.variantId;
        const quantity = parseInt(input.value);

        await this.addToCart(variantId, quantity);

        input.value = 1;
      });
    });
  }

  async handleCartItemAction(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const li = btn.closest('.cart-drawer__item');
    if (!li) return;

    const input = li.querySelector('.cart-drawer__item-quantity-input');
    const line = li.dataset.line;
    let quantity = parseInt(input.value);

    if (btn.classList.contains('cart-drawer__item-remove')) quantity = 0;
    else if (btn.dataset.action === 'minus') quantity = Math.max(1, quantity - 1);
    else if (btn.dataset.action === 'plus') quantity += 1;

    await this.updateCartLine(line, quantity);
  }
}

customElements.define('cart-drawer', CartDrawer);
