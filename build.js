const fs = require('fs');
const path = require('path');

// ==========================================
// CẤU HÌNH DOMAIN SEO
// ==========================================
const DOMAIN = 'https://greeniahomes.vn';

const postsPath = path.join(__dirname, 'assets', 'data', 'posts.json');
const prodsPath = path.join(__dirname, 'assets', 'data', 'products.json');
const projPath = path.join(__dirname, 'assets', 'data', 'projects.json');
const catPath = path.join(__dirname, 'assets', 'data', 'categories.json');

// Hàm đọc data an toàn (Áo giáp chống sập Bot Level 2)
function safeReadJSON(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            if (!data || data.trim() === '') return [];
            
            const parsed = JSON.parse(data);
            // Nếu là mảng, trả về mảng. Nếu là 1 cục Object, bọc nó vào mảng. Còn lại trả về rỗng.
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object' && parsed !== null) return [parsed];
            return [];
        } catch (e) {
            console.error(`⚠️ Bỏ qua lỗi định dạng JSON tại file ${filePath}:`, e.message);
            return [];
        }
    }
    return [];
}

let posts = safeReadJSON(postsPath);
let products = safeReadJSON(prodsPath);
let projects = safeReadJSON(projPath);
let categoriesSEO = safeReadJSON(catPath);

// Đọc 4 khuôn đúc (Templates)
const blogTemplate = fs.existsSync('blog.html') ? fs.readFileSync('blog.html', 'utf8') : '';
const prodTemplate = fs.existsSync('chi-tiet-sp.html') ? fs.readFileSync('chi-tiet-sp.html', 'utf8') : '';
const catNewsTemplate = fs.existsSync('danh-muc.html') ? fs.readFileSync('danh-muc.html', 'utf8') : '';
const catProdTemplate = fs.existsSync('danh-muc-sp.html') ? fs.readFileSync('danh-muc-sp.html', 'utf8') : '';

// Hàm tạo URL thân thiện chuẩn SEO
function makeSafeSlug(t) { 
    if(!t) return 'chuyen-muc';
    return t.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a').replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i').replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/đ/g, 'd').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'); 
}

// ==========================================
// KHỞI TẠO BẢN ĐỒ TRANG WEB (SITEMAP)
// ==========================================
let sitemapUrls = [
    `${DOMAIN}/`,
    `${DOMAIN}/tin-tuc/`,
    `${DOMAIN}/san-pham/`,
    `${DOMAIN}/du-an/`
];

// Thêm Dự án vào Sitemap chỉ khi có tên hợp lệ
projects.forEach(p => {
    if (p.title) {
        const slug = p.slug || makeSafeSlug(p.title);
        sitemapUrls.push(`${DOMAIN}/du-an/${slug}/`);
    }
});

// Hàm hỗ trợ chèn thẻ Meta SEO vào <head>
function injectSeoTags(htmlContent, seoData, canonicalUrl) {
    const metaTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="description" content="${seoData.seoDesc || seoData.desc || ''}" />
    <meta name="keywords" content="${seoData.seoKeywords || ''}" />
    <meta property="og:title" content="${seoData.seoTitle || seoData.title || ''}" />
    <meta property="og:description" content="${seoData.seoDesc || seoData.desc || ''}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "${seoData.seoTitle || seoData.title || ''}",
      "description": "${seoData.seoDesc || seoData.desc || ''}",
      "url": "${canonicalUrl}"
    }
    </script>
    `;
    return htmlContent
        .replace(/<title>.*?<\/title>/, `<title>${seoData.seoTitle || seoData.title} | Greenia Homes</title>`)
        .replace('</head>', `${metaTags}\n</head>`);
}

// ==========================================
// BƯỚC 1: XUẤT BẢN CÁC TRANG DANH MỤC (CATEGORY PAGES)
// ==========================================

// 1.1 Quét và tạo Danh mục Tin tức
let newsCategories = [];
posts.forEach(p => {
    if (p.cat && !newsCategories.find(c => c.name === p.cat)) {
        newsCategories.push({ name: p.cat, slug: makeSafeSlug(p.cat), type: 'news' });
    }
});

if (catNewsTemplate) {
    newsCategories.forEach(cat => {
        const folder = path.join(__dirname, 'tin-tuc', cat.slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/tin-tuc/${cat.slug}/`;
        sitemapUrls.push(pageUrl);

        // Lấy thông tin cấu hình SEO từ Admin (nếu có)
        const seoInfo = categoriesSEO.find(c => c.slug === cat.slug) || { title: cat.name };
        
        let html = catNewsTemplate.replace(/window\.GREENIA_CURRENT_CATEGORY\s*=\s*null;?/g, `window.GREENIA_CURRENT_CATEGORY = ${JSON.stringify({...cat, ...seoInfo})};`);
        html = injectSeoTags(html, seoInfo, pageUrl);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// 1.2 Quét và tạo Danh mục Sản phẩm
