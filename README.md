# Donation Management System (Django)

This project is a complete web-based platform for managing donations, charities, and campaigns, built with Django and Tailwind CSS.

## Features
- **User Authentication:** Role-based system for Donors, Charities, and Admins.
- **Donor Dashboard:** View impact, track history, and explore campaigns.
- **Charity Hub:** Create and manage donation campaigns.
- **Admin Panel:** Global oversight, fund tracking, and user management.
- **Professional UI:** Styled with Tailwind CSS and Lucide icons.

## Project Structure
- `donate_project/`: Main project settings.
- `donations/`: App containing models (Class Diagram), views (Sequence Logic), and forms.
- `templates/`: HTML templates using Django Template Language.
- `manage.py`: Django management script.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install django
   ```

2. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Create Superuser (Admin):**
   ```bash
   python manage.py createsuperuser
   ```

4. **Run the Server:**
   ```bash
   python manage.py runserver 0.0.0.0:3000
   ```
   *Note: Access the site at http://localhost:3000. Use /admin/ for the default Django admin panel.*

## Diagram to Implementation Mapping
- **Class Diagram:** Implemented in `donations/models.py`.
- **Use Case Diagrams:** Mapped to views in `donations/views.py` (e.g., `make_donation`, `create_campaign`).
- **Sequence Diagrams:** Logic flows handled in views (Login -> Dashboard -> Donate -> Success Message).
- **Misuse Case:** Handled via Django's secure authentication, CSRF protection, and field validation in `forms.py`.
