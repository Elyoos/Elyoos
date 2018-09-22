<template>
    <div class="card-footer-feed">
        <div class="footer-icon" v-if="creator">
            <user-menu :menu-title="creatorTitle" :user-image="creator.userImagePreview"
                       :user-name="creator.name" :user-id="creator.userId" :user-slug="creator.slug"
                       :is-trust-user="creator.isTrustUser" :is-logged-in-user="creator.isLoggedInUser"
                       @add-trust-circle="(userId) => $emit('add-trust-circle', userId)"
                       @remove-trust-circle="(userId) => $emit('remove-trust-circle', userId)">
                <div class="user-icon creator-icon" slot="icon">
                    <img :src="creator.userImage">
                </div>
            </user-menu>
        </div>
        <div class="separator-icon" v-if="creator && user">
            <v-icon medium>
                mdi-menu-right
            </v-icon>
        </div>
        <div class="footer-icon" v-if="user">
            <user-menu :menu-title="userTitle" :user-image="user.userImagePreview"
                       :user-name="user.name" :user-id="user.userId" :user-slug="user.slug"
                       :is-trust-user="user.isTrustUser" :is-logged-in-user="user.isLoggedInUser"
                       @add-trust-circle="(userId) => $emit('add-trust-circle', userId)"
                       @remove-trust-circle="(userId) => $emit('remove-trust-circle', userId)">
                <div class="user-icon creator-icon" slot="icon">
                    <img :src="user.userImage">
                </div>
            </user-menu>
        </div>
        <div class="footer-icon" v-if="action === 'watch'">
            <watches-menu :user-name="user.name" :user-id="user.userId" :watched-id="questionId"
                          :is-watching-action="true"
                          watched-id-name="questionId" :user-slug="user.slug" :is-logged-in-user="user.isLoggedInUser"
                          :is-admin="creator.isLoggedInUser" :watched-by-user="isWatchedByUser"
                          :number-of-watches="numberOfWatches" menu-translation="watchesQuestion"
                          api-get-user-command="question/watches" api-watch="user/question/watch"
                          @add-watch="(id) => $emit('add-watch', id)"
                          @remove-watch="(id) => $emit('remove-watch', id)"
                          @watch-menu-closed="(data) => $emit('watch-menu-closed', data)">
                <div slot="icon">
                    <v-icon medium class="action-icon">mdi-star</v-icon>
                    <span class="footer-description number">{{numberOfWatches}}</span>
                </div>
            </watches-menu>
        </div>
        <div class="footer-icon">
            <v-tooltip bottom>
                <div slot="activator">
                    <v-icon medium class="tooltip-icon no-answers" v-if="numberOfAnswers === 0">mdi-comment-alert
                    </v-icon>
                    <v-icon medium class="tooltip-icon only-few-answers"
                            v-else-if="numberOfAnswers > 0 && numberOfAnswers <= 4">
                        mdi-comment-alert
                    </v-icon>
                    <v-icon medium class="tooltip-icon" v-else>mdi-comment</v-icon>
                    <span class="footer-description number">{{numberOfAnswers}}</span>
                </div>
                <span v-if="numberOfAnswers === 0">{{$t('pages:feeds.menu.questions.noAnswers')}}</span>
                <span v-else-if="numberOfAnswers <= 4">
                    {{$t('pages:feeds.menu.questions.fewAnswers', {count: numberOfAnswers})}}</span>
                <span v-else>{{$t('pages:feeds.menu.questions.numberOfAnswers', {count: numberOfAnswers})}}</span>
            </v-tooltip>
        </div>
        <div class="footer-icon" v-if="action !== 'watch'">
            <watches-menu :user-id="user.userId" :watched-id="questionId" watched-id-name="questionId"
                          :is-watching-action="false"
                          :user-slug="user.slug" :is-logged-in-user="true" :is-admin="user.isLoggedInUser"
                          :watched-by-user="isWatchedByUser" :number-of-watches="numberOfWatches"
                          menu-translation="watchesQuestion" api-get-user-command="question/watches"
                          api-watch="user/question/watch"
                          @add-watch="(id) => $emit('add-watch', id)"
                          @remove-watch="(id) => $emit('remove-watch', id)"
                          @watch-menu-closed="(data) => $emit('watch-menu-closed', data)">
                <div slot="icon">
                    <v-icon medium class="action-icon">mdi-star</v-icon>
                    <span class="footer-description number">{{numberOfWatches}}</span>
                </div>
            </watches-menu>
        </div>
    </div>
</template>

<script>
    import UserMenu from './menu/User';
    import WatchesMenu from './menu/Watches'

    export default {
        props: ['creator', 'user', 'created', 'numberOfAnswers', 'numberOfWatches', 'isWatchedByUser', 'action',
            'questionId'],
        components: {UserMenu, WatchesMenu},
        computed: {
            userTitle() {
                if (this.action === 'created' || !this.$store.state.auth.userIsAuthenticated) {
                    return this.$t("pages:feeds.menu.creatorQuestion.title");
                } else if (this.action === 'watch' && this.user && !this.user.isLoggedInUser) {
                    return this.$t("pages:feeds.menu.watchesQuestion.title");
                } else if (this.action === 'watch' && this.user && this.user.isLoggedInUser) {
                    return this.$t("pages:feeds.menu.watchesQuestion.titleIsLoggedInUser");
                }
            },
            creatorTitle() {
                if (this.creator && this.creator.isLoggedInUser) {
                    return this.$t("pages:feeds.menu.creatorQuestion.titleIsLoggedInUser");
                }
                return this.$t("pages:feeds.menu.creatorQuestion.title");
            }
        }
    }
</script>

<style lang="scss">
    .card-footer-feed {
        .footer-icon {
            .tooltip-icon.no-answers.v-icon {
                color: $warning
            }
            .tooltip-icon.only-few-answers.v-icon {
                color: #bfbc12
            }
        }
    }
</style>