<template>
    <div class="dumonda-me-answer-container">
        <div class="dumonda-me-answer-content">
            <div v-for="answer in answers" itemprop="suggestedAnswer" itemscope class="feed-card ely-card"
                 itemtype="http://schema.org/Answer" :class="{'single-feed-card': showAllAnswersButton}">
                <a itemprop="url" :href="getAnswerUrl(answer.answerId)" class="hide-answer-link"></a>
                <default-card v-if="answer.answerType === 'Default'" :answer="answer"
                              @up-voted="upVote" @down-voted="downVote"
                              @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                              @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </default-card>
                <youtube-card v-else-if="answer.answerType === 'Youtube'" :answer="answer"
                              @up-voted="upVote" @down-voted="downVote"
                              @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                              @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </youtube-card>
                <link-card v-else-if="answer.answerType === 'Link'" :answer="answer"
                           @up-voted="upVote" @down-voted="downVote"
                           @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                           @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </link-card>
                <book-card v-else-if="answer.answerType === 'Book'" :answer="answer"
                           @up-voted="upVote" @down-voted="downVote"
                           @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                           @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </book-card>
                <commitment-card v-else-if="answer.answerType === 'Commitment'" :answer="answer"
                                 @up-voted="upVote" @down-voted="downVote"
                                 @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                                 @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </commitment-card>
            </div>
        </div>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
        <div class="show-answer-not-found ely-card"
             v-if="showAllAnswersButton && $route.query && $route.query.answerId && answers.length === 0">
            {{$t('pages:detailQuestion.answerNotFound')}}
        </div>
        <div class="show-no-answers ely-card"
             v-else-if="showAllAnswersButton && $route.query && $route.query.harvestingId && answers.length === 0">
            {{$t('pages:detailQuestion.noHarvestingAnswer', {name: harvestingUser.name})}}
        </div>
        <div class="show-no-answers ely-card" v-else-if="totalNumberOfAnswers === 0">
            {{$t('pages:detailQuestion.noAnswer')}}
        </div>
        <v-btn outlined color="primary" v-if="hasMoreAnswers" class="show-answer-button"
               @click="showNextAnswers" :disabled="loading" :loading="loading">
            {{$t('pages:detailQuestion.showNextAnswerButton')}}
        </v-btn>
        <v-btn outlined color="primary" v-else-if="showAllAnswersButton" class="show-answer-button"
               @click="showAllAnswers" :disabled="loading" :loading="loading">
            {{$t('pages:detailQuestion.showAllAnswerButton')}}
        </v-btn>
    </div>
</template>

<script>
    import CommitmentCard from './card/Commitment'
    import BookCard from './card/Book'
    import DefaultCard from './card/Default'
    import LinkCard from './card/Link'
    import YoutubeCard from './card/Youtube'
    import AnswerFooter from './card/footer/CommonAnswer';
    import CommitmentAnswerFooter from './card/footer/CommitmentAnswer';

    export default {
        components: {
            DefaultCard, YoutubeCard, LinkCard, BookCard, CommitmentCard, AnswerFooter, CommitmentAnswerFooter
        },
        data() {
            return {loading: false, showError: false}
        },
        computed: {
            harvestingUser() {
                return this.$store.state.question.question.harvestingUser;
            },
            answers() {
                return this.$store.state.question.question.answers;
            },
            totalNumberOfAnswers() {
                return this.$store.state.question.question.numberOfAnswers;
            },
            hasMoreAnswers() {
                return this.$store.state.question.question.hasMoreAnswers &&
                    this.$route.query && !this.$route.query.answerId;
            },
            showAllAnswersButton() {
                return (this.$store.state.question.question.answers.length <= 1 &&
                    this.$store.state.question.question.numberOfAnswers > 1 &&
                    this.$route.query && this.$route.query.answerId) ||
                    (this.$store.state.question.question.hasOtherAnswersThenHarvesting &&
                        this.$route.query && this.$route.query.harvestingId);
            }
        },
        methods: {
            async addUserToTrustCircle(userId) {
                this.$store.commit('question/ADD_USER_TO_TRUST_CIRCLE', userId);
            },
            async removeUserFromTrustCircle(userId) {
                this.$store.commit('question/REMOVE_USER_FROM_TRUST_CIRCLE', userId);
            },
            upVote(answerId) {
                this.$store.commit('question/UP_VOTE_ANSWER', answerId)
            },
            downVote(answerId) {
                this.$store.commit('question/DOWN_VOTE_ANSWER', answerId)
            },
            async showAllAnswers() {
                try {
                    this.loading = true;
                    this.showError = false;
                    await this.$store.dispatch('question/showAllAnswers');
                    this.$router.replace({
                        name: 'question-questionId-slug',
                        params: {questionId: this.$route.params.questionId, slug: this.$route.params.slug}
                    });
                } catch (err) {
                    this.showError = true;
                } finally {
                    this.loading = false;
                }
            },
            async showNextAnswers() {
                try {
                    this.loading = true;
                    this.showError = false;
                    await this.$store.dispatch('question/nextAnswers',
                        this.$route.query ? this.$route.query.harvestingId : null);
                } catch (err) {
                    this.showError = true;
                } finally {
                    this.loading = false;
                }
            },
            getAnswerUrl(answerId) {
                return `https://www.dumonda.me/question/${this.$route.params.questionId}/${this.$route.params.slug}?answerId=${answerId}`
            }
        }
    }
</script>

<style lang="scss">
    .dumonda-me-answer-container {
        @media screen and (max-width: $xs) {
            margin-top: 0;
        }

        .dumonda-me-answer-content {
            .hide-answer-link {
                display: none;
            }

            .new-added-answer {
                border: 1px solid $success-text;
            }

            .feed-card.ely-card.single-feed-card {
                @media screen and (max-width: $sm) {
                    border-bottom: none;
                }
            }
        }

        .show-answer-not-found {
            @include defaultPaddingCard();
            font-size: 20px;
            margin-bottom: 24px;
            font-weight: 300;
        }

        .show-answer-button {
            margin-left: 0;
            @media screen and (max-width: $sm) {
                margin-top: 16px;
                margin-bottom: 12px;
                margin-left: 16px;
            }
        }

        .show-no-answers {
            @include defaultPaddingCard();
            font-size: 18px;
            font-weight: 300;
            margin-bottom: 18px;
        }
    }
</style>
