import Vue from 'vue';
import {dataURItoBlob} from '~/utils/files/fileReaderUtil.js';
import {postWithFile, putWithFile} from '~/utils/files/upload.js';

export const state = () => ({
    question: {
        questionId: '', question: null, description: null, descriptionHtml: null, lang: null, numberOfWatches: 0,
        isAdmin: false, numberOfAnswers: 0, numberOfSuggestions: 0, userWatchesQuestion: false, answers: [],
        topics: [], regions: [], similarQuestions: []
    },
    sortNotes: 'newest',
    nextAnswersPage: 1
});

export const getters = {
    getQuestionInfo: state => {
        return JSON.parse(JSON.stringify({
            question: state.question.question,
            description: state.question.description,
            lang: state.question.language,
        }));
    }
};

const setIsTrustUser = function (state, userId, isTrustUser) {
    if (state.question && state.question.creator && state.question.creator.userId === userId) {
        state.question.creator.isTrustUser = isTrustUser
    }
    for (let answer of state.question.answers) {
        if (answer.creator && answer.creator.userId === userId) {
            answer.creator.isTrustUser = isTrustUser;
        }
    }
};

const addEmptyNotes = function (answers) {
    for (let answer of answers) {
        if (typeof answer.notes !== 'array') {
            Vue.set(answer, 'notes', []);
        }
    }
};

export const mutations = {
    SET_QUESTION(state, question) {
        state.question = question;
        addEmptyNotes(state.question.answers);
    },
    SET_QUESTION_INFO(state, question) {
        Vue.set(state.question, 'question', question.question);
        Vue.set(state.question, 'description', question.description);
        Vue.set(state.question, 'descriptionHtml', question.descriptionHtml);
        Vue.set(state.question, 'language', question.lang);
    },
    SET_TOPICS(state, topics) {
        state.question.topics = topics;
    },
    SET_WATCH(state) {
        state.question.userWatchesQuestion = true;
        state.question.numberOfWatches++;
    },
    REMOVE_WATCH(state) {
        state.question.userWatchesQuestion = false;
        state.question.numberOfWatches--;
    },
    SET_ANSWERS(state, answers) {
        addEmptyNotes(answers.answers);
        state.question.answers = answers.answers;
        state.question.hasMoreAnswers = answers.hasMoreAnswers;
        state.nextAnswersPage = 1;
    },
    ADD_ANSWERS(state, answers) {
        addEmptyNotes(answers.answers);
        state.question.answers = state.question.answers.concat(answers.answers);
        state.question.hasMoreAnswers = answers.hasMoreAnswers;
        state.nextAnswersPage++;
    },
    ADD_ANSWER(state, answer) {
        state.question.answers = [answer];
        state.question.numberOfAnswers++;
    },
    EDIT_ANSWER(state, {answerId, answer}) {
        let answerToEdit = state.question.answers.find((answer) => answer.answerId === answerId);
        for (let prop in answer) {
            if (answer.hasOwnProperty(prop)) {
                answerToEdit[prop] = answer[prop];
            }
        }
    },
    DELETE_ANSWER(state, answerId) {
        let indexOfAnswer = state.question.answers.findIndex((answer) => answer.answerId === answerId);
        state.question.answers.splice(indexOfAnswer, 1);
        state.question.numberOfAnswers--;
    },
    ADD_ANSWER_NOTE(state, {answerId, note}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        answer.notes.unshift(note);
        answer.numberOfNotes++;
    },
    SET_ANSWER_NOTES(state, {answerId, notes}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        Vue.set(answer, 'notes', notes);
    },
    EDIT_ANSWER_NOTE(state, {answerId, noteId, text, textHtml}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        let editNote = answer.notes.find((note) => note.noteId === noteId);
        editNote.text = text;
        editNote.textHtml = textHtml;
    },
    UP_VOTE_ANSWER(state, answerId) {
        let upVoteAnswer = state.question.answers.find((answer) => answer.answerId === answerId);
        upVoteAnswer.upVotes++;
        upVoteAnswer.hasVoted = true;
    },
    UP_VOTE_NOTE_OF_ANSWER(state, {answerId, noteId}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        let upVotedNote = answer.notes.find((note) => note.noteId === noteId);
        upVotedNote.upVotes++;
        upVotedNote.hasVoted = true;
    },
    DOWN_VOTE_ANSWER(state, answerId) {
        let downVoteAnswer = state.question.answers.find((answer) => answer.answerId === answerId);
        downVoteAnswer.upVotes--;
        downVoteAnswer.hasVoted = false;
    },
    DOWN_VOTE_NOTE_OF_ANSWER(state, {answerId, noteId}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        let upVotedNote = answer.notes.find((note) => note.noteId === noteId);
        upVotedNote.upVotes--;
        upVotedNote.hasVoted = false;
    },
    TOGGLE_ANSWER_NOTE_SORT(state) {
        if (state.sortNotes === 'newest') {
            state.sortNotes = 'upVotes'
        } else {
            state.sortNotes = 'newest'
        }
    },
    DELETE_NOTE_OF_ANSWER(state, {answerId, noteId}) {
        let answer = state.question.answers.find((answer) => answer.answerId === answerId);
        let noteToDelete = answer.notes.findIndex((note) => note.noteId === noteId);
        answer.notes.splice(noteToDelete, 1);
        answer.numberOfNotes--;
    },
    ADD_USER_TO_TRUST_CIRCLE(state, userId) {
        setIsTrustUser(state, userId, true);
    },
    REMOVE_USER_FROM_TRUST_CIRCLE(state, userId) {
        setIsTrustUser(state, userId, false);
    },
    SUGGESTION_REMOVED(state) {
        state.question.numberOfSuggestions--;
    },
    SUGGESTION_ADDED(state) {
        state.question.numberOfSuggestions++;
    }
};

