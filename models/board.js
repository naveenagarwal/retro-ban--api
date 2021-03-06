module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Board", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING
  });
}