const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, 'assets', 'data', 'posts.json');
const prodsPath = path.join(__dirname, 'assets', 'data', 'products.json');

let posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
let products = fs.existsSync(prodsPath) ? JSON.parse(fs.readFileSync(prodsPath, 'utf8')) : [];

const blogTemplate = fs.existsSync('blog.html') ? fs.readFileSync('blog.html', 'utf8') : '';
const prodTemplate = fs.existsSync('chi-tiet-sp.html') ? fs.readFileSync('chi-tiet-sp.html', 'utf8') : '';

function makeSafeSlug(t) { return t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a').replace(/[éèẻẽẹêếềểễệ]/g, 'e').replace(/[íìỉĩị]/g, 'i').replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o').replace(/[úùủũụưứừửữự]/g, 'u').replace(/[ýỳỷỹỵ]/g, 'y').replace(/đ/g, 'd').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-'); }

if (blogTemplate) {
    posts.forEach(post => {
        const slug = post.slug || makeSafeSlug(post.title);
        const folder = path.join(__dirname, 'blog', slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        let html = blogTemplate.replace(/<title>.*?<\/title>/, `<title>${post.seoTitle || post.title}</title>`).replace(/window\.GREENIA_CURRENT_POST\s*=\s*null;?/g, `window.GREENIA_CURRENT_POST = ${JSON.stringify(post)};`);
        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}

if (prodTemplate) {
    products.forEach(prod => {
        const slug = prod.slug || makeSafeSlug(prod.title);
        const folder = path.join(__dirname, 'san-pham', slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        let html = prodTemplate.replace(/<title>.*?<\/title>/, `<title>${prod.seoTitle || prod.title}</title>`).replace(/window\.GREENIA_CURRENT_PRODUCT\s*=\s*null;?/g, `window.GREENIA_CURRENT_PRODUCT = ${JSON.stringify(prod)};`);
        fs.writeFileSync(path.join(folder, 'index.html'), html);
    });
}
console.log('Build hoàn tất!');
