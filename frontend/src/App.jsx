
import { useEffect, useState } from "react";

import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  LayoutDashboard,
  FileText,
  Search,
  ClipboardCheck,
  Settings,
  Bell,
  Plus,
  Activity,
  AlertTriangle,
  Microscope,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  FlaskConical,
  ArrowLeft
} from "lucide-react";

import { fetchDeviations } from "./redux/deviationSlice";

import CreateDeviation from "./pages/CreateDeviation";
import RCA from "./pages/RCA";
import CAPA from "./pages/CAPA";

import API from "./services/api";

import "./App.css";


function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    records: deviations,
    loading,
    error
  } = useSelector((state) => state.deviations);


  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    total_deviations: 0,
    open_deviations: 0,
    total_rca_analyses: 0,
    proposed_capas: 0
  });

  const [statsLoading, setStatsLoading] = useState(true);


  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);

      const response = await API.get("/dashboard/stats");

      setDashboardStats(response.data);

    } catch (error) {
      console.error(
        "Dashboard statistics error:",
        error
      );
    } finally {
      setStatsLoading(false);
    }
  };


  // Load dashboard data
  useEffect(() => {
    dispatch(fetchDeviations());
    fetchDashboardStats();
  }, [dispatch]);


  // Dashboard statistics cards
  const stats = [
    {
      title: "Total Deviations",
      value: statsLoading
        ? "..."
        : dashboardStats.total_deviations,
      change: "Records from database",
      icon: FileText,
      color: "purple"
    },
    {
      title: "Open Deviations",
      value: statsLoading
        ? "..."
        : dashboardStats.open_deviations,
      change: "Requires attention",
      icon: AlertTriangle,
      color: "orange"
    },
    {
      title: "RCA Analyses",
      value: statsLoading
        ? "..."
        : dashboardStats.total_rca_analyses,
      change: "Saved investigations",
      icon: Microscope,
      color: "blue"
    },
    {
      title: "Proposed CAPAs",
      value: statsLoading
        ? "..."
        : dashboardStats.proposed_capas,
      change: "Awaiting review",
      icon: ClipboardCheck,
      color: "green"
    }
  ];


  // Refresh dashboard data
  const handleRefresh = () => {
    dispatch(fetchDeviations());
    fetchDashboardStats();
  };


  return (
    <>
      {/* Dashboard Header */}

      <header className="topbar">

        <div>
          <h1>Dashboard</h1>

          <p>
            Monitor deviations, investigations and corrective actions.
          </p>
        </div>

        <div className="topbar-actions">

          <button
            className="icon-button"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="notification-dot"></span>
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("/create-deviation")}
          >
            <Plus size={18} />
            New Deviation
          </button>

        </div>

      </header>


      {/* Welcome Section */}

      <section className="welcome-section">

        <div>

          <span className="welcome-tag">
            <Activity size={14} />
            AI-POWERED QUALITY INTELLIGENCE
          </span>

          <h2>Welcome to PharmaRCA AI</h2>

          <p>
            Identify deviations, investigate root causes and
            manage corrective actions in one intelligent workspace.
          </p>

        </div>

        <div className="welcome-icon">
          <FlaskConical
            size={65}
            strokeWidth={1.2}
          />
        </div>

      </section>


      {/* Statistics Cards */}

      <section className="stats-grid">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (

            <div
              className="stat-card"
              key={stat.title}
            >

              <div className="stat-top">

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="stat-arrow"
                />

              </div>

              <h3>{stat.value}</h3>

              <p>{stat.title}</p>

              <span className="stat-description">
                {stat.change}
              </span>

            </div>

          );

        })}

      </section>


      {/* Dashboard Content */}

      <section className="dashboard-grid">


        {/* Recent Deviations */}

        <div
          className="panel deviations-panel"
          id="deviations"
        >

          <div className="panel-header">

            <div>
              <h3>Recent Deviations</h3>
              <p>Latest manufacturing deviation records</p>
            </div>

            <button
              className="text-button"
              onClick={handleRefresh}
              disabled={loading || statsLoading}
            >
              Refresh <ChevronRight size={16} />
            </button>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>DEVIATION</th>
                  <th>PRODUCT / BATCH</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="5">
                      Loading deviations...
                    </td>
                  </tr>

                ) : error ? (

                  <tr>
                    <td colSpan="5">
                      {typeof error === "string"
                        ? error
                        : "Unable to load deviations."}
                    </td>
                  </tr>

                ) : deviations.length === 0 ? (

                  <tr>
                    <td colSpan="5">
                      No deviations found.
                    </td>
                  </tr>

                ) : (

                  deviations.map((item) => (

                    <tr key={item.id}>

                      <td>

                        <strong>
                          {item.deviation_code}
                        </strong>

                        <span className="table-subtitle">
                          {item.title}
                        </span>

                      </td>


                      <td>

                        <strong>
                          {item.product_name || "Not available"}
                        </strong>

                        <span className="table-subtitle">
                          {item.batch_number || "Not available"}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`severity ${
                            (item.severity || "medium").toLowerCase()
                          }`}
                        >
                          {item.severity || "Not specified"}
                        </span>

                      </td>


                      <td>

                        <span className="status-text">
                          {item.status || "Open"}
                        </span>

                      </td>


                      <td className="date-cell">

                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-IN")
                          : "Not available"}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>



        {/* Quick Actions */}

        <div className="panel quick-panel">

          <div className="panel-header">

            <div>
              <h3>Quick Actions</h3>
              <p>Start a new workflow</p>
            </div>

          </div>


          {/* Create Deviation */}

          <button
            className="quick-action"
            onClick={() => navigate("/create-deviation")}
          >

            <div className="quick-icon purple">
              <Plus size={20} />
            </div>

            <div>
              <strong>Create Deviation</strong>
              <span>Register a new deviation</span>
            </div>

            <ChevronRight size={18} />

          </button>


          {/* Start RCA */}

          <button
            className="quick-action"
            onClick={() => navigate("/rca")}
          >

            <div className="quick-icon blue">
              <Microscope size={20} />
            </div>

            <div>
              <strong>Start RCA</strong>
              <span>Investigate root causes</span>
            </div>

            <ChevronRight size={18} />

          </button>


          {/* Review CAPA */}

          <button
            className="quick-action"
            onClick={() => navigate("/capa")}
          >

            <div className="quick-icon green">
              <ClipboardCheck size={20} />
            </div>

            <div>
              <strong>Review CAPA</strong>
              <span>Review proposed actions</span>
            </div>

            <ChevronRight size={18} />

          </button>


          <div className="system-status">

            <CheckCircle2 size={17} />

            <span>Application workspace ready</span>

          </div>

        </div>

      </section>


      {/* Footer */}

      <footer className="footer">

        <span>
          PharmaRCA AI · AI-powered Root Cause Analysis
        </span>

        <span>
          Human review required for all AI recommendations.
        </span>

      </footer>

    </>

  );

}



