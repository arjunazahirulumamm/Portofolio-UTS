# Student Developer Portfolio

Personal portfolio website built using Flask, HTML, CSS,
JavaScript, and JSON.

## Features

- Responsive portfolio website
- Profile section
- Project showcase
- Skills
- Education
- Experience
- Social links
- Admin dashboard
- Create project
- Read project
- Update project
- Delete project
- Edit profile
- Edit skills
- Create, edit, and delete education entries
- Create, edit, and delete experience entries
- Interactive animations

## Tech Stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- JSON

## Installation

Clone repository:

```bash
git clone https://github.com/username/student-portfolio.git
cd student-portfolio
## Modular CSS & HTML structure

Styles are separated by responsibility for easier editing:
- `static/css/base.css`, `navigation-hero.css`, `projects.css`, `sections.css`, `effects.css`, `responsive.css`
- Admin styles: `admin-base.css`, `admin-layout.css`, `admin-projects.css`, `admin-forms.css`, `admin-responsive.css`

HTML pages use Jinja partials in `templates/partials/index/` and `templates/partials/admin/`. Edit the relevant section partial instead of the full page.
