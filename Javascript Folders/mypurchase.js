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
    // 1. LOAD LATEST PURCHASE OR MOCK DATA
    // ==========================================
    const storedPurchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
    let activePassData;

    if (storedPurchases.length > 0) {
        activePassData = storedPurchases[0];
    } else {
        activePassData = {
            station: "Nipco Energy, Lekki",
            address: "11 Admiralty Way • Pump 1–6",
            litres: "20.0",
            totalPaid: "17600",
            passCode: "FL-2682-7K9P",
            date: "Today, 8:42 AM"
        };
    }

    // Populate DOM Elements
    const stationNameEl = document.getElementById('pass-station-name');
    const stationAddressEl = document.getElementById('pass-station-address');
    const litresEl = document.getElementById('pass-litres');
    const amountEl = document.getElementById('pass-amount');
    const passCodeEl = document.getElementById('pass-code-text');

    if (stationNameEl) stationNameEl.textContent = activePassData.station;
    if (stationAddressEl) stationAddressEl.textContent = activePassData.address;
    if (litresEl) litresEl.textContent = `${activePassData.litres} L`;
    if (amountEl) amountEl.textContent = `₦${Number(activePassData.totalPaid).toLocaleString()}`;
    if (passCodeEl) passCodeEl.textContent = activePassData.passCode || "FL-2682-7K9P";

    // Export Modal Fields
    const exportStationName = document.getElementById('export-station-name');
    const exportStationAddress = document.getElementById('export-station-address');
    const exportLitres = document.getElementById('export-litres');
    const exportAmount = document.getElementById('export-amount');
    const exportPassCode = document.getElementById('export-pass-code');

    if (exportStationName) exportStationName.textContent = activePassData.station;
    if (exportStationAddress) exportStationAddress.textContent = activePassData.address;
    if (exportLitres) exportLitres.textContent = `${activePassData.litres} L`;
    if (exportAmount) exportAmount.textContent = `₦${Number(activePassData.totalPaid).toLocaleString()}`;
    if (exportPassCode) exportPassCode.textContent = activePassData.passCode || "FL-2682-7K9P";


    // ==========================================
    // 2. GENERATE QR CODES
    // ==========================================
    const qrContainer = document.getElementById('qrcode');
    const exportQrContainer = document.getElementById('export-qrcode');
    const qrString = `FUELESS-PASS:${activePassData.passCode || 'FL-2682-7K9P'}|${activePassData.station}|${activePassData.litres}L`;

    if (qrContainer) {
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
            text: qrString,
            width: 160,
            height: 160,
            colorDark: "#073621",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    if (exportQrContainer) {
        exportQrContainer.innerHTML = "";
        new QRCode(exportQrContainer, {
            text: qrString,
            width: 150,
            height: 150,
            colorDark: "#073621",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }


    // ==========================================
    // 3. TEST ATTENDANT SCAN & SAFE IMAGE DOWNLOAD
    // ==========================================
    const testScanBtn = document.getElementById('test-scan-btn');
    if (testScanBtn) {
        testScanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`[Attendant Scanner Simulation]\n\nPass Code: ${activePassData.passCode || 'FL-2682-7K9P'}\nStation: ${activePassData.station}\nLitres: ${activePassData.litres}L\nStatus: VERIFIED & READY FOR DISPENSE.`);
        });
    }

    const downloadReceiptBtn = document.getElementById('download-receipt-btn');
    const exportModal = document.getElementById('export-modal');

    if (downloadReceiptBtn && exportModal) {
        downloadReceiptBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Show modal invisibly/flexibly so html2canvas can capture it
            exportModal.style.display = 'flex';
            exportModal.style.opacity = '0';

            const exportCard = document.getElementById('export-card');
            
            try {
                // Brief pause to let the QR code render fully in the export card
                await new Promise(resolve => setTimeout(resolve, 200));

                const canvas = await html2canvas(exportCard, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false, // Ensures browser security policies don't crash the canvas
                    backgroundColor: "#ffffff",
                    logging: false
                });

                canvas.toBlob((blob) => {
                    exportModal.style.display = 'none';
                    exportModal.style.opacity = '1';

                    if (!blob) {
                        alert("Pass image generation failed. Please try again.");
                        return;
                    }

                    const fileName = `Fuelless-Pass-${activePassData.passCode || 'FL-2682-7K9P'}.png`;
                    const blobUrl = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                    }, 1000);

                }, 'image/png');

            } catch (err) {
                exportModal.style.display = 'none';
                exportModal.style.opacity = '1';
                console.error("Canvas Export Error:", err);
                
                // Fallback action if html2canvas gets blocked by browser security
                alert("Direct image download was blocked by browser security restrictions. Don't worry—you can simply take a screenshot of your digital pass card on screen to save it!");
            }
        });
    }

});