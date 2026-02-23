from PIL import Image
import numpy as np

END = "1111111111111110"

def extract_data(image_path):
    img = Image.open(image_path).convert("RGB")
    arr = np.array(img)

    bits = ""
    for row in arr:
        for pixel in row:
            for i in range(3):
                bits += str(pixel[i] & 1)

    bits = bits[:bits.find(END)]

    data = bytearray()
    for i in range(0, len(bits), 8):
        data.append(int(bits[i:i+8], 2))

    return bytes(data)