<template>
    <div id="search-users-container">
        <h2 class="user-profile-title">{{$t("pages:search.users.title")}}</h2>
        <div class="user-container ely-card" v-for="(user, index) of users">
            <div class="user-preview-img" :class="{'anonymous': user.isAnonymous}" @click="goToProfile(user)">
                <img :src="user.userImage">
            </div>
            <div class="user-content">
                <div class="user-name" @click="goToProfile(user)" :class="{'anonymous': user.isAnonymous}">
                    {{user.name}}
                </div>
                <div class="user-state" v-if="user.isTrustUser">{{$t('pages:search.users.inTrustCircle')}}</div>
                <div v-if="!user.isLoggedInUser && !user.isAnonymous" class="trust-circle-button">
                    <v-tooltip top v-if="user.isTrustUser">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" v-on="on"
                                   :loading="loading" :disabled="loading || user.isLoggedInUser"
                                   @click="removeUserFromTrustCircle(user.userId)">
                                <v-icon left>$vuetify.icons.mdiCheck</v-icon>
                                {{$t('common:trustCircle')}}
                            </v-btn>
                        </template>
                        <span>{{$t('common:removeFromTrustCircle')}}</span>
                    </v-tooltip>
                    <v-tooltip top v-else>
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" v-on="on"
                                   :loading="loading" :disabled="loading || user.isLoggedInUser"
                                   @click="addUserToTrustCircle(user.userId)">
                                <v-icon left>$vuetify.icons.mdiAccountPlus</v-icon>
                                {{$t('common:trustCircle')}}
                            </v-btn>
                        </template>
                        <span>{{$t('common:addToTrustCircle')}}</span>
                    </v-tooltip>
                </div>
            </div>
        </div>
        <v-btn outlined color="primary" v-if="hasMoreUsers" class="has-more-button" @click="getNextUsers"
               :loading="loadingNextUsers" :disabled="loadingNextUsers">
            {{$t('common:button.showMore')}}
        </v-btn>
        <login-required-dialog v-if="showLoginRequired" @close-dialog="showLoginRequired = false">
        </login-required-dialog>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    import LoginRequiredDialog from '~/components/common/dialog/LoginRequired';

    export default {
        components: {LoginRequiredDialog},
        data() {
            return {loading: false, loadingNextUsers: false, showLoginRequired: false, showError: false}
        },
        methods: {
            goToProfile(user) {
                if (!user.isAnonymous) {
                    if (user.isLoggedInUser) {
                        this.$router.push({name: 'user'});
                    } else {
                        this.$router.push({
                            name: 'user-userId-slug',
                            params: {userId: user.userId, slug: user.slug}
                        });
                    }
                }
            },
            async sendUserToTrustCircleCommand(command, userId) {
                if (this.$store.state.auth.userIsAuthenticated) {
                    try {
                        this.loading = true;
                        let response = await this.$axios[command](`user/trustCircle/${userId}`);
                        if (command === '$post') {
                            this.$store.commit('search/ADD_USER_TO_TRUST_CIRCLE', userId);
                            if (response && response.oneTimeNotificationCreated) {
                                this.$store.dispatch('notification/checkNotificationChanged');
                            }
                        } else {
                            this.$store.commit('search/REMOVE_USER_FROM_TRUST_CIRCLE', userId);
                        }
                    } catch (error) {
                        this.showError = true;
                    } finally {
                        this.loading = false;
                    }
                } else {
                    this.showLoginRequired = true;
                }
            },
            async addUserToTrustCircle(userId) {
                await this.sendUserToTrustCircleCommand('$post', userId);
            },
            async removeUserFromTrustCircle(userId) {
                await this.sendUserToTrustCircleCommand('$delete', userId);
            },
            async getNextUsers() {
                try {
                    this.loadingNextUsers = true;
                    await this.$store.dispatch('search/searchNextUsers');
                } catch (error) {
                    this.showError = true;
                } finally {
                    this.loadingNextUsers = false;
                }
            }
        },
        computed: {
            users() {
                return this.$store.state.search.users;
            },
            hasMoreUsers() {
                return this.$store.state.search.hasMoreUsers;
            }
        },
    }
</script>

<style lang="scss">
    #search-users-container {
        margin-bottom: 38px;
        @media screen and (max-width: $xs) {
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .user-profile-title {
            font-size: 22px;
            margin-bottom: 18px;
            @media screen and (max-width: $xs) {
                display: none;
            }
        }

        .user-container {
            display: flex;
            margin-bottom: 16px;
            @include defaultPaddingCard();

            @media screen and (max-width: $xs) {
                padding-bottom: 12px;
                margin-bottom: 8px;
            }

            .user-preview-img {
                cursor: pointer;
                width: 100px;
                height: 100px;

                img {
                    width: 100%;
                    border-radius: 4px;
                }
            }

            .user-preview-img.anonymous {
                cursor: auto;
            }

            .user-content {
                position: relative;
                margin-left: 18px;
                height: 100px;

                .user-name {
                    cursor: pointer;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 16px;
                    line-height: 18px;
                    font-weight: 400;
                    color: $primary-color;
                }

                :hover.user-name {
                    text-decoration: underline;
                }

                .user-name.anonymous {
                    cursor: auto;
                }

                :hover.user-name.anonymous {
                    text-decoration: none;
                }

                .user-state {
                    margin-top: 2px;
                    font-size: 14px;
                    color: $success-text;
                }

                .trust-circle-button {
                    position: absolute;
                    left: 0;
                    bottom: 0;

                    button {
                        margin-left: 0;
                        margin-bottom: 0;
                    }
                }
            }
        }

        .has-more-button {
            margin-left: 0;
            @media screen and (max-width: $xs) {
                margin-left: 16px;
            }
        }
    }
</style>
