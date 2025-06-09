document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const sidebar = document.getElementById("sidebar");

  // --- Animation Observer ---
  const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              entry.target.classList.add("visible");
          }
      });
  }, observerOptions);

  document.querySelectorAll(".content-section, .post-mockup, .comment-mockup, .search-mockup").forEach(el => observer.observe(el));

  const teamObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              const teamMembers = entry.target.querySelectorAll(".team-member");
              teamMembers.forEach((member, index) => {
                  setTimeout(() => {
                      member.classList.add("visible");
                  }, index * 200);
              });
              teamObserver.unobserve(entry.target); // Animate only once
          }
      });
  }, observerOptions);

  document.querySelectorAll(".team-section").forEach(section => teamObserver.observe(section));


  // --- Event Listeners ---
  function attachEventListeners() {
      // Hamburger Menu Toggle
      hamburgerMenu.addEventListener("click", function () {
          this.classList.toggle("active");
          sidebar.classList.toggle("active");
      });

      // Close sidebar when clicking outside
      document.addEventListener("click", (event) => {
          if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
              sidebar.classList.remove("active");
              hamburgerMenu.classList.remove("active");
          }
      });

      // Sidebar Navigation
      document.getElementById("nav-profile").addEventListener("click", () => window.location.href = "profile.html");
      document.getElementById("nav-feed").addEventListener("click", () => window.location.href = "main.html");
      document.getElementById("nav-claimed").addEventListener("click", () => window.location.href = "claim.html");
      document.getElementById("nav-about").addEventListener("click", () => window.location.reload());
      document.getElementById("nav-logout").addEventListener("click", handleLogout);
  }
  
  function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.clear();
        window.location.href = "index.html"; 
    }
}

  // Initialize all functionality
  attachEventListeners();
});