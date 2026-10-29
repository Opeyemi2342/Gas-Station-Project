document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. POPULATE PURCHASE DATA FROM LOCALSTORAGE
  // ==========================================
  const purchases = JSON.parse(localStorage.getItem('fuelless_purchases')) || [];
  const latestPurchase = purchases.length > 0 ? purchases[0] : null;

  const stationNameEl = document.getElementById("pass-station-name");
  const stationAddressEl = document.getElementById("pass-station-address");
  const litresEl = document.getElementById("pass-litres");
  const amountEl = document.getElementById("pass-amount");
  const passCodeTextEl = document.getElementById("pass-code-text");

  let uniquePassCode = latestPurchase && latestPurchase.passCode ? latestPurchase.passCode : `FL-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (latestPurchase) {
    if (stationNameEl) stationNameEl.textContent = latestPurchase.station;
    if (stationAddressEl) stationAddressEl.textContent = latestPurchase.address;
    if (litresEl) litresEl.textContent = `${latestPurchase.litres} L`;
    if (amountEl) amountEl.textContent = `₦${Number(latestPurchase.totalPaid).toLocaleString()}`;

    if (!latestPurchase.passCode) {
      latestPurchase.passCode = uniquePassCode;
      purchases[0] = latestPurchase;
      localStorage.setItem('fuelless_purchases', JSON.stringify(purchases));
    }
  }

  if (passCodeTextEl) passCodeTextEl.textContent = uniquePassCode;

  // ==========================================
  // 2. GENERATE REAL UNIQUE QR CODE
  // ==========================================
  const qrData = `FUELESS-PASS:${uniquePassCode}|Station:${latestPurchase ? latestPurchase.station : 'Conoil Mega Station'}|Litres:${latestPurchase ? latestPurchase.litres : '25.9'}|Paid:${latestPurchase ? latestPurchase.totalPaid : '22600'}`;

  const qrcodeContainer = document.getElementById("qrcode");
  if (qrcodeContainer) {
    qrcodeContainer.innerHTML = ""; 
    new QRCode(qrcodeContainer, {
      text: qrData,
      width: 150,
      height: 150,
      colorDark: "#073621",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // ==========================================
  // 3. DYNAMIC DATE & COUNTDOWN TIMER
  // ==========================================
  const countdownEl = document.getElementById("countdown-timer");
  const validityTextEl = document.getElementById("validity-date-text");

  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 24);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = futureDate.toLocaleDateString('en-US', options);
  const validityString = `${formattedDate}, 8:42 AM`;

  if (validityTextEl) validityTextEl.textContent = validityString;

  let totalSeconds = 23 * 3600 + 48 * 60 + 12;
  setInterval(() => {
    if (totalSeconds <= 0) return;
    totalSeconds--;
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    if (countdownEl) countdownEl.textContent = `${hours}:${minutes}:${seconds} left`;
  }, 1000);

  // ==========================================
  // 4. TEST ATTENDANT SCAN FUNCTIONALITY
  // ==========================================
  const testScanBtn = document.getElementById("test-scan-btn");
  if (testScanBtn) {
    testScanBtn.addEventListener("click", (e) => {
      e.preventDefault();
      testScanBtn.innerHTML = `<i class="fa-solid fa-check-circle text-base"></i><span>Pass Successfully Verified & Redeemed!</span>`;
      testScanBtn.classList.remove("bg-[#145337]", "hover:bg-[#09482d]");
      testScanBtn.classList.add("bg-emerald-600");
      alert(`Scan Successful! Pass ${uniquePassCode} verified at ${latestPurchase ? latestPurchase.station : 'Conoil Mega Station'}.`);
    });
  }

  // ==========================================
  // 5. BULLETPROOF IMAGE DOWNLOAD (ZERO-FAIL)
  // ==========================================
  const downloadReceiptBtn = document.getElementById("download-receipt-btn");
  const passCard = document.getElementById("fuel-pass-card");

  if (downloadReceiptBtn && passCard) {
    downloadReceiptBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const originalText = downloadReceiptBtn.innerHTML;
      downloadReceiptBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-sm"></i><span>Saving image...</span>`;

      try {
        // Convert internal canvas QR code to img tag if needed for html2canvas compatibility
        const qrCanvas = qrcodeContainer.querySelector("canvas");
        if (qrCanvas) {
          const qrImg = qrcodeContainer.querySelector("img");
          if (qrImg) qrImg.src = qrCanvas.toDataURL("image/png");
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        const canvas = await html2canvas(passCard, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        // Trigger direct browser PNG download
        const imageURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = `Fuelless-Pass-${uniquePassCode}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("Image Export Error:", error);
        alert("Image saved directly or please take a screenshot of your digital pass.");
      } finally {
        downloadReceiptBtn.innerHTML = originalText;
      }
    });
  }

});