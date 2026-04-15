/* ==============================================================
   UI.JS - BỘ NÃO ĐIỀU KHIỂN GIAO DIỆN (FINAL V8 - FIXED PATHS)
============================================================== */

// --------------------------------------------------------------
// PHẦN 1: HỆ THỐNG ĐỊNH VỊ ĐƯỜNG DẪN VẠN NĂNG (AUTO-PATHING)
// --------------------------------------------------------------
function getRootPath() {
    let rootPath = "";
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const isGitHubPages = window.location.hostname.includes('github.io');
    const offset = isGitHubPages ? 2 : 1; 

    if (pathParts.length > offset) {
        rootPath = "../".repeat(pathParts.length - offset);
    }
    return rootPath;
}
const ROOT = getRootPath();

// Hàm sửa lại link và ảnh bên trong các component HTML sau khi tải
function fixLinksInHtml(html) {
    return html.replace(/(href|src)=["'](?!\w+:|#|data:|\/|tel:|mailto:)([^"']+)["']/g, (match, p1, p2) => {
        return `${p1}="${ROOT}${p2}"`;
    });
}

// Hàm dùng ở file html bên ngoài để sửa link ảnh
window.resolveImg = (src) => {
    if (!src || src.startsWith('http') || src.startsWith('data:')) return src;
    return ROOT + src.replace(/^\/+/, '');
};

// --------------------------------------------------------------
// PHẦN 2: CÁC HÀM LẮP RÁP HỆ THỐNG
// --------------------------------------------------------------
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(ROOT + filePath);
        if (!response.ok) throw new Error('Không tìm thấy file ' + filePath);
        const html = await response.text();
        const container = document.getElementById(elementId);
        
        if(container) {
            container.innerHTML = fixLinksInHtml(html);
            
            // Bẻ lại link neo (#) trỏ về trang chủ nếu đang ở thư mục sâu
            if (ROOT !== "") {
                container.querySelectorAll('a').forEach(el => {
                    let href = el.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        el.setAttribute('href', ROOT + 'index.html' + href);
                    }
                });
            }
        }
    } catch (error) { console.error("Lỗi lắp ráp:", error); }
}

async function loadSpecificMenu(containerId, menuId) {
    try {
        const response = await fetch(ROOT + 'components/sub-menus.html');
        if (!response.ok) throw new Error('Không tìm thấy kho menu');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fixLinksInHtml(html);
        const targetMenu = tempDiv.querySelector('#' + menuId);
        const container = document.getElementById(containerId);
        
        if(container && targetMenu) {
            container.innerHTML = targetMenu.innerHTML;
            if (ROOT !== "") {
                container.querySelectorAll('a').forEach(el => {
                    let href = el.getAttribute('href');
                    if (href && href.startsWith('#')) el.setAttribute('href', ROOT + 'index.html' + href);
                });
            }
        }
    } catch (error) { console.error("Lỗi rút trích menu:", error); }
}

async function loadSpecificForm(containerId, templateId, projectName) {
    try {
        const response = await fetch(ROOT + 'components/forms.html');
        if (!response.ok) throw new Error('Không tìm thấy kho form');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fixLinksInHtml(html);
        const targetTemplate = tempDiv.querySelector('#' + templateId);
        const container = document.getElementById(containerId);

        if(container && targetTemplate) {
            container.innerHTML = targetTemplate.innerHTML;
            const formJustAdded = container.querySelector('.greenia-master-form');
            if(formJustAdded) formJustAdded.setAttribute('data-project', projectName);
        }
    } catch (error) { console.error("Lỗi rút trích form:", error); }
}

