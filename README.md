# Siloam 2027 Church Experience

An independent Django project for the interactive Layers of Truth SILOAM 2027 auditorium experience.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

Then open `http://127.0.0.1:8000/`.

## Layout

- `siloam_site/` — Django project configuration
- `auditorium/` — auditorium view, template, and static 3D assets
- `references/` — original church reference imagery
- `legacy-prototype/` — earlier standalone prototype retained for reference
