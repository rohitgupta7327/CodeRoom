import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, WifiOffIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

function Navbar() {
    const location = useLocation();
    const isOnline = useNetworkStatus();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
                    {/* LOGO */}
                    <Link
                        to="/"
                        className="group flex items-center gap-2.5 sm:gap-3 hover:scale-105 transition-transform duration-200"
                    >
                        <div className="size-9 sm:size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg shrink-0">
                            <SparklesIcon className="size-5 sm:size-6 text-white" />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-black text-lg sm:text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                                Code Room
                            </span>
                            <span className="text-[10px] sm:text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* PROBLEMS PAGE LINK */}
                        <Link
                            to={"/problems"}
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 
                  ${isActive("/problems")
                                    ? "bg-primary text-primary-content"
                                    : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                                }
                  `}
                        >
                            <div className="flex items-center gap-x-2">
                                <BookOpenIcon className="size-4" />
                                <span className="font-medium hidden sm:inline">Problems</span>
                            </div>
                        </Link>

                        {/* DASHBOARD PAGE LINK */}
                        <Link
                            to={"/dashboard"}
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 
                  ${isActive("/dashboard")
                                    ? "bg-primary text-primary-content"
                                    : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                                }
                  `}
                        >
                            <div className="flex items-center gap-x-2">
                                <LayoutDashboardIcon className="size-4" />
                                <span className="font-medium hidden sm:inline">Dashboard</span>
                            </div>
                        </Link>

                        <div className="ml-1 sm:ml-4">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </nav>

            {!isOnline && (
                <div className="bg-error text-error-content px-4 py-2 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-[57px] z-40 shadow-md">
                    <WifiOffIcon className="size-4 animate-bounce" />
                    <span>Internet Disconnected — Please check your network connection.</span>
                </div>
            )}
        </>
    );
}
export default Navbar;