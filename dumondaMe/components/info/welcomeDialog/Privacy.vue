<template>
    <v-card id="welcome-privacy-container">
        <div>
            <slot name="header"></slot>
        </div>
        <v-card-text class="mobile-dialog-content">
            <div id="welcome-dialog-title">{{$t("pages:settings.privacy.title")}}</div>
            <div class="privacy-description">{{$t('pages:settings.privacy.privacyModeDescription')}}</div>
            <v-radio-group v-model="privacyMode" class="select-privacy-setting" :disabled="loading">
                <v-radio value="public" color="primary">
                    <span slot="label">{{$t("pages:settings.privacy.privacyModePublic")}}</span>
                </v-radio>
                <v-radio value="publicEl" color="primary">
                    <span slot="label">{{$t("pages:settings.privacy.privacyModePublicOnDumondaMe")}}</span>
                </v-radio>
                <v-radio value="onlyContact" color="primary">
                    <span slot="label">{{$t("pages:settings.privacy.privacyModeOnlyContact")}}</span>
                </v-radio>
            </v-radio-group>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="primary" text @click="$emit('back')" :disabled="loading">
                {{$t("common:button.back")}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="$emit('close-dialog')">
                {{$t("common:button.later")}}
            </v-btn>
            <v-btn color="primary" @click="$emit('next')" :disabled="loading" :loading="loading">
                {{$t("common:button.next")}}
            </v-btn>
        </v-card-actions>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </v-card>
</template>

<script>
    export default {
        props: ['initPrivacyMode', 'initShowProfileActivity'],
        data() {
            return {
                loading: false, showError: false, showProfileActivity: this.initShowProfileActivity,
                privacyMode: this.initPrivacyMode
            }
        },
        methods: {
            async setSetting(privacyMode, showProfileActivity) {
                try {
                    this.loading = true;
                    await this.$axios.$put(`user/settings/privacy`,
                        {privacyMode, showProfileActivity});
                    this.$emit('privacy-mode-changed', privacyMode);
                } catch (error) {

                } finally {
                    this.loading = false;
                }
            }
        },
        watch: {
            async privacyMode(newPrivacyMode) {
                this.setSetting(newPrivacyMode, this.showProfileActivity);
            }
        }

    }
</script>

<style lang="scss">
    #welcome-privacy-container {

        .privacy-description {
            margin-top: 18px;
            font-size: 16px;
            font-weight: 300;
            color: $primary-text;
        }

        .select-privacy-setting {
            margin-bottom: 32px;
        }
    }
</style>
