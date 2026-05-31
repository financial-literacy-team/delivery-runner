<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed} from 'vue'

import bgAsphalt from '../assets/asphalt.png'
import imgBike from '../assets/bike.png'
import imgScooter from '../assets/scooter.png'
import imgCar from '../assets/car.png'
import imgObs1 from '../assets/obs-car1.png'
import imgObs2 from '../assets/obs-car2.png'
import imgObs3 from '../assets/obs-car3.png'

type TransportType = 'bike' | 'scooter' | 'car';

interface Props {
  transportType: TransportType;
  transportSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  transportType: 'bike',
  transportSpeed: 5
})

const emit = defineEmits<{
  (e: 'gameOver', result: { time: 'fast' | 'slow'; tripCost: number; hits: number }): void
}>()

const textures = {
  background: new Image(),
  player: {
    bike: new Image(),
    scooter: new Image(),
    car: new Image()
  },
  obstacles: [new Image(), new Image(), new Image()]
}

textures.background.src = bgAsphalt
textures.player.bike.src = imgBike
textures.player.scooter.src = imgScooter
textures.player.car.src = imgCar
textures.obstacles[0].src = imgObs1
textures.obstacles[1].src = imgObs2
textures.obstacles[2].src = imgObs3

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const LANE_WIDTH = CANVAS_WIDTH / 3
const GAME_DURATION = 30

let isPlaying = false
let currentLives = 0
let startTime = 0
let hits = 0
let speedMultiplier = props.transportSpeed
let bgOffsetY = 0

const transportStats = computed(() => {
  switch (props.transportType) {
    case 'car':
      return {lives: 5, cost: 1200};
    case 'scooter':
      return {lives: 4, cost: 900};
    case 'bike':
    default:
      return {lives: 3, cost: 700};
  }
})

const player = {
  lane: 1,
  currentX: LANE_WIDTH + (LANE_WIDTH - 40) / 2,
  width: 60,
  height: 90,
  color: '#3498db'
}

interface Obstacle {
  lane: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  textureIndex: number;
}

let obstacles: Obstacle[] = []

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isPlaying) return
  if (e.key === 'ArrowLeft' && player.lane > 0) {
    player.lane--
  } else if (e.key === 'ArrowRight' && player.lane < 2) {
    player.lane++
  }
}

const spawnObstacle = () => {
  const MIN_GAP = 330;
  const lastObstacle = obstacles[obstacles.length - 1];
  const canSpawn = !lastObstacle || (lastObstacle.y > MIN_GAP - 75);

  if (canSpawn && Math.random() < 0.02 * (speedMultiplier / 5)) {
    obstacles.push({
      lane: Math.floor(Math.random() * 3),
      y: -50,
      width: 75,
      height: 120,
      passed: false,
      textureIndex: Math.floor(Math.random() * 3)
    })
  }
}

