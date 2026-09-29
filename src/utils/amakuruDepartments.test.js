import {
  AMAKURU_DEPARTMENTS,
  filterAmakuruPosts,
} from "./amakuruDepartments";

const samplePosts = [
  ...AMAKURU_DEPARTMENTS.map(({ name }) => ({
    category: "Amakuru",
    amakuru_department: name,
    title: `${name} inkuru`,
  })),
  { category: "Amakuru", amakuru_department: null, title: "Old Amakuru post" },
  { category: "Ubukungu", amakuru_department: null, title: "Economy post" },
];

test("Byose keeps every Amakuru post, including legacy posts without a department", () => {
  const posts = filterAmakuruPosts(samplePosts, { category: "Amakuru" });

  expect(posts).toHaveLength(8);
  expect(posts.some((post) => post.title === "Old Amakuru post")).toBe(true);
  expect(posts.some((post) => post.category === "Ubukungu")).toBe(false);
});

test.each(AMAKURU_DEPARTMENTS)("filters only the %s department", ({ name }) => {
  const posts = filterAmakuruPosts(samplePosts, {
    category: "Amakuru",
    department: name,
  });

  expect(posts).toHaveLength(1);
  expect(posts[0].amakuru_department).toBe(name);
});

test("search stays scoped to the selected Amakuru department", () => {
  const posts = filterAmakuruPosts(samplePosts, {
    category: "Amakuru",
    department: "Ubuzima",
    query: "Ubuzima",
  });

  expect(posts).toHaveLength(1);
  expect(posts[0].title).toBe("Ubuzima inkuru");
});