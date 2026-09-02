import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out_dir = r'c:\Users\황태민\Documents\antigravity\wonderful-mendel\assets\magazine'
os.makedirs(out_dir, exist_ok=True)

font_bold = r'C:\Windows\Fonts\malgunbd.ttf'
font_reg = r'C:\Windows\Fonts\malgun.ttf'
font_serif = r'C:\Windows\Fonts\batang.ttc'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

W, H = 1760, 1240

def create_base_spread():
    # 1. Background: Warm Luxury Paper / Slate Wood tone
    im = Image.new('RGBA', (W, H), (248, 245, 238, 255))
    draw = ImageDraw.Draw(im)
    
    # Outer subtle border
    draw.rectangle([20, 20, W-20, H-20], outline=(210, 195, 175, 200), width=2)
    draw.rectangle([28, 28, W-28, H-28], outline=(180, 140, 90, 80), width=1)
    
    # Center gutter line & spine shadow
    mid = W // 2
    for offset in range(-35, 36):
        alpha = int(45 * (1 - abs(offset) / 35))
        draw.line([mid + offset, 28, mid + offset, H-28], fill=(40, 25, 10, alpha))
    draw.line([mid, 28, mid, H-28], fill=(160, 120, 75, 180), width=2)
    
    # Page Header lines
    draw.line([80, 85, mid - 60, 85], fill=(200, 180, 155, 180), width=1)
    draw.line([mid + 60, 85, W - 80, 85], fill=(200, 180, 155, 180), width=1)
    
    # Page Footer lines
    draw.line([80, H - 75, mid - 60, H - 75], fill=(200, 180, 155, 180), width=1)
    draw.line([mid + 60, H - 75, W - 80, H - 75], fill=(200, 180, 155, 180), width=1)
    
    # Footer Text
    f_foot = get_font(font_reg, 15)
    draw.text((80, H - 65), "목수의 홈케어마스터 · 30년 목수 장인 시공 기록집", fill=(130, 110, 90, 255), font=f_foot)
    draw.text((W - 320, H - 65), "직통 상담: 010-9276-4245", fill=(180, 110, 30, 255), font=f_foot)
    
    return im, draw

def place_image(im, src_path, box, corner_radius=12):
    # box: (x, y, w, h)
    x, y, w, h = box
    if not os.path.exists(src_path):
        print("Missing image:", src_path)
        return
    
    photo = Image.open(src_path).convert('RGBA')
    
    # Crop to fit aspect ratio
    pw, ph = photo.size
    target_ratio = w / h
    current_ratio = pw / ph
    
    if current_ratio > target_ratio:
        # Too wide, crop width
        new_w = int(ph * target_ratio)
        left = (pw - new_w) // 2
        photo = photo.crop((left, 0, left + new_w, ph))
    else:
        # Too tall, crop height
        new_h = int(pw / target_ratio)
        top = (ph - new_h) // 2
        photo = photo.crop((0, top, pw, top + new_h))
        
    photo = photo.resize((w, h), Image.Resampling.LANCZOS)
    
    # Rounded corner mask
    mask = Image.new('L', (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, w, h], radius=corner_radius, fill=255)
    
    # Add subtle border and paste
    border = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border)
    b_draw.rounded_rectangle([0, 0, w-1, h-1], radius=corner_radius, outline=(140, 100, 50, 160), width=2)
    
    im.paste(photo, (x, y), mask)
    im.paste(border, (x, y), mask)

print("Base generator script ready!")
