/* sanskrit features */
/*
    JS function: devanagariConverter
    Author: Csaba Kiss
    Author's address: csaba.kiss.email@gmail.com
    Last change on: 08/05/2023
    Copyright (c) 2023 by the author
    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
export const devanagariConverter = () => {
    var btnConverter = document.querySelectorAll(".btn-converter");
    btnConverter.forEach((btn) => {
        btn.addEventListener("click", () => {
            var containerDevanagari = document.querySelector(".text-to-convert[data-script='devanagari']");
            var containerRoman = document.querySelector(".text-to-convert[data-script='roman']");

            // convert the text
            let dic = [
                // space:
                [' ', ' '],
                // initial vowels:
                ['A', 'अ'],
                ['Ā', 'आ'],
                ['I', 'इ'],
                ['Ī', 'ई'],
                ['U', 'उ'],
                ['Ū', 'ऊ'],
                ['Ṛ', 'ऋ'],
                ['Ṝ', 'ॠ'],
                ['E', 'ए'],
                ['O', 'ओ'],
                ['Đ', 'ऐ'],
                ['Ő', 'औ'],
                ["’", 'ऽ'],
                ['Ó', 'ॐ'],
                //  conjunct vowels:
                ['a', ''], ['ā', 'ा'], ['i', 'ि'], ['ī', 'ी'], ['u', 'ु'],
                ['ū', 'ू'], ['ṛ', 'ृ'], ['ṝ', 'ॄ'], ['ḷ', 'ॢ'], ['ḹ', 'ॣ'],
                ['e', 'े'], ['o', 'ो'], ['đ', 'ै'], ['ő', 'ौ'], ['ṃ', 'ं'], ['ḥ', 'ः'],
                // virāma:
                ['V', '्'],
                // consonants: 	 		 	
                ['k', 'क'], ['Ɋ', 'ख'], ['g', 'ग'], ['G', 'घ'], ['ṅ', 'ङ'],
                //
                ['c', 'च'], ['Ȼ', 'छ'], ['j', 'ज'], ['J', 'झ'], ['ñ', 'ञ'],
                //	 	 	 	
                ['ṭ', 'ट'], ['Ṭ', 'ठ'], ['ḍ', 'ड'], ['Ḍ', 'ढ'], ['ṇ', 'ण'],
                // 
                ['t', 'त'], ['T', 'थ'], ['d', 'द'], ['D', 'ध'], ['n', 'न'],
                // 
                ['p', 'प'], ['P', 'फ'], ['b', 'ब'], ['B', 'भ'], ['m', 'म'],
                //
                ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['ś', 'श'], ['ṣ', 'ष'],
                ['s', 'स'], ['h', 'ह']]

            // , ['0', '०'],
            //['1', '१'], ['2', '२'], ['3', '३'], ['4', '४'], ['5', '५'], ['6', '६'],
            //['7', '७'], ['8', '८'], ['9', '९']]

            let dnnumbers = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9']]

            // \n added only in this version of the script

            let vowels = ["ṃ", "ḥ", 'a', 'i', 'u', 'ṛ', 'ḷ', 'ā', 'ī', 'ū', 'ṝ', 'ḹ', 'e', 'ai', 'o', 'au', 'đ', 'ő']

            let consonants = ["k", "Ɋ", "g", "G", "ṅ", "c", "Ȼ", "j", "J", "ñ", "ṭ", "Ṭ", "ḍ", "Ḍ", "ṇ", "t", "T", "d", "D", "n", "p", "P", "b", "B", "m", "y", "r", "l", "v", "ś", "ṣ", "s", "h"] //, "<", ">"]

            //let preprocessing = [['ai', 'đ'], ['au', 'ő'], ['kh', 'Ɋ'], ['gh', 'G'], ['ṭh', 'Ṭ'], ['ḍh', 'Ḍ'], ['th', 'T'], ['dh', 'D'], ['ph', 'P'], ['bh', 'B'], ['ch', 'Ȼ'], ['jh', 'J'], ['\|\|', ' ।।'], ['\|', ' ।'], ['{ }', ''], ['\n', ' \n'], [',', ' ,'],]

            let preprocessing = { 'ai': 'đ', 'au': 'ő', 'kh': 'Ɋ', 'gh': 'G', 'ṭh': 'Ṭ', 'ḍh': 'Ḍ', 'th': 'T', 'dh': 'D', 'ph': 'P', 'bh': 'B', 'ch': 'Ȼ', 'jh': 'J' }

            let cosmetics = [['\|\|', ' ।। '], ['\|', ' ।'], ['{ }', ''], ['\n', ' \n'], [',', ' ,'], ['{', '{ '], ['}', ' }'], ['-', ' - '], ['/', ' / ']];
            // the last but one produces viraamas at the end of line; the last one is for <br/>, somehow the / is lost

            // CHANGE IAST LETTERS TO DEVANAGARI
            // this is the Roman script input point

            /* html contents */
            var editionText = containerRoman.innerHTML;

            roman_elem = editionText.toLowerCase().split('\n');

            // these will trigger the stopping of conversion after \ and <
            let commandflag = false;
            let tagflag = false;

            let results = "";
            let roman_prep = [];

            // preprocess
            let preproc_keys = Object.keys(preprocessing);

            // going through the lines
            for (let a = 0; a < roman_elem.length; a++) {
                roman_elem[a] = roman_elem[a] + ' ';

                // applying minor changes from the array 'cosmetics'
                for (let b = 0; b < cosmetics.length; b++) {
                    roman_elem[a] = roman_elem[a].split(cosmetics[b][0]).join(cosmetics[b][1]);
                }


                let preprocessed_line = roman_elem[a].split('');
                let c = 0;
                let doubleChar = '';

                while (c < preprocessed_line.length) {

                    // flags
                    if (preprocessed_line[c] === '\\' || Number.isInteger(parseInt(preprocessed_line[c]))) { commandflag = true; }
                    if (preprocessed_line[c] === '<') { tagflag = true; commandflag = true; }
                    if (preprocessed_line[c] === '>') { tagflag = false; commandflag = false; }
                    if (preprocessed_line[c] === ' ' && tagflag === false) { commandflag = false; }

                    // if indeed the section should be changed to Devanagari
                    if (commandflag === false) {

                        // preprocess double characters such as th and ai
                        doubleChar = preprocessed_line[c] + preprocessed_line[c + 1];

                        if (preproc_keys.includes(doubleChar)) {
                            preprocessed_line[c] = preprocessing[doubleChar];
                            preprocessed_line[c + 1] = '';
                        }

                    }
                    c = c + 1;
                }

                roman_prep[a] = preprocessed_line.join('') + " ";

            } // end of preprocessing double characters such as th and ai

            // change
            for (let d = 0; d < roman_prep.length; d++) {
                let rsplit = roman_prep[d].split('');
                let conjunct = false;
                // go through this line letter by letter
                for (let l = 0; l < rsplit.length; l++) {
                    if (rsplit[l] === '\\' || Number.isInteger(parseInt(rsplit[l]))) { commandflag = true; }
                    if (rsplit[l] === '<') { tagflag = true; commandflag = true }
                    if (rsplit[l] === ' ' && tagflag === false) { commandflag = false; }


                    if (commandflag === false) {  // big if
                        if (l < rsplit.length && consonants.includes(rsplit[l]) && consonants.includes(rsplit[l + 1])) {
                            rsplit[l] = rsplit[l] + 'V';
                        }

                        // space
                        if (rsplit[l] === " " || rsplit[l] === "-") {
                            conjunct = false;
                        }

                        // sandhi C + V
                        if (l < rsplit.length - 2 && consonants.includes(rsplit[l]) && rsplit[l + 1] === " " && vowels.includes(rsplit[l + 2])) {
                            rsplit[l + 1] = '';
                        }

                        // sandhi C + C
                        if (l < rsplit.length - 2 && consonants.includes(rsplit[l]) && rsplit[l + 1] === " " && consonants.includes(rsplit[l + 2])) {
                            rsplit[l + 1] = 'V';
                        }

                        // if it is an initial consonant
                        if (conjunct === false && consonants.includes(rsplit[l])) {
                            rsplit[l] = rsplit[l];
                            conjunct = true;
                        }

                        // if it is an initial vowel
                        if (conjunct === false && vowels.includes(rsplit[l])) {
                            rsplit[l] = rsplit[l].toUpperCase();
                            conjunct = true;

                        }

                        // if it is a last consonant: put in virāma
                        if (l < rsplit.length && consonants.includes(rsplit[l]) && (rsplit[l + 1] === " " || rsplit[l + 1] === "<")) {
                            rsplit[l] = rsplit[l] + 'V';
                        }

                    } // end of big if
                    else {
                        for (let b = 0; b < preprocessing.length; b++) {
                            // a nice trick to change all occurences in line
                            if (rsplit[l] === preprocessing[b][1]) {
                                rsplit[l] = preprocessing[b][0];
                            }
                        }

                    }
                    // change all into Devanagari
                    for (let rmchar = 0; rmchar < dic.length; rmchar++) {
                        if (rsplit[l] === dic[rmchar][0] && commandflag === false) {
                            rsplit[l] = dic[rmchar][1];
                        }
                        if (rsplit[l].length === 2 && rsplit[l][0] === dic[rmchar][0] && commandflag === false) {
                            rsplit[l] = dic[rmchar][1] + '्';
                        }
                    }
                    if (rsplit[l] === '>') { tagflag = false; commandflag = false; }

                } // end of go through this line letter by letter

                rjoin = rsplit.join('');
                // change numbers to Devanagari anyway
                for (n = 0; n < dnnumbers.length; n++) {
                    rjoin = rjoin.split(dnnumbers[n][0]).join(dnnumbers[n][1]);
                }
                // delete spaces after {s, and before }s
                rjoin = rjoin.split('{ ').join('{');
                rjoin = rjoin.split(' }').join('}');
                rjoin = rjoin.split(' - ').join('-');
                rjoin = rjoin.split(' / ').join('/');
                results = results + rjoin + '\n';
            } // end of for 


            /*
                JS function: this last part of devanagariConverter
                Author: Martina Dello Buono
                Author's address: martinadellobuono1@gmail.com
                Last change on: 09/05/2023
                Copyright (c) 2023 by the author
                Permission to use, copy, modify, and/or distribute this software for any
                purpose with or without fee is hereby granted, provided that the above
                copyright notice and this permission notice appear in all copies.
                THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
                WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
                MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
                SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
                WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
                OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
                CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
            */
            const romanTxt = editionText;
            const devanagariTxt = results;

            /* print the devanagari text */
            containerRoman.innerHTML = romanTxt;
            containerDevanagari.innerHTML = devanagariTxt;

            /* switch from devanagari to sanskrit and vice versa */
            const expr = btn.getAttribute("data-script");
            switch (expr) {
                case "roman":
                    /* print the roman text */
                    containerRoman.classList.remove("d-none");
                    containerDevanagari.classList.add("d-none");

                    /* set the button */
                    btn.setAttribute("data-script", "devanagari");
                    btn.querySelector(".scriptLabel").innerHTML = "Devanāgārī";

                    break;
                case "devanagari":
                    /* print the roman text */
                    containerRoman.classList.add("d-none");
                    containerDevanagari.classList.remove("d-none");

                    /* set the button */
                    btn.setAttribute("data-script", "roman");
                    btn.querySelector(".scriptLabel").innerHTML = "Roman";

                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }

        });
    });
};