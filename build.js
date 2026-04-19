const fs = require('fs');
const path = require('path');

// ==========================================
// CẤU HÌNH DOMAIN SEO
// ==========================================
const DOMAIN = 'https://mrliga1.github.io/greenia-homes';

const postsPath = path.join(__dirname, 'assets', 'data', 'posts.json');
const prodsPath = path.join(__dirname, 'assets', 'data', 'products.json');
const projPath = path.join(__dirname, 'assets', 'data', 'projects.json');
const catPath = path.join(__dirname, 'assets', 'data', 'categories.json');

// Hàm đọc data an toàn (Áo giáp chống sập Bot)
function safeReadJSON(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            if (!data || data.trim() === '') return [];
            return JSON.parse(data);
        } catch (e) {
            console.error(`⚠️ Bỏ qua lỗi đọc file ${filePath}:`, e.message);
            return [];
        }
    }
    return [];
}

// Đọc dữ liệu an toàn
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
    `${DOMAIN}/tin-tuc.html`,
    `${DOMAIN}/san-pham.html`
];

projects.forEach(p => {
    const slug = p.slug || makeSafeSlug(p.title);
    sitemapUrls.push(`${DOMAIN}/du-an/${slug}/`);
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
        
        // Bơm thẻ SEO vào trang Danh Mục Tin Tức
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
        
        // Bơm thẻ SEO vào trang Danh Mục Sản Phẩm
        html = injectSeoTags(html, seoInfo, pageUrl);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// BƯỚC 2: XỬ LÝ TRANG CHI TIẾT TIN TỨC (Gom vào /tin-tuc/)
// ==========================================
if (blogTemplate) {
    posts.forEach(post => {
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
// BƯỚC 3: XỬ LÝ TRANG CHI TIẾT SẢN PHẨM (Gom vào /san-pham/)
// ==========================================
if (prodTemplate) {
    products.forEach(prod => {
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
// BƯỚC 4: XUẤT BẢN FILE SITEMAP.XML CHUẨN GOOGLE
// ==========================================
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

console.log('✅ Build hoàn tất! Cấu trúc Silo đã được tối ưu.');