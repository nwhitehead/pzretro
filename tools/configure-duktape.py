
import argparse
import subprocess
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--duktape')
    parser.add_argument('--outpath')
    parser.add_argument('--option', action='append')
    args = parser.parse_args()
    cmdargs = ['python2', args.duktape + '/tools/configure.py', '--output-directory', args.outpath] + args.option
    print(' '.join(cmdargs))
    subprocess.run(cmdargs)
