/**
 * Priya Dental Care - Frontend Application Logic
 * Contains theme toggle, clinic status checker, Leaflet map configuration,
 * multi-step booking widget, appointment dashboard, and patient testimonials slider.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initClinicStatus();
    initLeafletMap();
    initBookingForm();
    initReviewsSystem();
    initFAQAccordion();
    initLightboxGallery();
});

/* ==========================================================================
   Theme Switcher & Preference Persistence
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Load persisted theme or default to system preference (dark mode here)
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/* ==========================================================================
   Mobile Nav Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Simple transform for menu toggle lines
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking links
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// (Visual Gallery logic removed - site is image-free)

/* ==========================================================================
   Real-time Clinic Status Indicator
   ========================================================================== */
function initClinicStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-badge-text');
    if (!statusDot || !statusText) return;

    function updateStatus() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTimeInMins = hour * 60 + minute;

        // Clinic Hours: 09:30 AM to 08:30 PM (Mon - Sun)
        const openTimeInMins = 9 * 60 + 30; // 9:30 AM -> 570 mins
        const closeTimeInMins = 20 * 60 + 30; // 8:30 PM -> 1230 mins

        if (currentTimeInMins >= openTimeInMins && currentTimeInMins < closeTimeInMins) {
            statusDot.className = 'status-dot open';
            
            // Calculate time remaining to close
            const remainingMins = closeTimeInMins - currentTimeInMins;
            const remHours = Math.floor(remainingMins / 60);
            const remMins = remainingMins % 60;
            
            let timeString = '';
            if (remHours > 0) {
                timeString += `${remHours} hr${remHours > 1 ? 's' : ''} `;
            }
            timeString += `${remMins} min${remMins !== 1 ? 's' : ''}`;

            statusText.innerHTML = `<span style="color: var(--success-color)">Open Now</span> &bull; Closes in ${timeString}`;
        } else {
            statusDot.className = 'status-dot closed';
            
            // Calculate time remaining to open
            let nextOpenMsg = 'Opens tomorrow at 9:30 AM';
            statusText.innerHTML = `<span style="color: var(--warning-color)">Closed Now</span> &bull; ${nextOpenMsg}`;
        }
    }

    updateStatus();
    // Refresh status check every 15 seconds
    setInterval(updateStatus, 15000);
}

/* ==========================================================================
   Leaflet.js Map Integration
   ========================================================================== */
function initLeafletMap() {
    const mapElement = document.getElementById('clinic-map');
    if (!mapElement) return;

    // Safety check: if Leaflet CDN failed to load, show a fallback message
    if (typeof L === 'undefined') {
        console.warn('Leaflet map library is not loaded. Showing static fallback.');
        mapElement.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; background: var(--bg-tertiary); text-align: center; border-radius: var(--border-radius-md); border: 1px dashed var(--card-border);">
                <span style="font-size: 2.5rem; margin-bottom: 1rem;">🗺️</span>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Interactive Map Offline</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 300px; line-height: 1.5;">Unable to connect to mapping services. Please check your internet connection or view directions directly on Google Maps.</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=12.9889173,78.225267" target="_blank" class="btn btn-primary" style="margin-top: 1.25rem; padding: 0.6rem 1.25rem; font-size: 0.85rem;">View on Google Maps</a>
            </div>
        `;
        return;
    }

    // Clinic Coordinates: Dasarahosahalli, Kolar (12.9889173, 78.225267)
    const lat = 12.9889173;
    const lng = 78.225267;
    const clinicCoords = [lat, lng];

    try {
        // Initialize Leaflet Map
        const map = L.map('clinic-map', {
            center: clinicCoords,
            zoom: 15,
            scrollWheelZoom: false
        });

        // Add high contrast tile layer from OpenStreetMap contributors
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Create a Custom Popup
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
                <h4 style="margin: 0 0 5px 0; color: #8D5CF6; font-size: 1rem; font-weight: 700;">Priya Dental Care</h4>
                <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #555;">No.2, Dasarahosahalli, Near Five Star Chicken, Kolar - 563115</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="display: inline-block; background-color:#8D5CF6; color:#fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; text-decoration:none; font-weight:600;">Get Directions &rarr;</a>
            </div>
        `;

        // Add Marker
        const marker = L.marker(clinicCoords).addTo(map);
        marker.bindPopup(popupContent).openPopup();
    } catch (err) {
        console.error('Error initializing Leaflet map:', err);
    }
}

/* ==========================================================================
   Interactive Multi-Step Appointment Booking Widget & Dashboard
   ========================================================================== */
