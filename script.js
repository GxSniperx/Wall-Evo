const yourWhatsAppNumber = "212777711888";

/* ===== FIXED SIZE PRICES IN DH ===== */
const sizePriceRules = {
    "30 × 40 cm": 169,
    "40 × 60 cm": 249,
    "50 × 70 cm": 299
};

function getPriceBySize(size) {
    return sizePriceRules[size] || 169;
}

/* ===== CART STATE ===== */
function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem("cart"));
        return Array.isArray(savedCart) ? savedCart : [];
    } catch {
        localStorage.removeItem("cart");
        return [];
    }
}

let cart = loadCart();

/* ===== ELEMENTS ===== */
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDiscount = document.getElementById("cart-discount");
const cartTotal = document.getElementById("cart-total");
const discountInfoText = document.getElementById("discount-info-text");
const cartWhatsAppOrderBtn = document.getElementById("cart-whatsapp-order");
const toast = document.getElementById("toast");
const whatsappForm = document.getElementById("whatsapp-form");
const cartBackdrop = document.getElementById("cart-backdrop");
const menuToggle = document.getElementById("menu-toggle");
const primaryNav = document.getElementById("primary-nav");

const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const closeModal = document.getElementById("close-modal");

/* ===== CUSTOM POSTER ELEMENTS ===== */
const customImageUpload = document.getElementById("custom-image-upload");
const customSizeSelect = document.getElementById("custom-size-select");
const customFrameSelect = document.getElementById("custom-frame-select");
const customQuantity = document.getElementById("custom-quantity");
const customPrice = document.getElementById("custom-price");
const customPreviewFrame = document.getElementById("custom-preview-frame");
const customPreviewImage = document.getElementById("custom-preview-image");
const customPreviewPlaceholder = document.getElementById("custom-preview-placeholder");
const customPreviewSize = document.getElementById("custom-preview-size");
const customPreviewFrameText = document.getElementById("custom-preview-frame-text");
const customWhatsAppOrder = document.getElementById("custom-whatsapp-order");
const customClearPreview = document.getElementById("custom-clear-preview");
const customRequestText = document.getElementById("custom-request-text");

let customUploadedImageName = "";
let customUploadedImageURL = "";
let lastFocusedElement = null;

const faqs = [
    {
        question: "How do I order?",
        answer: "Choose a poster, select the size and frame, and add it to your bag. When you are ready, continue on WhatsApp with the prepared order request."
    },
    {
        question: "Can I request a custom poster?",
        answer: "Yes. Use the custom poster studio to preview your image and choose a size, frame, and quantity. You can then send the request and original image on WhatsApp."
    },
    {
        question: "What sizes are available?",
        answer: "The current formats are 30 × 40 cm, 40 × 60 cm, and 50 × 70 cm. The price updates as soon as you select a format."
    },
    {
        question: "Do you deliver across Morocco?",
        answer: "Yes, WALL EVO accepts delivery requests across Morocco. Availability and order details are confirmed directly on WhatsApp."
    },
    {
        question: "How do I contact WALL EVO?",
        answer: "Use any WhatsApp button on this page, or find WALL EVO on Instagram using the link in the footer."
    }
];

/* ===== HELPERS ===== */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getProductImage(name) {
    const card = Array.from(document.querySelectorAll(".product-card"))
        .find(product => product.dataset.name === name);
    return card ? card.querySelector(".preview-image")?.getAttribute("src") || "poster1.jpg" : "poster1.jpg";
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
    }[character]));
}

function normalizeCart() {
    cart = cart.map(item => ({
        name: item.name || "Poster",
        price: Number(item.price) || getPriceBySize(item.size || "30 × 40 cm"),
        size: item.size || "30 × 40 cm",
        frame: item.frame || "Black Frame",
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        image: getProductImage(item.name)
    }));
    saveCart();
}

function formatPrice(price) {
    return `${new Intl.NumberFormat("en-MA", { maximumFractionDigits: 2 }).format(price)} DH`;
}

function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getDiscountRate() {
    const totalItems = getCartCount();

    if (totalItems >= 4) return 0.10;
    if (totalItems >= 2) return 0.05;
    return 0;
}

