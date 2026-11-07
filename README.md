# PharmaRCA AI
### AI-Powered Root Cause Analysis and CAPA Management for Pharmaceutical Manufacturing

PharmaRCA AI is an AI-powered application designed to support pharmaceutical manufacturing teams in managing deviations, performing Root Cause Analysis (RCA), and generating Corrective and Preventive Actions (CAPA).

The application uses AI to extract deviation information from PDF documents, generate structured RCA reports using the **5 Whys** and **Fishbone** methods, and recommend CAPA actions. Users can review, edit, and save the generated information before using it in their quality-management workflow.

## Key Features

- **Deviation Management:** Upload deviation reports in PDF format and extract relevant information using AI.
- **AI-Powered Information Extraction:** Identify deviation codes, descriptions, product names, batch numbers, process stages, and severity.
- **Root Cause Analysis:** Generate RCA reports using 5 Whys and Fishbone analysis methods.
- **Evidence Gap Identification:** Highlight missing information and evidence required for further investigation.
- **CAPA Recommendations:** Generate corrective and preventive action recommendations based on RCA reports.
- **Human Review:** Allow users to review and edit AI-generated information.
- **CAPA Management:** Edit descriptions, assign responsible persons, set due dates, and update action statuses.
- **Dashboard:** View deviation counts, RCA analysis counts, proposed CAPAs, and recent deviation records.

## Important Note

PharmaRCA AI provides AI-assisted investigation and recommendations. AI-generated potential causes are not confirmed root causes. All findings and proposed actions must be reviewed and approved by qualified personnel before being used in actual pharmaceutical quality operations.
## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS, CSS |
| Routing | React Router |
| Backend | Python, FastAPI |
| AI Workflow | LangGraph |
| Large Language Model | Groq – `openai/gpt-oss-120b` |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| PDF Extraction | PyMuPDF |
| HTTP Client | Axios |
| Icons | Lucide React |

## Project Architecture

The application follows a frontend-backend architecture.

1. **Frontend:** Users upload deviation reports, review extracted details, generate RCA reports, and manage CAPAs.
2. **Backend:** FastAPI handles API requests, document processing, database operations, and AI services.
3. **AI Layer:** LangGraph manages the RCA workflow and Groq generates AI-assisted analysis and recommendations.
4. **Database:** PostgreSQL stores deviations, RCA analyses, potential causes, and CAPA records.

### Application Workflow

`Deviation Identification → RCA → CAPA → Human Review`
## Installation and Setup

### Prerequisites

Install the following before running the project:

- Python 3.10 or above
- Node.js and npm
- PostgreSQL
- Git
- Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/MadhuVarshiniReddy/PharmaRCA-AI.git
cd PharmaRCA-AI
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install fastapi uvicorn python-multipart langgraph langchain-groq langchain-core groq sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv pymupdf email-validator
```

### 3. Environment Configuration

Create a `.env` file inside the `backend` folder:

```env
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5433
DB_NAME=pharmarca

GROQ_API_KEY=your_groq_api_key
```

Replace the placeholder values with your own credentials. Never upload your actual `.env` file or API keys to GitHub.

### 4. Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend URL:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5174`

*Note: Vite may choose another available port if 5174 is already occupied. Use the URL displayed in your terminal.*
## API Endpoints

The backend provides REST API endpoints for deviation management, RCA generation, CAPA management, and dashboard statistics.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome message |
| GET | `/api/health` | Check backend health |
| GET | `/api/dashboard/stats` | Retrieve dashboard statistics |
| POST | `/api/deviations/` | Create a deviation |
| GET | `/api/deviations/` | Retrieve all deviations |
| GET | `/api/deviations/{deviation_id}` | Retrieve a specific deviation |
| POST | `/api/deviations/upload-pdf` | Upload PDF and extract deviation details |
| POST | `/api/rca/` | Create an RCA analysis manually |
| GET | `/api/rca/{analysis_id}` | Retrieve an RCA analysis |
| POST | `/api/rca/{deviation_id}/analyze` | Generate RCA using 5 Whys or Fishbone |
| POST | `/api/capa/` | Create a CAPA manually |
| GET | `/api/capa/{capa_id}` | Retrieve a CAPA |
| PUT | `/api/capa/{capa_id}` | Update CAPA details and status |
| POST | `/api/capa/generate/{analysis_id}` | Generate CAPA recommendations from an RCA |

### Database Structure

The PostgreSQL database contains the following main tables:

- **deviations:** Stores deviation information and extracted details.
- **rca_analyses:** Stores RCA reports, analysis methods, and review status.
- **causes:** Stores potential causes, supporting evidence, and confirmation status.
- **capas:** Stores corrective and preventive actions, assignments, due dates, and status.
## Project Structure

```text
PharmaRCA-AI/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── rca_graph.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── database.py
│   ├── tests/
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── sample_data/
│   └── sample_deviation.pdf
│
└── README.md
```

## Future Enhancements

- User authentication and role-based access control.
- Qualified-person review and approval workflows.
- CAPA effectiveness verification and closure.
- Audit trails for quality-related changes.
- Support for additional document formats.
- Enhanced evidence traceability and validation.

## Disclaimer

This project is developed as an AI-assisted prototype for pharmaceutical deviation investigation and CAPA management. It is not a validated pharmaceutical Quality Management System (QMS) and must not independently determine root causes, approve CAPAs, or make batch-disposition decisions.

## Author

**Adireddy Madhu Varshini**

- GitHub: [MadhuVarshiniReddy](https://github.com/MadhuVarshiniReddy)
- Portfolio: [Personal Portfolio](https://madhuvarshini29.netlify.app/)