export enum Permission {
  // Board permissions
  VIEW_BOARD = 'VIEW_BOARD',
  EDIT_BOARD = 'EDIT_BOARD',
  DELETE_BOARD = 'DELETE_BOARD',
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  
  // List permissions
  CREATE_LIST = 'CREATE_LIST',
  EDIT_LIST = 'EDIT_LIST',
  DELETE_LIST = 'DELETE_LIST',
  REORDER_LISTS = 'REORDER_LISTS',
  
  // Card permissions
  CREATE_CARD = 'CREATE_CARD',
  EDIT_CARD = 'EDIT_CARD',
  DELETE_CARD = 'DELETE_CARD',
  MOVE_CARD = 'MOVE_CARD',
  
  // Card content permissions
  EDIT_CARD_DETAILS = 'EDIT_CARD_DETAILS',
  EDIT_CARD_DESCRIPTION = 'EDIT_CARD_DESCRIPTION',
  EDIT_CARD_DUE_DATE = 'EDIT_CARD_DUE_DATE',
  MANAGE_CARD_LABELS = 'MANAGE_CARD_LABELS',
  MANAGE_CARD_ATTACHMENTS = 'MANAGE_CARD_ATTACHMENTS',
  MANAGE_CARD_COMMENTS = 'MANAGE_CARD_COMMENTS',
  MANAGE_CARD_CHECKLISTS = 'MANAGE_CARD_CHECKLISTS',
  
  // Checklist permissions
  COMPLETE_CHECKLIST_ITEM = 'COMPLETE_CHECKLIST_ITEM',
  EDIT_CHECKLIST_ITEM = 'EDIT_CHECKLIST_ITEM',
  DELETE_CHECKLIST_ITEM = 'DELETE_CHECKLIST_ITEM',
  CREATE_CHECKLIST_ITEM = 'CREATE_CHECKLIST_ITEM',
  
  // Comment permissions
  CREATE_COMMENT = 'CREATE_COMMENT',
  EDIT_COMMENT = 'EDIT_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: [
    // Board permissions
    Permission.VIEW_BOARD,
    Permission.EDIT_BOARD,
    Permission.DELETE_BOARD,
    Permission.MANAGE_MEMBERS,
    
    // List permissions
    Permission.CREATE_LIST,
    Permission.EDIT_LIST,
    Permission.DELETE_LIST,
    Permission.REORDER_LISTS,
    
    // Card permissions
    Permission.CREATE_CARD,
    Permission.EDIT_CARD,
    Permission.DELETE_CARD,
    Permission.MOVE_CARD,
    
    // Card content permissions
    Permission.EDIT_CARD_DETAILS,
    Permission.EDIT_CARD_DESCRIPTION,
    Permission.EDIT_CARD_DUE_DATE,
    Permission.MANAGE_CARD_LABELS,
    Permission.MANAGE_CARD_ATTACHMENTS,
    Permission.MANAGE_CARD_COMMENTS,
    Permission.MANAGE_CARD_CHECKLISTS,
    
    // Checklist permissions
    Permission.COMPLETE_CHECKLIST_ITEM,
    Permission.EDIT_CHECKLIST_ITEM,
    Permission.DELETE_CHECKLIST_ITEM,
    Permission.CREATE_CHECKLIST_ITEM,
    
    // Comment permissions
    Permission.CREATE_COMMENT,
    Permission.EDIT_COMMENT,
    Permission.DELETE_COMMENT,
  ],
  
  VIEWER: [
    // Basic viewing permissions
    Permission.VIEW_BOARD,
    
    // Limited card permissions
    Permission.MOVE_CARD, // Can drag and drop
    
    // Checklist permissions (can complete items)
    Permission.COMPLETE_CHECKLIST_ITEM,
    
    // Comment permissions (can create but not edit/delete)
    Permission.CREATE_COMMENT,
  ],
};

export function hasPermission(
  userRole: string,
  permission: Permission,
  isBoardOwner: boolean = false
): boolean {
  // Board owner has all permissions regardless of role
  if (isBoardOwner) {
    return true;
  }
  
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function canPerformAction(
  userRole: string,
  action: string,
  isBoardOwner: boolean = false
): boolean {
  // Map common actions to permissions
  const actionPermissionMap: Record<string, Permission> = {
    'view_board': Permission.VIEW_BOARD,
    'edit_board': Permission.EDIT_BOARD,
    'delete_board': Permission.DELETE_BOARD,
    'manage_members': Permission.MANAGE_MEMBERS,
    'create_list': Permission.CREATE_LIST,
    'edit_list': Permission.EDIT_LIST,
    'delete_list': Permission.DELETE_LIST,
    'reorder_lists': Permission.REORDER_LISTS,
    'create_card': Permission.CREATE_CARD,
    'edit_card': Permission.EDIT_CARD,
    'delete_card': Permission.DELETE_CARD,
    'move_card': Permission.MOVE_CARD,
    'edit_card_details': Permission.EDIT_CARD_DETAILS,
    'edit_card_description': Permission.EDIT_CARD_DESCRIPTION,
    'edit_card_due_date': Permission.EDIT_CARD_DUE_DATE,
    'manage_card_labels': Permission.MANAGE_CARD_LABELS,
    'manage_card_attachments': Permission.MANAGE_CARD_ATTACHMENTS,
    'manage_card_comments': Permission.MANAGE_CARD_COMMENTS,
    'manage_card_checklists': Permission.MANAGE_CARD_CHECKLISTS,
    'complete_checklist_item': Permission.COMPLETE_CHECKLIST_ITEM,
    'edit_checklist_item': Permission.EDIT_CHECKLIST_ITEM,
    'delete_checklist_item': Permission.DELETE_CHECKLIST_ITEM,
    'create_checklist_item': Permission.CREATE_CHECKLIST_ITEM,
    'create_comment': Permission.CREATE_COMMENT,
    'edit_comment': Permission.EDIT_COMMENT,
    'delete_comment': Permission.DELETE_COMMENT,
  };
  
  const permission = actionPermissionMap[action];
  if (!permission) {
    return false;
  }
  
  return hasPermission(userRole, permission, isBoardOwner);
}
