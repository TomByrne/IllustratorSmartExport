cd ../
rmdir temp /s /q
mkdir temp
echo f | xcopy "EntryScripts\Smart Layer Export.jsx" "temp\Smart Layer Export.jsx" /Y
echo f | xcopy "org.tbyrne.smartExport.mxi" "temp/org.tbyrne.smartExport.mxi" /Y
xcopy "SmartCore" "temp/SmartLayerExport" /S /Y /i
xcopy "SmartLayerExport" "temp/SmartLayerExport" /S /Y /i
xcopy "SmartSymbolExport" "temp/SmartLayerExport" /S /Y /i
java -jar build/signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore build/cert.p12 -tsa http://timestamp.digicert.com ./bin/SmartLayerExport.zxp -C ./temp/ .
rmdir temp /s /q

:: mkdir temp
:: echo f | xcopy "EntryScripts\Smart Symbol Export.jsx" "temp\Smart Symbol Export.jsx" /Y
:: echo f | xcopy "org.tbyrne.smartSymbolExport.mxi" "temp/org.tbyrne.smartSymbolExport.mxi" /Y
:: xcopy "SmartCore" "temp/SmartSymbolExport" /S /Y /i
:: xcopy "SmartSymbolExport" "temp/SmartSymbolExport" /S /Y /i
:: java -jar build/signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore build/cert.p12 -tsa http://timestamp.digicert.com ./bin/SmartSymbolExport.zxp -C ./temp/ .
:: rmdir temp /s /q


pause