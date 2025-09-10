class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.openHandler = this.open.bind(this);
    this.closeHandler = this.close.bind(this);
    this.handleCartItemAction = this.handleCartItemAction.bind(this);
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
    if (this.clearAllBtn) this.clearAllBtn.addEventListener('click', () => this.clearAll());

    // Collection qty controls
    this.setupCollectionQuantity();

    // Add to cart
    this.setupAddToCartButton();

    // Event delegation for all cart item actions
    this.itemsContainer = this.querySelector('.cart-drawer__items');
    if (this.itemsContainer) {
      this.itemsContainer.addEventListener('click', this.handleCartItemAction);
    }

    // Initial render
    this.refreshCart();
  }

  disconnectedCallback() {
    if (this.overlay) this.overlay.removeEventListener('click', this.closeHandler);
    if (this.cartIcon) this.cartIcon.removeEventListener('click', this.openHandler);
    if (this.clearAllBtn) this.clearAllBtn.removeEventListener('click', () => this.clearAll());
    if (this.itemsContainer) this.itemsContainer.removeEventListener('click', this.handleCartItemAction);
  }

  // ---------------- Drawer Open/Close ----------------
  async open() {
    this.setAttribute('aria-hidden', false);
    this.classList.add('is-active');
    await this.refreshCart();
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

      // Totals
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

      const headerCartCount = document.querySelector('.header__cart-count');
      if (headerCartCount) {
        const count = cart.item_count;
        headerCartCount.style.display = count > 0 ? 'inline-block' : 'none';
        headerCartCount.textContent = count;
      }

      if (!this.itemsContainer) return;
      this.itemsContainer.innerHTML = '';

      if (cart.items.length === 0) {
        this.classList.add('is-empty');
        return;
      }
      this.classList.remove('is-empty');

      // Batch DOM updates with a fragment
      const fragment = document.createDocumentFragment();
      cart.items.forEach((item, index) => {
        fragment.appendChild(this.buildCartItem(item, index));
      });

      this.itemsContainer.appendChild(fragment);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  async addToCart(variantId, quantity) {
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity })
      });

      await this.open();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async clearAll() {
    try {
      await fetch('/cart/clear.js', { method: 'POST' });
      await this.refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  async updateCartLine(line, quantity) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity })
      });
      await this.refreshCart();
    } catch (error) {
      console.error('Error updating cart line:', error);
      await this.refreshCart();
    }
  }


  // ---------------- Optimistic Updates ----------------
  updateSubtotal({ priceDelta = 0, itemsDelta = 0 }) {
    const totalPriceEl = this.querySelector('.cart__total-price');
    const totalItemsEl = this.querySelector('.cart__total-items');

    if (!totalPriceEl || !totalItemsEl) return;

    let currentPrice = parseFloat(totalPriceEl.textContent.replace(/[£,]/g, '')) * 100 || 0;
    let currentItems = parseInt(totalItemsEl.textContent) || 0;

    currentPrice += priceDelta;
    currentItems += itemsDelta;

    totalPriceEl.textContent = (currentPrice / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP'
    });
    totalItemsEl.textContent = `${currentItems} item${currentItems !== 1 ? 's' : ''}`;
  }

  updateLinePrice(lineItemEl, unitPrice, newQty) {
    const priceEl = lineItemEl.querySelector('.cart-drawer__item-price');
    if (!priceEl) return;

    const newLinePrice = unitPrice * newQty;
    priceEl.textContent = (newLinePrice / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP'
    });
  }

  // ---------------- Build Item Markup ----------------
  buildCartItem(item, index) {
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
          <input type="number" value="${item.quantity}" min="1"
                  class="cart-drawer__item-quantity-input">
          <button type="button" class="cart-drawer__item-quantity-btn" data-action="plus">+</button>
        </div>
      </div>
    `;
    return li;
  }

  

  // ---------------- Collection Quantity ----------------
  setupCollectionQuantity() {
    const quantityContainers = document.querySelectorAll('.product-card__quantity');
    if (!quantityContainers.length) return;

    quantityContainers.forEach(container => {
      const input = container.querySelector('.product-card__quantity-input');
      const plus = container.querySelector('.product-card__quantity-btn--plus');
      const minus = container.querySelector('.product-card__quantity-btn--minus');

      if (!input || !plus || !minus) return;

      input.addEventListener('change', () => {
        input.value = Math.max(1, parseInt(input.value));
      });

      plus.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
      });

      minus.addEventListener('click', () => {
        input.value = Math.max(1, parseInt(input.value) - 1);
      });
    });
  }


  setupAddToCartButton() {
    const addButtons = document.querySelectorAll('.product-card__add-to-cart-btn');
    if (!addButtons.length) return;

    addButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const productCard = button.closest('.product-card');
        const quantityContainer = productCard.querySelector('.product-card__quantity');
        const input = quantityContainer?.querySelector('.product-card__quantity-input');

        if (!quantityContainer || !input) return;

        const variantId = quantityContainer.dataset.variantId;
        const quantity = parseInt(input.value);

        await this.addToCart(variantId, quantity);

        // Reset qty input back to 1
        input.value = 1;
      });
    });
  }


  // ---------------- Event Delegation for Items ----------------
  async handleCartItemAction(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const li = btn.closest('.cart-drawer__item');
    if (!li) return;

    const input = li.querySelector('.cart-drawer__item-quantity-input');
    const unitPrice = parseInt(li.dataset.price);
    const line = li.dataset.line;
    const currentQty = parseInt(input.value);

    if (btn.classList.contains('cart-drawer__item-remove')) {
      this.updateSubtotal({ priceDelta: -(unitPrice * currentQty), itemsDelta: -currentQty });
      this.updateLinePrice(li, unitPrice, 0);
      await this.updateCartLine(line, 0);
    }

    if (btn.dataset.action === 'minus') {
      const newQty = Math.max(1, currentQty - 1);
      this.updateSubtotal({ priceDelta: -unitPrice, itemsDelta: -1 });
      this.updateLinePrice(li, unitPrice, newQty);
      input.value = newQty;
      await this.updateCartLine(line, newQty);
    }

    if (btn.dataset.action === 'plus') {
      const newQty = currentQty + 1;
      this.updateSubtotal({ priceDelta: unitPrice, itemsDelta: 1 });
      this.updateLinePrice(li, unitPrice, newQty);
      input.value = newQty;
      await this.updateCartLine(line, newQty);
    }
  }

  
}

customElements.define('cart-drawer', CartDrawer);
