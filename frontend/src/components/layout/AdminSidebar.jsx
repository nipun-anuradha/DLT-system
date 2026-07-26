import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import dltLogo from "../../assets/dlt-logo.png";

const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  // Determine active page based on path
  const getActivePage = () => {
    if (location.pathname === "/admin/dashboard") return "dashboard";
    if (location.pathname.startsWith("/admin/tickets")) return "tickets";
    if (location.pathname.startsWith("/admin/users")) return "users";
    if (location.pathname.startsWith("/admin/inventory")) return "inventory";
    if (location.pathname.startsWith("/admin/notices")) return "notices";
    if (location.pathname.startsWith("/admin/settings")) return "settings";
    return "";
  };

  const activePage = getActivePage();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-background-dark border-r border-[#28392f] flex-col flex-shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "flex fixed inset-y-0 left-0" : "hidden"
        } lg:flex lg:relative lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-4">
              <img src={dltLogo} alt="DLT Logo" className="h-10 w-auto" />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <Link
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activePage === "dashboard"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
            }`}
            to="/admin/dashboard"
          >
            <span
              className={`material-symbols-outlined ${
                activePage === "dashboard" ? "fill" : ""
              }`}
            >
              dashboard
            </span>
            <p
              className={`text-sm ${
                activePage === "dashboard" ? "font-bold" : "font-medium"
              } leading-normal`}
            >
              Dashboard
            </p>
          </Link>

          <Link
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activePage === "tickets"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
            }`}
            to="/admin/tickets"
          >
            <span
              className={`material-symbols-outlined ${
                activePage === "tickets" ? "fill" : ""
              }`}
            >
              confirmation_number
            </span>
            <p
              className={`text-sm ${
                activePage === "tickets" ? "font-bold" : "font-medium"
              } leading-normal`}
            >
              Tickets
            </p>
          </Link>

          <Link
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activePage === "users"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
            }`}
            to="/admin/users"
          >
            <span
              className={`material-symbols-outlined ${
                activePage === "users" ? "fill" : ""
              }`}
            >
              group
            </span>
            <p
              className={`text-sm ${
                activePage === "users" ? "font-bold" : "font-medium"
              } leading-normal`}
            >
              Users
            </p>
          </Link>

          <Link
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activePage === "inventory"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
            }`}
            to="/admin/inventory"
          >
            <span
              className={`material-symbols-outlined ${
                activePage === "inventory" ? "fill" : ""
              }`}
            >
              inventory_2
            </span>
            <p
              className={`text-sm ${
                activePage === "inventory" ? "font-bold" : "font-medium"
              } leading-normal`}
            >
              Inventory
            </p>
          </Link>

          <Link
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activePage === "notices"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
            }`}
            to="/admin/notices"
          >
            <span
              className={`material-symbols-outlined ${
                activePage === "notices" ? "fill" : ""
              }`}
            >
              campaign
            </span>
            <p
              className={`text-sm ${
                activePage === "notices" ? "font-bold" : "font-medium"
              } leading-normal`}
            >
              Notices
            </p>
          </Link>

          <Link
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#9cbaa8] hover:bg-[#28392f] hover:text-white transition-all duration-200"
            to="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </Link>
        </nav>

        <div className="p-4 flex flex-col gap-4 border-t border-[#28392f]">
          <a
            className="flex items-center gap-3 px-3 py-2 text-[#9cbaa8] hover:text-white transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <p className="text-sm font-medium leading-normal">Help & Support</p>
          </a>
          <button 
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#28392f] hover:bg-[#34463b] text-white border border-[#3b5445] text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
          >
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;