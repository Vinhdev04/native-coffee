@echo off
set "BRAIN_DIR=C:\Users\ACERR\.gemini\antigravity\brain\4a672baf-a82e-4f8a-9c27-1e7c9f377677"
set "TARGET_DIR=D:\Work\Projects\native-coffee\src\assets\images"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

copy "%BRAIN_DIR%\native_coffee_logo_1777431011467.png" "%TARGET_DIR%\logo.png"
copy "%BRAIN_DIR%\native_coffee_splash_bg_1777431031974.png" "%TARGET_DIR%\splash_bg.png"
copy "%BRAIN_DIR%\native_coffee_pattern_1777431046497.png" "%TARGET_DIR%\coffee_pattern.png"

echo Assets copied successfully.
pause
