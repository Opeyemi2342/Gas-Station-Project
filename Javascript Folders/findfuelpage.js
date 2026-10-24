document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. REPEATABLE SCROLL REVEAL (SCROLL UP & DOWN)
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
                
                if (target.classList.contains('reveal-left')) {
                    target.classList.add('opacity-0', '-translate-x-12');
                } else if (target.classList.contains('reveal-right')) {
                    target.classList.add('opacity-0', 'translate-x-12');
                } else {
                    target.classList.add('opacity-0', 'translate-y-8');
                }
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 2. HEADER ROTATING VALUE PROPOSITION ANIMATION
    // ==========================================
    const headingEl = document.getElementById('animated-heading');
    if (headingEl) {
        const valueProps = [
            "Find fuel near you",
            "Pay ahead in seconds",
            "Pull in with zero queues",
            "Fuel up & drive away"
        ];
        let propIndex = 0;

        setInterval(() => {
            propIndex = (propIndex + 1) % valueProps.length;
            headingEl.classList.add('opacity-0', '-translate-y-2');

            setTimeout(() => {
                headingEl.textContent = valueProps[propIndex];
                headingEl.classList.remove('opacity-0', '-translate-y-2');
            }, 300);
        }, 3500);
    }


    // ==========================================
    // 3. MOBILE SIDEBAR MENU TOGGLE
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }


    // ==========================================
    // 4. NOTIFICATION BELL BADGE LOGIC
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


    // ==========================================
    // 5. DEVICE GEOLOCATION & NEARBY FUEL PINPOINTING
    // ==========================================
    const locationBtn = document.getElementById('location-btn');
    const locationText = document.getElementById('location-text');
    const stationHeading = document.getElementById('station-heading');
    const stationSubheading = document.getElementById('station-subheading');
    const mapIframe = document.getElementById('map-iframe');
    const mapContainer = document.getElementById('map-container');
    const mapPreviewBg = document.getElementById('map-preview-bg');
    const embeddedMap = document.getElementById('embedded-map');

    if (locationBtn && locationText) {
        locationBtn.addEventListener('click', () => {
            if (window.location.protocol === "file:") {
                alert("Geolocation requires running via a local server (like Live Server in VS Code), not directly from file://");
                return;
            }

            if (navigator.geolocation) {
                locationText.textContent = "Detecting location...";
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        locationText.textContent = `Location Active`;
                        
                        // Update section header text to indicate live local stations
                        if (stationHeading) stationHeading.textContent = "Fueling stations near your location";
                        if (stationSubheading) stationSubheading.textContent = `Pinpointed using coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

                        // Automatically open and update the map iframe to pinpoint gas stations around user's live coordinates!
                        if (mapIframe) {
                            mapIframe.src = `https://maps.google.com/maps?q=gas+station&sll=${lat},${lng}&z=15&output=embed`;
                        }

                        // Auto-expand the map view container so the user instantly sees the pins
                        if (mapPreviewBg && embeddedMap && mapContainer) {
                            mapPreviewBg.classList.add('hidden');
                            embeddedMap.classList.remove('hidden');
                            mapContainer.classList.remove('h-48');
                            mapContainer.classList.add('h-96');
                        }

                        alert("Location acquired! Pinpointing fueling stations near you on the map.");
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
    // 6. OPEN MAP VIEW EMBEDDED INTEGRATION
    // ==========================================
    const openMapBtn = document.getElementById('open-map-btn');

    if (openMapBtn && mapContainer) {
        openMapBtn.addEventListener('click', () => {
            mapPreviewBg.classList.add('hidden');
            embeddedMap.classList.remove('hidden');
            mapContainer.classList.remove('h-48');
            mapContainer.classList.add('h-96');
        });
    }

});