
from app.services.document_service import extract_text_from_pdf
from app.services.deviation_extraction_service import extract_deviation_details

pdf_path = "../sample_data/sample_deviation.pdf"

try:
    # Step 1: Extract text from the PDF
    document_text = extract_text_from_pdf(pdf_path)

    # Step 2: Extract structured deviation details using AI
    result = extract_deviation_details(document_text)

    print("\n========== AI EXTRACTED DEVIATION DETAILS ==========\n")

    for field, value in result.items():
        print(f"{field}: {value}")

    print("\n========== AI EXTRACTION SUCCESSFUL ==========")

except Exception as error:
    print("AI extraction failed:", error)
