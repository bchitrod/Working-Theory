const content = window.portfolioContent;

const heroSummary = document.getElementById("heroSummary");
const currentResearch = document.getElementById("currentResearch");
const cmsResearch = document.getElementById("cmsResearch");
const projectGrid = document.getElementById("projectGrid");
const citationGrid = document.getElementById("citationGrid");
const tabList = document.getElementById("tabList");
const tabPanel = document.getElementById("tabPanel");
const exploreGrid = document.getElementById("exploreGrid");
const contactLinks = document.getElementById("contactLinks");
const contactNote = document.getElementById("contactNote");
const cursorRing = document.getElementById("cursorRing");
const canvas = document.getElementById("particleField");
const ctx = canvas.getContext("2d");
const scrambledTitle = document.getElementById("scrambledTitle");

heroSummary.textContent = content.heroSummary;
currentResearch.textContent = content.currentResearch;
cmsResearch.textContent = content.cmsResearch;
contactNote.textContent = content.contactNote;

function renderProjects() {
  function renderGroup(projects) {
    return projects
      .map(
        (project, index) => `
          <article class="project-card reveal">
            <div class="project-number">${String(index + 1).padStart(2, "0")}</div>
            <div class="project-body">
              <p class="card-label">Project</p>
              <h3>${project.title}</h3>
              <span class="expand-hint" aria-hidden="true">· · ·</span>
              <p class="project-desc">${project.description}</p>
              <div class="project-meta">
                ${project.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
              </div>
            </div>
            <div class="project-link">Explore</div>
          </article>
        `
      )
      .join("");
  }

  projectGrid.innerHTML = `
    <div class="project-group">
      <p class="eyebrow project-group-label">ATLAS — Current Work</p>
      ${renderGroup(content.atlasProjects)}
    </div>
    <div class="project-group">
      <p class="eyebrow project-group-label">CMS — PhD Research</p>
      ${renderGroup(content.cmsProjects)}
    </div>
  `;
}

function renderCitations() {
  citationGrid.innerHTML = content.citations
    .map(
      (item) => `
        <article class="citation-card reveal">
          <p class="card-label">Profile</p>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="citation-meta">
            <span class="chip">${item.meta}</span>
          </div>
          <a class="citation-link" href="${item.url}" target="_blank" rel="noreferrer">
            ${item.linkLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </article>
      `
    )
    .join("");
}

function renderContacts() {
  contactLinks.innerHTML = content.contacts
    .map(
      (item) => `
        <a class="contact-link" href="${item.href}" ${item.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>
          <span>${item.label}</span>
          <span>${item.value}</span>
        </a>
      `
    )
    .join("");
}

function renderTabs() {
  tabList.innerHTML = content.affiliations
    .map(
      (item, index) => `
        <button
          class="tab-button"
          id="tab-${index}"
          type="button"
          role="tab"
          aria-selected="${index === 0 ? "true" : "false"}"
          aria-controls="affiliation-panel"
          data-index="${index}"
        >
          ${item.label}
        </button>
      `
    )
    .join("");

  updateTabPanel(0);

  tabList.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.index);
      updateTabPanel(nextIndex);
      tabList.querySelectorAll(".tab-button").forEach((entry) => {
        entry.setAttribute("aria-selected", String(entry === button));
      });
    });
  });
}

function updateTabPanel(index) {
  const item = content.affiliations[index];
  tabPanel.id = "affiliation-panel";
  tabPanel.setAttribute("role", "tabpanel");
  tabPanel.setAttribute("aria-labelledby", `tab-${index}`);
  tabPanel.innerHTML = `
    <p class="card-label">${item.period}</p>
    <h3>${item.title}</h3>
    <p><strong>${item.role}</strong></p>
    <p>${item.description}</p>
    <div class="tab-meta">
      ${item.highlights.map((highlight) => `<span class="chip">${highlight}</span>`).join("")}
    </div>
  `;
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function setupCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  window.addEventListener("mousemove", (event) => {
    cursorRing.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });

  document.querySelectorAll("a, button, .chip").forEach((element) => {
    element.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
    element.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
  });
}

