/* devanagari conversion */
export const devanagariConverter = () => {
    function conversion(text) {
        const vowels = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ṛ', 'ṝ', 'ḷ', 'ḹ', 'e', 'o', 'đ', 'ő'];
        const consonants = ['k', 'kh', 'g', 'gh', 'ṅ', 'c', 'ch', 'j', 'jh', 'ñ', 'ṭ', 'ṭh', 'ḍ', 'ḍh', 'ṇ', 't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h', 'ḻ', 'kṣ', 'jñ'];
        const stoppers = [" ", "°", "<", "\\", "("];

        function checkIfTagOrCommand(char, tagFlagOn, commandFlagOn, englishFlagOn) {
            if (char === '<') {
                tagFlagOn = true;
            } else if (char === '>') {
                tagFlagOn = false;
            } else if (char === '\\') {
                commandFlagOn = true;
            } else if (char === ' ') {
                commandFlagOn = false;
            } else if (char === 'Ł') {
                englishFlagOn = true;
            };
            return { tagFlagOn, commandFlagOn, englishFlagOn };
        }

        function toDevanagariExceptTagsAndCommands(line) {
            const dic = [
                ['A', 'अ'], ['Ā', 'आ'], ['I', 'इ'], ['Ī', 'ई'], ['U', 'उ'],
                ['Ū', 'ऊ'], ['Ṛ', 'ऋ'], ['Ṝ', 'ॠ'], ['E', 'ए'], ['O', 'ओ'],
                ['Đ', 'ऐ'], ['Ő', 'औ'], ["'", 'ऽ'], ['Ó', 'ॐ'],
                ['a', ''], ['ā', 'ा'], ['i', 'ि'], ['ī', 'ी'], ['u', 'ु'],
                ['ū', 'ू'], ['ṛ', 'ृ'], ['ṝ', 'ॄ'], ['ḷ', 'ॢ'], ['ḹ', 'ॣ'],
                ['e', 'े'], ['o', 'ो'], ['đ', 'ै'], ['ő', 'ौ'], ['Ṃ', 'ं'],
                ['Ḥ', 'ः'], ['V', '्'], ['k', 'क'], ['kh', 'ख'], ['g', 'ग'],
                ['gh', 'घ'], ['ṅ', 'ङ'], ['c', 'च'], ['ch', 'छ'], ['j', 'ज'],
                ['jh', 'झ'], ['ñ', 'ञ'], ['ṭ', 'ट'], ['ṭh', 'ठ'], ['ḍ', 'ड'],
                ['ḍh', 'ढ'], ['ṇ', 'ण'], ['t', 'त'], ['th', 'थ'], ['d', 'द'],
                ['dh', 'ध'], ['n', 'न'], ['p', 'प'], ['ph', 'फ'], ['b', 'ब'],
                ['bh', 'भ'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'],
                ['v', 'व'], ['ś', 'श'], ['ṣ', 'ष'], ['s', 'स'], ['h', 'ह'],
                ['ḻ', 'ळ'], ['kṣ', 'क्ष'], ['jñ', 'ज्ञ'], ['rū', 'रू'],
                ['Ś', 'श'], ['ṃ', 'ं'] // Aggiunte le mappature per Ś e ṃ
            ];
            let lineout = "";
            let tagFlagOn = false;
            let commandFlagOn = false;
            let englishFlagOn = false;
            let conj = false;

            let i = 0;
            while (i < line.length) {
                ({ tagFlagOn, commandFlagOn, englishFlagOn } = checkIfTagOrCommand(line[i], tagFlagOn, commandFlagOn, englishFlagOn));
                if (tagFlagOn || commandFlagOn || englishFlagOn) {
                    lineout += line[i];
                    i++;
                    continue;
                }

                // init vowel
                if (!conj && vowels.includes(line[i])) {
                    lineout += line[i].toUpperCase();
                }
                // last consonant, put in virāma
                else if (i < line.length - 2 && consonants.includes(line[i]) && stoppers.includes(line[i + 1])) {
                    lineout += line[i] + "V";
                }
                // syllable initial consonant, nothing special to do
                else if (!conj && consonants.includes(line[i])) {
                    conj = true;
                    lineout += line[i];
                }
                // half consonant: put in a virāma
                else if (conj && consonants.includes(line[i])) {
                    lineout += "V" + line[i];
                }
                // non-initial vowel: nothing special to do
                else if (conj && vowels.includes(line[i])) {
                    conj = false;
                    lineout += line[i];
                }
                // anything else:
                else {
                    lineout += line[i];
                    conj = false;
                }

                i++;
            }

            let returnLine = "";
            for (let character of lineout) {
                let found = false;
                ({ tagFlagOn, commandFlagOn, englishFlagOn } = checkIfTagOrCommand(character, tagFlagOn, commandFlagOn, englishFlagOn));
                if (tagFlagOn || commandFlagOn || englishFlagOn) {
                    returnLine += character;
                    continue;
                }
                for (let d of dic) {
                    if (character === d[0] && !tagFlagOn && !commandFlagOn) {
                        returnLine += d[1];
                        found = true;
                        break;
                    };
                };
                if (!found) {
                    returnLine += character;
                };
            }

            returnLine = returnLine.replace(/¸/g, 'dh');
            returnLine = returnLine.replace(/ł/g, 'th');
            returnLine = returnLine.replace(/˙/g, 'ch');
            returnLine = returnLine.replace(/đ/g, 'ai');
            returnLine = returnLine.replace(/ő/g, 'au');
            returnLine = returnLine.replace(/ß/g, 'bh');
            returnLine = returnLine.replace(/ ,/g, ',');
            returnLine = returnLine.replace(/ ;/g, ';');
            returnLine = returnLine.replace(/रृ/g, '\\char"0930\\char"094D\\char"090B');
            return returnLine;
        }

        return toDevanagariExceptTagsAndCommands(text);
    }

    var btnConverter = document.querySelectorAll(".btn-converter");
    btnConverter.forEach((btn) => {
        btn.addEventListener("click", () => {
            const containerDevanagari = document.querySelector(".text-to-convert[data-script='devanagari']");
            const containerRoman = document.querySelector(".text-to-convert[data-script='roman']");
            const romanTxt = containerRoman.innerHTML;
            const convertedText = conversion(romanTxt);
            containerDevanagari.innerHTML = convertedText;

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