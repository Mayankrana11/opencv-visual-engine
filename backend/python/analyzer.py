import cv2
import numpy as np
from PIL import Image
import sys
import json
import os

def calculate_sharpness(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def analyze_image(image_path):
    try:
        # Load image with Pillow for metadata
        with Image.open(image_path) as img:
            width, height = img.size
            format_type = img.format

        # Load image with OpenCV for processing
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image with OpenCV")

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # 1. Resolution & Quality
        megapixels = (width * height) / 1_000_000
        # Score: 100 for >= 12MP, linear decrease to 0 at 1MP
        res_score = max(0, min(100, (megapixels - 1) * (100 / 11)))

        # 2. Aspect Ratio
        # Instagram formats: 1:1 (Square), 4:5 (Portrait), 1.91:1 (Landscape)
        actual_ratio = width / height
        ratios = {
            "square": 1.0,
            "portrait": 0.8, # 4/5
            "landscape": 1.91
        }

        # Find the closest match
        best_match_diff = min(abs(actual_ratio - r) for r in ratios.values())
        # Score based on proximity to any common ratio
        ratio_score = max(0, 100 - (best_match_diff * 100))

        # 3. Sharpness
        sharpness_val = calculate_sharpness(image_path)
        # Normalization for sharpness is tricky; usually > 100 is decent
        # Score: 100 for >= 500, linear decrease to 0 at 50
        sharpness_score = max(0, min(100, (sharpness_val - 50) * (100 / 450)))

        # 4. Brightness & Contrast
        brightness = np.mean(gray)
        # Ideal brightness around 127
        brightness_score = max(0, 100 - abs(brightness - 127) * 0.8)

        contrast = gray.std()
        # Ideal contrast usually > 50
        contrast_score = max(0, min(100, contrast * 2))

        # Average technical quality
        technical_quality = (res_score + sharpness_score + brightness_score + contrast_score) / 4

        return {
            "metrics": {
                "width": width,
                "height": height,
                "megapixels": round(megapixels, 2),
                "format": format_type,
                "aspect_ratio": round(actual_ratio, 2),
                "sharpness": round(sharpness_val, 2),
                "brightness": round(brightness, 2),
                "contrast": round(contrast, 2)
            },
            "scores": {
                "technical_quality": round(technical_quality, 1),
                "aspect_ratio_compatibility": round(ratio_score, 1),
                "sharpness_score": round(sharpness_score, 1)
            }
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = analyze_image(image_path)
    print(json.dumps(result))