function initBookingForm() {
    const form = document.getElementById('appointment-form');
    const bookingWidget = document.getElementById('booking-widget-card');
    if (!form || !bookingWidget) return;

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    const nextBtn1 = document.getElementById('goto-step-2');
    const nextBtn2 = document.getElementById('goto-step-3');
    const backBtn1 = document.getElementById('back-to-step-1');
    const backBtn2 = document.getElementById('back-to-step-2');

    const progressNodes = document.querySelectorAll('.step-node');
    const progressLine = document.getElementById('progress-line');

    const serviceSelect = document.getElementById('booking-service');
    const dateInput = document.getElementById('booking-date');
    const timeSlotInput = document.getElementById('selected-time-slot');
    const datePreview = document.getElementById('selected-date-preview');
    const slotsContainer = document.getElementById('time-slots-container');

    // Dashboard Elements
    const dashboard = document.getElementById('booking-dashboard');
    const dashboardList = document.getElementById('dashboard-list');
    const btnToggleDash = document.getElementById('btn-toggle-dashboard');
    const btnCloseDash = document.getElementById('btn-close-dashboard');

    // Receipt Elements
    const receipt = document.getElementById('booking-receipt');
    const btnBookAnother = document.getElementById('btn-book-another');

    // Setup Date Constraints (Can't book past dates, limit to 60 days ahead)
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Navigate to Step 2: Time Slots
    nextBtn1.addEventListener('click', () => {
        if (!serviceSelect.value) {
            alert('Please select a dental service.');
            serviceSelect.focus();
            return;
        }
        if (!dateInput.value) {
            alert('Please choose an appointment date.');
            dateInput.focus();
            return;
        }

        // Setup Step 2 UI
        datePreview.textContent = formatDate(dateInput.value);
        generateTimeSlots(dateInput.value);

        step1.classList.remove('active');
        step2.classList.add('active');
        
        progressNodes[1].classList.add('active');
        progressNodes[0].classList.add('completed');
        progressLine.style.width = '50%';
    });

    // Navigate back to Step 1
    backBtn1.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
        
        progressNodes[1].classList.remove('active');
        progressNodes[0].classList.remove('completed');
        progressLine.style.width = '0%';
    });

    // Navigate to Step 3: Details
    nextBtn2.addEventListener('click', () => {
        if (!timeSlotInput.value) {
            alert('Please select a time slot.');
            return;
        }

        step2.classList.remove('active');
        step3.classList.add('active');

        progressNodes[2].classList.add('active');
        progressNodes[1].classList.add('completed');
        progressLine.style.width = '100%';
    });

    // Navigate back to Step 2
    backBtn2.addEventListener('click', () => {
        step3.classList.remove('active');
        step2.classList.add('active');

        progressNodes[2].classList.remove('active');
        progressNodes[1].classList.remove('completed');
        progressLine.style.width = '50%';
    });

    // Generate Clinic Time Slots Dynamically (9:30 AM - 8:00 PM, 30 min intervals)
    function generateTimeSlots(selectedDateString) {
        slotsContainer.innerHTML = '';
        timeSlotInput.value = '';
        nextBtn2.disabled = true;

        const slots = [
            '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
            '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', 
            '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', 
            '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', 
            '07:30 PM', '08:00 PM'
        ];

        const selectedDate = new Date(selectedDateString);
        const todayDate = new Date();
        const isToday = selectedDate.toDateString() === todayDate.toDateString();
        const currentHour = todayDate.getHours();
        const currentMin = todayDate.getMinutes();

        slots.forEach(slot => {
            const button = document.createElement('div');
            button.className = 'time-slot-pill';
            button.textContent = slot;

            // Check if slot has already passed today
            if (isToday) {
                const [time, modifier] = slot.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                
                const slotTimeVal = hours * 60 + minutes;
                const currentTimeVal = currentHour * 60 + currentMin;

                if (slotTimeVal <= currentTimeVal + 30) {
                    button.classList.add('disabled');
                }
            }

            button.addEventListener('click', () => {
                if (button.classList.contains('disabled')) return;
                
                // Toggle active pill
                const pills = slotsContainer.querySelectorAll('.time-slot-pill');
                pills.forEach(p => p.classList.remove('selected'));
                button.classList.add('selected');
                
                timeSlotInput.value = slot;
                nextBtn2.disabled = false;
            });

            slotsContainer.appendChild(button);
        });
    }

    // Submit Appointment Form
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pName = document.getElementById('patient-name').value;
        const pPhone = document.getElementById('patient-phone').value;
        const pNotes = document.getElementById('patient-notes').value;
        const service = serviceSelect.value;
        const date = dateInput.value;
        const time = timeSlotInput.value;
        
        const appointmentId = 'PD-' + Math.floor(100000 + Math.random() * 900000);

        const newAppointment = {
            id: appointmentId,
            name: pName,
            phone: pPhone,
            notes: pNotes,
            service: service,
            date: date,
            time: time,
            timestamp: new Date().toISOString()
        };

        // Save appointment to Local Storage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Display Receipt
        document.getElementById('receipt-id').textContent = `#${appointmentId}`;
        document.getElementById('receipt-name').textContent = pName;
        document.getElementById('receipt-service').textContent = service;
        document.getElementById('receipt-date').textContent = formatDate(date);
        document.getElementById('receipt-time').textContent = time;

        form.classList.remove('active');
        receipt.classList.add('active');
    });

    // Reset Booking Widget for new appointment
    btnBookAnother.addEventListener('click', () => {
        form.reset();
        receipt.classList.remove('active');
        form.classList.add('active');
        
        step3.classList.remove('active');
        step1.classList.add('active');
        
        progressNodes.forEach(node => node.className = 'step-node');
        progressNodes[0].classList.add('active');
        progressLine.style.width = '0%';
    });

    // Toggle Bookings Dashboard View
    btnToggleDash.addEventListener('click', () => {
        form.classList.remove('active');
        receipt.classList.remove('active');
        dashboard.classList.add('active');
        renderDashboardList();
    });

    btnCloseDash.addEventListener('click', () => {
        dashboard.classList.remove('active');
        form.classList.add('active');
    });

    // Render bookings from LocalStorage
    function renderDashboardList() {
        dashboardList.innerHTML = '';
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

        if (appointments.length === 0) {
            dashboardList.innerHTML = `
                <div class="dashboard-empty">
                    <p>No upcoming appointments found.</p>
                </div>
            `;
            return;
        }

        // Sort by date/timestamp
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        appointments.forEach(appt => {
            const card = document.createElement('div');
            card.className = 'dashboard-card';
            card.innerHTML = `
                <span class="dash-service">${appt.service}</span>
                <span class="dash-meta">Patient: <strong>${appt.name}</strong></span>
                <span class="dash-meta">Schedule: <strong>${formatDate(appt.date)}</strong> at <strong>${appt.time}</strong></span>
                <div class="dash-actions">
                    <span class="dash-id">ID: #${appt.id}</span>
                    <button class="btn-cancel-appt" data-id="${appt.id}">Cancel Visit</button>
                </div>
            `;

            // Wire cancellation action
            card.querySelector('.btn-cancel-appt').addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel this appointment?')) {
                    cancelAppointment(appt.id);
                }
            });

            dashboardList.appendChild(card);
        });
    }

    // Cancel appointment logic
    function cancelAppointment(id) {
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments = appointments.filter(appt => appt.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderDashboardList();
    }

    // Helper Date formatter
    function formatDate(dateStr) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }
}

