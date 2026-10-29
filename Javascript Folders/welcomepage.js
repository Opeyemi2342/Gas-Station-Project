document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. LOAD USER PROFILE & CLEAN STATE FOR NEW USERS
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

    // Load account state from localStorage
    const storageKey = `fuelless_account_${userEmail}`;
    let accountData = JSON.parse(localStorage.getItem(storageKey)) || {
        balance: 0.00,
        activePass: null,
        timeSavedMinutes: 0,
        totalFuelBought: 0.0,
        purchases: []
    };

    // Sync global wallet balance
    const globalWalletBalance = localStorage.getItem('fuelless_wallet_balance');
    if (globalWalletBalance !== null) {
        accountData.balance = parseFloat(globalWalletBalance);
    } else {
        localStorage.setItem('fuelless_wallet_balance', accountData.balance);
    }

    // Pull live purchase history from localStorage to compute real stats
    const storedPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
    
    let computedTotalLitres = 0;
    storedPurchases.forEach(p => {
        computedTotalLitres += parseFloat(p.litres) || 0;
    });
    
    // Save total litres back to storage so the profile modal can display it
    localStorage.setItem('fuelless_total_litres', computedTotalLitres.toFixed(1));

    const totalPurchasesCount = storedPurchases.length;
    const computedTimeSavedMins = totalPurchasesCount * 13;


    // ==========================================
    // 1. RENDER ACCOUNT STATE & CARDS DYNAMICALLY
    // ==========================================
    const walletBalanceEl = document.getElementById('wallet-balance');
    
    function slotMachineRollBalance(targetVal, duration = 1000) {
        if (!walletBalanceEl) return;
        if (targetVal === 0) {
            walletBalanceEl.textContent = "₦0.00";
            return;
        }

        const startTime = performance.now();
        function rollStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const randomScramble = Math.floor(Math.random() * 90000 + 1000) + Math.random();
                walletBalanceEl.textContent = `₦${randomScramble.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                requestAnimationFrame(rollStep);
            } else {
                walletBalanceEl.textContent = `₦${targetVal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }
        requestAnimationFrame(rollStep);
    }

    slotMachineRollBalance(accountData.balance, 800);

    // DYNAMIC ACTIVE FUEL PASS CARD
    const activePassCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(2)');
    if (activePassCard) {
        if (storedPurchases.length > 0) {
            const latest = storedPurchases[0];
            activePassCard.innerHTML = `
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="font-medium text-gray-500 uppercase tracking-wider text-[10px]">Active Fuel Pass</span>
                    </div>
                    <a href="./mypurchase.html" class="text-emerald-800 font-semibold hover:underline text-[11px]">View pass &rarr;</a>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-baseline space-x-1">
                            <span class="text-2xl font-bold text-gray-900">${latest.litres}</span>
                            <span class="text-[10px] text-gray-400 font-medium">LITRES</span>
                        </div>
                        <p class="text-[11px] text-gray-400 mb-2">Premium Motor Spirit (PMS)</p>
                        <div class="flex items-center space-x-1 text-[11px] text-gray-700 font-medium">
                            <i class="fa-solid fa-gas-pump text-[10px] text-emerald-700"></i>
                            <span class="truncate max-w-[140px]">${latest.station}</span>
                        </div>
                    </div>
                    <div class="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
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

    // DYNAMIC TIME SAVED CARD
    const timeSavedCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(3)');
    if (timeSavedCard) {
        const hours = Math.floor(computedTimeSavedMins / 60);
        const mins = computedTimeSavedMins % 60;
        timeSavedCard.innerHTML = `
            <div class="w-8 h-8 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-xs">
                <i class="fa-regular fa-clock"></i>
            </div>
            <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Time Saved</p>
                <h3 class="text-2xl font-bold text-gray-900">${hours}h ${mins}m</h3>
                <p class="text-[11px] text-gray-400">across ${totalPurchasesCount} purchase${totalPurchasesCount === 1 ? '' : 's'}</p>
            </div>
        `;
    }

    // DYNAMIC TOTAL FUEL BOUGHT CARD
    const totalFuelCard = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div:nth-child(4)');
    if (totalFuelCard) {
        totalFuelCard.innerHTML = `
            <div class="w-8 h-8 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center text-xs">
                <i class="fa-solid fa-gas-pump"></i>
            </div>
            <div>
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Fuel Bought</p>
                <h3 class="text-2xl font-bold text-gray-900">${computedTotalLitres.toFixed(1)} L</h3>
                <p class="text-[11px] text-gray-400">Account activity summary</p>
            </div>
        `;
    }

    // RECENT PURCHASES OVERVIEW WIDGET
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        const h3 = sec.querySelector('h3');
        if (h3 && h3.textContent.trim() === 'Recent purchases') {
            const purchasesContainer = sec.querySelector('.bg-white');
            if (purchasesContainer) {
                if (storedPurchases.length > 0) {
                    const latest = storedPurchases[0];
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
                                <p class="text-sm font-bold text-gray-900">₦${Number(latest.totalPaid).toLocaleString()}</p>
                                <p class="text-[11px] text-gray-400">${latest.litres} litres</p>
                            </div>
                        </div>
                    `;
                } else {
                    purchasesContainer.innerHTML = `
                        <div class="w-full text-center py-6 text-gray-400 text-xs">
                            <i class="fa-solid fa-receipt text-lg mb-2 opacity-40"></i>
                            <p>No recent purchases yet. Buy fuel to see your history here.</p>
                        </div>
                    `;
                }
            }
        }
    });


    // ==========================================
    // 2. VIEW HISTORY MODAL FUNCTIONALITY
    // ==========================================
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyModalBody = document.getElementById('history-modal-body');
    const closeHistoryModal = document.getElementById('close-history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');

    function openHistoryModal() {
        if (!historyModal || !historyModalBody) return;

        const purchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];

        if (purchases.length === 0) {
            historyModalBody.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-receipt text-4xl mb-3 opacity-30"></i>
                    <h4 class="text-sm font-semibold text-gray-700 mb-1">No Purchase History Found</h4>
                    <p class="text-xs">You have not bought any fuel yet. Your completed orders will appear here.</p>
                </div>
            `;
        } else {
            let historyHTML = `<div class="space-y-3">`;

            purchases.forEach((p) => {
                historyHTML += `
                    <div class="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-100/60 transition">
                        <div class="flex items-start gap-3.5">
                            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-[#145337] flex items-center justify-center shrink-0 mt-0.5">
                                <i class="fa-solid fa-gas-pump text-base"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-gray-900 mb-0.5">${p.station}</h4>
                                <p class="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <i class="fa-solid fa-location-dot text-[10px] text-gray-400"></i>
                                    <span>${p.address}</span>
                                </p>
                                <div class="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span>${p.date}</span>
                                    <span>•</span>
                                    <span class="font-mono text-gray-600 font-bold">${p.passCode || 'FL-PASS'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-sm font-bold text-gray-900 block">₦${Number(p.totalPaid).toLocaleString()}</span>
                            <span class="text-xs text-gray-500 block mb-1">${p.litres} L (PMS)</span>
                            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                                Completed
                            </span>
                        </div>
                    </div>
                `;
            });

            historyHTML += `</div>`;
            historyModalBody.innerHTML = historyHTML;
        }

        historyModal.classList.remove('hidden');
        historyModal.classList.add('flex');
    }

    function hideHistoryModal() {
        if (!historyModal) return;
        historyModal.classList.add('hidden');
        historyModal.classList.remove('flex');
    }

    if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', openHistoryModal);
    if (closeHistoryModal) closeHistoryModal.addEventListener('click', hideHistoryModal);
    if (closeHistoryModalBtn) closeHistoryModalBtn.addEventListener('click', hideHistoryModal);

    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) hideHistoryModal();
        });
    }


    // ==========================================
    // 3. PROFILE MODAL FUNCTIONALITY
    // ==========================================
    const profileBtn = document.getElementById("profile-nav-btn");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const currentBalance = localStorage.getItem("fuelless_wallet_balance") || "0.00";
            const currentTotalFuel = localStorage.getItem("fuelless_total_litres") || "0";

            document.getElementById("profile-wallet-display").textContent = "₦" + parseFloat(currentBalance).toLocaleString();
            document.getElementById("profile-fuel-display").textContent = currentTotalFuel + " L";
            
            profileModal.classList.remove("hidden");
            profileModal.classList.add("flex");
        });
    }

    const closeProfileModalFunc = () => {
        if (profileModal) {
            profileModal.classList.add("hidden");
            profileModal.classList.remove("flex");
        }
    };

    if (closeProfileModal) closeProfileModal.addEventListener("click", closeProfileModalFunc);
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener("click", closeProfileModalFunc);

    if (clearDataBtn) {
        clearDataBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset your local app data?")) {
                localStorage.clear();
                location.reload();
            }
        });
    }


    // ==========================================
    // 4. REAL GEOLOCATION LOGIC
    // ==========================================
    const locationTextEl = document.getElementById('user-location-text');
    const stationsContainer = document.getElementById('nearby-stations-container');

    const localStationPools = {
        onikan: [
            { name: "Conoil Mega Station", address: "Obalende Road, Ikoyi/Obalende", price: 875, distance: "0.8 km", queueStatus: "Low queue", queueColor: "text-emerald-600", dotColor: "bg-emerald-500", eta: "~ 4 min", colorClass: "bg-orange-500" },
            { name: "TotalEnergies", address: "Broad Street, Lagos Island", price: 880, distance: "1.2 km", queueStatus: "Moderate", queueColor: "text-amber-600", dotColor: "bg-amber-500", eta: "~ 7 min", colorClass: "bg-rose-600" },
            { name: "MRS Oil Nigeria", address: "Campos Square, Ajele St", price: 875, distance: "1.6 km", queueStatus: "Low queue", queueColor: "text-emerald-600", dotColor: "bg-emerald-500", eta: "~ 5 min", colorClass: "bg-red-700" }
        ]
    };

    function renderDynamicStations(stations, areaName) {
        if (locationTextEl) {
            locationTextEl.textContent = `Live availability around ${areaName}`;
        }

        if (!stationsContainer) return;
        stationsContainer.innerHTML = '';

        stations.forEach(station => {
            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all";
            
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-10 h-10 ${station.colorClass} rounded-xl flex items-center justify-center text-white">
                            <i class="fa-solid fa-gas-pump text-base"></i>
                        </div>
                        <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Open</span>
                    </div>
                    <h4 class="font-semibold text-gray-900 text-sm">${station.name}</h4>
                    <p class="text-[11px] text-gray-400 mb-4">
                        <i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${station.address}
                    </p>

                    <div class="grid grid-cols-2 gap-2 bg-gray-50/60 p-3 rounded-xl mb-4">
                        <div>
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">PMS Price</p>
                            <p class="text-sm font-bold text-gray-900">₦${station.price.toLocaleString()}<span class="text-[10px] text-gray-400 font-normal">/L</span></p>
                        </div>
                        <div class="border-l border-gray-200 pl-3">
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">Distance</p>
                            <p class="text-sm font-bold text-gray-900">${station.distance}</p>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                        <span class="flex items-center ${station.queueColor}">
                            <span class="w-1.5 h-1.5 ${station.dotColor} rounded-full mr-1.5"></span> ${station.queueStatus}
                        </span>
                        <span class="flex items-center text-gray-400">
                            <i class="fa-regular fa-clock mr-1"></i> ${station.eta}
                        </span>
                    </div>
                </div>

                <button class="buy-station-btn w-full bg-[#145337] hover:bg-[#09482d] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm">
                    <span>Buy from this station</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            `;

            const buyBtn = card.querySelector('.buy-station-btn');
            buyBtn.addEventListener('click', () => {
                localStorage.setItem('fuelless_selected_station', JSON.stringify({
                    name: station.name,
                    address: station.address,
                    price: station.price
                }));
                window.location.href = './buyfuelpage.html';
            });

            stationsContainer.appendChild(card);
        });
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    const address = data.address || {};
                    const area = address.suburb || address.neighbourhood || address.city_district || address.city || "your current location";

                    renderDynamicStations(localStationPools.onikan, area);
                } catch (err) {
                    renderDynamicStations(localStationPools.onikan, "Onikan, Lagos Island");
                }
            },
            () => {
                renderDynamicStations(localStationPools.onikan, "Onikan, Lagos Island");
            },
            { timeout: 8000 }
        );
    } else {
        renderDynamicStations(localStationPools.onikan, "Onikan, Lagos Island");
    }


    // ==========================================
    // 5. SCROLL REVEAL OBSERVER
    // ==========================================
    const observerOptions = { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.15 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                entry.target.classList.add('opacity-100', 'translate-y-0');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // ==========================================
    // 6. MOBILE SIDEBAR TOGGLE
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }


    // ==========================================
    // 7. ADD MONEY WALLET FUNDING LOGIC
    // ==========================================
    const addMoneyBtn = document.getElementById('add-money-btn');

    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => {
            let inputAmount = prompt("Enter amount to add to your fuel wallet (e.g., 15000):", "15000");
            
            if (inputAmount !== null) {
                let addedValue = parseFloat(inputAmount);
                
                if (!isNaN(addedValue) && addedValue > 0) {
                    accountData.balance += addedValue;
                    localStorage.setItem('fuelless_wallet_balance', accountData.balance);
                    localStorage.setItem(storageKey, JSON.stringify(accountData));

                    slotMachineRollBalance(accountData.balance, 1400);
                } else {
                    alert("Please enter a valid monetary amount.");
                }
            }
        });
    }


    // ==========================================
    // 8. NOTIFICATION BELL INTERACTION
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