@echo off
echo installing packages
call npm i --force
echo done installing packages, press any key to continue
cls
pause
echo starting bot
call node .
pause

