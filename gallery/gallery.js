// ============================================
// گالری کامل دیار نیوز - پوشه‌های جداگانه v3.0 (سریع)
// ============================================

// ========== تنظیمات ==========
const CONFIG = {
    repo: 'maghool51/diyar-widgets',
    branch: 'main',
    folders: {
        picture: { path: 'gallery/picture', icon: '🖼️', label: 'عکس', exts: ['jpg','jpeg','png','webp','gif','svg','bmp','ico'] },
        music: { path: 'gallery/music', icon: '🎵', label: 'موزیک', exts: ['mp3','wav','ogg','flac','aac','m4a'] },
        video: { path: 'gallery/video', icon: '🎬', label: 'ویدئو', exts: ['mp4','webm','avi','mov','mkv','flv','m4v'] },
        file: { path: 'gallery/file', icon: '📄', label: 'فایل', exts: ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','zip','rar','7z'] }
    },
    get baseUrl() {
        return `https://raw.githubusercontent.com/${this.repo}/${this.branch}/`;
    },
    get apiUrl() {
        return `https://api.github.com/repos/${this.repo}/contents/`;
    },
    maxFileSize: 10 * 1024 * 1024, // 10 مگابایت (بهینه)
    chunkSize: 5, // آپلود همزمان ۵ فایل
    getCategory(ext) {
        ext = ext.toLowerCase();
        for (const [key, folder] of Object.entries(this.folders)) {
            if (folder.exts.includes(ext)) return key;
        }
        return 'file';
    },
    getFolderPath(category) {
        return this.folders[category]?.path || 'gallery/file';
    }
};

// ========== DOM ==========
const DOM = {
    grid: document.getElementById('galleryGrid'),
    search: document.getElementById('searchInput'),
    count: document.getElementById('fileCount'),
    fileInput: document.getElementById('fileInput'),
    status: document.getElementById('uploadStatus'),
    progress: document.getElementById('progressBar'),
    progressContainer: document.getElementById('progressContainer'),
    progressText: document.getElementById('progressText'),
    dropZone: document.getElementById('dropZone'),
    refreshBtn: document.getElementById('refreshBtn'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
    toast: document.getElementById('toast'),
    tabs: document.querySelectorAll('.tab-btn'),
    uploadTitle: document.getElementById('uploadTitle'),
    uploadHint: document.getElementById('uploadHint')
};

// ========== State ==========
let state = {
    files: [],
    filtered: [],
    filter: '',
    selected: new Set(),
    isUploading: false,
    token: null,
    currentTab: 'picture'
};

// ========== Toast ==========
function showToast(msg, type = 'info', duration = 3000) {
    const t = DOM.toast;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(t._hide);
    t._hide = setTimeout(() => t.className = 'toast', duration);
}

// ========== File to Base64 ==========
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========== Get Token ==========
function getToken() {
    if (state.token) return state.token;
    const token = prompt(
        '🔑 توکن گیت‌هاب خود را وارد کنید:\n\n' +
        '📍 Settings → Developer settings → Personal access tokens → Tokens (classic)\n' +
        '✅ تیک repo را بزنید و توکن را کپی کنید.'
    );
    if (token) state.token = token;
    return token;
}

// ========== بارگذاری همه پوشه‌ها ==========
async function loadAllFolders() {
    try {
        DOM.grid.innerHTML = `<div class="loading-state"><span class="loader"></span><p>در حال بارگذاری...</p></div>`;

        let allFiles = [];
        
        for (const [key, folder] of Object.entries(CONFIG.folders)) {
            try {
                const response = await fetch(`${CONFIG.apiUrl}${folder.path}`);
                if (response.ok) {
                    const files = await response.json();
                    const validFiles = files.filter(f => f.type === 'file');
                    validFiles.forEach(f => {
                        f._category = key;
                        f._folder = folder;
                    });
                    allFiles = allFiles.concat(validFiles);
                }
            } catch (e) {
                // پوشه خالی است - خطا نیست
            }
        }

        state.files = allFiles;
        state.selected.clear();
        renderGallery();
        updateStats();

    } catch (error) {
        DOM.grid.innerHTML = `
            <div class="empty-state">
                <div class="icon">📂</div>
                <h3>گالری خالی است</h3>
                <p>${error.message}</p>
            </div>
        `;
        DOM.count.textContent = '۰ فایل';
        console.error('Gallery Error:', error);
    }
}

// ========== Render Gallery ==========
function renderGallery() {
    const filter = state.filter.toLowerCase();
    const tab = state.currentTab;
    
    let filtered = state.files.filter(f => {
        const matchName = f.name.toLowerCase().includes(filter);
        if (tab === 'all') return matchName;
        return matchName && f._category === tab;
    });
    
    state.filtered = filtered;

    if (filtered.length === 0) {
        DOM.grid.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <h3>نتیجه‌ای یافت نشد</h3>
                <p>فایلی با این جستجو پیدا نشد</p>
            </div>
        `;
        return;
    }

    DOM.grid.innerHTML = '';
    
    filtered.forEach((file, index) => {
        const folderPath = file._folder?.path || 'gallery/file';
        const url = `${CONFIG.baseUrl}${folderPath}/${file.name}`;
        const ext = file.name.split('.').pop().toLowerCase();
        const category = file._category || CONFIG.getCategory(ext);
        const folder = CONFIG.folders[category] || CONFIG.folders.file;
        const isSelected = state.selected.has(file.name);
        const safeId = 'link-' + file.name.replace(/[^a-zA-Z0-9]/g, '-');
        
        const item = document.createElement('div');
        item.className = `gallery-item${isSelected ? ' selected' : ''}`;
        item.style.animationDelay = `${(index % 20) * 0.04}s`;
        item.dataset.name = file.name;

        let contentHtml = '';
        if (category === 'picture') {
            contentHtml = `<img src="${url}" alt="${file.name}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23f0f2f5%22 width=%22300%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2240%22%3E❌%3C/text%3E%3C/svg%3E'">`;
        } else if (category === 'video') {
            contentHtml = `<video src="${url}" controls preload="metadata" muted></video>`;
        } else if (category === 'music') {
            contentHtml = `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:60px;margin-bottom:10px;">🎵</div>
                    <audio controls style="width:90%;max-width:180px;">
                        <source src="${url}" />
                        مرورگر شما پشتیبانی نمی‌کند
                    </audio>
                </div>
            `;
        } else {
            contentHtml = `
                <div style="text-align:center;padding:30px;">
                    <div style="font-size:64px;opacity:0.5;">📄</div>
                    <div style="font-size:12px;color:#888;margin-top:6px;">${folder.label}</div>
                </div>
            `;
        }

        item.innerHTML = `
            <div class="file-wrap">
                ${contentHtml}
                <span class="folder-badge">📁 ${folderPath}</span>
                <span class="file-type-badge">${folder.icon} ${folder.label}</span>
                <div class="file-actions">
                    <button class="copy-btn" onclick="copyLink('${safeId}')">📋</button>
                    <button class="delete-btn" onclick="deleteFile('${folderPath}', '${file.name}')">🗑️</button>
                </div>
                <input type="checkbox" class="select-check" ${isSelected ? 'checked' : ''} 
                       onchange="toggleSelect('${file.name}')" />
            </div>
            <div class="info">
                <div class="filename">📎 ${file.name}</div>
                <div class="link-box">
                    <input type="text" value="${url}" id="${safeId}" readonly onclick="copyLink('${safeId}')" />
                </div>
            </div>
        `;
        
        DOM.grid.appendChild(item);
    });
}

// ========== Update Stats ==========
function updateStats() {
    const total = state.files.length;
    const selected = state.selected.size;
    const tab = state.currentTab;
    const folder = CONFIG.folders[tab];
    const label = tab === 'all' ? 'همه' : (folder?.label || '');
    DOM.count.textContent = selected > 0 ? `${selected}/${total} فایل (${label})` : `${total} فایل (${label})`;
}

// ========== Copy Link ==========
function copyLink(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.select();
    try {
        navigator.clipboard.writeText(input.value);
        showToast('✅ لینک کپی شد!', 'success');
    } catch {
        document.execCommand('copy');
        showToast('✅ لینک کپی شد!', 'success');
    }
}

// ========== Toggle Select ==========
function toggleSelect(filename) {
    if (state.selected.has(filename)) state.selected.delete(filename);
    else state.selected.add(filename);
    renderGallery();
    updateStats();
}

// ========== Delete File ==========
async function deleteFile(folderPath, filename) {
    if (!confirm(`⚠️ "${filename}" را حذف کنید؟`)) return;
    const token = getToken();
    if (!token) return;

    try {
        const url = `${CONFIG.apiUrl}${folderPath}/${filename}`;
        const getRes = await fetch(url);
        if (!getRes.ok) throw new Error('فایل پیدا نشد');
        const data = await getRes.json();

        const delRes = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Delete: ${filename}`, sha: data.sha, branch: CONFIG.branch })
        });

        if (!delRes.ok) throw new Error('خطا در حذف');
        
        state.selected.delete(filename);
        showToast(`✅ "${filename}" حذف شد`, 'success');
        loadAllFolders();

    } catch (error) {
        showToast(`❌ ${error.message}`, 'error');
    }
}

