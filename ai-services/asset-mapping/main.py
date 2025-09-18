# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.responses import StreamingResponse
# import cv2
# import numpy as np
# import io

# app = FastAPI(title="Land Asset Segmentation API")

# def segment_image_cv(img: np.ndarray):
#     """Simple rule-based segmentation for forest, water, soil, buildings.
#     Returns segmented overlay and percentage stats.
#     """
#     img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#     hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
#     h, w, _ = img.shape
#     total_pixels = h * w

#     # split channels for NDVI-like
#     b, g, r = cv2.split(img_rgb)
#     ndvi_like = (g.astype(float) - r.astype(float)) / (g + r + 1e-5)

#     # forest (green + high variance)
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
#     lap_abs = cv2.convertScaleAbs(lap)
#     smoothness = cv2.blur(lap_abs, (15, 15))

#     lower_green = np.array([35, 20, 20])
#     upper_green = np.array([100, 255, 255])
#     green_mask = cv2.inRange(hsv, lower_green, upper_green)

#     forest_mask = cv2.bitwise_and(green_mask, (smoothness > 15).astype(np.uint8) * 255)
#     water_mask = cv2.bitwise_and(green_mask, (smoothness <= 15).astype(np.uint8) * 255)

#     soil_mask = cv2.inRange(
#         hsv, np.array([10, 60, 60]), np.array([30, 255, 200])
#     )

#     edges = cv2.Canny(gray, 80, 200)
#     bright_gray = cv2.inRange(
#         hsv, np.array([0, 0, 100]), np.array([180, 80, 255])
#     )
#     mask_building = cv2.bitwise_and(
#         bright_gray, (edges > 0).astype(np.uint8) * 255
#     )

#     # combine into overlay
#     segmentation = np.zeros_like(img_rgb)
#     segmentation[forest_mask > 0] = (0, 255, 0)  # Forest
#     segmentation[water_mask > 0] = (0, 200, 200)  # Water (cyan-green)
#     segmentation[soil_mask > 0] = (180, 120, 50)  # Soil (brown)
#     segmentation[mask_building > 0] = (255, 0, 0)  # Buildings (red)

#     overlay = cv2.addWeighted(img_rgb, 0.6, segmentation, 0.4, 0)

#     # --- calculate pixel percentages ---
#     stats = {
#         "forest": int(np.count_nonzero(forest_mask) / total_pixels * 100),
#         "water": int(np.count_nonzero(water_mask) / total_pixels * 100),
#         "soil": int(np.count_nonzero(soil_mask) / total_pixels * 100),
#         "buildings": int(np.count_nonzero(mask_building) / total_pixels * 100),
#     }

#     return cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR), stats
# # def segment_image_cv(img: np.ndarray) -> np.ndarray:
# #     """simple rule-based segmentation for forest, water, soil, buildings."""

# #     img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
# #     hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# #     h, w, _ = img.shape

# #     # split channels for NDVI-like
# #     b, g, r = cv2.split(img_rgb)
# #     ndvi_like = (g.astype(float) - r.astype(float)) / (g + r + 1e-5)

# #     # forest (green + high variance)
# #     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# #     lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
# #     lap_abs = cv2.convertScaleAbs(lap)
# #     smoothness = cv2.blur(lap_abs, (15, 15))

# #     lower_green = np.array([35, 20, 20])
# #     upper_green = np.array([100, 255, 255])
# #     green_mask = cv2.inRange(hsv, lower_green, upper_green)

# #     forest_mask = cv2.bitwise_and(green_mask, (smoothness > 15).astype(np.uint8) * 255)
# #     water_mask = cv2.bitwise_and(green_mask, (smoothness <= 15).astype(np.uint8) * 255)

# #     # soil
# #     soil_mask = cv2.inRange(hsv, np.array([10, 60, 60]), np.array([30, 255, 200]))

# #     # buildings
# #     edges = cv2.Canny(gray, 80, 200)
# #     bright_gray = cv2.inRange(hsv, np.array([0, 0, 100]), np.array([180, 80, 255]))
# #     mask_building = cv2.bitwise_and(bright_gray, (edges > 0).astype(np.uint8) * 255)

# #     # combine into overlay
# #     segmentation = np.zeros_like(img_rgb)
# #     segmentation[forest_mask > 0]   = (0, 255, 0)     # Forest
# #     segmentation[water_mask > 0]    = (0, 200, 200)   # Water (cyan-green)
# #     segmentation[soil_mask > 0]     = (180, 120, 50)  # Soil (brown)
# #     segmentation[mask_building > 0] = (255, 0, 0)     # Buildings (red)

