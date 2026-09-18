const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/cv-data.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');
const scData = JSON.parse(fs.readFileSync(path.join(root, 'data/sc-platform-data.json'), 'utf8'));
const scTemplate = fs.readFileSync(path.join(root, 'sc_platform.template.html'), 'utf8');

const SKILL_CATEGORIES = [
  { key: 'product', label: 'Product Design' },
  { key: 'systems', label: 'Design Systems & Prototyping' },
  { key: 'ai', label: 'AI & Development Tools' },
  { key: 'visual', label: 'Visual & No-Code' },
];

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function periodToDatetime(period) {
  const years = String(period).match(/\d{4}/g);
  if (!years) return '';
  const isPresent = /present/i.test(period);
  if (isPresent) return years[0];
  if (years.length >= 2) return `${years[0]}/${years[1]}`;
  return years[0];
}

function formatAchievementText(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /^(\d+(?:[Kk]?\+?|%|(?:\s+(?:months|core)))?)(.*)$/,
    '<strong>$1</strong>$2'
  );
}

function formatTypography(text) {
  return text
    // Non-breaking hyphens for compound adjectives
    .replace(/large-scale/g, 'large&#8209;scale')
    .replace(/SAP-based/g, 'SAP&#8209;based')
    .replace(/AI-powered/g, 'AI&#8209;powered')
    .replace(/high-fidelity/g, 'high&#8209;fidelity')
    // Non-breaking spaces for prepositions and tight brand/noun pairs
    .replace(/\bUI\/UX\s+Designer\b/g, 'UI/UX&nbsp;Designer')
    .replace(/\bwith\s+(\d+\+)/g, 'with&nbsp;$1')
    .replace(/(\d+\+)\s+years\s+of\s+experience\b/g, '$1&nbsp;years of&nbsp;experience')
    .replace(/\bacross\s+Big\s+Tech\b/g, 'across&nbsp;Big&nbsp;Tech')
    .replace(/\bat\s+an\s+AI\s+startup\b/g, 'at&nbsp;an&nbsp;AI&nbsp;startup')
    .replace(/\bwhere\s+I\s+design\b/g, 'where&nbsp;I&nbsp;design')
    .replace(/\ba\s+platform\b/g, 'a&nbsp;platform')
    .replace(/\bEastern\s+Europe's\b/g, 'Eastern&nbsp;Europe\'s')
    .replace(/\blargest\s+FinTech\b/g, 'largest&nbsp;FinTech')
    .replace(/\btwo\s+large/g, 'two&nbsp;large')
    .replace(/\bin\s+Storybook\b/g, 'in&nbsp;Storybook')
    .replace(/\bCLI\s+tools\b/g, 'CLI&nbsp;tools')
    .replace(/\bsuch\s+as\b/g, 'such&nbsp;as')
    .replace(/\bClaude\s+Code\b/g, 'Claude&nbsp;Code');
}

