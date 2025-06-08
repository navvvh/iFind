// Wait for the entire HTML document to be loaded and parsed before running any script that interacts with it.
document.addEventListener("DOMContentLoaded", () => {
    
  // --- I. DOM Element Selection ---
  const nameInput = document.getElementById("nameInput");
  const profileAvatar = document.getElementById("profileAvatar");
  const roleOptions = document.querySelectorAll(".role-option");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const avatarModal = document.getElementById("avatarModal");
  const closeModalBtn = document.querySelector(".close-modal");
  const cancelBtn = document.querySelector(".cancel-btn");
  const saveBtn = document.querySelector(".save-btn");
  const avatarOptions = document.querySelectorAll(".avatar-option");

  // --- II. State and Data Management ---
  const API_URL = "http://localhost:3001/api";

  const setupData = {
      name: "",
      avatar: "👤",
      role: "",
      avatarId: null,
      uploadedImage: null,
  };

  const userInteractions = {
      nameChanged: false,
      avatarChanged: false,
      roleConfirmed: false,
  };

  let progress = 0;

  // --- III. Core Functions ---

  function getCurrentUserData() {
      const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {};
      return {
          id: ifindUserData.id || null,
          name: ifindUserData.name || "",
          email: ifindUserData.email || "",
          role: ifindUserData.role || "",
          completedSetup: ifindUserData.completedSetup || false,
      };
  }
  
  function getOriginalUserName() {
      const currentUserData = getCurrentUserData();
      return currentUserData.name || "";
  }

  function closeModal() {
      avatarModal.classList.remove("active");
      document.body.style.overflow = "auto";
  }

  function updateProgress() {
      progress = 0;
      let completedSteps = 0;

      // Step 1: Name
      if (userInteractions.nameChanged || (nameInput.value.trim() && nameInput.value.trim() !== getOriginalUserName())) {
          progress += 33.33;
          completedSteps++;
      }
      // Step 2: Avatar
      if (userInteractions.avatarChanged) {
          progress += 33.33;
          completedSteps++;
      }
      // Step 3: Role
      if (userInteractions.roleConfirmed) {
          progress += 33.34; // This adds up to 100
          completedSteps++;
      }

      // Update the visual progress bar
      if (progressBar) {
          progressBar.style.height = `${progress}%`;
      }

      // Update the progress text display
      if (progressText) {
          const displayProgress = Math.min(100, Math.round(progress));
          progressText.textContent = `${displayProgress}% Complete`;
      }
      
      updateStepIndicators(completedSteps);
      
      // Disable the button UNTIL progress is effectively 100%.
      // We use < 99 to be safe with floating point numbers (33.33 + 33.33 + 33.34 = 100).
      nextBtn.disabled = progress < 99;
      
      saveProgressData();
  }
  
  function updateStepIndicators(completedSteps) {
      const steps = document.querySelectorAll(".progress-step");
      steps.forEach((step, index) => {
          const stepNumber = index + 1;
          step.classList.remove("active", "completed");
          if (stepNumber <= completedSteps) {
              step.classList.add("completed");
          } else if (stepNumber === completedSteps + 1) {
              step.classList.add("active");
          }
      });
  }

  function saveProgressData() {
      const progressData = {
          setupData: { ...setupData },
          userInteractions: { ...userInteractions },
          timestamp: new Date().toISOString(),
      };
      localStorage.setItem("setupProgress", JSON.stringify(progressData));
  }

  function loadProgressData() {
      const progressData = JSON.parse(localStorage.getItem("setupProgress"));
      if (progressData) {
          Object.assign(setupData, progressData.setupData);
          Object.assign(userInteractions, progressData.userInteractions);
      }
  }

  function prefillUserData() {
      const originalName = getOriginalUserName();
      if (originalName) {
          nameInput.value = originalName;
          // This is just a prefill, so it shouldn't count as an interaction yet.
          // The interaction is tracked when the user actually types.
      }
  }
  
  async function completeSetup() {
      const currentUserData = getCurrentUserData();
      if (!currentUserData.id) {
          alert("User ID not found. Please log in again.");
          window.location.href = "index.html";
          return;
      }

      try {
          const response = await fetch(`${API_URL}/users/${currentUserData.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  full_name: setupData.name,
                  user_type: setupData.role,
                  completed_setup: true,
              }),
          });
          const data = await response.json();

          if (data.success) {
              // We need to use the data returned from the server as the source of truth
              const serverData = data.data;
              const updatedUserData = {
                  ...currentUserData,
                  id: serverData.user_id, 
                  name: serverData.full_name,
                  role: serverData.user_type.toLowerCase(),
                  completedSetup: serverData.completed_setup,
                  avatarId: setupData.avatarId,
                  avatarEmoji: setupData.avatar,
              };
              localStorage.setItem("ifindUserData", JSON.stringify(updatedUserData));

              if (window.Swal) {
                  await window.Swal.fire({
                      title: "Setup Complete!",
                      icon: "success",
                      confirmButtonText: "Continue to iFind",
                      confirmButtonColor: "#4CAF50",
                  });
              } else {
                  alert("Setup Complete!");
              }
              window.location.href = "main.html";
          } else {
              console.error("Failed to complete setup:", data.error);
              alert("Failed to complete setup: " + data.error);
          }
      } catch (error) {
          console.error("Error completing setup:", error);
          alert("An error occurred while completing setup. Please try again.");
      }
  }

  function initializePage() {
      loadProgressData();
      prefillUserData();
      
      const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("visible");
          });
      }, observerOptions);

      document.querySelectorAll(".scroll-reveal, .setup-step").forEach((el) => observer.observe(el));
      
      updateProgress();

      roleOptions.forEach((option) => {
          option.addEventListener("mouseenter", function () {
              if (!this.classList.contains("selected")) this.style.transform = "translateY(-8px) scale(1.05)";
          });
          option.addEventListener("mouseleave", function () {
              if (!this.classList.contains("selected")) this.style.transform = "translateY(0) scale(1)";
          });
      });
  }

  // --- IV. Event Listeners ---

  nameInput.addEventListener("input", function () {
      setupData.name = this.value.trim();
      userInteractions.nameChanged = setupData.name !== "" && setupData.name !== getOriginalUserName();
      updateProgress();
  });

  profileAvatar.addEventListener("click", () => {
      avatarModal.classList.add("active");
      document.body.style.overflow = "hidden";
  });

  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  avatarModal.addEventListener("click", (e) => {
      if (e.target === avatarModal) closeModal();
  });

  avatarOptions.forEach((option) => {
      option.addEventListener("click", function () {
          avatarOptions.forEach((opt) => opt.classList.remove("selected"));
          this.classList.add("selected");
      });
  });

  saveBtn.addEventListener("click", () => {
      const selectedAvatar = document.querySelector(".avatar-option.selected");
      if (selectedAvatar) {
          profileAvatar.querySelector(".avatar-base").innerHTML = selectedAvatar.textContent;
          setupData.avatar = selectedAvatar.textContent;
          setupData.avatarId = selectedAvatar.dataset.avatar;
          userInteractions.avatarChanged = true;
          updateProgress();
      }
      closeModal();
  });

  roleOptions.forEach((option) => {
      option.addEventListener("click", function () {
          roleOptions.forEach((opt) => opt.classList.remove("selected"));
          this.classList.add("selected");
          setupData.role = this.dataset.role;
          userInteractions.roleConfirmed = true;
          updateProgress();
      });
  });

  nextBtn.addEventListener("click", completeSetup);
  
  // --- V. Page Initialization ---
  initializePage();

});