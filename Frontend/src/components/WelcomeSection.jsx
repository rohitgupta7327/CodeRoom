import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, LogInIcon, SparklesIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession, onJoinSession }) {
    const { user } = useUser();

    return (
        <div className="relative overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Welcome back, {user?.firstName || "there"}!
                            </h1>
                        </div>
                        <p className="text-sm sm:text-lg md:text-xl text-base-content/60 pl-13 sm:pl-15">
                            Ready to level up your coding skills?
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                        {/* CREATE SESSION BUTTON */}
                        <button
                            onClick={onCreateSession}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl transition-all duration-200 hover:opacity-90 cursor-pointer shadow-lg hover:shadow-primary/20"
                        >
                            <div className="flex items-center justify-center gap-3 text-white font-bold text-base sm:text-lg">
                                <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Create Session</span>
                                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        {/* JOIN SESSION BUTTON */}
                        <button
                            onClick={onJoinSession}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-base-200 hover:bg-base-100 border-2 border-accent/40 hover:border-accent text-base-content rounded-2xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-accent/20"
                        >
                            <div className="flex items-center justify-center gap-3 font-bold text-base sm:text-lg text-accent">
                                <LogInIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Join Session</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeSection;