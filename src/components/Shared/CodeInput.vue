<template>
      <q-input
        outlined
        label="Código *"
        dense
        class="col"
        :value="code"
        @input="(event) => $emit('update:code', event.target.value)"
        />
</template>

<script>
export default {
    props: ['code']
}
</script>

<style>

</style>
