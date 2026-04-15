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

const blogTemplate = fs.existsSync('blog.html') ? fs.readFileSync('blog.html', 'utf8') : '';
const prodTemplate = fs.existsSync('chi-tiet-sp.html') ? fs.readFileSync('chi-tiet-sp.html', 'utf8') : '';

function makeSafeSlug(t) { return t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a').replace(/[éèẻẽẹêếềểễệ]/g, 'e').replace(/[íìỉĩị]/g, 'i').replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o').replace(/[úùủũụưứừửữự]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y').replace(/đ/g, 'd').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'); }

// ==========================================
// KHỞI TẠO BẢN ĐỒ TRANG WEB (SITEMAP)
// ==========================================
let sitemapUrls = [
    `${DOMAIN}/`,
    `${DOMAIN}/danh-muc.html`,
    `${DOMAIN}/san-pham.html`
];

// ==========================================
// XỬ LÝ TRANG TIN TỨC (BLOG)
// ==========================================
if (blogTemplate) {
    posts.forEach(post => {
        const slug = post.slug || makeSafeSlug(post.title);
        const folder = path.join(__dirname, 'blog', slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/blog/${slug}/`;
        sitemapUrls.push(pageUrl); // Thêm vào Sitemap

        // 1. Dữ liệu SEO tự động
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

        // 2. Thay thế dữ liệu gốc của bạn
        let html = blogTemplate
            .replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title}</title>`)
            .replace(/window\.GREENIA_CURRENT_POST\s*=\s*null;?/g, `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};`);
        
        // 3. Chèn Canonical & Schema vào trước </head>
        html = html.replace('</head>', `    ${canonicalTag}\n    ${schemaTag}\n</head>`);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// XỬ LÝ TRANG SẢN PHẨM (PROD)
// ==========================================
if (prodTemplate) {
    products.forEach(prod => {
        const slug = prod.slug || makeSafeSlug(prod.title);
        const folder = path.join(__dirname, 'san-pham', slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const pageUrl = `${DOMAIN}/san-pham/${slug}/`;
        sitemapUrls.push(pageUrl); // Thêm vào Sitemap

        // 1. Dữ liệu SEO tự động
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

        // 2. Thay thế dữ liệu gốc của bạn
        let html = prodTemplate
            .replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title}</title>`)
            .replace(/window\.GREENIA_CURRENT_PRODUCT\s*=\s*null;?/g, `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)};`);

        // 3. Chèn Canonical & Schema vào trước </head>
        html = html.replace('</head>', `    ${canonicalTag}\n    ${schemaTag}\n</head>`);

        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

// ==========================================
// XUẤT BẢN FILE SITEMAP.XML CHUẨN GOOGLE
// ==========================================
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml);

console.log('Build hoàn tất! Đã cập nhật Thẻ Title, Canonical, Schema và xuất file Sitemap.xml thành công.');
