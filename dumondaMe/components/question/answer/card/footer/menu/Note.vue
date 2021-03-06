<template>
    <div class="answer-note">
        <div class="note-title">
            <span class="user-name" v-if="note.creator.isHarvestingUser"
                  @click="$router.push({name: 'dumondaMeOnTour-userId', params: {userId: note.creator.userId}})">
                {{note.creator.name}} </span>
            <span class="user-name" v-else-if="note.isAdmin" @click="$router.push({name: 'user'})">
                {{$t("common:you")}} </span>
            <span class="user-name anonymous" v-else-if="note.creator.isAnonymous">
                {{$t("common:anonymousUser")}} </span>
            <span class="user-name" v-else @click="$router.push({name: 'user-userId-slug',
                     params: {userId: note.creator.userId, slug: note.creator.slug}})">
                {{note.creator.name}} </span>
            <span class="created">{{note.created | formatRelativeTimesAgo}}</span>
        </div>
        <div class="note-text" v-html="note.textHtml"></div>
        <div class="note-commands">
            <div class="note-command">
                <v-btn icon outlined class="command" :disabled="note.isAdmin || upVoteRunning"
                       :loading="upVoteRunning" @click="upVoteNote(note.noteId)" v-if="!note.hasVoted">
                    <v-icon size="16">$vuetify.icons.mdiThumbUpOutline</v-icon>
                </v-btn>
                <v-btn icon outlined class="command" :disabled="upVoteRunning"
                       :loading="upVoteRunning" @click="downVoteNote(note.noteId)" v-else>
                    <v-icon size="16">$vuetify.icons.mdiThumbDownOutline</v-icon>
                </v-btn>
                <span class="command-text">{{note.upVotes}}</span>
            </div>
            <div class="note-command" v-if="note.isAdmin">
                <v-btn icon outlined class="command" @click="$emit('edit-note', note)">
                    <v-icon size="16">$vuetify.icons.mdiPencil</v-icon>
                </v-btn>
            </div>
            <div class="note-command" v-if="note.isAdmin">
                <v-btn icon outlined class="command" @click="$emit('delete-note', note)">
                    <v-icon size="16">$vuetify.icons.mdiDelete</v-icon>
                </v-btn>
            </div>
        </div>
        <v-snackbar top v-model="showError" color="error" :timeout="0">{{$t("common:error.unknown")}}
            <v-btn dark text @click="showError = false">{{$t("common:button.close")}}</v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    export default {
        props: ['note', 'answerId', 'answerTitle'],
        data() {
            return {upVoteRunning: false, showError: false}
        },
        methods: {
            async upVoteNote(noteId) {
                await this.sendingVoteCommand(noteId, 'question/upVoteNoteOfAnswer')
            },
            async downVoteNote(noteId) {
                await this.sendingVoteCommand(noteId, 'question/downVoteNoteOfAnswer')
            },
            async sendingVoteCommand(noteId, command) {
                try {
                    this.upVoteRunning = true;
                    await this.$store.dispatch(command, {answerId: this.answerId, noteId});
                } catch (error) {
                    this.showError = true;
                } finally {
                    this.upVoteRunning = false;
                }
            }
        },
    }
</script>

<style lang="scss">
    .answer-note {
        margin-top: 14px;
        font-size: 14px;

        .note-title {
            .user-name {
                cursor: pointer;
                color: $primary-text;
            }

            .user-name.anonymous {
                cursor: auto;
            }

            :hover.user-name {
                text-decoration: underline;
            }

            :hover.user-name.anonymous {
                text-decoration: none;
            }

            .created {
                font-size: 12px;
                color: $secondary-text;
            }
        }

        .note-text {
            font-weight: 300;
        }

        .note-commands {
            margin-top: 2px;

            .note-command {
                display: inline-block;
                margin-right: 2px;

                .command {
                    color: $primary-color;
                    margin: 0 4px 0 0;
                    display: inline-block;
                    height: 28px;
                    width: 28px;
                    border-width: 1px;
                    font-size: 14px;

                    .v-btn__content {
                        height: 100%;
                        width: 100%;

                        i.v-icon {
                            color: $primary-color;
                            font-size: 16px;
                            font-weight: 400;
                        }
                    }
                }

                .command-text {
                    margin-left: 2px;
                    margin-right: 12px;
                    line-height: 24px;
                    vertical-align: middle;
                    font-weight: 500;
                    color: $secondary-text;
                }
            }
        }
    }
</style>
