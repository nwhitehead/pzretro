
import subprocess
import sys

subprocess.run(['npx', 'babel', sys.argv[1], '--out-dir', sys.argv[2]])
