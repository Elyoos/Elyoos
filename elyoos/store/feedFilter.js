export const state = () => ({
    mainFilter: 'question',
    activityTypeFilter: 'selectAll',
    regionFilter: {id: 'international', description: 'Alle Regionen'},
    topicFilter: [{id: 'allTopics'}],
    trustCircleFilter: 0
});

export const getters = {
    getFilterParams: state => {
        let params = {};
        if (state.mainFilter === 'activity') {
            if (state.activityTypeFilter !== 'selectAll') {
                params.typeFilter = state.activityTypeFilter;
            }
            if (state.regionFilter.id !== 'international') {
                params.regions = [state.regionFilter.id]
            }
        }
        if (!(state.topicFilter.length === 1 && state.topicFilter[0].id === 'allTopics')) {
            params.topics = state.topicFilter.map(topic => topic.id);
        }
        if (state.trustCircleFilter > 0) {
            params.trustCircle = state.trustCircleFilter
        }
        return params;
    }
};

export const mutations = {
    SET_MAIN_FILTER(state, filter) {
        state.mainFilter = filter;
    },
    SET_ACTIVITY_TYPE_FILTER(state, filter) {
        state.activityTypeFilter = filter;
    },
    SET_REGION_FILTER(state, regionFilter) {
        state.regionFilter = regionFilter;
    },
    SET_TOPIC_FILTER(state, topicFilter) {
        state.topicFilter = topicFilter;
    },
    INCREASE_TRUST_CIRCLE_FILTER(state) {
        if (state.trustCircleFilter < 4) {
            state.trustCircleFilter++;
        }
    },
    DECREASE_TRUST_CIRCLE_FILTER(state) {
        if (state.trustCircleFilter > 0) {
            state.trustCircleFilter--;
        }
    },
    DEACTIVATE_TRUST_CIRCLE_FILTER(state) {
        state.trustCircleFilter = 0;
    }
};


export const actions = {};