# #     overlay = cv2.addWeighted(img_rgb, 0.6, segmentation, 0.4, 0)

# #     return cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)


# # @app.post("/segment")
# # async def segment(file: UploadFile = File(...)):
# #     """accepts an image and returns segmented overlay"""
# #     try:
# #         contents = await file.read()
# #         np_arr = np.frombuffer(contents, np.uint8)
# #         img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
# #         if img is None:
# #             raise ValueError("Invalid image file")

# #         segmented = await run_in_threadpool(segment_image_cv, img)

# #         # encode image back to JPEG
# #         _, encoded = cv2.imencode('.jpg', segmented)
# #         return StreamingResponse(io.BytesIO(encoded.tobytes()), media_type="image/jpeg")

# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))
# @app.post("/segment")
# async def segment(file: UploadFile = File(...)):
#     """Accepts an image and returns segmented overlay and stats JSON"""
#     try:
#         contents = await file.read()
#         np_arr = np.frombuffer(contents, np.uint8)
#         img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#         if img is None:
#             raise ValueError("Invalid image file")

#         segmented, stats = await run_in_threadpool(segment_image_cv, img)

#         # Encode segmented image
#         _, encoded = cv2.imencode(".jpg", segmented)
#         image_bytes = encoded.tobytes()

#         # Respond with image + stats in JSON
#         return {
#             "stats": stats,
#             "segmented_image": f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode()}"
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # required to call blocking OpenCV in async FastAPI
# from fastapi.concurrency import run_in_threadpool


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool
import cv2, numpy as np, base64

app = FastAPI(title="Land Asset Segmentation API")

def segment_image_cv(img: np.ndarray):
    """Simple rule-based segmentation for forest, water, soil, buildings.
    Returns segmented overlay and percentage stats.
    """
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, w, _ = img.shape
    total_pixels = h * w

    # split channels for NDVI-like
    b, g, r = cv2.split(img_rgb)
    ndvi_like = (g.astype(float) - r.astype(float)) / (g + r + 1e-5)

    # forest (green + high variance)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
    lap_abs = cv2.convertScaleAbs(lap)
    smoothness = cv2.blur(lap_abs, (15, 15))

    lower_green = np.array([35, 20, 20])
    upper_green = np.array([100, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    forest_mask = cv2.bitwise_and(green_mask, (smoothness > 15).astype(np.uint8) * 255)
    water_mask = cv2.bitwise_and(green_mask, (smoothness <= 15).astype(np.uint8) * 255)

    soil_mask = cv2.inRange(
        hsv, np.array([10, 60, 60]), np.array([30, 255, 200])
    )

    edges = cv2.Canny(gray, 80, 200)
    bright_gray = cv2.inRange(
        hsv, np.array([0, 0, 100]), np.array([180, 80, 255])
    )
    mask_building = cv2.bitwise_and(
        bright_gray, (edges > 0).astype(np.uint8) * 255
    )

    # combine into overlay
    segmentation = np.zeros_like(img_rgb)
    segmentation[forest_mask > 0] = (0, 255, 0)  # Forest
    segmentation[water_mask > 0] = (0, 200, 200)  # Water
    segmentation[soil_mask > 0] = (180, 120, 50)  # Soil
    segmentation[mask_building > 0] = (255, 0, 0)  # Buildings

    overlay = cv2.addWeighted(img_rgb, 0.6, segmentation, 0.4, 0)

    # --- pixel percentages ---
    stats = {
        "forest": int(np.count_nonzero(forest_mask) / total_pixels * 100),
        "water": int(np.count_nonzero(water_mask) / total_pixels * 100),
        "soil": int(np.count_nonzero(soil_mask) / total_pixels * 100)
        #"buildings": int(np.count_nonzero(mask_building) / total_pixels * 100)
    }

    return cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR), stats


@app.post("/segment")
async def segment(file: UploadFile = File(...)):
    """Accepts an image and returns segmented overlay and stats JSON"""
    try:
        contents = await file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image file")

        segmented, stats = await run_in_threadpool(segment_image_cv, img)

        # Encode image -> base64
        _, encoded = cv2.imencode(".jpg", segmented)
        b64_image = base64.b64encode(encoded.tobytes()).decode("utf-8")

        return {
            "stats": stats,
            "segmented_image": f"data:image/jpeg;base64,{b64_image}"
        }

    except Exception as e:
        # print full error in logs
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))