document.addEventListener('DOMContentLoaded', () => {
    const slides = Array.from(document.querySelectorAll('.banner-slide'));
    const dots = Array.from(document.querySelectorAll('.slider-dot'));
    let currentSlide = 0;
    let slideTimer;

    function updateSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === index);
        });
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });
        currentSlide = index;
    }

    function startSlider() {
        slideTimer = setInterval(() => {
            const nextIndex = (currentSlide + 1) % slides.length;
            updateSlide(nextIndex);
        }, 5500);
    }

    function stopSlider() {
        if (slideTimer) clearInterval(slideTimer);
    }

    if (slides.length && dots.length) {
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = Number(dot.dataset.index);
                updateSlide(index);
                stopSlider();
                startSlider();
            });
        });
        startSlider();
    }

    const projectForm = document.getElementById('project-form');
    const contactForm = document.getElementById('contact-form');

    function handleFormSubmit(event, title) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        alert(`${title} đã được gửi thành công!\n\nChúng tôi sẽ liên hệ lại với ${name} trong thời gian sớm nhất.`);
        event.target.reset();
    }

    if (projectForm) {
        projectForm.addEventListener('submit', event => {
            handleFormSubmit(event, 'Yêu cầu nhận thông tin dự án');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            handleFormSubmit(event, 'Yêu cầu liên hệ');
        });
    }
});