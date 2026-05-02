// Toast Notification System
function createToastContainer() {
    if (!document.getElementById('toastContainer')) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return document.getElementById('toastContainer');
}

function showToast(title, message, type = 'info', duration = 3000) {
    const container = createToastContainer();
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-box ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Convenience functions
function toastSuccess(title, message) {
    showToast(title, message, 'success');
}

function toastError(title, message) {
    showToast(title, message, 'error');
}

function toastWarning(title, message) {
    showToast(title, message, 'warning');
}

function toastInfo(title, message) {
    showToast(title, message, 'info');
}