const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")
    }
  })
}, observerOptions)

// Observe all content sections
document.querySelectorAll(".content-section").forEach((section) => {
  observer.observe(section)
})

// Observe mockups
document.querySelectorAll(".post-mockup, .comment-mockup, .search-mockup").forEach((mockup) => {
  observer.observe(mockup)
})

// Staggered animation for team members
const teamObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const teamMembers = entry.target.querySelectorAll(".team-member")
      teamMembers.forEach((member, index) => {
        setTimeout(() => {
          member.classList.add("visible")
        }, index * 200)
      })
    }
  })
}, observerOptions)

document.querySelectorAll(".team-section").forEach((section) => {
  teamObserver.observe(section)
})

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 100) {
    navbar.style.background = "rgb(0, 0, 0)"
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.boxShadow = "none"
  }
})

// DOM Elements for sidebar functionality
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")

// Navigation items
const navProfile = document.getElementById("nav-profile")
const navFeed = document.getElementById("nav-feed")
const navAbout = document.getElementById("nav-about")
const navIFind = document.getElementById("nav-ifind")
const navClaimed = document.getElementById("nav-claimed")
const navLogout = document.getElementById("nav-logout")

// Hamburger menu toggle functionality
hamburgerMenu.addEventListener("click", function () {
  this.classList.toggle("active")
  sidebar.classList.toggle("active")

  // Add hamburger animation
  const spans = this.querySelectorAll("span")
  if (this.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)"
    spans[1].style.opacity = "0"
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)"
  } else {
    spans[0].style.transform = "none"
    spans[1].style.opacity = "1"
    spans[2].style.transform = "none"
  }
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
      hamburgerMenu.classList.remove("active")
      
      // Reset hamburger animation
      const spans = hamburgerMenu.querySelectorAll("span")
      spans[0].style.transform = "none"
      spans[1].style.opacity = "1"
      spans[2].style.transform = "none"
    }
  }
})

// Navigation functionality
navProfile.addEventListener("click", () => {
  window.location.href = "profile.html"
})

navFeed.addEventListener("click", () => {
  window.location.href = "main.html"
})

navAbout.addEventListener("click", () => {
  // Already on about page, just close sidebar
  sidebar.classList.remove("active")
  hamburgerMenu.classList.remove("active")
})

navIFind.addEventListener("click", () => {
  window.location.href = "main.html" // or wherever iFind search is located
})

navClaimed.addEventListener("click", () => {
  window.location.href = "claimed.html" // or wherever claimed items page is
})

navLogout.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("mockUser")
    localStorage.removeItem("userPosts")
    window.location.href = "login.html" // or wherever login page is
  }
})

// Smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth"