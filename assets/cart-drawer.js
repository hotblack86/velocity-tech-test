class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.openHandler = this.open.bind(this);
    this.closeHandler = this.close.bind(this);
  }

  connectedCallback() {
    // Overlay click
    this.overlay = this.querySelector('.cart-drawer__overlay');
    if (this.overlay) this.overlay.addEventListener('click', this.closeHandler);

    // Cart icon click
    this.cartIcon = document.querySelector('.header__icon--cart');
    if (this.cartIcon) this.cartIcon.addEventListener('click', this.openHandler);

    // Clear all button
    this.clearAllBtn = this.querySelector('.cart-drawer__header-clear-all');
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    this.setupCollectionQuantity();
    this.setupAddToCartButton();
  }

  disconnectedCallback() {
    if (this.overlay) this.overlay.removeEventListener('click', this.closeHandler);
    if (this.cartIcon) this.cartIcon.removeEventListener('click', this.openHandler);
  }

  // ---------------- Drawer Open/Close ----------------
  async open() {
    this.setAttribute('aria-hidden', false);
    this.classList.add('is-active');
    await this.refreshCart(); // Always refresh when opening
  }

  close() {
    this.setAttribute('aria-hidden', true);
    this.classList.remove('is-active');
  }

  // ---------------- AJAX Cart ----------------
  async refreshCart() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();

      // ---- Totals ----
      const totalItems = this.querySelector('.cart__total-items');
      const totalPrice = this.querySelector('.cart__total-price');

      if (totalItems) {
        totalItems.textContent = `${cart.item_count} item${cart.item_count !== 1 ? 's' : ''}`;
      }

      if (totalPrice) {
        totalPrice.textContent = (cart.total_price / 100).toLocaleString('en-GB', {
          style: 'currency',
          currency: 'GBP'
        });
      }

      // ---- Cart items ----
      const itemsContainer = this.querySelector('.cart-drawer__items');
      const emptyState = this.querySelector('.cart-drawer__empty');

      if (!itemsContainer) return;

      itemsContainer.innerHTML = ''; // Clear existing items

      if (cart.items.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
      } else {
        if (emptyState) emptyState.style.display = 'none';
      }

      // Build items
      cart.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-drawer__item';
        li.dataset.line = index + 1; // needed for /cart/change.js
        li.dataset.variantId = item.variant_id;

        li.innerHTML = `
          <div class="cart-drawer__item-image">
            <img src="${item.image ? item.image.replace(/(\.(jpg|jpeg|png|gif|webp))/i, '_80x$1') : ''}" 
                 alt="${item.title}">
          </div>

          <div class="cart-drawer__item-info">
            <h3 class="cart-drawer__item-title">${item.product_title}</h3>
            <p class="cart-drawer__item-variant">${item.variant_title || ''}</p>

            <div class="cart-drawer__item-actions">
              <span class="cart-drawer__item-price">
                ${(item.final_line_price / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
              </span>

              <div class="cart-drawer__item-quantity">
                <button type="button" class="cart-drawer__item-quantity-btn cart-drawer__item-quantity-btn--minus">-</button>
                <input type="number" value="${item.quantity}" min="1"
                       class="cart-drawer__item-quantity-input"
                       data-variant-id="${item.variant_id}">
                <button type="button" class="cart-drawer__item-quantity-btn cart-drawer__item-quantity-btn--plus">+</button>
              </div>
            </div>
          </div>

          <button type="button" class="cart-drawer__item-remove">🗑</button>
        `;

        itemsContainer.appendChild(li);
      });

    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  // ---------------- Clear All ----------------
  async clearAll() {
    try {
      await fetch('/cart/clear.js', { method: 'POST' });
      await this.refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // ---------------- Collection Quantity ----------------
  setupCollectionQuantity() {
    const quantityContainer = document.querySelector('.product-card__quantity');
    if (!quantityContainer) return;

    const input = quantityContainer.querySelector('.product-card__quantity-input');
    const plus = quantityContainer.querySelector('.product-card__quantity-btn--plus');
    const minus = quantityContainer.querySelector('.product-card__quantity-btn--minus');

    input.addEventListener('change', () => {
      input.value = Math.max(1, parseInt(input.value));
    });

    plus.addEventListener('click', () => {
      input.value = parseInt(input.value) + 1;
    });

    minus.addEventListener('click', () => {
      input.value = Math.max(1, parseInt(input.value) - 1);
    });
  }

  // ---------------- Add To Cart ----------------
  setupAddToCartButton() {
    const addButton = document.querySelector('.product-card__add-to-cart-btn');
    const quantityContainer = document.querySelector('.product-card__quantity');
    const input = quantityContainer?.querySelector('.product-card__quantity-input');

    if (!addButton || !quantityContainer) return;

    addButton.addEventListener('click', async () => {
      const variantId = quantityContainer.dataset.variantId;
      const quantity = parseInt(input.value);

      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity })
        });

        input.value = 1;        // Reset quantity
        await this.refreshCart(); // Update drawer items & totals
        this.open();            // Open drawer after refresh
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    });
  }
}

customElements.define('cart-drawer', CartDrawer);
