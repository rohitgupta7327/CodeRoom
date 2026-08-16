export const getDifficultyBadgeClass = (difficulty) => {
    if (!difficulty) return "badge-info";
    switch (difficulty.toLowerCase()) {
        case "easy":
            return "badge-success";
        case "medium":
            return "badge-warning";
        case "hard":
            return "badge-error";
        default:
            return "badge-info";
    }
};

export const formatSessionDate = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatSessionTime = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatSessionDuration = (startDateInput, endDateInput) => {
    if (!startDateInput) return "N/A";
    const start = new Date(startDateInput);
    const end = endDateInput ? new Date(endDateInput) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";

    const diffInMs = Math.max(0, end.getTime() - start.getTime());
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInMins < 1) return "< 1 min";
    if (diffInMins < 60) return `${diffInMins} mins`;

    const hours = Math.floor(diffInMins / 60);
    const mins = diffInMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};