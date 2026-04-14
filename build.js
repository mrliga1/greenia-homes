const fs = require('fs');
const path = require('path');

// 1. Đọc dữ liệu
const postsPath = path.join(__dirname, 'assets', 'data', 'posts.json');
const prodsPath = path.join(__dirname, 'assets', 'data', 'products.json');

let posts = [];
let products = [];
if (fs.existsSync(postsPath)) posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
if (fs.existsSync(prodsPath)) products = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));

// 2. Đọc file khuôn mẫu
const postTemplatePath = path.join(__dirname, 'bai-viet.html');
const prodTemplatePath = path.join(__dirname, 'chi-tiet-sp.html'); // <--- ĐÃ SỬA LẠI ĐÚNG FILE NÀY

let postTemplate = '';
let prodTemplate = '';
if (fs.existsSync(postTemplatePath)) postTemplate = fs.readFileSync(postTemplatePath, 'utf8');
if (fs.existsSync(prodTemplatePath)) prodTemplate = fs.readFileSync(prodTemplatePath, 'utf8');

// 3. Xây dựng các trang Tin tức
if (postTemplate) {
    posts.forEach(post => {
        const safeSlug = post.slug || post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const postFolder = path.join(__dirname, 'bai-viet', safeSlug);
        if (!fs.existsSync(postFolder)) fs.mkdirSync(postFolder, { recursive: true });

        let html = postTemplate
            .replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title} | Greenia Homes</title>`)
            .replace(/<meta name="description".*?>/, `<meta name="description" content="${post.seoDesc || ''}">`)
            .replace(/<meta name="keywords".*?>/, `<meta name="keywords" content="${post.seoKeywords || ''}">`)
            .replace('window.GREENIA_CURRENT_POST = null', `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)}`)
            .replace('window.GREENIA_CURRENT_POST=null', `window.GREENIA_CURRENT_POST=${JSON.stringify(post)}`);

        fs.writeFileSync(path.join(postFolder, 'index.html'), html);
    });
}

// 4. Xây dựng các trang Sản phẩm
if (prodTemplate) {
    products.forEach(prod => {
        const safeSlug = prod.slug || prod.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const prodFolder = path.join(__dirname, 'san-pham', safeSlug);
        if (!fs.existsSync(prodFolder)) fs.mkdirSync(prodFolder, { recursive: true });

        let html = prodTemplate
            .replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title} | Greenia Homes</title>`)
            .replace(/<meta name="description".*?>/, `<meta name="description" content="${prod.seoDesc || ''}">`)
            .replace(/<meta name="keywords".*?>/, `<meta name="keywords" content="${prod.seoKeywords || ''}">`)
            .replace('window.GREENIA_CURRENT_PRODUCT = null', `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)}`)
            .replace('window.GREENIA_CURRENT_PRODUCT=null', `window.GREENIA_CURRENT_PRODUCT=${JSON.stringify(prod)}`);

        fs.writeFileSync(path.join(prodFolder, 'index.html'), html);
    });
}

console.log('Tự động xây dựng URL SEO hoàn tất!');
