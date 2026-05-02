/**
 * The Burger Joint - Admin Dashboard JavaScript
 * Uses Supabase for data storage
 */

document.addEventListener('DOMContentLoaded', function() {
    initLogin();
});

let menuItems = [];
let currentFilter = 'all';
let editingItemId = null;
let deleteItemId = null;
let currentImageData = null;

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');

    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');

    if (isLoggedIn === 'true') {
        showDashboard();
        return;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = passwordInput.value;

        if (password === 'admin') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.classList.add('show');
            passwordInput.value = '';
        }
    });
}

async function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    await loadAdminItems();
    initAdminEventListeners();
}

async function loadAdminItems() {
    try {
        menuItems = await supabaseClient.getAllMenuItems();
        updateStats();
        renderAdminItems();
        renderPreview();
    } catch (error) {
        console.error('Error loading items:', error);
        showToast('Failed to load menu items', 'error');
    }
}

function initAdminEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addItemBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('itemForm').addEventListener('submit', saveItem);
    document.getElementById('closePreview').addEventListener('click', togglePreview);
    document.getElementById('publishBtn').addEventListener('click', publishAll);
    document.getElementById('previewBtn').addEventListener('click', togglePreview);

    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    document.getElementById('itemStatus').addEventListener('change', function() {
        document.getElementById('statusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    initImageUpload();
    initCategoryFilter();
}

function initImageUpload() {
    const uploadZone = document.getElementById('imageUploadZone');
    const fileInput = document.getElementById('itemImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImage');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--primary-red)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--border-color)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--border-color)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageData = null;
        imagePreview.classList.remove('show');
        fileInput.value = '';
    });
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');

        previewImg.src = currentImageData;
        imagePreview.classList.add('show');
        uploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function initCategoryFilter() {
    const categoryItems = document.querySelectorAll('.category-filter li');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentFilter = item.dataset.category;
            renderAdminItems();
        });
    });
}

function renderAdminItems() {
    const itemsGrid = document.getElementById('itemsGrid');

    let filteredItems = menuItems;
    if (currentFilter !== 'all') {
        filteredItems = menuItems.filter(item => item.category === currentFilter);
    }

    if (!filteredItems || filteredItems.length === 0) {
        itemsGrid.innerHTML = '<p style="text-align: center; color: var(--medium-gray); padding: 40px;">No items yet. Click "Add Item" to get started.</p>';
        return;
    }

    itemsGrid.innerHTML = filteredItems.map(item => `
        <div class="admin-item-card">
            <img src="${item.image}" alt="${item.name}" class="admin-item-image">
            <div class="admin-item-content">
                <h4 class="admin-item-name">${item.name}</h4>
                <p class="admin-item-category">${item.category}</p>
                <p class="admin-item-price">$${parseFloat(item.price).toFixed(2)}</p>
                <span class="admin-item-status ${item.status}">${item.status}</span>
                <div class="admin-item-actions">
                    <button class="edit-btn" onclick="editItem('${item.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const drafts = menuItems ? menuItems.filter(item => item.status === 'draft').length : 0;
    const published = menuItems ? menuItems.filter(item => item.status === 'published').length : 0;

    document.getElementById('draftCount').textContent = drafts;
    document.getElementById('publishedCount').textContent = published;
}

function renderPreview() {
    const previewContent = document.getElementById('previewContent');
    const drafts = menuItems ? menuItems.filter(item => item.status === 'draft') : [];

    if (!drafts || drafts.length === 0) {
        previewContent.innerHTML = '<p class="preview-empty">No draft changes to preview</p>';
        return;
    }

    previewContent.innerHTML = drafts.map(item => `
        <div class="preview-item">
            <img src="${item.image}" alt="${item.name}">
            <p class="preview-item-name">${item.name}</p>
            <p class="preview-item-desc">${item.description ? item.description.substring(0, 50) : ''}...</p>
            <p class="preview-item-price">$${parseFloat(item.price).toFixed(2)}</p>
        </div>
    `).join('');
}

function openModal(item = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('itemForm');

    if (item) {
        modalTitle.textContent = 'Edit Item';
        editingItemId = item.id;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemStatus').checked = item.status === 'published';
        document.getElementById('statusLabel').textContent = item.status === 'published' ? 'Published' : 'Draft';

        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');

        currentImageData = item.image;
        previewImg.src = item.image;
        imagePreview.classList.add('show');
        uploadPlaceholder.style.display = 'none';
    } else {
        modalTitle.textContent = 'Add New Item';
        editingItemId = null;
        form.reset();
        currentImageData = null;

        const imagePreview = document.getElementById('imagePreview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        imagePreview.classList.remove('show');
        uploadPlaceholder.style.display = 'flex';
        document.getElementById('itemStatus').checked = false;
        document.getElementById('statusLabel').textContent = 'Draft';
    }

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('show');
    editingItemId = null;
    currentImageData = null;
}

async function saveItem(e) {
    e.preventDefault();

    const category = document.getElementById('itemCategory').value;
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const status = document.getElementById('itemStatus').checked ? 'published' : 'draft';

    if (!currentImageData) {
        showToast('Please upload an image', 'error');
        return;
    }

    try {
        if (editingItemId) {
            await supabaseClient.updateMenuItem(editingItemId, {
                category,
                name,
                description,
                price,
                image: currentImageData,
                status
            });
            showToast('Item updated successfully', 'success');
        } else {
            const newItem = {
                id: 'item-' + Date.now(),
                category,
                name,
                description,
                price,
                image: currentImageData,
                status
            };
            await supabaseClient.addMenuItem(newItem);
            showToast('Item added successfully', 'success');
        }

        await loadAdminItems();
        closeModal();
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Failed to save item', 'error');
    }
}

function editItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        openModal(item);
    }
}

function deleteItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        deleteItemId = id;
        document.getElementById('deleteItemName').textContent = item.name;
        document.getElementById('deleteModal').classList.add('show');
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteItemId = null;
}

async function confirmDelete() {
    if (deleteItemId) {
        try {
            await supabaseClient.deleteMenuItem(deleteItemId);
            await loadAdminItems();
            showToast('Item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast('Failed to delete item', 'error');
        }
        closeDeleteModal();
    }
}

async function publishAll() {
    try {
        await supabaseClient.publishAll();
        await loadAdminItems();
        showToast('All items published! Your menu is now live.', 'success');
    } catch (error) {
        console.error('Error publishing items:', error);
        showToast('Failed to publish items', 'error');
    }
}

function togglePreview() {
    const previewPanel = document.getElementById('previewPanel');
    if (previewPanel.style.display === 'none') {
        renderPreview();
        previewPanel.style.display = 'block';
    } else {
        previewPanel.style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = 'toast ' + type;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}