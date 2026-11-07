
import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import API from "../services/api";
import "./CreateDeviation.css";

const initialForm = {
  deviation_code: "",
  title: "",
  description: "",
  product_name: "",
  batch_number: "",
  process_stage: "",
  severity: ""
};

function CreateDeviation() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle PDF selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setMessage("");
    setExtracted(false);
    setFormData(initialForm);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  // Upload PDF and extract information using AI
  const handleExtract = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await API.post(
        "/deviations/upload-pdf",
        uploadData
      );

      const details = response.data.ai_extracted_details;

      if (!details) {
        throw new Error("AI did not return extracted details.");
      }

      setFormData({
        deviation_code: details.deviation_code || "",
        title: details.title || "",
        description: details.description || "",
        product_name: details.product_name || "",
        batch_number: details.batch_number || "",
        process_stage: details.process_stage || "",
        severity: details.severity || ""
      });

      setExtracted(true);
      setMessage(
        "AI extraction completed. Please review and edit the fields."
      );

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to extract deviation information."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle manual field editing
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Save reviewed deviation to PostgreSQL
  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...formData,
        source_type: file ? "PDF Upload" : "Manual"
      };

      const response = await API.post(
        "/deviations/",
        payload
      );

      setMessage(
        `Deviation ${response.data.deviation_code} saved successfully!`
      );

      setFormData(initialForm);
      setFile(null);
      setExtracted(false);

      const fileInput = document.getElementById("deviation-pdf");

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to save deviation. Please check the required fields."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-deviation-page">

      {/* Page Header */}
      <div className="create-page-header">

        <button
          className="back-button"
          type="button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div>
          <h1>Create New Deviation</h1>
          <p>
            Upload a deviation report or enter the information manually.
          </p>
        </div>

      </div>

      {/* Upload Section */}
      <section className="upload-card">

        <div className="section-heading">
          <div className="section-icon">
            <Upload size={21} />
          </div>

          <div>
            <h2>Upload Deviation Document</h2>
            <p>
              Upload a PDF report to extract deviation details using AI.
            </p>
          </div>
        </div>

        <div className="upload-area">

          <input
            id="deviation-pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
          />

          <label
            htmlFor="deviation-pdf"
            className="upload-label"
          >
            <Upload size={30} />

            <strong>
              {file ? file.name : "Choose a PDF document"}
            </strong>

            <span>
              {file
                ? "PDF selected successfully"
                : "Click to browse and select a PDF file"}
            </span>
          </label>

        </div>

        <button
          type="button"
          className="extract-button"
          onClick={handleExtract}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin-icon" />
              Extracting information...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Extract Details Using AI
            </>
          )}
        </button>

      </section>

      {/* Messages */}
      {message && (
        <div className="success-message">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Deviation Form */}
      <section className="deviation-form-card">

        <div className="section-heading">

          <div className="section-icon">
            <FileText size={21} />
          </div>

          <div>
            <h2>Deviation Information</h2>
            <p>
              Review and edit the extracted details before saving.
            </p>
          </div>

        </div>

        {extracted && (
          <div className="ai-review-notice">
            <Sparkles size={16} />
            AI-generated fields are suggestions. Verify all details
            against the original document before saving.
          </div>
        )}

        <form onSubmit={handleSave}>

          <div className="form-grid">

            <div className="form-group">
              <label>Deviation Code *</label>

              <input
                type="text"
                name="deviation_code"
                value={formData.deviation_code}
                onChange={handleChange}
                placeholder="Example: DEV-2026-016"
                required
              />
            </div>

            <div className="form-group">
              <label>Deviation Title *</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter deviation title"
                required
              />
            </div>

            <div className="form-group">
              <label>Product Name</label>

              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Example: API-247"
              />
            </div>

            <div className="form-group">
              <label>Batch Number</label>

              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                placeholder="Enter batch number"
              />
            </div>

            <div className="form-group">
              <label>Process Stage</label>

              <input
                type="text"
                name="process_stage"
                value={formData.process_stage}
                onChange={handleChange}
                placeholder="Example: Crystallization"
              />
            </div>

            <div className="form-group">
              <label>Severity</label>

              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="">Select severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Deviation Description *</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the deviation in detail..."
                rows="6"
                required
              />
            </div>

          </div>

          <div className="form-footer">

            <span>
              * Required fields
            </span>

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Deviation
                </>
              )}
            </button>

          </div>

        </form>

      </section>

      {/* Human Review Notice */}
      <div className="human-review-footer">
        AI-extracted information must be reviewed and verified
        by an authorized person before submission.
      </div>

    </div>
  );
}

export default CreateDeviation;
