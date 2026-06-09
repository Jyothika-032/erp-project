const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// @desc    Get permissions for a specific role
// @route   GET /api/role-permissions/:id
const getPermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const data = await sequelize.query(
      'SELECT * FROM role_permissions WHERE role_id = :roleId',
      { replacements: { roleId }, type: QueryTypes.SELECT }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update permissions for a specific role
// @route   PUT /api/role-permissions/:id
const updatePermissions = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const roleId = req.params.id;
    const { permissions } = req.body; // Expecting an array of permission objects

    // 1. Delete all existing permissions for this role
    await sequelize.query(
      'DELETE FROM role_permissions WHERE role_id = :roleId',
      { replacements: { roleId }, type: QueryTypes.DELETE, transaction }
    );

    // 2. Insert new permissions if any
    if (permissions && permissions.length > 0) {
      for (const perm of permissions) {
        await sequelize.query(
          `INSERT INTO role_permissions (role_id, module_name, can_create, can_view, can_update, can_delete) 
           VALUES (:roleId, :moduleName, :canCreate, :canView, :canUpdate, :canDelete)`,
          {
            replacements: {
              roleId,
              moduleName: perm.module_name,
              canCreate: perm.can_create || false,
              canView: perm.can_view || false,
              canUpdate: perm.can_update || false,
              canDelete: perm.can_delete || false,
            },
            type: QueryTypes.INSERT,
            transaction
          }
        );
      }
    }

    await transaction.commit();
    res.json({ success: true, message: 'Permissions updated successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPermissions, updatePermissions };
