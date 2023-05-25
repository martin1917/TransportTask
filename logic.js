/**
 * северо-западный угол
 * @param {number[]} a значения для поставщиков
 * @param {number[]} b значения для потрибителей
 * @param {number[][]} costs значения цен
 */
function solve(a, b, costs) {
    let aSum = a.reduce((prev, cur) => prev += cur, 0);
    let bSum = b.reduce((prev, cur) => prev += cur, 0);

    if (aSum > bSum) {
        b.push(aSum - bSum);
        for (let i = 0; i < a.length; i++) {
            costs[i].push(0);
        }
    } else if (aSum < bSum) {
        a.push(bSum - aSum);
        let newRow = [];
        for (let i = 0; i < b.length; i++) {
            newRow.push(0);
        }
        costs.push(newRow);
    }

    let x = [];
    for (let i = 0; i < a.length; i++) {
        let row = [];
        for (let j = 0; j < b.length; j++) {
            row.push(0);
        }
        x.push(row);
    }

    let aCopy = [...a];
    let bCopy = [...b];
    
    let indexesForBaza = [];
    let [i1, j1] = [0, 0];
    while (true) {
        if (aCopy[i1] < bCopy[j1]) {
            x[i1][j1] = aCopy[i1];
            indexesForBaza.push(new Cell(i1, j1));
            bCopy[j1] -= aCopy[i1]
            aCopy[i1] = 0;
            i1++;
        } else {
            x[i1][j1] = bCopy[j1];
            indexesForBaza.push(new Cell(i1, j1));
            aCopy[i1] -= bCopy[j1];
            bCopy[j1] = 0;
            j1++;
        }

        let aSum = aCopy.reduce((prev, cur) => prev += cur, 0);
        let bSum = bCopy.reduce((prev, cur) => prev += cur, 0);
        if (aSum == 0 && bSum == 0) {
            console.log(`метод северо-западного угла завершен`);
            break;
        }
    }
    
    drawTableNorthwestCorner(a, b, costs, x, indexesForBaza);

    let result = 0;
    for (let cell of indexesForBaza) {
        let [i, j] = [cell.row, cell.col];
        result += x[i][j] * costs[i][j];
    }

    console.log(`Z = ${result} (метод северо-западного угла)`);
    document.getElementById('ans_1').innerHTML = `Z = ${result} (метод северо-западного угла)`;
    
    potentialMethod(a, b, x, costs, indexesForBaza);
}

/**
 * Метод потенциалов
 * @param {number[]} a груз поставщиков
 * @param {number[]} b потребности клиентов
 * @param {number[][]} x план перевозок
 * @param {number[][]} costs стоимости перевозок
 * @param {Cell[]} indexesForBaza позиции базисных переменных
 */
function potentialMethod(a, b, x, costs, indexesForBaza) {
    let m = a.length;
    let n = b.length;

    while (true) {
        indexesForBaza.sort((c1, c2) => (c1.row - c2.row) || (c1.col - c2.col));

        let fillU = Array.from(Array(m)).map(_ => false);
        fillU[0] = true;
        let fillV = Array.from(Array(n)).map(_ => false);  
        
        let u = Array.from(Array(m)).map(_ => 0);
        let v = Array.from(Array(n)).map(_ => 0);

        while (!fillU.reduce((p, v) => p && v, true) || !fillV.reduce((p, v) => p && v, true)) {
            for (let cell of indexesForBaza) {
                let [i, j] = [cell.row, cell.col];
                if (fillU[i]) {
                    v[j] = costs[i][j] - u[i];
                    fillV[j] = true;
                } else if (fillV[j]) {
                    u[i] = costs[i][j] - v[j];
                    fillU[i] = true;
                }
            }
        }
        
        // свободные ячейки, в которых нарушено условие оптимальности
        // список с экономией стоимости 
        let notOptimalCells = [];
        let economies = [];
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                let isFind = false;
                for (let cell of indexesForBaza) {
                    if (i == cell.row && j== cell.col) {
                        isFind = true;
                        break;
                    }
                }
                if (!isFind && u[i] + v[j] > costs[i][j]) {
                    notOptimalCells.push(new Cell(i, j));
                    economies.push(u[i] + v[j] - costs[i][j]);
                }
            }
        }

        if (notOptimalCells.length == 0) {
            console.log(`метод потенциалов завершен`);
            console.log(`ui = [${u}]`);
            console.log(`vi = [${v}]`);
            break;
        }

        // максимальная экономия стоимости
        let maxEconomy = Math.max(...economies);

        // ячейки с максимальной экономией стоимости
        let cellsWithMaxEconomy = notOptimalCells.filter((_, i) => economies[i] == maxEconomy);

        // ячейка с максимальной экономией стоимости и с меньшими транспортными издержками
        // (базисная клетка)
        let minCostForMaxEconomyCell = Math.min(...cellsWithMaxEconomy.map((e, _) => costs[e.row][e.col]));
        let bazaCell = cellsWithMaxEconomy.filter((e, _) => costs[e.row][e.col] == minCostForMaxEconomyCell)[0];

        // добавление новой базисной ячейки
        indexesForBaza.push(bazaCell);

        // построение цикла
        let path = buildPath(bazaCell, indexesForBaza);
        
        let cellsWithMinus = path.filter((_, pos) => pos % 2 != 0);
        let xValuesForMinusCells = cellsWithMinus.map(cell => x[cell.row][cell.col]);
        let min_x_value = Math.min(...xValuesForMinusCells);
        let cellsContainsMinValue = cellsWithMinus.filter((cell) => x[cell.row][cell.col] == min_x_value);        
        let costsForCellWithMinValue = cellsContainsMinValue.map((cell) => costs[cell.row][cell.col]);
        let minCost = Math.min(...costsForCellWithMinValue);
        let cellWithMinValueAndMinCost = cellsContainsMinValue.filter((cell) => costs[cell.row][cell.col] == minCost)[0];

        drawHistorySolutionPorential(a, b, costs, x, indexesForBaza, u, v, path, bazaCell, min_x_value, true);

        // прибавить/вычесть мин. значение
        for (let i = 0; i < path.length; i++) {
            let pathItem = path[i];
            if (i % 2 == 0) {
                x[pathItem.row][pathItem.col] += min_x_value;
            } else {
                x[pathItem.row][pathItem.col] -= min_x_value;
            }
        }

        // удаление ячеек из базиса, для поддеражния баланса = (m + n - 1)
        if (cellsContainsMinValue.length == 1) {
            let cell = cellsContainsMinValue[0];

            let index = -1;
            for (let i = 0; i < indexesForBaza.length; i++) {
                if (indexesForBaza[i].row == cell.row && indexesForBaza[i].col == cell.col) {
                    index = i;
                    break;
                }
            }
            indexesForBaza.splice(index, 1);

        } else {
            for (let cell of cellsContainsMinValue) {
                if (cell.row == cellWithMinValueAndMinCost.row && cell.col == cellWithMinValueAndMinCost.col) {
                    continue;
                }

                let index = -1;
                for (let i = 0; i < indexesForBaza.length; i++) {
                    if (indexesForBaza[i].row == cell.row && indexesForBaza[i].col == cell.col) {
                        index = i;
                        break;
                    }
                }
                indexesForBaza.splice(index, 1);
            }
        }

        drawHistorySolutionPorential(a, b, costs, x, indexesForBaza, u, v, path, bazaCell, min_x_value, false);
    }

    let result = 0;
    for (let cell of indexesForBaza) {
        let [i, j] = [cell.row, cell.col];
        result += x[i][j] * costs[i][j];
    }

    console.log(`Z = ${result} (метод потенциалов)`);
    document.getElementById('ans_2').innerHTML = `Z = ${result} (метод потенциалов)`;
}

