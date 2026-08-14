// src/utils/permissions.js

/**
 * Checks if a user has permission for a specific action/feature
 * @param {Object} user - The user object from auth context/state (contains user.permissions)
 * @param {string} feature - The feature identifier (e.g., 'telemetry', 'orders')
 * @param {string} action - 'view' or 'edit'
 */
export const hasPermission = (user, feature, action = 'view') => {
    if (!user || !user.permissions) return false;
  
    const { canView = [], canEdit = [] } = user.permissions;
    const targetList = action === 'edit' ? canEdit : canView;
  
    // Global access check (Admins)
    if (targetList.includes('*')) return true;
  
    return targetList.includes(feature);
  };