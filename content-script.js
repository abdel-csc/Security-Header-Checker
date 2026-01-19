// content-script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fetchHeaders') {
        fetchHeaders(message.url).then(headers => {
            sendResponse({ headers: headers });
        }).catch(error => {
            sendResponse({ error: error.message });
        });

        return true; // Keep message channel open for async response
    }
});

async function fetchHeaders(url) {
    try {
        // Use a simple fetch request
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors', // Use no-cors mode to avoid CORS issues
            cache: 'no-cache'
        });

        const headers = {};
        // Note: In no-cors mode, we can't read headers directly
        // Alternative approach using XMLHttpRequest
        return await fetchHeadersViaXHR(url);

    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

function fetchHeadersViaXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === xhr.HEADERS_RECEIVED) {
                const headers = {};
                const headerLines = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);

                headerLines.forEach(line => {
                    const parts = line.split(': ');
                    const header = parts.shift().toLowerCase();
                    const value = parts.join(': ');
                    headers[header] = value;
                });

                resolve(headers);
                xhr.abort();
            }
        };

        xhr.onerror = () => reject(new Error('Failed to fetch headers'));
        xhr.send();
    });
}