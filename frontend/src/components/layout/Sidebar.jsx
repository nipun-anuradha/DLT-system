import { Link, useLocation } from "react-router-dom";
import dltLogo from "../../assets/dlt-logo.png";

const Sidebar = () => {
  const location = useLocation();
  const activePage =
    location.pathname === "/" ? "dashboard" : location.pathname.substring(1);

  return (
    <aside className="w-20 lg:w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#29382f] bg-white dark:bg-[#111714] transition-all duration-300">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 dark:border-[#29382f]">
        <div className="flex items-center gap-3">
          <h1 className="hidden lg:block text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <img src={dltLogo} alt="DLT Logo" className="h-10 w-auto" />
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        <Link
          className={`flex items-center gap-3 px-3 py-3 rounded-full transition-colors group ${
            activePage === "dashboard"
              ? "bg-primary/10 text-primary dark:text-primary"
              : "text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2620]"
          }`}
          to="/"
        >
          <span
            className={`material-symbols-outlined ${
              activePage === "dashboard" ? "fill-1" : ""
            }`}
          >
            dashboard
          </span>
          <span
            className={`hidden lg:block text-sm ${
              activePage === "dashboard" ? "font-bold" : "font-medium"
            }`}
          >
            Dashboard
          </span>
        </Link>

        <Link
          className={`flex items-center gap-3 px-3 py-3 rounded-full transition-colors group ${
            activePage === "tickets"
              ? "bg-primary/10 text-primary dark:text-primary"
              : "text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2620]"
          }`}
          to="/tickets"
        >
          <span
            className={`material-symbols-outlined ${
              activePage === "tickets" ? "fill-1" : ""
            }`}
          >
            confirmation_number
          </span>
          <span
            className={`hidden lg:block text-sm ${
              activePage === "tickets" ? "font-bold" : "font-medium"
            }`}
          >
            Tickets
          </span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
