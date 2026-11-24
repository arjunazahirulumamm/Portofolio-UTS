const $ = (selector) => document.querySelector(selector);

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

async function loadPortfolio() {
  try {
    const response = await fetch("/api/portfolio");

    if (!response.ok) {
      throw new Error("Gagal mengambil data portfolio");
    }

    const data = await response.json();

    renderProfile(data.profile || {});
    renderProjects(data.projects || []);
    renderSkills(data.skills || []);
    renderEducation(data.education || []);
    renderExperience(data.experience || []);
    renderSocials(data.socials || []);

    initEffects();
  } catch (error) {
    console.error(error);
  }
}

function renderProfile(profile) {
  const nameParts = (profile.name || "Your Name").trim().split(/\s+/);

  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : "Portfolio.";

  $("#heroName").innerHTML =
    `${esc(firstName)}<br><span>${esc(lastName)}</span>`;

  $("#bio").textContent = profile.bio || "";
  $("#aboutText").textContent = profile.about || profile.bio || "";
  $("#heroRole").textContent = (
    profile.role || "STUDENT DEVELOPER"
  ).toUpperCase();
  $("#locationText").textContent = profile.location || "Indonesia";
  

const heroVisual = $(".hero-visual");

if (heroVisual && profile.photo) {
    heroVisual.innerHTML = `
        <div class="hero-photo">
            <img
                src="/static/${esc(profile.photo)}?t=${Date.now()}"
                alt="${esc(profile.name || "Profile photo")}"
            >
        </div>
    `;

    heroVisual.classList.add("has-photo");
}

  const emailLink = $("#emailLink");

  if (emailLink && profile.email) {
    emailLink.href = `mailto:${profile.email}`;
    emailLink.textContent = `Let's talk ↗`;

    emailLink.addEventListener("click", () => {
      // native mail link
    });
  }
}

function renderProjects(projects) {
  const container = $("#projects");

  container.innerHTML = projects
    .map((project, index) => {
      const image = project.image
        ? `/static/${project.image.replace(/^\/+/, "")}`
        : "";

      return `
            <article class="project">

                <div class="project-image">

                    ${
                      image
                        ? `<img class="project-photo"
                                src="${esc(image)}"
                                alt="${esc(project.title)}"
                                loading="lazy"
                                onerror="this.style.display='none'">`
                        : ""
                    }

                    <div class="project-placeholder">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                </div>

                <div class="project-meta">
                    <span>PROJECT / ${String(index + 1).padStart(2, "0")}</span>
                    <span>${esc(project.year || "")}</span>
                </div>

                <div class="project-body">

                    <h3>${esc(project.title)}</h3>

                    <p>${esc(project.description)}</p>

                    <div class="tags">
                        ${(project.techStack || [])
                          .map((tech) => `<span>${esc(tech)}</span>`)
                          .join("")}
                    </div>

                    <div class="project-links">

                        ${
                          project.demoUrl
                            ? `<a href="${esc(project.demoUrl)}"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    LIVE DEMO ↗
                               </a>`
                            : ""
                        }

                        ${
                          project.repoUrl
                            ? `<a href="${esc(project.repoUrl)}"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    SOURCE CODE ↗
                               </a>`
                            : ""
                        }

                    </div>

                </div>

            </article>
        `;
    })
    .join("");
}

function renderSkills(skills) {
  $("#skills").innerHTML = skills
    .map(
      (group) => `
        <div class="skill-group">

            <h3>${esc(group.category)}</h3>

            <ul>
                ${(group.items || [])
                  .map(
                    (skill) => `
                    <li>
                        ${esc(skill)}
                        <span>↗</span>
                    </li>
                `,
                  )
                  .join("")}
            </ul>

        </div>
    `,
    )
    .join("");
}

function renderEducation(education) {
  $("#education").innerHTML = education
    .map(
      (item) => `
        <article class="timeline">

            <span>${esc(item.period)}</span>

            <h4>${esc(item.institution)}</h4>

            <p>${esc(item.degree)}</p>

        </article>
    `,
    )
    .join("");
}

function renderExperience(experience) {
  $("#experience").innerHTML = experience
    .map(
      (item) => `
        <article class="timeline">

            <span>${esc(item.period)}</span>

            <h4>${esc(item.role)}</h4>

            <p>${esc(item.company)}</p>

            <p class="detail">${esc(item.description)}</p>

        </article>
    `,
    )
    .join("");
}

function renderSocials(socials) {
  $("#socials").innerHTML = socials
    .map(
      (social) => `
        <a href="${esc(social.url)}"
           target="_blank"
           rel="noopener noreferrer">
            ${esc(social.platform)} ↗
        </a>
    `,
    )
    .join("");
}

function initEffects() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Scroll reveal
  const revealElements = document.querySelectorAll(
    ".hero-copy > *, .hero-visual, .section-heading, " +
      ".project, .about-content, .skill-group, .timeline, " +
      ".contact-section > *, footer > *",
  );

  revealElements.forEach((element, index) => {
    element.classList.add("motion-reveal");
    element.style.setProperty("--reveal-delay", `${(index % 5) * 80}ms`);
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  // Hero parallax
  const hero = $(".hero-visual");
  const art = $(".visual-art");

  if (
    hero &&
    art &&
    !reducedMotion &&
    window.matchMedia("(pointer:fine)").matches
  ) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      art.style.setProperty("--pointer-x", `${x * 18}px`);
      art.style.setProperty("--pointer-y", `${y * 18}px`);

      hero.style.setProperty("--tilt-x", `${y * -2}deg`);
      hero.style.setProperty("--tilt-y", `${x * 2}deg`);
    });

    hero.addEventListener("pointerleave", () => {
      art.style.setProperty("--pointer-x", "0px");
      art.style.setProperty("--pointer-y", "0px");

      hero.style.setProperty("--tilt-x", "0deg");
      hero.style.setProperty("--tilt-y", "0deg");
    });
  }

  // Project tilt
  if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".project").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--card-tilt-x", `${-y * 2}deg`);
        card.style.setProperty("--card-tilt-y", `${x * 2}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--card-tilt-x", "0deg");
        card.style.setProperty("--card-tilt-y", "0deg");
      });
    });
  }

  // Marquee
  const band = $(".intro-band");

  if (band && !band.querySelector(".motion-marquee")) {
    band.insertAdjacentHTML(
      "beforeend",
      `
            <div class="motion-marquee">
                <div class="marquee-track">
                    <span>
                        ✳ MAKING PROGRESS, NOT PERFECTION
                        ✳ LEARNING IN PUBLIC
                        ✳ BUILDING WITH CURIOSITY
                    </span>
                    <span>
                        ✳ MAKING PROGRESS, NOT PERFECTION
                        ✳ LEARNING IN PUBLIC
                        ✳ BUILDING WITH CURIOSITY
                    </span>
                </div>
            </div>
        `,
    );
  }

  // Active navigation
  const links = [...document.querySelectorAll(".navlinks a")];

  const targets = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => {
              link.classList.toggle(
                "active-link",
                link.getAttribute("href") === `#${entry.target.id}`,
              );
            });
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
      },
    );

    targets.forEach((target) => navObserver.observe(target));
  }

  // Custom cursor
  if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    const cursor = document.createElement("div");
    cursor.className = "portfolio-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    window.addEventListener("pointermove", (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    });

    document.querySelectorAll("a, button, .project").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        cursor.classList.add("cursor-active");
      });

      element.addEventListener("pointerleave", () => {
        cursor.classList.remove("cursor-active");
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolio);
