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
  sidebar.classList.remove("active")
  hamburgerMenu.classList.remove("active")
})

navClaimed.addEventListener("click", () => {
  window.location.href = "claim.html" 
})

navLogout.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("mockUser")
    localStorage.removeItem("userPosts")
    window.location.href = "login.html" 
  }
})

// Smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth"

// Cat image interaction enhancement
document.addEventListener("DOMContentLoaded", function() {
  const catImage = document.querySelector(".cat-image")
  
  if (catImage) {
    // Add click event for fun interaction
    catImage.addEventListener("click", function() {
      this.style.transform = "scale(1.2) rotate(360deg)"
      setTimeout(() => {
        this.style.transform = "scale(1) rotate(0deg)"
      }, 500)
    })
    
    // Add mouse enter/leave events for enhanced hover
    catImage.addEventListener("mouseenter", function() {
      this.style.filter = "brightness(1.2) saturate(1.3) drop-shadow(0 15px 30px rgba(245, 230, 163, 0.4))"
    })
    
    catImage.addEventListener("mouseleave", function() {
      this.style.filter = "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))"
    })
  }
})