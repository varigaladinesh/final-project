from PIL import Image
import numpy as np

END = "1111111111111110"

def embed_data(image_path, data: bytes, out_path):
    img = Image.open(image_path).convert("RGB")
    arr = np.array(img)

    binary = "".join(format(b, "08b") for b in data) + END
    idx = 0

    for row in arr:
        for pixel in row:
            for i in range(3):
                if idx < len(binary):
                    pixel[i] = (pixel[i] & 0b11111110) | int(binary[idx])
                    idx += 1

    Image.fromarray(arr).save(out_path)

def max_capacity(image_path):
    img = Image.open(image_path)
    w, h = img.size
    return (w * h * 3) // 8