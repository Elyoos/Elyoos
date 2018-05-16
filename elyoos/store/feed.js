export const state = () => ({
    feed: [],
    page: 0,
    totalNumberOfElements: 0,
    typeFilter: null,
    publicFeed: true, //Is feed in public mode
    timestamp: Number.MAX_SAFE_INTEGER
});

export const mutations = {
    SET_FEED(state, feed) {
        state.feed = feed;
    },
    ADD_TO_FEED(state, feed) {
        state.feed = state.feed.concat(feed);
    },
    SET_PAGE(state, page) {
        state.page = page;
    },
    SET_NUMBER_OF_ELEMENTS(state, totalNumberOfElements) {
        state.totalNumberOfElements = totalNumberOfElements;
    },
    SET_TIMESTAMP(state, timestamp) {
        state.timestamp = timestamp;
    },
    SET_TYPE_FILTER(state, filter) {
        state.typeFilter = filter;
    },
    SET_IS_PUBLIC_FEED(state, publicFeed) {
        state.publicFeed = publicFeed;
    }
};

const getFeedRequest = async function (commit, isAuthenticated, params, commitCommand, isPublicFeed, $axios) {
    let response;
    if (isAuthenticated && !isPublicFeed) {
        response = await $axios.$get(`/user/feed`, params);
    } else {
        response = await $axios.$get(`/feed`, params);
    }
    commit(commitCommand, response.feed);
    commit('SET_NUMBER_OF_ELEMENTS', response.totalNumberOfElements);
    commit('SET_PAGE', params.params.page);
    return response;
};

export const actions = {
    async getFeed({commit, state}, {isAuthenticated, typeFilter}) {
        let params = {params: {page: 0}};
        if (typeFilter) {
            params.params.typeFilter = typeFilter;
        }
        let response = await getFeedRequest(commit, isAuthenticated, params, 'SET_FEED', state.publicFeed, this.$axios);
        commit('SET_TIMESTAMP', response.timestamp);
    },
    async loadNextFeedElements({commit, state}, {isAuthenticated}) {
        let params = {params: {page: state.page + 1}};
        if (state.typeFilter) {
            params.params.typeFilter = state.typeFilter;
        }
        await getFeedRequest(commit, isAuthenticated, params, 'ADD_TO_FEED', state.publicFeed, this.$axios);
    },
    async setTypeFilter({commit, state}, {filter, isAuthenticated}) {
        if (filter !== state.typeFilter) {
            commit('SET_TYPE_FILTER', filter);
            let params = {params: {page: 0}};
            if (filter) {
                params.params.typeFilter = filter;
            }
            await getFeedRequest(commit, isAuthenticated, params, 'SET_FEED', state.publicFeed, this.$axios);
        }
    }
};