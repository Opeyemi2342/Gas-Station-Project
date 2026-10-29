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
                walletDisplay.textContent = "₦" + parseFloat(currentWallet).toLocaleString('en-NG', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
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
    // 1. RETRIEVE SELECTED STATION FROM LOCALSTORAGE
    // ==========================================
    const savedStation = JSON.parse(localStorage.getItem('fuelless_selected_station'));
    const stationNameEl = document.getElementById('station-name-display');
    const stationAddressEl = document.getElementById('station-address-display');
    const pricePerLitreEl = document.getElementById('price-per-litre-display');
    const radioPriceDisplay = document.getElementById('radio-price-display');

    let pricePerLitre = 875;
    if (savedStation) {
        if (stationNameEl) stationNameEl.textContent = savedStation.name;
        if (stationAddressEl) stationAddressEl.innerHTML = `<i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${savedStation.address}`;
        if (savedStation.price) {
            pricePerLitre = parseFloat(savedStation.price);
            if (pricePerLitreEl) pricePerLitreEl.textContent = pricePerLitre.toLocaleString();
            if (radioPriceDisplay) radioPriceDisplay.textContent = pricePerLitre.toLocaleString();
        }
    }


    // ==========================================
    // 2. RETRIEVE LIVE WALLET BALANCE
    // ==========================================
    const walletBalanceEl = document.getElementById('wallet-balance-display');
    
    // Checks for stored balance, falling back to 42,850.00 if brand new
    let currentWalletBalance = parseFloat(localStorage.getItem('fuelless_wallet_balance'));
    if (isNaN(currentWalletBalance)) {
        currentWalletBalance = 42850.00;
        localStorage.setItem('fuelless_wallet_balance', currentWalletBalance.toFixed(2));
    }
    
    if (walletBalanceEl) {
        walletBalanceEl.textContent = `₦${currentWalletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            if (inputValueDisplay) inputValueDisplay.textContent = currentValue;
            if (inputUnitDisplay) inputUnitDisplay.textContent = 'LITRES';
            if (summaryMainValue) summaryMainValue.textContent = currentValue.toFixed(1);
            if (summaryUnitLabel) summaryUnitLabel.textContent = 'LITRES';
        } else {
            subtotal = currentValue; // currentValue represents Naira amount
            if (inputValueDisplay) inputValueDisplay.textContent = currentValue.toLocaleString();
            if (inputUnitDisplay) inputUnitDisplay.textContent = 'NAIRA (₦)';
            const equivalentLitres = (currentValue / pricePerLitre).toFixed(1);
            if (summaryMainValue) summaryMainValue.textContent = equivalentLitres;
            if (summaryUnitLabel) summaryUnitLabel.textContent = 'LITRES EQUIVALENT';
        }

        const total = subtotal + serviceFee;
        if (summarySubtotal) summarySubtotal.textContent = `₦${subtotal.toLocaleString()}`;
        if (summaryTotal) summaryTotal.textContent = `₦${total.toLocaleString()}`;
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
                btn.type = 'button';
                const isSelected = currentValue === val;
                btn.className = isSelected 
                    ? "quick-btn bg-emerald-50 border border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-xl transition"
                    : "quick-btn border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50 transition";
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
                btn.type = 'button';
                const isSelected = currentValue === val;
                btn.className = isSelected 
                    ? "quick-btn bg-emerald-50 border border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-xl transition"
                    : "quick-btn border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50 transition";
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

    // Payment / Checkout Action & Wallet Deduction
    if (payBtn) {
        payBtn.addEventListener('click', (e) => {
            e.preventDefault();

            let subtotal = mode === 'litres' ? currentValue * pricePerLitre : currentValue;
            let finalTotal = subtotal + serviceFee;
            let purchasedLitres = mode === 'litres' ? currentValue : (currentValue / pricePerLitre);

            if (currentWalletBalance < finalTotal) {
                alert("Insufficient wallet balance! Please fund your wallet from the overview page.");
                return;
            }

            // Deduct balance and update localStorage keys for overview sync
            currentWalletBalance -= finalTotal;
            localStorage.setItem('fuelless_wallet_balance', currentWalletBalance.toFixed(2));

            // Track total litres bought for profile stats
            let totalLitresBought = parseFloat(localStorage.getItem('fuelless_total_litres')) || 0;
            localStorage.setItem('fuelless_total_litres', (totalLitresBought + purchasedLitres).toFixed(1));

            // Generate Pass Code
            const randomCode = 'FL-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

            // Save purchase record for My Purchases page
            const purchaseRecord = {
                station: savedStation ? savedStation.name : "TotalEnergies",
                address: savedStation ? savedStation.address : "Chisco, Lekki-Epe Exp.",
                litres: purchasedLitres.toFixed(1),
                totalPaid: finalTotal,
                passCode: randomCode,
                date: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Completed'
            };

            let existingPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
            existingPurchases.unshift(purchaseRecord);
            localStorage.setItem('fuelless_purchases', JSON.stringify(existingPurchases));

            alert(`Payment of ₦${finalTotal.toLocaleString()} successful! Directing to your digital Fuel Pass...`);
            window.location.href = './mypurchase.html';
        });
    }

    // Initial Initialization
    renderQuickButtons();
    updateCalculations();
});