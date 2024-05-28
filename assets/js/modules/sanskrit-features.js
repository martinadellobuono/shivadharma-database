/* devanagari conversion */
export const devanagariConverter = () => {
    function conversion(text) {
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
                ['ḻ', 'ळ'], ['kṣ', 'क्ष'], ['jñ', 'ज्ञ'], ['rū', 'रू']
            ];
            let lineout = "";
            let tagFlagOn = false;
            let commandFlagOn = false;
            let englishFlagOn = false;

            for (let i = 0; i < line.length; i++) {
                let letter = line[i];
                lineout += line[i];
            };

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
            };

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
        };

        return toDevanagariExceptTagsAndCommands(text);
    };

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
            };
        });
    });
};