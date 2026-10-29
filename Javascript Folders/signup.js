document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const signupForm = document.getElementById('signup-form');

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

    // Signup form submit handler with Local Storage persistence
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullname-input').value.trim();
            const phone = document.getElementById('phone-input').value.trim();
            const email = document.getElementById('email-input').value.trim();

            if (!fullName || !email) {
                alert("Please fill in all required fields.");
                return;
            }

            // Create user data object
            const userData = {
                fullName: fullName,
                phone: phone,
                email: email
            };

            // Save user profile and set active user session in Local Storage
            localStorage.setItem('fuelless_users_' + email.toLowerCase(), JSON.stringify(userData));
            localStorage.setItem('fuelless_current_user', JSON.stringify(userData));

            alert(`Account created successfully! Welcome, ${fullName}.`);

            // Redirect to overview/welcome page
            window.location.href = './welcomepage.html';
        });
    }
});