/* ==========================================================================
   Patient Review Testimonials Slider & Form Database
   ========================================================================== */
function initReviewsSystem() {
    const slider = document.getElementById('testimonial-slider');
    const prevBtn = document.getElementById('prev-review-btn');
    const nextBtn = document.getElementById('next-review-btn');
    const reviewForm = document.getElementById('review-form');
    const btnToggleForm = document.getElementById('btn-toggle-review-form');
    const starInputSpans = document.querySelectorAll('#rating-stars-input span');
    const starInputVal = document.getElementById('review-rating-value');
    
    if (!slider) return;

    let reviews = [];
    let currentIndex = 0;

    // Seeds initial 4 ratings (matches scraped data: 4.5 rating, 4 ratings)
    const initialSeed = [
        {
            author: "Rahul K.",
            rating: 5,
            content: "Excellent clinical diagnosis by Dr. Priyadarshini S. The treatment room was extremely clean and hygienic. She explained the entire RCT process and performed it absolutely painlessly. Highly satisfied!",
            date: "2 weeks ago"
        },
        {
            author: "Swati M.",
            rating: 4,
            content: "Very professional dentist. Explains the health issue clearly before recommending braces. The staff is polite, and the pricing is reasonable compared to other clinics in Kolar.",
            date: "3 weeks ago"
        },
        {
            author: "Anand Rao",
            rating: 5,
            content: "Best dental clinic in Dasarahosahalli. My 8-year-old son had zero anxiety during his teeth cleaning visit. Dr. Priyadarshini is warm and patient-oriented.",
            date: "1 month ago"
        },
        {
            author: "Priya G.",
            rating: 4,
            content: "Conveniently located near the Five Star Chicken landmark, with ample parking space. The clinic is 100% sanitized. Highly recommend checking out their consultation.",
            date: "1 month ago"
        }
    ];

    // Load custom reviews + Seed reviews
    function loadReviews() {
        const storedReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
        reviews = [...storedReviews, ...initialSeed];
        
        renderReviews();
        updateRatingSummary();
    }

    // Render slider items
    function renderReviews() {
        slider.innerHTML = '';
        reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            
            // Build star ratings HTML
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHTML += '<span class="star-fill">★</span>';
                } else {
                    starsHTML += '<span style="color: rgba(251, 191, 36, 0.25)">★</span>';
                }
            }

            card.innerHTML = `
                <div class="stars">${starsHTML}</div>
                <p class="testimonial-text">"${review.content}"</p>
                <div class="testimonial-meta">
                    <span class="t-author">${review.author}</span>
                    <span class="t-date">${review.date}</span>
                </div>
            `;
            slider.appendChild(card);
        });
        
        // Reset slider position
        goToSlide(0);
    }

    // Calculate dynamic rating averages
    function updateRatingSummary() {
        const totalReviews = reviews.length;
        const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = (sumRatings / totalReviews).toFixed(1);

        // Update UI displays
        document.getElementById('avg-rating-value').textContent = avg;
        document.getElementById('review-totals-text').textContent = `Based on ${totalReviews} reviews`;
        document.getElementById('hero-reviews-count').textContent = totalReviews;

        // Build Stars HTML
        const starContainer = document.getElementById('avg-stars-display');
        let starHTML = '';
        const fullStars = Math.floor(avg);
        const hasHalf = avg - fullStars >= 0.3 && avg - fullStars <= 0.7;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starHTML += '<span class="star-fill">★</span>';
            } else if (i === fullStars + 1 && hasHalf) {
                starHTML += '<span class="star-half">★</span>';
            } else {
                starHTML += '<span style="color: rgba(251, 191, 36, 0.25)">★</span>';
            }
        }
        starContainer.innerHTML = starHTML;
    }

    // Slide Controls
    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) currentIndex = reviews.length - 1;
        if (currentIndex >= reviews.length) currentIndex = 0;
        
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Star rating input listener
    starInputSpans.forEach(span => {
        span.addEventListener('click', () => {
            const val = parseInt(span.getAttribute('data-val'));
            starInputVal.value = val;
            
            starInputSpans.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                if (sVal <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Default 5 stars highlight
    starInputSpans.forEach(s => {
        if (parseInt(s.getAttribute('data-val')) <= 5) s.classList.add('active');
    });

    // Write review form visibility toggle
    btnToggleForm.addEventListener('click', () => {
        reviewForm.classList.toggle('active');
        btnToggleForm.textContent = reviewForm.classList.contains('active') 
            ? 'Cancel Review' 
            : 'Write a Patient Review';
    });

    // Submit Review form handler
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const author = document.getElementById('review-author').value;
        const rating = parseInt(starInputVal.value);
        const content = document.getElementById('review-content').value;

        const newReview = {
            author: author,
            rating: rating,
            content: content,
            date: "Just now"
        };

        const storedReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
        storedReviews.unshift(newReview); // Put new reviews at the beginning
        localStorage.setItem('user_reviews', JSON.stringify(storedReviews));

        // Reload lists
        loadReviews();
        
        // Reset form
        reviewForm.reset();
        reviewForm.classList.remove('active');
        btnToggleForm.textContent = 'Write a Patient Review';

        // Scroll to reviews section & show the newly added slide
        document.getElementById('reviews').scrollIntoView();
        goToSlide(0);
    });

    loadReviews();
}

/* ==========================================================================
   Smooth FAQ Accordion
   ========================================================================== */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');
        
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all active FAQs first for a clean experience
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = '0';
            });

            if (!isActive) {
                item.classList.add('active');
                // Calculate actual height dynamically for smooth sliding animation
                answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
            }
        });
    });
}

/* ==========================================================================
   Interactive Lightbox Gallery
   ========================================================================== */
function initLightboxGallery() {
    const containers = document.querySelectorAll('.gallery-img-container');
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');

    if (containers.length === 0 || !modal || !modalImg || !modalCaption || !closeBtn) return;

    containers.forEach(container => {
        container.addEventListener('click', () => {
            const thumbnail = container.querySelector('.gallery-thumbnail');
            if (!thumbnail) return;

            const imgSrc = thumbnail.src;
            const imgAlt = thumbnail.alt;
            
            const titleText = container.getAttribute('data-title') || 'Priya Dental Care';
            const descText = container.getAttribute('data-desc') || '';

            modalImg.src = imgSrc;
            modalImg.alt = imgAlt;
            modalCaption.innerHTML = `<strong>${titleText}</strong><br><span style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 5px; display: inline-block;">${descText}</span>`;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
