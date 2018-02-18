
set DestDir=%~1
set DestName=%~2
set version=%~3
set AppID=%~4
set AppName=%~5
set AppTitle=%~6
set SettingsLayerName=%~7
set PresetPath=%~8

copy "Templates\{AppTitle}.jsx" "%DestDir%\temp2.txt"
call build\repl.bat "{version}" "%version%" L < "%DestDir%\temp2.txt" >"%DestDir%\temp1.txt"
call build\repl.bat "{AppID}" "%AppID%" L < "%DestDir%\temp1.txt" >"%DestDir%\temp2.txt"
call build\repl.bat "{AppName}" "%AppName%" L < "%DestDir%\temp2.txt" >"%DestDir%\temp1.txt"
call build\repl.bat "{AppTitle}" "%AppTitle%" L < "%DestDir%\temp1.txt" >"%DestDir%\temp2.txt"
call build\repl.bat "{SettingsLayerName}" "%SettingsLayerName%" L < "%DestDir%\temp2.txt" >"%DestDir%\temp1.txt"
call build\repl.bat "{PresetPath}" "%PresetPath%" L < "%DestDir%\temp1.txt" >"%DestDir%\temp2.txt"

move "%DestDir%\temp2.txt" "%DestDir%\%DestName%"

del "%DestDir%\temp1.txt"