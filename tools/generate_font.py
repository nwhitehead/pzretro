'''
Generate font file for PuzzleScript given TTF font

'''

import argparse
from PIL import Image, ImageFont, ImageDraw

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--font')
    parser.add_argument('--width', type=int, default=11)
    parser.add_argument('--height', type=int, default=25)
    parser.add_argument('--baseline', type=int, default=20)
    parser.add_argument('--size', type=int, default=18)
    parser.add_argument('-o', required=True)
    args = parser.parse_args()
    chars = "0123456789abcdefghijklmnopqrstuvwx×yzABCDEFGHIJKLMNOPQRSTUVWXYZ.·•…†‡ƒ‚„,;:?¿!¡@£$%‰^&*()+÷±-–—_= {}[]'‘’“”\"/\\|¦<‹«>›»~˜`#ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßẞàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž€™¢¤¥§¨©®ªº¬¯°"
    font = ImageFont.truetype(args.font, args.size)
    with open(args.o, 'wt') as outfile:
        outfile.write('var font = {\n')
        for c in chars:
            escapedc = c
            if c == "'":
                escapedc = "\\'"
            if c == "\\":
                escapedc = "\\\\"
            outfile.write(f"'{escapedc}':'")
            image = Image.new('1', (args.width, args.height))
            draw = ImageDraw.Draw(image)
            draw.text((0, args.baseline), c, font=font, fill=1, anchor='ls')
            for y in range(args.height):
                line = ''
                for x in range(args.width):
                    line += str(image.getpixel((x, y)))
                outfile.write(f'\\n{line}')
            outfile.write("',\n")
        outfile.write('}\n')