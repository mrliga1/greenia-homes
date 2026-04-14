/* ==============================================================
   HÚT VÀ HIỂN THỊ DỮ LIỆU TỪ GOOGLE SHEETS
============================================================== */

// 1. RENDER DỰ ÁN
async function renderDuAn() {
    const container = document.getElementById('khu-vuc-du-an');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center">Đang tải dữ liệu...</p>';
    const data = await fetchSheetData('Du_An'); // Lấy từ tab Du_An
    
    if (data.length === 0) {
        container.innerHTML = '<p class="text-center">Chưa có dự án nào.</p>';
        return;
    }

    let html = '';
    data.forEach(item => {
        html += `
            <div class="card-product">
                <img src="${item.anh_dai_dien}" alt="${item.ten_du_an}" style="width:100%; height:250px; object-fit:cover; border-radius:4px;">
                <h3 style="margin-top: 15px;">${item.ten_du_an}</h3>
                <p>📍 ${item.vi_tri}</p>
                <div style="display: flex; justify-content: space-between; margin-top:15px; border-top:1px solid #333; padding-top:10px;">
                    <span class="price">${item.gia_ban_tu || 'Đang cập nhật'}</span>
                    <a href="chi-tiet-du-an.html?id=${item.id_du_an}" class="btn-outline">Xem chi tiết</a>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

// 2. RENDER SẢN PHẨM CHUYỂN NHƯỢNG
async function renderSanPham() {
    const container = document.getElementById('khu-vuc-san-pham');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center">Đang tải dữ liệu...</p>';
    const data = await fetchSheetData('Chuyen_Nhuong'); // Lấy từ tab Chuyen_Nhuong
    
    if (data.length === 0) {
        container.innerHTML = '<p class="text-center">Chưa có sản phẩm chuyển nhượng.</p>';
        return;
    }

    let html = '';
    data.forEach(item => {
        html += `
            <div class="card-product">
                <h3 style="color: var(--primary-color);">${item.ma_can}</h3>
                <p>Loại: ${item.loai_hinh} | Diện tích: ${item.dien_tich}</p>
                <h4 style="font-size: 1.5rem; margin-top: 10px;">${item.gia_ban}</h4>
                <a href="#" class="btn-primary" style="display:block; text-align:center; margin-top:15px;">Liên hệ ngay</a>
            </div>`;
    });
    container.innerHTML = html;
}

// 3. RENDER TIN TỨC
async function renderTinTuc() {
    const container = document.getElementById('khu-vuc-tin-tuc');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center">Đang tải dữ liệu...</p>';
    const data = await fetchSheetData('Tin_Tuc'); // Lấy từ tab Tin_Tuc
    
    if (data.length === 0) {
        container.innerHTML = '<p class="text-center">Chưa có bài viết.</p>';
        return;
    }

    let html = '';
    // Chỉ lấy 3 bài viết mới nhất ra trang chủ
    data.slice(0, 3).forEach(item => {
        html += `
            <div class="card-product">
                <img src="${item.anh_bia}" alt="${item.tieu_de}" style="width:100%; height:200px; object-fit:cover; border-radius:4px;">
                <h3 style="font-size: 1.1rem; margin-top: 15px;">${item.tieu_de}</h3>
                <p style="font-size: 0.8rem; color: #888;">🗓️ ${item.ngay_dang}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${item.mo_ta_ngan}</p>
            </div>`;
    });
    container.innerHTML = html;
}

// KÍCH HOẠT TẤT CẢ KHI TRANG WEB VỪA MỞ LÊN
document.addEventListener('DOMContentLoaded', () => {
    renderDuAn();
    renderSanPham();
    renderTinTuc();
});