@echo off
echo Creating and uploading GSC VAGS Foundation to GitHub...
echo.

echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing changes...
git commit -m "GSC VAGS Foundation: Complete blockchain wallet with Telegram integration"

echo.
echo Step 4: Setting remote origin...
git remote set-url origin https://github.com/dpkaction/gsc-vags-foundation.git

echo.
echo Step 5: Pushing to GitHub...
echo NOTE: You must create the repository 'gsc-vags-foundation' on GitHub first!
echo Go to: https://github.com/new
echo Repository name: gsc-vags-foundation
echo Description: Virtual Asset Gold & Silver - Blockchain wallet with Telegram integration
echo Set to Public, don't initialize with README
echo.
pause
git push -u origin main

echo.
echo Upload complete! Repository available at:
echo https://github.com/dpkaction/gsc-vags-foundation
pause
