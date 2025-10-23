@echo off
REM ================================================================
REM Run EAMVU Officer Columns Migration
REM ================================================================

echo.
echo ========================================
echo  Running Database Migration
echo ========================================
echo.

echo Adding EAMVU Officer columns to ilos_applications table...
echo.

cd /d %~dp0

psql -U ilos_user -d ilos_db -f add_eamvu_officer_columns.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Migration Completed Successfully! ✓
    echo ========================================
    echo.
    echo  Columns Added:
    echo    - eamvu_verification_comments (TEXT)
    echo    - eamvu_employment_comments (TEXT)
    echo    - eamvu_neighborhood_comments (TEXT)
    echo    - eamvu_general_observations (TEXT)
    echo    - eamvu_officer_location (JSONB)
    echo.
) else (
    echo.
    echo ========================================
    echo  Migration Failed! ✗
    echo ========================================
    echo.
    echo  Please check:
    echo    1. PostgreSQL is running
    echo    2. Database 'ilos_db' exists
    echo    3. User 'ilos_user' has permissions
    echo.
)

pause

