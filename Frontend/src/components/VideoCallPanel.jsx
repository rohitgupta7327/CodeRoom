import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import {
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  CallControls,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";
import { Chat, Channel, Window, MessageList, MessageComposer, Thread } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/index.css";

import { sessionApi } from "../api/session";
import { initializeStreamClient } from "../lib/stream";
import { Loader2Icon, MessageSquareIcon, UsersIcon, VideoIcon, XIcon } from "lucide-react";

function VideoCallUI({ chatClient, channel, onLeaveCall }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipants, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const rawParticipantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLeave = () => {
    if (onLeaveCall) {
      onLeaveCall();
    } else {
      navigate("/dashboard");
    }
  };

  // Count unique users by userId, falling back to raw count if participant array is initializing
  const uniqueUserIds = new Set(participants.map((p) => p.userId || p.user?.id).filter(Boolean));
  const uniqueParticipantCount = uniqueUserIds.size || rawParticipantCount || 1;

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full bg-base-300 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-10 h-10 mx-auto animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-base-content/70">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-2 relative bg-base-300 p-2 overflow-hidden str-video">
      {/* MAIN VIDEO CALL SECTION */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header bar: Participant count & Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 px-3 py-2 rounded-lg shadow text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary" />
            <span>
              {uniqueParticipantCount} {uniqueParticipantCount === 1 ? "participant" : "participants"}
            </span>
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-xs gap-1.5 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
              title={isChatOpen ? "Hide chat" : "Show chat"}
            >
              <MessageSquareIcon className="size-3.5" />
              Chat
            </button>
          )}
        </div>

        {/* Video Grid / Speaker Layout */}
        <div className="flex-1 bg-black/50 rounded-lg overflow-hidden relative flex items-center justify-center">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Call Controls Bar */}
        <div className="bg-base-100 p-2 rounded-lg shadow flex justify-center shrink-0">
          <CallControls onLeave={handleLeave} />
        </div>
      </div>

      {/* SIDEBAR LIVE CHAT PANEL */}
      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out shrink-0 ${isChatOpen ? "w-72 sm:w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
            }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] px-3 py-2 border-b border-[#3a3d44] flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-white text-xs sm:text-sm">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageComposer />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function VideoCallPanel({ session, onLeaveCall }) {
  const { user } = useUser();
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [call, setCall] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const callId = session?.callId;

  useEffect(() => {
    let isCancelled = false;
    let vClient;
    let cClient;
    let currentCall;

    async function initStream() {
      if (!user || !callId) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Get Stream Token & API Key dynamically from Backend
        const tokenData = await sessionApi.getStreamToken();
        if (isCancelled) return;
        const { token, apiKey } = tokenData;

        const streamKey = apiKey || import.meta.env.VITE_STREAM_API_KEY;

        const userData = {
          id: user.id,
          name: user.fullName || user.username || "User",
          image: user.imageUrl,
        };

        // 2. Initialize / Reuse Stream Video Client & Call
        vClient = await initializeStreamClient(userData, token, streamKey);
        if (isCancelled) return;

        currentCall = vClient.call("default", callId);
        if (currentCall.state.callingState !== CallingState.JOINED) {
          await currentCall.join({ create: true });
        }

        if (isCancelled) {
          await currentCall.leave().catch(console.error);
          return;
        }

        // 3. Initialize Chat Client & Channel
        cClient = StreamChat.getInstance(streamKey);
        if (cClient.userID !== userData.id) {
          await cClient.connectUser(userData, token);
        }

        if (isCancelled) {
          await currentCall.leave().catch(console.error);
          await cClient.disconnectUser().catch(console.error);
          return;
        }

        const currentChannel = cClient.channel("messaging", callId);
        await currentChannel.watch();

        if (isCancelled) {
          await currentCall.leave().catch(console.error);
          await cClient.disconnectUser().catch(console.error);
          return;
        }

        setVideoClient(vClient);
        setCall(currentCall);
        setChatClient(cClient);
        setChannel(currentChannel);
      } catch (err) {
        if (!isCancelled) {
          console.error("Stream initialization error:", err);
          setError(err.message || "Failed to connect video & chat");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    initStream();

    return () => {
      isCancelled = true;
      if (currentCall) {
        currentCall.leave().catch(console.error);
      }
      if (cClient) {
        cClient.disconnectUser().catch(console.error);
      }
    };
  }, [user, callId]);

  if (loading) {
    return (
      <div className="h-full bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <Loader2Icon className="size-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-semibold text-base-content/70">Connecting Video Call & Chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-base-300 flex flex-col items-center justify-center p-6 text-center text-error">
        <p className="text-sm font-semibold mb-1">Connection Error</p>
        <p className="text-xs text-base-content/60 max-w-xs">{error}</p>
      </div>
    );
  }

  if (!videoClient || !call) {
    return (
      <div className="h-full bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <VideoIcon className="size-8 text-base-content/40 mb-2" />
        <p className="text-sm font-medium text-base-content/60">Video Call Unavailable</p>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <VideoCallUI chatClient={chatClient} channel={channel} onLeaveCall={onLeaveCall} />
      </StreamCall>
    </StreamVideo>
  );
}