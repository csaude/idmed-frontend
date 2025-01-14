import db from '../stores/dexie';
import { PiniaPluginContext } from 'pinia';

export default function persistedStateDexiePlugin() {
  return (context: PiniaPluginContext) => {
    const { store } = context;
    const table = db.table(store.$id);

    // Rehydrate the store state from Dexie
    const rehydrateStore = async () => {
      try {
        // const limit = 100;
        // let offset = 0;

        while (true) {
          const dataFromDexie = await table
            // .offset(offset)
            // .limit(limit)
            .toArray();
          if (dataFromDexie.length === 0) break;

          const patchData: Record<string, any> = {};
          dataFromDexie.forEach((item: any) => {
            patchData[item.id] = item;
          });

          store.$patch((state: any) => {
            state.data = {
              ...state.data,
              ...patchData,
            };
          });

          // offset += limit;
        }
        console.log(`Rehydrated store ${store.$id} from Dexie.`);
      } catch (error) {
        console.error(
          `Error rehydrating store ${store.$id} from Dexie:`,
          error
        );
      }
    };
    // Check if store is empty before rehydrating
    if (!store?.state?.data || Object.keys(store?.state?.data).length === 0) {
      console.log('Store is empty. Rehydrating...');
      rehydrateStore();
    } else {
      console.log('Store already contains data:', store?.state?.data);
    }
    // rehydrateStore();

    // Watch for changes to the store and persist them to Dexie
    store.$subscribe(async (_, state) => {
      const stateData = state.data || {};
      const jsonStateData = JSON.stringify(stateData);
      const entityState = JSON.parse(jsonStateData);
      const jsonEntityState = Object.values(entityState);
      const validEntities = jsonEntityState.filter(
        (item: any) => item && item.id
      );

      if (validEntities.length > 0) {
        try {
          // const chunkSize = 100; // Adjust chunk size as needed
          // const chunks = chunkArray(validEntities, chunkSize);

          // await table.clear();
          await table.bulkPut(validEntities); // Atualiza ou insere os dados no Dexie

          // for (const chunk of chunks) {
          //   await table.clear();
          //   await table.bulkPut(chunk); // Atualiza ou insere os dados no Dexie
          // }
        } catch (error) {
          console.error('Erro ao sincronizar com Dexie:', error);
        }
      }
    });
  };
}

function chunkArray(array: any, chunkSize: any) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
