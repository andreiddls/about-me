import { cvData } from './data.js';
import { renderChart } from './charts.jsx';

document.addEventListener('DOMContentLoaded', () => {
    renderAbout();
    renderStats();
    renderExperience();
    renderSkills();
    renderProjects();
    renderEducation();
    renderLanguages();
    initTileInteractions();
    initModal();
    initThemeToggle();
    initScrollAnimations();
    renderChart('visx-chart-root', cvData.chartData);
});

function renderAbout() {
    const about = cvData.about;
    if (!about) return;

    const nameEl = document.querySelector('#about-name');
    const subtitleEl = document.querySelector('#about-subtitle');
    const textEl = document.querySelector('#about-text');
    const linksEl = document.querySelector('#about-links');
    const avatarImg = document.querySelector('#about-avatar-img');
    const avatarPlaceholder = document.querySelector('#about-avatar-placeholder');

    if (nameEl) nameEl.textContent = about.name;

    if (subtitleEl) {
        subtitleEl.textContent = about.subtitle;
    }

    const locationEl = document.querySelector('#about-location');
    if (locationEl && about.location) {
        locationEl.textContent = `${about.locationEmoji || '📍'} ${about.location}`;
    }

    if (textEl) textEl.textContent = about.text;

    if (avatarImg) {
        avatarImg.src = about.avatar.src;
        avatarImg.alt = about.name;
    }
    if (avatarPlaceholder) {
        avatarPlaceholder.textContent = about.avatar.initials;
    }

    if (linksEl) {
        linksEl.innerHTML = `
            <a href="${escapeHtml(about.links.linkedin)}" target="_blank" rel="noopener" class="link-chip">
                <svg class="icon" viewBox="-2 -2 28 28" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
            </a>
            <a href="mailto:${escapeHtml(about.links.email.split(':')[1] || about.links.email)}" class="link-chip">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>Email</span>
            </a>
            <a href="${escapeHtml(about.links.cvPdf)}" target="_blank" rel="noopener" class="link-chip link-cv">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                <span>CV PDF</span>
            </a>
        `;
    }
}

function renderStats() {
    const stats = cvData.stats;
    if (!stats) return;

    const container = document.getElementById('stats-row');
    if (!container) return;

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim() || '#2563eb';

    container.innerHTML = stats.map((stat, index) => `
        <article class="bento-tile">
            <div class="tile-content" style="align-items: center; justify-content: center; text-align: center;">
                <div class="stat-value" data-stat-index="${index}" style="font-size: 3rem; font-weight: 800; color: ${accentColor}; line-height: 1;">${escapeHtml(String(stat.animate ? '0' : stat.value))}${escapeHtml(stat.suffix || '')}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: var(--space-3); font-weight: 500;">${escapeHtml(stat.label)}${stat.sublabel ? `<br><span style="font-size: 0.7rem; color: var(--text-tertiary);">${escapeHtml(stat.sublabel)}</span>` : ''}</div>
            </div>
        </article>
    `).join('');

    // Start count-up animations
    stats.forEach((stat, index) => {
        if (!stat.animate) return;
        const el = container.querySelector(`[data-stat-index="${index}"]`);
        if (!el) return;
        animateCountUp(el, stat.value, stat.suffix || '');
    });
}

function animateCountUp(el, target, suffix) {
    const duration = 1500;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    // Use IntersectionObserver to start only when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(tick);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(el);
}

