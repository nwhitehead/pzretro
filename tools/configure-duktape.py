
import argparse
import subprocess
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--duktape')
    parser.add_argument('--outpath')
    args = parser.parse_args()
    subprocess.run(['python2', args.duktape + '/tools/configure.py', '--output-directory', args.outpath])
