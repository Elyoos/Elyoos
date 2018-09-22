<template>
    <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="280" offset-y>
        <slot name="icon" slot="activator"></slot>
        <v-card class="ely-menu-container ely-menu-user">
            <div class="menu-title"><span class="primary-title" v-if="!isLoggedInUser">{{userName}}</span>
                <span class="primary-title" v-else>{{$t('common:you')}}</span> {{menuTitle}}
            </div>
            <div class="menu-content menu-user-content">
                <div class="user-image" @click="goToProfile()">
                    <v-tooltip bottom debounce="300" class="trust-circle-icon" v-if="isTrustUser">
                        <v-icon slot="activator">mdi-account-circle</v-icon>
                        <span>{{$t('common:inYourTrustCircle')}}</span>
                    </v-tooltip>
                    <img :src="userImage">
                </div>
            </div>
            <v-divider></v-divider>
            <div class="menu-commands">
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="menu = false">{{$t('common:button.close')}}</v-btn>
                <div v-if="!isLoggedInUser">
                    <v-btn color="primary" class="user-action-button lower-action-button"
                           v-if="isTrustUser" :loading="loading" :disabled="loading || isLoggedInUser"
                           @click="removeUserFromTrustCircle">
                        <v-icon left>mdi-check</v-icon>
                        {{$t('common:trustCircle')}}
                    </v-btn>
                    <v-btn color="primary" class="user-action-button lower-action-button" v-else
                           :loading="loading" :disabled="loading || isLoggedInUser"
                           @click="addUserToTrustCircle">
                        <v-icon left>mdi-account-plus</v-icon>
                        {{$t('common:trustCircle')}}
                    </v-btn>
                </div>
            </div>
        </v-card>
        <login-required-dialog v-if="showLoginRequired" @close-dialog="showLoginRequired = false">
        </login-required-dialog>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark flat @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </v-menu>
</template>

<script>
    import LoginRequiredDialog from '~/components/common/dialog/LoginRequired';

    export default {
        props: ['menuTitle', 'user', 'userImage', 'userName', 'userId', 'userSlug', 'isTrustUser', 'isLoggedInUser'],
        components: {LoginRequiredDialog},
        data() {
            return {menu: false, loading: false, showError: false, showLoginRequired: false}
        },
        methods: {
            goToProfile() {
                if (this.isLoggedInUser) {
                    this.$router.push({name: 'user'});
                } else {
                    this.$router.push({name: 'user-userId-slug', params: {userId: this.userId, slug: this.userSlug}})
                }
            },
            async sendUserToTrustCircleCommand(command, emit) {
                if (this.$store.state.auth.userIsAuthenticated) {
                    try {
                        this.loading = true;
                        await this.$axios[command](`user/trustCircle/${this.userId}`);
                        this.$emit(emit, this.userId);
                    } catch (error) {
                        this.showError = true;
                    } finally {
                        this.loading = false;
                    }
                } else {
                    this.showLoginRequired = true;
                }
            },
            async addUserToTrustCircle() {
                await this.sendUserToTrustCircleCommand('$post', 'add-trust-circle');
            },
            async removeUserFromTrustCircle() {
                await this.sendUserToTrustCircleCommand('$delete', 'remove-trust-circle');
            }
        }
    }
</script>

<style lang="scss">
    .ely-menu-container.ely-menu-user {
        .menu-title {
            max-width: 320px;
        }
        .menu-user-content {
            display: flex;
            .user-image {
                position: relative;
                width: 148px;
                height: 148px;
                img {
                    cursor: pointer;
                    z-index: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 4px;
                }
                .trust-circle-icon {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    z-index: 2;
                    border-top-left-radius: 8px;
                    background-color: white;
                    i {
                        color: $success-text;
                    }
                }
            }
        }
    }
</style>