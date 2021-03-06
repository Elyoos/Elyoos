<template>
    <v-card id="search-commitment-answer">
        <v-card-title id="commitment-answer-title" v-html="$t('pages:question.answerDialog.title', {question})">
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text id="commitment-answer-content" class="mobile-dialog-content">
            <div class="info-answer">{{$t('pages:question.answerDialog.answerInfoCommitment')}}</div>
            <v-text-field v-model="titleCommitment" :loading="searchCommitmentRunning"
                          :label="$t('pages:detailQuestion.searchCommitment')"
                          :rules="[ruleFieldRequired($t('validation:fieldRequired')),
                                   ruleToManyChars($t('validation:toManyChars'), 200)]">
            </v-text-field>
            <div v-for="commitment in commitments" class="commitment-preview"
                 :class="{'linked-with-question': commitment.linkedWithQuestion}"
                 @click="selectCommitment(commitment)">
                <div class="commitment-image">
                    <img :src="commitment.imageUrl"/>
                </div>
                <div class="commitment-content">
                    <h3 class="commitment-title">
                        {{commitment.title}}
                    </h3>
                    <div class="already-linked" v-if="commitment.linkedWithQuestion">
                        {{$t("pages:detailQuestion.commitmentAlreadyLinked")}}
                    </div>
                    <p class="commitment-description">
                        {{commitment.description}}
                    </p>
                </div>
            </div>
            <div v-if="showNotFoundMessage">{{$t("pages:detailQuestion.commitmentNotFound", {search: lastSearch})}}
            </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click.native="$emit('close-dialog')">
                {{$t("common:button.close")}}
            </v-btn>
            <v-btn color="primary" @click.native="createCommitmentAnswer()"
                   :disabled="true">
                {{$t("pages:detailQuestion.createAnswerButton")}}
            </v-btn>
        </v-card-actions>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </v-card>
</template>

<script>
    import validationRules from '~/mixins/validationRules.js';
    import debounce from 'debounce';

    export default {
        data() {
            return {
                titleCommitment: '', commitments: [], searchCommitmentRunning: false,
                showNotFoundMessage: false, lastSearch: '', showError: false
            }
        },
        mixins: [validationRules],
        computed: {
            question() {
                return `<span class="question-title"> ${this.$store.state.question.question.question}</span>`;
            }
        },
        methods: {
            selectCommitment(commitment) {
                if (!commitment.linkedWithQuestion) {
                    this.$emit('selected-commitment', commitment);
                }
            }
        },
        watch: {
            titleCommitment: debounce(async function (newTitle) {
                this.showNotFoundMessage = false;
                if (typeof newTitle === 'string' && newTitle.trim().length > 1) {
                    try {
                        this.searchCommitmentRunning = true;
                        this.commitments = await this.$axios.$get('commitment/search',
                            {
                                params: {
                                    query: newTitle, lang: this.$store.state.question.question.language,
                                    questionId: this.$store.state.question.question.questionId
                                }
                            });
                        this.showNotFoundMessage = this.commitments.length === 0;
                        this.lastSearch = newTitle;
                        this.searchCommitmentRunning = false;
                    } catch (error) {
                        this.showError = true;
                        this.searchCommitmentRunning = false;
                    }
                }
            }, 400)
        }
    }
</script>

<style lang="scss">
    #search-commitment-answer {
        #commitment-answer-title {
            display: block;
            .question-title {
                color: $primary-color;
                white-space: normal;
            }
        }
        #commitment-answer-content {
            .info-answer {
                font-weight: 300;
                font-size: 16px;
                color: $primary-text;
                margin-bottom: 12px;
            }
            .commitment-preview {
                padding-bottom: 6px;
                padding-top: 6px;
                cursor: pointer;
                display: flex;
                .commitment-image {
                    width: 120px;
                    flex: 0 0 120px;
                    @media screen and (max-width: $xs) {
                        width: 80px;
                        flex: 0 0 80px;
                    }
                    img {
                        width: 100%;
                        border-radius: 4px;
                    }
                }
                .commitment-content {
                    margin-left: 24px;
                    padding: 0;
                    margin-bottom: 0;
                    .commitment-title {
                        font-size: 16px;
                        line-height: 16px;
                    }
                    .already-linked {
                        font-size: 14px;
                        color: $warning;
                    }
                    .commitment-description {
                        margin-top: 4px;
                        font-size: 14px;
                        font-weight: 300;
                        line-height: 1.4em;
                        max-height: 4.2em;
                        overflow-y: hidden;
                    }
                }
            }
            :hover.commitment-preview {
                background: $hover;
                border-radius: 4px;
            }
            .linked-with-question.commitment-preview {
                cursor: not-allowed;
            }
            :hover.linked-with-question.commitment-preview {
                background: white;
            }
        }
    }
</style>
