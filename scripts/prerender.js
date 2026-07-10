const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/cv-data.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');

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
  const match = String(period).match(/(\d{4})\s*[—–-]\s*(Present|\d{4})/i);
  if (!match) return '';
  const end = match[2].toLowerCase() === 'present' ? '' : match[2];
  return end ? `${match[1]}/${end}` : match[1];
}

function formatAchievementText(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /^(\d+(?:[Kk]?\+?|%|(?:\s+(?:months|core)))?)(.*)$/,
    '<strong>$1</strong>$2'
  );
}

function renderAbout() {
  const about = data.about;
  const paragraphs = about.paragraphs || (about.text ? [about.text] : []);
  const email = about.links.email.split(':')[1] || about.links.email;

  const paragraphHtml = paragraphs
    .map((p) => `                            <p class="about-text">${escapeHtml(p)}</p>`)
    .join('\n');

  return `                <article class="bento-tile tile-about" data-tile="about">
                    <div class="about-photo">
                        <img src="${escapeHtml(about.avatar.src)}" alt="${escapeHtml(about.name)}" loading="lazy"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="avatar-placeholder" style="display:none;">${escapeHtml(about.avatar.initials)}</div>
                    </div>
                    <div class="tile-content about-body">
                        <header class="about-meta">
                            <h1>${escapeHtml(about.name)}</h1>
                            <p class="subtitle"><span>${escapeHtml(about.subtitle)}</span> <span>${escapeHtml(about.locationEmoji || '📍')} ${escapeHtml(about.location)}</span></p>
                        </header>
                        <section aria-labelledby="about-title">
                            <h2 id="about-title">About</h2>
                            <div class="about-paragraphs">
${paragraphHtml}
                            </div>
                        </section>
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

    return `                        <article class="${cardClasses}" data-project="${escapeHtml(project.id)}"${linkAttr}>
                            ${arrowIcon}
                            <header class="project-card-header">
                                <span class="${statusClass}">${lockIcon}${escapeHtml(project.status)}</span>
                                <time class="project-period" datetime="${escapeHtml(periodToDatetime(project.period))}">${escapeHtml(project.period)}</time>
                            </header>
                            <h3>${escapeHtml(project.name)}</h3>
                            <p>${escapeHtml(project.description)}</p>${achievementsHtml}${tagsHtml}
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
output = replaceBlock(output, 'ABOUT', renderAbout());
output = replaceBlock(output, 'PROJECTS', renderProjects());
output = replaceBlock(output, 'EXPERIENCE', renderExperience());
output = replaceBlock(output, 'SKILLS', renderSkills());
output = replaceBlock(output, 'EDUCATION', renderEducation());
output = replaceBlock(output, 'LANGUAGES', renderLanguages());

fs.writeFileSync(path.join(root, 'index.html'), output);
console.log('Prerendered index.html from cv-data.json');