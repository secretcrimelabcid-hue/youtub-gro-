// --- CONFIGURATION: CHANGE CREDENTIALS HERE ---
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const ordersBody = document.getElementById('ordersBody');
    const noOrders = document.getElementById('noOrders');
    const orderSearch = document.getElementById('orderSearch');

    // --- Authentication Logic ---
    const checkAuth = () => {
        const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
        const currentPage = window.location.pathname;

        if (!isLoggedIn && currentPage.includes('dashboard.html')) {
            window.location.href = 'admin.html';
        }
        if (isLoggedIn && currentPage.includes('admin.html')) {
            window.location.href = 'dashboard.html';
        }
    };

    checkAuth();

    // --- Login Form Handling ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPass').value;
            const errorMsg = document.getElementById('loginError');

            if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.innerText = "Invalid credentials!";
            }
        });
    }

    // --- Logout Handling ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'admin.html';
        });
    }

    // --- Render Orders for Dashboard ---
    const renderOrders = (filter = "") => {
        if (!ordersBody) return;
        
        const orders = JSON.parse(localStorage.getItem('tubeBoostOrders')) || [];

        // --- Calculate Today's Stats ---
        const PLAN_SUBS = { 'Basic': 15, 'Standard': 36, 'Premium': 150 };
        const todayStr = new Date().toDateString();
        
        const totalSubsToday = orders.reduce((total, order) => {
            const orderDate = new Date(order.id).toDateString();
            return orderDate === todayStr 
                ? total + (PLAN_SUBS[order.plan] || 0) 
                : total;
        }, 0);

        const totalSubsEl = document.getElementById('totalSubsToday');
        if (totalSubsEl) totalSubsEl.innerText = totalSubsToday.toLocaleString();

        const filteredOrders = orders.filter(order => 
            order.name.toLowerCase().includes(filter.toLowerCase()) || 
            order.email.toLowerCase().includes(filter.toLowerCase())
        );
        
        if (filteredOrders.length === 0) {
            noOrders.style.display = 'block';
            noOrders.innerText = filter ? "No matching orders found." : "No orders found yet.";
            ordersBody.innerHTML = '';
            return;
        }

        noOrders.style.display = 'none';
        ordersBody.innerHTML = [...filteredOrders].reverse().map(order => `
            <tr>
                <td>${order.date}</td>
                <td>
                    <strong>${order.name}</strong><br>
                    <small style="color: var(--text-gray)">${order.email}</small>
                </td>
                <td><span class="btn" style="padding: 4px 10px; font-size: 0.7rem;">${order.plan}</span></td>
                <td>
                    <a href="${order.link}" target="_blank" style="color: var(--primary-red); text-decoration: none;">
                        View Channel <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i>
                    </a>
                </td>
                <td><span class="status-badge">Processing</span></td>
                <td>
                    <button class="btn btn-delete" data-id="${order.id}" title="Delete Order">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    };

    // --- Search Handling ---
    if (orderSearch) {
        orderSearch.addEventListener('input', (e) => renderOrders(e.target.value));
    }

    // --- Event Delegation for Delete Button ---
    if (ordersBody) {
        ordersBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = parseInt(deleteBtn.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this order?')) {
                    let orders = JSON.parse(localStorage.getItem('tubeBoostOrders')) || [];
                    orders = orders.filter(o => o.id !== id);
                    localStorage.setItem('tubeBoostOrders', JSON.stringify(orders));
                    renderOrders();
                }
            }
        });

        renderOrders();
    }
});