function setupScrambledTitle() {
  const target = scrambledTitle.dataset.text;
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let frame = 0;
  let rafId = 0;

  function update() {
    const resolved = target
      .split("")
      .map((char, index) => {
        if (char === " ") {
          return " ";
        }

        return index < frame ? target[index] : glyphs[Math.floor(Math.random() * glyphs.length)];
      })
      .join("");

    scrambledTitle.textContent = resolved;
    frame += 1 / 2.6;

    if (frame <= target.length) {
      rafId = window.requestAnimationFrame(update);
    } else {
      scrambledTitle.textContent = target;
      rafId = 0;
    }
  }

  update();
  scrambledTitle.addEventListener("mouseenter", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    frame = 0;
    update();
  });
}

function setupParticleField() {
  const motes = [];
  const chamberTracks = [];
  const staticTracks = [];
  const cursorTrails = [];
  const collisionBursts = [];
  const collisionEventCounts = new Map();
  const moteBonds = [];
  const pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    px: window.innerWidth / 2,
    py: window.innerHeight / 2,
    active: false
  };
  const moteCount = 110;
  const chamberTrackCount = 24;
  const staticTrackCount = 16;
  let frameTick = 0;
  let nextCollisionEventId = 1;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createMote(index) {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: index % 13 === 0 ? 3.2 : 0.9 + Math.random() * 1.8,
      alpha: 0.12 + Math.random() * 0.3,
      warm: index % 23 === 0,
      history: [],
      cooldown: 0
    };
  }

  function createChamberTrack(index) {
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = Math.random() * window.innerWidth;
      y = -30;
    } else if (edge === 1) {
      x = window.innerWidth + 30;
      y = Math.random() * window.innerHeight;
    } else if (edge === 2) {
      x = Math.random() * window.innerWidth;
      y = window.innerHeight + 30;
    } else {
      x = -30;
      y = Math.random() * window.innerHeight;
    }

    const angle = Math.random() * Math.PI * 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * (0.45 + Math.random() * 0.45),
      vy: Math.sin(angle) * (0.45 + Math.random() * 0.45),
      noise: Math.random() * Math.PI * 2,
      age: 0,
      ttl: 260 + Math.random() * 180,
      width: 0.8 + Math.random() * 1.15,
      hue: index % 9 === 0 ? 42 : index % 4 === 0 ? 187 : 208,
      history: []
    };
  }

  function createStaticTrack(index) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const angle = Math.random() * Math.PI * 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * (0.16 + Math.random() * 0.2),
      vy: Math.sin(angle) * (0.16 + Math.random() * 0.2),
      noise: Math.random() * Math.PI * 2,
      age: 0,
      ttl: 360 + Math.random() * 260,
      width: 0.8 + Math.random() * 0.9,
      hue: index % 5 === 0 ? 0 : 196,
      history: []
    };
  }

  function populateScene() {
    motes.length = 0;
    chamberTracks.length = 0;
    staticTracks.length = 0;
    cursorTrails.length = 0;
    collisionBursts.length = 0;
    moteBonds.length = 0;

    for (let i = 0; i < moteCount; i += 1) {
      motes.push(createMote(i));
    }

    for (let i = 0; i < chamberTrackCount; i += 1) {
      chamberTracks.push(createChamberTrack(i));
    }

    for (let i = 0; i < staticTrackCount; i += 1) {
      staticTracks.push(createStaticTrack(i));
    }
  }

  function emitCursorTrail(x, y, amount) {
    for (let i = 0; i < amount; i += 1) {
      const driftAngle = Math.atan2(pointer.y - pointer.py, pointer.x - pointer.px) || 0;
      const angle = driftAngle + (Math.random() - 0.5) * 0.9;
      const speed = 0.65 + Math.random() * 0.95;
      cursorTrails.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        ttl: 54 + Math.random() * 42,
        width: 1 + Math.random() * 0.8,
        bend: (Math.random() - 0.5) * 0.03,
        hue: [0, 186, 198][Math.floor(Math.random() * 3)],
        history: []
      });
    }
  }

  function emitCollisionBurst(x, y, baseHue = 0) {
    const palette = [12, 26, 38, 178, 206, 272, 308];
    const eventId = nextCollisionEventId;
    nextCollisionEventId += 1;
    const count = 8 + Math.floor(Math.random() * 6);
    collisionEventCounts.set(eventId, count);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.55;
      const speed = 1.05 + Math.random() * 0.95;
      collisionBursts.push({
        eventId,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        ttl: 300 + Math.random() * 160,
        width: 0.8 + Math.random() * 0.7,
        bend: (Math.random() - 0.5) * 0.075,
        bendDrift: (Math.random() - 0.5) * 0.0016,
        bendLimit: 0.006 + Math.random() * 0.085,
        bendSwitchAt: 18 + Math.floor(Math.random() * 46),
        hue: palette[Math.floor(Math.random() * palette.length)] || baseHue,
        history: [],
        branchAt: 38 + Math.floor(Math.random() * 28),
        branched: false
      });
    }
  }

  function drawMotes() {
    for (const mote of motes) {
      const dx = pointer.x - mote.x;
      const dy = pointer.y - mote.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (pointer.active && distance < 240) {
        const attract = (1 - distance / 240) * 0.02;
        const orbit = (1 - distance / 240) * 0.006;
        mote.vx += (dx / distance) * attract;
        mote.vy += (dy / distance) * attract;
        mote.vx += (-dy / distance) * orbit;
        mote.vy += (dx / distance) * orbit;
      }

      mote.vx *= 0.994;
      mote.vy *= 0.994;
      mote.x += mote.vx;
      mote.y += mote.vy;
      mote.history.push({ x: mote.x, y: mote.y });

      if (mote.history.length > 6) {
        mote.history.shift();
      }

      if (mote.cooldown > 0) {
        mote.cooldown -= 1;
      }

      if (mote.x < -20) mote.x = window.innerWidth + 20;
      if (mote.x > window.innerWidth + 20) mote.x = -20;
      if (mote.y < -20) mote.y = window.innerHeight + 20;
      if (mote.y > window.innerHeight + 20) mote.y = -20;

      const gradient = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, mote.radius * 11);
      const glowColor = mote.warm ? "rgba(255, 239, 169, 0.16)" : "rgba(228, 249, 255, 0.2)";
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius * 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mote.warm
        ? `rgba(255, 236, 156, ${0.34 + mote.alpha})`
        : `rgba(240, 252, 255, ${0.32 + mote.alpha})`;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fill();

      if (mote.history.length > 2) {
        drawTrackPath(
          mote.history,
          mote.warm ? 48 : 0,
          0.05 + mote.alpha * 0.035,
          mote.radius * 0.42,
          "bubble"
        );
      }
    }
  }

  function drawTrackPath(points, hue, alpha, width, style = "bubble") {
    if (points.length < 2) {
      return;
    }

    const color =
      hue === 0 ? `rgba(255, 255, 255, ${alpha})` : `hsla(${hue}, 100%, 84%, ${alpha})`;

    if (style === "line") {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i += 1) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      return;
    }

    for (let i = 0; i < points.length; i += 1) {
      const seed = Math.sin(i * 12.9898 + points.length * 78.233) * 43758.5453;
      const noise = seed - Math.floor(seed);

      if (i % 2 !== 0 && noise > 0.45) {
        continue;
      }

      const point = points[i];
      const t = i / Math.max(points.length - 1, 1);
      const radius = width * (0.45 + (1 - t) * 0.9 + noise * 0.45);
      const jitterX = (noise - 0.5) * width * 1.4;
      const jitterY = ((Math.sin(i * 7.123 + points.length) * 0.5 + 0.5) - 0.5) * width * 1.4;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x + jitterX, point.y + jitterY, radius, 0, Math.PI * 2);
      ctx.fill();

      if (noise > 0.68) {
        ctx.fillStyle = hue === 0
          ? `rgba(255, 255, 255, ${alpha * 0.55})`
          : `hsla(${hue}, 100%, 92%, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(
          point.x + jitterX + (noise - 0.5) * width * 2,
          point.y + jitterY + (((Math.cos(i * 4.217 + points.length) * 0.5 + 0.5) - 0.5) * width * 2),
          radius * 0.45,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  function hasActiveBond(aIndex, bIndex) {
    return moteBonds.some((bond) => {
      const samePair =
        (bond.aIndex === aIndex && bond.bIndex === bIndex) ||
        (bond.aIndex === bIndex && bond.bIndex === aIndex);
      return samePair && bond.age < bond.ttl;
    });
  }

  function createMoteBond(aIndex, bIndex) {
    if (hasActiveBond(aIndex, bIndex)) {
      return;
    }

    moteBonds.push({
      aIndex,
      bIndex,
      age: 0,
      ttl: 180,
      targetLength: 20 + Math.random() * 16
    });
  }

  function updateMoteBonds() {
    for (let i = moteBonds.length - 1; i >= 0; i -= 1) {
      const bond = moteBonds[i];
      const a = motes[bond.aIndex];
      const b = motes[bond.bIndex];

      if (!a || !b) {
        moteBonds.splice(i, 1);
        continue;
      }

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const stretch = distance - bond.targetLength;
      const pull = stretch * 0.0018;
      const nx = dx / distance;
      const ny = dy / distance;

      a.vx += nx * pull;
      a.vy += ny * pull;
      b.vx -= nx * pull;
      b.vy -= ny * pull;

      bond.age += 1;

      const alpha = 0.05 * (1 - bond.age / bond.ttl);
      ctx.strokeStyle = `rgba(240, 252, 255, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      if (bond.age >= bond.ttl) {
        const release = 0.9;
        a.vx -= nx * release;
        a.vy -= ny * release;
        b.vx += nx * release;
        b.vy += ny * release;
        moteBonds.splice(i, 1);
      }
    }
  }

  function drawChamberTracks() {
    chamberTracks.forEach((track, index) => {
      const drift = Math.sin(track.age * 0.02 + track.noise) * 0.016;
      const dx = pointer.x - track.x;
      const dy = pointer.y - track.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (pointer.active && distance < 240) {
        const influence = (1 - distance / 240) * 0.05;
        track.vx += (-dy / distance) * influence;
        track.vy += (dx / distance) * influence;
      }

      const vx = track.vx * Math.cos(drift) - track.vy * Math.sin(drift);
      const vy = track.vx * Math.sin(drift) + track.vy * Math.cos(drift);
      track.vx = vx * 0.998;
      track.vy = vy * 0.998;
      track.x += track.vx;
      track.y += track.vy;
      track.age += 1;
      track.history.push({ x: track.x, y: track.y });

      if (track.history.length > 22) {
        track.history.shift();
      }

      if (
        track.age > track.ttl ||
        track.x < -80 ||
        track.x > window.innerWidth + 80 ||
        track.y < -80 ||
        track.y > window.innerHeight + 80
      ) {
        chamberTracks[index] = createChamberTrack(index);
        return;
      }

      const alpha = 0.05 + Math.min(track.history.length / 22, 1) * 0.1;
      drawTrackPath(track.history, track.hue, alpha, track.width, "bubble");
    });
  }

  function drawStaticTracks() {
    staticTracks.forEach((track, index) => {
      const dx = pointer.x - track.x;
      const dy = pointer.y - track.y;
      const distance = Math.hypot(dx, dy) || 1;
      const drift = Math.sin(track.age * 0.014 + track.noise) * 0.012;

      if (pointer.active && distance < 180) {
        const influence = (1 - distance / 180) * 0.02;
        track.vx += (-dy / distance) * influence;
        track.vy += (dx / distance) * influence;
      }

      const vx = track.vx * Math.cos(drift) - track.vy * Math.sin(drift);
      const vy = track.vx * Math.sin(drift) + track.vy * Math.cos(drift);
      track.vx = vx * 0.996;
      track.vy = vy * 0.996;
      track.x += track.vx;
      track.y += track.vy;
      track.age += 1;
      track.history.push({ x: track.x, y: track.y });

      if (track.history.length > 14) {
        track.history.shift();
      }

      if (
        track.age > track.ttl ||
        track.x < -60 ||
        track.x > window.innerWidth + 60 ||
        track.y < -60 ||
        track.y > window.innerHeight + 60
      ) {
        staticTracks[index] = createStaticTrack(index);
        return;
      }

      const alpha = 0.03 + Math.min(track.history.length / 14, 1) * 0.06;
      drawTrackPath(track.history, track.hue, alpha, track.width * 0.95, "bubble");
    });
  }

  function drawCursorTrails() {
    for (let i = cursorTrails.length - 1; i >= 0; i -= 1) {
      const trail = cursorTrails[i];
      trail.bend += (Math.random() - 0.5) * 0.002;
      const vx = trail.vx * Math.cos(trail.bend) - trail.vy * Math.sin(trail.bend);
      const vy = trail.vx * Math.sin(trail.bend) + trail.vy * Math.cos(trail.bend);
      trail.vx = vx * 0.994;
      trail.vy = vy * 0.994;
      trail.x += trail.vx;
      trail.y += trail.vy;
      trail.age += 1;
      trail.history.push({ x: trail.x, y: trail.y });

      if (trail.history.length > 22) {
        trail.history.shift();
      }

      const fade = 1 - trail.age / trail.ttl;
      if (fade <= 0) {
        cursorTrails.splice(i, 1);
        continue;
      }

      drawTrackPath(trail.history, trail.hue, fade * 0.22, trail.width * 0.85, "bubble");
    }
  }

  function drawCollisionBursts() {
    for (let i = collisionBursts.length - 1; i >= 0; i -= 1) {
      const burst = collisionBursts[i];
      if (burst.age > 0 && burst.age % burst.bendSwitchAt === 0) {
        burst.bendDrift = (Math.random() - 0.5) * 0.0024;
      }

      burst.bend += burst.bendDrift;
      if (Math.abs(burst.bend) > burst.bendLimit) {
        burst.bendDrift *= -1;
      }

      burst.bend += (Math.random() - 0.5) * 0.0016;
      const vx = burst.vx * Math.cos(burst.bend) - burst.vy * Math.sin(burst.bend);
      const vy = burst.vx * Math.sin(burst.bend) + burst.vy * Math.cos(burst.bend);
      burst.vx = vx * 0.9988;
      burst.vy = vy * 0.9988;
      burst.x += burst.vx;
      burst.y += burst.vy;
      burst.age += 1;
      burst.history.push({ x: burst.x, y: burst.y });

      if (burst.history.length > 110) {
        burst.history.shift();
      }

      const eventCount = collisionEventCounts.get(burst.eventId) || 0;
      if (!burst.branched && burst.age >= burst.branchAt && eventCount < 100) {
        burst.branched = true;
        const branchAngle = Math.atan2(burst.vy, burst.vx) + (Math.random() > 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.6);
        const branchSpeed = Math.hypot(burst.vx, burst.vy) * (0.72 + Math.random() * 0.18);
        collisionEventCounts.set(burst.eventId, eventCount + 1);
        collisionBursts.push({
          eventId: burst.eventId,
          x: burst.x,
          y: burst.y,
          vx: Math.cos(branchAngle) * branchSpeed,
          vy: Math.sin(branchAngle) * branchSpeed,
          age: 0,
          ttl: Math.max(120, burst.ttl * (0.55 + Math.random() * 0.22)),
          width: burst.width * 0.78,
          bend: burst.bend + (Math.random() - 0.5) * 0.08,
          bendDrift: (Math.random() - 0.5) * 0.002,
          bendLimit: 0.008 + Math.random() * 0.09,
          bendSwitchAt: 14 + Math.floor(Math.random() * 40),
          hue: [18, 42, 186, 198, 286, 324][Math.floor(Math.random() * 6)],
          history: burst.history.slice(-8),
          branchAt: 999,
          branched: true
        });
      }

      const outOfBounds =
        burst.x < -140 ||
        burst.x > window.innerWidth + 140 ||
        burst.y < -140 ||
        burst.y > window.innerHeight + 140;
      const fade = Math.max(0, 1 - burst.age / burst.ttl);
      if (fade <= 0 || outOfBounds) {
        const remaining = (collisionEventCounts.get(burst.eventId) || 1) - 1;
        if (remaining > 0) {
          collisionEventCounts.set(burst.eventId, remaining);
        } else {
          collisionEventCounts.delete(burst.eventId);
        }
        collisionBursts.splice(i, 1);
        continue;
      }

      drawTrackPath(burst.history, burst.hue, fade * 0.72, burst.width, "line");
    }
  }

  function processMoteContacts() {
    if (frameTick % 2 !== 0) {
      return;
    }

    for (let i = 0; i < motes.length; i += 1) {
      const a = motes[i];
      if (a.cooldown > 0) {
        continue;
      }

      for (let j = i + 1; j < motes.length; j += 1) {
        const b = motes[j];
        if (b.cooldown > 0) {
          continue;
        }

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        const threshold = (a.radius + b.radius) * 1.6;

        if (distance < threshold) {
          const x = (a.x + b.x) / 2;
          const y = (a.y + b.y) / 2;
          emitCollisionBurst(x, y, Math.random() > 0.5 ? 186 : 0);
          createMoteBond(i, j);
          a.cooldown = 18;
          b.cooldown = 18;
          a.vx *= 0.88;
          a.vy *= 0.88;
          b.vx *= 0.88;
          b.vy *= 0.88;
          break;
        }
      }
    }
  }

  function draw() {
    frameTick += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawMotes();
    processMoteContacts();
    updateMoteBonds();
    drawStaticTracks();
    drawChamberTracks();
    drawCursorTrails();
    drawCollisionBursts();

    requestAnimationFrame(draw);
  }

  resizeCanvas();
  populateScene();
  draw();

  window.addEventListener("mousemove", (event) => {
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    emitCursorTrail(pointer.x, pointer.y, 3);
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    populateScene();
  });
}

