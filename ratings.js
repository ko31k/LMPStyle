(function () {
    'use strict';
    
    // SVG иконки
    var star_svg = '<svg viewBox="5 5 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="white" stroke-width="2" d="M32 18.7461L36.2922 27.4159L46.2682 28.6834L38.9675 35.3631L40.7895 44.8469L32 40.2489L23.2105 44.8469L25.0325 35.3631L17.7318 28.6834L27.7078 27.4159L32 18.7461ZM32 23.2539L29.0241 29.2648L22.2682 30.1231L27.2075 34.6424L25.9567 41.1531L32 37.9918L38.0433 41.1531L36.7925 34.6424L41.7318 30.1231L34.9759 29.2648L32 23.2539Z"/><path fill="none" stroke="white" stroke-width="2" d="M32 9C19.2975 9 9 19.2975 9 32C9 44.7025 19.2975 55 32 55C44.7025 55 55 44.7025 55 32C55 19.2975 44.7025 9 32 9ZM7 32C7 18.1929 18.1929 7 32 7C45.8071 7 57 18.1929 57 32C57 45.8071 45.8071 57 32 57C18.1929 57 7 45.8071 7 32Z"/></svg>';
    var avg_svg = '<svg width="800px" height="800px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><g transform="translate(0 -1028.4)"><path d="m9.533-0.63623 2.79 6.2779 5.581 0.6976-4.186 3.4877 1.395 6.278-5.58-3.488-5.5804 3.488 1.3951-6.278-4.1853-3.4877 5.5804-0.6976z" transform="matrix(1.4336 0 0 1.4336 -1.6665 1029.3)" fill="#f39c12"/><g fill="#f1c40f"><g><path d="m12 0v13l4-4z" transform="translate(0 1028.4)"/><path d="m12 13 12-3-6 5z" transform="translate(0 1028.4)"/><path d="m12 13 8 11-8-5z" transform="translate(0 1028.4)"/><path d="m12 13-8 11 2-9z" transform="translate(0 1028.4)"/></g><path d="m12 13-12-3 8-1z" transform="translate(0 1028.4)"/></g></g></svg>';
    var oscars_svg = '<svg width="18px" height="60px" viewBox="0 0 18 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>icon_award_1</title><desc>Created with Sketch.</desc><defs></defs><g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icons_web" transform="translate(-803.000000, -370.000000)"><g id="Group-70" transform="translate(803.000000, 376.000000)"><path d="M1.0605,10.9082 C0.5425,12.0462 0.5435,13.6232 1.0555,15.0802 C1.0745,16.2022 1.1915,17.3052 1.6625,18.1582 C1.8995,19.1772 2.6285,20.1292 3.4585,21.0222 C3.4865,21.2622 3.5285,21.5702 3.5905,21.8922 C2.8275,24.3242 3.5075,28.7202 4.4055,30.8782 C4.3865,31.2082 4.3985,31.5812 4.4795,31.9552 C4.4705,32.0062 4.4605,32.0592 4.4495,32.1202 C4.3835,32.4682 4.2945,32.9442 4.3285,33.6582 C4.3785,34.7902 4.7415,36.6992 5.4065,39.3312 C5.2935,39.7672 5.2895,40.1282 5.3175,40.4572 L4.6625,40.4572 C3.4415,40.4572 2.4495,41.4502 2.4495,42.6722 L2.4495,42.9952 C2.4495,43.0452 1.5895,43.9502 1.5895,43.9502 L1.7175,43.9502 C1.4395,44.3222 1.2775,44.7832 1.2775,45.2792 L1.2775,48.1552 L0.9995,48.3432 C0.3735,48.7652 -0.0005,49.4692 -0.0005,50.2252 L-0.0005,51.7302 C-0.0005,52.9822 1.0165,54.0002 2.2665,54.0002 L15.7325,54.0002 C16.9825,54.0002 17.9995,52.9822 17.9995,51.7302 L17.9995,50.2252 C17.9995,49.4752 17.6295,48.7742 17.0095,48.3502 L16.7225,48.1532 L16.7225,45.2792 C16.7225,44.7842 16.5605,44.3232 16.2815,43.9502 L16.3385,43.9502 L15.5405,43.2052 C15.5475,43.1362 15.5505,43.0662 15.5505,42.9952 L15.5505,42.6722 C15.5505,41.4502 14.5585,40.4572 13.3375,40.4572 L12.6225,40.4572 C12.6505,40.1282 12.6455,39.7682 12.5335,39.3322 C13.1965,36.7172 13.5605,34.8092 13.6135,33.6542 C13.6455,32.9412 13.5565,32.4662 13.4905,32.1192 C13.4795,32.0582 13.4695,32.0042 13.4605,31.9532 C13.5395,31.5812 13.5525,31.2102 13.5345,30.8822 C14.4335,28.7252 15.1145,24.3242 14.3505,21.8912 C14.4115,21.5672 14.4535,21.2602 14.4805,21.0232 C15.3125,20.1252 16.0435,19.1702 16.2785,18.1482 C16.7435,17.2932 16.8625,16.1852 16.8835,15.1172 C17.3945,13.7492 17.3975,12.0502 16.8735,10.8982 L15.8145,9.5162 C15.2665,9.0332 14.6395,8.6752 14.0925,8.3622 L13.9405,8.2752 L13.5655,8.0592 L13.3585,7.9262 C13.0955,7.7562 12.9735,7.6442 12.9165,7.5812 C12.8915,7.5542 12.8635,7.5222 12.8355,7.4902 C12.9215,7.2372 12.9735,6.9882 13.0075,6.7612 C13.3405,6.1872 13.4745,5.4532 13.3505,4.6712 C13.3155,4.4512 13.2615,4.2512 13.1915,4.0682 C13.2145,2.6792 12.7135,1.7952 12.2555,1.2802 C11.7375,0.6962 10.7565,0.0002 9.0285,0.0002 L8.9255,0.0012 L8.8235,0.0002 C7.4705,0.0002 6.4115,0.4202 5.6745,1.2502 C5.0635,1.9382 4.7515,2.8262 4.7455,3.8952 C4.6295,4.1372 4.5435,4.4142 4.4955,4.7282 C4.3735,5.5232 4.5325,6.2672 4.9055,6.8372 C4.9515,7.0562 5.0125,7.2812 5.0945,7.5012 C4.9645,7.6462 4.8395,7.7602 4.5645,7.9382 L4.3875,8.0542 L3.9845,8.2832 L3.8515,8.3602 C3.2925,8.6792 2.6515,9.0442 2.0955,9.5422 L1.0605,10.9082 Z" id="Fill-6" fill="#FFFFFF"></path><path d="M2,51.7305 L2,50.2255 C2,50.1305 2.047,50.0485 2.119,50.0005 L15.88,50.0005 C15.951,50.0485 16,50.1305 16,50.2255 L16,51.7305 C16,51.8785 15.881,52.0005 15.732,52.0005 L2.267,52.0005 C2.119,52.0005 2,51.8785 2,51.7305 L2,51.7305 Z M3.277,49.4935 L3.277,45.2795 C3.277,45.1725 3.354,45.0845 3.455,45.0665 L14.545,45.0665 C14.645,45.0845 14.723,45.1725 14.723,45.2795 L14.723,49.4935 L3.277,49.4935 Z M4.369,44.5595 L4.65,43.2095 C4.538,43.2055 4.449,43.1105 4.449,42.9955 L4.449,42.6715 C4.449,42.5525 4.544,42.4575 4.662,42.4575 L13.338,42.4575 C13.455,42.4575 13.551,42.5525 13.551,42.6715 L13.551,42.9955 C13.551,43.1105 13.461,43.2055 13.348,43.2095 L13.629,44.5595 L4.369,44.5595 Z M7.363,41.0685 C7.391,40.3065 7.139,40.1835 7.496,39.4275 C7.117,37.9655 6.393,35.0465 6.326,33.5625 C6.287,32.7425 6.475,32.4735 6.512,31.7585 C6.354,31.4655 6.387,30.9115 6.459,30.5475 C5.818,29.8765 4.592,23.3525 5.688,22.0735 C5.557,21.6455 5.457,21.0035 5.413,20.4695 C5.799,20.3885 6.174,20.1875 6.496,19.9765 L6.801,19.7555 L6.857,19.7385 L6.955,19.6435 L7.021,19.5945 C7.184,19.4685 7.327,19.3495 7.454,19.2475 L8.75,19.2395 L8.75,41.9505 L6.672,41.9505 C6.97,41.6725 7.352,41.3835 7.363,41.0685 L7.363,41.0685 Z M9.25,41.9505 L9.25,19.2365 L10.392,19.2285 L10.436,19.2805 C11.045,19.9555 11.871,20.3325 12.52,20.5435 C12.473,21.0625 12.377,21.6655 12.253,22.0735 C13.35,23.3525 12.123,29.8765 11.482,30.5475 C11.553,30.9115 11.586,31.4655 11.428,31.7585 C11.466,32.4735 11.652,32.7425 11.615,33.5625 C11.547,35.0465 10.824,37.9655 10.443,39.4275 C10.801,40.1835 10.549,40.3065 10.577,41.0685 C10.589,41.3835 10.971,41.6725 11.268,41.9505 L9.25,41.9505 Z M10.701,18.8155 C10.653,18.7565 10.582,18.7215 10.508,18.7215 L7.727,18.7215 L8.244,17.8525 C8.417,17.5325 8.561,17.2545 8.699,17.0415 C8.846,16.8135 8.942,16.7295 8.994,16.7115 C9.318,16.6025 10.384,16.7035 10.854,16.8635 L10.989,16.8845 L11.074,16.9115 C11.115,16.9225 11.164,16.9355 11.217,16.9475 C11.322,16.9725 11.445,17.0015 11.58,17.0355 C11.853,17.1055 12.141,17.1945 12.356,17.3105 C12.479,17.3765 12.631,17.3305 12.695,17.2075 C12.761,17.0845 12.715,16.9295 12.592,16.8645 C12.318,16.7165 11.979,16.6155 11.702,16.5445 L11.638,16.5295 L11.798,16.2115 C11.848,16.0725 11.887,15.9215 11.914,15.7715 C11.972,15.4715 11.998,15.1355 11.994,14.8245 L11.981,14.5655 C12.046,14.5945 12.115,14.5945 12.179,14.5675 C12.91,14.2505 13.282,13.6305 13.547,13.1265 C13.612,13.0035 13.565,12.8495 13.443,12.7845 C13.322,12.7185 13.17,12.7665 13.104,12.8895 C12.848,13.3795 12.543,13.8575 11.98,14.1015 L11.92,14.1645 L11.893,14.0255 C11.564,12.9825 9.664,13.4955 8.307,14.0075 C7.93,14.1505 7.543,14.3135 7.171,14.4855 L6.689,14.7175 C6.43,14.5895 6.051,14.3365 5.689,14.0405 C5.322,13.7395 5.014,13.4265 4.882,13.2095 C4.811,13.0895 4.656,13.0515 4.538,13.1245 C4.42,13.1965 4.383,13.3525 4.453,13.4715 C4.633,13.7705 5.002,14.1285 5.373,14.4335 C5.562,14.5875 5.76,14.7365 5.948,14.8625 L6.166,14.9895 L6.117,15.0135 C5.471,15.3705 4.965,15.7155 4.768,15.9645 C4.68,16.0755 4.698,16.2345 4.806,16.3215 C4.914,16.4095 5.072,16.3905 5.158,16.2825 C5.449,15.9145 6.942,15.0635 8.482,14.4815 C9.24,14.1965 9.973,13.9885 10.535,13.9375 C11.125,13.8835 11.363,14.0145 11.415,14.1785 C11.508,14.4745 11.527,15.1245 11.422,15.6745 C11.37,15.9505 11.292,16.1655 11.203,16.2895 C11.125,16.3995 11.074,16.4035 11.012,16.3825 C10.5,16.2095 9.314,16.0695 8.834,16.2325 C8.396,16.3815 8.043,17.1675 7.805,17.6095 C7.549,18.0845 7.266,18.5815 6.916,18.9805 L6.659,19.2315 L6.223,19.5515 C5.883,19.7755 5.542,19.9415 5.233,19.9875 C4.779,19.5165 3.529,18.2365 3.584,17.4185 C3.092,16.9545 3.053,15.4975 3.053,14.7025 C2.532,13.4755 2.605,12.2555 2.918,11.6615 C3.287,10.9585 4.145,10.4975 4.979,10.0195 L7.463,10.4165 C7.6,10.4375 7.729,10.3425 7.75,10.2055 C7.771,10.0675 7.678,9.9375 7.541,9.9165 L5.654,9.6155 C5.98,9.4035 6.278,9.1775 6.512,8.9175 C6.844,8.5435 7.457,7.8825 7.178,7.1675 C6.918,6.8935 6.824,6.2785 6.781,5.9015 C6.256,5.7365 6.445,4.4305 6.805,4.6125 C6.787,4.5405 6.791,4.4875 6.777,4.4505 C6.533,2.4035 7.703,1.9745 8.926,2.0015 C10.15,1.9745 11.406,2.4035 11.163,4.4505 C11.139,4.4945 11.148,4.5505 11.136,4.6125 C11.418,4.5115 11.555,5.7745 11.09,5.9255 C11.049,6.3035 11.022,6.8935 10.764,7.1675 C10.484,7.8825 11.096,8.5435 11.428,8.9175 C11.658,9.1735 11.95,9.3965 12.271,9.6045 L10.33,9.9135 C10.193,9.9355 10.1,10.0645 10.121,10.2035 C10.143,10.3405 10.271,10.4355 10.408,10.4145 L12.945,10.0095 C13.784,10.4915 14.649,10.9535 15.021,11.6615 C15.336,12.2555 15.414,13.6375 14.888,14.7025 C14.888,15.4975 14.848,16.9545 14.355,17.4185 C14.411,18.2755 13.035,19.6425 12.646,20.0505 C11.998,19.8365 11.223,19.4625 10.701,18.8155 L10.701,18.8155 Z" id="Fill-9" fill="#E7BE41"></path></g><g id="Slices" transform="translate(-281.000000, 84.000000)"></g></g></g></svg>';
    var emmy_svg = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" id="svg2" version="1.1" width="321" height="563.40002" viewBox="0 0 321 563.40002"><metadata id="metadata8"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs6"/><path style="fill:#ffea55;fill-opacity:1" d="m 74.000736,558.45002 c 1.419168,-2.3925 5.869572,-9.89926 9.889782,-16.68169 L 91.2,529.43665 l 0,-18.11832 0,-18.11831 -1.5,0 c -1.314288,0 -1.5,-0.26 -1.5,-2.1 0,-1.82704 0.19056,-2.1 1.466076,-2.1 1.000278,0 1.810464,-0.58445 2.55,-1.83952 3.29883,-5.59841 17.748674,-11.01359 38.883924,-14.57201 15.07121,-2.53745 37.2238,-4.57025 49.93857,-4.58254 5.8672,-0.005 6.15295,-0.0656 6.464,-1.35593 0.179,-0.7425 1.38764,-6.21 2.68589,-12.15 l 2.36044,-10.8 -46.25496,-91.20001 C 127.98142,314.71219 106.27409,279.94570 92.962182,240.13737 88.114902,225.64192 85.404036,218.40266 84.357492,217.15891 82.493382,214.94354 81,210.15143 81,206.38504 c 0,-5.79136 3.886722,-13.68528 8.810394,-17.89391 l 2.666022,-2.27885 -8.333772,-26.65613 -8.333772,-26.65614 -10.754436,-0.37312 C 53.657564,132.13147 49.166702,131.30278 41.468017,128.17453 22.562277,120.49244 8.0414946,103.83674 2.5403311,83.523501 1.1083157,78.235737 0.9617808,76.678893 0.9474399,66.600014 0.93373098,56.965242 1.1077609,54.853206 2.2658231,50.600046 2.9996204,47.905064 3.6,45.051569 3.6,44.258946 3.6,41.308294 5.4985663,36.582977 7.807899,33.785964 9.1184184,32.198691 11.635303,29.010013 13.400976,26.700013 20.094714,17.94271 28.752256,10.929783 38.626436,6.2664654 48.028435,1.8261454 60.505212,-0.52607559 70.79076,0.20258241 76.76664,0.62593341 86.32782,3.2953864 92.701692,6.3200484 102.87171,11.14614 113.28506,20.061692 118.8,28.664521 c 1.78694,2.787483 3.5116,4.67981 5.1,5.595822 3.51801,2.028802 7.6379,6.4128 9.24688,9.839671 1.75952,3.747478 2.23256,9.138201 1.21206,13.812412 -0.43079,1.973174 -0.71217,4.93847 -0.62528,6.58955 0.12527,2.380278 -0.21942,3.719412 -1.66441,6.466381 -1.00231,1.905438 -2.12118,5.14455 -2.48637,7.198044 -1.56897,8.822442 -6.36005,20.95421 -10.33833,26.178259 -7.18039,9.44201 -17.57346,18.27858 -26.09455,22.20792 -1.7325,0.7989 -3.15,1.70018 -3.15,2.00283 0,1.30926 6.725634,21.75143 7.266342,22.08561 0.328836,0.20323 3.025728,4.52965 5.993098,9.61425 2.96737,5.08461 5.21821,8.50047 5.00185,7.5908 -1.03039,-4.3324 2.61944,-9.94923 8.35301,-12.85465 3.57477,-1.81147 9.37776,-2.48312 12.51324,-1.44832 1.87057,0.61734 2.45623,0.51503 5.3368,-0.93229 3.76508,-1.89173 10.6449,-2.57282 14.75838,-1.46106 2.8436,0.76855 5.8258,3.0433 7.41437,5.6555 1.14042,1.87525 9.0202,7.20659 9.62248,6.5104 0.19776,-0.2286 3.81209,-9.32563 8.03185,-20.21563 4.21976,-10.89001 7.78403,-19.99869 7.92061,-20.24153 0.13657,-0.24284 2.42268,0.65172 5.08023,1.98791 2.65755,1.33619 4.89397,2.34488 4.96982,2.24153 0.0759,-0.10336 7.19655,-12.75012 15.82378,-28.103909 8.62723,-15.353798 16.10334,-28.448798 16.61356,-29.100003 0.87677,-1.119006 0.91035,-1.068726 0.61169,0.915997 -0.17381,1.155 -2.21522,17.085 -4.53647,35.399995 -2.32125,18.315 -4.34836,33.8998 -4.50469,34.63289 -0.27243,1.27758 -0.50632,1.1982 -5.6375,-1.91321 l -5.35327,-3.24608 -0.32876,1.6132 c -0.18082,0.88726 -1.68957,11.04664 -3.35278,22.57639 -1.6632,11.52975 -3.16447,21.10365 -3.33615,21.27532 -0.17167,0.17168 -3.40574,-1.22777 -7.18681,-3.10989 -3.78107,-1.88211 -6.87643,-3.22101 -6.87856,-2.97532 -0.013,1.48955 -6.65991,47.21048 -6.89817,47.44875 -0.3262,0.32619 -2.27277,-0.69903 -14.39795,-7.58319 l -8.4,-4.76916 -7.35462,21.97515 c -4.04504,12.08633 -7.5017,22.43494 -7.68146,22.9969 -0.23954,0.7488 0.35068,1.36741 2.20939,2.31565 5.18677,2.64609 11.9275,10.8995 15.86876,19.42983 3.80532,8.23611 5.71185,17.96715 4.53225,23.13277 l -0.61656,2.7 14.51728,28.65811 c 10.78048,21.28139 14.73986,28.57269 15.38193,28.3263 0.84644,-0.3248 57.65033,20.07553 57.6355,20.699 -0.004,0.17412 -8.91414,10.03482 -19.8,21.91264 L 209.4,423.89211 l 0,21.96294 0,21.96295 8.85,0.40375 c 40.55234,1.85009 72.41453,8.97829 80.33073,17.97156 1.76176,2.00147 2.92223,2.80671 4.04491,2.80671 1.39927,0 1.57436,0.23355 1.57436,2.1 0,1.93333 -0.14286,2.1 -1.8,2.1 l -1.8,0 0,17.63244 0,17.63245 9.06443,15.21756 c 4.98543,8.36965 9.59746,16.09505 10.24893,17.16755 l 1.18451,1.95 -124.83872,0 -124.83872,0 z M 73.597602,127.00241 c 0.164172,-0.16417 -0.951516,-4.24865 -2.479314,-9.07661 -3.48879,-11.02485 -2.799996,-21.56162 1.799996,-27.668 1.82751,-2.4172 2.4,-4.066 2.4,-6.9 0,-2.829 -0.57249,-4.4828 -2.4,-6.9 -4.599992,-6.10638 -5.288786,-16.64315 -1.799996,-27.668 1.527798,-4.82796 2.643486,-8.91244 2.479314,-9.07661 -0.164172,-0.16417 -4.24865,0.95152 -9.07661,2.47931 -11.02485,3.48879 -21.56162,2.8 -27.668,-1.8 -2.4172,-1.82751 -4.066,-2.4 -6.9,-2.4 -2.829,0 -4.4828,0.57249 -6.9,2.4 -6.10638,4.6 -16.64315,5.28879 -27.668,1.8 -4.82796,-1.52779 -8.91244,-2.64348 -9.07661,-2.47931 -0.16417,0.16417 0.95152,4.24865 2.47931,9.07661 3.48879,11.02485 2.8,21.56162 -1.8,27.668 -1.82751,2.4172 -2.4,4.071 -2.4,6.9 0,2.834 0.57249,4.4828 2.4,6.9 4.6,6.10638 5.28879,16.64315 1.8,27.668 -1.52779,4.82796 -2.64348,8.91244 -2.47931,9.07661 0.16417,0.16417 4.24865,-0.95152 9.07661,-2.47931 11.02485,-3.48879 21.56162,-2.8 27.668,1.8 2.4172,1.82751 4.071,2.4 6.9,2.4 2.834,0 4.4828,-0.57249 6.9,-2.4 6.10638,-4.6 16.64315,-5.28879 27.668,-1.8 4.82796,1.52779 8.91244,2.64348 9.07661,2.47931 z" id="path4"/></svg>';
    var golden_globe_svg = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style="stroke:none;fill:#f1c40f;" d="M 12 2 C 6.488281 2 2 6.488281 2 12 C 2 17.511719 6.488281 22 12 22 C 17.511719 22 22 17.511719 22 12 C 22 6.488281 17.511719 2 12 2 Z M 12 4 C 16.429688 4 20 7.570312 20 12 C 20 16.429688 16.429688 20 12 20 C 7.570312 20 4 16.429688 4 12 C 4 7.570312 7.570312 4 12 4 Z M 11 6 L 11 7.050781 C 9.859375 7.28125 9 8.289062 9 9.5 C 9 10.710938 9.859375 11.71875 11 11.949219 L 11 18 L 13 18 L 13 11.949219 C 14.140625 11.71875 15 10.710938 15 9.5 C 15 8.289062 14.140625 7.28125 13 7.050781 L 13 6 Z M 12 8 C 12.554688 8 13 8.445312 13 9 C 13 9.554688 12.554688 10 12 10 C 11.445312 10 11 9.554688 11 9 C 11 8.445312 11.445312 8 12 8 Z "/></g></svg>';
    var bafta_svg = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style="stroke:none;fill:#004D98;" d="M 12 2 C 6.488281 2 2 6.488281 2 12 C 2 17.511719 6.488281 22 12 22 C 17.511719 22 22 17.511719 22 12 C 22 6.488281 17.511719 2 12 2 Z M 12 4 C 16.429688 4 20 7.570312 20 12 C 20 16.429688 16.429688 20 12 20 C 7.570312 20 4 16.429688 4 12 C 4 7.570312 7.570312 4 12 4 Z M 11 6 L 11 7.050781 C 9.859375 7.28125 9 8.289062 9 9.5 C 9 10.710938 9.859375 11.71875 11 11.949219 L 11 18 L 13 18 L 13 11.949219 C 14.140625 11.71875 15 10.710938 15 9.5 C 15 8.289062 14.140625 7.28125 13 7.050781 L 13 6 Z M 12 8 C 12.554688 8 13 8.445312 13 9 C 13 9.554688 12.554688 10 12 10 C 11.445312 10 11 9.554688 11 9 C 11 8.445312 11.445312 8 12 8 Z "/></g></svg>';
    var cannes_svg = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style="stroke:none;fill:#e74c3c;" d="M 12 2 C 6.488281 2 2 6.488281 2 12 C 2 17.511719 6.488281 22 12 22 C 17.511719 22 22 17.511719 22 12 C 22 6.488281 17.511719 2 12 2 Z M 12 4 C 16.429688 4 20 7.570312 20 12 C 20 16.429688 16.429688 20 12 20 C 7.570312 20 4 16.429688 4 12 C 4 7.570312 7.570312 4 12 4 Z M 11 6 L 11 7.050781 C 9.859375 7.28125 9 8.289062 9 9.5 C 9 10.710938 9.859375 11.71875 11 11.949219 L 11 18 L 13 18 L 13 11.949219 C 14.140625 11.71875 15 10.710938 15 9.5 C 15 8.289062 14.140625 7.28125 13 7.050781 L 13 6 Z M 12 8 C 12.554688 8 13 8.445312 13 9 C 13 9.554688 12.554688 10 12 10 C 11.445312 10 11 9.554688 11 9 C 11 8.445312 11.445312 8 12 8 Z "/></g></svg>';

    // Настройки по умолчанию
    var defaultSettings = {
        enabled: true,
        showAverage: true,
        showTMDB: true,
        showIMDB: true,
        showKinopoisk: true,
        showRottenTomatoes: true,
        showMetacritic: true,
        showAwards: true,
        showOscars: true,
        showGoldenGlobes: true,
        showEmmys: true,
        showBafta: true,
        showCannes: true,
        position: 'after-title',
        colorLow: '#ff0000',
        colorMedium: '#ff9900',
        colorHigh: '#00ff00',
        showIcons: true,
        showText: true,
        fontSize: '14px',
        maxWidth: '200px'
    };

    // Загрузка настроек
    function loadSettings() {
        var saved = localStorage.getItem('lampa_ratings_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    }

    // Сохранение настроек
    function saveSettings(settings) {
        localStorage.setItem('lampa_ratings_settings', JSON.stringify(settings));
    }

    // Получение цвета в зависимости от рейтинга
    function getRatingColor(rating, max = 10) {
        var settings = loadSettings();
        var normalized = (rating / max) * 100;
        
        if (normalized < 40) return settings.colorLow;
        if (normalized < 70) return settings.colorMedium;
        return settings.colorHigh;
    }

    // Форматирование рейтинга
    function formatRating(rating, max = 10) {
        if (!rating || rating == 0) return '';
        return rating.toFixed(1);
    }

    // Создание элемента рейтинга
    function createRatingElement(rating, icon, title, max = 10) {
        var settings = loadSettings();
        if (!rating || rating == 0) return '';
        
        var formatted = formatRating(rating, max);
        var color = getRatingColor(rating, max);
        
        var html = '<div class="rating-item" style="display: inline-flex; align-items: center; margin-right: 8px;';
        if (settings.maxWidth) html += ' max-width: ' + settings.maxWidth + ';';
        html += '">';
        
        if (settings.showIcons) {
            html += '<span class="rating-icon" style="margin-right: 4px; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center;">' + icon + '</span>';
        }
        
        if (settings.showText) {
            html += '<span class="rating-text" style="font-size: ' + settings.fontSize + '; color: ' + color + '; font-weight: bold;">' + formatted;
            if (title) html += ' <span style="opacity: 0.7; font-size: 0.9em;">' + title + '</span>';
            html += '</span>';
        } else {
            html += '<span class="rating-value" style="font-size: ' + settings.fontSize + '; color: ' + color + '; font-weight: bold;">' + formatted + '</span>';
        }
        
        html += '</div>';
        return html;
    }

    // Создание элемента наград
    function createAwardElement(count, icon, title) {
        var settings = loadSettings();
        if (!count || count == 0) return '';
        
        var html = '<div class="award-item" style="display: inline-flex; align-items: center; margin-right: 8px;';
        if (settings.maxWidth) html += ' max-width: ' + settings.maxWidth + ';';
        html += '">';
        
        if (settings.showIcons) {
            html += '<span class="award-icon" style="margin-right: 4px; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center;">' + icon + '</span>';
        }
        
        if (settings.showText) {
            html += '<span class="award-text" style="font-size: ' + settings.fontSize + '; color: #FFD700; font-weight: bold;">' + count;
            if (title) html += ' <span style="opacity: 0.7; font-size: 0.9em;">' + title + '</span>';
            html += '</span>';
        } else {
            html += '<span class="award-value" style="font-size: ' + settings.fontSize + '; color: #FFD700; font-weight: bold;">' + count + '</span>';
        }
        
        html += '</div>';
        return html;
    }

    // Получение всех рейтингов
    function getAllRatings(card) {
        var settings = loadSettings();
        if (!settings.enabled) return '';
        
        var data = card.find('.card__data').data('json');
        if (!data) return '';
        
        var html = '<div class="ratings-container" style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; align-items: center;">';
        
        // Средний рейтинг
        if (settings.showAverage) {
            var average = data.rating || data.vote_average;
            if (average && average > 0) {
                html += createRatingElement(average, avg_svg, 'Avg');
            }
        }
        
        // TMDB
        if (settings.showTMDB && data.vote_average) {
            html += createRatingElement(data.vote_average, star_svg, 'TMDB');
        }
        
        // IMDB
        if (settings.showIMDB && data.imdb_rating) {
            html += createRatingElement(parseFloat(data.imdb_rating), star_svg, 'IMDB');
        }
        
        // Kinopoisk
        if (settings.showKinopoisk && data.kp_rating) {
            html += createRatingElement(parseFloat(data.kp_rating), star_svg, 'KP');
        }
        
        // Rotten Tomatoes
        if (settings.showRottenTomatoes && data.rt_rating) {
            var rtRating = typeof data.rt_rating === 'string' ? 
                parseFloat(data.rt_rating.replace('%', '')) / 10 : 
                parseFloat(data.rt_rating) / 10;
            html += createRatingElement(rtRating, star_svg, 'RT', 10);
        }
        
        // Metacritic
        if (settings.showMetacritic && data.mc_rating) {
            var mcRating = typeof data.mc_rating === 'string' ? 
                parseFloat(data.mc_rating) / 10 : 
                parseFloat(data.mc_rating) / 10;
            html += createRatingElement(mcRating, star_svg, 'MC', 10);
        }
        
        // Награды
        if (settings.showAwards) {
            // Оскары
            if (settings.showOscars && data.awards && data.awards.oscars) {
                html += createAwardElement(data.awards.oscars, oscars_svg, 'Oscars');
            }
            
            // Золотые глобусы
            if (settings.showGoldenGlobes && data.awards && data.awards.golden_globes) {
                html += createAwardElement(data.awards.golden_globes, golden_globe_svg, 'GG');
            }
            
            // Эмми
            if (settings.showEmmys && data.awards && data.awards.emmys) {
                html += createAwardElement(data.awards.emmys, emmy_svg, 'Emmys');
            }
            
            // BAFTA
            if (settings.showBafta && data.awards && data.awards.bafta) {
                html += createAwardElement(data.awards.bafta, bafta_svg, 'BAFTA');
            }
            
            // Канны
            if (settings.showCannes && data.awards && data.awards.cannes) {
                html += createAwardElement(data.awards.cannes, cannes_svg, 'Cannes');
            }
        }
        
        html += '</div>';
        return html;
    }

    // Вставка рейтингов в карточку
    function insertRatings(card) {
        var settings = loadSettings();
        if (!settings.enabled) return;
        
        var ratingsHtml = getAllRatings(card);
        if (!ratingsHtml) return;
        
        var existing = card.find('.ratings-container');
        if (existing.length) existing.remove();
        
        var targetElement;
        switch (settings.position) {
            case 'after-title':
                targetElement = card.find('.card__title');
                break;
            case 'after-year':
                targetElement = card.find('.card__year');
                break;
            case 'after-description':
                targetElement = card.find('.card__descr');
                break;
            default:
                targetElement = card.find('.card__title');
        }
        
        if (targetElement.length) {
            targetElement.after(ratingsHtml);
        }
    }

    // Обработчик для карточек
    function handleCards() {
        $('.card:not(.ratings-processed)').each(function() {
            var card = $(this);
            card.addClass('ratings-processed');
            insertRatings(card);
        });
    }

    // Создание меню настроек
    function createSettingsMenu() {
        var settings = loadSettings();
        
        var html = `
            <div class="ratings-settings" style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #fff; margin-bottom: 20px;">Настройки рейтингов</h2>
                
                <div class="setting-group" style="margin-bottom: 20px; background: #2c2c2c; padding: 15px; border-radius: 8px;">
                    <label style="display: flex; align-items: center; margin-bottom: 15px; color: #fff;">
                        <input type="checkbox" ${settings.enabled ? 'checked' : ''} id="ratings-enabled" style="margin-right: 10px;">
                        Включить плагин рейтингов
                    </label>
                    
                    <label style="display: block; margin-bottom: 10px; color: #fff;">Позиция отображения:</label>
                    <select id="ratings-position" style="width: 100%; padding: 8px; background: #3c3c3c; color: #fff; border: 1px solid #555; border-radius: 4px;">
                        <option value="after-title" ${settings.position === 'after-title' ? 'selected' : ''}>После названия</option>
                        <option value="after-year" ${settings.position === 'after-year' ? 'selected' : ''}>После года</option>
                        <option value="after-description" ${settings.position === 'after-description' ? 'selected' : ''}>После описания</option>
                    </select>
                </div>
                
                <div class="setting-group" style="margin-bottom: 20px; background: #2c2c2c; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #fff; margin-bottom: 15px;">Рейтинги</h3>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showAverage ? 'checked' : ''} id="show-average" style="margin-right: 10px;">
                        Средний рейтинг
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showTMDB ? 'checked' : ''} id="show-tmdb" style="margin-right: 10px;">
                        TMDB
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showIMDB ? 'checked' : ''} id="show-imdb" style="margin-right: 10px;">
                        IMDB
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showKinopoisk ? 'checked' : ''} id="show-kinopoisk" style="margin-right: 10px;">
                        Kinopoisk
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showRottenTomatoes ? 'checked' : ''} id="show-rotten" style="margin-right: 10px;">
                        Rotten Tomatoes
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showMetacritic ? 'checked' : ''} id="show-metacritic" style="margin-right: 10px;">
                        Metacritic
                    </label>
                </div>
                
                <div class="setting-group" style="margin-bottom: 20px; background: #2c2c2c; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #fff; margin-bottom: 15px;">Награды</h3>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showAwards ? 'checked' : ''} id="show-awards" style="margin-right: 10px;">
                        Показывать награды
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showOscars ? 'checked' : ''} id="show-oscars" style="margin-right: 10px;">
                        Оскары
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showGoldenGlobes ? 'checked' : ''} id="show-golden-globes" style="margin-right: 10px;">
                        Золотые глобусы
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showEmmys ? 'checked' : ''} id="show-emmys" style="margin-right: 10px;">
                        Эмми
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showBafta ? 'checked' : ''} id="show-bafta" style="margin-right: 10px;">
                        BAFTA
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showCannes ? 'checked' : ''} id="show-cannes" style="margin-right: 10px;">
                        Каннский кинофестиваль
                    </label>
                </div>
                
                <div class="setting-group" style="margin-bottom: 20px; background: #2c2c2c; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #fff; margin-bottom: 15px;">Внешний вид</h3>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showIcons ? 'checked' : ''} id="show-icons" style="margin-right: 10px;">
                        Показывать иконки
                    </label>
                    
                    <label style="display: flex; align-items: center; margin-bottom: 10px; color: #fff;">
                        <input type="checkbox" ${settings.showText ? 'checked' : ''} id="show-text" style="margin-right: 10px;">
                        Показывать текст
                    </label>
                    
                    <label style="display: block; margin-bottom: 5px; color: #fff;">Размер шрифта:</label>
                    <input type="text" id="font-size" value="${settings.fontSize}" style="width: 100%; padding: 8px; background: #3c3c3c; color: #fff; border: 1px solid #555; border-radius: 4px; margin-bottom: 15px;">
                    
                    <label style="display: block; margin-bottom: 5px; color: #fff;">Максимальная ширина:</label>
                    <input type="text" id="max-width" value="${settings.maxWidth}" style="width: 100%; padding: 8px; background: #3c3c3c; color: #fff; border: 1px solid #555; border-radius: 4px; margin-bottom: 15px;">
                    
                    <label style="display: block; margin-bottom: 5px; color: #fff;">Цвет низкого рейтинга:</label>
                    <input type="color" id="color-low" value="${settings.colorLow}" style="width: 100%; height: 40px; margin-bottom: 15px;">
                    
                    <label style="display: block; margin-bottom: 5px; color: #fff;">Цвет среднего рейтинга:</label>
                    <input type="color" id="color-medium" value="${settings.colorMedium}" style="width: 100%; height: 40px; margin-bottom: 15px;">
                    
                    <label style="display: block; margin-bottom: 5px; color: #fff;">Цвет высокого рейтинга:</label>
                    <input type="color" id="color-high" value="${settings.colorHigh}" style="width: 100%; height: 40px; margin-bottom: 15px;">
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="ratings-save" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Сохранить</button>
                    <button id="ratings-reset" style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;">Сбросить</button>
                </div>
            </div>
        `;
        
        return html;
    }

    // Добавление пункта меню в настройки Lampa
    function addSettingsMenuItem() {
        if (window.Lampa && window.Lampa.Settings) {
            window.Lampa.Settings.add({
                title: 'Рейтинги',
                name: 'ratings',
                component: {
                    template: createSettingsMenu(),
                    mounted: function() {
                        var self = this;
                        
                        $('#ratings-save').on('click', function() {
                            var settings = {
                                enabled: $('#ratings-enabled').is(':checked'),
                                showAverage: $('#show-average').is(':checked'),
                                showTMDB: $('#show-tmdb').is(':checked'),
                                showIMDB: $('#show-imdb').is(':checked'),
                                showKinopoisk: $('#show-kinopoisk').is(':checked'),
                                showRottenTomatoes: $('#show-rotten').is(':checked'),
                                showMetacritic: $('#show-metacritic').is(':checked'),
                                showAwards: $('#show-awards').is(':checked'),
                                showOscars: $('#show-oscars').is(':checked'),
                                showGoldenGlobes: $('#show-golden-globes').is(':checked'),
                                showEmmys: $('#show-emmys').is(':checked'),
                                showBafta: $('#show-bafta').is(':checked'),
                                showCannes: $('#show-cannes').is(':checked'),
                                position: $('#ratings-position').val(),
                                colorLow: $('#color-low').val(),
                                colorMedium: $('#color-medium').val(),
                                colorHigh: $('#color-high').val(),
                                showIcons: $('#show-icons').is(':checked'),
                                showText: $('#show-text').is(':checked'),
                                fontSize: $('#font-size').val(),
                                maxWidth: $('#max-width').val()
                            };
                            
                            saveSettings(settings);
                            Lampa.Noty.show('Настройки сохранены');
                            
                            // Обновляем все карточки
                            $('.card.ratings-processed').removeClass('ratings-processed');
                            setTimeout(handleCards, 100);
                        });
                        
                        $('#ratings-reset').on('click', function() {
                            saveSettings(defaultSettings);
                            Lampa.Noty.show('Настройки сброшены');
                            window.location.reload();
                        });
                    }
                }
            });
        }
    }

    // Инициализация плагина
    function initPlugin() {
        // Ждем загрузки Lampa
        if (window.Lampa) {
            addSettingsMenuItem();
            
            // Обработка карточек при загрузке и обновлении
            $(document).on('content:loaded', function() {
                setTimeout(handleCards, 100);
            });
            
            // Также обрабатываем карточки при изменении DOM
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        setTimeout(handleCards, 100);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Первоначальная обработка
            setTimeout(handleCards, 1000);
        } else {
            setTimeout(initPlugin, 1000);
        }
    }

    // Запуск плагина
    initPlugin();
})();
