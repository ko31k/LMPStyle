(function(){
    'use strict';

    // --- Переклад якості ---
    function translateQuality(quality){
        if(!quality) return '';
        quality = quality.toLowerCase();
        if(quality.includes('2160') || quality.includes('4k')) return '4K';
        if(quality.includes('1440') || quality.includes('2k')) return '2K';
        if(quality.includes('1080')) return '1080';
        if(quality.includes('720')) return '720';
        if(quality.includes('480')) return '480';
        if(quality.includes('ts')) return 'TS';
        return quality.toUpperCase();
    }

    // --- Вставка жовтого бейджа якості ---
    function createQualityTag(card, data){
        var quality = translateQuality(data.quality);
        if(quality){
            var qualityElement = document.createElement('div');
            qualityElement.className = 'card-quality';
            qualityElement.textContent = quality;
            qualityElement.style.position = 'absolute';
            qualityElement.style.top = '10px';
            qualityElement.style.left = '10px';
            qualityElement.style.backgroundColor = 'yellow';
            qualityElement.style.color = 'black';
            qualityElement.style.padding = '3px 6px';
            qualityElement.style.fontSize = '12px';
            qualityElement.style.fontWeight = 'bold';
            qualityElement.style.borderRadius = '4px';
            card.appendChild(qualityElement);
        }
    }

    // --- Рендер усіх рейтингів ---
    function appendRatings(card, data){
        var ratingsContainer = card.querySelector('.card-ratings');
        if(!ratingsContainer){
            ratingsContainer = document.createElement('div');
            ratingsContainer.className = 'card-ratings';
            card.appendChild(ratingsContainer);
        }
        ratingsContainer.innerHTML = '';

        var ratings = [
            {source:'IMDb', value:data.imdb},
            {source:'Kinopoisk', value:data.kinopoisk}
        ];

        ratings.forEach(function(r){
            if(r.value){
