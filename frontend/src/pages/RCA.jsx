
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Microscope,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  FileText
} from "lucide-react";

import API from "../services/api";
import "./RCA.css";

function RCA() {
  const deviations = useSelector(
    (state) => state.deviations.records
  );

  const [selectedDeviation, setSelectedDeviation] = useState("");
  const [method, setMethod] = useState("5 Whys");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deviations.length === 0) {
      API.get("/deviations/")
        .then((response) => {
          if (response.data.length > 0) {
            setSelectedDeviation(String(response.data[0].id));
          }
        })
        .catch(() => {
          setError("Unable to load deviations. Please refresh.");
        });
    } else {
      setSelectedDeviation(String(deviations[0].id));
    }
  }, [deviations]);

  const handleAnalyze = async () => {
    if (!selectedDeviation) {
      setError("Please select a deviation.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await API.post(
        `/rca/${selectedDeviation}/analyze`,
        null,
        {
          params: { method }
        }
      );

      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to generate RCA analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  const report =
    analysis?.analysis_report ||
    analysis?.ai_summary ||
    "";

  return (
    <div className="rca-page">

      {/* Header */}
      <header className="rca-header">
        <div>
          <span className="rca-tag">
            <Sparkles size={14} />
            AI-POWERED INVESTIGATION
          </span>

          <h1>Root Cause Analysis</h1>

          <p>
            Investigate manufacturing deviations using
            AI-assisted root cause analysis.
          </p>
        </div>
      </header>

      {/* Investigation Form */}
      <section className="rca-card">

        <div className="rca-card-heading">
          <Microscope size={23} />

          <div>
            <h2>Start an Investigation</h2>
            <p>
              Select a deviation and choose an RCA method.
            </p>
          </div>
        </div>

        <div className="rca-form">

          <label htmlFor="deviation-select">
            Select Deviation
          </label>

          <select
            id="deviation-select"
            value={selectedDeviation}
            onChange={(e) => {
              setSelectedDeviation(e.target.value);
              setAnalysis(null);
              setError("");
            }}
          >
            <option value="">Choose a deviation</option>

            {deviations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.deviation_code} — {item.title}
              </option>
            ))}
          </select>

          <label>RCA Method</label>

          <div className="rca-methods">
            <button
              type="button"
              className={method === "5 Whys" ? "selected" : ""}
              onClick={() => {
                setMethod("5 Whys");
                setAnalysis(null);
              }}
            >
              5 Whys
              <span>
                Investigate the problem through five
                successive why questions.
              </span>
            </button>

            <button
              type="button"
              className={method === "Fishbone" ? "selected" : ""}
              onClick={() => {
                setMethod("Fishbone");
                setAnalysis(null);
              }}
            >
              Fishbone Analysis
              <span>
                Organize potential causes into categories
                such as Man, Machine and Method.
              </span>
            </button>
          </div>

          <button
            className="rca-generate-button"
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !selectedDeviation}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate RCA Analysis
              </>
            )}
          </button>

        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rca-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <section className="rca-card rca-result">

          <div className="rca-result-heading">
            <div>
              <span className="rca-tag">
                <CheckCircle2 size={14} />
                ANALYSIS GENERATED
              </span>

              <h2>RCA Analysis Result</h2>

              <p>
                Investigation report generated successfully.
              </p>
            </div>
          </div>

          {/* Analysis Metadata */}
          <div className="rca-metadata">

            <div>
              <span>Analysis ID</span>
              <strong>
                {analysis.analysis_id || analysis.id || "N/A"}
              </strong>
            </div>

            <div>
              <span>Deviation ID</span>
              <strong>
                {analysis.deviation_id || selectedDeviation}
              </strong>
            </div>

            <div>
              <span>Method</span>
              <strong>{analysis.method || method}</strong>
            </div>

            <div>
              <span>Review Status</span>
              <strong className="pending-status">
                {analysis.review_status || "Pending Review"}
              </strong>
            </div>

          </div>

          {/* Formatted Report */}
          <div className="rca-report-heading">
            <FileText size={19} />
            <h3>Investigation Report</h3>
          </div>

          <div className="rca-report markdown-report">
            {report ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report}
              </ReactMarkdown>
            ) : (
              <p>No analysis report was returned by the backend.</p>
            )}
          </div>

          {/* Human Review */}
          <div className="rca-review-notice">
            <ShieldAlert size={19} />

            <div>
              <strong>Human Review Required</strong>

              <p>
                AI-generated causes are hypotheses, not confirmed
                root causes. Verify every supporting-evidence claim
                against original batch records, equipment logs,
                laboratory results and approved procedures.
                A qualified reviewer must approve findings and
                any batch-related decisions.
              </p>
            </div>
          </div>

        </section>
      )}

    </div>
  );
}

export default RCA;
