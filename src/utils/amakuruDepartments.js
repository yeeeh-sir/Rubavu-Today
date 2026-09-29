export const AMAKURU_DEPARTMENTS = [
  { name: "Ubuzima", slug: "ubuzima" },
  { name: "Iyobokamana", slug: "iyobokamana" },
  { name: "Poritike", slug: "poritike" },
  { name: "Ikoranabuhanga", slug: "ikoranabuhanga" },
  { name: "Mu Karere", slug: "mu-karere" },
  { name: "Mu Mahanga", slug: "mu-mahanga" },
  { name: "Ubuvumbuzi", slug: "ubuvumbuzi" },
];

export const isAmakuruCategory = (category) =>
  String(category || "").trim().toLowerCase() === "amakuru";

export const getAmakuruDepartmentBySlug = (slug) =>
  AMAKURU_DEPARTMENTS.find((department) => department.slug === slug) || null;

export const getAmakuruDepartmentSlug = (name) =>
  AMAKURU_DEPARTMENTS.find(
    (department) => department.name.toLowerCase() === String(name || "").trim().toLowerCase()
  )?.slug || "";

export const filterAmakuruPosts = (posts, { category = "", department = "", query = "" } = {}) => {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  const normalizedDepartment = String(department || "").trim().toLowerCase();
  const normalizedQuery = String(query || "").trim().toLowerCase();

  return (Array.isArray(posts) ? posts : []).filter((post) => {
    if (
      normalizedCategory &&
      String(post.category || "").trim().toLowerCase() !== normalizedCategory
    ) {
      return false;
    }

    if (
      normalizedDepartment &&
      String(post.amakuru_department || "").trim().toLowerCase() !== normalizedDepartment
    ) {
      return false;
    }

    if (!normalizedQuery) return true;

    return [
      post.title,
      post.summary,
      post.content,
      post.category,
      post.amakuru_department,
    ].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
  });
};