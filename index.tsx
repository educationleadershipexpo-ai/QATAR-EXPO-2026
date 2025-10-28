

    declare var Panzoom: any;
    declare var emailjs: any;

    document.addEventListener('DOMContentLoaded', () => {

    // --- Reusable Form Validation Helpers ---
    const showError = (input: HTMLElement, message: string) => {
        const formGroup = input.closest('.form-group, .form-group-consent, .interest-group-container');
        if (!formGroup) return;
        const errorElement = formGroup.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
            errorElement.innerText = message;
            errorElement.style.display = 'block';
        }
        // FIX: Cast `input` to `HTMLInputElement` to safely access the 'type' property.
        if (input.tagName.toLowerCase() !== 'div' && (input as HTMLInputElement).type !== 'file' && !input.closest('.consent-group')) {
            input.classList.add('invalid');
        }
    };

    const clearError = (input: HTMLElement) => {
        const formGroup = input.closest('.form-group, .form-group-consent, .interest-group-container');
         if (!formGroup) return;
        const errorElement = formGroup.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
            errorElement.innerText = '';
            errorElement.style.display = 'none';
        }
        // FIX: Cast `input` to `HTMLInputElement` to safely access the 'type' property.
         if (input.tagName.toLowerCase() !== 'div' && (input as HTMLInputElement).type !== 'file' && !input.closest('.consent-group')) {
            input.classList.remove('invalid');
        }
    };

    // --- Universal Real-Time Validator ---
    const validateField = (field: HTMLElement): boolean => {
        if (!field) return true;
        let isValid = true;
        const input = field as HTMLInputElement;
        const select = field as HTMLSelectElement;
        const checkbox = field as HTMLInputElement;
        const textarea = field as HTMLTextAreaElement;

        const value = input.value?.trim();
        clearError(field);

        switch (field.id) {
            case 'form-name':
            case 'form-booth-name':
            case 'form-student-name':
            case 'form-sponsor-name':
            case 'form-speaker-name':
                if (value === '') {
                    showError(field, 'Name is required.');
                    isValid = false;
                }
                break;
            
            case 'form-organization':
            case 'form-booth-company':
            case 'form-student-school':
            case 'form-sponsor-company':
            case 'form-speaker-job-org':
                if (value === '') {
                    const fieldName = (field.id === 'form-booth-company' || field.id === 'form-sponsor-company') ? 'Company' : (field.id === 'form-student-school') ? 'School/Institution' : 'Organization';
                    showError(field, `${fieldName} is required.`);
                    isValid = false;
                }
                break;
                
            case 'form-email':
            case 'form-booth-email':
            case 'form-student-email':
            case 'form-sponsor-email':
            case 'form-speaker-email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value === '') {
                    showError(field, 'Email is required.');
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    showError(field, 'Please enter a valid email address.');
                    isValid = false;
                }
                break;
            
            case 'form-phone':
            case 'form-student-phone':
            case 'form-booth-phone':
            case 'form-sponsor-phone':
            case 'form-speaker-phone':
                const phoneRegex = /^[\d\s()+-]+$/;
                 if ((field.hasAttribute('required') && value === '')) {
                    showError(field, 'Mobile number is required.');
                    isValid = false;
                } else if (value !== '' && !phoneRegex.test(value)) {
                    showError(field, 'Please enter a valid phone number.');
                    isValid = false;
                }
                break;

            case 'form-booth-title':
            case 'form-sponsor-title':
                 if (value === '') {
                    const fieldName = (field.id === 'form-sponsor-title') ? 'Position' : 'Job Title';
                    showError(field, `${fieldName} is required.`);
                    isValid = false;
                }
                break;
            
            case 'form-booth-website':
            case 'form-sponsor-website':
            case 'form-speaker-linkedin':
                const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
                if (field.hasAttribute('required') && value === '') {
                     showError(field, 'Website is required.');
                     isValid = false;
                } else if (value !== '' && !urlRegex.test(value)) {
                    showError(field, 'Please enter a valid website URL.');
                    isValid = false;
                }
                break;

            case 'form-sponsor-message':
            case 'form-speaker-why':
            case 'form-speaker-bio':
                if (textarea.value.trim() === '') {
                    showError(field, 'This field is required.');
                    isValid = false;
                }
                break;
            
            case 'form-interest':
            case 'form-booth-package':
            case 'form-booth-source':
            case 'form-student-nationality':
            case 'form-student-grade':
            case 'form-student-source':
            case 'form-booth-country':
            case 'form-booth-company-field':
            case 'form-sponsor-country':
            case 'form-sponsor-company-field':
            case 'form-speaker-country':
                if (select.value === '') {
                    showError(field, 'Please make a selection.');
                    isValid = false;
                }
                break;

            case 'form-student-dob':
                if (input.value === '') {
                     showError(field, 'Date of birth is required.');
                     isValid = false;
                }
                break;
            
            case 'form-booth-consent':
            case 'form-student-consent':
            case 'form-sponsor-consent':
                if (!checkbox.checked) {
                    showError(checkbox, 'You must consent to continue.');
                    isValid = false;
                }
                break;
        }
        return isValid;
    }


    // --- Active Nav Link Highlighting ---
    function highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('#main-nav a.nav-link');

        navLinks.forEach(link => {
            const linkPage = (link as HTMLAnchorElement).href.split('/').pop();

            if (linkPage === currentPage) {
                link.classList.add('active');
                
                // For dropdowns, also highlight the parent
                const parentDropdown = link.closest('.has-dropdown');
                if (parentDropdown) {
                    parentDropdown.querySelector('a.nav-link')?.classList.add('active');
                }
            }
        });
    }


    // --- Mobile Navigation Logic ---
    function initializeMobileNav() {
        const header = document.getElementById('main-header');
        const navToggle = document.querySelector('.nav-toggle') as HTMLButtonElement;
        const mainNav = document.getElementById('main-nav');

        if (!header || !navToggle || !mainNav) return;

        navToggle.addEventListener('click', () => {
        header.classList.toggle('nav-open');
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        
        if (header.classList.contains('nav-open')) {
            (mainNav.querySelector('a') as HTMLAnchorElement)?.focus();
        } else {
            navToggle.focus();
        }
        });

        // Close menu when a link is clicked, unless it's a dropdown toggle on mobile
        mainNav.addEventListener('click', (e) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;
            
            // If it's a dropdown toggle, the dropdown logic will handle it, so we don't close the main nav.
            if (link.parentElement?.classList.contains('has-dropdown')) {
                return; 
            }

            // If it's a regular link inside the mobile nav, close it.
            if (header.classList.contains('nav-open')) {
                header.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }
    
    // --- Dropdown Navigation Logic ---
    function initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown');

        dropdowns.forEach((dropdown, index) => {
            const toggle = dropdown.querySelector('a') as HTMLAnchorElement;
            const menu = dropdown.querySelector('.dropdown-menu') as HTMLElement;

            if (!toggle || !menu) return;

            // Setup ARIA attributes
            const menuId = `dropdown-menu-${index}`;
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            menu.id = menuId;
            toggle.setAttribute('aria-controls', menuId);

            // Universal click handler for both mobile and desktop
            toggle.addEventListener('click', (e) => {
                // Prevent default for all dropdown toggles to handle open/close manually
                e.preventDefault();
                
                const isCurrentlyOpen = dropdown.classList.contains('dropdown-open');

                // First, close all other open dropdowns
                document.querySelectorAll('.has-dropdown.dropdown-open').forEach(openDropdown => {
                    if (openDropdown !== dropdown) {
                        openDropdown.classList.remove('dropdown-open');
                        openDropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');
                    }
                });

                // Then, toggle the state of the clicked dropdown
                dropdown.classList.toggle('dropdown-open');
                toggle.setAttribute('aria-expanded', String(!isCurrentlyOpen));
            });
        });
        
        // This listener closes any open dropdown when a click happens anywhere outside a dropdown toggle.
        // This now works for BOTH mobile and desktop.
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            // If the click is on a dropdown toggle, its own listener will handle it.
            // We do nothing here to avoid immediately closing the menu that was just opened.
            if (target.closest('.has-dropdown > a')) {
                return;
            }
            
            // If the click is anywhere else, close all open dropdowns.
            document.querySelectorAll('.has-dropdown.dropdown-open').forEach(openDropdown => {
                openDropdown.classList.remove('dropdown-open');
                openDropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Countdown Timer Logic ---
    function initializeMainCountdown() {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const countdownContainer = document.getElementById('countdown-timer');

        if (daysEl && hoursEl && minutesEl && secondsEl && countdownContainer) {
            const countdownDate = new Date('2026-04-19T08:00:00').getTime();

            const triggerUpdateAnimation = (element: HTMLElement | null) => {
                if (!element) return;
                const parentUnit = element.closest('.timer-unit');
                if (parentUnit) {
                    parentUnit.classList.add('updated');
                    parentUnit.addEventListener('animationend', () => {
                        parentUnit.classList.remove('updated');
                    }, { once: true });
                }
            };

            const timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = countdownDate - now;

                if (distance < 0) {
                    clearInterval(timerInterval);
                    countdownContainer.innerHTML = '<h4>The event has started!</h4>';
                    return;
                }

                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                
                if (daysEl.textContent !== days) {
                    daysEl.textContent = days;
                    triggerUpdateAnimation(daysEl);
                }
                if (hoursEl.textContent !== hours) {
                    hoursEl.textContent = hours;
                    triggerUpdateAnimation(hoursEl);
                }
                if (minutesEl.textContent !== minutes) {
                    minutesEl.textContent = minutes;
                    triggerUpdateAnimation(minutesEl);
                }
                if (secondsEl.textContent !== seconds) {
                    secondsEl.textContent = seconds;
                    triggerUpdateAnimation(secondsEl);
                }
            }, 1000);
        }
    }
    
    // --- Early Bird Countdown Timer ---
    function initializeEarlyBirdCountdown() {
        const countdownContainer = document.getElementById('early-bird-countdown');
        if (!countdownContainer) return;

        const daysEl = document.getElementById('eb-days');
        const hoursEl = document.getElementById('eb-hours');
        const minutesEl = document.getElementById('eb-minutes');
        const secondsEl = document.getElementById('eb-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        // The early bird offer ends on the morning of Nov 20, 2025.
        const countdownDate = new Date('2025-11-20T08:00:00').getTime();

        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                countdownContainer.innerHTML = '<h4>The early bird offer has ended!</h4>';
                return;
            }

            const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
            
            daysEl.textContent = days;
            hoursEl.textContent = hours;
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;

        }, 1000);
    }


    // --- Form Initializers ---
    function initializeContactForm() {
        const form = document.getElementById('contact-form') as HTMLFormElement;
        const successMessage = document.getElementById('form-success-message');
        if (!form || !successMessage) return;

        const inputs: HTMLElement[] = Array.from(form.querySelectorAll('[required]'));
        inputs.forEach(input => {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);

            // This block handles the PDF download trigger.
            const customValidationAndActions = () => {
                if ((form.querySelector('#form-interest') as HTMLSelectElement)?.value === 'exhibiting') {
                    const link = document.createElement('a');
                    link.href = '#'; // Placeholder, you should replace this with the actual file path.
                    link.download = 'QELE2026-Sponsorship-Deck.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                return true;
            };
            
            const isCustomValid = customValidationAndActions();

            if (isFormValid && isCustomValid) {
                const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }

                // --- GOOGLE SHEETS INTEGRATION ---
                // =========================================================================================
                // INSTRUCTIONS:
                // 1. Create a new Google Sheet.
                // 2. IMPORTANT: Rename the first sheet (tab at the bottom) to "ContactInquiries".
                // 3. Add the following headers in the first row, in this exact order:
                //    Timestamp, form_source, name, organization, email, phone, interest
                // 4. Go to Extensions > Apps Script.
                // 5. Paste the universal script code into the script editor.
                // 6. Click Deploy > New deployment.
                // 7. For "Select type", choose "Web app", and set "Who has access" to "Anyone".
                // 8. Click Deploy, authorize the script, and copy the new Web app URL.
                // 9. Paste the new URL into the 'googleSheetWebAppUrl' constant below.
                // =========================================================================================
                const googleSheetWebAppUrl = 'https://script.google.com/macros/s/AKfycbxUS76iFHL00oqCytiDjvpPfY9wONwwttdI00R6nhhoAkyED2ogZviUb3yXXRDAqAs7tg/exec';
                const basinEndpoint = 'https://usebasin.com/f/8b6d8aeec167';

                try {
                    const formData = new FormData(form);
                    
                    // --- Primary Action: Google Sheets Integration ---
                    const googleSheetResponse = await fetch(googleSheetWebAppUrl, {
                        method: 'POST',
                        body: new URLSearchParams(formData as any)
                    });

                    if (!googleSheetResponse.ok) {
                        throw new Error(`Google Sheets submission failed. Status: ${googleSheetResponse.status}`);
                    }

                    const result = await googleSheetResponse.json();
                    if (result.result !== 'success') {
                        throw new Error(result.error || 'The script returned an unknown error. Please check the sheet name and headers.');
                    }

                    // --- Secondary Action: Basin Integration (Fire-and-forget is fine here) ---
                    fetch(basinEndpoint, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    }).catch(err => {
                        // Log error but don't block user success message, as primary action succeeded.
                        console.error('Basin form submission failed:', err);
                    });

                    // --- Show success to user ---
                    form.style.display = 'none';
                    successMessage.style.display = 'block';
                    window.scrollTo(0, 0);

                } catch (error) {
                    console.error('Submission error:', error);
                    alert('Sorry, there was a problem with your inquiry. Please check your network connection and try again. Error: ' + (error as Error).message);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Inquiry & Get Deck';
                    }
                }
            } else {
                const firstInvalidField = form.querySelector('.invalid, .error-message[style*="block"]');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    function initializeStudentRegistrationForm() {
        const form = document.getElementById('student-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('student-form-success');
        if (!form || !successMessage) return;

        const inputs: HTMLElement[] = Array.from(form.querySelectorAll('[required]'));
        const interestsContainer = document.getElementById('form-student-interests');
        const otherCheckbox = document.getElementById('interest-other') as HTMLInputElement;
        const otherInterestGroup = document.getElementById('other-interest-group') as HTMLElement;
        const otherTextInput = document.getElementById('interest-other-text') as HTMLInputElement;

        if (otherCheckbox && otherInterestGroup && otherTextInput) {
            otherCheckbox.addEventListener('change', () => {
                otherInterestGroup.style.display = otherCheckbox.checked ? 'block' : 'none';
                if (!otherCheckbox.checked) {
                    otherTextInput.value = ''; // Clear value when unchecked
                    clearError(otherTextInput); // Also clear potential errors
                }
            });
        }

        const validateInterestCheckboxes = (): boolean => {
            if (!interestsContainer) return true;
            const checkedCheckboxes = interestsContainer.querySelectorAll('input[type="checkbox"]:checked');
            const isGroupValid = checkedCheckboxes.length > 0;

            if (!isGroupValid) {
                showError(interestsContainer, 'Please select at least one area of interest.');
                return false;
            }

            clearError(interestsContainer);

            if (otherCheckbox?.checked && otherTextInput?.value.trim() === '') {
                showError(otherTextInput, 'Please specify your area of interest.');
                return false;
            }

            if (otherTextInput) clearError(otherTextInput);

            return true;
        };

        inputs.forEach(input => {
            const eventType = ['select-one', 'date', 'checkbox'].includes((input as HTMLInputElement).type) ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });

        interestsContainer?.addEventListener('change', validateInterestCheckboxes);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);
            const areCheckboxesValid = validateInterestCheckboxes();

            if (isFormValid && areCheckboxesValid) {
                const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }

                // =========================================================================================
                // --- ROBUST GOOGLE SHEETS INTEGRATION ---
                // =========================================================================================
                // !! CRITICAL INSTRUCTIONS !!
                // 1. Follow the guide in the documentation to create and deploy your Google Apps Script.
                // 2. Make sure you select "Anyone" for "Who has access".
                // 3. After deploying, Google will give you a new "Web app URL".
                // 4. **PASTE THE NEW URL BELOW** to replace the placeholder.
                //
                // The old URL 'AK...Na' will not work if you have made changes or if permissions are wrong.
                // A new deployment is ALWAYS required.
                // =========================================================================================
                const googleSheetWebAppUrl = 'https://script.google.com/macros/s/AKfycbwHIEFWVu-5cIqrbW8pV5MSobkrTEq05kxi7aTcIwkfAGpC6ulVoo3tlrq16y3qoZXs/exec';

                // FIX: Removed redundant developer check for a placeholder URL, which was causing a TypeScript error
                // because the comparison against a hardcoded URL would always be false.
                
                try {
                    const formData = new FormData(form);
                    const response = await fetch(googleSheetWebAppUrl, {
                        method: 'POST',
                        body: new URLSearchParams(formData as any)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.result === 'success') {
                            // The script confirmed the data was saved!
                            form.style.display = 'none';
                            successMessage.style.display = 'block';
                            window.scrollTo(0, 0);
                        } else {
                            // The script reported an error (e.g., sheet not found).
                            throw new Error(result.error || 'The script returned an unknown error.');
                        }
                    } else {
                        // The network request itself failed (e.g., URL is wrong, server error).
                        throw new Error(`Submission failed. Status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Submission Error:', error);
                    alert('Sorry, there was a problem with your registration. Please check your network connection and try again. If the problem persists, contact support. Error: ' + (error as Error).message);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Register Now';
                    }
                }
            } else {
                const firstInvalidField = form.querySelector('.invalid, .error-message[style*="block"]');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
    
    function initializeBoothRegistrationForm() {
        const form = document.getElementById('booth-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('booth-form-success');
        if (!form || !successMessage) return;

        const inputs: HTMLElement[] = Array.from(form.querySelectorAll('[required]'));
        const packageSelect = document.getElementById('form-booth-package') as HTMLSelectElement;
        const boothIdInput = document.getElementById('form-booth-id') as HTMLInputElement;

        // Pre-fill form from URL parameters
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const pkg = urlParams.get('package');
            const boothId = urlParams.get('boothId');
            
            if (pkg && packageSelect) {
                const option = Array.from(packageSelect.options).find(opt => opt.value.toLowerCase() === pkg.toLowerCase());
                if(option) option.selected = true;
            }
            if (boothId && boothIdInput) boothIdInput.value = boothId;
        } catch (e) {
            console.error("Error processing URL parameters:", e);
        }

        inputs.forEach(input => {
            const eventType = ['select-one', 'checkbox'].includes((input as HTMLInputElement).type) ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);

            if (isFormValid) {
                const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }

                // =========================================================================================
                // --- ROBUST GOOGLE SHEETS INTEGRATION FOR BOOTH REGISTRATIONS ---
                // =========================================================================================
                // !! CRITICAL INSTRUCTIONS !!
                // 1. Create a new, separate Google Sheet for booth registrations.
                // 2. IMPORTANT: Rename the first sheet (the tab at the bottom) to exactly "BoothRegistrations".
                // 3. In the first row of the "BoothRegistrations" sheet, add these exact headers:
                //    Timestamp, form_source, name, country, phone, email, website, company, job_title, company_field, package, booth_id, source, message, consent
                // 4. Go to Extensions > Apps Script and paste the universal script code.
                // 5. Click Deploy > New deployment.
                // 6. Choose "Web app", set "Who has access" to "Anyone", and click Deploy.
                // 7. Copy the NEW Web app URL and paste it into the constant below.
                // =========================================================================================
                const googleSheetWebAppUrl = 'https://script.google.com/macros/s/AKfycbxW3MBK-rPB1L2rOKMQ9mqkeGagcrnDcFpT7cZYvEFy4WzNxxnU2ZzLnMAQGwvSZZaQ/exec';
                
                try {
                    const formData = new FormData(form);
                    const response = await fetch(googleSheetWebAppUrl, {
                        method: 'POST',
                        body: new URLSearchParams(formData as any)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.result === 'success') {
                            // The script confirmed the data was saved!
                            form.style.display = 'none';
                            successMessage.style.display = 'block';
                            window.scrollTo(0, 0);
                        } else {
                            // The script reported an error (e.g., sheet not found).
                            throw new Error(result.error || 'The script returned an unknown error.');
                        }
                    } else {
                        // The network request itself failed.
                        throw new Error(`Submission failed. Status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Booth Registration Error:', error);
                    alert('Sorry, there was a problem with your registration. Please check your network connection and try again. If the problem persists, contact support. Error: ' + (error as Error).message);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Registration';
                    }
                }
            } else {
                const firstInvalidField = form.querySelector('.invalid, .error-message[style*="block"]');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    function initializeSponsorshipRegistrationForm() {
        const form = document.getElementById('sponsorship-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('sponsor-form-success');
        if (!form || !successMessage) return;
    
        const inputs: HTMLElement[] = Array.from(form.querySelectorAll('[required]'));
        inputs.forEach(input => {
            const eventType = ['select-one', 'textarea', 'checkbox'].includes((input as HTMLInputElement).type) ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });
    
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
    
            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);
    
            if (isFormValid) {
                const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }
    
                // =========================================================================================
                // --- ROBUST GOOGLE SHEETS INTEGRATION FOR SPONSORSHIPS ---
                // =========================================================================================
                // !! CRITICAL INSTRUCTIONS !!
                // 1. Create a new, separate Google Sheet for sponsorship inquiries.
                // 2. IMPORTANT: Rename the first sheet (the tab at the bottom) to exactly "SponsorshipRegistrations".
                // 3. In the first row of the "SponsorshipRegistrations" sheet, add these exact headers:
                //    Timestamp, form_source, name, country, phone, email, website, company, job_title, company_field, message, consent
                // 4. Go to Extensions > Apps Script and paste the universal script code provided in the documentation.
                // 5. Click Deploy > New deployment.
                // 6. Choose "Web app", set "Who has access" to "Anyone", and click Deploy.
                // 7. Authorize the script when prompted.
                // 8. Copy the NEW Web app URL and provide it in the next prompt so I can insert it below.
                // =========================================================================================
                const googleSheetWebAppUrl = 'https://script.google.com/macros/s/AKfycbwq3S7GQikOlmmWhh5d3aIkC8uTWtIG6UnXcaPzmwdlZ8m5b3kIRKgafYW9zQV1rB-u/exec';
    
                try {
                    // FIX: Removed redundant developer check for a placeholder URL. Since the URL is
                    // now hardcoded, this comparison would always be false and was flagged as an
                    // error by the TypeScript compiler.
                    const formData = new FormData(form);
                    const response = await fetch(googleSheetWebAppUrl, {
                        method: 'POST',
                        body: new URLSearchParams(formData as any)
                    });
    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.result === 'success') {
                            form.style.display = 'none';
                            successMessage.style.display = 'block';
                            window.scrollTo(0, 0);
                        } else {
                            throw new Error(result.error || 'The script returned an unknown error.');
                        }
                    } else {
                        throw new Error(`Submission failed. Status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Sponsorship Inquiry Error:', error);
                    alert('Sorry, there was a problem with your inquiry. Please check your network and try again. Error: ' + (error as Error).message);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Inquiry';
                    }
                }
            } else {
                const firstInvalidField = form.querySelector('.invalid, .error-message[style*="block"]');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    function initializeSpeakerRegistrationForm() {
        const form = document.getElementById('speaker-registration-form') as HTMLFormElement;
        const successMessage = document.getElementById('speaker-form-success');
        if (!form || !successMessage) return;

        const inputs: HTMLElement[] = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
        const day1Container = document.getElementById('session-day1-group');
        const day2Container = document.getElementById('session-day2-group');
        const headshotInput = document.getElementById('form-speaker-headshot') as HTMLInputElement;
        const consentPromoGroup = document.getElementById('consent-promotional-group');
        const consentRecordGroup = document.getElementById('consent-recording-group');
        const fileUploadText = form.querySelector('.file-upload-text');

        headshotInput?.addEventListener('change', () => {
             if (headshotInput.files && headshotInput.files.length > 0 && fileUploadText) {
                fileUploadText.textContent = headshotInput.files[0].name;
                clearError(headshotInput);
            } else if (fileUploadText) {
                fileUploadText.textContent = 'Choose a file...';
            }
        });
        
        const customValidation = (): boolean => {
            let allValid = true;

            const day1Checked = day1Container?.querySelectorAll('input[type="checkbox"]:checked').length > 0;
            const day2Checked = day2Container?.querySelectorAll('input[type="checkbox"]:checked').length > 0;
            if (day1Container && day2Container && !day1Checked && !day2Checked) {
                showError(day1Container, 'Please select at least one session from Day 1 or Day 2.');
                allValid = false;
            } else {
                if(day1Container) clearError(day1Container);
                if(day2Container) clearError(day2Container);
            }
            
            if (headshotInput?.files?.length === 0) {
                showError(headshotInput, 'A professional headshot is required.');
                allValid = false;
            } else if(headshotInput) {
                clearError(headshotInput);
            }

            const promoChecked = consentPromoGroup?.querySelector('input[type="radio"]:checked');
            if(consentPromoGroup && !promoChecked) {
                showError(consentPromoGroup, 'Please select an option.');
                allValid = false;
            } else if (consentPromoGroup) {
                 clearError(consentPromoGroup);
            }
            
            const recordChecked = consentRecordGroup?.querySelector('input[type="radio"]:checked');
            if(consentRecordGroup && !recordChecked) {
                showError(consentRecordGroup, 'Please select an option.');
                allValid = false;
            } else if (consentRecordGroup) {
                 clearError(consentRecordGroup);
            }

            return allValid;
        };
        
        inputs.forEach(input => {
            const eventType = ['select-one', 'textarea', 'checkbox', 'file', 'radio'].includes((input as HTMLInputElement).type) ? 'change' : 'input';
            input.addEventListener(eventType, () => validateField(input));
        });
        
        day1Container?.addEventListener('change', customValidation);
        day2Container?.addEventListener('change', customValidation);
        consentPromoGroup?.addEventListener('change', customValidation);
        consentRecordGroup?.addEventListener('change', customValidation);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const isFormValid = inputs.map(input => validateField(input)).every(Boolean);
            const isCustomValid = customValidation();

            if (isFormValid && isCustomValid) {
                const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting...';
                }
                
                // =========================================================================================
                // --- ROBUST GOOGLE SHEETS INTEGRATION FOR SPEAKERS ---
                // =========================================================================================
                // !! CRITICAL INSTRUCTIONS TO FIX THE ERROR !!
                // The error "Sheet 'SpeakerRegistrations' was not found" means the Google Apps Script
                // cannot find a sheet with that exact name. Please follow these steps carefully:
                //
                // 1. In your Google Sheet for speaker applications, find the sheet tab at the bottom.
                // 2. IMPORTANT: Rename that sheet to exactly "SpeakerRegistrations".
                //
                // 3. Ensure the headers in the first row of your "SpeakerRegistrations" sheet are exactly as follows (order and hyphens matter):
                //    Timestamp, form_source, name, job_title_organization, email, phone, linkedin_website, country, session-day1, session-day2, why_speak, bio, past_experience, consent-promotional, consent-recording
                //
                // 4. Go to Extensions > Apps Script in your Google Sheet.
                // 5. Ensure the script contains this line, with the correct sheet name:
                //    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SpeakerRegistrations");
                //
                // 6. After checking the name, click Deploy > New deployment.
                // 7. Choose "Web app", set "Who has access" to "Anyone", and click Deploy.
                // 8. Copy the NEW Web app URL and update the 'googleSheetWebAppUrl' constant below if it has changed.
                // =========================================================================================
                const googleSheetWebAppUrl = 'https://script.google.com/macros/s/AKfycbzaHqJGQqN1b3_EXy2TPKf4B2ACcVEwo-OmxribSVw0UkpTvR1kAnsbWOPW39myS9cN/exec';

                // Prepare form data for Google Sheets (excluding the file upload)
                const sheetFormData = new FormData(form);
                sheetFormData.delete('headshot'); // Google Sheets cannot handle file uploads this way.
                
                try {
                    const response = await fetch(googleSheetWebAppUrl, {
                        method: 'POST',
                        body: new URLSearchParams(sheetFormData as any)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.result === 'success') {
                            // The script confirmed the data was saved!
                            form.style.display = 'none';
                            successMessage.style.display = 'block';
                            window.scrollTo(0, 0);
                        } else {
                            // The script reported an error.
                            throw new Error(result.error || 'The script returned an unknown error.');
                        }
                    } else {
                        // The network request itself failed.
                        throw new Error(`Submission failed. Status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Speaker Submission Error:', error);
                    alert('Sorry, there was a problem with your application. Please check your network connection and try again. If the problem persists, contact support. Error: ' + (error as Error).message);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Application';
                    }
                }

            } else {
                const firstInvalidField = form.querySelector('.invalid, .error-message[style*="block"]');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }


    // --- FAQ Accordion ---
    function initializeFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(button => {
            button.addEventListener('click', () => {
                const item = button.closest('.faq-item');
                if (item) {
                    const isOpened = item.classList.toggle('open');
                    button.setAttribute('aria-expanded', String(isOpened));
                }
            });
        });
    }

    // --- Exit Intent Modal ---
    function initializeExitIntentModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (!modal) return;

        const closeModalBtn = modal.querySelector('.modal-close-btn');
        const modalShownInSession = sessionStorage.getItem('exitModalShown') === 'true';

        if (modalShownInSession) {
            return; // Don't set up anything if it's already been shown
        }

        const showModal = () => {
            modal.classList.add('visible');
            sessionStorage.setItem('exitModalShown', 'true');
            // Clean up all triggers once shown
            document.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };

        const hideModal = () => {
            modal.classList.remove('visible');
        };

        const handleMouseOut = (e: MouseEvent) => {
            // Check if mouse is leaving the viewport top
            if (e.clientY <= 0 && e.relatedTarget == null) {
                showModal();
            }
        };

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= 50) {
                showModal();
            }
        };

        const timer = setTimeout(showModal, 10000);

        // Add triggers
        document.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('scroll', handleScroll);

        // Add closing event listeners
        closeModalBtn?.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                hideModal();
            }
        });
    }
    
    // --- Dynamic Partner Logos for Homepage ---
    function initializeHomePartners() {
        const logoGrid = document.getElementById('home-partners-grid');
        if (!logoGrid) return;

        const partners = [
            { src: 'https://cdn.asp.events/CLIENT_Mark_All_D856883D_926F_07B7_E9D09EE4984A0639/sites/inclusive-education-mena/media/Logos/Ed-logo.png', alt: 'Ministry of Education Logo', customClass: 'moe-logo' },
            { src: 'https://res.cloudinary.com/dj3vhocuf/image/upload/v1761216928/Blue_Bold_Office_Idea_Logo_50_x_50_px_10_l68irx.png', alt: 'Sheraton Grand Doha Logo' },
            { src: 'https://i0.wp.com/blog.10times.com/wp-content/uploads/2019/09/cropped-10times-logo-hd.png?fit=3077%2C937&ssl=1', alt: '10times Logo' },
            { src: 'https://www.eventbrite.com/blog/wp-content/uploads/2025/02/Eventbrite_Hero-Lock-up_Brite-Orange.png', alt: 'Eventbrite Logo', customClass: 'eventbrite-logo' }
        ];
        
        logoGrid.innerHTML = '';

        partners.forEach(partner => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            
            const img = document.createElement('img');
            img.src = partner.src;
            img.alt = partner.alt;

            if (partner.alt === 'Sheraton Grand Doha Logo') {
                img.classList.add('sheraton-logo');
            }
             if (partner.customClass) {
                img.classList.add(partner.customClass);
            }
            
            logoItem.appendChild(img);
            logoGrid.appendChild(logoItem);
        });
    }

    // --- Dynamic Partner Logos for Sponsorship Page ---
    function initializeSponsorPagePartners() {
        const logoGrid = document.getElementById('sponsor-partners-grid');
        if (!logoGrid) return;

        const partners = [
            { src: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft Logo' },
            { src: 'https://logo.clearbit.com/google.com', alt: 'Google for Education Logo' },
            { src: 'https://logo.clearbit.com/coursera.org', alt: 'Coursera Logo' },
            { src: 'https://logo.clearbit.com/qf.org.qa', alt: 'Qatar Foundation Logo' },
            { src: 'https://logo.clearbit.com/qu.edu.qa', alt: 'Qatar University Logo' },
            { src: 'https://logo.clearbit.com/britishcouncil.org', alt: 'British Council Logo' },
            { src: 'https://logo.clearbit.com/vodafone.com', alt: 'Vodafone Logo' },
            { src: 'https://logo.clearbit.com/qnb.com', alt: 'QNB Logo' },
        ];
        
        logoGrid.innerHTML = '';

        partners.forEach(partner => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            const img = document.createElement('img');
            img.src = partner.src;
            img.alt = partner.alt;
            logoItem.appendChild(img);
            logoGrid.appendChild(logoItem);
        });
    }
    
    // --- Dynamic Partner Logos for Past Partners Page ---
    function initializePastPartners() {
        const logoGrid = document.getElementById('past-partners-grid');
        if (!logoGrid) return;

        // Using sponsor logos as a placeholder for past partners as a sample.
        const partners = [
            { src: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft Logo' },
            { src: 'https://logo.clearbit.com/google.com', alt: 'Google for Education Logo' },
            { src: 'https://logo.clearbit.com/coursera.org', alt: 'Coursera Logo' },
            { src: 'https://logo.clearbit.com/qf.org.qa', alt: 'Qatar Foundation Logo' },
            { src: 'https://logo.clearbit.com/qu.edu.qa', alt: 'Qatar University Logo' },
            { src: 'https://logo.clearbit.com/britishcouncil.org', alt: 'British Council Logo' },
            { src: 'https://logo.clearbit.com/vodafone.com', alt: 'Vodafone Logo' },
            { src: 'https://logo.clearbit.com/qnb.com', alt: 'QNB Logo' },
        ];
        
        logoGrid.innerHTML = '';

        partners.forEach(partner => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            const img = document.createElement('img');
            img.src = partner.src;
            img.alt = partner.alt;
            logoItem.appendChild(img);
            logoGrid.appendChild(logoItem);
        });
    }

    // --- Agenda Page Tabs ---
    function initializeAgendaTabs() {
        const tabsContainer = document.querySelector('.agenda-tabs');
        if (!tabsContainer) return;

        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        const contentPanels = document.querySelectorAll('.agenda-content');

        tabsContainer.addEventListener('click', (e) => {
            const clickedButton = (e.target as HTMLElement).closest('.tab-btn');
            if (!clickedButton) return;

            const tabId = (clickedButton as HTMLElement).dataset.tab;
            
            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            // Update content panels
            contentPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === tabId);
            });
        });
    }

    // --- Agenda "Save to Calendar" buttons ---
    function initializeAgendaCalendarButtons() {
        const containers = document.querySelectorAll('.save-to-calendar-container');
        if (!containers.length) return;

        const formatTime = (date: Date, format: 'google' | 'ical' | 'outlook'): string => {
            const pad = (num: number) => num.toString().padStart(2, '0');
            if (format === 'google' || format === 'ical') {
                return date.getUTCFullYear() +
                       pad(date.getUTCMonth() + 1) +
                       pad(date.getUTCDate()) + 'T' +
                       pad(date.getUTCHours()) +
                       pad(date.getUTCMinutes()) +
                       pad(date.getUTCSeconds()) + 'Z';
            }
            if (format === 'outlook') {
                return date.toISOString().split('.')[0];
            }
            return '';
        };

        const createIcsContent = (event: any) => {
            const icsData = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                `URL:${document.location.href}`,
                `DTSTART:${formatTime(event.start, 'ical')}`,
                `DTEND:${formatTime(event.end, 'ical')}`,
                `SUMMARY:${event.title}`,
                `DESCRIPTION:${event.description}`,
                `LOCATION:${event.location}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');
            return icsData;
        };

        const handleCalendarClick = (e: Event) => {
            e.preventDefault();
            const target = e.currentTarget as HTMLElement;
            const type = target.dataset.type;

            const card = target.closest('.session-card');
            const content = card?.querySelector('.session-content');
            if (!content) return;

            const h4 = content.querySelector('h4');
            const p = content.querySelector('p');
            const titleText = h4 ? h4.textContent || '' : '';
            const description = p ? p.textContent || '' : '';

            const timeMatch = titleText.match(/(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
            if (!timeMatch) return;

            const [, startHour, startMinute, endHour, endMinute] = timeMatch.map(Number);
            const eventTitle = titleText.replace(/(\d{2}:\d{2}–\d{2}:\d{2}\s—\s)/, '').trim();
            const location = 'Sheraton Grand Doha Resort & Convention Hotel, Qatar';

            const dayTab = card.closest('.agenda-content');
            const dateStr = dayTab?.id === 'day-1' ? '2026-04-19' : '2026-04-20';
            
            const dateParts = dateStr.split('-').map(Number);
            // Qatar is UTC+3, so we subtract 3 hours to get the UTC time for the calendar event.
            const startDateTime = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], startHour - 3, startMinute));
            const endDateTime = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], endHour - 3, endMinute));

            const eventDetails = {
                title: eventTitle,
                description: description,
                location: location,
                start: startDateTime,
                end: endDateTime,
            };

            let url = '';
            if (type === 'google') {
                const startTimeFormatted = formatTime(eventDetails.start, 'google');
                const endTimeFormatted = formatTime(eventDetails.end, 'google');
                url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
                window.open(url, '_blank');
            } else if (type === 'outlook') {
                 url = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(eventDetails.title)}&startdt=${formatTime(eventDetails.start, 'outlook')}&enddt=${formatTime(eventDetails.end, 'outlook')}&body=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
                window.open(url, '_blank');
            } else if (type === 'ical') {
                const icsContent = createIcsContent(eventDetails);
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${eventDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            target.closest('.save-to-calendar-container')?.classList.remove('open');
        };
        
        containers.forEach(container => {
            const btn = container.querySelector('.save-cal-btn');
            const dropdownLinks = container.querySelectorAll('.cal-link');

            btn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentlyOpen = container.classList.contains('open');
                document.querySelectorAll('.save-to-calendar-container.open').forEach(openContainer => {
                    openContainer.classList.remove('open');
                });
                if (!currentlyOpen) {
                    container.classList.add('open');
                }
            });

            dropdownLinks.forEach(link => {
                link.addEventListener('click', handleCalendarClick);
            });
        });

        document.addEventListener('click', (e) => {
             if (!(e.target as HTMLElement).closest('.save-to-calendar-container')) {
                document.querySelectorAll('.save-to-calendar-container.open').forEach(openContainer => {
                    openContainer.classList.remove('open');
                });
            }
        });
    }

    // --- Floor Plan Logic ---
    function initializeFloorPlan() {
        if (!document.getElementById('floor-plan-section')) return;

        const boothsData = [
            { id: 'A1', package: 'Platinum', status: 'available' }, { id: 'A2', package: 'Platinum', status: 'sold' },
            { id: 'A3', package: 'Gold', status: 'available' }, { id: 'A4', package: 'Gold', status: 'reserved' },
            { id: 'A5', package: 'Gold', status: 'available' }, { id: 'A6', package: 'Gold', status: 'sold' },
            { id: 'B1', package: 'Silver', status: 'available' }, { id: 'B2', package: 'Silver', status: 'available' },
            { id: 'B3', package: 'Silver', status: 'reserved' }, { id: 'B4', package: 'Silver', status: 'available' },
            { id: 'B5', package: 'Silver', status: 'sold' }, { id: 'B6', package: 'Silver', status: 'available' },
            { id: 'C1', package: 'Basic', status: 'available' }, { id: 'C2', package: 'Basic', status: 'available' },
            { id: 'C3', package: 'Basic', status: 'available' }, { id: 'C4', package: 'Basic', status: 'available' },
            { id: 'C5', package: 'Basic', status: 'sold' }, { id: 'C6', package: 'Basic', status: 'sold' },
        ];

        const map = document.getElementById('floor-plan-map');
        const tooltip = document.getElementById('floor-plan-tooltip');
        const detailsModal = document.getElementById('booth-details-modal');
        const closeModalBtn = detailsModal?.querySelector('.modal-close-btn');

        let activeFilter = 'all';
        
        const packageDetails = {
            'Basic': { size: '3x3 (9 sqm)', benefits: ['Standard-row booth', 'Name on website list', '2 exhibitor passes', 'Access to networking lounge'] },
            'Silver': { size: '4x3 (12 sqm)', benefits: ['Priority row booth', 'Logo on event website', 'Name in event catalogs', '3 exhibitor passes'] },
            'Gold': { size: '6x3 (18 sqm)', benefits: ['Prime hall location', 'Logo + 50-word catalog feature', '4 passes + 1 speaking slot', '10% off add-ons'] },
            'Platinum': { size: '7x3 (21 sqm)', benefits: ['Entrance corner booth', 'Premium furniture & setup', 'Top-tier logo placement', '8 passes + 3 speaking slots', 'Access to VIP lounge'] }
        };

        const renderBooths = () => {
            if (!map) return;
            map.innerHTML = '';
            boothsData.forEach(booth => {
                const boothEl = document.createElement('div');
                boothEl.className = `booth ${booth.status} ${booth.package.toLowerCase()}`;
                boothEl.textContent = booth.id;
                boothEl.dataset.id = booth.id;

                if (activeFilter !== 'all' && booth.package.toLowerCase() !== activeFilter) {
                    boothEl.classList.add('hidden');
                }

                boothEl.addEventListener('mousemove', (e) => showTooltip(e, booth));
                boothEl.addEventListener('mouseleave', hideTooltip);
                boothEl.addEventListener('click', () => {
                    if (booth.status !== 'sold') {
                        showDetailsModal(booth);
                    }
                });

                map.appendChild(boothEl);
            });
        };

        const updateCounts = () => {
            document.getElementById('available-count')!.textContent = boothsData.filter(b => b.status === 'available').length.toString();
            document.getElementById('reserved-count')!.textContent = boothsData.filter(b => b.status === 'reserved').length.toString();
            document.getElementById('sold-count')!.textContent = boothsData.filter(b => b.status === 'sold').length.toString();
        };

        const showTooltip = (e: MouseEvent, booth: any) => {
            if (!tooltip) return;
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
                <strong>Booth ${booth.id}</strong>
                <p>Package: <span>${booth.package}</span></p>
                <p>Status: <span class="status-${booth.status}">${booth.status}</span></p>
            `;
            tooltip.style.left = `${e.pageX + 15}px`;
            tooltip.style.top = `${e.pageY + 15}px`;
        };

        const hideTooltip = () => {
            if (tooltip) tooltip.style.display = 'none';
        };

        const showDetailsModal = (booth: any) => {
            if (!detailsModal) return;
            const details = packageDetails[booth.package as keyof typeof packageDetails];
            
            (detailsModal.querySelector('#details-modal-title') as HTMLElement).textContent = `${booth.package} Booth`;
            (detailsModal.querySelector('#details-modal-booth-id') as HTMLElement).textContent = `ID: ${booth.id}`;
            (detailsModal.querySelector('#details-modal-size') as HTMLElement).textContent = details.size;
            
            const benefitsList = detailsModal.querySelector('#details-modal-benefits') as HTMLElement;
            benefitsList.innerHTML = details.benefits.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('');
            
            const statusEl = detailsModal.querySelector('#details-modal-status') as HTMLElement;
            statusEl.textContent = booth.status;
            statusEl.className = `status-tag ${booth.status}`;

            const enquireBtn = detailsModal.querySelector('#enquire-from-details-btn') as HTMLAnchorElement;
            enquireBtn.href = `booth-registration.html?boothId=${booth.id}&package=${booth.package}`;

            detailsModal.classList.add('visible');
        };

        const hideDetailsModal = () => {
            if (detailsModal) detailsModal.classList.remove('visible');
        };

        closeModalBtn?.addEventListener('click', hideDetailsModal);
        detailsModal?.addEventListener('click', (e) => {
            if (e.target === detailsModal) hideDetailsModal();
        });

        document.querySelectorAll('.fp-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.fp-filter-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                activeFilter = (btn as HTMLElement).dataset.filter || 'all';
                renderBooths();
            });
        });

        renderBooths();
        updateCounts();
    }


    highlightActiveNav();
    initializeMobileNav();
    initializeDropdowns();
    initializeMainCountdown();
    initializeContactForm(); // Initialize contact form
    initializeStudentRegistrationForm();
    initializeBoothRegistrationForm();
    initializeSponsorshipRegistrationForm();
    initializeSpeakerRegistrationForm();
    initializeFaqAccordion();
    initializeExitIntentModal();
    initializeEarlyBirdCountdown();
    initializeHomePartners();
    initializeSponsorPagePartners();
    initializePastPartners();
    initializeAgendaTabs();
    initializeAgendaCalendarButtons();
    initializeFloorPlan();
    });