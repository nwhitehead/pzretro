'''
Reorganize Phil Schatz's PuzzleScript repository games into separate .pz files

'''

import argparse
import os

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Copy script files into separate .pz files')
    parser.add_argument('--inpath', help='Location that contains directories containing script.txt PuzzleScript files')
    parser.add_argument('--outpath')
    args = parser.parse_args()
    for f in os.listdir(args.inpath):
        fullpath = os.path.join(args.inpath, f)
        if os.path.isdir(fullpath):
            outpath = os.path.join(args.outpath, f + '.pz')
            outpath = outpath.replace('-', '_')
            scriptfile = os.path.join(fullpath, 'script.txt')
            try:
                with open(scriptfile, 'r') as fin:
                    contents = fin.read()
                    with open(outpath, 'w') as fout:
                        fout.write(contents)
            except FileNotFoundError:
                print(f'Error converting {fullpath}')
