import os, glob, sys, json
import numpy as np
from PIL import Image, ImageOps
import cv2
import rembg
import torch
import scipy.ndimage as ndi
from transformers import pipeline

def process_all_5_antiques():
    base_src_dir = r"C:\Users\황태민\Documents\엔틱"
    output_root = "antique_collections"
    os.makedirs(output_root, exist_ok=True)
    
    # 5 Best Antique Collections
    collections = [
        {
            "id": "sevres_rose_box",
            "title_ko": "세브르 로즈 퐁파두르 오르몰루 힌지 보석함 (14cm)",
            "title_en": "Sèvres Rose Pompadour Ormolu Hinged Jewelry Box",
            "era": "19th Century (c.1880)",
            "origin": "France (Sèvres)",
            "material": "Rose Pompadour Porcelain & 24K Ormolu Bronze",
            "desc": "프랑스 왕실 세브르의 독보적인 로즈 퐁파두르 핑크 유약에 24K 오르몰루 브론즈 마운트와 플로럴 핸드페인팅이 결합된 최고급 힌지 주얼리 박스입니다.",
            "folder": r"06_프랑스_세브르_왕실포슬린_컬렉션\07_세브르_로즈퐁파두르_오르몰루_직사각_힌지보석함_14cm"
        },
        {
            "id": "worcester_greek_goddess",
            "title_ko": "로열우스터 1890s 고전 그리스 여인 골드 조각상 1쌍 (No. 2/57)",
            "title_en": "Royal Worcester 1890s Classical Greek Goddesses Pair",
            "era": "Victorian Period (c.1890)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory Porcelain & 24K Gilt Drapery",
            "desc": "영국 왕실 도자기 로열우스터 전성기의 블러시 아이보리 포슬린과 24K 금박 드레이퍼리가 완벽한 균형을 이루는 고전 그리스 여신 입체 조각상 1쌍입니다.",
            "folder": r"09_영국_로열우스터_왕실포슬린_컬렉션\01_로열우스터_1890s_고전그리스여인_골드조각상_1쌍_2-57"
        },
        {
            "id": "worcester_warwick_vase",
            "title_ko": "로열우스터 워릭캐슬 레이스 투각 대형 포푸리 화병 (32cm)",
            "title_en": "Royal Worcester Warwick Castle Reticulated Potpourri Vase",
            "era": "Victorian Period (c.1895)",
            "origin": "England (Grainger Royal Worcester)",
            "material": "Reticulated Pierced Fine Bone China",
            "desc": "장인의 정밀한 수작업 레이스 투각 넥과 돔 리드, 정면의 워릭 캐슬(Warwick Castle) 풍경화 및 후면 제비 세밀화가 수놓아진 32cm 대형 마스터피스입니다.",
            "folder": r"09_영국_로열우스터_왕실포슬린_컬렉션\04_로열우스터_그레인저_워릭캐슬_레이스투각_대형포푸리화병_32cm_2256"
        },
        {
            "id": "worcester_moorish_ewer",
            "title_ko": "로열우스터 빅토리안 무어풍 아라베스크 부조 초대형 골드화병 (41cm)",
            "title_en": "Royal Worcester Moorish Arabesque Gilt Pierced Ewer (41cm)",
            "era": "Victorian Period (c.1885)",
            "origin": "England (Royal Worcester)",
            "material": "Moorish Pierced Porcelain & Heavy 24K Gold Relief",
            "desc": "빅토리아 시대 이슬람 무어 양식의 정교한 아라베스크 오픈워크 투각 손잡이와 24K 금박 부조가 돋보이는 41cm 초대형 왕실 에워 화병입니다.",
            "folder": r"09_영국_로열우스터_왕실포슬린_컬렉션\07_로열우스터_빅토리안_무어풍아라베스크부조_초대형골드화병_41cm_778"
        },
        {
            "id": "sevres_blue_box",
            "title_ko": "세브르 블루 포슬린 핸드페인팅 힌지 보석함 (13cm)",
            "title_en": "Sèvres Bleu de Roi Hand-Painted Hinged Jewelry Box",
            "era": "19th Century (c.1870)",
            "origin": "France (Sèvres)",
            "material": "Bleu de Roi Porcelain, Ormolu Bronze, Floral Miniature",
            "desc": "왕의 파랑(Bleu de Roi) 에나멜과 화려한 24K 금박 스크롤, 프랑스 궁정 화원의 플로럴 부케 핸드페인팅이 어우러진 럭셔리 힌지 보석함입니다.",
            "folder": r"06_프랑스_세브르_왕실포슬린_컬렉션\05_세브르_블루포슬린_핸드페인팅_힌지_주얼리박스_13cm"
        }
    ]

    session = rembg.new_session("u2net")
    device = 0 if torch.cuda.is_available() else -1
    print("[Pipeline] Loading Depth-Anything-V2-Base model...")
    depth_pipe = pipeline(task="depth-estimation", model="depth-anything/Depth-Anything-V2-Base-hf", device=device)

    all_metadata = []
    target_w, target_h = 1536, 2048

    for c_idx, col in enumerate(collections):
        col_id = col["id"]
        col_dir = os.path.join(output_root, col_id)
        os.makedirs(col_dir, exist_ok=True)
        
        src_folder = os.path.join(base_src_dir, col["folder"])
        raw_files = sorted([f for f in os.listdir(src_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        
        print(f"\n=======================================================")
        print(f"[{c_idx+1}/5] Processing {col['title_ko']} ({len(raw_files)} photos)")
        print(f"=======================================================")

        items_meta = []

        for idx, f_name in enumerate(raw_files):
            f_path = os.path.join(src_folder, f_name)
            raw_img = Image.open(f_path)
            raw_img = ImageOps.exif_transpose(raw_img)

            # Resize to standard high resolution
            raw_resized = raw_img.resize((target_w, target_h), Image.LANCZOS)
            
            # 1. Background removal
            rgba_pil = rembg.remove(raw_resized, session=session)
            rgba_np = np.array(rgba_pil)
            r_c, g_c, b_c, a = cv2.split(rgba_np)

            # Clean tiny noise particles in alpha
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 40).astype(np.uint8))
            if num_labels > 1:
                cleaned_alpha = np.zeros_like(a)
                for l in range(1, num_labels):
                    if stats[l, cv2.CC_STAT_AREA] > 2500:
                        cleaned_alpha[labels == l] = a[labels == l]
                a = cleaned_alpha

            a = cv2.GaussianBlur(a, (3, 3), 0)
            final_rgba = cv2.merge([r_c, g_c, b_c, a])
            
            rgba_path = os.path.join(col_dir, f"rgba_{idx:02d}.png")
            Image.fromarray(final_rgba).save(rgba_path)

            # 2. Depth Anything V2 Depth Estimation
            rgb_img = Image.fromarray(cv2.merge([r_c, g_c, b_c]))
            depth_res = depth_pipe(rgb_img)
            depth_pil = depth_res["depth"]
            depth_np = np.array(depth_pil).astype(np.float32)

            valid_depth = depth_np[a > 40]
            if len(valid_depth) > 0:
                d_min = np.percentile(valid_depth, 2)
                d_max = np.percentile(valid_depth, 98)
                depth_norm = np.clip((depth_np - d_min) / (d_max - d_min + 1e-6), 0.0, 1.0)
            else:
                depth_norm = (depth_np - depth_np.min()) / (depth_np.max() - depth_np.min() + 1e-6)

            depth_u8 = (depth_norm * 255.0).astype(np.uint8)
            depth_u8[a < 30] = 0
            
            depth_path = os.path.join(col_dir, f"depth_{idx:02d}.png")
            Image.fromarray(depth_u8).save(depth_path)

            # 3. Normal map computation
            strength = 2.5
            sobel_x = ndi.sobel(depth_norm, axis=1) * strength
            sobel_y = ndi.sobel(depth_norm, axis=0) * strength

            nx = -sobel_x
            ny = -sobel_y
            nz = np.ones_like(depth_norm)
            norm = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
            nx /= norm
            ny /= norm
            nz /= norm

            nr = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)
            ng = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)
            nb = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)

            normal_rgb = np.stack([nr, ng, nb], axis=-1)
            normal_rgb[a < 30] = [128, 128, 255]

            normal_path = os.path.join(col_dir, f"normal_{idx:02d}.png")
            Image.fromarray(normal_rgb).save(normal_path)

            items_meta.append({
                "id": idx,
                "name": f"View {idx+1}",
                "rgba": f"antique_collections/{col_id}/rgba_{idx:02d}.png",
                "depth": f"antique_collections/{col_id}/depth_{idx:02d}.png",
                "normal": f"antique_collections/{col_id}/normal_{idx:02d}.png",
                "width": target_w,
                "height": target_h
            })
            print(f"  -> Generated View {idx:02d} for {col_id}")

        col_manifest = {
            "info": col,
            "photos": items_meta
        }
        manifest_path = os.path.join(col_dir, "manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(col_manifest, f, indent=2, ensure_ascii=False)
            
        all_metadata.append(col_manifest)

    # Master index of all antique collections
    master_manifest_path = os.path.join(output_root, "master_catalog.json")
    with open(master_manifest_path, "w", encoding="utf-8") as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)

    print("\n=======================================================")
    print("=== ALL 5 ANTIQUE MASTERPIECES 2.5D DATASETS COMPLETED ===")
    print("=======================================================")

if __name__ == "__main__":
    process_all_5_antiques()
