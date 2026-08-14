import React from 'react';
import { checkPermission } from '../config/permissions';

/**
 * Wraps elements and restricts visibility or interaction based on role permissions.
 * 
 * Usage:
 * <Restricted user={user} feature="carrier_rates" action="edit" fallback={<p>Read Only</p>}>
 *   <button onClick={handleSave}>Update Rates</button>
 * </Restricted>
 */
export default function Restricted({ 
  user, 
  feature, 
  action = 'view', 
  children, 
  fallback = null, 
  disableOnly = false 
}) {
  const isAllowed = checkPermission(user?.role, feature, action);

  if (isAllowed) {
    return <>{children}</>;
  }

  // If disableOnly is true, render the child but in a disabled state
  if (disableOnly && React.isValidElement(children)) {
    return React.cloneElement(children, {
      disabled: true,
      style: { ...(children.props.style || {}), opacity: 0.5, cursor: 'not-allowed' },
      title: `You do not have ${action} permissions for ${feature}`,
    });
  }

  return fallback;
}