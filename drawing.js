//=====================================================================================================================
                                        // ДОБАВЛЕНИЕ ОБРАБОТЧИКОВ ДЛЯ КНОПОК
//=====================================================================================================================

function addEventHandler() {
    const getValuesFor_A_B = () => {
        const m = document.getElementById('count_a').value - '';
        const n = document.getElementById('count_b').value - '';    
        
        let a = [];
        for (let i = 1; i <= m; i++) {
            a.push(document.getElementById(`a${i}`).value - '');
        }
    
        let b = [];
        for (let i = 1; i <= n; i++) {
            b.push(document.getElementById(`b${i}`).value - '');
        }
    
        return {
            a: a,
            b: b
        };
    };

    document.getElementById('btn_save_params').addEventListener('click', (e) => {
        const m = document.getElementById('count_a').value - '';
        const n = document.getElementById('count_b').value - '';
        drawSystem(m, n);
    });
    
    document.getElementById('btn_draw_c_system').addEventListener('click', (e) => {
        let res = getValuesFor_A_B();
        draw_C_System(res.a, res.b);
        document.getElementById('btn_solve_northwest_corner').style.display = 'inline-block';
        document.getElementById('btn_clear_table').style.display = 'inline-block';
    });
    
    document.getElementById('btn_solve_northwest_corner').addEventListener('click', (e) => {
        let res = getValuesFor_A_B();
    
        let c = [];
        for (let i = 0; i < res.a.length; i++) {
            let row = [];
            for (let j = 0; j < res.b.length; j++) {
                row.push(document.getElementById(`c${i}${j}`).value - '');
            }
            c.push(row);
        }
    
        solve(res.a, res.b, c);

        document.getElementById('title_1').style.display = 'block';
        document.getElementById('title_2').style.display = 'block';
    });

    document.getElementById('btn_clear_table').addEventListener('click', (e) => {
        document.getElementById('solved_matrix').replaceChildren();
        document.getElementById('history_solution').replaceChildren();

        document.getElementById('title_1').style.display = 'none';
        document.getElementById('title_2').style.display = 'none';

        document.getElementById('ans_1').innerHTML = '';
        document.getElementById('ans_2').innerHTML = '';
    });
}

addEventHandler()

//=====================================================================================================================
                                        // ОТРИСОВКА ВСЯКОГО
//=====================================================================================================================

/**
 * Отрисовка HTML таблицы для заполнения цен
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потрибителей
 */
function draw_C_System(a, b) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    let tBody = document.createElement('tbody');

    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    tBody.appendChild(trHead);
    
    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.style.width = '30px'
            input.id = `c${i}${j}`;
            td.appendChild(input);
            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }
    
    table.appendChild(tBody);
    document.getElementById('c_values').replaceChildren();
    document.getElementById('c_values').appendChild(table);
}

/**
 * Отрисовка HTML таблицы решения для "северо-западного угла"
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потрибителей
 * @param {number[]} c цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 */
function drawTableNorthwestCorner(a, b, c, x, indexesForBaza) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    table.style.marginBottom = '50px';
    let tBody = document.createElement('tbody');

    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    tBody.appendChild(trHead);
    
    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            td.appendChild(document.createTextNode(`${x[i][j]} [${c[i][j]}]`));

            for (let cell of indexesForBaza) {
                if (i == cell.row && j == cell.col) {
                    td.style.background = "green";
                }
            }

            tr.appendChild(td);
        }
        tBody.appendChild(tr);
    }
    
    table.appendChild(tBody);
    document.getElementById('solved_matrix').replaceChildren();
    document.getElementById('solved_matrix').appendChild(table);
}

/**
 * Отрисока промежуточной таблицы для метода потенциала
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потрибителей
 * @param {number[][]} costs цены
 * @param {number[][]} x матрица с перевозками
 * @param {Cell[]} indexesForBaza индексы для базисных переменных
 * @param {number[]} u потенциалы для поставщиков
 * @param {number[]} v потенциалы для потрибителей
 * @param {Cell[]} path цикл
 * @param {Cell} bazaCell новая базисная ячейка
 * @param {number} delta минимальное значение для вычитания/сложения
 * @param {boolean} flag костыль :)
 */
