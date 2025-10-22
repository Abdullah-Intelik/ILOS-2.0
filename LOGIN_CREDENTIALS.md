# 🔐 **ILOS Login Credentials**

## ✅ **Web Application - Auto-Fill Credentials**

When you select a department/role on the login page, the username and password fields will **automatically fill** with default credentials.

### **Default Credentials by Department:**

| Department | Username | Password |
|------------|----------|----------|
| **Personal Banking (PB)** | `PB` | `pb123400` |
| **Sales Processing Unit (SPU)** | `SPU` | `spu123400` |
| **SPU Officer** | `SPU_OFFICER` | `spu_officer123400` |
| **Consumer Operations (COPS)** | `COPS` | `cops123400` |
| **External Asset Management Head** | `EAMVU` | `eamvu123400` |
| **EAM Officer** | `EAMVU_OFFICER` | `eamvu_officer123400` |
| **Central Investigation Unit (CIU)** | `CIU` | `ciu123400` |
| **Rejection Review Unit (RRU)** | `RRU` | `rru123400` |
| **Risk Management** | `RISK` | `risk123400` |
| **Compliance Department** | `COMPLIANCE` | `compliance123400` |

---

## 📱 **Mobile App (EAMVU Officers)**

### **Test Agent Credentials:**

| Agent ID | Agent Name | Password |
|----------|------------|----------|
| `agent-001` | Ahmad Hassan | `001` |
| `agent-002` | Fatima Ali | `002` |
| `agent-003` | Muhammad Khan | `003` |
| `agent-004` | Aisha Sheikh | `004` |
| `agent-005` | Sara Ahmed | `005` |

---

## 🎯 **How to Use Web Login:**

1. Open web app login page: `http://localhost:3000/login`
2. **Select any department** from the dropdown
3. ✨ **Username and password will auto-fill!**
4. Click **"Sign In"**
5. Done! 🎉

---

## 📝 **Notes:**

- Web credentials auto-fill **immediately** when you select a role
- You can manually edit the credentials if needed
- All departments follow the pattern: `DEPT_NAME` / `dept_name123400`
- Mobile app uses simple numeric passwords (`001`, `002`, etc.)

---

## 🚀 **Quick Access:**

**Most Common Logins:**

### **For PB Dashboard:**
- Username: `PB`
- Password: `pb123400`
- Role: Personal Banking (PB)
- URL: `http://localhost:3000/dashboard/pb/applications`

### **For SPU Dashboard:**
- Username: `SPU`
- Password: `spu123400`
- Role: Sales Processing Unit (SPU)
- URL: `http://localhost:3000/dashboard/spu`

### **For EAMVU Head:**
- Username: `EAMVU`
- Password: `eamvu123400`
- Role: External Asset Management Head
- URL: `http://localhost:3000/dashboard/eamvu`

---

## ✅ **Security Note:**

These are **default test credentials** for development. In production:
- Use proper authentication system
- Hash passwords with bcrypt
- Implement role-based access control (RBAC)
- Add session management
- Enable 2FA for sensitive departments

---

**Last Updated:** October 20, 2025

