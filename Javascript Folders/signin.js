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

    // Form submission handler -> Redirects to Welcome / Overview page
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Welcome back, Opeyemi! Sign in successful.");
            window.location.href = './welcomepage.html';
        });
    }

});