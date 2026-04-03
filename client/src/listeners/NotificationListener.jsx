import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setMessages,
} from "../redux/slice/notificationSlice/notificationSlice";

import { getSocket } from "../services/socket";
import { toast } from "react-toastify";

const NotificationListener = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();

    // register user with backend
    socket.emit("register", user._id);

    // listen for new messages
    socket.on("receiveMessage", (msg) => {
      console.log(msg);
      dispatch(addMessage(msg));
      console.log("New notification:", msg.message);
      toast.info(msg.message);
    });

    // load old messages
    socket.on("loadMessages", (msgs) => {
      dispatch(setMessages(msgs));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("loadMessages");
    };
  }, [user, dispatch]);

  return null;
};

export default NotificationListener;