function renderAbout() {
  const about = data.about;
  const startYear = about.experienceStartYear || 2017;
  const currentYear = new Date().getFullYear();
  const yearsExp = Math.max(1, currentYear - startYear);
  const rawParagraphs = about.paragraphs || (about.text ? [about.text] : []);
  const email = about.links.email.split(':')[1] || about.links.email;

  const paragraphHtml = rawParagraphs
    .map((p) => {
      const replaced = p
        .replace(/\{yearsExp\}/g, yearsExp)
        .replace(/\b\d+\+\s+years of experience\b/gi, `${yearsExp}+ years of experience`);
      const escaped = escapeHtml(replaced);
      const withSpan = escaped.replace(
        new RegExp(`(${yearsExp}\\+)`, 'g'),
        `<span class="exp-years-count" data-start-year="${startYear}">$1</span>`
      );
      const withTypography = formatTypography(withSpan);
      return `                            <p class="about-text">${withTypography}</p>`;
    })
    .join('\n');

  const availability = about.availability;
  const availabilityHtml = availability
    ? `                            <ul class="about-facts" aria-label="Availability">
                                <li><strong>Work authorization:</strong> ${escapeHtml(availability.workAuthorization)}</li>
                                <li><strong>Based in:</strong> ${escapeHtml(availability.basedIn)}</li>
                            </ul>
                            <p class="about-cv-link"><a href="${escapeHtml(about.links.cvPage || 'cv.html')}">Read the full CV as a web page →</a></p>`
    : '';

  return `                <article class="bento-tile tile-about" data-tile="about">
                    <div class="tile-content about-body">
                        <header class="about-header">
                            <div class="about-avatar-wrap">
                                <img class="about-avatar" src="${escapeHtml(about.avatar.src)}" alt="${escapeHtml(about.name)}" loading="lazy"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="avatar-placeholder" style="display:none;">${escapeHtml(about.avatar.initials)}</div>
                            </div>
                            <div class="about-meta">
                                <div class="about-title-block">
                                    <h1>${escapeHtml(about.name)}</h1>
                                    <p class="subtitle"><span class="subtitle-role">${escapeHtml(about.subtitle)}</span> <span class="subtitle-loc">${escapeHtml(about.locationEmoji || '📍')} ${escapeHtml(about.location)}</span></p>
                                </div>
                                <nav class="about-links" aria-label="Contact links">
                                    <a href="${escapeHtml(about.links.linkedin)}" target="_blank" rel="noopener" class="link-chip">
                                        <svg class="icon" viewBox="-2 -2 28 28" fill="currentColor" aria-hidden="true">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                    <a href="mailto:${escapeHtml(email)}" class="link-chip">
                                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                        </svg>
                                        <span>Email</span>
                                    </a>
                                    <a href="${escapeHtml(about.links.cvPdf)}" target="_blank" rel="noopener" class="link-chip link-cv">
                                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                        </svg>
                                        <span>CV PDF</span>
                                    </a>
                                </nav>
                            </div>
                        </header>
                        <section aria-labelledby="about-title">
                            <h2 id="about-title">About</h2>
                            <div class="about-paragraphs">
${paragraphHtml}
                            </div>
${availabilityHtml}
                        </section>
                    </div>
                </article>`;
}

function renderProjects() {
  return data.projects.map((project) => {
    const isNda = project.status === 'Under NDA';
    const hasLink = !!project.link;
    const isActive = project.status === 'Live';
    const statusClass = isNda ? 'project-status status-nda' : 'project-status';
    const lockIcon = isNda
      ? '<svg class="nda-lock" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>'
      : '';
    const arrowIcon = hasLink
      ? '<svg class="project-card-arrow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.636 18.364l12.728-12.728M18.364 5.636H8.464M18.364 5.636v9.9"/></svg>'
      : '';
    const cardClasses = `project-card${hasLink ? ' has-link' : ''}${isActive ? ' active-project' : ''}`;
    const linkAttr = hasLink ? ` data-link="${escapeHtml(project.link)}"` : '';

    const achievementsHtml = project.achievements?.length
      ? `
                            <ul class="project-achievements">
${project.achievements.map((ach) => `                                <li class="achievement-item">
                                    <svg class="achievement-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    <span>${formatAchievementText(ach)}</span>
                                </li>`).join('\n')}
                            </ul>`
      : '';

    const tagsHtml = project.tags?.length
      ? `
                            <ul class="project-tags" aria-label="Project tags">
${project.tags.map((tag) => `                                <li><span class="project-tag">${escapeHtml(tag)}</span></li>`).join('\n')}
                            </ul>`
      : '';

    let contentHtml = '';
    if (isNda) {
      contentHtml = `
                            <div class="project-nda-expand-wrap">
                                <button type="button" class="project-expand-btn" aria-expanded="false" aria-label="Toggle project details">
                                    <span class="expand-btn-text">Show details</span>
                                    <svg class="expand-btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <div class="project-expand-collapsible">
${achievementsHtml}${tagsHtml}
                                </div>
                            </div>`;
    } else {
      contentHtml = `${achievementsHtml}${tagsHtml}`;
    }

    return `                        <article class="${cardClasses}" data-project="${escapeHtml(project.id)}"${linkAttr}>
                            ${arrowIcon}
                            <header class="project-card-header">
                                <span class="${statusClass}">${lockIcon}${escapeHtml(project.status)}</span>
                                <time class="project-period" datetime="${escapeHtml(periodToDatetime(project.period))}">${escapeHtml(project.period)}</time>
                            </header>
                            <h3>${hasLink ? `<a href="${escapeHtml(project.link)}">${escapeHtml(project.name)}</a>` : escapeHtml(project.name)}</h3>
                            <p>${escapeHtml(project.description)}</p>${contentHtml}
                        </article>`;
  }).join('\n');
}

