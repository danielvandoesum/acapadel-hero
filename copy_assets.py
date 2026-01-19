import os
import shutil
import glob

# Source and Destination
source_dir = r"C:\Users\danie\OneDrive - pragmatiQ B.V\Bureaublad\Aca-padel"
dest_dir = r"c:\Users\danie\.gemini\antigravity\playground\aca-padel-webshop\assets\sequence"

# Ensure destination exists
if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)
    print(f"Created directory: {dest_dir}")

# Get all jpg files
files = sorted(glob.glob(os.path.join(source_dir, "*.jpg")))

print(f"Found {len(files)} files.")

# Copy and rename
for i, file_path in enumerate(files):
    dest_path = os.path.join(dest_dir, f"frame_{i}.jpg")
    shutil.copy2(file_path, dest_path)
    if i % 50 == 0:
        print(f"Copied frame {i}: {os.path.basename(file_path)} -> frame_{i}.jpg")

print("Done.")
