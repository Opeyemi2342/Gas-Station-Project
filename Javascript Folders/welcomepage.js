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
    const computedTimeSavedMins = totalPurchasesCount * 13;


    // ==========================================
    // 1. RENDER ACCOUNT STATS & CARDS
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

    // Active Fuel Pass Card
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

    // Time Saved Card
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

    // Total Fuel Card
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


    // ==========================================
    // 2. DISTANCE CALCULATOR HELPER
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
    // 3. REAL-TIME NOMINATIM GEOLOCATION FETCH (FIXED STATION NAMES & ADDRESSES)
    // ==========================================
    const locationTextEl = document.getElementById('user-location-text');
    const stationsContainer = document.getElementById('nearby-stations-container');

    const brandNames = ["Conoil", "TotalEnergies", "Total", "NNPC", "Mobil", "MRS", "Nipco", "Oando", "AP", "Ardova", "Enyo", "Rainoil", "Matrix"];

    async function fetchLiveStations(lat, lng) {
        if (locationTextEl) locationTextEl.textContent = "Detecting live stations near your device...";

        try {
            let areaName = "your location";
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const revData = await revRes.json();
            if (revData && revData.address) {
                areaName = revData.address.suburb || revData.address.neighbourhood || revData.address.city_district || revData.address.city || "your location";
            }

            const delta = 0.045; // Approx 5km bound
            const viewbox = `${lng-delta},${lat+delta},${lng+delta},${lat-delta}`;
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=fuel+station&bounded=1&viewbox=${viewbox}&limit=12`;

            const res = await fetch(searchUrl);
            const data = await res.json();

            let liveList = [];

            if (data && data.length > 0) {
                data.forEach((item, index) => {
                    const itemLat = parseFloat(item.lat);
                    const itemLon = parseFloat(item.lon);
                    const dist = calculateDistance(lat, lng, itemLat, itemLon);

                    if (dist <= 5.0) {
                        const displayName = item.display_name || "";
                        const parts = displayName.split(',');

                        // Intelligent Station Name extraction
                        let stationName = "";
                        let matchedBrand = brandNames.find(b => displayName.toLowerCase().includes(b.toLowerCase()));
                        
                        if (matchedBrand) {
                            stationName = `${matchedBrand} Filling Station`;
                        } else if (parts.length > 0 && !parts[0].toLowerCase().includes('road') && !parts[0].toLowerCase().includes('expressway')) {
                            stationName = parts[0].trim();
                        } else {
                            stationName = `Filling Station (${index + 1})`;
                        }

                        // Ensure clean address string
                        let cleanAddress = parts.slice(1, 4).join(',').trim();
                        if (!cleanAddress) {
                            cleanAddress = `${areaName}, Lagos`;
                        }

                        liveList.push({
                            name: stationName,
                            address: cleanAddress,
                            price: 875 + (index % 3) * 5,
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
                locationTextEl.textContent = `Showing live stations within 5km of ${areaName}`;
            }

            renderOverviewStations(liveList.slice(0, 3));

        } catch (err) {
            console.error("Failed to fetch live location stations:", err);
            if (locationTextEl) locationTextEl.textContent = "Location detection failed. Click 'Find fuel' to retry.";
        }
    }

    function renderOverviewStations(stations) {
        if (!stationsContainer) return;

        if (stations.length === 0) {
            stationsContainer.innerHTML = `
                <div class="col-span-full py-8 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
                    <i class="fa-solid fa-gas-pump text-xl mb-2 opacity-30"></i>
                    <p>No fueling stations detected within 5km of your exact position.</p>
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

    // Trigger GPS on Overview load immediately
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchLiveStations(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                if (locationTextEl) locationTextEl.textContent = "Please enable GPS access to see live nearby stations.";
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
        if (locationTextEl) locationTextEl.textContent = "Geolocation is not supported by your browser.";
    }


    // ==========================================
    // 4. VIEW HISTORY MODAL
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
    // 5. PROFILE MODAL FUNCTIONALITY
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
    // 6. SCROLL REVEAL & ADD MONEY
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
                } else {
                    alert("Please enter a valid monetary amount.");
                }
            }
        });
    }

});