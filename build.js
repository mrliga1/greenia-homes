const fs = require('fs');

const DOMAIN = 'https://greeniahomes.vn'; // CẬP NHẬT TÊN MIỀN CỦA BẠN VÀO ĐÂY
console.log("🚀 BẮT ĐẦU QUY TRÌNH BUILD VÀ TẠO SITEMAP...");

// 1. KÉO DỮ LIỆU
const postsData = fs.readFileSync('./assets/data/posts.json', 'utf8');
const posts = JSON.parse(postsData);
const templateHTML = fs.readFileSync('./bai-viet.html', 'utf8');

// 2. KHỞI TẠO SITEMAP.XML
let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXML += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Khai báo các trang tĩnh cứng
const staticPages = ['index.html', 'san-pham.html', 'danh-muc.html'];
staticPages.forEach(page => {
    sitemapXML += `  <url>\n    <loc>${DOMAIN}/${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
});

// Tạo thư mục gốc chứa các bài viết
if (!fs.existsSync('./bai-viet')) {
    fs.mkdirSync('./bai-viet');
}

// 3. VÒNG LẶP SẢN XUẤT HÀNG LOẠT
posts.forEach(post => {
    const slug = post.slug; 
    const postDir = `./bai-viet/${slug}`;
    const postURL = `${DOMAIN}/bai-viet/${slug}/`;
    
    // Tạo thư mục theo tên bài viết
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir);
    }

    let finalHTML = templateHTML;

    // Sửa đường dẫn tài nguyên tĩnh do bị tụt sâu 2 cấp
    finalHTML = finalHTML.replace(/href="assets\//g, 'href="../../assets/');
    finalHTML = finalHTML.replace(/src="assets\//g, 'src="../../assets/');

    // MÃ HÓA SCHEMA ORG CHO GOOGLE HIỂU
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.title,
        "image": [ post.img || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200" ],
        "datePublished": post.date, 
        "author": [{
            "@type": "Person",
            "name": post.author || "Greenia Homes"
        }]
    };

    // BƠM THẺ META SEO (Zalo, Facebook, Google)
    const seoTags = `
    <title>${post.title} | Greenia Homes</title>
    <meta name="description" content="${post.title} - Greenia Homes cung cấp giải pháp bất động sản cao cấp.">
    <link rel="canonical" href="${postURL}">
    
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="Đọc ngay bài viết phân tích chi tiết về ${post.title}.">
    <meta property="og:url" content="${postURL}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${post.img || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"}">
    
    <script type="application/ld+json">
        ${JSON.stringify(schemaData, null, 4)}
    </script>
    
    <script>
        window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};
    </script>
    `;
    
    // Chèn vào chỗ có thẻ <title> cũ
    finalHTML = finalHTML.replace(/<title>.*<\/title>/i, seoTags);

    // Lưu ra thành file index.html vật lý
    fs.writeFileSync(`${postDir}/index.html`, finalHTML);

    // GHI SITEMAP
    sitemapXML += `  <url>\n    <loc>${postURL}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    
    console.log(`✅ Đã tạo URL SEO & Sitemap: /bai-viet/${slug}/`);
});

// 4. KẾT THÚC SITEMAP
sitemapXML += `</urlset>`;
fs.writeFileSync('./sitemap.xml', sitemapXML);
console.log("🗺️ Đã tạo thành công file sitemap.xml");

console.log("🎉 TOÀN BỘ QUY TRÌNH ĐÓNG GÓI ĐÃ HOÀN TẤT!");