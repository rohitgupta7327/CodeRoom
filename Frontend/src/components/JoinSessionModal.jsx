import { useState } from "react";
import { useNavigate } from "react-router";
import { LinkIcon, LogInIcon } from "lucide-react";
import toast from "react-hot-toast";

function JoinSessionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [sessionInput, setSessionInput] = useState("");

  if (!isOpen) return null;

  const extractSessionId = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    // Check if full URL or path containing /session/<id>
    const match = trimmed.match(/\/session\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const sessionId = extractSessionId(sessionInput);

    if (!sessionId) {
      toast.error("Please enter a valid session link or ID");
      return;
    }

    setSessionInput("");
    onClose();
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-2xl mb-2 flex items-center gap-2">
          <LogInIcon className="size-6 text-accent" />
          Join Existing Session
        </h3>
        <p className="text-sm text-base-content/70 mb-6">
          Paste the invite link or Session ID shared by the host to enter the real-time coding room.
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="form-control w-full space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Session Link or ID</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                className="input input-bordered w-full pl-10 text-sm font-mono"
                placeholder="e.g. http://localhost:5173/session/68a123... or 68a123..."
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value)}
                autoFocus
              />
              <LinkIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSessionInput("");
                onClose();
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-accent gap-2"
              disabled={!sessionInput.trim()}
            >
              <LogInIcon className="size-4" />
              Join Room
            </button>
          </div>
        </form>
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default JoinSessionModal;