function getDiscountAmount() {
    return getCartSubtotal() * getDiscountRate();
}

function getFinalTotal() {
    return getCartSubtotal() - getDiscountAmount();
}

function getDiscountLabel() {
    const rate = getDiscountRate();
    const totalItems = getCartCount();

    if (rate === 0.10) return "10% multi-poster discount applied";
    if (rate === 0.05) return `${totalItems === 3 ? "Add 1 more poster for 10% off" : "5% multi-poster discount applied"}`;
    return totalItems === 1 ? "Add 1 more poster for 5% off" : "Buy 2–3 and save 5% · Buy 4+ and save 10%";
}

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function bumpCartButton() {
    if (!cartBtn) return;
    cartBtn.classList.add("bump");
    setTimeout(() => cartBtn.classList.remove("bump"), 220);
}

function openWhatsAppWithMessage(message) {
    const url = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

function findCartItemIndex(name, size, frame) {
    return cart.findIndex(item =>
        item.name === name &&
        item.size === size &&
        item.frame === frame
    );
}

/* ===== CART MESSAGE ===== */
function buildCartMessage() {
    if (cart.length === 0) {
        return "WALL EVO order request\n\nHello, I would like help choosing a poster.";
    }

    const itemsList = cart.map((item, index) => {
        const lineTotal = item.price * item.quantity;
        return `${index + 1}. ${item.name}
Size: ${item.size}
Frame: ${item.frame}
Quantity: ${item.quantity}
Unit Price: ${formatPrice(item.price)}
Line Total: ${formatPrice(lineTotal)}`;
    }).join("\n\n");

    const discountLine = getDiscountAmount() > 0
        ? `Discount (${getDiscountRate() * 100}%): -${formatPrice(getDiscountAmount())}\n`
        : "";

    return `WALL EVO order request

${itemsList}

Subtotal: ${formatPrice(getCartSubtotal())}
${discountLine}Final total: ${formatPrice(getFinalTotal())}

Please confirm availability and the order. Thank you.`;
}

/* ===== CART UI ===== */
function updateCartUI() {
    if (!cartCount || !cartItems) return;

    cartCount.innerText = getCartCount();
    if (cartBtn) cartBtn.setAttribute("aria-label", `Open cart, ${getCartCount()} ${getCartCount() === 1 ? "item" : "items"}`);
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `<li class="empty-cart-message">Your bag is ready for something special.</li>`;
    } else {
        cart.forEach((item, index) => {
            const lineTotal = item.price * item.quantity;
            const safeName = escapeHtml(item.name);
            const safeSize = escapeHtml(item.size);
            const safeFrame = escapeHtml(item.frame);
            const safeImage = escapeHtml(item.image || getProductImage(item.name));

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="cart-item-main">
                    <img class="cart-item-image" src="${safeImage}" alt="" loading="lazy">
                    <div class="cart-item-text">
                        <div class="cart-item-name">${safeName}</div>
                        <div class="cart-item-meta">${safeSize} · ${safeFrame}</div>
                        <div class="cart-item-meta">${formatPrice(item.price)} each</div>
                        <div class="cart-line-total">${formatPrice(lineTotal)}</div>
                    </div>
                    <button class="remove-item" type="button" data-index="${index}" aria-label="Remove ${safeName}">Remove</button>
                </div>

                <div class="quantity-controls">
                    <button class="qty-btn decrease-qty" type="button" data-index="${index}" aria-label="Decrease quantity of ${safeName}">−</button>
                    <span class="qty-value" aria-label="Quantity ${item.quantity}">${item.quantity}</span>
                    <button class="qty-btn increase-qty" type="button" data-index="${index}" aria-label="Increase quantity of ${safeName}">+</button>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }

    if (cartSubtotal) cartSubtotal.textContent = formatPrice(getCartSubtotal());
    if (cartDiscount) cartDiscount.textContent = getDiscountAmount() > 0 ? `-${formatPrice(getDiscountAmount())}` : formatPrice(0);
    if (cartTotal) cartTotal.textContent = formatPrice(getFinalTotal());
    if (discountInfoText) discountInfoText.textContent = getDiscountLabel();

    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = Number(btn.dataset.index);
            const removed = cart[index];
            cart.splice(index, 1);
            saveCart();
            updateCartUI();
            if (removed) showToast(`${removed.name} removed`);
        });
    });

    document.querySelectorAll(".increase-qty").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = Number(btn.dataset.index);
            cart[index].quantity += 1;
            saveCart();
            updateCartUI();
            showToast("Quantity updated");
        });
    });

    document.querySelectorAll(".decrease-qty").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = Number(btn.dataset.index);

            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }

            saveCart();
            updateCartUI();
            showToast("Quantity updated");
        });
    });
}