const gameLoop = (timestamp: number) => {
  if (!isPlaying || !ctx) return

  const elapsedTimeMs = Date.now() - startTime
  const timeLeft = Math.max(0, GAME_DURATION - Math.floor(elapsedTimeMs / 1000))

  if (timeLeft <= 0) {
    endGame()
    return
  }

  const progress = Math.min(elapsedTimeMs / (GAME_DURATION * 1000), 1)
  const sigmoidX = (progress * 10) - 5
  const sigmoidValue = 1 / (1 + Math.exp(-sigmoidX))

  const MAX_SPEED = 18
  speedMultiplier = props.transportSpeed + (MAX_SPEED - props.transportSpeed) * sigmoidValue

  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  if (textures.background.complete && textures.background.naturalWidth !== 0) {
    bgOffsetY += speedMultiplier;
    if (bgOffsetY >= CANVAS_HEIGHT) bgOffsetY = 0;

    ctx.drawImage(textures.background, 0, bgOffsetY, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(textures.background, 0, bgOffsetY - CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.setLineDash([50, 50]);
  ctx.lineDashOffset = -bgOffsetY;

  ctx.beginPath();
  ctx.moveTo(LANE_WIDTH, 0);
  ctx.lineTo(LANE_WIDTH, CANVAS_HEIGHT);
  ctx.moveTo(LANE_WIDTH * 2, 0);
  ctx.lineTo(LANE_WIDTH * 2, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.lineWidth = 1;

  const targetX = player.lane * LANE_WIDTH + (LANE_WIDTH - player.width) / 2
  player.currentX += (targetX - player.currentX) * 0.15

  const playerY = CANVAS_HEIGHT - player.height - 20
  const currentPlayerTexture = textures.player[props.transportType];

  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  if (currentPlayerTexture.complete && currentPlayerTexture.naturalWidth !== 0) {
    ctx.drawImage(currentPlayerTexture, player.currentX, playerY, player.width, player.height)
  } else {
    ctx.fillStyle = player.color
    ctx.fillRect(player.currentX, playerY, player.width, player.height)
  }

  ctx.shadowColor = 'transparent';

  spawnObstacle()

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i]
    obs.y += speedMultiplier

    const obsX = obs.lane * LANE_WIDTH + (LANE_WIDTH - obs.width) / 2
    const obsTexture = textures.obstacles[obs.textureIndex];

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    if (obsTexture.complete && obsTexture.naturalWidth !== 0) {
      ctx.drawImage(obsTexture, obsX, obs.y, obs.width, obs.height)
    } else {
      ctx.fillStyle = '#e74c3c'
      ctx.fillRect(obsX, obs.y, obs.width, obs.height)
    }

    ctx.shadowColor = 'transparent';

    const marginX = 15;
    const marginY = 20;

    const isPassed = obs.y > playerY + (player.height * 0.5);

    const isColliding = !isPassed && (
        (player.currentX + marginX) < (obsX + obs.width - marginX) &&
        (player.currentX + player.width - marginX) > (obsX + marginX) &&
        (playerY + marginY) < (obs.y + obs.height - marginY) &&
        (playerY + player.height - marginY) > (obs.y + marginY)
    );

    if (isColliding) {
      obstacles.splice(i, 1)
      currentLives--
      hits++

      if (currentLives <= 0) {
        endGame()
        return
      }
    } else if (obs.y > CANVAS_HEIGHT) {
      obstacles.splice(i, 1)
    }
  }

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.font = 'bold 20px Arial'
  ctx.strokeText(`Життя: ${currentLives}`, 10, 30)
  ctx.strokeText(`Час: ${timeLeft} с`, CANVAS_WIDTH - 110, 30)
  ctx.fillText(`Життя: ${currentLives}`, 10, 30)
  ctx.fillText(`Час: ${timeLeft} с`, CANVAS_WIDTH - 110, 30)

  animationFrameId = requestAnimationFrame(gameLoop)
}

const startGame = () => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')

  currentLives = transportStats.value.lives
  speedMultiplier = props.transportSpeed
  obstacles = []
  hits = 0
  bgOffsetY = 0

  player.lane = 1
  player.currentX = LANE_WIDTH + (LANE_WIDTH - 40) / 2

  startTime = Date.now()
  isPlaying = true

  window.addEventListener('keydown', handleKeyDown)
  animationFrameId = requestAnimationFrame(gameLoop)
}

const endGame = () => {
  isPlaying = false
  window.removeEventListener('keydown', handleKeyDown)
  cancelAnimationFrame(animationFrameId)

  const timeResult = currentLives > 0 ? 'fast' : 'slow'

  emit('gameOver', {
    time: timeResult,
    tripCost: transportStats.value.cost,
    hits: hits
  })
}

onMounted(() => {
  startGame()
})

onUnmounted(() => {
  isPlaying = false
  window.removeEventListener('keydown', handleKeyDown)
  cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <div class="delivery-runner-wrapper">
    <canvas
        ref="canvasRef"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
        class="runner-canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.delivery-runner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #34495e;
  padding: 20px;
  border-radius: 12px;
}

.runner-canvas {
  border: 4px solid #2c3e50;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}
</style>