document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const config = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwjMFkqZvR_UC2NKcm1kSKFKwdY0Nand7zlIqh75-5dxDe8i4e0jOV-k7Ou_i1NAaa4/exec'
    };

    // --- Element References ---
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');
    const messageElement = document.getElementById('message');

    /**
     * Displays a message to the user.
     * @param {string} text - The message to display.
     * @param {'success' | 'error'} type - The type of message.
     */
    const showMessage = (text, type = 'error') => {
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.style.color = type === 'success' ? 'green' : 'red';
        }
    };

    /**
     * Handles form submissions by sending data to the Google Script.
     * @param {Event} e - The form submission event.
     * @param {'signup' | 'signin'} action - The action to perform.
     */
    const handleFormSubmit = async (e, action) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const queryString = new URLSearchParams({ action, ...data }).toString();

        try {
            const response = await fetch(config.googleScriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: queryString
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showMessage(result.message, result.status);

            if (result.status === 'success') {
                form.reset();
                if (action === 'signin') {
                    alert(`Welcome, ${result.name}!`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error connecting to the server. Please try again later.');
        }
    };

    // --- Event Listeners ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => handleFormSubmit(e, 'signup'));
    }

    if (signinForm) {
        signinForm.addEventListener('submit', (e) => handleFormSubmit(e, 'signin'));
    }
});