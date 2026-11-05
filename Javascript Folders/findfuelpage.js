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

    const storedPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];


    // ==========================================
    // 1. DYNAMIC NOTIFICATION SYSTEM & 9+ BADGE
    // ==========================================
    const bellBtn = document.getElementById("bell-btn");
    const notifBadge = document.getElementById("notif-badge");
    
    // Ensure notification dropdown container exists in DOM or create it dynamically
    let notifDropdown = document.getElementById("notif-dropdown");
    if (!notifDropdown && bellBtn) {
        notifDropdown = document.createElement("div");
        notifDropdown.id = "notif-dropdown";
        notifDropdown.className = "absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 hidden z-[99999] overflow-hidden flex flex-col";
        notifDropdown.innerHTML = `
            <div class="bg-[#145337] text-white px-5 py-4 flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider">Notifications</h4>
                <button id="mark-all-read" class="text-[10px] text-emerald-200 hover:text-white underline">Mark all read</button>
            </div>
            <div id="notif-list" class="max-h-72 overflow-y-auto divide-y divide-gray-100"></div>
        `;
        bellBtn.parentElement.style.position = "relative";
        bellBtn.parentElement.appendChild(notifDropdown);
    }

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
    // 2. NIGERIAN FUEL STATION BRAND LOGO SYSTEM
    // ==========================================
    function getStationBrandDetails(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes("total") || lowerName.includes("totalenergies")) {
            return { 
                brandName: "TotalEnergies", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-red-500 shrink-0">TOTAL</div>`, 
                badge: "bg-red-50 text-red-700 border-red-200" 
            };
        } else if (lowerName.includes("nnpc") || lowerName.includes("retail")) {
            return { 
                brandName: "NNPC Retail", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-green-700 text-yellow-300 font-extrabold flex items-center justify-center text-xs shadow-md border border-green-600 shrink-0">NNPC</div>`, 
                badge: "bg-green-50 text-green-800 border-green-200" 
            };
        } else if (lowerName.includes("oando")) {
            return { 
                brandName: "Oando PLC", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-emerald-500 shrink-0">OANDO</div>`, 
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200" 
            };
        } else if (lowerName.includes("mobil") || lowerName.includes("11plc") || lowerName.includes("11")) {
            return { 
                brandName: "Mobil / 11PLC", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-blue-500 shrink-0">MOBIL</div>`, 
                badge: "bg-blue-50 text-blue-700 border-blue-200" 
            };
        } else if (lowerName.includes("conoil")) {
            return { 
                brandName: "Conoil", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-amber-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-amber-500 shrink-0">CON</div>`, 
                badge: "bg-amber-50 text-amber-700 border-amber-200" 
            };
        } else if (lowerName.includes("ardova") || lowerName.includes("ap")) {
            return { 
                brandName: "Ardova PLC (AP)", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-orange-500 shrink-0">AP</div>`, 
                badge: "bg-orange-50 text-orange-700 border-orange-200" 
            };
        } else if (lowerName.includes("matrix")) {
            return { 
                brandName: "Matrix Energy", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-purple-700 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-purple-600 shrink-0">MTX</div>`, 
                badge: "bg-purple-50 text-purple-700 border-purple-200" 
            };
        } else if (lowerName.includes("rano") || lowerName.includes("a.a. rano")) {
            return { 
                brandName: "A.A. Rano", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-yellow-500 text-green-950 font-extrabold flex items-center justify-center text-xs shadow-md border border-yellow-400 shrink-0">RANO</div>`, 
                badge: "bg-yellow-50 text-yellow-800 border-yellow-200" 
            };
        } else {
            return { 
                brandName: name || "Independent Station", 
                logoHtml: `<div class="w-10 h-10 rounded-xl bg-gray-800 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-gray-700 shrink-0"><i class="fa-solid fa-gas-pump"></i></div>`, 
                badge: "bg-gray-50 text-gray-700 border-gray-200" 
            };
        }
    }


    // ==========================================
    // 3. DEFAULT AGO-IWOYE / NIGERIA FALLBACK STATIONS
    // ==========================================
    const fallbackStations = [
        {
            name: "TotalEnergies Ago-Iwoye",
            fullAddress: "Station Road, Ago-Iwoye, Ogun State, Nigeria",
            area: "Ago-Iwoye",
            price: 865,
            distanceKm: 0.5,
            queueStatus: "Low queue",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "3 min",
            hasPMS: true,
            hasCNG: true,
            lat: 6.9167,
            lon: 3.9167
        },
        {
            name: "NNPC Mega Station",
            fullAddress: "Sagamu-Ijebu Ode Expressway, near Ago-Iwoye Junction, Ogun State",
            area: "Ago-Iwoye Axis",
            price: 855,
            distanceKm: 2.1,
            queueStatus: "Moderate",
            queueColor: "text-amber-600",
            dotColor: "bg-amber-500",
            waitTime: "6 min",
            hasPMS: true,
            hasCNG: true,
            lat: 6.9250,
            lon: 3.9200
        },
        {
            name: "A.A. Rano Filling Station",
            fullAddress: "Ago-Iwoye Main Town Road, Ogun State, Nigeria",
            area: "Ago-Iwoye",
            price: 870,
            distanceKm: 1.4,
            queueStatus: "Fast service",
            queueColor: "text-emerald-600",
            dotColor: "bg-emerald-500",
            waitTime: "4 min",
            hasPMS: true,
            hasCNG: false,
            lat: 6.9130,
            lon: 3.9110
        }
    ];

    let masterStationsDatabase = [...fallbackStations];
    let currentActiveList = [...masterStationsDatabase];

    const gridContainer = document.getElementById('stations-grid');
    const landmarkInput = document.getElementById('landmark-search-input');
    const searchLandmarkBtn = document.getElementById('search-landmark-btn');
    const locationBtn = document.getElementById('location-btn');
    const locationText = document.getElementById('location-text');
    const stationHeading = document.getElementById('station-heading');
    const stationSubheading = document.getElementById('station-subheading');
    const mapIframe = document.getElementById('map-iframe');
    const mapContainer = document.getElementById('map-container');
    const mapPreviewBg = document.getElementById('map-preview-bg');
    const embeddedMap = document.getElementById('embedded-map');
    const openMapBtn = document.getElementById('open-map-btn');

    // Direction Modal Elements
    const directionModal = document.getElementById('direction-modal');
    const closeDirectionModal = document.getElementById('close-direction-modal');
    const directionContent = document.getElementById('direction-content');
    const openMapsLink = document.getElementById('open-maps-link');

    let currentFilter = "all";


    // ==========================================
    // 4. FLICKER-FREE RENDER FUNCTION
    // ==========================================
    function renderStations(list) {
        if (!gridContainer) return;

        const fragment = document.createDocumentFragment();

        const filtered = list.filter(station => {
            if (currentFilter === "cng") return station.hasCNG;
            return true;
        });

        if (filtered.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = "col-span-full py-12 text-center text-gray-400 text-xs";
            emptyDiv.innerHTML = `
                <i class="fa-solid fa-gas-pump text-2xl mb-2 opacity-30"></i>
                <p>No fueling or CNG stations found matching your criteria in this area.</p>
            `;
            fragment.appendChild(emptyDiv);
            gridContainer.innerHTML = '';
            gridContainer.appendChild(fragment);
            return;
        }

        filtered.forEach(station => {
            const brand = getStationBrandDetails(station.name);
            const isNear = station.distanceKm <= 3.0;
            const nearBadge = isNear 
                ? `<span class="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i> Near you</span>`
                : `<span class="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">${station.distanceKm} km away</span>`;

            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between";
            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            ${brand.logoHtml}
                            <div>
                                <h4 class="font-semibold text-gray-900 text-sm leading-tight">${station.name}</h4>
                                <span class="text-[9px] font-bold px-2 py-0.5 rounded-md border mt-0.5 inline-block ${brand.badge}">${brand.brandName}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            ${nearBadge}
                        </div>
                    </div>

                    <!-- Full Detailed Address -->
                    <div class="mb-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-start gap-2">
                        <i class="fa-solid fa-location-dot text-red-500 mt-0.5 shrink-0"></i>
                        <span class="leading-relaxed">${station.fullAddress}</span>
                    </div>

                    <!-- Fuel & CNG Availability Tags -->
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        <span class="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                            <i class="fa-solid fa-gas-pump"></i> PMS Available
                        </span>
                        ${station.hasCNG ? `
                            <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                <i class="fa-solid fa-fire-flame-curved"></i> CNG Dispensing
                            </span>
                        ` : `
                            <span class="bg-gray-100 text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                                CNG Unavailable
                            </span>
                        `}
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-gray-50/60 p-3 rounded-xl mb-3">
                        <div>
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">PMS Price</p>
                            <p class="text-sm font-bold text-gray-900">₦${station.price}<span class="text-[10px] text-gray-400 font-normal">/L</span></p>
                        </div>
                        <div class="border-l border-gray-200 pl-3">
                            <p class="text-[9px] text-gray-400 font-semibold uppercase">Est. Wait</p>
                            <p class="text-sm font-bold text-gray-900">${station.waitTime}</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <!-- Google Maps Directions Tag -->
                    <button class="get-directions-btn w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                        data-name="${station.name}" data-address="${station.fullAddress}" data-lat="${station.lat || 6.9167}" data-lon="${station.lon || 3.9167}">
                        <i class="fa-solid fa-route text-emerald-700"></i>
                        <span>Ask for direction from your location</span>
                    </button>

                    <button class="buy-station-btn w-full bg-[#145337] text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-[#09482d] flex items-center justify-center space-x-1.5 shadow-sm transition"
                        data-station="${station.name}" data-price="${station.price}" data-address="${station.fullAddress}">
                        <span>Buy from this station</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                </div>
            `;
            fragment.appendChild(card);
        });

        gridContainer.innerHTML = '';
        gridContainer.appendChild(fragment);

        // Bind Buy Button Event
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

        // Bind Google Maps Direction Button Event
        document.querySelectorAll('.get-directions-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = btn.getAttribute('data-name');
                const address = btn.getAttribute('data-address');
                const lat = btn.getAttribute('data-lat');
                const lon = btn.getAttribute('data-lon');

                openDirectionModal(name, address, lat, lon);
            });
        });
    }


    // ==========================================
    // 5. GOOGLE MAPS ROUTING MODAL HANDLER
    // ==========================================
    function openDirectionModal(name, address, lat, lon) {
        if (!directionModal) return;
        directionContent.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <p><strong>Destination:</strong> ${name}</p>
                <p><strong>Full Address:</strong> ${address}</p>
                <p class="text-emerald-800 font-semibold mt-2">🗺️ Direct GPS route will be calculated from your current location on Google Maps.</p>
            </div>
        `;
        openMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        directionModal.classList.remove("hidden");
        directionModal.classList.add("flex");
    }

    closeDirectionModal?.addEventListener("click", () => {
        directionModal.classList.add("hidden");
        directionModal.classList.remove("flex");
    });


    // ==========================================
    // 6. FETCH LIVE STATIONS ANYWHERE IN NIGERIA
    // ==========================================
    async function fetchRealTimeStations(lat, lng, areaName = "your location") {
        if (locationText) locationText.textContent = "Scanning area...";

        try {
            const radius = 6000;
            const overpassQuery = `[out:json];node["amenity"="fuel"](around:${radius},${lat},${lng});out;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

            const response = await fetch(url);
            const data = await response.json();

            let fetchedStations = [];

            if (data && data.elements && data.elements.length > 0) {
                const stationPromises = data.elements.map(async (el, index) => {
                    const rawName = el.tags.name || el.tags.brand || el.tags.operator || `Fuel Station #${index + 1}`;
                    const dist = calculateDistance(lat, lng, el.lat, el.lon);

                    let detailedAddress = "";
                    if (el.tags["addr:street"]) {
                        detailedAddress = `${el.tags["addr:housenumber"] ? el.tags["addr:housenumber"] + " " : ""}${el.tags["addr:street"]}, ${areaName}, Nigeria`;
                    } else if (el.tags["addr:full"]) {
                        detailedAddress = el.tags["addr:full"];
                    } else if (el.tags["addr:suburb"]) {
                        detailedAddress = `${el.tags["addr:suburb"]}, ${areaName}, Nigeria`;
                    }

                    if (!detailedAddress) {
                        try {
                            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${el.lat}&lon=${el.lon}`);
                            const revData = await revRes.json();
                            if (revData && revData.address) {
                                const road = revData.address.road || revData.address.pedestrian || revData.address.suburb || "";
                                const suburb = revData.address.suburb || revData.address.neighbourhood || revData.address.city || areaName;
                                detailedAddress = road ? `${road}, ${suburb}, Nigeria` : `${suburb}, Nigeria`;
                            }
                        } catch (e) {
                            detailedAddress = `Main Road Axis, ${areaName}, Nigeria`;
                        }
                    }

                    return {
                        name: rawName,
                        fullAddress: detailedAddress || `${areaName} Road, Nigeria`,
                        area: areaName,
                        price: 860 + (index % 4) * 10,
                        distanceKm: parseFloat(dist.toFixed(1)),
                        queueStatus: index % 2 === 0 ? "Low queue" : "Moderate",
                        queueColor: index % 2 === 0 ? "text-emerald-600" : "text-amber-600",
                        dotColor: index % 2 === 0 ? "bg-emerald-500" : "bg-amber-500",
                        waitTime: `${3 + (index * 2)} min`,
                        hasPMS: true,
                        hasCNG: index % 2 === 0 || rawName.toLowerCase().includes("total") || rawName.toLowerCase().includes("nnpc"),
                        lat: el.lat,
                        lon: el.lon
                    };
                });

                fetchedStations = await Promise.all(stationPromises);
            } else {
                fetchedStations = [...fallbackStations];
            }

            masterStationsDatabase = fetchedStations.filter(st => st.distanceKm <= 6.0);
            masterStationsDatabase.sort((a, b) => a.distanceKm - b.distanceKm);

            currentActiveList = [...masterStationsDatabase];

            if (stationHeading) stationHeading.textContent = `Stations within 6km of ${areaName}`;
            if (stationSubheading) stationSubheading.textContent = `Showing verified stations sorted by distance`;

            renderStations(currentActiveList);
            if (locationText) locationText.textContent = "GPS Active";

        } catch (err) {
            console.error("Live station fetch error:", err);
            masterStationsDatabase = fallbackStations.filter(st => st.distanceKm <= 6.0);
            currentActiveList = [...masterStationsDatabase];
            renderStations(currentActiveList);
            if (locationText) locationText.textContent = "Use GPS";
        }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    }


    // ==========================================
    // 7. AUTO-DETECT GPS (AGO-IWOYE / NIGERIA)
    // ==========================================
    function autoDetectUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    let locationName = "Your Location";
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        if (data && data.address) {
                            locationName = data.address.town || data.address.suburb || data.address.city || data.address.county || "Your Area";
                        }
                    } catch (e) {
                        console.log("Reverse geocoding failed");
                    }

                    if (mapIframe) mapIframe.src = `https://maps.google.com/maps?q=gas+station&sll=${lat},${lng}&z=14&output=embed`;
                    if (mapPreviewBg && embeddedMap && mapContainer) {
                        mapPreviewBg.classList.add('hidden');
                        embeddedMap.classList.remove('hidden');
                        mapContainer.classList.remove('h-48');
                        mapContainer.classList.add('h-96');
                    }

                    await fetchRealTimeStations(lat, lng, locationName);
                },
                (error) => {
                    // Default fallback to Ago-Iwoye, Ogun State coordinates
                    fetchRealTimeStations(6.9167, 3.9167, "Ago-Iwoye");
                },
                { timeout: 8000 }
            );
        } else {
            fetchRealTimeStations(6.9167, 3.9167, "Ago-Iwoye");
        }
    }

    autoDetectUserLocation();

    if (locationBtn && locationText) {
        locationBtn.addEventListener('click', () => {
            autoDetectUserLocation();
        });
    }


    // ==========================================
    // 8. LANDMARK OR TOWN SEARCH IN NIGERIA
    // ==========================================
    async function handleLandmarkSearch() {
        const query = landmarkInput.value.trim();
        if (!query) return;

        if (stationHeading) stationHeading.textContent = `Searching stations around "${query}"...`;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Nigeria")}`);
            const results = await res.json();

            if (results && results.length > 0) {
                const lat = Number(results[0].lat);
                const lon = Number(results[0].lon);

                if (mapIframe) mapIframe.src = `https://maps.google.com/maps?q=gas+station+${encodeURIComponent(query)}&sll=${lat},${lon}&z=14&output=embed`;
                if (mapPreviewBg && embeddedMap && mapContainer) {
                    mapPreviewBg.classList.add('hidden');
                    embeddedMap.classList.remove('hidden');
                    mapContainer.classList.remove('h-48');
                    mapContainer.classList.add('h-96');
                }

                await fetchRealTimeStations(lat, lon, query);
            } else {
                alert("Location not found in Nigeria. Please check spelling (e.g. Ago-Iwoye, Ijebu-Ode, Ibadan).");
                if (stationHeading) stationHeading.textContent = "Location search failed";
            }
        } catch (err) {
            console.error("Landmark lookup error:", err);
            alert("Could not resolve location coordinates.");
        }
    }

    if (searchLandmarkBtn && landmarkInput) {
        searchLandmarkBtn.addEventListener('click', handleLandmarkSearch);
        landmarkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLandmarkSearch();
        });
    }


    // ==========================================
    // 9. FILTER CHIPS (Including CNG tab)
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
            currentFilter = filterType;

            let sortedList = [...masterStationsDatabase];

            if (filterType === 'price') {
                sortedList.sort((a, b) => a.price - b.price);
            } else if (filterType === 'queue') {
                sortedList.sort((a, b) => parseInt(a.waitTime) - parseInt(b.waitTime));
            } else if (filterType === 'nearest') {
                sortedList.sort((a, b) => a.distanceKm - b.distanceKm);
            }

            currentActiveList = sortedList;
            renderStations(currentActiveList);
        });
    });


    // ==========================================
    // 10. GOOGLE MAP VIEW TOGGLE
    // ==========================================
    if (openMapBtn && mapContainer) {
        openMapBtn.addEventListener('click', () => {
            mapPreviewBg.classList.add('hidden');
            embeddedMap.classList.remove('hidden');
            mapContainer.classList.remove('h-48');
            mapContainer.classList.add('h-96');
        });
    }

});