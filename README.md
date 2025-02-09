# speechef.core
---

## **🚀 Project Setup Guide**

### **📌 Prerequisites**
Before setting up the project, ensure you have **Python** installed on your system. You can check by running:  
```sh
python3 --version
```
If Python is not installed, download it from [Python's official website](https://www.python.org/downloads/).

---

## **🔧 Installation Steps**

### **1️⃣ Install Python (MacOS)**
If you are using macOS, install Python via **Homebrew** (recommended):  
```sh
brew install python
```

---

### **2️⃣ Create a Virtual Environment**
Set up an isolated environment for your project to avoid dependency conflicts:  
```sh
python3 -m venv .venv
```

---

### **3️⃣ Activate the Virtual Environment**
Once the virtual environment is created, activate it:

- **MacOS/Linux:**
  ```sh
  source .venv/bin/activate
  ```
- **Windows (PowerShell):**
  ```sh
  .venv\Scripts\Activate
  ```

You should now see `(.venv)` at the beginning of your terminal prompt.

---

### **4️⃣ Install Dependencies**
Install the required Python packages from `requirements.txt`:
```sh
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

### **5️⃣ Start the Development Server**
Run the following command to start the Django development server:
```sh
python manage.py runserver
```
By default, the server will be available at: **http://127.0.0.1:8000/**.

---

## **🎯 Additional Commands**
- **Deactivate the virtual environment:**
  ```sh
  deactivate
  ```
- **Check installed dependencies:**
  ```sh
  pip freeze
  ```

---

## **📜 Notes**
- Ensure you have **Python 3.11 or later** installed.
- If `requirements.txt` installation fails, try upgrading pip:
  ```sh
  python -m pip install --upgrade pip
  ```
- If using **Windows**, ensure you run commands in a **PowerShell terminal** with admin privileges.

---