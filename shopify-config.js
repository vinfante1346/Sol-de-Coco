/**
 * Shopify Integration for Sol de Coco
 *
 * SETUP INSTRUCTIONS:
 * 1. Complete Shopify setup (see SHOPIFY-SETUP.md)
 * 2. Add your products to Shopify admin
 * 3. Get your Storefront API access token
 * 4. Update SHOPIFY_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN below
 * 5. Update PRODUCT_IDS with your actual Shopify product IDs
 */

// ========== CONFIGURATION (UPDATE THESE) ==========
const SHOPIFY_CONFIG = {
    // Your Shopify store domain (e.g., 'sol-de-coco.myshopify.com')
    SHOPIFY_DOMAIN: 'YOUR-STORE.myshopify.com',

    // Your Storefront API access token (get this from Shopify admin)
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'YOUR_STOREFRONT_ACCESS_TOKEN_HERE',

    // Map your product IDs to Shopify product IDs (get these after adding products to Shopify)
    PRODUCT_IDS: {
        1: 'gid://shopify/Product/PRODUCT_ID_1', // Tropical Paradise
        2: 'gid://shopify/Product/PRODUCT_ID_2', // Coconut Dream
        3: 'gid://shopify/Product/PRODUCT_ID_3', // Ocean Wave
        4: 'gid://shopify/Product/PRODUCT_ID_4', // Sunset Glow
        5: 'gid://shopify/Product/PRODUCT_ID_5', // Island Breeze
        6: 'gid://shopify/Product/PRODUCT_ID_6'  // Hibiscus Bloom
    },

    // Set to false until you've configured the above
    IS_CONFIGURED: false
};

// ========== SHOPIFY STOREFRONT API CLIENT ==========
class ShopifyClient {
    constructor(config) {
        this.domain = config.SHOPIFY_DOMAIN;
        this.accessToken = config.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
        this.endpoint = `https://${this.domain}/api/2024-01/graphql.json`;
        this.checkoutId = localStorage.getItem('shopify_checkout_id');
    }

    async query(query, variables = {}) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': this.accessToken
            },
            body: JSON.stringify({ query, variables })
        });

        const data = await response.json();
        if (data.errors) {
            console.error('Shopify API Error:', data.errors);
            throw new Error(data.errors[0].message);
        }
        return data.data;
    }

    // Create a new checkout
    async createCheckout() {
        const mutation = `
            mutation checkoutCreate($input: CheckoutCreateInput!) {
                checkoutCreate(input: $input) {
                    checkout {
                        id
                        webUrl
                        lineItems(first: 10) {
                            edges {
                                node {
                                    id
                                    title
                                    quantity
                                    variant {
                                        id
                                        title
                                        priceV2 {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                        totalPriceV2 {
                            amount
                            currencyCode
                        }
                    }
                }
            }
        `;

        const data = await this.query(mutation, {
            input: {}
        });

        this.checkoutId = data.checkoutCreate.checkout.id;
        localStorage.setItem('shopify_checkout_id', this.checkoutId);
        return data.checkoutCreate.checkout;
    }

    // Add item to checkout
    async addToCheckout(variantId, quantity = 1) {
        if (!this.checkoutId) {
            await this.createCheckout();
        }

        const mutation = `
            mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
                checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
                    checkout {
                        id
                        webUrl
                        lineItems(first: 10) {
                            edges {
                                node {
                                    id
                                    title
                                    quantity
                                }
                            }
                        }
                        totalPriceV2 {
                            amount
                        }
                    }
                    checkoutUserErrors {
                        message
                        field
                    }
                }
            }
        `;

        const data = await this.query(mutation, {
            checkoutId: this.checkoutId,
            lineItems: [{ variantId, quantity }]
        });

        if (data.checkoutLineItemsAdd.checkoutUserErrors.length > 0) {
            throw new Error(data.checkoutLineItemsAdd.checkoutUserErrors[0].message);
        }

        return data.checkoutLineItemsAdd.checkout;
    }

    // Get product by ID
    async getProduct(productId) {
        const query = `
            query getProduct($id: ID!) {
                product(id: $id) {
                    id
                    title
                    description
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                priceV2 {
                                    amount
                                    currencyCode
                                }
                                availableForSale
                            }
                        }
                    }
                }
            }
        `;

        const data = await this.query(query, { id: productId });
        return data.product;
    }

    // Get variant ID by size
    getVariantIdBySize(product, size) {
        const variant = product.variants.edges.find(edge =>
            edge.node.title.includes(size)
        );
        return variant ? variant.node.id : null;
    }

    // Open Shopify checkout
    openCheckout(checkoutUrl) {
        window.location.href = checkoutUrl;
    }
}

