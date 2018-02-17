::echo off

set /p version=<build\version.txt
set /p password=<build\password.txt

CD %1

set /p AppID=<AppID.txt
set /p AppName=<AppName.txt
set /p AppTitle=<AppTitle.txt
set /p SettingsLayerName=<SettingsLayerName.txt
set TempDir=%1\temp

cd ../

rmdir %TempDir% /s /q
mkdir %TempDir%

call build\repl.bat "{version}" "%version%" L < "manifest.mxi" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppID}" "%AppID%" L < "%TempDir%\temp1.txt" >"%TempDir%\temp2.txt"
call build\repl.bat "{AppName}" "%AppName%" L < "%TempDir%\temp2.txt" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppTitle}" "%AppTitle%" L < "%TempDir%\temp1.txt" >"%TempDir%\%AppID%.mxi"

echo on

xcopy "Templates" "%TempDir%" /S /Y /i

call build\repl.bat "{version}" "%version%" L < "%TempDir%\{AppTitle}.jsx" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppID}" "%AppID%" L < "%TempDir%\temp1.txt" >"%TempDir%\temp2.txt"
call build\repl.bat "{AppName}" "%AppName%" L < "%TempDir%\temp2.txt" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppTitle}" "%AppTitle%" L < "%TempDir%\temp1.txt" >"%TempDir%\temp2.txt"
call build\repl.bat "{SettingsLayerName}" "%SettingsLayerName%" L < "%TempDir%\temp2.txt" >"%TempDir%\%AppTitle%.jsx"

del "%TempDir%\{AppTitle}.jsx"
del "%TempDir%\temp1.txt"
del "%TempDir%\temp2.txt"

xcopy "SmartCore" "%TempDir%/%AppName%" /S /Y /i

xcopy "%1\Presets" "%TempDir%/%AppName%/Presets" /S /Y /i

if exist "./bin/%AppName% v%version%.zxp" (
	echo.
	echo.
    echo WARNING: Output file already exists, delete or change version: /bin/%AppName% v%version%.zxp
    set /P INPUT=Delete existing file? [Y/N]: %=%
	If "%INPUT%"=="y" goto DELETE_EXISTING
	If "%INPUT%"=="Y" goto DELETE_EXISTING
	
    goto END
) else (
	goto BUILD
)


:DELETE_EXISTING
del "./bin/%AppName% v%version%.zxp"

:BUILD
java -jar build/signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore build/cert.p12 -tsa http://timestamp.digicert.com -storepass %password% "./bin/%AppName% v%version%.zxp" -C ./%TempDir% .


:END

rmdir %TempDir% /s /q