document.addEventListener('DOMContentLoaded', () => {
    // Initial timeline progress setting
    updateFoodieTimeline('preparing');

    // Display user profile email and name from localStorage
    const userName = (localStorage.getItem('userName') || 'GUEST').toUpperCase();
    const userEmail = (localStorage.getItem('userEmail') || 'guest@Stackly.com').toUpperCase();
    const badge = document.getElementById('user-display-name');
    if (badge) {
        badge.textContent = userName;
    }
    const infoBadge = document.getElementById('user-info-badge');
    if (infoBadge) {
        infoBadge.title = userEmail;
    }

    // Parse URL parameter and switch dashboard accordingly
    const urlParams = new URLSearchParams(window.location.search);
    let role = urlParams.get('role');
    if (role !== 'foodie' && role !== 'manager') {
        role = 'foodie'; // default fallback
    }
    switchRole(role);
    
    // Highlight nav links on scroll or click
    setupNavHighlights();
});

// User Logout Action
function logoutUser() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Role Switcher Logic
function switchRole(role) {
    const foodieDash = document.getElementById('foodie-dashboard');
    const managerDash = document.getElementById('manager-dashboard');
    const dashboardNav = document.getElementById('dashboard-nav');

    if (!foodieDash || !managerDash) return;

    // Update URL query parameter without page refresh
    const url = new URL(window.location);
    if (url.searchParams.get('role') !== role) {
        url.searchParams.set('role', role);
        window.history.pushState({}, '', url);
    }

    // Toggle active classes
    if (role === 'foodie') {
        managerDash.classList.remove('active');
        foodieDash.classList.add('active');
        activateSubpage('#foodie-dashboard');
    } else {
        foodieDash.classList.remove('active');
        managerDash.classList.add('active');
        activateSubpage('#manager-dashboard');
    }

    // Dynamically populate dashboard nav bar menu links
    if (dashboardNav) {
        if (role === 'foodie') {
            dashboardNav.innerHTML = `
                <li><a href="#foodie-dashboard" class="active">Foodie Console</a></li>
                <li><a href="#order-tracker">Order Tracker</a></li>
                <li><a href="#special-perks">Rewards &amp; Perks</a></li>
                <li><a href="#just-for-you">Just For You</a></li>
                <li><a href="#order-history">Order History</a></li>
            `;
        } else {
            dashboardNav.innerHTML = `
                <li><a href="#manager-dashboard" class="active">Manager Console</a></li>
                <li><a href="#manager-kpis">KPI Stats</a></li>
                <li><a href="#manager-orders">Order Queue</a></li>
                <li><a href="#manager-menu">Manage Menu</a></li>
            `;
        }
        
        // Re-setup nav highlight tracking and click listeners for the new elements
        setupNavHighlights();
    }
}

// Subpage Tab Routing
function activateSubpage(targetId) {
    if (!targetId || !targetId.startsWith('#')) return;

    // Define the subpage mappings
    const mapping = {
        '#foodie-dashboard': 'foodie-dashboard-subpage',
        '#order-tracker': 'order-tracker-subpage',
        '#special-perks': 'special-perks-subpage',
        '#just-for-you': 'just-for-you-subpage',
        '#order-history': 'order-history-subpage',
        '#manager-dashboard': 'manager-dashboard-subpage',
        '#manager-kpis': 'manager-kpis-subpage',
        '#manager-orders': 'manager-orders-subpage',
        '#manager-menu': 'manager-menu-subpage'
    };

    const targetSubpageId = mapping[targetId];
    if (!targetSubpageId) return;

    const targetSubpage = document.getElementById(targetSubpageId);
    if (!targetSubpage) return;

    const parentContainer = targetSubpage.closest('.dashboard-container');
    if (!parentContainer) return;

    // Hide all subpages inside this container
    parentContainer.querySelectorAll('.subpage-content').forEach(sub => {
        sub.classList.remove('active');
    });

    // Show the targeted subpage
    targetSubpage.classList.add('active');

    // Trigger entrance animation using GSAP if available
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(targetSubpage,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
    }
}

// Dynamic Navigation Highlighting on Click
function setupNavHighlights() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Switch subpage active view on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault(); // Prevent default browser jump

                // Remove active class from siblings
                link.closest('.nav-menu').querySelectorAll('a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');

                // Route to virtual subpage
                activateSubpage(targetId);

                // If mobile menu is open, toggle it closed
                if (menuToggle && navMenu) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });
}

// Store Status Operations
function toggleStoreStatus() {
    const isChecked = document.getElementById('store-toggle').checked;
    const statusText = document.getElementById('store-status-text');
    const kitchenLoad = document.getElementById('kitchen-load');

    if (isChecked) {
        statusText.textContent = 'OPEN';
        statusText.style.color = '#2e7d32';
        kitchenLoad.textContent = 'NORMAL';
        kitchenLoad.style.color = 'var(--primary)';
        showDashboardToast('Store status updated: OPEN & accepting orders.');
    } else {
        statusText.textContent = 'CLOSED';
        statusText.style.color = '#b71c1c';
        kitchenLoad.textContent = 'OFFLINE';
        kitchenLoad.style.color = '#777';
        showDashboardToast('Store status updated: CLOSED. Online Ordering paused.');
    }
}