function renderExperience() {
    const container = document.getElementById('experience-list');
    if (!container || !cvData.experience) return;

    container.innerHTML = cvData.experience.map(exp => `
        <div class="exp-item">
            <div class="exp-header">
                <span class="exp-company">${escapeHtml(exp.company)}</span>
                <span class="exp-period">${escapeHtml(exp.period)}</span>
            </div>
            <div class="exp-role">${escapeHtml(exp.role)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ''}</div>
            ${exp.description ? `<p class="exp-desc">${escapeHtml(exp.description)}</p>` : ''}
            ${exp.highlights && exp.highlights.length ? `
                <ul class="exp-highlights">
                    ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
}

function renderSkills() {
    const container = document.getElementById('skills-list');
    if (!container || !cvData.skills) return;

    const categories = [
        { key: 'design', label: 'Design Tools' },
        { key: 'systems', label: 'Systems' },
        { key: 'domains', label: 'Domains' },
        { key: 'dev', label: 'Development' }
    ];

    let html = '<div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-4);">';
    html += categories.map(cat => {
        const items = cvData.skills[cat.key];
        if (!items || !items.length) return '';
        return `
            <div class="skill-category">
                <h3 style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-2);">${escapeHtml(cat.label)}</h3>
                <div class="skill-tags" style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                    ${items.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
    html += '</div>';

    container.innerHTML = html;
}

function formatAchievementText(text) {
    const escaped = escapeHtml(text);
    const regex = /^(\d+(?:[Kk]?\+?|%|(?:\s+(?:months|core)))?)(.*)$/;
    return escaped.replace(regex, '<strong>$1</strong>$2');
}

function renderProjects() {
    const container = document.getElementById('projects-list');
    if (!container || !cvData.projects) return;

    container.innerHTML = cvData.projects.map(project => {
        const isNda = project.status === 'Under NDA';
        const hasLink = !!project.link;
        const isActive = project.status === 'Live';
        const statusClass = isNda ? 'project-status status-nda' : 'project-status';
        const lockIcon = isNda ? '<svg class="nda-lock" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>' : '';
        const arrowIcon = hasLink ? '<svg class="project-card-arrow" viewBox="0 0 24 24" fill="currentColor"><path d="M5.636 18.364l12.728-12.728M18.364 5.636H8.464M18.364 5.636v9.9"/></svg>' : '';
        const cardClasses = `project-card${hasLink ? ' has-link' : ''}${isActive ? ' active-project' : ''}`;

        const achievementsHtml = project.achievements && project.achievements.length ? `
            <ul class="project-achievements">
                ${project.achievements.map(ach => `
                    <li class="achievement-item">
                        <svg class="achievement-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span>${formatAchievementText(ach)}</span>
                    </li>
                `).join('')}
            </ul>
        ` : '';

        return `
        <div class="${cardClasses}" data-project="${escapeHtml(project.id)}" ${hasLink ? `data-link="${escapeHtml(project.link)}"` : ''}>
            ${arrowIcon}
            <div class="project-card-header">
                <span class="${statusClass}">${lockIcon}${escapeHtml(project.status)}</span>
                <span class="project-period">${escapeHtml(project.period)}</span>
            </div>
            <h4>${escapeHtml(project.name)}</h4>
            <p>${escapeHtml(project.description)}</p>
            ${achievementsHtml}
            <div class="project-tags">
                ${project.tags ? project.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('') : ''}
            </div>
        </div>`;
    }).join('');
}

function renderEducation() {
    const container = document.getElementById('education-list');
    if (!container) return;

    let html = '<div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">';

    if (cvData.education && cvData.education.length) {
        html += cvData.education.map(edu => `
            <div class="edu-item">
                <h4 style="margin-bottom: var(--space-1); font-size: 0.9rem; font-weight: 600;">${escapeHtml(edu.degree)}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(edu.school)} · ${escapeHtml(edu.period)}${edu.note ? `<br>${escapeHtml(edu.note)}` : ''}</p>
            </div>
        `).join('');
    }

    if (cvData.certifications && cvData.certifications.length) {
        if (cvData.education && cvData.education.length) {
             html += '<div style="height: 1px; background: rgba(128, 128, 128, 0.25); margin: var(--space-1) 0;"></div>';
        }
        html += '<h4 style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Certifications</h4>';
        html += '<div style="display: flex; flex-direction: column; gap: var(--space-2);">';
        html += cvData.certifications.map(cert => `
            <div class="cert-item" style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-3);">
                <span style="font-size: 0.85rem; font-weight: 500; line-height: 1.4;">${escapeHtml(cert.name)}</span>
                <span class="cert-year" style="font-size: 0.75rem; color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0; line-height: 1.4; padding-top: 2px;">${escapeHtml(cert.year)}</span>
            </div>
        `).join('');
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

function renderLanguages() {
    const container = document.getElementById('languages-list');
    if (!container || !cvData.languages) return;

    let html = '<div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-2);">';
    html += cvData.languages.map(lang => `
        <div class="lang-item" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="lang-name" style="font-weight: 500; font-size: 0.85rem;">${escapeHtml(lang.name)}</span>
            <span class="lang-level" title="${escapeHtml(lang.detail || '')}">${escapeHtml(lang.level)}</span>
        </div>
    `).join('');
    html += '</div>';

    container.innerHTML = html;
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

// Case study renderer for sc_platform.html
export function renderCaseStudy(data) {
    const container = document.getElementById('case-study-content');
    if (!container || !data) return;

    // Add location subtitle
    const locationEl = document.getElementById('cs-location');
    if (locationEl && data.about?.location) {
        locationEl.textContent = `${data.about.locationEmoji} ${data.about.location}`;
    }

    let html = '';

    // Hero section
    html += `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content">
            <div class="case-study-hero">
                <h1>${escapeHtml(data.hero.title)}</h1>
                <p>${data.hero.description}</p>
            </div>
            <div class="cs-grid-2">
                <div>
                    <h3 style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">${escapeHtml(data.beforeAfter.beforeLabel)}</h3>
                    <div class="cs-image-container">
                        <img src="${escapeHtml(data.beforeAfter.beforeImage)}" alt="Before">
                    </div>
                </div>
                <div>
                    <h3 style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">${escapeHtml(data.beforeAfter.afterLabel)}</h3>
                    <div class="cs-image-container" style="background: var(--accent-blue);">
                        <img src="${escapeHtml(data.beforeAfter.afterImage)}" alt="After">
                    </div>
                </div>
            </div>
        </div>
    </article>`;

    // Content sections
    data.sections.forEach(section => {
        html += `<div class="bento-tile-wrapper" style="margin-bottom: var(--space-4);">
            ${renderSection(section)}
        </div>`;
    });

    container.innerHTML = html;
}

function renderSection(section) {
    if (section.id === 'wireframing') return renderWireframingSection(section);
    if (section.id === 'design-system') return renderDesignSystemSection(section);
    if (section.id === 'responsive') return renderResponsiveSection(section);
    if (section.id === 'final-result') return renderFinalResultSection(section);
    return renderDefaultSection(section);
}

function renderDefaultSection(section) {
    const iconHtml = section.icon ? `<img src="${escapeHtml(section.icon)}" alt="Icon" style="width: 24px; height: 24px;">` : '';

    return `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content">
            ${iconHtml ? `<div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                ${iconHtml}
                <h2 class="cs-section-title" style="margin-bottom: 0;">${escapeHtml(section.title)}</h2>
            </div>` : `<h2 class="cs-section-title">${escapeHtml(section.title)}</h2>`}
            ${section.paragraphs.map(p => `<p class="cs-text">${p}</p>`).join('')}
            ${section.images ? section.images.map(img => renderImage(img)).join('') : ''}
        </div>
    </article>`;
}

function renderWireframingSection(section) {
    const gridImages = section.images.filter(i => i.gridPosition);
    const otherImages = section.images.filter(i => !i.gridPosition);

    return `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content">
            <h2 class="cs-section-title">${escapeHtml(section.title)}</h2>
            ${section.paragraphs.map(p => `<p class="cs-text">${p}</p>`).join('')}
            <div class="cs-grid-2" style="margin-bottom: var(--space-4);">
                ${gridImages.map(img => `
                    <div class="cs-image-container" style="margin-top: 0;">
                        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}">
                    </div>
                `).join('')}
            </div>
            ${otherImages.map(img => renderImage(img)).join('')}
        </div>
    </article>`;
}

function renderDesignSystemSection(section) {
    return `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content">
            <h2 class="cs-section-title">${escapeHtml(section.title)}</h2>
            ${section.paragraphs.map(p => `<p class="cs-text">${p}</p>`).join('')}

            <div class="cs-grid-2" style="margin-bottom: var(--space-4);">
                <div class="cs-image-container" style="margin-top: 0;">
                    <img src="${escapeHtml(section.colorPalette.src)}" alt="${escapeHtml(section.colorPalette.alt)}">
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                    ${section.paletteSamples.map(img => `
                        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" style="width: 100%; border-radius: var(--radius-sm);">
                    `).join('')}
                </div>
            </div>

            <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: var(--space-2); color: var(--text-primary);">${escapeHtml(section.gridTitle)}</h3>
            <div class="cs-image-container" style="margin-bottom: var(--space-4);">
                <img src="${escapeHtml(section.gridMain.src)}" alt="${escapeHtml(section.gridMain.alt)}">
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2);">
                ${section.gridItems.map(img => `
                    <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" style="width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                `).join('')}
            </div>
        </div>
    </article>`;
}

function renderResponsiveSection(section) {
    return `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content">
            <h2 class="cs-section-title">${escapeHtml(section.title)}</h2>
            ${section.paragraphs.map(p => `<p class="cs-text">${p}</p>`).join('')}
            <div class="cs-grid-2">
                ${section.images.map(img => `
                    <div class="cs-image-container"${img.background ? ` style="background: ${escapeHtml(img.background)};"` : ''}>
                        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}">
                    </div>
                `).join('')}
            </div>
        </div>
    </article>`;
}

function renderFinalResultSection(section) {
    return `
    <article class="bento-tile animate-on-scroll" style="margin-bottom: var(--space-4);">
        <div class="tile-content" style="background: linear-gradient(135deg, var(--bg-tile) 0%, var(--bg-inset) 100%);">
            <h2 class="cs-section-title">${escapeHtml(section.title)}</h2>
            ${section.paragraphs.map(p => `<p class="cs-text">${p}</p>`).join('')}

            <div class="cs-grid-2" style="margin-bottom: var(--space-4);">
                ${section.metrics.map(m => `
                    <div style="background: var(--bg-tile); padding: var(--space-4); border-radius: var(--radius-md); text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="font-size: 3rem; font-weight: 800; color: ${m.color === 'blue' ? 'var(--accent-blue)' : 'var(--accent-green)'}; line-height: 1;">${escapeHtml(m.value)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: var(--space-3); font-weight: 500;">${escapeHtml(m.label)}</div>
                        ${m.chartId ? `<div id="${escapeHtml(m.chartId)}" style="width: 100%; height: 250px; margin-top: var(--space-3);"></div>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="cs-image-container" style="background: transparent;">
                <img src="${escapeHtml(section.mockupImage.src)}" alt="${escapeHtml(section.mockupImage.alt)}">
            </div>
        </div>
    </article>`;
}

function renderImage(img) {
    if (!img) return '';
    const style = [];
    if (img.maxHeight) style.push(`max-height: ${escapeHtml(img.maxHeight)}`);
    if (img.marginAuto) style.push('margin: 0 auto');
    const bg = img.background ? `background: ${escapeHtml(img.background)};` : '';
    const padding = img.padding ? 'padding: var(--space-4);' : '';

    return `
    <div class="cs-image-container" style="${bg}${padding}">
        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}"${style.length ? ` style="${style.join('; ')}"` : ''}>
    </div>`;
}

// Render sidebar project info
export function renderProjectInfo(data) {
    const container = document.getElementById('project-info');
    if (!container || !data) return;

    container.innerHTML = `
        <div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${renderInfoField(data.projectInfo.role)}
            ${renderInfoField(data.projectInfo.timeline)}
            ${renderInfoField(data.projectInfo.team)}
            <div>
                <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: var(--space-2);">${escapeHtml(data.projectInfo.stack.label)}</div>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-1);">
                    ${data.projectInfo.stack.items.map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderInfoField(field) {
    if (!field) return '';
    return `
        <div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 2px;">${escapeHtml(field.label)}</div>
            <div style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(field.value)}</div>
        </div>
    `;
}

// Render key achievements sidebar
export function renderKeyAchievements(data) {
    const container = document.getElementById('key-achievements');
    if (!container || !data) return;

    container.innerHTML = `
        <div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${data.keyAchievements.map(ach => `
                <div style="display: flex; align-items: flex-start; gap: var(--space-2);">
                    <div style="color: var(--accent-green);">✓</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(ach)}</div>
                </div>
            `).join('')}
        </div>
    `;
}