// ========== Delete Selected ==========
async function deleteSelected() {
    if (state.selected.size === 0) { showToast('⚠️ هیچ فایلی انتخاب نشده', 'error'); return; }
    if (!confirm(`⚠️ ${state.selected.size} فایل را حذف کنید؟`)) return;
    
    const token = getToken();
    if (!token) return;

    const files = state.files.filter(f => state.selected.has(f.name));
    let success = 0;
    
    for (const file of files) {
        try {
            const folderPath = file._folder?.path || 'gallery/file';
            const url = `${CONFIG.apiUrl}${folderPath}/${file.name}`;
            const getRes = await fetch(url);
            if (!getRes.ok) continue;
            const data = await getRes.json();
            await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Delete: ${file.name}`, sha: data.sha, branch: CONFIG.branch })
            });
            success++;
        } catch (e) { console.error(e); }
    }

    state.selected.clear();
    showToast(`✅ ${success} فایل حذف شد`, 'success');
    loadAllFolders();
}

// ========== آپلود همزمان (سریع) ==========
async function uploadFiles(files) {
    if (state.isUploading || !files?.length) return;

    // فیلتر فایل‌های تکراری
    const existingNames = new Set(state.files.map(f => f.name));
    const newFiles = Array.from(files).filter(f => !existingNames.has(f.name));
    
    if (newFiles.length === 0) {
        showToast('⚠️ همه فایل‌ها قبلاً آپلود شده‌اند', 'error');
        return;
    }

    const token = getToken();
    if (!token) { DOM.status.textContent = '❌ آپلود لغو شد'; return; }

    state.isUploading = true;
    DOM.status.textContent = `⏳ در حال آپلود ${newFiles.length} فایل...`;
    DOM.progressContainer.classList.add('active');
    DOM.progress.style.width = '0%';
    DOM.progressText.textContent = '۰%';

    // فیلتر فایل‌های بزرگ
    const validFiles = newFiles.filter(f => f.size <= CONFIG.maxFileSize);
    if (validFiles.length === 0) {
        DOM.status.textContent = '⚠️ همه فایل‌ها بزرگتر از ۱۰ مگابایت هستند';
        state.isUploading = false;
        DOM.progressContainer.classList.remove('active');
        return;
    }

    if (validFiles.length < newFiles.length) {
        DOM.status.textContent = `⚠️ ${newFiles.length - validFiles.length} فایل بزرگتر از ۱۰ مگابایت رد شدند`;
    }

    let success = 0;
    const total = validFiles.length;

    // آپلود همزمان (چند تا با هم)
    const chunkSize = CONFIG.chunkSize;
    for (let i = 0; i < total; i += chunkSize) {
        const chunk = validFiles.slice(i, i + chunkSize);
        const promises = chunk.map(async (file) => {
            const ext = file.name.split('.').pop().toLowerCase();
            const category = CONFIG.getCategory(ext);
            const folderPath = CONFIG.getFolderPath(category);
            
            try {
                const content = await fileToBase64(file);
                const url = `${CONFIG.apiUrl}${folderPath}/${file.name}`;
                const res = await fetch(url, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `token ${token}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        message: `Upload: ${file.name}`,
                        content: content,
                        branch: CONFIG.branch
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'خطا');
                }
                return { file, success: true };
            } catch (err) {
                console.error(`❌ ${file.name}:`, err);
                return { file, success: false, error: err.message };
            }
        });

        const results = await Promise.all(promises);
        const chunkSuccess = results.filter(r => r.success).length;
        success += chunkSuccess;

        // نمایش نتیجه هر دسته
        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
            DOM.status.textContent = `⚠️ ${failed.length} فایل ناموفق: ${failed.map(f => f.file.name).join(', ')}`;
        }

        const pct = Math.round(Math.min((i + chunkSize) / total * 100, 100));
        DOM.progress.style.width = `${pct}%`;
        DOM.progressText.textContent = `${pct}%`;
        DOM.status.textContent = `⏳ ${Math.min(i + chunkSize, total)}/${total} فایل`;
    }

    DOM.progressContainer.classList.remove('active');
    DOM.progress.style.width = '0%';
    DOM.progressText.textContent = '۰%';
    state.isUploading = false;

    if (success === total) {
        showToast(`✅ ${success} فایل با موفقیت آپلود شد`, 'success');
        DOM.status.textContent = `✅ ${success} فایل آپلود شد`;
    } else if (success > 0) {
        showToast(`⚠️ ${success} از ${total} فایل آپلود شد`, 'error');
        DOM.status.textContent = `⚠️ ${success} از ${total} فایل آپلود شد`;
    } else {
        DOM.status.textContent = '❌ هیچ فایلی آپلود نشد';
        showToast('❌ آپلود ناموفق بود', 'error');
    }

    DOM.fileInput.value = '';
    setTimeout(loadAllFolders, 1500);
}