function App() {

  const location = useLocation();


  const isCreatePage =
    location.pathname === "/create-deviation";

  const isRCAPage =
    location.pathname === "/rca";

  const isCAPAPage =
    location.pathname === "/capa";


  return (

    <div className="app-container">


      {/* Sidebar */}

      <aside className="sidebar">


        {/* Brand */}

        <div className="brand">

          <div className="brand-icon">
            <FlaskConical size={23} />
          </div>

          <div>
            <h2>PharmaRCA</h2>
            <span>AI INTELLIGENCE</span>
          </div>

        </div>


        <div className="sidebar-label">
          WORKSPACE
        </div>


        {/* Navigation */}

        <nav className="sidebar-nav">


          <Link
            className={`nav-item ${
              location.pathname === "/" ? "active" : ""
            }`}
            to="/"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>


          <Link
            className={`nav-item ${
              isCreatePage ? "active" : ""
            }`}
            to="/create-deviation"
          >
            <FileText size={19} />
            Deviations
          </Link>


          <Link
            className={`nav-item ${
              isRCAPage ? "active" : ""
            }`}
            to="/rca"
          >
            <Search size={19} />
            Root Cause Analysis
          </Link>


          <Link
            className={`nav-item ${
              isCAPAPage ? "active" : ""
            }`}
            to="/capa"
          >
            <ClipboardCheck size={19} />
            CAPA Management
          </Link>


        </nav>


        <div className="sidebar-label settings-label">
          PREFERENCES
        </div>


        <nav className="sidebar-nav">

          <a
            className="nav-item"
            href="#"
          >
            <Settings size={19} />
            Settings
          </a>

        </nav>


        {/* Profile */}

        <div className="sidebar-bottom">

          <div className="profile">

            <div className="profile-avatar">
              MV
            </div>

            <div>
              <h4>Admin User</h4>
              <span>Quality Assurance</span>
            </div>

          </div>

        </div>

      </aside>



      {/* Main Content */}

      <main className="main-content">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />


          <Route
            path="/create-deviation"
            element={<CreateDeviation />}
          />


          <Route
            path="/rca"
            element={<RCA />}
          />


          <Route
            path="/capa"
            element={<CAPA />}
          />


          {/* Page Not Found */}

          <Route
            path="*"
            element={

              <div>

                <button
                  className="back-button"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft size={17} />
                  Go Back
                </button>

                <h2>Page not found</h2>

              </div>

            }
          />

        </Routes>

      </main>

    </div>

  );

}


export default App;
