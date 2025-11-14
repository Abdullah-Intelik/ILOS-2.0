# Customer App Port Forwarding Guide

## ✅ Correct Port Forwarding Commands

```cmd
adb reverse tcp:5000 tcp:5000   # Backend API V2.0
adb reverse tcp:8086 tcp:8086   # Document Server (changed from 8081)
adb reverse tcp:8081 tcp:8081   # Metro Bundler (Customer App)
```

---

## 📊 Port Usage Summary

| Port | Service | Used By |
|------|---------|---------|
| **5000** | Backend API V2.0 | Customer App API calls |
| **8081** | Metro Bundler | Customer App development |
| **8086** | Document Server | Document uploads/downloads |

---

## 🔧 Quick Setup

### If Metro is already running on 8081:
```cmd
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8081 tcp:8081
```

### If Metro is running on a different port (8083):
```cmd
# Find which port Metro is using (check Metro terminal)
# Then forward that port
adb reverse tcp:8083 tcp:8083
```

---

## 🧪 Verify Port Forwarding

```cmd
adb reverse --list
```

**Should show:**
```
tcp:5000 tcp:5000
tcp:8081 tcp:8081
tcp:8086 tcp:8086
```

---

## ⚠️ Common Issues

### Issue: Network Error when logging in
**Cause:** Port 5000 not forwarded  
**Fix:** `adb reverse tcp:5000 tcp:5000`

### Issue: Document upload fails
**Cause:** Port 8086 not forwarded  
**Fix:** `adb reverse tcp:8086 tcp:8086`

### Issue: App can't connect to Metro
**Cause:** Metro port not forwarded  
**Fix:** `adb reverse tcp:8081 tcp:8081` (or whatever port Metro is using)

---

## 🔄 Reset Port Forwarding

```cmd
# Remove all forwards
adb reverse --remove-all

# Set up fresh
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8086 tcp:8086
adb reverse tcp:8081 tcp:8081
```

---

## 📝 Notes

- **Metro Bundler** (Customer App) uses port **8081** by default
- **Metro Bundler** (Mobile App) uses port **8082** by default
- **Document Server** moved from **8081** to **8086** (avoid conflict)
- If you see Metro starting on **8083**, it means **8081** and **8082** are occupied

---

**When in doubt, run:** `adb reverse --list` to see what's currently forwarded!

