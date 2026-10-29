document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. PROFILE MODAL FUNCTIONALITY & DATA SYNC
    // ==========================================
    const profileBtn = document.getElementById("profile-nav-btn");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const currentWallet = localStorage.getItem("fuelless_wallet_balance") || "0.00";
            const currentTotalFuel = localStorage.getItem("fuelless_total_litres") || "0";

            const walletDisplay = document.getElementById("profile-wallet-display");
            const fuelDisplay = document.getElementById("profile-fuel-display");

            if (walletDisplay) {
                walletDisplay.textContent = "₦" + parseFloat(currentWallet).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            if (fuelDisplay) {
                fuelDisplay.textContent = currentTotalFuel + " L";
            }

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
    // 1. MASTER STATION DATABASE
    // ==========================================
    const masterStationsDatabase = [
        {
            name: "Conoil Mega Station",
            address: "Obalende Road, Ikoyi/Obalende",
            area: "Obalende",
            price: 870,
            distanceKm: 0.4,
            queueStatus: "Low queue",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "3 min",
            colorClass: "bg-yellow-600"
        },
        {
            name: "TotalEnergies Obalende",
            address: "Stadium Hotel Junction, Obalende",
            area: "Obalende",
            price: 875,
            distanceKm: 0.9,
            queueStatus: "Moderate",
            queueColor: "text-amber-600",
            dotColor: "bg-amber-500",
            waitTime: "8 min",
            colorClass: "bg-rose-600"
        },
        {
            name: "Mobil Oil Station",
            address: "Awolowo Road, Obalende",
            area: "Obalende",
            price: 875,
            distanceKm: 1.4,
            queueStatus: "Low queue",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "5 min",
            colorClass: "bg-red-600"
        },
        {
            name: "AP Filling Station",
            address: "Police Barracks Rd, Obalende",
            area: "Obalende",
            price: 880,
            distanceKm: 2.1,
            queueStatus: "Fast moving",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "4 min",
            colorClass: "bg-blue-700"
        },
        {
            name: "Nipco Energy",
            address: "11 Admiralty Way, Lekki",
            area: "Lekki",
            price: 875,
            distanceKm: 3.2,
            queueStatus: "Low queue",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "4 min",
            colorClass: "bg-orange-500"
        },
        {
            name: "MRS Oil Nigeria",
            address: "28 Ozumba Mbadiwe, VI",
            area: "Victoria Island",
            price: 880,
            distanceKm: 3.8,
            queueStatus: "Moderate",
            queueColor: "text-amber-600",
            dotColor: "bg-amber-500",
            waitTime: "12 min",
            colorClass: "bg-red-700"
        }
    ];

    // Default: Show closest stations around you (<= 2.0 km)
    let currentActiveList = masterStationsDatabase.filter(st => st.distanceKm <= 2.0);
    if (currentActiveList.length === 0) {
        currentActiveList = [masterStationsDatabase[0]];
    }

    const gridContainer = document.getElementById('stations-grid');
    const searchInput = document.getElementById('search-input');
    const locationBtn = document.getElementById('location-btn');
    const locationText = document.getElementById('location-text');
    const stationHeading = document.getElementById('station-heading');
    const stationSubheading = document.getElementById('station-subheading');
    const mapIframe = document.getElementById('map-iframe');
    const mapContainer = document.getElementById('map-container');
    const mapPreviewBg = document.getElementById('map-preview-bg');
    const embeddedMap = document.getElementById('embedded-map');
    const openMapBtn = document.getElementById('open-map-btn');

    // ==========================================
    // 2. FLICKER-FREE RENDER FUNCTION
    // ==========================================
    function renderStations(list) {
        if (!gridContainer) return;

        const fragment = document.createDocumentFragment();

        if (list.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = "col-span-full py-12 text-center text-gray-400 text-xs";
            emptyDiv.innerHTML = `
                <i class="fa-solid fa-gas-pump text-2xl mb-2 opacity-30"></i>
                <p>No fueling stations found matching your criteria.</p>
            `;
            fragment.appendChild(emptyDiv);
            gridContainer.innerHTML = '';
            gridContainer.appendChild(fragment);
            return;
        }

        list.forEach(station => {
            const isNear = station.distanceKm <= 2.0;
            const nearBadge = isNear 
                ? `<span class="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i> Near you</span>`
                : `<span class="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Nearby</span>`;

            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-10 h-10 ${station.colorClass} rounded-xl flex items-center justify-center text-white">
                            <i class="fa-solid fa-gas-pump text-base"></i>
                        </div>
                        <div class="flex items-center space-x-1.5">
                            ${nearBadge}
                            <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Open</span>
                        </div>
                    </div>
                    <h4 class="font-semibold text-gray-900 text-sm">${station.name}</h4>
                    <p class="text-[11px] text-gray-400 mb-4">
                        <i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${station.address}
                    </p>

                    <div class="grid grid-cols-2 gap-2 bg-gray-50/60 p-3 rounded-xl mb-4">
                        <div>
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">PMS Price</p>
                            <p class="text-sm font-bold text-gray-900">₦${station.price}<span class="text-[10px] text-gray-400 font-normal">/L</span></p>
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
                <button class="buy-station-btn w-full bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-950 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors duration-150"
                    data-station="${station.name}" data-price="${station.price}" data-address="${station.address}">
                    <span>Buy from this station</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            `;
            fragment.appendChild(card);
        });

        gridContainer.innerHTML = '';
        gridContainer.appendChild(fragment);

        document.querySelectorAll('.buy-station-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const stationName = e.currentTarget.getAttribute('data-station');
                const stationPrice = e.currentTarget.getAttribute('data-price');
                const stationAddress = e.currentTarget.getAttribute('data-address');

                const selectedStation = { name: stationName, price: stationPrice, address: stationAddress };
                localStorage.setItem('fuelless_selected_station', JSON.stringify(selectedStation));

                window.location.href = './buyfuelpage.html';
            });
        });
    }

    renderStations(currentActiveList);


    // ==========================================
    // 3. REAL-TIME SEARCH
    // ==========================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            const filtered = masterStationsDatabase.filter(st => 
                st.name.toLowerCase().includes(query) || 
                st.address.toLowerCase().includes(query) ||
                st.area.toLowerCase().includes(query)
            );

            currentActiveList = filtered;
            renderStations(currentActiveList);

            if (stationHeading) {
                stationHeading.textContent = query ? `Search results for "${query}"` : "Stations around you";
            }
            if (stationSubheading) {
                stationSubheading.textContent = `Showing ${filtered.length} matching station(s)`;
            }

            if (query && mapIframe) {
                mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}+gas+station,+Lagos&t=&z=16&output=embed`;
            } else if (mapIframe) {
                mapIframe.src = `https://maps.google.com/maps?q=gas+station+Lagos&t=&z=14&output=embed`;
            }

            if (mapPreviewBg && embeddedMap && mapContainer && query) {
                mapPreviewBg.classList.add('hidden');
                embeddedMap.classList.remove('hidden');
                mapContainer.classList.remove('h-48');
                mapContainer.classList.add('h-96');
            }
        });
    }


    // ==========================================
    // 4. FILTER CHIPS
    // ==========================================
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            filterChips.forEach(c => {
                c.classList.remove('bg-emerald-900', 'text-white');
                c.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200/60');
            });
            e.currentTarget.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200/60');
            e.currentTarget.classList.add('bg-emerald-900', 'text-white');

            const filterType = e.currentTarget.getAttribute('data-filter');
            let sortedList = [...masterStationsDatabase];

            if (filterType === 'price') {
                sortedList.sort((a, b) => a.price - b.price);
            } else if (filterType === 'queue') {
                sortedList.sort((a, b) => parseInt(a.waitTime) - parseInt(b.waitTime));
            } else if (filterType === 'nearest') {
                sortedList.sort((a, b) => a.distanceKm - b.distanceKm);
            } else {
                sortedList = masterStationsDatabase.filter(st => st.distanceKm <= 2.0);
            }

            currentActiveList = sortedList;
            renderStations(currentActiveList);
        });
    });


    // ==========================================
    // 5. GEOLOCATION & GPS ACTIVATION
    // ==========================================
    if (locationBtn && locationText) {
        locationBtn.addEventListener('click', () => {
            if (window.location.protocol === "file:") {
                alert("Geolocation requires running via a local server (like Live Server in VS Code).");
                return;
            }

            if (navigator.geolocation) {
                locationText.textContent = "Detecting GPS...";
                
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        locationText.textContent = "Location Active";
                        
                        let locationName = "your area";
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                            const data = await response.json();
                            if (data && data.address) {
                                locationName = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || "your area";
                            }
                        } catch (err) {
                            console.log("Geocoding fetch failed");
                        }

                        currentActiveList = masterStationsDatabase.filter(st => st.distanceKm <= 2.5).sort((a, b) => a.distanceKm - b.distanceKm);
                        if(currentActiveList.length === 0) {
                            currentActiveList = [masterStationsDatabase[0]];
                        }

                        if (stationHeading) stationHeading.textContent = `Stations closest to ${locationName}`;
                        if (stationSubheading) stationSubheading.textContent = `Showing only stations directly around you`;

                        renderStations(currentActiveList);

                        if (mapIframe) {
                            mapIframe.src = `https://maps.google.com/maps?q=gas+station&sll=${lat},${lng}&z=15&output=embed`;
                        }

                        if (mapPreviewBg && embeddedMap && mapContainer) {
                            mapPreviewBg.classList.add('hidden');
                            embeddedMap.classList.remove('hidden');
                            mapContainer.classList.remove('h-48');
                            mapContainer.classList.add('h-96');
                        }

                        alert(`Location active! Displaying closest stations around ${locationName}.`);
                    },
                    (error) => {
                        locationText.textContent = "Use my location";
                        alert("Location access was denied or is unavailable.");
                    },
                    { timeout: 10000 }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }


    // ==========================================
    // 6. EMBEDDED MAP TOGGLE
    // ==========================================
    if (openMapBtn && mapContainer) {
        openMapBtn.addEventListener('click', () => {
            mapPreviewBg.classList.add('hidden');
            embeddedMap.classList.remove('hidden');
            mapContainer.classList.remove('h-48');
            mapContainer.classList.add('h-96');
        });
    }


    // ==========================================
    // 7. MOBILE SIDEBAR & NOTIFICATIONS
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

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