<template>
    <div class="dumonda-me-answer-container">
        <div class="dumonda-me-answer-content">
            <div v-for="answer in answers" itemprop="suggestedAnswer" itemscope class="feed-card ely-card"
                 itemtype="http://schema.org/Answer">
                <text-card v-if="answer.answerType === 'Text'" :answer="answer"
                           @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                           @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </text-card>
                <youtube-card v-else-if="answer.answerType === 'Youtube'" :answer="answer"
                              @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                              @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </youtube-card>
                <link-card v-else-if="answer.answerType === 'Link'" :answer="answer"
                           @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                           @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </link-card>
                <book-card v-else-if="answer.answerType === 'Book'" :answer="answer"
                           @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                           @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </book-card>
                <commitment-card v-else-if="answer.answerType === 'Commitment'" :answer="answer"
                                 @add-trust-circle="(userId) => addUserToTrustCircle(userId)"
                                 @remove-trust-circle="(userId) => removeUserFromTrustCircle(userId)">
                </commitment-card>
            </div>
        </div>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark flat @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
        <div class="show-answer-not-found" v-if="showAllAnswersButton && answers.length === 0">
            {{$t('pages:detailQuestion.answerNotFound')}}
        </div>
        <div class="show-no-answers" v-else-if="totalNumberOfAnswers === 0">
            {{$t('pages:detailQuestion.noAnswer')}}
        </div>
        <v-btn outline color="primary" v-if="showAllAnswersButton" class="show-answer-button"
               @click="showAllAnswers" :disabled="loading" :loading="loading">
            {{$t('pages:detailQuestion.showAllAnswerButton')}}
        </v-btn>
        <v-btn outline color="primary" v-else-if="hasMoreAnswers" class="show-answer-button"
               @click="showNextAnswers" :disabled="loading" :loading="loading">
            {{$t('pages:detailQuestion.showNextAnswerButton')}}
        </v-btn>
    </div>
</template>

<script>
    import CommitmentCard from './card/Commitment'
    import BookCard from './card/Book'
    import TextCard from './card/Text'
    import LinkCard from './card/Link'
    import YoutubeCard from './card/Youtube'
    import AnswerFooter from './card/footer/CommonAnswer';
    import CommitmentAnswerFooter from './card/footer/CommitmentAnswer';

    export default {
        components: {
            TextCard, YoutubeCard, LinkCard, BookCard, CommitmentCard, AnswerFooter, CommitmentAnswerFooter
        },
        data() {
            return {loading: false, showError: false}
        },
        computed: {
            answers() {
                return this.$store.state.question.question.answers;
            },
            totalNumberOfAnswers() {
                return this.$store.state.question.question.numberOfAnswers;
            },
            hasMoreAnswers() {
                return this.$store.state.question.question.hasMoreAnswers;
            },
            showAllAnswersButton() {
                return this.$store.state.question.question.answers.length <= 1 &&
                    this.$store.state.question.question.numberOfAnswers > 1 &&
                    this.$route.query && this.$route.query.answerId;
            }
        },
        methods: {
            async addUserToTrustCircle(userId) {
                this.$store.commit('question/ADD_USER_TO_TRUST_CIRCLE', userId);
            },
            async removeUserFromTrustCircle(userId) {
                this.$store.commit('question/REMOVE_USER_FROM_TRUST_CIRCLE', userId);
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
                    await this.$store.dispatch('question/nextAnswers');
                } catch (err) {
                    this.showError = true;
                } finally {
                    this.loading = false;
                }
            }
        }
    }
</script>

<style lang="scss">
    .dumonda-me-answer-container {
        .dumonda-me-answer-content {
            .new-added-answer {
                border: 1px solid $success-text;
            }
        }
        .show-answer-not-found {
            font-size: 20px;
            margin-bottom: 24px;
            font-weight: 300;
        }
        .show-answer-button {
            margin-left: 0;
        }
        .show-no-answers {
            font-size: 20px;
            font-weight: 300;
        }
    }
</style>