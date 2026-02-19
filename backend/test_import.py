import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

with open("import_result.txt", "w") as f:
    try:
        from routes import auth
        from main import app
        f.write("IMPORT SUCCESS")
    except Exception as e:
        import traceback
        f.write(f"IMPORT ERROR: {e}\n")
        traceback.print_exc(file=f)
