# Database Fix Script for Windows PowerShell

Write-Host "=" -NoNewline; Write-Host ("=" * 60)
Write-Host "DATABASE FIX SCRIPT"
Write-Host "=" -NoNewline; Write-Host ("=" * 60)

# Stop any running Django/Daphne servers
Write-Host "`nStep 1: Checking for running servers..."
$processes = Get-Process | Where-Object {$_.ProcessName -like "*python*" -or $_.ProcessName -like "*daphne*"}
if ($processes) {
    Write-Host "Found running processes. Please stop your Django/Daphne server first."
    Write-Host "Press Ctrl+C in the terminal running the server, then run this script again."
    exit 1
} else {
    Write-Host "No running servers found. Proceeding..."
}

# Backup current database
Write-Host "`nStep 2: Backing up current database..."
if (Test-Path "db.sqlite3") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item "db.sqlite3" "db.sqlite3.backup_$timestamp"
    Write-Host "Backup created: db.sqlite3.backup_$timestamp"
} else {
    Write-Host "No existing database found."
}

# Delete current database
Write-Host "`nStep 3: Deleting corrupted database..."
if (Test-Path "db.sqlite3") {
    Remove-Item "db.sqlite3" -Force
    Write-Host "Database deleted successfully."
} else {
    Write-Host "No database to delete."
}

# Run migrations
Write-Host "`nStep 4: Running migrations..."
python manage.py migrate

# Create superuser (optional)
Write-Host "`nStep 5: Would you like to create a superuser? (y/n)"
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    python manage.py createsuperuser
}

# Run the reset script to create initial data
Write-Host "`nStep 6: Creating initial data..."
python reset_database.py

Write-Host "`n" -NoNewline; Write-Host ("=" * 60)
Write-Host "DATABASE FIX COMPLETE!"
Write-Host ("=" * 60)
Write-Host "`nYou can now start your server with:"
Write-Host "  python manage.py runserver"
Write-Host "  OR"
Write-Host "  daphne -p 8000 backend.asgi:application"
Write-Host "`n" -NoNewline; Write-Host ("=" * 60)
