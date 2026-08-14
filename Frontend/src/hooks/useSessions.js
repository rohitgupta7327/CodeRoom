import { useMutation, useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sessionApi } from "../api/session";

export const useCreateSession = () => {
    const result = useMutation({
        mutationKey: ["createSession"],
        mutationFn: sessionApi.createSession,
        onSuccess: () => {
            toast.success("Session created successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create session");
        }
    });
    return result;
};

export const useActiveSession = () => {
    const result = useQuery({
        queryKey: ["activeSessions"],
        queryFn: sessionApi.getActiveSessions,
        refetchOnMount: true,
        staleTime: 0,
    });

    return result;
};
export const useActiveSessions = useActiveSession;

export const useMyRecentSession = () => {
    const result = useQuery({
        queryKey: ["myRecentSessions"],
        queryFn: sessionApi.getMyRecentSessions
    });

    return result;
};
export const useMyRecentSessions = useMyRecentSession;

export const useSessionById = (id) => {
    const result = useQuery({
        queryKey: ["session", id],
        queryFn: () => sessionApi.getSessionById(id),
        enabled: !!id,
        refetchInterval: 5000,   // refetch every 5 seconds to detect session status changes

    });

    return result;
};

export const useJoinSession = () => {
    const result = useMutation({
        mutationKey: ["joinSession"],
        mutationFn: (id) => sessionApi.joinSession(id),
        onSuccess: () => {
            toast.success("Joined session successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to join session");
        }

    });

    return result;
};

export const useLeaveSession = () => {
    const result = useMutation({
        mutationKey: ["leaveSession"],
        mutationFn: (id) => sessionApi.leaveSession(id),
        onSuccess: () => {
            toast.success("Left session successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to leave session");
        }

    });

    return result;
};

export const useEndSession = () => {
    const result = useMutation({
        mutationKey: ["endSession"],
        mutationFn: (id) => sessionApi.endSession(id),
        onSuccess: () => {
            toast.success("Session ended successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to end session");
        }

    });

    return result;
};
