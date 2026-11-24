import os
from werkzeug.utils import secure_filename

from flask import request, jsonify
from flask import Flask, render_template, jsonify, request
from pathlib import Path
import json

app = Flask(__name__)

DATA_FILE = Path("data/portfolio.json")
ADMIN_KEY = "arjunaz"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_data(data):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    return jsonify(load_data())

@app.route("/api/profile/photo", methods=["POST"])
def upload_profile_photo():
    admin_key = request.headers.get("X-Admin-Key")

    if admin_key != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    if "photo" not in request.files:
        return jsonify({"error": "Foto tidak ditemukan"}), 400

    photo = request.files["photo"]

    if photo.filename == "":
        return jsonify({"error": "File belum dipilih"}), 400

    allowed_extensions = {"jpg", "jpeg", "png", "webp"}
    ext = photo.filename.rsplit(".", 1)[-1].lower()

    if ext not in allowed_extensions:
        return jsonify({"error": "Format foto harus JPG, PNG, atau WEBP"}), 400

    upload_folder = os.path.join(app.root_path, "static", "uploads")
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(f"profile.{ext}")
    filepath = os.path.join(upload_folder, filename)

    # Hapus foto profil format lama
    for old_ext in allowed_extensions:
        old_file = os.path.join(upload_folder, f"profile.{old_ext}")
        if os.path.exists(old_file) and old_file != filepath:
            os.remove(old_file)

    photo.save(filepath)

    # Update data portfolio JSON
    data = load_data()  # gunakan fungsi load JSON milik project
    data["profile"]["photo"] = f"uploads/{filename}"
    save_data(data)     # gunakan fungsi penyimpanan JSON milik project

    return jsonify({
        "success": True,
        "photo": data["profile"]["photo"]
    })

# ===========================
# ADMIN AUTH
# ===========================

def is_admin():
    return request.headers.get("X-Admin-Key") == ADMIN_KEY


# ===========================
# CREATE PROJECT
# ===========================

@app.route("/api/projects", methods=["POST"])
def create_project():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = load_data()
    project = request.json

    project["id"] = max(
        [p.get("id", 0) for p in data["projects"]],
        default=0
    ) + 1

    data["projects"].append(project)
    save_data(data)

    return jsonify(project), 201


# ===========================
# UPDATE PROJECT
# ===========================

@app.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = load_data()

    for project in data["projects"]:
        if project["id"] == project_id:
            project.update(request.json)
            save_data(data)
            return jsonify(project)

    return jsonify({"error": "Project not found"}), 404


# ========================================
# UPLOAD PROJECT IMAGE
# ========================================

@app.route("/api/projects/<int:project_id>/image", methods=["POST"])
def upload_project_image(project_id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "Image file tidak ditemukan"}), 400

    image_file = request.files["image"]
    if not image_file or not image_file.filename:
        return jsonify({"error": "Pilih gambar terlebih dahulu"}), 400

    allowed = {"jpg", "jpeg", "png", "webp"}
    ext = image_file.filename.rsplit(".", 1)[-1].lower() if "." in image_file.filename else ""
    if ext not in allowed:
        return jsonify({"error": "Format gambar harus JPG, PNG, atau WEBP"}), 400

    data = load_data()
    project = next((item for item in data.get("projects", []) if item.get("id") == project_id), None)
    if project is None:
        return jsonify({"error": "Project tidak ditemukan"}), 404

    upload_folder = os.path.join(app.root_path, "static", "uploads", "projects")
    os.makedirs(upload_folder, exist_ok=True)

    # Replace file gambar project yang sebelumnya, jika ada
    old_image = project.get("image", "")
    if old_image.startswith("uploads/projects/"):
        old_path = os.path.join(app.root_path, "static", old_image)
        if os.path.isfile(old_path):
            os.remove(old_path)

    filename = secure_filename(f"project_{project_id}.{ext}")
    image_file.save(os.path.join(upload_folder, filename))
    project["image"] = f"uploads/projects/{filename}"
    save_data(data)

    return jsonify({"success": True, "project": project, "image": project["image"]}), 200


# ===========================
# DELETE PROJECT
# ===========================

@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = load_data()

    data["projects"] = [
        p for p in data["projects"]
        if p["id"] != project_id
    ]

    save_data(data)

    return jsonify({"message": "Project deleted"})


# ===========================
# UPDATE PROFILE
# ===========================

@app.route("/api/profile", methods=["PUT"])
def update_profile():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = load_data()
    data["profile"].update(request.json)

    save_data(data)

    return jsonify(data["profile"])
# ========================================
# UPLOAD PROFILE PHOTO
# ========================================


# ===========================
# UPDATE SKILLS
# ===========================

@app.route("/api/skills", methods=["PUT"])
def update_skills():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = load_data()
    data["skills"] = request.json

    save_data(data)

    return jsonify(data["skills"])


# ===========================
# UPDATE EDUCATION
# ===========================

@app.route("/api/education", methods=["PUT"])
def update_education():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    education = request.get_json(silent=True)
    if not isinstance(education, list):
        return jsonify({"error": "Education harus berupa daftar"}), 400

    fields = ("institution", "degree", "period")
    for item in education:
        if not isinstance(item, dict) or any(
            not isinstance(item.get(field), str) for field in fields
        ):
            return jsonify({"error": "Setiap education harus memiliki institution, degree, dan period"}), 400

    data = load_data()
    data["education"] = [
        {field: item[field].strip() for field in fields}
        for item in education
    ]
    save_data(data)

    return jsonify(data["education"])


# ===========================
# UPDATE EXPERIENCE
# ===========================

@app.route("/api/experience", methods=["PUT"])
def update_experience():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401

    experience = request.get_json(silent=True)
    if not isinstance(experience, list):
        return jsonify({"error": "Experience harus berupa daftar"}), 400

    fields = ("role", "company", "period", "description")
    for item in experience:
        if not isinstance(item, dict) or any(
            not isinstance(item.get(field), str) for field in fields
        ):
            return jsonify({"error": "Setiap experience harus memiliki role, company, period, dan description"}), 400

    data = load_data()
    data["experience"] = [
        {field: item[field].strip() for field in fields}
        for item in experience
    ]
    save_data(data)

    return jsonify(data["experience"])


if __name__ == "__main__":
    app.run(debug=True)