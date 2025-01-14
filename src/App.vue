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
          <q-card flat :bordered="false">
            <q-card-section align="center" class="q-pt-none">
              <div class="row justify-center q-pt-xl q-gutter-xl">
                <div class="justify-left q-pt-xl">
                  <q-avatar round :size="'160px'">
                    <q-img src="~assets/MoHLogo.png" />
                  </q-avatar>
                </div>
                <q-separator spaced />
                <q-separator spaced />
                <div class="justify-left q-pb-lg">
                  <q-avatar square :size="'230px'">
                    <q-img src="~assets/pepfar-new-logo.jpeg" />
                  </q-avatar>
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-card class="flex flex-center" flat :bordered="false">
            <q-card-section>
              <div
                class="col-auto text-grey text-caption row no-wrap items-center justify-center"
              >
                <q-avatar size="220px">
                  <q-img src="~assets/LogoiDMED.png" />
                </q-avatar>
              </div>
              <div class="row text-center column">
                <p
                  style="font-family: 'line-awesome'"
                  class="text-gray text-h5 ellipsis text-weight-bold"
                >
                  Sistema Inteligente para Dispensa <br />
                  de Medicamentos
                </p>
              </div>
            </q-card-section>
          </q-card>

          <q-page-sticky>
            <span class="text-primary text-bold"
              >Carregando, por favor aguarde ...</span
            >
            <q-spinner size="100px" color="primary" />
          </q-page-sticky>
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
import UsersService from './services/UsersService';
import systemConfigsService from './services/api/systemConfigs/systemConfigsService';
import clinicService from './services/api/clinicService/clinicService';
import { useOnline } from './composables/shared/loadParams/online';

const loading = ref(true);
const popUpUrlMobile = ref(false);
const { website } = useSystemUtils();
const { loadClinicsDataFromBackEndToPinia } = useOffline();
const { loadConfigsSettings } = useOnline();

onMounted(async () => {
  if (website.value) {
    loadConfigsSettings();
    loading.value = false;
  } else {
    if (localStorage.getItem('backend_url') === null) {
      popUpUrlMobile.value = true;
    } else {
      const users = await UsersService.getMobile();
      if (users.length === 0) {
        await loadClinicsDataFromBackEndToPinia().then((clinic_resp) => {
          if (clinic_resp) {
            loading.value = false;
          }
        });
      } else {
        systemConfigsService.getMobile();
        clinicService.getMobile();
        loading.value = false;
      }
    }
  }
});
</script>