function renderExplore() {
  function getVisual(card) {
    const credit = card.mediaCredit || (card.visual === "gif" ? "GIF: CERN / GIPHY" : "Image: CERN");
    const sourceAttrs = card.sourceUrl ? `href="${card.sourceUrl}" target="_blank" rel="noreferrer"` : "";
    const mediaTag = card.sourceUrl ? "a" : "div";

    if (card.visual === "gif") {
      return `
        <img src="${card.gifUrl}" alt="${card.title}" loading="lazy" />
        <span class="media-credit">${credit}</span>
      `;
    }
    if (card.visual === "image") {
      return `
        <${mediaTag} class="media-link" ${sourceAttrs}>
          <img src="${card.imageUrl}" alt="${card.title}" loading="lazy" />
          <span class="media-credit">${credit}</span>
        </${mediaTag}>
      `;
    }
    return `<div class="card-anim card-anim--${card.visual}"></div>`;
  }

  exploreGrid.innerHTML = content.exploreCards
    .map(
      (card) => `
        <article class="explore-card reveal" data-id="${card.id}">
          <div class="explore-visual">${getVisual(card)}</div>
          <div class="explore-body">
            <h3 class="explore-title">${card.title}</h3>
            <p class="explore-teaser">${card.teaser}</p>
            <p class="explore-full">${card.body}</p>
            <button class="explore-toggle" type="button" aria-expanded="false">
              <span class="explore-toggle-text">Learn more</span>
              <span class="explore-toggle-icon" aria-hidden="true">+</span>
            </button>
          </div>
        </article>
      `
    )
    .join("");

  exploreGrid.querySelectorAll(".explore-card").forEach((card) => {
    card.querySelector(".explore-toggle").addEventListener("click", () => {
      const isOpen = card.classList.toggle("open");
      card.querySelector(".explore-toggle").setAttribute("aria-expanded", String(isOpen));
      card.querySelector(".explore-toggle-text").textContent = isOpen ? "Show less" : "Learn more";
      card.querySelector(".explore-toggle-icon").textContent = isOpen ? "−" : "+";
    });
  });
}

renderProjects();
renderCitations();
renderContacts();
renderTabs();
renderExplore();
setupReveal();
setupCursor();
setupScrambledTitle();
setupParticleField();
