const adminKeyInput = document.querySelector("#adminKey");
const saveKeyButton = document.querySelector("#saveKey");

const projectList = document.querySelector("#projectList");
const projectModal = document.querySelector("#projectModal");
const projectForm = document.querySelector("#projectForm");

const profileForm = document.querySelector("#profileForm");
const skillList = document.querySelector("#skillList");

let portfolioData = {};
let adminKey = "";

// ========================================
// AUTH
// ========================================

saveKeyButton.addEventListener("click", () => {
  adminKey = adminKeyInput.value.trim();

  if (!adminKey) {
    alert("Masukkan admin key terlebih dahulu.");
    return;
  }

  loadAdminData();
});

// ========================================
// API HELPER
// ========================================

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey,
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Request gagal");
  }

  return result;
}

// ========================================
// LOAD DATA
// ========================================

async function loadAdminData() {
  try {
    portfolioData = await api("/api/portfolio");

    renderAdminProjects();
    renderProfileForm();
    renderEducationEntries();
    renderExperienceEntries();
    renderSkillGroups();

    document.querySelector("#projectCount").textContent =
      portfolioData.projects.length;

    document.querySelector("#skillCount").textContent =
      portfolioData.skills.length;

    alert("Dashboard berhasil dibuka.");
  } catch (error) {
    alert(error.message);
  }
}

// ========================================
// EDUCATION
// ========================================

function renderEducationEntries() {
  const educationList = document.querySelector("#educationList");
  const education = portfolioData.education || [];

  if (!education.length) {
    educationList.innerHTML = "<p>Belum ada data education.</p>";
    return;
  }

  educationList.innerHTML = education
    .map(
      (item, index) => `
        <article class="education-admin-entry">
          <label>
            Institution
            <input name="institution" value="${escapeHTML(item.institution)}" required />
          </label>

          <label>
            Degree
            <input name="degree" value="${escapeHTML(item.degree)}" required />
          </label>

          <label>
            Period
            <input name="period" value="${escapeHTML(item.period)}" required />
          </label>

          <button class="delete-btn" type="button" data-remove-education="${index}">
            Remove education
          </button>
        </article>
      `,
    )
    .join("");
}

function readEducationEntries() {
  return [...document.querySelectorAll(".education-admin-entry")].map((entry) => ({
    institution: entry.querySelector('[name="institution"]').value.trim(),
    degree: entry.querySelector('[name="degree"]').value.trim(),
    period: entry.querySelector('[name="period"]').value.trim(),
  }));
}

document.querySelector("#addEducation").addEventListener("click", () => {
  portfolioData.education = readEducationEntries();
  portfolioData.education.push({ institution: "", degree: "", period: "" });
  renderEducationEntries();
});

document.querySelector("#educationList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-education]");
  if (!button) return;

  portfolioData.education = readEducationEntries();
  portfolioData.education.splice(Number(button.dataset.removeEducation), 1);
  renderEducationEntries();
});

document.querySelector("#saveEducation").addEventListener("click", async () => {
  const invalidField = [
    ...document.querySelectorAll(".education-admin-entry input"),
  ].find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    return;
  }

  const education = readEducationEntries();
  try {
    portfolioData.education = await api("/api/education", {
      method: "PUT",
      body: JSON.stringify(education),
    });
    renderEducationEntries();
    alert("Education berhasil disimpan.");
  } catch (error) {
    alert(error.message);
  }
});

// ========================================
// EXPERIENCE
// ========================================

function renderExperienceEntries() {
  const experienceList = document.querySelector("#experienceList");
  const experiences = portfolioData.experience || [];

  if (!experiences.length) {
    experienceList.innerHTML = "<p>Belum ada data experience.</p>";
    return;
  }

  experienceList.innerHTML = experiences
    .map(
      (item, index) => `
        <article class="experience-admin-entry">
          <label>
            Role
            <input name="role" value="${escapeHTML(item.role)}" required />
          </label>

          <label>
            Company
            <input name="company" value="${escapeHTML(item.company)}" required />
          </label>

          <label>
            Period
            <input name="period" value="${escapeHTML(item.period)}" required />
          </label>

          <label class="full">
            Description
            <textarea name="description" rows="3" required>${escapeHTML(item.description)}</textarea>
          </label>

          <button class="delete-btn" type="button" data-remove-experience="${index}">
            Remove experience
          </button>
        </article>
      `,
    )
    .join("");
}

function readExperienceEntries() {
  return [...document.querySelectorAll(".experience-admin-entry")].map((entry) => ({
    role: entry.querySelector('[name="role"]').value.trim(),
    company: entry.querySelector('[name="company"]').value.trim(),
    period: entry.querySelector('[name="period"]').value.trim(),
    description: entry.querySelector('[name="description"]').value.trim(),
  }));
}

document.querySelector("#addExperience").addEventListener("click", () => {
  portfolioData.experience = readExperienceEntries();
  portfolioData.experience.push({
    role: "",
    company: "",
    period: "",
    description: "",
  });
  renderExperienceEntries();
});

