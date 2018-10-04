
cd ../
FOR /D %%G in ("Version_*") DO call "build\BuildSingle CS.bat" %%G

FOR /D %%G in ("Version_*") DO call "build\BuildSingle CC.bat" %%G

pause