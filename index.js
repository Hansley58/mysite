const RESPONSIVE_WIDTH = 1024;
let isHeaderCollapsed = true;

const collapseBtn = document.getElementById("collapse-btn");
const collapseHeaderItems = document.getElementById("collapsed-header-items");

function toggleHeader() {
    if (!collapseHeaderItems || window.innerWidth >= RESPONSIVE_WIDTH) return;

    if (isHeaderCollapsed) {
        collapseHeaderItems.style.maxHeight = "400px";
        collapseHeaderItems.style.opacity = "1";
        collapseHeaderItems.style.pointerEvents = "auto";
        collapseHeaderItems.style.display = "block";
        
        if (collapseBtn) {
            collapseBtn.classList.remove("bi-list");
            collapseBtn.classList.add("bi-x");
        }
        isHeaderCollapsed = false;
    } else {
        collapseHeaderItems.style.maxHeight = "0px";
        collapseHeaderItems.style.opacity = "0";
        collapseHeaderItems.style.pointerEvents = "none";
        collapseHeaderItems.style.display = "none";
        
        if (collapseBtn) {
            collapseBtn.classList.remove("bi-x");
            collapseBtn.classList.add("bi-list");
        }
        isHeaderCollapsed = true;
    }
}

function handleResize() {
    if (!collapseHeaderItems) return;

    if (window.innerWidth >= RESPONSIVE_WIDTH) {
        collapseHeaderItems.style.maxHeight = "";
        collapseHeaderItems.style.opacity = "";
        collapseHeaderItems.style.pointerEvents = "";
        collapseHeaderItems.style.display = "";
        isHeaderCollapsed = true;
    } else if (isHeaderCollapsed) {
        collapseHeaderItems.style.maxHeight = "0px";
        collapseHeaderItems.style.opacity = "0";
        collapseHeaderItems.style.pointerEvents = "none";
        collapseHeaderItems.style.display = "none";
    }
}

// OPTIMIZED: Throttle resize event using requestAnimationFrame to prevent lag/freezing
let resizeTimeout;
window.addEventListener("resize", () => {
    if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
    resizeTimeout = requestAnimationFrame(handleResize);
});

// Run once on initial load
handleResize();