/**
 * @param {Cell} startCell 
 * @param {Cell[]} bazises 
 * @returns {Cell[]}
 */
function buildPath(startCell, bazises) {    
    // пройденный путь (цикл)
    let stack = [];
    
    // возможные следующие ходы от стартовой ячейки (сначала ходим горизонтально)
    let startNextCells = bazises
        .filter((cell) => cell.row == startCell.row)
        .filter((cell) => cell.col != startCell.col)
        .sort((x, y) => Math.abs(x.col - startCell.col) - Math.abs(y.col - startCell.col));

    // начальная ячейка, от которой будем строить цикл
    let start = new MyState(startCell, 'v', startNextCells); 
    stack.push(start);

    while (true) {
        // условие НЕ удачного выхода (цикла не существует (в теории это невозможно) )
        if (stack.length == 0) {
            console.log("СТЕК ОПУСТЕЛ");
            break;
        }

        // текущее состояние
        let head = stack.at(-1);

        // условие удачного выхода (цикл построен удачно)
        if (stack.length >= 4 && ((head.cell.row == startCell.row) || (head.cell.col == startCell.col))) {
            break;
        }

        // если нет вариантов для хода, идем назад
        if (head.nextCells.length == 0) {
            stack.pop();
            continue;
        }

        // Пробуем пойти в один из возможных следующих ходов
        let nextCell = head.nextCells.pop();
        
        // для следующего состояния ищем его возможные следующие ходы
        // Нужно изменить направления на противополжное относительно предыдущего хода
        // горизонтальное -> вертикальное; вертикальное -> горизонтальное
        let dir = head.prevDir == 'v' ? 'h' : 'v';

        let maybyNextCells;
        if (dir == 'h') {
            maybyNextCells = bazises
                .filter((cell) => cell.col == nextCell.col)
                .filter((cell) => cell.row != nextCell.row)
                .sort((x, y) => Math.abs(x.row - nextCell.row) - Math.abs(y.row - nextCell.row));
        }
        if (dir == 'v') {
            maybyNextCells = bazises
                .filter((cell) => cell.row == nextCell.row)
                .filter((cell) => cell.col != nextCell.col)
                .sort((x, y) => Math.abs(x.col - nextCell.col) - Math.abs(y.col - nextCell.col));
        }
        
        // если есть следующие ходы, то значит можно сделать шаг (добавляем новое состояние в цикл)
        if (maybyNextCells.length != 0) {
            let newState = new MyState(nextCell, dir, maybyNextCells);
            stack.push(newState);
        }
    }

    let path = stack.map(state => state.cell);
    return path;
}

class MyState {
    /**
     * @param {Cell} cell текущая ячейка
     * @param {string} prevDir предыдущее направление
     * @param {Cell[]} nextCells возможные следующие ходы
     */
    constructor(cell, prevDir, nextCells) {
        this.cell = cell;
        this.prevDir = prevDir;
        this.nextCells = nextCells;
    }
}

class Cell {
    /**
     * @param {number} r строка
     * @param {number} c столбец
     */
    constructor(r, c) {
        this.row = r;
        this.col = c;
    }
}

// a = [100, 250, 200, 300];
// b = [200, 200, 100, 100, 250];
// c = [
//     [10, 7, 4, 1, 4],
//     [2, 7, 10, 6, 11],
//     [8, 5, 3, 2, 2],
//     [11, 8, 12, 16, 13]
// ];

// solve(a, b, c);