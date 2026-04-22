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
let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
const checkoutBtn = document.getElementById("checkout");
const cartWhatsAppOrderBtn = document.getElementById("cart-whatsapp-order");
const toast = document.getElementById("toast");
const whatsappForm = document.getElementById("whatsapp-form");

const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const closeModal = document.getElementById("close-modal");

/* ===== CUSTOM POSTER ELEMENTS ===== */
const customImageUpload = document.getElementById("custom-image-upload");
const customSizeSelect = document.getElementById("custom-size-select");
const customFrameSelect = document.getElementById("custom-frame-select");
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

/* ===== HELPERS ===== */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function normalizeCart() {
    cart = cart.map(item => ({
        name: item.name || "Poster",
        price: Number(item.price) || getPriceBySize(item.size || "30 × 40 cm"),
        size: item.size || "30 × 40 cm",
        frame: item.frame || "Black Frame",
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1
    }));
    saveCart();
}

function formatPrice(price) {
    return `${price} DH`;
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

    if (rate === 0.10) return "10% discount applied";
    if (rate === 0.05) return "5% discount applied";
    return "No discount applied";
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
        return "Hello, I want to order from Wall Evo, but my cart is currently empty.";
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

    return `Hello, I want to order from Wall Evo.

My cart items:
${itemsList}

Subtotal: ${formatPrice(getCartSubtotal())}
Discount: ${formatPrice(getDiscountAmount())}
Final Total: ${formatPrice(getFinalTotal())}`;
}

/* ===== CART UI ===== */
function updateCartUI() {
    if (!cartCount || !cartItems) return;

    cartCount.innerText = getCartCount();
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `<li class="empty-cart-message">Your cart is empty. Add posters and order via WhatsApp.</li>`;
    } else {
        cart.forEach((item, index) => {
            const lineTotal = item.price * item.quantity;

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="cart-item-main">
                    <div class="cart-item-text">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-meta">Size: ${item.size}</div>
                        <div class="cart-item-meta">Frame: ${item.frame}</div>
                        <div class="cart-item-meta">Unit Price: ${formatPrice(item.price)}</div>
                        <div class="cart-line-total">Line Total: ${formatPrice(lineTotal)}</div>
                    </div>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>

                <div class="quantity-controls">
                    <button class="qty-btn decrease-qty" data-index="${index}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn increase-qty" data-index="${index}">+</button>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }

    if (cartSubtotal) cartSubtotal.textContent = formatPrice(getCartSubtotal());
    if (cartDiscount) cartDiscount.textContent = `-${formatPrice(getDiscountAmount())}`;
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

        const existingIndex = findCartItemIndex(name, size, frame);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                name,
                price: finalPrice,
                size,
                frame,
                quantity: 1
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

        const message = `Hello, I want to order this poster from Wall Evo:

Product: ${name}
Size: ${size}
Frame: ${frame}
Quantity: 1
Price: ${formatPrice(finalPrice)}`;

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
    const price = getPriceBySize(size);

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
        const price = getPriceBySize(size);
        const note = customRequestText ? customRequestText.value.trim() : "";

        const imageStatus = customUploadedImageName
            ? `Uploaded Image: ${customUploadedImageName}`
            : "Uploaded Image: No file selected yet";

        const message = `Hello, I want to order a custom poster from Wall Evo.

Type: Custom Poster
Size: ${size}
Frame: ${frame}
Price: ${formatPrice(price)}
${imageStatus}
Note: ${note || "No extra note"}

Please note: I will send the original image here on WhatsApp.`;

        openWhatsAppWithMessage(message);
    });
}

/* ===== CART SIDEBAR ===== */
if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", () => cartSidebar.classList.add("active"));
}

if (closeCart && cartSidebar) {
    closeCart.addEventListener("click", () => cartSidebar.classList.remove("active"));
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        alert("Checkout not implemented in this demo.");
    });
}

if (cartWhatsAppOrderBtn) {
    cartWhatsAppOrderBtn.addEventListener("click", () => {
        openWhatsAppWithMessage(buildCartMessage());
    });
}

/* ===== SCROLL ANIMATIONS ===== */
const sections = document.querySelectorAll("section");

function revealSections() {
    const triggerBottom = window.innerHeight / 1.2;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < triggerBottom) {
            section.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", revealSections);
revealSections();

/* ===== WHATSAPP FORM ===== */
if (whatsappForm) {
    whatsappForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("wa-name").value.trim();
        const phone = document.getElementById("wa-phone").value.trim();
        const request = document.getElementById("wa-request").value.trim();

        let cartSummary = "Cart: No items selected";

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

            cartSummary = `Cart Items:
${itemsList}

Subtotal: ${formatPrice(getCartSubtotal())}
Discount: ${formatPrice(getDiscountAmount())}
Final Total: ${formatPrice(getFinalTotal())}`;
        }

        const message = `Hello, I want to order from Wall Evo.

Name: ${name}
Phone Number: ${phone}
Request: ${request}

${cartSummary}`;

        openWhatsAppWithMessage(message);
    });
}

/* ===== IMAGE MODAL ===== */
document.querySelectorAll(".preview-image").forEach(img => {
    img.addEventListener("click", () => {
        if (!modalImage || !imageModal) return;
        modalImage.src = img.src;
        modalImage.classList.remove("frame-black", "frame-white");

if (img.classList.contains("frame-white")) {
    modalImage.classList.add("frame-white");
} else {
    modalImage.classList.add("frame-black");
}   
        modalImage.alt = img.alt;
        imageModal.classList.add("active");
    });
});

if (closeModal && imageModal) {
    closeModal.addEventListener("click", () => {
        imageModal.classList.remove("active");
    });
}

if (imageModal) {
    imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove("active");
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && imageModal) {
        imageModal.classList.remove("active");
    }
});

/* ===== START ===== */
normalizeCart();
updateCartUI();
updateCustomPreviewPrice();
updateCustomPreviewFrame();

/* ===== FRAME CHANGE LIVE ===== */

document.querySelectorAll(".product-card").forEach(card => {
    const frameSelect = card.querySelector(".frame-select");
    const image = card.querySelector(".preview-image");

    if (!frameSelect || !image) return;

    frameSelect.addEventListener("change", () => {
        image.classList.remove("frame-black", "frame-white");

        if (frameSelect.value === "White Frame") {
            image.classList.add("frame-white");
        } else {
            image.classList.add("frame-black");
        }
    });
});