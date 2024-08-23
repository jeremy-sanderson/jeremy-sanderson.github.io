(function() {
    'use strict';

    const colors = {
        menuButtonBackgroundColor: "#00548e",
        menuButtonColor: "white",
        menuBackgroundColor: "white",
        menuBackgroundHoverColor: "#f1f1f1",
        menuItemColor: "black"
    }

    function createMenuItem(dropdownMenu, text, callback) {
        var menuItem = document.createElement('div');
        menuItem.className = 'menuItem';
        menuItem.target = '_blank';
        menuItem.textContent = text;
        Object.assign(menuItem.style, {
            padding: '10px 20px',
            textDecoration: 'none',
            color: colors.menuItemColor,
            display: 'block',
            cursor: 'pointer'
        });
        menuItem.addEventListener('mouseover', function() {
            menuItem.style.backgroundColor = colors.menuBackgroundHoverColor;
        });
        menuItem.addEventListener('mouseout', function() {
            menuItem.style.backgroundColor = colors.menuBackgroundColor;
        });
      
        if (callback) {
            menuItem.addEventListener('click', function() {
                callback();
            });
        }
        dropdownMenu.appendChild(menuItem);
    }


    function createMenuButtonAndContainer(buttonLabel) {
        const menuButton = document.createElement('button');
        menuButton.id = 'menuButton';
        menuButton.textContent = buttonLabel;
        document.body.appendChild(menuButton);

        // Style the menu button
        Object.assign(menuButton.style, {
            position: 'fixed',
            top: '90px',
            right: '10px',
            padding: '10px 20px',
            backgroundColor: colors.menuButtonBackgroundColor,
            color: colors.menuButtonColor,
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: '99999'
        });


        // Create the dropdown menu container
        const dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'dropdownMenu';
        document.body.appendChild(dropdownMenu);

        // Style the dropdown menu
        Object.assign(dropdownMenu.style, {
            display: 'none',
            position: 'fixed',
            top: '130px',
            right: '10px',
            backgroundColor: colors.menuBackgroundColor,
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            zIndex: '99999'
        });

        // Close the dropdown if the user clicks outside of it
        window.onclick = function(event) {
            if (!event.target.matches(`#${menuButton.id}`)) {
                if (dropdownMenu.style.display === 'block') {
                    dropdownMenu.style.display = 'none';
                }
            }
        }

        // JavaScript to handle menu button click
        menuButton.addEventListener('click', function() {
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            } else {
                dropdownMenu.style.display = 'block';
            }
        });

        return dropdownMenu;
    }


    const getRowData = (row) => {
        const dateValue = row.querySelector('td.column-date').outerText;
        const description = row.querySelector('td.column-description').outerText;
        const amount = row.querySelector('td.column-amount span.transaction-').outerText;
        return { 'date': dateValue,
                'description': description.replace(",", "").replace("\n", ""),
                'amount': Number(amount.replace("$", "").replace(",", ""))
               };
    };

    const convertTransactionToTSV = (transaction) => `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
    const getAllRowsInPastTransactionTable = () => [...document.querySelectorAll('#PastTransactionsGrid table tbody tr')];

    const gatherDebitTransactionsInViewSortedByDate = () => getAllRowsInPastTransactionTable().map(row => getRowData(row))
    .filter(transaction => transaction.amount < 0)
    .map(transaction => ({...transaction, amount: Math.abs(transaction.amount) }))
    .sort((a,b) => {
        const dateComparison = Date.parse(a.date) - Date.parse(b.date);
        if (dateComparison === 0) {
            return a.description.localeCompare(b.description);
        }
        else {
            return dateComparison;
        }
    });

    const debitTransactions = () => {
        const transactions = gatherDebitTransactionsInViewSortedByDate().map(t => convertTransactionToTSV(t)).join('\n');
        navigator.clipboard.writeText(transactions);
        console.log(transactions);
    };

    const availableBalance = () => {
        const accountDetails = document.querySelector("div.account-details");
        const availableBalance = [...accountDetails.querySelectorAll(".row")].filter((accountDetail) => accountDetail.querySelector(".detail-label-col span").innerText.includes('Available Balance'))
        .map((accountDetail) => accountDetail.querySelector(".detail-item-col span").innerText.replace("$", "").replace(",", ""))[0];
        navigator.clipboard.writeText(availableBalance);
        console.log('Saved to clipboard', availableBalance);
    };

    const createCopyIcon = () => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.cursor = 'pointer';

        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");

        const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect1.setAttribute("x", "9");
        rect1.setAttribute("y", "9");
        rect1.setAttribute("width", "13");
        rect1.setAttribute("height", "13");
        rect1.setAttribute("rx", "2");
        rect1.setAttribute("ry", "2");
        svg.appendChild(rect1);

        const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line1.setAttribute("x1", "5");
        line1.setAttribute("y1", "5");
        line1.setAttribute("x2", "5");
        line1.setAttribute("y2", "18");
        line1.setAttribute("stroke", "currentColor");
        line1.setAttribute("stroke-width", "2");
        svg.appendChild(line1);

        const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", "5");
        line2.setAttribute("y1", "5");
        line2.setAttribute("x2", "18");
        line2.setAttribute("y2", "5");
        line2.setAttribute("stroke", "currentColor");
        line2.setAttribute("stroke-width", "2");
        svg.appendChild(line2);


        return svg;
    }

    const setupIndividualDebitTransactionLinks = () => {
        getAllRowsInPastTransactionTable().forEach(row => {
            const transaction = getRowData(row);
            if (transaction.amount < 0) {
                // todo - put a copy icon in the table itself
                const debitTransaction = {...transaction, amount: Math.abs(transaction.amount)};
                row.style.cursor = 'pointer';
                row.addEventListener('mouseover', () => {
                    row.style.color = 'blue';
                });

                row.addEventListener('mouseout', () => {
                    row.style.color = 'unset';
                });

                row.addEventListener('click', () => {
                    navigator.clipboard.writeText(convertTransactionToTSV(debitTransaction));
                    console.log('Saved to clipboard', debitTransaction);
                });
            }
        });
    };

    const dropdownMenu = createMenuButtonAndContainer('Budgeting');
    // Add menu items to the dropdown menu
    createMenuItem(dropdownMenu, 'Sorted Debits', debitTransactions);
    createMenuItem(dropdownMenu, 'Balance', availableBalance);
  
})();