function renderExperience() {
  return data.experience.map((exp) => {
    const highlightsHtml = exp.highlights?.length
      ? `
                                <ul class="exp-highlights">
${exp.highlights.map((h) => `                                    <li>${escapeHtml(h)}</li>`).join('\n')}
                                </ul>`
      : '';

    const descriptionHtml = exp.description
      ? `                                <p class="exp-desc">${escapeHtml(exp.description)}</p>`
      : '';

    const locationHtml = exp.location
      ? `                                <p class="exp-location">${escapeHtml(exp.location)}</p>`
      : '';

    return `                            <article class="exp-item">
                                <header class="exp-header">
                                    <h3 class="exp-heading">${escapeHtml(exp.role)} at ${escapeHtml(exp.company)}</h3>
                                    <time class="exp-period" datetime="${escapeHtml(periodToDatetime(exp.period))}">${escapeHtml(exp.period)}</time>
                                </header>${locationHtml}
${descriptionHtml}${highlightsHtml}
                            </article>`;
  }).join('\n');
}

function renderSkills() {
  const categoriesHtml = SKILL_CATEGORIES.map((cat) => {
    const items = data.skills[cat.key];
    if (!items?.length) return '';

    return `                            <div class="skill-category">
                                <h3 class="skill-category-title">${escapeHtml(cat.label)}</h3>
                                <ul class="skill-tags">
${items.map((skill) => `                                    <li><span class="skill-tag">${escapeHtml(skill)}</span></li>`).join('\n')}
                                </ul>
                            </div>`;
  }).join('\n');

  return `                    <div class="inner-card skills-card">
${categoriesHtml}
                    </div>`;
}

function renderEducation() {
  let html = '<div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">';

  if (data.education?.length) {
    html += data.education.map((edu) => `
                            <article class="edu-item">
                                <h3 class="edu-degree">${escapeHtml(edu.degree)}</h3>
                                <p class="edu-meta">${escapeHtml(edu.school)} · <time datetime="${escapeHtml(periodToDatetime(edu.period))}">${escapeHtml(edu.period)}</time>${edu.note ? `<br>${escapeHtml(edu.note)}` : ''}</p>
                            </article>`).join('');
  }

  if (data.certifications?.length) {
    if (data.education?.length) {
      html += '<div class="section-divider" aria-hidden="true"></div>';
    }
    html += '<h3 class="cert-heading">Certifications</h3>';
    html += '<ul class="cert-list">';
    html += data.certifications.map((cert) => `
                            <li class="cert-item">
                                <span class="cert-name">${escapeHtml(cert.name)}</span>
                                <time class="cert-year" datetime="${escapeHtml(cert.year)}">${escapeHtml(cert.year)}</time>
                            </li>`).join('');
    html += '</ul>';
  }

  html += '</div>';
  return html;
}

function renderLanguages() {
  return `<div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-2);">
${data.languages.map((lang) => `                            <article class="lang-item">
                                <span class="lang-name">${escapeHtml(lang.name)}</span>
                                <span class="lang-level"${lang.detail ? ` title="${escapeHtml(lang.detail)}"` : ''}>${escapeHtml(lang.level)}</span>
                            </article>`).join('\n')}
                        </div>`;
}

