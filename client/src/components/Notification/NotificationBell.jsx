import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const { unreadCount } = useSelector((state) => state.notification);

  return (
    <Link to="/notifications" className="relative inline-block">
      <button className="btn btn-ghost btn-circle">
        <span className="text-xl">🔔</span>
      </button>

      {unreadCount > 0 && (
        <span className="badge badge-xs badge-primary absolute top-0 right-0">
          {unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
