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
    scale = 3
    colors = 5
    colormap = "02341"
    font = ImageFont.truetype(args.font, args.size * scale)
    with open(args.o, 'wt') as outfile:
        outfile.write('var font = {\n')
        for c in chars:
            escapedc = c
            if c == "'":
                escapedc = "\\'"
            if c == "\\":
                escapedc = "\\\\"
            outfile.write(f"'{escapedc}':'")
            image = Image.new('L', (args.width * scale, args.height * scale))
            draw = ImageDraw.Draw(image)
            draw.text(((args.width * scale) // 2, args.baseline * scale), c, font=font, fill=255, anchor='ms')
            image = image.resize((args.width, args.height), resample=Image.LANCZOS)
            for y in range(args.height):
                line = ''
                for x in range(args.width):
                    pixel = image.getpixel((x, y))
                    pixel = (pixel * colors) // 256
                    line += colormap[pixel]
                outfile.write(f'\\n{line}')
            outfile.write("',\n")
        outfile.write('}\n')
