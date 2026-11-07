
import pymupdf
from pathlib import Path


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from an uploaded PDF document.
    """

    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError("PDF file not found.")

    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF files are supported.")

    extracted_text = []

    try:
        with pymupdf.open(pdf_path) as document:
            if document.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported.")

            for page_number, page in enumerate(document, start=1):
                page_text = page.get_text("text")

                if page_text.strip():
                    extracted_text.append(
                        f"Page {page_number}:\n{page_text}"
                    )

    except pymupdf.FileDataError as error:
        raise ValueError("The uploaded PDF is invalid or corrupted.") from error

    result = "\n\n".join(extracted_text).strip()

    if not result:
        raise ValueError(
            "No readable text found. The PDF may contain scanned images."
        )

    return result
