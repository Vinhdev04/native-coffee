@echo off
setlocal

echo ========================================
echo   Native Coffee - Git Sync Workflow
echo ========================================

echo [1/3] Saving changes to feat/auth-signin-signup...
git checkout feat/auth-signin-signup
git add .
git commit -m "feat: finalize auth signin and signup functionality"

echo.
echo [2/3] Merging into dev...
git checkout dev
git merge feat/auth-signin-signup

echo.
echo [3/3] Merging into main...
git checkout main
git merge dev

echo.
echo ========================================
echo   Workflow Completed Successfully!
echo ========================================
pause
