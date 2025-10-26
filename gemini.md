# Gemini AI Task: Enhance AppLauncher with Marge Agent & Mini-Apps

**Your Role:** You are an expert React developer specializing in modern UI/UX with `framer-motion` and Tailwind CSS.

**The Goal:** Enhance the `AppLauncher.jsx` component by introducing a new, complex "Marge" agent that contains its own set of "AI mini-apps" (sub-agents), while strictly adhering to the established `UiAmrikyy` design language.

---

### 1. Project Context & File Locations

- **Primary File to Modify:** `frontend/src/pages/AppLauncher.jsx`
- **New File to Create:** `frontend/src/components/MargeModal.jsx`

The primary file, `AppLauncher.jsx`, already has a modern, glassmorphism-style UI built with `framer-motion` and Tailwind CSS. Your task is to extend its functionality without disrupting the existing design.

---

### 2. The Core Task: Introduce the "Marge" Agent

Your main task is to add a new agent named "Marge" to the launcher. Marge is a "mother" agent that houses several smaller, specialized AI mini-apps. Clicking on Marge should open a modal dialog displaying these mini-apps.

---

### 3. Detailed Implementation Steps

#### Step 1: Modify `frontend/src/pages/AppLauncher.jsx`

1.  **Import New Icons & Components:**
    - Import the necessary icons for Marge and its sub-agents from `lucide-react` (e.g., `LayoutGrid`, `Megaphone`, `Code`, `Mail`).
    - Import the new modal component you will create: `import MargeModal from '../components/MargeModal';`.

2.  **Add State for Modal:**
    - Create a state variable to manage the modal's visibility and store the selected agent data.

    ```javascript
    const [margeModalOpen, setMargeModalOpen] = useState(false);
    ```

3.  **Update the `apps` Array:**
    - Add the following object for the "Marge" agent to the `apps` array:

    ```javascript
    {
      id: "marge",
      title: "Marge",
      titleAr: "مارج",
      subtitle: "AI App Ecosystem",
      description: "A collection of specialized AI mini-apps to streamline your workflow and boost productivity.",
      icon: LayoutGrid, // Or another suitable icon
      gradient: "from-amber-500 to-red-500",
      features: ["Mini-Apps", "Productivity", "Ecosystem"],
      status: "Available",
    }
    ```

4.  **Update the `handleLaunch` Function:**
    - Modify the logic to check if the clicked app is "marge". If it is, open the modal instead of logging to the console.

    ```javascript
    const handleLaunch = (appId) => {
      const app = apps.find((a) => a.id === appId);
      if (app && app.status === 'Available') {
        if (app.id === 'marge') {
          setMargeModalOpen(true);
        } else {
          console.log(`Launching ${app.title}...`);
          // Existing launch logic here
        }
      }
    };
    ```

5.  **Render the Modal:**
    - Add the `MargeModal` component at the end of the main `div`, controlling its presence with `AnimatePresence` from `framer-motion`.
    ```jsx
    // ... inside the return statement, after the main content div
    <AnimatePresence>
      {margeModalOpen && <MargeModal onClose={() => setMargeModalOpen(false)} />}
    </AnimatePresence>
    ```

#### Step 2: Create `frontend/src/components/MargeModal.jsx`

Create this new file with the following content. It should define the modal's structure, styling, and animations.

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Code, Mail, X } from 'lucide-react';

const subAgents = [
  {
    title: 'Content Creator',
    description: 'Generate engaging marketing copy, social media posts, and articles.',
    icon: Megaphone,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'Code Assistant',
    description: 'Get help with code snippets, debugging, and technical explanations.',
    icon: Code,
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    title: 'Email Helper',
    description: 'Draft professional emails, summarize threads, and manage your inbox.',
    icon: Mail,
    gradient: 'from-purple-500 to-pink-500',
  },
];

const MargeModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-slate-800/50 border border-white/20 rounded-3xl w-full max-w-4xl p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">Marge's Mini-Apps</h2>
          <p className="text-white/70 mt-2">Your AI-powered productivity suite.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subAgents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br ${agent.gradient}`}
              >
                <agent.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{agent.title}</h3>
              <p className="text-sm text-white/60 mt-1">{agent.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MargeModal;
```

---

### 4. Final Output

Please apply the changes to `AppLauncher.jsx` and create the new `MargeModal.jsx` file as described. The final result should be a fully functional launcher where the new Marge agent opens the modal, and all other agents function as before. Ensure the UI remains fluid and responsive.
