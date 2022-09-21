'''
Simple python script to download a single file from a URL

'''

import argparse
import os
import subprocess
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url')
    parser.add_argument('--output')
    parser.add_argument('--xzuncompress', action='store_true')
    parser.add_argument('--untar', action='store_true')
    args = parser.parse_args()
    subprocess.run(['wget', args.url, '-O', args.output])
    if args.xzuncompress:
        subprocess.run(['xz', '--uncompress', args.output])
        args.output = args.output.rstrip('.xz')
    if args.untar:
        subprocess.run(['tar', 'xvf', args.output, '--directory', os.path.basename(args.output)])
