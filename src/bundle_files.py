'''
Bundle any number of files into one generated C include header with xxd.

'''

import argparse
import os
import subprocess
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Bundle sources into one generated output C header file')
    parser.add_argument('--inpath')
    parser.add_argument('--out')
    parser.add_argument('sources', nargs='+')
    args = parser.parse_args()
    with open(args.out, 'wb') as fout:
        if args.inpath:
            os.chdir(args.inpath)
        out = bytes()
        for source in args.sources:
            result = subprocess.run(["xxd", "-i", source], capture_output=True)
            out += result.stdout
        fout.write(out)
