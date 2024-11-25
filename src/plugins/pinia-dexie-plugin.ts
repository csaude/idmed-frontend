import { Table, IndexableType } from 'dexie';
import db from '../stores/dexie';
import { PiniaPluginContext, StateTree, Store } from 'pinia';

export default function persistedStateDexiePlugin() {
  return (context: PiniaPluginContext) => {
    const {
      pinia,
      store,
      options: { persist = true },
    } = context;
    const table = db.table(store.$id);
    if (!persist) return;

    // HMR handling, ignore stores created as 'hot' stores
    if (!(store.$id in pinia.state.value)) {
      // @ts-expect-error `_s` is a stripped @internal
      const originalStore: StoreGeneric = pinia._s.get(
        store.$id.replace('__hot:', '')
      );
      if (originalStore) Promise.resolve().then(() => originalStore.$persist());
      return;
    }

    const persistenceOptions = Array.isArray(persist)
      ? persist
      : persist === true
      ? [{}]
      : [persist];

    //  const persistences = persistenceOptions.map(optionsParser);
    const persistences = persistenceOptions;

    store.$hydrate = ({ runHooks = true } = {}) => {
      persistences.forEach((p) => {
        hydrateStore(store, context, runHooks, table);
      });
    };

    store.$persist = () => {
      persistences.forEach((p) => {
        persistState(store, store.$state, table);
      });
    };

    persistences.forEach((p) => {
      hydrateStore(store, context, true, table);

      store.$subscribe(
        (_mutation, state) => persistState(store, state, table),
        {
          detached: true,
        }
      );
    });

    // const { store } = context;
    // const table = db.table(store.$id);
    // // Rehydrate store from storage
    // try {
    //   syncingToPinia(store, table);
    // } catch (error) {
    //   console.error(
    //     `Failed to parse persisted state for store: ${store.$id}`,
    //     error
    //   );
    // }

    // // Watch for state changes and persist them
    // store.$subscribe(async (_, state) => {
    //   // console.log('vsfkvfs', _);
    //   syncingToDexie(store, state, table);
    // });
  };
}

function hydrateStore(
  store: Store,
  context: PiniaPluginContext,
  runHooks = true,
  table: Table<any, IndexableType, any>
) {
  try {
    // if (runHooks)
    //   beforeHydrate?.(context)

    // const fromStorage = storage.getItem(key);
    syncingToPinia(store, table);
    // if (fromStorage) {
    //   const deserialized = serializer.deserialize(fromStorage);
    //   store.$patch(deserialized);
    // }

    // if (runHooks)
    //   afterHydrate?.(context)
  } catch (error) {
    if (error) console.error('[pinia-plugin-persistedstate]', error);
  }
}

function persistState(
  store: Store,
  state: StateTree,
  table: Table<any, IndexableType, any>
) {
  try {
    // const picked = pick ? deepPickUnsafe(state, pick) : state;
    // const omitted = omit ? deepOmitUnsafe(picked, omit) : picked;
    // const toStorage = serializer.serialize(omitted);
    // storage.setItem(key, toStorage);
    syncingToDexie(store, state, table);
  } catch (error) {
    if (error) console.error('[pinia-plugin-persistedstate]', error);
  }
}

const syncingToDexie = async (store: any, state: any, table: any) => {
  const stateData = state.data || {};
  const jsonStateData = JSON.stringify(stateData);
  const entityState = JSON.parse(jsonStateData);
  const jsonEntityState = Object.values(entityState);
  const validEntities = jsonEntityState.filter((item: any) => item && item.id);

  if (validEntities.length > 0) {
    try {
      return await table.bulkPut(validEntities); // Atualiza ou insere os dados no Dexie
      // console.log('Dados sincronizados com Dexie:', validEntities);
    } catch (error) {
      console.error('Erro ao sincronizar com Dexie:', error);
    } finally {
      store._isSyncing = false;
    }
  }
};

const syncingToPinia = async (store: any, table: any) => {
  try {
    const limit = 100;
    let offset = 0;

    while (true) {
      const dataFromDexie = await table.offset(offset).limit(limit).toArray();
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

      offset += limit;
    }
    console.log('Dados sincronizados para Pinia:', store.$id);
  } catch (error) {
    console.error('Erro ao carregar dados para Pinia:', error);
  }
};
