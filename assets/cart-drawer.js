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
  open() {
    this.setAttribute('aria-hidden', false);
    this.classList.add('is-active');
    this.refreshCart();
  }

  close() {
    this.setAttribute('aria-hidden', true);
    this.classList.remove('is-active');
  }

  // ---------------- Optimistic Subtotal ----------------
  updateSubtotalOptimistically({ priceDelta = 0, itemsDelta = 0 }) {
    const totalPriceEl = this.querySelector('.cart__total-price');
    const totalItemsEl = this.querySelector('.cart__total-items');

    if (!totalPriceEl || !totalItemsEl) return;

    let currentPrice = parseFloat(
      totalPriceEl.textContent.replace(/[£,]/g, '')
    ) * 100 || 0;
    let currentItems = parseInt(totalItemsEl.textContent) || 0;

    currentPrice += priceDelta;
    currentItems += itemsDelta;

    totalPriceEl.textContent = (currentPrice / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP'
    });
    totalItemsEl.textContent = `${currentItems} item${currentItems !== 1 ? 's' : ''}`;
  }

  // ---------------- Optimistic Line Price ----------------
  updateLinePriceOptimistically(lineItemEl, unitPrice, newQty) {
    const priceEl = lineItemEl.querySelector('.cart-drawer__item-price');
    if (!priceEl) return;

    const newLinePrice = unitPrice * newQty;
    priceEl.textContent = (newLinePrice / 100).toLocaleString('en-GB', {
      style: 'currency',
      currency: 'GBP'
    });
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

      const headerCartCount = document.querySelector('.header__cart-count');
      if (headerCartCount) {
        headerCartCount.textContent = cart.item_count;
      }


      // ---- Cart items ----
      const itemsContainer = this.querySelector('.cart-drawer__items');
      if (!itemsContainer) return;

      itemsContainer.innerHTML = '';

      if (cart.items.length === 0) {
        this.classList.add('is-empty');
      } else {
        this.classList.remove('is-empty');
      }

      cart.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-drawer__item';
        li.dataset.line = index + 1;
        li.dataset.variantId = item.variant_id;

        li.innerHTML = `
          <div class="cart-drawer__item-info">
            <div class="cart-drawer__item-image">
              <img src="${item.image 
                ? item.image.replace(/(\.(jpg|jpeg|png|gif|webp))/i, '_40x$1') 
                : ''}" alt="${item.title}">
            </div>
            <h3 class="cart-drawer__item-title">${item.product_title}</h3>
            <button type="button" class="cart-drawer__item-remove">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="trash-icon 1" clip-path="url(#clip0_1155_357)">
                  <path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M13.125 3.5V12.25C13.125 13.2169 12.3419 14 11.375 14H2.625C1.65812 14 0.875 13.2169 0.875 12.25V3.5C0.392 3.5 0 3.108 0 2.625C0 2.142 0.392 1.75 0.875 1.75H5.25C5.25 0.783125 6.03312 0 7 0C7.96688 0 8.75 0.783125 8.75 1.75H13.125C13.608 1.75 14 2.142 14 2.625C14 3.108 13.608 3.5 13.125 3.5ZM11.375 3.5H2.625V12.25H11.375V3.5ZM4.375 4.375C4.858 4.375 5.25 4.767 5.25 5.25V10.5C5.25 10.983 4.858 11.375 4.375 11.375C3.892 11.375 3.5 10.983 3.5 10.5V5.25C3.5 4.767 3.892 4.375 4.375 4.375ZM7 4.375C7.483 4.375 7.875 4.767 7.875 5.25V10.5C7.875 10.983 7.483 11.375 7 11.375C6.517 11.375 6.125 10.983 6.125 10.5V5.25C6.125 4.767 6.517 4.375 7 4.375ZM9.625 4.375C10.108 4.375 10.5 4.767 10.5 5.25V10.5C10.5 10.983 10.108 11.375 9.625 11.375C9.142 11.375 8.75 10.983 8.75 10.5V5.25C8.75 4.767 9.142 4.375 9.625 4.375Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_1155_357">
                    <rect width="14" height="14" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>          
            
          <div class="cart-drawer__item-actions">
            <span class="cart-drawer__item-price">
              ${(item.final_line_price / 100).toLocaleString('en-GB', {
                style: 'currency',
                currency: 'GBP'
              })}
            </span>
            <div class="cart-drawer__item-quantity">
              <button type="button" class="cart-drawer__item-quantity-btn cart-drawer__item-quantity-btn--minus">-</button>
              <input type="number" value="${item.quantity}" min="1"
                      class="cart-drawer__item-quantity-input"
                      data-variant-id="${item.variant_id}"
                      data-price="${item.final_price}">
              <button type="button" class="cart-drawer__item-quantity-btn cart-drawer__item-quantity-btn--plus">+</button>
            </div>
          </div>
        `;

        itemsContainer.appendChild(li);
        this.setupItemControls(li, item);
      });
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  // ---------------- Clear All ----------------
  async clearAll() {
    try {
      await fetch('/cart/clear.js', { method: 'POST' });
      this.refreshCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
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

// ---------------- Add To Cart ----------------
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

        try {
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity })
          });

          this.open();        // open drawer
          input.value = 1;    // reset qty
          this.refreshCart(); // refresh cart contents
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      });
    });
  }


  // ---------------- Per-Item Controls ----------------
  setupItemControls(li, item) {
    const minusBtn = li.querySelector('.cart-drawer__item-quantity-btn--minus');
    const plusBtn = li.querySelector('.cart-drawer__item-quantity-btn--plus');
    const input = li.querySelector('.cart-drawer__item-quantity-input');
    const removeBtn = li.querySelector('.cart-drawer__item-remove');
    const unitPrice = parseInt(input.dataset.price);

    // Quantity minus
    minusBtn.addEventListener('click', async () => {
      const newQty = Math.max(1, parseInt(input.value) - 1);
      const diff = newQty - item.quantity;

      this.updateSubtotalOptimistically({
        priceDelta: diff * unitPrice,
        itemsDelta: diff
      });
      this.updateLinePriceOptimistically(li, unitPrice, newQty);

      input.value = newQty;
      await this.updateCartLine(li.dataset.line, newQty);
    });

    // Quantity plus
    plusBtn.addEventListener('click', async () => {
      const newQty = parseInt(input.value) + 1;
      const diff = newQty - item.quantity;

      this.updateSubtotalOptimistically({
        priceDelta: diff * unitPrice,
        itemsDelta: diff
      });
      this.updateLinePriceOptimistically(li, unitPrice, newQty);

      input.value = newQty;
      await this.updateCartLine(li.dataset.line, newQty);
    });

    // Remove item
    removeBtn.addEventListener('click', async () => {
      this.updateSubtotalOptimistically({
        priceDelta: -(item.final_line_price),
        itemsDelta: -(item.quantity)
      });
      this.updateLinePriceOptimistically(li, unitPrice, 0);

      await this.updateCartLine(li.dataset.line, 0);
    });
  }

  async updateCartLine(line, quantity) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity })
      });
      this.refreshCart();
    } catch (error) {
      console.error('Error updating cart line:', error);
      this.refreshCart();
    }
  }
}

customElements.define('cart-drawer', CartDrawer);
