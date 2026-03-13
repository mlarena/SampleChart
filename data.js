/**
 * data.js - Модуль с данными для графика
 * Содержит метрики и генерацию тестовых данных
 */

// Конфигурация метрик (все параметры из задания)
const METRICS = {
    voltagePower: { 
        name: "Напряжение питания", 
        unit: "В", 
        color: "#d62728", 
        axis: "left" 
    },
    caseTemperature: { 
        name: "Температура внутри корпуса", 
        unit: "°C", 
        color: "#1f77b4", 
        axis: "left" 
    },
    roadTemperature: { 
        name: "Температура дорожного покрытия", 
        unit: "°C", 
        color: "#2ca02c", 
        axis: "left" 
    },
    waterHeight: { 
        name: "Высота слоя воды", 
        unit: "мм", 
        color: "#9467bd", 
        axis: "right" 
    },
    iceHeight: { 
        name: "Высота слоя льда", 
        unit: "мм", 
        color: "#ff7f0e", 
        axis: "right2" 
    },
    snowHeight: { 
        name: "Высота слоя снега", 
        unit: "мм", 
        color: "#ffbb78", 
        axis: "right2" 
    },
    icePercentage: { 
        name: "Процент обледенения", 
        unit: "%", 
        color: "#e377c2", 
        axis: "right" 
    },
    pgmPercentage: { 
        name: "Процент реагента", 
        unit: "%", 
        color: "#17becf", 
        axis: "right" 
    },
    roadStatusCode: { 
        name: "Код состояния дороги", 
        unit: "", 
        color: "#7f7f7f", 
        axis: "right2" 
    },
    roadAngle: { 
        name: "Угол наклона дороги", 
        unit: "°", 
        color: "#bcbd22", 
        axis: "right2" 
    },
    freezeTemperature: { 
        name: "Температура замерзания", 
        unit: "°C", 
        color: "#9edae5", 
        axis: "left" 
    },
    distanceToSurface: { 
        name: "Расстояние до поверхности", 
        unit: "мм", 
        color: "#c5b0d5", 
        axis: "right" 
    }
};

// Количество точек данных (72 = 3 дня по 24 точки)
const NUM_POINTS = 72;

/**
 * Генератор временного ряда с вариативностью
 * @param {number} base - базовое значение
 * @param {number} amp - амплитуда колебаний
 * @param {number} cycles - количество циклов
 * @param {number} noise - уровень шума
 * @param {number} phase - начальная фаза
 * @returns {Array} массив значений для каждой временной точки
 */
function generateRichSeries(base, amp, cycles = 1.5, noise = 0.5, phase = 0) {
    return timeHours.map((h, idx) => {
        // Основной тренд с синусоидальными колебаниями
        const trend = base 
            + amp * Math.sin((h / 24) * 2 * Math.PI * cycles + phase)
            + 0.4 * amp * Math.sin((h / 8) * 2 * Math.PI); // высокочастотные колебания
        
        // Случайная составляющая
        const randomWalk = (Math.sin(idx * 0.7) * 0.3 + Math.cos(idx * 0.3) * 0.2) * amp;
        
        // Возвращаем значение с 4 знаками после запятой для теста длинных чисел
        return Number((trend + randomWalk + (Math.random() - 0.5) * noise * 0.7).toFixed(4));
    });
}

// Генерация временных меток (часы от 0 до 24)
const timeHours = Array.from({ length: NUM_POINTS }, (_, i) => (i * 24) / (NUM_POINTS - 1));

// Генерация данных для всех метрик
const chartData = timeHours.map((hour, i) => ({
    hour: hour,
    voltagePower: generateRichSeries(24.2, 2.8, 1.1, 0.2, 0)[i],
    caseTemperature: generateRichSeries(23.5, 7.5, 1.0, 0.4, 1.2)[i],
    roadTemperature: generateRichSeries(17.8, 11.0, 1.3, 0.7, 2.3)[i],
    waterHeight: generateRichSeries(3.2, 2.8, 2.2, 0.3, 0.8)[i],
    iceHeight: generateRichSeries(0.9, 2.1, 1.7, 0.2, 1.5)[i],
    snowHeight: generateRichSeries(1.5, 4.5, 0.9, 0.5, 3.0)[i],
    icePercentage: generateRichSeries(18.0, 22.0, 1.4, 2.0, 2.2)[i],
    pgmPercentage: generateRichSeries(9.5, 14.0, 1.2, 1.3, 0.5)[i],
    roadStatusCode: Math.floor(Math.abs(generateRichSeries(2.2, 1.8, 0.8, 0.2, 1.1)[i]) % 3) + 1,
    roadAngle: generateRichSeries(1.8, 1.1, 2.0, 0.15, 2.8)[i],
    freezeTemperature: generateRichSeries(-1.8, 3.5, 1.3, 0.4, 2.9)[i],
    distanceToSurface: generateRichSeries(148.0, 25.0, 1.0, 2.2, 1.4)[i]
}));