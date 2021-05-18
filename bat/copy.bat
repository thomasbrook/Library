@echo off

Set dd=%date:~0,4%%date:~5,2%%date:~8,2%
Set tm1=%time:~0,2%
if /i %tm1% LSS 10 (set tm1=0%time:~1,1%)
Set tm2=%time:~3,2%
if /i %tm2% LSS 10 (set tm2=0%time:~1,1%)
Set tt=%tm1%%tm2%

if exist "D:\coderelease\AIPE\bak\%dd%_%tt%" goto startcopy
md "D:\coderelease\AIPE\bak\%dd%_%tt%"
:startcopy

xcopy "D:\coderelease\AIPE\deploy" "D:\coderelease\AIPE\bak\%dd%_%tt%" /s/h/e/c/y/exclude:D:\coderelease\AIPE\bak_exclude.txt

xcopy "D:\coderelease\AIPE\Web" "D:\coderelease\AIPE\deploy" /s/h/e/c/y/exclude:D:\coderelease\AIPE\release_exclude.txt

echo endlocal
pause