/* ===== PRODUCT CARD ACTIONS ===== */
function updateFramePreview(card) {
    const frameSelect = card.querySelector(".frame-select");
    const image = card.querySelector(".preview-image");

    if (!frameSelect || !image) return;

    image.classList.remove("frame-black", "frame-white");

    if (frameSelect.value === "White Frame") {
        image.classList.add("frame-white");
    } else {
        image.classList.add("frame-black");
    }
}

function updateLiveProductPrice(card) {
    const sizeSelect = card.querySelector(".size-select");
    const priceElement = card.querySelector(".product-price");

    if (!sizeSelect || !priceElement) return;

    const size = sizeSelect.value;
    const finalPrice = getPriceBySize(size);

    priceElement.textContent = formatPrice(finalPrice);
}

document.querySelectorAll(".product-card").forEach(card => {
    const frameSelect = card.querySelector(".frame-select");
    const sizeSelect = card.querySelector(".size-select");

    updateFramePreview(card);
    updateLiveProductPrice(card);

    if (frameSelect) {
        frameSelect.addEventListener("change", () => {
            updateFramePreview(card);
        });
    }

    if (sizeSelect) {
        sizeSelect.addEventListener("change", () => {
            updateLiveProductPrice(card);
        });
    }
});

document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        const name = card.dataset.name;
        const size = card.querySelector(".size-select").value;
        const frame = card.querySelector(".frame-select").value;
        const finalPrice = getPriceBySize(size);
        const image = card.querySelector(".preview-image").getAttribute("src");

        const existingIndex = findCartItemIndex(name, size, frame);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                name,
                price: finalPrice,
                size,
                frame,
                quantity: 1,
                image
            });
        }

        saveCart();
        updateCartUI();
        showToast(`${name} added to cart`);
        bumpCartButton();
    });
});

document.querySelectorAll(".quick-order").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        const name = card.dataset.name;
        const size = card.querySelector(".size-select").value;
        const frame = card.querySelector(".frame-select").value;
        const finalPrice = getPriceBySize(size);

        const message = `WALL EVO order request

Product: ${name}
Size: ${size}
Frame: ${frame}
Quantity: 1
Price: ${formatPrice(finalPrice)}

Please confirm availability and the order. Thank you.`;

        openWhatsAppWithMessage(message);
    });
});

/* ===== CUSTOM POSTER PREVIEW ===== */
function updateCustomPreviewFrame() {
    if (!customPreviewFrame || !customFrameSelect) return;

    customPreviewFrame.classList.remove("frame-black", "frame-white");

    if (customFrameSelect.value === "White Frame") {
        customPreviewFrame.classList.add("frame-white");
    } else {
        customPreviewFrame.classList.add("frame-black");
    }

    if (customPreviewFrameText) {
        customPreviewFrameText.textContent = customFrameSelect.value;
    }
}

function updateCustomPreviewPrice() {
    if (!customSizeSelect || !customPrice || !customPreviewSize) return;

    const size = customSizeSelect.value;
    const quantity = Math.max(1, Number(customQuantity?.value) || 1);
    const subtotal = getPriceBySize(size) * quantity;
    const discountRate = quantity >= 4 ? 0.10 : quantity >= 2 ? 0.05 : 0;
    const price = subtotal - (subtotal * discountRate);

    customPrice.textContent = formatPrice(price);
    customPreviewSize.textContent = size;
}

