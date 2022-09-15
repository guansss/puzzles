import { createApp } from 'vue';
import css from './main.module.css';

const template = /* HTML */ ` <div :class="css.container"></div> `;

function setup() {
    return { css };
}

createApp({ template, setup }).mount('#app');
