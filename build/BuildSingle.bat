echo off

set /p version=<build\version.txt
set /p password=<build\password.txt

CD %1

set /p AppID=<AppID.txt
set /p AppName=<AppName.txt
set /p AppTitle=<AppTitle.txt
set /p SettingsLayerName=<SettingsLayerName.txt
set /p PresetsFolderName=<PresetsFolderName.txt
set TempDir=%1\temp

echo.
echo.
echo ================
echo EXPORT START: %AppTitle% v%version%
echo ================
echo.
echo.

cd ../

rmdir %TempDir% /s /q
mkdir %TempDir%

call build\repl.bat "{version}" "%version%" L < "manifest.mxi" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppID}" "%AppID%" L < "%TempDir%\temp1.txt" >"%TempDir%\temp2.txt"
call build\repl.bat "{AppName}" "%AppName%" L < "%TempDir%\temp2.txt" >"%TempDir%\temp1.txt"
call build\repl.bat "{AppTitle}" "%AppTitle%" L < "%TempDir%\temp1.txt" >"%TempDir%\temp2.txt"
call build\repl.bat "{PresetsFolderName}" "%PresetsFolderName%" L < "%TempDir%\temp2.txt" >"%TempDir%\%AppID%.mxi"

call build\TemplateEntryPoint.bat "%TempDir%" "%AppTitle%.jsx" "%version%" "%AppID%" "%AppName%" "%AppTitle%" "%SettingsLayerName%" ""

del "%TempDir%\{AppTitle}.jsx"
del "%TempDir%\temp1.txt"
del "%TempDir%\temp2.txt"

xcopy "SmartCore" "%TempDir%/%AppName%" /S /Y /i

xcopy "%1\Presets" "%TempDir%/%AppName%/Presets" /S /Y /i

set LaunchPresetDir=%TempDir%\%PresetsFolderName%

mkdir "%LaunchPresetDir%"

FOR %%G in (%TempDir%/%AppName%/Presets\*.*) DO (
	call build\TemplateEntryPoint.bat "%LaunchPresetDir%" "%%~nG.jsx" "%version%" "%AppID%" "%AppName%" "%AppTitle%" "%SettingsLayerName%" "%%~nG%%~xG"
)

if exist ".\bin\%AppName% v%version%.zxp" (
	echo.
	echo.
    echo WARNING: Output file already exists, delete or change version: \bin\%AppName% v%version%.zxp
	CHOICE /C YN /M "Delete existing file? "
	IF errorlevel 1 goto DELETE_EXISTING
	IF errorlevel 2 goto END
) else (
	goto BUILD
)

:DELETE_EXISTING
del ".\bin\%AppName% v%version%.zxp"
if exist "./bin/%AppName% v%version%.zxp" (
	echo Failed to delete "./bin/%AppName% v%version%.zxp", skipping export
	pause
    goto END
)

:BUILD
java -jar build/signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore build/cert.p12 -tsa http://timestamp.digicert.com -storepass %password% "./bin/%AppName% v%version%.zxp" -C ./%TempDir% .


echo.
echo.
echo ================
echo EXPORT COMPLETE: %AppTitle% v%version%
echo ================
echo.
echo.

:END

rmdir %TempDir% /s /q