function clearCustomPreview() {
    if (customUploadedImageURL) {
        URL.revokeObjectURL(customUploadedImageURL);
    }

    customUploadedImageURL = "";
    customUploadedImageName = "";

    if (customImageUpload) customImageUpload.value = "";
    if (customPreviewImage) {
        customPreviewImage.src = "";
        customPreviewImage.style.display = "none";
    }
    if (customPreviewPlaceholder) {
        customPreviewPlaceholder.style.display = "block";
    }
}

if (customImageUpload) {
    customImageUpload.addEventListener("change", () => {
        const file = customImageUpload.files && customImageUpload.files[0];

        if (!file) {
            clearCustomPreview();
            return;
        }

        if (customUploadedImageURL) {
            URL.revokeObjectURL(customUploadedImageURL);
        }

        customUploadedImageName = file.name;
        customUploadedImageURL = URL.createObjectURL(file);

        if (customPreviewImage) {
            customPreviewImage.src = customUploadedImageURL;
            customPreviewImage.style.display = "block";
        }

        if (customPreviewPlaceholder) {
            customPreviewPlaceholder.style.display = "none";
        }

        showToast("Custom image loaded");
    });
}

if (customSizeSelect) {
    customSizeSelect.addEventListener("change", updateCustomPreviewPrice);
}

if (customQuantity) {
    customQuantity.addEventListener("input", () => {
        if (Number(customQuantity.value) < 1) customQuantity.value = 1;
        updateCustomPreviewPrice();
    });
}

if (customFrameSelect) {
    customFrameSelect.addEventListener("change", updateCustomPreviewFrame);
}

if (customClearPreview) {
    customClearPreview.addEventListener("click", () => {
        clearCustomPreview();
        showToast("Preview cleared");
    });
}

if (customWhatsAppOrder) {
    customWhatsAppOrder.addEventListener("click", () => {
        const size = customSizeSelect ? customSizeSelect.value : "30 × 40 cm";
        const frame = customFrameSelect ? customFrameSelect.value : "Black Frame";
        const quantity = Math.max(1, Number(customQuantity?.value) || 1);
        const unitPrice = getPriceBySize(size);
        const subtotal = unitPrice * quantity;
        const discountRate = quantity >= 4 ? 0.10 : quantity >= 2 ? 0.05 : 0;
        const discount = subtotal * discountRate;
        const total = subtotal - discount;
        const note = customRequestText ? customRequestText.value.trim() : "";

        const imageStatus = customUploadedImageName
            ? `Uploaded Image: ${customUploadedImageName}`
            : "Uploaded Image: No file selected yet";

        const discountLine = discount > 0 ? `Discount (${discountRate * 100}%): -${formatPrice(discount)}\n` : "";

        const message = `WALL EVO custom poster request

Type: Custom Poster
Size: ${size}
Frame: ${frame}
Quantity: ${quantity}
Unit price: ${formatPrice(unitPrice)}
Subtotal: ${formatPrice(subtotal)}
${discountLine}Final total: ${formatPrice(total)}
${imageStatus}
Note: ${note || "No extra note"}

I will send the original image here on WhatsApp. Please confirm availability and the request. Thank you.`;

        openWhatsAppWithMessage(message);
    });
}

/* ===== CART SIDEBAR ===== */
function openCart() {
    if (!cartSidebar) return;
    lastFocusedElement = document.activeElement;
    cartSidebar.classList.add("active");
    cartSidebar.setAttribute("aria-hidden", "false");
    if (cartBackdrop) {
        cartBackdrop.hidden = false;
        requestAnimationFrame(() => cartBackdrop.classList.add("active"));
    }
    document.body.classList.add("no-scroll");
    closeCart?.focus();
}

function closeCartPanel() {
    if (!cartSidebar) return;
    cartSidebar.classList.remove("active");
    cartSidebar.setAttribute("aria-hidden", "true");
    cartBackdrop?.classList.remove("active");
    document.body.classList.remove("no-scroll");
    window.setTimeout(() => {
        if (cartBackdrop && !cartSidebar.classList.contains("active")) cartBackdrop.hidden = true;
    }, 300);
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", openCart);
}

if (closeCart && cartSidebar) {
    closeCart.addEventListener("click", closeCartPanel);
}

