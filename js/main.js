(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Fixed Navbar
    $('.fixed-top').css('top', $('.top-bar').height());
    $(window).scroll(function () {
        if ($(this).scrollTop()) {
            $('.fixed-top').addClass('bg-dark').css('top', 0);
        } else {
            $('.fixed-top').removeClass('bg-dark').css('top', $('.top-bar').height());
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1500,
        loop: true,
        nav: true,
        dots: false,
        items: 1,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: false,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    
})(jQuery);

 (function() {
        'use strict';

        const video = document.getElementById('heroBgVideo');
        const muteBtn = document.getElementById('heroMuteToggle');
        const playBtn = document.getElementById('heroPlayToggle');

        if (!video) return;

        // Ensure video plays
        video.play().catch(function(e) {
            // autoplay was blocked – show fallback or just let user interact
            console.log('Autoplay blocked:', e);
        });

        // Mute toggle
        if (muteBtn) {
            muteBtn.addEventListener('click', function() {
                video.muted = !video.muted;
                const icon = muteBtn.querySelector('i');
                if (video.muted) {
                    icon.className = 'fas fa-volume-mute';
                } else {
                    icon.className = 'fas fa-volume-up';
                }
            });
        }

        // Play / Pause toggle
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                    playBtn.querySelector('i').className = 'fas fa-pause';
                } else {
                    video.pause();
                    playBtn.querySelector('i').className = 'fas fa-play';
                }
            });

            // Update button state when video ends or pauses
            video.addEventListener('pause', function() {
                playBtn.querySelector('i').className = 'fas fa-play';
            });
            video.addEventListener('play', function() {
                playBtn.querySelector('i').className = 'fas fa-pause';
            });
        }

        // If video fails to load, show fallback
        video.addEventListener('error', function() {
            document.getElementById('heroFallback').classList.add('show');
        });

        // If video is stuck loading, show fallback after 6s
        setTimeout(function() {
            if (video.readyState < 2) {
                document.getElementById('heroFallback').classList.add('show');
            }
        }, 6000);

    })();

    // Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('darkModeToggle');
    const icon = document.getElementById('themeIcon');
    const body = document.body;

    // Check saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    toggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});
// 1. Fix navbar visibility on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure navbar is visible
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.opacity = '1';
        navbar.style.visibility = 'visible';
        navbar.style.display = 'flex';
    }
    
    // 2. Scroll spy
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    function updateActiveLink() {
        let current = '';
        const scrollPosition = window.scrollY + 100; // offset
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
});



