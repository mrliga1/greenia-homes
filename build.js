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
const postTemplatePath = path.join(__dirname, 'blog.html'); // Đọc từ blog.html
const prodTemplatePath = path.join(__dirname, 'chi-tiet-sp.html');

let postTemplate = '';
let prodTemplate = '';
if (fs.existsSync(postTemplatePath)) postTemplate = fs.readFileSync(postTemplatePath, 'utf8');
if (fs.existsSync(prodTemplatePath)) prodTemplate = fs.readFileSync(prodTemplatePath, 'utf8');

// Hàm tạo Slug an toàn
function makeSafeSlug(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a').replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i').replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/đ/g, 'd').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

// 3. Xây dựng trang Tin tức (Vào thư mục /blog/)
if (postTemplate) {
    posts.forEach(post => {
        const safeSlug = post.slug || makeSafeSlug(post.title);
        const postFolder = path.join(__dirname, 'blog', safeSlug); // <--- ĐÃ ĐỔI TÊN THƯ MỤC
        if (!fs.existsSync(postFolder)) fs.mkdirSync(postFolder, { recursive: true });

        let html = postTemplate
            .replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title} | Greenia Homes</title>`)
            .replace(/<meta name="description".*?>/, `<meta name="description" content="${post.seoDesc || ''}">`)
            .replace(/window\.GREENIA_CURRENT_POST\s*=\s*null;?/g, () => `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};`); // <--- SỬA LỖI TÌM KIẾM

        fs.writeFileSync(path.join(postFolder, 'index.html'), html);
    });
}

// 4. Xây dựng trang Sản phẩm
if (prodTemplate) {
    products.forEach(prod => {
        const safeSlug = prod.slug || makeSafeSlug(prod.title);
        const prodFolder = path.join(__dirname, 'san-pham', safeSlug);
        if (!fs.existsSync(prodFolder)) fs.mkdirSync(prodFolder, { recursive: true });

        let html = prodTemplate
            .replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title} | Greenia Homes</title>`)
            .replace(/<meta name="description".*?>/, `<meta name="description" content="${prod.seoDesc || ''}">`)
            .replace(/window\.GREENIA_CURRENT_PRODUCT\s*=\s*null;?/g, () => `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)};`); // <--- SỬA LỖI TÌM KIẾM

        fs.writeFileSync(path.join(prodFolder, 'index.html'), html);
    });
}

console.log('Tự động xây dựng URL SEO hoàn tất!');
