// initialization

const RESPONSIVE_WIDTH = 1024

let headerWhiteBg = false
let isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH
const collapseBtn = document.getElementById("collapse-btn")
const collapseHeaderItems = document.getElementById("collapsed-header-items")



function onHeaderClickOutside(e) {

    if (!collapseHeaderItems.contains(e.target)) {
        toggleHeader()
    }

}


function toggleHeader() {
    if (isHeaderCollapsed) {
        // collapseHeaderItems.classList.remove("max-md:tw-opacity-0")
        collapseHeaderItems.classList.add("opacity-100",)
        collapseHeaderItems.style.width = "60vw"
        collapseBtn.classList.remove("bi-list")
        collapseBtn.classList.add("bi-x", "max-lg:tw-fixed")
        isHeaderCollapsed = false

        setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 1)

    } else {
        collapseHeaderItems.classList.remove("opacity-100")
        collapseHeaderItems.style.width = "0vw"
        collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
        collapseBtn.classList.add("bi-list")
        isHeaderCollapsed = true
        window.removeEventListener("click", onHeaderClickOutside)

    }
}

function responsive() {
    if (window.innerWidth > RESPONSIVE_WIDTH) {
        collapseHeaderItems.style.width = ""

    } else {
        isHeaderCollapsed = true
    }
}

window.addEventListener("resize", responsive)


/**
 * Animations
 */

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother = ScrollSmoother.create({
	wrapper: '#smooth-wrapper',
	content: '#smooth-content',
})

ScrollSmoother.create({
	smooth: 2, 
	effects: true, 
	smoothTouch: 0.1 
});



gsap.to(".reveal-up", {
    opacity: 0,
    y: "100%",
})

gsap.to("#dashboard", {
    boxShadow: "0px 15px 25px -5px #7e22ceaa",
    duration: 0.3,
    scrollTrigger: {
        trigger: "#hero-section",
        start: "60% 60%",
        end: "80% 80%",
        // markers: true
    }

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

const faqAccordion = document.querySelectorAll('.faq-accordion')

faqAccordion.forEach(function (btn) {
    btn.addEventListener('click', function () {
        this.classList.toggle('active')

        // Toggle 'rotate' class to rotate the arrow
        let content = this.nextElementSibling
        
        // content.classList.toggle('!tw-hidden')
        if (content.style.maxHeight === '200px') {
            content.style.maxHeight = '0px'
            content.style.padding = '0px 18px'

        } else {
            content.style.maxHeight = '200px'
            content.style.padding = '20px 18px'
        }
    })
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


window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 10) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });


// Use a delay so you can actually SEE the loader works
window.addEventListener('load', function() {
        const loader = document.getElementById('loader');
        if (loader) {
            // Wait 1.5 seconds so we can confirm it appears
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 1500); 
        }
});

function openVideo() {
    console.log("Opening video..."); // Check your F12 console for this
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('youtubePlayer');
    const videoId = "Sgxbx65IDeM"; // Replace with your ID

    if (modal && player) {
        player.src = "https://www.youtube.com/embed/" + "Sgxbx65IDeM" + "?autoplay=1";
        modal.style.display = "flex";
    } else {
        alert("Error: Modal or Player not found in HTML!");
    }
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('youtubePlayer');
    modal.style.display = "none";
    player.src = "";
}

function toggleFAQ(button) {
    const item = button.parentElement;
    const wrapper = item.querySelector('.faq-wrapper');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
  
    // Check if it's currently open
    const isOpen = wrapper.classList.contains('grid-rows-[1fr]');
  
    // Toggle the height (using CSS Grid rows)
    wrapper.classList.toggle('grid-rows-[1fr]', !isOpen);
    wrapper.classList.toggle('grid-rows-[0fr]', isOpen);
  
    // Toggle the opacity for a fade-in effect
    answer.classList.toggle('opacity-100', !isOpen);
    answer.classList.toggle('opacity-0', isOpen);
  
    // Smoothly rotate the plus sign instead of just changing text
    if (!isOpen) {
      icon.style.transform = 'rotate(45deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  }

