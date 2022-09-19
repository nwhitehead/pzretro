
import argparse
import subprocess
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--config')
    parser.add_argument('--inpath')
    parser.add_argument('--outpath')
    args = parser.parse_args()
    subprocess.run(['npx', 'babel', '--config-file', args.config, args.inpath, '--out-dir', args.outpath])
