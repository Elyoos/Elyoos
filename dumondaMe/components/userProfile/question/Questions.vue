<template>
    <div class="user-question-container">
        <h3>{{$t("pages:detailUser.question.title")}}
            <span class="filter-icon-container"> (
            <v-icon class="filter-icon filter-icon-left" :class="{'active-filter': showCreatedQuestions}"
                    @click="showCreatedQuestions = true">$vuetify.icons.mdiPencil
            </v-icon> |
            <v-icon class="filter-icon filter-icon-right" :class="{'active-filter': !showCreatedQuestions}"
                    @click="showCreatedQuestions = false">$vuetify.icons.mdiStar
            </v-icon> )</span>
        </h3>
        <div class="general-user-info" v-if="showCreatedQuestions">
            <span v-if="isLoggedInUser">
                {{$t("pages:detailUser.createdQuestion.loggedInUserInfo", {count: numberOfQuestions})}}
            </span>
            <span v-else>
                {{$t("pages:detailUser.createdQuestion.otherUserInfo", {count: numberOfQuestions})}}
            </span>
        </div>
        <div class="general-user-info" v-else>
            <span v-if="isLoggedInUser">
                {{$t("pages:detailUser.interestedInTheQuestion.loggedInUserInfo", {count: numberOfQuestions})}}
            </span>
            <span v-else>
                {{$t("pages:detailUser.interestedInTheQuestion.otherUserInfo", {count: numberOfQuestions, name: userForename})}}
            </span>
        </div>
        <div class="question-info" v-for="question in questions">
            <question :question="question">
            </question>
        </div>
        <v-btn outlined color="primary" @click="loadNextQuestions()" :loading="loading" :disabled="loading"
               v-if="questions.length < numberOfQuestions">
            {{$t("common:button.showMore")}}
        </v-btn>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    import Question from './Question';

    export default {
        components: {Question},
        data() {
            return {
                showCreatedQuestions: !(this.$store.state.userProfile.user.numberOfCreatedQuestions === 0 &&
                    this.$store.state.userProfile.user.numberOfWatchingQuestions > 0), loading: false, showError: false
            }
        },
        computed: {
            numberOfQuestions() {
                if (this.showCreatedQuestions) {
                    return this.$store.state.userProfile.user.numberOfCreatedQuestions
                }
                return this.$store.state.userProfile.user.numberOfWatchingQuestions
            },
            questions() {
                if (this.showCreatedQuestions) {
                    return this.$store.state.userProfile.user.questions
                }
                return this.$store.state.userProfile.user.watchingQuestions
            },
            userForename() {
                return this.$store.state.userProfile.user.forename;
            },
            isLoggedInUser() {
                return this.$store.state.userProfile.user.isLoggedInUser;
            }
        },
        methods: {
            async loadNextQuestions() {
                try {
                    this.loading = true;
                    if (this.showCreatedQuestions) {
                        await this.$store.dispatch('userProfile/loadNextCreatedQuestions');
                    } else {
                        await this.$store.dispatch('userProfile/loadNextWatchedQuestions');
                    }
                } catch (error) {
                    this.showError = true;
                } finally {
                    this.loading = false;
                }
            }
        }
    }
</script>

<style lang="scss">
    .user-question-container {
        margin-bottom: 38px;
        h3 {
            font-size: 16px;
            font-weight: 400;
            margin-top: 18px;
            line-height: 24px;
            margin-bottom: 12px;
            border-bottom: 1px solid $divider;
            .filter-icon-container {
                display: inline-block;
                vertical-align: middle;
                line-height: normal;
                font-size: 12px;
                padding-bottom: 2px;
                .filter-icon-left {
                    padding-right: 4px;
                }
                .filter-icon-right {
                    padding-left: 4px;
                }
                .filter-icon.v-icon {
                    font-size: 16px;
                    cursor: pointer;
                }
                .active-filter.filter-icon.v-icon {
                    color: $primary-color;
                }
            }
        }
        .general-user-info {
            font-size: 14px;
            color: $secondary-text;
            margin-bottom: 12px;
        }

        button {
            margin-left: 0;
        }

    }
</style>
