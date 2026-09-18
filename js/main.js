import { cvData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    initDynamicYears();
    initTileInteractions();
    initProjectExpands();
    initModal();
    initThemeToggle();
    initScrollAnimations();
    initTimelinePill();
});

function initDynamicYears() {
    document.querySelectorAll('.exp-years-count').forEach(el => {
        const startYear = parseInt(el.dataset.startYear, 10) || 2017;
        const years = Math.max(1, new Date().getFullYear() - startYear);
        el.textContent = `${years}+`;
    });
}

function initTileInteractions() {
    document.querySelectorAll('[data-tile="sber"]').forEach(tile => {
        tile.addEventListener('click', () => {
            if (tile.dataset.href) {
                window.location.href = tile.dataset.href;
            }
        });
    });

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.project-expand-btn')) {
                return;
            }

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

function initProjectExpands() {
    document.querySelectorAll('.project-expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrap = btn.closest('.project-nda-expand-wrap');
            if (!wrap) return;
            const isExpanded = wrap.classList.toggle('is-expanded');
            btn.setAttribute('aria-expanded', isExpanded);
            const textSpan = btn.querySelector('.expand-btn-text');
            if (textSpan) {
                textSpan.textContent = isExpanded ? 'Hide details' : 'Show details';
            }
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

function initTimelinePill() {
    const update = () => {
        const timeline = document.querySelector('.exp-timeline');
        if (!timeline) return;
        const pill = timeline.querySelector('.exp-pill');
        const firstItem = timeline.querySelector('.exp-item:first-child');
        const lastItem = timeline.querySelector('.exp-item:last-child');
        if (!pill || !firstItem || !lastItem) return;

        // Node circle: 12px, offset 0.22rem (~3.5px) from the item top; the last
        // one is lifted 5px (--exp-node-lift) so it sits inside the capsule.
        // The capsule is 18px wide, so its rounded tail needs ~half that below
        // the last node's centre for the circle to sit fully inside the gradient.
        const nodeCenter = lastItem.offsetTop + 3.5 - 5 + 6;
        const startY = Math.max(0, firstItem.offsetTop - 4);
        const endY = nodeCenter + 9 + 5;

        pill.style.top = `${startY}px`;
        pill.style.height = `${endY - startY}px`;
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    if (document.fonts?.ready) {
        document.fonts.ready.then(update);
    }
}