function replaceBlock(source, name, content) {
  const regex = new RegExp(`<!-- PRERENDER_${name} -->[\\s\\S]*?<!-- /PRERENDER_${name} -->`);
  return source.replace(regex, `<!-- PRERENDER_${name} -->\n${content}\n                <!-- /PRERENDER_${name} -->`);
}

let output = template;
const expStartYear = data.about.experienceStartYear || 2017;
const currentYearsExp = Math.max(1, new Date().getFullYear() - expStartYear);
output = output.replace(/\b\d+\+\s+years of experience\b/gi, `${currentYearsExp}+ years of experience`);
output = replaceBlock(output, 'ABOUT', renderAbout());
output = replaceBlock(output, 'PROJECTS', renderProjects());
output = replaceBlock(output, 'EXPERIENCE', renderExperience());
output = replaceBlock(output, 'SKILLS', renderSkills());
output = replaceBlock(output, 'EDUCATION', renderEducation());
output = replaceBlock(output, 'LANGUAGES', renderLanguages());

fs.writeFileSync(path.join(root, 'index.html'), output);
console.log('Prerendered index.html from cv-data.json');

// ── Cost Platform case study ──────────────────────────────────────────

function renderScHero() {
  const hero = scData.hero;
  return `                <div class="case-study-hero">
                    <span class="hero-eyebrow">${escapeHtml(hero.eyebrow)}</span>
                    <h1>${escapeHtml(hero.title)}</h1>
                    <p>${escapeHtml(hero.description)}</p>
                </div>`;
}

function renderStepHeaderHtml(step) {
  const metaHtml = [
    step.dateRange ? `<span class="step-date">${escapeHtml(step.dateRange)}</span>` : '',
    step.role ? `<span class="step-role">${escapeHtml(step.role)}</span>` : '',
  ].join('');

  return `                <div class="step-header">
                    <span class="step-number" aria-hidden="true">${escapeHtml(step.number)}</span>
                    <div class="step-heading">
                        ${metaHtml ? `<div class="step-meta">${metaHtml}</div>` : ''}
                        <h2 class="cs-section-title" id="step-${escapeHtml(step.id)}-title">${escapeHtml(step.title)}</h2>
                    </div>
                </div>`;
}

function renderParagraphs(paragraphs) {
  return (paragraphs || []).map((p) => `                <p class="cs-text">${p}</p>`).join('\n');
}

function renderBullets(bullets) {
  if (!bullets?.length) return '';
  return `                <ul class="cs-bullets">
${bullets.map((b) => `                    <li>${b}</li>`).join('\n')}
                </ul>`;
}

function renderScImage(img) {
  if (!img) return '';
  const style = [];
  if (img.maxHeight) style.push(`max-height: ${escapeHtml(img.maxHeight)}`);
  if (img.marginAuto) style.push('margin: 0 auto');
  const bg = img.background ? `background: ${escapeHtml(img.background)};` : '';
  const padding = img.padding ? 'padding: var(--space-4);' : '';

  return `                <div class="cs-image-container" style="${bg}${padding}">
                    <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy"${style.length ? ` style="${style.join('; ')}"` : ''}>
                </div>`;
}

function renderStepShell(step, innerHtml) {
  return `                <li>
                <article class="bento-tile step-tile animate-on-scroll" id="step-${escapeHtml(step.id)}" aria-labelledby="step-${escapeHtml(step.id)}-title" style="margin-bottom: var(--space-4);">
                    <div class="tile-content">
${renderStepHeaderHtml(step)}
${innerHtml}
                    </div>
                </article>
                </li>`;
}

