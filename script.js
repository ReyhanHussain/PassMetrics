'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Add js-loading class to prevent animations during page load
    document.documentElement.classList.add('js-loading');

    // Prevent drag and drop operations to enhance security
    document.addEventListener('dragover', (event) => event.preventDefault());
    document.addEventListener('drop', (event) => event.preventDefault());

    // Cache DOM selectors for better performance
    const elements = {
        passwordInput: document.getElementById('password'),
        toggleButton: document.querySelector('.toggle-password'),
        meterFill: document.querySelector('.meter-fill'),
        strengthText: document.querySelector('.strength-text span'),
        crackTimeValue: document.querySelector('.metric-card:first-child .metric-value'),
        crackTimeContext: document.querySelector('.metric-card:first-child .metric-context'),
        entropyValue: document.querySelector('.metric-card:nth-child(2) .metric-value'),
        requirementItems: document.querySelectorAll('.req-item'),
        feedbackText: document.querySelector('.feedback-text'),
        themeToggle: document.getElementById('theme-toggle'),
        termsLink: document.getElementById('terms-link'),
        termsModal: document.getElementById('terms-modal'),
        privacyLink: document.getElementById('privacy-link'),
        privacyModal: document.getElementById('privacy-modal'),
        cookieLink: document.getElementById('cookie-link'),
        cookieModal: document.getElementById('cookie-modal'),
        disclaimerLink: document.getElementById('disclaimer-link'),
        disclaimerModal: document.getElementById('disclaimer-modal'),
        closeModals: document.querySelectorAll('.modal-close-button'),
        animatedCards: document.querySelectorAll('.animated-card')
    };

    // Strength colors and labels for consistent reference
    const strengthColors = {
        0: '#ff4444', // Very Weak
        1: '#ff8800', // Weak
        2: '#ffbb33', // Moderate
        3: '#00C851', // Strong
        4: '#007E33'  // Very Strong
    };

    const strengthLabels = {
        0: 'Very Weak',
        1: 'Weak',
        2: 'Moderate',
        3: 'Strong',
        4: 'Very Strong'
    };

    /**
     * Utility function for consistent error logging
     * @param {string} context - The context where the error occurred
     * @param {Error} error - The error object
     * @param {boolean} isCritical - Whether this is a critical error
     */
    const logError = (context, error, isCritical = false) => {
        const method = isCritical ? console.error : console.warn;
        method(`[PassMetrics] Error ${context}:`, error);
        
        // Could be extended to include error tracking or reporting
        if (isCritical) {
            // For critical errors, we might want to show a user-friendly message
            // or take additional recovery actions
        }
    };

    /**
     * Reusable debounce function to limit function execution frequency
     * @param {Function} func - The function to debounce
     * @param {number} delay - The delay in milliseconds
     * @returns {Function} - The debounced function
     */
    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    /**
     * Throttle function to limit execution rate
     * @param {Function} func - The function to throttle
     * @param {number} limit - The time limit in milliseconds
     * @returns {Function} - The throttled function
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Safely access nested properties of an object
     * @param {Object} obj - The object to access
     * @param {string} path - The path to the property
     * @param {*} defaultValue - The default value if the property doesn't exist
     * @returns {*} - The property value or default value
     */
    const safelyAccessProperty = (obj, path, defaultValue = null) => {
        if (!obj || !path) return defaultValue;
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === undefined || result === null) return defaultValue;
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    };

    /**
     * Check if a library is loaded
     * @param {string} libraryName - The name of the global library object
     * @returns {boolean} - Whether the library is loaded
     */
    const isLibraryLoaded = (libraryName) => {
        return typeof window[libraryName] === 'function' ||
            typeof window[libraryName] === 'object' && window[libraryName] !== null;
    };

    /**
     * Safely insert an element after another element with cross-browser support
     * @param {HTMLElement} referenceNode - The element to insert after
     * @param {HTMLElement} newNode - The element to insert
     */
    const insertAfter = (referenceNode, newNode) => {
        if (!referenceNode || !newNode) return;

        try {
            referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
        } catch (error) {
            logError('inserting element', error, false);
        }
    };

    /**
     * Update theme toggle icon based on current theme
     * @param {string} theme - The current theme ('light' or 'dark')
     */
    const updateThemeIcon = (theme) => {
        try {
            if (!elements.themeToggle) return;
            
            // Show sun icon for dark theme (to switch to light) and moon for light theme (to switch to dark)
            const iconClass = theme === 'dark' ? 'sun' : 'moon';
            elements.themeToggle.innerHTML = `<i class="fas fa-${iconClass}"></i>`;
        } catch (error) {
            logError('updating theme icon', error, false);
        }
    };

    /**
     * Toggle between light and dark theme
     */
    const handleThemeToggle = () => {
        try {
            const html = document.documentElement;
            if (!html) return;

            const isDark = html.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            // Update theme
            html.setAttribute('data-theme', newTheme);

            // Save theme preference to localStorage
            localStorage.setItem('theme', newTheme);

            // Update icon
            updateThemeIcon(newTheme);
        } catch (error) {
            logError('toggling theme', error, false);
        }
    };

    /**
     * Generic function to handle modal operations
     * @param {HTMLElement} modal - The modal element
     * @param {string} action - The action to perform ('open' or 'close')
     */
    const handleModal = (modal, action) => {
        try {
            if (!modal) return;
            
            if (action === 'open') {
                modal.classList.add('show');
                document.body.classList.add('modal-open');
                modal.setAttribute('aria-hidden', 'false');
            } else if (action === 'close') {
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                modal.setAttribute('aria-hidden', 'true');
            }
        } catch (error) {
            logError(`${action}ing modal`, error, false);
        }
    };

    /**
     * Open the terms and conditions modal
     * @param {Event} e - The click event
     */
    const openTermsModal = (e) => {
        try {
            e.preventDefault();
            handleModal(elements.termsModal, 'open');
        } catch (error) {
            logError('opening terms modal', error, false);
        }
    };

    /**
     * Open the privacy policy modal
     * @param {Event} e - The click event
     */
    const openPrivacyModal = (e) => {
        try {
            e.preventDefault();
            handleModal(elements.privacyModal, 'open');
        } catch (error) {
            logError('opening privacy modal', error, false);
        }
    };

    /**
     * Close the terms and conditions modal
     */
    const closeTermsModal = () => {
        handleModal(elements.termsModal, 'close');
    };

    /**
     * Close the privacy policy modal
     */
    const closePrivacyModal = () => {
        handleModal(elements.privacyModal, 'close');
    };

    /**
     * Open the cookie policy modal
     * @param {Event} e - The event object
     */
    const openCookieModal = (e) => {
        try {
            e.preventDefault();
            handleModal(elements.cookieModal, 'open');
        } catch (error) {
            logError('opening cookie modal', error, false);
        }
    };

    /**
     * Close the cookie policy modal
     */
    const closeCookieModal = () => {
        handleModal(elements.cookieModal, 'close');
    };

    /**
     * Open the disclaimer modal
     * @param {Event} e - The event object
     */
    const openDisclaimerModal = (e) => {
        try {
            e.preventDefault();
            handleModal(elements.disclaimerModal, 'open');
        } catch (error) {
            logError('opening disclaimer modal', error, false);
        }
    };

    /**
     * Close the disclaimer modal
     */
    const closeDisclaimerModal = () => {
        handleModal(elements.disclaimerModal, 'close');
    };

    /**
     * Handle window click events for modal closing
     * @param {Event} e - The click event
     */
    const handleWindowClick = (e) => {
        try {
            if (e.target === elements.termsModal) {
                closeTermsModal();
            } else if (e.target === elements.privacyModal) {
                closePrivacyModal();
            } else if (e.target === elements.cookieModal) {
                closeCookieModal();
            } else if (e.target === elements.disclaimerModal) {
                closeDisclaimerModal();
            }
        } catch (error) {
            logError('handling window click', error, false);
        }
    };

    /**
     * Handle keyboard events for modal closing
     * @param {KeyboardEvent} e - The keyboard event
     */
    const handleKeyDown = (e) => {
        try {
            if (e.key === 'Escape') {
                if (elements.termsModal && elements.termsModal.classList.contains('show')) {
                    closeTermsModal();
                }
                if (elements.privacyModal && elements.privacyModal.classList.contains('show')) {
                    closePrivacyModal();
                }
                if (elements.cookieModal && elements.cookieModal.classList.contains('show')) {
                    closeCookieModal();
                }
                if (elements.disclaimerModal && elements.disclaimerModal.classList.contains('show')) {
                    closeDisclaimerModal();
                }
            }
        } catch (error) {
            logError('handling keyboard event', error, false);
        }
    };

    /**
     * Calculate entropy of a password
     * @param {string} password - The password to calculate entropy for
     * @returns {number} - The entropy in bits
     */
    const calculateEntropy = (password) => {
        try {
            if (!password) return 0;
            
            // Define character sets
            const charSets = {
                uppercase: /[A-Z]/,
                lowercase: /[a-z]/,
                numbers: /[0-9]/,
                symbols: /[^A-Za-z0-9]/,
                // Extended character sets for more accurate entropy calculation
                extendedSymbols: /[^A-Za-z0-9\s]/,
                unicodeSymbols: /[^\x00-\x7F]/
            };
            
            // Calculate pool size based on character usage
            let poolSize = 0;
            if (charSets.lowercase.test(password)) poolSize += 26;
            if (charSets.uppercase.test(password)) poolSize += 26;
            if (charSets.numbers.test(password)) poolSize += 10;
            if (charSets.symbols.test(password)) poolSize += 33;
            if (charSets.unicodeSymbols.test(password)) poolSize += 100; // Approximation for Unicode
            
            // If no character sets were detected (unlikely), default to lowercase
            if (poolSize === 0) poolSize = 26;
            
            // Check for common patterns that reduce entropy
            let effectiveLength = password.length;
            
            // Check for repeated characters
            const repeatedChars = password.match(/(.)\1{2,}/g);
            if (repeatedChars) {
                repeatedChars.forEach(match => {
                    // Reduce effective length for repeated characters
                    effectiveLength -= Math.floor(match.length * 0.5);
                });
            }
            
            // Check for sequential characters
            const sequentialPatterns = [
                /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
                /012|123|234|345|456|567|678|789/,
                /qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm/i
            ];
            
            sequentialPatterns.forEach(pattern => {
                const matches = password.match(new RegExp(pattern, 'g'));
                if (matches) {
                    matches.forEach(match => {
                        // Reduce effective length for sequential patterns
                        effectiveLength -= Math.floor(match.length * 0.3);
                    });
                }
            });
            
            // Ensure effective length doesn't go below 1
            effectiveLength = Math.max(1, effectiveLength);
            
            // Calculate entropy using the formula: log2(poolSize) * effectiveLength
            const entropy = Math.log2(poolSize) * effectiveLength;
            
            return Math.round(entropy);
        } catch (error) {
            logError('calculateEntropy', error);
            return 0;
        }
    };

    /**
     * Estimate time to crack a password
     * @param {string} password - The password to estimate crack time for
     * @param {number} entropy - The calculated entropy
     * @returns {number} - Estimated time to crack in seconds
     */
    const estimateCrackTime = (password, entropy) => {
        try {
            if (!password) return 0;
            
            // Base cracking speeds (guesses per second)
            const crackingSpeeds = {
                online: 10,              // Online service with rate limiting
                offline_slow: 1000,      // Slow hash, offline
                offline_fast: 1000000,   // Fast hash, offline
                offline_bcrypt: 100000,  // Bcrypt, offline
                offline_gpu: 10000000000 // GPU cluster, offline
            };
            
            // Use the standard desktop computer speed (offline_fast) as default
            const guessesPerSecond = crackingSpeeds.offline_fast;
            
            // Calculate possible combinations: 2^entropy
            // Use a safer calculation method for large entropy values
            let seconds;
            
            if (entropy > 1023) {
                // For extremely high entropy, return a very large number
                return Number.MAX_VALUE;
            } else if (entropy > 160) {
                // For high entropy, use logarithmic calculation to avoid precision issues
                const log2Seconds = entropy - Math.log2(guessesPerSecond) - 1; // -1 for average case
                seconds = Math.pow(2, Math.min(log2Seconds, 1023)); // Prevent overflow
            } else {
                // For normal entropy values, use direct calculation
                const possibleCombinations = Math.pow(2, entropy);
                seconds = possibleCombinations / (2 * guessesPerSecond); // Average case
            }
            
            return seconds;
        } catch (error) {
            logError('estimateCrackTime', error, false);
            return 0; // Safe default
        }
    };

    /**
     * Generates feedback based on password analysis
     * @param {string} password - The password to analyze
     * @param {number} score - The password strength score (0-4)
     * @param {number} entropy - The calculated entropy
     * @param {Object} reqs - The password requirements check results
     * @returns {string} - The feedback message
     */
    const generateFeedback = (password, score, entropy, reqs) => {
        try {
            if (!password) return 'Enter a password to see analysis and recommendations.';
            
            // Base feedback on score
            let feedback = '';
            
            switch (score) {
                case 0: // Very Weak
                    feedback = 'This password is extremely vulnerable. It would be cracked almost instantly.';
                    break;
                case 1: // Weak
                    feedback = 'This password is too weak for important accounts. It needs significant improvement.';
                    break;
                case 2: // Moderate
                    feedback = 'This password provides moderate protection but could be stronger.';
                    break;
                case 3: // Strong
                    feedback = 'This is a strong password that provides good protection for most purposes.';
                    break;
                case 4: // Very Strong
                    feedback = 'Excellent! This password provides very strong protection.';
                    break;
                default:
                    feedback = 'Password strength could not be determined.';
            }
            
            // Add specific recommendations based on requirements
            const recommendations = [];
            
            if (!reqs.length.valid) {
                recommendations.push('Use at least 12 characters');
            }
            
            if (!reqs.uppercase.valid && !reqs.lowercase.valid) {
                recommendations.push('Mix uppercase and lowercase letters');
            } else if (!reqs.uppercase.valid) {
                recommendations.push('Add uppercase letters');
            } else if (!reqs.lowercase.valid) {
                recommendations.push('Add lowercase letters');
            }
            
            if (!reqs.numbers.valid) {
                recommendations.push('Include numbers');
            }
            
            if (!reqs.symbols.valid) {
                recommendations.push('Add special characters (e.g., !@#$%)');
            }
            
            // Check for common patterns
            if (password.length < 10 && score < 3) {
                recommendations.push('Make your password longer');
            }
            
            if (/^[a-zA-Z]+$/.test(password)) {
                recommendations.push('Add non-alphabetic characters');
            }
            
            if (/^[0-9]+$/.test(password)) {
                recommendations.push('Use more than just numbers');
            }
            
            if (/(.)\1{2,}/.test(password)) {
                recommendations.push('Avoid repeating characters (e.g., "aaa")');
            }
            
            if (/^(qwerty|asdfgh|zxcvbn)/i.test(password)) {
                recommendations.push('Avoid keyboard patterns (e.g., "qwerty")');
            }
            
            if (/^(abc|123|321)/i.test(password)) {
                recommendations.push('Avoid sequential characters (e.g., "abc", "123")');
            }
            
            // Add recommendations to feedback if there are any
            if (recommendations.length > 0) {
                feedback += ' Recommendations: ' + recommendations.join(', ') + '.';
            }
            
            // Return sanitized feedback
            return sanitizeOutput(feedback);
        } catch (error) {
            logError('generateFeedback', error);
            return 'Error generating feedback. Please try again.';
        }
    };

    /**
     * Sanitizes output to prevent XSS attacks
     * @param {string} output - The output to sanitize
     * @returns {string} - The sanitized output
     */
    const sanitizeOutput = (output) => {
        if (!output) return '';
        
        // Create a text node to safely escape HTML
        const textNode = document.createTextNode(output);
        const div = document.createElement('div');
        div.appendChild(textNode);
        
        return div.textContent || '';
    };

    /**
     * Sanitizes user input to prevent XSS attacks
     * @param {string} input - The user input to sanitize
     * @returns {string} - The sanitized input
     */
    const sanitizeInput = (input) => {
        if (!input) return '';
        
        // Create a text node to safely escape HTML
        const textNode = document.createTextNode(input);
        const div = document.createElement('div');
        div.appendChild(textNode);
        
        return div.textContent || '';
    };

    /**
     * Updates the strength meter and related UI elements
     * @param {Object} result - The password analysis result
     */
    const updateStrength = (result) => {
        try {
            if (!result) return;
            
            const { score, entropy, crackTime, requirements } = result;
            
            // Update strength meter
            if (elements.meterFill) {
                // Calculate percentage (0-100)
                const percentage = Math.min(100, Math.max(0, (score / 4) * 100));
                
                // Update meter width with smooth transition
                elements.meterFill.style.transition = 'width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.5s ease';
                elements.meterFill.style.width = `${percentage}%`;
                
                // Update meter color
                elements.meterFill.style.backgroundColor = strengthColors[score] || '#ff4444';
                
                // Update ARIA attributes for accessibility
                elements.meterFill.setAttribute('aria-valuenow', percentage);
                
                // Remove all strength classes
                elements.meterFill.classList.remove('very-weak', 'weak', 'moderate', 'strong', 'very-strong');
                
                // Add appropriate strength class
                const strengthClass = ['very-weak', 'weak', 'moderate', 'strong', 'very-strong'][score];
                if (strengthClass) {
                    elements.meterFill.classList.add(strengthClass);
                }
            }
            
            // Update strength text
            if (elements.strengthText) {
                const strengthLabel = strengthLabels[score] || 'Not rated';
                elements.strengthText.textContent = sanitizeOutput(strengthLabel);
                
                // Remove all strength classes
                elements.strengthText.className = '';
                
                // Add appropriate strength class
                const strengthClass = ['very-weak-text', 'weak-text', 'moderate-text', 'strong-text', 'very-strong-text'][score];
                if (strengthClass) {
                    elements.strengthText.classList.add(strengthClass);
                }
            }
            
            // Update crack time
            if (elements.crackTimeValue) {
                elements.crackTimeValue.textContent = sanitizeOutput(crackTime);
                
                // Add appropriate class based on score
                elements.crackTimeValue.className = 'metric-value';
                const crackTimeClass = ['very-weak-text', 'weak-text', 'moderate-text', 'strong-text', 'very-strong-text'][score];
                if (crackTimeClass) {
                    elements.crackTimeValue.classList.add(crackTimeClass);
                }
            }
            
            // Update entropy
            if (elements.entropyValue) {
                elements.entropyValue.textContent = sanitizeOutput(`${entropy.toFixed(1)} bits`);
                
                // Add appropriate class based on entropy
                elements.entropyValue.className = 'metric-value';
                let entropyClass = 'very-weak-text';
                if (entropy >= 80) entropyClass = 'very-strong-text';
                else if (entropy >= 60) entropyClass = 'strong-text';
                else if (entropy >= 40) entropyClass = 'moderate-text';
                else if (entropy >= 20) entropyClass = 'weak-text';
                
                elements.entropyValue.classList.add(entropyClass);
            }
            
            // Update requirements UI
            updateRequirementsUI(requirements);
            
        } catch (error) {
            logError('updateStrength', error);
        }
    };

    /**
     * Updates the password suggestion based on the password strength score
     * @param {number} score - The password strength score (0-4)
     * @param {string} password - The current password
     */
    const updatePasswordSuggestion = (score, password) => {
        try {
            if (!elements.feedbackText) return;
            
            if (!password || password.length === 0) {
                elements.feedbackText.textContent = 'Enter a password to see its strength.';
                return;
            }
            
            // Get requirements for the password
            const requirements = checkRequirements(password);
            
            // Calculate entropy for the password
            const entropy = calculateEntropy(password);
            
            // Use the generateFeedback function to get consistent feedback
            const feedback = generateFeedback(password, score, entropy, requirements);
            
            elements.feedbackText.textContent = feedback;
            
        } catch (error) {
            logError('updatePasswordSuggestion', error);
        }
    };

    /**
     * Updates the requirements UI based on password analysis
     * @param {Object} requirements - The password requirements check results
     */
    const updateRequirementsUI = (requirements) => {
        try {
            if (!elements.requirementItems || !requirements) return;
            
            // Loop through each requirement item
            elements.requirementItems.forEach(item => {
                // Get the requirement type from the data attribute
                const reqType = item.getAttribute('data-requirement');
                if (!reqType || !requirements[reqType]) return;
                
                // Get the requirement result
                const reqResult = requirements[reqType];
                
                // Update the item based on the result
                if (reqResult.valid) {
                    item.classList.add('valid');
                    item.classList.remove('unmet');
                    
                    // Update the icon
                    const icon = item.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-check-circle';
                    }
                } else {
                    item.classList.remove('valid');
                    item.classList.add('unmet');
                    
                    // Update the icon
                    const icon = item.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-circle';
                    }
                }
                
                // Update the text if provided
                const textSpan = item.querySelector('span');
                if (textSpan && reqResult.text) {
                    textSpan.textContent = sanitizeOutput(reqResult.text);
                }
            });
        } catch (error) {
            logError('updateRequirementsUI', error);
        }
    };

    /**
     * Animate elements when they come into view
     */
    const animateOnScroll = () => {
        try {
            const animatedCards = elements.animatedCards || document.querySelectorAll('.animated-card:not(.card-visible)');
            
            if (!animatedCards.length) return;
            
            const triggerBottom = window.innerHeight * 0.85;
            
            animatedCards.forEach(card => {
                const cardTop = card.getBoundingClientRect().top;
                
                if (cardTop < triggerBottom) {
                    // Add small random delay for staggered effect (limit to 0.3s max for consistency)
                    const delay = Math.random() * 0.3;
                    card.style.transitionDelay = `${delay}s`;
                    card.classList.add('card-visible');
                    
                    // Remove the delay after animation completes
                    setTimeout(() => {
                        card.style.transitionDelay = '0s';
                    }, (delay + 0.6) * 1000);
                }
            });
        } catch (error) {
            logError('animateOnScroll', error, false);
            
            // Fallback: make all cards visible if animation fails
            const cards = elements.animatedCards || document.querySelectorAll('.animated-card');
            cards.forEach(card => {
                card.classList.add('card-visible');
            });
        }
    };

    /**
     * Initialize card animations with improved performance
     */
    const initCardAnimations = () => {
        try {
            // Use IntersectionObserver if available for better performance
            if ('IntersectionObserver' in window) {
                const options = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1
                };
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            
                            // Add small random delay for staggered effect
                            const delay = Math.random() * 0.3;
                            element.style.transitionDelay = `${delay}s`;
                            element.classList.add('card-visible');
                            
                            // Remove the delay after animation completes
                            setTimeout(() => {
                                element.style.transitionDelay = '0s';
                            }, (delay + 0.6) * 1000);
                            
                            // Stop observing after animation
                            observer.unobserve(element);
                        }
                    });
                }, options);
                
                // Observe all animated cards
                elements.animatedCards.forEach(card => {
                    observer.observe(card);
                });
            } else {
                // Fallback to scroll event for older browsers
                window.addEventListener('scroll', throttle(animateOnScroll, 100));
                animateOnScroll(); // Initial check
            }
        } catch (error) {
            logError('initCardAnimations', error);
            
            // Fallback: make all cards visible if animation fails
            elements.animatedCards.forEach(card => {
                card.classList.add('card-visible');
            });
        }
    };

    /**
     * Load saved theme preference
     */
    const loadThemePreference = () => {
        try {
            let savedTheme = 'light'; // Default theme
            
            try {
                // Only attempt to access localStorage if available
                if (window.localStorage) {
                    const storedTheme = localStorage.getItem('theme');
                    if (storedTheme) {
                        savedTheme = storedTheme;
                    }
                }
            } catch (storageError) {
                // Silently fail if localStorage is not available (e.g., private browsing)
                console.warn('LocalStorage not available:', storageError);
            }
            
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } catch (error) {
            logError('loading theme preference', error, false);
            // Ensure default theme is set even if there's an error
            document.documentElement.setAttribute('data-theme', 'light');
        }
    };

    /**
     * Checks if a password meets the security requirements
     * @param {string} password - The password to check
     * @returns {Object} - Object with boolean flags for each requirement
     */
    const checkRequirements = (password) => {
        if (!password || typeof password !== 'string') {
            return {
                length: false,
                uppercase: false,
                lowercase: false,
                numbers: false,
                symbols: false
            };
        }

        try {
            // Check for minimum length (12 characters)
            const hasMinLength = password.length >= 12;

            // Check for uppercase letters
            const hasUppercase = /[A-Z]/.test(password);

            // Check for lowercase letters
            const hasLowercase = /[a-z]/.test(password);

            // Check for numbers
            const hasNumbers = /[0-9]/.test(password);

            // Check for special characters
            const hasSymbols = /[^A-Za-z0-9]/.test(password);

            return {
                length: hasMinLength,
                uppercase: hasUppercase,
                lowercase: hasLowercase,
                numbers: hasNumbers,
                symbols: hasSymbols
            };
        } catch (error) {
            logError('checkRequirements', error);
            return {
                length: false,
                uppercase: false,
                lowercase: false,
                numbers: false,
                symbols: false
            };
        }
    };

    /**
     * Formats crack time in a human-readable format
     * @param {number} seconds - The crack time in seconds
     * @returns {string} - The formatted crack time
     */
    const formatCrackTime = (seconds) => {
        try {
            if (typeof seconds !== 'number' || isNaN(seconds)) {
                return sanitizeOutput('Unknown');
            }
            
            if (seconds === Infinity || seconds > 1e21) {
                return sanitizeOutput('Centuries (effectively uncrackable)');
            }
            
            if (seconds < 1) {
                return sanitizeOutput('Instantly');
            }
            
            const minute = 60;
            const hour = minute * 60;
            const day = hour * 24;
            const month = day * 30;
            const year = day * 365;
            const century = year * 100;
            
            if (seconds < minute) {
                return sanitizeOutput(`${Math.round(seconds)} seconds`);
            } else if (seconds < hour) {
                const minutes = Math.round(seconds / minute);
                return sanitizeOutput(`${minutes} minute${minutes === 1 ? '' : 's'}`);
            } else if (seconds < day) {
                const hours = Math.round(seconds / hour);
                return sanitizeOutput(`${hours} hour${hours === 1 ? '' : 's'}`);
            } else if (seconds < month) {
                const days = Math.round(seconds / day);
                return sanitizeOutput(`${days} day${days === 1 ? '' : 's'}`);
            } else if (seconds < year) {
                const months = Math.round(seconds / month);
                return sanitizeOutput(`${months} month${months === 1 ? '' : 's'}`);
            } else if (seconds < century) {
                const years = Math.round(seconds / year);
                return sanitizeOutput(`${years} year${years === 1 ? '' : 's'}`);
            } else {
                const centuries = Math.round(seconds / century);
                return sanitizeOutput(`${centuries} ${centuries === 1 ? 'century' : 'centuries'}`);
            }
        } catch (error) {
            logError('formatCrackTime', error);
            return sanitizeOutput('Unknown');
        }
    };

    /**
     * Create a fallback implementation for zxcvbn
     * @returns {Function} - Simple fallback function for password analysis
     */
    const createZxcvbnFallback = () => {
        return function(password) {
            // Very basic password scoring
            let score = 0;
            if (password.length >= 8) score += 1;
            if (password.length >= 12) score += 1;
            if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
            if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
            
            return {
                score: Math.min(score, 4),
                feedback: {
                    warning: 'Using basic password analysis.',
                    suggestions: ['Consider using a mix of character types.']
                }
            };
        };
    };

    /**
     * Handles password input events
     */
    const handlePasswordInput = debounce(() => {
        try {
            // Get password and sanitize it
            const rawPassword = elements.passwordInput.value;
            const password = sanitizeInput(rawPassword);
            
            // Clear UI if password is empty
            if (!password) {
                // Reset strength meter with smooth transition
                elements.meterFill.style.transition = 'width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.5s ease';
                elements.meterFill.style.width = '0%';
                elements.meterFill.classList.remove('very-weak', 'weak', 'moderate', 'strong', 'very-strong');
                
                // Reset strength text with smooth transition
                setTimeout(() => {
                    elements.strengthText.textContent = 'Not rated';
                    elements.strengthText.className = '';
                }, 100);
                
                // Reset crack time
                if (elements.crackTimeValue) {
                    elements.crackTimeValue.textContent = 'Not calculated';
                    elements.crackTimeValue.className = 'metric-value';
                }
                
                // Reset entropy
                if (elements.entropyValue) {
                    elements.entropyValue.textContent = '0 bits';
                }
                
                // Reset feedback
                if (elements.feedbackText) {
                    elements.feedbackText.textContent = 'Enter a password to see analysis and recommendations.';
                }
                
                // Reset requirements
                if (elements.requirementItems) {
                    elements.requirementItems.forEach(item => {
                        item.classList.remove('valid');
                        item.classList.add('unmet');
                        const icon = item.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-check-circle');
                            icon.classList.add('fa-circle');
                        }
                    });
                }
                
                return;
            }
            
            // Check if zxcvbn is loaded
            if (typeof zxcvbn !== 'function') {
                console.warn('zxcvbn library not loaded yet');
                return;
            }
            
            // Analyze password
            const zxcvbnResult = zxcvbn(password);
            
            // Calculate entropy
            const entropy = calculateEntropy(password);
            
            // Estimate crack time
            const crackTimeSeconds = estimateCrackTime(password, entropy);
            const crackTimeFormatted = formatCrackTime(crackTimeSeconds);
            
            // Check requirements
            const requirements = checkRequirements(password);
            
            // Generate feedback
            const feedback = generateFeedback(password, zxcvbnResult.score, entropy, requirements);
            
            // Update UI
            updateStrength({
                password: password,
                score: zxcvbnResult.score,
                entropy: entropy,
                crackTime: crackTimeFormatted,
                requirements: requirements
            });
            
            // Update feedback text
            if (elements.feedbackText) {
                elements.feedbackText.textContent = feedback;
            }
            
            // Update crack time context
            if (elements.crackTimeContext) {
                elements.crackTimeContext.textContent = 'Using standard desktop computer';
            }
            
        } catch (error) {
            logError('handlePasswordInput', error);
        }
    }, 300);

    /**
     * Warns users about clipboard security risks when copying passwords
     */
    const handleClipboardSecurity = () => {
        try {
            // Add event listener for copy events on the password field
            elements.passwordInput.addEventListener('copy', (event) => {
                // Show warning about clipboard security
                alert('Security Warning: Copying passwords to clipboard may expose them to other applications. Clear your clipboard after use.');
                
                // Clear clipboard after a delay for security
                setTimeout(() => {
                    navigator.clipboard.writeText('').catch(() => {
                        console.warn('Could not clear clipboard automatically. Please clear it manually.');
                    });
                }, 60000); // Clear after 60 seconds
            });
            
            // Also handle cut events
            elements.passwordInput.addEventListener('cut', (event) => {
                alert('Security Warning: Cutting passwords to clipboard may expose them to other applications. Clear your clipboard after use.');
                
                // Clear clipboard after a delay for security
                setTimeout(() => {
                    navigator.clipboard.writeText('').catch(() => {
                        console.warn('Could not clear clipboard automatically. Please clear it manually.');
                    });
                }, 60000); // Clear after 60 seconds
            });
        } catch (error) {
            logError('handleClipboardSecurity', error);
        }
    };

    /**
     * Set up all event listeners
     */
    const setupEventListeners = () => {
        // Store references to event handlers for potential cleanup
        const handlers = {
            windowClick: null,
            keyDown: null,
            passwordInput: null,
            toggleButton: null,
            themeToggle: null
        };
        
        try {
            // Password input event
            if (elements.passwordInput) {
                // Remove debug log
                
                // Focus event
                elements.passwordInput.addEventListener('focus', () => {
                    if (elements.passwordInput.parentElement) {
                        elements.passwordInput.parentElement.classList.add('focused');
                    }
                });

                // Blur event
                elements.passwordInput.addEventListener('blur', () => {
                    if (elements.passwordInput.parentElement) {
                        elements.passwordInput.parentElement.classList.remove('focused');
                    }
                });
                
                handlers.passwordInput = handlePasswordInput;
                elements.passwordInput.addEventListener('input', handlers.passwordInput);
            }
            
            // Password visibility toggle
            if (elements.toggleButton) {
                handlers.toggleButton = function(e) {
                    e.preventDefault();
                    
                    const icon = this.querySelector('i');
                    if (!icon || !elements.passwordInput) return;
                    
                    const isVisible = elements.passwordInput.type === 'text';
                    
                    // Toggle input type
                    elements.passwordInput.type = isVisible ? 'password' : 'text';
                    
                    // Toggle icon
                    icon.className = isVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
                    
                    // Toggle button class for styling
                    this.classList.toggle('toggled', !isVisible);
                    
                    // Update ARIA attributes for accessibility
                    this.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
                    this.setAttribute('aria-pressed', isVisible ? 'false' : 'true');
                };
                
                elements.toggleButton.addEventListener('click', handlers.toggleButton);
            }
            
            // Theme toggle
            if (elements.themeToggle) {
                handlers.themeToggle = handleThemeToggle;
                elements.themeToggle.addEventListener('click', handlers.themeToggle);
                
                // Add keyboard focus styles
                elements.themeToggle.addEventListener('focus', () => {
                    elements.themeToggle.classList.add('focus-visible');
                });
                
                elements.themeToggle.addEventListener('blur', () => {
                    elements.themeToggle.classList.remove('focus-visible');
                });
            }
            
            // Terms and privacy links
            if (elements.termsLink) {
                elements.termsLink.addEventListener('click', openTermsModal);
            }
            
            if (elements.privacyLink) {
                elements.privacyLink.addEventListener('click', openPrivacyModal);
            }
            
            if (elements.cookieLink) {
                elements.cookieLink.addEventListener('click', openCookieModal);
            }
            
            if (elements.disclaimerLink) {
                elements.disclaimerLink.addEventListener('click', openDisclaimerModal);
            }
            
            // Close modal buttons
            if (elements.closeModals) {
                elements.closeModals.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const modal = e.target.closest('.modal-dialog');
                        if (modal) {
                            handleModal(modal, 'close');
                        }
                    });
                });
            }
            
            // Close modals when clicking outside
            handlers.windowClick = handleWindowClick;
            window.addEventListener('click', handlers.windowClick);
            
            // Close modals with Escape key
            handlers.keyDown = handleKeyDown;
            document.addEventListener('keydown', handlers.keyDown);
            
            // Store handlers for potential cleanup
            window._eventHandlers = handlers;
            
        } catch (error) {
            logError('setupEventListeners', error);
        }
    };

    /**
     * Add cleanup function to prevent memory leaks
     */
    const cleanupEventListeners = () => {
        try {
            const handlers = window._eventHandlers;
            if (!handlers) return;
            
            if (elements.passwordInput && handlers.passwordInput) {
                elements.passwordInput.removeEventListener('input', handlers.passwordInput);
            }
            
            if (elements.toggleButton && handlers.toggleButton) {
                elements.toggleButton.removeEventListener('click', handlers.toggleButton);
            }
            
            if (elements.themeToggle && handlers.themeToggle) {
                elements.themeToggle.removeEventListener('click', handlers.themeToggle);
            }
            
            if (handlers.windowClick) {
                window.removeEventListener('click', handlers.windowClick);
            }
            
            if (handlers.keyDown) {
                document.removeEventListener('keydown', handlers.keyDown);
            }
            
            // Clear the reference
            window._eventHandlers = null;
        } catch (error) {
            logError('cleanupEventListeners', error, false);
        }
    };

    /**
     * Enable animations after page is fully loaded
     */
    const enableAnimations = () => {
        try {
            // Use requestIdleCallback or setTimeout as fallback
            const enableFn = () => {
                // Remove loading class to enable animations
                document.documentElement.classList.remove('js-loading');
                
                // Initialize card animations - moved here from init()
                initCardAnimations();
                
                // Trigger initial animation check for elements already in viewport
                animateOnScroll();
            };
            
            if ('requestIdleCallback' in window) {
                requestIdleCallback(enableFn);
            } else {
                setTimeout(enableFn, 200);
            }
        } catch (error) {
            logError('enabling animations', error, true);
            // Fallback: remove loading class directly
            document.documentElement.classList.remove('js-loading');
        }
    };

    /**
     * Handle loading animation based on document readiness
     */
    const handleLoadingAnimation = () => {
        try {
            // Wait for page to be fully loaded before enabling animations
            if (document.readyState === 'complete') {
                enableAnimations();
            } else {
                window.addEventListener('load', enableAnimations);
                
                // Fallback: ensure animations are enabled even if load event doesn't fire
                setTimeout(() => {
                    if (document.documentElement.classList.contains('js-loading')) {
                        logError('loading animation', new Error('Fallback timeout triggered'), false);
                        enableAnimations();
                    }
                }, 5000); // 5 second fallback
            }
        } catch (error) {
            logError('handling loading animation', error, true);
            // Fallback: remove loading class
            document.documentElement.classList.remove('js-loading');
        }
    };

    /**
     * Enhance accessibility
     */
    const enhanceAccessibility = () => {
        try {
            // Add skip to content link if not present
            if (!document.querySelector('.skip-to-content')) {
                const skipLink = document.createElement('a');
                skipLink.href = '#main-content';
                skipLink.className = 'skip-to-content';
                skipLink.textContent = 'Skip to content';
                
                document.body.insertBefore(skipLink, document.body.firstChild);
            }
            
            // Ensure all interactive elements have appropriate ARIA attributes
            if (elements.toggleButton) {
                elements.toggleButton.setAttribute('aria-label', 'Show password');
                elements.toggleButton.setAttribute('aria-pressed', 'false');
            }
            
            // Add proper roles to modals
            if (elements.termsModal) {
                elements.termsModal.setAttribute('role', 'dialog');
                elements.termsModal.setAttribute('aria-modal', 'true');
                elements.termsModal.setAttribute('aria-labelledby', 'terms-title');
                elements.termsModal.setAttribute('aria-hidden', 'true');
            }
            
            if (elements.privacyModal) {
                elements.privacyModal.setAttribute('role', 'dialog');
                elements.privacyModal.setAttribute('aria-modal', 'true');
                elements.privacyModal.setAttribute('aria-labelledby', 'privacy-title');
                elements.privacyModal.setAttribute('aria-hidden', 'true');
            }
            
            if (elements.cookieModal) {
                elements.cookieModal.setAttribute('role', 'dialog');
                elements.cookieModal.setAttribute('aria-modal', 'true');
                elements.cookieModal.setAttribute('aria-labelledby', 'cookie-modal-title');
                elements.cookieModal.setAttribute('aria-hidden', 'true');
            }
            
            if (elements.disclaimerModal) {
                elements.disclaimerModal.setAttribute('role', 'dialog');
                elements.disclaimerModal.setAttribute('aria-modal', 'true');
                elements.disclaimerModal.setAttribute('aria-labelledby', 'disclaimer-modal-title');
                elements.disclaimerModal.setAttribute('aria-hidden', 'true');
            }
        } catch (error) {
            logError('enhancing accessibility', error, false);
        }
    };

    /**
     * Display security notice about client-side processing
     */
    const displaySecurityNotice = () => {
        try {
            const securityNotice = document.querySelector('.security-notice');
            if (securityNotice) {
                // Highlight the security notice briefly
                securityNotice.classList.add('highlight');
                
                // Remove highlight after a few seconds
                setTimeout(() => {
                    securityNotice.classList.remove('highlight');
                }, 3000);
            }
        } catch (error) {
            logError('displaySecurityNotice', error, false);
        }
    };

    /**
     * Load zxcvbn library dynamically if not available
     * @returns {Promise} - Resolves when library is loaded
     */
    const loadZxcvbn = () => {
        return new Promise((resolve, reject) => {
            if (isLibraryLoaded('zxcvbn')) {
                resolve();
                return;
            }
            
            // Set a timeout for library loading
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout loading zxcvbn library'));
                
                // Provide fallback functionality
                if (elements.feedbackText) {
                    elements.feedbackText.textContent = 'Using simplified password analysis (enhanced analysis unavailable).';
                }
                
                // Define a simple fallback for zxcvbn
                window.zxcvbn = createZxcvbnFallback();
                
                // Continue with basic functionality
                resolve();
            }, 5000); // 5 second timeout
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js';
            script.integrity = 'sha512-TZlMGFY9xKj38t/5m2FzJ+RM/aD5alMHDe26p0mYUMoCF5G7ibfHUQILq0qQPV3wlsnCwL+TPRNK4vIWGLOkUQ==';
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            
            script.onload = () => {
                clearTimeout(timeoutId);
                resolve();
                // Trigger password analysis if there's already a password entered
                if (elements.passwordInput && elements.passwordInput.value) {
                    handlePasswordInput();
                }
            };
            
            script.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('Failed to load zxcvbn library'));
                
                // Provide fallback as above
                if (elements.feedbackText) {
                    elements.feedbackText.textContent = 'Using simplified password analysis (enhanced analysis unavailable).';
                }
                
                // Define simple fallback
                window.zxcvbn = createZxcvbnFallback();
                
                // Continue with basic functionality
                resolve();
            };
            
            document.head.appendChild(script);
        });
    };

    /**
     * Clears sensitive data when user navigates away
     */
    const clearSensitiveData = () => {
        try {
            // Clear password field
            if (elements.passwordInput) {
                elements.passwordInput.value = '';
            }
            
            // Reset UI elements
            if (elements.meterFill) {
                elements.meterFill.style.width = '0%';
                elements.meterFill.classList.remove('very-weak', 'weak', 'moderate', 'strong', 'very-strong');
            }
            
            if (elements.strengthText) {
                elements.strengthText.textContent = 'Not rated';
                elements.strengthText.className = '';
            }
            
            if (elements.feedbackText) {
                elements.feedbackText.textContent = 'Enter a password to see analysis and recommendations.';
            }
            
            if (elements.crackTimeValue) {
                elements.crackTimeValue.textContent = 'Not calculated';
            }
            
            if (elements.entropyValue) {
                elements.entropyValue.textContent = '0 bits';
            }
            
            // Reset requirement indicators
            if (elements.requirementItems) {
                elements.requirementItems.forEach(item => {
                    item.classList.remove('valid');
                    const icon = item.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-circle';
                    }
                });
            }
            
            // Clear any variables that might contain the password
            // This helps with garbage collection
            if (window.zxcvbn && typeof window.zxcvbn === 'function') {
                try {
                    // Force garbage collection of any cached passwords in zxcvbn
                    window.zxcvbn('');
                } catch (e) {
                    // Ignore errors
                }
            }
        } catch (error) {
            logError('clearSensitiveData', error);
        }
    };

    /**
     * Initialize the application
     */
    const init = async () => {
        try {
            // Load theme preference
            loadThemePreference();
            
            // Enhance accessibility
            enhanceAccessibility();
            
            // Setup event listeners
            setupEventListeners();
            
            // Setup clipboard security warnings
            handleClipboardSecurity();
            
            // Handle loading animation
            handleLoadingAnimation();
            
            // Display security notice
            displaySecurityNotice();
            
            // Load zxcvbn library
            await loadZxcvbn().catch(error => {
                logError('loading zxcvbn', error, true);
            });
            
            // Trigger initial password analysis if there's a value
            if (elements.passwordInput && elements.passwordInput.value) {
                handlePasswordInput();
            }
            
            // Add page unload cleanup
            window.addEventListener('beforeunload', () => {
                cleanupEventListeners();
                clearSensitiveData();
            });
            
            // Clear sensitive data when tab is hidden (user switches tabs)
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    clearSensitiveData();
                }
            });
        } catch (error) {
            logError('init', error, true);
        }
    };

    // Initialize the application
    init();
});