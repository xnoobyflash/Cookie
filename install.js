let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'inline-block';
});

document.getElementById('installButton').addEventListener('click', async () => {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We no longer need the prompt. Clear it up
        deferredPrompt = null;
        // Hide the install button
        document.getElementById('installButton').style.display = 'none';
    }
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
    // Hide the install button
    document.getElementById('installButton').style.display = 'none';
    // Clear the deferredPrompt
    deferredPrompt = null;
});
