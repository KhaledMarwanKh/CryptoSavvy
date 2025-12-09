let canvas = null;
let ctx = null;

let isDrawing = false;
let lineStartPoint = null;
let startX, startY;
let canvasSnapshot = null;

let currentTool = "freeDraw";
let currentColor = "#000000";
let currentThickness = 5;
let currentStyle = "solid";

// 3. دالة لتحديث حجم Canvas وجعله مستجيباً
let drawingHistory = [];

export function initCanvas(strokeColor, strokeStyle, strokeWidth, drawMode) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");

    console.log(canvas, ctx);

    currentTool = drawMode;
    currentColor = strokeColor;
    currentThickness = strokeWidth;
    currentStyle = strokeStyle;

    applyStyle(ctx);

    resizeCanvas();

    canvas.addEventListener('mousedown', handleMouseDown);

    canvas.addEventListener('mousemove', handleMouseMove);

    canvas.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('mouseleave', handleMouseLeave);

    window.addEventListener('resize', resizeCanvas);

    // يجب أن يتم استدعاء resizeCanvas مرة واحدة على الأقل لتعيين الحجم الأولي
    window.addEventListener('load', () => {
        resizeCanvas();
    });

}

export function deleteCanvas() {
    resetCanvas();

    canvas = null;
    ctx = null;
}

export function updateProperties(strokeColor, strokeStyle, strokeWidth, drawMode) {
    currentTool = drawMode;
    currentColor = strokeColor;
    currentThickness = strokeWidth;
    currentStyle = strokeStyle;

    applyStyle(ctx);
}

export function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lineStartPoint = null; // إعادة تعيين حالة الخط
    isDrawing = false; // إعادة تعيين حالة الرسم
    canvasSnapshot = null; // مسح أي لقطة مخزنة
    drawingHistory = []; // مسح التاريخ أيضاً
}

// 2. دالة تطبيق نمط الخط
function applyStyle(context) {
    context.strokeStyle = currentColor;
    context.fillStyle = currentColor; // لأغراض تعبئة الأشكال (يمكن تعديلها لاحقاً لعدم التعبئة)
    context.lineWidth = currentThickness;

    // تطبيق نمط الخط (عادي، منقط، متقطع)
    if (currentStyle === 'dotted') {
        context.setLineDash([1, currentThickness * 2]); // نمط منقط بسيط
    } else if (currentStyle === 'dashed') {
        context.setLineDash([currentThickness * 2, currentThickness * 4]); // نمط متقطع
    } else {
        context.setLineDash([]); // خط عادي (Solid)
    }
    context.lineCap = 'round';
    context.lineJoin = 'round';
}

function saveDrawingToHistory() {
    // تخزين بيانات الصورة الحالية كجزء من التاريخ
    // نستخدم هذا لقطات Canvas للحفاظ على الرسم عند تغيير الحجم
    drawingHistory = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
}

function restoreDrawingFromHistory() {
    if (drawingHistory.length > 0) {
        ctx.putImageData(drawingHistory[0], 0, 0);
    }
}

function resizeCanvas() {
    // حفظ اللوحة قبل تغيير الحجم
    if (canvas.width > 0 && canvas.height > 0) { // تأكد من أن اللوحة ليست فارغة
        saveDrawingToHistory();
    }

    // تعيين الأبعاد الجديدة
    const parent = canvas.parentElement;

    canvas.width = parent.clientWidth - 8;
    canvas.height = parent.clientHeight - 8;

    // إعادة تطبيق النمط
    applyStyle(ctx);

    // إعادة رسم المحتوى القديم على الحجم الجديد
    if (drawingHistory.length > 0) {
        restoreDrawingFromHistory();
    }
}

// 5. وظائف الرسم على Canvas

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    // تحويل إحداثيات الماوس إلى إحداثيات داخل Canvas
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// دالة لرسم الأشكال الهندسية (قابلة للسحب)
function drawShape(start_x, start_y, current_x, current_y, finalDraw = false) {
    applyStyle(ctx);
    ctx.beginPath();

    const width = current_x - start_x;
    const height = current_y - start_y;

    if (currentTool === 'rectangle') {
        ctx.rect(start_x, start_y, width, height);
        ctx.stroke(); // دائماً stroked فقط للمستطيل
    } else if (currentTool === 'circle') {
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);
        const centerX = start_x + width / 2;
        const centerY = start_y + height / 2;

        // لرسم بيضاوي (يمكن تعديله لدائرة مثالية بالضغط على Shift مثلاً)
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (finalDraw) {
            // إذا أردنا تعبئة الدائرة النهائية
            // ctx.fill(); 
        }
        ctx.stroke();

    } else if (currentTool === 'triangle') {
        // رسم مثلث بناءً على نقطتي البداية والنهاية
        // يمكننا جعل القاعدة من startX إلى currentX والرأس عند منتصف القاعدة وارتفاع
        // يعتمد على الفرق في Y
        const midX = start_x + width / 2;
        ctx.moveTo(midX, start_y); // الرأس
        ctx.lineTo(start_x, current_y); // الزاوية السفلية اليسرى
        ctx.lineTo(current_x, current_y); // الزاوية السفلية اليمنى
        ctx.closePath();
        if (finalDraw) {
            // ctx.fill(); 
        }
        ctx.stroke();
    }
}

