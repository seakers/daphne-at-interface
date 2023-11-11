<template>
    <div class="modal" v-bind:class="{ 'is-active': isActive }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <article class="message">
                <component v-bind:is="modalContent" v-on:close-modal="onCloseModal"></component>
            </article>
        </div>
        <button id="modalCloseButton" class="modal-close is-large" aria-label="close"  v-on:click.prevent="$emit('close-modal')"></button>
    </div>
</template>

<script>
    import Stage1Modal from './Stage1Modal';
    import Stage2Modal from './Stage2Modal';
    import LoginModal from './LoginModal';
    import RegisterModal from './RegisterModal';
    import SettingsModal from './SettingsModal';
    import SymptomChangeNotificationModal from './SymptomChangeNotificationModal';

    export default {
        name: 'modal',
        props: ['modalContent', 'isActive'],
        data() {
            return {
            }
        },
        components: {
            Stage1Modal,
            Stage2Modal,
            LoginModal,
            RegisterModal,
            SettingsModal,
            SymptomChangeNotificationModal
        },
        methods: {
            onCloseModal() {
                this.$emit('close-modal');
            }
        }
    }
</script>

<style scoped>

</style>
