cd ../
rmdir temp /s /q
mkdir temp
echo f | xcopy "Smart Layer Export.jsx" "temp/Smart Layer Export.jsx" /Y
echo f | xcopy "org.tbyrne.smartExport.mxi" "temp/org.tbyrne.smartExport.mxi" /Y
xcopy "SmartLayerExport" "temp/SmartLayerExport" /S /Y /i
java -jar build/signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore build/cert.p12 -tsa https://timestamp.geotrust.com/tsa ./bin/SmartLayerExport.zxp -C ./temp/ .
rmdir temp /s /q
pause