function renderProblemStep(step) {
  const ba = step.beforeAfter;
  const inner = `${renderParagraphs(step.paragraphs)}
                <div class="cs-grid-2">
                    <div>
                        <h3 style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">${escapeHtml(ba.beforeLabel)}</h3>
                        <div class="cs-image-container">
                            <img src="${escapeHtml(ba.beforeImage)}" alt="${escapeHtml(ba.beforeLabel)}" loading="lazy">
                        </div>
                    </div>
                    <div>
                        <h3 style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">${escapeHtml(ba.afterLabel)}</h3>
                        <div class="cs-image-container" style="background: var(--accent-blue);">
                            <img src="${escapeHtml(ba.afterImage)}" alt="${escapeHtml(ba.afterLabel)}" loading="lazy">
                        </div>
                    </div>
                </div>`;
  return renderStepShell(step, inner);
}

function renderDefaultStep(step) {
  const inner = `${renderParagraphs(step.paragraphs)}
${renderBullets(step.bullets)}
${(step.images || []).map(renderScImage).join('\n')}`;
  return renderStepShell(step, inner);
}

function renderUxResearchStep(step) {
  const inner = `${renderParagraphs(step.paragraphs)}
${renderBullets(step.bullets)}
${renderParagraphs(step.paragraphsAfter)}
${(step.images || []).map(renderScImage).join('\n')}`;
  return renderStepShell(step, inner);
}

function renderWireframingStep(step) {
  const gridImages = step.images.filter((i) => i.gridPosition);
  const otherImages = step.images.filter((i) => !i.gridPosition);

  const inner = `${renderParagraphs(step.paragraphs)}
                <div class="cs-grid-2" style="margin-bottom: var(--space-4);">
${gridImages.map((img) => `                    <div class="cs-image-container" style="margin-top: 0;">
                        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy">
                    </div>`).join('\n')}
                </div>
${otherImages.map(renderScImage).join('\n')}`;
  return renderStepShell(step, inner);
}

function renderDesignSystemStep(step) {
  const inner = `${renderParagraphs(step.paragraphs)}
                <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: var(--space-2); color: var(--text-primary);">${escapeHtml(step.gridTitle)}</h3>
                <div class="cs-image-container" style="margin-bottom: var(--space-4);">
                    <img src="${escapeHtml(step.gridMain.src)}" alt="${escapeHtml(step.gridMain.alt)}" loading="lazy">
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2);">
${step.gridItems.map((img) => `                    <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" style="width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);" loading="lazy">`).join('\n')}
                </div>`;
  return renderStepShell(step, inner);
}

function renderResponsiveStep(step) {
  const inner = `${renderParagraphs(step.paragraphs)}
                <div class="cs-grid-2">
${step.images.map((img) => `                    <div class="cs-image-container cs-mobile-shot"${img.background ? ` style="background: ${escapeHtml(img.background)};"` : ''}>
                        <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy">
                    </div>`).join('\n')}
                </div>`;
  return renderStepShell(step, inner);
}

function renderFinalResultStep(step) {
  const inner = `${renderParagraphs(step.paragraphs)}
                <div class="cs-grid-2" style="margin-bottom: var(--space-4);">
${step.metrics.map((m) => `                    <div style="background: var(--bg-tile); padding: var(--space-4); border-radius: var(--radius-md); text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="font-size: 3rem; font-weight: 800; color: ${m.color === 'blue' ? 'var(--accent-blue)' : 'var(--accent-green)'}; line-height: 1;">${escapeHtml(m.value)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: var(--space-3); font-weight: 500;">${escapeHtml(m.label)}</div>
                        ${m.chartId ? `<div id="${escapeHtml(m.chartId)}" style="width: 100%; height: 180px; margin-top: var(--space-3);"></div>` : ''}
                    </div>`).join('\n')}
                </div>
                <img class="cs-bare-image" src="${escapeHtml(step.mockupImage.src)}" alt="${escapeHtml(step.mockupImage.alt)}" loading="lazy">`;
  return renderStepShell(step, inner).replace(
    '<div class="tile-content">',
    '<div class="tile-content" style="background: linear-gradient(135deg, var(--bg-tile) 0%, var(--bg-inset) 100%);">'
  );
}

const SC_STEP_RENDERERS = {
  problem: renderProblemStep,
  'ux-research': renderUxResearchStep,
  wireframing: renderWireframingStep,
  'design-system': renderDesignSystemStep,
  responsive: renderResponsiveStep,
  'final-result': renderFinalResultStep,
};

function renderScSteps() {
  return scData.steps
    .map((step) => (SC_STEP_RENDERERS[step.id] || renderDefaultStep)(step))
    .join('\n');
}

function renderScProjectInfoField(field) {
  if (!field) return '';
  return `                <div>
                    <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 2px;">${escapeHtml(field.label)}</div>
                    <div style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(field.value)}</div>
                </div>`;
}

function renderScProjectInfo() {
  const info = scData.projectInfo;
  return `                <div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">
