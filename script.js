(function() {

    /**
     *  PELIN VALMISTELU
     */

    var turn = 'X';
    var grid = []; // Tähän muuttujassa on pelin ruudukko
    var timer; //tyhjä muuttuja mitä käytetään vastustajan valinnan viiveeseen

    /* Voittokombot */
    var winRows = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 4, 8],
        [2, 4, 6],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]
    ];

    /* Game log viestit */
    var messages = {
        WELCOME: 'Tervetuloa pelaamaan ristinollaa!',
        PLAYER_TURN: 'Sinun vuorosi, valitse ruutu.',
        PLAYER_PICKED: 'Ruutu valittu.',
        OPPONENT_TURN: 'Tietokoneen vuoro...',
        OPPONENT_PICKED: 'Tietokone valitsi ruudun.',
        OPPONENT_PREVENTS_WIN: 'Tietokone yrittää estää pelaajan voiton.',
        OPPONENT_INTENDS_WIN: 'Tietokone tekee voittavan siirron.',
        PLAYER_WIN: 'Voitit pelin!',
        OPPONENT_WIN: 'Tietokone voitti!',
        TIE: 'Tasapeli!',
        RETRY: 'Paina nappulaa pelataksesi uudelleen!'
    };

    /* Ruudukon alustaminen */
    resetGame();

    /* Event listener reset nappulaan */
    document.querySelector('#resetBtn').addEventListener('click', resetGame);

    /**
     *  PELIN FUNKTIOT
     */

    /* Tyhjän ruudukon generointi */
    function resetGrid() {
        for(var i = 0; i < 9; i++) {
            grid[i] = '#';
        }
    }

    /* Pelin resetointi */
    function resetGame() {
        resetGrid();
        renderGrid(false);
        turn = 'X';
        clearMessageBox();
        emitMessage(messages.WELCOME, null);
        emitMessage(messages.PLAYER_TURN, 'X');
    }

    /* Hakee tyhjien solujen indeksit gridistä */
    function getEmptyCellIndexes() {
        var emptyCellIndexes = [];
        for(var j = 0; j < 9; j++) {
            if(grid[j] === '#') {
                emptyCellIndexes.push(j);
            }
        }
        return emptyCellIndexes;
    }

    /* Vastustajan vuoro */
    function opponentTurn() {
        var emptyCellIndexes = getEmptyCellIndexes();
        if(emptyCellIndexes.length !== 0) {
            /* Haetaan pelaajan ja tietokoneen voittavat solut valmiiksi */
            var playerWinCell = detectWinCells('X');
            var opponentWinCell = detectWinCells('O');

            /* Jos kumpikaan ei voi voittaa seuraavalla vuorolla, valitaan random solu */
            if(playerWinCell === null && opponentWinCell === null) {
                var randomIndex = generateRandomNum(0, (emptyCellIndexes.length - 1));
                selectCell(emptyCellIndexes[randomIndex], 'O');
            }
            
            /* Tietokone tekee voittavan siirron */
            else if(opponentWinCell !== null) {
                emitMessage(messages.OPPONENT_INTENDS_WIN, 'O');
                selectCell(opponentWinCell, 'O');
            }
            
            /* Jos voittavaa siirtoa ei ole tietokoneella, tietokone estää pelaajan voittavan siirron */
            else if(playerWinCell !== null) {
                emitMessage(messages.OPPONENT_PREVENTS_WIN, 'O');
                selectCell(playerWinCell, 'O');
            }
        }
    }

    /* Etsi voittavat siirrot */
    function detectWinCells(turnValue) {
        var emptyCells = getEmptyCellIndexes();

        /* Käydään läpi voittokombot */
        for(var row of winRows) {
            /* Tallennetaan tehdyt siirrot ja tyhjien solujen indeksit rivejä läpikäydessä */
            var ticCounter = 0;
            var emptyCellsPerRow = [];
            for(index of row) {
                /* Siirtojen lukumäärä talteen */
                if(grid[index] === turnValue) ticCounter++;
                /* Jos ruudussa ei ole siirtoa, sen indeksi tallennetaan (tarkistetaan, onko solu tyhjä varmasti) */
                else if(emptyCells.includes(index)) emptyCellsPerRow.push(index); //Rivien tyhjät 
            }

            /* 
            Jos rivillä on kaksi siirtoa ja kolmas solu on tyhjä, tulkitaan tallennetulla indeksillä
            oleva solu voittavaksi siirroksi pelissä 
            */
            if(ticCounter === 2 && emptyCellsPerRow.length === 1) {
                return emptyCellsPerRow[0];
            }
        }

        /* Palautetaan null kun voittavaa siirtoa ei löydetty */
        return null;
    }

    /* Tarkistetaan voittotilanne */
    function checkForWin() {
        for(var row of winRows) {
            var playerCounter = 0;
            var opponentCounter = 0;
            for(var index of row) {
                switch(grid[index]) {
                    case 'X': playerCounter++; break;
                    case 'O': opponentCounter++; break;
                    default: break;
                }
            }
            if(playerCounter === 3) {
                return {
                    winner: 'X',
                    winRow: row
                };
            } else if(opponentCounter === 3) {
                return {
                    winner: 'O',
                    winRow: row
                };
            };
        }
        return null;
    }

    /* Värjätään rivi jos voitto */
    function setWinningRowColor(winRow) {
        for(var cellIndex of winRow) {
            var id = '#cell_' + cellIndex;
            document.querySelector(id).classList.add('victorious-cell');
        }        
    }

    /* Pelin päätös */
    function declareEnd(winner) {
        renderGrid(true);
        if(winner === 'X') emitMessage(messages.PLAYER_WIN, 'X');
        else if(winner === 'O') emitMessage(messages.OPPONENT_WIN, 'O');
        else emitMessage(messages.TIE, null);
        turn = null;
        emitMessage(messages.RETRY, null);
    }

    /* Vuoron vaihtava funktio (suorittaa myös vastustajan vuoron) */
    function switchTurn() {
        /* Tarkistetaan onko voitto tapahtunut */
        var winStatus = checkForWin();
        if(winStatus !== null) {
            var winner = winStatus.winner;
            var winRow = winStatus.winRow;
            declareEnd(winner);
            setWinningRowColor(winRow);
            return;
        }
        
        /* Tasapelin sattuessa */
        if(winStatus === null && getEmptyCellIndexes().length === 0) {
            declareEnd(null);
            return;
        }

        if(turn === 'X') {
            turn = 'O';
            emitMessage(messages.OPPONENT_TURN, turn);

            /* Nopeasti tapahtuvan valinnan takia pieni viive */
            if(timer) clearTimeout(timer);
            timer = setTimeout(opponentTurn, 1000);
        }
        else if(turn === 'O') {
            turn = 'X';
            emitMessage(messages.PLAYER_TURN, turn);
        }
    }

    /* Tarkista onko annetun indeksin solu tyhjä */
    function checkIfEmpty(cellNum) {
        if(grid[cellNum] === '#') return true;
        else return false;
    }

    /* Solun event listenerin funktio, laukaisee vastustajan vuoron */
    function cellClick(event) {
        /**
         * Solujen id:t on muotoa cell_1, cell_2 etc.
         * pilkotaan string taulukoksi _ merkin kohdalta ja otetaan solun indeksi
         */
        var cellNum = event.target.id.split('_')[1  ];
        /* Jos solu on tyhjä gridissä, valitaan se */
        if(checkIfEmpty(cellNum) === true && turn === 'X' && turn !== null) {
            selectCell(cellNum, 'X');
        }
    }

    /* Solun valinta funktio, ensimmäinen parametri on indeksi ja toinen vuoro (X tai O) */
    function selectCell(index, turn) {
        if(getEmptyCellIndexes().length === 0) {
            /* Tyhjiä soluja ei jäljellä, peli on ohi */
            console.log('no empty cells left');
        } else {
            /* Tallennetaan ruudukkoon valittu solu */
            grid[index] = turn;
            if(turn === 'X') emitMessage(messages.PLAYER_PICKED, turn);
            else if(turn === 'O') emitMessage(messages.OPPONENT_PICKED, turn);
            /* Renderöidään ruudukko uudestaan käyttöliittymään */
            renderGrid(turn === 'X');
            /* Vaihdetaan vuoroa */
            switchTurn();
        }
    }

    /* Generoidaan random numero annetulta väliltä */
    function generateRandomNum(min, max) {
        return Math.floor(Math.random() * (max-min) + min);
    }

    /* Ruudukon renderöinti näkymään */
    function renderGrid(disable) {
        /* Haetaan ruudukon elementti */
        var gameboard = document.querySelector('#gameboard');
        gameboard.innerHTML = ""; //Elementin tyhjennys

        /* Lisätään solut ruudukon elementtiin */
        for(var i = 0; i < 9; i++) {
            var div = document.createElement('div'); //Yksi solu on div elementti
            div.classList.add('game-cell'); //Ruudun tyyliluokka
            div.setAttribute('id', 'cell_' + i); //Asetetaan jokaiselle solulle id
            if(disable) div.classList.add('wait');
            /* Sisälle laitetaan teksti riippuen taulukon solun arvosta */
            switch(grid[i]) {
                case 'X':
                    div.innerText = 'X';
                    break;
                case 'O':
                    div.innerText = 'O';
                    break;
                default:
                    break;
            }
            /* Solu heitetään ruudukon elementtiin */
            gameboard.appendChild(div);
        }

        /**
         * Kun elementtejä tehdään dynaamisesti, pitää event listenerit laittaa aina uudestaan
         * Sen takia ensin renderöidään ruudukko ja laitetaan se ruudukon elementtiin,
         * sitten vasta asetetaan jokaiseen soluun event listener.
         */
        document.querySelectorAll('.game-cell').forEach(function(cell) {
            cell.addEventListener('click', cellClick);
        });
    }

    /**
     *  GAME LOG FUNKTIOT
     */

    function emitMessage(msg, type) {
        var messageBox = document.querySelector('#messageBox');
        var messageEl = document.createElement('p');
        if(type === 'X') messageEl.classList.add('player-info');
        else if(type === 'O') messageEl.classList.add('opponent-info');
        messageEl.innerText = msg;
        messageBox.appendChild(messageEl);
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    function clearMessageBox() {
        var messageBox = document.querySelector('#messageBox');
        messageBox.innerHTML = "";
    }
})();