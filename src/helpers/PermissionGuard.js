import React, { useContext } from "react";
import { AuthContexte } from "../Context/AuthContext";

/**
 * Permission guard component that checks if user has required permission
 * @param {Object} props
 * @param {string} props.requiredPermission - The permission needed to access component
 * @param {React.ReactElement} props.element - Component to render if permission exists
 * @param {React.ReactElement} props.fallback - Component to render if permission doesn't exist
 * @returns {React.ReactElement}
 */
export default function PermissionGuard({
  requiredPermission,
  element,
  fallback = null,
}) {
  const { userPrivileges } = useContext(AuthContexte);

  // Check if the user has the required permission
  const hasPermission = userPrivileges.includes(requiredPermission);

  // Return the component if user has permission, otherwise redirect
  return hasPermission ? element : fallback;
}

{
  /* <PermissionGuard
requiredPermission="tags.create"
element={<TagAdd setData={setData} data={data} />}
fallback={null} // Show nothing if no permission
/> */
}
