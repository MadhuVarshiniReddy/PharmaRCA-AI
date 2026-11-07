
import { useState } from "react";
import {
  ClipboardCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  CalendarDays,
  User,
  FileText,
  Pencil,
  Save,
  X
} from "lucide-react";

import API from "../services/api";
import "./CAPA.css";

function CAPA() {
  const [analysisId, setAnalysisId] = useState("");
  const [loading, setLoading] = useState(false);
  const [capas, setCapas] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    description: "",
    rationale: "",
    effectiveness_check: "",
    assigned_to: "",
    due_date: "",
    status: "Proposed"
  });

  const handleGenerate = async () => {
    if (!analysisId.trim() || !/^\d+$/.test(analysisId.trim())) {
      setError("Please enter a valid numeric RCA Analysis ID.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setCapas([]);
    setEditingId(null);

    try {
      const response = await API.post(
        `/capa/generate/${analysisId.trim()}`
      );

      const data = response.data;
      const records = Array.isArray(data)
        ? data
        : data.capas || data.records || [];

      setCapas(records);
      setMessage(
        data.message ||
        `${records.length} CAPA recommendations retrieved successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to generate CAPA recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setEditForm({
      description: item.description || "",
      rationale: item.rationale || "",
      effectiveness_check: item.effectiveness_check || "",
      assigned_to: item.assigned_to || "",
      due_date: item.due_date || "",
      status: item.status || "Proposed"
    });

    setError("");
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      description: "",
      rationale: "",
      effectiveness_check: "",
      assigned_to: "",
      due_date: "",
      status: "Proposed"
    });
  };

  const handleFormChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSave = async (capaId) => {
    if (!editForm.description.trim()) {
      setError("Recommended action cannot be empty.");
      return;
    }

    if (
      editForm.due_date &&
      editForm.due_date < new Date().toLocaleDateString("en-CA")
    ) {
      setError("Please select today or a future due date.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await API.put(`/capa/${capaId}`, {
        description: editForm.description.trim(),
        rationale: editForm.rationale.trim() || null,
        effectiveness_check:
          editForm.effectiveness_check.trim() || null,
        assigned_to: editForm.assigned_to.trim() || null,
        due_date: editForm.due_date || null,
        status: editForm.status
      });

      const updatedCapa = response.data;

      setCapas((previous) =>
        previous.map((item) =>
          item.id === capaId ? updatedCapa : item
        )
      );

      setEditingId(null);
      setMessage(`CAPA #${capaId} updated successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to save CAPA changes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="capa-page">
      <header className="capa-header">
        <div>
          <span className="capa-tag">
            <Sparkles size={14} />
            AI-POWERED ACTION MANAGEMENT
          </span>

          <h1>CAPA Management</h1>

          <p>
            Generate and review corrective and preventive
            actions based on RCA investigations.
          </p>
        </div>
      </header>

      <section className="capa-card">
        <div className="capa-card-heading">
          <ClipboardCheck size={23} />

          <div>
            <h2>Generate CAPA Recommendations</h2>
            <p>
              Enter a saved RCA Analysis ID to generate proposed actions.
            </p>
          </div>
        </div>

        <div className="capa-form">
          <label htmlFor="analysis-id">RCA Analysis ID</label>

          <input
            id="analysis-id"
            type="number"
            min="1"
            value={analysisId}
            onChange={(e) => setAnalysisId(e.target.value)}
            placeholder="Example: 6"
          />

          <button
            type="button"
            className="capa-generate-button"
            onClick={handleGenerate}
            disabled={loading || !analysisId.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                Generating CAPAs...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate CAPA
              </>
            )}
          </button>
        </div>
      </section>

      {error && (
        <div className="capa-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="capa-success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {capas.length > 0 && (
        <section className="capa-card">
          <div className="capa-results-heading">
            <div>
              <h2>Proposed Corrective & Preventive Actions</h2>
              <p>
                {capas.length} recommendations generated for
                RCA Analysis #{analysisId}
              </p>
            </div>

            <span className="capa-count">
              {capas.length} Actions
            </span>
          </div>

          <div className="capa-list">
            {capas.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <article className="capa-item" key={item.id}>
                  <div className="capa-item-header">
                    <div className="capa-item-icon">
                      <ClipboardCheck size={20} />
                    </div>

                    <div className="capa-item-title">
                      <h3>CAPA #{item.id}</h3>

                      <span
                        className={`capa-type ${
                          (item.action_type || "").toLowerCase()
                        }`}
                      >
                        {item.action_type || "Action"}
                      </span>
                    </div>

                    <span className="capa-status">
                      {item.status || "Proposed"}
                    </span>
                  </div>

                  <div className="capa-item-content">
                    {isEditing ? (
                      <div className="capa-edit-form">
                        <label>Recommended Action</label>
                        <textarea
                          rows="4"
                          value={editForm.description}
                          onChange={(e) =>
                            handleFormChange("description", e.target.value)
                          }
                        />

                        <label>Rationale</label>
                        <textarea
                          rows="3"
                          value={editForm.rationale}
                          onChange={(e) =>
                            handleFormChange("rationale", e.target.value)
                          }
                        />

                        <label>Effectiveness Check</label>
                        <textarea
                          rows="3"
                          value={editForm.effectiveness_check}
                          onChange={(e) =>
                            handleFormChange(
                              "effectiveness_check",
                              e.target.value
                            )
                          }
                        />

                        <label>
                          <User size={15} /> Responsible Person
                        </label>
                        <input
                          type="text"
                          value={editForm.assigned_to}
                          onChange={(e) =>
                            handleFormChange("assigned_to", e.target.value)
                          }
                          placeholder="Enter responsible person's name"
                        />

                        <label>
                          <CalendarDays size={15} /> Target Due Date
                        </label>
                        <input
                          type="date"
                          min={new Date().toLocaleDateString("en-CA")}
                          value={editForm.due_date}
                          onChange={(e) =>
                            handleFormChange("due_date", e.target.value)
                          }
                        />

                        <label>CAPA Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            handleFormChange("status", e.target.value)
                          }
                        >
                          <option value="Proposed">Proposed</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <div className="capa-edit-actions">
                          <button
                            type="button"
                            className="capa-save-button"
                            onClick={() => handleSave(item.id)}
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 size={16} className="spin-icon" />
                            ) : (
                              <Save size={16} />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            className="capa-cancel-button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4>Recommended Action</h4>
                        <p>{item.description || "Not provided"}</p>

                        <h4>Rationale</h4>
                        <p>{item.rationale || "Not provided"}</p>

                        <h4>Effectiveness Check</h4>
                        <p>
                          {item.effectiveness_check ||
                            "To be defined during human review."}
                        </p>

                        <button
                          type="button"
                          className="capa-edit-button"
                          onClick={() => handleEdit(item)}
                          disabled={editingId !== null || saving}
                        >
                          <Pencil size={16} />
                          Edit CAPA
                        </button>
                      </>
                    )}
                  </div>

                  <div className="capa-item-footer">
                    <span>
                      <User size={15} />
                      {item.assigned_to || "Not assigned"}
                    </span>

                    <span>
                      <CalendarDays size={15} />
                      {item.due_date || "No due date"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="capa-review-notice">
            <ShieldAlert size={19} />

            <div>
              <strong>Human Review Required</strong>
              <p>
                AI-generated CAPAs are proposals only. Authorized
                personnel must review and approve actions before
                implementation. Status changes should follow your
                organization's quality procedures.
              </p>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && !message && (
        <div className="capa-empty">
          <FileText size={35} />
          <h3>No CAPA recommendations loaded</h3>
          <p>
            Enter an RCA Analysis ID above to generate
            corrective and preventive actions.
          </p>
        </div>
      )}
    </div>
  );
}

export default CAPA;