${renderScProjectInfoField(info.role)}
${renderScProjectInfoField(info.timeline)}
${renderScProjectInfoField(info.team)}
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: var(--space-2);">${escapeHtml(info.stack.label)}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: var(--space-1);">
${info.stack.items.map((t) => `                            <span class="project-tag">${escapeHtml(t)}</span>`).join('\n')}
                        </div>
                    </div>
                </div>`;
}

function renderScKeyAchievements() {
  return `                <div class="inner-card" style="display: flex; flex-direction: column; gap: var(--space-3);">
${scData.keyAchievements.map((ach) => `                    <div style="display: flex; align-items: flex-start; gap: var(--space-2);">
                        <svg class="achievement-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(ach)}</div>
                    </div>`).join('\n')}
                </div>`;
}

let scOutput = scTemplate;
scOutput = replaceBlock(scOutput, 'HERO', renderScHero());
scOutput = replaceBlock(scOutput, 'STEPS', renderScSteps());
scOutput = replaceBlock(scOutput, 'PROJECT_INFO', renderScProjectInfo());
scOutput = replaceBlock(scOutput, 'KEY_ACHIEVEMENTS', renderScKeyAchievements());

fs.writeFileSync(path.join(root, 'sc_platform.html'), scOutput);
console.log('Prerendered sc_platform.html from sc-platform-data.json');
// ── Full CV page + llms.txt (both generated from data/cv-full.json) ───
// One source of truth, so the visible page, the agent-facing text file and
// the structured data can never drift apart on facts like headcount or dates.

const cv = JSON.parse(fs.readFileSync(path.join(root, 'data/cv-full.json'), 'utf8'));
const cvTemplate = fs.readFileSync(path.join(root, 'cv.template.html'), 'utf8');
const SITE = 'https://andreiddls.github.io/about-me/';

function renderCvJsonLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: new Date().toISOString().slice(0, 10),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Portfolio', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'CV', item: `${SITE}cv.html` },
      ],
    },
    mainEntity: {
      '@type': 'Person',
      name: cv.meta.name,
      jobTitle: cv.meta.title,
      description: cv.summary,
      url: `${SITE}cv.html`,
      image: `${SITE}avatar-2026.png`,
      email: `mailto:${cv.meta.email}`,
      telephone: cv.meta.phone.replace(/\s/g, ''),
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Saarbrücken',
        addressRegion: 'Saarland',
        addressCountry: 'DE',
      },
      sameAs: [cv.meta.linkedin, cv.meta.github],
      knowsLanguage: cv.languages.map((l) => ({
        '@type': 'Language',
        name: l.name,
        alternateName: l.level,
      })),
      hasOccupation: {
        '@type': 'Occupation',
        name: cv.meta.title,
        occupationLocation: { '@type': 'Country', name: 'Germany' },
        skills: cv.skills.map((s) => s.items).join(', '),
      },
      hasCredential: cv.certifications.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        dateCreated: c.year,
      })),
      alumniOf: cv.education.map((e) => ({
        '@type': 'EducationalOrganization',
        name: e.school,
      })),
      worksFor: {
        '@type': 'Organization',
        name: cv.experience[0].company,
        location: cv.experience[0].location,
      },
    },
  };

  return `    <script type="application/ld+json">
