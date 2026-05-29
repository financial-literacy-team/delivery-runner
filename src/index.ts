import DeliveryRunner from './components/DeliveryRunner.vue'

export {DeliveryRunner}

export interface RunnerResults {
    time: 'fast' | 'slow';
    tripCost: number;
    hits: number;
}