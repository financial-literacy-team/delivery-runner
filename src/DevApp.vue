<script setup lang="ts">
import {ref} from 'vue'
import DeliveryRunner from './components/DeliveryRunner.vue'

const gameResults = ref(null)

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
      <p>Час доставки: {{ gameResults.time }} сек</p>
      <p>Зіткнень: {{ gameResults.hits }}</p>
      <p>Втрачено грошей: {{ gameResults.moneyLost }}</p>
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