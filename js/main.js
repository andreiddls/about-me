import { cvData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    initTileInteractions();
    initModal();
    initThemeToggle();
    initScrollAnimations();
});

function initTileInteractions() {
    document.querySelectorAll('[data-tile="sber"]').forEach(tile => {
        tile.addEventListener('click', () => {
            if (tile.dataset.href) {
                window.location.href = tile.dataset.href;
            }
        });
    });

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.project;
            const link = card.dataset.link;

            if (link) {
                window.location.href = link;
                return;
            }

            const project = cvData.projects.find(p => p.id === projectId);
            if (project) {
                openProjectModal(project);
            }
        });
    });

    document.querySelectorAll('.bento-tile.tile-clickable').forEach(tile => {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        tile.addEventListener('mousemove', (e) => {
            const rect = tile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -1;
            const rotateY = (x - centerX) / centerX * 1;

            tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        tile.addEventListener('mouseleave', () => {
            tile.style.transform = '';
        });
    });
}

function initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = overlay?.querySelector('.modal-close');

    if (!overlay) return;

    const closeModal = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });
}

function openProjectModal(project) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;

    const metrics = project.metrics ? `
        <div class="modal-metrics">
            ${Object.entries(project.metrics).map(([key, value]) => `
                <div class="modal-metric">
                    <span class="modal-metric-value">${escapeHtml(String(value))}</span>
                    <span class="modal-metric-label">${formatMetricLabel(key)}</span>
                </div>
            `).join('')}
        </div>
    ` : '';

    const linkHtml = project.link ? `
        <div style="margin-top: var(--space-6); text-align: center;">
            <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener" class="btn-primary" style="display: inline-flex;">
                View Project Details
                <svg style="margin-left: var(--space-2); width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
            </a>
        </div>
    ` : '';

    body.innerHTML = `
        <h2>${escapeHtml(project.name)}</h2>
        <div style="display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4);">
            <span class="project-badge">${escapeHtml(project.company)}</span>
            <span class="project-period">${escapeHtml(project.period)}</span>
            <span class="project-status">${escapeHtml(project.status)}</span>
        </div>
        <p>${escapeHtml(project.description)}</p>
        ${project.highlights ? `
            <h3>Key Highlights</h3>
            <ul style="color: var(--text-secondary); line-height: 1.8; padding-left: var(--space-5);">
                ${project.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
        ` : ''}
        ${metrics}
        ${linkHtml}
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function formatMetricLabel(key) {
    const labels = {
        beforeNPS: 'NPS Before',
        targetNPS: 'NPS Target',
        mau: 'MAU',
        dau: 'DAU',
        feedbackMessages: 'Feedback Messages',
        pilotUsers: 'Pilot Users',
        timeline: 'Timeline'
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const sunIcon = btn?.querySelector('.sun-icon');
    const moonIcon = btn?.querySelector('.moon-icon');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(currentTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('theme-dark');
    }

    const updateIcons = (theme) => {
        if (sunIcon && moonIcon) {
            sunIcon.style.display = theme === 'theme-dark' ? 'block' : 'none';
            moonIcon.style.display = theme === 'theme-dark' ? 'none' : 'block';
        }
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('theme-dark') ||
                       (!document.documentElement.classList.contains('theme-light') && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
            localStorage.setItem('theme', 'theme-light');
        } else {
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
            localStorage.setItem('theme', 'theme-dark');
        }
        updateIcons(document.documentElement.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light');
    };

    if (btn) {
        btn.addEventListener('click', toggleTheme);
        updateIcons(document.documentElement.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light');
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    document.querySelectorAll('.bento-tile, .project-card, .exp-item, .glass-panel').forEach(el => {
        if (!el.classList.contains('animate-on-scroll')) {
            el.classList.add('animate-on-scroll');
        }
        observer.observe(el);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
