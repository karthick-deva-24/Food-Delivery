document.addEventListener('DOMContentLoaded', () => {
    // Process logo image to remove black background and tint to exactly #e0b400 (RGB: 224, 180, 0)
    const logoImgs = document.querySelectorAll('.logo-img');
    logoImgs.forEach(img => {
        const handleLogoLoad = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    
                    // If the pixel is close to black (background), make it transparent
                    if (r < 25 && g < 25 && b < 25) {
                        data[i+3] = 0; // alpha = 0
                    } else {
                        // Tint all non-black pixels to exact brand gold #e0b400 (RGB: 224, 180, 0)
                        data[i] = 224;   // R
                        data[i+1] = 180; // G
                        data[i+2] = 0;   // B
                    }
                }
                
                ctx.putImageData(imgData, 0, 0);
                img.src = canvas.toDataURL();
            } catch (e) {
                console.error("Error processing logo image:", e);
            }
        };
        
        if (img.complete) {
            handleLogoLoad();
        } else {
            img.addEventListener('load', handleLogoLoad, { once: true });
        }
    });

    // Register GSAP ScrollTrigger Plugin if GSAP is available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Dynamic injection of Live Animation divs (Scroll progress & Custom Cursor)
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);


    // Dynamic injection of Ambient Background Blobs
    for (let i = 1; i <= 3; i++) {
        const blob = document.createElement('div');
        blob.className = `bg-blob blob-${i}`;
        document.body.appendChild(blob);
    }

    // 1. Preloader Animation & Screen Out (GSAP)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            const tl = gsap.timeline({
                onComplete: () => {
                    preloader.style.display = 'none';
                    playHeroAnimations();
                }
            });

            tl.to('.takeout-box-svg', { scale: 0, rotation: 180, duration: 0.6, ease: 'back.in(1.7)' })
              .to('.loader-text', { opacity: 0, y: -20, duration: 0.3 }, '-=0.4')
              .to(preloader, { opacity: 0, duration: 0.5, ease: 'power2.out' });
        });

        // Fallback safety timeout
        setTimeout(() => {
            if (preloader.style.display !== 'none') {
                gsap.to(preloader, { opacity: 0, duration: 0.5, onComplete: () => preloader.style.display = 'none' });
                playHeroAnimations();
            }
        }, 3000);
    } else {
        playHeroAnimations();
    }

    // 2. Hero Entrance Animations (GSAP)
    function playHeroAnimations() {
        if (typeof gsap === 'undefined') return;
        
        // Header logo & nav items slide down
        gsap.from('header', { y: -100, opacity: 0, duration: 1, ease: 'power4.out' });
        
        // Active slide elements stagger slide up & fade in
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            const subtitle = activeSlide.querySelector('.slide-subtitle');
            const title = activeSlide.querySelector('.slide-title');
            const btn = activeSlide.querySelector('.btn-primary');
            
            gsap.fromTo([subtitle, title, btn], 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out', delay: 0.3 }
            );
        }
    }

    // 3. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-out-cubic',
            offset: 100,
            delay: 100
        });
    }

    // 4. Scroll progress indicator (Live GSAP animations)

    // Update progress bar width on scroll
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // 5. Parallax scroll effect on banners (GSAP ScrollTrigger)
    if (typeof gsap !== 'undefined' && document.querySelector('.offer-banner')) {
        gsap.to('.offer-img', {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.offer-banner',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // 6. Section Header Stagger Text Reveal (GSAP ScrollTrigger)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const headers = document.querySelectorAll('.section-title');
        headers.forEach(h => {
            gsap.from(h, {
                scrollTrigger: {
                    trigger: h,
                    start: 'top 85%'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });
        });
    }

    // 7. Dish Cards hover tilt effect (GSAP mousemove tracking)
    const cards = document.querySelectorAll('.dish-card, .chef-card, .category-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (typeof gsap === 'undefined') return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const angleX = (yc - y) / 15; // tilt limit
            const angleY = (x - xc) / 15;
            
            gsap.to(card, {
                rotationX: angleX,
                rotationY: angleY,
                transformPerspective: 800,
                ease: 'power1.out',
                duration: 0.3,
                overwrite: 'auto'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                ease: 'power2.out',
                duration: 0.5,
                overwrite: 'auto'
            });
        });
    });

    // 8. Mobile Menu Navigation toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active') && typeof gsap !== 'undefined') {
                gsap.fromTo('.nav-menu li', 
                    { opacity: 0, x: -50 },
                    { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
                );
            }
        });
    }

    // 9. Hero Slider functionality
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const nextBtn = document.querySelector('.slider-btn.next');
        const prevBtn = document.querySelector('.slider-btn.prev');

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            
            if (typeof gsap !== 'undefined') {
                const s = slides[currentSlide];
                const subtitle = s.querySelector('.slide-subtitle');
                const title = s.querySelector('.slide-title');
                const btn = s.querySelector('.btn-primary');
                
                gsap.killTweensOf([subtitle, title, btn]);
                gsap.fromTo([subtitle, title, btn], 
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
                );
            }
        }

        if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));

        // Auto play slider
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    // 10. FAQ Accordion Collapsing logic
    const faqHeaders = document.querySelectorAll('.faq-header');
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 11. Interactive Cart Drawer & Operations
    // Inject Cart Drawer structure dynamically into DOM
    const drawerHtml = `
        <div id="cart-drawer" class="cart-drawer">
            <div class="cart-drawer-header">
                <h3>Your Order Plate</h3>
                <button class="cart-drawer-close" aria-label="Close Cart"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-drawer-items">
                <div class="cart-empty-message">Your plate is empty. Add some sizzling Turkish grills!</div>
            </div>
            <div class="cart-drawer-footer">
                <div class="cart-total-row">
                    <span>Total:</span>
                    <span class="cart-total-amount">$0.00</span>
                </div>
                <button class="btn-checkout">Checkout Now</button>
            </div>
        </div>
        <div id="cart-overlay" class="cart-overlay"></div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = drawerHtml;
    document.body.appendChild(tempDiv.querySelector('#cart-drawer'));
    document.body.appendChild(tempDiv.querySelector('#cart-overlay'));

    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeBtn = document.querySelector('.cart-drawer-close');
    const checkoutBtn = document.querySelector('.btn-checkout');
    const cartBtn = document.querySelector('button[aria-label="Cart"], a[aria-label="Profile"] + button, .nav-actions button:has(.cart-badge)'); 
    const cartBadge = document.querySelector('.cart-badge');
    const drawerItemsContainer = document.querySelector('.cart-drawer-items');
    const cartTotalAmount = document.querySelector('.cart-total-amount');

    // Cart Data Array (in-memory persistent across page actions using sessionStorage)
    let cart = JSON.parse(sessionStorage.getItem('Stackly_cart')) || [];

    // Helper: Save cart to sessionStorage
    function saveCart() {
        sessionStorage.setItem('Stackly_cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Helper: Update Badge & Total & Render items
    function updateCartUI() {
        if (!drawerItemsContainer) return;

        // Update badge
        let totalCount = 0;
        let totalPrice = 0;
        
        if (cart.length === 0) {
            drawerItemsContainer.innerHTML = '<div class="cart-empty-message">Your plate is empty. Add some sizzling Turkish grills!</div>';
        } else {
            drawerItemsContainer.innerHTML = '';
            cart.forEach(item => {
                totalCount += item.qty;
                totalPrice += item.price * item.qty;

                const itemRow = document.createElement('div');
                itemRow.className = 'cart-item';
                itemRow.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">$${(item.price).toFixed(2)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn minus-qty" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn plus-qty" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                `;
                drawerItemsContainer.appendChild(itemRow);
            });
        }

        if (cartBadge) {
            cartBadge.textContent = totalCount;
        }
        if (cartTotalAmount) {
            cartTotalAmount.textContent = `$${totalPrice.toFixed(2)}`;
        }

        // Add event listeners to newly created elements inside cart
        document.querySelectorAll('.plus-qty').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.qty++;
                    saveCart();
                }
            };
        });

        document.querySelectorAll('.minus-qty').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.qty--;
                    if (item.qty <= 0) {
                        cart = cart.filter(i => i.id !== id);
                    }
                    saveCart();
                }
            };
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(i => i.id !== id);
                saveCart();
            };
        });
    }

    // Toggle Cart Drawer
    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
        }
    }

    function closeCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
    }

    if (cartBtn) {
        cartBtn.onclick = (e) => { 
            e.preventDefault(); 
            openCart(); 
        };
    }
    if (closeBtn) closeBtn.onclick = closeCart;
    if (cartOverlay) cartOverlay.onclick = closeCart;
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) {
                alert('Your cart is empty! Add some delicious Turkish dishes first.');
            } else {
                window.location.href = '404.html';
            }
        };
    }

    // Bind Add to Cart Buttons
    const cartButtons = document.querySelectorAll('.btn-add-cart, .btn-primary[data-cart]');
    cartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Find card container
            const card = btn.closest('.dish-card, .chef-special-banner');
            if (!card) return;

            let title = '';
            let priceText = '';
            let imgSrc = '';

            if (card.classList.contains('chef-special-banner')) {
                title = card.querySelector('h2').textContent;
                priceText = card.querySelector('div[style*="font-size: 2rem"]').textContent;
                imgSrc = card.querySelector('.special-img').src;
            } else {
                title = card.querySelector('.dish-title').textContent;
                priceText = card.querySelector('.dish-price').textContent;
                imgSrc = card.querySelector('.dish-img').src;
            }

            const price = parseFloat(priceText.replace('$', '').trim());
            const id = title.replace(/\s+/g, '-').toLowerCase();

            // Check if item already exists in cart
            const existingItem = cart.find(i => i.id === id);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ id, title, price, img: imgSrc, qty: 1 });
            }

            saveCart();

            // Animate Badge
            if (cartBadge && typeof gsap !== 'undefined') {
                gsap.fromTo(cartBadge, 
                    { scale: 0.6 }, 
                    { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }
                );
            }

            showToastNotification(`${title} added to your plate!`);
        });
    });

    // Initial render
    updateCartUI();

    function showToastNotification(msg) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: #b81d24;
                color: #ffffff;
                padding: 16px 30px;
                border-radius: 50px;
                font-weight: 700;
                box-shadow: 0 10px 30px rgba(184, 29, 36, 0.3);
                z-index: 10000;
                transform: translateY(100px);
                opacity: 0;
                display: flex;
                align-items: center;
                gap: 10px;
                border: 2px solid #ffcc00;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="color:#ffcc00">✔</span> ${msg}`;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(toast, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
            gsap.to(toast, { y: 100, opacity: 0, duration: 0.4, ease: 'power2.in', delay: 3 });
        } else {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
            }, 3000);
        }
    }

    // 12. Menu Page filter tabs logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.dish-card[data-category]');
    if (filterButtons.length > 0 && menuItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                menuItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(item, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
                        }
                    } else {
                        if (typeof gsap !== 'undefined') {
                            gsap.to(item, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => item.style.display = 'none' });
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

    // 13. Login panel switcher
    const tabs = document.querySelectorAll('.login-tab');
    const loginForm = document.getElementById('login-form-box');
    const registerForm = document.getElementById('register-form-box');
    
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const formType = tab.getAttribute('data-tab');
                if (formType === 'login') {
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(loginForm, { opacity: 0, x: -30 }, { display: 'block', opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
                        registerForm.style.display = 'none';
                    } else {
                        loginForm.style.display = 'block';
                        registerForm.style.display = 'none';
                    }
                } else {
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(registerForm, { opacity: 0, x: 30 }, { display: 'block', opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
                        loginForm.style.display = 'none';
                    } else {
                        loginForm.style.display = 'none';
                        registerForm.style.display = 'block';
                    }
                }
            });
        });
    }
});

// Global newsletter subscribe handler — redirects to 404.html on submit
window.handleNewsletterSubscribe = function(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) return;

    window.location.href = '404.html';
};
