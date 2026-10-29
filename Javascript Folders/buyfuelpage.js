document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. RETRIEVE SELECTED STATION FROM LOCALSTORAGE
    // ==========================================
    const savedStation = JSON.parse(localStorage.getItem('fuelless_selected_station'));
    const stationNameEl = document.getElementById('station-name-display');
    const stationAddressEl = document.getElementById('station-address-display');
    const pricePerLitreEl = document.getElementById('price-per-litre-display');

    let pricePerLitre = 875;
    if (savedStation) {
        if (stationNameEl) stationNameEl.textContent = savedStation.name;
        if (stationAddressEl) stationAddressEl.innerHTML = `<i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${savedStation.address}`;
        if (savedStation.price) {
            pricePerLitre = parseFloat(savedStation.price);
            if (pricePerLitreEl) pricePerLitreEl.textContent = pricePerLitre.toLocaleString();
        }
    }

    // ==========================================
    // 2. RETRIEVE LIVE WALLET BALANCE FROM LOCALSTORAGE
    // ==========================================
    const walletBalanceEl = document.getElementById('wallet-balance-display');
    let currentWalletBalance = parseFloat(localStorage.getItem('fuelless_wallet_balance')) || 42850.00;
    if (walletBalanceEl) {
        walletBalanceEl.textContent = `₦${currentWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // ==========================================
    // 3. STATE VARIABLES & DOM ELEMENTS
    // ==========================================
    let mode = 'litres'; // 'litres' or 'amount'
    let currentValue = 20; // Default 20 litres
    const serviceFee = 100;

    const tabLitres = document.getElementById('tab-litres');
    const tabAmount = document.getElementById('tab-amount');
    const inputValueDisplay = document.getElementById('input-value-display');
    const inputUnitDisplay = document.getElementById('input-unit-display');
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const quickSelectContainer = document.getElementById('quick-select-container');
    
    const summaryMainValue = document.getElementById('summary-main-value');
    const summaryUnitLabel = document.getElementById('summary-unit-label');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const payBtnText = document.getElementById('pay-btn-text');
    const payBtn = document.getElementById('pay-btn');

    // ==========================================
    // 4. CALCULATION & RENDERING LOGIC
    // ==========================================
    function updateCalculations() {
        let subtotal = 0;
        if (mode === 'litres') {
            subtotal = currentValue * pricePerLitre;
            inputValueDisplay.textContent = currentValue;
            inputUnitDisplay.textContent = 'LITRES';
            summaryMainValue.textContent = currentValue.toFixed(1);
            summaryUnitLabel.textContent = 'LITRES';
        } else {
            subtotal = currentValue; // currentValue represents Naira amount
            inputValueDisplay.textContent = currentValue.toLocaleString();
            inputUnitDisplay.textContent = 'NAIRA (₦)';
            const equivalentLitres = (currentValue / pricePerLitre).toFixed(1);
            summaryMainValue.textContent = equivalentLitres;
            summaryUnitLabel.textContent = 'LITRES EQUIVALENT';
        }

        const total = subtotal + serviceFee;
        summarySubtotal.textContent = `₦${subtotal.toLocaleString()}`;
        summaryTotal.textContent = `₦${total.toLocaleString()}`;
        if (payBtnText) {
            payBtnText.textContent = `Pay ₦${total.toLocaleString()}`;
        }
    }

    function renderQuickButtons() {
        if (!quickSelectContainer) return;
        quickSelectContainer.innerHTML = '';
        
        if (mode === 'litres') {
            const presets = [10, 20, 30, 50];
            presets.forEach(val => {
                const btn = document.createElement('button');
                const isSelected = currentValue === val;
                btn.className = isSelected 
                    ? "quick-btn bg-emerald-50 border border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-xl"
                    : "quick-btn border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50";
                btn.textContent = `${val} L`;
                btn.addEventListener('click', () => {
                    currentValue = val;
                    renderQuickButtons();
                    updateCalculations();
                });
                quickSelectContainer.appendChild(btn);
            });
        } else {
            const presets = [5000, 10000, 20000, 50000];
            presets.forEach(val => {
                const btn = document.createElement('button');
                const isSelected = currentValue === val;
                btn.className = isSelected 
                    ? "quick-btn bg-emerald-50 border border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-xl"
                    : "quick-btn border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50";
                btn.textContent = `₦${val.toLocaleString()}`;
                btn.addEventListener('click', () => {
                    currentValue = val;
                    renderQuickButtons();
                    updateCalculations();
                });
                quickSelectContainer.appendChild(btn);
            });
        }
    }

    // ==========================================
    // 5. EVENT LISTENERS
    // ==========================================
    if (tabLitres && tabAmount) {
        tabLitres.addEventListener('click', () => {
            mode = 'litres';
            currentValue = 20; 
            tabLitres.className = "flex-1 bg-white text-gray-900 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition";
            tabAmount.className = "flex-1 text-gray-500 text-xs font-semibold py-2.5 rounded-lg hover:text-gray-700 transition";
            renderQuickButtons();
            updateCalculations();
        });

        tabAmount.addEventListener('click', () => {
            mode = 'amount';
            currentValue = 10000; 
            tabAmount.className = "flex-1 bg-white text-gray-900 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition";
            tabLitres.className = "flex-1 text-gray-500 text-xs font-semibold py-2.5 rounded-lg hover:text-gray-700 transition";
            renderQuickButtons();
            updateCalculations();
        });
    }

    if (incrementBtn && decrementBtn) {
        incrementBtn.addEventListener('click', () => {
            if (mode === 'litres') {
                currentValue += 5;
            } else {
                currentValue += 2500;
            }
            renderQuickButtons();
            updateCalculations();
        });

        decrementBtn.addEventListener('click', () => {
            if (mode === 'litres') {
                if (currentValue > 5) currentValue -= 5;
            } else {
                if (currentValue > 2500) currentValue -= 2500;
            }
            renderQuickButtons();
            updateCalculations();
        });
    }

    // Payment / Checkout Action
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            let subtotal = mode === 'litres' ? currentValue * pricePerLitre : currentValue;
            let finalTotal = subtotal + serviceFee;

            if (currentWalletBalance < finalTotal) {
                alert("Insufficient wallet balance! Please fund your wallet from the overview page.");
                return;
            }

            // Deduct balance and update localStorage
            currentWalletBalance -= finalTotal;
            localStorage.setItem('fuelless_wallet_balance', currentWalletBalance);

            // Save purchase record for My Purchases page
            const purchaseRecord = {
                station: savedStation ? savedStation.name : "Nipco Energy",
                address: savedStation ? savedStation.address : "11 Admiralty Way, Lekki",
                litres: mode === 'litres' ? currentValue : (currentValue / pricePerLitre).toFixed(1),
                totalPaid: finalTotal,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Completed'
            };

            let existingPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
            existingPurchases.unshift(purchaseRecord);
            localStorage.setItem('fuelless_purchases', JSON.stringify(existingPurchases));

            alert(`Payment of ₦${finalTotal.toLocaleString()} successful! Your fuel order has been placed.`);
            window.location.href = './mypurchase.html';
        });
    }

    // ==========================================
    // 6. MOBILE SIDEBAR / HAMBURGER TOGGLE LOGIC
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.classList.contains('-translate-x-full') && menuBtn) {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        }
    });

    // Initial Initialization
    renderQuickButtons();
    updateCalculations();
});