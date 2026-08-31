import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { BarChart3, FileText, Newspaper } from "lucide-react";

const departments = [
  "Amakuru",
  "Ubukungu",
  "Imikino",
  "Imyidagaduro",
  "Uburezi",
];

const badgeColors = {
  Amakuru: "bg-blue-100 text-blue-700",
  Ubukungu: "bg-green-100 text-green-700",
  Imikino: "bg-orange-100 text-orange-700",
  Imyidagaduro: "bg-pink-100 text-pink-700",
  Uburezi: "bg-purple-100 text-purple-700",
};

const navSections = [
  {
    label: "Imbonerahamwe",
    items: [
      { icon: <BarChart3 size={16} />, label: "Imbonerahamwe", path: "/employee/dashboard" },
      { icon: <FileText size={16} />, label: "Ubwanditsi", path: "/employee/workspace" },
      { icon: <Newspaper size={16} />, label: "Profilyi", path: "/employee/profile" },
    ],
  },
];

function Dashboard({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.posts || response.data?.data || [];
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    }
  };

  const totalPosts = posts.length;

  const departmentStats = useMemo(() => {
    return departments.reduce((acc, dep) => {
      acc[dep] = posts.filter((p) => p.category === dep).length;
      return acc;
    }, {});
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedDepartment === "All") return posts;
    return posts.filter((post) => post.category === selectedDepartment);
  }, [posts, selectedDepartment]);

  return (
    <DashboardLayout navigationSections={navSections} roleLabel="Employee" onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Inkuru zose" value={totalPosts} icon={<FileText size={18} />} color="blue" />
          <StatCard label="Departments" value={departments.length} icon={<BarChart3 size={18} />} color="emerald" />
          <StatCard label="Inkuru iheruka" value={posts[0]?.title || "Nta nkuru"} icon={<Newspaper size={18} />} color="purple" />
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Ibyiciro - Imbonerahamwe</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {departments.map((department) => (
              <div key={department} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[department]}`}>
                  {department}
                </span>
                <p className="mt-3 text-2xl font-bold text-slate-800">{departmentStats[department]}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-medium">Inkuru</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDepartment("All")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedDepartment === "All" ? "bg-slate-900 text-white shadow" : "card border-0 hover:bg-slate-50"}`}
          >
            Zose
          </button>
          {departments.map((department) => (
            <button
              key={department}
              type="button"
              onClick={() => setSelectedDepartment(department)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedDepartment === department ? "bg-blue-600 text-white shadow" : "card border-0 hover:bg-slate-50"}`}
            >
              {department}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedDepartment === "All" ? "Inkuru zose" : `Inkuru za ${selectedDepartment}`}
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-lg font-medium">Nta nkuru zabonetse.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3">Umutwe</th>
                    <th className="px-6 py-3">Ibyiciro</th>
                    <th className="px-6 py-3">Byakozwe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPosts.map((post) => (
                    <tr key={post.id || post._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3 font-medium text-slate-900">{post.title}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[post.category] || "bg-slate-100 text-slate-700"}`}>
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                        {post.createdDate ? new Date(post.createdDate).toLocaleString("rw-RW") : "Nta makuru"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
