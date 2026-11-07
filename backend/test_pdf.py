
from app.services.document_service import extract_text_from_pdf

pdf_path = "../sample_data/sample_deviation.pdf"

try:
    extracted_text = extract_text_from_pdf(pdf_path)

    print("\n========== EXTRACTED PDF TEXT ==========\n")
    print(extracted_text)
    print("\n========== PDF EXTRACTION SUCCESSFUL ==========")

except Exception as error:
    print("PDF extraction failed:", error)
