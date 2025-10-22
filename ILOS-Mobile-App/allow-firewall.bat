@echo off
echo ========================================
echo  ILOS - Allow Firewall Access
echo  (Run as Administrator)
echo ========================================
echo.

echo Adding firewall rule for Backend Server (port 5000)...
netsh advfirewall firewall add rule name="ILOS Backend Server" dir=in action=allow protocol=TCP localport=5000
echo.

echo Adding firewall rule for Metro Bundler (port 8082)...
netsh advfirewall firewall add rule name="ILOS Metro Bundler" dir=in action=allow protocol=TCP localport=8082
echo.

echo Adding firewall rule for CNIC API (port 8001)...
netsh advfirewall firewall add rule name="ILOS CNIC API" dir=in action=allow protocol=TCP localport=8001
echo.

echo Adding firewall rule for Payslip API (port 8003)...
netsh advfirewall firewall add rule name="ILOS Payslip API" dir=in action=allow protocol=TCP localport=8003
echo.

echo ========================================
echo  Firewall rules added successfully!
echo  Now reload the mobile app.
echo ========================================
echo.

pause

