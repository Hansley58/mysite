(function() {
    'use strict';

    // ---- Language configuration (removed mfe, added es and de) ----
    const LANG_MAP = {
        'en':   { label: 'EN', flag: '🇬🇧', name: 'English' },
        'fr':   { label: 'FR', flag: '🇫🇷', name: 'Français' },
        'es':   { label: 'ES', flag: '🇪🇸', name: 'Español' },
        'de':   { label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
        'zh-CN':{ label: '中文', flag: '🇨🇳', name: '普通话' }
    };

    // ---- State ----
    let initialized = false;
    let ready = false;
    let pendingLang = null;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    let selectElement = null;
    let observer = null;

    // ---- Inject CSS to hide Google's banner ----
    function hideGoogleBanner() {
        const style = document.createElement('style');
        style.textContent = `
            .goog-te-banner-frame { display: none !important; }
            body { top: 0 !important; }
        `;
        document.head.appendChild(style);
    }

    // ---- UI update helpers ----
    function updateLanguageUI(langCode) {
        const info = LANG_MAP[langCode] || LANG_MAP['en'];
        const labelEl = document.getElementById('currentLangLabel');
        if (labelEl) labelEl.textContent = info.label;

        document.querySelectorAll('.lang-dropdown .lang-option').forEach(btn => {
            const btnLang = btn.dataset.lang;
            const displayLang = btn.dataset.display || btnLang;
            const isActive = (displayLang === langCode) || (btnLang === langCode);
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    // ---- Apply a language to the Google Translate <select> ----
    function applyLanguage(langCode) {
        if (!selectElement) {
            selectElement = document.querySelector('.goog-te-combo');
            if (!selectElement) return false;
        }

        const select = selectElement;
        const options = Array.from(select.options);
        const optionValues = options.map(o => o.value);

        // Determine the actual value to set
        let targetValue = langCode;
        if (!optionValues.includes(langCode)) {
            if (optionValues.includes('')) {
                targetValue = '';
            } else {
                const fallback = options.find(o => o.value !== '');
                targetValue = fallback ? fallback.value : (options.length > 0 ? options[0].value : '');
            }
        }

        const displayCode = (targetValue === '') ? 'en' : targetValue;

        if (select.value !== targetValue) {
            select.value = targetValue;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }

        localStorage.setItem('preferredLanguage', displayCode);
        updateLanguageUI(displayCode);

        const widget = document.getElementById('google_translate_element');
        if (widget) widget.style.display = 'none';

        return true;
    }

    // ---- Initialize Google Translate widget ----
    function initTranslate() {
        if (initialized) return;
        if (typeof google === 'undefined' || !google.translate || !google.translate.TranslateElement) {
            return;
        }

        try {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr,es,de,zh-CN',  // updated with new languages
                autoDisplay: false,
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
            }, 'google_translate_element');

            initialized = true;
            console.log('✅ Google Translate widget created');
            startSelectObserver();

        } catch (e) {
            console.warn('Google Translate init error:', e);
        }
    }

    // ---- MutationObserver to detect the <select> ----
    function startSelectObserver() {
        if (observer) observer.disconnect();

        if (document.querySelector('.goog-te-combo')) {
            onSelectReady();
            return;
        }

        observer = new MutationObserver(() => {
            if (document.querySelector('.goog-te-combo')) {
                observer.disconnect();
                observer = null;
                onSelectReady();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        let attempts = 0;
        const fallbackInterval = setInterval(() => {
            attempts++;
            if (document.querySelector('.goog-te-combo')) {
                clearInterval(fallbackInterval);
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
                onSelectReady();
            } else if (attempts > 30) {
                clearInterval(fallbackInterval);
                console.warn('Select element not found after 6s, retrying initialization');
                if (!ready) {
                    retryInit();
                }
            }
        }, 200);
    }

    // ---- Called when the select element is ready ----
    function onSelectReady() {
        selectElement = document.querySelector('.goog-te-combo');
        if (!selectElement) return;

        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        const langToApply = pendingLang || savedLang;
        pendingLang = null;

        if (applyLanguage(langToApply)) {
            ready = true;
            console.log('✅ Google Translate ready – default:', langToApply);
        }

        const widget = document.getElementById('google_translate_element');
        if (widget) widget.style.display = 'none';
    }

    // ---- Retry logic if select never appears ----
    function retryInit() {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`Retrying Google Translate init (${retryCount}/${MAX_RETRIES}) in ${delay}ms`);
            setTimeout(() => {
                if (!initialized) {
                    initTranslate();
                } else {
                    startSelectObserver();
                }
            }, delay);
        } else {
            console.warn('Google Translate could not be loaded after', MAX_RETRIES, 'retries.');
        }
    }

    // ---- Load the Google Translate script ----
    function loadScript() {
        if (retryCount >= MAX_RETRIES) {
            console.warn('Max retries reached, giving up.');
            return;
        }

        if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
            initTranslate();
            return;
        }

        const existing = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]');
        if (existing) {
            existing.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;

        window.googleTranslateElementInit = function() {
            initTranslate();
        };

        script.onload = function() {
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                if (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement) {
                    clearInterval(check);
                    initTranslate();
                } else if (attempts > 20) {
                    clearInterval(check);
                    retryCount++;
                    loadScript();
                }
            }, 200);
        };

        script.onerror = function() {
            console.warn('Failed to load Google Translate script.');
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            setTimeout(loadScript, delay);
        };

        document.head.appendChild(script);
    }

    // ---- Public translation function ----
    window.translatePage = function(langCode) {
        if (ready && selectElement) {
            applyLanguage(langCode);
            const selector = document.getElementById('langSelector');
            if (selector) {
                selector.classList.add('lang-translating');
                setTimeout(() => selector.classList.remove('lang-translating'), 1200);
            }
            return;
        }

        pendingLang = langCode;

        if (!initialized) {
            if (retryCount === 0) {
                loadScript();
            }
        } else {
            if (!observer) {
                startSelectObserver();
            }
        }

        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.classList.add('lang-translating');
            setTimeout(() => selector.classList.remove('lang-translating'), 3000);
        }
    };

    // ---- Start everything ----
    function start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
            return;
        }

        // Hide Google banner
        hideGoogleBanner();

        // Create widget container if missing
        if (!document.getElementById('google_translate_element')) {
            const container = document.createElement('div');
            container.id = 'google_translate_element';
            container.style.display = 'none';
            document.body.appendChild(container);
        }

        loadScript();
        setupUI();
    }

    // ---- UI controller (language selector dropdown) ----
    function setupUI() {
        const toggle = document.getElementById('langToggle');
        const dropdown = document.getElementById('langDropdown');
        const options = document.querySelectorAll('.lang-dropdown .lang-option');

        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', function(e) {
            const selector = document.getElementById('langSelector');
            if (selector && !selector.contains(e.target)) {
                dropdown.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        options.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const lang = this.dataset.display || this.dataset.lang;
                if (lang && typeof window.translatePage === 'function') {
                    window.translatePage(lang);
                    dropdown.classList.remove('open');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        updateLanguageUI(savedLang);

        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });

        options.forEach(function(btn) {
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // ---- Kick off ----
    start();

    console.log('🌍 Robust Google Translate loader ready (en, fr, es, de, zh-CN).');
})();