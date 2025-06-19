/**
 * تحميل المكونات بطريقة متزامنة باستخدام Promises
 * @param {string} id - معرف العنصر الذي سيتم تحميل المكون فيه
 * @param {string} file - اسم ملف المكون بدون امتداد
 * @returns {Promise} وعد يتم حله عند اكتمال تحميل المكون
 */
function loadComponent(id, file) {
    return new Promise((resolve, reject) => {
        const element = document.getElementById(id);
        if (!element) {
            resolve(); // لا يوجد عنصر، نعتبر العملية مكتملة
            return;
        }
        
        fetch(`/_includes/${file}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`فشل تحميل ${file}: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                element.innerHTML = html;
                resolve();
            })
            .catch(error => {
                console.error(`خطأ في تحميل ${file}:`, error);
                reject(error);
            });
    });
}

/**
 * تحديث التاريخ والسنة في الفوتر
 */
function updateFooterDates() {
    // تحديث السنة في الفوتر
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // تحديث تاريخ آخر تحديث
    const lastUpdateElement = document.getElementById('last-update-date');
    if (lastUpdateElement) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        lastUpdateElement.textContent = today.toLocaleDateString('ar-EG', options);
    }
}

/**
 * تفعيل قائمة الأجهزة المحمولة
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (!menuToggle) return;
    
    menuToggle.addEventListener('click', function() {
        document.body.classList.toggle('mobile-menu-open');
        
        // تغيير خاصية aria-expanded للزر
        const isExpanded = document.body.classList.contains('mobile-menu-open');
        this.setAttribute('aria-expanded', isExpanded);
    });
    
    // إغلاق القائمة عند النقر على الروابط
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.body.classList.remove('mobile-menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/**
 * تفعيل التمرير السلس للروابط الداخلية
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

/**
 * تفعيل إخفاء/إظهار الهيدر عند التمرير
 */
function setupHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    let lastScroll = window.pageYOffset;
    let scrollTimer = null;

    window.addEventListener('scroll', () => {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }

        scrollTimer = setTimeout(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll <= 0) {
                header.classList.remove('header-hidden');
                return;
            }

            if (currentScroll > lastScroll && !header.classList.contains('header-hidden')) {
                header.classList.add('header-hidden');
            } else if (currentScroll < lastScroll && header.classList.contains('header-hidden')) {
                header.classList.remove('header-hidden');
            }
            lastScroll = currentScroll;
        }, 50);
    });
}

// تنفيذ عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // تحميل جميع المكونات بالتوازي
        await Promise.all([
            loadComponent('header-placeholder', 'header'),
            loadComponent('footer-placeholder', 'footer'),
            loadComponent('platforms-placeholder', 'platforms'),
            loadComponent('departments-placeholder', 'departments'),
            loadComponent('contact-placeholder', 'contact')
        ]);
        
        // تحديث التواريخ بعد تحميل المكونات
        updateFooterDates();
        
        // تفعيل الوظائف التفاعلية
        setupMobileMenu();
        setupSmoothScroll();
        setupHeaderScroll();
        
        // إضافة فئة لإظهار المحتوى بعد التحميل
        document.body.classList.add('components-loaded');
        
        console.log('تم تحميل جميع المكونات بنجاح');
        
    } catch (error) {
        console.error('حدث خطأ أثناء تحميل المكونات:', error);
    }
});
