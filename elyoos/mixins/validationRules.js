export default {
    methods: {
        ruleFieldRequired: function (text) {
            return (v) => v.trim() !== '' || text;
        },
        ruleSelectRequired: function (text) {
            return (v) => !!v || text;
        },
        ruleSelectMultipleRequired: function (text) {
            return (v) => (v.length && v.length > 0) || text;
        },
        ruleToManyChars: function (text, length) {
            return (v) => v.length <= length || text;
        },
        ruleMinLength: function (text, minLength) {
            return (v) => v.trim().length >= minLength || text;
        },
        rulePasswordChars: function (text) {
            return (v) => (/(?=.*[A-Z])/.test(v) && /(?=.*[0-9])/.test(v)) || text;
        },
        rulePasswordEquals: function (text, password) {
            return (v) => v === password || text;
        },
        ruleIsEmail: function (text) {
            return (v) => /(.+)@(.+){2,}\.(.+){2,}/.test(v) || text;
        }
    }
}