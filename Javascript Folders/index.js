document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. REPEATABLE SCROLL REVEAL ANIMATIONS
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Triggers slightly before element enters view
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const target = entry.target;

            if (entry.isIntersecting) {
                // WHEN ENTERING VIEW: Reveal elements (Animate in)
                target.classList.remove('opacity-0', 'translate-y-8', '-translate-x-12', 'translate-x-12');
                target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0');
            } else {
                // WHEN LEAVING VIEW: Reset back to hidden state so it animates again when scrolled past
                target.classList.remove('opacity-100', 'translate-y-0', 'translate-x-0');
                
                // Re-apply original initial direction classes based on element type
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

    // Observe all reveal elements across all sections
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 2. HERO LIVE WAIT TIME COUNTER SIMULATOR
    // ==========================================
    const waitTimer = document.getElementById('hero-wait-timer');
    if (waitTimer) {
        const statuses = ['4 min wait', '3 min wait', '2 min wait', 'Ready to fuel'];
        let statusIndex = 0;

        setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            
            // Fade out transition
            waitTimer.classList.add('opacity-0');

            setTimeout(() => {
                waitTimer.textContent = statuses[statusIndex];
                
                // Highlight text green when ready
                if (statusIndex === 3) {
                    waitTimer.classList.add('text-green-600');
                } else {
                    waitTimer.classList.remove('text-green-600');
                }
                
                // Fade back in
                waitTimer.classList.remove('opacity-0');
            }, 300);
        }, 3500);
    }

});