/** Dark and light theme */
if (localStorage.getItem('color-mode') === 'dark' || (!('color-mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('tw-dark')
    updateToggleModeBtn()
} else {
    document.documentElement.classList.remove('tw-dark')
    updateToggleModeBtn()
}

function toggleMode(){
    //toggle between dark and light mode
    document.documentElement.classList.toggle("tw-dark")
    updateToggleModeBtn()
    
}

function updateToggleModeBtn(){

    const toggleIcon = document.querySelector("#toggle-mode-icon")
    
    if (document.documentElement.classList.contains("tw-dark")){
        // dark mode
        toggleIcon.classList.remove("bi-sun")
        toggleIcon.classList.add("bi-moon")
        localStorage.setItem("color-mode", "dark")
        
    }else{
        toggleIcon.classList.add("bi-sun")
        toggleIcon.classList.remove("bi-moon")
        localStorage.setItem("color-mode", "light")
    }

}


const promptWindow =  new Prompt("#pixa-playground")
const promptForm = document.querySelector("#prompt-form")
const promptInput = promptForm.querySelector("input[name='prompt']")

const MAX_PROMPTS = 3

promptForm.addEventListener("submit", (event) => {
    event.preventDefault()

    // window.open("https://github.com/PaulleDemon", "_blank")

    if (promptWindow.promptList.length >= MAX_PROMPTS)
        return false

    promptWindow.addPrompt(promptInput.value)
    promptInput.value = ""
    
    if (promptWindow.promptList.length >= MAX_PROMPTS){
        // prompt signup once the user makes 3 prompts, ideally must be throttled via backend API
        const signUpPrompt = document.querySelector("#signup-prompt")
        signUpPrompt.classList.add("tw-scale-100")
        signUpPrompt.classList.remove("tw-scale-0")

        promptForm.querySelectorAll("input").forEach(e => {e.disabled = true})
    }

    return false
})



const videoBg = document.querySelector("#video-container-bg")
const videoContainer = document.querySelector("#video-container")

function openVideo(){
    videoBg.classList.remove("tw-scale-0", "tw-opacity-0")
    videoBg.classList.add("tw-scale-100", "tw-opacity-100")
    videoContainer.classList.remove("tw-scale-0")
    videoContainer.classList.add("tw-scale-100")

    document.body.classList.add("modal-open")
}

function closeVideo(){
    videoContainer.classList.add("tw-scale-0")
    videoContainer.classList.remove("tw-scale-100")

    setTimeout(() => {
        videoBg.classList.remove("tw-scale-100", "tw-opacity-100")
        videoBg.classList.add("tw-scale-0", "tw-opacity-0")
    }, 400)
   

    document.body.classList.remove("modal-open")

}

/**
 * Animations
 */

const typed = new Typed('#prompts-sample', {
    strings: ["How to solve a rubik's cube? Step by step guide", 
                "What's Pixa playground?", 
                "How to build an AI SaaS App?", 
                "How to integrate Pixa API?"],
    typeSpeed: 80,
    smartBackspace: true, 
    loop: true,
    backDelay: 2000,
})

gsap.registerPlugin(ScrollTrigger)


gsap.to(".reveal-up", {
    opacity: 0,
    y: "100%",
})


// straightens the slanting image
gsap.to("#dashboard", {

    scale: 1,
    translateY: 0,
    // translateY: "0%",
    rotateX: "0deg",
    scrollTrigger: {
        trigger: "#hero-section",
        start: window.innerWidth > RESPONSIVE_WIDTH ? "top 95%" : "top 70%",
        end: "bottom bottom",
        scrub: 1,
        // markers: true,
    }

})

// ------------- reveal section animations ---------------

const sections = gsap.utils.toArray("section")

sections.forEach((sec) => {

    const revealUptimeline = gsap.timeline({paused: true, 
                                            scrollTrigger: {
                                                            trigger: sec,
                                                            start: "10% 80%", // top of trigger hits the top of viewport
                                                            end: "20% 90%",
                                                            // markers: true,
                                                            // scrub: 1,
                                                        }})

    revealUptimeline.to(sec.querySelectorAll(".reveal-up"), {
        opacity: 1,
        duration: 0.8,
        y: "0%",
        stagger: 0.2,
    })


})


const scrollContainer = document.getElementById('smooth-wrapper');
    const navbar = document.getElementById('navbar');
    const logoSvg = document.getElementById('logo-svg');
    const navLinks = document.querySelectorAll('.nav-link');
    const navLines = document.querySelectorAll('.nav-line');
    const launchBtn = document.getElementById('launch-btn');
    const searchIcon = document.getElementById('search-icon');
    const loginBtn = document.getElementById('login-btn');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Handle Scroll Styling (isScrolled State)
    scrollContainer.addEventListener('scroll', () => {
      const isScrolled = scrollContainer.scrollTop > 10;

      if (isScrolled) {
        navbar.classList.add('bg-white/80', 'shadow-md', 'text-gray-700', 'backdrop-blur-lg', 'py-3', 'md:py-4');
        navbar.classList.remove('bg-indigo-500', 'py-4', 'md:py-6');
        
        logoSvg.classList.add('invert', 'opacity-80');
        hamburgerIcon.classList.add('invert');
        searchIcon.classList.add('invert');
        
        launchBtn.classList.add('text-black');
        launchBtn.classList.remove('text-white');

        loginBtn.classList.add('text-white', 'bg-black');
        loginBtn.classList.remove('bg-white', 'text-black');

        navLinks.forEach(link => {
          link.classList.add('text-gray-700');
          link.classList.remove('text-white');
        });

        navLines.forEach(line => {
          line.classList.add('bg-gray-700');
          line.classList.remove('bg-white');
        });
      } else {
        navbar.classList.remove('bg-white/80', 'shadow-md', 'text-gray-700', 'backdrop-blur-lg', 'py-3', 'md:py-4');
        navbar.classList.add('bg-indigo-500', 'py-4', 'md:py-6');

        logoSvg.classList.remove('invert', 'opacity-80');
        hamburgerIcon.classList.remove('invert');
        searchIcon.classList.remove('invert');

        launchBtn.classList.remove('text-black');
        launchBtn.classList.add('text-white');

        loginBtn.classList.remove('text-white', 'bg-black');
        loginBtn.classList.add('bg-white', 'text-black');

        navLinks.forEach(link => {
          link.classList.remove('text-gray-700');
          link.classList.add('text-white');
        });

        navLines.forEach(line => {
          line.classList.remove('bg-gray-700');
          line.classList.add('bg-white');
        });
      }
    });

    // Handle Mobile Menu Open/Close (isMenuOpen State)
    const openMenu = () => mobileMenu.classList.remove('-translate-x-full');
    const closeMenu = () => mobileMenu.classList.add('-translate-x-full');

    menuToggleBtn.addEventListener('click', openMenu);
    menuCloseBtn.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

