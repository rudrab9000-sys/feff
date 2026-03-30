let balance = parseFloat(localStorage.getItem('bal')) || 1000.00;
        let gameHistory = JSON.parse(localStorage.getItem('gameH')) || [];
        let myHistory = JSON.parse(localStorage.getItem('myH')) || [];
        let activeBets = []; 
        let period = 20260330001;
        let isLockdown = false;

        function updateUI() {
            document.getElementById('balance').innerText = balance.toFixed(2);
            localStorage.setItem('bal', balance);
            localStorage.setItem('gameH', JSON.stringify(gameHistory));
            localStorage.setItem('myH', JSON.stringify(myHistory));
            renderTables();
        }

        function renderTables() {
            // Game History with Colored Balls
            document.getElementById('game-records').innerHTML = gameHistory.map(g => {
                let ballClass = g.c === 'Green' ? 'bg-green' : (g.c === 'Red' ? 'bg-red' : (g.n === 0 ? 'bg-violet' : 'bg-violet-green'));
                let sizeClass = g.s === 'Big' ? 'tag-big' : 'tag-small';
                
                return `<tr>
                    <td>${g.p}</td>
                    <td><span class="ball ${ballClass}">${g.n}</span></td>
                    <td><span class="size-tag ${sizeClass}">${g.s}</span></td>
                    <td style="color:${g.c === 'Violet' ? '#9c27b0' : (g.c === 'Red' ? '#f44336' : '#4caf50')}; font-weight:bold;">${g.c}</td>
                </tr>`;
            }).join('');

            // My History
            document.getElementById('my-records').innerHTML = myHistory.map(h => `<tr>
                <td>${h.p}</td>
                <td>${h.sel}</td>
                <td>${h.amt}</td>
                <td style="color:${h.color}; font-weight:bold;" class="${h.res==='Processing'?'processing':''}">${h.res}</td>
            </tr>`).join('');
        }

        function generateResult() {
            const num = Math.floor(Math.random() * 10);
            const size = num <= 4 ? "Small" : "Big";
            let color = "";
            
            if (num === 0 || num === 5) {
                color = "Violet";
            } else {
                color = (num % 2 === 0) ? "Red" : "Green";
            }
            
            gameHistory.unshift({ p: period, n: num, s: size, c: color });
            if(gameHistory.length > 20) gameHistory.pop();

            let totalWin = 0;
            myHistory.forEach(bet => {
                if(bet.p === period && bet.res === "Processing") {
                    let isNum = !isNaN(bet.sel);
                    let mult = 1.96;
                    
                    // Specific Multipliers
                    if(bet.sel === "Violet") mult = 3.0;
                    if(isNum) mult = 10.0;

                    // Winning Logic
                    let win = false;
                    if (bet.sel === color) win = true;
                    if (bet.sel === num.toString()) win = true;
                    if (bet.sel === size) win = true;
                    // Special case for Violet mix numbers
                    if (color === "Violet" && (num === 0 && bet.sel === "Red")) win = true;
                    if (color === "Violet" && (num === 5 && bet.sel === "Green")) win = true;

                    if(win) {
                        let winAmt = bet.final * mult;
                        totalWin += winAmt;
                        bet.res = "WIN"; bet.color = "#4caf50";
                    } else {
                        bet.res = "LOSS"; bet.color = "#f44336";
                    }
                }
            });

            balance += totalWin;
            updateUI();
            
            // Show result popup if user had a bet
            let hadBet = myHistory.find(b => b.p === period);
            if(hadBet) {
                // You can call your showPopup(win, totalWin) here
            }
        }