// ========== Switch Tab ==========
function switchTab(tab) {
    state.currentTab = tab;
    DOM.tabs.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    const folder = CONFIG.folders[tab];
    if (folder) {
        DOM.uploadTitle.textContent = `${folder.icon} ${folder.label} را اینجا بکشید یا کلیک کنید`;
        DOM.uploadHint.textContent = `فرمت‌های مجاز: ${folder.exts.join(', ')}`;
    } else if (tab === 'all') {
        DOM.uploadTitle.textContent = 'همه فایل‌ها را اینجا بکشید یا کلیک کنید';
        DOM.uploadHint.textContent = 'به‌طور خودکار در پوشه مناسب قرار می‌گیرند';
    }
    
    renderGallery();
    updateStats();
}

// ========== Event Listeners ==========

// تب‌ها
DOM.tabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// فایل
DOM.fileInput.addEventListener('change', function() { 
    if (this.files.length > 0) {
        uploadFiles(this.files);
    }
});

// درگ و دراپ
DOM.dropZone.addEventListener('dragover', e => { 
    e.preventDefault(); 
    DOM.dropZone.classList.add('dragover'); 
});
DOM.dropZone.addEventListener('dragleave', e => { 
    e.preventDefault(); 
    DOM.dropZone.classList.remove('dragover'); 
});
DOM.dropZone.addEventListener('drop', e => {
    e.preventDefault();
    DOM.dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
    }
});
DOM.dropZone.addEventListener('click', () => DOM.fileInput.click());

