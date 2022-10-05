'''
Download a PuzzleScript game

Given URL to play game on PuzzleScript, this script downloads source and saves to a file.

'''

import argparse
import codecs
import re
import requests

ESCAPE_SEQUENCE_RE = re.compile(r'''
    ( \\U........      # 8-digit hex escapes
    | \\u....          # 4-digit hex escapes
    | \\x..            # 2-digit hex escapes
    | \\[0-7]{1,3}     # Octal escapes
    | \\N\{[^}]+\}     # Unicode characters by name
    | \\[\\'"abfnrtv]  # Single-character escapes
    )''', re.UNICODE | re.VERBOSE)

def decode_escapes(s):
    ''' Decode Python escape sequences in a string containing unicode '''
    # Basic problem is that decode with unicode-escape is broken in Python, doesn't work with unicode
    # So only apply to actual escape parts, which are guaranteed to be just ascii
    def decode_match(match):
        return codecs.decode(match.group(0), 'unicode-escape')
    return ESCAPE_SEQUENCE_RE.sub(decode_match, s)

def find_title(content):
    lines = content.split('\n')
    for line in lines:
        spl = line.split(' ')
        if spl[0].upper() == 'TITLE':
            return ' '.join(spl[1:])
    raise RuntimeError("Could not find title in prelude")

def convert_dangerous(txt):
    txt = txt.replace('-', '_')
    txt = txt.replace(' ', '_')
    txt = txt.replace("'", '_')
    return txt

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Download PuzzleScript game source files')
    parser.add_argument('--url', required=True, help="URL for playing game on PuzzleScript.net or itch.io")
    parser.add_argument('--output', help="Output filename to save game contents to (if not given will display to stdout)")
    parser.add_argument('--output-title', help="Save to filename given prefixed with game title")
    args = parser.parse_args()
    if "itch.io" in args.url:
        # For itch.io downloads, first get contents
        r = requests.get(args.url)
        # Search for cdn link to game itself
        m = re.search(r'(https://\S+\.hwcdn.net/\S+/index.html)', r.text)
        if not m:
            print('Could not find hwcdn link')
            exit(-1)
        # Get contents of cdn link
        cdn_url = m.group(0)
        r = requests.get(cdn_url)
        text = r.content.decode('utf-8')
        # Regex looks for the sourcecode, inside quotes allowing escapes inside string
        pat = r'''sourceCode="([^"\\]*(\\.[^"\\]*)*)"'''
        m = re.search(pat, text)
        if m is None:
            # Try minified version
            mpat = r'''compile\(-1, "([^"\\]*(\\.[^"\\]*)*)"'''
            m = re.search(mpat, text)
            if m is None:
                print("Could not find sourceCode in cdn result")
                exit(-1)
        source = m.group(1)
        # We have the source in escaped form, need to unescape it (allowing unicode)
        content = decode_escapes(source)
    else:
        spl = args.url.split('=')
        if len(spl) < 2:
            print("ERROR: Could not parse URL, must be in form: https://www.puzzlescript.net/play.html?p=IDENTIFIER")
            exit(-1)
        id = spl[-1]
        dl_url = f"https://api.github.com/gists/{id}"
        r = requests.get(dl_url)
        data = r.json()
        content = data['files']['script.txt']['content']
    if args.output_title:
        title = find_title(content)
        safe_title = convert_dangerous(title)
        args.output = f"{safe_title}{args.output_title}"
    if args.output:
        with open(args.output, "w") as fout:
            fout.write(content)
        print(f"Wrote {len(content)} bytes of output to file: {args.output}")
    else:
        print(content)
