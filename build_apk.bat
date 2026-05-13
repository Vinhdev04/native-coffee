@echo off
echo Starting APK build for Chips Bill...
cd /d "d:\Work\Projects\native-coffee"
echo Installing dependencies...
call npm install
cd android
echo Cleaning and building APK...
if exist "app\.cxx" rmdir /s /q "app\.cxx"
if exist "app\build" rmdir /s /q "app\build"
if exist ".gradle" rmdir /s /q ".gradle"
call .\gradlew.bat clean assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)
echo Build successful!
echo APK location: d:\Work\Projects\native-coffee\android\app\build\outputs\apk\release\app-release.apk
pause
