import { useOutletContext } from "react-router-dom";

const DashboardUser = () => {
  const { users } = useOutletContext(); // get users from DashboardLayout

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <div className="overflow-x-auto shadow rounded">
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-2 border">Full Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Verified</th>
              <th className="p-2 border">Profile Updated</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-2 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-green-600">
                <td className="p-2 border">{user.fullName}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border capitalize">{user.role}</td>
                <td className="p-2 border">{user.isVerified ? "Yes" : "No"}</td>
                <td className="p-2 border">
                  {user.hasUpdatedProfile ? "Yes" : "No"}
                </td>
                <td className="p-2 border">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardUser;
