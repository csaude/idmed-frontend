// import Stock from 'src/stores/models/stock/Stock'

export default {
  async hasData(tableName: any) {
    const count = await tableName.count(); // Replace 'tableName' with your actual table name
    return count <= 0; // Returns true if there are records in the table
  },
};
