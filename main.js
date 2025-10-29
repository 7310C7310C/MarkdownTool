eruda.init();

function convertAndDownload() {
    const markdownText = document.getElementById('markdownInput').value;
    if (!markdownText.trim()) return alert("请输入 Markdown 内容！");

    const htmlContent = marked.parse(markdownText);
    const content = `
        <!DOCTYPE html>
        <html>
        <head><meta charset=\"UTF-8\"></head>
        <body>${htmlContent}</body></html>`;
    const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
    saveAs(blob, "document.doc");
}

function showMindMap() {
    const markdownText = document.getElementById('markdownInput').value;
    if (!markdownText.trim()) return alert("请输入 Markdown 内容！");

    const container = document.getElementById('mindmapContainer');
    container.innerHTML = `<pre class='markmap'>${markdownText}</pre>`;
    markmap.autoLoader.renderAll();
}
