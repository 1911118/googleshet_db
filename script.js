document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const config = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxrqrvUJYzO_92JKwq8hlg9MHXTYdMb7xnKSn_09K1Jw2LyOe_RFBxRvDWFLhREEyIs/exec'
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
            // Try POST request first
            const response = await fetch(config.googleScriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: queryString
            });

            if (response.ok) {
                const result = await response.json();
                showMessage(result.message, result.status);
                if (result.status === 'success') {
                    form.reset();
                    if (action === 'signin') {
                        alert(`Welcome, ${result.name}!`);
                    }
                }
                return;
            }

            // Fallback to no-cors POST + GET if POST fails due to CORS
            await fetch(config.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: queryString
            });

            const getResponse = await fetch(`${config.googleScriptUrl}?${queryString}`);
            if (!getResponse.ok) {
                throw new Error(`HTTP error! status: ${getResponse.status}`);
            }

            const result = await getResponse.json();
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