document.querySelector("#experienceList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-experience]");
  if (!button) return;

  portfolioData.experience = readExperienceEntries();
  portfolioData.experience.splice(Number(button.dataset.removeExperience), 1);
  renderExperienceEntries();
});

document.querySelector("#saveExperience").addEventListener("click", async () => {
  const invalidField = [
    ...document.querySelectorAll(".experience-admin-entry input, .experience-admin-entry textarea"),
  ].find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    return;
  }

  const experience = readExperienceEntries();
  try {
    portfolioData.experience = await api("/api/experience", {
      method: "PUT",
      body: JSON.stringify(experience),
    });
    renderExperienceEntries();
    alert("Experience berhasil disimpan.");
  } catch (error) {
    alert(error.message);
  }
});

// ========================================
// PROJECT LIST
// ========================================

function renderAdminProjects() {
  projectList.innerHTML = portfolioData.projects
    .map(
      (project) => `
        <article class="admin-project">

            <div>
                <h3>${escapeHTML(project.title)}</h3>

                <p>${escapeHTML(project.description)}</p>

                <small>ID: ${project.id}</small>
            </div>

            <div class="admin-actions">

                <button onclick="editProject(${project.id})">
                    Edit
                </button>

                <button class="delete-btn"
                        onclick="deleteProject(${project.id})">
                    Delete
                </button>

            </div>

        </article>
    `,
    )
    .join("");
}

// ========================================
// ADD PROJECT
// ========================================

document.querySelector("#addProject").addEventListener("click", () => {
  projectForm.reset();

  projectForm.elements.id.value = "";
  const projectImagePreview = document.querySelector("#projectImagePreview");
  const projectImageStatus = document.querySelector("#projectImageStatus");
  if (projectImagePreview) { projectImagePreview.removeAttribute("src"); projectImagePreview.hidden = true; }
  if (projectImageStatus) projectImageStatus.textContent = "Pilih gambar untuk thumbnail project.";

  document.querySelector("#modalTitle").textContent = "Add project";

  projectModal.classList.add("show");
});

// ========================================
// EDIT PROJECT
// ========================================

function editProject(id) {
  const project = portfolioData.projects.find((p) => p.id === id);

  if (!project) return;

  projectForm.reset();

  projectForm.elements.id.value = project.id;
  projectForm.elements.title.value = project.title || "";
  projectForm.elements.year.value = project.year || "";
  projectForm.elements.description.value = project.description || "";
  projectForm.elements.image.value = project.image || "";

  projectForm.elements.techStack.value = (project.techStack || []).join(", ");

  projectForm.elements.demoUrl.value = project.demoUrl || "";
  projectForm.elements.repoUrl.value = project.repoUrl || "";

  const projectImagePreview = document.querySelector("#projectImagePreview");
  const projectImageStatus = document.querySelector("#projectImageStatus");
  const projectImageFile = document.querySelector("#projectImageFile");
  if (projectImageFile) projectImageFile.value = "";
  if (projectImagePreview) {
    if (project.image) {
      projectImagePreview.src = `/static/${project.image.replace(/^\/+/, "")}?t=${Date.now()}`;
      projectImagePreview.hidden = false;
    } else {
      projectImagePreview.removeAttribute("src");
      projectImagePreview.hidden = true;
    }
  }
  if (projectImageStatus) projectImageStatus.textContent = project.image ? "Thumbnail saat ini ditampilkan." : "Pilih gambar untuk mengganti thumbnail project.";

  document.querySelector("#modalTitle").textContent = "Edit project";

  projectModal.classList.add("show");
}

// ========================================
// SAVE PROJECT
// ========================================

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = new FormData(projectForm);
  const id = form.get("id");
  const selectedProjectImage = document.querySelector("#projectImageFile")?.files?.[0] || null;

  const project = {
    title: form.get("title").trim(),
    year: form.get("year").trim(),
    description: form.get("description").trim(),
    image: form.get("image").trim(),
    techStack: form.get("techStack").split(",").map((item) => item.trim()).filter(Boolean),
    demoUrl: form.get("demoUrl").trim(),
    repoUrl: form.get("repoUrl").trim(),
  };

  try {
    let savedProject;
    if (id) {
      savedProject = await api(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(project) });
    } else {
      savedProject = await api("/api/projects", { method: "POST", body: JSON.stringify(project) });
    }

    // Upload thumbnail setelah project berhasil dibuat/diupdate (ID sudah tersedia).
    if (selectedProjectImage && savedProject?.id) {
      const imageForm = new FormData();
      imageForm.append("image", selectedProjectImage);
      const imageResponse = await fetch(`/api/projects/${savedProject.id}/image`, {
        method: "POST",
        headers: { "X-Admin-Key": adminKey },
        body: imageForm,
      });
      const imageResult = await imageResponse.json().catch(() => ({}));
      if (!imageResponse.ok) throw new Error(imageResult.error || "Upload thumbnail gagal");
    }

    projectModal.classList.remove("show");
    await loadAdminData();
    alert(selectedProjectImage ? "Project dan thumbnail berhasil disimpan." : "Project berhasil disimpan.");
  } catch (error) {
    alert(error.message);
  }
});