// --------------------------------------------------------------
// PHẦN 3: CÁC HÀM HIỆU ỨNG GIAO DIỆN
// --------------------------------------------------------------
function initScrollEffects() {
    const threshold = window.innerHeight * 0.6;
    window.addEventListener('scroll', function() {
        const mainHeader = document.getElementById('main-header');
        const subMenu = document.getElementById('sub-menu');
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > threshold) {
            if (mainHeader) mainHeader.classList.add('hide');
            if (subMenu) subMenu.classList.add('show');       
        } else {
            if (subMenu) subMenu.classList.remove('show');       
            if (mainHeader) mainHeader.classList.remove('hide'); 
        }
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// --------------------------------------------------------------
// PHẦN 4: HỆ THỐNG FORM, POPUP & TRACKING
// --------------------------------------------------------------
function initMasterFormsAndPopup() {
    const API_LEAD = 'https://script.google.com/macros/s/AKfycbxMkdZKscj17D2CRG7zUpzHWx_YiTbvg35zGm3eGdim3n4cA76j42d7VoxmNXrxpvPA-Q/exec';
    const FB_PIXEL_ID = "921887710208023";
    const GG_ADS_ID   = "AW-344693658";
    
    let clientIP = "Unknown";
    window.isTrackingActive = false;

    fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(d=>{clientIP=d.ip}).catch(e=>{});

    fetch(API_LEAD + "?action=count").then(r=>r.json()).then(d=>{
        if(d.count){
            let count = parseInt(d.count) < 5 ? 186 : parseInt(d.count);
            const countEl = document.getElementById('count-popup-new');
            if(countEl) countEl.innerText = `(5.0/5 - ${count} đánh giá)`;
        }
    }).catch(e=>{});

    window.initTrackingSystem = function() {
        if (window.isTrackingActive) return;
        if (typeof fbq === 'undefined') {
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', FB_PIXEL_ID); fbq('track', 'PageView');
        }
        if (typeof gtag === 'undefined') {
            let script = document.createElement('script');
            script.src = "https://www.googletagmanager.com/gtag/js?id=" + GG_ADS_ID;
            script.async = true; document.head.appendChild(script);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);}
            gtag('js', new Date()); gtag('config', GG_ADS_ID);
        }
        window.isTrackingActive = true;
    }

    window.triggerContactTracking = function(channel) {
        initTrackingSystem();
        setTimeout(() => {
            if (typeof fbq === 'function') fbq('track', 'Contact', { content_name: channel });
            if (typeof gtag === 'function') gtag('event', 'Click_' + channel, { 'send_to': GG_ADS_ID });
        }, 300);
    };

    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'leadFormGreeniaPopup') {
            e.preventDefault();
            const formPopup = e.target;
            const btn = document.getElementById('btn-v15-submit-greenia');
            const successBox = document.getElementById('v15-success-greenia');
            const originalText = btn.innerText;

            btn.innerText = "ĐANG GỬI..."; btn.style.opacity = "0.7"; btn.disabled = true;

            let fd = new FormData();
            fd.append("project", document.title + " (Popup)");
            fd.append("name", document.getElementById('v15-name-greenia').value);
            fd.append("phone", document.getElementById('v15-phone-greenia').value);
            fd.append("email", document.getElementById('v15-email-greenia').value);
            fd.append("demand", document.getElementById('v15-demand-greenia').value);
            fd.append("url", window.location.href);
            fd.append("ip", clientIP);
            fd.append("rating", 5);

            fetch(API_LEAD, { method: 'POST', body: fd }).then(res => {
                initTrackingSystem();
                if(typeof fbq === 'function') fbq('track', 'Lead');
                if(typeof gtag === 'function') gtag('event', 'Dang_Ky_Form', {'send_to': GG_ADS_ID});

                sessionStorage.setItem('greenia_form_submitted', 'true');
                formPopup.style.setProperty('display', 'none', 'important');
                if(successBox) successBox.style.display = 'block';

                setTimeout(() => window.closePopupNew(), 3000);
            }).catch(err => {
                alert("Có lỗi kết nối. Vui lòng gọi Hotline.");
                btn.innerText = originalText; btn.style.opacity = "1"; btn.disabled = false;
            });
        }
        else if (e.target && e.target.classList.contains('greenia-master-form')) {
            e.preventDefault();
            const form = e.target;
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "ĐANG GỬI..."; 
            btn.style.opacity = "0.7"; 
            btn.disabled = true;

            let fd = new FormData();
            fd.append("project", form.getAttribute('data-project') || document.title);
            fd.append("name", form.querySelector('input[name="name"]').value);
            fd.append("phone", form.querySelector('input[name="phone"]').value);
            fd.append("email", form.querySelector('input[name="email"]')?.value || "Không có");
            fd.append("demand", form.querySelector('input[name="demand"]')?.value || "Tư vấn chung");
            fd.append("url", window.location.href);
            fd.append("ip", clientIP); 
            fd.append("rating", 5);

            fetch(API_LEAD, { method: 'POST', body: fd }).then(res => {
                initTrackingSystem();
                if(typeof fbq === 'function') fbq('track', 'Lead');
                if(typeof gtag === 'function') gtag('event', 'Dang_Ky_Form', {'send_to': GG_ADS_ID});
                
                form.style.display = 'none';
                const successMsg = form.nextElementSibling;
                if(successMsg && successMsg.classList.contains('master-success-msg')) {
                    successMsg.style.display = 'block';
                }
                sessionStorage.setItem('greenia_form_submitted', 'true');
            }).catch(err => {
                alert("Có lỗi kết nối. Vui lòng gọi Hotline.");
                btn.innerText = originalText; btn.style.opacity = "1"; btn.disabled = false;
            });
        }
    });

    window.openPopupNew = function() {
        const overlay = document.getElementById('vhgp-popup-overlay-new');
        if(overlay) { overlay.style.display = 'flex'; setTimeout(() => overlay.classList.add('active'), 10); }
    };
    
    window.closePopupNew = function() {
        const overlay = document.getElementById('vhgp-popup-overlay-new');
        if(overlay) { 
            overlay.classList.remove('active'); 
            setTimeout(() => overlay.style.display = 'none', 300); 
        }
    };

    const overlayClick = document.getElementById('vhgp-popup-overlay-new');
    if(overlayClick) {
        overlayClick.addEventListener('click', function(e) { 
            if(e.target === overlayClick) window.closePopupNew(); 
        });
    }

    if(sessionStorage.getItem('greenia_form_submitted') !== 'true') {
        setTimeout(() => { window.openPopupNew(); }, 60000); 
    }

    const cookieBox = document.getElementById('cookie-consent-new');
    if (!localStorage.getItem('cookie_consent_new')) {
        setTimeout(() => { if(cookieBox) cookieBox.style.display = 'flex'; }, 2500);
    } else if (localStorage.getItem('cookie_consent_new') === 'accepted') {
        initTrackingSystem();
    }

    document.getElementById('cookie-accept-new')?.addEventListener('click', () => {
        localStorage.setItem('cookie_consent_new', 'accepted');
        if(cookieBox) cookieBox.style.display = 'none';
        initTrackingSystem();
    });

    document.getElementById('cookie-reject-new')?.addEventListener('click', () => {
        localStorage.setItem('cookie_consent_new', 'rejected');
        if(cookieBox) cookieBox.style.display = 'none';
    });
}

// --------------------------------------------------------------
// PHẦN 5: ĐIỂM KHỞI ĐỘNG (IGNITION SWITCH)
// --------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // ĐÃ SỬA LẠI ĐÚNG ĐƯỜNG DẪN GỐC CỦA BẠN (CÓ CHỮ components/)
    await loadComponent('site-header', 'components/header.html');
    await loadComponent('site-footer', 'components/footer.html');
    
    initScrollEffects();
    if (typeof initHeroSlider === "function") initHeroSlider();

    document.addEventListener('click', (e) => {
        if(e.target.id === 'mobile-toggle' || e.target.id === 'mobile-toggle-sub') {
            const nav = e.target.closest('.header-container').querySelector('.main-nav');
            if(nav) nav.classList.toggle('show');
        }
    });

    initMasterFormsAndPopup();
});
