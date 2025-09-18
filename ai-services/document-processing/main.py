import os
import time
import requests
import logging
import boto3
import pytesseract
from PIL import Image
from io import BytesIO
import spacy
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv


load_dotenv(find_dotenv())


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")

if not all([S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION]):
    raise ValueError("One or more AWS environment variables are not set.")


s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)


try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.info("Downloading spaCy model 'en_core_web_sm'...")
    from spacy.cli import download

    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

app = FastAPI()


def download_from_s3(s3_key: str) -> bytes:
    logger.info(f"Downloading {s3_key} from S3 bucket {S3_BUCKET_NAME}...")
    response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
    logger.info("File downloaded successfully.")
    return response["Body"].read()


def run_tesseract_ocr(image_bytes: bytes) -> str:
    logger.info("Running Tesseract OCR...")
    try:
        logger.info(f"First 50 bytes: {image_bytes[:50]}")
        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image, lang="ori")

        logger.info("Tesseract OCR completed.")
        print(text)
        return text
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        raise


def run_ner(text: str) -> dict:
    logger.info("Running NER with spaCy...")
    doc = nlp(text)
    entities = {ent.label_: ent.text for ent in doc.ents}

    logger.info("NER processing completed.")
    return {"extractedFields": entities}


def process_document_task(s3_key: str, callback_url: str):
    try:
        logger.info(f"Starting document processing pipeline for s3Key: {s3_key}...")
        file_bytes = download_from_s3(s3_key)
        extracted_text = run_tesseract_ocr(file_bytes)
        structured_data = run_ner(extracted_text)

        callback_payload = {
            "status": "NER_COMPLETE",
            "ocrEngineUsed": "Tesseract",
            "extractedText": extracted_text,
            "structuredData": structured_data,
        }
    except Exception as e:
        logger.error(
            f"An error occurred during processing for {s3_key}: {e}", exc_info=True
        )
        callback_payload = {"status": "FAILED", "errorMessage": str(e)}

    try:
        logger.info(f"Sending callback to {callback_url}...")
        requests.post(callback_url, json=callback_payload, timeout=10)
        logger.info("Callback successful.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send callback to {callback_url}: {e}")


class ProcessRequest(BaseModel):
    s3Key: str
    processingId: str
    callbackUrl: str


@app.post("/process")
async def process_document(request: ProcessRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received processing request for s3Key: {request.s3Key}")
    background_tasks.add_task(process_document_task, request.s3Key, request.callbackUrl)
    return {"message": "Document processing started in the background."}