// جستجو
DOM.search.addEventListener('input', function() {
    state.filter = this.value.trim();
    renderGallery();
    updateStats();
});

// Refresh
DOM.refreshBtn.addEventListener('click', function() {
    this.textContent = '⏳';
    loadAllFolders().finally(() => this.textContent = '🔄');
});

// Select All
DOM.selectAllBtn.addEventListener('click', function() {
    const names = state.filtered.map(f => f.name);
    if (state.selected.size === names.length && names.length > 0) {
        state.selected.clear();
    } else {
        names.forEach(n => state.selected.add(n));
    }
    renderGallery();
    updateStats();
});

// Delete Selected
DOM.deleteSelectedBtn.addEventListener('click', deleteSelected);

// کلیک روی لینک
document.addEventListener('click', function(e) {
    const input = e.target.closest('.link-box input');
    if (input) copyLink(input.id);
});

// کیبورد
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        DOM.selectAllBtn.click();
    }
    if (e.key === 'Escape') {
        state.selected.clear();
        renderGallery();
        updateStats();
    }
});

// ========== شروع ==========
loadAllFolders();

console.log('🖼️ گالری دیار نیوز v3.0 (سریع) بارگذاری شد');
console.log(`📁 ${Object.keys(CONFIG.folders).length} پوشه فعال`);
console.log(`⚡ آپلود همزمان ${CONFIG.chunkSize} فایل`);
