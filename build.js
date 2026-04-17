const fs = require('fs');
const path = require('path');

// ==========================================
// CẤU HÌNH DOMAIN SEO
// ==========================================
const DOMAIN = 'https://mrliga1.github.io/greenia-homes';

const postsPath = path.join(__dirname, 'assets', 'data', 'posts.json');
const prodsPath = path.join(__dirname, 'assets', 'data', 'products.json');

let posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
let products = fs.existsSync(prodsPath) ? JSON.parse(fs.readFileSync(prodsPath, 'utf8')) : [];

// Đọc 4 khuôn đúc (Templates)
const blogTemplate = fs.existsSync('blog.html') ? fs.readFileSync('blog.html', 'utf8') : '';
const prodTemplate = fs.existsSync('chi-tiet-sp.html') ? fs.readFileSync('chi-tiet-sp.html', 'utf8') : '';
const catNewsTemplate = fs.existsSync('danh-muc-tin.html') ? fs.readFileSync('danh-muc-tin.html', 'utf8') : ''; // ĐÃ ĐỔI TÊN KHUÔN
const catProdTemplate = fs.existsSync('danh-muc-sp.html') ? fs.readFileSync('danh-muc-sp.html', 'utf8') : '';

// Hàm tạo URL thân thiện chuẩn SEO
function makeSafeSlug(t) { 
    if(!t) return 'chuyen-muc';
    return t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a').replace(/[éèẻẽẹêếềểễệ]/g, 'e').replace(/[íìỉĩị]/g, 'i').replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o').replace(/[úùủũụưứừửữự]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y').replace(/đ/g, 'd').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'); 
}

// ==========================================
// KHỞI TẠO BẢN ĐỒ TRANG WEB (SITEMAP)
// ==========================================
let sitemapUrls = [
    `${DOMAIN}/`,
    `${DOMAIN}/tin-tuc.html`,
    `${DOMAIN}/san-pham.html`
];

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
        const folder = path.join(__dirname, cat.slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/${cat.slug}/`;
        sitemapUrls.push(pageUrl); // Thêm vào Sitemap

        // Đổ dữ liệu vào khuôn & Sửa lỗi ../../ thành ../ vì danh mục chỉ sâu 1 cấp
        let html = catNewsTemplate
            .replace(/<title>.*?<\/title>/, `<title>${cat.name} - Tin Tức | Greenia Homes</title>`)
            .replace(/window\.GREENIA_CURRENT_CATEGORY\s*=\s*null;?/g, `window.GREENIA_CURRENT_CATEGORY = ${JSON.stringify(cat)};`)
            .replace(/\.\.\/\.\.\//g, '../');

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// 1.2 Quét và tạo Danh mục Sản phẩm (Lọc theo cat và type)
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
        const folder = path.join(__dirname, cat.slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/${cat.slug}/`;
        sitemapUrls.push(pageUrl); // Thêm vào Sitemap

        let html = catProdTemplate
            .replace(/<title>.*?<\/title>/, `<title>${cat.name} - Sản Phẩm | Greenia Homes</title>`)
            .replace(/window\.GREENIA_CURRENT_CATEGORY\s*=\s*null;?/g, `window.GREENIA_CURRENT_CATEGORY = ${JSON.stringify(cat)};`)
            .replace(/\.\.\/\.\.\//g, '../');

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// BƯỚC 2: XỬ LÝ TRANG CHI TIẾT TIN TỨC (NẰM TRONG DANH MỤC)
// ==========================================
if (blogTemplate) {
    posts.forEach(post => {
        const catSlug = makeSafeSlug(post.cat || 'tin-tuc');
        const postSlug = post.slug || makeSafeSlug(post.title);
        
        // Cấu trúc URL mới: /ten-danh-muc/ten-bai-viet/
        const folder = path.join(__dirname, catSlug, postSlug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/${catSlug}/${postSlug}/`;
        sitemapUrls.push(pageUrl);

        const canonicalTag = `<link rel="canonical" href="${pageUrl}" />`;
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
            .replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title}</title>`)
            .replace(/window\.GREENIA_CURRENT_POST\s*=\s*null;?/g, `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};`);
        
        html = html.replace('</head>', `    ${canonicalTag}\n    ${schemaTag}\n</head>`);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// BƯỚC 3: XỬ LÝ TRANG CHI TIẾT SẢN PHẨM (NẰM TRONG DANH MỤC)
// ==========================================
if (prodTemplate) {
    products.forEach(prod => {
        const catSlug = makeSafeSlug(prod.cat || 'san-pham');
        const prodSlug = prod.slug || makeSafeSlug(prod.title);
        
        // Cấu trúc URL mới: /ten-danh-muc/ten-san-pham/
        const folder = path.join(__dirname, catSlug, prodSlug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/${catSlug}/${prodSlug}/`;
        sitemapUrls.push(pageUrl);

        const canonicalTag = `<link rel="canonical" href="${pageUrl}" />`;
        const schemaObj = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": prod.seoTitle || prod.title,
            "image": prod.img ? (prod.img.startsWith('http') ? prod.img : `${DOMAIN}/${prod.img}`) : "",
            "description": prod.seoDesc || prod.title,
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
            .replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title}</title>`)
            .replace(/window\.GREENIA_CURRENT_PRODUCT\s*=\s*null;?/g, `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)};`);

        html = html.replace('</head>', `    ${canonicalTag}\n    ${schemaTag}\n</head>`);

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

console.log('✅ Build hoàn tất! Đã tạo thành công Cấu trúc URL Danh mục mới, cập nhật Thẻ Title, Canonical, Schema và xuất file Sitemap.xml.');