// Preview image selected in project modal
const projectImageFileInput = document.querySelector("#projectImageFile");
const projectImagePreviewEl = document.querySelector("#projectImagePreview");
const projectImageStatusEl = document.querySelector("#projectImageStatus");
if (projectImageFileInput) {
  projectImageFileInput.addEventListener("change", () => {
    const file = projectImageFileInput.files?.[0];
    if (!file) return;
    if (projectImagePreviewEl) {
      projectImagePreviewEl.src = URL.createObjectURL(file);
      projectImagePreviewEl.hidden = false;
    }
    if (projectImageStatusEl) projectImageStatusEl.textContent = `Selected: ${file.name} (preview only until Save project)`;
  });
}

// ========================================
// DELETE PROJECT
// ========================================

async function deleteProject(id) {
  const confirmed = confirm("Yakin ingin menghapus project ini?");

  if (!confirmed) return;

  try {
    await api(`/api/projects/${id}`, {
      method: "DELETE",
    });

    await loadAdminData();
  } catch (error) {
    alert(error.message);
  }
}

// ========================================
// CLOSE MODAL
// ========================================

document.querySelector("#closeModal").addEventListener("click", () => {
  projectModal.classList.remove("show");
});

projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) {
    projectModal.classList.remove("show");
  }
});

// ========================================
// PROFILE
// ========================================

function renderProfileForm() {
  const profile = portfolioData.profile || {};

  const photoPreview = document.querySelector("#profilePhotoPreview");
  if (photoPreview && profile.photo) {
    photoPreview.src = `/static/${profile.photo.replace(/^\/+/, "")}?t=${Date.now()}`;
  }

  Object.keys(profileForm.elements).forEach((name) => {
    const field = profileForm.elements[name];

    if (field && profile[name] !== undefined) {
      field.value = profile[name];
    }
  });
}

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = new FormData(profileForm);

  const profile = Object.fromEntries(form.entries());

  try {
    await api("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });

    alert("Profile berhasil disimpan.");
  } catch (error) {
    alert(error.message);
  }
});

// ========================================
// SKILLS
// ========================================

function renderSkillGroups() {
  skillList.innerHTML = portfolioData.skills
    .map(
      (group, index) => `
        <div class="skill-admin-group">

            <label>
                Category
                <input
                    class="skill-category"
                    value="${escapeHTML(group.category)}"
                >
            </label>

            <label>
                Skills (pisahkan dengan koma)
                <input
                    class="skill-items"
                    value="${escapeHTML(group.items.join(", "))}"
                >
            </label>

            <button
                class="delete-btn remove-category"
                onclick="removeSkillGroup(${index})"
            >
                Remove category
            </button>

        </div>
    `,
    )
    .join("");
}

// ========================================
// ADD SKILL GROUP
// ========================================

document.querySelector("#addSkillGroup").addEventListener("click", () => {
  portfolioData.skills.push({
    category: "New category",
    items: [],
  });

  renderSkillGroups();
});

// ========================================
// REMOVE SKILL GROUP
// ========================================

function removeSkillGroup(index) {
  portfolioData.skills.splice(index, 1);
  renderSkillGroups();
}

// ========================================
// SAVE SKILLS
// ========================================

document.querySelector("#saveSkills").addEventListener("click", async () => {
  const groups = [...document.querySelectorAll(".skill-admin-group")];

  const skills = groups.map((group) => ({
    category: group.querySelector(".skill-category").value.trim(),

    items: group
      .querySelector(".skill-items")
      .value.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  }));

  try {
    await api("/api/skills", {
      method: "PUT",
      body: JSON.stringify(skills),
    });

    alert("Skills berhasil disimpan.");

    portfolioData.skills = skills;
  } catch (error) {
    alert(error.message);
  }
});

// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(value) {
  return String(value ?? "").replace(
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
}
const photoInput = document.getElementById("profilePhotoInput");
const photoPreview = document.getElementById("profilePhotoPreview");
const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
const photoStatus = document.getElementById("photoUploadStatus");

let selectedPhoto = null;

// Preview foto
if (photoInput) {
  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    selectedPhoto = file;
    photoPreview.src = URL.createObjectURL(file);
    photoStatus.textContent = "Preview foto siap.";
  });
}

if (uploadPhotoBtn) {
  uploadPhotoBtn.addEventListener("click", async () => {
    if (!selectedPhoto) { photoStatus.textContent = "Pilih foto terlebih dahulu."; return; }
    const photoForm = new FormData();
    photoForm.append("photo", selectedPhoto);
    photoStatus.textContent = "Mengupload foto...";
    try {
      const response = await fetch("/api/profile/photo", { method: "POST", headers: { "X-Admin-Key": adminKey }, body: photoForm });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Upload gagal (HTTP ${response.status})`);
      photoStatus.textContent = "Foto profil berhasil disimpan.";
      photoPreview.src = `/static/${result.photo}?t=${Date.now()}`;
      selectedPhoto = null;
      photoInput.value = "";
    } catch (error) { photoStatus.textContent = error.message; console.error(error); }
  });
}