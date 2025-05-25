let currentStep = 1;
const totalSteps = 3;
let selectedUserType = null;
let selectedAvatar = null;
let uploadedImage = null;

const container = document.getElementById('container');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const nameInput = document.getElementById('nameInput');
const profileAvatar = document.getElementById('profileAvatar');

// Profile modal elements
const profileModal = document.getElementById('profileModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modalTabs = document.querySelectorAll('.modal-tab');
const tabContents = document.querySelectorAll('.tab-content');
const avatarOptions = document.querySelectorAll('.avatar-option');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

// User type selection
document.querySelectorAll('.user-type-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.user-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedUserType = card.dataset.type;
        updateNextButton();
    });
});

// Name input validation
nameInput.addEventListener('input', updateNextButton);

// Profile avatar click handler
profileAvatar.addEventListener('click', () => {
    profileModal.classList.add('active');
});

function updateNextButton() {
    const isValid = validateCurrentStep();
    nextBtn.disabled = !isValid;
    
    if (currentStep === totalSteps) {
        nextBtn.textContent = 'Complete';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return nameInput.value.trim().length > 0;
        case 2:
            return true; // Profile picture is optional
        case 3:
            return selectedUserType !== null;
        default:
            return false;
    }
}

function updateProgress() {
    for (let i = 1; i <= totalSteps; i++) {
        const progressStep = document.getElementById(`progress${i}`);
        const progressCircle = progressStep.querySelector('.progress-circle');
        
        if (i < currentStep) {
            progressStep.classList.add('completed');
            progressCircle.classList.add('completed');
        } else if (i === currentStep) {
            progressStep.classList.remove('completed');
            progressCircle.classList.remove('completed');
        } else {
            progressStep.classList.remove('completed');
            progressCircle.classList.remove('completed');
        }
    }

    // Update progress lines
    for (let i = 1; i < totalSteps; i++) {
        const line = document.getElementById(`line${i}`);
        if (i < currentStep) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    }
}

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Update back button visibility
    if (stepNumber === 1) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
    
    updateProgress();
    updateNextButton();
}

// UPDATED: Gentle animation function - 180-degree flip lang!
function animateTransition(callback, direction = 'forward') {
    container.classList.add('animating');
    
    // Choose animation direction - 180 degrees lang para hindi nakakahilo
    const animationClass = direction === 'forward' ? 'flip-forward' : 'flip-backward';
    container.classList.add(animationClass);
    
    // Change content at the halfway point (300ms) when card is facing away
    setTimeout(() => {
        // Hide current step instantly
        const currentStepElement = document.getElementById(`step${currentStep}`);
        currentStepElement.style.opacity = '0';
        
        // Execute callback to change step
        callback();
        
        // Show new step instantly
        const newStepElement = document.getElementById(`step${currentStep}`);
        newStepElement.style.opacity = '1';
    }, 300);
    
    // Complete animation and cleanup
    setTimeout(() => {
        container.classList.remove(animationClass);
        container.classList.remove('animating');
        
        // Reset any inline styles
        document.querySelectorAll('.step').forEach(step => {
            step.style.opacity = '';
        });
    }, 600);
}

// UPDATED: Complete onboarding function
function completeOnboarding() {
    // Save user data to localStorage (optional)
    const userData = {
        name: nameInput.value.trim(),
        userType: selectedUserType,
        profilePicture: selectedAvatar || uploadedImage || null,
        completedAt: new Date().toISOString()
    };
    
    // Store user data
    localStorage.setItem('iFind_userData', JSON.stringify(userData));
    
    // Show success message briefly
    const originalText = nextBtn.textContent;
    nextBtn.textContent = 'Redirecting...';
    nextBtn.disabled = true;
    
    // Add a nice completion animation
    container.style.transform = 'scale(0.95)';
    container.style.opacity = '0.8';
    
    // Redirect to main page after a short delay
    setTimeout(() => {
        window.location.href = '../html/main.html';
    }, 1000);
}

