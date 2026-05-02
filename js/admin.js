/**
 * Big Buns Burger - Admin Dashboard JavaScript
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
let currentAdminBranch = '';
let branchesData = {};

const fallbackBranches = [
    { id: 'main', name: 'Main Branch' },
    { id: 'north', name: 'North Branch' },
    { id: 'south', name: 'South Branch' }
];

async function loadBranchesForAdmin() {
    const select = document.getElementById('adminBranchSelect');
    if (!select) return;
    
    // Clear existing options except first
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    try {
        const branches = await supabaseClient.getBranches();
        if (branches && branches.length > 0) {
            branches.forEach(branch => {
                branchesData[branch.id] = branch;
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                select.appendChild(option);
            });
        } else {
            loadFallbackBranches();
        }
    } catch (e) {
        console.log('Failed to load branches:', e);
        loadFallbackBranches();
    }
}

function loadFallbackBranches() {
    const select = document.getElementById('adminBranchSelect');
    fallbackBranches.forEach(branch => {
        branchesData[branch.id] = branch;
        const option = document.createElement('option');
        option.value = branch.id;
        option.textContent = branch.name;
        select.appendChild(option);
    });
}

function switchAdminBranch(branchId) {
    currentAdminBranch = branchId;
    sessionStorage.setItem('adminBranch', branchId);
    renderAdminItems();
}

function isItemUnavailableAtBranch(item, branchId) {
    if (!branchId) return false;
    const unavailable = item.unavailable_at_branches || [];
    return unavailable.includes(branchId);
}

function toggleItemAvailability(itemId, branchId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const unavailable = item.unavailable_at_branches || [];
    const isCurrentlyUnavailable = unavailable.includes(branchId);
    const makeUnavailable = !isCurrentlyUnavailable;
    
    supabaseClient.toggleItemAvailability(itemId, branchId, makeUnavailable).then(() => {
        loadAdminItems();
    });
}

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
    await loadBranchesForAdmin();
    
    const savedBranch = sessionStorage.getItem('adminBranch');
    if (savedBranch) {
        currentAdminBranch = savedBranch;
        document.getElementById('adminBranchSelect').value = savedBranch;
    }
    
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
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) addItemBtn.addEventListener('click', () => openModal());
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) closeModal.addEventListener('click', closeModal);
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    const itemForm = document.getElementById('itemForm');
    if (itemForm) itemForm.addEventListener('submit', saveItem);
    
    const closePreview = document.getElementById('closePreview');
    if (closePreview) closePreview.addEventListener('click', togglePreview);
    
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) publishBtn.addEventListener('click', publishAll);
    
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) previewBtn.addEventListener('click', togglePreview);

    const closeDeleteModal = document.getElementById('closeDeleteModal');
    if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteModal);
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);

    const itemStatus = document.getElementById('itemStatus');
    if (itemStatus) itemStatus.addEventListener('change', function() {
        document.getElementById('statusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    document.getElementById('itemImageUrl').addEventListener('input', function() {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        if (this.value) {
            previewImg.src = this.value;
            preview.classList.add('show');
        }
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

    const uploadZone = document.getElementById('imageUploadZone');
    uploadZone.style.opacity = '0.5';

    // Compress image before upload
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_WIDTH = 800;
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });

                supabaseClient.uploadImage(compressedFile).then(imageUrl => {
                    currentImageData = imageUrl;
                    const imagePreview = document.getElementById('imagePreview');
                    const previewImg = document.getElementById('previewImg');
                    const uploadPlaceholder = document.querySelector('.upload-placeholder');

                    previewImg.src = imageUrl;
                    imagePreview.classList.add('show');
                    uploadPlaceholder.style.display = 'none';
                    uploadZone.style.opacity = '1';
                    showToast('Image uploaded and compressed!', 'success');
                }).catch(error => {
                    console.error('Upload error:', error);
                    uploadZone.style.opacity = '1';
                    showToast('Failed to upload image', 'error');
                });
            }, 'image/jpeg', 0.8);
        };
    };
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

    itemsGrid.innerHTML = filteredItems.map(item => {
        const unavailableAtBranch = currentAdminBranch ? isItemUnavailableAtBranch(item, currentAdminBranch) : false;
        const branchName = branchesData[currentAdminBranch]?.name || 'Selected Branch';
        
        return `
        <div class="admin-item-card">
            <img src="${item.image}" alt="${item.name}" class="admin-item-image">
            <div class="admin-item-content">
                <h4 class="admin-item-name">${item.name}</h4>
                <p class="admin-item-category">${item.category}</p>
                <p class="admin-item-price">₱${parseFloat(item.price).toFixed(2)}</p>
                <span class="admin-item-status ${item.status}">${item.status}</span>
                ${currentAdminBranch ? `
                <div class="branch-availability">
                    <span class="availability-label">${branchName}:</span>
                    <label class="toggle-switch" onclick="toggleItemAvailability('${item.id}', '${currentAdminBranch}')">
                        <input type="checkbox" data-item-id="${item.id}" data-branch-id="${currentAdminBranch}" ${!unavailableAtBranch ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="availability-text ${unavailableAtBranch ? 'unavailable-text' : ''}">
                        ${unavailableAtBranch ? 'Unavailable' : 'Available'}
                    </span>
                </div>
                ` : ''}
                <div class="admin-item-actions">
                    <button class="edit-btn" onclick="editItem('${item.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            </div>
        </div>
    `}).join('');
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
            <p class="preview-item-price">₱${parseFloat(item.price).toFixed(2)}</p>
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
        currentImageData = item.image;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemImageUrl').value = item.image || '';
        document.getElementById('itemStatus').checked = item.status === 'published';
        document.getElementById('statusLabel').textContent = item.status === 'published' ? 'Published' : 'Draft';

        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = item.image;
        if (item.image) {
            imagePreview.classList.add('show');
        }
    } else {
        modalTitle.textContent = 'Add New Item';
        editingItemId = null;
        form.reset();
        document.getElementById('itemStatus').checked = false;
        document.getElementById('statusLabel').textContent = 'Draft';
        document.getElementById('imagePreview').classList.remove('show');
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

    // Use uploaded image (Supabase Storage) or fall back to URL input
    const imageUrl = currentImageData || document.getElementById('itemImageUrl').value;

    if (!imageUrl) {
        showToast('Please upload an image or enter URL', 'error');
        return;
    }

    try {
        if (editingItemId) {
            await supabaseClient.updateMenuItem(editingItemId, {
                category,
                name,
                description,
                price,
                image: imageUrl,
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
                image: imageUrl,
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