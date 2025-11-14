# Banking Design System - Professional Standards

## **Color Palette**

### **Primary Colors (Conservative Banking)**
```css
--banking-navy: #1e3a5f;        /* Primary - Professional Navy */
--banking-slate: #475569;        /* Secondary - Slate Gray */
--banking-charcoal: #334155;     /* Text Primary */
--banking-gray: #64748b;         /* Text Secondary */
```

### **Neutral Colors**
```css
--banking-white: #ffffff;
--banking-light-gray: #f8fafc;  /* Background */
--banking-border: #e2e8f0;      /* Borders */
--banking-divider: #cbd5e1;     /* Section dividers */
```

### **Status Colors (Muted)**
```css
--banking-success: #059669;     /* Success - Muted Green */
--banking-warning: #d97706;     /* Warning - Muted Amber */
--banking-error: #dc2626;       /* Error - Muted Red */
--banking-info: #0284c7;        /* Info - Muted Blue */
```

## **Typography**

### **Font Family**
```css
font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif;
```

### **Font Sizes**
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
```

### **Font Weights**
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## **Spacing**

### **Container Padding**
```css
--container-padding: 2rem;      /* Desktop */
--container-padding-mobile: 1rem; /* Mobile */
```

### **Section Spacing**
```css
--section-gap: 2rem;            /* Between sections */
--field-gap: 1rem;              /* Between fields */
--group-gap: 1.5rem;            /* Between field groups */
```

## **Components**

### **Section Headers**
```css
/* Professional section header */
.section-header {
  background: #f8fafc;
  border-left: 4px solid #1e3a5f;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 0; /* No rounded corners for sections */
}
```

### **Input Fields**
```css
/* Standard input field */
.input-field {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 0.875rem; /* 10px 14px */
  font-size: 0.875rem;
  color: #334155;
  border-radius: 0.25rem; /* Subtle 4px radius */
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #1e3a5f;
  box-shadow: 0 0 0 1px #1e3a5f;
}
```

### **Buttons**
```css
/* Primary button */
.btn-primary {
  background: #1e3a5f;
  color: white;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2d4a6f;
}

/* Secondary button */
.btn-secondary {
  background: white;
  color: #1e3a5f;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border: 1px solid #1e3a5f;
  border-radius: 0.25rem;
  cursor: pointer;
}
```

### **Cards/Containers**
```css
.card-container {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 0.25rem; /* Subtle radius */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Very subtle shadow */
}
```

## **Layout Principles**

### **1. Whitespace**
- Generous padding around all elements
- Clear visual hierarchy
- No cramped spacing

### **2. Grid System**
```css
/* 2-column grid for forms */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
}
```

### **3. Alignment**
- Left-align all text (banking standard)
- Right-align numeric fields
- Center-align buttons/actions

### **4. Visual Hierarchy**
```
Page Title (24px, Bold, Navy)
  ↓
Section Header (18px, Semibold, Slate, Left Border)
  ↓
Field Label (14px, Medium, Gray)
  ↓
Input Field (14px, Regular, Charcoal)
  ↓
Helper Text (12px, Regular, Light Gray)
```

## **No-No's (Avoid These)**

### ❌ **Don't Use:**
1. **Bright Colors** - No teal, lime, orange, purple
2. **Gradients** - No gradient backgrounds
3. **Rounded Corners >8px** - Keep it subtle (4px max)
4. **Emojis** - No 💡 ✨ 🎉 in professional forms
5. **Playful Language** - No "Let's get started!" or "Magic!"
6. **Icons Everywhere** - Use sparingly, only when necessary
7. **Colored Backgrounds** - Stick to white/light gray
8. **Multiple Font Weights** - Stick to 400, 500, 600
9. **Box Shadows >2px** - Very subtle shadows only
10. **Animations** - Minimal, professional transitions only

### ✅ **Do Use:**
1. **Navy & Gray** - Professional palette
2. **Flat Colors** - Solid, muted tones
3. **Subtle Corners** - 4px border-radius
4. **Clear Labels** - Descriptive, formal language
5. **Professional Icons** - Document, User, Building icons only
6. **White Space** - Generous padding and margins
7. **Clear Hierarchy** - Size, weight, and spacing
8. **Left Borders** - For section indicators
9. **Grid Layouts** - Clean, organized columns
10. **Professional Tone** - Formal, clear, trustworthy

## **Example Comparisons**

### **Before (Too Colorful)**
```jsx
<div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-xl">
  ✨ Section 1: Personal Information
</div>
```

### **After (Professional)**
```jsx
<div className="bg-gray-50 border-l-4 border-navy-800 px-6 py-4">
  <h3 className="text-lg font-semibold text-slate-700">
    Section 1: Personal Information
  </h3>
</div>
```

### **Before (Too Playful)**
```jsx
<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <strong>Note:</strong> Fields highlighted in yellow are pre-filled! 🎉
</div>
```

### **After (Professional)**
```jsx
<div className="px-4 py-3 bg-slate-50 border-l-2 border-slate-400">
  <p className="text-sm text-slate-600">
    <strong>Note:</strong> Pre-filled fields are indicated with a light background.
  </p>
</div>
```

## **Banking Form Standards**

### **Field Labels**
- Always above the input
- 14px, Medium weight
- Gray color (#64748b)
- Required fields: Red asterisk (*)

### **Input Fields**
- 14px font size
- White background
- 1px gray border
- 4px border radius
- 10px vertical padding
- Full width of grid column

### **Section Headers**
- 18px font size
- Semibold weight
- Left border accent (4px)
- Light gray background
- 16px vertical padding

### **Spacing Between Sections**
- 32px (2rem) minimum
- Clear visual separation
- No colored dividers

### **Tables**
- White background
- 1px gray borders
- Alternating row colors (very subtle)
- No hover effects (professional)

## **Implementation Checklist**

- [ ] Remove all gradient backgrounds
- [ ] Replace teal/lime/orange with navy/gray
- [ ] Change border-radius from 12px/16px to 4px
- [ ] Remove all emojis from labels
- [ ] Update section headers (flat design, left border)
- [ ] Standardize input field styling
- [ ] Update button styles (navy primary, white secondary)
- [ ] Fix spacing (more whitespace)
- [ ] Remove playful language
- [ ] Add proper field labels
- [ ] Standardize colors across all forms
- [ ] Remove colored info boxes (use gray)
- [ ] Update success/error messages (muted colors)
- [ ] Fix table styling (professional)
- [ ] Remove icon clutter

## **Tailwind CSS Classes**

### **Updated Mappings**
```
Old: bg-primary → New: bg-slate-700
Old: text-primary → New: text-slate-700
Old: from-primary to-blue-600 → New: bg-slate-50
Old: rounded-xl → New: rounded
Old: p-4 → New: px-6 py-4
Old: border-2 → New: border
Old: bg-yellow-50 → New: bg-slate-50
Old: border-yellow-200 → New: border-slate-300
```