function drawHistorySolutionPorential(a, b, costs, x, indexesForBaza, u, v, path, bazaCell, delta, flag) {
    let m = a.length;
    let n = b.length;
    
    let table = document.createElement('table');
    let tBody = document.createElement('tbody');

    let trHead = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`a\\b`));
    td1.style.background = 'gray';
    trHead.appendChild(td1);
    for (let i = 0; i < n; i++) {
        let td = document.createElement('td');
        td.style.background = 'silver';
        td.appendChild(document.createTextNode(`${b[i]}`));
        trHead.appendChild(td);
    }
    let td2 = document.createElement('td');
    td2.style.background = 'lightblue';
    td2.appendChild(document.createTextNode(`ui`));
    trHead.appendChild(td2);
    tBody.appendChild(trHead);
    
    for (let i = 0; i < m; i++) {
        let tr = document.createElement('tr');
        let tdZero = document.createElement('td');
        tdZero.style.background = 'silver';
        tdZero.appendChild(document.createTextNode(`${a[i]}`));
        tr.appendChild(tdZero);
        for (let j = 0; j < n; j++)  {
            let td = document.createElement('td');
            td.appendChild(document.createTextNode(`${x[i][j]} [${costs[i][j]}]`));

            for (let cell of indexesForBaza) {
                if (i == cell.row && j == cell.col) {
                    td.style.background = "green";
                }
            }

            if (flag && i == bazaCell.row && j == bazaCell.col) {
                td.style.background = "pink";
            }

            tr.appendChild(td);
        }

        let tdTmp = document.createElement('td');
        tdTmp.style.background = 'rgb(0, 217, 255)';
        if (flag) {
            tdTmp.appendChild(document.createTextNode(`${u[i]}`));
        } else {
            tdTmp.appendChild(document.createTextNode(``));
        }
        tr.appendChild(tdTmp);
        tBody.appendChild(tr);
    }

    let trFoot = document.createElement('tr');
    let td3 = document.createElement('td');
    td3.appendChild(document.createTextNode(`vi`));
    td3.style.background = 'lightblue';
    trFoot.appendChild(td3);

    for (let i = 0; i < n; i++) {
        let td4 = document.createElement('td');
        td4.style.background = 'rgb(0, 217, 255)';
        if (flag) {
            td4.appendChild(document.createTextNode(`${v[i]}`));
        } else {
            td4.appendChild(document.createTextNode(``));
        }
        trFoot.appendChild(td4);
    }

    tBody.appendChild(trFoot);    
    table.appendChild(tBody);
    
    let newBazis = `новая базисная переменная: x(${bazaCell.row},${bazaCell.col})`;
    let pathString = `цикл: ${path.map(x => `(${x.row},${x.col})`).reduce((out, x) => out + ' -> ' + x)} -> (${path[0].row}, ${path[0].col})`;
    let minValueString = `мин. значение: ${delta}`;

    let p = document.createElement('p');
    p.innerHTML = `${newBazis} <br> ${pathString} <br> ${minValueString}`;

    let div = document.createElement('div');
    div.style.marginBottom = '50px';
    if (!flag) {
        div.appendChild(p);
    }
    div.appendChild(table);
    if (!flag) {
        let hr = document.createElement('hr');
        hr.style = "margin:50px 0;height:10px;border:none;color:#333;background-color:#333;";
        div.appendChild(hr);
    }

    if (flag) {
        for (let i = 0; i < path.length; i++) {
            let pathItem = path[i];
            let htmlCell = table.rows[1 + pathItem.row].cells[1 + pathItem.col];
            if (i % 2 == 0) {
                htmlCell.innerHTML += ' + ';
            } else {
                htmlCell.innerHTML += ' - ';
            }
        }
    }

    document.getElementById('history_solution').appendChild(div);
}

/**
 * Отрисвка HTML для заполнения системы (a, b)
 * @param {number} m кол-во поставщиков
 * @param {number} n кол-во потребителей
 */
function drawSystem(m, n) {
    let htmlA = '';
    for (let i = 1; i <= m; i++) {
        htmlA += `a${i} = <input type="text" id="a${i}" style="width: 30px;"> `;
    }

    let htmlB = '';
    for (let i = 1; i <= n; i++) {
        htmlB += `b${i} = <input type="text" id="b${i}" style="width: 30px;"> `;
    }

    document.getElementById('a_values').innerHTML = htmlA;
    document.getElementById('b_values').innerHTML = htmlB;
    document.getElementById('btn_draw_c_system').style.display = 'inline-block';
}