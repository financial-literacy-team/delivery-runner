import DeliveryRunner from './components/DeliveryRunner.vue'

export {DeliveryRunner}

export interface RunnerResults {
    time: number;
    balanceLost: number;
    hits: number;
}