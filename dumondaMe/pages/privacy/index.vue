<template>
    <div id="privacy-policy">
        <h1>{{$t('pages:privacy.title')}}</h1>
        <h2>{{$t('pages:privacy.general.title')}}</h2>
        <ul>
            <li>{{$t('pages:privacy.general.point1')}}</li>
            <li>{{$t('pages:privacy.general.point2')}}</li>
            <li>{{$t('pages:privacy.general.point3')}}</li>
        </ul>
        <h2>{{$t('pages:privacy.processingData.title')}}</h2>

        <h3>1. {{$t('pages:privacy.processingData.general.title')}}</h3>
        <p>{{$t('pages:privacy.processingData.general.text1')}}</p>

        <h3>2. {{$t('pages:privacy.processingData.informationProvideToUs.title')}}</h3>
        <p>{{$t('pages:privacy.processingData.informationProvideToUs.text1')}}</p>
        <ul>
            <li>{{$t('pages:privacy.processingData.informationProvideToUs.point1')}}</li>
            <li>{{$t('pages:privacy.processingData.informationProvideToUs.point2')}}</li>
            <li>{{$t('pages:privacy.processingData.informationProvideToUs.point3')}}</li>
        </ul>

        <h3>3. {{$t('pages:privacy.processingData.informationAutomaticallyObtain.title')}}</h3>
        <p>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.text1')}}</p>
        <ul>
            <li>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.point1')}}</li>
            <li>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.point2')}}</li>
            <li>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.point3')}}</li>
        </ul>
        <h4>3.1 {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.title')}}</h4>
        <h5>3.1.1 {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.matomo.title')}}</h5>
        <p>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.matomo.description')}}</p>
        <iframe style="height: 180px; width: 600px;" class="matomo-opt-out-iframe-desktop"
                :src="optOutLink">
        </iframe>
        <iframe style="border: 0; height: 290px; width: 300px;" class="matomo-opt-out-iframe-mobile"
                :src="optOutLink">
        </iframe>

        <h5>3.1.2 {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.dumondaMe.title')}}</h5>
        <p>{{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.dumondaMe.description')}}</p>
        <h5>3.1.3 {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.youtube.title')}}</h5>
        <p v-html="$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.youtube.description')"></p>
        <h5>3.1.4
            {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.adWordsConversionTracking.title')}}</h5>
        <p>
            {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.adWordsConversionTracking.description')}}</p>
        <div class="show-more-text" v-if="hideAdWordsText" @click="hideAdWordsText = false">
            {{$t('common:button.showMore')}}
        </div>
        <p v-else>
            {{$t('pages:privacy.processingData.informationAutomaticallyObtain.cookies.adWordsConversionTracking.descriptionHide')}}
        </p>

        <h3>4. {{$t('pages:privacy.processingData.informationFromOtherSource.title')}}</h3>
        <p>{{$t('pages:privacy.processingData.informationFromOtherSource.text1')}}</p>

        <h3>5. {{$t('pages:privacy.processingData.whoReceiveInformation.title')}}</h3>
        <p>{{$t('pages:privacy.processingData.whoReceiveInformation.text1')}}</p>
        <ul>
            <li>{{$t('pages:privacy.processingData.whoReceiveInformation.point1')}}</li>
            <li>{{$t('pages:privacy.processingData.whoReceiveInformation.point2')}}</li>
        </ul>
        <h4>5.1 {{$t('pages:privacy.processingData.whoReceiveInformation.youtube.title')}}</h4>
        <p v-html="$t('pages:privacy.processingData.whoReceiveInformation.youtube.text1')"></p>

        <h2>{{$t('pages:privacy.rights.title')}}</h2>

        <h3>{{$t('pages:privacy.rights.userRights.title')}}</h3>
        <p>{{$t('pages:privacy.rights.userRights.text1')}}</p>

        <h3>{{$t('pages:privacy.rights.deleteData.title')}}</h3>
        <p>{{$t('pages:privacy.rights.deleteData.text1')}}</p>

        <h3>{{$t('pages:privacy.rights.rightOfObjection.title')}}</h3>
        <p>{{$t('pages:privacy.rights.rightOfObjection.text1')}}</p>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                hideAdWordsText: true
            }
        },
        async fetch({store}) {
            store.commit('toolbar/SHOW_BACK_BUTTON');
        },
        computed: {
            selectedLanguage() {
                return this.$store.state.i18n.language
            },
            optOutLink() {
                return `https://dumondame.innocraft.cloud/index.php?module=CoreAdminHome&action=optOut&language=${this.$store.state.i18n.language}&backgroundColor=&fontColor=&fontSize=&fontFamily=`
            }
        }
    }
</script>

<style lang="scss">
    #privacy-policy {
        margin-top: 18px;
        @media screen and (max-width: $xs) {
            padding: 0 16px;
        }

        .show-more-text {
            display: inline-block;
            cursor: pointer;
            font-size: 16px;
            color: $primary-color;
        }

        .terms-date {
            margin-top: 4px;
            font-size: 14px;
        }

        .terms-text {
            margin-top: 12px;
            font-size: 14px;
        }

        h1 {
            font-size: 52px;
            line-height: 60px;
            color: #333;
            margin-bottom: 40px;
            @media screen and (max-width: $xs) {
                font-size: 28px;
                line-height: 34px;
                margin-bottom: 18px;
            }
        }

        h2 {
            font-size: 36px;
            line-height: 52px;
            color: #333;
            margin-top: 30px;
            margin-bottom: 20px;
            @media screen and (max-width: $xs) {
                font-size: 24px;
                line-height: 28px;
                margin-bottom: 14px;
            }
        }

        h3 {
            font-size: 24px;
            color: #333;
            margin-top: 30px;
            margin-bottom: 12px;
            @media screen and (max-width: $xs) {
                font-size: 20px;
                margin-bottom: 14px;
            }
        }

        h4 {
            font-size: 20px;
            color: #333;
            margin-top: 12px;
            margin-bottom: 12px;
            font-weight: 500;
            @media screen and (max-width: $xs) {
                font-size: 18px;
                margin-bottom: 12px;
            }
        }

        h5 {
            font-weight: 400;
            font-size: 20px;
            margin-bottom: 12px;
            @media screen and (max-width: $xs) {
                font-size: 18px;
            }
        }

        p {
            font-weight: 300;
            font-size: 16px;
            line-height: 24px;
        }

        ul {
            font-weight: 300;
            font-size: 16px;
            line-height: 24px;
            margin-left: 18px;
            margin-bottom: 18px;
            @media screen and (max-width: $xs) {
                margin-left: 8px;
            }
        }

        .matomo-opt-out-iframe-desktop {
            border: 2px solid $warning;
            border-radius: 4px;
            @media screen and (max-width: 650px) {
                display: none;
            }
        }

        .matomo-opt-out-iframe-mobile {
            @media screen and (min-width: 650px) {
                display: none;
            }
        }
    }
</style>