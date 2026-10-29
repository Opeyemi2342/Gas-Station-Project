document.addEventListener('DOMContentLoaded', () => {

    const authForm = document.getElementById('auth-form');
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // Password visibility toggle ("Show" / "Hide")
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.textContent = 'Show';
            }
        });
    }

    // Signin form submit handler
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email-input').value.trim();
            const emailKey = emailInput.toLowerCase();

            // Check if user exists in local storage
            const storedUser = localStorage.getItem('fuelless_users_' + emailKey);

            let currentUser;
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
            } else {
                // Default fallback if signing in without prior registration
                const fallbackName = emailInput.split('@')[0];
                const capitalizedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
                
                currentUser = {
                    fullName: capitalizedName,
                    email: emailInput
                };
                
                // Save new user profile to local storage
                localStorage.setItem('fuelless_users_' + emailKey, JSON.stringify(currentUser));
            }

            // Store the currently active logged-in user session
            localStorage.setItem('fuelless_current_user', JSON.stringify(currentUser));

            alert(`Sign in successful! Welcome back, ${currentUser.fullName}.`);

            // Redirect to overview/welcome page
            window.location.href = './welcomepage.html';
        });
    }

});