document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 0. PROFILE MODAL
    // ==========================================
    const profileBtn = document.getElementById("profile-nav-btn");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    function openProfileModal() {
        if (!profileModal) return;

        const wallet = Number(localStorage.getItem("fuelless_wallet_balance") || 0);
        const totalFuel = Number(localStorage.getItem("fuelless_total_litres") || 0);

        const walletDisplay = document.getElementById("profile-wallet-display");
        const fuelDisplay = document.getElementById("profile-fuel-display");

        if (walletDisplay) {
            walletDisplay.textContent = "₦" + wallet.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        if (fuelDisplay) fuelDisplay.textContent = totalFuel.toFixed(1) + " L";

        profileModal.classList.remove("hidden");
        profileModal.classList.add("flex");
        document.body.style.overflow = "hidden";
    }

    function closeProfile() {
        if (!profileModal) return;

        profileModal.classList.add("hidden");
        profileModal.classList.remove("flex");
        document.body.style.overflow = "";
    }

    profileBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        openProfileModal();
    });

    closeProfileModal?.addEventListener("click", closeProfile);
    closeProfileModalBtn?.addEventListener("click", closeProfile);

    clearDataBtn?.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset your local app data?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // ==========================================
    // 0B. MENISCUS SLIDING & DRAGGABLE NAVIGATION
    // ==========================================
    const nav = document.getElementById("meniscus-nav");
    const bead = document.getElementById("meniscus-bead");
    const cutout = document.getElementById("meniscus-cutout");
    const beadIcon = document.getElementById("meniscus-bead-icon");
    const mainContent = document.getElementById("main-content");

    if (nav && bead && cutout && beadIcon) {
        const items = Array.from(nav.querySelectorAll(".meniscus-item"));
        let activeIndex = 3;
        let isDragging = false;

        function getCenterXForIndex(index) {
            const item = items[index];
            if (!item) return 0;

            const navRect = nav.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();

            return itemRect.left - navRect.left + itemRect.width / 2 - 38;
        }

        function setBeadPosition(x, scale = 1) {
            const navRect = nav.getBoundingClientRect();
            const minX = 4;
            const maxX = Math.max(minX, navRect.width - 80);
            const clampedX = Math.max(minX, Math.min(maxX, x));

            nav.style.setProperty("--bead-x", `${clampedX}px`);
            nav.style.setProperty("--bead-scale", `${scale}`);
        }

        function findNearestIndex(x) {
            let bestIdx = 0;
            let bestDist = Infinity;

            items.forEach((_, idx) => {
                const dist = Math.abs(getCenterXForIndex(idx) - x);

                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = idx;
                }
            });

            return bestIdx;
        }

        function syncColorForPosition(x) {
            const nearest = items[findNearestIndex(x)];
            if (!nearest) return;

            nav.style.setProperty("--bead-color", nearest.dataset.color || "#145337");
            nav.style.setProperty("--bead-glow", nearest.dataset.glow || "rgba(20,83,55,.45)");

            beadIcon.className = `fa-solid ${nearest.dataset.icon || "fa-receipt"} text-base`;
        }

        function navigateSmoothly(href) {
            if (!href || href === "#") return;

            mainContent?.classList.add("page-transition-out");

            setTimeout(() => {
                window.location.href = href;
            }, 180);
        }

        function selectTab(index, { navigate = false } = {}) {
            activeIndex = Math.max(0, Math.min(items.length - 1, index));

            const targetItem = items[activeIndex];
            if (!targetItem) return;

            items.forEach((el, idx) => {
                el.classList.toggle("is-active", idx === activeIndex);
            });

            const iconClass = targetItem.dataset.icon || "fa-receipt";
            beadIcon.className = `fa-solid ${iconClass} text-base`;

            nav.style.setProperty("--bead-color", targetItem.dataset.color || "#145337");
            nav.style.setProperty("--bead-glow", targetItem.dataset.glow || "rgba(20,83,55,.45)");

            setBeadPosition(getCenterXForIndex(activeIndex), 1);

            const href = targetItem.getAttribute("href");

            if (!href || href === "#") {
                if (targetItem.id === "profile-nav-btn") openProfileModal();
                return;
            }

            if (navigate) navigateSmoothly(href);
        }

        bead.classList.add("dragging");
        cutout.classList.add("dragging");

        selectTab(3);

        requestAnimationFrame(() => {
            bead.classList.remove("dragging");
            cutout.classList.remove("dragging");
        });

        items.forEach((item, idx) => {
            item.addEventListener("click", (e) => {
                const href = item.getAttribute("href");

                if (!href || href === "#") {
                    e.preventDefault();
                    selectTab(idx);
                    return;
                }

                e.preventDefault();
                selectTab(idx, { navigate: true });
            });
        });

        function onPointerMove(e) {
            if (!isDragging) return;

            const navRect = nav.getBoundingClientRect();
            const currentX = e.clientX - navRect.left - 38;

            setBeadPosition(currentX, 1.12);
            syncColorForPosition(currentX);
        }

        function onPointerUp(e) {
            if (!isDragging) return;

            isDragging = false;

            bead.classList.remove("dragging");
            cutout.classList.remove("dragging");

            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);

            const navRect = nav.getBoundingClientRect();
            const dropX = e.clientX - navRect.left - 38;
            const nearestIdx = findNearestIndex(dropX);

            selectTab(nearestIdx, {
                navigate: nearestIdx !== activeIndex
            });
        }

        bead.addEventListener("pointerdown", (e) => {
            e.preventDefault();

            isDragging = true;

            bead.classList.add("dragging");
            cutout.classList.add("dragging");

            setBeadPosition(getCenterXForIndex(activeIndex), 1.12);

            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
        });

        window.addEventListener("resize", () => {
            setBeadPosition(getCenterXForIndex(activeIndex), 1);
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

        if (!Array.isArray(storedPurchases)) storedPurchases = [];

    } catch (error) {
        console.error("Could not read purchase records:", error);
        storedPurchases = [];
    }

    const activePurchaseContainer = document.getElementById("active-purchase-container");
    const noPurchasesContainer = document.getElementById("no-purchases-container");

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
    const downloadReceiptBtn = document.getElementById("download-receipt-btn");
    const qrContainer = document.getElementById("qrcode");

    // Receipt modal references
    const exportModal = document.getElementById("export-modal");
    const exportCard = document.getElementById("export-card");
    const receiptPaidStamp = document.getElementById("receipt-paid-stamp");
    const receiptPrintingStatus = document.getElementById("receipt-printing-status");

    const exportStationName = document.getElementById("export-station-name");
    const exportStationAddress = document.getElementById("export-station-address");
    const exportPassCode = document.getElementById("export-pass-code");
    const exportLitres = document.getElementById("export-litres");
    const exportAmount = document.getElementById("export-amount");
    const exportValidity = document.getElementById("export-validity");
    const exportQrContainer = document.getElementById("export-qrcode");

    const printReceiptAgainBtn = document.getElementById("print-receipt-again-btn");
    const saveReceiptPdfBtn = document.getElementById("save-receipt-pdf-btn");
    const closeExportModalBtn = document.getElementById("close-export-modal-btn");

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
    if (litresEl) litresEl.textContent = litres.toFixed(1) + " L";

    if (amountEl) {
        amountEl.textContent = "₦" + totalPaid.toLocaleString("en-NG");
    }

    if (passCodeEl) passCodeEl.textContent = passCode;

    // ==========================================
    // 4. GENERATE MAIN FUEL PASS QR CODE
    // ==========================================
    const qrString = `FUELESS-PASS:${passCode}|${stationName}|${litres.toFixed(1)}L`;

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
    // 6. FORMAT VALIDITY DATE AND TIME
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
    const paymentLabel = activePurchaseContainer?.querySelector(".reveal.text-center > span");
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
                countdownEl.classList.add("text-red-700", "bg-red-100");
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
            countdownEl.classList.add("text-emerald-700", "bg-emerald-100/60");
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
    testScanBtn?.addEventListener("click", (e) => {
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

    // ==========================================
    // 9. FUELLESS THERMAL RECEIPT
    // ==========================================
    let receiptStampTimer = null;
    let receiptSaveResetTimer = null;

    // Shared lock: prevents image and PDF downloads running together.
    let receiptIsSaving = false;

    function setReceiptStatus(message) {
        if (receiptPrintingStatus) {
            receiptPrintingStatus.textContent = message;
        }
    }

    function populateReceiptModal() {
        const currentStation =
            stationNameEl?.textContent?.trim() || stationName;

        const currentAddress =
            stationAddressEl?.textContent?.trim() || stationAddress;

        const currentLitres =
            litresEl?.textContent?.trim() || `${litres.toFixed(1)} L`;

        const currentAmount =
            amountEl?.textContent?.trim() ||
            `₦${totalPaid.toLocaleString("en-NG")}`;

        const currentPassCode =
            passCodeEl?.textContent?.trim() || passCode;

        const currentValidity =
            validityDateEl?.textContent?.trim() || formatExpiryDate(expiresAt);

        if (exportStationName) {
            exportStationName.textContent = currentStation;
        }

        if (exportStationAddress) {
            exportStationAddress.textContent = currentAddress;
        }

        if (exportLitres) {
            exportLitres.textContent = currentLitres;
        }

        if (exportAmount) {
            exportAmount.textContent = currentAmount;
        }

        if (exportPassCode) {
            exportPassCode.textContent = currentPassCode;
        }

        if (exportValidity) {
            exportValidity.textContent = currentValidity;
        }

        if (exportQrContainer) {
            exportQrContainer.innerHTML = "";

            if (typeof window.QRCode !== "undefined") {
                const receiptQrText =
                    `FUELESS-PASS:${currentPassCode}|${currentStation}|${currentLitres}`;

                new window.QRCode(exportQrContainer, {
                    text: receiptQrText,
                    width: 120,
                    height: 120,
                    colorDark: "#073621",
                    colorLight: "#ffffff",
                    correctLevel: window.QRCode.CorrectLevel.H
                });
            } else {
                exportQrContainer.textContent = "QR code unavailable";
                console.error("QRCode library failed to load.");
            }
        }
    }

    function resetReceiptAnimation() {
        clearTimeout(receiptStampTimer);

        exportCard?.classList.remove("is-printing");
        receiptPaidStamp?.classList.remove("is-stamped");
    }

    function playReceiptAnimation() {
        if (!exportModal || !exportCard || !receiptPaidStamp) {
            console.error("Receipt modal is missing one or more required elements.");
            return;
        }

        resetReceiptAnimation();

        exportModal.classList.remove("hidden");
        exportModal.classList.add("flex");

        document.body.style.overflow = "hidden";

        setReceiptStatus("Printing your fuel pass...");

        void exportCard.offsetWidth;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                exportCard.classList.add("is-printing");
            });
        });

        receiptStampTimer = setTimeout(() => {
            receiptPaidStamp.classList.add("is-stamped");

            setReceiptStatus(
                isExpired
                    ? "Receipt printed — pass expired"
                    : "Receipt successfully verified!"
            );
        }, 1500);
    }

    function waitForReceiptToSettle() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1850);
        });
    }

    // ==========================================
    // 10. SHARED RECEIPT EXPORT PREPARATION
    // ==========================================
    async function prepareReceiptForExport() {
        if (!exportCard) {
            throw new Error("Receipt element could not be found.");
        }

        // Keep the receipt fully visible for capture.
        exportCard.classList.add("is-printing");
        receiptPaidStamp?.classList.add("is-stamped");

        await waitForReceiptToSettle();

        // Wait for images and QR code assets to finish loading.
        const images = Array.from(exportCard.querySelectorAll("img"));

        await Promise.all(
            images.map((img) => {
                if (img.complete) return Promise.resolve();

                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })
        );

        exportCard.style.opacity = "1";
        exportCard.style.transform = "none";

        exportCard.querySelectorAll(".receipt-row").forEach((row) => {
            row.style.opacity = "1";
            row.style.transform = "none";
        });

        if (receiptPaidStamp) {
            receiptPaidStamp.style.opacity = "1";
            receiptPaidStamp.style.transform = "rotate(-14deg)";
        }
    }

    function getSafeReceiptFilename(extension) {
        const safePassCode = String(passCode)
            .replace(/[^a-z0-9_-]/gi, "-");

        return `Fuelless-Receipt-${safePassCode}.${extension}`;
    }

    // ==========================================
    // 11. SAVE RECEIPT AS PNG IMAGE
    // ==========================================
    async function captureReceiptImage() {
        if (!exportCard || !printReceiptAgainBtn || receiptIsSaving) return;

        if (typeof window.html2canvas !== "function") {
            setReceiptStatus("Image tool unavailable. Please reload the page.");

            alert("The receipt image library did not load. Please reload the page and try again.");
            return;
        }

        receiptIsSaving = true;
        clearTimeout(receiptSaveResetTimer);

        const originalButtonHTML = printReceiptAgainBtn.innerHTML;

        printReceiptAgainBtn.disabled = true;

        printReceiptAgainBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Saving image...</span>
        `;

        try {
            await prepareReceiptForExport();

            setReceiptStatus("Creating your receipt image...");

            const canvas = await window.html2canvas(exportCard, {
                backgroundColor: "#ffffff",
                scale: Math.max(3, window.devicePixelRatio || 1),
                useCORS: true,
                allowTaint: false,
                logging: false,
                imageTimeout: 15000,

                onclone: (clonedDocument) => {
                    const clonedReceipt =
                        clonedDocument.getElementById("export-card");

                    if (clonedReceipt) {
                        clonedReceipt.style.opacity = "1";
                        clonedReceipt.style.transform = "none";
                        clonedReceipt.style.animation = "none";
                        clonedReceipt.style.boxShadow = "none";
                    }

                    clonedDocument
                        .querySelectorAll("#export-card .receipt-row")
                        .forEach((row) => {
                            row.style.opacity = "1";
                            row.style.transform = "none";
                            row.style.animation = "none";
                        });

                    const clonedStamp =
                        clonedDocument.getElementById("receipt-paid-stamp");

                    if (clonedStamp) {
                        clonedStamp.style.opacity = "1";
                        clonedStamp.style.transform = "rotate(-14deg)";
                        clonedStamp.style.animation = "none";
                    }
                }
            });

            const downloadLink = document.createElement("a");

            downloadLink.download = getSafeReceiptFilename("png");
            downloadLink.href = canvas.toDataURL("image/png");

            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            setReceiptStatus("Your receipt image has been saved!");

            printReceiptAgainBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                <span>Image Saved!</span>
            `;

            receiptSaveResetTimer = setTimeout(() => {
                if (printReceiptAgainBtn) {
                    printReceiptAgainBtn.innerHTML = originalButtonHTML;
                }
            }, 2500);

        } catch (error) {
            console.error("Receipt image download failed:", error);

            setReceiptStatus("Unable to save receipt image. Please try again.");

            alert("We couldn't save your receipt image. Please try again.");

            printReceiptAgainBtn.innerHTML = originalButtonHTML;

        } finally {
            printReceiptAgainBtn.disabled = false;
            receiptIsSaving = false;
        }
    }

    // ==========================================
    // 12. SAVE RECEIPT AS PDF
    // ==========================================
    async function saveReceiptAsPDF() {
        if (!exportCard || !saveReceiptPdfBtn || receiptIsSaving) return;

        if (typeof window.html2pdf !== "function") {
            setReceiptStatus("PDF tool unavailable. Please reload the page.");

            alert(
                "The PDF library did not load. Check your internet connection, reload the page, and try again."
            );

            return;
        }

        receiptIsSaving = true;
        clearTimeout(receiptSaveResetTimer);

        const originalButtonHTML = saveReceiptPdfBtn.innerHTML;

        saveReceiptPdfBtn.disabled = true;

        saveReceiptPdfBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Saving Receipt...</span>
        `;

        if (printReceiptAgainBtn) {
            printReceiptAgainBtn.disabled = true;
        }

        try {
            await prepareReceiptForExport();

            setReceiptStatus("Creating your downloadable receipt PDF...");

            // Use the full receipt height so the receipt is not cut off.
            const receiptHeightPx = Math.max(
                exportCard.scrollHeight,
                exportCard.getBoundingClientRect().height
            );

            const receiptHeightMm = Math.max(
                140,
                Math.ceil(receiptHeightPx * 0.264583) + 8
            );

            const pdfOptions = {
                margin: 0,

                filename: getSafeReceiptFilename("pdf"),

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {
                    scale: Math.max(3, window.devicePixelRatio || 1),
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: "#ffffff",
                    logging: false,
                    imageTimeout: 15000,
                    scrollX: 0,
                    scrollY: 0,

                    onclone: (clonedDocument) => {
                        const clonedReceipt =
                            clonedDocument.getElementById("export-card");

                        if (clonedReceipt) {
                            clonedReceipt.style.opacity = "1";
                            clonedReceipt.style.transform = "none";
                            clonedReceipt.style.animation = "none";
                            clonedReceipt.style.boxShadow = "none";
                        }

                        clonedDocument
                            .querySelectorAll("#export-card .receipt-row")
                            .forEach((row) => {
                                row.style.opacity = "1";
                                row.style.transform = "none";
                                row.style.animation = "none";
                            });

                        const clonedStamp =
                            clonedDocument.getElementById("receipt-paid-stamp");

                        if (clonedStamp) {
                            clonedStamp.style.opacity = "1";
                            clonedStamp.style.transform = "rotate(-14deg)";
                            clonedStamp.style.animation = "none";
                        }
                    }
                },

                jsPDF: {
                    unit: "mm",
                    format: [90, receiptHeightMm],
                    orientation: "portrait",
                    compress: true
                },

                pagebreak: {
                    mode: ["avoid-all", "css", "legacy"]
                }
            };

            // Generate and download the PDF.
            await window.html2pdf()
                .set(pdfOptions)
                .from(exportCard)
                .save();

            setReceiptStatus("Your Fuelless receipt has been saved successfully!");

            saveReceiptPdfBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                <span>Receipt Saved!</span>
            `;

            receiptSaveResetTimer = setTimeout(() => {
                if (saveReceiptPdfBtn) {
                    saveReceiptPdfBtn.innerHTML = originalButtonHTML;
                }
            }, 2500);

        } catch (error) {
            console.error("Receipt PDF download failed:", error);

            setReceiptStatus("Unable to save receipt. Please try again.");

            alert(
                "We couldn't save your receipt as a PDF. Please try again."
            );

            saveReceiptPdfBtn.innerHTML = originalButtonHTML;

        } finally {
            saveReceiptPdfBtn.disabled = false;

            if (printReceiptAgainBtn) {
                printReceiptAgainBtn.disabled = false;
            }

            receiptIsSaving = false;
        }
    }

    // ==========================================
    // 13. OPEN AND ANIMATE THE RECEIPT
    // ==========================================
    downloadReceiptBtn?.addEventListener("click", (e) => {
        e.preventDefault();

        updateCountdown();
        populateReceiptModal();
        playReceiptAnimation();
    });

    // Save receipt as PNG.
    printReceiptAgainBtn?.addEventListener("click", captureReceiptImage);

    // SAVE RECEIPT AS PDF.
    saveReceiptPdfBtn?.addEventListener("click", saveReceiptAsPDF);

    // ==========================================
    // 14. CLOSE RECEIPT MODAL
    // ==========================================
    function closeExportModal() {
        if (!exportModal) return;

        // Do not close while a receipt is being saved.
        if (receiptIsSaving) return;

        resetReceiptAnimation();
        clearTimeout(receiptSaveResetTimer);

        exportModal.classList.add("hidden");
        exportModal.classList.remove("flex");

        document.body.style.overflow = "";

        if (printReceiptAgainBtn) {
            printReceiptAgainBtn.disabled = false;

            printReceiptAgainBtn.innerHTML = `
                <i class="fa-solid fa-download"></i>
                <span>Save image</span>
            `;
        }

        if (saveReceiptPdfBtn) {
            saveReceiptPdfBtn.disabled = false;

            saveReceiptPdfBtn.innerHTML = `
                <i class="fa-solid fa-download"></i>
                <span>Save Receipt</span>
            `;
        }

        setReceiptStatus("Preparing your receipt...");
    }

    closeExportModalBtn?.addEventListener("click", closeExportModal);

    exportModal?.addEventListener("click", (e) => {
        if (e.target === exportModal) {
            closeExportModal();
        }
    });

    // ==========================================
    // 15. ESCAPE KEY CLOSES OPEN MODAL
    // ==========================================
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        if (exportModal && !exportModal.classList.contains("hidden")) {
            closeExportModal();
        } else if (profileModal && !profileModal.classList.contains("hidden")) {
            closeProfile();
        }
    });

});