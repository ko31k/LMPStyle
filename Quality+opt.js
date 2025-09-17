
/*
 * Quality+.optimized.js
 * Показує якість релізу (Resolution + Source + (Audio)) для фільмів і серіалів.
 */

(function(){
    // ====== CONFIG ======
    const SHOW_QUALITY_FOR_TV_SERIES = true;

    // ====== Словники ======
    const RESOLUTION_MAP = {
        "2160p":"4K","4k":"4K","4к":"4K",
        "1440p":"1440p",
        "1080p":"1080p","1080":"1080p","1080i":"1080i",
        "720p":"720p",
        "480p":"480p","480":"480p",
        "sd":"SD"
    };

    const SOURCE_MAP = {
        "blu-ray remux":"BDRemux",
        "bdremux":"BDRemux",
        "bdrip":"BDRip",
        "uhd blu-ray":"UHD Blu-ray",
        "blu-ray disc":"Blu-ray",
        "web-dl":"WEB-DL",
        "webdlrip":"WEB-DLRip",
        "web-dlrip":"WEB-DLRip",
        "webrip":"WEBRip",
        "hdtvrip":"HDTVRip",
        "hdrip":"HDRip",
        "dvdrip":"DVDRip",
        "telecine":"TC",
        "tc":"TC",
        "ts":"TS",
        "telesynch":"TS",
        "camrip":"CAMRip",
        "cam":"CAMRip",
        "hybrid":"Hybrid",
        "upscale":"Upscale AI"
    };

    // регулярки для українського аудіо
    const AUDIO_MAP_UKR = [
        {regex:/(\d+)xukr/i,label:m=>m[1]+"xUkr"},
        {regex:/ukr dub/i,label:()=>"Dub"},
        {regex:/ukr line/i,label:()=>"Line"},
        {regex:/ukr ts/i,label:()=>"TS"},
        {regex:/звук с ts/i,label:()=>"TS"},
        {regex:/ukr mic/i,label:()=>"Mic"},
        {regex:/ukr/i,label:()=>"Ukr"}
    ];

    // ====== Функція парсингу ======
    function parseQualityLabel(title){
        let t = (title||"").toLowerCase();

        // resolution
        let resolution = "";
        for(let key in RESOLUTION_MAP){
            if(t.includes(key)){
                resolution = RESOLUTION_MAP[key];
                break;
            }
        }

        // source
        let source = "";
        for(let key in SOURCE_MAP){
            if(t.includes(key)){
                source = SOURCE_MAP[key];
                break;
            }
        }

        // audio
        let audio = "";
        for(let i=0;i<AUDIO_MAP_UKR.length;i++){
            let m = t.match(AUDIO_MAP_UKR[i].regex);
            if(m){
                audio = typeof AUDIO_MAP_UKR[i].label==='function' ? AUDIO_MAP_UKR[i].label(m):AUDIO_MAP_UKR[i].label;
                break;
            }
        }

        let base = [resolution,source].filter(Boolean).join(' ');
        return audio? base+" ("+audio+")":base;
    }

    // ====== Експорт у Lampa ======
    window.QualityOptimized = {
        parseQualityLabel: parseQualityLabel,
        SHOW_QUALITY_FOR_TV_SERIES: SHOW_QUALITY_FOR_TV_SERIES
    };
})();
