import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  // ================= THEME =================
  const [dark, setDark] = useState(true);

  // ================= AUTH =================
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const register = async () => {
    try {
      const res = await axios.post(
        "https://backend-s7ff.onrender.com/api/auth/register",
        {
          name: loginForm.name,
          email: loginForm.email,
          password: loginForm.password,
          role: "admin"
        }
      );

      alert("Registered successfully");
      setIsRegister(false);
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(
        "https://backend-s7ff.onrender.com/api/auth/login",
        loginForm
      );

      setToken(res.data.token);
      setUser(res.data.user);

      localStorage.setItem("token", res.data.token);
    } catch {
      alert("Login failed");
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // ================= LEADS =================
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (token) fetchLeads();
  }, [token]);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await axios.get(
      "https://backend-s7ff.onrender.com/api/leads",
      authHeader
    );
    setLeads(res.data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addLead = async () => {
    await axios.post(
      "https://backend-s7ff.onrender.com/api/leads/add",
      form,
      authHeader
    );

    setForm({ name: "", email: "", phone: "" });
    fetchLeads();
  };

  const deleteLead = async (id) => {
    await axios.delete(
      `https://backend-s7ff.onrender.com/api/leads/${id}`,
      authHeader
    );
    fetchLeads();
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `https://backend-s7ff.onrender.com/api/leads/${id}`,
      { status },
      authHeader
    );
    fetchLeads();
  };

  // ================= FILTER =================
  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  // ================= CHART =================
  const chartData = [
    { name: "New", value: leads.filter(l => l.status === "new").length },
    { name: "Contacted", value: leads.filter(l => l.status === "contacted").length },
    { name: "Converted", value: leads.filter(l => l.status === "converted").length }
  ];

  const COLORS = ["#4facfe", "#f6d365", "#43e97b"];

  // ================= EXPORT =================
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(fileData, "LeadFlow_Leads.xlsx");
  };

  return (
    <div className={dark ? "dark" : "light"}>

      {/* BACKGROUND ANIMATION */}
      <div className="bg"></div>

      {!token ? (
        <div className="centerBox">
          <h2>{isRegister ? "Register" : "Login"}</h2>

          <input
            placeholder="Email"
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />

          {isRegister && (
            <input
              placeholder="Name"
              onChange={(e) =>
                setLoginForm({ ...loginForm, name: e.target.value })
              }
            />
          )}

          <button onClick={isRegister ? register : login}>
            {isRegister ? "Register" : "Login"}
          </button>

          <p onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Switch to Login" : "Create account"}
          </p>
        </div>
      ) : (
        <div className="container">
<div className="userEmail">
  {user?.email}
</div>
          {/* HEADER */}
          <div className="header">
            <h1>LeadFlow CRM</h1>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDark(!dark)}>
                {dark ? "☀ Light" : "🌙 Dark"}
              </button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>

          {/* SEARCH */}
          <input
            placeholder="Search leads..."
            onChange={(e) => setSearch(e.target.value)}
            className="search"
          />

          {/* CARDS */}
          <div className="cards">
            <div>Total: {leads.length}</div>
            <div>New: {chartData[0].value}</div>
            <div>Converted: {chartData[2].value}</div>
          </div>

          {/* CHART */}
          <div className="chart">
            <PieChart width={300} height={300}>
              <Pie data={chartData} dataKey="value" outerRadius={100}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
  formatter={(value) => (
    <span style={{ color: "black" }}>{value}</span>
  )}
/>
            </PieChart>
          </div>

          {/* FORM */}
          <div className="form">
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <button onClick={addLead}>Add Lead</button>
          </div>

          {/* EXPORT */}
          <button onClick={exportToExcel} className="exportBtn">
            ⬇ Export Excel
          </button>

          {/* TABLE */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>

                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(lead._id, e.target.value)
                        }
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>

                    <td>
                      <button onClick={() => deleteLead(lead._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .bg{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: linear-gradient(-45deg,#4facfe,#00f2fe,#43e97b,#f6d365);
  background-size: 400% 400%;
  animation: gradient 10s ease infinite;

  z-index: -1;
}
  .userEmail{
  position: fixed;
  top: 10px;
  left: 10px;

  background: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 14px;

  box-shadow: 0px 2px 10px rgba(0,0,0,0.15);
  z-index: 1000;
}
  body{
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
  .centerBox,
.centerBox *{
  color: black;
}
        @keyframes gradient{
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }

        .dark{color:white;}
        .light{color:black;}

        .container{
  padding:20px;
  max-width: 1100px;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: center;   /* ⭐ centers everything */
  text-align: center;    /* ⭐ centers text */
}
  .centerBox input{
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
  .centerBox button{
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  background: #4facfe;
  color: white;
  border: none;
}
       .header{
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  padding: 10px 0;
}
  .header > div{
  grid-column: 3;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
  .header h1{
  grid-column: 2;
  text-align: center;
  margin: 0;
}
        .cards{
  display:flex;
  gap:20px;
  margin:20px 0;
  justify-content:center;
  align-items:center;
  flex-wrap: wrap;
}
.chart{
  display:flex;
  justify-content:center;
  align-items:center;
  width:100%;
}
        .search,
.form{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px;
  flex-wrap: wrap;
}
  body{
  display:flex;
  justify-content:center;
}

        table{width:100%;margin-top:20px;background:white;border-radius:10px;}

        .search{padding:8px;width:200px;margin:10px 0;}

        .centerBox{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  margin-top:80px;
  gap:15px;
  width: 350px;
  padding: 30px;
  margin-left:auto;
  margin-right:auto;
  border-radius: 12px;
  background: white;
  box-shadow: 0px 10px 30px rgba(0,0,0,0.2);
}
        button{
          padding:8px 12px;
          cursor:pointer;
        }
         .light *{
  color: black;
}
      `}</style>

    </div>
  );
}

export default App;