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
            // Scroll to first error
            const firstError = bookingForm.querySelector('.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.querySelector('.form-control').focus();
            }
            return;
        }

        // Get form data
        const formData = new FormData(bookingForm);
        const fullName = formData.get('fullName');
        const vehicleType = formData.get('vehicleType');
        const passengers = formData.get('passengers');
        const bookingDate = formData.get('bookingDate');

        // Show success message
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.hidden = false;
            successMessage.textContent = `✓Thank you ${fullName}! Your enquiry for ${vehicleType} (${passengers} passengers) on ${formatDate(bookingDate)} has been received. We'll contact you within 2 hour.`;
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // In production, send data to backend:
        // fetch('/api/booking', { method: 'POST', body: formData })
        //   .then(response => response.json())
        //   .then(data => { /* handle response */ })

        // Reset form after 2 seconds
        setTimeout(() => {
            bookingForm.reset();
            inputs.forEach(input => input.classList.remove('has-error'));
            successMessage.hidden = true;
        }, 2000);
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