${JSON.stringify(ld, null, 2).split('\n').map((l) => `    ${l}`).join('\n')}
    </script>`;
}

function renderCvBody() {
  const m = cv.meta;

  const experienceHtml = cv.experience.map((job) => `                        <article class="cv-job">
                            <header class="cv-job-header">
                                <h3>${escapeHtml(job.role)}</h3>
                                <time class="cv-job-period" datetime="${escapeHtml(periodToDatetime(job.period))}">${escapeHtml(job.period)}</time>
                            </header>
                            <p class="cv-job-company">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
                            <ul class="cv-bullets">
${job.bullets.map((b) => `                                <li>${escapeHtml(b)}</li>`).join('\n')}
                            </ul>
                        </article>`).join('\n');

  const projectsHtml = cv.projects.map((p) => `                            <li class="cv-project">
                                <strong>${p.url ? `<a href="${escapeHtml(p.url)}">${escapeHtml(p.name)}</a>` : escapeHtml(p.name)}</strong>
                                <span>${escapeHtml(p.summary)}</span>
                            </li>`).join('\n');

  const skillsHtml = cv.skills.map((s) => `                            <div class="cv-skill-group">
                                <h3>${escapeHtml(s.group)}</h3>
                                <p>${escapeHtml(s.items)}</p>
                            </div>`).join('\n');

  const educationHtml = cv.education.map((e) => `                            <li class="cv-edu-item">
                                <span class="cv-edu-degree">${escapeHtml(e.degree)}</span>
                                <span class="cv-edu-meta">${escapeHtml(e.school)} · ${escapeHtml(e.year)}</span>
                            </li>`).join('\n');

  const certsHtml = cv.certifications.map((c) => `                            <li class="cv-edu-item">
                                <span class="cv-edu-degree">${escapeHtml(c.name)}</span>
                                <span class="cv-edu-meta">${escapeHtml(c.year)}</span>
                            </li>`).join('\n');

  const languagesHtml = cv.languages.map((l) => `                            <li class="lang-item">
                                <span class="lang-name">${escapeHtml(l.name)}</span>
                                <span class="lang-level">${escapeHtml(l.level)}</span>
                            </li>`).join('\n');

  return `            <article class="bento-tile">
                <div class="tile-content">
                    <div class="cv-topbar">
                        <nav class="cv-breadcrumb" aria-label="Breadcrumb">
                            <a href="index.html">← Portfolio</a>
                        </nav>
                        <a class="link-chip link-cv" href="${escapeHtml(m.cvPdf)}" target="_blank" rel="noopener">Download CV as PDF</a>
                    </div>
                    <header class="cv-header">
                        <h1>${escapeHtml(m.name)}</h1>
                        <p class="subtitle">${escapeHtml(m.title)} · ${escapeHtml(m.location)}</p>
                        <ul class="cv-facts">
                            <li><strong>Work authorization:</strong> ${escapeHtml(cv.availability.workAuthorization)}</li>
                            <li><strong>Based in:</strong> ${escapeHtml(cv.availability.basedIn)}</li>
                            <li><strong>Contact:</strong> <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a> · <a href="${escapeHtml(m.linkedin)}" rel="noopener">LinkedIn</a> · <a href="${escapeHtml(m.github)}" rel="noopener">GitHub</a></li>
                        </ul>
                    </header>

                    <section aria-labelledby="cv-summary-title">
                        <h2 id="cv-summary-title">Profile</h2>
                        <p class="cv-text">${escapeHtml(cv.summary)}</p>
                    </section>

                    <section aria-labelledby="cv-experience-title">
                        <h2 id="cv-experience-title">Experience</h2>
${experienceHtml}
                    </section>

                    <section aria-labelledby="cv-projects-title">
                        <h2 id="cv-projects-title">Selected Projects</h2>
                        <ul class="cv-projects">
