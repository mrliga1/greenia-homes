document.addEventListener("DOMContentLoaded", async () => {
    // 1. Tự động tính toán đường dẫn lùi về gốc (Root Path)
    // Nếu ở trang chủ, rootPath = ""
    // Nếu ở /blog/bai-viet/, rootPath = "../../"
    let rootPath = "";
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    
    // Nếu bạn dùng GitHub Pages (URL có tên repo), thường depth sẽ > 1
    // Ví dụ: /greenia-homes/blog/slug/ -> lùi 2 cấp
    const isGitHubPages = window.location.hostname.includes('github.io');
    const depth = pathParts.length;
    const offset = isGitHubPages ? 2 : 1; // Điều chỉnh tùy vào môi trường

    if (depth > offset) {
        rootPath = "../".repeat(depth - offset);
    }

    // Hàm sửa lại link và ảnh bên trong Header/Footer sau khi tải về
    const fixLinks = (html) => {
        return html.replace(/(href|src)=["'](?!\w+:|#|data:|\/|tel:|mailto:)([^"']+)["']/g, (match, p1, p2) => {
            return `${p1}="${rootPath}${p2}"`;
        });
    };

    try {
        // 2. Tải Header, Footer và Sub-menu bằng đường dẫn tương đối đã tính toán
        const [headRes, footRes, subRes] = await Promise.all([
            fetch(rootPath + 'header.html').catch(() => null),
            fetch(rootPath + 'footer.html').catch(() => null),
            fetch(rootPath + 'sub-menu.html').catch(() => null)
        ]);

        if (headRes && headRes.ok) {
            const headEl = document.getElementById('site-header');
            if (headEl) headEl.innerHTML = fixLinks(await headRes.text());
        }
        
        if (footRes && footRes.ok) {
            const footEl = document.getElementById('site-footer');
            if (footEl) footEl.innerHTML = fixLinks(await footRes.text());
        }

        if (subRes && subRes.ok) {
            const subEl = document.getElementById('sub-menu');
            if (subEl) subEl.innerHTML = fixLinks(await subRes.text());
        }
        
        // 3. Xử lý link neo (#) khi đang ở trang sâu
        if (rootPath !== "") {
            document.querySelectorAll('#site-header a, #sub-menu a').forEach(el => {
                let href = el.getAttribute('href');
                if (href && href.startsWith('#')) {
                    el.setAttribute('href', rootPath + 'index.html' + href);
                }
            });
        }

    } catch (e) {
        console.error('Lỗi hệ thống layout:', e);
    }
});

// Hàm toàn cục để sửa link ảnh cho thân bài (dùng trong blog.html và chi-tiet-sp.html)
window.resolveImg = (src) => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    // Tự động tính toán lại đường dẫn ảnh dựa trên vị trí trang
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const isGitHubPages = window.location.hostname.includes('github.io');
    const rootPath = "../".repeat(Math.max(0, pathParts.length - (isGitHubPages ? 2 : 1)));
    return rootPath + src.replace(/^\/+/, '');
};
