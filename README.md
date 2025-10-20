# Sol de Coco - Custom Website

A beautiful, custom e-commerce website for Sol de Coco bathing suits with shopping cart and checkout functionality.

## Features

✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Brand Colors** - Uses your Sol de Coco color palette
✅ **Shopping Cart** - Full cart functionality
✅ **Size Selection** - XS to XL sizing
✅ **Checkout Ready** - Prepared for Stripe integration
✅ **Modern UI** - Clean, tropical aesthetic

---

## Quick Start

### View Locally

1. Open the file in your browser:
   ```bash
   open ~/sol-de-coco-website/index.html
   ```

2. Or start a local server:
   ```bash
   cd ~/sol-de-coco-website
   python3 -m http.server 8000
   ```
   Then visit: http://localhost:8000

---

## Deploy to Production (FREE)

### Option 1: Netlify (Recommended - Easiest)

1. **Create account** at https://netlify.com (free)

2. **Deploy via drag & drop:**
   - Log in to Netlify
   - Click "Add new site" → "Deploy manually"
   - Drag the entire `sol-de-coco-website` folder
   - Done! Your site is live in seconds

3. **Custom domain** (optional):
   - Buy domain (e.g., soldecocoswim.com) from Namecheap ($12/year)
   - In Netlify: Domain settings → Add custom domain
   - Follow DNS instructions

**Cost:** $0/month (+ $12/year for domain)

---

### Option 2: Vercel (Also Free & Fast)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd ~/sol-de-coco-website
   vercel
   ```

3. Follow prompts, and you're live!

**Cost:** $0/month

---

### Option 3: GitHub Pages (Free + Good for Portfolio)

1. **Create GitHub repo:**
   ```bash
   cd ~/sol-de-coco-website
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create sol-de-coco-website --public --source=. --push
   ```

2. **Enable GitHub Pages:**
   - Go to repo settings
   - Pages → Source → main branch
   - Save

3. **Your site** will be at: `https://vinfante1346.github.io/sol-de-coco-website`

**Cost:** $0/month

---

## Add Stripe Checkout

To enable real payment processing:

### 1. Get Stripe Account

1. Sign up at https://stripe.com
2. Get your **Publishable Key** and **Secret Key**
3. For testing, use **test mode** keys

### 2. Add Stripe to Website

Add this before `</head>`:

```html
<script src="https://js.stripe.com/v3/"></script>
```

### 3. Update Checkout Function

Replace the `checkout()` function in `index.html`:

```javascript
// Initialize Stripe (add after <script src="https://js.stripe.com/v3/">)
const stripe = Stripe('YOUR_PUBLISHABLE_KEY_HERE');

async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Create line items for Stripe
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: `${item.name} - Size ${item.size}`,
            },
            unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: 1,
    }));

    // You'll need a backend endpoint to create checkout session
    // For now, redirect to Stripe payment link (create in Stripe Dashboard)
    window.location.href = 'YOUR_STRIPE_PAYMENT_LINK';
}
```

### 4. Create Stripe Payment Links (No Code Required)

**Easiest method - No backend needed:**

1. Go to Stripe Dashboard → Payment Links
2. Create a payment link for each product
3. Replace checkout button with payment link

---

## Customize the Website

### Update Products

Edit the `.product-grid` section in `index.html`:

```html
<div class="product-card">
    <div class="product-image">🌴</div>
    <div class="product-info">
        <div class="product-name">YOUR PRODUCT NAME</div>
        <div class="product-price">$XX.XX</div>
        <!-- ... rest of product card ... -->
    </div>
</div>
```

### Add Real Product Images

Replace emoji placeholders with real images:

```html
<!-- Instead of: -->
<div class="product-image">🌴</div>

<!-- Use: -->
<div class="product-image">
    <img src="images/tropical-paradise-bikini.jpg" alt="Tropical Paradise Bikini">
</div>
```

Then add CSS:
```css
.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

### Change Colors

All brand colors are at the top of the `<style>` section:

- Primary Orange: `#fa5b26`
- Blue: `#6092b9`
- Pink: `#f5bce9`
- Cream: `#f8f0d6`
- Light Blue: `#c7dcf9`
- Lavender: `#efe2f3`

---

## Add Product Images

1. **Create images folder:**
   ```bash
   mkdir ~/sol-de-coco-website/images
   ```

2. **Add your product photos** (optimized JPGs/PNGs)

3. **Update HTML** with image paths

---

## Next Level Features

### Add Email Collection

Use Mailchimp or Klaviyo:

```html
<!-- Add to footer or homepage -->
<form action="YOUR_MAILCHIMP_ACTION_URL" method="post">
    <input type="email" name="EMAIL" placeholder="Your email for updates">
    <button type="submit">Subscribe</button>
</form>
```

### Add Google Analytics

```html
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

### Add TikTok Pixel

```html
<!-- Add before </head> -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;
  // ... TikTok pixel code
}(window, document, 'ttq');
ttq.load('YOUR_TIKTOK_PIXEL_ID');
ttq.page();
</script>
```

---

## Maintenance

### Update Products

Edit `index.html` directly and redeploy.

### Track Sales

- Stripe Dashboard shows all transactions
- Download reports for accounting
- View customer details

### Manage Inventory

Currently manual. To add inventory tracking:
1. Use a database (Firebase, Supabase)
2. Or integrate with Shopify backend
3. Or use a simple spreadsheet

---

## Support

### Issues?

- Check browser console for errors (F12 → Console)
- Test on different devices
- Ensure all files are uploaded

### Need Help?

- Stripe Docs: https://stripe.com/docs
- Netlify Docs: https://docs.netlify.com
- Web hosting questions: Search Stack Overflow

---

## Comparison: Custom Website vs Shopify

| Feature | Custom Website | Shopify |
|---------|---------------|---------|
| **Setup Time** | 1-2 hours | 1-2 days |
| **Monthly Cost** | $0 (just domain) | $39-79 |
| **Transaction Fees** | 2.9% + 30¢ (Stripe) | 2.9% + 30¢ |
| **TikTok Shop** | Manual sync | Auto sync |
| **Inventory** | Manual | Automatic |
| **Customization** | Full control | Limited by theme |
| **Maintenance** | You manage | Shopify manages |
| **Multi-channel** | Manual | Built-in |
| **Best for** | Tech-savvy, tight budget | Scaling, multi-platform |

---

## File Structure

```
sol-de-coco-website/
├── index.html              # Main website file
├── README.md              # This file
├── SHOPIFY-GUIDE.md       # Shopify setup guide
└── images/                # Your product images (create this)
```

---

## What's Next?

1. ✅ **Test the website** - Open `index.html` in your browser
2. **Add real product images** - Replace emoji placeholders
3. **Choose deployment** - Netlify, Vercel, or GitHub Pages
4. **Set up Stripe** - For payment processing
5. **Buy domain** - Make it professional
6. **Add products** - At least 6-10 to start
7. **Create content** - Photos, descriptions, size guides
8. **Launch!** - Share on social media

---

## Pro Tips

1. **Take professional photos** - Invest in good product photography
2. **Size guide is crucial** - Bathing suits need accurate sizing
3. **Mobile-first** - Most customers shop on phones
4. **Fast loading** - Optimize images (use TinyPNG.com)
5. **Social proof** - Add customer reviews once you have sales
6. **Return policy** - Be clear about returns/exchanges for swimwear

---

## Questions?

This website is fully functional and ready to customize. The Shopify guide is also included if you prefer that route.

Both options are great - choose based on your comfort level and budget!
