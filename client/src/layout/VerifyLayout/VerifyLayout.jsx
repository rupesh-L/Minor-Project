// VerifyLayout.jsx
import { Outlet } from "react-router-dom";

const VerifyLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          {/* Nested verification pages */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default VerifyLayout;
