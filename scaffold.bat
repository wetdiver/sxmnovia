@echo off
echo Creating SXMNOVIA Member Gallery project structure...

:: Backend folders
mkdir backend\controllers 2>nul
mkdir backend\models 2>nul
mkdir backend\routes 2>nul
mkdir backend\middleware 2>nul
mkdir backend\config 2>nul
mkdir backend\utils 2>nul

:: Frontend folders
mkdir public\css 2>nul
mkdir public\js 2>nul
mkdir public\uploads\members 2>nul
mkdir views\partials 2>nul

:: Root files
type nul > server.js
type nul > package.json
type nul > .env

:: Backend files
type nul > backend\controllers\memberController.js
type nul > backend\controllers\adminController.js
type nul > backend\controllers\botController.js
type nul > backend\models\Member.js
type nul > backend\models\Property.js
type nul > backend\routes\gallery.js
type nul > backend\routes\admin.js
type nul > backend\routes\api.js
type nul > backend\middleware\auth.js
type nul > backend\middleware\upload.js
type nul > backend\config\database.js
type nul > backend\utils\imageProcessor.js

:: View files (EJS)
type nul > views\gallery.ejs
type nul > views\admin.ejs
type nul > views\partials\modal.ejs
type nul > views\partials\chatbot.ejs

:: Frontend assets
type nul > public\css\style.css
type nul > public\js\gallery.js
type nul > public\js\chatbot.js
type nul > public\js\admin.js

:: Database (SQLite will create it automatically)
type nul > database.sqlite

echo.
echo ✅ Project scaffold created. Run "npm init -y" then install dependencies:
echo npm install express sqlite3 sharp multer express-session bootstrap ejs
echo.
pause