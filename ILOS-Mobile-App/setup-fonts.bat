@echo off
echo Setting up React Native Vector Icons fonts...

REM Create assets directory
if not exist "android\app\src\main\assets\fonts" mkdir "android\app\src\main\assets\fonts"

REM Copy MaterialIcons font
copy "node_modules\react-native-vector-icons\Fonts\MaterialIcons.ttf" "android\app\src\main\assets\fonts\"

echo Fonts copied successfully!
echo Please rebuild your app with: npx react-native run-android
pause 