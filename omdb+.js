(function () {
    'use strict';
    
    // Додаємо всі SVG іконки з RT+
    var star_svg = '<svg viewBox="5 5 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="white" stroke-width="2" d="M32 18.7461L36.2922 27.4159L46.2682 28.6834L38.9675 35.3631L40.7895 44.8469L32 40.2489L23.2105 44.8469L25.0325 35.3631L17.7318 28.6834L27.7078 27.4159L32 18.7461ZM32 23.2539L29.0241 29.2648L22.2682 30.1231L27.2075 34.6424L25.9567 41.1531L32 37.9918L38.0433 41.1531L36.7925 34.6424L41.7318 30.1231L34.9759 29.2648L32 23.2539Z"/><path fill="none" stroke="white" stroke-width="2" d="M32 9C19.2975 9 9 19.2975 9 32C9 44.7025 19.2975 55 32 55C44.7025 55 55 44.7025 55 32C55 19.2975 44.7025 9 32 9ZM7 32C7 18.1929 18.1929 7 32 7C45.8071 7 57 18.1929 57 32C57 45.8071 45.8071 57 32 57C18.1929 57 7 45.8071 7 32Z"/></svg>';
    var avg_svg = '<svg width="800px" height="800px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><g transform="translate(0 -1028.4)"><path d="m9.533-0.63623 2.79 6.2779 5.581 0.6976-4.186 3.4877 1.395 6.278-5.58-3.488-5.5804 3.488 1.3951-6.278-4.1853-3.4877 5.5804-0.6976z" transform="matrix(1.4336 0 0 1.4336 -1.6665 1029.3)" fill="#f39c12"/><g fill="#f1c40f"><g><path d="m12 0v13l4-4z" transform="translate(0 1028.4)"/><path d="m12 13 12-3-6 5z" transform="translate(0 1028.4)"/><path d="m12 13 8 11-8-5z" transform="translate(0 1028.4)"/><path d="m12 13-8 11 2-9z" transform="translate(0 1028.4)"/></g><path d="m12 13-12-3 8-1z" transform="translate(0 1028.4)"/></g></g></svg>';
    var oscars_svg = '<svg width="18px" height="60px" viewBox="0 0 18 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>icon_award_1</title><desc>Created with Sketch.</desc><defs></defs><g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icons_web" transform="translate(-803.000000, -370.000000)"><g id="Group-70" transform="translate(803.000000, 376.000000)"><path d="M1.0605,10.9082 C0.5425,12.0462 0.5435,13.6232 1.0555,15.0802 C1.0745,16.2022 1.1915,17.3052 1.6625,18.1582 C1.8995,19.1772 2.6285,20.1292 3.4585,21.0222 C3.4865,21.2622 3.5285,21.5702 3.5905,21.8922 C2.8275,24.3242 3.5075,28.7202 4.4055,30.8782 C4.3865,31.2082 4.3985,31.5812 4.4795,31.9552 C4.4705,32.0062 4.4605,32.0592 4.4495,32.1202 C4.3835,32.4682 4.2945,32.9442 4.3285,33.6582 C4.3785,34.7902 4.7415,36.6992 5.4065,39.3312 C5.2935,39.7672 5.2895,40.1282 5.3175,40.4572 L4.6625,40.4572 C3.4415,40.4572 2.4495,41.4502 2.4495,42.6722 L2.4495,42.9952 C2.4495,43.0452 1.5895,43.9502 1.5895,43.9502 L1.7175,43.9502 C1.4395,44.3222 1.2775,44.7832 1.2775,45.2792 L1.2775,48.1552 L0.9995,48.3432 C0.3735,48.7652 -0.0005,49.4692 -0.0005,50.2252 L-0.0005,51.7302 C-0.0005,52.9822 1.0165,54.0002 2.2665,54.0002 L15.7325,54.0002 C16.9825,54.0002 17.9995,52.9822 17.9995,51.7302 L17.9995,50.2252 C17.9995,49.4752 17.6295,48.7742 17.0095,48.3502 L16.7225,48.1532 L16.7225,45.2792 C16.7225,44.7842 16.5605,44.3232 16.2815,43.9502 L16.3385,43.9502 L15.5405,43.2052 C15.5475,43.1362 15.5505,43.0662 15.5505,42.9952 L15.5505,42.6722 C15.5505,41.4502 14.5585,40.4572 13.3375,40.4572 L12.6225,40.4572 C12.6505,40.1282 12.6455,39.7682 12.5335,39.3322 C13.1965,36.7172 13.5605,34.8092 13.6135,33.6542 C13.6455,32.9412 13.5565,32.4662 13.4905,32.1192 C13.4795,32.0582 13.4695,32.0042 13.4605,31.9532 C13.5395,31.5812 13.5525,31.2102 13.5345,30.8822 C14.4335,28.7252 15.1145,24.3242 14.3505,21.8912 C14.4115,21.5672 14.4535,21.2602 14.4805,21.0232 C15.3125,20.1252 16.0435,19.1702 16.2785,18.1482 C16.7435,17.2932 16.8625,16.1852 16.8835,15.1172 C17.3945,13.7492 17.3975,12.0502 16.8735,10.8982 L15.8145,9.5162 C15.2665,9.0332 14.6395,8.6752 14.0925,8.3622 L13.9405,8.2752 L13.5655,8.0592 L13.3585,7.9262 C13.0955,7.7562 12.9735,7.6442 12.9165,7.5812 C12.8915,7.5542 12.8635,7.5222 12.8355,7.4902 C12.9215,7.2372 12.9735,6.9882 13.0075,6.7612 C13.3405,6.1872 13.4745,5.4532 13.3505,4.6712 C13.3155,4.4512 13.2615,4.2512 13.1915,4.0682 C13.2145,2.6792 12.7135,1.7952 12.2555,1.2802 C11.7375,0.6962 10.7565,0.0002 9.0285,0.0002 L8.9255,0.0012 L8.8235,0.0002 C7.4705,0.0002 6.4115,0.4202 5.6745,1.2502 C5.0635,1.9382 4.7515,2.8262 4.7455,3.8952 C4.6295,4.1372 4.5435,4.4142 4.4955,4.7282 C4.3735,5.5232 4.5325,6.2672 4.9055,6.8372 C4.9515,7.0562 5.0125,7.2812 5.0945,7.5012 C4.9645,7.6462 4.8395,7.7602 4.5645,7.9382 L4.3875,8.0542 L3.9845,8.2832 L3.8515,8.3602 C3.2925,8.6792 2.6515,9.0442 2.0955,9.5422 L1.0605,10.9082 Z" id="Fill-6" fill="#FFFFFF"></path><path d="M2,51.7305 L2,50.2255 C2,50.1305 2.047,50.0485 2.119,50.0005 L15.88,50.0005 C15.951,50.0485 16,50.1305 16,50.2255 L16,51.7305 C16,51.8785 15.881,52.0005 15.732,52.0005 L2.267,52.0005 C2.119,52.0005 2,51.8785 2,51.7305 L2,51.7305 Z M3.277,49.4935 L3.277,45.2795 C3.277,45.1725 3.354,45.0845 3.455,45.0665 L14.545,45.0665 C14.645,45.0845 14.723,45.1725 14.723,45.2795 L14.723,49.4935 L3.277,49.4935 Z M4.369,44.5595 L4.65,43.2095 C4.538,43.2055 4.449,43.1105 4.449,42.9955 L4.449,42.6715 C4.449,42.5525 4.544,42.4575 4.662,42.4575 L13.338,42.4575 C13.455,42.4575 13.551,42.5525 13.551,42.6715 L13.551,42.9955 C13.551,43.1105 13.461,43.2055 13.348,43.2095 L13.629,44.5595 L4.369,44.5595 Z M7.363,41.0685 C7.391,40.3065 7.139,40.1835 7.496,39.4275 C7.117,37.9655 6.393,35.0465 6.326,33.5625 C6.287,32.7425 6.475,32.4735 6.512,31.7585 C6.354,31.4655 6.387,30.9115 6.459,30.5475 C5.818,29.8765 4.592,23.3525 5.688,22.0735 C5.557,21.6455 5.457,21.0035 5.413,20.4695 C5.799,20.3885 6.174,20.1875 6.496,19.9765 L6.801,19.7555 L6.857,19.7385 L6.955,19.6435 L7.021,19.5945 C7.184,19.4685 7.327,19.3495 7.454,19.2475 L8.75,19.2395 L8.75,41.9505 L6.672,41.9505 C6.97,41.6725 7.352,41.3835 7.363,41.0685 L7.363,41.0685 Z M9.25,41.9505 L9.25,19.2365 L10.392,19.2285 L10.436,19.2805 C11.045,19.9555 11.871,20.3325 12.52,20.5435 C12.473,21.0625 12.377,21.6655 12.253,22.0735 C13.35,23.3525 12.123,29.8765 11.482,30.5475 C11.553,30.9115 11.586,31.4655 11.428,31.7585 C11.466,32.4735 11.652,32.7425 11.615,33.5625 C11.547,35.0465 10.824,37.9655 10.443,39.4275 C10.801,40.1835 10.549,40.3065 10.577,41.0685 C10.589,41.3835 10.971,41.6725 11.268,41.9505 L9.25,41.9505 Z M10.701,18.8155 C10.653,18.7565 10.582,18.7215 10.508,18.7215 L7.727,18.7215 L8.244,17.8525 C8.417,17.5325 8.561,17.2545 8.699,17.0415 C8.846,16.8135 8.942,16.7295 8.994,16.7115 C9.318,16.6025 10.384,16.7035 10.854,16.8635 L10.989,16.8845 L11.074,16.9115 C11.115,16.9225 11.164,16.9355 11.217,16.9475 C11.322,16.9725 11.445,17.0015 11.58,17.0355 C11.853,17.1055 12.141,17.1945 12.356,17.3105 C12.479,17.3765 12.631,17.3305 12.695,17.2075 C12.761,17.0845 12.715,16.9295 12.592,16.8645 C12.318,16.7165 11.979,16.6155 11.702,16.5445 L11.638,16.5295 L11.798,16.2115 C11.848,16.0725 11.887,15.9215 11.914,15.7715 C11.972,15.4715 11.998,15.1355 11.994,14.8245 L11.981,14.5655 C12.046,14.5945 12.115,14.5945 12.179,14.5675 C12.91,14.2505 13.282,13.6305 13.547,13.1265 C13.612,13.0035 13.565,12.8495 13.443,12.7845 C13.322,12.7185 13.17,12.7665 13.104,12.8895 C12.848,13.3795 12.543,13.8575 11.98,14.1015 L11.92,14.1645 L11.893,14.0255 C11.564,12.9825 9.664,13.4955 8.307,14.0075 C7.93,14.1505 7.543,14.3135 7.171,14.4855 L6.689,14.7175 C6.43,14.5895 6.051,14.3365 5.689,14.0405 C5.322,13.7395 5.014,13.4265 4.882,13.2095 C4.811,13.0895 4.656,13.0515 4.538,13.1245 C4.42,13.1965 4.383,13.3525 4.453,13.4715 C4.633,13.7705 5.002,14.1285 5.373,14.4335 C5.562,14.5875 5.76,14.7365 5.948,14.8625 L6.166,14.9895 L6.117,15.0135 C5.471,15.3705 4.965,15.7155 4.768,15.9645 C4.68,16.0755 4.698,16.2345 4.806,16.3215 C4.914,16.4095 5.072,16.3905 5.158,16.2825 C5.449,15.9145 6.942,15.0635 8.482,14.4815 C9.24,14.1965 9.973,13.9885 10.535,13.9375 C11.125,13.8835 11.363,14.0145 11.415,14.1785 C11.508,14.4745 11.527,15.1245 11.422,15.6745 C11.37,15.9505 11.292,16.1655 11.203,16.2895 C11.125,16.3995 11.074,16.4035 11.012,16.3825 C10.5,16.2095 9.314,16.0695 8.834,16.2325 C8.396,16.3815 8.043,17.1675 7.805,17.6095 C7.549,18.0845 7.266,18.5815 6.916,18.9805 L6.659,19.2315 L6.223,19.5515 C5.883,19.7755 5.542,19.9415 5.233,19.9875 C4.779,19.5165 3.529,18.2365 3.584,17.4185 C3.092,16.9545 3.053,15.4975 3.053,14.7025 C2.532,13.4755 2.605,12.2555 2.918,11.6615 C3.287,10.9585 4.145,10.4975 4.979,10.0195 L7.463,10.4165 C7.6,10.4375 7.729,10.3425 7.75,10.2055 C7.771,10.0675 7.678,9.9375 7.541,9.9165 L5.654,9.6155 C5.98,9.4035 6.278,9.1775 6.512,8.9175 C6.844,8.5435 7.457,7.8825 7.178,7.1675 C6.918,6.8935 6.824,6.2785 6.781,5.9015 C6.256,5.7365 6.445,4.4305 6.805,4.6125 C6.787,4.5405 6.791,4.4875 6.777,4.4505 C6.533,2.4035 7.703,1.9745 8.926,2.0015 C10.15,1.9745 11.406,2.4035 11.163,4.4505 C11.139,4.4945 11.148,4.5505 11.136,4.6125 C11.418,4.5115 11.555,5.7745 11.09,5.9255 C11.049,6.3035 11.022,6.8935 10.764,7.1675 C10.484,7.8825 11.096,8.5435 11.428,8.9175 C11.658,9.1735 11.95,9.3965 12.271,9.6045 L10.33,9.9135 C10.193,9.9355 10.1,10.0645 10.121,10.2035 C10.143,10.3405 10.271,10.4355 10.408,10.4145 L12.945,10.0095 C13.784,10.4915 14.649,10.9535 15.021,11.6615 C15.336,12.2555 15.414,13.6375 14.888,14.7025 C14.888,15.4975 14.848,16.9545 14.355,17.4185 C14.411,18.2755 13.035,19.6425 12.646,20.0505 C11.998,19.8365 11.223,19.4625 10.701,18.8155 L10.701,18.8155 Z" id="Fill-9" fill="#E7BE41"></path></g><g id="Slices" transform="translate(-281.000000, 84.000000)"></g></g></g></svg>';
    var emmy_svg = '<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   id="svg2"   version="1.1"   width="321"   height="563.40002"   viewBox="0 0 321 563.40002">  <metadata     id="metadata8">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title></dc:title>      </cc:Work>    </rdf:RDF>  </metadata>  <defs     id="defs6" />  <path     style="fill:#ffea55;fill-opacity:1"     d="m 74.000736,558.45002 c 1.419168,-2.3925 5.869572,-9.89926 9.889782,-16.68169 L 91.2,529.43665 l 0,-18.11832 0,-18.11831 -1.5,0 c -1.314288,0 -1.5,-0.26 -1.5,-2.1 0,-1.82704 0.19056,-2.1 1.466076,-2.1 1.000278,0 1.810464,-0.58445 2.55,-1.83952 3.29883,-5.59841 17.748674,-11.01359 38.883924,-14.57201 15.07121,-2.53745 37.2238,-4.57025 49.93857,-4.58254 5.8672,-0.005 6.15295,-0.0656 6.464,-1.35593 0.179,-0.7425 1.38764,-6.21 2.68589,-12.15 l 2.36044,-10.8 -46.25496,-91.20001 C 127.98142,314.71219 106.27409,279.9457 92.962182,240.13737 88.114902,225.64192 85.404036,218.40266 84.357492,217.15891 82.493382,214.94354 81,210.15143 81,206.38504 c 0,-5.79136 3.886722,-13.68528 8.810394,-17.89391 l 2.666022,-2.27885 -8.333772,-26.65613 -8.333772,-26.65614 -10.754436,-0.37312 C 53.657564,132.13147 49.166702,131.30278 41.468017,128.17453 22.562277,120.49244 8.0414946,103.83674 2.5403311,83.523501 1.1083157,78.235737 0.9617808,76.678893 0.9474399,66.600014 0.93373098,56.965242 1.1077609,54.853206 2.2658231,50.600046 2.9996204,47.905064 3.6,45.051569 3.6,44.258946 3.6,41.308294 5.4985663,36.582977 7.807899,33.785964 9.1184184,32.198691 11.635303,29.010013 13.400976,26.700013 20.094714,17.94271 28.752256,10.929783 38.626436,6.2664654 48.028435,1.8261454 60.505212,-0.52607559 70.79076,0.20258241 76.76664,0.62593341 86.32782,3.2953864 92.701692,6.3200484 102.87171,11.14614 113.28506,20.061692 118.8,28.664521 c 1.78694,2.787483 3.5116,4.67981 5.1,5.595822 3.51801,2.028802 7.6379,6.4128 9.24688,9.839671 1.75952,3.747478 2.23256,9.138201 1.21206,13.812412 -0.43079,1.973174 -0.71217,4.93847 -0.62528,6.58955 0.12527,2.380278 -0.21942,3.719412 -1.66441,6.466381 -1.00231,1.905438 -2.12118,5.14455 -2.48637,7.198044 -1.56897,8.822442 -6.36005,20.95421 -10.33833,26.178259 -7.18039,9.44201 -17.57346,18.27858 -26.09455,22.20792 -1.7325,0.7989 -3.15,1.70018 -3.15,2.00283 0,1.30926 6.725634,21.75143 7.266342,22.08561 0.328836,0.20323 3.025728,4.52965 5.993098,9.61425 2.96737,5.08461 5.21821,8.50047 5.00185,7.5908 -1.03039,-4.3324 2.61944,-9.94923 8.35301,-12.85465 3.57477,-1.81147 9.37776,-2.48312 12.51324,-1.44832 1.87057,0.61734 2.45623,0.51503 5.3368,-0.93229 3.76508,-1.89173 10.6449,-2.57282 14.75838,-1.46106 2.8436,0.76855 5.8258,3.0433 7.41437,5.6555 1.14042,1.87525 9.0202,7.20659 9.62248,6.5104 0.19776,-0.2286 3.81209,-9.32563 8.03185,-20.21563 4.21976,-10.89001 7.78403,-19.99869 7.92061,-20.24153 0.13657,-0.24284 2.42268,0.65172 5.08023,1.98791 2.65755,1.33619 4.89397,2.34488 4.96982,2.24153 0.0759,-0.10336 7.19655,-12.75012 15.82378,-28.103909 8.62723,-15.353798 16.10334,-28.448798 16.61356,-29.100003 0.87677,-1.119006 0.91035,-1.068726 0.61169,0.915997 -0.17381,1.155 -2.21522,17.085 -4.53647,35.399995 -2.32125,18.315 -4.34836,33.8998 -4.50469,34.63289 -0.27243,1.27758 -0.50632,1.1982 -5.6375,-1.91321 l -5.35327,-3.24608 -0.32876,1.6132 c -0.18082,0.88726 -1.68957,11.04664 -3.35278,22.57639 -1.6632,11.52975 -3.16447,21.10365 -3.33615,21.27532 -0.17167,0.17168 -3.40574,-1.22777 -7.18681,-3.10989 -3.78107,-1.88211 -6.87643,-3.22101 -6.87856,-2.97532 -0.013,1.48955 -6.65991,47.21048 -6.89817,47.44875 -0.3262,0.32619 -2.27277,-0.69903 -14.39795,-7.58319 l -8.4,-4.76916 -7.35462,21.97515 c -4.04504,12.08633 -7.5017,22.43494 -7.68146,22.9969 -0.23954,0.7488 0.35068,1.36741 2.20939,2.31565 5.18677,2.64609 11.9275,10.8995 15.86876,19.42983 3.80532,8.23611 5.71185,17.96715 4.53225,23.13277 l -0.61656,2.7 14.51728,28.65811 c 10.78048,21.28139 14.73986,28.57269 15.38193,28.3263 0.84644,-0.3248 57.65033,20.07553 57.6355,20.699 -0.004,0.17412 -8.91414,10.03482 -19.8,21.91264 L 209.4,423.89211 l 0,21.96294 0,21.96295 8.85,0.40375 c 40.55234,1.85009 72.41453,8.97829 80.33073,17.97156 1.76176,2.00147 2.92223,2.80671 4.04491,2.80671 1.39927,0 1.57436,0.23355 1.57436,2.1 0,1.93333 -0.14286,2.1 -1.8,2.1 l -1.8,0 0,17.63244 0,17.63245 9.06443,15.21756 c 4.98543,8.36965 9.59746,16.09505 10.24893,17.16755 l 1.18451,1.95 -124.83872,0 -124.83872,0 1.838,-3.1 z"     id="path4" /></svg>';
    var awards_svg = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512.001 512.001" style="enable-background:new 0 0 512.001 512.001;" xml:space="preserve"><path style="fill:#F9AC30;" d="M227.117,383.98h-46.308c-16.987,0-30.758,13.771-30.758,30.758v34.25h211.906v-34.25 c0-16.987-13.771-30.758-30.758-30.758h-46.308H227.117z"></path><path style="fill:#DD8D19;" d="M491.157,70.23c-15.917-24.944-43.818-38.67-78.545-38.67h-0.902H100.3h-0.902 c-34.738,0-62.628,13.725-78.545,38.67c-17.196,26.947-17.636,62.691-1.206,98.089c30.197,65.029,125.456,86.713,129.503,87.604 l9.269,2.045h0.01H353.57h0.01l9.279-2.045c4.037-0.891,99.306-22.575,129.493-87.604C508.783,132.921,508.343,97.177,491.157,70.23 z M463.822,155.066c-12.1,26.056-40.379,43.671-61.978,53.852c-8.912,4.205-17.395,7.497-24.577,9.992l-242.523,0.01h-0.01 c-7.193-2.506-15.675-5.798-24.577-10.003c-21.589-10.181-49.878-27.796-61.978-53.852c-11.817-25.448-12.11-50.203-0.807-67.913 c9.93-15.571,28.415-24.137,52.028-24.137h0.933h311.348h0.933c23.613,0,42.088,8.566,52.028,24.137 C475.933,104.863,475.639,129.618,463.822,155.066z"></path><path style="fill:#F9AC30;" d="M278.024,383.98l-0.047-30.532c-0.034-21.96,11.352-42.511,30.284-53.637 c60.287-35.43,103.444-130.412,103.444-242.04V0H100.297v57.769c0,111.63,43.159,206.615,103.448,242.042 c18.931,11.125,30.317,31.675,30.284,53.633l-0.045,30.535l25.164,26.053L278.024,383.98z"></path><g><path style="fill:#DD8D19;" d="M245.486,353.447l-0.021,30.533h-11.481l0.042-30.533c0.031-21.956-11.356-42.507-30.281-53.632 c-60.29-35.43-103.447-130.415-103.447-242.041V0h81.198v57.774c0,111.626,20.656,206.611,49.501,242.041 C240.055,310.939,245.507,331.49,245.486,353.447z"></path><path style="fill:#DD8D19;" d="M247.916,383.98h-20.797H180.81c-16.987,0-30.758,13.771-30.758,30.758v34.25h67.105v-34.25 C217.157,397.751,230.928,383.98,247.916,383.98z"></path></g><path style="fill:#4F5B5E;" d="M219.114,432.212h-80.945c-9.652,0-17.476,7.824-17.476,17.476v62.314h270.624v-62.314 c0-9.652-7.824-17.476-17.476-17.476h-80.945"></path><path style="fill:#3B4547;" d="M159.138,432.212h-20.97c-9.652,0-17.476,7.824-17.476,17.476v62.314h20.97v-62.314 C141.664,440.036,149.487,432.212,159.138,432.212z"></path></svg>';

    // Додаємо переклади
    Lampa.Lang.add({
        maxsm_ratings: {
            ru: 'Рейтинги',
            en: 'Ratings',
            uk: 'Рейтинги',
            be: 'Рэйтынг',
            pt: 'Classificação',
            zh: '评分与画质',
            he: 'דירוג ואיכות',
            cs: 'Hodnocení',
            bg: 'Рейтинг'
        },
        maxsm_ratings_cc: {
            ru: 'Очистить локальный кеш',
            en: 'Clear local cache',
            uk: 'Очистити локальний кеш',
            be: 'Ачысціць лакальны кэш',
            pt: 'Limpar cache local',
            zh: '清除本地缓存',
            he: 'נקה מטמון מקומי',
            cs: 'Vymazat místní mezipaměť',
            bg: 'Изчистване на локалния кеш'
        },
        maxsm_ratings_critic: {
            ru: 'Оценки критиков',
            en: 'Critic Ratings',
            uk: 'Оцінки критиків',
            be: 'Ацэнкі крытыкаў',
            pt: 'Avaliações da crítica',
            zh: '影评人评分',
            he: 'דירוגי מבקרים',
            cs: 'Hodnocení kritiků',
            bg: 'Оценки на критиците'
        },
        maxsm_ratings_view: {
            ru: 'Вид рейтинга',
            en: 'Rating type',
            uk: 'Тип рейтингу',
            be: 'Выгляд рэйтынгу',
            pt: 'Tipo de classificação',
            zh: '评分类也',
            he: 'סוג הדירוג',
            cs: 'Typ hodnocení',
            bg: 'Вид на класирането'
        },
        maxsm_ratings_view_table: {
            ru: 'Табличный вид рейтинга',
            en: 'Table view of the rating',
            uk: 'Табличний вигляд рейтингу',
            be: 'Таблічны выгляд рэйтынгу',
            pt: 'Tabela de tipo de classificação',
            zh: '评级之表格视图',
            he: 'טבלאי תצוגה של הדירוג',
            cs: 'Typ hodnocení tabulky',
            bg: 'Типът на оценката на таблицата'
        },
        maxsm_ratings_view_classic: {
            ru: 'Классический вид рейтинга',
            en: 'Classic type of rating',
            uk: 'Класичний тип рейтингу',
            be: 'Класічны тып рэйтынгу',
            pt: 'Tipo clássico de classificação',
            zh: '经典评级类',
            he: 'סוג דירוג קלאסי',
            cs: 'Klasický typ hodnocení',
            bg: 'Класически тип рейтинг'
        },
        maxsm_ratings_mode: {
            ru: 'Средний рейтинг',
            en: 'Average rating',
            uk: 'Середній рейтинг',
            be: 'Сярэдні рэйтынг',
            pt: 'Classificação média',
            zh: '平均评分',
            he: 'Дирог ממוצע',
            cs: 'Průměrné hodnocení',
            bg: 'Среден рейтинг'
        },
        maxsm_ratings_mode_normal: {
            ru: 'Показывать средний рейтинг',
            en: 'Show average rating',
            uk: 'Показувати середній рейтинг',
            be: 'Паказваць сярэдні рэйтынг',
            pt: 'Mostrar classificação média',
            zh: '显示平均评分',
            he: 'הצג דירוג ממוצע',
            cs: 'Zobrazit průměrné hodnocení',
            bg: 'Показване на среден рейтинг'
        },
        maxsm_ratings_mode_simple: {
            ru: 'Только средний рейтинг',
            en: 'Only average rating',
            uk: 'Лише середній рейтинг',
            be: 'Толькі сярэдні рэйтынг',
            pt: 'Apenas classificação média',
            zh: '仅显示平均评分',
            he: 'רק דירוג ממוצע',
            cs: 'Pouze průměrné hodnocení',
            bg: 'Само среден рейтинг'
        },
        maxsm_ratings_mode_noavg: {
            ru: 'Без среднего рейтинга',
            en: 'No average',
            uk: 'Без середнього рейтингу',
            be: 'Без сярэдняга рэйтынгу',
            pt: 'Sem média',
            zh: '无平均值',
            he: 'ללא ממוצע',
            cs: 'Bez průměru',
            bg: 'Без среден рейтинг'
        },
        maxsm_ratings_icons: {
            ru: 'Значки',
            en: 'Icons',
            uk: 'Значки',
            be: 'Значкі',
            pt: 'Ícones',
            zh: '图标',
            he: 'סמלים',
            cs: 'Ikony',
            bg: 'Икони'
        },
        maxsm_ratings_colors: {
            ru: 'Цвета',
            en: 'Colors',
            uk: 'Кольори',
            be: 'Колеры',
            pt: 'Cores',
            zh: '颜色',
            he: 'צבעים',
            cs: 'Barvy',
            bg: 'Цветове'
        },
        maxsm_ratings_avg: {
            ru: 'ИТОГ',
            en: 'TOTAL',
            uk: 'ПІДСУМОК',
            be: 'ВЫНІК',
            pt: 'TOTAL',
            zh: '总评',
            he: 'סה"כ',
            cs: 'VÝSLEDEK',
            bg: 'РЕЗУЛТАТ'
        },
        maxsm_ratings_avg_simple: {
            ru: 'Оценка',
            en: 'Rating',
            uk: 'Оцінка',
            be: 'Ацэнка',
            pt: 'Avaliação',
            zh: '评分',
            he: 'דירוג',
            cs: 'Hodnocení',
            bg: 'Оценка'
        },
        maxsm_ratings_loading: {
            ru: 'Загрузка',
            en: 'Loading',
            uk: 'Завантаження',
            be: 'Загрузка',
            pt: 'Carregando',
            zh: '加载中',
            he: 'טוען',
            cs: 'Načítání',
            bg: 'Зареждане'
        },
        maxsm_ratings_oscars: {
            ru: 'Оскар',
            en: 'Oscar',
            uk: 'Оскар',
            be: 'Оскар',
            pt: 'Oscar',
            zh: '奥斯卡奖',
            he: 'אוסקר',
            cs: 'Oscar',
            bg: 'Оскар'
        },
        maxsm_ratings_emmy: {
            ru: 'Эмми',
            en: 'Emmy',
            uk: 'Еммі',
            be: 'Эммі',
            pt: 'Emmy',
            zh: '艾美奖',
            he: 'אמי',
            cs: 'Emmy',
            bg: 'Еми'
        },
        maxsm_ratings_awards: {
            ru: 'Награды',
            en: 'Awards',
            uk: 'Нагороди',
            be: 'Узнагароды',
            pt: 'Prêmios',
            zh: '奖项',
            he: 'פרסים',
            cs: 'Ocenění',
            bg: 'Награди'
        }
    });

    // Конфігурація
    var C_LOGGING = true;
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;
    var OMDB_CACHE = 'maxsm_omdb_cache';
    var ID_MAPPING_CACHE = 'maxsm_omdb_id_mapping_cache';
    var OMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEYS) || ['1c149048'];
    
    var AGE_RATINGS = {
        'G': '3+', 'PG': '6+', 'PG-13': '13+', 'R': '17+', 'NC-17': '18+',
        'TV-Y': '0+', 'TV-Y7': '7+', 'TV-G': '3+', 'TV-PG': '6+', 'TV-14': '14+', 'TV-MA': '17+'
    };

    var WEIGHTS = {
        imdb: 0.40,
        tmdb: 0.40,
        mc: 0.10,
        rt: 0.10
    };

    // Функції для роботи з кешем
    function getOmdbCache(key) {
        var cache = Lampa.Storage.get(OMDB_CACHE) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
    }

    function saveOmdbCache(key, data) {
        var cache = Lampa.Storage.get(OMDB_CACHE) || {};
        cache[key] = {
            rt: data.rt,
            mc: data.mc,
            imdb: data.imdb,
            ageRating: data.ageRating,
            oscars: data.oscars,
            emmy: data.emmy,
            awards: data.awards,
            timestamp: Date.now()
        };
        Lampa.Storage.set(OMDB_CACHE, cache);
    }

    // Функція для отримання випадкового токену
    function getRandomToken(arr) {
        if (!arr || !arr.length) return '';
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Функція для парсингу нагород (з RT+)
    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string') return null;
        
        var result = {
            oscars: 0,
            emmy: 0,
            awards: 0
        };
        
        var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
        if (oscarMatch && oscarMatch[1]) {
            result.oscars = parseInt(oscarMatch[1], 10);
        }
        
        var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (emmyMatch && emmyMatch[1]) {
            result.emmy = parseInt(emmyMatch[1], 10);
        }
        
        var otherMatch = awardsText.match(/Another (\d+) wins?/i);
        if (otherMatch && otherMatch[1]) {
            result.awards = parseInt(otherMatch[1], 10);
        }
        
        if (result.awards === 0) {
            var simpleMatch = awardsText.match(/(\d+) wins?/i);
            if (simpleMatch && simpleMatch[1]) {
                result.awards = parseInt(simpleMatch[1], 10);
            }
        }
        
        return result;
    }

    // Додавання анімації завантаження
    function addLoadingAnimation(render) {
        if (!render) return;
        
        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
        
        rateLine.append(
            '<div class="loading-dots-container">' +
                '<div class="loading-dots">' +
                    '<span class="loading-dots__text">' + Lampa.Lang.translate("maxsm_ratings_loading") + '</span>' +
                    '<span class="loading-dots__dot"></span>' +
                    '<span class="loading-dots__dot"></span>' +
                    '<span class="loading-dots__dot"></span>' +
                '</div>' +
            '</div>'
        );
    }

    // Видалення анімації завантаження
    function removeLoadingAnimation(render) {
        if (!render) return;
        $('.loading-dots-container', render).remove();
    }

    // Допоміжні функції
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function getRatingClass(rating) {
        if (rating >= 8.5) return 'rate--green';
        if (rating >= 7.0) return 'rate--lime';
        if (rating >= 5.0) return 'rate--orange';
        return 'rate--red';
    }

    // Отримання IMDb ID з TMDB
    function getImdbIdFromTmdb(tmdbId, type, callback) {
        if (!tmdbId) return callback(null);
        
        var cleanType = type === 'movie' ? 'movie' : 'tv';
        var cacheKey = cleanType + '_' + tmdbId;
        var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};
        
        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) {
            return callback(cache[cacheKey].imdb_id);
        }

        var url = 'https://api.themoviedb.org/3/' + cleanType + '/' + tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();
        
        new Lampa.Reguest().silent(url, function(data) {
            if (data && data.imdb_id) {
                cache[cacheKey] = {
                    imdb_id: data.imdb_id,
                    timestamp: Date.now()
                };
                Lampa.Storage.set(ID_MAPPING_CACHE, cache);
                callback(data.imdb_id);
            } else {
                callback(null);
            }
        }, function() {
            callback(null);
        });
    }

    // Отримання рейтингів з OMDb
    function fetchOmdbRatings(card, cacheKey, callback) {
        if (!card.imdb_id) {
            callback(null);
            return;
        }

        var url = 'https://www.omdbapi.com/?apikey=' + getRandomToken(OMDB_API_KEYS) + '&i=' + card.imdb_id;
        
        new Lampa.Reguest().silent(url, function(data) {
            if (data && data.Response === 'True' && (data.Ratings || data.imdbRating)) {
                var parsedAwards = parseAwards(data.Awards || '');
                callback({
                    rt: extractRating(data.Ratings, 'Rotten Tomatoes'),
                    mc: extractRating(data.Ratings, 'Metacritic'),
                    imdb: data.imdbRating || null,
                    ageRating: data.Rated || null,
                    oscars: parsedAwards.oscars,
                    emmy: parsedAwards.emmy,
                    awards: parsedAwards.awards
                });
            } else {
                callback(null);
            }
        }, function() {
            callback(null);
        });
    }

    function extractRating(ratings, source) {
        if (!ratings || !Array.isArray(ratings)) return null;
        
        for (var i = 0; i < ratings.length; i++) {
            if (ratings[i].Source === source) {
                try {
                    return source === 'Rotten Tomatoes' 
                        ? parseFloat(ratings[i].Value.replace('%', ''))
                        : parseFloat(ratings[i].Value.split('/')[0]);
                } catch(e) {
                    return null;
                }
            }
        }
        return null;
    }

    // Оновлення прихованих елементів
    function updateHiddenElements(ratings, render) {
        if (!render) return;

        // Оновлення вікового рейтингу
        var pgElement = $('.full-start__pg.hide', render);
        if (pgElement.length && ratings.ageRating) {
            var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
            var isValid = invalidRatings.indexOf(ratings.ageRating) === -1;
            
            if (isValid) {
                var localizedRating = AGE_RATINGS[ratings.ageRating] || ratings.ageRating;
                pgElement.removeClass('hide').text(localizedRating);
            }
        }

        // Оновлення IMDb рейтингу
        var imdbElement = $('.rate--imdb', render);
        if (imdbElement.length && ratings.imdb && !isNaN(ratings.imdb)) {
            var imdbRating = parseFloat(ratings.imdb).toFixed(1);
            imdbElement.removeClass('hide').find('> div').eq(0).text(imdbRating);
        }
    }

    // Вставка рейтингів
    function insertRatings(rtRating, mcRating, oscars, awards, emmy, render) {
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var lastRate = $('.full-start__rate:last', rateLine);
        var showRT = localStorage.getItem('maxsm_ratings_critic') === 'true';
        var showMC = localStorage.getItem('maxsm_ratings_critic') === 'true';
        var showAwards = localStorage.getItem('maxsm_ratings_awards') === 'true';
        var showOscar = localStorage.getItem('maxsm_ratings_awards') === 'true';
        var showEmmy = localStorage.getItem('maxsm_ratings_awards') === 'true';

        if (showRT && rtRating && !isNaN(rtRating) && !$('.rate--rt', rateLine).length) {
            var rtElement = $('<div class="full-start__rate rate--rt">' +
                '<div>' + rtRating + '</div>' +
                '<div class="source--name">Tomatoes</div>' +
                '</div>');
            
            if (lastRate.length) rtElement.insertAfter(lastRate);
            else rateLine.prepend(rtElement);
        }

        if (showMC && mcRating && !isNaN(mcRating) && !$('.rate--mc', rateLine).length) {
            var insertAfter = $('.rate--rt', rateLine).length ? $('.rate--rt', rateLine) : lastRate;
            var mcElement = $('<div class="full-start__rate rate--mc">' +
                '<div>' + mcRating + '</div>' +
                '<div class="source--name">Metacritic</div>' +
                '</div>');
            
            if (insertAfter.length) mcElement.insertAfter(insertAfter);
            else rateLine.prepend(mcElement);
        }

        if (showAwards && awards && !isNaN(awards) && awards > 0 && !$('.rate--awards', rateLine).length) {
            var awardsElement = $('<div class="full-start__rate rate--awards rate--gold">' +
                '<div>' + awards + '</div>' +
                '<div class="source--name">' + Lampa.Lang.translate("maxsm_ratings_awards") + '</div>' +
                '</div>');
            
            rateLine.prepend(awardsElement);
        }

        if (showOscar && oscars && !isNaN(oscars) && oscars > 0 && !$('.rate--oscars', rateLine).length) {
            var oscarsElement = $('<div class="full-start__rate rate--oscars rate--gold">' +
                '<div>' + oscars + '</div>' +
                '<div class="source--name">' + Lampa.Lang.translate("maxsm_ratings_oscars") + '</div>' +
                '</div>');
            
            rateLine.prepend(oscarsElement);
        }

        if (showEmmy && emmy && !isNaN(emmy) && emmy > 0 && !$('.rate--emmy', rateLine).length) {
            var emmyElement = $('<div class="full-start__rate rate--emmy rate--gold">' +
                '<div>' + emmy + '</div>' +
                '<div class="source--name">' + Lampa.Lang.translate("maxsm_ratings_emmy") + '</div>' +
                '</div>');
            
            rateLine.prepend(emmyElement);
        }
    }

    // Розрахунок середнього рейтингу
    function calculateAverageRating(render) {
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var ratings = {
            imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
            tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
            mc: (parseFloat($('.rate--mc div:first', rateLine).text()) || 0) / 10,
            rt: (parseFloat($('.rate--rt div:first', rateLine).text()) || 0) / 10
        };

        var totalWeight = 0;
        var weightedSum = 0;
        var ratingsCount = 0;
        
        for (var key in ratings) {
            if (ratings.hasOwnProperty(key) && !isNaN(ratings[key]) && ratings[key] > 0) {
                weightedSum += ratings[key] * WEIGHTS[key];
                totalWeight += WEIGHTS[key];
                ratingsCount++;
            }
        }

        $('.rate--avg', rateLine).remove();
        
        var mode = parseInt(localStorage.getItem('maxsm_ratings_mode'), 10);
        var isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) mode = 1;

        if (totalWeight > 0 && (ratingsCount > 1 || mode === 1)) {
            var averageRating = (weightedSum / totalWeight).toFixed(1);
            var colorClass = getRatingClass(averageRating);
            
            var avgLabel = Lampa.Lang.translate("maxsm_ratings_avg");
            if (mode === 1) {
                avgLabel = Lampa.Lang.translate("maxsm_ratings_avg_simple");
                $('.full-start__rate', rateLine).not('.rate--oscars, .rate--avg, .rate--awards').hide();
            }
            
            var avgElement = $('<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + averageRating + '</div>' +
                '<div class="source--name">' + avgLabel + '</div>' +
                '</div>');
            
            $('.full-start__rate:first', rateLine).before(avgElement);
        }
    }

    // Вставка іконок
    function insertIcons(render) {
        if (!render) return;

        function replaceIcon(className, svg) {
            var element = $('.' + className, render);
            if (element.length) {
                var sourceNameElement = element.find('.source--name');
                if (sourceNameElement.length) {
                    sourceNameElement.html(svg).addClass('rate--icon');
                } else {
                    var childDivs = element.children('div');
                    if (childDivs.length >= 2) {
                        $(childDivs[1]).html(svg).addClass('rate--icon');
                    }
                }
            }
        }

        replaceIcon('rate--imdb', star_svg);
        replaceIcon('rate--tmdb', avg_svg);
        replaceIcon('rate--oscars', oscars_svg);
        replaceIcon('rate--emmy', emmy_svg);
        replaceIcon('rate--awards', awards_svg);
    }

    // Основна функція
    function fetchAdditionalRatings(card, render) {
        if (!render) return;

        var normalizedCard = {
            id: card.id,
            imdb_id: card.imdb_id || card.imdb || null,
            title: card.title || card.name || '',
            original_title: card.original_title || card.original_name || '',
            type: getCardType(card),
            release_date: card.release_date || card.first_air_date || ''
        };

        var rateLine = $('.full-start-new__rate-line', render);
        if (rateLine.length) {
            rateLine.css('visibility', 'hidden');
            addLoadingAnimation(render);
        }

        var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
        var cachedData = getOmdbCache(cacheKey);
        var ratingsData = {};

        if (cachedData) {
            ratingsData.rt = cachedData.rt;
            ratingsData.mc = cachedData.mc;
            ratingsData.imdb = cachedData.imdb;
            ratingsData.ageRating = cachedData.ageRating;
            ratingsData.oscars = cachedData.oscars;
            ratingsData.emmy = cachedData.emmy;
            ratingsData.awards = cachedData.awards;
            updateUI();
        } else if (normalizedCard.imdb_id) {
            fetchOmdbRatings(normalizedCard, cacheKey, function(omdbData) {
                if (omdbData) {
                    ratingsData.rt = omdbData.rt;
                    ratingsData.mc = omdbData.mc;
                    ratingsData.imdb = omdbData.imdb;
                    ratingsData.ageRating = omdbData.ageRating;
                    ratingsData.oscars = omdbData.oscars;
                    ratingsData.emmy = omdbData.emmy;
                    ratingsData.awards = omdbData.awards;
                    saveOmdbCache(cacheKey, omdbData);
                }
                updateUI();
            });
        } else {
            getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function(newImdbId) {
                if (newImdbId) {
                    normalizedCard.imdb_id = newImdbId;
                    cacheKey = normalizedCard.type + '_' + newImdbId;
                    fetchOmdbRatings(normalizedCard, cacheKey, function(omdbData) {
                        if (omdbData) {
                            ratingsData.rt = omdbData.rt;
                            ratingsData.mc = omdbData.mc;
                            ratingsData.imdb = omdbData.imdb;
                            ratingsData.ageRating = omdbData.ageRating;
                            ratingsData.oscars = omdbData.oscars;
                            ratingsData.emmy = omdbData.emmy;
                            ratingsData.awards = omdbData.awards;
                            saveOmdbCache(cacheKey, omdbData);
                        }
                        updateUI();
                    });
                } else {
                    updateUI();
                }
            });
        }

        function updateUI() {
            insertRatings(ratingsData.rt, ratingsData.mc, ratingsData.oscars, ratingsData.awards, ratingsData.emmy, render);
            updateHiddenElements(ratingsData, render);
            
            var mode = parseInt(localStorage.getItem('maxsm_ratings_mode'), 10);
            var isPortrait = window.innerHeight > window.innerWidth;
            if (isPortrait) mode = 1;
            
            if (mode !== 2) calculateAverageRating(render);
            
            var showIcons = localStorage.getItem('maxsm_ratings_icons') === 'true';
            if (showIcons) insertIcons(render);
            
            removeLoadingAnimation(render);
            rateLine.css('visibility', 'visible');
        }
    }

    // Ініціалізація плагіна
    function startPlugin() {
        if (!localStorage.getItem('maxsm_ratings_awards')) {
            localStorage.setItem('maxsm_ratings_awards', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_critic')) {
            localStorage.setItem('maxsm_ratings_critic', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_colors')) {
            localStorage.setItem('maxsm_ratings_colors', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_icons')) {
            localStorage.setItem('maxsm_ratings_icons', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_view')) {
            localStorage.setItem('maxsm_ratings_view', '0');
        }
        if (!localStorage.getItem('maxsm_ratings_mode')) {
            localStorage.setItem('maxsm_ratings_mode', '0');
        }

        // Додаємо CSS стилі
        var style = "<style id=\"maxsm_omdb_rating\">" +
            ".full-start-new__rate-line { visibility: hidden; display: flex; flex-wrap: wrap; align-items: center; width: fit-content; max-width: 100%; vertical-align: middle; }" +
            ".full-start-new__rate-line > * { margin-right: 0.05em; flex-shrink: 0; vertical-align: middle; }" +
            ".full-start-new__rate-line svg { width: 1.8em; height: 1.8em; flex-shrink: 0; }" +
            ".rate--green { color: #4caf50; } .rate--lime { color: #cddc39; } .rate--orange { color: #ff9800; } .rate--red { color: #f44336; } .rate--gold { color: gold; }" +
            ".rate--icon { height: 1.8em; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; position: relative; }" +
            ".rate--icon svg { vertical-align: middle; position: relative; }" +
            ".full-start__rate > div:last-child { padding: 0.2em 0.4em; }" +
            ".loading-dots-container { position: absolute; top: 50%; left: 0; right: 0; text-align: left; transform: translateY(-50%); z-index: 10; }" +
            ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #ffffff; font-size: 1em; background: rgba(0, 0, 0, 0.3); padding: 0.6em 1em; border-radius: 0.5em; }" +
            ".loading-dots__text { margin-right: 1em; }" +
            ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; opacity: 0.3; animation: loading-dots-fade 1.5s infinite both; }" +
            ".loading-dots__dot:nth-child(1) { animation-delay: 0s; } .loading-dots__dot:nth-child(2) { animation-delay: 0.5s; } .loading-dots__dot:nth-child(3) { animation-delay: 1s; }" +
            "@keyframes loading-dots-fade { 0%, 90%, 100% { opacity: 0.3; } 35% { opacity: 1; } }" +
            "@media screen and (max-width: 480px) { .loading-dots-container { justify-content: center; text-align: center; max-width: 100%; } }" +
            "</style>";

        $('body').append(style);

        // Додаємо налаштування
        Lampa.SettingsApi.addComponent({
            component: "maxsm_ratings",
            name: Lampa.Lang.translate("maxsm_ratings"),
            icon: star_svg
        });

        var viewValue = {};
        viewValue[0] = Lampa.Lang.translate("maxsm_ratings_view_table");
        viewValue[1] = Lampa.Lang.translate("maxsm_ratings_view_classic");

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_view",
                type: 'select',
                values: viewValue,
                default: 0
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_view"),
                description: ''
            }
        });

        var modeValue = {};
        modeValue[0] = Lampa.Lang.translate("maxsm_ratings_mode_normal");
        modeValue[1] = Lampa.Lang.translate("maxsm_ratings_mode_simple");
        modeValue[2] = Lampa.Lang.translate("maxsm_ratings_mode_noavg");

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_mode",
                type: 'select',
                values: modeValue,
                default: 0
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_mode"),
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_awards",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_awards"),
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_critic",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_critic"),
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_colors",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_colors"),
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_icons",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_icons"),
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_cc',
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_ratings_cc')
            },
            onChange: function () {
                localStorage.removeItem(OMDB_CACHE);
                localStorage.removeItem(ID_MAPPING_CACHE);
                window.location.reload();
            }
        });

        // Слухач подій
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                fetchAdditionalRatings(e.data.movie, render);
            }
        });
    }

    if (!window.maxsmOmdbPlugin) {
        window.maxsmOmdbPlugin = true;
        startPlugin();
    }
})();