${projectsHtml}
                        </ul>
                    </section>

                    <section aria-labelledby="cv-skills-title">
                        <h2 id="cv-skills-title">Skills &amp; Toolkit</h2>
                        <div class="cv-skills">
${skillsHtml}
                        </div>
                    </section>

                    <section aria-labelledby="cv-education-title">
                        <h2 id="cv-education-title">Education</h2>
                        <ul class="cv-edu-list">
${educationHtml}
                        </ul>
                        <h2 id="cv-certifications-title">Certifications</h2>
                        <ul class="cv-edu-list">
${certsHtml}
                        </ul>
                    </section>

                    <section aria-labelledby="cv-languages-title">
                        <h2 id="cv-languages-title">Languages</h2>
                        <ul class="cv-languages">
${languagesHtml}
                        </ul>
                    </section>
                </div>
            </article>`;
}

let cvOutput = cvTemplate;
cvOutput = replaceBlock(cvOutput, 'CV_JSONLD', renderCvJsonLd());
cvOutput = replaceBlock(cvOutput, 'CV', renderCvBody());
fs.writeFileSync(path.join(root, 'cv.html'), cvOutput);
console.log('Prerendered cv.html from cv-full.json');

function renderLlmsTxt() {
  const m = cv.meta;
  const lines = [];
  lines.push(`# ${m.name} · ${m.title}`);
  lines.push('');
  lines.push(`> Portfolio: ${m.site}`);
  lines.push(`> Full CV (HTML): ${m.site}cv.html`);
  lines.push(`> Full CV (PDF): ${m.site}${m.cvPdf}`);
  lines.push(`> Case study · CostPlatform: ${m.site}sc_platform.html`);
  lines.push(`> Location: ${m.location}`);
  lines.push(`> Work authorization: ${cv.availability.workAuthorization}`);
  lines.push(`> Email: ${m.email}`);
  lines.push(`> Phone: ${m.phone}`);
  lines.push(`> LinkedIn: ${m.linkedin}`);
  lines.push(`> GitHub: ${m.github}`);
  lines.push('');
  lines.push('## Professional Summary');
  lines.push(cv.summary);
  lines.push('');
  lines.push('## Core Competencies & Skills');
  cv.skills.forEach((s) => lines.push(`- **${s.group}:** ${s.items}.`));
  lines.push('');
  lines.push('## Work Experience');
  cv.experience.forEach((job) => {
    lines.push('');
    lines.push(`### ${job.role} · ${job.company}`);
    lines.push(`*Location: ${job.location} | Period: ${job.period}*`);
    job.bullets.forEach((b) => lines.push(`- ${b}`));
  });
  lines.push('');
  lines.push('## Key Projects & Impact');
  cv.projects.forEach((p, i) => {
    lines.push(`${i + 1}. **${p.name}:** ${p.summary}${p.url ? ` Case study: ${p.url}` : ''}`);
  });
  lines.push('');
  lines.push('## Education');
  cv.education.forEach((e) => lines.push(`- **${e.degree}**, ${e.school} (${e.year})`));
  lines.push('');
  lines.push('## Certifications');
  cv.certifications.forEach((c) => lines.push(`- **${c.name}** (${c.year})`));
  lines.push('');
  lines.push('## Languages');
  cv.languages.forEach((l) => lines.push(`- ${l.name}: ${l.level}`));
  lines.push('');
  return lines.join('\n');
}

fs.writeFileSync(path.join(root, 'public/llms.txt'), renderLlmsTxt());
console.log('Generated public/llms.txt from cv-full.json');

const SITEMAP_URLS = [
  { loc: SITE, priority: '1.0' },
  { loc: `${SITE}cv.html`, priority: '0.9' },
  { loc: `${SITE}sc_platform.html`, priority: '0.8' },
];

fs.writeFileSync(
  path.join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_URLS.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
);
console.log('Generated public/sitemap.xml');