const addDefaultProperties = function (answer, type, response) {
    answer.answerId = response.answerId;
    answer.descriptionHtml = response.descriptionHtml;
    answer.created = response.created;
    answer.creator = response.creator;
    answer.answerType = type;
    answer.isAdmin = true;
    answer.upVotes = 0;
    answer.numberOfNotes = 0;
    answer.notes = [];
};

export const actions = {
    async showAllAnswers({commit, state, rootState}) {
        let response = await this.$axios.$get(`/question/answer`,
            {params: {questionId: state.question.questionId, page: 0, language: rootState.i18n.language}});
        commit('SET_ANSWERS', response);
    },
    async nextAnswers({commit, state, rootState}, harvestingId) {
        let params = {
            params: {
                questionId: state.question.questionId, page: state.nextAnswersPage, language: rootState.i18n.language
            }
        };
        if (harvestingId) {
            params.params.harvestingId = harvestingId;
        }
        let response = await this.$axios.$get(`/question/answer`, params);
        commit('ADD_ANSWERS', response);
    },
    async deleteQuestion({state}) {
        await this.$axios.$delete(`/user/question`, {params: {questionId: state.question.questionId}});
    },
    async createTextAnswer({commit, dispatch, state}, {answer, image, createAnswerWithLink}) {
        let params = {createAnswerWithLink};
        let response;
        if (answer && answer.trim() !== '') {
            params.answer = answer
        }
        if (typeof image === 'string') {
            let blob = dataURItoBlob(image);
            response = await postWithFile(this.$axios, blob,
                `/user/question/answer/default/${state.question.questionId}`, params);
        } else {
            response = await this.$axios.$post(`/user/question/answer/default/${state.question.questionId}`,
                {answer, createAnswerWithLink});
        }
        commit('ADD_ANSWER', {
            answerId: response.answerId, isAdmin: true, upVotes: 0, notes: [], numberOfNotes: 0,
            imageUrl: response.imageUrl, answerType: 'Default', answer, answerHtml: response.answerHtml,
            created: response.created, creator: response.creator
        });
        if (response.oneTimeNotificationCreated) {
            dispatch('notification/checkNotificationChanged', null, {root:true});
        }
        return response.answerId;
    },
    async editTextAnswer({commit}, {answer, image, answerId, hasChangedAnswer, hasChangedImage}) {
        if (hasChangedAnswer) {
            let response;
            if (typeof answer === 'string' && answer.trim() === '') {
                response = await this.$axios.$put(`/user/question/answer/default/${answerId}`);
            } else {
                response = await this.$axios.$put(`/user/question/answer/default/${answerId}`, {answer});
            }
            commit('EDIT_ANSWER', {answerId, answer: {answer, answerHtml: response.answerHtml}});
        }
        if (hasChangedImage) {
            if (image === null) {
                await this.$axios.$delete(`/user/question/answer/default/image`, {params: {answerId}});
                commit('EDIT_ANSWER', {answerId, answer: {imageUrl: null}});
            } else {
                let blob = dataURItoBlob(image);
                let response = await putWithFile(this.$axios, blob,
                    `/user/question/answer/default/image`, {answerId});
                commit('EDIT_ANSWER', {answerId, answer: {imageUrl: response.imageUrl}});
            }
        }
    },
    async createYoutubeAnswer({commit, dispatch, state}, youtubeData) {
        if (youtubeData.hasOwnProperty('description') && youtubeData.description.trim() === '') {
            delete youtubeData.description;
        }
        let response = await this.$axios.$post(`/user/question/answer/youtube/${state.question.questionId}`,
            youtubeData);
        addDefaultProperties(youtubeData, 'Youtube', response);
        youtubeData.idOnYoutube = response.idOnYoutube;
        youtubeData.linkEmbed = `https://www.youtube.com/embed/${response.idOnYoutube}`;

        commit('ADD_ANSWER', youtubeData);
        if (response.oneTimeNotificationCreated) {
            dispatch('notification/checkNotificationChanged', null, {root:true});
        }
        return response.answerId;
    },
    async editYoutubeAnswer({commit, state}, {answerId, description, title}) {
        let params = {title};
        if (description && description.trim() !== '') {
            params.description = description;
        }
        let response = await this.$axios.$put(`/user/question/answer/youtube/${answerId}`, params);
        commit('EDIT_ANSWER', {answerId, answer: {description, descriptionHtml: response.descriptionHtml, title}});
    },
    async createLinkAnswer({commit, dispatch, state}, linkData) {
        if (linkData.hasOwnProperty('description') && linkData.description.trim() === '') {
            delete linkData.description;
        }
        let response = await this.$axios.$post(`/user/question/answer/link/${state.question.questionId}`, linkData);
        addDefaultProperties(linkData, 'Link', response);
        linkData.pageType = linkData.type;
        linkData.imageUrl = response.imageUrl;
        commit('ADD_ANSWER', linkData);
        if (response.oneTimeNotificationCreated) {
            dispatch('notification/checkNotificationChanged', null, {root:true});
        }
        return response.answerId;
    },
    async editLinkAnswer({commit, state}, {answerId, description, title, type}) {
        let params = {title, type};
        if (description && description.trim() !== '') {
            params.description = description;
        }
        let response = await this.$axios.$put(`/user/question/answer/link/${answerId}`, params);
        commit('EDIT_ANSWER', {
            answerId, answer: {
                description, descriptionHtml: response.descriptionHtml, title,
                pageType: type
            }
        });
    },
    async createBookAnswer({commit, dispatch, state}, bookData) {
        let response = await this.$axios.$post(`/user/question/answer/book/${state.question.questionId}`,
            bookData);
        addDefaultProperties(bookData, 'Book', response);
        bookData.imageUrl = response.imageUrl;
        commit('ADD_ANSWER', bookData);
        if (response.oneTimeNotificationCreated) {
            dispatch('notification/checkNotificationChanged', null, {root:true});
        }
        return response.answerId;
    },
    async editBookAnswer({commit, state}, {answerId, description}) {
        let response = await this.$axios.$put(`/user/question/answer/book/${answerId}`, {description});
        commit('EDIT_ANSWER', {answerId, answer: {description, descriptionHtml: response.descriptionHtml}});
    },
    async createCommitmentAnswer({commit, dispatch, state, rootState}, commitmentData) {
        let response = await this.$axios.$post(`/user/question/answer/commitment/${state.question.questionId}`,
            {
                commitmentId: commitmentData.commitmentId, description: commitmentData.description,
                language: rootState.i18n.language
            });
        addDefaultProperties(commitmentData, 'Commitment', response);
        commitmentData.commitmentSlug = response.slug;
        commitmentData.imageUrl = response.imageUrl;
        commitmentData.regions = response.regions;
        commit('ADD_ANSWER', commitmentData);
        if (response.creator && response.creator.isAdminOfCommitment) {
            commit('notification/ADD_NOTIFICATION', {
                type: 'showQuestionRequest', created: response.created, commitmentId: commitmentData.commitmentId,
                commitmentTitle: commitmentData.title, commitmentSlug: commitmentData.commitmentSlug,
                questionId: state.question.questionId, question: state.question.question,
                questionSlug: commitmentData.questionSlug, removed: false
            }, {root: true});
        }
        if (response.oneTimeNotificationCreated) {
            dispatch('notification/checkNotificationChanged', null, {root:true});
        }
        return response.answerId;
    },
    async editCommitmentAnswer({commit, state}, {answerId, description}) {
        let response = await this.$axios.$put(`/user/question/answer/commitment/${answerId}`, {description});
        commit('EDIT_ANSWER', {answerId, answer: {description, descriptionHtml: response.descriptionHtml}});
    },
    async deleteAnswer({commit, state}, answerId) {
        await this.$axios.$delete(`/user/question/answer`, {params: {answerId}});
        commit('DELETE_ANSWER', answerId);
    },
    async createAnswerNote({commit, state}, {answerId, text}) {
        let response = await this.$axios.$post(`/user/question/answer/note`, {answerId, text});
        commit('ADD_ANSWER_NOTE', {
            answerId, note: {
                noteId: response.noteId, text: text, textHtml: response.textHtml, isAdmin: true, upVotes: 0,
                created: response.created, creator: response.creator
            }
        });
    },
    async loadAnswerNote({commit, state}, answerId) {
        let response = await this.$axios.$get(`/question/answer/note`, {
            params: {answerId, page: 0, sort: state.sortNotes}
        });
        commit('SET_ANSWER_NOTES', {answerId, notes: response.notes});
    },
    async upVoteNoteOfAnswer({commit}, {answerId, noteId}) {
        await this.$axios.$post(`/user/question/answer/note/upVote`, {noteId});
        commit('UP_VOTE_NOTE_OF_ANSWER', {answerId, noteId});
    },
    async downVoteNoteOfAnswer({commit}, {answerId, noteId}) {
        await this.$axios.$delete(`/user/question/answer/note/upVote`, {params: {noteId}});
        commit('DOWN_VOTE_NOTE_OF_ANSWER', {answerId, noteId});
    },
    async deleteNoteOfAnswer({commit}, {answerId, noteId}) {
        await this.$axios.$delete(`/user/question/answer/note`, {params: {noteId}});
        commit('DELETE_NOTE_OF_ANSWER', {answerId, noteId});
    },
};
