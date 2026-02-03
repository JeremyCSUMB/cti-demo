/**
 * Nexus Homepage - Main JavaScript
 * Vanilla JS for interactions, animations, and accessibility
 */

(function() {
    'use strict';

    // =========================================================================
    // DOM Ready
    // =========================================================================
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavigation();
        initSmoothScroll();
        initScrollEffects();
        initAnimations();
        initCounterAnimation();
        initFormHandling();
        updateCopyrightYear();
        initModal();
        initTutorialFlow();
        initCopyButtons();
        initThemeToggle();
        initQuiz();
    }

    // =========================================================================
    // Mobile Navigation
    // =========================================================================
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
        const header = document.querySelector('.header');

        if (!navToggle || !navMenu) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link or modal trigger
        const navInteractiveElements = document.querySelectorAll('.nav-link, .nav-cta, .nav-modal-trigger');
        navInteractiveElements.forEach(function(element) {
            element.addEventListener('click', function() {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Add scrolled class to header
        let lastScroll = 0;
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // =========================================================================
    // Smooth Scrolling
    // =========================================================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    // =========================================================================
    // Scroll Effects
    // =========================================================================
    function initScrollEffects() {
        // Active navigation highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function highlightNav() {
            const scrollY = window.pageYOffset;
            const headerHeight = document.querySelector('.header').offsetHeight;

            sections.forEach(function(section) {
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(highlightNav, 100), { passive: true });
    }

    // =========================================================================
    // Scroll Animations (Intersection Observer)
    // =========================================================================
    function initAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) return;

        // Elements to animate
        const animatedElements = document.querySelectorAll(
            '.section-header, .benefit-card, .use-case-card, .featured-content, .featured-preview, .tutorial-step, .resource-card'
        );

        // Add fade-in class
        animatedElements.forEach(function(el) {
            el.classList.add('fade-in');
        });

        // Create intersection observer
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // =========================================================================
    // Counter Animation
    // =========================================================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number[data-count]');

        if (!counters.length) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'), 10);

                    if (prefersReducedMotion) {
                        counter.textContent = target;
                    } else {
                        animateCounter(counter, target);
                    }

                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function animateCounter(element, target) {
        const duration = 2000; // 2 seconds
        const start = 0;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // =========================================================================
    // Form Handling
    // =========================================================================
    function initFormHandling() {
        const form = document.querySelector('.contact-form');

        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Simple form validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(function(input) {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            // Email validation
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && !isValidEmail(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('error');
            }

            if (!isValid) return;

            // Simulate form submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Simulated async submission
            setTimeout(function() {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.backgroundColor = '#10b981';
                form.reset();

                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }, 1500);
        });

        // Remove error class on input
        form.querySelectorAll('input, textarea').forEach(function(input) {
            input.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // =========================================================================
    // Copyright Year
    // =========================================================================
    function updateCopyrightYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // =========================================================================
    // Modal Functionality
    // =========================================================================
    function initModal() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        const modals = document.querySelectorAll('.modal-overlay');

        if (!modalTriggers.length || !modals.length) return;

        let lastFocusedElement = null;

        // Open modal
        modalTriggers.forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                const modal = document.getElementById(modalId);

                if (modal) {
                    lastFocusedElement = this;
                    openModal(modal);
                }
            });
        });

        // Close modal via close button or backdrop
        modals.forEach(function(modal) {
            // Close button
            const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
            closeButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    closeModal(modal);
                });
            });

            // Backdrop click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });

        function openModal(modal) {
            modal.classList.add('active');
            modal.removeAttribute('hidden');
            document.body.classList.add('modal-open');

            // Focus the modal for screen readers
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }

            // Trap focus within modal
            trapFocus(modal);
        }

        function closeModal(modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');

            // Return focus to trigger element
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }

            // Hide modal after animation
            setTimeout(function() {
                if (!modal.classList.contains('active')) {
                    modal.setAttribute('hidden', '');
                }
            }, 300);
        }

        function trapFocus(modal) {
            const focusableElements = modal.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', function(e) {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            });
        }
    }

    // =========================================================================
    // Tutorial Flow (Accordion + Progress)
    // =========================================================================
    function initTutorialFlow() {
        const steps = Array.from(document.querySelectorAll('.tutorial-step'));
        const progressFill = document.getElementById('progress-fill');
        const totalStepsEl = document.getElementById('total-steps');
        const viewingStepEl = document.getElementById('viewing-step');
        const progressBar = document.querySelector('.tutorial-progress');
        const tutorialSection = document.getElementById('tutorial');
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');

        if (!steps.length) return;

        if (totalStepsEl) {
            totalStepsEl.textContent = steps.length;
        }

        function updateProgress(activeIndex) {
            const viewIndex = typeof activeIndex === 'number' ? activeIndex : getActiveIndex();
            const progressIndex = Math.max(viewIndex + 1, 1);
            const percent = Math.round((progressIndex / steps.length) * 100);

            if (viewingStepEl && viewIndex >= 0) {
                viewingStepEl.textContent = viewIndex + 1;
            }

            if (progressFill) {
                progressFill.style.width = percent + '%';
            }

            if (progressBar) {
                progressBar.setAttribute('aria-valuenow', percent);
            }

            if (prevBtn) {
                prevBtn.disabled = getActiveIndex() === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = getActiveIndex() === steps.length - 1;
            }
        }

        function closeAllExcept(currentStep) {
            steps.forEach(function(step) {
                const header = step.querySelector('.step-header');
                const contentId = header ? header.getAttribute('aria-controls') : null;
                const content = contentId ? document.getElementById(contentId) : null;

                if (!header || !content) return;

                if (step === currentStep) {
                    header.setAttribute('aria-expanded', 'true');
                    content.removeAttribute('hidden');
                } else {
                    header.setAttribute('aria-expanded', 'false');
                    content.setAttribute('hidden', '');
                }
            });
        }

        function getActiveIndex() {
            return steps.findIndex(function(step) {
                const header = step.querySelector('.step-header');
                return header && header.getAttribute('aria-expanded') === 'true';
            });
        }

        steps.forEach(function(step, index) {
            const header = step.querySelector('.step-header');
            const contentId = header ? header.getAttribute('aria-controls') : null;
            const content = contentId ? document.getElementById(contentId) : null;

            if (header && content) {
                header.addEventListener('click', function() {
                    closeAllExcept(step);
                    updateProgress(index);
                });
            }

            if (index === 0 && header && content) {
                header.setAttribute('aria-expanded', 'true');
                content.removeAttribute('hidden');
            }
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                const activeIndex = getActiveIndex();
                if (activeIndex > 0) {
                    closeAllExcept(steps[activeIndex - 1]);
                    steps[activeIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    updateProgress(activeIndex - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const activeIndex = getActiveIndex();
                if (activeIndex < steps.length - 1) {
                    closeAllExcept(steps[activeIndex + 1]);
                    steps[activeIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    updateProgress(activeIndex + 1);
                }
            });
        }

        if (tutorialSection && progressBar) {
            const stickyObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        progressBar.classList.add('is-sticky');
                    } else {
                        progressBar.classList.remove('is-sticky');
                    }
                });
            }, { threshold: 0.1 });

            stickyObserver.observe(tutorialSection);
        }

        const stepObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const index = steps.indexOf(entry.target);
                    updateProgress(index);
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

        steps.forEach(function(step) {
            stepObserver.observe(step);
        });

        updateProgress(0);
    }

    // =========================================================================
    // Copy to Clipboard Functionality
    // =========================================================================
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');

        if (!copyButtons.length) return;

        copyButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                const copyText = this.querySelector('.copy-text');

                if (!textToCopy) return;

                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(function() {
                    // Success feedback
                    btn.classList.add('copied');
                    if (copyText) {
                        copyText.textContent = 'Copied!';
                    }

                    // Reset after delay
                    setTimeout(function() {
                        btn.classList.remove('copied');
                        if (copyText) {
                            copyText.textContent = 'Copy';
                        }
                    }, 2000);
                }).catch(function(err) {
                    console.error('Failed to copy: ', err);
                });
            });
        });
    }

    // =========================================================================
    // Theme Toggle (Light/Dark Mode)
    // =========================================================================
    function initThemeToggle() {
        var themeToggle = document.getElementById('theme-toggle');
        var themeColorMeta = document.getElementById('theme-color-meta');

        if (!themeToggle) return;

        // Theme colors for meta tag
        var lightThemeColor = '#f8f5ef';
        var darkThemeColor = '#11100f';

        // Get current theme
        function getCurrentTheme() {
            var storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                return storedTheme;
            }
            return 'dark';
        }

        // Apply theme
        function applyTheme(theme) {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', darkThemeColor);
                }
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', lightThemeColor);
                }
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }

        // Toggle theme
        function toggleTheme() {
            var currentTheme = getCurrentTheme();
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        }

        // Initialize theme on page load
        var initialTheme = getCurrentTheme();
        applyTheme(initialTheme);

        // Handle toggle click
        themeToggle.addEventListener('click', toggleTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only update if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // =========================================================================
    // Quick Check Quiz
    // =========================================================================
    function initQuiz() {
        const modal = document.getElementById('check-understanding');
        const question = document.getElementById('quiz-question');
        const options = modal ? modal.querySelectorAll('.quiz-option') : [];
        const feedback = document.getElementById('quiz-feedback');
        const resetBtn = document.getElementById('quiz-reset');
        const triggers = document.querySelectorAll('.step-quiz-trigger');

        if (!modal || !options.length) return;

        function populateQuiz(trigger) {
            if (!trigger || !question) return;
            question.textContent = trigger.getAttribute('data-question');
            options.forEach(function(option) {
                const index = option.getAttribute('data-index');
                option.textContent = trigger.getAttribute('data-option-' + index);
                option.dataset.correct = trigger.getAttribute('data-correct');
            });
        }

        function resetQuiz() {
            options.forEach(function(option) {
                option.classList.remove('correct', 'incorrect');
                option.disabled = false;
            });
            if (feedback) {
                feedback.textContent = '';
            }
        }

        options.forEach(function(option) {
            option.addEventListener('click', function() {
                const correctIndex = option.dataset.correct;
                const isRight = option.getAttribute('data-index') === correctIndex;

                option.classList.add(isRight ? 'correct' : 'incorrect');
                if (feedback) {
                    feedback.textContent = isRight
                        ? 'Correct! Small steps make changes easier to review, test, and debug.'
                        : 'Not quite. Review the step goals, then try again.';
                }
                if (isRight) {
                    options.forEach(function(btn) {
                        btn.disabled = true;
                    });
                }
            });
        });

        triggers.forEach(function(trigger) {
            trigger.addEventListener('click', function() {
                resetQuiz();
                populateQuiz(trigger);
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', resetQuiz);
        }

        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(function(btn) {
            btn.addEventListener('click', resetQuiz);
        });
    }

    // =========================================================================
    // Utility Functions
    // =========================================================================
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // =========================================================================
    // Keyboard Navigation Support
    // =========================================================================
    document.addEventListener('keydown', function(e) {
        // Add visible focus styles only when using keyboard
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

})();
