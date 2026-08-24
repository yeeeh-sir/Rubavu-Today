import React, { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import rubavuLogo from "../../Rubavu.jpeg";

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

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-x-hidden">
      
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 text-xl font-bold text-white tracking-wider flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <img src={rubavuLogo} alt="Rubavu Logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <span className="truncate">CompanyDash</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer bg-slate-800 text-white"
          >
            Posts Dashboard
          </button>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-full text-left flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition text-sm cursor-pointer bg-transparent border-none text-slate-300"
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-full text-left flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition text-sm cursor-pointer bg-transparent border-none text-slate-300"
          >
            Settings
          </button>
        </nav>
      </aside>

      
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center space-x-3 min-w-0 mr-2">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition shrink-0"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-slate-800 truncate">
              News & Post Management
            </h1>
          </div>
        </header>

        
        <div className="p-4 sm:p-8 flex-1 w-full max-w-7xl mx-auto box-border">
          
          <div className="mb-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 min-w-0">
              <p className="text-sm uppercase text-slate-500 font-medium">Total Posts</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-800 truncate">{totalPosts}</h2>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 min-w-0">
              <p className="text-sm uppercase text-slate-500 font-medium">Departments</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-800 truncate">{departments.length}</h2>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1 min-w-0">
              <p className="text-sm uppercase text-slate-500 font-medium">Latest Post</p>
              <h2 className="mt-2 text-xl font-bold text-slate-800 truncate">{posts[0]?.title || "No posts"}</h2>
            </div>
          </div>

          
          <div className="mb-8 rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200">
            <h2 className="mb-5 text-lg sm:text-2xl font-bold text-slate-800">Departments Overview</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {departments.map((department) => (
                <div key={department} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-5 text-center min-w-0">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold truncate max-w-full ${badgeColors[department]}`}>
                    {department}
                  </span>
                  <p className="mt-3 sm:mt-4 text-xl sm:text-3xl font-bold text-slate-800 truncate">{departmentStats[department]}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-medium">Posts</p>
                </div>
              ))}
            </div>
          </div>

          
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSelectedDepartment("All")}
              className={`rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition cursor-pointer ${
                selectedDepartment === "All" ? "bg-slate-900 text-white shadow" : "bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {departments.map((department) => (
              <button
                key={department}
                type="button"
                onClick={() => setSelectedDepartment(department)}
                className={`rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition cursor-pointer ${
                  selectedDepartment === department ? "bg-blue-600 text-white shadow" : "bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {department}
              </button>
            ))}
          </div>

          
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                {selectedDepartment === "All" ? "All Posts" : `${selectedDepartment} Posts`}
              </h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No posts found.</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[500px] border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-4">Title</th>
                      <th className="px-4 sm:px-6 py-4">Department</th>
                      <th className="px-4 sm:px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                    {filteredPosts.map((post) => (
                      <tr key={post.id || post._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900 break-words">{post.title}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColors[post.category] || "bg-slate-100 text-slate-700"}`}>
                            {post.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-slate-500 whitespace-nowrap">
                          {post.createdDate ? new Date(post.createdDate).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;