let prodCategories = [];
products.forEach(p => {
    if (p.cat && !prodCategories.find(c => c.name === p.cat)) {
        prodCategories.push({ name: p.cat, slug: makeSafeSlug(p.cat), type: 'product' });
    }
    if (p.type && !prodCategories.find(c => c.name === p.type)) {
        prodCategories.push({ name: p.type, slug: makeSafeSlug(p.type), type: 'product' });
    }
});

if (catProdTemplate) {
    prodCategories.forEach(cat => {
        const folder = path.join(__dirname, 'san-pham', cat.slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/san-pham/${cat.slug}/`;
        sitemapUrls.push(pageUrl);

        // Lấy thông tin cấu hình SEO từ Admin (nếu có)
        const seoInfo = categoriesSEO.find(c => c.slug === cat.slug) || { title: cat.name };

        let html = catProdTemplate.replace(/window\.GREENIA_CURRENT_CATEGORY\s*=\s*null;?/g, `window.GREENIA_CURRENT_CATEGORY = ${JSON.stringify({...cat, ...seoInfo})};`);
        html = injectSeoTags(html, seoInfo, pageUrl);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// BƯỚC 2: XỬ LÝ TRANG CHI TIẾT TIN TỨC
// ==========================================
if (blogTemplate) {
    posts.forEach(post => {
        if (!post.title) return; // Chống tạo thư mục rỗng

        const catSlug = makeSafeSlug(post.cat || 'tin-tuc');
        const postSlug = post.slug || makeSafeSlug(post.title);
        
        const folder = path.join(__dirname, 'tin-tuc', catSlug, postSlug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/tin-tuc/${catSlug}/${postSlug}/`;
        sitemapUrls.push(pageUrl);

        const canonicalTag = `<link rel="canonical" href="${pageUrl}" />`;
        const seoDesc = post.seoDesc || post.title;
        const seoKeys = post.seoKeywords || "";
        
        const metaTags = `
        <meta name="description" content="${seoDesc}" />
        <meta name="keywords" content="${seoKeys}" />
        <meta property="og:title" content="${post.seoTitle || post.title}" />
        <meta property="og:description" content="${seoDesc}" />
        <meta property="og:image" content="${post.thumb ? (post.thumb.startsWith('http') ? post.thumb : `${DOMAIN}/${post.thumb}`) : ''}" />
        <meta property="og:url" content="${pageUrl}" />
        <meta property="og:type" content="article" />`;

        const schemaObj = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.seoTitle || post.title,
            "image": post.thumb ? (post.thumb.startsWith('http') ? post.thumb : `${DOMAIN}/${post.thumb}`) : "",
            "datePublished": post.date || new Date().toISOString().split('T')[0],
            "author": { "@type": "Person", "name": post.author || "Chuyên gia Greenia" }
        };
        const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;

        let html = blogTemplate
            .replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title} | Greenia Homes</title>`)
            .replace(/window\.GREENIA_CURRENT_POST\s*=\s*null;?/g, `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};`)
            .replace(/\.\.\/\.\.\//g, '../../../'); 
        
        html = html.replace('</head>', `    ${canonicalTag}\n    ${metaTags}\n    ${schemaTag}\n</head>`);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// BƯỚC 3: XỬ LÝ TRANG CHI TIẾT SẢN PHẨM
// ==========================================
if (prodTemplate) {
    products.forEach(prod => {
        if (!prod.title) return; // Chống tạo thư mục rỗng

        const catSlug = makeSafeSlug(prod.cat || 'san-pham');
        const prodSlug = prod.slug || makeSafeSlug(prod.title);
        
        const folder = path.join(__dirname, 'san-pham', catSlug, prodSlug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/san-pham/${catSlug}/${prodSlug}/`;
        sitemapUrls.push(pageUrl);

        const canonicalTag = `<link rel="canonical" href="${pageUrl}" />`;
        const seoDesc = prod.seoDesc || prod.title;
        const seoKeys = prod.seoKeywords || "";
        
        const metaTags = `
        <meta name="description" content="${seoDesc}" />
        <meta name="keywords" content="${seoKeys}" />
        <meta property="og:title" content="${prod.seoTitle || prod.title}" />
        <meta property="og:description" content="${seoDesc}" />
        <meta property="og:image" content="${prod.img ? (prod.img.startsWith('http') ? prod.img : `${DOMAIN}/${prod.img}`) : ''}" />
        <meta property="og:url" content="${pageUrl}" />
        <meta property="og:type" content="product" />`;

        const schemaObj = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": prod.seoTitle || prod.title,
            "image": prod.img ? (prod.img.startsWith('http') ? prod.img : `${DOMAIN}/${prod.img}`) : "",
            "description": seoDesc,
            "offers": {
                "@type": "Offer",
                "url": pageUrl,
                "priceCurrency": "VND",
                "price": "0", 
                "availability": "https://schema.org/InStock"
            }
        };
        const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;

        let html = prodTemplate
            .replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title} | Greenia Homes</title>`)
            .replace(/window\.GREENIA_CURRENT_PRODUCT\s*=\s*null;?/g, `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)};`)
            .replace(/\.\.\/\.\.\//g, '../../../'); 

        html = html.replace('</head>', `    ${canonicalTag}\n    ${metaTags}\n    ${schemaTag}\n</head>`);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// QUÉT VÀ BƠM SEO CHO CÁC TRANG MICROSITE TỰ CODE TAY
// ==========================================
const duAnDir = path.join(__dirname, 'du-an');

if (fs.existsSync(duAnDir)) {
    // 1. Quét tất cả các thư mục dự án bác đã tạo (VD: vinhomes, novaworld...)
    const projectFolders = fs.readdirSync(duAnDir).filter(f => fs.statSync(path.join(duAnDir, f)).isDirectory());

    projectFolders.forEach(slug => {
        // --- BẮT ĐẦU ĐẶT VÙNG CẤM ---
        const danhSachCam = ['vinhomes-saigon-park', 'vinhomes-grand-park'];
        if (danhSachCam.includes(slug)) {
            console.log(`[BẢO VỆ] Bỏ qua bơm SEO tự động cho trang: ${slug} (Vùng cấm của Admin tự code tay)`);
            return; // Bỏ qua không bơm hay sửa đổi file trong thư mục này
        }
        // --- KẾT THÚC VÙNG CẤM ---

        // Tìm Data SEO của dự án này từ Admin (để lấy Tên, Mô tả gốc)
        const projData = projects.find(p => (p.slug || makeSafeSlug(p.title)) === slug) || {};
        const projFolder = path.join(duAnDir, slug);

        // 2. Quét tất cả các file .html bác tự viết trong thư mục dự án này
        const htmlFiles = fs.readdirSync(projFolder).filter(file => file.endsWith('.html'));

        htmlFiles.forEach(file => {
            const filePath = path.join(projFolder, file);
            let html = fs.readFileSync(filePath, 'utf8');

            // 3. Tự động nội suy Tiêu đề SEO dựa vào tên file
            const pageCode = file.replace('.html', ''); // vd: vi-tri
            let prefixName = pageCode.replace(/-/g, ' ').toUpperCase(); // vd: VI TRI
            
            // Xử lý link sitemap sạch (bỏ đuôi .html, index thì lấy link thư mục)
            const cleanUrl = file === 'index.html' ? `${DOMAIN}/du-an/${slug}/` : `${DOMAIN}/du-an/${slug}/${pageCode}`;
            
            // Bộ SEO tự động bơm vào
            const seoInfo = {
                title: `${prefixName} - Dự án ${projData.seoTitle || projData.title || slug} | Greenia Homes`,
                seoDesc: `Khám phá thông vị chi tiết về ${prefixName.toLowerCase()} của dự án ${projData.title || slug}. ${projData.seoDesc || ''}`,
                seoKeywords: `${pageCode.replace(/-/g, ' ')} ${projData.title || slug}`
            };

            // 4. Bơm thẻ Meta SEO vào file HTML (Nếu bác chưa tự viết thẻ description)
            if (!html.includes('<meta name="description"')) {
                html = injectSeoTags(html, seoInfo, cleanUrl);
                fs.writeFileSync(filePath, html); // Lưu đè lại file HTML với bộ SEO xịn
            }

            // 5. Thêm ngay vào Sitemap cho Google Bot đọc
            if (!sitemapUrls.includes(cleanUrl)) {
                sitemapUrls.push(cleanUrl);
            }
        });
    });
}

// ==========================================
// BƯỚC 4: XUẤT BẢN FILE SITEMAP.XML
// ==========================================
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

console.log('✅ Build hoàn tất! Lõi hệ thống SEO và Chống Crash đã được tối ưu.');