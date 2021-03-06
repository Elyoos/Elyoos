<template>
    <div id="setting-container">
        <div id="setting-navigation-container">
            <div id="setting-navigation-inner-container" class="ely-card">
                <div class="setting-navigation-element" :class="{'selected-element': selected === 'language'}"
                     @click="navigate('language')">
                    <div class="settings-title">{{$t('pages:settings.language.title')}}</div>
                    <language class="setting-content-mobile-container" v-if="selected === 'language'"></language>
                </div>
                <div class="setting-navigation-element" :class="{'selected-element': selected === 'email'}"
                     @click="navigate('email')">
                    <div class="settings-title">{{$t('pages:settings.email.title')}}</div>
                    <e-mail class="setting-content-mobile-container" v-if="selected === 'email'"></e-mail>
                </div>
                <div class="setting-navigation-element"
                     :class="{'selected-element': selected === 'privacy'}"
                     @click="navigate('privacy')">
                    <div class="settings-title">{{$t('pages:settings.privacy.title')}}</div>
                    <privacy class="setting-content-mobile-container" v-if="selected === 'privacy'"></privacy>
                </div>
                <div class="setting-navigation-element" :class="{'selected-element': selected === 'security'}"
                     @click="navigate('security')">
                    <div class="settings-title">{{$t('pages:settings.security.title')}}</div>
                    <security class="setting-content-mobile-container" v-if="selected === 'security'"></security>
                </div>
            </div>
        </div>
        <div id="setting-content-container" class="ely-card">
            <language v-if="selected === 'language'"></language>
            <e-mail v-else-if="selected === 'email'"></e-mail>
            <privacy v-else-if="selected === 'privacy'"></privacy>
            <security v-else-if="selected === 'security'"></security>
        </div>
    </div>
</template>

<script>
    import Language from './Language';
    import Privacy from './Privacy';
    import Security from './Security';
    import EMail from './Email';
    import EmailNotification from './EmailNotification';

    export default {
        data() {
            let selected = 'language';
            if (this.$route.query && this.$route.query.section) {
                selected = this.$route.query.section;
            }
            return {selected}
        },
        components: {Language, Privacy, Security, EMail, EmailNotification},
        methods: {
            navigate(selected) {
                this.selected = selected;
                this.$router.push({name: 'setting', query: {section: selected}})
            }
        },
    }
</script>

<style lang="scss">
    #setting-container {
        display: flex;
        @media screen and (max-width: $xs) {
            margin-top: 12px;
        }

        #setting-navigation-container {
            min-width: 250px;
            margin-right: 12px;
            @media screen and (max-width: $xs) {
                width: 100%;
                margin-right: 0;
            }

            #setting-navigation-inner-container {
                padding: 0;
                @media screen and (max-width: $xs) {
                    width: 100%;
                }

                .setting-navigation-element {
                    padding: 8px 0;
                    border-bottom: 1px solid $divider;
                    cursor: pointer;

                    .settings-title {
                        font-size: 16px;
                        padding: 0 16px;
                        @media screen and (max-width: $xs) {
                            font-size: 20px;
                            text-align: center;
                        }
                    }

                    .setting-content-mobile-container {
                        display: none;
                        @media screen and (max-width: $xs) {
                            display: block;
                            margin-top: 8px;
                            padding: 16px 16px 0 16px;
                            border-top: 1px solid $divider;
                        }
                    }
                }

                :hover.setting-navigation-element {
                    color: $primary-color;
                }

                .last-element {
                    border-bottom: none;
                }

                .selected-element {
                    font-weight: 500;
                }

                :hover.setting-navigation-element.selected-element {
                    color: $primary-text;
                    cursor: auto;
                }
            }
        }

        #setting-content-container {
            width: 100%;
            @include defaultPaddingCard();
            @media screen and (max-width: $xs) {
                display: none;
            }
        }

        .security-sub-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 12px;
        }
    }
</style>
