<template>
  <div>Logout</div>
</template>
<script>
import { SessionStorage } from 'quasar';
import UsersService from 'src/services/UsersService';

export default {
  data() {
    return {};
  },
  created: function () {
    UsersService.logout();

    SessionStorage.clear();
    sessionStorage.setItem('user', null);
    sessionStorage.setItem('id_token', null);
    sessionStorage.setItem('refresh_token', null);
    localStorage.setItem('activeTabStock', '');
    sessionStorage.setItem('Btoa', '');
    localStorage.setItem('currInventory', '');
    localStorage.setItem('Btoa', '');
    this.$router.push({ path: '/Login' });
  },
};
</script>
