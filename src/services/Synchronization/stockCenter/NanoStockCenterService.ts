import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import Stock from 'src/stores/models/stock/Stock';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import StockCenter from 'src/stores/models/stockcenter/StockCenter';
import DestroyedStock from 'src/stores/models/stockdestruction/DestroyedStock';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import Inventory from 'src/stores/models/stockinventory/Inventory';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const StockCenterDexie = db[StockCenter.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockCenter?offset=' + offset + '&max=100')
        .then((resp) => {
          StockCenterService.addBulkMobile(resp.data);
          console.log('Data synced from backend: stockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getStock(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stock?offset=' + offset + '&max=100')
        .then((resp) => {
          const stocks = [];
          for (let i = 0; i < resp.data.length; i++) {
            const obj = resp.data[i];

            obj.drug_id = obj.drug.id;
            stocks.push(obj);
          }
          nSQL(Stock.entity).query('upsert', stocks).exec();
          console.log('Data synced from backend: StockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getStock(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getStockEntrance(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('stockEntrance?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(StockEntrance.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: StockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getStockEntrance(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },
  async getDestroyedStock(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('destroyedStock?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(DestroyedStock.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: StockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getDestroyedStock(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },
  async getInventory(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('inventory?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(Inventory.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: StockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getInventory(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getInventoryStockAdjustment(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('inventoryStockAdjustment?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(InventoryStockAdjustment.entity)
            .query('upsert', resp.data)
            .exec();
          console.log('Data synced from backend: StockCenter');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getInventoryStockAdjustment(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania StockCenter');
    (await SynchronizationService.hasData(StockCenterDexie))
      ? await StockCenterService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie StockCenter');
    const getAllStockCenter = StockCenterService.getAllFromStorage();
    await StockCenterDexie.bulkPut(getAllStockCenter);
  },
};
