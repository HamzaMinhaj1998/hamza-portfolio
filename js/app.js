// Configuration - Replace with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  publicKey: 'kWG2lXE4_Pw07P_wp', // Replace with your public key
  serviceId: 'service_vmns1l8', // Replace with your service ID
  templateId: 'template_us0zctg', // Replace with your template ID
};

// Utility functions
const utils = {
  // Debounce function for performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Validate email format
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Show notification
  showNotification: (message, type = 'info') => {
    // You can implement a toast notification system here
    console.log(`${type.toUpperCase()}: ${message}`);
  },
};

// Main application
class PortfolioApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initEmailJS();
  }

  setupEventListeners() {
    // Mobile menu toggle
    this.setupMobileMenu();

    // Smooth scrolling
    this.setupSmoothScrolling();

    // Form handling
    this.setupFormHandling();

    // Portfolio animations
    this.setupPortfolioAnimations();
  }

  setupMobileMenu() {
    const navBtn = document.querySelector('.header__nav-btn');
    const headerNav = document.querySelector('.header__nav');

    if (navBtn && headerNav) {
      navBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerNav.classList.toggle('active');
        navBtn.setAttribute(
          'aria-expanded',
          headerNav.classList.contains('active'),
        );
      });

      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (!headerNav.contains(e.target) && !navBtn.contains(e.target)) {
          headerNav.classList.remove('active');
          navBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && headerNav.classList.contains('active')) {
          headerNav.classList.remove('active');
          navBtn.setAttribute('aria-expanded', 'false');
          navBtn.focus();
        }
      });
    }
  }

  setupSmoothScrolling() {
    document
      .querySelectorAll('.header__item-link, .main__button')
      .forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');

          // Only handle internal links
          if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });

              // Update URL without page jump
              history.pushState(null, null, href);

              // Close mobile menu if open
              const headerNav = document.querySelector('.header__nav');
              const navBtn = document.querySelector('.header__nav-btn');
              if (headerNav && headerNav.classList.contains('active')) {
                headerNav.classList.remove('active');
                navBtn.setAttribute('aria-expanded', 'false');
              }
            }
          }
        });
      });
  }

  initEmailJS() {
    try {
      if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS initialized successfully');
      } else {
        console.warn('EmailJS SDK not loaded');
      }
    } catch (error) {
      console.error('Error initializing EmailJS:', error);
    }
  }

  setupFormHandling() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!this.validateForm(form)) {
        return;
      }

      await this.handleFormSubmit(form, status, submitBtn);
    });

    // Real-time validation
    form.addEventListener(
      'input',
      utils.debounce(() => {
        this.validateForm(form);
      }, 300),
    );
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
      if (input.type === 'email' && input.value) {
        if (!utils.validateEmail(input.value)) {
          this.showFieldError(input, 'Please enter a valid email address');
          isValid = false;
        } else {
          this.clearFieldError(input);
        }
      }

      if (input.hasAttribute('required') && !input.value.trim()) {
        this.showFieldError(input, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    field.style.borderColor = 'var(--error-color)';

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;

    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.style.borderColor = '';

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  async handleFormSubmit(form, status, submitBtn) {
    const formData = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    // Show loading state
    this.setFormLoading(true, submitBtn);
    status.textContent = 'Sending your message...';
    status.className = 'wpcf7-response-output';

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('Email service not available');
      }

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        formData,
      );

      if (response.status === 200) {
        this.showFormSuccess(
          status,
          "Message sent successfully! I'll get back to you soon.",
        );
        form.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      this.showFormError(
        status,
        'Sorry, there was an error sending your message. Please try again or contact me directly at hamzaminhaj98@gmail.com',
      );
    } finally {
      this.setFormLoading(false, submitBtn);
    }
  }

  setFormLoading(loading, submitBtn) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      submitBtn.classList.add('loading');
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
      submitBtn.classList.remove('loading');
    }
  }

  showFormSuccess(status, message) {
    status.textContent = message;
    status.className = 'wpcf7-response-output success';
    status.style.display = 'block';

    // Hide success message after 5 seconds
    setTimeout(() => {
      status.style.display = 'none';
    }, 5000);
  }

  showFormError(status, message) {
    status.textContent = message;
    status.className = 'wpcf7-response-output error';
    status.style.display = 'block';
  }

  setupPortfolioAnimations() {
    // Hero text animation
    const textBlock = document.querySelector('.main__text-block');
    if (textBlock) {
      setTimeout(() => {
        textBlock.classList.add('loaded');
      }, 300);
    }

    // Portfolio animation on scroll
    const portfolioBlock = document.querySelector('.portfolio__block');
    if (portfolioBlock) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              portfolioBlock.classList.add('loaded');
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px',
        },
      );
      observer.observe(portfolioBlock);
    }

    // Services cards animation
    const servicesCards = document.querySelector('.services__cards');
    if (servicesCards) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              servicesCards.classList.add('loaded');
              observer.disconnect();
            }
          });
        },
        { threshold: 0.3 },
      );
      observer.observe(servicesCards);
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if EmailJS SDK is loaded
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS SDK not loaded. Form submission will not work.');

    // Show warning in form status
    const status = document.getElementById('form-status');
    if (status) {
      status.textContent =
        'Form service temporarily unavailable. Please contact me directly at hamzaminhaj98@gmail.com';
      status.className = 'wpcf7-response-output error';
      status.style.display = 'block';
    }
  }

  // Initialize the app
  new PortfolioApp();

  // Add loading class to body for initial animations
  document.body.classList.add('loaded');

  // Log initialization
  console.log('Portfolio website initialized successfully');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause any intensive animations
  } else {
    // Page is visible, resume animations
  }
});

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PortfolioApp, utils };
}
