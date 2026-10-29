document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. PROFILE MODAL FUNCTIONALITY
    // ==========================================
    const profileBtn = document.getElementById("profile-nav-btn");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const currentWallet =
                localStorage.getItem("fuelless_wallet_balance") || "0.00";
            const currentTotalFuel =
                localStorage.getItem("fuelless_total_litres") || "0";

            const walletDisplay =
                document.getElementById("profile-wallet-display");
            const fuelDisplay =
                document.getElementById("profile-fuel-display");

            if (walletDisplay) {
                walletDisplay.textContent =
                    "₦" + Number(currentWallet).toLocaleString("en-NG", {
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

    function closeProfile() {
        if (!profileModal) return;
        profileModal.classList.add("hidden");
        profileModal.classList.remove("flex");
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener("click", closeProfile);
    }

    if (closeProfileModalBtn) {
        closeProfileModalBtn.addEventListener("click", closeProfile);
    }

    if (clearDataBtn) {
        clearDataBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset your local app data?")) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    // ==========================================
    // 1. SELECTED STATION
    // ==========================================
    let savedStation = null;

    try {
        savedStation = JSON.parse(
            localStorage.getItem("fuelless_selected_station")
        );
    } catch (error) {
        console.error("Could not load selected station:", error);
    }

    const stationNameEl = document.getElementById("station-name-display");
    const stationAddressEl = document.getElementById("station-address-display");
    const pricePerLitreEl = document.getElementById("price-per-litre-display");
    const radioPriceDisplay = document.getElementById("radio-price-display");

    let pricePerLitre = 875;

    if (savedStation) {
        if (stationNameEl) {
            stationNameEl.textContent = savedStation.name || "Fuel Station";
        }

        if (stationAddressEl) {
            stationAddressEl.textContent = savedStation.address || "";
        }

        const savedPrice = Number(savedStation.price);

        if (savedPrice > 0) {
            pricePerLitre = savedPrice;

            if (pricePerLitreEl) {
                pricePerLitreEl.textContent = pricePerLitre.toLocaleString("en-NG");
            }

            if (radioPriceDisplay) {
                radioPriceDisplay.textContent = pricePerLitre.toLocaleString("en-NG");
            }
        }
    }

    // ==========================================
    // 2. WALLET BALANCE
    // ==========================================
    const walletBalanceEl = document.getElementById("wallet-balance-display");

    let currentWalletBalance = parseFloat(
        localStorage.getItem("fuelless_wallet_balance")
    );

    if (isNaN(currentWalletBalance)) {
        currentWalletBalance = 42850;
        localStorage.setItem(
            "fuelless_wallet_balance",
            currentWalletBalance.toFixed(2)
        );
    }

    function updateWalletDisplay() {
        if (walletBalanceEl) {
            walletBalanceEl.textContent =
                "₦" + currentWalletBalance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
        }
    }

    updateWalletDisplay();

    // ==========================================
    // 3. PURCHASE CONTROLS
    // ==========================================
    let mode = "litres";
    let currentValue = 20;
    const serviceFee = 100;

    const tabLitres = document.getElementById("tab-litres");
    const tabAmount = document.getElementById("tab-amount");
    const inputValueDisplay = document.getElementById("input-value-display");
    const inputUnitDisplay = document.getElementById("input-unit-display");
    const decrementBtn = document.getElementById("decrement-btn");
    const incrementBtn = document.getElementById("increment-btn");
    const quickSelectContainer = document.getElementById("quick-select-container");

    const summaryMainValue = document.getElementById("summary-main-value");
    const summaryUnitLabel = document.getElementById("summary-unit-label");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTotal = document.getElementById("summary-total");
    const payBtnText = document.getElementById("pay-btn-text");
    const payBtn = document.getElementById("pay-btn");

    // ==========================================
    // 4. CALCULATIONS
    // ==========================================
    function updateCalculations() {
        let subtotal;

        if (mode === "litres") {
            subtotal = currentValue * pricePerLitre;

            if (inputValueDisplay) {
                inputValueDisplay.textContent = currentValue;
            }

            if (inputUnitDisplay) {
                inputUnitDisplay.textContent = "LITRES";
            }

            if (summaryMainValue) {
                summaryMainValue.textContent = currentValue.toFixed(1);
            }

            if (summaryUnitLabel) {
                summaryUnitLabel.textContent = "LITRES";
            }
        } else {
            subtotal = currentValue;

            if (inputValueDisplay) {
                inputValueDisplay.textContent = currentValue.toLocaleString("en-NG");
            }

            if (inputUnitDisplay) {
                inputUnitDisplay.textContent = "NAIRA (₦)";
            }

            if (summaryMainValue) {
                summaryMainValue.textContent =
                    (currentValue / pricePerLitre).toFixed(1);
            }

            if (summaryUnitLabel) {
                summaryUnitLabel.textContent = "LITRES EQUIVALENT";
            }
        }

        const total = subtotal + serviceFee;

        if (summarySubtotal) {
            summarySubtotal.textContent =
                "₦" + subtotal.toLocaleString("en-NG");
        }

        if (summaryTotal) {
            summaryTotal.textContent =
                "₦" + total.toLocaleString("en-NG");
        }

        if (payBtnText) {
            payBtnText.textContent =
                "Pay ₦" + total.toLocaleString("en-NG");
        }
    }

    // ==========================================
    // 5. QUICK SELECT BUTTONS
    // ==========================================
    function renderQuickButtons() {
        if (!quickSelectContainer) return;

        quickSelectContainer.innerHTML = "";

        const presets = mode === "litres"
            ? [10, 20, 30, 50]
            : [5000, 10000, 20000, 50000];

        presets.forEach((value) => {
            const btn = document.createElement("button");
            btn.type = "button";

            const isSelected = currentValue === value;

            btn.className = isSelected
                ? "quick-btn bg-emerald-50 border border-emerald-800 text-emerald-900 text-xs font-semibold py-2 rounded-xl transition"
                : "quick-btn border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50 transition";

            btn.textContent = mode === "litres"
                ? `${value} L`
                : `₦${value.toLocaleString("en-NG")}`;

            btn.addEventListener("click", () => {
                currentValue = value;
                renderQuickButtons();
                updateCalculations();
            });

            quickSelectContainer.appendChild(btn);
        });
    }

    // ==========================================
    // 6. SWITCH BETWEEN LITRES AND AMOUNT
    // ==========================================
    if (tabLitres && tabAmount) {
        tabLitres.addEventListener("click", () => {
            mode = "litres";
            currentValue = 20;

            tabLitres.className =
                "flex-1 bg-white text-gray-900 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition";

            tabAmount.className =
                "flex-1 text-gray-500 text-xs font-semibold py-2.5 rounded-lg hover:text-gray-700 transition";

            renderQuickButtons();
            updateCalculations();
        });

        tabAmount.addEventListener("click", () => {
            mode = "amount";
            currentValue = 10000;

            tabAmount.className =
                "flex-1 bg-white text-gray-900 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition";

            tabLitres.className =
                "flex-1 text-gray-500 text-xs font-semibold py-2.5 rounded-lg hover:text-gray-700 transition";

            renderQuickButtons();
            updateCalculations();
        });
    }

    // ==========================================
    // 7. INCREMENT AND DECREMENT
    // ==========================================
    if (incrementBtn) {
        incrementBtn.addEventListener("click", () => {
            currentValue += mode === "litres" ? 5 : 2500;
            renderQuickButtons();
            updateCalculations();
        });
    }

    if (decrementBtn) {
        decrementBtn.addEventListener("click", () => {
            const step = mode === "litres" ? 5 : 2500;
            const minimum = step;

            if (currentValue > minimum) {
                currentValue -= step;
            }

            renderQuickButtons();
            updateCalculations();
        });
    }

    // ==========================================
    // 8. CHECKOUT AND REAL EXPIRY TIMESTAMP
    // ==========================================
    if (payBtn) {
        payBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const subtotal = mode === "litres"
                ? currentValue * pricePerLitre
                : currentValue;

            const finalTotal = subtotal + serviceFee;

            const purchasedLitres = mode === "litres"
                ? currentValue
                : currentValue / pricePerLitre;

            if (currentWalletBalance < finalTotal) {
                alert(
                    "Insufficient wallet balance! Please fund your wallet from the overview page."
                );
                return;
            }

            // Calculate everything before saving the purchase.
            const purchasedAt = Date.now();
            const expiresAt = purchasedAt + (24 * 60 * 60 * 1000);

            const randomCode =
                "FL-" +
                Math.floor(1000 + Math.random() * 9000) +
                "-" +
                Math.random().toString(36).substring(2, 6).toUpperCase();

            const purchaseRecord = {
                station: savedStation?.name || "TotalEnergies",
                address: savedStation?.address || "Chisco, Lekki-Epe Exp.",
                litres: purchasedLitres.toFixed(1),
                totalPaid: finalTotal,
                passCode: randomCode,

                // Exact timestamps used by the live countdown.
                purchasedAt: purchasedAt,
                expiresAt: expiresAt,

                // Keep the readable purchase date for compatibility.
                date: new Date(purchasedAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short"
                }),

                status: "Completed"
            };

            try {
                const existingPurchases = JSON.parse(
                    localStorage.getItem("fuelless_purchases") || "[]"
                );

                if (!Array.isArray(existingPurchases)) {
                    throw new Error("Purchase records are invalid.");
                }

                // Save the purchase before deducting the wallet.
                existingPurchases.unshift(purchaseRecord);

                localStorage.setItem(
                    "fuelless_purchases",
                    JSON.stringify(existingPurchases)
                );

                currentWalletBalance -= finalTotal;

                localStorage.setItem(
                    "fuelless_wallet_balance",
                    currentWalletBalance.toFixed(2)
                );

                const totalLitresBought = parseFloat(
                    localStorage.getItem("fuelless_total_litres")
                ) || 0;

                localStorage.setItem(
                    "fuelless_total_litres",
                    (totalLitresBought + purchasedLitres).toFixed(1)
                );

                alert(
                    `Payment of ₦${finalTotal.toLocaleString("en-NG")} successful!\n\n` +
                    `Pass code: ${randomCode}\n` +
                    `Valid until: ${new Date(expiresAt).toLocaleString()}\n\n` +
                    "Opening your fuel pass..."
                );

                window.location.href = "./mypurchase.html";

            } catch (error) {
                console.error("Purchase could not be saved:", error);

                alert(
                    "Your purchase could not be saved locally. " +
                    "Please check your browser storage and try again."
                );
            }
        });
    }

    // ==========================================
    // 9. INITIALIZE
    // ==========================================
    renderQuickButtons();
    updateCalculations();
});