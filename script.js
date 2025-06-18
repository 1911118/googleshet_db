document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const config = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxrqrvUJYzO_92JKwq8hlg9MHXTYdMb7xnKSn_09K1Jw2LyOe_RFBxRvDWFLhREEyIs/exec', // Replace with your Web app URL
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

        // Construct the query string for both POST and GET requests.
        // Note: Sending sensitive data like passwords in GET requests is insecure and should be avoided in production.
        const queryString = new URLSearchParams({ action, ...data }).toString();

        try {
            // The initial POST request with 'no-cors' mode.
            // This is often used as a workaround when the server doesn't support CORS preflight requests.
            // However, it means we can't read the response from this request.
            await fetch(config.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors', // This prevents reading the response, necessitating the second GET request.
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: queryString
            });

            // The second GET request to fetch the actual response.
            // This is inefficient. Ideally, the backend should handle the POST request
            // with proper CORS headers and return the response directly.
            const response = await fetch(`${config.googleScriptUrl}?${queryString}`);

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