// Advance Order Status Logic
function advanceOrderStatus(orderId) {
    const badge = document.getElementById(`status-${orderId}`);
    if (!badge) return;

    const currentStatus = badge.textContent.trim().toLowerCase();
    let nextStatus = '';
    let nextClass = '';

    if (currentStatus === 'preparing') {
        nextStatus = 'delivering';
        nextClass = 'badge-delivering';
    } else if (currentStatus === 'delivering') {
        nextStatus = 'completed';
        nextClass = 'badge-completed';
    } else {
        return; // Already completed/archived
    }

    // Update status in manager table
    badge.textContent = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
    badge.className = `badge ${nextClass}`;

    // If it's the Foodie's active order, update Foodie's timeline live!
    if (orderId === '89240') {
        updateFoodieTimeline(nextStatus);
    }

    // If completed, update counters and action button
    if (nextStatus === 'completed') {
        const actionBtnCell = badge.closest('tr').querySelector('td:last-child');
        actionBtnCell.innerHTML = '<span style="color:#2e7d32; font-weight:700; font-size:0.9rem;">Archived</span>';
        
        // Decrement active orders count
        const countBadge = document.getElementById('active-orders-count');
        if (countBadge) {
            let activeCount = parseInt(countBadge.textContent) || 0;
            if (activeCount > 0) countBadge.textContent = activeCount - 1;
        }
    }

    showDashboardToast(`Order #${orderId} advanced to ${nextStatus.toUpperCase()}.`);
}

// Sync foodie timeline representation
function updateFoodieTimeline(status) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const step4 = document.getElementById('step-4');
    const timelineBar = document.getElementById('timeline-bar');
    const statusBadge = document.getElementById('order-status-badge');
    const estimateTime = document.getElementById('estimate-time');

    if (!step1 || !step2 || !step3 || !step4 || !timelineBar) return;

    // Reset status classes
    [step1, step2, step3, step4].forEach(step => {
        step.classList.remove('active', 'completed');
    });

    if (status === 'preparing') {
        step1.classList.add('completed');
        step2.classList.add('active');
        timelineBar.style.width = '33%';
        if (statusBadge) {
            statusBadge.textContent = 'Preparing';
            statusBadge.className = 'badge badge-preparing';
        }
        if (estimateTime) estimateTime.textContent = '20 mins';
    } else if (status === 'delivering') {
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.add('active');
        timelineBar.style.width = '66%';
        if (statusBadge) {
            statusBadge.textContent = 'Out for Delivery';
            statusBadge.className = 'badge badge-delivering';
        }
        if (estimateTime) estimateTime.textContent = '8 mins';
    } else if (status === 'completed') {
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.add('completed');
        step4.classList.add('completed');
        timelineBar.style.width = '100%';
        if (statusBadge) {
            statusBadge.textContent = 'Arrived';
            statusBadge.className = 'badge badge-completed';
        }
        if (estimateTime) estimateTime.textContent = 'Delivered!';
    }
}

// Simulate New incoming orders
let simulatedOrderIndex = 241;
function simulateNewOrder() {
    const tbody = document.getElementById('order-queue-body');
    const countBadge = document.getElementById('active-orders-count');
    if (!tbody) return;

    const orderId = `89${simulatedOrderIndex++}`;
    const customers = ['Alex Rivera', 'Emily Watson', 'Yasmin Demir', 'Kenji Sato'];
    const items = ['1x Lamb Shish, 1x Soda', '2x Lahmacun, 1x Kunefe', '1x Adana Kebab, 1x Baklava', '3x Pizza, 2x Soda'];
    const prices = ['$23.50', '$34.99', '$27.49', '$42.00'];

    const randomIdx = Math.floor(Math.random() * customers.length);

    const newRow = document.createElement('tr');
    newRow.id = `row-${orderId}`;
    newRow.innerHTML = `
        <td><strong>#TRK-${orderId}</strong></td>
        <td>${customers[randomIdx]}</td>
        <td>${items[randomIdx]}</td>
        <td><strong>${prices[randomIdx]}</strong></td>
        <td><span class="badge badge-pending" id="status-${orderId}">Preparing</span></td>
        <td>
            <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="advanceOrderStatus('${orderId}')">Advance Status</button>
        </td>
    `;

    // Append to top of queue body
    tbody.insertBefore(newRow, tbody.firstChild);

    // Update active count
    if (countBadge) {
        let activeCount = parseInt(countBadge.textContent) || 0;
        countBadge.textContent = activeCount + 1;
    }

    if (typeof gsap !== 'undefined') {
        gsap.from(newRow, { opacity: 0, x: -50, duration: 0.5, ease: 'power2.out' });
    }

    showDashboardToast(`Incoming Order #TRK-${orderId} received!`);
}

// Toast helper inside dashboard
function showDashboardToast(msg) {
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