function handleMouseLeave() {
    // إيقاف الرسم الحر إذا خرج الماوس من اللوحة
    if (currentTool === 'freeDraw') {
        if (isDrawing) {
            saveDrawingToHistory(); // حفظ العمل إذا كان قيد الرسم
        }
        isDrawing = false;
        ctx.closePath();
    } else if (['rectangle', 'circle', 'triangle'].includes(currentTool) && isDrawing) {
        // إذا خرج الماوس أثناء سحب شكل، قم بمسح المؤقت ولا ترسم الشكل النهائي
        isDrawing = false;
        if (canvasSnapshot) {
            ctx.putImageData(canvasSnapshot, 0, 0); // استعادة اللوحة الأصلية
        }
        canvasSnapshot = null;
    }
}

function handleMouseUp(e) {
    const pos = getMousePos(e);

    if (currentTool === 'freeDraw' && isDrawing) {
        isDrawing = false;
        ctx.closePath();
        // حفظ الرسم الحر النهائي في التاريخ
        saveDrawingToHistory();
    } else if (['rectangle', 'circle', 'triangle'].includes(currentTool) && isDrawing) {
        isDrawing = false;
        // مسح الشكل المؤقت الأخير
        ctx.putImageData(canvasSnapshot, 0, 0);
        // رسم الشكل النهائي
        drawShape(startX, startY, pos.x, pos.y, true); // true للإشارة إلى الرسم النهائي
        // حفظ الرسم النهائي في التاريخ
        saveDrawingToHistory();
        canvasSnapshot = null; // مسح اللقطة بعد الرسم النهائي
    } else {
        isDrawing = false;
        ctx.closePath();
        saveDrawingToHistory();
    }
}

function handleMouseMove(e) {
    const pos = getMousePos(e);

    if (currentTool === 'freeDraw' && isDrawing) {
        // الرسم الحر
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    } else if (['rectangle', 'circle', 'triangle'].includes(currentTool) && isDrawing) {
        // مسح الشكل المؤقت السابق وإعادة رسمه
        ctx.putImageData(canvasSnapshot, 0, 0);
        drawShape(startX, startY, pos.x, pos.y);
    } else if (currentTool === 'line' && lineStartPoint) {
        // رسم الخط المؤقت (Preview)

        // 1. مسح الخط المؤقت السابق عن طريق إعادة رسم لقطة اللوحة
        ctx.putImageData(canvasSnapshot, 0, 0);

        // 2. رسم الخط المؤقت الجديد
        applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(lineStartPoint.x, lineStartPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    } else if (currentTool === "v_line" && isDrawing) {
        let coordsX = startX;
        let startCoordsY = startY - 100, endCoordsY = startY + 100;

        ctx.beginPath()
        ctx.moveTo(coordsX, startCoordsY);
        ctx.lineTo(coordsX, endCoordsY);
        ctx.stroke();
    } else if (currentTool === "h_line" && isDrawing) {
        let coordsY = startY;
        let startCoordsX = startX - 100, endCoordsX = startX + 100;

        ctx.beginPath()
        ctx.moveTo(startCoordsX, coordsY);
        ctx.lineTo(endCoordsX, coordsY);
        ctx.stroke();
    }
}

function handleMouseDown(e) {
    const pos = getMousePos(e);

    if (currentTool === 'freeDraw') {
        isDrawing = true;
        applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    } else if (['rectangle', 'circle', 'triangle'].includes(currentTool)) {
        isDrawing = true;
        startX = pos.x;
        startY = pos.y;
        // حفظ لقطة من اللوحة قبل بدء السحب
        canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (currentTool === 'line') {
        if (!lineStartPoint) {
            // النقطة الأولى: نقطة البداية
            lineStartPoint = pos;
            // تخزين لقطة من اللوحة لبدء عرض الخط المؤقت
            canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            // النقطة الثانية: نقطة النهاية، لرسم الخط النهائي

            // إعادة رسم اللوحة قبل رسم الخط النهائي (لمسح آخر خط مؤقت)
            ctx.putImageData(canvasSnapshot, 0, 0);

            // رسم الخط النهائي
            applyStyle(ctx);
            ctx.beginPath();
            ctx.moveTo(lineStartPoint.x, lineStartPoint.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            // حفظ الرسم النهائي في التاريخ
            saveDrawingToHistory();

            // إعادة تعيين حالة الخط
            lineStartPoint = null;
            canvasSnapshot = null;
        }
    } else {
        isDrawing = true;
        startX = pos.x;
        startY = pos.y;
        canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}