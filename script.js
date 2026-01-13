// Toggle Mobile Menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Add click event to the hamburger icon
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked (for better user experience on mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== BOOKING FORM HANDLING ==========
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    // Add real-time validation on blur
    const inputs = bookingForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('has-error')) {
                validateField(input);
            }
        });
    });

    // Form submission
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstError = bookingForm.querySelector('.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.querySelector('.form-control').focus();
            }
            return;
        }

        // 1. Change the button text to show it's processing
        const submitBtn = bookingForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // 2. Prepare the data
        const formData = new FormData(bookingForm);
        
        // PASTE YOUR GOOGLE SCRIPT URL HERE
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzvAcGTdviFd43pejLeKlFgfI4ZZmE99r9CSLghcXhHVivVmgZGAU6HtJmkvJG4eUB59g/exec'; 

        // 3. Send data to Google Sheets
        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                // Success Handling
                const fullName = formData.get('fullName');
                const vehicleType = formData.get('vehicleType');
                const passengers = formData.get('passengers');
                const bookingDate = formData.get('bookingDate');

                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.hidden = false;
                    successMessage.textContent = `✓ Thank you ${fullName}! Your enquiry for ${vehicleType} (${passengers} passengers) on ${formatDate(bookingDate)} has been received. We'll contact you within 2 hours.`;
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                // Reset form
                bookingForm.reset();
                inputs.forEach(input => input.classList.remove('has-error'));
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    successMessage.hidden = true;
                }, 5000);
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("There was a problem submitting your form. Please try again or call us directly.");
            })
            .finally(() => {
                // Reset button
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
    });
}

// ========== FORM VALIDATION FUNCTIONS ==========
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMsg = formGroup.querySelector('.error-msg');
    let isValid = true;
    let message = '';

    const name = field.getAttribute('name');
    const value = field.value.trim();

    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    // Email validation
    else if (name === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    // Mobile validation
    else if (name === 'mobile' && value && !isValidPhone(value)) {
        isValid = false;
        message = 'Please enter a valid phone number (min 10 digits)';
    }
    // Passengers validation
    else if (name === 'passengers' && (value < 1 || value > 50)) {
        isValid = false;
        message = 'Please enter between 1 and 50 passengers';
    }
    // Date validation (must be today or future)
    else if (name === 'bookingDate' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            isValid = false;
            message = 'Please select a date today or in the future';
        }
    }

    // Update UI
    if (isValid) {
        formGroup.classList.remove('has-error');
        if (errorMsg) errorMsg.textContent = '';
    } else {
        formGroup.classList.add('has-error');
        if (errorMsg) errorMsg.textContent = message;
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /[0-9\s\-\+]{10,}/;
    return phoneRegex.test(phone);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}