import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import dltLogo from "../../assets/dlt-logo.png";

const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activePage =
    location.pathname === "/" ? "dashboard" : location.pathname.substring(1);

  const navLinks = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/" },
    { id: "tickets", label: "Tickets", icon: "confirmation_number", path: "/tickets" },
  ];

  const NavLink = ({ item, onClick }) => (
    <Link
      className={`flex items-center gap-3 px-3 py-3 rounded-full transition-colors group ${
        activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket"))
          ? "bg-primary/10 text-primary dark:text-primary"
          : "text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2620]"
      }`}
      to={item.path}
      onClick={onClick}
    >
      <span
        className={`material-symbols-outlined ${
          activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket")) ? "fill-1" : ""
        }`}
      >
        {item.icon}
      </span>
      <span
        className={`text-sm ${
          activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket")) ? "font-bold" : "font-medium"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-white dark:bg-[#111714] border-b border-gray-200 dark:border-[#29382f]">
        <img src={dltLogo} alt="DLT Logo" className="h-8 w-auto" />
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2620] text-slate-600 dark:text-gray-300 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#111714] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-[#29382f]">
          <img src={dltLogo} alt="DLT Logo" className="h-8 w-auto" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2620] text-slate-600 dark:text-gray-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {navLinks.map((item) => (
            <NavLink key={item.id} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-shrink-0 flex-col border-r border-gray-200 dark:border-[#29382f] bg-white dark:bg-[#111714] transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 dark:border-[#29382f]">
          <div className="flex items-center gap-3">
            <h1 className="hidden lg:block text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              <img src={dltLogo} alt="DLT Logo" className="h-10 w-auto" />
            </h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {navLinks.map((item) => (
            <Link
              key={item.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-full transition-colors group ${
                activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket"))
                  ? "bg-primary/10 text-primary dark:text-primary"
                  : "text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2620]"
              }`}
              to={item.path}
            >
              <span
                className={`material-symbols-outlined ${
                  activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket")) ? "fill-1" : ""
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`hidden lg:block text-sm ${
                  activePage === item.id || (item.id === "tickets" && activePage.startsWith("ticket")) ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
