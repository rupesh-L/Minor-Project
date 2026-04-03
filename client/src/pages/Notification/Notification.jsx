import { useSelector, useDispatch } from "react-redux";
import { markAllRead } from "../../redux/slice/notificationSlice/notificationSlice";
import { useEffect } from "react";

const Notification = () => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>

      {messages.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>No notifications yet.</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg._id} className="card bg-base-100 shadow-md p-4">
              <p className="text-base-content">{msg.message}</p>
              <p className="text-green-500">
                Created At:{" "}
                {new Date(msg.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <p className="text-blue-400">
                OrderId: {msg?.updatedOrder?.orderId} | Total Items:{" "}
                {msg?.updatedOrder?.orderItems.length} | Status:{" "}
                {msg?.updatedOrder?.orderStatus}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
