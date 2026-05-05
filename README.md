# Student Internship Tracker – Setup Guide

## Requirements

Make sure you have these installed before starting:

- PHP 8.1+
- Composer
- Node.js + NPM
- Git

To check:
```bash
php -v
composer -v
node -v
git -v
```

---

## Step 1 – Clone the Project

```bash
git clone https://github.com/username/repo-name.git
cd repo-name
```

---

## Step 2 – Setup the Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

> On Windows CMD, use `copy .env.example .env` instead.

Open `.env` and update the database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=internship_tracker
DB_USERNAME=root
DB_PASSWORD=
```

Create the database in phpMyAdmin, then run:

```bash
php artisan migrate
```

---

## Step 3 – Setup the Frontend (React)

```bash
cd ../frontend
npm install
```

---

## Step 4 – Create Your Branch

```bash
git checkout main
git pull origin main
git checkout -b person2-reports
git push origin person2-reports
```

---

## Step 5 – Run the Project

Open two terminals:

**Terminal 1 – Backend:**
```bash
cd backend
php artisan serve
```
> Runs on: http://127.0.0.1:8000

**Terminal 2 – Frontend:**
```bash
cd frontend
npm start
```
> Runs on: http://localhost:3000

---

## Step 6 – Save Your Work

```bash
git add .
git commit -m "your message here"
git push origin person2-reports
```

---

## Branch Rules

- Never work directly on `main`
- Each person works only in their own branch
- Merge only after testing your module
- Always pull latest `main` before creating a new branch



## ------------------------------ important --------------------------------------------
l'admin li bch nbdew bih bch najmou n3mlou login mlwwl

- Email : admin@example.com
- password : admin123

3ana zede supervisor wehed w student wehed mlwl zede :

- Email supervisor : supervisor@example.com
- Password supervisor : supervisor123

- Email student : student@example.com
- Password student : student123

Bch najamt nhothom mlwl fama file amalo laravel creation ismou DatabaseSeeder.php mawjoud fil student-internship-tracker-laravel\backend\laravel\database\seeders
howa haja teb3a laravel tetsama laravel's seeder howa laccount admin deja mawjoud ama idha wejaht mochkla runi lcommande hedhy fil backend/laravel :
- php artisan db:seed

Or if you want to reset and re-seed:
- php artisan migrate:fresh --seed

