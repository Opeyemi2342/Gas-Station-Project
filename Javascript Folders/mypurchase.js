document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 0. PROFILE MODAL
    // ==========================================
    const profileBtn = document.getElementById("profile-nav-btn");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    if (profileBtn && profileModal) {
        profileBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const wallet = Number(
                localStorage.getItem("fuelless_wallet_balance") || 0
            );

            const totalFuel = Number(
                localStorage.getItem("fuelless_total_litres") || 0
            );

            const walletDisplay = document.getElementById("profile-wallet-display");
            const fuelDisplay = document.getElementById("profile-fuel-display");

            if (walletDisplay) {
                walletDisplay.textContent = "₦" + wallet.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }

            if (fuelDisplay) {
                fuelDisplay.textContent = totalFuel.toFixed(1) + " L";
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

    closeProfileModal?.addEventListener("click", closeProfile);
    closeProfileModalBtn?.addEventListener("click", closeProfile);

    if (clearDataBtn) {
        clearDataBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset your local app data?")) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    // ==========================================
    // 1. LOAD PURCHASE RECORDS
    // ==========================================
    let storedPurchases = [];

    try {
        storedPurchases = JSON.parse(
            localStorage.getItem("fuelless_purchases") || "[]"
        );

        if (!Array.isArray(storedPurchases)) {
            storedPurchases = [];
        }
    } catch (error) {
        console.error("Could not read purchase records:", error);
        storedPurchases = [];
    }

    const activePurchaseContainer =
        document.getElementById("active-purchase-container");

    const noPurchasesContainer =
        document.getElementById("no-purchases-container");

    if (!storedPurchases.length) {
        activePurchaseContainer?.classList.add("hidden");
        noPurchasesContainer?.classList.remove("hidden");
        return;
    }

    activePurchaseContainer?.classList.remove("hidden");
    noPurchasesContainer?.classList.add("hidden");

    const activePassData = storedPurchases[0];

    // ==========================================
    // 2. ELEMENT REFERENCES
    // ==========================================
    const fuelPassCard = document.getElementById("fuel-pass-card");

    const stationNameEl = document.getElementById("pass-station-name");
    const stationAddressEl = document.getElementById("pass-station-address");
    const litresEl = document.getElementById("pass-litres");
    const amountEl = document.getElementById("pass-amount");
    const passCodeEl = document.getElementById("pass-code-text");

    const validityDateEl = document.getElementById("validity-date-text");
    const countdownEl = document.getElementById("countdown-timer");

    const testScanBtn = document.getElementById("test-scan-btn");
    const downloadReceiptBtn =
        document.getElementById("download-receipt-btn");

    const qrContainer = document.getElementById("qrcode");

    // ==========================================
    // 3. DISPLAY PURCHASE INFORMATION
    // ==========================================
    const passCode = activePassData.passCode || "FL-2682-7K9P";
    const stationName = activePassData.station || "Fuel Station";
    const stationAddress = activePassData.address || "Address unavailable";

    const litres = Number(activePassData.litres) || 0;
    const totalPaid = Number(activePassData.totalPaid) || 0;

    if (stationNameEl) stationNameEl.textContent = stationName;
    if (stationAddressEl) stationAddressEl.textContent = stationAddress;

    if (litresEl) {
        litresEl.textContent = litres.toFixed(1) + " L";
    }

    if (amountEl) {
        amountEl.textContent = "₦" + totalPaid.toLocaleString("en-NG");
    }

    if (passCodeEl) {
        passCodeEl.textContent = passCode;
    }

    // ==========================================
    // 4. GENERATE QR CODE
    // ==========================================
    const qrString =
        `FUELESS-PASS:${passCode}|${stationName}|${litres.toFixed(1)}L`;

    if (qrContainer) {
        qrContainer.innerHTML = "";

        if (typeof window.QRCode !== "undefined") {
            new window.QRCode(qrContainer, {
                text: qrString,
                width: 160,
                height: 160,
                colorDark: "#073621",
                colorLight: "#ffffff",
                correctLevel: window.QRCode.CorrectLevel.H
            });
        } else {
            qrContainer.textContent = "QR code unavailable";
            console.error("QRCode library failed to load.");
        }
    }

    // ==========================================
    // 5. SET AND PERSIST THE EXPIRY TIME
    // ==========================================
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let expiresAt = Number(activePassData.expiresAt);

    if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
        let purchasedAt = Number(activePassData.purchasedAt);

        if (!Number.isFinite(purchasedAt) || purchasedAt <= 0) {
            purchasedAt = Date.now();
        }

        expiresAt = purchasedAt + ONE_DAY;

        activePassData.purchasedAt = purchasedAt;
        activePassData.expiresAt = expiresAt;

        try {
            localStorage.setItem(
                "fuelless_purchases",
                JSON.stringify(storedPurchases)
            );
        } catch (error) {
            console.error("Could not save expiry timestamp:", error);
        }
    }

    // ==========================================
    // 6. FORMAT THE VALIDITY DATE AND TIME
    // ==========================================
    function formatExpiryDate(timestamp) {
        return new Date(timestamp).toLocaleString("en-NG", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    if (validityDateEl) {
        validityDateEl.textContent = formatExpiryDate(expiresAt);
    }

    // ==========================================
    // 7. LIVE COUNTDOWN AND EXPIRY STATUS
    // ==========================================
    let countdownInterval = null;
    let isExpired = false;

    const headerSpans = fuelPassCard?.children[0]?.querySelectorAll("span");
    const statusHeader = headerSpans?.length
        ? headerSpans[headerSpans.length - 1]
        : null;

    const originalHeaderText = statusHeader?.textContent || "Fuel Pass";

    const paymentLabel = activePurchaseContainer?.querySelector(
        ".reveal.text-center > span"
    );

    const mainHeading = activePurchaseContainer?.querySelector("h1");

    const originalPaymentText = paymentLabel?.textContent || "";
    const originalHeadingText = mainHeading?.textContent || "";

    function savePurchases() {
        try {
            localStorage.setItem(
                "fuelless_purchases",
                JSON.stringify(storedPurchases)
            );
        } catch (error) {
            console.error("Could not save purchase records:", error);
        }
    }

    function updateCountdown() {
        const remaining = expiresAt - Date.now();

        if (remaining <= 0) {
            isExpired = true;

            if (countdownInterval !== null) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }

            if (countdownEl) {
                countdownEl.textContent = "EXPIRED";

                countdownEl.classList.remove(
                    "text-emerald-700",
                    "bg-emerald-100/60"
                );

                countdownEl.classList.add(
                    "text-red-700",
                    "bg-red-100"
                );
            }

            if (statusHeader) {
                statusHeader.textContent = "EXPIRED";
                statusHeader.classList.remove("text-emerald-400");
                statusHeader.classList.add("text-red-300");
            }

            if (paymentLabel) {
                paymentLabel.textContent = "FUEL PASS EXPIRED";
                paymentLabel.classList.remove("text-[#073621]");
                paymentLabel.classList.add("text-red-700");
            }

            if (mainHeading) {
                mainHeading.textContent = "Your fuel pass has expired.";
            }

            if (activePassData.status !== "Expired") {
                activePassData.status = "Expired";
                savePurchases();
            }

            return;
        }

        isExpired = false;

        if (countdownEl) {
            const totalSeconds = Math.floor(remaining / 1000);

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const pad = (number) => String(number).padStart(2, "0");

            countdownEl.textContent = days > 0
                ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)} left`
                : `${pad(hours)}:${pad(minutes)}:${pad(seconds)} left`;

            countdownEl.classList.remove("text-red-700", "bg-red-100");
            countdownEl.classList.add(
                "text-emerald-700",
                "bg-emerald-100/60"
            );
        }

        if (statusHeader) {
            statusHeader.textContent = originalHeaderText;
            statusHeader.classList.remove("text-red-300");
            statusHeader.classList.add("text-emerald-400");
        }

        if (paymentLabel && originalPaymentText) {
            paymentLabel.textContent = originalPaymentText;
            paymentLabel.classList.remove("text-red-700");
            paymentLabel.classList.add("text-[#073621]");
        }

        if (mainHeading && originalHeadingText) {
            mainHeading.textContent = originalHeadingText;
        }

        if (activePassData.status === "Expired") {
            activePassData.status = "Completed";
            savePurchases();
        }
    }

    updateCountdown();

    if (!isExpired) {
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // ==========================================
    // 8. TEST ATTENDANT SCAN
    // ==========================================
    if (testScanBtn) {
        testScanBtn.addEventListener("click", (e) => {
            e.preventDefault();

            if (Date.now() >= expiresAt) {
                updateCountdown();

                alert(
                    "THIS FUEL PASS HAS EXPIRED.\n\n" +
                    "Pass Code: " + passCode + "\n" +
                    "Please purchase fuel again to get a new pass."
                );

                return;
            }

            alert(
                "[Attendant Scanner Simulation]\n\n" +
                "Pass Code: " + passCode + "\n" +
                "Station: " + stationName + "\n" +
                "Litres: " + litres.toFixed(1) + " L\n" +
                "Status: VERIFIED & READY FOR DISPENSE."
            );
        });
    }

    // ==========================================
    // 9. SAVE THE FUEL PASS AS A PDF / PRINT
    // ==========================================
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener("click", (e) => {
            e.preventDefault();

            if (!fuelPassCard) {
                alert("The fuel pass card could not be found.");
                return;
            }

            // Refresh countdown and pull the latest active purchase data dynamically
            updateCountdown();

            const currentStation = stationNameEl?.textContent || stationName;
            const currentAddress = stationAddressEl?.textContent || stationAddress;
            const currentLitres = litresEl?.textContent || `${litres.toFixed(1)} L`;
            const currentAmount = amountEl?.textContent || `₦${totalPaid.toLocaleString()}`;
            const currentPassCode = passCodeEl?.textContent || passCode;
            const currentValidity = validityDateEl?.textContent || "";
            const currentCountdown = countdownEl?.textContent || "";
            const qrHtml = qrContainer ? qrContainer.innerHTML : "";

            const printWindow = window.open('', '_blank', 'width=800,height=1000');
            if (!printWindow) {
                alert("Please allow pop-ups to save your pass as a PDF.");
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html class="h-full">
                <head>
                    <title>FuelLess-Pass-${currentPassCode}</title>
                    <!-- Load Tailwind CSS via CDN -->
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                    <style>
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        body {
                            background-color: #FAF9F5;
                        }
                    </style>
                </head>
                <body class="h-full flex items-center justify-center p-6">
                    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mx-auto">
                        
                        <!-- Header -->
                        <div class="bg-[#145337] text-white px-6 py-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center">
                                    <i class="fa-solid fa-bolt text-xs text-yellow-300"></i>
                                </div>
                                <span class="text-xl font-bold">
                                    <span>Fuel</span><span class="text-green-700">less</span>
                                </span>
                            </div>
                            <span class="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                                Fuel Pass
                            </span>
                        </div>

                        <!-- Station Info (Dynamically updates based on latest purchase) -->
                        <div class="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                            <div class="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-gas-pump text-base"></i>
                            </div>
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Redeem at</span>
                                <h4 class="text-sm font-bold text-gray-900">${currentStation}</h4>
                                <p class="text-xs text-gray-500">${currentAddress}</p>
                            </div>
                        </div>

                        <!-- QR Code Section -->
                        <div class="p-6 flex flex-col items-center justify-center bg-white">
                            <div class="w-48 h-48 bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-center">
                                <div class="flex items-center justify-center">
                                    ${qrHtml}
                                </div>
                            </div>
                            <span class="text-[10px] font-mono font-bold tracking-widest text-gray-400 mt-4">
                                ${currentPassCode}
                            </span>
                        </div>

                        <!-- Stats Grid -->
                        <div class="grid grid-cols-3 border-t border-b border-gray-100 py-4 text-center bg-gray-50/50 text-sm">
                            <div class="border-r border-gray-200/60">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Fuel Type</span>
                                <span class="font-bold text-gray-900 text-base">PMS</span>
                            </div>
                            <div class="border-r border-gray-200/60">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Quantity</span>
                                <span class="font-bold text-gray-900 text-base">${currentLitres}</span>
                            </div>
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Amount Paid</span>
                                <span class="font-bold text-gray-900 text-base">${currentAmount}</span>
                            </div>
                        </div>

                        <!-- Footer / Validity -->
                        <div class="px-6 py-4 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
                            <div class="flex items-center gap-2.5">
                                <i class="fa-regular fa-clock text-gray-400 text-sm"></i>
                                <span>Valid until <strong class="text-gray-900 font-semibold">${currentValidity}</strong></span>
                            </div>
                            <span class="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                                ${currentCountdown}
                            </span>
                        </div>

                    </div>

                    <script>
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 600);
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
});