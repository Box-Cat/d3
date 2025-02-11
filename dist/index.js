"use strict";
// SVG 설정
const width = 500, height = 500;
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");
// 데이터 (그리드 형태)
const gridSize = 50;
const data = [];
for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
        data.push({ x, y, selected: false });
    }
}
// 사각형 그리기
const rects = svg.selectAll("rect.grid")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "grid")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", gridSize - 5)
    .attr("height", gridSize - 5)
    .attr("fill", "lightgray")
    .attr("stroke", "black")
    .on("click", function (event, d) {
    d.selected = !d.selected;
    d3.select(this).attr("fill", d.selected ? "orange" : "lightgray");
});
// 드래그 박스 생성
let dragBox = svg.append("rect")
    .attr("class", "selection-box")
    .attr("fill", "rgba(0, 0, 255, 0.3)")
    .attr("stroke", "blue")
    .attr("stroke-dasharray", "4")
    .attr("visibility", "hidden");
let startX = null;
let startY = null;
let togglingOff = false; // 기존 선택 해제 여부 추적
// 드래그 이벤트 추가
svg.on("mousedown", function (event) {
    startX = event.offsetX;
    startY = event.offsetY;
    if (startX === null || startY === null)
        return;
    // startX와 startY가 null이 아닐 때만 접근
    if (startX !== null && startY !== null) {
        // 처음 선택된 그리드가 켜져 있는지 확인
        rects.each(function (d) {
            if (startX >= d.x && startX <= d.x + gridSize - 5 &&
                startY >= d.y && startY <= d.y + gridSize - 5) {
                togglingOff = d.selected; // 선택 해제 모드 여부 결정
                d.selected = !d.selected;
                d3.select(this).attr("fill", d.selected ? "orange" : "lightgray");
            }
        });
        // 드래그 박스 초기화
        dragBox
            .attr("x", startX)
            .attr("y", startY)
            .attr("width", 0)
            .attr("height", 0)
            .attr("visibility", "visible");
    }
})
    .on("mousemove", function (event) {
    if (startX === null || startY === null)
        return; // null일 경우 아무 동작도 하지 않음
    let endX = event.offsetX;
    let endY = event.offsetY;
    // 드래그 박스 크기 조절
    dragBox
        .attr("x", Math.min(startX, endX))
        .attr("y", Math.min(startY, endY))
        .attr("width", Math.abs(endX - startX))
        .attr("height", Math.abs(endY - startY));
    // 드래그 박스 경계
    let x1 = Math.min(startX, endX), y1 = Math.min(startY, endY), x2 = Math.max(startX, endX), y2 = Math.max(startY, endY);
    // 박스와 겹치는 사각형 찾기 (조금이라도 걸쳐지면 선택/해제)
    rects.each(function (d) {
        let rectX1 = d.x, rectY1 = d.y;
        let rectX2 = d.x + gridSize - 5, rectY2 = d.y + gridSize - 5;
        if (!(rectX2 < x1 || rectX1 > x2 || rectY2 < y1 || rectY1 > y2)) {
            d.selected = !togglingOff;
            d3.select(this).attr("fill", d.selected ? "orange" : "lightgray");
        }
    });
})
    .on("mouseup", function () {
    dragBox.attr("visibility", "hidden");
    startX = null;
    startY = null;
    togglingOff = false;
});
