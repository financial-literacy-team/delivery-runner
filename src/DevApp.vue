<script setup lang="ts">
import {ref} from 'vue'
import DeliveryRunner from './components/DeliveryRunner.vue'

const gameResults = ref<any>(null)
const selectedTransport = ref<'bike' | 'scooter' | 'car'>('bike')

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
      <p>Вартість подорожі: {{ gameResults.tripCost }}</p>
      <button @click="gameResults = null">Спробувати ще раз</button>
    </div>

    <div v-if="!gameResults" style="margin-bottom: 20px;">
      <label>Виберіть транспорт: </label>
      <select v-model="selectedTransport">
        <option value="bike">Велосипед</option>
        <option value="scooter">Мотоцикл</option>
        <option value="car">Машина</option>
      </select>
    </div>

    <DeliveryRunner
        v-if="!gameResults"
        :transportType="selectedTransport"
        :transportSpeed="5"
        @gameOver="handleGameOver"
    />
  </div>
</template>