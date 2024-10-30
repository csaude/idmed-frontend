<template>
  <q-responsive :ratio="16 / 9">
    <q-layout v-cloak>
      <q-page-container>
        <q-dialog
          persistent
          transition-show="slide-up"
          transition-hide="slide-down"
          v-model="popUpUrlMobile"
        >
          <UrlChanger />
        </q-dialog>
        <div v-if="loading">
          <!-- Spinner opcional enquanto o splash screen está carregando -->
          <q-avatar size="100px">
            <q-img src="~assets/LogoiDMED.png" />
          </q-avatar>
          <q-spinner size="50px" color="primary" />
        </div>
        <div v-else>
          <router-view />
        </div>
      </q-page-container>
    </q-layout>
  </q-responsive>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSystemUtils } from './composables/shared/systemUtils/systemUtils';
import { useOffline } from './composables/shared/loadParamsToOffline/offline';
import UrlChanger from 'src/components/Shared/UrlChanger.vue';

const loading = ref(true);
const popUpUrlMobile = ref(false);
const { website } = useSystemUtils();
const { loadClinicsDataFromBackEndToPinia } = useOffline();

onMounted(async () => {
  if (website.value) {
    loading.value = false;
  } else {
    if (localStorage.getItem('backend_url') === null) {
      popUpUrlMobile.value = true;
    } else {
      await loadClinicsDataFromBackEndToPinia().then((clinic_resp) => {
        if (clinic_resp) {
          loading.value = false;
        }
      });
    }
  }
});
</script>
