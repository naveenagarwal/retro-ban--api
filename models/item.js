module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Item", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    status: DataTypes.STRING
  });
}