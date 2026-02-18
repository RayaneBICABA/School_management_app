import api from '@/services/api';

/**
 * Handles PDF actions (viewing or downloading) with proper auth headers.
 * @param {string} id - The bulletin or document ID.
 * @param {string} filename - The suggested filename for download.
 * @param {string} mode - 'download' or 'view' (inline).
 * @param {string} type - 'bulletin' or 'class' (determines the API method to use).
 * @param {Object} params - Additional query params (especially for class PDFs).
 */
export const handlePDFAction = async (id, filename, mode = 'download', type = 'bulletin', params = {}) => {
    try {
        let response;
        if (type === 'class') {
            response = await api.downloadClassBulletins(id, params);
        } else {
            // For single bulletin, we pass mode via params object
            if (mode === 'view') {
                response = await api.downloadBulletinPDF(id, { mode: 'inline' });
            } else {
                response = await api.downloadBulletinPDF(id);
            }
        }

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        if (mode === 'view') {
            window.open(url, '_blank');
            // Note: We can't easily revoke the URL immediately if it's opened in a new tab,
            // but browsers usually clean these up.
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error handling PDF action:', error);
        alert('Erreur lors de la récupération du PDF. Veuillez réessayer.');
    }
};
