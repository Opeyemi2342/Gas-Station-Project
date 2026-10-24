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
                target.classList.add('opacity-0', 'translate-y-8');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 2. MOBILE HAMBURGER MENU TOGGLE
    // ==========================================
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }


    // ==========================================
    // 3. SLOT-MACHINE SCRAMBLE & ROLLING BALANCE ANIMATION
    // ==========================================
    const walletBalanceEl = document.getElementById('wallet-balance');
    const addMoneyBtn = document.getElementById('add-money-btn');
    let currentBalance = 42850.00; // Starting wallet balance

    function slotMachineRollBalance(targetVal, duration = 1200) {
        if (!walletBalanceEl) return;
        
        const startTime = performance.now();

        function rollStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                // Generate a chaotic randomized slot-machine number sequence during transition
                const randomScramble = Math.floor(Math.random() * 900000 + 10000) + Math.random();
                walletBalanceEl.textContent = `₦${randomScramble.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                requestAnimationFrame(rollStep);
            } else {
                // Lock perfectly onto the exact target balance
                walletBalanceEl.textContent = `₦${targetVal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }

        requestAnimationFrame(rollStep);
    }

    // Run the rolling scramble effect automatically when the page loads
    slotMachineRollBalance(currentBalance, 1000);

    // Handle adding money with slot-machine effect
    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => {
            let inputAmount = prompt("Enter amount to add to your fuel wallet (e.g., 10000):", "10000");
            
            if (inputAmount !== null) {
                let addedValue = parseFloat(inputAmount);
                
                if (!isNaN(addedValue) && addedValue > 0) {
                    currentBalance += addedValue;
                    // Trigger slot-machine rolling animation to the new total
                    slotMachineRollBalance(currentBalance, 1400);
                } else {
                    alert("Please enter a valid monetary amount.");
                }
            }
        });
    }


    // ==========================================
    // 4. NOTIFICATION BELL INTERACTION
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

});