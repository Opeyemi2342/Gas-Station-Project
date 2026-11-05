document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. LOAD USER PROFILE & INITIAL STATE
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

    const storageKey = `fuelless_account_${userEmail}`;
    let accountData = JSON.parse(localStorage.getItem(storageKey)) || {
        balance: 0.00,
        activePass: null,
        timeSavedMinutes: 0,
        totalFuelBought: 0.0,
        purchases: []
    };

    const globalWalletBalance = localStorage.getItem('fuelless_wallet_balance');
    if (globalWalletBalance !== null) {
        accountData.balance = parseFloat(globalWalletBalance);
    } else {
        localStorage.setItem('fuelless_wallet_balance', accountData.balance);
    }

    const storedPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
    
    let computedTotalLitres = 0;
    storedPurchases.forEach(p => {
        computedTotalLitres += parseFloat(p.litres) || 0;
    });
    
    localStorage.setItem('fuelless_total_litres', computedTotalLitres.toFixed(1));

    const totalPurchasesCount = storedPurchases.length;
    const computedTimeSavedMins = totalPurchasesCount * 30;


    // ==========================================
    // 1. DYNAMIC NOTIFICATION SYSTEM & 9+ BADGE
    // ==========================================
    const bellBtn = document.getElementById("bell-btn");
    const notifBadge = document.getElementById("notif-badge");
    const notifDropdown = document.getElementById("notif-dropdown");

    let notifications = JSON.parse(localStorage.getItem("fuelless_notifications") || "[]");

    if (notifications.length === 0) {
        notifications = [
            { id: 1, title: "Welcome to Fuelless", desc: "Account successfully initialized for Nigeria.", time: "Just now", read: false },
            { id: 2, title: "Location Active", desc: "GPS mapping enabled for Ogun State & nationwide.", time: "1h ago", read: false },
            { id: 3, title: "Security Token", desc: "Wallet encryption active and verified.", time: "2h ago", read: false }
        ];
        localStorage.setItem("fuelless_notifications", JSON.stringify(notifications));
    }

    if (storedPurchases.length > 0) {
        const latestPurchase = storedPurchases[0];
        const notifIdTag = `purchase_${latestPurchase.passCode}`;
        const alreadyLogged = notifications.some(n => n.tag === notifIdTag);
        
        if (!alreadyLogged) {
            notifications.unshift({
                id: Date.now(),
                tag: notifIdTag,
                title: "Fuel Pass Generated ⚡",
                desc: `Successfully purchased ${latestPurchase.litres}L PMS from ${latestPurchase.station}.`,
                time: "Just now",
                read: false
            });
            localStorage.setItem("fuelless_notifications", JSON.stringify(notifications));
        }
    }

    function updateNotificationUI() {
        const unreadCount = notifications.filter(n => !n.read).length;
        if (notifBadge) {
            if (unreadCount > 0) {
                notifBadge.style.display = "flex";
                notifBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
            } else {
                notifBadge.style.display = "none";
            }
        }
    }

    updateNotificationUI();

    function renderNotificationItems() {
        const listContainer = document.getElementById("notif-list");
        if (!listContainer) return;
        listContainer.innerHTML = "";

        if (notifications.length === 0) {
            listContainer.innerHTML = `<div class="p-6 text-center text-xs text-gray-400">No notifications yet.</div>`;
            return;
        }

        notifications.forEach(n => {
            const item = document.createElement("div");
            item.className = `p-4 text-xs transition hover:bg-gray-50 ${n.read ? 'opacity-70' : 'bg-emerald-50/40 font-semibold'}`;
            item.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="text-gray-900 font-bold">${n.title}</span>
                    <span class="text-[9px] text-gray-400">${n.time}</span>
                </div>
                <p class="text-gray-600 font-normal leading-relaxed">${n.desc}</p>
            `;
            listContainer.appendChild(item);
        });
    }

    if (bellBtn && notifDropdown) {
        bellBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            renderNotificationItems();
            notifDropdown.classList.toggle("hidden");
        });
    }

    document.addEventListener("click", (e) => {
        if (notifDropdown && !notifDropdown.contains(e.target) && !bellBtn?.contains(e.target)) {
            notifDropdown.classList.add("hidden");
        }
    });

    const markAllReadBtn = document.getElementById("mark-all-read");
    markAllReadBtn?.addEventListener("click", () => {
        notifications.forEach(n => n.read = true);
        localStorage.setItem("fuelless_notifications", JSON.stringify(notifications));
        updateNotificationUI();
        renderNotificationItems();
    });


    // ==========================================
    // 2. RENDER ACCOUNT STATS & CARDS
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

    // Active Fuel Pass Widget
    const activePassCardWidget = document.getElementById('active-pass-widget-container');
    if (activePassCardWidget) {
        if (storedPurchases.length > 0) {
            const latest = storedPurchases[0];
            const expiryTime = Number(latest.expiresAt) || (Date.now() + 86400000);
            const isExpired = Date.now() >= expiryTime;

            if (!isExpired) {
                activePassCardWidget.className = "bg-gradient-to-br from-[#145337] to-[#09482d] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-44 relative overflow-hidden";
                activePassCardWidget.innerHTML = `
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center space-x-1.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span class="font-bold text-emerald-200 uppercase tracking-wider text-[10px]">Active Fuel Pass</span>
                        </div>
                        <a href="./mypurchase.html" class="text-lime-300 font-semibold hover:underline text-[11px]">View pass &rarr;</a>
                    </div>
                    <div class="py-1">
                        <div class="flex items-baseline space-x-1 mb-0.5">
                            <span class="text-2xl font-bold text-white">${latest.litres}</span>
                            <span class="text-[10px] text-emerald-300 font-medium">LITRES</span>
                        </div>
                        <p class="text-[11px] text-emerald-100 mb-2 truncate">📍 ${latest.station}</p>
                        <span class="inline-block bg-emerald-800/80 text-yellow-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-700">Code: ${latest.passCode || 'FL-PASS'}</span>
                    </div>
                    <div></div>
                `;
            } else {
                activePassCardWidget.className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-44";
                activePassCardWidget.innerHTML = `
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center space-x-1.5">
                            <span class="w-2 h-2 rounded-full bg-red-400"></span>
                            <span class="font-medium text-red-500 uppercase tracking-wider text-[10px]">Pass Expired</span>
                        </div>
                    </div>
                    <div class="py-2">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Your pass has expired</p>
                        <p class="text-[11px] text-gray-400">Buy fuel again to generate a new active queue pass.</p>
                    </div>
                    <div></div>
                `;
            }
        } else {
            activePassCardWidget.className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-44";
            activePassCardWidget.innerHTML = `
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

    // Time Saved Card
    const timeSavedDisplay = document.getElementById('time-saved-display');
    const timeSavedCardParent = timeSavedDisplay ? timeSavedDisplay.closest('.bg-white') : null;
    if (timeSavedCardParent) {
        const hours = Math.floor(computedTimeSavedMins / 60);
        const mins = computedTimeSavedMins % 60;
        timeSavedDisplay.textContent = `${hours}h ${mins}m`;
        const subText = timeSavedCardParent.querySelector('p.text-\\[11px\\]');
        if (subText) subText.textContent = `across ${totalPurchasesCount} purchase${totalPurchasesCount === 1 ? '' : 's'}`;
    }

    // Total Fuel Card
    const totalFuelDisplay = document.getElementById('total-fuel-bought-display');
    if (totalFuelDisplay) {
        totalFuelDisplay.textContent = `${computedTotalLitres.toFixed(1)} L`;
    }


    // ==========================================
    // 3. DISTANCE CALCULATOR HELPER
    // ==========================================
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }


    // ==========================================
    // 4. REAL-TIME GEOLOCATION FETCH (NIGERIA / AGO-IWOYE)
    // ==========================================
    const locationTextEl = document.getElementById('user-location-text');
    const stationsContainer = document.getElementById('nearby-stations-container');

    const brandNames = ["Conoil", "TotalEnergies", "Total", "NNPC", "Mobil", "MRS", "Nipco", "Oando", "AP", "Ardova", "Enyo", "Rainoil", "Matrix", "Rano"];

    async function fetchLiveStations(lat, lng) {
        if (locationTextEl) locationTextEl.textContent = "Detecting live stations near your device...";

        try {
            let areaName = "your location";
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const revData = await revRes.json();
            if (revData && revData.address) {
                areaName = revData.address.town || revData.address.suburb || revData.address.city || revData.address.county || "your location";
            }

            const radius = 6000;
            const overpassQuery = `[out:json];node["amenity"="fuel"](around:${radius},${lat},${lng});out;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

            const response = await fetch(url);
            const data = await response.json();

            let liveList = [];

            if (data && data.elements && data.elements.length > 0) {
                data.elements.forEach((el, index) => {
                    const itemLat = parseFloat(el.lat);
                    const itemLon = parseFloat(el.lon);
                    const dist = calculateDistance(lat, lng, itemLat, itemLon);

                    if (dist <= 6.0) {
                        const rawName = el.tags.name || el.tags.brand || el.tags.operator || `Fuel Station #${index + 1}`;
                        let stationName = rawName;
                        let matchedBrand = brandNames.find(b => rawName.toLowerCase().includes(b.toLowerCase()));
                        
                        if (matchedBrand && !rawName.toLowerCase().includes("filling station")) {
                            stationName = `${matchedBrand} Filling Station`;
                        }

                        let cleanAddress = el.tags["addr:street"] ? `${el.tags["addr:street"]}, ${areaName}, Nigeria` : `${areaName}, Nigeria`;

                        liveList.push({
                            name: stationName,
                            address: cleanAddress,
                            price: 865 + (index % 3) * 10,
                            distanceKm: parseFloat(dist.toFixed(1)),
                            queueStatus: index % 2 === 0 ? "Low queue" : "Moderate",
                            queueColor: index % 2 === 0 ? "text-emerald-600" : "text-amber-600",
                            dotColor: index % 2 === 0 ? "bg-emerald-500" : "bg-amber-500",
                            waitTime: `${3 + (index * 2)} min`,
                            colorClass: index % 3 === 0 ? "bg-yellow-600" : (index % 3 === 1 ? "bg-emerald-700" : "bg-orange-500")
                        });
                    }
                });

                liveList.sort((a, b) => a.distanceKm - b.distanceKm);
            }

            if (locationTextEl) {
                locationTextEl.textContent = `Showing live stations within 6km of ${areaName}`;
            }

            renderOverviewStations(liveList.slice(0, 3));

        } catch (err) {
            console.error("Failed to fetch live location stations:", err);
            if (locationTextEl) locationTextEl.textContent = "Location detection failed. Showing default stations.";
        }
    }

    function renderOverviewStations(stations) {
        if (!stationsContainer) return;

        if (stations.length === 0) {
            stationsContainer.innerHTML = `
                <div class="col-span-full py-8 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
                    <i class="fa-solid fa-gas-pump text-xl mb-2 opacity-30"></i>
                    <p>No fueling stations detected within 6km of your exact position.</p>
                </div>
            `;
            return;
        }

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
                    <h4 class="font-semibold text-gray-900 text-sm truncate">${station.name}</h4>
                    <p class="text-[11px] text-gray-500 mb-4 line-clamp-2">
                        <i class="fa-solid fa-location-dot text-[10px] mr-1 text-emerald-700"></i>${station.address}
                    </p>

                    <div class="grid grid-cols-2 gap-2 bg-gray-50/60 p-3 rounded-xl mb-4">
                        <div>
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">PMS Price</p>
                            <p class="text-sm font-bold text-gray-900">₦${station.price.toLocaleString()}<span class="text-[10px] text-gray-400 font-normal">/L</span></p>
                        </div>
                        <div class="border-l border-gray-200 pl-3">
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">Distance</p>
                            <p class="text-sm font-bold text-gray-900">${station.distanceKm} km</p>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                        <span class="flex items-center ${station.queueColor}">
                            <span class="w-1.5 h-1.5 ${station.dotColor} rounded-full mr-1.5"></span> ${station.queueStatus}
                        </span>
                        <span class="flex items-center text-gray-400">
                            <i class="fa-regular fa-clock mr-1"></i> ~ ${station.waitTime}
                        </span>
                    </div>
                </div>

                <button class="buy-station-btn w-full bg-[#145337] hover:bg-[#09482d] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer">
                    <span>Buy from this station</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            `;

            card.querySelector('.buy-station-btn').addEventListener('click', () => {
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

    // Trigger GPS on Overview load. Defaults to Ago-Iwoye, Ogun State (lat: 6.9167, lon: 3.9167) if GPS is denied/unavailable
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchLiveStations(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                fetchLiveStations(6.9167, 3.9167);
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    } else {
        fetchLiveStations(6.9167, 3.9167);
    }


    // ==========================================
    // 5. VIEW HISTORY MODAL
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


    // ==========================================
    // 6. PROFILE MODAL FUNCTIONALITY
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
    // 7. SCROLL REVEAL & ADD MONEY
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

                    // Push notification for wallet funding
                    let currentNotifs = JSON.parse(localStorage.getItem("fuelless_notifications") || "[]");
                    currentNotifs.unshift({
                        id: Date.now(),
                        title: "Wallet Funded 💳",
                        desc: `Successfully added ₦${addedValue.toLocaleString()} to your fuel wallet.`,
                        time: "Just now",
                        read: false
                    });
                    localStorage.setItem("fuelless_notifications", JSON.stringify(currentNotifs));
                    updateNotificationUI();
                } else {
                    alert("Please enter a valid monetary amount.");
                }
            }
        });
    }

});