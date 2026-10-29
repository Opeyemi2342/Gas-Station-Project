document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. LOAD USER PROFILE & DYNAMIC ACCOUNT DATA
    // ==========================================
    const currentUserData = localStorage.getItem('fuelless_current_user');
    let userEmail = "default_user";

    if (currentUserData) {
        const user = JSON.parse(currentUserData);
        userEmail = user.email ? user.email.toLowerCase() : "default_user";
        
        const welcomeHeading = document.querySelector('header p.uppercase');
        const sidebarUserName = document.querySelector('aside h5');
        const sidebarUserEmail = document.querySelector('aside p.text-gray-400');
        const sidebarAvatar = document.querySelector('aside div.bg-amber-200');

        const nameToDisplay = user.fullName || "User";

        if (welcomeHeading) {
            welcomeHeading.textContent = `WELCOME BACK, ${nameToDisplay.toUpperCase()}`;
        }
        if (sidebarUserName) {
            sidebarUserName.textContent = user.fullName;
        }
        if (sidebarUserEmail && user.email) {
            sidebarUserEmail.textContent = user.email;
        }
        if (sidebarAvatar && user.fullName) {
            const initials = user.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            sidebarAvatar.textContent = initials;
        }
    }

    // Load account state from localStorage (or set defaults to 0 for new accounts)
    const storageKey = `fuelless_account_${userEmail}`;
    let accountData = JSON.parse(localStorage.getItem(storageKey)) || {
        balance: 0.00,
        activePass: null, // { litres, station, price }
        timeSavedMinutes: 0,
        totalFuelBought: 0.0,
        purchases: []
    };


    // ==========================================
    // 1. RENDER DYNAMIC ACCOUNT STATE TO DOM
    // ==========================================
    const walletBalanceEl = document.getElementById('wallet-balance');
    
    // Function to render current balance with slot-machine effect
    function slotMachineRollBalance(targetVal, duration = 1000) {
        if (!walletBalanceEl) return;
        const startTime = performance.now();

        function rollStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const randomScramble = Math.floor(Math.random() * 900000 + 10000) + Math.random();
                walletBalanceEl.textContent = `₦${randomScramble.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                requestAnimationFrame(rollStep);
            } else {
                walletBalanceEl.textContent = `₦${targetVal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2, fallbackWith: '0' })}`;
            }
        }
        requestAnimationFrame(rollStep);
    }

    // Initialize balance on load
    slotMachineRollBalance(accountData.balance, 800);

    // Render Active Fuel Pass Card
    const activePassCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(2)');
    if (activePassCard) {
        if (accountData.activePass) {
            activePassCard.innerHTML = `
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span class="font-medium text-gray-500 uppercase tracking-wider text-[10px]">Active Fuel Pass</span>
                    </div>
                    <a href="#" class="text-gray-700 font-medium hover:underline text-[11px]">View pass &rarr;</a>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-baseline space-x-1">
                            <span class="text-2xl font-bold text-gray-900">${accountData.activePass.litres}</span>
                            <span class="text-[10px] text-gray-400 font-medium">LITRES</span>
                        </div>
                        <p class="text-[11px] text-gray-400 mb-2">Premium Motor Spirit</p>
                        <div class="flex items-center space-x-1 text-[11px] text-gray-700 font-medium">
                            <i class="fa-solid fa-gas-pump text-[10px] text-gray-400"></i>
                            <span>${accountData.activePass.station}</span>
                        </div>
                    </div>
                    <div class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white text-lg">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                </div>
            `;
        } else {
            activePassCard.innerHTML = `
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-1.5">
                        <span class="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span class="font-medium text-gray-400 uppercase tracking-wider text-[10px]">Active Fuel Pass</span>
                    </div>
                </div>
                <div class="py-2">
                    <p class="text-sm font-semibold text-gray-700 mb-1">No active pass</p>
                    <p class="text-[11px] text-gray-400">Purchase fuel from any station to generate a secure QR pass.</p>
                </div>
                <div></div>
            `;
        }
    }

    // Render Time Saved Card
    const timeSavedCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(3)');
    if (timeSavedCard) {
        const hours = Math.floor(accountData.timeSavedMinutes / 60);
        const mins = accountData.timeSavedMinutes % 60;
        timeSavedCard.innerHTML = `
            <div class="w-8 h-8 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-xs">
                <i class="fa-regular fa-clock"></i>
            </div>
            <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Time Saved</p>
                <h3 class="text-2xl font-bold text-gray-900">${hours}h ${mins}m</h3>
                <p class="text-[11px] text-gray-400">across ${accountData.purchases.length} purchases</p>
            </div>
        `;
    }

    // Render Total Fuel Bought Card
    const totalFuelCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(4)');
    if (totalFuelCard) {
        totalFuelCard.innerHTML = `
            <div class="w-8 h-8 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center text-xs">
                <i class="fa-solid fa-gas-pump"></i>
            </div>
            <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Fuel Bought</p>
                <h3 class="text-2xl font-bold text-gray-900">${accountData.totalFuelBought} L</h3>
                <p class="text-[11px] text-gray-400">Account activity summary</p>
            </div>
        `;
    }

    // ==========================================
    // RENDER RECENT PURCHASES SECTION (Fixed)
    // ==========================================
    const sections = document.querySelectorAll('section');
    // Find the section that contains the "Recent purchases" header
    let recentPurchaseSection = null;
    sections.forEach(sec => {
        const h3 = sec.querySelector('h3');
        if (h3 && h3.textContent.trim() === 'Recent purchases') {
            recentPurchaseSection = sec;
        }
    });

    if (recentPurchaseSection) {
        const purchasesContainer = recentPurchaseSection.querySelector('.bg-white') || recentPurchaseSection.lastElementChild;
        if (purchasesContainer && accountData.purchases && accountData.purchases.length > 0) {
            const latest = accountData.purchases[accountData.purchases.length - 1];
            purchasesContainer.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center text-sm">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <div>
                        <h5 class="text-sm font-semibold text-gray-900">${latest.station}</h5>
                        <p class="text-[11px] text-gray-400">${latest.date} • PMS</p>
                    </div>
                </div>
                <div class="flex items-center space-x-6">
                    <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                        Completed
                    </span>
                    <div class="text-right">
                        <p class="text-sm font-bold text-gray-900">₦${latest.amount.toLocaleString()}</p>
                        <p class="text-[11px] text-gray-400">${latest.litres} litres</p>
                    </div>
                </div>
            `;
        } else if (purchasesContainer) {
            purchasesContainer.innerHTML = `
                <div class="w-full text-center py-6 text-gray-400 text-xs">
                    <i class="fa-solid fa-receipt text-lg mb-2 opacity-40"></i>
                    <p>No recent purchases yet. Buy fuel to see your history here.</p>
                </div>
            `;
        }
    }


    // ==========================================
    // 2. REPEATABLE SCROLL REVEAL (SCROLL UP & DOWN)
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const target = entry.target;

            if (entry.isIntersecting) {
                target.classList.remove('opacity-0', 'translate-y-8', '-translate-x-12', 'translate-x-12');
                target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0');
            } else {
                target.classList.remove('opacity-100', 'translate-y-0', 'translate-x-0');
                target.classList.add('opacity-0', 'translate-y-8');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 3. MOBILE HAMBURGER MENU TOGGLE
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }


    // ==========================================
    // 4. ADD MONEY WALLET FUNDING LOGIC
    // ==========================================
    const addMoneyBtn = document.getElementById('add-money-btn');

    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => {
            let inputAmount = prompt("Enter amount to add to your fuel wallet (e.g., 15000):", "15000");
            
            if (inputAmount !== null) {
                let addedValue = parseFloat(inputAmount);
                
                if (!isNaN(addedValue) && addedValue > 0) {
                    let oldBalance = accountData.balance;
                    accountData.balance += addedValue;
                    
                    // Save updated state to localStorage
                    localStorage.setItem(storageKey, JSON.stringify(accountData));

                    // Trigger slot-machine roll
                    slotMachineRollBalance(accountData.balance, 1400);
                } else {
                    alert("Please enter a valid monetary amount.");
                }
            }
        });
    }


    // ==========================================
    // 5. NOTIFICATION BELL INTERACTION
    // ==========================================
    const bellBtn = document.getElementById('bell-btn');
    const notifBadge = document.getElementById('notif-badge');
    let unreadCount = 3;

    if (bellBtn && notifBadge) {
        bellBtn.addEventListener('click', () => {
            if (unreadCount > 0) {
                unreadCount = 0;
                notifBadge.style.display = 'none';
                alert("You have no new unread notifications.");
            } else {
                unreadCount = 3;
                notifBadge.textContent = unreadCount;
                notifBadge.style.display = 'flex';
                alert("3 new notifications loaded.");
            }
        });
    }

});