cartBackdrop?.addEventListener("click", closeCartPanel);
document.querySelector(".continue-shopping")?.addEventListener("click", closeCartPanel);

if (cartWhatsAppOrderBtn) {
    cartWhatsAppOrderBtn.addEventListener("click", () => {
        openWhatsAppWithMessage(buildCartMessage());
    });
}

/* ===== SCROLL ANIMATIONS ===== */
const sections = document.querySelectorAll("section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8%", threshold: 0.05 });
    sections.forEach(section => sectionObserver.observe(section));
} else {
    sections.forEach(section => section.classList.add("visible"));
}

/* ===== MOBILE NAVIGATION ===== */
function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    primaryNav?.classList.remove("active");
    menuToggle?.querySelector(".sr-only") && (menuToggle.querySelector(".sr-only").textContent = "Open menu");
}

menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav?.classList.toggle("active", !isOpen);
    menuToggle.querySelector(".sr-only").textContent = isOpen ? "Open menu" : "Close menu";
});

primaryNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

/* ===== WHATSAPP FORM ===== */
if (whatsappForm) {
    whatsappForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("wa-name").value.trim();
        const phone = document.getElementById("wa-phone").value.trim();
        const request = document.getElementById("wa-request").value.trim();

        let cartSummary = "No posters selected yet.";

        if (cart.length > 0) {
            const itemsList = cart.map((item, index) => {
                const lineTotal = item.price * item.quantity;
                return `${index + 1}. ${item.name}
Size: ${item.size}
Frame: ${item.frame}
Quantity: ${item.quantity}
Unit Price: ${formatPrice(item.price)}
Line Total: ${formatPrice(lineTotal)}`;
            }).join("\n\n");

            const discountLine = getDiscountAmount() > 0
                ? `Discount (${getDiscountRate() * 100}%): -${formatPrice(getDiscountAmount())}\n`
                : "";

            cartSummary = `Selected posters:
${itemsList}

Subtotal: ${formatPrice(getCartSubtotal())}
${discountLine}Final total: ${formatPrice(getFinalTotal())}`;
        }

        const message = `WALL EVO order request

Name: ${name}
Phone: ${phone}
Request: ${request}

${cartSummary}

Please confirm availability and the order. Thank you.`;

        openWhatsAppWithMessage(message);
    });
}

/* ===== IMAGE MODAL ===== */
function openImageModal(img) {
    if (!modalImage || !imageModal) return;
    lastFocusedElement = document.activeElement;
    modalImage.src = img.src;
    modalImage.classList.remove("frame-black", "frame-white");
    modalImage.classList.add(img.classList.contains("frame-white") ? "frame-white" : "frame-black");
    modalImage.alt = img.alt;
    imageModal.classList.add("active");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeModal?.focus();
}

function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove("active");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

document.querySelectorAll(".preview-image").forEach(img => {
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", `Open larger preview of ${img.alt}`);
    img.setAttribute("decoding", "async");
    if (!img.closest("#featured")) img.setAttribute("loading", "lazy");
    img.addEventListener("click", () => openImageModal(img));
    img.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openImageModal(img);
        }
    });
});

if (closeModal && imageModal) {
    closeModal.addEventListener("click", closeImageModal);
}

if (imageModal) {
    imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (imageModal?.classList.contains("active")) closeImageModal();
        if (cartSidebar?.classList.contains("active")) closeCartPanel();
        closeMenu();
    }

    if (e.key === "Tab" && cartSidebar?.classList.contains("active")) {
        const focusable = Array.from(cartSidebar.querySelectorAll("button, a[href], input, select, textarea"))
            .filter(element => !element.disabled && element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

/* ===== FAQ ===== */
const faqList = document.getElementById("faq-list");
if (faqList) {
    faqs.forEach(({ question, answer }) => {
        const item = document.createElement("details");
        item.className = "faq-item";
        const summary = document.createElement("summary");
        const response = document.createElement("p");
        summary.textContent = question;
        response.textContent = answer;
        item.append(summary, response);
        faqList.appendChild(item);
    });
}

/* ===== START ===== */
normalizeCart();
updateCartUI();
updateCustomPreviewPrice();
updateCustomPreviewFrame();
