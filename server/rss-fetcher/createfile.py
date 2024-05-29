# get the number of files in this directory
import os

num_of_files = len([name for name in os.listdir('.') if os.path.isfile(name)])

with open(f"file{num_of_files}.txt", "w") as f:
    f.write(f"Hello, {num_of_files*num_of_files}\n")