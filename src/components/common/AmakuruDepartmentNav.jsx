import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AMAKURU_DEPARTMENTS } from "../../utils/amakuruDepartments";

/* Secondary navigation for the Amakuru section. It sits directly under the
   main header so the departments are always one click away, and it doubles as
   the page's breadcrumb: the active pill names the department being read.

   "Byose" is the catch-all and deliberately has no slug, so /amakuru is the
   Byose view and every other department is /amakuru/<slug>. */
export default function AmakuruDepartmentNav() {
  const { pathname } = useLocation();
  const activeSlug = pathname.replace(/^\/amakuru\/?/, "").split("/")[0];

  const links = useMemo(
    () => [
      { name: "Byose", slug: "", to: "/amakuru" },
      ...AMAKURU_DEPARTMENTS.map((department) => ({
        ...department,
        to: `/amakuru/${department.slug}`,
      })),
    ],
    []
  );

  return (
    <nav
      aria-label="Amakuru departments"
      className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mb-6"
    >
      {/* Brand accent rule, matching the rule above the section headings. */}
      <div className="h-1 w-full bg-red-600" aria-hidden="true" />

      {/* Every department stays on screen at all widths: the rail wraps onto
          extra rows on phones instead of hiding departments behind a swipe. */}
      <div className="scrollbar-hide-x flex flex-wrap items-center gap-x-1.5 gap-y-1.5 px-3 py-2.5 sm:gap-x-2 sm:gap-y-2 sm:px-4 sm:py-3">
        <span className="mr-0.5 shrink-0 border-r border-slate-200 pr-2 font-body text-[9px] font-black uppercase leading-none tracking-[0.14em] text-red-600 xs:text-[9.5px] xs:tracking-[0.16em] sm:pr-3 sm:text-[10px] sm:tracking-[0.18em]">
          Amakuru:
        </span>

        {links.map((link) => {
          const isActive = link.slug === activeSlug;

          return (
            <Link
              key={link.slug || "all"}
              to={link.to}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap border px-2 py-1.5 font-body text-[9.5px] font-bold uppercase leading-none tracking-[0.03em] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 min-h-[32px] xs:px-2.5 xs:text-[10px] xs:tracking-[0.04em] sm:min-h-0 sm:px-3 sm:text-[10.5px] sm:tracking-[0.08em] lg:px-3.5 lg:text-[11px] lg:tracking-[0.1em] ${
                isActive
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-transparent bg-transparent text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
