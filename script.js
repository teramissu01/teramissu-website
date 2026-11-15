/* Teramissu Pty Ltd — Grounded cloud. Practical AI.
   Lightweight, dependency-free interactions and motion. */

(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Keep the copyright year current
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Sticky navigation treatment
  const updateHeader = () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Accessible mobile navigation
  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('is-open');
    header?.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    menu?.classList.toggle('is-open', !open);
    header?.classList.toggle('menu-active', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // Intersection-based section reveals
  const revealItems = document.querySelectorAll('.reveal');
  const animatedSections = document.querySelectorAll('.process-list, .workflow');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    animatedSections.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

    revealItems.forEach((item) => revealObserver.observe(item));
    animatedSections.forEach((item) => revealObserver.observe(item));
  }

  // Restrained pointer parallax on the hero artwork
  const parallaxRoot = document.querySelector('[data-parallax-root]');
  if (parallaxRoot && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const layers = parallaxRoot.querySelectorAll('[data-parallax-layer]');
    let frame;

    parallaxRoot.addEventListener('pointermove', (event) => {
      const bounds = parallaxRoot.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layers.forEach((layer) => {
          const strength = Number(layer.dataset.parallaxLayer || 8);
          layer.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        });
      });
    });

    parallaxRoot.addEventListener('pointerleave', () => {
      layers.forEach((layer) => { layer.style.transform = ''; });
    });
  }

  // Keep active navigation context in sync with the section in view
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.toggleAttribute('aria-current', isCurrent);
        });
      });
    }, { rootMargin: '-40% 0px -50%', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Service detail dialog — turns each service card into a useful capability brief
  const serviceContent = {
    aws: {
      index: '01', title: 'AWS Foundations', interest: 'AWS Cloud',
      description: 'Secure AWS foundations in Australian regions, designed around how your organisation builds, operates and governs technology.',
      deliverables: ['Current-state architecture assessment', 'Landing zone and multi-account structure (AWS Control Tower)', 'Network, identity and security design', 'Data residency guardrails for Sydney and Melbourne regions', 'Reference architecture and delivery roadmap'],
      outcomes: ['A scalable cloud foundation', 'Data kept onshore by policy, not by habit', 'Clearer ownership and guardrails', 'Faster, repeatable environment delivery'],
      fit: 'New AWS environments, platform rebuilds and scaling teams'
    },
    migration: {
      index: '02', title: 'Migrate & Modernise', interest: 'Migration & Modernisation',
      description: 'A risk-managed path from on-premises or legacy hosting to modern AWS services, with business continuity built into the plan.',
      deliverables: ['Application and dependency discovery', 'Business case and migration wave planning', 'Target-state architecture in ap-southeast-2 / ap-southeast-4', 'Cutover, validation and modernisation plan', 'Guidance on AWS migration funding eligibility'],
      outcomes: ['Reduced legacy constraints and hardware refresh costs', 'Controlled migration risk', 'In-country disaster recovery', 'A foundation for ongoing modernisation'],
      fit: 'Data centre exits, end-of-life hardware and cloud consolidation'
    },
    devops: {
      index: '03', title: 'DevOps & Platform', interest: 'DevOps & Platform',
      description: 'Delivery platforms and operating practices that make safe software releases faster, repeatable and observable.',
      deliverables: ['CI/CD pipeline design and implementation', 'Infrastructure as Code (Terraform / AWS CDK)', 'Environment and release automation', 'Monitoring, alerting and runbooks'],
      outcomes: ['Shorter lead time for change', 'Fewer manual deployment steps', 'Consistent environments', 'Faster incident diagnosis and recovery'],
      fit: 'Teams slowed down by manual delivery or inconsistent environments'
    },
    security: {
      index: '04', title: 'Security & Compliance', interest: 'Security & Compliance',
      description: 'Practical security uplift that maps AWS controls to the Australian frameworks your board, auditors and regulators care about.',
      deliverables: ['Essential Eight maturity assessment and uplift plan', 'AWS Security Hub, GuardDuty and Config baselines', 'Privacy Act / APP data-handling review', 'Control mapping for APRA CPS 234, ISM or SOCI', 'Incident response and backup/restore testing'],
      outcomes: ['Measurable Essential Eight maturity', 'Audit-ready evidence collected automatically', 'Reduced breach and ransomware risk', 'Confidence ahead of regulator or customer reviews'],
      fit: 'Regulated industries, government suppliers and growing SaaS companies'
    },
    optimisation: {
      index: '05', title: 'FinOps & Optimisation', interest: 'FinOps & Optimisation',
      description: 'Evidence-led improvement across AWS cost, performance, reliability, security and operational effectiveness.',
      deliverables: ['Cost and usage analysis (reported in AUD)', 'Well-Architected workload review', 'Rightsizing, Savings Plans and commitment modelling', 'Tagging and cost allocation by team or cost centre', 'Prioritised optimisation backlog'],
      outcomes: ['Reduced avoidable AWS spend', 'Better workload reliability', 'Clear cost accountability', 'An actionable improvement plan'],
      fit: 'Established AWS estates with rising cost or reliability pressure'
    },
    'generative-ai': {
      index: '06', title: 'Data & Generative AI', interest: 'Data & Generative AI',
      description: 'Modern data foundations and practical AI applications, engineered with evaluation, security, observability and human oversight from the start.',
      deliverables: ['Use-case, ROI and feasibility assessment', 'Data platform and governed AI-ready datasets', 'Production application or agent on Amazon Bedrock', 'Retrieval (RAG) and system integrations', 'Evaluation, guardrails and responsible-AI operating model'],
      outcomes: ['A validated business use case', 'Secure, onshore production deployment', 'Measurable quality and performance', 'A clear path beyond the prototype'],
      fit: 'Teams moving a valuable AI idea into secure production'
    }
  };

  const serviceDialog = document.querySelector('#service-dialog');
  let selectedService = null;

  const closeServiceDialog = () => {
    if (!serviceDialog) return;
    if (typeof serviceDialog.close === 'function') serviceDialog.close();
    else serviceDialog.removeAttribute('open');
    document.body.classList.remove('menu-open');
  };

  document.querySelectorAll('[data-service]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const service = serviceContent[trigger.dataset.service];
      if (!serviceDialog || !service) return;
      selectedService = service;
      serviceDialog.querySelector('[data-dialog-index]').textContent = service.index;
      serviceDialog.querySelector('[data-dialog-title]').textContent = service.title;
      serviceDialog.querySelector('[data-dialog-description]').textContent = service.description;
      serviceDialog.querySelector('[data-dialog-fit]').textContent = service.fit;

      const fillList = (selector, items) => {
        const list = serviceDialog.querySelector(selector);
        list.replaceChildren(...items.map((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          return li;
        }));
      };
      fillList('[data-dialog-deliverables]', service.deliverables);
      fillList('[data-dialog-outcomes]', service.outcomes);

      if (typeof serviceDialog.showModal === 'function') serviceDialog.showModal();
      else serviceDialog.setAttribute('open', '');
      document.body.classList.add('menu-open');
    });
  });

  serviceDialog?.querySelector('[data-dialog-close]')?.addEventListener('click', closeServiceDialog);
  serviceDialog?.addEventListener('close', () => document.body.classList.remove('menu-open'));
  serviceDialog?.addEventListener('click', (event) => {
    if (event.target === serviceDialog) closeServiceDialog();
  });
  serviceDialog?.querySelector('[data-dialog-contact]')?.addEventListener('click', () => {
    const intent = selectedService?.interest || 'General consultation';
    closeServiceDialog();
    const interest = document.querySelector('[data-interest-select]');
    if (interest) interest.value = intent;
    document.querySelector('#contact')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    window.setTimeout(() => document.querySelector('#contact-form input[name="name"]')?.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 700);
  });

  // Carry the context of every consultation CTA into the enquiry form
  document.addEventListener('click', (event) => {
    const intentLink = event.target.closest('[data-contact-intent]');
    if (!intentLink) return;
    const interest = document.querySelector('[data-interest-select]');
    if (interest) interest.value = intentLink.dataset.contactIntent;
  });

  // AWS health snapshot calculator
  const assessment = document.querySelector('#aws-assessment');
  const assessmentResult = document.querySelector('[data-assessment-result]');
  const assessmentGroups = ['infrastructure', 'delivery', 'observability', 'cost', 'resilience', 'security'];

  const updateAssessmentProgress = () => {
    const completed = assessmentGroups.filter((name) => assessment?.querySelector(`input[name="${name}"]:checked`)).length;
    const progress = document.querySelector('[data-assessment-progress]');
    if (progress) progress.textContent = completed;
    const bar = document.querySelector('[data-assessment-bar]');
    if (bar) bar.style.width = `${(completed / assessmentGroups.length) * 100}%`;
  };

  assessment?.addEventListener('change', updateAssessmentProgress);
  assessment?.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = assessmentGroups.map((name) => assessment.querySelector(`input[name="${name}"]:checked`));
    const error = assessment.querySelector('[data-assessment-error]');
    if (answers.some((answer) => !answer)) {
      error.textContent = `Please answer all ${assessmentGroups.length} questions to calculate your snapshot.`;
      const unansweredIndex = answers.findIndex((answer) => !answer);
      assessment.querySelector(`input[name="${assessmentGroups[unansweredIndex]}"]`)?.focus();
      return;
    }

    error.textContent = '';
    const total = answers.reduce((sum, answer) => sum + Number(answer.value), 0);
    const n = assessmentGroups.length;
    const score = Math.round(((total - n) / (2 * n)) * 100);
    const result = score < 40 ? {
      label: 'Foundation stage', title: 'Strengthen the fundamentals first',
      text: 'Your environment has clear opportunities to reduce operational risk and manual effort before scaling further.',
      actions: ['Standardise your AWS account, identity and MFA foundations', 'Baseline your Essential Eight maturity and close critical gaps', 'Prioritise Infrastructure as Code, cost ownership and observability']
    } : score < 75 ? {
      label: 'Progressing stage', title: 'A solid base with targeted gaps',
      text: 'Core practices are emerging. Focused improvements can make delivery more predictable and the platform easier to operate.',
      actions: ['Close the largest automation and observability gaps', 'Test Sydney–Melbourne recovery for business-critical workloads', 'Introduce regular cost, security and architecture reviews']
    } : {
      label: 'Scaling stage', title: 'Ready to optimise at scale',
      text: 'Your foundations appear mature. The next opportunity is to systematise optimisation and enable teams with reusable platform capabilities.',
      actions: ['Measure platform outcomes and developer experience', 'Automate continuous compliance and cost controls', 'Validate architecture through regular game days and reviews']
    };

    animateValue(0, score, 1100, (v) => {
      document.querySelector('[data-score]').textContent = Math.round(v);
      document.querySelector('[data-score-ring]').style.setProperty('--score', `${v * 3.6}deg`);
    });
    document.querySelector('[data-result-label]').textContent = result.label;
    document.querySelector('[data-result-title]').textContent = result.title;
    document.querySelector('[data-result-text]').textContent = result.text;
    const actions = document.querySelector('[data-result-actions]');
    actions.replaceChildren(...result.actions.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    assessment.hidden = true;
    assessmentResult.hidden = false;
    assessmentResult.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  });

  document.querySelector('[data-assessment-reset]')?.addEventListener('click', () => {
    assessment?.reset();
    updateAssessmentProgress();
    assessmentResult.hidden = true;
    assessment.hidden = false;
    assessment.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  });

  // Validated contact workflow with a transparent, privacy-safe mail handoff
  const contactForm = document.querySelector('#contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...contactForm.querySelectorAll('input, select, textarea')];
    fields.forEach((field) => {
      if (field.checkValidity()) field.removeAttribute('aria-invalid');
      else field.setAttribute('aria-invalid', 'true');
    });
    const firstInvalid = fields.find((field) => !field.checkValidity());
    const error = contactForm.querySelector('[data-form-error]');

    if (firstInvalid) {
      error.textContent = firstInvalid.name === 'message' && firstInvalid.value.length > 0
        ? 'Please provide at least 20 characters about the outcome you need.'
        : 'Please complete all required fields before preparing the enquiry.';
      firstInvalid.focus();
      return;
    }

    error.textContent = '';
    const data = new FormData(contactForm);
    const subject = `Project enquiry — ${data.get('interest')} — ${data.get('organisation') || data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Work email: ${data.get('email')}`,
      `Organisation: ${data.get('organisation') || 'Not provided'}`,
      `Phone: ${data.get('phone') || 'Not provided'}`,
      `State / territory: ${data.get('state')}`,
      `Area of interest: ${data.get('interest')}`,
      `Preferred timeframe: ${data.get('timeframe')}`,
      `Indicative project size (AUD, ex GST): ${data.get('budget')}`,
      '',
      'What we are trying to achieve:',
      data.get('message')
    ].join('\n');

    contactForm.querySelector('[data-form-success]').hidden = false;
    window.location.href = `mailto:info@teramissu.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  contactForm?.addEventListener('input', (event) => {
    if (event.target.matches('input, select, textarea') && event.target.checkValidity()) {
      event.target.removeAttribute('aria-invalid');
    }
  });
  // ---------------------------------------------------------------------------
  // v2 motion & interactions
  // ---------------------------------------------------------------------------
  function animateValue(from, to, duration, onUpdate) {
    if (reduceMotion.matches) { onUpdate(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      onUpdate(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const onceVisible = (el, cb, threshold = 0.35) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { threshold });
    io.observe(el);
  };

  // Scroll progress bar + back-to-top button
  const progressBar = document.querySelector('[data-scroll-progress]');
  const toTop = document.querySelector('[data-to-top]');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
    toTop?.classList.toggle('is-visible', window.scrollY > 900);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Copyright year + live Melbourne clock
  const melClock = document.querySelector('[data-mel-clock]');
  const tickClock = () => {
    if (!melClock) return;
    try {
      const now = new Date();
      const time = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(now);
      const hour = Number(new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', hourCycle: 'h23' }).format(now));
      const day = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'short' }).format(now);
      const open = !['Sat', 'Sun'].includes(day) && hour >= 9 && hour < 18;
      melClock.textContent = `${time} · ${open ? 'we’re in the office' : 'we’ll reply next business day'}`;
    } catch (e) { melClock.textContent = 'AEST / AEDT'; }
  };
  tickClock();
  window.setInterval(tickClock, 30000);

  // Typewriter in the hero
  const typer = document.querySelector('[data-typer]');
  if (typer && !reduceMotion.matches) {
    let words = [];
    try { words = JSON.parse(typer.dataset.typer); } catch (e) { words = []; }
    let w = 0; let c = words[0]?.length || 0; let deleting = true;
    const tick = () => {
      const word = words[w] || '';
      if (deleting) {
        c -= 1;
        if (c <= 0) { deleting = false; w = (w + 1) % words.length; }
      } else {
        c += 1;
        if (c >= (words[w] || '').length) { deleting = true; typer.textContent = words[w]; window.setTimeout(tick, 2200); return; }
      }
      typer.textContent = (deleting ? word : words[w]).slice(0, Math.max(0, c));
      window.setTimeout(tick, deleting ? 35 : 65);
    };
    if (words.length > 1) window.setTimeout(tick, 2600);
  }

  // Constellation canvas behind the hero
  const canvas = document.querySelector('[data-hero-canvas]');
  if (canvas && !reduceMotion.matches && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let width = 0; let height = 0; let points = []; let running = true; let raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (width * height) / 16000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4, sand: Math.random() < 0.12
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        for (let j = i + 1; j < points.length; j += 1) {
          const q = points[j];
          const dx = p.x - q.x; const dy = p.y - q.y;
          const d = dx * dx + dy * dy;
          if (d < 15000) {
            ctx.strokeStyle = `rgba(70, 200, 255, ${0.12 * (1 - d / 15000)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = p.sand ? 'rgba(231, 173, 83, .75)' : 'rgba(120, 225, 255, .6)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', () => { resize(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (running) draw();
      }).observe(canvas);
    }
  }

  // Seamless marquee: duplicate the track contents once
  document.querySelectorAll('[data-marquee] .marquee-track').forEach((track) => {
    const clone = track.innerHTML;
    track.insertAdjacentHTML('beforeend', clone);
    [...track.children].slice(track.children.length / 2).forEach((el) => el.setAttribute('aria-hidden', 'true'));
  });

  // Count-up facts
  document.querySelectorAll('[data-count]').forEach((el) => {
    onceVisible(el, () => animateValue(0, Number(el.dataset.count), 1400, (v) => { el.textContent = Math.round(v); }), 0.6);
  });

  // Spotlight + gentle tilt on service cards
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const r = card.getBoundingClientRect();
        const x = event.clientX - r.left; const y = event.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        card.style.setProperty('--ry', `${((x / r.width) - 0.5) * 6}deg`);
        card.style.setProperty('--rx', `${((y / r.height) - 0.5) * -6}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Terminal "deploy" animation in the AWS section
  const terminal = document.querySelector('[data-terminal]');
  const termLines = [
    ['t-prompt', '$ terraform plan -var="region=ap-southeast-4"'],
    ['t-dim', '  Refreshing state...'],
    ['t-add', '  + aws_organizations_account.workloads'],
    ['t-add', '  + aws_controltower_control.region_deny'],
    ['t-add', '  + aws_guardduty_detector.main'],
    ['t-add', '  + aws_backup_plan.daily_onshore'],
    ['t-dim', '  Plan: 24 to add, 0 to change, 0 to destroy.'],
    ['t-prompt', '$ terraform apply -auto-approve'],
    ['t-ok', '  ✓ Regions restricted to ap-southeast-2 / ap-southeast-4'],
    ['t-ok', '  ✓ MFA enforced · logging on · backups scheduled'],
    ['t-ok', '  ✓ Apply complete. Landing zone ready in Melbourne.']
  ];
  const renderTerminal = (lines, partial) => {
    terminal.replaceChildren();
    lines.forEach(([cls, text], idx) => {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text;
      terminal.append(span);
      if (idx < lines.length - 1 || partial === undefined) terminal.append('\n');
    });
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    terminal.append(cursor);
  };
  if (terminal) {
    if (reduceMotion.matches) {
      renderTerminal(termLines);
    } else {
      const runTerminal = () => {
        let line = 0; let ch = 0; const shown = [];
        const type = () => {
          if (line >= termLines.length) { window.setTimeout(runTerminal, 5000); return; }
          const [cls, text] = termLines[line];
          if (cls === 't-prompt') {
            ch += 1;
            renderTerminal([...shown, [cls, text.slice(0, ch)]], true);
            if (ch < text.length) { window.setTimeout(type, 28); return; }
          }
          shown.push([cls, text]);
          renderTerminal(shown);
          line += 1; ch = 0;
          window.setTimeout(type, cls === 't-prompt' ? 500 : 260);
        };
        renderTerminal([]);
        type();
      };
      onceVisible(terminal, runTerminal, 0.3);
    }
  }

  // AI workflow: cycle the active step
  const workflow = document.querySelector('[data-workflow]');
  if (workflow && !reduceMotion.matches) {
    const steps = [...workflow.querySelectorAll('.workflow-step')];
    let active = steps.findIndex((s) => s.classList.contains('active'));
    onceVisible(workflow, () => {
      window.setInterval(() => {
        steps[active]?.classList.remove('active');
        active = (active + 1) % steps.length;
        steps[active]?.classList.add('active');
      }, 1800);
    }, 0.4);
  }

  // Industry tabs
  const industries = [
    { tag: 'FINANCIAL SERVICES & FINTECH', title: 'Regulator-ready from the first commit.', text: 'APRA CPS 234 and CPS 230 aligned platforms, document and fraud AI, and secure data pipelines that keep customer information in Australia.', list: ['CPS 234 / CPS 230 control mapping', 'Document & claims AI on Bedrock', 'Onshore data lakes & analytics', 'Automated audit evidence'] },
    { tag: 'HEALTH & AGED CARE', title: 'Sensitive data, handled with care.', text: 'Privacy-first platforms for health information, kept onshore, with strict access controls and clinician-friendly AI assistants.', list: ['Privacy Act & APP-aligned design', 'Onshore storage & encryption', 'Clinical note & intake assistants', 'Reliable, tested backups'] },
    { tag: 'GOVERNMENT & COUNCILS', title: 'Modern services, public-sector controls.', text: 'ISM-aligned AWS environments using IRAP-assessed services, legacy modernisation and automation that frees staff for citizen-facing work.', list: ['ISM control mapping', 'Essential Eight uplift', 'Legacy application modernisation', 'Citizen enquiry automation'] },
    { tag: 'EDUCATION', title: 'Platforms that survive enrolment day.', text: 'Scalable learning and student systems, plus AI assistants that help students and staff find answers fast — safely.', list: ['Auto-scaling for peak periods', 'Student & staff AI helpdesks', 'Identity & access consolidation', 'Cost controls for tight budgets'] },
    { tag: 'MINING, ENERGY & RESOURCES', title: 'From remote sites to real-time insight.', text: 'IoT and telemetry data platforms, predictive maintenance models and resilience planning for critical-infrastructure obligations.', list: ['Sensor & telemetry pipelines', 'Predictive maintenance ML', 'SOCI Act risk alignment', 'Edge-to-cloud architecture'] },
    { tag: 'RETAIL & E-COMMERCE', title: 'Ready for Boxing Day, every day.', text: 'Peak-ready infrastructure for EOFY, Black Friday and Boxing Day, with AI that improves search, support and forecasting.', list: ['Load-tested auto-scaling', 'AI product search & support', 'Demand forecasting', 'Spend that scales down after peak'] },
    { tag: 'AGRICULTURE & LOGISTICS', title: 'Visibility across a big country.', text: 'Supply-chain tracking, forecasting and automation for operations that stretch across regional and remote Australia.', list: ['Fleet & shipment visibility', 'Yield & demand forecasting', 'Document automation', 'Offline-tolerant designs'] },
    { tag: 'START-UPS & SAAS', title: 'Foundations that grow with you.', text: 'Production-grade AWS from first customer to Series B — with the security answers enterprise buyers will ask for.', list: ['Multi-account setup from day one', 'CI/CD & Infrastructure as Code', 'Security questionnaires made easy', 'AI features shipped to production'] }
  ];
  const tabs = document.querySelector('[data-tabs]');
  const panel = document.querySelector('.industry-panel');
  if (tabs && panel) {
    const show = (index) => {
      const data = industries[index];
      tabs.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
      panel.classList.add('is-switching');
      window.setTimeout(() => {
        panel.querySelector('[data-industry-tag]').textContent = data.tag;
        panel.querySelector('[data-industry-title]').textContent = data.title;
        panel.querySelector('[data-industry-text]').textContent = data.text;
        panel.querySelector('[data-industry-list]').replaceChildren(...data.list.map((t) => { const li = document.createElement('li'); li.textContent = t; return li; }));
        panel.classList.remove('is-switching');
      }, reduceMotion.matches ? 0 : 200);
    };
    tabs.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-tab]');
      if (btn) show(Number(btn.dataset.tab));
    });
    tabs.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      const buttons = [...tabs.querySelectorAll('button')];
      const current = buttons.findIndex((b) => b.getAttribute('aria-selected') === 'true');
      const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      show(next);
    });
  }
})();
