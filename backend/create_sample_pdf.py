
import pymupdf

from pathlib import Path

output_path = (
    Path(__file__).resolve().parent.parent
    / "sample_data"
    / "sample_deviation.pdf"
)

output_path.parent.mkdir(parents=True, exist_ok=True)

sample_text = """
Deviation Code: DEV-2026-015

Title: Temperature Excursion During API Manufacturing

Description:
During the crystallization process, the reactor temperature
increased to 29°C instead of the target range of 20–22°C.
The cooling water supply was interrupted for 20 minutes.
The final impurity level was found to be 0.16%, exceeding
the specification limit of 0.10%.

Product: API-247
Batch Number: BATCH-2026-090
Process Stage: Crystallization
Severity: High
"""

document = pymupdf.open()
page = document.new_page()

page.insert_textbox(
    pymupdf.Rect(50, 50, 550, 750),
    sample_text,
    fontsize=12,
    fontname="helv",
    lineheight=1.5
)

document.save(output_path)
document.close()

print("PDF created successfully!")
print("Location:", output_path)
