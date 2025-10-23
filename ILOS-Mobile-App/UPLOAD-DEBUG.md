# Upload Debugging

## Current Status:
- ✅ Can view documents from port 8081
- ❌ Cannot upload documents to port 8081
- ✅ Port forwarding done: `adb reverse tcp:8081 tcp:8081`
- ✅ Document server running

## Upload Request Format (Mobile App Sends):

```javascript
POST http://192.168.1.155:8081/upload

FormData:
- losId: "26" (numeric)
- loanType: "CashPlus"
- document_type: "investigation_photo"
- file: { uri: "...", name: "37.jpg", type: "image/jpeg" }

Headers:
- Content-Type: multipart/form-data
- Accept: application/json
```

## Document Server Expects:

```javascript
POST /upload

FormData:
- losId or los_id: "26"
- loanType or loan_type: "CashPlus"
- file: (the actual file)
```

## Debugging Steps:

### 1. Check Document Server Logs
When you try to upload, the document server terminal should show:
```
🔄 Upload server: Received upload request
🔄 Upload server: Request body: { losId: '26', loanType: 'CashPlus', ... }
```

**If you DON'T see this**, the request isn't reaching the server (network issue).
**If you see an error**, share the error message.

### 2. Test with Postman/cURL
Try uploading directly to test the endpoint:
```powershell
curl -X POST http://localhost:8081/upload `
  -F "losId=26" `
  -F "loanType=CashPlus" `
  -F "file=@C:\path\to\test.jpg"
```

Should return:
```json
{
  "success": true,
  "message": "File uploaded successfully"
}
```

### 3. Check Firewall
Windows Firewall might be blocking port 8081:
```powershell
# Allow port 8081
netsh advfirewall firewall add rule name="Node 8081" dir=in action=allow protocol=TCP localport=8081
```

### 4. Verify Port is Listening
```powershell
netstat -an | findstr :8081
# Should show: TCP 0.0.0.0:8081 LISTENING
```

## Next Step:
**Share the document server terminal output** when you try to upload. That will tell us exactly what's wrong!

