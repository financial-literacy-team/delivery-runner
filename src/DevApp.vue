<script setup lang="ts">
import {ref} from 'vue'
import DeliveryRunner from './components/DeliveryRunner.vue'

const gameResults = ref<any>(null)

const handleGameOver = (result: any) => {
  console.log('Гра завершена!', result)
  gameResults.value = result
}
</script>

<template>
  <div style="font-family: sans-serif; text-align: center; padding: 20px;">
    <h1>Тестування Delivery Runner</h1>

    <div v-if="gameResults" style="margin-bottom: 20px; color: #e74c3c;">
      <h2>Результати:</h2>
      <p>Час доставки: {{ gameResults.time }}</p>
      <p>Зіткнень: {{ gameResults.hits }}</p>
      <p>Втрата балансу: {{ gameResults.balanceLost }}</p>
      <button @click="gameResults = null">Спробувати ще раз</button>
    </div>

    <DeliveryRunner
        v-if="!gameResults"
        :lives="3"
        :transportSpeed="5"
        @gameOver="handleGameOver"
    />
  </div>
</template>