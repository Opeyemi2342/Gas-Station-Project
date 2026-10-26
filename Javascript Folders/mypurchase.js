document.addEventListener("DOMContentLoaded", () => {
  
  // 1. DYNAMIC DATE & COUNTDOWN TIMER LOGIC
  const countdownEl = document.getElementById("countdown-timer");
  const validityTextEl = document.getElementById("validity-date-text");

  // Calculate dynamic future date (24 hours from now)
  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 24);
  
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = futureDate.toLocaleDateString('en-US', options);
  validityTextEl.textContent = `${formattedDate}, 8:42 AM`;

  // Countdown timer starting duration (23 hours, 48 minutes, 12 seconds)
  let totalSeconds = 23 * 3600 + 48 * 60 + 12;

  const timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      countdownEl.textContent = "Expired";
      countdownEl.className = "text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full";
      return;
    }

    totalSeconds--;

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    countdownEl.textContent = `${hours}:${minutes}:${seconds} left`;
  }, 1000);


  // 2. TEST ATTENDANT SCAN FUNCTIONALITY
  const testScanBtn = document.getElementById("test-scan-btn");

  testScanBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    testScanBtn.innerHTML = `<i class="fa-solid fa-check-circle text-base"></i><span>Pass Successfully Verified & Redeemed!</span>`;
    testScanBtn.classList.remove("bg-[#145337]", "hover:bg-[#09482d]");
    testScanBtn.classList.add("bg-emerald-600", "cursor-pointer");

    alert("Scan Successful! Pass FL-2682-7K9P verified at Nipco Energy, Lekki. 20.0 Litres of PMS approved for dispensing.");
  });


  // 3. DOWNLOAD RECEIPT AS A PICTURE (.PNG)
  const downloadReceiptBtn = document.getElementById("download-receipt-btn");

  downloadReceiptBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const cardElement = document.getElementById("fuel-pass-card");

    // Change button text temporarily to show loading
    const originalText = downloadReceiptBtn.innerHTML;
    downloadReceiptBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-sm"></i><span>Generating image...</span>`;

    html2canvas(cardElement, {
      scale: 2, // Increases image sharpness/resolution
      useCORS: true,
      backgroundColor: null
    }).then((canvas) => {
      // Convert canvas to image data URL
      const imageURL = canvas.toDataURL("image/png");

      // Create a virtual download link
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "Fuelless-Pass-FL-2682-7K9P.png";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore button text
      downloadReceiptBtn.innerHTML = originalText;
    }).catch((error) => {
      console.error("Error generating image:", error);
      alert("Could not download receipt image. Please try again.");
      downloadReceiptBtn.innerHTML = originalText;
    });
  });

});