// UPDATED: Next button click handler
nextBtn.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < totalSteps) {
        animateTransition(() => {
            currentStep++;
            showStep(currentStep);
        }, 'forward');
    } else {
        // Complete the onboarding and redirect
        completeOnboarding();
    }
});

backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        animateTransition(() => {
            currentStep--;
            showStep(currentStep);
        }, 'backward');
    }
});

// Modal functionality
// Close modal
[closeModal, cancelBtn].forEach(btn => {
    btn.addEventListener('click', () => {
        profileModal.classList.remove('active');
        resetModalState();
    });
});

// Close modal on backdrop click
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.classList.remove('active');
        resetModalState();
    }
});

// Tab switching
modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName + 'Tab') {
                content.classList.add('active');
            }
        });
    });
});

// Avatar selection
avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedAvatar = option.dataset.avatar;
        uploadedImage = null;
        resetUploadArea();
    });
});

// File upload functionality
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage = e.target.result;
            selectedAvatar = null;
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Update upload area to show preview
            uploadArea.innerHTML = `
                <img src="${uploadedImage}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <div style="margin-top: 10px; color: #059669; font-weight: 500;">Image uploaded successfully!</div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Save profile picture
saveBtn.addEventListener('click', () => {
    if (selectedAvatar) {
        // Update profile with selected avatar
        const avatarClass = `avatar-${selectedAvatar}`;
        const avatarChar = avatarOptions[selectedAvatar - 1].querySelector('.avatar-character').textContent;
        
        profileAvatar.innerHTML = `
            <div class="avatar-character ${avatarClass}" style="font-size: 60px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${avatarChar}</div>
            <div class="edit-overlay"></div>
        `;
        profileAvatar.classList.add('profile-avatar-selected');
    } else if (uploadedImage) {
        // Update profile with uploaded image
        profileAvatar.innerHTML = `
            <img src="${uploadedImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            <div class="edit-overlay"></div>
        `;
        profileAvatar.classList.add('profile-avatar-selected');
    }
    
    // Re-attach click event listener
    attachProfileClickListener();
    
    profileModal.classList.remove('active');
    resetModalState();
});

// Function to attach click listener
function attachProfileClickListener() {
    profileAvatar.removeEventListener('click', openModal);
    profileAvatar.addEventListener('click', openModal);
}

function openModal() {
    profileModal.classList.add('active');
}

function resetModalState() {
    // Reset upload area
    resetUploadArea();
    
    // Clear selections
    avatarOptions.forEach(opt => opt.classList.remove('selected'));
    selectedAvatar = null;
    uploadedImage = null;
    
    // Reset to illustrations tab
    modalTabs.forEach(t => t.classList.remove('active'));
    modalTabs[0].classList.add('active');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById('illustrationsTab').classList.add('active');
}

function resetUploadArea() {
    uploadArea.innerHTML = `
        <div class="upload-icon">📁</div>
        <div class="upload-text">Click to upload or drag and drop</div>
        <div class="upload-subtext">PNG, JPG up to 5MB</div>
        <input type="file" class="file-input" id="fileInput" accept="image/*">
    `;
    
    // Re-attach file input event listener
    const newFileInput = uploadArea.querySelector('.file-input');
    newFileInput.addEventListener('change', handleFileUpload);
}

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#1e3a8a';
    uploadArea.style.background = 'rgba(30, 58, 138, 0.05)';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#d1d5db';
    uploadArea.style.background = 'transparent';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage = e.target.result;
            selectedAvatar = null;
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            uploadArea.innerHTML = `
                <img src="${uploadedImage}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <div style="margin-top: 10px; color: #059669; font-weight: 500;">Image uploaded successfully!</div>
            `;
        };
        reader.readAsDataURL(file);
    }
});

// Initialize
updateNextButton();
updateProgress();
attachProfileClickListener();