// ========== INTEGRATION WITH EXISTING SITE ==========

// Initialize Shopify client if configured
let shopifyClient = null;

if (SHOPIFY_CONFIG.IS_CONFIGURED) {
    shopifyClient = new ShopifyClient(SHOPIFY_CONFIG);
    console.log('✅ Shopify integration active');
} else {
    console.log('⚠️ Shopify not configured yet. Using local cart.');
}

// Enhanced addToCart function that works with Shopify
async function addToCartWithShopify(name, price, productId) {
    // Access global variables from index.html
    const selectedSizes = window.selectedSizes || {};
    const size = selectedSizes[productId];

    if (!SHOPIFY_CONFIG.IS_CONFIGURED || !shopifyClient) {
        // Fallback to local cart if Shopify not configured
        addToCartLocal(name, price, productId);
        return;
    }

    try {
        // Get Shopify product
        const shopifyProductId = SHOPIFY_CONFIG.PRODUCT_IDS[productId];
        const product = await shopifyClient.getProduct(shopifyProductId);

        // Find variant by size
        const variantId = shopifyClient.getVariantIdBySize(product, size);

        if (!variantId) {
            throw new Error(`Size ${size} not available`);
        }

        // Add to Shopify checkout
        const checkout = await shopifyClient.addToCheckout(variantId, 1);

        // Update local cart display
        updateLocalCartFromShopify(checkout);

        // Show success message
        if (typeof window.showToast === 'function') {
            window.showToast(`${name} (Size ${size}) added to cart! 🎉`);
        }

        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                currency: 'USD',
                value: price,
                items: [{
                    item_id: productId,
                    item_name: name,
                    item_variant: size,
                    price: price,
                    quantity: 1
                }]
            });
        }

    } catch (error) {
        console.error('Error adding to cart:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Oops! Something went wrong. Please try again.');
        }
    }
}

// Update local cart display from Shopify checkout data
function updateLocalCartFromShopify(checkout) {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const itemCount = checkout.lineItems.edges.length;
    cartCount.textContent = itemCount;

    if (itemCount === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛍️</div>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9em; margin-top: 10px; opacity: 0.6;">Add some tropical vibes!</p>
            </div>
        `;
        cartTotal.textContent = '$0';
        return;
    }

    let html = '';
    checkout.lineItems.edges.forEach((edge) => {
        const item = edge.node;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.title}</div>
                    <div class="cart-item-size">${item.variant.title}</div>
                </div>
                <div class="cart-item-price">$${parseFloat(item.variant.priceV2.amount).toFixed(0)}</div>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = `$${parseFloat(checkout.totalPriceV2.amount).toFixed(0)}`;

    // Store checkout URL for later
    localStorage.setItem('shopify_checkout_url', checkout.webUrl);
}

// Local cart fallback (existing functionality)
function addToCartLocal(name, price, productId) {
    const selectedSizes = window.selectedSizes || {};
    const cart = window.cart || [];
    const size = selectedSizes[productId];

    cart.push({
        name: name,
        price: price,
        size: size
    });

    if (typeof window.updateCart === 'function') {
        window.updateCart();
    }

    if (typeof window.showToast === 'function') {
        window.showToast(`${name} (Size ${size}) added to cart! 🎉`);
    }
}

// Enhanced checkout function
function checkout() {
    if (SHOPIFY_CONFIG.IS_CONFIGURED && shopifyClient) {
        // Redirect to Shopify checkout
        const checkoutUrl = localStorage.getItem('shopify_checkout_url');
        if (checkoutUrl) {
            // Track begin_checkout event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                    currency: 'USD',
                    value: parseFloat(document.getElementById('cartTotal').textContent.replace('$', ''))
                });
            }

            window.location.href = checkoutUrl;
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('Please add items to your cart first!');
            }
        }
    } else {
        // Local checkout (placeholder)
        if (typeof window.showToast === 'function') {
            window.showToast('Checkout functionality will be available soon! 🌴');
        }
        console.log('Cart contents:', window.cart || []);
    }
}

// Export for use in index.html
if (typeof window !== 'undefined') {
    window.addToCartWithShopify = addToCartWithShopify;
    window.checkout = checkout;
}
